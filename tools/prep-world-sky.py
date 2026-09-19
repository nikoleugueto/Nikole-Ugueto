#!/usr/bin/env python3
"""
The atmospheric sky behind the worlds.

Built from Nikole's own sky reference (assets/reference/originals/sky.png):
blue above, a warm band at the horizon, layered cloud, and a sea of cloud below
with peaks breaking through. The islands float above cloud in the artwork, so
this puts them somewhere rather than on a gradient.

One image serves every world. Each world's identity comes from a tint applied
in CSS over the top, which keeps them recognisably one place, costs one cached
request instead of four, and can be retuned without re-exporting.

It is deliberately softened and lifted: the artwork and the type are the
subject, and a fully contrasty photograph behind them would compete. The
lift is also what keeps text comfortably above AA — see tools/contrast.js.

Run:  python3 tools/prep-world-sky.py
"""
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference", "originals")
OUT  = os.path.join(ROOT, "assets", "img")

src = Image.open(os.path.join(REF, "sky.png")).convert("RGB")

# Trim the very bottom, where the peaks are most defined — they would read as
# scenery competing with the island rather than as distance behind it.
w, h = src.size
sky = src.crop((0, 0, w, int(h * 0.93)))

# Soften, then lift and de-saturate toward the page's paper. Enough atmosphere
# to feel like air; not enough to pull the eye off the artwork.
sky = sky.filter(ImageFilter.GaussianBlur(2.2))
sky = ImageEnhance.Color(sky).enhance(0.72)

arr = np.asarray(sky, dtype=np.float64)
paper = np.array([244, 243, 240], dtype=np.float64)
arr = arr * 0.62 + paper * 0.38            # the base lift
arr = (arr - 128) * 0.86 + 128             # and a little less contrast

# The two darkest bands are the blue at the very top and the shadowed cloud at
# the foot — and those are exactly where a column of type begins and ends. A
# U-shaped vertical lift raises both ends while leaving the horizon glow in the
# middle alone, so the picture keeps the part worth looking at and the text
# still clears AA. The amount is solved for rather than guessed.
H_, W_ = arr.shape[:2]
t = np.linspace(0, 1, H_)[:, None, None]
u = (np.cos(t * 2 * np.pi) * 0.5 + 0.5) ** 1.4      # 1 at both ends, 0 mid


def relative_luminance(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def worst_ratio(a, ink):
    """Contrast of `ink` against the darkest left-hand band of the image."""
    small = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
                       .resize((16, 9), Image.LANCZOS), dtype=np.float64)
    bands = small[:, 2:8, :].mean(axis=1)            # the left, where text sits
    lums = np.array([relative_luminance(b) for b in bands])
    li = relative_luminance(np.array(ink, dtype=np.float64))
    return float(((np.maximum(lums, li) + 0.05) / (np.minimum(lums, li) + 0.05)).min())


INK_MUTED = (0x56, 0x5B, 0x64)
INK_QUIET = (0x6E, 0x74, 0x80)
extra = 0.0
while extra < 0.6:
    test = arr * (1 - u * extra) + paper * (u * extra)
    if worst_ratio(test, INK_MUTED) >= 4.55 and worst_ratio(test, INK_QUIET) >= 3.05:
        break
    extra += 0.02
arr = arr * (1 - u * extra) + paper * (u * extra)
print(f"  edge lift solved at {extra:.2f}  "
      f"(muted {worst_ratio(arr, INK_MUTED):.2f}:1, quiet {worst_ratio(arr, INK_QUIET):.2f}:1)")

sky = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

for width in (1280, 1920, 2560):
    if width > sky.width:
        out = sky.resize((width, round(sky.height * width / sky.width)), Image.LANCZOS)
    else:
        out = sky.resize((width, round(sky.height * width / sky.width)), Image.LANCZOS)
    out.save(os.path.join(OUT, f"world-sky-{width}.webp"), quality=82, method=5)
    print(f"  world-sky-{width}.webp  {os.path.getsize(os.path.join(OUT, f'world-sky-{width}.webp'))/1024:6.1f} KB")

# Sample the bands the type actually sits on, so the contrast audit can check
# them rather than guessing.
probe = sky.resize((16, 9), Image.LANCZOS)
rows = {"top": 1, "upper": 3, "middle": 4, "lower": 6, "foot": 8}
print("\n  sampled bands (for tools/contrast.js):")
for name, ry in rows.items():
    px = [probe.getpixel((x, ry)) for x in range(2, 8)]      # the left, where text sits
    avg = tuple(sum(c[i] for c in px) // len(px) for i in range(3))
    print(f"    {name:7s} #{avg[0]:02X}{avg[1]:02X}{avg[2]:02X}")
