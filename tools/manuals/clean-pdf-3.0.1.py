#!/usr/bin/env python3
"""clean-pdf-3.0.1.py 1.0.0

Cleans the Internet Archive scan of the Spaceward Ho! 3.0.1 manual:
  * turns the three sideways pages (front cover, registration card, back cover) upright
  * replaces the OCR text layer with the corrected text from tools/manuals/src/3.0.1/content.txt
    (each corrected word is placed on the box of the OCR word it replaces, so search and
    copy still land on the right spot; the page images are untouched)

    python3 tools/manuals/clean-pdf-3.0.1.py Ho_Manual.pdf assets/manuals/3.0.1.pdf

Needs: pip install pymupdf pillow
"""
import sys, os, re, html, difflib, json
import pymupdf as fitz

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
bm = __import__('build-manuals'.replace('-', '_')) if False else None
import importlib.util
spec = importlib.util.spec_from_file_location('bm', os.path.join(HERE, 'build-manuals.py'))
bm = importlib.util.module_from_spec(spec); spec.loader.exec_module(bm)

def reference_tokens():
    m = bm.Manual('3.0.1')
    toks = 'Spaceward Ho! 3.0 by Peter Commons Artwork by Howard Vives and Bob van de Walle Sounds by Mark Madeley Designed by Joe Williams and Peter Commons Manual and software \u00a9 Copyright 1991-1993 by Delta Tao Software, Inc. All rights reserved'.split()
    for c in m.chapters:
        if c['slug'] in ('warranty-registration-survey', 'back-cover', 'last-minute-notes'): continue
        h = m.render_blocks(c['blocks'])
        t = html.unescape(re.sub(r'<[^>]+>', ' ', h))
        toks += [c['title']] if False else c['title'].split()
        toks += t.split()
    return toks

def norm(w):
    return re.sub(r'[^0-9a-z]', '', w.lower().replace('\u00ae', ''))

# text for the pages whose OCR was unusable (cover, registration card, back cover)
BLOB = {
 0: 'CONQUER THE GALAXY ON YOUR MACINTOSH SPACEWARD HO!',
 2: 'Spaceward Ho! 3.0 Warranty Registration/Survey. Please fill out this card, tear it out, and mail it to us. Don\u2019t fold it. Name Address Phone Number What is your main Mac like? (CPU, Memory, Disk Size, Peripherals, Color Screen) What is your primary business? When and where did you get Spaceward Ho!? What are your favorite games? Which games are turkeys? How do you like the manual? Rate Spaceward Ho! on a scale of 1-10 (10 is best): Is Spaceward Ho! priced right? What games would you like to see us write? What percent of your Ho! games are networked? What other products would you most like to see us develop? What\u2019s your favorite Macintosh software company? Why? What do you think of our packaging?',
 71: 'Spaceward Ho! Version 3.0. Big, fluffy boxes are evil. This software uses the manual as a box to minimize waste and environmental damage. Spaceward Ho! is a strategy game of awesome scope, casting you as the leader of a spacefaring race. Your goal is to explore and to colonize the galaxy. Of course, you are not alone. As you discover new worlds to colonize and terraform or mine, you\u2019ll find aliens bent on their own galactic conquest opposing your expanding empire. Ally with them, or fight them using ships built with your latest technological advances. And if you use your resources (both limited and renewable) cleverly, you\u2019ll conquer the galaxy! Works on any Macintosh with 1MB of memory running System 6.0.5 or greater. Play against up to 20 computer opponents, or against friends on an AppleTalk network. Every game is unique: choose type of galaxy, number of stars, and artificial intelligence level. Research new technologies (weapons, shields, miniaturization, engines, and radical) to build custom spaceships. Runs in color on color Macintoshes. \u00a9 Copyright 1992 by Delta Tao Software, Inc. 760 Harvard Ave., Sunnyvale, CA 94087. Phone: (800) 827-9316, (408) 730-9336, FAX -9337. Minimum 35% post-consumer waste. Pages printed on 100% recycled paper.',
}
ROTATE = {0: 270, 2: 270, 71: 90}   # degrees clockwise to display upright
SKIP_ALIGN = set(BLOB) | {1}        # page 2 (comments mailer) keeps its OCR text

