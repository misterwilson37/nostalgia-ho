# Missing art and sound, per skin

This is a running list for future creative work: what each skin still borrows from
another skin, or leaves silent, because its source game has no picture or sound for it.
Update it when a skin gains or loses art.

The versions came in this order: **2.0** (Windows 3.1 1992, DOS 1993), **4.0.5** (Mac and
Windows 95, 1996), **5.0.5** (Mac). Each later version added features, and with them new
pictures and sounds, so an earlier version's skin is naturally missing the art for things
that hadn't been invented yet. A feature a later version dropped means the later skin
needs an entry here too.

- The **classic** skin (the Mac 5.0.5 art and sounds) is complete and is the fallback for
  every other skin.
- Anything another skin doesn't provide is drawn with the classic art. Sounds are the
  exception: a skin can choose silence instead.
- Each borrowed picture below links to the classic file it borrows, so it can be redrawn
  in the other version's style.

## The same things in every version (a style guide)

Five things every version draws. Compare these when making a stand-in for one version
from another's picture.

| | 5.0.5 (classic) | 2.0 (DOS, Windows 3.1) | 4.0.5 (Windows 95) |
|---|---|---|---|
| Your colony, with your hat | <img src="../assets/sprites/planet3.png" alt="planet" height="40"> <img src="../assets/sprites/white0_0.png" alt="hat" height="40"> [`planet3`](../assets/sprites/planet3.png) + [`white0_0`](../assets/sprites/white0_0.png) | <img src="../assets/skins/dos/sprites/i1000.png" alt="your planet" height="40"> [`i1000`](../assets/skins/dos/sprites/i1000.png) | <img src="../assets/skins/w95/sprites/b1053.png" alt="your planet" height="40"> [`b1053`](../assets/skins/w95/sprites/b1053.png) |
| A computer player's planet | <img src="../assets/sprites/bad3_0.png" alt="face" height="40"> [`bad3_0`](../assets/sprites/bad3_0.png) | <img src="../assets/skins/dos/sprites/i2003.png" alt="face" height="40"> [`i2003`](../assets/skins/dos/sprites/i2003.png) | <img src="../assets/skins/w95/sprites/b2003.png" alt="face" height="40"> [`b2003`](../assets/skins/w95/sprites/b2003.png) |
| A ship (engine, hull, nose) | [`ships`](../assets/sprites/ships.png) (one sheet of parts) | <img src="../assets/skins/dos/sprites/d12100.png" alt="engine" height="32"><img src="../assets/skins/dos/sprites/d12199.png" alt="hull" height="32"><img src="../assets/skins/dos/sprites/d12350.png" alt="nose" height="32"> [`d12100`](../assets/skins/dos/sprites/d12100.png) [`d12199`](../assets/skins/dos/sprites/d12199.png) [`d12350`](../assets/skins/dos/sprites/d12350.png) | <img src="../assets/skins/w95/sprites/b2600.png" alt="engine" height="32"><img src="../assets/skins/w95/sprites/b2699.png" alt="hull" height="32"><img src="../assets/skins/w95/sprites/b2850.png" alt="nose" height="32"> [`b2600`](../assets/skins/w95/sprites/b2600.png) [`b2699`](../assets/skins/w95/sprites/b2699.png) [`b2850`](../assets/skins/w95/sprites/b2850.png) |
| A satellite | <img src="../assets/sprites/satellite.png" alt="satellite" height="40"> [`satellite`](../assets/sprites/satellite.png) | <img src="../assets/skins/dos/sprites/d12401.png" alt="satellite" height="40"> [`d12401`](../assets/skins/dos/sprites/d12401.png) | <img src="../assets/skins/w95/sprites/b2901.png" alt="satellite" height="40"> [`b2901`](../assets/skins/w95/sprites/b2901.png) |
| A money message | <img src="../assets/sprites/m9000.png" alt="money" height="40"> [`m9000`](../assets/sprites/m9000.png) | <img src="../assets/skins/dos/sprites/i3110.png" alt="money" height="40"> [`i3110`](../assets/skins/dos/sprites/i3110.png) | <img src="../assets/skins/w95/sprites/b3110.png" alt="money" height="40"> [`b3110`](../assets/skins/w95/sprites/b3110.png) |

Title pictures, for the overall look: [5.0.5 `p6999`](../assets/sprites/p6999.png),
[2.0 `d998`](../assets/skins/dos/sprites/d998.png) / [`d999`](../assets/skins/dos/sprites/d999.png), [4.0.5 `b316`](../assets/skins/w95/sprites/b316.png).

