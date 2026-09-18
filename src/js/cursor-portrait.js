import { prefs } from './prefs.js';

/**
 * The portrait that trails the pointer.
 *
 * Three deliberate constraints:
 *  1. It is never in the way — `pointer-events: none` and it is not in the
 *     accessibility tree, so it can't intercept a click or confuse a reader.
 *  2. It earns its place by reporting state: it grows and captions itself over
 *     anything that will act on a click, so it is an affordance, not a trinket.
 *  3. One rAF loop, transform-only writes, and it parks itself when the pointer
 *     stops moving — no permanent animation frame cost.
 */
const LERP = 0.15;        // position follow
const ROT_LERP = 0.1;
const ROT_PER_PX = 0.5;   // degrees of tilt per px/frame of horizontal speed
const ROT_MAX = 13;
const REST_EPSILON = 0.05;

export function mountCursorPortrait(el, captionEl) {
  let px = innerWidth / 2, py = innerHeight / 2;
  let tx = px, ty = py;
  let rot = 0, targetRot = 0;
  let scale = 1, targetScale = 1;
  let running = false, visible = false;

  const setVar = (k, v) => el.style.setProperty(k, v);

  function frame() {
    const dx = tx - px, dy = ty - py;
    px += dx * LERP;
    py += dy * LERP;

    // Tilt reads pointer velocity, so the portrait leans into the movement
    // and settles level when you stop.
    targetRot = Math.max(-ROT_MAX, Math.min(ROT_MAX, dx * LERP * ROT_PER_PX));
    rot += (targetRot - rot) * ROT_LERP;
    scale += (targetScale - scale) * 0.16;

    setVar('--x', `${px.toFixed(2)}px`);
    setVar('--y', `${py.toFixed(2)}px`);
    setVar('--rot', `${rot.toFixed(2)}deg`);
    setVar('--scale', scale.toFixed(3));

    const settled = Math.abs(dx) < REST_EPSILON && Math.abs(dy) < REST_EPSILON
                 && Math.abs(targetRot - rot) < 0.01
                 && Math.abs(targetScale - scale) < 0.002;
    if (settled) { running = false; return; }
    requestAnimationFrame(frame);
  }

  function wake() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function show(on) {
    if (visible === on) return;
    visible = on;
    el.dataset.visible = String(on);
  }

  /* --- what the pointer is over ---------------------------------------- */
  function describe(target) {
    const hit = target instanceof Element ? target.closest('[data-cursor]') : null;
    if (hit) return { caption: hit.dataset.cursor, scale: Number(hit.dataset.cursorScale || 1.32) };
    const act = target instanceof Element ? target.closest('a, button') : null;
    if (act) return { caption: '', scale: 0.7 };
    return { caption: '', scale: 1 };
  }

  function onMove(e) {
    tx = e.clientX; ty = e.clientY;
    const { caption, scale: s } = describe(e.target);
    targetScale = s;
    if (caption) {
      if (captionEl.textContent !== caption) captionEl.textContent = caption;
      el.dataset.caption = 'true';
    } else {
      el.dataset.caption = 'false';
    }
    show(true);
    wake();
  }

  function bind(on) {
    // bound to window: an unqualified reference would lose its receiver
    const m = (on ? window.addEventListener : window.removeEventListener).bind(window);
    m('pointermove', onMove, { passive: true });
    m('pointerdown', onMove, { passive: true });
    m('mouseleave', hide);
    m('blur', hide);
    if (!on) show(false);
  }
  function hide() { show(false); }

  function sync() {
    const active = prefs.finePointer && !prefs.reducedMotion;
    bind(active);
    if (!active) show(false);
  }

  prefs.subscribe(sync);
  sync();
}
