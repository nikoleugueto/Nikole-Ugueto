import { archive } from '../../../content/pages.js';

/**
 * Creative archive.
 *
 * Deliberately the lightest thing in the build: a fast, flat index, with none
 * of the camera work the case studies get. The brief is explicit that it should
 * demonstrate range without competing with the UX work.
 *
 * The grid is empty because the pieces that would fill it are Nikole's work
 * files, which this project does not reach into. Each tile says what it is
 * waiting for, and `content/pages.js` documents where to drop them.
 */
export function archiveView({ onBack, onUp }) {
  const tiles = archive.pieces.length
    ? archive.pieces.map((p) => `
        <figure class="tile">
          <img src="${p.src}" alt="${p.alt}" loading="lazy" decoding="async">
          <figcaption class="tile__cap u-label">${p.title}</figcaption>
        </figure>`).join('')
    : Array.from({ length: archive.placeholderCount }, (_, i) => `
        <figure class="tile tile--empty">
          <span class="tile__no u-label">${String(i + 1).padStart(2, '0')}</span>
          <span class="tile__hint u-label">Image to add</span>
        </figure>`).join('');

  const html = `
    <div class="page ar">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">Creative archive</span>
      </nav>

      <header class="ar__hero">
        <p class="u-label ab__eyebrow">${archive.eyebrow}</p>
        <h2 class="ar__title">${archive.title}</h2>
        <p class="ar__body">${archive.body}</p>
        <p class="ar__tags u-label">${archive.tags.join(' <span aria-hidden="true">/</span> ')}</p>
      </header>

      ${archive.pieces.length ? '' : `
        <p class="ar__note">
          Empty on purpose. The marketing and visual work that belongs here lives in
          your own files, which this project does not read. Drop images into
          <code>${archive.dropHint}</code> and add them to <code>archive.pieces</code>
          in <code>content/pages.js</code> — each becomes a tile.
        </p>`}

      <div class="tiles">${tiles}</div>
    </div>`;

  function mount(root) {
    const onClick = (e) => {
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onClick);
    requestAnimationFrame(() => { root.querySelector('.page').dataset.ready = 'true'; });
    return () => root.removeEventListener('click', onClick);
  }

  return { id: 'archive', html, mount };
}
