import type { StationChallengeState } from './engine';

const labels: Record<string, string> = {
  source: 'Cell source',
  switch: 'Knife switch',
  resistor: 'Resistance coil',
  lamp: 'Cove lamp',
  return: 'Return lead',
  adjust: 'Adjuster',
  rectify: 'Rectifier',
  'rectifier-reversed': 'Reversed rectifier',
  smooth: 'Smoother',
  regulate: 'Regulator',
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
    return `
      <div class="challenge-apparatus workshop-tuning" data-heat="${heat > 2 ? 'hot' : 'calm'}">
        <div class="tuning-bench">
          <section class="physical-rack" aria-label="Cell stack">
            <span class="rack-label">Source rack</span>
            <div class="cell-stack" data-count="${cells}"><i></i><i></i></div>
            <div class="piece-choice-row">
              ${button('One cell', 'set-cells', 1, { pressed: cells === 1 })}
              ${button('Two cells', 'set-cells', 2, { pressed: cells === 2 })}
            </div>
          </section>
          <section class="physical-rack" aria-label="Resistance coil rack">
            <span class="rack-label">Coil drawer</span>
            <div class="coil-spool coil-${coil}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <div class="piece-choice-row">
              ${button('Low coil', 'set-coil', 'low', { pressed: coil === 'low' })}
              ${button('Medium coil', 'set-coil', 'medium', { pressed: coil === 'medium' })}
              ${button('High coil', 'set-coil', 'high', { pressed: coil === 'high' })}
            </div>
          </section>
          <section class="pulse-window" aria-label="Current trace">
            <span class="rack-label">Loop window</span>
            <div class="current-race" style="--current-level:${Math.min(1, current)}"><span></span><span></span><span></span><span></span></div>
            <strong>${current ? `${current.toFixed(2)} current trace` : 'Waiting for a pulse'}</strong>
            ${button('Pull the pulse lever', 'pulse-loop', '', { className: 'station-lever' })}
          </section>
        </div>
        <div class="observation-board" aria-label="Pinned comparison traces">
          <span class="observation-card" data-pinned="${observations.includes('baseline')}">Baseline<br><small>one cell, medium coil</small></span>
          <span class="observation-card" data-pinned="${observations.includes('push')}">More push<br><small>two cells, same coil</small></span>
          <span class="observation-card" data-pinned="${observations.includes('resistance')}">More resistance<br><small>same source, high coil</small></span>
        </div>
      </div>`;
  }
  const rubs = Number(values.rubs ?? 0);
  const sparked = Boolean(values.sparked);
  return `
    <div class="challenge-apparatus static-vane ${sparked ? 'is-sparking' : ''}">
      <div class="static-object wool-pad" draggable="true" data-drag-action="rub-vane" data-drag-value="wool" aria-hidden="true">wool pad</div>
      <div class="static-field" data-drop-action="rub-vane" data-drop-secondary="vane">
        <div class="storm-vane" aria-hidden="true"><span></span><i></i></div>
        <div class="static-gap"><b></b><em>air gap</em></div>
        <div class="charge-cloud negative">${Array.from({ length: 4 }, (_, index) => `<i data-on="${index < rubs}">−</i>`).join('')}</div>
        <div class="charge-cloud positive">${Array.from({ length: 4 }, (_, index) => `<i data-on="${index < rubs}">+</i>`).join('')}</div>
      </div>
      ${progressDots(rubs, 4, 'Charge buildup')}
      <div class="station-action-row">
        ${button('Rub wool across vane', 'rub-vane', '', { className: 'station-lever' })}
        ${button('Return vane to balance', 'reset-vane', '', { disabled: !sparked })}
      </div>
      <p class="station-touch-hint">Drag the wool pad over the vane, or use the physical-action button.</p>
    </div>`;
}

function waveformPath(wave: string) {
  if (wave === 'steady-dc') return 'M18 55 H382';
  if (wave === 'unregulated') return 'M18 70 C70 24 110 72 164 55 S270 36 382 55';
  if (wave === 'pulsing-dc') return 'M18 78 C42 20 70 20 94 78 S146 20 170 78 S222 20 246 78 S298 20 322 78 S366 28 382 78';
  if (wave === 'blocked-reversal') return 'M18 55 H150 M250 55 H382';
  return 'M18 55 C44 10 70 10 96 55 S148 100 174 55 S226 10 252 55 S304 100 330 55 S370 20 382 55';
}

