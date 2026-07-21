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
        instruction: 'Swap cell stacks and coil spools, then pulse the same loop. Record a baseline, more push, and more resistance.',
        proof: 'The same coil carries more current with more source push. A larger coil limits current with the source unchanged.',
      },
      {
        id: 'spark-reset',
        eyebrow: 'Bench 3 of 3',
        title: 'Build an imbalance, then watch it vanish.',
        instruction: 'Rub the wool pad across the storm vane until the gap can no longer hold the separated charge. Then reset the vane.',
        proof: 'Static charge builds, sparks once, and returns toward balance. It is not a maintained loop current.',
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
        instruction: 'Repair the four-module conveyor. Missing and reversed modules leave a recognizable trace in the output wave.',
        proof: 'Adjust, rectify, smooth, and regulate are separate causes with separate visible consequences.',
      },
      {
        id: 'match-label',
        eyebrow: 'Dock line 2 of 3',
        title: 'Power the radio without trusting the plug shape.',
        instruction: 'Test one unsafe module at the protected bench, then couple an output whose label actually fits the radio.',
        proof: 'Voltage and type match exactly. Capacity may be higher, while connector and polarity still have to match.',
      },
      {
        id: 'negotiate-output',
        eyebrow: 'Dock line 3 of 3',
        title: 'Let USB-C agree before power rises.',
        instruction: 'Try the simple cable, then fit the rated cable and let the charger and radio negotiate a shared mode.',
        proof: 'The connector alone does not choose a higher voltage. Compatible endpoints negotiate first.',
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
        title: 'Separate voltage from current.',
        instruction: 'Crank once with open terminals, then connect the lamp and crank again.',
        proof: 'Open terminals can show induced voltage. A closed path is needed for current and useful lamp power.',
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
        title: 'Balance two very different evenings.',
        instruction: 'Place one power-and-time card on each side of the scale so both sides transfer the same total energy.',
        proof: 'Different power rates and durations can accumulate the same watt-hours.',
      },
      {
        id: 'schedule-market',
        eyebrow: 'Market 2 of 3',
        title: 'Light dusk, peak, and closing.',
        instruction: 'Place a lamp plan in each time window. Meet the changing brightness need without exceeding the night budget.',
        proof: 'Instant power changes with simultaneous lamps. Energy depends on both that power and how long it runs.',
      },
      {
        id: 'replay-evening',
        eyebrow: 'Market 3 of 3',
        title: 'Run the night and watch energy accumulate.',
        instruction: 'Advance through all three market periods. The power stack changes immediately while the energy ribbon only grows.',
        proof: 'Watts are the current rate. Wh, kWh, and model cost accumulate across the timeline.',
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
    () => ({ modules: ['adjust', 'rectifier-reversed', '', 'regulate'], selectedModule: 'smooth', testedWrong: false, wave: 'reversing' }),
    () => ({ adapter: '9v-2a', testedBad: false, testedGood: false }),
    () => ({ cable: 'charge-only', testedBad: false, negotiated: false }),
  ],
  wind: [
    () => ({ stillObserved: false, strokes: 0, lastDirection: '', voltage: 0 }),
    () => ({ loopClosed: false, openVoltageSeen: false, currentSeen: false, lastDirection: '' }),
    () => ({ load: 'heavy', heavyTried: false, steadyStrokes: 0, lastDirection: '' }),
  ],
  longline: [
    () => ({ voltage: 'low', lowSeen: false, highSeen: false, current: 0, heat: 0 }),
    () => ({ source: 'dc', stepUp: 'reversed', stepDown: 'missing', testedDc: false, energized: false }),
    () => ({ route: 'low', hotSeen: false, safeSeen: false, townLit: false }),
  ],
  lantern: [
    () => ({ leftCard: '', rightCard: '', selectedCard: '1000w-1h' }),
    () => ({ schedule: { dusk: 'efficient', peak: 'dim', closing: 'efficient' }, selectedPlan: 'mixed', energy: 5, brightness: [2, 1, 2] }),
    () => ({ period: 0, energy: 0, power: 0, cost: 0 }),
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
      const code = cells === 1 && coil === 'medium' ? 'baseline' : cells === 2 && coil === 'medium' ? 'push' : cells === 2 && coil === 'high' ? 'resistance' : '';
      if (code && !observations.includes(code)) observations.push(code);
      values.observations = observations;
      const current = cells / (coil === 'low' ? 1 : coil === 'medium' ? 2 : 4);
      values.current = current;
      values.heat = current * current * (coil === 'low' ? 1 : coil === 'medium' ? 2 : 4);
    }
    const solved = ['baseline', 'push', 'resistance'].every((item) => observations.includes(item));
    const feedback = action.type === 'pulse-loop'
      ? `The current markers now cross ${Number(values.current ?? 0).toFixed(2)} loop lengths per beat. Compare this trace with the cards already pinned.`
      : 'Fit a cell stack and coil spool, then pulse the completed loop.';
    return changed(state, values, solved ? 'You recorded the baseline, raised push with the same coil, then raised resistance with the source unchanged.' : feedback, solved ? 'success' : 'motion', solved);
  }
  if (action.type === 'rub-vane') {
    const rubs = Math.min(4, Number(values.rubs ?? 0) + 1);
    values.rubs = rubs;
    values.sparked = rubs >= 4;
    return changed(
      state,
      values,
      rubs >= 4 ? 'The gap flashes once. The separated charge rushes toward balance, then the spark ends.' : `Charge marks separate across the vane. Buildup is ${rubs} of 4.`,
      rubs >= 4 ? 'spark' : 'motion',
      false,
    );
  }
  if (action.type === 'reset-vane' && values.sparked) {
    values.rubs = 0;
    values.sparked = false;
    values.resetObserved = true;
    return changed(state, values, 'The vane is near balance again. Unlike the lamp loop, no maintained current continues after the spark.', 'success', true);
  }
  return state;
}

