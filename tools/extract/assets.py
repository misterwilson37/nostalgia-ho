import json,base64,io,os,subprocess
from PIL import Image
import numpy as np
from collections import deque
I='out/img/'
sheet=Image.open(I+'10000.png').convert('RGBA')
def floodwhite(im,thr=235):
    a=np.array(im);h,w=a.shape[:2]
    white=(a[:,:,0]>=thr)&(a[:,:,1]>=thr)&(a[:,:,2]>=thr)
    seen=np.zeros((h,w),bool);q=deque()
    for x in range(w):
        for y in (0,h-1):
            if white[y,x]: q.append((y,x));seen[y,x]=True
    for y in range(h):
        for x in (0,w-1):
            if white[y,x] and not seen[y,x]: q.append((y,x));seen[y,x]=True
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and white[ny,nx] and not seen[ny,nx]:
                seen[ny,nx]=True;q.append((ny,nx))
    a[seen,3]=0
    return Image.fromarray(a)
def keywhite(im,thr=235):
    a=np.array(im);m=(a[:,:,0]>=thr)&(a[:,:,1]>=thr)&(a[:,:,2]>=thr);a[m,3]=0;return Image.fromarray(a)
def trim(im):
    bb=im.getbbox();return im.crop(bb) if bb else im
S={}
def put(k,im): S[k]=im
for k in range(7):
    put(f'planet{k}',floodwhite(sheet.crop((3,18+42*k,43,58+42*k))))
    put(f'mined{k}',floodwhite(sheet.crop((59,18+42*k,99,58+42*k))))
put('sun',floodwhite(sheet.crop((116,18,156,58))))
put('unknown',floodwhite(sheet.crop((158,18,198,58))))
put('soon',floodwhite(sheet.crop((158,60,198,100))))
put('battle',floodwhite(sheet.crop((158,102,198,142))))
# planet-shaped masks (one per size row), the ice-cap strip and the heat glow
for k in range(7):
    a=np.array(sheet.crop((20+82*k,528,60+82*k,568)).convert('L'));o=np.zeros((40,40,4),np.uint8);o[...,3]=np.where(a<128,255,0)
    put(f'pmask{k}',Image.fromarray(o))
put('icecap',sheet.crop((116,60,156,100)))
put('hot',sheet.crop((116,18,156,58)))
for k in range(5): put(f'metal{k}',keywhite(sheet.crop((6+42*k,335,46+42*k,375))))
def nomag(im):
    a=np.array(im);m=(a[:,:,0]>200)&(a[:,:,1]<90)&(a[:,:,2]>200);a[m,3]=0;return trim(Image.fromarray(a))
put('haloAlly',nomag(keywhite(sheet.crop((167,376,215,395)))))
put('haloSel',nomag(keywhite(sheet.crop((167,395,215,414)))))
put('tempbar',sheet.crop((101,17,111,80)))
cx=[215,266,317,368];cy=[11,64,116,168,219,270,322,373]
for r in range(8):
    for c in range(4):
        p=r+(8 if c>=2 else 0);v=c%2
        im=sheet.crop((cx[c]+3,cy[r]+4,cx[c]+50,cy[r]+47))
        put(f'bad{p}_{v}',keywhite(im,245))
for r in range(4):
    for c in range(2):
        put(f'white{r}_{c}',keywhite(sheet.crop((793+52*c,233+52*r,843+52*c,283+52*r)),245))
for bi,by in ((0,1),(4,448)):
    for row in range(4):
        for col in range(7):
            put(f'dot{bi}_{col}_{row}',keywhite(sheet.crop((802+13*col,by+13*row+(0 if by==1 else 0),813+13*col,by+11+13*row)),225))
# fixed: block offsets inside blocks (rows at 1,14,27,40)
ships=Image.open(I+'11000.png').convert('RGBA');mk=Image.open(I+'11001.png').convert('L').point(lambda v:255 if v<128 else 0)
ships.putalpha(mk)
put("ships",ships)  # whole sheet: the game builds ships from it (see js/ui.js shipPic)
R=[(0,45),(45,82),(82,125),(125,166)]
for r in range(4):
    for c in range(30):
        x=1+41*c;put(f'part{r}_{c}',ships.crop((x,R[r][0],x+41,R[r][1])))
big={'tanker':(1,166,66,208),'satellite':(67,166,137,221),'dread':(482,166,687,255),'colony':(1,222,63,284),'decoy':(70,255,268,313),
 'bio0':(1,322,119,358),'bio1':(716,167,873,220),'bio2':(692,227,890,277),'bio3':(714,279,891,338),'eyeship':(270,237,365,287),
 'crit0':(121,321,159,359),'crit1':(162,321,201,358),'crit2':(202,320,242,360),'crit3':(244,322,282,359),'debris':(900,166,1188,304)}
for k,b in big.items(): put(k,ships.crop(b))
# pictures
def pic(i,key,white=False):
    im=Image.open(f'{I}{i}.png').convert('RGBA')
    if white: im=keywhite(im,250)
    put(key,im)
for i in list(range(9000,9052)): pic(i,f'm{i}')
for i in (3000,3030,3040,6999,9400,9401,4902): pic(i,f'p{i}')
for i in range(7000,7018): pic(i,f't{i}')
for i in range(3550,3556): pic(i,f'g{i}')
# supernova frames: crop to union bbox of non-white
frames=[Image.open(f'{I}{i}.png').convert('RGB') for i in range(5000,5020)]
bb=None
for f in frames:
    a=np.array(f);m=~((a[:,:,0]>245)&(a[:,:,1]>245)&(a[:,:,2]>245));ys,xs=np.where(m)
    if len(xs):
        b=(xs.min(),ys.min(),xs.max()+1,ys.max()+1);bb=b if bb is None else (min(bb[0],b[0]),min(bb[1],b[1]),max(bb[2],b[2]),max(bb[3],b[3]))
print('nova bbox',bb)
for k,f in enumerate(frames): put(f'nova{k}',keywhite(f.crop(bb).convert('RGBA'),250))
for k,im in S.items(): im.save(f'build/sp/{k}.png')
print(len(S))
