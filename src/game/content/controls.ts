import type { DistrictId } from './districts';

export interface ChoiceOption {
  label: string;
  value: string;
}

export type ControlDefinition =
  | {
      id: string;
      kind: 'toggle';
      label: string;
      onLabel: string;
      offLabel: string;
      hint: string;
    }
  | {
      id: string;
      kind: 'range';
      label: string;
      min: number;
      max: number;
      step: number;
      unit: string;
      hint: string;
    }
  | {
      id: string;
      kind: 'choice';
      label: string;
      options: ChoiceOption[];
      hint: string;
    }
  | {
      id: string;
      kind: 'action';
      label: string;
      action: 'charge-static' | 'run-diagnostic' | 'advance-evening';
      hint: string;
    };

export const districtControls: Record<DistrictId, ControlDefinition[]> = {
  workshop: [
    {
      id: 'loopClosed',
      kind: 'toggle',
      label: 'Workshop loop',
      onLabel: 'Loop closed',
      offLabel: 'Loop open',
      hint: 'A maintained current needs a complete path.',
    },
    {
      id: 'voltage',
      kind: 'range',
      label: 'Source push',
      min: 3,
      max: 12,
      step: 1,
      unit: ' push',
      hint: 'More electrical push can drive more current through the same path.',
    },
    {
      id: 'resistance',
      kind: 'range',
      label: 'Path resistance',
      min: 2,
      max: 12,
      step: 1,
      unit: ' drag',
      hint: 'More resistance limits the rate of charge flow.',
    },
    {
      id: 'staticCharge',
      kind: 'action',
      label: 'Rub storm vane',
      action: 'charge-static',
      hint: 'Separated charge builds, then releases in one brief event.',
    },
  ],
  converter: [
    {
      id: 'adapterMatch',
      kind: 'choice',
      label: 'Radio module',
      options: [
        { label: 'Mismatched module', value: 'wrong' },
        { label: 'Compatible module', value: 'correct' },
      ],
      hint: 'The bench checks supply kind and compatibility before energizing the model device.',
    },
    {
      id: 'diagnostic',
      kind: 'action',
      label: 'Run diagnostic',
      action: 'run-diagnostic',
      hint: 'Try the selected module at the protected bench.',
    },
    {
      id: 'rectifierOn',
      kind: 'toggle',
      label: 'Rectifier stage',
      onLabel: 'One-way pulses',
      offLabel: 'Reversing AC',
      hint: 'Rectification turns a reversing wave into one-way pulses.',
    },
    {
      id: 'smoothingOn',
      kind: 'toggle',
      label: 'Smoothing stage',
      onLabel: 'Output smoothed',
      offLabel: 'Output rough',
      hint: 'Smoothing makes the one-way output steadier.',
    },
  ],
  wind: [
    {
      id: 'loopClosed',
      kind: 'toggle',
      label: 'Ridge loop',
      onLabel: 'Load connected',
      offLabel: 'Load disconnected',
      hint: 'The generator can create push before useful current reaches a load.',
    },
    {
      id: 'windStrength',
      kind: 'range',
      label: 'Wind strength',
      min: 0.1,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'Faster motion changes magnetic flux more quickly.',
    },
    {
      id: 'fieldStrength',
      kind: 'range',
      label: 'Magnetic field',
      min: 0.1,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'A stronger field increases the available induction in this simplified model.',
    },
    {
      id: 'loadDemand',
      kind: 'range',
      label: 'Connected load',
      min: 0.2,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'More electrical load pushes back as mechanical strain.',
    },
  ],
  longline: [
    {
      id: 'transmissionVoltage',
      kind: 'choice',
      label: 'Line voltage',
      options: [
        { label: 'Low line voltage', value: 'low' },
        { label: 'High line voltage', value: 'high' },
      ],
      hint: 'For the same delivery, higher voltage allows less current in the long line.',
    },
    {
      id: 'demand',
      kind: 'range',
      label: 'Town demand',
      min: 0.45,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'Demand stays the same while you compare line current and heating.',
    },
    {
      id: 'transformerOn',
      kind: 'toggle',
      label: 'Town transformer',
      onLabel: 'Voltage stepped down',
      offLabel: 'Step-down missing',
      hint: 'The transmission voltage must be changed before the town load.',
    },
  ],
  lantern: [
    {
      id: 'lampTech',
      kind: 'choice',
      label: 'Market lamps',
      options: [
        { label: 'Filament lamps', value: 'filament' },
        { label: 'Warm efficient lamps', value: 'warm-led' },
      ],
      hint: 'Both can make light, but they draw different power and waste different amounts as heat.',
    },
    {
      id: 'lampCount',
      kind: 'range',
      label: 'Lit stalls',
      min: 2,
      max: 10,
      step: 1,
      unit: ' stalls',
      hint: 'More simultaneous loads increase power draw.',
    },
    {
      id: 'eveningClock',
      kind: 'action',
      label: 'Run two evening hours',
      action: 'advance-evening',
      hint: 'Energy accumulates while power is being used.',
    },
  ],
  harbor: [
    {
      id: 'material',
      kind: 'choice',
      label: 'Model feeder material',
      options: [
        { label: 'Insulating path', value: 'rubber' },
        { label: 'Conducting path', value: 'copper' },
      ],
      hint: 'Useful current needs a conducting path. Insulation belongs around it, not in place of it.',
    },
    {
      id: 'groundProtectionOn',
      kind: 'toggle',
      label: 'Leakage protection',
      onLabel: 'Protection watching',
      offLabel: 'Protection off',
      hint: 'The model device compares intended and unintended current paths.',
    },
    {
      id: 'insulationState',
      kind: 'choice',
      label: 'Branch insulation',
      options: [
        { label: 'Damaged model fault', value: 'damaged' },
        { label: 'Insulation restored', value: 'sound' },
      ],
      hint: 'This is a simplified diagnostic model, not a repair procedure.',
    },
    {
      id: 'homeLoad',
      kind: 'range',
      label: 'Combined home load',
      min: 0.35,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'Many local branches add up at the neighborhood feeder.',
    },
    {
      id: 'feederCapacity',
      kind: 'range',
      label: 'Feeder capacity',
      min: 0.5,
      max: 1,
      step: 0.05,
      unit: '',
      hint: 'The feeder must carry the combined neighborhood load with some margin.',
    },
  ],
};
