#!/usr/bin/env python3
"""The few symbols the Mac pixel fonts (Chicago 12, Geneva 9) and the DOS 8x14 lack, drawn in pixels at the fonts' own scale, so no look falls back to a smoothed face for them:
U+2212 minus (the font's own hyphen), U+00D7 multiplication sign and U+2715 (a small X), the solid triangles U+25B2 U+25BC U+25C2 U+25B8 and U+25C0 U+25B6.
Writes assets/skins/dos/fonts/extras-{chicago12,geneva9,geneva9bold,bios}.ttf; js/os/pixel-fonts.css and system7.css add them by unicode-range.
(The fan fonts ChiKareGo2 and FindersKeepers by Giles Booth, CC BY, in the private repo, add only a multiplication sign for these: not used.)   pip install fonttools"""
import os
from fontTools.ttLib import TTFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import RecordingPen
D = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'assets', 'skins', 'dos', 'fonts'); U = 100
def pixels(font, ch):  # the ink pixels of a glyph of one of the square-per-pixel fonts
    f = TTFont(os.path.join(D, font)); pen = RecordingPen(); f.getGlyphSet()[f.getBestCmap()[ord(ch)]].draw(pen); out = set(); cur = []
    for op, a in pen.value:
        if op == 'moveTo': cur = [a[0]]
        elif op == 'lineTo': cur.append(a[0])
        elif op in ('closePath', 'endPath') and cur:
            xs = [p[0] for p in cur]; ys = [p[1] for p in cur]; out |= {(x, y) for x in range(min(xs) // U, max(xs) // U) for y in range(min(ys) // U, max(ys) // U)}; cur = []
    return out, f['hmtx'][f.getBestCmap()[ord(ch)]][0] // U, f
def tri(k, up):  # a solid isosceles triangle, base 2k+1, height k+1, apex up or down
    return {(x, y if up else k - y) for y in range(k + 1) for x in range(k - y, k + y + 1)}
def side(k, right):  # pointing left / right
    return {(x if right else k - x, y) for x in range(k + 1) for y in range(k - x, k + x + 1)}
def shape(px, dx=0, dy=0): return {(x + dx, y + dy) for x, y in px}
def build(name, base, asc, desc, k, xh):  # xh: the font's x-height in pixels, where the symbols sit
    hy, hadv, f = pixels(base, '-'); g = {}
    cross = {(i, i) for i in range(5)} | {(i, 4 - i) for i in range(5)}
    g[0x2212] = (hy, hadv); g[0xD7] = (shape(cross, 0, max(0, (xh - 5) // 2 + 0)), 7); g[0x2715] = (shape(cross, 0, max(0, (xh - 5) // 2)), 7)
    t = tri(k, True); w = 2 * k + 1; g[0x25B2] = (shape(t, 0, 0), w + 2); g[0x25BC] = (shape(tri(k, False), 0, 0), w + 2)
    s = side(k, False); g[0x25C2] = (s, k + 3); g[0x25C0] = (s, k + 3); r = side(k, True); g[0x25B8] = (r, k + 3); g[0x25B6] = (r, k + 3)
    cmap, glyphs, metrics, names = {}, {}, {}, ['.notdef']
    for u, (px, adv) in g.items():
        pen = TTGlyphPen(None)
        for (x, y) in sorted(px, key=lambda p: (-p[1], p[0])):
            x0, y0 = x * U, y * U; pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
        nm = 'u%04X' % u; names.append(nm); glyphs[nm] = pen.glyph(); metrics[nm] = (adv * U, 0); cmap[u] = nm
    pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (6 * U, 0)
    fb = FontBuilder((asc + desc) * U, isTTF=True); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap); fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * U, descent=-desc * U); fb.setupNameTable({'familyName': name, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=asc * U, sTypoDescender=-desc * U, usWinAscent=asc * U, usWinDescent=desc * U); fb.setupPost()
    fb.save(os.path.join(D, 'extras-' + name + '.ttf')); print('extras-' + name + '.ttf')
# (name, base font, ascent, descent, triangle size, x-height)
build('chicago12', 'chicago12.ttf', 12, 3, 3, 7); build('geneva9', 'geneva9.ttf', 10, 2, 3, 5); build('geneva9bold', 'geneva9bold.ttf', 10, 2, 3, 5)
bf = TTFont(os.path.join(D, 'bios8x14.ttf')); build('bios', 'bios8x14.ttf', bf['hhea'].ascent // U, -bf['hhea'].descent // U, 3, 7)
