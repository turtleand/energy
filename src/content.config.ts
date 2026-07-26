import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { FOUNDATION_MODULE_IDS } from './data/foundations';

const lessonStatus = z.enum(['ready', 'planned']);
const foundationModule = z.enum(FOUNDATION_MODULE_IDS);
const falstadModule = z.enum([
  'see-the-loop',
  'see-change-over-time',
  'see-fields-and-systems',
]);
const falstadDifficulty = z.enum(['starter', 'foundation', 'intermediate']);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    module: foundationModule,
    order: z.number(),
    numberLabel: z.string().optional(),
    status: lessonStatus,
    labSlug: z.string().optional(),
  }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/labs' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    lessonSlug: z.string(),
    order: z.number(),
    status: lessonStatus,
  }),
});

const games = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/games' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    status: lessonStatus,
    slug: z.string(),
    coveredLessonSlugs: z.array(z.string()),
    districts: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          lessonSlugs: z.array(z.string()),
        }),
      )
      .optional(),
    campaignActs: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          missionIds: z.array(z.string()),
        }),
      )
      .optional(),
    missions: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          lessonSlug: z.string(),
          act: z.string(),
        }),
      )
      .optional(),
    accessibilityDescription: z.string(),
    entryModule: z.string(),
  }),
});

const falstadExercises = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/falstad-exercises' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().positive(),
    module: falstadModule,
    difficulty: falstadDifficulty,
    estimatedMinutes: z.number().int().positive(),
    prerequisiteLessonSlugs: z.array(z.string()).min(1),
    referenceCircuit: z.string().regex(/^[a-z0-9-]+$/),
    schematicPath: z.string().startsWith('/falstad/schematics/'),
    schematicText: z.string(),
    schematicAlt: z.string(),
    status: lessonStatus,
  }),
});

export const collections = { lessons, labs, games, falstadExercises };
