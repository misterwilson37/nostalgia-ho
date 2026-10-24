#!/usr/bin/env python3
"""Translate a manual's pages without touching its markup.   Version 1.2.0 (1.1.0: Spanish footer; 1.2.0: Turkish footer)

  python3 tools/manuals/translate/manualtr.py extract <folder> [--root .]
  python3 tools/manuals/translate/manualtr.py build   <folder> <code> [--root .] [--check]

extract: reads assets/manuals/<folder>/*.html and writes
  docs/translations-notes/manuals/<folder>/segments.json   (the unique text runs, numbered)
A text run is the words between block tags (a paragraph, a heading, a list item, a table cell,
the page's <title>, an image's alt). Inline tags inside a run are shown as markers so the
translator keeps them: {a1}text{/a1} for <a ...>, {em2}...{/em2}, {br3/} for <br>, {img4/}.
Two runs that read the same share a number (the navigation, "Contents", footers).

build: reads <code>-*.tsv in the same folder (number TAB translation, one per line), checks every
run is translated and each translation has exactly its source's markers, and writes
assets/manuals/<folder>-<code>/ : every page rebuilt with the translation in place of the English,
<html lang> set, a small line at the foot saying it is the remake's translation (linking to the
English page), and the pictures and stylesheet linked from the English folder (not copied).
"""
import sys, os, re, json, glob, copy
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype, Tag, ProcessingInstruction, Declaration, CData

BLOCKS = {'p','h1','h2','h3','h4','h5','h6','li','ul','ol','dl','dt','dd','table','thead','tbody','tfoot','tr','td','th','title',
          'caption','footer','header','nav','main','section','article','aside','blockquote','figure','figcaption','pre','center','div','body','html','head','form','fieldset','hr'}
VOID = {'br','img','hr','wbr'}
SKIP = {'script','style','meta','link','xml'}
LETTER = re.compile(r'[A-Za-z]')
FOOT = {'fr': ('Traduction française du remake, non officielle, du manuel de Delta Tao. ', 'La page en anglais', ' (en anglais).'),
        'de': ('Deutsche Übersetzung des Remakes, keine offizielle, des Handbuchs von Delta Tao. ', 'Die Seite auf Englisch', ' (auf Englisch).'),
        'es': ('Traducción al español del remake, no oficial, del manual de Delta Tao. ', 'La página en inglés', ' (en inglés).'),
        'tr': ('Delta Tao kılavuzunun yeniden yapım tarafından yapılmış, resmî olmayan Türkçe çevirisi. ', 'İngilizce sayfa', '.'),
        'xx': ('Test. ', 'English page', ' (English).')}

def has_block(el):
    return any(isinstance(d, Tag) and d.name in BLOCKS for d in el.descendants)
def is_block(c): return isinstance(c, Tag) and (c.name in BLOCKS or has_block(c))
def textish(c): return isinstance(c, NavigableString) and not isinstance(c, (Comment, Doctype, ProcessingInstruction, Declaration, CData))

def runs_of(container):
    """yield lists of consecutive non-block children of container that hold letters"""
    run = []
    def flush():
        nonlocal run
        if run and any(LETTER.search(t.get_text() if isinstance(t, Tag) else str(t)) for t in run if (isinstance(t, Tag) or textish(t))):
            yield list(run)
        run = []
    for c in list(container.children):
        if isinstance(c, Tag) and c.name in SKIP:
            yield from flush(); continue
        if isinstance(c, Tag) and is_block(c):
            yield from flush(); yield ('block', c); continue
        if isinstance(c, NavigableString) and not textish(c):
            continue            # comments, doctype: leave in place, don't break the run
        run.append(c)
    yield from flush()

