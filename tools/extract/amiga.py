#!/usr/bin/env python3
"""Pull the art, sounds and text out of Spaceward Ho! 2.0 for the Amiga.

    pip install pillow amitools
    xdftool "Disk 1 of 2.adf" unpack amiga/
    xdftool "Disk 2 of 2.adf" unpack amiga/
    python3 tools/extract/amiga.py amiga/

(Any way of copying the files off the two floppies works; the extractor
only needs image16.pff, sound.pff, texte.pff and p16.iff from disk 1 and
looks for them anywhere under the folder it is given.)

Writes assets/skins/amiga/: sprites/*.png, sounds/*.wav, strings.json
(German) and manifest.json.

The Amiga game (German, 1994) is the DOS 2.0 game with the same pictures
in the same order, so the sprites are written under the DOS skin's names
(see tools/extract/dos.py) and the Amiga skin can reuse the DOS skin's
code. Only the 16-colour pictures (image16.pff, for the original Amiga
chip set) are used: the 256-colour ones (image256.pff on disk 2, for AGA
machines) are the DOS pictures pixel for pixel.

A .pff file is Huffman-packed:
    "FORM" u32  "HUF" + kind (T text, I image, S sound)
    u32 (tree size + 8), then the code tree, pre-order, high bit first:
        1 = a leaf, followed by its 8-bit byte; 0 = a node, then its two
        children (0 branch first)
    "DIR" + kind, u32 size, offsets (not needed), then "DATT" u32 size
    records: u32 unpacked length, then that many coded bytes, padded to a
        whole byte
All numbers are big-endian. An image record is
    u32 0, u16 width, u16 height, u16 planes, 10 zero bytes,
    then each bitplane in turn, every row a whole number of 16-bit words.
Planes = 1 is a mask (1 = solid) for the colour icon 146 records later.
Colours come from p16.iff, a bare IFF CMAP chunk. A sound record is
signed 8-bit samples.
"""
import json, os, struct, sys, wave
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dos import edges_clear  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'amiga')

# record number -> DOS picture name, as runs (first record, name letter,
# first number, count): d = picture, i = 32x32 icon, s = 16x16 icon
RUNS = [
    (1, 'd', 1002, 1), (2, 'd', 12100, 24), (26, 'd', 12199, 26), (52, 'd', 12250, 8),
    (60, 'd', 12350, 30), (90, 'd', 12401, 26), (116, 'd', 12600, 24), (140, 'd', 12699, 26),
    (166, 'd', 12750, 11), (177, 'd', 12850, 30), (207, 'd', 12901, 26),
    (233, 'd', 3500, 1), (234, 'd', 3510, 1), (235, 'd', 5040, 1), (236, 'd', 5050, 1),
    (237, 'd', 3550, 1), (238, 'd', 3520, 1), (239, 'd', 500, 1), (240, 'd', 5000, 2),
    (242, 'd', 501, 1), (243, 'd', 5030, 1),
    (390, 'i', 201, 1), (391, 'i', 1000, 10), (401, 'i', 1500, 4), (405, 'i', 2000, 20),
    (425, 'i', 2500, 20), (445, 'i', 3000, 3), (448, 'i', 3010, 1), (449, 'i', 2499, 1),
    (450, 'i', 3020, 5), (455, 'i', 3030, 3), (458, 'i', 3040, 5), (463, 'i', 3050, 2),
    (465, 'i', 3100, 5), (470, 'i', 3110, 7),
    (477, 's', 1000, 10), (487, 's', 1500, 4), (491, 's', 2000, 20), (511, 's', 2500, 20),
    (531, 's', 3114, 1), (532, 's', 12000, 4),
    # the Amiga's own: the title picture (only in the 16-colour set; record
    # 0 of the 256-colour set is a spare mask), a "?" help picture, an
    # asterisk, the New World Computing bird and name
    (0, 'title', 0, 1), (536, 'a', 536, 1), (537, 'a', 537, 1), (538, 'a', 538, 1), (539, 'a', 539, 1),
]
MASK_GAP = 146
# sound record -> (DOS sound number, sample rate). The rates are the DOS
# ones; three sounds are stored at twice the DOS rate.
SOUNDS = [(6001, 22050), (1000, 22050), (2000, 22050), (6000, 22050), (3002, 22050),
          (4001, 22050), (3001, 11025), (6002, 22050), (5000, 22050), (7000, 22050),
          (3003, 22050), (2001, 22050), (3000, 11025), (4000, 22050)]


