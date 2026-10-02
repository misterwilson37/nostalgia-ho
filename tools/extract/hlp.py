#!/usr/bin/env python3
"""Read a Windows help file (.HLP, WinHelp 3.0 / 3.1 / 4) and write it out as
plain HTML pages.

    pip install pillow            # only needed for the pictures
    python3 tools/extract/hlp.py HOHELP.HLP <out dir> [HOHELP.CNT] [--title T]

Writes <out dir>/index.html (a contents page: the .CNT tree when given, else
every topic in file order), one <name>.html per topic, style.css and the
pictures as bm<N>.png. Text is kept as it is in the help file.

The format, briefly (after Manfred Winterhoff's helpfile.txt / helpdeco):

* The file is a little file system. Header: magic 0x00035F3F, offset of the
  directory. Every internal file starts with a 9-byte header
  (reserved, used size, flags). The directory is a B-tree
  (magic 0x293B, 38-byte header, fixed-size pages; leaf pages are chained)
  mapping names (|SYSTEM, |TOPIC, |CONTEXT, |bm0, ...) to file offsets.
* |SYSTEM: version (minor 15 = HC 3.0, 21 = HC 3.1, 33 = HCW 4), flags
  (4 = LZ77 with 4k topic blocks, 8 = LZ77 with 2k blocks), title.
* |TOPIC is cut into topic blocks (2k for HC 3.0, else 4k), each with a
  12-byte header, then (maybe LZ77 compressed) data in which TopicLinks are
  chained. A TopicLink is a 21-byte header + LinkData1 (paragraph format and
  formatting commands) + LinkData2 (the text, as NUL separated strings,
  maybe phrase compressed). Record type 2 = topic header (title in
  LinkData2), 0x20 = text, 0x23 = table; HC 3.0 uses 1 for text.
  Text and commands alternate: string, command, string, command ...
* Phrase compression: |Phrases (old style: a byte 1..15 + next byte picks a
  phrase) or |PhrIndex + |PhrImage (Hall compression).
* Jumps name a topic by the hash of its context string; |CONTEXT maps the
  hash to a TOPICOFFSET (block << 15 + count of text characters before it in
  that block). HC 3.0 jumps instead carry a topic number, looked up in
  |TOMAP.
* |bmN pictures are SHG/MRB files holding DIBs/DDBs (RLE and/or LZ77
  packed); metafiles are skipped.
"""
import html, os, re, struct, sys

# --- primitives --------------------------------------------------------------

def lz77(data, limit=None):
    """WinHelp LZ77: a flag byte for every 8 items, bit set = (u16: length
    in the top 4 bits + 3, distance in the low 12 bits + 1)."""
    out = bytearray()
    i, n = 0, len(data)
    while i < n:
        flags = data[i]; i += 1
        for bit in range(8):
            if i >= n:
                break
            if flags & (1 << bit):
                if i + 1 >= n:
                    i = n; break
                code = data[i] | data[i + 1] << 8; i += 2
                length = (code >> 12) + 3
                start = len(out) - ((code & 0xFFF) + 1)
                for k in range(length):
                    out.append(out[start + k] if start + k >= 0 else 32)
            else:
                out.append(data[i]); i += 1
        if limit and len(out) >= limit:
            break
    return bytes(out)


def unrle(data):
    out = bytearray(); i = 0
    while i < len(data):
        n = data[i]; i += 1
        if n & 0x80:
            n &= 0x7F; out += data[i:i + n]; i += n
        else:
            if i < len(data):
                out += bytes([data[i]]) * n
            i += 1
    return bytes(out)


class Ptr:
    """A cursor over bytes with WinHelp's 'compressed' integers."""
    def __init__(self, data, pos=0):
        self.d, self.p = data, pos

    def u8(self):
        v = self.d[self.p]; self.p += 1; return v

    def u16(self):
        v = struct.unpack_from('<H', self.d, self.p)[0]; self.p += 2; return v

    def i16(self):
        v = struct.unpack_from('<h', self.d, self.p)[0]; self.p += 2; return v

    def i32(self):
        v = struct.unpack_from('<i', self.d, self.p)[0]; self.p += 4; return v

    def u32(self):
        v = struct.unpack_from('<I', self.d, self.p)[0]; self.p += 4; return v

    def cushort(self):   # 1 byte if bit 0 clear, else 2; value / 2
        if self.d[self.p] & 1:
            return self.u16() >> 1
        return self.u8() >> 1

    def cshort(self):
        if self.d[self.p] & 1:
            return (self.u16() >> 1) - 0x4000
        return (self.u8() >> 1) - 0x40

    def culong(self):    # 2 bytes if bit 0 clear, else 4
        if self.d[self.p] & 1:
            return self.u32() >> 1
        return self.u16() >> 1

    def clong(self):
        if self.d[self.p] & 1:
            return (self.u32() >> 1) - 0x40000000
        return (self.u16() >> 1) - 0x4000

    def cstr(self):
        e = self.d.index(b'\0', self.p); s = self.d[self.p:e]; self.p = e + 1
        return s


