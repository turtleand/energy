import { districts, type DistrictId } from '../content/districts';
import { challengeDefinitions, isChallengeComplete } from '../challenges/engine';

export const GRIDKEEPER_SAVE_KEY = 'turtleand-energy:gridkeeper:v2';
export const GRIDKEEPER_LEGACY_SAVE_KEY = 'turtleand-energy:gridkeeper:v1';
export const GRIDKEEPER_SAVE_VERSION = 2 as const;

export type ControlValue = boolean | number | string;
export type DistrictControlSet = Record<string, ControlValue>;
export type DistrictControls = Record<DistrictId, DistrictControlSet>;
export type Milestones = Record<DistrictId, string[]>;
export type ChallengeProgress = Record<DistrictId, { completedPhaseIds: string[] }>;

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
  challengeProgress: ChallengeProgress;
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
    energySpent: 0,
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

const initialChallengeProgress = (): ChallengeProgress => ({
  workshop: { completedPhaseIds: [] },
  converter: { completedPhaseIds: [] },
  wind: { completedPhaseIds: [] },
  longline: { completedPhaseIds: [] },
  lantern: { completedPhaseIds: [] },
  harbor: { completedPhaseIds: [] },
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
    challengeProgress: initialChallengeProgress(),
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
    challengeProgress: state.challengeProgress,
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
  return { ...state, activeDistrict: district };
}

export function setDistrictControl(
  state: GameState,
  district: DistrictId,
  control: string,
  value: ControlValue,
): GameState {
  if (!(control in initialControls[district])) return state;

  let milestones = state.milestones;

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
  const changed = remember(state, {
    ...state,
    settings: { ...state.settings, ...settings },
    history: state.history,
  });
  return evaluateRestoration(changed);
}

export function chargeWorkshopVane(state: GameState): GameState {
  const charge = Math.min(100, numberControl(state.controls.workshop, 'staticCharge') + 25);
  const controls: DistrictControls = {
    ...state.controls,
    workshop: {
      ...state.controls.workshop,
      staticCharge: charge,
    },
  };
  const milestones = charge >= 75
    ? addMilestone(state.milestones, 'workshop', 'static-discharge')
    : state.milestones;
  const changed = remember(state, {
    ...state,
    controls,
    milestones,
    history: state.history,
  });
  return evaluateRestoration(changed);
}

export function clearWorkshopDischarge(state: GameState): GameState {
  if (numberControl(state.controls.workshop, 'staticCharge') < 75) return state;
  return {
    ...state,
    controls: {
      ...state.controls,
      workshop: {
        ...state.controls.workshop,
        staticCharge: 0,
      },
    },
  };
}

export function runConverterDiagnostic(state: GameState): GameState {
  if (stringControl(state.controls.converter, 'adapterMatch') !== 'wrong') return state;
  const milestones = addMilestone(state.milestones, 'converter', 'mismatch-blocked');
  if (milestones === state.milestones) return state;
  const changed = remember(state, {
    ...state,
    milestones,
    history: state.history,
  });
  return evaluateRestoration(changed);
}

export function advanceTime(state: GameState, seconds: number): GameState {
  const safeSeconds = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 60);
  const lampCount = numberControl(state.controls.lantern, 'lampCount');
  const efficient = stringControl(state.controls.lantern, 'lampTech') === 'warm-led';
  const lanternPower = lampCount * (efficient ? 0.055 : 0.17);
  const accumulatedEnergy = Math.max(0, numberControl(state.controls.lantern, 'energySpent'));
  const changed = remember(state, {
    ...state,
    controls: {
      ...state.controls,
      lantern: {
        ...state.controls.lantern,
        energySpent: accumulatedEnergy + lanternPower * (safeSeconds / 4),
      },
    },
    elapsedSeconds: state.elapsedSeconds + safeSeconds,
    history: state.history,
  });
  return evaluateRestoration(changed);
}

