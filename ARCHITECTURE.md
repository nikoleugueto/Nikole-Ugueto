# Portfolio — architecture & interaction map

Working notes for the build. Phases 1–3 of the plan are done; this records the
analysis behind them and the decisions the later phases inherit.

---

## 1. What the reference images actually contain

| File | What it is | How it is used |
|---|---|---|
| `01-home-original-reference.PNG` | Home hero. **Nikole in profile**, hair rendered as a city, four annotated hotspots, headline left. | **Primary source.** Cropped and cleaned into the production hero plate; she is the subject of the Home composition. |
| `02-worlds-buildings.jpg` | "Different spaces. One vision." — island city seen from above, four districts. | Reference for the Worlds scene (phase 4). Shown as a labelled reference inside the placeholder. |
| `03-individual-worlds.PNG` | "Every person is a world." — four floating islands + a 5-step journey strip. | Reference for the individual-world level (phase 5). |
| `04`, `05` | LifeWorx and "AI for Better Care" case-study heroes. | Layout reference for case studies (phase 5–6). **Their numbers are mockup filler — see §7.** |
| `06`, `07`, `08` | Process, About, Contact. | Reference for phase 7. |
| `00-full-site-mockup-board.png` | The whole board in one image. | Overall system reference. |
| `portrait-source.png` | 1254×1254 cut-out portrait of Nikole, alpha channel intact. | **The cursor portrait, and nothing else.** Kept separate from the hero by instruction — it is not composited into the artwork. |

### Composition breakdown of the home reference (1860 × 845)

Measured, not estimated — see `tools/prep-assets.py`.

| Layer | Extent | Treatment |
|---|---|---|
| Backdrop | full frame | Diagonal gradient, warm `#DFDAD8` top-left → cool `#A2A6AC` bottom-right. **Rebuilt in CSS**, not shipped as pixels. |
| Portrait + city | x 864–1540, y 60–845 | Shipped as one bitmap, the *hero plate*. Not separable: the hair dissolves into the backdrop in wisps that no automatic cut-out survives. |
| Annotations | 4 labels, 4 leader lines, 4 dots | **Erased from the bitmap and rebuilt as DOM.** |
| Headline block | x 90–600 | HTML. |
| Nav + scroll cue | — | HTML. |

### Why the annotations had to come out of the image

They are the affordance for the four worlds. Baked into pixels they cannot be
focused, tabbed to, animated, reflowed, translated or deep-linked. So
`tools/prep-assets.py` removes them:

- Label text and the mockup's own nav sit on the smooth backdrop → replaced by
  interpolating the rows above and below. Numerically exact.
- Leader lines cross hair and city → replaced by a masked **median filter**.
  A 9px median is wider than a 1px stroke, so the stroke vanishes and the
  buildings underneath survive. Clone-stamping was tried first and duplicated
  skyline; that version is not what shipped.
- The four dots are solid discs, too wide for a 9px median → a 21px median,
  circularly masked.

The plate is then cropped to x 800–1560 and given a feathered alpha on its
left, right and top edges so it dissolves into the CSS backdrop. The bottom
stays hard: the turtleneck runs off the frame, as in the reference.

Hotspot coordinates are exported to `assets/img/hero.meta.json`, normalised to
the plate, and live in `content/worlds.js`. The rebuilt dots land exactly where
the painted ones were.

### The island (reference 02) had the same problem

Four district cards and an "explore the map" cue, painted in.
`tools/prep-worlds.py` removes them with a different technique, because the
surroundings are different: the cards sit on the light panel and on soft cloud,
both smooth, low-frequency fields. So each hole is filled by solving Laplace's
equation across it with the surrounding pixels as a fixed boundary — a membrane
fill. On smooth gradients that is effectively exact and leaves none of the
streaking a vertical interpolation would.

One detail worth keeping: the pad around each card has to clear its *drop
shadow* as well as the card. At a 7px pad the boundary ring the solver reads
from was itself part of what we were erasing, and every fill landed a shade too
bright, leaving a visible seam. 15px fixed it.

