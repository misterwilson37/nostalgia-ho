import sys,struct
from unicorn import *
from unicorn.x86_const import *
d=open(sys.argv[1],'rb').read()
mz=struct.unpack('<14H',d[:28])
sig,lastpg,pages,nreloc,hdrpar,minalloc,maxalloc,ss,sp,csum,ip,cs,reloff,ovl=mz
hdr=hdrpar*16; size=(pages-1)*512+(lastpg or 512)
img=d[hdr:size]
LOAD=0x1000
mu=Uc(UC_ARCH_X86,UC_MODE_16)
mu.mem_map(0,0x100000)
mu.mem_write(LOAD*16,img)
for i in range(nreloc):
    o,s=struct.unpack('<HH',d[reloff+4*i:reloff+4*i+4]); a=(LOAD+s)*16+o
    v=struct.unpack('<H',bytes(mu.mem_read(a,2)))[0]; mu.mem_write(a,struct.pack('<H',(v+LOAD)&0xffff))
psp=LOAD-0x10
mu.mem_write(psp*16,b'\xcd\x20'+b'\0'*0xfe)
mu.mem_write(psp*16+2,struct.pack('<H',0x9fc0))
mu.reg_write(UC_X86_REG_DS,psp);mu.reg_write(UC_X86_REG_ES,psp)
mu.reg_write(UC_X86_REG_SS,LOAD+ss);mu.reg_write(UC_X86_REG_SP,sp)
mu.reg_write(UC_X86_REG_CS,LOAD+cs)
# IVT: point int vectors to a halt stub at F000:0
mu.mem_write(0xf0000,b'\xcf')
for i in range(256): mu.mem_write(i*4,struct.pack('<HH',0,0xf000))
stop={'x':False}
def intr(uc,no,ud):
    ah=(uc.reg_read(UC_X86_REG_AX)>>8)&0xff
    if no==0x21 and ah==0x30: stop['x']=True; uc.emu_stop(); return
    if no==0x21 and ah==0x4a: pass
mu.hook_add(UC_HOOK_INTR,intr)
try: mu.emu_start(((LOAD+cs)*16+ip),-1,count=50000000)
except UcError as e: print('err',e, hex(mu.reg_read(UC_X86_REG_IP)))
print('stopped at',hex(mu.reg_read(UC_X86_REG_CS)),hex(mu.reg_read(UC_X86_REG_IP)),stop)
print('SS:SP',hex(mu.reg_read(UC_X86_REG_SS)),hex(mu.reg_read(UC_X86_REG_SP)),'DS',hex(mu.reg_read(UC_X86_REG_DS)))
mem=bytes(mu.mem_read(LOAD*16,0x90000-LOAD*16+0x10000-0x10000))
open('unpacked.bin','wb').write(mem[:0x90000-0x10000])
