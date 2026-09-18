#!/usr/bin/env python3
"""
Derived assets: the cursor portrait and the social share card.

The artwork itself is no longer built here — tools/prep-art.py owns it, working
from the high-resolution cut-outs in assets/reference/originals/. Everything
this script used to do to the old flat mockups (erasing baked labels with
median filters, feathering a rectangular plate into the page background) is
gone with them: the originals arrive as clean cut-outs with real alpha, so
there is nothing to repair.

Run:  python3 tools/prep-assets.py     (after prep-art.py — the card uses its output)
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------ cursor portrait
# The source is 1254px and the portrait renders up to ~144px on the screens
# where it is largest, so 512 covers 3x density with headroom. It shipped at
# 360 before, which was the one image on the site with real quality to recover.
por = Image.open(os.path.join(REF, "portrait-source.png")).convert("RGBA")
por.resize((512, 512), Image.LANCZOS).save(
    os.path.join(OUT, "portrait-cursor.webp"), quality=90, method=6, alpha_quality=80)

# --------------------------------------------------------------- share card
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

art = Image.open(os.path.join(OUT, "hero-plate-1140.webp")).convert("RGBA")
art.thumbnail((700, 620), Image.LANCZOS)
og.paste(art, (W - art.width - 50, H - art.height - 5), art)

try:
    font_path = "/System/Library/Fonts/Helvetica.ttc"
    name_font = ImageFont.truetype(font_path, 21, index=0)
    head_font = ImageFont.truetype(font_path, 54, index=0)
    d = ImageDraw.Draw(og)
    x, y = 64, 74
    for ch in "NIKOLE UGUETO":                    # letterspaced glyph by glyph
        d.text((x, y), ch, font=name_font, fill=(0x3D, 0x43, 0x4B))
        x += d.textlength(ch, font=name_font) + 3.4
    for i, line in enumerate(["Ideas, people", "and technology", "in my mind."]):
        d.text((62, 250 + i * 66), line, font=head_font, fill=(0x16, 0x19, 0x1E))
except OSError:
    pass          # no system font available: the artwork alone still works

og.save(os.path.join(OUT, "share.jpg"), quality=86, optimize=True, progressive=True)

for f in ("portrait-cursor.webp", "share.jpg"):
    print(f"  {os.path.getsize(os.path.join(OUT, f)) / 1024:7.1f} KB  {f}")
