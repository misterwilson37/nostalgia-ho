#!/usr/bin/env python3
"""Turn a CodeWarrior-built 68k Mac application's CODE resources into a raw binary Ghidra can load.

Usage: python3 tools/decompile/cw68k.py <app.rsrc> <out.bin>
Writes <out.bin> and <out.bin>.syms, which tools/decompile/Mac68k.java reads.
See docs/decompiling.md ("Spaceward Ho! 4.0.5 for the Macintosh").

CodeWarrior's 68k runtime (CODE 1, "__%Main") does its own segment loading, unlike MPW's:
  - CODE 0 holds a single jump-table entry; the real jump table is part of the A5 world,
    which is packed in DATA 0 and unpacked at launch. Each entry is
    [A9F0][offset.l][segment.w] until its segment is loaded, then [4EF9][address.l].
  - CODE n (n >= 2) starts with a 12-byte header: [jt offset.w][entry count.w]
    [jt offset.l][relocation data offset.l]; the code runs from +12 to the relocation data.
  - Cross-segment calls are `JSR abs.l` to A5 + jt offset, fixed up at load time from three
    packed relocation lists (add A5; add CODE 1's address; add the segment's own address).
This script unpacks the A5 world, applies every relocation for a fixed layout and writes:
  - CODE n (header included) at n * 0x10000;
  - the A5 world around A5 = 0x00F00000 (the globals, with their initial values), and each
    jump-table entry as `JMP target.l` at its place in it, so `JSR abs.l` resolves;
  - A-line traps as `TRAP #0`, listed in the .syms file (as mac68k.py does);
  - function names from the MacsBug symbols CodeWarrior leaves after each routine, and its
    long multiply/divide helpers in CODE 1 (named __lmul etc.).
"""
import os, struct, sys
import capstone
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'extract'))
import rsrc
from mac68k import name_of, sane_name, macsbug

A5BASE = 0x00F00000


def unpack_data(d, mem, base):
    """CODE 1's A5-world unpacker: three blocks, each [offset.l] then byte codes up to a 0."""
    p = 0
    for _ in range(3):
        a = base + struct.unpack('>i', d[p:p + 4])[0]; p += 4
        while True:
            c = d[p]; p += 1
            if c & 0x80:
                n = (c & 0x7F) + 1; mem[a:a + n] = d[p:p + n]; p += n; a += n
            elif c & 0x40:
                a += (c & 0x3F) + 1
            elif c & 0x20:
                n = (c & 0x1F) + 2; mem[a:a + n] = bytes([d[p]]) * n; p += 1; a += n
            elif c & 0x10:
                n = (c & 0x0F) + 1; mem[a:a + n] = b'\xff' * n; a += n
            elif c == 0:
                break
            elif c == 1:
                a += 4; mem[a:a + 4] = b'\xff\xff' + d[p:p + 2]; p += 2; a += 4
            elif c == 2:
                a += 4; mem[a:a + 4] = b'\xff' + d[p:p + 3]; p += 3; a += 4
            elif c == 3:
                mem[a:a + 2] = b'\xa9\xf0'; a += 4; mem[a:a + 2] = d[p:p + 2]; p += 2; a += 3
                mem[a] = d[p]; p += 1; a += 1
            elif c == 4:
                mem[a:a + 2] = b'\xa9\xf0'; a += 3; mem[a:a + 3] = d[p:p + 3]; p += 3; a += 4
                mem[a] = d[p]; p += 1; a += 1
            else:
                raise ValueError('bad DATA code %x at %x' % (c, p - 1))
    return p


def relocate(d, p, mem, target, value):
    """One packed relocation list: [count.l] then deltas; adds value to the long at target + offset."""
    n = struct.unpack('>I', d[p:p + 4])[0]; p += 4
    off = 0
    for _ in range(n):
        b = d[p]
        if b & 0x80:
            off += struct.unpack('b', bytes([(b << 1) & 0xFF]))[0]; p += 1
        elif b & 0x40:
            w = struct.unpack('>h', struct.pack('>H', (struct.unpack('>H', d[p:p + 2])[0] << 2) & 0xFFFF))[0]
            off += w >> 1; p += 2
        else:
            l = struct.unpack('>i', struct.pack('>I', (struct.unpack('>I', d[p:p + 4])[0] << 2) & 0xFFFFFFFF))[0]
            off = l >> 1; p += 4
        q = target + off
        mem[q:q + 4] = struct.pack('>I', (struct.unpack('>I', mem[q:q + 4])[0] + value) & 0xFFFFFFFF)
    return p


def relocate3(d, p, mem, target, code1):
    p = relocate(d, p, mem, target, A5BASE)
    p = relocate(d, p, mem, target, code1)
    return relocate(d, p, mem, target, target)


