#!/usr/bin/env python3
"""Pull the art and sounds out of Spaceward Ho! for iOS (Ariton, version 1.2.9).

    pip install pillow            (and ffmpeg on the PATH for the sounds)
    python3 -I tools/extract/ios.py <path to SpacewardHo.app>

<path> is the unpacked app bundle (the folder holding Info.plist, the
SpacewardHo program and the art; in an .ipa it is Payload/SpacewardHo.app,
in a Mac's copy Wrapper/SpacewardHo.app). The program itself is not read.

Writes assets/skins/ios/:
  sprites/<name>.png     one picture per name: the double-size one (the -hd /
                         -HD / @2x file, or the -hd sprite sheet's frame)
                         where the app has one, else the 1x one
  sounds/<n>.mp3         the sounds, named by the 5.0.5 sound number each one
                         is (the files are the same recordings, matched by
                         name, see SOUND_NUMBERS); the iOS game's own extra
                         sounds by their own names
  help/                  the English help pages (help_index.html and its
                         pictures) as the app shows them in its web view
  manifest.json          what is where (below)
  strings.json           en.lproj/objectdictionary.plist (every string list
                         the game reads: report templates, names, hints, ...)

The art comes in four forms:
- plain PNGs: most are Apple's "CgBI" PNGs (Xcode's pngcrush -iphone: an
  extra CgBI chunk first, the image data a raw deflate stream with no zlib
  header, the pixels BGRA with the colour premultiplied by alpha). Decoded
  here by hand; ordinary PNGs go through Pillow;
- TexturePacker sprite sheets: <sheet>.plist (format 2) beside
  <sheet>.pvr.ccz, a cocos2d "CCZ!" file (16-byte header: 'CCZ!', u16
  compression 0 = zlib, u16 version, u32 reserved, u32 length, all
  big-endian) holding a legacy PVR (v2: 52-byte header, little-endian
  u32s: header size, height, width, mipmaps, flags (low byte the pixel
  type: 0x10 RGBA4444, 0x12 RGBA8888), data size, bpp, the four channel
  masks, 'PVR!', surfaces). Each frame is cut out (rotated frames are
  stored turned 90 degrees clockwise) and put back at its place in its
  untrimmed size;
- supernova.plist (format 3) over supernova.png, the same idea;
- Assets.car, Xcode's compiled asset catalogue (a BOM file). In 1.2.9 it
  holds one picture, "logo.png" (1032 x 612, BGRA, LZVN-compressed in
  'KCBC' chunks); decoded here with a small LZVN decoder (sprite "logo").

The JPEGs 01.jpg-25.jpg (the rank pictures) are the same files as 5.0.5's
assets/explore, byte for byte, and ho.mp3 is 5.0.5's theme tune (96 s,
another encoding of assets/theme.mp3); they are checked and not copied (manifest "explore" / "theme" say where they are).

manifest.json:
  sprites   every picture in sprites/
  hd        the pictures in sprites/ that are the double-size (Retina) art,
            so drawn at half their pixel size they match the 1x layout
  sounds    every file in sounds/ (without .mp3)
  images    the remake's 5.0.5 message pictures (m9000 + n) this skin has a
            picture of its own for: { "m9003": "report_icon-3", ... }. The
            iOS game names its report pictures report_icon-<n> (+[MessageNode
            reportIcon:] builds "report_icon-%ld.png" from the report's picture
            number) and each is 5.0.5's picture 9000 + n redrawn at 80 x 80
            (compared side by side: 0 to 50 all match), so every n from 0 to 50
            maps to m(9000 + n). 5.0.5's 9051 has no iOS picture.
  soundNames  the iOS file name of each sound (for the record)
  explore, theme  where the rank pictures and the music are (5.0.5's own)
"""
import io, json, os, plistlib, re, shutil, struct, subprocess, sys, zlib, hashlib

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'skins', 'ios')

