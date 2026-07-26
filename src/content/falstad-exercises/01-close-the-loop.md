---
title: "Close the loop"
summary: "Build one source, one switch, and one load so open and closed paths become visible."
order: 1
module: "see-the-loop"
difficulty: "starter"
estimatedMinutes: 15
prerequisiteLessonSlugs: ["lesson-1-electricity-from-first-principles", "lesson-3-simple-circuits-from-first-principles"]
referenceCircuit: "close-the-loop"
schematicPath: "/falstad/schematics/close-the-loop.svg"
schematicText: "5 V source -> switch -> 100 ohm resistor -> return"
schematicAlt: "A five volt source, switch, and one hundred ohm resistor connected in one series loop."
status: "ready"
---

## Components

- One 5 V DC voltage source
- One switch
- One 100 Ω resistor
- Wires and one ground reference

## Predict

Before running the circuit, predict the current with the switch open and with it closed. Decide whether the source still maintains voltage while the path is open.

## Build

Start from a blank Falstad circuit. Draw one complete series loop, then place the switch between the source and resistor. Keep the switch open for the first observation.

## Measure

Open the resistor in a scope and compare the two switch states. A closed 5 V loop with 100 Ω should carry:

```text
I = V / R = 5 V / 100 Ω = 0.05 A
```

Check that current is zero while the path is open and about 50 mA after it closes.

## Explain

Explain why the source can still maintain a voltage while the open switch prevents sustained current. Name the source, controlled path, load, and return path.

## Check your model

The switch controls the path. It does not create the electrical push. Closing it completes the loop, allowing the source to transfer energy through the resistor.

