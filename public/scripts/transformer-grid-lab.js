const lab = document.querySelector('[data-transformer-grid-lab]');

if (lab) {
  const powerInput = lab.querySelector('[data-transformer-power-input]');
  const voltageInput = lab.querySelector('[data-transformer-voltage-input]');
  const output = {
    status: lab.querySelector('[data-transformer-status]'),
    power: lab.querySelector('[data-transformer-power-output]'),
    voltage: lab.querySelector('[data-transformer-voltage-output]'),
    current: lab.querySelector('[data-transformer-current]'),
    heat: lab.querySelector('[data-transformer-heat]'),
    heatBar: lab.querySelector('[data-transformer-heat-bar]'),
    line: lab.querySelector('[data-transformer-line-state]'),
    note: lab.querySelector('[data-transformer-note]'),
  };

  const voltageLabels = {
    '100': 'Low educational line voltage',
    '1000': 'Medium educational line voltage',
    '10000': 'High educational line voltage',
  };

  function formatWatts(value) {
    return value >= 1000 ? `${(value / 1000).toFixed(0)} kW` : `${value} W`;
  }

  function formatCurrent(value) {
    if (value >= 10) return `${value.toFixed(0)} A`;
    if (value >= 1) return `${value.toFixed(1)} A`;
    return `${value.toFixed(2)} A`;
  }

  function heatLabel(ratio) {
    if (ratio > 0.55) return 'High relative heat loss';
    if (ratio > 0.12) return 'Medium relative heat loss';
    return 'Low relative heat loss';
  }

  function formatHeatRatio(ratio) {
    return `${(ratio * 100).toFixed(2)}% of the low-voltage case`;
  }

  function updateTransformer() {
    const power = Number(powerInput.value);
    const voltage = Number(voltageInput.value);
    const current = power / voltage;
    const lowVoltageCurrent = power / 100;
    const relativeHeat = (current * current) / (lowVoltageCurrent * lowVoltageCurrent);
    const heatPercent = Math.max(4, Math.min(100, relativeHeat * 100));

    lab.style.setProperty('--transformer-heat-level', `${heatPercent}%`);
    lab.style.setProperty('--transformer-current-scale', String(Math.max(0.18, Math.min(1, current / lowVoltageCurrent))));
    lab.dataset.transformerVoltageLevel = voltage >= 10000 ? 'high' : voltage >= 1000 ? 'medium' : 'low';

    output.power.textContent = formatWatts(power);
    output.voltage.textContent = `${voltage.toLocaleString()} V`;
    output.current.textContent = formatCurrent(current);
    output.heat.textContent = `${heatLabel(relativeHeat)} (${formatHeatRatio(relativeHeat)})`;
    output.heatBar.style.width = `${heatPercent}%`;
    output.line.textContent = voltageLabels[String(voltage)];

    output.status.textContent = `${formatWatts(power)} sent at ${voltage.toLocaleString()} V needs about ${formatCurrent(current)} of current in this simplified model.`;
    output.note.textContent = 'For the same power, raising voltage lowers current. Because heat loss grows with current squared, the line gets much cooler in the relative model.';
  }

  powerInput.addEventListener('input', updateTransformer);
  voltageInput.addEventListener('input', updateTransformer);

  updateTransformer();
}
