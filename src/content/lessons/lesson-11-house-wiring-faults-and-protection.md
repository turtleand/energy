---
title: "Lesson 11: House Wiring Faults and Protection"
summary: "Separate overloads, live-neutral shorts, live-ground faults, breakers, GFCI/RCD devices, neutral, and ground in one safe mental model."
module: "Foundations"
order: 11
status: ready
labSlug: "lesson-11-house-wiring-faults-and-protection"
---

House wiring is easier to reason about when every part has one job.

```text
live or hot -> sends electrical push into the circuit
neutral -> completes the normal return path
ground -> waits as an emergency safety path
breaker -> opens when current is too high
GFCI/RCD -> opens when live and neutral do not balance
```

This is a mental model, not a wiring guide.

## The normal path

In normal operation, current uses the working loop:

```text
live or hot -> device -> neutral
```

The device can be a lamp, charger, heater, motor, or appliance. It receives energy because current can move through the load and return through neutral.

Ground is different. Ground is not supposed to carry normal current. It exists so some faults have a safer path that helps protective devices react.

```text
neutral = normal return path
ground = exceptional fault path
```

## Overload means too much demand

An overload happens when the circuit is asked to carry more current than it is designed for. The path may still be normal, but the amount is too high.

Examples in the mental model:

- too many devices on one circuit
- a load drawing more current than the wiring should carry
- a long period of demand that can overheat wiring

A normal breaker protects against this by opening the circuit when current stays too high for too long.

## A live-neutral short is a very easy wrong path

A live-neutral short happens when live touches neutral before the intended load.

```text
live -> neutral
```

That path has very low resistance, so current can surge dangerously. A breaker or fuse should open quickly because it sees overcurrent.

This is one kind of short circuit.

## A live-ground fault is live touching a grounded path

A live-ground fault happens when live touches something connected to ground, such as an exposed metal case or equipment grounding conductor.

```text
live -> metal case or grounding path -> ground return path
```

If the ground path is low impedance, fault current becomes large enough that the breaker or fuse can open the circuit.

Ground does not absorb electricity. It gives fault current a safer path than a person and helps protection disconnect power.

## Normal breakers detect overcurrent

A normal breaker is mainly an overcurrent protection device.

That includes two common cases:

| Fault or condition | What happens | What the breaker sees |
| --- | --- | --- |
| Overload | Normal path, too much demand | Too much current for too long |
| Short circuit | Very low-resistance fault path | Very high current quickly |

So the correction is important: a normal breaker is not only a short-circuit device. It protects against overcurrent, including overloads and short circuits.

## GFCI and RCD devices detect imbalance

A GFCI or RCD watches a different question:

```text
did all current that left on live return on neutral?
```

If 5 A leaves on live and 5 A returns on neutral, the device sees balance.

If some current leaks through water, a case, ground, or a person, less current returns on neutral. The device sees imbalance and trips.

```text
breaker = too much current
GFCI/RCD = current went somewhere it should not
```

That is why a GFCI/RCD can trip even when the current is too small to trip a normal breaker.

## The comparison

| Case | Simple meaning | Main protection response |
| --- | --- | --- |
| Normal operation | Live sends power through a device, neutral returns it | No trip needed |
| Overload | Too many devices or too much demand | Breaker trips on overcurrent |
| Live-neutral short | Live takes a very low-resistance path to neutral | Breaker or fuse trips quickly |
| Live-ground fault | Live touches a grounded path, such as a metal case | Breaker or fuse trips if fault current is high enough |
| Leakage fault | Some current leaves the live-neutral loop | GFCI/RCD trips on imbalance |

## Safety boundary

Do not use this lesson to work on outlets, plugs, breaker panels, appliances, mains wiring, extension cords, chargers, batteries, or unknown circuits.

Real electrical work requires proper isolation, rated parts, test equipment, local code knowledge, and trained judgment. Simplified diagrams are for understanding protection concepts only.

## Bottom line

Live and neutral form the normal working loop. Ground should stay quiet unless something goes wrong.

Normal breakers detect overcurrent. That includes overloads and short circuits. GFCI and RCD devices detect leakage by comparing current leaving on live with current returning on neutral.