# The game's "Sounds" string list (objectdictionary.plist) names its 41 files;
# each is the same recording as a 5.0.5 sound (checked by ear-free means:
# the loudness envelopes match 5.0.5's assets/sounds at 1.00 correlation and
# the lengths to the sample). "Ship Building" is a 268-byte file, nearly
# silent, where 5.0.5's 7006 is a real sound.
SOUND_NUMBERS = {
    'Good Announcement - Burst': 2000, 'Shucks!': 2001,
    'Soft Hit': 3000, 'Med Hit': 3001, 'Hard Hit (boom minus oooh)': 3002, 'Ship Dead - expl2': 3003,
    'woah2': 4000, 'Send Fleet': 4001,
    'Message Has Been Sent': 5000, 'GrumbleGrumble': 5001, 'Thanks': 5002, 'Sorry': 5003,
    'Good Explored': 6000, 'Bad Explored': 6001, 'Mediocre Explored': 6002,
    'ahem': 7000, 'Next Message': 7001, 'Outta Here': 7002, 'Scrap Fleet Sound': 7003,
    'BonusTime': 7004, 'HurryItUp!': 7005, 'Ship Building': 7006, 'Check This Out!': 7007,
    "Time's Almost Up (10 seconds)": 7012, 'Biological Eating': 7013, 'Whew! No Armageddon': 7014,
    'Receive Stuff (here ye go)': 7015, "Don't Cheat": 7016, 'Best Buddies, Partner': 7017,
    'New Colony': 7018, 'Vary Good! Pop level': 7019, 'Awww! Player killed': 7020,
    'wow! you won': 7021, 'Holster': 7022, 'Spin Gun': 7023, 'Tap Foot': 7024,
    'laugh': 7025, 'tee hee': 7026, "twarn't nothin'": 7027,
    'Screeem!': 8000, 'New Turn': 11111,
}
# files in the bundle that the "Sounds" list doesn't name: cocos2d's and the
# iOS game's own (kept by name)
EXTRA_SOUNDS = ['Angel Choir 2', 'Angel Choir 2.1_2', 'ahhhh', 'doink1', 'drum72', 'ping2', 'pong1']

SHEETS = ['mapsheet', 'planetsheet', 'shipsheet', 'uitiles', 'hoguysheet']
SKIP_PNG = re.compile(r'^(AppIcon|Default|Icon|iTunesArtwork|fps_images)')


# ---------- PNG (including Apple's CgBI) ----------

def png_chunks(d):
    p = 8
    while p < len(d):
        n = struct.unpack('>I', d[p:p + 4])[0]
        t = d[p + 4:p + 8]
        yield t, d[p + 8:p + 8 + n]
        p += 12 + n


def unfilter(raw, w, h, bpp):
    stride = w * bpp
    out = bytearray(stride * h)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f == 1:
            for i in range(bpp, stride): line[i] = (line[i] + line[i - bpp]) & 255
        elif f == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]; c = prev[i - bpp] if i >= bpp else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return bytes(out)


