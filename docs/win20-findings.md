# Windows 3.1 2.0: the display audit (November 2026, begun)

**Progress (Windows dialogs):** foundation done (emulator `emulators/dosbox-win31`, renderer `js/skins/dos/win31/`); chunk 1 done: the main window on the 640 x 480 screen at one scale, and 8 of 33 dialogs built (About, Battle Speed; Create New Galaxy, File Open, GameInfo, New Player Registration, Player Entry, Startup); Game Info also in the DOS look, the DOS look's build cost line "(D)" / "(P)"; chunk 3 done (Ships: Build Ships, Create New Ship Type, List Ship Types, Rename, Name a Star, Organize Fleets; 14 of 33 built); next: chunk 2 (Licence, Register: not started), then chunk 4, Lists (below, "The chunk plan").

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
button, default button (Startup's Open Game), check box, horizontal scroll bar; in chunk 1 radio, edit, list box, black frame (the
bold words fixed). **Built, not yet checked:** group box, vertical scroll bar, drop-down combo box (their first chunk captures and fixes them). (Since chunk 1 the
scale is the screen's, the frame unit --u, not 1 or 2.) **Cannot yet:** the System font; the bevel's stepped ends; focus rectangles as Windows draws
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

## The main window (chunk 1, part A, November 2026)

**Measured** on `win20-orig-{vga16,s3-256}-main.png` and read in the decompile (the Window menu's Clean Up Windows routine, which also places the windows at the
start, from the screen size and SM_CYCAPTION, SM_CXFRAME, SM_CYFRAME): on the 640 x 480 screen the main window is 0, 0 to 640, 356 (480 - 96 - caption - 2 frames);
Tech Spending 0, 356, 228 x 120 (a one-pixel frame); Reports 382, 356 to 640, 480 (a sizing frame); the desktop between them (16 colours #c0c0c0, 256 the workspace grey).
The main window: a sizing frame of four, an 18-row caption (control-menu box, title, minimize and maximize), the 18-row menu bar (WINHO's MENU 1), its client 632 x 310 at
4, 42: the panes 240 wide, their last column black (planet 89 rows, fleets 90, totals 46, players and budget 85) and the map 375 x 293 with Windows' scroll bars
(17 across, 15-pixel boxes and thumb at 17 + (L - 49) * v / max), the corner white. **The Windows build's panes are the DOS program's** (the same bar charts at the same
places: rule, ticks every 5, bars 18 wide 9 apart) **in another font**: MS Sans Serif 8 (capitals 8, lines 14 apart) and the planet's name in the bold System font, so
the rows are 14 apart where DOS has 10 or 12, the fleet list's rows 14 (the chosen one 15 high), the scroll bars Windows'; the ticks one pixel; the bar names 12 below
the bars and the technologies' second row 14 lower. In 16 colours the bars are 0,0,170 (terraform, mine), 170,85,170 (ships, technologies) and the budget's 0,170,85;
in 256 the DOS colours (the budget's 48,207,0). The End Turn picture sits at 3, 2 in the map.

**Built** (`js/skins/dos/ui.js`, `js/skins/dos/win31/frame.js`): with the win31 look the DOS skin's frame is on (`frameOn` is the dos or the win31 look; `winOn` the
win31 one) in the Windows layout: the panes drawn by the DOS skin's functions with the Windows geometry (tables PGEO, FGEO and the Windows branches), the map's
scroll bars and the panes' bars Windows' (`wBar`), Tech Spending and Reports as their own windows (Reports lists the turn's reports, as the DOS Reports window
does; a click acts on one). The window last pressed on has the active caption; the remake starts with the main one active (the capture had Reports active, the
last window the program opened). **One scale:** the frame's unit --u fits the 640 x 480 screen to the browser window; the template dialogs (dialog.js) open
at the same unit, as the DOS skin's own windows already do; a dialog no longer dims the screen. Stand-in font: Arial at 11 px, narrowed to 92 % (MS Sans Serif's
widths). Not done: the Help menu only when the look is chosen before the page loads (as before); the logo menu where Windows has Help; the dialogs are centred
(the program puts Battle Speed at 152, 141); the remake's own windows (Preferences ...) keep their CSS size.

**real-play** (`--skin=dos --rules=dos --os=win31`): before, 0 of 2 runs passed at phone-l and desktop (menus covered by the Organize Fleets and battle
windows, the fleet drag at phone-l); now phone-l, pad, desktop and 4k pass, as the dos look does.

## Chunk 1: the Start dialogs (November 2026)

**Captured** (private `audit/win-2.0/captures/win20-orig-vga16-*.png`, new): File Open (`fileopen-empty`, `fileopen-new`: the same window names a new galaxy,
`fileopen`: a saved file, `fileopen-sel`: chosen), Player Entry (`playerentry-name`: OK enabled by a name, Info... dimmed in a new game; `playerentry-open`: Info...
enabled when opening a game), GameInfo (`gameinfo`), Build Ships (`build-dev`, `build-prod`: the cost line). Delete MILKYWAY.HO! after (done).

**Built** (`js/skins/dos/win31/dialogs.js`; looked at beside the captures at one Windows pixel per CSS pixel):
- **32 STARTUP** on the title page, in the DOS look's frame there (`ui.js` startupDos hands over): picture 1002 (the DOS skin's d1002: HOCOLOR's 1000-series
  pictures 1002, 3500-3550, 500, 501, 5030 are byte-for-byte the DOS ones; End Turn 5000/5001 differ only in a few colours), the licence lines, Open Game / New Game /
  Cancel, the logo (d9999) centred in control 500 (measured: 6, 1 in).
- **12 FILEOPEN** for File, Open Game… and Startup's Open Game: the remake's saved games (its slots for the ruleset and the game in progress) named
  `<galaxy>.ho!`; no folders (Directories empty, the directory "this browser").
- **11 CREATEGALAXY, 25 PLAYERENTRY, 21 NEWPLAYER**: the New Game sequence inside the remake's New game window (`ui.js` createGalaxyDos hands over; the
  form keeps the choices; "Remake options…" shows the rest as in the DOS look). **Create New Galaxy's horizontal dialog unit is not the System font's**: the
  window is 617 wide for 246 units and its frames sit at 42, 286, 599 (9.87 pixels per 4 units; the vertical is 16 per 8 as everywhere): built with that unit.
  Its picture buttons: the DOS icons 3020-3050 at the middle, 3 down, the name under them (baseline 47), the chosen one green (0,170,85; 256 colours 0,130,0).
  Player Entry's name is a CBS_SIMPLE combo box (drawn as its field), its password field is not ES_PASSWORD (the letters show), OK is dimmed until a name is typed.
