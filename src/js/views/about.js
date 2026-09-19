import { about } from '../../../content/pages.js';

/**
 * About.
 *
 * The headline, intro, capability list and process are Nikole's own words from
 * her reference boards. The four longer sections — story, philosophy,
 * experience, tools — are hers to write, so they carry the same marked
 * placeholders as the case studies rather than invented biography.
 */
export function aboutView({ onBack, onContact }) {
  const caps = about.capabilities.map((c) => `
    <li class="cap"><span class="cap__name">${c}</span><span class="cap__rule" aria-hidden="true"></span></li>`).join('');

  const sections = about.sections.map((s) => `
    <section class="ab__sec" id="ab-${s.id}" aria-labelledby="ab-${s.id}-h">
      <p class="ab__no u-label">${s.no}</p>
      <div>
        <h3 class="ab__h" id="ab-${s.id}-h">${s.title}</h3>
        ${s.placeholder || !s.body ? `
          <div class="ph">
            <p class="ph__chip u-label">Placeholder — writing</p>
            <p class="ph__prompt">${s.prompt}</p>
          </div>` : `<div class="cs__prose">${s.body}</div>`}
      </div>
    </section>`).join('');

  const steps = about.process.steps.map((s, i) => `
    <li class="step">
      <span class="step__disc">
        <img src="/assets/img/process-${i + 1}.webp" alt="" width="220" height="220"
             loading="lazy" decoding="async">
      </span>
      <span class="step__no u-label">${s.no}</span>
      <span class="step__title">${s.title}</span>
      <span class="step__line">${s.line}</span>
    </li>`).join('');

  const html = `
    <div class="page ab">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">About</span>
      </nav>

      <header class="ab__hero">
        <figure class="ab__portrait">
          <img src="/assets/img/about-portrait-360.webp"
               srcset="/assets/img/about-portrait-360.webp 360w,
                       /assets/img/about-portrait-540.webp 540w,
                       /assets/img/about-portrait-720.webp 720w"
               sizes="(min-width: 62rem) 18rem, 60vw"
               width="1024" height="1536" decoding="async"
               alt="Nikole Ugueto, seated on a terrace at sunset, turning to camera.">
        </figure>
        <div class="ab__lead">
          <p class="u-label ab__eyebrow">${about.eyebrow}</p>
          <h2 class="ab__title">${about.title}</h2>
          <p class="ab__intro">${about.intro}</p>
          ${about.resume.link
            ? `<a class="btn" href="${about.resume.link}">${about.resume.label} <span aria-hidden="true">&rarr;</span></a>`
            : `<p class="world__case-note u-label">${about.resume.label} — PDF to add</p>`}
        </div>
        <div class="ab__caps">
          <p class="u-label ab__eyebrow">Capabilities</p>
          <ul class="caps">${caps}</ul>
        </div>
      </header>

      <div class="ab__sections">${sections}</div>

      <section class="ab__process" aria-labelledby="ab-process-h">
        <div class="ab__process-lead">
          <h3 class="ab__process-title" id="ab-process-h">${about.process.title}</h3>
          <p class="ab__process-body">${about.process.body}</p>
        </div>
        <ol class="steps">${steps}</ol>
      </section>

      <footer class="page__foot">
        <button class="btn" type="button" data-contact data-cursor="Get in touch">
          Get in touch <span aria-hidden="true">&rarr;</span>
        </button>
      </footer>
    </div>`;

  function mount(root) {
    const onClick = (e) => {
      if (e.target.closest('[data-contact]')) return onContact();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onClick);
    requestAnimationFrame(() => { root.querySelector('.page').dataset.ready = 'true'; });
    return () => root.removeEventListener('click', onClick);
  }

  return { id: 'about', html, mount };
}
