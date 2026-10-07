#!/usr/bin/env python3
"""Build one self-contained HTML file (assets embedded as data URIs) for
publishing to claude.ai. Output: dist/spaceward-ho.html. GitHub Pages serves
the repo files directly and does not need this.

Run from anywhere:  python3 tools/bundle.py [skin]   (default: classic)
"""
import base64, json, os, re, sys
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

def inline(m):
    src = m.group(1)
    return '<script>\n' + open(P(src)).read() + '\n</script>'

page = re.sub(r'<script src="([^"]+)"></script>', inline, page)
# one skin is built in (python3 tools/bundle.py <skin>, default classic);
# js/skins.js is told not to load one itself
skin = sys.argv[1] if len(sys.argv) > 1 else 'classic'
def skin_css(path):
    # a skin's (or an OS look's) CSS may @import another's by relative url
    css = open(path).read()
    imp = lambda m: skin_css(os.path.normpath(os.path.join(os.path.dirname(path), m.group(1))))
    return re.sub(r'@import url\("((?!https?:)[^"]+\.css)"\);', imp, css)

css = skin_css(P('js', 'skins', skin, 'style.css'))
# every OS look (js/os), each in a <style data-os> that js/skins.js turns on
# or off (media), ahead of the skin's CSS as the separate files load
looks = sorted(f[:-4] for f in os.listdir(P('js', 'os')) if f.endswith('.css') and f != 'base.css')
os_css = ''.join(f'<style data-os="{k}" media="not all">\n' + skin_css(P('js', 'os', k + '.css')) + '</style>\n' for k in looks)
js = open(P('js', 'skins', skin, 'ui.js')).read()
# a skin built on another one loads that one's ui.js after its own
# (and so on, if that one is built on another)
part = js
while True:
    srcs = re.findall(r"document\.write\('<script src=\"(js/skins/[^\"]+)\"><\\/script>'\)", part)
    if not srcs:
        break
    part = ''.join('\n' + open(P(src)).read() for src in srcs)
    js += part
# a skin's own art and sounds (assets/skins/<skin>/, see js/skins/classic/ui.js loadTheme)
sm = P('assets', 'skins', skin, 'manifest.json')
if os.path.exists(sm):
    m = json.load(open(sm))
    assets['skin'] = {
        'img': {k: uri(P('assets', 'skins', skin, 'sprites', k + '.png'), 'image/png') for k in m['sprites']},
        'snd': {str(k): uri(P('assets', 'skins', skin, 'sounds', f'{k}.wav'), 'audio/wav') for k in m['sounds']},
    }
page = page.replace('</head>', os_css + '</head>', 1)
page = page.replace('</body>', '<style>\n' + css + '</style>\n<script>\n' + js + '\n</script>\n</body>')
page = page.replace('<script>\n', '<script>window.HOSKINS_INLINE=' + json.dumps(skin) + ';</script>\n<script>\n', 1)
page = page.replace('<script>\n', '<script>window.ASSETS=' + json.dumps(assets) + ';</script>\n<script>\n', 1)
os.makedirs(P('dist'), exist_ok=True)
out = P('dist', 'spaceward-ho.html')
open(out, 'w').write(page)
print(out, round(len(page) / 1e6, 2), 'MB')
