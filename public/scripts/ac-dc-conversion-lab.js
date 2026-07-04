const lab = document.querySelector('[data-ac-dc-lab]');

if (lab) {
  const slider = lab.querySelector('[data-acdc-stage-range]');
  const buttons = Array.from(lab.querySelectorAll('[data-acdc-stage-button]'));
  const panels = Array.from(lab.querySelectorAll('[data-acdc-panel]'));
  const waveLabels = Array.from(lab.querySelectorAll('[data-acdc-wave-label]'));

  const output = {
    status: lab.querySelector('[data-acdc-status]'),
    stage: lab.querySelector('[data-acdc-stage-name]'),
    direction: lab.querySelector('[data-acdc-direction]'),
    stability: lab.querySelector('[data-acdc-stability]'),
    device: lab.querySelector('[data-acdc-device]'),
  };

  const stages = {
    1: {
      name: 'Adjusted AC',
      status: 'Voltage adjustment stage. The AC push is in a useful range, but it still reverses.',
      direction: 'Still reversing',
      stability: 'Not DC yet',
      device: 'The voltage is prepared, but the device still needs one-direction DC.',
    },
    2: {
      name: 'Rectified',
      status: 'Rectifier stage. The negative half is flipped into a mostly one-direction pattern.',
      direction: 'Mostly one way',
      stability: 'Pulsing DC',
      device: 'Better, but still bumpy.',
    },
    3: {
      name: 'Smoothed',
      status: 'Capacitor stage. Stored charge fills some of the dips.',
      direction: 'One way',
      stability: 'Smoother DC',
      device: 'Closer to usable, but still not tightly stable.',
    },
    4: {
      name: 'Regulated',
      status: 'Regulator stage. The final voltage is held near the device target.',
      direction: 'One way',
      stability: 'Stable DC',
      device: 'Ready for the simplified device model.',
    },
  };

  function update(rawStage) {
    const stageNumber = Math.min(4, Math.max(1, Number(rawStage)));
    const stage = stages[stageNumber];

    lab.dataset.acDcStage = String(stageNumber);
    slider.value = String(stageNumber);
    output.status.textContent = stage.status;
    output.stage.textContent = stage.name;
    output.direction.textContent = stage.direction;
    output.stability.textContent = stage.stability;
    output.device.textContent = stage.device;

    buttons.forEach((button) => {
      const isCurrent = Number(button.dataset.acdcStageButton) === stageNumber;
      button.setAttribute('aria-pressed', String(isCurrent));
      button.classList.toggle('is-current', isCurrent);
    });

    panels.forEach((panel) => {
      const isCurrent = Number(panel.dataset.acdcPanel) === stageNumber;
      panel.classList.toggle('is-current', isCurrent);
    });

    waveLabels.forEach((label) => {
      const isCurrent = Number(label.dataset.acdcWaveLabel) === stageNumber;
      label.classList.toggle('is-current', isCurrent);
    });
  }

  slider.addEventListener('input', (event) => update(event.currentTarget.value));
  slider.addEventListener('change', (event) => update(event.currentTarget.value));

  buttons.forEach((button) => {
    button.addEventListener('click', () => update(button.dataset.acdcStageButton));
  });

  update(slider.value);
}
