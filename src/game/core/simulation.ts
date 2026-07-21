import { districts, type DistrictId } from '../content/districts';

export const GRIDKEEPER_SAVE_KEY = 'turtleand-energy:gridkeeper:v1';
export const GRIDKEEPER_SAVE_VERSION = 1 as const;

export type ControlValue = boolean | number | string;
export type DistrictControlSet = Record<string, ControlValue>;
export type DistrictControls = Record<DistrictId, DistrictControlSet>;
export type Milestones = Record<DistrictId, string[]>;

export interface GameSettings {
  assisted: boolean;
  muted: boolean;
  reducedEffects: boolean;
  reducedMotion: boolean;
}

interface GameSnapshot {
  version: typeof GRIDKEEPER_SAVE_VERSION;
  activeDistrict: DistrictId;
  controls: DistrictControls;
  elapsedSeconds: number;
  milestones: Milestones;
  restored: DistrictId[];
  sandboxUnlocked: boolean;
  settings: GameSettings;
}

export interface GameState extends GameSnapshot {
  history: GameSnapshot[];
}

export interface DistrictReadout {
  district: DistrictId;
  caption: string;
  status: 'waiting' | 'flowing' | 'strained' | 'protected' | 'restored';
  metrics: Record<string, number>;
  flags: Record<string, boolean>;
  objectiveMet: boolean;
  objectiveProgress: number;
  stepCompletion: boolean[];
  lens: {
    direction: 'none' | 'one-way' | 'alternating';
    loopClosed: boolean;
    pulseDensity: number;
    energyTransfer: number;
    heat: number;
    leakage: number;
    voltage: number;
  };
}

const DISTRICT_IDS = districts.map((district) => district.id);
const MAX_HISTORY = 32;

export const initialControls: DistrictControls = {
  workshop: {
    loopClosed: false,
    voltage: 5,
    resistance: 8,
    staticCharge: 0,
  },
  converter: {
    rectifierOn: false,
    smoothingOn: false,
    adapterMatch: 'wrong',
  },
  wind: {
    loopClosed: false,
    windStrength: 0.35,
    fieldStrength: 0.45,
    loadDemand: 0.55,
  },
  longline: {
    transmissionVoltage: 'low',
    demand: 0.75,
    transformerOn: false,
  },
  lantern: {
    lampCount: 5,
    lampTech: 'filament',
  },
  harbor: {
    material: 'copper',
    groundProtectionOn: false,
    insulationState: 'damaged',
    homeLoad: 0.9,
    feederCapacity: 0.65,
  },
};

