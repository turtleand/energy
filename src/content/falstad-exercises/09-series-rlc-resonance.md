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

Estimate the resonant frequency with:

```text
f₀ = 1 / (2π√LC)
```

Predict how current at 20 Hz and 100 Hz will compare with current near 50 Hz.

### Prediction answer

For 100 mH and 100 µF:

```text
f₀ ≈ 50.3 Hz
```

Current should be highest near 50 Hz and lower at 20 Hz and 100 Hz. Below resonance, current leads source voltage. Above resonance, current lags it.

## Build

Place the resistor, inductor, and capacitor in one series loop. Start the source at 20 Hz, then test 50 Hz and 100 Hz.

### Build answer

Use one unbranched path:

```text
AC source -> 100 Ω -> 100 mH -> 100 µF -> source return
```

Keep component values fixed and change only source frequency. Scope source voltage and loop current.

## Measure

Measure current amplitude and its timing relative to source voltage at 20 Hz, 50 Hz, and 100 Hz.

### Measurement answer

Current reaches its maximum near 50 Hz, where the inductor and capacitor reactances nearly cancel. At 20 Hz the circuit is net capacitive, so current leads source voltage. At 100 Hz it is net inductive, so current lags. Resistance limits the resonance peak.

## Explain

Explain how the capacitor's electric field and inductor's magnetic field exchange energy, and how the resistor damps that exchange.

### Explanation answer

Near resonance, energy moves back and forth between the capacitor's electric field and the inductor's magnetic field. The resistor converts some of that energy to heat every cycle, which damps the exchange. Resonance is frequency-selective behavior, not free energy. The source replaces the energy dissipated by resistance.
