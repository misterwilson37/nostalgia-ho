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
   The work is on branch `claude/sweet-gauss-eodehy` (from
   `claude/pensive-hamilton-f2tm02`).
2. Each changed pane from 3.0.1's own routine, one commit each, this table updated in the same commit: ~~`DrawIncomeRect`~~ (done),
   ~~`DrawPlanetRect` + `DrawPieChart`~~, ~~`DoGratuitousGraphics`'s turning planet~~ (done; its second part, the map's twinkling
   stars, goes with the map), ~~`DrawFleetRect` + `DrawSelectedFleetInfo`~~ (done), ~~`DrawBudgetRect` + `DrawHBarControl`~~
   (done, with `DrawIconRect`), ~~`DrawVBarControl`~~ (done). Next:
   - ~~The map's stars~~, ~~fleet paths and the drag line~~ (done: see the table).
   - ~~`UpdateReportWin` + `DrawMessage`~~ (done).
   - ~~`DrawAnnounceBubble`~~ and the End Turn button's place (done).
   - The main screen is now whole. Real-play (17 Nov): `mac3c` and `mac3` pass at desktop and phone-l, 9/9 bars (the panes' canvases
     list their bars in `data-bars` for the tool); `mac2c` still passes; pad and 4k pass too (both skins, 9/9 bars). At 4k the map is the original's size, one CSS pixel a pixel, so
     the galaxy fills its top left, as in the 2.0.1 skins. Then (Jake, 17 Nov: "scale the whole Mac", every Mac skin): the Mac's
     screen is made as big as the window allows (`setMacScale` in `js/skins/mac12/ui.js`): x1.5 at 1280x960 and 1512x982, x2 at
     2560x1440, x3.5 at 4k; phones and the pad as before. Real-play passes `mac12`, `mac2`, `mac2c`, `mac3`, `mac3c` at all four
     sizes. Before staging: Jake's look.
   - ~~The menus~~ (done 17 Nov: `menuLayout301`, the Menus table). Every Mac skin's menus now write their keys ⌘N, as the MENU
     resources do (they wrote the DOS skin's "[N]").
   - ~~The start-up and new game screens~~ (done 17 Nov: the table). The 2.0.1 dialogs' CSS (`.dl20`, the colour frame, the status
     bar) moved to `js/skins/mac12/panel.css` for both. Real-play presses a dialog's default button after End Turn (the play-alone
     question); `mac3c`, `mac3` pass at desktop and phone-l.
   - ~~List of All Fleets, Explored Stars, Compare, Skills~~, ~~Organize Fleets~~ (done 17 Nov: the table).
   - ~~Build / Design Ships~~ (done 18 Nov: the table). ~~Give~~, ~~Alliances~~, ~~Send Message~~ done: every window from the menus is built. ~~The battles~~ (close, 18 Nov: the table). Next: the end of the game (the plan's session 4).
   - **Jake's 18 Nov play-test** (Retina MacBook Air, Firefox), one commit each:
     1. ~~Battle timing~~: done. 3.0.1 works the battles out in the update without showing them (DoBattleStage passes 0 to
        DoOneBattle); `GoToNextAnnouncement` @161bc8 calls `DoMessageAction(report, 0)` @161e44 for each report as it is announced,
        before it selects the star and draws the bubble, and for a battle report (0x407 / 0x408) with Review Event Battles on (Stup
        +0x46) that is `ReviewBattle` @e2d36. The 3.0.1 skins no longer play every battle before the reports (`afterTurn12`, kept for
        1.2 and 2.0.1); `T.battleBeforeCard` has the report card open the battle first, the previous bubble left under it, then draw
        its own card. Checked with a staged battle at the home star: "Year 2010:" card, the battle, its report, the metal report.
     2. Battle drawing (the destruction flare, a hit on the planet's explosion and population, rays reaching the planet): to do.
     3. ~~The modern conveniences' battle speed~~: done. The classic battle windows' Speed list (Slow / Normal / Fast / Skip to the end,
        `openBattle`, `openBattlePanel`) is gone, and "battle speed" is out of the modern conveniences' words (five languages). The
        programs' own battle speed settings (1.2's, 2.0.1's, DOS's, Windows', 5.0.5's Battle Review Speed) stay: they are the originals'.
     4. ~~Zoom~~: done. (a) The wheel (js/skins/classic/ui.js `wheelZoom`): a trackpad's many small wheel events are added up, and a
        skin with zoom levels of its own (the Mac, Amiga and framed DOS skins) steps one level a swipe (then waits for the swipe to end,
        or 0.9 s); a trackpad pinch (wheel + ctrlKey) likewise; a finger's pinch steps a level for each 0.35 of its log. Other skins zoom
        smoothly by the delta. (b) "Opens far out": the remake stacked Tech Spending and the Report Window under the panes, so the
        column was ~760 Mac pixels high and `setMacScale` stayed at x1 on a laptop (1470 x 832: the map at the original's 17 in a
        1100-pixel window). Now they are in `#main`'s bottom row as on the original's 640 x 480 screen (shot040: Tech Spending under
        the panes, the Report Window 253 wide at the screen's right under the map, white between): grid cells, not fixed boxes, so the
        Mac is 480 high and scales x1.5 at 1470 x 832 and 1280 x 720, x2.25 at 1920 x 1080. The opening zoom stays the original's 17
        (now x1.5); the modern conveniences' closer zooms are unchanged. A page 760 wide or less keeps them in the panel's column.
     5. ~~Hall of Fame / Shame by ruleset~~: done. Each entry this computer writes keeps its ruleset and skin (`e.rules`, `e.skin`;
        older entries take their Hall's ruleset). The Hall window (classic `openHall`, which the Mac and Windows skins dress) has an
        Edition list: this game's edition (the default: the version's own Hall, as it kept it), All editions (newest first, with an
        Edition column), or another edition with a Hall (3.0.1, 4.0.5, Mac 4.0.5). Each row's date, Details and Play Again are its own
        edition's. "Everyone" (the shared Hall) follows the same list: the cloud keeps a Hall per ruleset already. Not done: the skin on
        the shared Hall (it would need firestore.rules changed and deployed); the iOS skin's own Hall window has no Edition list.
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
| Personalize your copy | 002 | DLOG 4030 | differs | not built, as in the 2.0.1 skins: the remake takes the name from New Game and the account (a licence name is never a stranger's) |
| Startup window, B&W and colour | 003, 009 | DLOG 1200, 1201 | same | close: PICT 1003 (colour 1002, the colour skin's p1003) over Open Game and New Game, framed as the 2.0.1 skins' (the same DLOG); the licensee's plate (PICT 4010, drawn by `GetLicensePict`) is not drawn |
| Name the new galaxy (System 7's file box) | 004, 164 | system | n/a | ? |
| Open a game (System 7's file box) | 010 | system | n/a | ? |
| Create New Galaxy | 005, 006, 165 | DLOG 6080 | differs | **done** (`createGalaxy301`): DITL 6080's rectangles; the four lists with Cluster and Diabolical, the computers' number and slider, Years Per Turn… and its years, Alliances, Cancel, Create; the remake's own choices under "More…" |
| Please Identify Yourself | 007, 011 | DLOG 4000 | same | not built, as in the 2.0.1 skins (a game file shared between machines; the remake's players are set at New Game) |
| New player: name, skill, sex | 008 | DLOG 4010 | differs | not built (as 4000): the skill is New Game's, the sex the Preferences' |
| Play alone or wait for more humans | 015, 166 | ALRT 3230 | same window, items differ | **done** (`playAlone301`): asked at the year-2000 End Turn with one human until Continue (`EndTurnMenuCall` @120da4, the header's +6 byte); Wait leaves the turn unended, as `CheckTurnDone` does. ALRT 3070 (two humans or more) is not shown: the hot seat hands over instead |
| Status box (Writing Game File, Pass N for Player N, Battle Stage) | 017-019, 169-174 | DLOG 7000 | items same, window differs | **done**: 2.0.1's `status20` (the same items) in the colour Mac's frame (`html.col20`), "Writing New Game File..." (STR# 4000.1) after Create, the passes at each End Turn |
| Years Per Turn | not seen | DLOG 4120 | new | close (`yearsPerTurn301`, from DITL 4120 and `doYearsPerTurnDialog` @f0c28): the question, five radio buttons, Cancel, OK; user item 9 (74 x 74 at 80, 188) is drawn by a routine not read yet and is left empty |

## The main screen

| Part | Captures | 3.0.1 code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Arrangement of the windows | 012, 040 | `ResetWindows`, `SetWindowLocations` | same code | **done** (panes down the left: planet 68, fleets 65, money 34, players beside budget; Tech Spending under them and the Report Window beside it under the map, at the screen's right, as shot040 (18 Nov, second try: `#main`'s bottom row, grid cells zoomed with the Mac; the first, a fixed box over the map's foot, broke in Jake's Firefox); the heights measured in shot012/040: rules at 105/107, 170/172, 205, 370) |
| Map window: stars, names, fleets | 012-014, 066 | `DrawGalaxyMap`, `DrawOneColorStarSubProc`, `DrawOneBWStarSubProc`, `SetBlinkLocs`, `CalcFleetsAtAllStars`; zooms and scrolling as 2.0.1's (`ZoomIn`, `ZoomOut`, `ThumbMapWindow` same code) | differ | close (`drawStar301`, `mapUnder301`): black map, each star's blinking points, icons 32/16 or dots by zoom, halos (colour PICT 500/504/508 and smalls; B&W 502/503 and the ally's white cap), the abandoning pattern, ICN 3114 for your fleets and others', the satellites' ring, names white (condensed at 9); the Spiral/Cluster map of 2000 (PICT 6000, the disc, "Map will be created in 2010."); 2.0.1's zooms, cells and scroll bars; your selected fleet is dragged from its star. Left: zoom 6's dot colour (the star's colour index, +10, not read: white); a star gone nova is not blacked out; in the 2000 view only the picture is moved (a click on your home there misses); the End Turn button's place (PICT 5000 at (3, 2) on the map) |
| Fleet paths on the map | 014, 066, 076 | `DrawFleetPaths`, `MapLine`, `DetermineArrowTips` | new; differs | close (`fleetPaths301`, `dragLine301`): the orders' lines 2 x 2 in the grey pattern, green (colony) or cyan, from where the fleet is; the drag line XORed white, light grey when out of reach, arrowheads, the distance on its black box; matches shot066. Left: the "Show Fleets Paths" preference (no 3.0.1 Preferences window: always on, its default); the drag line only over a star, as 2.0.1's (FollowPathDrag not compared in detail); fleets in flight have no marker of their own (3.0.1 draws none) |
| Planet pane (with the pie chart) | 012, 042 | `DrawPlanetRect`, `DrawPieChart`, `DoPieClick`; `DoGratuitousGraphics` | differs, new | close (`planetBox301`, `pieChart301`): words (STR# 1005, 4000), places, grey and the pie's colours (XWinProc @180bae's colour table, as an 8-bit screen shows them) and B&W patterns (ltGray, dkGray), PICT 600's ring, the drag; matches shot042. and the turning planet on black once terraforming or mining is done (`gratuitous301`: the strip by gravity, the night side's 224-frame cycle, ice caps and desert by temperature, the 14 stars that cross as a column because the program never spreads them; every 10 ticks as IdleTheHo). **done** but for a frame-by-frame check against a capture of the turning (shot012/040 are single frames; they agree) |
| Fleet pane | 012, 040 | `DrawFleetRect`, `DrawSelectedFleetInfo`, `DrawOneFleet`, `DrawOneOtherFleet`, `ClickInFleetRect`, `DrawDragBarRect` | differ | close (`fleetBox301`): the A5 world's rects (fleet 70..129, the black drag bar 130..132, the scroll bar 214..226 x 89..131), STR# 4000.11-.21, rows bold/italic/condensed, the selected row inverted, scrap's grey pattern, other players' rows (`rs.otherFleetRow`), a click selects. Left: the scroll bar is drawn plainly (an OS control); dragging the drag bar to resize the pane (`ClickInDragBar`) is not built |
| Money pane (Reserve Metal, Ship Savings, Total Money) | 012, 040 | `DrawIncomeRect` | differs | **done** (`incomeBox301`: STR# 1005.2-.9, the program's "(Int: %s)"; bold labels right at 87, values at 90, changes right at 225; grey 0xBBBB in colour; Ship Savings red when below 0; the rules at 32 and 225. Fields: +0x1c `p.metal`, +0x10 `p.savings`, +8 `p.net301`, +0x14 `p.oInterest`, +0x24/+0xc `p.chg`) |
| Players list and budget bars | 012, 040 | `DrawIconRect`, `DrawBudgetRect`, `DrawHBarControl`, `DoHBarClick` | differ | close (`lowBox301`): rects (players 0..67, budget 79..214, their scroll bars), rows of 18 and 14, icons, halo, crosses, checks; the heading (Sort, 0%, Log/Linear, 100%, ticks by GetHPercBarAmt); bar colours from the colour table (Ships' oranges by share, Tech's hue by length, colonies blue/green/red by terraform and mine), HSV edges, label colours, "Abandoning", the income of a finished colony; B&W black and 50% grey; drag via `rs.dragShare`, the heading switches the scale; matches shot040. Left: "Sort" does nothing yet (DoHBarClick's sort not read); the order of the players is the remake's faces sorted (3.0.1 numbers them 0..n-1); the scroll bars are drawn plainly; colours are exact RGB, not the 8-bit palette's |
| End Turn button | 012, 031 | `EndTurnButtonShowing`, `DrawGalaxyMap` | new | close: PICT 5000 (colour) / 5500 at (3, 2) on the map once the reports are read (the classic button, placed by `afterMsg301`). Left: EndTurnButtonShowing's hot-seat conditions are the classic page's |
| Tech Spending window | all | `CreateTechWin`, `UpdateTechWin` (same code); `DrawVBarControl`, `DoVBarClick` | same code; differs | **done** (`techBox301`): the words as 2.0.1's (STR# 1001.12-13), grey in colour; the six bars, axis, ticks (the 50-pixel log table), the hue by height with its edges, the names alternating; a drag spreads the others; matches shot012 |
| Reports window | all | `CreateReportWin` same code; `UpdateReportWin`, `DrawMessage`, `DrawSpecial`, `ClickInReportWindow`, `AddNewMessage` | differs | close (`reportsBox301`): 2.0.1's rows (32 a report, icon then the wrapped sentence from 35), with DrawSpecial's face or cross over the icon (the template found by matching STR# 1000); the click as 2.0.1's (InvertRect 5 ticks, then the action); the last 80 reports kept (`rs.reportHistory`, digest unchanged). Left: the scroll position by its own bar (the remake opens at the year's first, as 2.0.1's ScrollReportToCurrentDate; 3.0.1's differs slightly, not compared) |
| Report bubble on the map (--more--) | 016, 092, 108, 149 | `DrawAnnounceBubble` | differs | close (`afterMsg301`): 185 x 79 at the map's bottom left in PICT 5030/5530, the icon at (18, middle - 24) with DrawSpecial, the text from (58, 8), "more…" (4000.22) only while more follow; matches shot016. Left: the remake's Review battle button is hidden in the bubble (battles open from the Report Window or as reviewed); the hot-seat branch (icon 3110 with another player's text) not built |

## Menus

| Menu | Capture | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Apple | 031 | MENU 128 | differs | close: "About Spaceward Ho! 3.0…" first in the skin's "Ho! 3.0.1" menu, then the remake's own items; the About box is PICT 1000 / 1001 (DLOG 1100 / 1101, `DoAppleMenu` @f3b48: sound 10000 in colour), without the licensee's plate |
| File | 032 | MENU 129 | differs | **done** (`menuLayout301`): items, ⌘ keys (⌘† for End Turn & Switch Players) and dimming as `SetMenuItems` @f4492: Save and Revert dimmed (the remake saves every change), Force Turn Update for the first human with two humans or more, Page Setup and Print dimmed (no Mac printing in a browser) |
| Edit | 033 | MENU 130 | same | **done**: every item enabled, as the capture and the MENU's flags have them (1.2's and 2.0.1's dim them) |
| Options | 034 | MENU 131 | differs | **done**: Auto Play (dimmed for a player out of the game), Sound checked, I'll Update Turns checked and dimmed under two humans, Preferences, the two Halls (always enabled) |
| Ships | 035 | MENU 132 | differs | **done**: the words of STR# 1010 by the selection (Build/Design Ships… / Can't Build Ships Here…, Organize Ships… / No ships to organize…, Scrap / Don't Scrap Current Fleet, Review Battle at %s… / No Battles here…), dimmed as `SetMenuItems`; the windows they open are the table below's |
| Galaxy | 036 | MENU 133 | differs | **done**: Fix Spending dimmed while reports are unread; Abandon Planet on your colony ("Don't Abandon Planet" / "Abandon Planet", 1010.15/.16); Alliances, Give, Surrender, Send Message dimmed in 2000; Alliances, Surrender and Armageddon dimmed for a player out of the game; Armageddon checked while the switch is on. Graph History opens the remake's players-and-history window (3.0.1's Graph, DLOG 6055/6056, is not in Jake's games) |
| Window | 037 | MENU 134 | differs | close: both windows checked; Zoom In / Out dimmed at 17 / 6; Hide / Show Information (⌘I, 1010.11/.12) takes the info panes off (`ShowHideMapInfo`: their width 226 or 0); the map window does not grow into their place yet. Clean Up Windows does nothing (the windows are always where `ResetWindows` puts them) |
| Help (System 7's balloons) | 038 | system | n/a | not built (the system's, not the game's; the remake's hover help stands in) |
| Application menu (System 7) | 039 | system | n/a | not built (the system's) |

## Battles

| Screen | Captures | Resource / code | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Battle window | 020-030, 043-064, 077-107, 110-148, 176-193 | DLOG 7010, 7011 | same | close: 2.0.1's `battleWindow` (the same DLOG; `HaveGroupShoot` the same code) with 3.0.1's `DoOneBattle` @e0aee differences: no title bar, Chicago and Geneva (the skins' bitmap faces), the name at the face + 67, each side's luck (ICN# 3141 + luck, 3140 bad, 3142 good, none for 0: rules-301 keeps it on the record as `lk`, display only, the digest unchanged), the Skip / OK button with OK's default ring. Left: `DrawOneGroup` and `DrawAllGroups` (DIFF) not compared line by line; the battle speed: an earlier agent's unfinished work (private repo `audit/mac-3.0.1/unfinished-agent-work-16nov.patch`, 16 Nov, otherwise superseded by this skin) says 3.0.1's default is 10 ticks with "Groups Shoot Together" adding the wait once a group's turn; 3.0.1's 'Stup' 1000 has +0x4e = 1 and +0x52 = 10 where 2.0.1's has 30 and 1, so the fields moved: read `HaveGroupShoot` / `WaitTicks` before changing the 30 the window uses now |
| Shots, explosions, ships lost | same | `DrawLaserBlast`, `DrawExplosion`, `DrawShipPicture` | differ | close: 2.0.1's drawing, the colour bolt and ovals in the colour skin too (`DrawLaserBlast` is 764 bytes in both; `DrawExplosion` 594 / 586, `DrawShipPicture` 1416 / 1424: not compared line by line) |
| Won / lost / destroyed at once (the words under the picture) | 041, 063, 047, 107 | code | ? | close: STR# 1030's lines at (155, 135) and (155, 150), PICT 3000 / 3500 (won) and 3010 / 3510 (lost) at (180, 175), as `DoOneBattle` draws them; the no-information lines at (155, 85) and (155, 100) |

## Windows from the menus

| Window | Captures | Resource | Against 2.0.1 | Remake |
|---|---|---|---|---|
| Build / List Ship Types | 065 | DLOG 6000 | differs | close (`build301`, from `BuildDesignShips` @131150, its item cases in the assembly's jump table, `SetButtonStates`, `FindMatchingType`, `CopyInfoAndCalcCost`, `DRAWSHIPMONEYBAR`, `DRAWMETALBAR`): DITL 6000's rectangles; the type list newest first with the count ordered; picking, the Class menu and the five scroll bars (the matching type or a new design with a new name); renaming (15 letters); + / - / the field a ship at a time (development cost while never built, the metal and debt alerts 4001.19 / .25, a new design made a type first: 4001.5, ALRT 3280); Scrap All / Don't Scrap taking back the orders; OK builds them all at once. Left: the list's unpicked pictures on white (the capture's are; here they keep their black), the list's own scroll bar |
| List of All Fleets | 068 | DLOG 6030 | differs | **done** (`fleets301`): DITL 6030's rectangles; the rows of STR# 4000.24-27 in `InitFleetsList`'s order (no satellites; swap-sorted by Ship Power, CalcShipPower, or Ship Class), the first row picked; Go To Fleet as `ListAllFleets` (the standard alert 4001.14 for a fleet in hyperspace, DLOG 6140 / 6141). Its arrival years count ten a turn, as the program does (patch: `listYears`) |
| Organize Fleets | 069 | DLOG 6060 | differs | close (`organize301`, from `OrganizeFleets` @133d14 and `DrawOneOrgFleet`): DITL 6060's rectangles with Next Type; twelve 135 x 45 piles in three columns of four, the count at the left and the small ship picture 15 in; a drag moves one ship (Shift: the pile); Group All, Divide All (total / 12, the rest in the last; the assembly empties the other piles, which the decompile drops); OK with the ruleset's fuel / built-this-turn / colonists rule (`organized301`); Next Type opens the star's next design. Left: the ship picture's exact size inside the pile (the capture's looks narrower) |
| Compare Players | 067, 070 | DLOG 6050 | differs | **done**: the classic page's chart at DITL 6050's rectangles (rules-301 `compare.layout`), now in the program's dress (no title bar, the colour frame, Chicago: `html.mac301 .origdlg`) |
| Skill levels | 071 | DLOG 6100 | window differs, items same | **done**: the classic page's list at DITL 6100's rectangles, in the program's dress |
| List of All Explored Stars | 072 | DLOG 6040 | differs | **done**: the classic page's 3.0.1 list (`InitStarsList`'s order) with 3.0.1's rows (`MakeOneListedStar`: the star's icon, name, temperature, gravity, metal; no Own column; `rs.exploredList.icon`, `status: false`) at DITL 6040's rectangles with the Sort By menu |
| Alliances | 073 | DLOG 6110 | new | **done** (`alliances301`, from `DoAlliancesDlg` @1432a4, `InitAllianceLists`, `SetAllianceLists`): DITL 6110's rectangles; the four lists by whether you like them and they like you, four cells across, the players still in (yourself too, icon 1000); a click moves a player across (on yourself a beep); OK keeps it (the remake's allies, `HO.setPact`) |
| Give Stuff | 074 | DLOG 6120 | new | **done** (`give301`, from `DoGiveThingsDlg` @1437e0, `InitGTPlayerList`, `SetCellsToPlayers`): DITL 6120's rectangles; the other players still in, 5 x 4 cells of their icons and names, the first picked; the two fields kept between 0 and what you have; Give (default) under Cancel, sound 5000; three gifts a turn: ALRT 5010 with STR# 1020.21 |
| Send Message | 075 | DLOG 6070 | differs | close (`chat301`, from `SendMessage` @140fa2; the messages are the engine's `cannedSteps`, 3.0.1's codes $40a-$417): DITL 6070's rectangles; the steps' prompts (STR# 3002, then the message's own), the left list of what is chosen (a click takes it back), the right list's choices (the players still in and Everyone; ICN# 3000-3013; the stars or players named); Erase dimmed with nothing chosen, Send only with a whole message and Done dimmed then; a sent message (sound 5000) starts the window again; ten a turn: ALRT 5010 with STR# 1020.17. Left: Everyone's icon (the capture's grey ball; its ICN# not found yet) |

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
Print (4040), Auto Play (4020, 4021), Graph (6055, 6056), Quick Help (3010), Fleet can't reach (3330),
Too many ship types (3280), Save before closing (5000), Play a Game (3180).

Not shown by 3.0.1 at all: the spending warning (ALRT 5060 is still in its resources, but 3.0.1 has no `GiveSpendingWarning`, the
1.2 / 2.0.1 routine that asked it; the Windows 4.0.5 program has neither the routine nor its words, and Jake saw none in three turns of a
colony at zero, 17 Nov). The rulesets say so already (`underfunded: undefined` in js/rules-301.js and js/rules-405.js).
