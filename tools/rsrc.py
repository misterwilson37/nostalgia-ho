import struct
def parse(path):
    d=open(path,'rb').read()
    dataOff,mapOff,dataLen,mapLen=struct.unpack('>IIII',d[:16])
    m=d[mapOff:mapOff+mapLen]
    tlo,nlo=struct.unpack('>HH',m[24:28])
    cnt=struct.unpack('>H',m[tlo:tlo+2])[0]+1
    res={}
    for i in range(cnt):
        o=tlo+2+i*8
        t,num,ref=struct.unpack('>4sHH',m[o:o+8])
        t=t.decode('mac_roman')
        for j in range(num+1):
            ro=tlo+ref+j*12
            rid,nameoff,attrs_off=struct.unpack('>hHI',m[ro:ro+8])
            off=attrs_off&0xFFFFFF
            name=None
            if nameoff!=0xFFFF:
                p=nlo+nameoff; L=m[p]; name=m[p+1:p+1+L].decode('mac_roman')
            p=dataOff+off; L=struct.unpack('>I',d[p:p+4])[0]
            res[(t,rid)]=(name,d[p+4:p+4+L])
    return res
