#!/usr/bin/env python3
"""The Mac's own Chicago 12 and Geneva 9, as web fonts, from a Mac System file (System 7.5.3's: the private repo's
originals/mac-system/System7_5_3.img: Chicago 12 from Fonts:Chicago NFNT 1025, Geneva 9 from the System file's FONT 393). The DOS program's copies (dospfn.py) store each character packed at the left of its cell; the
Mac's FONT resources place it by its offset/width table (the image at kernMax + offset, the advance its width), and some characters
sit in from the left: the digit 1 one pixel in (Jake's 4.0.5 shots 008, 194: "2010", "$100,000"). The Mac skins use these.

Writes assets/skins/dos/fonts/mac-chicago12.ttf ("Mac Chicago 12", font-size 15), mac-geneva9.ttf ("Mac Geneva 9", 12) and
mac-geneva9bold.ttf ("Mac Geneva 9 Bold", 12: QuickDraw's bold, the plain glyph drawn twice one pixel apart and the advance one wider;
the Geneva family has no bold 9-point bitmap: FOND 3's 9-point faces are plain, NFNT 1025, and italic, 1026).
One square per ink pixel, the cell the same as dospfn.py's.

    python3 tools/extract/macfonts.py <HFS image with a System file>      (needs fonttools, machfs, macresources)"""
import sys as _s, os as _o; _s.path.insert(0, _o.path.dirname(_o.path.abspath(__file__))); from fontlsb import fix as lsbfix  # (side-bearings = the ink's left edge: fontlsb.py)
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import importlib.util
spec = importlib.util.spec_from_file_location('mt', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'macturkish.py'))
src = open(spec.origin).read().split('\nimg = sys.argv[1]')[0]  # (its reader and parser only)
ns = {'__name__': 'mt', '__file__': spec.origin}; exec(compile(src, spec.origin, 'exec'), ns)
system_fonts = ns['system_fonts']
import struct
def parse(b):  # a FONT / NFNT resource (Inside Macintosh: Text 4-71): the offset/width table's place is owTLoc, with nDescent its high word
    ft, first, last, wmax, kern, nd, frw, h, owt, asc, desc, lead, rw = struct.unpack('>hhhhhhhhHhhhh', b[:26])
    if nd > 0: owt = (nd << 16) | owt
    b = b + b'\xff\xff' * 4  # (System 7.5's Geneva 9 ends its offset/width table without the last entry, the end marker)
    n = last - first + 3; bits = b[26:26 + rw * 2 * h]
    loc = struct.unpack('>%dH' % n, b[26 + rw * 2 * h:26 + rw * 2 * h + n * 2]); ow = struct.unpack('>%dH' % n, b[16 + owt * 2:16 + owt * 2 + n * 2])
    g = {}
    for c in range(first, last + 1):
        i = c - first
        if ow[i] == 0xFFFF: continue
        px = {(x - loc[i], y) for y in range(h) for x in range(loc[i], loc[i + 1]) if bits[y * rw * 2 + (x >> 3)] & (0x80 >> (x & 7))}
        g[c] = (px, (ow[i] >> 8) + kern, ow[i] & 255)
    return asc, h, g
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts')
def find_fonts(img):  # System 7.5's: Chicago 12 is the Fonts folder's Chicago suitcase (NFNT 1025, its only size), Geneva 9 the System file's FONT 393
    import machfs, macresources
    v = machfs.Volume(); v.read(open(img, 'rb').read())
    def walk(f, path=''):
        for n, x in f.items():
            if isinstance(x, machfs.Folder): yield from walk(x, path + n + ':')
            else: yield path + n, x
    out = {}
    for name, x in walk(v):
        if not x.rsrc: continue
        try: rs = {(r.type, r.id): bytes(r) for r in macresources.parse_file(x.rsrc)}
        except Exception: continue
        if name.endswith('Fonts:Chicago') and (b'NFNT', 1025) in rs: out[12] = rs[(b'NFNT', 1025)]
        if name.endswith('System Folder:System') and (b'FONT', 393) in rs: out[393] = rs[(b'FONT', 393)]
    if len(out) < 2: return system_fonts(img, [12, 393])  # (an older System file: both in it, as macturkish.py reads them)
    return out
fonts = find_fonts(sys.argv[1]); U = 100
for fn, fam, rid, bold in (('mac-chicago12.ttf', 'Mac Chicago 12', 12, False), ('mac-geneva9.ttf', 'Mac Geneva 9', 393, False), ('mac-geneva9bold.ttf', 'Mac Geneva 9 Bold', 393, True)):
    asc, h, g = parse(fonts[rid]); names = ['.notdef']; cmap, glyphs, metrics = {}, {}, {}
    for c in sorted(g):
        if c < 32 or c == 127: continue
        px, off, adv = g[c]; pen = TTGlyphPen(None)
        for (x, y) in sorted(px, key=lambda p: (p[1], p[0])):
            for w in ((0, 1) if bold else (0,)):
                x0 = (x + off + w) * U; y0 = (asc - 1 - y) * U
                pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
        u = ord(bytes([c]).decode('mac_roman')); nm = 'u%04X' % u
        if nm in glyphs: continue
        xs = [(x + off) * U for (x, y) in px]  # (the left side-bearing is the ink's left edge: a renderer puts the glyph by it, so 0 would pull every
        # character with an offset, the 1 among them, back to the cell's left)
        names.append(nm); glyphs[nm] = pen.glyph(); metrics[nm] = ((adv + (1 if bold else 0)) * U, min(xs) if xs else 0); cmap[u] = nm
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
    fb = FontBuilder(h * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * U, descent=-(h - asc) * U)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'}); fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-(h - asc) * U, usWinAscent=asc * U, usWinDescent=(h - asc) * U); fb.setupPost()
    fb.save(os.path.join(OUT, fn)); lsbfix(os.path.join(OUT, fn)); print(fn, os.path.getsize(os.path.join(OUT, fn)), 'ascent', asc, 'height', h)
