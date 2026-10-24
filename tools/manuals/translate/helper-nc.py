import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import json,sys,glob
m=sys.argv[1]; lang=sys.argv[2]; lim=int(sys.argv[3]) if len(sys.argv)>3 else 14000
d=ROOT+f'docs/translations-notes/manuals/{m}/'
segs=json.load(open(d+'segments.json')); done=set()
for f in glob.glob(d+f'{lang}-*.tsv'):
    for l in open(f,encoding='utf8'):
        if l.strip(): done.add(int(l.split('\t')[0]))
todo=[x for x in segs if x['id'] not in done]
print(f'## {m} ({lang}): {len(done)} done, {len(todo)} left ({sum(len(x["en"]) for x in todo)} chars)')
n=0
for x in todo:
    s=f"{x['id']}\t{x['en']}"; print(s); n+=len(s)
    if n>lim: break
