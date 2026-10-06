#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! 4.0.5 for the Macintosh.

    pip install pillow
    python3 tools/extract/mac4.py "<Spaceward Ho! 4.0.5>" "<Ho! 4.0 Color Picts>" [<out>]

Each argument is the file's resource fork: an AppleDouble file ("._name"
or "name.rsrc", as unar or a Mac zip leaves it), the raw fork, or an HFS
disk image with the program on it (tools/extract/mac3.py resource_fork).
Writes assets/skins/mac4/ (the program's own black-and-white pictures) and
assets/skins/mac4c/ (the same set with every picture the colour file has),
each with sprites/*.png, sounds/*.wav and manifest.json, as mac3.py does
for 3.0.1 (<out> and <out>c instead, if given). 4.0.1's pair of files
works too: its art is 4.0.5's but for the few pictures listed in
docs/missing-assets.md (mac4).

4.0 keeps its pictures like 3.0.1 (ICN# n -> i<n>, ics# n -> s<n>, PICT n
-> p<n>, snd n -> <n>.wav, colour icl8/ics8 masked by the program's
ICN#/ics#, PPMp for 8-bit colour pictures), but numbers its icons like the
Windows 95 4.0.5 (tools/extract/win95.py, b<n>), not like 3.0.1:
    planets  1000-1006 explored, by size (gravity against your home's),
             +100 mined out, +200 icy, +250 hot; 1050-1056 yours losing
             money (+50 icy, +100 hot or mined out); 1400 unexplored, 1401
             a fleet on its way, 1402 a battle seen there, 1403 a nova,
             1404 Santa (25 December), 1405/1406 yours paying (rich /
             not), +500 a woman (1905, 1906); faces 2000-2019 / 2500-2519
    ships    40x40 parts: engines 2600-2623, hulls 2699-2724, colony pod
             2750, two hidden specials 2751-2756, 2757, tanker 2758, noses
             2850-2879, satellites 2901-2926; whole 120x40 pictures: 2260
             the basic scout, 2261 the biological, 2262 a scout, 2263 the
             dreadnought (colour: 12263-12277, its animation)
    others   502/503 the selection rings (506/507, 510/511 with halos),
             1003 the splash (304x200), 1001 the credits (text), 3500 /
             3510 battle won / lost, 3530 / 3540 game won / lost, 3020 the
             neutral space dude, 5500/5501 End Turn (up / down), 5530 the
             message border, 4051/4053/4061 money, debt and metal chips,
             6100-6140 the planet window's globe strips, 6050 the fractal
             backdrop, 7080/7081, 901/903 (PICT 4010 is skipped: SKIP)
The colour file numbers some pictures differently (COLOUR_NAMES); they are
saved under the black-and-white names. Its PPMp 7000-7023 are the colour
title animation (the cowboy planet), saved as p7000-p7023, and its five
sounds (7006, 7007, 7010, 7011, 10000 "Move 'em out!") go into both sets:
the program reads them from that file on any Mac.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rsrc import parse  # noqa: E402
import mac3, pict, snd  # noqa: E402
from dos import edges_clear  # noqa: E402

OUT = os.path.join(mac3.ROOT, 'assets', 'skins', 'mac4')

# colour file number -> black-and-white name
COLOUR_NAMES = {900: 901, 902: 903, 1002: 1003, 3000: 3500, 3010: 3510, 3030: 3530, 3040: 3540,
                3520: 3020, 4050: 4051, 4052: 4053, 4060: 4061, 5000: 5500, 5001: 5501, 5030: 5530}
# PICT 500 in the colour file is one sheet of the selection rings (halo_sheet).
RINGS = (502, 503)
# PICT 4010, new in 4.0.5's program, is no art: a text picture, the
# registration plate with the licensed owner's name and serial number.
SKIP = {4010}


def fork(path, tmpdir):
    p = mac3.resource_fork(path, tmpdir)
    res = parse(p)
    if p.endswith('.app.rsrc'):
        os.remove(p)
    return res


def bw(res):
    images, sounds = {}, {}
    for (t, i), (_, d) in sorted(res.items()):
        if t in ('ICN#', 'ics#'):
            images[('i' if t == 'ICN#' else 's') + str(i)] = mac3.icon(d, 32 if t == 'ICN#' else 16)
        elif t == 'PICT':
            if i in SKIP:
                continue
            im = (mac3.pict1(d) if d[10:12] == b'\x11\x01' else pict.decode(d)).convert('RGBA')
            if i in RINGS:  # drawn on black
                im = edges_clear(im)
            images['p' + str(i)] = im
        elif t == 'snd ':
            add_sound(sounds, i, d)
    return images, sounds


def add_sound(sounds, i, d):
    s = snd.decode(d)
    if s.get('bits') != 8:
        print('skipped sound', i, s.get('enc'))
        return
    sounds[i] = (round(s['rate']), s['data'])


def colour(images, res, cres):
    pal = mac3.mac_palette()
    images = dict(images)
    for (t, i), (_, d) in sorted(cres.items()):
        if t == 'icl8':
            mono = res.get(('ICN#', i), (0, None))[1]
            images['i%d' % i] = mac3.colour_icon(d, mono, 32, pal) if mono else black_clear(mac3.colour_icon(d, None, 32, pal))
        elif t == 'ics8':
            images['s%d' % i] = mac3.colour_icon(d, res.get(('ics#', i), (0, None))[1], 16, pal)
        elif t == 'PPMp':
            images['p%d' % (i - 10000 if i >= 12000 else i)] = mac3.ppmp(d, pal)
        elif t == 'PICT':
            im = pict.decode(d).convert('RGBA')
            if i == 500:
                images.update(halo_sheet(im))
                continue
            images['p%d' % COLOUR_NAMES.get(i, i)] = im
    return images


def black_clear(im):
    """Black made see-through: the colour icons with no mask in the
    program (the nova frames 728-741) and the colour selection rings."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            if px[x, y][:3] == (0, 0, 0):
                px[x, y] = (0, 0, 0, 0)
    return im


def halo_sheet(im):
    """The colour selection rings, PICT 500: a grid of 56x51 cells (58x52
    apart: five frames of the big ring across, plain, with a yellow halo,
    with a blue one), then 26x26 cells from y=156 (29x27 apart) for the
    small ring, and the halos alone at the right. Frame 0 of the plain
    rings is p502 / p503, all their black see-through (inside the ring
    too, where the planet shows); the whole sheet is kept as p500."""
    return {'p500': im, 'p502': black_clear(im.crop((0, 0, 56, 51))),
            'p503': black_clear(im.crop((0, 156, 26, 182)))}


def main(app, colour_file=None, out=OUT):
    os.makedirs(out, exist_ok=True)
    res = fork(app, out)
    images, sounds = bw(res)
    cres = None
    if colour_file:
        cres = fork(colour_file, out)
        for (t, i), (_, d) in sorted(cres.items()):
            if t == 'snd ':
                add_sound(sounds, i, d)
    mac3.save(out, images, sounds)
    if cres:
        mac3.save(out + 'c', colour(images, res, cres), sounds)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None,
         sys.argv[3] if len(sys.argv) > 3 else OUT)
