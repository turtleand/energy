const lab = document.querySelector('[data-ohms-law-lab]');

if (lab) {
  const voltage = lab.querySelector('[data-ohms-voltage]');
  const resistance = lab.querySelector('[data-ohms-resistance]');
  const compareVoltage = lab.querySelector('[data-ohms-compare-voltage]');
  const compareResistance = lab.querySelector('[data-ohms-compare-resistance]');

  const outputs = {
    voltage: Array.from(lab.querySelectorAll('[data-ohms-voltage-output]')),
    resistance: Array.from(lab.querySelectorAll('[data-ohms-resistance-output]')),
    current: lab.querySelector('[data-ohms-current]'),
    currentUnit: lab.querySelector('[data-ohms-current-unit]'),
    sentence: lab.querySelector('[data-ohms-sentence]'),
    flow: lab.querySelector('[data-ohms-flow]'),
    bar: lab.querySelector('[data-ohms-bar]'),
    compareVoltage: lab.querySelector('[data-ohms-compare-voltage-output]'),
    compareResistance: lab.querySelector('[data-ohms-compare-resistance-output]'),
    compareCurrent: lab.querySelector('[data-ohms-compare-current]'),
    compareNote: lab.querySelector('[data-ohms-compare-note]'),
  };

  const chargeMotions = Array.from(lab.querySelectorAll('[data-ohms-charge-motion]'));

  const format = (value, unit, digits = 2) => `${value.toFixed(digits)} ${unit}`;

  function proportionalityNote(v, r, comparisonCurrent) {
    const baseCurrent = 6 / 12;

    if (v !== 6 && r === 12) {
      return v > 6
        ? 'Resistance stayed fixed, so more voltage produced more current.'
        : 'Resistance stayed fixed, so less voltage produced less current.';
    }

    if (v === 6 && r !== 12) {
      return r > 12
        ? 'Voltage stayed fixed, so more resistance reduced current.'
        : 'Voltage stayed fixed, so less resistance increased current.';
    }

    if (comparisonCurrent > baseCurrent) return 'The new setup has more current than the baseline.';
    if (comparisonCurrent < baseCurrent) return 'The new setup has less current than the baseline.';
    return 'The new setup matches the baseline current.';
  }

  function update() {
    const v = Number(voltage.value);
    const r = Number(resistance.value);
    const current = v / r;
    const normalizedFlow = Math.min(1, current / 3);
    const speed = Math.max(1.4, 7 - normalizedFlow * 5);

    outputs.voltage.forEach((output) => {
      output.textContent = format(v, 'V', 1);
    });
    outputs.resistance.forEach((output) => {
      output.textContent = `${Math.round(r)} Ω`;
    });
    outputs.current.textContent = format(current, 'A', 2);
    outputs.currentUnit.textContent = `${format(v, 'V', 1)} / ${Math.round(r)} Ω = ${format(current, 'A', 2)}`;
    outputs.sentence.textContent = `Current is ${format(current, 'A', 2)} because ${format(v, 'V', 1)} of push is divided by ${Math.round(r)} Ω of opposition.`;
    outputs.flow.textContent = current >= 1 ? 'Fast flow' : current >= 0.35 ? 'Moderate flow' : 'Slow flow';
    outputs.bar.style.inlineSize = `${Math.max(6, normalizedFlow * 100).toFixed(0)}%`;
    chargeMotions.forEach((motion) => {
      motion.setAttribute('dur', `${speed.toFixed(2)}s`);
    });
    lab.style.setProperty('--ohms-speed', `${speed.toFixed(2)}s`);
    lab.style.setProperty('--ohms-flow', normalizedFlow.toFixed(2));
  }

  function updateComparison() {
    const v = Number(compareVoltage.value);
    const r = Number(compareResistance.value);
    const current = v / r;

    outputs.compareVoltage.textContent = format(v, 'V', 1);
    outputs.compareResistance.textContent = `${Math.round(r)} Ω`;
    outputs.compareCurrent.textContent = format(current, 'A', 2);
    outputs.compareNote.textContent = proportionalityNote(v, r, current);
  }

  [voltage, resistance].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  [compareVoltage, compareResistance].forEach((input) => {
    input.addEventListener('input', updateComparison);
    input.addEventListener('change', updateComparison);
  });

  update();
  updateComparison();
}
