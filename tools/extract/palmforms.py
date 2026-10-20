#!/usr/bin/env python3
"""Print a Palm OS program's forms, alerts, string lists and menus, in words.

    python3 tools/extract/palmforms.py "Spaceward Ho.prc" [forms|alerts|strings|menus]

tFRM (a form: its title and objects), Talt (an alert: type, title, message,
buttons), tSTL (a string list: prefix, count, strings), tSTR (one string),
MBAR (a menu bar). A form is the 68K FormType: the window (40 bytes), the form
ID, attributes, default button, help string and menu bar, and a list of
objects, each (type, 0, offset) with its data at that offset; a string whose
pointer is 0 follows its object in place. The objects: field, control (button,
push button, check box, popup trigger, selector trigger, repeating button,
slider), list, table, bitmap, line, frame, rectangle, label, title, popup,
Graffiti state, gadget, scroll bar.
"""
import struct
import sys

OBJ = {0: 'field', 1: 'control', 2: 'list', 3: 'table', 4: 'bitmap', 5: 'line', 6: 'frame', 7: 'rectangle',
       8: 'label', 9: 'title', 10: 'popup', 11: 'graffiti state', 12: 'gadget', 13: 'scroll bar'}
CTL = {0: 'button', 1: 'push button', 2: 'check box', 3: 'popup trigger', 4: 'selector trigger',
       5: 'repeating button', 6: 'slider', 7: 'feedback slider'}


def prc(path):
    d = open(path, 'rb').read()
    n = struct.unpack('>H', d[76:78])[0]
    ents = [struct.unpack('>4sHI', d[78 + 10 * i:88 + 10 * i]) for i in range(n)]
    res = {}
    for i, (t, rid, off) in enumerate(ents):
        end = ents[i + 1][2] if i + 1 < n else len(d)
        res[(t.decode('latin1'), rid)] = d[off:end]
    return res


def cstr(d, p):
    e = d.index(0, p) if 0 in d[p:] else len(d)
    return d[p:e].decode('cp1252'), e + 1


def form(d):
    x, y, w, h = struct.unpack('>hhhh', d[10:18])
    fid, attr = struct.unpack('>HI', d[40:46])
    focus, default, help_, menu, n = struct.unpack('>hHHHH', d[54:64])
    out = {'id': fid, 'frame': (x, y, w, h), 'default': default, 'help': help_, 'menu': menu, 'objects': []}
    for i in range(n):
        typ = d[0x44 + 6 * i]
        off = struct.unpack('>I', d[0x46 + 6 * i:0x4a + 6 * i])[0]
        o = {'type': OBJ.get(typ, str(typ))}
        try:
            if typ == 9:  # title
                o['frame'] = struct.unpack('>hhhh', d[off:off + 8])
                o['text'] = cstr(d, off + 12)[0]
            elif typ == 8:  # label
                o['id'], lx, ly, la, font = struct.unpack('>HhhHB', d[off:off + 9])
                o['frame'] = (lx, ly)
                o['font'] = font
                o['text'] = cstr(d, off + 14)[0]
            elif typ == 1:  # control
                cid, cx, cy, cw, ch = struct.unpack('>Hhhhh', d[off:off + 10])
                cattr, style = struct.unpack('>HB', d[off + 14:off + 17])
                o.update(id=cid, frame=(cx, cy, cw, ch), kind=CTL.get(style, str(style)))
                if style in (6, 7):  # SliderControlType: thumb, background, attr, style, min, max, page, value
                    mn, mx, pg, val = struct.unpack('>hhhh', d[off + 18:off + 26])
                    o.update(min=mn, max=mx, value=val, page=pg)
                else:
                    group = d[off + 18]
                    if group:
                        o['group'] = group
                    if cattr & 0x0040:  # graphical: a bitmap and a selected bitmap, no text
                        o['bitmaps'] = struct.unpack('>HH', d[off + 10:off + 14])
                    else:
                        o['text'] = cstr(d, off + 20)[0]
                if cattr & 0x1000 and style in (1, 2):
                    o['on'] = True
                if not cattr & 0x8000:
                    o['hidden'] = True
            elif typ == 0:  # field
                fid2, fx, fy, fw, fh = struct.unpack('>Hhhhh', d[off:off + 10])
                o.update(id=fid2, frame=(fx, fy, fw, fh), maxChars=struct.unpack('>H', d[off + 28:off + 30])[0])
            elif typ == 2:  # list
                lid, lx, ly, lw, lh = struct.unpack('>Hhhhh', d[off:off + 10])
                n2 = struct.unpack('>H', d[off + 16:off + 18])[0]
                o.update(id=lid, frame=(lx, ly, lw, lh), items=[])
                p = off + 32 + 4 * n2
                for _ in range(n2):
                    s, p = cstr(d, p)
                    o['items'].append(s)
            elif typ == 10:  # popup: control, list
                o['control'], o['list'] = struct.unpack('>HH', d[off:off + 4])
            elif typ == 4:  # bitmap
                ba, bx, by, rid = struct.unpack('>Hhhh', d[off:off + 8])
                o.update(frame=(bx, by), bitmap=rid)
            elif typ == 12:  # gadget
                gid, ga, gx, gy, gw, gh = struct.unpack('>HHhhhh', d[off:off + 12])
                o.update(id=gid, frame=(gx, gy, gw, gh))
            elif typ == 13:  # scroll bar
                sx, sy, sw, sh, sid = struct.unpack('>hhhhH', d[off:off + 10])
                o.update(id=sid, frame=(sx, sy, sw, sh))
            elif typ == 3:  # table
                o['id'] = struct.unpack('>H', d[off:off + 2])[0]
                o['frame'] = struct.unpack('>hhhh', d[off + 2:off + 10])
        except (struct.error, ValueError):
            o['unread'] = True
        out['objects'].append(o)
    return out


