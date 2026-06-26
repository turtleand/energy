# Turtleand Energy

Turtleand Energy is a public learning surface for energy, electricity, circuits, and the systems that turn physical reality into useful work.

The first version is intentionally small. It ships one clear doorway and one interactive lesson artifact instead of empty sections for future ideas.

## What is included now

- Homepage for `https://energy.turtleand.com`
- Content model for lessons and labs
- Lesson 1 content: electricity from first principles
- Interactive lab: voltage, resistance, current, power, and energy flow in a simple circuit
- Public discovery files: `robots.txt`, sitemap generation, `llms.txt`, and `llms-full.txt`

## Planned expansion

The structure is ready for future sections, but the homepage only renders sections that have real content. Good future candidates:

- More lessons
- More labs
- Circuit practice artifacts
- Energy maps
- Storage and grid explainers

Do not add empty homepage shelves just because the model can support them.

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

## Deployment

The repo includes `netlify.toml` for Netlify static hosting and `public/CNAME` for `energy.turtleand.com`. A GitHub Pages deploy can also publish the generated `dist/` folder from a deploy branch if Turtleand chooses that path.
