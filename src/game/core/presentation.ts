import { districts, type DistrictId } from '../content/districts';

export type PresentationMode =
  | 'onboarding'
  | 'exploring'
  | 'travelling'
  | 'station-ready'
  | 'station-active'
  | 'phase-complete'
  | 'station-restored'
  | 'island-restored'
  | 'sandbox';

export interface PresentationState {
  mode: PresentationMode;
  completedSave: boolean;
  destinationDistrict: DistrictId | null;
  stationDistrict: DistrictId | null;
  restoredDistrict: DistrictId | null;
  nextDistrict: DistrictId | null;
  phaseIndex: number | null;
  islandComplete: boolean;
}

export type PresentationEvent =
  | { type: 'START' }
  | { type: 'SET_DESTINATION'; district: DistrictId }
  | { type: 'INTERRUPT_TRAVEL' }
  | { type: 'ARRIVE'; district: DistrictId }
  | { type: 'LEAVE_RING' }
  | { type: 'ENTER_STATION'; district: DistrictId; phaseIndex: number }
  | { type: 'SOLVE_PHASE'; phaseIndex: number }
  | { type: 'CONTINUE_PHASE'; phaseIndex: number }
  | { type: 'RESTORE_STATION'; district: DistrictId; islandComplete: boolean }
  | { type: 'CLOSE_STATION' }
  | { type: 'RETURN_TO_ISLAND' }
  | { type: 'RETURN_AND_TRAVEL' }
  | { type: 'EXPLORE_SANDBOX' }
  | { type: 'RESTART' };

export interface ContextualFlow {
  title: string;
  explanation: string;
  signals: string[];
}

const contextualFlows: Record<DistrictId, ContextualFlow> = {
  workshop: {
    title: 'Follow the complete loop',
    explanation: 'Current continues only when the source, path, load, and return form one unbroken loop.',
    signals: ['Complete return path', 'Current through the lamp'],
  },
  converter: {
    title: 'Watch the output take shape',
    explanation: 'The converter redirects the alternating input, smooths its pulses, and offers the voltage the device can accept.',
    signals: ['Direction and smoothness', 'Accepted voltage'],
  },
  wind: {
    title: 'Follow motion into electricity',
    explanation: 'Changing magnetic flux creates electrical push, while the connected load pushes back on the generator.',
    signals: ['Changing magnetic flux', 'Generator strain'],
  },
  longline: {
    title: 'Watch current and line heat',
    explanation: 'Transmitting the same power at higher voltage needs less current, so less energy becomes heat along the line.',
    signals: ['Line current', 'Heat along the route'],
  },
  lantern: {
    title: 'Follow power through time',
    explanation: 'Each lamp draws power now. Keeping the lamps on turns that rate into accumulated energy.',
    signals: ['Power now', 'Energy accumulated'],
  },
  harbor: {
    title: 'Watch the shared paths',
    explanation: 'Protection responds to its watched signal, while every home branch adds demand to the shared feeder.',
    signals: ['Protection signal', 'Combined feeder demand'],
  },
};

export function createPresentationState(completedSave: boolean): PresentationState {
  return {
    mode: 'onboarding',
    completedSave,
    destinationDistrict: null,
    stationDistrict: null,
    restoredDistrict: null,
    nextDistrict: null,
    phaseIndex: null,
    islandComplete: completedSave,
  };
}

export function getNextDistrict(district: DistrictId): DistrictId | null {
  const index = districts.findIndex((candidate) => candidate.id === district);
  return index >= 0 && index < districts.length - 1 ? districts[index + 1].id : null;
}

export function getContextualFlow(district: DistrictId): ContextualFlow {
  return contextualFlows[district];
}

export function transitionPresentation(
  state: PresentationState,
  event: PresentationEvent,
): PresentationState {
  switch (event.type) {
    case 'START':
      return {
        ...state,
        mode: state.completedSave ? 'sandbox' : 'exploring',
        destinationDistrict: null,
      };
    case 'SET_DESTINATION':
      return {
        ...state,
        mode: 'travelling',
        destinationDistrict: event.district,
        stationDistrict: null,
      };
    case 'INTERRUPT_TRAVEL':
      if (state.mode !== 'travelling') return state;
      return { ...state, mode: 'exploring', destinationDistrict: null };
    case 'ARRIVE':
      return {
        ...state,
        mode: 'station-ready',
        destinationDistrict: null,
        stationDistrict: event.district,
      };
    case 'LEAVE_RING':
      if (state.mode === 'onboarding' || state.mode === 'island-restored') return state;
      return {
        ...state,
        mode: state.islandComplete ? 'sandbox' : 'exploring',
        destinationDistrict: null,
        stationDistrict: null,
      };
    case 'ENTER_STATION':
      return {
        ...state,
        mode: 'station-active',
        destinationDistrict: null,
        stationDistrict: event.district,
        phaseIndex: event.phaseIndex,
      };
    case 'SOLVE_PHASE':
      if (state.mode !== 'station-active' || state.phaseIndex !== event.phaseIndex) return state;
      return { ...state, mode: 'phase-complete' };
    case 'CONTINUE_PHASE':
      if (state.mode !== 'phase-complete') return state;
      return { ...state, mode: 'station-active', phaseIndex: event.phaseIndex };
    case 'RESTORE_STATION':
      if (state.mode === 'station-restored' && state.restoredDistrict === event.district) return state;
      if (state.mode !== 'phase-complete' || state.phaseIndex !== 2) return state;
      return {
        ...state,
        mode: 'station-restored',
        destinationDistrict: null,
        stationDistrict: event.district,
        restoredDistrict: event.district,
        nextDistrict: event.islandComplete ? null : getNextDistrict(event.district),
        islandComplete: event.islandComplete,
      };
    case 'CLOSE_STATION':
      if (state.mode === 'station-restored') {
        return {
          ...state,
          mode: state.islandComplete ? 'island-restored' : 'exploring',
          stationDistrict: null,
        };
      }
      if (state.mode !== 'station-active' && state.mode !== 'phase-complete') return state;
      return { ...state, mode: 'station-ready', phaseIndex: null };
    case 'RETURN_TO_ISLAND':
      if (state.mode !== 'station-restored') return state;
      return {
        ...state,
        mode: state.islandComplete ? 'island-restored' : 'exploring',
        stationDistrict: null,
      };
    case 'RETURN_AND_TRAVEL':
      if (state.mode !== 'station-restored' || !state.nextDistrict) return state;
      return {
        ...state,
        mode: 'travelling',
        destinationDistrict: state.nextDistrict,
        stationDistrict: null,
      };
    case 'EXPLORE_SANDBOX':
      if (!state.islandComplete) return state;
      return { ...state, mode: 'sandbox', stationDistrict: null };
    case 'RESTART':
      return createPresentationState(false);
  }
}
