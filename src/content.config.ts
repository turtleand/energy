import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessonStatus = z.enum(['ready', 'planned']);

const learningPaths = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/learning-paths' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    status: lessonStatus,
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    module: z.string(),
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

export const collections = { learningPaths, lessons, labs, games };