def find_font():
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
              'C:/Windows/Fonts/arial.ttf', '/Library/Fonts/Arial.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf'):
        if os.path.exists(f): return f
    raise SystemExit('need a Unicode TTF (DejaVu Sans, Liberation Sans or Arial) for the corrected text layer')

def main(src, dst):
    FONT = find_font()
    ref = reference_tokens()
    doc = fitz.open(src)
    # 1. collect OCR words in reading order
    ocr = []   # (page, bbox, text)
    for pn in range(len(doc)):
        if pn in SKIP_ALIGN: continue
        for x0, y0, x1, y1, w, *_ in doc[pn].get_text('words', sort=True):
            ocr.append((pn, fitz.Rect(x0, y0, x1, y1), w))
    a = [norm(o[2]) for o in ocr]; b = [norm(t) for t in ref]
    ia = [i for i, x in enumerate(a) if x]; ib = [j for j, x in enumerate(b) if x]
    sm = difflib.SequenceMatcher(None, [a[i] for i in ia], [b[j] for j in ib], autojunk=False)
    newtext = {i: ocr[i][2] for i in range(len(ocr))}
    fixed = 0
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != 'replace': continue
        A = [ia[k] for k in range(i1, i2)]; B = [ref[ib[k]] for k in range(j1, j2)]
        if len(A) > 12 or len(B) > 12: continue          # a mismatch that big is a figure or a reorder, not a typo
        if len(A) == len(B):
            for i, t in zip(A, B): newtext[i] = t
        else:                                             # OCR split or merged words: keep the corrected words in order
            for k, i in enumerate(A): newtext[i] = B[k] if k < len(B) else ''
            if len(B) > len(A): newtext[A[-1]] += ' ' + ' '.join(B[len(A):])
        fixed += len(A)
    # 2. rewrite each page's text layer
    byp = {}
    for i, (pn, r, w) in enumerate(ocr): byp.setdefault(pn, []).append((r, newtext[i]))
    for pn in range(len(doc)):
        pg = doc[pn]
        if pn == 1: continue
        pg.add_redact_annot(pg.rect)
        pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE) if hasattr(fitz, 'PDF_REDACT_LINE_ART_NONE') else pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
        if pn in BLOB:
            pg.insert_textbox(pg.rect + (20, 20, -20, -20), BLOB[pn], fontsize=7, fontname='uf', fontfile=FONT, render_mode=3,
                              rotate=0)
        else:
            for r, t in byp.get(pn, []):
                if not t.strip(): continue
                fs = max(3.0, min(r.height * 0.85, 14))
                tl = fitz.Font(fontfile=FONT).text_length(t, fontsize=fs)
                if tl > r.width * 1.05 and tl > 0: fs = max(2.0, fs * r.width / tl)
                pg.insert_text((r.x0, r.y1 - r.height * 0.2), t, fontsize=fs, fontname='uf', fontfile=FONT, render_mode=3)
        if pn in ROTATE: pg.set_rotation(ROTATE[pn])
    doc.set_metadata({**doc.metadata, 'title': 'Spaceward Ho! 3.0.1 Manual',
                      'subject': 'Scan from the Internet Archive; pages rotated upright and OCR text layer corrected (tools/manuals/clean-pdf-3.0.1.py)'})
    try: doc.subset_fonts()          # needs fonttools; just makes the file smaller
    except Exception: pass
    doc.save(dst, garbage=4, deflate=True)
    print('corrected %d OCR words; wrote %s (%d bytes)' % (fixed, dst, os.path.getsize(dst)))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
