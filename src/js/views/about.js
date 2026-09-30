import { about } from '../../../content/pages.js';
import { prefs } from '../prefs.js';
import { observerRoot, flowMQ } from '../page-scroll.js';

/**
 * About.
 *
 * An editorial page on warm paper, in the order a reader gets to know someone:
 * who she is (a large portrait beside the positioning), the tools she works
 * with, where she comes from, her education and the path her work took, what
 * keeps her curious, how she thinks about design, what she brings, and a way
 * to reach her.
 *
 * The interactive moments are small discoveries, never gates:
 *   · The tools drift past; hovering one holds the row and names it.
 *   · The Cum Laude star warms on hover and glows briefly when pressed.
 *   · The path's step numbers and the curiosity icons answer the pointer.
 *   · A sketchbook already lists all six capabilities with their lines.
 *     Placing a card in it (drag, click, tap or keyboard) only inks that
 *     entry. Nothing is hidden behind the interaction.
 */

/* The capability stickers: small real objects turned into die-cut stickers,
   drawn the way the Creative Archive draws its desk objects (layered
   gradients for the material, a highlight for gloss, a thin edge); `cut`
   below gives each its white sticker border and shadow.
   `currentColor` is the skill's accent, so each object carries its sticker's
   colour. No text: each sticker has its skill as its accessible name, and the
   book beside them prints it. Ids are per object so the gradients never clash. */
