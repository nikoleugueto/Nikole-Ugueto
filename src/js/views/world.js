import { byId, journeyBeats } from '../../../content/worlds.js';
import { caseStudyFor } from '../../../content/case-studies.js';
import { prefs } from '../prefs.js';

/**
 * An individual world.
 *
 * One island, one person at work in their domain, in its own sky. The four
 * plates come from reference 03, each carrying its own slice of light, so the
 * worlds differ in atmosphere without anything being invented — the top-left
 * island sits in cool blue, the bottom-right in low sun.
 *
 * The other worlds are never present here, which is the point of the level:
 * you are inside one body of work, and the only ways on are down into the case
 * study or back up to the map.
 */
export function worldView({ worldId, onBack, onUp, onOpenCase, onOpenArchive }) {
  const w = byId(worldId);
  if (!w) return null;

  const study = caseStudyFor(worldId);
  const undefinedProject = study?.contentStatus === 'undefined-project';

  /* Three shapes, not one. The Creative Archive deliberately has no case study
     — the brief asks for it to stay a lightweight index — so this level must
     point somewhere honest rather than offer a dead button. */
  const cta = study
    ? {
        label: `Case study ${w.no}`,
        title: study.title,
        sub: study.subtitle,
        action: undefinedProject ? 'see the structure' : 'Open the case study',
        target: study.id,
      }
    : {
        label: 'Creative archive',
        title: 'Marketing, visual and creative work',
        sub: 'A lightweight index rather than a case study.',
        action: 'Open the archive',
        target: '@archive',
      };

  const beats = journeyBeats.map((b, i) => `
    <li class="beat">
      <span class="beat__disc">
        <img src="/assets/img/journey-${i + 1}.webp" alt="" width="200" height="200"
             loading="lazy" decoding="async">
      </span>
      <span class="beat__no u-label">${b.no}</span>
      <span class="beat__title u-label">${b.title}</span>
      <span class="beat__q">${b.question}</span>
    </li>`).join('');

  const html = `
    <div class="world" data-world="${w.id}"
         style="--sky-a:${w.scene.sky[0]}; --sky-b:${w.scene.sky[1]}">
      <div class="world__sky" aria-hidden="true"></div>
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">${w.name}</span>
      </nav>

      <div class="world__grid">
        <div class="world__intro">
          <p class="u-label world__no">${w.no} — ${w.kicker}</p>
          ${w.logo ? `<img class="world__logo" src="/assets/img/logo-${w.logo}.png" alt="${w.logo}">` : ''}
          <h2 class="world__title">${w.scene.tagline}</h2>
          <p class="world__line">${w.scene.description || w.line}</p>

          ${cta.action ? `
            <button class="btn world__intro-btn" type="button" data-case="${cta.target}"
                    data-cursor="${cta.action}">
              ${cta.action} <span aria-hidden="true">&rarr;</span>
            </button>` : ''}
        </div>

        <div class="world__scene">
          <div class="scene" id="scene">
            ${cta.target ? `
              <button class="scene__hit" type="button" data-case="${cta.target}"
                      data-cursor="${cta.action}"
                      aria-label="${cta.action}: ${cta.title}">
                <img class="scene__img"
                     src="/assets/img/world-${w.id}-640.webp"
                     srcset="/assets/img/world-${w.id}-640.webp 640w,
                             /assets/img/world-${w.id}-960.webp 960w,
                             /assets/img/world-${w.id}-1280.webp 1280w"
                     sizes="(min-width: 1180px) 56vw, 100vw"
                     alt="${w.name}: a floating island holding a scene of this work."
                     decoding="async">
                <span class="scene__cue">${cta.action} <span aria-hidden="true">&rarr;</span></span>
              </button>` : `
              <img class="scene__img"
                   src="/assets/img/world-${w.id}-640.webp"
                   srcset="/assets/img/world-${w.id}-640.webp 640w,
                           /assets/img/world-${w.id}-960.webp 960w,
                           /assets/img/world-${w.id}-1280.webp 1280w"
                   sizes="(min-width: 1180px) 56vw, 100vw"
                   alt="${w.name}: a floating island holding a scene of this work."
                   decoding="async">`}
          </div>
        </div>
      </div>
    </div>`;

  function mount(root) {
    const scene = root.querySelector('#scene');
    const cleanup = [];
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      cleanup.push(() => el.removeEventListener(ev, fn, opts));
    };

    on(root, 'click', (e) => {
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
      const c = e.target.closest('[data-case]');
      if (c && c.dataset.case === '@archive') return onOpenArchive();
      if (c && c.dataset.case) {
        const el = root.querySelector('.world');
        el.dataset.leaving = 'true';
        setTimeout(() => onOpenCase(c.dataset.case), prefs.reducedMotion ? 0 : 420);
      }
    });

    /* The island leans toward the pointer — the same gesture as the map, so
       the two levels feel like the same physical space. */
    if (!prefs.reducedMotion && prefs.finePointer && scene) {
      let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      const MAX = 2.2;
      const frame = () => {
        raf = 0;
        cx += (tx - cx) * 0.09;
        cy += (ty - cy) * 0.09;
        scene.style.setProperty('--tilt-x', `${cy.toFixed(3)}deg`);
        scene.style.setProperty('--tilt-y', `${cx.toFixed(3)}deg`);
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(frame);
      };
      const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
      on(root, 'pointermove', (e) => {
        const r = scene.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * MAX;
        wake();
      });
      cleanup.push(() => raf && cancelAnimationFrame(raf));
    }

    requestAnimationFrame(() => { root.querySelector('.world').dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: `world:${worldId}`, html, mount };
}