def btree_leaves(data):
    """Yield (data, offset of first entry, entry count) for each leaf page."""
    magic, flags, pagesize = struct.unpack_from('<HHH', data, 0)
    if magic != 0x293B:
        raise ValueError('not a B-tree')
    root, _neg, _total, nlevels = struct.unpack_from('<HhHH', data, 26)
    base = 38
    page = root
    for _ in range(nlevels - 1):            # index pages: first child
        page = struct.unpack_from('<h', data, base + page * pagesize + 4)[0]
    while page != -1:
        p = base + page * pagesize
        _unused, n, _prev, nxt = struct.unpack_from('<Hhhh', data, p)
        yield p + 8, n
        page = nxt


# context-string hash (|CONTEXT keys)
_HASHTAB = [0] * 256
for _c in range(256):
    ch = chr(_c)
    if '1' <= ch <= '9':
        _HASHTAB[_c] = _c - ord('0')
    elif ch == '0':
        _HASHTAB[_c] = 10
    elif ch == '.':
        _HASHTAB[_c] = 12
    elif ch == '_':
        _HASHTAB[_c] = 13
    elif 'A' <= ch <= 'Z':
        _HASHTAB[_c] = 17 + _c - ord('A')
    elif 'a' <= ch <= 'z':
        _HASHTAB[_c] = 17 + _c - ord('a')


def context_hash(name):
    h = 0
    for b in name.encode('cp1252', 'replace'):
        h = (h * 43 + _HASHTAB[b]) & 0xFFFFFFFF
    if h >= 0x80000000:
        h -= 0x100000000
    return h


# --- the help file -------------------------------------------------------------