const initialMilestones = (): Milestones => ({
  workshop: [],
  converter: [],
  wind: [],
  longline: [],
  lantern: [],
  harbor: [],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const numberControl = (controls: DistrictControlSet, key: string) => Number(controls[key] ?? 0);
const boolControl = (controls: DistrictControlSet, key: string) => Boolean(controls[key]);
const stringControl = (controls: DistrictControlSet, key: string) => String(controls[key] ?? '');

export function createInitialGameState(settings: Partial<GameSettings> = {}): GameState {
  return {
    version: GRIDKEEPER_SAVE_VERSION,
    activeDistrict: 'workshop',
    controls: clone(initialControls),
    elapsedSeconds: 0,
    milestones: initialMilestones(),
    restored: [],
    sandboxUnlocked: false,
    settings: {
      assisted: false,
      muted: false,
      reducedEffects: false,
      reducedMotion: false,
      ...settings,
    },
    history: [],
  };
}

function snapshot(state: GameState): GameSnapshot {
  return clone({
    version: state.version,
    activeDistrict: state.activeDistrict,
    controls: state.controls,
    elapsedSeconds: state.elapsedSeconds,
    milestones: state.milestones,
    restored: state.restored,
    sandboxUnlocked: state.sandboxUnlocked,
    settings: state.settings,
  });
}

function remember(previous: GameState, next: GameState): GameState {
  return {
    ...next,
    history: [...previous.history, snapshot(previous)].slice(-MAX_HISTORY),
  };
}

function addMilestone(milestones: Milestones, district: DistrictId, milestone: string): Milestones {
  if (milestones[district].includes(milestone)) return milestones;
  return {
    ...milestones,
    [district]: [...milestones[district], milestone],
  };
}

export function isDistrictUnlocked(state: GameState, district: DistrictId): boolean {
  if (state.sandboxUnlocked) return true;
  const index = DISTRICT_IDS.indexOf(district);
  return index === 0 || state.restored.includes(DISTRICT_IDS[index - 1]);
}

export function visitDistrict(state: GameState, district: DistrictId): GameState {
  if (!isDistrictUnlocked(state, district) || district === state.activeDistrict) return state;
  return remember(state, { ...state, activeDistrict: district, history: state.history });
}

export function setDistrictControl(
  state: GameState,
  district: DistrictId,
  control: string,
  value: ControlValue,
): GameState {
  if (!(control in initialControls[district])) return state;

  let milestones = clone(state.milestones);
  if (district === 'workshop' && control === 'staticCharge' && Number(value) >= 75) {
    milestones = addMilestone(milestones, district, 'static-discharge');
  }
  if (district === 'converter' && control === 'adapterMatch' && value === 'wrong') {
    milestones = addMilestone(milestones, district, 'mismatch-blocked');
  }

  const controls: DistrictControls = {
    ...state.controls,
    [district]: {
      ...state.controls[district],
      [control]: value,
    },
  };

  if (
    district === 'harbor' &&
    stringControl(controls.harbor, 'insulationState') === 'damaged' &&
    boolControl(controls.harbor, 'groundProtectionOn')
  ) {
    milestones = addMilestone(milestones, district, 'protection-trip');
  }

  const changed = remember(state, {
    ...state,
    controls,
    milestones,
    history: state.history,
  });
  return evaluateRestoration(changed);
}

export function setGameSettings(state: GameState, settings: Partial<GameSettings>): GameState {
  return remember(state, {
    ...state,
    settings: { ...state.settings, ...settings },
    history: state.history,
  });
}

export function advanceTime(state: GameState, seconds: number): GameState {
  const safeSeconds = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 60);
  const changed = remember(state, {
    ...state,
    elapsedSeconds: state.elapsedSeconds + safeSeconds,
    history: state.history,
  });
  return evaluateRestoration(changed);
}

function workshopReadout(state: GameState): DistrictReadout {
  const controls = state.controls.workshop;
  const loopClosed = boolControl(controls, 'loopClosed');
  const voltage = numberControl(controls, 'voltage');
  const resistance = Math.max(1, numberControl(controls, 'resistance'));
  const current = loopClosed ? voltage / resistance : 0;
  const power = voltage * current;
  const heat = current * current * resistance * 0.035;
  const staticSpark = numberControl(controls, 'staticCharge') >= 75;
  const objectiveMet =
    loopClosed &&
    voltage >= (state.settings.assisted ? 7 : 8) &&
    resistance <= (state.settings.assisted ? 6 : 5) &&
    state.milestones.workshop.includes('static-discharge');
  const stepCompletion = [
    loopClosed,
    voltage >= (state.settings.assisted ? 7 : 8) && resistance <= (state.settings.assisted ? 6 : 5),
    state.milestones.workshop.includes('static-discharge'),
  ];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'workshop',
    caption: staticSpark
      ? 'The storm vane releases one brief spark. The lamp loop keeps flowing only because its path stays closed.'
      : loopClosed
        ? `The closed loop carries ${current.toFixed(1)} flow units. More push or less resistance makes the lamp brighter.`
        : 'The path is open. Electrical push exists, but maintained current has nowhere to circulate.',
    status: objectiveMet ? 'restored' : heat > 1.2 ? 'strained' : loopClosed ? 'flowing' : 'waiting',
    metrics: {
      voltage,
      current,
      currentRate: current,
      power,
      heat,
      energy: power * (state.elapsedSeconds / 10),
    },
    flags: { loopClosed, staticSpark, maintainedStaticCurrent: false },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: loopClosed ? 'one-way' : 'none',
      loopClosed,
      pulseDensity: clamp(current / 3),
      energyTransfer: clamp(power / 28),
      heat: clamp(heat / 1.5),
      leakage: 0,
      voltage: clamp(voltage / 12),
    },
  };
}

