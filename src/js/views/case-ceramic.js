import { ceramic as c } from '../../../content/ceramic.js';
import { prefs } from '../prefs.js';
import { slotRoll, draggableMarquee } from '../case-motion.js';

/* Phones show the company's short name in testimonial credits (Ceramic Pro); the
   full name stays everywhere else. Both are in the markup; CSS picks one. */
const coLabel = (title) => title.replace('Ceramic Pro Sarasota',
  '<span class="co-full">Ceramic Pro Sarasota</span><span class="co-short">Ceramic Pro</span>');

/**
 * Ceramic Pro Sarasota — Connected Operations.
 *
 * Structure: opening → the paper trail (problem) → one record (solution) →
 * the iPad, where one job travels the whole workflow → design decisions →
 * impact.
 *
 * The iPad app is laid out at a fixed 1024 × 768 and scaled to its frame, so
 * it reads as one device at every width. Everything it shows is derived from
 * a single piece of state — the job's stage — which is the case study's point:
 * one record, and every view of it agrees.
 *
 * Scoped `cps-` throughout, so this view cannot affect another screen.
 */

const P = c.product;
const H = P.hero;
const S = P.stages;
const TEAM = Object.fromEntries(P.teams.map((t) => [t.id, t.label]));
const money = (n) => '$' + n.toLocaleString('en-US');
const TOTAL = H.services.reduce((s, x) => s + x.price, 0);
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const ICON_EXPAND = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 3.5h4v4M7.5 16.5h-4v-4M16.5 3.5l-5 5M3.5 16.5l5-5"/></svg>';
const ICON_COLLAPSE = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 8.5H12V4M3.5 11.5H8V16M12 8l4.5-4.5M8 12l-4.5 4.5"/></svg>';

const label = (no, kicker) => `<p class="u-label cps-label"><span>${no}</span>${kicker}</p>`;

/* Pipeline columns group the nine stages into what a shop actually scans for. */
const COLUMNS = [
  { title: 'New leads',   stages: ['lead'] },
  { title: 'Quoted',      stages: ['quote'] },
  { title: 'Scheduled',   stages: ['job'] },
  { title: 'In the bay',  stages: ['production', 'qc'] },
  { title: 'To be paid',  stages: ['invoice', 'payment'] },
  { title: 'Done',        stages: ['pickup', 'maintenance'] },
];

const ICON = {
  today:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>',
  pipeline: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="4.5" height="15" rx="1"/><rect x="9.75" y="4.5" width="4.5" height="10" rx="1"/><rect x="16" y="4.5" width="4.5" height="6.5" rx="1"/></svg>',
  job:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5 6.6 10a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4l1.6 5.5M4 15.5h16v3H4zM7 18.5V20M17 18.5V20"/></svg>',
  spark:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9zM18.5 3.5v3M17 5h3"/></svg>',
  key:      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M20 12v2.5"/></svg>',
  // The permanent tag on the physical key. Same pattern every job; the record changes, not the tag.
  qr:       '<svg viewBox="0 0 21 21" aria-hidden="true"><path fill-rule="evenodd" d="M0 0h7v7h-7zM1 1v5h5v-5zM2 2h3v3h-3zM14 0h7v7h-7zM15 1v5h5v-5zM16 2h3v3h-3zM0 14h7v7h-7zM1 15v5h5v-5zM2 16h3v3h-3zM11 0h1v1h-1zM8 1h1v1h-1zM12 1h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM10 2h1v1h-1zM12 2h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM10 3h1v1h-1zM12 3h1v1h-1zM9 4h1v1h-1zM10 4h1v1h-1zM12 4h1v1h-1zM8 5h1v1h-1zM11 5h1v1h-1zM12 5h1v1h-1zM8 6h1v1h-1zM10 6h1v1h-1zM11 6h1v1h-1zM0 8h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM8 8h1v1h-1zM9 8h1v1h-1zM10 8h1v1h-1zM11 8h1v1h-1zM14 8h1v1h-1zM15 8h1v1h-1zM16 8h1v1h-1zM17 8h1v1h-1zM19 8h1v1h-1zM20 8h1v1h-1zM0 9h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM8 9h1v1h-1zM11 9h1v1h-1zM12 9h1v1h-1zM14 9h1v1h-1zM15 9h1v1h-1zM16 9h1v1h-1zM17 9h1v1h-1zM18 9h1v1h-1zM19 9h1v1h-1zM0 10h1v1h-1zM1 10h1v1h-1zM5 10h1v1h-1zM7 10h1v1h-1zM8 10h1v1h-1zM9 10h1v1h-1zM12 10h1v1h-1zM13 10h1v1h-1zM15 10h1v1h-1zM16 10h1v1h-1zM19 10h1v1h-1zM20 10h1v1h-1zM0 11h1v1h-1zM1 11h1v1h-1zM3 11h1v1h-1zM5 11h1v1h-1zM6 11h1v1h-1zM9 11h1v1h-1zM11 11h1v1h-1zM12 11h1v1h-1zM13 11h1v1h-1zM16 11h1v1h-1zM17 11h1v1h-1zM18 11h1v1h-1zM20 11h1v1h-1zM0 12h1v1h-1zM3 12h1v1h-1zM4 12h1v1h-1zM5 12h1v1h-1zM6 12h1v1h-1zM10 12h1v1h-1zM17 12h1v1h-1zM19 12h1v1h-1zM20 12h1v1h-1zM12 13h1v1h-1zM15 13h1v1h-1zM17 13h1v1h-1zM20 13h1v1h-1zM12 14h1v1h-1zM13 14h1v1h-1zM14 14h1v1h-1zM15 14h1v1h-1zM18 14h1v1h-1zM19 14h1v1h-1zM20 14h1v1h-1zM11 15h1v1h-1zM15 15h1v1h-1zM18 15h1v1h-1zM19 15h1v1h-1zM20 15h1v1h-1zM9 16h1v1h-1zM10 16h1v1h-1zM11 16h1v1h-1zM12 16h1v1h-1zM14 16h1v1h-1zM19 16h1v1h-1zM20 16h1v1h-1zM8 17h1v1h-1zM10 17h1v1h-1zM16 17h1v1h-1zM18 17h1v1h-1zM19 17h1v1h-1zM20 17h1v1h-1zM8 18h1v1h-1zM11 18h1v1h-1zM13 18h1v1h-1zM15 18h1v1h-1zM19 18h1v1h-1zM20 18h1v1h-1zM8 19h1v1h-1zM11 19h1v1h-1zM12 19h1v1h-1zM13 19h1v1h-1zM16 19h1v1h-1zM18 19h1v1h-1zM19 19h1v1h-1zM8 20h1v1h-1zM11 20h1v1h-1zM12 20h1v1h-1zM13 20h1v1h-1zM15 20h1v1h-1zM16 20h1v1h-1zM17 20h1v1h-1zM18 20h1v1h-1zM19 20h1v1h-1zM20 20h1v1h-1z"/></svg>',
  camera:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3.2L9 6h6l1.8 2.5H20v10H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
};

