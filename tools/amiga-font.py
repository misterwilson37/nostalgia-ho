#!/usr/bin/env python3
"""Build the Amiga skin's bitmap fonts (assets/fonts/HoAmiga-*.woff2).

The Amiga 2.0's windows are drawn in a 13-pixel proportional sans serif
(9-pixel capitals, 7-pixel x-height) and its totals in a smaller one,
emboldened the Amiga way (each row smeared one pixel to the right). The
X Window System's Adobe Helvetica bitmaps at 75 dpi, 12 and 10 pixels,
match them almost pixel for pixel (compared with the screenshots in
docs/amiga-skin.md), and are free to copy, change and pass on (the
notice is assets/fonts/LICENSE-HoAmiga.txt). Get them with

    apt-get download xfonts-75dpi pcf2bdf
    dpkg-deb -x xfonts-75dpi_*.deb x; dpkg-deb -x pcf2bdf_*.deb x
    for f in helvR12 helvR10; do
      gunzip -c x/usr/share/fonts/X11/75dpi/$f.pcf.gz > $f.pcf
      x/usr/bin/pcf2bdf -o $f.bdf $f.pcf
    done
    python3 tools/amiga-font.py helvR12.bdf helvR10.bdf

Each pixel becomes a square (HoAmiga-Regular, HoAmiga-Bold and the
10-pixel HoAmigaSmall-Regular), or a rectangle half as wide as it is tall
(HoAmigaTall-*, HoAmigaTallSmall-*), so the same CSS
font size (16 times the height of an Amiga pixel) draws the Amiga's
own pixels on a square screen or on an Amiga monitor's tall ones. The
fonts are renamed: they are not Helvetica, only its 1987 bitmaps.
"""
import os, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'fonts')
UNIT = 64          # one Amiga pixel's height in font units
EM = 16 * UNIT     # 16 pixels to the em: CSS font-size = 16 x the pixel height


def read_bdf(path):
    glyphs, cur, rows = {}, None, None
    for line in open(path, encoding='latin-1'):
        w = line.split()
        if not w:
            continue
        if w[0] == 'STARTCHAR':
            cur = {}
        elif w[0] == 'ENCODING':
            cur['code'] = int(w[1])
        elif w[0] == 'DWIDTH':
            cur['adv'] = int(w[1])
        elif w[0] == 'BBX':
            cur['bbx'] = tuple(int(v) for v in w[1:5])
        elif w[0] == 'BITMAP':
            rows = []
        elif w[0] == 'ENDCHAR':
            cur['rows'] = rows
            if cur.get('code', -1) >= 0:
                glyphs[cur['code']] = cur
            cur, rows = None, None
        elif rows is not None:
            rows.append(int(w[0], 16) << 0)
            cur.setdefault('rowbits', len(w[0]) * 4)
    return glyphs


def pixels(g, bold=False):
    """The glyph's set pixels as (x, y) with y up from the baseline."""
    bw, bh, bx, by = g['bbx']
    bits = g.get('rowbits', 8)
    out = set()
    for r, v in enumerate(g['rows']):
        y = by + bh - 1 - r
        for c in range(bw):
            if v >> (bits - 1 - c) & 1:
                out.add((bx + c, y))
                if bold:
                    out.add((bx + c + 1, y))
    return out


def rects(px):
    """Horizontal runs, merged down the rows where they repeat."""
    runs = {}
    for y in sorted({p[1] for p in px}):
        xs = sorted(x for x, yy in px if yy == y)
        row = []
        for x in xs:
            if row and row[-1][1] == x:
                row[-1][1] = x + 1
            else:
                row.append([x, x + 1])
        runs[y] = [tuple(r) for r in row]
    out, open_ = [], {}
    for y in sorted(runs):
        nxt = {}
        for r in runs[y]:
            if r in open_ and open_[r][1] == y - 1:
                nxt[r] = (open_[r][0], y)
            else:
                nxt[r] = (y, y)
        for r, span in open_.items():
            if r not in nxt or nxt[r][0] != span[0]:
                out.append((r[0], span[0], r[1], span[1] + 1))
        open_ = nxt
    for r, span in open_.items():
        out.append((r[0], span[0], r[1], span[1] + 1))
    return out


def build(src, name, style, xunit, bold):
    gl = read_bdf(src)
    order, cmap, widths, outlines = ['.notdef', 'space'], {32: 'space'}, {}, {}
    pen = TTGlyphPen(None); outlines['.notdef'] = pen.glyph(); widths['.notdef'] = (6 * xunit, 0)
    pen = TTGlyphPen(None); outlines['space'] = pen.glyph()
    widths['space'] = ((gl[32]['adv'] if 32 in gl else 4) * xunit, 0)
    for code, g in sorted(gl.items()):
        if code == 32 or code < 32 or 127 <= code < 160:
            continue
        gname = 'u%04X' % code
        px = pixels(g, bold)
        pen = TTGlyphPen(None)
        for x0, y0, x1, y1 in rects(px):
            pen.moveTo((x0 * xunit, y0 * UNIT)); pen.lineTo((x0 * xunit, y1 * UNIT))
            pen.lineTo((x1 * xunit, y1 * UNIT)); pen.lineTo((x1 * xunit, y0 * UNIT)); pen.closePath()
        outlines[gname] = pen.glyph()
        adv = g['adv'] + (1 if bold else 0)
        widths[gname] = (adv * xunit, min([x for x, _ in px], default=0) * xunit)
        order.append(gname); cmap[code] = gname
    fb = FontBuilder(EM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(outlines)
    fb.setupHorizontalMetrics(widths)
    asc, desc = 12 * UNIT, 4 * UNIT
    fb.setupHorizontalHeader(ascent=asc, descent=-desc)
    fam = name
    fb.setupNameTable({
        'familyName': fam, 'styleName': style,
        'uniqueFontIdentifier': f'{fam}-{style}', 'fullName': f'{fam} {style}', 'psName': f'{fam}-{style}',
        'version': 'Version 1.0',
        'copyright': 'Copyright 1984-1989, 1994 Adobe Systems Incorporated. Copyright 1988, 1994 Digital Equipment Corporation. '
                     'Converted from the X11 75 dpi bitmaps for the Spaceward Ho! web remake.',
        'licenseDescription': 'See LICENSE-HoAmiga.txt: permission to use, copy, modify, distribute and sell, with the notices kept.',
    })
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=-desc, sTypoLineGap=0, usWinAscent=asc, usWinDescent=desc,
                usWeightClass=700 if bold else 400, fsSelection=0x20 if bold else 0x40, achVendID='HOWR')
    fb.setupPost()
    fb.font['head'].macStyle = 1 if bold else 0
    path = os.path.join(OUT, f'{fam}-{style}.woff2')
    fb.font.flavor = 'woff2'
    fb.save(path)
    print(path, len(order), 'glyphs')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    r12, r10 = sys.argv[1], sys.argv[2]
    for fam, xu in (('HoAmiga', UNIT), ('HoAmigaTall', UNIT // 2)):
        build(r12, fam, 'Regular', xu, False)
        build(r10, fam, 'Bold', xu, True)
        build(r10, fam + 'Small', 'Regular', xu, False)  # the picture buttons' labels
