import type { DistrictId } from '../content/districts';

export type ChallengeEffect = 'idle' | 'motion' | 'success' | 'fault' | 'spark';

export interface StationChallengeState {
  district: DistrictId;
  phaseIndex: number;
  values: Record<string, unknown>;
  feedback: string;
  effect: ChallengeEffect;
  solved: boolean;
  moves: number;
}

export interface StationChallengeAction {
  type: string;
  value?: string | number | boolean;
  secondary?: string | number;
}

export interface ChallengePhaseDefinition {
  id: string;
  eyebrow: string;
  title: string;
  instruction: string;
  proof: string;
}

export interface ChallengeDefinition {
  district: DistrictId;
  roomName: string;
  roomLabel: string;
  phases: [ChallengePhaseDefinition, ChallengePhaseDefinition, ChallengePhaseDefinition];
}

export const challengeDefinitions: Record<DistrictId, ChallengeDefinition> = {
  workshop: {
    district: 'workshop',
    roomName: 'Workshop Cove',
    roomLabel: 'Circuit workbench',
    phases: [
      {
        id: 'build-loop',
        eyebrow: 'Bench 1 of 3',
        title: 'Build a path that comes home.',
        instruction: 'Place the five parts around the loop. The lamp needs a source, a controllable path, a load, and a return to the source.',
        proof: 'A gap anywhere stops every current marker, even when the source still has push.',
      },
      {
        id: 'tune-flow',
        eyebrow: 'Bench 2 of 3',
        title: 'Change push and opposition with real parts.',
        instruction: 'Run three comparisons and change only one part at a time. Start with one cell and the medium coil, then follow the highlighted next change.',
        proof: 'Cells provide voltage push. More push moves charge faster through the same path. Resistance opposes that flow, so more resistance slows current when the source stays unchanged.',
      },
      {
        id: 'spark-reset',
        eyebrow: 'Bench 3 of 3',
        title: 'Build an imbalance, then watch it vanish.',
        instruction: 'Rub the wool pad across the insulated vane. In this model, electron markers move from the pad onto the vane. Build enough imbalance to spark across the air gap, then reset the model.',
        proof: 'Rubbing transfers electrons and creates charge imbalance. The spark is a brief discharge across the air gap. Without a source and closed loop, the current ends.',
      },
    ],
  },
  converter: {
    district: 'converter',
    roomName: 'Converter Dock',
    roomLabel: 'Waveform cargo line',
    phases: [
      {
        id: 'shape-wave',
        eyebrow: 'Dock line 1 of 3',
        title: 'Turn reversing AC into steady DC.',
        instruction: 'Probe the broken signal journey first. Repair the reversed rectifier, probe the pulsing one-way output, install the smoothing capacitor, then run the complete converter.',
        proof: 'Adjustment changes the voltage range but AC still reverses. Rectification makes pulsing one-way output, smoothing fills the dips, and regulation holds the final target.',
      },
      {
        id: 'match-label',
        eyebrow: 'Dock line 2 of 3',
        title: 'Power the radio without trusting the plug shape.',
        instruction: 'Compare the radio input with each adapter output line by line. Let the protected gate reject one mismatch, then choose the adapter where all five checks pass.',
        proof: 'Voltage and AC/DC type match exactly. Current capacity is at least what the device needs. Connector and polarity also match. Physical fit alone proves nothing.',
      },
      {
        id: 'negotiate-output',
        eyebrow: 'Dock line 3 of 3',
        title: 'Let USB-C agree before power rises.',
        instruction: 'Connect the USB-C link and observe default 5 V. Then send the charger offer, radio request, and charger acceptance in sequence. Watch when 9 V actually appears.',
        proof: 'USB-C begins at a safe default in this model. Higher voltage appears only after compatible endpoints offer, request, and accept a shared mode.',
      },
    ],
  },
  wind: {
    district: 'wind',
    roomName: 'Wind Ridge',
    roomLabel: 'Hand-crank generator',
    phases: [
      {
        id: 'change-flux',
        eyebrow: 'Rig 1 of 3',
        title: 'Make the field through the coil change.',
        instruction: 'Observe the still magnet, then work the crank left and right. Repeated motion, not a parked magnet, sustains induced voltage.',
        proof: 'Steady flux produces no sustained induced voltage. Relative motion changes flux through the coil.',
      },
      {
        id: 'close-loop',
        eyebrow: 'Rig 2 of 3',
        title: 'Make voltage first. Give current a loop.',
        instruction: 'Use the same generator twice. First crank with the copper bridge missing: the wire ends gain electrical push, but nothing can circulate. Then close only that gap and crank again.',
        proof: 'Changing magnetic flux induces voltage across the coil wire ends. Voltage is push. Current is charge moving around a complete path, so the open gap keeps the lamp current at zero.',
      },
      {
        id: 'balance-load',
        eyebrow: 'Rig 3 of 3',
        title: 'Feel the load push back.',
        instruction: 'Try the heavy load, then choose a load you can keep moving with a steady alternating crank.',
        proof: 'More electrical load creates more counter-torque. Useful output requires continuing mechanical work.',
      },
    ],
  },
  longline: {
    district: 'longline',
    roomName: 'Longline Pass',
    roomLabel: 'Transformer railway',
    phases: [
      {
        id: 'compare-line',
        eyebrow: 'Dispatch 1 of 3',
        title: 'Send the same delivery two ways.',
        instruction: 'Dispatch the town cargo once at low line voltage and once at high line voltage.',
        proof: 'Comparable power at higher voltage needs less line current, so the same wire produces much less heat.',
      },
      {
        id: 'build-transformers',
        eyebrow: 'Dispatch 2 of 3',
        title: 'Build the electrical gearbox chain.',
        instruction: 'Test steady DC, then choose AC and orient a step-up transformer before the line and a step-down transformer beside town.',
        proof: 'A transformer needs changing flux. The coil ratio direction decides whether voltage rises or falls.',
      },
      {
        id: 'deliver-safely',
        eyebrow: 'Dispatch 3 of 3',
        title: 'Keep the line cool and the town usable.',
        instruction: 'Try the low-voltage route, then dispatch through the completed high-voltage chain.',
        proof: 'The line travels at higher voltage and lower current, then steps down close to the load.',
      },
    ],
  },
  lantern: {
    district: 'lantern',
    roomName: 'Lantern District',
    roomLabel: 'Night-market table',
    phases: [
      {
        id: 'equal-energy',
        eyebrow: 'Market 1 of 3',
        title: 'Make two different evenings use the same energy.',
        instruction: 'Adjust power and runtime independently. Make both machines accumulate the same Wh while keeping their power rates or runtimes different.',
        proof: 'Power is a rate in watts. Multiply that rate by runtime in hours to find the energy accumulated in watt-hours.',
      },
      {
        id: 'schedule-market',
        eyebrow: 'Market 2 of 3',
        title: 'Plan brightness, power, and time together.',
        instruction: 'Run the underlit starting market, repair the period that misses its brightness need, then rerun the full night within 1200 Wh.',
        proof: 'Each period adds power × duration. A brighter or longer period adds more Wh to the night total.',
      },
      {
        id: 'replay-evening',
        eyebrow: 'Market 3 of 3',
        title: 'Run the night and keep every watt-hour.',
        instruction: 'Run each market period. Read its power × time receipt, add it to the accumulator, then convert the finished Wh total into kWh and model cost.',
        proof: 'Watts describe the rate while lamps run. Watt-hours accumulate over time and remain in the total after power falls to zero.',
      },
    ],
  },
  harbor: {
    district: 'harbor',
    roomName: 'Harbor Neighborhood',
    roomLabel: 'Fault and feeder board',
    phases: [
      {
        id: 'layer-paths',
        eyebrow: 'Harbor board 1 of 3',
        title: 'Give every layer one job.',
        instruction: 'Fit the conductor, insulation, and emergency ground, then run the model in normal operation.',
        proof: 'The conductor carries normal current, insulation keeps it on that path, and ground stays quiet until a fault.',
      },
      {
        id: 'diagnose-faults',
        eyebrow: 'Harbor board 2 of 3',
        title: 'Make protection respond to the right signal.',
        instruction: 'Install both watchers, inject overload, short, and leakage faults, then repair the damaged model cable.',
        proof: 'A breaker reacts to too much current. GFCI or RCD protection reacts to missing return current. A trip is not a repair.',
      },
      {
        id: 'balance-feeder',
        eyebrow: 'Harbor board 3 of 3',
        title: 'Rebuild the chain and share its capacity.',
        instruction: 'Assemble substation, feeder, local transformer, and service. Create an overload, then rebalance the homes with margin.',
        proof: 'Home current follows local load. The shared feeder sees the combined neighborhood demand.',
      },
    ],
  },
};

