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

**20 Nov: Jake's first look found the screen far from his shots, though the panes had been marked done one by one.** The whole screen, as it
first loads, had never been put beside shot 008. It now is, at 640 x 480 and at 1280 x 960 (x2): `tools`-less, a Playwright screenshot of
`?skin=mac4c&rules=mac405&skill=novice` halved and set beside the shot (the scripts are in the session's scratchpad; the method is what
counts: the whole screen, then each part zoomed x3 beside the same part of the shot). Every row below says which shot it was checked
against. "close" lists what is still off.

| Part | 4.0.5 routine | Status | Evidence / what is left |
|---|---|---|---|
| The screen's frame | `ResetWindows` @8477a, System 7.5's window definition | close | `html.mac75` (js/skins/mac12/panel.css, `frame75` in ui.js), measured in shot 008: menu bar 20 rows; desktop pattern (one black dot in four, the next row offset by two); map window frame (1, 21)-(638, 370) with its shadow; its 17-row title bar (stripes, close box, zoom box, the title in Chicago 12 centred: "Jake in Milky Way in 2000"); the column x 2-226, two black columns, the map 229-637 x 40-369; Tech Spending's windoid (1, 371)-(227, 478) and the Report Window's (387, 371)-(638, 478), 9-row title bars with close boxes. Wider or taller than 640 x 480 goes to the map window. Left: the menu bar's right end (the clock, Help and application icons: the remake shows nothing there; Jake: the Ho! menu in the Apple menu's place is fine). The same frame serves 3.0.1 (checked against its shot 012). |
| End Turn clock | `DrawTimeClock` @115af2, `EndTurnButtonShowing` @111944, `GrowMapWin` | done | PICT 5500 at the map's (1, 1), always shown while the turn is open (reports read or not), the turn's time ("%d:%02d", hours and minutes) in green (0, 187, 0) Geneva 9, a 2-pixel orange (255, 153, 0) seconds hand 23 long from (28, 30); a click ends the turn; PICT 5501 pressed. Shots 008 ("0:00"), 031 ("0:02"). Black and white (no capture): white time, black hand. |
| Report bubble | `DrawAnnounceBubble` @151f90 | done | the region at the map's bottom left (3 in, 185 x 79), the icon at (12, 12), the sentence from (50, 6) to the right less 8 in Geneva 9 (the bitmap's 12 CSS pixels: it was drawn at 9 and came out shrunk), 10-pixel lines, "more…" at (50, foot - 5). Shot 008, x3 crop: within a pixel. |
| Scroll bars | System 7.5 (colour) | close | the map's (16 wide) and the Report Window's, and the panes' 12-wide ones, copied from shot 008's pixels: arrow boxes, dotted track aligned to the screen, thumb with its grip, the grow box; the panes' bars pale with outline arrows when there is nothing to scroll. Left: the inactive arrow's apex is a pixel narrower than the shot's. |
| Money pane | `DrawIncomeRect` @113340 | done | as before (shot 012). |
| Fleet pane | `DrawSelectedFleetInfo` @114c12, `DrawOneFleet` @1148d6, `RecalcFleetsAtNewStar` @110644 | close | as before; its scroll bar now System 7.5's (shot 008: 216-227 x 129-170). Colony "Full" at your own colony: not read yet. |
| Planet pane | `DrawPlanetRect` @113ab0 | close | as before. Left: the star field's scatter (`DoGratuitousGraphics`). |
| Players and budget pane | `DrawIconRect` @11537c, `DrawBudgetRect` @115252, `DrawHBarControl` @50a80 | close | shot 008, x2 crop: players 22 rows apart from the start of the game (all seven in 2000), icon (10, row + 7), your icon PICT/ics 1406 (4.0.5 numbers its small icons as its planets: 1000 is a planet), name (29, row + 19) with its shadow, the check mark's own pixels, the bar 78-90; the budget from 90, grey #cccccc: "100%" alone at the right with the ticks (no Sort, "0%" or scale's name), Ships and Tech, then a rule and the colonies with their own scroll bar below it. Left: the bars' lengths are the rules' shares (Ships ends shorter in the shot). |
| Report Window | `UpdateReportWin` @15039c, `DrawMessage` @150616 | close | 32-row reports, icon at the row's left, the sentence from 35 in Geneva 9 on 10-pixel lines, the scroll bar and grow box; the version and artwork reports' icons ICON 3115 / 3116 (they showed the home planet). Left: the shot wraps "Bob Van / de walle." a word sooner (the text box's right edge: a pixel or two). |
| Desktop between the windows | | done | System 7.5's pattern (above). |
| Map: stars, names, fleets, routes | `DrawGalaxyMap`, `DrawOneColorStarSubProc`, `DrawFleetPaths` | 3.0.1 | not compared yet. |
| Tech Spending window | `UpdateTechWin` | 3.0.1 | in its windoid now; the bars not compared pixel by pixel. |
| Menu bar | MBAR 128, `SetMenuItems` | close | `menuLayout405`: 4.0.5's MENU 129-134 (words, order, keys: Compare ⌘Y, Graph ⌘H; Begin Game, Save Game, Chat Window and Statistics dimmed: network play, the remake's own saving, no engine counters yet).  |
| New game's start | the program's defaults | done | Novice by default in both 4.0.5 skins' New Game (Mac shots 006, 191: the Join window opens on Novice; Windows: playerSkill 0): $100,000, 20,000 metal, two Scouts and a Colony Ship, as shot 008. |
| Title (start-up window) | DLOG / DITL 1200 | close | the splash, its rule, the buttons 74 x 18 at 12, 115 and 210, Open Game the default (shot 001). The remake has no Quit: Import a Game… there, How to play under the window. The licence lines: "Licensed to:" and the signed-in player's name in red (the remake's account), with a small Sign out; blank when no one is signed in (Jake, 20 Nov). |