function challengeStepCompletion(state: GameState, district: DistrictId): boolean[] {
  const completed = state.challengeProgress[district].completedPhaseIds;
  return challengeDefinitions[district].phases.map((phase) => completed.includes(phase.id));
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
  const stepCompletion = challengeStepCompletion(state, 'workshop');
  const objectiveMet = stepCompletion.every(Boolean);
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
  const mismatchSelected = !compatible;
  const diagnosticBlocked = mismatchSelected && state.milestones.converter.includes('mismatch-blocked');
  const dcStability = rectifierOn ? (smoothingOn ? 1 : 0.45) : 0;
  const power = compatible && dcStability > 0.9 ? 0.82 : 0;
  const stepCompletion = challengeStepCompletion(state, 'converter');
  const objectiveMet = stepCompletion.every(Boolean);
  const objectiveProgress = stepCompletion.filter(Boolean).length / stepCompletion.length;

  return {
    district: 'converter',
    caption: diagnosticBlocked
      ? 'The diagnostic bench blocks this mismatch. Nothing is energized.'
      : mismatchSelected
        ? 'A mismatched module is selected. Run the diagnostic before attempting to energize the model radio.'
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
  const stepCompletion = challengeStepCompletion(state, 'wind');
  const objectiveMet = stepCompletion.every(Boolean);
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
  const stepCompletion = challengeStepCompletion(state, 'longline');
  const objectiveMet = stepCompletion.every(Boolean);
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
  const energy = Math.max(0, numberControl(controls, 'energySpent'));
  const cost = energy * 0.18;
  const stepCompletion = challengeStepCompletion(state, 'lantern');
  const objectiveMet = stepCompletion.every(Boolean);
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
  const stepCompletion = challengeStepCompletion(state, 'harbor');
  const objectiveMet = stepCompletion.every(Boolean);
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

function checkpointControlPatch(district: DistrictId, phaseId: string): DistrictControlSet {
  const patches: Record<DistrictId, Record<string, DistrictControlSet>> = {
    workshop: {
      'build-loop': { loopClosed: true },
      'tune-flow': { voltage: 9, resistance: 4 },
      'spark-reset': { staticCharge: 0 },
    },
    converter: {
      'shape-wave': { rectifierOn: true, smoothingOn: true },
      'match-label': { adapterMatch: 'correct' },
      'negotiate-output': {},
    },
    wind: {
      'change-flux': { windStrength: 0.85, fieldStrength: 0.8 },
      'close-loop': { loopClosed: true },
      'balance-load': { loadDemand: 0.55 },
    },
    longline: {
      'compare-line': { transmissionVoltage: 'high' },
      'build-transformers': { transformerOn: true },
      'deliver-safely': { demand: 0.75 },
    },
    lantern: {
      'equal-energy': {},
      'schedule-market': { lampCount: 6, lampTech: 'warm-led' },
      'replay-evening': { energySpent: 0.8 },
    },
    harbor: {
      'layer-paths': { material: 'copper', groundProtectionOn: true },
      'diagnose-faults': { insulationState: 'sound' },
      'balance-feeder': { homeLoad: 0.65, feederCapacity: 0.9 },
    },
  };
  return patches[district][phaseId] ?? {};
}

export function completeChallengePhase(
  state: GameState,
  district: DistrictId,
  phaseId: string,
): GameState {
  if (!isDistrictUnlocked(state, district) || state.activeDistrict !== district) return state;
  const completed = state.challengeProgress[district].completedPhaseIds;
  const expected = challengeDefinitions[district].phases[completed.length];
  if (!expected || expected.id !== phaseId || completed.includes(phaseId)) return state;

  const patch = checkpointControlPatch(district, phaseId);
  let milestones = state.milestones;
  if (phaseId === 'spark-reset') milestones = addMilestone(milestones, 'workshop', 'static-discharge');
  if (phaseId === 'match-label') milestones = addMilestone(milestones, 'converter', 'mismatch-blocked');
  if (phaseId === 'diagnose-faults') milestones = addMilestone(milestones, 'harbor', 'protection-trip');

  const changed = remember(state, {
    ...state,
    controls: {
      ...state.controls,
      [district]: { ...state.controls[district], ...patch },
    },
    elapsedSeconds: phaseId === 'replay-evening' ? Math.max(3, state.elapsedSeconds) : state.elapsedSeconds,
    milestones,
    challengeProgress: {
      ...state.challengeProgress,
      [district]: { completedPhaseIds: [...completed, phaseId] },
    },
    history: state.history,
  });
  return evaluateRestoration(changed);
}

function evaluateRestoration(state: GameState): GameState {
  const district = state.activeDistrict;
  if (!isDistrictUnlocked(state, district) || state.restored.includes(district)) return state;
  if (!isChallengeComplete(state.challengeProgress[district].completedPhaseIds, district)) return state;

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
    const parsed = JSON.parse(raw) as Partial<Omit<GameSnapshot, 'version'>> & { version?: number };
    if (parsed.version !== GRIDKEEPER_SAVE_VERSION && parsed.version !== 1) return createInitialGameState();
    const legacy = parsed.version === 1;
    const fresh = createInitialGameState();
    const activeDistrictCandidate = DISTRICT_IDS.includes(parsed.activeDistrict as DistrictId)
      ? (parsed.activeDistrict as DistrictId)
      : fresh.activeDistrict;
    const restoredSet = new Set(
      Array.isArray(parsed.restored)
        ? parsed.restored.filter((district): district is DistrictId => DISTRICT_IDS.includes(district as DistrictId))
        : [],
    );
    const restored: DistrictId[] = [];
    for (const district of DISTRICT_IDS) {
      if (!restoredSet.has(district)) break;
      restored.push(district);
    }
    const elapsedSeconds =
      typeof parsed.elapsedSeconds === 'number' && Number.isFinite(parsed.elapsedSeconds)
        ? clamp(parsed.elapsedSeconds, 0, 86_400)
        : 0;
    const controls = Object.fromEntries(
      DISTRICT_IDS.map((district) => [district, sanitizeControlSet(district, parsed.controls?.[district])]),
    ) as DistrictControls;
    const parsedLanternControls = parsed.controls?.lantern;
    if (
      !parsedLanternControls ||
      typeof parsedLanternControls !== 'object' ||
      typeof parsedLanternControls.energySpent !== 'number'
    ) {
      const lampCount = numberControl(controls.lantern, 'lampCount');
      const efficient = stringControl(controls.lantern, 'lampTech') === 'warm-led';
      controls.lantern.energySpent = lampCount * (efficient ? 0.055 : 0.17) * (elapsedSeconds / 4);
    }
    const milestones = Object.fromEntries(
      DISTRICT_IDS.map((district) => [
        district,
        Array.isArray(parsed.milestones?.[district])
          ? parsed.milestones[district].filter((item): item is string => typeof item === 'string').slice(0, 20)
          : [],
      ]),
    ) as Milestones;
    const challengeProgress = Object.fromEntries(
      DISTRICT_IDS.map((district) => {
        if (legacy) {
          return [
            district,
            {
              completedPhaseIds: restored.includes(district)
                ? challengeDefinitions[district].phases.map((phase) => phase.id)
                : [],
            },
          ];
        }
        const candidate = parsed.challengeProgress?.[district]?.completedPhaseIds;
        const allowed = challengeDefinitions[district].phases.map((phase) => phase.id);
        const completedPhaseIds: string[] = [];
        if (Array.isArray(candidate)) {
          for (const [index, phaseId] of allowed.entries()) {
            if (candidate[index] !== phaseId) break;
            completedPhaseIds.push(phaseId);
          }
        }
        return [district, { completedPhaseIds }];
      }),
    ) as ChallengeProgress;
    const restoredFromProgress: DistrictId[] = [];
    for (const district of DISTRICT_IDS) {
      if (!isChallengeComplete(challengeProgress[district].completedPhaseIds, district)) break;
      restoredFromProgress.push(district);
    }
    const validatedRestored = legacy ? restored : restoredFromProgress;
    const activeDistrict = DISTRICT_IDS.indexOf(activeDistrictCandidate) <= validatedRestored.length
      ? activeDistrictCandidate
      : DISTRICT_IDS[Math.min(validatedRestored.length, DISTRICT_IDS.length - 1)];

    return {
      ...fresh,
      activeDistrict,
      controls,
      elapsedSeconds,
      milestones,
      challengeProgress,
      restored: validatedRestored,
      sandboxUnlocked: validatedRestored.length === DISTRICT_IDS.length,
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
