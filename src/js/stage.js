import { flowMQ } from './page-scroll.js';

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
  let arrived = false;
  let homeY = 0;             // where the home page was scrolled to

  /* Phones and tablets: once a page has arrived, the document scrolls it
     rather than this fixed layer (views.css, html[data-flow]), so the
     browser's toolbars can tuck away and the scroll is the native one. The
     layer is the fixed scroller again for every transition, and the scroll
     position crosses over each way so nothing jumps. Never on the desktop. */
  const html = document.documentElement;
  function flow(on) {
    on = on && flowMQ.matches;
    edge(on);
    if (on === (html.dataset.flow === 'true')) return;
    if (on) {
      const y = el.scrollTop;
      homeY = scrollY;
      html.dataset.flow = 'true';
      scrollTo({ top: y, behavior: 'instant' });
    } else {
      const y = scrollY;
      delete html.dataset.flow;
      el.scrollTo({ top: y, behavior: 'instant' });
      scrollTo({ top: homeY, behavior: 'instant' });
    }
  }
  flowMQ.addEventListener('change', () => flow(arrived));

  /* ...and the browser's own bars and the page's edges take the colour of
     the page being read, so it never sits inside a band of another colour.
     Safari on iOS 26 ignores theme-color (older Safari and Chrome on Android
     still read it): it fills its status-bar strip, and tints its bottom bar,
     from the page's own background, and follows a change only when the
     colour is written on <html>/<body> themselves, not when a stylesheet
     changes it, so it is written there. A page under a photographed sky
     names its edge colour (--edge); any other has a plain background of its
     own; Home is its sky (data-edge, index.html). Never on the desktop. */
  const tint = document.querySelector('meta[name="theme-color"][data-edge]');
  const homeEdge = tint?.dataset.edge || '';
  const solid = (c) => !!c && c !== 'transparent' && !/,\s*0\)$/.test(c);
  let painted = '';
  function edge(on) {
    const root = el.firstElementChild;
    const c = !flowMQ.matches ? ''
      : (on && root && (getComputedStyle(root).getPropertyValue('--edge').trim()
          || [el, root].map((x) => getComputedStyle(x).backgroundColor).find(solid))) || homeEdge;
    if (c === painted) return;
    painted = c;
    html.style.backgroundColor = c;
    document.body.style.backgroundColor = c;
    if (tint && c) tint.content = c;
  }

  /** Arrive: in the document's scroll, a newly opened page starts at its top. */
  function settle(fresh) {
    arrived = true;
    if (fresh && html.dataset.flow === 'true') scrollTo({ top: 0, behavior: 'instant' });
    flow(true);
  }

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
    if (current?.id === view.id) return false;
    current?.cleanup?.();
    el.innerHTML = view.html;
    current = { id: view.id, cleanup: view.mount?.(el) || null };
    return true;
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
      const fresh = render(view);
      el.style.removeProperty('--stage-in');
      el.style.removeProperty('--stage-s');
      el.removeAttribute('aria-hidden');
      el.dataset.mounted = 'true';
      occlude(true);
      el.focus({ preventScroll: true });
      settle(fresh);
    },

    /** A screen reached directly rather than through the camera. */
    showStandalone(view) {
      const fresh = render(view);
      el.removeAttribute('aria-hidden');
      el.dataset.mounted = 'true';
      el.style.setProperty('--stage-in', '1');
      el.style.setProperty('--stage-s', '1');
      occlude(true);
      el.focus({ preventScroll: true });
      settle(fresh);
    },

    /** Hand the scrolling back to the fixed layer before the camera moves. */
    unsettle() { arrived = false; flow(false); },

    hide() {
      arrived = false;
      flow(false);
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
