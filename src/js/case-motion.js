import { prefs } from './prefs.js';

/**
 * Motion shared by the case studies: the impact figure's slot-machine roll,
 * and the testimonial band's drift, which the visitor can grab and drag.
 */

const DIGIT_PITCH = 1.2; // em between digits on a reel; larger than the glyphs, so neighbours never show

/** Rolls each digit of `el` like a mechanical reel the first time it scrolls
 *  into view, then restores the exact original text. Returns a cleanup. */
export function slotRoll(el, { root = null } = {}) {
  if (!el || prefs.reducedMotion || !('IntersectionObserver' in window)) return () => {};
  const final = el.textContent;
  let timer = 0;

  const spin = () => {
    el.setAttribute('aria-label', final);
    const digits = [...final].map((ch, i) => ({ ch, i })).filter((d) => /\d/.test(d.ch));
    let order = 0;
    let longest = 0;
    el.innerHTML = [...final].map((ch) => {
      if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch}</span>`;
      const n = order++;
      const turns = 14 + n * 6;                 // later reels spin longer and land later
      const ms = 1300 + n * 320;
      longest = Math.max(longest, ms);
      const strip = Array.from({ length: turns }, () => Math.floor(Math.random() * 10));
      strip.push(Number(ch));
      return `<span class="slot-reel" aria-hidden="true" style="display:inline-block;position:relative;clip-path:inset(-.14em -.35em -.05em -.35em);">`
        + `<span style="visibility:hidden">${ch}</span>`
        + `<span class="slot-strip" data-steps="${turns}" data-ms="${ms}" style="position:absolute;left:0;right:0;top:0;text-align:left;will-change:transform;">`
        + strip.map((d) => `<span style="display:block;height:${DIGIT_PITCH}em">${d}</span>`).join('')
        + '</span></span>';
    }).join('');
    if (!digits.length) return;

    // Next frame, so the strips are laid out before they start moving.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.querySelectorAll('.slot-strip').forEach((s) => {
        s.style.transition = `transform ${s.dataset.ms}ms cubic-bezier(.12, .78, .2, 1)`;
        s.style.transform = `translateY(-${Number(s.dataset.steps) * DIGIT_PITCH}em)`;
      });
    }));
    // Once the last reel has landed, put the plain text back: identical to before.
    timer = setTimeout(() => { el.textContent = final; el.removeAttribute('aria-label'); }, longest + 120);
  };

  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    spin();
  }, { root, threshold: 0.6 });
  io.observe(el);
  return () => { io.disconnect(); clearTimeout(timer); el.textContent = final; };
}

/** The testimonial band: drifts left on its own; press to hold it still, drag
 *  to move it by hand, release to let it carry on. The track holds the quotes
 *  twice, so wrapping at half its width is seamless. Returns a cleanup. */
export function draggableMarquee(track, scroll, { speed = 0.06 } = {}) {
  if (!track || !scroll) return () => {};
  const auto = !prefs.reducedMotion;
  let offset = 0;
  let held = null;           // { id, x, from } while a pointer is down
  let last = performance.now();
  let raf = 0;

  const wrap = () => {
    const loop = track.offsetWidth / 2;
    if (loop > 0) offset = ((offset % loop) + loop) % loop;
  };
  const paint = () => { track.style.transform = `translateX(-${offset}px)`; };

  const tick = (now) => {
    if (!held && auto) { offset += (now - last) * speed; wrap(); paint(); }
    last = now;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  scroll.style.cursor = 'grab';
  scroll.style.touchAction = 'pan-y';   // vertical swipes still scroll the page

  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    held = { id: e.pointerId, x: e.clientX, from: offset };
    scroll.setPointerCapture(e.pointerId);
    scroll.style.cursor = 'grabbing';
    scroll.style.userSelect = 'none';
  };
  const move = (e) => {
    if (!held || e.pointerId !== held.id) return;
    offset = held.from - (e.clientX - held.x);
    wrap(); paint();
  };
  const up = (e) => {
    if (!held || e.pointerId !== held.id) return;
    held = null;
    last = performance.now();          // carry on from here, not from where it was pressed
    scroll.style.cursor = 'grab';
    scroll.style.userSelect = '';
  };
  const noDrag = (e) => e.preventDefault(); // no native text/image drag ghost

  scroll.addEventListener('pointerdown', down);
  scroll.addEventListener('pointermove', move);
  scroll.addEventListener('pointerup', up);
  scroll.addEventListener('pointercancel', up);
  scroll.addEventListener('dragstart', noDrag);

  return () => {
    cancelAnimationFrame(raf);
    scroll.removeEventListener('pointerdown', down);
    scroll.removeEventListener('pointermove', move);
    scroll.removeEventListener('pointerup', up);
    scroll.removeEventListener('pointercancel', up);
    scroll.removeEventListener('dragstart', noDrag);
  };
}
