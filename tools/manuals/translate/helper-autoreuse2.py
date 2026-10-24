# Version 1.0.1 (was unversioned). Fix: the output file was always fr-0d.tsv, whatever LANG_CODE was, so a run for
# another language overwrote the French table. It is now <LANG_CODE>-0d.tsv.
import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import json,re,glob,sys
W=ROOT+'docs/translations-notes/manuals/'
MK=re.compile(r'\{/?[a-z:_-]+\d+/?\}')
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
target=sys.argv[1]; ts,tt=load(target)
pool={}
for m in ['5.0.5','4.0.5','3.0.1','2.0-dos']:
    if m==target: continue
    s,t=load(m)
    for i,x in s.items():
        if i in t and not x['en'].startswith('@alt:'):
            k=norm(MK.sub('',x['en']))
            if len(k)>25 and k not in pool: pool[k]=(x['en'],MK.sub('',t[i]))
out=[];manual=[]
for i,x in ts.items():
    if i in tt or x['en'].startswith('@alt:'): continue
    en=x['en']; k=norm(MK.sub('',en))
    if k not in pool: continue
    pfr=pool[k][1].strip()
    toks=list(MK.finditer(en))
    # leading/trailing tokens stay at the edges; paired spans wrap their text if it survives in the French
    pre=''.join(m.group(0) for m in re.match(r'^((?:'+MK.pattern+r')*)',en).group(1) and MK.finditer(re.match(r'^((?:'+MK.pattern+r')*)',en).group(1)))
    post_m=re.search(r'((?:'+MK.pattern+r')*)$',en); post=post_m.group(1)
    core=en[len(pre):len(en)-len(post)]
    ok=True; res=pfr
    # spans inside the core
    for m in re.finditer(r'\{([a-z:_-]+)(\d+)\}(.*?)\{/\1\2\}',core):
        span=MK.sub('',m.group(3)); 
        if not span.strip(): ok=False;break
        if res.count(span)==1: res=res.replace(span,m.group(0)[:len(m.group(0))],1).replace(span,span,1) if False else res.replace(span,'{%s%s}%s{/%s%s}'%(m.group(1),m.group(2),span,m.group(1),m.group(2)),1)
        else: ok=False;break
    # any lone token left in the core (void tokens etc.) -> manual
    leftover=MK.findall(MK.sub('',re.sub(r'\{([a-z:_-]+)(\d+)\}.*?\{/\1\2\}','',core))) 
    if re.search(MK.pattern,re.sub(r'\{([a-z:_-]+)(\d+)\}.*?\{/\1\2\}','',core)): ok=False
    if ok:
        # keep the same inner edge spaces as the English
        out.append(f"{i}\t{pre}{res}{post}")
    else: manual.append(i)
open(W+target+'/'+LANGC+'-0d.tsv','w',encoding='utf8').write('\n'.join(out)+'\n')
print(target,len(out),'more runs reused with markers re-placed;',len(manual),'left for hand')
