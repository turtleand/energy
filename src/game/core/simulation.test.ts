import { describe, expect, it } from 'vitest';
import { districts, lessonMechanicMap } from '../content/districts';
import { challengeDefinitions } from '../challenges/engine';
import {
  advanceTime,
  chargeWorkshopVane,
  clearWorkshopDischarge,
  completeChallengePhase,
  createInitialGameState,
  getDistrictReadout,
  initialControls,
  parseSavedGameState,
  rewindGameState,
  runConverterDiagnostic,
  serializeGameState,
  setDistrictControl,
  setGameSettings,
  visitDistrict,
} from './simulation';

function completeStation(state: ReturnType<typeof createInitialGameState>, district: (typeof districts)[number]['id']) {
  return challengeDefinitions[district].phases.reduce(
    (current, phase) => completeChallengePhase(current, district, phase.id),
    state,
  );
}

describe('curriculum spine', () => {
  it('maps every lesson exactly once across six connected districts', () => {
    expect(districts).toHaveLength(6);
    expect(Object.keys(lessonMechanicMap)).toHaveLength(12);
    expect(Object.keys(lessonMechanicMap).sort()).toEqual(
      Array.from({ length: 12 }, (_, index) => `lesson-${index + 1}`).sort(),
    );

    const mappedLessons = districts.flatMap((district) => district.lessons);
    expect(new Set(mappedLessons).size).toBe(12);
    expect(mappedLessons).toHaveLength(12);
  });
});

describe('causal electricity model', () => {
  it('requires a closed loop and makes voltage, resistance, current, and power move together', () => {
    let state = createInitialGameState();
    const open = getDistrictReadout(state, 'workshop');
    expect(open.metrics.current).toBe(0);
    expect(open.metrics.power).toBe(0);

    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    const closed = getDistrictReadout(state, 'workshop');
    state = setDistrictControl(state, 'workshop', 'voltage', 9);
    const strongerSource = getDistrictReadout(state, 'workshop');
    expect(strongerSource.metrics.current).toBeGreaterThan(closed.metrics.current);
    expect(strongerSource.metrics.power).toBeGreaterThan(closed.metrics.power);

    state = setDistrictControl(state, 'workshop', 'resistance', 12);
    const moreResistance = getDistrictReadout(state, 'workshop');
    expect(moreResistance.metrics.current).toBeLessThan(strongerSource.metrics.current);
  });

  it('shows static buildup as a brief discharge, not a maintained current', () => {
    let state = createInitialGameState();
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    expect(getDistrictReadout(state, 'workshop').flags.staticSpark).toBe(true);
    expect(state.milestones.workshop).toContain('static-discharge');
    const historyLength = state.history.length;

    state = clearWorkshopDischarge(state);
    const discharged = getDistrictReadout(state, 'workshop');
    expect(discharged.flags.staticSpark).toBe(false);
    expect(discharged.flags.maintainedStaticCurrent).toBe(false);
    expect(state.milestones.workshop).toContain('static-discharge');
    expect(state.history).toHaveLength(historyLength);
  });

  it('blocks an incompatible adapter and restores stable DC only through the converter chain', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'converter', 'adapterMatch', 'wrong');
    expect(state.milestones.converter).not.toContain('mismatch-blocked');
    expect(getDistrictReadout(state, 'converter').flags.diagnosticBlocked).toBe(false);
    state = runConverterDiagnostic(state);
    expect(state.milestones.converter).toContain('mismatch-blocked');
    expect(getDistrictReadout(state, 'converter').flags.diagnosticBlocked).toBe(true);
    state = setDistrictControl(state, 'converter', 'rectifierOn', true);
    state = setDistrictControl(state, 'converter', 'smoothingOn', true);
    state = setDistrictControl(state, 'converter', 'adapterMatch', 'correct');
    const readout = getDistrictReadout(state, 'converter');
    expect(readout.metrics.dcStability).toBeGreaterThan(0.9);
    expect(readout.flags.diagnosticBlocked).toBe(false);
  });

  it('turns changing magnetic flux into output and exposes load strain', () => {
    let state = createInitialGameState();
    const still = getDistrictReadout(state, 'wind');
    state = setDistrictControl(state, 'wind', 'loopClosed', true);
    state = setDistrictControl(state, 'wind', 'windStrength', 0.85);
    state = setDistrictControl(state, 'wind', 'fieldStrength', 0.8);
    const moving = getDistrictReadout(state, 'wind');
    expect(moving.metrics.power).toBeGreaterThan(still.metrics.power);
    state = setDistrictControl(state, 'wind', 'loadDemand', 1);
    expect(getDistrictReadout(state, 'wind').metrics.strain).toBeGreaterThan(0.5);
  });

  it('reduces long-line current and heating when transmission voltage rises for the same demand', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'longline', 'transmissionVoltage', 'low');
    const low = getDistrictReadout(state, 'longline');
    state = setDistrictControl(state, 'longline', 'transmissionVoltage', 'high');
    const high = getDistrictReadout(state, 'longline');
    expect(high.metrics.current).toBeLessThan(low.metrics.current);
    expect(high.metrics.heat).toBeLessThan(low.metrics.heat);
  });

  it('accumulates energy from power over time in Lantern District', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'lantern', 'lampCount', 8);
    state = advanceTime(state, 2);
    const early = getDistrictReadout(state, 'lantern');
    state = advanceTime(state, 4);
    const later = getDistrictReadout(state, 'lantern');
    expect(later.metrics.energy).toBeGreaterThan(early.metrics.energy);
    expect(later.metrics.cost).toBeGreaterThan(early.metrics.cost);
  });

  it('preserves energy already spent when the player changes lamp technology', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'lantern', 'lampCount', 10);
    state = advanceTime(state, 12);
    const filamentEnergy = getDistrictReadout(state, 'lantern').metrics.energy;

    state = setDistrictControl(state, 'lantern', 'lampTech', 'warm-led');
    expect(getDistrictReadout(state, 'lantern').metrics.energy).toBeCloseTo(filamentEnergy);

    state = advanceTime(state, 4);
    expect(getDistrictReadout(state, 'lantern').metrics.energy).toBeCloseTo(filamentEnergy + 0.55);
  });

  it('distinguishes feeder capacity, home load, leakage, and protection', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'harbor', 'groundProtectionOn', true);
    state = setDistrictControl(state, 'harbor', 'insulationState', 'damaged');
    const fault = getDistrictReadout(state, 'harbor');
    expect(fault.flags.protectionTripped).toBe(true);
    expect(fault.metrics.leakage).toBeGreaterThan(0);
    state = setDistrictControl(state, 'harbor', 'insulationState', 'sound');
    state = setDistrictControl(state, 'harbor', 'homeLoad', 0.65);
    state = setDistrictControl(state, 'harbor', 'feederCapacity', 0.9);
    const safe = getDistrictReadout(state, 'harbor');
    expect(safe.flags.protectionTripped).toBe(false);
    expect(safe.metrics.feederMargin).toBeGreaterThan(0);
  });
});

