import Phaser from 'phaser';
import { IslandScene } from './scenes/IslandScene';
import type { DistrictId } from './content/districts';
import type { NavigationSnapshot, RoverStartMode } from './core/navigation';
import type { DistrictReadout, GameState } from './core/simulation';

export interface GridkeeperRendererOptions {
  initialState: GameState;
  initialReadout: DistrictReadout;
  startMode: RoverStartMode;
  onNavigationChange: (snapshot: NavigationSnapshot) => void;
}

export interface GridkeeperRenderer {
  destroy: () => void;
  resetRover: (mode: RoverStartMode) => void;
  setDistrictDestination: (district: DistrictId) => void;
  setPaused: (paused: boolean) => void;
  update: (state: GameState, readout: DistrictReadout, flowLensActive: boolean) => void;
}

export function startGridkeeper(
  parent: HTMLElement,
  options: GridkeeperRendererOptions,
): GridkeeperRenderer {
  const scene = new IslandScene(options);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 600,
    transparent: true,
    antialias: true,
    roundPixels: true,
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

  return {
    destroy: () => game.destroy(true),
    resetRover: (mode) => scene.resetRover(mode),
    setDistrictDestination: (district) => scene.setDistrictDestination(district),
    setPaused: (paused) => {
      if (paused) {
        scene.scene.pause();
      } else {
        scene.scene.resume();
      }
    },
    update: (state, readout, flowLensActive) => scene.setModel(state, readout, flowLensActive),
  };
}
