import { castillo as c } from '../../../content/castillo.js';
import { prefs } from '../prefs.js';
import { slotRoll, draggableMarquee } from '../case-motion.js';
import { observerRoot, revealMargin, scrollTopOf, scrollPageTo, lockScroll } from '../page-scroll.js';

/* Phones show the company's short name in testimonial credits (CHG); the
   full name stays everywhere else. Both are in the markup; CSS picks one. */
const coLabel = (title) => title.replace('Castillo Housing Group',
  '<span class="co-full">Castillo Housing Group</span><span class="co-short">CHG</span>');

/**
 * Castillo Housing Group — AI Home Design.
 *
 * Structure: opening → the real work → problem & solution → the working
 * prototype → the catalogue it reasons over → design notes → an honest close.
 *
 * The prototype is the point of the page, so it is not a screenshot and it is
 * not pinned to the scrollbar. It is a real interface the visitor drives with
 * taps, and every number in it comes out of content/castillo.js, which holds
 * Castillo's published catalogue. The scoring lives in `fit()` below: six
 * rules, each reading one published field, each printed on screen next to the
 * score it produced.
 *
 * Everything is scoped `chg-`, including the one rule that reaches up to the
 * stage, so this view cannot affect another screen.
 */

const src = (f, w) => `/assets/img/${f.name}-${w}.webp`;
const srcset = (f) => f.widths.map((w) => `${src(f, w)} ${w}w`).join(', ');

const img = (f, { cls = '', sizes = '100vw' } = {}) => `
  <img class="${cls}" src="${src(f, f.widths[0])}" srcset="${srcset(f)}"
       sizes="${sizes}" width="${f.w}" height="${f.h}" alt="${f.alt}"
       decoding="async" loading="lazy">`;

const label = (no, kicker) =>
  `<p class="u-label chg-label"><span>${no}</span>${kicker}</p>`;

const num = (n) => n.toLocaleString('en-US');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* Castillo publishes half-baths as 2.5, 3.5. Render them that way rather than
   rounding a real figure into a tidier false one. */
const baths = (p) => (p.baths ? (p.baths[0] === p.baths[1] ? `${p.baths[0]}` : `${p.baths[0]}–${p.baths[1]}`) : null);
const bedsOf = (p) => (p.beds[0] === p.beds[1] ? `${p.beds[0]}` : `${p.beds[0]}–${p.beds[1]}`);

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const ICON_EXPAND = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 3.5h4v4M7.5 16.5h-4v-4M16.5 3.5l-5 5M3.5 16.5l5-5"/></svg>';
const ICON_COLLAPSE = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 8.5H12V4M3.5 11.5H8V16M12 8l4.5-4.5M8 12l-4.5 4.5"/></svg>';

/* --------------------------------------------------------------- the model
   One function per signal. Each returns a 0–1 score and the published number
   it read, or null to abstain because Castillo has not published the field.
   Nothing here consults anything that is not in the catalogue. */
const RULES = {
  work: (p, need) => {
    const spare = p.beds[1] - need;
    return { v: clamp01(spare / 2),
             why: spare > 0 ? `${spare} extra room${spare === 1 ? '' : 's'} for a home office`
                            : 'No extra room for an office' };
  },
  guests: (p) => {
    if (!p.baths) return null;
    const ratio = p.baths[1] / p.beds[1];
    return { v: clamp01((ratio - 0.6) / 0.6),
             why: `${baths(p)} bathrooms for ${bedsOf(p)} bedrooms` };
  },
  grow: (p) => {
    const flex = p.beds[0] !== p.beds[1];
    return { v: flex ? 1 : 0.12,
             why: flex ? `Can be built with ${bedsOf(p)} bedrooms`
                       : `Built with ${p.beds[1]} bedrooms` };
  },
  gather: (p) => {
    const per = p.sqft / p.beds[1];
    return { v: clamp01((per - 650) / 1350),
             why: `About ${num(Math.round(per))} sq ft of living space per bedroom` };
  },
  upkeep: (p) => ({
    v: clamp01((6800 - p.sqft) / 4300),
    why: `${num(p.sqft)} sq ft to look after`,
  }),
  wellness: (p) => ({
    v: clamp01((p.sqft - 3400) / 4200),
    why: `${num(p.sqft)} sq ft to make your own`,
  }),
};

/** How well one plan answers what the visitor said. */
function fit(plan, active, need) {
  const parts = active.map((id) => {
    const r = RULES[id](plan, need);
    return { id, ...(r || { v: null, why: 'Castillo hasn’t shared the bathroom count' }), abstained: !r };
  });
  const scored = parts.filter((p) => p.v !== null);
  const avg = scored.length ? scored.reduce((s, p) => s + p.v, 0) / scored.length : 0.5;

  // A home that cannot house you is not a near miss, so the gate is steep.
  const bed = plan.beds[1] >= need
    ? (plan.beds[0] <= need ? 1 : 0.82)
    : clamp01(1 - (need - plan.beds[1]) * 0.45);

  const top = scored.slice().sort((a, b) => b.v - a.v)[0] || null;
  return { score: Math.round(100 * (0.72 * avg + 0.28 * bed)), parts, top, bed };
}

