#!/usr/bin/env python3
"""Pull the official translations out of the German DOS 2.0, the iOS game and
the French Mac 1.2F.

    python3 -I tools/extract/languages.py --dos-de <folder> --ios <SpacewardHo.app> --mac12 <fork> --mac301 <fork> --mac301-en <fork> --mac20-en <fork>

Any of them may be given alone: the others are kept as js/lang-data.js
already has them.

--dos-de: the German DOS 2.0's program folder (HO.PRS and DOSHO.EXE, from
    the first disk; nothing in it is run). HO.PRS holds string table 0 as the
    English game's does (tools/extract/dos.py): the same ids, so each German
    string is the English one with the same id, entry for entry. DOSHO.EXE
    (not packed, unlike the English one, which is PKLITE'd) holds the lines
    the program keeps in its own data: the four Fix Spending lines, the Name
    a Star window's words and the battle window's "%s Tote"; each is found
    by the line before it in the program's data (below), which is the same
    in both languages.
--ios: the iOS app bundle (the folder with Info.plist; tools/extract/ios.py).
    Its fr.lproj and tr.lproj hold objectdictionary.plist, every string list
    the game reads, in French and Turkish, entry for entry with en.lproj's,
    and the help page (help_index.html, help_index_iphone.html and their
    pictures). The Android game's assets/fr.lproj and tr.lproj have the same
    lists (docs/android-findings.md) and the same pages.

Writes js/lang-data.js (HOLANG: the German DOS strings by id and the
program's own German lines; the iOS lists the remake reads, in en, fr and
tr) and assets/skins/ios/help-fr/, help-tr/ (the help pages). js/languages.js
maps them to the rulesets (rs.languages, rs.lang).
--mac12: the French Mac 1.2F's resource fork (unar leaves it in the AppleDouble
    file "._TheHo 1.2 ", tools/extract/mac12.py; a raw fork works too). Its
    STR# lists hold the game's own French text: the 59 report templates
    (STR# 1000, line for line DOS 2.0's strings 672-730), the battle window
    (1030), Fix Spending (1050), the class names (1006), the computer and ship
    names (1999-2004, entry for entry Mac 2.0.1's English lists) and the
    windows' words (1001, 1005, 1008, 1010, 1020, 4000). All of them are kept,
    by number (docs/12-findings.md, "Languages").
--mac20-en: the English Mac 2.0.1's resource fork (Spaceward_Ho!_2.0.1.rsrc, tools/extract/mac2.py): its
    windows only (DITL, MENU, DLOG, CNTL as --mac301's), into mac20En; --mac12 also keeps 1.2F's own
    windows beside its lists. 1.2F's windows and 2.0.1's are paired by (resource, index) where both
    have the same items (js/languages.js windows12): 1.2 is 2.0.1's game, cut down.
--mac301: the French Mac 3.0.1's resource fork ("The Ho! 3 F", Delta Tao and
    Upgrade Editions, 1993; vers 3.0.1, region France; unar leaves it in an
    AppleDouble file, as 1.2F's). Its STR# lists, by number as 1.2F's (the
    report templates 1000, the hints 3100, the windows' words 1005, 1010,
    1020, 3000-3002, 4000, 4001 ...), and the windows: each DITL's items
    ([kind, text]; a picture, icon or control as its number), each MENU (its
    title then its items, a command key after a tab), each DLOG's and CNTL's
    title. The numbers are the English 3.0.1's (docs/301fr-findings.md).
--mac301-en: the English Mac 3.0.1's resource fork (the program on the floppy
    tools/extract/mac3.py reads), the same extraction as --mac301, into
    mac301En. The French program keeps the English one's numbering, so a line
    of 3.0.1F is paired with its English by (resource, index) (js/languages.js);
    3.0.1F has a few more lines after the English's last (the training version's:
    1000.115-116, 1020.21-22, 4000.41, 4001.26-27) and the hints (3100), which
    the English 3.0.1 has no list for, and the English has the DITL and DLOG 4001
    that 3.0.1F hasn't.
"""
import json, os, plistlib, shutil, struct, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def prs_strings(path):
    """String table 0 of a PRS file: [u16 id] text NUL (tools/extract/dos.py)."""
    d = open(path, 'rb').read()
    p = 0x30
    while p + 28 <= len(d):
        t = d[p:p + 4].rstrip(b'\0').decode('latin1')
        rid = struct.unpack('<H', d[p + 4:p + 6])[0]
        ln = struct.unpack('<I', d[p + 24:p + 28])[0]
        if not t or ln < 28:
            break
        if t == 'STR' and rid == 0:
            s, q, out = d[p + 28:p + ln], 0, {}
            while q + 2 < len(s):
                i = struct.unpack('<H', s[q:q + 2])[0]
                e = s.find(b'\0', q + 2)
                if e < 0:
                    break
                out[i] = s[q + 2:e].decode('cp437')
                q = e + 1
            return out
        p += ln
    raise SystemExit('no string table 0 in ' + path)


