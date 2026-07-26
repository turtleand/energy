import { describe, expect, it } from 'vitest';
import {
  FALSTAD_PROGRESS_KEY,
  FALSTAD_SECTIONS,
  areAllPhasesExplored,
  buildBlankFalstadUrl,
  buildFalstadUrl,
  countFullyExploredExercises,
  markExercisePhaseExplored,
  parseFalstadProgress,
  serializeFalstadProgress,
  splitFalstadExerciseSections,
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

  it('marks one phase explored without mutating prior progress', () => {
    const original = {};
    const updated = markExercisePhaseExplored(
      original,
      'close-the-loop',
      'predict',
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

  it('does not rewrite progress when an explored phase is opened again', () => {
    const progress = {
      'close-the-loop': {
        predict: true,
        build: false,
        measure: false,
        explain: false,
        updatedAt: '2026-07-26T13:00:00.000Z',
      },
    };

    expect(
      markExercisePhaseExplored(
        progress,
        'close-the-loop',
        'predict',
        '2026-07-26T14:00:00.000Z',
      ),
    ).toBe(progress);
  });

  it('marks an exercise fully explored only when all four phases were opened', () => {
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

    expect(areAllPhasesExplored(progress['close-the-loop'])).toBe(true);
    expect(areAllPhasesExplored(progress['ohms-law-sweep'])).toBe(false);
    expect(countFullyExploredExercises(progress, ['close-the-loop', 'ohms-law-sweep'])).toBe(1);
  });
});

describe('Falstad disclosure sections', () => {
  const renderedHtml = [
    '<h2 id="components">Components</h2>',
    '<ul><li>One resistor</li></ul>',
    '<h2 id="predict">Predict</h2>',
    '<p>Predict the current.</p>',
    '<h2 id="build">Build</h2>',
    '<p>Wire the loop.</p>',
    '<h2 id="measure">Measure</h2>',
    '<pre><code>I = V / R</code></pre>',
    '<h2 id="explain">Explain</h2>',
    '<p>Explain the result.</p>',
    '<h2 id="check-your-model">Check your model</h2>',
    '<p>The loop must be closed.</p>',
  ].join('\n');

  it('splits compiled Markdown into six ordered disclosures', () => {
    const sections = splitFalstadExerciseSections(renderedHtml, 'close-the-loop');

    expect(sections.map(({ id }) => id)).toEqual(FALSTAD_SECTIONS.map(({ id }) => id));
    expect(sections[0].html).toContain('<ul><li>One resistor</li></ul>');
    expect(sections[3].html).toContain('<pre><code>I = V / R</code></pre>');
    expect(sections[1].phase).toBe('predict');
    expect(sections[5].phase).toBeUndefined();
  });

  it('rejects missing, duplicate, or out-of-order headings', () => {
    expect(() =>
      splitFalstadExerciseSections(
        renderedHtml.replace('<h2 id="measure">Measure</h2>', ''),
        'missing-measure',
      ),
    ).toThrow(/expected Falstad sections in this order/);

    expect(() =>
      splitFalstadExerciseSections(
        renderedHtml.replace(
          '<h2 id="build">Build</h2>',
          '<h2 id="predict">Predict</h2><h2 id="build">Build</h2>',
        ),
        'duplicate-predict',
      ),
    ).toThrow(/expected Falstad sections in this order/);

    expect(() =>
      splitFalstadExerciseSections(
        renderedHtml
          .replace('<h2 id="predict">Predict</h2>', '<h2 id="temporary">Temporary</h2>')
          .replace('<h2 id="build">Build</h2>', '<h2 id="predict">Predict</h2>')
          .replace('<h2 id="temporary">Temporary</h2>', '<h2 id="build">Build</h2>'),
        'out-of-order',
      ),
    ).toThrow(/expected Falstad sections in this order/);
  });

  it('rejects content before Components and empty sections', () => {
    expect(() =>
      splitFalstadExerciseSections(`<p>Lead-in</p>${renderedHtml}`, 'leading-content'),
    ).toThrow(/must begin with the Components section/);

    expect(() =>
      splitFalstadExerciseSections(
        renderedHtml.replace('<p>Wire the loop.</p>', ''),
        'empty-build',
      ),
    ).toThrow(/the Build section cannot be empty/);
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
