import Phaser from 'phaser';
import { LoopScene } from './scenes/LoopScene';
import type { CampaignState, MissionReadout } from './core/model';

export interface CircuitRidersRendererOptions {
  initialState: CampaignState;
  initialReadout: MissionReadout;
  onFrameSample?: (sample: { fps: number; worstFrameMs: number }) => void;
  onPrimaryAction: () => void;
  onServiceChange: (available: boolean) => void;
}

export interface CircuitRidersRenderer {
  destroy: () => void;
  dockAtService: () => void;
  setPaused: (paused: boolean) => void;
  update: (
    state: CampaignState,
    readout: MissionReadout,
    flowLensActive: boolean,
    missionChanged?: boolean,
  ) => void;
}

export function startCircuitRiders(
  parent: HTMLElement,
  options: CircuitRidersRendererOptions,
): CircuitRidersRenderer {
  const scene = new LoopScene(options);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 600,
    transparent: true,
    antialias: true,
    roundPixels: true,
    resolution: Math.min(window.devicePixelRatio || 1, 1.5),
    input: {
      activePointers: 3,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 600,
    },
    scene,
  });

  let manuallyPaused = false;
  const applyPause = () => {
    scene.setExternalPaused(manuallyPaused || document.hidden);
    if (manuallyPaused || document.hidden) {
      scene.scene.pause();
    } else {
      scene.scene.resume();
    }
  };
  const handleVisibility = () => applyPause();
  document.addEventListener('visibilitychange', handleVisibility);

  const resizeObserver = new ResizeObserver(() => {
    game.scale.refresh();
  });
  resizeObserver.observe(parent);

  return {
    destroy: () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObserver.disconnect();
      game.destroy(true);
    },
    dockAtService: () => scene.dockAtService(),
    setPaused: (paused) => {
      manuallyPaused = paused;
      applyPause();
    },
    update: (state, readout, flowLensActive, missionChanged = false) => {
      scene.setModel(state, readout, flowLensActive, missionChanged);
    },
  };
}
