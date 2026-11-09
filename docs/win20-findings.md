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

## The Windows dialogs (WINHO.EXE, 33 DIALOG templates; width x height in dialog units)

None is built in the `dos` skin yet; the skin shows the DOS program's screens in the win31 frame. `extracted/win-2.0/resources/dialogs.txt` (private) has every control.

| # | Title | Size | Controls | Some words |
|---|---|---|---|---|
| 1 | About Spaceward Ho! | 192 x 156 | 3 | Text; Licensed to: |
| 2 | Spaceward Ho! | 215 x 83 | 6 |  |
| 3 | (none) | 129 x 134 | 3 | Text; OK |
| 4 | (none) | 205 x 64 | 5 | Text; Text; Text; Text |
| 5 | (none) | 142 x 92 | 4 | Text; Text; Text; Text |
| 6 | (none) | 182 x 130 | 9 | Auto Play:; Have computer play for me.; Just mark me done every turn.; 15; Seconds |
| 7 | (none) | 223 x 179 | 2 | Skip |
| 8 | (none) | 134 x 87 | 6 | Battle Speed:; Fast; Slow; OK |
| 9 | (none) | 258 x 160 | 13 | Shipbuilding queue at:; Planet Name; Available Types; $0; 0% Done |
| 10 | (none) | 267 x 159 | 5 | Show Skills; OK |
| 11 | Create New Galaxy | 246 x 130 | 28 | Cancel; Create; 00; Galaxy Density:; Galaxy Style: |
| 12 | (none) | 212 x 147 | 10 | *.*; OK; Cancel; Select file:; &Directories |
| 13 | GameInfo | 196 x 148 | 5 | OK; Text; Human Players: |
| 14 | Spaceward Ho! License | 201 x 136 | 12 | Yes; No; No, but I will; Cancel; OK |
| 15 | Spaceward Ho! | 283 x 170 | 4 | List of All Fleets:; Go To Fleet; OK |
| 16 | Spaceward Ho! | 226 x 170 | 5 | OK; Computer Intelligence:; Text |
| 17 | Spaceward Ho! | 283 x 170 | 4 | List of All Explored Stars:; Go To Star; OK |
| 18 | (none) | 136 x 48 | 1 |  |
| 19 | (none) | 138 x 129 | 5 | New Star Name:; OK |
| 20 | (none) | 143 x 78 | 5 | Name It; Cancel; OK |
| 21 | Spaceward Ho! New Player Registration | 224 x 104 | 16 | Your Name:; User Name; Password:; User Password; Skill Level: |
| 22 | (none) | 255 x 143 | 29 | Name of New Ship Type:; Range:; 0 / 0; Speed:; 0 / 0 |
| 23 | (none) | 113 x 23 | 1 | Text |
| 24 | (none) | 223 x 151 | 6 | Group All; Divide All; Cancel; OK |
| 25 | Spaceward Ho! Player Entry | 143 x 106 | 8 | Cancel; OK; Info...; Please Identify Yourself:; Player Password: |
| 26 | (none) | 137 x 104 | 8 | Polling Time:; Fast; Slow; 00; Seconds |
| 27 | Spaceward Ho! | 184 x 57 | 2 | Cancel Printing |
| 28 | Spaceward Ho! - What's the Password? | 204 x 127 | 5 | Continue; Exit Program |
| 29 | Reports | 145 x 35 | 1 |  |
| 30 | (none) | 211 x 146 | 32 | Cancel; Send; Send Message:; Content:; To: |
| 31 | (none) | 224 x 163 | 29 | Name:; Class:; Development Cost:; Production Cost:; Metal Cost: |
| 32 | Spaceward Ho! Startup | 152 x 189 | 8 | Open Game; New Game; Cancel; Text; Licensed to: |
| 33 | Spaceward Ho! Status | 164 x 35 | 3 | Working... |
