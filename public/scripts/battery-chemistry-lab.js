const lab = document.querySelector('[data-battery-chemistry-lab]');

if (lab) {
  const scenarios = {
    discharge: {
      status: 'Discharge. The battery powers the device while useful chemical difference remains.',
      chemicalLevel: 70,
      outside: 'Electrons move through the wire and device.',
      inside: 'Ions move through the electrolyte.',
      reaction: 'Reaction moving forward',
      voltage: 'Useful voltage',
      device: 'Device receiving energy',
      note: 'The outside electron path and inside ion path support the same electrochemical reaction.',
    },
    rundown: {
      status: 'Run down. The chemical difference is too small to hold the needed voltage.',
      chemicalLevel: 12,
      outside: 'Electron flow becomes weak or stops.',
      inside: 'Ion movement can no longer sustain useful output.',
      reaction: 'Little useful difference left',
      voltage: 'Voltage drops',
      device: 'Device fades or turns off',
      note: 'The paths do not keep current flowing forever. They work only while enough chemical difference remains.',
    },
    charging: {
      status: 'Charging. A charger pushes energy back into the battery.',
      chemicalLevel: 82,
      outside: 'Charger drives electrons the opposite way through the outside circuit.',
      inside: 'Ions shift as the reaction is pushed backward.',
      reaction: 'Reaction being reversed',
      voltage: 'Chemical difference rebuilt',
      device: 'Device load is not the source of energy',
      note: 'Rechargeable batteries can be pushed backward, but real cells degrade over cycles.',
    },
  };

  const buttons = lab.querySelectorAll('[data-battery-scenario-button]');
  const chemicalInput = lab.querySelector('[data-battery-chemical-input]');
  const output = {
    status: lab.querySelector('[data-battery-status]'),
    chemical: lab.querySelector('[data-battery-chemical-output]'),
    outside: lab.querySelector('[data-battery-outside]'),
    inside: lab.querySelector('[data-battery-inside]'),
    reaction: lab.querySelector('[data-battery-reaction]'),
    voltage: lab.querySelector('[data-battery-voltage]'),
    device: lab.querySelector('[data-battery-device]'),
    note: lab.querySelector('[data-battery-note]'),
  };

  function describeChemicalLevel(level, mode) {
    if (mode === 'charging') {
      return `${level}% being rebuilt`;
    }

    if (level < 20) {
      return `${level}% too low`;
    }

    if (level < 45) {
      return `${level}% fading`;
    }

    return `${level}% useful`;
  }

  function voltageForLevel(level, mode) {
    if (mode === 'charging') {
      return level >= 70 ? 'Rebuilding voltage' : 'Still recovering';
    }

    if (level < 20) {
      return 'Voltage drops';
    }

    if (level < 45) {
      return 'Voltage sagging';
    }

    return 'Useful voltage';
  }

  function effectiveScenarioName(name, level) {
    if (name === 'charging') {
      return 'charging';
    }

    return level < 20 ? 'rundown' : 'discharge';
  }

  function statusForLevel(level, mode) {
    if (mode === 'charging') {
      return level >= 70
        ? 'Charging. A charger is rebuilding useful chemical difference.'
        : 'Charging. The battery is still recovering useful chemical difference.';
    }

    if (level < 20) {
      return scenarios.rundown.status;
    }

    if (level < 45) {
      return 'Discharge. The chemical difference is fading, so voltage may sag under load.';
    }

    return scenarios.discharge.status;
  }

  function outsidePathForLevel(level, mode) {
    if (mode === 'charging') {
      return scenarios.charging.outside;
    }

    if (level < 20) {
      return scenarios.rundown.outside;
    }

    return scenarios.discharge.outside;
  }

  function insidePathForLevel(level, mode) {
    if (mode === 'charging') {
      return scenarios.charging.inside;
    }

    if (level < 20) {
      return scenarios.rundown.inside;
    }

    return scenarios.discharge.inside;
  }

  function reactionForLevel(level, mode) {
    if (mode === 'charging') {
      return scenarios.charging.reaction;
    }

    if (level < 20) {
      return scenarios.rundown.reaction;
    }

    if (level < 45) {
      return 'Reaction fading';
    }

    return scenarios.discharge.reaction;
  }

  function deviceForLevel(level, mode) {
    if (mode === 'charging') {
      return scenarios.charging.device;
    }

    if (level < 20) {
      return scenarios.rundown.device;
    }

    if (level < 45) {
      return 'Device may dim or shut off soon';
    }

    return scenarios.discharge.device;
  }

  function noteForLevel(level, mode) {
    if (mode === 'charging') {
      return scenarios.charging.note;
    }

    if (level < 20) {
      return scenarios.rundown.note;
    }

    return scenarios.discharge.note;
  }

  function applyScenario(name, useScenarioLevel = true) {
    const requestedScenario = scenarios[name] || scenarios.discharge;

    if (useScenarioLevel) {
      chemicalInput.value = String(requestedScenario.chemicalLevel);
    }

    const level = Number(chemicalInput.value);
    const effectiveName = effectiveScenarioName(name, level);
    lab.dataset.batteryMode = effectiveName;
    lab.style.setProperty('--battery-chemical-level', `${level}%`);

    output.status.textContent = statusForLevel(level, effectiveName);
    output.chemical.textContent = describeChemicalLevel(level, effectiveName);
    output.outside.textContent = outsidePathForLevel(level, effectiveName);
    output.inside.textContent = insidePathForLevel(level, effectiveName);
    output.reaction.textContent = reactionForLevel(level, effectiveName);
    output.voltage.textContent = voltageForLevel(level, effectiveName);
    output.device.textContent = deviceForLevel(level, effectiveName);
    output.note.textContent = noteForLevel(level, effectiveName);

    buttons.forEach((button) => {
      const selected = button.dataset.batteryScenarioButton === effectiveName;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyScenario(button.dataset.batteryScenarioButton);
    });
  });

  chemicalInput.addEventListener('input', () => {
    applyScenario(lab.dataset.batteryMode || 'discharge', false);
  });

  applyScenario('discharge');
}
