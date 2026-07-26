---
title: "Move power with less line loss"
summary: "Compare direct and transformed transmission at the same delivered load power."
order: 10
module: "see-fields-and-systems"
difficulty: "intermediate"
estimatedMinutes: 45
prerequisiteLessonSlugs: ["lesson-10-why-ac-won-the-grid-transformers-voltage-heat-loss", "lesson-12-neighborhood-distribution"]
referenceCircuit: "transformer-line-loss"
schematicPath: "/falstad/schematics/transformer-line-loss.svg"
schematicText: "10 V AC source -> 1 to 10 step-up transformer -> 10 ohm line -> 10 to 1 step-down transformer -> 10 ohm load"
schematicAlt: "A ten volt alternating source feeding step-up and step-down transformers with a resistive line and load between them."
status: "ready"
---

## Components

- One 10 V peak, 50 Hz AC source for the transformer path
- One adjustable 50 Hz AC source for the direct path
- One 1:10 step-up transformer
- Two 5 Ω line resistors in each path
- One 10:1 step-down transformer
- One 10 Ω load resistor in each path
- Power and current scopes

## Predict

Predict which arrangement carries more line current when both loads receive about 4.9 W:

1. A direct source adjusted to about 19.8 V peak to overcome the line drop.
2. Voltage stepped up before the line and stepped down near the load.

Use `P = VI` and `P_loss = I²R` to explain the prediction.

### Prediction answer

The direct path carries more line current. At matched load power, stepping voltage up by 10 reduces ideal line current by about 10. Because resistive loss depends on current squared, the stepped path should lose about 100 times less power in the line.

## Build

Build both paths with 10 V peak sources first. Observe that this is not a same-power comparison: the direct path delivers about 1.25 W to its load, while the ideal transformer path delivers about 4.9 W.

Then raise only the direct source to about 19.8 V peak. This makes its load power approximately match the transformer path, so line current and heating can be compared fairly.

### Build answer

Build two separate paths with identical 10 Ω loads and 10 Ω total line resistance. The transformer path should be:

```text
10 V peak source -> 1:10 step-up -> line resistance -> 10:1 step-down -> 10 Ω load
```

Keep both transformer ratios and loads fixed. Adjust only the direct source to about 19.8 V peak for the matched-power comparison.

## Measure

Record load power, line current, and total line-resistor loss for both paths after matching load power.

### Measurement answer

Both loads receive about 4.9 W. The expected comparison is:

```text
direct line current      -> about 0.70 A RMS
direct line loss         -> about 4.9 W
stepped-up line current  -> about 0.070 A RMS
stepped-up line loss     -> about 0.049 W
```

Real transformers and lines have additional losses. This exercise isolates the current-squared relationship.

## Explain

Explain why the direct source had to be raised to match delivered power, why stepping voltage up lowers line current, and why the voltage must be stepped down again near the load.

### Explanation answer

Transformers trade voltage and current. At the same delivered load power, 10 times less line current produces about 100 times less resistive line loss in this idealized comparison.

The direct source must be raised because its larger line current creates a larger voltage drop before the load. The transformer path carries the same power at higher line voltage and lower line current, then steps voltage back down so the load receives the intended level.
