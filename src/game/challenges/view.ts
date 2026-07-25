import type { StationChallengeState } from './engine';

const labels: Record<string, string> = {
  source: 'Cell source',
  switch: 'Knife switch',
  resistor: 'Resistance coil',
  lamp: 'Cove lamp',
  return: 'Return lead',
  substation: 'Substation',
  feeder: 'Feeder',
  transformer: 'Local transformer',
  service: 'Home service',
};

function escapeHtml(value: unknown) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function button(
  label: string,
  action: string,
  value: string | number = '',
  options: { secondary?: string | number; className?: string; pressed?: boolean; disabled?: boolean } = {},
) {
  const secondary = options.secondary === undefined ? '' : ` data-station-secondary="${escapeHtml(options.secondary)}"`;
  return `<button class="station-piece ${options.className ?? ''}" type="button" data-station-action="${action}" data-station-value="${escapeHtml(value)}"${secondary}${options.pressed === undefined ? '' : ` aria-pressed="${String(options.pressed)}"`}${options.disabled ? ' disabled' : ''}>${label}</button>`;
}

function draggablePiece(label: string, action: string, value: string, selected: boolean, className = '') {
  return `<button class="station-piece station-drag-piece ${className}" type="button" draggable="true" data-station-action="${action}" data-station-value="${escapeHtml(value)}" data-drag-action="${action}" data-drag-value="${escapeHtml(value)}" aria-pressed="${String(selected)}">${label}</button>`;
}

function dropSlot(
  index: number | string,
  content: string,
  action: string,
  dropAction: string,
  options: { className?: string; secondary?: string | number } = {},
) {
  const secondary = options.secondary ?? index;
  return `<button class="station-socket ${content ? 'is-filled' : 'is-empty'} ${options.className ?? ''}" type="button" data-station-action="${action}" data-station-value="${escapeHtml(index)}" data-drop-action="${dropAction}" data-drop-secondary="${escapeHtml(secondary)}"><span>${content ? escapeHtml(labels[content] ?? content) : 'Empty socket'}</span></button>`;
}

function progressDots(count: number, total: number, label: string) {
  return `<div class="station-dot-meter" role="img" aria-label="${escapeHtml(label)} ${count} of ${total}">${Array.from({ length: total }, (_, index) => `<span${index < count ? ' data-on="true"' : ''}></span>`).join('')}</div>`;
}

function renderWorkshop(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const slots = (values.slots as string[]) ?? [];
    const selected = String(values.selectedPiece ?? '');
    const pieces = ['source', 'switch', 'resistor', 'lamp', 'return'];
    return `
      <div class="challenge-apparatus workshop-loop ${state.solved ? 'is-live' : ''}">
        <div class="apparatus-stage-label">Closed-loop patch board</div>
        <div class="workshop-loop-track" aria-label="Five socket circular circuit">
          ${slots.map((slot, index) => dropSlot(index, slot, 'place-slot', 'drop-piece', { className: `socket-${index + 1}` })).join('')}
          <div class="loop-energy-load" aria-hidden="true"><span>light</span><i></i></div>
          <div class="loop-flow-token token-a"></div><div class="loop-flow-token token-b"></div><div class="loop-flow-token token-c"></div>
        </div>
        <div class="station-tray" aria-label="Circuit parts">
          ${pieces.map((piece) => draggablePiece(`<span class="piece-icon" aria-hidden="true">${piece === 'source' ? '▮▯' : piece === 'switch' ? '／' : piece === 'resistor' ? '〰' : piece === 'lamp' ? '✦' : '↩'}</span>${labels[piece]}`, 'select-piece', piece, selected === piece)).join('')}
        </div>
        <p class="station-touch-hint">Drag a part to a socket, or select it and choose a socket.</p>
      </div>`;
  }
  if (state.phaseIndex === 1) {
    const cells = Number(values.cells ?? 1);
    const coil = String(values.coil ?? 'medium');
    const observations = (values.observations as string[]) ?? [];
    const current = Number(values.current ?? 0);
    const heat = Number(values.heat ?? 0);
    const nextRun = observations.length;
    const flow = current >= 0.9 ? 'fast' : current >= 0.45 ? 'steady' : current > 0 ? 'slow' : 'idle';
    const runGuides = [
      ['Run 1 of 3: record the starting trace', 'Set one cell and the medium coil. Later runs will compare against this setup.'],
      ['Run 2 of 3: change the source only', 'Keep the medium coil. Add a second cell to increase voltage push.'],
      ['Run 3 of 3: change the coil only', 'Keep two cells. Fit the high-opposition coil to increase resistance.'],
      ['Three comparisons recorded', 'Replay any setup and use the visible charge traffic to predict what will happen.'],
    ];
    const runLabels = ['Run starting setup', 'Compare a second cell', 'Compare high-opposition coil', 'Replay this setup'];
    const trace = (level: number) => `<span class="comparison-trace" aria-hidden="true">${Array.from({ length: 4 }, (_, index) => `<i data-on="${index < level}"></i>`).join('')}</span>`;
    const cards = [
      ['baseline', '1', 'Starting setup', '1 cell + medium coil', 'Steady charge traffic', 2],
      ['push', '2', 'Source changed only', '2 cells + same coil', 'Faster charge traffic', 4],
      ['resistance', '3', 'Coil changed only', 'Same 2 cells + high coil', 'Slower than run 2', 2],
    ] as const;
    return `
      <div class="challenge-apparatus workshop-tuning" data-heat="${heat > 2 ? 'hot' : 'calm'}">
        <div class="experiment-guide" data-complete="${state.solved}">
          <span class="experiment-rule">Change one part at a time</span>
          <div><strong>${runGuides[Math.min(nextRun, 3)][0]}</strong><p>${runGuides[Math.min(nextRun, 3)][1]}</p></div>
        </div>
        <div class="tuning-bench">
          <section class="physical-rack" aria-label="Voltage source options" data-next-change="${nextRun === 1 ? 'true' : 'false'}">
            <span class="rack-step">1</span>
            <span class="rack-label">Source push</span>
            <p class="rack-definition"><strong>Voltage</strong> is the push supplied by the cells.</p>
            <div class="cell-stack" data-count="${cells}"><i></i><i></i></div>
            <div class="piece-choice-row">
              ${button('One cell', 'set-cells', 1, { pressed: cells === 1 })}
              ${button('Two cells', 'set-cells', 2, { pressed: cells === 2 })}
            </div>
          </section>
          <section class="physical-rack" aria-label="Path resistance options" data-next-change="${nextRun === 2 ? 'true' : 'false'}">
            <span class="rack-step">2</span>
            <span class="rack-label">Path opposition</span>
            <p class="rack-definition"><strong>Resistance</strong> is opposition to charge moving in the path.</p>
            <div class="coil-spool coil-${coil}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <div class="piece-choice-row">
              ${button('Medium coil', 'set-coil', 'medium', { pressed: coil === 'medium' })}
              ${button('High-opposition coil', 'set-coil', 'high', { pressed: coil === 'high' })}
            </div>
          </section>
          <section class="pulse-window" aria-label="Visible current result">
            <span class="rack-step">3</span>
            <span class="rack-label">Watch charge traffic</span>
            <p class="rack-definition"><strong>Current</strong> is how quickly charge moves through the loop.</p>
            <div class="current-race" data-flow="${flow}" aria-label="${current ? `${flow} charge traffic` : 'No current trace recorded yet'}"><span></span><span></span><span></span><span></span></div>
            <strong class="current-result">${current ? `${flow[0].toUpperCase()}${flow.slice(1)} charge traffic` : 'Run the setup to see current'}</strong>
            ${button(runLabels[Math.min(nextRun, 3)], 'pulse-loop', '', { className: 'station-lever' })}
          </section>
        </div>
        <div class="observation-board" aria-label="Pinned comparison traces">
          ${cards.map(([id, number, title, setup, result, level], index) => `<article class="observation-card" data-pinned="${observations.includes(id)}" data-current="${index === nextRun}">
            <span class="comparison-number">${number}</span>
            <div><strong>${title}</strong><small>${setup}</small></div>
            ${trace(level)}
            <b>${observations.includes(id) ? result : index === nextRun ? 'Set up this run next' : 'Not run yet'}</b>
          </article>`).join('')}
        </div>
      </div>`;
  }
  const rubs = Number(values.rubs ?? 0);
  const sparked = Boolean(values.sparked);
  const resetObserved = Boolean(values.resetObserved);
  const stage = sparked ? 'spark' : rubs > 0 ? 'charging' : resetObserved ? 'reset' : 'balanced';
  const woolElectrons = sparked ? 0 : Math.max(0, 4 - rubs);
  const vaneElectrons = sparked ? 4 : 4 + rubs;
  const chargeRow = (symbol: '+' | '−', active: number, total: number, extrasFrom = total) => `<span class="charge-marker-row" aria-hidden="true">${Array.from({ length: total }, (_, index) => `<i data-sign="${symbol}" data-on="${index < active}" data-extra="${index >= extrasFrom}">${symbol}</i>`).join('')}</span>`;
  const woolStatus = stage === 'balanced' || stage === 'reset' ? 'Net charge: balanced' : 'Net charge: positive, missing electrons';
  const vaneStatus = stage === 'charging' ? 'Net charge: negative, extra electrons' : stage === 'spark' ? 'Excess charge is discharging' : 'Net charge: balanced';
  return `
    <div class="challenge-apparatus static-vane ${sparked ? 'is-sparking' : ''}" data-static-stage="${stage}">
      <div class="static-model-note"><strong>Simplified charge model</strong><span>+ markers stay in the material. Only electron − markers move. The transfer direction depends on the materials; this model fixes one direction so you can follow it.</span></div>
      <div class="static-transfer-story" data-drop-action="rub-vane" data-drop-secondary="vane">
        <section class="charge-object-card wool-model" draggable="true" data-drag-action="rub-vane" data-drag-value="wool">
          <span class="object-kicker">Object A</span>
          <div class="wool-fibers" aria-hidden="true"><i></i><i></i><i></i></div>
          <h4>Wool pad</h4>
          <div class="charge-ledger"><span>Fixed + markers</span>${chargeRow('+', 4, 4)}<span>Electron − markers</span>${chargeRow('−', woolElectrons, 4)}</div>
          <strong class="net-charge" data-charge="${stage === 'balanced' || stage === 'reset' ? 'neutral' : 'positive'}">${woolStatus}</strong>
        </section>
        <div class="electron-transfer" data-active="${stage === 'charging'}">
          <span>${stage === 'charging' ? `${rubs} electron marker${rubs === 1 ? '' : 's'} moved` : stage === 'spark' ? 'excess electrons continue to the gap' : 'rub to transfer an electron'}</span>
          <b aria-hidden="true">electron − →</b>
        </div>
        <section class="charge-object-card vane-model">
          <span class="object-kicker">Object B</span>
          <div class="storm-vane" aria-hidden="true"><span></span><i></i></div>
          <h4>Insulated vane</h4>
          <div class="charge-ledger"><span>Fixed + markers</span>${chargeRow('+', 4, 4)}<span>Electron − markers</span>${chargeRow('−', vaneElectrons, 8, 4)}</div>
          <strong class="net-charge" data-charge="${stage === 'charging' ? 'negative' : stage === 'spark' ? 'discharging' : 'neutral'}">${vaneStatus}</strong>
        </section>
      </div>
      <section class="static-gap-model" aria-label="Magnified air gap and spark">
        <div class="gap-copy"><span>Magnified air gap</span><strong>${stage === 'spark' ? 'The air briefly conducts' : stage === 'reset' ? 'The gap is quiet again' : 'Air blocks a continuous path'}</strong><p>${stage === 'spark' ? 'Excess electrons cross once, so the vane-to-receiver imbalance falls and the flow stops.' : stage === 'reset' ? 'The model has returned both objects near balance.' : 'Charge stays separated until the difference becomes large enough for a spark.'}</p></div>
        <div class="gap-diagram" aria-hidden="true">
          <span class="gap-terminal">vane tip</span><i class="gap-space"></i><b class="spark-bolt">${stage === 'spark' ? '⚡' : '×'}</b><i class="gap-space"></i><span class="gap-terminal receiver">receiver</span>
        </div>
      </section>
      <ol class="static-process-steps" aria-label="Static charge process">
        <li data-state="${stage === 'balanced' || stage === 'charging' ? 'current' : 'done'}"><strong>1 Rub</strong><span>move electrons</span></li>
        <li data-state="${stage === 'spark' ? 'current' : stage === 'reset' ? 'done' : 'waiting'}"><strong>2 Spark</strong><span>brief discharge</span></li>
        <li data-state="${stage === 'reset' ? 'current' : 'waiting'}"><strong>3 Reset</strong><span>near balance</span></li>
      </ol>
      <div class="station-action-row">
        ${button(sparked ? 'Spark discharged' : `Rub once: move electron ${Math.min(4, rubs + 1)} of 4`, 'rub-vane', '', { className: 'station-lever', disabled: sparked })}
        ${button('Reset model after spark', 'reset-vane', '', { disabled: !sparked })}
      </div>
      <p class="station-touch-hint">Drag the wool pad onto the vane, or use the rub button. The plus markers do not travel.</p>
    </div>`;
}