## What a full skin provides

This is the checklist for a new skin (cozy, scifi …). The names are the classic skin's
sprite and sound names (`assets/manifest.json`). A skin built on the classic page
replaces them through `window.HOTHEME` (see `js/skins/dos/ui.js`). A skin with its own
page can use any names it likes.

| Slot | Classic names | Used for |
|---|---|---|
| Planets | `planet0`–`6`, `mined0`–`6` (7 sizes), `pmask0`–`6`, `hot`, `icecap`, `metal0`–`4` | a planet drawn by size, temperature and metal |
| Unknown planets | `unknown`, `soon`, `battle` | unexplored, fleet on its way, battle seen |
| Novas | `nova0`–`4` (turning red), `nova12` (explosion), `nova18` (wreck) | Original and DOS rules |
| Hats | `white0`–`3_0/1` (yours: profitable / good / so-so / hostile; man / woman), `bad0`–`15_0/1` (16 computer players) | owner shown on the planet; faces in the Players window |
| Ships | `ships` (one sheet of parts), `part*`, `colony*`, `satellite*`, `dread*`, `tanker*`, `bio*`, `decoy*`, `eyeship*` | a ship's picture from its type and tech |
| Fleet markers | `dot0`–`4` × type 0–6 × count 0–3 | the little squares beside planets |
| Map extras | `haloAlly`, `haloSel`, `sun` | ally underline, selection, galaxy centre |
| Battle | `debris`, the planet picture in the `ships` sheet | battle replay |
| Message pictures | `m9000`–`m9051` | one per kind of report |
| Big pictures | `p3030` (won), `p3040` (lost), `p6999` and `t7000`–`7017` (title animation) | |
| Rank pictures | `assets/explore/01`–`25.jpg` | Original rules ranks |
| Panel extras | `tempbar`, `g*`, `crit*` | planet panel bars and markers |
| Sounds | `2000` good news, `2001` bad news, `3000`–`3003` battle, `4000`/`4001` fleet stays/goes, `5000`–`5003` messages and pacts, `6000`–`6002` explored (good/so-so/bad), `7001` next message, `7002` evacuate, `7003` scrap, `7006` build, `7016` out of range, `7013`–`7020` reports, `7021` won / eliminated / new rank, `7022`/`7023` title, `8000` meteors, `11111` end turn, `128` new game | |
| Music | `assets/theme.mp3` | title screen (optional) |

## classic

Nothing is missing. A few things are drawn by code rather than with art; a new skin could
give them pictures:

- the glow round the selected planet;
- the ring showing satellites at a planet;
- route lines and arrows;
- the white backing behind fleet markers;
- the End Turn clock button;
- the toast pop-ups.

## dos (DOS 2.0)

The DOS 2.0 game (and the identical Windows 3.1 2.0 game) has fewer pictures and sounds
than the Mac 5.0.5 game.

### Pictures borrowed from classic

- **Planet details.** The DOS planet icons don't show size, heat, ice caps or metal; the
  game picks one of a few icons by profit, gravity and metal. A creative version could
  add these to the DOS look.
- **Novas:** none. The 2.0 game hasn't got novas yet, so there's no nova picture; with other
  rules a nova shows as a plain empty planet. To draw: the turning-red stages [`nova0`](../assets/sprites/nova0.png), [`nova1`](../assets/sprites/nova1.png), [`nova2`](../assets/sprites/nova2.png), [`nova3`](../assets/sprites/nova3.png), [`nova4`](../assets/sprites/nova4.png), the explosion [`nova12`](../assets/sprites/nova12.png) and the wreck [`nova18`](../assets/sprites/nova18.png).
- **Ships added after 2.0** (Original and Claude rules only): Dreadnought [`dread`](../assets/sprites/dread.png), Tanker
  [`tanker`](../assets/sprites/tanker.png), Biologicals [`bio0`](../assets/sprites/bio0.png), [`bio1`](../assets/sprites/bio1.png), [`bio2`](../assets/sprites/bio2.png), [`bio3`](../assets/sprites/bio3.png), Decoy [`decoy`](../assets/sprites/decoy.png), the eye ship [`eyeship`](../assets/sprites/eyeship.png).
- **Fleets:** the DOS game marks only your own fleets at a star, all with the same small
  icon (`s3114`), plus a white ring for satellites. It draws nothing for fleets in flight
  or for anyone else's fleets. The skin does the same, except that it keeps the icon on
  your fleets in flight so they can still be picked. A per-ship-type marker would be a
  creative addition.
