#!/usr/bin/env python3
"""The Mac 1.0 skin's map pictures (assets/skins/mac10/sprites), from the 1990 manual.

No copy of Spaceward Ho! 1.0 (1990) is known, so its icons can't be extracted. Its manual (Delta Tao, 1990, provided by PC Games
Vault, pcgamesvault.com; Jake's 300 dpi scans in the private repo, originals/mac-1.0-manual/scans-300dpi) prints the four kinds of star
on pages 8-11 and a Star Map on page 9. At 300 dpi a Mac pixel is 8.3 to 8.4 scan pixels, sharp enough to read every one: each
figure was fitted (tools/skins/mac10_scan_grid.py) with a pixel grid (its pitch and offset chosen to make the cells most black-or-white; every fit scored 0.497 to
0.500 of 0.5) and each cell's middle sampled. The grids below are that output, cropped to the picture:

- COLONY (Canopus, p. 8: the cowboy hat on the planet), EXPLORED (Adhara, p. 10), ENEMY (Merak, p. 11: the bandit): their own
  figures; UNEXPLORED: Mizar on the Star Map (p. 9; its p. 11 figure gives the same 22 x 23 picture);
- selected (Nasl, p. 9, which "looks funny because it is selected"): Nasl is Mizar with every pixel inside the picture's outline
  inverted, the outline too (the Finder's selected icon), so its outer ring goes black; its name is drawn bold (the map's code);
- the fleet dot (Adhara, p. 10): a 5 x 5 checkerboard, its top left 16 right of the planet's middle and 20 above it.

The bad guys. The manual shows one ("Enemy planets look like a wide variety of bad guys", p. 11) and 1.0 took 10 players, so at
most nine rivals: BAD[0] is the manual's bandit in a bowler (Jake, 26 Nov 2026: "try a bowler hat instead of flat hat"), BAD[1] the
manual's bandit as printed; BAD[2] to BAD[8] are the remake's own (GUESS: drawn here, not in the manual), the same head and body with
another hat (top hat, Stetson, sombrero) or another face (a handlebar moustache, an outlaw's bandana, an eye patch, stubble).
They are handed out in that order, the manual's first.

Each picture sits in the middle of a 32 x 32 icon; outside its outline is transparent, inside black, as on the black map.
The title picture (cover.png) is the manual's cover, 384 wide in 1 bit (Floyd-Steinberg), from the 300 dpi scan of the cover.
Run: python3 -I tools/skins/mac10_icons.py [cover scan]  (writes assets/skins/mac10/sprites/*.png and the manifest; without the
argument the cover already there is kept)
"""
import json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'assets', 'skins', 'mac10')

COLONY = """
...........#####...........
........####...##..........
......###....#..##.........
.....##...#####..##........
.....#..########..######...
.....#.###...####......##..
...###.#####.#####.###..##.
..##......########..###..##
.##..####...#######.####..#
##..#######...####...####.#
#..##########......#.####.#
#.#############.####..###.#
#.#############...###.###.#
#.###############.....###.#
#..#######......###..###..#
##..###...........##..##.##
.##..#......#......####..#.
..##....#.#....#........##.
...##..##....#........#.#..
....##.#.#.#.......####.#..
.....#.####.#.#..######.#..
.....#..##.#.#..#.####..#..
.....##.#####.#.####.#.##..
......#..#.#.#.#.#.##..#...
......##..#####.#.#...##...
.......##..#.#.#.....##....
........##..........##.....
.........###......###......
...........########........
"""

EXPLORED = """
.......#########.......
.....###.......###.....
....##...#####...##....
...##..##.##.###..##...
..##..#.#########..##..
.##..#.#.##.##.###..##.
.#..#.####.######.#..#.
##.#.#.#.###.#.#####.##
#....##.##.#####.###..#
#.#.#..#.####.####.##.#
#.....#.##.#.##.#####.#
#.#.#.....#.######.##.#
#..#...#.#.#.#.#.####.#
#...#.....#.###.####..#
##.#.#.#.#.#.#.##.##.##
.#..#.#.......#.###..#.
.##..###.#.#.#...#..##.
..##..#.#.....#.#..##..
...##..###.#.#.#..##...
....##....#.#....##....
.....###.......###.....
.......#########.......
"""

UNEXPLORED = """
......##########......
....###........###....
...##...#.##.#...##...
..##..##.#.##.##..##..
.##..#..........#..##.
.#..#.#..........#..#.
##.#.#..######..#.#.##
#..###..######..###..#
#.#.#...##..##...#.#.#
#..#....##..##....#..#
#.##.#......##....##.#
#.#.#.....####..#..#.#
#.##......##......##.#
#..##.#...##.....##..#
#.#.#..........#.#.#.#
#..###....##.....##..#
##.#..#...##...##.#.##
.#..##.#.....#..##..#.
.##..#........#.#..##.
..##..###.#.#.##..##..
...##...##.#.#...##...
....###........###....
......##########......
"""