function waveformPath(wave: string) {
  if (wave === 'steady-dc') return 'M18 30 H382';
  if (wave === 'unregulated') return 'M18 42 C70 22 110 48 164 36 S270 26 382 36';
  if (wave === 'pulsing-dc') return 'M18 55 C42 10 70 10 94 55 S146 10 170 55 S222 10 246 55 S298 10 322 55 S366 18 382 55';
  if (wave === 'blocked-reversal') return 'M18 32 H150 M250 32 H382';
  if (wave === 'adjusted-ac') return 'M18 55 C44 28 70 28 96 55 S148 82 174 55 S226 28 252 55 S304 82 330 55 S370 36 382 55';
  return 'M18 55 C44 10 70 10 96 55 S148 100 174 55 S226 10 252 55 S304 100 330 55 S370 20 382 55';
}

function converterWave(wave: string, label: string, className = '') {
  return `<svg class="converter-wave ${className}" viewBox="0 0 400 110" role="img" aria-label="${escapeHtml(label)}">
    <rect class="wave-positive-zone" x="12" y="8" width="376" height="47" rx="8"></rect>
    <rect class="wave-negative-zone" x="12" y="55" width="376" height="47" rx="8"></rect>
    <line x1="12" y1="55" x2="388" y2="55"></line>
    <path d="${waveformPath(wave)}"></path>
  </svg>`;
}

function converterStageCard(options: {
  number: number;
  name: string;
  job: string;
  outcome: string;
  wave: string;
  state: string;
  part: string;
}) {
  return `<article class="converter-stage-card" data-stage-state="${escapeHtml(options.state)}">
    <header><span>${options.number}</span><div><strong>${options.name}</strong><small>${options.job}</small></div></header>
    <div class="converter-part part-${escapeHtml(options.part)}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    ${converterWave(options.wave, `${options.name}: ${options.outcome}`, 'converter-mini-wave')}
    <p>${options.outcome}</p>
  </article>`;
}

