const lab = document.querySelector('[data-grounding-safety-lab]');

if (lab) {
  const scenarios = {
    normal: {
      status: 'Normal operation. Current stays on the intended conductor path.',
      path: 'Intended conductor path',
      hazard: 'Low in this simplified model',
      protection: 'No trip needed',
      conductor: 'Carrying load current',
      insulation: 'Keeping current separated',
      ground: 'Ready as backup',
      breaker: 'Breaker idle',
      gfci: 'GFCI/RCD balanced',
      note: 'The conductor carries current where it is supposed to go. The insulation keeps that path separated from people and cases.',
    },
    unsafe: {
      status: 'Insulation fault without a safe backup path. The metal case can become dangerous.',
      path: 'Possible person path',
      hazard: 'High',
      protection: 'May not trip quickly',
      conductor: 'Live conductor touches case',
      insulation: 'Failed at one point',
      ground: 'No low-impedance backup path',
      breaker: 'Breaker may see too little current',
      gfci: 'GFCI/RCD absent in this scenario',
      note: 'If the only available path is through a person, even a current too small for a standard breaker can be dangerous.',
    },
    grounded: {
      status: 'Grounded fault. A low-impedance fault path helps the breaker or fuse open.',
      path: 'Grounding conductor path',
      hazard: 'Reduced after disconnect',
      protection: 'Breaker/fuse trips on overcurrent',
      conductor: 'Fault current rises sharply',
      insulation: 'Fault has bypassed the barrier',
      ground: 'Low-impedance path active',
      breaker: 'Breaker/fuse opens circuit',
      gfci: 'GFCI/RCD not required for this trip',
      note: 'Grounding does not absorb electricity. It gives fault current a path that helps overcurrent protection react.',
    },
    leakage: {
      status: 'Leakage fault. A GFCI or RCD trips because live and neutral current no longer match.',
      path: 'Leakage path detected',
      hazard: 'Reduced after fast trip',
      protection: 'GFCI/RCD trips on imbalance',
      conductor: 'Outgoing current is not fully returning',
      insulation: 'Leakage is crossing a boundary',
      ground: 'Leakage may use ground or a person',
      breaker: 'Standard breaker may not trip',
      gfci: 'GFCI/RCD opens circuit',
      note: 'A GFCI or RCD watches for mismatch. It can trip even when the leakage current is too small for a normal breaker.',
    },
  };

  const buttons = lab.querySelectorAll('[data-grounding-scenario-button]');
  const output = {
    status: lab.querySelector('[data-grounding-status]'),
    path: lab.querySelector('[data-grounding-path]'),
    hazard: lab.querySelector('[data-grounding-hazard]'),
    protection: lab.querySelector('[data-grounding-protection]'),
    conductor: lab.querySelector('[data-grounding-conductor]'),
    insulation: lab.querySelector('[data-grounding-insulation]'),
    ground: lab.querySelector('[data-grounding-ground]'),
    breaker: lab.querySelector('[data-grounding-breaker]'),
    gfci: lab.querySelector('[data-grounding-gfci]'),
    note: lab.querySelector('[data-grounding-note]'),
  };

  function setScenario(name) {
    const scenario = scenarios[name] || scenarios.normal;
    lab.dataset.groundingState = name;

    output.status.textContent = scenario.status;
    output.path.textContent = scenario.path;
    output.hazard.textContent = scenario.hazard;
    output.protection.textContent = scenario.protection;
    output.conductor.textContent = scenario.conductor;
    output.insulation.textContent = scenario.insulation;
    output.ground.textContent = scenario.ground;
    output.breaker.textContent = scenario.breaker;
    output.gfci.textContent = scenario.gfci;
    output.note.textContent = scenario.note;

    buttons.forEach((button) => {
      const selected = button.dataset.groundingScenarioButton === name;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setScenario(button.dataset.groundingScenarioButton);
    });
  });

  setScenario('normal');
}
