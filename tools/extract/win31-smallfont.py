#!/usr/bin/env python3
"""Windows 3.1's "Small Fonts" 6 point (SMALLE.FON, the VGA resolution's), as a JS glyph table for the Windows 3.1 look's battle window
(js/skins/dos/win31/smallfont.js). WINHO.EXE writes the battle groups' words in it: Jake's win20-jake-vga16-shot0013.png, "one Magellan (1/1)
Scout", 171 of its 173 pixels and none more (docs/status-win31.md). Read straight from the .FON's FNT resource (no font tools needed); the six
Turkish letters from the Turkish Windows 3.11's SMALLE.FON at their Windows-1254 places, as tools/extract/winfon.py does for the other fonts.

    python3 -I tools/extract/win31-smallfont.py <folder with win31-fon and win31-turkish-fon> [--ttf]     (the private repo's originals/fonts/windows)
"""
import json
import os
import struct
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'js', 'skins', 'dos', 'win31', 'smallfont.js')
TURKISH = {0xD0: 0x011E, 0xF0: 0x011F, 0xDD: 0x0130, 0xFD: 0x0131, 0xDE: 0x015E, 0xFE: 0x015F}  # Windows-1254 -> Unicode


def fnts(path):
    d = open(path, 'rb').read()
    ne = struct.unpack_from('<I', d, 0x3c)[0]
    rt = ne + struct.unpack_from('<H', d, ne + 0x24)[0]
    sh = struct.unpack_from('<H', d, rt)[0]
    p = rt + 2
    while True:
        t = struct.unpack_from('<H', d, p)[0]
        if t == 0:
            break
        n = struct.unpack_from('<H', d, p + 2)[0]
        p += 8
        for _ in range(n):
            off, ln, _fl, _rid = struct.unpack_from('<HHHH', d, p)
            p += 12
            if t == 0x8008:
                yield d[off << sh:(off << sh) + (ln << sh)]


def parse(b):
    ver = struct.unpack_from('<H', b, 0)[0]
    pts, asc = struct.unpack_from('<H', b, 68)[0], struct.unpack_from('<H', b, 74)[0]
    h = struct.unpack_from('<H', b, 88)[0]
    first, last = b[95], b[96]
    face = b[struct.unpack_from('<I', b, 105)[0]:].split(b'\0')[0].decode('latin-1')
    hdr = 118 if ver == 0x200 else 148
    glyphs = {}
    for i in range(last - first + 1):
        if ver == 0x200:
            w, o = struct.unpack_from('<HH', b, hdr + 4 * i)
        else:
            w, o = struct.unpack_from('<HI', b, hdr + 6 * i)
        rows = []
        for y in range(h):
            m = 0
            for x in range(w):
                if (b[o + (x // 8) * h + y] >> (7 - x % 8)) & 1:
                    m |= 1 << x
            rows.append(m)
        glyphs[first + i] = (w, rows)
    return dict(face=face, pts=pts, asc=asc, h=h, glyphs=glyphs)


def pick(path, pts):
    for b in fnts(path):
        f = parse(b)
        if f['face'] == 'Small Fonts' and f['pts'] == pts:
            return f
    sys.exit('no Small Fonts %d pt in %s' % (pts, path))


def main(src):
    f = pick(os.path.join(src, 'win31-fon', 'smalle.fon'), 6)
    tr = pick(os.path.join(src, 'win31-turkish-fon', 'smalle.fon'), 6)
    table = {}
    for cp, (w, rows) in f['glyphs'].items():
        if cp in TURKISH:
            continue
        ch = bytes([cp]).decode('cp1252', 'ignore')
        if ch:
            table[ch] = [w] + rows
    for cp, u in TURKISH.items():
        w, rows = tr['glyphs'][cp]
        table[chr(u)] = [w] + rows
    with open(OUT, 'w') as o:
        o.write('// Spaceward Ho! web remake: Windows 3.1\'s "Small Fonts" 6 point (SMALLE.FON), the face WINHO.EXE writes the battle groups\' words in.\n')
        o.write('// Made by tools/extract/win31-smallfont.py from Windows 3.1\'s setup disks (the Turkish letters from the Turkish Windows 3.11\'s); do not edit.\n')
        o.write('// g[character] = [advance, row 0 bits, row 1 bits, ...]: bit x is the pixel x from the left; h rows, the baseline under row asc - 1.\n')
        o.write('(function (root) {\n\'use strict\';\nconst W = root.HOWIN31 = root.HOWIN31 || {};\n')
        o.write('W.smallFont = { h: %d, asc: %d, g: %s };\n' % (f['h'], f['asc'], json.dumps(table, ensure_ascii=True, separators=(',', ':'))))
        o.write('''// W.smallText(ctx, text, x, y, colour, align): the words with their baseline at y, left of x (or centred on it, or ending at it), whole pixels in the
// context's own units; a character the font lacks is drawn as the font's own default (its "?"). Returns the width.
W.smallText = function (x, text, h, v, colour, align) {
  const F = W.smallFont, s = String(text), gl = (c) => F.g[c] || F.g['?'];
  let wsum = 0; for (const c of s) wsum += gl(c)[0];
  let px = Math.round(align === 'center' ? h - wsum / 2 : align === 'right' ? h - wsum : h);
  const top = Math.round(v) - F.asc;
  x.fillStyle = colour;
  for (const c of s) {
    const g = gl(c);
    for (let r = 0; r < F.h; r++) { const m = g[r + 1]; if (!m) continue; for (let b = 0; b < g[0]; b++) if (m & (1 << b)) { let e = b; while (e + 1 < g[0] && (m & (1 << (e + 1)))) e++; x.fillRect(px + b, top + r, e - b + 1, 1); b = e; } }
    px += g[0];
  }
  return wsum;
};
})(typeof window !== 'undefined' ? window : globalThis);
''')
    print(OUT, len(table), 'characters')
    # --ttf: the same glyphs as a web font too (tools/extract/ttf_pixels.py; font-size 10px = 1:1), for text the page draws with a CSS font. Checked in Chromium:
    # 218 of its 219 characters pixel for pixel as the table (the soft hyphen, which browsers do not draw, apart). Not used by the page today: the map's star names
    # go through T.mapName and W.smallText instead (whole pixels).
    if '--ttf' not in sys.argv:
        return
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import ttf_pixels
    ttf = os.path.join(ROOT, 'assets', 'skins', 'dos', 'fonts', 'win31-smallfonts6.ttf')
    print(ttf, ttf_pixels.write(ttf, 'Win31 Small Fonts', {c: (v[0], v[1:]) for c, v in table.items()}, f['h'], f['asc']), 'bytes')


if __name__ == '__main__':
    main([a for a in sys.argv[1:] if not a.startswith('--')][0])
