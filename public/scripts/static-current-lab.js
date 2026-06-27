const lab = document.querySelector('[data-static-current-lab]');

if (lab) {
  const staticCharge = lab.querySelector('[data-static-charge]');
  const sourceVoltage = lab.querySelector('[data-source-voltage]');
  const currentLoop = lab.querySelector('[data-current-loop]');
  const dischargeButton = lab.querySelector('[data-discharge]');

  const outputs = {
    staticOutput: lab.querySelector('[data-static-output]'),
    sourceOutput: lab.querySelector('[data-source-output]'),
    sourceLabel: lab.querySelector('[data-source-label]'),
    staticReading: lab.querySelector('[data-static-reading]'),
    currentReading: lab.querySelector('[data-current-reading]'),
    staticNote: lab.querySelector('[data-static-note]'),
    currentNote: lab.querySelector('[data-current-note]'),
    status: lab.querySelector('[data-contrast-status]'),
    spark: lab.querySelector('[data-spark]'),
    sparkGap: lab.querySelector('[data-spark-gap]'),
    wire: lab.querySelector('[data-mini-wire]'),
    bulb: lab.querySelector('[data-mini-bulb]'),
    circuit: lab.querySelector('.mini-circuit'),
  };

  const staticDots = Array.from(lab.querySelectorAll('.static-panel .charge-dot'));
  const currentCharges = Array.from(lab.querySelectorAll('[data-mini-charge]'));
  const currentMotions = Array.from(lab.querySelectorAll('[data-mini-motion]'));

  let dischargeTimer;

  function setSpark(active) {
    lab.dataset.spark = active ? 'on' : 'off';
    outputs.spark?.classList.toggle('spark-active', active);
    if (active) {
      clearTimeout(dischargeTimer);
      dischargeTimer = window.setTimeout(() => setSpark(false), 650);
    }
  }

  function update() {
    const chargeLevel = Number(staticCharge.value);
    const voltage = Number(sourceVoltage.value);
    const closed = currentLoop.checked;
    const currentActive = closed && voltage > 0;
    const currentStrength = voltage / 12;
    const speed = Math.max(1.8, 5.8 - currentStrength * 3.5);
    const dotVisibility = Math.max(0.15, chargeLevel / 10);

    outputs.staticOutput.textContent = `${chargeLevel} / 10`;
    outputs.sourceOutput.textContent = `${voltage} V`;
    outputs.sourceLabel.textContent = `${voltage} V`;
    outputs.staticReading.textContent = chargeLevel >= 7 ? 'Ready to spark' : chargeLevel > 0 ? 'Built up' : 'Balanced';
    outputs.currentReading.textContent = currentActive ? 'Flowing' : 'Stopped';

    outputs.staticNote.textContent = chargeLevel >= 7
      ? 'The imbalance is large enough to show a brief discharge when released.'
      : chargeLevel > 0
        ? 'Separated charge creates an electric field, but it is not a steady circuit.'
        : 'With no imbalance, there is no static discharge to release.';

    outputs.currentNote.textContent = currentActive
      ? 'The source maintains voltage, the loop is closed, and charge markers keep moving.'
      : closed
        ? 'The loop is closed, but with no source voltage there is no sustained push.'
        : 'The source can still have voltage, but an open loop stops sustained current.';

    outputs.status.textContent = currentActive
      ? 'Static may spark once. Current keeps flowing through the closed loop.'
      : 'Static can build without a circuit. Current stops without source and closed path.';

    lab.style.setProperty('--static-charge-level', String(chargeLevel));
    lab.style.setProperty('--current-strength', currentStrength.toFixed(2));
    lab.dataset.currentState = currentActive ? 'flowing' : 'stopped';
    lab.dataset.staticState = chargeLevel >= 7 ? 'charged' : chargeLevel > 0 ? 'building' : 'balanced';

    staticDots.forEach((dot, index) => {
      dot.style.opacity = index < Math.ceil(chargeLevel * 0.7) ? String(dotVisibility) : '0.08';
    });

    outputs.wire.style.opacity = currentActive ? '1' : '0.42';
    outputs.bulb.style.opacity = String(currentActive ? 0.35 + currentStrength * 0.65 : 0.22);
    outputs.bulb.style.filter = currentActive
      ? `drop-shadow(0 0 ${8 + currentStrength * 26}px rgba(245, 158, 11, 0.95))`
      : 'none';

    currentMotions.forEach((motion) => {
      motion.setAttribute('dur', `${speed.toFixed(2)}s`);
    });
    currentCharges.forEach((charge) => {
      charge.style.opacity = currentActive ? '1' : '0.12';
    });

    if (currentActive) {
      outputs.circuit?.unpauseAnimations?.();
    } else {
      outputs.circuit?.pauseAnimations?.();
    }
  }

  dischargeButton.addEventListener('click', () => {
    const chargeLevel = Number(staticCharge.value);
    if (chargeLevel > 0) {
      setSpark(true);
      staticCharge.value = String(Math.max(0, chargeLevel - 5));
      update();
    }
  });

  [staticCharge, sourceVoltage, currentLoop].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  update();
}
