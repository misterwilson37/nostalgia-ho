# Mac 3.0.1: status, screen by screen

**Read this first when working on the Mac 3.0.1 skins (`mac3`, `mac3c`).** Each line is one screen of the original. A line is
done only when the remake matches Jake's capture (a few pixels off is fine) and the **Evidence** column says where every part of
it came from. Update the line in the same commit as the work. Then the next session starts from here, not from a handoff.

Sources (private repo `nostalgia-ho-sources`):
- Captures: `audit/mac-3.0.1/captures/mac301-jake-shotNNN.png` (Jake's games: won 001-163, then lost 164-196, 640 x 480).
- Resources: `audit/mac-3.0.1/dialogs-301.tsv` (every dialog and alert, its size, words and verdict against 2.0.1 and 4.0.5).
- Code: `audit/mac-3.0.1/routines-201-301.tsv` (every named routine against 2.0.1: `same`/`same-code` = provably the same code).

- Decompile: `decompiled/mac-3.0.1/` (`all.c`, `c/<segment>/<address>-<routine>.c`, `asm/`, `index.tsv`; remade 16 Nov 2026).
  Mac 2.0.1's is `decompiled/mac-2.0.1/`, for side-by-side reading of a routine that changed.

## Next (keep this list current)

1. ~~The main screen's arrangement.~~ Done: `js/skins/mac3/ui.js` sets `window.HOMAC3` and loads `js/skins/mac12/ui.js`
   (`HOMAC_VERSION` '3.0.1'), which gives 3.0.1 only `window.HOMAC301` (the panel's arrangement, `panel301`; the Tech Spending
   window's words); then `js/skins/mac3/pictures.js` (the old `mac3/ui.js`). The arrangement's CSS is `js/skins/mac12/panel.css`.
   2.0.1's map keys (KeyTheHo, KeyPlanet, TabThroughFleets) and report click are off in 3.0.1: their routines differ.
   Until item 2 is done the skin is incomplete (the map is still the classic one, the Report Window is empty): real-play on
   `mac3`/`mac3c` is not expected to pass on this branch. The work is on branch `claude/sweet-gauss-eodehy` (from
   `claude/pensive-hamilton-f2tm02`).
2. Each changed pane from 3.0.1's own routine, one commit each, this table updated in the same commit: ~~`DrawIncomeRect`~~ (done),
   ~~`DrawPlanetRect` + `DrawPieChart`~~, ~~`DoGratuitousGraphics`'s turning planet~~ (done; its second part, the map's twinkling
   stars, goes with the map), ~~`DrawFleetRect` + `DrawSelectedFleetInfo`~~ (done), ~~`DrawBudgetRect` + `DrawHBarControl`~~
   (done, with `DrawIconRect`), ~~`DrawVBarControl`~~ (done). Next:
   - ~~The map's stars~~ (done: see the table). Next: `DrawFleetPaths` @15466e (with the Options setting +0x5c), the drag line
     (`FollowPathDrag`, `MapLine`: 3.0.1's own, with the distance), moving fleets, and the End Turn button's place.
   - `UpdateReportWin` + `DrawMessage` (the Report Window's contents; `ClickInReportWindow` differs too).
   - `DrawAnnounceBubble`.
   - Smaller leftovers in the done panes: "Sort" above the budget bars (`DoHBarClick`'s sort), the drag bar's resizing
     (`ClickInDragBar`), and a real System 7 scroll bar for the three lists.
3. Until a pane is done, the skin must not show 2.0.1's version of it as if it were 3.0.1's: keep these on the session branch,
   off staging and live, until the main screen is whole.

## The rule

The remake's Mac 2.0.1 code may be used for a 3.0.1 screen **only** where the tables above say the resource is the same and the
drawing routine is `same` or `same-code`. Everything else is built from 3.0.1's own resource and code, and checked against the
captures. Where neither the resource, the code nor a capture answers, the line says **not seen**, and nothing is filled in from
another version.

## Status key

`wrong`: the remake shows something else. `?`: not compared yet. `close`: matches but for listed details. `done`: matches.

## Start-up and new game

| Screen | Captures | 3.0.1 resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Personalize your copy | 002 | DLOG 4030 | differs | ? |
| Startup window, B&W and colour | 003, 009 | DLOG 1200, 1201 | same | ? |
| Name the new galaxy (System 7's file box) | 004, 164 | system | n/a | ? |
| Open a game (System 7's file box) | 010 | system | n/a | ? |
| Create New Galaxy | 005, 006, 165 | DLOG 6080 | differs | ? |
| Please Identify Yourself | 007, 011 | DLOG 4000 | same | ? |
| New player: name, skill, sex | 008 | DLOG 4010 | differs | ? |
| Play alone or wait for more humans | 015, 166 | ALRT 3230 | same window, items differ | ? |
| Status box (Writing Game File, Pass N for Player N, Battle Stage) | 017-019, 169-174 | DLOG 7000 | items same, window differs | ? |
| Years Per Turn | not seen | DLOG 4120 | new | ? |

## The main screen

| Part | Captures | 3.0.1 code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Arrangement of the windows | 012, 040 | `ResetWindows`, `SetWindowLocations` | same code | **done** (panes down the left: planet 68, fleets 65, money 34, players beside budget; Tech Spending and Reports under; the heights measured in shot012/040: rules at 105/107, 170/172, 205, 370) |
| Map window: stars, names, fleets | 012-014, 066 | `DrawGalaxyMap`, `DrawOneColorStarSubProc`, `DrawOneBWStarSubProc`, `SetBlinkLocs`, `CalcFleetsAtAllStars`; zooms and scrolling as 2.0.1's (`ZoomIn`, `ZoomOut`, `ThumbMapWindow` same code) | differ | close (`drawStar301`, `mapUnder301`): black map, each star's blinking points, icons 32/16 or dots by zoom, halos (colour PICT 500/504/508 and smalls; B&W 502/503 and the ally's white cap), the abandoning pattern, ICN 3114 for your fleets and others', the satellites' ring, names white (condensed at 9); the Spiral/Cluster map of 2000 (PICT 6000, the disc, "Map will be created in 2010."); 2.0.1's zooms, cells and scroll bars; your selected fleet is dragged from its star. Left: zoom 6's dot colour (the star's colour index, +10, not read: white); a star gone nova is not blacked out; in the 2000 view only the picture is moved (a click on your home there misses); the End Turn button's place (PICT 5000 at (3, 2) on the map) |
| Fleet paths on the map | 014, 066, 076 | `DrawFleetPaths` | new | ? |
| Planet pane (with the pie chart) | 012, 042 | `DrawPlanetRect`, `DrawPieChart`, `DoPieClick`; `DoGratuitousGraphics` | differs, new | close (`planetBox301`, `pieChart301`): words (STR# 1005, 4000), places, grey and the pie's colours (XWinProc @180bae's colour table, as an 8-bit screen shows them) and B&W patterns (ltGray, dkGray), PICT 600's ring, the drag; matches shot042. and the turning planet on black once terraforming or mining is done (`gratuitous301`: the strip by gravity, the night side's 224-frame cycle, ice caps and desert by temperature, the 14 stars that cross as a column because the program never spreads them; every 10 ticks as IdleTheHo). **done** but for a frame-by-frame check against a capture of the turning (shot012/040 are single frames; they agree) |
| Fleet pane | 012, 040 | `DrawFleetRect`, `DrawSelectedFleetInfo`, `DrawOneFleet`, `DrawOneOtherFleet`, `ClickInFleetRect`, `DrawDragBarRect` | differ | close (`fleetBox301`): the A5 world's rects (fleet 70..129, the black drag bar 130..132, the scroll bar 214..226 x 89..131), STR# 4000.11-.21, rows bold/italic/condensed, the selected row inverted, scrap's grey pattern, other players' rows (`rs.otherFleetRow`), a click selects. Left: the scroll bar is drawn plainly (an OS control); dragging the drag bar to resize the pane (`ClickInDragBar`) is not built |
| Money pane (Reserve Metal, Ship Savings, Total Money) | 012, 040 | `DrawIncomeRect` | differs | **done** (`incomeBox301`: STR# 1005.2-.9, the program's "(Int: %s)"; bold labels right at 87, values at 90, changes right at 225; grey 0xBBBB in colour; Ship Savings red when below 0; the rules at 32 and 225. Fields: +0x1c `p.metal`, +0x10 `p.savings`, +8 `p.net301`, +0x14 `p.oInterest`, +0x24/+0xc `p.chg`) |
| Players list and budget bars | 012, 040 | `DrawIconRect`, `DrawBudgetRect`, `DrawHBarControl`, `DoHBarClick` | differ | close (`lowBox301`): rects (players 0..67, budget 79..214, their scroll bars), rows of 18 and 14, icons, halo, crosses, checks; the heading (Sort, 0%, Log/Linear, 100%, ticks by GetHPercBarAmt); bar colours from the colour table (Ships' oranges by share, Tech's hue by length, colonies blue/green/red by terraform and mine), HSV edges, label colours, "Abandoning", the income of a finished colony; B&W black and 50% grey; drag via `rs.dragShare`, the heading switches the scale; matches shot040. Left: "Sort" does nothing yet (DoHBarClick's sort not read); the order of the players is the remake's faces sorted (3.0.1 numbers them 0..n-1); the scroll bars are drawn plainly; colours are exact RGB, not the 8-bit palette's |
| End Turn button | 012, 031 | `DrawSpecial` (to confirm) | new | ? |
| Tech Spending window | all | `CreateTechWin`, `UpdateTechWin` (same code); `DrawVBarControl`, `DoVBarClick` | same code; differs | **done** (`techBox301`): the words as 2.0.1's (STR# 1001.12-13), grey in colour; the six bars, axis, ticks (the 50-pixel log table), the hue by height with its edges, the names alternating; a drag spreads the others; matches shot012 |
| Reports window | all | `CreateReportWin` same code; `UpdateReportWin` | differs | wrong: the window is placed, empty until `UpdateReportWin` + `DrawMessage` |
| Report bubble on the map (--more--) | 016, 092, 108, 149 | `DrawAnnounceBubble` | differs | ? |

## Menus

| Menu | Capture | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Apple | 031 | MENU 128 | differs | ? |
| File | 032 | MENU 129 | differs | ? |
| Edit | 033 | MENU 130 | same | ? |
| Options | 034 | MENU 131 | differs | ? |
| Ships | 035 | MENU 132 | differs | ? |
| Galaxy | 036 | MENU 133 | differs | ? |
| Window | 037 | MENU 134 | differs | ? |
| Help (System 7's balloons) | 038 | system | n/a | ? |
| Application menu (System 7) | 039 | system | n/a | ? |

## Battles

| Screen | Captures | Resource / code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Battle window | 020-030, 043-064, 077-107, 110-148, 176-193 | DLOG 7010, 7011 | same | ? |
| Shots, explosions, ships lost | same | `DrawLaserBlast`, `DrawExplosion`, `DrawShipPicture` | differ | ? |
| Won / lost / destroyed at once (the words under the picture) | 041, 063, 047, 107 | code | ? | ? |

## Windows from the menus

| Window | Captures | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Build / List Ship Types | 065 | DLOG 6000 | differs | ? |
| List of All Fleets | 068 | DLOG 6030 | differs | ? |
| Organize Fleets | 069 | DLOG 6060 | differs | ? (b055ec3 fixed a DOS window opening here; the 3.0.1 window is still to build) |
| Compare Players | 067, 070 | DLOG 6050 | differs | ? |
| Skill levels | 071 | DLOG 6100 | window differs, items same | ? |
| List of All Explored Stars | 072 | DLOG 6040 | differs | ? |
| Alliances | 073 | DLOG 6110 | new | ? |
| Give Stuff | 074 | DLOG 6120 | new | ? |
| Send Message | 075 | DLOG 6070 | differs | ? |

## End of the game

| Screen | Captures | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| A player eliminated (report bubble) | 149, 194 | code | ? | ? |
| You won | 150 | ALRT 5040, 5041 | window differs, items same | ? |
| Name a Star | 151 | DLOG 4050 | window same, items differ | ? |
| Armageddon questions | 152, 153 | ALRT 3240-3255 | mostly new | ? |
| Armageddon on the map | 154-163 | code | new | ? |
| You lost | 195 | ALRT 5050, 5051 | same | ? |

## Not in Jake's games (the resource decides; marked so in the remake)

About (DLOG 1100, 1101, 1150, 1151), Preferences (6150), Hall of Fame and Shame (4080, 4090, details 4100, 4110), Surrender (6130,
ALRT 3380, 3390), Dip Into Savings (4070), Join Fleets (4060), Abandon a planet (ALRT 3410, 3420), Hope and Ship jokes (3020, 3030),
Print (4040), Auto Play (4020, 4021), Graph (6055, 6056), Quick Help (3010), Spending warning (5060), Fleet can't reach (3330),
Too many ship types (3280), Save before closing (5000), Play a Game (3180).