---

## 2. Content architecture

```
/                     Home — the portrait, the four annotated worlds
/worlds               The worlds scene              — built
/worlds/:world        One world, on its own         — built
/work/:case           A case study                  — structure built
/archive              Creative archive              — built (tiles to fill)
/about  /contact                                    — built (story to write)
```

`content/worlds.js` is the single source of truth. The hero annotations, the
stacked-layout index, and later the Worlds scene and the case studies all read
from it. Adding a fifth world means adding one object with a hotspot
coordinate — nothing else changes.

Levels are **states of one continuous stage**, not separate documents: that is
what lets the camera travel between them. They still get real URLs via the
History API, so a world can be linked, bookmarked and reached with Back.

---

## 3. Interaction map — Home

```
             ┌──────────────── p = 0 ─────────────────┐
             │  portrait legible, four labels drawn   │
             └────────────────────────────────────────┘
   wheel ↓ / click brain / click a label / Enter on the CTA
             ┌────────── 0 < p < 1 (reversible) ──────┐
             │  copy leaves   →  camera pushes in     │
             │  labels fade   →  veil closes          │
             │  sharp plate cross-fades to blurred    │
             │  progress ring reads p                 │
             └────────────────────────────────────────┘
   wheel ↑ / Esc                                  p → 1
             ┌──────────────── p = 1 ─────────────────┐
             │  Worlds                                │
             └────────────────────────────────────────┘
```

One scalar drives every layer. That is the whole design:

- **Continuous and reversible.** You can stop halfway and back out. A page
  transition cannot do this, which is why the progress ring is a real readout
  rather than an ornament.
- **Two inputs, one gesture.** Scrolling and clicking the brain run the same
  journey, so "Scroll to explore" is literal rather than decorative.
- **Never hover-only.** The brain is a `<button>`, each label is a `<button>`,
  and the corner cue is a third, always-visible text CTA that does the same
  thing. Keyboard: `Enter`/`Space` to go in, `Esc` to come back.
- **Scroll capture is bounded.** The wheel is only intercepted while the
  journey is in play — at rest scrolling up, or fully in scrolling down, the
  page keeps its own scroll. It is never trapped.

### The Worlds scene

One island, four districts, following reference 02.

**All four cards are visible at rest.** The reference shows them that way, and
it is also the better call: nothing important sits behind a hover, so the scene
is completely readable on first sight and on a touch screen. Interest — pointer,
keyboard focus, or a tap — promotes one world and recedes the other three.
Hovering the map lights the list; focusing the list lights the map. One state,
reached from either side.

**Accessibility model.** The left-hand list is the canonical set of controls:
always visible, in tab order, carrying the accessible names. The map districts
are a redundant pointer affordance for the same four actions, so they are
`aria-hidden` rather than announced a second time.

**State.** JS stamps every element carrying a world with `data-state` —
`rest`, `on` or `off` — and the stylesheet reacts to that. The alternative was
sixteen attribute selectors kept in sync by hand.

**Depth.** The island leans toward the pointer, at most 2.6°, easing back to
level when the pointer leaves. It also floats on an 11-second cycle with a
10px amplitude. Both are small on purpose: the island should read as an object
with a near side and a far side, not as something wobbling. Both are off under
`prefers-reduced-motion`.

**Departure.** Choosing a world scales the island toward *that district* —
`transform-origin` is set from its coordinates — before the level swaps, so
the camera keeps travelling in the direction you pointed.

### Cursor portrait

Real photograph, trailing the pointer with interpolated position, velocity-based
tilt, and a scale change per target type — small over ordinary links, large over
the brain, captioned with what a click will do. So it reports state instead of
decorating. `pointer-events: none` always; not in the accessibility tree.

Fine pointer only. Under `prefers-reduced-motion`, or on touch, it is replaced
by the same portrait as a static corner badge — the brand element survives, the
motion does not.

