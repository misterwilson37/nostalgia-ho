#!/usr/bin/env python3
"""Build the Amiga skin's bitmap fonts (assets/fonts/Ho*.woff2) from the
Amiga game's own fonts.

Spaceward Ho! 2.0 for the Amiga brings its own diskfonts in HO!1:fonts
(disk 1): HoFont (9, 11 and 13 pixels), HoBold (11) and HoCond (9). The
program opens exactly these five (ho!, FUN_001008ee: OpenDiskFont of the
TextAttrs at data+0x39c, +0x3b0 and +0x3c4; string 10 of texte.pff names
them: "HoFont 9, HoFont 11, HoFont 13, HoBold 11, HoCond 9"). Copy the
fonts folder off the disk (xdftool "Disk 1 of 2.adf" unpack amiga/) and run

    python3 tools/amiga-font.py amiga/HO!1/fonts

A diskfont size file (fonts/HoFont/13) is a hunk executable with one code
hunk: MOVEQ #-1,D0; RTS, then a DiskFontHeader (a Node, FileID 0x0f80,
Revision, Segment, Name[32]) and its TextFont: YSize, Style, Flags, XSize,
Baseline, BoldSmear, Accessors, LoChar, HiChar, CharData, Modulo, CharLoc,
CharSpace, CharKern (pointers relative to the hunk). CharData is one
bitmap YSize rows high, Modulo bytes a row; CharLoc gives each glyph's
bit offset and width; a glyph is drawn CharKern pixels right of the pen,
which then moves CharKern + CharSpace (graphics.library Text()).

Each Amiga pixel becomes a square (HoFont13, ...) or a rectangle half as
wide as it is tall (HoFont13Tall, ...: the Amiga monitor's tall pixels), so
the same CSS font size, 16 times the height of an Amiga pixel, draws the
Amiga's own pixels. Every font has the same ascent (12) and descent (4)
in those pixels, so a line box puts the baseline where the Amiga's Text()
would for the line's top.
"""
import os, struct, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'fonts')
UNIT = 64          # one Amiga pixel's height in font units
EM = 16 * UNIT     # 16 pixels to the em: CSS font-size = 16 x the pixel height
# the five fonts the program opens: (family, folder, size)
FONTS = [('HoFont13', 'HoFont', 13), ('HoFont11', 'HoFont', 11), ('HoFont9', 'HoFont', 9),
         ('HoBold11', 'HoBold', 11), ('HoCond9', 'HoCond', 9)]


def read_diskfont(path):
    """The glyphs of one diskfont size file: {code: (kern, space, rows)} and the baseline."""
    f = open(path, 'rb').read()
    L = lambda o: struct.unpack('>I', f[o:o + 4])[0]
    if L(0) != 0x3f3:
        raise ValueError(path + ': not a hunk file')
    o = 20 + 4 * L(8)
    if L(o) & 0x3fffffff != 0x3e9:
        raise ValueError(path + ': no code hunk')
    d = f[o + 8:o + 8 + L(o + 4) * 4]
    H = lambda o: struct.unpack('>H', d[o:o + 2])[0]
    h = lambda o: struct.unpack('>h', d[o:o + 2])[0]
    I = lambda o: struct.unpack('>I', d[o:o + 4])[0]
    if H(4 + 14) != 0x0f80:
        raise ValueError(path + ': not a diskfont')
    tf = 4 + 54
    ysize, base = H(tf + 20), H(tf + 26)
    xsize, lo, hi = H(tf + 24), d[tf + 32], d[tf + 33]
    cdata, mod, cloc, cspace, ckern = I(tf + 34), H(tf + 38), I(tf + 40), I(tf + 44), I(tf + 48)
    glyphs = {}
    for i in range(hi - lo + 1):
        off, w = struct.unpack('>HH', d[cloc + 4 * i:cloc + 4 * i + 4])
        space = h(cspace + 2 * i) if cspace else xsize
        kern = h(ckern + 2 * i) if ckern else 0
        rows = [[(d[cdata + y * mod + (off + x) // 8] >> (7 - (off + x) % 8)) & 1 for x in range(w)] for y in range(ysize)]
        glyphs[lo + i] = (kern, space, rows)
    return glyphs, base


def build(glyphs, base, fam, xunit):
    order, cmap, widths, outlines = ['.notdef'], {}, {}, {}
    outlines['.notdef'] = TTGlyphPen(None).glyph()
    widths['.notdef'] = (6 * xunit, 0)
    for code, (kern, space, rows) in sorted(glyphs.items()):
        if code < 32 or 127 <= code < 160:
            continue
        gname = 'space' if code == 32 else 'u%04X' % code
        pen = TTGlyphPen(None)
        left = None
        for r, row in enumerate(rows):
            y = base - r  # the baseline row sits just above the baseline
            x = 0
            while x < len(row):
                if not row[x]:
                    x += 1
                    continue
                x0 = x
                while x < len(row) and row[x]:
                    x += 1
                a, b = (kern + x0) * xunit, (kern + x) * xunit
                left = a if left is None else min(left, a)
                pen.moveTo((a, y * UNIT)); pen.lineTo((a, (y + 1) * UNIT))
                pen.lineTo((b, (y + 1) * UNIT)); pen.lineTo((b, y * UNIT)); pen.closePath()
        outlines[gname] = pen.glyph()
        widths[gname] = (max(0, kern + space) * xunit, left or 0)
        order.append(gname)
        cmap[code] = gname  # the Amiga's character set is ISO 8859-1
    fb = FontBuilder(EM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(outlines)
    fb.setupHorizontalMetrics(widths)
    asc, desc = 12 * UNIT, 4 * UNIT
    fb.setupHorizontalHeader(ascent=asc, descent=-desc)
    fb.setupNameTable({
        'familyName': fam, 'styleName': 'Regular',
        'uniqueFontIdentifier': fam, 'fullName': fam, 'psName': fam,
        'version': 'Version 1.0',
        'copyright': 'The Amiga fonts of Spaceward Ho! 2.0 (New World Computing / SOFTGOLD, 1994), '
                     'redrawn for the Spaceward Ho! web remake. See assets/fonts/README.txt.',
    })
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=-desc, sTypoLineGap=0, usWinAscent=asc, usWinDescent=desc,
                usWeightClass=400, fsSelection=0x40, achVendID='HOWR')
    fb.setupPost()
    path = os.path.join(OUT, fam + '.woff2')
    fb.font.flavor = 'woff2'
    fb.save(path)
    print(path, len(order), 'glyphs')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    for fam, folder, size in FONTS:
        glyphs, base = read_diskfont(os.path.join(sys.argv[1], folder, str(size)))
        build(glyphs, base, fam, UNIT)
        build(glyphs, base, fam + 'Tall', UNIT // 2)