function renderConverter(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const modules = (values.modules as string[]) ?? [];
    const selected = String(values.selectedModule ?? '');
    const wave = String(values.wave ?? 'reversing');
    return `
      <div class="challenge-apparatus converter-line" data-wave="${escapeHtml(wave)}">
        <svg class="converter-wave" viewBox="0 0 400 110" role="img" aria-label="Output waveform: ${escapeHtml(wave.replaceAll('-', ' '))}"><line x1="12" y1="55" x2="388" y2="55"></line><path d="${waveformPath(wave)}"></path></svg>
        <div class="module-conveyor" aria-label="Four conversion sockets">
          ${modules.map((module, index) => `<div class="module-socket-wrap">${dropSlot(index, module, 'place-module', 'drop-module', { className: `module-slot module-slot-${index + 1}` })}${module.includes('rectifier') || module === 'rectify' ? button('Rotate', 'rotate-module', index, { className: 'rotate-piece' }) : ''}</div>`).join('')}
        </div>
        <div class="station-tray" aria-label="Conversion modules">
          ${['adjust', 'rectify', 'smooth', 'regulate'].map((module) => draggablePiece(labels[module], 'select-module', module, selected === module, `module-piece module-${module}`)).join('')}
        </div>
        ${button('Send a test wave', 'run-wave', '', { className: 'station-lever' })}
      </div>`;
  }
  if (state.phaseIndex === 1) {
    const adapter = String(values.adapter ?? '');
    const cards = [
      ['9v-2a', '9 V DC · 2 A', 'barrel · center +'],
      ['5v-0.5a', '5 V DC · 0.5 A', 'barrel · center +'],
      ['5v-2a-negative', '5 V DC · 2 A', 'barrel · center −'],
      ['5v-2a', '5 V DC · 2 A', 'barrel · center +'],
    ];
    return `
      <div class="challenge-apparatus adapter-bench">
        <section class="device-placard"><span>Dock radio input</span><strong>5 V DC · 1 A</strong><small>barrel connector · center positive</small></section>
        <div class="adapter-card-grid" aria-label="Adapter output modules">
          ${cards.map(([id, line, detail]) => button(`<span>OUTPUT</span><strong>${line}</strong><small>${detail}</small>`, 'choose-adapter', id, { className: 'adapter-card', pressed: adapter === id })).join('')}
        </div>
        <div class="protected-gate" data-open="${Boolean(values.testedGood)}"><span>protected coupling gate</span><i></i></div>
        ${button('Couple selected output', 'test-adapter', '', { className: 'station-lever' })}
      </div>`;
  }
  const cable = String(values.cable ?? '');
  return `
    <div class="challenge-apparatus negotiation-bench" data-negotiated="${Boolean(values.negotiated)}">
      <section class="negotiation-endpoint"><span>Charger offers</span><strong>5 V basic</strong><strong>9 V negotiated</strong></section>
      <div class="cable-choice-row">
        ${button('<strong>Simple USB-C cable</strong><small>basic power path</small>', 'choose-cable', 'charge-only', { className: 'cable-card', pressed: cable === 'charge-only' })}
        ${button('<strong>Rated USB-C cable</strong><small>supports shared mode</small>', 'choose-cable', 'pd-rated', { className: 'cable-card', pressed: cable === 'pd-rated' })}
      </div>
      <div class="negotiation-link"><span>charger</span><i></i><b>${values.negotiated ? '9 V agreed' : '5 V default'}</b><i></i><span>radio</span></div>
      ${button('Ask endpoints to negotiate', 'negotiate', '', { className: 'station-lever' })}
    </div>`;
}

function crankButtons() {
  return `<div class="crank-actions">${button('Pull crank left', 'crank', 'left', { className: 'crank-left' })}${button('Pull crank right', 'crank', 'right', { className: 'crank-right' })}</div>`;
}

