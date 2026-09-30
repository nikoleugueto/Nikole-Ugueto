import { lifeworx as c } from '../../../content/lifeworx.js';
import { prefs } from '../prefs.js';
import { slotRoll, draggableMarquee } from '../case-motion.js';

/**
 * The LifeWorx Events case study.
 *
 * Structure: opening → problem & solution side by side → laptop mockup →
 * design exploration → motion study → impact.
 *
 * The laptop is a photograph with its screen cut to transparency, so the page
 * genuinely sits behind the bezel rather than being pasted on top of it. The
 * geometry of that hole lives in content/lifeworx.js as `laptopScreen`.
 *
 * Everything is scoped `lw-`, including the one rule that reaches up to the
 * stage, so this view cannot affect another screen.
 */

const src = (f, w) => `/assets/img/${f.name}-${w}.webp`;
const srcset = (f) => f.widths.map((w) => `${src(f, w)} ${w}w`).join(', ');

const img = (f, { cls = '', sizes = '100vw', eager = false } = {}) => `
  <img class="${cls}" src="${src(f, f.widths[0])}" srcset="${srcset(f)}"
       sizes="${sizes}" width="${f.w}" height="${f.h}" alt="${f.alt}"
       decoding="async" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;

const label = (no, kicker) =>
  `<p class="u-label lw-label"><span>${no}</span>${kicker}</p>`;

export function lifeworxCaseView({ onBack, onUp, onWorld }) {
  const m = c.machine;
  const dt = c.designThinking;
  const ms = c.motionStudy;

  const html = `
    <article class="lw" data-case="lifeworx">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-world>Healthcare</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">LifeWorx</span>
      </nav>

      <header class="lw-open">
        ${label(c.no, c.kicker)}
        <img class="lw-open__logo" src="${c.logo.src}" alt="${c.logo.alt}"
             width="${c.logo.w}" height="${c.logo.h}" decoding="async" fetchpriority="high">
        <h2 class="lw-open__title" data-reveal>${c.title}</h2>
        <p class="lw-open__lede" data-reveal>${c.lede}</p>
        <p class="lw-open__about" data-reveal>${c.about}</p>
        <dl class="lw-id" data-reveal>
          <dt class="u-label">${c.role.label}</dt>
          <dd>
            <span class="lw-id__value">${c.role.value}</span>
            <a class="lw-live" href="${c.live.href}" target="_blank" rel="noopener noreferrer"
               data-cursor="Open the live site">${c.live.label}<span aria-hidden="true">&#8599;&#xFE0E;</span></a>
          </dd>
        </dl>
      </header>

      <section class="lw-duals" data-reveal>
        <div class="lw-dual lw-dual--problem">
          ${label(c.problem.no, c.problem.kicker)}
          <h3 class="lw-dual__h" id="lw-problem-h">${c.problem.title}</h3>
          <p class="lw-dual__body">${c.problem.body}</p>
        </div>
        <div class="lw-dual lw-dual--solution">
          ${label(c.solution.no, c.solution.kicker)}
          <h3 class="lw-dual__h" id="lw-solution-h">${c.solution.title}</h3>
          <p class="lw-dual__body">${c.solution.body}</p>
        </div>
      </section>

      <section class="lw-act" data-motion="live"
               aria-label="The LifeWorx Events page, scrolling inside a laptop">
        <div class="lw-pin">
          <div class="lw-machine">
            <div class="lw-machine__screen">
              ${img(m.page, { cls: 'lw-machine__page', sizes: '(min-width: 62rem) 46vw, 76vw' })}
              <span class="lw-machine__glare" aria-hidden="true"></span>
            </div>
            ${img(m.frame, { cls: 'lw-machine__frame', sizes: '(min-width: 62rem) 86vw, 100vw' })}
          </div>
          <p class="u-label lw-hint" aria-hidden="true">${m.hint}</p>
        </div>
      </section>

      <section class="lw-thinking" data-reveal>
        ${label(dt.no, dt.kicker)}
        <div class="lw-thinking__points">
          ${dt.points.map((p) => `
            <div class="lw-thinking__point">
              <h3 class="lw-thinking__title">${p.title}</h3>
              <p class="lw-thinking__body">${p.body}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="lw-film" data-motion="live" aria-labelledby="lw-film-h">
        <div class="lw-pin lw-pin--film">
          <video class="lw-film__video" muted loop playsinline preload="none"
                 poster="${ms.poster}" aria-label="${ms.title}">
            ${ms.video.sources.map((s) =>
              `<source src="${s.src}" type="video/mp4"${s.media ? ` media="${s.media}"` : ''}>`).join('')}
          </video>
          <div class="lw-film__cap">
            <h3 class="lw-film__h" id="lw-film-h">${ms.title}</h3>
          </div>
        </div>
      </section>

      <section class="lw-metric" aria-labelledby="lw-impact-h">
        ${label(c.impact.no, c.impact.kicker)}
        <p class="lw-metric__value" id="lw-impact-h" data-reveal>${c.impact.value}</p>
        <p class="u-label lw-metric__label" data-reveal>${c.impact.label}</p>
        <p class="lw-metric__note" data-reveal>${c.impact.note}</p>

        <div class="lw-design" data-reveal>
          <ul class="lw-design__list">
            ${c.impact.design.map((d) => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      </section>

      <section class="lw-testimonials">
        <div class="lw-testimonials__scroll">
          <div class="lw-testimonials__track">
            ${c.testimonials.map((t, i) => `
              <div class="lw-testimonial" data-index="${i}">
                <blockquote class="lw-testimonial__quote">${t.quote}</blockquote>
                <p class="lw-testimonial__attribution">
                  <span class="lw-testimonial__name">${t.name}</span>
                  <span class="lw-testimonial__title">${t.title}</span>
                </p>
              </div>
            `).join('')}
            ${c.testimonials.map((t, i) => `
              <div class="lw-testimonial" data-index="${i}" aria-hidden="true">
                <blockquote class="lw-testimonial__quote">${t.quote}</blockquote>
                <p class="lw-testimonial__attribution">
                  <span class="lw-testimonial__name">${t.name}</span>
                  <span class="lw-testimonial__title">${t.title}</span>
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <footer class="lw-foot">
        <button class="btn" type="button" data-world data-cursor="Back to Healthcare">
          <span aria-hidden="true">&larr;</span> Back to Healthcare
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
    cleanup.push(draggableMarquee(root.querySelector('.lw-testimonials__track'), root.querySelector('.lw-testimonials__scroll')));

    /* --- the impact figure rolls in like a slot machine ------------------- */
    cleanup.push(slotRoll(root.querySelector('.lw-metric__value'), { root }));

    /* --- reveals ---------------------------------------------------------
       Applied here rather than in the stylesheet, so a page whose observer
       never fires shows its content instead of staying blank for good. */
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
      }, { root, rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
      targets.forEach((el) => io.observe(el));
      cleanup.push(() => io.disconnect());
    }

    /* --- the video -------------------------------------------------------
       20 MB even at 720p, so nothing is fetched until the section is reached,
       and it stops again when it leaves. With motion reduced it never plays
       on its own: the controls appear and the poster stands in. */
    const film = root.querySelector('.lw-film__video');
    if (film) {
      if (prefs.reducedMotion) {
        film.setAttribute('controls', '');
      } else if ('IntersectionObserver' in window) {
        let loaded = false;
        const fio = new IntersectionObserver((entries) => {
          for (const en of entries) {
            if (en.isIntersecting) {
              if (!loaded) { film.load(); loaded = true; }
              film.play().catch(() => film.setAttribute('controls', ''));
            } else if (loaded) {
              film.pause();
            }
          }
        }, { root, rootMargin: '25% 0px' });
        fio.observe(film);
        cleanup.push(() => fio.disconnect());
      } else {
        film.setAttribute('controls', '');
      }
      cleanup.push(() => { film.pause(); film.removeAttribute('src'); });
    }

    /* --- the two scroll-driven scenes ------------------------------------
       `--p` is how far through a pinned act you are; every other number is a
       window on it, so the choreography lives in the stylesheet and this only
       has to report progress. */
    const acts = [...root.querySelectorAll('.lw-act, .lw-film')];
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const seg = (p, a, z) => clamp01((p - a) / (z - a));

    // How much of the screenshot the screen travels through. The last third of
    // the page is footer, and parking on a footer is a dull ending.
    const PAGE_SPAN = 0.62;

    if (prefs.reducedMotion) {
      acts.forEach((a) => (a.dataset.motion = 'static'));
    } else {
      let raf = 0;
      const render = () => {
        raf = 0;
        for (const act of acts) {
          const pin = act.firstElementChild;
          const travel = act.offsetHeight - pin.offsetHeight;
          if (travel <= 0) continue;
          const p = clamp01(-act.getBoundingClientRect().top / travel);
          const s = act.style;
          s.setProperty('--p', p.toFixed(4));
          // The laptop settles early and then holds still; only the page moves.
          s.setProperty('--settle', seg(p, 0, 0.12).toFixed(4));
          s.setProperty('--page', (seg(p, 0.12, 0.95) * PAGE_SPAN).toFixed(4));
        }
      };
      const schedule = () => { if (!raf) raf = requestAnimationFrame(render); };
      root.addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      cleanup.push(() => root.removeEventListener('scroll', schedule));
      cleanup.push(() => removeEventListener('resize', schedule));
      cleanup.push(() => raf && cancelAnimationFrame(raf));
      render();
    }

    requestAnimationFrame(() => { root.querySelector('.lw').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'case:lifeworx', html, mount };
}
