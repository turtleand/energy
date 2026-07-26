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

### Prediction answer

With the switch open, the current is 0 A. The source still maintains 5 V across its terminals, but the broken path prevents sustained current. With the switch closed:

```text
I = V / R = 5 V / 100 Ω = 0.05 A
```

The closed-loop current is 50 mA.

## Build

Start from a blank Falstad circuit. Draw one complete series loop, then place the switch between the source and resistor. Keep the switch open for the first observation.

### Build answer

The only path should be:

```text
5 V source -> switch -> 100 Ω resistor -> source return
```

Place the ground reference at the source return. The open switch should be the only intentional break in the loop.

## Measure

Open the resistor in a scope and record its current and voltage with the switch open and closed. Compare the two readings before revealing the expected result.

### Measurement answer

The resistor current is 0 A while the switch is open and about 50 mA after it closes. The closed resistor drop is about 5 V.

## Explain

Explain why the source can still maintain a voltage while the open switch prevents sustained current. Name the source, controlled path, load, and return path.

### Explanation answer

Voltage can exist across an open path, but sustained current needs a complete loop. The voltage source provides the electrical push, the switch controls the path, the resistor is the load, and the wire back to the source is the return. Closing the switch completes the loop and allows the source to transfer energy through the resistor.
