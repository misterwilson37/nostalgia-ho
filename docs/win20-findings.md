# Windows 3.1 2.0: the display audit (November 2026, begun)

**Progress (Windows dialogs):** foundation done (emulator `emulators/dosbox-win31`, renderer `js/skins/dos/win31/`); built 2 of 33 (About, Battle Speed); next: chunk 1, Start (below, "The chunk plan").

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

Two are built (#1 About, #8 Battle Speed: "The Windows dialogs in the remake" below); the others show the DOS skin's windows in the win31 frame. `extracted/win-2.0/resources/dialogs.txt` (private) has every control.

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

## The Windows dialogs in the remake: the foundation (November 2026)

**What runs.** Windows 3.1 retail (Jake's six disks, Custom Setup) in DOSBox 0.74 (`machine=svga_s3`) on Xvfb `:78`, with the SpcHo3x collection's WINHO.EXE
(`ee1cf06d...`): private repo `emulators/dosbox-win31/` (`run.sh [vga|256]`, the `w31.py` driver; README there). Two displays, both 640 x 480:
**VGA, 16 colours** (Windows' own driver, what is in the box; the reference for the window chrome) and **256 colours** through the S3 864 driver 1.41B5 of
1995 from the collection's own `drivers/s3` (WINHO's README.TXT recommends "640x480 in the 256 color mode"; Windows 3.1 has no 256-colour driver for a card DOSBox
0.74 emulates, nothing was downloaded). In 256 colours the game's palette takes the system colours (active caption and modal frames pale blue), and the S3 driver
moves the cursor 0.41 px per mickey vertically (run.sh compensates). Captures: private `audit/win-2.0/captures/win20-orig-{vga16,s3-256}-*.png` (Startup,
New Galaxy, Player Entry, Registration, main window, Options menu, About, Battle Speed). The licence lines read "eXo / Win3x0" (the collection's THE_HO!.PRF).

**The templates' names.** WINHO.EXE's name table (RT_NAMETABLE) names the 33: 1 ABOUT, 2 ALERTBOX, 3 ALERT_CPIC, 4 ALERT_LLPIC, 5 ALERT_NOPIC, 6 AUTOPLAY,
7 BATTLE, 8 BATTLESPEED, 9 BLDSHIP, 10 COMPPLAYERS, 11 CREATEGALAXY, 12 FILEOPEN, 13 GAMEINFO, 14 LICENSEE, 15 LISTFLEETS, 16 LISTSKILLS, 17 LISTSTARS,
18 MODELESS, 19 NAMESTAR, 20 NAMETYPE, 21 NEWPLAYER, 22 NEWSHIP, 23 NOTIFY1, 24 ORGFLEETS, 25 PLAYERENTRY, 26 POLLSPEED, 27 PRTDLG, 28 REGISTER, 29 REPORT,
30 SENDMSG, 31 SHIPTYPE, 32 STARTUP, 33 STATUS. Openers read in the decompile by these names: FILEOPEN `FUN_1058_017e`, AUTOPLAY `FUN_10a0_02c7`,
POLLSPEED `FUN_10a0_03e8`, BATTLESPEED `FUN_10a0_0509`, REPORT `FUN_10c0_0344`, MODELESS `FUN_10f8_01f0`, STATUS `FUN_1100_05b4`, LISTSKILLS `FUN_1078_039c`,
the alerts `FUN_1108_01fc` (through the generic `FUN_1108_0000`); the rest go through `FUN_1108_0000` with the name as a parameter (its callers name them).

**The code** (`js/skins/dos/win31/`): `templates.js` (the 33 templates' geometry, control kinds, ids and style bits, no words; made by
`tools/extract/win31-templates.py` from WINHO.EXE), `dialog.js` (the renderer), `dialogs.js` (the dialogs wired to the game), `hook.js` (the one hook: loaded by
one line of `js/skins/dos/ui.js`; with the win31 look a menu item listed in its ITEMS opens the template's dialog, everything else is as before; it also adds
About to the win31 Help menu). The About picture is HOCOLOR.DLL's own (a whole .BMP, resource 1000, 383 x 236): `assets/skins/dos/sprites/w1000.png`,
written by `tools/extract/win31-art.py` (run it after `tools/extract/dos.py`, which rewrites the manifest). Words: `js/ui-text.js` (three new rows).

**Measured, and built to it.** Dialog units to pixels by the System font's base units, 8 x 16 (x * 2, y * 2): Battle Speed's 134 x 87 du is a 268 x 174
client, its scroll bar (23, 27, 74, 9) at (46, 54), 148 x 18. Frame: a black line and four navy pixels around the client; with a title: black, three navy, a
white row, the 18-pixel caption (control-menu box 18 x 18 and its black line; the title centred right of it), a black line; the caption's white line runs down
both its sides. Push button: black edge with its corner pixel cut, two pixels of white and of shade; the default one a two-pixel black edge. Check box 13 x 13,
centred, its text 19 pixels in. Scroll bar: 17-pixel arrows and thumb with their black edges, thumb at 16 + MulDiv(pos - min, length - 49, max - min);
Battle Speed's bar has **56 steps and opens 12 from Fast** (counted in the running program). The About picture is painted one pixel in (at 1, 0).
Compared pixel by pixel (scratch `cmp.py`, the remake at --wu 1 and 2 against the captures): About's frame, caption and control-menu box match the VGA capture
to the pixel; its picture matches the 256-colour capture to the pixel (100 %); Battle Speed's frame, scroll bar, check box and button geometry match the VGA
capture except the text, the thumb (another value) and three pixels at each end of a button's bevel. What differs everywhere is the **font**: the System font
(VGASYS.FON) is Microsoft's and is not in the repo; the renderer uses the win31 look's MS Sans Serif / Arial at 13/16 px.

**The renderer covers** static text (left, centre, right, wrapping or not), owner-painted statics (a canvas the dialog paints), push and default push buttons,
check boxes, radio buttons, group boxes, edit fields, list boxes, horizontal and vertical scroll bars, a combo box (a drop-down list), hidden and disabled
controls, Return as IDOK, a scale of 1 or 2 CSS pixels per Windows pixel (less on a small phone). **Checked against captures:** frame, caption, static, push
button, default button (Startup's Open Game), check box, horizontal scroll bar. **Built, not yet checked:** radio, group box, edit, list box, vertical scroll
bar, combo box (their first chunk captures and fixes them). **Cannot yet:** the System font; the bevel's stepped ends; focus rectangles as Windows draws
them; icons (STATIC SS_ICON); owner-drawn buttons (Create New Galaxy's pictures, the queue's ship cells) beyond a canvas the dialog paints itself; the
dialog's own position (the remake centres it; the program puts Battle Speed at (152, 141) on the screen); the 256-colour palette's pale captions; tab order
and mnemonics beyond the browser's; the Help menu's About shows only when the look is chosen before the page loads (the skin builds its menus once).

**Cost of one dialog after the foundation:** About and Battle Speed are 12 and 14 lines in `dialogs.js` and one line each in `hook.js`' ITEMS; with a capture
to compare, about a quarter of an hour each, most of it the comparison. A dialog with owner-drawn controls or lists costs more (the painting is the DOS
skin's, reused: its `*Dos` functions already draw most of the pictures and rows).

**Checks with this:** `test.js dos --digest` 10b0cd70aba2d434, notes-check, human-play, ui-lang-audit dos, skin-rules-check (dos) as before; real-play with
`--os=win31` (new option; it also opens About and Battle Speed from the menus and closes them): both dialogs open, are looked at and close at phone-l and
desktop; the win31 look's other failures (menus covered by the Organize Fleets and battle "Skip" windows, a fleet drag at phone-l) were there before this
(the same run on the previous commit fails more).

### The chunk plan (the other 31, about five a session)

Each chunk: capture each dialog in the running original (`emulators/dosbox-win31`), add it to `dialogs.js` and `hook.js` ITEMS, compare, look at the shots.
"DOS" names the DOS skin's window for the same thing (`js/skins/dos/ui.js`), whose game wiring and pictures a chunk reuses.

1. **Start:** 11 CREATEGALAXY (owner-drawn pictures, a scroll bar; DOS `createGalaxyDos`), 12 FILEOPEN (edit, two list boxes; `FUN_1058_017e`; the remake's
   saved games), 13 GAMEINFO, 21 NEWPLAYER (radios; the DOS skin has none: the classic New Game), 25 PLAYERENTRY, 32 STARTUP (owner-drawn picture: HOCOLOR
   1002). Needs: list box and edit checked against captures (first to use them); the Startup and New Galaxy pictures extracted (win31-art.py).
2. **Licence and registration:** 14 LICENSEE (radios, edits), 28 REGISTER (the password box). Small; can join chunk 1 or 5.
3. **Ships:** 9 BLDSHIP (list box, owner-drawn queue cells; DOS `buildDos`), 22 NEWSHIP (29 controls, scroll bars; DOS `newTypeDos`), 31 SHIPTYPE (DOS
   `shipTypesDos`), 20 NAMETYPE and 19 NAMESTAR (DOS `renameDos`), 24 ORGFLEETS (DOS `organizeDos`). Needs: owner-drawn ship pictures from HOCOLOR.
4. **Lists:** 15 LISTFLEETS (DOS `fleetsDos`), 17 LISTSTARS (DOS `starsDos`), 10 COMPPLAYERS and 16 LISTSKILLS (`FUN_1078_039c`; DOS `compareDos`, `skillsDos`),
   29 REPORT (`FUN_10c0_0344`; DOS `reportsDos`). Needs: list box (chunk 1), vertical scroll bar checked.
5. **Small boxes:** 6 AUTOPLAY (`FUN_10a0_02c7`; radios, scroll bar; DOS `autoPlayDos`), 26 POLLSPEED (`FUN_10a0_03e8`), 2 ALERTBOX and 3-5 ALERT_* (icon,
   `FUN_1108_01fc`; DOS `alertDos`), 23 NOTIFY1, 33 STATUS (`FUN_1100_05b4`), 27 PRTDLG (printing: nothing to print in a browser, its place noted), 18 MODELESS
   (`FUN_10f8_01f0`), 7 BATTLE (the battle window's Skip; DOS `battleDos`), 30 SENDMSG (32 controls; DOS `chatDos`). Needs: radios and icons checked.
   Probably two sessions (alerts and boxes; battle and messages).
