---
title: "Split current in parallel"
summary: "Give two branches the same voltage and watch their currents add at the source."
order: 4
module: "see-the-loop"
difficulty: "foundation"
estimatedMinutes: 25
prerequisiteLessonSlugs: ["lesson-3-simple-circuits-from-first-principles", "lesson-4-ohms-law-without-formula-fear"]
referenceCircuit: "parallel-current-split"
schematicPath: "/falstad/schematics/parallel-current-split.svg"
schematicText: "6 V source -> two parallel branches of 1 kiloohm and 2 kiloohms -> return"
schematicAlt: "A six volt source feeding one kiloohm and two kiloohm resistor branches in parallel."
status: "ready"
---

## Components

- One 6 V DC voltage source
- One 1 kΩ resistor
- One 2 kΩ resistor
- Wires and one ground reference

## Predict

Predict the voltage across each branch, each branch current, and the current supplied by the source.

## Build

Create two branches between the same top and bottom nodes. Place one resistor in each branch.

## Measure

Each resistor should have the full 6 V across it:

```text
1 kΩ branch -> 6 mA
2 kΩ branch -> 3 mA
source total -> 9 mA
```

The equivalent resistance is about 667 Ω.

## Explain

Explain why current divides while voltage remains equal across the branches. Then explain why adding a branch lowers total resistance.

## Check your model

Parallel branches share two nodes, so they share voltage. The source current is the sum of the branch currents.

