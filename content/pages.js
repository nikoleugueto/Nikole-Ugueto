/**
 * About, Creative Archive and Contact.
 *
 * Everything marked `verbatim` is lifted word-for-word from Nikole's own
 * reference boards (06, 07, 08 and the full mockup). Nothing about her
 * background, experience or tools is invented — where a fact is needed and has
 * not been supplied, there is a `placeholder` carrying the brief for it, the
 * same pattern the case studies use.
 *
 * `link: null` means the destination does not exist yet. Those render as a
 * marked "to add" row rather than as a link that goes nowhere.
 */

/* About: the deeper, more personal version of the resume and LinkedIn.
   The positioning lines are her own, from the resume. Every fact here is one
   she supplied or that her resume and case studies establish; nothing names a
   result, client, role or detail they don't. No GPA, by her request. */
export const about = {
  eyebrow: 'About',
  hello: 'Hi, I’m Nikole.',
  title:                                                     // resume positioning
    'I design digital experiences that make complex information and everyday ' +
    'processes easier to understand and use.',
  // resume positioning, word for word; `lead` and `rest` are two visual lines
  // so "I connect…" always begins its own
  intro: {
    lead: 'With a background in marketing, visual design, UX and AI,',
    rest: 'I connect user needs, business goals and emerging technology to create ' +
          'products that are clear, useful and meaningful.',
  },
  facts: ['UX/UI & Product Designer', 'Tampa, FL', 'English · Español'],

  origin: {
    eyebrow: 'Where I come from',
    title: 'Born in the U.S. raised in Venezuela.',          // no comma, by her request
    body: [                                                   // verbatim, given 2026-09-29
      'My family has Venezuelan and Colombian roots, and they always taught me to ' +
      'believe in myself, pursue what matters to me, and have the confidence to work ' +
      'toward my dreams.',
      'Growing up, I loved playing video games and painting, often with my family or ' +
      'friends. Both made me curious about how they were created and what happened ' +
      'behind the screen, from the games I played to the apps I used. That curiosity ' +
      'eventually led me from marketing and visual design into UX and product design.',
    ],
  },

  /* Education first: FIU is the credibility point she wants noticed. */
  education: {
    eyebrow: 'Education & experience',
    primary: { school: 'Florida International University', degree: 'BBA, Marketing', honor: 'Cum Laude', year: '2026' },
    secondary: { school: 'Central Piedmont Community College', degree: 'AA, Business', year: '2024' },
  },

  /* The path her work took. Stages, not a chronology: the resume has the dates.
     Each proof line is a real result from the resume or a real project. */
  path: [                                                   // her copy, given 2026-09-29
    { stage: 'Marketing',
      where: 'Dolfin Home Loans · Castillo Housing Group · Ceramic Pro Sarasota',
      proof: 'Created campaigns that increased brand awareness by <strong>25%</strong> and engagement by <strong>20%</strong>.' },
    { stage: 'Visual Design',
      where: 'Ugueto AI Marketing · Castillo Housing Group',
      proof: 'Created digital and print brand materials, including campaign assets, Castillo’s main brochure, and a dedicated residence book.' },
    { stage: 'UX/UI Design',
      where: 'Ceramic Pro Sarasota · LifeWorx',
      proof: 'Redesigned a website experience that increased conversion by <strong>20%</strong>, and designed LifeWorx’s dedicated Events destination.' },
    { stage: 'Product Design',
      where: 'Connected Operations',
      proof: 'A SaaS concept inspired by seeing job details get lost between printed handoffs and disconnected systems.' },
    { stage: 'AI-assisted Design',
      where: 'AI Home Discovery Concept',
      proof: 'Explored an AI-assisted product concept designed to help people discover and compare homes with less effort.' },
  ],

  curious: {
    eyebrow: 'What keeps me curious',
    notes: [
      { id: 'paint',  title: 'Painting',            line: 'Keeps my creativity active outside the screen.' },
      { id: 'ai',     title: 'AI & technology',     line: 'I like understanding how new tools and systems work, from AI to investing.' },
      { id: 'read',   title: 'Reading & learning',  line: 'Naturally curious, and always learning something new.' },
      { id: 'travel', title: 'Travel & food',       line: 'New places and new restaurants give me new perspectives.' },
      { id: 'home',   title: 'Tampa',               line: 'The beach, the city I chose to call home, and my Pomeranian :)' },
    ],
  },

  thinking: {
    eyebrow: 'How I think about design',
    title: 'What my projects keep teaching me.',
    points: [                                                 // her copy, given 2026-09-29
      { title: 'Start where things get lost.',
        body: 'Many of my projects begin with something slipping through the cracks. ' +
              'Finding that moment tells me what needs to be designed first.' },
      { title: 'Make complex things easier to use.',
        body: 'Whether I’m designing a website, a product, or an AI concept, I look for ' +
              'ways to make information and interactions feel more intuitive.' },
      { title: 'Design for people and the business.',
        body: 'Good design should make sense for the person using it and support the goals ' +
              'behind the experience. My marketing background taught me to think about both.' },
      { title: 'AI should make things easier.',
        body: 'I’m interested in AI when it removes steps, clarifies decisions, or makes ' +
              'complex information easier to navigate, while keeping people in control of ' +
              'the experience.' },
    ],
  },

  /* Capabilities: what she brings. The book lists all six with their lines
     from the start; placing a card in only inks its entry. Her copy, 2026-09-29,
     four lines tightened slightly (her permission) so the entries sit evenly. */
  capabilities: {
    eyebrow: 'Capabilities',
    title: 'What I bring',
    hint: 'Explore the skills behind my work.',
    skills: [
      { id: 'uxui',        name: 'UX/UI Design',       line: 'Clear interfaces and flows built around real user needs.' },
      { id: 'product',     name: 'Product Design',     line: 'Turning complex problems into useful digital products.' },
      { id: 'ai',          name: 'AI-assisted Design', line: 'Using AI to explore, build, and iterate faster.' },
      { id: 'interaction', name: 'Interaction Design', line: 'How people move through and interact with products.' },
      { id: 'prototype',   name: 'Prototyping',        line: 'Turning ideas into experiences people can test.' },
      { id: 'visual',      name: 'Visual Design',      line: 'Type, color, layout, and storytelling with intention.' },
    ],
  },

  /* Tools: what she uses. Every entry is an official mark: Simple Icons SVGs in
     each brand's own color, or `file` for the PNGs she supplied (2026-09-29).
     No stand-ins. */
  tools: {
    eyebrow: 'Tools',
    note: 'Always learning and exploring new ones.',
    list: [
      { name: 'Figma',              logo: 'figma' },
      { name: 'Canva',              logo: 'canva' },
      { name: 'Adobe Photoshop',    logo: 'adobephotoshop' },
      { name: 'Adobe Illustrator',  logo: 'adobeillustrator' },
      { name: 'Adobe Premiere Pro', logo: 'adobepremierepro' },
      { name: 'Adobe InDesign',     logo: 'adobeindesign' },
      { name: 'Adobe Audition',     logo: 'adobeaudition' },
      { name: 'CapCut',             file: 'capcut.png' },
      { name: 'Framer',             logo: 'framer' },
      { name: 'WordPress',          logo: 'wordpress' },
      { name: 'Wix',                logo: 'wix' },
      { name: 'Kajabi',             file: 'kajabi.png' },
      { name: 'GitHub',             logo: 'github' },
      { name: 'Claude Code',        logo: 'claude' },
      { name: 'Codex',              logo: 'openai' },
      { name: 'Notion',             logo: 'notion' },
      { name: 'Asana',              logo: 'asana' },
      { name: 'Monday.com',         file: 'monday.png' },
      { name: 'SocialPilot',        file: 'socialpilot.png' },
      { name: 'HubSpot',            logo: 'hubspot' },
      { name: 'Constant Contact',   file: 'constantcontact.png' },
      { name: 'Birdeye',            file: 'birdeye.png' },
      { name: 'Google Analytics',   logo: 'googleanalytics' },
      { name: 'ElevenLabs',         logo: 'elevenlabs' },
    ],
  },

  close: { title: 'Let’s create something meaningful.' },
};

