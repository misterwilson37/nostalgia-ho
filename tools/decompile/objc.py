#!/usr/bin/env python3 -I
"""List the Objective-C methods of an arm64 Mach-O: addr<TAB>-[Class sel] or +[Class sel] (<TAB>types)."""
import struct,sys
d=open(sys.argv[1],'rb').read()
ncmds=struct.unpack_from('<I',d,16)[0]; off=32; segs=[]; sects={}
for _ in range(ncmds):
    cmd,sz=struct.unpack_from('<II',d,off)
    if cmd==0x19:
        name=d[off+8:off+24].rstrip(b'\0').decode(); vm,vs,fo,fs=struct.unpack_from('<QQQQ',d,off+24); nsec=struct.unpack_from('<I',d,off+64)[0]
        segs.append((vm,vs,fo,fs))
        so=off+72
        for i in range(nsec):
            sn=d[so:so+16].rstrip(b'\0').decode(); a,s,fo2=struct.unpack_from('<QQI',d,so+32); sects[sn]=(a,s,fo2); so+=80
    off+=sz
def f(a):
    for vm,vs,fo,fs in segs:
        if vm<=a<vm+vs: return fo+a-vm
    return None
def u64(a): o=f(a); return struct.unpack_from('<Q',d,o)[0]
def u32(a): o=f(a); return struct.unpack_from('<I',d,o)[0]
def cstr(a):
    o=f(a)
    if o is None: return '?'
    e=d.index(b'\0',o); return d[o:e].decode('latin1')
MASK=0x0000000fffffffff
def cls_name(c):
    ro=u64(c+32)&~7&MASK; return cstr(u64(ro+24)&MASK)
out=[]
def methods(ml,prefix,cn):
    ml&=MASK
    if not ml: return
    cnt=u32(ml+4)
    for i in range(cnt):
        e=ml+8+i*24
        sel=cstr(u64(e)&MASK); ty=cstr(u64(e+8)&MASK); imp=u64(e+16)&MASK
        out.append((imp,'%s[%s %s]'%(prefix,cn,sel),ty))
a,s,_=sects['__objc_classlist']
for i in range(s//8):
    c=u64(a+i*8)&MASK; ro=u64(c+32)&~7&MASK; cn=cstr(u64(ro+24)&MASK)
    methods(u64(ro+32),'-',cn)
    meta=u64(c)&MASK; mro=u64(meta+32)&~7&MASK
    methods(u64(mro+32),'+',cn)
if '__objc_catlist' in sects:
    a,s,_=sects['__objc_catlist']
    for i in range(s//8):
        c=u64(a+i*8)&MASK; nm=cstr(u64(c)&MASK); cl=u64(c+8)&MASK
        cn=cls_name(cl) if cl else '?'
        methods(u64(c+16),'-',cn+'('+nm+')'); methods(u64(c+24),'+',cn+'('+nm+')')
for imp,n,t in sorted(out): print('%x\t%s\t%s'%(imp,n,t))
