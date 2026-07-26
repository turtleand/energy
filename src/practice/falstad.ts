export const FALSTAD_PROGRESS_KEY = 'turtleand-energy:falstad-progress:v1';

export const FALSTAD_PHASES = ['predict', 'build', 'measure', 'explain'] as const;

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

export function setExercisePhase(
  progress: FalstadProgress,
  exerciseId: string,
  phase: FalstadPhase,
  checked: boolean,
  updatedAt = new Date().toISOString(),
): FalstadProgress {
  const previous = progress[exerciseId] ?? emptyExerciseProgress();
  return {
    ...progress,
    [exerciseId]: {
      ...previous,
      [phase]: checked,
      updatedAt,
    },
  };
}

export function isExerciseComplete(progress: ExerciseProgress | undefined): boolean {
  return Boolean(progress && FALSTAD_PHASES.every((phase) => progress[phase]));
}

export function countCompletedExercises(progress: FalstadProgress, exerciseIds: string[]): number {
  return exerciseIds.filter((id) => isExerciseComplete(progress[id])).length;
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
