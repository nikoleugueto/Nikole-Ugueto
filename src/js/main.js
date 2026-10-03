import { prefs } from './prefs.js';
import { mountCursorPortrait } from './cursor-portrait.js';
import { mountAnnotations } from './annotations.js';
import { createCamera } from './camera.js';
import { createStage } from './stage.js';
import { worldsView } from './views/worlds.js';
import { worldView } from './views/world.js';
import { caseStudyView } from './views/case-study.js';
import { lifeworxCaseView } from './views/case-lifeworx.js';
import { castilloCaseView } from './views/case-castillo.js';
import { ceramicCaseView } from './views/case-ceramic.js';
import { aboutView } from './views/about.js';
import { archiveView } from './views/archive.js';
import { contactView } from './views/contact.js';
import { notFoundView } from './views/not-found.js';
import { caseStudyById } from '../../content/case-studies.js';
import { worlds as worldsList } from '../../content/worlds.js';

const $ = (sel) => document.querySelector(sel);

const hero    = $('.hero');
const plate   = $('#plate');
const header  = $('.site-header');
const brain   = $('#brain');
const cue     = $('#enter-cue');
const cueLbl  = $('#enter-cue-label');
const stageEl = $('#stage');
const live    = $('#live');
const index   = $('#world-index');

/* --------------------------------------------------------------- routing
   The universe is one continuous stage, so levels are states rather than
   documents — that is what lets the camera travel between them. They still get
   real URLs, so a world can be linked, bookmarked and reached with Back.

     /                    the portrait
     /worlds              the island                     (camera: in)
     /worlds?from=<id>    the island, that world lit
     /worlds/<id>         one world                      (camera: in, deeper)
     /work/<id>           a case study                   (camera: in, deepest)
     /archive             the creative index              (no camera)
     /about  /contact     plain screens                  (no camera)
*/
const HOME = () => go('/');

/** Screens reached directly rather than through the camera. */
const FLAT = new Set(['/about', '/contact', '/archive']);

let route = location.pathname + location.search;
let dropping = false;   // the router is dropping the camera to open a flat page

/* While you are at home, the camera is already travelling somewhere — the
   worlds. Naming that destination is what makes scrolling arrive: without it
   the stage is asked to build the view for "/", which has no destination, so
   the zoom ran to completion and landed on nothing. That is why clicking felt
   compulsory. */
const HOME_DESTINATION = '/worlds';
const isHome = (path) => path.split('?')[0] === '/';
const stageRoute = () => (isHome(route) ? HOME_DESTINATION : route);

function go(path, { replace = false } = {}) {
  if (path === route) return;
  route = path;
  history[replace ? 'replaceState' : 'pushState']({ path }, '', path);
  apply(path);
}

/** Update the URL for a gesture that is already under way, without re-entering
 *  the router — the camera is mid-flight and must not be restarted. Scrolling
 *  replaces rather than pushes, so sweeping in and out a few times does not
 *  fill the back stack with a dozen entries. */
function syncUrl(path) {
  if (path === route) return;
  route = path;
  history.replaceState({ path }, '', path);
  document.title = titleFor(path.split('?')[0]);
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const on = new URL(a.href, location.origin).pathname === path.split('?')[0];
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/* ----------------------------------------------------------------- views */
const stage = createStage(stageEl, { behind: document.getElementById('main') });

const viewForWorlds = (from) => worldsView({
  arrivedFrom: from,
  onBack: () => go('/'),
  onChoose: (id) => go(`/worlds/${id}`),
});

const viewNotFound = (path) => notFoundView({
  path,
  onBack: HOME,
  onWorlds: () => go('/worlds'),
  onWorld: (id) => go(`/worlds/${id}`),
});

const viewForWorld = (id) => worldView({
  worldId: id,
  onBack: () => go('/'),
  onUp: () => go('/worlds'),
  onOpenCase: (caseId) => go(`/work/${caseId}`),
  onOpenArchive: () => go('/archive'),
});

const viewForCase = (id) => {
  const nav = {
    onBack: () => go('/'),
    onUp: () => go('/worlds'),
    onWorld: () => {
      const c = caseStudyById(id);
      go(c ? `/worlds/${c.world}` : '/worlds');
    },
  };
  // The two written case studies have their own views; the rest fall back to
  // the generic chapter structure.
  const bespoke = { lifeworx: lifeworxCaseView, castillo: castilloCaseView, 'saas-product': ceramicCaseView };
  return bespoke[id] ? bespoke[id](nav) : caseStudyView({ caseId: id, ...nav });
};

let viewKey = null, viewCached = null;

/** What the stage should be showing for a given path, or null for home.
 *  Memoised: onProgress asks for this on every frame of the arrival, and
 *  rebuilding the markup sixty times a second would be wasteful. */
function viewFor(path) {
  if (path !== viewKey) { viewKey = path; viewCached = buildView(path); }
  return viewCached;
}

function buildView(path) {
  const [pathname, query] = path.split('?');
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] === 'worlds') {
    if (seg[1]) return viewForWorld(seg[1]) || viewNotFound(pathname);
    return viewForWorlds(new URLSearchParams(query || '').get('from'));
  }
  if (seg[0] === 'work' && seg[1]) return viewForCase(seg[1]) || viewNotFound(pathname);
  if (pathname === '/about') return aboutView({ onBack: HOME, onContact: () => go('/contact') });
  if (pathname === '/contact') return contactView({ onBack: HOME });
  if (pathname === '/archive') return archiveView({ onBack: HOME, onUp: () => go('/worlds') });
  if (pathname !== '/') return viewNotFound(pathname);
  return null;
}

