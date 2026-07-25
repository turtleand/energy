import Phaser from 'phaser';
import {
  missionById,
  type MissionDefinition,
  type MissionId,
  type VisualKind,
} from '../content/campaign';
import type { CircuitRidersRendererOptions } from '../bootstrap';
import type { CampaignState, MissionReadout } from '../core/model';

const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 600;
const TRACK = {
  left: 144,
  right: 816,
  top: 112,
  bottom: 478,
};
const TRACK_WIDTH = TRACK.right - TRACK.left;
const TRACK_HEIGHT = TRACK.bottom - TRACK.top;
const TRACK_LENGTH = TRACK_WIDTH * 2 + TRACK_HEIGHT * 2;
const SERVICE_PROGRESS = 0.075;

const COLORS = {
  paper: 0xfffaf0,
  paperDeep: 0xf1eadb,
  green: 0x146c53,
  greenDark: 0x0d4637,
  mint: 0x8dd4bd,
  sky: 0x80cfe0,
  amber: 0xf3a531,
  ink: 0x17211d,
  muted: 0x66726d,
  line: 0xb7c2b9,
  danger: 0xd66c52,
  heat: 0xeb8054,
  white: 0xffffff,
};

interface Point {
  x: number;
  y: number;
}

function wrapProgress(value: number) {
  return ((value % 1) + 1) % 1;
}

function shortestProgressDelta(from: number, to: number) {
  const forward = wrapProgress(to - from);
  return forward > 0.5 ? forward - 1 : forward;
}

function pointOnTrack(progress: number): Point {
  let distance = wrapProgress(progress) * TRACK_LENGTH;
  if (distance <= TRACK_HEIGHT) {
    return { x: TRACK.left, y: TRACK.bottom - distance };
  }
  distance -= TRACK_HEIGHT;
  if (distance <= TRACK_WIDTH) {
    return { x: TRACK.left + distance, y: TRACK.top };
  }
  distance -= TRACK_WIDTH;
  if (distance <= TRACK_HEIGHT) {
    return { x: TRACK.right, y: TRACK.top + distance };
  }
  distance -= TRACK_HEIGHT;
  return { x: TRACK.right - distance, y: TRACK.bottom };
}

function nearestTrackProgress(point: Point) {
  const candidates: Array<{ distance: number; progress: number }> = [];

  const leftY = Phaser.Math.Clamp(point.y, TRACK.top, TRACK.bottom);
  candidates.push({
    distance: Math.hypot(point.x - TRACK.left, point.y - leftY),
    progress: (TRACK.bottom - leftY) / TRACK_LENGTH,
  });

  const topX = Phaser.Math.Clamp(point.x, TRACK.left, TRACK.right);
  candidates.push({
    distance: Math.hypot(point.x - topX, point.y - TRACK.top),
    progress: (TRACK_HEIGHT + topX - TRACK.left) / TRACK_LENGTH,
  });

  const rightY = Phaser.Math.Clamp(point.y, TRACK.top, TRACK.bottom);
  candidates.push({
    distance: Math.hypot(point.x - TRACK.right, point.y - rightY),
    progress: (TRACK_HEIGHT + TRACK_WIDTH + rightY - TRACK.top) / TRACK_LENGTH,
  });

  const bottomX = Phaser.Math.Clamp(point.x, TRACK.left, TRACK.right);
  candidates.push({
    distance: Math.hypot(point.x - bottomX, point.y - TRACK.bottom),
    progress:
      (TRACK_HEIGHT + TRACK_WIDTH + TRACK_HEIGHT + TRACK.right - bottomX) / TRACK_LENGTH,
  });

  return candidates.sort((a, b) => a.distance - b.distance)[0].progress;
}

