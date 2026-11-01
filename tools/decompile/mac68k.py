#!/usr/bin/env python3
"""Turn a classic 68k Mac application's CODE resources into a raw binary Ghidra can load.

Usage: python3 tools/decompile/mac68k.py <app.rsrc> <out.bin>
Writes <out.bin> and <out.bin>.syms, which tools/decompile/Mac68k.java reads.
See docs/decompiling.md.

Layout:
  - CODE n (with its 4-byte header) sits at n * 0x10000; its code starts at +4.
  - The A5 jump table is turned into stubs at low memory: the entry that
    `JSR d(A5)` reaches is at address d and holds `JMP target.l`.
  - `JSR/JMP/PEA/LEA d(A5)` with d > 0 (jump-table references) are rewritten to the
    absolute-short form `... d.w`, so cross-segment calls resolve to those stubs.
  - A-line traps (Toolbox/OS calls, which Ghidra's 68020 can't decode) become
    `TRAP #0`; the .syms file lists each one so the Ghidra script can make it a call
    to a stub function named after the trap.
  - Function names come from the MacsBug symbols MPW leaves after each routine.
  A5-relative globals (d < 0) are left alone; the Ghidra script sets A5 to A5BASE.
"""
import os, struct, sys
import capstone
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'extract'))
import rsrc

A5BASE = 0x00F00000
TRAPS = {  # a few traps worth naming when reading game logic; others are named Trap_Axxx
    0xA9EB: 'FP68K', 0xA9EC: 'Elems68K', 0xA9EE: 'Pack7', 0xA861: 'Random', 0xA02E: 'BlockMove',
    0xA01E: 'NewPtr', 0xA01F: 'DisposPtr', 0xA022: 'NewHandle', 0xA023: 'DisposHandle', 0xA024: 'SetHandleSize',
    0xA025: 'GetHandleSize', 0xA029: 'HLock', 0xA02A: 'HUnlock', 0xA064: 'MoveHHi', 0xA9A0: 'GetResource',
    0xA9A3: 'ReleaseResource', 0xA975: 'TickCount', 0xA873: 'SetPort', 0xA874: 'GetPort', 0xA884: 'DrawString',
    0xA891: 'LineTo', 0xA893: 'MoveTo', 0xA8A1: 'FrameRect', 0xA8A2: 'PaintRect', 0xA8A3: 'EraseRect',
}

