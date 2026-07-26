import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FOUNDATION_MODULES } from '../src/data/foundation-modules.mjs';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const lessonsDir = path.join(root, 'src/content/lessons');
const labsDir = path.join(root, 'src/content/labs');
const gamesDir = path.join(root, 'src/content/games');
const falstadExercisesDir = path.join(root, 'src/content/falstad-exercises');
const curriculaPath = path.join(root, 'src/data/curricula.json');

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split('\n')) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, raw] = pair;
    data[key] = raw.replace(/^['\"]|['\"]$/g, '');
  }
  return { data, body: match[2].trim() };
}

async function readCollection(dir, routePrefix) {
  const names = await readdir(dir);
  const items = [];
  for (const name of names.filter((file) => file.endsWith('.md')).sort()) {
    const source = await readFile(path.join(dir, name), 'utf8');
    const { data, body } = parseFrontmatter(source);
    if (data.status !== 'ready') continue;
    const slug = data.slug || name.replace(/\.md$/, '');
    items.push({
      title: data.title,
      summary: data.summary,
      url: `${routePrefix}/${slug}/`,
      slug,
      labSlug: data.labSlug,
      lessonSlug: data.lessonSlug,
      module: data.module,
      order: Number(data.order) || 0,
      body,
    });
  }
  return items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

const lessons = await readCollection(lessonsDir, '/lessons');
const labs = await readCollection(labsDir, '/labs');
const games = (await readCollection(gamesDir, '/play')).map((game) => ({
  ...game,
  url: `/play/${game.slug}/`,
}));
const falstadExercises = (await readCollection(falstadExercisesDir, '/practice/falstad')).map(
  (exercise) => ({
    ...exercise,
    slug: exercise.slug.replace(/^\d+-/, ''),
    url: `/practice/falstad/${exercise.slug.replace(/^\d+-/, '')}/`,
  }),
);
const curricula = JSON.parse(await readFile(curriculaPath, 'utf8'))
  .filter((curriculum) => curriculum.status === 'published')
  .sort((a, b) => a.order - b.order);
const labsBySlug = new Map(labs.map((item) => [item.slug, item]));
const foundationModules = [...FOUNDATION_MODULES].sort((a, b) => a.order - b.order);
const foundationModuleIds = new Set(foundationModules.map((module) => module.id));
const ungroupedLessons = lessons.filter((lesson) => !foundationModuleIds.has(lesson.module));

if (ungroupedLessons.length > 0) {
  throw new Error(
    `Cannot generate discovery files: ungrouped lessons ${ungroupedLessons
      .map((lesson) => lesson.slug)
      .join(', ')}`,
  );
}

function embeddedSimulationSummary(lesson) {
  const lab = lesson.labSlug ? labsBySlug.get(lesson.labSlug) : undefined;
  return lab ? ` Includes embedded simulation: ${lab.summary}` : '';
}

const compact = [
  '# Turtleand Energy',
  '',
  'Turtleand Energy is a public learning surface for energy, electricity, circuits, and physical systems.',
  '',
  '## Learn: electricity foundations',
  '- [Follow the foundation path](https://energy.turtleand.com/learn/): Fifteen connected lessons from first electricity intuition to buildings, grids, and generation mixes.',
  '',
  ...foundationModules.flatMap((module) => [
    `### ${module.title}`,
    ...lessons
      .filter((item) => item.module === module.id)
      .map(
        (item) =>
          `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}${embeddedSimulationSummary(item)}`,
      ),
    '',
  ]),
  '## Practice',
  '- [Guided Falstad circuit practice](https://energy.turtleand.com/practice/falstad/): Ten build-from-blank exercises across complete loops, changing signals, fields, resonance, transformers, and line loss.',
  ...falstadExercises.flatMap((item) => [
    `- [Rung ${item.order}: ${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`,
  ]),
  '',
  '## Play',
  '- [Choose an Energy game](https://energy.turtleand.com/play/): Compare the guided Circuit Riders campaign with the open Gridkeeper island restoration.',
  ...games.flatMap((item) => [
    `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`,
  ]),
  '',
  '## Go deeper',
  ...curricula.map(
    (curriculum) =>
      `- [${curriculum.title}](https://energy.turtleand.com/curricula/${curriculum.slug}/): ${curriculum.summary}`,
  ),
  '',
].join('\n');

const full = [
  compact,
  '## Foundation article details',
  ...lessons.flatMap((item) => {
    const lab = item.labSlug ? labsBySlug.get(item.labSlug) : undefined;
    return [
      `### ${item.title}`,
      '',
      item.body,
      '',
      ...(lab ? ['Embedded simulation:', '', lab.summary, ''] : []),
    ];
  }),
  '## Falstad practice details',
  '',
  'Each exercise follows the same manual workflow: predict, build from blank, measure, and explain. Reference simulations are optional and editable.',
  '',
  ...falstadExercises.flatMap((item) => [
    `### Rung ${item.order}: ${item.title}`,
    '',
    item.body,
    '',
  ]),
  '## Deeper curriculum details',
  ...curricula.flatMap((curriculum) => [
    `### ${curriculum.title}`,
    '',
    curriculum.outcome,
    '',
    ...curriculum.modules.flatMap((module, index) => [
      `${index + 1}. **${module.title}**`,
      `   ${module.description}`,
      `   Topics: ${module.topics.join(' / ')}`,
      '',
    ]),
  ]),
].join('\n');

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'llms.txt'), compact, 'utf8');
await writeFile(path.join(publicDir, 'llms-full.txt'), full, 'utf8');

console.log(
  `Generated llms.txt with ${curricula.length} curriculum, ${lessons.length} article(s), ${games.length} game(s), ${falstadExercises.length} Falstad exercise(s), and embedded simulation metadata.`,
);
