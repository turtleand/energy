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
  const comparisonRows = Array.from(lab.querySelectorAll('[data-transformer-comparison-row]'));

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

  function formatMultiplier(value) {
    return value >= 1000 ? value.toLocaleString() : value.toFixed(0);
  }

  function visualCurrentScale(voltage) {
    if (voltage >= 10000) return 0.28;
    if (voltage >= 1000) return 0.58;
    return 1;
  }

  function visualHeatPercent(voltage) {
    if (voltage >= 10000) return 6;
    if (voltage >= 1000) return 18;
    return 100;
  }

  function updateComparisonRows(power, selectedVoltage) {
    const baselineCurrent = power / 100;

    comparisonRows.forEach((row) => {
      const rowVoltage = Number(row.dataset.voltage);
      const rowCurrent = power / rowVoltage;
      const relativeHeat = (rowCurrent * rowCurrent) / (baselineCurrent * baselineCurrent);
      const currentPercent = Math.max(4, Math.min(100, (rowCurrent / baselineCurrent) * 100));

      row.dataset.selected = rowVoltage === selectedVoltage ? 'true' : 'false';
      row.querySelector('[data-transformer-comparison-current]').textContent = `${formatCurrent(rowCurrent)} current, ${currentPercent.toFixed(0)}% as much`;
      row.querySelector('[data-transformer-comparison-heat]').textContent = `${(relativeHeat * 100).toFixed(2)}% heat`;
      row.querySelector('[data-transformer-comparison-current-bar]').style.width = `${currentPercent}%`;
      row.querySelector('[data-transformer-comparison-heat-bar]').style.width = `${visualHeatPercent(rowVoltage)}%`;
    });
  }

  function updateTransformer() {
    const power = Number(powerInput.value);
    const voltage = Number(voltageInput.value);
    const current = power / voltage;
    const lowVoltageCurrent = power / 100;
    const relativeHeat = (current * current) / (lowVoltageCurrent * lowVoltageCurrent);
    const heatPercent = visualHeatPercent(voltage);
    const currentDrop = lowVoltageCurrent / current;
    const heatDrop = 1 / relativeHeat;

    lab.style.setProperty('--transformer-heat-level', `${heatPercent}%`);
    lab.style.setProperty('--transformer-current-scale', String(visualCurrentScale(voltage)));
    lab.dataset.transformerVoltageLevel = voltage >= 10000 ? 'high' : voltage >= 1000 ? 'medium' : 'low';

    output.power.textContent = formatWatts(power);
    output.voltage.textContent = `${voltage.toLocaleString()} V`;
    output.current.textContent = formatCurrent(current);
    output.heat.textContent = `${heatLabel(relativeHeat)} (${formatHeatRatio(relativeHeat)})`;
    output.heatBar.style.width = `${heatPercent}%`;
    output.line.textContent = voltageLabels[String(voltage)];
    updateComparisonRows(power, voltage);

    output.status.textContent = `${formatWatts(power)} sent at ${voltage.toLocaleString()} V needs about ${formatCurrent(current)} of current in this simplified model.`;
    output.note.textContent = voltage === 100
      ? '100 V is the baseline in this lab. The other rows show what changes when the same power is sent at higher voltage.'
      : `Compared with 100 V, this is ${formatMultiplier(currentDrop)}× lower current and ${formatMultiplier(heatDrop)}× lower heat in the simplified I²R model. The heat bar is magnified so tiny values stay visible.`;
  }

  powerInput.addEventListener('input', updateTransformer);
  voltageInput.addEventListener('input', updateTransformer);

  updateTransformer();
}
