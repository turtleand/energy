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

## Build

Build both paths with 10 V peak sources first. Observe that this is not a same-power comparison: the direct path delivers about 1.25 W to its load, while the ideal transformer path delivers about 4.9 W.

Then raise only the direct source to about 19.8 V peak. This makes its load power approximately match the transformer path, so line current and heating can be compared fairly.

## Measure

Confirm that both loads now receive about 4.9 W. The direct line carries about 0.70 A RMS and loses about 4.9 W across its two line resistors. The stepped-up line carries about 0.070 A RMS and loses about 0.049 W.

Real transformers and lines have additional losses. This exercise isolates the current-squared relationship.

## Explain

Explain why the direct source had to be raised to match delivered power, why stepping voltage up lowers line current, and why the voltage must be stepped down again near the load.

## Check your model

Transformers trade voltage and current. At the same delivered load power, 10 times less line current produces about 100 times less resistive line loss in this idealized comparison.
