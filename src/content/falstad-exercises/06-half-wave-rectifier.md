---
title: "Let one AC half-cycle through"
summary: "Use one diode to turn a reversing AC waveform into pulsing one-direction output."
order: 6
module: "see-change-over-time"
difficulty: "foundation"
estimatedMinutes: 25
prerequisiteLessonSlugs: ["lesson-5-dc-vs-ac"]
referenceCircuit: "half-wave-rectifier"
schematicPath: "/falstad/schematics/half-wave-rectifier.svg"
schematicText: "10 volt peak AC source -> diode -> 1 kiloohm load -> return"
schematicAlt: "A ten volt peak alternating source feeding a diode and one kiloohm load in series."
status: "ready"
---

## Components

- One 10 V peak, 50 Hz AC voltage source
- One diode
- One 1 kΩ load resistor
- Input and output scopes

## Predict

Draw the expected source waveform and load waveform. Decide what happens during the half-cycle that reverse-biases the diode.

### Prediction answer

The diode conducts during one half-cycle and blocks the other. The load sees pulses of one polarity, reduced slightly by the diode's forward voltage. During the blocked half-cycle, load current is approximately zero.

## Build

Place the diode in series between the AC source and load. Keep the diode orientation unchanged for the first run.

### Build answer

Use one series path:

```text
AC source -> diode -> 1 kΩ load -> source return
```

Place one scope across the source and another across the load. Reversing only the diode should reverse which half-cycle reaches the load.

## Measure

Compare the source and load scopes. Record the output during both source polarities, then reverse the diode and repeat.

### Measurement answer

With the first orientation, one half-cycle appears across the load and the reverse half-cycle stays near zero. Reversing the diode passes the opposite half-cycle. The conducting pulse is slightly smaller than the source because of the diode's forward drop.

## Explain

Explain why this output is pulsing DC rather than steady DC.

### Explanation answer

The diode is a direction-sensitive path. It blocks one half-cycle and conducts during the other, so the load current no longer reverses.

The direction is fixed, which makes the output DC, but its magnitude still rises and falls to zero, which makes it pulsing rather than steady.
