#!/usr/bin/env python3
"""Turn a 68k Palm OS application (.prc, CodeWarrior multi-segment) into a raw binary
that Ghidra can load, with the same Ghidra script as the Mac version (Mac68k.java).

Usage: python3 tools/decompile/palm68k.py <app.prc> <out.bin>
Writes <out.bin> and <out.bin.syms>. See docs/decompiling.md ("Palm OS").

Layout:
  - 'code' n sits at n * 0x10000, header included (code 2+ start with a 12-byte header:
    jump-table offset, entry count, offset again, size), so jump-table targets, which
    are offsets from the start of the resource, land where they should.
  - 'data' 0 (the A5 world: the jump table and some globals) is unpacked around
    A5 = 0x00F00000, 'data' 1 (most globals, "expanded mode") around A4 = 0x00E80000.
    The jump table entries (JMP abs.l, below A5) are relocated to their segment, so
    `JSR d(A5)` reaches the target through a thunk. Other data relocations are not
    applied (pointers in initialised globals stay as offsets).
  - System traps (TRAP #15 + selector word) become `JSR stub.w`, with a named stub at
    0x1000 + 2 * (selector - 0xA000). FlpEmDispatch (soft float, selector in D2 from the
    `MOVEQ #n,D2` before it) gets a stub per operation at 0x3000 + 2n (Flp_d_mul, ...).
  - CodeWarrior's long multiply/divide helpers are named (LMUL, LDIV, ULDIV, LMOD, ULMOD).
  - CodeWarrior's far calls inside a segment (`PEA ret(PC); PEA 4(PC); ADDI.L #d,(SP);
    RTS`) become `JSR target.l` + NOPs, far jumps `JMP target.l` + NOPs.
There are no MacsBug names in Palm code, so Ghidra names functions FUN_<address>.
"""
import struct, sys

