#!/usr/bin/env python3
"""Each version's own application icon, for the browser tab (assets/icons/).

    pip install pillow pefile
    python3 tools/extract/icons.py <name>=<file> ...

Names (each optional; give the ones in hand):
    mac12=<1.2 program's resource fork>     mac2=<2.0.1's>    mac3=<3.0.1's>
    mac4=<4.0.5's>                          classic=<5.0.5's app.icns>
    winho=<WINHO.EXE (2.0, Windows 3.1)>    w95=<SPACEHO.EXE (4.0.5, Windows 95)>
    palm=<Spaceward Ho.prc>                 amiga=<HO!.info>
    ios=<the app's AppIcon60x60@3x.png (a CgBI PNG)>

Writes assets/icons/<skin>.png (the large one) and <skin>-32.png (the tab's).
Pixel icons are only ever scaled by whole numbers, nearest-neighbour:
- the Macs: the application's icon is the one the BNDL gives its FREF for
  'APPL' (local id 0), ICN# 200 in every version from 1.2 to 5.0.5. The
  black-and-white skins get ICN# (1-bit, with its mask), the colour ones
  icl8 200 (the standard 256-colour palette) masked by the ICN#; 32 px
  native, and 128 (4x) for the large one. 5.0.5 (classic) has a Mac OS X
  app.icns: its 128 and 32 px images.
- Windows: the first RT_GROUP_ICON's 32x32 image (NE for WINHO.EXE, which
  the dos skin also uses; PE for SPACEHO.EXE), 128 (4x) for the large one.
- Palm: tAIB 1000, the launcher icon (22x22, and 44x44 for double-density
  screens): the 44 at 2x for the large one, and for the tab the 22 at 1x
  centred on 32.
- Amiga: the program's .info (a Workbench DiskObject): its first image
  (HO!.info: 74x74, the cowboy, drawn in colours 0-3 only) in the Workbench 2
  colours (grey, black, white, blue), its white background kept as Workbench
  drew it; 2x for the large one, and for the tab a 32 px box-filtered copy
  (74 has no whole-number scale to 32).
- iOS: the 180 px AppIcon, and 32 px downscaled (it is a painting, not pixels).
"""
import io, os, struct, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from rsrc import parse  # noqa: E402
from mac3 import icon, colour_icon, mac_palette  # noqa: E402
import palm, ios  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'assets', 'icons')


def fork(path):
    d = open(path, 'rb').read()
    if d[:4] == b'\x00\x05\x16\x07':  # AppleDouble: the resource fork is entry 2
        n = struct.unpack('>H', d[24:26])[0]
        for i in range(n):
            eid, off, ln = struct.unpack('>III', d[26 + 12 * i:38 + 12 * i])
            if eid == 2:
                d = d[off:off + ln]
        tmp = path + '.fork-tmp'
        open(tmp, 'wb').write(d)
        try:
            return parse(tmp)
        finally:
            os.remove(tmp)
    return parse(path)


def app_icon_id(res):
    """The ICN# id the BNDL gives the APPL's FREF."""
    frefs = {i: d[:4] for (t, i), (_, d) in res.items() if t == 'FREF'}
    for (t, _), (_, d) in res.items():
        if t != 'BNDL':
            continue
        o, maps = 8, {}
        for _ in range(struct.unpack('>H', d[6:8])[0] + 1):
            ty = d[o:o + 4]; n = struct.unpack('>H', d[o + 4:o + 6])[0] + 1; o += 6
            maps[ty] = dict(struct.unpack('>HH', d[o + 4 * j:o + 4 * j + 4]) for j in range(n)); o += 4 * n
        local = next(lid for lid, rid in maps[b'FREF'].items() if frefs.get(rid) == b'APPL')
        return maps[b'ICN#'][local]
    return 200


def mac(path):
    res = fork(path)
    n = app_icon_id(res)
    mono = res[('ICN#', n)][1]
    bw = icon(mono, 32)
    col = colour_icon(res[('icl8', n)][1], mono, 32, mac_palette()) if ('icl8', n) in res else None
    return n, bw, col