- **Message pictures:** the DOS game has a picture for each kind of report (tech, new year,
  money, scrapping, ships, explored planet, the other player's face, else your own icon).
  Reports that only exist in other rulesets (alliances, armageddon, ranks …) get your own
  icon.
- **Battles:** the DOS battle replay uses the small ship parts, mirrors the right-hand
  side and shows sparks (`s12000`–`12003`) on hits; the skin still uses the classic
  battle replay with the DOS ship pictures. The battle won/lost pictures `d3500`/`d3510`
  aren't shown yet.
- **Other pictures:**
  - the rank pictures, [`assets/explore/01`–`25.jpg`](../assets/explore/) (ranks came later);
  - the alliance underline [`haloAlly`](../assets/sprites/haloAlly.png) (alliances came later);
  - battle [`debris`](../assets/sprites/debris.png);
  - the temperature and gravity bars [`tempbar`](../assets/sprites/tempbar.png), [`g3550`](../assets/sprites/g3550.png), [`g3551`](../assets/sprites/g3551.png), [`g3552`](../assets/sprites/g3552.png), [`g3553`](../assets/sprites/g3553.png), [`g3554`](../assets/sprites/g3554.png), [`g3555`](../assets/sprites/g3555.png);
  - the alert picture `d3520` and the message-bar backdrop `d5030`.
- **Hats for players 16–19:** the DOS game has 20 computer faces and the engine uses 16,
  so four DOS faces go unused.

### Sounds

The DOS game has 14 sounds, and the Windows 3.1 build shows where each is used: 1000 the
click (and most reports), 2000/2001 good and bad news, 3000–3003 battle shots, 4000/4001
fleet stays/goes, 5000 message sent, 6000–6002 exploring, 7000 end of turn. The skin
follows that. Everything else is silent, as in the DOS game:

| Classic sound | Plays for |
|---|---|
| `5001`–`5003` | pact and chat replies |
| `7002` | evacuate, quit |
| `7003` | scrap |
| `7004` | baby boom |
| `7016` | out of range |
| `7021` | new rank |
| `7022`/`7023` | title animation |
| `8000` | meteor shower |

There is no theme music.

### DOS art not used yet

These are available in `assets/skins/dos/sprites/` for later:

- `d3500` / `d3510`: battle won / lost; `d3520`: the alert and game-info picture;
- `d3550`: a skull (not used by the 2.0 game either);
- `d1002`: the "2.0" frame (startup screen); `d9999`: the New World Computing logo;
- `d5001`: the pressed End Turn button; `d5030`: the message-bar backdrop;
- `i3010`/`i3011`: "Planet"/"Player" in the Send Message window; `i3000`–`3002`: "I like",
  "I don't like", "I own";
- `i3020`–`3024` (galaxy shapes), `i3030`–`3032` (computer skill), `i3040`–`3044` (sizes),
  `i3050`/`i3051` (dense/sparse): the Create Galaxy window's icons;
- `i128`, `i200`–`203`, `i2499`: not used by the 2.0 game;
- the other small `s*` icons and the 40×40 small ship parts `d12600`–`12926`;
- `d12251`–`12256`: two hidden special ships (now shown for the right designs).

The Windows 3.1 build adds one picture the DOS one lacks: its own title card (`d1000`,
"Windows Programming by Steven Ohmert"). It isn't extracted.

## amiga (Amiga 2.0)

The Amiga version (German, 1994; Amiga conversion by Stefan "Bebbo" Franke) is the DOS 2.0
game, so it is missing everything the DOS skin is missing (above). It has two sets of the
same pictures: 256 colours for AGA Amigas (identical to the DOS pictures, so not used) and
16 colours for older Amigas, which is what this skin shows. Differences from the DOS skin:

- **Its own:** the one-piece title picture ([`title`](../assets/skins/amiga/sprites/title.png))
  and the German End Turn button "Zug Ende / Amiga+Z"
  ([`d5000`](../assets/skins/amiga/sprites/d5000.png)). The skin shows an English copy
  ([`endturn`](../assets/skins/amiga/sprites/endturn.png)) that `tools/extract/amiga.py`
  draws into it: E, n, d and u copied from the German lettering, T and r made to match.
- **Not in the Amiga set:** the DOS title halves (`d998`, `d999`; replaced by `title`),
  `d9999` and the unused icons `i128`, `i200`, `i202`, `i203`, `i3011`, `s200`–`202`.
- **Amiga art not used yet:** three extra 40×40 planets
  ([`d12758`](../assets/skins/amiga/sprites/d12758.png)–`d12760`), a help picture
  ([`a539`](../assets/skins/amiga/sprites/a539.png)), an asterisk (`a536`) and the New
  World Computing bird and name (`a537`, `a538`).
- **Sounds:** the same 14 as DOS.
- **Text:** the game's 838 German strings are in
  [`strings.json`](../assets/skins/amiga/strings.json). The page itself stays in English.
  The Amiga version also played by mail ("Briefspiel": each player's moves saved to a file
  and merged) and over a network; neither can be done here (see hot seat in the README).

## mac12 (Mac 1.2, French, black and white)

Spaceward Ho! 1.2F for the Macintosh (Delta Tao and Upgrade Editions, Paris, 1992). It keeps
its pictures like 3.0.1 and with the same numbers, so this skin is the 3.0.1 skin pointed at
[`assets/skins/mac12/`](../assets/skins/mac12/sprites/), with the DOS skin's planet and report
icon choices (1.2 has the same set of icons as the DOS game).

- **Its own:** the French title picture ([`p1001`](../assets/skins/mac12/sprites/p1001.png):
  "Programme: Peter Commons, Graphismes: Howard Vives", "Version 1.2") and the big 81×76
  ship parts `p2100`–`p2426` (white backgrounds; 3.0.1 has only the 40×40 ones).
- **Translated:** its End Turn button says "Fin Tour"
  ([`p5500`](../assets/skins/mac12/sprites/p5500.png)); the skin shows 3.0.1's English one,
  which is the same picture in English ([`endturn`](../assets/skins/mac12/sprites/endturn.png)).
  The title picture is still in French. A creative version could redraw its two French
  lines in English.
- **Missing:** colour. 1.2's colour pictures were in a separate file, "TheHo F CPicts", which
  wasn't in the archive. 1.2 has 13 sounds (no "next message" click, no "Move 'em out!").

## mac2, mac2c (Mac 2.0.1, black and white and colour)

Spaceward Ho! 2.0.1 for the Macintosh (Delta Tao, 21 January 1992: the program's date on its
disk; its `vers` says "Copyright Delta Tao Software, 1990-2"). 2.0 runs in colour when "TheHo
Color Picts" is beside it and in black and white otherwise, so there are two skins: **mac2**
([`assets/skins/mac2/`](../assets/skins/mac2/sprites/), 393 pictures: 90 ICN#, 62 ics#, 241
PICT) and **mac2c** ([`assets/skins/mac2c/`](../assets/skins/mac2c/sprites/), 397: the
program's own colour icons, icl8 and ics8, and the colour file's 231 PPMp and 13 PICTs under the
black-and-white names). Both have the program's 13 sounds; the colour file has none.
`tools/extract/mac2.py` writes them (from the .rsrc forks or the two .dc42 floppies).

The skins are the mac3 skin's code with 2.0's own hooks (`window.HOMAC2`). 2.0.1's icons are
1.2's, the DOS game's set, so planets and report pictures are the DOS skin's choices, as in the
mac12 skin; the ship pictures are the big 81×76 parts on a white battle screen, as 1.2's.

- **Against 1.2 (mac12):** 389 of the 393 black-and-white pictures and all 13 sounds are the
  same files. 2.0.1's own are the splash [`p1003`](../assets/skins/mac2/sprites/p1003.png)
  ("2.0", the cowboy planet riding a space shark), the About box
  [`p1001`](../assets/skins/mac2/sprites/p1001.png) ("Version 2.0", in English) and the
  cleaned-up End Turn button [`p5500`](../assets/skins/mac2/sprites/p5500.png)/`p5501` ("End
  Turn ⌘T"; 1.2's says "Fin Tour", and 3.0.1's English one is the same picture as 2.0.1's).
- **Against 3.0.1 (mac3, mac3c):** 3.0.1 has more icons (its planets 1010–1020, the report
  pictures 3105–3164, 4011–4017) and no big ship parts; of the pictures both have, 2.0.1 differs
  in the application icons (`i200`–`i203`), the New Game icons `i3000`–`i3032`, `i3110`, `i3111`,
  the title pictures and, in colour, the selection rings and five report icons. 2.0.1 has 13 of
  3.0.1's 21 sounds (no click, no "Move 'em out!", no pact sounds); `2001`, `4001`, `6001` and
  `6002` were re-recorded for 3.0.1.
- **Against the DOS 2.0 (dos):** the DOS game's colour ship parts (`d12100`–`d12926`) are 2.0.1's
  colour PPMp 12100–12926 pixel for pixel (the DOS ones with their white made see-through), and
  130 of its 153 icons are 2.0.1's colour icons; the rest differ by the DOS palette (the faces
  `i2001`–`i2010`, the hands `i3001`/`i3002`) or were redrawn (`i3051`, `i3115`, `i3116`). The
  DOS sounds are 2.0.1's thirteen at PC rates (22050 / 11025 Hz instead of the Mac's 22254 /
  11127, the same number of samples), plus a click (`1000`) the Mac game hasn't got. The DOS
  title, End Turn button, rings and won/lost pictures are its own.
