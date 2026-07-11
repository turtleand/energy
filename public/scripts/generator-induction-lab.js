const lab = document.querySelector('[data-generator-induction-lab]');

if (lab) {
  const motionInput = lab.querySelector('[data-generator-motion-input]');
  const circuitInput = lab.querySelector('[data-generator-circuit-input]');
  const output = {
    status: lab.querySelector('[data-generator-status]'),
    motion: lab.querySelector('[data-generator-motion-output]'),
    flux: lab.querySelector('[data-generator-flux]'),
    voltage: lab.querySelector('[data-generator-voltage]'),
    wireState: lab.querySelector('[data-generator-wire-state]'),
    wireNote: lab.querySelector('[data-generator-wire-note]'),
    note: lab.querySelector('[data-generator-note]'),
  };

  function motionLabel(value) {
    if (value < 35) return 'Gentle motion';
    if (value < 75) return 'Steady motion';
    return 'Quick motion';
  }

  function fluxLabel(value) {
    if (value < 35) return 'Flux changes slowly';
    if (value < 75) return 'Flux is changing';
    return 'Flux changes quickly';
  }

  function voltageLabel(value) {
    if (value < 35) return 'Small voltage appears';
    if (value < 75) return 'Voltage appears';
    return 'Stronger voltage pulses';
  }

  function updateGenerator() {
    const motion = Number(motionInput.value);
    const isClosed = circuitInput.checked;
    const motionRatio = motion / 100;
    const animationDuration = `${(5.4 - motionRatio * 3.2).toFixed(2)}s`;
    const fluxOpacity = String(0.32 + motionRatio * 0.58);
    const voltageOpacity = String(0.36 + motionRatio * 0.62);

    lab.dataset.generatorCircuit = isClosed ? 'closed' : 'open';
    lab.style.setProperty('--generator-motion', `${motion}%`);
    lab.style.setProperty('--generator-magnet-speed', animationDuration);
    lab.style.setProperty('--generator-flux-opacity', fluxOpacity);
    lab.style.setProperty('--generator-voltage-opacity', voltageOpacity);

    output.motion.textContent = motionLabel(motion);
    output.flux.textContent = fluxLabel(motion);
    output.voltage.textContent = voltageLabel(motion);
    output.wireState.textContent = isClosed ? 'Closed loop' : 'Open wire ends';

    if (isClosed) {
      output.status.textContent = 'The magnet is moving past the wire coil. Flux through the coil is changing, so voltage appears and the closed wire path can carry charge.';
      output.wireNote.textContent = 'The wire ends are connected, so the induced voltage has a complete path.';
      output.note.textContent = 'Follow the picture: moving magnet, changing flux, induced voltage, connected wire loop.';
      return;
    }

    output.status.textContent = 'The magnet is still changing flux through the coil. Voltage appears at the wire ends, but the open gap prevents a complete loop.';
    output.wireNote.textContent = 'The wire ends are open. Voltage can appear, but there is no complete path around the loop.';
    output.note.textContent = 'Opening the wire path does not stop induction. It only stops the complete circuit path.';
  }

  motionInput.addEventListener('input', updateGenerator);
  circuitInput.addEventListener('change', updateGenerator);

  updateGenerator();
}
