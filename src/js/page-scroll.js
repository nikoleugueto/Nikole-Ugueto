/**
 * Where a page scrolls.
 *
 * On the desktop every page scrolls inside the stage, a fixed layer. On
 * phones and tablets, once a page has arrived, it scrolls the document itself
 * instead (stage.js switches it over), so the browser's own toolbars can tuck
 * away while you read and the scroll is the browser's native one. Views ask
 * here rather than assuming either.
 */

/** Phones, tablets and any window narrower than the desktop composition. */
export const flowMQ = matchMedia('(max-width: 1179px), (hover: none) and (pointer: coarse)');

const flowing = () => document.documentElement.dataset.flow === 'true';

/** The root for an IntersectionObserver: the stage, or the viewport. The
 *  viewport also works while the stage is still the fixed layer (arriving),
 *  because an observer with no root respects the stage's own clipping. */
export const observerRoot = (stage) => (flowMQ.matches ? null : stage);

/** Where a reveal fires. Below the desktop, as soon as the element enters, so
 *  nothing waits blank at the foot of a phone screen while you scroll. */
export const revealMargin = (desktop) => (flowMQ.matches ? '0px' : desktop);

export const scrollTopOf =(stage) => (flowing() ? scrollY : stage.scrollTop);

export function scrollPageTo(stage, top, behavior = 'instant') {
  (flowing() ? window : stage).scrollTo({ top, behavior });
}

/** Hold the page still while an overlay is open, or let it go again. */
export function lockScroll(stage, on) {
  if (on) { (flowing() ? document.body : stage).style.overflow = 'hidden'; return; }
  stage.style.overflow = '';
  document.body.style.overflow = '';
}

export function onPageScroll(stage, fn) {
  stage.addEventListener('scroll', fn, { passive: true });
  addEventListener('scroll', fn, { passive: true });
  return () => {
    stage.removeEventListener('scroll', fn);
    removeEventListener('scroll', fn);
  };
}
