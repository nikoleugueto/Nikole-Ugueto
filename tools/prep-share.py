#!/usr/bin/env python3
"""
The social-sharing image — the same hero artwork, made opaque.

`og:image`/`twitter:image` cannot be a transparent cut-out: most link
previews (iMessage, WhatsApp, LinkedIn, X) either refuse alpha or flatten it
onto whatever colour their own renderer picks, which is never the one this
site actually puts behind the portrait. So this takes the hero art at its own
native resolution (assets/img/hero-plate-1195.webp — already the largest
export the trimmed original supports, see art.manifest.json) and flattens it
onto the exact gradient the page itself puts behind it (.backdrop in
base.css), at the artwork's own pixel size. Nothing is cropped, resized down,
or redrawn — the visual is the one the Home page already shows.

Run:  python3 tools/prep-share.py
"""
from PIL import Image
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

PLATE = os.path.join(IMG, "hero-plate-1195.webp")   # the hero art, native res
OUT = os.path.join(IMG, "share.jpg")

# The same three stops as .backdrop's gradient fallback in base.css —
# linear-gradient(107deg, var(--paper-warm) 0%, #DCD7D5 46%, #CFCFD1 100%) —
# so the matte behind the flattened cut-out matches what actually sits behind
# it on the page, not a colour invented for this image alone.
STOPS = [(0.00, "#DFDAD8"), (0.46, "#DCD7D5"), (1.00, "#CFCFD1")]
ANGLE_DEG = 107


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def gradient(w, h, stops, angle_deg):
    """A linear gradient across a w×h canvas, CSS's `angle_deg` convention
    (0deg = bottom-to-top, clockwise)."""
    theta = np.radians(90 - angle_deg)
    dx, dy = np.cos(theta), -np.sin(theta)
    xs, ys = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    # project onto the gradient axis, centred, then rescale 0..1 across the
    # canvas's own diagonal extent along that axis
    proj = (xs - 0.5) * dx + (ys - 0.5) * dy
    span = abs(dx) + abs(dy)
    t = np.clip(proj / span + 0.5, 0, 1)

    out = np.zeros((h, w, 3), dtype=np.float32)
    positions = [s[0] for s in stops]
    colors = [np.array(hex_rgb(s[1]), dtype=np.float32) for s in stops]
    for i in range(len(stops) - 1):
        p0, p1 = positions[i], positions[i + 1]
        mask = (t >= p0) & (t <= p1 if i == len(stops) - 2 else t < p1)
        local = np.clip((t[mask] - p0) / (p1 - p0), 0, 1)
        out[mask] = colors[i][None, :] + local[:, None] * (colors[i + 1] - colors[i])
    return Image.fromarray(out.astype(np.uint8), "RGB")


def main():
    art = Image.open(PLATE).convert("RGBA")
    w, h = art.size
    bg = gradient(w, h, STOPS, ANGLE_DEG)
    bg.paste(art, (0, 0), art)              # alpha-composite the cut-out onto its matte
    bg.save(OUT, "JPEG", quality=92, optimize=True)
    kb = os.path.getsize(OUT) / 1024
    print(f"  {os.path.relpath(OUT, ROOT)}  {w}x{h}  {kb:.1f}KB")


if __name__ == "__main__":
    main()