A5, A4 = 0x00F00000, 0x00E80000
TRAP_BASE, FLP_BASE = 0x1000, 0x3000
# Palm OS 5 SDK CoreTraps.h names of the traps Spaceward Ho! uses (others: Trap_Axxx)
TRAPS = {
    0xA00B: 'MemHeapFreeBytes', 0xA012: 'MemChunkFree', 0xA013: 'MemPtrNew', 0xA016: 'MemPtrSize',
    0xA01C: 'MemPtrResize', 0xA01E: 'MemHandleNew', 0xA021: 'MemHandleLock', 0xA022: 'MemHandleUnlock',
    0xA026: 'MemMove', 0xA027: 'MemSet', 0xA02B: 'MemHandleFree', 0xA02D: 'MemHandleSize',
    0xA033: 'MemHandleResize', 0xA035: 'MemPtrUnlock', 0xA041: 'DmCreateDatabase', 0xA042: 'DmDeleteDatabase',
    0xA045: 'DmFindDatabase', 0xA046: 'DmDatabaseInfo', 0xA047: 'DmSetDatabaseInfo', 0xA049: 'DmOpenDatabase',
    0xA04A: 'DmCloseDatabase', 0xA04E: 'DmGetLastErr', 0xA04F: 'DmNumRecords', 0xA050: 'DmRecordInfo',
    0xA051: 'DmSetRecordInfo', 0xA055: 'DmNewRecord', 0xA056: 'DmRemoveRecord', 0xA059: 'DmNewHandle',
    0xA05B: 'DmQueryRecord', 0xA05C: 'DmGetRecord', 0xA05E: 'DmReleaseRecord', 0xA05F: 'DmGetResource',
    0xA060: 'DmGet1Resource', 0xA061: 'DmReleaseResource', 0xA071: 'DmNumRecordsInCategory',
    0xA073: 'DmSeekRecordInCategory', 0xA076: 'DmWrite', 0xA078: 'DmGetNextDatabaseByTypeCreator',
    0xA07E: 'DmSet', 0xA084: 'ErrDisplayFileLineMsg', 0xA08F: 'SysAppStartup', 0xA090: 'SysAppExit',
    0xA093: 'SysGetTrapAddress', 0xA0A0: 'SysTaskDelay', 0xA0A7: 'SysUIAppSwitch', 0xA0A9: 'SysHandleEvent',
    0xA0AB: 'SysQSort', 0xA0AC: 'SysCurAppDatabase', 0xA0B8: 'SysLibRemove', 0xA0BA: 'SysLibFind',
    0xA0C1: 'SysFormPointerArrayToStrings', 0xA0C2: 'SysRandom', 0xA0C5: 'StrCopy', 0xA0C6: 'StrCat',
    0xA0C7: 'StrLen', 0xA0C8: 'StrCompare', 0xA0C9: 'StrIToA', 0xA0CA: 'StrCaselessCompare', 0xA0CC: 'StrChr',
    0xA0CD: 'StrStr', 0xA0CE: 'StrAToI', 0xA0CF: 'StrToLower', 0xA0F5: 'TimGetSeconds', 0xA0F7: 'TimGetTicks',
    0xA0FC: 'TimSecondsToDateTime', 0xA10F: 'CtlHideControl', 0xA110: 'CtlShowControl', 0xA111: 'CtlGetValue',
    0xA113: 'CtlGetLabel', 0xA114: 'CtlSetLabel', 0xA116: 'CtlHitControl', 0xA117: 'CtlSetEnabled',
    0xA11B: 'EvtAddEventToQueue', 0xA11D: 'EvtGetEvent', 0xA11E: 'EvtGetPen', 0xA135: 'FldDrawField',
    0xA139: 'FldGetTextPtr', 0xA141: 'FldSetFont', 0xA142: 'FldSetSelection', 0xA14B: 'FldGetTextLength',
    0xA14F: 'FldGetAttributes', 0xA150: 'FldSetAttributes', 0xA153: 'FldGetTextHandle', 0xA158: 'FldSetTextHandle',
    0xA164: 'FntSetFont', 0xA167: 'FntCharHeight', 0xA168: 'FntLineHeight', 0xA16B: 'FntCharsWidth',
    0xA16D: 'FntCharsInWidth', 0xA16E: 'FntLineWidth', 0xA16F: 'FrmInitForm', 0xA170: 'FrmDeleteForm',
    0xA171: 'FrmDrawForm', 0xA172: 'FrmEraseForm', 0xA173: 'FrmGetActiveForm', 0xA174: 'FrmSetActiveForm',
    0xA175: 'FrmGetActiveFormID', 0xA179: 'FrmSetFocus', 0xA17B: 'FrmGetFormBounds', 0xA17C: 'FrmGetWindowHandle',
    0xA180: 'FrmGetObjectIndex', 0xA181: 'FrmGetObjectId', 0xA182: 'FrmGetObjectType', 0xA183: 'FrmGetObjectPtr',
    0xA184: 'FrmHideObject', 0xA185: 'FrmShowObject', 0xA187: 'FrmSetObjectPosition', 0xA189: 'FrmSetControlValue',
    0xA18A: 'FrmGetControlGroupSelection', 0xA18B: 'FrmSetControlGroupSelection', 0xA191: 'FrmSetTitle',
    0xA192: 'FrmAlert', 0xA193: 'FrmDoDialog', 0xA194: 'FrmCustomAlert', 0xA195: 'FrmHelp', 0xA198: 'FrmVisible',
    0xA199: 'FrmGetObjectBounds', 0xA19B: 'FrmGotoForm', 0xA19D: 'FrmUpdateForm', 0xA19F: 'FrmSetEventHandler',
    0xA1A0: 'FrmDispatchEvent', 0xA1A1: 'FrmCloseAllForms', 0xA1B0: 'LstSetDrawFunction', 0xA1B1: 'LstDrawList',
    0xA1B2: 'LstEraseList', 0xA1B3: 'LstGetSelection', 0xA1B4: 'LstGetSelectionText', 0xA1B6: 'LstSetHeight',
    0xA1B7: 'LstSetSelection', 0xA1B8: 'LstSetListChoices', 0xA1B9: 'LstMakeItemVisible',
    0xA1BA: 'LstGetNumberOfItems', 0xA1BF: 'MenuHandleEvent', 0xA1C1: 'MenuEraseStatus',
    0xA1C6: 'RctInsetRectangle', 0xA1C8: 'RctPtInRectangle', 0xA1CF: 'TblGetItemInt',
    0xA1F7: 'WinCreateOffscreenWindow', 0xA1F8: 'WinDeleteWindow', 0xA1FD: 'WinSetDrawWindow',
    0xA1FF: 'WinGetActiveWindow', 0xA206: 'WinEraseWindow', 0xA209: 'WinCopyRectangle', 0xA20F: 'WinGetClip',
    0xA210: 'WinSetClip', 0xA211: 'WinResetClip', 0xA213: 'WinDrawLine', 0xA215: 'WinEraseLine',
    0xA216: 'WinInvertLine', 0xA218: 'WinDrawRectangle', 0xA219: 'WinEraseRectangle', 0xA21A: 'WinInvertRectangle',
    0xA21B: 'WinDrawRectangleFrame', 0xA220: 'WinDrawChars', 0xA225: 'WinSetUnderlineMode',
    0xA234: 'SndPlaySystemSound', 0xA259: 'Crc16CalcBlock', 0xA27B: 'FtrGet', 0xA2A9: 'DlkGetSyncInfo',
    0xA2AC: 'SysLibLoad', 0xA2B6: 'SclSetScrollBar', 0xA2CE: 'StrNCopy', 0xA2D2: 'PrefSetPreference',
    0xA2D3: 'PrefGetAppPreferences', 0xA2D4: 'PrefSetAppPreferences', 0xA2D7: 'MemCmp', 0xA2D9: 'FntWordWrap',
    0xA2DE: 'StrPrintF', 0xA2E7: 'SclGetScrollBar', 0xA2E9: 'SysTicksPerSecond', 0xA2F2: 'DmFindSortPosition',
    0xA2F5: 'SysStringByIndex', 0xA2FF: 'LstGetVisibleItems', 0xA303: 'FrmSetObjectBounds',
    0xA305: 'FlpDispatch', 0xA306: 'FlpEmDispatch', 0xA33C: 'SysGetAppInfo', 0xA33E: 'WinScreenMode',
    0xA351: 'WinDrawTruncChars', 0xA37E: 'WinPaintChar', 0xA37F: 'WinPaintChars', 0xA380: 'WinPaintBitmap',
    0xA382: 'WinPaintPixel', 0xA386: 'WinPaintPixels', 0xA388: 'WinPaintLine', 0xA389: 'WinPaintRectangle',
    0xA395: 'WinPushDrawState', 0xA396: 'WinPopDrawState', 0xA397: 'WinSetDrawMode', 0xA398: 'WinSetForeColor',
    0xA399: 'WinSetBackColor', 0xA39A: 'WinSetTextColor', 0xA39E: 'WinRGBToIndex', 0xA3CD: 'DateTemplateToAscii',
    0xA3DA: 'CtlGetSliderValues', 0xA3DB: 'CtlSetSliderValues', 0xA3EC: 'HighDensityDispatch',
    0xA3F4: 'AccessorDispatch', 0xA41B: 'LstGetTopItem',
}
# Prototypes for the common ones, "<return> <args>" (see the "sig" line in Mac68k.java):
# p pointer, l long, s short, b byte, d double, f float, v void
SIGS = {
    'MemPtrNew': 'p l', 'MemChunkFree': 's p', 'MemHandleNew': 'p l', 'MemHandleLock': 'p p',
    'MemHandleUnlock': 's p', 'MemMove': 's ppl', 'MemSet': 's plb', 'MemHandleFree': 's p', 'MemHandleSize': 'l p',
    'MemPtrSize': 'l p', 'MemPtrResize': 's pl', 'MemHandleResize': 's pl', 'MemPtrUnlock': 's p', 'MemCmp': 's ppl',
    'DmGetResource': 'p ls', 'DmGet1Resource': 'p ls', 'DmReleaseResource': 's p', 'DmWrite': 's plpl',
    'DmSet': 's pllb', 'DmQueryRecord': 'p ps', 'DmGetRecord': 'p ps', 'DmReleaseRecord': 's psb',
    'StrCopy': 'p pp', 'StrCat': 'p pp', 'StrLen': 's p', 'StrCompare': 's pp', 'StrIToA': 'p pl',
    'StrCaselessCompare': 's pp', 'StrChr': 'p ps', 'StrStr': 'p pp', 'StrAToI': 'l p', 'StrToLower': 'p pp',
    'StrNCopy': 'p pps', 'StrPrintF': 's pp', 'SysRandom': 's l', 'SysStringByIndex': 'p ssps',
    'SysTaskDelay': 's l', 'TimGetTicks': 'l ', 'TimGetSeconds': 'l ', 'SndPlaySystemSound': 'v b',
    'ErrDisplayFileLineMsg': 'v psp', 'FrmAlert': 's s', 'FrmCustomAlert': 's sppp', 'FrmGotoForm': 'v s',
    'FrmGetActiveForm': 'p ', 'FrmGetActiveFormID': 's ', 'FrmGetObjectIndex': 's ps', 'FrmGetObjectPtr': 'p ps',
    'FrmGetObjectId': 's ps', 'FrmSetControlValue': 'v pss', 'FrmUpdateForm': 'v ss', 'FrmHideObject': 'v ps',
    'FrmShowObject': 'v ps', 'FrmGetObjectBounds': 'v psp', 'FrmInitForm': 'p s', 'FrmDoDialog': 's p',
    'FrmDeleteForm': 'v p', 'FrmDrawForm': 'v p', 'FrmSetActiveForm': 'v p', 'FrmSetEventHandler': 'v pp',
    'FrmDispatchEvent': 'b p', 'FrmSetTitle': 'v pp', 'FrmHelp': 'v s', 'FrmGetControlGroupSelection': 's pb',
    'FrmSetControlGroupSelection': 'v pbs', 'FrmSetFocus': 'v ps', 'CtlGetValue': 's p', 'CtlSetLabel': 'v pp',
    'CtlGetLabel': 'p p', 'CtlSetEnabled': 'v pb', 'CtlGetSliderValues': 'v ppppp', 'CtlSetSliderValues': 'v ppppp',
    'LstSetSelection': 'v ps', 'LstGetSelection': 's p', 'LstSetListChoices': 'v pps',
    'LstGetSelectionText': 'p ps', 'LstSetHeight': 'v ps', 'LstDrawList': 'v p', 'LstGetNumberOfItems': 's p',
    'WinPaintBitmap': 'v pss', 'WinDrawChars': 'v psss', 'WinPaintChars': 'v psss', 'WinDrawLine': 'v ssss',
    'WinPaintLine': 'v ssss', 'WinDrawRectangle': 'v ps', 'WinEraseRectangle': 'v ps', 'WinPaintRectangle': 'v ps',
    'WinDrawRectangleFrame': 'v sp', 'WinSetForeColor': 'b b', 'WinSetBackColor': 'b b', 'WinSetTextColor': 'b b',
    'WinPaintPixel': 'v ss', 'WinRGBToIndex': 'b p', 'WinSetDrawMode': 'b b', 'WinSetClip': 'v p',
    'WinGetClip': 'v p', 'WinDrawTruncChars': 'v pssss', 'FntSetFont': 'b b', 'FntCharsWidth': 's ps',
    'FntLineHeight': 's ', 'FntCharHeight': 's ', 'FntLineWidth': 's ps', 'FntWordWrap': 's ps',
    'RctPtInRectangle': 'b ssp', 'EvtGetEvent': 'v pl', 'SysHandleEvent': 'b p', 'FldGetTextPtr': 'p p',
    'SclSetScrollBar': 'v pssss', 'SysQSort': 'v psspl', 'PrefGetAppPreferences': 's lsppb',
    'PrefSetAppPreferences': 'v lssplb',
}
FLPSIGS = {'d_itod': 'p pl', 'd_utod': 'p pl', 'd_dtoi': 'l d', 'd_dtou': 'l d', 'd_add': 'p pdd',
           'd_mul': 'p pdd', 'd_sub': 'p pdd', 'd_div': 'p pdd', 'd_neg': 'p pd', 'f_ftod': 'p pf',
           'd_dtof': 'f d', 'f_itof': 'f l', 'f_ftoi': 'l f', 'f_add': 'f ff', 'f_mul': 'f ff', 'f_sub': 'f ff',
           'f_div': 'f ff', 'fp_round': 'l l'}
