# Spaceward Ho! web remake

A personal remake of Delta Tao's *Spaceward Ho!* 5.0.5 that runs in a browser, with the
1993 DOS version (2.0) and the 1996 Windows 95 version (4.0.5) as extra rulesets and skins,
the Mac editions of 2.0.1 (1992) and 4.0.5 (1996) as rulesets of their own,
an Amiga skin from the 1994 German Amiga version of 2.0, and skins from the Mac versions 1.2
(1992, black and white), 2.0.1 (1992), 3.0.1 (1993) and 4.0.5 (1996), the last three both in
black and white and in colour.

## Playing / publishing

The repository *is* the website: no build step. On GitHub, turn on
**Settings → Pages → Deploy from a branch** (root folder) and open the Pages URL.
Opening `index.html` straight from disk won't load the pictures and sounds;
it needs to be served from a web address.

## Several players on one computer

New Game asks how many people are playing (up to 6). With more than one, everyone takes
their turn in order, and a cover screen between turns asks the next person to sit down, so
nobody sees anyone else's planets. The year moves on when the last person ends their turn.
It works with every ruleset and skin. (The original games did this over a network with a
shared game file; this remake doesn't have a server, so it's one computer, taking turns.)

## Versions and editions

New Game offers a **Version**, then an **Edition** of it (the build for one platform),
then a **Skin**, then an OS look. Each edition the remake has read is a ruleset of its
own, built on another edition of its version where the code is the same, changing only
what differs (the Mac 2.0.1 on the DOS and Windows 2.0, the Mac 4.0.5 on the Windows 95
4.0.5). A ruleset says which it is:

- `rs.family`: its version, the Version menu's entry: `'1.2'`, `'2.0'`, `'3.0'`, `'4.0'`,
  `'5'`, or `'remake'` for the remake's own rules;
- `rs.edition`: `{ version, name, platform, year }`, e.g. `{ version: '2.0.1', name:
  'Mac', platform: 'Mac, System 6 and 7', year: 1992 }`: the build's number, its name in
  the Edition menu, the computers it ran on and its year;
- `rs.skins`: its own skins (ids from `js/skins.js`), the one to offer first first.

| Family | Edition (`edition.name`) | Build | Year | Ruleset | Skins |
|---|---|---|---|---|---|
| 1.2 | Mac (French) | 1.2 | 1992 | `12` | mac12 |
| 2.0 | Mac | 2.0.1 | 1992 | `mac20` | mac2c, mac2 |
| 2.0 | DOS and Windows 3.1 | 2.0.1 | 1993 | `dos` | dos, amiga |
| 3.0 | Mac | 3.0.1 | 1993 | `301` | mac3c, mac3 |
| 4.0 | Mac | 4.0.5 | 1996 | `mac405` | mac4c, mac4 |
| 4.0 | Windows 95 | 4.0.5 | 1996 | `405` | w95 |
| 5 | Mac | 5.0.5 | 2003 | `original` | classic |
| 5 | Palm OS | 5 | 2003 | `palm` | palm |
| remake | The remake's own rules | Claude | 2026 | `claude` | classic |

(The Claude rules set none of these fields; `js/engine.js` gives them, `OWN_EDITIONS`.)
Two helpers in `js/engine.js` read them for the New Game window:

- `HO.families()`: the versions, oldest first and the remake's own last, as
  `[{ id, year, editions: [ruleset ids] }]` (`year`: its first edition's);
- `HO.editions(family)`: one version's rulesets, oldest first (then by name), as
  `[{ id, family, version, name, platform, year, skins, label, patch }]` (`label`: the
  ruleset's own; `patch`: its unofficial patch's number, or null when it has no fixes).
  An unknown family gives `[]`.

`HO.ruleOptions()` (every ruleset, by year) and `HO.newestRules()` are as before.

The New Game window (`js/skins/classic/ui.js`, `newGameDialog`) has the original game's
own window above a line: name, galaxy, hat, players, computers, IQ, home systems, shape,
size, density, years per turn, best buddies with the game difficulty rating beside it, and
the game options (each shown only for the rulesets that had it). Below the line are the
remake's own choices: **Version**, **Edition**, **Skin** and **OS look** in a row, then the
unofficial patch, the modern conveniences and Choose sounds. The Skin menu lists the
edition's own skins first (`rs.skins`), then a line, then the others; choosing an edition
picks its first skin unless a skin was picked by hand this session. A ruleset without the
fields above yet is placed by its `rs.version` (and a small table in `ui.js`).

## OS looks

The operating system's part of the look is a choice of its own: window frames and title
bars, the menu bar and menus, buttons, check boxes, radio buttons, pop-up menus, sliders,
scroll bars, fields, dialog frames and the system fonts. A skin keeps the game's own art and
layout (planets, ships, faces, pictures, messages, the End Turn button, the title screen) and
its sounds. Each look is `js/os/<id>.css`, loaded before the skin's `style.css`, and named on
the document root as class `os-<id>`; they all start from `js/os/base.css` (the classic
skin's own chrome) and draw everything in CSS and inline SVG.

| Look | id | What it has | Default for |
|---|---|---|---|
| System 6 | `system6` | System 7's, with Chicago (bold) menus, titles and buttons and pop-ups with no arrow | mac2, mac2c |
| System 7 | `system7` | black and white: 4.0's double-framed dialogs, round buttons with the default ring, Chicago menus, 50% grey scroll bars | mac12, mac3, mac3c, mac4, mac4c |
| Mac OS 8 and 8.6 | `macos8` | Platinum: the classic skin's grey windows and ridged title bars, bevelled controls, pointed slider thumb | classic |
| Mac OS 9 | `macos9` | Platinum with zoom and collapse boxes, a flatter menu bar, rounder buttons, lavender highlight | |
| Mac OS X (Aqua) | `macosx` | 10.0 to 10.2: pinstripes, traffic lights, gel buttons (the default blue), blue gel controls | |
| DOS | `dos` | the DOS 2.0 game's own Windows 3.1 style windows | dos |
| Windows 3.1 | `win31` | the DOS look with a sizing frame, control-menu box, minimize and maximize, bold System font | |
| Windows 95 | `win95` | silver 3-D controls, gradient navy title bars, close box at the right | w95 |
| Workbench | `workbench` | Amiga Workbench 2 colours and bevels | amiga |
| Palm OS | `palmos` | Palm OS forms: a black title tab, thin round buttons, small bold type | palm |

Each skin lists its own looks in `js/skins.js` (`SKINS`' `os`, the default first: mac2 System
6 and 7, mac4 System 7 and Mac OS 8, dos DOS and Windows 3.1, classic Mac OS 8.6, 9 and X);
the OS look menu offers those first, then a line, then every other look, so anything can be
mixed. The list follows the skin, not the version. The look is chosen in New Game, on the
title screen, and mid-game from the Ho menu's **Skin and OS look…**, where it changes at once
(`HOSKINS.setOS`); it is kept with the game (`G.opts.os`) and for the next one
(`localStorage` "ho5.os"). `?os=<id>` in the address also picks one.

## Each version as it was released

Each ruleset plays one original version as it was released, bugs and quirks included.
The conveniences a modern player may want are choices, and every one of them can be
changed in the middle of a game from the **Ho menu** (the skin's "Ho!" at the top left):

- **About this version**: the version's label, number, platform and year, its known bugs
  and quirks (played as released), where the remake differs, and what changed from the
  version before (`js/version-notes.js`).
- **Skin and OS look**: another skin reloads the page in it and carries on with the saved
  game; another OS look goes on at once.
- **Sounds**: a game plays only the sounds of its skin's original (`SOUNDS` in
  `js/skins.js`); an event that original had no sound for is silent. "Choose sounds"
  (here or in New Game) plays another version's sounds, or none (`G.opts.sounds`, and
  `localStorage` "ho5.sounds" for the next New Game).
- **Modern conveniences** (`G.opts.modern`, also in New Game and Preferences): automatic
  routes, the map following the news, battle speed and written battle reports. They never
  add or remove a ruleset's commands: those (Evacuate, for one) follow the rules only.

The one exception is a choice made at New Game, and only then: **the unofficial patch**
("Apply the 4.0.5.1 patch: fixes for obvious bugs (not an official release)",
`G.opts.patch`, remembered in `localStorage` "ho5.patch"). It fixes a version's obvious
bugs (`rs.fixes`, each asked for by the rules with `E.fixed(G, id)`) and nothing else; it
is a rule, so it can't be changed mid-game, and a saved game without it plays the version
as released. Its number is the version's with ".1" added; a game with it on says so in the
title bar and About this version, and the Ho menu then has **Patch notes…**. Rulesets with
no fixes don't offer it. `docs/fixes.md` lists every version's slips as obvious bugs,
quirks and unclear cases; 1.2, 2.0 and 3.0.1 have their fixes so far.

Optional ruleset flags the skin reads (each is documented where it is read):

- `rs.evacuateCommand`: `false` when the version had no command to give up a colony (1.2
  and 2.0); the Evacuate button and "Evacuate planet…" then never show. Evacuate is a
  rule, not a modern convenience. Left out (or `true`): they always show.
  (`js/skins/classic/ui.js`, `evacuateShown`)
- `rs.dragShare(G, player, slot, newPerMille)`: the version's own way of dragging a budget
  bar (2.0 and 1.2: the others move in proportion, with a floor of 0; only a new
  colony's first share uses the least-share floor). `slot` is `'tech'`, `'savings'` or a colony's star id;
  it returns the new shares in per mille (`{ tech, savings, col: { [starId]: pm } }`) or
  sets `player.budget` itself. Left out: the others are scaled in proportion, as before.
  (`js/skins/classic/ui.js`, `dragBudget`)
- Units the skin writes, which a ruleset must read in these units (`tools/human-play.js`
  checks every ruleset): `player.talloc` (the Technology bars) as fractions of 1 adding up
  to 1 once drawn, though a ruleset starts them in its own units (per mille but the Claude
  rules), so a per-mille ruleset reads a total of 2 or less as fractions (`research505`,
  4.0.5's `research`) or scales by the total (2.0, 1.2, 3.0.1); `player.budget` as fractions
  of 1 (rulesets with per-mille slots go through `keyPm` / `setKeyPm`); a colony's
  `terra` (Terraform / Mine) and `ship` (Shipbuilding, 2.0 and 1.2) as fractions of 1,
  read back by `bars20`; `player.dip` in percent (`rs.dipSet` when given); a fleet's
  `stance` ('normal', 'offensive', 'defensive') and `delayed` (arrive late); designs in
  tech levels. (`js/skins/classic/ui.js`, `renderPanel`, `planetBox`, `yardBox`)
- `rs.hints`: `false` when the version had no between-turn hints (1.2, 2.0, 3.0.1); the
  hints choice in Preferences is then left out. (`js/skins/classic/ui.js`, `addTurnNotes`, `openPrefs`)
- `rs.hintTexts`: a version's own between-turn hints, one shown every turn, picked by the
  browser's random numbers (the Palm OS rules: tSTL 6021.4-43). Left out: 5.0.5's hints, one
  every seven turns. (`js/skins/classic/ui.js`, `addTurnNotes`)
- `rs.celsius`: `true` when the version showed temperatures only in °C, to a tenth (1.2,
  the French edition); Preferences then shows °C as fixed. (`js/skins/classic/ui.js`, `degF`)
- `rs.bestBuddies`: `false` when the version had alliances but no best-buddy pacts (3.0.1);
  the Players window then offers only Ally. Left out: both, when `features.alliances` is on.
  (`js/skins/classic/ui.js`, `openPlayers`)
- Ranks: a ruleset with `rs.masterPoints` and `rs.difficulty` and no rank table of its own
  (`rs.RANKS`) uses 5.0.5's 25 ranks: a win earns master points and the Game menu offers
  "Rank history…" (the Original and Palm OS 5 rules). 4.0.5 has its own ten (`rs.RANKS`),
  shown by its `rs.hall` (below). Other rulesets have no ranks.
  (`js/skins/classic/ui.js`, `hasRanks`)
- `rs.evacuateToggle`: the Evacuate command marks the colony and the ruleset gives it up at
  End Turn (5.0.5): `{ words: [mark, unmark], marked(G, starId), ask(G, player, starId) }`,
  `ask` giving null, a yes/no question `{ text }` or a notice `{ text, notice: true }`.
  Left out: the remake's own confirmation and an immediate `rs.evacuate`.
  (`js/skins/classic/ui.js`, `evacuateClick`)
- `rs.flagScrap(G, fleet, how)` and `rs.flagScrapDesign(G, player, design, how)`: Scrap
  Current Fleet and the type's Scrap All put a mark on (or take it off, `'command'`
  toggles), scrapped at End Turn (3.0.1, 4.0.5, 5.0.5). Left out: scrapped at once.
  `rs.scrapWords`: the version's own words, `{ fleet: [mark, unmark], type: [mark,
  unmark], heap: the alert when a marked fleet is given orders }` (5.0.5: "Dismantle
  Current Fleet"; 4.0.5: "Scrap Current Fleet" both ways and its string 518); left out,
  3.0.1's. `rs.scrapTypeRefundOne`: `true` when marking a type in the build window gives
  back only one of the ships of it ordered there (4.0.5's slip); left out, all of them.
  (`js/skins/classic/ui.js`, "Scrapping by marks", `openBuild`)
- `rs.dipSet(G, player, percent)` and `rs.dipMax`: Dip Into Savings as the version kept
  it (5.0.5: a percentage up to 30 that stays on); left out, `player.dip` is set and the
  window's slider goes to 100. (`js/skins/classic/ui.js`, `openDip`)
- `rs.addMasterPoints(total, points)`: what one win may add to a player's master points
  (5.0.5: up to past the next rank). Left out: all of them. (`js/skins/classic/ui.js`, `awardMasterPoints`)
- `rs.departs(G, fleet)`: whether a fleet with orders leaves this turn; `false` keeps it
  waiting with its orders, saying nothing (5.0.5). (`js/engine.js`, `departures`)
- `rs.hall`: a version's Hall of Fame, Hall of Shame and Master Point List (4.0.5's
  `haloffam.ho`): `{ entry(G, player, won), record(tables, entry, won), out(G, player),
  rank(points, G), picture(points), date(seconds, G), names, loser(G) }` (G, the game being played, only for its unofficial patch). A human who wins or is
  eliminated is put on record once a game (`G.hallDone`), in localStorage
  "ho5.hall.<rules>", apart from 5.0.5's rank history; the Game menu then offers
  "Master Point List…", "Hall of Fame…" and "Hall of Shame…", in every skin.
  (`js/skins/classic/ui.js`, `recordHall`, `openHall`, `openMasterList`)
- A battle report's `won: true` or `won: false` (an option of `msg()`): auto play stops on
  battles won or lost by it. `engine.js` `battleNews` sets it; a ruleset that writes its
  own reports should too. It is not saved with the game. A report with no `won` still
  counts as won when its sound is 7027, for now. (`js/engine.js`, `msg`)
- `rs.autoPlaySettings(G, player, { aggr, colDef })`: the auto play settings window's
  OK (4.0.5: aggressiveness and colonies defended as set, and metal for defence the old
  colonies defended on Windows, the new one on the Mac; 5.0.5 and Palm OS: the sliders
  kept, used at each auto play turn); with no set it gives the values the window opens
  with. `rs.autoPlayRange`: `{ aggr: [min, max], where }`, the aggressiveness slider's
  range and where the sliders are: `'config'` (the Auto play window's Config…, 4.0.5),
  `'prefs'` (Preferences, 5.0.5) or `'autoplay'` (on the Auto play window, Palm OS).
  (`js/skins/classic/ui.js`, `openAutoPlaySettings`)
- `rs.radicalHand`: the radical hand window (4.0.5, 5.0.5, Palm OS): `{ cards(G, player)
  → [{ id, text }], discard(G, player, id), full, menu }`; it opens from the "hard at work
  on another discovery" report (and the Galaxy menu with `menu`), only with `full` cards
  when that is given. (`js/skins/classic/ui.js`, `openRadicalHand`)
- `rs.conquered`: the text of 4.0.5's "You have conquered the galaxy!" window, opened with
  the won picture by clicking the winner's report. (`js/skins/classic/ui.js`, `openWinWindows`)
- `rs.nameAStar`: Name a Star, `{ when: 'win' | 'rank', text, taken, max, keep, use, put }`:
  after a win (clicking the winner's report) or a new rank (Palm OS), a star name of at
  most `max` letters, not one there is already (`taken`, with %s); kept in localStorage
  "ho5.stars.<rules>" (the last `keep`, or all) and passed to `HO.newGame` as
  `opts.starNamesKept`, where `use` `'pool'` adds them to the version's star names (1.2,
  2.0) and `'put'` puts the last `put` of them in the galaxy (4.0.5, Palm OS); `null`
  keeps them unused (3.0.1). (`js/skins/classic/ui.js`, `openNameStar`; `js/engine.js`, `newGame`)
- `rs.forceEndTurn`: `{ ask }`, Mac 2.0.1's Force End Turn, offered with several players:
  asks (box 3210, %s the player, those not done, all) and plays the turn with everyone
  marked done. (`js/skins/classic/ui.js`, `forceEndTurn`)
- A skin's `T.endTurnYear` (`[x, y, w, h, picture width]`): the window in its End Turn
  picture where the year is written (mac4, mac4c, w95).
- A battle record's `duel` (0, 1, …): a ruleset that keeps one replay per duel, as 1.2 and
  2.0 did, pushes one record per duel to `G.battles`; the planet panel, the map menu and
  Review Battle offer each. (`js/engine.js`, above `battle`)

## Layout

- `index.html`: loads the game, then the skin (it has no page layout of its own)
- `js/data.js`: names, tech-level names and tips from the original resources
- `js/engine.js`: game mechanics shared by every ruleset (turns, fleets, movement,
  exploring, colonizing, battle bookkeeping, saving)
- `js/rules-claude.js`, `js/ai-claude.js`: the "Claude" rules and computer players (rebuilt from the 5.0.5 manual alone; see `docs/claude-rules/`)
- `js/rules-original.js`, `js/ai-original.js`: the "Original" rules and computer players
  (recovered from the original 5.0.5 program; see `docs/original-findings.md`)
- `js/rules-dos.js`: the "DOS 2.0" rules (Spaceward Ho! 2.0 for DOS, 1993: skill levels,
  four ship classes, ships queued and paid for at each colony; see `docs/dos-findings.md`).
  Its computer players are the Original ones
- `js/rules-405.js`: the "Windows 95 4.0.5" rules (Spaceward Ho! 4.0.5 for Windows 95, 1996:
  an earlier build of the 5.0.5 engine with skill levels, duels instead of free-for-all
  battles, dearer high-tech ships and up to 19 computers; see `docs/405-findings.md`).
  Built on the Original rules, with the Original computer players
- `js/rules-mac20.js`: the "Mac 2.0.1" rules (Spaceward Ho! 2.0.1 for the Mac, 1992): the
  DOS 2.0 rules with what the Mac program does differently (Organize Fleets, the
  computers' attack rating, the meteor report's stale name; `docs/dos-findings.md`, "Mac
  2.0.1 differs")
- `js/rules-mac405.js`: the "Mac 4.0.5" rules (Spaceward Ho! 4.0.5 for the Mac, 1996): the
  Windows 95 4.0.5 rules with what the Mac program does differently (Tankers as targets,
  tech level and ship names, the computers' names, the Hall of Fame's ranks;
  `docs/405-findings.md`, "Mac 4.0.5 differs")
- `js/version-notes.js`: for each ruleset, its known quirks, where the remake differs and
  what changed from the version before (the Ho menu's "About this version")
- `js/skins.js`: the list of skins and their sounds, and the loader. A skin is everything you see and
  hear; the game files above never touch the page, so any skin can play any ruleset
  and any saved game. The comment at the top of `js/skins.js` says what a skin must do.
  The controls that belong to a ruleset's game (Evacuate, the battle stance, Arrive late,
  alliances, the New Game choices, the shipbuilding and terraform / mine bars, …) show
  whenever that ruleset is played, in every skin, and only then: a skin changes how they
  look, never whether they are there. The OS look (`js/os/<id>.css`, above) draws the form
  controls (check boxes, lists, sliders, fields), under "Form controls".
- `js/skins/classic/`: the "classic" skin, modelled on the original
  (`ui.js`: page, map, panels, dialogs, battle replay, sound, title screen; `style.css`)
- `js/skins/dos/`: the "DOS 2.0" skin: the classic page with the DOS game's art,
  sounds and Windows 3.1 look (art in `assets/skins/dos/`). It sets `window.HOTHEME`
  and then loads the classic skin's `ui.js`, which uses that to swap pictures and sounds
- `js/skins/amiga/`: the "Amiga 2.0" skin: the DOS skin with the Amiga version's 16-colour
  pictures, sounds and title, and Workbench colours (art in `assets/skins/amiga/`). The
  Amiga game is the DOS game (same rules, same pictures in the same order), so play it with
  the DOS 2.0 rules
- `js/skins/cozy/`: the Cozy skin, Claude-made and not a historical release: the 5.0.5 art
  upscaled with xBRZ (`tools/skins/cozy_art.py`, art in `assets/skins/cozy/`) in a western
  dress over the classic page; the Claude rules' own skin (`docs/cozy-skin/`)
- `js/skins/palm/`: the "5 (Palm OS)" skin: the classic page with the Palm OS game's art
  and a Palm OS look (art in `assets/skins/palm/`, from `tools/extract/palm.py`)
- `js/skins/mac12/` and `js/skins/mac3c/`: the Mac 1.2 (French, 1992, black and white) and
  Mac 3.0.1 colour skins, both the mac3 skin pointed at other pictures
- `js/skins/mac4/` and `js/skins/mac4c/`: the Mac 4.0.5 skins (1996, black and white and
  colour): the mac3 skin with 4.0's pictures and sounds (`assets/skins/mac4/`, `mac4c/`), its
  title animation, its menus laid out as 4.0's MENU resources (the classic skin's
  `T.menuLayout`, which moves and renames the remake's own menu items and never drops one); its
  System 7 dialog frames are the System 7 look
- `js/skins/mac2/` and `js/skins/mac2c/`: the Mac 2.0.1 skins (1992, black and white and
  colour): the mac3 skin with 2.0's pictures and sounds (`assets/skins/mac2/`, `mac2c/`; its
  icons are 1.2's and the DOS game's), its start-up window, End Turn button, message border,
  menus (`T.menuLayout`); its dialog frames are the System 6 look
- `js/skins/mac3/`: the "Mac 3.0.1 (black and white)" skin: the DOS skin with the 1993 Mac
  game's 1-bit pictures and sounds, in the System 7 look (art in `assets/skins/mac3/`). The DOS
  game's pictures were made from this one's, with the same numbers
- `js/skins/<name>/` and `assets/skins/<name>/`: where more skins and their own art go
  (planned: "cozy", then "scifi"). Add the skin to the list in `js/skins.js`; the New
  Game window then offers it in the Skin menu; give it its own OS looks (`os`). `?skin=<name>` in the address
  also picks one.
- `assets/`: sprites, sounds, the 25 rank pictures (`assets/explore/`) and theme music, listed in `assets/manifest.json`
- `docs/original-findings.md`: what the original program actually does
- `docs/dos-findings.md`: what the DOS 2.0 program does differently, and how its art was read
- `docs/405-findings.md`: what the Windows 95 4.0.5 program does differently from 5.0.5
- `docs/missing-assets.md`: what each skin still borrows or leaves silent (for future art)
- `docs/decompiling.md`: how to decompile the Windows versions with Ghidra
- `docs/open-questions.md`, `docs/evolution.md`, `docs/coverage-12.md`: the questions still open for each version, how the game grew, and every routine of 1.2
- `docs/fixes.md`: every version's slips sorted into obvious bugs (fixed by the unofficial patch), quirks and unclear cases
- `tools/test.js`: headless computer-vs-computer test (`node tools/test.js`, `node tools/test.js original`, `dos`, `405`, `mac20`, `mac405` …; add `--patch` to play with the unofficial patch on)
- `tools/human-play.js`: a human played through the page in Chromium (Playwright), about 10
  turns in each ruleset: the Technology and Budget bars dragged, a Colony Ship bought (or
  queued) and sent out, the new colony terraformed. It checks that the values the skin
  writes (research shares as fractions of 1, budget shares, the Terraform / Mine bar) come
  out as the ruleset's own units would, and that the human's research and terraforming keep
  up with the computers' (`node tools/human-play.js`, or `node tools/human-play.js 405
  original`; it serves the folder with `python3 -m http.server 8000` when nothing answers)
- `tools/bundle.py`: builds `dist/spaceward-ho.html`, a single self-contained file with one
  skin built in (`python3 tools/bundle.py cozy` for another)
  (only needed for publishing somewhere that wants one file)
- `tools/decompile/DumpAll.java`: Ghidra script that writes a whole program's decompiled code to one file
- `tools/extract/`: scripts that pulled the art and sound out of the original game
  (`dos.py` does the same for the DOS 2.0 game's `HO.PRS` and `HOCOLOR.PRS`)
  (`win95.py` for 4.0.5's `SPACEHO.EXE`; `hlp.py` converts old WinHelp files to the HTML manuals in `assets/manuals/`)
  (`amiga.py` for the Amiga version's packed `.pff` files; how they are packed is at the top of it)
  (`mac3.py` reads the Mac 3.0.1 floppy images directly, and its colour pictures floppy;
  `mac4.py` reads 4.0.5's program and its "Ho! 4.0 Color Picts" file;
  `mac2.py` reads 2.0.1's program and "TheHo Color Picts", as forks or the two floppies;
  `mac12.py` reads 1.2's resource fork as unar leaves it)
