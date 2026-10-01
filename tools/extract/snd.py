import struct, wave
def decode(dat):
    fmt=struct.unpack('>H',dat[:2])[0]
    if fmt==1:
        nmod=struct.unpack('>H',dat[2:4])[0]; p=4+nmod*6
    else:
        p=4
    ncmd=struct.unpack('>H',dat[p:p+2])[0]; p+=2
    hdr=None
    for i in range(ncmd):
        cmd,p1,p2=struct.unpack('>HhI',dat[p:p+8]); p+=8
        if cmd&0x7FFF in (0x51,0x50): hdr=p2
    h=hdr
    samplePtr,lenOrCh,rate,ls,le,enc,bf=struct.unpack('>IIIIIBB',dat[h:h+22])
    rate=rate/65536
    if enc==0:
        pcm=dat[h+22:h+22+lenOrCh]; return dict(rate=rate,ch=1,bits=8,data=pcm,enc='std')
    if enc==0xFF:
        ch=lenOrCh; nframes=struct.unpack('>I',dat[h+22:h+26])[0]
        bits=struct.unpack('>H',dat[h+48:h+50])[0]
        start=h+64
        n=nframes*ch*bits//8
        return dict(rate=rate,ch=ch,bits=bits,data=dat[start:start+n],enc='ext')
    if enc==0xFE:
        ch=lenOrCh; nframes=struct.unpack('>I',dat[h+22:h+26])[0]
        fmt4=dat[h+40:h+44]
        return dict(rate=rate,ch=ch,bits=0,enc='cmp:'+fmt4.decode('latin1'),nframes=nframes,data=dat[h+64:])
    return dict(enc='?%d'%enc)
