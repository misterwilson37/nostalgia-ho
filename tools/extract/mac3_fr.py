#!/usr/bin/env python3
"""The French Mac 3.0.1's End Turn picture (and what else in its pictures differs from the English 3.0.1's).

    python3 -I tools/extract/mac3_fr.py <The Ho! 3 F fork> <Ho! 3.0 CPicts fork>

The two forks are the files `unar` leaves from Spaceward3_FR.sit (AppleDouble ".rsrc"; see
docs/301fr-findings.md). Writes assets/skins/mac3/sprites/p5500-fr.png and p5501-fr.png, the
program's own PICT 5500 / 5501 (black and white, "Fin Tour"; pressed), decoded as
tools/extract/mac3.py decodes the English ones, and lists them in the skin's manifest. It then
checks every picture of both forks against the English 3.0.1's already in assets/skins/mac3 and
mac3c, and prints the ones that differ. Findings (1 November 2026):
  - PICT 5500 / 5501: the program's own French button, pixel for pixel Mac 1.2F's (p5500 / p5501
    of assets/skins/mac12). The colour file's PICT 5000 / 5001 (the colour End Turn) are
    the English 3.0.1's, "End Turn", unchanged: the French colour file was not translated;
  - PICT 4010: only in the French program (a licence stamp for the copy's owner: name, address
    and serial number as text drawing ops); not a game picture and not extracted;
  - the English program's PICT 3550 is not in the French one;
  - ICN# 3010 (and icl8 3010) are another picture (a figure with its mouth open; the English's
    is a steaming pile); ICN# 3170 (a question mark, the hints') only the French has; the
    English ICN# 3151, 3152 and 9993 aren't in the French. No skin shows these.
"""
import json, os, shutil, sys, tempfile
from PIL import Image, ImageChops

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mac3, pict  # noqa: E402
from rsrc import parse  # noqa: E402
from dos import edges_clear  # noqa: E402

SK = os.path.join(mac3.ROOT, 'assets', 'skins')


def same(a, b):
    a, b = a.convert('RGBA'), b.convert('RGBA')
    return a.size == b.size and not ImageChops.difference(a, b).getbbox()


def main(prog, colour):
    tmp = tempfile.mkdtemp()
    res = parse(mac3.resource_fork(prog, tmp))
    cres = parse(mac3.resource_fork(colour, tmp))
    shutil.rmtree(tmp)
    d = os.path.join(SK, 'mac3')
    mp = os.path.join(d, 'manifest.json')
    m = json.load(open(mp))
    for n in (5500, 5501):
        im = pict.decode(res[('PICT', n)][1]).convert('RGBA')
        im.save(os.path.join(d, 'sprites', 'p%d-fr.png' % n), optimize=True)
        m['sprites'] = sorted(set(m['sprites']) | {'p%d-fr' % n})
        print('PICT', n, im.size, '= mac12 p%d:' % n, same(im, Image.open(os.path.join(SK, 'mac12', 'sprites', 'p%d.png' % n))))
    json.dump(m, open(mp, 'w'), indent=1, ensure_ascii=False)
    # every picture against the English 3.0.1's
    for sk, r, ren in (('mac3', res, lambda i: i), ('mac3c', cres, lambda i: mac3.COLOUR_NAMES.get(i, i))):
        for (t, i), (_, data) in sorted(r.items()):
            if t != 'PICT':
                continue
            n = ren(i)
            try:
                im = mac3.pict1(data) if data[10:12] == b'\x11\x01' else pict.decode(data)
            except ValueError:
                print(sk, 'PICT', i, 'is drawing ops, not a bitmap (%d bytes)' % len(data))
                continue
            if n in (502, 503):
                im = edges_clear(im.convert('RGBA'))
            f = os.path.join(SK, sk, 'sprites', 'p%d.png' % n)
            if not os.path.exists(f):
                print(sk, 'PICT', i, 'only in the French')
            elif not same(im, Image.open(f)):
                print(sk, 'PICT', i, 'differs from the English')
            elif i in (5000, 5001, 5500, 5501):
                print(sk, 'PICT', i, 'is the English one')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
