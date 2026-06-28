---
title: "Lesson 3: Simple circuits from first principles"
summary: "Understand source, path, load, switch, and return path before adding circuit formulas."
module: "Foundations"
order: 3
status: ready
---

A simple circuit is a closed working loop.

The parts matter, but the relationship between the parts matters more. A battery by itself is only a source. A bulb by itself is only a load. A wire by itself is only a path. The circuit becomes useful when those pieces form a complete loop where electrical energy can be transferred.

```text
source -> path -> load -> return path -> source
```

## Source

The source creates and maintains the electrical difference that makes energy transfer possible.

A battery is the easiest first example. It keeps one terminal at a different electric potential than the other. That difference does not mean charge is already doing useful work. It means the circuit has stored electrical potential that can drive energy through a closed path.

A practical first sentence is:

> The source provides the energy lift for the loop.

## Path

The path is the conductive route that lets charge move around the circuit.

In simple diagrams, the path is usually drawn as wire. The wire guides charge through the loop, but the wire is not the source of energy. It is more like the track that lets the loop stay organized.

If the path is broken, sustained current stops. The source may still have voltage, but the loop no longer gives charge a complete route.

## Load

The load is the part that turns electrical energy into useful work.

A bulb turns electrical energy into light and heat. A motor turns it into motion. A speaker turns it into sound. A chip can turn it into computation or signal processing.

The load does not use up charge. Charge keeps moving around the closed loop. What changes is energy. The load receives electrical energy and converts it into another form.

That distinction is one of the most important beginner corrections:

```text
charge keeps circulating
energy gets transferred to the load
```

## Switch

A switch is a gate in the path.

When the switch is closed, the path is complete and sustained current can flow. When the switch is open, the path is broken and sustained current stops.

```text
closed switch -> complete loop -> current can flow
open switch -> broken loop -> sustained current stops
```

The switch does not create energy. It controls whether the circuit has a complete route for energy transfer.

## Return path

The return path completes the loop back to the source.

A common beginner picture says electricity leaves the battery, reaches the bulb, and disappears. That picture is wrong. The load receives energy, but charge is conserved around the circuit.

The return path matters because a circuit is not a one-way delivery line. It is a loop.

## Open and closed circuits

A closed circuit has a complete path.

```text
source -> wire -> load -> wire -> source
```

An open circuit has a break somewhere in the path.

```text
source -> wire -> gap -> load -> wire -> source
```

The gap can be an open switch, a disconnected wire, a broken component, or any other interruption. In the beginner model, the result is the same: no complete loop, no sustained current.

## Potential difference and the electric field

Voltage is potential difference. It is energy per unit charge.

When a complete circuit is connected, the source helps establish an electric field through the conducting path. That field organizes the movement of charge and transfers energy to the load.

You do not need the full field model on day one. The useful beginner version is:

1. The source maintains a difference.
2. The closed path lets the circuit respond to that difference.
3. The load is where useful energy transfer happens.

## A safe thought experiment

Imagine a battery, a switch, a bulb, and a return wire.

Ask four questions:

1. Is the path complete?
2. Is the switch open or closed?
3. Where does useful energy transfer happen?
4. What continues around the loop?

If the switch is open, the bulb stays off because the loop is broken. If the switch is closed, the bulb can turn on because the source, path, load, and return path now form a complete circuit.

The bulb receives electrical energy. Charge continues around the loop.

## Bottom line

A simple circuit is not a line from battery to bulb. It is a closed loop for energy transfer.

Remember the order:

1. Source maintains potential difference.
2. Path carries charge around the loop.
3. Switch opens or closes the route.
4. Load converts electrical energy into useful work.
5. Return path completes the circuit.

Equations become easier after this structure is clear. Ohm's law can wait until the reader can see the loop.

This lesson is a simplified model for learning. It is not a guide for working on mains electricity, household wiring, panels, outlets, batteries, or unsafe hardware. Real electrical work needs proper training, tools, ratings, and safety rules.
