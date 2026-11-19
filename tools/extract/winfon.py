#!/usr/bin/env python3
"""Web fonts from Windows' own bitmap fonts (.FON), taken from Windows 3.1 and Windows 95 setup disks: MS Sans Serif 8 (regular, and bold as GDI drew it:
the glyph twice, one pixel apart), the "System" font (Windows 3.1's title bars and menus, VGASYS.FON) and Fixedsys (VGAFIX.FON). One square per ink pixel, the cell
the pixel height of the face (11 for MS Sans Serif 8, 13 for System): font-size = that many px for 1:1.
The six Turkish letters (G-breve, dotted I, dotless i, S-cedilla), which these Western fonts lack, are taken from the Turkish Windows 3.11's own fonts (win31-turkish-fon:
the same fonts with those six letters at their Windows-1254 places), so Turkish text is drawn as it was on a Turkish Windows.

    python3 tools/extract/winfon.py <folder with win31-fon, win95-fon and win31-turkish-fon>     (the private repo's originals/fonts/windows)
    python3 tools/extract/winfon.py <that folder> <folder with PalmOS-CP1252.FON>   (also writes assets/skins/palm/fonts/palmos*.ttf)
    pip install fonttools; pip install --no-deps monobit

Writes assets/skins/w95/fonts/mssansserif8[-bold].ttf (Windows 95's) and assets/skins/dos/fonts/win31-{mssansserif8,mssansserif8-bold,system,fixedsys}.ttf."""
import os, sys
import monobit
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1]; U = 100
def load(fon, pt):
    for f in monobit.load(os.path.join(SRC, fon)):
        if f.point_size == pt: return f
    sys.exit('no %s pt in %s' % (pt, fon))
def glyphs_of(face):  # code -> (set of (x, y) with y up from the baseline, advance)
    out = {}
    for cp in range(32, 256):
        try: g = face.get_glyph(codepoint=cp)
        except KeyError: continue
        px = {(x + g.left_bearing, g.shift_up + g.height - 1 - y) for y, r in enumerate(g.as_matrix()) for x, v in enumerate(r) if v}
        out[cp] = (px, g.advance_width)
    return out
def box(p): return (min(x for x, y in p), max(x for x, y in p), min(y for x, y in p), max(y for x, y in p))
def centre(p): b = box(p); return (b[0] + b[1]) / 2
TURKISH = {0xD0: 0x011E, 0xF0: 0x011F, 0xDD: 0x0130, 0xFD: 0x0131, 0xDE: 0x015E, 0xFE: 0x015F}  # Windows-1254 slots of the Turkish fonts -> Unicode
def turkish(trface):  # the six letters as the Turkish Windows 3.11's own fonts draw them
    g = glyphs_of(trface); return {u: g[cp] for cp, u in TURKISH.items()}
def save(path, fam, face, bold, trface=None):
    g = glyphs_of(face); tr = turkish(trface) if trface else {}
    cmap, glyphs, metrics, names = {}, {}, {}, ['.notdef']
    items = [(bytes([cp]).decode('cp1252', 'ignore'), v) for cp, v in g.items() if not (trface and cp in TURKISH)] + [(chr(u), v) for u, v in tr.items()]
    asc, desc = face.ascent, face.descent
    for ch, (px, adv) in items:
        if not ch or ch in cmap.values(): continue
        pen = TTGlyphPen(None)
        for (x, y) in sorted(px, key=lambda p: (-p[1], p[0])):
            for w in ((0, 1) if bold else (0,)):
                x0, y0 = (x + w) * U, y * U
                pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
        nm = 'u%04X' % ord(ch); names.append(nm); glyphs[nm] = pen.glyph(); metrics[nm] = ((adv + (1 if bold else 0)) * U, 0); cmap[ord(ch)] = nm
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
    fb = FontBuilder((asc + desc) * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * U, descent=-desc * U)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Bold' if bold else 'Regular'}); fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-desc * U, usWinAscent=asc * U, usWinDescent=desc * U); fb.setupPost()
    os.makedirs(os.path.dirname(path), exist_ok=True); fb.save(path); print(os.path.relpath(path, ROOT), os.path.getsize(path), 'cell', asc + desc)
