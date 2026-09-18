import { worlds } from '../../content/worlds.js';

/**
 * Rebuilds the four labels that the reference render had baked into its pixels.
 *
 * They are DOM for four reasons: they must be focusable, they must animate in,
 * they must reflow when the artwork resizes, and they are the deep links into
 * each world. `tools/prep-assets.py` erased the painted originals so these sit
 * exactly where they were designed to sit.
 */
export function mountAnnotations(plate, indexEl, { onChoose }) {
  const frag = document.createDocumentFragment();

  worlds.forEach((w, i) => {
    const { x, y, side, line } = w.hotspot;
    const el = document.createElement('div');
    el.className = 'annot';
    el.dataset.side = side;
    el.dataset.world = w.id;
    el.dataset.cursor = `Enter ${w.name}`;
    el.dataset.cursorScale = '1.1';
    el.style.cssText = `--x:${x}; --y:${y}; --line:${line}`;
    el.innerHTML = `
      <span class="annot__line" aria-hidden="true"></span>
      <button class="annot__hit" type="button">
        <span class="annot__dot" aria-hidden="true"></span>
        <span class="u-visually-hidden">${w.name} — ${w.line} Enter this world.</span>
      </button>
      <span class="annot__label">
        <span class="annot__title u-label">${w.kicker}</span>
        <span class="annot__sub">${w.sub}</span>
      </span>`;
    // The whole annotation acts, not just the 9px dot: people aim at the words.
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onChoose(w.id);
    });
    frag.appendChild(el);

    // Draw the leaders on after the artwork has landed, in reading order.
    requestAnimationFrame(() => setTimeout(() => {
      el.style.setProperty('--line-in', '1');
      el.style.setProperty('--label-in', '1');
    }, 900 + i * 120));
  });

  plate.appendChild(frag);

  /* The same four worlds as a readable index for the stacked composition.
     Not a fallback — it is the primary control at that size. */
  indexEl.innerHTML = worlds.map((w) => `
    <button class="world-row" type="button" data-world="${w.id}">
      <span class="world-row__no u-label">${w.no}</span>
      <span>
        <span class="world-row__name">${w.name}</span>
        <span class="world-row__sub">${w.line}</span>
      </span>
      <span class="world-row__go u-label" aria-hidden="true">Enter &rarr;</span>
    </button>`).join('');

  indexEl.addEventListener('click', (e) => {
    const row = e.target.closest('[data-world]');
    if (row) onChoose(row.dataset.world);
  });

  /* Touch: tapping a row highlights its dot on the artwork, so the index and
     the image stay visibly connected without a hover state. */
  indexEl.querySelectorAll('[data-world]').forEach((row) => {
    const mark = (on) => {
      const a = plate.querySelector(`.annot[data-world="${row.dataset.world}"]`);
      if (a) a.dataset.active = String(on);
    };
    row.addEventListener('pointerenter', () => mark(true));
    row.addEventListener('pointerleave', () => mark(false));
    row.addEventListener('focus', () => mark(true));
    row.addEventListener('blur', () => mark(false));
  });
}