function generatorRig(values: Record<string, unknown>, options: { connected?: boolean; strain?: string } = {}) {
  const strokes = Number(values.strokes ?? values.steadyStrokes ?? 0);
  return `<div class="generator-rig" data-strokes="${strokes}" data-connected="${String(options.connected ?? false)}" data-strain="${options.strain ?? 'light'}">
    <div class="hand-crank" aria-hidden="true"><span></span><i></i></div>
    <div class="moving-magnet" aria-hidden="true"><b>N</b><b>S</b></div>
    <div class="generator-coil" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="terminal-lamp" aria-hidden="true"><span></span><b>${options.connected ? 'lamp path closed' : 'terminals open'}</b></div>
  </div>`;
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
    return `<div class="challenge-apparatus wind-bench">
      ${generatorRig(values, { connected })}
      <div class="meter-pair"><span data-on="${Boolean(values.openVoltageSeen)}"><small>Terminal voltage</small><strong>${values.openVoltageSeen ? 'observed' : 'waiting'}</strong></span><span data-on="${Boolean(values.currentSeen)}"><small>Lamp current</small><strong>${values.currentSeen ? 'observed' : 'waiting'}</strong></span></div>
      <div class="station-action-row">${button(connected ? 'Open lamp loop' : 'Connect lamp loop', 'connect-loop', '', { pressed: connected })}${crankButtons()}</div>
    </div>`;
  }
  const load = String(values.load ?? 'heavy');
  const strain = load === 'heavy' ? 'heavy' : load === 'balanced' ? 'balanced' : 'light';
  return `<div class="challenge-apparatus wind-bench">
    ${generatorRig(values, { connected: true, strain })}
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

const energyCardCopy: Record<string, string> = {
  '1000w-1h': '<strong>1000 W</strong><small>for 1 hour</small>',
  '100w-10h': '<strong>100 W</strong><small>for 10 hours</small>',
  '500w-1h': '<strong>500 W</strong><small>for 1 hour</small>',
  '50w-4h': '<strong>50 W</strong><small>for 4 hours</small>',
};

function renderLantern(state: StationChallengeState) {
  const values = state.values;
  if (state.phaseIndex === 0) {
    const selected = String(values.selectedCard ?? '');
    return `<div class="challenge-apparatus energy-scale">
      <div class="energy-card-tray">${Object.entries(energyCardCopy).map(([id, copy]) => draggablePiece(copy, 'select-energy-card', id, selected === id, 'energy-card')).join('')}</div>
      <div class="balance-beam" data-balanced="${state.solved}"><i></i><span></span></div>
      <div class="scale-pans">
        <button type="button" class="scale-pan" data-station-action="place-energy-side" data-station-value="leftCard" data-drop-action="place-energy-card" data-drop-secondary="leftCard"><small>Left evening</small><strong>${values.leftCard ? energyCardCopy[String(values.leftCard)] : 'Place card'}</strong></button>
        <button type="button" class="scale-pan" data-station-action="place-energy-side" data-station-value="rightCard" data-drop-action="place-energy-card" data-drop-secondary="rightCard"><small>Right evening</small><strong>${values.rightCard ? energyCardCopy[String(values.rightCard)] : 'Place card'}</strong></button>
      </div>
      <p class="station-touch-hint">Drag cards to the pans, or select a card and choose a pan.</p>
    </div>`;
  }
  if (state.phaseIndex === 1) {
    const schedule = (values.schedule as Record<string, string>) ?? {};
    const selected = String(values.selectedPlan ?? 'mixed');
    const plans = {
      efficient: '<strong>Efficient strings</strong><small>brightness 2 · energy 2</small>',
      mixed: '<strong>Warm sign + strings</strong><small>brightness 4 · energy 4</small>',
      warm: '<strong>Filament feature</strong><small>brightness 3 · energy 5</small>',
      dim: '<strong>Guide string</strong><small>brightness 1 · energy 1</small>',
    };
    return `<div class="challenge-apparatus market-scheduler" data-energy="${Number(values.energy ?? 0)}">
      <div class="market-plan-tray">${Object.entries(plans).map(([id, copy]) => draggablePiece(copy, 'select-market-plan', id, selected === id, 'market-plan-card')).join('')}</div>
      <div class="market-timeline">
        ${[['dusk', 'Dusk', 'need 2'], ['peak', 'Peak market', 'need 4'], ['closing', 'Closing', 'need 2']].map(([id, name, need]) => `<button type="button" class="market-period" data-station-action="place-market-period" data-station-value="${id}" data-drop-action="set-market-plan" data-drop-secondary="${id}"><span>${name}<small> · ${need}</small></span><strong>${plans[schedule[id] as keyof typeof plans]}</strong></button>`).join('')}
      </div>
      <div class="budget-ribbon"><span style="--energy:${Math.min(100, Number(values.energy ?? 0) * 10)}%"></span><strong>${Number(values.energy ?? 0)} / 10 energy tokens</strong></div>
      <p class="station-touch-hint">Use at least one warm feature. Efficient lamps help, but the market still needs character and peak brightness.</p>
    </div>`;
  }
  const period = Number(values.period ?? 0);
  return `<div class="challenge-apparatus evening-replay" data-period="${period}">
    <div class="market-silhouette" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="instant-power-stack"><small>Instant power now</small><span style="--power:${Number(values.power ?? 0) * 20}%"></span><strong>${Number(values.power ?? 0)} W model rate</strong></div>
    <div class="energy-ribbon"><small>Energy accumulated</small><span style="--energy:${Number(values.energy ?? 0) * 10}%"></span><strong>${Number(values.energy ?? 0)} Wh · ${(Number(values.energy ?? 0) / 1000).toFixed(3)} kWh</strong></div>
    <div class="timeline-stops"><span data-done="${period >= 1}">Dusk</span><span data-done="${period >= 2}">Peak</span><span data-done="${period >= 3}">Closing</span></div>
    ${button(period >= 3 ? 'Evening complete' : `Run ${['dusk', 'peak market', 'closing'][period]}`, 'advance-period', '', { className: 'station-lever', disabled: period >= 3 })}
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
    const fault = String(values.fault ?? 'overload');
    return `<div class="challenge-apparatus protection-board" data-damaged="${Boolean(values.damaged)}">
      <div class="watcher-bays"><section data-installed="${Boolean(values.breaker)}"><span>Amount watcher</span>${button(values.breaker ? 'Breaker installed' : 'Install breaker', 'install-protection', 'breaker', { pressed: Boolean(values.breaker) })}</section><section data-installed="${Boolean(values.gfci)}"><span>Balance watcher</span>${button(values.gfci ? 'GFCI/RCD installed' : 'Install GFCI/RCD', 'install-protection', 'gfci', { pressed: Boolean(values.gfci) })}</section></div>
      <div class="fault-cartridges">${button('Overload cartridge', 'select-fault', 'overload', { pressed: fault === 'overload' })}${button('Short-path cartridge', 'select-fault', 'short', { pressed: fault === 'short' })}${button('Leakage cartridge', 'select-fault', 'leakage', { pressed: fault === 'leakage' })}</div>
      <div class="fault-path" data-fault="${escapeHtml(fault)}" aria-hidden="true"><span>live out</span><i></i><b>neutral return</b><em>leak path</em></div>
      <div class="station-action-row">${button('Inject selected model fault', 'inject-fault', '', { className: 'station-lever' })}${button('Replace damaged model cable', 'repair-cable', '', { disabled: !values.damaged })}</div>
      <div class="observed-faults"><span data-done="${observed.includes('overload')}">overload</span><span data-done="${observed.includes('short')}">short</span><span data-done="${observed.includes('leakage')}">leakage</span><span data-done="${Boolean(values.repaired)}">repair</span></div>
    </div>`;
  }
  const chain = (values.chain as string[]) ?? [];
  const selected = String(values.selectedPiece ?? '');
  const homes = (values.homes as number[]) ?? [1, 1, 1];
  const total = Number(values.total ?? homes.reduce((sum, item) => sum + item, 0));
  const capacity = Number(values.capacity ?? 3);
  return `<div class="challenge-apparatus feeder-board" data-overload="${total > capacity}">
    <div class="distribution-chain">${chain.map((piece, index) => dropSlot(index, piece, 'place-grid-piece', 'drop-grid-piece', { className: 'grid-chain-slot' })).join('')}</div>
    <div class="station-tray">${['substation', 'feeder', 'transformer', 'service'].map((piece) => draggablePiece(labels[piece], 'select-grid-piece', piece, selected === piece, 'grid-piece')).join('')}</div>
    <div class="home-branches">${homes.map((load, index) => `<section><span>Home ${index + 1}</span><strong>${load} load</strong><div>${button('Remove appliance', 'change-home', -1, { secondary: index, disabled: load <= 0 })}${button('Add appliance', 'change-home', 1, { secondary: index, disabled: load >= 3 })}</div></section>`).join('')}</div>
    <div class="feeder-capacity"><span>Shared feeder</span>${button('3 load capacity', 'set-capacity', 3, { pressed: capacity === 3 })}${button('5 load capacity', 'set-capacity', 5, { pressed: capacity === 5 })}<strong>${total} combined / ${capacity} capacity</strong></div>
    ${button('Send combined feeder demand', 'send-feeder', '', { className: 'station-lever' })}
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
