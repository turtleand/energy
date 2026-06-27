const lab = document.querySelector('[data-static-charge-lab]');

if (lab) {
  const chargeInput = lab.querySelector('[data-static-charge]');
  const rateInput = lab.querySelector('[data-buildup-rate]');
  const manualToggle = lab.querySelector('[data-manual-toggle]');
  const manualControls = lab.querySelector('[data-manual-controls]');
  const dischargeButton = lab.querySelector('[data-discharge]');
  const resetButton = lab.querySelector('[data-reset]');
  const pauseButton = lab.querySelector('[data-pause]');

  const outputs = {
    chargeOutput: lab.querySelector('[data-static-output]'),
    rateOutput: lab.querySelector('[data-rate-output]'),
    note: lab.querySelector('[data-static-note]'),
    status: lab.querySelector('[data-static-status]'),
    spark: lab.querySelector('[data-spark]'),
    sparkGap: lab.querySelector('[data-spark-gap]'),
    tensionBar: lab.querySelector('[data-tension-bar]'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  lab.dataset.motion = reduceMotion ? 'reduced' : 'full';

  const criticalThreshold = 9;
  const maxCharge = 10;
  const staticDots = Array.from(lab.querySelectorAll('.static-panel .charge-dot'));

  let charge = 0.8;
  let phase = 'building';
  let paused = false;
  let lastTime = performance.now();
  let phaseUntil = 0;
  let dischargeStart = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setSpark(active) {
    lab.dataset.spark = active ? 'on' : 'off';
    outputs.spark?.classList.toggle('spark-active', active);
    outputs.sparkGap?.classList.toggle('spark-gap-active', active);
    outputs.sparkGap?.setAttribute('data-spark-pulse', active ? 'on' : 'off');
  }

  function startCritical(now) {
    phase = 'critical';
    charge = maxCharge;
    phaseUntil = now + 420;
  }

  function triggerDischarge(now = performance.now()) {
    if (phase === 'discharging') return;
    phase = 'discharging';
    dischargeStart = now;
    setSpark(true);
  }

  function resetLoop(now = performance.now()) {
    charge = 0;
    phase = 'resetting';
    phaseUntil = now + 620;
    setSpark(false);
  }

  function phaseCopy() {
    if (phase === 'critical') {
      return {
        label: 'Critical point',
        note: 'The imbalance is at the limit. Discharge is about to happen.',
        status: 'Critical point reached. The spark will fire automatically.',
      };
    }

    if (phase === 'discharging') {
      return {
        label: 'Discharging',
        note: 'The spark releases the built-up imbalance in one brief event.',
        status: 'Spark discharge. The stored imbalance is dropping fast.',
      };
    }

    if (phase === 'resetting') {
      return {
        label: 'Resetting',
        note: 'After discharge, the system returns toward balance before buildup restarts.',
        status: 'Resetting after discharge. Buildup will begin again.',
      };
    }

    if (charge >= criticalThreshold * 0.72) {
      return {
        label: 'Imbalance building',
        note: 'The separated charge is storing more electrical tension as it approaches the critical point.',
        status: 'Imbalance is rising toward the critical point.',
      };
    }

    if (charge > 1) {
      return {
        label: 'Imbalance building',
        note: 'Charge separation is increasing. The spark has not happened yet.',
        status: 'Static imbalance is accumulating automatically.',
      };
    }

    return {
      label: 'Balanced',
      note: 'The system starts near balance. Imbalance begins to accumulate again.',
      status: 'Balanced start. Imbalance will build until it sparks.',
    };
  }

  function updateUi() {
    const progress = clamp(charge / maxCharge, 0, 1);
    const dotVisibility = Math.max(0.12, progress);
    const copy = phaseCopy();

    lab.style.setProperty('--static-charge-level', charge.toFixed(2));
    lab.style.setProperty('--critical-progress', progress.toFixed(3));
    lab.dataset.staticState = phase;

    if (chargeInput && document.activeElement !== chargeInput) {
      chargeInput.value = String(Math.round(charge));
    }
    if (outputs.chargeOutput) outputs.chargeOutput.textContent = `${Math.round(charge)} / 10`;
    if (outputs.rateOutput && rateInput) outputs.rateOutput.textContent = `${rateInput.value}x`;
    if (outputs.note) outputs.note.textContent = copy.note;
    if (outputs.status) outputs.status.textContent = copy.status;
    if (outputs.tensionBar) outputs.tensionBar.style.inlineSize = `${Math.round(progress * 100)}%`;

    staticDots.forEach((dot, index) => {
      dot.style.opacity = index < Math.ceil(charge * 0.7) ? String(dotVisibility) : '0.08';
    });
  }

  function step(now) {
    const elapsed = Math.min(80, now - lastTime);
    lastTime = now;

    if (!paused) {
      if (phase === 'building') {
        const rate = Number(rateInput?.value ?? 1.6);
        charge += elapsed * 0.001 * rate;
        if (charge >= criticalThreshold) {
          startCritical(now);
        }
      } else if (phase === 'critical' && now >= phaseUntil) {
        triggerDischarge(now);
      } else if (phase === 'discharging') {
        const progress = clamp((now - dischargeStart) / 780, 0, 1);
        charge = maxCharge * (1 - progress);
        if (progress >= 1) {
          resetLoop(now);
        }
      } else if (phase === 'resetting' && now >= phaseUntil) {
        phase = 'building';
        charge = 0.6;
      }
    }

    updateUi();
    requestAnimationFrame(step);
  }

  manualToggle?.addEventListener('click', () => {
    const isOpen = manualToggle.getAttribute('aria-expanded') === 'true';
    manualToggle.setAttribute('aria-expanded', String(!isOpen));
    if (manualControls) manualControls.hidden = isOpen;
  });

  chargeInput?.addEventListener('input', () => {
    charge = Number(chargeInput.value);
    phase = charge >= criticalThreshold ? 'critical' : 'building';
    phaseUntil = performance.now() + 420;
    setSpark(false);
    updateUi();
  });

  rateInput?.addEventListener('input', updateUi);

  dischargeButton?.addEventListener('click', () => {
    if (charge > 0.3) triggerDischarge();
  });

  resetButton?.addEventListener('click', () => {
    resetLoop();
  });

  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume loop' : 'Pause loop';
    lab.dataset.paused = paused ? 'true' : 'false';
    outputs.status.textContent = paused ? 'Paused. Manual controls can still set the imbalance.' : phaseCopy().status;
  });

  updateUi();
  requestAnimationFrame(step);
}
