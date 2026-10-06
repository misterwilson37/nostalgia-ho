#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! 2.0.1 for the Macintosh
(Delta Tao, January 1992).

    pip install machfs pillow
    python3 tools/extract/mac2.py "<Spaceward Ho! 2.0.1>" "<TheHo Color Picts>" [<out>]

Each argument is the file's resource fork: an AppleDouble file ("._name"
or "name.rsrc", as unar or a Mac zip leaves it), the raw fork, or an HFS
disk image with the program on it ("Disk 1 - Program"; a DiskCopy 4.2
.dc42 image works for the colour disk, "Disk 2 - Color Pictures").
Writes assets/skins/mac2/ (the program's own black-and-white pictures) and
assets/skins/mac2c/ (the same set with every picture the colour file has),
each with sprites/*.png, sounds/*.wav and manifest.json, as mac3.py does
for 3.0.1 (<out> and <out>c instead, if given).

2.0.1 keeps its pictures as 3.0.1 and 1.2 do, with the same numbers
(mac3.py), and its icons are the DOS 2.0's set, numbered as the DOS game
numbers its colour icons (the DOS game was made from this one):
    ICN# n -> i<n>   planets 1000-1009 (yours making money, losing money,
                     bad gravity, bad gravity mined out; explored good,
                     bad, bad mined out; unexplored, fleet on its way,
                     battle seen), 1500-1503 the same as a woman, faces
                     2000-2019 / 2500-2519, report pictures 3000-3116
    ics# n -> s<n>   the same at 16x16, 12000-12003 the fleet markers
    PICT n -> p<n>   ship parts: big 81x76 ones (2100-2426, as 1.2 and the
                     DOS game have) and 40x40 ones (2600-2926), white on
                     black; 502/503 the selection rings; 1003 the start-up
                     window's splash (304x200, DITL 1201); 1001 the About
                     box (383x236, DITL 1101); 3500/3510 battle won / lost,
                     3530/3540 game won / lost, 3550 another player
                     eliminated, 3020 the neutral space dude; 5500/5501 End
                     Turn (up / down); 5530 the message border
    snd  n -> <n>.wav  the thirteen sounds 1.2 has, by the 5.0.5 numbers
Unlike 1.2 and 3.0.1, 2.0.1's colour icons are in the program itself
(icl8 and ics8, masked by its ICN# and ics#); "TheHo Color Picts" has the
colour pictures: PPMp 12000 + n for PICT n (the ship parts) and PICTs
numbered as mac3.COLOUR_NAMES has them (500/501 the rings, 1000 the About
box, 1002 the splash, 3000-3050 and 3520 the dudes, 5000/5001 End Turn,
5030 the message border). The start-up window's PICT 4010 (the licensee's
plate) and the colour About box's are in neither file: the program draws
the plate itself.
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rsrc import parse  # noqa: E402
import mac3, mac4, pict  # noqa: E402
from dos import edges_clear  # noqa: E402

OUT = os.path.join(mac3.ROOT, 'assets', 'skins', 'mac2')


def fork(path, tmpdir):
    """The resource fork of a .rsrc / AppleDouble / HFS or DiskCopy image."""
    d = open(path, 'rb').read(2048)
    if d[1024 + 84:1024 + 86] == b'BD':  # DiskCopy 4.2: the disk after an 84-byte header
        tmp = os.path.join(tmpdir, '.disk.img')
        os.makedirs(tmpdir, exist_ok=True)
        open(tmp, 'wb').write(open(path, 'rb').read()[84:])
        try:
            return fork_any(tmp, tmpdir)
        finally:
            os.remove(tmp)
    return fork_any(path, tmpdir)


def fork_any(path, tmpdir):
    d = open(path, 'rb').read(2048)
    if d[1024:1026] == b'BD':  # an HFS disk: the program, or else the colour file
        import machfs
        v = machfs.Volume()
        v.read(open(path, 'rb').read())
        files = [f for _, f in v.items() if hasattr(f, 'rsrc')]
        f = next((f for f in files if f.type == b'APPL' and f.creator == b'SH2\xc6'), None) \
            or next((f for f in files if f.type == b'SHcp'), None)
        if not f:
            sys.exit('No Spaceward Ho! 2.0 file on that disk')
        tmp = os.path.join(tmpdir, '.app.rsrc')
        open(tmp, 'wb').write(f.rsrc)
        res = parse(tmp)
        os.remove(tmp)
        return res
    return mac4.fork(path, tmpdir)


def colour(images, res, cres):
    pal = mac3.mac_palette()
    images = dict(images)
    for (t, i), (_, d) in sorted(res.items()):  # the colour icons: in the program
        if t == 'icl8' and ('ICN#', i) in res:
            images['i%d' % i] = mac3.colour_icon(d, res[('ICN#', i)][1], 32, pal)
        elif t == 'icl8' and i == 2499:  # no mask: the empty face frame, black see-through
            images['i%d' % i] = mac4.black_clear(mac3.colour_icon(d, None, 32, pal))
        elif t == 'ics8' and ('ics#', i) in res:
            images['s%d' % i] = mac3.colour_icon(d, res[('ics#', i)][1], 16, pal)
    for (t, i), (_, d) in sorted(cres.items()):  # the pictures: in TheHo Color Picts
        if t == 'PPMp':
            images['p%d' % (i - 10000)] = mac3.ppmp(d, pal)
        elif t == 'PICT':
            n = mac3.COLOUR_NAMES.get(i, i)
            im = pict.decode(d).convert('RGBA')
            images['p%d' % n] = edges_clear(im) if n in (502, 503) else im
    return images


def main(app, colour_file=None, out=OUT):
    os.makedirs(out, exist_ok=True)
    res = fork(app, out)
    images, sounds = mac4.bw(res)
    mac3.save(out, images, sounds)
    if colour_file:
        mac3.save(out + 'c', colour(images, res, fork(colour_file, out)), sounds)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None,
         sys.argv[3] if len(sys.argv) > 3 else OUT)