### An individual world

One island, one person at work, in its own sky. `tools/prep-world-scenes.py`
cuts the four islands out of reference 03 as separate plates, each keeping its
own slice of sky — which is why the four worlds differ in light without
anything being invented. Healthcare sits in cool blue, Creative Archive in low
rose sun. That is the "own visual identity" the brief asks for, taken from the
artwork rather than imposed on it.

The other worlds are never present at this level. The only ways on are down
into the case study or back up to the map, and the island leans toward the
pointer with the same gesture as the map, so the two levels read as the same
physical space.

The level has three shapes, not one: a real case study (Healthcare), an
undefined project (AI, Product), and no case study at all — the Creative
Archive is meant to stay a lightweight index, so it says so instead of offering
a dead button.

### A case study

Fourteen sections, in the order the brief asked for, from Context through to
What I learned.

**The structure is finished; the content is not written, and it is not
invented.** Every unwritten section renders as a visibly marked placeholder
carrying the brief for what belongs in it — dashed, chipped, and deliberately
unlike the finished styling, so nothing here can be mistaken for real work. The
page therefore doubles as a writing brief. Fill `body` in
`content/case-studies.js` and drop `placeholder: true`, and a section renders as
ordinary finished prose with no special treatment.

The outcomes section is the loudest placeholder on the page, and says on the
page that the mockups' numbers were layout filler and are not used. A visible
"not written yet" is better than either repeating invented metrics or leaving a
silent gap that reads as an oversight.

Section tracking in the sticky index uses an IntersectionObserver rooted on the
stage, not a scroll handler, so there is no per-frame work while reading.

---

## 4. Responsive: two compositions, not one that shrinks

| | Trigger | Composition |
|---|---|---|
| **Cinematic** | `≥1180px` **and** aspect `≥3/2` | The reference layout. Plate full-height on the right, copy left, annotations on the artwork, scroll-driven push-in. |
| **Stacked** | everything else | Portrait bleeds off the right as a masked header image; copy below; the four worlds become a readable, tappable index with hairline rules. Leader lines are hidden — they need hover and room, and have neither. Entering runs the same camera on a timed curve. |

The aspect-ratio condition matters: a 1440×1024 window is wide enough by pixel
count but too square for the reference composition, and would put the headline
on top of the face.

Just above the threshold — roughly 1180–1400px — the plate is at its widest
*relative to the copy*, and the headline starts running into its feathered
edge. Shortening the plate to 88svh there narrows it proportionally and gives
the words their room back. Verified at 375, 500, 768, 1024, 1180, 1280, 1500,
1600 and 1920.

---

## 5. Technology

**Framework-free ES modules, no build step.** This began as a constraint — the
machine had no Node — but Node 24 LTS is now installed user-local at
`~/.local/node` (no admin rights, checksum-verified, npm registry reachable), so
it is a choice from here on. It remains the right one for the Home experience —

- The hero is photographic. Three-dimensional geometry would add nothing that a
  transform, a mask and a cross-fade do not already deliver.
- Total home payload is ~140 KB including the artwork, with no framework runtime
  to parse before the first frame.
- It deploys to Vercel/Netlify/Pages as static files.

Motion is Web Animations–free too: **CSS transitions for state, one `rAF` loop
per continuous interaction** (camera, cursor), both writing only `transform` and
`opacity`. No animation library is loaded.

**Where the stated preferences apply.** React + Vite + R3F is the right stack
for the Worlds scene *if* it becomes genuinely three-dimensional — orbiting
islands with real depth and lighting (reference 03). Node is installed, so that
is now purely a design decision rather than a tooling one, and it belongs to
phase 4b. Adding React to the *Home* would cost ~45 KB and buy nothing; the
camera is 180 lines of transform maths that React would not improve. GSAP
likewise: worth it when the case studies need scroll-timeline scrubbing.

