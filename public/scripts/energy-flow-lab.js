const lab = document.querySelector('[data-energy-lab]');

if (lab) {
  const voltage = lab.querySelector('[data-voltage]');
  const resistance = lab.querySelector('[data-resistance]');
  const time = lab.querySelector('[data-time]');
  const loop = lab.querySelector('[data-loop]');

  const outputs = {
    voltage: lab.querySelector('[data-voltage-output]'),
    resistance: lab.querySelector('[data-resistance-output]'),
    time: lab.querySelector('[data-time-output]'),
    current: lab.querySelector('[data-current]'),
    power: lab.querySelector('[data-power]'),
    energy: lab.querySelector('[data-energy]'),
    status: lab.querySelector('[data-status]'),
    svgVoltage: lab.querySelector('[data-svg-voltage]'),
    svgResistance: lab.querySelector('[data-svg-resistance]'),
    bulb: lab.querySelector('[data-bulb]'),
    wire: lab.querySelector('[data-wire]'),
    circuit: lab.querySelector('.circuit'),
  };

  const charges = Array.from(lab.querySelectorAll('[data-charge]'));
  const chargeMotions = Array.from(lab.querySelectorAll('[data-charge-motion]'));

  const format = (value, unit, digits = 2) => `${value.toFixed(digits)} ${unit}`;

  function update() {
    const v = Number(voltage.value);
    const r = Number(resistance.value);
    const seconds = Number(time.value);
    const closed = loop.checked;
    const current = closed ? v / r : 0;
    const power = closed ? v * current : 0;
    const energy = power * seconds;
    const intensity = Math.min(1, power / 18);
    const speed = Math.max(1.8, 7 - Math.min(current * 9, 5));
    const wireWidth = 7 + Math.min(current * 18, 12);

    outputs.voltage.textContent = format(v, 'V', 1);
    outputs.resistance.textContent = `${Math.round(r)} Ω`;
    outputs.time.textContent = `${Math.round(seconds)} s`;
    outputs.current.textContent = format(current, 'A', 2);
    outputs.power.textContent = format(power, 'W', 2);
    outputs.energy.textContent = format(energy, 'J', 1);
    outputs.svgVoltage.textContent = format(v, 'V', 1);
    outputs.svgResistance.textContent = `${Math.round(r)} Ω`;
    outputs.status.textContent = closed
      ? 'Closed loop. Current is flowing.'
      : 'Open loop. Voltage remains, but sustained current stops.';

    lab.style.setProperty('--bulb-glow', intensity.toFixed(2));
    lab.style.setProperty('--charge-speed', `${speed.toFixed(2)}s`);
    lab.style.setProperty('--wire-width', `${wireWidth.toFixed(1)}px`);
    lab.dataset.loopState = closed ? 'closed' : 'open';

    outputs.bulb.style.opacity = String(0.28 + intensity * 0.72);
    outputs.wire.style.strokeWidth = closed ? `${wireWidth}px` : '5px';
    if (closed) {
      outputs.circuit?.unpauseAnimations?.();
    } else {
      outputs.circuit?.pauseAnimations?.();
    }
    chargeMotions.forEach((motion) => {
      motion.setAttribute('dur', `${speed.toFixed(2)}s`);
    });
    charges.forEach((charge) => {
      charge.style.opacity = closed ? '1' : '0.18';
    });
  }

  [voltage, resistance, time, loop].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  update();
}