const OBJECT = {
  // UX/UI Design: a computer mouse, seen from above
  uxui: (k) => `
    <defs>
      <linearGradient id="${k}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F2EFE9"/><stop offset="1" stop-color="#CBC3B5"/></linearGradient>
    </defs>
    <g transform="rotate(-18 32 32)">
      <rect x="20.5" y="12" width="23" height="38" rx="11.5" fill="url(#${k}b)" stroke="#B9B1A2" stroke-width=".6"/>
      <path d="M32 12.6V27.4" stroke="#BDB5A6" stroke-width=".7"/>
      <path d="M21 27.6Q32 30 43 27.6" fill="none" stroke="#C6BEB0" stroke-width=".6"/>
      <rect x="30.4" y="16.4" width="3.2" height="7.4" rx="1.6" fill="currentColor"/>
      <rect x="31" y="17.2" width="1" height="2.6" rx=".5" fill="#fff" opacity=".6"/>
      <ellipse cx="25.8" cy="21" rx="3.2" ry="6.5" fill="#fff" opacity=".75"/>
    </g>`,
  // Product Design: a small phone showing a product screen
  product: (k) => `
    <defs>
      <linearGradient id="${k}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A4D44"/><stop offset="1" stop-color="#1E201B"/></linearGradient>
      <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <g transform="rotate(12 32 30)">
      <rect x="21" y="9" width="22" height="42" rx="5" fill="url(#${k}b)"/>
      <rect x="42.6" y="18" width="1" height="5" rx=".5" fill="#2A2C26"/>
      <rect x="23" y="11.5" width="18" height="37" rx="3.4" fill="#FBF8F2"/>
      <rect x="29" y="12.4" width="6" height="1.4" rx=".7" fill="#1E201B"/>
      <rect x="25" y="16" width="14" height="8.5" rx="1.8" fill="currentColor" opacity=".85"/>
      <circle cx="28.2" cy="19.4" r="1.4" fill="#fff" opacity=".8"/>
      <rect x="25" y="27" width="12" height="1.7" rx=".85" fill="#D6CFC2"/>
      <rect x="25" y="30.6" width="8.5" height="1.7" rx=".85" fill="#E2DCD0"/>
      <rect x="25" y="34.2" width="14" height="4.6" rx="1.2" fill="#EFEAE0"/>
      <rect x="25" y="41.6" width="14" height="4" rx="2" fill="currentColor"/>
      <rect x="21" y="9" width="22" height="42" rx="5" fill="url(#${k}g)"/>
    </g>`,
  // AI-assisted Design: a small glass orb on a brass stand, a spark inside
  ai: (k) => `
    <defs>
      <radialGradient id="${k}o" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#F7F0DC"/><stop offset=".78" stop-color="#E2D2A2"/><stop offset="1" stop-color="#B99F5E"/></radialGradient>
      <linearGradient id="${k}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3CE93"/><stop offset=".5" stop-color="#B8974B"/><stop offset="1" stop-color="#7F6630"/></linearGradient>
      <radialGradient id="${k}c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="currentColor" stop-opacity=".4"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M23 45.5h19l-1.6 4.6H24.6z" fill="url(#${k}m)"/>
    <rect x="23" y="44.6" width="19" height="1.4" rx=".7" fill="#EFDDA9"/>
    <circle cx="32.5" cy="29" r="15" fill="url(#${k}o)" stroke="#fff" stroke-opacity=".7" stroke-width=".6"/>
    <circle cx="32.5" cy="30" r="10" fill="url(#${k}c)"/>
    <path d="M32.5 22.5l1.9 5.2 5.2 1.9-5.2 1.9-1.9 5.2-1.9-5.2-5.2-1.9 5.2-1.9z" fill="currentColor"/>
    <path d="M39.2 20.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="currentColor" opacity=".75"/>
    <ellipse cx="26.2" cy="21.4" rx="4.6" ry="2.8" transform="rotate(-32 26.2 21.4)" fill="#fff" opacity=".85"/>`,
  // Interaction Design: a dimensional cursor, its thickness showing
  interaction: (k) => `
    <defs>
      <linearGradient id="${k}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EAF0"/></linearGradient>
    </defs>
<g transform="translate(3 1)">
    <path d="M23.2 14.6v32l7.5-7 5 11.5 5-2.2-4.9-11.3 10.4-.8z" fill="#8FA2B5"/>
    <path d="M22 13v32l7.5-7 5 11.5 5-2.2-4.9-11.3 10.4-.8z" fill="url(#${k}f)" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/>
    <path d="M24 18.5v18" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>
    </g>`,
  // Prototyping: a fanned stack of wireframe cards held with a paperclip
  prototype: (k) => `
    <defs>
      <linearGradient id="${k}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E8A82"/><stop offset=".5" stop-color="#E4E1DB"/><stop offset="1" stop-color="#8E8A82"/></linearGradient>
    </defs>
    <rect x="16" y="13" width="30" height="37" rx="2" transform="rotate(-11 31 31)" fill="#EFE9DF" stroke="#D3CABB" stroke-width=".6"/>
    <rect x="17" y="13" width="30" height="37" rx="2" transform="rotate(5 32 31)" fill="#F7F3EC" stroke="#D8D0C2" stroke-width=".6"/>
    <rect x="17" y="13.5" width="30" height="37" rx="2" fill="#FFFFFF" stroke="#D9D1C3" stroke-width=".6"/>
    <rect x="20.5" y="17.5" width="23" height="10" rx="1" fill="currentColor" opacity=".18"/>
    <path d="M20.5 17.5l23 10M43.5 17.5l-23 10" stroke="currentColor" stroke-width=".6" opacity=".5"/>
    <rect x="20.5" y="31" width="19" height="1.7" rx=".85" fill="#CFC7B8"/>
    <rect x="20.5" y="34.8" width="13" height="1.7" rx=".85" fill="#DCD5C8"/>
    <rect x="20.5" y="41.5" width="10" height="4.4" rx="2.2" fill="currentColor"/>
    <path d="M40.5 9.5v11.2a2.9 2.9 0 0 1-5.8 0v-8.8a1.7 1.7 0 0 1 3.4 0v8.2" fill="none" stroke="url(#${k}c)" stroke-width="1.3" stroke-linecap="round"/>`,
  // Visual Design: a wooden palette with paint, and a brush laid across it
  visual: (k) => `
    <defs>
      <linearGradient id="${k}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0D6AE"/><stop offset=".6" stop-color="#DDB37C"/><stop offset="1" stop-color="#BE8C55"/></linearGradient>
      <radialGradient id="${k}d" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M32 14C20 14 12 21 12 30s7 16 16 16c4 0 5-2.5 4-5s1-4.5 4-4.5h4c7 0 12-4 12-10 0-7.5-9-12.5-20-12.5z" fill="url(#${k}w)" stroke="#AE7F4E" stroke-width=".6"/>
    <path d="M17 24c2.5-5 8-7.5 15-7.5" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".45"/>
    <circle cx="21.6" cy="37.4" r="2.6" fill="#FFFFFF" stroke="#AE7F4E" stroke-width=".5"/>
    <circle cx="23.5" cy="24.5" r="3.2" fill="currentColor"/><circle cx="23.5" cy="24.5" r="3.2" fill="url(#${k}d)"/>
    <circle cx="31.5" cy="20.6" r="3" fill="#A25B57"/><circle cx="31.5" cy="20.6" r="3" fill="url(#${k}d)"/>
    <circle cx="40" cy="22.4" r="3" fill="#C9A24A"/><circle cx="40" cy="22.4" r="3" fill="url(#${k}d)"/>
    <circle cx="43.6" cy="29.4" r="2.6" fill="#5F7456"/><circle cx="43.6" cy="29.4" r="2.6" fill="url(#${k}d)"/>
    <path d="M53 51L40.5 38.5" stroke="#3B3A34" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M53 51l-4-4" stroke="#5A5850" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M40.6 38.6l-2.6-2.6" stroke="#C3BAA6" stroke-width="3.2" stroke-linecap="butt"/>
    <path d="M38 36c-2.6-2.6-5.6-3.4-7.4-3.2.1 1.9.9 4.8 3.3 7 1.5 1.3 3.2.8 4.1-.1.9-.9 1.2-2.5 0-3.7z" fill="currentColor"/>`,
};
/* Die-cut: the object's own silhouette, grown into a white border with a
   clean, smooth cut (blurred then re-sharpened, so corners round off evenly
   instead of stepping), over a soft shadow. The object is the sticker. */
