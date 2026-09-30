import { archive as a } from '../../../content/pages.js';
import { prefs } from '../prefs.js';
import { observerRoot, lockScroll, flowMQ } from '../page-scroll.js';

/**
 * Creative archive — a marble workboard.
 *
 * Nikole's printed work lies on a white marble desk. Each print can be picked
 * up and moved (it lifts, tilts with the hand's speed, and settles with a
 * little glide), or clicked to bring it up close with the rest of its images.
 *
 * Positions are kept as percentages of the board, so a rearranged desk keeps
 * its arrangement when the window resizes. On phones the desk stands upright
 * (PHONE_PLACE). A finger picks a print up by resting on it for a moment, so
 * a swipe across the desk still scrolls the page; a tap opens it.
 *
 * Scoped `cab-` throughout. The close-up view is attached to <body> so it can
 * sit above the stage (which is transformed, and would otherwise trap it).
 */

const IMG = '/assets/img/archive/';
// Every image was exported at a few widths, never above its original; the
// browser picks the one that stays sharp at the size and density shown.
const url = (im, w) => `${IMG}${im.base}-${w}.jpg`;
const srcset = (im) => im.widths.map((w) => `${url(im, w)} ${w}w`).join(', ');
const smallest = (im) => url(im, im.widths[0]);

/* --- objects on the desk -------------------------------------------------
   Drawn as vectors so they stay sharp at any size, shaded like polished
   brass: a light band where the light catches, a darker underside. Each
   drawing's box leaves room for every part (nothing is cut off at an edge). */
const BRASS = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F6E7BE"/><stop offset=".22" stop-color="#E2C27F"/>
    <stop offset=".55" stop-color="#B98F4B"/><stop offset=".85" stop-color="#8A6630"/><stop offset="1" stop-color="#6F5024"/></linearGradient>`;

// A loose paper clip: a darker wire under a thin highlight, so it reads as round.
const PAPERCLIP_PATH = 'M16 20 V50 a5.5 5.5 0 0 1 -11 0 V12 a8.5 8.5 0 0 1 17 0 V54 a10.5 10.5 0 0 1 -21 0 V22';
const PAPERCLIP = `<svg viewBox="0 0 24 68" aria-hidden="true">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1)">
    <path d="${PAPERCLIP_PATH}" stroke="#7A5A28" stroke-width="2.4"/>
    <path d="${PAPERCLIP_PATH}" stroke="#D9BA79" stroke-width="1.5"/>
    <path d="${PAPERCLIP_PATH}" stroke="#FBF0CF" stroke-width=".55" transform="translate(-.35 -.35)" opacity=".9"/>
  </g>
</svg>`;

// A slim brass mechanical pencil: cap and clip, barrel, knurled grip, lead.
const PENCIL = `<svg viewBox="0 0 420 34" aria-hidden="true">
  <defs>${BRASS('cab-pencil')}
    <linearGradient id="cab-pencil-grip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8B8E76"/><stop offset=".4" stop-color="#73765F"/><stop offset="1" stop-color="#3E4033"/></linearGradient></defs>
  <path d="M2 17 L12 15.6 V18.4 Z" fill="#3A3A38"/>
  <path d="M12 15 L44 10.5 V23.5 L12 19 Z" fill="url(#cab-pencil)"/>
  <rect x="44" y="10" width="62" height="14" rx="1.5" fill="url(#cab-pencil-grip)"/>
  <g stroke="#2F3128" stroke-width=".8" opacity=".55">${Array.from({ length: 14 }, (_, i) => `<line x1="${48 + i * 4}" y1="10.5" x2="${48 + i * 4}" y2="23.5"/>`).join('')}</g>
  <rect x="106" y="9" width="262" height="16" rx="2" fill="url(#cab-pencil)"/>
  <rect x="368" y="8.5" width="46" height="17" rx="8" fill="url(#cab-pencil)"/>
  <path d="M318 6 H402 a3.5 3.5 0 0 1 0 7 H318 Z" fill="url(#cab-pencil)"/>
  <rect x="106" y="11" width="262" height="1.4" fill="#FFF6DE" opacity=".75"/>
