const lab = document.querySelector('[data-power-energy-lab]');

if (lab) {
  const controls = {
    power: lab.querySelector('[data-bill-power]'),
    hours: lab.querySelector('[data-bill-hours]'),
    price: lab.querySelector('[data-bill-price]'),
  };

  const output = {
    status: lab.querySelector('[data-bill-status]'),
    appliancePower: lab.querySelector('[data-bill-appliance-power]'),
    duration: lab.querySelector('[data-bill-duration]'),
    price: lab.querySelector('[data-bill-price-readout]'),
    powerControl: lab.querySelector('[data-bill-power-output]'),
    hoursControl: lab.querySelector('[data-bill-hours-output]'),
    priceControl: lab.querySelector('[data-bill-price-output]'),
    wh: lab.querySelector('[data-bill-wh]'),
    kwh: lab.querySelectorAll('[data-bill-kwh]'),
    cost: lab.querySelector('[data-bill-cost]'),
    equation: lab.querySelector('[data-bill-equation]'),
    costEquation: lab.querySelector('[data-bill-cost-equation]'),
    energyBar: lab.querySelector('[data-bill-energy-bar]'),
  };

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatHours(hours) {
    if (hours === 1) {
      return '1 hour';
    }
    return `${hours.toFixed(2).replace(/\.00$/, '').replace(/0$/, '')} hours`;
  }

  function update() {
    const watts = Number(controls.power.value);
    const hours = Number(controls.hours.value);
    const price = Number(controls.price.value);
    const wh = watts * hours;
    const kwh = wh / 1000;
    const cost = kwh * price;
    const maxWh = Number(controls.power.max) * Number(controls.hours.max);
    const energyPercent = Math.max(4, Math.min(100, (wh / maxWh) * 100));

    output.status.textContent = `${watts} W for ${formatHours(hours)} transfers ${wh.toFixed(0)} Wh.`;
    output.appliancePower.textContent = `${watts} W`;
    output.duration.textContent = formatHours(hours);
    output.price.textContent = `${currency.format(price)} per kWh`;
    output.powerControl.textContent = `${watts} W`;
    output.hoursControl.textContent = formatHours(hours);
    output.priceControl.textContent = `${currency.format(price)} / kWh`;
    output.wh.textContent = `${wh.toFixed(0)} Wh`;
    output.kwh.forEach((element) => {
      element.textContent = `${kwh.toFixed(2)} kWh`;
    });
    output.cost.textContent = currency.format(cost);
    output.equation.textContent = `${watts} W × ${hours.toFixed(2).replace(/\.00$/, '')} h = ${wh.toFixed(0)} Wh = ${kwh.toFixed(2)} kWh`;
    output.costEquation.textContent = `${kwh.toFixed(2)} kWh × ${currency.format(price)}/kWh = ${currency.format(cost)}`;
    output.energyBar.style.inlineSize = `${energyPercent}%`;
  }

  Object.values(controls).forEach((control) => {
    control.addEventListener('input', update);
    control.addEventListener('change', update);
  });

  update();
}