function renderConverter(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const wave = String(values.wave ?? 'reversing');
    const rectifierReady = values.rectifier === 'ready';
    const testedWrong = Boolean(values.testedWrong);
    const rectificationSeen = Boolean(values.rectificationSeen);
    const capacitorInstalled = Boolean(values.capacitorInstalled);
    const waveLabels: Record<string, [string, string]> = {
      reversing: ['Incoming AC', 'The trace crosses zero, so its direction reverses.'],
      'blocked-reversal': ['Blocked at stage 2', 'The reversed rectifier blocks part of the signal instead of flipping it.'],
      'pulsing-dc': ['Pulsing DC after rectification', 'Every pulse stays above zero, but deep dips remain.'],
      unregulated: ['Smoothed DC with ripple', 'Stored charge fills the deepest dips, but the level still moves.'],
      'steady-dc': ['Regulated steady DC', 'The final output stays near the radio target.'],
    };
    const currentWave = waveLabels[wave] ?? waveLabels.reversing;
    const guide = !testedWrong
      ? ['Probe 1: expose the broken stage', 'Send the AC signal through the line before repairing anything.']
      : !rectifierReady
        ? ['Repair 1: turn the rectifier', 'Make the negative half of AC flip upward instead of being blocked.']
        : !rectificationSeen
          ? ['Probe 2: inspect rectification', 'Confirm that the output is one-direction pulses before smoothing it.']
          : !capacitorInstalled
            ? ['Repair 2: add the capacitor', 'Give the pulsing output stored charge that can fill its dips.']
            : ['Probe 3: run the complete path', 'Watch the regulator hold the smoothed output at the target.'];
    return `
      <div class="challenge-apparatus converter-line" data-wave="${escapeHtml(wave)}">
        <div class="converter-guide">
          <span>Signal journey</span><div><strong>${guide[0]}</strong><p>${guide[1]}</p></div>
        </div>
        <section class="converter-stage-board" aria-label="Four AC to DC conversion stages">
          <div class="converter-stage-strip">
            ${converterStageCard({ number: 1, name: 'Adjust', job: 'Change the voltage range', outcome: 'Still reversing', wave: 'adjusted-ac', state: 'done', part: 'adjust' })}
            ${converterStageCard({ number: 2, name: 'Rectify', job: 'Flip negative halves upward', outcome: rectifierReady ? rectificationSeen ? 'Pulsing one way' : 'Ready to probe' : testedWrong ? 'Reversed part found' : 'Orientation unknown', wave: rectifierReady ? 'pulsing-dc' : 'blocked-reversal', state: rectificationSeen ? 'done' : rectifierReady ? 'ready' : testedWrong ? 'fault' : 'current', part: 'rectifier' })}
            ${converterStageCard({ number: 3, name: 'Smooth', job: 'Fill the dips', outcome: capacitorInstalled ? 'Ripple reduced' : 'Capacitor bay empty', wave: 'unregulated', state: capacitorInstalled ? 'done' : rectificationSeen ? 'current' : 'waiting', part: 'capacitor' })}
            ${converterStageCard({ number: 4, name: 'Regulate', job: 'Hold the target', outcome: state.solved ? 'Steady DC ready' : 'Waiting for smooth input', wave: 'steady-dc', state: state.solved ? 'done' : capacitorInstalled ? 'current' : 'waiting', part: 'regulator' })}
          </div>
          <div class="converter-output-inspector">
            <div><span>Probe output</span><strong>${currentWave[0]}</strong><p>${currentWave[1]}</p></div>
            <div class="converter-output-wave">
              <span class="wave-direction-label positive">one direction</span>
              ${converterWave(wave, `${currentWave[0]}. ${currentWave[1]}`)}
              <span class="wave-direction-label negative">reversed direction</span>
            </div>
          </div>
        </section>
        <div class="converter-repair-actions">
          ${button(state.solved ? 'Run the steady output again' : 'Send probe signal', 'probe-converter', '', { className: 'station-lever' })}
          ${button(rectifierReady ? 'Rectifier facing correctly' : 'Rotate the rectifier', 'rotate-rectifier', '', { disabled: !testedWrong || rectifierReady })}
          ${button(capacitorInstalled ? 'Smoothing capacitor installed' : 'Install smoothing capacitor', 'install-capacitor', '', { disabled: !rectificationSeen || capacitorInstalled })}
        </div>
      </div>`;
  }
  if (state.phaseIndex === 1) {
    const adapter = String(values.adapter ?? '');
    const cards = {
      '9v-2a': { voltage: 9, type: 'DC', current: 2, connector: 'Barrel', polarity: 'Center +', label: '9 V DC · 2 A' },
      '5v-0.5a': { voltage: 5, type: 'DC', current: 0.5, connector: 'Barrel', polarity: 'Center +', label: '5 V DC · 0.5 A' },
      '5v-2a-negative': { voltage: 5, type: 'DC', current: 2, connector: 'Barrel', polarity: 'Center −', label: '5 V DC · 2 A' },
      '5v-2a': { voltage: 5, type: 'DC', current: 2, connector: 'Barrel', polarity: 'Center +', label: '5 V DC · 2 A' },
    } as const;
    const selected = cards[adapter as keyof typeof cards] ?? cards['9v-2a'];
    const checks = [
      ['Voltage', 'Exactly 5 V', `${selected.voltage} V`, selected.voltage === 5 ? 'Exact match' : 'Too high'],
      ['AC / DC type', 'DC', selected.type, selected.type === 'DC' ? 'Type matches' : 'Wrong type'],
      ['Current capacity', 'At least 1 A', `Up to ${selected.current} A`, selected.current >= 1 ? 'Enough capacity' : 'Too little'],
      ['Connector', 'Barrel, firm fit', selected.connector, selected.connector === 'Barrel' ? 'Shape matches' : 'Wrong shape'],
      ['Polarity', 'Center +', selected.polarity, selected.polarity === 'Center +' ? 'Polarity matches' : 'Opposite polarity'],
    ] as const;
    const everyCheckPasses = checks.every((row) => !['Too high', 'Wrong type', 'Too little', 'Wrong shape', 'Opposite polarity'].includes(row[3]));
    const testedSelection = values.lastTested === adapter;
    const gateState = Boolean(values.testedGood) ? 'open' : testedSelection ? 'rejected' : 'inspect';
    return `
      <div class="challenge-apparatus adapter-bench" data-gate-state="${gateState}">
        <div class="adapter-guide"><span>Read before coupling</span><div><strong>Device need → adapter output → five checks</strong><p>The barrel plug fits every candidate. The label decides whether the protected gate opens.</p></div></div>
        <section class="adapter-candidate-shelf" aria-label="Adapter output candidates">
          <header><span>Choose an adapter</span><strong>Same plug, different output labels</strong></header>
          <div class="adapter-card-grid">
            ${Object.entries(cards).map(([id, item]) => button(`<span>OUTPUT</span><strong>${item.label}</strong><small>${item.connector} · ${item.polarity}</small>`, 'choose-adapter', id, { className: 'adapter-card', pressed: adapter === id })).join('')}
          </div>
        </section>
        <section class="adapter-inspection-board" aria-label="Device and adapter label comparison">
          <div class="adapter-label-headings">
            <div><span>Device needs</span><strong>Dock radio input</strong></div>
            <div><span>Adapter provides</span><strong>Selected OUTPUT</strong></div>
          </div>
          <div class="adapter-check-rows">
            ${checks.map(([name, need, provides, result]) => `<div class="adapter-check-row" data-result="${['Exact match', 'Type matches', 'Enough capacity', 'Shape matches', 'Polarity matches'].includes(result) ? 'pass' : 'fail'}"><strong>${name}</strong><span data-side="Need">${need}</span><i aria-hidden="true">→</i><span data-side="Provides">${provides}</span><b>${result}</b></div>`).join('')}
          </div>
          <p class="adapter-capacity-note"><strong>Current capacity is a ceiling.</strong> The device draws what it needs, up to what the adapter can safely provide. A 2 A adapter does not force 2 A into this 1 A radio.</p>
        </section>
        <div class="protected-gate" data-open="${Boolean(values.testedGood)}" data-state="${gateState}">
          <span class="adapter-plug" aria-hidden="true"></span><i></i><strong>${gateState === 'open' ? 'All five checks pass · radio powered' : gateState === 'rejected' ? 'Mismatch found · coupling blocked' : everyCheckPasses ? 'Inspection predicts a match' : 'Inspection predicts a mismatch'}</strong><i></i><span class="adapter-radio" aria-hidden="true">♪</span>
        </div>
        ${button('Test selected label at protected gate', 'test-adapter', '', { className: 'station-lever' })}
      </div>`;
  }
  const connected = Boolean(values.connected);
  const offerSent = Boolean(values.offerSent);
  const requestSent = Boolean(values.requestSent);
  const negotiated = Boolean(values.negotiated);
  const protocolStage = negotiated ? 4 : requestSent ? 3 : offerSent ? 2 : connected ? 1 : 0;
  return `
    <div class="challenge-apparatus negotiation-bench" data-negotiated="${negotiated}" data-protocol-stage="${protocolStage}">
      <div class="negotiation-guide"><span>Same USB-C connector</span><div><strong>Default 5 V first. Messages decide whether power rises.</strong><p>The model cable supports the requested mode. It carries the agreement; it does not choose the voltage.</p></div></div>
      <section class="negotiation-apparatus" aria-label="USB-C charger and radio negotiation">
        <article class="negotiation-endpoint charger-endpoint"><span>Source</span><div class="endpoint-icon" aria-hidden="true">⚡</div><h4>PD charger</h4><p>Can offer</p><strong>5 V default</strong><strong>9 V optional</strong></article>
        <div class="usb-c-bridge">
          <div class="usb-c-power-line" data-connected="${connected}" data-voltage="${negotiated ? '9' : connected ? '5' : '0'}"><span></span><b>${negotiated ? '9 V after agreement' : connected ? '5 V default' : 'Disconnected'}</b><span></span></div>
          <div class="protocol-message-stack" aria-label="Negotiation messages">
            <p data-message-state="${offerSent ? 'done' : connected ? 'current' : 'waiting'}"><strong>Offer</strong><span>5 V + 9 V</span><b aria-hidden="true">→</b></p>
            <p data-message-state="${requestSent ? 'done' : offerSent ? 'current' : 'waiting'}"><strong>Request</strong><span>9 V</span><b aria-hidden="true">←</b></p>
            <p data-message-state="${negotiated ? 'done' : requestSent ? 'current' : 'waiting'}"><strong>Accept</strong><span>9 V, then switch</span><b aria-hidden="true">→</b></p>
          </div>
          <small>USB-C model cable · supports this mode</small>
        </div>
        <article class="negotiation-endpoint radio-endpoint"><span>Sink</span><div class="endpoint-icon" aria-hidden="true">♪</div><h4>Dock radio</h4><p>Starts at</p><strong>5 V safely</strong><p>Requests</p><strong>9 V mode</strong></article>
      </section>
      <ol class="negotiation-steps" aria-label="USB-C negotiation sequence">
        ${[
          ['1', 'Connect', 'Default 5 V'],
          ['2', 'Offer', 'Charger lists modes'],
          ['3', 'Request', 'Radio asks for 9 V'],
          ['4', 'Accept', 'Then output rises'],
        ].map(([number, name, detail], index) => `<li data-step-state="${protocolStage > index ? 'done' : protocolStage === index ? 'current' : 'waiting'}"><span>${number}</span><div><strong>${name}</strong><small>${detail}</small></div></li>`).join('')}
      </ol>
      <div class="negotiation-actions">
        ${button(connected ? 'USB-C connected at 5 V' : 'Connect USB-C at default 5 V', 'connect-usbc', '', { disabled: connected })}
        ${button(offerSent ? 'Offer sent' : 'Send charger offer', 'send-pd-offer', '', { disabled: !connected || offerSent })}
        ${button(requestSent ? '9 V request sent' : 'Send radio request', 'send-pd-request', '', { disabled: !offerSent || requestSent })}
        ${button(negotiated ? '9 V accepted' : 'Accept request and raise output', 'accept-pd-request', '', { className: negotiated ? '' : 'station-lever', disabled: !requestSent || negotiated })}
      </div>
    </div>`;
}