## Jake's 20 Nov look (after it "plays beautifully")

- **Black band under the players list on a 16:10 screen:** GrowMapWin runs the players' and budget's rects to the window's foot; the
  pane now does. **Desktop between Tech Spending and the Report Window:** kept: ResetWindows puts them at the screen's two sides, fixed
  sizes (Chat between, network games only), so a wide screen shows more desktop, as the original.
- **A satellite selected first:** the patch's `firstShip` (3.0.1, 4.0.5 Mac): a ship that can move first.
- **Import a Game… hung off the window:** "Import…".
- **New Game:** opens on the skin's own rules (SKIN_RULES, every skin) and has its Create button above the line ("Create", 3.0.1's and
  4.0.5's DITL 6080), so a game starts without scrolling to the remake's choices.

## Pixel alignment against shot 008 (20 Nov, late)
Every pane now sits on the shot's own pixels: each 20-row strip of the left panel matches best with no shift. What still differs is the
game itself (another galaxy, other players). Fixed on the way:
- The title bar canvas used border-box sizing, so its black bottom row squeezed 17 drawn rows into 16, and every pane below sat a row off.
  The first pane also had its own top line under the title bar's.
- The pane canvases (226 drawn) were squeezed into 225, which dropped a column partway across every glyph ("Stationed at:"). They now show
  at their own size and are clipped by the divider at 227, as the program's are. Tech Spending: 228 drawn, 225 shown, clipped the same way.
- The money pane is 33 rows: the players' and budget pane starts under its rule (the same in 3.0.1, shot 012).
- The players' pane is 0..77 with its scroll bar 77..89, and the budget runs from 89. The colonies' bar is at 214, the fleets' at 214, the
  white column at 224. The track dots line up with the screen's (x offset 2).
- Tech Spending's window grey is #cccccc (3.0.1's stays #bbbbbb).
- The bars' colours are the 8-bit screen's: the Color Manager's inverse table (4 bits a component) into the standard 256-colour clut, so
  (255,128,231) shows as (255,153,255) and (255,178,131) as (255,204,153). Both 3.0.1's and 4.0.5's shots show this.
