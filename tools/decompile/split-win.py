#!/usr/bin/env python3
# Splits DumpAll.java's one-file output (a 16-bit Windows NE program) into one file per routine and an index.
#   python3 -I tools/decompile/split-win.py <dump.c> <out folder>
# Makes <out>/all.c (the dump as it is), <out>/c/<segment>/<offset>-<name>.c and <out>/index.tsv
# (segment, address as segment:offset, size (not known from the dump: '-'), routine, c status ok/empty).
import sys,re,os
src,out=sys.argv[1],sys.argv[2]
t=open(src,encoding='latin-1').read()
os.makedirs(out+'/c',exist_ok=True)
parts=re.split(r'(?m)^(?=//==== )',t)
rows=[]
for p in parts:
    m=re.match(r'//==== (\S+) @ ([0-9a-f]{4}):([0-9a-f]{4})',p)
    if not m: continue
    name,seg,off=m.groups()
    d=f'{out}/c/{seg}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/{off}-{name}.c','w',encoding='latin-1').write(p.rstrip()+'\n')
    body=p.split('\n',1)[1] if '\n' in p else ''
    rows.append((seg,f'{seg}:{off}','-',name,'ok' if re.search(r'\{',body) else 'empty'))
rows.sort(key=lambda r:(r[0],r[1]))
open(out+'/index.tsv','w').write('segment\taddress\tsize\troutine\tc\n'+''.join('\t'.join(r)+'\n' for r in rows))
import shutil; shutil.copy(src,out+'/all.c')
print('routines',len(rows))
