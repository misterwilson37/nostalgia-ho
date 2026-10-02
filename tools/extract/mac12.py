#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! 1.2 for the Macintosh
(the French edition, 1.2F, Upgrade Editions, 1992).

    pip install pillow
    unar "1.2 for 68k Mac French.sit"      (a StuffIt archive)
    python3 tools/extract/mac12.py "The Ho! 1.2/._TheHo 1.2 "

The program's resource fork is what's needed: unar leaves it in the
AppleDouble file "._TheHo 1.2 " (with its trailing space); a raw fork or an
HFS disk image with the program on it works too. Writes
assets/skins/mac12/ the same way tools/extract/mac3.py does for 3.0.1 (the
two programs keep their pictures, icons and sounds the same way and with
the same numbers). 1.2's own pictures are black and white; its colour
pictures were in a separate file, "TheHo F CPicts", which isn't in the
archive. Unlike 3.0.1 it also has the big 81x76 ship parts (PICT 2100-2426)
the DOS game has.

1.2's End Turn button says "Fin Tour" (French for end of turn). 3.0.1's
button is the same in English ("End Turn"), so if the 3.0.1 pictures have
been extracted (tools/extract/mac3.py) it is copied in as endturn.png.
"""
import json, os, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mac3  # noqa: E402

if __name__ == '__main__':
    out = os.path.join(mac3.ROOT, 'assets', 'skins', 'mac12')
    mac3.main(sys.argv[1], out=out)
    en = os.path.join(mac3.OUT, 'sprites', 'p5500.png')
    if os.path.exists(en):
        shutil.copy(en, os.path.join(out, 'sprites', 'endturn.png'))
        m = json.load(open(os.path.join(out, 'manifest.json')))
        m['sprites'] = sorted(set(m['sprites']) | {'endturn'})
        json.dump(m, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
        print('English End Turn button from 3.0.1 -> endturn.png')