class HelpFile:
    def __init__(self, path):
        self.data = open(path, 'rb').read()
        self.notes = []
        magic, dirstart = struct.unpack_from('<Ii', self.data, 0)
        if magic != 0x00035F3F:
            raise ValueError('not a WinHelp file')
        self.files = {}
        d = self._raw(dirstart)
        for p, n in btree_leaves(d):
            for _ in range(n):
                e = d.index(b'\0', p)
                name = d[p:e].decode('cp1252'); p = e + 1
                self.files[name] = struct.unpack_from('<i', d, p)[0]; p += 4
        self._system()
        self._fonts()
        self._phrases()
        self._topics()
        self._contexts()

    def _raw(self, off):
        _reserved, used, _flags = struct.unpack_from('<iiB', self.data, off)
        return self.data[off + 9: off + 9 + used]

    def file(self, name):
        return self._raw(self.files[name]) if name in self.files else None

    # |SYSTEM
    def _system(self):
        s = self.file('|SYSTEM')
        magic, self.minor, self.major, _date, flags = struct.unpack_from('<HHHIH', s, 0)
        self.title = ''
        self.hc30 = self.minor <= 16
        if self.hc30:
            self.title = Ptr(s, 12).cstr().decode('cp1252')
            self.lz, self.blocksize = False, 2048
        else:
            self.lz = flags in (4, 8)
            self.blocksize = 2048 if flags == 8 else 4096
            p = 12
            while p + 4 <= len(s):
                rtype, size = struct.unpack_from('<HH', s, p)
                if rtype == 1:
                    self.title = s[p + 4:p + 4 + size].split(b'\0')[0].decode('cp1252')
                p += 4 + size

    # |FONT: attributes per font number
    def _fonts(self):
        f = self.file('|FONT')
        self.fonts = []
        if not f:
            return
        nface, ndesc, faceoff, descoff = struct.unpack_from('<HHHH', f, 0)
        flen = (descoff - faceoff) // nface if nface else 32
        faces = [f[faceoff + i * flen: faceoff + (i + 1) * flen].split(b'\0')[0].decode('cp1252')
                 for i in range(nface)]
        for i in range(ndesc):
            p = descoff + i * 11
            attr, half, family, face = struct.unpack_from('<BBBH', f, p)
            fg = f[p + 5:p + 8]
            self.fonts.append({'bold': bool(attr & 1), 'italic': bool(attr & 2),
                               'underline': bool(attr & 4), 'size': half / 2,
                               'face': faces[face] if face < len(faces) else '',
                               'color': '#%02x%02x%02x' % tuple(fg)})

    # phrase tables
    def _phrases(self):
        self.phrases = None
        self.hall = False
        idx, img = self.file('|PhrIndex'), self.file('|PhrImage')
        if idx and img:
            self.hall = True
            p = Ptr(idx)
            p.i32(); entries = p.i32(); p.i32(); imgsize = p.i32(); imgcsize = p.i32(); p.i32()
            bits = p.u16() & 0xF; p.u16()
            if imgsize != imgcsize:
                img = lz77(img, imgsize)
            words = list(struct.unpack_from('<%dI' % ((len(idx) - p.p) // 4), idx, p.p))
            state = {'w': 0, 'm': 0}

            def bit():
                if state['m'] == 0 or state['m'] > 0x80000000:
                    state['v'] = words[state['w']] if state['w'] < len(words) else 0
                    state['w'] += 1; state['m'] = 1
                else:
                    state['m'] <<= 1
                r = (state['v'] & state['m']) != 0
                if state['m'] == 0x80000000:
                    state['m'] = 0x100000000   # next call loads a new word
                return r
            offs = [0]
            for _ in range(entries):
                n = 1
                while bit():
                    n += 1 << bits
                if bit(): n += 1
                if bits > 1 and bit(): n += 2
                if bits > 2 and bit(): n += 4
                if bits > 3 and bit(): n += 8
                if bits > 4 and bit(): n += 16
                offs.append(offs[-1] + n)
            self.phrases = [img[offs[i]:offs[i + 1]] for i in range(entries)]
            return
        ph = self.file('|Phrases')
        if not ph:
            return
        n, _one = struct.unpack_from('<HH', ph, 0)
        if self.hc30:
            offs = struct.unpack_from('<%dH' % (n + 1), ph, 4)
            body = ph[4:]
            self.phrases = [body[offs[i]:offs[i + 1]] for i in range(n)]
        else:
            size = struct.unpack_from('<i', ph, 4)[0]
            offs = struct.unpack_from('<%dH' % (n + 1), ph, 8)
            text = lz77(ph[8 + 2 * (n + 1):], size)
            base = 2 * (n + 1)
            self.phrases = [text[offs[i] - base:offs[i + 1] - base] for i in range(n)]

    def unphrase(self, data):
        out = bytearray(); i = 0
        if self.hall:
            while i < len(data):
                c = data[i]; i += 1
                if not c & 1:
                    out += self.phrases[c >> 1]
                elif not c & 2:
                    out += self.phrases[128 + (c >> 2) * 256 + data[i]]; i += 1
                elif not c & 4:
                    k = (c >> 3) + 1; out += data[i:i + k]; i += k
                elif not c & 8:
                    out += b' ' * ((c >> 4) + 1)
                else:
                    out += b'\0' * ((c >> 4) + 1)
            return bytes(out)
        while i < len(data):
            c = data[i]; i += 1
            if 0 < c < 0x10 and i < len(data):
                num = (c - 1) * 256 + data[i]; i += 1
                out += self.phrases[num >> 1]
                if num & 1:
                    out += b' '
            else:
                out.append(c)
        return bytes(out)

    # |TOPIC
    def _topics(self):
        t = self.file('|TOPIC')
        bs = self.blocksize
        self.blocks = []
        for b in range(0, len(t), bs):
            raw = t[b + 12:b + bs]
            self.blocks.append(lz77(raw, 0x4000) if self.lz else raw)
        self.span = 0x4000 if self.lz else bs - 12
        stream = bytearray()
        for i, blk in enumerate(self.blocks):
            blk = blk[:self.span]
            stream += blk + b'\0' * (self.span - len(blk))
        self.stream = bytes(stream)
        first = struct.unpack_from('<i', t, 4)[0]
        self.topics = []
        topic = None
        pos = self._pos(first) if not self.hc30 else 0
        seen = set()
        charblock, charcount = -1, 0
        while 0 <= pos < len(self.stream) - 21 and pos not in seen:
            seen.add(pos)
            bsize, dl2, prev, nxt, dl1, rtype = struct.unpack_from('<iiiiiB', self.stream, pos)
            if bsize <= 0 or dl1 < 21:
                break
            block = pos // self.span
            if block != charblock:
                charblock, charcount = block, 0
            ld1 = self.stream[pos + 21:pos + dl1]
            ld2 = self.stream[pos + dl1:pos + bsize]
            if self.hc30:
                # HC 3.0: DataLen2 is the stored length; old phrase codes
                ld1 = self.stream[pos + 21:pos + dl1]
                ld2 = self.stream[pos + dl1:pos + dl1 + (bsize - dl1)]
                if self.phrases:
                    ld2 = self.unphrase(ld2)
            elif dl2 > bsize - dl1 and self.phrases:
                ld2 = self.unphrase(ld2)
            offset = (charblock << 15) + charcount
            if self.hc30:   # |TOMAP holds block * 2048 + offset in block
                offset = (pos // self.span) * bs + pos % self.span + 12
            if rtype == 2:
                topic = {'offset': offset, 'num': len(self.topics), 'paras': [],
                         'title': '', 'macros': [], 'nonscroll': True}
                parts = ld2.split(b'\0')
                topic['title'] = parts[0].decode('cp1252') if parts else ''
                topic['macros'] = [x.decode('cp1252') for x in parts[1:] if x]
                if self.hc30:
                    topic['scroll'] = None
                else:
                    th = struct.unpack_from('<7i', ld1, 0)
                    topic['scroll'] = th[5]
                    topic['nonscrollpos'] = th[4]
                self.topics.append(topic)
            elif rtype in (1, 0x20, 0x23) and topic is not None:
                if not self.hc30:
                    ns, sc = topic.get('nonscrollpos', -1), topic.get('scroll', -1)
                    topic['nonscroll'] = ns != -1 and (sc == -1 or self._topicpos(pos) < sc)
                try:
                    paras = self._display(rtype, ld1, ld2, offset)
                except Exception as e:  # keep going; note it
                    self.notes.append('topic %r: record at %d not parsed (%s)' % (topic['title'], pos, e))
                    paras = [{'items': [('text', ld2.replace(b'\0', b' ').decode('cp1252'))],
                              'region': 'scroll'}]
                for p in paras:
                    p['nonscroll'] = topic['nonscroll'] and not self.hc30
                topic['paras'] += paras
                charcount += dl2 if not self.hc30 else 0
            if self.hc30:
                # HC 3.0: links follow each other; NextBlock is a relative
                # size that also counts the block headers in between
                pos += bsize
            else:
                if nxt == -1:
                    break
                pos = self._pos(nxt)

    def _pos(self, topicpos):
        if self.lz:
            return (topicpos >> 14) * self.span + (topicpos & 0x3FFF) - 12
        return (topicpos >> 14) * self.span + (topicpos & 0x3FFF) - 12

    def _topicpos(self, pos):
        return ((pos // self.span) << 14) + pos % self.span + 12

    def _display(self, rtype, ld1, ld2, offset):
        """Turn one text/table record into paragraphs: dicts with 'items'
        (('text', s) / ('font', n) / ('br',) / ('tab',) / ('jump', hash) /
        ('popup', hash) / ('topic', num) / ('end',) / ('pict', n)), 'align',
        'cell' (column, for tables) and 'row' (record id for tables)."""
        p = Ptr(ld1)
        strings = ld2.split(b'\0')
        si = [0]

        def nexts():
            s = strings[si[0]] if si[0] < len(strings) else b''
            si[0] += 1
            return s.decode('cp1252')

        if self.hc30 and rtype == 1:
            # HC 3.0 text record: same paragraph info without TopicSize/Length
            p.culong()   # TopicSize? (kept for layout)
        else:
            p.culong()       # TopicSize
            p.cushort()      # TopicLength
        table = rtype == 0x23
        cols = 0
        if table:
            cols = p.u8(); ttype = p.u8()
            if ttype in (0, 2):
                p.i16()
            for _ in range(cols):
                p.i16(); p.i16()
        paras = []
        cur = None
        first = True
        while p.p < len(ld1):
            col = None
            if table:
                col = p.i16()
                if col == -1:
                    break
                p.i16(); p.u8()
            elif not first:
                break
            first = False
            p.u8(); p.u8(); p.u16()   # unknown, unknown, id
            bits = p.u16()
            if bits & 0x0001: p.clong()
            for b in (0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040):
                if bits & b: p.cshort()
            if bits & 0x0100:
                p.u8(); p.i16()
            if bits & 0x0200:
                ntabs = p.cshort()
                for _ in range(ntabs):
                    stop = p.cushort()
                    if stop & 0x4000:
                        p.cushort()
            align = 'right' if bits & 0x0400 else 'center' if bits & 0x0800 else None
            cur = {'items': [], 'align': align, 'cell': col}
            paras.append(cur)
            while True:
                s = nexts()
                if s:
                    cur['items'].append(('text', s))
                if p.p >= len(ld1):
                    break
                c = p.u8()
                if c == 0xFF:
                    break
                if c == 0x20:
                    p.i32()
                elif c == 0x21:
                    p.i16()
                elif c == 0x80:
                    cur['items'].append(('font', p.u16()))
                elif c == 0x81:
                    cur['items'].append(('br',))
                elif c == 0x82:
                    # end of paragraph: start a new one with the same format
                    cur = {'items': [], 'align': align, 'cell': col}
                    paras.append(cur)
                elif c == 0x83:
                    cur['items'].append(('tab',))
                elif c in (0x86, 0x87, 0x88):
                    ptype = p.u8()
                    size = p.clong()
                    if ptype == 0x22:
                        p.cushort()      # number of hotspots
                    start = p.p
                    if ptype in (0x03, 0x22):
                        embedded, num = struct.unpack_from('<hh', ld1, start)
                        cur['items'].append(('pict', num, {0x86: 'char', 0x87: 'left', 0x88: 'right'}[c]))
                    else:
                        self.notes.append('embedded object type %#x skipped' % ptype)
                    p.p = start + size
                elif c == 0x89:
                    cur['items'].append(('end',))
                elif c in (0x8B,):
                    cur['items'].append(('text', ' '))
                elif c == 0x8C:
                    cur['items'].append(('text', '‑'))
                elif c in (0xC8, 0xCC):
                    n = p.i16(); p.p += n
                    cur['items'].append(('macro',))
                elif c in (0xE0, 0xE1):
                    cur['items'].append(('topic' if c == 0xE1 else 'popuptopic', p.i32()))
                elif c in (0xE2, 0xE3, 0xE6, 0xE7):
                    cur['items'].append(('popup' if c in (0xE2, 0xE6) else 'jump', p.i32()))
                elif c in (0xEA, 0xEB, 0xEE, 0xEF):
                    n = p.i16(); p.p += n
                    cur['items'].append(('extjump',))
                else:
                    raise ValueError('unknown command %#x' % c)
        # drop the trailing empty paragraph made by a final 0x82
        if paras and not paras[-1]['items'] and len(paras) > 1:
            paras.pop()
        return paras

    # |CONTEXT / |TOMAP
    def _contexts(self):
        self.context = {}
        c = self.file('|CONTEXT')
        if c:
            for p, n in btree_leaves(c):
                for _ in range(n):
                    h, off = struct.unpack_from('<ii', c, p); p += 8
                    self.context[h] = off
        # |TTLBTREE (topic offset -> title) is the authority on where topics
        # start; use it when it lists the same topics we found
        tt = self.file('|TTLBTREE')
        if tt and not self.hc30:
            offs = []
            for p, n in btree_leaves(tt):
                for _ in range(n):
                    offs.append(struct.unpack_from('<i', tt, p)[0])
                    p = tt.index(b'\0', p + 4) + 1
            if len(offs) == len(self.topics):
                for t, o in zip(self.topics, offs):
                    t['offset'] = o
            else:
                self.notes.append('|TTLBTREE has %d topics, |TOPIC %d' % (len(offs), len(self.topics)))
        self.tomap = []
        tm = self.file('|TOMAP')
        if tm:
            self.tomap = list(struct.unpack_from('<%di' % (len(tm) // 4), tm, 0))

    def topic_at(self, offset):
        """The topic containing a TOPICOFFSET."""
        best = None
        for t in self.topics:
            if t['offset'] <= offset:
                best = t
        return best

    def topic_for_hash(self, h):
        off = self.context.get(h)
        return None if off is None else self.topic_at(off)

    # pictures
    def picture(self, num):
        """Return a PIL image for |bm<num> (first DIB/DDB in it), or None."""
        data = self.file('|bm%d' % num)
        if data is None:          # HC 3.0 names them without the bar
            data = self.file('bm%d' % num)
        if data is None:
            return None
        try:
            from PIL import Image
        except ImportError:
            return None
        magic, npics = struct.unpack_from('<HH', data, 0)
        if magic not in (0x506C, 0x706C):
            return None
        best = None
        for k in range(npics):
            start = struct.unpack_from('<i', data, 4 + 4 * k)[0]
            p = Ptr(data, start)
            ptype, packing = p.u8(), p.u8()
            if ptype not in (5, 6):
                continue
            p.culong(); p.culong()   # dpi
            planes = p.cushort(); bitcount = p.cushort()
            w = p.culong(); h = p.culong()
            used = p.culong(); p.culong()
            csize = p.culong(); p.culong()
            coff = p.u32(); p.u32()
            ncol = used or (1 << bitcount if bitcount <= 8 else 0)
            if ptype == 5 and bitcount == 1 and not used:
                pal = b'\0\0\0\0\xff\xff\xff\0'
                ncol = 2
            else:
                pal = data[p.p:p.p + 4 * ncol]
            raw = data[start + coff:start + coff + csize]
            if packing in (2, 3):
                raw = lz77(raw)
            if packing in (1, 3):
                raw = unrle(raw)
            stride = ((w * bitcount + 31) // 32) * 4
            if ptype == 5:   # DDB rows are 2-byte aligned, top-down
                ddbstride = ((w * bitcount + 15) // 16) * 2
                rows = [raw[y * ddbstride:(y + 1) * ddbstride].ljust(stride, b'\0')
                        for y in range(h)]
                raw = b''.join(reversed(rows))
            raw = raw[:stride * h].ljust(stride * h, b'\0')
            hdr = struct.pack('<IiiHHIIiiII', 40, w, h, 1, bitcount, 0, len(raw), 0, 0, ncol, 0)
            bmp = b'BM' + struct.pack('<IHHI', 14 + 40 + len(pal) + len(raw), 0, 0,
                                      14 + 40 + len(pal)) + hdr + pal + raw
            import io
            img = Image.open(io.BytesIO(bmp))
            img.load()
            if best is None or bitcount > best[0]:
                best = (bitcount, img)
        return best[1] if best else None


# --- HTML ------------------------------------------------------------------------

STYLE = """\
body { margin: 0; background: #fbfaf6; color: #1d1d1b;
  font: 16px/1.5 Georgia, 'Times New Roman', serif; }
main { max-width: 42em; margin: 0 auto; padding: 1.25em 16px 3em; }
nav.top { font: 13px/1.4 Verdana, Arial, sans-serif; margin-bottom: 1em; }
nav.top a { margin-right: 1em; }
.band { font: bold 13px/1.4 Verdana, Arial, sans-serif; color: #555;
  border-bottom: 1px solid #ccc; padding-bottom: .4em; margin-bottom: .5em; }
.band p { margin: 0; }
h1 { font-size: 1.5em; line-height: 1.2; margin: .3em 0 .7em; }
p { margin: 0 0 .75em; }
p.center { text-align: center; }
p.right { text-align: right; }
a { color: #0a5a2a; }
a.popup { text-decoration: underline dotted; }
img { max-width: 100%; height: auto; vertical-align: middle; }
img.left { float: left; margin: 0 1em .5em 0; }
img.right { float: right; margin: 0 0 .5em 1em; }
table { border-collapse: collapse; margin: 0 0 1em; }
td { vertical-align: top; padding: .15em .8em .15em 0; }
td p { margin: 0 0 .3em; }
.tab { display: inline-block; width: 2em; }
.big { font-size: 1.2em; }
ul.contents { list-style: none; padding-left: 0; }
ul.contents ul { list-style: none; padding-left: 1.4em; margin: .2em 0 .6em; }
ul.contents > li > b { display: block; margin-top: .6em; }
footer { clear: both; margin-top: 2em; font: 12px Verdana, Arial, sans-serif; color: #777; }
@media (prefers-color-scheme: dark) {
  body { background: #1b1b19; color: #e4e2da; }
  a { color: #8fd3a5; }
  .band { color: #aaa; border-color: #444; }
}
"""


def slug(s):
    s = re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-').lower()
    return s[:48] or 'topic'


class Writer:
    def __init__(self, hlp, out, cnt=None, title=None):
        self.h, self.out = hlp, out
        self.title = title or hlp.title or 'Help'
        self.cnt = cnt
        self.pictures = {}
        self.names = {}
        used = set()
        for t in hlp.topics:
            base = slug(t['title']) if t['title'] else 'topic-%d' % t['num']
            name, k = base, 2
            while name in used or name == 'index':
                name = '%s-%d' % (base, k); k += 1
            used.add(name)
            self.names[t['num']] = name + '.html'

    def link_for(self, kind, val):
        h = self.h
        t = None
        if kind in ('jump', 'popup'):
            t = h.topic_for_hash(val)
        elif kind in ('topic', 'popuptopic'):
            if h.tomap and 0 <= val < len(h.tomap):
                t = h.topic_at(h.tomap[val])
            else:
                t = h.topic_at(val)
        return self.names[t['num']] if t else None

    def pict(self, num, where):
        if num not in self.pictures:
            img = self.h.picture(num)
            if img is None:
                self.pictures[num] = None
                self.h.notes.append('|bm%d not converted' % num)
            else:
                fn = 'bm%d.png' % num
                img.save(os.path.join(self.out, fn))
                self.pictures[num] = (fn, img.size)
        pic = self.pictures[num]
        if not pic:
            return ''
        fn, (w, ht) = pic
        cls = ' class="%s"' % where if where in ('left', 'right') else ''
        return '<img src="%s" width="%d" height="%d" alt=""%s>' % (fn, w, ht, cls)

    def para_html(self, para):
        fonts = self.h.fonts
        out = []
        open_tags = []
        link_open = [False]
        pending = [None]   # link waiting for its text

        def close_fmt():
            while open_tags:
                out.append('</%s>' % open_tags.pop())

        def set_font(n):
            close_fmt()
            if n < len(fonts):
                f = fonts[n]
                if f['bold']:
                    out.append('<b>'); open_tags.append('b')
                if f['italic']:
                    out.append('<i>'); open_tags.append('i')

        for it in para['items']:
            k = it[0]
            if k == 'text':
                out.append(html.escape(it[1], quote=False))
            elif k == 'font':
                set_font(it[1])
            elif k == 'br':
                out.append('<br>')
            elif k == 'tab':
                out.append('<span class="tab"> </span>')
            elif k == 'pict':
                out.append(self.pict(it[1], it[2]))
            elif k in ('jump', 'popup', 'topic', 'popuptopic', 'extjump'):
                close_fmt()
                href = self.link_for(k, it[1]) if k != 'extjump' else None
                if link_open[0]:
                    out.append('</a>')
                cls = ' class="popup"' if k in ('popup', 'popuptopic') else ''
                out.append('<a href="%s"%s>' % (href, cls) if href else '<a>')
                link_open[0] = True
            elif k == 'end':
                close_fmt()
                if link_open[0]:
                    out.append('</a>'); link_open[0] = False
        close_fmt()
        if link_open[0]:
            out.append('</a>')
        s = ''.join(out)
        s = s.replace('<a>', '').replace('<b></b>', '').replace('<i></i>', '')
        s = s.replace('</b><b>', '').replace('</i><i>', '')
        return s

    def is_empty(self, s):
        return not re.sub(r'<(?!img)[^>]*>|\s|&nbsp;', '', s)

    def body(self, topic):
        band, main = [], []
        rows = []
        for para in topic['paras']:
            s = self.para_html(para)
            target = band if para.get('nonscroll') else main
            if para.get('cell') is not None:
                if para['cell'] == 0 or not rows:
                    rows.append({})
                rows[-1].setdefault(para['cell'], []).append(s)
                continue
            if rows:
                target.append(self.table(rows)); rows = []
            if self.is_empty(s):
                continue
            cls = ' class="%s"' % para['align'] if para.get('align') else ''
            target.append('<p%s>%s</p>' % (cls, s))
        if rows:
            main.append(self.table(rows))
        return band, main

    def table(self, rows):
        out = ['<table>']
        for r in rows:
            out.append('<tr>' + ''.join(
                '<td>%s</td>' % ''.join('<p>%s</p>' % s for s in r[c] if not self.is_empty(s))
                for c in sorted(r)) + '</tr>')
        out.append('</table>')
        return '\n'.join(out)

    def page(self, title, inner, prev=None, nxt=None):
        nav = ['<a href="index.html">Contents</a>']
        if prev:
            nav.append('<a href="%s">&larr; Previous</a>' % prev)
        if nxt:
            nav.append('<a href="%s">Next &rarr;</a>' % nxt)
        return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<title>%s</title>\n<link rel="stylesheet" href="style.css">\n</head>\n'
                '<body>\n<main>\n<nav class="top">%s</nav>\n%s\n'
                '<footer>%s &mdash; converted from the WinHelp file.</footer>\n'
                '</main>\n</body>\n</html>\n') % (
                    html.escape(title), ' '.join(nav), inner, html.escape(self.title))

    def write(self):
        os.makedirs(self.out, exist_ok=True)
        with open(os.path.join(self.out, 'style.css'), 'w') as f:
            f.write(STYLE)
        order = self.contents_order()
        seq = [n for n in order]
        for t in self.h.topics:
            name = self.names[t['num']]
            band, main = self.body(t)
            if not band and not main:
                continue      # empty topics (e.g. the file's untitled first one)
            title = t['title'] or self.fallback_title(t, main)
            # the topic's first scrolling paragraph is usually its own title
            # in a bigger font; keep it (verbatim) as the page heading
            inner = []
            if band:
                inner.append('<div class="band">%s</div>' % '\n'.join(band))
            if main and re.sub(r'<[^>]+>', '', main[0]).strip() == html.escape(title, quote=False).strip():
                inner.append('<h1>%s</h1>' % re.sub(r'^<p[^>]*>|</p>$', '', main[0]))
                main = main[1:]
            elif t['title']:
                inner.append('<h1>%s</h1>' % html.escape(t['title']))
            inner += main
            i = seq.index(name) if name in seq else -1
            prev = seq[i - 1] if i > 0 else None
            nxt = seq[i + 1] if 0 <= i < len(seq) - 1 else None
            with open(os.path.join(self.out, name), 'w', encoding='utf-8') as f:
                f.write(self.page(title, '\n'.join(inner), prev, nxt))
        with open(os.path.join(self.out, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(self.page(self.title, self.contents_html()))

    def fallback_title(self, t, main):
        for s in main:
            txt = html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
            if txt:
                return txt[:60]
        return self.title

    def cnt_entries(self):
        if not self.cnt:
            return None
        ents = []
        for line in open(self.cnt, encoding='cp1252').read().splitlines():
            line = line.strip()
            if not line or line.startswith(':'):
                continue
            m = re.match(r'(\d+)\s+(.*)$', line)
            if not m:
                continue
            level, rest = int(m.group(1)), m.group(2)
            text, ctx = (rest.split('=', 1) + [None])[:2]
            name = None
            if ctx:
                ctx = ctx.split('@')[0].split('>')[0].strip()
                t = self.h.topic_for_hash(context_hash(ctx))
                if t:
                    name = self.names[t['num']]
                else:
                    self.h.notes.append('contents entry %r: context %s not found' % (text, ctx))
            ents.append((level, text, name))
        return ents

    def contents_order(self):
        ents = self.cnt_entries()
        if ents is None:
            return [self.names[t['num']] for t in self.h.topics if t['title']]
        seq = []
        for _l, _t, n in ents:
            if n and n not in seq:
                seq.append(n)
        return seq

    def contents_html(self):
        ents = self.cnt_entries()
        out = ['<h1>%s</h1>' % html.escape(self.title)]
        if ents is None:
            ents = [(1, t['title'], self.names[t['num']]) for t in self.h.topics if t['title']]
        listed = {n for _l, _t, n in ents if n}
        out.append('<ul class="contents">')
        depth = 1
        opened = [False]
        for i, (level, text, name) in enumerate(ents):
            while depth < level:
                out.append('<ul>'); depth += 1
            while depth > level:
                out.append('</ul></li>'); depth -= 1
            label = html.escape(text)
            nxt_level = ents[i + 1][0] if i + 1 < len(ents) else 0
            if name:
                item = '<a href="%s">%s</a>' % (name, label)
            else:
                item = '<b>%s</b>' % label
            if nxt_level > level:
                out.append('<li>%s' % item)
            else:
                out.append('<li>%s</li>' % item)
        while depth > 1:
            out.append('</ul></li>'); depth -= 1
        out.append('</ul>')
        extra = [t for t in self.h.topics if self.names[t['num']] not in listed and t['paras']
                 and any(not self.is_empty(self.para_html(p)) for p in t['paras'])]
        if extra:
            out.append('<h2>Other topics</h2>\n<ul class="contents">')
            for t in extra:
                band, main = self.body(t)
                out.append('<li><a href="%s">%s</a></li>' % (
                    self.names[t['num']], html.escape(t['title'] or self.fallback_title(t, main))))
            out.append('</ul>')
        return '\n'.join(out)


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    title = None
    if '--title' in argv:
        title = argv[argv.index('--title') + 1]
        args.remove(title)
    if len(args) < 2:
        sys.exit(__doc__)
    h = HelpFile(args[0])
    cnt = args[2] if len(args) > 2 else None
    w = Writer(h, args[1], cnt, title)
    w.write()
    print('%s: |SYSTEM version %d.%d, %d topics, %d contexts, phrases: %s' % (
        args[0], h.major, h.minor, len(h.topics), len(h.context),
        'Hall' if h.hall else ('old' if h.phrases else 'none')))
    for n in sorted(set(h.notes)):
        print('note:', n)


if __name__ == '__main__':
    main(sys.argv[1:])