- **13 GAMEINFO** (and the DOS look's GameInfoDlgBox) from the Window menu: the sentence as GAMEINFODLGPROC builds it ("This is a %s, %s, %s galaxy with %d %s
  and %s.\n\nThe current year is %d.": size, density, style; "human(s)"; "N <intelligence> computer player(s)" or "no computer players"), the humans listed,
  picture 3520 at 17, 23 in its control (measured).

**List box and edit field checked** on the File Open capture: rows 16 apart, the chosen row navy across the list, the words in the bold System font (the
renderer drew lists and fields in normal weight: fixed). The renderer also gained: a picture in any control (Startup's logo frame), black frames, CBS_SIMPLE
combo boxes, a per-dialog horizontal unit (`baseX`), `HOWIN31.build` (a dialog held in the page).

**The Build Ships cost line** (DOS `FUN_b000_be04` / `b9f6`; Windows BLDSHIP draws the same): "$cost (D)" while no ship of the type has been built
(the development cost: a new Fighter type "$4,000 (D)"), "$cost (P)" after (the production cost: the starting Scout "$1,960 (P)"). The DOS look's queue pane writes
it now (`ui.js` buildDos); chunk 3's BLDSHIP writes it below the picture at the left, "n% Done" at the right.

**Not done:** 14 LICENSEE and 28 REGISTER (chunk 2); the dialogs' own positions (centred; the program's are not the template's plain offsets: File Open at 8, 66,
Battle Speed 152, 141, GameInfo over Player Entry); a double click on a GameInfo name (fills Player Entry's name in the program); the remake's New game form
opens on its own default look (DOS) rather than the one in use, as before.

**Cost** (for chunks 3-5): Part A (the main window) was most of this session; after it, a template dialog with a capture took 15-30 minutes (GameInfo,
File Open, Startup), the three-window New Game sequence about an hour (the owner-drawn cells and Create New Galaxy's own dialog unit had to be measured).
Captures in the running program cost about 2 minutes each with `w31.py` (keys work where the cursor finder does not: over a picture).

## Chunk 3: Ships (November 2026)

**Captured** (private `audit/win-2.0/captures/win20-orig-vga16-*.png`, new): `build-empty`, `build-two` (two kinds queued), `build-remove` (a queue cell
clicked), `build-colony` (the second kind moved up), `newship` (Scout), `newship-class` (the Class list open), `newship-fighter`, `newship-sat`, `shiptype`,
`nametype`, `orgfleets`, `orgfleets-group` (with chunk 1's `build-dev`, `build-prod`). Name a Star needs a won game: not captured.

**The ship pictures.** HOCOLOR.DLL's 228 ship parts (12100-12926) are byte for byte the DOS program's (the DOS skin's d12100-d12926, compared pixel by pixel), so
they are reused. FUN_10f0_0066 draws a ship as three parts side by side (engine 12100 + Range + Speed - 8, hull 12198 + Shields or 12250 for a colony pod, nose
12350 + Weapons - 1; a satellite 12401 + Weapons - 1 in the middle part; the two special ships), big (81 x 76 a part) or small (40 x 40, ids + 500): `dialogs.js
W.shipPic`. The 16-colour screen shows them in its 16 colours; the remake in their own.

**Some windows are sized by the program, not by the System font's units** (measured): Build Ships' client is 524 x 332 for 258 x 160 units (every control where
8.132 x 16.6 units put it, truncated; its list 367, 34, 142 x 218); List Ship Types keeps the units but lengthens its list to four whole rows of 54 (19, 13,
140 x 218) and moves everything from 99 units down 11 pixels (client 448 x 337); Organize Fleets 452 x 316 for 223 x 151 (8.11 x 16.74). Create New Ship Type
and Rename are at the System font's units. The renderer gained `baseY`, `floor`, `rects`, `client`, `moveBelow`.

**Built** (`js/skins/dos/win31/dialogs.js`; each looked at beside its capture at one Windows pixel per CSS pixel):
- **9 BLDSHIP** (Ships, Build Ships at ...; the remake's Build): owner-drawn list of types (rows of 54: small picture, caption in MS Sans Serif; chosen black), a
  click queues one; three queue cells (121 x 55 framed, "one Patton (2/2) Fighter" / "2 Patton (2/2) Fighters", a caption too wide in the smaller font); a click
  on a cell takes one ship away (captured) and unchooses the list; the big picture of the first kind with the part not built grey (FUN_10e8_18a8: PatBlt ROP
  0xFA0089 from the right over (100 - done) %; in 16 colours each colour turns white or dark grey: a table of the 134 colours measured, the nearest for the
  rest); the cost line and "n% Done", blank with nothing queued. OK sets the queue, Cancel leaves it.
- **22 NEWSHIP** (Ctrl+K): name field, five levels "v / max" with scroll bars (a one-value bar keeps its thumb at the start: captured), Name It For Me, the big
  picture in the white frame, Class drop-down (the combo box's own 17-pixel button now drawn, measured), costs, Cancel, OK dimmed until named (a dimmed default
  button loses its heavy edge: captured). A Satellite's Range "0 / 0".
- **31 SHIPTYPE**: the list (owner-drawn, a scroll bar past four), the chosen type's picture and numbers, Scrap This Type, Rename (opens 20), OK.
- **20 NAMETYPE**: the sentence, the field, Name It, Cancel, OK dimmed while empty; back to List Ship Types.
- **19 NAMESTAR** (when the player has won): from the template at the System font's units, in the remake's Name a Star form (T.nameStarLayout): the ruleset's
  words, picture 3500 (74 x 74, the frame's size), "New Star Name:", the field, OK. Not captured.
- **24 ORGFLEETS** (Ctrl+O): the words, the frame of piles (one a row, 45 apart; the number right-aligned at 35, the small picture at 16), Group All, Divide All,
  Cancel, OK. Moves by drag or, for touch, a tap on a pile and on another (Shift: the whole pile); more than four piles in columns (not captured: the remake's).

**Not done:** the 256-colour pattern for the unbuilt part (bitmap 0x22ce, not captured); the pictures in 16 colours; Name a Star and more than four piles not
captured; the dialogs centred, not at the program's places.

**Cost:** the six dialogs with their captures took most of one session; Build Ships (the program's own sizing, the grey table) about half of it. Captures in the
running program: a new game, Create New Ship Type, List Ship Types, Rename, Build Ships, Organize Fleets, two turns: about 20 minutes.

### The chunk plan (the other 31, about five a session)

Each chunk: capture each dialog in the running original (`emulators/dosbox-win31`), add it to `dialogs.js` and `hook.js` ITEMS, compare, look at the shots.
"DOS" names the DOS skin's window for the same thing (`js/skins/dos/ui.js`), whose game wiring and pictures a chunk reuses.

1. **Start:** 11 CREATEGALAXY (owner-drawn pictures, a scroll bar; DOS `createGalaxyDos`), 12 FILEOPEN (edit, two list boxes; `FUN_1058_017e`; the remake's
   saved games), 13 GAMEINFO, 21 NEWPLAYER (radios; the DOS skin has none: the classic New Game), 25 PLAYERENTRY, 32 STARTUP (owner-drawn picture: HOCOLOR
   1002). Needs: list box and edit checked against captures (first to use them); the Startup and New Galaxy pictures extracted (win31-art.py).
2. **Licence and registration:** 14 LICENSEE (radios, edits), 28 REGISTER (the password box). Small; can join chunk 1 or 5.
3. **Ships (done, above):** 9 BLDSHIP (list box, owner-drawn queue cells; DOS `buildDos`), 22 NEWSHIP (29 controls, scroll bars; DOS `newTypeDos`), 31 SHIPTYPE (DOS
   `shipTypesDos`), 20 NAMETYPE and 19 NAMESTAR (DOS `renameDos`), 24 ORGFLEETS (DOS `organizeDos`). Needs: owner-drawn ship pictures from HOCOLOR.
4. **Lists:** 15 LISTFLEETS (DOS `fleetsDos`), 17 LISTSTARS (DOS `starsDos`), 10 COMPPLAYERS and 16 LISTSKILLS (`FUN_1078_039c`; DOS `compareDos`, `skillsDos`),
   29 REPORT (`FUN_10c0_0344`; DOS `reportsDos`). Needs: list box (chunk 1), vertical scroll bar checked.
5. **Small boxes:** 6 AUTOPLAY (`FUN_10a0_02c7`; radios, scroll bar; DOS `autoPlayDos`), 26 POLLSPEED (`FUN_10a0_03e8`), 2 ALERTBOX and 3-5 ALERT_* (icon,
   `FUN_1108_01fc`; DOS `alertDos`), 23 NOTIFY1, 33 STATUS (`FUN_1100_05b4`), 27 PRTDLG (printing: nothing to print in a browser, its place noted), 18 MODELESS
   (`FUN_10f8_01f0`), 7 BATTLE (the battle window's Skip; DOS `battleDos`), 30 SENDMSG (32 controls; DOS `chatDos`). Needs: radios and icons checked.
   Probably two sessions (alerts and boxes; battle and messages).
