#!/usr/bin/env python3
"""tools/webkit/wkscan.py: tools/contrast-scan.js in WebKit (WebKitGTK, the engine under Safari; not Safari itself).

    sudo apt install gir1.2-webkit2-4.1 xvfb python3-gi python3-pil          (Ubuntu 24.04)
    python3 -m http.server 8880 &                                              (from the repository root)
    xvfb-run -a -s "-screen 0 1280x900x24" python3 tools/webkit/wkscan.py http://localhost:8880/ <skin> [look,look...]
    WKDARK=1 xvfb-run -a ... python3 tools/webkit/wkscan.py http://localhost:8880/ <skin> safari,edge,firefox   (dark scheme)

Writes contrast-out-webkit/<skin>[-dark].json (OUT=dir to change); python3 tools/contrast-report.py <dir> reads them.
scan.js is the same scan as contrast-scan.js's; wk.py drives the offscreen WebView. Each run needs its own X display
(xvfb-run -a) and its own snapshot, so several skins can run side by side. See docs/contrast-2026-10.md."""
import sys, json, os, collections, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from wk import *
from PIL import Image
URL = sys.argv[1]; skin = sys.argv[2]; looks_arg = sys.argv[3] if len(sys.argv) > 3 else None
SCAN = open(os.path.join(HERE, 'scan.js')).read().strip().rstrip(';')
def lum(c):
    f = lambda v: (v/255)/12.92 if v/255 <= 0.03928 else (((v/255)+0.055)/1.055)**2.4
    return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])
w = WK()
res = {'skin': skin, 'states': {}, 'errors': []}
def ready():
    return w.eval("return !!(window.HOAPI && window.HOSKINS && document.querySelector('#titlescreen') && !document.querySelector('#titlescreen').classList.contains('loading'))")
def record(look, state):
    w.eval("document.querySelectorAll('.tip').forEach(e=>{ if(getComputedStyle(e).position==='fixed') e.remove(); }); return 1")
    r = w.eval("return (" + SCAN + ")()", timeout=30)
    if not isinstance(r, dict) or 'items' not in r: res['errors'].append(f'{look} {state}: scan {str(r)[:80]}'); return
    path = os.path.join(tempfile.gettempdir(), f'wk-shot-{skin}-{os.getpid()}.png')
    if not w.shot(path): res['errors'].append(f'{look} {state}: snapshot'); return
    im = Image.open(path).convert('RGB'); W, H = im.size; px = im.load(); fails = []
    for it in r['items'][:400]:
        x, y, ww, hh = [round(v) for v in it['rect']]; hist = collections.Counter(); n = 0; fg = it['fg']
        for yy in range(max(0, y), min(H, y+hh)):
            for xx in range(max(0, x), min(W, x+ww)):
                p = px[xx, yy]
                if (p[0]-fg[0])**2 + (p[1]-fg[1])**2 + (p[2]-fg[2])**2 < 1800: continue
                hist[(p[0]>>3, p[1]>>3, p[2]>>3)] += 1; n += 1
        if n < 6: continue
        k = hist.most_common(1)[0][0]; bg = [(k[0]<<3)|4, (k[1]<<3)|4, (k[2]<<3)|4]
        a, b = lum(fg), lum(bg); ratio = (max(a, b)+0.05)/(min(a, b)+0.05)
        if ratio < it['need']: fails.append({'sel': it['sel'], 'text': it['text'], 'fg': fg, 'bg': bg, 'ratio': round(ratio, 2), 'need': it['need'], 'size': it['size'], 'weight': it['weight'], 'img': it['img']})
    res['states'][f'{look}|{state}'] = {'checked': r['checked'], 'fails': fails}
def setlook(l): w.eval("HOSKINS.setOS(%s); return 1" % json.dumps(l)); w.pump(450)
try:
    w.load(f'{URL}?skin={skin}')
    for _ in range(60):
        if ready() is True: break
        w.pump(500)
    looks = looks_arg.split(',') if looks_arg else w.eval("return HOSKINS.oses.map(o=>o.id)")
    for l in looks: setlook(l); record(l, 'title')
    w.eval("HOAPI.newGameDialog(); return 1"); w.pump(800)
    for l in looks: setlook(l); record(l, 'newgame')
    w.eval("var f=document.querySelector('form.newgame'); if(f.requestSubmit) f.requestSubmit(); else f.querySelector('button[type=submit]').click(); return 1")
    for _ in range(40):
        if w.eval("return !!HOAPI.G") is True: break
        w.pump(500)
    w.pump(1200)
    for _ in range(40):
        if w.eval("return document.querySelectorAll('.clock').length") : break
        w.eval("try{HOAPI.closeModal()}catch(e){} var c=document.querySelector('#msg .card, #msg [tabindex]'); if(c)c.click(); return 1"); w.pump(150)
    for l in looks:
        setlook(l); record(l, 'game')
        w.eval("var b=document.querySelector('#menubar .mbtn:not(.logo)'); if(b) b.click(); return 1"); w.pump(300); record(l, 'menu')
        w.eval("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})); document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open')); return 1"); w.pump(150)
        for name, fn in (('about','openAbout'),('prefs','openPrefs'),('help','openHelp'),('reports','openReports')):
            try:
                w.eval("HOAPI.%s(); return 1" % fn); w.pump(500); record(l, name); w.eval("try{HOAPI.closeModal()}catch(e){} return 1"); w.pump(150)
            except Exception as e: res['errors'].append(f'{l} {name} {e}')
except Exception as e:
    res['errors'].append('fatal: ' + str(e)[:200])
OUT = os.environ.get('OUT', 'contrast-out-webkit'); os.makedirs(OUT, exist_ok=True)
json.dump(res, open(f'{OUT}/{skin}{"-dark" if os.environ.get("WKDARK") else ""}.json', 'w'))
print(skin, len(res['states']), 'states', sum(len(s['fails']) for s in res['states'].values()), 'failing spans', len(res['errors']), 'errors', res['errors'][:2])
