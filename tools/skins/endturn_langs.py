#!/usr/bin/env python3
"""End Turn buttons in German, French, Turkish and Spanish for the DOS 2.0, Mac 2.0.1
and Mac 3.0.1 skins (black and white and colour).

Those skins' End Turn button is a picture with the words drawn in, in one small pixel
font (the same 7-pixel capitals and 5-pixel small letters in DOS 2.0, Mac 2.0.1 and Mac
3.0.1 and in Mac 1.2F's own French button). This rebuilds that font from the originals'
own pictures and draws each language's button into each skin's English one, as
tools/skins/amiga_endturn.py does for the Amiga.

Where the letters come from (nothing is guessed: every letter that has an original is
copied from it, found by segmenting the pictures' columns):
  - E n d T u r:  the English button's "End Turn" (each skin's own picture)
  - Z u g E n d e (the German E is five pixels wide; the English one four):
                  the German DOS 2.0's own button "Zug Ende"
                  (assets/skins/dos/sprites/d5000-de.png, tools/extract/dos_de_buttons.py)
  - F i o:        Mac 1.2F's French button "Fin Tour" (assets/skins/mac12/sprites/p5500.png)
  - S B a t l and the dotless i (Turkish): none of the originals has them; drawn here
                  in the same strokes (GLYPHS_DRAWN). Marked in docs/translations.md.
As a check, the font re-draws each skin's English "End Turn" and must match the
picture pixel for pixel (see check_font).

What each language shows:
  - DOS 2.0:      de = the German DOS 2.0's own button (d5000-de, "Zug Ende / Strg+T",
                  copied, not drawn); fr, tr, es = the English button with the top words
                  changed and its "Ctrl+T" line kept (the keys are Ctrl on French,
                  Turkish and Spanish keyboards).
  - Mac skins:    de, fr, tr = the skin's English button with the top words changed and
                  its command-key line kept.
  - es, every skin: "Fin del turno" is 53 pixels wide, the button's face 42, so it is set
                  on two lines, "Fin del / turno", and the key line goes (as the
                  Amiga's French, Turkish and Spanish buttons do). The key still shows
                  in the button's hover text (T.endTurnKey).
The words are the remake's table's (js/ui-text.js, End Turn: Fin Tour, Zug Ende,
Sıran Bitti, Fin del turno); French is the word 1.2F's button shows.

    python3 -I tools/skins/endturn_langs.py            (from the repository root)

Writes <skin's dir>/sprites/d5000-<l>.png (dos) or p5500-<l>.png (mac2, mac2c, mac3, mac3c)
for l in fr, de, tr, es (the DOS German is copied from d5000-de.png) and lists them in the
manifests; --sheet <file.png> also writes a contact sheet."""
import json, os, sys
from collections import Counter
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SK = os.path.join(ROOT, 'assets', 'skins')
WORDS = {'fr': ('Fin Tour', None), 'de': ('Zug Ende', None), 'tr': ('Sıran Bitti', None), 'es': ('Fin del', 'turno')}
# skin dir, the English picture, its name stem (the output is <stem>-<lang>)
SKINS = [('dos', 'd5000'), ('mac2', 'p5500'), ('mac2c', 'p5500'), ('mac3', 'p5500'), ('mac3c', 'p5500')]
GLYPH_ROWS = 9  # from the capitals' top row: 7 for the capitals, 2 more for g's tail


def load(path):
    return Image.open(path).convert('RGBA')


def segments(im, x0, x1, y0, y1, is_ink):
    """Split the lettering in rows y0..y1-1 into letters at empty columns: a list of
    glyphs, each a list of GLYPH_ROWS strings ('#' ink)."""
    px = im.load()
    runs, cur = [], []
    for x in range(x0, x1):
        if any(is_ink(px[x, y]) for y in range(y0, y1)):
            cur.append(x)
        elif cur:
            runs.append(cur); cur = []
    if cur:
        runs.append(cur)
    out = []
    for r in runs:
        rows = [''.join('#' if is_ink(px[x, y]) else '.' for x in range(r[0], r[-1] + 1)) for y in range(y0, y1)]
        rows += ['.' * len(rows[0])] * (GLYPH_ROWS - len(rows))
        out.append(rows)
    return out


