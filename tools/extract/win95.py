#!/usr/bin/env python3
"""Pull the art, sounds and text out of Spaceward Ho! 4.0.5 for Windows 95.

    pip install pefile pillow
    python3 tools/extract/win95.py <path to SPACEHO.EXE>

Writes assets/skins/w95/: sprites/b<id>.png, sounds/<name>.wav, strings.json
and manifest.json. Everything is inside SPACEHO.EXE as ordinary Windows
resources: BITMAPs (named by number), WAVE sounds (named by word) and a
STRINGTABLE.

Most colour pictures come with a separate black-and-white mask bitmap
(black = solid): a 32x32 icon N has its mask at N+3000, a 16x16 one at
N+7000, the message pictures 3100-3162 at N+14000. A mask is matched by
having the same size. Ship parts and explosions are drawn on black; that
black is made see-through where it touches the edges. Masks themselves
aren't written out.
"""
import io, json, os, struct, sys
from collections import deque
import pefile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'w95')


def dib(raw):
    """A BITMAP resource is a BMP file without its 14-byte file header."""
    hs = struct.unpack('<I', raw[:4])[0]
    bc = struct.unpack('<H', raw[14:16])[0]
    nc = struct.unpack('<I', raw[32:36])[0] if hs >= 40 else 0
    if bc <= 8 and not nc:
        nc = 1 << bc
    off = 14 + hs + 4 * nc
    return Image.open(io.BytesIO(b'BM' + struct.pack('<IHHI', 14 + len(raw), 0, 0, off) + raw))


def is_mask(im):
    cols = im.convert('RGB').getcolors(4)
    return cols is not None and all(c in ((0, 0, 0), (255, 255, 255)) for _, c in cols)


def edges_clear(im, tol=12):
    """Make the background colour (the top-left pixel's) see-through where it
    touches the edges."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    br, bg, bb, _ = px[0, 0]
    seen = [[False] * w for _ in range(h)]
    q = deque([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y][x]:
            continue
        seen[y][x] = True
        r, g, b, a = px[x, y]
        if abs(r - br) <= tol and abs(g - bg) <= tol and abs(b - bb) <= tol:
            px[x, y] = (r, g, b, 0)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


# drawn on black: ship parts, explosions and nova frames, the comet
ON_BLACK = [(2600, 2926), (7728, 7758), (7260, 7274), (114, 133), (3000, 3010)]


def main(exe):
    pe = pefile.PE(exe)
    data = pe.get_memory_mapped_image()
    bmps, waves, strings = {}, {}, {}
    for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        tn = str(t.name) if t.name else pefile.RESOURCE_TYPE.get(t.id, t.id)
        for e in t.directory.entries:
            for l in e.directory.entries:
                raw = data[l.data.struct.OffsetToData:l.data.struct.OffsetToData + l.data.struct.Size]
                if tn == 'RT_BITMAP' and e.id is not None:
                    bmps[e.id] = dib(raw)
                elif tn == 'WAVE':
                    waves[str(e.name).lower()] = raw
                elif tn == 'RT_STRING':
                    p = 0
                    for j in range(16):
                        n = struct.unpack('<H', raw[p:p + 2])[0]
                        s = raw[p + 2:p + 2 + 2 * n].decode('utf-16le')
                        p += 2 + 2 * n
                        if s:
                            strings[(e.id - 1) * 16 + j] = s
    # pair each picture with its mask
    masks = {}
    for i, im in bmps.items():
        for d in (3000, 7000, 14000):
            m = bmps.get(i + d)
            if m is not None and m.size == im.size and not is_mask(im) and is_mask(m):
                masks[i] = i + d
                break
    used_as_mask = set(masks.values())
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'sounds'), exist_ok=True)
    sprites = []
    for i, im in sorted(bmps.items()):
        if i in used_as_mask:
            continue
        im = im.convert('RGBA')
        if 2600 <= i <= 2926 and im.size == (48, 40):
            im = im.crop((0, 0, 40, 40))  # ship parts are 40x40; the rest is padding
        if i in masks:
            a = bmps[masks[i]].convert('L').point(lambda v: 255 if v < 128 else 0)
            im.putalpha(a)
        elif any(lo <= i <= hi for lo, hi in ON_BLACK):
            im = edges_clear(im)
        key = 'b%d' % i
        im.save(os.path.join(OUT, 'sprites', key + '.png'), optimize=True)
        sprites.append(key)
    for name, raw in waves.items():
        open(os.path.join(OUT, 'sounds', name + '.wav'), 'wb').write(raw)
    json.dump(strings, open(os.path.join(OUT, 'strings.json'), 'w'), ensure_ascii=False, indent=0)
    json.dump({'sprites': sprites, 'sounds': sorted(waves), 'masks': {str(k): v for k, v in sorted(masks.items())}},
              open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites (', len(masks), 'with masks ),', len(waves), 'sounds,', len(strings), 'strings ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
