# Version 1.0.0. Run from the repo root: python3 tools/manuals/translate/helper-uiaudit.py <code>
# Lists the manuals' menu and window names (emphasised runs) that differ from the game's own words in js/ui-text.js.
import json,re,glob,sys,collections
lang=sys.argv[1]; col={'fr':1,'de':2,'tr':3,'es':4}[lang]
s=open('js/ui-text.js',encoding='utf8').read()+open('js/ui-text-help.js',encoding='utf8').read()
UI={}
for m in re.finditer(r"^\['((?:[^'\\]|\\.)*)',\s*((?:(?:'(?:[^'\\]|\\.)*'|null)(?:,\s*)?){1,5})",s,re.M):
    cells=re.findall(r"'((?:[^'\\]|\\.)*)'|null",m.group(2))
    vals=re.findall(r"('(?:[^'\\]|\\.)*'|null)",m.group(2))
    if len(vals)>=col and vals[col-1]!='null':
        k=m.group(1).replace("\\'","'").strip().rstrip('….').strip().lower()
        UI.setdefault(k,vals[col-1][1:-1].replace("\\'","'").rstrip('….').strip())
MK=r'\{/?[a-z:_-]+\d+/?\}'
miss=collections.defaultdict(list); ok=0; total=0
for m in ['5.0.5','4.0.5','3.0.1','2.0-dos']:
    d=f'docs/translations-notes/manuals/{m}/'
    segs={x['id']:x for x in json.load(open(d+'segments.json'))}
    tr={}
    for f in glob.glob(d+f'{lang}-*.tsv'):
        for l in open(f,encoding='utf8'):
            if l.strip(): i,t=l.rstrip('\n').split('\t',1); tr[int(i)]=t
    for i,x in segs.items():
        if i not in tr: continue
        for ph in re.findall(r'\{(?:em|b|i|strong)(\d+)\}(.*?)\{/(?:em|b|i|strong)\1\}',x['en']):
            name=re.sub(MK,'',ph[1]).strip().strip('"“”').strip().rstrip('….').strip()
            k=name.lower()
            if k in UI and 2<len(name)<40:
                total+=1; want=UI[k]
                if want.lower() in re.sub(MK,'',tr[i]).lower(): ok+=1
                else:
                    # what did the translator put inside the same marker?
                    got=re.search(r'\{(?:em|b|i|strong)'+ph[0]+r'\}(.*?)\{/',tr[i])
                    miss[(name,want)].append((m,i,re.sub(MK,'',got.group(1)).strip() if got else '?'))
print(lang,': UI names in the manuals',total,'; matching the game',ok,'; differing',total-ok)
for (en,want),l in sorted(miss.items(),key=lambda kv:-len(kv[1])):
    used=collections.Counter(g for _,_,g in l)
    print(f'  {len(l):2d}  {en!r}: game says {want!r}; manuals have {dict(used)}')
