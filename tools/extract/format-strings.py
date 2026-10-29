#!/usr/bin/env python3
"""Collect every original string that prints a number, for tools/format-audit.js.

    python3 tools/extract/format-strings.py <folder with the originals> > tools/format-audit-strings.json

Reads the string resources of the versions whose strings are not already in the repo
(Mac 1.2, 2.0.1, 3.0.1, 4.0.5: STR# lists; 5.0.5: STR# lists; Windows 3.1 2.0: the string table;
the Palm: tSTL lists) and keeps those holding a printf conversion (%d, %ld, %u, %s, %.*s, %P ...),
a Mac ^0 parameter or a "$". The folder is the maker's scratch folder of the originals' files
(see docs/decompiling.md); the paths below are where each file sits in it.
"""
import json, os, re, struct, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
import rsrc, mac3, palmforms  # noqa: E402

KEEP = re.compile(r'%|\^\d|\$')


def mac_strs(res):
    out = {}
    for (t, i), (_, d) in sorted(res.items()):
        if t == 'STR#':
            c = struct.unpack('>H', d[:2])[0]
            p = 2
            for k in range(c):
                n = d[p]
                s = d[p + 1:p + 1 + n].decode('mac_roman')
                p += 1 + n
                if KEEP.search(s):
                    out['STR#%d.%d' % (i, k + 1)] = s
        elif t == 'STR ':
            s = d[1:1 + d[0]].decode('mac_roman')
            if KEEP.search(s):
                out['STR %d' % i] = s
    return out


def main(root):
    out = {}
    tmp = os.path.join(root, 'fa')
    os.makedirs(tmp, exist_ok=True)
    for key, path, fork in [
        ('mac12', 'ho12/app.rsrc', False),
        ('mac201', 'mac201/Spaceward_Ho!_2.0.1.rsrc', False),
        ('mac301', 'ho301/app.rsrc', False),
        ('mac405', 'mac4/Spaceward Ho! 4.0.5/Spaceward Ho! 4.0.5.rsrc', True),
        ('os505', '/tmp/sw505/spaceward/Contents/Resources/Spaceward Ho!.rsrc', False),
    ]:
        p = path if os.path.isabs(path) else os.path.join(root, path)
        out[key] = mac_strs(rsrc.parse(mac3.resource_fork(p, tmp) if fork else p))
    # Windows 3.1 2.0
    w = os.path.join(root, 'x/f885f89c/SpcHo3x/STARHILL/SCI-FI/WINHO/WINHO.EXE')
    txt = subprocess.run([sys.executable, '-I', os.path.join(here, 'windlg.py'), w, 'strings'], capture_output=True, text=True).stdout
    win = {}
    for ln in txt.splitlines():
        m = re.match(r"string (\d+): (.*)$", ln)
        if m:
            s = eval(m.group(2))
            if KEEP.search(s):
                win[m.group(1)] = s
    out['win31'] = win
    # Palm
    prc = os.path.join(root, 'palm4/Spaceward Ho! for Palm OS/Spaceward Ho.prc')
    r = palmforms.prc(prc)
    pal = {}
    for (t, rid), d in sorted(r.items()):
        if t == 'tSTL':
            _, L = palmforms.strlist(d)
            for i, s in enumerate(L):
                if KEEP.search(s):
                    pal['tSTL%d.%d' % (rid, i)] = s
    out['palm'] = pal
    json.dump(out, sys.stdout, ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main(sys.argv[1])
