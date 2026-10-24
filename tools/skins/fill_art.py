#!/usr/bin/env python3
"""Stand-in pictures for skins whose original lacks some.

  python3 tools/skins/fill_art.py [skin ...]          writes assets/skins/<skin>/sprites/fill/
                                                      and lists them in its manifest.json
  python3 tools/skins/fill_art.py --check [skin ...]  only says whether they're up to date
                                                      (exit 1 if not)
  (no skin named: every skin in TARGETS)

A skin played with a later version's rules (5.0.5's above all) is asked for
pictures its version never had: Dreadnoughts, Tankers, Biologicals, novas,
allies, battle debris, ranks, and the reports of everything it didn't do.
Each comes from the nearest later version that has it (Jake's rule: 2.x,
then 3.x, then 4.x, then 5.0.5 as a last resort), from art of the same kind
(black-and-white skins from black-and-white art, colour from colour), and
is filtered to look like the skin. A stand-in is written as
fill/<version>-<name>.png (fill/mac4-p2263: 4.0.5's p2263), so its source is
in its name. The skins' code asks for each with HOFILL.pic
(js/skins/dos/ui.js): the skin's own picture, else its stand-in. Adding a
version's art later changes what is chosen with no code change.

The filters (chosen per picture from the skin's look, below in choose()):
  as-is       already right
  invert      4.0.5's black-and-white ships are white on black; a skin whose
              ships are black on white (1.2, 2.0.1) gets them inverted
  outline     4.0.5's black around a ship becomes see-through and gets a
              black outline, as 1.2's and 2.0.1's ships have
  unbox       a colour ship's black surroundings become see-through
  key-black   a picture drawn on the black map: its black becomes see-through
  ink         5.0.5's battle debris, for one bit: every coloured pixel black
              (ink-white: white, for a skin that fights on black)
  dither      5.0.5 colour art to one bit: Atkinson dither (the Mac's own)
              (dither-dark: on black, for a picture drawn on the map)
  palette     to the skin's own colours (the 256 it uses most; the Amiga's 16),
              nearest colour, no dither
  palette-dither  the same with Floyd-Steinberg dither, for pictures (ranks)
"""
import json, os, sys, warnings, collections
from collections import deque
warnings.filterwarnings("ignore", category=DeprecationWarning)  # (PIL getdata)
from PIL import Image, ImageOps, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SETS = {v: 'assets/skins/%s/sprites' % v for v in ('mac12', 'mac2', 'mac2c', 'mac3', 'mac3c', 'mac4', 'mac4c', 'dos', 'amiga', 'w95', 'ios')}
SETS['classic'] = 'assets/sprites'
BW = {'mac12', 'mac2', 'mac3', 'mac4'}

# What a skin may be asked for, by its name in its own version (Mac numbers;
# classic's names for 5.0.5's), and what kind of picture it is
SHIPS = [('p2263', 'ship'), ('p2261', 'ship'), ('p2758', 'body')]  # Dreadnought, Biological (4.0.5's whole pictures); the Tanker's body
# These are 4.0.5's numbers: in 2.0.1 and 3.0.1, p2758-p2760 are colour globes.
# So ships come only from 4.0.5's sets, even for a skin with a p2758 of its own.
NUMBERED_405 = {'ship', 'body'}
HALOS = [('p506', 'halo'), ('p507', 'halo')]  # an ally's halo (3.0.1), big and small
NOVA = [('i1020', 'icon')]                    # a star turning red or gone nova (3.0.1)
REPORT_ICONS = [('i%d' % n, 'icon') for n in (  # report icons, as 3.0.1 (then 4.0.5) picks them
    3105, 3110, 3112, 3118, 3119, 3142, 3160, 3161, 3162, 3163, 3164,
    4011, 4013, 4015, 4016, 4017, 4024, 3170)]
M505 = [('m%d' % n, 'm') for n in range(9000, 9052)]  # 5.0.5's own report pictures, all of them
DEBRIS = [('debris', 'debris')]               # battle debris: only 5.0.5 has any
NOVA18 = [('nova18', 'nova18')]               # a gone nova's wreck: only 5.0.5 has one
RANKS = [('rank%02d' % n, 'rank') for n in range(1, 26)]  # the rank pictures: only 5.0.5's
REPORTS = REPORT_ICONS + M505                 # (for the 2.0 skins, whose reports cascade)

