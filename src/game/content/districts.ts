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
    mechanic: 'Patch a source, switch, resistance coil, lamp, and return into a working circular bench.',
    visibleSignal: 'A gap stops every current marker while a complete loop transfers energy into lamp light.',
  },
  'lesson-2': {
    slug: 'lesson-2-static-charge-buildup',
    district: 'workshop',
    intuition: 'Separated charge can build until a brief discharge restores balance.',
    mechanic: 'Rub a wool pad across the storm vane, trigger one discharge, then return the vane toward balance.',
    visibleSignal: 'Separated charge marks accumulate, collapse in one flash, and do not continue circulating.',
  },
  'lesson-3': {
    slug: 'lesson-3-simple-circuits-from-first-principles',
    district: 'workshop',
    intuition: 'A switch controls whether a complete path exists.',
    mechanic: 'Place every circuit part in a route that leaves the source and returns to it.',
    visibleSignal: 'Opening any part stops every flow pulse and darkens the load.',
  },
  'lesson-4': {
    slug: 'lesson-4-ohms-law-without-formula-fear',
    district: 'workshop',
    intuition: 'More push increases flow while more resistance limits it.',
    mechanic: 'Swap cell stacks and physical coil spools, then pin three comparable current traces.',
    visibleSignal: 'The same coil carries more current with more cells, while a larger coil limits current with the source unchanged.',
  },
  'lesson-5': {
    slug: 'lesson-5-dc-vs-ac',
    district: 'converter',
    intuition: 'DC keeps one direction while AC reverses direction repeatedly.',
    mechanic: 'Repair an adjust, rectify, smooth, and regulate cargo conveyor with missing and reversed modules.',
    visibleSignal: 'The output trace changes from reversing to pulsing, rippled, and stable one-direction output stage by stage.',
  },
  'lesson-6': {
    slug: 'lesson-6-power-adapter-labels',
    district: 'converter',
    intuition: 'A device needs a compatible kind of supply and a suitable rating.',
    mechanic: 'Test a mismatched output label, fit a compatible adapter, then complete a simplified USB-C negotiation.',
    visibleSignal: 'The protected gate names the incompatible field and stays de-energized until every required match is present.',
  },
  'lesson-7': {
    slug: 'lesson-7-power-energy-bills',
    district: 'lantern',
    intuition: 'Power is a rate; energy and cost accumulate while loads run.',
    mechanic: 'Balance equal-energy cards, schedule lamp plans across three market periods, then replay the evening.',
    visibleSignal: 'Instant power changes by period while a separate Wh, kWh, and cost ribbon only accumulates.',
  },
  'lesson-8': {
    slug: 'lesson-8-conductors-insulators-grounding-safety',
    district: 'harbor',
    intuition: 'Conductors carry intended current, insulation limits unwanted paths, and grounding supports protection.',
    mechanic: 'Fit conductor, insulation, and emergency ground into separate physical layers, then run the normal path.',
    visibleSignal: 'Intended flow and leakage use different paths, textures, and labels.',
  },
  'lesson-9': {
    slug: 'lesson-9-generators-electromagnetic-induction',
    district: 'wind',
    intuition: 'Changing magnetic flux can create electrical push.',
    mechanic: 'Work a hand crank to move a magnet through a coil, compare open and closed terminals, and balance a connected load.',
    visibleSignal: 'Induced voltage follows alternating motion, lamp current needs the closed path, and load adds counter-torque.',
  },
  'lesson-10': {
    slug: 'lesson-10-why-ac-won-the-grid-transformers-voltage-heat-loss',
    district: 'longline',
    intuition: 'Higher transmission voltage can move the same power with less current and less line heating.',
    mechanic: 'Dispatch the same delivery at two voltages, orient both transformer ratios, and step voltage down beside town.',
    visibleSignal: 'The higher-voltage route uses fewer current packets and less heat, while steady DC fails to sustain transformer output.',
  },
  'lesson-11': {
    slug: 'lesson-11-house-wiring-faults-and-protection',
    district: 'harbor',
    intuition: 'Protection reacts to different fault paths rather than making every hazard disappear.',
    mechanic: 'Install both watchers, inject overload, short, and leakage faults, then repair the model cable after isolation.',
    visibleSignal: 'Overcurrent and imbalance trip different devices, and the branch remains faulted until it is repaired.',
  },
  'lesson-12': {
    slug: 'lesson-12-neighborhood-distribution',
    district: 'harbor',
    intuition: 'A feeder serves many homes, each with changing local demand.',
    mechanic: 'Assemble the distribution chain, change appliances inside three homes, overload the feeder, then restore margin.',
    visibleSignal: 'Each branch keeps its local current while the feeder visibly carries their combined demand.',
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
    summary: 'Step into a circuit workbench where parts, current traces, and a storm vane turn four foundation lessons into physical experiments.',
    objective: 'Build the loop, prove the push and resistance pattern, and complete a static spark-reset cycle.',
    steps: ['Build the returning loop', 'Pin three flow comparisons', 'Spark and reset the vane'],
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
    summary: 'Repair a waveform conveyor, read an output label through consequences, and let two USB-C endpoints negotiate.',
    objective: 'Shape steady DC and energize the dock radio only through a compatible supply path.',
    steps: ['Repair the waveform chain', 'Match the complete output label', 'Negotiate a shared power mode'],
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
    summary: 'Work a hand-crank generator and feel how relative motion, a closed path, and connected load change the result.',
    objective: 'Create induced voltage, deliver current to a lamp, and sustain a load against counter-torque.',
    steps: ['Change flux with motion', 'Compare open and closed paths', 'Balance effort and load'],
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
    summary: 'Dispatch one fixed delivery through a transformer railway where current, heat, coil ratio, and source type all matter.',
    objective: 'Raise voltage before the long line, lower it beside town, and keep the route cool.',
    steps: ['Compare the same delivery', 'Build the transformer chain', 'Deliver safely to town'],
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
    summary: 'Arrange a night market across space and time, with warm features, changing brightness needs, and a growing energy ribbon.',
    objective: 'Meet dusk, peak, and closing needs while keeping the evening within its energy budget.',
    steps: ['Balance equal-energy evenings', 'Schedule three market periods', 'Replay power and energy'],
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
    summary: 'Layer safe paths, make protection respond to three model faults, repair the cause, and rebalance a shared neighborhood feeder.',
    objective: 'Restore every safety layer and serve changing home loads with visible feeder margin.',
    steps: ['Give every path one job', 'Trip, diagnose, and repair', 'Rebuild and balance distribution'],
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
