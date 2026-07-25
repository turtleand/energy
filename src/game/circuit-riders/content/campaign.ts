export type ActId = 'loopworks' | 'converter' | 'gridfall';

export type MissionId =
  | 'loopworks-01'
  | 'loopworks-02'
  | 'loopworks-03'
  | 'loopworks-04'
  | 'converter-05'
  | 'converter-06'
  | 'converter-07'
  | 'gridfall-08'
  | 'gridfall-09'
  | 'gridfall-10'
  | 'gridfall-11'
  | 'gridfall-12';

export type VisualKind =
  | 'loop'
  | 'static'
  | 'junction'
  | 'resistance'
  | 'converter'
  | 'adapter'
  | 'energy'
  | 'paths'
  | 'generator'
  | 'transformer'
  | 'protection'
  | 'city';

export type MissionControlDefinition =
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
      options: Array<{ label: string; value: string }>;
      hint: string;
    }
  | {
      id: string;
      kind: 'action';
      label: string;
      action: string;
      hint: string;
    };

export interface MissionDefinition {
  id: MissionId;
  act: ActId;
  order: number;
  title: string;
  shortTitle: string;
  place: string;
  lessonSlug: string;
  summary: string;
  objective: string;
  steps: string[];
  controls: MissionControlDefinition[];
  visualKind: VisualKind;
  accent: number;
  accentCss: string;
  mapPosition: { x: number; y: number };
  reuses: string[];
  isFinale?: boolean;
}

export interface ActDefinition {
  id: ActId;
  order: number;
  title: string;
  subtitle: string;
  missionIds: MissionId[];
}

export const acts: ActDefinition[] = [
  {
    id: 'loopworks',
    order: 1,
    title: 'Act I: Loopworks',
    subtitle: 'Wake the maintenance line and learn how a complete path behaves.',
    missionIds: ['loopworks-01', 'loopworks-02', 'loopworks-03', 'loopworks-04'],
  },
  {
    id: 'converter',
    order: 2,
    title: 'Act II: Converter Run',
    subtitle: 'Shape power for real loads, then keep a night market inside its energy window.',
    missionIds: ['converter-05', 'converter-06', 'converter-07'],
  },
  {
    id: 'gridfall',
    order: 3,
    title: 'Act III: Gridfall',
    subtitle: 'Restore generation, transmission, protection, and the connected city.',
    missionIds: ['gridfall-08', 'gridfall-09', 'gridfall-10', 'gridfall-11', 'gridfall-12'],
  },
];

