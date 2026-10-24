#!/usr/bin/env python3
"""build-manuals.py 1.0.0

Builds the HTML manuals in assets/manuals/<folder>/ from the text sources in
tools/manuals/src/<folder>/ (manual.json, content.txt, img/).

    python3 tools/manuals/build-manuals.py            # every manual
    python3 tools/manuals/build-manuals.py 3.0.1      # one manual
    python3 tools/manuals/build-manuals.py --check    # build + verify, change nothing in assets/

Output matches assets/manuals/2.0-windows/: one HTML page per chapter,
index.html, one style.css, images as bmN.png / bmN.jpg. Needs Pillow.

content.txt format (blank-line separated blocks):
  === slug | Title                 start a chapter (page <slug>.html)
  ## Heading / ### Subheading      h2 / h3
  - item                           bullet list (consecutive lines)
  ::Term | Definition              glossary row (consecutive lines -> <dl class="gloss">)
  !fig file.png | alt | class      a picture in its own paragraph (class: center, left, right)
  !raw ...                         the rest of the block is raw HTML ({{img:}} tokens still work)
  plain text                       a paragraph (lines are joined)
inline:
  *italic*   **bold**   [[UI text]] (menu/button names)   -- (em dash)
  <<slug|link text>>               link to another chapter
  {{img:file.png|alt}}             an image inline (width/height from the file)
"""
import json, os, re, shutil, sys, html
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(ROOT, 'assets', 'manuals')

def smart(s):
    out = []
    for i, ch in enumerate(s):
        prev = s[i-1] if i else ''
        if ch == '"':
            out.append('\u201c' if (not prev or prev.isspace() or prev in '([{\u2014*-' ) else '\u201d')
        elif ch == "'":
            out.append('\u2018' if (not prev or prev.isspace() or prev in '([{\u2014*"\u201c') else '\u2019')
        else:
            out.append(ch)
    return ''.join(out)

