import {
  getStationForControl,
  type InteractionStation,
  type InteractionStationId,
} from '../content/stations';
import { missionById, type MissionId } from '../content/campaign';
import {
  performMissionAction,
  setMissionControl,
  type CampaignState,
  type ControlValue,
} from './model';

export interface InteractionResult {
  accepted: boolean;
  requiredStation: InteractionStation;
  state: CampaignState;
}

function getControlDefinition(mission: MissionId, controlId: string) {
  return missionById[mission].controls.find((control) => control.id === controlId);
}

function canInteract(
  state: CampaignState,
  mission: MissionId,
  controlId: string,
  nearbyStation: InteractionStationId | null,
) {
  const requiredStation = getStationForControl(mission, controlId);
  return {
    accepted: state.activeMission === mission && nearbyStation === requiredStation.id,
    requiredStation,
  };
}

export function applyControlInteraction(
  state: CampaignState,
  mission: MissionId,
  controlId: string,
  value: ControlValue,
  nearbyStation: InteractionStationId | null,
): InteractionResult {
  const permission = canInteract(state, mission, controlId, nearbyStation);
  const definition = getControlDefinition(mission, controlId);
  if (!permission.accepted || !definition || definition.kind === 'action') {
    return { ...permission, accepted: false, state };
  }

  return {
    ...permission,
    state: setMissionControl(state, mission, controlId, value),
  };
}

export function applyActionInteraction(
  state: CampaignState,
  mission: MissionId,
  controlId: string,
  nearbyStation: InteractionStationId | null,
): InteractionResult {
  const permission = canInteract(state, mission, controlId, nearbyStation);
  const definition = getControlDefinition(mission, controlId);
  if (!permission.accepted || !definition || definition.kind !== 'action') {
    return { ...permission, accepted: false, state };
  }

  return {
    ...permission,
    state: performMissionAction(state, mission, definition.action),
  };
}