# Each skin: its look ('bw' or a palette), its ships' background, the
# versions after it in order, and what it lacks. Rank pictures: one-bit skins
# and the 16-colour Amiga; the 256-colour skins show 5.0.5's own as they are.
TARGETS = {
    'mac12': dict(look='bw', ships='white', after=['mac2', 'mac3', 'mac4'], want=SHIPS + HALOS + NOVA + REPORTS + DEBRIS + RANKS),
    'mac2':  dict(look='bw', ships='white', after=['mac3', 'mac4'], want=SHIPS + HALOS + NOVA + REPORTS + DEBRIS + RANKS),
    'mac2c': dict(look='colour', ships='white', after=['mac3c', 'mac4c'], want=SHIPS + HALOS + NOVA + REPORTS + DEBRIS),
    'mac3':  dict(look='bw', ships='black', after=['mac4'], want=SHIPS + HALOS + DEBRIS + RANKS),
    'mac3c': dict(look='colour', ships='black', after=['mac4c'], want=SHIPS + HALOS + DEBRIS),
    'mac4':  dict(look='bw', ships='black', after=[], want=HALOS + DEBRIS + NOVA18 + RANKS),
    'mac4c': dict(look='colour', ships='black', after=[], want=HALOS + DEBRIS + NOVA18),
    'dos':   dict(look='colour', ships='clear', after=['mac2c', 'mac3c', 'mac4c'], want=SHIPS + HALOS + NOVA + REPORTS + DEBRIS),
    'amiga': dict(look='colour', ships='clear', after=['mac2c', 'mac3c', 'mac4c'], want=SHIPS + HALOS + NOVA + REPORTS + DEBRIS + RANKS),
    'w95':   dict(look='colour', ships='clear', after=[], want=DEBRIS + NOVA18 + [('haloAlly', 'w95halo'), ('haloBuddy', 'w95halo')]),
}


def choose(kind, src, T):
    """The filters for a picture of this kind from version src, for skin T (None: unusable)."""
    bw_src, white = src in BW, T['ships'] == 'white'
    if T['look'] == 'bw':
        if src == 'classic':
            return {'debris': ['ink'] if white else ['ink-white'], 'm': ['dither'], 'rank': ['dither'], 'nova18': ['dither-dark']}.get(kind)
        if not bw_src: return None
        return {'ship': ['invert'] if white else ['as-is'], 'body': ['outline'] if white else ['as-is'],
                'icon': ['as-is'], 'halo': ['key-black']}.get(kind)
    if src == 'classic':
        return {'debris': ['palette'], 'm': ['palette'], 'rank': ['palette-dither'], 'nova18': ['palette']}.get(kind)
    if bw_src: return None
    return {'ship': ['unbox', 'palette'], 'body': ['unbox', 'palette'], 'icon': ['palette'], 'halo': ['key-black']}.get(kind)


def palette_of(skin, n=256):
    """The skin's own colours: the n its pictures use most."""
    c = collections.Counter()
    d = os.path.join(ROOT, SETS[skin])
    for f in sorted(os.listdir(d)):
        if not f.endswith('.png'): continue
        for k, col in Image.open(os.path.join(d, f)).convert('RGBA').getcolors(1 << 22) or []:
            if col[3]: c[col[:3]] += k
    cols = [col for col, _ in c.most_common(n)]
    pal = Image.new('P', (1, 1))
    flat = [v for col in cols for v in col]
    pal.putpalette(flat + flat[:3] * (256 - len(cols)))
    return pal


