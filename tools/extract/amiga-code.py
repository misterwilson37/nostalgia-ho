#!/usr/bin/env python3
"""Unpack the Amiga program of Spaceward Ho! 2.0 and list its windows.

    pip install unicorn
    python3 -I tools/extract/amiga-code.py "amiga/HO!1/ho!" out/ [texte-strings.json]

The program (HO!1:ho!, 114,760 bytes) is a hunk executable packed by a
self-unpacking cruncher (the Imploder's layout: a 30-longword stub hunk,
BSS hunks the size of the real code, chip data and data hunks, a 512-byte
decruncher hunk, the packed data and a 18,692-byte buffer). Nothing in it is
readable as it stands. This runs the program's own decruncher (hunk 4) on
a 68000 emulator (unicorn) with the hunks laid out as LoadSeg would, and
writes the three real hunks, relocated to fixed addresses:

    hunk1.bin  code, at 0x100000 (SAS/C; A4 = 0x200000 throughout)
    hunk2.bin  chip data, at 0x180000
    hunk3.bin  data and BSS, at 0x200000
    flat.bin   all three as one image from 0x100000, for a disassembler
               (Ghidra: raw binary, 68000:BE:32:MC68020, base 0x100000,
               register A4 = 0x200000)

and windows.txt: every window table in the data. The program builds each
window from such a table (FUN_0010c1e0): 18-byte items (kind, flags, text
or picture, x, y, w, h), the first the window itself (its title and inner
size), the last flagged 0x80000000. Kinds: 1 text (flags & 3: 1 centred,
2 right-aligned), 2 picture, 3 gadget (flags & 0xff00: 0 a button, 0x100 a
picture button, 0x200 a toggle, 0x400 a list row, 0x600 a text field), 5
and 6 the next gadget's handlers, 7 SetFont, 8 a scroll bar, 10 and 12
bevelled boxes, 11 pens. A text is a texte.pff string number unless the
flags' top byte has bit 0 (a pointer, filled in by the code). Places are in
pixels inside the window's borders; a text's y is its top row.
"""
import json, os, struct, sys

BASES = [0x8000, 0x100000, 0x180000, 0x200000, 0x280000, 0x300000, 0x380000]


def unpack(path):
    from unicorn import Uc, UC_ARCH_M68K, UC_MODE_BIG_ENDIAN
    from unicorn.m68k_const import UC_CPU_M68K_M68000, UC_M68K_REG_A4, UC_M68K_REG_A7, UC_M68K_REG_D6
    f = open(path, 'rb').read()
    L = lambda o: struct.unpack('>I', f[o:o + 4])[0]
    assert L(0) == 0x3f3, 'not a hunk executable'
    n = L(8)
    sizes = [L(20 + 4 * i) & 0x3fffffff for i in range(n)]
    assert n == 7, 'not the packed layout this expects'
    o, hunks = 20 + 4 * n, []
    while o < len(f):
        t = L(o) & 0x3fffffff
        if t in (0x3e9, 0x3ea):
            sz = L(o + 4) * 4
            hunks.append(f[o + 8:o + 8 + sz]); o += 8 + sz
        elif t == 0x3eb:
            hunks.append(None); o += 8
        elif t == 0x3f2:
            o += 4
        else:
            raise ValueError('hunk type %x' % t)
    mu = Uc(UC_ARCH_M68K, UC_MODE_BIG_ENDIAN)
    mu.ctl_set_cpu_model(UC_CPU_M68K_M68000)
    mu.mem_map(0, 0x400000)
    for i, d in enumerate(hunks):  # a segment list: size and next BPTR before each hunk
        b = BASES[i]
        mu.mem_write(b - 8, struct.pack('>I', sizes[i] * 4 + 8))
        mu.mem_write(b - 4, struct.pack('>I', (BASES[i + 1] - 4) >> 2 if i + 1 < len(hunks) else 0))
        if d:
            mu.mem_write(b, d)
    mu.mem_write(4, struct.pack('>I', 0x4000))           # ExecBase, version 32: no cache flush
    mu.mem_write(0x4000 + 0x14, struct.pack('>H', 0x20))
    ret = 0x6000
    mu.mem_write(ret, b'\x4e\x71\x4e\x71')
    mu.mem_write(0x7000 - 4, struct.pack('>I', ret))
    mu.reg_write(UC_M68K_REG_A7, 0x7000 - 4)
    mu.reg_write(UC_M68K_REG_A4, BASES[0] + 0x64)  # the stub's "find segment" routine
    mu.reg_write(UC_M68K_REG_D6, 3)
    mu.emu_start(BASES[4], ret, count=500_000_000)
    return [bytes(mu.mem_read(BASES[i], sizes[i] * 4)) for i in (1, 2, 3)]


def windows(h3, strs):
    B, out = 0x200000, []
    for o in range(0, len(h3) - 18, 2):
        t, fl, sid, x, y, w, h = struct.unpack('>hIIhhhh', h3[o:o + 18])
        if not (t == 4 and x == 0 and y == 0 and 60 <= w <= 640 and 20 <= h <= 512 and fl & 0xfeffffff == 0):
            continue
        p = o
        while True:
            t, fl, sid, x, y, w, h = struct.unpack('>hIIhhhh', h3[p:p + 18])
            ptr = (fl >> 24) & 1
            if t in (1, 3, 4) and not ptr and fl & 0xff00 not in (0x100, 0x300):
                txt = repr(strs.get(str(sid), '#%d' % sid))
            elif t == 2 or (t == 3 and fl & 0xff00 in (0x100, 0x300)):
                txt = 'picture %d' % sid
            else:
                txt = hex(sid) if sid > 0xffff else str(sid)
            out.append('%06x kind %2d flags %08x %-44s x %4d y %4d w %4d h %4d' % (B + p, t, fl, txt[:44], x, y, w, h))
            p += 18
            if fl & 0x80000000:
                break
        out.append('')
    return '\n'.join(out)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    h1, h2, h3 = unpack(sys.argv[1])
    os.makedirs(sys.argv[2], exist_ok=True)
    for name, d in (('hunk1.bin', h1), ('hunk2.bin', h2), ('hunk3.bin', h3)):
        open(os.path.join(sys.argv[2], name), 'wb').write(d)
    flat = bytearray(0x100000 + len(h3))
    flat[0:len(h1)] = h1; flat[0x80000:0x80000 + len(h2)] = h2; flat[0x100000:] = h3
    open(os.path.join(sys.argv[2], 'flat.bin'), 'wb').write(flat)
    strs = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
    open(os.path.join(sys.argv[2], 'windows.txt'), 'w').write(windows(h3, strs))
    print('unpacked:', len(h1), len(h2), len(h3), 'bytes ->', sys.argv[2])
