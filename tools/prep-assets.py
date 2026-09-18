#!/usr/bin/env python3
"""
Builds the production hero assets from the reference render.

Why this exists
---------------
`01-home-original-reference.PNG` is a flat mockup: the four annotation labels,
their leader lines and the hotspot dots are baked into the pixels, along with
the mockup's own nav. Those annotations are the primary affordance for the four
worlds, so on the real site they must be DOM — focusable, animatable, responsive
and translatable. This script removes them from the artwork and exports a clean
"hero plate" that the site re-annotates live.

Erase strategy: every baked element is replaced by a patch cloned from a nearby
offset. Over the backdrop that is exact (the gradient shifts <1 level per 30px);
over hair and city it reproduces plausible texture. Band coordinates below were
measured by detecting long bright runs against a 9px median (tools/detect.py).

Run:  python3 tools/prep-assets.py
"""
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import numpy as np
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

src = Image.open(os.path.join(REF, "01-home-original-reference.PNG")).convert("RGB")

def fill_vertical(im, box, blur=2.0):
    """Erase a box that sits on the flat backdrop by interpolating the rows just
    above and below it. The backdrop is a smooth diagonal gradient, so this is
    numerically exact; a light blur hides the seam."""
    x0, y0, x1, y1 = box
    px = im.load(); h = y1 - y0
    for x in range(x0, x1):
        top = px[x, max(0, y0 - 1)]; bot = px[x, min(im.height - 1, y1)]
        for i, y in enumerate(range(y0, y1)):
            t = (i + 1) / (h + 1)
            px[x, y] = tuple(int(top[c] + (bot[c] - top[c]) * t) for c in range(3))
    pad = 7
    b = (x0 - pad, y0 - pad, x1 + pad, y1 + pad)
    patch = im.crop(b).filter(ImageFilter.GaussianBlur(blur))
    m = Image.new("L", (b[2] - b[0], b[3] - b[1]), 0)
    ImageDraw.Draw(m).rectangle((pad - 2, pad - 2, b[2] - b[0] - pad + 2, b[3] - b[1] - pad + 2), fill=255)
    im.paste(patch, (b[0], b[1]), m.filter(ImageFilter.GaussianBlur(3)))


def remove_thin_lines(im, regions, thresh=8, grow=2):
    """Erase hairline strokes that cross detailed artwork.

    A median filter wider than the stroke removes the stroke while leaving
    buildings, hair and foliage intact, so we only have to decide *which*
    pixels are stroke: those measurably brighter than their own median."""
    med = im.filter(ImageFilter.MedianFilter(9))
    lum = lambda c: 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    p, m = im.load(), med.load()
    mask = Image.new("L", im.size, 0); mk = mask.load()
    for (x0, y0, x1, y1) in regions:
        for y in range(y0, y1):
            for x in range(x0, x1):
                if lum(p[x, y]) - lum(m[x, y]) > thresh:
                    mk[x, y] = 255
    mask = mask.filter(ImageFilter.MaxFilter(2 * grow + 1)).filter(ImageFilter.GaussianBlur(1.6))
    im.paste(med, (0, 0), mask)


def remove_dot(im, cx, cy, r=13):
    """Hotspot dots are solid discs, too wide for a 9px median."""
    med = im.filter(ImageFilter.MedianFilter(21))
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    im.paste(med, (0, 0), m.filter(ImageFilter.GaussianBlur(3)))


work = src.copy()

# 1. Leader lines (incl. the short diagonal elbows) crossing hair and city.
remove_thin_lines(work, [
    ( 852, 140, 1160, 196),   # healthcare
    (1300, 180, 1562, 232),   # ai & data
    (1300, 320, 1562, 430),   # product & tech  (+ diagonal elbow)
    (1180, 470, 1562, 650),   # creative archive (+ its long diagonal elbow)
])

# 2. The four hotspot discs.
for cx, cy in [(1090, 161), (1357, 202), (1399, 356), (1410, 582)]:
    remove_dot(work, cx, cy)

# 3. Blocks sitting on the flat backdrop: exact vertical reconstruction.
for box in [
    (1372,  14, 1562,  52),   # mockup nav: PROJECTS / ABOUT
    ( 854, 106,  980, 154),   # label "HEALTHCARE / UX/UI"
    (1444, 174, 1540, 202),   # label "AI & DATA"
]:
    fill_vertical(work, box)

# ------------------------------------------------------------------ hero plate
PLATE = (800, 0, 1560, 845)
plate = work.crop(PLATE).convert("RGBA")
pw, ph = plate.size