def dib_icon(d):
    """An RT_ICON: a DIB of twice the icon's height, the colour image then
    the AND mask (1: transparent), bottom-up. (WINHO.EXE's group directory
    gives its 256-colour icon a bit count of 1, so it is read from here.)"""
    hs, w, h2, _, bpp, _, _, _, _, used, _ = struct.unpack('<IiiHHIIiiII', d[:40])
    h = h2 // 2
    n = used or (1 << bpp if bpp <= 8 else 0)
    pal = [(d[hs + 4 * i + 2], d[hs + 4 * i + 1], d[hs + 4 * i]) for i in range(n)]
    p = hs + 4 * n
    rb = (w * bpp + 31) // 32 * 4
    mb = (w + 31) // 32 * 4
    m = p + rb * h
    im = Image.new('RGBA', (w, h))
    px = im.load()
    for y in range(h):
        row, mrow = p + (h - 1 - y) * rb, m + (h - 1 - y) * mb
        for x in range(w):
            if bpp == 24:
                c = (d[row + 3 * x + 2], d[row + 3 * x + 1], d[row + 3 * x])
            else:
                c = pal[d[row + x * bpp // 8] >> (8 - bpp - x * bpp % 8) & ((1 << bpp) - 1)]
            clear = d[mrow + x // 8] >> (7 - x % 8) & 1
            px[x, y] = c + (0 if clear else 255,)
    return im, bpp


def ico_images(groups, icons):
    """The first group icon's images, by size: {(w, h): (image, bits per pixel)}."""
    g = groups[0]
    cnt = struct.unpack('<H', g[4:6])[0]
    ids = [struct.unpack('<H', g[18 + 14 * i:20 + 14 * i])[0] for i in range(cnt)]
    out = {}
    for i in ids:
        im, bpp = dib_icon(icons[i])
        if im.size not in out or bpp > out[im.size][1]:
            out[im.size] = (im, bpp)
    return out


def ne(path):
    d = open(path, 'rb').read()
    o = struct.unpack('<I', d[0x3c:0x40])[0]
    rt = o + struct.unpack('<H', d[o + 0x24:o + 0x26])[0]
    shift = struct.unpack('<H', d[rt:rt + 2])[0]; p = rt + 2
    groups, icons = [], {}
    while True:
        tid = struct.unpack('<H', d[p:p + 2])[0]
        if tid == 0:
            break
        cnt = struct.unpack('<H', d[p + 2:p + 4])[0]; p += 8
        for _ in range(cnt):
            off, ln, _, rid = struct.unpack('<HHHH', d[p:p + 8]); p += 12
            data = d[off << shift:(off << shift) + (ln << shift)]
            if tid == 0x8003:
                icons[rid & 0x7fff] = data
            elif tid == 0x800e:
                groups.append(data)
    return ico_images(groups, icons)


def pe(path):
    import pefile
    x = pefile.PE(path)
    groups, icons = [], {}
    for t in x.DIRECTORY_ENTRY_RESOURCE.entries:
        if t.id not in (3, 14):
            continue
        for r in t.directory.entries:
            for lang in r.directory.entries:
                e = lang.data.struct
                data = x.get_data(e.OffsetToData, e.Size)
                if t.id == 3:
                    icons[r.id] = data
                else:
                    groups.append(data)
    return ico_images(groups, icons)


def amiga(path):
    d = open(path, 'rb').read()
    if d[:2] != b'\xe3\x10':
        raise ValueError('not a Workbench icon')
    o = 78 + (56 if struct.unpack('>I', d[66:70])[0] else 0)  # do_DrawerData
    _, _, w, h, depth = struct.unpack('>hhhhh', d[o:o + 10])
    o += 20
    rb = (w + 15) // 16 * 2
    pal = [(0xAA, 0xAA, 0xAA), (0, 0, 0), (0xFF, 0xFF, 0xFF), (0x66, 0x88, 0xBB)]
    im = Image.new('RGBA', (w, h))
    px = im.load()
    for y in range(h):
        for x in range(w):
            v = 0
            for pl in range(depth):
                v |= (d[o + pl * rb * h + y * rb + x // 8] >> (7 - x % 8) & 1) << pl
            px[x, y] = pal[v % len(pal)] + (255,)
    return im, depth


def up(im, k):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def on(im, size):
    c = Image.new('RGBA', (size, size))
    c.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    return c


def save(skin, big, small):
    os.makedirs(OUT, exist_ok=True)
    big.save(os.path.join(OUT, skin + '.png'), optimize=True)
    small.save(os.path.join(OUT, skin + '-32.png'), optimize=True)
    print(skin, big.size, small.size)


def main(args):
    src = dict(a.split('=', 1) for a in args)
    for skin in ('mac12', 'mac2', 'mac3', 'mac4'):
        if skin in src:
            n, bw, col = mac(src[skin])
            print('%s: ICN# %d%s' % (skin, n, ', icl8 %d' % n if col else ''))
            save(skin, up(bw, 4), bw)
            if skin != 'mac12' and col is not None:  # 1.2 has only a black-and-white skin
                save(skin + 'c', up(col, 4), col)
    if 'classic' in src:
        from PIL.IcnsImagePlugin import IcnsFile
        with open(src['classic'], 'rb') as f:
            ic = IcnsFile(f)
            save('classic', ic.getimage((128, 128, 1)).convert('RGBA'), ic.getimage((32, 32, 1)).convert('RGBA'))
    for skin, fn in (('dos', ne), ('w95', pe)):
        key = 'winho' if skin == 'dos' else skin
        if key in src:
            ims = fn(src[key])
            print(skin, 'icons:', [(w, h, b) for (w, h), (_, b) in ims.items()])
            im = ims[(32, 32)][0]
            save(skin, up(im, 4), im)
    if 'palm' in src:
        r = palm.prc(src['palm'])
        fam = palm.family(r[('tAIB', 1000)])
        lo = max((f for f in fam if f[2] == 72), key=lambda f: f[1])[0]
        hi = max(fam, key=lambda f: (f[2], f[1]))[0]
        save('palm', up(hi, 2), on(lo, 32))
    if 'amiga' in src:
        im, depth = amiga(src['amiga'])
        print('amiga: %dx%d, %d planes' % (im.width, im.height, depth))
        k = max(1, 160 // max(im.size))
        small = on(im, 32) if max(im.size) <= 32 else im.resize((32, 32), Image.BOX)
        save('amiga', up(im, k), small)
    if 'ios' in src:
        im = ios.load_png(src['ios'])
        save('ios', im, im.resize((32, 32), Image.LANCZOS))


if __name__ == '__main__':
    main(sys.argv[1:])
