const lab = document.querySelector('[data-adapter-label-lab]');

if (lab) {
  const controls = {
    voltage: lab.querySelector('[data-adapter-voltage]'),
    type: lab.querySelector('[data-adapter-type]'),
    current: lab.querySelector('[data-adapter-current]'),
    connector: lab.querySelector('[data-adapter-connector]'),
    polarity: lab.querySelector('[data-adapter-polarity]'),
  };

  const output = {
    status: lab.querySelector('[data-adapter-status]'),
    result: lab.querySelector('[data-adapter-result]'),
    reason: lab.querySelector('[data-adapter-reason]'),
    voltage: lab.querySelector('[data-label-voltage]'),
    type: lab.querySelector('[data-label-type]'),
    current: lab.querySelector('[data-label-current]'),
    connector: lab.querySelector('[data-label-connector]'),
    polarity: lab.querySelector('[data-label-polarity]'),
    voltageCheck: lab.querySelector('[data-check-voltage]'),
    typeCheck: lab.querySelector('[data-check-type]'),
    currentCheck: lab.querySelector('[data-check-current]'),
    connectorCheck: lab.querySelector('[data-check-connector]'),
    polarityCheck: lab.querySelector('[data-check-polarity]'),
  };

  const device = {
    voltage: 5,
    type: 'DC',
    current: 1,
    connector: 'fits',
    polarity: 'center-positive',
  };

  function checkLine(element, ok, text) {
    element.textContent = text;
    element.dataset.checkState = ok ? 'pass' : 'fail';
  }

  function update() {
    const adapter = {
      voltage: Number(controls.voltage.value),
      type: controls.type.value,
      current: Number(controls.current.value),
      connector: controls.connector.value,
      polarity: controls.polarity.value,
    };

    const checks = {
      voltage: adapter.voltage === device.voltage,
      type: adapter.type === device.type,
      current: adapter.current >= device.current,
      connector: adapter.connector === device.connector,
      polarity: adapter.polarity === device.polarity,
    };

    output.voltage.textContent = `${adapter.voltage}V`;
    output.type.textContent = adapter.type;
    output.current.textContent = `${adapter.current.toFixed(1).replace('.0', '')}A`;
    output.connector.textContent = adapter.connector === 'fits' ? 'Fits firmly' : 'Wrong size';
    output.polarity.textContent = adapter.polarity === 'center-positive' ? 'Center positive' : 'Center negative';

    checkLine(output.voltageCheck, checks.voltage, checks.voltage ? 'Voltage matches exactly.' : 'Voltage mismatch. Stop.');
    checkLine(output.typeCheck, checks.type, checks.type ? 'DC/AC type matches.' : 'DC/AC type mismatch. Stop.');
    checkLine(output.currentCheck, checks.current, checks.current ? 'Current capacity is enough.' : 'Current capacity is too low.');
    checkLine(output.connectorCheck, checks.connector, checks.connector ? 'Connector fit is acceptable.' : 'Connector does not fit correctly.');
    checkLine(output.polarityCheck, checks.polarity, checks.polarity ? 'Barrel polarity matches.' : 'Barrel polarity is opposite. Stop.');

    const hardStop = !checks.voltage || !checks.type || !checks.polarity || !checks.connector;
    const underpowered = checks.voltage && checks.type && checks.polarity && checks.connector && !checks.current;

    if (hardStop) {
      lab.dataset.adapterState = 'danger';
      output.status.textContent = 'Do not plug this in.';
      output.result.textContent = 'Dangerous mismatch';
      output.reason.textContent = 'A wrong voltage, type, connector, or polarity can damage the device even if another field looks right.';
    } else if (underpowered) {
      lab.dataset.adapterState = 'weak';
      output.status.textContent = 'Not enough current capacity.';
      output.result.textContent = 'Underpowered adapter';
      output.reason.textContent = 'The voltage and polarity match, but the adapter cannot safely provide the current the device may need.';
    } else {
      lab.dataset.adapterState = 'safe';
      output.status.textContent = 'Usually okay.';
      output.result.textContent = 'Label match';
      output.reason.textContent = 'The adapter matches the required voltage, type, connector, polarity, and has at least the required current capacity.';
    }
  }

  Object.values(controls).forEach((control) => {
    control.addEventListener('input', update);
    control.addEventListener('change', update);
  });

  update();
}
