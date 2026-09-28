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

  role: { label: "Role", value: "Marketing Specialist · Digital Product" },
  live: { href: "https://castillohousing.com/floor-plans/home-designs/", label: "castillohousing.com/floor-plans" },

  /* --- the real work ------------------------------------------------------
     Photographed from the printed pieces. These are the actual Castillo
     collateral, and they are the reason the concept has a catalogue to stand
     on at all. */
  work: {
    no: '04',
    kicker: 'Exploration',
    title: 'It started by helping people imagine the home they could build.',
    body: 'The brand, brochures, and home design catalogue gave homeowners their first look at Castillo and a glimpse of what their future home could become.',
    shots: [
      { name: 'chg-brand', w: 1152, h: 632, widths: [760, 1152],
        alt: 'The Castillo Housing Group brochure, opened to the design-build services spread.',
        caption: 'The brochure cover.' },
      { name: 'chg-collateral', w: 1152, h: 632, widths: [760, 1152],
        alt: 'Castillo Housing Group brochure pages arranged in a tiled composition.',
        caption: 'A look inside the brochure.' },
      { name: 'chg-residence', w: 1152, h: 632, widths: [760, 1152],
        alt: 'The Caban Residence booklet, showing a front elevation drawing.',
        caption: 'A dedicated book for one home.' },
    ],
  },

  problem: {
    no: '02',
    kicker: 'Problem',
    title: 'Homebuilding needed a clearer system.',
    body: 'Homeowners had many decisions to make, but those choices quickly became difficult to track. Lost links, changing products, and incorrect selections created confusion for the team, affecting orders, invoices, and day-to-day operations, while making the process more frustrating for homeowners.',
  },

  solution: {
    no: '03',
    kicker: 'Solution',
    title: 'One shared place to build the dream home.',
    body: 'The concept connects home discovery with every decision that follows, helping homeowners find, personalize, and organize their choices while giving builders one clear place to manage the process. From discovering the right home to selecting finishes and products, every decision stays connected, visible, and easier to manage.',
  },

  /* --- the prototype ------------------------------------------------------
     The interactive section. `signals` are what a visitor can say about their
     life; each carries the exact rule it applies to the catalogue, and that
     rule is printed in the interface. `plans` is real published data. */
  product: {
    no: '05',
    kicker: 'The product',
    title: 'Try it.',
    body: 'Tell it how you live and discover your next dream home.',

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
        rule: 'Extra room for a home office',
        field: 'bedrooms' },
      { id: 'guests',   label: 'People stay with us',
        rule: 'Bathroom for every bedroom',
        field: 'bathrooms' },
      { id: 'grow',     label: 'Our household may change',
        rule: 'Flexible number of bedrooms',
        field: 'published range' },
      { id: 'gather',   label: 'We host often',
        rule: 'Open space for guests',
        field: 'sq ft ÷ bedrooms' },
      { id: 'upkeep',   label: 'I want less to maintain',
        rule: 'Smaller home and easier to care for',
        field: 'square footage' },
      { id: 'wellness', label: 'Room for a gym or spa',
        rule: 'Extra space for a wellness area',
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
    honesty: 'Castillo publishes square footage, bedrooms and bathrooms. It does not publish orientation, lot fit, ceiling heights or cost, so this prototype does not rank on them.',
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
    title: 'Then comes building the dream home.',
    body: 'Choosing the home is only the beginning. From faucets and flooring to lighting and finishes, every little choice helps turn a house into a home. The homeowner and builder need to stay connected through each decision, even when they are made at different moments, working toward the same dream.',

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
    honesty: 'The homeowner and builder always see the same information, so every decision stays connected from one side to the other.',
  },

  /* Nikole's own phone footage of the printed plan boards on the office wall.
     Transcoded from HEVC with avconvert so every browser can play it. */
  office: {
    alt: 'Castillo home-design boards framed on an office wall: Doral, Canterbury, Villa de Flor, Althea, Bella Vista, Angeles, Seville and Cordoba.',
    caption: 'Andrew, owner of CHG, displayed the home designs in his office :)',
    w: 1280, h: 720,
    poster: '/assets/img/chg-office-poster-1280.webp',
    sources: [
      { src: '/assets/video/chg-office-540.mp4', media: '(max-width: 46rem)' },
      { src: '/assets/video/chg-office-720.mp4' },
    ],
  },

  thinking: {
    no: '05',
    kicker: 'Impact',
    points: [
      { title: 'Lifestyle first',
        body: 'Started with how homeowners want to live, turning personal priorities into a more meaningful and personal way to discover a home.' },
      { title: 'Explainable AI',
        body: 'Made each match traceable to the preferences and published information behind it, so homeowners can understand why a home fits their needs.' },
      { title: 'Shared decisions',
        body: 'Designed one connected experience for homeowners and builders, keeping the same decisions visible and accessible from discovery through construction.' },
      { title: 'Organized selections',
        body: 'Brought products, links, quantities, notes, and priorities into one place, reducing confusion and keeping important decisions from getting lost.' },
      { title: 'Human control',
        body: 'Kept comparisons neutral and the final choice with the homeowner, using AI to guide the process without making the decision for them.' },
    ],
  },

  testimonials: [
    {
      quote: 'Working with Nikole made a real difference in our invoicing and audit work. She was always helpful, kept things organized, and made it easier to find what we needed.',
      name: 'Jean Miller',
      title: 'Chief Accounting Officer, Castillo Housing Group',
    },
    {
      quote: 'Nikole was great to work with and brought a fresh perspective to the project. She understood what we were trying to accomplish and helped make the experience clearer.',
      name: 'Andrew Castillo',
      title: 'Owner & CEO, Castillo Housing Group',
    },
  ],

  /* 05 Impact. A projection, and labelled as one on the page. */
  close: {
    value: '40%',
    label: 'Fewer ordering errors',
    note: 'Projected impact based on workflow comparison.',
    results: [
      { lead: 'Less time tracking decisions', rest: 'as homeowners and builders could find the information they needed in one place.' },
      { lead: 'Fewer disconnected decisions', rest: 'as selections and product information stayed connected throughout the process.' },
      { lead: 'Smoother collaboration', rest: 'as both sides stayed aligned when selections changed or new decisions were made.' },
      { lead: 'Clearer financial operations', rest: 'as organized selections made orders and invoices easier to track.' },
      { lead: 'More confident homeowners', rest: 'as a clearer process made each decision easier to understand and follow.' },
    ],
  },
};