/* The creative archive: a marble workboard of printed pieces.
   Everything here is Nikole's own work. The LifeWorx posts are real Google
   Business Profile posts (the designs, plus screenshots of them as published);
   the rest are her original Behance uploads. Names are only what is printed
   on the work itself; nothing here states a result or makes a claim.
   Each image lists the widths it was exported at (never above its original).
   `label` on an image overrides the piece's label for that image alone.
   The first two extras are the sheets that peek out beneath the top print.
   `place` is where each stack lands: left/top and width as a percentage of
   the board, and a resting angle in degrees. */
export const archive = {
  eyebrow: 'Creative archive',
  title: 'Projects that inspire change.',
  body: 'Visual direction, campaigns, and the details that bring ideas to life.',
  hint: { pointer: 'Drag to rearrange · Click to take a closer look', touch: 'Tap a piece to take a closer look' },
  cta: { label: 'Explore the full archive', href: 'https://www.behance.net/gallery/223851969/Portfolio' },

  pieces: [
    { id: 'lifeworx', label: 'Google Business Profile', name: 'LifeWorx',
      alt: 'LifeWorx post design: a list of caregiver activities with icons, beside a photograph of a smiling senior.',
      img: { base: 'lifeworx-care', w: 1242, h: 932, widths: [480, 800, 1242] },
      extras: [
        { base: 'lifeworx-sleep', w: 1242, h: 932, widths: [480, 800, 1242], alt: 'LifeWorx post design: six numbered sleep habits arranged around a bedroom photograph.' },
        { base: 'lifeworx-dementia', w: 1242, h: 932, widths: [480, 800, 1242], alt: 'LifeWorx post design: a resource-article card on how to talk to a loved one living with dementia.' },
        { base: 'lifeworx-care-1', w: 1242, h: 1844, widths: [480, 800, 1242], alt: 'The same post as published on the LifeWorx Google Business Profile, with its date and caption.', note: 'As posted on Google · May 16, 2026' },
        { base: 'lifeworx-sleep-1', w: 1242, h: 1637, widths: [480, 800, 1242], alt: 'The same post as published on the LifeWorx Google Business Profile, with its date and caption.', note: 'As posted on Google · Jun 2, 2026' },
        { base: 'lifeworx-dementia-1', w: 1242, h: 1633, widths: [480, 800, 1242], alt: 'The same post as published on the LifeWorx Google Business Profile, with its date and caption.', note: 'As posted on Google · Sep 2, 2026' },
      ],
      place: { x: 41, y: 18, w: 17, r: 1.6 } },

    { id: 'maurie', label: 'Branding', name: 'Maurie Art',
      alt: 'Maurie Art stationery and a hanging banner in blush and terracotta.',
      img: { base: 'maurie', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400] },
      extras: [
        { base: 'maurie-1', w: 2360, h: 1653, widths: [480, 800, 1200, 1800, 2360], alt: 'A Maurie Art business card on a soft, shadowed surface.' },
        { base: 'maurie-2', w: 5000, h: 4000, widths: [480, 800, 1200, 1800, 2400], alt: 'Round Maurie Art stickers with the MA monogram.' },
      ],
      place: { x: 6, y: 6, w: 19, r: -2.4 } },
    { id: 'belle', label: 'Branding', name: 'Belle Skincare & Cosmetics',
      alt: 'Belle Skincare & Cosmetics logo over a photograph, with its typeface samples.',
      img: { base: 'belle', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400] },
      extras: [
        { base: 'belle-1', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400], alt: 'The Belle script logo on a skincare product photograph.' },
        { base: 'belle-2', w: 5829, h: 3200, widths: [480, 800, 1200, 1800, 2400], alt: 'Belle colour palette with brand photography.' },
        { base: 'belle-3', w: 2158, h: 2158, widths: [480, 800, 1200, 1800, 2158], alt: 'A grid of Belle social media posts.', label: 'Social media' },
      ],
      place: { x: 66, y: 8, w: 19.5, r: -1.5 } },
    { id: 'nutrivital', label: 'Social media', name: 'Nutri Vital',
      alt: 'Nutri Vital Instagram highlight covers and posts about recipes and healthy habits.',
      img: { base: 'nutrisocial', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400] },
      extras: [
        { base: 'nutrivital', w: 3200, h: 2800, widths: [480, 800, 1200, 1800, 2400], alt: 'Nutri Vital business cards laid out in a repeating pattern, in sage, navy and orange.', label: 'Branding' },
        { base: 'nutrivital-1', w: 3200, h: 2300, widths: [480, 800, 1200, 1800, 2400], alt: 'The Nutri Vital brand book open to its colour palette and monogram.', label: 'Branding' },
        { base: 'nutrivital-2', w: 2391, h: 2041, widths: [480, 800, 1200, 1800, 2391], alt: 'Nutri Vital letterhead and business cards beside a succulent.', label: 'Branding' },
      ],
      place: { x: 11, y: 55, w: 19, r: -1.8 } },
    { id: 'casablanca', label: 'Branding', name: 'Casa Blanca',
      alt: 'Casa Blanca Real Estate brand board: monogram, typography and colour palette.',
      img: { base: 'casablanca', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400] },
      extras: [{ base: 'casablanca-1', w: 5833, h: 3200, widths: [480, 800, 1200, 1800, 2400], alt: 'The Casa Blanca Real Estate logo on a dark evening photograph.' }],
      place: { x: 68, y: 55, w: 18, r: 2.6 } },
  ],
};

export const contact = {
  eyebrow: 'Contact',
  title: 'Let’s create what’s next.',                        // verbatim, ref 08
  body:                                                       // verbatim, given 2026-09-29
    'I’m always open to collaborations, new opportunities, and meaningful projects.',
  quote: 'Good design builds a more human future.',          // verbatim, board
  tags: ['UX/UI', 'Healthcare', 'AI', 'Technology'],         // verbatim, ref 08

  /* `download` names the file the browser saves; the PDF is a copy of the
     final one from her Resume folder, so replace it there and here together. */
  channels: [
    { id: 'email',    label: 'nikoleugueto@gmail.com', link: 'mailto:nikoleugueto@gmail.com', icon: 'mail' },
    { id: 'linkedin', label: 'LinkedIn',   link: 'https://linkedin.com/in/nikoleugueto', icon: 'link' },
    { id: 'resume',   label: 'Download Resume', link: 'assets/docs/Nikole-Ugueto-Resume.pdf', icon: 'download',
      download: 'Nikole Ugueto - Resume.pdf', cursor: 'Download' },
    { id: 'location', label: 'Tampa, FL',  link: null, icon: 'pin', static: true },
  ],
};