/* ---------------------------------------------------------------- camera */
const camera = createCamera({
  hero, plate, header, cue, cueLabel: cueLbl, live,
  onCommit: () => {
    // Arriving by scroll: the destination is where the camera was heading, and
    // the URL catches up to it now rather than the other way round.
    const dest = stageRoute();
    const view = viewFor(dest);
    if (view) stage.show(view);
    syncUrl(dest);
    live.textContent = announceFor(dest.split('?')[0]);
  },
  onRelease: () => {
    stage.hide();
    // Scrolled back out: the URL follows. Not when the router drops the
    // camera to open a page of its own (About, Contact, the archive, a 404):
    // the URL is already that page's.
    if (!dropping) syncUrl('/');
    live.textContent = 'Back at the portrait.';
    brain.focus({ preventScroll: true });
  },
  onProgress: (p) => {
    // While the camera moves, the stage is the fixed layer (see stage.js).
    if (p > 0.001 && p < 0.999) stage.unsettle();
    // Build the destination while the camera is still travelling, so the
    // arrival has something to fade in rather than appearing all at once.
    if (p > 0.38) stage.prepare(viewFor(stageRoute()));
    else stage.setMounted(false);
  },
});

/* ------------------------------------------------------------ navigation */
/** Short spoken name for a route, for the live region. */
function announceFor(pathname) {
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] === 'worlds' && seg[1]) {
    const w = worldsList.find((x) => x.id === seg[1]);
    return w ? `${w.name} world. Press Escape to go back to the map.` : 'World.';
  }
  if (seg[0] === 'worlds') return 'The worlds. Four bodies of work. Press Escape to go back.';
  if (seg[0] === 'work' && seg[1]) {
    const c = caseStudyById(seg[1]);
    return c ? `${c.title} case study. Press Escape to go back.` : 'Case study.';
  }
  if (pathname === '/about') return 'About.';
  if (pathname === '/contact') return 'Contact.';
  if (pathname === '/archive') return 'Creative archive.';
  if (pathname === '/') return 'Home. The portrait.';
  return 'Page not found.';
}

/** Document titles: bookmarkable, and read out on navigation. */
function titleFor(pathname) {
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] === 'worlds' && seg[1]) {
    const w = worldsList.find((x) => x.id === seg[1]);
    return w ? `${w.name} — Nikole Ugueto` : 'The worlds — Nikole Ugueto';
  }
  if (seg[0] === 'worlds') return 'The worlds — Nikole Ugueto';
  if (seg[0] === 'work' && seg[1]) {
    const c = caseStudyById(seg[1]);
    return c ? `${c.title} — Nikole Ugueto` : 'Work — Nikole Ugueto';
  }
  if (pathname === '/about') return 'About — Nikole Ugueto';
  if (pathname === '/contact') return 'Contact — Nikole Ugueto';
  if (pathname === '/archive') return 'Creative archive — Nikole Ugueto';
  return 'Nikole Ugueto — UX/UI & Product Design';
}

/* The portrait is large on the two screens where it is part of the artwork,
   and small everywhere else. */
const FEATURE_CURSOR = new Set(['/', '/worlds']);

