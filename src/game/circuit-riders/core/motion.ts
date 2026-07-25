import type { CampaignSettings, MissionReadout } from './model';

const ALTERNATING_PHASE_MS = 760;
const SLOW_PLAY_FACTOR = 0.55;

export function getAssistedTravelRate(
  mode: CampaignSettings['mode'],
  slowMotion: boolean,
) {
  const baseRate = mode === 'planning' ? 0.00034 : 0.0002;
  return slowMotion ? baseRate * SLOW_PLAY_FACTOR : baseRate;
}

export function getFlowProgressOffset(
  time: number,
  baseSpeed: number,
  direction: MissionReadout['flow']['direction'],
) {
  if (direction === 'alternating') {
    return Math.sin(time / ALTERNATING_PHASE_MS) * baseSpeed * ALTERNATING_PHASE_MS;
  }
  return time * baseSpeed;
}
