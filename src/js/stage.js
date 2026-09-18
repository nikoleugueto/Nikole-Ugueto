/**
 * The destination layer.
 *
 * The camera delivers you here; this owns what "here" is. It holds one view at
 * a time — a view is `{ id, html, mount(el) -> cleanup }` — and keeps the
 * mount/opacity mechanics separate from any particular screen's content.
 *
 * `prepare()` renders while the camera is still travelling so there is
 * something to fade in; the layer stays out of the accessibility tree until
 * `show()` confirms you have actually arrived.
 */
export function createStage(el, { behind } = {}) {
  let current = null;        // { id, cleanup }

  /* The home stage stays in the DOM underneath this layer, so without this a
     keyboard user tabs straight into controls they cannot see. `inert` takes
     the hidden layer out of the tab order and the accessibility tree at once. */
  const occlude = (on) => {
    if (behind) behind.inert = on;
    el.inert = !on;
  };
  occlude(false);

  function render(view) {
    // Nothing should reach here without a view, but a blank screen with a
    // console error is the worst possible failure mode for a portfolio.
    if (!view) { console.warn('[stage] asked to render nothing'); return; }
    if (current?.id === view.id) return;
    current?.cleanup?.();
    el.innerHTML = view.html;
    current = { id: view.id, cleanup: view.mount?.(el) || null };
  }

  function clear() {
    current?.cleanup?.();
    current = null;
    el.innerHTML = '';
  }

  return {
    /** Build the destination mid-journey. Not yet announced. */
    prepare(view) {
      if (!view) return;
      render(view);
      el.style.removeProperty('--stage-in');
      el.style.removeProperty('--stage-s');
      el.dataset.mounted = 'true';
    },

    /** You have arrived: announce it and move focus in. */
    show(view) {
      render(view);
      el.style.removeProperty('--stage-in');
      el.style.removeProperty('--stage-s');
      el.removeAttribute('aria-hidden');
      el.dataset.mounted = 'true';
      occlude(true);
      el.focus({ preventScroll: true });
    },

    /** A screen reached directly rather than through the camera. */
    showStandalone(view) {
      render(view);
      el.removeAttribute('aria-hidden');
      el.dataset.mounted = 'true';
      el.style.setProperty('--stage-in', '1');
      el.style.setProperty('--stage-s', '1');
      occlude(true);
      el.focus({ preventScroll: true });
    },

    hide() {
      el.setAttribute('aria-hidden', 'true');
      el.dataset.mounted = 'false';
      el.style.removeProperty('--stage-in');
      el.style.removeProperty('--stage-s');
      occlude(false);
      clear();
    },

    setMounted(on) {
      const next = on ? 'true'
                 : el.getAttribute('aria-hidden') === 'true' ? 'false'
                 : el.dataset.mounted;
      if (el.dataset.mounted !== next) el.dataset.mounted = next;
    },

    get viewId() { return current?.id ?? null; },
  };
}
