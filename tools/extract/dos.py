#!/usr/bin/env python3
"""Pull the art, sounds and text out of Spaceward Ho! 2.0 for DOS.

    python3 tools/extract/dos.py <folder with HO.PRS and HOCOLOR.PRS>

Writes assets/skins/dos/: sprites/*.png, sounds/*.wav, strings.json and
manifest.json. The DOS game keeps everything in "PRS" resource files:
a 48-byte header, then records of
    type[4]  id(u16)  name[18]  length(u32, includes this 28-byte header)  data
Pictures are ordinary Windows BMPs. IL8/IS8 are 32x32 and 16x16 colour
icons whose masks are the ILM/ISM icons in HO.PRS (white = solid). DIBs
(ship parts, title pictures) have no mask; their plain background
(white or black) is made see-through where it touches the edges.
SND records are [u16 3][u16 sample count][u16 sample rate] then 8-bit
unsigned samples. STR 0 holds every text string as
[u16 id] text NUL.
"""
import io, json, os, struct, sys, wave
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'dos')


def parse(path):
    d = open(path, 'rb').read()
    p, out = 0x30, []
    while p + 28 <= len(d):
        t = d[p:p + 4].rstrip(b'\0').decode('latin1')
        rid = struct.unpack('<H', d[p + 4:p + 6])[0]
        name = d[p + 6:p + 24].split(b'\0')[0].decode('latin1')
        ln = struct.unpack('<I', d[p + 24:p + 28])[0]
        if not t or ln < 28:
            break
        out.append((t, rid, name, d[p + 28:p + ln]))
        p += ln
    return out


def bmp(data):
    return Image.open(io.BytesIO(data))


def edges_clear(im, tol=14):
    """Make the background (the colour of the top-left pixel, white or
    black in these pictures) see-through where it touches the edges."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    br, bg_, bb, _ = px[0, 0]
    seen = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y][x]:
            continue
        seen[y][x] = True
        r, g, b, a = px[x, y]
        if abs(r - br) <= tol and abs(g - bg_) <= tol and abs(b - bb) <= tol:
            px[x, y] = (r, g, b, 0)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def main(src):
    mono = {(t, rid): data for t, rid, _, data in parse(os.path.join(src, 'HO.PRS'))}
    color = parse(os.path.join(src, 'HOCOLOR.PRS'))
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'sounds'), exist_ok=True)
    sprites = []
    for t, rid, _, data in color:
        if data[:2] != b'BM':
            continue
        im = bmp(data).convert('RGBA')
        if t in ('IL8', 'IS8'):
            m = mono.get(('ILM' if t == 'IL8' else 'ISM', rid))
            if m and m[:2] == b'BM':
                mask = bmp(m).convert('L').resize(im.size)
                im.putalpha(mask)
            key = ('i' if t == 'IL8' else 's') + str(rid)
        else:
            im = edges_clear(im)
            key = 'd' + str(rid)
        im.save(os.path.join(OUT, 'sprites', key + '.png'), optimize=True)
        sprites.append(key)
    sounds = []
    for (t, rid), data in mono.items():
        if t != 'SND':
            continue
        _, n, rate = struct.unpack('<HHH', data[:6])
        with wave.open(os.path.join(OUT, 'sounds', f'{rid}.wav'), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(1); w.setframerate(rate)
            w.writeframes(data[6:6 + n])
        sounds.append(rid)
    s = mono[('STR', 0)]
    p, strings = 0, {}
    while p + 2 < len(s):
        i = struct.unpack('<H', s[p:p + 2])[0]
        e = s.find(b'\0', p + 2)
        if e < 0:
            break
        strings[i] = s[p + 2:e].decode('cp437')
        p = e + 1
    json.dump(strings, open(os.path.join(OUT, 'strings.json'), 'w'), ensure_ascii=False, indent=0)
    json.dump({'sprites': sorted(sprites), 'sounds': sorted(sounds)}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites,', len(sounds), 'sounds,', len(strings), 'strings ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
