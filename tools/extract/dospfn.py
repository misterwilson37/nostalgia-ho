#!/usr/bin/env python3
"""Make web fonts from the bitmap fonts of Spaceward Ho! 2.0 for DOS (HO.PRS records "PFN": Mac fonts, Chicago 12 and Geneva 9, which the program
draws its panels in). The format, worked out from the records and checked against the running program:

    name[33] (Geneva, padded), then size, height, ?, ascent, descent (5 bytes), zeros to byte 64;
    a table of 248 little-endian 16-bit x offsets, entry (code - 10) .. entry (code - 10) + 1 bounding the glyph of a character code
    (Mac Roman, 10..255); the advance is the difference;
    then the strike: rows of `stride` bytes, the left pixel the top bit, INK = 0 bits; the first row of each strike is a header row (not drawn),
    glyph x positions are the table's plus `dx`.
    Geneva_9 and Geneva_9BC (the bold): strike at byte 564 of the record, 14 rows of 134 bytes, dx 0, 12 glyph rows (ascent 10, descent 2);
    Chicago_12: strike at byte 660, 16 rows of 172 bytes, dx 1, 15 glyph rows (ascent 12, descent 3).
    Geneva_9B (the wide bold of the money lines): strike at byte 674, 13 rows of 158 bytes, dx 0, 12 glyph rows after the header row (found by searching the record for the
    bitmap of the R photographed from the running program: one hit, at stride 158).
    (The other records are not read.)

    python3 tools/extract/dospfn.py <folder with HO.PRS>      (needs fontTools: pip install fonttools)

Writes assets/skins/dos/fonts/geneva9.ttf, geneva9bold.ttf, chicago12.ttf (one square per ink pixel; font-size = the cell height in px: 12 / 12 / 15)."""
import os, struct, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = open(os.path.join(sys.argv[1], 'HO.PRS'), 'rb').read()
recs, p = {}, 0x30
while p + 28 <= len(d):
    t = d[p:p + 4].rstrip(b'\0'); nm = d[p + 6:p + 24].split(b'\0')[0].decode('latin1'); ln = struct.unpack('<I', d[p + 24:p + 28])[0]
    if t == b'PFN': recs[nm] = d[p + 28:p + ln]
    p += ln
OUT = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts'); os.makedirs(OUT, exist_ok=True)
FONTS = [  # record, file, family, strike start, rows, stride, dx, first drawn row, glyph rows, ascent
    ('Geneva_9', 'geneva9.ttf', 'DOS Geneva 9', 564, 14, 134, 0, 2, 12, 10),
    ('Geneva_9B', 'geneva9bold.ttf', 'DOS Geneva 9 Bold', 674, 13, 158, 0, 1, 12, 10),
    ('Chicago_12', 'chicago12.ttf', 'DOS Chicago 12', 660, 16, 172, 1, 1, 15, 12)]
for rec, fn, fam, S, rows, stride, dx, r0, gr, asc, *bold in FONTS:
    bold = bool(bold)
    r = recs[rec]; tab = struct.unpack('<248H', r[64:560]); strike = r[S:S + rows * stride]
    U = 100; names = ['.notdef']; cmap, glyphs, metrics = {}, {}, {}
    for c in range(32, 256):
        if c == 127: continue
        i = c - 10; a, b = tab[i] + dx, tab[i + 1] + dx
        pen = TTGlyphPen(None)
        for gx in range(a, b):
            for y in range(gr):
                if not strike[(y + r0) * stride + (gx >> 3)] & (0x80 >> (gx & 7)):
                    x0, y0 = (gx - a) * U, (asc - 1 - y) * U
                    for w in ((0, 1) if bold else (0,)):
                        xx = x0 + w * U
                        pen.moveTo((xx, y0)); pen.lineTo((xx, y0 + U)); pen.lineTo((xx + U, y0 + U)); pen.lineTo((xx + U, y0)); pen.closePath()
        g = 'c%02x' % c; names.append(g); glyphs[g] = pen.glyph(); metrics[g] = ((tab[i + 1] - tab[i] + (1 if bold else 0)) * U, 0)
        u = ord(bytes([c]).decode('mac_roman')); cmap[u] = g
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
    fb = FontBuilder(gr * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * U, descent=-(gr - asc) * U)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'}); fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-(gr - asc) * U, usWinAscent=asc * U, usWinDescent=(gr - asc) * U); fb.setupPost()
    fb.save(os.path.join(OUT, fn)); print(fn, os.path.getsize(os.path.join(OUT, fn)))
