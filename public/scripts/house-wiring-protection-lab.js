const lab = document.querySelector('[data-house-wiring-lab]');

if (lab) {
  const scenarios = {
    normal: {
      status: 'Normal operation. Current leaves on live, passes through the load, and returns on neutral.',
      path: 'Live -> device -> neutral',
      current: 'Normal load current',
      breaker: 'Breaker idle',
      gfci: 'GFCI/RCD balanced',
      ground: 'Quiet backup path',
      note: 'Ground is present for safety, but it is not part of the normal working loop.',
    },
    overload: {
      status: 'Overload. The path is normal, but the circuit is being asked for too much current.',
      path: 'Live -> too many loads -> neutral',
      current: 'Too high for too long',
      breaker: 'Breaker trips on overcurrent',
      gfci: 'GFCI/RCD may remain balanced',
      ground: 'Usually not involved',
      note: 'An overload is not necessarily a short. It can be ordinary demand that exceeds the safe circuit rating.',
    },
    short: {
      status: 'Live-neutral short. Live has found a very low-resistance path back to neutral.',
      path: 'Live -> neutral fault path',
      current: 'Very high surge',
      breaker: 'Breaker or fuse trips quickly',
      gfci: 'GFCI/RCD may not be the main response',
      ground: 'Not the intended path',
      note: 'This is a short-circuit case. The protection response is driven by very high current.',
    },
    ground: {
      status: 'Live-ground fault. Live touches a grounded path, such as an exposed metal case.',
      path: 'Live -> metal case -> grounding path',
      current: 'High fault current if the ground path is low impedance',
      breaker: 'Breaker or fuse trips on overcurrent',
      gfci: 'GFCI/RCD may also trip if installed',
      ground: 'Emergency fault path active',
      note: 'Ground does not absorb electricity. It gives fault current a safer path that helps disconnect power.',
    },
    leakage: {
      status: 'Leakage fault. Some current leaves the live-neutral loop.',
      path: 'Live -> leakage path -> ground, water, case, or person',
      current: 'May be too small for a normal breaker',
      breaker: 'Standard breaker may not trip',
      gfci: 'GFCI/RCD trips on imbalance',
      ground: 'Possible leakage path',
      note: 'The GFCI/RCD compares live and neutral. If they do not match, current went somewhere it should not.',
    },
  };

  const buttons = lab.querySelectorAll('[data-house-scenario-button]');
  const output = {
    status: lab.querySelector('[data-house-status]'),
    path: lab.querySelector('[data-house-path]'),
    current: lab.querySelector('[data-house-current]'),
    breaker: lab.querySelector('[data-house-breaker]'),
    gfci: lab.querySelector('[data-house-gfci]'),
    ground: lab.querySelector('[data-house-ground]'),
    note: lab.querySelector('[data-house-note]'),
  };

  function setScenario(name) {
    const scenario = scenarios[name] || scenarios.normal;
    lab.dataset.houseState = name;

    output.status.textContent = scenario.status;
    output.path.textContent = scenario.path;
    output.current.textContent = scenario.current;
    output.breaker.textContent = scenario.breaker;
    output.gfci.textContent = scenario.gfci;
    output.ground.textContent = scenario.ground;
    output.note.textContent = scenario.note;

    buttons.forEach((button) => {
      const selected = button.dataset.houseScenarioButton === name;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setScenario(button.dataset.houseScenarioButton);
    });
  });

  setScenario('normal');
}
