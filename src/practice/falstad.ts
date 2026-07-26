export const FALSTAD_PROGRESS_KEY = 'turtleand-energy:falstad-progress:v1';

export const FALSTAD_PHASES = ['predict', 'build', 'measure', 'explain'] as const;

export const FALSTAD_SECTIONS = [
  {
    id: 'components',
    title: 'Components',
    marker: 'Setup',
    cue: 'See the parts and values before you start.',
    closedLabel: 'See what you need',
    openLabel: 'Hide components',
  },
  {
    id: 'predict',
    title: 'Predict',
    marker: '1',
    cue: 'Commit to an expected result before running the circuit.',
    closedLabel: 'Show step',
    openLabel: 'Hide step',
    phase: 'predict',
  },
  {
    id: 'build',
    title: 'Build',
    marker: '2',
    cue: 'Wire the circuit yourself from a blank canvas.',
    closedLabel: 'Show step',
    openLabel: 'Hide step',
    phase: 'build',
  },
  {
    id: 'measure',
    title: 'Measure',
    marker: '3',
    cue: 'See what to inspect, compare, and change.',
    closedLabel: 'Show step',
    openLabel: 'Hide step',
    phase: 'measure',
  },
  {
    id: 'explain',
    title: 'Explain',
    marker: '4',
    cue: 'Connect the observation back to your model.',
    closedLabel: 'Show step',
    openLabel: 'Hide step',
    phase: 'explain',
  },
  {
    id: 'check-your-model',
    title: 'Check your model',
    marker: 'Help',
    cue: 'Compare your reasoning when you are ready.',
    closedLabel: 'Reveal answer',
    openLabel: 'Hide answer',
  },
] as const;

export const FALSTAD_MODULES = [
  {
    id: 'see-the-loop',
    order: 1,
    title: 'See the loop',
    summary: 'Make voltage, current, resistance, and complete paths visible.',
  },
  {
    id: 'see-change-over-time',
    order: 2,
    title: 'See change over time',
    summary: 'Use scopes to follow stored energy, alternating signals, and conversion to DC.',
  },
  {
    id: 'see-fields-and-systems',
    order: 3,
    title: 'See fields and systems',
    summary: 'Connect magnetic fields, resonance, transformers, and line loss.',
  },
] as const;

export type FalstadPhase = (typeof FALSTAD_PHASES)[number];
export type FalstadModuleId = (typeof FALSTAD_MODULES)[number]['id'];
export type FalstadSectionId = (typeof FALSTAD_SECTIONS)[number]['id'];

export interface FalstadExerciseSection {
  id: FalstadSectionId;
  title: string;
  marker: string;
  cue: string;
  closedLabel: string;
  openLabel: string;
  phase?: FalstadPhase;
  html: string;
}

export interface ExerciseProgress {
  predict: boolean;
  build: boolean;
  measure: boolean;
  explain: boolean;
  updatedAt: string;
}

export type FalstadProgress = Record<string, ExerciseProgress>;

export interface FalstadExerciseIndexItem {
  id: string;
  order: number;
  module: string;
  referenceCircuit: string;
  prerequisiteLessonSlugs: string[];
}

const emptyExerciseProgress = (updatedAt = ''): ExerciseProgress => ({
  predict: false,
  build: false,
  measure: false,
  explain: false,
  updatedAt,
});

function isExerciseProgress(value: unknown): value is ExerciseProgress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    FALSTAD_PHASES.every((phase) => typeof candidate[phase] === 'boolean') &&
    typeof candidate.updatedAt === 'string'
  );
}

export function parseFalstadProgress(raw: string | null): FalstadProgress {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const safe: FalstadProgress = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!/^[a-z0-9-]+$/.test(id) || !isExerciseProgress(value)) continue;
      safe[id] = { ...value };
    }
    return safe;
  } catch {
    return {};
  }
}

export function serializeFalstadProgress(progress: FalstadProgress): string {
  return JSON.stringify(progress);
}