ENEMY = """
........################.......
........#..............#.......
.......##..............##......
.......#................#......
......##................##.....
......#..................#.....
......#.################.#.....
#######.################.######
#.............................#
#.............................#
#######..#.#....#........######
......#.##....#........#.#.....
......#.#.#.#.......####.#.....
......#.####.#.#..######.#.....
......#..####.#..#.##.#..#.....
......##.##.........###.##.....
.......#......###.......#......
.......##..###.#.#.#...##......
........##..#.#.#.#...##.......
......####............###......
.....##.................###....
.....#......##...##.......#....
.....#......##...##.......#....
.....#......###.###.......#....
.....#####...##.##...######....
.........#############.........
"""

E = ENEMY.strip('\n').split('\n')  # 31 x 26
R10 = '......#..#.#....#........#.....'  # (the manual's row under the hat, from the head's sides in)
def H(*rows): return list(rows)
HATS = {
 'flat': E[:11],  # the manual's own hat
 'bowler': H('............########...........',
             '..........##........##.........',
             '........##............##.......',
             '.......##..............##......',
             '......#..................#.....',
             '......#..................#.....',
             '..#...#.################.#...#.',
             '..#####.################.#####.',
             '..#..........................#.',
             '...####..................####..', R10),
 'tophat': H('.........##############........',
             '.........#............#........',
             '.........#............#........',
             '.........#............#........',
             '.........#............#........',
             '.........##############........',
             '.........##############........',
             '...#########################...',
             '...#.......................#...',
             '....###..................##....', R10),
 'stetson': H('...........###...###...........',
              '..........#...#.#...#..........',
              '.........#.....#.....#.........',
              '.........#...........#.........',
              '........#.............#........',
              '........#.............#........',
              '.#......###############......#.',
              '.##.....###############.....##.',
              '..#######.............#######..',
              '......#..................#.....', R10),
 'sombrero': H('..............###..............',
               '.............#...#.............',
               '............#.....#............',
               '...........#.......#...........',
               '..........#.........#..........',
               '.........#.#.#.#.#.#.#.........',
               '........#.#.#.#.#.#.#.#........',
               '###############################',
               '#.............................#',
               '.######..................#####.', R10),
 # (the remake's own, 27 Nov 2026: more rivals for later rulesets' twenty-player games)
 'beret': H('...............................',
            '...............##..............',
            '..........###########..........',
            '.......###...........###.......',
            '.....##.................##.....',
            '....#.....................#....',
            '....#.....................#....',
            '.....##.................##.....',
            '......####################.....',
            '......#..................#.....', R10),
 'cap': H('...............................',
          '...............................',
          '...............................',
          '...............................',
          '........##############.........',
          '.......#..............##.......',
          '......#.................#......',
          '......#..................###...',
          '......####################..#..',
          '......#..................######', R10),
 'scarf': H('...............................',
            '...............................',
            '...............................',
            '...............................',
            '..........##########...........',
            '........##..........##.........',
            '.......#..#.#.#.#.#..#.........',
            '......#.#.#.#.#.#.#.#.#........',
            '......##################.##....',
            '......#..................#.###.', R10),
}
# the manual's hat with a feather in its band (the remake's own)
HATS['feather'] = [list(r) for r in HATS['flat']]
for y, x in ((0, 3), (1, 3), (1, 4), (2, 4), (2, 5), (3, 5), (3, 6), (4, 6)): HATS['feather'][y][x] = '#'
HATS['feather'] = [''.join(r) for r in HATS['feather']]
def face(kinds):
    f = [list(r) for r in E[11:]]  # rows 11..25 -> index 0..14
    def put(r, cols, v='#'):
        for c in cols: f[r][c] = v
    for kind in kinds.split('+'):
        feature(f, put, kind)
    return [''.join(r) for r in f]