def exe_after(d, anchor, n):
    """The n NUL-terminated lines that follow the line `anchor` in the
    program's data."""
    i = d.find(anchor + b'\0')
    if i < 0:
        raise SystemExit('not found in DOSHO.EXE: %r' % anchor)
    i += len(anchor) + 1
    out = []
    while len(out) < n:
        while d[i] == 0:
            i += 1
        e = d.index(b'\0', i)
        out.append(d[i:e].decode('cp437'))
        i = e + 1
    return out


def dos_de(folder):
    s = prs_strings(os.path.join(folder, 'HO.PRS'))
    d = open(os.path.join(folder, 'DOSHO.EXE'), 'rb').read()
    exe = {
        # FixSpending's lines, after the routine's debugging line (English:
        # "You have no spending problems." ... "You are abandoning %Fs.")
        'fixSpending': exe_after(d, b'temptot is %d after 1000 loops!', 4),
        # the battle window's dead colony, after CalcOneGroup's debugging line
        # (English "%s dead")
        'deadPeople': exe_after(d, b'CalcOneGroup: average is %d which is bad, setting to 1!', 1)[0],
        # the Name a Star window (NAMESTARDLGPROC's dialog "NameStarBox": its
        # text, then its field's label)
        'nameAStar': exe_after(d, b'NameStarBox', 2),
        # a fleet's line in the battle window, "one %s (%d/%d) %s" in English
        'fleetOne': exe_after(d, b'%0.15Fs (%d/%d) %0.15Fs', 1)[0],
    }
    return {'s': {str(k): v for k, v in sorted(s.items())}, 'exe': exe}


IOS_LISTS = ['Report Window Templates', 'Alert Strings', 'Help Messages', 'Misc Strings', 'sprintf Templates',
             'Star Names', 'Male Computer Names', 'Female Computer Names',
             'Scout Names', 'Dreadnought Names', 'Fighter Names', 'Tanker Names', 'Colony Ship Names', 'Satellite Names',
             'Biological Names', 'Ship Class Names',
             'Range Tech Strings', 'Speed Tech Strings', 'Weapons Tech Strings', 'Shield Tech Strings', 'Mini Tech Strings',
             'Radical Tech Strings']


def ios(app):
    from ios import load_png  # tools/extract/ios.py: the iPhone's CgBI PNGs
    out = {}
    for l in ('en', 'fr', 'tr'):
        lp = os.path.join(app, l + '.lproj')
        p = plistlib.load(open(os.path.join(lp, 'objectdictionary.plist'), 'rb'))
        out[l] = {k: p[k] for k in IOS_LISTS}
        if l == 'en':
            continue
        dest = os.path.join(ROOT, 'assets', 'skins', 'ios', 'help-' + l)
        shutil.rmtree(dest, ignore_errors=True)
        os.makedirs(dest)
        for f in sorted(os.listdir(lp)):
            if f.endswith('.html'):
                shutil.copy(os.path.join(lp, f), os.path.join(dest, f))
            elif f.endswith('.png'):
                load_png(os.path.join(lp, f)).save(os.path.join(dest, f), optimize=True)
    return out


def mac12(path):
    """1.2F's STR# lists, by resource number (Pascal strings, Mac Roman)."""
    import rsrc
    d = open(path, 'rb').read()
    if d[:4] == b'\x00\x05\x16\x07':  # AppleDouble: entry 2 is the resource fork
        n = struct.unpack('>H', d[24:26])[0]
        for i in range(n):
            eid, off, ln = struct.unpack('>III', d[26 + i * 12:38 + i * 12])
            if eid == 2:
                d = d[off:off + ln]
                break
    tmp = os.path.join(os.path.dirname(os.path.abspath(path)), '.mac12-fork.tmp')
    open(tmp, 'wb').write(d)
    try:
        res = rsrc.parse(tmp)
    finally:
        os.remove(tmp)
    out = {}
    for (t, rid), (_, b) in sorted(res.items(), key=lambda x: (x[0][0], x[0][1])):
        if t != 'STR#' or rid < 1000:
            continue
        n, p, lines = struct.unpack('>H', b[:2])[0], 2, []
        for _ in range(n):
            lines.append(b[p + 1:p + 1 + b[p]].decode('mac_roman'))
            p += 1 + b[p]
        out[str(rid)] = lines
    return out


