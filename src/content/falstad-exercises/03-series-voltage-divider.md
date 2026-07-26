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

### Prediction answer

The series resistance is 3 kΩ, so the loop current is 3 mA. The 1 kΩ resistor drops 3 V, the 2 kΩ resistor drops 6 V, and the midpoint is 6 V above ground.

## Build

Connect the 1 kΩ resistor above the midpoint and the 2 kΩ resistor between the midpoint and ground.

### Build answer

The path should be:

```text
9 V source -> 1 kΩ -> midpoint -> 2 kΩ -> ground
```

Both resistors must share the same single current path. Place the midpoint probe at their connection.

## Measure

Measure the loop current, each resistor drop, and the midpoint voltage relative to ground. Check whether the two drops add back to the source voltage.

### Measurement answer

```text
loop current  -> 3 mA
1 kΩ resistor -> 3 V
2 kΩ resistor -> 6 V
midpoint      -> 6 V above ground
```

The drops add to the 9 V supplied by the source.

## Explain

Explain why both resistors carry the same current but do not receive the same voltage drop.

### Explanation answer

Series components share one current path, so both resistors carry 3 mA. Each drop is `V = IR`, so the 2 kΩ resistor drops twice as much voltage as the 1 kΩ resistor.
