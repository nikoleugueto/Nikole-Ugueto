import { worlds } from '../../../content/worlds.js';

/**
 * Not found.
 *
 * A mistyped or stale URL used to hand `null` to the stage, which then threw on
 * `view.id` and left a blank screen with a console error. A deep link that has
 * gone stale is exactly the case where a visitor needs orientation most, so
 * this says what happened and offers the four worlds as the way on.
 */
export function notFoundView({ path, onBack, onWorlds, onWorld }) {
  const list = worlds.map((w) => `
    <li><button class="nf__link" type="button" data-world="${w.id}">
      <span class="nf__no u-label">${w.no}</span>
      <span>${w.name}</span>
    </button></li>`).join('');

  return {
    id: `404:${path}`,
    html: `
      <div class="page nf">
        <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
          <button class="crumb__link" type="button" data-back>Home</button>
          <span aria-hidden="true">&rsaquo;</span>
          <span aria-current="page">Not found</span>
        </nav>
        <div class="nf__inner">
          <p class="u-label ab__eyebrow">404</p>
          <h2 class="ar__title">That page isn’t part of this world.</h2>
          <p class="ar__body">
            Nothing lives at <code>${path.replace(/[<>&]/g, '')}</code>. It may have
            been a typo, or a link from an older version of the site.
          </p>
          <p class="u-label nf__label">Try one of the worlds</p>
          <ul class="nf__list">${list}</ul>
          <p class="nf__back">
            <button class="btn" type="button" data-worlds data-cursor="See the map">
              See the whole map <span aria-hidden="true">&rarr;</span>
            </button>
          </p>
        </div>
      </div>`,
    mount(root) {
      const onClick = (e) => {
        const w = e.target.closest('[data-world]');
        if (w) return onWorld(w.dataset.world);
        if (e.target.closest('[data-worlds]')) return onWorlds();
        if (e.target.closest('[data-back]')) return onBack();
      };
      root.addEventListener('click', onClick);
      requestAnimationFrame(() => { root.querySelector('.page').dataset.ready = 'true'; });
      return () => root.removeEventListener('click', onClick);
    },
  };
}
