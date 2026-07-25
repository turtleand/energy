import Phaser from 'phaser';
import type { InteractionStationId } from './content/stations';
import { LoopScene } from './scenes/LoopScene';
import type { CampaignState, MissionReadout } from './core/model';

export interface CircuitRidersRendererOptions {
  initialState: CampaignState;
  initialReadout: MissionReadout;
  onFrameSample?: (sample: { fps: number; worstFrameMs: number }) => void;
  onPrimaryAction: () => void;
  onStationChange: (station: InteractionStationId | null) => void;
  onAssistedTravelEnd: (station: InteractionStationId, arrived: boolean) => void;
}

export interface CircuitRidersRenderer {
  cancelTargeting: () => void;
  destroy: () => void;
  targetStation: (station: InteractionStationId, assisted: boolean) => void;
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
    cancelTargeting: () => scene.cancelTargeting(),
    destroy: () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObserver.disconnect();
      game.destroy(true);
    },
    targetStation: (station, assisted) => scene.targetStation(station, assisted),
    setPaused: (paused) => {
      manuallyPaused = paused;
      applyPause();
    },
    update: (state, readout, flowLensActive, missionChanged = false) => {
      scene.setModel(state, readout, flowLensActive, missionChanged);
    },
  };
}
