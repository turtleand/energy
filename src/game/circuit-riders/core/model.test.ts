import { describe, expect, it } from 'vitest';
import {
  CIRCUIT_RIDERS_SAVE_KEY,
  CIRCUIT_RIDERS_SAVE_VERSION,
  advanceCampaignTime,
  createInitialCampaignState,
  getMissionReadout,
  getNextIncompleteStep,
  initialMissionControls,
  isMissionUnlocked,
  parseCampaignSave,
  performMissionAction,
  resetMissionState,
  rewindCampaignState,
  serializeCampaignState,
  setMissionControl,
} from './model';

describe('Circuit Riders deterministic electrical model', () => {
  it('requires a closed source, switch, and return path before current circulates', () => {
    let state = createInitialCampaignState();

    expect(getMissionReadout(state, 'loopworks-01').metrics.current).toBe(0);

    state = setMissionControl(state, 'loopworks-01', 'sourceOn', true);
    state = setMissionControl(state, 'loopworks-01', 'switchClosed', true);
    state = setMissionControl(state, 'loopworks-01', 'returnClosed', true);
    expect(getMissionReadout(state, 'loopworks-01').metrics.current).toBeGreaterThan(0);

    state = setMissionControl(state, 'loopworks-01', 'returnClosed', false);
    expect(getMissionReadout(state, 'loopworks-01').metrics.current).toBe(0);
  });

  it('circulates charge without consuming the charge markers', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'loopworks-01', 'sourceOn', true);
    state = setMissionControl(state, 'loopworks-01', 'switchClosed', true);
    state = setMissionControl(state, 'loopworks-01', 'returnClosed', true);

    const before = getMissionReadout(state, 'loopworks-01');
    state = advanceCampaignTime(state, 30);
    const after = getMissionReadout(state, 'loopworks-01');

    expect(before.metrics.chargeMarkers).toBe(after.metrics.chargeMarkers);
    expect(after.metrics.energy).toBeGreaterThan(before.metrics.energy);
  });

  it('shows voltage raising current and resistance lowering current', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'loopworks-04', 'switchClosed', true);

    state = setMissionControl(state, 'loopworks-04', 'voltage', 4);
    state = setMissionControl(state, 'loopworks-04', 'resistance', 8);
    const baseline = getMissionReadout(state, 'loopworks-04');

    state = setMissionControl(state, 'loopworks-04', 'voltage', 8);
    const morePush = getMissionReadout(state, 'loopworks-04');

    state = setMissionControl(state, 'loopworks-04', 'resistance', 16);
    const moreResistance = getMissionReadout(state, 'loopworks-04');

    expect(morePush.metrics.current).toBeGreaterThan(baseline.metrics.current);
    expect(moreResistance.metrics.current).toBeLessThan(morePush.metrics.current);
  });

  it('reports every objective step complete when the mission is restored', () => {
    let state = createInitialCampaignState();
    state = {
      ...state,
      completed: ['loopworks-01', 'loopworks-02', 'loopworks-03'],
    };
    state = setMissionControl(state, 'loopworks-04', 'switchClosed', true);
    state = setMissionControl(state, 'loopworks-04', 'voltage', 8);
    state = setMissionControl(state, 'loopworks-04', 'resistance', 8);
    state = setMissionControl(state, 'loopworks-04', 'voltage', 12);
    state = setMissionControl(state, 'loopworks-04', 'resistance', 4);

    const tunnel = getMissionReadout(state, 'loopworks-04');

    expect(state.completed).toContain('loopworks-04');
    expect(tunnel.objectiveMet).toBe(false);
    expect(tunnel.objectiveProgress).toBe(1);
    expect(tunnel.stepCompletion).toEqual([true, true, true]);

    state = {
      ...state,
      completed: [
        'loopworks-01',
        'loopworks-02',
        'loopworks-03',
        'loopworks-04',
        'converter-05',
        'converter-06',
        'converter-07',
        'gridfall-08',
      ],
    };
    state = setMissionControl(state, 'gridfall-09', 'loopClosed', true);
    state = setMissionControl(state, 'gridfall-09', 'motion', 0.8);
    state = setMissionControl(state, 'gridfall-09', 'field', 0.8);
    state = setMissionControl(state, 'gridfall-09', 'load', 0.6);
    state = setMissionControl(state, 'gridfall-09', 'load', 0.3);

    const generator = getMissionReadout(state, 'gridfall-09');

    expect(state.completed).toContain('gridfall-09');
    expect(generator.objectiveMet).toBe(false);
    expect(generator.objectiveProgress).toBe(1);
    expect(generator.stepCompletion).toEqual([true, true, true]);
  });

  it('keeps power as an immediate rate while energy accumulates over time', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'converter-07', 'loadCount', 6);
    state = setMissionControl(state, 'converter-07', 'lampTech', 'efficient');

    const before = getMissionReadout(state, 'converter-07');
    state = advanceCampaignTime(state, 8);
    const after = getMissionReadout(state, 'converter-07');

    expect(after.metrics.power).toBe(before.metrics.power);
    expect(after.metrics.energy).toBeGreaterThan(before.metrics.energy);
  });

  it('builds static charge to a threshold, discharges once, and resets', () => {
    let state = createInitialCampaignState();
    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    expect(getMissionReadout(state, 'loopworks-02').flags.staticDischarge).toBe(false);

    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    const discharged = getMissionReadout(state, 'loopworks-02');

    expect(discharged.flags.staticDischarge).toBe(true);
    expect(discharged.metrics.staticCharge).toBe(0);
  });

  it('keeps a restored static mission coherent when the player experiments again', () => {
    let state = createInitialCampaignState();
    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    state = performMissionAction(state, 'loopworks-02', 'charge-static');
    state = performMissionAction(state, 'loopworks-02', 'charge-static');

    const replayed = getMissionReadout(state, 'loopworks-02');

    expect(replayed.objectiveMet).toBe(true);
    expect(replayed.status).toBe('restored');
    expect(replayed.caption).toContain('system remains restored');
  });

  it('turns reversing AC into rectified, smoothed, regulated output in visible stages', () => {
    let state = createInitialCampaignState();
    const alternating = getMissionReadout(state, 'converter-05');
    expect(alternating.flow.direction).toBe('alternating');

    state = setMissionControl(state, 'converter-05', 'rectifierOn', true);
    const rectified = getMissionReadout(state, 'converter-05');
    expect(rectified.flow.direction).toBe('one-way');
    expect(rectified.metrics.ripple).toBeGreaterThan(0.5);

    state = setMissionControl(state, 'converter-05', 'smoothingOn', true);
    const smoothed = getMissionReadout(state, 'converter-05');
    expect(smoothed.metrics.ripple).toBeLessThan(rectified.metrics.ripple);

    state = setMissionControl(state, 'converter-05', 'regulatorOn', true);
    const regulated = getMissionReadout(state, 'converter-05');
    expect(regulated.metrics.stability).toBeGreaterThan(smoothed.metrics.stability);
  });

  it('blocks incompatible adapters and requires enough current capacity', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'converter-06', 'adapter', 'low-current');
    state = performMissionAction(state, 'converter-06', 'diagnose-adapter');
    expect(getMissionReadout(state, 'converter-06').flags.safeToDock).toBe(false);

    state = setMissionControl(state, 'converter-06', 'adapter', 'compatible');
    state = performMissionAction(state, 'converter-06', 'dock-adapter');
    const compatible = getMissionReadout(state, 'converter-06');
    expect(compatible.flags.safeToDock).toBe(true);
    expect(compatible.flags.docked).toBe(true);
  });

  it('makes connected generator load oppose motion', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'gridfall-09', 'loopClosed', true);
    state = setMissionControl(state, 'gridfall-09', 'motion', 0.8);
    state = setMissionControl(state, 'gridfall-09', 'field', 0.8);
    state = setMissionControl(state, 'gridfall-09', 'load', 0.3);
    const lightLoad = getMissionReadout(state, 'gridfall-09');

    state = setMissionControl(state, 'gridfall-09', 'load', 0.9);
    const heavyLoad = getMissionReadout(state, 'gridfall-09');

    expect(heavyLoad.metrics.mechanicalOpposition).toBeGreaterThan(
      lightLoad.metrics.mechanicalOpposition,
    );
  });

  it('uses higher transmission voltage for lower current and lower line heat', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'gridfall-10', 'lineVoltage', 'low');
    const lowVoltage = getMissionReadout(state, 'gridfall-10');

    state = setMissionControl(state, 'gridfall-10', 'lineVoltage', 'high');
    const highVoltage = getMissionReadout(state, 'gridfall-10');

    expect(highVoltage.metrics.current).toBeLessThan(lowVoltage.metrics.current);
    expect(highVoltage.metrics.heat).toBeLessThan(lowVoltage.metrics.heat);
  });

  it('distinguishes breaker overcurrent from GFCI missing-return protection', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'gridfall-11', 'fault', 'overload');
    state = performMissionAction(state, 'gridfall-11', 'test-protection');
    let readout = getMissionReadout(state, 'gridfall-11');
    expect(readout.flags.breakerTripped).toBe(true);
    expect(readout.flags.gfciTripped).toBe(false);

    state = setMissionControl(state, 'gridfall-11', 'fault', 'leakage');
    state = performMissionAction(state, 'gridfall-11', 'test-protection');
    readout = getMissionReadout(state, 'gridfall-11');
    expect(readout.flags.breakerTripped).toBe(true);
    expect(readout.flags.gfciTripped).toBe(true);
  });

  it('requires both protection trips, a cleared fault, and a reset before completion', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'gridfall-11', 'fault', 'overload');
    state = performMissionAction(state, 'gridfall-11', 'test-protection');
    state = setMissionControl(state, 'gridfall-11', 'fault', 'leakage');
    state = performMissionAction(state, 'gridfall-11', 'test-protection');

    expect(getMissionReadout(state, 'gridfall-11').objectiveMet).toBe(false);

    state = setMissionControl(state, 'gridfall-11', 'fault', 'none');
    state = performMissionAction(state, 'gridfall-11', 'reset-protection');

    expect(getMissionReadout(state, 'gridfall-11').objectiveMet).toBe(true);
  });

  it('keeps feeder demand separate from service demand in the final city mission', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'gridfall-12', 'serviceDemand', 0.5);
    const calm = getMissionReadout(state, 'gridfall-12');

    state = setMissionControl(state, 'gridfall-12', 'serviceDemand', 0.9);
    const peak = getMissionReadout(state, 'gridfall-12');

    expect(peak.metrics.serviceDemand).toBeGreaterThan(calm.metrics.serviceDemand);
    expect(peak.metrics.feederDemand).toBeGreaterThan(peak.metrics.serviceDemand);
  });
});