- **Its own in the skins:** the start-up window (DLOG 1201, colour 1200: the splash over Open
  Game, New Game), the End Turn button, the message border (`p5530`, the colour one teal) round
  the event messages at the bottom left of the map, the menus (MENU 129, 131–133: File, Options,
  Ships, Galaxy), the dialog frames of its DLOGs (dBoxProc and altDBoxProc), the 2.0.1 Changes'
  50% grey budget bars for colonies losing money (black and white) and the black line on the map
  window's left edge.
- **Guessed:** the colour skin's bar for a colony losing money is red (the release notes call
  such planets "red"; the colour bars' colours aren't in the resources, they're drawn by the
  code). The title plays the good-news sound (2000), as the 1.2 and DOS skins do; 2.0 has no
  "Move 'em out!".
- **Not in the remake, so not in the menus:** Open, Save, Revert, Close, End Turn & Switch
  Players, Page Setup, Print Map (File); the Edit menu; Force Turn Update, I'll Update Turns, Set
  Polling Time (network play), Set Battle Speed (the replay has its own speed), Show Event
  Messages, Give Overspending Warnings (Options; Review Announced Battles is the remake's
  Preferences, which the skin puts in Options); Create New Ship Type
  and Organize Fleets (Ships; the remake designs in the build window); Fix Spending, with its black
  break-even line on each bar (Galaxy); the Window menu (Tech Spending Window, Report Window).
