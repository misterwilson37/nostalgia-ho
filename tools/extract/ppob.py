#!/usr/bin/env python3
"""Read a Mac program's window layouts and words: Metrowerks PowerPlant 'PPob'
streams, and the Toolbox's own DLOG/DITL/ALRT, STR#, MENU, xmnu, Mcmd and Txtr.

    python3 tools/extract/ppob.py "<resource file>" [--md out.md] [--json out.json]
                                  [--title "<heading>"] [--intro <file of text>]

The argument is a resource fork: a raw fork ("Spaceward Ho!.rsrc" in 5.0.5's
Contents/Resources), an AppleDouble file ("._name"), or a file with the fork
tacked on as tools/extract/mac3.py's resource_fork leaves it. With no option it
prints the Markdown to stdout.

A PPob is a version word (2) and a stream of tags:
    'objd' len classID data   one object; `len` counts the class ID and the data
    'begs' / 'ends'           the previous object's sub-panes begin / end
    'dopl' classID            the next object may be made as this class instead
    'user' classID            (PowerPlant 1.x) the next object's superclass
    'comm' len text           a comment
    'end.'                    the end
Every pane starts with SPaneInfo (30 bytes: ID, width, height, visible,
enabled, bindings, left, top, userCon, superView). Views add SViewInfo (26:
image size, scroll position, scroll unit, reconcile). Appearance controls add
SControlInfo (16: value message, value, min, max), the control kind (the CDEF
proc ID), a Txtr ID and the title. The custom classes' fields come from the
program's own 'CTYP' resources (Constructor's custom type templates), so a class
of the program is read by its parent's format and then its own fields.
"""
import json
import struct
import sys

# --- the resource fork -------------------------------------------------------


def fork_bytes(path):
    d = open(path, 'rb').read()
    if d[:4] == b'\x00\x05\x16\x07':  # AppleDouble
        for k in range(struct.unpack('>H', d[24:26])[0]):
            eid, off, ln = struct.unpack('>III', d[26 + 12 * k:38 + 12 * k])
            if eid == 2:
                return d[off:off + ln]
        return b''
    return d


def resources(d):
    """{type: {id: (name, data)}} for a resource fork's bytes ({} if it isn't one)."""
    out = {}
    if len(d) < 16:
        return out
    do, mo, dl, ml = struct.unpack('>IIII', d[:16])
    if mo + ml > len(d) or do + dl > len(d) or ml < 30:
        return out
    m = d[mo:mo + ml]
    tlo, nlo = struct.unpack('>HH', m[24:28])
    n = (struct.unpack('>H', m[tlo:tlo + 2])[0] + 1) & 0xffff
    for i in range(n):
        o = tlo + 2 + 8 * i
        t, c, ref = struct.unpack('>4sHH', m[o:o + 8])
        t = t.decode('mac_roman')
        for j in range(c + 1):
            ro = tlo + ref + 12 * j
            rid, no, att = struct.unpack('>hHI', m[ro:ro + 8])
            off = att & 0xffffff
            name = None
            if no != 0xffff:
                p = nlo + no
                name = m[p + 1:p + 1 + m[p]].decode('mac_roman')
            ln = struct.unpack('>I', d[do + off:do + off + 4])[0]
            out.setdefault(t, {})[rid] = (name, d[do + off + 4:do + off + 4 + ln])
    return out


# --- a byte reader -------------------------------------------------------------


class R:
    def __init__(self, d, p=0):
        self.d, self.p = d, p

    def u8(self):
        v = self.d[self.p]
        self.p += 1
        return v

    def s16(self):
        v = struct.unpack('>h', self.d[self.p:self.p + 2])[0]
        self.p += 2
        return v

    def u16(self):
        return self.s16() & 0xffff

    def s32(self):
        v = struct.unpack('>i', self.d[self.p:self.p + 4])[0]
        self.p += 4
        return v

    def ost(self):
        v = self.d[self.p:self.p + 4]
        self.p += 4
        return ostype(v)

    def pstr(self):
        n = self.d[self.p]
        v = self.d[self.p + 1:self.p + 1 + n].decode('mac_roman')
        self.p += 1 + n
        return v

    def left(self):
        return len(self.d) - self.p


