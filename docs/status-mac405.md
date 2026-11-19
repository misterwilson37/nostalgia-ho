# Mac 4.0.5: status, screen by screen

**Read this first when working on the Mac 4.0.5 skins (`mac4`, `mac4c`).** As `docs/status-301.md` for 3.0.1: each line is one
screen or part of the original; it is done only when the remake matches Jake's capture (a few pixels off is fine) and the
**Evidence** column says where each part came from. Update the line in the same commit as the work.

Sources (private repo `nostalgia-ho-sources`):
- Captures: `audit/mac-4.0.5/captures/mac405-jake-shotNNN.png` (Jake's games, System 7.5 colour, 640 x 480: won 001-192, lost 193-251;
  armageddon 167-187). Mac OS 9 screens: `audit/mac-4.0.5/captures-os9/`.
- Code: `decompiled/mac-4.0.5/` (the 68k half with MacsBug names; `c/<segment>/<address>-<routine>.c`, `asm/`, `index.tsv`).
  4.0.5 was built with CodeWarrior, 3.0.1 with MPW, so the byte comparison (`audit/mac-3.0.1/routines-301-405.tsv`) says nothing:
  each routine is read.
- Words: `HOLANG.mac405En` (js/lang-data.js: 4.0.5's own STR#, MENU, DITL, DLOG and CNTL, `tools/extract/languages.py --mac405-en`).

## How the skin is built

`js/skins/mac4/ui.js` sets `window.HOMAC4V` and loads `js/skins/mac12/ui.js`, which runs as version 4.0.5: the 3.0.1 path (`V3`) with
`V4` for each of 4.0.5's own routines. **The reason:** 4.0.5's `ResetWindows` @8477a is 3.0.1's @f4b9a line for line, with a third
floating window (Chat) placed in the middle; so the information column, the map window and the windows along the foot are 3.0.1's
arrangement. `mac4/ui.js` keeps what is 4.0.5's own: pictures, planets (`starLook`), report pictures and sounds (`messageLook`), ship
parts (`shipPic`), the title and the End Turn picture (`window.HOMAC4`, applied last by `js/skins/mac3/pictures.js`).
The earlier skin (the classic page with three floating windows over it) is gone (19 Nov).

**The rule:** a part still drawn by the 3.0.1 path is `3.0.1` below until 4.0.5's routine has been read and the capture compared.

## Status key

`wrong`: the remake shows something else. `3.0.1`: the 3.0.1 skin's part, not yet checked against 4.0.5. `close`: matches but for
listed details. `done`: matches.

## The main screen

| Part | 4.0.5 routine | Status | Evidence / what is left |
|---|---|---|---|
| Arrangement | `ResetWindows` @8477a | done | = 3.0.1's @f4b9a (+ Chat window in the middle); shots 008, 012, 031. |
| Money pane | `DrawIncomeRect` @113340 | done | Metal / Savings / Net Income (STR# 6070), grey #cccccc (shot 012), every string white one pixel down-right then black, Geneva 9 bitmap (`DOS Geneva 9`), "(Int: $%s)". Net income = rules' `p.net301` (checked equal to `HO.projected().net` for 12 turns). |
| Fleet pane | `DrawSelectedFleetInfo` @114c12, `DrawOneFleet` @1148d6, `RecalcFleetsAtNewStar` @110644 | close | STR# 6170 words, grey + shadow, first fleet selected (shots 008, 027, 065), rows "one Explorer (1/1) Scout" (rules' `fleetDescAt`, cut 39), Scrap 7/8 after the recycling discovery. Left: the scroll bar is drawn flat, the original's is System 7.5's colour bar (shot 008). Colony "Full" also when at your own colony (@1150fa, star +0x18ff): not read yet; the remake says Full only with colonists. |
| Planet pane | `DrawPlanetRect` @113ab0, `DrawVSliderBar` @11448c, `ClickVSliderControl` @110180 | close | Grey to 108 (98 with the slider), black star field and planet at 139,4 d 56 (shots 008, 027, 158), labels right at 40, values at 45, Chicago 12 name, no Info/Battle Date, three rules. Slider PICT 901/903, drag as ClickVSliderControl (checked: 300 -> 774). Left: 4.0.5's twinkling stars are scattered (shot 008), ours start as one column (3.0.1's routine): read 4.0.5's `DoGratuitousGraphics`. "Income :" spacing: the bitmap Geneva the remake has puts no space before a colon. |
| Budget and players pane | `DrawBudgetRect`, `DrawHBarControl`, `DrawIconRect`, `DoHBarClick` | 3.0.1 | wrong header: ours "Sort 0% Log 100%", 4.0.5 "100%" only (shot 031); 4.0.5's colony rows "Kathoon $51,975"; players list scroll bar. |
| End Turn | `DrawTimeClock` | wrong | 4.0.5's round clock with the turn time ("0:02", shots 008, 031); ours the year picture (PICT 5500 with the year). |
| Map window frame | `CreateMapWin`, `XWinProc` | wrong | 4.0.5's map is a window with a title bar "Jake in Milky Way in 2050" (STR# 6170.2) and a close box; ours writes the title at the right of the menu bar. |
| Map: stars, names, fleets, routes | `DrawGalaxyMap`, `DrawOneColorStarSubProc`, `DrawFleetPaths`, `DrawOneFleet` | 3.0.1 | names in a fallback font (4.0.5: Geneva 9); route lines (shot 012 Spica-Thuban). |
| Report Window | `UpdateReportWin`, `DrawMessage`, `ReportWinProc` | 3.0.1 | 4.0.5's has a scroll bar and its frame at the bottom right (shot 031); "Year 2050:" with a colon (ours "Year 2020."). |
| Desktop between the windows | | wrong | System 7.5's grey desktop pattern (shot 031); ours white. |
| Tech Spending window | `UpdateTechWin` | 3.0.1 | close by eye (shot 031). |
| Announcement bubble | `DrawAnnounceBubble` | 3.0.1 | |
| Menu bar | MBAR 128, `SetMenuItems` | 3.0.1 | the 3.0.1 skin's menus; 4.0.5's MENU 128-134 are in `HOLANG.mac405En.MENU`; shots 011-013, 022-024, 166, 251. |

## Windows, battles, start-up, end of the game

Not started: every window from the menus (shots 014-024), New Game and start-up (001-007, 188-192), battles (033-157, 204-246),
won (163-165), armageddon (167-187), lost (247-251). The 3.0.1 skin's versions show meanwhile.

## Found on the way (other versions)

- **Mac 3.0.1:** `RecalcFleetsAtNewStar` (@15078c) selects the star's first fleet when the selected one isn't there; the 3.0.1 skin
  selected none. Fixed on the shared path (19 Nov).
- **4.0.5 rules (Windows and Mac):** fleets were "one Scout" everywhere; both programs name them by design. Fixed (`fleetDescAt`,
  `docs/status-w95.md` "Needs a shared file").
- **Windows 95 4.0.5 money pane:** checked, right (its Net Income equals the rules' net each turn).
- **Mac 3.0.1 path, older (on live `main` 2789149 too):** at 4k, a galaxy whose home star is near the bottom opens with the home
  star under the bottom row (the view's scroll limit stops about 6 cells short; e.g. 3840x2160, a 20 x 20 galaxy, home at y 17.5:
  oy -229.5 where about -331 is needed). Real-play's select-colony then fails at 4k now and then (mac3c and mac4c). Not fixed yet:
  `fitView` / `barMetrics` in js/skins/mac12/ui.js.

## Checks (19 Nov, session branch `claude/eager-wozniak-kt2eix`)

- Real-play: mac4c/mac405 desktop, phone-l, pad pass; mac4c with 301 and 405 at pad, desktop, 4k pass; mac4/mac405 desktop pass,
  phone-l failed once at select-colony (a tap that selected nothing) and passed on the second run; mac4c/mac405 4k failed at
  select-colony (the opening-view bug above). mac3c (the shared path's fleet change) passes with 301 and mac405 at phone-l, pad,
  desktop and 4k, but once with 405 at pad (the colony under the report bubble's icon: placement). w95 at pad: the known finger-drag
  failure (the handoff's list).
- 405 / mac405 digests: moved only by the arrivals' stored labels (above); 301, dos and the others untouched (no engine change).
- human-play 405, mac405, 301 ok; notes-check ok; ui-lang-audit mac4, mac4c: 10 of 10 ok.
