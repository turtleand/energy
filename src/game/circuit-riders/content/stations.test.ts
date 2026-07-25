import { describe, expect, it } from 'vitest';
import { missionById, missions } from './campaign';
import {
  INTERACTION_ENTER_RANGE,
  INTERACTION_EXIT_RANGE,
  getNearbyStation,
  getStationForControl,
  interactionStations,
  moveTowardProgress,
} from './stations';

describe('Circuit Riders interaction stations', () => {
  it('maps every mission control to exactly one visible station', () => {
    missions.forEach((mission) => {
      const stations = interactionStations[mission.id];
      const mappedControls = stations.flatMap((station) => station.controlIds);
      const expectedControls = mission.controls.map((control) => control.id);

      expect(stations.length).toBeGreaterThan(0);
      expect(new Set(stations.map((station) => station.id)).size).toBe(stations.length);
      expect(new Set(mappedControls).size).toBe(mappedControls.length);
      expect(mappedControls.sort()).toEqual(expectedControls.sort());
      stations.forEach((station) => {
        expect(station.progress).toBeGreaterThanOrEqual(0);
        expect(station.progress).toBeLessThan(1);
      });
    });
  });

  it('gives Mission 1 separate source, switch, and return locations', () => {
    const source = getStationForControl('loopworks-01', 'sourceOn');
    const serviceSwitch = getStationForControl('loopworks-01', 'switchClosed');
    const returnRail = getStationForControl('loopworks-01', 'returnClosed');

    expect([source.id, serviceSwitch.id, returnRail.id]).toEqual([
      'source',
      'switch',
      'return',
    ]);
    expect(new Set([source.progress, serviceSwitch.progress, returnRail.progress]).size).toBe(3);
  });

  it('uses hysteresis so station availability does not flicker at the boundary', () => {
    const source = getStationForControl('loopworks-01', 'sourceOn');

    expect(INTERACTION_EXIT_RANGE).toBeGreaterThan(INTERACTION_ENTER_RANGE);
    expect(
      getNearbyStation(
        'loopworks-01',
        source.progress + INTERACTION_ENTER_RANGE / 2,
        null,
      )?.id,
    ).toBe('source');
    expect(
      getNearbyStation(
        'loopworks-01',
        source.progress + (INTERACTION_ENTER_RANGE + INTERACTION_EXIT_RANGE) / 2,
        'source',
      )?.id,
    ).toBe('source');
    expect(
      getNearbyStation(
        'loopworks-01',
        source.progress + (INTERACTION_ENTER_RANGE + INTERACTION_EXIT_RANGE) / 2,
        null,
      ),
    ).toBeNull();
  });

  it('moves toward assisted destinations over time instead of teleporting', () => {
    const first = moveTowardProgress(0.9, 0.1, 0.05);
    const arrived = moveTowardProgress(0.09, 0.1, 0.05);

    expect(first).toEqual({ progress: 0.95, arrived: false });
    expect(arrived).toEqual({ progress: 0.1, arrived: true });
  });

  it('keeps the station registry aligned with the canonical campaign', () => {
    expect(Object.keys(interactionStations).sort()).toEqual(
      Object.keys(missionById).sort(),
    );
  });
});
