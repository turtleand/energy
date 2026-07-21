export type DistrictId = 'workshop' | 'converter' | 'wind' | 'longline' | 'lantern' | 'harbor';

export type LessonId =
  | 'lesson-1'
  | 'lesson-2'
  | 'lesson-3'
  | 'lesson-4'
  | 'lesson-5'
  | 'lesson-6'
  | 'lesson-7'
  | 'lesson-8'
  | 'lesson-9'
  | 'lesson-10'
  | 'lesson-11'
  | 'lesson-12';

export interface LessonMechanic {
  slug: string;
  district: DistrictId;
  intuition: string;
  mechanic: string;
  visibleSignal: string;
}

export const lessonMechanicMap: Record<LessonId, LessonMechanic> = {
  'lesson-1': {
    slug: 'lesson-1-electricity-from-first-principles',
    district: 'workshop',
    intuition: 'A source creates push, a closed loop enables flow, and a load receives energy.',
    mechanic: 'Close the workshop loop and balance source strength against resistance.',
    visibleSignal: 'Loop continuity, pulse density, lamp glow, and source strain move together.',
  },
  'lesson-2': {
    slug: 'lesson-2-static-charge-buildup',
    district: 'workshop',
    intuition: 'Separated charge can build until a brief discharge restores balance.',
    mechanic: 'Charge the storm vane until it releases one short spark.',
    visibleSignal: 'Charge marks accumulate, then collapse in a single flash without maintained flow.',
  },
  'lesson-3': {
    slug: 'lesson-3-simple-circuits-from-first-principles',
    district: 'workshop',
    intuition: 'A switch controls whether a complete path exists.',
    mechanic: 'Reconnect the broken harbor-light loop.',
    visibleSignal: 'Opening any part stops every flow pulse and darkens the load.',
  },
  'lesson-4': {
    slug: 'lesson-4-ohms-law-without-formula-fear',
    district: 'workshop',
    intuition: 'More push increases flow while more resistance limits it.',
    mechanic: 'Tune source and resistance until the lamp is bright without overheating the path.',
    visibleSignal: 'Pulse density, brightness, and heat tint respond causally to each control.',
  },
  'lesson-5': {
    slug: 'lesson-5-dc-vs-ac',
    district: 'converter',
    intuition: 'DC keeps one direction while AC reverses direction repeatedly.',
    mechanic: 'Trace island AC through a rectifier and smoothing stage.',
    visibleSignal: 'The Flow Lens changes from reversing waves to one-way pulses.',
  },
  'lesson-6': {
    slug: 'lesson-6-power-adapter-labels',
    district: 'converter',
    intuition: 'A device needs a compatible kind of supply and a suitable rating.',
    mechanic: 'Use the diagnostic bench to block a mismatch, then choose the compatible module.',
    visibleSignal: 'The bench refuses the mismatch before the device can energize.',
  },
  'lesson-7': {
    slug: 'lesson-7-power-energy-bills',
    district: 'lantern',
    intuition: 'Power is a rate; energy and cost accumulate while loads run.',
    mechanic: 'Light the evening market while keeping its energy ribbon inside budget.',
    visibleSignal: 'Instant draw and the longer energy trail are shown as different quantities.',
  },
  'lesson-8': {
    slug: 'lesson-8-conductors-insulators-grounding-safety',
    district: 'harbor',
    intuition: 'Conductors carry intended current, insulation limits unwanted paths, and grounding supports protection.',
    mechanic: 'Choose a conducting feeder, restore insulation, and enable protective grounding.',
    visibleSignal: 'Intended flow and leakage use different paths, textures, and labels.',
  },
  'lesson-9': {
    slug: 'lesson-9-generators-electromagnetic-induction',
    district: 'wind',
    intuition: 'Changing magnetic flux can create electrical push.',
    mechanic: 'Balance wind, field strength, and connected load at the ridge generator.',
    visibleSignal: 'Coil shimmer follows changing flux while output and mechanical strain respond to load.',
  },
  'lesson-10': {
    slug: 'lesson-10-why-ac-won-the-grid-transformers-voltage-heat-loss',
    district: 'longline',
    intuition: 'Higher transmission voltage can move the same power with less current and less line heating.',
    mechanic: 'Raise long-line voltage, then step it down before the district.',
    visibleSignal: 'The same delivery goal uses fewer flow pulses and produces less line heat.',
  },
  'lesson-11': {
    slug: 'lesson-11-house-wiring-faults-and-protection',
    district: 'harbor',
    intuition: 'Protection reacts to different fault paths rather than making every hazard disappear.',
    mechanic: 'Observe a protected trip, repair the model fault, and reset the neighborhood.',
    visibleSignal: 'Leakage and overload cues are distinct, and the affected branch de-energizes.',
  },
  'lesson-12': {
    slug: 'lesson-12-neighborhood-distribution',
    district: 'harbor',
    intuition: 'A feeder serves many homes, each with changing local demand.',
    mechanic: 'Balance feeder capacity against the combined harbor-home load.',
    visibleSignal: 'Feeder flow is shown separately from each home branch and its local load.',
  },
};

