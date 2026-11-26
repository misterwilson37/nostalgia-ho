# Mac 5.0.5: status, screen by screen

**Read this first when working on 5.0.5's look.** As `docs/status-301.md`, `status-mac405.md` and `status-w95.md`: each line is one
screen or part of the original; it is done only when the remake matches Jake's capture (a few pixels off is fine) and the
**Evidence** column says where each part came from. Update the line in the same commit as the work.

Sources:
- Captures (private repo): `audit/mac-5.0.5/crops/mac505-jake-shotNNN.png`, Jake's 19 Nov game in SheepShaver (Mac OS 9.0.4, the
  full copy), cropped to the 1024 x 768 screen; `ORDER.txt` maps numbers to the original file names. 001-033 start-up, menus and
  every window; 034-139 play with six battles in bursts; 140-157 late game, a supernova, conquest, a second game lost; 158-168
  Armageddon. `part01` is a 1024 x 222 grab of shot 097's battle labels.
- Layouts: `docs/505-windows.md` (every PPob, WIND, RidL, STR#, MENU, Txtr from the resource file). The main window is PPob 136.
- Code: `decompiled/mac-5.0.5/` (PowerPC; PowerPlant classes named from their type information); `docs/coverage-505.md` names
  every routine; `docs/original-findings.md` the rules.
- Jake's play-test issues (bugs of the original, patch candidates): `docs/issues-505-android.md` (M1-M6 Mac, A1-A5 Android).

## Where it stands (26 Nov 2026)

The rules are done (`js/rules-original.js`: 185 of 190 rule routines, `coverage-505.md`). **The look is not.** No 5.0.5 skin
exists: ruleset `original` opens in `classic`, the remake's own page (a grey sidebar with Savings / Budget / Technology / star
boxes, a menu bar Game Ships Galaxy View Help, a report card at the foot), dressed with 5.0.5's pictures and sounds.

Whole screen at 1024 x 768, `?skin=classic&rules=original` beside shot 011 (first load, a new game):

| Part | 5.0.5 (shot 008 / 011, PPob 136) | The remake today |
|---|---|---|
| Frame | Mac OS 9 Platinum: menu bar Apple File Edit Ships Galaxy Window Help, clock, application menu; one document window "Peter in Milky Way in 2000" filling the screen; the Control Strip at the bottom left (the OS's, not the game's) | no window; a menu bar Game Ships Galaxy View Help on the right |
| Left column (197 wide) | `LHoIncomeView` (Metal / Savings / Income, 40 high); Tech bars `TBAR` (Range (6) … Radical, on dark blue); budget bars `PBAR` (Savings, Tech, then each colony, coloured; a scroll bar); a resizer; the players list `LHoPlayerListView` (face, name, a Myself / Enemy / Ally pop-up each, ticks); the graph `LHoGraphView` with its ten bevel buttons | four grey boxes in another order; no players list, no graph |
| Map | black, the stars' pictures and names; the selected star's green ring; hovering a star shows the floating info box (name, Income, Pop, Temp, Grav, Metal, a gauge) | black with a star field; the star's facts in the sidebar box |
| End Turn | `LHoEndTurnView`, the glass globe with the turn clock (0:00), at the map's bottom left | the clock in the report card |
| Reports | the floating **Message History** window (PPob 143) with face icons; the bubble `LHoMessageView` | a card at the foot of the map |
| Chat strip | `Sdvw` under the map (network play; hidden in a local game: shot 008 has none) | none (correct for a local game) |

So 5.0.5 is where 4.0.5 was on 19 Nov: the screen has to be built from its own layout and routines, then each window.

## Plan (units, in order; each stands alone)

| # | Unit | Shots | Done |
|---|------|-------|------|
| 0 | Decide where it lives (Jake): a new skin for 5.0.5 (proposed id `mac5`, Platinum frame, offered first for `original`) or the `classic` skin rebuilt | | asked 26 Nov |
| 1 | Frame: Mac OS 9 menu bar with clock and application menu, the map window (PPob 136) with its title, scroll bars, resizers; scaled to the browser like `setMacScale` | 008-011 | |
| 2 | Left column: income view, Tech bars, budget bars (`LHoBarControl` types 1 and 2), resizer | 008-016, 034 | |
| 3 | Players list with relationship pop-ups; the graph and its ten buttons | 008, 032 | |
| 4 | Map: stars, names, ring, fleets, routes, the drag line, the hover info box; zoom | 008-024 | |
| 5 | End Turn globe and clock; the bubble; Message History window | 008, 034 | |
| 6 | Menus (MENU 128-…, xmnu), each dropped down: words, keys, dimming | 008-014, 023-024, 031, 033 | |
| 7 | Windows A: Build Ships (137), Organize / Group Fleets (140), List All Fleets (166), Explored Stars (145), Scrap Ship Types (165) | 015-022 | |
| 8 | Windows B: Preferences (139), Rank History (163), About (162), Give (154), Dip (157), Send Message (160), Surrender (147), Auto Play (159), Radical (153), Graph History (138) | 009-013, 25-32 | |
| 9 | Start-up: Startup Dialog (130/149), Create Individual Game (233, the OS 9 one) | 001-005 | |
| 10 | Battles: Review Battle (141), the animation (beam, starburst, flares, "one dead"), face of the loser | 035-139 | |
| 11 | End of game: You Won / Lost (150/151), Name a Star (156), Armageddon (152), Abandon Hope (158), supernova, conquest | 140-168 | |
| 12 | Jake's issues: M1-M4 read in the code (bugs of the original: unpatched keeps them only if deterministic; the patch fixes); M5 fuel and colonists in the fleet label under modern conveniences | | |
| 13 | Wrap-up: real-play at four sizes, digests, human-play, ui-lang-audit, notes-check; screens beside captures for Jake | | |

Method (Jake's 20 Nov lesson): put the whole screen, as it first loads, beside the capture before calling anything done; then each
part zoomed x3 beside the same part. Fix from the layout and the code, never from a guess.
