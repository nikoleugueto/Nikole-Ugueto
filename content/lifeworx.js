/**
 * LifeWorx Events — the one case study with real work behind it.
 *
 * Everything here is either Nikole's own copy or an observation that can be
 * checked against the live page at lifeworx.com/events. There is no research,
 * no persona, no journey map and no outcome that was not supplied: where a
 * thing is not known, it is absent rather than filled in.
 */

const shot = (name, w, h, alt, caption = '', widths = [760, 1200]) =>
  ({ name, w, h, alt, caption, widths });

/* Where the laptop's screen sits inside assets/img/lw-laptop-*.webp, as a
   fraction of the plate. The mockup's own screen content was cut out to
   transparency, so the real Events page shows through the hole and the bezel
   masks it exactly. Re-measure if the mockup is ever re-exported. */
export const laptopScreen = { x: 0.2324, y: 0.2168, w: 0.5352, h: 0.5195 };

export const lifeworx = {
  no: '01',
  kicker: 'Healthcare',
  logo: { src: '/assets/img/logo-lifeworx.png', alt: 'LifeWorx', w: 1899, h: 530 },
  title: 'Designing for LifeWorx',
  lede: 'A new Events destination designed to make it easier for LifeWorx clients and families to discover special experiences, explore upcoming activities, and connect with their community.',
  about: 'LifeWorx is a five-star-rated, independently owned private-pay home care agency providing concierge elder care and lifestyle services for over 20 years.',
  role: { label: 'Role', value: 'Marketing Intern · UX/UI Design' },
  live: { href: 'https://lifeworx.com/events/', label: 'lifeworx.com/events' },

  problem: {
    no: '02',
    kicker: 'Problem',
    title: 'Events needed a place of their own.',
    body: 'LifeWorx had a growing programme of experiences, but those events needed a dedicated destination where clients and families could easily discover them.',
  },

  solution: {
    no: '03',
    kicker: 'Solution',
    title: 'One destination for discovery.',
    body: 'The Events experience brings different types of activities into one destination, giving each category a clear place while keeping discovery simple.',
  },

  /* The laptop is the frame; the page inside it is the real screenshot of
     lifeworx.com/events, translated as you scroll. */
  machine: {
    frame: { name: 'lw-laptop', w: 1920, h: 1280, widths: [1200, 1920],
             alt: 'A laptop on a marble table above a bay, showing the LifeWorx Events page.' },
    page: { name: 'lw-full', w: 1400, h: 9623, widths: [900, 1400],
            alt: 'The LifeWorx Events page, scrolling inside the laptop screen.' },
    hint: 'Keep scrolling',
  },

  designThinking: {
    no: '04',
    kicker: 'Exploration',
    points: [
      {
        title: 'Discovery',
        body: 'Organized event types into a clearer structure so visitors could explore without feeling overwhelmed.',
      },
      {
        title: 'Visual storytelling',
        body: 'Used real event photography, scale, composition, and rhythm to communicate each experience.',
      },
      {
        title: 'Brand + UX',
        body: 'Extended the LifeWorx visual language while giving the Events destination its own identity.',
      },
      {
        title: 'Accessibility',
        body: 'Considered contrast, typography, spacing, and responsive behavior across contexts.',
      },
      {
        title: 'Motion',
        body: 'Used movement and transitions to make discovery more engaging while keeping navigation intuitive.',
      },
    ],
  },

  motionStudy: {
    title: 'Motion study for the Events hero.',
    /* Nikole's own draft animation. The original is 1808×1018 and 32 MB; these
       are transcoded down with avconvert, which is the only encoder on this
       machine. Even at 720p it is 20 MB, so nothing loads until the section is
       actually reached — see the poster and preload="none" in the view. */
    video: {
      w: 1280, h: 720,
      sources: [
        { src: '/assets/video/website-hero-video-6-540.mp4', media: '(max-width: 46rem)' },
        { src: '/assets/video/website-hero-video-6-720.mp4' },
      ],
    },
    poster: '/assets/img/lw-hero-1200.webp',
  },

  impact: {
    no: '05',
    kicker: 'Impact',
    value: '33.3%',
    label: 'Overall conversion rate',
    note: 'Site-level performance data from LifeWorx WordPress analytics.',
    /* Qualitative, and labelled as such on the page. These describe what the
       design set out to do — they are not measured results, and none of them
       claims a number, a preference or a research finding. */
    design: [
      'Created a dedicated digital destination that gave LifeWorx events greater visibility and presence.',
      'Simplified discovery by organizing diverse event types into a clearer, more intuitive experience.',
      'Strengthened the Events programme\'s visual identity within the broader LifeWorx digital experience.',
      'Created a clearer journey from event discovery to detailed event information.',
      'Built a stronger path from discovery to engagement, creating opportunities for registrations and client conversion.',
    ],
  },

  testimonials: [
    {
      quote: 'Nikole brings a thoughtful and creative approach to every project. She has a strong eye for visual design and knows how to turn ideas into work that feels clear, engaging, and intentional.',
      name: 'Paola Castillo',
      title: 'Marketing Specialist, LifeWorx',
    },
    {
      quote: 'Nikole brings a strong product mindset to her work, connecting visual design with thoughtful decisions. She approaches problems with curiosity and creates purposeful, intuitive experiences.',
      name: 'Christin Gabriel',
      title: 'Senior Director of Marketing & Product Design, LifeWorx',
    },
  ],

  /* Captured for this case study and kept on disk at Nikole's instruction.
     They are not placed in the current layout; this list is what stops the
     preflight reporting them as orphans, and is the honest record of why
     they are still here. */
  library: [
    shot('lw-hero', 1900, 1188, 'The LifeWorx Events page as it opens.', '', [1200, 1900]),
    shot('lw-type', 1200, 793, 'A close crop of the Events page body copy.'),
    shot('lw-card', 1200, 676, 'A close crop of an event photograph in its frame.'),
    shot('lw-mobile', 700, 5983, 'The Events page category sections on a phone.', '', [420, 700]),
  ],
};
