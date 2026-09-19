#!/usr/bin/env python3
"""
The sky behind the home portrait.

Nikole's own photograph replaces the flat gradient that used to sit there. Two
things have to be true at once: it must keep its atmosphere, and it must stay
behind the artwork rather than competing with it — the portrait is the subject
of that screen.

So it is lifted toward the page's paper, and the amount of lift is solved for
rather than chosen: enough that the headline column clears WCAG AA and the
decorative marks clear 3:1, and no more. Everything else about the picture —
its cloud, its warmth on the left, its gradient — is left alone.

Run:  python3 tools/prep-home-sky.py
"""
from PIL import Image, ImageEnhance
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "assets", "reference", "originals", "home-sky.png")
OUT  = os.path.join(ROOT, "assets", "img")

sky = Image.open(SRC).convert("RGB")
NATIVE = sky.width
print(f"  source {sky.width}x{sky.height}")

sky = ImageEnhance.Color(sky).enhance(0.82)     # a touch less saturated
arr = np.asarray(sky, dtype=np.float64)
paper = np.array([233, 231, 228], dtype=np.float64)


def rel_lum(rgb):
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def worst(a, ink):
    """Contrast of `ink` against the darkest part of the left third, which is
    where the headline, lede and scroll cue sit."""
    left = a[:, :int(a.shape[1] * 0.38)].reshape(-1, 3)
    dark = np.percentile(left, 2, axis=0)
    li, lb = rel_lum(ink), rel_lum(dark)
    hi, lo = max(li, lb), min(li, lb)
    return (hi + 0.05) / (lo + 0.05)


# Solved against the inks that are actually in this column, not the whole
# palette. The headline, eyebrow, lede and scroll cue are --ink-soft; the only
# --ink-quiet here is the aria-hidden separators in the eyebrow, which are
# decorative and need 3:1. Including --ink-muted — which nothing on the left of
# this screen uses — forced a 0.60 lift and washed most of the weather out of
# the picture for no reader's benefit.
# A floor as well as a solve. Contrast alone would allow almost no lift at all
# here — the picture is already pale — but the portrait is the subject of this
# screen, so the sky is held a little further back than legibility strictly
# demands. The floor is the design decision; the solve is the safety net.
SOFT  = (0x3D, 0x43, 0x4B)
MUTED = (0x56, 0x5B, 0x64)
FLOOR = 0.20
lift = FLOOR
while lift < 0.85:
    test = arr * (1 - lift) + paper * lift
    if worst(test, SOFT) >= 4.60 and worst(test, MUTED) >= 3.05:
        break
    lift += 0.02
arr = arr * (1 - lift) + paper * lift
print(f"  lift {lift:.2f}{'  (the floor)' if abs(lift - FLOOR) < 1e-9 else '  (solved up from the floor)'}  "
      f"— soft {worst(arr, SOFT):.2f}:1, muted {worst(arr, MUTED):.2f}:1")

sky = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

for w in (1280, NATIVE, 2048):
    if w > NATIVE:
        continue                      # never past the source
    out = sky if w == NATIVE else sky.resize((w, round(sky.height * w / NATIVE)), Image.LANCZOS)
    path = os.path.join(OUT, f"home-sky-{w}.webp")
    out.save(path, quality=88, method=5)
    print(f"  home-sky-{w}.webp  {os.path.getsize(path)/1024:6.1f} KB"
          f"{'   (native)' if w == NATIVE else ''}")