describe('Circuit Riders progression controls', () => {
  it('reports the first incomplete objective step even when later steps are already done', () => {
    expect(getNextIncompleteStep([false, true, false])).toBe(1);
    expect(getNextIncompleteStep([true, true, false])).toBe(3);
    expect(getNextIncompleteStep([true, true, true])).toBe(3);
  });

  it('unlocks one mission at a time and can rewind or retry without stale completion', () => {
    let state = createInitialCampaignState();

    expect(isMissionUnlocked(state, 'loopworks-01')).toBe(true);
    expect(isMissionUnlocked(state, 'loopworks-02')).toBe(false);

    state = setMissionControl(state, 'loopworks-01', 'sourceOn', true);
    state = setMissionControl(state, 'loopworks-01', 'switchClosed', true);
    state = setMissionControl(state, 'loopworks-01', 'returnClosed', true);
    expect(isMissionUnlocked(state, 'loopworks-02')).toBe(true);

    state = rewindCampaignState(state);
    expect(getMissionReadout(state, 'loopworks-01').objectiveMet).toBe(false);
    expect(isMissionUnlocked(state, 'loopworks-02')).toBe(false);

    state = resetMissionState(state, 'loopworks-01');
    expect(getMissionReadout(state, 'loopworks-01').objectiveProgress).toBe(0);
    expect(state.completed).not.toContain('loopworks-01');
  });

  it('resets sandbox controls without erasing the restored campaign', () => {
    let state = createInitialCampaignState();
    state = {
      ...state,
      campaignComplete: true,
      completed: [
        'loopworks-01',
        'loopworks-02',
        'loopworks-03',
        'loopworks-04',
        'converter-05',
        'converter-06',
        'converter-07',
        'gridfall-08',
        'gridfall-09',
        'gridfall-10',
        'gridfall-11',
        'gridfall-12',
      ],
      sandboxUnlocked: true,
    };
    state = setMissionControl(state, 'loopworks-01', 'sourceOn', true);
    state = resetMissionState(state, 'loopworks-01');

    expect(state.campaignComplete).toBe(true);
    expect(state.sandboxUnlocked).toBe(true);
    expect(state.completed).toContain('loopworks-01');
    expect(state.missions['loopworks-01'].controls).toEqual(
      initialMissionControls['loopworks-01'],
    );
  });
});

