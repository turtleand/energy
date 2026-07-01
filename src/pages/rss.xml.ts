import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@data/site';

const feedUrl = new URL('/rss.xml', site.url).href;

export async function GET() {
  const learningPaths = (await getCollection('learningPaths', ({ data }) => data.status === 'ready')).sort(
    (a, b) => a.data.order - b.data.order
  );
  const lessons = (await getCollection('lessons', ({ data }) => data.status === 'ready')).sort(
    (a, b) => a.data.order - b.data.order
  );

  const learningPathItems = learningPaths.map((learningPath) => ({
    title: learningPath.data.title,
    description: learningPath.data.summary,
    link: `learning-paths/${learningPath.id}/`,
    categories: ['learning-path', learningPath.data.status],
    customData: '<dc:creator>Turtleand</dc:creator>',
  }));

  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
    },
    customData: [
      '<language>en</language>',
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    items: [
      ...learningPathItems,
      ...lessons.map((lesson) => ({
        title: lesson.data.title,
        description: lesson.data.labSlug
          ? `${lesson.data.summary} Includes an interactive simulation.`
          : lesson.data.summary,
        link: `lessons/${lesson.id}/`,
        categories: [lesson.data.module, lesson.data.status, lesson.data.labSlug ? 'simulation-available' : 'lesson'].filter(Boolean),
        customData: '<dc:creator>Turtleand</dc:creator>',
      })),
    ],
  });
}