def ink_of(im, y0, y1, x0, x1, fill):
    c = Counter(im.getpixel((x, y)) for x in range(x0, x1) for y in range(y0, y1))
    c.pop(fill, None)
    return c.most_common(1)[0][0]


# Drawn here (no original has them), 5-pixel small letters from the 3rd row, capitals 7 high
def pad(rows, top):  # rows of a glyph whose first row is `top` rows below the capitals' top
    w = len(rows[0])
    return ['.' * w] * top + rows + ['.' * w] * (GLYPH_ROWS - top - len(rows))


GLYPHS_DRAWN = {
    'S': pad(['.###', '#..#', '#...', '.##.', '...#', '#..#', '###.'], 0),
    'B': pad(['###.', '#..#', '#..#', '###.', '#..#', '#..#', '###.'], 0),
    'a': pad(['.##.', '...#', '.###', '#..#', '.###'], 2),
    't': pad(['.#.', '.#.', '###', '.#.', '.#.', '.#.', '..#'], 0),
    'l': pad(['#'] * 7, 0),
    'ı': pad(['#'] * 5, 2),  # dotless i: the i's stem (from Mac 1.2F's i) without its dot
}


def build_font():
    f = {}
    # English "End Turn" (any skin's: the glyphs are the same; the DOS one, ink (0, 51, 51))
    en = load(os.path.join(SK, 'dos', 'sprites', 'd5000.png'))
    fill = en.getpixel((10, 6))
    ink = ink_of(en, 7, 14, 6, 44, fill)
    g = segments(en, 5, 46, 7, 16, lambda p: p == ink)
    assert len(g) == 7, len(g)
    for ch, glyph in zip('EndTurn', g):
        f.setdefault(ch, glyph)
        if ch in f and f[ch] != glyph:
            sys.exit('English glyph ' + ch + ' differs between its two uses')
    f['E4'] = f.pop('E')
    # German DOS 2.0's "Zug Ende"
    de = load(os.path.join(SK, 'dos', 'sprites', 'd5000-de.png'))
    fill_de = de.getpixel((10, 6))
    ink_de = ink_of(de, 7, 14, 6, 44, fill_de)
    g = segments(de, 5, 46, 7, 16, lambda p: p == ink_de)
    assert len(g) == 7, len(g)
    for ch, glyph in zip('ZugEnde', g):
        if ch in 'nd' and f[ch] != glyph:
            sys.exit('German glyph ' + ch + ' differs from the English one')
        if ch == 'E':
            f['E5'] = glyph
        elif ch not in f:
            f[ch] = glyph
        elif ch == 'u' and f[ch] != glyph:
            sys.exit('German glyph u differs from the English one')
    # Mac 1.2F's "Fin Tour" (black on white, rows 6..12)
    fr = load(os.path.join(SK, 'mac12', 'sprites', 'p5500.png'))
    blk = lambda p: p[:3] == (0, 0, 0)
    g = segments(fr, 7, 46, 6, 13, blk)
    assert len(g) == 7, len(g)
    for ch, glyph in zip('FinTour', g):
        if ch in 'nTur':
            if f[ch] != glyph:
                sys.exit('1.2F glyph ' + ch + ' differs from the DOS/English one')
        else:
            f[ch] = glyph
    f.update(GLYPHS_DRAWN)
    return f


def columns(font, word):
    cols = []
    for ch in word:
        if ch == ' ':
            cols += [['.'] * GLYPH_ROWS] * 3
            continue
        key = ch
        if ch == 'E':
            key = 'E5' if word == 'Zug Ende' else 'E4'
        g = font[key]
        cols += [[r[x] for r in g] for x in range(len(g[0]))]
        cols.append(['.'] * GLYPH_ROWS)
    while all(v == '.' for v in cols[-1]):
        cols.pop()
    return cols