function crankButtons() {
  return `<div class="crank-actions">${button('Pull crank left', 'crank', 'left', { className: 'crank-left' })}${button('Pull crank right', 'crank', 'right', { className: 'crank-right' })}</div>`;
}

function generatorRig(values: Record<string, unknown>, options: { connected?: boolean; powered?: boolean; strain?: string } = {}) {
  const strokes = Number(values.strokes ?? values.steadyStrokes ?? 0);
  return `<div class="generator-rig" data-strokes="${strokes}" data-connected="${String(options.connected ?? false)}" data-powered="${String(options.powered ?? false)}" data-strain="${options.strain ?? 'light'}">
    <div class="hand-crank" aria-hidden="true"><span></span><i></i></div>
    <div class="moving-magnet" aria-hidden="true"><b>N</b><b>S</b></div>
    <div class="generator-coil" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="terminal-lamp" aria-hidden="true"><span></span><b>${options.connected ? 'lamp path closed' : 'terminals open'}</b></div>
  </div>`;
}

function voltageCurrentDiagram(values: Record<string, unknown>) {
  const bridgeInstalled = Boolean(values.loopClosed);
  const openRunRecorded = Boolean(values.openVoltageSeen);
  const currentSeen = Boolean(values.currentSeen);
  const voltageActive = Boolean(values.voltageActive);
  const diagramLabel = bridgeInstalled
    ? currentSeen
      ? 'The copper bridge completes the lamp loop. Crank motion creates voltage across the coil ends and current circulates through the lit lamp.'
      : 'The copper bridge completes the lamp loop, but the generator is not moving. There is no active voltage, current, or lamp light.'
    : openRunRecorded
      ? 'The generator has voltage across its open wire ends. The missing copper bridge prevents sustained current, so the lamp is off.'
      : 'The copper bridge is missing. Crank the generator to test whether voltage can appear across open wire ends.';
  return `
    <section class="voltage-current-model" aria-label="Generator, voltage, current, and lamp path">
      <div class="wind-comparison-guide">
        <span>Controlled comparison</span>
        <div><strong>One generator. One changed part.</strong><p>Keep the magnet, coil, and crank motion the same. Change only the copper bridge between the two runs.</p></div>
      </div>
      <svg class="voltage-current-diagram" data-bridge="${bridgeInstalled}" data-voltage="${voltageActive}" data-current="${currentSeen}" viewBox="0 0 820 220" role="img" aria-label="${escapeHtml(diagramLabel)}">
        <defs>
          <marker id="windMotionArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z"></path></marker>
          <marker id="windVoltageArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 Z"></path></marker>
        </defs>
        <g class="wind-source-drawing" aria-hidden="true">
          <circle class="wind-crank-wheel" cx="68" cy="108" r="38"></circle>
          <path class="wind-crank-arm" d="M68 108 L103 88"></path>
          <circle class="wind-crank-handle" cx="108" cy="85" r="9"></circle>
          <path class="wind-motion-arrow" d="M32 77 A48 48 0 0 1 94 62"></path>
          <g class="wind-bar-magnet"><rect x="135" y="80" width="62" height="56" rx="10"></rect><rect x="197" y="80" width="62" height="56" rx="10"></rect><text x="166" y="115">N</text><text x="228" y="115">S</text></g>
          <g class="wind-coil-drawing"><ellipse cx="290" cy="108" rx="17" ry="62"></ellipse><ellipse cx="310" cy="108" rx="17" ry="62"></ellipse><ellipse cx="330" cy="108" rx="17" ry="62"></ellipse><ellipse cx="350" cy="108" rx="17" ry="62"></ellipse></g>
          <text class="wind-svg-label" x="134" y="162">moving magnet</text>
          <text class="wind-svg-label" x="287" y="184">wire coil</text>
        </g>
        <g class="wind-wire-drawing" aria-hidden="true">
          <path class="wind-wire" d="M350 52 H505"></path>
          <path class="wind-wire" d="M350 164 H702 Q748 164 748 120"></path>
          <path class="wind-wire" d="M565 52 H702 Q748 52 748 96"></path>
          <circle class="wind-terminal" cx="505" cy="52" r="8"></circle>
          <circle class="wind-terminal" cx="565" cy="52" r="8"></circle>
          <path class="wind-bridge" d="M505 52 H565"></path>
          <text class="wind-gap-label" x="535" y="31">${bridgeInstalled ? 'BRIDGE INSTALLED' : 'GAP OPEN'}</text>
          <path class="wind-voltage-span" d="M390 70 V146"></path>
          <text class="wind-voltage-symbol" x="405" y="111">V</text>
          <text class="wind-voltage-copy" x="405" y="130">push across the ends</text>
          <circle class="wind-lamp-bulb" cx="748" cy="108" r="28"></circle>
          <path class="wind-lamp-filament" d="M736 109 Q748 92 760 109 Q748 125 736 109"></path>
          <text class="wind-svg-label" x="706" y="190">lamp load</text>
          <circle class="wind-current-token token-one" cx="620" cy="52" r="7"></circle>
          <circle class="wind-current-token token-two" cx="748" cy="74" r="7"></circle>
          <circle class="wind-current-token token-three" cx="668" cy="164" r="7"></circle>
          <circle class="wind-current-token token-four" cx="460" cy="164" r="7"></circle>
        </g>
      </svg>
      <div class="voltage-current-readouts">
        <span data-reading-state="${voltageActive ? 'active' : openRunRecorded ? 'recorded' : 'waiting'}"><small>Voltage across the ends</small><strong>${voltageActive ? 'Voltage present' : openRunRecorded ? 'Recorded in run A' : 'Waiting for crank'}</strong></span>
        <span data-reading-state="${currentSeen ? 'active' : openRunRecorded ? 'recorded-zero' : 'waiting'}"><small>Current around the loop</small><strong>${currentSeen ? 'Current flows' : openRunRecorded ? '0 loop current' : 'Waiting for test'}</strong></span>
        <span data-reading-state="${currentSeen ? 'active' : 'waiting'}"><small>Lamp energy transfer</small><strong>${currentSeen ? 'Lamp on while cranking' : bridgeInstalled ? 'Lamp still off' : 'Lamp off'}</strong></span>
      </div>
    </section>`;
}