def feature(f, put, kind):
    if kind == 'stache':   # a handlebar moustache under the nose
        for r in (6, 7): put(r, range(8, 24), '.')
        put(6, [7, 24]); put(7, [7, 8, 23, 24])
        put(6, range(14, 17)); put(7, range(10, 21)); put(6, [9, 21]); put(7, [9, 21], '.'); put(6, [10, 20])
    if kind == 'bandana':  # an outlaw's bandana over the nose and mouth, its point at the chin
        for r in (5, 6, 7):
            for c in range(8, 24): f[r][c] = '#' if (r + c) % 2 == 0 else '.'
        put(4, range(8, 24))
        put(8, [15]); put(8, [14, 16], '.')
    if kind == 'patch':    # an eye patch over the left eye and its strap
        for r in (1, 2, 3):
            for c in range(8, 13): f[r][c] = '.'
        put(1, range(8, 13)); put(3, range(8, 13)); put(2, [8, 12])
        put(0, range(7, 25)); put(1, [13, 14])
    if kind == 'beard':    # stubble round the mouth and down the chin
        for r in (6, 7):
            for c in range(9, 23): f[r][c] = '#' if (c % 2 == 0 or r == 7 and c % 2) else '.'
        for c in range(11, 20): f[8][c] = '#' if c % 2 else '.'
    # (the remake's own, 27 Nov 2026)
    if kind == 'monocle':  # a monocle on the right eye, its chain down the cheek
        for r in (1, 2, 3):
            for c in range(19, 24): f[r][c] = '.'
        put(1, range(20, 23)); put(2, [19, 23]); put(3, range(20, 23)); put(4, [23]); put(5, [24])
    if kind == 'goatee':   # a thin mouth and a pointed goatee
        for r in (6, 7):
            for c in range(9, 23): f[r][c] = '.'
        put(6, range(13, 19)); put(7, range(14, 18)); put(8, [15, 16])
    if kind == 'shades':   # dark glasses
        for r in (1, 2, 3):
            for c in range(8, 24): f[r][c] = '.'
        put(1, range(8, 24)); put(2, range(8, 13)); put(2, range(19, 24)); put(3, range(9, 12)); put(3, range(20, 23))
    if kind == 'scar':     # a scar down the left cheek
        for i, c in enumerate(range(9, 13)): f[2 + i][c] = '#'; f[2 + i][c + 1] = '.'
    if kind == 'lips':     # a woman's mouth: lips, no stubble
        for r in (6, 7):
            for c in range(9, 23): f[r][c] = '.'
        put(6, [13, 14, 17, 18]); put(7, range(14, 18)); put(6, [15, 16], '.')
    if kind == 'hair':     # a woman's long hair falling past the face to the shoulders
        for r in range(0, 9):
            for c in (3, 4, 5, 26, 27, 28):
                if r == 8 and c in (5, 26): continue
                f[r][c] = '#' if c in (3, 28) or (r + c) % 2 == 0 else '.'
# the bad guys, in the order rivals get them: the manual's bandit first (in Jake's bowler, then as printed), then the remake's own; the
# first nine are 1.0's ten players' worth, the rest (27 Nov 2026) for later rulesets' twenty-player games
NINE = [('bowler', 'plain'), ('flat', 'plain'), ('tophat', 'stache'), ('stetson', 'bandana'), ('sombrero', 'stache'),
        ('bowler', 'patch'), ('flat', 'beard'), ('tophat', 'bandana'), ('stetson', 'patch'),
        ('beret', 'monocle'), ('cap', 'scar'), ('scarf', 'patch'), ('feather', 'goatee'), ('bowler', 'shades'),
        ('tophat', 'monocle'), ('stetson', 'goatee'), ('sombrero', 'shades'), ('cap', 'stache'), ('scarf', 'beard')]
# the bad gals, for later rulesets' women rivals (1.0 had none: the remake's own, 27 Nov 2026): long hair and a woman's mouth, the
# same hats and the same head and body
GALS = [('bowler', 'hair+lips'), ('flat', 'hair+lips'), ('tophat', 'hair+lips'), ('stetson', 'hair+bandana'), ('sombrero', 'hair+lips'),
        ('beret', 'hair+lips'), ('feather', 'hair+lips'), ('cap', 'hair+shades'), ('scarf', 'hair+lips'), ('bowler', 'hair+lips+patch'),
        ('flat', 'hair+shades'), ('tophat', 'hair+bandana'), ('stetson', 'hair+lips+monocle'), ('sombrero', 'hair+shades'),
        ('beret', 'hair+bandana'), ('feather', 'hair+shades'), ('cap', 'hair+lips+scar'), ('scarf', 'hair+lips+monocle'), ('bowler', 'hair+bandana')]
def badguy(h, f):
    rows = HATS[h][:11] + face(f)
    assert len(rows) == 26 and all(len(r) == 31 for r in rows), (h, f)
    return rows


def grid(rows):
    rows = rows.strip('\n').split('\n') if isinstance(rows, str) else rows
    g = [[False] * 32 for _ in range(32)]
    h, w = len(rows), len(rows[0]); oy, ox = (32 - h) // 2, (32 - w) // 2
    for y, r in enumerate(rows):
        for x, c in enumerate(r): g[oy + y][ox + x] = c == '#'
    return g


