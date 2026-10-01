#!/usr/bin/env python3
"""Build one self-contained HTML file (assets embedded as data URIs) for
publishing to claude.ai. Output: dist/spaceward-ho.html. GitHub Pages serves
the repo files directly and does not need this.

Run from anywhere:  python3 tools/bundle.py
"""
import base64, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

def uri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

man = json.load(open(P('assets', 'manifest.json')))
assets = {
    'img': {k: uri(P('assets', 'sprites', k + '.png'), 'image/png') for k in man['sprites']},
    'snd': {k: uri(P('assets', 'sounds', k + '.mp3'), 'audio/mpeg') for k in man['sounds']},
    'jpg': [uri(P('assets', 'explore', f'{i:02d}.jpg'), 'image/jpeg') for i in range(1, man['explore'] + 1)],
    'theme': uri(P('assets', 'theme.mp3'), 'audio/mpeg'),
}
page = open(P('index.html')).read()
css = open(P('js', 'skins', 'classic', 'style.css')).read()
page = page.replace('<link rel="stylesheet" href="js/skins/classic/style.css">', '<style>\n' + css + '</style>')

def inline(m):
    src = m.group(1)
    return '<script>\n' + open(P(src)).read() + '\n</script>'

page = re.sub(r'<script src="([^"]+)"></script>', inline, page)
page = page.replace('<script>\n', '<script>window.ASSETS=' + json.dumps(assets) + ';</script>\n<script>\n', 1)
os.makedirs(P('dist'), exist_ok=True)
out = P('dist', 'spaceward-ho.html')
open(out, 'w').write(page)
print(out, round(len(page) / 1e6, 2), 'MB')
