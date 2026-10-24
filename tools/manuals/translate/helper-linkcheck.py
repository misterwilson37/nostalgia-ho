import os
ROOT=os.environ.get('HO_ROOT','.')+'/'
LANGC=os.environ.get('LANG_CODE','fr')
import glob,os,re,sys
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote
root=ROOT+'assets/manuals/'; m=sys.argv[1]
d=root+m+'/'; bad=[]; n=0; imgs=0
for f in sorted(glob.glob(d+'*.html')):
    s=BeautifulSoup(open(f,encoding='utf8',errors='replace').read(),'html.parser')
    for tag,attr in (('a','href'),('img','src'),('link','href'),('td','background'),('body','background')):
        for e in s.find_all(tag):
            u=e.get(attr)
            if not u or re.match(r'^(https?:|mailto:|#|data:|javascript:)',u): continue
            p=unquote(urlparse(u).path); n+=1
            if tag=='img': imgs+=1
            if not os.path.exists(os.path.normpath(os.path.join(d,p))): bad.append((os.path.basename(f),tag,u))
print(m,':',n,'local references,',imgs,'images,',len(bad),'broken'); [print('  ',b) for b in bad[:10]]