- **Not extracted:** PICT 4010, the licensee's plate under the splash and the About box, is in
  neither file (the program draws it). The cursors (CURS 128–135) and the WDEF/CDEF window and
  control code are not art.
- **2.0.1 art not used yet:** the 40×40 ship parts `p2600`–`p2926` (the skins show the big ones);
  the About box `p1001`; the battle won / lost, neutral and eliminated dudes (`p3500`, `p3510`,
  `p3020`, `p3550`); the pressed End Turn `p5501`; the New Game icons (`i3000`–`i3051`); three
  colour globes `p2758`–`p2760`; the empty face frame `i2499`; the small fleet icons
  `s12000`–`s12003`.

## mac3 (Mac 3.0.1, black and white)

Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993). The program's own pictures are
black and white; on a colour Mac it read colour versions from a second file, "Ho! 3.0 Color
Picts". There are two skins: **mac3** (black and white) and **mac3c** (colour: every picture
the colour file has, in [`assets/skins/mac3c/`](../assets/skins/mac3c/sprites/), under the
same names). Both use the DOS skin's code, so they are missing what the DOS skin is missing
(above), with these differences:

- **Its own:** the credits title picture ([`p1001`](../assets/skins/mac3/sprites/p1001.png)),
  an English End Turn button "End Turn ⌘T" ([`p5500`](../assets/skins/mac3/sprites/p5500.png),
  pressed: `p5501`), won and lost pictures (`p3530`, `p3540`) and the Mac sounds with their
  5.0.5 numbers, including "Move 'em out!" (10000, played on the title screen).
- **Smaller ship pictures:** the parts are 40×40 (`p2600`–`p2926`), shown at twice the size.
  There are no 81×76 ones as in DOS.
- **The battle planet** is the plain planet icon `i1004`: 3.0.1 has no battle planet picture
  of its own that we've found.
- **3.0.1 art not used yet** (for features the DOS 2.0 game lacks, e.g. alliances,
  surrender, battle luck): icons [`i3140`](../assets/skins/mac3/sprites/i3140.png) (black
  cat: bad luck), [`i3142`](../assets/skins/mac3/sprites/i3142.png) (horseshoe: good luck),
  `i3150`–`i3164`, `i4011`–`i4017`, `i1010`–`i1013`, `i1512`, `i1513`, `i1600`, the
  168×56 strips `p6100`–`p6140`, the "Version 3.0" picture `p1003`, and `p506`/`p507`/`p510`/`p511`
  (rings with a halo).
