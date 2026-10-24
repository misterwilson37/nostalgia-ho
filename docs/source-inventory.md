# What the originals' files hold, and what was read

Every file we have of every version, each resource type in it, and what read it: a tool in
`tools/extract/`, a findings document, or nothing yet. Made in October 2026, after 5.0.5's
window layouts turned out to have been recorded as "not in our copy" because only one of the
program's layout formats had been read. The full listing of types and counts, written by
`tools/extract/inventory.py`, is at the end.

**What had been missed, and why.** 5.0.5 is built with Metrowerks PowerPlant: its 50 windows
are `PPob` streams (with `WIND`, `RidL`, `wctb`, `Txtr`, and `CTYP` templates for its own pane
classes), not the Toolbox's `DLOG`/`DITL`. The earlier parser read `DLOG`/`DITL` only, found
two (the system's folder dialogs) and so recorded the rank window, the Radical Research
window, the auto play settings and "You have conquered the galaxy!" as missing. Read now by
`tools/extract/ppob.py`: `docs/505-windows.md`. Smaller gaps of the same kind, found by this
sweep: 4.0.5's `CNTL` scroll bar ranges (Mac) and its radical card and You Won dialogs
(Windows dialogs 348, 377; Mac DITL 5040, 6170), read before only in part
(`docs/405-windows.md`); the Palm's `tFRM` forms, read before only for the form numbers the
code named (`docs/palm-windows.md`, `tools/extract/palmforms.py`); the Mac 4.0 updaters' read-me
`TEXT`, the Windows 2.0 alert resources (type 32513), the Win 3.1 art DLLs, the Amiga's two
German read-me files, and 1.2F's saved galaxy, none read before (below).

Key: **read** (the tool or document that read it), **new** (read in this sweep), **not
read** (and why it doesn't matter, or what it might hold).

## 5.0.5 (Mac OS X / Carbon, 2003): `Spaceward Ho!.app`

- `Contents/Resources/Spaceward Ho!.rsrc` (resource file):
  - `PPob` 50, `WIND` 50, `RidL` 50, `wctb` 47, `Txtr` 17, `CTYP` 40, `MENU` 37, `xmnu` 15,
    `Mcmd` 15, `MBAR` 2: **new**, `tools/extract/ppob.py`, `docs/505-windows.md` (every
    layout, menu, text style and class).
  - `STR#` 33: read (`js/data.js`, `docs/original-findings.md`); all dumped in
    `docs/505-windows.md`, which shows the Radical Tech Strings (6260), sprintf Templates
    (6003.19-20) and Misc. Strings 60 that the window work needed.
  - `DLOG` 2, `DITL` 11, `ALRT` 9, `CNTL` 2, `DLGX` 1: read (system dialogs, start-up
    alerts); dumped.
  - `PICT` 140, `snd ` 44, `icns`, `cicn`, `ics#`/`ics8`, `icl8`, `CURS`, `CuSt`: read
    (`tools/extract/assets.py`, `pict.py`, `snd.py`, `icons.py`).
  - `aete`, `aedt`, `BNDL`, `FREF`, `SIZE`, `carb`, `cfrg`, `MPSR`, `MWBB`, `NoPt`, `Ho5c`,
    `dftb`, `actb`, `ictb`: system and build resources; not read (no game text: `Ho5c` is the
    creator's signature).
- `Contents/MacOS/` (the program): read (Ghidra, `docs/decompiling.md`).
- `01.jpg`-`25.jpg` (the rank pictures), `ho.mp3`, `app.icns`, `doc.icns`: read
  (`assets/explore/`).
- `Spaceward Ho Help Book/`: read (`js/help.js`, the manual).

## 4.0.5 and 4.0.1 (Mac, 1996)

- `Spaceward Ho! 4.0.5.fork` / `.rsrc` (the same fork, raw and AppleDouble):
  - `DLOG` 50, `DITL` 90, `ALRT` 39: read in part before (`docs/405-findings.md` cites DITL
    4020, 4110, 6000); **new**: all dumped in `docs/405-windows.md`, which settled the
    radical card window (DLOG/DITL 6170), You Won (5040), the auto play settings (4021).
  - `CNTL` 22: **new** (the scroll bars' ranges: 4020 "Message Delay" 1-15, 4021
    "Aggressiveness" 0-10, 4022 "Defensiveness" 0-100, 4040 "Battle Speed (ticks)" 10-60,
    4060 "Polling Time (Seconds)" 1-15, 6081 "Turn Duration" 1-10; the pop-up menus').
  - `STR#` 42, `MENU` 12, `MBAR` 1: read (`js/rules-mac405.js`); dumped.
  - `PICT` 169, `ICN#` 158, `ics#` 92, `icl8` 5, `snd ` 37, `CURS`, `acur`: read
    (`tools/extract/mac4.py`).
  - `MaTh` 3 (Sines, Cosines, Weapon Ratios): read (`docs/405-findings.md`).
  - `Stup` 1000 "Default Setup": read (`docs/405-findings.md`).
  - `CODE` 27, `DATA`, `CDEF`, `LDEF`, `WDEF`, `RGN `, `dctb`, `TMPL` (Reqd, TesT), `Reqd`,
    `SH4∆`, `cfrg`, `vers`, `BNDL`, `FREF`, `SIZE`: code and system resources; the code read
    with Ghidra (`docs/decompiling.md`), the rest not needed.
- `Spaceward Ho! 4.0.5` / `4.0.1` (data forks): the PowerPC code (PEF): read (Ghidra).
- `Spaceward Ho! 4.0.1.fork`: as 4.0.5's but `ALRT` 37, `DITL` 88, `PICT` 168: read
  (`docs/missing-assets.md`, mac4.py).
- `Ho! 4.0 Color Picts.fork` (4.0.5 and 4.0.1): `PPMp` 183 / 182, `PICT` 38, `icl8` 167,
  `ics8` 92, `snd ` 5, `RGN ` 2, `DITL` 1, `TMPL` 1: read (`tools/extract/mac4.py`, the mac4c
  skin).
- `Ho! 4 Updaters to 4.0.5/` (three patchers: 4.0.1 Expo, 4.0.1-4.0.3, 4.0.3->4.0.5): each a
  resource patcher (Michael Hecht's, `vers` "A resource patching utility") holding the
  patches (`ZAP ` 36-259, `ZIS#`, `ZIL#`, `ZAPS`, `ZVER`, `ZERO`: the code changes, which the
  4.0.5 program already has), its own dialogs, and a read-me `TEXT` 128: **new** (not read
  before). The 4.0.1-4.0.3 notes list that version's fixes (the Build Ships window's "Build
  and Continue", "personalized star names now come up more frequently", "radical techs are
  'something interesting' when they happen", the ranks list made larger, ...); the
  4.0.3->4.0.5 notes say 4.0.4 was never released in English and 4.0.5 plays against the
  Windows 95 version; the Expo 4.0.1 notes are Joe Williams' instructions for the patcher.
  None changes a rule the remake plays (they describe 4.0.5's own behaviour).

## 4.0.5 (Windows 95, 1996): `SPACEHO.EXE`

- `RT_DIALOG` 47, `RT_MENU` 1: read (`docs/405-findings.md` by dialog number); **new**: all
  printed by `tools/extract/windlg.py` in `docs/405-windows.md`, which settled the radical
  card window (348), You Won (377), the auto play settings (380). Scroll bar ranges are in
  the code (`SetScrollRange`, read: `FUN_00408f3b`, `FUN_00404d29`).
- `RT_STRING` 93 blocks: read (`assets/skins/w95/strings.json`, `js/rules-405.js`).
- type 240 (`RT_DLGINIT`, the combo boxes' items) 3: read (the turn time limits of dialog
  111, `js/rules-405.js`; the sort orders of 356 and 384); listed in `docs/405-windows.md`.
- `RT_BITMAP` 684, `RT_ICON`, `RT_GROUP_ICON`, `RT_CURSOR` 28, `RT_GROUP_CURSOR` 16, `WAVE`
  37: read (`tools/extract/win95.py`). Bitmap 124 (0x7c, the Master Point List's
  picture for 50,000-499,999 points) is not among them (`docs/open-questions.md`).
- `RT_ACCELERATOR` 2, `RT_VERSION` 1: not needed.

## 3.0.1 (Mac, 1993)

- `app.rsrc` (the program's fork): `DITL` 96, `DLOG` 43, `ALRT` 52, `CNTL` 19, `STR#` 29,
  `MENU` 10: read (`docs/301-findings.md`, `js/rules-301.js`; `tools/extract/mac3.py`);
  `PICT` 146, `ICN#` 131, `ics#` 73, `icl4`/`icl8`/`ics4`/`ics8`, `snd ` 21: read (mac3.py);
  `MaTh` 3, `Stup` 1000: read; `CODE` 26: read (Ghidra, `tools/decompile/mac68k.py`);
  `CDEF`, `LDEF`, `WDEF`, `TMPL`, `dctb`, `acur`, `Reqd`, `SH3∆`, `vers`: system resources.
- `Spaceward Ho! 3.0 Color.img` (an HFS disk) with `Ho! 3.0 Color Picts` (the same as
  `color.rsrc`): `PPMp` 132, `PICT` 30, `icl8` 167, `ics8` 69, `RGN ` 2, `ckid`, `TMPL`: read
  (mac3.py, the mac3c skin).

## 2.0.1 (Mac, 1992)

- `Spaceward Ho v2.01 - Disk 1 - Program.dc42` (DiskCopy 4.2): the program (`Spaceward
  Ho! 2.0.1`, the same fork as `Spaceward_Ho!_2.0.1.rsrc`: `DITL` 78, `DLOG` 26, `ALRT` 51,
  `CNTL` 14, `STR#` 25, `MENU` 8, `PICT` 241, `CODE` 23, `MaTh` 3, `Stup`), TeachText 1.2,
  and three `TEXT` files: "2.0 Release Notes", "2.0.1 Changes", "Note for PowerBook users".
  All read (`tools/extract/mac2.py`, `js/rules-mac20.js`, `docs/coverage-20.md`; the notes in
  `docs/missing-assets.md` and `docs/evolution.md`).
- `Disk 2 - Color Pictures.dc42`: `TheHo Color Picts` (`PPMp` 231, `PICT` 13): read (mac2.py,
  the mac2c skin).

## 1.2F (Mac, French, 1992)

- `._TheHo 1.2 ` (AppleDouble, the program's fork; `app.rsrc` the same): `DITL` 72, `DLOG`
  20, `ALRT` 53, `CNTL` 11, `STR#` 23, `MENU` 8, `PICT` 242, `CODE` 23, `MaTh` 3, `Stup`:
  read (`docs/12-findings.md`, `tools/extract/mac12.py`, `js/rules-12.js`).
- `Voie Lactée` and `._Voie Lactée`: a saved galaxy (data fork, and `FlEt` 2, `PlYr` 2,
  `ViEw` 2 in its fork): not read (a game in progress; its name, the default galaxy name, is
  in `docs/12-findings.md`). The colour pictures file "TheHo F CPicts" isn't in our copy.

## 2.0 (DOS and Windows 3.1, 1993)

- DOS `HO/`: `DOSHO.EXE` (read, Ghidra: `docs/dos-findings.md`); `HO.PRS` (`STR` 1, `SND`
  14, `PFN` 18, `SFN` 1, `ILM` 92, `ISM` 62, `DIB` 2, `BMP` 1), `HOCOLOR.PRS` (`DIB` 243,
  `IL8` 92, `IS8` 62), `HOMONO.PRS` (`DIB` 243, `IL2` 90, `IS2` 62): read
  (`tools/extract/dos.py`); `THE_HO!.PRF` (`LIC`, `PRF`: the preferences and licence): read
  (`docs/amiga-skin.md`); `HO!.CFG`, `HO!.NWC`, `SOUND.NWC`, `SOUNDRV.COM`, `HO.BAT`,
  `INSTALL.EXE`, `DEARJ.EXE`: the sound driver's set-up and the installer; not needed. The
  manual (text): read (`docs/dos-findings.md`).
- Windows 3.1 `STARHILL/SCI-FI/WINHO/`: `WINHO.EXE` (NE): `RT_DIALOG` 33, `RT_MENU`,
  `RT_STRING` 48, `RT_RCDATA` 3 (the sine tables), read (`docs/dos-findings.md`,
  `docs/coverage-20.md`); type 32513, 38 alert boxes (button count, buttons, text: the Mac's
  `ALRT`s, among them 5040 "Congratulations!  You have conquered the galaxy!" with OK and
  5050 "Unfortunately, you have been eliminated from the game..." with "Oh Well..."): **new**
  (their words are also DOS 2.0's `STR`, which was read); type 32515, 14 colour tables, and
  32514, the title bitmap: not read (art). `HOCOLOR.DLL` / `HOMONO.DLL` (types 32513-32517:
  241 / 240 pictures and 92 / 90, 62, 78 / 76, 62 icons, as BMPs): not read (the same
  pictures as the DOS PRS files, which the dos skin uses). `HOHELP.HLP`: read
  (`tools/extract/hlp.py`). `WINHO.WRI` (the Windows manual, "Version 0.5"), `README.TXT`:
  **new**; the manual is the DOS manual's text and settled one question
  (`docs/open-questions.md`: it describes the budget bars starting on "Linear" and a bar that
  locks at zero when its work is done).

## The Palm OS (5 for Palm OS 1.0.4 and 1.0.3, 2003)

- `Spaceward Ho.prc`: `code` 8, `data` 2 (read, Ghidra: `docs/palm-findings.md`); `tSTL` 26,
  `tSTR` 6, `RANK` 1, `RAND` 1, `ATAB` 2: read (`js/rules-palm.js`); `Tbmp` 201: read
  (`tools/extract/palm.py`); `tFRM` 30, `Talt` 18, `MBAR` 4, `MENU` 1: read before by number
  (the forms the code named), **new** in full: `tools/extract/palmforms.py`,
  `docs/palm-windows.md`, which settled the Radical Research form (3000), the Auto Play form
  (1700, with `FUN_000718c2`'s ranges) and the rank form's words (2900); `tAIB`, `tAIN`,
  `taic`, `tver`: the launcher's icons and version.
- `Release Notes.txt`, `License.txt`, `How To Play.url`: read (`docs/palm-findings.md`).
  1.0.3 differs from 1.0.4 in code and three demo strings (tSTL 6001.26-28) and the credit.

## iOS 1.2.9 (2012) and Android 1.2.8 (2015)

- iOS `SpacewardHo.app`: the program (Mach-O, read: `docs/ios-findings.md`,
  `docs/coverage-ios.md`); `en/fr/tr.lproj/objectdictionary.plist` (every string list,
  27 lists: read, `js/lang-data.js`) and `help_index*.html` with their pictures (read); the
  sprite sheets' `.plist` and `.pvr.ccz`, `Assets.car`, the PNGs, sounds and JPGs (read,
  `tools/extract/ios.py`); `Launch Screen.storyboardc` (two nibs: the launch screen only,
  no game window); `Info.plist`, `iTunesMetadata.plist`, `BundleMetadata.plist` (read: the
  version, the date). The game's windows are built in code (cocos2d layers) from the
  `objectdictionary` strings: there are no other layouts.
- Android APK: the same assets and lists (identical to iOS's), `AndroidManifest.xml`
  (read: version code, the build's time) and Apportable's system folder (four fallback
  fonts): read (`docs/android-findings.md`).

## Amiga 2.0 (German, 1994)

- Disk 1 `ho!` (the program, read: `tools/extract/amiga-code.py`, `docs/amiga-skin.md`),
  `texte.pff` (the strings), `image16.pff` / disk 2 `image256.pff`, `p16.iff`, `p256.iff`,
  `sound.pff`, `fonts/`: read (`tools/extract/amiga.py`, `tools/amiga-font.py`);
  `THE_HO!.PRF`: read. `Briefspiel.dok` (how to play by mail: a game file passed from
  player to player, the game master's "Aufteilen" menu item) and `Netzwerk.dok`: **new**,
  not read before; they describe the Amiga's play-by-mail and network games, which the
  remake doesn't have. `More`, `HDInstall`, `DosPatch`, `c/`, `libs/`, `devs/`, `s/`, the
  `.info` icons: the disk's system files. Nothing is left that holds the game's words.

## Amiga 2.1 (German 1995-01-09 and English 1995-06-06)

- German 2.1 disk 1 (`ho!` 2.1ge1.02, `textge.pff`, the same pictures, sounds and fonts as 2.0,
  no `More`) and disk 2 (`image256.pff`, identical to 2.0's); the 1995-06-06 disk 1 "[h WT]"
  (`HO!` 2.1ge1.05, the English `texte.pff`, `Changes.dok`, `WT-SWHE.NFO`; its disk 2 is missing):
  read, program, strings, windows and art compared with 2.0 (`tools/extract/amiga21.py`,
  `tools/decompile/AmigaDump.java`, `tools/decompile/amiga-fcmp.py`, `docs/amiga-21.md`).
  `Changes.dok` (the author's changelog) read; the English text table not yet used by the
  remake.

## The listing (`tools/extract/inventory.py`)

```
b/spaceward/Contents/Resources/Spaceward Ho!.rsrc: Mac resource fork: ALRT 9, BNDL 1, CNTL 2, CTYP 40, CURS 15, CuSt 13, DITL 11, DLGX 1, DLOG 2, FREF 2, Ho5c 1, ICN# 2, MBAR 2, MENU 37, MPSR 1, MWBB 1, Mcmd 15, NoPt 1, PICT 140, PPob 50, RidL 50, SIZE 1, STR# 33, Txtr 17, WIND 50, actb 1, aedt 4, aete 1, carb 1, cfrg 1, cicn 3, dftb 1, icl8 2, icns 2, ics# 25, ics8 25, ictb 1, snd  44, wctb 47, xmnu 15
b/spaceward/Spaceward Ho!: empty
mac4/Spaceward Ho! 4.0.5/Ho! 4.0 Color Picts.fork: Mac resource fork: DITL 1, PICT 38, PPMp 183, RGN  2, TMPL 1, icl8 167, ics8 92, snd  5, vers 2
mac4/Spaceward Ho! 4.0.5/Ho! 4.0 Color Picts.rsrc: AppleDouble resource fork: DITL 1, PICT 38, PPMp 183, RGN  2, TMPL 1, icl8 167, ics8 92, snd  5, vers 2
mac4/Spaceward Ho! 4.0.5/Spaceward Ho! 4.0.5: PEF program (PowerPC code)
mac4/Spaceward Ho! 4.0.5/Spaceward Ho! 4.0.5.fork: Mac resource fork: ALRT 39, BNDL 1, CDEF 3, CNTL 22, CODE 27, CURS 8, DATA 1, DITL 90, DLOG 50, FREF 6, ICN# 158, LDEF 3, MBAR 1, MENU 12, MaTh 3, PICT 169, RGN  1, Reqd 1, SH4∆ 1, SIZE 3, STR# 42, Stup 1, TMPL 2, WDEF 3, acur 1, cfrg 1, dctb 3, icl8 5, ics# 92, snd  37, vers 2
mac4/Spaceward Ho! 4.0.5/Spaceward Ho! 4.0.5.rsrc: AppleDouble resource fork: ALRT 39, BNDL 1, CDEF 3, CNTL 22, CODE 27, CURS 8, DATA 1, DITL 90, DLOG 50, FREF 6, ICN# 158, LDEF 3, MBAR 1, MENU 12, MaTh 3, PICT 169, RGN  1, Reqd 1, SH4∆ 1, SIZE 3, STR# 42, Stup 1, TMPL 2, WDEF 3, acur 1, cfrg 1, dctb 3, icl8 5, ics# 92, snd  37, vers 2
mac4/Spaceward Ho!/Ho! 4.0 Color Picts.fork: Mac resource fork: DITL 1, PICT 38, PPMp 182, RGN  2, TMPL 1, icl8 167, ics8 92, snd  5
mac4/Spaceward Ho!/Ho! 4.0 Color Picts.rsrc: AppleDouble resource fork: DITL 1, PICT 38, PPMp 182, RGN  2, TMPL 1, icl8 167, ics8 92, snd  5
mac4/Spaceward Ho!/Spaceward Ho! 4.0.1: PEF program (PowerPC code)
mac4/Spaceward Ho!/Spaceward Ho! 4.0.1.fork: Mac resource fork: ALRT 37, BNDL 1, CDEF 3, CNTL 22, CODE 27, CURS 8, DATA 1, DITL 88, DLOG 50, FREF 6, ICN# 158, LDEF 3, MBAR 1, MENU 12, MaTh 3, PICT 168, RGN  1, Reqd 1, SH4∆ 1, SIZE 3, STR# 42, Stup 1, TMPL 2, WDEF 3, acur 1, cfrg 1, dctb 3, icl8 5, ics# 92, snd  37, vers 2
mac4/Spaceward Ho!/Spaceward Ho! 4.0.1.rsrc: AppleDouble resource fork: ALRT 37, BNDL 1, CDEF 3, CNTL 22, CODE 27, CURS 8, DATA 1, DITL 88, DLOG 50, FREF 6, ICN# 158, LDEF 3, MBAR 1, MENU 12, MaTh 3, PICT 168, RGN  1, Reqd 1, SH4∆ 1, SIZE 3, STR# 42, Stup 1, TMPL 2, WDEF 3, acur 1, cfrg 1, dctb 3, icl8 5, ics# 92, snd  37, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! 4.0.1-4.0.3 patch.fork: Mac resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 6, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 5, TEXT 1, ZAP  55, ZAP# 2, ZAPS 1, ZERO 1, ZIL# 2, ZIS# 53, ZVER 2, dctb 1, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 1, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! 4.0.1-4.0.3 patch.rsrc: AppleDouble resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 6, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 5, TEXT 1, ZAP  55, ZAP# 2, ZAPS 1, ZERO 1, ZIL# 2, ZIS# 53, ZVER 2, dctb 1, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 1, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! 4.0.3->4.0.5.fork: Mac resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 6, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 5, TEXT 1, ZAP  36, ZAP# 1, ZAPS 1, ZERO 1, ZIL# 1, ZIS# 35, ZVER 1, dctb 1, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 1, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! 4.0.3->4.0.5.rsrc: AppleDouble resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 6, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 5, TEXT 1, ZAP  36, ZAP# 1, ZAPS 1, ZERO 1, ZIL# 1, ZIS# 35, ZVER 1, dctb 1, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 1, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! Expo 4.0.1 patch.fork: Mac resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 5, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 10, TEXT 2, ZAP  259, ZAP# 2, ZAPS 1, ZERO 1, ZIL# 3, ZIS# 256, ZVER 2, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 2, vers 2
mac4/Ho! 4 Updaters to 4.0.5/Spaceward Ho! Expo 4.0.1 patch.rsrc: AppleDouble resource fork: ALRT 8, BNDL 1, CNTL 1, CODE 5, DATA 1, DITL 11, DLOG 3, DREL 1, ERR# 1, FREF 1, ICN# 2, PICT 1, SIZE 3, STR# 10, TEXT 2, ZAP  259, ZAP# 2, ZAPS 1, ZERO 1, ZIL# 3, ZIS# 256, ZVER 2, icl4 1, icl8 1, ics# 1, ics4 1, ics8 1, styl 2, vers 2
ho301/app.rsrc: Mac resource fork: ALRT 52, BNDL 1, CDEF 6, CNTL 19, CODE 26, CURS 8, DITL 96, DLOG 43, FREF 4, ICN# 131, LDEF 3, MBAR 1, MENU 10, MaTh 3, PICT 146, Reqd 1, SH3∆ 1, SIZE 1, STR# 29, Stup 1, TMPL 2, WDEF 3, acur 1, dctb 2, icl4 4, icl8 4, ics# 73, ics4 4, ics8 4, snd  21, vers 2
ho301c/Spaceward Ho! 3.0 Color.img: HFS disk image
    Ho! 3.0 Color Picts: PICT 30, PPMp 132, RGN  2, TMPL 1, ckid 1, icl8 167, ics8 69
mac201/6d53558a-Spaceward_Ho_v2.01/Spaceward Ho v2.01 - Disk 1 - Program.dc42: HFS disk image
    Spaceward Ho! 2.0.1: ALRT 51, BNDL 1, CDEF 5, CNTL 14, CODE 23, CURS 8, DITL 78, DLOG 26, FREF 4, ICN# 90, LDEF 3, MBAR 1, MENU 8, MaTh 3, PICT 241, Reqd 1, SH2∆ 1, SIZE 1, STR# 25, Stup 1, TMPL 1, WDEF 3, acur 1, dctb 1, icl4 4, icl8 92, ics# 62, ics4 3, ics8 62, snd  13, vers 2
    TeachText 1.2: ALRT 5, BNDL 1, CODE 3, DITL 4, FREF 3, ICN# 3, MENU 3, SIZE 1, STR# 1, WIND 1, ttxt 1, vers 2
mac201/6d53558a-Spaceward_Ho_v2.01/Spaceward Ho v2.01 - Disk 2 - Color Pictures.dc42: HFS disk image
    TheHo Color Picts: PICT 13, PPMp 231, TMPL 1
ho12/The Ho! 1.2/._Icon
: data (0005160700020000)
ho12/The Ho! 1.2/._TheHo 1.2 : AppleDouble resource fork: ALRT 53, BNDL 1, CDEF 6, CNTL 11, CODE 23, CURS 8, DITL 72, DLOG 20, FREF 4, ICN# 90, LDEF 3, MBAR 1, MENU 8, MaTh 3, PICT 242, Reqd 1, SH2∆ 1, SIZE 1, STR# 23, Stup 1, TMPL 1, WDEF 4, acur 1, dctb 1, icl4 4, icl8 92, ics# 62, ics4 3, ics8 62, snd  13, vers 2
ho12/The Ho! 1.2/._Voie Lactée: AppleDouble resource fork: FlEt 2, PlYr 2, ViEw 2
ho12/The Ho! 1.2/Voie Lactée: data (29bf5e2929bc5e3b)
win/SpcHo3x/CD/SPACEHO.EXE: Windows PE program: 240 3, RT_ACCELERATOR 2, RT_BITMAP 684, RT_CURSOR 28, RT_DIALOG 47, RT_GROUP_CURSOR 16, RT_GROUP_ICON 2, RT_ICON 2, RT_MENU 1, RT_STRING 93, RT_VERSION 1, WAVE 37
win/SpcHo3x/STARHILL/SCI-FI/WINHO/HOCOLOR.DLL: Windows NE (16-bit) program: 15 1, 32513 241, 32514 92, 32515 62, 32516 78, 32517 62
win/SpcHo3x/STARHILL/SCI-FI/WINHO/HOHELP.HLP: data (3f5f03003b090000)
win/SpcHo3x/STARHILL/SCI-FI/WINHO/HOMONO.DLL: Windows NE (16-bit) program: 15 1, 32513 240, 32514 90, 32515 62, 32516 76, 32517 62
win/SpcHo3x/STARHILL/SCI-FI/WINHO/LOGFILE.IDX: data (633a5c7374617268)
win/SpcHo3x/STARHILL/SCI-FI/WINHO/README.TXT: data (0d0a09496d706f72)
win/SpcHo3x/STARHILL/SCI-FI/WINHO/THE_HO!.PRF: DOS 2.0 PRS resource file: LIC 1, PRF 1
win/SpcHo3x/STARHILL/SCI-FI/WINHO/UNINSTAL.EXE: Windows NE (16-bit) program: RT_GROUP_ICON 1, RT_ICON 1
win/SpcHo3x/STARHILL/SCI-FI/WINHO/WINHO.EXE: Windows NE (16-bit) program: 15 1, 32513 38, 32514 1, 32515 14, RT_ACCELERATOR 1, RT_BITMAP 1, RT_DIALOG 33, RT_GROUP_ICON 2, RT_ICON 2, RT_MENU 1, RT_RCDATA 3, RT_STRING 48
win/SpcHo3x/STARHILL/SCI-FI/WINHO/WINHO.WRI: data (32be000000ab0000)
dos/Spacewar/HO/DEARJ.EXE: DOS program
dos/Spacewar/HO/DOSHO.EXE: DOS program
dos/Spacewar/HO/HO!.CFG: data (01010a0520020700)
dos/Spacewar/HO/HO!.ICO: data (0000010001002020)
dos/Spacewar/HO/HO!.NWC: data (60ea27001e040100)
dos/Spacewar/HO/HO.BAT: data (406563686f206f66)
dos/Spacewar/HO/HO.PRS: DOS 2.0 PRS resource file: BMP 1, DIB 2, ILM 92, ISM 62, PFN 18, SFN 1, SND 14, STR 1
dos/Spacewar/HO/HOCOLOR.PRS: DOS 2.0 PRS resource file: DIB 243, IL8 92, IS8 62
dos/Spacewar/HO/HOMONO.PRS: DOS 2.0 PRS resource file: DIB 243, IL2 90, IS2 62
dos/Spacewar/HO/INSTALL.EXE: DOS program
dos/Spacewar/HO/SOUND.NWC: data (2300996228082e3d)
dos/Spacewar/HO/SOUNDRV.COM: data (e91a0c4449475041)
dos/Spacewar/HO/THE_HO!.PRF: DOS 2.0 PRS resource file: LIC 1, PRF 1
palm4/Spaceward Ho! for Palm OS/How To Play.url: data (5b44454641554c54)
palm4/Spaceward Ho! for Palm OS/License.txt: data (2d2d2d2d2d2d2d2d)
palm4/Spaceward Ho! for Palm OS/Release Notes.txt: data (5370616365776172)
palm4/Spaceward Ho! for Palm OS/Spaceward Ho.prc: Palm database (appl/PaHo): ATAB 2, MBAR 4, MENU 1, RAND 1, RANK 1, Talt 18, Tbmp 201, code 8, data 2, tAIB 2, tAIN 1, tFRM 30, tSTL 26, tSTR 6, taic 1, tver 1
```
