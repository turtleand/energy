---
title: "Watch an RC circuit remember"
summary: "Charge and discharge a capacitor through a resistor while following voltage and current over time."
order: 5
module: "see-change-over-time"
difficulty: "foundation"
estimatedMinutes: 30
prerequisiteLessonSlugs: ["lesson-5-dc-vs-ac", "lesson-7-power-energy-bills"]
referenceCircuit: "rc-charge-discharge"
schematicPath: "/falstad/schematics/rc-charge-discharge.svg"
schematicText: "5 V or ground selected by a switch -> 10 kiloohm resistor -> 100 microfarad capacitor -> ground"
schematicAlt: "A switch selects five volts or ground, feeding a ten kiloohm resistor and one hundred microfarad capacitor."
status: "ready"
---

## Components

- One 5 V DC voltage source
- One two-position switch
- One 10 kΩ resistor
- One 100 µF capacitor
- Two scopes, for capacitor voltage and resistor current

## Predict

Predict whether capacitor voltage and current jump instantly when charging begins. Calculate the time constant:

```text
τ = R × C = 10,000 Ω × 0.0001 F = 1 second
```

## Build

Use the switch to connect the resistor either to 5 V for charging or to ground for discharging. Keep the capacitor connected to ground.

## Measure

At one time constant, capacitor voltage should reach roughly 63 percent of its final charging value. Current starts high and then falls. During discharge, voltage and current decay rather than disappearing instantly.

## Explain

Explain what the capacitor stores, why the resistor limits the initial current, and why the waveform changes fastest at the beginning.

## Check your model

The capacitor resists an instantaneous change in its voltage. The resistor and capacitor together set how quickly the circuit responds.

