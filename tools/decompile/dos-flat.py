# builds the flat real-mode memory image of DOSHO.EXE (English 2.0.1): resident image unpacked by unpk.py (segment 0x1000 at linear 0x10000), every overlay relocated
# (+0x1000 at each fixup) and loaded at its own segment from 0x9000, the INT 3F entry stubs patched to far jumps into the overlays.
import struct,sys,json
# usage: dos-flat.py <DOSHO.EXE> <out> [unpacked.bin]   (the third argument for the PKLITE-packed English build: made by dos-unpack.py; the German one is not packed)
exe=open(sys.argv[1],'rb').read(); out=sys.argv[2]
mz=struct.unpack('<14H',exe[:28]); size=(mz[2]-1)*512+(mz[1] or 512)
base=exe.find(b'FBOV',size-16)
if len(sys.argv)>3: res=open(sys.argv[3],'rb').read()
else:
    res=bytearray(exe[mz[4]*16:size])
    for i in range(mz[3]):
        o,sg=struct.unpack('<HH',exe[mz[12]+4*i:mz[12]+4*i+4]); a=sg*16+o
        res[a:a+2]=struct.pack('<H',(struct.unpack('<H',res[a:a+2])[0]+0x1000)&0xffff)
    res=bytes(res)
mem=bytearray(0x100000)
mem[0x10000:0x10000+len(res)]=res
def chain(seg):
    r=[]
    while mem[seg*16:seg*16+2]==b'\xcd\x3f':
        w=struct.unpack('<16H',mem[seg*16:seg*16+32]); r.append((seg,w)); seg+=(0x20+5*w[6]+15)//16
        if seg*16>=0x10000+len(res): break
    return r,seg
start=None
for sg in range(0x1000,0x1000+len(res)//16):
    if mem[sg*16:sg*16+2]==b'\xcd\x3f':
        r,e=chain(sg)
        if len(r)>=10 and r[0][1][4]>0: start=sg;break
print('stub chain from',hex(start))
seg=start; ovs=[]
while mem[(seg)*16:(seg)*16+2]==b'\xcd\x3f':
    o=seg*16; w=struct.unpack('<16H',mem[o:o+32]); n=w[6]
    ovs.append(dict(stub=seg,fo=w[2]|(w[3]<<16),cs=w[4],fx=w[5],n=n)); seg+=(0x20+5*n+15)//16
    if seg*16>=0x10000+len(res): break
cur=0x9000; entries=[]
for k,ov in enumerate(ovs):
    c0=base+ov['fo']+16
    code=bytearray(exe[c0:c0+ov['cs']]); fix=struct.unpack('<%dH'%(ov['fx']//2),exe[c0+ov['cs']:c0+ov['cs']+ov['fx']])
    for f in fix:
        v=struct.unpack('<H',code[f:f+2])[0]; code[f:f+2]=struct.pack('<H',(v+0x1000)&0xffff)
    ov['seg']=cur; mem[cur*16:cur*16+len(code)]=code
    p=ov['stub']*16+0x20
    for i in range(ov['n']):
        off=struct.unpack('<H',mem[p+2:p+4])[0]
        mem[p:p+5]=b'\xea'+struct.pack('<HH',off,cur); entries.append((k,i,cur,off,ov['stub'],(p-ov['stub']*16-0x20)//5)); p+=5
    ov['len']=len(code); cur+=(len(code)+15)//16+1
last=max(0x6000*16, cur*16)
open(out,'wb').write(bytes(mem[0x10000:cur*16]))
json.dump(dict(ds=seg,overlays=ovs,entries=entries,loadlinear=0x10000),open(out+'.json','w'))
print('data segment (end of the stubs)',hex(seg)); print(len(ovs),'overlays; flat image',hex(cur*16-0x10000),'bytes from linear 0x10000; last seg',hex(cur))
