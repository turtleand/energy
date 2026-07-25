import { missionById, missionIds, missions, type MissionId } from '../content/campaign';

export const CIRCUIT_RIDERS_SAVE_KEY = 'turtleand-energy:circuit-riders:v2';
export const CIRCUIT_RIDERS_SAVE_VERSION = 2 as const;

export type ControlValue = boolean | number | string;
export type MissionControls = Record<string, ControlValue>;

export interface InputBindings {
  left: string;
  right: string;
  up: string;
  down: string;
  action: string;
  pause: string;
  lens: string;
}

export interface CampaignSettings {
  mode: 'action' | 'planning';
  muted: boolean;
  soundVolume: number;
  reducedEffects: boolean;
  reducedMotion: boolean;
  slowMotion: boolean;
  bindings: InputBindings;
}

export interface MissionState {
  controls: MissionControls;
  elapsedSeconds: number;
  lastEvent: string | null;
  milestones: string[];
}

export type MissionStates = Record<MissionId, MissionState>;

interface CampaignSnapshot {
  version: typeof CIRCUIT_RIDERS_SAVE_VERSION;
  activeMission: MissionId;
  campaignComplete: boolean;
  completed: MissionId[];
  missions: MissionStates;
  sandboxUnlocked: boolean;
  settings: CampaignSettings;
}

export interface CampaignState extends CampaignSnapshot {
  history: CampaignSnapshot[];
}

export interface MissionReadout {
  mission: MissionId;
  caption: string;
  status: 'waiting' | 'flowing' | 'strained' | 'protected' | 'restored';
  metrics: Record<string, number>;
  flags: Record<string, boolean>;
  objectiveMet: boolean;
  objectiveProgress: number;
  stepCompletion: boolean[];
  flow: {
    direction: 'none' | 'one-way' | 'alternating';
    loopClosed: boolean;
    density: number;
    fieldAmplitude: number;
    power: number;
    energy: number;
    heat: number;
    leakage: number;
  };
}

const MAX_HISTORY = 48;

const defaultBindings: InputBindings = {
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyW',
  down: 'KeyS',
  action: 'Space',
  pause: 'KeyP',
  lens: 'KeyF',
};

export const initialMissionControls: Record<MissionId, MissionControls> = {
  'loopworks-01': {
    sourceOn: false,
    switchClosed: false,
    returnClosed: false,
    voltage: 6,
    resistance: 6,
  },
  'loopworks-02': {
    chargeLevel: 0,
  },
  'loopworks-03': {
    switchClosed: false,
    route: 'broken',
    returnClosed: true,
  },
  'loopworks-04': {
    switchClosed: false,
    voltage: 6,
    resistance: 10,
  },
  'converter-05': {
    phaseTrim: 0.2,
    rectifierOn: false,
    smoothingOn: false,
    regulatorOn: false,
  },
  'converter-06': {
    adapter: 'wrong-voltage',
  },
  'converter-07': {
    loadCount: 4,
    lampTech: 'filament',
  },
  'gridfall-08': {
    material: 'insulator',
    path: 'leak',
    protectionArmed: false,
  },
  'gridfall-09': {
    loopClosed: false,
    motion: 0.4,
    field: 0.4,
    load: 0.6,
  },
  'gridfall-10': {
    lineVoltage: 'low',
    demand: 0.8,
    transformerOn: false,
  },
  'gridfall-11': {
    fault: 'none',
    breakerOn: true,
    gfciOn: true,
  },
  'gridfall-12': {
    generation: 0.6,
    transmissionHigh: false,
    feederCapacity: 0.7,
    serviceDemand: 0.6,
    priorityRoute: 'homes',
    protectionArmed: false,
  },
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const numberControl = (state: MissionState, key: string) => Number(state.controls[key] ?? 0);
const booleanControl = (state: MissionState, key: string) => Boolean(state.controls[key]);
const stringControl = (state: MissionState, key: string) => String(state.controls[key] ?? '');
const hasMilestone = (state: MissionState, milestone: string) => state.milestones.includes(milestone);

function createInitialMissionStates(): MissionStates {
  return Object.fromEntries(
    missionIds.map((mission) => [
      mission,
      {
        controls: clone(initialMissionControls[mission]),
        elapsedSeconds: 0,
        lastEvent: null,
        milestones: [],
      },
    ]),
  ) as MissionStates;
}

export function createInitialCampaignState(
  settings: Partial<Omit<CampaignSettings, 'bindings'>> & {
    bindings?: Partial<InputBindings>;
  } = {},
): CampaignState {
  return {
    version: CIRCUIT_RIDERS_SAVE_VERSION,
    activeMission: 'loopworks-01',
    campaignComplete: false,
    completed: [],
    missions: createInitialMissionStates(),
    sandboxUnlocked: false,
    settings: {
      mode: 'action',
      muted: false,
      soundVolume: 0.7,
      reducedEffects: false,
      reducedMotion: false,
      slowMotion: false,
      ...settings,
      bindings: {
        ...defaultBindings,
        ...settings.bindings,
      },
    },
    history: [],
  };
}

function snapshot(state: CampaignState): CampaignSnapshot {
  return clone({
    version: state.version,
    activeMission: state.activeMission,
    campaignComplete: state.campaignComplete,
    completed: state.completed,
    missions: state.missions,
    sandboxUnlocked: state.sandboxUnlocked,
    settings: state.settings,
  });
}

function remember(previous: CampaignState, next: CampaignState): CampaignState {
  return {
    ...next,
    history: [...previous.history, snapshot(previous)].slice(-MAX_HISTORY),
  };
}

function addMilestone(state: MissionState, milestone: string): MissionState {
  if (state.milestones.includes(milestone)) return state;
  return {
    ...state,
    milestones: [...state.milestones, milestone],
  };
}

function buildReadout(
  mission: MissionId,
  input: Omit<MissionReadout, 'mission' | 'objectiveProgress'>,
): MissionReadout {
  return {
    mission,
    ...input,
    objectiveProgress:
      input.stepCompletion.filter(Boolean).length / Math.max(1, input.stepCompletion.length),
  };
}

function loopworks01(state: MissionState): MissionReadout {
  const sourceOn = booleanControl(state, 'sourceOn');
  const switchClosed = booleanControl(state, 'switchClosed');
  const returnClosed = booleanControl(state, 'returnClosed');
  const voltage = numberControl(state, 'voltage');
  const resistance = Math.max(1, numberControl(state, 'resistance'));
  const loopClosed = sourceOn && switchClosed && returnClosed;
  const current = loopClosed ? voltage / resistance : 0;
  const power = voltage * current;
  const energy = power * (state.elapsedSeconds / 10);
  const objectiveMet = loopClosed && current >= 0.8;
  const stepCompletion = [sourceOn, switchClosed, returnClosed];

  return buildReadout('loopworks-01', {
    caption: !sourceOn
      ? 'The source is asleep, so the rail has no electrical lift.'
      : !switchClosed
        ? 'The source establishes lift, but the open switch interrupts maintained flow.'
        : !returnClosed
          ? 'The outward rail reaches the load, but current stops because the return is missing.'
          : 'Charge already in the rail circulates around the complete loop while the source transfers energy to the light.',
    status: objectiveMet ? 'restored' : loopClosed ? 'flowing' : 'waiting',
    metrics: {
      voltage,
      current,
      power,
      energy,
      heat: current * current * resistance * 0.025,
      chargeMarkers: 18,
    },
    flags: { sourceOn, switchClosed, returnClosed, loopClosed },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: loopClosed ? 'one-way' : 'none',
      loopClosed,
      density: clamp(current / 2),
      fieldAmplitude: sourceOn ? clamp(voltage / 12) : 0,
      power: clamp(power / 12),
      energy: clamp(energy / 20),
      heat: clamp(current * current * resistance * 0.025),
      leakage: 0,
    },
  });
}

