import { caseStudyById } from '../../../content/case-studies.js';
import { byId } from '../../../content/worlds.js';

/**
 * A case study.
 *
 * The structure here is finished; the content is not written, and it is not
 * invented. Each unwritten section renders as a visibly marked placeholder
 * carrying the brief for what belongs in it, so the page is useful to write
 * against rather than being a lorem-ipsum mock. Fill `body` in
 * content/case-studies.js and drop `placeholder`, and the section renders as
 * ordinary finished work with no special treatment.
 *
 * The outcomes section is deliberately the loudest placeholder on the page.
 * The reference mockups carried invented metrics; saying plainly that the real
 * ones are not in yet is better than either repeating them or leaving a gap
 * that reads as an oversight.
 */
const MEDIA_NOTE = {
  ia: 'Sitemap or before/after structure diagram',
  flows: 'Flow diagrams',
  wireframes: 'Wireframes, including a rejected direction',
  visual: 'Type, colour and component specimens',
  interaction: 'States, transitions and edge cases',
  final: 'Final screens, in the order a user meets them',
};

function placeholderBlock(s) {
  if (s.kind === 'outcomes') {
    return `
      <div class="ph ph--loud">
        <p class="ph__chip u-label">Placeholder — no metrics</p>
        <p class="ph__prompt">${s.prompt}</p>
        <p class="ph__note">
          The numbers in the original mockups (−40% support tickets, +60% activation,
          8.5/10 satisfaction) were generated to fill a layout. They are not used
          anywhere in this build, and they should not go in here unless a real
          source exists for them.
        </p>
      </div>`;
  }
  if (s.kind === 'media') {
    return `
      <div class="ph">
        <p class="ph__chip u-label">Placeholder — images</p>
        <p class="ph__prompt">${s.prompt}</p>
        <div class="ph__frames" aria-hidden="true">
          <span class="ph__frame"></span><span class="ph__frame"></span>
        </div>
        <p class="ph__note">${MEDIA_NOTE[s.id] || 'Images to be added'}</p>
      </div>`;
  }
  if (s.kind === 'meta') {
    return `
      <div class="ph ph--slim">
        <p class="ph__chip u-label">Placeholder</p>
        <p class="ph__prompt">${s.prompt}</p>
      </div>`;
  }
  return `
    <div class="ph">
      <p class="ph__chip u-label">Placeholder — ${s.kind === 'list' ? 'method &amp; findings' : 'writing'}</p>
      <p class="ph__prompt">${s.prompt}</p>
    </div>`;
}

export function caseStudyView({ caseId, onBack, onUp, onWorld }) {
  const c = caseStudyById(caseId);
  if (!c) return null;
  const w = byId(c.world);

  const known = Object.entries(c.known).filter(([, v]) => v);
  const meta = known.length ? `
    <dl class="cs__meta">
      ${known.map(([k, v]) => `<div><dt class="u-label">${k}</dt><dd>${v}</dd></div>`).join('')}
    </dl>` : '';

  const nav = c.sections.map((s) => `
    <li><a class="cs__navlink" href="#cs-${s.id}" data-sec="${s.id}">
      <span class="cs__navno u-label">${s.no}</span><span>${s.title}</span>
    </a></li>`).join('');

  const body = c.sections.map((s) => `
    <section class="cs__section" id="cs-${s.id}" data-sec="${s.id}"
             aria-labelledby="cs-${s.id}-h">
      <p class="cs__no u-label">${s.no}</p>
      <div class="cs__content">
        <h3 class="cs__h" id="cs-${s.id}-h">${s.title}</h3>
        ${s.placeholder || !s.body
          ? placeholderBlock(s)
          : `<div class="cs__prose">${s.body}</div>`}
      </div>
    </section>`).join('');

  const banner = c.contentStatus === 'undefined-project'
    ? `<p class="cs__banner">This project is still being defined. The structure below is
       real and ready; nothing about the work itself has been written or invented.</p>`
    : `<p class="cs__banner">Structure complete — content to be written. Every section
       below carries the brief for what goes in it.</p>`;

  const html = `
    <article class="cs" data-case="${c.id}">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-world>${w ? w.name : ''}</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">${c.title}</span>
      </nav>

      <header class="cs__hero">
        <p class="u-label cs__kicker">${c.kicker}</p>
        <h2 class="cs__title">${c.title}</h2>
        <p class="cs__sub">${c.subtitle}</p>
        ${meta}
        ${banner}
      </header>

      <div class="cs__body">
        <nav class="cs__nav" aria-label="Case study sections">
          <p class="u-label cs__navhead">Sections</p>
          <ol class="cs__navlist">${nav}</ol>
        </nav>
        <div class="cs__sections">${body}</div>
      </div>

      <footer class="cs__foot">
        <button class="btn" type="button" data-world data-cursor="Back to the world">
          <span aria-hidden="true">&larr;</span> Back to ${w ? w.name : 'the world'}
        </button>
      </footer>
    </article>`;

  function mount(root) {
    const cleanup = [];
    const scroller = root;           // the stage scrolls

    const onClick = (e) => {
      const link = e.target.closest('.cs__navlink');
      if (link) {
        e.preventDefault();
        const el = root.querySelector(`#cs-${link.dataset.sec}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el?.setAttribute('tabindex', '-1');
        el?.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest('[data-world]')) return onWorld();
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onClick);
    cleanup.push(() => root.removeEventListener('click', onClick));

    /* Which section you are in, marked in the index. IntersectionObserver
       rather than a scroll handler: no work on frames where nothing crosses. */
    const links = new Map([...root.querySelectorAll('.cs__navlink')]
      .map((a) => [a.dataset.sec, a]));
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const id = en.target.dataset.sec;
        if (en.isIntersecting) seen.add(id); else seen.delete(id);
        en.target.dataset.inview = String(en.isIntersecting);
      }
      links.forEach((a, id) => a.toggleAttribute('data-current', seen.has(id)));
    }, { root: scroller, rootMargin: '-45% 0px -45% 0px' });
    root.querySelectorAll('.cs__section').forEach((s) => io.observe(s));
    cleanup.push(() => io.disconnect());

    requestAnimationFrame(() => { root.querySelector('.cs').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: `case:${caseId}`, html, mount };
}
