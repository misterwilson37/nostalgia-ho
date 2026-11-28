"""A minimal TrueType writer for pixel fonts: one square a pixel (each row's runs as rectangles), no hinting, no font tools needed.
Used by tools/extract/win31-smallfont.py. The cell is `h` pixels; font-size = h px draws it 1:1 (P units a pixel, unitsPerEm = h * P).

    write(path, family, glyphs, h, asc)    glyphs: {character: (advance, [row bits from the top, bit x = pixel x])}
"""
import struct

P = 100


def _checksum(b):
    b = b + b'\0' * (-len(b) % 4)
    return sum(struct.unpack('>%dI' % (len(b) // 4), b)) & 0xFFFFFFFF


def _glyph(rows, asc):
    rects = []
    for r, m in enumerate(rows):
        x = 0
        while m >> x:
            if (m >> x) & 1:
                e = x
                while (m >> (e + 1)) & 1:
                    e += 1
                y1, y0 = (asc - r) * P, (asc - r - 1) * P
                rects.append((x * P, y0, (e + 1) * P, y1))
                x = e + 1
            else:
                x += 1
    if not rects:
        return b'', None
    pts, ends = [], []
    for x0, y0, x1, y1 in rects:  # clockwise (y up): along the top, down the right, back along the bottom
        pts += [(x0, y1), (x1, y1), (x1, y0), (x0, y0)]
        ends.append(len(pts) - 1)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    bbox = (min(xs), min(ys), max(xs), max(ys))
    out = struct.pack('>hhhhh', len(ends), *bbox) + struct.pack('>%dH' % len(ends), *ends) + struct.pack('>H', 0)
    out += bytes([1]) * len(pts)  # on-curve, coordinates as 16-bit deltas
    px = py = 0
    dx, dy = [], []
    for x, y in pts:
        dx.append(x - px)
        dy.append(y - py)
        px, py = x, y
    out += struct.pack('>%dh' % len(dx), *dx) + struct.pack('>%dh' % len(dy), *dy)
    return out, (bbox, len(pts), len(ends))


def write(path, family, glyphs, h, asc):
    chars = sorted(glyphs, key=ord)
    upm, A, D = h * P, asc * P, (h - asc) * P
    gl = [(0, b'', None)]  # .notdef: empty
    for c in chars:
        adv, rows = glyphs[c]
        data, info = _glyph(rows, asc)
        gl.append((adv * P, data, info))
    n = len(gl)
    glyf, loca = b'', [0]
    for _, data, _ in gl:
        glyf += data + b'\0' * (-len(data) % 4)
        loca.append(len(glyf))
    infos = [g[2] for g in gl if g[2]]
    xmin = min(i[0][0] for i in infos); ymin = min(i[0][1] for i in infos); xmax = max(i[0][2] for i in infos); ymax = max(i[0][3] for i in infos)
    maxpts = max(i[1] for i in infos); maxcont = max(i[2] for i in infos)
    advmax = max(g[0] for g in gl)
    hmtx = b''.join(struct.pack('>Hh', g[0], g[2][0][0] if g[2] else 0) for g in gl)
    lsbs = [g[2][0][0] for g in gl if g[2]]
    rsbs = [g[0] - g[2][0][2] for g in gl if g[2]]
    head = struct.pack('>IIIIHHQQhhhhHHhhh', 0x00010000, 0x00010000, 0, 0x5F0F3CF5, 0x000B, upm, 0, 0, xmin, ymin, xmax, ymax, 0, 6, 2, 1, 0)
    hhea = struct.pack('>Ihhh' + 'Hhhh' + 'hhh' + 'hhhh' + 'hH', 0x00010000, A, -D, 0, advmax, min(lsbs), min(rsbs), xmax, 1, 0, 0, 0, 0, 0, 0, 0, n)
    maxp = struct.pack('>IHHHHHHHHHHHHHH', 0x00010000, n, maxpts, maxcont, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0)
    first, last = ord(chars[0]), min(0xFFFF, ord(chars[-1]))
    avg = int(sum(g[0] for g in gl[1:]) / (n - 1))
    os2 = struct.pack('>HhHHH' + 'hhhhhhhh' + 'hh' + 'h', 4, avg, 400, 5, 0, upm // 2, upm // 2, 0, 0, upm // 2, upm // 2, 0, upm // 2, P, A // 2, 0)
    os2 += bytes(10) + struct.pack('>IIII', 3, 0, 0, 0) + b'NONE' + struct.pack('>HHHhhhHH', 0x40, first, last, A, -D, 0, A, D)
    os2 += struct.pack('>II', 1, 0) + struct.pack('>hhHHH', 0, 0, 0, 32, 1)
    # cmap: one (3, 1) format-4 subtable, a segment for each run of codes whose glyph ids follow on
    codes = [(ord(c), i + 1) for i, c in enumerate(chars) if ord(c) <= 0xFFFF]
    segs = []
    for code, gid in codes:
        if segs and code == segs[-1][1] + 1 and gid == segs[-1][2] + (code - segs[-1][0]):
            segs[-1][1] = code
        else:
            segs.append([code, code, gid])
    segs.append([0xFFFF, 0xFFFF, 0])
    sc = len(segs)
    ends = struct.pack('>%dH' % sc, *[s[1] for s in segs])
    starts = struct.pack('>%dH' % sc, *[s[0] for s in segs])
    deltas = struct.pack('>%dH' % sc, *[((s[2] - s[0]) & 0xFFFF) if s[0] != 0xFFFF else 1 for s in segs])
    ro = struct.pack('>%dH' % sc, *[0] * sc)
    sr = 2 * (1 << (sc.bit_length() - 1))
    sub = struct.pack('>HHHHHHH', 4, 0, 0, 2 * sc, sr, (sr // 2).bit_length() - 1, 2 * sc - sr) + ends + b'\0\0' + starts + deltas + ro
    sub = sub[:2] + struct.pack('>H', len(sub)) + sub[4:]
    cmap = struct.pack('>HHHHI', 0, 1, 3, 1, 12) + sub
    names = {1: family, 2: 'Regular', 3: family + ' Regular', 4: family, 5: 'Version 1.0', 6: family.replace(' ', '')}
    strs, recs, off = b'', b'', 0
    for nid, s in names.items():
        e = s.encode('utf-16-be')
        recs += struct.pack('>HHHHHH', 3, 1, 0x409, nid, len(e), off)
        strs += e
        off += len(e)
    name = struct.pack('>HHH', 0, len(names), 6 + 12 * len(names)) + recs + strs
    post = struct.pack('>IIhhIIIII', 0x00030000, 0, -P, P, 0, 0, 0, 0, 0)
    tables = {b'OS/2': os2, b'cmap': cmap, b'glyf': glyf, b'head': head, b'hhea': hhea, b'hmtx': hmtx,
              b'loca': struct.pack('>%dI' % len(loca), *loca), b'maxp': maxp, b'name': name, b'post': post}
    tags = sorted(tables)
    nt = len(tags)
    es = 1 << (nt.bit_length() - 1)
    out = struct.pack('>IHHHH', 0x00010000, nt, es * 16, es.bit_length() - 1, nt * 16 - es * 16)
    off = 12 + 16 * nt
    body = b''
    for t in tags:
        d = tables[t]
        out += t + struct.pack('>III', _checksum(d), off + len(body), len(d))
        body += d + b'\0' * (-len(d) % 4)
    font = bytearray(out + body)
    # head's checkSumAdjustment
    hoff = struct.unpack('>I', font[12 + 16 * tags.index(b'head') + 8:12 + 16 * tags.index(b'head') + 12])[0]
    adj = (0xB1B0AFBA - _checksum(bytes(font))) & 0xFFFFFFFF
    font[hoff + 8:hoff + 12] = struct.pack('>I', adj)
    open(path, 'wb').write(bytes(font))
    return len(font)
