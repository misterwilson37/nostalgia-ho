#!/usr/bin/env python3
"""Pull the official translations out of the German DOS 2.0, the iOS game and
the French Mac 1.2F.

    python3 -I tools/extract/languages.py --dos-de <folder> --ios <SpacewardHo.app> --mac12 <fork>

Any of the three may be given alone: the others are kept as js/lang-data.js
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


def main(argv):
    a = dict(zip(argv[::2], argv[1::2]))
    if not set(a) & {'--dos-de', '--ios', '--mac12'}:
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
    js = ('// Generated by tools/extract/languages.py from the German DOS 2.0 (HO.PRS, DOSHO.EXE),\n'
          '// the iOS game (fr.lproj, tr.lproj, en.lproj objectdictionary.plist) and the French\n'
          '// Mac 1.2F (its STR# lists); js/languages.js maps them to the rulesets. Do not edit by hand.\n'
          '(function (root) {\nconst HOLANG = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n'
          "if (typeof module !== 'undefined') module.exports = HOLANG; else root.HOLANG = HOLANG;\n})(this);\n")
    open(out_js, 'w').write(js)
    print('js/lang-data.js:', len(data.get('dosDe', {}).get('s', {})), 'German DOS strings,',
          len(data.get('ios', {}).get('fr', {})), 'iOS lists,', len(data.get('mac12Fr', {})), '1.2F lists')


if __name__ == '__main__':
    main(sys.argv[1:])
