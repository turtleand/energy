---
title: "Move power with less line loss"
summary: "Use step-up and step-down transformers to lower line current for the same useful load."
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

- One 10 V peak, 50 Hz AC voltage source
- One 1:10 step-up transformer
- Two 5 Ω line resistors
- One 10:1 step-down transformer
- One 10 Ω load resistor
- Power and current scopes

## Predict

Predict which arrangement carries more line current:

1. A 10 V source connected directly through the line resistance.
2. Voltage stepped up before the line and stepped down near the load.

Use `P = VI` and `P_loss = I²R` to explain the prediction.

## Build

Build the direct low-voltage path first. Duplicate it, then add the transformer pair around the line resistance in the second path.

## Measure

Compare line current, line-resistor power, and load power. The transformer path should move comparable useful power with much lower current and much lower line heating.

Real transformers and lines have additional losses. This exercise isolates the current-squared relationship.

## Explain

Explain why stepping voltage up does not create power, why the line current falls, and why the voltage must be stepped down again near the load.

## Check your model

Transformers trade voltage and current. For the same transmitted power, higher voltage allows lower current, and lower current greatly reduces resistive line loss.

