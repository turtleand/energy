---
title: "Divide voltage in series"
summary: "Use two series resistors to see shared current and proportional voltage drops."
order: 3
module: "see-the-loop"
difficulty: "foundation"
estimatedMinutes: 25
prerequisiteLessonSlugs: ["lesson-4-ohms-law-without-formula-fear"]
referenceCircuit: "series-voltage-divider"
schematicPath: "/falstad/schematics/series-voltage-divider.svg"
schematicText: "9 V source -> 1 kiloohm resistor -> midpoint -> 2 kiloohm resistor -> ground"
schematicAlt: "A nine volt source feeding a one kiloohm and two kiloohm resistor in series with a measurable midpoint."
status: "ready"
---

## Components

- One 9 V DC voltage source
- One 1 kΩ resistor
- One 2 kΩ resistor
- One midpoint probe and one ground reference

## Predict

Predict the total resistance, loop current, voltage across each resistor, and midpoint voltage relative to ground.

## Build

Connect the 1 kΩ resistor above the midpoint and the 2 kΩ resistor between the midpoint and ground.

## Measure

The total resistance is 3 kΩ, so the series current should be 3 mA. The voltage drops should be:

```text
1 kΩ resistor -> 3 V
2 kΩ resistor -> 6 V
```

The drops add to the 9 V supplied by the source.

## Explain

Explain why both resistors carry the same current but do not receive the same voltage drop.

## Check your model

Series components share one current path. Their voltage drops divide in proportion to their resistance.

