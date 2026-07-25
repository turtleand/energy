import { describe, expect, it } from 'vitest';
import { getStationForControl } from '../content/stations';
import {
  applyActionInteraction,
  applyControlInteraction,
} from './interactions';
import {
  createInitialCampaignState,
  getMissionReadout,
  travelToMission,
  type ControlValue,
} from './model';

describe('Circuit Riders location-grounded interactions', () => {
  it('rejects a control mutation when the avatar is not at its station', () => {
    const state = createInitialCampaignState();
    const result = applyControlInteraction(
      state,
      'loopworks-01',
      'sourceOn',
      true,
      null,
    );

    expect(result.accepted).toBe(false);
    expect(result.state).toBe(state);
    expect(result.requiredStation.id).toBe('source');
    expect(result.state.missions['loopworks-01'].controls.sourceOn).toBe(false);
  });

  it('accepts the same mutation only at the matching station', () => {
    const state = createInitialCampaignState();
    const result = applyControlInteraction(
      state,
      'loopworks-01',
      'sourceOn',
      true,
      'source',
    );

    expect(result.accepted).toBe(true);
    expect(result.state.missions['loopworks-01'].controls.sourceOn).toBe(true);
  });

  it('guards action controls with the same station rule', () => {
    const state = {
      ...createInitialCampaignState(),
      activeMission: 'loopworks-02' as const,
      completed: ['loopworks-01' as const],
    };
    const blocked = applyActionInteraction(
      state,
      'loopworks-02',
      'chargeLevel',
      null,
    );
    const accepted = applyActionInteraction(
      state,
      'loopworks-02',
      'chargeLevel',
      'stormglass',
    );

    expect(blocked.accepted).toBe(false);
    expect(getMissionReadout(blocked.state, 'loopworks-02').metrics.staticCharge).toBe(0);
    expect(accepted.accepted).toBe(true);
    expect(getMissionReadout(accepted.state, 'loopworks-02').metrics.staticCharge).toBe(25);
  });

  it('plans assisted travel without changing state before arrival', () => {
    const state = createInitialCampaignState({ mode: 'planning' });
    const target = getStationForControl('loopworks-01', 'sourceOn');
    const beforeArrival = applyControlInteraction(
      state,
      'loopworks-01',
      'sourceOn',
      true,
      null,
    );

    expect(beforeArrival.accepted).toBe(false);
    expect(beforeArrival.state).toBe(state);
    expect(beforeArrival.state.missions['loopworks-01'].controls.sourceOn).toBe(false);

    const arrived = applyControlInteraction(
      beforeArrival.state,
      'loopworks-01',
      'sourceOn',
      true,
      target.id,
    );
    expect(arrived.accepted).toBe(true);
    expect(arrived.state.missions['loopworks-01'].controls.sourceOn).toBe(true);
  });

  it('rejects attempts to operate a mission that is not active', () => {
    const state = createInitialCampaignState();
    const result = applyControlInteraction(
      state,
      'loopworks-03',
      'switchClosed',
      true,
      'junction',
    );

    expect(result.accepted).toBe(false);
    expect(result.state).toBe(state);
  });

  it('completes the full campaign through station-grounded Action interactions', () => {
    let state = createInitialCampaignState({ mode: 'action' });

    const setAt = (
      mission: Parameters<typeof applyControlInteraction>[1],
      control: string,
      value: ControlValue,
    ) => {
      const station = getStationForControl(mission, control);
      const remote = applyControlInteraction(state, mission, control, value, null);
      expect(remote.accepted, `${mission}/${control} must reject remote input`).toBe(false);
      const local = applyControlInteraction(state, mission, control, value, station.id);
      expect(local.accepted, `${mission}/${control} must accept local input`).toBe(true);
      state = local.state;
    };

    const actAt = (
      mission: Parameters<typeof applyActionInteraction>[1],
      control: string,
    ) => {
      const station = getStationForControl(mission, control);
      const remote = applyActionInteraction(state, mission, control, null);
      expect(remote.accepted, `${mission}/${control} must reject remote input`).toBe(false);
      const local = applyActionInteraction(state, mission, control, station.id);
      expect(local.accepted, `${mission}/${control} must accept local input`).toBe(true);
      state = local.state;
    };

    const travel = (mission: Parameters<typeof travelToMission>[1]) => {
      state = travelToMission(state, mission);
      expect(state.activeMission).toBe(mission);
    };

    setAt('loopworks-01', 'sourceOn', true);
    setAt('loopworks-01', 'switchClosed', true);
    setAt('loopworks-01', 'returnClosed', true);
    travel('loopworks-02');

    actAt('loopworks-02', 'chargeLevel');
    actAt('loopworks-02', 'chargeLevel');
    actAt('loopworks-02', 'chargeLevel');
    travel('loopworks-03');

    setAt('loopworks-03', 'switchClosed', true);
    setAt('loopworks-03', 'route', 'load');
    travel('loopworks-04');

    setAt('loopworks-04', 'switchClosed', true);
    setAt('loopworks-04', 'voltage', 10);
    travel('converter-05');

    setAt('converter-05', 'phaseTrim', 0.5);
    setAt('converter-05', 'rectifierOn', true);
    setAt('converter-05', 'smoothingOn', true);
    setAt('converter-05', 'regulatorOn', true);
    travel('converter-06');

    actAt('converter-06', 'diagnose');
    setAt('converter-06', 'adapter', 'compatible');
    actAt('converter-06', 'dock');
    travel('converter-07');

    setAt('converter-07', 'loadCount', 6);
    setAt('converter-07', 'lampTech', 'efficient');
    actAt('converter-07', 'advanceShift');
    actAt('converter-07', 'advanceShift');
    travel('gridfall-08');

    setAt('gridfall-08', 'protectionArmed', true);
    actAt('gridfall-08', 'testPath');
    setAt('gridfall-08', 'material', 'conductor');
    setAt('gridfall-08', 'path', 'intended');
    travel('gridfall-09');

    setAt('gridfall-09', 'loopClosed', true);
    setAt('gridfall-09', 'motion', 0.8);
    setAt('gridfall-09', 'field', 0.8);
    travel('gridfall-10');

    setAt('gridfall-10', 'lineVoltage', 'high');
    setAt('gridfall-10', 'transformerOn', true);
    travel('gridfall-11');

    setAt('gridfall-11', 'fault', 'overload');
    actAt('gridfall-11', 'testProtection');
    setAt('gridfall-11', 'fault', 'leakage');
    actAt('gridfall-11', 'testProtection');
    setAt('gridfall-11', 'fault', 'none');
    actAt('gridfall-11', 'resetProtection');
    travel('gridfall-12');

    setAt('gridfall-12', 'generation', 0.9);
    setAt('gridfall-12', 'transmissionHigh', true);
    setAt('gridfall-12', 'feederCapacity', 0.9);
    setAt('gridfall-12', 'priorityRoute', 'balanced');
    setAt('gridfall-12', 'protectionArmed', true);

    expect(state.completed).toHaveLength(12);
    expect(state.campaignComplete).toBe(true);
    expect(state.sandboxUnlocked).toBe(true);
  });
});
