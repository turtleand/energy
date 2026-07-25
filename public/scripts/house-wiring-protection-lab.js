const lab = document.querySelector('[data-house-wiring-lab]');

if (lab) {
  const scenarios = {
    normal: {
      status: 'Normal use. Current leaves on live, does work in the load, and returns on neutral.',
      route: 'Live -> load -> neutral',
      note: 'Ground is nearby for safety, but it is not part of the normal working loop.',
      protection: 'No trip needed',
      answer: 'The amount of current is normal, and live and neutral still match.',
      breaker: 'idle',
      gfci: 'idle',
    },
    overcurrent: {
      status: 'Too much current. The key idea is amount, not the exact fault type.',
      route: 'Live -> too much demand or short -> neutral',
      note: 'An overload and a live-neutral short are different, but both make the breaker/fuse see overcurrent.',
      protection: 'Breaker or fuse trips',
      answer: 'This protection watches current level. Too much current means disconnect the circuit.',
      breaker: 'active',
      gfci: 'idle',
    },
    leakage: {
      status: 'Current leaks away. Some current does not return on neutral.',
      route: 'Live -> load -> some current leaks away',
      note: 'The leakage path could involve ground, water, a case, or a person. The point is that the live-neutral loop no longer balances.',
      protection: 'GFCI/RCD trips',
      answer: 'This protection watches balance. If live and neutral do not match, current went somewhere it should not.',
      breaker: 'idle',
      gfci: 'active',
    },
  };

  const buttons = lab.querySelectorAll('[data-house-scenario-button]');
  const output = {
    status: lab.querySelector('[data-house-status]'),
    route: lab.querySelector('[data-house-route]'),
    note: lab.querySelector('[data-house-note]'),
    protection: lab.querySelector('[data-house-protection]'),
    answer: lab.querySelector('[data-house-answer]'),
    breaker: lab.querySelector('[data-house-breaker]'),
    gfci: lab.querySelector('[data-house-gfci]'),
    breakerState: lab.querySelector('[data-house-breaker-state]'),
    gfciState: lab.querySelector('[data-house-gfci-state]'),
  };

  function setScenario(name) {
    const scenario = scenarios[name] || scenarios.normal;
    lab.dataset.houseState = name;

    output.status.textContent = scenario.status;
    output.route.textContent = scenario.route;
    output.note.textContent = scenario.note;
    output.protection.textContent = scenario.protection;
    output.answer.textContent = scenario.answer;
    output.breaker.textContent = scenario.breaker === 'active' ? 'too much current' : 'nothing unusual';
    output.gfci.textContent = scenario.gfci === 'active' ? 'missing return current' : 'balanced return';
    output.breakerState.dataset.houseBreakerState = scenario.breaker;
    output.gfciState.dataset.houseGfciState = scenario.gfci;

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
