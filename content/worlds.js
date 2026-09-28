/**
 * The single source of truth for the four worlds.
 *
 * Every level reads from here — the hero annotations, the home index, the
 * Worlds scene (island districts, cards, journey column) and, later, the
 * individual worlds and their case studies. Adding a fifth world is one object
 * plus two coordinates; nothing else changes.
 *
 * Coordinates are normalised (0–1) to their plate, measured from the reference
 * renders by the scripts in tools/ :
 *   hotspot   → the hero plate    (assets/img/hero-plate-*.webp)
 *   district  → the island plate  (assets/img/worlds-island-*.webp)
 *   card      → the island plate; the card's anchor corner
 *
 * These were re-measured against the high-resolution cut-outs, whose framing
 * differs from the flat mockups they replaced. If the artwork is swapped again,
 * re-measure with the grid overlay rather than assuming they carry over.
 *
 * All copy is taken verbatim from Nikole's own reference boards. Nothing here
 * is invented; `caseStudy.status` marks what is real versus still to be defined.
 */
export const worlds = [
  {
    id: 'healthcare',
    no: '01',
    name: 'Healthcare',
    kicker: 'Healthcare',
    sub: 'UX/UI',
    line: 'Designing better experiences around care.',
    hotspot:  { x: 0.400, y: 0.150, side: 'left', line: 17 },
    district: { x: 0.330, y: 0.160 },
    card:     { x: 0.005, y: 0.020, side: 'left' },
    scene:    { tagline: 'Designing for LifeWorx', sky: ['#CFE0EC', '#EAE4DC'], description: 'A new Events destination designed to make it easier for LifeWorx clients and families to discover special experiences, explore upcoming activities, and connect with their community.' },
    logo: 'lifeworx',
    journey:  { line: 'From people to better care.', kicker: 'Healthcare UX/UI' },
    caseStudy: { id: 'lifeworx', title: 'LifeWorx', status: 'real' },
  },
  {
    id: 'ai',
    no: '02',
    name: 'Artificial Intelligence',
    kicker: 'Artificial Intelligence',
    sub: 'Digital product',
    line: 'Making complex data easier to understand.',
    hotspot:  { x: 0.630, y: 0.205, side: 'right', line: 20 },
    district: { x: 0.700, y: 0.220 },
    card:     { x: 0.775, y: 0.015, side: 'right' },
    scene:    { tagline: 'AI Home Design', sky: ['#C7D8E8', '#E7E2DA'], description: 'An AI-assisted home discovery concept built on Castillo Housing Group’s published catalogue of home designs.' },
    logo: 'castillo',
    journey:  { line: 'From data to understanding.', kicker: 'AI & Product' },
    caseStudy: { id: 'castillo', title: 'Castillo Housing Group', status: 'real' },
  },
  {
    id: 'product',
    no: '03',
    name: 'Technology',
    kicker: 'Technology',
    sub: 'SaaS',
    line: 'Building useful and intuitive digital products.',
    hotspot:  { x: 0.780, y: 0.350, side: 'right', line: 22 },
    district: { x: 0.660, y: 0.600 },
    card:     { x: 0.760, y: 0.790, side: 'right' },
    scene:    { tagline: 'Connected Operations', sky: ['#DCD8D0', '#F0EBE2'], description: 'A connected operations concept for automotive service teams, inspired by the everyday workflow at Ceramic Pro Sarasota.' },
    logo: 'ceramicpro',
    journey:  { line: 'From ideas to products.', kicker: 'SaaS / Product' },
    caseStudy: { id: 'saas-product', title: 'Ceramic Pro Sarasota', status: 'real' },
  },
  {
    id: 'creative',
    no: '04',
    name: 'Creative Archive',
    kicker: 'Creative Archive',
    sub: 'Marketing & design',
    line: 'Visual direction, campaigns, and experiments.',
    hotspot:  { x: 0.705, y: 0.615, side: 'right', line: 24 },
    district: { x: 0.220, y: 0.550 },
    card:     { x: 0.000, y: 0.755, side: 'left' },
    scene:    { tagline: 'Ideas that inspire change.', sky: ['#DDC9BD', '#F4F3EF'] },
    journey:  { line: 'From visuals to connection.', kicker: 'Creative work' },
    caseStudy: { id: 'archive', title: 'Creative Archive', status: 'index' },
  },
];

/** The five narrative beats, verbatim from reference 03. They structure the
 *  individual world and, later, the case study's spine. */
export const journeyBeats = [
  { no: '01', title: 'The person',     question: 'Who are they?' },
  { no: '02', title: 'The world',      question: 'What do they need?' },
  { no: '03', title: 'The insight',    question: 'What’s the real problem?' },
  { no: '04', title: 'The experience', question: 'How do we solve it?' },
  { no: '05', title: 'The impact',     question: 'What changes?' },
];

/** Copy for the Worlds scene itself. */
export const worldsCopy = {
  cue: 'Explore the map',
};

export const byId = (id) => worlds.find((w) => w.id === id) || null;