def ostype(b):
    if isinstance(b, int):
        b = struct.pack('>i', b)
    if all(32 <= c < 127 for c in b):
        return b.decode('ascii')
    return '0x' + b.hex()


def pane_id(v):
    """A pane ID as Constructor shows it: a number, or four letters."""
    b = struct.pack('>i', v)
    if v and all(32 <= c < 127 for c in b) and any(65 <= (c & 0xdf) <= 90 for c in b):
        return "'%s'" % b.decode('ascii')
    return str(v)


# --- PowerPlant's own classes ------------------------------------------------------

PANE, VIEW, CONTROL, CVIEW, ATTACH, WIND, DLOG, NONE = range(8)

# class -> (base format, what follows it)
STD = {
    'pane': (PANE, None), 'view': (VIEW, None), 'rgpv': (VIEW, None),
    'wind': (WIND, None), 'dlog': (DLOG, None), 'gwin': (WIND, None),
    'stxt': (CONTROL, None), 'push': (CONTROL, 'default'), 'chbx': (CONTROL, None),
    'rdbt': (CONTROL, None), 'sepl': (CONTROL, None), 'slid': (CONTROL, 'slider'),
    'popb': (CONTROL, 'popup'), 'pbar': (CONTROL, 'indeterminate'), 'sbar': (CONTROL, None),
    'etxt': (CONTROL, 'edit'), 'bbut': (CONTROL, 'rest'), 'litl': (CONTROL, 'rest'),
    'picd': (CVIEW, None), 'tgbx': (CVIEW, None), 'cbgb': (CVIEW, None), 'pgbx': (CVIEW, None),
    'tabs': (CVIEW, 'rest'), 'plcd': (CVIEW, None), 'whdr': (CVIEW, None),
    'pict': (VIEW, 'pict'), 'txtv': (VIEW, 'textview'), 'sclv': (VIEW, 'scroller'),
    'atch': (ATTACH, None), 'eras': (ATTACH, None), 'cers': (ATTACH, 'rest'), 'wtha': (ATTACH, 'theme'),
    'bcol': (ATTACH, 'rest'), 'pfrm': (ATTACH, 'rest'), 'tabg': (NONE, None), 'tbgv': (VIEW, None),
}

# Appearance Manager control kinds (CDEF proc IDs), for the dump
KINDS = {
    32: 'bevel button (small)', 33: 'bevel button (normal)', 34: 'bevel button (large)',
    57: 'slider, live, non-directional', 164: 'group box (secondary title)', 48: 'slider', 49: 'slider, live', 50: 'slider, ticks', 51: 'slider, live, ticks',
    54: 'slider, ticks pointing up', 55: 'slider, live, ticks up',
    80: 'progress bar', 144: 'separator line', 160: 'group box', 161: 'check box group box',
    162: 'popup group box', 272: 'edit text', 288: 'static text', 304: 'picture',
    305: 'picture (no tracking)', 368: 'push button', 369: 'check box', 370: 'radio button',
    384: 'scroll bar', 386: 'scroll bar, live', 400: 'popup button',
    401: 'popup button, fixed width', 128: 'tabs', 129: 'tabs, small', 256: 'placard',
}

WATTR = [(0x80000000, 'modal'), (0x40000000, 'floating'), (0x20000000, 'regular'),
         (0x10000000, 'close box'), (0x08000000, 'title bar'), (0x04000000, 'resizable'),
         (0x02000000, 'size box'), (0x01000000, 'zoomable'), (0x00800000, 'show new'),
         (0x00400000, 'enabled'), (0x00200000, 'targetable'), (0x00100000, 'get select click'),
         (0x00080000, 'hide on suspend'), (0x00040000, 'delay select'),
         (0x00020000, 'erase on update')]


