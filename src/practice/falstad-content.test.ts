import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FALSTAD_SECTIONS,
  validateFalstadExercises,
  type FalstadExerciseIndexItem,
} from './falstad';

const root = process.cwd();
const exercisesDir = path.join(root, 'src/content/falstad-exercises');
const lessonsDir = path.join(root, 'src/content/lessons');
const circuitsDir = path.join(root, 'public/falstad/circuits');
const schematicsDir = path.join(root, 'public/falstad/schematics');

function frontmatter(source: string): string {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
}

function scalar(source: string, key: string): string {
  const match = frontmatter(source).match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?$`, 'm'));
  if (!match) throw new Error(`Missing ${key}`);
  return match[1];
}

function array(source: string, key: string): string[] {
  const match = frontmatter(source).match(new RegExp(`^${key}:\\s*(\\[[^\\n]+\\])$`, 'm'));
  if (!match) throw new Error(`Missing ${key}`);
  return JSON.parse(match[1]) as string[];
}

function circuitElementKinds(source: string): string[] {
  return source
    .split('\n')
    .filter((line) => line && !line.startsWith('$ ') && !line.startsWith('o '))
    .map((line) => line.split(/\s+/, 1)[0]);
}

function scopeTargets(source: string): number[] {
  return source
    .split('\n')
    .filter((line) => line.startsWith('o '))
    .map((line) => Number(line.split(/\s+/)[1]));
}

describe('Falstad exercise files', () => {
  it('ships ten ordered exercises with valid lessons, circuits, and accessible schematics', async () => {
    const exerciseFiles = (await readdir(exercisesDir))
      .filter((file) => file.endsWith('.md'))
      .sort();
    const lessonFiles = (await readdir(lessonsDir)).filter((file) => file.endsWith('.md'));
    const readyLessonSlugs = new Set<string>();

    for (const lessonFile of lessonFiles) {
      const source = await readFile(path.join(lessonsDir, lessonFile), 'utf8');
      if (scalar(source, 'status') === 'ready') {
        readyLessonSlugs.add(lessonFile.replace(/\.md$/, ''));
      }
    }

    const referenceCircuits = new Set(
      (await readdir(circuitsDir))
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace(/\.txt$/, '')),
    );
    const exercises: FalstadExerciseIndexItem[] = [];

    for (const exerciseFile of exerciseFiles) {
      const source = await readFile(path.join(exercisesDir, exerciseFile), 'utf8');
      const sectionTitles = Array.from(source.matchAll(/^## (.+)$/gm), (match) => match[1]);
      const answerTitles = Array.from(source.matchAll(/^### (.+)$/gm), (match) => match[1]);
      const headingContract = Array.from(
        source.matchAll(/^(#{2,3}) (.+)$/gm),
        (match) => `${match[1]} ${match[2]}`,
      );
      const expectedHeadingContract = FALSTAD_SECTIONS.flatMap((section) => [
        `## ${section.title}`,
        ...('answerTitle' in section ? [`### ${section.answerTitle}`] : []),
      ]);
      const referenceCircuit = scalar(source, 'referenceCircuit');
      const schematicPath = scalar(source, 'schematicPath');
      const circuitText = await readFile(
        path.join(circuitsDir, `${referenceCircuit}.txt`),
        'utf8',
      );
      const schematicFile = path.join(schematicsDir, path.basename(schematicPath));

      await access(schematicFile);
      expect(sectionTitles, `${exerciseFile} should use the disclosure section contract`).toEqual(
        FALSTAD_SECTIONS.map(({ title }) => title),
      );
      expect(answerTitles, `${exerciseFile} should provide one answer for each phase`).toEqual(
        FALSTAD_SECTIONS.flatMap((section) =>
          'answerTitle' in section ? [section.answerTitle] : [],
        ),
      );
      expect(
        headingContract,
        `${exerciseFile} should place every answer directly inside its phase`,
      ).toEqual(expectedHeadingContract);
      expect(circuitText.startsWith('$ '), `${referenceCircuit} should be CircuitJS export text`).toBe(
        true,
      );
      expect(await readFile(schematicFile, 'utf8')).toMatch(/<title>[\s\S]+<desc>/);

      if (referenceCircuit === 'bridge-and-smoothing') {
        const elements = circuitElementKinds(circuitText);
        expect(scopeTargets(circuitText)).toEqual([0, 15]);
        expect(elements[15]).toBe('r');
      }

      if (referenceCircuit === 'inductor-and-flyback') {
        const elements = circuitElementKinds(circuitText);
        expect(scopeTargets(circuitText)).toEqual([1, 3]);
        expect(elements[1]).toBe('l');
        expect(elements[3]).toBe('s');
      }

      exercises.push({
        id: exerciseFile.replace(/^\d+-|\.md$/g, ''),
        order: Number(scalar(source, 'order')),
        module: scalar(source, 'module'),
        referenceCircuit,
        prerequisiteLessonSlugs: array(source, 'prerequisiteLessonSlugs'),
      });
    }

    expect(exercises).toHaveLength(10);
    expect(exercises.map((exercise) => exercise.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(validateFalstadExercises(exercises, readyLessonSlugs, referenceCircuits)).toEqual([]);
  });
});
