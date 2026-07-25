import { describe, expect, it } from 'vitest';
import { districts } from '../content/districts';
import {
  createPresentationState,
  getContextualFlow,
  transitionPresentation,
} from './presentation';

describe('Gridkeeper presentation journey', () => {
  it('moves from onboarding through travel, arrival, and station entry', () => {
    let presentation = createPresentationState(false);
    expect(presentation.mode).toBe('onboarding');

    presentation = transitionPresentation(presentation, { type: 'START' });
    expect(presentation.mode).toBe('exploring');

    presentation = transitionPresentation(presentation, { type: 'SET_DESTINATION', district: 'workshop' });
    expect(presentation).toMatchObject({ mode: 'travelling', destinationDistrict: 'workshop' });

    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: 'workshop' });
    expect(presentation).toMatchObject({ mode: 'station-ready', stationDistrict: 'workshop' });

    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'workshop', phaseIndex: 0 });
    expect(presentation).toMatchObject({ mode: 'station-active', stationDistrict: 'workshop', phaseIndex: 0 });
  });

  it('acknowledges each solved phase before advancing', () => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });
    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: 'workshop' });
    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'workshop', phaseIndex: 0 });

    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 0 });
    expect(presentation).toMatchObject({ mode: 'phase-complete', phaseIndex: 0 });

    presentation = transitionPresentation(presentation, { type: 'CONTINUE_PHASE', phaseIndex: 1 });
    expect(presentation).toMatchObject({ mode: 'station-active', phaseIndex: 1 });

    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 1 });
    presentation = transitionPresentation(presentation, { type: 'CONTINUE_PHASE', phaseIndex: 2 });
    expect(presentation).toMatchObject({ mode: 'station-active', phaseIndex: 2 });
  });

  it('turns a final challenge into a dedicated station-restored state and next route', () => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });
    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: 'workshop' });
    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'workshop', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, {
      type: 'RESTORE_STATION',
      district: 'workshop',
      islandComplete: false,
    });

    expect(presentation).toMatchObject({
      mode: 'station-restored',
      restoredDistrict: 'workshop',
      nextDistrict: 'converter',
      islandComplete: false,
    });

    presentation = transitionPresentation(presentation, { type: 'RETURN_AND_TRAVEL' });
    expect(presentation).toMatchObject({ mode: 'travelling', destinationDistrict: 'converter' });
  });

  it.each(districts)('restores $name through the same explicit final-challenge handoff', (district) => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });
    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: district.id });
    presentation = transitionPresentation(presentation, {
      type: 'ENTER_STATION',
      district: district.id,
      phaseIndex: 2,
    });
    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, {
      type: 'RESTORE_STATION',
      district: district.id,
      islandComplete: district.id === 'harbor',
    });

    const districtIndex = districts.findIndex((candidate) => candidate.id === district.id);
    expect(presentation).toMatchObject({
      mode: 'station-restored',
      restoredDistrict: district.id,
      nextDistrict: districtIndex === districts.length - 1 ? null : districts[districtIndex + 1].id,
      islandComplete: district.id === 'harbor',
    });
  });

  it('carries one uninterrupted journey from the first station to the restored-island sandbox', () => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });

    districts.forEach((district, index) => {
      presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: district.id });
      presentation = transitionPresentation(presentation, {
        type: 'ENTER_STATION',
        district: district.id,
        phaseIndex: 2,
      });
      presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 2 });
      presentation = transitionPresentation(presentation, {
        type: 'RESTORE_STATION',
        district: district.id,
        islandComplete: index === districts.length - 1,
      });

      if (index < districts.length - 1) {
        presentation = transitionPresentation(presentation, { type: 'RETURN_AND_TRAVEL' });
        expect(presentation).toMatchObject({
          mode: 'travelling',
          destinationDistrict: districts[index + 1].id,
        });
      }
    });

    presentation = transitionPresentation(presentation, { type: 'RETURN_TO_ISLAND' });
    expect(presentation.mode).toBe('island-restored');
    presentation = transitionPresentation(presentation, { type: 'EXPLORE_SANDBOX' });
    expect(presentation.mode).toBe('sandbox');
  });

  it('turns the final restoration into an explicit island finale and sandbox choice', () => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });
    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: 'harbor' });
    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'harbor', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, {
      type: 'RESTORE_STATION',
      district: 'harbor',
      islandComplete: true,
    });
    expect(presentation).toMatchObject({
      mode: 'station-restored',
      restoredDistrict: 'harbor',
      nextDistrict: null,
      islandComplete: true,
    });

    presentation = transitionPresentation(presentation, { type: 'RETURN_TO_ISLAND' });
    expect(presentation.mode).toBe('island-restored');

    presentation = transitionPresentation(presentation, { type: 'EXPLORE_SANDBOX' });
    expect(presentation.mode).toBe('sandbox');
  });

  it('does not replay the finale when opening an already completed save', () => {
    let presentation = createPresentationState(true);
    expect(presentation).toMatchObject({ mode: 'onboarding', completedSave: true });

    presentation = transitionPresentation(presentation, { type: 'START' });
    expect(presentation.mode).toBe('sandbox');
  });

  it('handles interrupted travel, early exits, and repeated restore events safely', () => {
    let presentation = transitionPresentation(createPresentationState(false), { type: 'START' });
    presentation = transitionPresentation(presentation, { type: 'SET_DESTINATION', district: 'converter' });
    presentation = transitionPresentation(presentation, { type: 'INTERRUPT_TRAVEL' });
    expect(presentation).toMatchObject({ mode: 'exploring', destinationDistrict: null });

    presentation = transitionPresentation(presentation, { type: 'ARRIVE', district: 'workshop' });
    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'workshop', phaseIndex: 1 });
    presentation = transitionPresentation(presentation, { type: 'CLOSE_STATION' });
    expect(presentation).toMatchObject({ mode: 'station-ready', stationDistrict: 'workshop' });

    presentation = transitionPresentation(presentation, { type: 'ENTER_STATION', district: 'workshop', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, { type: 'SOLVE_PHASE', phaseIndex: 2 });
    presentation = transitionPresentation(presentation, {
      type: 'RESTORE_STATION',
      district: 'workshop',
      islandComplete: false,
    });
    const restored = presentation;
    presentation = transitionPresentation(presentation, {
      type: 'RESTORE_STATION',
      district: 'workshop',
      islandComplete: false,
    });
    expect(presentation).toEqual(restored);
  });
});

describe('contextual Show flow explanations', () => {
  it('provides one plain-language explanation and no more than two signals per district', () => {
    for (const district of districts) {
      const flow = getContextualFlow(district.id);
      expect(flow.title.length).toBeGreaterThan(0);
      expect(flow.explanation.length).toBeGreaterThan(0);
      expect(flow.signals.length).toBeGreaterThan(0);
      expect(flow.signals.length).toBeLessThanOrEqual(2);
      expect(flow.explanation).not.toContain('—');
    }
  });
});
