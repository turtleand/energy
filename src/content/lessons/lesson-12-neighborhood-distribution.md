---
title: "Lesson 12: Neighborhood Distribution"
summary: "Learn how power moves from transmission into neighborhood feeders, local transformers, and home service connections, and why higher distribution voltage lowers feeder current and heat loss."
module: "Foundations"
order: 12
status: ready
labSlug: "lesson-12-neighborhood-distribution"
---

A power grid does not connect a distant generator straight to a toaster.

It moves power through stages. Each stage has a job.

```text
generation -> step-up transformer -> transmission -> substation -> feeder -> local transformer -> home service
```

Think of it like roads.

Transmission lines are the highways. Distribution feeders are the neighborhood roads. The service connection is the driveway into one building.

## The neighborhood stage

After long-distance transmission, a substation lowers voltage and sends power into local distribution feeders.

A feeder is the line that carries power through an area. It may serve many local transformers. Each local transformer lowers voltage again for a small group of homes or buildings.

```text
substation -> distribution feeder -> local transformer -> service connection -> home loads
```

The important idea is separation of roles.

- **Transmission:** moves large amounts of power over long distances.
- **Distribution feeder:** moves power around a city, town, or neighborhood.
- **Local transformer:** lowers voltage near users.
- **Service connection:** brings usable voltage into one building.

## Same power, different current

Use the power relationship again:

```text
power = voltage × current
P = V × I
```

For the same amount of power, higher voltage means lower current.

```text
60,000 W at 240 V   -> 250 A
60,000 W at 7,200 V -> about 8.3 A
```

Both examples move 60 kW in the simplified arithmetic. The higher-voltage feeder carries the same power with much lower current.

## Why current matters for losses

Wires have resistance. Current through resistance creates heat.

For grid loss discussions, you will often see the heat-loss rate written as:

```text
P_loss = I²R
```

That means power lost as heat rises with current squared. If current falls a lot, feeder heat loss falls even more in this simplified model.

This is why grids use higher voltage before power is delivered at lower voltage near users.

## Home current depends on load

The current into a home is not fixed.

It depends on what is running.

```text
small load -> lower current
large load -> higher current
```

A few lights, a laptop, and a phone charger demand much less power than a heater, oven, dryer, or air conditioner. The service connection supplies the current required by the active loads, within the limits of the system.

## What the local transformer does

The local transformer is the neighborhood handoff point.

It receives higher-voltage distribution power from the feeder. It lowers voltage for nearby service connections.

```text
higher feeder voltage -> local transformer -> lower service voltage
```

The transformer does not decide how much current a home uses. The home loads decide the demand. The transformer and service equipment must be sized to supply that demand safely.

## Safety boundary

This lesson is a conceptual model, not an electrical-work guide.

Do not use simplified grid diagrams or simulations to work on panels, meters, service conductors, transformers, utility lines, generators, or backfeeding equipment. Real electrical systems require trained professionals, rated equipment, isolation procedures, local code knowledge, and utility coordination.

## Bottom line

Neighborhood distribution is the middle layer between long-distance transmission and one building.

Higher distribution voltage lowers feeder current for the same power. Lower current reduces simplified I²R heat loss. The current into a home is different: it changes with the active load inside that home.
