# Windows 3.1 2.0: the display audit (November 2026, begun)

*The same game as DOS 2.0 and Mac 2.0.1 (`docs/dos-findings.md`); this is what WINHO.EXE puts in front of the player.*

## The program (private repo: `extracted/win-2.0`, `win-2.0-floppy`, `win-2.x-patch`; `decompiled/win-2.0`, `win-2.0-floppy`, `win-2.x-patched`)

Three builds of WINHO.EXE (16-bit Windows NE, 39 segments, Borland C++ 1991, "Spaceward Ho! Version 2.0 for Windows (C) 1991,1992 Delta Tao Software", credit line
"Version 2.0.1 by Peter Commons"):
- **the SpcHo3x collection's** (544,256 bytes, `ee1cf06d...`): the build `docs/coverage-20.md` names routines in (`FUN_1010_1ce7`) and the one the 1993 patch applies to; this is the one audited;
- **the 1992 floppy's** (542,720 bytes, 4 Nov 1992, `ceea6493...`, archive.org `Spaceward_Ho_1992_v2.0_Win3.1_1.2M` and the New World Computing copy of it): another build; about 80 of 750 routines differ from the collection's;
- **the 1993 "2.x Patch for Win3.1"** (RTPatch 1.11, 14 Jul 1993, applied to the collection's build in DOSBox: 55 regions, 12,705 bytes; 57 routines differ).
Dialogs, menus and strings (316 + 55 + 546 lines in words, `extracted/*/resources/`, made by `tools/extract/windlg.py`) are identical in the three. The archive.org DOS disk and the
`Spaceward_Ho_1992.zip` install tree hold the one DOSHO.EXE (`5d230351...`); no other DOS build.

## The table

`docs/display/win20.json` (`node tools/display-audit.js win20`): one row for every one of the 750 routines (198 are the Windows API import thunks of segment 15c0; made by
`audit/win-2.0/tools/gen_win20.py` in the private repo): 646 internal (no GDI, USER, dialog, menu, sound or help call in the routine itself), **104 open** (they call the display API; each row names
the calls and the Mac 2.0.1 namesake of `docs/coverage-20.md` with its mac201 status).

## Which skin shows it

The remake has one 2.0 skin for DOS and Windows 3.1: `dos` (`js/skins/dos`), with the OS looks `dos` and `win31` (`js/os/win31.css`). It is built from the DOS program's pictures and screens; the
Windows build's own windows (its DIALOG templates: `resources/dialogs.txt`) were not rebuilt. So today the Windows look is the DOS skin's screens in a Windows 3.1 frame: every open row is a window or
control to read from the dialog template and the decompile and build.
