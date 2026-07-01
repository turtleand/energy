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

export const collections = { learningPaths, lessons, labs };