function reduceConverter(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    const modules = stringArray(values.modules);
    if (action.type === 'select-module') values.selectedModule = String(action.value ?? '');
    if (action.type === 'place-module') modules[Number(action.value)] = String(values.selectedModule ?? '');
    if (action.type === 'drop-module') modules[Number(action.secondary)] = String(action.value ?? '');
    if (action.type === 'rotate-module') {
      const index = Number(action.value);
      if (modules[index] === 'rectifier-reversed') modules[index] = 'rectify';
      else if (modules[index] === 'rectify') modules[index] = 'rectifier-reversed';
    }
    values.modules = modules;
    if (action.type === 'run-wave') {
      const correct = modules.join('|') === 'adjust|rectify|smooth|regulate';
      if (!correct) values.testedWrong = true;
      values.wave = correct ? 'steady-dc' : modules.includes('rectifier-reversed') ? 'blocked-reversal' : modules.includes('rectify') ? modules.includes('smooth') ? 'unregulated' : 'pulsing-dc' : 'reversing';
      const solved = correct && Boolean(values.testedWrong);
      return changed(state, values, correct ? 'The wave changes range, becomes one-direction pulses, fills its dips, and settles at the target.' : 'The output trace exposes the missing or reversed stage. The radio stays isolated.', correct ? 'success' : 'fault', solved);
    }
    return changed(state, values, 'The conveyor has changed. Run a test wave to see what each stage actually does.', 'motion', false);
  }
  if (state.phaseIndex === 1) {
    if (action.type === 'choose-adapter') values.adapter = String(action.value);
    if (action.type === 'test-adapter') {
      const adapter = String(values.adapter);
      const good = adapter === '5v-2a';
      values.testedGood = good;
      if (!good) values.testedBad = true;
      const reasons: Record<string, string> = {
        '9v-2a': 'Voltage is too high, even though the connector fits.',
        '5v-0.5a': 'Voltage and polarity match, but current capacity is too small.',
        '5v-2a-negative': 'Voltage and capacity match, but polarity is opposite.',
        '5v-2a': '5 V DC matches exactly, 2 A is sufficient capacity, and connector polarity matches.',
      };
      const solved = good && Boolean(values.testedBad);
      return changed(state, values, good ? `${reasons[adapter]} The protected gate energizes the radio.` : `${reasons[adapter]} The protected gate refuses to energize the radio.`, good ? 'success' : 'fault', solved);
    }
    return changed(state, values, 'The selected output label is under the inspection lamp. Test it against the radio input.', 'motion', false);
  }
  if (action.type === 'choose-cable') values.cable = String(action.value);
  if (action.type === 'negotiate') {
    const good = values.cable === 'pd-rated';
    if (!good) values.testedBad = true;
    values.negotiated = good;
    const solved = good && Boolean(values.testedBad);
    return changed(state, values, good ? 'Both endpoints advertise a shared 9 V mode. Only then does the charger raise its output.' : 'This cable carries basic 5 V only. The charger refuses the higher mode instead of guessing.', good ? 'success' : 'fault', solved);
  }
  return changed(state, values, 'Fit a cable between the endpoints, then ask them to negotiate.', 'motion', false);
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
    if (action.type === 'connect-loop') values.loopClosed = !Boolean(values.loopClosed);
    if (action.type === 'crank') {
      alternatingStroke(values, String(action.value));
      if (values.loopClosed) values.currentSeen = true;
      else values.openVoltageSeen = true;
    }
    const solved = Boolean(values.openVoltageSeen) && Boolean(values.currentSeen);
    const feedback = action.type === 'crank'
      ? values.loopClosed
        ? 'Voltage still appears, and the closed path now carries current through the lamp.'
        : 'The terminal meter jumps with induced voltage, but the open lamp path carries no sustained current.'
      : values.loopClosed ? 'The lamp loop is connected. Crank again.' : 'The terminal gap is open. Crank to test voltage without load current.';
    return changed(state, values, solved ? 'You observed voltage at open terminals, then current and light only after closing the path.' : feedback, solved ? 'success' : 'motion', solved);
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