- **Colour art not used yet:** the purple space backdrop
  ([`p6000`](../assets/skins/mac3c/sprites/p6000.png), 128×128, for tiling behind the map),
  the planet surface strips `p6100`–`p6140` with the sphere shapes `p6150`/`p6151` (3.0 drew
  rotating planets from these), red nova frames (32×32 icons `i700`–`i740`)
  and twinkling-star frames `p750`–`p758`.
- **Not in 3.0.1:** `i128` and `i2499` (unused by the DOS skin too).

## mac4, mac4c (Mac 4.0.5, black and white and colour)

Spaceward Ho! 4.0.5 for the Macintosh (Delta Tao, 1996), the program the Windows 95 4.0.5 was
ported from. Like 3.0.1 it has black-and-white pictures of its own and reads colour ones from a
second file, "Ho! 4.0 Color Picts", so there are two skins: **mac4**
([`assets/skins/mac4/`](../assets/skins/mac4/sprites/), 418 pictures) and **mac4c**
([`assets/skins/mac4c/`](../assets/skins/mac4c/sprites/), 496: every picture the colour file has,
under the black-and-white names, the rest black and white). Both have the same 42 sounds (37 from
the program, 5 from the colour file). `tools/extract/mac4.py` writes them.

The skins are the mac3 skin's code with 4.0's own hooks. 4.0 numbers its icons as the Windows
4.0.5 numbers its bitmaps, so planets, report pictures and ship parts go where the w95 skin puts
them (read from SPACEHO.EXE); the Mac program's own code hadn't been decompiled when the skins
were made, so a Mac difference there would not show yet.

