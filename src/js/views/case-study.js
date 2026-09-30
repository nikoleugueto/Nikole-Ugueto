import { caseStudyById } from '../../../content/case-studies.js';
import { byId } from '../../../content/worlds.js';
import { observerRoot } from '../page-scroll.js';

/**
 * A case study.
 *
 * Presented as a project rather than as a page with a project inside it: the
 * content takes the full column, the chrome is a thin rail that reports where
 * you are and otherwise stays out of the way, and media runs full-bleed. The
 * sidebar index this replaced occupied a fifth of the screen on every scroll
 * position, which made the work feel like a passenger in someone's layout.
 *
 * Structure is finished; content is not written, and it is not invented. Each
 * unwritten chapter renders as a visibly marked placeholder carrying the brief
 * for what belongs in it, so the page is useful to write against. Fill `body`
 * in content/case-studies.js and drop `placeholder`, and the chapter renders as
 * ordinary finished work.
 *
 * The outcome chapter is deliberately the loudest placeholder on the page: the
 * reference mockups carried invented metrics, and saying plainly that the real
 * ones are not in yet beats repeating them or leaving a silent gap.
 */

function placeholder(ch) {
  if (ch.kind === 'outcome') {
    return `
      <div class="ph ph--loud">
        <p class="ph__chip">Placeholder — no metrics</p>
        <p class="ph__prompt">${ch.prompt}</p>
        <p class="ph__note">
          The numbers in the original mockups (−40% support tickets, +60% activation,
          8.5/10 satisfaction) were generated to fill a layout. They are not used
          anywhere in this build, and they should not go in here unless a real
          source exists for them.
        </p>
      </div>`;
  }
  if (ch.kind === 'media') {
    return `
      <div class="ph">
        <p class="ph__chip">Placeholder — images</p>
        <p class="ph__prompt">${ch.prompt}</p>
      </div>
      <div class="cs__media" aria-hidden="true">
        <span class="cs__frame cs__frame--wide"></span>
        <span class="cs__frame"></span>
        <span class="cs__frame"></span>
      </div>
      <p class="cs__mediacap">${ch.mediaNote || 'Images to be added'}</p>`;
  }
  if (ch.kind === 'close') {
    return `
      <div class="ph ph--slim">
        <p class="ph__chip">Placeholder</p>
        <p class="ph__prompt">${ch.prompt}</p>
      </div>`;
  }
  return `
    <div class="ph">
      <p class="ph__chip">Placeholder — writing</p>
      <p class="ph__prompt">${ch.prompt}</p>
    </div>`;
}

/** A full-viewport editorial spread carrying one already-known fact. */
function statement(st) {
  if (!st) return '';
  return `
    <section class="spread" aria-label="${st.lead}">
      <p class="spread__lead u-label">${st.lead}</p>
      <p class="spread__value">${st.value}</p>
      ${st.note ? `<p class="spread__note">${st.note}</p>` : ''}
    </section>`;
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

  const chapters = c.chapters.map((ch) => `
    ${statement(ch.statement)}
    <section class="cs__chapter" id="cs-${ch.id}" data-sec="${ch.id}"
             aria-labelledby="cs-${ch.id}-h">
      <header class="cs__chead">
        <p class="cs__ckicker u-label"><span class="cs__cno">${ch.no}</span>${ch.kicker}</p>
        <h3 class="cs__h" id="cs-${ch.id}-h">${ch.title}</h3>
      </header>
      <div class="cs__cbody">
        ${ch.placeholder || !ch.body ? placeholder(ch) : `<div class="cs__prose">${ch.body}</div>`}
      </div>
    </section>`).join('');

  const rail = c.chapters.map((ch) => `
    <li><a class="rail__dot" href="#cs-${ch.id}" data-sec="${ch.id}">
      <span class="u-visually-hidden">${ch.no} ${ch.title}</span>
    </a></li>`).join('');

  const banner = c.contentStatus === 'undefined-project'
    ? `This project is still being defined. The structure below is real and ready;
       nothing about the work itself has been written or invented.`
    : `Structure complete — content to be written. Each chapter carries the brief
       for what goes in it.`;

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
        <p class="cs__banner">${banner}</p>
      </header>

      <nav class="rail" aria-label="Chapters">
        <ol class="rail__list">${rail}</ol>
      </nav>

      <div class="cs__chapters">${chapters}</div>

      <footer class="cs__foot">
        <button class="btn" type="button" data-world data-cursor="Back to the world">
          <span aria-hidden="true">&larr;</span> Back to ${w ? w.name : 'the world'}
        </button>
      </footer>
    </article>`;

  function mount(root) {
    const cleanup = [];

    const onClick = (e) => {
      const dot = e.target.closest('.rail__dot');
      if (dot) {
        e.preventDefault();
        const el = root.querySelector(`#cs-${dot.dataset.sec}`);
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

    /* Which chapter you are in, marked on the rail. IntersectionObserver
       rather than a scroll handler: no work on frames where nothing crosses. */
    const dots = new Map([...root.querySelectorAll('.rail__dot')].map((a) => [a.dataset.sec, a]));
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const id = en.target.dataset.sec;
        if (en.isIntersecting) seen.add(id); else seen.delete(id);
      }
      dots.forEach((a, id) => a.toggleAttribute('data-current', seen.has(id)));
    }, { root: observerRoot(root), rootMargin: '-45% 0px -45% 0px' });
    root.querySelectorAll('.cs__chapter').forEach((s) => io.observe(s));
    cleanup.push(() => io.disconnect());

    /* The rail is chrome. It shows itself once you are into the piece and
       hides again at the top and the very bottom, so the project has the
       screen to itself where it matters. */
    const railEl = root.querySelector('.rail');
    const hero = root.querySelector('.cs__hero');
    const foot = root.querySelector('.cs__foot');
    const edges = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.target === hero) railEl.dataset.hidden = String(en.isIntersecting);
        if (en.target === foot && en.isIntersecting) railEl.dataset.hidden = 'true';
      }
    }, { root: observerRoot(root), rootMargin: '0px 0px -60% 0px' });
    if (hero) edges.observe(hero);
    if (foot) edges.observe(foot);
    cleanup.push(() => edges.disconnect());

    requestAnimationFrame(() => { root.querySelector('.cs').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: `case:${caseId}`, html, mount };
}
