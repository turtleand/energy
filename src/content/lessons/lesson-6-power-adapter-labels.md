---
title: "Lesson 6: How to Read a Power Adapter Label Without Burning Your Device"
summary: "Learn the label checks that matter before plugging an adapter into a device: voltage, type, current, connector, polarity, and USB-C negotiation."
module: "everyday-electricity"
order: 6
status: ready
labSlug: "lesson-6-power-adapter-labels"
---

A power adapter label is a safety checklist in small print.

It tells you what the adapter can accept from the wall and what it will send to the device.

```text
Input  = what the adapter can receive
Output = what the device will receive
```

For the device, the important line is usually **Output**.

## The simple rule

Match the adapter output to the device input.

```text
device needs: 5V DC, 1A, center positive
adapter says: 5V DC, 2A, center positive
usually okay
```

The adapter is not forcing 2 amps into the device. The current number is capacity. A device that needs 1A can usually use a 2A adapter if the voltage, current type, connector, polarity, and negotiation behavior also match.

## 1. Match voltage exactly

Voltage is the electrical push. Too much voltage can damage a device.

If the device says 5V, use 5V. Do not use 9V or 12V just because the plug fits.

```text
5V device + 5V adapter  = right voltage
5V device + 12V adapter = dangerous mismatch
```

## 2. Match DC or AC type

Many electronics need DC input. Their labels may say `DC`, use the symbol `⎓`, or show a solid line over a dashed line.

Some adapters output AC. Their labels may say `AC` or use `~`.

A matching voltage number is not enough if the type is wrong.

```text
5V DC is not the same as 5V AC
```

## 3. Make sure current capacity is enough

Current is capacity, not a forced dose.

If the device needs 1A, a 5V DC adapter rated for 2A is usually fine. The device takes what it needs, up to what the adapter can safely provide.

If the adapter is rated for only 0.5A and the device needs 1A, the adapter may overheat, shut down, sag in voltage, or behave unpredictably.

```text
required current: 1A
adapter capacity: 2A   okay
adapter capacity: 0.5A too small
```

## 4. Check connector and polarity

For round barrel plugs, shape is not the whole answer.

Many barrel adapters have a polarity symbol showing whether the center pin is positive or negative. The common pattern is center positive, but you must read the symbol instead of assuming.

```text
center positive: center pin is +
center negative: center pin is -
```

Wrong polarity can damage a device even when the voltage is correct.

## 5. Treat USB-C as negotiated power

USB-C can be simple 5V power, or it can negotiate higher voltages through USB Power Delivery.

A USB-C charger and device normally agree before higher voltage is sent. Cheap adapters, special cables, trigger boards, or unusual devices can break the simple intuition, so check the device requirements when the power level matters.

## Fast reading checklist

Before plugging in:

1. Find the device input requirement.
2. Find the adapter output line.
3. Match voltage exactly.
4. Match DC or AC type.
5. Confirm adapter current is equal or higher.
6. Confirm connector fit and barrel polarity.
7. For USB-C, confirm the device and charger negotiate the needed mode.

## Red flags

Do not use the adapter if:

- the voltage is higher than the device expects
- AC and DC type do not match
- the adapter current rating is lower than the device requires
- barrel polarity is missing or opposite
- the connector only "sort of" fits
- the adapter is hot, buzzing, cracked, swollen, counterfeit-looking, or unknown

## Bottom line

Match voltage and type exactly. Make sure current capacity is enough. For barrel plugs, check polarity. For USB-C, remember that higher power depends on negotiation.

This is a reading guide, not a repair guide. Do not open adapters, work on mains wiring, bypass protections, or improvise with unknown power supplies. When in doubt, use the manufacturer-rated adapter.