export const missions: MissionDefinition[] = [
  {
    id: 'loopworks-01',
    act: 'loopworks',
    order: 1,
    title: 'The Missing Return',
    shortTitle: 'Return',
    place: 'Loopworks landing',
    lessonSlug: 'lesson-1-electricity-from-first-principles',
    summary: 'A source is available, but the work light stays dark until the rail becomes one complete loop.',
    objective: 'Wake the source, close the switch, and restore the return rail.',
    steps: ['Wake the source', 'Close the service switch', 'Complete the return path'],
    visualKind: 'loop',
    accent: 0xf3a531,
    accentCss: '#f3a531',
    mapPosition: { x: 0.12, y: 0.72 },
    reuses: ['closed-loop'],
    controls: [
      {
        id: 'sourceOn',
        kind: 'toggle',
        label: 'Field source',
        onLabel: 'Source awake',
        offLabel: 'Source sleeping',
        hint: 'The source establishes electrical potential around the loop.',
      },
      {
        id: 'switchClosed',
        kind: 'toggle',
        label: 'Service switch',
        onLabel: 'Switch closed',
        offLabel: 'Switch open',
        hint: 'An open switch interrupts the whole path.',
      },
      {
        id: 'returnClosed',
        kind: 'toggle',
        label: 'Return rail',
        onLabel: 'Return connected',
        offLabel: 'Return broken',
        hint: 'Maintained current needs a way back to the source.',
      },
    ],
  },
  {
    id: 'loopworks-02',
    act: 'loopworks',
    order: 2,
    title: 'Stormglass',
    shortTitle: 'Static',
    place: 'Stormglass gallery',
    lessonSlug: 'lesson-2-static-charge-buildup',
    summary: 'Separated charge is collecting on the stormglass, waiting for one brief path back to balance.',
    objective: 'Build the imbalance to its threshold and observe one controlled discharge.',
    steps: ['Separate charge', 'Reach the threshold', 'Watch the brief reset'],
    visualKind: 'static',
    accent: 0xf7c65c,
    accentCss: '#f7c65c',
    mapPosition: { x: 0.25, y: 0.55 },
    reuses: ['closed-loop'],
    controls: [
      {
        id: 'chargeLevel',
        kind: 'action',
        label: 'Sweep the stormglass',
        action: 'charge-static',
        hint: 'Each sweep separates more charge until a brief discharge restores balance.',
      },
    ],
  },
  {
    id: 'loopworks-03',
    act: 'loopworks',
    order: 3,
    title: 'Junction Zero',
    shortTitle: 'Junction',
    place: 'Loopworks junction',
    lessonSlug: 'lesson-3-simple-circuits-from-first-principles',
    summary: 'A damaged junction can send the path through the load, into a dead end, or toward an unintended branch.',
    objective: 'Route the source through the signal lamp and back by the intended return.',
    steps: ['Close the junction switch', 'Choose the load path', 'Restore the return rail'],
    visualKind: 'junction',
    accent: 0x57a98a,
    accentCss: '#57a98a',
    mapPosition: { x: 0.38, y: 0.7 },
    reuses: ['closed-loop'],
    controls: [
      {
        id: 'switchClosed',
        kind: 'toggle',
        label: 'Junction switch',
        onLabel: 'Switch closed',
        offLabel: 'Switch open',
        hint: 'The switch decides whether the source can maintain a path.',
      },
      {
        id: 'route',
        kind: 'choice',
        label: 'Junction route',
        options: [
          { label: 'Dead-end spur', value: 'broken' },
          { label: 'Signal lamp', value: 'load' },
          { label: 'Unintended branch', value: 'fault' },
        ],
        hint: 'Useful flow belongs on the intended path through the load.',
      },
      {
        id: 'returnClosed',
        kind: 'toggle',
        label: 'Return gate',
        onLabel: 'Return connected',
        offLabel: 'Return missing',
        hint: 'The return completes the maintained loop.',
      },
    ],
  },
  {
    id: 'loopworks-04',
    act: 'loopworks',
    order: 4,
    title: 'The Narrow Rail',
    shortTitle: 'Flow',
    place: 'Loopworks heat tunnel',
    lessonSlug: 'lesson-4-ohms-law-without-formula-fear',
    summary: 'The tunnel light needs enough electrical push, but its narrow rail resists flow and warms under strain.',
    objective: 'Find a bright, steady operating band without overheating the rail.',
    steps: ['Close the loop', 'Raise the source lift', 'Ease the rail constriction'],
    visualKind: 'resistance',
    accent: 0xf08b4b,
    accentCss: '#f08b4b',
    mapPosition: { x: 0.48, y: 0.47 },
    reuses: ['closed-loop', 'voltage-current-resistance'],
    controls: [
      {
        id: 'switchClosed',
        kind: 'toggle',
        label: 'Tunnel loop',
        onLabel: 'Loop closed',
        offLabel: 'Loop open',
        hint: 'No maintained current crosses an open loop.',
      },
      {
        id: 'voltage',
        kind: 'range',
        label: 'Source lift',
        min: 3,
        max: 12,
        step: 1,
        unit: ' lift',
        hint: 'More lift can drive more current through the same resistance.',
      },
      {
        id: 'resistance',
        kind: 'range',
        label: 'Rail constriction',
        min: 2,
        max: 16,
        step: 1,
        unit: ' drag',
        hint: 'More opposition reduces flow and changes how much heat the path develops.',
      },
    ],
  },
  {
    id: 'converter-05',
    act: 'converter',
    order: 5,
    title: 'Wave Tamer',
    shortTitle: 'Convert',
    place: 'Converter Run intake',
    lessonSlug: 'lesson-5-dc-vs-ac',
    summary: 'The intake rail reverses direction. The survey beacon needs a one-way, smooth, steady supply.',
    objective: 'Trim, rectify, smooth, and regulate the reversing supply.',
    steps: ['Align the intake phase', 'Rectify the wave', 'Smooth and regulate the output'],
    visualKind: 'converter',
    accent: 0x4aaed1,
    accentCss: '#4aaed1',
    mapPosition: { x: 0.58, y: 0.26 },
    reuses: ['closed-loop', 'conversion'],
    controls: [
      {
        id: 'phaseTrim',
        kind: 'range',
        label: 'Intake phase trim',
        min: 0,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'Center the reversing pattern before it enters the conversion stages.',
      },
      {
        id: 'rectifierOn',
        kind: 'toggle',
        label: 'Rectifier bridge',
        onLabel: 'One-way pulses',
        offLabel: 'Reversing AC',
        hint: 'Rectification redirects both halves into one direction.',
      },
      {
        id: 'smoothingOn',
        kind: 'toggle',
        label: 'Smoothing bank',
        onLabel: 'Ripple reduced',
        offLabel: 'Output pulsing',
        hint: 'Stored energy fills the gaps between rectified pulses.',
      },
      {
        id: 'regulatorOn',
        kind: 'toggle',
        label: 'Output regulator',
        onLabel: 'Output steady',
        offLabel: 'Output wandering',
        hint: 'Regulation keeps the final output inside the beacon band.',
      },
    ],
  },
  {
    id: 'converter-06',
    act: 'converter',
    order: 6,
    title: 'Docking Protocol',
    shortTitle: 'Adapter',
    place: 'Converter Run service dock',
    lessonSlug: 'lesson-6-power-adapter-labels',
    summary: 'Several modules fit the bench, but only one matches the beacon supply kind, voltage, polarity, and current need.',
    objective: 'Let diagnostics refuse a mismatch, then dock the compatible module.',
    steps: ['Test an unsafe match', 'Select enough capacity', 'Dock the compatible module'],
    visualKind: 'adapter',
    accent: 0x6eb6a1,
    accentCss: '#6eb6a1',
    mapPosition: { x: 0.7, y: 0.42 },
    reuses: ['conversion', 'adapter-compatibility'],
    controls: [
      {
        id: 'adapter',
        kind: 'choice',
        label: 'Supply module',
        options: [
          { label: 'Wrong voltage module', value: 'wrong-voltage' },
          { label: 'Wrong polarity module', value: 'wrong-polarity' },
          { label: 'Not enough current capacity', value: 'low-current' },
          { label: 'Compatible 12 V DC module', value: 'compatible' },
        ],
        hint: 'Fit alone does not prove compatibility. The protected bench checks the full match.',
      },
      {
        id: 'diagnose',
        kind: 'action',
        label: 'Run protected diagnostic',
        action: 'diagnose-adapter',
        hint: 'The diagnostic blocks incompatible modules before the model load energizes.',
      },
      {
        id: 'dock',
        kind: 'action',
        label: 'Dock selected module',
        action: 'dock-adapter',
        hint: 'Docking succeeds only after the model confirms a compatible supply.',
      },
    ],
  },
  {
    id: 'converter-07',
    act: 'converter',
    order: 7,
    title: 'Night Shift',
    shortTitle: 'Energy',
    place: 'Converter Run night market',
    lessonSlug: 'lesson-7-power-energy-bills',
    summary: 'The market needs bright stalls now, while its energy ribbon grows for as long as the lights remain on.',
    objective: 'Serve six stalls through the full shift without crossing the energy ribbon.',
    steps: ['Set the active load', 'Choose efficient lamps', 'Run the night shift'],
    visualKind: 'energy',
    accent: 0xf1ad4a,
    accentCss: '#f1ad4a',
    mapPosition: { x: 0.82, y: 0.61 },
    reuses: ['closed-loop', 'power-and-energy'],
    controls: [
      {
        id: 'loadCount',
        kind: 'range',
        label: 'Open stalls',
        min: 2,
        max: 10,
        step: 1,
        unit: ' stalls',
        hint: 'More simultaneous loads increase the immediate power draw.',
      },
      {
        id: 'lampTech',
        kind: 'choice',
        label: 'Market lamps',
        options: [
          { label: 'Filament lamps', value: 'filament' },
          { label: 'Efficient warm lamps', value: 'efficient' },
        ],
        hint: 'Both make light, but they leave different heat and energy trails.',
      },
      {
        id: 'advanceShift',
        kind: 'action',
        label: 'Run two shift hours',
        action: 'advance-shift',
        hint: 'Energy accumulates while the current power draw continues.',
      },
    ],
  },
  {
    id: 'gridfall-08',
    act: 'gridfall',
    order: 8,
    title: 'The Stray Path',
    shortTitle: 'Paths',
    place: 'Gridfall floodgate',
    lessonSlug: 'lesson-8-conductors-insulators-grounding-safety',
    summary: 'A damaged model branch is pulling flow away from its intended rail. Protection needs a clear signal before reset.',
    objective: 'Let protection observe the stray path, then restore the intended insulated route.',
    steps: ['Observe the unintended path', 'Trip the protected model branch', 'Restore the intended path'],
    visualKind: 'paths',
    accent: 0xe59b57,
    accentCss: '#e59b57',
    mapPosition: { x: 0.75, y: 0.8 },
    reuses: ['closed-loop', 'protection'],
    controls: [
      {
        id: 'material',
        kind: 'choice',
        label: 'Intended path core',
        options: [
          { label: 'Insulating core', value: 'insulator' },
          { label: 'Conducting core', value: 'conductor' },
        ],
        hint: 'The intended route needs a conductor, surrounded by insulation.',
      },
      {
        id: 'path',
        kind: 'choice',
        label: 'Diagnostic path',
        options: [
          { label: 'Intended return', value: 'intended' },
          { label: 'Unintended leakage', value: 'leak' },
          { label: 'Protective ground path', value: 'ground' },
        ],
        hint: 'Ground is an exceptional protection path, not a normal storage place or everyday return.',
      },
      {
        id: 'protectionArmed',
        kind: 'toggle',
        label: 'Leakage protection',
        onLabel: 'Protection watching',
        offLabel: 'Protection idle',
        hint: 'The model compares intended outgoing and returning current.',
      },
      {
        id: 'testPath',
        kind: 'action',
        label: 'Run path diagnostic',
        action: 'test-path',
        hint: 'This is an abstract diagnostic, not a real repair procedure.',
      },
    ],
  },
  {
    id: 'gridfall-09',
    act: 'gridfall',
    order: 9,
    title: 'Rotor Wake',
    shortTitle: 'Generator',
    place: 'Gridfall rotor hall',
    lessonSlug: 'lesson-9-generators-electromagnetic-induction',
    summary: 'Motion through a magnetic field wakes electrical push, and a connected load pushes back on the rotor.',
    objective: 'Bring the generator online without stalling the rotor.',
    steps: ['Close the generator loop', 'Raise motion and field', 'Balance electrical load'],
    visualKind: 'generator',
    accent: 0x63a9b9,
    accentCss: '#63a9b9',
    mapPosition: { x: 0.6, y: 0.72 },
    reuses: ['closed-loop', 'induction'],
    controls: [
      {
        id: 'loopClosed',
        kind: 'toggle',
        label: 'Generator loop',
        onLabel: 'Load connected',
        offLabel: 'Load disconnected',
        hint: 'Electrical push may appear before current reaches a connected load.',
      },
      {
        id: 'motion',
        kind: 'range',
        label: 'Rotor motion',
        min: 0.1,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'Faster change through the field creates more electrical push in this model.',
      },
      {
        id: 'field',
        kind: 'range',
        label: 'Magnetic field',
        min: 0.1,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'A stronger field increases the available induction.',
      },
      {
        id: 'load',
        kind: 'range',
        label: 'Connected load',
        min: 0.2,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'A heavier electrical load creates more mechanical opposition.',
      },
    ],
  },
  {
    id: 'gridfall-10',
    act: 'gridfall',
    order: 10,
    title: 'Longline',
    shortTitle: 'Transform',
    place: 'Gridfall transmission span',
    lessonSlug: 'lesson-10-why-ac-won-the-grid-transformers-voltage-heat-loss',
    summary: 'The same delivery can cross the long span with fewer flow markers and less heat when line voltage is raised.',
    objective: 'Send power efficiently, then step the voltage down before the city.',
    steps: ['Raise transmission voltage', 'Reduce line current and heat', 'Enable the city transformer'],
    visualKind: 'transformer',
    accent: 0xf4c05b,
    accentCss: '#f4c05b',
    mapPosition: { x: 0.46, y: 0.5 },
    reuses: ['closed-loop', 'transmission'],
    controls: [
      {
        id: 'lineVoltage',
        kind: 'choice',
        label: 'Transmission level',
        options: [
          { label: 'Low line voltage', value: 'low' },
          { label: 'High line voltage', value: 'high' },
        ],
        hint: 'For the same delivery, higher voltage allows lower current in the line.',
      },
      {
        id: 'demand',
        kind: 'range',
        label: 'City demand',
        min: 0.4,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'Hold demand steady while comparing line current and heat.',
      },
      {
        id: 'transformerOn',
        kind: 'toggle',
        label: 'City transformer',
        onLabel: 'Voltage stepped down',
        offLabel: 'Step-down missing',
        hint: 'The long-line voltage must be transformed before local distribution.',
      },
    ],
  },
  {
    id: 'gridfall-11',
    act: 'gridfall',
    order: 11,
    title: 'Two Watchers',
    shortTitle: 'Protection',
    place: 'Gridfall protection house',
    lessonSlug: 'lesson-11-house-wiring-faults-and-protection',
    summary: 'One watcher opens for too much current. The other opens when the intended return is missing.',
    objective: 'Prove both protections, clear the model fault, and reset the branch.',
    steps: ['Trip the breaker on overload', 'Trip the GFCI on missing return', 'Clear and reset'],
    visualKind: 'protection',
    accent: 0xef8c62,
    accentCss: '#ef8c62',
    mapPosition: { x: 0.33, y: 0.3 },
    reuses: ['closed-loop', 'protection'],
    controls: [
      {
        id: 'fault',
        kind: 'choice',
        label: 'Model fault',
        options: [
          { label: 'No fault', value: 'none' },
          { label: 'Overcurrent load', value: 'overload' },
          { label: 'Missing return current', value: 'leakage' },
        ],
        hint: 'Different protection devices watch different evidence.',
      },
      {
        id: 'breakerOn',
        kind: 'toggle',
        label: 'Overcurrent protection',
        onLabel: 'Breaker watching',
        offLabel: 'Breaker idle',
        hint: 'The breaker opens when current exceeds its model limit.',
      },
      {
        id: 'gfciOn',
        kind: 'toggle',
        label: 'Return-balance protection',
        onLabel: 'GFCI watching',
        offLabel: 'GFCI idle',
        hint: 'The GFCI opens when outgoing and returning current differ.',
      },
      {
        id: 'testProtection',
        kind: 'action',
        label: 'Test selected condition',
        action: 'test-protection',
        hint: 'The affected model branch opens when its watcher detects the selected condition.',
      },
      {
        id: 'resetProtection',
        kind: 'action',
        label: 'Reset protected branch',
        action: 'reset-protection',
        hint: 'Reset is accepted only after the model fault is cleared.',
      },
    ],
  },
  {
    id: 'gridfall-12',
    act: 'gridfall',
    order: 12,
    title: 'City of Loops',
    shortTitle: 'City',
    place: 'Gridfall control overlook',
    lessonSlug: 'lesson-12-neighborhood-distribution',
    summary: 'Generation, transmission, feeders, services, loads, and protection now share one changing city system.',
    objective: 'Balance the full city through a peak demand wave and complete Loop Patrol.',
    steps: [
      'Match generation to demand',
      'Use efficient transmission',
      'Balance feeder and service loads',
      'Keep protection armed',
    ],
    visualKind: 'city',
    accent: 0x4f9d78,
    accentCss: '#4f9d78',
    mapPosition: { x: 0.18, y: 0.46 },
    reuses: [
      'closed-loop',
      'conversion',
      'power-and-energy',
      'protection',
      'transmission',
      'distribution',
    ],
    isFinale: true,
    controls: [
      {
        id: 'generation',
        kind: 'range',
        label: 'Generation',
        min: 0.4,
        max: 1.2,
        step: 0.1,
        unit: '',
        hint: 'Generation must follow the changing demand without excessive strain.',
      },
      {
        id: 'transmissionHigh',
        kind: 'toggle',
        label: 'Transmission mode',
        onLabel: 'High voltage span',
        offLabel: 'Low voltage span',
        hint: 'The same delivery can cross the span with less current and heat.',
      },
      {
        id: 'feederCapacity',
        kind: 'range',
        label: 'Feeder capacity',
        min: 0.5,
        max: 1.2,
        step: 0.1,
        unit: '',
        hint: 'The feeder carries combined service demand, not one home alone.',
      },
      {
        id: 'serviceDemand',
        kind: 'range',
        label: 'Service demand',
        min: 0.3,
        max: 1,
        step: 0.1,
        unit: '',
        hint: 'Local demand changes while the shared feeder sees the combined total.',
      },
      {
        id: 'priorityRoute',
        kind: 'choice',
        label: 'Distribution route',
        options: [
          { label: 'Homes only', value: 'homes' },
          { label: 'Hospital only', value: 'hospital' },
          { label: 'Balanced city route', value: 'balanced' },
        ],
        hint: 'The final network must keep multiple branches supplied together.',
      },
      {
        id: 'protectionArmed',
        kind: 'toggle',
        label: 'City protection',
        onLabel: 'Protection coordinated',
        offLabel: 'Protection not ready',
        hint: 'Protection deliberately opens a faulted branch while healthy branches remain available.',
      },
    ],
  },
];

export const missionById = Object.fromEntries(
  missions.map((mission) => [mission.id, mission]),
) as Record<MissionId, MissionDefinition>;

export const lessonMissionMap = Object.fromEntries(
  missions.map((mission) => [mission.lessonSlug, mission.id]),
) as Record<string, MissionId>;

export const missionIds = missions.map((mission) => mission.id);

export const actById = Object.fromEntries(acts.map((act) => [act.id, act])) as Record<
  ActId,
  ActDefinition
>;
