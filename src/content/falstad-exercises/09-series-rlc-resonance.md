---
title: "Find series resonance"
summary: "Sweep an RLC circuit around 50 Hz and watch current peak when energy exchange lines up."
order: 9
module: "see-fields-and-systems"
difficulty: "intermediate"
estimatedMinutes: 40
prerequisiteLessonSlugs: ["lesson-5-dc-vs-ac", "lesson-9-generators-electromagnetic-induction"]
referenceCircuit: "series-rlc-resonance"
schematicPath: "/falstad/schematics/series-rlc-resonance.svg"
schematicText: "5 V AC source -> 100 ohm resistor -> 100 millihenry inductor -> 100 microfarad capacitor -> return"
schematicAlt: "A five volt alternating source feeding a resistor, inductor, and capacitor in one series loop."
status: "ready"
---

## Components

- One adjustable 5 V peak AC voltage source
- One 100 Ω resistor
- One 100 mH inductor
- One 100 µF capacitor
- Voltage and current scopes

## Predict

Estimate the resonant frequency:

```text
f₀ = 1 / (2π√LC) ≈ 50 Hz
```

Predict how current at 20 Hz and 100 Hz will compare with current near 50 Hz.

## Build

Place the resistor, inductor, and capacitor in one series loop. Start the source at 20 Hz, then test 50 Hz and 100 Hz.

## Measure

Near resonance, the inductor and capacitor reactances oppose each other, so series current reaches a maximum limited mainly by resistance.

Compare the timing of source voltage and current at all three frequencies.

## Explain

Explain how the capacitor's electric field and inductor's magnetic field exchange energy, and how the resistor damps that exchange.

## Check your model

Resonance is frequency-selective behavior. It is not free energy. The source replaces energy dissipated by resistance.

