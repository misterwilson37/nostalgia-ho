#!/usr/bin/env python3
"""tools/contrast-report.py <dir>: summarize the JSON files tools/contrast-scan.js wrote (one per skin, `-dark` for the
dark scheme): the totals, the failures in each skin's own looks, and the causes that hit several skins (a look's fault)."""
import collections, glob, json, os, sys
OWN = {'mac12': 'system6 system7', 'mac2': 'system7 system6', 'mac2c': 'system7 system6', 'dos': 'dos win31', 'mac3': 'system7',
       'mac3c': 'system7', 'amiga': 'workbench', 'mac4': 'system7 macos8 netscapemac', 'mac4c': 'system7 macos8 netscapemac',
       'w95': 'win95 netscape', 'palm': 'palmos', 'classic': 'macos8 macos9 macosx', 'ios': 'ios10 ios6', 'android': 'fireos android4',
       'cozy': 'macos8 macos9 macosx firefox safari edge', 'gemini': 'macosx macos9 win95 macos8 system7 win31 firefox safari edge'}
d = sys.argv[1] if len(sys.argv) > 1 else 'contrast-out'
for scheme in ('light', 'dark'):
    rows, states, checked = [], 0, 0
    for f in sorted(glob.glob(os.path.join(d, '*.json'))):
        if f.endswith('-dark.json') != (scheme == 'dark'):
            continue
        r = json.load(open(f))
        for k, s in r['states'].items():
            states += 1; checked += s['checked']
            look, state = k.split('|')
            rows += [dict(skin=r['skin'], look=look, state=state, **x) for x in s['fails']]
    if not states:
        continue
    own = [r for r in rows if r['look'] in OWN[r['skin']].split()]
    print(f'== {scheme}: {states} states, {checked} text spans checked, {len(rows)} failing, {len(own)} in a skin\'s own looks')
    print('   own looks, by skin:', collections.Counter(r['skin'] for r in own).most_common())
    g = collections.defaultdict(lambda: dict(skins=set(), ratio=99, ex='', bg=None))
    for r in rows:
        k = (r['look'], ' > '.join(r['sel'].split(' > ')[-2:]), tuple(r['fg']))
        x = g[k]; x['skins'].add(r['skin']); x['ratio'] = min(x['ratio'], r['ratio']); x['ex'] = x['ex'] or r['text']; x['bg'] = x['bg'] or tuple(r['bg'])
    for k, x in sorted(((k, x) for k, x in g.items() if len(x['skins']) >= 4), key=lambda kx: (kx[0][0], kx[1]['ratio'])):
        print(f"   {k[0]:10} {x['ratio']:.2f} in {len(x['skins'])} skins  {k[1]}  fg{k[2]} on {x['bg']}  '{x['ex'][:24]}'")