- 3.0.1 found on the way: its fleet list asked for "9px Geneva" (tiny), so it now uses the bitmap Geneva 9 as the shot does. A moving
  fleet's bold is the bold face, no longer the browser's synthetic bold over it. Its scroll bars are System 7.5's colour bars, as shot 012
  shows.

## Windows added 20 Nov (late), from the DITLs and the code; no captures of them yet
| Window | Source | Notes |
|---|---|---|
| Hall of Fame / Hall of Shame | DLOG 4080 / 4090, doHallOfFameDlg, InitHOFList | 3 columns of 100, rows 15; Details dimmed with no games; "All editions…" opens the remake's every-edition / online window (a modern convenience) |
| Summary of Game Victory / Loss | DLOG 4100 / 4110, doDetailsDlg | PICT 3500 / 3510; the "Galaxy Style:" row shows size, density and style, as the original |
| Master Point List | DLOG 6180, doMasterListDlg, DRAWMASTERICON | 3 columns of 136; points as plain digits; the picked player's cicn 3030-3033 by points |
| Surrender | DLOG 6130, DoSurrenderToDlg, ALRT 3380 / 3390 | the Give window's cells and a last "No One" cell (ICON 1402); Really / Cancel |
| Auto Play Options, Config… | DLOG 4020 / 4021, doAutoPlayDialog, DoConfigAutoPlayDialog | four modes ("until something interesting happens": a battle or a message stops it); the seconds 0-15; Config's two sliders on rules autoPlaySettings |
| Organize Fleets | DLOG 6060, OrganizeFleets | 3.0.1's window at 4.0.5's size and places, with Split All (each pile that held more than one gives half to the next empty pile) |
| Dip Into Savings | DLOG 4070, DipIntoSavings | an amount, not a share (rules-405 dipAmount; the program takes it at once, the remake at the turn's end, counting a dip already asked for) |
Still to do: List All Explored Stars (DLOG 6040: 20-pixel rows drawn by its own list routine, a sort pop-up, CNTL 6040; asked Jake for a
capture).

## Seen in the lost game's shots, not built yet (20 Nov)

- **The turn's progress windows:** done (20 Nov): DLOG 7000's "Processing Year 2010..." for each ten years, then "Seeing What
  Happened..." (PerformEndTurn @c000c, DoOneTurn; shots 194-201), the same checker bar as before. Seen on the way: the bitmap fonts draw
  the digit 1 with a gap after it ("201 0", "$1 00,000"); the shots don't (a font matter, js/os/pixel-fonts.css: for Jake).
- **The players list's second line** (shot 204): read in `DrawIconRect` @11537c: for a rival whose home you know (the header's +0x77c,
  -1 until then, set by `SetCompAttrs`), the name 4 higher and under it "%d.%d, %d°": their home's gravity relative to yours (x 100 / your
  +0x32, rounded to tenths) and its temperature (`CalcDisplayTemp`, F or C). Known when you become best buddies (`ConformPlayerAlliances`
  @c2ce4), when they tell you (report 0x419, `DoOneTurn`), or all at once (`ExploreEverything` @8464a). Needs a rules record of which
  rivals' homes each player knows (the w95 list's "rivals' home stats"): not built yet.

## Windows, battles, start-up, end of the game

| Window | 4.0.5 routine | Status | Evidence / what is left |
|---|---|---|---|
| Build / Design Ships | `BuildDesignShips` @f0d8e, DLOG / DITL 6000 (500 x 318, its 45 items read from the resource fork) | close | `build405` (js/skins/mac12/ui.js), beside shot 015: the types list on white (the one shown on black), its scroll bar, the picture, name, class, costs, the five System 7.5 scroll bars, Savings and Metal (no dollar sign) with their coins and bars (PICT 4050 / 4052 / 4060: DRAWSHIPMONEYCHIPS, DRAWMETALCHIPS), Built, In Service, # To Build with + and -, Build & Continue, Scrap All, Max Out, Cancel, OK; bought at OK or Build & Continue (as the Windows 4.0.5's, the same program). Its place: centred, as 4.0.5's (ShowCentered, read in DoAlliancesDlg). |

