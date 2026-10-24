#!/usr/bin/env python3
"""Check the pictures the docs link to, and lay them out for a look.

  python3 tools/doc-sprites.py                 every .md in the repo: exit 1 if a
                                               linked picture doesn't exist
  python3 tools/doc-sprites.py docs/missing-assets.md
                                               just that page
  python3 tools/doc-sprites.py docs/missing-assets.md --sheet sheet.png
                                               also draw every picture it links to,
                                               each labelled with its link text, so a
                                               wrong picture shows at a glance

A link is any Markdown link or <img src="..."> to a .png, .jpg or .gif, read
relative to the page. A directory link (assets/explore/) isn't checked. The
sheet needs Pillow (pip install pillow); the check doesn't.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIC = r'[^)"\s]+\.(?:png|jpg|gif)'
LINK = re.compile(r'\[([^\]]*)\]\((' + PIC + r')\)|<img[^>]*?src="(' + PIC + r')"[^>]*?(?:alt="([^"]*)")?', re.I)


def pages(args):
    if args:
        return [os.path.abspath(a) for a in args]
    out = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in ('.git', 'node_modules', 'dist')]
        out += [os.path.join(d, f) for f in files if f.endswith('.md')]
    return sorted(out)


def links(page):
    """[(label, absolute path, line number)] in the order the page has them."""
    found = []
    for n, line in enumerate(open(page, encoding='utf-8'), 1):
        for m in LINK.finditer(line):
            label, href = (m.group(1), m.group(2)) if m.group(2) else (m.group(4) or '', m.group(3))
            if re.match(r'[a-z]+:', href):  # http:, data: ...
                continue
            label = re.sub(r'[`*]', '', label).strip() or os.path.basename(href)
            found.append((label, os.path.normpath(os.path.join(os.path.dirname(page), href)), n))
    return found


def sheet(items, out):
    from PIL import Image, ImageDraw
    seen, cells = set(), []
    for label, path, _ in items:
        if path in seen or not os.path.exists(path):
            continue
        seen.add(path)
        cells.append((label, os.path.relpath(path, ROOT), Image.open(path).convert('RGBA')))
    cw, ch, cols = 220, 170, 5
    rows = (len(cells) + cols - 1) // cols
    W = Image.new('RGB', (cw * cols, max(1, rows) * ch), (176, 176, 192))
    d = ImageDraw.Draw(W)
    for i, (label, rel, im) in enumerate(cells):
        x, y = (i % cols) * cw, (i // cols) * ch
        k = min((cw - 10) / im.width, (ch - 34) / im.height)
        k = int(k) if k >= 1 else k  # whole-number zoom keeps pixel art sharp
        im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.NEAREST if k >= 1 else Image.LANCZOS)
        W.paste(im, (x + 5, y + 5), im)
        d.text((x + 5, y + ch - 28), label[:34], fill=(0, 0, 0))
        d.text((x + 5, y + ch - 15), rel[-34:], fill=(70, 70, 90))
    W.save(out)
    print(f'{len(cells)} pictures drawn to {out}')


def main(argv):
    out = None
    if '--sheet' in argv:
        i = argv.index('--sheet')
        out = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    bad, total, every = 0, 0, []
    for page in pages(argv):
        for label, path, n in links(page):
            total += 1
            every.append((label, path, n))
            if not os.path.exists(path):
                bad += 1
                print(f'x {os.path.relpath(page, ROOT)}:{n} links {os.path.relpath(path, ROOT)} ({label}), which does not exist')
    print(f'{total} picture links, {bad} broken')
    if out:
        sheet(every, out)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
