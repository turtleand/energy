const lab = document.querySelector('[data-grid-balancing-lab]');

if (lab) {
  const scenarioInput = lab.querySelector('[data-grid-scenario-input]');
  const eventSizeInput = lab.querySelector('[data-grid-event-size-input]');
  const reserveInput = lab.querySelector('[data-grid-reserve-input]');
  const demandResponseInput = lab.querySelector('[data-grid-demand-response-input]');

  const output = {
    status: lab.querySelector('[data-grid-status]'),
    eventSize: lab.querySelector('[data-grid-event-size-output]'),
    reserve: lab.querySelector('[data-grid-reserve-output]'),
    frequency: lab.querySelector('[data-grid-frequency]'),
    frequencyNote: lab.querySelector('[data-grid-frequency-note]'),
    balance: lab.querySelector('[data-grid-balance]'),
    correction: lab.querySelector('[data-grid-correction]'),
    remaining: lab.querySelector('[data-grid-remaining]'),
    protection: lab.querySelector('[data-grid-protection]'),
    protectionNote: lab.querySelector('[data-grid-protection-note]'),
    needle: lab.querySelector('[data-grid-frequency-needle]'),
    generationBar: lab.querySelector('[data-grid-generation-bar]'),
    demandBar: lab.querySelector('[data-grid-demand-bar]'),
    stages: Array.from(lab.querySelectorAll('[data-grid-stage]')),
  };

  const scenarios = {
    balanced: {
      direction: 0,
      label: 'Balanced system',
      shortLabel: 'No disturbance',
    },
    'generation-loss': {
      direction: -1,
      label: 'Generation loss',
      shortLabel: 'Supply falls',
    },
    'demand-surge': {
      direction: -1,
      label: 'Demand surge',
      shortLabel: 'Consumption rises',
    },
    'excess-generation': {
      direction: 1,
      label: 'Excess generation',
      shortLabel: 'Supply rises',
    },
  };

  function formatPower(value) {
    return `${Math.round(value).toLocaleString()} MW`;
  }

  const referenceDisturbanceMw = 1000;

  function fractionOfLabScale(remainingMw) {
    return Math.min(1, remainingMw / referenceDisturbanceMw);
  }

  function frequencyFromResidual(remainingMw, direction) {
    const shift = fractionOfLabScale(remainingMw) * 0.85 * direction;
    return 50 + shift;
  }

  function stateFor(remainingMw, direction) {
    const remainingScale = fractionOfLabScale(remainingMw);
    if (direction === 0) return 'balanced';
    if (remainingScale <= 0.12) return 'restoring';
    if (remainingScale <= 0.45) return 'stressed';
    return 'protection';
  }

  function stageState(stage, state) {
    if (state === 'balanced') return stage === 'immediate' ? 'ready' : 'standby';
    if (stage === 'immediate' || stage === 'primary') return 'active';
    if (stage === 'secondary') return state === 'protection' ? 'limited' : 'active';
    return state === 'restoring' ? 'active' : state === 'stressed' ? 'limited' : 'blocked';
  }

  function stageText(stage, state) {
    const messages = {
      immediate: {
        ready: 'Inertia and fast controls are ready for a disturbance.',
        active: 'Inertia and fast inverter response slow the first frequency movement.',
      },
      primary: {
        standby: 'Automatic primary response is standing by.',
        active: 'Governors, batteries, and responsive loads act within seconds.',
      },
      secondary: {
        standby: 'Secondary control is standing by.',
        active: 'Secondary control can restore nominal frequency and scheduled transfers.',
        limited: 'Secondary control is helping, but the remaining imbalance is too large for normal restoration alone.',
      },
      tertiary: {
        standby: 'Tertiary reserves are standing by.',
        active: 'Tertiary control can replace used reserves and sustain the correction.',
        limited: 'Longer-term redispatch is needed while the system remains stressed.',
        blocked: 'Emergency protection must reduce the imbalance before normal replacement can finish.',
      },
    };

    return messages[stage][state];
  }

  function updateLab() {
    const scenario = scenarios[scenarioInput.value];
    const eventSize = scenario.direction === 0 ? 0 : Number(eventSizeInput.value);
    const reservePercent = Number(reserveInput.value);
    const demandResponsePercent = demandResponseInput.checked && scenario.direction < 0 ? 15 : 0;
    const totalResponsePercent = Math.min(100, reservePercent + demandResponsePercent);
    const correction = eventSize * (totalResponsePercent / 100);
    const remaining = Math.max(0, eventSize - correction);
    const frequency = frequencyFromResidual(remaining, scenario.direction);
    const state = stateFor(remaining, scenario.direction);

    lab.dataset.gridState = state;
    lab.dataset.gridDirection = scenario.direction < 0 ? 'low' : scenario.direction > 0 ? 'high' : 'balanced';

    const needlePosition = ((frequency - 49) / 2) * 100;
    output.needle.style.left = `${Math.max(0, Math.min(100, needlePosition))}%`;

    const baseBar = 68;
    const eventBarChange = scenario.direction * Math.min(24, eventSize / 40);
    output.generationBar.style.width = `${Math.max(38, Math.min(92, baseBar + (scenarioInput.value === 'demand-surge' ? 0 : eventBarChange)))}%`;
    output.demandBar.style.width = `${Math.max(38, Math.min(92, baseBar + (scenarioInput.value === 'demand-surge' ? Math.abs(eventBarChange) : 0)))}%`;

    output.eventSize.textContent = formatPower(Number(eventSizeInput.value));
    output.reserve.textContent = `${reservePercent}%`;
    output.balance.textContent = scenario.direction === 0
      ? 'Generation and consumption match'
      : `${scenario.shortLabel} by ${formatPower(eventSize)}`;
    output.correction.textContent = formatPower(correction);
    output.remaining.textContent = formatPower(remaining);
    output.frequency.textContent = `${frequency.toFixed(2)} Hz`;

    if (state === 'balanced') {
      output.status.textContent = 'Generation and consumption are in rhythm. Frequency is at the 50 Hz reference used by this lab.';
      output.frequencyNote.textContent = 'No power imbalance is pushing the shared frequency up or down.';
      output.protection.textContent = 'Not needed';
      output.protectionNote.textContent = 'Protection remains ready while normal balancing controls stand by.';
    } else if (state === 'restoring') {
      output.status.textContent = `${scenario.label}: fast response covers most of the ${formatPower(eventSize)} disturbance.`;
      output.frequencyNote.textContent = scenario.direction < 0
        ? 'The shortfall pushes frequency down, then layered controls bring it back toward nominal.'
        : 'The surplus pushes frequency up, then layered controls bring it back toward nominal.';
      output.protection.textContent = 'Normal controls contain it';
      output.protectionNote.textContent = 'Secondary and tertiary control can restore the target and replenish fast reserves.';
    } else if (state === 'stressed') {
      output.status.textContent = `${scenario.label}: response reduces the disturbance, but ${formatPower(remaining)} remains unbalanced.`;
      output.frequencyNote.textContent = 'Frequency remains away from nominal while slower controls and replacement reserves work.';
      output.protection.textContent = 'Protection is alert';
      output.protectionNote.textContent = 'The system is stressed. Additional reserves, redispatch, or controlled demand reduction are needed.';
    } else {
      output.status.textContent = `${scenario.label}: available response is too small for the ${formatPower(eventSize)} disturbance.`;
      output.frequencyNote.textContent = 'The large remaining imbalance creates a severe illustrative frequency deviation.';
      output.protection.textContent = scenario.direction < 0 ? 'Load shedding or islanding' : 'Generation trip or islanding';
      output.protectionNote.textContent = 'Emergency action may sacrifice part of the system to prevent equipment damage or a wider collapse.';
    }

    output.stages.forEach((stage) => {
      const stageName = stage.dataset.gridStage;
      const nextState = stageState(stageName, state);
      stage.dataset.stageState = nextState;
      const detail = stage.querySelector('[data-grid-stage-detail]');
      if (detail) detail.textContent = stageText(stageName, nextState);
    });
  }

  scenarioInput.addEventListener('change', updateLab);
  eventSizeInput.addEventListener('input', updateLab);
  reserveInput.addEventListener('input', updateLab);
  demandResponseInput.addEventListener('change', updateLab);

  updateLab();
}