function renderWind(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    return `<div class="challenge-apparatus wind-bench">
      ${generatorRig(values)}
      <div class="station-action-row">${button('Hold magnet still', 'observe-still', '', { pressed: Boolean(values.stillObserved) })}${crankButtons()}</div>
      ${progressDots(Number(values.strokes ?? 0), 4, 'Alternating crank strokes')}
    </div>`;
  }
  if (state.phaseIndex === 1) {
    const connected = Boolean(values.loopClosed);
    const openRunRecorded = Boolean(values.openVoltageSeen);
    const currentSeen = Boolean(values.currentSeen);
    const guide = !openRunRecorded
      ? ['Run A: leave the gap open', 'Pull the crank. Look for push across the wire ends while the broken path keeps current at zero.']
      : !connected
        ? ['Change one part: install the bridge', 'The copper bridge completes the path. It is not a source, so the lamp must stay off until you crank again.']
        : !currentSeen
          ? ['Run B: crank the same generator', 'Use the same motion. Now the induced voltage has a complete route through the lamp.']
          : ['Comparison recorded', 'Voltage appeared in both moving-generator runs. Current appeared only in the run with a complete loop.'];
    return `<div class="challenge-apparatus wind-bench voltage-current-bench" data-bridge="${connected}" data-open-run="${openRunRecorded}" data-current-run="${currentSeen}">
      <div class="wind-run-guide"><span>Voltage and current</span><div><strong>${guide[0]}</strong><p>${guide[1]}</p></div></div>
      ${voltageCurrentDiagram(values)}
      <section class="wind-run-evidence" aria-label="Open and closed path comparison">
        <article data-recorded="${openRunRecorded}">
          <header><span>Run A</span><strong>Gap open</strong><b>${openRunRecorded ? 'Recorded' : 'Waiting'}</b></header>
          <p><span>Voltage</span><strong>${openRunRecorded ? 'present' : 'waiting'}</strong><span>Current</span><strong>${openRunRecorded ? 'zero' : 'waiting'}</strong><span>Lamp</span><strong>off</strong></p>
        </article>
        <article data-recorded="${currentSeen}">
          <header><span>Run B</span><strong>Bridge closed</strong><b>${currentSeen ? 'Recorded' : connected ? 'Ready to crank' : 'Waiting'}</b></header>
          <p><span>Voltage</span><strong>${currentSeen ? 'present' : 'waiting'}</strong><span>Current</span><strong>${currentSeen ? 'flows' : 'waiting'}</strong><span>Lamp</span><strong>${currentSeen ? 'on' : 'off'}</strong></p>
        </article>
      </section>
      <div class="wind-test-actions">
        ${crankButtons()}
        ${button(connected ? 'Bridge installed' : 'Install copper bridge', 'connect-loop', '', { disabled: !openRunRecorded || connected })}
      </div>
    </div>`;
  }
  const load = String(values.load ?? 'heavy');
  const strain = load === 'heavy' ? 'heavy' : load === 'balanced' ? 'balanced' : 'light';
  return `<div class="challenge-apparatus wind-bench">
    ${generatorRig(values, { connected: true, powered: Number(values.steadyStrokes ?? 0) > 0, strain })}
    <div class="load-weight-rack" aria-label="Electrical load weights">
      ${button('Small lamp', 'set-load', 'light', { pressed: load === 'light' })}
      ${button('Working lantern bank', 'set-load', 'balanced', { pressed: load === 'balanced' })}
      ${button('Heavy heater bank', 'set-load', 'heavy', { pressed: load === 'heavy' })}
    </div>
    ${crankButtons()}
    ${progressDots(Number(values.steadyStrokes ?? 0), 4, 'Sustainable strokes')}
  </div>`;
}

function renderLongline(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const voltage = String(values.voltage ?? 'low');
    return `<div class="challenge-apparatus longline-bench" data-line-heat="${Number(values.heat ?? 0) > 4 ? 'hot' : 'cool'}">
      <div class="fixed-cargo"><span>Fixed town delivery</span><strong>same power</strong></div>
      <div class="line-voltage-choice">${button('Low voltage cars', 'set-line-voltage', 'low', { pressed: voltage === 'low' })}${button('High voltage cars', 'set-line-voltage', 'high', { pressed: voltage === 'high' })}</div>
      <div class="transmission-line" aria-hidden="true"><span>source</span><i></i><i></i><i></i><b>town</b></div>
      <div class="line-comparison" aria-label="Saved dispatch results">
        <section data-recorded="${Boolean(values.lowSeen)}"><span>Low voltage</span><small>Current packets</small><strong>${Number(values.lowCurrent ?? 0) || 'waiting'}</strong><small>Relative heat</small><strong>${Number(values.lowHeat ?? 0) || 'waiting'}</strong></section>
        <section data-recorded="${Boolean(values.highSeen)}"><span>High voltage</span><small>Current packets</small><strong>${Number(values.highCurrent ?? 0) || 'waiting'}</strong><small>Relative heat</small><strong>${Number(values.highHeat ?? 0) || 'waiting'}</strong></section>
      </div>
      ${button('Dispatch fixed delivery', 'dispatch', '', { className: 'station-lever' })}
    </div>`;
  }
  if (state.phaseIndex === 1) {
    const source = String(values.source ?? 'dc');
    const up = String(values.stepUp ?? 'reversed');
    const down = String(values.stepDown ?? 'missing');
    return `<div class="challenge-apparatus transformer-rail" data-energized="${Boolean(values.energized)}">
      <div class="transformer-chain">
        <section><span>Source cartridge</span>${button('Steady DC', 'set-source', 'dc', { pressed: source === 'dc' })}${button('Alternating AC', 'set-source', 'ac', { pressed: source === 'ac' })}</section>
        <section class="coil-cartridge"><span>Before line</span>${button('Fewer → more turns', 'set-step-up', 'up', { pressed: up === 'up' })}${button('More → fewer turns', 'set-step-up', 'reversed', { pressed: up === 'reversed' })}</section>
        <div class="rail-span">long line</div>
        <section class="coil-cartridge"><span>Beside town</span>${button('More → fewer turns', 'set-step-down', 'down', { pressed: down === 'down' })}${button('No second coil', 'set-step-down', 'missing', { pressed: down === 'missing' })}</section>
      </div>
      <div class="flux-core" aria-hidden="true"><i></i><i></i><span>changing flux links the coils</span></div>
      ${button('Energize transformer chain', 'energize-chain', '', { className: 'station-lever' })}
    </div>`;
  }
  const route = String(values.route ?? 'low');
  return `<div class="challenge-apparatus final-dispatch" data-town-lit="${Boolean(values.townLit)}">
    <div class="route-cards">${button('<strong>Direct low-voltage route</strong><small>many current packets</small>', 'set-route', 'low', { pressed: route === 'low' })}${button('<strong>Step up, travel, step down</strong><small>fewer line-current packets</small>', 'set-route', 'transformed', { pressed: route === 'transformed' })}</div>
    <div class="town-route" aria-hidden="true"><span>step up</span><i></i><i></i><b>step down</b><em>town lights</em></div>
    ${button('Send the town delivery', 'dispatch', '', { className: 'station-lever' })}
  </div>`;
}