FLPSIGS.update({'d_' + k: 'l dd' for k in ('cmp', 'cmpe', 'feq', 'fne', 'flt', 'fle', 'fgt', 'fge', 'fun', 'for')})
FLPSIGS.update({'f_' + k: 'l ff' for k in ('cmp', 'cmpe', 'feq', 'fne', 'flt', 'fle', 'fgt', 'fge', 'fun', 'for')})
# FloatMgr.h sysFloatEm_* selectors (FlpEmDispatch, selector in D2)
FLP = ('fp_round fp_get_fpscr fp_set_fpscr f_utof f_itof f_ulltof f_lltof d_utod d_itod d_ulltod d_lltod '
       'f_ftod d_dtof f_ftoq f_qtof d_dtoq d_qtod f_ftou f_ftoi f_ftoull f_ftoll d_dtou d_dtoi d_dtoull d_dtoll '
       'f_cmp f_cmpe f_feq f_fne f_flt f_fle f_fgt f_fge f_fun f_for d_cmp d_cmpe d_feq d_fne d_flt d_fle d_fgt '
       'd_fge d_fun d_for f_neg f_add f_mul f_sub f_div d_neg d_add d_mul d_sub d_div').split()


# CodeWarrior's long multiply/divide helpers (arguments in D0, D1; result in D0). The signed
# divide and modulo end in a branch to the unsigned ones, which names those too.
RUNTIME = [(bytes.fromhex('48e7300024004842c4c126014843c6c0'), 'LMUL', None),
           (bytes.fromhex('4a806c0c44804a816c1044814efa'), 'LDIV', (14, 'ULDIV')),
           (bytes.fromhex('4a816c0244814a806d044efa'), 'LMOD', (12, 'ULMOD'))]