const initialByDistrict: Record<DistrictId, Array<() => Record<string, unknown>>> = {
  workshop: [
    () => ({ slots: ['', '', '', '', ''], selectedPiece: 'source' }),
    () => ({ cells: 1, coil: 'medium', observations: [] }),
    () => ({ rubs: 0, sparked: false, resetObserved: false }),
  ],
  converter: [
    () => ({ rectifier: 'reversed', capacitorInstalled: false, testedWrong: false, rectificationSeen: false, wave: 'reversing' }),
    () => ({ adapter: '9v-2a', testedBad: false, testedGood: false, lastTested: '' }),
    () => ({ connected: false, offerSent: false, requestSent: false, negotiated: false, defaultSeen: false, voltage: 0 }),
  ],
  wind: [
    () => ({ stillObserved: false, strokes: 0, lastDirection: '', voltage: 0 }),
    () => ({ loopClosed: false, openVoltageSeen: false, currentSeen: false, voltageActive: false, lastDirection: '' }),
    () => ({ load: 'heavy', heavyTried: false, steadyStrokes: 0, lastDirection: '' }),
  ],
  longline: [
    () => ({ voltage: 'low', lowSeen: false, highSeen: false, current: 0, heat: 0 }),
    () => ({ source: 'dc', stepUp: 'reversed', stepDown: 'missing', testedDc: false, energized: false }),
    () => ({ route: 'low', hotSeen: false, safeSeen: false, townLit: false }),
  ],
  lantern: [
    () => ({
      leftPower: 1000,
      leftHours: 1,
      leftEnergy: 1000,
      rightPower: 100,
      rightHours: 1,
      rightEnergy: 100,
    }),
    () => ({
      schedule: { dusk: 'efficient', peak: 'dim', closing: 'efficient' },
      selectedPlan: 'mixed',
      energy: 600,
      brightness: [2, 1, 2],
      testedStart: false,
      testedGood: false,
    }),
    () => ({
      period: 0,
      energy: 0,
      power: 0,
      cost: 0,
      lastPower: 0,
      lastDuration: 0,
      lastAdded: 0,
      lastLabel: '',
      receipts: [],
    }),
  ],
  harbor: [
    () => ({ conductor: 'rubber', insulation: 'missing', ground: 'missing', observedNormal: false }),
    () => ({ breaker: false, gfci: false, fault: 'overload', observed: [], damaged: false, repaired: false }),
    () => ({ chain: ['', '', '', ''], selectedPiece: 'substation', homes: [1, 1, 1], capacity: 3, overloadSeen: false, balanced: false }),
  ],
};

