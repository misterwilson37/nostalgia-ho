#!/usr/bin/env python3
"""The Amiga skin's End Turn buttons in English (the patch's), French, Turkish and Spanish.

The Amiga's own button is the German one ("Zug Ende / Amiga+Z", d5000, from the
game's image16.pff). The Amiga English edition (2.1, 1995) has no other: its disk's
pictures are the same bytes as the German disk's, and so is its disk 2, so the
skin shows d5000 in English too, as released. This draws the others into it, in the
same lettering: its E, n, d and u were copied from the German lettering (the
Amiga+Z line is the German's own); D, T, r and the letters the other words need (F, S, B,
o, t, l, i, dotless i, a, e) are drawn here to match, 5 pixels wide, the capitals 7
high, the small letters 5.

- English, endturn.png, shown by the patch (fix amigaEndTurnEn): "Do Turn", the Amiga
  English's own word for the command (menu string 842), over the German button's own
  "Amiga+Z" line.
- French, Turkish, Spanish: there was never an Amiga release in those languages; the
  buttons are the remake's own, two lines of words, the skin's own (js/skins/amiga/ui.js
  WORDS.endTurn: Fin Tour, from the French Mac 1.2's button, Sıran Bitti, iOS's Turkish,
  Fin del turno, the remake's Spanish), set on two lines as the German one is; a button
  that says more than two lines' width of letters breaks "Fin del turno" as "Fin del / turno".

    python3 -I tools/skins/amiga_endturn.py            (from the repository root)

Reads assets/skins/amiga/sprites/d5000.png, writes endturn.png (English),
endturn-fr.png, endturn-tr.png, endturn-es.png beside it and lists them in
assets/skins/amiga/manifest.json."""
import json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SPR = os.path.join(ROOT, 'assets', 'skins', 'amiga', 'sprites')
GLYPHS = {
    'D': ['####.', '.#..#', '.#..#', '.#..#', '.#..#', '.#..#', '####.'],
    'E': ['#####', '.#..#', '.#...', '.###.', '.#...', '.#..#', '#####'],
    'T': ['#####', '#.#.#', '..#..', '..#..', '..#..', '..#..', '.###.'],
    'F': ['#####', '.#..#', '.#...', '.###.', '.#...', '.#...', '###..'],
    'S': ['.####', '#...#', '#....', '.###.', '....#', '#...#', '####.'],
    'B': ['####.', '.#..#', '.#..#', '.###.', '.#..#', '.#..#', '####.'],
    'n': ['.....', '.....', '###..', '#..#.', '#..#.', '#..#.', '##.##'],
    'd': ['..##.', '...#.', '.###.', '#..#.', '#..#.', '#..#.', '.##.#'],
    'u': ['.....', '.....', '#..#.', '#..#.', '#..#.', '#..#.', '.##.#'],
    'r': ['....', '....', '#.##', '##..', '#...', '#...', '##..'],
    'o': ['.....', '.....', '.##..', '#..#.', '#..#.', '#..#.', '.##..'],
    'e': ['.....', '.....', '.##..', '#..#.', '####.', '#....', '.###.'],
    'a': ['.....', '.....', '.##..', '...#.', '.###.', '#..#.', '.####'],
    't': ['.#..', '.#..', '###.', '.#..', '.#..', '.#.#', '..#.'],
    'l': ['##...', '.#...', '.#...', '.#...', '.#...', '.#...', '###..'],
    'i': ['.#.', '...', '##.', '.#.', '.#.', '.#.', '###'],
    'ı': ['...', '...', '##.', '.#.', '.#.', '.#.', '###'],
}
JOINED = 'ndu'  # these end in a serif that touches the next letter
LINES = {
    'en': ('Do Turn', None),  # (None: the German button's own second line, Amiga+Z, stays)
    'fr': ('Fin', 'Tour'),
    'tr': ('Sıran', 'Bitti'),
    'es': ('Fin del', 'turno'),
}


def columns(word):
    cols = []
    for ch in word:
        if ch == ' ':
            cols += [['.'] * 7] * 3
            continue
        g = GLYPHS[ch]
        cols += [[r[x] for r in g] for x in range(len(g[0]))]
        if ch not in JOINED:
            cols.append(['.'] * 7)
    while all(v == '.' for v in cols[-1]):
        cols.pop()
    return cols


def end_turn(button, lines):
    im = button.copy()
    px = im.load()
    for y in range(6, 27 if lines[1] else 17):  # clear the German text (just its first line where the second stays)
        for x in range(3, 44):
            px[x, y] = (51, 204, 255, 255)
    for word, top in zip(lines, (6, 18)):
        if word is None:
            continue
        cols = columns(word)
        assert len(cols) <= 41, (word, len(cols))
        x0 = 3 + (41 - len(cols)) // 2
        for i, col in enumerate(cols):
            for y, v in enumerate(col):
                if v == '#':
                    px[x0 + i, top + y] = (0, 0, 0, 255)
    return im


def main():
    german = Image.open(os.path.join(SPR, 'd5000.png')).convert('RGBA')
    names = []
    for lang, lines in LINES.items():
        name = 'endturn' if lang == 'en' else 'endturn-' + lang
        end_turn(german, lines).save(os.path.join(SPR, name + '.png'), optimize=True)
        names.append(name)
    mp = os.path.join(ROOT, 'assets', 'skins', 'amiga', 'manifest.json')
    m = json.load(open(mp))
    key = 'sprites' if isinstance(m, dict) and 'sprites' in m else None
    if key:
        m[key] = sorted(set(m[key]) | set(names))
        json.dump(m, open(mp, 'w'), indent=1, ensure_ascii=False)
    print('wrote', ', '.join(names))


if __name__ == '__main__':
    main()