def parse_prc(fn):
    d = open(fn, 'rb').read()
    n = struct.unpack('>H', d[76:78])[0]
    ents = [struct.unpack('>4sHI', d[78 + 10 * i:88 + 10 * i]) for i in range(n)]
    res = {}
    for i, (t, rid, off) in enumerate(ents):
        end = ents[i + 1][2] if i + 1 < n else len(d)
        res[(t.decode('latin1'), rid)] = d[off:end]
    return res


def unpack(d, p):
    """CodeWarrior's packed global data: one block, ended by a 0 byte."""
    out = bytearray()
    while True:
        b = d[p]; p += 1
        if b == 0: return out, p
        if b & 0x80: n = (b & 0x7F) + 1; out += d[p:p + n]; p += n
        elif b & 0x40: out += bytes((b & 0x3F) + 1)
        elif b & 0x20: out += bytes([d[p]]) * ((b & 0x1F) + 2); p += 1
        elif b & 0x10: out += b'\xff' * ((b & 0x0F) + 1)
        elif b == 1: out += b'\0\0\0\0\xff\xff' + d[p:p + 2]; p += 2
        elif b == 2: out += b'\0\0\0\0\xff' + d[p:p + 3]; p += 3
        elif b == 3: out += b'\xa9\xf0\0\0' + d[p:p + 2] + b'\0' + d[p + 2:p + 3]; p += 3
        elif b == 4: out += b'\xa9\xf0\0' + d[p:p + 3] + b'\0' + d[p + 3:p + 4]; p += 4
        else: raise ValueError('bad data opcode %02x' % b)