function renderLantern(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const leftPower = Number(values.leftPower ?? 1000);
    const leftHours = Number(values.leftHours ?? 1);
    const leftEnergy = Number(values.leftEnergy ?? leftPower * leftHours);
    const rightPower = Number(values.rightPower ?? 100);
    const rightHours = Number(values.rightHours ?? 1);
    const rightEnergy = Number(values.rightEnergy ?? rightPower * rightHours);
    const factorControl = (label: string, factor: string, selected: number, options: number[], unit: string) => `<div class="energy-factor">
      <span>${label}</span>
      <div role="group" aria-label="${label}">${options.map((option) => button(`${option} ${unit}`, 'set-energy-factor', option, { secondary: factor, pressed: selected === option })).join('')}</div>
    </div>`;
    const machine = (side: 'left' | 'right', label: string, power: number, hours: number, energy: number) => `<section class="energy-machine" data-side="${side}" data-total="${energy}">
      <header><span>${side === 'left' ? 'A' : 'B'}</span><div><strong>${label}</strong><small>Build this evening from two independent controls</small></div></header>
      <div class="energy-machine-controls">
        ${factorControl('Power rate', `${side}Power`, power, [100, 500, 1000], 'W')}
        <span class="energy-multiply" aria-hidden="true">×</span>
        ${factorControl('Runtime', `${side}Hours`, hours, [1, 2, 10], 'h')}
      </div>
      <div class="energy-flow-machine" aria-hidden="true"><span class="rate-pipe" style="--rate:${Math.min(100, power / 10)}%"></span><i>rate</i><b>over time</b><span class="energy-tank" style="--energy-fill:${Math.min(100, energy / 10)}%"></span></div>
      <div class="energy-equation" aria-label="${power} watts times ${hours} hours equals ${energy} watt-hours">
        <span><small>Power rate</small><strong>${power} W</strong></span>
        <b>×</b>
        <span><small>Runtime</small><strong>${hours} h</strong></span>
        <b>=</b>
        <span class="energy-answer"><small>Energy accumulated</small><strong>${energy} Wh</strong></span>
      </div>
      <p>${power} W × ${hours} h = ${energy} Wh</p>
    </section>`;
    const difference = Math.abs(leftEnergy - rightEnergy);
    return `<div class="challenge-apparatus energy-workbench" data-balanced="${state.solved}">
      <div class="lantern-concept-guide"><span>Rate × time = total</span><p><strong>W</strong> tells how fast energy is being used. <strong>h</strong> tells how long that rate lasts. Their product is <strong>Wh</strong>, the accumulated energy.</p></div>
      <div class="energy-machines">
        ${machine('left', 'Evening A', leftPower, leftHours, leftEnergy)}
        ${machine('right', 'Evening B', rightPower, rightHours, rightEnergy)}
      </div>
      <div class="energy-match-result">
        <span aria-hidden="true">${state.solved ? '✓' : '↔'}</span>
        <div><strong>${state.solved ? 'Equal energy, different evenings' : `${leftEnergy} Wh is not ${rightEnergy} Wh`}</strong><small>${state.solved ? `Both tanks hold ${leftEnergy} Wh, even though their power and time settings differ.` : `The totals differ by ${difference} Wh. Change one rate or runtime and watch its tank and equation respond.`}</small></div>
      </div>
    </div>`;
  }
  if (state.phaseIndex === 1) {
    const schedule = (values.schedule as Record<string, string>) ?? {};
    const selected = String(values.selectedPlan ?? 'mixed');
    const testedStart = Boolean(values.testedStart);
    const testedGood = Boolean(values.testedGood);
    const plans: Record<string, { name: string; brightness: number; power: number }> = {
      efficient: { name: 'Efficient strings', brightness: 2, power: 200 },
      mixed: { name: 'Full market bank', brightness: 4, power: 400 },
      warm: { name: 'Feature lamps', brightness: 3, power: 500 },
      dim: { name: 'Guide string', brightness: 1, power: 100 },
    };
    const periods = [
      { id: 'dusk', name: 'Dusk', hours: 1, need: 2 },
      { id: 'peak', name: 'Peak market', hours: 2, need: 4 },
      { id: 'closing', name: 'Closing', hours: 1, need: 2 },
    ];
    const periodCard = ({ id, name, hours, need }: typeof periods[number]) => {
      const plan = plans[schedule[id]] ?? { name: 'No lamps', brightness: 0, power: 0 };
      const energy = plan.power * hours;
      const meetsNeed = plan.brightness >= need;
      return `<section class="market-period-card" data-meets-need="${meetsNeed}" data-observed="${testedStart}">
        <header><span>${name} · ${hours} h</span><strong>Needs brightness ${need}</strong></header>
        <div class="lantern-brightness" role="img" aria-label="Brightness ${plan.brightness} of ${need} needed">${Array.from({ length: 4 }, (_, index) => `<i data-on="${index < plan.brightness}" data-needed="${index < need}"></i>`).join('')}</div>
        <div class="period-plan"><small>Installed plan</small><strong>${plan.name}</strong><span>${plan.brightness} brightness · ${plan.power} W</span></div>
        <div class="period-equation"><span>${plan.power} W</span><b>×</b><span>${hours} h</span><b>=</b><strong>${energy} Wh</strong></div>
        ${button(`Assign selected: ${plans[selected]?.name ?? 'choose a plan'}`, 'place-market-period', id, { disabled: !testedStart })}
        <p>${testedStart ? meetsNeed ? 'Brightness target met' : `Underlit by ${need - plan.brightness}` : 'Run once to inspect this period'}</p>
      </section>`;
    };
    return `<div class="challenge-apparatus market-scheduler" data-energy="${Number(values.energy ?? 0)}" data-tested="${testedStart}" data-valid="${testedGood}">
      <div class="lantern-concept-guide"><span>Meet light need, then count Wh</span><p>First observe the faulty night. Then choose a lamp plan, assign it to a period, and rerun. Longer periods multiply the same W into more Wh.</p></div>
      <div class="market-plan-rack" aria-label="Available lamp plans">
        ${Object.entries(plans).map(([id, plan]) => button(`<strong>${plan.name}</strong><small><span>Brightness ${plan.brightness}</span><span>${plan.power} W power rate</span></small>`, 'select-market-plan', id, { pressed: selected === id, disabled: !testedStart, className: 'market-plan-choice' })).join('')}
      </div>
      <div class="market-period-grid">${periods.map(periodCard).join('')}</div>
      <div class="market-budget">
        <div><span>Night energy total</span><strong>${Number(values.energy ?? 0)} Wh <small>of 1200 Wh available</small></strong></div>
        <span class="market-budget-track"><i style="--energy:${Math.min(100, Number(values.energy ?? 0) / 12)}%"></i><b aria-hidden="true"></b></span>
        <p>${testedGood ? 'All three light needs are met within the energy budget.' : testedStart ? 'Change the underlit period, then test the whole night again.' : 'The starting plan is within budget, but one period is too dark. Run it to find where.'}</p>
        ${button(!testedStart ? 'Run the underlit starting market' : testedGood ? 'Market plan verified' : 'Rerun the full market plan', 'test-market-schedule', '', { className: 'station-lever', disabled: testedGood })}
      </div>
    </div>`;
  }
  const period = Number(values.period ?? 0);
  const energy = Number(values.energy ?? 0);
  const power = Number(values.power ?? 0);
  const kwh = energy / 1000;
  const cost = Number(values.cost ?? 0);
  const receipts = Array.isArray(values.receipts)
    ? values.receipts.filter((receipt): receipt is Record<string, unknown> => Boolean(receipt && typeof receipt === 'object' && !Array.isArray(receipt)))
    : [];
  const periods = [
    { label: 'Dusk', power: 200, hours: 1, energy: 200 },
    { label: 'Peak market', power: 400, hours: 2, energy: 800 },
    { label: 'Closing', power: 200, hours: 1, energy: 200 },
  ];
  const next = periods[Math.min(period, 2)];
  return `<div class="challenge-apparatus evening-replay" data-period="${period}">
    <div class="lantern-concept-guide"><span>Each period makes a receipt</span><p>Watts show the rate while lamps are on. Multiply by hours to create Wh, then add each Wh receipt to the running total.</p></div>
    <div class="night-period-strip">
      ${periods.map((item, index) => `<section data-state="${index < period ? 'done' : index === period ? 'next' : 'waiting'}"><span>${index + 1}</span><div><strong>${item.label}</strong><small>${item.power} W for ${item.hours} h</small></div><b>${item.power} W × ${item.hours} h = ${item.energy} Wh</b></section>`).join('')}
    </div>
    <div class="evening-causal-board">
      <section class="power-rate-meter" data-powered="${power > 0}">
        <span>Power rate during period</span>
        <strong>${power} W</strong>
        <div aria-hidden="true">${Array.from({ length: 4 }, (_, index) => `<i data-on="${index < power / 100}"></i>`).join('')}</div>
        <p>${period === 0 ? 'No period has run yet.' : period >= 3 ? 'Lamps are off now. Power returned to zero.' : `${String(values.lastLabel)} ran at this rate.`}</p>
      </section>
      <span class="receipt-arrow" aria-hidden="true">power × time<br>makes Wh →</span>
      <section class="energy-accumulator">
        <span>Energy accumulator</span>
        <strong>${energy} Wh</strong>
        <div class="accumulator-vessel" style="--energy:${Math.min(100, energy / 12)}%" aria-hidden="true"><i></i></div>
        <p>${energy ? 'The total stays here when the power rate changes or stops.' : 'Empty until the first period receipt arrives.'}</p>
      </section>
    </div>
    <div class="energy-receipt-ledger" aria-label="Period energy receipts">
      ${periods.map((item, index) => {
        const receipt = receipts[index];
        return `<section data-filled="${Boolean(receipt)}"><span>${index + 1}</span><div><strong>${item.label}</strong><small>${receipt ? `${Number(receipt.power)} W × ${Number(receipt.hours)} h = ${Number(receipt.added)} Wh` : 'Waiting for this period'}</small></div><b>${receipt ? `Running total ${Number(receipt.total)} Wh` : 'No receipt yet'}</b></section>`;
      }).join('')}
    </div>
    <div class="energy-conversion-chain">
      <section><span>1. Accumulated energy</span><strong>${energy} Wh</strong></section>
      <b aria-hidden="true">÷ 1000</b>
      <section><span>2. Convert Wh ÷ 1000 = kWh</span><strong>${kwh.toFixed(3)} kWh</strong></section>
      <b aria-hidden="true">× $0.18</b>
      <section><span>3. kWh × $0.18 = cost</span><strong>$${cost.toFixed(2)}</strong></section>
      ${button(period >= 3 ? 'Night complete: lamps are off' : `Run ${next.label} for ${next.hours} h`, 'advance-period', '', { className: 'station-lever', disabled: period >= 3 })}
    </div>
  </div>`;
}