# More Toolbox traps, named from Inside Macintosh (Traps.h numbering). The first version of this
# table had LineTo and MoveTo the wrong way round (A893 is MoveTo, A891 LineTo).
_MORE = '''
A850 InitCursor A851 SetCursor A852 HideCursor A853 ShowCursor A855 ShieldCursor A856 ObscureCursor
A860 WaitNextEvent A862 ForeColor A863 BackColor A870 LocalToGlobal A871 GlobalToLocal A878 SetOrigin
A879 SetClip A87A GetClip A87B ClipRect A87C BackPat A883 DrawChar A885 DrawText A886 TextWidth
A887 TextFont A888 TextFace A889 TextMode A88A TextSize A88B GetFontInfo A88C StringWidth A88D CharWidth
A890 StdLine A892 Line A894 Move A896 HidePen A897 ShowPen A898 GetPenState A899 SetPenState A89A GetPen
A89B PenSize A89C PenMode A89D PenPat A89E PenNormal A8A0 StdRect A8A4 InvertRect A8A5 FillRect
A8A6 EqualRect A8A7 SetRect A8A8 OffsetRect A8A9 InsetRect A8AA SectRect A8AB UnionRect A8AC Pt2Rect
A8AD PtInRect A8AE EmptyRect A8B0 FrameRoundRect A8B1 PaintRoundRect A8B2 EraseRoundRect A8B3 InvertRoundRect
A8B4 FillRoundRect A8B7 FrameOval A8B8 PaintOval A8B9 EraseOval A8BA InvertOval A8BB FillOval
A8BE FrameArc A8BF PaintArc A8C6 FramePoly A8C7 PaintPoly A8CB OpenPoly A8CC ClosePoly A8CD KillPoly
A8D8 NewRgn A8D9 DisposeRgn A8DA OpenRgn A8DB CloseRgn A8DC CopyRgn A8DD SetEmptyRgn A8DE SetRectRgn
A8DF RectRgn A8E0 OffsetRgn A8E1 InsetRgn A8E2 EmptyRgn A8E3 EqualRgn A8E4 SectRgn A8E5 UnionRgn
A8E6 DiffRgn A8E7 XorRgn A8E8 PtInRgn A8E9 RectInRgn A8EC CopyBits A8EF ScrollRect A8F3 OpenPicture
A8F4 ClosePicture A8F5 KillPicture A8F6 DrawPicture
A8D1 StdRgn A8D2 FrameRgn A8D3 PaintRgn A8D4 EraseRgn A8D5 InvertRgn A8D6 FillRgn
A904 DrawGrowIcon A906 NewString A908 ShowHide A909 CalcVis A910 GetWMgrPort A911 CheckUpdate A912 InitWindows
A913 NewWindow A914 DisposeWindow A915 ShowWindow A916 HideWindow A917 GetWRefCon A918 SetWRefCon
A919 GetWTitle A91A SetWTitle A91B MoveWindow A91C HiliteWindow A91D SizeWindow A91E TrackGoAway
A91F SelectWindow A920 BringToFront A921 SendBehind A922 BeginUpdate A923 EndUpdate A924 FrontWindow
A925 DragWindow A927 InvalRgn A928 InvalRect A929 ValidRgn A92A ValidRect A92B GrowWindow A92C FindWindow
A92D CloseWindow A930 InitMenus A931 NewMenu A932 DisposeMenu A933 AppendMenu A934 ClearMenuBar
A935 InsertMenu A936 DeleteMenu A937 DrawMenuBar A938 HiliteMenu A939 EnableItem A93A DisableItem
A93B GetMenuBar A93C SetMenuBar A93D MenuSelect A93E MenuKey A945 CheckItem A946 GetItem A947 SetItem
A948 CalcMenuSize A949 GetMHandle A94C FlashMenuBar A94D AddResMenu A94E PinRect A950 CountMItems
A953 UpdateControls A954 NewControl A955 DisposeControl A956 KillControls A957 ShowControl A958 HideControl
A959 MoveControl A95A GetCRefCon A95B SetCRefCon A95C SizeControl A95D HiliteControl A95E GetCTitle
A95F SetCTitle A960 GetCtlValue A961 GetCtlMin A962 GetCtlMax A963 SetCtlValue A964 SetCtlMin A965 SetCtlMax
A966 TestControl A967 DragControl A968 TrackControl A969 DrawControls A96C FindControl A96D Draw1Control
A970 GetNextEvent A971 EventAvail A972 GetMouse A973 StillDown A974 Button A976 GetKeys A977 WaitMouseUp
A978 UpdtDialog A97B InitDialogs A97C GetNewDialog A97D NewDialog A97E SelIText A97F IsDialogEvent
A980 DialogSelect A981 DrawDialog A982 CloseDialog A983 DisposDialog A984 FindDItem A985 Alert
A986 StopAlert A987 NoteAlert A988 CautionAlert A98B ParamText A98C ErrorSound A98D GetDItem
A98E SetDItem A98F SetIText A990 GetIText A991 ModalDialog A997 OpenResFile A998 UseResFile
A999 UpdateResFile A99A CloseResFile A99B SetResLoad A99C CountResources A99D GetIndResource
A9A0 GetResource A9A1 GetNamedResource A9A2 LoadResource A9A5 SizeRsrc A9A6 GetResAttrs A9A7 SetResAttrs
A9AA ChangedResource A9AB AddResource A9AD RmveResource A9AF ResError A9B0 WriteResource A9B1 CreateResFile
A9B8 GetPattern A9B9 GetCursor A9BA GetString A9BB GetIcon A9BC GetPicture A9BD GetNewWindow
A9BE GetNewControl A9BF GetMenu A9C0 GetNewMBar A9C8 SysBeep A9C9 SysError A994 CurResFile
A9E0 Munger A9E1 HandToHand A9E3 PtrToHand A9E4 HandAndHand A9E7 Pack0_ListMgr A9E9 Pack2_DiskInit A9EA Pack3_StdFile
A81F Get1Resource A820 Get1NamedResource A827 HideDItem A828 ShowDItem A83A ZoomWindow A83B TrackBox
AA14 RGBForeColor AA15 RGBBackColor AA18 GetCTable AA29 GetNextDevice AA2A GetMainDevice AA27 GetMaxDevice
AA45 NewCWindow AA46 GetNewCWindow
A049 HPurge A04A HNoPurge A85F BitClr A86E InitGraf A03C CompareString A01C FreeMem A01D MaxMem
A9A4 HomeResFile A9B3 SystemClick A9B6 OpenDeskAcc A9B7 CloseDeskAcc A9C1 UniqueID A9C2 SystemEdit
A9C4 OpenRFPerm A9CC TEInit A8D0 UnpackBits A8EA SetStdProcs A8EB StdBits
'''
for _p in _MORE.split():
    pass
