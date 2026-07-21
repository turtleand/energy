import Phaser from 'phaser';
import { districtById, districts, type DistrictId } from '../content/districts';
import {
  ENTER_RADIUS,
  HINT_RADIUS,
  buildNavigationSnapshot,
  clampToPlayBounds,
  distanceBetween,
  districtWorldPoint,
  getInitialRoverPosition,
  nearestUnlockedDistrict,
  normalizeMovementVector,
  type NavigationPoint,
  type NavigationSnapshot,
  type RoverStartMode,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../core/navigation';
import { isDistrictUnlocked, type DistrictReadout, type GameState } from '../core/simulation';
import type { GridkeeperRendererOptions } from '../bootstrap';

const COLORS = {
  ocean: 0xbde5e2,
  oceanDeep: 0x8bc9cc,
  paper: 0xfffaf0,
  island: 0xdde9b9,
  islandShadow: 0x7ba482,
  green: 0x146c53,
  greenDark: 0x0d4637,
  ink: 0x17211d,
  muted: 0x60706a,
  amber: 0xf59e0b,
  sky: 0x38bdf8,
  line: 0x89a69a,
  danger: 0xc95a45,
};

type Point = NavigationPoint;

export class IslandScene extends Phaser.Scene {
  private readonly options: GridkeeperRendererOptions;
  private state: GameState;
  private readout: DistrictReadout;
  private flowLensActive = false;
  private worldGraphics!: Phaser.GameObjects.Graphics;
  private effectGraphics!: Phaser.GameObjects.Graphics;
  private lensGraphics!: Phaser.GameObjects.Graphics;
  private rover!: Phaser.GameObjects.Container;
  private roverPosition: Point;
  private roverTarget: Point;
  private destinationDistrict: DistrictId | null = null;
  private operatingDistrict: DistrictId | null = null;
  private navigationSnapshot: NavigationSnapshot;
  private trail: Point[] = [];
  private districtNodes = new Map<DistrictId, Phaser.GameObjects.Container>();
  private movementMount?: HTMLElement;
  private pressedMovementKeys = new Set<string>();
  private queuedMovement: Point = { x: 0, y: 0 };
  private lastTime = 0;

  private readonly handleMovementKeyDown = (event: KeyboardEvent) => {
    const direction = movementDirectionForKey(event.key);
    if (!direction) return;
    event.preventDefault();
    this.pressedMovementKeys.add(event.key.toLowerCase());
    if (event.repeat) return;
    this.queuedMovement = {
      x: Phaser.Math.Clamp(this.queuedMovement.x + direction.x, -1, 1),
      y: Phaser.Math.Clamp(this.queuedMovement.y + direction.y, -1, 1),
    };
  };

  private readonly handleMovementKeyUp = (event: KeyboardEvent) => {
    this.pressedMovementKeys.delete(event.key.toLowerCase());
  };

  private readonly clearMovementKeys = () => {
    this.pressedMovementKeys.clear();
    this.queuedMovement = { x: 0, y: 0 };
  };

  constructor(options: GridkeeperRendererOptions) {
    super({ key: 'gridkeeper-island' });
    this.options = options;
    this.state = options.initialState;
    this.readout = options.initialReadout;
    const start = getInitialRoverPosition(this.state.activeDistrict, options.startMode);
    this.roverPosition = { ...start };
    this.roverTarget = { ...start };
    this.navigationSnapshot = buildNavigationSnapshot(start, this.unlockedDistrictIds(), null, null);
  }

  create() {
    this.worldGraphics = this.add.graphics();
    this.effectGraphics = this.add.graphics();
    this.lensGraphics = this.add.graphics();

    this.drawBaseWorld();
    this.createDistrictNodes();
    this.createRover();
    this.configureInput();
    this.updateNavigationState(true);
    this.renderModel(0);
  }

  update(time: number, delta: number) {
    this.lastTime = time;
    this.updateRover(delta);
    this.drawEffects(time);
  }

  setModel(state: GameState, readout: DistrictReadout, flowLensActive: boolean) {
    this.state = state;
    this.readout = readout;
    this.flowLensActive = flowLensActive;
    if (!this.worldGraphics) return;
    this.renderModel(this.lastTime);
  }

  setDistrictDestination(district: DistrictId) {
    if (!isDistrictUnlocked(this.state, district)) return;
    this.destinationDistrict = district;
    this.roverTarget = this.toWorldPoint(district);
    this.updateNavigationState(true);
  }

  resetRover(mode: RoverStartMode) {
    const start = getInitialRoverPosition(this.state.activeDistrict, mode);
    this.roverPosition = { ...start };
    this.roverTarget = { ...start };
    this.destinationDistrict = null;
    this.operatingDistrict = null;
    this.trail = [];
    this.applyRoverPosition();
    this.updateNavigationState(true);
  }

  private toWorldPoint(district: DistrictId): Point {
    return districtWorldPoint(district);
  }

  private unlockedDistrictIds(): DistrictId[] {
    return districts.filter((district) => isDistrictUnlocked(this.state, district.id)).map((district) => district.id);
  }

  private drawBaseWorld() {
    const g = this.worldGraphics;
    g.clear();
    g.fillStyle(COLORS.ocean, 1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    g.lineStyle(2, COLORS.oceanDeep, 0.3);
    for (let y = 42; y < WORLD_HEIGHT; y += 48) {
      const offset = (y / 48) % 2 === 0 ? 12 : -12;
      for (let x = 8; x < WORLD_WIDTH; x += 84) {
        g.beginPath();
        g.moveTo(x + offset, y);
        g.lineTo(x + 18 + offset, y - 4);
        g.lineTo(x + 36 + offset, y);
        g.strokePath();
      }
    }

    const islandPoints = [
      { x: 96, y: 445 },
      { x: 126, y: 275 },
      { x: 270, y: 122 },
      { x: 480, y: 73 },
      { x: 710, y: 106 },
      { x: 864, y: 248 },
      { x: 878, y: 430 },
      { x: 760, y: 534 },
      { x: 520, y: 558 },
      { x: 278, y: 544 },
    ];
    const shadowPoints = islandPoints.map((point) => ({ x: point.x + 7, y: point.y + 12 }));
    g.fillStyle(COLORS.islandShadow, 0.42);
    g.fillPoints(shadowPoints, true);
    g.fillStyle(COLORS.island, 1);
    g.fillPoints(islandPoints, true);

    g.fillStyle(0xb8d58d, 0.8);
    g.fillCircle(466, 222, 128);
    g.fillStyle(0xa4c77b, 0.72);
    g.fillCircle(600, 274, 112);
    g.fillStyle(0xf1ddad, 0.9);
    g.fillEllipse(260, 465, 270, 120);
    g.fillEllipse(735, 465, 236, 108);

    this.drawRoads(g);
    this.drawDistrictLandmarks(g);
  }

  private drawRoads(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(15, 0xfff4d7, 0.78);
    for (let index = 0; index < districts.length - 1; index += 1) {
      const from = this.toWorldPoint(districts[index].id);
      const to = this.toWorldPoint(districts[index + 1].id);
      g.lineBetween(from.x, from.y, to.x, to.y);
    }
    g.lineStyle(2, COLORS.greenDark, 0.16);
    for (let index = 0; index < districts.length - 1; index += 1) {
      const from = this.toWorldPoint(districts[index].id);
      const to = this.toWorldPoint(districts[index + 1].id);
      g.lineBetween(from.x, from.y, to.x, to.y);
    }
  }

  private drawDistrictLandmarks(g: Phaser.GameObjects.Graphics) {
    this.drawWorkshop(g, this.toWorldPoint('workshop'));
    this.drawConverter(g, this.toWorldPoint('converter'));
    this.drawWind(g, this.toWorldPoint('wind'));
    this.drawLongline(g, this.toWorldPoint('longline'));
    this.drawLanterns(g, this.toWorldPoint('lantern'));
    this.drawHarbor(g, this.toWorldPoint('harbor'));
  }

  private drawWorkshop(g: Phaser.GameObjects.Graphics, point: Point) {
    g.fillStyle(COLORS.paper, 1);
    g.fillRoundedRect(point.x - 58, point.y - 46, 58, 48, 7);
    g.fillStyle(COLORS.greenDark, 1);
    g.fillTriangle(point.x - 66, point.y - 46, point.x - 29, point.y - 76, point.x + 8, point.y - 46);
    g.fillStyle(COLORS.amber, 0.8);
    g.fillCircle(point.x - 20, point.y - 20, 7);
    g.lineStyle(3, COLORS.ink, 0.55);
    g.lineBetween(point.x + 20, point.y - 2, point.x + 20, point.y - 64);
    g.lineBetween(point.x + 20, point.y - 64, point.x + 40, point.y - 48);
  }

  private drawConverter(g: Phaser.GameObjects.Graphics, point: Point) {
    g.fillStyle(0xf4ead4, 1);
    g.fillRoundedRect(point.x - 54, point.y - 46, 76, 42, 6);
    g.fillStyle(COLORS.sky, 0.7);
    g.fillRect(point.x - 42, point.y - 33, 18, 16);
    g.fillRect(point.x - 17, point.y - 33, 18, 16);
    g.lineStyle(4, COLORS.ink, 0.42);
    g.lineBetween(point.x + 25, point.y - 4, point.x + 56, point.y + 22);
    g.lineBetween(point.x + 56, point.y + 22, point.x + 80, point.y + 22);
  }

  private drawWind(g: Phaser.GameObjects.Graphics, point: Point) {
    g.lineStyle(5, COLORS.paper, 1);
    g.lineBetween(point.x - 8, point.y + 12, point.x - 8, point.y - 66);
    g.fillStyle(COLORS.paper, 1);
    g.fillCircle(point.x - 8, point.y - 66, 8);
    g.lineStyle(6, COLORS.paper, 1);
    for (let index = 0; index < 3; index += 1) {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2) / 3;
      g.lineBetween(
        point.x - 8,
        point.y - 66,
        point.x - 8 + Math.cos(angle) * 42,
        point.y - 66 + Math.sin(angle) * 42,
      );
    }
  }

  private drawLongline(g: Phaser.GameObjects.Graphics, point: Point) {
    g.lineStyle(4, COLORS.ink, 0.65);
    for (const offset of [-46, 22]) {
      g.lineBetween(point.x + offset, point.y + 26, point.x + offset, point.y - 54);
      g.lineBetween(point.x + offset - 24, point.y - 35, point.x + offset + 24, point.y - 35);
    }
    g.lineStyle(2, COLORS.greenDark, 0.72);
    g.lineBetween(point.x - 70, point.y - 35, point.x + 46, point.y - 35);
    g.lineBetween(point.x - 70, point.y - 27, point.x + 46, point.y - 27);
  }

  private drawLanterns(g: Phaser.GameObjects.Graphics, point: Point) {
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const x = point.x - 62 + column * 39;
        const y = point.y - 60 + row * 34;
        g.fillStyle(0xf2d29b, 1);
        g.fillRoundedRect(x, y, 29, 23, 4);
        g.fillStyle(COLORS.amber, 0.75);
        g.fillCircle(x + 14, y + 10, 6);
      }
    }
  }

  private drawHarbor(g: Phaser.GameObjects.Graphics, point: Point) {
    g.fillStyle(COLORS.oceanDeep, 0.72);
    g.fillRect(point.x + 20, point.y - 16, 96, 56);
    g.fillStyle(COLORS.paper, 1);
    for (let index = 0; index < 3; index += 1) {
      const x = point.x - 62 + index * 45;
      g.fillRect(x, point.y - 52, 32, 30);
      g.fillStyle(COLORS.greenDark, 0.9);
      g.fillTriangle(x - 4, point.y - 52, x + 16, point.y - 70, x + 36, point.y - 52);
      g.fillStyle(COLORS.paper, 1);
    }
    g.fillStyle(COLORS.greenDark, 0.8);
    g.fillTriangle(point.x + 57, point.y - 24, point.x + 93, point.y - 24, point.x + 85, point.y - 52);
    g.fillStyle(0xf4ead4, 1);
    g.fillRect(point.x + 62, point.y - 20, 28, 12);
  }

  private createDistrictNodes() {
    for (const district of districts) {
      const point = this.toWorldPoint(district.id);
      const halo = this.add.circle(0, 0, 34, district.accent, 0.2);
      const core = this.add.circle(0, 0, 20, COLORS.paper, 1).setStrokeStyle(4, COLORS.greenDark, 0.8);
      const symbol = this.add
        .text(0, -1, String(district.order), {
          color: '#17211d',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '17px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const label = this.add
        .text(0, 33, district.shortName, {
          align: 'center',
          backgroundColor: '#fffaf0e6',
          color: '#17211d',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          padding: { x: 7, y: 4 },
        })
        .setOrigin(0.5, 0);
      const rangeLabel = this.add
        .text(0, -103, 'IN RANGE', {
          align: 'center',
          backgroundColor: '#0d4637f2',
          color: '#fffaf0',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          padding: { x: 8, y: 5 },
        })
        .setOrigin(0.5)
        .setVisible(false);
      const container = this.add.container(point.x, point.y, [halo, core, symbol, label, rangeLabel]);
      core.setInteractive({ useHandCursor: true });
      this.districtNodes.set(district.id, container);
    }
  }

  private createRover() {
    const shadow = this.add.ellipse(0, 10, 36, 15, COLORS.ink, 0.18);
    const shell = this.add.circle(0, 0, 16, COLORS.green, 1).setStrokeStyle(3, COLORS.paper, 0.9);
    const shellMark = this.add.circle(0, 0, 7, COLORS.amber, 0.72);
    const head = this.add.circle(17, -2, 8, 0x8dd4bd, 1);
    const eye = this.add.circle(20, -4, 1.8, COLORS.ink, 1);
    this.rover = this.add.container(this.roverPosition.x, this.roverPosition.y - 30, [shadow, shell, shellMark, head, eye]);
    this.rover.setDepth(20);
  }

  private configureInput() {
    const mount = this.game.canvas.parentElement;
    if (mount instanceof HTMLElement) {
      this.movementMount = mount;
      mount.addEventListener('keydown', this.handleMovementKeyDown);
      mount.addEventListener('keyup', this.handleMovementKeyUp);
      mount.addEventListener('blur', this.clearMovementKeys);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeMovementListeners, this);
    }
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (mount instanceof HTMLElement) mount.focus({ preventScroll: true });
      const point = clampToPlayBounds({ x: pointer.worldX, y: pointer.worldY });
      const nearest = nearestUnlockedDistrict(point, this.unlockedDistrictIds());
      if (nearest && nearest.distance <= 52) {
        this.setDistrictDestination(nearest.id);
      } else {
        this.destinationDistrict = null;
        this.roverTarget = point;
        this.updateNavigationState(true);
      }
    });
  }

  private removeMovementListeners() {
    this.movementMount?.removeEventListener('keydown', this.handleMovementKeyDown);
    this.movementMount?.removeEventListener('keyup', this.handleMovementKeyUp);
    this.movementMount?.removeEventListener('blur', this.clearMovementKeys);
    this.clearMovementKeys();
    this.movementMount = undefined;
  }

  private updateRover(delta: number) {
    if (!this.rover) return;
    const speed = this.state.settings.assisted ? 270 : 220;
    const step = (speed * delta) / 1000;
    let inputX = 0;
    let inputY = 0;
    const mount = this.game.canvas.parentElement;
    const movementFocused = document.activeElement === mount;
    if (movementFocused) {
      if (this.pressedMovementKeys.has('arrowleft') || this.pressedMovementKeys.has('a')) inputX -= 1;
      if (this.pressedMovementKeys.has('arrowright') || this.pressedMovementKeys.has('d')) inputX += 1;
      if (this.pressedMovementKeys.has('arrowup') || this.pressedMovementKeys.has('w')) inputY -= 1;
      if (this.pressedMovementKeys.has('arrowdown') || this.pressedMovementKeys.has('s')) inputY += 1;
    }

    if (inputX === 0 && inputY === 0 && movementFocused) {
      inputX = this.queuedMovement.x;
      inputY = this.queuedMovement.y;
    }
    this.queuedMovement = { x: 0, y: 0 };

    if (inputX !== 0 || inputY !== 0) {
      const direction = normalizeMovementVector(inputX, inputY);
      this.destinationDistrict = null;
      this.roverPosition = clampToPlayBounds({
        x: this.roverPosition.x + direction.x * step,
        y: this.roverPosition.y + direction.y * step,
      });
      this.roverTarget = { ...this.roverPosition };
      this.recordTrailPoint();
      this.applyRoverPosition(inputX);
      this.updateNavigationState();
      return;
    }

    const distance = distanceBetween(this.roverPosition, this.roverTarget);
    if (distance < 2) return;
    const amount = Math.min(step, distance);
    const movementX = ((this.roverTarget.x - this.roverPosition.x) / distance) * amount;
    this.roverPosition = clampToPlayBounds({
      x: this.roverPosition.x + movementX,
      y: this.roverPosition.y + ((this.roverTarget.y - this.roverPosition.y) / distance) * amount,
    });
    this.recordTrailPoint();
    this.applyRoverPosition(movementX);
    this.updateNavigationState();
  }

  private applyRoverPosition(horizontalDirection = 0) {
    if (!this.rover) return;
    this.rover.setPosition(this.roverPosition.x, this.roverPosition.y - 30);
    if (horizontalDirection < -0.02) this.rover.setScale(-1, 1);
    if (horizontalDirection > 0.02) this.rover.setScale(1, 1);
  }

  private recordTrailPoint() {
    if (this.state.settings.reducedMotion) {
      this.trail = [];
      return;
    }
    const previous = this.trail.at(-1);
    if (!previous || distanceBetween(previous, this.roverPosition) >= 14) {
      this.trail = [...this.trail.slice(-7), { ...this.roverPosition }];
    }
  }

  private updateNavigationState(force = false) {
    let next = buildNavigationSnapshot(
      this.roverPosition,
      this.unlockedDistrictIds(),
      this.operatingDistrict,
      this.destinationDistrict,
    );
    if (next.operatingDistrict && next.operatingDistrict === this.destinationDistrict) {
      this.destinationDistrict = null;
      this.roverTarget = { ...this.roverPosition };
      next = { ...next, destinationDistrict: null };
    }
    const changed =
      force ||
      next.destinationDistrict !== this.navigationSnapshot.destinationDistrict ||
      next.nearbyDistrict !== this.navigationSnapshot.nearbyDistrict ||
      next.operatingDistrict !== this.navigationSnapshot.operatingDistrict ||
      next.phase !== this.navigationSnapshot.phase;
    this.operatingDistrict = next.operatingDistrict;
    this.navigationSnapshot = next;
    if (changed) {
      this.options.onNavigationChange(next);
      if (this.worldGraphics) this.renderModel(this.lastTime);
    }
  }

  private renderModel(time: number) {
    for (const district of districts) {
      const node = this.districtNodes.get(district.id);
      if (!node) continue;
      const [halo, core, symbol, label, rangeLabel] = node.list as [
        Phaser.GameObjects.Arc,
        Phaser.GameObjects.Arc,
        Phaser.GameObjects.Text,
        Phaser.GameObjects.Text,
        Phaser.GameObjects.Text,
      ];
      const unlocked = isDistrictUnlocked(this.state, district.id);
      const restored = this.state.restored.includes(district.id);
      const active = this.state.activeDistrict === district.id;
      const destination = this.navigationSnapshot.destinationDistrict === district.id;
      const operating = this.navigationSnapshot.operatingDistrict === district.id;
      halo.setVisible(unlocked).setAlpha(restored ? 0.72 : operating ? 0.62 : destination ? 0.48 : 0.2);
      core.setFillStyle(restored ? district.accent : unlocked ? COLORS.paper : 0xaeb8b1, 1);
      core.setStrokeStyle(
        operating ? 6 : destination || active ? 4 : 3,
        operating || active ? district.accent : destination ? COLORS.sky : COLORS.greenDark,
        unlocked ? 0.9 : 0.25,
      );
      symbol.setText(restored ? '✓' : unlocked ? String(district.order) : '×');
      symbol.setColor(restored ? '#0d4637' : unlocked ? '#17211d' : '#65716c');
      label.setAlpha(unlocked ? 1 : 0.68);
      rangeLabel.setVisible(operating);
      node.setScale(operating ? 1.1 : destination ? 1.06 : 1);
    }
    this.drawEffects(time);
    this.drawLens();
  }

  private drawEffects(time: number) {
    if (!this.effectGraphics) return;
    const g = this.effectGraphics;
    g.clear();
    const activeIndex = districts.findIndex((district) => district.id === this.state.activeDistrict);
    const visualTime = this.state.settings.reducedMotion ? 0 : time;
    this.drawNavigation(g, visualTime);

    for (let index = 0; index < districts.length - 1; index += 1) {
      const segmentPowered =
        this.state.restored.includes(districts[index].id) ||
        (index === activeIndex && this.readout.lens.energyTransfer > 0.05);
      if (!segmentPowered) continue;
      const from = this.toWorldPoint(districts[index].id);
      const to = this.toWorldPoint(districts[index + 1].id);
      const density = this.state.settings.reducedEffects
        ? 2
        : Math.max(2, Math.round(2 + this.readout.lens.pulseDensity * 5));
      g.lineStyle(
        this.flowLensActive ? 5 : 3,
        COLORS.amber,
        this.state.settings.reducedEffects ? 0.48 : this.flowLensActive ? 0.72 : 0.38,
      );
      g.lineBetween(from.x, from.y, to.x, to.y);
      for (let pulse = 0; pulse < density; pulse += 1) {
        const phase = ((visualTime / 2400 + pulse / density) % 1 + 1) % 1;
        const alternating = this.readout.lens.direction === 'alternating';
        const t = alternating ? (Math.sin(phase * Math.PI * 2) + 1) / 2 : phase;
        const x = Phaser.Math.Linear(from.x, to.x, t);
        const y = Phaser.Math.Linear(from.y, to.y, t);
        g.fillStyle(this.flowLensActive ? COLORS.sky : COLORS.amber, 0.9);
        g.fillCircle(x, y, this.flowLensActive ? 5 : 3.5);
      }
    }

    const activePoint = this.toWorldPoint(this.state.activeDistrict);
    const restored = this.state.restored.includes(this.state.activeDistrict);
    const pulse = this.state.settings.reducedMotion ? 1 : 1 + Math.sin(visualTime / 270) * 0.08;
    g.lineStyle(4, restored ? COLORS.green : districtById[this.state.activeDistrict].accent, 0.5);
    g.strokeCircle(activePoint.x, activePoint.y, (42 + this.readout.objectiveProgress * 8) * pulse);

    if (this.readout.flags.staticSpark && this.state.activeDistrict === 'workshop') {
      g.lineStyle(5, COLORS.sky, 0.9);
      g.beginPath();
      g.moveTo(activePoint.x + 22, activePoint.y - 62);
      g.lineTo(activePoint.x + 37, activePoint.y - 50);
      g.lineTo(activePoint.x + 27, activePoint.y - 35);
      g.lineTo(activePoint.x + 44, activePoint.y - 24);
      g.strokePath();
    }

    if (this.readout.lens.heat > 0.35) {
      g.fillStyle(COLORS.danger, Math.min(0.22, this.readout.lens.heat * 0.24));
      g.fillCircle(activePoint.x, activePoint.y, 62);
    }

    if (this.readout.lens.leakage > 0.1) {
      g.lineStyle(4, COLORS.danger, 0.8);
      g.lineBetween(activePoint.x, activePoint.y, activePoint.x + 48, activePoint.y + 44);
      g.fillStyle(COLORS.danger, 0.9);
      g.fillTriangle(
        activePoint.x + 48,
        activePoint.y + 44,
        activePoint.x + 37,
        activePoint.y + 35,
        activePoint.x + 39,
        activePoint.y + 50,
      );
    }
  }

  private drawNavigation(g: Phaser.GameObjects.Graphics, visualTime: number) {
    const targetDistance = distanceBetween(this.roverPosition, this.roverTarget);
    if (targetDistance > 4) {
      const targetColor = this.destinationDistrict
        ? districtById[this.destinationDistrict].accent
        : COLORS.sky;
      this.drawDashedLine(g, this.roverPosition, this.roverTarget, targetColor, 0.42);
      const markerPulse = this.state.settings.reducedMotion ? 0 : Math.sin(visualTime / 190) * 3;
      g.lineStyle(3, targetColor, 0.78);
      g.strokeCircle(this.roverTarget.x, this.roverTarget.y, 10 + markerPulse);
      g.fillStyle(targetColor, 0.82);
      g.fillCircle(this.roverTarget.x, this.roverTarget.y, 3.5);
    }

    if (!this.state.settings.reducedMotion) {
      this.trail.forEach((point, index) => {
        g.fillStyle(COLORS.greenDark, ((index + 1) / this.trail.length) * 0.22);
        g.fillCircle(point.x, point.y - 4, 2.5 + index * 0.16);
      });
    }

    for (const district of districts) {
      if (!isDistrictUnlocked(this.state, district.id)) continue;
      const point = this.toWorldPoint(district.id);
      const operating = this.navigationSnapshot.operatingDistrict === district.id;
      const destination = this.navigationSnapshot.destinationDistrict === district.id;
      const nearby = this.navigationSnapshot.nearbyDistrict === district.id;
      g.lineStyle(operating ? 5 : destination ? 3 : 2, district.accent, operating ? 0.9 : destination ? 0.68 : 0.28);
      g.strokeCircle(point.x, point.y, ENTER_RADIUS);

      if (destination && !operating) {
        const pulse = this.state.settings.reducedMotion ? 0 : Math.sin(visualTime / 230) * 4;
        for (let index = 0; index < 24; index += 2) {
          const angle = (index / 24) * Math.PI * 2;
          g.fillStyle(district.accent, 0.88);
          g.fillCircle(
            point.x + Math.cos(angle) * (ENTER_RADIUS + 9 + pulse),
            point.y + Math.sin(angle) * (ENTER_RADIUS + 9 + pulse),
            2.8,
          );
        }
      }

      if (nearby && !operating) {
        const distance = distanceBetween(this.roverPosition, point);
        const progress = clampNumber(1 - (distance - ENTER_RADIUS) / (HINT_RADIUS - ENTER_RADIUS), 0, 1);
        if (progress > 0) {
          g.lineStyle(6, district.accent, 0.84);
          g.beginPath();
          g.arc(
            point.x,
            point.y,
            ENTER_RADIUS + 1,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * progress,
          );
          g.strokePath();
        }
      }
    }
  }

  private drawDashedLine(
    g: Phaser.GameObjects.Graphics,
    from: Point,
    to: Point,
    color: number,
    alpha: number,
  ) {
    const distance = distanceBetween(from, to);
    const segmentLength = 11;
    const segmentCount = Math.max(1, Math.floor(distance / segmentLength));
    g.lineStyle(2, color, alpha);
    for (let index = 0; index < segmentCount; index += 2) {
      const start = index / segmentCount;
      const end = Math.min(1, (index + 1) / segmentCount);
      g.lineBetween(
        Phaser.Math.Linear(from.x, to.x, start),
        Phaser.Math.Linear(from.y, to.y, start),
        Phaser.Math.Linear(from.x, to.x, end),
        Phaser.Math.Linear(from.y, to.y, end),
      );
    }
  }

  private drawLens() {
    if (!this.lensGraphics) return;
    const g = this.lensGraphics;
    g.clear();
    if (!this.flowLensActive) return;

    g.fillStyle(COLORS.ink, 0.1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    g.fillStyle(COLORS.paper, 0.94);
    g.fillRoundedRect(34, 28, 246, 98, 16);
    g.lineStyle(2, COLORS.greenDark, 0.35);
    g.strokeRoundedRect(34, 28, 246, 98, 16);

    const bars = [
      { value: this.readout.lens.voltage, color: COLORS.sky },
      { value: this.readout.lens.pulseDensity, color: COLORS.green },
      { value: this.readout.lens.energyTransfer, color: COLORS.amber },
      { value: this.readout.lens.heat, color: COLORS.danger },
    ];
    bars.forEach((bar, index) => {
      const y = 43 + index * 19;
      g.fillStyle(COLORS.line, 0.22);
      g.fillRoundedRect(126, y, 128, 10, 5);
      g.fillStyle(bar.color, 0.88);
      g.fillRoundedRect(126, y, Math.max(4, 128 * clampNumber(bar.value, 0, 1)), 10, 5);
    });
  }
}

function movementDirectionForKey(key: string): Point | null {
  switch (key.toLowerCase()) {
    case 'arrowleft':
    case 'a':
      return { x: -1, y: 0 };
    case 'arrowright':
    case 'd':
      return { x: 1, y: 0 };
    case 'arrowup':
    case 'w':
      return { x: 0, y: -1 };
    case 'arrowdown':
    case 's':
      return { x: 0, y: 1 };
    default:
      return null;
  }
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
