#!/usr/bin/env python3
"""
The contact backdrop, from the original photograph.

An earlier pass recreated this from gradients because the source is only
1145px wide. Placed next to the original that was the wrong call: the real
image is a photographic Manhattan skyline with a dominant spire, lit windows,
textured cloud and a foreground shoreline, and the recreation was a flat,
evenly-lit band that merely shared its palette. It read as a different place.

So this uses the original. Its copy and the capture artefacts are removed with
the same Laplace membrane fill used elsewhere, then it is resampled with a mild
unsharp pass — enough to recover the edge definition resampling costs, gentle
enough not to ring around the towers. Softness in a backdrop that sits behind a
scrim is a far smaller price than a skyline that is not hers.

Run:  python3 tools/prep-contact-sky.py
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF  = os.path.join(ROOT, "assets", "reference")
OUT  = os.path.join(ROOT, "assets", "img")


def inpaint(im, box, iters=520):
    """Diffuse the surrounding pixels inward. The overlays sit almost entirely
    on smooth sky and water, which is where this is effectively exact."""
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


def clone_h(im, box, dx, feather=5):
    """Copy a patch from `dx` pixels sideways. Where an overlay crosses the far
    shoreline a membrane fill smears it into a grey bruise, because the shore is
    structure rather than a smooth field. The shore is also near-repetitive
    horizontally, so borrowing from a clean stretch alongside it is both simpler
    and better."""
    x0, y0, x1, y1 = box
    patch = im.crop((x0 + dx, y0, x1 + dx, y1))
    mask = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(mask).rectangle(
        (feather, feather, x1 - x0 - feather, y1 - y0 - feather), fill=255)
    im.paste(patch, (x0, y0), mask.filter(ImageFilter.GaussianBlur(feather)))


src = Image.open(os.path.join(REF, "08-contact-reference.jpg")).convert("RGB")

# The divider goes first: the patches borrowed below pass through where it was,
# so it has to be gone before they are taken.
clone_h(src, (752, 104, 784, 368), -70)

# Overlays sitting on open sky or open water: a membrane fill is exact there.
for box in [
    (26,     6, 1090,  30),   # mockup nav
    (44,    74,  268, 172),   # "Let's create what's next."
    (44,   178,  340, 228),   # body copy
    (44,   246,  210, 294),   # "Get in touch" pill
    (820,  104, 1048, 252),   # the whole contact list — open sky, all of it
    (40,   368,  280, 398),   # footer tags
    (1052, 374, 1112, 398),   # date stamp
]:
    inpaint(src, box)

# Only what genuinely crosses structure gets borrowed sideways, and only from
# close by. Reaching further along the shore to find "clean" pixels pasted a
# tower into open sky, because the skyline's height changes across the frame.
clone_h(src, (988, 264, 1124, 404), -150)   # the scanner artefact, over water

photo = src.crop((0, 30, 1145, 402))          # drop the nav strip
NATIVE = photo.width

# 1x is the native file. The larger steps are resampled, each followed by a
# light unsharp mask: radius small, amount moderate, threshold high enough that
# it sharpens structure without amplifying the JPEG grain in the sky.
for w in (1145, 1718, 2290):
    if w == NATIVE:
        out = photo
    else:
        out = photo.resize((w, round(photo.height * w / NATIVE)), Image.LANCZOS)
        out = out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=58, threshold=4))
    out.save(os.path.join(OUT, f"contact-sky-{w}.webp"), quality=86, method=5)
    print(f"  contact-sky-{w}.webp  {os.path.getsize(os.path.join(OUT, f'contact-sky-{w}.webp'))/1024:6.1f} KB"
          f"{'   (native)' if w == NATIVE else ''}")
