import { describe, expect, it } from 'vitest';
import {
  ENTER_RADIUS,
  EXIT_RADIUS,
  FRESH_ROVER_POSITION,
  buildNavigationSnapshot,
  districtWorldPoint,
  getInitialRoverPosition,
  nearestUnlockedDistrict,
  normalizeMovementVector,
  resolveOperatingDistrict,
} from './navigation';

describe('gridkeeper navigation', () => {
  const unlocked = ['workshop', 'converter'] as const;

  it('starts a fresh game at the landing and resumes inside the active district', () => {
    expect(getInitialRoverPosition('workshop', 'fresh')).toEqual(FRESH_ROVER_POSITION);
    expect(getInitialRoverPosition('converter', 'resume')).toEqual(districtWorldPoint('converter'));
  });

  it('enters a district inside the operating radius', () => {
    const workshop = districtWorldPoint('workshop');
    const point = { x: workshop.x + ENTER_RADIUS - 1, y: workshop.y };
    expect(resolveOperatingDistrict(point, unlocked, null)).toBe('workshop');
  });

  it('uses an exit radius to avoid flickering at the service-ring edge', () => {
    const workshop = districtWorldPoint('workshop');
    expect(
      resolveOperatingDistrict({ x: workshop.x + ENTER_RADIUS + 4, y: workshop.y }, unlocked, 'workshop'),
    ).toBe('workshop');
    expect(
      resolveOperatingDistrict({ x: workshop.x + EXIT_RADIUS + 1, y: workshop.y }, unlocked, 'workshop'),
    ).toBeNull();
  });

  it('ignores locked districts when deriving proximity', () => {
    const converter = districtWorldPoint('converter');
    const snapshot = buildNavigationSnapshot(converter, ['workshop'], null, null);
    expect(snapshot.operatingDistrict).toBeNull();
    expect(snapshot.nearbyDistrict).toBeNull();
    expect(snapshot.phase).toBe('far');
  });

  it('selects the nearest unlocked district without considering locked districts', () => {
    const converter = districtWorldPoint('converter');
    expect(nearestUnlockedDistrict(converter, ['workshop'])?.id).toBe('workshop');
    expect(nearestUnlockedDistrict(converter, unlocked)?.id).toBe('converter');
  });

  it.each([
    ['left', -1, 0],
    ['right', 1, 0],
    ['up', 0, -1],
    ['down', 0, 1],
    ['up-left', -1, -1],
    ['up-right', 1, -1],
    ['down-left', -1, 1],
    ['down-right', 1, 1],
  ])('normalizes %s movement to one shared speed', (_label, x, y) => {
    const direction = normalizeMovementVector(x, y);
    expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(1);
    expect(Math.sign(direction.x)).toBe(Math.sign(x));
    expect(Math.sign(direction.y)).toBe(Math.sign(y));
  });

  it('reports nearby and in-range phases independently from the destination', () => {
    const converter = districtWorldPoint('converter');
    const nearby = buildNavigationSnapshot(
      { x: converter.x + ENTER_RADIUS + 40, y: converter.y },
      unlocked,
      null,
      'converter',
    );
    expect(nearby).toMatchObject({
      destinationDistrict: 'converter',
      nearbyDistrict: 'converter',
      operatingDistrict: null,
      phase: 'near',
    });

    const inRange = buildNavigationSnapshot(converter, unlocked, null, 'converter');
    expect(inRange).toMatchObject({
      destinationDistrict: 'converter',
      nearbyDistrict: 'converter',
      operatingDistrict: 'converter',
      phase: 'in-range',
    });
  });
});
