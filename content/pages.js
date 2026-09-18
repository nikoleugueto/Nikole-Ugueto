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

export const archive = {
  eyebrow: 'Creative archive',
  title: 'Visual storytelling for stronger connections.',    // verbatim, board
  body:                                                       // verbatim, board
    'Through photography, illustration and visual design, I create content that ' +
    'communicates ideas, builds brand presence and brings stories to life across ' +
    'different platforms.',
  tags: ['Brand', 'Social', 'Editorial'],                     // verbatim, board

  /* Intentionally empty. The brief describes this as a lightweight,
     Behance-style index — and the marketing work that would fill it lives in
     Nikole's work files, which this project does not reach into. Drop images
     into assets/img/archive/ and add an entry here; each becomes a tile. */
  pieces: [],
  placeholderCount: 6,
  dropHint: 'assets/img/archive/',
};

export const contact = {
  eyebrow: 'Contact',
  title: 'Let’s create what’s next.',                        // verbatim, ref 08
  body:                                                       // verbatim, ref 08
    'I’m always open to new opportunities, collaborations and meaningful projects.',
  quote: 'Good design builds a more human future.',          // verbatim, board
  tags: ['UX/UI', 'Healthcare', 'AI', 'Technology'],         // verbatim, ref 08

  channels: [
    { id: 'email',    label: 'nikoleugueto@gmail.com', link: 'mailto:nikoleugueto@gmail.com', icon: 'mail' },
    { id: 'linkedin', label: 'LinkedIn',   link: null, icon: 'link',     note: 'Profile URL to add' },
    { id: 'cv',       label: 'Download CV', link: null, icon: 'download', note: 'PDF to add to assets/' },
    { id: 'location', label: 'New York, NY', link: null, icon: 'pin',    static: true },
  ],
};