_t = _MORE.split()
for _i in range(0, len(_t), 2):
    TRAPS.setdefault(int(_t[_i], 16), _t[_i + 1])
TRAPS.update({
    # OS traps (word with the flag bits stripped)
    0xA000: 'Open', 0xA001: 'Close', 0xA002: 'Read', 0xA003: 'Write', 0xA004: 'Control', 0xA005: 'Status',
    0xA007: 'GetVolInfo', 0xA008: 'Create', 0xA009: 'Delete', 0xA00A: 'OpenRF', 0xA00B: 'Rename',
    0xA00C: 'GetFileInfo', 0xA00D: 'SetFileInfo', 0xA011: 'GetEOF', 0xA012: 'SetEOF', 0xA013: 'FlushVol',
    0xA014: 'GetVol', 0xA015: 'SetVol', 0xA018: 'GetFPos', 0xA032: 'FlushEvents', 0xA044: 'SetFPos',
})

_DIV = bytes.fromhex('41fa000a327c00024ef092fe')
RUNTIME = [
    (bytes.fromhex('2f00c0c120402001c2df'), 'LMUL'),
    (_DIV + bytes.fromhex('60064c4108014e75'), 'LDIV'),
    (_DIV + bytes.fromhex('60064c4100014e75'), 'ULDIV'),
    (_DIV + bytes.fromhex('60084c410801c3404e75'), 'LMOD'),
    (_DIV + bytes.fromhex('60084c410001c3404e75'), 'ULMOD'),
]


# SANE: FP68K and Elems68K take the operation code as the last word pushed, after
# one to three operand addresses. Each operation gets its own stub (with the right
# number of stack arguments), e.g. FP_MUL_dbl(op, src, dst) or EL_LN(op, x).
FP_OPS = {0x00: ('ADD', 2), 0x02: ('SUB', 2), 0x04: ('MUL', 2), 0x06: ('DIV', 2), 0x08: ('CMP', 2),
          0x0A: ('CPX', 2), 0x0C: ('REM', 2), 0x0E: ('Z2X', 2), 0x10: ('X2Z', 2), 0x12: ('SQRT', 1),
          0x14: ('RTI', 1), 0x16: ('TTI', 1), 0x18: ('SCALB', 2), 0x1A: ('LOGB', 1), 0x1C: ('CLASS', 2),
          0x01: ('SETENV', 1), 0x03: ('GETENV', 1), 0x09: ('D2B', 3), 0x0B: ('B2D', 3), 0x0D: ('NEG', 1),
          0x0F: ('ABS', 1), 0x11: ('CPYSGN', 2), 0x13: ('NEXT', 2), 0x15: ('SETXCP', 1), 0x17: ('PROCENTRY', 1),
          0x19: ('PROCEXIT', 1), 0x1B: ('TESTXCP', 1)}
FP_FMT = {0x0000: 'ext', 0x0800: 'dbl', 0x1000: 'sgl', 0x2000: 'int', 0x2800: 'lng', 0x3000: 'comp'}
EL_OPS = {0x00: ('LN', 1), 0x02: ('LOG2', 1), 0x04: ('LN1', 1), 0x06: ('LOG21', 1), 0x08: ('EXP', 1),
          0x0A: ('EXP2', 1), 0x0C: ('EXP1', 1), 0x0E: ('EXP21', 1), 0x10: ('XPWRI', 2), 0x12: ('XPWRY', 2),
          0x18: ('SIN', 1), 0x1A: ('COS', 1), 0x1C: ('TAN', 1), 0x1E: ('ATAN', 1), 0x20: ('RANDX', 1)}


def sane_name(w, op):
    if w & 0xF0FF == 0xA0EB or w & 0xFBFF == 0xA9EB:
        nm, n = FP_OPS.get(op & 0x1F, ('OP%02X' % (op & 0x1F), 2))
        return 'FP_%s_%s' % (nm, FP_FMT.get(op & 0x3800, 'f%x' % (op & 0x3800))), n
    nm, n = EL_OPS.get(op & 0xFF, ('OP%02X' % (op & 0xFF), 1))
    return 'EL_' + nm, n


