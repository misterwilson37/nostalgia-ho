#!/usr/bin/env python3
"""import-1.0.py: the Mac 1.0 manual's sources (tools/manuals/src/1.0/) from Jake's scans and the transcription that came with them.

The manual (Delta Tao Software, 1990) was bought by Jake from PC Games Vault (pcgamesvault.com) and scanned by him at 300 dpi; its
text came transcribed as a web page (the "HTML bundle"). Both are in the private repo (originals/mac-1.0-manual/). This writes:

  src/1.0/content.txt   the bundle's text, chapter for chapter (its h2s), sections (h3s), paragraphs, lists and glossary;
                        each figure where the book has it (the bundle's own captions and image index are left out: they're not the book's)
  src/1.0/img/*.png     each figure cut from the 300 dpi page it is on (found by matching the bundle's small crop, numpy FFT), the
                        paper and the print's black levelled (darker than 70 black, lighter than 185 white), at 2.5 pixels a Mac pixel
                        (the figures are printed at 8.2-8.5 scan pixels a Mac pixel: tools/skins/mac10_scan_grid.py); manual.json's
                        imgscale 2.5 shows them at the Mac's own size
  src/1.0/img/cover.jpg the cover

    python3 -I tools/manuals/import-1.0.py <scans-300dpi folder> <unzipped HTML bundle folder>
then python3 tools/manuals/build-manuals.py 1.0
"""
import html, json, os, re, sys
from html.parser import HTMLParser
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SCANS, BUNDLE = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', '1.0')
os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
page = lambda n: os.path.join(SCANS, '2026-11-22-%04d.jpg' % n)  # (file NN is page NN; 0000 the cover)
PITCH, PX = 8.33, 2.5


def locate(n, crop):
    """Where the bundle's crop (cut from a 1024-wide scan of page n) is on the 300 dpi page: its box there."""
    pg = Image.open(page(n)).convert('L'); W, H = pg.size
    a = np.array(pg.resize((1024, round(H * 1024 / W)), Image.BOX), float)
    t = Image.open(crop).convert('L'); best = None
    for sc in (0.95, 0.97, 0.99, 1.0, 1.01, 1.03, 1.05):
        tz = np.array(t.resize((max(8, round(t.width * sc)), max(8, round(t.height * sc))), Image.BOX), float)
        if tz.shape[0] >= a.shape[0] or tz.shape[1] >= a.shape[1]: continue
        tz -= tz.mean(); h, w = tz.shape
        corr = np.fft.irfft2(np.fft.rfft2(a) * np.fft.rfft2(tz[::-1, ::-1], a.shape), a.shape)
        I2 = np.cumsum(np.cumsum(np.pad(a, ((1, 0), (1, 0))) ** 2, 0), 1); I1 = np.cumsum(np.cumsum(np.pad(a, ((1, 0), (1, 0))), 0), 1)
        ys, xs = np.mgrid[0:a.shape[0] - h, 0:a.shape[1] - w]
        box = lambda I: I[ys + h, xs + w] - I[ys, xs + w] - I[ys + h, xs] + I[ys, xs]
        e = box(I2) - box(I1) ** 2 / (h * w)
        c = corr[h - 1:a.shape[0] - 1, w - 1:a.shape[1] - 1] / np.sqrt(np.maximum(e, 1) * (tz ** 2).sum())
        y, x = np.unravel_index(np.argmax(c), c.shape)
        if best is None or c[y, x] > best[0]: best = (c[y, x], x, y, w, h)
    _, x, y, w, h = best; k = W / 1024
    return pg, (int(x * k), int(y * k), int((x + w) * k), int((y + h) * k))


def figure(n, crop, name):
    pg, box = locate(n, crop)
    im = pg.crop(box)
    im = im.point(lambda v: 0 if v < 70 else 255 if v > 185 else int((v - 70) * 255 / 115))
    im = im.resize((round(im.width * PX / PITCH), round(im.height * PX / PITCH)), Image.LANCZOS)
    im.save(os.path.join(OUT, 'img', name), optimize=True)
    return name


