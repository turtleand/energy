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

  function applyScenario(name, useScenarioLevel = true) {
    const scenario = scenarios[name] || scenarios.discharge;
    lab.dataset.batteryMode = name;

    if (useScenarioLevel) {
      chemicalInput.value = String(scenario.chemicalLevel);
    }

    const level = Number(chemicalInput.value);
    lab.style.setProperty('--battery-chemical-level', `${level}%`);

    output.status.textContent = scenario.status;
    output.chemical.textContent = describeChemicalLevel(level, name);
    output.outside.textContent = scenario.outside;
    output.inside.textContent = scenario.inside;
    output.reaction.textContent = scenario.reaction;
    output.voltage.textContent = voltageForLevel(level, name);
    output.device.textContent = scenario.device;
    output.note.textContent = scenario.note;

    buttons.forEach((button) => {
      const selected = button.dataset.batteryScenarioButton === name;
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
