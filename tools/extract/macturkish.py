#!/usr/bin/env python3
"""The Turkish letters (Ğ ğ İ ı Ş ş) the Mac pixel fonts of the DOS program lack, from the Turkish Apple system disks (Mac OS 6.0.3, 7.1, ...):
their System files carry Chicago 12 (FONT/NFNT 12) and Geneva 9 (FONT 393 / NFNT 393) with the Mac Turkish letters at 0xDA..0xDF.
Writes assets/skins/dos/fonts/turkish-chicago12.ttf, turkish-geneva9.ttf, turkish-geneva9bold.ttf: six glyphs each, one square per ink pixel, in
the same cell as dospfn.py's fonts (font-size 15 / 12 / 12); the bold is QuickDraw's own (the plain glyph drawn twice, one pixel apart, the advance one wider).
js/os/pixel-fonts.css and system7.css add them to the families with unicode-range, so only these six letters come from them.

    python3 tools/extract/macturkish.py <System Tools.img of the 6.0.3 Turkish disk, or any Turkish HFS image with a System file>
    (needs fonttools, machfs, macresources: pip install fonttools machfs macresources)"""
import os, struct, sys
import machfs, macresources
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts')
TURKISH = {0xDA: 0x011E, 0xDB: 0x011F, 0xDC: 0x0130, 0xDD: 0x0131, 0xDE: 0x015E, 0xDF: 0x015F}  # Mac Turkish code -> Unicode
def walk(f):
    for n, x in f.items():
        if isinstance(x, machfs.Folder): yield from walk(x)
        else: yield x
def system_fonts(img, ids):
    v = machfs.Volume(); v.read(open(img, 'rb').read())
    for x in walk(v):
        if not x.rsrc: continue
        try: rs = {(r.type, r.id): bytes(r) for r in macresources.parse_file(x.rsrc)}
        except Exception: continue
        for t in (b'FONT', b'NFNT'):
            if all((t, i) in rs for i in ids): return {i: rs[(t, i)] for i in ids}
    sys.exit('no System file with fonts %s in %s' % (ids, img))
def parse(b):  # a FONT / NFNT resource: header, strike, location table, offset/width table
    ft, first, last, wmax, kern, nd, frw, h, owt, asc, desc, lead, rw = struct.unpack('>hhhhhhhhHhhhh', b[:26])
    n = last - first + 3; bits = b[26:26 + rw * 2 * h]
    loc = struct.unpack('>%dH' % n, b[26 + rw * 2 * h:26 + rw * 2 * h + n * 2]); ow = struct.unpack('>%dH' % n, b[16 + owt * 2:16 + owt * 2 + n * 2])
    g = {}
    for c in range(first, last + 1):
        i = c - first
        if ow[i] == 0xFFFF: continue
        px = {(x - loc[i], y) for y in range(h) for x in range(loc[i], loc[i + 1]) if bits[y * rw * 2 + (x >> 3)] & (0x80 >> (x & 7))}
        g[c] = (px, (ow[i] >> 8) + kern, ow[i] & 255)
    return asc, h, g
img = sys.argv[1]; fonts = system_fonts(img, [12, 393])
U = 100
for fn, fam, rid, bold in (('turkish-chicago12.ttf', 'DOS Chicago 12 Turkish', 12, False), ('turkish-geneva9.ttf', 'DOS Geneva 9 Turkish', 393, False), ('turkish-geneva9bold.ttf', 'DOS Geneva 9 Bold Turkish', 393, True)):
    asc, h, g = parse(fonts[rid]); names = ['.notdef']; cmap, glyphs, metrics = {}, {}, {}
    for c, u in TURKISH.items():
        px, off, adv = g[c]; pen = TTGlyphPen(None)
        for (x, y) in sorted(px, key=lambda p: (p[1], p[0])):
            for w in ((0, 1) if bold else (0,)):
                x0 = (x + off + w) * U; y0 = (asc - 1 - y) * U
                pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
        nm = 'u%04X' % u; names.append(nm); glyphs[nm] = pen.glyph(); metrics[nm] = ((adv + (1 if bold else 0)) * U, 0); cmap[u] = nm
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
    fb = FontBuilder(h * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * U, descent=-(h - asc) * U)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'}); fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-(h - asc) * U, usWinAscent=asc * U, usWinDescent=(h - asc) * U); fb.setupPost()
    fb.save(os.path.join(OUT, fn)); print(fn, os.path.getsize(os.path.join(OUT, fn)))
