const lab = document.querySelector('[data-switch-lab]');

if (lab) {
  const circuitSwitch = lab.querySelector('[data-circuit-switch]');

  const outputs = {
    status: lab.querySelector('[data-switch-status]'),
    note: lab.querySelector('[data-switch-note]'),
    controlLabel: lab.querySelector('[data-switch-control-label]'),
    svgLabel: lab.querySelector('[data-switch-svg-label]'),
    path: lab.querySelector('[data-switch-path]'),
    current: lab.querySelector('[data-switch-current]'),
    currentNote: lab.querySelector('[data-switch-current-note]'),
    load: lab.querySelector('[data-switch-load]'),
    bulb: lab.querySelector('[data-switch-bulb]'),
    circuit: lab.querySelector('.switch-circuit'),
  };

  const charges = Array.from(lab.querySelectorAll('[data-switch-charge]'));
  const chargeMotions = Array.from(lab.querySelectorAll('[data-switch-charge-motion]'));

  function update() {
    const closed = Boolean(circuitSwitch?.checked);

    lab.dataset.switchState = closed ? 'closed' : 'open';
    lab.style.setProperty('--bulb-glow', closed ? '0.92' : '0');
    lab.style.setProperty('--wire-width', closed ? '10px' : '5px');

    if (outputs.status) {
      outputs.status.textContent = closed
        ? 'Closed switch. The loop is complete, so the bulb is on.'
        : 'Open switch. The loop is broken, so the bulb is off.';
    }

    if (outputs.note) {
      outputs.note.textContent = closed
        ? 'Closing the switch bridges the gap and gives charge a complete route around the circuit.'
        : 'The source still has voltage, but the open switch leaves a gap in the path.';
    }

    if (outputs.controlLabel) {
      outputs.controlLabel.textContent = closed ? 'Open the switch' : 'Close the switch';
    }
    if (outputs.svgLabel) {
      outputs.svgLabel.textContent = closed ? 'Switch closed' : 'Switch open';
    }
    if (outputs.path) outputs.path.textContent = closed ? 'Closed' : 'Open';
    if (outputs.current) outputs.current.textContent = closed ? 'Flowing' : '0 A';
    if (outputs.currentNote) {
      outputs.currentNote.textContent = closed
        ? 'A complete loop allows sustained charge flow.'
        : 'No complete loop means no sustained current.';
    }
    if (outputs.load) outputs.load.textContent = closed ? 'On' : 'Off';

    if (outputs.bulb) {
      outputs.bulb.style.opacity = closed ? '1' : '0.28';
    }

    chargeMotions.forEach((motion) => {
      motion.setAttribute('dur', '4s');
    });

    charges.forEach((charge) => {
      charge.style.opacity = closed ? '1' : '0.14';
    });

    if (closed) {
      outputs.circuit?.unpauseAnimations?.();
    } else {
      outputs.circuit?.pauseAnimations?.();
    }
  }

  circuitSwitch?.addEventListener('input', update);
  circuitSwitch?.addEventListener('change', update);

  update();
}