describe('Circuit Riders save format', () => {
  it('uses W or D clockwise and S or A counter-clockwise by default', () => {
    const bindings = createInitialCampaignState().settings.bindings;

    expect(bindings).toMatchObject({
      left: 'KeyA',
      right: 'KeyD',
      up: 'KeyS',
      down: 'KeyW',
    });
  });

  it('round trips the current version', () => {
    let state = createInitialCampaignState();
    state = setMissionControl(state, 'loopworks-01', 'switchClosed', true);

    const parsed = parseCampaignSave(serializeCampaignState(state));

    expect(parsed.version).toBe(CIRCUIT_RIDERS_SAVE_VERSION);
    expect(parsed.missions['loopworks-01'].controls.switchClosed).toBe(true);
    expect(CIRCUIT_RIDERS_SAVE_KEY).toContain('circuit-riders');
  });

  it('migrates legacy default directions without changing progress or shortcuts', () => {
    let legacy = createInitialCampaignState({
      bindings: {
        left: 'KeyA',
        right: 'KeyD',
        up: 'KeyW',
        down: 'KeyS',
        action: 'Enter',
        pause: 'KeyJ',
        lens: 'KeyL',
      },
    });
    legacy = setMissionControl(legacy, 'loopworks-01', 'sourceOn', true);

    const migrated = parseCampaignSave(serializeCampaignState(legacy));

    expect(migrated.missions['loopworks-01'].controls.sourceOn).toBe(true);
    expect(migrated.settings.bindings).toEqual({
      left: 'KeyA',
      right: 'KeyD',
      up: 'KeyS',
      down: 'KeyW',
      action: 'Enter',
      pause: 'KeyJ',
      lens: 'KeyL',
    });
  });

  it('preserves a partially customized directional mapping', () => {
    const custom = createInitialCampaignState({
      bindings: {
        left: 'ArrowLeft',
        right: 'KeyD',
        up: 'KeyW',
        down: 'KeyS',
      },
    });

    const parsed = parseCampaignSave(serializeCampaignState(custom));

    expect(parsed.settings.bindings).toEqual(custom.settings.bindings);
  });

  it('migrates a minimal version-one save and recovers from invalid data', () => {
    const migrated = parseCampaignSave(
      JSON.stringify({
        version: 1,
        activeMission: 'converter-05',
        completed: ['loopworks-01', 'loopworks-02', 'unknown'],
      }),
    );
    const recovered = parseCampaignSave('{not-json');

    expect(migrated.activeMission).toBe('converter-05');
    expect(migrated.completed).toEqual(['loopworks-01', 'loopworks-02']);
    expect(recovered).toEqual(createInitialCampaignState());
  });
});