# CodeWarrior's runtime helpers in CODE 1 (68020 check, then a 68000 fallback); args D0, D1
RUNTIME = [
    (bytes.fromhex('48e7300074024efb2200600a4c010000'), '__lmul'),
    (bytes.fromhex('48e7300074024efb2200600a4c410000'), '__ldivu'),
    (bytes.fromhex('48e7300074024efb2200600c4c410001'), '__lmodu'),
    (bytes.fromhex('4a806c0c44804a816c104481'), '__ldiv'),
    (bytes.fromhex('4a816c0244814a806d04'), '__lmod'),
]


def main(src, out):
    R = rsrc.parse(src)
    c0 = R[('CODE', 0)][1]
    above, below, jtsize, jtoff = struct.unpack('>IIII', c0[:16])
    segs = sorted(i for (t, i) in R if t == 'CODE' and i > 0)
    img = bytearray(A5BASE + above + 0x100)
    # A5 world
    data = R[('DATA', 0)][1]
    p = 4 + unpack_data(data[4:], img, A5BASE)
    p = relocate3(data, p, img, A5BASE, 0x10000)
    # code
    for n in segs:
        img[n * 0x10000:n * 0x10000 + len(R[('CODE', n)][1])] = R[('CODE', n)][1]
    p = relocate3(data, p, img, 0x10000, 0x10000)  # CODE 1 itself
    syms = ['const A5 %x' % A5BASE]
    njt = 0
    for n in segs[1:]:
        base = n * 0x10000
        h_cnt, h_jt, h_rel = struct.unpack('>HII', img[base + 2:base + 12])
        relocate3(img, base + h_rel, img, base, 0x10000)
        for k in range(h_cnt):
            e = A5BASE + h_jt + 8 * k
            w, off, sg = struct.unpack('>HIH', img[e:e + 8])
            assert w == 0xA9F0 and sg == n, (n, k, hex(w), sg)
            img[e:e + 6] = struct.pack('>HI', 0x4EF9, base + off)
            syms.append('jt %x %x' % (e, base + off)); njt += 1
    # CODE 1's own entry (entry 0 in CODE 0)
    off, w1, sg, w2 = struct.unpack('>HHHH', c0[16:24])
    img[A5BASE + jtoff + 2:A5BASE + jtoff + 8] = struct.pack('>HI', 0x4EF9, 0x10000 + 4 + off)
    md = capstone.Cs(capstone.CS_ARCH_M68K, capstone.CS_MODE_BIG_ENDIAN | capstone.CS_MODE_M68K_020)
    for n in segs:
        name, res = R[('CODE', n)]
        base = n * 0x10000
        hdr = 4 if n == 1 else 12
        end = len(res) if n == 1 else struct.unpack('>I', res[8:12])[0]
        code = img[base:base + end]
        syms.append('seg %x %x %s' % (base + hdr, end - hdr, name))
        starts = {hdr}
        link = None  # CodeWarrior's named routines start with LINK A6; CODE 1's runtime has no names
        p = hdr
        while p < len(code) - 1:
            ins = next(md.disasm(bytes(code[p:p + 10]), p), None)
            if ins is None:
                p += 2; continue
            w = struct.unpack('>H', code[p:p + 2])[0]
            if w == 0x4E56 and link is None:
                link = p
            if ins.mnemonic == 'dc.w' and w >> 12 == 0xA:
                img[base + p:base + p + 2] = b'\x4e\x40'
                nm, nargs = name_of(w), 0
                if nm in ('FP68K', 'Elems68K') and p >= 4 and code[p - 4:p - 2] == b'\x3f\x3c':
                    nm, nargs = sane_name(w, struct.unpack('>H', code[p - 2:p])[0])
                syms.append('trap %x %04x %s %d' % (base + p, w, nm, nargs))
            if w in (0x4E75, 0x4ED0) or w == 0x4E74:
                e = p + (4 if w == 0x4E74 else 2)
                m = macsbug(code, e)
                if m:
                    st = max(starts)
                    if code[st:st + 2] != b'\x4e\x56' and link is not None:
                        st = link
                    syms.append('fn %x %s' % (base + st, m[0]))
                    starts.add(m[1]); link = None
                    p = m[1]; continue
            p += ins.size
        if n == 1:
            for pat, nm in RUNTIME:
                q = code.find(pat)
                if q >= 0:
                    syms.append('rt %x %s' % (base + q, nm))
    open(out, 'wb').write(img)
    open(out + '.syms', 'w').write('\n'.join(syms) + '\n')
    print('segments', len(segs), 'jump table', njt, 'functions', sum(1 for s in syms if s.startswith('fn')),
          'traps', sum(1 for s in syms if s.startswith('trap')))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
