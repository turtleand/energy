---
title: "Sweep Ohm's Law"
summary: "Rebuild the article's 6 V and 12 Ω example, then change one variable at a time."
order: 2
module: "see-the-loop"
difficulty: "starter"
estimatedMinutes: 20
prerequisiteLessonSlugs: ["lesson-4-ohms-law-without-formula-fear"]
referenceCircuit: "ohms-law-sweep"
schematicPath: "/falstad/schematics/ohms-law-sweep.svg"
schematicText: "6 V source -> 12 ohm resistor -> return"
schematicAlt: "A six volt source and twelve ohm resistor connected in one closed loop."
status: "ready"
---

## Components

- One adjustable DC voltage source, starting at 6 V
- One adjustable resistor, starting at 12 Ω
- Wires and one ground reference

## Predict

Predict the current for three cases:

```text
6 V and 12 Ω
12 V and 12 Ω
6 V and 24 Ω
```

### Prediction answer

```text
6 V / 12 Ω  = 0.50 A
12 V / 12 Ω = 1.00 A
6 V / 24 Ω  = 0.25 A
```

Doubling voltage doubles current when resistance stays fixed. Doubling resistance halves current when voltage stays fixed.

## Build

Create the 6 V and 12 Ω loop. Edit only one value between observations so cause and effect stay clear.

### Build answer

Use one closed series loop:

```text
adjustable source -> adjustable resistor -> source return
```

Keep the ground reference at the return. Restore the starting values before each comparison, then change only voltage or resistance.

## Measure

Use the resistor information panel or a scope to record the current in all three cases. Compare the measured ratios before revealing the expected values.

### Measurement answer

```text
6 V / 12 Ω  = 0.50 A
12 V / 12 Ω = 1.00 A
6 V / 24 Ω  = 0.25 A
```

The 12 V case carries twice the starting current. The 24 Ω case carries half the starting current.

## Explain

Explain why doubling voltage doubles current when resistance stays fixed, while doubling resistance halves current when voltage stays fixed.

### Explanation answer

Ohm's Law describes one relationship, not three separate rules. Current rises with voltage and falls with resistance:

```text
I = V / R
```