def inside(g):
    """The picture's silhouette: everything not reachable from the border through clear pixels."""
    out = [[False] * 32 for _ in range(32)]
    stack = [(x, y) for x in range(32) for y in (0, 31)] + [(x, y) for y in range(32) for x in (0, 31)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x > 31 or y > 31 or out[y][x] or g[y][x]: continue
        out[y][x] = True
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return [[not out[y][x] for x in range(32)] for y in range(32)]


def save(name, g, m):
    im = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    for y in range(32):
        for x in range(32):
            if m[y][x]: im.putpixel((x, y), (255, 255, 255, 255) if g[y][x] else (0, 0, 0, 255))
    im.save(os.path.join(OUT, 'sprites', name + '.png'))


def main():
    os.makedirs(os.path.join(OUT, 'sprites'), exist_ok=True)
    for f in os.listdir(os.path.join(OUT, 'sprites')):
        if f.startswith('m10') and f.endswith('.png'): os.remove(os.path.join(OUT, 'sprites', f))
    pics = {'colony': COLONY, 'explored': EXPLORED, 'unexplored': UNEXPLORED}
    for i, (h, f) in enumerate(NINE): pics['bad%d' % (i + 1)] = badguy(h, f)
    for i, (h, f) in enumerate(GALS): pics['gal%d' % (i + 1)] = badguy(h, f)
    # later rulesets' stars (1.0 had no novas: the remake's own, 27 Nov 2026), from the explored planet: turning red, its rim dashed;
    # going nova, eight rays round it; the wreck after, fragments scattered round where it was
    ex = EXPLORED.strip('\n').split('\n')
    red = [''.join('.' if c == '#' and (y in (0, len(ex) - 1) or x in (0, len(r) - 1) or (r[:x].count('#') == 0) or (r[x + 1:].count('#') == 0)) and (x + y) % 3 == 0 else c for x, c in enumerate(r)) for y, r in enumerate(ex)]
    pics['red'] = red
    g = grid(ex); m = inside(g)
    for k in range(8):
        import math
        a = k * math.pi / 4
        for t in (13.5, 14.5, 15.5):
            x, y = int(round(15.5 + t * math.cos(a))), int(round(15.5 + t * math.sin(a)))
            if 0 <= x < 32 and 0 <= y < 32: g[y][x] = True; m[y][x] = True
    novapic = (g, m)
    wreck = [[False] * 32 for _ in range(32)]
    for (x, y) in ((8, 9), (9, 9), (13, 6), (20, 8), (21, 9), (24, 13), (25, 14), (6, 15), (7, 16), (15, 15), (16, 16), (11, 21), (12, 21),
                   (19, 20), (23, 22), (24, 22), (9, 25), (16, 25), (17, 26), (21, 26)): wreck[y][x] = True
    names = []
    for k, gm in (('nova', novapic), ('wreck', (wreck, [[v for v in r] for r in wreck]))):
        g, m = gm
        save('m10' + k, g, m)
        save('m10' + k + '-sel', [[m[y][x] and not g[y][x] for x in range(32)] for y in range(32)], m)
        names += ['m10' + k, 'm10' + k + '-sel']
    halo = Image.new('RGBA', (28, 8), (0, 0, 0, 0))  # an ally's halo (the remake's own; 1.0 had no alliances): a white ring over the picture
    from PIL import ImageDraw
    ImageDraw.Draw(halo).ellipse((0, 0, 27, 7), outline=(255, 255, 255, 255))
    halo.save(os.path.join(OUT, 'sprites', 'm10halo.png')); names.append('m10halo')
    for k, rows in pics.items():
        g = grid(rows); m = inside(g)
        save('m10' + k, g, m)
        save('m10' + k + '-sel', [[m[y][x] and not g[y][x] for x in range(32)] for y in range(32)], m)  # (Nasl: all of it inverted)
        names += ['m10' + k, 'm10' + k + '-sel']
    dot = Image.new('RGBA', (5, 5), (0, 0, 0, 0))
    for y in range(5):
        for x in range(5): dot.putpixel((x, y), (255, 255, 255, 255) if (x + y) % 2 == 0 else (0, 0, 0, 255))
    dot.save(os.path.join(OUT, 'sprites', 'm10fleet.png')); names.append('m10fleet')
    if len(sys.argv) > 1:
        from PIL import ImageOps
        Image.MAX_IMAGE_PIXELS = None
        im = Image.open(sys.argv[1]).convert('L')
        w, h = im.size
        im = im.crop((int(w * 0.012), int(h * 0.012), int(w * 0.988), int(h * 0.975)))
        im = im.resize((384, round(im.height * 384 / im.width)), Image.LANCZOS)
        # the paper's grain and the print's black are levelled first (darker than 70 black, lighter than 175 white), so only the
        # picture's own shading (the hat, the planet) is dithered
        im = im.point(lambda v: 0 if v < 70 else 255 if v > 175 else int((v - 70) * 255 / 105))
        im.convert('1').convert('RGB').save(os.path.join(OUT, 'sprites', 'cover.png'))
    names.append('cover')
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump({'sprites': sorted(names)}, f, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