def ctyp_classes(res):
    """The program's own classes from its CTYP resources:
    {classID: (name, parentID, [(field type, field name, bits)])}."""
    out = {}
    for rid, (name, d) in res.get('CTYP', {}).items():
        p, cls = 2, None
        while p + 4 <= len(d):
            tag = d[p:p + 4]
            p += 4
            if tag != b'objd':
                if tag == b'end.':
                    break
                continue
            ln = struct.unpack('>I', d[p:p + 4])[0]
            body = d[p + 4:p + 4 + ln]
            p += 4 + ln
            kind = body[:4].decode('mac_roman')
            nl = body[4]
            fname = body[5:5 + nl].decode('mac_roman')
            rest = body[5 + nl:]
            if kind == 'vpte':
                cid, parent = ostype(rest[3:7]), ostype(rest[7:11])
                cls = out.setdefault(cid, [fname, parent, []])
            elif cls is not None:
                if kind == 'intv':
                    bits = struct.unpack('>H', rest[14:16])[0]
                elif kind == 'resl':
                    bits = struct.unpack('>H', rest[14:16])[0]
                elif kind == 'pstr':
                    bits = 0
                else:
                    bits = None
                cls[2].append((kind, fname, bits))
    return {k: tuple(v) for k, v in out.items()}


def read_pane(r):
    pid, w, h = r.s32(), r.s16(), r.s16()
    vis, en = r.u8(), r.u8()
    binds = r.d[r.p:r.p + 4]
    r.p += 4
    left, top, ucon, sup = r.s32(), r.s32(), r.s32(), r.s32()
    o = {'id': pid, 'frame': [left, top, w, h]}
    if not vis:
        o['hidden'] = True
    if not en:
        o['disabled'] = True
    if any(binds):
        o['bindings'] = ''.join('LTRB'[i] for i in range(4) if binds[i])
    if ucon:
        o['userCon'] = ucon
    return o


def read_view(r, o):
    iw, ih, sx, sy, ux, uy = (r.s32() for _ in range(6))
    r.s16()  # reconcile overhang
    if iw or ih:
        o['image'] = [iw, ih]
    if (ux, uy) != (1, 1) and (ux or uy):
        o['scrollUnit'] = [ux, uy]


def read_control(r, o):
    msg, val, lo, hi = r.s32(), r.s32(), r.s32(), r.s32()
    kind = r.s16()
    o['kind'] = kind
    if msg:
        o['message'] = pane_id(msg)
    o['value'], o['min'], o['max'] = val, lo, hi
    return kind


def read_wind(r, o, cid):
    o['WIND'] = r.s16()
    layer = r.s16()
    o['layer'] = {0: 'modal', 1: 'floating', 2: 'regular'}.get(layer, str(layer))
    attrs = r.s32() & 0xffffffff
    o['attributes'] = [n for b, n in WATTR if attrs & b]
    mw, mh, xw, xh, sw, sh = (r.s16() for _ in range(6))
    o['minSize'] = [mw, mh]
    if xw != -1 or xh != -1:
        o['maxSize'] = [xw, xh]
    if sw != -1 or sh != -1:
        o['standardSize'] = [sw, sh]
    r.s32()
    if cid == 'dlog':
        o['defaultButton'], o['cancelButton'] = pane_id(r.s32()), pane_id(r.s32())


