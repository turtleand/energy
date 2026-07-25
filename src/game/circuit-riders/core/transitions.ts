import { acts, missionById, type MissionId } from '../content/campaign';

export interface MissionTransition {
  actChanged: boolean;
  destination: string;
  durationMs: number;
  label: string;
}

export function describeMissionTransition(
  from: MissionId,
  to: MissionId,
  reducedMotion: boolean,
): MissionTransition {
  const destination = missionById[to];
  const actChanged = missionById[from].act !== destination.act;
  const act = acts.find((candidate) => candidate.id === destination.act);

  return {
    actChanged,
    destination: destination.title,
    durationMs: reducedMotion ? 80 : actChanged ? 560 : 420,
    label: actChanged ? `Entering ${act?.title.split(':')[0] ?? 'next act'}` : 'Next patrol stop',
  };
}
