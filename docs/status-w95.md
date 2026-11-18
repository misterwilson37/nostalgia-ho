# Windows 95 4.0.5: status, screen by screen

**Read this first when working on the `w95` skin.** It works like `docs/status-301.md`: each line is one screen of the original.
A line is done only when the remake matches Jake's capture (a few pixels off is fine) and **Evidence** says where every part
came from. Update the line in the same commit as the work, so the next session starts here, not from a handoff.

## How a session runs

1. `git pull --no-rebase` in both repos (branch `claude/eager-lovelace-ovw5uv`), read **Next** below, take the first open unit.
2. Work the unit. Commit and push after each screen, not each unit, so a cut-off loses at most one screen.
3. Tick the unit, move **Next**, push. If time is left, take the next unit; never start a unit you can't finish its first screen of.

Files this work may touch (the 3.0.1 session isn't using them): `js/skins/w95/*`, `assets/skins/w95/*`, `js/os/win95.css`,
this file, new `tools/skins/w95-*` scripts, and the `w95` line of `js/skins.js`. Anything shared (`js/skins/classic/*`,
`js/ui-text.js`, `js/engine.js`, rules files) is not edited here: if a screen needs it, note it under **Needs a shared file**.

Sources (private repo `nostalgia-ho-sources`):
- Captures: `audit/win-4.0.5/captures/win405-jake-shotNNN.png` (3420 x 2214 Mac screens; the game is 1280 x 960 at +1072+598,
  Retina 2x). Crops: `audit/win-4.0.5/crops/NNN.png` (640 x 480, made in unit 0).
- Index: `audit/win-4.0.5/shots.tsv` (shot, screen, notes; made in unit 0).
- Resources: `docs/405-windows.md` (the Windows dialogs, menu, DLGINIT, from `tools/extract/windlg.py`).
- Code: `docs/coverage-405.md` names every routine; the decompile is in the private repo, `decompiled/win-4.0.5` (all.c, one file a
  routine under c/, HOW.md; the program is `extracted/win-2.0/SpcHo3x/CD/SPACEHO.EXE`, whose MFC message maps lead to each window's code).

## Where it stands (18 Nov)

The `w95` skin is the classic skin's layout (left sidebar, map, Game/Ships/Galaxy/View/Help menus) dressed with 4.0.5's
pictures and sounds. The original's screen is quite different: a captioned window ("Juko in Milky Way in 2306"), the menu bar
File/Edit/View/Options/Fleets/Galaxy/Players/Window/Help (to confirm from the crops), a star pane and fleet list at the top
left, money and budget bars below, the players list at the bottom left, the map on the right, and floating report windows.
So, as with 3.0.1, the main screen is rebuilt first, then the windows from the menus, start-up, battles and the end.

## Units (each stands alone; in order)

| # | Unit | Shots | Done |
|---|------|-------|------|
| 0 | Ground truth: crops, `shots.tsv`, a side-by-side tool (`tools/skins/w95-compare.js`: our screen beside the crop) | all | done 18 Nov |
| 1 | Main screen frame: caption, menu bar, pane arrangement at 640 x 480, scaled like `setMacScale` | 007-031 | done 18 Nov: `js/skins/w95/screen.js` (scale `--w95`, `html.w95win`/`w95scale`; the menus as the captures word them, Ctrl+ keys; the caption bar `#w95cap` holding `#title`); CSS at the end of `js/skins/w95/style.css`. The caption's icon is left blank (the program's RT_ICON isn't extracted yet). |
| 2 | Star pane (picture, name, stats) and the fleet list above the money | 007-073 | done 18 Nov (screen.js `starPane`, `gaugeOf`, `drawPlanet`, `fleetPanes`): words from the string table (711-721, 1336-1365), places from shots 010/052/287/315 and FUN_0048eb07 / FUN_0048fe0f (row 1 at y 1, row 2 at 11; x 3, 70, 125); the turning planet from FUN_00492ccb (56 x 56 oval at (156, 10), texture 6100-6130 wrapping every 167 px, caps 6150/6151 at 6 + d/107, night side over 224 steps); the terraform / mine gauge (FUN_0048f855, bitmap 1410, thumb at 1 + 58 x share) only while both are unfinished. The gauge is picture 1410 from its column 6 and its thumb picture 1411's corner (FUN_0048ada8); the ice caps' white is see-through (masked blits; they had covered the planet). The night side is the texture with every channel halved (FUN_004926df, this+0x23c); the planet, the ring and the sky step together from the idle loop (FUN_0047d666: each new second and every 200th idle pass, a machine-speed rate; the remake keeps six a second). Left: the list box's scroll bar shows only where the browser draws one; |
| 3 | Money pane and budget bars (Metal, Earnings, Net Income, the four bars) | 007-073 | done 18 Nov (screen.js `moneyPane`, `playersPane`, `budgetPane`): FUN_00489ebe (labels right at 87, figures at 90, the right column right-aligned; savings red below 0; "(Int: %s)" and the income change rounded by FUN_0042e6fc's K / M rule); FUN_0045aae1 (bars at most 77 x 7, edge, two light lines above, two dark below and right; colours sampled from shots 010 and 075; a colony's bar mixes green and blue by its terraform share; a finished colony shows its income, red when losing; "Abandoning"); the players' small faces 8405 / 8905 / 9000+ / 9500+, ticks, a cross for one who is out. The bars are the classic page's own rows (their drag kept), laid out by CSS. The scale's ticks (linear i * 77 / 10; log measured from shot 010) and heavy gravity's red terraforming (over 2.56 times your home's: #dd0807, shown as 256-colour Windows showed it, shades as FUN_00446afe) done 18 Nov. Left: the players' 2-line rows of shot 321 ("0.4G 194°": FUN_00489232 writes a rival's home gravity and temperature once you know them, the player's +0x77c / +0x7a4, learned from "My Stats"; the remake keeps no such knowledge: needs a shared file); the Technology box still sits under the panes until unit 5 moves it to the Tech Spending window. |
| 4 | Players list and the map (stars, names, fleets, paths, drag line, selection, End Turn clock) | 007-073, 287-310 | first pass 18 Nov (screen.js "the map"): zooms 6 / 9 / 12 / 17 pixels a two-light-year cell (FUN_00455f49 / FUN_00455fc8, found through the message map: 0x8020 / 0x8021), 17 to start, centred on your home (shot 054: 111 px for "Dist 7"); scroll bars at the right and foot (arrows a cell, track a page, thumb drags); names white; black sky; End Turn's clock at (17, 15). The players list went with unit 3 (sorted as FUN_00489232: in by gross income, then out by year; pact badges 13000 / 13001). Made big: the panes zoom by --w95, the map draws at that scale (T.mapPixel). The clock (18 Nov, screen.js "End Turn's clock"): picture 367's light face (368 only while pressed), the time played in this game "h:mm" in green (no time limit; with one the classic countdown), the orange hand turning with the seconds; kept per game and player in this browser. Selection (18 Nov, screen.js "the selection ring"): FUN_00493baa's picture 175 under the star, five frames on the 500 ms timer, a yellow / cyan halo for a mutual ally / best buddy (also alone on their stars), nothing at zoom 6; planets sized as FUN_0048c169's rectangles (32 / 16 / the zoom), they were 15% big. Fleet paths and drag line done (unit 4 leftovers, 18 Nov). The sky (18 Nov): FUN_0048bd31's one white point per star, placed by the galaxy, each flipping dark / lit with a 2% chance a 500 ms tick; the classic blue points off (about 8 in view, as shots 010 / 054). The clock's white bar was the picture's own columns 0-3, which FUN_004903ea never copies: clipped, and the clock moved 4 px left (18 Nov). |
| 5 | Report windows and bubbles ("Click here to make the message go away", the Year windows) | 008-031, 087-091, 293-310 | done 18 Nov (screen.js "the floating windows", `techWindow`, `reportWindow`, `T.afterMsg`): tool windows with the grey caption, Clean Up's places (Tech (87, 349), Report (338, 349)), dragged, kept in "ho5.win.w95", toggled from Window (Ctrl+1 / Ctrl+2), Clean Up Windows; Tech Spending with the classic page's tech bars standing up (`T.techBars`); Report Messages with this turn's reports, 32 a row; the bubble is bitmap 345 at the map's bottom left. The main caption carries the program's icon (SPACEHO.EXE icon group 2, `appicon.png`). The tool windows' caption icon is Windows' own flag logo, not the game's: left out on purpose. Left: the Tech window's log-scale ticks; the remake hides End Turn's clock until the reports are read (4.0.5 shows both); the Chat window (only in a network game). |
| 6 | The menus, each one dropped down, ticks, dimmed items, shortcuts | 036, 046, 047, 050, 074, 075, 282 | done 18 Nov (screen.js `T.menuLayout`, `T.menus`): the captures' words and order, Ctrl+ keys in a column, separators; Edit all dimmed; Options' "Sound" ticked; Ships' last item "No Battles here..." dimmed when the star has had none; Window without ticks (shot 050), Chat Window dimmed, Zoom In / Out dimmed at the ends (Ctrl+I / Ctrl+J), Hide Information (Alt+I: the column goes) and Clean Up Windows. Left (the remake has no such command, or the 405 ruleset hides it): Open Game..., Organize Ships..., Statistics..., Abandon Planet; "Scrap current fleet" keeps the ruleset's capitals; the items' underlined letters; the remake's own commands sit at the end of Help after a rule. |
| 7 | Menu windows A: ship design/Build, List of Fleets, Organize, explored stars, planet info | 041-044, 053, 081, 093, 291 | done 18 Nov: every classic window restyled as a caption-less Windows dialog; the dialog engine `W95DLG(id)` (SPACEHO.EXE's 47 templates, js/skins/w95/dialogs.js, 1.5 x 1.625 px a unit; scroll bars with their arrows); List of All Fleets 384 (`fleetsDialog`), List of All Explored Stars 356 (`starsDialog`, FUN_004540a8's order), Build / Design Ships 176 (`buildDialog`: the piles of FUN_00450042 / FUN_00450681; ships bought at OK or Build and Continue only), Organize Ships 347 (`organizeDialog`: Group / Split / Divide All as FUN_0042aca6 / 0042ad1d / 0042abad; the 405 ruleset has no Organize of its own, below), Planet Info 349 (`planetInfoDialog`: a click on the star pane, FUN_0048b262; the landscape by warmth, FUN_0041e5b1). Left: the Build window's "Dev. Cost" for a type already built (shown as for a new one); the list box's scroll bars in Build and Organize are the browser's; Organize's piles 40 apart (the capture's 46 would not fit six in the field: check its drawing, FUN_0042b952). |
| 8 | Menu windows B: Compare/Graph, Alliances, Send money/metal, Preferences, Auto Play, Dip, About, Help | 040, 076-085, 283-284, 292 | mostly done 18 Nov (screen.js, each through `W95DLG`): Graph History 354 (`graphDialog`, shot 078; FUN_004567c8's drawing, FUN_0043b47f's record), Send Message 365 (`sendDialog`, shot 085; FUN_0049a8e1's steps on the remake's `cannedChat`, cells as FUN_00499473), Surrender To 363 + 364 (`surrenderDialog`), Alliances 361 (`allianceDialog`: the columns are best buddies / allies / neither by strings 1016-1027; each picture is that player's opinion of you, 4021 / 4020 / 4019, matched on shot 082; a click moves one column right, the program's direction not read), Give Stuff 362 (`giveDialog`), Preferences 350 (`prefsDialog`), Auto Play 379 (`autoPlayDialog`). Compare 352 and Skills 353 were already the classic page's from the ruleset's layouts. Left: Dip Into Savings (a rules question, below); Statistics 355 (no counters); Help Topics (284: the remake's help stays). About is done (dialog 108: `aboutDialog`, Help menu; the licensee as the DOS skin's rule). |
| 9 | Start-up: splash, Create New Galaxy, Open, password, waiting for players | 001-006, 312-313 | done 18 Nov: the splash as dialog 315 (`splash315`); Create New Galaxy as dialog 111 (`createGalaxy95`: the remake's New Game form dressed while the 405 ruleset is chosen, its four choices' boxes measured on shot 002, their pictures 114-133 matched on it, the computer players' bar, the three check boxes, Years Per Turn, Cancel / Create; the remake's other choices under "More…"). Left: Turn Time Limit (the 405 form offers no choices for it: "No Time Limit", "Fast (30 / 120)", "Medium (60 / 180)", "Slow (90 / 180)" in the template's DLGINIT) and Base Difficulty Rating (not computed by the form): rules side; the splash logo's white; Please Identify Yourself (317) and Waiting For Other Players (318) are the remake's hot-seat / online windows. |
| 10 | Battles: the window and its rows, then the animation (bolts, bursts, rounds, Stop/Done) | 092-281, 319-320 | done 18 Nov (screen.js `battleWindow95`, through a `T.battleWindow` getter that exists only with the window layout on): FUN_00422339's places (field 499 x 302; "Summary of battle" / "at %s in %d:" at (155, 1); faces at 25 / 300, names at + 67 in Arial semibold, smaller past 7 letters; groups 53 apart from 38; "Round %d" at (194, 256); "You have no information." / "You were destroyed immediately." at (145, 85 / 100)), 4.0.5's ship pictures (`T.shipPic`, the right side mirrored), bolts and bursts as the Mac colour window's, the end words at (155, 130 / 147) and picture 3000 / 3010 at (185, 164), red cross over a side wiped out, Skip then Done. The mood picture beside each face is drawn from `b.luck` when the record has it (needs a shared file). Left: the bursts' look checked only by eye against 108 (4.0.5's is a filled orange oval at its largest); the timing is the Mac's (30 ticks a shot at normal speed), the Windows timer not read. |
| 11 | End of game: won, lost, armageddon, surrender alerts; Hall of Fame/Shame and their details | 033-039, 286, 295-299, 311, 314-327 | done 18 Nov: You Won / You Lost as dialog 377 (`T.youWonLayout`; picture 3000 / 3010 on black), Name a Star as dialog 378 (`T.nameStarLayout`), the armageddon questions as dialog 376 (`T.confirm`, recognised by rs.armageddonAsk's words; shot 299's question with Abort / Party Pooper), every other plain question as the program's "V4.0.5" message box (shots 033, 034, 311), the Halls and Master Points at their dialogs' sizes (the classic page's own, already 4.0.5's: a CSS fix). Left: the message box's Yes / No (the remake's questions keep their OK / Cancel); Processing Year (286, 314: the remake's turn progress); the Halls' etched frame round the list; "This computer / Everyone" stays (the remake's online Hall). |
| 12 | Wrap-up: real-play `--skin=w95` at four sizes, digests, ui-lang-audit, notes-check; screenshots beside captures for Jake | | done 18 Nov (before staging, the main session runs its own checks again): real-play w95/405 passes at desktop and 4k; at pad and phone-l it fails only send-fleet (a fleet dragged by finger), which fails the same on live `main` 08f363e (checked at pad in a worktree; phone-l is in the handoff's known list); w95 with dos, 301 and original passes at desktop. ui-lang-audit w95: only "Alliances..." (the same word in French). notes-check ok. No engine or rules file changed, so the digests can't have moved. The skin's words are in five languages through `js/skins/w95/lang.js` (registered with the page's table at load: `js/ui-text.js` is shared, so not edited). Pictures for Jake: the private repo's `audit/win-4.0.5/remake-compare/` (23 screens beside their captures). |

The menu bar in the captures is File/Edit/Options/Ships/Galaxy/Window/Help (shot 010); the program rewrites some item
words at run time ("Build/Design Ships... Ctrl+B", "Organize Ships...", "Zoom Out Ctrl+-"), so the captures, not menu 2, give the words.

Units 1-4 are the big ones (one session might do two). 6-9 are quicker. 10 is long but mechanical.

## Next

All twelve units have had a pass. What is left, in order of value:
1. Jake's look at `audit/win-4.0.5/remake-compare/` (private repo) and the preview; fix what he reports.
2. The rules questions under "Needs a shared file" (starting money and ships, fleet wording in reports, design names, Dip Into
   Savings, Preferences' defaults, Organize, Statistics, Turn Time Limit and Base Difficulty Rating): for the main session or Jake.
3. Each unit's "Left" notes:
   none of the units' own; the shared-file questions below.
4. Merging: the work is on `claude/eager-lovelace-ovw5uv` in both repos; staging and live are the main session's.

To compare: serve the repo (`python3 -m http.server 8765 --bind 127.0.0.1` from the repo, in the background), then
`OUT=<folder> node tools/skins/w95-compare.js 010,052 '<js to run first>'` writes `w95-side-NNN.png` (ours left, the capture right).

## Needs a shared file

- Battle moods: 4.0.5 keeps each side's luck in its battle record (+0x104 / +0x106, FUN_00421430) and the window draws picture
  3140 / 3142 beside the face for -1 / +1 (FUN_00422339). `js/rules-405.js` duel rolls the luck (`lA`, `lD`) but doesn't keep it: one line,
  `rec.luck = [lA, lD]` after the roll, and the w95 window (screen.js `battleWindow95`, `b.luck`) shows them.
- Players' home stats: 4.0.5 writes a rival's home gravity and temperature under his name once he has told you ("My Stats",
  FUN_00489232, the player's +0x77c / +0x7a4); the remake's canned message doesn't record them for the receiver.
- Graph History (dialog 354): 4.0.5 records Ship Power each turn (FUN_0043b47f, FUN_0041adc6's strength of your fleets); the remake's
  history (`js/engine.js` recordHistory) keeps no such number, so the w95 window's Ship Power line stays empty. Income is the record's
  player +8, which the money pane shows as Net Income (FUN_00489ebe); the history's `inc` is gross: the record wants net.
- The 405 ruleset starts a game with $25,000 savings and 5,000 metal; Jake's Windows game (shot 010) starts with $100,000 and
  20,000 (Income $51,000, Pop 750,000). Check the New Game options and `js/rules-405.js` / `rules-mac405.js` against the
  Windows code before changing anything (rules files are shared).
- The 405 ruleset starts a player with no fleets; Jake's game starts with two scouts (Rudolph) and a colony ship (Hardy) at home (shot 010).
- The 405 ruleset has no `rs.fleetDesc`, so reports and every skin write "one Scout"; 4.0.5 writes "one Rudolph (1/1) Scout",
  "32 Storm (8/8) Fighters" (as `fleetDesc301`). The w95 skin words its own fleet rows meanwhile (screen.js `fleetRow`).
- Dip Into Savings: 4.0.5 for Windows takes a sum once (dialog 358, shot 080: "You currently have $128,885 in savings. You can take out
  up to $390,110. How much would you like?"); the 405 ruleset has a standing share of savings each turn (classic `openDip`). Check the code
  (Galaxy menu, Ctrl+D) and change the ruleset if it is wrong.
- Preferences' defaults: Jake's new Windows game (shot 040, year 2000) shows Review Event Battles ticked, Battle Speed at Fast and
  Polling Time 1 second; the 405 options (verOpts) start unticked, 30 and 8. Check the program's defaults (its setup) before changing.
- Organize Ships: 4.0.5 has it (shots 042, 044; FUN_0042b278 is 3.0.1's OrganizeFleets), the 405 ruleset has no `organizeFleets`, so the
  classic page offers none; the w95 skin's own Organize (screen.js `organizeDialog`, engine splitFleet / mergeFleets) is in its Ships
  menu. Give the ruleset `organizeFleets` if the other skins should have it too.
- Statistics (Galaxy menu; dialog 355, shot 079: population gained / killed, enemy population killed, ships built / destroyed / enemy
  destroyed) needs counters the engine doesn't keep (`G.stat` has battles, captures, colonized).
- Its starting designs are named Weasel, Santa Maria...; the Windows program's are Rudolph (scout), Hardy (colony ship), Chevron
  (tanker), Talon (fighter), Apple (satellite) (shots 041, 053).

## Open questions

(Kept in step with what Jake answers.)