| List of All Fleets | DLOG / DITL 6030 (486 x 296, the same items as 3.0.1's) | close | 3.0.1's window (`fleets301`), beside shot 016: now with the list's own scroll bar (`listBar20`: System 7.5's, inactive pale grey with outlined arrows when the list fits, as the shot). Left: the window's place (centred). |

| Compare Players | (3.0.1's window) | close | beside shot 017 (a 2020 game): the same layout. Left: position. |
| Give Stuff | DLOG 6120 | close | beside shot 021: the same. |
| Send Message | DLOG 6070 | close | beside shot 022; Everyone, Your Allies, Your Buddies now 4.0.5's ICON 1402 and 4018 (pixel matches). |
| Alliances | `DoAlliancesDlg` @10349a, `SetAllianceLists` @103880, DLOG / DITL 6110 (472 x 302) | close | `alliances405`, beside shot 020: three lists (I Really Like Them: best buddy and ally; I Like Them: ally; I Don't Like Them), each with its scroll bar, three cells across; each player's icon their opinion of you (ICON 4021 best buddy, 4020 ally, 4019 neither); a click moves a player one column round (not liked, liked, really liked); yourself: a beep. Left: the first line wraps a word later than the shot's; position. |
| Graph History | `GraphHistory` @102922, DLOG / DITL 6055 (6056 black and white) | close | `graph405`, beside shot 018: the legends in their colours (Income #996633, Metal #dd0000, Ship Money #330099, sampled), the grey plot in its black frame, the axis and years, a line a series; the ten icons (black behind the chosen), their names condensed, their colour lines; the first three chosen to start. Left: Ship Power has no history in the remake; the other series' colours are the Windows table's (not seen in a capture). |
| Statistics | `DoStatisticsDlg` @52080, DLOG / DITL 6160 (359 x 236) | close | `stats405`, beside shot 019 (Population Gained = the game's population, Ships Built 3 in both). The counters are new in the 4.0.5 rules (js/rules-405.js `p.st405`, where 4.0.5 adds to its +0x18d6..+0x18ea: CreatePlayer, ComputeIncomeAndPopulation, ColonizeStar, MakeResultMessages, ZeroFleetsAtStar, ResolveVictorFleetsAtStar, ReactToSupernova, the meteors, BuildAShip, BuildAFleet, ScrapCurrentFleet). A game begun before them: dimmed. Digests 405 d9ff9858e51b92af, mac405 9fc3fa9801f815ff (the counters' field only: the same games, end turn, battles, captures, winner). |

| Preferences | DLOG / DITL 6150 (482 x 297) | close | `prefs405`, from the DITL alone (no capture): After Every Turn Update (Sort Planet List, Show Event Messages, Only The Most Important Ones, Review Event Battles, Hints), On The Star Map (Fleet Paths, Celsius), Your Password (dimmed), Battle Speed and Polling Time with their System 7.5 scroll bars, Fully Animated, Groups Shoot Together; wired as the Windows 4.0.5's dialog 350; "Remake options…" for the remake's own window. |

Not started: the other windows from the menus (shots 014, 023-024: Halls, Master Points, Auto Play, Dip, Surrender, Explored Stars, Organize), New Game and start-up (001-007, 188-192), battles (033-157, 204-246),
won (163-165), armageddon (167-187), lost (247-251). The 3.0.1 skin's versions show meanwhile.

## Found on the way (other versions)

- **Mac 3.0.1 (20 Nov):** the same System 7.5 screen (its shot 012 has the same frame, title bar, desktop and windoids; 3.0.1's End Turn
  button at the map's (3, 2)); the remake had none of it.
- **Opening zoom (Jake, 20 Nov):** every version opens at its program's own zoom and zooms in only when that leaves dead space. The Mac
  skins do (17 pixels a cell, `fillZoom`; 4.0.5's planets in shot 008 are the remake's size at 17, by eye). The 5.0.5 family doesn't yet:
  a try that fitted the stars was taken back (it didn't start from 5.0.5's own zoom): docs/brief-opening-zoom.md. human-play's copy of the
  old fit formula (`mapPos`) now reads the skin's own view (HOVIEW).
- **4.0.5 rules in French, Turkish, German and Spanish (20 Nov):** the fleet descriptions of the 19 Nov change ("one Intrépide (1/1) Scout")
  stayed English; they now go through the same translation as 3.0.1's (js/languages.js `fleetSay`, with 4.0.5's Dreadnought, Tanker,
  Biological and Decoy). Found by ui-lang-audit.
- **The first view at 4k (20 Nov):** the map was fitted before the System 7.5 frame resized it and not again, so a home star near the foot
  could open under the windows there; `frame75` refits once when the frame comes or goes.
- **real-play:** with a Novice start the home star has three fleets and the first is selected (RecalcFleetsAtNewStar); the test now
  selects the fleet it built, as a person clicking its row (the pane is a canvas).

- **Mac 3.0.1:** `RecalcFleetsAtNewStar` (@15078c) selects the star's first fleet when the selected one isn't there; the 3.0.1 skin
  selected none. Fixed on the shared path (19 Nov).
- **4.0.5 rules (Windows and Mac):** fleets were "one Scout" everywhere; both programs name them by design. Fixed (`fleetDescAt`,
  `docs/status-w95.md` "Needs a shared file").
- **Windows 95 4.0.5 money pane:** checked, right (its Net Income equals the rules' net each turn).
- **Mac 3.0.1 path, older (on live `main` 2789149 too):** at 4k, a galaxy whose home star is near the bottom opens with the home
  star under the bottom row (the view's scroll limit stops about 6 cells short; e.g. 3840x2160, a 20 x 20 galaxy, home at y 17.5:
  oy -229.5 where about -331 is needed). Real-play's select-colony then fails at 4k now and then (mac3c and mac4c). Not fixed yet:
  `fitView` / `barMetrics` in js/skins/mac12/ui.js.

## Checks (20 Nov, session branch `claude/eager-wozniak-kt2eix`, after main's 25 commits merged in: 925cc53)

- Digests unchanged: 405 5781574657a4a191, mac405 a3844690ba4003fa, 301 4f210f392b431993, 12 358270fb4e476d44, original 46825bb0d0aaed7d.
- human-play 301, 405, mac405, original ok. notes-check ok.
- ui-lang-audit: the four known w95 findings; one false alarm, Spanish "$1,989 · 663 de metal" in the Build window (the audit reads
  "663 de" as the number of "%s · %s metal" and translates again).
- real-play, Mac skins (mac4c, mac4, mac3c, mac3 x mac405, 301 x desktop, phone-l, pad, 4k): 32 of 32 pass after the 4k refit (two
  earlier failures at 4k were the opening view; one pad run threw in the test's End Turn step once and passed again).
- real-play, the 5.0.5 family (classic with every ruleset, palm; desktop and phone-l): desktop all pass; **phone-l fails send-fleet in every
  run** (the finger drag leaves no destination). Long-standing: the same on 925cc53 without tonight's fit change and on 2789149 with its
  own real-play.js (classic 405 checked): the handoff's known finger-drag failure, which reaches every skin on the classic code at phone-l,
  not only w95 and palm. Not fixed.

## Checks (19 Nov)

- Real-play: mac4c/mac405 desktop, phone-l, pad pass; mac4c with 301 and 405 at pad, desktop, 4k pass; mac4/mac405 desktop pass,
  phone-l failed once at select-colony (a tap that selected nothing) and passed on the second run; mac4c/mac405 4k failed at
  select-colony (the opening-view bug above). mac3c (the shared path's fleet change) passes with 301 and mac405 at phone-l, pad,
  desktop and 4k, but once with 405 at pad (the colony under the report bubble's icon: placement). w95 at pad: the known finger-drag
  failure (the handoff's list).
- 405 / mac405 digests: moved only by the arrivals' stored labels (above); 301, dos and the others untouched (no engine change).
- human-play 405, mac405, 301 ok; notes-check ok; ui-lang-audit mac4, mac4c: 10 of 10 ok.