export function createStationChallengeState(district: DistrictId, phaseIndex = 0): StationChallengeState {
  const safeIndex = Math.max(0, Math.min(2, phaseIndex));
  return {
    district,
    phaseIndex: safeIndex,
    values: initialByDistrict[district][safeIndex](),
    feedback: challengeDefinitions[district].phases[safeIndex].instruction,
    effect: 'idle',
    solved: false,
    moves: 0,
  };
}

function changed(
  state: StationChallengeState,
  values: Record<string, unknown>,
  feedback: string,
  effect: ChallengeEffect,
  solved: boolean,
): StationChallengeState {
  return { ...state, values, feedback, effect, solved, moves: state.moves + 1 };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.map(Number) : [];
}

function asRecord(value: unknown): Record<string, string> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]))
    : {};
}

function reduceWorkshop(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    const slots = stringArray(values.slots);
    if (action.type === 'select-piece') values.selectedPiece = String(action.value ?? '');
    if (action.type === 'place-slot') slots[Number(action.value)] = String(values.selectedPiece ?? '');
    if (action.type === 'drop-piece') slots[Number(action.secondary)] = String(action.value ?? '');
    if (action.type === 'remove-slot') slots[Number(action.value)] = '';
    values.slots = slots;
    const solved = slots.join('|') === 'source|switch|resistor|lamp|return';
    const firstGap = slots.findIndex((slot) => !slot);
    const feedback = solved
      ? 'The loop closes through every part and returns to the source. Current markers circulate and the lamp receives energy.'
      : firstGap >= 0
        ? `The path still has a gap at socket ${firstGap + 1}. The source has push, but there is no sustained current.`
        : 'Every socket is filled, but the order sends the path somewhere it cannot return. Rearrange the parts.';
    return changed(state, values, feedback, solved ? 'success' : 'idle', solved);
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'set-cells') values.cells = Number(action.value);
    if (action.type === 'set-coil') values.coil = String(action.value);
    const observations = stringArray(values.observations);
    if (action.type === 'pulse-loop') {
      const cells = Number(values.cells);
      const coil = String(values.coil);
      const expected = observations.length === 0 ? 'baseline' : observations.length === 1 ? 'push' : observations.length === 2 ? 'resistance' : 'free-play';
      const matchesExpected = expected === 'baseline'
        ? cells === 1 && coil === 'medium'
        : expected === 'push'
          ? cells === 2 && coil === 'medium'
          : expected === 'resistance'
            ? cells === 2 && coil === 'high'
            : true;

      if (!matchesExpected) {
        const guidance = expected === 'baseline'
          ? 'Start with one cell and the medium coil. This gives the comparison a clear starting trace.'
          : expected === 'push'
            ? 'For a fair push comparison, keep the medium coil and add a second cell. Only the source should change.'
            : 'For a fair resistance comparison, keep two cells and fit the high-opposition coil. Only the coil should change.';
        return changed(state, values, guidance, 'idle', false);
      }

      if (expected !== 'free-play') observations.push(expected);
      values.observations = observations;
      const current = cells / (coil === 'low' ? 1 : coil === 'medium' ? 2 : 4);
      values.current = current;
      values.heat = current * current * (coil === 'low' ? 1 : coil === 'medium' ? 2 : 4);

      const solved = observations.length === 3;
      const feedback = expected === 'baseline'
        ? 'Starting trace recorded. With one cell and the medium coil, the charge markers move at a steady pace. Next, keep the coil and add a second cell.'
        : expected === 'push'
          ? 'Only the source changed. Two cells provide more voltage push, so charge moves faster through the same medium coil. Next, keep two cells and fit the high-opposition coil.'
          : expected === 'resistance'
            ? 'Only the coil changed. The high-opposition coil adds resistance, so charge moves slower even though the two-cell source stays the same.'
            : `Free-play trace: this setup produces ${current >= 1 ? 'fast' : current >= 0.5 ? 'steady' : 'slow'} charge traffic through the loop.`;
      return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
    }
    const solved = observations.length === 3;
    const feedback = observations.length === 0
      ? 'Set one cell and the medium coil, then run the starting setup.'
      : observations.length === 1
        ? 'Keep the medium coil. Add a second cell so only source push changes.'
        : observations.length === 2
          ? 'Keep two cells. Fit the high-opposition coil so only resistance changes.'
          : 'Choose any cell stack and coil to replay the visible cause and effect.';
    return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
  }
  if (action.type === 'rub-vane') {
    if (values.sparked) return state;
    const rubs = Math.min(4, Number(values.rubs ?? 0) + 1);
    values.rubs = rubs;
    values.sparked = rubs >= 4;
    return changed(
      state,
      values,
      rubs >= 4
        ? 'Spark: the air briefly conducts and excess electrons cross the gap. The imbalance collapses in a one-time discharge, then the flow ends. Reset the model to compare with balance.'
        : `${rubs === 1 ? 'One electron marker moved' : `${rubs} electron markers moved`} from the wool pad to the insulated vane. The pad is short of electrons (+), while the vane has extras (−).`,
      rubs >= 4 ? 'spark' : 'motion',
      false,
    );
  }
  if (action.type === 'reset-vane' && values.sparked) {
    values.rubs = 0;
    values.sparked = false;
    values.resetObserved = true;
    return changed(state, values, 'Both objects are near balance again. With no source maintaining the separation and no closed loop, there is no maintained current after the spark.', 'success', true);
  }
  return state;
}

