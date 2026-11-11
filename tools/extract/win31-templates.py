#!/usr/bin/env python3
"""Write the geometry of WINHO.EXE's 33 dialog templates (Spaceward Ho! 2.0 for Windows) as js/skins/dos/win31/templates.js.

    python3 -I tools/extract/win31-templates.py <WINHO.EXE> > js/skins/dos/win31/templates.js

For each DIALOG resource: its name (the program's name table: ABOUT, BATTLESPEED, ...), its frame in dialog units and window style; for each control: its id, its kind, its frame in dialog units
and its style bits. No words: a template's caption and its controls' texts are interface text (js/ui-text.js), given to the renderer
(js/skins/dos/win31/dialog.js) by the code that opens the dialog. Read with tools/extract/windlg.py (the same reader as
extracted/win-2.0/resources/dialogs.txt in the private repo).
"""
import json
import os
import re
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import windlg  # noqa: E402

BTN = {0: 'push', 1: 'def', 2: 'check', 3: 'autocheck', 4: 'radio', 5: '3state', 6: 'auto3state', 7: 'group', 9: 'autoradio', 11: 'owner'}
SS = {0: 'static', 1: 'static', 2: 'static', 3: 'icon', 4: 'blackrect', 5: 'grayrect', 6: 'whiterect', 7: 'blackframe', 8: 'grayframe',
      9: 'whiteframe', 0xb: 'static', 0xc: 'static', 0xe: 'bitmap'}


def kind(it):
    c, st = it['cls'], it['style']
    if c == 'BUTTON':
        return BTN.get(st & 0xf, 'button')
    if c == 'STATIC':
        return SS.get(st & 0x1f, 'static')
    if c == 'SCROLLBAR':
        return 'vscroll' if st & 1 else 'hscroll'
    return {'EDIT': 'edit', 'LISTBOX': 'listbox', 'COMBOBOX': 'combo'}.get(c, 'class:' + c)


def names(path):
    # the program's name table (RT_NAMETABLE, type 15: Borland's resource compiler keeps each named resource's name): ABOUT, BATTLESPEED, ...
    out = {}
    for t, rid, d in windlg.ne_res(path):
        p = 0
        while t == 15 and p + 7 <= len(d):
            ln = struct.unpack('<H', d[p:p + 2])[0]
            if not ln:
                break
            typ, idn = struct.unpack('<HH', d[p + 2:p + 6])
            if typ == 5:
                out[idn & 0x7fff] = d[p + 7:p + ln].split(b'\0')[0].decode('ascii')
            p += ln
    return out


def main(path):
    nm = names(path)
    raw = open(path, 'rb').read()
    off = struct.unpack('<I', raw[0x3c:0x40])[0]
    assert raw[off:off + 2] == b'NE', 'a 16-bit Windows program (NE) is expected'
    out = {}
    for t, rid, d in windlg.ne_res(path):
        if t != 5:
            continue
        g = windlg.dialog(d, False)
        x, y, w, h = g['frame']
        out[rid] = {'name': nm.get(rid, ''), 'x': x, 'y': y, 'w': w, 'h': h, 'style': g['style'], 'caption': bool(g['caption']),
                    'items': [[it['id'], kind(it), *it['frame'], it['style']] for it in g['items']]}
    rows = ',\n'.join('  %d: %s' % (k, json.dumps(v, separators=(',', ':'))) for k, v in sorted(out.items()))
    rows = re.sub(r'"style":(\d+)', lambda m: '"style":0x%X' % int(m.group(1)), rows)  # (style bits in hex)
    rows = re.sub(r',(\d{6,})\]', lambda m: ',0x%X]' % int(m.group(1)), rows)
    print('''// Spaceward Ho! 2.0 for Windows (WINHO.EXE, the SpcHo3x collection's build): the geometry of its %d dialog templates, made by
// tools/extract/win31-templates.py. name: the program's own (its name table, RT_NAMETABLE). Frames in dialog units (x, y, w, h); style: the window style bits (WS_CAPTION 0xC00000, WS_SYSMENU 0x80000,
// DS_MODALFRAME 0x80, WS_BORDER 0x800000); caption: the template has a title. Each control: [id, kind, x, y, w, h, style bits]. The words are
// not here: they come through js/ui-text.js from the code that opens a dialog (js/skins/dos/win31/dialog.js).
(function (root) {
'use strict';
root.HOWIN31 = root.HOWIN31 || {};
root.HOWIN31.templates = {
%s
};
})(typeof window !== 'undefined' ? window : globalThis);''' % (len(out), rows))


if __name__ == '__main__':
    main(sys.argv[1])