function converterReadout(state: GameState): DistrictReadout {
  const controls = state.controls.converter;
  const rectifierOn = boolControl(controls, 'rectifierOn');
  const smoothingOn = boolControl(controls, 'smoothingOn');
  const compatible = stringControl(controls, 'adapterMatch') === 'correct';
  const diagnosticBlocked = !compatible;
  const dcStability = rectifierOn ? (smoothingOn ? 1 : 0.45) : 0;
  const power = compatible && dcStability > 0.9 ? 0.82 : 0;
  const objectiveMet =
    state.milestones.converter.includes('mismatch-blocked') && rectifierOn && smoothingOn && compatible;
  const stepCompletion = [state.milestones.converter.includes('mismatch-blocked'), rectifierOn, smoothingOn && compatible];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'converter',
    caption: diagnosticBlocked
      ? 'The diagnostic bench blocks this mismatch. Nothing is energized.'
      : smoothingOn && rectifierOn
        ? 'Reversing AC has passed through rectification and smoothing. The radio now receives steady, compatible DC.'
        : rectifierOn
          ? 'The wave now moves one way, but its uneven pulses still need smoothing.'
          : 'Dock AC reverses direction. The radio needs compatible, steady DC.',
    status: objectiveMet ? 'restored' : power > 0 ? 'flowing' : diagnosticBlocked ? 'protected' : 'waiting',
    metrics: {
      voltage: compatible ? 0.65 : 0,
      current: power > 0 ? 0.64 : 0,
      currentRate: power > 0 ? 0.64 : 0,
      power,
      heat: rectifierOn && !smoothingOn ? 0.18 : 0.04,
      dcStability,
    },
    flags: { diagnosticBlocked, rectifierOn, smoothingOn, compatible },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: rectifierOn ? 'one-way' : 'alternating',
      loopClosed: compatible,
      pulseDensity: power,
      energyTransfer: power,
      heat: rectifierOn && !smoothingOn ? 0.18 : 0.04,
      leakage: 0,
      voltage: compatible ? 0.65 : 0.75,
    },
  };
}

function windReadout(state: GameState): DistrictReadout {
  const controls = state.controls.wind;
  const loopClosed = boolControl(controls, 'loopClosed');
  const windStrength = numberControl(controls, 'windStrength');
  const fieldStrength = numberControl(controls, 'fieldStrength');
  const loadDemand = numberControl(controls, 'loadDemand');
  const changingFlux = windStrength > 0.1 && fieldStrength > 0.1;
  const induction = changingFlux ? windStrength * fieldStrength : 0;
  const power = loopClosed ? induction * 1.4 : 0;
  const strain = loopClosed ? clamp(loadDemand - induction * 0.5) : 0;
  const objectiveMet = loopClosed && power >= (state.settings.assisted ? 0.55 : 0.72) && strain < 0.7;
  const stepCompletion = [
    loopClosed,
    windStrength >= (state.settings.assisted ? 0.65 : 0.75) && fieldStrength >= (state.settings.assisted ? 0.6 : 0.7),
    loopClosed && strain < 0.7 && power >= (state.settings.assisted ? 0.55 : 0.72),
  ];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'wind',
    caption: !loopClosed
      ? 'The turbine turns, but the open electrical path delivers no current to the ridge load.'
      : strain > 0.72
        ? 'The connected load pushes back hard. Raise generation or ease demand.'
        : 'Changing magnetic flux creates electrical push. The connected load adds mechanical resistance.',
    status: objectiveMet ? 'restored' : strain > 0.72 ? 'strained' : power > 0 ? 'flowing' : 'waiting',
    metrics: {
      voltage: induction,
      current: loopClosed ? power / Math.max(0.35, loadDemand) : 0,
      currentRate: loopClosed ? power / Math.max(0.35, loadDemand) : 0,
      power,
      heat: strain * 0.25,
      strain,
      changingFlux: induction,
    },
    flags: { loopClosed, changingFlux },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: loopClosed ? 'alternating' : 'none',
      loopClosed,
      pulseDensity: clamp(power),
      energyTransfer: clamp(power),
      heat: strain * 0.25,
      leakage: 0,
      voltage: clamp(induction),
    },
  };
}

function longlineReadout(state: GameState): DistrictReadout {
  const controls = state.controls.longline;
  const highVoltage = stringControl(controls, 'transmissionVoltage') === 'high';
  const transformerOn = boolControl(controls, 'transformerOn');
  const demand = numberControl(controls, 'demand');
  const voltage = highVoltage ? 4 : 1;
  const current = demand / voltage;
  const heat = current * current * 0.55;
  const delivered = clamp(demand - heat * 0.55);
  const objectiveMet = highVoltage && transformerOn && heat < 0.08;
  const stepCompletion = [highVoltage, highVoltage && heat < 0.08, transformerOn];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'longline',
    caption: highVoltage
      ? transformerOn
        ? 'The line carries the same delivery with less current and less heat, then the town transformer steps the voltage down.'
        : 'Line current and heating are low, but the high transmission voltage must be stepped down before the town.'
      : 'Low transmission voltage demands more current, so the long line warms and wastes more energy.',
    status: objectiveMet ? 'restored' : heat > 0.2 ? 'strained' : 'flowing',
    metrics: {
      voltage,
      current,
      currentRate: current,
      power: delivered,
      heat,
      delivered,
    },
    flags: { highVoltage, transformerOn },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: 'alternating',
      loopClosed: true,
      pulseDensity: clamp(current),
      energyTransfer: delivered,
      heat: clamp(heat / 0.35),
      leakage: 0,
      voltage: highVoltage ? 1 : 0.25,
    },
  };
}

