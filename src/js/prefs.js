/**
 * Device and user preferences, observed rather than sampled once.
 * A laptop with a trackpad can gain a touchscreen; a visitor can turn on
 * "reduce motion" while the page is open. Both change the experience live.
 */
const mqMotion  = matchMedia('(prefers-reduced-motion: reduce)');
const mqPointer = matchMedia('(pointer: fine) and (hover: hover)');
const mqCinema  = matchMedia('(min-width: 1180px) and (min-aspect-ratio: 3/2)');

const listeners = new Set();

export const prefs = {
  get reducedMotion() { return mqMotion.matches; },
  get finePointer()   { return mqPointer.matches; },
  get cinematic()     { return mqCinema.matches; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

function publish() {
  document.body.dataset.pointer = prefs.finePointer ? 'fine' : 'coarse';
  document.body.dataset.reducedMotion = String(prefs.reducedMotion);
  document.body.dataset.layout = prefs.cinematic ? 'cinematic' : 'stacked';
  listeners.forEach((fn) => fn(prefs));
}

[mqMotion, mqPointer, mqCinema].forEach((mq) => mq.addEventListener('change', publish));
publish();
