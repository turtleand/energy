import { describe, expect, it } from 'vitest';
import { districts } from '../content/districts';
import {
  challengeDefinitions,
  createStationChallengeState,
  reduceStationChallenge,
  type StationChallengeAction,
  type StationChallengeState,
} from './engine';
import { renderStationChallenge } from './view';

function play(district: (typeof districts)[number]['id'], phase: number, actions: StationChallengeAction[]) {
  return actions.reduce(
    (state, action) => reduceStationChallenge(state, action),
    createStationChallengeState(district, phase),
  );
}

function expectSolved(state: StationChallengeState) {
  expect(state.solved).toBe(true);
  expect(state.effect).toBe('success');
}

describe('station challenge contracts', () => {
  it('defines exactly three lesson-grounded phases for every district without public em dashes', () => {
    for (const district of districts) {
      const definition = challengeDefinitions[district.id];
      expect(definition.phases).toHaveLength(3);
      expect(new Set(definition.phases.map((phase) => phase.id)).size).toBe(3);
      expect(JSON.stringify(definition)).not.toContain('—');
    }
  });

  it('makes Workshop topology, proportionality, and static reset separate recoverable problems', () => {
    const loop = play('workshop', 0, [
      { type: 'select-piece', value: 'lamp' },
      { type: 'place-slot', value: 0 },
      { type: 'select-piece', value: 'source' },
      { type: 'place-slot', value: 0 },
      { type: 'select-piece', value: 'switch' },
      { type: 'place-slot', value: 1 },
      { type: 'select-piece', value: 'resistor' },
      { type: 'place-slot', value: 2 },
      { type: 'select-piece', value: 'lamp' },
      { type: 'place-slot', value: 3 },
      { type: 'select-piece', value: 'return' },
      { type: 'place-slot', value: 4 },
    ]);
    expectSolved(loop);

    const wrongFirstRun = play('workshop', 1, [
      { type: 'set-cells', value: 2 },
      { type: 'pulse-loop' },
    ]);
    expect(wrongFirstRun.values.observations).toEqual([]);
    expect(wrongFirstRun.effect).toBe('idle');
    expect(wrongFirstRun.feedback).toContain('Start with one cell and the medium coil');

    const baseline = play('workshop', 1, [{ type: 'pulse-loop' }]);
    expect(baseline.feedback).toContain('Starting trace recorded');
    expect(baseline.values.observations).toEqual(['baseline']);

    const morePush = reduceStationChallenge(
      reduceStationChallenge(baseline, { type: 'set-cells', value: 2 }),
      { type: 'pulse-loop' },
    );
    expect(morePush.feedback).toContain('Only the source changed');

    const tuning = reduceStationChallenge(
      reduceStationChallenge(morePush, { type: 'set-coil', value: 'high' }),
      { type: 'pulse-loop' },
    );
    expectSolved(tuning);
    expect(tuning.values.observations).toEqual(['baseline', 'push', 'resistance']);
    expect(tuning.feedback).toContain('Only the coil changed');

    const firstRub = play('workshop', 2, [{ type: 'rub-vane' }]);
    expect(firstRub.feedback).toContain('electron marker moved from the wool pad to the insulated vane');

    const sparked = play('workshop', 2, [
      { type: 'rub-vane' }, { type: 'rub-vane' }, { type: 'rub-vane' }, { type: 'rub-vane' },
    ]);
    expect(sparked.feedback).toContain('one-time discharge');
    expect(reduceStationChallenge(sparked, { type: 'rub-vane' })).toBe(sparked);

    const staticCharge = reduceStationChallenge(sparked, { type: 'reset-vane' });
    expectSolved(staticCharge);
    expect(staticCharge.values.sparked).toBe(false);
    expect(staticCharge.feedback).toContain('no maintained current');
  });

  it('renders Workshop cause-and-effect labels without relying on unexplained symbols', () => {
    const tuningStart = renderStationChallenge(createStationChallengeState('workshop', 1));
    expect(tuningStart).toContain('Change one part at a time');
    expect(tuningStart).toContain('<strong>Voltage</strong> is the push');
    expect(tuningStart).toContain('<strong>Resistance</strong> is opposition');
    expect(tuningStart).toContain('<strong>Current</strong> is how quickly charge moves');

    const staticStart = renderStationChallenge(createStationChallengeState('workshop', 2));
    expect(staticStart).toContain('Fixed + markers');
    expect(staticStart).toContain('Electron − markers');
    expect(staticStart).toContain('Only electron − markers move');
    expect(staticStart).toContain('Magnified air gap');
  });

  it('makes every Converter phase expose its cause before success', () => {
    const earlyRepair = play('converter', 0, [{ type: 'rotate-rectifier' }]);
    expect(earlyRepair.values.rectifier).toBe('reversed');
    expect(earlyRepair.feedback).toContain('Probe the broken line first');

    const broken = play('converter', 0, [{ type: 'probe-converter' }]);
    expect(broken.values.wave).toBe('blocked-reversal');
    expect(broken.feedback).toContain('Stage 2');

    const rectified = play('converter', 0, [
      { type: 'probe-converter' },
      { type: 'rotate-rectifier' },
      { type: 'probe-converter' },
    ]);
    expect(rectified.values.wave).toBe('pulsing-dc');
    expect(rectified.values.rectificationSeen).toBe(true);
    expect(rectified.feedback).toContain('negative half upward');

    const chain = play('converter', 0, [
      { type: 'probe-converter' },
      { type: 'rotate-rectifier' },
      { type: 'probe-converter' },
      { type: 'install-capacitor' },
      { type: 'probe-converter' },
    ]);
    expectSolved(chain);
    expect(chain.values.wave).toBe('steady-dc');
    expect(chain.feedback).toContain('capacitor fills the dips');
    expect(chain.feedback).toContain('regulator holds the target');

    const weakAdapter = play('converter', 1, [
      { type: 'choose-adapter', value: '5v-0.5a' },
      { type: 'test-adapter' },
    ]);
    expect(weakAdapter.feedback).toContain('can provide only 0.5 A');

    const adapter = play('converter', 1, [
      { type: 'test-adapter' },
      { type: 'choose-adapter', value: '5v-2a' },
      { type: 'test-adapter' },
    ]);
    expectSolved(adapter);
    expect(adapter.feedback).toContain('does not force 2 A');
    const changedAfterPass = reduceStationChallenge(adapter, { type: 'choose-adapter', value: '9v-2a' });
    expect(changedAfterPass.values.testedGood).toBe(false);

    const earlyRequest = play('converter', 2, [{ type: 'send-pd-request' }]);
    expect(earlyRequest.feedback).toContain('Connect first');

    const connected = play('converter', 2, [{ type: 'connect-usbc' }]);
    expect(connected.values.voltage).toBe(5);
    expect(connected.feedback).toContain('connector shape has not chosen 9 V');

    const negotiated = play('converter', 2, [
      { type: 'connect-usbc' },
      { type: 'send-pd-offer' },
      { type: 'send-pd-request' },
      { type: 'accept-pd-request' },
    ]);
    expectSolved(negotiated);
    expect(negotiated.values.voltage).toBe(9);
    expect(negotiated.feedback).toContain('Agreement came before higher voltage');
  });

  it('renders three distinct Converter evidence boards with plain-language labels', () => {
    const conversion = renderStationChallenge(createStationChallengeState('converter', 0));
    expect(conversion).toContain('Signal journey');
    expect(conversion).toContain('Still reversing');
    expect(conversion).toContain('Flip negative halves upward');
    expect(conversion).toContain('Fill the dips');
    expect(conversion).toContain('Hold the target');

    const adapter = renderStationChallenge(createStationChallengeState('converter', 1));
    expect(adapter).toContain('Device needs');
    expect(adapter).toContain('Adapter provides');
    expect(adapter).toContain('Current capacity');
    expect(adapter).toContain('The device draws what it needs');

    const negotiation = renderStationChallenge(createStationChallengeState('converter', 2));
    expect(negotiation).toContain('Default 5 V first');
    expect(negotiation).toContain('Offer');
    expect(negotiation).toContain('Request');
    expect(negotiation).toContain('Accept');
  });

  it('makes Wind Ridge distinguish still flux, open voltage, current, and counter-torque', () => {
    expectSolved(play('wind', 0, [
      { type: 'observe-still' },
      { type: 'crank', value: 'left' }, { type: 'crank', value: 'right' },
      { type: 'crank', value: 'left' }, { type: 'crank', value: 'right' },
    ]));
    expectSolved(play('wind', 1, [
      { type: 'crank', value: 'left' },
      { type: 'connect-loop' },
      { type: 'crank', value: 'right' },
    ]));
    expectSolved(play('wind', 2, [
      { type: 'crank', value: 'left' },
      { type: 'set-load', value: 'balanced' },
      { type: 'crank', value: 'right' }, { type: 'crank', value: 'left' },
      { type: 'crank', value: 'right' }, { type: 'crank', value: 'left' },
    ]));
  });

  it('makes the open and closed generator runs a controlled voltage-current comparison', () => {
    const start = createStationChallengeState('wind', 1);
    const prematureBridge = reduceStationChallenge(start, { type: 'connect-loop' });
    expect(prematureBridge.values.loopClosed).toBe(false);
    expect(prematureBridge.feedback).toContain('Run the open-gap test first');

    const openRun = reduceStationChallenge(start, { type: 'crank', value: 'left' });
    expect(openRun.values).toMatchObject({
      loopClosed: false,
      openVoltageSeen: true,
      currentSeen: false,
    });
    expect(openRun.feedback).toContain('voltage across the two wire ends');
    expect(openRun.feedback).toContain('current stays at zero');

    const bridged = reduceStationChallenge(openRun, { type: 'connect-loop' });
    expect(bridged.values).toMatchObject({
      loopClosed: true,
      openVoltageSeen: true,
      currentSeen: false,
    });
    expect(bridged.feedback).toContain('does not create voltage or light by itself');

    const closedRun = reduceStationChallenge(bridged, { type: 'crank', value: 'right' });
    expectSolved(closedRun);
    expect(closedRun.values.currentSeen).toBe(true);
    expect(closedRun.feedback).toContain('complete path');
    expect(closedRun.feedback).toContain('one changed part');
  });

  it('renders voltage across open ends separately from current around the loop', () => {
    const start = renderStationChallenge(createStationChallengeState('wind', 1));
    expect(start).toContain('One generator. One changed part.');
    expect(start).toContain('Voltage across the ends');
    expect(start).toContain('Current around the loop');
    expect(start).toContain('Gap open');
    expect(start).toContain('Install copper bridge');

    const openRunState = reduceStationChallenge(
      createStationChallengeState('wind', 1),
      { type: 'crank', value: 'left' },
    );
    const openRun = renderStationChallenge(openRunState);
    expect(openRun).toContain('Voltage present');
    expect(openRun).toContain('0 loop current');
    expect(openRun).toContain('Lamp off');

    const bridgedState = reduceStationChallenge(openRunState, { type: 'connect-loop' });
    const bridged = renderStationChallenge(bridgedState);
    expect(bridged).toContain('Bridge installed');
    expect(bridged).toContain('Lamp still off');

    const solved = renderStationChallenge(
      reduceStationChallenge(bridgedState, { type: 'crank', value: 'right' }),
    );
    expect(solved).toContain('Current flows');
    expect(solved).toContain('Lamp on while cranking');

    const loadStart = renderStationChallenge(createStationChallengeState('wind', 2));
    expect(loadStart).toContain('data-connected="true" data-powered="false"');
    const movingLoad = renderStationChallenge(play('wind', 2, [
      { type: 'set-load', value: 'balanced' },
      { type: 'crank', value: 'left' },
    ]));
    expect(movingLoad).toContain('data-connected="true" data-powered="true"');
  });

  it('makes Longline compare heat, reject steady DC, and finish with step-up then step-down', () => {
    const comparison = play('longline', 0, [
      { type: 'dispatch' },
      { type: 'set-line-voltage', value: 'high' },
      { type: 'dispatch' },
    ]);
    expectSolved(comparison);
    expect(comparison.values).toMatchObject({
      lowCurrent: 4,
      lowHeat: 16,
      highCurrent: 1,
      highHeat: 1,
    });
    expectSolved(play('longline', 1, [
      { type: 'energize-chain' },
      { type: 'set-source', value: 'ac' },
      { type: 'set-step-up', value: 'up' },
      { type: 'set-step-down', value: 'down' },
      { type: 'energize-chain' },
    ]));
    expectSolved(play('longline', 2, [
      { type: 'dispatch' },
      { type: 'set-route', value: 'transformed' },
      { type: 'dispatch' },
    ]));
  });

  it('makes Lantern section 1 expose power × time on two independently adjustable evenings', () => {
    const initial = createStationChallengeState('lantern', 0);
    expect(initial.values).toMatchObject({
      leftPower: 1000,
      leftHours: 1,
      rightPower: 100,
      rightHours: 1,
    });
    expect(renderStationChallenge(initial)).toContain('1000 W × 1 h = 1000 Wh');
    expect(renderStationChallenge(initial)).toContain('100 W × 1 h = 100 Wh');
    expect(renderStationChallenge(initial)).toContain('Power rate');
    expect(renderStationChallenge(initial)).toContain('Runtime');

    const balanced = reduceStationChallenge(initial, {
      type: 'set-energy-factor',
      value: 10,
      secondary: 'rightHours',
    });
    expectSolved(balanced);
    expect(balanced.values).toMatchObject({ leftEnergy: 1000, rightEnergy: 1000 });
    expect(balanced.feedback).toContain('1000 W × 1 h');
    expect(balanced.feedback).toContain('100 W × 10 h');
    expect(balanced.feedback).toContain('both accumulate 1000 Wh');
  });

  it('makes Lantern section 2 reveal the underlit peak before allowing a causal repair', () => {
    const initial = createStationChallengeState('lantern', 1);
    expect(initial.values).toMatchObject({
      schedule: { dusk: 'efficient', peak: 'dim', closing: 'efficient' },
      energy: 600,
      brightness: [2, 1, 2],
      testedStart: false,
    });
    const initialMarkup = renderStationChallenge(initial);
    expect(initialMarkup).toContain('Dusk · 1 h');
    expect(initialMarkup).toContain('Peak market · 2 h');
    expect(initialMarkup).toContain('Closing · 1 h');
    expect(initialMarkup).toContain('Run the underlit starting market');

    const prematureEdit = reduceStationChallenge(initial, {
      type: 'set-market-plan',
      value: 'mixed',
      secondary: 'peak',
    });
    expect(prematureEdit.values.schedule).toEqual(initial.values.schedule);
    expect(prematureEdit.feedback).toContain('Run the starting market first');

    const observed = reduceStationChallenge(initial, { type: 'test-market-schedule' });
    expect(observed.values.testedStart).toBe(true);
    expect(observed.feedback).toContain('Peak market needs brightness 4');
    expect(observed.feedback).toContain('100 W × 2 h = 200 Wh');

    const repaired = reduceStationChallenge(observed, {
      type: 'set-market-plan',
      value: 'mixed',
      secondary: 'peak',
    });
    expect(repaired.solved).toBe(false);
    const tested = reduceStationChallenge(repaired, { type: 'test-market-schedule' });
    expectSolved(tested);
    expect(tested.values).toMatchObject({ energy: 1200, brightness: [2, 4, 2] });
    expect(tested.feedback).toContain('400 W × 2 h = 800 Wh');
    expect(tested.feedback).toContain('1200 Wh');
  });

  it('makes Lantern section 3 add an equation receipt for each period and finish off at 0 W', () => {
    const initial = createStationChallengeState('lantern', 2);
    const initialMarkup = renderStationChallenge(initial);
    expect(initialMarkup).toContain('Power rate during period');
    expect(initialMarkup).toContain('Energy accumulator');
    expect(initialMarkup).toContain('Wh ÷ 1000 = kWh');
    expect(initialMarkup).toContain('kWh × $0.18 = cost');
    expect(initialMarkup).toContain('Run Dusk for 1 h');

    const dusk = reduceStationChallenge(initial, { type: 'advance-period' });
    expect(dusk.values).toMatchObject({
      period: 1,
      energy: 200,
      power: 200,
      lastPower: 200,
      lastDuration: 1,
      lastAdded: 200,
    });
    expect(dusk.feedback).toContain('200 W × 1 h = 200 Wh');

    const peak = reduceStationChallenge(dusk, { type: 'advance-period' });
    expect(peak.values).toMatchObject({
      period: 2,
      energy: 1000,
      power: 400,
      lastPower: 400,
      lastDuration: 2,
      lastAdded: 800,
    });
    expect(peak.feedback).toContain('400 W × 2 h = 800 Wh');

    const closing = reduceStationChallenge(peak, { type: 'advance-period' });
    expectSolved(closing);
    expect(closing.values).toMatchObject({
      period: 3,
      energy: 1200,
      power: 0,
      lastPower: 200,
      lastDuration: 1,
      lastAdded: 200,
    });
    expect(closing.values.receipts).toHaveLength(3);
    expect(Number(closing.values.cost)).toBeCloseTo(0.216);
    expect(closing.feedback).toContain('Market is off now at 0 W');
    expect(closing.feedback).toContain('1200 Wh = 1.200 kWh');
    expect(closing.feedback).toContain('$0.22');
  });

  it('makes Harbor layer paths, distinguish protection, repair, and balance shared demand', () => {
    expectSolved(play('harbor', 0, [
      { type: 'set-layer', value: 'copper', secondary: 'conductor' },
      { type: 'set-layer', value: 'jacket', secondary: 'insulation' },
      { type: 'set-layer', value: 'ground', secondary: 'ground' },
      { type: 'run-normal' },
    ]));
    expectSolved(play('harbor', 1, [
      { type: 'install-protection', value: 'breaker' },
      { type: 'install-protection', value: 'gfci' },
      { type: 'inject-fault' },
      { type: 'select-fault', value: 'short' },
      { type: 'inject-fault' },
      { type: 'select-fault', value: 'leakage' },
      { type: 'inject-fault' },
      { type: 'repair-cable' },
    ]));
    expectSolved(play('harbor', 2, [
      { type: 'place-grid-piece', value: 0 },
      { type: 'select-grid-piece', value: 'feeder' }, { type: 'place-grid-piece', value: 1 },
      { type: 'select-grid-piece', value: 'transformer' }, { type: 'place-grid-piece', value: 2 },
      { type: 'select-grid-piece', value: 'service' }, { type: 'place-grid-piece', value: 3 },
      { type: 'change-home', value: 1, secondary: 0 },
      { type: 'send-feeder' },
      { type: 'set-capacity', value: 5 },
      { type: 'send-feeder' },
    ]));
  });
});