function lanternReadout(state: GameState): DistrictReadout {
  const controls = state.controls.lantern;
  const lampCount = numberControl(controls, 'lampCount');
  const efficient = stringControl(controls, 'lampTech') === 'warm-led';
  const power = lampCount * (efficient ? 0.055 : 0.17);
  const energy = power * (state.elapsedSeconds / 4);
  const cost = energy * 0.18;
  const objectiveMet = lampCount >= 5 && efficient && state.elapsedSeconds >= 4 && cost <= 0.5;
  const stepCompletion = [lampCount >= 5, efficient, state.elapsedSeconds >= 4 && cost <= 0.5];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'lantern',
    caption: state.elapsedSeconds < 4
      ? `The market draws ${power.toFixed(2)} power units now. Run the evening clock to see energy accumulate.`
      : efficient
        ? 'The market stays bright while the efficient lamps leave a shorter energy and cost trail.'
        : 'The lamps are bright, but their higher power draw makes energy and cost accumulate faster.',
    status: objectiveMet ? 'restored' : cost > 0.5 ? 'strained' : power > 0 ? 'flowing' : 'waiting',
    metrics: {
      voltage: 0.7,
      current: power / 0.7,
      currentRate: power / 0.7,
      power,
      heat: efficient ? power * 0.18 : power * 0.7,
      energy,
      cost,
      time: state.elapsedSeconds,
    },
    flags: { efficient, eveningComplete: state.elapsedSeconds >= 4 },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: 'alternating',
      loopClosed: lampCount > 0,
      pulseDensity: clamp(power),
      energyTransfer: clamp(energy / 1.4),
      heat: clamp(efficient ? power * 0.18 : power * 0.7),
      leakage: 0,
      voltage: 0.7,
    },
  };
}

function harborReadout(state: GameState): DistrictReadout {
  const controls = state.controls.harbor;
  const conductive = stringControl(controls, 'material') === 'copper';
  const insulationSound = stringControl(controls, 'insulationState') === 'sound';
  const groundProtectionOn = boolControl(controls, 'groundProtectionOn');
  const homeLoad = numberControl(controls, 'homeLoad');
  const feederCapacity = numberControl(controls, 'feederCapacity');
  const leakage = insulationSound ? 0.01 : 0.55;
  const protectionTripped = groundProtectionOn && !insulationSound;
  const overloadTripped = homeLoad > feederCapacity;
  const feederMargin = feederCapacity - homeLoad;
  const power = conductive && !protectionTripped && !overloadTripped ? homeLoad : 0;
  const objectiveMet =
    state.milestones.harbor.includes('protection-trip') &&
    conductive &&
    insulationSound &&
    groundProtectionOn &&
    feederMargin >= (state.settings.assisted ? 0.1 : 0.18);
  const stepCompletion = [
    state.milestones.harbor.includes('protection-trip'),
    conductive && insulationSound && groundProtectionOn,
    feederMargin >= (state.settings.assisted ? 0.1 : 0.18),
  ];
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'harbor',
    caption: protectionTripped
      ? 'Protection detects the model leakage path and de-energizes the affected branch. Repair the insulation before resetting service.'
      : overloadTripped
        ? 'Combined home demand exceeds the feeder setting, so the neighborhood branch is protected from overload.'
        : power > 0
          ? `The feeder serves ${homeLoad.toFixed(2)} load units with ${feederMargin.toFixed(2)} units of margin.`
          : 'The selected path does not conduct useful current to the neighborhood.',
    status: objectiveMet ? 'restored' : protectionTripped || overloadTripped ? 'protected' : power > 0 ? 'flowing' : 'waiting',
    metrics: {
      voltage: power > 0 ? 0.72 : 0,
      current: power,
      currentRate: power,
      power,
      heat: overloadTripped ? 0.75 : homeLoad * 0.16,
      leakage,
      feederMargin,
      feederLoad: homeLoad,
      homeLoad,
    },
    flags: {
      conductive,
      insulationSound,
      groundProtectionOn,
      protectionTripped,
      overloadTripped,
    },
    objectiveMet,
    objectiveProgress,
    stepCompletion,
    lens: {
      direction: power > 0 ? 'alternating' : 'none',
      loopClosed: power > 0,
      pulseDensity: clamp(homeLoad),
      energyTransfer: power,
      heat: overloadTripped ? 0.75 : homeLoad * 0.16,
      leakage,
      voltage: power > 0 ? 0.72 : 0,
    },
  };
}

