# Version 1.0.1 (was unversioned). Fix: the output file was always fr-0c.tsv, whatever LANG_CODE was, so a run for
# another language overwrote the French table. It is now <LANG_CODE>-0c.tsv.
import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import json,re,glob,sys
sys.path.insert(0,'/tmp')
W=ROOT+'docs/translations-notes/manuals/'
MK=re.compile(r'\{/?[a-z:_-]+\d+/?\}')
def canon(t):
    n=[0]
    def f(m): n[0]+=1; return '⟦%d⟧'%n[0]
    return MK.sub(f,t)
def norm(t):
    t=t.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"').replace('—',' - ').replace('--',' - ')
    t=re.sub(r'\s+',' ',t).strip().lower(); t=re.sub(r'\s*-\s*',' - ',t); return t
def load(m):
    segs={x['id']:x for x in json.load(open(W+m+'/segments.json'))}
    tr={}
    for f in glob.glob(W+m+'/'+LANGC+'-*.tsv'):
        for l in open(f,encoding='utf8'):
            if l.strip(): i,t=l.rstrip('\n').split('\t',1); tr[int(i)]=t
    return segs,tr
target=sys.argv[1]
ts,tt=load(target)
pool={}
for m in ['5.0.5','4.0.5','3.0.1','2.0-dos']:
    if m==target: continue
    s,t=load(m)
    for i,x in s.items():
        if i in t and not x['en'].startswith('@alt:'):
            c=norm(canon(x['en']))
            if len(MK.sub('',x['en']).strip())>25 and c not in pool: pool[c]=(x['en'],t[i])
out=[];
for i,x in ts.items():
    if i in tt or x['en'].startswith('@alt:'): continue
    c=norm(canon(x['en']))
    if c in pool:
        pen,pfr=pool[c]
        ptoks=MK.findall(pen); ttoks=MK.findall(x['en'])
        mp=dict(zip(ptoks,ttoks)) if len(ptoks)==len(ttoks) else None
        if mp is None: continue
        # tokens may repeat in the pool text (same marker twice impossible: numbers unique), so map by token string
        fr=MK.sub(lambda m: mp.get(m.group(0),m.group(0)),pfr)
        # keep the target's own edge markers/spaces exactly as in its English
        out.append(f"{i}\t{fr}")
open(W+target+'/'+LANGC+'-0c.tsv','w',encoding='utf8').write('\n'.join(out)+'\n')
print(target,len(out),'runs reused exactly from other manuals')