function reduceConverter(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'rotate-rectifier') {
      if (!values.testedWrong) {
        return changed(state, values, 'Probe the broken line first. The trace will show what the reversed rectifier does before you repair it.', 'idle', false);
      }
      values.rectifier = 'ready';
      return changed(state, values, 'The rectifier now faces the right way. Probe again to see whether reversing AC has become one-direction output.', 'motion', false);
    }
    if (action.type === 'install-capacitor') {
      if (!values.rectificationSeen) {
        return changed(state, values, 'Probe the repaired rectifier before adding the capacitor. First make the one-direction pulses visible.', 'idle', false);
      }
      values.capacitorInstalled = true;
      values.wave = 'unregulated';
      return changed(state, values, 'The capacitor stores charge near each peak and releases it into the dips. The ripple becomes smaller. Probe the full line to let regulation finish the job.', 'motion', false);
    }
    if (action.type === 'probe-converter') {
      if (values.rectifier === 'reversed') {
        values.testedWrong = true;
        values.wave = 'blocked-reversal';
        return changed(state, values, 'Stage 1 adjusts the voltage range, but the signal still reverses. Stage 2 is facing the wrong way, so part of the signal is blocked instead of being flipped upward.', 'fault', false);
      }
      if (!values.capacitorInstalled) {
        values.rectificationSeen = true;
        values.wave = 'pulsing-dc';
        return changed(state, values, 'The rectifier flips each negative half upward. Current now keeps one direction, but it arrives in separated pulses with deep dips between them.', 'motion', false);
      }
      values.wave = 'steady-dc';
      return changed(state, values, 'The rectifier makes one-direction pulses, the capacitor fills the dips, and the regulator holds the target. The simplified radio now receives steady DC.', 'success', true);
    }
    return state;
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'choose-adapter') {
      values.adapter = String(action.value);
      values.testedGood = false;
      values.lastTested = '';
      return changed(state, values, 'Read the selected adapter output against all five radio requirements, then test the protected coupling gate.', 'motion', false);
    }
    if (action.type === 'test-adapter') {
      const adapter = String(values.adapter);
      const good = adapter === '5v-2a';
      values.testedGood = good;
      values.lastTested = adapter;
      if (!good) values.testedBad = true;
      const reasons: Record<string, string> = {
        '9v-2a': 'Voltage comparison fails: the radio needs 5 V, while this adapter provides 9 V. The same barrel plug does not make that safe.',
        '5v-0.5a': 'Current-capacity comparison fails: the radio may need 1 A, while this adapter can provide only 0.5 A.',
        '5v-2a-negative': 'Polarity comparison fails: the radio needs center positive, while this adapter makes the center pin negative.',
        '5v-2a': 'Every line passes. The output is 5 V DC, the barrel polarity matches, and 2 A is enough capacity. The radio draws what it needs; the adapter does not force 2 A.',
      };
      const solved = good && Boolean(values.testedBad);
      return changed(state, values, good ? `${reasons[adapter]} The protected gate energizes the radio.` : `${reasons[adapter]} The protected gate refuses to energize the radio.`, good ? 'success' : 'fault', solved);
    }
    return state;
  }
  if (action.type === 'connect-usbc') {
    if (values.connected) return state;
    values.connected = true;
    values.defaultSeen = true;
    values.voltage = 5;
    return changed(state, values, 'The USB-C plugs match and power starts at default 5 V. The connector shape has not chosen 9 V. Next, let the charger advertise its supported modes.', 'motion', false);
  }
  if (action.type === 'send-pd-offer') {
    if (!values.connected) return changed(state, values, 'Connect first. Negotiation messages need a live USB-C link, and the link begins at default 5 V.', 'idle', false);
    if (values.offerSent) return state;
    values.offerSent = true;
    return changed(state, values, 'Offer sent: the charger announces that it supports 5 V and 9 V. Output stays at 5 V because the radio has not requested a mode yet.', 'motion', false);
  }
  if (action.type === 'send-pd-request') {
    if (!values.connected) return changed(state, values, 'Connect first. The radio cannot request a mode before the USB-C link exists.', 'idle', false);
    if (!values.offerSent) return changed(state, values, 'The charger must advertise its supported modes before the radio can choose one.', 'idle', false);
    if (values.requestSent) return state;
    values.requestSent = true;
    return changed(state, values, 'Request sent: the radio asks for the offered 9 V mode. Output remains at default 5 V until the charger accepts.', 'motion', false);
  }
  if (action.type === 'accept-pd-request') {
    if (!values.requestSent) return changed(state, values, 'The charger needs a valid 9 V request before it can accept and raise the output.', 'idle', false);
    values.negotiated = true;
    values.voltage = 9;
    return changed(state, values, 'The charger accepts the shared 9 V mode, then raises its output. Agreement came before higher voltage.', 'success', true);
  }
  return state;
}

function alternatingStroke(values: Record<string, unknown>, direction: string) {
  const last = String(values.lastDirection ?? '');
  values.lastDirection = direction;
  return direction !== last;
}

