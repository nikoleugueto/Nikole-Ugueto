/**
 * Case studies.
 *
 * IMPORTANT — how content works here.
 *
 * The *structure* is real and finished. The *content* is not written yet, and
 * it is not invented. Every chapter carries a `prompt`: a plain-English
 * description of what belongs there, which renders on the page inside a
 * visibly marked placeholder. So the page doubles as a writing brief — replace
 * a chapter's `body` with real text and delete `placeholder: true`, and it
 * renders as finished work.
 *
 * SIX CHAPTERS, NOT FOURTEEN.
 *
 * An earlier version walked through fourteen process steps. That reads as a
 * methodology deck rather than a piece of work: by the time a reader reaches
 * anything persuasive they have scrolled past four sections of procedure. The
 * chapters below are a narrative — what the problem was, how it was understood,
 * how it was shaped, what it became, what changed, and what it cost to learn.
 * Related process material is folded into the chapter it serves rather than
 * given a heading of its own.
 *
 * `statement` is an optional full-viewport editorial spread: one fact, set
 * large. It may only carry something already known — a role, a scope, a line
 * from the project itself. Never a number that has not been supplied.
 *
 * NO METRICS. The reference mockups contain numbers (−40% support tickets,
 * +60% activation, 8.5/10, and so on) that were generated to fill a layout.
 * They are deliberately absent, and the outcome chapter says so on the page
 * rather than quietly leaving a gap.
 */

const chapter = (id, no, title, kicker, prompt, kind = 'prose', extra = {}) =>
  ({ id, no, title, kicker, prompt, kind, placeholder: true, body: null, ...extra });

/** The narrative every case study follows. */
const STRUCTURE = (known = {}) => [
  chapter('problem', '01', 'The problem', 'Context',
    'Who they are, what was going wrong, and why it was worth solving — stated from the user’s side rather than the business’s. A reader who has never heard of them should finish this paragraph knowing what was at stake. Two or three short paragraphs.'),

  chapter('understanding', '02', 'Understanding it', 'Research & strategy',
    'What you did to understand the problem — interviews, audits, analytics, stakeholder sessions — and then the decision you made about how to solve it. Findings belong here only if they came from that work. This is the chapter that shows judgement, so give it the most words.',
    'prose',
    { statement: known.Role ? {
        lead: 'My role',
        value: known.Role,
        note: known.Scope || null,
      } : null }),

  chapter('shaping', '03', 'Shaping the experience', 'Structure',
    'How the thing got organised: the content and navigation structure, the journeys you designed, and the low-fidelity work that got you there. Showing a direction you rejected, and why, is usually the most persuasive thing in a portfolio.',
    'media',
    { mediaNote: 'Sitemap, flows, wireframes — including a rejected direction' }),

  chapter('design', '04', 'The design', 'Craft',
    'The system and the screens: type, colour, spacing, components, states, transitions, and what the interface does when something goes wrong. Then the finished work, in the order someone would meet it, with captions that carry the reasoning.',
    'media',
    { mediaNote: 'The system, the states, and the finished screens' }),

  chapter('outcome', '05', 'What changed', 'Outcome',
    'What actually changed, with a source for each claim — an analytics dashboard, a support-ticket count, a stakeholder’s words. Anything you cannot source, leave out. An honest qualitative outcome reads better than a number you would have to defend in an interview.',
    'outcome'),

  chapter('learned', '06', 'Role, tools & what I learned', 'Close',
    'What you did yourself, who else was involved, what you worked in, and what you would do differently. Be specific about the boundary of your contribution — it is the first thing a hiring manager looks for — and concrete rather than modest about the lesson.',
    'close'),
];

const lifeworxKnown = {
  Role: 'Marketing Intern · UX/UI Design',
  Scope: 'Website redesign · events experience',
  Year: null,          // to be filled in
  Team: null,          // to be filled in
};

export const caseStudies = {
  lifeworx: {
    id: 'lifeworx',
    world: 'healthcare',
    title: 'Designing for LifeWorx',
    kicker: 'Healthcare · UX/UI',
    // The one line that is actually known, from Nikole's own brief.
    subtitle: 'A new Events destination designed to make it easier for LifeWorx clients and families to discover special experiences, explore upcoming activities, and connect with their community.',
    known: lifeworxKnown,
    contentStatus: 'placeholder',
    chapters: STRUCTURE(lifeworxKnown),
  },

  castillo: {
    id: 'castillo',
    world: 'ai',
    title: 'AI Home Design',
    kicker: 'Artificial Intelligence · Digital product',
    // Real client, real catalogue, speculative product — said in the subtitle
    // so the distinction survives anywhere this line is quoted.
    subtitle: 'An AI-assisted home discovery concept built on Castillo Housing Group’s published catalogue of home designs.',
    known: {
      Role: 'Web & brand collateral · Home-design content',
      Scope: 'Real client work · speculative product concept',
    },
    contentStatus: 'written',
    chapters: [],
  },

  'saas-product': {
    id: 'saas-product',
    world: 'product',
    title: 'Connected Operations',
    kicker: 'Technology · SaaS',
    subtitle: 'A connected operations concept for automotive service teams, inspired by the everyday workflow at Ceramic Pro Sarasota.',
    known: {
      Role: 'Marketing Specialist · SaaS',
      Scope: 'Real client context · speculative product concept',
    },
    contentStatus: 'written',
    chapters: [],
  },
};

export const caseStudyFor = (worldId) =>
  Object.values(caseStudies).find((c) => c.world === worldId) || null;

export const caseStudyById = (id) => caseStudies[id] || null;
