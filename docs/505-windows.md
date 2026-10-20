# Spaceward Ho! 5.0.5: windows, strings and menus

Every window layout, string list, menu and text style in the resource file of the Mac
Spaceward Ho! 5.0.5 (2003, `Spaceward Ho!.app/Contents/Resources/Spaceward Ho!.rsrc`).
5.0.5 is built with Metrowerks PowerPlant: its windows are `PPob` resources (a stream of
objects, read by `tools/extract/ppob.py`), each with a `WIND` (title and size) and a `RidL`
(the controls the code listens to), not the Toolbox's `DLOG`/`DITL` (only two of those,
the system's folder dialogs, and nine `ALRT`s). Research before October 2026 read only the
`DLOG`/`DITL` and so recorded the rank window, the Radical Research window, the auto play
settings and "You have conquered the galaxy!" as missing; they are all here. What the code
does with each window is in `docs/original-findings.md` (section 14, "The windows, from
their layouts"); which windows the remake builds from them is in `docs/coverage-505.md`.

Regenerate with:

    python3 tools/extract/ppob.py "<...>/Contents/Resources/Spaceward Ho!.rsrc" --md docs/505-windows.md --title "Spaceward Ho! 5.0.5: windows, strings and menus" --intro <this paragraph>

PPob 501-503 are the hidden debug windows (God View's terraforming test, the computers'
attributes, a battle simulator); 128-132, 134, 135, 144, 148, 161, 164, 169, 170 and
1000-1001 belong to network play and registration, which the remake doesn't have.

Written by `tools/extract/ppob.py`. Frames are (left, top, width x height) in the parent pane; each pane's sub-panes are listed top to bottom, then left to right (the stream's own order is in the JSON); "Txtr n" is a text style (the table at the end).

Resource types: ALRT 9, BNDL 1, CNTL 2, CTYP 40, CURS 15, CuSt 13, DITL 11, DLGX 1, DLOG 2, FREF 2, Ho5c 1, ICN# 2, MBAR 2, MENU 37, MPSR 1, MWBB 1, Mcmd 15, NoPt 1, PICT 140, PPob 50, RidL 50, SIZE 1, STR# 33, Txtr 17, WIND 50, actb 1, aedt 4, aete 1, carb 1, cfrg 1, cicn 3, dftb 1, icl8 2, icns 2, ics# 25, ics8 25, ictb 1, snd  44, wctb 47, xmnu 15.

## Window layouts (PPob)

### PPob 128 "Connect To Server Dialog"

WIND 128: title "Connect To Spaceward Ho! Server", 383 x 180 at (40, 40), proc 5.
RidL 128 (listened to): 'HOST', 'NAME', 1, 2, 'fmal', 'male', 'PORT'.

