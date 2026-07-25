import { describe, expect, it } from 'vitest';
import { acts, lessonMissionMap, missions } from './campaign';

describe('Circuit Riders curriculum campaign', () => {
  it('maps every Energy lesson to exactly one playable mission', () => {
    expect(missions).toHaveLength(12);
    expect(Object.keys(lessonMissionMap)).toHaveLength(12);
    expect(new Set(missions.map((mission) => mission.lessonSlug)).size).toBe(12);
  });

  it('groups the continuous campaign into the required three acts', () => {
    expect(acts.map((act) => act.id)).toEqual(['loopworks', 'converter', 'gridfall']);
    expect(acts.map((act) => act.missionIds.length)).toEqual([4, 3, 5]);
  });

  it('ends with an integrated city mission that reuses the full system', () => {
    const finale = missions.at(-1);

    expect(finale?.id).toBe('gridfall-12');
    expect(finale?.isFinale).toBe(true);
    expect(finale?.reuses).toEqual(
      expect.arrayContaining([
        'closed-loop',
        'conversion',
        'power-and-energy',
        'protection',
        'transmission',
        'distribution',
      ]),
    );
  });
});
