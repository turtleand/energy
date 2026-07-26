import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FOUNDATION_MODULES,
  buildFoundationSequence,
  validateFoundationLessons,
  type FoundationLessonIndexItem,
} from './foundations';

const root = process.cwd();
const lessonsDir = path.join(root, 'src/content/lessons');
const labsDir = path.join(root, 'src/content/labs');

function frontmatter(source: string): string {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
}

function scalar(source: string, key: string): string | undefined {
  return frontmatter(source).match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?$`, 'm'))?.[1];
}

async function readyContent() {
  const lessons: FoundationLessonIndexItem[] = [];
  const readyLabSlugs = new Set<string>();

  for (const file of (await readdir(labsDir)).filter((candidate) => candidate.endsWith('.md'))) {
    const source = await readFile(path.join(labsDir, file), 'utf8');
    if (scalar(source, 'status') === 'ready') readyLabSlugs.add(file.replace(/\.md$/, ''));
  }

  for (const file of (await readdir(lessonsDir)).filter((candidate) => candidate.endsWith('.md'))) {
    const source = await readFile(path.join(lessonsDir, file), 'utf8');
    if (scalar(source, 'status') !== 'ready') continue;

    lessons.push({
      id: file.replace(/\.md$/, ''),
      order: Number(scalar(source, 'order')),
      module: scalar(source, 'module') ?? '',
      labSlug: scalar(source, 'labSlug'),
    });
  }

  return { lessons, readyLabSlugs };
}

describe('foundation content', () => {
  it('assigns every ready lesson to a known, populated module with a ready lab', async () => {
    const { lessons, readyLabSlugs } = await readyContent();

    expect(lessons).toHaveLength(15);
    expect(validateFoundationLessons(lessons, readyLabSlugs)).toEqual([]);
    expect(new Set(lessons.map((lesson) => lesson.module))).toEqual(
      new Set(FOUNDATION_MODULES.map((module) => module.id)),
    );
  });

  it('builds one complete sequence with reciprocal previous and next links', async () => {
    const { lessons } = await readyContent();
    const sequence = buildFoundationSequence(lessons);

    expect(sequence).toHaveLength(lessons.length);
    expect(new Set(sequence.map((lesson) => lesson.id)).size).toBe(lessons.length);
    expect(sequence[0].previousId).toBeUndefined();
    expect(sequence.at(-1)?.nextId).toBeUndefined();

    for (let index = 0; index < sequence.length - 1; index += 1) {
      expect(sequence[index].nextId).toBe(sequence[index + 1].id);
      expect(sequence[index + 1].previousId).toBe(sequence[index].id);
    }
  });

  it('reports duplicate orders, unknown modules, empty modules, and missing labs', () => {
    expect(
      validateFoundationLessons(
        [
          {
            id: 'lesson-one',
            order: 1,
            module: 'core-electricity',
            labSlug: 'missing-lab',
          },
          {
            id: 'lesson-two',
            order: 1,
            module: 'unknown-module',
          },
        ],
        new Set(),
      ),
    ).toEqual([
      'lesson-one: missing ready lab "missing-lab"',
      'lesson-two: unknown foundation module "unknown-module"',
      'Duplicate lesson order: 1',
      'Foundation module "everyday-electricity" has no ready lessons',
      'Foundation module "generate-store-move" has no ready lessons',
      'Foundation module "buildings-to-grids" has no ready lessons',
    ]);
  });
});