function loopworks02(state: MissionState): MissionReadout {
  const charge = numberControl(state, 'chargeLevel');
  const staticDischarge = state.lastEvent === 'static-discharge';
  const completed = hasMilestone(state, 'static-discharge');
  const stepCompletion = [charge >= 25 || completed, charge >= 50 || completed, completed];

  return buildReadout('loopworks-02', {
    caption: staticDischarge
      ? 'A brief spark releases the separated charge. This is a reset event, not maintained current.'
      : completed
        ? charge > 0
          ? 'The discharge is recorded. A new imbalance is building, while the system remains restored.'
          : 'The stormglass is balanced again after one brief discharge.'
        : charge > 0
          ? 'Separated charge is accumulating on opposite sides of the stormglass.'
          : 'The stormglass is balanced. Sweep it to separate charge.',
    status: completed ? 'restored' : charge >= 50 ? 'strained' : 'waiting',
    metrics: {
      voltage: charge / 100,
      current: 0,
      power: 0,
      energy: charge / 100,
      heat: 0,
      staticCharge: charge,
    },
    flags: { staticDischarge, maintainedCurrent: false },
    objectiveMet: completed,
    stepCompletion,
    flow: {
      direction: 'none',
      loopClosed: false,
      density: 0,
      fieldAmplitude: clamp(charge / 75),
      power: staticDischarge ? 0.9 : 0,
      energy: clamp(charge / 75),
      heat: 0,
      leakage: 0,
    },
  });
}

function loopworks03(state: MissionState): MissionReadout {
  const switchClosed = booleanControl(state, 'switchClosed');
  const returnClosed = booleanControl(state, 'returnClosed');
  const route = stringControl(state, 'route');
  const intended = route === 'load';
  const fault = route === 'fault';
  const loopClosed = switchClosed && returnClosed && intended;
  const current = loopClosed ? 0.9 : 0;
  const leakage = switchClosed && fault ? 0.62 : 0;
  const objectiveMet = loopClosed;
  const stepCompletion = [switchClosed, intended, returnClosed];

  return buildReadout('loopworks-03', {
    caption: fault
      ? 'The junction points toward an unintended branch. Useful flow does not belong on this path.'
      : !switchClosed
        ? 'The switch holds the whole rail open.'
        : !intended
          ? 'The selected spur ends before the load.'
          : !returnClosed
            ? 'The load path is selected, but its return is still open.'
            : 'The source, signal lamp, and return now form one complete intended loop.',
    status: objectiveMet ? 'restored' : leakage > 0 ? 'protected' : 'waiting',
    metrics: {
      voltage: 0.7,
      current,
      power: current * 0.7,
      energy: current * state.elapsedSeconds * 0.07,
      heat: leakage * 0.45,
      leakage,
    },
    flags: { switchClosed, returnClosed, intended, fault, loopClosed },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: loopClosed ? 'one-way' : 'none',
      loopClosed,
      density: current,
      fieldAmplitude: 0.7,
      power: current * 0.7,
      energy: clamp(current * state.elapsedSeconds * 0.07),
      heat: leakage * 0.45,
      leakage,
    },
  });
}