</svg>`;

/* A matcha latte on its saucer, seen from above like everything else on the
   desk: glazed cream ceramic with its inner wall catching the light, a
   rosetta poured into the foam, and a small brass spoon resting on the saucer. */
const MATCHA = (() => {
  // the rosetta: stacked tulip layers, pulled through by one thin line
  const heart = (cx, cy, w, h) => `M${cx} ${cy + h * .55} C${cx - w * .15} ${cy + h * .2} ${cx - w * .5} ${cy} ${cx - w * .5} ${cy - h * .28} C${cx - w * .5} ${cy - h * .55} ${cx - w * .15} ${cy - h * .6} ${cx} ${cy - h * .3} C${cx + w * .15} ${cy - h * .6} ${cx + w * .5} ${cy - h * .55} ${cx + w * .5} ${cy - h * .28} C${cx + w * .5} ${cy} ${cx + w * .15} ${cy + h * .2} ${cx} ${cy + h * .55} Z`;
  const layers = [[98, 84, 44, 34], [98, 100, 36, 24], [98, 113, 27, 17], [98, 123, 18, 11]];
  return `<svg viewBox="0 0 210 200" aria-hidden="true">
  <defs>
    <radialGradient id="cab-m-saucer" cx=".4" cy=".36" r=".72">
      <stop offset="0" stop-color="#FFFEFA"/><stop offset=".62" stop-color="#F7F1E6"/><stop offset=".9" stop-color="#EBE2D1"/><stop offset="1" stop-color="#DDD2BD"/></radialGradient>
    <radialGradient id="cab-m-cup" cx=".38" cy=".34" r=".74">
      <stop offset="0" stop-color="#FFFFFC"/><stop offset=".72" stop-color="#F5EFE4"/><stop offset="1" stop-color="#DCD0BA"/></radialGradient>
    <radialGradient id="cab-m-wall" cx=".56" cy=".6" r=".56">
      <stop offset=".78" stop-color="#E9E0CF"/><stop offset=".92" stop-color="#F8F3EA"/><stop offset="1" stop-color="#FFFFFF"/></radialGradient>
    <radialGradient id="cab-m-tea" cx=".47" cy=".45" r=".6">
      <stop offset="0" stop-color="#D2D6AE"/><stop offset=".45" stop-color="#B7C08A"/><stop offset=".82" stop-color="#9AA667"/><stop offset="1" stop-color="#7F8B4E"/></radialGradient>
    <radialGradient id="cab-m-foam" cx=".5" cy=".42" r=".62">
      <stop offset="0" stop-color="#FFFBF1"/><stop offset=".8" stop-color="#F4EDD8"/><stop offset="1" stop-color="#E6DFC0"/></radialGradient>
    <filter id="cab-m-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7"/></filter>
    <filter id="cab-m-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="cab-m-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .25  0 0 0 0 .28  0 0 0 0 .12  0 0 0 .16 0"/>
      <feComposite in2="SourceGraphic" operator="in"/></filter>
    ${BRASS('cab-m-spoon')}
  </defs>
  <circle cx="98" cy="100" r="90" fill="url(#cab-m-saucer)"/>
  <circle cx="98" cy="100" r="84" fill="none" stroke="#E6DCC8" stroke-width="1"/>
  <circle cx="98" cy="100" r="89.2" fill="none" stroke="#C9A868" stroke-width="1.1" opacity=".85"/>
  <circle cx="98" cy="100" r="78" fill="none" stroke="#73765F" stroke-width="1.3" opacity=".55"/>
  <path d="M36 70 A68 68 0 0 1 90 32" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
  <circle cx="102" cy="106" r="62" fill="#CFC3AA" opacity=".55" filter="url(#cab-m-blur)"/>
  <path d="M152 90 C184 82 200 98 193 116 C187 130 168 128 153 118" fill="none" stroke="#D9CDB6" stroke-width="13" stroke-linecap="round"/>
  <path d="M152 90 C184 82 200 98 193 116 C187 130 168 128 153 118" fill="none" stroke="#FAF5EC" stroke-width="10" stroke-linecap="round"/>
  <path d="M160 88 C182 85 194 96 190 110" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
  <circle cx="98" cy="100" r="58" fill="url(#cab-m-cup)"/>
  <circle cx="98" cy="100" r="53.5" fill="url(#cab-m-wall)"/>
  <circle cx="98" cy="100" r="47" fill="url(#cab-m-tea)"/>
  <circle cx="98" cy="100" r="47" fill="#fff" filter="url(#cab-m-grain)"/>
  <circle cx="98" cy="100" r="46" fill="none" stroke="#E8E4C8" stroke-width="2.5" opacity=".7" filter="url(#cab-m-soft)"/>
  <g filter="url(#cab-m-soft)">
    ${layers.map(([x, y, w, h]) => `<path d="${heart(x, y, w, h)}" fill="url(#cab-m-foam)"/><path d="${heart(x, y - h * .06, w * .78, h * .72)}" fill="#A9B37C" opacity=".35"/>`).join('')}
  </g>
  <path d="M98 64 C97.4 90 98.6 112 98 134" fill="none" stroke="#9FA96C" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
  <circle cx="98" cy="100" r="56" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".95"/>
  <circle cx="98" cy="100" r="57.6" fill="none" stroke="#C9A868" stroke-width="1" opacity=".9"/>
  <path d="M56 74 A48 48 0 0 1 96 50" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
  <g transform="rotate(45 50 150)">
    <ellipse cx="33" cy="152" rx="8.5" ry="5.8" fill="#6F5024" opacity=".25" filter="url(#cab-m-soft)"/>
    <rect x="39" y="150.8" width="52" height="3" rx="1.5" fill="#6F5024" opacity=".25" filter="url(#cab-m-soft)"/>
    <ellipse cx="32" cy="150" rx="8.5" ry="5.8" fill="url(#cab-m-spoon)"/>
    <rect x="38" y="148.6" width="52" height="2.8" rx="1.4" fill="url(#cab-m-spoon)"/>
    <ellipse cx="30.5" cy="148.4" rx="4" ry="1.6" fill="#FFF3D2" opacity=".8"/>
    <rect x="44" y="148.8" width="40" height=".8" rx=".4" fill="#FFF3D2" opacity=".7"/>
  </g>