export function getDistrictReadout(state: GameState, district: DistrictId): DistrictReadout {
  switch (district) {
    case 'workshop':
      return workshopReadout(state);
    case 'converter':
      return converterReadout(state);
    case 'wind':
      return windReadout(state);
    case 'longline':
      return longlineReadout(state);
    case 'lantern':
      return lanternReadout(state);
    case 'harbor':
      return harborReadout(state);
  }
}

function evaluateRestoration(state: GameState): GameState {
  const district = state.activeDistrict;
  if (!isDistrictUnlocked(state, district) || state.restored.includes(district)) return state;
  if (!getDistrictReadout(state, district).objectiveMet) return state;

  const restored = [...state.restored, district];
  return {
    ...state,
    restored,
    sandboxUnlocked: restored.length === districts.length,
  };
}

export function rewindGameState(state: GameState): GameState {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return {
    ...clone(previous),
    history: state.history.slice(0, -1),
  };
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(snapshot(state));
}

function sanitizeControlSet(district: DistrictId, value: unknown): DistrictControlSet {
  const defaults = initialControls[district];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return clone(defaults);
  const candidate = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => {
      const incoming = candidate[key];
      return [key, typeof incoming === typeof fallback ? incoming : fallback];
    }),
  );
}

export function parseSavedGameState(raw: string | null): GameState {
  if (!raw) return createInitialGameState();
  try {
    const parsed = JSON.parse(raw) as Partial<GameSnapshot>;
    if (parsed.version !== GRIDKEEPER_SAVE_VERSION) return createInitialGameState();
    const fresh = createInitialGameState();
    const activeDistrict = DISTRICT_IDS.includes(parsed.activeDistrict as DistrictId)
      ? (parsed.activeDistrict as DistrictId)
      : fresh.activeDistrict;
    const restoredSet = new Set(
      Array.isArray(parsed.restored)
        ? parsed.restored.filter((district): district is DistrictId => DISTRICT_IDS.includes(district as DistrictId))
        : [],
    );
    const restored = DISTRICT_IDS.filter((district) => restoredSet.has(district));
    const controls = Object.fromEntries(
      DISTRICT_IDS.map((district) => [district, sanitizeControlSet(district, parsed.controls?.[district])]),
    ) as DistrictControls;
    const milestones = Object.fromEntries(
      DISTRICT_IDS.map((district) => [
        district,
        Array.isArray(parsed.milestones?.[district])
          ? parsed.milestones[district].filter((item): item is string => typeof item === 'string').slice(0, 20)
          : [],
      ]),
    ) as Milestones;

    return {
      ...fresh,
      activeDistrict,
      controls,
      elapsedSeconds:
        typeof parsed.elapsedSeconds === 'number' && Number.isFinite(parsed.elapsedSeconds)
          ? clamp(parsed.elapsedSeconds, 0, 86_400)
          : 0,
      milestones,
      restored,
      sandboxUnlocked: restored.length === DISTRICT_IDS.length,
      settings: {
        assisted:
          typeof parsed.settings?.assisted === 'boolean' ? parsed.settings.assisted : fresh.settings.assisted,
        muted: typeof parsed.settings?.muted === 'boolean' ? parsed.settings.muted : fresh.settings.muted,
        reducedEffects:
          typeof parsed.settings?.reducedEffects === 'boolean'
            ? parsed.settings.reducedEffects
            : fresh.settings.reducedEffects,
        reducedMotion:
          typeof parsed.settings?.reducedMotion === 'boolean'
            ? parsed.settings.reducedMotion
            : fresh.settings.reducedMotion,
      },
    };
  } catch {
    return createInitialGameState();
  }
}