function renderHarbor(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    return `<div class="challenge-apparatus path-layers" data-normal="${Boolean(values.observedNormal)}">
      <div class="layer-cutaway">
        <section><span>Intended core</span>${button('Copper conductor', 'set-layer', 'copper', { secondary: 'conductor', pressed: values.conductor === 'copper' })}${button('Rubber core', 'set-layer', 'rubber', { secondary: 'conductor', pressed: values.conductor === 'rubber' })}</section>
        <section><span>Barrier jacket</span>${button('Insulating jacket', 'set-layer', 'jacket', { secondary: 'insulation', pressed: values.insulation === 'jacket' })}${button('Leave exposed', 'set-layer', 'missing', { secondary: 'insulation', pressed: values.insulation === 'missing' })}</section>
        <section><span>Emergency path</span>${button('Ground conductor', 'set-layer', 'ground', { secondary: 'ground', pressed: values.ground === 'ground' })}${button('No backup path', 'set-layer', 'missing', { secondary: 'ground', pressed: values.ground === 'missing' })}</section>
      </div>
      <div class="normal-path-demo" aria-hidden="true"><span>live</span><i></i><b>load</b><i></i><span>neutral</span><em>ground quiet</em></div>
      ${button('Run normal service', 'run-normal', '', { className: 'station-lever' })}
    </div>`;
  }
  if (state.phaseIndex === 1) {
    const observed = (values.observed as string[]) ?? [];
    const cleared = (values.cleared as string[]) ?? [];
    const scenario = String(values.scenario ?? 'normal');
    const faultActive = Boolean(values.faultActive);
    const live = Number(values.live ?? 0);
    const neutral = Number(values.neutral ?? 0);
    const amount = Number(values.amount ?? 0);
    const imbalance = Number(values.imbalance ?? 0);
    const trip = String(values.trip ?? 'idle');
    const scenarios: Record<string, { name: string; physical: string; signal: string; run: string }> = {
      normal: { name: 'Normal load', physical: 'Current uses the intended load and returns on neutral.', signal: '3 out · 3 back', run: 'Run the normal loop' },
      overload: { name: 'Too many loads', physical: 'The normal path carries a larger current amount.', signal: '6 out · 6 back', run: 'Run the overload path' },
      short: { name: 'Bypass short', physical: 'A very low-opposition bridge bypasses the load.', signal: '9 out · 9 back', run: 'Run the short path' },
      leakage: { name: 'Leak path', physical: 'Part of the current leaves the live-neutral loop.', signal: '3 out · 1 back', run: 'Run the leakage path' },
    };
    const markers = (count: number, kind: 'live' | 'neutral') => Array.from({ length: 9 }, (_, index) => `<i data-on="${index < count}" data-kind="${kind}"></i>`).join('');
    const hasRun = trip !== 'idle';
    const breakerStatus = trip === 'breaker' ? 'OPEN on overcurrent' : hasRun ? 'Stays closed' : 'Waiting for a signal';
    const gfciStatus = trip === 'gfci' ? 'OPEN on missing return' : hasRun ? 'Stays closed' : 'Waiting for a signal';
    return `<div class="challenge-apparatus protection-signal-bench" data-scenario="${escapeHtml(scenario)}" data-fault-active="${faultActive}" data-trip="${escapeHtml(trip)}">
      <div class="harbor-concept-guide"><span>Two devices, two questions</span><p><strong>Breaker:</strong> is the current amount above 5? <strong>GFCI/RCD:</strong> did all current that left on live return on neutral?</p></div>
      <div class="protection-scenario-rack" aria-label="Modeled circuit paths">
        ${Object.entries(scenarios).map(([id, item]) => button(`<strong>${item.name}</strong><small>${item.physical}</small><b>${item.signal}</b>`, 'select-protection-scenario', id, { pressed: scenario === id, disabled: faultActive || (!observed.includes('normal') && id !== 'normal'), className: 'protection-scenario-card' })).join('')}
      </div>
      <div class="protection-signal-board">
        <section class="current-comparator" aria-label="Current leaving and returning">
          <header><span>Read the path</span><strong>${scenarios[scenario]?.name}</strong></header>
          <div class="current-lane live-lane"><span>Live current out</span><div aria-hidden="true">${markers(live, 'live')}</div><strong>${live}</strong></div>
          <div class="modeled-load-path" aria-hidden="true"><span>intended load</span><i></i><b data-active="${scenario === 'short' && hasRun}">bypass</b><em data-active="${scenario === 'leakage' && hasRun}">leak</em></div>
          <div class="current-lane neutral-lane"><span>Neutral current back</span><div aria-hidden="true">${markers(neutral, 'neutral')}</div><strong>${neutral}</strong></div>
          <p>${hasRun ? `${live} leave on live. ${neutral} return on neutral.` : 'Run the selected path to release the current markers.'}</p>
        </section>
        <div class="protection-watchers">
          <section class="protection-watcher breaker-watcher" data-open="${trip === 'breaker'}">
            <header><span aria-hidden="true">Ⅰ</span><div><strong>Breaker watches amount</strong><small>Opens above the model limit of 5</small></div></header>
            <div class="amount-gauge" style="--amount:${Math.min(100, amount / 9 * 100)}%"><i></i><b aria-label="Model breaker limit 5"></b></div>
            <p><span>Current amount</span><strong>${amount} ${amount > 5 ? '> 5' : '≤ 5'}</strong></p>
            <em>${breakerStatus}</em>
          </section>
          <section class="protection-watcher gfci-watcher" data-open="${trip === 'gfci'}">
            <header><span aria-hidden="true">Ⅱ</span><div><strong>GFCI/RCD watches the difference</strong><small>Opens when current is missing from neutral</small></div></header>
            <div class="balance-equation" aria-label="${live} out − ${neutral} back = ${imbalance} missing"><span>${live} out</span><b>−</b><span>${neutral} back</span><b>=</b><strong>${imbalance} missing</strong></div>
            <p><span>Return difference</span><strong>${imbalance}</strong></p>
            <em>${gfciStatus}</em>
          </section>
        </div>
      </div>
      <div class="protection-observation-ledger" aria-label="Protection observations">
        ${Object.entries(scenarios).map(([id, item]) => {
          const result = id === 'normal' ? '3 = 3 · no trip' : id === 'overload' ? '6 > 5 · breaker' : id === 'short' ? '9 > 5 · breaker' : '3 − 1 = 2 · GFCI/RCD';
          return `<section data-observed="${observed.includes(id)}" data-cleared="${cleared.includes(id)}"><span>${observed.includes(id) ? '✓' : '○'}</span><div><strong>${item.name}</strong><small>${observed.includes(id) ? result : 'Not run yet'}</small></div><b>${id === 'normal' ? observed.includes(id) ? 'reference recorded' : 'run first' : cleared.includes(id) ? 'cause removed' : observed.includes(id) ? 'fault still active' : 'waiting'}</b></section>`;
        }).join('')}
      </div>
      <div class="protection-action-row">
        ${button(scenarios[scenario]?.run ?? 'Run selected path', 'run-protection-test', '', { className: 'station-lever', disabled: faultActive })}
        ${button('Remove modeled cause and reset protection', 'clear-model-fault', '', { disabled: !faultActive })}
      </div>
    </div>`;
  }
  const chain = (values.chain as string[]) ?? [];
  const selected = String(values.selectedPiece ?? '');
  const homeLoads = (values.homeLoads as number[]) ?? [1, 1, 1];
  const total = Number(values.total ?? homeLoads.reduce((sum, item) => sum + item, 0));
  const capacity = Number(values.capacity ?? 9);
  const margin = Number(values.margin ?? capacity - total);
  const baselineSeen = Boolean(values.baselineSeen);
  const overloadSeen = Boolean(values.overloadSeen);
  const feederTripped = Boolean(values.feederTripped);
  const chainReady = chain.join('|') === 'substation|feeder|transformer|service';
  const pieces: Record<string, { name: string; job: string; icon: string }> = {
    substation: { name: 'Substation', job: 'Receives transmission and lowers to distribution', icon: '↓' },
    feeder: { name: 'Distribution feeder', job: 'Moves power through the neighborhood', icon: '→' },
    transformer: { name: 'Local transformer', job: 'Lowers voltage near homes', icon: '⇣' },
    service: { name: 'Home service', job: 'Connects one building', icon: '⌂' },
  };
  const socketJobs = [
    ['Stage 1', 'Receives transmission'],
    ['Stage 2', 'Across the neighborhood'],
    ['Stage 3', 'Near the homes'],
    ['Stage 4', 'Into each building'],
  ];
  const homes = [
    { id: 'heater', name: 'Cliff house', base: 'Porch lights', appliance: 'Water heater', extra: 3, active: Boolean(values.heater) },
    { id: 'ovens', name: 'Market house', base: 'Cooler lights', appliance: 'Market ovens', extra: 3, active: Boolean(values.ovens) },
    { id: 'charger', name: 'Dock house', base: 'Harbor light', appliance: 'Boat charger', extra: 4, active: Boolean(values.charger) },
  ];
  const loadBars = (count: number) => `<span class="home-load-bars" aria-hidden="true">${Array.from({ length: 5 }, (_, index) => `<i data-on="${index < count}"></i>`).join('')}</span>`;
  const sendLabel = !chainReady ? 'Test distribution chain' : !baselineSeen ? 'Send the starting three-home demand' : feederTripped ? 'Reset and resend adjusted demand' : 'Send combined neighborhood demand';
  return `<div class="challenge-apparatus neighborhood-feeder-bench" data-overload="${total > capacity}" data-tripped="${feederTripped}" data-chain-ready="${chainReady}">
    <div class="harbor-concept-guide"><span>Branch demands add on the feeder</span><p>Each home asks for its own current. The shared feeder carries <strong>home 1 + home 2 + home 3</strong> against one fixed capacity.</p></div>
    <div class="distribution-rebuild">
      <section class="handoff-workbench">
        <header><span>1. Build the handoff path</span><strong>Transmission side → homes</strong></header>
        <div class="distribution-handoff-chain">
          ${chain.map((piece, index) => `<button class="distribution-handoff ${piece ? 'is-filled' : 'is-empty'}" type="button" data-station-action="place-grid-piece" data-station-value="${index}" data-drop-action="drop-grid-piece" data-drop-secondary="${index}"${baselineSeen ? ' disabled' : ''}><span>${socketJobs[index][0]}</span><small>${socketJobs[index][1]}</small><strong>${piece ? `${pieces[piece]?.icon ?? ''} ${pieces[piece]?.name ?? piece}` : 'Place a handoff'}</strong></button>`).join('')}
        </div>
        <div class="distribution-piece-shelf" aria-label="Distribution handoff pieces">
          ${Object.entries(pieces).map(([id, piece]) => baselineSeen
            ? button(`<span>${piece.icon}</span><strong>${piece.name}</strong><small>${piece.job}</small>`, 'select-grid-piece', id, { pressed: selected === id, disabled: true, className: 'distribution-piece' })
            : draggablePiece(`<span>${piece.icon}</span><strong>${piece.name}</strong><small>${piece.job}</small>`, 'select-grid-piece', id, selected === id, 'distribution-piece')).join('')}
        </div>
      </section>
      <section class="home-demand-workbench">
        <header><span>2. Change home demand</span><strong>${baselineSeen ? 'Appliance controls unlocked' : 'Test the path to unlock appliances'}</strong></header>
        <div class="home-demand-grid">
          ${homes.map((home, index) => {
            const load = homeLoads[index] ?? 1;
            return `<article class="home-demand-card" data-active="${home.active}">
              <header><span>${index + 1}</span><div><strong>${home.name}</strong><small>Base: ${home.base} = 1</small></div></header>
              ${loadBars(load)}
              <p><span>Branch demand</span><strong>1 ${home.active ? `+ ${home.extra}` : '+ 0'} = ${load}</strong></p>
              ${button(`${home.active ? 'Switch off' : 'Turn on'} ${home.appliance}${home.active ? '' : ` (+${home.extra})`}`, 'toggle-home-appliance', home.id, { pressed: home.active, disabled: !baselineSeen })}
            </article>`;
          }).join('')}
        </div>
      </section>
    </div>
    <div class="shared-feeder-panel">
      <div class="branch-sum">
        <span>Three service branches merge</span>
        <strong>${homeLoads.join(' + ')} = ${total} combined demand</strong>
        <div aria-hidden="true">${homeLoads.map((load, index) => `<i style="--branch:${load / capacity * 100}%" data-branch="${index + 1}"></i>`).join('')}</div>
      </div>
      <div class="fixed-feeder-capacity">
        <span>Fixed feeder capacity: ${capacity}</span>
        <div class="feeder-capacity-track" style="--demand:${Math.min(100, total / capacity * 100)}%"><i></i><b></b></div>
        <strong>${total > capacity ? `${total - capacity} over capacity` : `${margin} margin remaining`}</strong>
        <small>${feederTripped ? 'TRIPPED · reduce demand before reset' : state.solved ? 'FLOWING · shared margin restored' : overloadSeen ? 'Overload recorded · restore at least 2 margin' : baselineSeen ? 'FLOWING · create one combined overload next' : 'Waiting for the tested handoff path'}</small>
      </div>
      ${button(sendLabel, 'send-feeder', '', { className: 'station-lever' })}
    </div>
  </div>`;
}

export function renderStationChallenge(state: StationChallengeState): string {
  switch (state.district) {
    case 'workshop': return renderWorkshop(state);
    case 'converter': return renderConverter(state);
    case 'wind': return renderWind(state);
    case 'longline': return renderLongline(state);
    case 'lantern': return renderLantern(state);
    case 'harbor': return renderHarbor(state);
  }
}
