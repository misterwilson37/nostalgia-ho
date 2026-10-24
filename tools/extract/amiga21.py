#!/usr/bin/env python3
"""Unpack and compare Spaceward Ho! 2.0 and 2.1 for the Amiga (docs/amiga-21.md).

    pip install unicorn amitools pillow
    python3 -I tools/extract/amiga21.py out/ 2.0.adf 2.1de-disk1.adf 2.1en-disk1.adf [2.1de-disk2.adf]

Unpacks each disk with xdftool (amitools), lists every file with size and MD5, unpacks each
`ho!` with amiga-code.py (hunk1/2/3.bin, flat.bin for tools/decompile/AmigaDump.java, and
windows.txt), decodes each texte.pff / textge.pff, and prints what differs: files, strings, the
window tables' items (pointers and string numbers aside), and the program's own strings. The
folder names under out/ are v20, de21, en21 (and de21b for the second disk).
"""
import hashlib, importlib.util, json, os, re, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, name + '.py'))
    mod = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(mod)
    return mod


def files(root):
    out = {}
    for d, _, fs in os.walk(root):
        for f in fs:
            if f.endswith(('.xdfmeta', '.blkdev', '.bootcode')):
                continue
            p = os.path.join(d, f)
            rel = os.path.relpath(p, root).split(os.sep, 1)[-1]
            out[rel.lower()] = (os.path.getsize(p), hashlib.md5(open(p, 'rb').read()).hexdigest()[:8], p)
    return out


def tables(h3):
    res = []
    for o in range(0, len(h3) - 18, 2):
        t, fl, sid, x, y, w, h = struct.unpack('>hIIhhhh', h3[o:o + 18])
        if not (t == 4 and x == 0 and y == 0 and 60 <= w <= 640 and 20 <= h <= 512 and fl & 0xfeffffff == 0):
            continue
        p, items = o, []
        while True:
            t, fl, sid, x, y, w, h = struct.unpack('>hIIhhhh', h3[p:p + 18])
            items.append((t, 'handler' if t in (5, 6) else fl, 0 if t in (5, 6) else sid, x, y, w, h))
            p += 18
            if fl & 0x80000000:
                break
        res.append((0x200000 + o, items))
    return res


def main(out, *adfs):
    code = load('amiga-code')
    amiga = load('amiga')
    names = ['v20', 'de21', 'en21', 'de21b'][:len(adfs)]
    for n, adf in zip(names, adfs):
        d = os.path.join(out, 'x', n)
        os.makedirs(d, exist_ok=True)
        subprocess.run(['xdftool', adf, 'unpack', d], check=True, stdout=subprocess.DEVNULL)
    F = {n: files(os.path.join(out, 'x', n)) for n in names}
    print('%-34s' % 'file (size/md5)', *['%-18s' % n for n in names])
    for k in sorted(set().union(*F.values())):
        row = ['%d/%s' % F[n][k][:2] if k in F[n] else '-' for n in names]
        print('%-34s' % k, *['%-18s' % r for r in row], '' if len(set(row)) == 1 else '*')
    prog = {}
    for n in names[:3]:
        cand = [k for k in F[n] if k in ('ho!',)]
        prog[n] = F[n][cand[0]][2]
    strs, hunks = {}, {}
    for n, p in prog.items():
        h1, h2, h3 = code.unpack(p)
        d = os.path.join(out, 'u', n)
        os.makedirs(d, exist_ok=True)
        for nm, b in (('hunk1.bin', h1), ('hunk2.bin', h2), ('hunk3.bin', h3)):
            open(os.path.join(d, nm), 'wb').write(b)
        flat = bytearray(0x100000 + len(h3))
        flat[0:len(h1)] = h1; flat[0x80000:0x80000 + len(h2)] = h2; flat[0x100000:] = h3
        open(os.path.join(d, 'flat.bin'), 'wb').write(flat)
        hunks[n] = (h1, h2, h3)
        tx = [k for k in F[n] if k in ('texte.pff', 'textge.pff')][0]
        strs[n] = [s.rstrip(b'\0').decode('latin1') for s in amiga.records(F[n][tx][2])]
        json.dump(strs[n], open(os.path.join(d, 'strings.json'), 'w'), ensure_ascii=False, indent=0)
        open(os.path.join(d, 'windows.txt'), 'w').write(code.windows(h3, {str(i): s for i, s in enumerate(strs[n])}))
        print('%s: code %d, chip data %d, data %d bytes; %d strings; code ends at %#x' % (n, len(h1), len(h2), len(h3), len(strs[n]), 0x100000 + len(h1) - 1))
    ns = list(prog)
    for a, b in zip(ns, ns[1:]):
        print('\n== strings %s -> %s' % (a, b))
        n = sum(1 for x, y in zip(strs[a], strs[b]) if x != y)
        print('%d vs %d strings, %d of the first %d differ' % (len(strs[a]), len(strs[b]), n, min(len(strs[a]), len(strs[b]))))
        print('== window tables %s -> %s' % (a, b))
        ta, tb = tables(hunks[a][2]), tables(hunks[b][2])
        print(len(ta), 'vs', len(tb), 'tables')
        for (oa, ia), (ob, ib) in zip(ta, tb):
            for x, y in zip(ia, ib):
                # a text or picture id is compared as its geometry only when the string numbers are the same
                if x != y and not (x[0] in (8,) or (x[1] & 0x1000000 and x[3:] == y[3:])):
                    print('  table %#x/%#x item %s -> %s' % (oa, ob, x, y))
        sa = set(re.findall(rb'[\x20-\x7e]{6,}', hunks[a][2])); sb = set(re.findall(rb'[\x20-\x7e]{6,}', hunks[b][2]))
        print('== the program\'s own strings only in', a, ':', sorted(x.decode() for x in sa - sb)[:40])
        print('== the program\'s own strings only in', b, ':', sorted(x.decode() for x in sb - sa)[:40])


if __name__ == '__main__':
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
