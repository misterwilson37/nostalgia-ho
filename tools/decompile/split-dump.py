#!/usr/bin/env python3
"""Split a mac68k.py / Mac68k.java decompile into saved text files.

Usage: python3 -I split-dump.py <out.bin> <out.bin.syms> <out.c> <outdir>

Writes into <outdir>:
  asm/NN-<Segment>.asm      capstone 68000 disassembly of the segment, one block per routine
                            (Toolbox traps shown by name from the .syms; bytes after a
                            routine's last instruction up to the next routine, such as
                            switch tables and MacsBug names, are shown as .dc.w words)
  c/NN-<Segment>/<addr>-<name>.c   one decompiled routine per file
  index.tsv                 segment, address, size (bytes, to the next routine), name, C status
"""
import sys, os, re, struct
from capstone import Cs, CS_ARCH_M68K, CS_MODE_M68K_000

def main(binf, symf, cf, out):
    mem = open(binf, 'rb').read()
    segs, fns, traps = [], {}, {}
    for l in open(symf):
        p = l.split()
        if p[0] == 'seg': segs.append((int(p[1], 16), int(p[2], 16), p[3]))
        elif p[0] == 'fn': fns[int(p[1], 16)] = p[2]
        elif p[0] == 'trap': traps[int(p[1], 16)] = p[3]
    # routines from the C file
    txt = open(cf, encoding='utf-8', errors='replace').read()
    parts = re.split(r'^//==== (\S+) @ ([0-9a-f]+)\n', txt, flags=re.M)
    cs = {}
    order = []
    for i in range(1, len(parts), 3):
        name, addr, body = parts[i], int(parts[i+1], 16), parts[i+2]
        cs[addr] = (name, body); order.append(addr)
    starts = sorted(cs)
    md = Cs(CS_ARCH_M68K, CS_MODE_M68K_000)
    md.skipdata = True
    idx = ['segment\taddress\tsize\troutine\tc'.replace('\\t', '\t')]
    for n, (sa, sl, sname) in enumerate(segs, 1):
        # segment number from address
        segno = sa >> 16
        tag = '%02d-%s' % (segno, re.sub(r'[^A-Za-z0-9_]', '', sname))
        end = sa + sl
        rs = [a for a in starts if sa <= a < end]
        os.makedirs(os.path.join(out, 'asm'), exist_ok=True)
        cdir = os.path.join(out, 'c', tag); os.makedirs(cdir, exist_ok=True)
        asm = open(os.path.join(out, 'asm', tag + '.asm'), 'w')
        asm.write('; segment %s (CODE %d) at %x, %d bytes. Toolbox traps are shown by the name in the .syms.\n' % (sname, segno, sa, sl))
        for k, a in enumerate(rs):
            b = rs[k+1] if k+1 < len(rs) else end
            name, body = cs[a]
            asm.write('\n;==== %s @ %08x (%d bytes)\n' % (name, a, b - a))
            pc = a
            while pc < b:
                got = False
                for ins in md.disasm(mem[pc:b], pc, 1):
                    got = True
                    if ins.mnemonic == 'invalid' or ins.size == 0: break
                    t = traps.get(pc)
                    extra = '  ; %s' % t if t else ''
                    asm.write('%08x  %-24s %s %s%s\n' % (ins.address, mem[pc:pc+ins.size].hex(), ins.mnemonic, ins.op_str, extra))
                    pc += ins.size
                    break
                if not got or (ins.mnemonic == 'invalid'):
                    w = mem[pc:pc+2]
                    t = traps.get(pc)
                    asm.write('%08x  %-24s .dc.w $%s%s\n' % (pc, w.hex(), w.hex(), '  ; ' + t if t else ''))
                    pc += 2
            status = 'ok'
            if 'FAILED' in body: status = 'failed'
            elif len(body.strip()) < 5: status = 'empty'
            safe = re.sub(r'[^A-Za-z0-9_]', '_', name)
            open(os.path.join(cdir, '%08x-%s.c' % (a, safe)), 'w').write(
                '//==== %s @ %08x (%d bytes)\n%s' % (name, a, b - a, body.lstrip('\n')))
            idx.append('%s\t%08x\t%d\t%s\t%s' % (sname, a, b - a, name, status))
        asm.close()
    open(os.path.join(out, 'index.tsv'), 'w').write('\n'.join(idx) + '\n')
    print('routines', len(idx) - 1)

main(*sys.argv[1:5])
