#!/usr/bin/env python3
"""Set each glyph's left side-bearing (hmtx) to its ink's left edge (glyf xMin) in a TrueType font, in place.

The pixel fonts here are built square by square with fontTools' FontBuilder, which was given a side-bearing of 0 for every glyph. A
renderer places a glyph by its side-bearing, so any character whose ink starts in from its cell's left (the Mac's 1, one pixel in; many of
MS Sans Serif's and Fixedsys's) was pulled back to the left edge: "201 0" for "2010" (Jake, 20 Nov 2026; checked against shot 194 of Mac
4.0.5: with the side-bearings right the remake's pixels and the shot's are the same). Every font generator in tools/ calls fix() on what it
writes; this also mends the fonts already made:

    python3 tools/extract/fontlsb.py <font.ttf> ...   (needs fonttools)"""
import sys
from fontTools.ttLib import TTFont
def fix(path):
    t = TTFont(path); hm, gl, n = t['hmtx'], t['glyf'], 0
    for g in t.getGlyphOrder():
        gg = gl[g]
        if getattr(gg, 'numberOfContours', 0) == 0: continue
        gg.recalcBounds(gl)
        if hm[g][1] != gg.xMin: hm[g] = (hm[g][0], gg.xMin); n += 1
    t.save(path); return n
if __name__ == '__main__':
    for p in sys.argv[1:]: print(p, fix(p))
