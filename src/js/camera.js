import { prefs } from './prefs.js';

/**
 * The camera — the one piece of motion the whole site is built around.
 *
 * It turns a single scalar, `p` (0 = looking at the portrait, 1 = inside the
 * mind), into every layer's transform. Because one number drives everything,
 * the journey is continuous, reversible and interruptible: you can stop
 * halfway, change your mind, and scroll back out. That reversibility is what
 * separates this from a page transition, and it is why the progress ring in
 * the corner is a real readout rather than decoration.
 *
 * Inputs that all write to the same `p`:
 *   wheel / trackpad      continuous, reversible
 *   click on the brain    a timed run to 1
 *   keyboard + text CTA   the same timed run, no hover required
 *   Escape / scroll up    back to 0
 *
 * Performance: only `transform` and `opacity` are written, all on layers that
 * are already promoted. The blur at the end of the push-in is a cross-fade to
 * a pre-blurred bitmap, not a `filter`, so the cost is constant.
 */

const MAX_SCALE   = 3.3;
const WHEEL_SPAN  = 2600;   // wheel pixels to travel the full journey
const FOCUS_Y     = 0.46;   // where in the viewport the brain lands

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ramp = (v, a, b) => clamp01((v - a) / (b - a));
const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export function createCamera({ hero, plate, header, cue, cueLabel, live, onCommit, onRelease, onProgress }) {
  let p = 0;            // rendered value
  let target = 0;       // where input wants it
  let tween = null;     // { from, to, start, dur, ease, then }
  let raf = 0;
  let rest = null;      // plate geometry with the camera at rest
  let committed = false;
  let focal = { fx: 0.58, fy: 0.355 };

  const root = document.documentElement;

  /* ---------------------------------------------------------- geometry */
  function measure() {
    // Read while the camera is at rest, so the rect is the untransformed one.
    if (p > 0.001) return;
    const r = plate.getBoundingClientRect();
    rest = { x: r.left, y: r.top, w: r.width, h: r.height };
    const cs = getComputedStyle(plate);
    focal = {
      fx: parseFloat(cs.getPropertyValue('--fx')) || 0.58,
      fy: parseFloat(cs.getPropertyValue('--fy')) || 0.355,
    };
  }

  /* ------------------------------------------------------------ render */
  function render() {
    if (!rest) measure();
    if (!rest) return;

    const { fx, fy } = focal;
    const focusX = rest.x + fx * rest.w;
    const focusY = rest.y + fy * rest.h;
    const travel = Math.pow(p, 1.18);

    const scale = 1 + Math.pow(p, 1.55) * (MAX_SCALE - 1);
    const camX = (innerWidth * 0.5 - focusX) * travel;
    const camY = (innerHeight * FOCUS_Y - focusY) * travel;

    plate.style.setProperty('--cam-x', `${camX.toFixed(2)}px`);
    plate.style.setProperty('--cam-y', `${camY.toFixed(2)}px`);
    plate.style.setProperty('--cam-s', scale.toFixed(4));
    /* The portrait dissolves on its way in rather than sitting underneath the
       destination at full strength. Without this the two compositions overlap
       for a third of the journey and you can read both at once — a double
       exposure, not a transition. It clears just as the veil peaks, so the
       handoff happens in the dark. */
    plate.style.setProperty('--plate-out', (1 - ramp(p, 0.50, 0.80)).toFixed(3));

    // Copy and annotations leave first: they belong to the outside.
    hero.style.setProperty('--copy-out', (1 - ramp(p, 0, 0.2)).toFixed(3));
    hero.style.setProperty('--copy-y', `${(-30 * ramp(p, 0, 0.3)).toFixed(1)}px`);
    plate.style.setProperty('--annot-out', (1 - ramp(p, 0, 0.16)).toFixed(3));

    const veil = p < 0.78 ? ramp(p, 0.2, 0.78) * 0.92
                          : 0.92 - ramp(p, 0.78, 1) * 0.74;
    root.style.setProperty('--veil', veil.toFixed(3));
    root.style.setProperty('--stage-in', ramp(p, 0.70, 1).toFixed(3));
    root.style.setProperty('--stage-s', (1.22 - 0.22 * ramp(p, 0.70, 1)).toFixed(4));
    cue.style.setProperty('--p', p.toFixed(3));

    // Guarded: these are the only non-custom-property DOM writes in the loop.
    const hide = p > 0.32 && p < 0.9 ? 'true' : 'false';
    if (header.dataset.hidden !== hide) header.dataset.hidden = hide;
    onProgress?.(p);
  }

  /* -------------------------------------------------------------- loop */
  function tick(now) {
    raf = 0;
    if (tween) {
      const t = clamp01((now - tween.start) / tween.dur);
      p = tween.from + (tween.to - tween.from) * tween.ease(t);
      if (t >= 1) { p = tween.to; target = p; const then = tween.then; tween = null; then?.(); }
    } else {
      // Smooth the continuous inputs so a coarse wheel still feels like a dolly.
      p += (target - p) * 0.14;
      if (Math.abs(target - p) < 0.0008) p = target;
    }
    render();
    settle();
    if (tween || Math.abs(target - p) > 0.0001) schedule();
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(tick); }

  function settle() {
    if (p > 0.999 && !committed) {
      committed = true;
      onCommit?.();
    } else if (p < 0.001 && committed) {
      committed = false;
      onRelease?.();
      measure();
    }
    setCueLabel();
  }

  function setCueLabel() {
    const label = committed ? 'Back to the portrait'
                : p > 0.02  ? 'Keep going'
                : prefs.cinematic ? 'Scroll to explore' : 'Enter the worlds';
    if (cueLabel.textContent !== label) cueLabel.textContent = label;
  }

  /* ------------------------------------------------------------- input */
  function to(value, { duration = 1150 } = {}) {
    if (prefs.reducedMotion) {
      tween = null; p = target = value; render(); settle();
      return;
    }
    measure();
    tween = {
      from: p, to: value, start: performance.now(),
      dur: duration,
      ease: value > p ? easeInOutQuart : easeOutCubic,
    };
    schedule();
  }

  function nudge(delta) {
    if (tween) return;
    target = clamp01(target + delta);
    schedule();
  }

  function onWheel(e) {
    if (!prefs.cinematic || prefs.reducedMotion) return;
    // Only capture the wheel while the journey is in play: at rest and
    // scrolling up, or fully in and scrolling down, the page keeps its scroll.
    const goingIn = e.deltaY > 0;
    if ((committed && goingIn) || (p === 0 && !goingIn)) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? innerHeight : 1;
    nudge((e.deltaY * unit) / WHEEL_SPAN);
  }

  // Bound to the window in the capture phase: the destination layer mounts
  // over the hero part-way through the journey, and a hero-bound listener
  // would stop receiving events at precisely that moment.
  addEventListener('wheel', onWheel, { passive: false, capture: true });
  addEventListener('resize', () => { rest = null; measure(); render(); }, { passive: true });

  measure(); render(); setCueLabel();

  return {
    enter() {
      if (committed || (tween && tween.to === 1)) return;
      live.textContent = 'Entering the worlds inside the portrait.';
      to(1, { duration: prefs.cinematic ? 1250 : 950 });
    },
    exit() { to(0, { duration: 780 }); },
    /** Park the camera at a fixed point on the journey. Used by `?p=` to
     *  inspect and tune a single frame of the transition. */
    set(value) { tween = null; p = target = clamp01(value); render(); settle(); },
    get progress() { return p; },
    get committed() { return committed; },
    remeasure() { rest = null; measure(); render(); },
  };
}