def read_object(cid, body, classes):
    """One object's fields, by its class (or the program's class's parent)."""
    chain = [cid]
    while chain[-1] not in STD and chain[-1] in classes:
        chain.append(classes[chain[-1]][1])
    base = chain[-1]
    o = {'class': cid}
    if cid in classes:
        o['className'] = classes[cid][0]
    if base != cid:
        o['base'] = base
    r = R(body)
    fmt, extra = STD.get(base, (None, None))
    try:
        if fmt in (WIND, DLOG):
            read_wind(r, o, base)
        elif fmt == ATTACH:
            msg = r.s32()
            r.u8(), r.u8()
            if msg not in (-2, 0):
                o['message'] = pane_id(msg)
            if extra == 'theme':
                o['brushes'] = [r.s16() for _ in range(4)]
        elif fmt in (PANE, VIEW, CONTROL, CVIEW):
            o.update(read_pane(r))
            if fmt in (VIEW, CVIEW):
                read_view(r, o)
            if fmt in (CONTROL, CVIEW):
                kind = read_control(r, o)
                if base == 'slid':
                    o['ticks'] = r.s16()
                else:
                    o['traits'] = r.s16()
                    o['title'] = r.pstr()
                if extra == 'default':
                    o['default'] = bool(r.u8())
                elif extra == 'popup':
                    # Appearance popup: min = MENU ID, max = title width, value = title style
                    o['MENU'] = o.pop('min')
                    o['titleWidth'] = o.pop('max')
                    o['resType'] = ostype(r.d[r.p:r.p + 4])
                    r.p += 4
                    o['initialItem'] = r.s16()
                    del o['value']
                elif extra == 'edit':
                    o['maxChars'] = r.s16()
                    o['editAttrs'] = r.u8()
                    o['keyFilter'] = r.u8()
                elif extra == 'indeterminate':
                    o['indeterminate'] = bool(r.u8())
                o['kindName'] = KINDS.get(kind, str(kind))
                if base in ('stxt', 'sepl', 'tgbx', 'etxt', 'pict', 'push', 'picd') and o.get('max') == 0:
                    for k in ('value', 'min', 'max'):
                        if o.get(k) == 0:
                            del o[k]
            if extra == 'pict':
                o['PICT'] = r.s16()
            elif extra == 'textview':
                r.s16()
                o['traits'] = r.s16()
                o['TEXT'] = r.s16()
            elif extra == 'scroller':
                o['indents'] = [r.s16() for _ in range(4)]
                o['scrollingView'] = pane_id(r.s32())
                r.u8()
        # the program's own fields, from its CTYP, parent's first
        for c in reversed(chain[:-1]):
            for kind, fname, bits in classes[c][2]:
                if r.left() < max(1, (bits or 8) // 8):
                    o['short'] = True  # an older build of the class, without this field
                    break
                if kind == 'pstr':
                    v = r.pstr()
                elif bits == 16:
                    v = r.s16()
                elif bits == 32:
                    v = r.s32()
                    if v and ('Pane ID' in fname or 'Control' in fname or fname.endswith(('Popup', 'Button', 'checkbox', 'IQ', 'System', 'Limit'))):
                        v = pane_id(v)
                elif bits == 8:
                    v = r.u8()
                else:
                    break
                o.setdefault('fields', {})[fname] = v
        if extra == 'rest' or r.left():
            if r.left():
                o['rest'] = r.d[r.p:].hex()
    except (struct.error, IndexError):
        o['unread'] = body.hex()
    return o


def read_ppob(d, classes):
    """A PPob as a tree: [{..., 'subs': [...]}]."""
    top = []
    stack = [top]
    last = None
    p = 2
    alias = None
    while p + 4 <= len(d):
        tag = d[p:p + 4]
        p += 4
        if tag == b'objd':
            ln = struct.unpack('>I', d[p:p + 4])[0]
            body = d[p + 4:p + 4 + ln]
            p += 4 + ln
            o = read_object(ostype(body[:4]), body[4:], classes)
            if alias:
                o['alias'] = alias
                alias = None
            stack[-1].append(o)
            last = o
        elif tag == b'begs':
            last.setdefault('subs', [])
            stack.append(last['subs'])
        elif tag == b'ends':
            stack.pop()
        elif tag in (b'dopl', b'user'):
            alias = ostype(d[p:p + 4])
            p += 4
        elif tag == b'comm':
            ln = struct.unpack('>I', d[p:p + 4])[0]
            p += 4 + ln
        elif tag == b'end.':
            break
        else:
            top.append({'class': '?', 'unread': d[p - 4:].hex()})
            break
    return top


# --- the Toolbox resources ------------------------------------------------------


def str_list(d):
    n = struct.unpack('>H', d[:2])[0]
    out, p = [], 2
    for _ in range(n):
        ln = d[p]
        out.append(d[p + 1:p + 1 + ln].decode('mac_roman'))
        p += 1 + ln
    return out


def txtr(d):
    r = R(d)
    size, style, just, mode = r.s16(), r.s16(), r.s16(), r.s16()
    col = [r.u16(), r.u16(), r.u16()]
    fnum = r.s16()
    fname = r.pstr()
    styles = [n for b, n in [(1, 'bold'), (2, 'italic'), (4, 'underline'), (8, 'outline'),
                             (16, 'shadow'), (32, 'condense'), (64, 'extend')] if style & b]
    js = {0: 'left', 1: 'center', -1: 'right', -2: 'force left'}.get(just, str(just))
    font = fname or {0: 'system font', 1: 'application font', 3: 'Geneva', 4: 'Monaco',
                     21: 'Helvetica', 22: 'Courier', 20: 'Times'}.get(fnum, 'font %d' % fnum)
    return {'size': size, 'style': styles, 'justification': js, 'mode': mode,
            'colour': '#%02x%02x%02x' % tuple(c >> 8 for c in col), 'font': font,
            'fontNumber': fnum}


def menu(d):
    r = R(d)
    mid = r.s16()
    r.p += 8
    enable = r.s32() & 0xffffffff
    title = r.pstr()
    items = []
    while r.left() and r.d[r.p]:
        name = r.pstr()
        icon, key, mark, style = r.u8(), r.u8(), r.u8(), r.u8()
        it = {'text': name}
        if key == 0x1b:
            it['submenu'] = mark
        elif key:
            it['key'] = chr(key)
        elif mark:
            it['mark'] = mark
        if name != '-' and len(items) < 31 and not enable & (1 << (len(items) + 1)):
            it['disabled'] = True
        items.append(it)
    return {'id': mid, 'title': title, 'items': items}


def mcmd(d):
    n = struct.unpack('>H', d[:2])[0]
    return [struct.unpack('>i', d[2 + 4 * i:6 + 4 * i])[0] for i in range(n)]


def xmnu(d):
    """Extended menu items: the command ID and modifier keys of each."""
    r = R(d)
    r.s16()  # version
    n = r.s16() + 1
    out = []
    for _ in range(n):
        if r.left() < 2:
            break
        typ = r.s16()
        if typ != 1:
            out.append(None)
            continue
        cmd = r.s32()
        mods = r.u8()
        r.u8()  # icon type
        r.s32()  # icon handle
        r.s32()  # text encoding
        r.s32(), r.s32()  # refcons
        sub, font, glyph = r.s16(), r.s16(), r.s16()
        out.append({'command': ostype(cmd) if cmd else 0, 'modifiers': mods,
                    'submenu': sub, 'glyph': glyph})
    return out


def wind_res(d):
    t, l, b, rr = struct.unpack('>hhhh', d[:8])
    proc, vis, goaway = struct.unpack('>hhh', d[8:14])
    title = d[19:19 + d[18]].decode('mac_roman')
    return {'rect': [l, t, rr - l, b - t], 'proc': proc, 'title': title,
            'closeBox': bool(goaway)}


def ditl(d):
    n = struct.unpack('>h', d[:2])[0] + 1
    out, p = [], 2
    kinds = {4: 'button', 5: 'check box', 6: 'radio button', 7: 'control', 8: 'static text',
             16: 'edit text', 32: 'icon', 64: 'picture', 0: 'user item'}
    for _ in range(n):
        t, l, b, rr = struct.unpack('>hhhh', d[p + 4:p + 12])
        typ = d[p + 12]
        ln = d[p + 13]
        data = d[p + 14:p + 14 + ln]
        k = typ & 0x7f
        it = {'kind': kinds.get(k, str(k)), 'frame': [l, t, rr - l, b - t]}
        if k in (4, 5, 6, 8, 16):
            it['text'] = data.decode('mac_roman')
        elif ln >= 2:
            it['id'] = struct.unpack('>h', data[:2])[0]
        if typ & 0x80:
            it['disabled'] = True
        out.append(it)
        p += 14 + ln + (ln & 1)
    return out


def cntl(d):
    t, l, b, rr, val, vis, mx, mn, proc = struct.unpack('>hhhhhhhhh', d[:18])
    title = d[23:23 + d[22]].decode('mac_roman')
    return {'frame': [l, t, rr - l, b - t], 'value': val, 'min': mn, 'max': mx,
            'proc': proc, 'title': title}


def read_all(d):
    res = resources(d)
    classes = ctyp_classes(res)
    out = {'types': {t: len(v) for t, v in sorted(res.items())}, 'classes': classes}
    out['PPob'] = {}
    for rid, (name, data) in sorted(res.get('PPob', {}).items()):
        w = {'name': name, 'panes': read_ppob(data, classes)}
        if rid in res.get('WIND', {}):
            w['WIND'] = wind_res(res['WIND'][rid][1])
        if rid in res.get('RidL', {}):
            rl = res['RidL'][rid][1]
            w['RidL'] = [pane_id(v) for v in mcmd(rl)]
        out['PPob'][rid] = w
    out['STR#'] = {rid: {'name': n, 'strings': str_list(v)} for rid, (n, v) in sorted(res.get('STR#', {}).items())}
    out['STR '] = {rid: {'name': n, 'string': v[1:1 + v[0]].decode('mac_roman')} for rid, (n, v) in sorted(res.get('STR ', {}).items()) if v}
    out['Txtr'] = {rid: dict(txtr(v), name=n) for rid, (n, v) in sorted(res.get('Txtr', {}).items())}
    out['MENU'] = {rid: dict(menu(v), name=n) for rid, (n, v) in sorted(res.get('MENU', {}).items())}
    out['Mcmd'] = {rid: mcmd(v) for rid, (n, v) in sorted(res.get('Mcmd', {}).items())}
    out['xmnu'] = {rid: xmnu(v) for rid, (n, v) in sorted(res.get('xmnu', {}).items())}
    out['MBAR'] = {rid: [struct.unpack('>h', v[2 + 2 * i:4 + 2 * i])[0] for i in range(struct.unpack('>h', v[:2])[0])]
                   for rid, (n, v) in sorted(res.get('MBAR', {}).items())}
    out['DLOG'] = {}
    for rid, (n, v) in sorted(res.get('DLOG', {}).items()):
        w = wind_res(v[:18] + v[20:])  # a DLOG is a WIND with the DITL ID before the title
        w['DITL'] = struct.unpack('>h', v[18:20])[0]
        w['name'] = n
        out['DLOG'][rid] = w
    out['ALRT'] = {rid: {'name': n, 'DITL': struct.unpack('>h', v[8:10])[0]} for rid, (n, v) in sorted(res.get('ALRT', {}).items())}
    out['DITL'] = {rid: {'name': n, 'items': ditl(v)} for rid, (n, v) in sorted(res.get('DITL', {}).items())}
    out['CNTL'] = {rid: dict(cntl(v), name=n) for rid, (n, v) in sorted(res.get('CNTL', {}).items())}
    return out


# --- the Markdown -------------------------------------------------------------------


def q(s):
    s = ''.join(c if c >= ' ' or c in '\r\n' else '\\x%02x' % ord(c) for c in s)
    return '"%s"' % s.replace('\r', '\\r').replace('\n', '\\n').replace('|', '\\|')


def pane_line(o):
    c = o['class']
    bits = ['`%s`' % c]
    if o.get('className'):
        bits[0] += ' (%s)' % o['className']
    if 'id' in o:
        bits.append('id %s' % pane_id(o['id']))
    if 'frame' in o:
        bits.append('(%d, %d, %d x %d)' % tuple(o['frame']))
    if o.get('title'):
        bits.append(q(o['title']))
    if 'kindName' in o and c not in ('stxt', 'push', 'chbx', 'rdbt', 'etxt', 'sepl'):
        bits.append(o['kindName'])
    for k in ('value', 'min', 'max', 'ticks', 'MENU', 'initialItem', 'titleWidth', 'maxChars',
              'PICT', 'TEXT', 'traits', 'message', 'scrollingView', 'brushes', 'image'):
        if k in o and o[k] not in (None, '') and not (k == 'traits' and o[k] == 0):
            v = o[k]
            if k == 'traits':
                k = 'Txtr'
            bits.append('%s %s' % (k, v))
    if o.get('default'):
        bits.append('**default**')
    for k in ('hidden', 'disabled'):
        if o.get(k):
            bits.append(k)
    if o.get('bindings'):
        bits.append('bound ' + o['bindings'])
    if o.get('fields'):
        bits.append('{' + ', '.join('%s: %s' % (k, q(v) if isinstance(v, str) and not v.startswith("'") else v) for k, v in o['fields'].items()) + '}')
    if o.get('rest'):
        bits.append('more: `%s`' % o['rest'])
    if o.get('unread'):
        bits.append('UNREAD: `%s`' % o['unread'][:80])
    if c in ('wind', 'dlog') or o.get('base') in ('wind', 'dlog'):
        bits.append('WIND %d, %s, %s, min %s' % (o['WIND'], o['layer'], ', '.join(o['attributes']), o['minSize']))
        if 'defaultButton' in o:
            bits.append('default button %s, cancel %s' % (o['defaultButton'], o['cancelButton']))
    return ' '.join(bits)


def md(data, title, intro=None):
    L = ['# %s' % title, '']
    if intro:
        L += [intro, '']
    L.append('Written by `tools/extract/ppob.py`. Frames are (left, top, width x height) '
             'in the parent pane; each pane\'s sub-panes are listed top to bottom, then left to right '
             '(the stream\'s own order is in the JSON); "Txtr n" is a text style (the table at the end).')
    L.append('')
    L.append('Resource types: ' + ', '.join('%s %d' % (t.replace(' ', '\u00a0'), n) for t, n in data['types'].items()) + '.')
    L.append('')
    if data['PPob']:
        L += ['## Window layouts (PPob)', '']
        for rid, w in data['PPob'].items():
            L.append('### PPob %d %s' % (rid, q(w['name'] or '')))
            L.append('')
            if 'WIND' in w:
                wd = w['WIND']
                L.append('WIND %d: title %s, %d x %d at (%d, %d), proc %d.' % (
                    rid, q(wd['title']), wd['rect'][2], wd['rect'][3], wd['rect'][0], wd['rect'][1], wd['proc']))
            if w.get('RidL'):
                L.append('RidL %d (listened to): %s.' % (rid, ', '.join(w['RidL'])))
            L.append('')

            def walk(ps, depth):
                for o in sorted(ps, key=lambda o: (o.get('frame', [0, 0])[1], o.get('frame', [0, 0])[0]) if 'frame' in o else (-1, -1)):
                    L.append('%s- %s' % ('  ' * depth, pane_line(o)))
                    walk(o.get('subs', []), depth + 1)
            walk(w['panes'], 0)
            L.append('')
    if data['DLOG'] or data['ALRT']:
        L += ['## Toolbox dialogs (DLOG, ALRT, DITL)', '']
        for rid, w in data['DLOG'].items():
            L.append('- DLOG %d %s: title %s, %d x %d, DITL %d' % (rid, q(w['name'] or ''), q(w['title']), w['rect'][2], w['rect'][3], w['DITL']))
        for rid, w in data['ALRT'].items():
            L.append('- ALRT %d %s: DITL %d' % (rid, q(w['name'] or ''), w['DITL']))
        L.append('')
        for rid, w in data['DITL'].items():
            L.append('DITL %d %s:' % (rid, q(w['name'] or '')))
            for it in w['items']:
                L.append('  - %s (%d, %d, %d x %d)%s%s' % (it['kind'], *it['frame'],
                                                         ' ' + q(it['text']) if 'text' in it else '',
                                                         ' id %d' % it['id'] if 'id' in it else ''))
            L.append('')
    if data['CNTL']:
        L += ['## Controls (CNTL)', '']
        for rid, c in data['CNTL'].items():
            L.append('- CNTL %d %s: %s, proc %d, value %d (%d to %d)' % (rid, q(c['name'] or ''), q(c['title']), c['proc'], c['value'], c['min'], c['max']))
        L.append('')
    if data['STR#'] or data['STR ']:
        L += ['## String lists (STR#)', '']
        for rid, s in data['STR#'].items():
            L.append('### STR# %d %s' % (rid, q(s['name'] or '')))
            L.append('')
            for i, t in enumerate(s['strings'], 1):
                L.append('%d. %s' % (i, q(t)))
            L.append('')
        for rid, s in data['STR '].items():
            L.append('- STR %d %s: %s' % (rid, q(s['name'] or ''), q(s['string'])))
        L.append('')
    if data['MENU']:
        L += ['## Menus (MENU, with their xmnu commands)', '']
        if data['MBAR']:
            L.append('Menu bars: ' + '; '.join('MBAR %d: %s' % (k, ', '.join(map(str, v))) for k, v in data['MBAR'].items()) + '.')
            L.append('')
        for rid, m in data['MENU'].items():
            xm = data['xmnu'].get(rid) or []
            mc = data['Mcmd'].get(rid) or []
            L.append('- MENU %d %s %s' % (rid, q(m['title']), '(%s)' % m['name'] if m['name'] else ''))
            for i, it in enumerate(m['items']):
                extra = []
                if it.get('key'):
                    extra.append('cmd-' + it['key'])
                if 'submenu' in it:
                    extra.append('submenu %d' % it['submenu'])
                if it.get('disabled'):
                    extra.append('disabled')
                if i < len(xm) and xm[i] and xm[i]['command']:
                    extra.append('command %s' % xm[i]['command'])
                if i < len(mc) and mc[i]:
                    extra.append('Mcmd %d' % mc[i])
                L.append('  - %s%s' % (q(it['text']), ' (' + ', '.join(extra) + ')' if extra else ''))
        L.append('')
    if data['Txtr']:
        L += ['## Text styles (Txtr)', '', '| Txtr | name | font | size | style | justification | colour |', '|---|---|---|---|---|---|---|']
        for rid, t in data['Txtr'].items():
            L.append('| %d | %s | %s | %d | %s | %s | %s |' % (rid, t['name'] or '', t['font'], t['size'], ', '.join(t['style']) or 'plain', t['justification'], t['colour']))
        L.append('')
    if data['classes']:
        L += ['## The program\'s own pane classes (CTYP)', '']
        for cid, (name, parent, fields) in sorted(data['classes'].items()):
            L.append('- `%s` %s (from `%s`)%s' % (cid, name, parent, ': ' + ', '.join(f[1] for f in fields) if fields else ''))
        L.append('')
    return '\n'.join(L) + '\n'


def main(argv):
    if not argv:
        sys.exit(__doc__)
    data = read_all(fork_bytes(argv[0]))
    title = 'Resources of ' + argv[0].split('/')[-1]
    if '--title' in argv:
        title = argv[argv.index('--title') + 1]
    intro = open(argv[argv.index('--intro') + 1]).read().strip() if '--intro' in argv else None
    text = md(data, title, intro)
    if '--json' in argv:
        json.dump(data, open(argv[argv.index('--json') + 1], 'w'), indent=1, default=str)
    if '--md' in argv:
        open(argv[argv.index('--md') + 1], 'w').write(text)
    elif '--json' not in argv:
        sys.stdout.write(text)


if __name__ == '__main__':
    main(sys.argv[1:])
