#!/usr/bin/env python3
"""Write pictures of Spaceward Ho! 2.0 for Windows into the DOS skin's art (assets/skins/dos/sprites/w<id>.png) and its manifest.

    python3 -I tools/extract/win31-art.py <HOCOLOR.DLL> 1000 [more ids]

HOCOLOR.DLL (the 256-colour pictures; HOMONO.DLL has the black-and-white ones) keeps each picture as a whole .BMP file in a resource of
its own type; the dialogs draw them in their owner-painted statics. 1000: the About box's picture (383 x 236, template 1's control 999).
Run after tools/extract/dos.py, which writes the manifest afresh.
"""
import io
import json
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import windlg  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'assets', 'skins', 'dos')


def main(path, *ids):
    want = {int(i) for i in ids}
    man_p = os.path.join(OUT, 'manifest.json')
    man = json.load(open(man_p))
    for t, rid, d in windlg.ne_res(path):
        if rid in want and d[:2] == b'BM':
            im = Image.open(io.BytesIO(d))
            im.convert('RGB').save(os.path.join(OUT, 'sprites', 'w%d.png' % rid), optimize=True)
            if 'w%d' % rid not in man['sprites']:
                man['sprites'] = sorted(man['sprites'] + ['w%d' % rid])
            print('w%d.png %dx%d' % ((rid,) + im.size))
            want.discard(rid)
    json.dump(man, open(man_p, 'w'), indent=1)
    if want:
        sys.exit('not found: %s' % sorted(want))


if __name__ == '__main__':
    main(*sys.argv[1:])