export class LoopScene extends Phaser.Scene {
  private readonly options: CircuitRidersRendererOptions;
  private state: CampaignState;
  private mission: MissionDefinition;
  private readout: MissionReadout;
  private flowLensActive = false;
  private baseGraphics!: Phaser.GameObjects.Graphics;
  private systemGraphics!: Phaser.GameObjects.Graphics;
  private flowGraphics!: Phaser.GameObjects.Graphics;
  private effectGraphics!: Phaser.GameObjects.Graphics;
  private drone!: Phaser.GameObjects.Container;
  private droneProgress = 0.018;
  private droneTarget: number | null = null;
  private serviceAvailable = false;
  private mount?: HTMLElement;
  private pressedKeys = new Set<string>();
  private labels: Phaser.GameObjects.Text[] = [];
  private completionPulseStarted = -1;
  private lastObjectiveMet = false;
  private lastTime = 0;
  private externalPaused = false;
  private frameSamples: number[] = [];

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    const bindings = this.state.settings.bindings;
    if (
      event.code === bindings.left ||
      event.code === bindings.right ||
      event.code === bindings.up ||
      event.code === bindings.down
    ) {
      event.preventDefault();
      this.droneTarget = null;
      this.pressedKeys.add(event.code);
    }
    if (event.code === bindings.action && !event.repeat) {
      event.preventDefault();
      this.options.onPrimaryAction();
    }
  };

  private readonly handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys.delete(event.code);
  };

  private readonly clearKeys = () => {
    this.pressedKeys.clear();
  };

  constructor(options: CircuitRidersRendererOptions) {
    super({ key: 'circuit-riders-loop' });
    this.options = options;
    this.state = options.initialState;
    this.mission = missionById[this.state.activeMission];
    this.readout = options.initialReadout;
  }

  create() {
    this.baseGraphics = this.add.graphics();
    this.systemGraphics = this.add.graphics();
    this.flowGraphics = this.add.graphics();
    this.effectGraphics = this.add.graphics();
    this.drawBase();
    this.createDrone();
    this.configureInput();
    this.renderMission();
    this.applyDronePosition();
    this.updateServiceAvailability(true);

    if (this.state.settings.mode === 'planning') {
      this.droneTarget = SERVICE_PROGRESS;
    }
  }

  update(time: number, delta: number) {
    this.lastTime = time;
    if (!this.externalPaused) {
      if (delta > 0 && delta < 250) {
        this.frameSamples.push(delta);
        if (this.frameSamples.length >= 120) {
          const average =
            this.frameSamples.reduce((total, sample) => total + sample, 0) /
            this.frameSamples.length;
          this.options.onFrameSample?.({
            fps: Number((1_000 / average).toFixed(1)),
            worstFrameMs: Number(Math.max(...this.frameSamples).toFixed(1)),
          });
          this.frameSamples = [];
        }
      }
      this.updateDrone(delta);
      this.drawFlow(time);
      this.drawEffects(time);
    }
  }

  setModel(
    state: CampaignState,
    readout: MissionReadout,
    flowLensActive: boolean,
    missionChanged: boolean,
  ) {
    const previousMission = this.state.activeMission;
    this.state = state;
    this.readout = readout;
    this.flowLensActive = flowLensActive;
    this.mission = missionById[state.activeMission];

    if (!this.systemGraphics) return;

    if (missionChanged || previousMission !== state.activeMission) {
      this.droneProgress = state.settings.mode === 'planning' ? 0.88 : 0.018;
      this.droneTarget = SERVICE_PROGRESS;
      this.lastObjectiveMet = false;
      this.completionPulseStarted = -1;
      this.renderMission();
      this.applyDronePosition();
      this.updateServiceAvailability(true);
    } else {
      this.renderMission();
    }

    if (readout.objectiveMet && !this.lastObjectiveMet) {
      this.completionPulseStarted = this.lastTime;
    }
    this.lastObjectiveMet = readout.objectiveMet;

    if (state.settings.mode === 'planning' && !this.serviceAvailable) {
      this.droneTarget = SERVICE_PROGRESS;
    }
  }

  setExternalPaused(paused: boolean) {
    this.externalPaused = paused;
    this.clearKeys();
  }

  dockAtService() {
    this.droneTarget = SERVICE_PROGRESS;
  }

  private drawBase() {
    const g = this.baseGraphics;
    g.clear();
    g.fillStyle(COLORS.paper, 1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    g.lineStyle(1, COLORS.greenDark, 0.055);
    for (let x = 24; x < WORLD_WIDTH; x += 36) g.lineBetween(x, 0, x, WORLD_HEIGHT);
    for (let y = 22; y < WORLD_HEIGHT; y += 36) g.lineBetween(0, y, WORLD_WIDTH, y);

    g.fillStyle(COLORS.sky, 0.13);
    g.fillCircle(80, 70, 160);
    g.fillStyle(COLORS.amber, 0.09);
    g.fillCircle(890, 540, 210);

    g.fillStyle(COLORS.paperDeep, 0.84);
    g.fillRoundedRect(78, 50, 804, 500, 36);
    g.lineStyle(2, COLORS.greenDark, 0.12);
    g.strokeRoundedRect(78, 50, 804, 500, 36);
  }

  private createDrone() {
    const shadow = this.add.ellipse(0, 16, 54, 18, COLORS.ink, 0.16);
    const outer = this.add.polygon(
      0,
      0,
      [
        { x: 0, y: -24 },
        { x: 24, y: -8 },
        { x: 24, y: 10 },
        { x: 0, y: 24 },
        { x: -24, y: 10 },
        { x: -24, y: -8 },
      ],
      COLORS.sky,
      1,
    );
    outer.setStrokeStyle(4, COLORS.greenDark, 1);
    const core = this.add.circle(0, 0, 9, COLORS.paper, 1).setStrokeStyle(3, COLORS.green, 1);
    const antenna = this.add.line(0, 0, 0, -23, 0, -35, COLORS.greenDark, 1).setLineWidth(3);
    const beacon = this.add.circle(0, -37, 4, COLORS.amber, 1);
    const label = this.add
      .text(0, 34, 'PATROL', {
        color: '#0d4637',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        letterSpacing: 1.4,
        backgroundColor: '#fffaf0',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5);
    this.drone = this.add.container(0, 0, [shadow, antenna, outer, core, beacon, label]);
    this.drone.setDepth(30);
  }

  private configureInput() {
    const mount = this.game.canvas.parentElement;
    if (mount instanceof HTMLElement) {
      this.mount = mount;
      mount.addEventListener('keydown', this.handleKeyDown);
      mount.addEventListener('keyup', this.handleKeyUp);
      mount.addEventListener('blur', this.clearKeys);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeInputListeners, this);
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (mount instanceof HTMLElement) mount.focus({ preventScroll: true });
      this.droneTarget = nearestTrackProgress({ x: pointer.worldX, y: pointer.worldY });
    });
  }

  private removeInputListeners() {
    this.mount?.removeEventListener('keydown', this.handleKeyDown);
    this.mount?.removeEventListener('keyup', this.handleKeyUp);
    this.mount?.removeEventListener('blur', this.clearKeys);
    this.clearKeys();
    this.mount = undefined;
  }

  private updateDrone(delta: number) {
    if (!this.drone) return;
    const settings = this.state.settings;
    const speed = (settings.slowMotion ? 0.0001 : 0.00018) * delta;
    const bindings = settings.bindings;
    let direction = 0;

    if (this.pressedKeys.has(bindings.left) || this.pressedKeys.has(bindings.up)) direction -= 1;
    if (this.pressedKeys.has(bindings.right) || this.pressedKeys.has(bindings.down)) direction += 1;

    if (direction !== 0) {
      this.droneTarget = null;
      this.droneProgress = wrapProgress(this.droneProgress + direction * speed);
    } else if (this.droneTarget !== null) {
      const difference = shortestProgressDelta(this.droneProgress, this.droneTarget);
      const assistedSpeed =
        (settings.mode === 'planning' ? 0.00034 : settings.slowMotion ? 0.0001 : 0.0002) * delta;
      if (Math.abs(difference) <= assistedSpeed) {
        this.droneProgress = this.droneTarget;
        this.droneTarget = null;
      } else {
        this.droneProgress = wrapProgress(
          this.droneProgress + Math.sign(difference) * assistedSpeed,
        );
      }
    }

    this.applyDronePosition();
    this.updateServiceAvailability();
  }

  private applyDronePosition() {
    if (!this.drone) return;
    const point = pointOnTrack(this.droneProgress);
    const next = pointOnTrack(this.droneProgress + 0.004);
    const angle = Phaser.Math.RadToDeg(Math.atan2(next.y - point.y, next.x - point.x));
    this.drone.setPosition(point.x, point.y - 4);
    this.drone.setRotation(Phaser.Math.DegToRad(angle));
  }

  private updateServiceAvailability(force = false) {
    const next = Math.abs(shortestProgressDelta(this.droneProgress, SERVICE_PROGRESS)) <= 0.055;
    if (!force && next === this.serviceAvailable) return;
    this.serviceAvailable = next;
    this.options.onServiceChange(next);
  }

  private addLabel(
    x: number,
    y: number,
    text: string,
    options: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
  ) {
    const label = this.add
      .text(x, y, text, {
        color: '#17211d',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        align: 'center',
        ...options,
      })
      .setOrigin(0.5);
    this.labels.push(label);
    return label;
  }

  private clearLabels() {
    this.labels.forEach((label) => label.destroy());
    this.labels = [];
  }

  private renderMission() {
    const g = this.systemGraphics;
    if (!g) return;
    g.clear();
    this.clearLabels();

    this.drawTrack(g);
    this.drawSource(g);
    this.drawLoad(g);
    this.drawServiceNode(g);
    this.drawMissionSystem(g, this.mission.visualKind);
  }

  private drawTrack(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(20, COLORS.greenDark, 0.08);
    g.strokeRoundedRect(
      TRACK.left - 4,
      TRACK.top - 4,
      TRACK_WIDTH + 8,
      TRACK_HEIGHT + 8,
      28,
    );
    g.lineStyle(8, COLORS.greenDark, 0.74);
    g.strokeRoundedRect(TRACK.left, TRACK.top, TRACK_WIDTH, TRACK_HEIGHT, 24);
    g.lineStyle(2, COLORS.paper, 0.84);
    g.strokeRoundedRect(TRACK.left, TRACK.top, TRACK_WIDTH, TRACK_HEIGHT, 24);

    if (!this.readout.flow.loopClosed) {
      g.lineStyle(18, COLORS.paperDeep, 1);
      g.lineBetween(465, TRACK.bottom, 505, TRACK.bottom);
      g.lineStyle(4, COLORS.danger, 0.85);
      g.lineBetween(464, TRACK.bottom - 12, 486, TRACK.bottom - 30);
      g.lineBetween(506, TRACK.bottom - 12, 484, TRACK.bottom - 30);
    }
  }

  private drawSource(g: Phaser.GameObjects.Graphics) {
    const amplitude = this.readout.flow.fieldAmplitude;
    const sourceX = TRACK.left;
    const sourceY = 294;
    g.fillStyle(COLORS.paper, 1);
    g.fillCircle(sourceX, sourceY, 42);
    g.lineStyle(4, COLORS.greenDark, 0.9);
    g.strokeCircle(sourceX, sourceY, 42);
    g.lineStyle(3, this.mission.accent, 0.8);
    const fieldLines = 2 + Math.round(amplitude * 4);
    for (let index = 0; index < fieldLines; index += 1) {
      g.strokeCircle(sourceX, sourceY, 53 + index * 10);
    }
    g.fillStyle(this.mission.accent, 1);
    g.fillRoundedRect(sourceX - 17, sourceY - 22, 34, 44, 8);
    g.fillStyle(COLORS.paper, 1);
    g.fillRect(sourceX - 8, sourceY - 3, 16, 6);
    g.fillRect(sourceX - 3, sourceY - 8, 6, 16);
    this.addLabel(sourceX, sourceY + 70, 'SOURCE', {
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      fontSize: '11px',
      color: '#52625b',
    });
  }

  private drawLoad(g: Phaser.GameObjects.Graphics) {
    const power = this.readout.flow.power;
    const loadX = TRACK.right;
    const loadY = 294;
    g.fillStyle(this.mission.accent, 0.08 + power * 0.22);
    g.fillCircle(loadX, loadY, 64 + power * 18);
    g.fillStyle(COLORS.paper, 1);
    g.fillCircle(loadX, loadY, 42);
    g.lineStyle(4, COLORS.greenDark, 0.9);
    g.strokeCircle(loadX, loadY, 42);
    g.fillStyle(this.mission.accent, 0.24 + power * 0.76);
    g.fillCircle(loadX, loadY, 24 + power * 6);
    g.lineStyle(3, COLORS.greenDark, 0.7);
    g.lineBetween(loadX - 12, loadY + 28, loadX - 4, loadY + 40);
    g.lineBetween(loadX + 12, loadY + 28, loadX + 4, loadY + 40);
    this.addLabel(loadX, loadY + 70, 'LOAD', {
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      fontSize: '11px',
      color: '#52625b',
    });
  }

  private drawServiceNode(g: Phaser.GameObjects.Graphics) {
    const point = pointOnTrack(SERVICE_PROGRESS);
    const available = this.serviceAvailable || this.state.settings.mode === 'planning';
    g.fillStyle(available ? this.mission.accent : COLORS.paper, 1);
    g.fillCircle(point.x, point.y, 22);
    g.lineStyle(4, COLORS.greenDark, 0.9);
    g.strokeCircle(point.x, point.y, 22);
    g.fillStyle(available ? COLORS.greenDark : COLORS.muted, 1);
    g.fillCircle(point.x, point.y, 6);
    g.lineStyle(2, this.mission.accent, available ? 0.8 : 0.35);
    g.strokeCircle(point.x, point.y, 31);
    this.addLabel(point.x + 6, point.y - 42, available ? 'SERVICE READY' : 'SERVICE NODE', {
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      fontSize: '10px',
      color: available ? '#0d4637' : '#66726d',
      backgroundColor: '#fffaf0',
      padding: { x: 5, y: 3 },
    });
  }

  private drawMissionSystem(g: Phaser.GameObjects.Graphics, kind: VisualKind) {
    const center = { x: 480, y: 294 };

    if (kind === 'loop') {
      g.lineStyle(4, this.mission.accent, 0.65);
      g.lineBetween(330, center.y, 630, center.y);
      [360, 420, 480, 540, 600].forEach((x) => {
        g.fillStyle(COLORS.green, 0.12);
        g.fillCircle(x, center.y, 18);
        g.lineStyle(2, COLORS.green, 0.58);
        g.strokeCircle(x, center.y, 18);
      });
      this.addLabel(center.x, center.y - 46, 'CHARGE CIRCULATES • ENERGY TRANSFERS', {
        fontSize: '13px',
        color: '#146c53',
      });
    }

    if (kind === 'static') {
      const charge = this.readout.metrics.staticCharge / 100;
      g.fillStyle(COLORS.sky, 0.18);
      g.fillCircle(center.x - 90, center.y, 72);
      g.fillStyle(this.mission.accent, 0.18);
      g.fillCircle(center.x + 90, center.y, 72);
      const marks = 3 + Math.round(charge * 10);
      for (let index = 0; index < marks; index += 1) {
        const y = center.y - 45 + ((index * 19) % 92);
        g.fillStyle(COLORS.green, 0.9);
        g.fillCircle(center.x - 105 + (index % 3) * 15, y, 4);
        g.fillStyle(this.mission.accent, 1);
        g.fillCircle(center.x + 75 + (index % 3) * 15, y, 4);
      }
      g.lineStyle(3, COLORS.danger, this.readout.flags.staticDischarge ? 0.95 : 0.2);
      g.lineBetween(center.x - 20, center.y, center.x + 20, center.y);
      this.addLabel(center.x, center.y + 96, 'SEPARATED CHARGE', { color: '#52625b' });
    }

    if (kind === 'junction') {
      g.lineStyle(7, COLORS.greenDark, 0.56);
      g.lineBetween(320, center.y, 480, center.y);
      g.lineBetween(480, center.y, 650, center.y - 82);
      g.lineBetween(480, center.y, 650, center.y);
      g.lineBetween(480, center.y, 650, center.y + 82);
      g.fillStyle(this.mission.accent, 1);
      g.fillCircle(480, center.y, 18);
      this.addLabel(665, center.y - 82, 'DEAD END', { fontSize: '12px' });
      this.addLabel(665, center.y, 'LOAD', { fontSize: '12px', color: '#146c53' });
      this.addLabel(665, center.y + 82, 'FAULT', { fontSize: '12px', color: '#b44d3a' });
    }

    if (kind === 'resistance') {
      const resistance = this.readout.metrics.resistance ?? 8;
      const constriction = Phaser.Math.Clamp(resistance / 16, 0.15, 1);
      g.lineStyle(18, COLORS.greenDark, 0.16);
      g.lineBetween(320, center.y, 640, center.y);
      g.lineStyle(6 + constriction * 14, COLORS.greenDark, 0.75);
      g.lineBetween(420, center.y, 540, center.y);
      g.fillStyle(COLORS.heat, this.readout.flow.heat * 0.42);
      g.fillCircle(center.x, center.y, 78);
      this.addLabel(center.x, center.y + 86, 'OPPOSITION • HEAT', { color: '#8f4b34' });
    }

    if (kind === 'converter') {
      const stages = [
        ['AC', true],
        ['RECTIFY', this.readout.flags.rectifierOn],
        ['SMOOTH', this.readout.flags.smoothingOn],
        ['REGULATE', this.readout.flags.regulatorOn],
      ] as const;
      stages.forEach(([label, active], index) => {
        const x = 330 + index * 100;
        g.fillStyle(active ? this.mission.accent : COLORS.paper, active ? 0.82 : 1);
        g.fillRoundedRect(x - 42, center.y - 36, 84, 72, 12);
        g.lineStyle(3, COLORS.greenDark, active ? 0.78 : 0.28);
        g.strokeRoundedRect(x - 42, center.y - 36, 84, 72, 12);
        this.addLabel(x, center.y, label, {
          fontSize: '10px',
          color: active ? '#0d4637' : '#66726d',
        });
      });
    }

    if (kind === 'adapter') {
      const safe = this.readout.flags.safeToDock;
      g.fillStyle(COLORS.paper, 1);
      g.fillRoundedRect(center.x - 150, center.y - 62, 118, 124, 18);
      g.lineStyle(4, safe ? COLORS.green : COLORS.danger, 0.8);
      g.strokeRoundedRect(center.x - 150, center.y - 62, 118, 124, 18);
      g.fillStyle(safe ? this.mission.accent : COLORS.danger, safe ? 0.8 : 0.28);
      g.fillRoundedRect(center.x + 30, center.y - 40, 118, 80, 14);
      g.lineStyle(4, COLORS.greenDark, 0.75);
      g.strokeRoundedRect(center.x + 30, center.y - 40, 118, 80, 14);
      g.lineBetween(center.x - 32, center.y - 18, center.x + 30, center.y - 18);
      g.lineBetween(center.x - 32, center.y + 18, center.x + 30, center.y + 18);
      this.addLabel(center.x - 90, center.y + 82, safe ? 'MATCH' : 'BLOCKED', {
        color: safe ? '#146c53' : '#b44d3a',
      });
    }

    if (kind === 'energy') {
      const loadCount = Math.round(this.readout.metrics.loadCount ?? 4);
      for (let index = 0; index < 10; index += 1) {
        const x = 344 + (index % 5) * 68;
        const y = center.y - 58 + Math.floor(index / 5) * 92;
        const active = index < loadCount;
        g.fillStyle(active ? this.mission.accent : COLORS.paperDeep, active ? 0.8 : 1);
        g.fillRoundedRect(x - 22, y - 22, 44, 44, 9);
        g.lineStyle(2, COLORS.greenDark, active ? 0.65 : 0.18);
        g.strokeRoundedRect(x - 22, y - 22, 44, 44, 9);
      }
      const energyWidth = 290 * this.readout.flow.energy;
      g.fillStyle(COLORS.greenDark, 0.1);
      g.fillRoundedRect(335, center.y + 122, 290, 12, 6);
      g.fillStyle(this.mission.accent, 0.9);
      g.fillRoundedRect(335, center.y + 122, energyWidth, 12, 6);
      this.addLabel(center.x, center.y + 154, 'ENERGY OVER TIME', {
        fontSize: '11px',
        color: '#52625b',
      });
    }

    if (kind === 'paths') {
      g.lineStyle(8, COLORS.green, this.readout.flags.intended ? 0.82 : 0.24);
      g.lineBetween(320, center.y, 640, center.y);
      g.lineStyle(6, COLORS.danger, this.readout.flags.leakagePath ? 0.9 : 0.16);
      g.lineBetween(center.x, center.y, center.x, center.y + 112);
      g.lineStyle(6, this.mission.accent, this.readout.flags.protectiveGround ? 0.9 : 0.16);
      g.lineBetween(center.x, center.y, center.x + 96, center.y + 92);
      this.addLabel(650, center.y, 'INTENDED', { fontSize: '11px', color: '#146c53' });
      this.addLabel(center.x, center.y + 136, 'LEAK', { fontSize: '11px', color: '#b44d3a' });
      this.addLabel(center.x + 118, center.y + 102, 'GROUND', {
        fontSize: '11px',
        color: '#8f6419',
      });
    }

    if (kind === 'generator') {
      const rotation = this.lastTime * (0.001 + this.readout.metrics.induction * 0.002);
      g.lineStyle(7, COLORS.greenDark, 0.8);
      g.strokeCircle(center.x, center.y, 82);
      for (let index = 0; index < 4; index += 1) {
        const angle = rotation + (index * Math.PI) / 2;
        g.lineBetween(
          center.x,
          center.y,
          center.x + Math.cos(angle) * 70,
          center.y + Math.sin(angle) * 70,
        );
      }
      g.lineStyle(4, this.mission.accent, 0.8);
      for (let index = 0; index < 5; index += 1) {
        g.strokeCircle(center.x, center.y, 104 + index * 9);
      }
      this.addLabel(center.x, center.y + 164, 'MOTION • FIELD • OPPOSITION', {
        fontSize: '12px',
        color: '#52625b',
      });
    }

    if (kind === 'transformer') {
      const high = this.readout.flags.highVoltage;
      for (let side = 0; side < 2; side += 1) {
        const x = center.x + (side === 0 ? -76 : 76);
        g.lineStyle(6, side === 0 ? this.mission.accent : COLORS.green, 0.85);
        for (let index = 0; index < (side === 0 && high ? 6 : 4); index += 1) {
          g.strokeCircle(x, center.y - 54 + index * 22, 18);
        }
      }
      g.fillStyle(COLORS.heat, this.readout.flow.heat * 0.44);
      g.fillRoundedRect(center.x - 180, center.y - 110, 360, 220, 28);
      this.addLabel(center.x, center.y + 144, 'HIGHER VOLTAGE • LOWER CURRENT • LOWER HEAT', {
        fontSize: '11px',
        color: '#8f6419',
      });
    }

    if (kind === 'protection') {
      const breaker = this.readout.flags.breakerTripped;
      const gfci = this.readout.flags.gfciTripped;
      [
        { x: center.x - 100, label: 'BREAKER', active: breaker },
        { x: center.x + 100, label: 'GFCI', active: gfci },
      ].forEach((watcher) => {
        g.fillStyle(watcher.active ? this.mission.accent : COLORS.paper, 1);
        g.fillRoundedRect(watcher.x - 64, center.y - 62, 128, 124, 18);
        g.lineStyle(4, watcher.active ? COLORS.danger : COLORS.greenDark, 0.8);
        g.strokeRoundedRect(watcher.x - 64, center.y - 62, 128, 124, 18);
        g.lineBetween(
          watcher.x - 26,
          center.y,
          watcher.x + 26,
          watcher.active ? center.y - 24 : center.y,
        );
        this.addLabel(watcher.x, center.y + 88, watcher.label, {
          fontSize: '12px',
          color: watcher.active ? '#b44d3a' : '#146c53',
        });
      });
    }

    if (kind === 'city') {
      const balanced = this.readout.flags.balanced;
      const nodes = [
        { x: 360, y: 220, label: 'GEN' },
        { x: 480, y: 180, label: 'LINE' },
        { x: 600, y: 220, label: 'FEEDER' },
        { x: 390, y: 360, label: 'HOMES' },
        { x: 570, y: 360, label: 'CARE' },
      ];
      g.lineStyle(6, COLORS.greenDark, 0.44);
      [[0, 1], [1, 2], [2, 3], [2, 4]].forEach(([from, to]) => {
        g.lineBetween(nodes[from].x, nodes[from].y, nodes[to].x, nodes[to].y);
      });
      nodes.forEach((node, index) => {
        const active = index < 3 || balanced;
        g.fillStyle(active ? this.mission.accent : COLORS.paperDeep, active ? 0.82 : 1);
        g.fillCircle(node.x, node.y, 34);
        g.lineStyle(3, COLORS.greenDark, active ? 0.8 : 0.25);
        g.strokeCircle(node.x, node.y, 34);
        this.addLabel(node.x, node.y, node.label, { fontSize: '10px' });
      });
      this.addLabel(center.x, 432, 'ONE CONNECTED CITY SYSTEM', {
        fontSize: '13px',
        color: '#146c53',
      });
    }
  }

  private drawFlow(time: number) {
    const g = this.flowGraphics;
    g.clear();
    const flow = this.readout.flow;
    if (!flow.loopClosed || flow.direction === 'none') return;

    const count = 4 + Math.round(flow.density * 14);
    const baseSpeed = this.state.settings.slowMotion ? 0.000025 : 0.000055;
    const direction =
      flow.direction === 'alternating' ? (Math.sin(time / 760) >= 0 ? 1 : -1) : 1;

    for (let index = 0; index < count; index += 1) {
      const progress = wrapProgress((index / count) + time * baseSpeed * direction);
      const point = pointOnTrack(progress);
      g.fillStyle(index % 3 === 0 ? COLORS.paper : this.mission.accent, 0.96);
      g.fillCircle(point.x, point.y, this.flowLensActive ? 6 : 4.5);
      if (this.flowLensActive) {
        g.lineStyle(2, COLORS.greenDark, 0.42);
        g.strokeCircle(point.x, point.y, 8);
      }
    }
  }

  private drawEffects(time: number) {
    const g = this.effectGraphics;
    g.clear();

    const servicePoint = pointOnTrack(SERVICE_PROGRESS);
    const servicePulse = this.state.settings.reducedMotion
      ? 1
      : 0.65 + Math.sin(time / 360) * 0.15;
    g.lineStyle(3, this.mission.accent, servicePulse);
    g.strokeCircle(servicePoint.x, servicePoint.y, 32 + servicePulse * 8);

    if (this.readout.flow.leakage > 0) {
      g.lineStyle(5, COLORS.danger, 0.34 + this.readout.flow.leakage * 0.55);
      g.lineBetween(480, TRACK.top, 480, 54);
      g.fillStyle(COLORS.danger, 0.9);
      g.fillTriangle(468, 74, 492, 74, 480, 54);
    }

    if (this.readout.flags.staticDischarge) {
      g.lineStyle(7, COLORS.amber, 0.9);
      g.beginPath();
      g.moveTo(432, 282);
      g.lineTo(463, 266);
      g.lineTo(451, 300);
      g.lineTo(489, 278);
      g.lineTo(478, 318);
      g.lineTo(525, 290);
      g.strokePath();
    }

    if (this.completionPulseStarted >= 0) {
      const duration = this.state.settings.reducedMotion ? 180 : 1_100;
      const progress = clamp01((time - this.completionPulseStarted) / duration);
      const steps = Math.max(1, Math.round(progress * 96));
      g.lineStyle(13, this.mission.accent, this.state.settings.reducedEffects ? 0.48 : 0.78);
      let previous = pointOnTrack(0);
      for (let index = 1; index <= steps; index += 1) {
        const next = pointOnTrack(index / 96);
        g.lineBetween(previous.x, previous.y, next.x, next.y);
        previous = next;
      }
      if (progress >= 1) this.completionPulseStarted = -1;
    }

    if (this.flowLensActive) {
      g.lineStyle(2, COLORS.sky, 0.32);
      const rings = 2 + Math.round(this.readout.flow.fieldAmplitude * 4);
      for (let index = 0; index < rings; index += 1) {
        g.strokeCircle(TRACK.left, 294, 62 + index * 13);
      }
    }
  }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