def load_png(path):
    d = open(path, 'rb').read()
    chunks = list(png_chunks(d))
    if not chunks or chunks[0][0] != b'CgBI':
        im = Image.open(io.BytesIO(d))
        im.load()
        return im.convert('RGBA')
    ihdr = dict(chunks)[b'IHDR']
    w, h, depth, ctype, _, _, interlace = struct.unpack('>IIBBBBB', ihdr)
    if depth != 8 or ctype not in (2, 6) or interlace:
        raise ValueError('%s: CgBI type %d depth %d' % (path, ctype, depth))
    data = b''.join(c for t, c in chunks if t == b'IDAT')
    raw = zlib.decompress(data, -15)
    bpp = 4 if ctype == 6 else 3
    px = unfilter(raw, w, h, bpp)
    if ctype == 2:  # BGR
        im = Image.frombytes('RGB', (w, h), px)
        b, g, r = im.split()
        return Image.merge('RGB', (r, g, b)).convert('RGBA')
    out = bytearray(len(px))
    for i in range(0, len(px), 4):  # premultiplied BGRA -> RGBA
        b, g, r, a = px[i:i + 4]
        if a and a < 255:
            r = min(255, r * 255 // a); g = min(255, g * 255 // a); b = min(255, b * 255 // a)
        out[i:i + 4] = bytes((r, g, b, a))
    return Image.frombytes('RGBA', (w, h), bytes(out))


# ---------- sprite sheets ----------

def load_pvr_ccz(path):
    d = open(path, 'rb').read()
    if d[:4] != b'CCZ!':
        raise ValueError(path + ': not a CCZ file')
    comp, ver, _, length = struct.unpack('>HHII', d[4:16])
    if comp != 0:
        raise ValueError(path + ': CCZ compression %d' % comp)
    raw = zlib.decompress(d[16:])
    hdr = struct.unpack('<13I', raw[:52])
    if raw[44:48] != b'PVR!':
        raise ValueError(path + ': not a legacy PVR')
    hsize, h, w, _, flags, size, bpp = hdr[:7]
    px = raw[hsize:hsize + size]
    kind = flags & 0xff
    if kind == 0x12:  # RGBA8888
        return Image.frombytes('RGBA', (w, h), px[:w * h * 4])
    if kind == 0x10:  # RGBA4444, 16-bit little-endian words R G B A from the top nibble
        out = bytearray(w * h * 4)
        for i in range(w * h):
            v = px[2 * i] | px[2 * i + 1] << 8
            out[4 * i:4 * i + 4] = bytes(((v >> 12 & 15) * 17, (v >> 8 & 15) * 17, (v >> 4 & 15) * 17, (v & 15) * 17))
        return Image.frombytes('RGBA', (w, h), bytes(out))
    raise ValueError(path + ': PVR pixel type 0x%x' % kind)


def nums(s):
    return [int(float(x)) for x in re.findall(r'-?[\d.]+', s)]


def cut(sheet, frame, rotated, colour_rect, source_size):
    x, y, w, h = frame
    if rotated:
        part = sheet.crop((x, y, x + h, y + w)).rotate(90, expand=True)
    else:
        part = sheet.crop((x, y, x + w, y + h))
    sw, sh = source_size
    canvas = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    canvas.paste(part, (colour_rect[0], colour_rect[1]))
    return canvas


def sheet_frames(plist_path, sheet):
    d = plistlib.load(open(plist_path, 'rb'))
    fmt = d.get('metadata', {}).get('format', d.get('format'))
    out = {}
    for name, f in d['frames'].items():
        if 'frame' in f:  # format 2
            out[name] = cut(sheet, nums(f['frame']), f.get('rotated', False), nums(f['sourceColorRect']), nums(f['sourceSize']))
        else:  # format 3
            out[name] = cut(sheet, nums(f['textureRect']), f.get('textureRotated', False), nums(f['spriteColorRect']), nums(f['spriteSourceSize']))
    return out


# ---------- Assets.car (one LZVN-compressed BGRA rendition) ----------

def lzvn(src, size):
    """Decode an LZVN stream (Apple's libcompression / lzfse's lzvn)."""
    out = bytearray()
    p, d = 0, 0
    n = len(src)
    while p < n and len(out) < size:
        op = src[p]
        L = M = 0
        if op == 0x06:  # end of stream
            break
        if op in (0x0e, 0x16):  # nop
            p += 1; continue
        if op & 0xf0 == 0xf0:  # match only, previous distance
            if op == 0xf0:
                M = src[p + 1] + 16; p += 2
            else:
                M = op & 15; p += 1
        elif op & 0xf0 == 0xe0:  # literals only
            if op == 0xe0:
                L = src[p + 1] + 16; p += 2
            else:
                L = op & 15; p += 1
            out += src[p:p + L]; p += L
            continue
        elif op & 0xe0 == 0xa0:  # medium distance
            b1, b2 = src[p + 1], src[p + 2]
            L = (op >> 3) & 3
            M = (((op & 7) << 2) | (b1 & 3)) + 3
            d = (b2 << 6) | (b1 >> 2)
            p += 3
            out += src[p:p + L]; p += L
        elif op & 0xf0 in (0xd0,) or op & 0xf8 == 0x70 or op in (0x1e, 0x26, 0x2e, 0x36, 0x3e):
            raise ValueError('lzvn: undefined opcode 0x%02x at %d' % (op, p))
        else:
            L = op >> 6
            M = ((op >> 3) & 7) + 3
            low = op & 7
            if low == 7:  # large distance
                d = src[p + 1] | src[p + 2] << 8; p += 3
            elif low == 6:  # previous distance
                p += 1
            else:  # small distance
                d = (low << 8) | src[p + 1]; p += 2
            out += src[p:p + L]; p += L
        for _ in range(M):
            out.append(out[-d])
    return bytes(out)


def assets_car(path):
    d = open(path, 'rb').read()
    res = {}
    i = d.find(b'ISTC')
    while i >= 0:
        tag, ver, flags, w, h, scale, pf, cs = struct.unpack('<4sIIIII4sI', d[i:i + 32])
        name = d[i + 40:i + 168].split(b'\0')[0].decode('utf-8', 'replace')
        infolen, bitmaps, _, payload = struct.unpack('<IIII', d[i + 168:i + 184])
        j = i + 184 + infolen
        if pf == b'BGRA' and d[j:j + 4] == b'MLEC':
            ctype = struct.unpack('<I', d[j + 8:j + 12])[0]
            k = j + 16
            rows = bytearray()
            while d[k:k + 4] == b'KCBC':
                nrows, clen = struct.unpack('<II', d[k + 12:k + 20])
                chunk = d[k + 20:k + 20 + clen]
                if ctype == 3:
                    rows += lzvn(chunk, nrows * w * 4)
                else:
                    raise ValueError('Assets.car compression %d' % ctype)
                k += 20 + clen
            if len(rows) >= w * h * 4:
                im = Image.frombytes('RGBA', (w, h), bytes(rows[:w * h * 4]), 'raw', 'BGRA')
                # premultiplied: undo
                px = bytearray(im.tobytes())
                for q in range(0, len(px), 4):
                    a = px[q + 3]
                    if a and a < 255:
                        for c in range(3): px[q + c] = min(255, px[q + c] * 255 // a)
                res[os.path.splitext(name)[0] + ('@%dx' % (scale // 100) if scale > 100 else '')] = Image.frombytes('RGBA', (w, h), bytes(px))
        i = d.find(b'ISTC', i + 4)
    return res


# ---------- main ----------

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def md5(path):
    return hashlib.md5(open(path, 'rb').read()).hexdigest()


def main(app):
    if not os.path.exists(os.path.join(app, 'Info.plist')):
        sys.exit('not an app bundle: ' + app)
    shutil.rmtree(os.path.join(OUT, 'hd'), ignore_errors=True)
    for sub in ('sprites', 'sounds', 'help'):
        shutil.rmtree(os.path.join(OUT, sub), ignore_errors=True)
        os.makedirs(os.path.join(OUT, sub))
    sd, hd = {}, {}

    # loose PNGs
    for f in sorted(os.listdir(app)):
        if not f.endswith('.png') or SKIP_PNG.match(f):
            continue
        base = f[:-4]
        big = re.search(r'(-hd|-HD|@2x)$', base)
        key = re.sub(r'(-hd|-HD|@2x)$', '', base)
        if key in SHEETS or key == 'supernova':
            continue  # the sheets' own textures, cut up below
        (hd if big else sd)[key] = load_png(os.path.join(app, f))

    # TexturePacker sheets
    for s in SHEETS:
        for suffix, dest in (('', sd), ('-hd', hd)):
            pl = os.path.join(app, s + suffix + '.plist')
            tex = os.path.join(app, s + suffix + '.pvr.ccz')
            if os.path.exists(pl) and os.path.exists(tex):
                dest.update(sheet_frames(pl, load_pvr_ccz(tex)))
    for suffix, dest in (('', sd), ('-hd', hd)):
        pl = os.path.join(app, 'supernova' + suffix + '.plist')
        tex = os.path.join(app, 'supernova' + suffix + '.png')
        if os.path.exists(pl) and os.path.exists(tex):
            dest.update({k[:-4] if k.endswith('.png') else k: v for k, v in sheet_frames(pl, load_png(tex)).items()})

    # Assets.car
    car = os.path.join(app, 'Assets.car')
    if os.path.exists(car):
        try:
            for k, im in assets_car(car).items():
                sd[k] = im
        except Exception as e:  # not fatal: one logo
            print('Assets.car not decoded:', e)

    # one picture per name: the double-size one where there is one (the
    # remake scales pictures down; the 1x ones add nothing)
    for k, im in hd.items():
        sd[k] = im
    for k, im in sd.items():
        im.save(os.path.join(OUT, 'sprites', k + '.png'), optimize=True)

    # the help pages (English)
    lp = os.path.join(app, 'en.lproj')
    for f in sorted(os.listdir(lp)):
        if f.endswith('.html'):
            shutil.copy(os.path.join(lp, f), os.path.join(OUT, 'help', f))
        elif f.endswith('.png'):
            load_png(os.path.join(lp, f)).save(os.path.join(OUT, 'help', f), optimize=True)
    strings = plistlib.load(open(os.path.join(lp, 'objectdictionary.plist'), 'rb'))
    json.dump(strings, open(os.path.join(OUT, 'strings.json'), 'w'), indent=1, ensure_ascii=False)

    # sounds
    sounds, names = [], {}
    have_ffmpeg = shutil.which('ffmpeg') is not None
    wanted = [(n, str(v)) for n, v in SOUND_NUMBERS.items()] + [(n, slug(n)) for n in EXTRA_SOUNDS]
    missing = []
    for name, key in wanted:
        src = next((os.path.join(app, name + e) for e in ('.wav', '.aif') if os.path.exists(os.path.join(app, name + e))), None)
        if not src:
            missing.append(name); continue
        names[key] = os.path.basename(src)
        if have_ffmpeg:
            subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', src, '-codec:a', 'libmp3lame', '-q:a', '4',
                            os.path.join(OUT, 'sounds', key + '.mp3')], check=True)
            sounds.append(key)
    if not have_ffmpeg:
        print('ffmpeg not found: no sounds written; manifest "soundNames" lists them')

    # rank pictures and theme: 5.0.5's own files?
    same = all(os.path.exists(os.path.join(ROOT, 'assets', 'explore', '%02d.jpg' % i)) and
               md5(os.path.join(app, '%02d.jpg' % i)) == md5(os.path.join(ROOT, 'assets', 'explore', '%02d.jpg' % i))
               for i in range(1, 26))
    if not same:
        os.makedirs(os.path.join(OUT, 'explore'), exist_ok=True)
        for i in range(1, 26):
            shutil.copy(os.path.join(app, '%02d.jpg' % i), os.path.join(OUT, 'explore', '%02d.jpg' % i))

    images = {('m%d' % (9000 + n)): 'report_icon-%d' % n for n in range(0, 51) if ('report_icon-%d' % n) in sd}
    manifest = {
        'source': 'Spaceward Ho! for iOS, Ariton (com.ariton.spacewardho) %s' % plistlib.load(open(os.path.join(app, 'Info.plist'), 'rb')).get('CFBundleShortVersionString', '?'),
        'sprites': sorted(sd),
        'hd': sorted(hd),
        'sounds': sorted(sounds, key=lambda k: (not k.isdigit(), int(k) if k.isdigit() else 0, k)),
        'soundFormat': 'mp3',
        'soundNames': names,
        'images': images,
        'explore': 'assets/explore/' if same else 'assets/skins/ios/explore/',
        'theme': 'assets/theme.mp3',
    }
    if missing:
        manifest['soundsMissing'] = missing
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print(len(sd), 'sprites (', len(hd), 'of them double size ),', len(sounds), 'sounds ->', OUT)


if __name__ == '__main__':
    main(sys.argv[1])