def unbox(im):
    """A colour ship's black surroundings (black reaching the edge) made see-through."""
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    dark = lambda x, y: sum(px[x, y][:3]) < 30
    seen = [[False] * w for _ in range(h)]
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y][x] or not dark(x, y): continue
        seen[y][x] = True; px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def w95halo(name):
    """4.0.5 for Windows draws its halos only inside b175 (ring + halo, yellow
    for an ally, cyan for a best buddy): the first of each, on its own."""
    im = Image.open(os.path.join(ROOT, SETS['w95'], 'b175.png')).convert('RGBA')
    box, ok = ((0, 48, 61, 78), lambda r, g, b: r > 200 and g > 170 and b < 110) if name == 'haloAlly' else \
              ((0, 99, 61, 129), lambda r, g, b: r < 120 and g > 190 and b > 170)
    c = im.crop(box)
    c.putdata([p if ok(*p[:3]) else (0, 0, 0, 0) for p in c.getdata()])
    return c.crop(c.getbbox())


def atkinson(gray):
    w, h = gray.size
    a = [list(gray.crop((0, y, w, y + 1)).getdata()) for y in range(h)]
    for y in range(h):
        row = a[y]
        for x in range(w):
            o = row[x]; n = 255 if o >= 128 else 0; e = (o - n) / 8; row[x] = n
            for dx, dy in ((1, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (0, 2)):
                X, Y = x + dx, y + dy
                if 0 <= X < w and Y < h: a[Y][X] += e
    out = Image.new('L', (w, h))
    out.putdata([max(0, min(255, int(v))) for r in a for v in r])
    return out


def outline(im, close=5):
    """4.0.5's black background (black reaching the picture's edge, once the
    ship's own gaps are closed) made see-through, with a one-pixel black
    outline round the ship."""
    g = im.convert('L')
    white = g.point(lambda v: 255 if v >= 128 else 0)
    shut = white.filter(ImageFilter.MaxFilter(close)).filter(ImageFilter.MinFilter(close))
    w, h = g.size
    S, W0 = shut.load(), white.load()
    bg = [[False] * w for _ in range(h)]
    q = deque((x, y) for x in range(w) for y in (0, h - 1)) ; q.extend((x, y) for y in range(h) for x in (0, w - 1))
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or bg[y][x] or S[x, y] >= 128: continue
        bg[y][x] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    out = Image.new('RGBA', (w, h))
    px = out.load()
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                edge = any(0 <= x + dx < w and 0 <= y + dy < h and not bg[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
                px[x, y] = (0, 0, 0, 255) if edge else (0, 0, 0, 0)
            else:
                v = 255 if W0[x, y] >= 128 else 0
                px[x, y] = (v, v, v, 255)
    return out


def apply(im, how):
    im = im.convert('RGBA')
    if how == 'as-is':
        return im
    if how == 'invert':
        rgb = ImageOps.invert(im.convert('RGB'))
        rgb.putalpha(im.getchannel('A'))
        return rgb
    if how == 'outline':
        return outline(im)
    if how == 'key-black':
        px = [(r, g, b, 0) if r + g + b < 60 else (r, g, b, a) for r, g, b, a in im.getdata()]
        im.putdata(px)
        return im
    if how in ('ink', 'ink-white'):
        v = 0 if how == 'ink' else 255
        px = [(v, v, v, 255) if a > 96 else (0, 0, 0, 0) for r, g, b, a in im.getdata()]
        im.putdata(px)
        return im
    if how in ('dither', 'dither-dark'):  # on white, as the report card and the Ranks window are (or on the black map)
        flat = Image.new('RGBA', im.size, (255, 255, 255, 255) if how == 'dither' else (0, 0, 0, 255)); flat.alpha_composite(im)
        g = ImageOps.autocontrast(flat.convert('L'), cutoff=1)
        bw = atkinson(g).convert('RGBA')
        bw.putalpha(im.getchannel('A').point(lambda v: 255 if v > 96 else 0))
        return bw
    raise ValueError(how)


def apply_all(im, hows, pal):
    for how in hows:
        if how == 'unbox': im = unbox(im)
        elif how in ('palette', 'palette-dither'):
            im = im.convert('RGBA'); a = im.getchannel('A')
            flat = Image.new('RGB', im.size, (0, 0, 0)); flat.paste(im.convert('RGB'), mask=a)
            q = flat.quantize(palette=pal, dither=Image.Dither.FLOYDSTEINBERG if how == 'palette-dither' else Image.Dither.NONE).convert('RGBA')
            q.putalpha(a.point(lambda v: 255 if v > 96 else 0)); im = q
        else: im = apply(im, how)
    return im


def build(skin):
    """{fill name: Image} for a skin, each picture from the first version after it that has one."""
    T = TARGETS[skin]; out, why = {}, []
    pal = palette_of(skin, 16 if skin == 'amiga' else 256) if T['look'] != 'bw' else None
    for name, kind in T['want']:
        if kind == 'w95halo':
            out['w95-' + name] = w95halo(name); why.append(f'{name}: from w95 (its b175)'); continue
        if kind not in NUMBERED_405 and os.path.exists(os.path.join(ROOT, SETS[skin], name + '.png')):
            if kind == 'halo':  # its own halo, drawn over the planet: its black box made see-through
                out[f'{skin}-{name}'] = apply(Image.open(os.path.join(ROOT, SETS[skin], name + '.png')), 'key-black')
                why.append(f'{name}: its own (key-black)'); continue
            why.append(f'{name}: {skin} has its own'); continue
        for ver in T['after'] + ['classic']:
            if kind in NUMBERED_405 and ver not in ('mac4', 'mac4c'): continue
            hows = choose(kind, ver, T)
            if not hows: continue
            src = os.path.join(ROOT, 'assets', 'explore', name[4:] + '.jpg') if kind == 'rank' else os.path.join(ROOT, SETS[ver], name + '.png')
            if not os.path.exists(src): continue
            out[f'{ver}-{name}'] = apply_all(Image.open(src), hows, pal)
            why.append(f'{name}: from {ver} ({", ".join(hows)})'); break
        else:
            why.append(f'{name}: no version has it')
    return out, why


# ---- 2.0's two hidden special ships, for the later skins (backwards) ----
# 1.2 and 2.0 drew two designs as their own pictures: Weapons 12, Shields 12,
# Range 9-11 (a shark) and Weapons 15, Shields 15, Range 12-14 (a skull).
# 3.0.1 on dropped them, so the later skins draw those designs as ordinary
# ships. With 1.2's or 2.0's rules they now show the originals: each skin's
# from the nearest earlier version with art of its kind (colour from Mac
# 2.0.1 colour, black and white from Mac 2.0.1), sized to the skin's ships
# (120x40; 3.0.1's 240x80), the surroundings see-through, in its colours.
SPECIALS = {'special20a': (2251, 2252, 2253), 'special20b': (2254, 2255, 2256)}
SPECIAL_TARGETS = {  # skin: (source set, size, filters after resizing), written to its sprites/fill/
    'classic': ('mac2c', (120, 40), []),
    'w95': ('mac2c', (120, 40), ['palette']),
    'mac4c': ('mac2c', (120, 40), ['palette']),
    'mac4': ('mac2', (120, 40), ['bw']),
    'palm': ('mac2c', (120, 40), ['palette']),
    'ios': ('mac2c', (120, 40), []),        # (iOS draws its ships 120x40, as 5.0.5 does)
    'mac3': ('mac2', (240, 80), ['bw']),       # 3.0.1's ships: three 40x40 parts drawn twice the size
    'mac3c': ('mac2c', (240, 80), ['palette']),
}
SETS['palm'] = 'assets/skins/palm/sprites'


def special(src, parts, size, hows, pal):
    ims = [Image.open(os.path.join(ROOT, SETS[src], 'p%d.png' % n)).convert('RGBA') for n in parts]
    c = Image.new('RGBA', (sum(i.width for i in ims), max(i.height for i in ims)), (255, 255, 255, 255)); x = 0
    for i in ims: c.alpha_composite(i, (x, 0)); x += i.width
    # 2.0.1's surroundings are white: white reaching the edge becomes see-through
    w, h = c.size; px = c.load(); seen = set()
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or (x, y) in seen or sum(px[x, y][:3]) < 740: continue
        seen.add((x, y)); px[x, y] = (255, 255, 255, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    c = c.crop(c.getbbox())
    k = min(size[0] / c.width, size[1] / c.height)
    if 'bw' in hows:  # one bit, white on black as 4.0.5's ships are: shrink in grey, then Atkinson
        a = c.getchannel('A').resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
        g = ImageOps.invert(c.convert('RGB')).convert('L').resize(a.size, Image.LANCZOS)
        out = atkinson(g).convert('RGBA'); out.putalpha(a.point(lambda v: 255 if v > 110 else 0)); return out
    s = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
    s.putalpha(s.getchannel('A').point(lambda v: 255 if v > 110 else 0))
    return apply_all(s, hows, pal) if hows else s


def sync_specials(skin, check):
    src, size, hows = SPECIAL_TARGETS[skin]
    base = 'assets' if skin == 'classic' else os.path.join('assets', 'skins', skin)
    out = os.path.join(ROOT, base, 'sprites', 'fill')
    man_path = os.path.join(ROOT, base, 'manifest.json'); raw = open(man_path).read(); man = json.loads(raw)
    pal = palette_of(skin) if 'palette' in hows else None
    pics = {f'{src}-{k}': special(src, parts, size, hows, pal) for k, parts in SPECIALS.items()}
    keep = [k for k in man['sprites'] if not any(k == 'fill/' + v + '-' + s for v in SETS for s in SPECIALS)]
    names = sorted(keep + ['fill/' + k for k in pics])
    stale = [k for k, im in pics.items() if not os.path.exists(os.path.join(out, k + '.png'))
             or list(Image.open(os.path.join(out, k + '.png')).convert('RGBA').getdata()) != list(im.convert('RGBA').getdata())]
    bad = bool(stale or names != man['sprites'])
    if check:
        print(f'{skin} specials: ' + ('up to date' if not bad else 'out of date')); return bad
    os.makedirs(out, exist_ok=True)
    for k in stale: pics[k].save(os.path.join(out, k + '.png'), optimize=True)
    if names != man['sprites']:
        man['sprites'] = names
        open(man_path, 'w').write(json.dumps(man, indent=1) + ('\n' if raw.endswith('\n') else ''))
    print(f'{skin} specials: {len(pics)} ({len(stale)} written)')
    return False


def sync(skin, check):
    pics, why = build(skin)
    out = os.path.join(ROOT, 'assets', 'skins', skin, 'sprites', 'fill')
    man_path = os.path.join(ROOT, 'assets', 'skins', skin, 'manifest.json')
    raw = open(man_path).read(); man = json.loads(raw)
    names = sorted([k for k in man['sprites'] if not k.startswith('fill/') or '-special20' in k] + ['fill/' + k for k in pics])  # (the specials: sync_specials)
    stale = [k for k, im in pics.items() if not os.path.exists(os.path.join(out, k + '.png'))
             or list(Image.open(os.path.join(out, k + '.png')).convert('RGBA').getdata()) != list(im.convert('RGBA').getdata())]
    extra = [f[:-4] for f in (os.listdir(out) if os.path.isdir(out) else []) if f.endswith('.png') and f[:-4] not in pics and '-special20' not in f]
    if check:
        bad = bool(stale or extra or names != man['sprites'])
        print(f'{skin}: ' + ('up to date' if not bad else f'out of date: {len(stale)} to write, {len(extra)} to remove, manifest {"ok" if names == man["sprites"] else "to update"}'))
        return bad
    os.makedirs(out, exist_ok=True)
    for k in stale: pics[k].save(os.path.join(out, k + '.png'), optimize=True)
    for k in extra: os.remove(os.path.join(out, k + '.png'))
    if names != man['sprites']:
        man['sprites'] = names
        open(man_path, 'w').write(json.dumps(man, indent=1) + ('\n' if raw.endswith('\n') else ''))
    print(f'{skin}: {len(pics)} stand-ins ({len(stale)} written, {len(extra)} removed)')
    if '-v' in sys.argv: print('  ' + '\n  '.join(why))
    return False


if __name__ == '__main__':
    check = '--check' in sys.argv
    skins = [a for a in sys.argv[1:] if not a.startswith('-')] or list(TARGETS) + list(SPECIAL_TARGETS)
    bad = [s for s in skins if (s in TARGETS and sync(s, check)) | (s in SPECIAL_TARGETS and sync_specials(s, check))]
    sys.exit(1 if bad else 0)