export function markExercisePhaseExplored(
  progress: FalstadProgress,
  exerciseId: string,
  phase: FalstadPhase,
  updatedAt = new Date().toISOString(),
): FalstadProgress {
  const previous = progress[exerciseId] ?? emptyExerciseProgress();
  if (previous[phase]) return progress;

  return {
    ...progress,
    [exerciseId]: {
      ...previous,
      [phase]: true,
      updatedAt,
    },
  };
}

export function areAllPhasesExplored(progress: ExerciseProgress | undefined): boolean {
  return Boolean(progress && FALSTAD_PHASES.every((phase) => progress[phase]));
}

export function countFullyExploredExercises(
  progress: FalstadProgress,
  exerciseIds: string[],
): number {
  return exerciseIds.filter((id) => areAllPhasesExplored(progress[id])).length;
}

export function splitFalstadExerciseSections(
  renderedHtml: string,
  exerciseId = 'Falstad exercise',
): FalstadExerciseSection[] {
  const headingPattern = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  const headings = Array.from(renderedHtml.matchAll(headingPattern));
  const actualSections = headings.map((heading) => ({
    id: heading[1],
    title: heading[2],
  }));
  const expectedSections = FALSTAD_SECTIONS.map(({ id, title }) => ({ id, title }));

  if (JSON.stringify(actualSections) !== JSON.stringify(expectedSections)) {
    const expected = expectedSections.map(({ title }) => title).join(', ');
    const actual = actualSections.map(({ title }) => title).join(', ') || 'none';
    throw new Error(
      `${exerciseId}: expected Falstad sections in this order: ${expected}. Received: ${actual}.`,
    );
  }

  const leadingContent = renderedHtml.slice(0, headings[0].index).trim();
  if (leadingContent) {
    throw new Error(`${exerciseId}: content must begin with the Components section.`);
  }

  return FALSTAD_SECTIONS.map((section, index) => {
    const heading = headings[index];
    const bodyStart = (heading.index ?? 0) + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? renderedHtml.length;
    const html = renderedHtml.slice(bodyStart, bodyEnd).trim();

    if (!html) {
      throw new Error(`${exerciseId}: the ${section.title} section cannot be empty.`);
    }

    return {
      ...section,
      phase: 'phase' in section ? section.phase : undefined,
      html,
    };
  });
}

export function buildFalstadUrl(circuitText: string): string {
  const url = new URL('https://falstad.com/circuit/circuitjs.html');
  url.searchParams.set('cct', circuitText.trim());
  url.searchParams.set('editable', 'true');
  url.searchParams.set('running', 'true');
  url.searchParams.set('conventionalCurrent', 'true');
  return url.toString();
}

export function buildBlankFalstadUrl(): string {
  const url = new URL('https://falstad.com/circuit/circuitjs.html');
  url.searchParams.set('startCircuit', 'blank.txt');
  url.searchParams.set('editable', 'true');
  url.searchParams.set('running', 'true');
  url.searchParams.set('conventionalCurrent', 'true');
  return url.toString();
}

export function validateFalstadExercises(
  exercises: FalstadExerciseIndexItem[],
  readyLessonSlugs: Set<string>,
  referenceCircuits: Set<string>,
): string[] {
  const errors: string[] = [];
  const orderCounts = new Map<number, number>();

  for (const exercise of exercises) {
    orderCounts.set(exercise.order, (orderCounts.get(exercise.order) ?? 0) + 1);
  }

  for (const [order, count] of [...orderCounts.entries()].sort((a, b) => a[0] - b[0])) {
    if (count > 1) errors.push(`Duplicate exercise order: ${order}`);
  }

  const validModules = new Set<string>(FALSTAD_MODULES.map((module) => module.id));
  for (const exercise of exercises) {
    if (!referenceCircuits.has(exercise.referenceCircuit)) {
      errors.push(
        `${exercise.id}: missing reference circuit "${exercise.referenceCircuit}"`,
      );
    }

    for (const lessonSlug of exercise.prerequisiteLessonSlugs) {
      if (!readyLessonSlugs.has(lessonSlug)) {
        errors.push(`${exercise.id}: missing prerequisite lesson "${lessonSlug}"`);
      }
    }

    if (!validModules.has(exercise.module)) {
      errors.push(`${exercise.id}: unknown module "${exercise.module}"`);
    }
  }

  return errors;
}
