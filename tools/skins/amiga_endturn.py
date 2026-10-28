#!/usr/bin/env python3
"""The Amiga skin's End Turn buttons in English, French, Turkish and Spanish.

The Amiga's own button is the German one ("Zug Ende / Amiga+Z", d5000, from the
game's image16.pff). The Amiga has no other: the English 2.1 disk's pictures are
the same bytes. The remake draws the other languages' buttons into it, in the same
lettering: its E, n, d and u were copied from the German lettering (tools/extract/
amiga.py drew the English one this way first); T, r and the letters the other
words need (F, S, B, o, t, l, i, dotless i, a, e) are drawn here to match, 5 pixels
wide, the capitals 7 high, the small letters 5. The words are the skin's own
(js/skins/amiga/ui.js WORDS.endTurn: Fin Tour, from the French Mac 1.2's button,
Sıran Bitti, iOS's Turkish, Fin del turno, the remake's Spanish), set on two lines
as the German one is; a button that says more than two lines' width of letters
breaks "Fin del turno" as "Fin del / turno".

    python3 -I tools/skins/amiga_endturn.py            (from the repository root)

Reads assets/skins/amiga/sprites/d5000.png, writes endturn.png (English),
endturn-fr.png, endturn-tr.png, endturn-es.png beside it and lists them in
assets/skins/amiga/manifest.json."""
import json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SPR = os.path.join(ROOT, 'assets', 'skins', 'amiga', 'sprites')
GLYPHS = {
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
    'en': ('End', 'Turn'),
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
    for y in range(6, 27):  # clear the German text
        for x in range(3, 44):
            px[x, y] = (51, 204, 255, 255)
    for word, top in zip(lines, (6, 18)):
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