describe('progression and persistence', () => {
  it('keeps Assisted play from bypassing the physical challenge phases', () => {
    let state = createInitialGameState();
    state = completeChallengePhase(state, 'workshop', 'build-loop');
    state = completeChallengePhase(state, 'workshop', 'tune-flow');
    expect(state.restored).not.toContain('workshop');

    state = setGameSettings(state, { assisted: true });
    expect(state.restored).not.toContain('workshop');
    state = completeChallengePhase(state, 'workshop', 'spark-reset');
    expect(state.restored).toContain('workshop');
    expect(getDistrictReadout(state, 'workshop').objectiveMet).toBe(true);
  });

  it('can restore all six districts through play and unlock the sandbox', () => {
    let state = createInitialGameState();

    state = completeStation(state, 'workshop');
    state = visitDistrict(state, 'converter');

    state = completeStation(state, 'converter');
    state = visitDistrict(state, 'wind');

    state = completeStation(state, 'wind');
    state = visitDistrict(state, 'longline');

    state = completeStation(state, 'longline');
    state = visitDistrict(state, 'lantern');

    state = completeStation(state, 'lantern');
    state = visitDistrict(state, 'harbor');

    state = completeStation(state, 'harbor');
    const completedState = state;
    state = completeStation(state, 'harbor');

    expect(state.restored).toEqual(['workshop', 'converter', 'wind', 'longline', 'lantern', 'harbor']);
    expect(state.sandboxUnlocked).toBe(true);
    expect(state).toBe(completedState);
    expect(districts.every((district) => getDistrictReadout(state, district.id).objectiveMet)).toBe(true);
  });

  it('keeps later districts locked until the connected district is restored', () => {
    let state = createInitialGameState();
    expect(visitDistrict(state, 'converter').activeDistrict).toBe('workshop');

    state = completeStation(state, 'workshop');
    expect(state.restored).toContain('workshop');
    expect(visitDistrict(state, 'converter').activeDistrict).toBe('converter');
  });

  it('rejects remote and out-of-order challenge checkpoints', () => {
    let state = createInitialGameState();
    const untouched = state;

    state = completeChallengePhase(state, 'converter', 'shape-wave');
    expect(state).toBe(untouched);
    state = completeChallengePhase(state, 'workshop', 'spark-reset');
    expect(state).toBe(untouched);

    state = completeChallengePhase(state, 'workshop', 'build-loop');
    expect(state.challengeProgress.workshop.completedPhaseIds).toEqual(['build-loop']);
    expect(state.history).toHaveLength(1);
  });

  it('does not record travel in the electrical-action rewind history', () => {
    let state = createInitialGameState();
    state = completeStation(state, 'workshop');
    const historyLength = state.history.length;

    state = visitDistrict(state, 'converter');

    expect(state.activeDistrict).toBe('converter');
    expect(state.history).toHaveLength(historyLength);
  });

  it('serializes a versioned save and safely rejects malformed data', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    const restored = parseSavedGameState(serializeGameState(state));
    expect(restored.controls.workshop.loopClosed).toBe(true);
    expect(parseSavedGameState('{broken').version).toBe(2);
    const sanitized = parseSavedGameState(
      JSON.stringify({ version: 1, restored: ['workshop', 'workshop'], settings: { assisted: 'yes' } }),
    );
    expect(sanitized.restored).toEqual(['workshop']);
    expect(sanitized.settings.assisted).toBe(false);
    expect(sanitized.challengeProgress.workshop.completedPhaseIds).toHaveLength(3);
  });

  it('migrates Lantern energy from older v1 saves without the accumulator field', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'lantern', 'lampCount', 10);
    state = advanceTime(state, 8);
    const legacySave = JSON.parse(serializeGameState(state));
    legacySave.version = 1;
    delete legacySave.challengeProgress;
    delete legacySave.controls.lantern.energySpent;

    const migrated = parseSavedGameState(JSON.stringify(legacySave));
    expect(getDistrictReadout(migrated, 'lantern').metrics.energy).toBeCloseTo(3.4);
  });

  it('preserves v1 progress, controls, settings, active district, and elapsed time during migration', () => {
    const legacy = {
      version: 1,
      activeDistrict: 'lantern',
      controls: {
        ...initialControls,
        lantern: { ...initialControls.lantern, lampCount: 9, lampTech: 'warm-led' },
      },
      elapsedSeconds: 42,
      milestones: {
        workshop: ['static-discharge'], converter: ['mismatch-blocked'], wind: [], longline: [], lantern: [], harbor: [],
      },
      restored: ['workshop', 'converter', 'wind', 'longline'],
      sandboxUnlocked: false,
      settings: { assisted: true, muted: true, reducedEffects: true, reducedMotion: true },
    };

    const migrated = parseSavedGameState(JSON.stringify(legacy));
    expect(migrated.version).toBe(2);
    expect(migrated.activeDistrict).toBe('lantern');
    expect(migrated.elapsedSeconds).toBe(42);
    expect(migrated.controls.lantern).toMatchObject({ lampCount: 9, lampTech: 'warm-led' });
    expect(migrated.settings).toEqual(legacy.settings);
    expect(migrated.restored).toEqual(['workshop', 'converter', 'wind', 'longline']);
    expect(migrated.challengeProgress.longline.completedPhaseIds).toEqual(
      challengeDefinitions.longline.phases.map((phase) => phase.id),
    );
    expect(migrated.challengeProgress.lantern.completedPhaseIds).toEqual([]);
    expect(migrated.history).toEqual([]);
  });

  it('derives v2 restoration only from a contiguous validated phase prefix', () => {
    const candidate = JSON.parse(serializeGameState(createInitialGameState()));
    candidate.restored = ['workshop'];
    candidate.sandboxUnlocked = true;
    candidate.challengeProgress.workshop.completedPhaseIds = ['build-loop', 'spark-reset', 'tune-flow'];

    const parsed = parseSavedGameState(JSON.stringify(candidate));
    expect(parsed.challengeProgress.workshop.completedPhaseIds).toEqual(['build-loop']);
    expect(parsed.restored).toEqual([]);
    expect(parsed.sandboxUnlocked).toBe(false);
  });

  it('stops v2 challenge recovery at a missing middle checkpoint', () => {
    const candidate = JSON.parse(serializeGameState(createInitialGameState()));
    candidate.challengeProgress.workshop.completedPhaseIds = ['build-loop', null, 'spark-reset'];

    const parsed = parseSavedGameState(JSON.stringify(candidate));
    expect(parsed.challengeProgress.workshop.completedPhaseIds).toEqual(['build-loop']);

    const resumed = completeChallengePhase(parsed, 'workshop', 'tune-flow');
    expect(resumed.challengeProgress.workshop.completedPhaseIds).toEqual(['build-loop', 'tune-flow']);
  });

  it('rewinds the latest meaningful action without corrupting the save schema', () => {
    const initial = createInitialGameState();
    const changed = setDistrictControl(initial, 'workshop', 'voltage', 9);
    const rewound = rewindGameState(changed);
    expect(rewound.controls.workshop.voltage).toBe(initial.controls.workshop.voltage);
    expect(rewound.version).toBe(2);
  });
});