function reduceWind(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'observe-still') values.stillObserved = true;
    if (action.type === 'crank') {
      if (alternatingStroke(values, String(action.value))) values.strokes = Number(values.strokes ?? 0) + 1;
      values.voltage = Math.min(1, Number(values.strokes) / 4);
    }
    const solved = Boolean(values.stillObserved) && Number(values.strokes) >= 4;
    const feedback = action.type === 'observe-still'
      ? 'The magnet is inside the coil, but the flux is steady. The voltage trace falls to zero.'
      : `The moving magnet changes flux. ${Number(values.strokes)} alternating crank strokes have produced voltage pulses.`;
    return changed(state, values, solved ? 'Still field, no sustained voltage. Repeated relative motion, repeated induced voltage.' : feedback, solved ? 'success' : 'motion', solved);
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'connect-loop') {
      if (!values.openVoltageSeen) {
        return changed(state, values, 'Run the open-gap test first. Crank while the copper bridge is missing so you can see voltage appear without sustained loop current.', 'idle', false);
      }
      if (values.loopClosed) return state;
      values.loopClosed = true;
      values.voltageActive = false;
      return changed(state, values, 'The copper bridge closes the loop. It does not create voltage or light by itself. Crank the same generator again so induced voltage can push current around the complete path.', 'motion', false);
    }
    if (action.type === 'crank') {
      alternatingStroke(values, String(action.value));
      values.voltageActive = true;
      if (values.loopClosed) {
        values.currentSeen = true;
      } else {
        values.openVoltageSeen = true;
      }
    }
    const solved = Boolean(values.openVoltageSeen) && Boolean(values.currentSeen);
    const feedback = values.loopClosed
      ? 'Closed-loop run recorded. Changing flux still creates voltage, and the complete path now lets that voltage push current through the lamp. Same generator, one changed part: the bridge.'
      : 'Open-gap run recorded. Changing flux creates voltage across the two wire ends. The gap stops charge from circulating, so current stays at zero and the lamp stays off.';
    return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
  }
  if (action.type === 'set-load') {
    values.load = String(action.value);
    values.steadyStrokes = 0;
  }
  if (action.type === 'crank') {
    const alternated = alternatingStroke(values, String(action.value));
    if (values.load === 'heavy') values.heavyTried = true;
    if (values.load === 'balanced' && alternated) values.steadyStrokes = Number(values.steadyStrokes ?? 0) + 1;
  }
  const solved = Boolean(values.heavyTried) && Number(values.steadyStrokes) >= 4;
  const feedback = values.load === 'heavy'
    ? 'The heavy electrical load creates strong counter-torque. The crank advances only a little for each effort.'
    : values.load === 'balanced'
      ? `The load still pushes back, but you can sustain it. Steady strokes: ${Number(values.steadyStrokes)} of 4.`
      : 'The light load is easy to turn, but it transfers little useful power.';
  return changed(state, values, solved ? 'The generator settles into dynamic balance. The lamp receives power only while you keep supplying mechanical work.' : feedback, solved ? 'success' : 'motion', solved);
}

function reduceLongline(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'set-line-voltage') values.voltage = String(action.value);
    if (action.type === 'dispatch') {
      const high = values.voltage === 'high';
      values.current = high ? 1 : 4;
      values.heat = high ? 1 : 16;
      if (high) {
        values.highSeen = true;
        values.highCurrent = 1;
        values.highHeat = 1;
      } else {
        values.lowSeen = true;
        values.lowCurrent = 4;
        values.lowHeat = 16;
      }
    }
    const solved = Boolean(values.lowSeen) && Boolean(values.highSeen);
    const feedback = action.type === 'dispatch'
      ? values.voltage === 'high'
        ? 'The same delivery rides on fewer current packets. The long wire stays much cooler.'
        : 'The same delivery needs many current packets. Heat blooms along the resistive line.'
      : 'Choose the line configuration and dispatch the same fixed town load.';
    return changed(state, values, solved ? 'The cargo stayed comparable. Raising voltage lowered current, and the current-squared heat fell sharply.' : feedback, solved ? 'success' : values.voltage === 'low' ? 'fault' : 'motion', solved);
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'set-source') values.source = String(action.value);
    if (action.type === 'set-step-up') values.stepUp = String(action.value);
    if (action.type === 'set-step-down') values.stepDown = String(action.value);
    if (action.type === 'energize-chain') {
      if (values.source === 'dc') values.testedDc = true;
      const good = values.source === 'ac' && values.stepUp === 'up' && values.stepDown === 'down';
      values.energized = good;
      const solved = good && Boolean(values.testedDc);
      const feedback = values.source === 'dc'
        ? 'Steady DC gives one brief magnetic change, then the secondary voltage fades. The train does not keep moving.'
        : values.stepUp !== 'up'
          ? 'The first coil ratio points the wrong way. The line receives lower voltage and higher current.'
          : values.stepDown !== 'down'
            ? 'The town-side transformer is missing or reversed. The travel voltage is not suitable for the town model.'
            : 'Changing AC flux links both coils. Voltage rises before travel and falls again beside town.';
      return changed(state, values, feedback, good ? 'success' : 'fault', solved);
    }
    return changed(state, values, 'The source and coil cartridges are in place. Energize the chain to see what they cause.', 'motion', false);
  }
  if (action.type === 'set-route') values.route = String(action.value);
  if (action.type === 'dispatch') {
    const safe = values.route === 'transformed';
    if (safe) values.safeSeen = true;
    else values.hotSeen = true;
    values.townLit = safe;
  }
  const solved = Boolean(values.hotSeen) && Boolean(values.safeSeen);
  const feedback = action.type === 'dispatch'
    ? values.route === 'transformed'
      ? 'Power crosses the cool high-voltage line with lower current, then the town-side transformer lowers voltage for the model lights.'
      : 'The low-voltage route makes the line glow with wasted heat before enough delivery reaches town.'
    : 'Choose a route for the fixed delivery, then send the train.';
  return changed(state, values, solved ? 'The complete chain keeps the long line cool and gives the town a usable final voltage.' : feedback, solved ? 'success' : values.route === 'low' ? 'fault' : 'motion', solved);
}

const energyFactorOptions: Record<string, number[]> = {
  leftPower: [100, 500, 1000],
  leftHours: [1, 2, 10],
  rightPower: [100, 500, 1000],
  rightHours: [1, 2, 10],
};

const marketPlans: Record<string, { brightness: number; power: number; label: string }> = {
  efficient: { brightness: 2, power: 200, label: 'Two efficient lantern strings' },
  mixed: { brightness: 4, power: 400, label: 'Market sign plus four lantern strings' },
  warm: { brightness: 3, power: 500, label: 'Three filament feature lamps' },
  dim: { brightness: 1, power: 100, label: 'One dim guide string' },
};