- **Its own:** the splash ([`p1003`](../assets/skins/mac4c/sprites/p1003.png), "Spaceward Ho!
  Version 4"), and in colour the cowboy planet's title animation (`p7000`–`p7023`), the planets
  and faces (`i1000`–`i2519`), the 40×40 ship parts (`p2600`–`p2926`) and whole ships
  (`p2260` the basic scout, `p2261` the biological, `p2263` the dreadnought), the round End
  Turn button ([`p5500`](../assets/skins/mac4c/sprites/p5500.png)), the selection rings
  (`p502`/`p503`; in colour cut from the sheet [`p500`](../assets/skins/mac4c/sprites/p500.png)),
  the game won and lost pictures (`p3530`, `p3540`), its menus (MENU 129–134: File, Options,
  Ships, Galaxy, Window) and the System 7 dialog frames of its DLOGs.
- **The End Turn button's window** shows the year (`T.endTurnYear`), as 4.0 and the Windows
  clock do (4.0 also showed the time left there; the remake has no time limit). The
  digits are the remake's own (white, bold Geneva): 4.0's font for them wasn't read.
- **A nova's wreck** is the classic picture [`nova18`](../assets/sprites/nova18.png), as in the
  w95 skin; the red frames 4.0 has for a star turning red and exploding (colour icons
  `i728`–`i741`, [`p750`](../assets/skins/mac4c/sprites/p750.png)–`p758`) aren't shown, only `i1403`.
- **Not in 4.0 at all:** the alliance underline, rank pictures (4.0.5's Master Point List shows
  the w95 skin's cowboy planets in every skin), battle debris (classic), and for 5.0.5's special
  ships the classic pictures.
- **Not extracted:** PICT 4010, new in 4.0.5's program: no art but the registration plate under
  the splash, with the licensee's name and serial number in text.
- **Sounds:** 4.0's numbers mean other things than 5.0.5's, so the set maps the remake's events
  to them as the w95 skin does by name (`MAC4_MAP` in `js/skins.js`); End Turn plays "New Turn"
  (7000), as 3.0.1 does. Not used: `7004` bonus time, `7005` hurry up, `7012` time's almost up
  (the turn timer), `7009` "Check this out!", `7016` "Don't cheat", `7008` ship building (too
  short to hear), and the colour file's `7006` ("ROLF,LOL"), `7007` ("Smile"), `7010` ("ChkChk")
  and `7011` ("Yeah-hoo! Engage Dreadnought"). "Move 'em out!" (10000) plays when the title
  opens, as in the 3.0.1 skin.
- **4.0 art not used yet:** the battle won / lost and neutral dudes (`p3500`, `p3510`, `p3020`);
  the dreadnought's animation frames `p2264`–`p2277` and a second scout picture `p2262`; the
  explosion frames `p7500`–`p7505`; the planet window's globe strips `p6100`–`p6140` with the
  sphere masks `p6150`/`p6151`, and the landscapes `p6000`–`p6005` (colour) and `p6050` (black
  and white); the money, debt and metal chips `p4051`, `p4053`, `p4061`; the message border
  `p5530`; the halo rings (yellow and blue rows of `p500`, `p506`/`p507`, `p510`/`p511`); the
  Send Message and New Game icons (`i3000`–`i3051`); the New World Computing logos `p7080`/`p7081`;
  the credits text `p1001`; the Christmas planet `i1404` (Santa).

**4.0.1 against 4.0.5.** The 4.0.1 program and colour file (1995) have the same art with these
exceptions, all in the colour file: 4.0.5 adds the home planet strip
[`p6109`](../assets/skins/mac4c/sprites/p6109.png) ("New Earth planet by Joe", the 4.0.3 notes'
"new home planet picture"); seven globe strips (`p6106`, `p6107`, `p6114`, `p6125`, `p6131`–`p6133`)
were cut again one pixel wider; two more (`p6108`, `p6113`) were packed again with the same pixels;
and the ring sheet `p500` grew from 289×237 to 290×240 with the same first frames. The
black-and-white pictures, icons, menus and all 42 sounds are the same. None of these is a picture
the skins show, so there is no separate 4.0.1 skin.

## palm (Spaceward Ho! 5 for Palm OS, 1.0.4)

The Palm game (MobileFreon, 2003) is 5.0 recompiled, and its pictures are 5.0.5's redrawn
for 160×160 and 320×320 screens (the skin uses the 320×320 ones). It is the classic skin
with Palm pictures where the Palm game has them (where each goes is in
`docs/palm-findings.md`) and a Palm OS look.

- **Its own:** the splash ([`b1007`](../assets/skins/palm/sprites/b1007.png)), planets drawn
  whole in seven sizes (`b2101`–`b2107`; the classic skin builds them from layers), whole-ship
  pictures for special designs (`b6000`–`b6015`) and three-part ships from 40×40 parts
  (`b6100`–`b6404`), the won and lost pictures (`b9401`–`b9404`).
- **No sounds at all:** the Palm game never got its sampled sounds (its release notes list
  them as missing to the end). A creative version could add some.
- **Palm art not used yet:** the smaller planets for tiny boxes (`b2201`–`b2207`), the
  galaxy-shape icons (`b3201`–`b3207`), the Enemies and Allies marks (`b3300`–`b3302`), the
  best-buddy halo (`b3401`), the explosion frames (`b5000`–`b5002`), the T/M bar (`b9500`).
- **Borrowed from classic:** everything the classic skin draws by code, and any picture
  5.0.5 has that the Palm game hasn't (the map uses Palm pictures throughout).

## w95 (4.0.5, Windows 95)

Where 4.0.5 uses each picture and sound was read from SPACEHO.EXE. 4.0.5 sits between 2.0
and 5.0.5: it has most of 5.0.5's features, so less is borrowed than for DOS.

### Pictures borrowed from classic

- **A nova's wreck:** [`nova18`](../assets/sprites/nova18.png). 4.0.5 shows a swollen sun ([`b1403`](../assets/skins/w95/sprites/b1403.png)) while a star
  is turning red or exploding, then nothing at all where the star was.
- **The eye ship and other 5.0.5 special ships** ([`eyeship`](../assets/sprites/eyeship.png)): 4.0.5 has its own two hidden
  specials ([`b2751`](../assets/skins/w95/sprites/b2751.png)–[`b2756`](../assets/skins/w95/sprites/b2756.png)) instead.
- **Rank pictures**: 4.0.5's ten ranks have no pictures of their own; its Master Point
  List shows a cowboy planet by points, [`b122`](../assets/skins/w95/sprites/b122.png) (under 5,000), [`b123`](../assets/skins/w95/sprites/b123.png) (under
  50,000) and [`b125`](../assets/skins/w95/sprites/b125.png) (500,000 and more), in every skin. Its picture for 50,000 to 499,999,
  bitmap 124 (0x7c), is not in SPACEHO.EXE (`FUN_00482b89` asks for it), so 4.0.5 and
  the remake show none there.
- **Message pictures** for reports 4.0.5 doesn't have: they get your own planet icon.
- **Battle debris** [`debris`](../assets/sprites/debris.png): 4.0.5 draws shrinking and growing ellipses when a ship
  dies, and sparks ([`b12000`](../assets/skins/w95/sprites/b12000.png)–[`b12002`](../assets/skins/w95/sprites/b12002.png)) on hits.

### 4.0.5 art not used yet

- the nova explosion animation [`b7728`](../assets/skins/w95/sprites/b7728.png)–[`b7741`](../assets/skins/w95/sprites/b7741.png) then [`b7750`](../assets/skins/w95/sprites/b7750.png)–[`b7758`](../assets/skins/w95/sprites/b7758.png);
- the dreadnought's animation frames [`b7261`](../assets/skins/w95/sprites/b7261.png)–[`b7274`](../assets/skins/w95/sprites/b7274.png) (the skin shows frame
  [`b7260`](../assets/skins/w95/sprites/b7260.png));
- the planet window's rotating globe strips ([`b6100`](../assets/skins/w95/sprites/b6100.png)–[`b6130`](../assets/skins/w95/sprites/b6130.png), ice caps
  [`b6150`](../assets/skins/w95/sprites/b6150.png)/[`b6151`](../assets/skins/w95/sprites/b6151.png)) and landscapes by temperature ([`b1300`](../assets/skins/w95/sprites/b1300.png)–[`b1305`](../assets/skins/w95/sprites/b1305.png));