def ser(nodes):
    """run -> (marker text, table of tags, lead, trail); table[i] = the original Tag (kept by reference)"""
    table, count = [], [0]
    def walk(n):
        if isinstance(n, NavigableString):
            return str(n) if textish(n) else ''
        count[0] += 1; k = count[0]; table.append(n)
        if n.name in VOID: return '{%s%d/}' % (n.name, k)
        inner = ''.join(walk(c) for c in n.children)
        return '{%s%d}%s{/%s%d}' % (n.name, k, inner, n.name, k)
    raw = ''.join(walk(n) for n in nodes)
    lead = raw[:1].isspace(); trail = raw[-1:].isspace()
    return re.sub(r'\s+', ' ', raw).strip(), table, lead, trail

def collect(soup):
    """all runs of a page, in order: (nodes, text, table, lead, trail) and alt attributes"""
    out = []
    def go(container):
        for r in runs_of(container):
            if isinstance(r, tuple): go(r[1]); continue
            text, table, lead, trail = ser(r)
            if LETTER.search(re.sub(r'\{/?[a-z:_-]+\d+/?\}', '', text)): out.append((r, text, table, lead, trail))
    root = soup.find('html') or soup
    go(root)
    return out

def markers(s): return sorted(re.findall(r'\{/?[a-z:_-]+\d+/?\}', s))
def load(path):
    return BeautifulSoup(open(path, encoding='utf-8', errors='replace').read(), 'html.parser')

def pages(root, folder):
    return sorted(glob.glob(os.path.join(root, 'assets/manuals', folder, '*.html')))

def alts(soup):
    return [(i, i['alt']) for i in soup.find_all('img') if i.get('alt') and LETTER.search(i['alt'])]

