#!/usr/bin/env python3
"""Read a 1-bit Mac screen shot back out of a printed page scan, pixel for pixel (used for the Mac 1.0 skin: tools/skins/mac10_icons.py).

A screen shot printed on a LaserWriter and scanned at 300 dpi keeps every Mac pixel as a block of about 8 x 8 scan pixels. This fits a
pixel grid to a crop: the threshold by Otsu's method, then the pitch (around p0) and the offset that make each cell's middle most
clearly black or white (the score is the mean distance of the cells from grey, 0.5 at best), and prints the cells as # and .

    python3 -I tools/skins/mac10_scan_grid.py <scan.jpg> <left> <top> <right> <bottom> [pitch, 8.35] [span, 0.4]

The 1.0 manual's figures fit at 8.30-8.40 with scores 0.497-0.500 (Jake's scans in the private repo, originals/mac-1.0-manual)."""
import sys
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None


def load(f, box):
    a = np.array(Image.open(f).convert('L').crop(box)).astype(float)
    hist = np.bincount(a.astype(int).ravel(), minlength=256); tot = a.size; best = (0, 128); sumall = (np.arange(256) * hist).sum(); wb = sb = 0
    for t in range(256):
        wb += hist[t]
        if wb == 0 or wb == tot: continue
        sb += t * hist[t]; mb = sb / wb; mf = (sumall - sb) / (tot - wb); v = wb * (tot - wb) * (mb - mf) ** 2
        if v > best[0]: best = (v, t)
    return a, best[1]


def fit(a, thr, p0=8.35, span=0.4):
    b = (a > thr).astype(float)
    H, W = b.shape; best = None
    for p in np.arange(p0 - span, p0 + span, 0.02):
        for oy in np.arange(0, p, p / 8):
            for ox in np.arange(0, p, p / 8):
                ys = (oy + p / 2 + np.arange(int((H - oy) / p)) * p).astype(int); xs = (ox + p / 2 + np.arange(int((W - ox) / p)) * p).astype(int)
                ys = ys[ys < H]; xs = xs[xs < W]
                c = (b[np.ix_(ys, xs)] + b[np.ix_(np.clip(ys - 1, 0, H - 1), xs)] + b[np.ix_(np.clip(ys + 1, 0, H - 1), xs)]
                     + b[np.ix_(ys, np.clip(xs - 1, 0, W - 1))] + b[np.ix_(ys, np.clip(xs + 1, 0, W - 1))]) / 5
                score = np.abs(c - 0.5).mean()
                if best is None or score > best[0]: best = (score, p, ox, oy, c > 0.5)
    return best


if __name__ == '__main__':
    f, box = sys.argv[1], tuple(int(v) for v in sys.argv[2:6])
    p0 = float(sys.argv[6]) if len(sys.argv) > 6 else 8.35; span = float(sys.argv[7]) if len(sys.argv) > 7 else 0.4
    a, t = load(f, box); s, p, ox, oy, g = fit(a, t, p0, span)
    print(f'threshold {t}, pitch {p:.3f}, score {s:.3f}')
    for r in g: print(''.join('#' if v else '.' for v in r))
