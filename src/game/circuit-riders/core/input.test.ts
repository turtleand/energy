import { describe, expect, it } from 'vitest';
import type { InputBindings } from './model';
import {
  getMovementDirection,
  isMovementBinding,
  shouldCaptureMovementInput,
} from './input';

const bindings: InputBindings = {
  left: 'KeyA',
  right: 'KeyD',
  up: 'KeyS',
  down: 'KeyW',
  action: 'Space',
  pause: 'KeyP',
  lens: 'KeyF',
};

describe('Circuit Riders movement input', () => {
  it('recognizes every configured movement binding without capturing shortcuts', () => {
    expect(['KeyA', 'KeyD', 'KeyS', 'KeyW'].every((code) => isMovementBinding(code, bindings))).toBe(
      true,
    );
    expect(isMovementBinding(bindings.action, bindings)).toBe(false);
    expect(isMovementBinding(bindings.pause, bindings)).toBe(false);
  });

  it('keeps clockwise, counter-clockwise, and cancellation behavior aligned', () => {
    expect(getMovementDirection(new Set(['KeyD']), bindings)).toBe(1);
    expect(getMovementDirection(new Set(['KeyW']), bindings)).toBe(1);
    expect(getMovementDirection(new Set(['KeyA']), bindings)).toBe(-1);
    expect(getMovementDirection(new Set(['KeyS']), bindings)).toBe(-1);
    expect(getMovementDirection(new Set(['KeyD', 'KeyA']), bindings)).toBe(0);
    expect(getMovementDirection(new Set(['KeyW', 'KeyS']), bindings)).toBe(0);
  });

  it.each([
    ['paused or hidden', { externallyPaused: true }],
    ['mission transition', { transitioning: true }],
    ['open modal', { modalOpen: true }],
    ['editable control', { editing: true }],
  ])('does not capture movement during %s', (_label, blockedState) => {
    expect(
      shouldCaptureMovementInput('KeyD', bindings, {
        externallyPaused: false,
        transitioning: false,
        modalOpen: false,
        editing: false,
        ...blockedState,
      }),
    ).toBe(false);
  });

  it('captures configured movement during active gameplay', () => {
    expect(
      shouldCaptureMovementInput('KeyD', bindings, {
        externallyPaused: false,
        transitioning: false,
        modalOpen: false,
        editing: false,
      }),
    ).toBe(true);
  });
});
