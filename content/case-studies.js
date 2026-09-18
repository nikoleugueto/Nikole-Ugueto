/**
 * Case studies.
 *
 * IMPORTANT — how content works here.
 *
 * The *structure* is real and finished. The *content* is not written yet, and
 * it is not invented. Every section below carries a `prompt`: a plain-English
 * description of what belongs there, which renders on the page inside a
 * visibly marked placeholder. So the page doubles as a writing brief — replace
 * each `body` with real text and delete `placeholder: true`, and the section
 * renders as finished work.
 *
 * `known` holds the only facts stated so far: Nikole designed the UX/UI for the
 * LifeWorx website and events experience. Nothing else about the project is
 * asserted anywhere in this file.
 *
 * NO METRICS. The reference mockups contain numbers (−40% support tickets,
 * +60% activation, 8.5/10, and so on) that were generated to fill a layout.
 * They are deliberately absent, and the outcomes section says so on the page
 * rather than quietly leaving a gap.
 */

const section = (id, no, title, prompt, kind = 'prose') =>
  ({ id, no, title, prompt, kind, placeholder: true, body: null });

/** The spine every case study follows, in the order the brief asked for. */
const STRUCTURE = () => [
  section('context', '01', 'Context',
    'Who LifeWorx is, what the product does, and where this piece of work sat. Two or three sentences — enough for a reader who has never heard of them.'),
  section('problem', '02', 'The problem',
    'What was actually going wrong, stated from the user’s side rather than the business’s. What made it worth solving.'),
  section('research', '03', 'Research & discovery',
    'What you did to understand the problem — interviews, audits, analytics, stakeholder sessions — and how many of each. Findings go here only if they came from that work.',
    'list'),
  section('strategy', '04', 'UX strategy',
    'The decision you made about how to solve it, and the principles you held to. This is the section that shows judgement, so it is worth the most words.'),
  section('ia', '05', 'Information architecture',
    'How the content and navigation were reorganised, and why the old structure did not hold. A sitemap or a before/after diagram belongs here.',
    'media'),
  section('flows', '06', 'User flows',
    'The key journeys you designed, and the decisions inside them. Flow diagrams belong here.',
    'media'),
  section('wireframes', '07', 'Wireframes',
    'Low-fidelity work, and what changed between iterations. Showing a version you rejected, and why, is usually the most persuasive thing in a portfolio.',
    'media'),
  section('visual', '08', 'Visual design',
    'Type, colour, spacing, components — the system, not just the screens. Include the reasoning that ties it back to LifeWorx and its audience.',
    'media'),
  section('interaction', '09', 'Interaction design',
    'States, transitions, feedback, edge cases. What the interface does when something goes wrong, not only when it goes right.',
    'media'),
  section('final', '10', 'The final experience',
    'The finished screens, in the order someone would meet them. Captions carrying the reasoning, rather than a silent gallery.',
    'media'),
  section('outcomes', '11', 'Outcomes & impact',
    'What actually changed, with a source for each claim — an analytics dashboard, a support-ticket count, a stakeholder’s words. Anything you cannot source, leave out; an honest qualitative outcome reads better than a number you would have to defend in an interview.',
    'outcomes'),
  section('role', '12', 'My role',
    'What you did yourself, who else was involved, and how you worked with them. Be specific about the boundary — it is the first thing a hiring manager looks for.',
    'meta'),
  section('tools', '13', 'Tools',
    'What you used, and anywhere the tool choice mattered to the outcome.',
    'meta'),
  section('lessons', '14', 'What I learned',
    'What you would do differently. Concrete, not modest — the point is to show you can assess your own work.'),
];

export const caseStudies = {
  lifeworx: {
    id: 'lifeworx',
    world: 'healthcare',
    title: 'LifeWorx',
    kicker: 'Healthcare · UX/UI',
    // The one line that is actually known, from Nikole's own brief.
    subtitle: 'Redesigning the website and events experience.',
    known: {
      Role: 'UX/UI design',
      Scope: 'Website redesign · events experience',
      Year: null,          // to be filled in
      Team: null,          // to be filled in
    },
    contentStatus: 'placeholder',
    sections: STRUCTURE(),
  },

  'ai-product': {
    id: 'ai-product',
    world: 'ai',
    title: 'To be defined',
    kicker: 'AI & Data · Digital product',
    subtitle: 'A concept still being shaped.',
    known: {},
    contentStatus: 'undefined-project',
    sections: STRUCTURE(),
  },

  'saas-product': {
    id: 'saas-product',
    world: 'product',
    title: 'To be defined',
    kicker: 'Product & Tech · SaaS',
    subtitle: 'A concept still being shaped.',
    known: {},
    contentStatus: 'undefined-project',
    sections: STRUCTURE(),
  },
};

export const caseStudyFor = (worldId) =>
  Object.values(caseStudies).find((c) => c.world === worldId) || null;

export const caseStudyById = (id) => caseStudies[id] || null;
