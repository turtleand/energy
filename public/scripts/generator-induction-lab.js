const lab = document.querySelector('[data-generator-induction-lab]');

if (lab) {
  const motionInput = lab.querySelector('[data-generator-motion-input]');
  const loadInput = lab.querySelector('[data-generator-load-input]');
  const circuitInput = lab.querySelector('[data-generator-circuit-input]');
  const output = {
    status: lab.querySelector('[data-generator-status]'),
    motion: lab.querySelector('[data-generator-motion-output]'),
    load: lab.querySelector('[data-generator-load-output]'),
    flux: lab.querySelector('[data-generator-flux]'),
    voltage: lab.querySelector('[data-generator-voltage]'),
    current: lab.querySelector('[data-generator-current]'),
    power: lab.querySelector('[data-generator-power]'),
    effort: lab.querySelector('[data-generator-effort]'),
    loadState: lab.querySelector('[data-generator-load-state]'),
    note: lab.querySelector('[data-generator-note]'),
  };

  function labelForMotion(value) {
    if (value < 35) return 'Slow motion';
    if (value < 75) return 'Steady motion';
    return 'Fast motion';
  }

  function labelForLoad(value) {
    if (value < 35) return 'Light load';
    if (value < 75) return 'Medium load';
    return 'Heavy load';
  }

  function formatWatts(value) {
    if (value === 0) return '0 W';
    return `${value.toFixed(1)} W`;
  }

  function updateGenerator() {
    const motion = Number(motionInput.value);
    const load = Number(loadInput.value);
    const isClosed = circuitInput.checked;
    const fluxRate = motion / 100;
    const voltage = 2 + fluxRate * 10;
    const loadFactor = load / 100;
    const current = isClosed ? voltage * (0.12 + loadFactor * 0.28) : 0;
    const power = voltage * current;
    const effort = isClosed ? 18 + motion * 0.32 + load * 0.48 : 10 + motion * 0.22;
    const spinDuration = `${(5.2 - fluxRate * 3.1).toFixed(2)}s`;

    lab.dataset.generatorCircuit = isClosed ? 'closed' : 'open';
    lab.style.setProperty('--generator-motion', `${motion}%`);
    lab.style.setProperty('--generator-spin-speed', spinDuration);
    lab.style.setProperty('--generator-load', `${load}%`);
    lab.style.setProperty('--generator-current-opacity', isClosed ? String(0.25 + loadFactor * 0.75) : '0.08');

    output.motion.textContent = labelForMotion(motion);
    output.load.textContent = labelForLoad(load);
    output.flux.textContent = `${Math.round(fluxRate * 100)}% changing`;
    output.voltage.textContent = `${voltage.toFixed(1)} V induced`;
    output.current.textContent = isClosed ? `${current.toFixed(1)} A` : '0 A';
    output.power.textContent = formatWatts(power);
    output.effort.textContent = `${Math.round(effort)}% effort`;
    output.loadState.textContent = isClosed ? 'Receiving power' : 'Disconnected';

    if (!isClosed) {
      output.status.textContent = 'Open circuit. Motion still changes flux and induces voltage, but load current is zero.';
      output.note.textContent = 'Voltage can appear at the terminals, but sustained load current needs a complete path.';
      return;
    }

    output.status.textContent = `${labelForMotion(motion)} with a ${labelForLoad(load).toLowerCase()}. Changing flux induces voltage and current powers the load.`;
    output.note.textContent = load > 70
      ? 'The heavy load draws more current, so the generator needs more mechanical work to keep turning.'
      : 'The closed circuit lets induced voltage push current. The load receives power from the supplied motion.';
  }

  motionInput.addEventListener('input', updateGenerator);
  loadInput.addEventListener('input', updateGenerator);
  circuitInput.addEventListener('change', updateGenerator);

  updateGenerator();
}
