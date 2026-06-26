import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
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
      body,
    });
  }
  return items;
}

const lessons = await readCollection(lessonsDir, '/lessons');
const labs = await readCollection(labsDir, '/labs');

const compact = [
  '# Turtleand Energy',
  '',
  'Turtleand Energy is a public learning surface for energy, electricity, circuits, and physical systems.',
  '',
  '## Lessons',
  ...lessons.flatMap((item) => [`- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`]),
  '',
  '## Labs',
  ...labs.flatMap((item) => [`- [${item.title}](https://energy.turtleand.com${item.url}): ${item.summary}`]),
  '',
].join('\n');

const full = [
  compact,
  '## Lesson details',
  ...lessons.flatMap((item) => [`### ${item.title}`, '', item.body, '']),
  '## Lab details',
  ...labs.flatMap((item) => [`### ${item.title}`, '', item.body, '']),
].join('\n');

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'llms.txt'), compact, 'utf8');
await writeFile(path.join(publicDir, 'llms-full.txt'), full, 'utf8');

console.log(`Generated llms.txt with ${lessons.length} lesson(s) and ${labs.length} lab(s).`);
