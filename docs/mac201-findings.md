# Mac 2.0.1: the display audit (November 2026, begun)

**Progress (comparison with Jake's two real games): 1 fleet arrows done; 2 battle animation done (colour); 3 menus and windows partly done (see below), 4 elimination: not yet.**

**Provided by PC Games Vault (pcgamesvault.com) and digitized by Britt Dodd.** (Jake, November 2026: credit for everything that came, or could have come, from the Mac 2.0.1 disks, including copies of the same files from elsewhere.)

*The rules of 2.0.1 are in `docs/dos-findings.md` ("Mac 2.0.1 differs") and `js/rules-mac20.js`. This is its display side.*

## What was made

- **The decompile** (private repo, `decompiled/mac-2.0.1/`, `HOW.md`): the 22 CODE segments, 564 routines (498 named by MacsBug, 66 MPW glue), as asm and C
  with an index. It matches `docs/coverage-20.md` (22 segments, 498 named, 66 unnamed). 554 decompile, 10 fail in Ghidra (read their asm).
- **The table** `docs/display/mac201.json` (`node tools/display-audit.js mac201`): one row for every one of the 564 routines. It is made, and can be made
  again, by `audit/mac-2.0.1/tools/gen201.py` in the private repo from a routine-by-routine comparison with 1.2F (`cmp.py`: the disassembly with addresses,
  jump-table numbers and A5 offsets masked):
  - **421 routines are the same code as 1.2's**; they take 1.2's row (`docs/display/12.json`): internal and not shown stay so; the 73 that 1.2 verified
    against its skin are `matched` here, because the Mac 2.0.1 skins now run the 1.2 skin's window code (below) and none of the resources 1.2's row names differs
    in 2.0.1 beyond its English words (which the 1.2 skin already has: "the words are written here in English as the Mac 2.0.1 program has them").
    The 12 whose row names a resource that differs in 2.0.1 (DITL geometry, MENU, PICT 1001 / 1003) stay open.
  - **75 routines differ and 68 are new** (printing, Compare Players, Send Message, Force Turn Update, Auto Play, polling time, the Create Galaxy and
    New Player dialogs, the skills list, the message and player lists, the region helpers). One that makes no display trap itself is `internal`; every other
    is `open` with a note of what changed (the number of changed hunks, how many of 1.2F's STR# 4000 texts 2.0.1 holds as literals, the display traps it calls).

## The skin

`js/skins/mac2` (and `mac2c`, the colour look) used to be the Mac 3.0.1 skin with a few hooks. 2.0.1's program is 1.2's with additions (the resources
are the same but for words and the added windows: ICN#, icl8, snd, ALRT, DLOG are identical; PICT differs in 1001, 1003, 5500, 5501), so the skin is now the
1.2 skin (`js/skins/mac12/ui.js`, which `mac2/ui.js` loads, with `HOMAC_VERSION` 2.0.1) with 2.0.1's own pictures, title window and
menus: MENU 129, 131 and 133 as the fork has them (File with Revert To Saved, End Turn & Switch Players, Page Setup, Print Map; Options with Force Turn
Update, Auto Play, I'll Update Turns, Set Polling Time; Galaxy with Compare Players and Send Message) and the Edit menu, dimmed. What the remake
cannot do is there and dimmed: Page Setup and Print Map (a browser has no Mac print dialogs), I'll Update Turns and Set Polling Time (the network game).

## Since then (second pass)

- **Settled (to 26 open, 5 gaps).** A trap-and-constant comparison with 1.2 (`audit/mac-2.0.1/tools/sig2.py`, private) settled the changed routines whose Toolbox calls and constants are 1.2's; what differs there is
  text sources (1.2F's STR# 4000 lines are literals in 2.0.1) and record offsets. The star-drawing routines' difference is the **nova state**: 1.2 skips or paints as dead a star whose record value is -100 or -1000
  (written by `CheckForSupernova @a2640`); 2.0.1 has no such routine (docs/dos-findings.md: "2.0.1's EndTurn segment is 1.2F's without the novas"), so nothing writes it and the tests are gone.
  `STR# 1003` is the same 190 names, in the same order, as the Mac 2.0.1 ruleset's.
- **Windows built from 2.0.1's resources** (mac2 / mac2c, `js/skins/mac12/ui.js`): Polling Time (DLOG 4060), Auto Play (4020), Battle Speed at 2.0.1's rectangles (4040), and **Send Message** (DLOG 6070): the cell lists of
  LDEF 1001 (a 45 x 45 cell, the 32 x 32 ICN# at the cell's centre less (16, 21), the name in Geneva 9 under it, a chosen cell inverted), one column of four cells on the left and five by four on the right,
  with the four prompts of STR# 3002, the icons ICN# 3000-3002 and 3010-3011, and Send dimmed until all four steps are chosen. The stars' cells (`SetCellsToNearbyStars`, `SetCellsToOwnedStars`) are listed by name only (gap).
- **Third pass: 0 open.** Built since: the Create New Galaxy dialog (DLOG 6080, `createGalaxy20`), the Force End Turn alert (ALRT 3210), and the two menu conditions read (the header's +6 word is the number of computers, so Force Turn Update is for the first human; mode 4 and up is a player out of the game, so Auto Play needs a player still in it). Compare Players, Show Skills were already drawn at 2.0.1's DITL rectangles by the classic page (`DRAWCPBARGRAPH` read: the rows match) and are left as they are; Identify / Join (4000, 4010) are not shown (a game file shared between machines); the stars' cells of Send Message are the gap. `node tools/display-audit.js mac201` passes with 7 gaps.
- **Earlier note (superseded): not built:** Compare Players (DLOG 6050) with its bar graph (`DRAWCPBARGRAPH`), Show Skills, the Create Galaxy dialog (DLOG 6080: four lists of pictures ICN# 3020-3051 and a size slider), the Identify / Join dialogs
  (4000, 4010). They stay the classic page's windows (docs/remake-controls.md); their rows stay open.

- **Fourth pass: 3 gaps left of 7.** Closed: the Explored Stars window (DLOG 6040, `rs.exploredList.dlg`), List Ship Types (DLOG 6000, `shipTypes20`), Organize Fleets (DLOG 6060), and the alerts (every ALRT's size and DITL rectangles, `alert20`, via `T.alertBox` in `alertOver`). Kept: the pictures of the stars' cells in Send Message's "Which One?" (`SetCellsToNearbyStars`, `SetCellsToOwnedStars`): each cell draws the icon whose id is a word of the star's record (+$e of the 0x32-byte table at -$1ce(a5)); which resource that id names was not traced (nothing found that writes it), so the skin lists the names without a picture rather than guess.

## Jake's captures: fleet arrows (item 1)

From `mac20-jake-shot010..047, 090` and the code (`MapLine @c6f7e`, `StarLine @c70a8`, `MakeArrowRegion @12d70`, the same code as 1.2F's):
- **A route line is drawn only while a fleet is dragged.** `MapLine`'s only caller is `FollowPathDrag @c69ba`; in every capture of an arrow the pointer is at its tip, and after the drop (shot010/011, fleet panel "Departing to: ...") the map has no line. Ours drew every fleet's line all the time: now only while dragging (`T.routesDragOnly`); keeping them is a modern convenience (G.opts.modern, added to MODERN_TEXT in five languages).
- **Single head**: one end, the far one, when the fleet can reach (fuel for one way). **Double head**: both ends, when it can also come back (`MapLine` passes the near-end flag only when the reach flag and the second flag are both set; ours: fuel for twice the distance). **Dashed (grey pattern), no head**: out of reach (shot090). The head: tip on the star's centre, barbs 13 out and 9 back; the line is 2 px; the same width everywhere (no thicker kind in the code; the thicker look in some shots is the head's barbs).
- **The number by the line is the distance (the panel's "Dist"), not the turns**: shot029 line "5" for "Dist 5; Time 3", shot045/047 "4" for "Dist 4; Time 2". `StarLine`'s 3rd argument is the leg's distance record. Ours showed turns: fixed (Mac 2.0.1 skins only, `V2`).
- The line is painted over the stars (PaintRgn): ours is now drawn after the stars (`T.routesOver`).

## Jake's captures: the battle (item 2)

`DoOneBattle`, `HaveGroupShoot`, `DrawLaserBlast`, `DrawExplosion` are 1.2F's code (only record offsets differ: `rdiffs.py`), so the 1.2 skin's window was right in layout; what the colour captures (`shot048..089`, `lost018..023`) add, and the code says, is the colour:
- **The bolt**: a short bar (a fifth of the way) running in five steps, five lines: the centre HSV hue (weapons - 1) x 4000 mod 65535, saturation and value full; the pair beside it hue + 7500, value 45000/65535; the outer pair hue + 15000, value 25000/65535 (`DrawLaserBlast @d3e20`, Pack12). Captured: Sue's Sword (3/3) fighters yellow-orange over olive and green (hue 44 deg), Jake's Conan (5/5) lime over green and teal (88 deg). White in black and white. The step is put back, not painted over, so no ghost line stays.
- **The ovals**: a ship lost (`HaveGroupShoot`: hit points gone gives sound 3003 / 0xbbb; ours had given it to a planet only, so a kill showed no oval): ovals from the middle out, HSV hue (59 - s) x 175, full saturation and value (red at the middle to yellow at the rim, as in shot048/053), then wiped in black the other way. `rules-dos` now gives a kill 3003; `rs.battleSounds` is on for Mac 2.0.1 (the sounds 3000-3003 by the hit's strength, as 1.2).
- The pictures wait: ovals and bolts keep their ticks only while the battle speed's time for the shot lasts (`BattleWait` under `TickCount < deadline`), so at fast speeds they are not seen: Jake's captures were at a slow speed.
- Order checked against the code: shot sound, laser, redraw of the target group, explosion; the planet's population counts down in steps with each hit (shot 090 onwards), "Round n" each round, Skip becomes OK at the end.

## Jake's captures: menus and windows (item 3, first pass)

Compared: File, Edit, Options, Ships, Galaxy, Window (`shot013..018`), the won and lost boxes (`shot103`, `lost027`), Name a Star (`shot105`).
- Words, order and keys of every menu already matched. Differences found and fixed: **I'll Update Turns** is ticked (dimmed) in Options, and **Tech Spending Window** and **Report Window** are ticked in Window (`shot015`, `shot018`).
- **The won and lost boxes** were the classic modal (small, with a close square); now ALRT 5040 / 5041 and 5050 / 5051 as the box of the program (227 x 249 / 235 x 244: the text at the top, the picture 3030 / 3040 (colour 3530 / 3540) in the middle, OK or "Oh, well…" at the foot), as `shot104` and `lost027`.
- **Name a Star** gets its picture (DITL 4050 item 4, PICT 3500 at (118, 10)), which the colour game shows as the black and white sketch (the colour file has no 3500), `shot105`.
- Not changed (left): the text face is Geneva 12 where the program has Chicago 12, so text wraps a little later; the "Review Announced Battles" tick in the captures is Jake's own setting (ours starts unticked, as 1.2's default); the Apple menu and the clock are the remake's (Ho! 2.0.1 title in the menu bar).
