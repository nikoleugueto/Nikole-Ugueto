#!/usr/bin/env python3
"""
The contact backdrop.

Nikole supplied a clean skyline photograph, so this script does almost nothing
to it on purpose — no inpainting, no sharpening, no grading. The previous
source was a mockup screenshot with copy painted over it and needed repair;
this one does not, and every one of those steps would now only move it further
from the picture she chose.

Two rules:
  * Never past native. The file is 1254px square (despite its name), so 1254 is
    the largest export. A wider one would be invented detail.
  * Encoded at high quality. It is one image on one screen; the few kilobytes
    saved by pushing the quality down are not worth softening it.

Run:  python3 tools/prep-contact-sky.py
"""
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "assets", "reference", "originals", "contact-skyline.png")
OUT  = os.path.join(ROOT, "assets", "img")

photo = Image.open(SRC).convert("RGB")
NATIVE = photo.width
print(f"  source {photo.width}x{photo.height}")

# Small screens should not pull the largest file; large ones should get native.
for width in (640, 960, NATIVE):
    out = photo if width == NATIVE else photo.resize(
        (width, round(photo.height * width / NATIVE)), Image.LANCZOS)
    path = os.path.join(OUT, f"contact-sky-{width}.webp")
    out.save(path, quality=92, method=6)
    print(f"  contact-sky-{width}.webp  {os.path.getsize(path)/1024:6.1f} KB"
          f"{'   (native, unresampled)' if width == NATIVE else ''}")