- `dlog` WIND 128, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 1, cancel 2
  - `wtha` brushes [5, 6, 1, 2]
  - `tbgv` id 0 (0, 0, 383 x 180) bound LTRB
    - `etxt` id 'HOST' (194, 9, 175 x 27) "spacewardho.net" maxChars 255 Txtr 128
    - `stxt` id 0 (11, 14, 180 x 16) "Server Name/IP Address:" Txtr 128
    - `etxt` id 'PORT' (194, 40, 175 x 26) "5010" maxChars 5 Txtr 128 disabled
    - `stxt` id 0 (10, 44, 180 x 16) "Port Number:" Txtr 128
    - `etxt` id 'NAME' (194, 73, 175 x 26) "Peter" maxChars 15 Txtr 128
    - `stxt` id 0 (10, 78, 180 x 16) "Connect As:" Txtr 128
    - `rgpv` id 0 (10, 106, 356 x 25)
      - `rdbt` id 'male' (180, 4, 80 x 18) "Male" value 1 min 0 max 2 Txtr 128
      - `rdbt` id 'fmal' (268, 4, 80 x 18) "Female" value 0 min 0 max 2 Txtr 128
    - `stxt` id 0 (10, 110, 70 x 16) "Gender:" Txtr 128
    - `push` id 2 (219, 144, 69 x 20) "Cancel" Txtr 128 message 901 bound RB
    - `push` id 1 (300, 144, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB

### PPob 129 "Terminal Window"

WIND 129: title "Debugging Log Window", 502 x 286 at (6, 44), proc 8.

- `wind` WIND 129, regular, close box, title bar, resizable, size box, zoomable, enabled, targetable, erase on update, min [64, 64]
  - `wtha` brushes [15, 15, 0, 0]
  - `sclv` id 2 (-1, -1, 504 x 288) scrollingView 'TERM' image [16, 205] bound LTRB
    - `view` id 'TERM' (2, 2, 485 x 269) bound LTRB
      - `cers` message 811 more: `000000000000ffffffffffff`

### PPob 130 "Startup Dialog"

WIND 130: title "Spaceward Ho! 5", 304 x 384 at (40, 40), proc 5.
RidL 130 (listened to): 'name', 'lnam', 901, 902, 903, 900.

- `dlog` WIND 130, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `wtha` brushes [5, 6, 1, 2]
  - `tabg`
    - `aGUY` (LAnimatedGuy) id 0 (0, 0, 304 x 200)
    - `stxt` id 0 (2, 203, 100 x 18) "Name:" Txtr 128
    - `stxt` id 'name' (102, 203, 200 x 18) "Unregistered" Txtr 128
    - `stxt` id 0 (2, 223, 99 x 18) "Screen Name:" Txtr 128
    - `stxt` id 'lnam' (102, 223, 200 x 18) "Unregistered" Txtr 128
    - `stxt` id 0 (55, 249, 194 x 18) "What would you like to do?" Txtr 128
    - `push` id 900 (67, 285, 69 x 20) "New…" Txtr 128 message 900 **default**
    - `push` id 903 (168, 285, 69 x 20) "Open…" Txtr 128 message 903
    - `push` id 902 (93, 318, 130 x 20) "spacewardho.net" Txtr 128 message 902
    - `push` id 901 (124, 350, 69 x 20) "Quit" Txtr 128 message 901

### PPob 131 "GamesWindow"

WIND 131: title "Spaceward Ho! Network Lobby", 630 x 420 at (6, 44), proc 8.
RidL 131 (listened to): 'ggbx', 1001, 'gsum', 1000, 1002, 1003, 'pgbx', 'entr'.

- `GAwi` (LGamesWindow) WIND 131, regular, close box, title bar, resizable, size box, zoomable, enabled, targetable, erase on update, min [600, 400]
  - `wtha` brushes [5, 6, 5, 6]
  - `pict` id 0 (0, 0, 428 x 50) PICT 3500 image [428, 50] bound LT
  - `aoPC` (LAnimatedOffsetPICT) id 0 (428, 0, 94 x 50) bound LTR {Num Images: 1, Forward and Back?: 0, First PICT Res ID: 3501, Ticks Per Frame: 1000, Relative Left: -1, Relative Top: -1, Relative Right: -1, Relative Bottom: -1}
  - `aoPC` (LAnimatedOffsetPICT) id 0 (522, 0, 108 x 50) bound TR {Num Images: 6, Forward and Back?: 1, First PICT Res ID: 3550, Ticks Per Frame: 10, Relative Left: -7, Relative Top: -52, Relative Right: 123, Relative Bottom: 102}
  - `tgbx` id 'pgbx' (2, 52, 626 x 210) "Players" group box Txtr 132 bound LTRB
    - `HOrv` (LHoResizerView) id 'res2' (395, 9, 3 x 200) bound LTB {Top Item Pane ID: 'lpDB', Bottom Item Pane ID: 'chsv', Top Item Min. Size: 150, Bottom Item Min. Size: 150, 2nd Top Item Pane ID: 0, 2nd Bottom Pane ID: 'entr'}
    - `sclv` id 'chsv' (400, 16, 220 x 152) scrollingView 'chat' image [16, 1] bound LTRB
      - `txtv` id 'chat' (2, 2, 201 x 148) TEXT 0 Txtr 130 image [284, 148] bound LTRB
    - `etxS` (LEditTextSubmitter) id 'entr' (399, 170, 223 x 36) edit text maxChars 127 Txtr 130 bound LRB {Ignore Tabs: 1}
  - `lpDB` (LLobbyPlayersDataBrowser) id 'lpDB' (7, 65, 389 x 194) bound LTB {Pass On Control Chars: 0, Pass On Other Chars: 1}
  - `HOrv` (LHoResizerView) id 'resz' (0, 262, 630 x 3) bound LRB {Top Item Pane ID: 'pgbx', Bottom Item Pane ID: 'ggbx', Top Item Min. Size: 150, Bottom Item Min. Size: 150, 2nd Top Item Pane ID: 'lpDB', 2nd Bottom Pane ID: 'Glst'}
  - `tgbx` id 'ggbx' (2, 265, 626 x 152) "Games" group box Txtr 132 bound LRB
    - `Hsmv` (LHoSampleMapView) id 'HMAP' (332, 16, 100 x 100) image [100, 100] disabled bound TR {Galaxy Size Control: 0, Galaxy Density Control: 0, Galaxy Shape Control: 0, Randomize Button: 0, Num Humans Popup: 0, Num Computer Popup: 0, Computer IQ: 0, Player Home System: 0, Computer Home System: 0, Time Limit: 0, Humans BB checkbox: 0, Computers BB checkbox: 0, Text Summary Pane ID: 'gsum'}
    - `stxt` id 'gsum' (435, 16, 185 x 100) Txtr 130 bound TR
    - `push` id 1000 (396, 123, 78 x 20) "Join" message 5003 bound RB
    - `push` id 1002 (396, 123, 79 x 20) "Rejoin" message 5019 bound RB
    - `push` id 1003 (503, 123, 78 x 20) "New…" message 5002 bound RB
    - `push` id 1001 (451, 128, 78 x 20) "Disband" message 5009 hidden disabled bound RB
  - `GdtB` (LGamesDataBrowser) id 'Glst' (6, 279, 324 x 134) bound LRB {Pass On Control Chars: 0, Pass On Other Chars: 1}

### PPob 132 "Create Server Game"

WIND 132: title "Host New Game", 450 x 418 at (40, 40), proc 5.
RidL 132 (listened to): 'NumH', 'NAME', 'Ally', 'Luck', 'Gdif', 'Rand', 'HumS', 'CNCL', 'OPEN', 'NumC', 'Gshp', 'GalS', 'GalD', 'YrPT', 'CpIQ', 'mxIQ', 'ComS', 'cbud', 'CIQT', 'TTLT', 'PSWD', 'hals'.

- `dlog` WIND 132, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 'OPEN', cancel 'CNCL'
  - `tabg`
    - `etxt` id 'PSWD' (317, 2, 120 x 23) maxChars 31 Txtr 206 hidden disabled
    - `etxt` id 'NAME' (140, 3, 120 x 25) "Milky Way" maxChars 31 Txtr 206
    - `stxt` id 0 (305, 4, 100 x 14) "Password:" Txtr 202 hidden disabled
    - `stxt` id 0 (18, 8, 100 x 14) "Galaxy Name:" Txtr 202
    - `stxt` id 0 (12, 31, 86 x 15) "Human Players" Txtr 206
    - `sepl` id 0 (100, 40, 332 x 3)
    - `popb` id 'NumH' (201, 50, 220 x 16) "Number of Humans:" popup button, fixed width MENU 206 initialItem 4 titleWidth 120 Txtr 130 message 'NumH' hidden disabled
    - `popb` id 'HumS' (139, 54, 140 x 17) popup button, fixed width MENU 208 initialItem 1 titleWidth 0 Txtr 206 message 'HumS'
    - `stxt` id 0 (19, 55, 100 x 14) "Home System:" Txtr 202
    - `chbx` id 'hals' (139, 78, 189 x 18) "All Humans Are Best Buddies" value 1 min 0 max 2 Txtr 206 message 'hals'
    - `stxt` id 0 (12, 97, 96 x 14) "Computer Players" Txtr 206
    - `sepl` id 0 (106, 106, 326 x 3)
    - `popb` id 'NumC' (140, 116, 80 x 17) popup button, fixed width MENU 207 initialItem 2 titleWidth 0 Txtr 206 message 'NumC'
    - `slUP` (LSliderUpdater) id 'CpIQ' (322, 116, 100 x 18) slider, live, ticks value 50 min 50 max 200 ticks 2 message 'CpIQ' {Updater Pane ID: 'CIQT'}
    - `stxt` id 0 (18, 117, 100 x 14) "Bad Guys:" Txtr 202
    - `stxt` id 0 (252, 117, 30 x 14) "IQ:" Txtr 202
    - `stxt` id 'CIQT' (284, 117, 30 x 14) "999" Txtr 206
    - `stxt` id 0 (317, 140, 25 x 14) "50" Txtr 205
    - `stxt` id 'mxIQ' (400, 140, 30 x 14) "200" Txtr 205
    - `popb` id 'ComS' (140, 145, 140 x 17) popup button, fixed width MENU 217 initialItem 9 titleWidth 0 Txtr 206 message 'ComS'
    - `stxt` id 0 (18, 146, 100 x 14) "Home System:" Txtr 202
    - `chbx` id 'cbud' (328, 158, 92 x 16) "Best Buddies" value 1 min 0 max 2 Txtr 206 message 'cbud'
    - `stxt` id 0 (12, 173, 40 x 14) "Galaxy" Txtr 206
    - `sepl` id 0 (51, 182, 381 x 3)
    - `Hsmv` (LHoSampleMapView) id 'HMAP' (57, 194, 120 x 120) image [120, 120] disabled {Galaxy Size Control: 'GalS', Galaxy Density Control: 'GalD', Galaxy Shape Control: 'Gshp', Randomize Button: 'Rand', Num Humans Popup: 'NumH', Num Computer Popup: 'NumC', Computer IQ: 'CpIQ', Player Home System: 'HumS', Computer Home System: 'ComS', Time Limit: 'TTLT', Humans BB checkbox: 'hals', Computers BB checkbox: 'cbud', Text Summary Pane ID: 0}
    - `popb` id 'Gshp' (261, 197, 120 x 17) popup button, fixed width MENU 205 initialItem 1 titleWidth 0 Txtr 206 message 'Gshp'
    - `stxt` id 0 (188, 198, 50 x 14) "Shape:" Txtr 202
    - `slid` id 'GalS' (261, 224, 150 x 18) slider, live, ticks value 50 min 0 max 100 ticks 2 message 'GalS'
    - `stxt` id 0 (188, 225, 50 x 14) "Size:" Txtr 202
    - `stxt` id 0 (242, 249, 50 x 14) "Small" Txtr 205
    - `stxt` id 0 (377, 249, 50 x 14) "Large" Txtr 205
    - `push` id 'Rand' (387, 269, 69 x 20) "Randomize" Txtr 130 message 'Rand' hidden disabled
    - `slid` id 'GalD' (261, 273, 150 x 18) slider, live, ticks value 25 min 0 max 100 ticks 2 message 'GalD'
    - `stxt` id 0 (188, 278, 50 x 14) "Density:" Txtr 202
    - `stxt` id 0 (242, 298, 50 x 14) "Dense" Txtr 205
    - `stxt` id 0 (377, 298, 50 x 14) "Sparse" Txtr 205
    - `stxt` id 0 (12, 316, 40 x 14) "Details" Txtr 206
    - `sepl` id 0 (51, 325, 381 x 3)
    - `chbx` id 'Ally' (269, 335, 150 x 16) "Alliances" value 1 min 0 max 2 Txtr 206 hidden disabled
    - `popb` id 'YrPT' (142, 336, 120 x 17) popup button, fixed width MENU 204 initialItem 1 titleWidth 0 Txtr 206
    - `stxt` id 0 (18, 337, 100 x 14) "Years Per Turn:" Txtr 202
    - `chbx` id 'Luck' (269, 355, 150 x 16) "Luck in Battles" value 1 min 0 max 2 Txtr 206 hidden disabled
    - `popb` id 'TTLT' (142, 362, 120 x 17) popup button, fixed width MENU 209 initialItem 5 titleWidth 0 Txtr 206 message 'TTLT'
    - `stxt` id 0 (18, 363, 100 x 14) "Turn Time Limit:" Txtr 202
    - `chbx` id 0 (90, 365, 150 x 18) "Fair Start" value 0 min 0 max 2 Txtr 130 hidden disabled
    - `push` id 'CNCL' (272, 381, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 'OPEN' (359, 381, 69 x 20) "Create" Txtr 128 message 900 **default**
    - `stxt` id 0 (18, 388, 160 x 14) "Base Game Difficulty Rating:" Txtr 206
    - `stxt` id 'Gdif' (184, 388, 40 x 14) "<50>" Txtr 206
  - `wtha` brushes [5, 6, 1, 2]

### PPob 133 "Create Individual Game"

WIND 133: title "New Single Player Game", 447 x 402 at (40, 40), proc 5.
RidL 133 (listened to): 'NAME', 'Ally', 'Luck', 'Gdif', 'Rand', 'HumS', 'CNCL', 'OPEN', 'NumC', 'Gshp', 'GalS', 'GalD', 'TTLT', 'YrPT', 'CpIQ', 'mxIQ', 'ComS', 'cbud', 'CIQT'.

- `dlog` WIND 133, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 'OPEN', cancel 'CNCL'
  - `tabg`
    - `etxt` id 'NAME' (140, 3, 120 x 23) "Milky Way" maxChars 31 Txtr 206
    - `stxt` id 0 (18, 8, 100 x 14) "Galaxy Name:" Txtr 202
    - `stxt` id 0 (12, 28, 100 x 14) "Player Information" Txtr 206
    - `sepl` id 0 (112, 37, 320 x 3)
    - `popb` id 'HumS' (140, 50, 140 x 17) popup button, fixed width MENU 202 initialItem 1 titleWidth 0 Txtr 206 message 'HumS'
    - `stxt` id 0 (19, 51, 100 x 14) "Home System:" Txtr 202
    - `stxt` id 0 (12, 73, 96 x 14) "Computer Players" Txtr 206
    - `sepl` id 0 (106, 82, 326 x 3)
    - `popb` id 'NumC' (140, 92, 80 x 17) popup button, fixed width MENU 207 initialItem 2 titleWidth 0 Txtr 206 message 'NumC'
    - `slUP` (LSliderUpdater) id 'CpIQ' (322, 92, 100 x 18) slider, live, ticks value 50 min 50 max 200 ticks 2 message 'CpIQ' {Updater Pane ID: 'CIQT'}
    - `stxt` id 0 (18, 93, 100 x 14) "Bad Guys:" Txtr 202
    - `stxt` id 0 (252, 93, 30 x 14) "IQ:" Txtr 202
    - `stxt` id 'CIQT' (284, 93, 30 x 14) "999" Txtr 206
    - `stxt` id 0 (317, 116, 25 x 14) "50" Txtr 205
    - `stxt` id 'mxIQ' (400, 116, 30 x 14) "200" Txtr 205
    - `popb` id 'ComS' (140, 123, 140 x 17) popup button, fixed width MENU 217 initialItem 9 titleWidth 0 Txtr 206 message 'ComS'
    - `stxt` id 0 (18, 124, 100 x 14) "Home System:" Txtr 202
    - `chbx` id 'cbud' (309, 133, 92 x 16) "Best Buddies" value 1 min 0 max 2 Txtr 206 message 'cbud'
    - `stxt` id 0 (12, 149, 40 x 14) "Galaxy" Txtr 206
    - `sepl` id 0 (51, 158, 381 x 3)
    - `Hsmv` (LHoSampleMapView) id 'HMAP' (57, 170, 120 x 120) image [120, 120] disabled {Galaxy Size Control: 'GalS', Galaxy Density Control: 'GalD', Galaxy Shape Control: 'Gshp', Randomize Button: 'Rand', Num Humans Popup: 'NumH', Num Computer Popup: 'NumC', Computer IQ: 'CpIQ', Player Home System: 'HumS', Computer Home System: 'ComS', Time Limit: 'TTLT', Humans BB checkbox: 0, Computers BB checkbox: 'cbud', Text Summary Pane ID: 0}
    - `popb` id 'Gshp' (261, 173, 120 x 17) popup button, fixed width MENU 205 initialItem 1 titleWidth 0 Txtr 206 message 'Gshp'
    - `stxt` id 0 (188, 174, 50 x 14) "Shape:" Txtr 202
    - `slid` id 'GalS' (261, 200, 150 x 18) slider, live, ticks value 50 min 0 max 100 ticks 2 message 'GalS'
    - `stxt` id 0 (188, 201, 50 x 14) "Size:" Txtr 202
    - `stxt` id 0 (242, 225, 50 x 14) "Small" Txtr 205
    - `stxt` id 0 (377, 225, 50 x 14) "Large" Txtr 205
    - `push` id 'Rand' (387, 245, 69 x 20) "Randomize" Txtr 130 message 'Rand' hidden disabled
    - `slid` id 'GalD' (261, 249, 150 x 18) slider, live, ticks value 25 min 0 max 100 ticks 2 message 'GalD'
    - `stxt` id 0 (188, 254, 50 x 14) "Density:" Txtr 202
    - `stxt` id 0 (242, 274, 50 x 14) "Dense" Txtr 205
    - `stxt` id 0 (377, 274, 50 x 14) "Sparse" Txtr 205
    - `stxt` id 0 (12, 292, 40 x 14) "Details" Txtr 206
    - `sepl` id 0 (51, 301, 381 x 3)
    - `chbx` id 'Ally' (269, 311, 150 x 16) "Alliances" value 1 min 0 max 2 Txtr 206 hidden disabled
    - `popb` id 'YrPT' (142, 319, 100 x 17) popup button, fixed width MENU 204 initialItem 1 titleWidth 0 Txtr 206
    - `stxt` id 0 (18, 320, 100 x 14) "Years Per Turn:" Txtr 202
    - `popb` id 'TTLT' (31, 331, 190 x 17) "((Turn Time Limit:))" popup button, fixed width MENU 209 initialItem 1 titleWidth 122 Txtr 202 message 'TTLT' hidden disabled
    - `chbx` id 'Luck' (269, 331, 150 x 16) "Luck in Battles" value 1 min 0 max 2 Txtr 206 hidden disabled
    - `push` id 'CNCL' (272, 361, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 'OPEN' (359, 361, 69 x 20) "Create" Txtr 128 message 900 **default**
    - `stxt` id 0 (18, 364, 140 x 14) "Game Difficulty Rating:" Txtr 203
    - `stxt` id 'Gdif' (164, 364, 40 x 14) "<50>" Txtr 203
  - `wtha` brushes [5, 6, 1, 2]

### PPob 134 "Joining Game Progress Dlg"

WIND 134: title "Rebuilding Game…", 292 x 83 at (40, 40), proc 1.
RidL 134 (listened to): 'amnt'.

- `dlog` WIND 134, modal, enabled, targetable, erase on update, min [64, 64] default button -1, cancel -1
  - `wtha` brushes [1, 2, 1, 2]
  - `stxt` id 0 (9, 11, 180 x 16) "One Moment Please…" Txtr 128
  - `pbar` id 'amnt' (21, 41, 250 x 14) progress bar value 0 min 0 max 100

### PPob 135 "PreStart Window"

WIND 135: title "PreStart", 600 x 400 at (6, 44), proc 8.
RidL 135 (listened to): 'entr', 'gsum', 1002, 1003, 1001.

- `PSwi` (LPreStartWindow) WIND 135, regular, title bar, resizable, size box, zoomable, enabled, targetable, erase on update, min [600, 400]
  - `wtha` brushes [5, 6, 5, 6]
  - `tgbx` id 0 (13, 12, 315 x 120) "Game Details" group box Txtr 132 bound LT
    - `Hsmv` (LHoSampleMapView) id 'HMAP' (5, 15, 100 x 100) image [120, 120] disabled bound LTRB {Galaxy Size Control: 0, Galaxy Density Control: 0, Galaxy Shape Control: 0, Randomize Button: 0, Num Humans Popup: 0, Num Computer Popup: 0, Computer IQ: 0, Player Home System: 0, Computer Home System: 0, Time Limit: 0, Humans BB checkbox: 0, Computers BB checkbox: 0, Text Summary Pane ID: 'gsum'}
    - `stxt` id 'gsum' (108, 15, 202 x 100) Txtr 130 bound LTRB
  - `tgbx` id 0 (340, 12, 247 x 331) "Chat Room:" group box Txtr 132 bound LTRB
    - `sclv` id 0 (4, 14, 239 x 313) scrollingView 'chat' image [16, 1] bound LTRB
      - `txtv` id 'chat' (1, 1, 220 x 311) TEXT 0 Txtr 130 image [220, 274] bound LTRB
  - `PdtB` (LPlayersDataBrowser) id 'Plst' (12, 136, 315 x 206) bound LTB {Pass On Control Chars: 0, Pass On Other Chars: 1}
  - `push` id 1002 (14, 354, 90 x 20) "Start Game" message 5007 bound LB
  - `push` id 1003 (124, 354, 90 x 20) "Boot" message 5030 bound LB
  - `push` id 1001 (234, 354, 90 x 20) "Leave" message 5010 bound LB
  - `etxS` (LEditTextSubmitter) id 'entr' (340, 354, 248 x 22) edit text maxChars 127 Txtr 130 bound RB {Ignore Tabs: 1}

### PPob 136 "Map Window"

WIND 136: title "<<Map Window>>", 643 x 435 at (6, 44), proc 8.
RidL 136 (listened to): 'Bscr', 9900, 9901, 9902, 9903, 9904, 9905, 9906, 9907, 9908, 9909, 'Send', 'STpp', 'entr'.

- `MAwi` (LMapWindow) WIND 136, regular, close box, title bar, resizable, size box, zoomable, enabled, targetable, min [540, 365]
  - `wtha` brushes [15, 15, 0, 0]
  - `view` id 'INcn' (0, 0, 197 x 435) bound LTB
    - `Hinc` (LHoIncomeView) id 'Hinc' (0, 0, 197 x 40) bound LT
    - `Hbar` (LHoBarControl) id 'TBAR' (0, 40, 197 x 87) bound LT {Bar Control Type: 1, Bar Width: 133, Bar Space: 7, Bar Height: 7, Left Space: 64, Scrollbar Pane ID: 0}
    - `Hbar` (LHoBarControl) id 'PBAR' (0, 127, 181 x 85) image [181, 150] bound LTB {Bar Control Type: 2, Bar Width: 115, Bar Space: 7, Bar Height: 7, Left Space: 63, Scrollbar Pane ID: 'Bscr'}
    - `view` id 0 (181, 127, 16 x 33) bound LT
      - `eras`
    - `sbar` id 'Bscr' (181, 160, 16 x 53) scroll bar, live value 0 min 0 max 0 message 6018 bound LTB
    - `HOrv` (LHoResizerView) id 'resz' (0, 212, 197 x 3) bound LB {Top Item Pane ID: 'PBAR', Bottom Item Pane ID: 'plSC', Top Item Min. Size: 85, Bottom Item Min. Size: 60, 2nd Top Item Pane ID: 'Bscr', 2nd Bottom Pane ID: 0}
    - `sclv` id 'plSC' (0, 214, 197 x 131) scrollingView 'plvw' image [16, 1] bound LB
      - `Hpll` (LHoPlayerListView) id 'plvw' (1, 1, 180 x 130) bound LTRB
    - `Hgrf` (LHoGraphView) id 'grvw' (0, 345, 197 x 90) bound LB
      - `bbut` id 9900 (3, 70, 18 x 18) bevel button (small) value 0 min 259 max 9900 message 9900 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Income"}
      - `bbut` id 9901 (22, 70, 18 x 18) bevel button (small) value 0 min 259 max 9901 message 9901 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Metal"}
      - `bbut` id 9902 (41, 70, 18 x 18) bevel button (small) value 0 min 259 max 9902 message 9902 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Savings"}
      - `bbut` id 9903 (60, 70, 18 x 18) bevel button (small) value 0 min 259 max 9903 message 9903 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Ship Power"}
      - `bbut` id 9904 (79, 70, 18 x 18) bevel button (small) value 0 min 259 max 9904 message 9904 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Rank vs. Other Players"}
      - `bbut` id 9905 (98, 70, 18 x 18) bevel button (small) value 0 min 259 max 9905 message 9905 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Range vs. Other Players"}
      - `bbut` id 9906 (117, 70, 18 x 18) bevel button (small) value 0 min 259 max 9906 message 9906 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Speed vs. Other Players"}
      - `bbut` id 9907 (136, 70, 18 x 18) bevel button (small) value 0 min 259 max 9907 message 9907 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Weapons vs. Other Players"}
      - `bbut` id 9908 (155, 70, 18 x 18) bevel button (small) value 0 min 259 max 9908 message 9908 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Shields vs. Other Players"}
      - `bbut` id 9909 (174, 70, 18 x 18) bevel button (small) value 0 min 259 max 9909 message 9909 more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Mini vs. Other Players"}
  - `sclv` id 'Mscr' (197, 0, 447 x 377) scrollingView 'MAPV' image [16, 1] bound LTRB
    - `Hmap` (LHoMapView) id 'MAPV' (1, 1, 430 x 360) bound LTRB
  - `Hend` (LHoEndTurnView) id 'Hend' (204, 274, 83 x 83) bound L
  - `Hmsg` (LHoMessageView) id 'Hmsg' (293, 276, 221 x 80) bound L
  - `HOrv` (LHoResizerView) id 'cres' (196, 376, 447 x 4) bound LRB {Top Item Pane ID: 'Mscr', Bottom Item Pane ID: 'Sdvw', Top Item Min. Size: 150, Bottom Item Min. Size: 56, 2nd Top Item Pane ID: 0, 2nd Bottom Pane ID: 0}
  - `view` id 'Sdvw' (196, 379, 447 x 58) bound LRB
    - `eras`
    - `sclv` id 0 (0, 0, 448 x 35) scrollingView 'chat' image [16, 1] bound LTRB
      - `txtv` id 'chat' (2, 2, 428 x 31) TEXT 0 Txtr 130 image [410, 30] bound LTRB
    - `etxS` (LEditTextSubmitter) id 'entr' (160, 35, 273 x 22) edit text maxChars 191 Txtr 130 bound LRB {Ignore Tabs: 1}
    - `popb` id 'STpp' (51, 38, 108 x 16) popup button, fixed width MENU 201 initialItem 1 titleWidth 65535 Txtr 206 message 6016 bound LB
    - `stxt` id 'Send' (2, 39, 49 x 15) "Send To:" Txtr 206 bound LB

### PPob 137 "Build Ships Dialog"

WIND 137: title "Build Ships", 622 x 417 at (40, 40), proc 5.
RidL 137 (listened to): 901, 'NAME', 900, 'n2bl', 'nsld', 'maxn', 'mony', 'metl', 'adbt', 6014, 'DeCL', 'MetC', 'ProC', 'DevC', 'numB', 'numE', 1024, 1004, 1034, 1033, 1003, 1023, 1002, 1022, 1032, 1001, 1021, 1031, 1000, 1020, 1030, 1011, 1012, 1013, 1014, 1010, 'TYPE', 'maxO', 'bcap'.

- `BSwi` (LBuildShipsWindow) WIND 137, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `StdB` (LShipTypesDataBrowser) id 'stcv' (6, 6, 150 x 405) bound LTB {Pass On Control Chars: 0, Pass On Other Chars: 1}
    - `stxt` id 'DeCL' (191, 9, 65 x 14) "Dev Cost:" Txtr 135
    - `stxt` id 'DevC' (260, 9, 65 x 14) "$100" Txtr 132
    - `Hstv` (LShipTypeView) id 'Hstv' (355, 9, 240 x 100)
    - `stxt` id 0 (191, 29, 65 x 14) "Pro Cost:" Txtr 135
    - `stxt` id 'ProC' (260, 29, 65 x 14) "$100" Txtr 132
    - `stxt` id 0 (191, 49, 65 x 14) "Metal Cost:" Txtr 135
    - `stxt` id 'MetC' (260, 49, 65 x 14) "$100" Txtr 132
    - `stxt` id 0 (217, 67, 40 x 14) "Built:" Txtr 135
    - `stxt` id 'numB' (261, 67, 30 x 14) "999" Txtr 132
    - `stxt` id 0 (192, 86, 65 x 14) "In Service:" Txtr 135
    - `stxt` id 'numE' (261, 86, 30 x 14) "999" Txtr 132
    - `etxt` id 'NAME' (166, 110, 180 x 24) maxChars 15 message 6009
    - `tgbx` id 0 (355, 113, 240 x 94) "Your Current Reserves:" group box Txtr 132
      - `Hpil` (LHoPiles) id 'monB' (26, 14, 100 x 72) image [120, 75] {Normal PICT ID: 4050, Disable PICT ID: 4051, Type (0=money,1=metal): 0}
      - `Hpil` (LHoPiles) id 'metB' (137, 14, 100 x 72) image [100, 50] {Normal PICT ID: 4060, Disable PICT ID: 4061, Type (0=money,1=metal): 1}
    - `popb` id 'TYPE' (198, 141, 115 x 16) popup button, fixed width MENU 210 initialItem 1 titleWidth 65535 Txtr 132 message 6005
    - `stxt` id 0 (161, 142, 32 x 14) "Type:" Txtr 135
    - `stxt` id 0 (216, 166, 53 x 14) "Range:" Txtr 135
    - `stxt` id 1030 (270, 166, 20 x 14) "0" Txtr 133
    - `slid` id 1000 (198, 182, 115 x 20) slider, live, non-directional value 0 min 0 max 1 ticks 0 message 6004
    - `stxt` id 1010 (174, 184, 20 x 14) "0" Txtr 135
    - `stxt` id 1020 (317, 184, 20 x 14) "0" Txtr 132
    - `stxt` id 0 (215, 207, 53 x 14) "Speed:" Txtr 135
    - `stxt` id 1031 (269, 207, 20 x 14) "0" Txtr 133
    - `tgbx` id 0 (355, 210, 240 x 120) "Number To Build:" group box Txtr 132
      - `etNA` (LEditTextNumberArrows) id 'n2bl' (21, 20, 50 x 24) "1" edit text maxChars 3 message 6012
      - `slid` id 'nsld' (94, 24, 85 x 20) slider, live value 1 min 0 max 1 ticks 2 message 6011
      - `stxt` id 0 (79, 25, 10 x 14) "0" Txtr 135
      - `stxt` id 'maxn' (185, 25, 40 x 14) "<10>" Txtr 132
      - `chbx` id 'adbt' (96, 51, 81 x 16) "Allow Debt" value 0 min 0 max 2 Txtr 132 message 6015 bound LB
      - `stxt` id 0 (86, 78, 38 x 14) "Money:" Txtr 135
      - `stxt` id 'mony' (132, 78, 100 x 14) "$100" Txtr 132
      - `stxt` id 0 (20, 88, 38 x 14) "Cost:" Txtr 132
      - `stxt` id 0 (86, 98, 38 x 14) "Metal:" Txtr 135
      - `stxt` id 'metl' (132, 98, 100 x 14) "1000" Txtr 132
    - `slid` id 1001 (198, 223, 115 x 20) slider, live, non-directional value 0 min 0 max 1 ticks 0 message 6004
    - `stxt` id 1011 (174, 225, 20 x 14) "0" Txtr 135
    - `stxt` id 1021 (317, 225, 20 x 14) "0" Txtr 132
    - `stxt` id 0 (215, 248, 53 x 14) "Weapons:" Txtr 135
    - `stxt` id 1032 (269, 248, 20 x 14) "0" Txtr 133
    - `slid` id 1002 (198, 264, 115 x 20) slider, live, non-directional value 0 min 0 max 1 ticks 0 message 6004
    - `stxt` id 1012 (174, 266, 20 x 14) "0" Txtr 135
    - `stxt` id 1022 (317, 266, 20 x 14) "0" Txtr 132
    - `stxt` id 0 (215, 289, 53 x 14) "Shields:" Txtr 135
    - `stxt` id 1033 (269, 289, 20 x 14) "0" Txtr 133
    - `slid` id 1003 (198, 305, 115 x 20) slider, live, non-directional value 0 min 0 max 1 ticks 2 message 6004
    - `stxt` id 1013 (174, 307, 20 x 14) "0" Txtr 135
    - `stxt` id 1023 (317, 307, 20 x 14) "0" Txtr 132
    - `stxt` id 0 (214, 330, 53 x 14) "Mini:" Txtr 135
    - `stxt` id 1034 (268, 330, 20 x 14) "0" Txtr 133
    - `stxt` id 0 (355, 335, 141 x 15) "Ship Build Capacity Left:" Txtr 132
    - `stxt` id 'bcap' (500, 335, 92 x 14) "10" Txtr 132
    - `slid` id 1004 (198, 346, 115 x 20) slider, live, non-directional value 0 min 0 max 1 ticks 2 message 6004
    - `stxt` id 1014 (174, 348, 20 x 14) "0" Txtr 135
    - `stxt` id 1024 (317, 348, 20 x 14) "0" Txtr 132
    - `push` id 'maxO' (215, 383, 80 x 20) "Max Out" Txtr 128 message 6006 bound LT
    - `push` id 901 (308, 383, 69 x 20) "Cancel" Txtr 128 message 901 bound RB
    - `push` id 6014 (390, 383, 130 x 20) "Build & Continue" Txtr 128 message 6014 bound RB
    - `push` id 900 (536, 383, 69 x 20) "Build" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 138 "Graph History Window"

WIND 138: title "Graph History", 600 x 320 at (40, 40), proc 1991.
RidL 138 (listened to): 9900, 9901, 9902, 9903, 9904, 9905, 9906, 9907, 9908, 9909.

- `GRwi` (LGraphHistoryWindow) WIND 138, floating, close box, title bar, resizable, size box, zoomable, enabled, targetable, erase on update, min [600, 130]
  - `tabg`
    - `Hgrf` (LHoGraphView) id 'grvw' (1, 1, 598 x 318) bound LTRB
      - `bbut` id 9900 (4, 259, 52 x 52) bevel button (small) value 0 min 256 max 9000 message 9900 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Money"}
      - `bbut` id 9901 (64, 259, 52 x 52) bevel button (small) value 0 min 256 max 9001 message 9901 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Metal"}
      - `bbut` id 9902 (122, 259, 52 x 52) bevel button (small) value 0 min 256 max 9002 message 9902 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Ship Money"}
      - `bbut` id 9903 (181, 259, 52 x 52) bevel button (small) value 0 min 256 max 9003 message 9903 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Ship Power"}
      - `bbut` id 9904 (240, 259, 52 x 52) bevel button (small) value 0 min 256 max 9004 message 9904 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Rank vs. Other Players"}
      - `bbut` id 9905 (299, 259, 52 x 52) bevel button (small) value 0 min 256 max 9005 message 9905 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Range vs. Other Players"}
      - `bbut` id 9906 (358, 259, 52 x 52) bevel button (small) value 0 min 256 max 9006 message 9906 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Speed vs. Other Players"}
      - `bbut` id 9907 (417, 259, 52 x 52) bevel button (small) value 0 min 256 max 9007 message 9907 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Weapons vs. Other Players"}
      - `bbut` id 9908 (476, 259, 52 x 52) bevel button (small) value 0 min 256 max 9008 message 9908 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Shields vs. Other Players"}
      - `bbut` id 9909 (534, 259, 52 x 52) bevel button (small) value 0 min 256 max 9009 message 9909 bound LB more: `000100000000000000000000000000`
        - `hatt` (LHintAttachment) {Hint Text: "Mini vs. Other Players"}
  - `wtha` brushes [1, 2, 1, 2]

### PPob 139 "Preferences"

WIND 139: title "Preferences", 429 x 300 at (40, 40), proc 5.
RidL 139 (listened to): 'shem', 'msti', 'revb', 'hint', 'bbex', 'temp', 'auto', 'brsp', 'snds', 'vocl', 901, 900, 'psex'.

- `dlog` WIND 139, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `cbgb` id 'shem' (10, 13, 238 x 116) "Show Event Messages" check box group box value 1 min 0 max 2 Txtr 132 message 'shem'
      - `chbx` id 'msti' (9, 24, 219 x 16) "But Only The Most Important Ones" value 0 min 0 max 2 Txtr 130 message 'msti'
      - `chbx` id 'revb' (9, 44, 219 x 16) "Review Battles" value 1 min 0 max 2 Txtr 130 message 'revb'
      - `chbx` id 'hint' (9, 64, 219 x 16) "Give Helpful Game Play Hints" value 1 min 0 max 2 Txtr 130 message 'hint'
      - `chbx` id 'bbex' (9, 84, 219 x 16) "Tell You About Stars Best Buddies Explore" value 1 min 0 max 2 Txtr 130 message 'hint'
    - `stxt` id 0 (267, 19, 125 x 14) "Battle Review Speed:" Txtr 130
    - `slid` id 'brsp' (289, 38, 100 x 20) slider value 15 min 0 max 30 ticks 0
    - `stxt` id 0 (282, 61, 27 x 14) "Slow" Txtr 130
    - `stxt` id 0 (375, 61, 27 x 14) "Fast" Txtr 130
    - `stxt` id 0 (267, 110, 125 x 14) "Player Sex:" Txtr 130
    - `popb` id 'psex' (289, 132, 100 x 20) popup button, fixed width MENU 203 initialItem 1 titleWidth 65535 Txtr 130
    - `chbx` id 'temp' (19, 143, 219 x 16) "Temperatures in Celsius (not °F)" value 1 min 0 max 2 Txtr 130 message 'temp'
    - `chbx` id 'auto' (19, 165, 219 x 16) "AutoSave Each Turn" value 1 min 0 max 2 Txtr 130 message 'auto'
    - `cbgb` id 'snds' (10, 192, 238 x 48) "Sound" check box group box value 1 min 0 max 2 Txtr 132 message 'shem'
      - `chbx` id 'vocl' (9, 24, 219 x 16) "Vocalize Chat Keywords" value 1 min 0 max 2 Txtr 130 message 'auto'
    - `push` id 901 (255, 260, 69 x 20) "Cancel" Txtr 128 message 901 bound RB
    - `push` id 900 (341, 260, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 140 "Organize Fleets Dialog"

WIND 140: title "Group Fleets", 587 x 399 at (40, 40), proc 5.
RidL 140 (listened to): 'shty', 'ProC', 'numE', 'numB', 'MetC', 303, 304, 302, 305, 301, 'DevC', 'Finf', 'Frng', 'Fspd', 'Fdst', 'Fatm', 'Ffue', 'Fnco', 'FFds', 'Ffsa', 'Sval', 'shin', 1, 3, 2, 'dela', 903, 900, 904.

- `OFdl` (LOrganizeFleetsDialog) WIND 140, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 900
  - `wtha` brushes [5, 6, 1, 2]
  - `tabg`
    - `FdtB` (LFleetsDataBrowser) id 'FdtB' (8, 8, 210 x 383) bound LTB {Pass On Control Chars: 0, Pass On Other Chars: 1}
    - `tgbx` id 'Finf' (228, 8, 350 x 120) "Fleet Information" group box Txtr 132 disabled
      - `stxt` id 0 (13, 17, 49 x 14) "Range:" Txtr 132
      - `stxt` id 'Frng' (97, 18, 60 x 14) Txtr 130
      - `stxt` id 0 (169, 18, 101 x 14) "Current Fuel:" Txtr 132
      - `stxt` id 'Ffue' (276, 18, 60 x 14) Txtr 130
      - `stxt` id 'Fspd' (97, 37, 60 x 14) Txtr 130
      - `stxt` id 0 (13, 38, 49 x 14) "Speed:" Txtr 132
      - `stxt` id 0 (169, 38, 101 x 14) "Num. Colonists:" Txtr 132
      - `stxt` id 'Fnco' (276, 38, 60 x 14) Txtr 130
      - `stxt` id 0 (12, 58, 80 x 14) "Departing To:" Txtr 132
      - `stxt` id 'Fdst' (97, 58, 60 x 14) Txtr 130
      - `stxt` id 0 (169, 58, 101 x 14) "Final Destination:" Txtr 132
      - `stxt` id 'FFds' (276, 58, 60 x 14) Txtr 130
      - `stxt` id 0 (12, 78, 86 x 14) "Arriving In:" Txtr 132
      - `stxt` id 'Fatm' (97, 78, 60 x 14) Txtr 130
      - `stxt` id 0 (169, 78, 101 x 14) "Arriving In:" Txtr 132
      - `stxt` id 'Ffsa' (276, 78, 60 x 14) Txtr 130
      - `stxt` id 0 (12, 98, 80 x 14) "Scrap Value:" Txtr 132
      - `stxt` id 'Sval' (97, 98, 60 x 14) Txtr 130
    - `tgbx` id 'shin' (228, 136, 350 x 80) "Ship Information" group box Txtr 132 disabled
      - `chbx` id 'dela' (11, 14, 159 x 18) "Delayed Arrival" value 0 min 0 max 2 Txtr 132 message 6008
      - `tgbx` id 0 (10, 36, 328 x 35) "Battle Attitude" group box (secondary title) Txtr 130
        - `rgpv` id 'odrg' (2, 8, 324 x 25) bound LTRB
          - `rdbt` id 1 (11, 5, 80 x 18) "Offensive" value 1 min 0 max 2 Txtr 132 message 6008
          - `rdbt` id 2 (129, 5, 80 x 18) "Defensive" value 0 min 0 max 2 Txtr 132 message 6008
          - `rdbt` id 3 (235, 5, 80 x 18) "Normal" value 0 min 0 max 2 Txtr 132 message 6008
    - `tgbx` id 'shty' (228, 224, 350 x 116) "Ship Type Information" group box Txtr 130 disabled
      - `stxt` id 0 (10, 16, 49 x 14) "Range:" Txtr 130
      - `stxt` id 301 (66, 16, 49 x 14) "0" Txtr 130
      - `stxt` id 0 (154, 16, 65 x 14) "Dev Cost:" Txtr 130
      - `stxt` id 'DevC' (225, 16, 65 x 14) "$100" Txtr 130
      - `stxt` id 0 (9, 36, 49 x 14) "Speed:" Txtr 130
      - `stxt` id 0 (154, 36, 65 x 14) "Pro Cost:" Txtr 130
      - `stxt` id 'ProC' (225, 36, 65 x 14) "$100" Txtr 130
      - `stxt` id 302 (66, 37, 49 x 14) "0" Txtr 130
      - `stxt` id 0 (9, 56, 49 x 14) "Weapons:" Txtr 130
      - `stxt` id 0 (154, 56, 65 x 14) "Metal Cost:" Txtr 130
      - `stxt` id 'MetC' (225, 56, 65 x 14) "$100" Txtr 130
      - `stxt` id 303 (66, 57, 49 x 14) "0" Txtr 130
      - `stxt` id 0 (9, 76, 49 x 14) "Shields:" Txtr 130
      - `stxt` id 304 (66, 76, 49 x 14) "0" Txtr 130
      - `stxt` id 0 (154, 76, 65 x 14) "Num. Built:" Txtr 130
      - `stxt` id 'numB' (225, 76, 65 x 14) "<99>" Txtr 130
      - `stxt` id 0 (9, 96, 49 x 14) "Mini:" Txtr 130
      - `stxt` id 305 (66, 96, 49 x 14) "0" Txtr 130
      - `stxt` id 0 (154, 96, 65 x 14) "# Existing:" Txtr 130
      - `stxt` id 'numE' (225, 96, 65 x 14) "<99>" Txtr 130
    - `push` id 904 (239, 358, 80 x 20) "Split" Txtr 128 message 904 bound RB
    - `push` id 903 (332, 358, 80 x 20) "Group All" Txtr 128 message 903 bound RB
    - `push` id 900 (498, 358, 69 x 20) "Done" Txtr 128 message 900 **default** bound RB

### PPob 141 "Review Battle Dialog"

WIND 141: title "Review Battle at <x> in <y>", 600 x 400 at (40, 40), proc 5.
RidL 141 (listened to): 1001, 1002, 1, 2.

- `RBdl` (LReviewBattleDialog) WIND 141, modal, title bar, enabled, targetable, erase on update, min [600, 400] default button 1, cancel 2
  - `Hbtv` (LHoBattleView) id 1000 (0, 0, 600 x 400) image [600, 400] bound LTRB
    - `stxt` id 1002 (75, 8, 500 x 16) Txtr 207 hidden
    - `pict` id 1003 (280, 32, 40 x 40) PICT 9036 hidden disabled
    - `pict` id 1004 (280, 32, 40 x 40) PICT 9037 hidden disabled
    - `stxt` id 1001 (255, 326, 118 x 16) Txtr 207 bound B
  - `push` id 1 (280, 362, 69 x 20) "OK" Txtr 128 message 900 **default** hidden disabled bound B
  - `push` id 2 (280, 362, 69 x 20) "Skip" Txtr 128 message 6017 bound B

### PPob 143 "Message History Window"

WIND 143: title "Message History", 223 x 408 at (4, 42), proc 1987.

- `REwi` (LReportWindow) WIND 143, floating, close box, title bar, resizable, size box, enabled, targetable, get select click, erase on update, min [222, 100]
  - `wtha` brushes [7, 8, 5, 6]
  - `sclv` id 'rpsc' (-1, -1, 225 x 410) scrollingView 'rpvw' image [11, 1] bound LTRB
    - `Hrpt` (LHoReportView) id 'rpvw' (4, 4, 206 x 402) image [206, 402] bound LTRB

### PPob 144 "Ask Leave Network Game"

WIND 144: title "Disconnect", 377 x 205 at (40, 40), proc 5.
RidL 144 (listened to): 3, 2.

- `dlog` WIND 144, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 2, cancel 2
  - `tabg`
    - `pict` id 0 (24, 24, 64 x 64) PICT 4902
    - `stxt` id 0 (115, 24, 235 x 75) "Do you want to leave your current network game and disconnect from the server?" Txtr 128
    - `push` id 2 (175, 163, 69 x 20) "Cancel" Txtr 128 message 2 **default**
    - `push` id 3 (268, 163, 90 x 20) "Disconnect" Txtr 128 message 3
  - `wtha` brushes [5, 6, 1, 2]

### PPob 145 "List Expl. Stars Dialog"

WIND 145: title "Explored Stars", 640 x 360 at (40, 40), proc 0.
RidL 145 (listened to): 900.

- `dlog` WIND 145, modal, title bar, resizable, size box, enabled, targetable, erase on update, min [600, 300] default button 900, cancel 900
  - `tabg`
    - `StrB` (LExplStarsDataBrowser) id 'StrB' (13, 12, 524 x 334) bound LTRB {Pass On Control Chars: 0, Pass On Other Chars: 0}
    - `picd` id 0 (548, 13, 85 x 214) picture (no tracking) value 4900 bound TR
    - `push` id 900 (557, 307, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 146 "No SN Intro Dialog"

WIND 146: title "Welcome", 377 x 205 at (40, 40), proc 5.
RidL 146 (listened to): 1, 2, 3.

- `dlog` WIND 146, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 1, cancel -1
  - `tabg`
    - `pict` id 0 (15, 15, 64 x 64) PICT 4902
    - `stxt` id 0 (104, 15, 240 x 17) "Welcome to Spaceward Ho! 5.0!" Txtr 128
    - `stxt` id 0 (104, 36, 257 x 35) "If you would like to try out Spaceward Ho!, just click  the Demo button below." Txtr 128
    - `stxt` id 0 (104, 74, 257 x 35) "To purchase Spaceward Ho! click the Buy It! button." Txtr 128
    - `stxt` id 0 (104, 113, 257 x 35) "Once you've bought it and have a serial number, click Register." Txtr 128
    - `push` id 3 (66, 165, 86 x 20) "Buy It!" Txtr 128 message 3
    - `push` id 2 (172, 165, 86 x 20) "Register…" Txtr 128 message 2
    - `push` id 1 (280, 165, 69 x 20) "Demo" Txtr 128 message 1 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 147 "Surrender To"

WIND 147: title "Surrender", 336 x 136 at (40, 40), proc 5.
RidL 147 (listened to): 901, 900, 'surr'.

- `dlog` WIND 147, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `pict` id 0 (16, 16, 64 x 64) PICT 4902
    - `stxt` id 0 (86, 16, 238 x 19) "Who would you like to surrender to?" Txtr 128
    - `popb` id 'surr' (86, 47, 150 x 20) popup button, fixed width MENU 215 initialItem 1 titleWidth 65535
    - `push` id 901 (160, 95, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (248, 95, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 148 "Enter SN Dialog"

WIND 148: title "Spaceward Ho! 5.0 Registration", 519 x 311 at (40, 40), proc 5.
RidL 148 (listened to): 'snam', 'snum', 1, 2.

- `dlog` WIND 148, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 1, cancel 2
  - `tabg`
    - `pict` id 0 (16, 16, 64 x 64) PICT 4902
    - `stxt` id 0 (98, 16, 411 x 34) "Register your copy of Spaceward Ho! by filling in the two fields below. This will require an Internet connection. " Txtr 200
    - `etxt` id 'snam' (196, 58, 170 x 25) maxChars 15
    - `stxt` id 0 (98, 62, 100 x 16) "Login Name:" Txtr 200
    - `stxt` id 0 (113, 87, 350 x 41) "The name you would like to use when connected to spacewardho.net. It can be your first name or a nickname, but has to be unique. 15 characters max." Txtr 204
    - `stxt` id 0 (113, 138, 350 x 41) "Please make note of your login name, as if you ever need to re-register, you must use the same name for this serial number." Txtr 204
    - `etxt` id 'snum' (196, 185, 170 x 25) maxChars 31
    - `stxt` id 0 (98, 189, 100 x 16) "Serial Number:" Txtr 200
    - `stxt` id 0 (113, 214, 348 x 29) "The serial number you received when you bought Spaceward Ho!. It should have the form: XXXX-XXXX-XX." Txtr 204
    - `push` id 2 (326, 265, 69 x 20) "Later" Txtr 128 message 901
    - `push` id 1 (413, 265, 80 x 20) "Register" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 149 "Startup Dialog Demo"

WIND 149: title "Spaceward Ho! 5", 441 x 418 at (40, 40), proc 5.
RidL 149 (listened to): 'name', 901, 902, 904, 900, 905.

- `dlog` WIND 149, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 904, cancel -1
  - `tabg`
    - `aGUY` (LAnimatedGuy) id 0 (68, 2, 304 x 200)
    - `stxt` id 'name' (130, 3, 303 x 38) "welcome name" Txtr 128 hidden disabled
    - `stxt` id 0 (4, 209, 432 x 35) "You are in DEMO mode. To unlock this version, purchase Spaceward Ho! at www.deltatao.com. The full version includes:" Txtr 128
    - `stxt` id 0 (25, 249, 271 x 18) "• Unlimited Tech Level Advancement" Txtr 128
    - `stxt` id 0 (25, 269, 271 x 18) "• Network Play" Txtr 128
    - `stxt` id 0 (25, 289, 293 x 18) "• Lots more galaxy styles and configurations" Txtr 128
    - `stxt` id 0 (25, 309, 294 x 18) "• Smarter Computer Players" Txtr 128
    - `stxt` id 0 (25, 329, 296 x 18) "• Alliances " Txtr 128
    - `stxt` id 0 (4, 350, 194 x 19) "What would you like to do?" Txtr 128
    - `push` id 901 (12, 386, 90 x 20) "Quit" Txtr 128 message 901 bound LB
    - `push` id 904 (119, 386, 90 x 20) "Buy It!" Txtr 128 message 904 **default** bound LB
    - `push` id 905 (227, 386, 90 x 20) "Register…" Txtr 128 message 905 bound LB
    - `push` id 900 (335, 386, 90 x 20) "Demo…" Txtr 128 message 900 bound LB
    - `push` id 902 (117, 451, 90 x 20) "Connect…" Txtr 128 message 902 disabled
  - `wtha` brushes [5, 6, 1, 2]

### PPob 150 "You Won Dialog"

WIND 150: title "", 225 x 282 at (40, 40), proc 1.
RidL 150 (listened to): 100, 900.

- `dlog` WIND 150, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 900
  - `wtha` brushes [5, 6, 1, 2]
  - `stxt` id 100 (24, 23, 179 x 39) "Congratulations! You have conquered the galaxy!"
  - `picd` id 0 (38, 73, 151 x 149) picture (no tracking) value 3030
  - `push` id 900 (138, 242, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 151 "You Lost Dialog"

WIND 151: title "", 225 x 282 at (40, 40), proc 1.
RidL 151 (listened to): 900, 100.

- `dlog` WIND 151, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 900
  - `wtha` brushes [5, 6, 1, 2]
  - `stxt` id 100 (21, 23, 190 x 35) "Unfortunately, you have been eliminated from the game…"
  - `picd` id 0 (38, 73, 151 x 149) picture (no tracking) value 3040
  - `push` id 900 (138, 242, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 152 "Armageddon"

WIND 152: title "Armageddon", 307 x 260 at (40, 40), proc 5.
RidL 152 (listened to): 1000, 'advc', 901, 900, 1001.

- `dlog` WIND 152, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `stxt` id 0 (10, 10, 288 x 69) "Here is your armageddon device. If all living human players turn their devices on, a cataclysm of unprecedented proportions will lay waste to half the galaxy..." Txtr 128
    - `picd` id 1000 (24, 89, 110 x 110) picture (no tracking) value 9400
    - `picd` id 1001 (24, 89, 110 x 110) picture (no tracking) value 9401
    - `slid` id 'advc' (143, 115, 24 x 60) slider, ticks value 0 min 0 max 1 ticks 2 message 1000
    - `stxt` id 0 (171, 121, 34 x 14) "On" Txtr 204
    - `stxt` id 0 (171, 156, 34 x 14) "Off" Txtr 204
    - `push` id 901 (132, 220, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (220, 220, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 153 "Radical Tech Choice"

WIND 153: title "Radical Research", 428 x 369 at (40, 40), proc 5.
RidL 153 (listened to): 5, 1, 2, 3, 4, 11, 14, 13, 12, 900.

- `dlog` WIND 153, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 900
  - `tabg`
    - `stxt` id 0 (11, 10, 278 x 18) "You may cancel one research program:" Txtr 128
    - `rgpv` id 10 (18, 35, 406 x 292)
      - `bbut` id 1 (13, 8, 52 x 52) bevel button (normal) value 0 min 512 max 9010 message 1000 more: `000000000000000000000000000000`
      - `bbut` id 2 (13, 69, 52 x 52) bevel button (normal) value 0 min 512 max 9010 message 1000 more: `000000000000000000000000000000`
      - `bbut` id 3 (13, 129, 52 x 52) bevel button (normal) value 0 min 512 max 9010 message 1000 more: `000000000000000000000000000000`
      - `bbut` id 4 (13, 190, 52 x 52) bevel button (normal) value 0 min 512 max 9010 message 1000 more: `000000000000000000000000000000`
      - `rdbt` id 5 (6, 263, 392 x 18) "Don’t Cancel Any Programs" value 1 min 0 max 2 message 1000
    - `stxt` id 11 (126, 62, 276 x 20) "11" Txtr 200
    - `stxt` id 12 (126, 121, 276 x 20) "12" Txtr 200
    - `stxt` id 13 (126, 180, 276 x 20) "13" Txtr 200
    - `stxt` id 14 (126, 239, 276 x 20) "14" Txtr 200
    - `sepl` id 0 (73, 288, 300 x 3)
    - `push` id 900 (344, 333, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 154 "Give Money Metal"

WIND 154: title "Give Money/Metal", 318 x 226 at (40, 40), proc 5.
RidL 154 (listened to): 'mona', 'meta', 'recp', 'mons', 'monx', 'mets', 'metx', 901, 900.

- `dlog` WIND 154, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `popb` id 'recp' (43, 7, 200 x 20) "Recipient:" popup button, fixed width MENU 216 initialItem 1 titleWidth 65535 Txtr 132
    - `stxt` id 0 (15, 46, 40 x 14) "Money:" Txtr 130
    - `stxt` id 0 (61, 46, 8 x 14) "$" Txtr 130
    - `stxt` id 'mona' (71, 46, 70 x 14) "999,999,999" Txtr 130
    - `stxt` id 0 (171, 46, 40 x 14) "Metal:" Txtr 130
    - `stxt` id 'meta' (219, 46, 70 x 14) "999,999,999" Txtr 130
    - `slUP` (LSliderUpdater) id 'mons' (26, 67, 20 x 100) slider, live, ticks value 500 min 0 max 1000 ticks 11 message 'mons' {Updater Pane ID: 'mona'}
    - `slUP` (LSliderUpdater) id 'mets' (182, 67, 20 x 100) slider, live, ticks value 500 min 0 max 1000 ticks 11 message 'mets' {Updater Pane ID: 'meta'}
    - `stxt` id 'monx' (55, 69, 80 x 14) "$999,999,999" Txtr 130
    - `stxt` id 'metx' (210, 69, 80 x 14) "$999,999,999" Txtr 130
    - `stxt` id 0 (55, 153, 40 x 14) "0" Txtr 130
    - `stxt` id 0 (210, 153, 40 x 14) "0" Txtr 130
    - `push` id 901 (146, 184, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (232, 184, 69 x 20) "Give" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 155 "How Many Ships To Move?"

WIND 155: title "How Many?", 300 x 163 at (40, 40), proc 1.
RidL 155 (listened to): 'move', 'maxs', 901, 900, 'nums'.

- `dlog` WIND 155, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `stxt` id 0 (14, 13, 266 x 17) "How many ships would you like to move?"
    - `etxt` id 'nums' (125, 41, 50 x 24) maxChars 5 message 1234
    - `slUP` (LSliderUpdater) id 'move' (100, 70, 100 x 20) slider, live, ticks value 50 min 0 max 100 ticks 2 message 'move' {Updater Pane ID: 'nums'}
    - `stxt` id 0 (99, 94, 30 x 14) "0" Txtr 133
    - `stxt` id 'maxs' (174, 94, 30 x 14) "0" Txtr 133
    - `push` id 901 (123, 124, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (209, 124, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 156 "Name A Star"

WIND 156: title "Congratulations!", 546 x 459 at (40, 40), proc 5.
RidL 156 (listened to): 'NAME', 901, 900, 1, 3.

- `dlog` WIND 156, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `wtha` brushes [5, 6, 1, 2]
  - `tabg`
    - `qtIM` (LQuickTimeImage) id 2 (75, 12, 400 x 300)
    - `stxt` id 0 (8, 328, 323 x 18) "Congratulations! You have achieved the rank of:" Txtr 200
    - `stxt` id 1 (337, 328, 191 x 18) "<RANK>" Txtr 200
    - `etxt` id 'NAME' (337, 356, 160 x 23) maxChars 11 Txtr 206
    - `stxt` id 0 (8, 358, 320 x 18) "You may name a star for use in future games:" Txtr 200
    - `stxt` id 3 (8, 388, 521 x 18) "You have already earned all abilities." Txtr 200
    - `push` id 901 (343, 420, 95 x 20) "Never Mind" Txtr 128 message 901
    - `push` id 900 (459, 420, 69 x 20) "Cool!" Txtr 128 message 900 **default**

### PPob 157 "Dip Into Savings"

WIND 157: title "Dip Into Savings", 306 x 181 at (40, 40), proc 5.
RidL 157 (listened to): 'dsli', 901, 900.

- `dlog` WIND 157, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `stxt` id 0 (20, 22, 179 x 70) "What percentage of your savings would you like to  use each turn to increase your income?" Txtr 128
    - `slid` id 'dsli' (222, 22, 20 x 100) slider, live, ticks value 10 min 0 max 30 ticks 7
    - `stxt` id 0 (250, 28, 40 x 14) "30%" Txtr 130
    - `stxt` id 0 (250, 65, 40 x 14) "15%" Txtr 130
    - `stxt` id 0 (20, 94, 182 x 27) "Once started, you will continue to dip each turn until cancelled." Txtr 132
    - `stxt` id 0 (250, 103, 40 x 14) "0%" Txtr 130
    - `push` id 901 (129, 140, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (215, 140, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 158 "Abandon Hope"

WIND 158: title "Misery, Sadness, Despair...", 277 x 124 at (40, 40), proc 5.
RidL 158 (listened to): 901, 900.

- `dlog` WIND 158, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `stxt` id 0 (10, 10, 247 x 49) "Dost thou truly wish to abandon Hope? All is not yet lost..." Txtr 128
    - `push` id 900 (188, 81, 69 x 20) "OK" Txtr 128 message 900 **default**
    - `push` id 901 (100, 82, 69 x 20) "Cancel" Txtr 128 message 901
  - `wtha` brushes [5, 6, 1, 2]

### PPob 159 "Auto Play Dialog"

WIND 159: title "Auto Play", 452 x 365 at (40, 40), proc 5.
RidL 159 (listened to): 901, 900, 500, 1004, 1006, 1005, 1021, 1, 1000, 1001, 1011.

- `dlog` WIND 159, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `cbgb` id 500 (46, 6, 397 x 304) "Auto Play" check box group box value 1 min 0 max 2 Txtr 203
      - `rgpv` id 'pfmG' (11, 20, 255 x 119)
        - `rdbt` id 1 (6, 11, 239 x 18) "Have Computer Play For Me" value 0 min 0 max 2 Txtr 206
        - `rdbt` id 0 (1, 91, 239 x 18) "Just End My Turns" value 0 min 0 max 2 Txtr 206
      - `view` id 1007 (5, 51, 368 x 56)
      - `slid` id 1000 (40, 63, 115 x 20) slider, live, ticks value 0 min 0 max 100 ticks 2
      - `slid` id 1001 (223, 63, 115 x 20) slider, live, ticks value 0 min 0 max 100 ticks 2
      - `stxt` id 0 (17, 87, 75 x 14) "Friendly" Txtr 133
      - `stxt` id 0 (105, 87, 75 x 14) "Aggressive" Txtr 133
      - `stxt` id 0 (200, 87, 75 x 14) "No Defense" Txtr 133
      - `stxt` id 0 (288, 87, 75 x 14) "Dig In" Txtr 133
      - `sepl` id 0 (25, 145, 350 x 3) bound LR
      - `cbgb` id 1004 (14, 158, 360 x 74) "Turn Off When Something Interesting Happens" 165 value 0 min 0 max 2 Txtr 206
        - `chbx` id 0 (21, 27, 112 x 18) "Battles I Win" value 0 min 0 max 2 Txtr 204 hidden disabled
        - `stxt` id 0 (20, 30, 313 x 28) "Battles, colonizations, tech level changes, etc." Txtr 204
        - `chbx` id 0 (21, 49, 112 x 18) "Battles I Lose" value 0 min 0 max 2 Txtr 204 hidden disabled
      - `stxt` id 0 (14, 249, 116 x 28) "Click through messages every:" Txtr 135
      - `slUP` (LSliderUpdater) id 1005 (143, 254, 115 x 20) slider, live, ticks value 3 min 0 max 10 ticks 2 message 1005 {Updater Pane ID: "1006"}
      - `stxt` id 1006 (278, 254, 20 x 14) "0" Txtr 133
      - `stxt` id 0 (301, 254, 75 x 14) "Seconds" Txtr 132
      - `stxt` id 1011 (146, 277, 20 x 14) "0" Txtr 133
      - `stxt` id 1021 (238, 277, 20 x 14) "10" Txtr 133
    - `push` id 901 (276, 323, 69 x 20) "Cancel" Txtr 128 message 901 bound RB
    - `push` id 900 (362, 323, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 160 "Send Message Dialog"

WIND 160: title "Send Message", 266 x 138 at (40, 40), proc 5.
RidL 160 (listened to): 1000, 1001, 901, 900.

- `dlog` WIND 160, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `tabg`
    - `popb` id 1000 (11, 9, 200 x 20) "To Whom:" popup button, fixed width MENU 216 initialItem 1 titleWidth 65535 Txtr 132
    - `popb` id 1001 (10, 42, 200 x 20) "Say What:" popup button, fixed width MENU 218 initialItem 1 titleWidth 65535 Txtr 132
    - `push` id 901 (92, 95, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 900 (178, 95, 69 x 20) "Send" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 161 "Checking Serial Number Wait"

WIND 161: title "Checking Registration...", 325 x 87 at (40, 40), proc 5.
RidL 161 (listened to): 901.

- `dlog` WIND 161, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button -1, cancel 901
  - `tabg`
    - `pbar` id 0 (45, 17, 231 x 13) progress bar value 0 min 0 max 0
    - `push` id 901 (239, 47, 69 x 20) "Cancel" Txtr 128 message 901
  - `wtha` brushes [5, 6, 1, 2]

### PPob 162 "About Box"

WIND 162: title "About Spaceward Ho!", 461 x 264 at (40, 40), proc 5.
RidL 162 (listened to): 1000, 1003, 1002, 1001, 900, 1004.

- `dlog` WIND 162, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 900
  - `tabg`
    - `pict` id 0 (11, 6, 64 x 64) PICT 4902
    - `stxt` id 0 (87, 6, 101 x 18) "Spaceward Ho!" Txtr 128
    - `stxt` id 1000 (192, 6, 101 x 18) "<VERSION>" Txtr 128
    - `stxt` id 0 (87, 26, 360 x 18) "©1990-2002 Peter Commons and Delta Tao Software, Inc." Txtr 128
    - `sepl` id 0 (146, 50, 250 x 3)
    - `stxt` id 0 (87, 58, 360 x 18) "Written By Peter Commons" Txtr 128
    - `stxt` id 0 (87, 78, 360 x 18) "Designed By Joe Williams and Peter Commons" Txtr 128
    - `stxt` id 0 (87, 98, 360 x 18) "Artwork by Howard Vives and Bob van de Walle" Txtr 128
    - `stxt` id 0 (87, 118, 360 x 18) "Sounds by Mark Madeley" Txtr 128
    - `sepl` id 0 (146, 142, 250 x 3)
    - `stxt` id 0 (87, 150, 119 x 18) "Screen Name:" Txtr 128
    - `stxt` id 1002 (208, 150, 220 x 18) "Unregistered" Txtr 128
    - `stxt` id 0 (87, 170, 119 x 18) "Serial Number:" Txtr 128
    - `stxt` id 1003 (208, 170, 220 x 18) "Demo" Txtr 128
    - `stxt` id 0 (87, 190, 119 x 18) "Name:" Txtr 128
    - `stxt` id 1001 (208, 190, 220 x 18) "Unregistered" Txtr 128
    - `push` id 1004 (87, 224, 100 x 20) "Deregister…" Txtr 128 message 1004 bound RB
    - `push` id 900 (374, 224, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 163 "Master Points/ Rank History"

WIND 163: title "Rank History", 512 x 350 at (40, 40), proc 4.
RidL 163 (listened to): 900, 'nmps', 'amps', 'tmps'.

- `dlog` WIND 163, modal, title bar, enabled, targetable, erase on update, min [600, 300] default button 900, cancel 900
  - `tabg`
    - `picd` id 0 (418, 8, 85 x 214) picture (no tracking) value 4900 bound LT
    - `stxt` id 0 (8, 12, 172 x 18) "Network Master Points:" Txtr 128
    - `stxt` id 'nmps' (190, 12, 150 x 18) "Unregistered" Txtr 128
    - `stxt` id 0 (8, 32, 171 x 18) "Total Master Points:" Txtr 128
    - `stxt` id 'tmps' (190, 32, 150 x 18) "Unregistered" Txtr 128
    - `stxt` id 0 (8, 52, 171 x 18) "MPs Needed to Advance:" Txtr 128
    - `stxt` id 'amps' (190, 52, 150 x 18) "Unregistered" Txtr 128
    - `mpdB` (LMasterPointsDataBrowser) id 'mpdB' (8, 80, 401 x 260) bound LT {Pass On Control Chars: 0, Pass On Other Chars: 0}
    - `push` id 900 (429, 316, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 164 "Reconnect Dialog"

WIND 164: title "Reconnect", 384 x 214 at (40, 40), proc 5.
RidL 164 (listened to): 901, 900.

- `dlog` WIND 164, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `wtha` brushes [5, 6, 1, 2]
  - `pict` id 0 (16, 16, 64 x 64) PICT 4902
  - `stxt` id 100 (92, 16, 267 x 37) "Sorry, but Spaceward Ho! cannot currently connect to spacewardho.net."
  - `stxt` id 100 (92, 61, 257 x 18) "Would you like to try again?"
  - `stxt` id 100 (92, 87, 275 x 65) "If this keeps happening,  please check your Internet connection. If that's ok, wait and try again in a few minutes; the server may temporarily be down." Txtr 206
  - `push` id 901 (209, 172, 69 x 20) "Cancel" Txtr 128 message 901
  - `push` id 900 (296, 172, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 165 "Scrap Ship Types Dialog"

WIND 165: title "Scrap Ship Types", 359 x 354 at (40, 40), proc 0.
RidL 165 (listened to): 901, 900.

- `dlog` WIND 165, modal, title bar, resizable, size box, enabled, targetable, erase on update, min [600, 300] default button 900, cancel 901
  - `tabg`
    - `StdB` (LShipTypesDataBrowser) id 'stcv' (6, 6, 150 x 334) bound LTB {Pass On Control Chars: 0, Pass On Other Chars: 1}
    - `stxt` id 0 (167, 12, 179 x 39) "Select the ship types you would like to scrap." Txtr 200
    - `stxt` id 0 (167, 61, 178 x 91) "If any ships of that type exist, they will be scrapped at their current location during the next turn update." Txtr 200
    - `push` id 901 (181, 314, 69 x 20) "Cancel" Txtr 128 message 901 bound RB
    - `push` id 900 (266, 314, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 166 "List All Fleets Dialog"

WIND 166: title "List All Fleets", 640 x 360 at (40, 40), proc 0.
RidL 166 (listened to): 900, 'gtof'.

- `dlog` WIND 166, modal, title bar, resizable, size box, enabled, targetable, erase on update, min [600, 300] default button 900, cancel 900
  - `tabg`
    - `lfdB` (LListFleetsDataBrowser) id 'laft' (8, 8, 540 x 320) bound LTRB {Pass On Control Chars: 0, Pass On Other Chars: 0}
    - `picd` id 0 (551, 8, 85 x 214) picture (no tracking) value 4900 bound TR
    - `push` id 'gtof' (562, 254, 69 x 20) "Go To" Txtr 128 message 900 hidden disabled bound RB
    - `push` id 900 (562, 307, 69 x 20) "OK" Txtr 128 message 900 **default** bound RB
    - `stxt` id 0 (13, 333, 484 x 22) "Double-click a fleet to select it in the map view." Txtr 200 bound LB
  - `wtha` brushes [5, 6, 1, 2]

### PPob 167 "You Won Demo Dialog"

WIND 167: title "", 346 x 392 at (40, 40), proc 1.
RidL 167 (listened to): 901, 900.

- `dlog` WIND 167, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `wtha` brushes [5, 6, 1, 2]
  - `stxt` id 100 (8, 12, 334 x 18) "Congratulations! You have conquered the galaxy!"
  - `stxt` id 100 (8, 32, 327 x 18) "That's no small feat in demo mode."
  - `picd` id 0 (100, 58, 151 x 149) picture (no tracking) value 3030
  - `stxt` id 0 (8, 214, 416 x 18) "Now, order the full version so that you can:" Txtr 128
  - `stxt` id 0 (21, 238, 353 x 18) "•  Amass master points for your wins" Txtr 128
  - `stxt` id 0 (21, 258, 353 x 18) "•  Play against your friends in network mode" Txtr 128
  - `stxt` id 0 (21, 278, 375 x 18) "•  Try lots more galaxy styles and configurations" Txtr 128
  - `stxt` id 0 (21, 298, 376 x 18) "• Play against smarter computer players" Txtr 128
  - `stxt` id 0 (21, 318, 378 x 18) "•  And much more..." Txtr 128
  - `push` id 901 (149, 354, 80 x 20) "Not Yet" Txtr 128 message 901
  - `push` id 900 (248, 354, 80 x 20) "Buy It!" Txtr 128 message 900 **default** bound LB

### PPob 168 "You Lost Demo Dialog"

WIND 168: title "", 346 x 392 at (40, 40), proc 1.
RidL 168 (listened to): 100, 901, 900.

- `dlog` WIND 168, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `wtha` brushes [5, 6, 1, 2]
  - `stxt` id 100 (8, 12, 333 x 35) "Unfortunately, you have been eliminated from the demo game…"
  - `picd` id 0 (100, 58, 151 x 149) picture (no tracking) value 3040
  - `stxt` id 0 (8, 214, 416 x 18) "Now, order the full version so that you can:" Txtr 128
  - `stxt` id 0 (21, 238, 353 x 18) "•  No longer be limited in tech advancement" Txtr 128
  - `stxt` id 0 (21, 258, 353 x 18) "•  Play against your friends in network mode" Txtr 128
  - `stxt` id 0 (21, 278, 375 x 18) "•  Try lots more galaxy styles and configurations" Txtr 128
  - `stxt` id 0 (21, 298, 376 x 18) "• Ally with other players in your quest for victory" Txtr 128
  - `stxt` id 0 (21, 318, 378 x 18) "•  And much more..." Txtr 128
  - `push` id 901 (149, 354, 80 x 20) "Not Yet" Txtr 128 message 901
  - `push` id 900 (248, 354, 80 x 20) "Buy It!" Txtr 128 message 900 **default** bound LB

### PPob 169 "Connecting to Server"

WIND 169: title "Connecting to spacewardho.net", 322 x 54 at (40, 40), proc 5.

- `dlog` WIND 169, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button -1, cancel -1
  - `tabg`
    - `stxt` id 0 (-1, 16, 325 x 20) "One moment, please…" Txtr 205
  - `wtha` brushes [5, 6, 1, 2]

### PPob 170 "Enter More Player Info"

WIND 170: title "Spaceward Ho! 5.0 Registration", 518 x 263 at (40, 40), proc 5.
RidL 170 (listened to): 'ynam', 'yeml', 1, 2, 'male', 'fmal', 'bmon', 'bday', 'year'.

- `dlog` WIND 170, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 1, cancel 2
  - `tabg`
    - `pict` id 0 (16, 16, 64 x 64) PICT 4902
    - `stxt` id 0 (98, 16, 406 x 73) "Thanks a lot for registering. If you would like, please let us know a bit more about yourself. This information will be used for Spaceward Ho!-related updates and information only.  " Txtr 200
    - `etxt` id 'ynam' (208, 108, 170 x 25) maxChars 63
    - `rgpv` id 0 (381, 108, 132 x 25)
      - `rdbt` id 'male' (3, 2, 55 x 20) "Male" value 1 min 0 max 2 Txtr 128
      - `rdbt` id 'fmal' (61, 2, 67 x 20) "Female" value 0 min 0 max 2 Txtr 128
    - `stxt` id 0 (100, 112, 100 x 16) "Your full name:" Txtr 200
    - `etxt` id 'yeml' (208, 139, 250 x 25) maxChars 63
    - `stxt` id 0 (100, 143, 100 x 16) "Your email:" Txtr 200
    - `etxt` id 'year' (453, 176, 43 x 25) maxChars 2
    - `popb` id 'bmon' (208, 178, 135 x 20) popup button, fixed width MENU 219 initialItem 1 titleWidth 65535
    - `popb` id 'bday' (348, 178, 70 x 20) popup button, fixed width MENU 220 initialItem 1 titleWidth 65535
    - `stxt` id 0 (100, 180, 100 x 16) "Your birthday:" Txtr 200
    - `stxt` id 0 (424, 180, 24 x 16) "19" Txtr 200
    - `push` id 2 (327, 222, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 1 (414, 222, 80 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 233 "Create Individual Game (OS9)"

WIND 233: title "New Single Player Game", 449 x 406 at (40, 40), proc 5.
RidL 233 (listened to): 'NAME', 'Ally', 'Luck', 'Gdif', 'Rand', 'HumS', 'CNCL', 'OPEN', 'NumC', 'Gshp', 'GalS', 'GalD', 'TTLT', 'YrPT', 'CpIQ', 'mxIQ', 'ComS', 'cbud', 'CIQT'.

- `dlog` WIND 233, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 'OPEN', cancel 'CNCL'
  - `tabg`
    - `etxt` id 'NAME' (140, 3, 120 x 23) "Milky Way" maxChars 31 Txtr 130
    - `stxt` id 0 (18, 8, 100 x 14) "Galaxy Name:" Txtr 135
    - `stxt` id 0 (12, 28, 106 x 14) "Player Information" Txtr 132
    - `sepl` id 0 (112, 37, 320 x 3)
    - `popb` id 'HumS' (140, 51, 140 x 17) popup button, fixed width MENU 202 initialItem 1 titleWidth 0 Txtr 130 message 'HumS'
    - `stxt` id 0 (19, 52, 100 x 14) "Home System:" Txtr 135
    - `stxt` id 0 (12, 74, 100 x 14) "Computer Players" Txtr 132
    - `sepl` id 0 (106, 83, 326 x 3)
    - `popb` id 'NumC' (140, 93, 80 x 17) popup button, fixed width MENU 207 initialItem 2 titleWidth 0 Txtr 130 message 'NumC'
    - `slUP` (LSliderUpdater) id 'CpIQ' (310, 93, 100 x 18) slider, live, ticks value 50 min 50 max 200 ticks 2 message 'CpIQ' {Updater Pane ID: 'CIQT'}
    - `stxt` id 0 (18, 94, 100 x 14) "Bad Guys:" Txtr 135
    - `stxt` id 0 (243, 94, 30 x 14) "IQ:" Txtr 135
    - `stxt` id 'CIQT' (276, 94, 30 x 14) "999" Txtr 130
    - `stxt` id 0 (310, 114, 25 x 14) "50" Txtr 133
    - `stxt` id 'mxIQ' (383, 114, 30 x 14) "200" Txtr 133
    - `popb` id 'ComS' (140, 124, 140 x 17) popup button, fixed width MENU 217 initialItem 9 titleWidth 0 Txtr 130 message 'ComS'
    - `stxt` id 0 (16, 125, 100 x 14) "Home System:" Txtr 135
    - `chbx` id 'cbud' (310, 133, 90 x 16) "Best Buddies" value 1 min 0 max 2 Txtr 130 message 'cbud'
    - `stxt` id 0 (12, 150, 40 x 14) "Galaxy" Txtr 132
    - `sepl` id 0 (51, 159, 381 x 3)
    - `Hsmv` (LHoSampleMapView) id 'HMAP' (57, 171, 120 x 120) image [120, 120] disabled {Galaxy Size Control: 'GalS', Galaxy Density Control: 'GalD', Galaxy Shape Control: 'Gshp', Randomize Button: 'Rand', Num Humans Popup: 'NumH', Num Computer Popup: 'NumC', Computer IQ: 'CpIQ', Player Home System: 'HumS', Computer Home System: 'ComS', Time Limit: 'TTLT', Humans BB checkbox: 0, Computers BB checkbox: 'cbud', Text Summary Pane ID: 0}
    - `popb` id 'Gshp' (261, 174, 120 x 17) popup button, fixed width MENU 205 initialItem 1 titleWidth 0 Txtr 130 message 'Gshp'
    - `stxt` id 0 (188, 175, 50 x 14) "Shape:" Txtr 135
    - `slid` id 'GalS' (261, 201, 150 x 18) slider, live, ticks value 50 min 0 max 100 ticks 2 message 'GalS'
    - `stxt` id 0 (188, 202, 50 x 14) "Size:" Txtr 135
    - `stxt` id 0 (246, 222, 50 x 14) "Small" Txtr 133
    - `stxt` id 0 (375, 222, 50 x 14) "Large" Txtr 133
    - `push` id 'Rand' (387, 246, 69 x 20) "Randomize" Txtr 130 message 'Rand' hidden disabled
    - `slid` id 'GalD' (261, 250, 150 x 18) slider, live, ticks value 25 min 0 max 100 ticks 2 message 'GalD'
    - `stxt` id 0 (188, 255, 50 x 14) "Density:" Txtr 135
    - `stxt` id 0 (248, 271, 50 x 14) "Dense" Txtr 133
    - `stxt` id 0 (374, 271, 50 x 14) "Sparse" Txtr 133
    - `stxt` id 0 (12, 293, 40 x 14) "Details" Txtr 132
    - `sepl` id 0 (51, 302, 381 x 3)
    - `chbx` id 'Ally' (269, 312, 150 x 16) "Alliances" value 1 min 0 max 2 Txtr 130 hidden disabled
    - `popb` id 'YrPT' (142, 320, 100 x 17) popup button, fixed width MENU 204 initialItem 1 titleWidth 0 Txtr 130
    - `stxt` id 0 (18, 321, 100 x 14) "Years Per Turn:" Txtr 135
    - `popb` id 'TTLT' (31, 332, 190 x 17) "((Turn Time Limit:))" popup button, fixed width MENU 209 initialItem 1 titleWidth 122 Txtr 202 message 'TTLT' hidden disabled
    - `chbx` id 'Luck' (269, 332, 150 x 16) "Luck in Battles" value 1 min 0 max 2 Txtr 130 hidden disabled
    - `push` id 'CNCL' (272, 362, 69 x 20) "Cancel" Txtr 128 message 901
    - `push` id 'OPEN' (359, 362, 69 x 20) "Create" Txtr 128 message 900 **default**
    - `stxt` id 0 (18, 365, 140 x 14) "Game Difficulty Rating:" Txtr 135
    - `stxt` id 'Gdif' (164, 365, 40 x 14) "<50>" Txtr 132
  - `wtha` brushes [5, 6, 1, 2]

### PPob 501 "Debug: Terraforming Dialog"

WIND 501: title "Terraforming Test", 622 x 410 at (40, 40), proc 5.
RidL 501 (listened to): 'grav', 'temp', 'dols', 900, 'pitr', 'dttr', 'trbe', 'terf'.

- `dlog` WIND 501, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `tabg`
    - `mPan` (LMonetPane) id 0 (328, 8, 280 x 350) {Filename: "brushfile"}
    - `etxt` id 'grav' (178, 11, 142 x 21) maxChars 15 Txtr 130 message 9000
    - `stxt` id 0 (10, 12, 158 x 16) "Gravity * 100:" Txtr 132
    - `etxt` id 'temp' (180, 38, 142 x 21) maxChars 255 Txtr 130 message 9000
    - `stxt` id 0 (10, 39, 158 x 16) "Temperature * 10:" Txtr 132
    - `etxt` id 'dols' (180, 64, 142 x 21) maxChars 255 Txtr 130 message 9000
    - `stxt` id 0 (10, 65, 158 x 16) "$ Per Turn:" Txtr 132
    - `chbx` id 'terf' (25, 89, 145 x 18) "Faster Terraforming" value 0 min 0 max 2 Txtr 132 message 9000
    - `stxt` id 0 (12, 117, 158 x 16) "# Turns to break even" Txtr 132
    - `stxt` id 'trbe' (182, 117, 139 x 16) "0" Txtr 132
    - `stxt` id 'dttr' (182, 142, 139 x 16) "0" Txtr 132
    - `stxt` id 0 (12, 143, 158 x 16) "Done Terraforming Turn" Txtr 132
    - `stxt` id 0 (12, 172, 158 x 16) "Positive Income Turn:" Txtr 132
    - `stxt` id 'pitr' (182, 172, 139 x 16) "0" Txtr 132
    - `push` id 900 (530, 374, 69 x 20) "OK" Txtr 128 message 900 **default**
  - `wtha` brushes [5, 6, 1, 2]

### PPob 502 "Debug: Computer Attrs"

WIND 502: title "Computer Attrs", 627 x 441 at (40, 40), proc 5.
RidL 502 (listened to): 'uftp', 'intl', 'ipco', 'pcod', 'defm', 2000, 2001, 2002, 2003, 2004, 2005, 'domp', 'defp', 'aggr', 'asty', 'metf', 'savt', 'mafs', 'frie', 3000, 3001, 3002, 3003, 3004, 3005, 4004, 4005, 4003, 4002, 4001, 4000, 900, 901.

- `dlog` WIND 502, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `tabg`
    - `etxt` id 'uftp' (293, 9, 142 x 21) "50" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 11, 270 x 15) "Up Front Tech Percentage:" Txtr 132
    - `etxt` id 'intl' (293, 34, 142 x 21) "50" maxChars 1 Txtr 130 message 9000
    - `stxt` id 0 (10, 36, 270 x 15) "Intelligence (1=dumb, 4=diabolical):" Txtr 132
    - `etxt` id 'ipco' (293, 59, 142 x 21) "10000" maxChars 6 Txtr 130 message 9000
    - `stxt` id 0 (10, 62, 270 x 15) "Required Income Per New Colony:" Txtr 132
    - `etxt` id 'pcod' (293, 85, 142 x 21) "50" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 87, 270 x 15) "% Colonies Defended:" Txtr 132
    - `etxt` id 'defm' (293, 110, 142 x 21) "50" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 112, 270 x 15) "% Metal Used For Defense:" Txtr 132
    - `etxt` id 2000 (293, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2001 (335, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2002 (383, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2003 (429, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2004 (475, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2005 (524, 135, 38 x 20) "20" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 138, 270 x 15) "Tech Spending Percentages:" Txtr 132
    - `etxt` id 'domp' (293, 160, 142 x 21) "50" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 163, 270 x 15) "Attack Domination Percentage:" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'defp' (293, 186, 142 x 21) "50" edit text maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 189, 270 x 15) "Defense Domination Percentage:" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'aggr' (293, 211, 142 x 21) "5" edit text maxChars 2 Txtr 130 message 9000
    - `stxt` id 0 (10, 214, 270 x 15) "Aggressiveness (1-10):" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'asty' (293, 236, 142 x 21) "1" edit text maxChars 1 Txtr 130 message 9000
    - `stxt` id 0 (10, 240, 277 x 15) "Style (General - 1, Defensive - 2, Pouncing - 3):" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'metf' (293, 261, 142 x 21) "50" edit text maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (10, 265, 277 x 15) "Metal Factor (%), Importance for Colonies" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'savt' (293, 287, 142 x 21) "5" edit text maxChars 2 Txtr 130 message 9000
    - `stxt` id 0 (10, 290, 277 x 15) "Savings Goal (Multiplier over Money):" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'mafs' (293, 312, 142 x 21) "10" edit text maxChars 2 Txtr 130 message 9000
    - `stxt` id 0 (10, 315, 277 x 15) "Min. Attack Fleet Size (# Ships):" Txtr 132
    - `etxS` (LEditTextSubmitter) id 'frie' (291, 336, 142 x 21) "500" edit text maxChars 4 Txtr 130 message 9000
    - `stxt` id 0 (10, 340, 277 x 15) "Friendliness (< = more willing to ally):" Txtr 132
    - `push` id 901 (521, 361, 69 x 20) "Cancel" Txtr 128 message 901
    - `stxt` id 0 (168, 362, 288 x 15) "Scout / Dread. / Fighter / Tanker / Colony / Satell" Txtr 132
    - `etxS` (LEditTextSubmitter) id 3000 (165, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 3001 (214, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 3002 (263, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 3003 (312, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 3004 (361, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 3005 (410, 382, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (8, 384, 152 x 15) "Scrap Obsolecense:" Txtr 132
    - `push` id 900 (521, 399, 69 x 20) "OK" Txtr 128 message 900 **default**
    - `etxS` (LEditTextSubmitter) id 4000 (165, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 4001 (214, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 4002 (263, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 4003 (312, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 4004 (361, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `etxS` (LEditTextSubmitter) id 4005 (410, 405, 39 x 20) "30" edit text maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (9, 408, 152 x 15) "New Type Obsolecense:" Txtr 132
  - `wtha` brushes [5, 6, 1, 2]

### PPob 503 "Debug: Battle Simulation"

WIND 503: title "Battle Simulation", 499 x 487 at (40, 40), proc 5.
RidL 503 (listened to): 1000, 1002, 1003, 1004, 1005, 1006, 1014, 1012, 1013, 2001, 2002, 2003, 2004, 2005, 2006, 2000, 1010, 2010, 1011, 2011, 900, 2009, 1008, 1009, 2008, 1007, 2007, 1015, 3000, 3001, 1, 1001, 2020, 1020, 1021, 1016, 2016.

- `dlog` WIND 503, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `tabg`
    - `stxt` id 0 (15, 13, 158 x 16) "Player 1:" Txtr 132
    - `stxt` id 0 (231, 16, 158 x 16) "Player 2:" Txtr 132
    - `popb` id 1011 (16, 36, 160 x 16) "Luck:" popup button, fixed width MENU 214 initialItem 2 titleWidth 65535 Txtr 132 message 9000
    - `popb` id 2011 (231, 36, 160 x 16) "Luck:" popup button, fixed width MENU 214 initialItem 2 titleWidth 65535 Txtr 132 message 9000
    - `popb` id 1000 (16, 59, 160 x 16) "Type:" popup button, fixed width MENU 210 initialItem 3 titleWidth 65535 Txtr 132 message 9000
    - `popb` id 2000 (231, 60, 160 x 16) "Type:" popup button, fixed width MENU 210 initialItem 3 titleWidth 65535 Txtr 132 message 9000
    - `etxt` id 1001 (82, 82, 60 x 20) "6" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2001 (297, 82, 60 x 20) "6" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (16, 83, 61 x 16) "Range:" Txtr 132
    - `stxt` id 0 (231, 84, 61 x 16) "Range:" Txtr 132
    - `etxt` id 1002 (82, 103, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2002 (297, 104, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (16, 106, 61 x 16) "Speed:" Txtr 132
    - `stxt` id 0 (231, 107, 61 x 16) "Speed:" Txtr 132
    - `etxt` id 1003 (82, 126, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2003 (297, 127, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (16, 128, 61 x 16) "Weapons:" Txtr 132
    - `stxt` id 0 (231, 129, 61 x 16) "Weapons:" Txtr 132
    - `etxt` id 1004 (82, 150, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2004 (298, 151, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (16, 152, 61 x 16) "Shields:" Txtr 132
    - `stxt` id 0 (231, 153, 61 x 16) "Shields:" Txtr 132
    - `etxt` id 1005 (82, 173, 60 x 20) "0" maxChars 3 Txtr 130 message 9000
    - `etxt` id 2005 (297, 174, 60 x 20) "0" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (16, 175, 61 x 16) "Mini:" Txtr 132
    - `stxt` id 0 (231, 176, 61 x 16) "Mini:" Txtr 132
    - `chbx` id 1016 (85, 192, 80 x 14) "Decoy?" value 0 min 0 max 2 Txtr 132 message 9000
    - `chbx` id 2016 (298, 193, 80 x 14) "Decoy?" value 0 min 0 max 2 Txtr 132 message 9000
    - `etxt` id 1006 (83, 206, 60 x 20) "1" maxChars 4 Txtr 130 message 9000
    - `etxt` id 2006 (298, 207, 60 x 20) "1" maxChars 4 Txtr 130 message 9000
    - `stxt` id 0 (17, 208, 61 x 16) "# Ships:" Txtr 132
    - `stxt` id 0 (232, 209, 61 x 16) "# Ships:" Txtr 132
    - `popb` id 1010 (19, 230, 160 x 16) "Attitude:" popup button, fixed width MENU 213 initialItem 3 titleWidth 65535 Txtr 132 message 9000
    - `popb` id 2010 (231, 231, 160 x 16) "Attitude:" popup button, fixed width MENU 213 initialItem 3 titleWidth 65535 Txtr 132 message 9000
    - `etxt` id 1014 (84, 255, 60 x 20) "0" maxChars 9 Txtr 130 message 9000
    - `stxt` id 0 (18, 257, 65 x 16) "Population:" Txtr 132
    - `etxt` id 1012 (125, 275, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (59, 277, 61 x 16) "Weapons:" Txtr 132
    - `push` id 1 (265, 290, 100 x 20) "Randomize" Txtr 128 message 9000
    - `etxt` id 1013 (125, 299, 60 x 20) "2" maxChars 3 Txtr 130 message 9000
    - `stxt` id 0 (59, 301, 61 x 16) "Shields:" Txtr 132
    - `stxt` id 1021 (108, 325, 71 x 15) "0" Txtr 132
    - `stxt` id 0 (23, 326, 79 x 15) "Pop. Power:" Txtr 132
    - `stxt` id 2020 (317, 336, 67 x 16) "0" Txtr 132
    - `stxt` id 0 (232, 337, 79 x 15) "Ship Power:" Txtr 132
    - `stxt` id 1020 (108, 342, 71 x 15) "0" Txtr 132
    - `stxt` id 0 (23, 343, 79 x 15) "Ship Power:" Txtr 132
    - `stxt` id 2007 (317, 356, 67 x 16) "0" Txtr 132
    - `stxt` id 0 (232, 357, 79 x 15) "Money Cost:" Txtr 132
    - `stxt` id 1007 (107, 361, 71 x 15) "0" Txtr 132
    - `stxt` id 0 (22, 362, 79 x 15) "Money Cost:" Txtr 132
    - `stxt` id 0 (232, 377, 79 x 15) "Metal Cost:" Txtr 132
    - `stxt` id 2008 (317, 377, 67 x 16) "0" Txtr 132
    - `stxt` id 0 (22, 382, 79 x 15) "Metal Cost:" Txtr 132
    - `stxt` id 1008 (107, 382, 71 x 15) "0" Txtr 132
    - `stxt` id 0 (232, 400, 79 x 15) "Ships Left:" Txtr 132
    - `stxt` id 2009 (317, 400, 67 x 16) "0" Txtr 132
    - `stxt` id 0 (22, 405, 79 x 15) "Ships Left:" Txtr 132
    - `stxt` id 1009 (107, 405, 71 x 15) "0" Txtr 132
    - `stxt` id 0 (24, 428, 79 x 15) "Pop. Left:" Txtr 132
    - `stxt` id 1015 (109, 428, 71 x 15) "0" Txtr 132
    - `stxt` id 3000 (237, 445, 51 x 16) "0" Txtr 132
    - `stxt` id 0 (167, 446, 66 x 15) "# Rounds:" Txtr 132
    - `push` id 900 (413, 451, 69 x 20) "OK" Txtr 128 message 900 **default**
    - `stxt` id 3001 (238, 465, 51 x 16) "0" Txtr 132
    - `stxt` id 0 (148, 466, 83 x 14) "Result Metal:" Txtr 132
  - `wtha` brushes [5, 6, 1, 2]

### PPob 1000 "Error Dialog (Galaxy)"

WIND 1000: title "Error", 402 x 191 at (40, 40), proc 5.
RidL 1000 (listened to): 900, 'emsg', 'galn'.

- `dlog` WIND 1000, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `wtha` brushes [1, 2, 1, 2]
  - `pict` id 0 (12, 12, 64 x 64) PICT 4902
  - `stxt` id 0 (84, 12, 303 x 32) "Uh-oh! There has been an error communicating with the server:" Txtr 300
  - `stxt` id 'emsg' (84, 53, 303 x 48) Txtr 300
  - `stxt` id 0 (84, 109, 98 x 16) "Galaxy Name:" Txtr 300
  - `stxt` id 'galn' (194, 109, 193 x 16) "<Milky Way>" Txtr 300
  - `push` id 900 (312, 151, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 1001 "Error Dialog"

WIND 1001: title "Error", 408 x 163 at (40, 40), proc 5.
RidL 1001 (listened to): 900, 'emsg'.

- `dlog` WIND 1001, modal, title bar, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `wtha` brushes [1, 2, 1, 2]
  - `pict` id 0 (15, 15, 64 x 64) PICT 4902
  - `stxt` id 0 (88, 15, 303 x 32) "Uh-oh! There has been an error communicating with the server:" Txtr 300
  - `stxt` id 'emsg' (88, 56, 303 x 48) Txtr 300
  - `push` id 900 (316, 120, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 1002 "OK Cancel Message Dialog"

WIND 1002: title "", 403 x 156 at (40, 40), proc 1.
RidL 1002 (listened to): 900, 100, 901.

- `dlog` WIND 1002, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel 901
  - `wtha` brushes [1, 2, 1, 2]
  - `pict` id 0 (16, 16, 64 x 64) PICT 4902
  - `stxt` id 100 (88, 16, 300 x 72) Txtr 300
  - `push` id 901 (233, 121, 69 x 20) "Cancel" Txtr 128 message 901
  - `push` id 900 (317, 121, 69 x 20) "OK" Txtr 128 message 900 **default**

### PPob 1003 "OK Message Dialog"

WIND 1003: title "", 411 x 158 at (40, 40), proc 1.
RidL 1003 (listened to): 900, 100.

- `dlog` WIND 1003, modal, enabled, targetable, erase on update, min [64, 64] default button 900, cancel -1
  - `wtha` brushes [1, 2, 1, 2]
  - `pict` id 0 (16, 16, 64 x 64) PICT 4902
  - `stxt` id 100 (94, 16, 300 x 72) Txtr 300
  - `push` id 900 (324, 116, 69 x 20) "OK" Txtr 128 message 900 **default**

## Toolbox dialogs (DLOG, ALRT, DITL)

- DLOG 600 "Select Folder": title "", 344 x 227, DITL 600
- DLOG 601 "New Folder": title "", 204 x 90, DITL 601
- ALRT 128 "About Box": DITL 128
- ALRT 204 "Low Memory Warning": DITL 204
- ALRT 251 "ThrowAt": DITL 251
- ALRT 252 "SignalAt": DITL 252
- ALRT 1000 "Thread Manager Warning": DITL 1000
- ALRT 1001 "Expired": DITL 1001
- ALRT 1002 "No Carbon 1.4": DITL 1002
- ALRT 1003 "Old System": DITL 1003
- ALRT 1004 "Corrupt": DITL 1004

DITL 128 "About Box":
  - button (382, 118, 69 x 20) "OK"
  - picture (8, 8, 74 x 74) id 3000
  - static text (88, 8, 367 x 16) "Spacward Ho! 5.0"
  - static text (88, 24, 367 x 16) "@1990-2001 Peter Commons and Delta Tao Software, Inc."
  - static text (88, 47, 119 x 17) "Name:"
  - static text (88, 67, 119 x 17) "Screen Name:"
  - static text (88, 87, 119 x 17) "Serial Number:"
  - static text (212, 47, 242 x 17) "Unregistered"
  - static text (212, 67, 242 x 17) "Unregistered"
  - static text (212, 87, 242 x 17) "Demo"

DITL 204 "Low Memory Warning":
  - button (289, 69, 58 x 20) "OK"
  - static text (78, 10, 270 x 46) "Memory is getting full. Please try to alleviate the problem by closing some documents. "

DITL 251 "":
  - button (342, 202, 84 x 20) "Continue"
  - static text (74, 10, 365 x 114) "Exception Thrown\r\rError: ^0"
  - static text (74, 136, 365 x 54) "Function: ^1\rFile: ^2\rLine # ^3"
  - button (256, 202, 74 x 20) "Abort"
  - button (160, 202, 84 x 20) "Debugger"
  - button (74, 202, 74 x 20) "Quiet"

DITL 252 "":
  - button (342, 202, 84 x 20) "Continue"
  - static text (74, 10, 365 x 114) "Signal Raised\r\rCondition: ^0"
  - static text (74, 136, 365 x 54) "Function: ^1\rFile: ^2\rLine # ^3"
  - button (256, 202, 74 x 20) "Abort"
  - button (160, 202, 84 x 20) "Debugger"
  - button (74, 202, 74 x 20) "Quiet"

DITL 600 "Select Folder":
  - button (252, 184, 80 x 20) "Open"
  - button (252, 153, 80 x 20) "Cancel"
  - user item (0, 0, 0 x 0)
  - user item (235, 29, 102 x 16)
  - button (252, 53, 80 x 20) "Eject"
  - button (252, 81, 80 x 20) "Desktop"
  - user item (12, 50, 218 x 130)
  - user item (12, 27, 218 x 19)
  - picture (251, 140, 82 x 1) id 600
  - button (28, 200, 186 x 20) "Select “^”"
  - static text (12, 7, 206 x 16) "Select a Folder:"
  - user item (252, 109, 80 x 20)

DITL 601 "New Folder":
  - button (130, 61, 60 x 20) "Create"
  - button (10, 61, 60 x 20) "Cancel"
  - edit text (12, 33, 177 x 16) "untitled folder"
  - static text (10, 8, 168 x 20) "Name of new folder:"
  - 1 (0, 0, 0 x 0) id 1

DITL 1000 "Thread Manager Warning":
  - button (288, 71, 60 x 20) "OK"
  - static text (75, 10, 273 x 48) "Thread Manager not installed.  Please install this component, or upgrade your system software to version 7.5 or better."

DITL 1001 "Expired":
  - button (290, 98, 60 x 20) "OK"
  - static text (75, 10, 273 x 68) "Sorry, but this beta version of Spaceward Ho! has expired. You might want to go see if there's an updated version posted."

DITL 1002 "":
  - button (288, 71, 60 x 20) "OK"
  - static text (75, 10, 273 x 48) "Sorry, but Spaceward Ho! requires at least CarbonLib 1.4. "

DITL 1003 "":
  - button (288, 71, 60 x 20) "OK"
  - static text (75, 10, 273 x 48) "Sorry, but Spaceward Ho! requires at least MacOS 8.6."

DITL 1004 "":
  - button (288, 71, 60 x 20) "OK"
  - static text (75, 10, 273 x 48) "Sorry, but this application seems to be corrupt. Please delete it and re-download it."

## Controls (CNTL)

- CNTL 600 "": "New", proc 375, value 0 (0 to -6046)
- CNTL 601 "": "New Folder", proc 0, value 0 (0 to 0)

## String lists (STR#)

### STR# 150 "Redo Edit Actions"

1. "Can’t Redo"
2. "Redo"
3. "Redo Cut"
4. "Redo Copy"
5. "Redo Paste"
6. "Redo Clear"
7. "Redo Typing"

### STR# 151 "Undo Edit Actions"

1. "Can’t Undo"
2. "Undo"
3. "Undo Cut"
4. "Undo Copy"
5. "Undo Paste"
6. "Undo Clear"
7. "Undo Typing"

### STR# 152 "Redo Drag Actions"

1. "Redo Drag Copy"
2. "Redo Drag Move"
3. "Redo Drag Drop"

### STR# 153 "Undo Drag Actions"

1. "Undo Drag Copy"
2. "Undo Drag Move"
3. "Undo Drag Drop"

### STR# 156 "Redo Style Actions"

1. "Redo Font"
2. "Redo Size"
3. "Redo Style"
4. "Redo Justification"
5. "Redo Color"

### STR# 157 "Undo Style Actions"

1. "Undo Font"
2. "Undo Size"
3. "Undo Style"
4. "Undo Justification"
5. "Undo Color"

### STR# 200 "Standards"

1. "Spaceward Ho! 5"
2. "Save File As:"
3. "Open: Spaceward Ho! 5"
4. "Save: Spaceward Ho! 5"

### STR# 220 "Default Edit Menu Items"

1. "Cut"
2. "Copy"
3. "Paste"
4. "Clear"

### STR# 6001 "Misc. Strings"

1. "one"
2. "Decoy"
3. "100%"
4. "Range"
5. "Speed"
6. "Weapons"
7. "Shields"
8. "Mini"
9. "Radical"
10. "Savings"
11. "Tech"
12. "Pop:"
13. "Gravity:"
14. "Metal:"
15. "Temp:"
16. "Dismantle Current Fleet"
17. "Don’t Dismantle Current Fleet"
18. "Dismantle "
19. "Don’t Dismantle "
20. "Evacuate Planet"
21. "Don’t Evacuate Planet"
22. "Show Information"
23. "Hide Information"
24. "Metal:"
25. "Savings:"
26. "Income:"
27. "Income:"
28. "$"
29. "Milky Way"
30. "You"
31. "more..."
32. "Evacuating"
33. "Attack & Refuel Fleet"
34. "Attack & Colonize Fleet"
35. "Mixed Fleet"
36. "Empty Fleet"
37. "Rake & Pillage Fleet"
38. "n/a"
39. "Your enemies"
40. "and your allies "
41. "Disp. Inc.: $"
42. "…"
43. "No Information"
44. "No One"
45. "Owner:"
46. "Info:"
47. "Grav:"
48. "No Graph Information Available"
49. "Show Planet Info Box"
50. "Hide Planet Info Box"
51. "Ship Type Information"
52. "http://www.joedelta.com/ho5/buyitnow.html"
53. "Hyperspace"
54. "Congratulations! You won the battle."
55. "Unfortunately, you lost the battle."
56. "You have no information about the battle; your fleet was destroyed too quickly."
57. "Cool! Your best buddy won this battle."
58. "Darn. Your best buddy lost this battle."
59. "Your buddy was destroyed too fast and has no information about this battle."
60. " (Need more MPs)"

### STR# 6002 "Ship Class Names"

1. "Scout"
2. "Dreadnought"
3. "Fighter"
4. "Tanker"
5. "Colony Ship"
6. "Satellite"
7. "Biological"
8. "Scouts"
9. "Dreadnoughts"
10. "Fighters"
11. "Tankers"
12. "Colony Ships"
13. "Satellites"
14. "Biologicals"

### STR# 6003 "sprintf Templates"

1. "%d.%2.2dG"
2. "%d.%1.1d°F"
3. "%d.%1.1d°C"
4. "(+ $%s)"
5. "(- $%s)"
6. "(+ %s)"
7. "(- %s)"
8. "(Int: $%s)"
9. "%s in %s in %d"
10. "%s killed"
11. "one dead %s"
12. "%d dead %ss"
13. "Review Battle at %s in %d"
14. "Round %d"
15. "%d/%d %ss"
16. "%s/%s"
17. "%s Information"
18. "Do you really want to evacuate %s? It's a profitable colony!"
19. "%s’s Rank History"
20. "You have earned the ability to %s."

### STR# 6004 "Alert Strings"

1. "Are you sure you want to leave your current network game?"
2. "Do you really want to surrender?"
3. "You are no longer surrendering to anyone."
4. "Are you sure you want to destroy half the galaxy? Millions of innocent lives will be lost…"
5. "Whew! It's good to see that that clearer heads have prevailed!"
6. "Sorry, but you may only give 3 gifts per turn."
7. "Sorry, but there is no one else alive to give or send something to."
8. "Do you really want to scrap all existing ships of this type?"
9. "Sorry, but the battle record for this battle is no longer available."
10. "Sorry, but there is already a star with that name. How about a different name?"
11. "Sorry, but spacewardho.net already has a game with that name running. Please try a different name."
12. "Please name your galaxy."
13. "Unable to connect to game server at spacewardho.net."
14. "You have become disconnected from spacewardho.net. Try to reconnect if you want."
15. "We haven't heard from the server in a while. It may be down or your connection may be severed. You may want to quit and then try to reconnect."
16. "Sorry, but your assembly lines are full. You must scrap a ship type first before you can design any more ship types.\r"
17. "Sorry, you don't have the details about this battle that your ally fought."
18. "Sorry, but you have no additional information about this battle; all you know is that is was pretty big."
19. "You must fill in all fields with the proper data before you can register."
20. "The serial number you entered is not valid. Please check that you entered it in correctly."
21. "The serial number you have entered has already been registered under a different login/screen name. Please enter the same name you did the first time."
22. "Sorry, but the screen name you have requested has already been taken. Please try a different username."
23. "Sorry, but the screen name you have requested is invalid. Please try again."
24. "Sorry, but Spaceward Ho! cannot connect to the registration server. Please make sure you are connected to the Internet."
25. "Sorry, but this serial number has been overused in some way and has been locked out. Please call tech support for assistance."
26. "Sorry, but this version of Spaceward Ho! only permits network play."
27. "Sorry, but the Registration server is returning an error. You may be trying to connect with an old version of Spaceward Ho! that is no longer compatible."
28. "You were idle for 15 minutes and have been disconnected for spacewardho.net.\r"
29. "Sorry, but you have no detailed information about the battle. All you know was that it was big."
30. "Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.\r"
31. "The serial number you entered is invalid. Please check it and try again."
32. "Are you sure you want to de-register this copy of Spaceward Ho!? It will revert to demo mode."
33. "This copy has been de-registered. You must quit Spaceward Ho! for this operation to be complete."
34. "You are playing with a monitor depth less than millions of colors. Please change to millions if possible, as graphic glitches may otherwise result."
35. "Sorry, but you cannot open saved games in demo mode."
36. "Are you sure you want to build that many scout ships?"
37. "Are you sure you want to build that many tankers?"
38. "Dorothy, I guess that means we're not in Kansas anymore…"
39. "This version of the client is not compatible with the current version of the spacewardho.net server. You will need to upgrade first before you can register."

### STR# 6010 "Scout Names"

1. "Needle"
2. "Explorer"
3. "Looker"
4. "Columbus"
5. "Magellan"
6. "Intrepid"
7. "Wanderer"
8. "Rudolph"
9. "Eagle"
10. "Sparrow"
11. "Ranger"
12. "Whisper"
13. "Weasel"
14. "Enterprise"
15. "De Gama"

### STR# 6011 "Dreadnought Names"

1. "Big Surprise"
2. "HelliMoon"
3. "Mass Murder"
4. "Watch Out!"
5. "Terror"
6. "Godzilla"
7. "Mammoth"
8. "Tyrannosaurus"
9. "Galactus"
10. "Hercules"
11. "Monster X"
12. "Nightmare"
13. "Brontosaurus"
14. "Destructor"
15. "Annihilator"

### STR# 6012 "Fighter Names"

1. "Reliant"
2. "Demon"
3. "Hurricane"
4. "Typhoon"
5. "Slasher"
6. "Patton"
7. "Stingray"
8. "Blaster"
9. "Talon"
10. "Serpent"
11. "Dragon"
12. "Tornado"
13. "Wraith"
14. "Storm"
15. "Dagger"

### STR# 6013 "Tanker Names"

1. "Chevron"
2. "Union 76"
3. "Shell"
4. "Exxon"
5. "Texaco"
6. "Arco"
7. "Mobil"
8. "BP"
9. "Apollo Oil"
10. "Diesel"
11. "Rotten Robbie"
12. "Full Serve"
13. "Valdez"
14. "Premium"
15. "Unleaded"

### STR# 6014 "Colony Ship Names"

1. "Spreader"
2. "Mother"
3. "Expander"
4. "Nina"
5. "Pinta"
6. "Santa Maria"
7. "Stork"
8. "Freedom"
9. "People Mover"
10. "Discover"
11. "Taurus"
12. "Minerva"
13. "Egg"
14. "Peaceful"
15. "Hardy"

### STR# 6015 "Satellite Names"

1. "Defender"
2. "Stopper"
3. "Protector"
4. "Eye"
5. "Armor"
6. "Shield"
7. "Peach"
8. "Washington"
9. "Gabriel"
10. "Sun Dog"
11. "Mercy"
12. "Vision"
13. "Pebble"
14. "Rock"
15. "Stone"

### STR# 6016 "Biological Names"

1. "Medusa"
2. "Slither"
3. "Snake"
4. "Gobbler"
5. "Digester"
6. "Big Stomach"
7. "Breakfast"
8. "Lunch"
9. "Dinner"
10. "Midnight Snack"
11. "Rust Monster"
12. "Gelatinous Cube"
13. "Compost Pile"
14. "Disposal"
15. "Trash Compactor"

### STR# 6020 "Report Window Templates"

1. "Spaceward Ho! by Peter Commons."
2. "Spaceward Ho! DEMO by Peter Commons."
3. "Artwork by Howard Vives and Bob Van de walle."
4. "Your Range Technology has reached level %d."
5. "Your Speed Technology has reached level %d."
6. "Your Weapons Technology has reached level %d."
7. "Your Shield Technology has reached level %d."
8. "Your Miniaturization Technology has reached level %d."
9. "Your Radical researchers have just made another wild discovery!"
10. "You have evacuated %s."
11. "%s has gone nova."
12. "%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people."
13. "Year %d:"
14. "Your colony at %s is not receiving sufficient funds to support itself."
15. "You are not supporting %s enough. The people have revolted and now belong to %s"
16. "Warning: you are terraforming %s, a planet that will never become profitable."
17. "You have completely terraformed %s."
18. "A volcanic eruption at %s has drastically warmed the temperature to %s!"
19. "Your fleet of %s at %s has been dismantled for %s metal."
20. "Your fleet of %s was dismantled while in hyperspace."
21. "Your “%s” ship type has been dismantled. %d of this type scrapped for %s metal."
22. "Your fleet of %s disappeared through a wormhole in space and is lost."
23. "Your %s is waiting to refuel before it can continue on to %s."
24. "Your fleet of %s has arrived at %s."
25. "Your fleet of %s has stopped at %s on the way to %s."
26. "%s’s fleet of %s has arrived at %s."
27. "Your fleet of %s has eaten %s people while refueling at %s."
28. "%s’s fleet of biologicals has eaten %s people while refueling at %s."
29. "%s has run out of metal."
30. "%s has run out of metal. You should probably evacuate it."
31. "%s has just become a profitable colony."
32. "It’s a baby boom! The population at %s has started growing quickly."
33. "%s’s population growth rate has slowed."
34. "You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s."
35. "%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s."
36. "You have colonized %s."
37. "You %swon a battle at %s. You %slost %d of your ships. %s lost %d."
38. "You %slost a battle at %s. You %slost %d of your ships. %s lost %d."
39. "%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people."
40. "%s says, “I want %s.”"
41. "%s says, “You take %s.”"
42. "%s says, “I like %s.”"
43. "%s says, “I hate %s.”"
44. "%s says, “I own %s.”"
45. "%s says, “I need money.”"
46. "%s says, “I need metal.”"
47. "%s says, “Let’s attack %s.”"
48. "%s says, “Thank You!”"
49. "%s says, “Sorry!”"
50. "%s says, “#!$@*$&@•™!”"
51. "%s says, “I like planets that are %d.%2.2dG and %s.”"
52. "%s says, “I saw %s at %s!”"
53. "%s says, “Look at %s.”"
54. "%s is cheating."
55. "%s says: %s"
56. "You told %s that you want %s."
57. "You told %s that you don’t want %s."
58. "You told %s that you like %s."
59. "You told %s that you hate %s."
60. "You told %s that you own %s."
61. "You told %s that you need money."
62. "You told %s that you need metal."
63. "You told %s, “Let’s attack %.*s.”"
64. "You told %s, “Thank You!”"
65. "You told %s, “Sorry!”"
66. "You said “#!$@*$&@•™!” to %s."
67. "You told %s what gravity and temperature you prefer."
68. "You told %s you saw %s at %.*s."
69. "You told %s all about %s."
70. "Wow! You seem to be doing really well! Congratulations!"
71. "Your message to %s: %s"
72. "You recovered %s metal from the battle at %s."
73. "%s metal has fallen onto %s from your recent battle."
74. "Oh no! %s people were killed when a heavy meteor shower hit %s."
75. "%s has just been eliminated from the game."
76. "You have just been eliminated from the game."
77. "%s has just won the game."
78. "Your ally %s has just won the game."
79. "Congratulations! You won a %d difficulty game and have earned %s master points."
80. "You are not spending any money on technology research."
81. "The meteor shower destroyed your colony at %s."
82. "Oh, no! All the metal on %s has suddenly disappeared."
83. "Uh-oh! %s has started growing and is turning bright red in hue!"
84. "%s has just gone supernova. The planet has been obliterated."
85. "The shock wave from the supernova threw %s metal at %s, killing %s people."
86. "Your %s technology just jumped to %d."
87. "Eeek! A nasty computer bug has broken into your game and started wreaking havoc!"
88. "%s has offered to ally with you."
89. "%s no longer wants to ally with you."
90. "You have offered to ally with %s."
91. "You no longer want to ally with %s."
92. "You have formed an alliance with %s."
93. "Your alliance with %s is gone."
94. "%s has offered to be your best buddy."
95. "%s no longer wants to be your best buddy. He just wants to be allies."
96. "You have offered to be best buddies with %s."
97. "You no longer want to be best buddies with with %s. You just want to be allies."
98. "You are now best buddies with %s."
99. "Your best buddy relationship with %s is gone. You're only allies now."
100. "The amount of energy emanating from %s suggests a big battle just took place."
101. "%s has just given you $%s."
102. "%s has just given you %s metal."
103. "You just gave %s $%s."
104. "You just gave %s %s metal."
105. "%s has just surrendered."
106. "%s has just surrendered to %s."
107. "You have just surrendered."
108. "You have just surrendered to %s."
109. "Your mining consortium has just been able to extract an additional %s metal from every planet you have."
110. "Weird weather patterns have allowed astronomers to explore certain far away stars."
111. "Your ship technicians have designed a set of new ships with no development cost."
112. "Your scientists have invented a decoy ship. It can't fight, but it's cheap. Amaze your friends and confuse your enemies."
113. "Your mad scientists have created a space monster ship! It's not too powerful, but it doesn't cost any metal!"
114. "Your scientists have discovered how to turn your monitor from black and white to color!"
115. "Your scientists apologize, but they seem to be having “hardware problems.”"
116. "Your scientists realize you already are running in color, shrug, and go back off to work."
117. "Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently."
118. "Your sociologists have discovered how to safely increase the maximum population of your planets!"
119. "Your climatologists have discovered how to terraform planets more efficiently."
120. "Your military training program has improved. Your generals are now smarter."
121. "You have improved your recycling program. You can now get more metal from scrapped ships."
122. "You have built a new research facility; tech spending is now 10% more effective."
123. "You've raised the prime lending rate and can now earn 50%% higher interest on savings."
124. "You have renegotiated your line of credit and can now borrow at a 50%% better interest rate."
125. "Your spies have stolen some technological secrets from %s!"
126. "You have found a wealth of precious metals and have increased your savings by $%s"
127. "Your Radical researchers are hard at work on another discovery!"
128. "Warning! Savings is being used to support %s."
129. "Warning! After supporting your planets and paying your interest, you have no money to spend!"
130. "Your alliance will win the game next turn if it holds!"
131. "Uh-oh! Having to borrow more to pay all your interest!"
132. "You don’t have enough money! You’re neglecting your planets! Global warming is taking place!"
133. "Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped."
134. "Oh No! It’s armageddon!"
135. "Hmm! The armadeddon device was activated, but there wasn't enough mass in the galaxy to get it to work…"
136. "The armageddon device has caused half of the stars to supernova!"
137. "%s’s armageddon device has just been turned on!"
138. "Whew! %s’s armageddon device was just turned off."
139. "You just received %s metal from someone scrapping a fleet or from a battle over %s."
140. "Congratulations, %s! Your population now exceeds %s!"
141. "Your %s tech would have just gone up if you hadn’t been playing the demo version!"
142. "%s has just taken over for the computer player %s."
143. "You now have %s Range Technology (%d)."
144. "You now have %s Speed Technology (%d)."
145. "You now have %s Weapons Technology (%d)."
146. "You now have %s Shield Technology (%d)."
147. "You now have %s Miniaturization Technology (%d)."
148. "%s surrenders to you, giving you $%s."
149. "%s surrenders to you, giving you %s metal."
150. "%s surrenders to you, giving you the planet %s."
151. "Oh no! The Valdez has sprung a leak! The ecology on %s is in shambles! The citizens are suing you for negligence for twice your net worth!"
152. "You just watched some of your allies fight a battle at %s."
153. "There were not enough tankers to fully refuel your fleet of %s at %s."
154. "Your fleet of %s is fully refueled and is ready to depart %s for %s."
155. "%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).\r"
156. "Designed by Joe Williams."
157. "Your %s can no longer reach %s because some of the ships in the fleet don't have enough range."
158. "It's a miracle! Your scientists have figured out to prevent %s from going supernova."
159. "Wow, that's weird! %s is no longer red and appears not to be in danger of going nova."

### STR# 6021 "Help Messages (last ones demo only)"

1. "Click here to make this message go away. Click on the clock to end your turn."
2. "Fleets appear as dots next to your planets. Click one and drag it to send it to another star."
3. "Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy."
4. "Ships with higher Speed Tech shoot first."
5. "Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left."
6. "Good planets look “prettier” than bad planets when you explore them."
7. "Range is how far your ships can reach."
8. "Satellites can't move, but they shoot just as well as any other ship."
9. "There's a limited amount of metal in the game."
10. "Miniaturization makes ships cost more money, but less metal."
11. "Radical Tech can have a variety of effects."
12. "Be careful with your metal--it can easily run out."
13. "Click and hold for a second to cancel a fleet's movement."
14. "Build Satellites to protect vulnerable planets."
15. "Colonize good planets with Colony ships."
16. "Scout ships have higher Range, but lower Weapons and Shields."
17. "If your Weapons are higher than the opponent's Shields, you'll do lots of damage."
18. "If your Shields are higher than the opponents Weapons, he'll barely hurt you."
19. "Lots of ships can make up for having low Technology."
20. "You get money every turn."
21. "Good planets are close to 1.0 G."
22. "Good planets are close to 72°F (20°C)."
23. "Each player has a different idea of what a good planet is."
24. "If a planet is over 2.5 G or below 0.4 G, it will never make a profit."
25. "Abandon bad planets after you strip-mine them."
26. "Terraforming improves a planet's temperature."
27. "Mining takes metal from a planet and puts it into your reserve."
28. "Savings puts money away for shipbuilding."
29. "Savings generates extra income."
30. "If you go into debt, part of your income goes to pay interest."
31. "If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It'll probably survive longer."
32. "Ships in a fleet that arrive late may miss the worst initial battle.\r"
33. "Offensive ships attack better but defend worse."
34. "Defensive ships defend better but attack worse."
35. "There's a contextual menu in the map window for convenience."
36. "Hold down the option key and click planets to specify your fleet's path more exactly."
37. "Put multiple ships in the same fleet with Organize Fleets. "
38. "Option-drag in Organize Fleets to split up ship piles."
39. "Use the graph to see how well you're doing technology-wise vs. the other players."
40. "The first person in the player list is winning."
41. "If you've just started, you might want to try turning on auto-play and watching."
42. "If you and your allies arrive at  a star in the same turn, they'll fight side-by-side in battle."
43. "Armageddons make the galaxy smaller."
44. "Order the real version of Spaceward Ho! from Delta Tao at www.spacewardho.net!"
45. "Order the real version of Spaceward Ho! from Delta Tao at www.spacewardho.net!"
46. "Order the real version of Spaceward Ho! from Delta Tao at www.spacewardho.net!"
47. "The real version of Spaceward Ho! will let you ally with other players."
48. "Your Technology levels are limited only in the demo version."
49. "Your Technology levels are limited only in the demo version."
50. "Don't spend money on a Technology if you've reached its limits for the Demo version."
51. "The real version of Spaceward Ho! doesn't have Technology limits."
52. "The real version of Spaceward Ho! has configurable galaxies and opponents."

### STR# 6060 "Star Names"

1. "Sol"
2. "Sirius"
3. "Canopus"
4. "Vega"
5. "Rigel"
6. "Capella"
7. "Procyon"
8. "Mira"
9. "Altair"
10. "Antares"
11. "Spica"
12. "Pollux"
13. "Castor"
14. "Deneb"
15. "Regulus"
16. "Polaris"
17. "Algol"
18. "Proxima"
19. "Alban"
20. "Thuban"
21. "Mizar"
22. "Alcor"
23. "Doobie"
24. "Merak"
25. "Phad"
26. "Megrez"
27. "Alioth"
28. "Alkaid"
29. "Mintaka"
30. "Alnitak"
31. "Atlas"
32. "Remus"
33. "Alcyon"
34. "Electra"
35. "Maia"
36. "Merope"
37. "Taygeta"
38. "Sterope"
39. "Hadar"
40. "Quark"
41. "Mimosa"
42. "Adhara"
43. "Shaula"
44. "Nath"
45. "Almak"
46. "Alshain"
47. "Tarazed"
48. "Hamal"
49. "Izar"
50. "Shedir"
51. "Menkar"
52. "Diphda"
53. "Etamin"
54. "Acamar"
55. "Alhena"
56. "Alphard"
57. "Arneb"
58. "Nihal"
59. "Saiph"
60. "Markab"
61. "Kansas"
62. "Enif"
63. "Nunki"
64. "Kokab"
65. "Ain"
66. "Ancha"
67. "Arkab"
68. "Atik"
69. "Atria"
70. "Shadow"
71. "Azha"
72. "Baham"
73. "Beid"
74. "Botein"
75. "Caph"
76. "Coxa"
77. "Cursa"
78. "Dabih"
79. "Furud"
80. "Gedi"
81. "Gienah"
82. "Heka"
83. "Keid"
84. "Maaz"
85. "Matar"
86. "Mirfak"
87. "Murzim"
88. "Delta"
89. "Ozworld"
90. "Okda"
91. "Phact"
92. "Propus"
93. "Rana"
94. "Risha"
95. "Sabik"
96. "Petro"
97. "Syrma"
98. "Tarf"
99. "Wasat"
100. "Wazn"
101. "Yed"
102. "Yildun"
103. "Zaniah"
104. "Zaurac"
105. "Zosma"
106. "Ylum"
107. "Arrakis"
108. "Akworld"
109. "Colma"
110. "Moria"
111. "Foundat"
112. "Trantor"
113. "Barsoom"
114. "Aurora"
115. "Fluffy"
116. "Lennon"
117. "Seti Alpha\r"
118. "Paradox"
119. "Santa Fe"
120. "Victoria"
121. "Fez"
122. "Binar"
123. "Nemesis"
124. "Harkon"
125. "Talos"
126. "Aries"
127. "Taurus"
128. "Gemini"
129. "Cancer"
130. "Leo"
131. "Virgo"
132. "Libra"
133. "Scorpio"
134. "Pisces"
135. "Canis"
136. "Ursa"
137. "Beta"
138. "Zeta"
139. "Upsilon"
140. "Rho"
141. "Cepheus"
142. "Calvin"
143. "Hobbes"
144. "Pooh"
145. "Tigger"
146. "Bambi"
147. "Dumbo"
148. "Tweety"
149. "Bugs"
150. "Torino"
151. "Denali"
152. "St. Moritz"
153. "Sauron"
154. "Smaug"
155. "Thune"
156. "Thorin"
157. "Gollum"
158. "Fazaron"
159. "Trellor"
160. "Regor"
161. "Basil"
162. "Ursula"
163. "Styx"
164. "Lentor"
165. "Sooltar"
166. "Romula"
167. "Vulcan"
168. "Hobbiton"
169. "Kessel"
170. "Redox"
171. "Sith"
172. "Yavin"
173. "Quatro"
174. "Remulak"
175. "Kathoon"
176. "Thanos"
177. "Krypton"
178. "Darven"
179. "Gotham"
180. "Klah"
181. "Zaphod"
182. "Turin"
183. "Krikkit"
184. "Vogon"
185. "Argot"
186. "Willy"
187. "Sirgil"
188. "Ender"
189. "Wobbler"
190. "Hoth"
191. "Naboo"
192. "Fomalhaut"
193. "Alpheratz"
194. "Arcturus"
195. "Regulus"
196. "Antares"
197. "Aldebaran"
198. "Betelgeuse"
199. "Nekkar"
200. "Seginus"
201. "Benetnasch"
202. "Murphrid"
203. "Alkalurops"
204. "Acubens"
205. "Tegmen"
206. "Denebola"
207. "Aldhafera"
208. "Zavijava"
209. "Alderamin"
210. "Kornephoros"
211. "Yed Prior"
212. "Al Niyat"
213. "Andromeda"
214. "Sheratan"
215. "Achernar"
216. "A Centauri"
217. "Wolf 359"
218. "Genesis"
219. "Kirby"
220. "B Centauri"
221. "Tatooine"
222. "Alderran"
223. "Klendathu"
224. "Betazed"
225. "Cardassia"
226. "Delios VII"
227. "Ferenginar"
228. "I'dania"
229. "Kostolian"
230. "Narenda III"
231. "Ocampa"
232. "Risa"
233. "Talax"
234. "Xendi Sabu"
235. "Yadera"
236. "Corellia"
237. "Coruscant"
238. "Geonosis"
239. "Kashyyyk"
240. "Arbra"
241. "Kamino"
242. "Lyra"
243. "Chetco"
244. "Cassidy"
245. "Zed"
246. "Arkanatex"
247. "Zoltar VII"
248. "Soph"
249. "Fluxer"
250. "Doldunn"
251. "Lochia"
252. "Crolax"
253. "Kylothia"
254. "Cerebrax"
255. "Quaz"

### STR# 6260 "Radical Tech Strings"

1. "Search for more metal on your planets"
2. "Explore distant stars"
3. "Get lots of money immediately"
4. "Improve mining efficiency"
5. "Improve population maximums"
6. "Improve terraforming efficiency"
7. "Educate battle generals better"
8. "Improve recycling program"
9. "Improve technology output"
10. "Increase savings interest rate"
11. "Decrease borrowing interest rate"
12. "Build a decoy ship"
13. "Build a biological space monster"
14. "Steal technology from another player"
15. "Build a set of ships without development cost"
16. "Improve range tech dramatically"
17. "Improve speed tech dramatically"
18. "Improve weapons tech dramatically"
19. "Improve shields tech dramatically"
20. "Improve mini tech dramatically"

### STR# 6270 "Range Tech Strings"

1. "1"
2. "2"
3. "3"
4. "4"
5. "5"
6. "6"
7. "Topping off the Tanks"
8. "Fusion Pile"
9. "Magneto-Hydrodynamic Power"
10. "Allotropic Iron"
11. "Gravitic Battery"
12. "Quantum Energy Storage"
13. "Singularity"
14. "Plasma Siphon"
15. "Muon Ladder"
16. "There and Back"
17. "Quark Grinder"
18. "Pulsar Radiant"
19. "Anti-Matter"
20. "Star Harness"

### STR# 6271 "Speed Tech Strings"

1. "1"
2. "Solar Sail"
3. "Ion Rocket"
4. "Gravitic Slingshot"
5. "Fusion Dump Drive"
6. "Relativity Drive"
7. "Trans-Light"
8. "Hyperspace"
9. "Rift Drive"
10. "Hawking Propulsion System"
11. "Hyper-Rift Drive"
12. "PowerPC™"
13. "Trans-Rift Hyper Drive"
14. "Hawking Trans-Hyper Drive"
15. "Time Distortion"
16. "Quantum Continuum"
17. "Already There"
18. "Speedy Gonzalez™"
19. "Teleportation"
20. "Yesterday Drive"

### STR# 6272 "Weapons Tech Strings"

1. "1"
2. "2"
3. "Mass Driver Cannon"
4. "Laser 20"
5. "Turbolaser"
6. "Maser"
7. "Gamma-Ray Laser"
8. "Spectrum Cannon"
9. "Energy Ball"
10. "Nuclear Magnetic Resonance"
11. "Phase Disruption"
12. "Focused Quark Beam"
13. "Hard Pixel"
14. "Tachyon Cannon"
15. "+5 Rustproof Vorpal"
16. "Hyperspace Pulse"
17. "Delta Particle Stream"
18. "Neutron Compression"
19. "Nova Cannon"
20. "Galactic Disruption"
21. "Advanced Space-Time Annihilation"

### STR# 6273 "Shield Tech Strings"

1. "1"
2. "2"
3. "Armored Hull"
4. "Mass Repulser"
5. "Energy Dispersion"
6. "Deflector"
7. "Energy Bonded Armor"
8. "Anti-Energy"
9. "Quark Shell"
10. "Delta Wave"
11. "Energy Injestor"
12. "Refractor Field"
13. "Holographic Decoy"
14. "Stasis Flicker"
15. "Conversion Field"
16. "Tao Wave"
17. "Gluon Armor"
18. "Hide behind a big rock"
19. "+5 Blessed Plate Mail"
20. "Displacer Field"

### STR# 6274 "Mini Tech Strings"

1. "Integrated Circuit"
2. "Integrated Chip"
3. "Large Scale Integration"
4. "VLSI"
5. "Wonkavision"
6. "Ultra-microscopic"
7. "Nanoscopic"
8. "Advanced Nanoscopic"
9. "Really Amazingly Small"
10. "Yellow Polka Dot Bikini"
11. "Sub-Atomic"
12. "Partial Lepton"
13. "Quark"
14. "Sub-Quark"
15. "Micro-Quark"
16. "Nano-Quark"
17. "Advanced Nano-Quark"
18. "Bikini Again (Thought it was funny)"
19. "Quantum Superstring"
20. "Sub-Quantum Superstring"

### STR# 6280 "Male Computer Names"

1. "Peter"
2. "Joe"
3. "Timmer"
4. "Howard"
5. "Bob"
6. "Ed"
7. "Mark"
8. "Guy"
9. "Ben"
10. "Dan"
11. "Kon"
12. "Brennan"
13. "John"
14. "Mike"
15. "Dave"
16. "Steve"
17. "Rosko"
18. "Willy"
19. "Jack"
20. "Albert"

### STR# 6281 "Female Computer Names"

1. "Christie"
2. "Suzy"
3. "Ann"
4. "Julia"
5. "Nancy"
6. "Xena"
7. "Athena"
8. "Heather"
9. "Caryl"
10. "Jennifer"
11. "Kathy"
12. "Kate"
13. "Jane"
14. "Paula"
15. "Michelle"
16. "Iris"
17. "Pam"
18. "Liz"
19. "Alexis"
20. "Grace"
21. "Sabrina"
22. "Claire"

### STR# 6300 "Starting Pos. String"

1. "Outpost"
2. "Barren"
3. "Backward"
4. "Normal"
5. "Advanced"
6. "Thriving"
7. "Abundant"
8. "--unused--"
9. "Any"

### STR# 6500 "Message/Communication Error Strings"

1. "The version of Spaceward Ho! you are running is too old to talk with this server. Please go to www.deltatao.com and check for an update."
2. "The server received a message with an invalid data length."
3. "The server received a client message."
4. "The client received a server message."
5. "The game ID for the message that was just sent is unknown."
6. "Received an unknown general message."
7. "Received an unknown galaxy message."
8. "You can't join this game; it has already started."
9. "You cannot perform that operation; you are not the host of this game."
10. "You are already in this game; you cannot be added again."
11. "You are not in the game you just sent a message about."
12. "Sorry, but you already ended your turn; you cannot end it agagin."
13. "Uh-oh! You are not in the right year for this game. "
14. "Failed to connect to server. Server may not be responding."
15. "Invalid change object for pre-start game."
16. "Sorry but a game with that name already exists on the server."
17. "A game with that game ID already exists on the sever. Try creating your game again."
18. "The serial number you have supplied is invalid or does not match your user information; you will need to re-register."
19. "There is already someone logged in to spacewardho.net with your serial number."
20. "There is already someone logged in to spacewardho.net with your name."
21. "Client authentication required."
22. "The file you are trying to read is corrupted in some way."
23. "The file you are trying to load is an incompatible version."
24. "The player information you just sent had an invalid checksum. You may be out of sync.\r"
25. "The version of Spaceward Ho! you are running is too new to talk with the current server. Hrm."
26. "There are already 8 humans in this game. Please try another game."

### STR# 6501 "Game Internal Errors"

1. "General operational error. This is probably really bad."
2. "Unknown key error (archive storage issue)."
3. "Battle record missing; can't review battle."


## Menus (MENU, with their xmnu commands)

Menu bars: MBAR 128: 128, 129, 130, 133, 134, 136; MBAR 129: 128, 137, 138, 133, 134, 136.

- MENU 128 "\x14" (Apple Menu)
  - "About Spaceward Ho!..." (Mcmd 1)
  - "Rank History…" (Mcmd 5039)
- MENU 129 "File" (File Menu)
  - "New Local Game…" (cmd-N, Mcmd 5023)
  - "Open Local Game…" (cmd-O, Mcmd 3)
  - "Connect To Server..." (Mcmd 5001)
  - "-"
  - "End Turn" (cmd-T, Mcmd 5006)
  - "-"
  - "Close" (cmd-W, Mcmd 4)
  - "-"
  - "Save" (cmd-S, Mcmd 5)
  - "Save As…" (Mcmd 6)
  - "-"
  - "Quit" (cmd-Q, Mcmd 10)
- MENU 130 "Edit" (Edit Menu)
  - "Undo" (cmd-Z, Mcmd 11)
  - "-"
  - "Cut" (cmd-X, Mcmd 12)
  - "Copy" (cmd-C, Mcmd 13)
  - "Paste" (cmd-V, Mcmd 14)
  - "Clear" (Mcmd 15)
  - "Select All" (cmd-A, Mcmd 16)
  - "-"
  - "Preferences…" (Mcmd 27)
  - "Rank History…" (Mcmd 5039)
- MENU 131 "Network" (Network)
  - "Host New Game... " (cmd-H, Mcmd 5002)
  - "-"
  - "Start Game" (Mcmd 5007)
  - "Boot Player" (Mcmd 5030)
  - "Disband Game" (Mcmd 5009)
  - "-"
  - "Join Game" (cmd-J, Mcmd 5003)
  - "Rejoin Game" (cmd-J, Mcmd 5019)
  - "Leave Game" (Mcmd 5010)
- MENU 132 "Game" (Game)
  - "End Turn" (cmd-T, Mcmd 5006)
  - "-"
- MENU 133 "Ships" (Ships)
  - "Build Ships…" (cmd-B, Mcmd 5013)
  - "-"
  - "List All Fleets…" (Mcmd 5014)
  - "Group Fleets…" (cmd-G, Mcmd 5015)
  - "Dismantle Fleet" (cmd-D, Mcmd 5016)
  - "Cancel Fleet Trip" (Mcmd 5036)
  - "-"
  - "Scrap Ship Types…" (Mcmd 5040)
  - "-"
  - "Review Battle…" (cmd-R, Mcmd 5017)
- MENU 134 "Galaxy" (Galaxy)
  - "List All Explored Stars…" (cmd-L, Mcmd 5027)
  - "Evacuate Planet" (cmd-E, Mcmd 5018)
  - "-"
  - "Dip Into Savings…" (Mcmd 5020)
  - "-"
  - "Give Money/Metal To…" (Mcmd 5028)
  - "Send Message To…" (Mcmd 5035)
  - "Surrender To…" (Mcmd 5021)
  - "-"
  - "Auto Play…" (Mcmd 5034)
  - "Play One Turn For Me" (cmd-U, Mcmd 5041)
  - "-"
  - "Armageddon…" (Mcmd 5022)
- MENU 135 "Debug" (Debug)
  - "Terraform Test Dialog…" (Mcmd 9000)
  - "Battle Test Dialog…" (Mcmd 9001)
  - "-"
  - "Computer Do Turn" (cmd-3, Mcmd 9002)
  - "Computer Attrs…" (Mcmd 9003)
  - "-"
  - "God View Mode" (Mcmd 9004)
  - "Beep Crash Alert" (Mcmd 9006)
  - "-"
  - "Refresh" (Mcmd 5008)
  - "-"
  - "Debug Server Mode" (Mcmd 9005)
- MENU 136 "Window" (Window)
  - "Message History" (cmd-1, Mcmd 5024)
  - "Graph History" (cmd-2, Mcmd 5026)
  - "-"
  - "Show/Hide" (Mcmd 5029)
  - "Show/Hide" (cmd-I, Mcmd 5038)
  - "Zoom In" (cmd-=, Mcmd 5011)
  - "Zoom Out" (cmd--, Mcmd 5012)
  - "-"
  - "Lobby Window" (cmd-Y, Mcmd 5032)
  - "Pre-Start Window" (Mcmd 5033)
  - "Map Window" (Mcmd 5031)
  - "-"
  - "Clean Up Windows" (Mcmd 5025)
- MENU 137 "Game" (Aqua File)
  - "New Local Game…" (cmd-N, Mcmd 5023)
  - "Open…" (cmd-O, Mcmd 3)
  - "Connect To Server..." (Mcmd 5001)
  - "-"
  - "End Turn" (cmd-T, Mcmd 5006)
  - "-"
  - "Close" (cmd-W, Mcmd 4)
  - "-"
  - "Save" (cmd-S, Mcmd 5)
  - "Save As…" (Mcmd 6)
- MENU 138 "Edit" (Aqua Edit)
  - "Undo" (cmd-Z, Mcmd 11)
  - "-"
  - "Cut" (cmd-X, Mcmd 12)
  - "Copy" (cmd-C, Mcmd 13)
  - "Paste" (cmd-V, Mcmd 14)
  - "Clear" (Mcmd 15)
  - "Select All" (cmd-A, Mcmd 16)
- MENU 139 "Debug" (Debug Short)
  - "Debug Server Mode" (Mcmd 9005)
- MENU 201 "" (Send To)
  - "Everyone"
  - "Allies"
  - "Best Buddies"
  - "-"
- MENU 202 "Popup" (Home System)
  - "Outpost"
  - "Barren"
  - "Backward"
  - "Normal"
  - "Advanced"
  - "Thriving"
  - "Abundant"
- MENU 203 "Popup" (Sex)
  - "Male" (Mcmd 6001)
  - "Female" (Mcmd 6002)
- MENU 204 "Popup" (Years Per Turn)
  - "10" (Mcmd 6011)
  - "20" (Mcmd 6012)
  - "30" (Mcmd 6013)
  - "50" (Mcmd 6014)
- MENU 205 "Popup" (Galaxy Shapes)
  - "Circle"
  - "Spiral"
  - "Cluster"
  - "Ring"
  - "Grid"
  - "Random"
  - "Hex"
- MENU 206 "Popup" (Num Humans)
  - "1"
  - "2"
  - "3"
  - "4"
  - "5"
  - "6"
  - "7"
  - "8"
  - "-"
  - "Any (1-8)"
- MENU 207 "Popup" (Num Computers)
  - "None"
  - "1"
  - "2"
  - "3"
  - "4"
  - "5"
  - "6"
  - "7"
  - "8"
- MENU 208 "Popup" (Home System w/ Any Option)
  - "Outpost"
  - "Barren"
  - "Backward"
  - "Normal"
  - "Advanced"
  - "Thriving"
  - "Abundant"
  - "-"
  - "Any"
- MENU 209 "Popup" (Turn Time Limit)
  - "30 Seconds"
  - "45 Seconds"
  - "1 Minute"
  - "1 Min. 30 Secs."
  - "2 Minutes"
  - "4 Minutes"
- MENU 210 "Popup" (Ship Type)
  - "Scout"
  - "Dreadnought"
  - "Fighter"
  - "Tanker"
  - "Colony Ship"
  - "Satellite"
  - "Biological" (disabled)
- MENU 211 "Popup" (Alliance Popup)
  - "Best Buddies"
  - "Allies"
  - "Enemies"
- MENU 212 "Popup" (Galaxy Shapes Demo)
  - "Circle"
  - "Spiral"
  - "Cluster" (disabled)
  - "Ring" (disabled)
  - "Grid" (disabled)
  - "Random" (disabled)
  - "Hex" (disabled)
- MENU 213 "Popup" (Attitude)
  - "Offensive"
  - "Defensive"
  - "Neutral"
- MENU 214 "Popup" (Luck)
  - "Bad Luck"
  - "Neutral"
  - "Good Luck"
- MENU 215 "Popup" (Surrender To Base)
  - "-"
  - "No One"
- MENU 216 "Popup" (Give Base)
- MENU 217 "Popup" (Home System w/ Std Option)
  - "Outpost"
  - "Barren"
  - "Backward"
  - "Normal"
  - "Advanced"
  - "Thriving"
  - "Abundant"
  - "-"
  - "Based on IQ"
- MENU 218 "Popup" (Message Options)
  - "Thank You"
  - "Sorry"
  - "%$*^&%!"
- MENU 219 "Popup" (Birth Month)
  - "<na>"
  - "January (1)"
  - "February (2)"
  - "March (3)"
  - "April (4)"
  - "May (5)"
  - "June (6)"
  - "July (7)"
  - "August (8)"
  - "September (9)"
  - "October (10)"
  - "November (11)"
  - "December (12)"
- MENU 220 "Popup" (Birth Day)
  - "<na>"
  - "1"
  - "2"
  - "3"
  - "4"
  - "5"
  - "6"
  - "7"
  - "8"
  - "9"
  - "10"
  - "11"
  - "12"
  - "13"
  - "14"
  - "15"
  - "16"
  - "17"
  - "18"
  - "19"
  - "20"
  - "21"
  - "22"
  - "23"
  - "24"
  - "25"
  - "26"
  - "27"
  - "28"
  - "29"
  - "30"
  - "31"
- MENU 221 "Popup" (Num Computers Demo)
  - "None" (disabled)
  - "1" (disabled)
  - "2" (disabled)
  - "3"
  - "4" (disabled)
  - "5" (disabled)
  - "6" (disabled)
  - "7" (disabled)
  - "8" (disabled)
- MENU 222 "Popup" (Home System Demo)
  - "Outpost" (disabled)
  - "Barren" (disabled)
  - "Backward" (disabled)
  - "Normal" (disabled)
  - "Advanced" (disabled)
  - "Thriving"
  - "Abundant" (disabled)
- MENU 223 "Popup" (Home System w/ Std Option Demo copy)
  - "Outpost" (disabled)
  - "Barren" (disabled)
  - "Backward" (disabled)
  - "Normal" (disabled)
  - "Advanced" (disabled)
  - "Thriving" (disabled)
  - "Abundant" (disabled)
  - "-"
  - "Based on IQ"
- MENU 224 "Popup" (Years Per Turn Demo)
  - "10" (Mcmd 6011)
  - "20" (disabled, Mcmd 6012)
  - "30" (disabled, Mcmd 6013)
  - "50" (disabled, Mcmd 6014)
- MENU 12345 "" 

## Text styles (Txtr)

| Txtr | name | font | size | style | justification | colour |
|---|---|---|---|---|---|---|
| 128 | System Font | System Font | 0 | plain | left | #000000 |
| 129 | App Font | application font | 0 | plain | left | #000000 |
| 130 | Geneva 9 | Geneva | 9 | plain | left | #000000 |
| 131 | Geneva 9 italics | Geneva | 9 | italic | left | #000000 |
| 132 | Geneva 9 Bold | Geneva | 9 | bold | left | #000000 |
| 133 | Geneva 9 Bold Centered | Geneva | 9 | bold | center | #000000 |
| 134 | Big Font | Charcoal | 24 | plain | center | #000000 |
| 135 | Geneva 9 Bold Right | Geneva | 9 | bold | right | #000000 |
| 200 | Std System Font | application font | 13 | plain | left | #000000 |
| 201 | Std System Font Bold | application font | 13 | bold | left | #000000 |
| 202 | Small System Font (Right) | system font | 11 | plain | right | #000000 |
| 203 | Small System Font Bold | system font | 11 | bold | left | #000000 |
| 204 | Label Font | application font | 10 | bold | left | #000000 |
| 205 | Label Font (Centered) | application font | 10 | bold | center | #000000 |
| 206 | Small System Font | system font | 11 | plain | left | #000000 |
| 207 | Battle Font | application font | 12 | plain | center | #ffffff |
| 300 | System Font | system font | 0 | plain | left | #000000 |

## The program's own pane classes (CTYP)

- `BSwi` LBuildShipsWindow (from `dlog`)
- `FdtB` LFleetsDataBrowser (from `datB`)
- `GAwi` LGamesWindow (from `wind`)
- `GRwi` LGraphHistoryWindow (from `wind`)
- `GdtB` LGamesDataBrowser (from `datB`)
- `HOrv` LHoResizerView (from `HOvw`): Top Item Pane ID, Bottom Item Pane ID, Top Item Min. Size, Bottom Item Min. Size, 2nd Top Item Pane ID, 2nd Bottom Pane ID
- `HOvw` LHoView (from `view`)
- `Hbar` LHoBarControl (from `HOvw`): Bar Control Type, Bar Width, Bar Space, Bar Height, Left Space, Scrollbar Pane ID
- `Hbtv` LHoBattleView (from `HOvw`)
- `Hend` LHoEndTurnView (from `HOvw`)
- `Hgrf` LHoGraphView (from `HOvw`)
- `Hinc` LHoIncomeView (from `HOvw`)
- `Hmap` LHoMapView (from `HOvw`)
- `Hmsg` LHoMessageView (from `HOvw`)
- `Hpil` LHoPiles (from `HOvw`): Normal PICT ID, Disable PICT ID, Type (0=money,1=metal)
- `Hpll` LHoPlayerListView (from `HOvw`)
- `Hrpt` LHoReportView (from `HOvw`)
- `Hsmv` LHoSampleMapView (from `Hmap`): Galaxy Size Control, Galaxy Density Control, Galaxy Shape Control, Randomize Button, Num Humans Popup, Num Computer Popup, Computer IQ, Player Home System, Computer Home System, Time Limit, Humans BB checkbox, Computers BB checkbox, Text Summary Pane ID
- `Hstv` LShipTypeView (from `HOvw`)
- `MAwi` LMapWindow (from `wind`)
- `OFdl` LOrganizeFleetsDialog (from `dlog`)
- `PSwi` LPreStartWindow (from `wind`)
- `PdtB` LPlayersDataBrowser (from `datB`)
- `RBdl` LReviewBattleDialog (from `dlog`)
- `REwi` LReportWindow (from `wind`)
- `STTV` LShipTypeColumnView (from `colv`)
- `StdB` LShipTypesDataBrowser (from `datB`)
- `StrB` LExplStarsDataBrowser (from `datB`)
- `aGUY` LAnimatedGuy (from `pane`)
- `aoPC` LAnimatedOffsetPICT (from `pane`): Num Images, Forward and Back?, First PICT Res ID, Ticks Per Frame, Relative Left, Relative Top, Relative Right, Relative Bottom
- `datB` LDataBrowser (from `pane`): Pass On Control Chars, Pass On Other Chars
- `etNA` LEditTextNumberArrows (from `etxt`)
- `etxS` LEditTextSubmitter (from `etxt`): Ignore Tabs
- `hatt` LHintAttachment (from `atch`): Hint Text
- `lfdB` LListFleetsDataBrowser (from `datB`)
- `lpDB` LLobbyPlayersDataBrowser (from `datB`)
- `mPan` LMonetPane (from `pane`): Filename
- `mpdB` LMasterPointsDataBrowser (from `datB`)
- `qtIM` LQuickTimeImage (from `pane`)
- `slUP` LSliderUpdater (from `slid`): Updater Pane ID