- the terraform/mine split slider [`b1410`](../assets/skins/w95/sprites/b1410.png) with its knob [`b1411`](../assets/skins/w95/sprites/b1411.png);
- money and metal piles [`b311`](../assets/skins/w95/sprites/b311.png) (money), [`b312`](../assets/skins/w95/sprites/b312.png) (debt), [`b313`](../assets/skins/w95/sprites/b313.png) (metal);
- the 16×16 planet and face icons ([`b8000`](../assets/skins/w95/sprites/b8000.png)–[`b9519`](../assets/skins/w95/sprites/b9519.png)) used when zoomed out;
- the ally / best-buddy halos (rows of [`b175`](../assets/skins/w95/sprites/b175.png); [`b13000`](../assets/skins/w95/sprites/b13000.png)/[`b13001`](../assets/skins/w95/sprites/b13001.png) in the
  player list), and the selection ring's 5-frame animation;
- the New Game option icons [`b114`](../assets/skins/w95/sprites/b114.png)–[`b133`](../assets/skins/w95/sprites/b133.png) and the message-type icons
  [`b10000`](../assets/skins/w95/sprites/b10000.png)–[`b10014`](../assets/skins/w95/sprites/b10014.png);
- the pressed End Turn clock [`b367`](../assets/skins/w95/sprites/b367.png), the report window background [`b345`](../assets/skins/w95/sprites/b345.png), the
  About/start-up pictures [`b316`](../assets/skins/w95/sprites/b316.png) and [`b383`](../assets/skins/w95/sprites/b383.png) (New World logo), and [`b3520`](../assets/skins/w95/sprites/b3520.png);
- the Christmas planet [`b1404`](../assets/skins/w95/sprites/b1404.png) (25 December) and the "Peter"/"Howard" easter-egg planets
  [`b3115`](../assets/skins/w95/sprites/b3115.png)/[`b3116`](../assets/skins/w95/sprites/b3116.png) ([`b3615`](../assets/skins/w95/sprites/b3615.png)/[`b3616`](../assets/skins/w95/sprites/b3616.png)).

### Sounds

All 37 sounds are wired to their 4.0.5 events except: `ahem` and `checkout` (what triggers
them is unclear), `bonus`, `timeup` and `hurryup` (the turn timer and network play aren't
in the remake), `nocheat` (4.0.5's cheat detector) and `shipbp` (the 4.0.5 game never plays
it). There is no theme music.

## 5.0.5 entries for things 4.0.5 had

4.0.5 features that 5.0.5 dropped, so the classic skin has no art for them when you play
with the 4.0.5 rules (they fall back to general pictures):

- the "your population now exceeds …" milestones and the "a big battle just took place"
  rumours (4.0.5: [`b4024`](../assets/skins/w95/sprites/b4024.png), [`b3119`](../assets/skins/w95/sprites/b3119.png));
- the turn timer (the clock with time left, and its `bonus` / `timeup` sounds);
- the ten 4.0.5 ranks (Red-Neck … Ho! Champion) and the Hall of Shame (every skin shows
  the 4.0.5 Master Point List's pictures);
- the money and metal piles and the planet window's globe and landscapes (5.0.5 shows
  planet pictures and the explore pictures instead).

## cozy, scifi (planned)

Everything: these skins don't exist yet. Use the checklist at the top.
