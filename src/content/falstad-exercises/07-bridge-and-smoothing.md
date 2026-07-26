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

### Prediction answer

The bridge redirects both AC half-cycles so load current keeps one direction. A 50 Hz source therefore produces 100 Hz rectified pulses. The capacitor charges near each peak and supplies part of the load as the rectified voltage falls between peaks.

## Build

Build the bridge first without the capacitor. Confirm full-wave pulsing output, then place the capacitor in parallel with the load.

### Build answer

Orient the four diodes so either source polarity drives current through the load in the same direction. Connect the 100 µF capacitor directly across the load, with its positive side on the bridge's positive output.

## Measure

Measure output frequency without the capacitor. Then compare output ripple with 47 µF, 100 µF, and 470 µF. Lower the load resistance and record what changes.

### Measurement answer

The unsmoothed bridge output pulses at 100 Hz. Increasing capacitance from 47 µF to 470 µF reduces the fall between peaks, so ripple becomes smaller. Lowering load resistance draws more current and discharges the capacitor faster, so ripple increases.

## Explain

Explain why the capacitor charges near peaks, supplies part of the load between peaks, and cannot produce perfectly flat DC by itself.

### Explanation answer

Rectification controls direction. Smoothing shifts stored energy through the short gaps between rectified peaks. Regulation would be a later stage.

The capacitor charges only when bridge voltage rises above capacitor voltage. Between peaks, it releases stored electric-field energy into the load, so its voltage must fall somewhat. That repeating fall is ripple.