# Feather left / right / top so the plate dissolves into the CSS backdrop.
# The bottom stays hard: the turtleneck runs off the bottom of the frame.
alpha = Image.new("L", (pw, ph), 255)
a = alpha.load()
FL, FR, FT = 170, 100, 46
def smooth(t): return t * t * (3 - 2 * t)
for x in range(pw):
    k = smooth(min(1.0, min(x / FL, (pw - 1 - x) / FR)))
    for y in range(ph):
        v = k * (smooth(min(1.0, y / FT)) if y < FT else 1.0)
        a[x, y] = int(255 * v)
plate.putalpha(alpha)
# WebP only. Every browser released since 2020 supports it, and the rest of the
# build already assumes it; an 865 KB PNG fallback that nothing fetches is just
# weight in the repository and the deploy.
plate.save(os.path.join(OUT, "hero-plate.webp"), quality=90, method=6)

# A blurred, half-size copy used as the low-cost depth layer behind the plate
# during the push-in (blurring a small bitmap beats filter:blur() on a big one).
bg = work.crop(PLATE).convert("RGB").resize((pw // 2, ph // 2), Image.LANCZOS)
bg = bg.filter(ImageFilter.GaussianBlur(9)).convert("RGBA")
bg.putalpha(alpha.resize((pw // 2, ph // 2), Image.LANCZOS))
bg.save(os.path.join(OUT, "hero-plate-blur.webp"), quality=72, method=6)

# --------------------------------------------------------- cursor portrait
por = Image.open(os.path.join(REF, "portrait-source.png")).convert("RGBA")
por.resize((360, 360), Image.LANCZOS).save(os.path.join(OUT, "portrait-cursor.webp"), quality=92, method=6)

# ------------------------------------------------------- share (OG) image
# Social scrapers are the one place WebP still fails, so this is a JPEG, sized
# 1200x630 — what the platforms crop to anyway. It carries the headline,
# because a link in a job application that previews with a name reads better
# than one that previews with an unlabelled picture.
W, H = 1200, 630
grad = np.zeros((H, W, 3), dtype=np.float64)
c0 = np.array([0xDF, 0xDA, 0xD8], dtype=np.float64)     # warm paper, left
c1 = np.array([0xA6, 0xA8, 0xAE], dtype=np.float64)     # cool grey, right
for x in range(W):
    t = (x / (W - 1)) ** 1.15
    grad[:, x, :] = c0 * (1 - t) + c1 * t
og = Image.fromarray(grad.astype(np.uint8))

art = plate.copy()
art.thumbnail((760, 630), Image.LANCZOS)
og.paste(art, (W - art.width - 30, H - art.height), art)

try:
    font_path = "/System/Library/Fonts/Helvetica.ttc"
    name_font = ImageFont.truetype(font_path, 21, index=0)
    head_font = ImageFont.truetype(font_path, 54, index=0)
    d = ImageDraw.Draw(og)
    ink = (0x16, 0x19, 0x1E)
    # letterspaced wordmark, drawn glyph by glyph
    x, y = 64, 74
    for ch in "NIKOLE UGUETO":
        d.text((x, y), ch, font=name_font, fill=(0x3D, 0x43, 0x4B))
        x += d.textlength(ch, font=name_font) + 3.4
    for i, line in enumerate(["Ideas, people", "and technology", "in my mind."]):
        d.text((62, 250 + i * 66), line, font=head_font, fill=ink)
except OSError:
    pass          # no system font available: the artwork alone still works

og.save(os.path.join(OUT, "share.jpg"), quality=86, optimize=True, progressive=True)

# ---------------------------------------------------------------- metadata
p = src.load()
meta = {
    "plate": {"w": pw, "h": ph, "aspect": round(pw / ph, 5), "srcCrop": PLATE},
    # hotspot centres normalised to the plate (0..1), measured from the render
    "hotspots": {
        "healthcare": [round((1090 - PLATE[0]) / pw, 4), round(161 / ph, 4)],
        "ai":         [round((1357 - PLATE[0]) / pw, 4), round(202 / ph, 4)],
        "product":    [round((1399 - PLATE[0]) / pw, 4), round(356 / ph, 4)],
        "creative":   [round((1410 - PLATE[0]) / pw, 4), round(582 / ph, 4)],
    },
    # centre of the city mass: the point the camera pushes into
    "brainFocus": [round((1240 - PLATE[0]) / pw, 4), round(300 / ph, 4)],
    "backdrop": {n: "#%02X%02X%02X" % p[x, y] for n, (x, y) in {
        "topLeft": (30, 12), "topRight": (1845, 12),
        "bottomLeft": (30, 832), "bottomRight": (1845, 832),
        "plateLeft": (802, 420), "plateRight": (1556, 420),
    }.items()},
}
with open(os.path.join(OUT, "hero.meta.json"), "w") as f:
    json.dump(meta, f, indent=2)

print(json.dumps(meta["hotspots"], indent=2))
for f in sorted(os.listdir(OUT)):
    print(f"  {os.path.getsize(os.path.join(OUT, f)) / 1024:8.1f} KB  {f}")