def mac301(path):
    """3.0.1F's STR# lists by number (as mac12), and its windows' words."""
    import rsrc
    d = open(path, 'rb').read()
    if d[:4] == b'\x00\x05\x16\x07':  # AppleDouble: entry 2 is the resource fork
        n = struct.unpack('>H', d[24:26])[0]
        for i in range(n):
            eid, off, ln = struct.unpack('>III', d[26 + i * 12:38 + i * 12])
            if eid == 2:
                d = d[off:off + ln]
                break
    tmp = os.path.join(os.path.dirname(os.path.abspath(path)), '.mac301-fork.tmp')
    open(tmp, 'wb').write(d)
    try:
        res = rsrc.parse(tmp)
    finally:
        os.remove(tmp)
    text = lambda b: b.decode('mac_roman').replace('\r', '\n')
    def pstr(b, p):
        return text(b[p + 1:p + 1 + b[p]]), p + 1 + b[p]
    kinds = {4: 'button', 5: 'check', 6: 'radio', 8: 'text', 16: 'edit', 7: 'control', 32: 'icon', 64: 'pict', 0: 'user'}
    out = {'DITL': {}, 'MENU': {}, 'DLOG': {}, 'CNTL': {}}
    for (t, rid), (_, b) in sorted(res.items(), key=lambda x: (x[0][0], x[0][1])):
        if t == 'STR#' and rid >= 1000:
            n, p, lines = struct.unpack('>H', b[:2])[0], 2, []
            for _ in range(n):
                s, p = pstr(b, p)
                lines.append(s)
            out[str(rid)] = lines
        elif t == 'DITL':  # items: handle 4, rect 8, type 1, length 1, data (even)
            n, p, items = struct.unpack('>H', b[:2])[0] + 1, 2, []
            for _ in range(n):
                typ, ln = b[p + 12] & 0x7f, b[p + 13]
                data = b[p + 14:p + 14 + ln]
                p += 14 + ln + (ln & 1)
                k = kinds.get(typ, 'type%d' % typ)
                items.append([k, text(data) if typ in (4, 5, 6, 8, 16) else (struct.unpack('>h', data[:2])[0] if len(data) >= 2 else None)])
            out['DITL'][str(rid)] = items
        elif t == 'MENU':  # id, width, height, proc, filler, flags; title; items (name, icon, key, mark, style)
            title, p = pstr(b, 14)
            items = [title]
            while p < len(b) and b[p]:
                s, p = pstr(b, p)
                key = b[p + 1]
                p += 4
                items.append(s + ('\t' + chr(key) if key else ''))
            out['MENU'][str(rid)] = items
        elif t == 'DLOG':
            out['DLOG'][str(rid)] = pstr(b, 20)[0]
        elif t == 'CNTL':
            out['CNTL'][str(rid)] = pstr(b, 22)[0]
    return out


def windows(path):
    """A Mac program's windows only: each DITL's items, MENU, DLOG and CNTL (as mac301's)."""
    return {k: v for k, v in mac301(path).items() if not k.isdigit()}


def main(argv):
    a = dict(zip(argv[::2], argv[1::2]))
    if not set(a) & {'--dos-de', '--ios', '--mac12', '--mac301', '--mac301-en', '--mac20-en'}:
        raise SystemExit(__doc__)
    out_js = os.path.join(ROOT, 'js', 'lang-data.js')
    data = {}
    if os.path.exists(out_js):  # the sources not given are kept
        old = open(out_js).read()
        data = json.loads(old[old.index('const HOLANG = ') + 15:old.index(";\nif (typeof module")])
    if '--dos-de' in a:
        data['dosDe'] = dos_de(a['--dos-de'])
    if '--ios' in a:
        data['ios'] = ios(a['--ios'])
    if '--mac12' in a:
        data['mac12Fr'] = mac12(a['--mac12'])
        data['mac12Fr'].update(windows(a['--mac12']))   # and its windows, for 2.0's and 1.2's own French (js/languages.js windows12)
    if '--mac301' in a:
        data['mac301Fr'] = mac301(a['--mac301'])
    if '--mac301-en' in a:
        data['mac301En'] = mac301(a['--mac301-en'])
    if '--mac20-en' in a:
        data['mac20En'] = windows(a['--mac20-en'])   # the English Mac 2.0.1's windows, which 1.2F's are paired with
    js = ('// Generated by tools/extract/languages.py from the German DOS 2.0 (HO.PRS, DOSHO.EXE),\n'
          '// the iOS game (fr.lproj, tr.lproj, en.lproj objectdictionary.plist) and the French\n'
          '// Mac 1.2F and 3.0.1F (their STR# lists and windows) and the English Mac 3.0.1 and\n'
          '// 2.0.1 they are paired with (mac301En, mac20En: windows); js/languages.js maps them to the\n'
          '// rulesets. Do not edit by hand.\n'
          '(function (root) {\nconst HOLANG = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n'
          "if (typeof module !== 'undefined') module.exports = HOLANG; else root.HOLANG = HOLANG;\n})(this);\n")
    open(out_js, 'w').write(js)
    print('js/lang-data.js:', len(data.get('dosDe', {}).get('s', {})), 'German DOS strings,',
          len(data.get('ios', {}).get('fr', {})), 'iOS lists,', len(data.get('mac12Fr', {})), '1.2F lists,', len([k for k in data.get('mac301Fr', {}) if k.isdigit()]), '3.0.1F lists')


if __name__ == '__main__':
    main(sys.argv[1:])