def geometry(im):
    """The button face: its fill colour and its columns (left, right) at row 6."""
    fill = im.getpixel((25, 6))
    left = 25
    while im.getpixel((left - 1, 6)) == fill:
        left -= 1
    right = 25
    while im.getpixel((right + 1, 6)) == fill:
        right += 1
    return fill, left, right


def draw(im, cols, x_left, x_right, top, ink, fill_unused=None):
    px = im.load()
    x0 = x_left + (x_right - x_left + 1 - len(cols)) // 2
    for i, col in enumerate(cols):
        for y, v in enumerate(col):
            if v == '#':
                px[x0 + i, top + y] = ink
    return x0


def end_turn(base, font, lang, ink_top):
    im = base.copy()
    px = im.load()
    fill, left, right = geometry(base)
    first, second = WORDS[lang]
    y_clear_to = 28 if second else 16  # the whole face (with the key line), or just the top words
    for y in range(5, y_clear_to):
        for x in range(left, right + 1):
            px[x, y] = fill
    if second:
        for word, top in ((first, 8), (second, 17)):
            cols = columns(font, word)
            assert len(cols) <= right - left + 1, (word, len(cols))
            draw(im, cols, left, right, top, ink_top)
    else:
        cols = columns(font, first)
        assert len(cols) <= right - left + 1, (first, len(cols))
        draw(im, cols, left, right, 7, ink_top)
    return im


def check_font(font, skin, base):
    """The font re-draws the English "End Turn" exactly as the skin's picture has it."""
    fill, left, right = geometry(base)
    ink = ink_of(base, 7, 14, left, right + 1, fill)
    im = base.copy()
    px = im.load()
    for y in range(5, 16):
        for x in range(left, right + 1):
            px[x, y] = fill
    cols = columns(font, 'End Turn')
    draw(im, cols, left, right, 7, ink)
    if list(im.getdata()) != list(base.getdata()):
        diff = [(x, y) for y in range(base.height) for x in range(base.width) if im.getpixel((x, y)) != base.getpixel((x, y))]
        sys.exit(f'{skin}: the font does not re-draw the English button: {diff[:10]}')


def main():
    font = build_font()
    sheet = []
    for skin, stem in SKINS:
        d = os.path.join(SK, skin)
        base = load(os.path.join(d, 'sprites', stem + '.png'))
        check_font(font, skin, base)
        fill, left, right = geometry(base)
        ink = ink_of(base, 7, 14, left, right + 1, fill)
        names, row = [], [(skin + ' en', base)]
        for lang in ('de', 'fr', 'tr', 'es'):
            name = f'{stem}-{lang}'
            if skin == 'dos' and lang == 'de':
                im = load(os.path.join(d, 'sprites', name + '.png'))  # the original's, not drawn
            else:
                im = end_turn(base, font, lang, ink)
                im.save(os.path.join(d, 'sprites', name + '.png'), optimize=True)
            names.append(name)
            row.append((skin + ' ' + lang, im))
        mp = os.path.join(d, 'manifest.json')
        m = json.load(open(mp))
        m['sprites'] = sorted(set(m['sprites']) | set(names))
        json.dump(m, open(mp, 'w'), indent=1, ensure_ascii=False)
        sheet.append(row)
        print(skin, 'wrote', ', '.join(names))
    if '--sheet' in sys.argv:
        out = sys.argv[sys.argv.index('--sheet') + 1]
        S, pad_, lab = 5, 10, 14
        w = 5 * (60 * S) + pad_
        W = Image.new('RGB', (w, len(sheet) * (40 * S)), (192, 192, 192))
        for r, row in enumerate(sheet):
            for c, (_, im) in enumerate(row):
                big = im.resize((im.width * S, im.height * S), Image.NEAREST)
                W.paste(big, (c * 60 * S + pad_, r * 40 * S + 10), big)
        W.save(out)
        print('sheet', out)


if __name__ == '__main__':
    main()