function scheduleResult(schedule: Record<string, string>) {
  const periods = [
    { id: 'dusk', label: 'Dusk', hours: 1, need: 2 },
    { id: 'peak', label: 'Peak market', hours: 2, need: 4 },
    { id: 'closing', label: 'Closing', hours: 1, need: 2 },
  ];
  const results = periods.map((period) => {
    const plan = marketPlans[schedule[period.id]];
    const power = plan?.power ?? 0;
    return {
      ...period,
      planId: schedule[period.id],
      plan,
      power,
      brightness: plan?.brightness ?? 0,
      energy: power * period.hours,
    };
  });
  const brightness = results.map((period) => period.brightness);
  const energy = results.reduce((sum, period) => sum + period.energy, 0);
  const valid = results.every((period) => period.brightness >= period.need) && energy <= 1200;
  return { brightness, energy, valid, results };
}

function reduceLantern(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'set-energy-factor') {
      const factor = String(action.secondary);
      const nextValue = Number(action.value);
      if (energyFactorOptions[factor]?.includes(nextValue)) values[factor] = nextValue;
    }
    const leftPower = Number(values.leftPower ?? 0);
    const leftHours = Number(values.leftHours ?? 0);
    const rightPower = Number(values.rightPower ?? 0);
    const rightHours = Number(values.rightHours ?? 0);
    const leftEnergy = leftPower * leftHours;
    const rightEnergy = rightPower * rightHours;
    values.leftEnergy = leftEnergy;
    values.rightEnergy = rightEnergy;
    const differentSetup = leftPower !== rightPower || leftHours !== rightHours;
    const solved = leftEnergy > 0 && leftEnergy === rightEnergy && differentSetup;
    const equations = `${leftPower} W × ${leftHours} h = ${leftEnergy} Wh; ${rightPower} W × ${rightHours} h = ${rightEnergy} Wh.`;
    const feedback = solved
      ? `${equations} The different evenings both accumulate ${leftEnergy} Wh.`
      : leftEnergy === rightEnergy
        ? `${equations} The totals match, but the two setups are identical. Change power or runtime while preserving equal Wh.`
        : `${equations} The totals differ by ${Math.abs(leftEnergy - rightEnergy)} Wh. Adjust a rate or runtime and watch the multiplication change.`;
    return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
  }
  if (state.phaseIndex === 1) {
    const schedule = asRecord(values.schedule);
    const editAction = action.type === 'select-market-plan' || action.type === 'place-market-period' || action.type === 'set-market-plan';
    if (editAction && !values.testedStart) {
      return changed(state, values, 'Run the starting market first. Watch which period misses its brightness target, then repair that cause.', 'idle', false);
    }
    if (action.type === 'select-market-plan' && marketPlans[String(action.value)]) {
      values.selectedPlan = String(action.value);
      values.testedGood = false;
    }
    if (action.type === 'place-market-period') {
      const period = String(action.value);
      const plan = String(values.selectedPlan ?? '');
      if (['dusk', 'peak', 'closing'].includes(period) && marketPlans[plan]) schedule[period] = plan;
      values.testedGood = false;
    }
    if (action.type === 'set-market-plan') {
      const period = String(action.secondary);
      const plan = String(action.value);
      if (['dusk', 'peak', 'closing'].includes(period) && marketPlans[plan]) schedule[period] = plan;
      values.testedGood = false;
    }
    values.schedule = schedule;
    const result = scheduleResult(schedule);
    values.energy = result.energy;
    values.brightness = result.brightness;
    if (action.type === 'test-market-schedule') {
      values.testedStart = true;
      values.testedGood = result.valid;
    }
    const failedPeriod = result.results.find((period) => period.brightness < period.need);
    const equationSummary = result.results
      .map((period) => `${period.power} W × ${period.hours} h = ${period.energy} Wh`)
      .join('; ');
    const solved = Boolean(values.testedGood);
    const feedback = solved
      ? `${equationSummary}. Every brightness target is met, and the three receipts add to ${result.energy} Wh.`
      : action.type === 'test-market-schedule' && failedPeriod
        ? `${failedPeriod.label} needs brightness ${failedPeriod.need}, but ${failedPeriod.plan?.label ?? 'the empty plan'} provides ${failedPeriod.brightness}. Its receipt is ${failedPeriod.power} W × ${failedPeriod.hours} h = ${failedPeriod.energy} Wh. Choose a plan that meets the light need, then rerun the night.`
        : action.type === 'test-market-schedule' && result.energy > 1200
          ? `${equationSummary}. Brightness is sufficient, but ${result.energy} Wh exceeds the 1200 Wh night budget.`
          : values.testedStart
            ? `${equationSummary}. Planned total: ${result.energy} Wh. Rerun the market to test brightness and budget together.`
            : 'Run the underlit starting market before changing any lamp plan.';
    return changed(state, values, feedback, solved ? 'success' : action.type === 'test-market-schedule' ? 'fault' : 'motion', solved);
  }
  if (action.type === 'advance-period' && Number(values.period) < 3) {
    const periods = [
      { label: 'Dusk', power: 200, hours: 1 },
      { label: 'Peak market', power: 400, hours: 2 },
      { label: 'Closing', power: 200, hours: 1 },
    ];
    const period = Number(values.period);
    const current = periods[period];
    const added = current.power * current.hours;
    const energy = Number(values.energy ?? 0) + added;
    const receipts = Array.isArray(values.receipts) ? [...values.receipts] : [];
    receipts.push({
      label: current.label,
      power: current.power,
      hours: current.hours,
      added,
      total: energy,
    });
    values.power = period === periods.length - 1 ? 0 : current.power;
    values.energy = energy;
    values.cost = energy / 1000 * 0.18;
    values.lastPower = current.power;
    values.lastDuration = current.hours;
    values.lastAdded = added;
    values.lastLabel = current.label;
    values.receipts = receipts;
    values.period = period + 1;
  }
  const solved = Number(values.period) >= 3;
  const feedback = solved
    ? `${Number(values.lastPower)} W × ${Number(values.lastDuration)} h = ${Number(values.lastAdded)} Wh for Closing. Market is off now at 0 W. The accumulator keeps ${Number(values.energy)} Wh = ${(Number(values.energy) / 1000).toFixed(3)} kWh; ${(Number(values.energy) / 1000).toFixed(3)} kWh × $0.18 = $${Number(values.cost).toFixed(2)} model cost.`
    : Number(values.period) > 0
      ? `${String(values.lastLabel)} ran at ${Number(values.lastPower)} W for ${Number(values.lastDuration)} h: ${Number(values.lastPower)} W × ${Number(values.lastDuration)} h = ${Number(values.lastAdded)} Wh. The accumulator now holds ${Number(values.energy)} Wh.`
      : 'Run Dusk first. Its watt rate and runtime will create the first Wh receipt.';
  return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
}