def name_of(w):
    k = w & 0xFBFF if w & 0x0800 else w & 0xF0FF  # strip auto-pop / OS flag bits
    return TRAPS.get(k) or 'Trap_%04X' % k


def macsbug(code, p):
    """MacsBug symbol right after an RTS/RTD/JMP(A0) at p: returns (name, next function start) or None."""
    if p >= len(code):
        return None
    b = code[p]
    if b == 0x80:
        n = code[p + 1]; s = p + 2
    elif 0x81 <= b <= 0x9F:
        n = b - 0x80; s = p + 1
    else:
        return None
    nm = code[s:s + n]
    if len(nm) < n or not all(32 < c < 127 for c in nm):
        return None
    q = s + n
    q += q & 1
    if q + 2 > len(code):
        return None
    lits = struct.unpack('>H', code[q:q + 2])[0]
    return nm.decode(), q + 2 + lits


def main(src, out):
    R = rsrc.parse(src)
    c0 = R[('CODE', 0)][1]
    above, below, jtsize, jtoff = struct.unpack('>IIII', c0[:16])
    segs = sorted(i for (t, i) in R if t == 'CODE' and i > 0)
    img = bytearray((max(segs) + 1) * 0x10000)
    syms = ['a5 %x %x' % (A5BASE, below)]
    md = capstone.Cs(capstone.CS_ARCH_M68K, capstone.CS_MODE_BIG_ENDIAN | capstone.CS_MODE_M68K_020)
    # jump table -> stubs
    for k in range((len(c0) - 16) // 8):
        off, w1, seg, w2 = struct.unpack('>HHHH', c0[16 + 8 * k:24 + 8 * k])
        if w1 != 0x3F3C or w2 != 0xA9F0:
            continue
        stub = jtoff + 8 * k + 2
        tgt = seg * 0x10000 + 4 + off
        img[stub:stub + 6] = struct.pack('>HI', 0x4EF9, tgt)
        syms.append('jt %x %x' % (stub, tgt))
    for n in segs:
        name, data = R[('CODE', n)]
        base = n * 0x10000
        img[base:base + len(data)] = data
        code = bytearray(data[4:])
        cb = base + 4
        syms.append('seg %x %x %s' % (cb, len(code), name))
        starts = {0}
        p = 0
        while p < len(code) - 1:
            ins = next(md.disasm(bytes(code[p:p + 10]), p), None)
            if ins is None:
                p += 2; continue
            w = struct.unpack('>H', code[p:p + 2])[0]
            if ins.mnemonic == 'dc.w' and w >> 12 == 0xA:
                code[p:p + 2] = b'\x4e\x40'
                nm, nargs = name_of(w), 0
                if nm in ('FP68K', 'Elems68K') and p >= 4 and code[p - 4:p - 2] == b'\x3f\x3c':
                    nm, nargs = sane_name(w, struct.unpack('>H', code[p - 2:p])[0])
                syms.append('trap %x %04x %s %d' % (cb + p, w, nm, nargs))
            elif ins.size == 4:
                d = struct.unpack('>h', code[p + 2:p + 4])[0]
                if d > 0:
                    if w == 0x4EAD: code[p:p + 2] = b'\x4e\xb8'      # JSR d(A5) -> JSR d.w
                    elif w == 0x4EED: code[p:p + 2] = b'\x4e\xf8'    # JMP
                    elif w == 0x486D: code[p:p + 2] = b'\x48\x78'    # PEA
                    elif w & 0xF1FF == 0x41ED:                        # LEA d(A5),An
                        code[p:p + 2] = struct.pack('>H', (w & 0x0E00) | 0x41F8)
            if w in (0x4E75, 0x4ED0) or w == 0x4E74:
                end = p + (4 if w == 0x4E74 else 2)
                m = macsbug(code, end)
                if m:
                    syms.append('fn %x %s' % (cb + max(starts), m[0]))
                    starts.add(m[1])
                    p = m[1]; continue
            p += ins.size
        img[cb:cb + len(code)] = code
        # MPW's register-based long multiply/divide helpers (args in D0, D1; result in D0)
        for pat, nm in RUNTIME:
            q = code.find(pat)
            while q >= 0:
                syms.append('rt %x %s' % (cb + q, nm))
                q = code.find(pat, q + 2)
    open(out, 'wb').write(img)
    open(out + '.syms', 'w').write('\n'.join(syms) + '\n')
    print('segments', len(segs), 'functions', sum(1 for s in syms if s.startswith('fn')),
          'traps', sum(1 for s in syms if s.startswith('trap')))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
