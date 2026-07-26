import { FOUNDATION_MODULES } from './foundation-modules.mjs';

export { FOUNDATION_MODULES } from './foundation-modules.mjs';

export type FoundationModuleId = (typeof FOUNDATION_MODULES)[number]['id'];

export const FOUNDATION_MODULE_IDS = FOUNDATION_MODULES.map(
  (module) => module.id,
) as [FoundationModuleId, ...FoundationModuleId[]];

export interface FoundationLessonIndexItem {
  id: string;
  order: number;
  module: string;
  labSlug?: string;
}

export interface FoundationSequenceItem extends FoundationLessonIndexItem {
  previousId?: string;
  nextId?: string;
}

export function getFoundationModule(moduleId: string) {
  return FOUNDATION_MODULES.find((module) => module.id === moduleId);
}

export function buildFoundationSequence(
  lessons: FoundationLessonIndexItem[],
): FoundationSequenceItem[] {
  const sorted = [...lessons].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  return sorted.map((lesson, index) => ({
    ...lesson,
    previousId: sorted[index - 1]?.id,
    nextId: sorted[index + 1]?.id,
  }));
}

export function validateFoundationLessons(
  lessons: FoundationLessonIndexItem[],
  readyLabSlugs: Set<string>,
): string[] {
  const errors: string[] = [];
  const orderCounts = new Map<number, number>();
  const moduleCounts = new Map<string, number>();
  const knownModules = new Set<string>(FOUNDATION_MODULE_IDS);

  for (const lesson of lessons) {
    orderCounts.set(lesson.order, (orderCounts.get(lesson.order) ?? 0) + 1);
    moduleCounts.set(lesson.module, (moduleCounts.get(lesson.module) ?? 0) + 1);

    if (!knownModules.has(lesson.module)) {
      errors.push(`${lesson.id}: unknown foundation module "${lesson.module}"`);
    }

    if (!lesson.labSlug) {
      errors.push(`${lesson.id}: missing labSlug`);
    } else if (!readyLabSlugs.has(lesson.labSlug)) {
      errors.push(`${lesson.id}: missing ready lab "${lesson.labSlug}"`);
    }
  }

  for (const [order, count] of [...orderCounts.entries()].sort((a, b) => a[0] - b[0])) {
    if (count > 1) errors.push(`Duplicate lesson order: ${order}`);
  }

  for (const module of FOUNDATION_MODULES) {
    if (!moduleCounts.get(module.id)) {
      errors.push(`Foundation module "${module.id}" has no ready lessons`);
    }
  }

  return errors;
}