function reduceHarbor(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'set-layer') values[String(action.secondary)] = String(action.value);
    if (action.type === 'run-normal') values.observedNormal = true;
    const ready = values.conductor === 'copper' && values.insulation === 'jacket' && values.ground === 'ground';
    const solved = ready && Boolean(values.observedNormal);
    const feedback = action.type === 'run-normal'
      ? ready
        ? 'Current follows copper to the load and returns on neutral. The jacket contains the path. Ground remains visibly quiet.'
        : 'The model refuses normal service because one layer cannot do the job assigned to it.'
      : 'Fit one material into each layer, then run the normal path.';
    return changed(state, values, solved ? 'Normal service proves the intended loop and the quiet emergency path have different jobs.' : feedback, solved ? 'success' : ready ? 'motion' : 'fault', solved);
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'install-protection') values[String(action.value)] = true;
    if (action.type === 'select-fault') values.fault = String(action.value);
    const observed = stringArray(values.observed);
    if (action.type === 'inject-fault') {
      const fault = String(values.fault);
      const protectedNow = (fault === 'leakage' && values.gfci) || (fault !== 'leakage' && values.breaker);
      if (protectedNow && !observed.includes(fault)) observed.push(fault);
      values.observed = observed;
      values.damaged = true;
    }
    if (action.type === 'repair-cable' && values.damaged) {
      values.damaged = false;
      values.repaired = true;
    }
    const solved = ['overload', 'short', 'leakage'].every((fault) => observed.includes(fault)) && Boolean(values.repaired);
    const feedback = action.type === 'inject-fault'
      ? values.fault === 'leakage'
        ? values.gfci ? 'Live and neutral stop balancing. The GFCI/RCD opens on leakage before the breaker sees a large overcurrent.' : 'Leakage leaves the normal loop, but no imbalance watcher is installed.'
        : values.breaker ? `The ${values.fault} creates too much current. The breaker opens the branch.` : 'Current rises, but no overcurrent watcher is installed.'
      : action.type === 'repair-cable'
        ? 'The damaged model cable is replaced after isolation. A trip alone did not remove the fault.'
        : 'Install the protection layers, select a model fault, and inject it.';
    return changed(state, values, solved ? 'You separated amount faults from balance faults, then repaired the cause before restoring service.' : feedback, solved ? 'success' : action.type === 'inject-fault' ? 'fault' : 'motion', solved);
  }
  const chain = stringArray(values.chain);
  const homes = numberArray(values.homes);
  if (action.type === 'select-grid-piece') values.selectedPiece = String(action.value);
  if (action.type === 'place-grid-piece') chain[Number(action.value)] = String(values.selectedPiece ?? '');
  if (action.type === 'drop-grid-piece') chain[Number(action.secondary)] = String(action.value ?? '');
  if (action.type === 'change-home') {
    const index = Number(action.secondary);
    homes[index] = Math.max(0, Math.min(3, homes[index] + Number(action.value)));
  }
  if (action.type === 'set-capacity') values.capacity = Number(action.value);
  values.chain = chain;
  values.homes = homes;
  const chainReady = chain.join('|') === 'substation|feeder|transformer|service';
  const total = homes.reduce((sum, value) => sum + value, 0);
  values.total = total;
  if (action.type === 'send-feeder') {
    if (chainReady && total > Number(values.capacity)) values.overloadSeen = true;
    if (chainReady && total <= Number(values.capacity) - 1) values.balanced = true;
  }
  const solved = chainReady && Boolean(values.overloadSeen) && Boolean(values.balanced);
  const feedback = action.type === 'send-feeder'
    ? !chainReady
      ? 'The distribution chain has a missing or misplaced handoff, so service cannot reach the homes.'
      : total > Number(values.capacity)
        ? `The three branches ask for ${total} load tokens together, above feeder capacity ${Number(values.capacity)}. Overcurrent protection opens.`
        : `Each branch keeps its own current, while the feeder carries their combined ${total} tokens with ${Number(values.capacity) - total} token of margin.`
    : 'Build the chain, change the appliances inside each home, and send the combined demand through the feeder.';
  return changed(state, values, solved ? 'The repaired chain now serves changing local loads while the shared feeder keeps visible margin.' : feedback, solved ? 'success' : action.type === 'send-feeder' && total > Number(values.capacity) ? 'fault' : 'motion', solved);
}

