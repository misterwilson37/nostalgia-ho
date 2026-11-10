#!/usr/bin/env python3
"""Makes DOT_GEO in js/skins/ios/ui.js (the patch fix 'vectorDots', docs/fixes.md item 7) from the iOS skin's fleet-dot sprites:
   python3 tools/skins/dot_shapes.py assets/skins/ios/sprites /tmp/geo.json   (then the JSON goes into ui.js as DOT_GEO, with the keys
   without their "fleet_dots_" and "th" only for the Satellite rings).
   For each fleet-dot sprite: its bounding box and, for a vertical gradient, the mean colour of each row of the shape, from the sprite's own pixels.
   A satellite ring's thickness is fitted so the ring has the sprite's area. Output: JSON read by the page-side drawing code."""
import json, glob, os, sys, math
import numpy as np
from PIL import Image

def stops(a, y0, y1):
    """row-mean colours of the opaque pixels, one stop per 2-pixel row pair (the sprites are drawn at 2x), as [position 0..1, '#rrggbb']"""
    out = []
    rows = list(range(y0, y1 + 1))
    for i in range(0, len(rows), 2):
        rr = rows[i:i + 2]
        px = np.concatenate([a[r][a[r][:, 3] > 127][:, :3] for r in rr])
        if len(px) == 0: continue
        c = px.mean(axis=0)
        pos = ((rr[0] + rr[-1] + 1) / 2 - y0) / (y1 + 1 - y0)
        out.append([round(pos, 3), '#%02x%02x%02x' % tuple(int(round(v)) for v in c)])
    return out

def main(src, dst):
    data = {}
    for f in sorted(glob.glob(os.path.join(src, 'fleet_dots_*_?_?.png'))):
        n = os.path.basename(f)[:-4]
        im = np.array(Image.open(f).convert('RGBA')); alpha = im[..., 3] > 127
        ys, xs = np.where(alpha)
        x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1  # [x0, x1) x [y0, y1)
        d = {'b': [x0, y0, x1, y1], 'g': stops(im, y0, y1 - 1), 'area': int(alpha.sum())}
        if n.split('_')[-2] == '5':  # a satellite: a ring; thickness from the area
            R = (x1 - x0) / 2; A = alpha.sum()
            d['th'] = round(R - math.sqrt(max(0.0, R * R - A / math.pi)), 2)
        data[n] = d
    json.dump(data, open(dst, 'w'), separators=(',', ':'))
    print(len(data), 'sprites,', os.path.getsize(dst), 'bytes')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
