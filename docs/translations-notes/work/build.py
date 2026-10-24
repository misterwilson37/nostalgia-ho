import json,re,sys,os
HERE=os.path.dirname(os.path.abspath(__file__))
lang=sys.argv[1]            # fr
col={'fr':1,'de':2,'tr':3,'es':4}[lang]
allx=json.load(open(HERE+'/source-lines.json'))
tr={}
for n in range(1,6):
    try: f=open(f'{HERE}/{lang}-{n}.tsv',encoding='utf8')
    except FileNotFoundError: continue
    for ln in f:
        ln=ln.rstrip('\n')
        if not ln: continue
        i,t=ln.split('\t',1); i=int(i)
        assert i not in tr,('dup',i); tr[i]=t
ids={x['id'] for x in allx}
missing=sorted(ids-set(tr)); extra=sorted(set(tr)-ids)
print('translated',len(tr),'of',len(ids),'missing',missing[:20],'extra',extra)
ph=re.compile(r'%(?:\d+\$)?[sd]')
bad=[]
for x in allx:
    t=tr.get(x['id'])
    if t is None: continue
    if sorted(ph.findall(x['en']))!=sorted(ph.findall(t)): bad.append(x['id'])
    if '\t' in t or '\n' in t: bad.append(('ws',x['id']))
print('placeholder/whitespace problems:',bad)
def q(s): return "'"+s.replace('\\','\\\\').replace("'","\\'")+"'"
rows=[]
for x in allx:
    if x['id'] not in tr: continue
    cells=['null']*4; cells[col-1]=q(tr[x['id']])
    rows.append('['+q(x['en'])+', '+', '.join(cells)+'],')
open(f'{HERE}/rows-{lang}.txt','w',encoding='utf8').write('\n'.join(rows))
print('rows',len(rows))