function loopworks04(state: MissionState): MissionReadout {
  const switchClosed = booleanControl(state, 'switchClosed');
  const voltage = numberControl(state, 'voltage');
  const resistance = Math.max(1, numberControl(state, 'resistance'));
  const current = switchClosed ? voltage / resistance : 0;
  const power = voltage * current;
  const heat = current * current * resistance * 0.03;
  const brightEnough = power >= 7;
  const coolEnough = heat <= 0.9;
  const objectiveMet = switchClosed && brightEnough && coolEnough;
  const stepCompletion = [switchClosed, brightEnough, coolEnough && brightEnough];

  return buildReadout('loopworks-04', {
    caption: !switchClosed
      ? 'The source lift is visible, but the open tunnel loop carries no maintained current.'
      : heat > 0.9
        ? 'The rail is carrying current, but the constricted path is warming beyond the calm band.'
        : brightEnough
          ? 'The source lift and rail opposition now produce a bright load without excessive path heat.'
          : 'The loop is closed, but the load still needs a stronger transfer rate.',
    status: objectiveMet ? 'restored' : heat > 0.9 ? 'strained' : switchClosed ? 'flowing' : 'waiting',
    metrics: {
      voltage,
      current,
      power,
      energy: power * (state.elapsedSeconds / 10),
      resistance,
      heat,
    },
    flags: { switchClosed, brightEnough, coolEnough },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: switchClosed ? 'one-way' : 'none',
      loopClosed: switchClosed,
      density: clamp(current / 2),
      fieldAmplitude: clamp(voltage / 12),
      power: clamp(power / 18),
      energy: clamp((power * state.elapsedSeconds) / 80),
      heat: clamp(heat),
      leakage: 0,
    },
  });
}

function converter05(state: MissionState): MissionReadout {
  const phaseTrim = numberControl(state, 'phaseTrim');
  const phaseAligned = phaseTrim >= 0.4 && phaseTrim <= 0.6;
  const rectifierOn = booleanControl(state, 'rectifierOn');
  const smoothingOn = booleanControl(state, 'smoothingOn');
  const regulatorOn = booleanControl(state, 'regulatorOn');
  const ripple = !rectifierOn ? 1 : !smoothingOn ? 0.8 : regulatorOn ? 0.06 : 0.2;
  const stability = !rectifierOn
    ? 0
    : !smoothingOn
      ? 0.25
      : regulatorOn
        ? phaseAligned
          ? 0.98
          : 0.86
        : 0.72;
  const objectiveMet = phaseAligned && rectifierOn && smoothingOn && regulatorOn;
  const stepCompletion = [phaseAligned, rectifierOn, smoothingOn && regulatorOn];

  return buildReadout('converter-05', {
    caption: !phaseAligned
      ? 'The reversing intake pattern is off-center. Trim it before the final output stage.'
      : !rectifierOn
        ? 'The intake alternates direction. The beacon needs a one-way output.'
        : !smoothingOn
          ? 'The bridge makes one-way pulses, but wide gaps remain between them.'
          : !regulatorOn
            ? 'The smoothing bank fills the gaps. The remaining output still wanders.'
            : 'The reversing intake has become a steady, one-way output for the survey beacon.',
    status: objectiveMet ? 'restored' : rectifierOn ? 'flowing' : 'waiting',
    metrics: {
      voltage: 0.75,
      current: objectiveMet ? 0.7 : rectifierOn ? 0.45 : 0,
      power: objectiveMet ? 0.72 : rectifierOn ? 0.35 : 0,
      energy: objectiveMet ? state.elapsedSeconds * 0.07 : 0,
      heat: rectifierOn && !smoothingOn ? 0.28 : 0.08,
      ripple,
      stability,
      phaseTrim,
    },
    flags: { phaseAligned, rectifierOn, smoothingOn, regulatorOn },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: rectifierOn ? 'one-way' : 'alternating',
      loopClosed: true,
      density: rectifierOn ? 0.62 : 0.45,
      fieldAmplitude: 0.75,
      power: objectiveMet ? 0.72 : 0.35,
      energy: clamp(state.elapsedSeconds * 0.07),
      heat: rectifierOn && !smoothingOn ? 0.28 : 0.08,
      leakage: 0,
    },
  });
}

function converter06(state: MissionState): MissionReadout {
  const adapter = stringControl(state, 'adapter');
  const compatible = adapter === 'compatible';
  const enoughCurrent = adapter !== 'low-current';
  const voltageMatch = adapter !== 'wrong-voltage';
  const polarityMatch = adapter !== 'wrong-polarity';
  const mismatchBlocked = hasMilestone(state, 'mismatch-blocked');
  const docked = hasMilestone(state, 'adapter-docked');
  const safeToDock = compatible && enoughCurrent && voltageMatch && polarityMatch;
  const objectiveMet = mismatchBlocked && docked;
  const stepCompletion = [mismatchBlocked, compatible, docked];

  return buildReadout('converter-06', {
    caption: docked
      ? 'The compatible module is docked. Supply kind, voltage, polarity, and current capacity are all inside the beacon band.'
      : state.lastEvent === 'mismatch-blocked'
        ? 'The protected bench refused the mismatch before the model beacon could energize.'
        : compatible
          ? 'The selected module matches the beacon. It is ready for protected docking.'
          : 'The selected module fails at least one compatibility check. Run the protected diagnostic.',
    status: objectiveMet ? 'restored' : mismatchBlocked ? 'protected' : 'waiting',
    metrics: {
      voltage: compatible ? 12 : adapter === 'wrong-voltage' ? 19 : 12,
      current: docked ? 1.2 : 0,
      currentCapacity: adapter === 'low-current' ? 1 : compatible ? 2 : 2,
      requiredCurrent: 1.5,
      power: docked ? 0.76 : 0,
      energy: docked ? state.elapsedSeconds * 0.06 : 0,
      heat: 0.04,
    },
    flags: {
      compatible,
      docked,
      enoughCurrent,
      mismatchBlocked,
      polarityMatch,
      safeToDock,
      voltageMatch,
    },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: docked ? 'one-way' : 'none',
      loopClosed: docked,
      density: docked ? 0.64 : 0,
      fieldAmplitude: compatible ? 0.68 : 0.35,
      power: docked ? 0.76 : 0,
      energy: clamp(state.elapsedSeconds * 0.06),
      heat: 0.04,
      leakage: 0,
    },
  });
}

