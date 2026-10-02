#!/usr/bin/env python3
"""Pull the art out of Spaceward Ho! 5 for Palm OS (MobileFreon, 2003).

    pip install pillow
    python3 tools/extract/palm.py "Spaceward Ho.prc"

Writes assets/skins/palm/: sprites/b<id>.png and manifest.json. The Palm
game has no sampled sounds (its release notes list them as missing), so
there are none to extract.

A .prc is a Palm resource database: a 78-byte header (name, attributes,
type "appl", creator "PaHo", ...), a u16 count, then entries of
type[4] id(u16) offset(u32); each resource runs to the next one's offset.
The pictures are Tbmp resources: "bitmap families", one bitmap per colour
depth and screen density, each pointing to the next. Each bitmap:
    width height rowBytes flags(u16) pixelSize version ...
    version 2: next(u16, in 4-byte words) transparentIndex compressionType
               reserved(u16), then (if compressed) a u16 size, the pixels
    version 3: headerSize pixelFormat unused compressionType density(u16)
               transparentValue(u32) next(u32), then a u32 size, the pixels
    (a version-1 bitmap of pixel size 255 is a 16-byte placeholder that
     separates the low-density bitmaps from the high-density ones)
flags: 0x8000 compressed, 0x4000 has its own colour table, 0x2000 has a
transparent colour. Compression: 0 scanline (per row, a byte of flags for
each 8 bytes saying which differ from the row above), 1 RLE (count, byte),
2 PackBits. 8-bit pixels index the Palm OS system palette: 6x6x6 colours,
the first 108 with blue FF, CC or 99 and the rest with 66, 33 or 00 (red
outermost, green innermost), then ten greys and five extra colours.
The best bitmap of each family is saved: double density (320x320
screens) where there is one, else the 160x160 one.
"""
import json, os, struct, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'palm')


def prc(path):
    d = open(path, 'rb').read()
    n = struct.unpack('>H', d[76:78])[0]
    ents = [struct.unpack('>4sHI', d[78 + 10 * i:88 + 10 * i]) for i in range(n)]
    res = {}
    for i, (t, rid, off) in enumerate(ents):
        end = ents[i + 1][2] if i + 1 < n else len(d)
        res[(t.decode('latin1'), rid)] = d[off:end]
    return res


def palette():
    v = [0xFF, 0xCC, 0x99, 0x66, 0x33, 0x00]
    pal = [(r, g, b) for half in (v[:3], v[3:]) for r in v for b in half for g in v]
    pal += [(x, x, x) for x in (0x11, 0x22, 0x44, 0x55, 0x77, 0x88, 0xAA, 0xBB, 0xDD, 0xEE)]
    pal += [(0xC0, 0xC0, 0xC0), (0x80, 0, 0), (0x80, 0, 0x80), (0, 0x80, 0), (0, 0x80, 0x80)]
    return pal + [(0, 0, 0)] * (256 - len(pal))


PAL = palette()


def unpack(d, p, comp, rb, h):
    n, out = rb * h, bytearray()
    if comp == 0:  # scanline
        prev = bytearray(rb)
        for y in range(h):
            row = bytearray(prev)
            for x in range(0, rb, 8):
                f = d[p]; p += 1
                for k in range(min(8, rb - x)):
                    if f & (0x80 >> k):
                        row[x + k] = d[p]; p += 1
            out += row; prev = row
    elif comp == 1:  # RLE
        while len(out) < n:
            out += bytes([d[p + 1]]) * d[p]; p += 2
    elif comp == 2:  # PackBits
        while len(out) < n:
            f = d[p]; p += 1
            if f >= 128:
                out += d[p:p + 1] * (257 - f); p += 1
            else:
                out += d[p:p + f + 1]; p += f + 1
    else:
        raise ValueError('compression %d' % comp)
    return bytes(out[:n])


def bitmap(d, o):
    w, h, rb, fl = struct.unpack('>hhHH', d[o:o + 8])
    ps, ver = d[o + 8], d[o + 9]
    if ver == 3:
        p, comp = o + d[o + 10], d[o + 13]
        dens = struct.unpack('>H', d[o + 14:o + 16])[0]
        trans = struct.unpack('>I', d[o + 16:o + 20])[0]
    else:
        p, comp, dens, trans = o + 16, d[o + 13] if ver >= 2 else 0, 72, d[o + 12] if ver >= 2 else None
    pal = PAL
    if fl & 0x4000:
        n = struct.unpack('>H', d[p:p + 2])[0]; p += 2
        pal = list(PAL)
        for k in range(n):
            pal[k] = tuple(d[p + 1:p + 4]); p += 4
    if fl & 0x8000:
        p += 4 if ver == 3 else 2
        px = unpack(d, p, comp, rb, h)
    else:
        px = d[p:p + rb * h]
    out = bytearray()
    for y in range(h):
        row = px[y * rb:(y + 1) * rb]
        for x in range(w):
            if ps == 8:
                v = row[x]; c = pal[v]
            elif ps == 16:
                v = row[2 * x] << 8 | row[2 * x + 1]
                c = ((v >> 11 & 31) * 255 // 31, (v >> 5 & 63) * 255 // 63, (v & 31) * 255 // 31)
            else:  # 1, 2 or 4-bit grey
                v = row[x * ps // 8] >> (8 - ps - x * ps % 8) & ((1 << ps) - 1)
                g = 255 - v * 255 // ((1 << ps) - 1); c = (g, g, g)
            a = 0 if fl & 0x2000 and trans is not None and v == trans else 255
            out += bytes(c) + bytes([a])
    return Image.frombytes('RGBA', (w, h), bytes(out)), ps, dens


def family(d):
    o, res = 0, []
    while o < len(d):
        ps, ver = d[o + 8], d[o + 9]
        if ver == 1 and ps == 255:
            o += 16
            continue
        res.append(bitmap(d, o))
        nxt = struct.unpack('>I', d[o + 20:o + 24])[0] if ver == 3 else struct.unpack('>H', d[o + 10:o + 12])[0] * 4
        if not nxt:
            break
        o += nxt
    return res


def main(src):
    res = prc(src)
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    sprites = []
    for (t, i), d in sorted(res.items()):
        if t != 'Tbmp':
            continue
        im = max(family(d), key=lambda b: (b[2], b[1]))[0]
        key = 'b%d' % i
        im.save(os.path.join(OUT, 'sprites', key + '.png'), optimize=True)
        sprites.append(key)
    json.dump({'sprites': sprites, 'sounds': []}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