const cut = (k) => `
  <filter id="${k}cut" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="grow"/>
    <feGaussianBlur in="grow" stdDeviation=".45" result="soft"/>
    <feComponentTransfer in="soft" result="edge"><feFuncA type="linear" slope="2.2" intercept="-.6"/></feComponentTransfer>
    <feGaussianBlur in="edge" stdDeviation="1.5" result="blur"/>
    <feOffset in="blur" dx=".5" dy="1.3" result="drop"/>
    <feFlood flood-color="#3A3226" flood-opacity=".3"/><feComposite in2="drop" operator="in" result="shadow"/>
    <feFlood flood-color="#FFFFFF"/><feComposite in2="edge" operator="in" result="paper"/>
    <feFlood flood-color="#3A3226" flood-opacity=".07"/><feComposite in2="edge" operator="in" result="tint"/>
    <feMorphology in="edge" operator="erode" radius=".35" result="inner"/>
    <feFlood flood-color="#FFFFFF"/><feComposite in2="inner" operator="in" result="face"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="tint"/><feMergeNode in="face"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
const glyph = (id) => {
  const k = `abt-o-${id}-`;
  return `<svg class="abt-card__glyph" viewBox="3 1 58 58" aria-hidden="true" focusable="false">
    <defs>${cut(k)}</defs><g filter="url(#${k}cut)">${OBJECT[id](k)}</g></svg>`;
};

/* Line drawings for the curiosity notes. Painting is an artist's round
   brush (handle, ferrule, tapered tip) with a drop of paint beside it. */
const NOTE_ICON = {
  paint:  '<path d="M20.6 3.4l-6.4 6.4"/><path d="M14.9 8.4l1.7 1.7-3 3-1.7-1.7z"/><path d="M11.9 11.4c-2.1.4-3.7 2-4.5 4.4-.5 1.6-1.6 3-3.4 3.8 2.6.6 5.6 0 7.6-2 1.4-1.4 2-3 2-4.5"/><path d="M18.6 15.2c1 1.2 1.5 2.1 1.5 2.8a1.5 1.5 0 0 1-3 0c0-.7.5-1.6 1.5-2.8z"/>',
  read:   '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
  ai:     '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  travel: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  home:   '<path d="M2 16c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><circle cx="16" cy="7" r="3"/>',
};
const noteIcon = (id) =>
  `<svg class="abt-note__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
        stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NOTE_ICON[id]}</svg>`;

/* How each sticker rests beside the book: a slight tilt, mirrored between
   the columns, so the two groups sit level and carry the same weight. */
const REST = {
  uxui:        { r: -6, nx: 0 },     product:   { r: 5,  nx: 0 },   ai:     { r: -3, nx: 0 },
  interaction: { r: 6,  nx: 0 },     prototype: { r: -5, nx: 0 },   visual: { r: 3,  nx: 0 },
};

export function aboutView({ onBack, onContact }) {
  const a = about;
  const cap = a.capabilities;
  const half = Math.ceil(cap.skills.length / 2);
  const eyebrow = (text) => `<p class="u-label abt-eyebrow">${text}</p>`;

  const card = (s) => `
    <div class="abt-home" data-home="${s.id}" style="--nx:${REST[s.id].nx}rem">
      <button class="abt-card abt-skill--${s.id}" type="button" data-skill="${s.id}"
              aria-label="${s.name}" aria-pressed="false" aria-describedby="abt-entry-${s.id}"
              style="--r:${REST[s.id].r}deg" data-cursor="Place it">
        <span class="abt-card__face">${glyph(s.id)}</span>
      </button>
    </div>`;
  const entry = (s) => `
    <li class="abt-entry abt-skill--${s.id}" id="abt-entry-${s.id}" data-entry="${s.id}">
      <span class="abt-entry__slot" data-slot="${s.id}"><span class="abt-entry__mark" aria-hidden="true"></span></span>
      <span class="abt-entry__text">
        <span class="abt-entry__name">${s.name}</span>
        <span class="abt-entry__line">${s.line}</span>
      </span>
    </li>`;

  const tool = (t, hidden) => `
    <li class="abt-tool"${hidden ? ' aria-hidden="true"' : ''}>
      <img class="abt-tool__logo" src="/assets/img/tools/${t.file || `${t.logo}.svg`}" alt="" width="28" height="28" loading="lazy" decoding="async" draggable="false">
      <span class="abt-tool__name">${t.name}</span>
    </li>`;

  const e = a.education;
  const html = `
    <div class="page abt">
      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">About</span>
      </nav>

      <header class="abt-hero">
        <figure class="abt-portrait">
          <img src="/assets/img/about-portrait-580.webp"
               srcset="/assets/img/about-portrait-380.webp 380w,
                       /assets/img/about-portrait-580.webp 580w,
                       /assets/img/about-portrait-860.webp 860w"
               sizes="(min-width: 62rem) 40vw, 92vw"
               width="1024" height="1536" decoding="async" fetchpriority="high"
               alt="Nikole Ugueto, seated on a terrace at sunset, turning to camera.">
        </figure>
        <div class="abt-hero__words">
          ${eyebrow(a.eyebrow)}
          <p class="abt-hello">${a.hello}</p>
          <h2 class="abt-title">${a.title}</h2>
          <p class="abt-intro">${a.intro.lead}<br class="abt-intro__br"> ${a.intro.rest}</p>
          <p class="abt-facts u-label">${a.facts.map((f) => `<span>${f}</span>`).join('<span class="abt-dot" aria-hidden="true">·</span>')}</p>
          <button class="btn abt-btn" type="button" data-contact data-cursor="Get in touch">
            Get in touch <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </header>

      <section class="abt-tools abt-rv" aria-labelledby="abt-tools-h">
        <div class="abt-tools__head">
          <p class="u-label abt-eyebrow" id="abt-tools-h">${a.tools.eyebrow}</p>
          <p class="abt-tools__note">${a.tools.note}</p>
        </div>
        <div class="abt-tools__view" data-cursor="Drag">
          <ul class="abt-tools__track">
            ${a.tools.list.map((t) => tool(t, false)).join('')}
            ${a.tools.list.map((t) => tool(t, true)).join('')}
          </ul>
        </div>
      </section>

      <section class="abt-sec abt-band abt-band--white abt-origin abt-rv" aria-labelledby="abt-origin-h">
        <div>
          ${eyebrow(a.origin.eyebrow)}
          <h3 class="abt-h" id="abt-origin-h">${a.origin.title}</h3>
        </div>
        <div class="abt-prose">${a.origin.body.map((p) => `<p>${p}</p>`).join('')}</div>
      </section>

      <section class="abt-sec abt-edu abt-rv" aria-labelledby="abt-edu-h">
        ${eyebrow(e.eyebrow)}
        <div class="abt-edu__grid">
          <div class="abt-school">
            <button class="abt-seal" type="button" data-seal
                    aria-label="${e.primary.honor}, ${e.primary.year}">
              <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                <defs><path id="abt-seal-ring" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs>
                <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width=".8"/>
                <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width=".8"/>
                <text><textPath href="#abt-seal-ring">${e.primary.honor.toUpperCase()} · ${e.primary.year} · ${e.primary.honor.toUpperCase()} · ${e.primary.year} ·</textPath></text>
                <path class="abt-seal__star" d="M60 45.5l3.4 10.4 10.9.1-8.8 6.4 3.3 10.4L60 66.4l-8.8 6.4 3.3-10.4-8.8-6.4 10.9-.1z"/>
              </svg>
            </button>
            <p class="abt-school__label u-label">Education</p>
            <h3 class="abt-school__name" id="abt-edu-h">${e.primary.school}</h3>
            <p class="abt-school__degree">${e.primary.degree}<span class="abt-dot" aria-hidden="true">·</span><strong>${e.primary.honor}</strong><span class="abt-dot" aria-hidden="true">·</span>${e.primary.year}</p>
            <div class="abt-school2">
              <h4 class="abt-school2__name">${e.secondary.school}</h4>
              <p class="abt-school2__degree">${e.secondary.degree} · ${e.secondary.year}</p>
            </div>
          </div>

          <div class="abt-path">
            <h3 class="abt-path__h">How my work grew</h3>
            <ol class="abt-path__list">
              ${a.path.map((p, i) => `
                <li class="abt-step">
                  <span class="abt-step__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4 class="abt-step__stage">${p.stage}</h4>
                    <p class="abt-step__where u-label">${p.where}</p>
                    <p class="abt-step__proof">${p.proof}</p>
                  </div>
                </li>`).join('')}
            </ol>
          </div>
        </div>
      </section>

      <section class="abt-sec abt-band abt-band--white abt-curious abt-rv" aria-labelledby="abt-curious-h">
        <p class="u-label abt-eyebrow" id="abt-curious-h">${a.curious.eyebrow}</p>
        <ul class="abt-notes">
          ${a.curious.notes.map((n) => `
            <li class="abt-note">
              ${noteIcon(n.id)}
              <h4 class="abt-note__title">${n.title}</h4>
              <p class="abt-note__line">${n.line}</p>
            </li>`).join('')}
        </ul>
      </section>

      <section class="abt-sec abt-think abt-rv" aria-labelledby="abt-think-h">
        ${eyebrow(a.thinking.eyebrow)}
        <h3 class="abt-h" id="abt-think-h">${a.thinking.title}</h3>
        <ul class="abt-points">
          ${a.thinking.points.map((p) => `
            <li class="abt-point">
              <h4 class="abt-point__title">${p.title}</h4>
              <p class="abt-point__body">${p.body}</p>
            </li>`).join('')}
        </ul>
      </section>

      <section class="abt-sec abt-band abt-band--warm abt-caps abt-rv" aria-labelledby="abt-caps-h">
        <div class="abt-caps__head">
          ${eyebrow(cap.eyebrow)}
          <h3 class="abt-h" id="abt-caps-h">${cap.title}</h3>
          <p class="abt-caps__hint">${cap.hint}</p>
        </div>
        <div class="abt-studio">
          <div class="abt-homes abt-homes--a">${cap.skills.slice(0, half).map(card).join('')}</div>
          <div class="abt-book" data-book>
            <span class="abt-book__ribbon" aria-hidden="true"></span>
            <div class="abt-page abt-page--l">
              <ul class="abt-entries">${cap.skills.slice(0, half).map(entry).join('')}</ul>
            </div>
            <div class="abt-page abt-page--r">
              <ul class="abt-entries">${cap.skills.slice(half).map(entry).join('')}</ul>
            </div>
          </div>
          <div class="abt-homes abt-homes--b">${cap.skills.slice(half).map(card).join('')}</div>
        </div>
        <p class="abt-caps__tools"><button class="abt-reset" type="button" data-reset hidden>Clear the book</button></p>
        <p class="abt-sr" aria-live="polite" data-live></p>
      </section>

      <footer class="abt-close abt-band abt-band--olive abt-rv">
        <h3 class="abt-close__title">${a.close.title}</h3>
        <button class="btn abt-btn" type="button" data-contact data-cursor="Get in touch">
          Get in touch <span aria-hidden="true">&rarr;</span>
        </button>
      </footer>
    </div>`;

  function mount(root) {
    const page = root.querySelector('.abt');
    const $ = (sel) => page.querySelector(sel);
    const cleanup = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanup.push(() => el.removeEventListener(ev, fn, opt)); };

    // The page scrolls itself: without this the hero camera claims the wheel
    // on wide screens (same opt-in the archive uses; see camera.js).
    document.documentElement.dataset.ownScroll = 'true';
    cleanup.push(() => { delete document.documentElement.dataset.ownScroll; });

    on(page, 'click', (ev) => {
      if (ev.target.closest('[data-contact]')) return onContact();
      if (ev.target.closest('[data-back]')) return onBack();
    });

    /* --- the Cum Laude star: a brief glow when pressed ------------------- */
    const seal = $('[data-seal]');
    on(seal, 'click', () => {
      seal.classList.remove('is-lit');
      void seal.offsetWidth;                // restart the glow if pressed again
      seal.classList.add('is-lit');
    });
    on(seal, 'animationend', () => seal.classList.remove('is-lit'));

    /* --- tools: a slow drift the visitor can steer ------------------------
       Same idea as the case studies' testimonials (hold and drag the band),
       with two additions: the pointer resting on the row eases it almost to
       a stop so a name can be read, and a release keeps the flick's momentum
       for a moment before settling back to the drift. Horizontal swipes steer
       it on touch; vertical swipes still scroll the page. Reduced motion
       leaves the marks as a still grid (see the CSS). */
    if (!prefs.reducedMotion) {
      const view = $('.abt-tools__view');
      const track = $('.abt-tools__track');
      const DRIFT = 0.028;                  // px per ms: slow
      let offset = 0, v = DRIFT, hover = false, held = null, last = 0, raf = 0, running = false;
      const loop = () => track.scrollWidth / 2;
      const wrap = () => { const L = loop(); if (L > 0) offset = ((offset % L) + L) % L; };
      const paint = () => { track.style.transform = `translate3d(${-offset}px, 0, 0)`; };
      const tick = (now) => {
        const dt = Math.min(50, now - (last || now)); last = now;
        if (!held) {
          const target = hover ? DRIFT * .15 : DRIFT;
          v += (target - v) * Math.min(1, dt / 500);   // ease toward the drift
          offset += v * dt;
        }
        wrap(); paint();
        raf = requestAnimationFrame(tick);
      };
      const start = () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(tick); };
      const stop = () => { running = false; cancelAnimationFrame(raf); };
      // only animate while the row is on screen
      const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { root: observerRoot(root) });
      io.observe(view);
      cleanup.push(() => { io.disconnect(); stop(); });

      page.dataset.tools = 'live';
      on(view, 'pointerenter', (ev) => { if (ev.pointerType === 'mouse') hover = true; });
      on(view, 'pointerleave', () => { hover = false; });
      on(view, 'pointerdown', (ev) => {
        if (ev.button !== 0) return;
        held = { id: ev.pointerId, x: ev.clientX, from: offset, lx: ev.clientX, lt: performance.now(), vel: 0 };
        view.setPointerCapture(ev.pointerId);
        view.classList.add('is-held');
      });
      on(view, 'pointermove', (ev) => {
        if (!held || ev.pointerId !== held.id) return;
        const now = performance.now(), dt = Math.max(1, now - held.lt);
        held.vel = held.vel * .6 + (-(ev.clientX - held.lx) / dt) * .4;
        held.lx = ev.clientX; held.lt = now;
        offset = held.from - (ev.clientX - held.x);
      });
      const release = (ev) => {
        if (!held || ev.pointerId !== held.id) return;
        v = Math.max(-1.6, Math.min(1.6, held.vel));   // keep the flick, briefly
        held = null;
        view.classList.remove('is-held');
      };
      on(view, 'pointerup', release);
      on(view, 'pointercancel', release);
      on(view, 'dragstart', (ev) => ev.preventDefault());
    }

    /* --- sections settle in as they arrive ------------------------------- */
    if (!prefs.reducedMotion && 'IntersectionObserver' in window) {
      page.dataset.reveal = 'on';
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.dataset.in = 'true';
          io.unobserve(en.target);
        }
      }, { root: observerRoot(root), threshold: 0.08 });
      page.querySelectorAll('.abt-rv').forEach((el) => io.observe(el));
      cleanup.push(() => io.disconnect());
    }

    /* --- the book -------------------------------------------------------- */
    const book = $('[data-book]');
    const cards = [...page.querySelectorAll('[data-skill]')];
    const live = $('[data-live]');
    const resetBtn = $('[data-reset]');
    const total = cards.length;
    const nameOf = (id) => cap.skills.find((s) => s.id === id).name;
    const slotFor = (id) => page.querySelector(`[data-slot="${id}"]`);
    const homeOf = (id) => page.querySelector(`[data-home="${id}"]`);
    const inBook = (el) => !!el.closest('[data-slot]');

    // Drag only where it can't fight scrolling: a fine pointer, on the wide layout.
    const canDrag = () => prefs.finePointer && !matchMedia('(max-width: 52rem)').matches;
    const syncDrag = () => { page.dataset.drag = canDrag() ? 'on' : 'off'; };
    syncDrag();
    cleanup.push(prefs.subscribe(syncDrag));
    on(window, 'resize', syncDrag, { passive: true });

    function report(id, placedNow) {
      const n = cards.filter(inBook).length;
      book.dataset.full = String(n === total);
      resetBtn.hidden = n === 0;
      page.querySelector(`[data-entry="${id}"]`).dataset.on = String(placedNow);
      live.textContent = placedNow
        ? `${nameOf(id)} placed in the book. ${n} of ${total}.`
        : `${nameOf(id)} taken out of the book. ${n} of ${total}.`;
    }

    const restRot = (el) => (el.classList.contains('is-placed') ? 0 : parseFloat(el.style.getPropertyValue('--r')) || 0);

    /* FLIP: note where the card is on screen, move it in the DOM, then play
       the difference back so it glides into place instead of jumping.
       `fromRot` is the tilt it had before: its carried lean, or its rest. */
    function moveTo(el, parent, from, fromRot) {
      const first = from || el.getBoundingClientRect();
      const rot = el._rot ?? fromRot ?? restRot(el);
      const lifted = el.classList.contains('is-held') ? 1.04 : 1;
      parent.appendChild(el);
      // freeze transitions while measuring, or the reading is mid-animation
      el.style.transition = 'none';
      el.style.transform = '';
      el.classList.remove('is-held', 'is-moving');
      el._rot = null;
      const last = el.getBoundingClientRect();
      if (prefs.reducedMotion) { el.style.transition = ''; return; }
      const dx = (first.left + first.width / 2) - (last.left + last.width / 2);
      const dy = (first.top + first.height / 2) - (last.top + last.height / 2);
      const sx = first.width / last.width || 1, sy = first.height / last.height || 1;
      el.classList.add('is-flying');
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${sx * lifted}, ${sy * lifted})`;
      el.getBoundingClientRect();          // commit the inverted frame
      el.style.transition = '';
      el.style.transform = '';
      const end = () => { el.classList.remove('is-flying'); el.removeEventListener('transitionend', end); };
      el.addEventListener('transitionend', end);
      setTimeout(end, 800);                 // no transition ran (nothing moved)
    }

    function place(el, from) {
      const r = restRot(el);
      el.classList.add('is-placed');
      el.setAttribute('aria-pressed', 'true');
      moveTo(el, slotFor(el.dataset.skill), from, r);
      report(el.dataset.skill, true);
    }
    function unplace(el, from) {
      const r = restRot(el);
      el.classList.remove('is-placed');
      el.setAttribute('aria-pressed', 'false');
      moveTo(el, homeOf(el.dataset.skill), from, r);
      report(el.dataset.skill, false);
    }
    const toggle = (el) => (inBook(el) ? unplace(el) : place(el));

    /* Dragging: carried with a transform, leaning a little into the
       direction of travel. Released over the book, it goes to its own entry;
       anywhere else, it glides back to where it was.
       With a mouse on the wide layout, a card moves as soon as it is dragged.
       With a finger (phones and tablets) it is picked up by pressing on it for
       a moment, then carried the same way: a swipe that starts moving at once
       is left to scroll the page, and a quick tap still places the card. */
    const HOLD = 170;                         // ms a finger rests before the pick-up
    function handle(el) {
      let g = null;
      let suppressClick = false;
      const over = (x, y) => {
        const br = book.getBoundingClientRect();
        return x > br.left && x < br.right && y > br.top && y < br.bottom;
      };

      const down = (ev) => {
        suppressClick = false;
        if (ev.pointerType === 'touch' && flowMQ.matches) {
          const t = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, far: false, vx: 0, lx: ev.clientX, touch: true };
          t.timer = setTimeout(() => {
            if (g !== t) return;
            t.armed = t.far = true;
            el.classList.add('is-held', 'is-moving');
            el.style.transform = 'scale(1.04)';
          }, HOLD);
          g = t;
          return;
        }
        if (!canDrag() || ev.button !== 0) return;
        g = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, far: false, vx: 0, lx: ev.clientX };
        el.setPointerCapture(ev.pointerId);
      };
      const move = (ev) => {
        if (!g || ev.pointerId !== g.id) return;
        const dx = ev.clientX - g.x, dy = ev.clientY - g.y;
        if (g.touch && !g.armed) {             // moving before the pick-up: a scroll
          if (Math.hypot(dx, dy) > 8) { clearTimeout(g.timer); g = null; }
          return;
        }
        if (!g.far) {
          if (Math.hypot(dx, dy) < 6) return;
          g.far = true;
          el.classList.add('is-held', 'is-moving');
        }
        g.vx = g.vx * .75 + (ev.clientX - g.lx) * .25; g.lx = ev.clientX;
        const tilt = prefs.reducedMotion ? 0 : Math.max(-5, Math.min(5, g.vx * .9));
        el._rot = tilt;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(1.04)`;
        book.dataset.over = String(over(ev.clientX, ev.clientY));
      };
      const up = (ev) => {
        if (!g || ev.pointerId !== g.id) return;
        const { far } = g;
        clearTimeout(g.timer);
        g = null;
        book.dataset.over = 'false';
        if (!far) return;                   // a click: the click handler toggles
        // the click that follows this release (if any) arrives in the same
        // task; clear the guard after it so a later Enter or Space still works
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
        const from = el.getBoundingClientRect();
        const target = over(ev.clientX, ev.clientY);
        if (target && !inBook(el)) return place(el, from);
        if (!target && inBook(el)) return unplace(el, from);
        moveTo(el, el.parentElement, from);   // back where it was
      };
      const cancel = (ev) => {
        if (!g || ev.pointerId !== g.id) return;
        clearTimeout(g.timer);
        if (g.touch && !g.armed) { g = null; return; }   // the page scrolled instead
        g = null; book.dataset.over = 'false';
        moveTo(el, el.parentElement, el.getBoundingClientRect());
      };
      const click = (ev) => {
        if (suppressClick) { suppressClick = false; ev.preventDefault(); return; }
        toggle(el);
      };

      on(el, 'pointerdown', down);
      on(el, 'pointermove', move);
      on(el, 'pointerup', up);
      on(el, 'pointercancel', cancel);
      on(el, 'click', click);
      on(el, 'dragstart', (ev) => ev.preventDefault());
      // Once a finger has picked the card up, the page holds still under it.
      on(el, 'touchmove', (ev) => { if (g?.armed) ev.preventDefault(); }, { passive: false });
      on(el, 'contextmenu', (ev) => { if (g?.touch) ev.preventDefault(); });
    }
    cards.forEach(handle);

    on(resetBtn, 'click', () => {
      cards.filter(inBook).forEach((el) => unplace(el));
      live.textContent = 'The book is clear again.';
      cards[0].focus();
    });

    requestAnimationFrame(() => { page.dataset.ready = 'true'; });
    return () => cleanup.forEach((fn) => fn());
  }

  return { id: 'about', html, mount };
}