export function reduceStationChallenge(
  state: StationChallengeState,
  action: StationChallengeAction,
): StationChallengeState {
  switch (state.district) {
    case 'workshop': return reduceWorkshop(state, action);
    case 'converter': return reduceConverter(state, action);
    case 'wind': return reduceWind(state, action);
    case 'longline': return reduceLongline(state, action);
    case 'lantern': return reduceLantern(state, action);
    case 'harbor': return reduceHarbor(state, action);
  }
}

export function currentChallengePhase(state: StationChallengeState): ChallengePhaseDefinition {
  return challengeDefinitions[state.district].phases[state.phaseIndex];
}

export function phaseIdAt(district: DistrictId, index: number): string {
  return challengeDefinitions[district].phases[index]?.id ?? challengeDefinitions[district].phases[2].id;
}

export function isChallengeComplete(completedPhaseIds: readonly string[], district: DistrictId): boolean {
  return challengeDefinitions[district].phases.every((phase) => completedPhaseIds.includes(phase.id));
}

export function getStationChallengeMetrics(state: StationChallengeState): Partial<Record<'voltage' | 'current' | 'power' | 'energy' | 'heat' | 'leakage', number>> {
  const values = state.values;
  switch (state.district) {
    case 'workshop':
      return state.phaseIndex === 0
        ? { voltage: 0.45, current: state.solved ? 0.62 : 0, power: state.solved ? 0.48 : 0, heat: state.solved ? 0.12 : 0 }
        : state.phaseIndex === 1
          ? { voltage: Number(values.cells ?? 1) * 0.42, current: Number(values.current ?? 0), power: Number(values.current ?? 0) * Number(values.cells ?? 1), heat: Number(values.heat ?? 0) }
          : { voltage: Number(values.rubs ?? 0) / 4, current: values.sparked ? 1 : 0, power: values.sparked ? 0.85 : 0, energy: Number(values.rubs ?? 0) / 4, heat: 0 };
    case 'converter': {
      const wave = String(values.wave ?? 'reversing');
      const stable = wave === 'steady-dc';
      return state.phaseIndex === 0
        ? { voltage: stable ? 0.5 : 0.7, current: stable ? 0.62 : wave === 'pulsing-dc' ? 0.42 : 0, power: stable ? 0.62 : 0, heat: wave === 'pulsing-dc' ? 0.24 : 0.05 }
        : state.phaseIndex === 1
          ? { voltage: values.testedGood ? 0.5 : 0, current: values.testedGood ? 0.65 : 0, power: values.testedGood ? 0.62 : 0, heat: 0.04 }
          : { voltage: values.negotiated ? 0.75 : 0.42, current: values.negotiated ? 0.7 : 0.35, power: values.negotiated ? 0.78 : 0.28, heat: 0.04 };
    }
    case 'wind':
      return state.phaseIndex === 0
        ? { voltage: Number(values.voltage ?? 0), current: 0, power: 0, heat: 0 }
        : state.phaseIndex === 1
          ? { voltage: values.openVoltageSeen || values.currentSeen ? 0.72 : 0, current: values.currentSeen ? 0.58 : 0, power: values.currentSeen ? 0.55 : 0, heat: 0.04 }
          : { voltage: 0.78, current: values.load === 'heavy' ? 0.92 : values.load === 'balanced' ? 0.64 : 0.28, power: values.load === 'heavy' ? 0.82 : values.load === 'balanced' ? 0.62 : 0.22, heat: values.load === 'heavy' ? 0.4 : 0.08 };
    case 'longline':
      return state.phaseIndex === 0
        ? { voltage: values.voltage === 'high' ? 1 : 0.25, current: Number(values.current ?? 0) / 4, power: 0.75, heat: Number(values.heat ?? 0) / 16 }
        : state.phaseIndex === 1
          ? { voltage: values.energized ? 1 : 0.25, current: values.energized ? 0.25 : 0, power: values.energized ? 0.75 : 0, heat: values.energized ? 0.05 : 0.2 }
          : { voltage: values.route === 'transformed' ? 1 : 0.25, current: values.route === 'transformed' ? 0.25 : 1, power: values.townLit ? 0.75 : 0.48, heat: values.route === 'transformed' ? 0.05 : 0.9 };
    case 'lantern':
      return state.phaseIndex === 0
        ? {
            power: Math.max(Number(values.leftPower ?? 0), Number(values.rightPower ?? 0)) / 1000,
            energy: Math.max(Number(values.leftEnergy ?? 0), Number(values.rightEnergy ?? 0)) / 1000,
          }
        : state.phaseIndex === 1
          ? { voltage: 0.7, current: Number(values.energy ?? 0) / 1200, power: Math.max(...numberArray(values.brightness), 0) / 4, energy: Number(values.energy ?? 0) / 1200, heat: 0.16 }
          : { voltage: 0.7, current: Number(values.power ?? 0) / 400, power: Number(values.power ?? 0) / 400, energy: Number(values.energy ?? 0) / 1200, heat: 0.12 };
    case 'harbor':
      return state.phaseIndex === 0
        ? { voltage: 0.72, current: values.observedNormal ? 0.55 : 0, power: values.observedNormal ? 0.55 : 0, heat: 0.08, leakage: values.insulation === 'jacket' ? 0.01 : 0.5 }
        : state.phaseIndex === 1
          ? { voltage: values.damaged ? 0 : 0.72, current: values.fault === 'short' ? 1 : values.fault === 'overload' ? 0.85 : 0.34, power: values.damaged ? 0 : 0.52, heat: values.fault === 'leakage' ? 0.08 : 0.72, leakage: values.fault === 'leakage' ? 0.68 : 0.02 }
          : { voltage: 0.72, current: Number(values.total ?? 3) / 5, power: Math.min(1, Number(values.total ?? 3) / 5), heat: Number(values.total ?? 3) > Number(values.capacity ?? 3) ? 0.82 : 0.18, leakage: 0.01 };
  }
}