function apply(path) {
  const pathname = path.split('?')[0];
  document.title = titleFor(pathname);
  document.body.dataset.cursorScope =
    FEATURE_CURSOR.has(pathname) ? 'feature' : 'quiet';

  document.querySelectorAll('.site-nav a').forEach((a) => {
    const on = new URL(a.href, location.origin).pathname === pathname;
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  const view = viewFor(path);

  /* A dead link should not make you sit through a cinematic push-in before it
     admits nothing is there — so this is checked before the camera routes. */
  if (FLAT.has(pathname) || view?.id.startsWith('404:')) {
    if (camera.progress > 0) {                         // drop out of the journey
      dropping = true; camera.set(0); dropping = false;
    }
    stage.showStandalone(view);
    live.textContent = announceFor(pathname);
    return;
  }

  if (pathname.startsWith('/worlds') || pathname.startsWith('/work')) {
    if (camera.committed) {                            // already inside: swap level
      stage.show(view);
      live.textContent = announceFor(pathname);
    } else {
      stage.unsettle();                                // the portrait back in place first
      camera.enter();                                  // onCommit announces on arrival
    }
    return;
  }

  // home
  stage.unsettle();
  if (camera.progress > 0) camera.exit();              // onRelease clears the stage
  else stage.hide();
}

/* Escape goes *up* one level rather than straight home, so the hierarchy is
   reversible the same way it was entered. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const [pathname] = route.split('?');
  const seg = pathname.split('/').filter(Boolean);
  if (seg[0] === 'work' && seg[1]) {
    e.preventDefault();
    const c = caseStudyById(seg[1]);
    go(c ? `/worlds/${c.world}` : '/worlds');
  } else if (seg[0] === 'worlds' && seg[1]) { e.preventDefault(); go('/worlds'); }
  else if (pathname !== '/') { e.preventDefault(); go('/'); }
});

addEventListener('popstate', () => {
  route = location.pathname + location.search;
  apply(route);
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/"]');
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  go(new URL(a.href).pathname);
});

/* -------------------------------------------------------- the experience */
mountAnnotations(plate, index, {
  onChoose: (worldId) => {
    hero.dataset.brainActive = 'false';
    go(`/worlds?from=${worldId}`);
  },
});

/* No lone last words below the desktop width.
   The last two words of each heading and paragraph are joined by a no-break
   space, so a line never ends with a single word on its own (the copy is
   unchanged: only the space is). CSS text-wrap does most of this, but not
   reliably across browsers. If a joined pair would not fit its box it is
   left alone, and everything is restored when the window reaches the
   desktop layout, so the desktop never sees a changed character. */
const tieMQ = matchMedia('(max-width: 1179px)');
const tied = new Map();                        // text node -> original text
const TIE_SEL = 'h1, h2, h3, h4, p, li, blockquote, dd, figcaption';
function tieWords(scope) {
  if (!tieMQ.matches || !scope) return;
  for (const node of tied.keys()) if (!node.isConnected) tied.delete(node);   // views that left
  const done = [];
  for (const el of scope.querySelectorAll(TIE_SEL)) {
    if (el.closest('.cps-app, .chg-app, .chg-desk')) continue;   // live product UI stays as built
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null;
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.textContent.trim()) last = n;
    if (!last || tied.has(last)) continue;
    const text = last.textContent;
    const body = text.replace(/\s+$/, '');
    const cut = body.search(/\s\S+$/);
    if (cut <= 0 || !body.slice(0, cut).trim()) continue;
    tied.set(last, text);
    last.textContent = body.slice(0, cut) + ' ' + body.slice(cut + 1) + text.slice(body.length);
    done.push([el, last]);
  }
  // A pair too long for its box would overflow: untie those (one layout read).
  for (const [el, node] of done) {
    if (el.scrollWidth > el.clientWidth + 1) { node.textContent = tied.get(node); tied.delete(node); }
  }
}
function untieAll() {
  for (const [node, text] of tied) node.textContent = text;
  tied.clear();
}
const tieSoon = () => requestAnimationFrame(() => { tieWords(stageEl); tieWords(hero); });
new MutationObserver(tieSoon).observe(stageEl, { childList: true });
tieMQ.addEventListener('change', () => (tieMQ.matches ? tieSoon() : untieAll()));
tieSoon();

brain.addEventListener('click', () => go('/worlds'));
cue.addEventListener('click', () => go(camera.committed ? '/' : '/worlds'));

/* The brain is a large soft target: telegraph it from anywhere over the head,
   not only on the pixels of the button itself. */
brain.addEventListener('pointerenter', () => { hero.dataset.brainActive = 'true'; });
brain.addEventListener('pointerleave', () => { hero.dataset.brainActive = 'false'; });
brain.dataset.cursor = 'Enter my mind';
brain.dataset.cursorScale = '1.5';

mountCursorPortrait($('#cursor'), $('#cursor-caption'));

/* Entrance: hold the reveal until the artwork is actually painted, so the
   staggered copy and the image arrive together instead of racing. */
const art = plate.querySelector('.plate__img');
const ready = () => {
  document.body.classList.add('is-ready');
  camera.remeasure();
};
if (art.complete) ready();
else art.addEventListener('load', ready, { once: true });
addEventListener('load', ready, { once: true });

prefs.subscribe(() => camera.remeasure());
apply(route);

/* Tuning hook: /?p=0.55 freezes the camera mid-journey so a single frame of
   the transition can be looked at properly. Inert without the parameter. */
const frozen = new URLSearchParams(location.search).get('p');
if (frozen !== null) {
  const value = Math.max(0, Math.min(1, parseFloat(frozen) || 0));
  const park = () => camera.set(value);
  if (art.complete) park(); else art.addEventListener('load', park, { once: true });
}