W95 = os.path.join(ROOT, 'assets', 'skins', 'w95', 'fonts'); DOS = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts')
t = lambda fon, pt: load("win31-turkish-fon/" + fon, pt)
s95 = load('win95-fon/sserife.fon', 8); s31 = load('win31-fon/sserife.fon', 8)
save(os.path.join(W95, 'mssansserif8.ttf'), 'Win95 MS Sans Serif 8', s95, False, t('sserife.fon', 8)); save(os.path.join(W95, 'mssansserif8-bold.ttf'), 'Win95 MS Sans Serif 8 Bold', s95, True, t('sserife.fon', 8))
save(os.path.join(DOS, 'win31-mssansserif8.ttf'), 'Win31 MS Sans Serif 8', s31, False, t('sserife.fon', 8)); save(os.path.join(DOS, 'win31-mssansserif8-bold.ttf'), 'Win31 MS Sans Serif 8 Bold', s31, True, t('sserife.fon', 8))
save(os.path.join(DOS, 'win31-system.ttf'), 'Win31 System', load('win31-fon/vgasys.fon', 10), False, t('vgasys.fon', 10))
save(os.path.join(DOS, 'win31-fixedsys.ttf'), 'Win31 Fixedsys', load('win31-fon/vgafix.fon', 12), False, t('vgafix.fon', 12))

# Palm OS's fonts (a Windows .FON of the Palm OS fonts, CP1252): the standard (11 px) and bold (11 px) faces; no Turkish letters in them
if len(sys.argv) > 2:
    PALM = os.path.join(ROOT, 'assets', 'skins', 'palm', 'fonts'); fon = os.path.join(sys.argv[2], 'PalmOS-CP1252.FON')
    faces = {(f.point_size, f.weight): f for f in monobit.load(fon)}
    save(os.path.join(PALM, 'palmos.ttf'), 'Palm OS', faces[(8, 'regular')], False)
    save(os.path.join(PALM, 'palmos-bold.ttf'), 'Palm OS Bold', faces[(8, 'bold')], False)

# Palm OS's Turkish letters, from the Turkish Interpilot language database (Interpilot 2.5 by Sergey Menshikov, a Palm localisation add-on, long discontinued, files free to download
# from sergem.net): its FONT resources 0 (standard) and 1 (bold) carry Palm's Latin set with the six Turkish letters at the Windows-1254 places. Only those six are taken, as
# palmos-turkish.ttf and palmos-bold-turkish.ttf (the Palm OS look adds them by unicode-range).
#     python3 tools/extract/winfon.py <fonts/windows> <fonts/palm FON folder> <turkish-win-25.prc>
if len(sys.argv) > 3:
    import struct
    d = open(sys.argv[3], 'rb').read(); n = struct.unpack('>H', d[76:78])[0]; ents = [struct.unpack('>4sHI', d[78 + 10 * i:88 + 10 * i]) for i in range(n)]
    res = {i: d[o:(ents[k + 1][2] if k + 1 < n else len(d))] for k, (t, i, o) in enumerate(ents) if t == b'FONT'}
    def palmfont(b):  # a Palm FONT resource: the Mac FONT layout (header, strike, location table, offset/width table)
        ft, first, last, wmax, kern, nd, frw, h, owt, asc, desc, lead, rw = struct.unpack('>hhhhhhhhHhhhh', b[:26]); m = last - first + 3
        bits = b[26:26 + rw * 2 * h]; loc = struct.unpack('>%dH' % m, b[26 + rw * 2 * h:26 + rw * 2 * h + m * 2]); ow = struct.unpack('>%dH' % m, b[16 + owt * 2:16 + owt * 2 + m * 2])
        g = {}
        for c in range(first, last + 1):
            i = c - first
            if ow[i] == 0xFFFF: continue
            px = {(x - loc[i] + (ow[i] >> 8) + kern, asc - 1 - y) for y in range(h) for x in range(loc[i], loc[i + 1]) if bits[y * rw * 2 + (x >> 3)] & (0x80 >> (x & 7))}
            g[c] = (px, ow[i] & 255)
        return asc, desc, g
    for fid, fn, fam in ((0, 'palmos-turkish.ttf', 'Palm OS Turkish'), (1, 'palmos-bold-turkish.ttf', 'Palm OS Bold Turkish')):
        asc, desc, g = palmfont(res[fid]); cmap, glyphs, metrics, names = {}, {}, {}, ['.notdef']
        for cp, uni in TURKISH.items():
            px, adv = g[cp]; pen = TTGlyphPen(None)
            for (x, y) in sorted(px, key=lambda p: (-p[1], p[0])):
                x0, y0 = x * U, y * U; pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
            nm = 'u%04X' % uni; names.append(nm); glyphs[nm] = pen.glyph(); metrics[nm] = (adv * U, 0); cmap[uni] = nm
        pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
        fb = FontBuilder((asc + desc) * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
        fb.setupHorizontalHeader(ascent=asc * U, descent=-desc * U); fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'})
        fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-desc * U, usWinAscent=asc * U, usWinDescent=desc * U); fb.setupPost(); fb.save(os.path.join(PALM, fn)); print(fn, os.path.getsize(os.path.join(PALM, fn)))
