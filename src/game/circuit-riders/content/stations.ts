import { missionById, type MissionId } from './campaign';

export type InteractionStationId =
  | 'source'
  | 'switch'
  | 'return'
  | 'stormglass'
  | 'junction'
  | 'loop-gate'
  | 'constriction'
  | 'intake'
  | 'rectifier'
  | 'output'
  | 'module-rack'
  | 'diagnostics'
  | 'dock'
  | 'market'
  | 'shift-clock'
  | 'path-bench'
  | 'leakage-panel'
  | 'generator-loop'
  | 'rotor'
  | 'load-bank'
  | 'longline'
  | 'transformer'
  | 'fault-bench'
  | 'watchers'
  | 'test-console'
  | 'generation'
  | 'transmission'
  | 'distribution'
  | 'city-protection';

export interface InteractionStation {
  id: InteractionStationId;
  label: string;
  progress: number;
  controlIds: readonly string[];
}

export const INTERACTION_ENTER_RANGE = 0.036;
export const INTERACTION_EXIT_RANGE = 0.052;

const SOURCE_PROGRESS = 0.089;
const NORTH_PROGRESS = 0.34;
const LOAD_PROGRESS = 0.53;
const RETURN_PROGRESS = 0.68;
const SWITCH_PROGRESS = 0.84;

export const interactionStations: Record<MissionId, readonly InteractionStation[]> = {
  'loopworks-01': [
    { id: 'source', label: 'Source', progress: SOURCE_PROGRESS, controlIds: ['sourceOn'] },
    {
      id: 'switch',
      label: 'Service switch',
      progress: SWITCH_PROGRESS,
      controlIds: ['switchClosed'],
    },
    {
      id: 'return',
      label: 'Return rail',
      progress: RETURN_PROGRESS,
      controlIds: ['returnClosed'],
    },
  ],
  'loopworks-02': [
    {
      id: 'stormglass',
      label: 'Stormglass',
      progress: NORTH_PROGRESS,
      controlIds: ['chargeLevel'],
    },
  ],
  'loopworks-03': [
    {
      id: 'junction',
      label: 'Junction',
      progress: NORTH_PROGRESS,
      controlIds: ['switchClosed', 'route'],
    },
    {
      id: 'return',
      label: 'Return gate',
      progress: RETURN_PROGRESS,
      controlIds: ['returnClosed'],
    },
  ],
  'loopworks-04': [
    {
      id: 'loop-gate',
      label: 'Loop gate',
      progress: SWITCH_PROGRESS,
      controlIds: ['switchClosed'],
    },
    {
      id: 'source',
      label: 'Source lift',
      progress: SOURCE_PROGRESS,
      controlIds: ['voltage'],
    },
    {
      id: 'constriction',
      label: 'Rail constriction',
      progress: NORTH_PROGRESS,
      controlIds: ['resistance'],
    },
  ],
  'converter-05': [
    {
      id: 'intake',
      label: 'Intake',
      progress: SOURCE_PROGRESS,
      controlIds: ['phaseTrim'],
    },
    {
      id: 'rectifier',
      label: 'Rectifier',
      progress: NORTH_PROGRESS,
      controlIds: ['rectifierOn'],
    },
    {
      id: 'output',
      label: 'Output stage',
      progress: LOAD_PROGRESS,
      controlIds: ['smoothingOn', 'regulatorOn'],
    },
  ],
  'converter-06': [
    {
      id: 'module-rack',
      label: 'Module rack',
      progress: SOURCE_PROGRESS,
      controlIds: ['adapter'],
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      progress: NORTH_PROGRESS,
      controlIds: ['diagnose'],
    },
    {
      id: 'dock',
      label: 'Adapter dock',
      progress: LOAD_PROGRESS,
      controlIds: ['dock'],
    },
  ],
  'converter-07': [
    {
      id: 'market',
      label: 'Market board',
      progress: NORTH_PROGRESS,
      controlIds: ['loadCount', 'lampTech'],
    },
    {
      id: 'shift-clock',
      label: 'Shift clock',
      progress: RETURN_PROGRESS,
      controlIds: ['advanceShift'],
    },
  ],
  'gridfall-08': [
    {
      id: 'path-bench',
      label: 'Path bench',
      progress: NORTH_PROGRESS,
      controlIds: ['material', 'path'],
    },
    {
      id: 'leakage-panel',
      label: 'Leakage panel',
      progress: RETURN_PROGRESS,
      controlIds: ['protectionArmed', 'testPath'],
    },
  ],
  'gridfall-09': [
    {
      id: 'generator-loop',
      label: 'Generator loop',
      progress: SWITCH_PROGRESS,
      controlIds: ['loopClosed'],
    },
    {
      id: 'rotor',
      label: 'Rotor',
      progress: NORTH_PROGRESS,
      controlIds: ['motion', 'field'],
    },
    {
      id: 'load-bank',
      label: 'Load bank',
      progress: LOAD_PROGRESS,
      controlIds: ['load'],
    },
  ],
  'gridfall-10': [
    {
      id: 'longline',
      label: 'Longline controls',
      progress: NORTH_PROGRESS,
      controlIds: ['lineVoltage', 'demand'],
    },
    {
      id: 'transformer',
      label: 'City transformer',
      progress: LOAD_PROGRESS,
      controlIds: ['transformerOn'],
    },
  ],
  'gridfall-11': [
    {
      id: 'fault-bench',
      label: 'Fault bench',
      progress: NORTH_PROGRESS,
      controlIds: ['fault'],
    },
    {
      id: 'watchers',
      label: 'Protection watchers',
      progress: LOAD_PROGRESS,
      controlIds: ['breakerOn', 'gfciOn'],
    },
    {
      id: 'test-console',
      label: 'Test console',
      progress: RETURN_PROGRESS,
      controlIds: ['testProtection', 'resetProtection'],
    },
  ],
  'gridfall-12': [
    {
      id: 'generation',
      label: 'Generation',
      progress: SOURCE_PROGRESS,
      controlIds: ['generation'],
    },
    {
      id: 'transmission',
      label: 'Transmission',
      progress: NORTH_PROGRESS,
      controlIds: ['transmissionHigh'],
    },
    {
      id: 'distribution',
      label: 'Distribution',
      progress: LOAD_PROGRESS,
      controlIds: ['feederCapacity', 'serviceDemand', 'priorityRoute'],
    },
    {
      id: 'city-protection',
      label: 'City protection',
      progress: RETURN_PROGRESS,
      controlIds: ['protectionArmed'],
    },
  ],
};