function converter07(state: MissionState): MissionReadout {
  const loadCount = numberControl(state, 'loadCount');
  const efficient = stringControl(state, 'lampTech') === 'efficient';
  const power = loadCount * (efficient ? 0.08 : 0.22);
  const energy = power * (state.elapsedSeconds / 2);
  const heat = power * (efficient ? 0.18 : 0.68);
  const shiftComplete = state.elapsedSeconds >= 4;
  const objectiveMet = loadCount >= 6 && efficient && shiftComplete && energy <= 2.2;
  const stepCompletion = [loadCount >= 6, efficient, shiftComplete && energy <= 2.2];

  return buildReadout('converter-07', {
    caption: !shiftComplete
      ? `The market draws ${power.toFixed(2)} power units now. The energy ribbon grows only while time passes.`
      : efficient
        ? 'The lamps keep the market bright while the longer energy ribbon stays inside its boundary.'
        : 'The immediate power draw is high, so the energy ribbon grows quickly through the shift.',
    status: objectiveMet ? 'restored' : energy > 2.2 ? 'strained' : 'flowing',
    metrics: {
      voltage: 0.7,
      current: power / 0.7,
      power,
      energy,
      heat,
      time: state.elapsedSeconds,
      loadCount,
    },
    flags: { efficient, shiftComplete },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: 'one-way',
      loopClosed: loadCount > 0,
      density: clamp(power / 1.5),
      fieldAmplitude: 0.7,
      power: clamp(power / 1.5),
      energy: clamp(energy / 2.2),
      heat: clamp(heat),
      leakage: 0,
    },
  });
}

function gridfall08(state: MissionState): MissionReadout {
  const conducting = stringControl(state, 'material') === 'conductor';
  const path = stringControl(state, 'path');
  const intended = path === 'intended';
  const leakage = path === 'leak' ? 0.62 : 0;
  const protectiveGround = path === 'ground';
  const protectionArmed = booleanControl(state, 'protectionArmed');
  const protectionTripped = hasMilestone(state, 'leakage-trip');
  const objectiveMet = protectionTripped && conducting && intended && protectionArmed;
  const stepCompletion = [leakage > 0 || protectionTripped, protectionTripped, conducting && intended];

  return buildReadout('gridfall-08', {
    caption: state.lastEvent === 'leakage-trip'
      ? 'Protection sees current missing from the intended return and opens the affected model branch.'
      : leakage > 0
        ? 'An unintended path is visible. Arm the model protection before running the diagnostic.'
        : protectiveGround
          ? 'The protective ground path is exceptional. It exists to help protection act, not to store electricity.'
          : conducting && intended
            ? 'The conducting core carries intended flow while the surrounding insulation keeps it on that route.'
            : 'The selected core does not conduct useful current along the intended path.',
    status: objectiveMet ? 'restored' : protectionTripped || leakage > 0 ? 'protected' : 'waiting',
    metrics: {
      voltage: intended ? 0.7 : 0.3,
      current: conducting && intended ? 0.72 : 0,
      power: conducting && intended ? 0.68 : 0,
      energy: conducting && intended ? state.elapsedSeconds * 0.05 : 0,
      heat: leakage * 0.45,
      leakage,
    },
    flags: {
      conducting,
      intended,
      leakagePath: leakage > 0,
      protectiveGround,
      protectionArmed,
      protectionTripped,
    },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: conducting && intended ? 'one-way' : 'none',
      loopClosed: conducting && intended,
      density: conducting && intended ? 0.72 : 0,
      fieldAmplitude: 0.7,
      power: conducting && intended ? 0.68 : 0,
      energy: clamp(state.elapsedSeconds * 0.05),
      heat: leakage * 0.45,
      leakage,
    },
  });
}

