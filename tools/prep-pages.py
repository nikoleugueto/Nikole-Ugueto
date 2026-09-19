#!/usr/bin/env python3
"""
Process discs (reference 06).

The About portrait and the contact sky used to be built here. The portrait is
now a real high-resolution photograph handled by prep-art.py, and the sky is
built from her own photograph by prep-contact-sky.py — neither needs the inpainting this
script was built around.

Same principle as the other prep scripts: the mockups have their copy painted
into the pixels, so anything the site needs to own — headings, contact details,
navigation — is removed and rebuilt as DOM.

The contact skyline is the interesting one. Its overlays sit almost entirely on
smooth sky and water rather than on the skyline itself, so a Laplace membrane
fill handles them cleanly. It also carries a scanner-app artefact (a round
button from whatever captured the mockup) which is removed the same way. And
because the site re-places its own text roughly where the mockup's text was,
any residual softness in those patches ends up underneath type anyway.

Run:  python3 tools/prep-pages.py
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)


def inpaint(im, box, iters=500):
    x0, y0, x1, y1 = box
    m = 2
    reg = (max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), min(im.height, y1 + m))
    a = np.asarray(im.crop(reg), dtype=np.float64).copy()
    h, w = a.shape[:2]
    if h <= 2 * m or w <= 2 * m:
        return
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


meta = {}

# --------------------------------------------------------------- process discs
p6 = Image.open(os.path.join(REF, "06-process-reference.jpg")).convert("RGB")
CENTRES = [(481, 213), (633, 213), (786, 213), (940, 213), (1081, 213)]
R = 60
for i, (cx, cy) in enumerate(CENTRES, start=1):
    t = p6.crop((cx - R, cy - R, cx + R, cy + R)).convert("RGBA")
    m = Image.new("L", (2 * R, 2 * R), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 2 * R - 1, 2 * R - 1), fill=255)
    t.putalpha(m.filter(ImageFilter.GaussianBlur(0.8)))
    t.resize((220, 220), Image.LANCZOS).save(
        os.path.join(OUT, f"process-{i}.webp"), quality=88, method=6)
meta["processDiscs"] = len(CENTRES)

with open(os.path.join(OUT, "pages.meta.json"), "w") as f:
    json.dump(meta, f, indent=2)

print(json.dumps(meta, indent=2))
for f in sorted(os.listdir(OUT)):
    if f.startswith(("about-", "process-", "contact-")):
        print(f"  {os.path.getsize(os.path.join(OUT, f)) / 1024:7.1f} KB  {f}")
