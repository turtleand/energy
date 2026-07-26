# Turtleand Energy

Turtleand Energy is a public learning surface for electricity, circuits, power, storage, grids, and the physical systems that turn energy into useful work.

## Public structure

The site has one primary learning path and three optional branches:

- **Learn** at `/learn/`: fifteen foundation lessons grouped into four modules. Each lesson keeps its interactive simulation inside the article.
- **Practice** at `/practice/falstad/`: ten build-from-blank CircuitJS exercises organized as a three-module ladder.
- **Play** at `/play/`: a chooser for Circuit Riders and Gridkeeper, two games that reinforce the foundation lessons.
- **Go deeper** at `/curricula/electricity-depth-circuits-and-electronics/`: a reference outline for the next layer of circuits and electronics study.

The homepage is an orientation surface for these four destinations. It should not become a second article archive or a shelf of future promises.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Astro, usually `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

The build writes static output to `dist/`.

## Content model

Lessons live in:

```text
src/content/lessons/
```

Labs live in:

```text
src/content/labs/
```

A lesson can link to a lab with `labSlug`. The homepage should show only ready, populated content.

Ready lessons also declare one typed foundation module in `module`:

- `core-electricity`
- `everyday-electricity`
- `generate-store-move`
- `buildings-to-grids`

Module names, ordering, summaries, sequencing helpers, and validation live in `src/data/foundations.ts`. Add or move lessons through frontmatter instead of hardcoding lesson lists into pages.

Game metadata lives in `src/content/games/`. Falstad exercise content lives in `src/content/falstad-exercises/`, with its module definitions and progress model in `src/practice/falstad.ts`.

The build regenerates `public/llms.txt` and `public/llms-full.txt` in the same Learn, Practice, Play, and Go deeper order as the public navigation.

## Deployment

The repo includes `netlify.toml` for Netlify static hosting and `public/CNAME` for `energy.turtleand.com`. A GitHub Pages deploy can also publish the generated `dist/` folder from a deploy branch if Turtleand chooses that path.
