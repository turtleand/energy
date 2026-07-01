import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const learningPathsDir = path.join(root, 'src/content/learning-paths');
const lessonsDir = path.join(root, 'src/content/lessons');
const labsDir = path.join(root, 'src/content/labs');

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
    const slug = name.replace(/\.md$/, '');
    items.push({
      title: data.title,
      summary: data.summary,
      url: `${routePrefix}/${slug}/`,
      slug,
      labSlug: data.labSlug,
      lessonSlug: data.lessonSlug,
      body,
    });
  }
  return items;
}

const learningPaths = await readCollection(learningPathsDir, '/learning-paths');
const lessons = await readCollection(lessonsDir, '/lessons');
const labs = await readCollection(labsDir, '/labs');
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
  '## Learning paths',
  ...learningPaths.flatMap((item) => [
    `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`,
  ]),
  '',
  '## Articles',
  ...lessons.flatMap((item) => [
    `- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}${embeddedSimulationSummary(item)}`,
  ]),
  '',
].join('\n');

const full = [
  compact,
  '## Learning path details',
  ...learningPaths.flatMap((item) => [
    `### ${item.title}`,
    '',
    item.body,
    '',
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
  `Generated llms.txt with ${learningPaths.length} learning path(s), ${lessons.length} article(s), and embedded simulation metadata.`
);