</svg>`;
})();

/* A small loose bunch lying on the desk: two white roses and gypsophila, the
   stems in the brand's olive, tied with a thin chestnut ribbon. Every floret is
   placed by a fixed recipe, so the bunch is identical on every visit. */
const FLOWERS = (() => {
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const f1 = (v) => v.toFixed(1);
  const TIE = [196, 118];
  const stems = [], twigs = [], florets = [];
  // each sprig: a main stem from the tie, branching into sprays of tiny blossoms
  const heads = [];
  while (heads.length < 24) {
    const hx = 16 + rnd() * 160, hy = 8 + rnd() * 100;
    // an airy, slightly lopsided cloud, thinning toward the tie
    if (((hx - 96) / 86) ** 2 + ((hy - 56) / 50) ** 2 < 1 && hx < 176) heads.push([Math.round(hx), Math.round(hy)]);
  }
  for (const [hx, hy] of heads) {
    stems.push(`M${TIE[0]} ${TIE[1]} Q${f1((hx + TIE[0]) / 2 + 8)} ${f1((hy + TIE[1]) / 2 + 10)} ${hx} ${hy}`);
    for (let b = 0; b < 6; b++) {
      const a = rnd() * Math.PI * 2, r = 6 + rnd() * 9;
      const bx = hx + Math.cos(a) * r, by = hy + Math.sin(a) * r * .85;
      twigs.push(`M${hx} ${hy} Q${f1(hx + (bx - hx) * .5 + (rnd() - .5) * 4)} ${f1(hy + (by - hy) * .5 + (rnd() - .5) * 4)} ${f1(bx)} ${f1(by)}`);
      for (let k = 0; k < 8; k++) {
        const a2 = rnd() * Math.PI * 2, r2 = 1.5 + rnd() * 4.5;
        const fx = bx + Math.cos(a2) * r2, fy = by + Math.sin(a2) * r2;
        twigs.push(`M${f1(bx)} ${f1(by)} L${f1(fx)} ${f1(fy)}`);
        florets.push([fx, fy, .95 + rnd() * .95, rnd() < .18]);
      }
    }
  }
  // a white rose from above: guard petals, cupped inner rings, a tight shaded heart
  const rose = (cx, cy, R, rot) => {
    let g = `<circle cx="${cx}" cy="${cy}" r="${f1(R * 1.02)}" fill="#CFC5B2" opacity=".5" filter="url(#cab-f-blur)"/>`;
    const rings = [[6, 1, .5], [6, .8, .4], [5, .62, .32], [5, .46, .24], [4, .32, .16]];
    rings.forEach(([n, size, off], ring) => {
      for (let i = 0; i < n; i++) {
        const ang = rot + ring * 31 + i * (360 / n) + (rnd() - .5) * 10;
        const rr = R * size, d = R * off;
        const px = cx + Math.cos(ang * Math.PI / 180) * d, py = cy + Math.sin(ang * Math.PI / 180) * d;
        g += `<g transform="rotate(${f1(ang)} ${f1(px)} ${f1(py)})">`
          + `<path d="M${f1(px - rr * .5)} ${f1(py)} C${f1(px - rr * .5)} ${f1(py - rr * .55)} ${f1(px + rr * .5)} ${f1(py - rr * .6)} ${f1(px + rr * .62)} ${f1(py)} C${f1(px + rr * .5)} ${f1(py + rr * .6)} ${f1(px - rr * .5)} ${f1(py + rr * .55)} ${f1(px - rr * .5)} ${f1(py)} Z" fill="url(#cab-f-petal)" filter="url(#cab-f-lift)"/>`
          + `<path d="M${f1(px + rr * .2)} ${f1(py - rr * .38)} C${f1(px + rr * .5)} ${f1(py - rr * .2)} ${f1(px + rr * .5)} ${f1(py + rr * .2)} ${f1(px + rr * .2)} ${f1(py + rr * .38)}" fill="none" stroke="#FFFFFF" stroke-width=".8" opacity=".9"/></g>`;
      }
    });
    g += `<path d="M${cx} ${cy} m-1.5 .5 a1.6 1.6 0 1 1 3 -.5 a3 3 0 1 1 -5.5 1.2 a4.6 4.6 0 1 1 8.6 -1.6" fill="none" stroke="#C9BCA4" stroke-width=".9" stroke-linecap="round"/>`;
    return g;
  };
  const leaf = (x, y, len, ang) => `<g transform="rotate(${ang} ${x} ${y})"><path d="M${x} ${y} q${len / 2} -${f1(len * .34)} ${len} 0 q-${len / 2} ${f1(len * .34)} -${len} 0z" fill="url(#cab-f-leaf)"/><path d="M${x} ${y} q${len / 2} -${f1(len * .05)} ${f1(len * .92)} 0" fill="none" stroke="#C9CDB2" stroke-width=".6" opacity=".7"/></g>`;
  const [tx, ty] = TIE;
  return `<svg viewBox="0 0 250 150" aria-hidden="true">
  <defs>
    <radialGradient id="cab-f-petal" cx=".35" cy=".45" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FBF8F2"/><stop offset=".85" stop-color="#EEE7DA"/><stop offset="1" stop-color="#DDD3C1"/></radialGradient>
    <radialGradient id="cab-f-floret" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F7F4EC"/><stop offset="1" stop-color="#E4DFD0"/></radialGradient>
    <linearGradient id="cab-f-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C9473"/><stop offset=".5" stop-color="#73765F"/><stop offset="1" stop-color="#555A42"/></linearGradient>
    <filter id="cab-f-lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx=".3" dy=".6" stdDeviation=".55" flood-color="#5A5040" flood-opacity=".32"/></filter>
    <filter id="cab-f-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <g fill="none" stroke="#7F8566" stroke-width=".85" stroke-linecap="round">${stems.map((d) => `<path d="${d}"/>`).join('')}</g>
  <g fill="none" stroke="#8C9272" stroke-width=".45" stroke-linecap="round">${twigs.map((d) => `<path d="${d}"/>`).join('')}</g>
  ${florets.map(([x, y, r, bud]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r.toFixed(2)}" fill="${bud ? '#E9ECD9' : 'url(#cab-f-floret)'}"/>`).join('')}
  <path d="M${tx} ${ty} Q176 112 150 102 M${tx} ${ty} Q168 116 128 110 M${tx + 14} ${ty + 8} L${tx} ${ty}" fill="none" stroke="#6C7253" stroke-width="2" stroke-linecap="round"/>
  ${leaf(168, 110, 24, 196)}${leaf(156, 104, 20, 148)}${leaf(182, 116, 18, 218)}${leaf(146, 108, 18, 176)}${leaf(132, 96, 16, 132)}
  ${rose(140, 90, 15, 8)}${rose(114, 104, 13.5, 40)}${rose(92, 84, 12, 70)}${rose(126, 70, 11, 20)}
  <g transform="rotate(28 ${tx} ${ty})">
    <rect x="${tx - 1.2}" y="${ty - 5}" width="2.8" height="10" rx=".8" fill="#A25B57"/>
    <path d="M${tx} ${ty - 1} c-6 -7 -12 -2 -7 2 c3 2 6 0 7 -2 M${tx} ${ty + 1} c6 7 12 2 7 -2 c-3 -2 -6 0 -7 2" fill="#B56E69" stroke="#8E4D49" stroke-width=".4"/>
    <path d="M${tx} ${ty} q-2 10 -8 16 M${tx} ${ty} q3 9 1 17" fill="none" stroke="#A25B57" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</svg>`;
})();

/* --- the working corner: loose sketch sheets ------------------------------
   Two sheets of drawing paper, the top one covered in unfinished thinking:
   layout thumbnails, a phone wireframe, letterform studies, a few pencil
   notes, and watercolour swatches of the brand colours. Graphite strokes are
   drawn twice, a hair apart, so they read as hand-drawn rather than ruled. */
const SKETCH = (() => {
  let seed = 5;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const j = (v, a = .7) => (v + (rnd() - .5) * a).toFixed(1);
  // one hand-drawn line: two slightly different passes of the pencil
  const line = (x1, y1, x2, y2, w = .85) => [0, 1].map(() =>
    `<path d="M${j(x1)} ${j(y1)} Q${j((x1 + x2) / 2, 1.6)} ${j((y1 + y2) / 2, 1.6)} ${j(x2)} ${j(y2)}" stroke-width="${(w * (.8 + rnd() * .4)).toFixed(2)}"/>`).join('');
  const box = (x, y, w, h) => line(x, y, x + w, y) + line(x + w, y, x + w, y + h) + line(x + w, y + h, x, y + h) + line(x, y + h, x, y);
  const hatch = (x, y, w, h, gap = 3) => Array.from({ length: Math.floor(h / gap) }, (_, i) => line(x, y + i * gap, x + w, y + i * gap - 1.5, .5)).join('');
  // three layout thumbnails
  const thumb = (x, y) => box(x, y, 52, 38) + line(x + 5, y + 7, x + 30, y + 7, 1.3) + line(x + 5, y + 12, x + 22, y + 12, .6)
    + box(x + 5, y + 17, 24, 16) + hatch(x + 6, y + 19, 22, 13) + line(x + 33, y + 19, x + 47, y + 19, .5) + line(x + 33, y + 23, x + 45, y + 23, .5) + line(x + 33, y + 27, x + 47, y + 27, .5);
  // a phone wireframe
  const phone = (x, y) => box(x, y, 40, 78) + line(x + 14, y + 4, x + 26, y + 4, .6) + box(x + 5, y + 10, 30, 22) + hatch(x + 6, y + 12, 28, 19, 3.5)
    + line(x + 5, y + 38, x + 30, y + 38, 1.1) + line(x + 5, y + 43, x + 25, y + 43, .5) + line(x + 5, y + 47, x + 28, y + 47, .5)
    + box(x + 5, y + 58, 30, 9);
  const swatch = (cx, cy, r, color, s) => `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r * .82).toFixed(1)}" fill="${color}" opacity=".78" filter="url(#cab-sk-wash${s})"/>`;
  return `<svg viewBox="0 0 330 420" aria-hidden="true">
  <defs>
    <filter id="cab-sk-paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .42  0 0 0 0 .36  0 0 0 .07 0" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in" result="t"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="t"/></feMerge></filter>
    ${[1, 2, 3].map((s) => `<filter id="cab-sk-wash${s}" x="-40%" y="-40%" width="180%" height="180%">
      <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="${s * 7}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="d"/><feGaussianBlur in="d" stdDeviation=".6"/></filter>`).join('')}
    <filter id="cab-sk-smudge" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <linearGradient id="cab-sk-curl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4DDCF"/></linearGradient>
    <filter id="cab-sk-lift" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="1.5" dy="3" stdDeviation="2.5" flood-color="#4A4436" flood-opacity=".16"/></filter>
  </defs>
  <g transform="rotate(6 190 220)" filter="url(#cab-sk-lift)">
    <rect x="60" y="30" width="250" height="345" fill="#F5F0E6" filter="url(#cab-sk-paper)"/>
    <g fill="none" stroke="#8C8778" stroke-linecap="round" opacity=".55">${thumb(200, 300)}${line(80, 340, 170, 338, .6)}${line(80, 350, 150, 349, .6)}</g>
  </g>
  <g filter="url(#cab-sk-lift)">
    <rect x="18" y="16" width="262" height="372" fill="#FDFBF6" filter="url(#cab-sk-paper)"/>
    <ellipse cx="150" cy="150" rx="34" ry="10" fill="#8C877B" opacity=".07" filter="url(#cab-sk-smudge)"/>
    <ellipse cx="96" cy="300" rx="22" ry="8" fill="#8C877B" opacity=".06" filter="url(#cab-sk-smudge)"/>
    <path d="M18 258 L280 230" stroke="#FFFFFF" stroke-width="1.4" opacity=".75"/>
    <path d="M18 259.6 L280 231.6" stroke="#D4CDBD" stroke-width=".8" opacity=".6"/>
    <path d="M280 360 L280 388 L252 388 Q268 378 280 360 Z" fill="url(#cab-sk-curl)"/>
    <path d="M252 388 Q268 378 280 360" fill="none" stroke="#D9D1C1" stroke-width=".6"/>
    <g fill="none" stroke="#5F5C54" stroke-linecap="round" stroke-linejoin="round" opacity=".82">
      ${thumb(40, 44)}${thumb(104, 40)}${thumb(40, 98)}
      ${line(104, 100, 156, 100, .5)}${line(104, 106, 150, 106, .5)}${line(160, 88, 176, 62, .7)}${line(176, 62, 170, 64, .7)}${line(176, 62, 177, 69, .7)}
      ${phone(196, 42)}
      ${line(40, 226, 56, 176, 1.4)}${line(56, 176, 72, 226, 1.4)}${line(46, 208, 66, 208, .9)}
      <path d="M86 206 c0 -14 22 -14 22 0 v20 M108 212 c-14 -4 -22 2 -20 9 c2 7 14 6 20 -3" stroke-width="1.2"/>
      <path d="M126 222 V184 h10 a9 9 0 0 1 0 18 h-10 m10 0 a10 10 0 0 1 0 20 h-10" stroke-width="1.1"/>
      <path d="M164 204 a14 14 0 1 1 1 0 M160 204 a18 18 0 1 1 1 0" stroke-width=".7"/>
      ${line(40, 238, 150, 236, .45)}${line(40, 244, 120, 243, .45)}
    </g>
    <g font-family="'Bradley Hand', 'Segoe Print', 'Marker Felt', cursive" fill="#4F4C45" opacity=".85">
      <text x="200" y="146" font-size="10" transform="rotate(-4 200 146)">more air?</text>
      <text x="44" y="268" font-size="11" transform="rotate(-2 44 268)">logo · v2</text>
      <text x="170" y="236" font-size="9.5" transform="rotate(3 170 236)">keep it soft</text>
    </g>
    ${swatch(64, 316, 17, '#73765F', 1)}${swatch(108, 322, 15, '#A25B57', 2)}${swatch(148, 316, 14, '#E8DCC4', 3)}
    <g font-family="'Bradley Hand', 'Segoe Print', cursive" font-size="8" fill="#6A665C" opacity=".8">
      <text x="50" y="348">olive</text><text x="94" y="352">chestnut</text><text x="136" y="346">cream</text></g>
    <g fill="none" stroke="#5F5C54" stroke-linecap="round" opacity=".7">${line(196, 300, 262, 300, .6)}${line(196, 308, 250, 308, .5)}${line(196, 316, 258, 316, .5)}</g>
  </g>
</svg>`;
})();

/* Three brush markers lying where they were put down: olive, chestnut and a
   warm charcoal. The middle one is uncapped, its cap beside it. */
const MARKERS = (() => {
  const marker = (y, cap, body, uncapped) => {
    const g = (id, a, b, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".3" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
    const id = `cab-mk-${y}`;
    return `<defs>${g(id + 'c', cap[0], cap[1], cap[2])}${g(id + 'b', '#FFFFFF', '#F4F1EA', '#CFC9BC')}</defs>
      <g transform="translate(0 ${y})">
        <rect x="${uncapped ? 44 : 20}" y="0" width="${uncapped ? 190 : 214}" height="17" rx="3" fill="url(#${id}b)"/>
        <rect x="222" y="1" width="16" height="15" rx="4" fill="url(#${id}c)"/>
        <rect x="${uncapped ? 44 : 20}" y="3" width="${uncapped ? 190 : 214}" height="1.4" fill="#FFFFFF" opacity=".9"/>
        <rect x="150" y="5" width="46" height="7" rx="1" fill="${body}" opacity=".85"/>
        ${uncapped
          ? `<path d="M44 2 L30 5.5 Q20 8.5 30 11.5 L44 15 Z" fill="#E9E4D8"/><path d="M30 5.5 Q14 8.5 30 11.5 Z" fill="${cap[1]}"/>`
          : `<rect x="20" y="-1" width="62" height="19" rx="4" fill="url(#${id}c)"/><rect x="20" y="1.5" width="62" height="1.6" fill="#FFFFFF" opacity=".45"/>
             <rect x="36" y="-4" width="40" height="5" rx="2" fill="url(#${id}c)"/>`}
      </g>`;
  };
  return `<svg viewBox="0 0 250 104" aria-hidden="true">
  ${marker(4, ['#9A9D84', '#73765F', '#4E513F'], '#73765F', false)}
  <g transform="rotate(4 125 44)">${marker(36, ['#C07C77', '#A25B57', '#7A3F3C'], '#A25B57', true)}</g>
  <g transform="rotate(-3 125 80)">${marker(72, ['#6E6A64', '#4A4743', '#2C2A27'], '#4A4743', false)}</g>
  <g transform="rotate(24 30 88)"><rect x="4" y="80" width="62" height="19" rx="4" fill="url(#cab-mk-36c)"/><rect x="4" y="82.5" width="62" height="1.6" fill="#FFFFFF" opacity=".45"/></g>
</svg>`;
})();

/* A closed hardcover in olive linen: foil rules on the cover, the page block
   showing at the fore-edge, and a chestnut ribbon marking the page. No title:
   it's a prop, not a claim. */
const BOOK = `<svg viewBox="0 0 230 320" aria-hidden="true">
  <defs>
    <linearGradient id="cab-bk-cover" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#858970"/><stop offset=".5" stop-color="#73765F"/><stop offset="1" stop-color="#5F624E"/></linearGradient>
    <filter id="cab-bk-linen" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85 .12" numOctaves="2" seed="4" result="h"/>
      <feTurbulence type="fractalNoise" baseFrequency=".12 .85" numOctaves="2" seed="9" result="v"/>
      <feBlend in="h" in2="v" mode="multiply" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .06  0 0 0 .3 0" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in" result="t"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="t"/></feMerge></filter>
    ${BRASS('cab-bk-foil')}
  </defs>
  <rect x="24" y="12" width="196" height="292" rx="3" fill="#EFE7D6"/>
  <g stroke="#D9CFBB" stroke-width=".6">${Array.from({ length: 12 }, (_, i) => `<line x1="${214 + i * .45}" y1="16" x2="${214 + i * .45}" y2="300"/>`).join('')}</g>
  <path d="M150 300 C152 312 148 318 144 322 L152 316 L158 322 C155 314 156 306 156 300 Z" fill="#A25B57"/>
  <rect x="10" y="6" width="206" height="302" rx="4" fill="url(#cab-bk-cover)" filter="url(#cab-bk-linen)"/>
  <rect x="10" y="6" width="22" height="302" rx="3" fill="#5A5D49" opacity=".55"/>
  <rect x="31" y="6" width="1.6" height="302" fill="#43463A" opacity=".7"/>
  <rect x="33" y="6" width="1.2" height="302" fill="#A9AC92" opacity=".6"/>
  <rect x="10" y="6" width="206" height="2" rx="1" fill="#A4A88D" opacity=".6"/>
  <g fill="url(#cab-bk-foil)">
    <rect x="72" y="118" width="104" height="1.4"/><rect x="72" y="182" width="104" height="1.4"/>
    <circle cx="124" cy="150" r="9" fill="none" stroke="url(#cab-bk-foil)" stroke-width="1.2"/>
    <rect x="98" y="270" width="52" height="1"/>
  </g>
</svg>`;

/* Everyday reading glasses set down open, temples spread. The lenses are
   softly rounded rectangles, somewhere between an oval and a square frame:
   thin clear acetate, small clear nose pads, champagne hinge pins, and the
   faint shadow a clear frame throws on stone. */
const GLASSES = (() => {
  const lens = (cx, cy) => `M${cx - 45} ${cy - 7} Q${cx - 46} ${cy - 35} ${cx - 17} ${cy - 35} H${cx + 17} Q${cx + 46} ${cy - 35} ${cx + 45} ${cy - 5} V${cy + 3} Q${cx + 44} ${cy + 33} ${cx + 14} ${cy + 33} H${cx - 14} Q${cx - 44} ${cy + 33} ${cx - 45} ${cy + 3} Z`;
  const L = lens(78, 134), R = lens(182, 134);
  return `<svg viewBox="0 0 260 190" aria-hidden="true">
  <defs>
    <linearGradient id="cab-gl-lens" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".5"/><stop offset=".4" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#D8D2C4" stop-opacity=".2"/></linearGradient>
    <linearGradient id="cab-gl-frame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F7F1E6" stop-opacity=".97"/><stop offset=".6" stop-color="#E2D8C6" stop-opacity=".95"/><stop offset="1" stop-color="#C4B69E" stop-opacity=".95"/></linearGradient>
    <filter id="cab-gl-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <g transform="translate(5 9)" opacity=".15" filter="url(#cab-gl-shadow)" fill="none" stroke="#3E382C" stroke-width="3.6">
    <path d="${L}"/><path d="${R}"/><path d="M33 122 L23 14 M227 122 L237 14"/>
  </g>
  <g fill="none" stroke="url(#cab-gl-frame)" stroke-linecap="round">
    <path d="M33 118 L24 20 Q23 9 31 6" stroke-width="3.2"/>
    <path d="M227 118 L236 20 Q237 9 229 6" stroke-width="3.2"/>
  </g>
  <path d="M26 22 L33 104 M234 22 L227 104" stroke="#FFFFFF" stroke-width=".7" opacity=".8" fill="none"/>
  <path d="${L}" fill="url(#cab-gl-lens)"/><path d="${R}" fill="url(#cab-gl-lens)"/>
  <path d="${L}" fill="none" stroke="url(#cab-gl-frame)" stroke-width="3.8" stroke-linejoin="round"/>
  <path d="${R}" fill="none" stroke="url(#cab-gl-frame)" stroke-width="3.8" stroke-linejoin="round"/>
  <path d="${L}" fill="none" stroke="#FFFFFF" stroke-width=".7" opacity=".8" transform="translate(78 134) scale(.945) translate(-78 -134)"/>
  <path d="${R}" fill="none" stroke="#FFFFFF" stroke-width=".7" opacity=".8" transform="translate(182 134) scale(.945) translate(-182 -134)"/>
  <path d="M123 118 C124 108 136 108 137 118" fill="none" stroke="url(#cab-gl-frame)" stroke-width="3.6"/>
  <ellipse cx="117" cy="138" rx="3.4" ry="5.2" fill="#FFFFFF" opacity=".45" stroke="#D9D0BF" stroke-width=".6"/>
  <ellipse cx="143" cy="138" rx="3.4" ry="5.2" fill="#FFFFFF" opacity=".45" stroke="#D9D0BF" stroke-width=".6"/>
  <path d="M46 110 L70 104" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
  <path d="M150 110 L174 104" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>
  <path d="M96 160 L112 140" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>
  <path d="M200 160 L216 140" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>
  <circle cx="33" cy="120" r="2.4" fill="#D9C08A"/><circle cx="227" cy="120" r="2.4" fill="#D9C08A"/>
</svg>`;
})();

/* Where everything sits. Objects frame the prints from the edges of the desk
   and may run past the board, as they would past the edge of a photograph.
   `under` objects lie beneath the prints (the sketches were there first). */
const OBJECTS = [
  { id: 'sketch',  svg: SKETCH,   place: { x: -4.5, y: 21, w: 21, r: -6 },   ar: '330 / 420', under: true },
  { id: 'markers', svg: MARKERS,  place: { x: 17,   y: 34, w: 15, r: -24 },  ar: '250 / 104' },
  { id: 'matcha',  svg: MATCHA,   place: { x: 88.5, y: 0,  w: 11.5, r: 0 },  ar: '210 / 200' },
  { id: 'pencil',  svg: PENCIL,   place: { x: 68,   y: 88, w: 14, r: -7 },   ar: '420 / 34' },
  { id: 'book',    svg: BOOK,     place: { x: 89,   y: 33, w: 15, r: 8 },    ar: '230 / 320' },
  { id: 'glasses', svg: GLASSES,  place: { x: 87,   y: 66, w: 12.5, r: -12 }, ar: '260 / 190' },
  { id: 'flowers', svg: FLOWERS,  place: { x: 35,   y: 61, w: 23, r: 6 },    ar: '250 / 150' },
  { id: 'clip',    svg: PAPERCLIP, place: { x: 1.5, y: 86, w: 2.6, r: 22 },  ar: '24 / 68' },
];

/* Phones: the same desk turned upright, everything a little smaller, the
   prints two to a row around the LifeWorx post. Percentages of the board. */
const PHONE_PLACE = {
  maurie:     { x: 3,   y: 4,    w: 46, r: -2.4 },
  belle:      { x: 51,  y: 8,    w: 46, r: -1.5 },
  lifeworx:   { x: 29,  y: 33,   w: 42, r: 1.6 },
  nutrivital: { x: 4,   y: 61,   w: 46, r: -1.8 },
  casablanca: { x: 50,  y: 64.5, w: 46, r: 2.6 },
  sketch:     { x: -7,  y: 29,   w: 30, r: -6 },
  markers:    { x: 73,  y: 36,   w: 28, r: -24 },
  matcha:     { x: 80,  y: -5,   w: 21, r: 0 },
  pencil:     { x: 27,  y: 57.5, w: 44, r: -7 },
  book:       { x: 85,  y: 49,   w: 23, r: 8 },
  glasses:    { x: -8,  y: 81,   w: 22, r: -12 },
  flowers:    { x: 73,  y: 83.5, w: 26, r: 6 },
  clip:       { x: 47,  y: 5,    w: 4,  r: 22 },
};

const objectHtml = (o) => `
          <div class="cab-obj cab-obj--${o.id}" data-obj="${o.id}" aria-hidden="true"
               style="--x:${o.place.x}; --y:${o.place.y}; --w:${o.place.w}; --rot:${o.place.r}; --ar:${o.ar}">${o.svg}</div>`;

export function archiveView({ onBack, onUp }) {
  const pieces = a.pieces;

  const html = `
    <div class="cab">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <button class="crumb__link" type="button" data-up>The worlds</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">Creative archive</span>
      </nav>

      <header class="cab-head">
        <p class="u-label cab-eyebrow">${a.eyebrow}</p>
        <h2 class="cab-title">${a.title}</h2>
        <p class="cab-sub">${a.body}</p>
      </header>

      <div class="cab-board" data-board>
        ${OBJECTS.filter((o) => o.under).map(objectHtml).join('')}
        ${pieces.map((p, i) => `
          <button class="cab-piece${p.bare ? ' cab-piece--bare' : ''}" type="button" data-id="${p.id}"
                  style="--x:${p.place.x}; --y:${p.place.y}; --w:${p.place.w}; --rot:${p.place.r}; --ar:${p.img.w} / ${p.img.h}; --i:${i}"${p.series ? ` data-series="${p.series}"` : ''}
                  aria-label="${p.name}, ${p.label}. Open for a closer look" data-cursor="Pick up">
            ${p.extras.slice(0, 2).map((x, k) => `
              <span class="cab-sheet cab-sheet--${k + 1}" aria-hidden="true"><img src="${smallest(x)}" alt="" draggable="false" loading="lazy" decoding="async"></span>`).join('')}
            <span class="cab-print">
              <img src="${smallest(p.img)}" srcset="${srcset(p.img)}"
                   sizes="(max-width: 46rem) 48vw, ${Math.ceil(p.place.w * 0.95)}vw" width="${p.img.w}" height="${p.img.h}"
                   alt="" draggable="false" decoding="async">
              <span class="cab-tag"><b>${p.label}</b><span>${p.name}</span></span>
            </span>
          </button>`).join('')}
        ${OBJECTS.filter((o) => !o.under).map(objectHtml).join('')}
        <div class="cab-controls">
          <p class="u-label cab-hint">
            <span class="cab-hint--pointer">${a.hint.pointer}</span>
            <span class="cab-hint--touch">${a.hint.touch}</span>
          </p>
          <button class="cab-reset" type="button" data-reset hidden>Put everything back</button>
        </div>
      </div>

      <div class="cab-foot">
        <a class="btn cab-cta" href="${a.cta.href}" target="_blank" rel="noopener noreferrer"
           data-cursor="Open">${a.cta.label} <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>`;

  function mount(root) {
    const cleanup = [];
    const $ = (s) => root.querySelector(s);
    const page = $('.cab');
    const board = $('[data-board]');
    const byId = Object.fromEntries(pieces.map((p) => [p.id, p]));
    const narrow = () => matchMedia('(max-width: 46rem)').matches;
    const still = prefs.reducedMotion;

    // This page scrolls like any page: the portrait's camera must not take the wheel.
    document.documentElement.dataset.ownScroll = 'true';
    cleanup.push(() => { delete document.documentElement.dataset.ownScroll; });

    const onNav = (e) => {
      if (e.target.closest('[data-up]')) return onUp();
      if (e.target.closest('[data-back]')) return onBack();
    };
    root.addEventListener('click', onNav);
    cleanup.push(() => root.removeEventListener('click', onNav));

    /* --- the prints are dealt onto the desk the first time it's seen ------ */
    if (!still && 'IntersectionObserver' in window) {
      board.dataset.deal = 'waiting';
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        board.dataset.deal = 'go';
        setTimeout(() => { delete board.dataset.deal; }, 1600);
      }, { root: observerRoot(root), threshold: 0.12 });
      io.observe(board);
      cleanup.push(() => io.disconnect());
    }

    /* --- handling: pick up, move, tilt, set down with a little glide ------ */
    let top = 20;
    const moved = new Set();
    const resetBtn = $('[data-reset]');
    const num = (el, k) => parseFloat(el.style.getPropertyValue(k));
    const set = (el, k, v) => el.style.setProperty(k, String(Math.round(v * 100) / 100));

    function keepOnBoard(el) {
      const bw = board.clientWidth, bh = board.clientHeight;
      const w = el.offsetWidth / bw * 100, h = el.offsetHeight / bh * 100;
      const m = el.classList.contains('cab-obj') ? 10 : 1.5;
      set(el, '--x', Math.min(Math.max(num(el, '--x'), -m), 100 + m - w));
      set(el, '--y', Math.min(Math.max(num(el, '--y'), -m), 100 + m - h));
    }

    const HOLD = 170;    // ms a finger rests on a print before it is picked up
    function handle(el) {
      let g = null;      // the grip while held
      let raf = 0;
      const rest = () => num(el, '--rest');
      set(el, '--rest', num(el, '--rot'));
      const lift = () => { el.style.zIndex = String(++top); el.classList.add('is-held'); };

      const down = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        // A mouse or pen picks a piece up at once (not on a phone-sized
        // window). A finger (phones and tablets) rests on it for a moment
        // first: a swipe that sets off straight away is the page scrolling.
        const finger = e.pointerType === 'touch';
        if (finger ? !flowMQ.matches : narrow()) return;
        cancelAnimationFrame(raf);
        const grip = { id: e.pointerId, px: e.clientX, py: e.clientY, x: num(el, '--x'), y: num(el, '--y'),
              t: performance.now(), t0: performance.now(), vx: 0, vy: 0, far: false, finger, armed: !finger };
        g = grip;
        if (finger) {
          grip.timer = setTimeout(() => { if (g === grip) { grip.armed = true; lift(); } }, HOLD);
          return;
        }
        el.setPointerCapture(e.pointerId);
        lift();
      };
      const move = (e) => {
        if (!g || e.pointerId !== g.id) return;
        const dx = e.clientX - g.px, dy = e.clientY - g.py;
        if (!g.armed) {                   // moving before the pick-up: a scroll
          if (Math.hypot(dx, dy) > 8) { clearTimeout(g.timer); g = null; }
          return;
        }
        if (!g.far && Math.hypot(dx, dy) > 5) { g.far = true; el.classList.add('is-moving'); }
        if (!g.far) return;
        const now = performance.now(), dt = Math.max(1, now - g.t);
        const nx = g.x + dx / board.clientWidth * 100, ny = g.y + dy / board.clientHeight * 100;
        g.vx = g.vx * .7 + ((nx - num(el, '--x')) / dt) * .3;
        g.vy = g.vy * .7 + ((ny - num(el, '--y')) / dt) * .3;
        g.t = now;
        set(el, '--x', nx); set(el, '--y', ny);
        keepOnBoard(el);
        // the paper leans a little into the direction it's being carried
        if (!still) set(el, '--rot', rest() + Math.max(-5, Math.min(5, g.vx * 55)));
      };
      const up = (e) => {
        if (!g || e.pointerId !== g.id) return;
        const { far, vx, vy, t0 } = g;
        clearTimeout(g.timer);
        g = null;
        el.classList.remove('is-held', 'is-moving');
        set(el, '--rot', rest());
        if (!far) {
          if (el.dataset.id && performance.now() - t0 < 600) open(el.dataset.id);
          return;
        }
        moved.add(el); resetBtn.hidden = false;
        if (still) return;
        let ux = vx, uy = vy, last = performance.now();
        const glide = (now) => {
          const dt = Math.min(32, now - last); last = now;
          set(el, '--x', num(el, '--x') + ux * dt); set(el, '--y', num(el, '--y') + uy * dt);
          keepOnBoard(el);
          const f = Math.pow(.988, dt); ux *= f; uy *= f;
          if (Math.hypot(ux, uy) > .0015) raf = requestAnimationFrame(glide);
        };
        raf = requestAnimationFrame(glide);
      };
      // Keyboard: Enter/Space opens (a click with no pointer); arrows move the print.
      const click = (e) => { if (e.detail === 0 && el.dataset.id) open(el.dataset.id); };
      const key = (e) => {
        const step = e.shiftKey ? 5 : 1.5;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (!d || narrow()) return;
        e.preventDefault();
        el.style.zIndex = String(++top);
        set(el, '--x', num(el, '--x') + d[0]); set(el, '--y', num(el, '--y') + d[1] * 1.6);
        keepOnBoard(el);
        moved.add(el); resetBtn.hidden = false;
      };

      // The browser took the gesture (a scroll): nothing opens, and a print
      // already on the move is set down where it is.
      const cancel = (e) => {
        if (!g || e.pointerId !== g.id) return;
        clearTimeout(g.timer);
        if (g.far) return up(e);
        g = null;
        el.classList.remove('is-held', 'is-moving');
        set(el, '--rot', rest());
      };
      // Once a finger has picked a print up, the page holds still under it.
      const hold = (e) => { if (g?.finger && g.armed) e.preventDefault(); };
      const noMenu = (e) => { if (g?.finger) e.preventDefault(); };

      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', cancel);
      el.addEventListener('touchmove', hold, { passive: false });
      el.addEventListener('contextmenu', noMenu);
      el.addEventListener('click', click);
      el.addEventListener('keydown', key);
      el.addEventListener('dragstart', (e) => e.preventDefault());
      cleanup.push(() => {
        cancelAnimationFrame(raf);
        clearTimeout(g?.timer);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', cancel);
        el.removeEventListener('touchmove', hold, { passive: false });
        el.removeEventListener('contextmenu', noMenu);
        el.removeEventListener('click', click);
        el.removeEventListener('keydown', key);
      });
    }
    board.querySelectorAll('.cab-piece, .cab-obj').forEach(handle);

    // Where everything starts: the desk as laid out, or upright on a phone.
    const desk = Object.fromEntries([...pieces, ...OBJECTS].map((p) => [p.id, p.place]));
    const phoneMQ = matchMedia('(max-width: 46rem)');
    const home = () => (phoneMQ.matches ? PHONE_PLACE : desk);
    const arrange = () => {
      const h = home();
      board.querySelectorAll('.cab-piece, .cab-obj').forEach((el) => {
        const p = h[el.dataset.id || el.dataset.obj];
        set(el, '--x', p.x); set(el, '--y', p.y); set(el, '--w', p.w); set(el, '--rot', p.r); set(el, '--rest', p.r);
        el.style.zIndex = '';
      });
      moved.clear(); resetBtn.hidden = true;
    };
    if (phoneMQ.matches) arrange();
    phoneMQ.addEventListener('change', arrange);
    cleanup.push(() => phoneMQ.removeEventListener('change', arrange));

    // Everything back where it started, gently.
    resetBtn.addEventListener('click', () => {
      board.classList.add('is-tidying');
      arrange();
      setTimeout(() => board.classList.remove('is-tidying'), 800);
    });

    /* --- the close-up ------------------------------------------------------- */
    const lay = document.createElement('div');
    lay.className = 'cab-focus';
    lay.hidden = true;
    lay.setAttribute('role', 'dialog');
    lay.setAttribute('aria-modal', 'true');
    lay.setAttribute('aria-labelledby', 'cab-focus-name');
    lay.innerHTML = `
      <div class="cab-focus__veil" data-close data-cursor="Put it back"></div>
      <div class="cab-focus__stage">
        <figure class="cab-focus__fig">
          <div class="cab-focus__print"><img alt=""></div>
          <figcaption class="cab-focus__cap">
            <span class="cab-focus__label"></span>
            <span class="cab-focus__name" id="cab-focus-name"></span>
            <span class="cab-focus__count"></span>
            <span class="cab-focus__note"></span>
          </figcaption>
        </figure>
        <div class="cab-focus__thumbs" role="group" aria-label="More images"></div>
      </div>
      <button class="cab-focus__nav cab-focus__nav--prev" type="button" aria-label="Previous image" data-step="-1">&larr;</button>
      <button class="cab-focus__nav cab-focus__nav--next" type="button" aria-label="Next image" data-step="1">&rarr;</button>
      <button class="cab-focus__close" type="button" aria-label="Put it back" data-close>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>
      </button>`;
    document.body.append(lay);
    cleanup.push(() => lay.remove());

    const fImg = lay.querySelector('.cab-focus__print img');
    const fPrint = lay.querySelector('.cab-focus__print');
    const fThumbs = lay.querySelector('.cab-focus__thumbs');
    let cur = null;   // { id, i, el }

    // A piece's images; a series (the LifeWorx posts) opens as one set, each
    // design followed by the post as it was published.
    const own = (p) => [{ ...p.img, alt: p.alt, from: p.id }, ...p.extras.map((x) => ({ ...x, from: p.id }))];
    // (each image may carry its own label, e.g. a social post inside a branding set)
    const imagesOf = (p) => (p.series ? pieces.filter((q) => q.series === p.series).flatMap(own) : own(p));
    const startOf = (p) => imagesOf(p).findIndex((im) => im.from === p.id);

    function show(i) {
      const p = byId[cur.id], list = imagesOf(p);
      cur.i = (i + list.length) % list.length;
      const im = list[cur.i];
      fImg.width = im.w; fImg.height = im.h;
      // Fit the image inside the available room so the white frame hugs it,
      // whatever its shape (landscape designs, tall screenshots).
      const phone = matchMedia('(max-width: 46rem)').matches;
      const maxW = Math.min(1100, innerWidth * (phone ? .92 : .88));
      const maxH = Math.min(760, innerHeight * (phone ? .6 : .66));
      const k = Math.min(maxW / im.w, maxH / im.h, 1);
      fImg.style.width = `${Math.round(im.w * k)}px`;
      fImg.style.height = `${Math.round(im.h * k)}px`;
      // the caption wraps to the print's width rather than widening it
      fPrint.parentElement.style.width = `${Math.round(im.w * k) + (phone ? 12 : 20)}px`;
      // sharp at any density: the browser picks the width for this exact size
      fImg.sizes = `${Math.round(im.w * k)}px`;
      fImg.srcset = srcset(im);
      fImg.src = url(im, im.widths[im.widths.length - 1]);
      lay.querySelector('.cab-focus__label').textContent = im.label || p.label;
      fImg.alt = im.alt;
      fPrint.style.setProperty('--ar', `${im.w} / ${im.h}`);
      lay.querySelector('.cab-focus__note').textContent = im.note || '';
      lay.querySelector('.cab-focus__count').textContent = list.length > 1 ? `${cur.i + 1} / ${list.length}` : '';
      fThumbs.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', String(k === cur.i)));
    }

    function open(id) {
      if (cur) return;
      const p = byId[id], el = board.querySelector(`[data-id="${id}"]`), list = imagesOf(p);
      cur = { id, i: 0, el, start: startOf(p) };
      lay.querySelector('.cab-focus__name').textContent = p.name;
      fThumbs.innerHTML = list.length > 1 ? list.map((im, k) => `
        <button type="button" data-thumb="${k}" aria-label="Image ${k + 1} of ${list.length}">
          <img src="${smallest(im)}" alt="" loading="lazy">
        </button>`).join('') : '';
      lay.dataset.many = String(list.length > 1);
      show(cur.start);
      lay.hidden = false;
      lockScroll(root, true);
      requestAnimationFrame(() => {
        lay.dataset.on = 'true';
        // The print travels from where it lies on the desk to the middle of the screen.
        if (!still) {
          const from = el.querySelector('.cab-print').getBoundingClientRect(), to = fPrint.getBoundingClientRect();
          el.classList.add('is-away');
          fPrint.animate([
            { transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width}) rotate(${num(el, '--rot')}deg)` },
            { transform: 'none' },
          ], { duration: 560, easing: 'cubic-bezier(.2, .8, .2, 1)' });
        }
      });
      lay.querySelector('.cab-focus__close').focus({ preventScroll: true });
    }

    function close() {
      if (!cur) return;
      const { el } = cur;
      const done = () => {
        lay.hidden = true; delete lay.dataset.on;
        el.classList.remove('is-away');
        lockScroll(root, false);
        el.focus({ preventScroll: true });
        cur = null;
      };
      lay.dataset.on = 'false';
      if (still || cur.i !== cur.start) return setTimeout(done, still ? 0 : 280);
      const to = el.querySelector('.cab-print').getBoundingClientRect(), from = fPrint.getBoundingClientRect();
      fPrint.animate([
        { transform: 'none' },
        { transform: `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${to.top + to.height / 2 - (from.top + from.height / 2)}px) scale(${to.width / from.width}) rotate(${num(el, '--rot')}deg)` },
      ], { duration: 460, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished.then(() => {
        fPrint.getAnimations().forEach((an) => an.cancel());
        done();
      });
    }

    lay.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return close();
      const s = e.target.closest('[data-step]');
      if (s) return show(cur.i + Number(s.dataset.step));
      const t = e.target.closest('[data-thumb]');
      if (t) return show(Number(t.dataset.thumb));
    });
    // Escape puts the print down before the site's own Escape (which leaves the page).
    const onKey = (e) => {
      if (!cur) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur.i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur.i - 1); }
      else if (e.key === 'Tab') {
        const f = [...lay.querySelectorAll('button:not([hidden])')].filter((b) => b.offsetParent);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    cleanup.push(() => { document.removeEventListener('keydown', onKey, true); lockScroll(root, false); });

    // A mouse on a phone-sized window doesn't drag, so a plain click brings
    // the print closer (a finger's tap is handled with the pick-up above).
    let touching = false;
    const noteTouch = (e) => { touching = e.pointerType === 'touch'; };
    board.addEventListener('pointerdown', noteTouch, true);
    const tap = (e) => {
      const el = e.target.closest('.cab-piece');
      if (el && narrow() && !touching) open(el.dataset.id);
    };
    board.addEventListener('click', tap);
    cleanup.push(() => { board.removeEventListener('click', tap); board.removeEventListener('pointerdown', noteTouch, true); });

    requestAnimationFrame(() => { page.dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'archive', html, mount };
}
