const lab = document.querySelector('[data-neighborhood-distribution-lab]');

if (lab) {
  const neighborhoodPowerInput = lab.querySelector('[data-neighborhood-power-input]');
  const feederVoltageInput = lab.querySelector('[data-neighborhood-feeder-voltage-input]');
  const homeLoadInput = lab.querySelector('[data-home-load-input]');
  const output = {
    status: lab.querySelector('[data-neighborhood-status]'),
    neighborhoodPower: lab.querySelector('[data-neighborhood-power-output]'),
    feederLabel: lab.querySelector('[data-neighborhood-feeder-label]'),
    feederCurrent: lab.querySelector('[data-neighborhood-feeder-current]'),
    feederHeat: lab.querySelector('[data-neighborhood-heat]'),
    feederHeatBar: lab.querySelector('[data-neighborhood-heat-bar]'),
    feederNote: lab.querySelector('[data-neighborhood-feeder-note]'),
    homeLoad: lab.querySelector('[data-home-load-output]'),
    homeCurrent: lab.querySelector('[data-home-current]'),
    homeCurrentNote: lab.querySelector('[data-home-current-note]'),
    neighborhoodNote: lab.querySelector('[data-neighborhood-note]'),
    heavyChip: lab.querySelector('[data-home-heavy-chip]'),
  };

  const feederLabels = {
    '240': '240 V educational feeder',
    '7200': '7,200 V feeder',
    '13200': '13,200 V feeder',
  };

  function formatCurrent(value) {
    if (value >= 100) return `${value.toFixed(0)} A`;
    if (value >= 10) return `${value.toFixed(1)} A`;
    return `${value.toFixed(2)} A`;
  }

  function formatMultiplier(value) {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (value >= 10) return value.toFixed(0);
    return value.toFixed(1);
  }

  function heatLabel(ratio) {
    if (ratio > 0.45) return 'High relative heat loss';
    if (ratio > 0.06) return 'Medium relative heat loss';
    return 'Low relative heat loss';
  }

  function heatVisualPercent(voltage) {
    if (voltage >= 13200) return 6;
    if (voltage >= 7200) return 14;
    return 100;
  }

  function currentVisualScale(voltage) {
    if (voltage >= 13200) return 0.26;
    if (voltage >= 7200) return 0.45;
    return 1;
  }

  function voltageLevel(voltage) {
    if (voltage >= 13200) return 'high';
    if (voltage >= 7200) return 'medium';
    return 'low';
  }

  function updateNeighborhood() {
    const neighborhoodPowerKw = Number(neighborhoodPowerInput.value);
    const feederVoltage = Number(feederVoltageInput.value);
    const homeLoadKw = Number(homeLoadInput.value);
    const feederCurrent = (neighborhoodPowerKw * 1000) / feederVoltage;
    const baselineCurrent = (neighborhoodPowerKw * 1000) / 240;
    const heatRatio = (feederCurrent * feederCurrent) / (baselineCurrent * baselineCurrent);
    const currentDrop = baselineCurrent / feederCurrent;
    const heatDrop = 1 / heatRatio;
    const homeCurrent = (homeLoadKw * 1000) / 240;

    lab.dataset.neighborhoodVoltageLevel = voltageLevel(feederVoltage);
    lab.style.setProperty('--neighborhood-current-scale', String(currentVisualScale(feederVoltage)));
    lab.style.setProperty('--neighborhood-heat-level', `${heatVisualPercent(feederVoltage)}%`);

    output.neighborhoodPower.textContent = `${neighborhoodPowerKw} kW`;
    output.feederLabel.textContent = feederLabels[String(feederVoltage)];
    output.feederCurrent.textContent = formatCurrent(feederCurrent);
    output.feederHeat.textContent = `${heatLabel(heatRatio)} (${(heatRatio * 100).toFixed(2)}% of the 240 V case)`;
    output.feederHeatBar.style.width = `${heatVisualPercent(feederVoltage)}%`;
    output.homeLoad.textContent = `${homeLoadKw} kW`;
    output.homeCurrent.textContent = formatCurrent(homeCurrent);

    output.status.textContent = `${neighborhoodPowerKw} kW neighborhood load at ${feederVoltage.toLocaleString()} V needs about ${formatCurrent(feederCurrent)} on the feeder.`;
    output.feederNote.textContent = feederVoltage === 240
      ? '240 V is the low-voltage baseline in this lab. Higher feeder voltage carries the same neighborhood power with less current.'
      : `Compared with 240 V, this feeder uses ${formatMultiplier(currentDrop)}× lower current and ${formatMultiplier(heatDrop)}× lower heat in the simplified I²R model.`;
    output.homeCurrentNote.textContent = `${homeLoadKw} kW at 240 V needs about ${formatCurrent(homeCurrent)}. Change the load to change the home current.`;
    output.neighborhoodNote.textContent = `Feeder current follows the total neighborhood load and feeder voltage. Home current follows the active load inside the home.`;
    output.heavyChip.classList.toggle('is-on', homeLoadKw >= 7);
  }

  neighborhoodPowerInput.addEventListener('input', updateNeighborhood);
  feederVoltageInput.addEventListener('input', updateNeighborhood);
  homeLoadInput.addEventListener('input', updateNeighborhood);

  updateNeighborhood();
}
