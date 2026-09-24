/**
 * Castillo Housing Group — AI Home Design.
 *
 * Two things live in this case study, and the page never lets them blur:
 *
 *   1. REAL WORK. Castillo Housing Group is a Tampa Bay design-build firm.
 *      Nikole produced their brand collateral and the home-design / floor-plan
 *      content on castillohousing.com. The company facts, the plan names and
 *      every square-footage, bedroom and bathroom figure below are taken from
 *      that published catalogue — they are not illustrative numbers.
 *
 *   2. A CONCEPT. "AI Home Design" is a speculative product built on top of
 *      that real catalogue. It was not commissioned, shipped or measured.
 *
 * The one rule the concept follows: it may reason about the catalogue, but it
 * may not add to it. Every score the prototype shows is computed from a
 * published field, and the rule that produced it is printed next to it. Where
 * Castillo has not published a figure, the prototype says so and abstains
 * rather than guessing — which is why `baths: null` appears below instead of a
 * plausible number.
 */

export const castillo = {
  no: "01",
  kicker: "Artificial Intelligence",
  logo: { src: "/assets/img/logo-castillo.png", alt: "Castillo Housing Group", w: 802, h: 330 },
  title: "AI Home Design",
  lede: "A digital home experience concept built around Castillo Housing Group’s catalogue, helping people discover a home based on how they live, personalize it around their preferences, and carry those decisions forward into a shared workspace with their builder.",

  about: "Castillo Housing Group is a Tampa Bay design-build firm with more than 30 years of experience, creating custom homes across Florida, member of the Florida Green Building Coalition and an Energy Star partner.",

  role: { label: "Role", value: "Marketing Specialist" },
  live: { href: "https://castillohousing.com/floor-plans/home-designs/", label: "castillohousing.com/floor-plans" },

  /* --- the real work ------------------------------------------------------
     Photographed from the printed pieces. These are the actual Castillo
     collateral, and they are the reason the concept has a catalogue to stand
     on at all. */
  work: {
    no: '02',
    kicker: 'The real work',
    title: 'Brand, brochure and the plan catalogue.',
    body: 'Before any of the product thinking, there was the ordinary work of making a builder legible: a brand people could trust, a brochure that carried the range, and fifty home designs written up so a family could actually compare them.',
    shots: [
      { name: 'chg-brand', w: 1152, h: 632, widths: [760, 1152],
        alt: 'The Castillo Housing Group brochure, opened to the design-build services spread.',
        caption: 'Tampa Bay’s premier custom home builder — the brochure cover and services spread.' },
      { name: 'chg-collateral', w: 1152, h: 632, widths: [760, 1152],
        alt: 'Castillo Housing Group brochure pages arranged in a tiled composition.',
        caption: 'Interior design solutions, custom kitchens, staircases — the range, laid out.' },
      { name: 'chg-residence', w: 1152, h: 632, widths: [760, 1152],
        alt: 'The Caban Residence booklet, showing a front elevation drawing.',
        caption: 'Caban Residence — a single home, given its own book.' },
    ],
  },

  problem: {
    no: '03',
    kicker: 'Problem',
    title: 'How might homebuyers move from browsing homes to imagining how one could fit their life?',
    body: 'A plan catalogue answers a question nobody asks first. People do not open with “four bedrooms, 4,138 square feet” — they open with a parent moving in, a job that is now permanently at home, a wish to stop maintaining so much. Fifty plans, sorted by size, leave that translation entirely to the reader.',
  },

  solution: {
    no: '04',
    kicker: 'Solution',
    title: 'An AI-assisted discovery experience that starts with lifestyle.',
    body: 'State how you live. The product reads Castillo’s published catalogue against that, ranks what fits, and shows its reasoning in the same breath — every score traced back to a real published field, every gap named rather than filled.',
  },

  /* --- the prototype ------------------------------------------------------
     The interactive section. `signals` are what a visitor can say about their
     life; each carries the exact rule it applies to the catalogue, and that
     rule is printed in the interface. `plans` is real published data. */
  product: {
    no: '05',
    kicker: 'The product',
    title: 'Try it.',
    body: 'A working prototype, not a screenshot. Tell it how you live and it will reason over Castillo’s real catalogue in front of you.',

    steps: [
      { id: 'life',    label: 'Lifestyle' },
      { id: 'matches', label: 'Matches' },
      { id: 'plan',    label: 'Plan' },
      { id: 'compare', label: 'Compare' },
    ],

    /* Each signal states the published field it reads and how. The interface
       shows `rule` verbatim, so the ranking is never a black box. */
    signals: [
      { id: 'work',     label: 'I work from home',
        rule: 'Looks for a room beyond the bedrooms you need.',
        field: 'bedrooms' },
      { id: 'guests',   label: 'People stay with us',
        rule: 'Looks for a bathroom for every bedroom.',
        field: 'bathrooms' },
      { id: 'grow',     label: 'Our household may change',
        rule: 'Favours plans Castillo publishes with a flexible bedroom count.',
        field: 'published range' },
      { id: 'gather',   label: 'We host often',
        rule: 'Favours more square footage per bedroom — space that is shared, not slept in.',
        field: 'sq ft ÷ bedrooms' },
      { id: 'upkeep',   label: 'I want less to maintain',
        rule: 'Favours a smaller footprint to heat, cool and clean.',
        field: 'square footage' },
      { id: 'wellness', label: 'Room for a gym or spa',
        rule: 'Favours a footprint with space left over after the living areas.',
        field: 'square footage' },
    ],

    /* Castillo's published catalogue. `beds` and `baths` are [min, max]; a
       range is what Castillo themselves publish as a range. `baths: null`
       means the figure is not published — the prototype abstains rather than
       inventing one, and says so on screen. */
    plans: [
      { id: 'ibiza',      name: 'Ibiza',                sqft: 2330,  beds: [2, 2], baths: null },
      { id: 'florence',   name: 'Florence',             sqft: 2813,  beds: [3, 3], baths: [2, 2] },
      { id: 'althea',     name: 'Althea',               sqft: 3405,  beds: [3, 5], baths: [2.5, 3] },
      { id: 'villaflor',  name: 'Villa de Flor',        sqft: 3516,  beds: [4, 4], baths: [4, 4] },
      { id: 'canterbury', name: 'Canterbury',           sqft: 3595,  beds: [3, 4], baths: [3, 3] },
      { id: 'castelli',   name: 'Villa Castelli Modern', sqft: 3752, beds: [4, 4], baths: null },
      { id: 'cadiz',      name: 'Cadiz',                sqft: 3978,  beds: [3, 3], baths: [3, 3] },
      { id: 'jardin',     name: 'Villa Jardin',         sqft: 4138,  beds: [3, 3], baths: [3, 3] },
      { id: 'isabela',    name: 'Isabela',              sqft: 4378,  beds: [4, 4], baths: [4, 4] },
      { id: 'amalfi',     name: 'Amalfi',               sqft: 4500,  beds: [3, 3], baths: null },
      { id: 'riviera',    name: 'Riviera',              sqft: 5436,  beds: [4, 4], baths: [4, 4] },
      { id: 'luzencia',   name: 'Luzencia',             sqft: 6132,  beds: [5, 5], baths: [5, 5] },
      { id: 'palmera',    name: 'Palmera',              sqft: 6826,  beds: [4, 4], baths: [4, 4] },
      { id: 'rosemare',   name: 'Rosemare',             sqft: 7007,  beds: [3, 4], baths: [3.5, 4] },
      { id: 'brisa',      name: 'Brisa del Mar',        sqft: 8317,  beds: [6, 6], baths: [7, 7] },
      { id: 'montecarlo', name: 'Montecarlo',           sqft: 10425, beds: [5, 5], baths: [5, 5] },
    ],

    /* Shown inside the prototype at the point the visitor would expect a
       confident answer. Saying it there, rather than in a footnote, is the
       design position. */
    honesty: 'Castillo publishes square footage, bedrooms and bathrooms. It does not publish orientation, lot fit, ceiling heights or cost — so this prototype does not rank on them.',
  },

  /* --- the second surface -------------------------------------------------
     Choosing a plan is the short part. The long part is the eighteen months of
     selections that follow it, which today live in email threads, screenshots
     and a shared drive nobody trusts.

     This is one record with two faces: the buyer saves on a phone, in a
     showroom, in the moment; the builder works the same items on a desktop, as
     a queue. Both write to the same object, which is the whole argument — so
     the prototype really does mutate one array from two interfaces rather than
     keeping a copy per view.

     The seeded items are illustrative of a buyer's selections. The brand names
     are real companies in their categories, used the way a buyer would use
     them — as a stated preference, not as a claim about Castillo's suppliers. */
  build: {
    no: '06',
    kicker: 'The workspace',
    title: 'Then the eighteen months after.',
    body: 'A plan is chosen once. The faucet, the floor, the lighting control and four hundred other decisions are chosen slowly, by two people who are rarely in the same room. Same record, two faces.',

    arc: [
      { id: 'discover',    label: 'Discover' },
      { id: 'personalize', label: 'Personalize' },
      { id: 'save',        label: 'Save' },
      { id: 'organize',    label: 'Organize' },
      { id: 'collaborate', label: 'Collaborate' },
      { id: 'track',       label: 'Track' },
      { id: 'complete',    label: 'Complete' },
    ],

    categories: [
      { id: 'kitchen',   label: 'Kitchen' },
      { id: 'bathrooms', label: 'Bathrooms' },
      { id: 'lighting',  label: 'Lighting' },
      { id: 'materials', label: 'Materials & Finishes' },
      { id: 'outdoor',   label: 'Outdoor' },
      { id: 'smart',     label: 'Smart Home' },
      { id: 'furniture', label: 'Furniture & Decor' },
      { id: 'other',     label: 'Other' },
    ],

    /* Ordered. The workspace reads the order as progress, so it is the order
       a selection actually moves through, not an alphabetised list. */
    statuses: [
      { id: 'decide',    label: 'To decide' },
      { id: 'selected',  label: 'Selected' },
      { id: 'ordered',   label: 'Ordered' },
      { id: 'purchased', label: 'Purchased' },
      { id: 'installed', label: 'Installed' },
    ],

    priorities: [
      { id: 'must', label: 'Must have' },
      { id: 'prefer', label: 'Prefer' },
      { id: 'open', label: 'Open to options' },
    ],

    /* `at` and comment `at` are offsets in hours from now, so the demo reads
       as a live thread instead of going stale against a hard-coded date. */
    items: [
      { id: 'faucet', cat: 'kitchen', title: 'Bridge faucet, unlacquered brass',
        brand: 'Kohler', link: 'kohler.com/kitchen-faucets', priority: 'must',
        status: 'ordered', shots: 3, swatch: '#B08D57', at: -72,
        note: 'The one from the Tampa showroom. Living finish — I want it to patina, please do not swap for a coated version.',
        log: [
          { by: 'owner',   text: 'Saved from the showroom visit.', at: -72 },
          { by: 'builder', text: 'Good choice, it pairs with the cabinet pulls. Lead time is 6 weeks so I am placing it now to protect the rough-in date.', at: -50 },
          { by: 'builder', text: 'Ordered — confirmation in the shared folder.', at: -49 },
        ] },

      { id: 'fridge', cat: 'kitchen', title: '42" integrated refrigerator, panel-ready',
        brand: 'Sub-Zero', link: 'subzero-wolf.com', priority: 'must',
        status: 'selected', shots: 1, swatch: null, at: -68,
        note: 'Panel-ready so it disappears into the cabinetry run.',
        log: [
          { by: 'builder', text: 'Confirmed it fits the 42" opening on the plan. I need the panel spec from the cabinet maker before I can order.', at: -20 },
        ] },

      { id: 'tub', cat: 'bathrooms', title: 'Freestanding soaking tub, primary bath',
        brand: null, link: null, priority: 'must',
        status: 'decide', shots: 4, swatch: null, at: -40,
        note: 'Still deciding between stone resin and cast iron. Stone resin holds heat longer but I have read it scratches.',
        log: [
          { by: 'builder', text: 'Either works structurally, but cast iron at this size needs blocking under the slab — tell me before we pour, not after.', at: -14 },
        ] },

      { id: 'lighting', cat: 'lighting', title: 'Whole-home dimming and shade control',
        brand: 'Lutron', link: 'lutron.com', priority: 'must',
        status: 'installed', shots: 0, swatch: null, at: -200,
        note: 'Keypads, not switch plates, in the living areas.',
        log: [
          { by: 'builder', text: 'Rough-in done at framing.', at: -120 },
          { by: 'builder', text: 'Commissioned and installed. Walkthrough whenever you are ready.', at: -30 },
        ] },

      { id: 'floor', cat: 'materials', title: 'Wide-plank white oak, matte, 7½"',
        brand: null, link: null, priority: 'prefer',
        status: 'purchased', shots: 2, swatch: '#C8A97E', at: -150,
        note: 'Matte, not satin. The satin sample looked plastic under the showroom lights.',
        log: [
          { by: 'owner',   text: 'Approving the matte sample.', at: -100 },
          { by: 'builder', text: 'Purchased with 8% overage for cuts and future repairs.', at: -96 },
        ] },

      { id: 'counter', cat: 'materials', title: 'Honed quartzite, kitchen island',
        brand: null, link: null, priority: 'prefer',
        status: 'decide', shots: 5, swatch: '#D8D5CE', at: -30,
        note: 'Want the slab picked in person — no two are alike.',
        log: [] },

      { id: 'kitchenout', cat: 'outdoor', title: 'Summer kitchen with built-in grill',
        brand: null, link: null, priority: 'open',
        status: 'decide', shots: 2, swatch: null, at: -26,
        note: 'Only if it does not push the lanai budget. Happy to defer this to phase two.',
        log: [
          { by: 'builder', text: 'We can rough in the gas and water now and finish it later for far less than retrofitting. Cheap insurance.', at: -8 },
        ] },

      { id: 'entry', cat: 'smart', title: 'Video doorbell and keyless entry',
        brand: null, link: null, priority: 'prefer',
        status: 'selected', shots: 0, swatch: null, at: -22,
        note: 'Needs to work if the wifi drops.',
        log: [] },

      { id: 'sectional', cat: 'furniture', title: 'Low-profile sectional, great room',
        brand: null, link: null, priority: 'open',
        status: 'decide', shots: 6, swatch: '#8A8778', at: -12,
        note: 'Inspiration only — not buying until the room exists and I can stand in it.',
        log: [] },
    ],

    /* Said on the handoff screen, where a product would normally promise
       more than it can keep. */
    honesty: 'Nothing here is a document you have to keep current by hand. The builder sees the same record you do, at the same moment — the handoff is a permission, not an export.',
  },

  thinking: {
    no: '07',
    kicker: 'Design notes',
    points: [
      { title: 'Lifestyle first',
        body: 'The first screen asks nothing a listing would ask. Bedrooms come second, as a consequence of what you said, not as the opening question.' },
      { title: 'Legible ranking',
        body: 'Every score carries the rule that produced it and the published number it read. An assistant that cannot explain itself is asking to be trusted on nothing.' },
      { title: 'Abstention as a feature',
        body: 'Where Castillo has not published a figure, the product says so and drops that signal for that plan. Silence is more useful than a confident guess.' },
      { title: 'Comparison over persuasion',
        body: 'The compare view reports differences flatly — no recommended badge, no nudge. The catalogue is the client’s; the judgement stays the visitor’s.' },
      { title: 'Built on real ground',
        body: 'Sixteen of Castillo’s fifty published designs drive the prototype, unaltered. A concept that invents its own data proves only that the designer can invent data.' },
      { title: 'One record, two faces',
        body: 'The buyer’s phone and the builder’s workspace are not two products that sync. They are two views of the same array, which is why a status changed on one side is already changed on the other.' },
      { title: 'Priority is the buyer’s word',
        body: 'Must have, prefer, open to options. Not a five-star rating — three words a builder can act on when the budget moves and something has to give.' },
      { title: 'The thread is the record',
        body: 'Decisions are not a field, they are an argument that happened over weeks. Keeping the comments attached to the item is what stops the reasoning from evaporating into an inbox.' },
    ],
  },

  close: {
    no: '08',
    kicker: 'Where it stands',
    title: 'A concept, and what it would take.',
    body: 'This is an argument, not a result. It has not been tested with buyers, priced, or put in front of Castillo’s sales team — and none of those are formalities.',
    next: [
      'Test the lifestyle vocabulary with real buyers; the six signals here are a designer’s guesses at what people lead with.',
      'Bring in the fields the catalogue omits — lot fit, orientation, cost envelope — since those decide more purchases than bedroom count.',
      'Sit with the sales team, who already do this translation by hand and know where it breaks.',
      'Watch a real selections process end to end before trusting the five statuses; a schedule slip or a discontinued product is the case that breaks this model.',
      'Decide what the assistant refuses to answer, before deciding what it answers well.',
    ],
  },
};