export interface DistrictDefinition {
  id: DistrictId;
  order: number;
  name: string;
  shortName: string;
  place: string;
  lessons: LessonId[];
  summary: string;
  objective: string;
  steps: string[];
  position: { x: number; y: number };
  accent: number;
  accentCss: string;
}

export const districts: DistrictDefinition[] = [
  {
    id: 'workshop',
    order: 1,
    name: 'Workshop Cove',
    shortName: 'Workshop',
    place: 'Southwest shore',
    lessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
    summary: 'Wake the first light by rebuilding a loop, tuning its flow, and releasing a static charge.',
    objective: 'Light the cove without overheating its path.',
    steps: ['Close the loop', 'Tune push and resistance', 'Charge the storm vane'],
    position: { x: 0.17, y: 0.71 },
    accent: 0xf59e0b,
    accentCss: '#f59e0b',
  },
  {
    id: 'converter',
    order: 2,
    name: 'Converter Dock',
    shortName: 'Converter',
    place: 'Western inlet',
    lessons: ['lesson-5', 'lesson-6'],
    summary: 'Shape the dock supply from reversing AC into steady DC and protect the device from a mismatch.',
    objective: 'Deliver compatible, steady DC to the dock radio.',
    steps: ['Let the bench block a mismatch', 'Rectify the wave', 'Smooth and match the output'],
    position: { x: 0.26, y: 0.42 },
    accent: 0x38bdf8,
    accentCss: '#38bdf8',
  },
  {
    id: 'wind',
    order: 3,
    name: 'Wind Ridge',
    shortName: 'Wind',
    place: 'Northwest ridge',
    lessons: ['lesson-9'],
    summary: 'Turn changing magnetic flux into useful output while the turbine pushes back against its load.',
    objective: 'Run the ridge generator inside its calm operating band.',
    steps: ['Close the ridge loop', 'Raise wind and field', 'Balance electrical load'],
    position: { x: 0.41, y: 0.2 },
    accent: 0x8dd4bd,
    accentCss: '#8dd4bd',
  },
  {
    id: 'longline',
    order: 4,
    name: 'Longline Pass',
    shortName: 'Longline',
    place: 'Mountain pass',
    lessons: ['lesson-10'],
    summary: 'Move the same delivery across the island with less line current and less wasted heat.',
    objective: 'Send power efficiently and step it down before town.',
    steps: ['Compare low and high line voltage', 'Watch line heat', 'Enable the town transformer'],
    position: { x: 0.62, y: 0.27 },
    accent: 0xf7c65c,
    accentCss: '#f7c65c',
  },
  {
    id: 'lantern',
    order: 5,
    name: 'Lantern District',
    shortName: 'Lanterns',
    place: 'Eastern terraces',
    lessons: ['lesson-7'],
    summary: 'Keep the market glowing while power, time, energy, and cost leave different traces.',
    objective: 'Light the market evening inside its energy budget.',
    steps: ['Set the market size', 'Choose efficient lamps', 'Run the evening clock'],
    position: { x: 0.8, y: 0.48 },
    accent: 0xffb347,
    accentCss: '#ffb347',
  },
  {
    id: 'harbor',
    order: 6,
    name: 'Harbor Neighborhood',
    shortName: 'Harbor',
    place: 'Southeast harbor',
    lessons: ['lesson-8', 'lesson-11', 'lesson-12'],
    summary: 'Separate feeder demand from home loads, catch a model leakage fault, and restore safe distribution.',
    objective: 'Protect the homes and leave enough feeder margin.',
    steps: ['Observe a protected trip', 'Repair insulation', 'Balance homes and feeder'],
    position: { x: 0.72, y: 0.76 },
    accent: 0x4ca67a,
    accentCss: '#4ca67a',
  },
];

export const districtById = Object.fromEntries(
  districts.map((district) => [district.id, district]),
) as Record<DistrictId, DistrictDefinition>;

export const coveredLessonSlugs = districts.flatMap((district) =>
  district.lessons.map((lesson) => lessonMechanicMap[lesson].slug),
);
