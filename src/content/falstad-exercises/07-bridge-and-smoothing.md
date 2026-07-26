---
title: "Rectify and smooth AC"
summary: "Build a bridge rectifier, then use a capacitor to reduce the valleys in its output."
order: 7
module: "see-change-over-time"
difficulty: "intermediate"
estimatedMinutes: 40
prerequisiteLessonSlugs: ["lesson-5-dc-vs-ac", "lesson-7-power-energy-bills"]
referenceCircuit: "bridge-and-smoothing"
schematicPath: "/falstad/schematics/bridge-and-smoothing.svg"
schematicText: "12 volt peak AC source -> four-diode bridge -> 100 microfarad capacitor in parallel with 1 kiloohm load"
schematicAlt: "A twelve volt peak alternating source feeding a four-diode bridge, smoothing capacitor, and one kiloohm load."
status: "ready"
---

## Components

- One 12 V peak, 50 Hz AC voltage source
- Four diodes
- One 1 kΩ load resistor
- One 100 µF capacitor
- Input and output scopes

## Predict

Predict how a bridge uses both AC half-cycles. Then predict what the capacitor does near each waveform peak and valley.

## Build

Build the bridge first without the capacitor. Confirm full-wave pulsing output, then place the capacitor in parallel with the load.

## Measure

The bridge output should pulse at twice the source frequency. Compare 47 µF, 100 µF, and 470 µF. Larger capacitance should reduce ripple.

Lower the load resistance and observe that heavier current demand increases ripple.

## Explain

Explain why the capacitor charges near peaks, supplies part of the load between peaks, and cannot produce perfectly flat DC by itself.

## Check your model

Rectification controls direction. Smoothing shifts stored energy through the short gaps between rectified peaks. Regulation would be a later stage.