def alert(d):
    typ, help_, nb, default = struct.unpack('>HHHH', d[:8])
    p = 8
    title, p = cstr(d, p)
    msg, p = cstr(d, p)
    btns = []
    for _ in range(nb):
        b, p = cstr(d, p)
        btns.append(b)
    return {'type': ['information', 'confirmation', 'warning', 'error'][typ] if typ < 4 else typ,
            'title': title, 'message': msg, 'buttons': btns, 'default': default}


def strlist(d):
    prefix, p = cstr(d, 0)
    n = struct.unpack('>H', d[p:p + 2])[0]
    p += 2
    out = []
    for _ in range(n):
        s, p = cstr(d, p)
        out.append(s)
    return prefix, out


def main(path, what='all'):
    r = prc(path)
    if what in ('all', 'forms'):
        for (t, rid), d in sorted(r.items()):
            if t != 'tFRM':
                continue
            f = form(d)
            print('tFRM %d (%d, %d, %d x %d) default button %d, help %d, menu %d' % (rid, *f['frame'], f['default'], f['help'], f['menu']))
            for o in f['objects']:
                bits = [o['type']]
                for k in ('kind', 'id', 'text', 'frame', 'items', 'min', 'max', 'value', 'maxChars', 'bitmap', 'bitmaps', 'group', 'control', 'list', 'on', 'hidden', 'unread'):
                    if k in o:
                        bits.append('%s %r' % (k, o[k]) if k not in ('kind', 'text') else repr(o[k]) if k == 'text' else o[k])
                print('  - ' + ' '.join(str(b) for b in bits))
    if what in ('all', 'alerts'):
        for (t, rid), d in sorted(r.items()):
            if t == 'Talt':
                a = alert(d)
                print('Talt %d %s %r: %r %s' % (rid, a['type'], a['title'], a['message'], a['buttons']))
    if what in ('all', 'strings'):
        for (t, rid), d in sorted(r.items()):
            if t == 'tSTL':
                pre, L = strlist(d)
                print('tSTL %d (prefix %r): %d strings' % (rid, pre, len(L)))
                for i, s in enumerate(L):
                    print('  %d. %r' % (i, s))
            elif t == 'tSTR':
                print('tSTR %d: %r' % (rid, cstr(d, 0)[0]))


if __name__ == '__main__':
    main(*sys.argv[1:])
