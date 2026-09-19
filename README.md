# Nikole Ugueto — portfolio

An interactive portfolio built as a single continuous space: you start at a
portrait, travel into the city inside it, and keep going until you reach a case
study. The interaction design is the argument — the site is meant to be
evidence of the work, not a description of it.

**Status: phases 1–8 complete.** The full journey works end to end — portrait → the
worlds → one world → a case study — and back up again, with About, Creative
Archive and Contact built alongside it.

What is finished is the *experience*. What is deliberately unwritten is the
*content*: the case studies, the About story, and the archive tiles. None of it
is invented — each gap renders as a marked placeholder carrying the brief for
what belongs there. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the reasoning.

## Checks

```bash
npm run check        # or: node tools/check.js && node tools/contrast.js
```

`check.js` resolves every asset reference, catches relative URLs that would
break on nested routes, finds unlinked stylesheets, spots generated images that
nothing points at, and imports every content module. `contrast.js` fails if any text colour drops below WCAG AA on any
surface. Both exit non-zero, so they can gate a deploy.

## Verified

Layout checked at 375, 500, 768, 1024, 1180, 1280, 1500, 1600 and 1920. The
interaction suite covers every route, the full journey by clicking, Escape
climbing back out, keyboard occlusion, accessible names, heading order,
reduced motion and load metrics.

## What is left to fill in

| Where | What |
|---|---|
| `content/case-studies.js` | LifeWorx content; the AI and SaaS projects once defined |
| `content/pages.js` | About story, philosophy, experience, tools |
| `content/pages.js` → `archive.pieces` | Archive tiles (drop images in `assets/img/archive/`) |
| `content/pages.js` → `contact.channels` | LinkedIn URL, CV PDF |
| `assets/reference/` | Higher-resolution hero and island artwork |

### Writing the case studies

Open `content/case-studies.js`. Every section carries a `prompt` describing what
belongs in it, and that prompt renders on the page inside a marked placeholder —
so the site itself is the brief. To publish a section, set its `body` and remove
`placeholder: true`. It then renders as ordinary prose with no special
treatment. Nothing else needs changing.

---

## Run it

No build step and no dependencies. Node is installed (v24.21.0 LTS, user-local
at `~/.local/node`) but nothing in the current site needs it.

```bash
python3 tools/serve.py          # → http://localhost:5173
```

The dev server falls back to `index.html` for app routes, the way Vercel and
Netlify do in production.

**Tuning hook:** `/?p=0.5` freezes the camera at that point on the journey, so a
single frame of the transition can be looked at properly. `0` is the portrait,
`1` is the arrival. Inert without the parameter.

## Deploy

Push the folder as-is. `vercel.json` and `_redirects` already carry the
single-page rewrite and asset caching rules for Vercel and Netlify
respectively.

## Rebuild the artwork

```bash
pip3 install --user Pillow numpy
python3 tools/prep-art.py           # hero, island, 4 world scenes, about portrait
python3 tools/prep-world-sky.py     # the atmospheric sky behind the worlds
python3 tools/prep-contact-sky.py   # the contact skyline, from the photograph
python3 tools/prep-world-scenes.py  # journey portraits
python3 tools/prep-pages.py         # process discs
python3 tools/prep-assets.py        # cursor portrait + share card (run last)
```

They read `assets/reference/` and write `assets/img/`. `prep-art.py` is
manifest-driven: to swap in better artwork, drop the file in
`assets/reference/originals/` and change one `src` line. It never upscales past
the source, and it exports several widths for srcset.

The two sky scripts repair the photographs they are built from — removing the
copy the mockups painted over them — rather than recreating them.

---

## Layout

```
index.html               the home document; the artwork is server-rendered HTML
content/worlds.js        single source of truth for the four worlds
content/case-studies.js  case-study structure + the brief for each section
content/pages.js         About, Creative Archive and Contact
src/js/
  camera.js              the push-in: one scalar drives every layer
  cursor-portrait.js     the portrait that trails the pointer
  annotations.js         the four hotspots, rebuilt as DOM
  stage.js               the destination layer; holds one view at a time
  prefs.js               reduced motion / pointer / layout, observed live
  main.js                wiring and routing
  views/
    worlds.js            the island and its four districts
    world.js             one world, in its own sky
    case-study.js        fourteen sections; placeholders carry their own brief
    about.js  archive.js  contact.js
src/styles/
  tokens.css             colour, type, spacing, one easing vocabulary
  base.css  hero.css  cursor.css  views.css
  worlds.css  world.css  case-study.css  pages.css
assets/img/              production assets  (built)
assets/reference/        the source mockups  (inputs, never shipped to users)
tools/                   asset pipeline, dev server, preflight checks
```

## Things worth knowing before changing it

- **The camera is one number.** `camera.js` maps `p` (0 → 1) onto every layer.
  Add a layer by reading `p`, not by writing a new animation.
- **Motion tokens are the reduced-motion switch.** `prefers-reduced-motion`
  collapses the duration tokens in `tokens.css`; don't hard-code durations.
- **Worlds live in one file.** A fifth world is one object in
  `content/worlds.js` with two coordinates — one on the hero plate, one on the
  island — and nothing else changes.
- **Every URL is root-absolute.** Routes nest (`/worlds/healthcare`), so a
  relative `src="assets/…"` resolves against the wrong directory and 404s.
- **Anything that starts hidden must be gated on `.js`.** An inline script in
  `<head>` sets that class before first paint. Hide things with `.js .thing`,
  never `.thing` — otherwise the content is invisible when scripting is off.
- **A view is `{ id, html, mount(el) -> cleanup }`.** The stage owns mounting
  and opacity; views own their own content and listeners.
- **No invented content.** The reference mockups contain placeholder metrics.
  They are not in this build. See ARCHITECTURE.md §7.
