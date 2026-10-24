import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import json,sys,glob,re
m=sys.argv[1]; code=sys.argv[2] if len(sys.argv)>2 else 'fr'
d=ROOT+f'docs/translations-notes/manuals/{m}/'
segs={x['id']:x for x in json.load(open(d+'segments.json'))}
MK=r'\{/?[a-z:_-]+\d+/?\}'
seen={};bad=[]
for f in sorted(glob.glob(d+f'{code}-*.tsv')):
    for n,l in enumerate(open(f,encoding='utf8'),1):
        l=l.rstrip('\n')
        if not l.strip(): continue
        try: i,t=l.split('\t',1); i=int(i)
        except Exception: bad.append((f[-9:],n,'format')); continue
        if i not in segs: bad.append((f[-9:],n,i,'unknown id')); continue
        if i in seen: bad.append((f[-9:],n,i,'duplicate with '+seen[i]))
        seen[i]=f[-9:]
        en=segs[i]['en']
        if not en.startswith('@alt:') and sorted(re.findall(MK,en))!=sorted(re.findall(MK,t)): bad.append((f[-9:],n,i,'markers',sorted(re.findall(MK,en)),sorted(re.findall(MK,t))))
        if '  ' in t: bad.append((f[-9:],n,i,'double space'))
        if re.search(r'[A-Za-z]\'[A-Za-z]',t): bad.append((f[-9:],n,i,'straight apostrophe'))
        if re.search(r'(?<!\w)"(?!\s*\})',t.replace('{','').replace('}','')) and '"' in t: bad.append((f[-9:],n,i,'straight quote'))
print(f'{m}: {len(seen)} of {len(segs)} translated; {len(bad)} problems'); [print('  ',b) for b in bad[:12]]
