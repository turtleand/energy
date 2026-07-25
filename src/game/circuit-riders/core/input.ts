import type { InputBindings } from './model';

export interface MovementInputContext {
  editing: boolean;
  externallyPaused: boolean;
  modalOpen: boolean;
  transitioning: boolean;
}

export function isMovementBinding(code: string, bindings: InputBindings) {
  return (
    code === bindings.left ||
    code === bindings.right ||
    code === bindings.up ||
    code === bindings.down
  );
}

export function shouldCaptureMovementInput(
  code: string,
  bindings: InputBindings,
  context: MovementInputContext,
) {
  return (
    isMovementBinding(code, bindings) &&
    !context.editing &&
    !context.externallyPaused &&
    !context.modalOpen &&
    !context.transitioning
  );
}

export function getMovementDirection(
  pressedKeys: ReadonlySet<string>,
  bindings: InputBindings,
): -1 | 0 | 1 {
  const movingCounterClockwise =
    pressedKeys.has(bindings.left) || pressedKeys.has(bindings.up);
  const movingClockwise =
    pressedKeys.has(bindings.right) || pressedKeys.has(bindings.down);

  if (movingCounterClockwise === movingClockwise) return 0;
  return movingClockwise ? 1 : -1;
}