class Manual:
    def __init__(self, folder):
        self.folder = folder
        self.dir = os.path.join(SRC, folder)
        self.meta = json.load(open(os.path.join(self.dir, 'manual.json'), encoding='utf-8'))
        self.chapters = []          # [{'slug','title','blocks'}]
        self.images = {}            # src name -> out name
        self.imgsize = {}
        self.parse()

    # ---- parsing ----
    def parse(self):
        text = open(os.path.join(self.dir, 'content.txt'), encoding='utf-8').read().replace('\r\n', '\n')
        cur = None
        for blk in re.split(r'\n\s*\n', text.strip()):
            blk = blk.strip('\n')
            if not blk.strip(): continue
            if blk.startswith('#!'): continue          # source comment
            if blk.startswith('==='):
                parts = [p.strip() for p in blk[3:].strip().split('|')]
                cur = {'slug': parts[0], 'title': parts[1], 'blocks': []}
                self.chapters.append(cur)
                continue
            if cur is None: raise SystemExit('content before first === in %s' % self.folder)
            cur['blocks'].append(blk)

    # ---- inline ----
    def img_name(self, src):
        if src not in self.images:
            ext = os.path.splitext(src)[1].lower()
            self.images[src] = 'bm%d%s' % (len(self.images), ext)
            p = os.path.join(self.dir, 'img', src)
            if not os.path.exists(p): raise SystemExit('missing image %s in %s' % (src, self.folder))
            im = Image.open(p)
            sc = float(self.meta.get('imgscale', 1))
            self.imgsize[src] = (round(im.width / sc), round(im.height / sc))
        return self.images[src]

    def inline(self, s):
        s = s.replace('--', '\u2014')
        if self.meta.get('smart'): s = smart(s)
        s = html.escape(s, quote=False)
        s = re.sub(r'\[\[(.+?)\]\]', r'<b class="ui">\1</b>', s)
        s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
        s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', s)
        def link(m):
            slug, txt = m.group(1), m.group(2)
            if slug not in [c['slug'] for c in self.chapters]: raise SystemExit('bad link <<%s>> in %s' % (slug, self.folder))
            return '<a href="%s.html">%s</a>' % (slug, txt)
        s = re.sub(r'&lt;&lt;([\w.-]+)\|(.+?)&gt;&gt;', link, s)
        def img(m):
            src, alt = m.group(1), m.group(2) if m.group(2) is not None else ''
            n = self.img_name(src); w, h = self.imgsize[src]
            return '<img src="%s" width="%d" height="%d" alt="%s">' % (n, w, h, html.escape(alt, quote=True))
        s = re.sub(r'\{\{img:([^|}]+)(?:\|([^}]*))?\}\}', img, s)
        return s

    def render_blocks(self, blocks):
        out = []
        for b in blocks:
            lines = b.split('\n')
            if b.startswith('!raw'):
                raw = b[4:].lstrip('\n ')
                raw = re.sub(r'\{\{img:([^|}]+)(?:\|([^}]*))?\}\}', lambda m: self.inline(m.group(0)), raw)
                out.append(raw)
            elif b.startswith('!fig'):
                f = [p.strip() for p in b[4:].split('|')]
                cls = f[2] if len(f) > 2 and f[2] else 'center'
                n = self.img_name(f[0]); w, h = self.imgsize[f[0]]
                alt = html.escape(f[1] if len(f) > 1 else '', quote=True)
                if len(f) > 3 and f[3].startswith('w='):
                    w0 = w; w = int(f[3][2:]); h = round(h * w / w0)
                out.append('<p class="%s"><img src="%s" width="%d" height="%d" alt="%s"></p>' % (cls, n, w, h, alt))
            elif b.startswith('### '):
                out.append('<h3>%s</h3>' % self.inline(b[4:].strip()))
            elif b.startswith('## '):
                out.append('<h2>%s</h2>' % self.inline(b[3:].strip()))
            elif all(l.startswith('- ') for l in lines):
                out.append('<ul>\n' + '\n'.join('<li>%s</li>' % self.inline(l[2:].strip()) for l in lines) + '\n</ul>')
            elif all(l.startswith('::') for l in lines):
                rows = []
                for l in lines:
                    t, d = [x.strip() for x in l[2:].split('|', 1)]
                    rows.append('<dt>%s</dt><dd>%s</dd>' % (self.inline(t), self.inline(d)))
                out.append('<dl class="gloss">\n' + '\n'.join(rows) + '\n</dl>')
            else:
                out.append('<p>%s</p>' % self.inline(' '.join(l.strip() for l in lines)))
        return '\n'.join(out)

    # ---- pages ----
    def page(self, title, body, prev=None, nxt=None, top=False):
        nav = ['<a href="index.html">Contents</a>']
        if prev: nav.append('<a href="%s.html">&larr; Previous</a>' % prev)
        if nxt: nav.append('<a href="%s.html">Next &rarr;</a>' % nxt)
        return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<title>%s</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<main>\n'
                '<nav class="top">%s</nav>\n<h1>%s</h1>\n%s\n<footer>%s</footer>\n</main>\n</body>\n</html>\n'
                % (re.sub(r'<[^>]+>', '', self.inline(title)), ' '.join(nav), self.inline(title), body, self.meta['footer']))

    def build(self, outdir):
        os.makedirs(outdir, exist_ok=True)
        slugs = [c['slug'] for c in self.chapters]
        order = [c['slug'] for c in self.chapters]
        # contents order comes from manual.json (groups), falling back to file order
        written = {}
        bodies = {c['slug']: self.render_blocks(c['blocks']) for c in self.chapters}
        titles = {c['slug']: c['title'] for c in self.chapters}
        flat = []
        li = []
        for g in self.meta['contents']:
            if g.get('group'): li.append('<li><b>%s</b>\n<ul>' % html.escape(g['group'], quote=False))
            for s in g['items']:
                if s not in titles: raise SystemExit('contents lists unknown slug %s' % s)
                flat.append(s)
                pg = g.get('pages', {}).get(s)
                li.append('<li><a href="%s.html">%s</a>%s</li>' % (s, self.inline(titles[s]), (' <small>(%s)</small>' % pg) if pg else ''))
            if g.get('group'): li.append('</ul></li>')
        missing = [s for s in slugs if s not in flat]
        if missing: raise SystemExit('chapters not in contents: %s' % missing)
        front = ''
        if self.meta.get('front'):
            front = self.render_blocks(self.meta['front'].strip().split('\n\n'))
        idx_body = front + '\n<ul class="contents">\n' + '\n'.join(li) + '\n</ul>'
        pages = {'index': self.page(self.meta['title'], idx_body, top=True)}
        # need images registered before sizes are final: render index first (front may use images)
        for i, s in enumerate(flat):
            pages[s] = self.page(titles[s], bodies[s], flat[i-1] if i else None, flat[i+1] if i + 1 < len(flat) else None)
        for name, h in pages.items():
            open(os.path.join(outdir, name + '.html'), 'w', encoding='utf-8', newline='\n').write(h)
        # css + images
        shutil.copyfile(os.path.join(self.dir, 'style.css'), os.path.join(outdir, 'style.css'))
        for src, dst in self.images.items():
            shutil.copyfile(os.path.join(self.dir, 'img', src), os.path.join(outdir, dst))
        return pages

def verify(outdir):
    errs = []
    files = [f for f in os.listdir(outdir) if f.endswith('.html')]
    for f in files:
        t = open(os.path.join(outdir, f), encoding='utf-8').read()
        for m in re.finditer(r'(?:href|src)="([^"#]+)"', t):
            u = m.group(1)
            if u.startswith(('http:', 'https:', 'mailto:')): continue
            if not os.path.exists(os.path.join(outdir, u)): errs.append('%s -> missing %s' % (f, u))
        for tag in ('p', 'ul', 'dl', 'li', 'b', 'i', 'main'):
            if len(re.findall(r'<%s[ >]' % tag, t)) != len(re.findall(r'</%s>' % tag, t)): errs.append('%s: unbalanced <%s>' % (f, tag))
        if '**' in t or '[[' in t or '{{' in t or '&lt;&lt;' in t: errs.append('%s: unconverted markup' % f)
    return files, errs

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    check = '--check' in sys.argv
    folders = args or sorted(d for d in os.listdir(SRC) if os.path.isdir(os.path.join(SRC, d)))
    bad = False
    for fd in folders:
        m = Manual(fd)
        outdir = os.path.join('/tmp/manual-check', fd) if check else os.path.join(OUT, fd)
        if os.path.isdir(outdir): shutil.rmtree(outdir)
        m.build(outdir)
        files, errs = verify(outdir)
        print('%s: %d pages, %d images%s' % (fd, len(files), len(m.images), ' -> ' + outdir))
        for e in errs: print('  ERROR', e); bad = True
        json.dump({v: k for k, v in m.images.items()}, open(os.path.join(HERE, 'images-%s.json' % fd), 'w'), indent=1) if not check else None
    sys.exit(1 if bad else 0)