function gridfall09(state: MissionState): MissionReadout {
  const loopClosed = booleanControl(state, 'loopClosed');
  const motion = numberControl(state, 'motion');
  const field = numberControl(state, 'field');
  const load = numberControl(state, 'load');
  const induction = motion * field;
  const current = loopClosed ? induction * (0.5 + load * 0.7) : 0;
  const power = loopClosed ? induction * load : 0;
  const mechanicalOpposition = loopClosed ? load * current : 0;
  const objectiveMet =
    loopClosed && induction >= 0.5 && power >= 0.35 && mechanicalOpposition <= 0.78;
  const stepCompletion = [loopClosed, induction >= 0.5, power >= 0.35 && mechanicalOpposition <= 0.78];

  return buildReadout('gridfall-09', {
    caption: !loopClosed
      ? 'The rotor changes magnetic flux and creates electrical push, but no current reaches a load.'
      : mechanicalOpposition > 0.78
        ? 'The connected load pushes back hard enough to strain the rotor.'
        : 'Changing magnetic flux creates electrical push. The connected load adds visible mechanical opposition.',
    status: objectiveMet ? 'restored' : mechanicalOpposition > 0.78 ? 'strained' : loopClosed ? 'flowing' : 'waiting',
    metrics: {
      voltage: induction,
      current,
      power,
      energy: power * (state.elapsedSeconds / 4),
      heat: mechanicalOpposition * 0.22,
      induction,
      mechanicalOpposition,
    },
    flags: { changingFlux: induction > 0.02, loopClosed },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: loopClosed ? 'alternating' : 'none',
      loopClosed,
      density: clamp(current),
      fieldAmplitude: clamp(induction),
      power: clamp(power),
      energy: clamp((power * state.elapsedSeconds) / 4),
      heat: clamp(mechanicalOpposition * 0.22),
      leakage: 0,
    },
  });
}

function gridfall10(state: MissionState): MissionReadout {
  const highVoltage = stringControl(state, 'lineVoltage') === 'high';
  const transformerOn = booleanControl(state, 'transformerOn');
  const demand = numberControl(state, 'demand');
  const voltage = highVoltage ? 4 : 1;
  const current = demand / voltage;
  const heat = current * current * 0.55;
  const delivered = clamp(demand - heat * 0.4, 0, 1.2);
  const objectiveMet = highVoltage && transformerOn && heat < 0.08;
  const stepCompletion = [highVoltage, heat < 0.08, transformerOn];

  return buildReadout('gridfall-10', {
    caption: highVoltage
      ? transformerOn
        ? 'The same delivery crosses with fewer current markers and less line heat, then steps down near the city.'
        : 'Line current and heat are low, but the city step-down stage is still open.'
      : 'Low transmission voltage demands more current for the same delivery, so the long span warms.',
    status: objectiveMet ? 'restored' : heat > 0.2 ? 'strained' : 'flowing',
    metrics: {
      voltage,
      current,
      power: delivered,
      energy: delivered * (state.elapsedSeconds / 5),
      heat,
      delivered,
    },
    flags: { highVoltage, transformerOn },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: 'alternating',
      loopClosed: true,
      density: clamp(current),
      fieldAmplitude: highVoltage ? 1 : 0.25,
      power: clamp(delivered),
      energy: clamp((delivered * state.elapsedSeconds) / 5),
      heat: clamp(heat / 0.35),
      leakage: 0,
    },
  });
}

function gridfall11(state: MissionState): MissionReadout {
  const fault = stringControl(state, 'fault');
  const breakerOn = booleanControl(state, 'breakerOn');
  const gfciOn = booleanControl(state, 'gfciOn');
  const breakerTripped = hasMilestone(state, 'breaker-trip');
  const gfciTripped = hasMilestone(state, 'gfci-trip');
  const reset = hasMilestone(state, 'protection-reset');
  const overload = fault === 'overload';
  const leakageFault = fault === 'leakage';
  const affectedBranchOpen =
    (overload && breakerOn && breakerTripped) || (leakageFault && gfciOn && gfciTripped);
  const current = affectedBranchOpen ? 0 : overload ? 1.4 : leakageFault ? 0.72 : 0.62;
  const returningCurrent = leakageFault && !affectedBranchOpen ? current * 0.42 : current;
  const objectiveMet = breakerTripped && gfciTripped && reset;
  const stepCompletion = [breakerTripped, gfciTripped, reset];

  return buildReadout('gridfall-11', {
    caption: state.lastEvent === 'breaker-trip'
      ? 'Overcurrent protection sees too much current and deliberately opens the branch.'
      : state.lastEvent === 'gfci-trip'
        ? 'Return-balance protection sees missing return current and deliberately opens the branch.'
        : state.lastEvent === 'protection-reset'
          ? 'Both conditions were observed, the model fault is clear, and the protected branch is reset.'
          : fault === 'none'
            ? 'The branch is clear. Select a model condition to see which watcher responds.'
            : affectedBranchOpen
              ? 'The affected branch is open while the model protection remains tripped.'
              : 'The selected condition is active. Run the protection test.',
    status: objectiveMet ? 'restored' : affectedBranchOpen ? 'protected' : fault === 'none' ? 'waiting' : 'strained',
    metrics: {
      voltage: affectedBranchOpen ? 0 : 0.7,
      current,
      returningCurrent,
      power: current * 0.7,
      energy: current * state.elapsedSeconds * 0.04,
      heat: overload && !affectedBranchOpen ? 0.88 : 0.12,
      leakage: Math.max(0, current - returningCurrent),
    },
    flags: {
      affectedBranchOpen,
      breakerTripped,
      gfciTripped,
      leakageFault,
      overload,
      reset,
    },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: affectedBranchOpen ? 'none' : 'alternating',
      loopClosed: !affectedBranchOpen,
      density: clamp(current),
      fieldAmplitude: affectedBranchOpen ? 0 : 0.7,
      power: clamp(current * 0.7),
      energy: clamp(current * state.elapsedSeconds * 0.04),
      heat: overload && !affectedBranchOpen ? 0.88 : 0.12,
      leakage: Math.max(0, current - returningCurrent),
    },
  });
}

