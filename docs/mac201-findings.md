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

## Open (102 rows)

`node tools/display-audit.js mac201 --open` lists them. The windows the 2.0.1 program added still show the classic page's windows (marked the remake's own) or
nothing; each is a row to read from the decompile: `CreateGalaxyDlg`, `ComparePlayers` / `DRAWCPBARGRAPH`, `SendMessage`, `ListPlayerSkills`,
`doAutoPlayDialog`, `doPollingTimeDialog`, `DoNewPlayerDlg`, `ForceEndTurn`, the printing routines. Of the changed routines, found so far without a
display change: `LongToNiceString` (the string data only: "%d,%.3d", the comma the 1.2 audit already gave English), `DrawPlanetRect` (degrees: 1.2F's
Celsius, 2.0.1's Fahrenheit, STR# 4000 texts held as literals), `DoFileMenu` / `DoGalaxyMenu` (the new menu items' cases); one real change
read but not yet carried into the table: `PlayAnnounceSound` has a different table of report codes (`cmpi #$39` against 1.2's `#$3b`).
