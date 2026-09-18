#!/usr/bin/env python3
"""
Artwork pipeline for the high-resolution cut-outs.

Everything about a piece of art lives in ART below — source path, how wide to
export, what to call it. To swap in a better original, drop the file in
assets/reference/originals/ and change one `src` line; nothing else in the site
needs to move. Output names and aspect ratios stay stable, so the CSS and the
hotspot coordinates keep working.

Two rules this script holds to:

  * It never upscales. Each output width is clamped to the source width, so a
    low-resolution original produces a smaller file rather than a soft, fake
    large one.
  * It keeps the alpha. These are cut-outs with no sky of their own; the sky is
    built in CSS, which stays sharp at any resolution, costs no bytes, and can
    be tuned per world without re-exporting anything.

Each piece is exported at several widths for srcset, and the trim box is
recorded so normalised hotspot coordinates survive a source swap.

Run:  python3 tools/prep-art.py
"""
from PIL import Image
import numpy as np
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

# --------------------------------------------------------------- the manifest
ART = {
    "hero-plate":      {"src": "originals/hero.png",             "widths": [760, 1140, 1520]},
    "worlds-island":   {"src": "originals/island.png",           "widths": [760, 1140, 1520]},
    "world-healthcare":{"src": "originals/world-healthcare.png", "widths": [640, 960, 1280]},
    "world-ai":        {"src": "originals/world-ai.png",         "widths": [640, 960, 1280]},
    "world-product":   {"src": "originals/world-product.png",    "widths": [640, 960, 1280]},
    "world-creative":  {"src": "originals/world-creative.png",   "widths": [640, 960, 1280]},
}

# These cut-outs are dominated by the cost of their alpha channel, not by RGB
# quality: dropping quality 92→70 saved 34%, while compressing alpha and
# flattening the invisible pixels underneath it saved 38% on its own. So the
# RGB stays high and the savings come from the two levers that cost nothing
# visible.
QUALITY       = 84
ALPHA_QUALITY = 70
ENCODE        = dict(method=5, quality=QUALITY, alpha_quality=ALPHA_QUALITY)


def flatten_hidden(im, fill=(236, 238, 240)):
    """Fully transparent pixels still carry RGB, and in a cut-out that RGB is
    whatever noise the removal tool left behind. Nobody sees it, but the encoder
    still spends bits on it. Replacing it with a flat colour is free."""
    arr = np.asarray(im).copy()
    arr[arr[..., 3] < 8, 0:3] = fill
    return Image.fromarray(arr)


def trim_alpha(im, threshold=6):
    """Crop away fully transparent margins so the art fills its box predictably.
    Returns the image and the box it was cut from, so positions can be rebased."""
    alpha = im.getchannel("A")
    box = alpha.point(lambda v: 255 if v > threshold else 0).getbbox()
    return (im.crop(box), box) if box else (im, (0, 0, im.width, im.height))


manifest = {}

for name, cfg in ART.items():
    path = os.path.join(REF, cfg["src"])
    if not os.path.exists(path):
        print(f"  !! missing source for {name}: {cfg['src']}")
        continue

    src = Image.open(path).convert("RGBA")
    art, box = trim_alpha(src)
    art = flatten_hidden(art)

    widths = sorted({min(w, art.width) for w in cfg["widths"]})
    files = []
    for w in widths:
        h = round(art.height * w / art.width)
        out = art if w == art.width else art.resize((w, h), Image.LANCZOS)
        fname = f"{name}-{w}.webp"
        out.save(os.path.join(OUT, fname), **ENCODE)
        files.append({"file": fname, "w": w, "h": h,
                      "kb": round(os.path.getsize(os.path.join(OUT, fname)) / 1024, 1)})

    # No plain-name duplicate: every consumer uses srcset with explicit widths,
    # and the smallest width already serves as the `src` fallback.

    manifest[name] = {
        "source": cfg["src"],
        "sourceSize": [src.width, src.height],
        "trimBox": box,                       # rebase normalised coords with this
        "natural": [art.width, art.height],
        "aspect": round(art.width / art.height, 5),
        "widths": files,
    }
    biggest = files[-1]
    print(f"  {name:18s} {art.width:>5}x{art.height:<5} "
          f"→ {len(files)} widths, largest {biggest['w']}px {biggest['kb']}KB")

with open(os.path.join(OUT, "art.manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(f"\n  manifest: assets/img/art.manifest.json")
