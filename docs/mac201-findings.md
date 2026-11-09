# Mac 2.0.1: the display audit (November 2026, begun)

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
- **Not built:** Compare Players (DLOG 6050) with its bar graph (`DRAWCPBARGRAPH`), Show Skills, the Create Galaxy dialog (DLOG 6080: four lists of pictures ICN# 3020-3051 and a size slider), the Identify / Join dialogs
  (4000, 4010). They stay the classic page's windows (docs/remake-controls.md); their rows stay open.
