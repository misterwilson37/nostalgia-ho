#!/usr/bin/env python3
"""List what an original's file holds: its resource types and how many of each.

    python3 tools/extract/inventory.py <file or folder> ...

Knows Mac resource forks (raw, AppleDouble "._name", the resource fork of each
file on an HFS disk image or DiskCopy 4.2 image if machfs is installed), Windows PE and NE programs
(their resource tables), DOS 2.0's PRS files, Palm .prc/.pdb databases, and
names anything else by its first bytes. docs/source-inventory.md is its output,
with what each resource type was read by.
"""
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ppob import resources  # noqa: E402

RT = {1: 'RT_CURSOR', 2: 'RT_BITMAP', 3: 'RT_ICON', 4: 'RT_MENU', 5: 'RT_DIALOG', 6: 'RT_STRING',
      7: 'RT_FONTDIR', 8: 'RT_FONT', 9: 'RT_ACCELERATOR', 10: 'RT_RCDATA', 11: 'RT_MESSAGETABLE',
      12: 'RT_GROUP_CURSOR', 14: 'RT_GROUP_ICON', 16: 'RT_VERSION', 17: 'RT_DLGINCLUDE',
      19: 'RT_PLUGPLAY', 20: 'RT_VXD', 21: 'RT_ANICURSOR', 22: 'RT_ANIICON', 23: 'RT_HTML', 24: 'RT_MANIFEST'}


def fmt(types):
    return ', '.join('%s %d' % (t, n) for t, n in sorted(types.items(), key=lambda kv: str(kv[0])))


def mac_fork(d):
    if d[:4] == b'\x00\x05\x16\x07':
        for k in range(struct.unpack('>H', d[24:26])[0]):
            eid, off, ln = struct.unpack('>III', d[26 + 12 * k:38 + 12 * k])
            if eid == 2:
                return d[off:off + ln]
        return None
    return d


def pe_types(d):
    try:
        import pefile
    except ImportError:
        return {'(pefile not installed)': 0}
    pe = pefile.PE(data=d, fast_load=True)
    pe.parse_data_directories(directories=[pefile.DIRECTORY_ENTRY['IMAGE_DIRECTORY_ENTRY_RESOURCE']])
    out = {}
    for e in getattr(pe, 'DIRECTORY_ENTRY_RESOURCE', None).entries if hasattr(pe, 'DIRECTORY_ENTRY_RESOURCE') else []:
        name = str(e.name) if e.name else RT.get(e.id, str(e.id))
        out[name] = sum(len(x.directory.entries) if hasattr(x, 'directory') else 1 for x in e.directory.entries)
    return out


def ne_types(d, ne):
    rt = ne + struct.unpack('<H', d[ne + 0x24:ne + 0x26])[0]
    p = rt + 2
    out = {}
    while True:
        tid, cnt = struct.unpack('<HH', d[p:p + 4])
        if tid == 0:
            break
        if tid & 0x8000:
            name = RT.get(tid & 0x7fff, str(tid & 0x7fff))
        else:
            q = rt + tid
            name = d[q + 1:q + 1 + d[q]].decode('latin1')
        out[name] = out.get(name, 0) + cnt
        p += 8 + 12 * cnt
    return out


def prs_types(d):
    p, out = 0x30, {}
    while p + 28 <= len(d):
        t = d[p:p + 4].rstrip(b'\0').decode('latin1')
        ln = struct.unpack('<I', d[p + 24:p + 28])[0]
        if not t or ln < 28:
            break
        out[t] = out.get(t, 0) + 1
        p += ln
    return out


def prc_types(d):
    n = struct.unpack('>H', d[76:78])[0]
    out = {}
    attrs = struct.unpack('>H', d[32:34])[0]
    if attrs & 1:  # a resource database
        for i in range(n):
            t = d[78 + 10 * i:82 + 10 * i].decode('latin1')
            out[t] = out.get(t, 0) + 1
    else:
        out['records'] = n
    return out


def describe(path):
    d = open(path, 'rb').read()
    if not d:
        return 'empty', {}
    if d[:2] == b'MZ' and len(d) > 0x40:
        off = struct.unpack('<I', d[0x3c:0x40])[0]
        if d[off:off + 4] == b'PE\0\0':
            return 'Windows PE program', pe_types(d)
        if d[off:off + 2] == b'NE':
            return 'Windows NE (16-bit) program', ne_types(d, off)
        return 'DOS program', {}
    if d[:8] == b'PRS Form' or (len(d) > 0x30 and d[0x30:0x34].rstrip(b'\0').isalpha() and prs_types(d)):
        t = prs_types(d)
        if sum(t.values()) > 1:
            return 'DOS 2.0 PRS resource file', t
    if len(d) > 78 and d[60:68] in (b'applPaHo', b'appl\0\0\0\0') or path.lower().endswith(('.prc', '.pdb')):
        return 'Palm database (%s/%s)' % (d[60:64].decode('latin1'), d[64:68].decode('latin1')), prc_types(d)
    if len(d) > 0x54 + 1026 and d[0x52:0x54] == b'\x01\x00' and d[0x54 + 1024:0x54 + 1026] == b'BD':
        d = d[0x54:0x54 + struct.unpack('>I', d[0x40:0x44])[0]]  # a DiskCopy 4.2 image: its disk
    if len(d) > 1026 and d[1024:1026] == b'BD':
        try:
            import machfs
        except ImportError:
            return 'HFS disk image (machfs not installed)', {}
        v = machfs.Volume()
        v.read(d)
        out = {}

        def walk(folder, pre):
            for name, f in folder.items():
                if hasattr(f, 'items'):
                    walk(f, pre + name + ':')
                elif getattr(f, 'rsrc', b''):
                    out[pre + name] = fmt({t: len(v2) for t, v2 in resources(f.rsrc).items()})
        walk(v, '')
        return 'HFS disk image', out
    f = mac_fork(d)
    if f:
        res = resources(f)
        if res:
            return ('AppleDouble resource fork' if d[:4] == b'\x00\x05\x16\x07' else 'Mac resource fork'), {t: len(v) for t, v in res.items()}
    if d[:4] in (b'\xca\xfe\xba\xbe', b'\xcf\xfa\xed\xfe', b'\xce\xfa\xed\xfe'):
        return 'Mach-O program', {}
    if d[:4] == b'Joy!':
        return 'PEF program (PowerPC code)', {}
    if d[:6] == b'bplist':
        return 'binary property list', {}
    if d[:4] == b'PK\x03\x04':
        return 'zip', {}
    if d[:4] == b'FORM':
        return 'IFF ' + d[8:12].decode('latin1'), {}
    if d[:4] == b'\x00\x00\x03\xf3':
        return 'Amiga program (hunks)', {}
    return 'data (%s)' % d[:8].hex(), {}


def main(paths):
    for top in paths:
        files = [top] if os.path.isfile(top) else sorted(os.path.join(r, f) for r, _, fs in os.walk(top) for f in fs)
        for p in files:
            kind, types = describe(p)
            print('%s: %s%s' % (p, kind, (': ' + fmt(types)) if types and not isinstance(next(iter(types.values())), str) else ''))
            if types and isinstance(next(iter(types.values())), str):
                for k, v in types.items():
                    print('    %s: %s' % (k, v))


if __name__ == '__main__':
    main(sys.argv[1:])
