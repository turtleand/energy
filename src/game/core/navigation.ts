import { districtById, districts, type DistrictId } from '../content/districts';

export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 600;
export const ENTER_RADIUS = 72;
export const EXIT_RADIUS = 88;
export const HINT_RADIUS = 150;
export const FRESH_ROVER_POSITION = { x: 275, y: 520 } as const;
export const PLAY_BOUNDS = {
  minX: 78,
  maxX: WORLD_WIDTH - 78,
  minY: 92,
  maxY: WORLD_HEIGHT - 45,
} as const;

export interface NavigationPoint {
  x: number;
  y: number;
}

export type ProximityPhase = 'far' | 'near' | 'in-range';
export type RoverStartMode = 'fresh' | 'resume';

export interface NavigationSnapshot {
  destinationDistrict: DistrictId | null;
  nearbyDistrict: DistrictId | null;
  operatingDistrict: DistrictId | null;
  phase: ProximityPhase;
}

export type NavigationTransition =
  | { type: 'arrived'; district: DistrictId }
  | { type: 'travel-interrupted' }
  | { type: 'left-ring'; district: DistrictId };

export function deriveNavigationTransition(
  previous: NavigationSnapshot,
  next: NavigationSnapshot,
): NavigationTransition | null {
  if (next.operatingDistrict && next.operatingDistrict !== previous.operatingDistrict) {
    return { type: 'arrived', district: next.operatingDistrict };
  }
  if (previous.destinationDistrict && !next.destinationDistrict) {
    return { type: 'travel-interrupted' };
  }
  if (previous.operatingDistrict && !next.operatingDistrict) {
    return { type: 'left-ring', district: previous.operatingDistrict };
  }
  return null;
}

export function districtWorldPoint(district: DistrictId): NavigationPoint {
  const { position } = districtById[district];
  return { x: position.x * WORLD_WIDTH, y: position.y * WORLD_HEIGHT };
}

export function getInitialRoverPosition(district: DistrictId, mode: RoverStartMode): NavigationPoint {
  return mode === 'fresh' ? { ...FRESH_ROVER_POSITION } : districtWorldPoint(district);
}

export function clampToPlayBounds(point: NavigationPoint): NavigationPoint {
  return {
    x: Math.min(PLAY_BOUNDS.maxX, Math.max(PLAY_BOUNDS.minX, point.x)),
    y: Math.min(PLAY_BOUNDS.maxY, Math.max(PLAY_BOUNDS.minY, point.y)),
  };
}

export function distanceBetween(a: NavigationPoint, b: NavigationPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalizeMovementVector(x: number, y: number): NavigationPoint {
  const length = Math.hypot(x, y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

export function nearestUnlockedDistrict(
  point: NavigationPoint,
  unlockedDistricts: readonly DistrictId[],
): { id: DistrictId; point: NavigationPoint; distance: number } | null {
  let nearest: { id: DistrictId; point: NavigationPoint; distance: number } | null = null;
  for (const district of districts) {
    if (!unlockedDistricts.includes(district.id)) continue;
    const districtPoint = districtWorldPoint(district.id);
    const distance = distanceBetween(point, districtPoint);
    if (!nearest || distance < nearest.distance) {
      nearest = { id: district.id, point: districtPoint, distance };
    }
  }
  return nearest;
}

export function resolveOperatingDistrict(
  point: NavigationPoint,
  unlockedDistricts: readonly DistrictId[],
  currentOperatingDistrict: DistrictId | null,
): DistrictId | null {
  if (currentOperatingDistrict && unlockedDistricts.includes(currentOperatingDistrict)) {
    const currentDistance = distanceBetween(point, districtWorldPoint(currentOperatingDistrict));
    if (currentDistance <= EXIT_RADIUS) return currentOperatingDistrict;
  }

  const nearest = nearestUnlockedDistrict(point, unlockedDistricts);
  return nearest && nearest.distance <= ENTER_RADIUS ? nearest.id : null;
}

export function buildNavigationSnapshot(
  point: NavigationPoint,
  unlockedDistricts: readonly DistrictId[],
  currentOperatingDistrict: DistrictId | null,
  destinationDistrict: DistrictId | null,
): NavigationSnapshot {
  const operatingDistrict = resolveOperatingDistrict(point, unlockedDistricts, currentOperatingDistrict);
  const nearest = nearestUnlockedDistrict(point, unlockedDistricts);
  const nearbyDistrict = operatingDistrict ?? (nearest && nearest.distance <= HINT_RADIUS ? nearest.id : null);
  return {
    destinationDistrict,
    nearbyDistrict,
    operatingDistrict,
    phase: operatingDistrict ? 'in-range' : nearbyDistrict ? 'near' : 'far',
  };
}