export function wrapProgress(progress: number) {
  return ((progress % 1) + 1) % 1;
}

export function progressDistance(from: number, to: number) {
  const forward = wrapProgress(to - from);
  return Math.abs(forward > 0.5 ? forward - 1 : forward);
}

function progressDelta(from: number, to: number) {
  const forward = wrapProgress(to - from);
  return forward > 0.5 ? forward - 1 : forward;
}

export function getStation(
  mission: MissionId,
  stationId: InteractionStationId,
): InteractionStation {
  const station = interactionStations[mission].find((candidate) => candidate.id === stationId);
  if (!station) {
    throw new Error(`Station ${stationId} is not part of ${missionById[mission].title}.`);
  }
  return station;
}

export function getStationForControl(
  mission: MissionId,
  controlId: string,
): InteractionStation {
  const station = interactionStations[mission].find((candidate) =>
    candidate.controlIds.includes(controlId),
  );
  if (!station) {
    throw new Error(`Control ${controlId} has no station in ${missionById[mission].title}.`);
  }
  return station;
}

export function getNearbyStation(
  mission: MissionId,
  progress: number,
  previousStation: InteractionStationId | null,
): InteractionStation | null {
  if (previousStation) {
    const previous = interactionStations[mission].find(
      (station) => station.id === previousStation,
    );
    if (previous && progressDistance(progress, previous.progress) <= INTERACTION_EXIT_RANGE) {
      return previous;
    }
  }

  let nearest: InteractionStation | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const station of interactionStations[mission]) {
    const distance = progressDistance(progress, station.progress);
    if (distance < nearestDistance) {
      nearest = station;
      nearestDistance = distance;
    }
  }
  return nearest && nearestDistance <= INTERACTION_ENTER_RANGE ? nearest : null;
}

export function moveTowardProgress(
  current: number,
  target: number,
  maximumStep: number,
): { progress: number; arrived: boolean } {
  const difference = progressDelta(current, target);
  if (Math.abs(difference) <= maximumStep) {
    return {
      progress: Math.round(wrapProgress(target) * 1_000_000) / 1_000_000,
      arrived: true,
    };
  }
  const progress = wrapProgress(current + Math.sign(difference) * maximumStep);
  return {
    progress: Math.round(progress * 1_000_000) / 1_000_000,
    arrived: false,
  };
}
