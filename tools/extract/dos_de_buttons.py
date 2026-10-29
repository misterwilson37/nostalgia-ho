#!/usr/bin/env python3
"""The German DOS 2.0's own End Turn button ("Zug Ende / Strg+T", d5000, and
its pressed state d5001) from Jake's German floppy image ("Version D2.0 für
DOS", February 1993):

    python3 tools/extract/dos_de_buttons.py <folder with the German HOCOLOR.PRS>

Writes assets/skins/dos/sprites/d5000-de.png and d5001-de.png, made as
tools/extract/dos.py makes the English ones, and the black-and-white
screen's pair from HOMONO.PRS (d5500-de.png, d5501-de.png; the remake's DOS
skin doesn't use HOMONO.PRS today, so these are kept for completeness).
Compared record by record with the English files, these four pictures and
HO.PRS's string table are the German disk's only differences; the pictures
cut off at the end of its files (colour 12914-12926, ship parts; mono 999)
can't be compared. The German HOCOLOR.PRS on the
image is cut off at 1,572,864 bytes (the rest is on a disk not in hand), but
both pictures lie complete near its start (from byte 423,806); the German
and English files first differ inside d5000, at byte 423,872.
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('dosx', os.path.join(HERE, 'dos.py'))
dosx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dosx)


def main(src):
  for f, ids in (('HOCOLOR.PRS', (5000, 5001)), ('HOMONO.PRS', (5500, 5501))):
    path = os.path.join(src, f)
    for t, rid, _, data in dosx.parse(path):
        if t != 'DIB' or rid not in ids:
            continue
        if data[:2] != b'BM':
            sys.exit(f'd{rid} is not a picture')
        im = dosx.edges_clear(dosx.bmp(data).convert('RGBA'))
        out = os.path.join(dosx.OUT, 'sprites', f'd{rid}-de.png')
        im.save(out, optimize=True)
        print('wrote', out, im.size)


if __name__ == '__main__':
    main(sys.argv[1])
