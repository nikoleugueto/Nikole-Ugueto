import { worlds, worldsCopy } from '../../../content/worlds.js';
import { prefs } from '../prefs.js';

/**
 * The Worlds scene.
 *
 * One island, four districts. The reference shows all four cards at rest, and
 * that is kept deliberately: nothing important is hidden behind a hover, so the
 * scene is fully readable on first sight and on a touch screen. Interest —
 * pointer, keyboard focus, or a tap — promotes one world and recedes the rest.
 *
 * Accessibility model: the left-hand list is the canonical set of controls. It
 * is always visible, in tab order, and carries the accessible names. The map
 * districts are a redundant pointer affordance for the same four actions, so
 * they are hidden from assistive technology rather than announced twice.
 */
export function worldsView({ onChoose, onBack, arrivedFrom }) {
  const list = worlds.map((w) => `
    <li class="wlist__item">
      <button class="wlist__btn" type="button" data-world="${w.id}"
              data-cursor="Enter ${w.name}">
        <span class="wlist__dot" aria-hidden="true"></span>
        <span class="wlist__name">${w.name}</span>
        <span class="u-visually-hidden"> — ${w.line}</span>
      </button>
    </li>`).join('');

  const districts = worlds.map((w) => `
    <span class="district" data-world="${w.id}" aria-hidden="true"
          style="--x:${w.district.x}; --y:${w.district.y}"></span>`).join('');

  const cards = worlds.map((w) => `
    <span class="dcard" data-world="${w.id}" data-side="${w.card.side}"
          aria-hidden="true" style="--x:${w.card.x}; --y:${w.card.y}">
      <span class="dcard__head">
        <span class="dcard__name">${w.kicker}</span>
        <span class="dcard__go" aria-hidden="true">&rarr;</span>
      </span>
      <span class="dcard__line">${w.line}</span>
    </span>`).join('');

  const journey = worlds.map((w) => `
    <li class="journey__item" data-world="${w.id}">
      <span class="journey__no u-label">${w.no}</span>
      <span class="journey__body">
        <span class="journey__line">${w.journey.line}</span>
        <span class="journey__kicker">${w.journey.kicker}</span>
      </span>
    </li>`).join('');

  /* The stacked composition gets the same four worlds as a readable index,
     plus the journey as plain text. It is not a shrunken map. */
  const index = worlds.map((w) => `
    <button class="world-row" type="button" data-world="${w.id}">
      <span class="world-row__no u-label">${w.no}</span>
      <span>
        <span class="world-row__name">${w.name}</span>
        <span class="world-row__sub">${w.line}</span>
      </span>
      <span class="world-row__go u-label" aria-hidden="true">Enter &rarr;</span>
    </button>`).join('');

  const html = `
    <div class="worlds" data-active="">
      <div class="worlds__sky" aria-hidden="true"></div>

      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">The worlds</span>
      </nav>

      <div class="worlds__grid">
        <div class="worlds__intro">
          <ul class="wlist">${list}</ul>
        </div>

        <div class="worlds__map">
          <div class="island" id="island">
            <img class="island__img"
                 src="/assets/img/worlds-island-760.webp"
                 srcset="/assets/img/worlds-island-760.webp 760w,
                         /assets/img/worlds-island-1140.webp 1140w,
                         /assets/img/worlds-island-1303.webp 1303w"
                 sizes="(min-width: 1180px) 56vw, 100vw"
                 width="1303" height="1112" decoding="async"
                 alt="An island city seen from above, floating in cloud. Four districts sit around a central fountain: pale civic buildings, glass towers, a low technical quarter, and a rose-lit plaza.">
            ${districts}
            ${cards}
          </div>
          <p class="worlds__cue u-label" aria-hidden="true">
            <span class="worlds__cue-mark"></span>${worldsCopy.cue}
          </p>
        </div>

        <nav class="worlds__index" aria-label="The worlds">${index}</nav>
      </div>
    </div>`;

  function mount(root) {
    const scene   = root.querySelector('.worlds');
    const island  = root.querySelector('#island');
    const cleanup = [];

    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      cleanup.push(() => el.removeEventListener(ev, fn, opts));
    };

    /* --- one active world, whatever pointed at it ---------------------
       Every element carrying a world gets stamped, so the stylesheet never
       has to enumerate world ids. */
    const marked = [...root.querySelectorAll('[data-world]')];
    const setActive = (id) => {
      scene.dataset.active = id || '';
      for (const el of marked) {
        el.dataset.state = !id ? 'rest' : el.dataset.world === id ? 'on' : 'off';
      }
    };

    marked.forEach((el) => {
      const id = el.dataset.world;
      on(el, 'pointerenter', () => setActive(id));
      on(el, 'pointerleave', () => setActive(null));
      on(el, 'focus', () => setActive(id), true);
      on(el, 'blur', () => setActive(null), true);
    });

    on(root, 'click', (e) => {
      if (e.target.closest('[data-back]')) { onBack(); return; }
      const hit = e.target.closest('[data-world]');
      if (!hit) return;
      const id = hit.dataset.world;
      setActive(id);
      // Aim the departure at the district you picked, then hand over.
      const w = worlds.find((x) => x.id === id);
      island.style.setProperty('--focus-x', `${w.district.x * 100}%`);
      island.style.setProperty('--focus-y', `${w.district.y * 100}%`);
      scene.dataset.leaving = id;
      const delay = prefs.reducedMotion ? 0 : 880;
      setTimeout(() => onChoose(id), delay);
    });

    /* --- depth: the island leans toward the pointer -------------------
       Small numbers on purpose. It should read as the object having a near
       side and a far side, not as a toy tilting about. */
    if (!prefs.reducedMotion && prefs.finePointer) {
      let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      const MAX = 2.6;
      const frame = () => {
        raf = 0;
        cx += (tx - cx) * 0.09;
        cy += (ty - cy) * 0.09;
        island.style.setProperty('--tilt-x', `${cy.toFixed(3)}deg`);
        island.style.setProperty('--tilt-y', `${cx.toFixed(3)}deg`);
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(frame);
      };
      const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
      on(root.querySelector('.worlds__map'), 'pointermove', (e) => {
        const r = island.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * MAX;
        wake();
      });
      on(root.querySelector('.worlds__map'), 'pointerleave', () => { tx = 0; ty = 0; wake(); });
      cleanup.push(() => raf && cancelAnimationFrame(raf));
    }

    /* Arriving through a hero hotspot? Land with that world already lit, so
       the choice made on the previous screen is visibly carried over. */
    if (arrivedFrom) {
      setActive(arrivedFrom);
      setTimeout(() => {
        if (scene.dataset.active === arrivedFrom) setActive(null);
      }, 2200);
    }

    requestAnimationFrame(() => {
      scene.dataset.ready = 'true';
      if (!arrivedFrom) setActive(null);   // stamps the resting state
    });

    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'worlds', html, mount };
}