def load_data(img, d, p, base):
    """Three blocks (A-register offset + packed bytes) from p, placed around base."""
    for _ in range(3):
        off = struct.unpack('>i', d[p:p + 4])[0]; p += 4
        blk, p = unpack(d, p)
        img[base + off:base + off + len(blk)] = blk


def main(src, out):
    R = parse_prc(src)
    segs = sorted(i for (t, i) in R if t == 'code' and i > 0)
    img = bytearray(A5 + 0x10000)
    syms = ['const A5 %x' % A5, 'const A4 %x' % A4]
    load_data(img, R[('data', 0)], 4, A5)
    if ('data', 1) in R:
        load_data(img, R[('data', 1)], 8, A4)
    # jump table: segment n's entries are listed in its header; the rest belong to code 1
    owner = {}
    lo = 0
    for n in segs:
        c = R[('code', n)]
        if n > 1:
            jo, cnt = struct.unpack('>hH', c[:4])
            lo = min(lo, jo)
            for k in range(cnt): owner[jo + 6 * k] = n
    k = lo - 6
    while struct.unpack('>H', img[A5 + k:A5 + k + 2])[0] == 0x4EF9:
        owner[k] = 1; k -= 6
    for e, n in sorted(owner.items()):
        a = A5 + e
        tgt = struct.unpack('>I', img[a + 2:a + 6])[0] + n * 0x10000
        img[a + 2:a + 6] = struct.pack('>I', tgt)
        syms.append('jt %x %x' % (a, tgt))
    used = set()
    for n in segs:
        c = bytearray(R[('code', n)])
        base = n * 0x10000
        p = 0 if n == 1 else 12
        while p < len(c) - 3:
            w = struct.unpack('>H', c[p:p + 2])[0]
            if w == 0x4E4F:  # TRAP #15, selector
                sel = struct.unpack('>H', c[p + 2:p + 4])[0]
                if sel == 0xA306 and c[p - 2] == 0x74:
                    stub = FLP_BASE + 2 * c[p - 1]
                    nm = 'Flp_' + (FLP[c[p - 1]] if c[p - 1] < len(FLP) else 'op%d' % c[p - 1])
                else:
                    stub = TRAP_BASE + 2 * (sel - 0xA000)
                    nm = TRAPS.get(sel, 'Trap_%04X' % sel)
                if 0 <= stub - TRAP_BASE < 0x3000:
                    c[p:p + 4] = struct.pack('>HH', 0x4EB8, stub)
                    used.add((stub, nm))
                p += 4; continue
            # far call/jump: [PEA ret(PC)] PEA 4(PC); ADDI.L #d,(SP); RTS
            if c[p:p + 6] == b'\x48\x7a\x00\x04\x06\x97' and c[p + 10:p + 12] == b'\x4e\x75':
                tgt = base + p + 6 + struct.unpack('>i', c[p + 6:p + 10])[0]
                call = p >= 4 and c[p - 4:p - 2] == b'\x48\x7a' and \
                    p - 2 + struct.unpack('>h', c[p - 2:p])[0] == p + 12
                if call:
                    c[p - 4:p + 12] = struct.pack('>HI', 0x4EB9, tgt) + b'\x4e\x71' * 5
                else:
                    c[p:p + 12] = struct.pack('>HI', 0x4EF9, tgt) + b'\x4e\x71' * 3
                p += 12; continue
            p += 2
        img[base:base + len(c)] = c
        for pat, nm, sub in RUNTIME:
            q = c.find(pat)
            while q >= 0:
                syms.append('rt %x %s' % (base + q, nm))
                if sub:
                    syms.append('rt %x %s' % (base + q + sub[0] + struct.unpack('>h', c[q + sub[0]:q + sub[0] + 2])[0], sub[1]))
                q = c.find(pat, q + 2)
        syms.append('seg %x %x code%d' % (base, len(c), n))
    for stub, nm in sorted(used):
        img[stub:stub + 2] = b'\x4e\x75'
        syms.append('fn %x %s' % (stub, nm))
        sig = FLPSIGS.get(nm[4:]) if nm.startswith('Flp_') else SIGS.get(nm)
        if sig: syms.append('sig %x %s' % (stub, sig))
    open(out, 'wb').write(img)
    open(out + '.syms', 'w').write('\n'.join(syms) + '\n')
    print('segments', len(segs), 'jump table', len(owner), 'traps', len(used))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
