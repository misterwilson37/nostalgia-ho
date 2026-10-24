#!/usr/bin/env python3
"""Compare the functions of two builds of the Amiga program (Spaceward Ho! 2.0, 2.1).

    python3 -I tools/decompile/amiga-fcmp.py a.asm b.asm

a.asm and b.asm are the listings tools/decompile/AmigaDump.java writes. The two builds come from
one source, so most functions are the same code at other addresses (and in other registers: the
compilers' register choices differ). Each function is reduced to a signature: branches inside the
function become relative, calls and jumps out of it become EXT, A4-relative globals become
(D,A4), code and data addresses become ABS. Functions are lined up in address order; the list
says which are identical, changed (with the similarity of the signatures), removed or added.
Then, for each changed pair, the constants (immediates, struct offsets off A0-A3, library
offsets off A6) that appear in one and not the other: a changed rule shows up there.
"""
import collections, difflib, hashlib, re, sys


def funcs(path):
    out, cur = [], None
    for line in open(path):
        line = line.rstrip('\n')
        if line.startswith('; ---- '):
            cur = [line[7:], None, []]
            out.append(cur)
            continue
        m = re.match(r'([0-9a-f]{8}): (.*)', line)
        if m and cur is not None:
            a = int(m.group(1), 16)
            cur[1] = cur[1] or a
            cur[2].append((a, m.group(2)))
    return out


def sig(f, regs=False):
    lo, hi = f[2][0][0], f[2][-1][0]
    out = []
    for a, ins in f[2]:
        ins = re.sub(r'\(0x[0-9a-f]+,A4\)', '(D,A4)', ins)

        def tgt(m):
            t = int(m.group(1), 16)
            if 0x100000 <= t < 0x200000:
                return 'T%+d' % (t - a) if lo <= t <= hi else 'EXT'
            return 'ABS'
        ins = re.sub(r'0x(00[0-9a-f]{6})', tgt, ins)
        ins = re.sub(r'#0x([0-9a-f]{6,})', lambda m: '#ABS' if 0x100000 <= int(m.group(1), 16) < 0x300000 else m.group(0), ins)
        if regs:
            ins = re.sub(r'\b[DA][0-6]\b', 'R', ins)
        out.append(ins)
    return out


def consts(f):
    c = collections.Counter()
    for a, i in f[2]:
        for m in re.finditer(r'#(-?0x[0-9a-f]+)|pea \((-?0x[0-9a-f]+)\)\.w', i):
            v = m.group(1) or m.group(2)
            if abs(int(v, 16)) < 0x100000:
                c[v] += 1
        for m in re.finditer(r'\((-?0x[0-9a-f]+),A[0-3]\)', i):
            c['field' + m.group(1)] += 1
        for m in re.finditer(r'\((-?0x[0-9a-f]+),A6\)', i):
            if i.startswith(('jsr', 'jmp')):
                c['lib' + m.group(1)] += 1
    return c


def main(pa, pb):
    A, B = funcs(pa), funcs(pb)
    h = lambda F: [hashlib.md5('\n'.join(sig(f)).encode()).hexdigest() for f in F]
    sm = difflib.SequenceMatcher(None, h(A), h(B), autojunk=False)
    same, rows = 0, []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            same += i2 - i1
            continue
        used = set()
        for i in range(i1, i2):
            best = None
            for j in range(j1, j2):
                if j not in used:
                    r = difflib.SequenceMatcher(None, sig(A[i]), sig(B[j]), autojunk=False).ratio()
                    if best is None or r > best[0]:
                        best = (r, j)
            if best and best[0] > 0.5:
                used.add(best[1])
                rows.append(('changed', A[i], B[best[1]], best[0]))
            else:
                rows.append(('removed', A[i], None, 0))
        rows += [('added', None, B[j], 0) for j in range(j1, j2) if j not in used]
    print('functions %d and %d, %d identical' % (len(A), len(B), same))
    for kind, a, b, r in rows:
        if kind == 'changed':
            ca, cb = consts(a), consts(b)
            print('changed  %-22s %#x -> %#x  similarity %.2f  consts -%s +%s' % (a[0], a[1], b[1], r, dict(ca - cb), dict(cb - ca)))
        else:
            f = a or b
            print('%-8s %-22s %#x (%d instructions)' % (kind, f[0], f[1], len(f[2])))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
