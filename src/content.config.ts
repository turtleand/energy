import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessonStatus = z.enum(['ready', 'planned']);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    module: z.string(),
    order: z.number(),
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
    districts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        lessonSlugs: z.array(z.string()),
      }),
    ),
    accessibilityDescription: z.string(),
    entryModule: z.string(),
  }),
});

export const collections = { lessons, labs, games };