/* Line drawings for the four condition shots: front/rear head-on, sides in profile. */
const CAR = {
  side: '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M8 40h104v-7l-10-3-16-10H44L28 30 12 32z"/><circle cx="32" cy="42" r="7"/><circle cx="88" cy="42" r="7"/><path d="M47 21l-9 9h28V21zM70 21v9h24l-13-9z"/></svg>',
  head: '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M26 44V30l8-13h52l8 13v14z"/><path d="M36 19h48l6 11H30z"/><rect x="30" y="34" width="14" height="5" rx="2"/><rect x="76" y="34" width="14" height="5" rx="2"/><path d="M28 44v6h10v-6M82 44v6h10v-6"/></svg>',
};
const angleShape = (a) => (/side/i.test(a) ? CAR.side : CAR.head);

/** Lets each scrap on the board be dragged anywhere inside the board, with a
 *  short glide on release. Uses the CSS `translate` property, so the scraps'
 *  own tilt and hover lift (which live in `transform`) are untouched. */
function pinboard(board) {
  if (!board) return () => {};
  const glideOK = !prefs.reducedMotion;
  let top = 10;
  const offs = []; // cleanups

  board.querySelectorAll('.cps-scrap').forEach((el) => {
    let x = 0, y = 0, grab = null, raf = 0;
    const set = () => { el.style.translate = `${x}px ${y}px`; };

    // Keep the whole scrap inside the board, whatever its tilt.
    const clamp = () => {
      const b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
      const PAD = 6; // room for the 4px hover lift, so nothing ever pokes past the edge
      const left = r.left - x, right = r.right - x, topE = r.top - y, bottom = r.bottom - y;
      const nx = Math.min(Math.max(x, b.left - left), b.right - right);
      const ny = Math.min(Math.max(y, b.top + PAD - topE), b.bottom - PAD - bottom);
      const hit = nx !== x || ny !== y;
      x = nx; y = ny;
      return hit;
    };

    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      cancelAnimationFrame(raf);
      grab = { id: e.pointerId, px: e.clientX, py: e.clientY, x, y, vx: 0, vy: 0, t: performance.now() };
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = String(++top);
      el.classList.add('is-dragging');
    };
    const move = (e) => {
      if (!grab || e.pointerId !== grab.id) return;
      const now = performance.now(), dt = Math.max(1, now - grab.t);
      const nx = grab.x + (e.clientX - grab.px), ny = grab.y + (e.clientY - grab.py);
      // velocity, lightly smoothed, for the glide on release
      grab.vx = grab.vx * .6 + ((nx - x) / dt) * .4;
      grab.vy = grab.vy * .6 + ((ny - y) / dt) * .4;
      grab.t = now;
      x = nx; y = ny;
      clamp(); set();
    };
    const up = (e) => {
      if (!grab || e.pointerId !== grab.id) return;
      let { vx, vy } = grab;
      grab = null;
      el.classList.remove('is-dragging');
      if (!glideOK || Math.hypot(vx, vy) < .05) return;
      let last = performance.now();
      const glide = (now) => {
        const dt = Math.min(32, now - last); last = now;
        x += vx * dt; y += vy * dt;
        const f = Math.pow(.992, dt);      // friction: a short, soft settle
        vx *= f; vy *= f;
        if (clamp()) { vx *= .3; vy *= .3; }
        set();
        if (Math.hypot(vx, vy) > .02) raf = requestAnimationFrame(glide);
      };
      raf = requestAnimationFrame(glide);
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    offs.push(() => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    });
  });
  return () => offs.forEach((fn) => fn());
}