export function castilloCaseView({ onBack, onUp, onWorld }) {
  const P = c.product;
  const plansById = Object.fromEntries(P.plans.map((p) => [p.id, p]));

  const html = `
    <article class="chg" data-case="castillo">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-world>Artificial Intelligence</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">Castillo</span>
      </nav>

      <header class="chg-open">
        ${label(c.no, c.kicker)}
        <img class="chg-open__logo" src="${c.logo.src}" alt="${c.logo.alt}"
             width="${c.logo.w}" height="${c.logo.h}" decoding="async" fetchpriority="high">
        <h2 class="chg-open__title" data-reveal>${c.title}</h2>
        <p class="chg-open__lede" data-reveal>${c.lede}</p>
        <p class="chg-open__about" data-reveal>${c.about}</p>
        <dl class="chg-id" data-reveal>
          <dt class="u-label">${c.role.label}</dt>
          <dd>
            <span class="chg-id__value">${c.role.value}</span>
            <a class="chg-live" href="${c.live.href}" target="_blank" rel="noopener noreferrer"
               data-cursor="Open the live site">${c.live.label}<span aria-hidden="true">&#8599;&#xFE0E;</span></a>
          </dd>
        </dl>
      </header>

      <section class="chg-duals" data-reveal>
        <div class="chg-dual">
          ${label(c.problem.no, c.problem.kicker)}
          <h3 class="chg-dual__h">${c.problem.title}</h3>
          <p class="chg-dual__body">${c.problem.body}</p>
        </div>
        <div class="chg-dual">
          ${label(c.solution.no, c.solution.kicker)}
          <h3 class="chg-dual__h">${c.solution.title}</h3>
          <p class="chg-dual__body">${c.solution.body}</p>
        </div>
      </section>

      <section class="chg-lab" aria-labelledby="chg-lab-h">
        <div class="chg-lab__head" data-reveal>
          <h3 class="chg-lab__h" id="chg-lab-h">${P.title}</h3>
          <p class="chg-lab__sub">${P.body}</p>
        </div>

        <div class="chg-lab__grid">
          <aside class="chg-notes" data-reveal>
            <ol class="chg-notes__list">
              ${P.steps.map((s, i) => `
                <li class="chg-notes__item" data-note="${s.id}">
                  <span class="u-label chg-notes__no">${String(i + 1).padStart(2, '0')}</span>
                  <span class="chg-notes__label">${s.label}</span>
                  <span class="chg-notes__say"></span>
                </li>`).join('')}
            </ol>
            <p class="chg-notes__honesty">${P.honesty}</p>
          </aside>

          <div class="chg-stage" data-reveal>
            <div class="chg-phone">
              <button class="chg-expand" type="button" data-expand aria-expanded="false"
                    aria-label="Enlarge the prototype" title="Enlarge the prototype" data-cursor="Enlarge">${ICON_EXPAND}<span class="chg-expand__txt" aria-hidden="true">Full screen</span></button>
              <div class="chg-phone__frame">
                <span class="chg-phone__island" aria-hidden="true"></span>
                <div class="chg-phone__screen">
                  <div class="chg-app">
                    <header class="chg-app__bar">
                      <button class="chg-app__back" type="button" data-app-back hidden
                              aria-label="Back a step"><span aria-hidden="true">&larr;</span></button>
                      <p class="chg-app__title">AI Home Design</p>
                      <span class="chg-app__chip u-label">Concept</span>
                    </header>
                    <div class="chg-app__body" data-app-body role="group" aria-live="polite"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chg-plot" data-reveal>
          <p class="u-label chg-plot__label">Explore 16 of Castillo’s published home designs</p>
          <div class="chg-plot__rail" data-plot></div>
          <p class="chg-plot__scale"><span>2,330 sq ft</span><span>10,425 sq ft</span></p>
        </div>
      </section>

      <section class="chg-build" aria-labelledby="chg-build-h">
        <div class="chg-build__head" data-reveal>
          <h3 class="chg-build__h" id="chg-build-h">${c.build.title}</h3>
          <p class="chg-build__sub">${c.build.body}</p>
        </div>

        <ol class="chg-arc" data-arc data-reveal></ol>

        <div class="chg-switch" data-reveal role="group" aria-label="Whose view">
          <button class="chg-switch__b" type="button" data-view="owner" aria-pressed="true">
            <span class="chg-switch__who">Homeowner</span>
            <span class="chg-switch__dev">on a phone, in a showroom</span>
          </button>
          <button class="chg-switch__b" type="button" data-view="builder" aria-pressed="false">
            <span class="chg-switch__who">Builder</span>
            <span class="chg-switch__dev">at a desk, working a queue</span>
          </button>
        </div>

        <div class="chg-surfaces" data-reveal>
          <div class="chg-surface" data-surface="owner">
            <div class="chg-phone chg-phone--owner">
              <button class="chg-expand" type="button" data-expand aria-expanded="false"
                    aria-label="Enlarge the homeowner view" title="Enlarge the homeowner view" data-cursor="Enlarge">${ICON_EXPAND}<span class="chg-expand__txt" aria-hidden="true">Full screen</span></button>
              <div class="chg-phone__frame">
                <span class="chg-phone__island" aria-hidden="true"></span>
                <div class="chg-phone__screen">
                  <div class="chg-app">
                    <header class="chg-app__bar">
                      <button class="chg-app__back" type="button" data-own-back hidden
                              aria-label="Back"><span aria-hidden="true">&larr;</span></button>
                      <p class="chg-app__title">AI Home Design</p>
                      <span class="chg-app__chip u-label">Concept</span>
                    </header>
                    <div class="chg-app__body" data-own-body aria-live="polite"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chg-surface" data-surface="builder" hidden>
            <button class="chg-expand" type="button" data-expand aria-expanded="false"
                    aria-label="Enlarge the builder view" title="Enlarge the builder view" data-cursor="Enlarge">${ICON_EXPAND}<span class="chg-expand__txt" aria-hidden="true">Full screen</span></button>
            <div class="chg-desk">
              <div class="chg-desk__chrome" aria-hidden="true">
                <span></span><span></span><span></span>
                <p class="chg-desk__url">castillo.workspace / caban-residence</p>
              </div>
              <div class="chg-desk__screen" data-desk></div>
            </div>
          </div>
        </div>

        <p class="chg-build__honesty" data-reveal>${c.build.honesty}</p>
      </section>

      <section class="chg-work" data-reveal>
        ${label(c.work.no, c.work.kicker)}
        <h3 class="chg-work__h">${c.work.title}</h3>
        <p class="chg-work__body">${c.work.body}</p>
        <div class="chg-work__grid">
          ${c.work.shots.map((s) => `
            <figure class="chg-work__fig">
              ${img(s, { cls: 'chg-work__img', sizes: '(min-width: 62rem) 32vw, 90vw' })}
              <figcaption class="chg-work__cap">${s.caption}</figcaption>
            </figure>`).join('')}
        </div>
      </section>

      <figure class="chg-office" data-reveal>
        <video class="chg-office__video" muted loop playsinline preload="none"
               width="${c.office.w}" height="${c.office.h}" poster="${c.office.poster}"
               aria-label="${c.office.alt}"${prefs.reducedMotion ? ' controls' : ''}>
          ${c.office.sources.map((s) =>
            `<source src="${s.src}" type="video/mp4"${s.media ? ` media="${s.media}"` : ''}>`).join('')}
        </video>
        <figcaption class="chg-work__cap">${c.office.caption}</figcaption>
      </figure>

      <section class="chg-thinking" data-reveal>
        <div class="chg-thinking__points">
          ${c.thinking.points.map((p) => `
            <div class="chg-thinking__point">
              <h3 class="chg-thinking__title">${p.title}</h3>
              <p class="chg-thinking__body">${p.body}</p>
            </div>`).join('')}
        </div>
      </section>

      <section class="chg-close" data-reveal aria-labelledby="chg-impact-h">
        ${label(c.thinking.no, c.thinking.kicker)}
        <p class="chg-metric__value" id="chg-impact-h">${c.close.value}</p>
        <p class="u-label chg-metric__label">${c.close.label}</p>
        <p class="chg-metric__note">${c.close.note}</p>
        <ul class="chg-close__list">
          ${c.close.results.map((r) => `<li>${r.lead} ${r.rest}</li>`).join('')}
        </ul>
      </section>

      <section class="chg-testimonials">
        <div class="chg-testimonials__scroll">
          <div class="chg-testimonials__track">
            ${c.testimonials.map((t, i) => `
              <div class="chg-testimonial" data-index="${i}">
                <blockquote class="chg-testimonial__quote">${t.quote}</blockquote>
                <p class="chg-testimonial__attribution">
                  <span class="chg-testimonial__name">${t.name}</span>
                  <span class="chg-testimonial__title">${coLabel(t.title)}</span>
                </p>
              </div>
            `).join('')}
            ${c.testimonials.map((t, i) => `
              <div class="chg-testimonial" data-index="${i}" aria-hidden="true">
                <blockquote class="chg-testimonial__quote">${t.quote}</blockquote>
                <p class="chg-testimonial__attribution">
                  <span class="chg-testimonial__name">${t.name}</span>
                  <span class="chg-testimonial__title">${coLabel(t.title)}</span>
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <footer class="chg-foot">
        <button class="btn" type="button" data-world data-cursor="Back to Artificial Intelligence">
          <span aria-hidden="true">&larr;</span> Back to Artificial Intelligence
        </button>
      </footer>
    </article>`;

  function mount(root) {
    const cleanup = [];

    const onClick = (e) => {
      if (e.target.closest('[data-world]')) return onWorld();
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onClick);
    cleanup.push(() => root.removeEventListener('click', onClick));

    /* --- testimonials: drifting band the visitor can hold and drag -------- */
    cleanup.push(draggableMarquee(root.querySelector('.chg-testimonials__track'), root.querySelector('.chg-testimonials__scroll')));

    /* --- the impact figure rolls in like a slot machine ------------------- */
    cleanup.push(slotRoll(root.querySelector('.chg-metric__value'), { root: observerRoot(root) }));

    /* --- reveals (same contract as the other case study) ------------------ */
    const targets = [...root.querySelectorAll('[data-reveal]')];
    if (prefs.reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => (el.dataset.in = 'true'));
    } else {
      targets.forEach((el) => (el.dataset.in = 'false'));
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.dataset.in = 'true';
          io.unobserve(en.target);
        }
      }, { root: observerRoot(root), rootMargin: revealMargin('0px 0px -10% 0px'), threshold: 0.06 });
      targets.forEach((el) => io.observe(el));
      cleanup.push(() => io.disconnect());
    }

    /* The office footage only downloads and plays while it is on screen. It
       runs a little slower than recorded and fades out into the page before
       each loop, so the restart reads as a cut rather than a jump. */
    const office = root.querySelector('.chg-office__video');
    if (office && !prefs.reducedMotion && 'IntersectionObserver' in window) {
      const RATE = 0.85, FADE_IN = 0.35, FADE_OUT = 0.8;
      const slow = () => { office.defaultPlaybackRate = RATE; office.playbackRate = RATE; };
      slow();
      office.addEventListener('loadedmetadata', slow);

      let raf = 0;
      const fade = () => {
        const d = office.duration, t = office.currentTime;
        if (d) office.style.opacity = String(Math.max(0, Math.min(1, t / FADE_IN, (d - t) / FADE_OUT)));
        raf = requestAnimationFrame(fade);
      };
      office.addEventListener('play', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fade); });
      office.addEventListener('pause', () => cancelAnimationFrame(raf));

      const vio = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) office.play().catch(() => {});
        else office.pause();
      }, { root: observerRoot(root), threshold: 0.25 });
      vio.observe(office);
      cleanup.push(() => { vio.disconnect(); cancelAnimationFrame(raf); });
    }

    /* --- the prototype ---------------------------------------------------- */
    const body  = root.querySelector('[data-app-body]');
    const back  = root.querySelector('[data-app-back]');
    const plot  = root.querySelector('[data-plot]');
    const notes = [...root.querySelectorAll('[data-note]')];

    const state = { step: 'life', need: 4, signals: new Set(['work', 'gather']), plan: null, against: null };

    /** Every plan, scored against what has been said, best first. */
    const ranked = () => {
      const active = [...state.signals];
      return P.plans
        .map((p) => ({ plan: p, ...fit(p, active, state.need) }))
        .sort((a, b) => b.score - a.score);
    };

    const bar = (v, cls = '') =>
      `<span class="chg-bar ${cls}"><span class="chg-bar__fill" style="--v:${v}"></span></span>`;

    /* ---- screens --------------------------------------------------------- */
    const screens = {
      life: () => `
        <div class="chg-scr chg-scr--life">
          <h4 class="chg-scr__h">How do you live?</h4>

          <div class="chg-step">
            <span class="chg-step__label">How many bedrooms?</span>
            <span class="chg-step__ctrl">
              <button type="button" data-need="-1" aria-label="One fewer bedroom">−</button>
              <b data-need-val>${state.need}</b>
              <button type="button" data-need="1" aria-label="One more bedroom">+</button>
            </span>
          </div>

          <p class="u-label chg-scr__eyebrow">What matters to you</p>
          <div class="chg-chips">
            ${P.signals.map((s) => `
              <button class="chg-chip" type="button" data-signal="${s.id}"
                      aria-pressed="${state.signals.has(s.id)}">
                <span class="chg-chip__label">${s.label}</span>
                <span class="chg-chip__rule">${s.rule}</span>
              </button>`).join('')}
          </div>

          <button class="chg-cta" type="button" data-go="matches" ${state.signals.size ? '' : 'disabled'}>
            ${state.signals.size ? 'Show me homes' : 'Choose at least one'}
          </button>
        </div>`,

      matches: () => {
        const rows = ranked();
        return `
        <div class="chg-scr chg-scr--matches">
          <h4 class="chg-scr__h">${rows.length} designs to explore</h4>
          <p class="chg-scr__lede">Matching your lifestyle and ${plural(state.need, 'bedroom')}.</p>
          <ul class="chg-rows">
            ${rows.map(({ plan, score, top }) => `
              <li>
                <button class="chg-row" type="button" data-plan="${plan.id}">
                  <span class="chg-row__top">
                    <span class="chg-row__name">${plan.name}</span>
                    <span class="chg-row__score">${score}<i>%</i></span>
                  </span>
                  ${bar(score / 100)}
                  <span class="chg-row__meta">${num(plan.sqft)} sq ft · ${bedsOf(plan)} bd${baths(plan) ? ` · ${baths(plan)} ba` : ''}</span>
                  ${top ? `<span class="chg-row__why">${top.why}</span>` : ''}
                </button>
              </li>`).join('')}
          </ul>
        </div>`;
      },

      plan: () => {
        const r = ranked().find((x) => x.plan.id === state.plan) || ranked()[0];
        const p = r.plan;
        const sig = (id) => P.signals.find((s) => s.id === id);
        return `
        <div class="chg-scr chg-scr--plan">
          <h4 class="chg-scr__h">${p.name}</h4>
          <p class="chg-scr__lede">A ${r.score}% match for how you live</p>

          <div class="chg-stats">
            <div><b>${num(p.sqft)}</b><span>sq ft</span></div>
            <div><b>${bedsOf(p)}</b><span>bedrooms</span></div>
            <div><b>${baths(p) || '—'}</b><span>${baths(p) ? 'bathrooms' : 'not shared'}</span></div>
          </div>

          <p class="u-label chg-scr__eyebrow">Why it fits</p>
          <ul class="chg-why">
            ${r.parts.map((part) => `
              <li class="chg-why__item${part.abstained ? ' is-abstained' : ''}">
                <span class="chg-why__head">
                  <span class="chg-why__label">${sig(part.id).label}</span>
                  <span class="chg-why__v">${part.abstained ? 'not shared' : `${Math.round(part.v * 100)}%`}</span>
                </span>
                ${part.abstained ? '' : bar(part.v, 'chg-bar--thin')}
                <span class="chg-why__rule">${sig(part.id).rule}</span>
                <span class="chg-why__read">${part.why}</span>
              </li>`).join('')}
          </ul>

          <button class="chg-cta" type="button" data-go="compare">Compare with another home</button>
        </div>`;
      },

      compare: () => {
        const rows = ranked();
        const a = rows.find((x) => x.plan.id === state.plan) || rows[0];
        const b = rows.find((x) => x.plan.id === state.against) || rows.find((x) => x.plan.id !== a.plan.id);
        const d = (x, y) => {
          const n = x - y;
          if (!n) return '<i class="chg-cmp__same">same</i>';
          return `<i class="chg-cmp__d">${n > 0 ? '+' : '−'}${num(Math.abs(n))}</i>`;
        };
        return `
        <div class="chg-scr chg-scr--compare">
          <h4 class="chg-scr__h">Side by side</h4>
          <p class="chg-scr__lede">See how they differ. The choice is yours.</p>

          <div class="chg-cmp">
            <div class="chg-cmp__col">
              <p class="chg-cmp__name">${a.plan.name}</p>
              <p class="chg-cmp__score">${a.score}%</p>
              <dl>
                <dt>sq ft</dt><dd>${num(a.plan.sqft)} ${d(a.plan.sqft, b.plan.sqft)}</dd>
                <dt>bedrooms</dt><dd>${bedsOf(a.plan)}</dd>
                <dt>bathrooms</dt><dd>${baths(a.plan) || 'not shared'}</dd>
              </dl>
            </div>
            <div class="chg-cmp__col">
              <p class="chg-cmp__name">${b.plan.name}</p>
              <p class="chg-cmp__score">${b.score}%</p>
              <dl>
                <dt>sq ft</dt><dd>${num(b.plan.sqft)} ${d(b.plan.sqft, a.plan.sqft)}</dd>
                <dt>bedrooms</dt><dd>${bedsOf(b.plan)}</dd>
                <dt>bathrooms</dt><dd>${baths(b.plan) || 'not shared'}</dd>
              </dl>
            </div>
          </div>

          <p class="u-label chg-scr__eyebrow">Compare with</p>
          <div class="chg-pick">
            ${rows.filter((x) => x.plan.id !== a.plan.id).slice(0, 6).map((x) => `
              <button class="chg-pick__b" type="button" data-against="${x.plan.id}"
                      aria-pressed="${x.plan.id === b.plan.id}">${x.plan.name}</button>`).join('')}
          </div>
        </div>`;
      },
    };

    /* ---- the catalogue rail, which tracks the same scoring --------------- */
    const SQ_MIN = 2330, SQ_MAX = 10425;
    function paintPlot() {
      const rows = ranked();
      const best = rows[0]?.score || 1;
      plot.innerHTML = rows.map(({ plan, score }) => {
        const x = (plan.sqft - SQ_MIN) / (SQ_MAX - SQ_MIN);
        const on = score >= best - 12;
        return `<button class="chg-dot${on ? ' is-on' : ''}${plan.id === state.plan ? ' is-sel' : ''}" `
             + `type="button" data-plan="${plan.id}" style="--x:${x};--s:${score / 100}" `
             + `title="${plan.name} — ${num(plan.sqft)} sq ft, ${score}%"><span>${plan.name}</span></button>`;
      }).join('');
    }

    /* ---- render ---------------------------------------------------------- */
    function paintNotes() {
      const said = {
        life: `${state.need} bedrooms · ${state.signals.size} signal${state.signals.size === 1 ? '' : 's'}`,
        matches: `${P.plans.length} plans read`,
        plan: state.plan ? plansById[state.plan].name : '—',
        compare: state.against ? plansById[state.against].name : '—',
      };
      notes.forEach((n) => {
        const id = n.dataset.note;
        n.dataset.on = String(id === state.step);
        n.querySelector('.chg-notes__say').textContent = said[id] || '';
      });
    }

    function render() {
      body.innerHTML = screens[state.step]();
      back.hidden = state.step === 'life';
      body.dataset.step = state.step;
      paintNotes();
      paintPlot();
      // The arc's "personalize" stage reads the plan chosen upstream.
      paintArc();
    }

    const ORDER = ['life', 'matches', 'plan', 'compare'];
    const go = (step) => { state.step = step; render(); };

    body.addEventListener('click', (e) => {
      const step = e.target.closest('[data-need]');
      if (step) {
        state.need = Math.max(1, Math.min(7, state.need + Number(step.dataset.need)));
        return render();
      }
      const chip = e.target.closest('[data-signal]');
      if (chip) {
        const id = chip.dataset.signal;
        state.signals.has(id) ? state.signals.delete(id) : state.signals.add(id);
        return render();
      }
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) {
        // Arriving at compare with nothing chosen: settle on the runner-up now,
        // so the state matches what the screen is about to show.
        if (goBtn.dataset.go === 'compare' && !state.against) {
          const rows = ranked();
          const a = rows.find((x) => x.plan.id === state.plan) || rows[0];
          state.against = (rows.find((x) => x.plan.id !== a.plan.id) || rows[0]).plan.id;
        }
        return go(goBtn.dataset.go);
      }

      const pick = e.target.closest('[data-plan]');
      if (pick) { state.plan = pick.dataset.plan; return go('plan'); }

      const against = e.target.closest('[data-against]');
      if (against) { state.against = against.dataset.against; return render(); }
    });

    plot.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-plan]');
      if (!dot) return;
      state.plan = dot.dataset.plan;
      go('plan');
      root.querySelector('.chg-stage')?.scrollIntoView({ block: 'center', behavior: prefs.reducedMotion ? 'auto' : 'smooth' });
    });

    back.addEventListener('click', () => {
      const i = ORDER.indexOf(state.step);
      go(ORDER[Math.max(0, i - 1)]);
    });

    /* ====================================================================
       The workspace.

       One array, two interfaces. Both `ownerBody` and `desk` read and write
       `items` directly — there is no second copy to keep in step, which is
       the point the section is making.
       ==================================================================== */
    const B = c.build;
    const items = B.items.map((i) => ({ ...i, log: i.log.map((l) => ({ ...l })) }));
    const ws = { view: 'owner', cat: B.categories[0].id, item: null, shared: false, only: 'all' };

    const ownerBody = root.querySelector('[data-own-body]');
    const ownBack   = root.querySelector('[data-own-back]');
    const desk      = root.querySelector('[data-desk]');
    const arcEl     = root.querySelector('[data-arc]');
    const surfaces  = [...root.querySelectorAll('[data-surface]')];
    const switches  = [...root.querySelectorAll('[data-view]')];

    const byId  = (list, id) => list.find((x) => x.id === id);
    const item  = (id) => items.find((i) => i.id === id);
    const inCat = (id) => items.filter((i) => i.cat === id);

    /* Anything a visitor types is rendered back through innerHTML, so it is
       escaped on the way in rather than trusted. */
    const esc = (s) => String(s).replace(/[&<>"']/g, (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

    /* Offsets are hours from now, so the thread reads live instead of ageing
       against a hard-coded date. */
    const ago = (h) => {
      const a = Math.abs(h);
      if (a < 1) return 'just now';
      if (a < 24) return `${Math.round(a)}h ago`;
      const d = Math.round(a / 24);
      return d === 1 ? 'yesterday' : `${d}d ago`;
    };

    const counts = () => {
      const done = items.filter((i) => i.status === 'installed').length;
      const moved = items.filter((i) => i.status !== 'decide').length;
      const talk = items.reduce((n, i) => n + i.log.length, 0);
      return { done, moved, talk, must: items.filter((i) => i.priority === 'must').length };
    };

    /* The spine. Every stage carries a live number, so it reports the state of
       the record rather than decorating the page. */
    function paintArc() {
      const k = counts();
      const stat = {
        discover:    { v: `${P.plans.length} plans read`, on: true },
        personalize: { v: state.plan ? plansById[state.plan].name : 'no plan yet', on: !!state.plan },
        save:        { v: `${items.length} items`, on: items.length > 0 },
        organize:    { v: `${k.must} must have`, on: k.must > 0 },
        collaborate: { v: `${k.talk} comments`, on: k.talk > 0 },
        track:       { v: `${k.moved} of ${items.length} moved`, on: k.moved > 0 },
        complete:    { v: `${k.done} of ${items.length} installed`, on: k.done === items.length },
      };
      arcEl.innerHTML = B.arc.map((a) => `
        <li class="chg-arc__step" data-on="${stat[a.id].on}">
          <span class="u-label chg-arc__label">${a.label}</span>
          <span class="chg-arc__v">${esc(stat[a.id].v)}</span>
        </li>`).join('');
    }

    /* ---- the homeowner's phone ------------------------------------------ */
    const prioChips = (it, side) => B.priorities.map((p) => `
      <button class="chg-prio${it.priority === p.id ? ' is-on' : ''}" type="button"
              data-set-prio="${p.id}" data-on-item="${it.id}" data-side="${side}"
              aria-pressed="${it.priority === p.id}">${p.label}</button>`).join('');

    const statusRow = (it, side) => `
      <div class="chg-track" role="group" aria-label="Status">
        ${B.statuses.map((s, i) => {
          const at = B.statuses.findIndex((x) => x.id === it.status);
          return `<button class="chg-track__s${i <= at ? ' is-past' : ''}${s.id === it.status ? ' is-now' : ''}"
                     type="button" data-set-status="${s.id}" data-on-item="${it.id}" data-side="${side}"
                     aria-pressed="${s.id === it.status}"><i></i><span>${s.label}</span></button>`;
        }).join('')}
      </div>`;

    const thread = (it) => `
      <ul class="chg-thread">
        ${it.log.length ? it.log.map((l) => `
          <li class="chg-thread__m chg-thread__m--${l.by}">
            <span class="chg-thread__who">${l.by === 'owner' ? 'You' : 'Castillo'}</span>
            <span class="chg-thread__when">${ago(l.at)}</span>
            <p class="chg-thread__t">${esc(l.text)}</p>
          </li>`).join('')
        : '<li class="chg-thread__empty">No comments yet.</li>'}
      </ul>`;

    const ownerScreens = {
      cats: () => {
        const k = counts();
        return `
        <div class="chg-scr">
          <h4 class="chg-scr__h">My Home Profile</h4>
          <p class="chg-scr__lede">${items.length} things saved · ${k.must} must have</p>
          <ul class="chg-cats">
            ${B.categories.map((cat) => {
              const n = inCat(cat.id);
              const done = n.filter((i) => i.status === 'installed').length;
              return `<li>
                <button class="chg-cat" type="button" data-cat="${cat.id}">
                  <span class="chg-cat__name">${cat.label}</span>
                  <span class="chg-cat__n">${n.length ? `${n.length}` : '<i>add</i>'}</span>
                  ${n.length ? `<span class="chg-cat__bar"><i style="--v:${done / n.length}"></i></span>` : ''}
                </button></li>`;
            }).join('')}
          </ul>
          <button class="chg-cta" type="button" data-share>
            ${ws.shared ? 'Shared with Castillo · manage access' : 'Share with Castillo'}
          </button>
          <p class="chg-scr__note">${ws.shared
            ? 'Castillo sees your updates as you make them, so nothing gets lost.'
            : 'Castillo will see your choices, priorities, links and notes, and can reply to any of them.'}</p>
        </div>`;
      },

      list: () => {
        const cat = byId(B.categories, ws.cat);
        const list = inCat(ws.cat);
        return `
        <div class="chg-scr">
          <h4 class="chg-scr__h">${cat.label}</h4>
          <p class="chg-scr__lede">${list.length} saved</p>
          <ul class="chg-items">
            ${list.map((it) => `
              <li>
                <button class="chg-item" type="button" data-item="${it.id}">
                  <span class="chg-item__top">
                    ${it.swatch ? `<span class="chg-item__sw" style="--c:${it.swatch}"></span>` : ''}
                    <span class="chg-item__title">${esc(it.title)}</span>
                  </span>
                  <span class="chg-item__meta">
                    <span class="chg-flag chg-flag--${it.priority}">${byId(B.priorities, it.priority).label}</span>
                    <span class="chg-state chg-state--${it.status}">${byId(B.statuses, it.status).label}</span>
                  </span>
                  <span class="chg-item__sub">${it.brand ? esc(it.brand) + ' · ' : ''}${it.shots ? `${plural(it.shots, 'image')} · ` : ''}${plural(it.log.length, 'comment')}</span>
                </button>
              </li>`).join('') || '<li class="chg-thread__empty">Nothing saved here yet.</li>'}
          </ul>
          <button class="chg-add" type="button" data-add>+ Add to ${cat.label}</button>
        </div>`;
      },

      item: () => {
        const it = item(ws.item);
        const shots = it.shots + (it.images?.length || 0);
        return `
        <div class="chg-scr">
          <h4 class="chg-scr__h" data-live-title>${esc(it.title)}</h4>
          <p class="chg-scr__lede">${byId(B.categories, it.cat).label}</p>

          <p class="u-label chg-scr__eyebrow">Details</p>
          <div class="chg-fields">
            <label><span>What it is</span>
              <input type="text" data-edit="title" value="${esc(it.title)}" placeholder="Name it"></label>
            <label><span>Brand</span>
              <input type="text" data-edit="brand" value="${esc(it.brand || '')}" placeholder="Add a preferred brand"></label>
            <label><span>Product link</span>
              <input type="text" data-edit="link" value="${esc(it.link || '')}" placeholder="Paste a link"></label>
            <label><span>Your note</span>
              <textarea data-edit="note" rows="3" placeholder="Why this one?">${esc(it.note || '')}</textarea></label>
          </div>

          <p class="u-label chg-scr__eyebrow">Inspiration${shots ? ` · ${shots}` : ''}</p>
          ${it.images?.length ? `<div class="chg-shotgrid">
            ${it.images.map((im, n) => `<figure class="chg-shot">
              <img src="${im.url}" alt="${esc(im.name)}">
              <button type="button" data-unshot="${n}" aria-label="Remove ${esc(im.name)}">&times;</button>
            </figure>`).join('')}
          </div>` : ''}
          ${it.shots ? `<p class="chg-shots">${plural(it.shots, 'image')} saved earlier from your phone.</p>` : ''}
          <label class="chg-upload">
            <input type="file" accept="image/*" multiple data-upload hidden>
            + Add inspiration images
          </label>

          <p class="u-label chg-scr__eyebrow">Priority</p>
          <div class="chg-prios">${prioChips(it, 'own')}</div>

          <p class="u-label chg-scr__eyebrow">Status</p>
          ${statusRow(it, 'own')}

          <p class="u-label chg-scr__eyebrow">Conversation</p>
          ${thread(it)}
          <form class="chg-say" data-say="own">
            <input type="text" name="t" placeholder="Reply to Castillo…" aria-label="Add a comment" autocomplete="off">
            <button type="submit">Send</button>
          </form>
        </div>`;
      },
    };

    function renderOwner() {
      const screen = ws.item ? 'item' : (ws.cat && ws.stage === 'list' ? 'list' : 'cats');
      ownerBody.innerHTML = ownerScreens[screen]();
      ownBack.hidden = screen === 'cats';
      ownerBody.dataset.screen = screen;
    }

    /* ---- the builder's desk --------------------------------------------- */
    function renderDesk() {
      if (!ws.shared) {
        desk.innerHTML = `
          <div class="chg-desk__empty">
            <p class="chg-desk__emptyh">Nothing shared yet.</p>
            <p class="chg-desk__emptyb">The homeowner decides when this opens. Until then Castillo sees nothing — access is granted, not assumed.</p>
            <button class="chg-cta chg-cta--ghost" type="button" data-share>Share it from the homeowner’s side</button>
          </div>`;
        return;
      }
      const k = counts();
      const shown = ws.only === 'must' ? items.filter((i) => i.priority === 'must') : items;
      const sel = ws.item ? item(ws.item) : null;

      desk.innerHTML = `
        <div class="chg-desk__bar">
          <div>
            <p class="chg-desk__proj">Caban Residence</p>
            <p class="chg-desk__meta">${state.plan ? plansById[state.plan].name : 'Plan not chosen'} · shared by the homeowner</p>
          </div>
          <div class="chg-desk__stats">
            <span><b>${k.must}</b> must have</span>
            <span><b>${k.moved}</b> of ${items.length} moved</span>
            <span><b>${k.done}</b> installed</span>
          </div>
          <div class="chg-desk__filter">
            <button type="button" data-only="all" aria-pressed="${ws.only === 'all'}">All</button>
            <button type="button" data-only="must" aria-pressed="${ws.only === 'must'}">Must have</button>
          </div>
        </div>

        <div class="chg-board">
          ${B.statuses.map((s) => {
            const col = shown.filter((i) => i.status === s.id);
            return `
            <div class="chg-col" data-col="${s.id}">
              <p class="u-label chg-col__h">${s.label}<i>${col.length}</i></p>
              <ul class="chg-col__list">
                ${col.map((it) => `
                  <li>
                    <button class="chg-card${it.id === ws.item ? ' is-sel' : ''}" type="button" data-item="${it.id}">
                      <span class="chg-card__cat">${byId(B.categories, it.cat).label}</span>
                      <span class="chg-card__t">${esc(it.title)}</span>
                      <span class="chg-card__foot">
                        <span class="chg-flag chg-flag--${it.priority}">${byId(B.priorities, it.priority).label}</span>
                        ${it.log.length ? `<span class="chg-card__c">${it.log.length}</span>` : ''}
                      </span>
                    </button>
                  </li>`).join('') || '<li class="chg-col__none">—</li>'}
              </ul>
            </div>`;
          }).join('')}
        </div>

        ${sel ? `
        <aside class="chg-drawer">
          <button class="chg-drawer__x" type="button" data-close aria-label="Close">&times;</button>
          <p class="chg-drawer__cat u-label">${byId(B.categories, sel.cat).label}</p>
          <h5 class="chg-drawer__h">${esc(sel.title)}</h5>
          ${sel.brand ? `<p class="chg-drawer__brand">${esc(sel.brand)}</p>` : ''}
          ${sel.link ? `<p class="chg-link"><span aria-hidden="true">&#128279;</span> ${esc(sel.link)}</p>` : ''}
          ${sel.shots ? `<p class="chg-shots">${sel.shots} inspiration image${sel.shots === 1 ? '' : 's'}</p>` : ''}

          ${sel.note ? `<p class="u-label chg-scr__eyebrow">Homeowner’s note</p>
            <p class="chg-note">${esc(sel.note)}</p>` : ''}

          <p class="u-label chg-scr__eyebrow">Priority</p>
          <div class="chg-prios">${prioChips(sel, 'desk')}</div>

          <p class="u-label chg-scr__eyebrow">Move it</p>
          ${statusRow(sel, 'desk')}

          <p class="u-label chg-scr__eyebrow">Thread</p>
          ${thread(sel)}
          <form class="chg-say" data-say="desk">
            <input type="text" name="t" placeholder="Reply to the homeowner…" aria-label="Add a comment" autocomplete="off">
            <button type="submit">Send</button>
          </form>
        </aside>` : ''}`;
    }

    function renderWs() {
      surfaces.forEach((s) => { s.hidden = s.dataset.surface !== ws.view; });
      switches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === ws.view)));
      renderOwner();
      renderDesk();
      paintArc();
    }

    /* ---- one handler, both surfaces -------------------------------------- */
    root.addEventListener('click', (e) => {
      const view = e.target.closest('[data-view]');
      if (view) { ws.view = view.dataset.view; ws.item = null; return renderWs(); }

      if (e.target.closest('[data-share]')) {
        ws.shared = true; ws.view = 'builder'; ws.item = null; return renderWs();
      }

      const only = e.target.closest('[data-only]');
      if (only) { ws.only = only.dataset.only; return renderWs(); }

      const cat = e.target.closest('[data-cat]');
      if (cat) { ws.cat = cat.dataset.cat; ws.stage = 'list'; ws.item = null; return renderWs(); }

      // `data-item` is also used by the discover phone, so only claim the click
      // when it came from one of this section's surfaces.
      const it = e.target.closest('[data-item]');
      if (it && e.target.closest('.chg-build')) { ws.item = it.dataset.item; return renderWs(); }

      if (e.target.closest('[data-close]')) { ws.item = null; return renderWs(); }

      const prio = e.target.closest('[data-set-prio]');
      if (prio) {
        item(prio.dataset.onItem).priority = prio.dataset.setPrio;
        return renderWs();
      }

      const st = e.target.closest('[data-set-status]');
      if (st) {
        const target = item(st.dataset.onItem);
        if (target.status !== st.dataset.setStatus) {
          target.status = st.dataset.setStatus;
          target.log.push({
            by: st.dataset.side === 'desk' ? 'builder' : 'owner',
            text: `Moved to ${byId(B.statuses, st.dataset.setStatus).label}.`,
            at: 0,
          });
        }
        return renderWs();
      }

      const unshot = e.target.closest('[data-unshot]');
      if (unshot && ws.item) {
        const it = item(ws.item);
        const [gone] = it.images.splice(Number(unshot.dataset.unshot), 1);
        if (gone) URL.revokeObjectURL(gone.url);
        return renderWs();
      }

      if (e.target.closest('[data-add]')) {
        const cat = byId(B.categories, ws.cat);
        items.push({
          id: `new-${items.length}-${Date.now()}`, cat: ws.cat,
          title: `New ${cat.label.replace(/ &.*/, '').toLowerCase()} selection`,
          brand: null, link: null, priority: 'open', status: 'decide',
          shots: 0, swatch: null, at: 0, note: '', log: [],
        });
        return renderWs();
      }

      if (e.target.closest('[data-own-back]')) {
        if (ws.item) ws.item = null; else ws.stage = 'cats';
        return renderWs();
      }
    });

    /* Typing writes straight to the record. No re-render on input — that would
       take focus away mid-word — so the heading is patched in place instead. */
    root.addEventListener('input', (e) => {
      const field = e.target.closest('[data-edit]');
      if (!field || !ws.item) return;
      const it = item(ws.item);
      const key = field.dataset.edit;
      it[key] = field.value.trim() || (key === 'title' ? it.title : null);
      if (key === 'title' && field.value.trim()) {
        const h = root.querySelector('[data-live-title]');
        if (h) h.textContent = field.value.trim();
      }
    });

    /* Real files, read in the browser. Nothing is uploaded anywhere — this is a
       prototype — but the thumbnails are the visitor's own images, not a
       drawing of the feature. */
    const urls = [];
    root.addEventListener('change', (e) => {
      const picker = e.target.closest('[data-upload]');
      if (!picker || !ws.item) return;
      const it = item(ws.item);
      it.images = it.images || [];
      for (const file of picker.files) {
        if (!file.type.startsWith('image/')) continue;
        const url = URL.createObjectURL(file);
        urls.push(url);
        it.images.push({ url, name: file.name });
      }
      renderWs();
    });
    cleanup.push(() => urls.forEach((u) => URL.revokeObjectURL(u)));

    root.addEventListener('submit', (e) => {
      const form = e.target.closest('[data-say]');
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector('input');
      const text = input.value.trim();
      if (!text || !ws.item) return;
      item(ws.item).log.push({
        by: form.dataset.say === 'desk' ? 'builder' : 'owner',
        text, at: 0,
      });
      input.value = '';
      renderWs();
    });

    /* ---- optional focus view ---------------------------------------------
       Lifts a product surface out of the page and scales it to fit the
       screen, over a dimmed backdrop. The live element itself moves (not a
       copy), so everything inside keeps working while it is enlarged. */
    const article = root.querySelector('.chg');
    const focusBg = Object.assign(document.createElement('div'), { className: 'chg-focus' });
    focusBg.setAttribute('aria-hidden', 'true');
    const closeBtn = Object.assign(document.createElement('button'), {
      type: 'button', className: 'chg-expand chg-expand--close', innerHTML: ICON_COLLAPSE, hidden: true,
    });
    closeBtn.setAttribute('aria-label', 'Return to the page');
    closeBtn.title = 'Return to the page';
    article.append(focusBg, closeBtn);

    let open = null;
    let settle = 0;
    const EDGE = 24, MAX_SCALE = 1.8;

    /* --- full screen on phones ---------------------------------------------
       On a phone the enlarge control opens the surface full screen instead:
       the homeowner's app loses its phone frame and fills the screen, and the
       builder's desk gets the whole screen to itself. Same live element, so
       everything inside keeps working. The stage is transformed, so "fixed"
       is relative to its scrolled content: measured and pulled on screen. */
    const phoneMQ = matchMedia('(max-width: 46rem)');
    let full = null;     // { target, trigger }

    function openFull(trigger, target) {
      if (full) return;
      scrollPageTo(root, scrollTopOf(root));
      full = { target, trigger };
      lockScroll(root, true);
      document.documentElement.dataset.appFull = 'true';
      article.dataset.appFull = 'true';
      target.dataset.full = 'true';
      target.style.setProperty('--full-top', '0px');
      const top = `${-target.getBoundingClientRect().top}px`;
      target.style.setProperty('--full-top', top);
      article.style.setProperty('--focus-top', top);
      closeBtn.hidden = false;
      requestAnimationFrame(() => { closeBtn.dataset.on = 'true'; });
      trigger.setAttribute('aria-expanded', 'true');
      closeBtn.focus({ preventScroll: true });
    }

    function closeFull() {
      if (!full) return;
      const { target, trigger } = full;
      full = null;
      delete target.dataset.full;
      delete article.dataset.appFull;
      delete document.documentElement.dataset.appFull;
      target.style.removeProperty('--full-top');
      lockScroll(root, false);
      closeBtn.dataset.on = 'false';
      closeBtn.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus({ preventScroll: true });
    }

    function expand(trigger, target) {
      if (phoneMQ.matches) return openFull(trigger, target);
      // Halt any smooth scroll still in flight, so nothing moves after measuring.
      scrollPageTo(root, scrollTopOf(root));
      const r = target.getBoundingClientRect();
      clearTimeout(settle);
      lockScroll(root, true);
      root.style.scrollbarGutter = 'stable';
      // The stage is transformed, which makes "fixed" relative to its scrolled
      // content rather than the screen — so measure where the backdrop lands
      // and pull it onto the screen exactly, whichever way the browser resolves it.
      article.style.setProperty('--focus-top', '0px');
      article.style.setProperty('--focus-top', `${-focusBg.getBoundingClientRect().top}px`);
      closeBtn.hidden = false;

      // Two ways to fit without covering the close button (top right): full
      // height with its column kept clear, or below its row. Larger one wins.
      const c = closeBtn.getBoundingClientRect();
      const side = innerWidth - c.left + 16;
      const band = c.bottom + 16;
      const sSide = Math.min((innerWidth - 2 * side) / r.width, (innerHeight - 2 * EDGE) / r.height);
      const sBelow = Math.min((innerWidth - 2 * EDGE) / r.width, (innerHeight - band - EDGE) / r.height);
      const below = sBelow > sSide;
      const s = Math.max(1, Math.min(Math.max(sSide, sBelow), MAX_SCALE));
      const cy = below ? band + (innerHeight - band - EDGE) / 2 : innerHeight / 2;

      target.dataset.expanded = 'true';
      target.style.transform = `translate(${innerWidth / 2 - (r.left + r.width / 2)}px, ${cy - (r.top + r.height / 2)}px) scale(${s})`;
      focusBg.dataset.on = 'true';
      requestAnimationFrame(() => { closeBtn.dataset.on = 'true'; });
      trigger.setAttribute('aria-expanded', 'true');
      open = { target, trigger };
      closeBtn.focus({ preventScroll: true });
    }

    function collapse() {
      if (!open) return;
      const { target, trigger } = open;
      open = null;
      target.style.transform = '';
      focusBg.dataset.on = 'false';
      closeBtn.dataset.on = 'false';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus({ preventScroll: true });
      // Stay above the backdrop until the glide home has finished.
      const ms = parseFloat(getComputedStyle(target).transitionDuration) * 1000 || 0;
      settle = setTimeout(() => {
        delete target.dataset.expanded;
        lockScroll(root, false);
        root.style.scrollbarGutter = '';
        closeBtn.hidden = true;
      }, ms + 60);
    }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-expand]');
      if (!b) return;
      const target = b.closest('.chg-phone') || b.closest('.chg-surface')?.querySelector('.chg-desk');
      if (target) expand(b, target);
    });
    closeBtn.addEventListener('click', () => (full ? closeFull() : collapse()));
    focusBg.addEventListener('click', collapse);

    // Escape closes the enlarged view first, before the site's own Escape
    // (which leaves the case study) gets to see it.
    const onKey = (e) => {
      if (full && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeFull(); return; }
      if (open && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); collapse(); }
    };
    document.addEventListener('keydown', onKey, true);
    // Full screen survives a resize (a phone's toolbar or keyboard moving).
    const onResize = () => { if (!full) collapse(); };
    addEventListener('resize', onResize);
    cleanup.push(() => {
      if (full) closeFull();
      document.removeEventListener('keydown', onKey, true);
      removeEventListener('resize', onResize);
      clearTimeout(settle);
      lockScroll(root, false);
      root.style.scrollbarGutter = '';
    });

    renderWs();
    render();

    requestAnimationFrame(() => { root.querySelector('.chg').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'case:castillo', html, mount };
}
