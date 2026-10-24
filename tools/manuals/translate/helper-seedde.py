import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import json,re,glob,sys
lang=sys.argv[1]; col={'fr':1,'de':2,'tr':3,'es':4}[lang]
root=ROOT
W=root+'docs/translations-notes/'
src=json.load(open(W+'work/source-lines.json'))
fr={}
for f in sorted(glob.glob(W+f'work/{lang}-*.tsv')):
    for l in open(f,encoding='utf8'):
        if l.strip(): i,t=l.rstrip('\n').split('\t',1); fr[int(i)]=t
def norm(t): return re.sub(r'\s+',' ',t.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"').replace('—','--').replace(' - ',' -- ')).strip().lower()
N={norm(x['en']):fr[x['id']] for x in src if x['id'] in fr}
# hover help rows
hs=open(root+'js/ui-text-help.js',encoding='utf8').read()
H={}
for m in re.finditer(r"^\['((?:[^'\\]|\\.)*)',\s*\n?\s*((?:'(?:[^'\\]|\\.)*'(?:,\s*)?){1,6})",hs,re.M):
    cells=re.findall(r"'((?:[^'\\]|\\.)*)'",m.group(2))
    if len(cells)>=col: H[norm(m.group(1).replace("\\'","'"))]=cells[col-1].replace("\\'","'")
MK=r'\{/?[a-z:_-]+\d+/?\}'
def split(t):
    m=re.match(r'^((?:'+MK+r'\s*)*)(.*?)((?:\s*'+MK+r')*)$',t,re.S); return m.group(1),m.group(2),m.group(3)
for m in ['5.0.5','4.0.5','3.0.1','2.0-dos']:
    d=W+f'manuals/{m}/'
    segs=json.load(open(d+'segments.json')); have=set()
    for f in glob.glob(d+f'{lang}-*.tsv'):
        for l in open(f,encoding='utf8'):
            if l.strip(): have.add(int(l.split('\t')[0]))
    out=[];hn=0
    for x in segs:
        if x['id'] in have or x['en'].startswith('@alt:'): continue
        pre,core,post=split(x['en'])
        if re.search(MK,core): continue
        k=norm(core)
        if k in N: out.append(f"{x['id']}\t{pre}{N[k]}{post}")
        elif k in H and len(k)>25: out.append(f"{x['id']}\t{pre}{H[k]}{post}"); hn+=1
    open(d+f'{lang}-0.tsv','w',encoding='utf8').write('\n'.join(out)+('\n' if out else ''))
    print(m,len(out),'seeded (',hn,'from the hover help )')