export function ceramicCaseView({ onBack, onUp, onWorld }) {
  const html = `
    <article class="cps" data-case="ceramic">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-world>Technology</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">Ceramic Pro</span>
      </nav>

      <header class="cps-open">
        ${label(c.no, c.kicker)}
        <img class="cps-open__logo" src="${c.logo.src}" alt="${c.logo.alt}"
             width="${c.logo.w}" height="${c.logo.h}" decoding="async" fetchpriority="high">
        <h2 class="cps-open__title" data-reveal>${c.title}</h2>
        <p class="cps-open__lede" data-reveal>${c.lede}</p>
        <p class="cps-open__about" data-reveal>${c.about}</p>
        <dl class="cps-id" data-reveal>
          <dt class="u-label">${c.role.label}</dt>
          <dd>
            <span class="cps-id__value">${c.role.value}</span>
          </dd>
        </dl>
      </header>

      <!-- 02 — the same job, as five records that disagree -->
      <section class="cps-problem" aria-labelledby="cps-problem-h">
        <div class="cps-problem__text" data-reveal>
          ${label(c.problem.no, c.problem.kicker)}
          <h3 class="cps-h" id="cps-problem-h">${c.problem.title}</h3>
          <p class="cps-body">${c.problem.body}</p>
          <ol class="cps-notes">
            ${c.problem.notes.map((n) => `<li><span class="cps-pin" aria-hidden="true">${n.n}</span>${n.text}</li>`).join('')}
          </ol>
        </div>

        <div class="cps-board" data-reveal role="img"
             aria-label="The same job recorded five ways: a printed work order, a spreadsheet row, a text thread, an invoice and a sticky note, each with a different order number or status.">
          <figure class="cps-scrap cps-scrap--ticket">
            <p class="cps-ticket__h">Work order</p>
            <p class="cps-ticket__no">No. 2418 <span class="cps-pin">1</span></p>
            <p>Tesla Mdl Y &middot; white</p>
            <p>Full front PPF</p>
            <p>Gold ceramic</p>
            <p class="cps-hand">cust asked abt tint??</p>
          </figure>

          <figure class="cps-scrap cps-scrap--sheet">
            <table>
              <thead><tr><th>Order</th><th>Vehicle</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>2415</td><td>911</td><td>In progress</td></tr>
                <tr class="is-hit"><td>2418</td><td>Model Y</td><td>Scheduled <span class="cps-pin">2</span></td></tr>
                <tr><td>2411</td><td>X5</td><td>Done</td></tr>
              </tbody>
            </table>
          </figure>

          <figure class="cps-scrap cps-scrap--chat">
            <p class="cps-bubble">is the white tesla done??</p>
            <p class="cps-bubble cps-bubble--me">think so, check w bay 2</p>
            <p class="cps-bubble">which order # is it <span class="cps-pin">2</span></p>
          </figure>

          <figure class="cps-scrap cps-scrap--invoice">
            <p class="cps-inv__h">Invoice INV-1187</p>
            <p>Order <b>#2481</b> <span class="cps-pin">1</span></p>
            <p>Whitfield, D.</p>
            <p class="cps-inv__due">Balance due ${money(TOTAL - H.deposit)}</p>
            <p class="cps-stamp">Unpaid? <span class="cps-pin">3</span></p>
          </figure>

          <figure class="cps-scrap cps-scrap--sticky">
            <p class="cps-hand">Dana &mdash; Model Y<br>pickup Fri??<br>#248&hellip;? <span class="cps-pin">1</span></p>
          </figure>
        </div>
      </section>

      <!-- 03 — one record, every team attached -->
      <section class="cps-solution" aria-labelledby="cps-solution-h">
        <div class="cps-solution__head" data-reveal>
          ${label(c.solution.no, c.solution.kicker)}
          <h3 class="cps-h" id="cps-solution-h">${c.solution.title}</h3>
          <p class="cps-body">${c.solution.body}</p>
        </div>

        <div class="cps-record" data-reveal>
          <div class="cps-record__top">
            <span class="cps-record__id">${H.id}</span>
            <span class="cps-record__who">${H.customer} &middot; ${H.vehicle}</span>
            <span class="cps-record__what">${H.services.map((s) => s.name).join(' + ')}</span>
          </div>
          <ol class="cps-rail">
            ${S.map((st) => {
              const team = c.solution.teams.find((t) => t.stages.includes(st.id));
              return `<li class="cps-rail__step" data-team="${team.id}">
                <button class="cps-rail__go" type="button" data-goto="${st.id}" data-cursor="See it in the app"
                        aria-label="Show the ${st.label} stage in the app">
                  <span class="cps-rail__dot" aria-hidden="true"></span>
                  <span class="cps-rail__label">${st.label}</span>
                  <span class="cps-rail__team">${team.label}</span>
                </button>
              </li>`;
            }).join('')}
          </ol>
        </div>
      </section>

      <!-- the product -->
      <section class="cps-lab" aria-labelledby="cps-lab-h">
        <div class="cps-lab__head" data-reveal>
          <h3 class="cps-lab__h" id="cps-lab-h">${P.title}</h3>
          <p class="cps-lab__sub">${P.body}</p>
        </div>

        <div class="cps-ipad" data-reveal>
          <button class="cps-expand" type="button" data-expand aria-expanded="false"
                  aria-label="Enlarge the app" title="Enlarge the app" data-cursor="Enlarge">${ICON_EXPAND}</button>
          <div class="cps-ipad__frame">
            <span class="cps-ipad__cam" aria-hidden="true"></span>
            <div class="cps-ipad__screen" data-screen>
              <div class="cps-app" role="group" aria-label="Operations app prototype">
                <aside class="cps-side">
                  <img class="cps-side__logo" src="/assets/img/logo-ceramicpro-white.png" alt="Ceramic Pro Sarasota" width="322" height="113">
                  <nav class="cps-nav" aria-label="App">
                    <button type="button" data-nav="today">${ICON.today}<span>Today</span></button>
                    <button type="button" data-nav="pipeline">${ICON.pipeline}<span>Pipeline</span></button>
                    <button type="button" data-nav="record">${ICON.job}<span>${H.id}</span></button>
                  </nav>
                  <p class="cps-side__foot">Concept<br>sample data</p>
                </aside>
                <div class="cps-main">
                  <header class="cps-top">
                    <p class="cps-top__title" data-title></p>
                    <div class="cps-seg" role="group" aria-label="Viewing as">
                      <span class="cps-seg__label">Viewing as</span>
                      ${P.teams.map((t) => `<button type="button" data-team="${t.id}">${t.label}</button>`).join('')}
                    </div>
                  </header>
                  <div class="cps-body-app" data-body aria-live="polite"></div>
                </div>
                <p class="cps-toast" data-toast role="status"></p>
              </div>
            </div>
          </div>
        </div>

        <p class="cps-full-wrap">
          <button class="cps-full-btn" type="button" data-open-full>${ICON_EXPAND}<span>Open the app full screen</span></button>
        </p>

        <div class="cps-now" data-reveal>
          <p class="cps-now__step" data-step></p>
          <p class="cps-now__say" data-say></p>
          <button class="cps-now__reset" type="button" data-reset>Start the job over</button>
        </div>

        <div class="cps-ripple" data-reveal>
          <p class="u-label cps-ripple__h">Who sees the update</p>
          <ul class="cps-ripple__list">
            ${P.teams.map((t) => `
              <li class="cps-ripple__item" data-ripple="${t.id}">
                <span class="cps-ripple__team">${t.label}</span>
                <span class="cps-ripple__text">&mdash;</span>
              </li>`).join('')}
            <li class="cps-ripple__item" data-ripple="customer">
              <span class="cps-ripple__team">Dana</span>
              <span class="cps-ripple__text">&mdash;</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- evidence from the real shop, between the product and the decisions -->
      <section class="cps-evidence" aria-labelledby="cps-evidence-h">
        <div class="cps-evidence__head" data-reveal>
          ${label(c.exploration.no, c.exploration.kicker)}
          <h3 class="cps-h" id="cps-evidence-h">${c.evidence.title}</h3>
          <p class="cps-body">${c.evidence.body}</p>
        </div>
        <ol class="cps-ev">
          ${c.evidence.shots.map((f) => `
            <li class="cps-ev__item" data-reveal>
              <figure class="cps-ev__fig">
                <img class="cps-ev__img" src="/assets/img/${f.name}-${f.widths[0]}.webp"
                     srcset="${f.widths.map((w) => `/assets/img/${f.name}-${w}.webp ${w}w`).join(', ')}"
                     sizes="(min-width: 64rem) 20vw, (min-width: 46rem) 40vw, 80vw"
                     width="${f.w}" height="${f.h}" alt="${f.alt}" decoding="async" loading="lazy">
                <figcaption class="cps-ev__cap">
                  ${f.caption}
                  <span class="cps-ev__shaped">Shaped &rarr; ${f.shaped}</span>
                </figcaption>
              </figure>
            </li>`).join('')}
        </ol>
      </section>

      <!-- 04 — decisions -->
      <section class="cps-explore" aria-labelledby="cps-explore-h">
        <div class="cps-explore__head" data-reveal>
          <h3 class="cps-h" id="cps-explore-h">${c.exploration.title}</h3>
          <p class="cps-body">${c.exploration.body}</p>
        </div>
        <ol class="cps-points">
          ${c.exploration.points.map((p) => `
            <li class="cps-point" data-reveal>
              <h4 class="cps-point__title">${p.title}</h4>
              <p class="cps-point__body">${p.body}</p>
            </li>`).join('')}
        </ol>
      </section>

      <!-- testimonial: the same drifting band as LifeWorx/Castillo, in this
           case study's own deep slate blue -->
      <section class="cps-testimonials">
        <div class="cps-testimonials__scroll">
          <div class="cps-testimonials__track">
            ${c.testimonials.map((t, i) => `
              <div class="cps-testimonial" data-index="${i}">
                <blockquote class="cps-testimonial__quote">${t.quote}</blockquote>
                <p class="cps-testimonial__attribution">
                  <span class="cps-testimonial__name">${t.name}</span>
                  <span class="cps-testimonial__title">${coLabel(t.title)}</span>
                </p>
              </div>
            `).join('')}
            ${c.testimonials.map((t, i) => `
              <div class="cps-testimonial" data-index="${i}" aria-hidden="true">
                <blockquote class="cps-testimonial__quote">${t.quote}</blockquote>
                <p class="cps-testimonial__attribution">
                  <span class="cps-testimonial__name">${t.name}</span>
                  <span class="cps-testimonial__title">${coLabel(t.title)}</span>
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 05 — impact -->
      <section class="cps-impact" data-reveal aria-labelledby="cps-impact-h">
        ${label(c.impact.no, c.impact.kicker)}
        <p class="cps-metric__value" id="cps-impact-h">${c.impact.value}</p>
        <p class="u-label cps-metric__label">${c.impact.label}</p>
        <p class="cps-metric__note">${c.impact.note}</p>
        <ul class="cps-results">
          ${c.impact.results.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </section>

      <footer class="cps-foot">
        <button class="btn" type="button" data-world data-cursor="Back to Technology">
          <span aria-hidden="true">&larr;</span> Back to Technology
        </button>
      </footer>
    </article>`;

  function mount(root) {
    const cleanup = [];
    const $ = (s) => root.querySelector(s);

    const onNav = (e) => {
      if (e.target.closest('.cps-app')) return;
      if (e.target.closest('[data-world]')) return onWorld();
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onNav);
    cleanup.push(() => root.removeEventListener('click', onNav));

    /* --- reveals (same contract as the other case studies) ----------------- */
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

    cleanup.push(slotRoll($('.cps-metric__value'), { root }));
    cleanup.push(draggableMarquee($('.cps-testimonials__track'), $('.cps-testimonials__scroll')));

    /* --- the paper trail can be picked up and moved around its board ------- */
    cleanup.push(pinboard($('.cps-board')));

    /* --- the iPad: one fixed layout, scaled to its frame ------------------- */
    const screen = $('[data-screen]');
    const fit = () => screen.style.setProperty('--s', String(screen.clientWidth / 1024));
    fit();
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(fit);
      ro.observe(screen);
      cleanup.push(() => ro.disconnect());
    }

    /* --- optional focus view (the same control as the Castillo case) -------
       Lifts the live iPad out of the page over a dimmed backdrop and scales it
       until the whole frame just fits the screen. */
    const article = $('.cps');
    const ipad = $('.cps-ipad');
    const lab = $('.cps-lab');
    const expandBtn = $('[data-expand]');
    const focusBg = Object.assign(document.createElement('div'), { className: 'cps-focus' });
    focusBg.setAttribute('aria-hidden', 'true');
    const closeBtn = Object.assign(document.createElement('button'), {
      type: 'button', className: 'cps-expand cps-expand--close', innerHTML: ICON_COLLAPSE, hidden: true,
    });
    closeBtn.setAttribute('aria-label', 'Return to the page');
    closeBtn.title = 'Return to the page';
    article.append(focusBg, closeBtn);

    const EDGE = 20, MAX_SCALE = 2;
    let open = null;     // { s, dx, cy, cyTop, cyBottom }
    let settle = 0;
    const place = (animate) => {
      ipad.style.transition = animate ? `transform var(--dur-l) var(--ease-mid)` : 'none';
      ipad.style.transform = `translate(${open.dx}px, ${open.cy - open.mid}px) scale(${open.s})`;
    };

    /* --- full screen on phones and portrait tablets ------------------------
       There the enlarge control does something different: the live app fills
       the screen and reflows into a phone layout (tab bar, one column), so it
       reads at full size instead of as a shrunken iPad. The stage is
       transformed, so "fixed" is relative to its scrolled content: the app is
       measured and pulled onto the screen, as the focus view does. */
    const fullMQ = matchMedia('(max-width: 46rem), (max-width: 1179px) and (orientation: portrait)');
    const phoneMQ = matchMedia('(max-width: 46rem)');
    let full = null;     // { trigger }

    function openFull(trigger) {
      if (full) return;
      root.scrollTo({ top: root.scrollTop, behavior: 'instant' });
      full = { trigger };
      root.style.overflow = 'hidden';
      document.documentElement.dataset.appFull = 'true';
      article.dataset.appFull = 'true';
      ipad.dataset.full = 'true';
      ipad.style.setProperty('--full-top', '0px');
      const top = `${-ipad.getBoundingClientRect().top}px`;
      ipad.style.setProperty('--full-top', top);
      article.style.setProperty('--focus-top', top);
      closeBtn.hidden = false;
      requestAnimationFrame(() => { closeBtn.dataset.on = 'true'; });
      expandBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus({ preventScroll: true });
    }

    function closeFull() {
      if (!full) return;
      const { trigger } = full;
      full = null;
      delete ipad.dataset.full;
      delete article.dataset.appFull;
      delete document.documentElement.dataset.appFull;
      ipad.style.removeProperty('--full-top');
      root.style.overflow = '';
      closeBtn.dataset.on = 'false';
      closeBtn.hidden = true;
      expandBtn.setAttribute('aria-expanded', 'false');
      fit();
      trigger?.focus?.({ preventScroll: true });
    }

    // Phones: the iPad is a preview, so a tap anywhere on it opens the app.
    const onPreviewTap = (e) => {
      if (full || !phoneMQ.matches || e.target.closest('[data-expand]')) return;
      openFull(ipad);
    };
    ipad.addEventListener('click', onPreviewTap);
    const openBtn = $('[data-open-full]');
    openBtn.addEventListener('click', () => openFull(openBtn));
    cleanup.push(() => { if (full) closeFull(); ipad.removeEventListener('click', onPreviewTap); });

    function expand() {
      if (fullMQ.matches) return openFull(expandBtn);
      root.scrollTo({ top: root.scrollTop, behavior: 'instant' });   // halt any glide first
      const r = ipad.getBoundingClientRect();
      clearTimeout(settle);
      root.style.overflow = 'hidden';
      root.style.scrollbarGutter = 'stable';
      lab.dataset.focus = 'true';                       // let the iPad leave its section
      article.style.setProperty('--focus-top', '0px');
      article.style.setProperty('--focus-top', `${-focusBg.getBoundingClientRect().top}px`);
      closeBtn.hidden = false;

      // As large as the screen allows with the whole frame in view: never
      // cropped, and clear of the close button's column.
      const c = closeBtn.getBoundingClientRect();
      const side = innerWidth - c.left + 12;
      const s = Math.max(1, Math.min((innerHeight - 2 * EDGE) / r.height, (innerWidth - 2 * side) / r.width, MAX_SCALE));
      const mid = r.top + r.height / 2;
      const cy = innerHeight / 2;
      open = { s, mid, dx: innerWidth / 2 - (r.left + r.width / 2), cy, cyTop: cy, cyBottom: cy };

      ipad.dataset.expanded = 'true';
      place(true);
      focusBg.dataset.on = 'true';
      requestAnimationFrame(() => { closeBtn.dataset.on = 'true'; });
      expandBtn.setAttribute('aria-expanded', 'true');
      closeBtn.focus({ preventScroll: true });
    }

    function collapse() {
      if (!open) return;
      open = null;
      ipad.style.transition = `transform var(--dur-l) var(--ease-mid)`;
      ipad.style.transform = '';
      focusBg.dataset.on = 'false';
      closeBtn.dataset.on = 'false';
      expandBtn.setAttribute('aria-expanded', 'false');
      expandBtn.focus({ preventScroll: true });
      const ms = parseFloat(getComputedStyle(ipad).transitionDuration) * 1000 || 0;
      settle = setTimeout(() => {
        delete ipad.dataset.expanded;
        delete lab.dataset.focus;
        ipad.style.transition = '';
        root.style.overflow = '';
        root.style.scrollbarGutter = '';
        closeBtn.hidden = true;
      }, ms + 60);
    }

    const pan = (dy) => {
      if (!open || open.cyTop === open.cyBottom) return;
      open.cy = Math.min(open.cyTop, Math.max(open.cyBottom, open.cy - dy));
      place(false);
    };

    expandBtn.addEventListener('click', expand);
    closeBtn.addEventListener('click', () => (full ? closeFull() : collapse()));
    focusBg.addEventListener('click', collapse);

    // The app's own lists still scroll first; the wheel moves the iPad otherwise.
    const onWheel = (e) => {
      if (!open) return;
      const inner = e.target.closest?.('.cps-body-app, .cps-log');
      if (inner && ((e.deltaY > 0 && inner.scrollTop + inner.clientHeight < inner.scrollHeight - 1) || (e.deltaY < 0 && inner.scrollTop > 0))) return;
      e.preventDefault();
      pan(e.deltaY);
    };
    // Escape closes the enlarged view first, before the site's own Escape
    // (which leaves the case study) gets to see it. Arrows move a tall iPad.
    const onKey = (e) => {
      if (full && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeFull(); return; }
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); collapse(); }
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); pan(e.key === 'PageDown' ? 400 : 80); }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); pan(e.key === 'PageUp' ? -400 : -80); }
    };
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    document.addEventListener('keydown', onKey, true);
    // Full screen survives a resize (a phone's toolbar or keyboard moving);
    // the in-page enlargement does not.
    const onResize = () => { if (!full) collapse(); };
    addEventListener('resize', onResize);
    cleanup.push(() => {
      document.removeEventListener('wheel', onWheel, { capture: true });
      document.removeEventListener('keydown', onKey, true);
      removeEventListener('resize', onResize);
      clearTimeout(settle);
      root.style.overflow = '';
      root.style.scrollbarGutter = '';
    });

    /* --- state: the job's stage is the only thing that really changes ------ */
    const fresh = () => ({
      i: 0,
      view: 'record',
      team: 'sales',
      log: [{ team: 'sales', text: `Quote request received from the ${H.source}.`, at: 'Last night' }],
      message: null,
      photos: [],
      solved: new Set(),
    });
    let st = fresh();
    const stage = () => S[st.i];

    const body = $('[data-body]');
    const toastEl = $('[data-toast]');
    let toastT = 0;
    const toast = (text) => {
      toastEl.textContent = text;
      toastEl.dataset.on = 'true';
      clearTimeout(toastT);
      toastT = setTimeout(() => { toastEl.dataset.on = 'false'; }, 2600);
    };
    cleanup.push(() => clearTimeout(toastT));

    /* Every job in the shop right now, with Dana's at its live stage. */
    const jobs = () => [
      { id: H.id, customer: H.customer, vehicle: H.vehicle, service: 'Front PPF + Gold coating', stage: stage().id, hero: true },
      ...P.others,
    ];

    /* ---- the record ------------------------------------------------------ */
    const serviceState = () => (st.i < 3 ? 'Scheduled' : st.i === 3 ? 'In progress' : 'Done');
    const invoiceState = () => (st.i < 5 ? ['Not yet', 'muted'] : st.i === 5 ? ['Ready to send', 'warn']
      : st.i === 6 ? ['Sent · awaiting payment', 'warn'] : ['Paid in full', 'ok']);

    // Photos are the first thing Production does once the car is in the bay.
    const needsPhotos = () => st.i === 3 && !st.photos.length;
    // The key tag's life: waiting for the car, in the locker, ready, then back in use.
    // What the permanent QR tag points at right now.
    const keyLink = () => (st.i < 3 ? 'QR tag · links to this job at check-in'
      : st.i < 8 ? `QR tag · linked to ${H.id}` : 'QR tag · unlinked, ready for the next job');
    const keyState = () => (st.i < 3 ? ['Waiting for check-in', 'muted'] : st.i < 7 ? ['In the locker', 'live']
      : st.i === 7 ? ['Available to pick up', 'ok'] : ['Returned · tag free to reuse', 'muted']);

    const part = (team) => (st.team === team ? ' is-yours' : '');
    const yours = (team) => (st.team === team ? '<span class="cps-yours">Your part</span>' : '');

    const record = () => {
      const s = stage();
      const [inv, invTone] = invoiceState();
      const paidDeposit = st.i >= 2;
      const paidAll = st.i >= 7;
      return `
        <div class="cps-rec">
          <div class="cps-rec__head">
            <div>
              <p class="cps-rec__eyebrow">${H.id} &middot; ${H.bay}</p>
              <h4 class="cps-rec__title">${H.vehicle}</h4>
              <p class="cps-rec__meta">${H.customer} &middot; ${H.color}</p>
            </div>
            <span class="cps-status" data-tone="${s.id === 'maintenance' ? 'ok' : 'live'}">${s.status}</span>
          </div>

          <ol class="cps-steps" aria-label="Job progress">
            ${S.map((x, k) => `<li class="${k < st.i ? 'is-done' : k === st.i ? 'is-now' : ''}"><i></i><span>${x.label}</span></li>`).join('')}
          </ol>

          <div class="cps-rec__grid">
            <div class="cps-rec__col">
              <section class="cps-card cps-card--next">
                <p class="cps-card__h">Next step</p>
                ${needsPhotos()
                  ? `<p class="cps-next__text">Production &middot; Before service</p>
                     <button class="cps-cta" type="button" data-photos>Add before-service photos</button>`
                  : s.next
                  ? `<p class="cps-next__text">${TEAM[s.team]} &middot; ${s.status}</p>
                     <button class="cps-cta" type="button" data-advance>${s.next}</button>`
                  : `<p class="cps-next__text">Nothing left to do today. Next visit: coating check in 12 months.</p>`}
              </section>

              ${st.i >= 3 ? `
              <section class="cps-card cps-card--photos${part('production')}">
                <p class="cps-card__h">Before service ${yours('production')}</p>
                ${st.photos.length
                  ? `<ul class="cps-shots">
                      ${st.photos.map((p) => `<li><span class="cps-shot__img">${angleShape(p.angle)}</span><span class="cps-shot__cap">${p.angle}</span></li>`).join('')}
                    </ul>
                    <p class="cps-card__foot">${st.photos.length} photos &middot; attached to ${H.id} &middot; ${st.photos[0].at}</p>`
                  : `<p class="cps-shots__empty">Capture the vehicle condition before work begins.</p>
                     <button class="cps-btn cps-btn--cam" type="button" data-photos>${ICON.camera}<span>Add photos</span></button>`}
              </section>` : ''}

              <section class="cps-card${part('production')}">
                <p class="cps-card__h">Services ${yours('production')}</p>
                <ul class="cps-lines">
                  ${H.services.map((x) => `<li><span>${x.name}</span><span class="cps-pill" data-tone="${serviceState() === 'Done' ? 'ok' : serviceState() === 'In progress' ? 'live' : 'muted'}">${serviceState()}</span></li>`).join('')}
                  <li><span>Quality check</span><span class="cps-pill" data-tone="${st.i > 4 ? 'ok' : st.i === 4 ? 'live' : 'muted'}">${st.i > 4 ? 'Passed' : st.i === 4 ? 'Checking' : 'Waiting'}</span></li>
                </ul>
              </section>

              <section class="cps-card${part('finance')}">
                <p class="cps-card__h">Payment ${yours('finance')}</p>
                <dl class="cps-money">
                  <div><dt>Quote</dt><dd>${money(TOTAL)}</dd></div>
                  <div><dt>Deposit</dt><dd>${paidDeposit ? money(H.deposit) + ' paid' : 'On approval'}</dd></div>
                  <div><dt>Balance</dt><dd>${paidAll ? money(0) : money(TOTAL - (paidDeposit ? H.deposit : 0))}</dd></div>
                  <div><dt>Invoice</dt><dd><span class="cps-pill" data-tone="${invTone}">${st.i >= 5 ? H.invoice + ' · ' : ''}${inv}</span></dd></div>
                </dl>
                <p class="cps-card__foot">Sample figures for the concept.</p>
              </section>
            </div>

            <div class="cps-rec__col">
              <section class="cps-card${part('sales')}">
                <p class="cps-card__h">Customer ${yours('sales')}</p>
                <p class="cps-cust__name">${H.customer}</p>
                <p class="cps-cust__meta">${H.phone} &middot; via ${H.source}</p>
                ${st.message
                  ? `<p class="cps-msg"><span class="cps-msg__who">Text sent</span>${esc(st.message)}</p>`
                  : '<p class="cps-msg cps-msg--none">No messages sent yet.</p>'}
              </section>

              <section class="cps-card cps-card--key">
                <p class="cps-card__h">Key</p>
                <div class="cps-key">
                  <span class="cps-qr" title="Permanent QR tag on the key">${ICON.qr}</span>
                  <span class="cps-key__id">
                    <span class="cps-key__tag">${ICON.key}${H.key.tag}</span>
                    <span class="cps-key__where">${H.key.locker} &middot; ${H.key.slot}</span>
                    <span class="cps-key__link">${keyLink()}</span>
                  </span>
                  <span class="cps-pill" data-tone="${keyState()[1]}">${keyState()[0]}</span>
                </div>
                <ol class="cps-chain" aria-label="What this key is connected to">
                  <li><span>Job</span><b>${H.id}</b></li>
                  <li><span>Vehicle</span><b>${H.vehicle}</b></li>
                  <li><span>Customer</span><b>${H.customer}</b></li>
                  <li><span>Invoice</span><b>${st.i >= 5 ? `${H.invoice} &middot; ${paidAll ? 'Paid' : money(TOTAL - H.deposit) + ' open'}` : 'Created after quality check'}</b></li>
                </ol>
              </section>

              <section class="cps-card cps-card--log${part('management')}">
                <p class="cps-card__h">Activity ${yours('management')}</p>
                <ol class="cps-log">
                  ${st.log.slice().reverse().map((l, k) => `
                    <li class="${k === 0 ? 'is-new' : ''}">
                      <span class="cps-tag" data-team="${l.team}">${TEAM[l.team]}</span>
                      <span class="cps-log__text">${esc(l.text)}</span>
                      <span class="cps-log__at">${l.at}</span>
                    </li>`).join('')}
                </ol>
              </section>
            </div>
          </div>
        </div>`;
    };

    /* ---- today: the numbers, and what the assistant noticed --------------- */
    const count = (ids) => jobs().filter((j) => ids.includes(j.stage)).length;

    const liveInsights = () => P.insights
      .filter((x) => !st.solved.has(x.id))
      .filter((x) => st.team === 'management' || x.teams.includes(st.team))
      .map((x) => {
        if (x.id !== 'unpaid') return x;
        const heroOwes = ['invoice', 'payment'].includes(stage().id);
        return {
          ...x,
          body: heroOwes
            ? `Priya Shah’s X5 and Dana Whitfield’s Model Y are finished, but their invoices are still open.`
            : `Priya Shah’s X5 was finished on Tuesday, but the invoice is still open.`,
          act: heroOwes ? 'Open Dana’s job' : 'Send Priya a reminder',
          done: heroOwes ? null : 'Friendly reminder sent to Priya.',
          open: heroOwes,
        };
      });

    const today = () => {
      const ins = liveInsights();
      const kpis = [
        ['New leads', count(['lead'])],
        ['In the bay', count(['production', 'qc'])],
        ['Ready for pickup', count(['pickup'])],
        ['Open invoices', count(['invoice', 'payment'])],
      ];
      return `
        <div class="cps-today">
          <p class="cps-today__hello">Good morning. Here’s the shop today.</p>
          <div class="cps-kpis">
            ${kpis.map(([k, v]) => `<div class="cps-kpi"><b>${v}</b><span>${k}</span></div>`).join('')}
          </div>

          <div class="cps-today__grid">
            <section class="cps-card cps-card--ai">
              <p class="cps-card__h"><span class="cps-ai">${ICON.spark}</span> Worth a look
                <span class="cps-card__hint">Suggestions only. Nothing changes until someone acts.</span></p>
              ${ins.length ? `<ul class="cps-ins">
                ${ins.map((x) => `
                  <li class="cps-in" data-tone="${x.tone}">
                    <p class="cps-in__title">${x.title}</p>
                    <p class="cps-in__body">${x.body}</p>
                    <p class="cps-in__why">Why: ${x.why}</p>
                    <div class="cps-in__acts">
                      <button type="button" class="cps-btn cps-btn--primary" data-act="${x.id}">${x.act}</button>
                      <button type="button" class="cps-btn" data-dismiss="${x.id}">Dismiss</button>
                    </div>
                  </li>`).join('')}
              </ul>` : '<p class="cps-clear">All clear. Nothing needs you right now.</p>'}
            </section>

            <section class="cps-card cps-card--follow">
              <p class="cps-card__h">Following</p>
              <p class="cps-follow__title">${H.vehicle}</p>
              <p class="cps-follow__meta">${H.customer} &middot; ${H.id}</p>
              <span class="cps-status" data-tone="live">${stage().status}</span>
              <div class="cps-mini" aria-hidden="true">${S.map((x, k) => `<i class="${k < st.i ? 'is-done' : k === st.i ? 'is-now' : ''}"></i>`).join('')}</div>
              <button type="button" class="cps-btn cps-btn--primary" data-nav="record">Open the job</button>
            </section>
          </div>
        </div>`;
    };

    /* ---- pipeline: the whole shop, Dana's card among the rest ------------- */
    const pipeline = () => `
      <div class="cps-board-app">
        ${COLUMNS.map((col) => {
          const list = jobs().filter((j) => col.stages.includes(j.stage));
          return `
            <section class="cps-col">
              <p class="cps-col__h">${col.title}<i>${list.length}</i></p>
              ${list.map((j) => `
                <${j.hero ? 'button type="button" data-nav="record"' : 'div'} class="cps-jc${j.hero ? ' is-hero' : ''}">
                  ${j.hero ? '<span class="cps-jc__tag">Following</span>' : ''}
                  <span class="cps-jc__id">${j.id}</span>
                  <span class="cps-jc__car">${j.vehicle}</span>
                  <span class="cps-jc__who">${j.customer}</span>
                  <span class="cps-jc__svc">${j.service}</span>
                  ${j.hero ? `<span class="cps-jc__st">${stage().status}</span>` : j.flag ? `<span class="cps-jc__flag">${j.flag}</span>` : ''}
                </${j.hero ? 'button' : 'div'}>`).join('')}
            </section>`;
        }).join('')}
      </div>`;

    const TITLES = { today: 'Today', pipeline: 'Pipeline', record: `Job ${H.id}` };
    const views = { today, pipeline, record };

    /* ---- the portfolio layer under the iPad ------------------------------- */
    const stepEl = $('[data-step]');
    const sayEl = $('[data-say]');
    const ripples = Object.fromEntries([...root.querySelectorAll('[data-ripple]')].map((el) => [el.dataset.ripple, el]));

    const narrate = () => {
      stepEl.textContent = `Step ${st.i + 1} of ${S.length} · ${stage().label}`;
      sayEl.textContent = stage().say;
    };
    const ripple = (sees, message) => {
      for (const [id, el] of Object.entries(ripples)) {
        const text = id === 'customer' ? message : sees?.[id];
        const t = el.querySelector('.cps-ripple__text');
        if (!text) { el.dataset.hit = 'false'; continue; }
        t.textContent = text;
        el.dataset.hit = 'false';
        void el.offsetWidth;               // restart the pulse
        el.dataset.hit = 'true';
      }
    };
    const clearRipple = () => Object.values(ripples).forEach((el) => {
      el.dataset.hit = 'false';
      el.querySelector('.cps-ripple__text').textContent = '—';
    });

    function render() {
      body.innerHTML = views[st.view]();
      body.dataset.view = st.view;
      $('[data-title]').textContent = TITLES[st.view];
      root.querySelectorAll('.cps-nav [data-nav]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.nav === st.view)));
      root.querySelectorAll('.cps-seg [data-team]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.team === st.team)));
      narrate();
    }

    const CLOCK = ['8:04 AM', '8:31 AM', '8:02 AM', '11:40 AM', '1:15 PM', '1:22 PM', '2:48 PM', '4:30 PM'];
    function advance() {
      const s = stage();
      if (!s.next) return;
      if (s.log) st.log.push({ ...s.log, at: CLOCK[st.i] || 'Now' });
      if (s.customer) st.message = s.customer;
      st.i += 1;
      render();
      ripple(s.sees, s.customer);
    }

    function addPhotos(quiet = false) {
      if (st.photos.length) return;
      st.photos = H.angles.map((angle) => ({ angle, at: '8:10 AM' }));
      st.log.push({ team: 'production', text: `${st.photos.length} before-service photos attached.`, at: '8:10 AM' });
      if (quiet) return;
      render();
      ripple({ production: 'Before-service photos attached', management: 'Vehicle condition on record before work' }, null);
    }

    const app = $('.cps-app');
    app.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { st.view = nav.dataset.nav; return render(); }
      const team = e.target.closest('[data-team]');
      if (team && team.closest('.cps-seg')) { st.team = team.dataset.team; return render(); }
      if (e.target.closest('[data-advance]')) return advance();
      if (e.target.closest('[data-photos]')) return addPhotos();

      const act = e.target.closest('[data-act]');
      if (act) {
        const x = liveInsights().find((y) => y.id === act.dataset.act);
        if (!x) return;
        if (x.open) { st.view = 'record'; return render(); }
        st.solved.add(x.id);
        render();
        return toast(x.done);
      }
      const dis = e.target.closest('[data-dismiss]');
      if (dis) { st.solved.add(dis.dataset.dismiss); render(); return toast('Dismissed. It won’t come back unless something changes.'); }
    });

    /* The Solution rail: each stage opens Dana's job at that point. The job is
       replayed step by step, so its history, texts and photos all agree. */
    root.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => {
      const target = S.findIndex((x) => x.id === b.dataset.goto);
      st = { ...fresh(), team: st.team };
      clearRipple();
      let last = null;
      while (st.i < target) {
        if (st.i === 3) addPhotos(true);
        last = stage();
        if (last.log) st.log.push({ ...last.log, at: CLOCK[st.i] || 'Now' });
        if (last.customer) st.message = last.customer;
        st.i += 1;
      }
      st.view = 'record';
      render();
      if (last) ripple(last.sees, last.customer);
      const lab = $('.cps-lab');
      root.scrollTo({ top: root.scrollTop + lab.getBoundingClientRect().top, behavior: prefs.reducedMotion ? 'auto' : 'smooth' });
    }));

    $('[data-reset]').addEventListener('click', () => {
      const keep = { view: st.view, team: st.team };
      st = { ...fresh(), ...keep };
      clearRipple();
      render();
    });

    render();

    requestAnimationFrame(() => { $('.cps').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'case:ceramic', html, mount };
}
