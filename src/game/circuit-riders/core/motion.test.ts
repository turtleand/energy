import { describe, expect, it } from 'vitest';
import { getAssistedTravelRate, getFlowProgressOffset } from './motion';

describe('Circuit Riders motion helpers', () => {
  it('slows assisted travel in both action and planning modes', () => {
    expect(getAssistedTravelRate('action', true)).toBeLessThan(
      getAssistedTravelRate('action', false),
    );
    expect(getAssistedTravelRate('planning', true)).toBeLessThan(
      getAssistedTravelRate('planning', false),
    );
  });

  it('keeps alternating flow continuous while it slows and reverses', () => {
    const reversal = (Math.PI / 2) * 760;
    const before = getFlowProgressOffset(reversal - 10, 0.000055, 'alternating');
    const atReversal = getFlowProgressOffset(reversal, 0.000055, 'alternating');
    const after = getFlowProgressOffset(reversal + 10, 0.000055, 'alternating');

    expect(atReversal).toBeGreaterThan(before);
    expect(atReversal).toBeGreaterThan(after);
    expect(Math.abs(after - before)).toBeLessThan(0.000001);
  });

  it('keeps one-way flow advancing steadily', () => {
    expect(getFlowProgressOffset(2_000, 0.000055, 'one-way')).toBeCloseTo(0.11);
  });
});