If the Worlds scene does go 3D, the sensible shape is a separate Vite + R3F
bundle loaded only on that route, leaving the Home's 155 KB critical path
untouched — not a rewrite of what already works.

### Performance decisions already made

- The push-in blur is a **cross-fade to a pre-blurred 380px bitmap** (3 KB), not
  `filter: blur()` on an 800px plate at 3.3× scale. Constant cost instead of a
  per-frame one.
- Both `rAF` loops **park themselves** when their values settle. Idle cost zero.
- Layout geometry is measured once and cached, re-measured only on resize and
  when the camera returns to rest. No `getComputedStyle` in a frame loop.
- Hero plate preloaded with `fetchpriority="high"`; everything else lazy.
- The grain overlay is a 140px inline SVG turbulence tile, present only because
  a large flat gradient bands on 8-bit panels.

### Polish pass (phase 8)

- `content-visibility: auto` on the fourteen case-study sections, with an
  intrinsic size so the scrollbar stays honest.
- The focus ring carries its own light halo, so it holds on a pale document and
  on the contact skyline alike rather than relying on the backdrop.
- Departure transitions are hand-timed in milliseconds, which the duration
  tokens do not reach — so `prefers-reduced-motion` blocks cut them explicitly
  in `worlds.css` and `world.css`.
- `node tools/check.js` resolves every asset reference (expanding templated
  paths from the content model), flags relative URLs in the markup, catches
  unlinked stylesheets, spots orphaned generated images, and imports every
  content module.
- `node tools/e2e.js` drives a real Chrome over the DevTools Protocol and tests
  what a screenshot cannot: that the journey actually navigates, that Escape
  climbs back out, that the off-screen layer is `inert`, that every control has
  an accessible name, that heading levels never skip, and that the
  reduced-motion path still arrives. It found two genuine bugs on its first
  run — see below.
- WebP only, no PNG fallbacks: every browser released since 2020 supports it,
  and an 865 KB fallback nothing fetches is just weight. Production images went
  from 1937 KB to 492 KB. The one place WebP still fails is social scrapers, so
  the share card is a 1200x630 JPEG.

### Measured

On the dev server, headless, home route: first paint 76ms, largest contentful
paint 76ms, CLS 0, 33 requests, ~294 KB over the wire (including webfonts and
the prefetched island). Largest paint equals first paint because the hero plate
is preloaded at high priority and the layout reserves its box, so nothing
reflows after it lands — which is also why CLS is a flat zero. The
thresholds in `e2e.js` are deliberately loose — it runs on whatever machine is
to hand, so it is a regression tripwire rather than a benchmark.

### Without scripting

The router and every destination are scripted, so this was never going to be a
fully working site with JavaScript off — but it should not be a *blank* one.
It was: the entrance animation started every piece of copy at `opacity: 0` and
waited for a class that JS adds, so the headline and lede never appeared at all.

The hidden state is now gated on a `.js` class set by an inline script in
`<head>`, before first paint. Hiding is opt-in, so with scripting off the page
simply renders. A `<noscript>` block explains that the navigation needs
scripting and gives the email address, which is the one thing that still works.
The e2e suite disables script execution and asserts the headline is visible.

### Bugs the tests found

- **An unknown route rendered nothing.** `/worlds/bogus` built a `null` view,
  which threw on `view.id` and left a blank screen with a console error — the
  worst failure mode for a portfolio, and exactly the case (a stale link) where
  a visitor most needs orientation. There is now a 404 view offering the four
  worlds, and the stage refuses to render nothing.
- **The 404 was routed through the camera.** Because the `/worlds` prefix was
  matched before the not-found check, a dead link made you sit through a 1.2s
  cinematic push-in before admitting nothing was there. Flat screens are now
  checked first.

### Known performance risks for later phases

- The hero plate is **760px wide natively** — it upscales on screens wider than
  ~1900px. See §7.
- The Worlds scene will be the first real budget question. If it goes 3D, it
  needs its own decision on draw calls and texture size, and a static fallback.