const energyCards: Record<string, number> = {
  '1000w-1h': 1000,
  '100w-10h': 1000,
  '500w-1h': 500,
  '50w-4h': 200,
};

const marketPlans: Record<string, { brightness: number; energy: number; power: number; label: string }> = {
  efficient: { brightness: 2, energy: 2, power: 2, label: 'Two efficient lantern strings' },
  mixed: { brightness: 4, energy: 4, power: 4, label: 'Warm sign plus efficient strings' },
  warm: { brightness: 3, energy: 5, power: 5, label: 'Warm filament feature lamps' },
  dim: { brightness: 1, energy: 1, power: 1, label: 'One dim guide string' },
};

function scheduleResult(schedule: Record<string, string>) {
  const periods = ['dusk', 'peak', 'closing'];
  const brightness = periods.map((period) => marketPlans[schedule[period]]?.brightness ?? 0);
  const energy = periods.reduce((sum, period) => sum + (marketPlans[schedule[period]]?.energy ?? 0), 0);
  const valid = brightness[0] >= 2 && brightness[1] >= 4 && brightness[2] >= 2 && energy <= 10 && Object.values(schedule).some((plan) => plan !== 'efficient');
  return { brightness, energy, valid };
}

function reduceLantern(state: StationChallengeState, action: StationChallengeAction) {
  const values = { ...state.values };
  if (state.phaseIndex === 0) {
    if (action.type === 'select-energy-card') values.selectedCard = String(action.value);
    if (action.type === 'place-energy-side') values[String(action.value)] = String(values.selectedCard ?? '');
    if (action.type === 'place-energy-card') values[String(action.secondary)] = String(action.value);
    const left = String(values.leftCard ?? '');
    const right = String(values.rightCard ?? '');
    const solved = Boolean(left && right && left !== right && energyCards[left] === energyCards[right]);
    const feedback = left && right
      ? solved
        ? `${left.replace('-', ' × ')} and ${right.replace('-', ' × ')} both accumulate ${energyCards[left]} Wh.`
        : `The scale tilts. The left evening transfers ${energyCards[left] ?? 0} Wh and the right transfers ${energyCards[right] ?? 0} Wh.`
      : 'Place one complete power-and-time card on each side of the scale.';
    return changed(state, values, feedback, solved ? 'success' : 'motion', solved);
  }
  if (state.phaseIndex === 1) {
    const schedule = asRecord(values.schedule);
    if (action.type === 'select-market-plan') values.selectedPlan = String(action.value);
    if (action.type === 'place-market-period') schedule[String(action.value)] = String(values.selectedPlan ?? '');
    if (action.type === 'set-market-plan') schedule[String(action.secondary)] = String(action.value);
    values.schedule = schedule;
    const result = scheduleResult(schedule);
    values.energy = result.energy;
    values.brightness = result.brightness;
    const feedback = result.valid
      ? `Every period is bright enough. The plan uses ${result.energy} of 10 energy tokens and keeps a warm feature where it matters.`
      : `Brightness is ${result.brightness.join(', ')} across dusk, peak, and closing. Energy use is ${result.energy} of 10 tokens.`;
    return changed(state, values, feedback, result.valid ? 'success' : result.energy > 10 ? 'fault' : 'motion', result.valid);
  }
  if (action.type === 'advance-period' && Number(values.period) < 3) {
    const powers = [2, 4, 2];
    const durations = [1, 1, 1];
    const period = Number(values.period);
    values.power = powers[period];
    values.energy = Number(values.energy ?? 0) + powers[period] * durations[period];
    values.cost = Number(values.energy) * 0.00018;
    values.period = period + 1;
  }
  const solved = Number(values.period) >= 3;
  const feedback = solved
    ? `The last lamps switch off. The ribbon holds ${Number(values.energy)} Wh, ${(Number(values.energy) / 1000).toFixed(3)} kWh, and $${Number(values.cost).toFixed(4)} model cost.`
    : `Period ${Number(values.period)} of 3 is complete. Instant power can change next, but the ${Number(values.energy)} Wh ribbon does not shrink.`;
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
        ? { power: 0, energy: state.solved ? 1 : 0 }
        : state.phaseIndex === 1
          ? { voltage: 0.7, current: Number(values.energy ?? 0) / 10, power: Math.max(...numberArray(values.brightness), 0) / 4, energy: Number(values.energy ?? 0) / 10, heat: 0.16 }
          : { voltage: 0.7, current: Number(values.power ?? 0) / 4, power: Number(values.power ?? 0) / 4, energy: Number(values.energy ?? 0) / 8, heat: 0.12 };
    case 'harbor':
      return state.phaseIndex === 0
        ? { voltage: 0.72, current: values.observedNormal ? 0.55 : 0, power: values.observedNormal ? 0.55 : 0, heat: 0.08, leakage: values.insulation === 'jacket' ? 0.01 : 0.5 }
        : state.phaseIndex === 1
          ? { voltage: values.damaged ? 0 : 0.72, current: values.fault === 'short' ? 1 : values.fault === 'overload' ? 0.85 : 0.34, power: values.damaged ? 0 : 0.52, heat: values.fault === 'leakage' ? 0.08 : 0.72, leakage: values.fault === 'leakage' ? 0.68 : 0.02 }
          : { voltage: 0.72, current: Number(values.total ?? 3) / 5, power: Math.min(1, Number(values.total ?? 3) / 5), heat: Number(values.total ?? 3) > Number(values.capacity ?? 3) ? 0.82 : 0.18, leakage: 0.01 };
  }
}
