---
title: "Give inductor current a safe path"
summary: "Watch an inductor oppose sudden current changes, then add a flyback diode."
order: 8
module: "see-fields-and-systems"
difficulty: "intermediate"
estimatedMinutes: 35
prerequisiteLessonSlugs: ["lesson-8-conductors-insulators-grounding-safety", "lesson-9-generators-electromagnetic-induction"]
referenceCircuit: "inductor-and-flyback"
schematicPath: "/falstad/schematics/inductor-and-flyback.svg"
schematicText: "5 V source -> switch -> 100 millihenry inductor -> 100 ohm resistor, with flyback diode across the inductor branch"
schematicAlt: "A five volt switched resistor and inductor loop with a reverse-biased flyback diode across the inductive branch."
status: "ready"
---

## Components

- One 5 V DC voltage source
- One switch
- One 100 mH inductor
- One 100 Ω resistor
- One diode for the second run
- Current and switch-voltage scopes

## Predict

Predict whether inductor current can stop instantly when the switch opens. Decide what voltage the inductor must create if no continuing path exists.

## Build

Build and run the series RL loop first. Close the switch long enough for current to rise, then open it. Add a reverse-biased diode across the inductive branch for the second run.

## Measure

Without the diode, observe a large switch-voltage transient. With the diode, current circulates through the added path and decays more gently.

## Explain

Explain why the diode is normally off, why it conducts after the switch opens, and where the inductor's stored magnetic energy goes.

## Check your model

An inductor resists abrupt current change. The flyback diode does not erase energy. It gives current a controlled path while resistance dissipates that energy.