class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.out = []; s.cur = None; s.buf = ''; s.skip = 0
    def handle_starttag(s, t, a):
        a = dict(a)
        if t in ('script', 'style', 'nav'): s.skip += 1
        if s.skip: return
        if t in ('h1', 'h2', 'h3', 'p', 'li', 'dt', 'dd', 'figcaption'): s.cur = t; s.buf = ''
        if t == 'img' and a.get('src', '').startswith('images/'): s.out.append(('img', a['src'], ''))
        if t in ('em', 'i'): s.buf += '*'
        if t in ('strong', 'b'): s.buf += '**'
        if t == 'br': s.buf += ' '
    def handle_endtag(s, t):
        if t in ('script', 'style', 'nav'): s.skip -= 1; return
        if s.skip: return
        if t in ('em', 'i'): s.buf += '*'
        if t in ('strong', 'b'): s.buf += '**'
        if t == s.cur: s.out.append((t, re.sub(r'\s+', ' ', s.buf).strip(), '')); s.cur = None
    def handle_data(s, d):
        if not s.skip and s.cur: s.buf += d


man = json.load(open(os.path.join(BUNDLE, 'manifest.json')))
figs = {im['file']: im for im in man['images']}
src = open(os.path.join(BUNDLE, 'index.html'), encoding='utf-8').read()
p = P(); p.feed(src[src.find('<main') if '<main' in src else 0:])
slug = lambda t: re.sub(r'[^a-z0-9]+', '-', re.sub(r'\*', '', t.lower()).replace('&', 'and')).strip('-')
blocks, slugs, seen, dl = [], [], set(), []
def flush():
    if dl: blocks.append('\n'.join('::%s | %s' % (a, b) for a, b in dl)); dl.clear()
started = False
for kind, text, _ in p.out:
    if kind == 'h2' and text.startswith('Extracted Images'): break  # (the bundle's own image index)
    if kind == 'h2':
        flush()
        if text == 'Table of Contents': started = False; continue
        started = True; s = slug(text); slugs.append(s); blocks.append('=== %s | %s' % (s, text)); continue
    if not started: continue
    if kind == 'h3': flush(); blocks.append('## ' + text)
    elif kind == 'p' and text: flush(); blocks.append(text.replace('|', '/'))
    elif kind == 'li': flush(); blocks.append('- ' + text)
    elif kind == 'dt': dl.append([text.rstrip(':'), ''])
    elif kind == 'dd' and dl: dl[-1][1] = text
    elif kind == 'img':
        flush(); f = figs.get(text)
        if not f or not f['page'].startswith('Page'): continue
        name = os.path.splitext(os.path.basename(text))[0] + '.png'
        if name not in seen:
            seen.add(name); figure(int(f['page'].split()[1]), os.path.join(BUNDLE, text), name)
        blocks.append('!fig %s | %s | center' % (name, f['title']))
flush()
# (consecutive list items into one list block)
merged = []
for b in blocks:
    if b.startswith('- ') and merged and merged[-1].startswith('- '): merged[-1] += '\n' + b
    else: merged.append(b)
open(os.path.join(OUT, 'content.txt'), 'w', encoding='utf-8').write('\n\n'.join(merged) + '\n')
cv = Image.open(page(0)).convert('L'); W, H = cv.size
cv = cv.crop((int(W * 0.012), int(H * 0.012), int(W * 0.988), int(H * 0.975))).resize((900, round(H * 0.963 * 900 / (W * 0.976))), Image.LANCZOS)
cv.convert('RGB').save(os.path.join(OUT, 'img', 'cover.jpg'), quality=85)
json.dump(slugs, open(os.path.join(OUT, 'slugs.json'), 'w'))
print(len(merged), 'blocks,', len(slugs), 'chapters,', len(seen), 'figures')
