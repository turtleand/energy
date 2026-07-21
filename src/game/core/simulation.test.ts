import { describe, expect, it } from 'vitest';
import { districts, lessonMechanicMap } from '../content/districts';
import {
  advanceTime,
  chargeWorkshopVane,
  clearWorkshopDischarge,
  createInitialGameState,
  getDistrictReadout,
  parseSavedGameState,
  rewindGameState,
  runConverterDiagnostic,
  serializeGameState,
  setDistrictControl,
  setGameSettings,
  visitDistrict,
} from './simulation';

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
  it('re-evaluates the active objective when Assisted play lowers its thresholds', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    state = setDistrictControl(state, 'workshop', 'voltage', 7);
    state = setDistrictControl(state, 'workshop', 'resistance', 6);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    expect(state.restored).not.toContain('workshop');

    state = setGameSettings(state, { assisted: true });
    expect(state.restored).toContain('workshop');
    expect(getDistrictReadout(state, 'workshop').objectiveMet).toBe(true);
  });

  it('can restore all six districts through play and unlock the sandbox', () => {
    let state = createInitialGameState();

    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    state = setDistrictControl(state, 'workshop', 'voltage', 9);
    state = setDistrictControl(state, 'workshop', 'resistance', 4);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = visitDistrict(state, 'converter');

    state = setDistrictControl(state, 'converter', 'adapterMatch', 'wrong');
    state = runConverterDiagnostic(state);
    state = setDistrictControl(state, 'converter', 'rectifierOn', true);
    state = setDistrictControl(state, 'converter', 'smoothingOn', true);
    state = setDistrictControl(state, 'converter', 'adapterMatch', 'correct');
    state = visitDistrict(state, 'wind');

    state = setDistrictControl(state, 'wind', 'loopClosed', true);
    state = setDistrictControl(state, 'wind', 'windStrength', 0.85);
    state = setDistrictControl(state, 'wind', 'fieldStrength', 0.8);
    state = visitDistrict(state, 'longline');

    state = setDistrictControl(state, 'longline', 'transmissionVoltage', 'high');
    state = setDistrictControl(state, 'longline', 'transformerOn', true);
    state = visitDistrict(state, 'lantern');

    state = setDistrictControl(state, 'lantern', 'lampTech', 'warm-led');
    state = advanceTime(state, 4);
    state = visitDistrict(state, 'harbor');

    state = setDistrictControl(state, 'harbor', 'groundProtectionOn', true);
    state = setDistrictControl(state, 'harbor', 'insulationState', 'sound');
    state = setDistrictControl(state, 'harbor', 'homeLoad', 0.65);
    state = setDistrictControl(state, 'harbor', 'feederCapacity', 0.9);

    expect(state.restored).toEqual(['workshop', 'converter', 'wind', 'longline', 'lantern', 'harbor']);
    expect(state.sandboxUnlocked).toBe(true);
    expect(districts.every((district) => getDistrictReadout(state, district.id).objectiveMet)).toBe(true);
  });

  it('keeps later districts locked until the connected district is restored', () => {
    let state = createInitialGameState();
    expect(visitDistrict(state, 'converter').activeDistrict).toBe('workshop');

    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    state = setDistrictControl(state, 'workshop', 'voltage', 9);
    state = setDistrictControl(state, 'workshop', 'resistance', 4);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    expect(state.restored).toContain('workshop');
    expect(visitDistrict(state, 'converter').activeDistrict).toBe('converter');
  });

  it('does not record travel in the electrical-action rewind history', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'workshop', 'loopClosed', true);
    state = setDistrictControl(state, 'workshop', 'voltage', 9);
    state = setDistrictControl(state, 'workshop', 'resistance', 4);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
    state = chargeWorkshopVane(state);
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
    expect(parseSavedGameState('{broken').version).toBe(1);
    const sanitized = parseSavedGameState(
      JSON.stringify({ version: 1, restored: ['workshop', 'workshop'], settings: { assisted: 'yes' } }),
    );
    expect(sanitized.restored).toEqual(['workshop']);
    expect(sanitized.settings.assisted).toBe(false);
  });

  it('migrates Lantern energy from older v1 saves without the accumulator field', () => {
    let state = createInitialGameState();
    state = setDistrictControl(state, 'lantern', 'lampCount', 10);
    state = advanceTime(state, 8);
    const legacySave = JSON.parse(serializeGameState(state));
    delete legacySave.controls.lantern.energySpent;

    const migrated = parseSavedGameState(JSON.stringify(legacySave));
    expect(getDistrictReadout(migrated, 'lantern').metrics.energy).toBeCloseTo(3.4);
  });

  it('rewinds the latest meaningful action without corrupting the save schema', () => {
    const initial = createInitialGameState();
    const changed = setDistrictControl(initial, 'workshop', 'voltage', 9);
    const rewound = rewindGameState(changed);
    expect(rewound.controls.workshop.voltage).toBe(initial.controls.workshop.voltage);
    expect(rewound.version).toBe(1);
  });
});
