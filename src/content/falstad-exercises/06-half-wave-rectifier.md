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

## Build

Place the diode in series between the AC source and load. Keep the diode orientation unchanged for the first run.

## Measure

Compare the source and load scopes. The load should receive one polarity of the AC cycle, with a small reduction caused by the diode's forward voltage.

Reverse the diode and confirm that the opposite half-cycle passes.

## Explain

Explain why this output is pulsing DC rather than steady DC.

## Check your model

The diode is a direction-sensitive path. It blocks one half-cycle and conducts during the other, so the load current no longer reverses.

