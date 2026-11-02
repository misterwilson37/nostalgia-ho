#!/usr/bin/env python3
"""Split the NameDump.java decompile of an Objective-C Mach-O into saved text files.

Usage: python3 -I split-objc.py <objc.tsv> <out.c> <outdir>

Writes into <outdir>:
  c/<group>/<addr>-<name>.c   one decompiled routine per file; <group> is the Objective-C class
                              (or "sub-<address>>16>" for the routines that are not methods)
  index.tsv                   group, address, size (bytes, to the next routine start), name, C status
  methods.tsv                 the Objective-C methods: address, -[Class selector], type encoding
"""
import sys, os, re, shutil

def main(tsv, cf, out):
    methods = {}
    for l in open(tsv):
        p = l.rstrip('\n').split('\t')
        methods[int(p[0], 16)] = (p[1], p[2] if len(p) > 2 else '')
    txt = open(cf, encoding='utf-8', errors='replace').read()
    parts = re.split(r'^//==== (\S+) @ ([0-9a-f]+)[^\n]*\n', txt, flags=re.M)
    fns = []
    for i in range(1, len(parts), 3):
        fns.append((int(parts[i + 1], 16), parts[i], parts[i + 2]))
    fns.sort()
    shutil.rmtree(os.path.join(out, 'c'), ignore_errors=True)
    rows = []
    for k, (addr, name, body) in enumerate(fns):
        size = (fns[k + 1][0] - addr) if k + 1 < len(fns) else 0
        oc = methods.get(addr)
        if oc:
            m = re.match(r'[-+]\[([^ (\]]+)', oc[0]); grp = m.group(1)
        else:
            grp = 'sub-%x' % (addr >> 16)  # not an Objective-C method: C, C++ and library routines, by 64K band
        status = 'FAILED' if body.strip().startswith('// FAILED') else 'ok'
        d = os.path.join(out, 'c', grp); os.makedirs(d, exist_ok=True)
        fn = '%09x-%s.c' % (addr, name[:100])
        open(os.path.join(d, fn), 'w').write('// %s\n%s' % (oc[0] if oc else name, body))
        rows.append((grp, '%x' % addr, size, name, status))
    with open(os.path.join(out, 'index.tsv'), 'w') as f:
        f.write('segment\taddress\tsize\tname\tstatus\n')
        for r in rows: f.write('\t'.join(map(str, r)) + '\n')
    with open(os.path.join(out, 'methods.tsv'), 'w') as f:
        for a in sorted(methods): f.write('%x\t%s\t%s\n' % (a, methods[a][0], methods[a][1]))
    print(len(rows), 'routines,', sum(r[4] == 'FAILED' for r in rows), 'failed')

if __name__ == '__main__': main(*sys.argv[1:4])
