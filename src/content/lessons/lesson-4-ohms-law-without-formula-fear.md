---
title: "Lesson 4: Ohm's Law without formula fear"
summary: "Learn voltage, current, and resistance as one visible relationship before treating Ohm's Law as algebra."
module: "Foundations"
order: 4
status: ready
labSlug: "lesson-4-ohms-law-without-formula-fear"
---

Ohm's Law is not a formula to fear. It is a relationship you can picture.

Start with the simple model:

```text
voltage is push
resistance is opposition
current is flow
```

When the path is closed, more push tends to create more flow. More opposition tends to reduce flow. Ohm's Law compresses that idea into one relationship.

```text
current = voltage / resistance
```

That line is useful only after the picture is clear.

## The three pieces

**Voltage** is electrical difference. In a beginner circuit model, it is the push from the source.

**Current** is the rate of charge flow. One ampere means one coulomb of charge passes a point each second.

```text
1 A = 1 C/s
```

**Resistance** is opposition to current. More resistance means the same push produces less flow.

For a simple resistor, the relationship is:

```text
A = V / Ω
```

That means amps come from volts divided by ohms.

## The proportionality idea

Ohm's Law becomes less scary when you notice two patterns.

### If resistance stays the same

Increasing voltage increases current.

```text
same resistance + more voltage = more current
```

This is direct proportionality. Double the voltage across the same resistor, and the current doubles.

### If voltage stays the same

Increasing resistance decreases current.

```text
same voltage + more resistance = less current
```

This is inverse proportionality. Double the resistance with the same voltage, and the current is cut in half.

## Solving without panic

The formula can be rearranged depending on what is unknown.

```text
V = I × R
I = V / R
R = V / I
```

Do not memorize these as three separate spells. They are three views of the same relationship.

Ask:

1. What do I know?
2. What is missing?
3. Does the answer make physical sense?

If voltage goes up while resistance stays fixed, current should go up. If resistance goes up while voltage stays fixed, current should go down. That sanity check prevents formula fear.

## A simple example

Suppose a small circuit has:

```text
V = 6 V
R = 12 Ω
```

Current is:

```text
I = V / R
I = 6 V / 12 Ω
I = 0.5 A
```

So the circuit has half an ampere of current in this simplified model.

## Where the model stops

Ohm's Law fits ohmic components best: parts whose voltage-current relationship is roughly linear across the range you are using.

A simple resistor is the classic teaching example. LEDs are different. Their voltage-current relationship is nonlinear, so they do not behave like constant-resistance ideal resistors.

That does not make Ohm's Law useless. It means you must know when the simple model applies.

## Bottom line

Ohm's Law says the flow depends on push divided by opposition.

```text
current = voltage / resistance
```

Use the formula after the model is visible:

1. Voltage pushes.
2. Resistance opposes.
3. Current flows.
4. More push means more flow if resistance stays fixed.
5. More resistance means less flow if voltage stays fixed.

This lesson is a simplified educational circuit model. It is not a guide for working on mains electricity, household wiring, high-current batteries, panels, outlets, or unsafe hardware. Real electrical work needs proper training, tools, ratings, codes, and safety rules.
