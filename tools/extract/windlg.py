#!/usr/bin/env python3
"""Print a Windows program's dialogs, menus and string tables, in words.

    python3 tools/extract/windlg.py <SPACEHO.EXE or WINHO.EXE> [dialogs|menus|strings]

Reads 32-bit PE programs (Windows 95 4.0.5: DLGTEMPLATE and DLGTEMPLATEEX,
UTF-16) and 16-bit NE programs (Windows 3.1 2.0: the 16-bit DLGTEMPLATE, ANSI).
Each control: its ID, class (BUTTON with its style: push, default, check box,
radio, group box; EDIT; STATIC; LISTBOX; SCROLLBAR; COMBOBOX; or a class name),
its text and its frame in dialog units (x, y, w, h). Scroll bar ranges are not
in a dialog template: the program sets them (SetScrollRange).
"""
import struct
import sys

CLS = {0x80: 'BUTTON', 0x81: 'EDIT', 0x82: 'STATIC', 0x83: 'LISTBOX', 0x84: 'SCROLLBAR', 0x85: 'COMBOBOX'}
BTN = {0: 'push', 1: 'default push', 2: 'check box', 3: 'auto check box', 4: 'radio', 5: '3-state',
       6: 'auto 3-state', 7: 'group box', 9: 'auto radio', 11: 'owner-drawn'}


def pe_res(path):
    import pefile
    pe = pefile.PE(path, fast_load=True)
    pe.parse_data_directories(directories=[pefile.DIRECTORY_ENTRY['IMAGE_DIRECTORY_ENTRY_RESOURCE']])
    for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        for r in t.directory.entries:
            for lang in r.directory.entries:
                s = lang.data.struct
                yield t.id, (r.id if r.id is not None else str(r.name)), pe.get_data(s.OffsetToData, s.Size)


def ne_res(path):
    d = open(path, 'rb').read()
    ne = struct.unpack('<I', d[0x3c:0x40])[0]
    rt = ne + struct.unpack('<H', d[ne + 0x24:ne + 0x26])[0]
    shift = struct.unpack('<H', d[rt:rt + 2])[0]
    p = rt + 2
    while True:
        tid, cnt = struct.unpack('<HH', d[p:p + 4])
        if tid == 0:
            break
        p += 8
        for _ in range(cnt):
            off, ln, fl, rid = struct.unpack('<HHHH', d[p:p + 8])
            p += 12
            yield (tid & 0x7fff if tid & 0x8000 else tid), (rid & 0x7fff if rid & 0x8000 else rid), d[off << shift:(off << shift) + (ln << shift)]


class Rd:
    def __init__(self, d, wide):
        self.d, self.p, self.w = d, 0, wide

    def u16(self):
        v = struct.unpack('<H', self.d[self.p:self.p + 2])[0]
        self.p += 2
        return v

    def u32(self):
        v = struct.unpack('<I', self.d[self.p:self.p + 4])[0]
        self.p += 4
        return v

    def align(self):
        if self.w:
            self.p = (self.p + 3) & ~3

    def sz_or_ord(self):
        if self.w:
            if self.u16() == 0xffff:
                return '#%d' % self.u16()
            self.p -= 2
            e = self.p
            while self.d[e:e + 2] != b'\0\0':
                e += 2
            s = self.d[self.p:e].decode('utf-16-le')
            self.p = e + 2
            return s
        if self.d[self.p] == 0xff:
            self.p += 1
            return '#%d' % self.u16()
        e = self.d.index(0, self.p)
        s = self.d[self.p:e].decode('cp1252')
        self.p = e + 1
        return s


