#!/usr/bin/env python3
"""
Builds the Worlds scene artwork from the reference render.

Same problem as the hero, different shape: `02-worlds-buildings.jpg` is a flat
mockup with four district cards and an "explore the map" cue painted into the
pixels. Those cards are the affordance for the four worlds, so they have to be
DOM — focusable, animatable, and reflowable. This script removes them and
exports a clean island plate that the site re-annotates.

Erase strategy: the cards sit on the light panel and on soft cloud, both of
which are smooth, low-frequency fields. So instead of cloning or medians we
solve Laplace's equation over each hole with the surrounding pixels as a fixed
boundary — a membrane fill. On smooth gradients it is effectively exact, and it
leaves none of the streaking a vertical interpolation would.

Run:  python3 tools/prep-worlds.py
"""
from PIL import Image, ImageFilter
import numpy as np
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

src = Image.open(os.path.join(REF, "02-worlds-buildings.jpg")).convert("RGB")


def inpaint(im, box, iters=600):
    """Fill `box` by diffusing the surrounding pixels inward (Laplace fill)."""
    x0, y0, x1, y1 = box
    m = 2                                    # boundary ring we read from
    reg = (x0 - m, y0 - m, x1 + m, y1 + m)
    a = np.asarray(im.crop(reg), dtype=np.float64).copy()
    h, w = a.shape[:2]

    mask = np.zeros((h, w), dtype=bool)
    mask[m:h - m, m:w - m] = True            # the hole

    # Seed the hole with a bilinear blend of the four boundary edges, so the
    # relaxation starts close to the answer and converges in far fewer passes.
    top, bot = a[m - 1, :, :], a[h - m, :, :]
    left, right = a[:, m - 1, :], a[:, w - m, :]
    ys = np.linspace(0, 1, h)[:, None, None]
    xs = np.linspace(0, 1, w)[None, :, None]
    seed = (top[None, :, :] * (1 - ys) + bot[None, :, :] * ys) * 0.5 \
         + (left[:, None, :] * (1 - xs) + right[:, None, :] * xs) * 0.5
    a[mask] = seed[mask]

    for _ in range(iters):                   # Jacobi relaxation
        nxt = (np.roll(a, 1, 0) + np.roll(a, -1, 0)
             + np.roll(a, 1, 1) + np.roll(a, -1, 1)) * 0.25
        a[mask] = nxt[mask]

    patch = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # A whisper of blur across the join hides the seam on JPEG-noisy edges.
    patch = patch.filter(ImageFilter.GaussianBlur(0.6))
    im.paste(patch, (reg[0], reg[1]))


work = src.copy()

# Baked cards, measured at 1:1 from the render. The pad has to clear the
# cards' soft drop shadows too, or the boundary ring the solver reads from is
# itself part of what we are erasing and the fill lands a shade too bright.
PAD = 15
BAKED = [
    (316,  61,  478, 131),   # "Healthcare"
    (849,  67, 1000, 135),   # "AI & Data"
    (316, 378,  465, 440),   # "Creative Archive"
    (849, 400, 1000, 463),   # "Product & Tech"
    (312, 496,  432, 526),   # "Explore the map" cue + icon
]
for x0, y0, x1, y1 in BAKED:
    inpaint(work, (x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD))

# ----------------------------------------------------------------- the plate
PLATE = (293, 28, 1021, 547)                 # the mockup's image panel
plate = work.crop(PLATE).convert("RGBA")
pw, ph = plate.size

# Feather every edge: the island floats, so it should dissolve on all sides.
def smooth(t): return t * t * (3 - 2 * t)
alpha = Image.new("L", (pw, ph), 255)
a = alpha.load()
F = 54
for x in range(pw):
    kx = smooth(min(1.0, min(x, pw - 1 - x) / F))
    for y in range(ph):
        ky = smooth(min(1.0, min(y, ph - 1 - y) / F))
        a[x, y] = int(255 * kx * ky)
plate.putalpha(alpha)

plate.save(os.path.join(OUT, "worlds-island.webp"), quality=90, method=6)   # WebP only, as elsewhere

# District centres, normalised to the plate. These are where the DOM cards
# anchor and where the camera aims when you choose a world.
DISTRICTS = {
    "healthcare": (580, 135),
    "ai":         (815, 205),
    "product":    (762, 337),
    "creative":   (505, 331),
}
meta = {
    "plate": {"w": pw, "h": ph, "aspect": round(pw / ph, 5), "srcCrop": PLATE},
    "districts": {
        k: [round((x - PLATE[0]) / pw, 4), round((y - PLATE[1]) / ph, 4)]
        for k, (x, y) in DISTRICTS.items()
    },
}
with open(os.path.join(OUT, "worlds.meta.json"), "w") as f:
    json.dump(meta, f, indent=2)

print(json.dumps(meta["districts"], indent=2))
for f in ("worlds-island.png", "worlds-island.webp", "worlds.meta.json"):
    print(f"  {os.path.getsize(os.path.join(OUT, f)) / 1024:8.1f} KB  {f}")