- Case studies will carry the most imagery; they need `content-visibility` and
  per-section lazy loading from the start.

---

## 6. Accessibility

Audited rather than assumed. `node tools/contrast.js` reads the tokens straight
out of `tokens.css` and fails the build if any text ink drops below WCAG AA on
any surface it can land on.

That audit found two real failures on the first run: `--ink-muted` and
`--ink-faint` failed AA on every light surface — 3.39:1 and 2.05:1 against the
warm paper. Darkening both to pass collapsed them into the same colour, so the
scale was restructured instead: `--ink-muted` became AA-compliant everywhere
(4.51:1 at worst) and carries all small text, while a new `--ink-quiet` holds
the 3:1 value and is documented as decorative-only — aria-hidden separators,
hairlines, tick marks. It must never carry content.

**Occlusion.** The home stage stays in the DOM under the destination layer, so
without intervention a keyboard user tabs into controls they cannot see. The
stage sets `inert` on whichever layer is not on screen, which removes it from
the tab order and the accessibility tree together.

**Titles.** Every route sets `document.title`, so the level is bookmarkable and
is announced on navigation.

### Original list

- Every interaction has a non-hover, keyboard-reachable equivalent.
- `prefers-reduced-motion` skips the camera entirely and cuts every transition
  to 1ms via the duration tokens — one place, not scattered.
- Live region announces entering and leaving; focus moves into the destination
  and returns to the brain on exit.
- Focus ring is the single saturated colour in the system, so it is never
  mistaken for decoration.
- 44px touch targets around 9px dots.
- The artwork carries a real `alt` description; decorative layers are hidden.

---

## 7. What is still needed — and what must not be invented

### Assets

1. **The hero artwork at a higher resolution.** The only real constraint left
   on the Home composition. The current plate is extracted from an 1860px-wide
   mockup, so it is 760px across and softens above roughly 1900px viewports.
   The same artwork re-exported at ≥2400px — ideally without the labels and nav
   baked in — drops straight into `tools/prep-assets.py`. Nothing else about
   the hero needs to change.
2. ~~**The face.**~~ *Resolved — this was my error.* I initially read the hero
   artwork as a stock model. It is Nikole. The Home composition uses it as the
   subject, unmodified apart from the annotation removal, and the cursor
   portrait stays a separate asset used only for the pointer interaction. No
   new photograph is needed and the two are never composited.
3. **The island artwork at a higher resolution.** Same story as the hero: the
   plate is 728px across, extracted from a 1290px-wide mockup, so it softens on
   large screens. `tools/prep-worlds.py` takes a drop-in replacement.
4. CV/resume PDF, LinkedIn URL, and the Creative Archive pieces (the LifeWorx
   marketing work) for phase 7.

### Content — the line that does not get crossed

The reference mockups contain numbers: *−40% support tickets*, *+60% user
activation*, *8.5/10 satisfaction*, *35% faster detection*, *+28% accuracy*,
*50% faster task completion*, *4.8/5*. These are mockup filler generated to
fill a layout. **None of them are in this build and none will be** unless they
come with a source.

Case studies will ship with explicitly labelled placeholders — visibly marked as
unfilled rather than quietly plausible — for: context, problem, research,
IA, flows, wireframes, visual design, outcomes, role, tools, lessons. Case
studies 02 and 03 are undefined projects; the architecture holds a slot, not an
invented product.

---

## 8. Build phases

- [x] **1** Analyse references, extract and clean assets
- [x] **2** Information architecture + interaction map
- [x] **3** Home → brain interaction
- [x] **4a** Home → Worlds transition *(the camera)*
- [x] **4b** The Worlds scene
- [x] **5** Healthcare world → LifeWorx case study, end to end *(structure; content to be written)*
- [x] **6** The remaining worlds
- [x] **7** About, Creative Archive, Contact
- [x] **8** Polish: motion, performance, a11y, responsive, visual consistency
