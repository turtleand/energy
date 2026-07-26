import { describe, expect, it } from 'vitest';
import {
  FALSTAD_PROGRESS_KEY,
  buildBlankFalstadUrl,
  buildFalstadUrl,
  countCompletedExercises,
  isExerciseComplete,
  parseFalstadProgress,
  serializeFalstadProgress,
  setExercisePhase,
  validateFalstadExercises,
} from './falstad';

describe('Falstad progress', () => {
  it('uses a versioned, site-specific storage key', () => {
    expect(FALSTAD_PROGRESS_KEY).toBe('turtleand-energy:falstad-progress:v1');
  });

  it('round-trips safe progress data and ignores malformed records', () => {
    const parsed = parseFalstadProgress(
      JSON.stringify({
        'close-the-loop': {
          predict: true,
          build: true,
          measure: false,
          explain: false,
          updatedAt: '2026-07-26T12:00:00.000Z',
        },
        unsafe: { predict: 'yes' },
      }),
    );

    expect(parsed).toEqual({
      'close-the-loop': {
        predict: true,
        build: true,
        measure: false,
        explain: false,
        updatedAt: '2026-07-26T12:00:00.000Z',
      },
    });
    expect(parseFalstadProgress('{broken')).toEqual({});
    expect(parseFalstadProgress(null)).toEqual({});
    expect(parseFalstadProgress(serializeFalstadProgress(parsed))).toEqual(parsed);
  });

  it('updates one phase without mutating prior progress', () => {
    const original = {};
    const updated = setExercisePhase(
      original,
      'close-the-loop',
      'predict',
      true,
      '2026-07-26T13:00:00.000Z',
    );

    expect(original).toEqual({});
    expect(updated['close-the-loop']).toEqual({
      predict: true,
      build: false,
      measure: false,
      explain: false,
      updatedAt: '2026-07-26T13:00:00.000Z',
    });
  });

  it('marks an exercise complete only when all four phases are checked', () => {
    const progress = {
      'close-the-loop': {
        predict: true,
        build: true,
        measure: true,
        explain: true,
        updatedAt: '2026-07-26T13:00:00.000Z',
      },
      'ohms-law-sweep': {
        predict: true,
        build: true,
        measure: true,
        explain: false,
        updatedAt: '2026-07-26T13:10:00.000Z',
      },
    };

    expect(isExerciseComplete(progress['close-the-loop'])).toBe(true);
    expect(isExerciseComplete(progress['ohms-law-sweep'])).toBe(false);
    expect(countCompletedExercises(progress, ['close-the-loop', 'ohms-law-sweep'])).toBe(1);
  });
});

describe('Falstad links', () => {
  it('encodes an editable circuit into the official CircuitJS URL', () => {
    const circuit = '$ 1 0.000005 10 50 5 50\nr 0 0 64 0 0 100';
    const url = new URL(buildFalstadUrl(circuit));

    expect(url.origin).toBe('https://falstad.com');
    expect(url.pathname).toBe('/circuit/circuitjs.html');
    expect(url.searchParams.get('cct')).toBe(circuit);
    expect(url.searchParams.get('editable')).toBe('true');
    expect(url.searchParams.get('conventionalCurrent')).toBe('true');
  });

  it('provides a blank editable starting canvas', () => {
    const url = new URL(buildBlankFalstadUrl());

    expect(url.searchParams.get('startCircuit')).toBe('blank.txt');
    expect(url.searchParams.get('editable')).toBe('true');
  });
});

describe('Falstad content integrity', () => {
  const lessons = new Set(['lesson-1', 'lesson-3', 'lesson-4']);
  const circuits = new Set(['close-the-loop', 'ohms-law-sweep']);

  it('accepts a valid ordered exercise index', () => {
    expect(
      validateFalstadExercises(
        [
          {
            id: 'close-the-loop',
            order: 1,
            module: 'see-the-loop',
            referenceCircuit: 'close-the-loop',
            prerequisiteLessonSlugs: ['lesson-1', 'lesson-3'],
          },
          {
            id: 'ohms-law-sweep',
            order: 2,
            module: 'see-the-loop',
            referenceCircuit: 'ohms-law-sweep',
            prerequisiteLessonSlugs: ['lesson-4'],
          },
        ],
        lessons,
        circuits,
      ),
    ).toEqual([]);
  });

  it('reports duplicate orders, missing circuits, and missing lessons', () => {
    expect(
      validateFalstadExercises(
        [
          {
            id: 'close-the-loop',
            order: 1,
            module: 'see-the-loop',
            referenceCircuit: 'missing-circuit',
            prerequisiteLessonSlugs: ['missing-lesson'],
          },
          {
            id: 'ohms-law-sweep',
            order: 1,
            module: 'unknown-module',
            referenceCircuit: 'ohms-law-sweep',
            prerequisiteLessonSlugs: ['lesson-4'],
          },
        ],
        lessons,
        circuits,
      ),
    ).toEqual([
      'Duplicate exercise order: 1',
      'close-the-loop: missing reference circuit "missing-circuit"',
      'close-the-loop: missing prerequisite lesson "missing-lesson"',
      'ohms-law-sweep: unknown module "unknown-module"',
    ]);
  });
});
