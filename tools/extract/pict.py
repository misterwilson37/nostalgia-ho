import struct
from PIL import Image
# minimal PICT v2 decoder
OPLEN={0x0000:0,0x0001:None,0x001E:0,0x0011:2,0x0C00:24,0x001A:6,0x001B:6,0x001F:6,0x0003:2,0x0004:1,0x0005:2,0x0007:4,0x0008:2,0x000D:2,0x0009:8,0x000A:8,0x0002:8,0x0010:8,0x001D:6,0x001C:0,0x0020:8,0x0021:4,0x0022:6,0x0023:2,0x0030:8,0x0031:8,0x0032:8,0x0033:8,0x0034:8,0x0038:0,0x0039:0,0x003A:0,0x003B:0,0x003C:0,0x0050:8,0x0051:8,0x0058:0,0x00A0:2,0x0015:2,0x0016:2,0x002E:None,0x0017:0,0x0018:0,0x0019:0,0x0006:4,0x000B:4,0x000C:4,0x000E:4,0x000F:4,0x00FF:0,0x0040:8,0x0041:8,0x0042:8,0x0048:0,0x0060:12,0x0068:4}
def rd(d,p,fmt):
    n=struct.calcsize(fmt);return struct.unpack(fmt,d[p:p+n]),p+n
def unpackbits(d,p,rowBytes,pixelsize=8):
    if rowBytes<8:
        return d[p:p+rowBytes],p+rowBytes
    if rowBytes>250: (bc,),p=rd(d,p,'>H')
    else: bc=d[p];p+=1
    src=d[p:p+bc];p+=bc
    out=bytearray();i=0
    unit=2 if pixelsize==16 else 1
    while i<len(src):
        f=src[i];i+=1
        if f<128:
            n=(f+1)*unit;out+=src[i:i+n];i+=n
        elif f>128:
            n=257-f;out+=src[i:i+unit]*n;i+=unit
    return bytes(out),p
def readrect(d,p):
    (t,l,b,r),p=rd(d,p,'>hhhh');return (t,l,b,r),p
