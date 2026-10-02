#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! 3.0.1 for the Macintosh.

    pip install machfs pillow
    python3 tools/extract/mac3.py <SpacewardHo301.img>

The .img is the floppy (an HFS disk image) with the program on it; a raw
resource fork of the program (for example one saved from an emulator)
works too. Writes assets/skins/mac3/: sprites/*.png, sounds/*.wav and
manifest.json.

3.0.1 is black and white: its pictures are 1-bit. (It also read colour
pictures from a separate file, "Ho! 3.0 Color Picts", which isn't on the
floppy; the DOS version's colour art has the same numbers, so those are
very likely the same pictures.) Everything is an ordinary Mac resource:
    ICN# n -> i<n>  32x32 icons with their masks (planets, faces, report
                    pictures), numbered like the DOS game's colour icons
    ics# n -> s<n>  16x16 icons with masks
    PICT n -> p<n>  ship parts (2600-2926, 40x40, white on black), the
                    selection rings (502/503), title pictures (1001, 1003),
                    won/lost pictures (3530/3540), End Turn (5500/5501), ...
    snd  n -> <n>.wav  numbered like the 5.0.5 sounds
Most PICTs are version 1 (one-byte opcodes, black and white bitmaps).
"""
import io, json, os, struct, sys, wave
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rsrc import parse  # noqa: E402
import pict, snd  # noqa: E402
from dos import edges_clear  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'mac3')


def resource_fork(path):
    d = open(path, 'rb').read()
    if d[1024:1026] != b'BD':  # not an HFS disk: take it as the fork itself
        return path
    import machfs
    v = machfs.Volume()
    v.read(d)
    for name, f in v.items():
        if getattr(f, 'type', None) == b'APPL':
            tmp = os.path.join(OUT, '.app.rsrc')
            os.makedirs(OUT, exist_ok=True)
            open(tmp, 'wb').write(f.rsrc)
            return tmp
    sys.exit('No program on that disk')


def unpackbits(d, p, rb):
    if rb < 8:
        return d[p:p + rb], p + rb
    if rb > 250:
        n = struct.unpack('>H', d[p:p + 2])[0]; p += 2
    else:
        n = d[p]; p += 1
    s, p, o, i = d[p:p + n], p + n, bytearray(), 0
    while i < len(s):
        f = s[i]; i += 1
        if f < 128:
            o += s[i:i + f + 1]; i += f + 1
        elif f > 128:
            o += s[i:i + 1] * (257 - f); i += 1
    return bytes(o), p


def pict1(d):
    """A version 1 PICT: one-byte opcodes and black-and-white bitmaps."""
    t, l, b, r = struct.unpack('>hhhh', d[2:10])
    p = 12  # past the frame and the version opcode 11 01
    canvas = Image.new('L', (r - l, b - t), 255)
    while p < len(d):
        op = d[p]; p += 1
        if op == 0xFF:
            break
        if op == 0x00:
            continue
        if op == 0x01:  # clip region
            p += struct.unpack('>H', d[p:p + 2])[0]
        elif op == 0xA0:  # short comment
            p += 2
        elif op == 0xA1:  # long comment
            p += 4 + struct.unpack('>H', d[p + 2:p + 4])[0]
        elif op in (0x90, 0x98):  # bitmap, plain or packed
            rb, bt, bl, bb, br = struct.unpack('>Hhhhh', d[p:p + 10])
            st, sl, sb, sr, dt, dl, db, dr = struct.unpack('>8h', d[p + 10:p + 26])
            p += 28  # and the transfer mode
            im = Image.new('L', (br - bl, bb - bt), 255)
            px = im.load()
            for y in range(bb - bt):
                if op == 0x98:
                    row, p = unpackbits(d, p, rb)
                else:
                    row, p = d[p:p + rb], p + rb
                for x in range(br - bl):
                    if row[x >> 3] >> (7 - (x & 7)) & 1:
                        px[x, y] = 0
            im = im.crop((sl - bl, st - bt, sr - bl, sb - bt)).resize((dr - dl, db - dt))
            canvas.paste(im, (dl - l, dt - t))
        else:
            raise ValueError('PICT opcode %02x' % op)
    return canvas


def icon(d, size):
    n = size * size // 8
    im = Image.new('RGBA', (size, size))
    px = im.load()
    for y in range(size):
        for x in range(size):
            i = y * size + x
            ink = d[i >> 3] >> (7 - (i & 7)) & 1
            solid = d[n + (i >> 3)] >> (7 - (i & 7)) & 1
            v = 0 if ink else 255
            px[x, y] = (v, v, v, 255 if solid else 0)
    return im


def main(src):
    res = parse(resource_fork(src))
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'sounds'), exist_ok=True)
    sprites, sounds = [], []
    for (t, i), (_, d) in sorted(res.items()):
        if t in ('ICN#', 'ics#'):
            key = ('i' if t == 'ICN#' else 's') + str(i)
            im = icon(d, 32 if t == 'ICN#' else 16)
        elif t == 'PICT':
            im = (pict1(d) if d[10:12] == b'\x11\x01' else pict.decode(d)).convert('RGBA')
            key = 'p' + str(i)
            if i in (502, 503):  # the selection rings are drawn on black
                im = edges_clear(im)
        else:
            continue
        im.save(os.path.join(OUT, 'sprites', key + '.png'), optimize=True)
        sprites.append(key)
    for (t, i), (_, d) in sorted(res.items()):
        if t != 'snd ':
            continue
        s = snd.decode(d)
        if s.get('bits') != 8:
            print('skipped sound', i, s.get('enc'))
            continue
        with wave.open(os.path.join(OUT, 'sounds', '%d.wav' % i), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(1); w.setframerate(round(s['rate']))
            w.writeframes(s['data'])  # Mac 8-bit samples are unsigned, as in WAV
        sounds.append(i)
    tmp = os.path.join(OUT, '.app.rsrc')
    if os.path.exists(tmp):
        os.remove(tmp)
    json.dump({'sprites': sorted(sprites), 'sounds': sorted(sounds)}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sprites), 'sprites,', len(sounds), 'sounds ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
