#!/usr/bin/env python3
"""
Builds the individual-world artwork from reference 03.

`03-individual-worlds.PNG` shows four floating islands in one sky — each one a
person at work in their domain. On the site those become four separate places,
so each island is cropped out as its own plate. The crops are chosen to exclude
the neighbouring islands and the mockup's baked labels; whatever text survives
at an edge is removed with the same Laplace membrane fill used on the map.

Each plate keeps its own slice of sky, which is why the four worlds end up with
genuinely different light — the top-left island sits in cool blue, the
bottom-right in low sun. That is the worlds' visual identity, taken from the
artwork rather than invented.

Also lifts the five journey portraits from the strip at the foot of the render.

Run:  python3 tools/prep-world-scenes.py
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

src = Image.open(os.path.join(REF, "03-individual-worlds.PNG")).convert("RGB")


def inpaint(im, box, iters=500):
    """Fill `box` by diffusing the surrounding pixels inward. Sky and cloud are
    smooth fields, so a membrane fill is effectively exact here."""
    x0, y0, x1, y1 = box
    m = 2
    reg = (max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), min(im.height, y1 + m))
    a = np.asarray(im.crop(reg), dtype=np.float64).copy()
    h, w = a.shape[:2]
    mask = np.zeros((h, w), dtype=bool)
    mask[m:h - m, m:w - m] = True
    top, bot = a[m - 1, :, :], a[h - m, :, :]
    left, right = a[:, m - 1, :], a[:, w - m, :]
    ys = np.linspace(0, 1, h)[:, None, None]
    xs = np.linspace(0, 1, w)[None, :, None]
    a[mask] = ((top[None, :, :] * (1 - ys) + bot[None, :, :] * ys) * 0.5
             + (left[:, None, :] * (1 - xs) + right[:, None, :] * xs) * 0.5)[mask]
    for _ in range(iters):
        nxt = (np.roll(a, 1, 0) + np.roll(a, -1, 0)
             + np.roll(a, 1, 1) + np.roll(a, -1, 1)) * 0.25
        a[mask] = nxt[mask]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
                  .filter(ImageFilter.GaussianBlur(0.6)), (reg[0], reg[1]))


def feather(img, f=44):
    """Dissolve every edge, so the plate sits in a CSS sky instead of on a slab."""
    w, h = img.size
    a = Image.new("L", (w, h), 255)
    px = a.load()
    sm = lambda t: t * t * (3 - 2 * t)
    for x in range(w):
        kx = sm(min(1.0, min(x, w - 1 - x) / f))
        for y in range(h):
            px[x, y] = int(255 * kx * sm(min(1.0, min(y, h - 1 - y) / f)))
    img.putalpha(a)
    return img


# Crop, plus any baked text that survives inside it (coordinates are global).
SCENES = {
    "healthcare": {"crop": (585,  28, 1002, 318), "erase": []},
    "ai":         {"crop": (938, 100, 1332, 398), "erase": []},
    "product":    {"crop": (612, 292,  998, 592), "erase": []},
    "creative":   {"crop": (982, 412, 1352, 672), "erase": []},
}

meta = {"scenes": {}, "journey": []}

for name, cfg in SCENES.items():
    work = src.copy()
    for box in cfg["erase"]:
        inpaint(work, box)
    x0, y0, x1, y1 = cfg["crop"]
    plate = feather(work.crop(cfg["crop"]).convert("RGBA"))
    plate.save(os.path.join(OUT, f"world-{name}.webp"), quality=88, method=6)

    # Sky sampled from the four edges of this crop, for the CSS backdrop.
    p = src.load()
    sky = {
        "topLeft":     "#%02X%02X%02X" % p[x0 + 4, y0 + 4],
        "topRight":    "#%02X%02X%02X" % p[x1 - 4, y0 + 4],
        "bottomLeft":  "#%02X%02X%02X" % p[x0 + 4, y1 - 4],
        "bottomRight": "#%02X%02X%02X" % p[x1 - 4, y1 - 4],
    }
    meta["scenes"][name] = {
        "w": x1 - x0, "h": y1 - y0,
        "aspect": round((x1 - x0) / (y1 - y0), 4),
        "sky": sky,
    }

# --- the five journey portraits from the strip ---------------------------
CIRCLES = [(478, 786), (650, 786), (822, 786), (993, 786), (1163, 786)]
R = 50
for i, (cx, cy) in enumerate(CIRCLES, start=1):
    t = src.crop((cx - R, cy - R, cx + R, cy + R)).convert("RGBA")
    mask = Image.new("L", (2 * R, 2 * R), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 2 * R - 1, 2 * R - 1), fill=255)
    t.putalpha(mask.filter(ImageFilter.GaussianBlur(0.8)))
    t.resize((200, 200), Image.LANCZOS).save(os.path.join(OUT, f"journey-{i}.webp"),
                                             quality=88, method=6)
    meta["journey"].append(f"journey-{i}.webp")

with open(os.path.join(OUT, "world-scenes.meta.json"), "w") as f:
    json.dump(meta, f, indent=2)

print(json.dumps(meta, indent=2))
for f in sorted(os.listdir(OUT)):
    if f.startswith(("world-", "journey-")):
        print(f"  {os.path.getsize(os.path.join(OUT, f)) / 1024:7.1f} KB  {f}")