def dialog(d, wide):
    r = Rd(d, wide)
    ex = wide and d[:4] == b'\x01\x00\xff\xff'
    if ex:
        r.p = 4
        r.u32()  # help ID
        r.u32()  # ex style
        style = r.u32()
        n = r.u16()
    elif wide:
        style = r.u32()
        r.u32()
        n = r.u16()
    else:
        style = r.u32()
        n = r.d[r.p]
        r.p += 1
    x, y, w, h = (struct.unpack('<h', bytes(r.d[r.p + 2 * i:r.p + 2 * i + 2]))[0] for i in range(4))
    r.p += 8
    menu = r.sz_or_ord()
    cls = r.sz_or_ord()
    cap = r.sz_or_ord()
    font = None
    if style & 0x40:
        size = r.u16()
        if ex:
            r.u16()
            r.p += 2
        font = '%s %d' % (r.sz_or_ord(), size)
    out = {'caption': cap, 'frame': (x, y, w, h), 'font': font, 'style': style, 'items': []}
    for _ in range(n):
        r.align()
        if ex:
            r.u32()
            r.u32()
            st = r.u32()
            cx, cy, cw, ch = struct.unpack('<hhhh', r.d[r.p:r.p + 8])
            r.p += 8
            cid = r.u32()
        elif wide:
            st = r.u32()
            r.u32()
            cx, cy, cw, ch = struct.unpack('<hhhh', r.d[r.p:r.p + 8])
            r.p += 8
            cid = r.u16()
        else:
            cx, cy, cw, ch, cid = struct.unpack('<hhhhH', r.d[r.p:r.p + 10])
            r.p += 10
            st = r.u32()
        if wide:
            c = r.sz_or_ord()
            if c.startswith('#'):
                c = CLS.get(int(c[1:]), c)
        else:
            b = r.d[r.p]
            if b & 0x80:
                c = CLS.get(b, str(b))
                r.p += 1
            else:
                c = r.sz_or_ord()
        t = r.sz_or_ord()
        extra = r.u16() if wide else r.d[r.p]
        if not wide:
            r.p += 1
        r.p += extra
        kind = c
        if c == 'BUTTON':
            kind = BTN.get(st & 0xf, 'button %d' % (st & 0xf))
        elif c == 'SCROLLBAR':
            kind = 'scroll bar (%s)' % ('vertical' if st & 1 else 'horizontal')
        elif c == 'STATIC' and (st & 0x1f) == 3:
            kind = 'icon'
        elif c == 'STATIC' and (st & 0x1f) == 0xe:
            kind = 'bitmap'
        out['items'].append({'id': cid, 'class': kind, 'text': t, 'frame': (cx, cy, cw, ch),
                             'disabled': bool(st & 0x08000000), 'hidden': not st & 0x10000000})
    return out


def menu(d, wide):
    p, out, depth = 4, [], 0
    enc = 'utf-16-le' if wide else 'cp1252'
    step = 2 if wide else 1

    def text(p):
        e = p
        while d[e:e + step] != b'\0' * step:
            e += step
        return d[p:e].decode(enc).replace('\t', '  '), e + step
    stack = [False]
    while p < len(d) and stack:
        fl = struct.unpack('<H', d[p:p + 2])[0]
        p += 2
        if not fl & 0x10:
            p += 2  # the item's ID
        t, p = text(p)
        out.append('  ' * (len(stack) - 1) + (t or '-'))
        if fl & 0x10:
            stack.append(bool(fl & 0x80))
        elif fl & 0x80:
            while stack and stack.pop():
                pass
    return out


def strings(rid, d, wide):
    out, p = [], 0
    for i in range(16):
        if wide:
            n = struct.unpack('<H', d[p:p + 2])[0]
            s = d[p + 2:p + 2 + 2 * n].decode('utf-16-le')
            p += 2 + 2 * n
        else:
            n = d[p]
            s = d[p + 1:p + 1 + n].decode('cp1252')
            p += 1 + n
        if s:
            out.append(((rid - 1) * 16 + i, s))
    return out


def main(path, what='all'):
    raw = open(path, 'rb').read()
    off = struct.unpack('<I', raw[0x3c:0x40])[0]
    wide = raw[off:off + 4] == b'PE\0\0'
    res = list(pe_res(path) if wide else ne_res(path))
    if what in ('all', 'dialogs'):
        for t, rid, d in res:
            if t == 5:
                g = dialog(d, wide)
                print('dialog %s "%s" %s font %s' % (rid, g['caption'], g['frame'], g['font']))
                for it in g['items']:
                    print('  %5s %-14s %-40r %s%s%s' % (it['id'], it['class'], it['text'], it['frame'],
                                                         ' disabled' if it['disabled'] else '', ' hidden' if it['hidden'] else ''))
    if what in ('all', 'menus'):
        for t, rid, d in res:
            if t == 4:
                print('menu %s' % rid)
                for line in menu(d, wide):
                    print('  ' + line)
    if what in ('all', 'strings'):
        for t, rid, d in res:
            if t == 6:
                for i, s in strings(rid, d, wide):
                    print('string %d: %r' % (i, s))


if __name__ == '__main__':
    main(*sys.argv[1:])
