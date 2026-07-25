import { describe, expect, it } from 'vitest';
import { describeMissionTransition } from './transitions';

describe('Circuit Riders mission transitions', () => {
  it('distinguishes a ride within an act from crossing into a new act', () => {
    const localRide = describeMissionTransition('loopworks-01', 'loopworks-02', false);
    const actCrossing = describeMissionTransition('loopworks-04', 'converter-05', false);

    expect(localRide).toMatchObject({
      actChanged: false,
      label: 'Next patrol stop',
      destination: 'Stormglass',
      durationMs: 420,
    });
    expect(actCrossing).toMatchObject({
      actChanged: true,
      label: 'Entering Act II',
      destination: 'Wave Tamer',
      durationMs: 560,
    });
  });

  it('keeps reduced-motion travel brief without removing state feedback', () => {
    const transition = describeMissionTransition('converter-07', 'gridfall-08', true);

    expect(transition.actChanged).toBe(true);
    expect(transition.durationMs).toBe(80);
    expect(transition.destination).toBe('The Stray Path');
  });
});
