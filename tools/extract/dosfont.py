#!/usr/bin/env python3
"""Make a web font from the VGA screen font the DOS game keeps in HO.PRS (record SFN 14 "Bios8x14Font": 256 characters, 14 bytes each, one byte a row,
top bit the left pixel). Each lit pixel is a square outline, so the font is exact at 14 px (and at multiples of 14).

    python3 tools/extract/dosfont.py <folder with HO.PRS>      (needs fontTools: pip install fonttools)

Writes assets/skins/dos/fonts/bios8x14.ttf. (The game's menus and dialogs are set in it, js/skins/dos/style.css.)"""
import os, struct, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = open(os.path.join(sys.argv[1], 'HO.PRS'), 'rb').read()
p, rec = 0x30, None
while p + 28 <= len(d):
    t = d[p:p + 4].rstrip(b'\0'); ln = struct.unpack('<I', d[p + 24:p + 28])[0]
    if t == b'SFN': rec = d[p + 28:p + ln]; break
    p += ln
assert rec and len(rec) == 3584
U = 100  # font units per pixel: 14 px = 1400 units = 1 em
names = ['.notdef'] + ['c%02x' % i for i in range(1, 256)]
fb = FontBuilder(1400, isTTF=True)
fb.setupGlyphOrder(names)
cmap, glyphs, metrics = {}, {}, {}
for c in range(256):
    pen = TTGlyphPen(None)
    for y in range(14):
        row = rec[c * 14 + y]
        for x in range(8):
            if row & (0x80 >> x):
                x0, y0 = x * U, (11 - y) * U  # baseline under row 10 (ascent 11, descent 3)
                pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
    glyphs[names[c]] = pen.glyph(); metrics[names[c]] = (800, 0)
    if c >= 32 and c != 127: cmap[c] = names[c]
cmap[0x2666] = names[4]  # the check diamond of the menus (character 4 of the screen font)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=1100, descent=-300)
fb.setupNameTable({'familyName': 'DOS Bios 8x14', 'styleName': 'Regular'})
fb.setupOS2(sTypoAscender=1100, sTypoDescender=-300, usWinAscent=1100, usWinDescent=300)
fb.setupPost()
out = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts'); os.makedirs(out, exist_ok=True)
fb.save(os.path.join(out, 'bios8x14.ttf'))
print('ok', os.path.getsize(os.path.join(out, 'bios8x14.ttf')))