def decode(d):
    # d without 512 header
    p=2;(frame),p=readrect(d,p)
    ft,fl,fb,fr=frame
    canvas=None
    images=[]
    if d[p:p+2]==b'\x00\x11': pass
    while p<len(d)-1:
        if p%2: p+=1
        (op,),p=rd(d,p,'>H')
        if op==0x00FF: break
        if op in (0x0098,0x0099,0x0090,0x0091,0x009A,0x009B):
            direct=op in (0x009A,0x009B)
            if direct: p+=4
            (rb,),p=rd(d,p,'>H')
            ispix=rb&0x8000; rb&=0x3FFF
            bounds,p=readrect(d,p)
            if ispix:
                (pmV,packT,packS,hR,vR,pixT,pixS,cmpC,cmpS,planeB,pmT,pmR),p=rd(d,p,'>HHIIIHHHHIII')
            else:
                pixS=1;cmpC=1;cmpS=1;packT=0
            ctab=None
            if not direct:
                if ispix:
                    (seed,flags,size),p=rd(d,p,'>IHH')
                    ctab={}
                    for k in range(size+1):
                        (idx,r,g,b),p=rd(d,p,'>HHHH')
                        ctab[k if flags&0x8000 else idx]=(r>>8,g>>8,b>>8)
                else:
                    ctab={0:(255,255,255),1:(0,0,0)}
            src,p=readrect(d,p);dst,p=readrect(d,p);(mode,),p=rd(d,p,'>H')
            mask=None
            if op in (0x0099,0x0091,0x009B):
                (rl,),p=rd(d,p,'>H');p+=rl-2
            h=bounds[2]-bounds[0];w=bounds[3]-bounds[1]
            rows=[]
            for y in range(h):
                if rb<8 or (ispix and packT==1):
                    row=d[p:p+rb];p+=rb
                else:
                    row,p=unpackbits(d,p,rb,pixS if direct else 8)
                rows.append(row)
            im=Image.new('RGB',(w,h))
            px=im.load()
            for y,row in enumerate(rows):
                if direct:
                    if pixS==32:
                        if packT==4 or (packT==0 and rb>=8):
                            n=w
                            # component planes
                            if cmpC==4: a,r,g,b=row[0:n],row[n:2*n],row[2*n:3*n],row[3*n:4*n]
                            else: r,g,b=row[0:n],row[n:2*n],row[2*n:3*n]
                            for x in range(min(w,len(r))):
                                if x<len(b): px[x,y]=(r[x],g[x],b[x])
                        else:
                            for x in range(w):
                                px[x,y]=tuple(row[x*4+1:x*4+4])
                    elif pixS==16:
                        for x in range(w):
                            if 2*x+1<len(row):
                                v=(row[2*x]<<8)|row[2*x+1]
                                px[x,y]=(((v>>10)&31)*255//31,((v>>5)&31)*255//31,(v&31)*255//31)
                else:
                    bits=pixS
                    for x in range(w):
                        bi=x*bits;byte=row[bi//8] if bi//8<len(row) else 0
                        v=(byte>>(8-bits-(bi%8)))&((1<<bits)-1)
                        px[x,y]=ctab.get(v,(0,0,0))
            sl=src[1]-bounds[1];st=src[0]-bounds[0]
            im=im.crop((sl,st,sl+src[3]-src[1],st+src[2]-src[0]))
            images.append((dst,im))
            continue
        if op==0x8200:
            (ln,),p=rd(d,p,'>I');blk=d[p:p+ln];p+=ln
            j=blk.find(b'\xff\xd8')
            if j>=0:
                import io
                im=Image.open(io.BytesIO(blk[j:])).convert('RGB')
                # dest = frame
                images.append(((ft,fl,fb,fr),im))
            continue
        if op==0x00A1:
            p+=2;(ln,),p=rd(d,p,'>H');p+=ln;continue
        if op==0x0001:
            (ln,),p=rd(d,p,'>H');p+=ln-2;continue
        if op==0x002E or op==0x002C or op==0x002B or op==0x0029 or op==0x002A or op==0x0028:
            if op==0x0028: p+=4;p+=1+d[p];continue
            if op in (0x0029,0x002A): p+=1;p+=1+d[p];continue
            if op==0x002B: p+=2;p+=1+d[p];continue
            (ln,),p=rd(d,p,'>H');p+=ln;continue
        if op in (0x0070,0x0071,0x0072,0x0073,0x0074,0x0080,0x0081,0x0082,0x0083,0x0084):
            (ln,),p=rd(d,p,'>H');p+=ln-2;continue
        if op in OPLEN:
            p+=OPLEN[op];continue
        if op in (0x0024,0x0025,0x0026,0x0027,0x002F) or 0x0092<=op<=0x0097 or 0x009C<=op<=0x009F or 0x00A2<=op<=0x00AF:
            (ln,),p=rd(d,p,'>H');p+=ln;continue
        if 0x0100<=op<=0x7FFF:
            p+=(op>>8)*2;continue
        if 0x8000<=op<=0x80FF: continue
        if 0x8100<=op:
            (ln,),p=rd(d,p,'>I');p+=ln;continue
        raise ValueError('unknown op %04x at %d'%(op,p))
    if not images: return None
    T=min(x[0][0] for x in images);L=min(x[0][1] for x in images)
    B=max(x[0][2] for x in images);R=max(x[0][3] for x in images)
    if T>=ft and L>=fl and B<=fb and R<=fr: T,L,B,R=ft,fl,fb,fr
    canvas=Image.new('RGB',(R-L,B-T),(255,255,255))
    for (t,l,b,r),im in images:
        if (im.width,im.height)!=(r-l,b-t): im=im.resize((r-l,b-t))
        canvas.paste(im,(l-L,t-T))
    return canvas
