#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! 3.0.1 for the Macintosh.

    pip install machfs pillow
    python3 tools/extract/mac3.py <SpacewardHo301.img> [<Spaceward Ho! 3.0 Color.img>]

The .img is the floppy (an HFS disk image) with the program on it; a raw
resource fork of the program (for example one saved from an emulator)
works too. Writes assets/skins/mac3/: sprites/*.png, sounds/*.wav and
manifest.json. Given the second floppy, the one with "Ho! 3.0 Color
Picts", it also writes assets/skins/mac3c/, the same set in colour.

The program's own pictures are black and white (1-bit); on a colour Mac it
read colour versions from "Ho! 3.0 Color Picts". The DOS version's colour
art has the same numbers. In the program everything is an ordinary Mac
resource:
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


# The colour pictures file: PPMp n is an 8-bit picture in Delta Tao's own
# wrapper (u32 header size, then a QuickDraw PixMap without its base
# address, then the pixels PackBits-packed as one stream, in the standard
# Mac 256-colour palette); icl8/ics8 are colour icons whose masks are the
# program's ICN#/ics#. Some of its pictures have other numbers than the
# black-and-white ones; they are saved under the black-and-white names.
COLOUR_NAMES = {500: 502, 501: 503, 1000: 1001, 1002: 1003, 3000: 3500, 3010: 3510, 3030: 3530,
                3040: 3540, 3050: 3550, 3520: 3020, 5000: 5500, 5001: 5501, 5030: 5530}


def mac_palette():
    v = [0xFF, 0xCC, 0x99, 0x66, 0x33, 0x00]
    pal = [(r, g, b) for r in v for g in v for b in v][:215]
    ramp = [0xEE, 0xDD, 0xBB, 0xAA, 0x88, 0x77, 0x55, 0x44, 0x22, 0x11]
    pal += [(x, 0, 0) for x in ramp] + [(0, x, 0) for x in ramp] + [(0, 0, x) for x in ramp] + [(x, x, x) for x in ramp]
    return pal + [(0, 0, 0)]


def ppmp(d, pal):
    hs = struct.unpack('>I', d[:4])[0]
    rb = struct.unpack('>H', d[4:6])[0] & 0x3FFF
    t, l, b, r = struct.unpack('>hhhh', d[6:14])
    w, h = r - l, b - t
    s, o, i = d[hs:], bytearray(), 0
    while i < len(s) and len(o) < rb * h:
        f = s[i]; i += 1
        if f < 128:
            o += s[i:i + f + 1]; i += f + 1
        elif f > 128:
            o += s[i:i + 1] * (257 - f); i += 1
    o += bytes(rb * h - len(o))
    return Image.frombytes('RGB', (w, h), b''.join(bytes(pal[o[y * rb + x]]) for y in range(h) for x in range(w))).convert('RGBA')


def colour_icon(d, mono, size, pal):
    im = Image.frombytes('RGB', (size, size), b''.join(bytes(pal[v]) for v in d[:size * size])).convert('RGBA')
    if mono is not None:
        im.putalpha(icon(mono, size).getchannel('A'))
    return im


def colour_fork(path):
    d = open(path, 'rb').read()
    if d[1024 + 84:1024 + 86] == b'BD':  # a DiskCopy 4.2 image: an 84-byte header, then the disk
        d = d[84:]
    if d[1024:1026] != b'BD':
        return parse(path)
    import machfs
    v = machfs.Volume()
    v.read(d)
    for name, f in v.items():
        if getattr(f, 'type', None) == b'SH3p':
            tmp = os.path.join(OUT, '.colour.rsrc')
            open(tmp, 'wb').write(f.rsrc)
            res = parse(tmp)
            os.remove(tmp)
            return res
    sys.exit('No "Ho! 3.0 Color Picts" on that disk')


def save(out, images, sounds):
    os.makedirs(os.path.join(out, 'sprites'), exist_ok=True)
    os.makedirs(os.path.join(out, 'sounds'), exist_ok=True)
    for key, im in images.items():
        im.save(os.path.join(out, 'sprites', key + '.png'), optimize=True)
    for i, (rate, data) in sounds.items():
        with wave.open(os.path.join(out, 'sounds', '%d.wav' % i), 'wb') as w:
            w.setnchannels(1); w.setsampwidth(1); w.setframerate(rate)
            w.writeframes(data)  # Mac 8-bit samples are unsigned, as in WAV
    json.dump({'sprites': sorted(images), 'sounds': sorted(sounds)}, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
    print(len(images), 'sprites,', len(sounds), 'sounds ->', out)


def main(src, colour=None):
    os.makedirs(OUT, exist_ok=True)
    res = parse(resource_fork(src))
    tmp = os.path.join(OUT, '.app.rsrc')
    if os.path.exists(tmp):
        os.remove(tmp)
    images, sounds = {}, {}
    for (t, i), (_, d) in sorted(res.items()):
        if t in ('ICN#', 'ics#'):
            images[('i' if t == 'ICN#' else 's') + str(i)] = icon(d, 32 if t == 'ICN#' else 16)
        elif t == 'PICT':
            im = (pict1(d) if d[10:12] == b'\x11\x01' else pict.decode(d)).convert('RGBA')
            if i in (502, 503):  # the selection rings are drawn on black
                im = edges_clear(im)
            images['p' + str(i)] = im
        elif t == 'snd ':
            s = snd.decode(d)
            if s.get('bits') != 8:
                print('skipped sound', i, s.get('enc'))
                continue
            sounds[i] = (round(s['rate']), s['data'])
    save(OUT, images, sounds)
    if not colour:
        return
    # the colour skin: every picture the colour file has, the rest black and white
    pal = mac_palette()
    images = dict(images)
    for (t, i), (_, d) in sorted(colour_fork(colour).items()):
        if t == 'icl8':
            images['i%d' % i] = colour_icon(d, res.get(('ICN#', i), (0, None))[1], 32, pal)
        elif t == 'ics8':
            images['s%d' % i] = colour_icon(d, res.get(('ics#', i), (0, None))[1], 16, pal)
        elif t == 'PPMp':
            images['p%d' % (i - 10000 if i >= 12000 else i)] = ppmp(d, pal)
        elif t == 'PICT':
            im = pict.decode(d).convert('RGBA')
            n = COLOUR_NAMES.get(i, i)
            if n in (502, 503):
                im = edges_clear(im)
            images['p%d' % n] = im
    save(OUT + 'c', images, sounds)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