function gridfall12(state: MissionState): MissionReadout {
  const generation = numberControl(state, 'generation');
  const transmissionHigh = booleanControl(state, 'transmissionHigh');
  const feederCapacity = numberControl(state, 'feederCapacity');
  const serviceDemand = numberControl(state, 'serviceDemand');
  const priorityRoute = stringControl(state, 'priorityRoute');
  const protectionArmed = booleanControl(state, 'protectionArmed');
  const feederDemand = serviceDemand + (priorityRoute === 'balanced' ? 0.18 : 0.12);
  const voltage = transmissionHigh ? 4 : 1;
  const lineCurrent = feederDemand / voltage;
  const heat = lineCurrent * lineCurrent * 0.4;
  const feederMargin = feederCapacity - feederDemand;
  const generationMargin = generation - feederDemand;
  const balanced = priorityRoute === 'balanced';
  const stableGeneration = generationMargin >= 0 && generationMargin <= 0.3;
  const objectiveMet =
    transmissionHigh &&
    balanced &&
    protectionArmed &&
    feederMargin >= 0.04 &&
    stableGeneration &&
    heat < 0.08;
  const stepCompletion = [
    stableGeneration,
    transmissionHigh && heat < 0.08,
    balanced && feederMargin >= 0.04,
    protectionArmed,
  ];

  return buildReadout('gridfall-12', {
    caption: generationMargin < 0
      ? 'City demand is outrunning generation. Raise supply or ease the service peak.'
      : feederMargin < 0
        ? 'The shared feeder is carrying more combined demand than its present capacity.'
        : !transmissionHigh
          ? 'The city is supplied, but high line current is heating the transmission span.'
          : !balanced
            ? 'One branch is favored while the rest of the city remains dark.'
            : !protectionArmed
              ? 'The city is balanced, but coordinated protection is still idle.'
              : objectiveMet
                ? 'Generation, transmission, feeders, services, loads, and protection are working as one connected city.'
                : 'The city is close to balance. Match generation to the full feeder demand.',
    status: objectiveMet
      ? 'restored'
      : generationMargin < 0 || feederMargin < 0 || heat >= 0.08
        ? 'strained'
        : 'flowing',
    metrics: {
      voltage,
      current: lineCurrent,
      power: Math.min(generation, feederDemand),
      energy: Math.min(generation, feederDemand) * (state.elapsedSeconds / 4),
      heat,
      generation,
      generationMargin,
      feederCapacity,
      feederDemand,
      feederMargin,
      serviceDemand,
    },
    flags: {
      balanced,
      protectionArmed,
      stableGeneration,
      transmissionHigh,
    },
    objectiveMet,
    stepCompletion,
    flow: {
      direction: 'alternating',
      loopClosed: generation > 0 && feederCapacity > 0,
      density: clamp(lineCurrent),
      fieldAmplitude: transmissionHigh ? 1 : 0.25,
      power: clamp(Math.min(generation, feederDemand)),
      energy: clamp((Math.min(generation, feederDemand) * state.elapsedSeconds) / 4),
      heat: clamp(heat / 0.25),
      leakage: 0,
    },
  });
}

function buildMissionReadout(state: CampaignState, mission: MissionId): MissionReadout {
  const missionState = state.missions[mission];
  switch (mission) {
    case 'loopworks-01':
      return loopworks01(missionState);
    case 'loopworks-02':
      return loopworks02(missionState);
    case 'loopworks-03':
      return loopworks03(missionState);
    case 'loopworks-04':
      return loopworks04(missionState);
    case 'converter-05':
      return converter05(missionState);
    case 'converter-06':
      return converter06(missionState);
    case 'converter-07':
      return converter07(missionState);
    case 'gridfall-08':
      return gridfall08(missionState);
    case 'gridfall-09':
      return gridfall09(missionState);
    case 'gridfall-10':
      return gridfall10(missionState);
    case 'gridfall-11':
      return gridfall11(missionState);
    case 'gridfall-12':
      return gridfall12(missionState);
  }
}

export function getMissionReadout(state: CampaignState, mission: MissionId): MissionReadout {
  const readout = buildMissionReadout(state, mission);
  if (!state.completed.includes(mission)) return readout;

  return {
    ...readout,
    objectiveProgress: 1,
    stepCompletion: readout.stepCompletion.map(() => true),
  };
}

export function getNextIncompleteStep(stepCompletion: readonly boolean[]): number {
  const index = stepCompletion.findIndex((done) => !done);
  return index === -1 ? stepCompletion.length : index + 1;
}

export function isMissionUnlocked(state: CampaignState, mission: MissionId): boolean {
  if (state.sandboxUnlocked) return true;
  const index = missionIds.indexOf(mission);
  return index === 0 || state.completed.includes(missionIds[index - 1]);
}

function evaluateProgression(state: CampaignState, mission: MissionId): CampaignState {
  if (
    state.completed.includes(mission) ||
    !isMissionUnlocked(state, mission) ||
    !getMissionReadout(state, mission).objectiveMet
  ) {
    return state;
  }

  const completedSet = new Set([...state.completed, mission]);
  const completed = missionIds.filter((id) => completedSet.has(id));
  const campaignComplete = completed.length === missions.length;

  return {
    ...state,
    campaignComplete,
    completed,
    sandboxUnlocked: campaignComplete,
  };
}

