---
title: "Lesson 5: DC vs AC"
summary: "Learn the difference between one-direction current and reversing current, then see how devices turn wall power into usable DC."
module: "everyday-electricity"
order: 5
status: ready
labSlug: "lesson-5-dc-vs-ac"
---

DC and AC describe the pattern of electrical push and flow.

```text
DC keeps one direction.
AC reverses direction again and again.
```

A battery is the simple DC picture. One side stays positive, the other side stays negative, and the circuit has a steady direction pattern.

A wall outlet is the simple AC picture. The polarity switches back and forth many times each second, so the push reverses repeatedly.

## The core difference

**DC** means direct current. In the beginner model, current flows one way around the circuit.

**AC** means alternating current. The voltage polarity alternates, so the current direction also alternates in a simple load.

That contrast is the whole starting point:

```text
DC: one-direction pattern
AC: reversing pattern
```

## Where they show up

Batteries, phone power banks, USB power, solar panels, and most electronics use DC internally.

Power grids and wall outlets usually deliver AC. AC became useful for large power systems because it can be transformed between voltage levels efficiently for transmission and distribution.

Most electronic devices therefore need a conversion step. They receive AC from the wall, then create the DC their circuits actually use.

## AC to usable DC

A power supply usually follows this mental flow:

```text
change voltage
rectify
smooth
regulate
```

### 1. Change or adjust voltage

The device first gets the voltage into a useful range. Older supplies often used transformers. Many modern adapters use switching electronics, but the beginner idea is the same: the incoming power must be adjusted before the device can use it.

### 2. Rectify AC into mostly one-direction current

A rectifier uses diodes to let current pass mainly one way. A bridge rectifier can flip the negative half of the AC wave upward, so the output is mostly one-direction.

This is not perfectly smooth DC yet. It is usually **pulsing DC**.

```text
AC reverses
rectifier makes it mostly one direction
```

### 3. Smooth the bumpy output

Capacitors help reduce the bumps. They store some charge when the voltage is high and release some when the voltage dips.

The output becomes smoother, but it may still move up and down slightly.

### 4. Regulate the final voltage

A voltage regulator makes the final output stable enough for the device. If a phone, router, or microcontroller needs a specific DC voltage, regulation is what holds the output near that target.

## Why the distinction matters

Electronics usually care about stable DC because chips, LEDs, batteries, sensors, and logic circuits need predictable voltage levels.

The grid usually uses AC because it is practical for moving energy across long distances and changing voltage levels across the system.

So the common pattern is:

```text
wall AC -> power supply -> device DC
```

## Bottom line

DC keeps a one-direction pattern. AC reverses back and forth.

When a device needs DC from an AC outlet, the power supply adjusts voltage, rectifies AC into pulsing DC, smooths the bumps with capacitors, and regulates the final voltage.

This is a simplified educational model. It is not a guide for opening power adapters, working on outlets, building mains circuits, or handling unsafe voltage or current. Real electrical work needs proper training, isolation, rated parts, tools, codes, and safety rules.
