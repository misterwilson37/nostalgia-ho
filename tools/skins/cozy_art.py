#!/usr/bin/env python3
"""Make the cozy skin's art: the original sprites in assets/sprites, upscaled
with xBRZ so they keep crisp cartoon outlines at modern sizes.

Needs xBRZ for Python:  pip install git+https://github.com/ioistired/xbrz.py
Run from anywhere:      python3 tools/skins/cozy_art.py

Writes, in the layout every skin uses (js/skins/classic/ui.js loadTheme,
tools/bundle.py):
  assets/skins/cozy/manifest.json   {"sprites": [names], "sounds": []}
  assets/skins/cozy/sprites/<name>.png
and, for the title animation (loaded by js/skins/cozy/ui.js itself, and
skipped by the single-file build, which then shows the classic title):
  assets/skins/cozy/title/<name>.jpg

Only pictures the classic skin draws whole and scaled are upscaled. The
ones it cuts by pixel position or draws at their own size (the ship sheet,
debris, the planet masks, the heat and ice-cap overlays) stay the
originals, or the planets and battles would come out wrong.
"""
import json, os, re, glob, shutil
from PIL import Image
import xbrz

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets', 'sprites')
OUT = os.path.join(ROOT, 'assets', 'skins', 'cozy')
RULES = [  # (pattern, scale)
    (r'^(planet\d|mined\d|metal\d|unknown|soon|battle|haloAlly|bad\d+_\d|white\d_\d)$', 3),
    (r'^(nova\d+|m9\d\d\d|p30[0-4]0)$', 2),
]
TITLE = r'^(p6999|t70\d\d)$'

for sub in ('sprites', 'title'):
    shutil.rmtree(os.path.join(OUT, sub), ignore_errors=True)
    os.makedirs(os.path.join(OUT, sub))
names = []
for p in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    k = os.path.basename(p)[:-4]
    im = Image.open(p).convert('RGBA')
    if re.match(TITLE, k):
        im = xbrz.scale_pillow(im, 2)
        bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3])
        bg.save(os.path.join(OUT, 'title', k + '.jpg'), quality=82)
        continue
    rule = next((r for r in RULES if re.match(r[0], k)), None)
    if not rule:
        continue
    xbrz.scale_pillow(im, rule[1]).save(os.path.join(OUT, 'sprites', k + '.png'), optimize=True)
    names.append(k)
json.dump({'sprites': names, 'sounds': []}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
size = lambda d: sum(os.path.getsize(f) for f in glob.glob(os.path.join(OUT, d, '*')))
print(len(names), 'sprites,', round(size('sprites') / 1e6, 2), 'MB;',
      len(os.listdir(os.path.join(OUT, 'title'))), 'title frames,', round(size('title') / 1e6, 2), 'MB')
