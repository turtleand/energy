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

### Prediction answer

Inductor current cannot stop instantly. Before opening, the long-term current approaches:

```text
I = 5 V / 100 Ω = 50 mA
```

When the switch opens without another path, the inductor reverses its terminal voltage and can create a large transient to keep current moving.

## Build

Build and run the series RL loop first. Close the switch long enough for current to rise, then open it. Add a reverse-biased diode across the inductive branch for the second run.

### Build answer

The first path is a single series source, inductor, resistor, and switch loop. Place the diode across the inductive load path so it is reverse-biased while the source powers the loop and forward-biased only when the inductor reverses its terminal voltage.

## Measure

Compare inductor current and switch voltage when opening the switch without the diode and after adding it. Record the transient size and decay shape.

### Measurement answer

Without the diode, switch voltage shows a large, sharp transient. With the diode, current circulates through the added path and decays more gently from about 50 mA. The series time constant is approximately:

```text
τ = L / R = 0.1 H / 100 Ω = 1 ms
```

## Explain

Explain why the diode is normally off, why it conducts after the switch opens, and where the inductor's stored magnetic energy goes.

### Explanation answer

The source polarity reverse-biases the diode during normal operation. Opening the switch makes the inductor reverse its terminal voltage to preserve current, which forward-biases the diode. The flyback path does not erase energy. It lets current decay while resistance dissipates the stored magnetic-field energy as heat.