export function setMissionControl(
  state: CampaignState,
  mission: MissionId,
  control: string,
  value: ControlValue,
): CampaignState {
  if (!(control in initialMissionControls[mission])) return state;

  const previousMission = state.missions[mission];
  const changed = remember(state, {
    ...state,
    missions: {
      ...state.missions,
      [mission]: {
        ...previousMission,
        controls: {
          ...previousMission.controls,
          [control]: value,
        },
        lastEvent: null,
      },
    },
    history: state.history,
  });

  return evaluateProgression(changed, mission);
}

export function performMissionAction(
  state: CampaignState,
  mission: MissionId,
  action: string,
): CampaignState {
  let nextMission = clone(state.missions[mission]);
  nextMission.lastEvent = null;

  if (mission === 'loopworks-02' && action === 'charge-static') {
    const charge = numberControl(nextMission, 'chargeLevel') + 25;
    if (charge >= 75) {
      nextMission.controls.chargeLevel = 0;
      nextMission = addMilestone(nextMission, 'static-discharge');
      nextMission.lastEvent = 'static-discharge';
    } else {
      nextMission.controls.chargeLevel = charge;
      nextMission.lastEvent = 'static-charge';
    }
  }

  if (mission === 'converter-06' && action === 'diagnose-adapter') {
    if (stringControl(nextMission, 'adapter') !== 'compatible') {
      nextMission = addMilestone(nextMission, 'mismatch-blocked');
      nextMission.lastEvent = 'mismatch-blocked';
    } else {
      nextMission.lastEvent = 'adapter-compatible';
    }
  }

  if (mission === 'converter-06' && action === 'dock-adapter') {
    if (stringControl(nextMission, 'adapter') === 'compatible') {
      nextMission = addMilestone(nextMission, 'adapter-docked');
      nextMission.lastEvent = 'adapter-docked';
    } else {
      nextMission = addMilestone(nextMission, 'mismatch-blocked');
      nextMission.lastEvent = 'mismatch-blocked';
    }
  }

  if (mission === 'converter-07' && action === 'advance-shift') {
    nextMission.elapsedSeconds += 2;
    nextMission.lastEvent = 'time-advanced';
  }

  if (mission === 'gridfall-08' && action === 'test-path') {
    if (
      stringControl(nextMission, 'path') === 'leak' &&
      booleanControl(nextMission, 'protectionArmed')
    ) {
      nextMission = addMilestone(nextMission, 'leakage-trip');
      nextMission.lastEvent = 'leakage-trip';
    } else {
      nextMission.lastEvent = 'path-observed';
    }
  }

  if (mission === 'gridfall-11' && action === 'test-protection') {
    const fault = stringControl(nextMission, 'fault');
    if (fault === 'overload' && booleanControl(nextMission, 'breakerOn')) {
      nextMission = addMilestone(nextMission, 'breaker-trip');
      nextMission.lastEvent = 'breaker-trip';
    }
    if (fault === 'leakage' && booleanControl(nextMission, 'gfciOn')) {
      nextMission = addMilestone(nextMission, 'gfci-trip');
      nextMission.lastEvent = 'gfci-trip';
    }
  }

  if (mission === 'gridfall-11' && action === 'reset-protection') {
    if (
      stringControl(nextMission, 'fault') === 'none' &&
      hasMilestone(nextMission, 'breaker-trip') &&
      hasMilestone(nextMission, 'gfci-trip')
    ) {
      nextMission = addMilestone(nextMission, 'protection-reset');
      nextMission.lastEvent = 'protection-reset';
    } else {
      nextMission.lastEvent = 'reset-blocked';
    }
  }

  if (nextMission.lastEvent === null) return state;

  const changed = remember(state, {
    ...state,
    missions: {
      ...state.missions,
      [mission]: nextMission,
    },
    history: state.history,
  });

  return evaluateProgression(changed, mission);
}

export function clearMissionEvent(state: CampaignState, mission: MissionId): CampaignState {
  if (!state.missions[mission].lastEvent) return state;
  return {
    ...state,
    missions: {
      ...state.missions,
      [mission]: {
        ...state.missions[mission],
        lastEvent: null,
      },
    },
  };
}

export function advanceCampaignTime(state: CampaignState, seconds: number): CampaignState {
  const safeSeconds = clamp(Number.isFinite(seconds) ? seconds : 0, 0, 120);
  if (safeSeconds === 0) return state;

  const changed = remember(state, {
    ...state,
    missions: Object.fromEntries(
      missionIds.map((mission) => [
        mission,
        {
          ...state.missions[mission],
          elapsedSeconds: state.missions[mission].elapsedSeconds + safeSeconds,
          lastEvent: null,
        },
      ]),
    ) as MissionStates,
    history: state.history,
  });

  return evaluateProgression(changed, state.activeMission);
}

export function travelToMission(state: CampaignState, mission: MissionId): CampaignState {
  if (!isMissionUnlocked(state, mission) || state.activeMission === mission) return state;
  return {
    ...state,
    activeMission: mission,
  };
}

export function setCampaignSettings(
  state: CampaignState,
  settings: Partial<Omit<CampaignSettings, 'bindings'>> & {
    bindings?: Partial<InputBindings>;
  },
): CampaignState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...settings,
      bindings: {
        ...state.settings.bindings,
        ...settings.bindings,
      },
    },
  };
}

