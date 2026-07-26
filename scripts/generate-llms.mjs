import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const lessonsDir = path.join(root, 'src/content/lessons');
const labsDir = path.join(root, 'src/content/labs');
const gamesDir = path.join(root, 'src/content/games');
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
const curricula = JSON.parse(await readFile(curriculaPath, 'utf8'))
  .filter((curriculum) => curriculum.status === 'ready')
  .sort((a, b) => a.order - b.order);
const labsBySlug = new Map(labs.map((item) => [item.slug, item]));

function embeddedSimulationSummary(lesson) {
  const lab = lesson.labSlug ? labsBySlug.get(lesson.labSlug) : undefined;
  return lab ? ` Includes embedded simulation: ${lab.summary}` : '';
}

const compact = [
  '# Turtleand Energy',
  '',
  'Turtleand Energy is a public learning surface for energy, electricity, circuits, and physical systems.',
  '',
  '## Curricula',
  ...curricula.map(
    (curriculum) =>
      `- [${curriculum.title}](https://energy.turtleand.com/curricula/${curriculum.slug}/): ${curriculum.summary}`,
  ),
  '',
  '## Articles',
  ...lessons.flatMap((item) => [
    `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}${embeddedSimulationSummary(item)}`,
  ]),
  '',
  '## Games',
  ...games.flatMap((item) => [
    `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`,
  ]),
  '',
].join('\n');

const full = [
  compact,
  '## Curriculum details',
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
  '## Article details',
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
].join('\n');

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'llms.txt'), compact, 'utf8');
await writeFile(path.join(publicDir, 'llms-full.txt'), full, 'utf8');

console.log(
  `Generated llms.txt with ${curricula.length} curriculum, ${lessons.length} article(s), ${games.length} game(s), and embedded simulation metadata.`,
);
