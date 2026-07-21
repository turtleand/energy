import { describe, expect, it } from 'vitest';
import { districts } from '../content/districts';
import {
  challengeDefinitions,
  createStationChallengeState,
  reduceStationChallenge,
  type StationChallengeAction,
  type StationChallengeState,
} from './engine';

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

    const tuning = play('workshop', 1, [
      { type: 'pulse-loop' },
      { type: 'set-cells', value: 2 },
      { type: 'pulse-loop' },
      { type: 'set-coil', value: 'high' },
      { type: 'pulse-loop' },
    ]);
    expectSolved(tuning);
    expect(tuning.values.observations).toEqual(['baseline', 'push', 'resistance']);

    const staticCharge = play('workshop', 2, [
      { type: 'rub-vane' }, { type: 'rub-vane' }, { type: 'rub-vane' }, { type: 'rub-vane' },
      { type: 'reset-vane' },
    ]);
    expectSolved(staticCharge);
    expect(staticCharge.values.sparked).toBe(false);
  });

  it('requires Converter faults to be observed before the corrected chain can pass', () => {
    const chain = play('converter', 0, [
      { type: 'run-wave' },
      { type: 'rotate-module', value: 1 },
      { type: 'place-module', value: 2 },
      { type: 'run-wave' },
    ]);
    expectSolved(chain);
    expect(chain.values.wave).toBe('steady-dc');

    expectSolved(play('converter', 1, [
      { type: 'test-adapter' },
      { type: 'choose-adapter', value: '5v-2a' },
      { type: 'test-adapter' },
    ]));
    expectSolved(play('converter', 2, [
      { type: 'negotiate' },
      { type: 'choose-cable', value: 'pd-rated' },
      { type: 'negotiate' },
    ]));
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

  it('makes Lantern District solve equal energy, a nontrivial schedule, and accumulation', () => {
    expectSolved(play('lantern', 0, [
      { type: 'place-energy-side', value: 'leftCard' },
      { type: 'select-energy-card', value: '100w-10h' },
      { type: 'place-energy-side', value: 'rightCard' },
    ]));
    const initialSchedule = createStationChallengeState('lantern', 1);
    expect(initialSchedule.values).toMatchObject({ energy: 5, brightness: [2, 1, 2] });
    expectSolved(play('lantern', 1, [
      { type: 'select-market-plan', value: 'mixed' },
      { type: 'place-market-period', value: 'peak' },
    ]));
    const replay = play('lantern', 2, [
      { type: 'advance-period' }, { type: 'advance-period' }, { type: 'advance-period' },
    ]);
    expectSolved(replay);
    expect(Number(replay.values.energy)).toBeGreaterThan(0);
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