def name(i):
    for first, kind, num, n in RUNS:
        if first <= i < first + n:
            return kind if kind == 'title' else kind + str(num + i - first)
    return None


class Bits:
    def __init__(self, b, pos):
        self.b, self.p = b, pos

    def bit(self):
        v = (self.b[self.p >> 3] >> (7 - (self.p & 7))) & 1
        self.p += 1
        return v

    def byte(self):
        v = 0
        for _ in range(8):
            v = (v << 1) | self.bit()
        return v


def records(path):
    d = open(path, 'rb').read()
    br = Bits(d, 16 * 8)

    def node():
        return br.byte() if br.bit() else (node(), node())
    tree = node()
    di = d.find(b'DIR', 16)
    p = di + 8 + struct.unpack('>I', d[di + 4:di + 8])[0] + 4  # past "DATT" and its size
    out = []
    while p + 4 <= len(d):
        n = struct.unpack('>I', d[p:p + 4])[0]
        br = Bits(d, (p + 4) * 8)
        o = bytearray()
        try:
            for _ in range(n):
                x = tree
                while isinstance(x, tuple):
                    x = x[br.bit()]
                o.append(x)
        except IndexError:
            break
        out.append(bytes(o))
        p = (br.p + 7) // 8
    return out


def picture(r, pal):
    w, h, planes = struct.unpack('>HHH', r[4:10])
    rb = (w + 15) // 16 * 2
    px = r[20:]
    a = bytearray(w * h)
    for pl in range(planes):
        for y in range(h):
            row = px[(pl * h + y) * rb:(pl * h + y + 1) * rb]
            for x in range(w):
                if row[x >> 3] >> (7 - (x & 7)) & 1:
                    a[y * w + x] |= 1 << pl
    if planes == 1:
        return Image.frombytes('L', (w, h), bytes(255 if v else 0 for v in a))
    im = Image.frombytes('P', (w, h), bytes(a))
    im.putpalette(pal + bytes(768 - len(pal)))
    return im.convert('RGBA')


def find(src, fn):
    for dp, _, fs in os.walk(src):
        for f in fs:
            if f.lower() == fn:
                return os.path.join(dp, f)
    sys.exit('No %s under %s' % (fn, src))


def main(src):
    cm = open(find(src, 'p16.iff'), 'rb').read()
    c = cm.find(b'CMAP')
    pal = cm[c + 8:c + 8 + struct.unpack('>I', cm[c + 4:c + 8])[0]]
    recs = records(find(src, 'image16.pff'))
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'sounds'), exist_ok=True)
    sprites = []
    for i, r in enumerate(recs):
        key = name(i)
        if not key:
            continue
        im = picture(r, pal)
        if key[0] in 'is':
            im.putalpha(picture(recs[i - MASK_GAP], pal))
        elif key[0] == 'd' and key not in ('d1002', 'd5000', 'd5001'):
            im = edges_clear(im)
        im.save(os.path.join(OUT, 'sprites', key + '.png'), optimize=True)
        sprites.append(key)
    sounds = []
    for (sid, rate), r in zip(SOUNDS, records(find(src, 'sound.pff'))):
        with wave.open(os.path.join(OUT, 'sounds', '%d.wav' % sid), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(1); w.setframerate(rate)
            w.writeframes(bytes((b + 128) & 255 for b in r))  # WAV 8-bit is unsigned
        sounds.append(sid)
    strings = {i: s.rstrip(b'\0').decode('latin1') for i, s in enumerate(records(find(src, 'texte.pff')))}
    json.dump(strings, open(os.path.join(OUT, 'strings.json'), 'w'), ensure_ascii=False, indent=0)
    json.dump({'sprites': sorted(sprites), 'sounds': sorted(sounds)}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites,', len(sounds), 'sounds,', len(strings), 'strings ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