export function resetMissionState(state: CampaignState, mission: MissionId): CampaignState {
  const preserveCampaign = state.sandboxUnlocked;
  return remember(state, {
    ...state,
    completed: preserveCampaign
      ? state.completed
      : state.completed.filter((completed) => completed !== mission),
    missions: {
      ...state.missions,
      [mission]: {
        controls: clone(initialMissionControls[mission]),
        elapsedSeconds: 0,
        lastEvent: null,
        milestones: [],
      },
    },
    campaignComplete: preserveCampaign ? state.campaignComplete : false,
    sandboxUnlocked: preserveCampaign,
    history: state.history,
  });
}

export function rewindCampaignState(state: CampaignState): CampaignState {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return {
    ...clone(previous),
    history: state.history.slice(0, -1),
  };
}

export function serializeCampaignState(state: CampaignState): string {
  return JSON.stringify(snapshot(state));
}

function sanitizeMissionState(mission: MissionId, value: unknown): MissionState {
  const defaults = initialMissionControls[mission];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      controls: clone(defaults),
      elapsedSeconds: 0,
      lastEvent: null,
      milestones: [],
    };
  }

  const candidate = value as Partial<MissionState>;
  const candidateControls =
    candidate.controls && typeof candidate.controls === 'object' && !Array.isArray(candidate.controls)
      ? candidate.controls
      : {};
  const controls = Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => {
      const incoming = candidateControls[key];
      return [key, typeof incoming === typeof fallback ? incoming : fallback];
    }),
  ) as MissionControls;

  return {
    controls,
    elapsedSeconds:
      typeof candidate.elapsedSeconds === 'number' && Number.isFinite(candidate.elapsedSeconds)
        ? clamp(candidate.elapsedSeconds, 0, 86_400)
        : 0,
    lastEvent: null,
    milestones: Array.isArray(candidate.milestones)
      ? candidate.milestones.filter((item): item is string => typeof item === 'string').slice(0, 24)
      : [],
  };
}

function sanitizeSettings(value: unknown): CampaignSettings {
  const fresh = createInitialCampaignState().settings;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fresh;
  const candidate = value as Partial<CampaignSettings>;
  const bindings =
    candidate.bindings && typeof candidate.bindings === 'object'
      ? Object.fromEntries(
          Object.entries(defaultBindings).map(([key, fallback]) => {
            const incoming = candidate.bindings?.[key as keyof InputBindings];
            return [key, typeof incoming === 'string' && incoming.length <= 24 ? incoming : fallback];
          }),
        )
      : defaultBindings;

  return {
    mode: candidate.mode === 'planning' ? 'planning' : 'action',
    muted: typeof candidate.muted === 'boolean' ? candidate.muted : fresh.muted,
    soundVolume:
      typeof candidate.soundVolume === 'number' && Number.isFinite(candidate.soundVolume)
        ? clamp(candidate.soundVolume)
        : fresh.soundVolume,
    reducedEffects:
      typeof candidate.reducedEffects === 'boolean'
        ? candidate.reducedEffects
        : fresh.reducedEffects,
    reducedMotion:
      typeof candidate.reducedMotion === 'boolean' ? candidate.reducedMotion : fresh.reducedMotion,
    slowMotion:
      typeof candidate.slowMotion === 'boolean' ? candidate.slowMotion : fresh.slowMotion,
    bindings: bindings as unknown as InputBindings,
  };
}

export function parseCampaignSave(raw: string | null): CampaignState {
  if (!raw) return createInitialCampaignState();

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (parsed.version === 1) {
      const fresh = createInitialCampaignState();
      const completed = Array.isArray(parsed.completed)
        ? missionIds.filter((mission) => parsed.completed?.includes(mission))
        : [];
      const activeMission = missionIds.includes(parsed.activeMission as MissionId)
        ? (parsed.activeMission as MissionId)
        : fresh.activeMission;
      return {
        ...fresh,
        activeMission,
        completed,
        campaignComplete: completed.length === missionIds.length,
        sandboxUnlocked: completed.length === missionIds.length,
      };
    }

    if (parsed.version !== CIRCUIT_RIDERS_SAVE_VERSION) return createInitialCampaignState();

    const fresh = createInitialCampaignState();
    const completedSet = new Set(
      Array.isArray(parsed.completed)
        ? parsed.completed.filter((mission): mission is MissionId =>
            missionIds.includes(mission as MissionId),
          )
        : [],
    );
    const completed = missionIds.filter((mission) => completedSet.has(mission));
    const activeMission = missionIds.includes(parsed.activeMission as MissionId)
      ? (parsed.activeMission as MissionId)
      : fresh.activeMission;
    const parsedMissions =
      parsed.missions && typeof parsed.missions === 'object' && !Array.isArray(parsed.missions)
        ? (parsed.missions as Partial<Record<MissionId, unknown>>)
        : {};
    const missionStates = Object.fromEntries(
      missionIds.map((mission) => [mission, sanitizeMissionState(mission, parsedMissions[mission])]),
    ) as MissionStates;
    const campaignComplete = completed.length === missionIds.length;

    return {
      ...fresh,
      activeMission,
      campaignComplete,
      completed,
      missions: missionStates,
      sandboxUnlocked: campaignComplete,
      settings: sanitizeSettings(parsed.settings),
    };
  } catch {
    return createInitialCampaignState();
  }
}

export function getCampaignProgress(state: CampaignState): number {
  return state.completed.length / missionIds.length;
}

export function getNextMission(state: CampaignState): MissionId | null {
  const index = missionIds.indexOf(state.activeMission);
  const next = missionIds[index + 1];
  return next && isMissionUnlocked(state, next) ? next : null;
}

export function getActiveMissionDefinition(state: CampaignState) {
  return missionById[state.activeMission];
}
