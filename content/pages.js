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

export const about = {
  eyebrow: 'About',
  title: 'Designing for people, not just products.',        // verbatim, ref 07
  intro:                                                     // verbatim, board
    'I’m Nikole, a UX/UI designer with a background in healthcare, AI and ' +
    'technology. I bring together empathy, strategy and design to build digital ' +
    'experiences that are intuitive, accessible and centered on people.',

  // verbatim, ref 07 — names only. No proficiency levels: the reference shows
  // plain rules, and inventing a self-assessment would be making something up.
  capabilities: [
    'UX/UI Design', 'Product Design', 'Healthcare',
    'AI & Data', 'Visual Design', 'Collaboration',
  ],

  sections: [
    {
      id: 'story', no: '01', title: 'My story',
      placeholder: true, body: null,
      prompt: 'How you got here — what pulled you from your starting point into healthcare, then into design. A few hundred words in your own voice. This is the section people actually read.',
    },
    {
      id: 'philosophy', no: '02', title: 'Design philosophy',
      placeholder: true, body: null,
      prompt: 'What you believe about the work, stated so it could be disagreed with. Avoid anything that every designer would also sign — the useful version is the opinion that costs you something.',
    },
    {
      id: 'experience', no: '03', title: 'Experience',
      placeholder: true, body: null,
      prompt: 'Roles, organisations and dates. Kept factual; the case studies carry the depth.',
    },
    {
      id: 'tools', no: '04', title: 'Tools & technologies',
      placeholder: true, body: null,
      prompt: 'What you work in — design, prototyping, research, handoff, anything you build with. Worth noting anywhere the tool choice actually changed the outcome.',
    },
  ],

  process: {
    title: 'From insight to impact.',                        // verbatim, ref 06
    body:                                                     // verbatim, ref 06
      'My process is a balance of research, creativity and strategy. I turn ' +
      'complex problems into simple, intuitive experiences that make a real ' +
      'difference.',
    steps: [                                                  // verbatim, ref 06
      { no: '01', title: 'Understand', line: 'The people & their needs' },
      { no: '02', title: 'Define',     line: 'The real problem' },
      { no: '03', title: 'Design',     line: 'Ideas into experiences' },
      { no: '04', title: 'Build',      line: 'Interfaces & products' },
      { no: '05', title: 'Improve',    line: 'Measure & iterate' },
    ],
  },

  resume: { label: 'View resume', link: null },
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
