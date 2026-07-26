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

### Prediction answer

Each branch has 6 V across it. The 1 kΩ branch carries 6 mA, the 2 kΩ branch carries 3 mA, and the source supplies 9 mA total. The equivalent resistance is about 667 Ω.

## Build

Create two branches between the same top and bottom nodes. Place one resistor in each branch.

### Build answer

Connect both resistor tops to the source node and both resistor bottoms to the return node. If the branches do not share both nodes, they are not in parallel.

## Measure

Record the voltage and current for each branch, then measure the source current. Check whether the branch currents add to the source reading.

### Measurement answer

```text
both branches -> 6 V
1 kΩ branch -> 6 mA
2 kΩ branch -> 3 mA
source total -> 9 mA
```

The equivalent resistance is about 667 Ω.

## Explain

Explain why current divides while voltage remains equal across the branches. Then explain why adding a branch lowers total resistance.

### Explanation answer

Parallel branches share the same two nodes, so they share voltage. Current divides according to branch resistance, and the source current is the sum of the branch currents. Adding another path lets more current flow at the same voltage, which lowers equivalent resistance.
