#!/usr/bin/env python3
"""
Builds the contact backdrop.

The original was a 1145px screenshot of an AI-generated dusk skyline, too small
for a full-bleed background and with no higher-resolution source available.
Nikole asked for a recreation rather than an upscale, so this composes one at
3200x1400: the same visual language — hazy dusk over water, city on the far
shore, warm low sun — built from gradients and atmospheric perspective instead
of pixels, so it stays clean at any size.

It is deliberately low-contrast and mostly atmosphere. It sits behind a scrim
and behind type; its job is depth, not detail.

Run:  python3 tools/make-contact-sky.py
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "assets", "img")
W, H = 3200, 1400
HORIZON = int(H * 0.60)

random.seed(7)          # deterministic: re-running gives the same sky

# ------------------------------------------------------------------ the sky
# Sampled from the original: cool grey-blue up high, warming down to a peach
# band at the horizon where the sun is.
stops = [
    (0.00, (150, 160, 176)),
    (0.30, (186, 190, 196)),
    (0.52, (226, 206, 186)),
    (0.60, (243, 218, 190)),
]
sky = np.zeros((H, W, 3), dtype=np.float64)
for y in range(HORIZON):
    t = y / HORIZON
    for i in range(len(stops) - 1):
        a, b = stops[i], stops[i + 1]
        if a[0] <= t <= b[0]:
            k = (t - a[0]) / (b[0] - a[0])
            sky[y, :, :] = [a[1][c] + (b[1][c] - a[1][c]) * k for c in range(3)]
            break
    else:
        sky[y, :, :] = stops[-1][1]

# the sun: a broad warm bloom low and to the right, as in the original
sx, sy = int(W * 0.78), int(HORIZON * 0.93)
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - sx) / (W * 0.42)) ** 2 + ((yy - sy) / (H * 0.30)) ** 2)
bloom = np.clip(1 - d, 0, 1) ** 2.2
for c, amt in enumerate((62, 34, 2)):
    sky[:, :, c] += bloom * amt

img = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8))

# ---------------------------------------------------------------- the water
# Below the horizon: the sky inverted and desaturated, which is what water does.
water = img.crop((0, 0, W, HORIZON)).transpose(Image.FLIP_TOP_BOTTOM)
water = water.resize((W, H - HORIZON), Image.LANCZOS)
wa = np.asarray(water, dtype=np.float64)
wa = wa * 0.88 + 26                      # flatter and paler than the sky
wa = wa * 0.82 + wa.mean(axis=2, keepdims=True) * 0.18
img.paste(Image.fromarray(np.clip(wa, 0, 255).astype(np.uint8)), (0, HORIZON))

# ------------------------------------------------------------------- clouds
# Soft horizontal bands, blurred well past the point of having edges.
clouds = Image.new("L", (W // 4, H // 4), 0)
cd = ImageDraw.Draw(clouds)
for _ in range(34):
    cy = random.randint(int(H * 0.04 / 4), int(HORIZON * 0.82 / 4))
    cw = random.randint(W // 22, W // 7)
    ch = random.randint(6, 20)
    cx = random.randint(-cw, W // 4)
    cd.ellipse((cx, cy, cx + cw, cy + ch), fill=random.randint(70, 150))
clouds = clouds.filter(ImageFilter.GaussianBlur(16)).resize((W, H), Image.LANCZOS)
warm = Image.new("RGB", (W, H), (255, 244, 232))
img = Image.composite(warm, img, clouds.point(lambda v: int(v * 0.55)))

# ------------------------------------------------------------------ the city
# A low band on the far shore. Atmospheric perspective is the whole trick: the
# towers are only a little darker than the sky behind them, which is what makes
# it read as distance rather than as a cut-out silhouette.
city = Image.new("L", (W, H), 0)
cdraw = ImageDraw.Draw(city)
skyline_top = HORIZON - int(H * 0.135)

# A skyline is not an even row of blocks — it has a dense core that thins out
# toward the edges. This envelope drives both height and spacing, which is what
# stops it reading as a bar chart.
CORE = 0.56                      # where downtown sits, across the frame
def envelope(px):
    d = abs(px / W - CORE)
    return max(0.16, 1.0 - (d / 0.52) ** 1.5)

x = -40
while x < W:
    e = envelope(x)
    bw = random.randint(14, 30 + int(52 * e))
    bh = int(H * (0.012 + 0.095 * e * random.uniform(0.45, 1.0)))
    if random.random() < 0.05 * e + 0.01:            # the occasional landmark
        bh = int(bh * random.uniform(1.5, 2.1))
    top = max(skyline_top - int(H * 0.03), HORIZON - bh)
    cdraw.rectangle((x, top, x + bw, HORIZON), fill=255)
    # a setback or a spire on the taller ones
    if bh > H * 0.055 and random.random() < 0.45:
        iw = int(bw * random.uniform(0.3, 0.6))
        ix = x + (bw - iw) // 2
        cdraw.rectangle((ix, top - int(bh * random.uniform(0.12, 0.3)), ix + iw, top), fill=255)
    # gaps widen as the density falls away
    x += bw + random.randint(-4, 6 + int(26 * (1 - e)))
city = city.filter(ImageFilter.GaussianBlur(1.6))

base = np.asarray(img, dtype=np.float64)
mask = np.asarray(city, dtype=np.float64)[..., None] / 255.0
# depth: the far shore is barely there, and it fades further toward the sun
fade = np.clip(1 - np.abs(np.arange(W) - sx) / (W * 0.85), 0.25, 1)[None, :, None]
tint = np.array([120, 118, 126], dtype=np.float64)
strength = 0.30 * fade
base = base * (1 - mask * strength) + tint * (mask * strength)

# a warm rim where the towers meet the light
glow = Image.fromarray((mask[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(26))
ga = np.asarray(glow, dtype=np.float64)[..., None] / 255.0
base += ga * np.array([26, 14, 0]) * fade

# the city's reflection, faint and smeared
refl = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).crop((0, skyline_top, W, HORIZON))
refl = refl.transpose(Image.FLIP_TOP_BOTTOM).resize((W, int(H * 0.10)), Image.LANCZOS)
refl = refl.filter(ImageFilter.GaussianBlur(9))
out = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
out.paste(Image.blend(out.crop((0, HORIZON, W, HORIZON + refl.height)), refl, 0.30), (0, HORIZON))

# ------------------------------------------------------------------- finish
# A last pass of haze, and the faintest grain so large flat areas do not band.
out = Image.blend(out, out.filter(ImageFilter.GaussianBlur(2.0)), 0.35)
arr = np.asarray(out, dtype=np.float64)
arr += np.random.default_rng(3).normal(0, 1.5, arr.shape)
out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

for w in (1600, 2400, 3200):
    out.resize((w, round(H * w / W)), Image.LANCZOS).save(
        os.path.join(OUT, f"contact-sky-{w}.webp"), quality=84, method=5)
    print(f"  contact-sky-{w}.webp  {os.path.getsize(os.path.join(OUT, f'contact-sky-{w}.webp'))/1024:6.1f} KB")
