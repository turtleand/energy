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

Predict whether capacitor voltage and current jump instantly when charging begins. Calculate the time constant with:

```text
τ = R × C
```

### Prediction answer

The time constant is:

```text
τ = 10,000 Ω × 0.0001 F = 1 second
```

Capacitor voltage cannot jump instantly. Charging current can jump to `5 V / 10 kΩ = 0.5 mA`, then falls as the capacitor charges.

## Build

Use the switch to connect the resistor either to 5 V for charging or to ground for discharging. Keep the capacitor connected to ground.

### Build answer

The resistor and capacitor stay in series, with the capacitor bottom connected to ground. The two-position switch should connect the resistor top to 5 V for charging or to ground for discharging.

## Measure

Record capacitor voltage and resistor current at the start, after 1 second, and after several seconds. Switch to discharge and compare the shape and direction of the two traces.

### Measurement answer

After one time constant, capacitor voltage reaches about 63 percent of 5 V:

```text
V₍C₎ ≈ 3.15 V after 1 second
```

Current starts near 0.5 mA and falls toward zero. During discharge, capacitor voltage decays smoothly and current reverses direction before also falling toward zero.

## Explain

Explain what the capacitor stores, why the resistor limits the initial current, and why the waveform changes fastest at the beginning.

### Explanation answer

The capacitor stores energy in an electric field and resists an instantaneous voltage change. The resistor limits current. The voltage difference across the resistor is largest at the beginning, so current and capacitor voltage change fastest then. Together, resistance and capacitance set the response time.