def cmd_extract(folder, root):
    seg, order = {}, []
    for p in pages(root, folder):
        s = load(p)
        for r, text, table, lead, trail in collect(s):
            if text not in seg: seg[text] = {'id': len(seg), 'pages': []}; order.append(text)
            if os.path.basename(p) not in seg[text]['pages']: seg[text]['pages'].append(os.path.basename(p))
        for i, a in alts(s):
            k = '@alt:' + re.sub(r'\s+', ' ', a).strip()
            if k not in seg: seg[k] = {'id': len(seg), 'pages': []}; order.append(k)
            if os.path.basename(p) not in seg[k]['pages']: seg[k]['pages'].append(os.path.basename(p))
    out = [{'id': seg[t]['id'], 'en': t, 'pages': seg[t]['pages']} for t in order]
    d = os.path.join(root, 'docs/translations-notes/manuals', folder); os.makedirs(d, exist_ok=True)
    json.dump(out, open(os.path.join(d, 'segments.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{folder}: {len(pages(root, folder))} pages, {len(out)} unique text runs, {sum(len(x["en"]) for x in out)} characters -> {d}/segments.json')

def read_tsv(d, code):
    tr = {}
    for f in sorted(glob.glob(os.path.join(d, f'{code}-*.tsv'))):
        for ln in open(f, encoding='utf-8'):
            ln = ln.rstrip('\n')
            if not ln.strip(): continue
            i, t = ln.split('\t', 1); i = int(i)
            assert i not in tr, f'segment {i} translated twice ({f})'
            tr[i] = t
    return tr

def parse_markers(t, table):
    """translation text -> list of nodes, tags copied from the table"""
    toks = re.split(r'(\{/?[a-z:_-]+\d+/?\})', t); stack = [[]]; opens = []
    for tok in toks:
        m = re.fullmatch(r'\{(/?)([a-z:_-]+)(\d+)(/?)\}', tok)
        if not m:
            if tok: stack[-1].append(NavigableString(tok))
            continue
        close, name, k, selfc = m.group(1), m.group(2), int(m.group(3)), m.group(4)
        orig = table[k - 1]
        if selfc:
            n = copy.copy(orig); n.clear(); stack[-1].append(n)
        elif not close:
            n = copy.copy(orig); n.clear(); stack[-1].append(n); stack.append([]); opens.append((k, n))
        else:
            kk, n = opens.pop(); assert kk == k, f'marker order: {{/{name}{k}}}'
            for c in stack.pop(): n.append(c)
    assert len(stack) == 1 and not opens, 'unclosed marker'
    return stack[0]

def cmd_build(folder, code, root, check=False):
    d = os.path.join(root, 'docs/translations-notes/manuals', folder)
    segs = json.load(open(os.path.join(d, 'segments.json'), encoding='utf-8'))
    tr = read_tsv(d, code)
    ids = {x['id'] for x in segs}
    missing = sorted(ids - set(tr)); extra = sorted(set(tr) - ids)
    bad = []
    for x in segs:
        t = tr.get(x['id'])
        if t is None: continue
        if x['en'].startswith('@alt:'): continue
        if markers(x['en']) != markers(t): bad.append((x['id'], 'markers'))
        if re.search(r'  |\t|\n', t): bad.append((x['id'], 'whitespace'))
    print(f'{folder} -> {code}: {len(tr)} of {len(ids)} runs translated; missing {len(missing)}; extra {extra}; problems {bad[:10]}')
    if missing or extra or bad:
        if missing: print('  first missing:', missing[:15])
        return 1
    byen = {x['en']: tr[x['id']] for x in segs}
    out = os.path.join(root, 'assets/manuals', f'{folder}-{code}') if not check else os.path.join('/tmp', 'manual-fr-check', f'{folder}-{code}')
    os.makedirs(out, exist_ok=True)
    src = os.path.join(root, 'assets/manuals', folder)
    asset_ok = lambda u: u and not re.match(r'^(https?:|mailto:|#|data:)', u)
    n_pages = 0; orphans = []
    for p in pages(root, folder):
        s = load(p); base = os.path.basename(p)
        for r, text, table, lead, trail in reversed(collect(s)):
            t = byen[text]; nodes = parse_markers(t, table)
            first = r[0]
            if lead: first.insert_before(NavigableString(' '))
            for n in nodes: first.insert_before(n)
            if trail: first.insert_before(NavigableString(' '))
            for old in r: old.extract()
        for i, a in alts(s):
            k = '@alt:' + re.sub(r'\s+', ' ', a).strip(); i['alt'] = byen[k]
        # language
        h = s.find('html')
        if h is not None: h['lang'] = code; h.attrs.pop('xml:lang', None)
        b = s.find('body')
        if b is not None and b.get('lang'): b['lang'] = code
        # pictures, stylesheet: from the English folder; page links stay
        for tag, attr in (('img', 'src'), ('link', 'href'), ('script', 'src'), ('a', 'href'), ('td', 'background'), ('body', 'background')):
            for e in s.find_all(tag):
                u = e.get(attr)
                if asset_ok(u) and not re.search(r'\.html?(#.*)?$', u.split('?')[0]) and os.path.exists(os.path.join(src, u.split('#')[0].split('?')[0])):
                    e[attr] = f'../{folder}/' + u
        # the line at the foot
        note = s.new_tag('p'); note['class'] = 'trnote'; note['style'] = 'font-size:85%;color:#666;margin-top:2em'
        note.append(FOOT[code][0]); a = s.new_tag('a', href=f'../{folder}/{base}'); a.string = FOOT[code][1]; note.append(a); note.append(FOOT[code][2] if len(FOOT[code]) > 2 else '')
        if b is not None:
            (b.find('main') or b).append(note)
        open(os.path.join(out, base), 'w', encoding='utf-8').write(str(s))
        # anything English left outside a run
        t = re.sub(r'\s+', ' ', ' '.join(x for x in s.find('body').strings if textish(x) and x.parent.name not in SKIP)) if s.find('body') else ''
        n_pages += 1
    print(f'  wrote {n_pages} pages to {out}')
    return 0

if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    root = (sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else '.')
    a = [x for x in a if x != root]
    if a[0] == 'extract': cmd_extract(a[1], root)
    elif a[0] == 'build': sys.exit(cmd_build(a[1], a[2], root, '--check' in sys.argv))
