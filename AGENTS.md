# AGENTS.md - energy

Repository guidance for AI agents and Codex review.

## Scope

Applies only to `energy/`.

## Ecosystem role

- Energy is Turtleand's learning surface for electricity, circuits, power, storage, grids, and physical energy systems.
- Its job is beginner intuition first, then precise models, then interactive practice.
- Keep it practical and visual. Avoid turning the homepage into a shelf of empty future promises.
- Route software implementation notes to Build, AI curriculum to AI Lab, compact doctrine to Handbook, ecosystem routing to Portal, and agent-system work to OpenClaw or Hermes Lab.

## Project summary

- Stack: Astro static site
- Primary domain: `https://energy.turtleand.com`
- Primary content: lessons and interactive labs
- First artifact: Lesson 1 energy-flow circuit lab

## Workflow

1. Prefer edits under `src/`, `public/`, and `scripts/`.
2. Keep the homepage minimal. Add sections only when there is real content behind them.
3. Use content collections for lessons and labs instead of hardcoding expansion lists.
4. Do not modify `dist/` unless explicitly preparing a static deployment branch.
5. Run local validation before PR or deployment.

## Public-safety review

Reject changes that expose secrets, credentials, private infrastructure details, internal paths, operational weaknesses, personal data, or misleading safety advice.

Energy content may discuss public science, educational circuit models, safety basics, and general engineering trade-offs. It must not encourage unsafe electrical work or imply that simplified educational diagrams are instructions for mains power.

## Content quality review

- Start from intuition, then add equations.
- Distinguish analogy from physical reality.
- Keep claims grounded and avoid hype.
- Use calm, precise, direct Turtleand voice.
- Do not introduce em dashes in public writing.
- Make interactive controls explain visible behavior.
- Keep humans responsible for judgment and safety.

## Validation checklist

- `npm run build`
- `git diff --check`
- Browser check for `/` and `/labs/lesson-1-energy-flow/`
- Console check after interacting with the lab
- Mobile or narrow viewport smoke check when the UI changes
- Focused public-safety scan on changed files

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
