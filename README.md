# Spaceward Ho! web remake

A personal remake of Delta Tao's *Spaceward Ho!* 5.0.5 that runs in a browser, with the
1993 DOS version (2.0) and the 1996 Windows 95 version (4.0.5) as extra rulesets and skins,
the Mac editions of 2.0.1 (1992) and 4.0.5 (1996) as rulesets of their own,
an Amiga skin from the 1994 German Amiga version of 2.0, and skins from the Mac versions 1.2
(1992, black and white), 2.0.1 (1992), 3.0.1 (1993) and 4.0.5 (1996), the last three both in
black and white and in colour, and an iOS skin from the 2012 iPhone and iPad version (1.2.9).

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

## Touch

Whenever a finger is used, every skin gets the iOS game's gestures (`docs/ios-findings.md`,
"Touch controls"; `js/skins/classic/ui.js`, "touch"), told apart per event by
`PointerEvent.pointerType === 'touch'`; a mouse and a pen keep the remake's own clicks and
drags, so a laptop with a touch screen has both:

- the map: pinch to zoom, from the whole galaxy to 1.5x (phones) or 2.0x (tablets), never
  past the galaxy's edges (no rubber band); one finger pans, and a throw carries on (the
  last 6 touches of the last 0.2 s, half the speed, easing out over 3 s); a lift after less
  than 15 points of movement is a tap, which selects the nearest star within iOS's reach
  (√(2,200 × the planets' scale) map units: about 66 points zoomed in on a phone, 81 on a
  tablet, 10 to 25 zoomed out); a double tap on the map does nothing;
- the selected star: dragging from it draws a distance ruler; a single tap deselects it
  after 0.5 s; a double tap opens Build Ships (or replays the battle there); its square
  grows and shrinks with the planets' scale, as on iOS;
- fleets: drag one of yours out of the planet panel's list and drop it on a star to send it
  (back on its own star, it stays; the line is red without the fuel, and the fuel alert
  comes once); while it is dragged the planet's buttons hide, and on a tablet the star's
  information too; a double tap on the list opens **Organize Fleets** with a ruleset that
  has it (`rs.organizeFleets`: iOS and 5.0.5, below), else Split…; holding a satellite of
  yours for 0.5 s marks it for scrapping or unmarks it, with a ruleset that marks
  (`rs.flagScrap`);
- lists, the panel and windows slide after 30 points of movement (an item touched isn't
  chosen once its list has moved); a slide on the fleet list is thrown on as the map is
  (iOS's fleet list is an inertial menu), the others slow down as iOS's scroll layers;
- the budget and technology bars jump to the finger, on the ruleset's own scale, as a
  mouse's click does (`rs.barScale`, below); a finger stays on the bar's row as it drags;
  the terraform / mine slider stays linear;
- a long press on anything with hover help still explains it, unless the finger moves.

A gesture whose command the ruleset hasn't got is skipped. `window.HOVIEW()` gives the
map's scale and offset, the selection and the route line being drawn, for the test tools.
A phone and a tablet are told apart by the screen's short side (600 points or more is a
tablet; iOS asks the device).

**Organize Fleets** (Ships menu, the "Organize fleets…" / "Group fleets…" button under the
ships at a star, or a double tap on the fleet list), for a ruleset with
`rs.organizeFleets`: `'ios'` (iOS 1.2.9's window) or `'505'` (5.0.5's Group Fleets). Your
fleets at the star (not satellites) stand in columns, four at a time, the arrows paging
them; tap or click a pile (one design's ships), then a fleet outlined in blue to move it
there (an all-Biological fleet takes only Biologicals). The chosen pile's Delayed Arrival
and Attitude can be changed. Group puts every fleet into the chosen pile's (or the first;
Biologicals apart), Split moves half the chosen pile (rounded down) to a new fleet, or
with one ship every other pile to fleets of their own. iOS adds Scrap (then tap a fleet to
mark it) and New Fleet (the chosen pile to a new fleet, or an empty column), and a pinch
on the window: spread to split, pinch to group. 5.0.5 moves part of a pile too (a count;
5.0.5 asked with Option-drag). The rules are the ruleset's own (`rs.canMerge`,
`rs.organized`). The Palm moves piles by its own rules, so it keeps Split… and "Merge all
fleets here".

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
| 5 | iOS | 1.2.9 | 2012 | `ios` | ios |
| remake | The remake's own rules | Claude | 2026 | `claude` | classic |

(The Claude rules set none of these fields; `js/engine.js` gives them, `OWN_EDITIONS`.)
Two helpers in `js/engine.js` read them for the New Game window:

- `HO.families()`: the versions, oldest first and the remake's own last, as
  `[{ id, year, editions: [ruleset ids] }]` (`year`: its first edition's);
- `HO.editions(family)`: one version's rulesets, oldest first (then by name), as
  `[{ id, family, version, name, platform, year, skins, label, patch }]` (`label`: the
  ruleset's own; `patch`: its unofficial patch's number, or null when it has no fixes).
  An unknown family gives `[]`.

`HO.ruleOptions()` (every ruleset, by year) and `HO.newestRules()` are as before; `HO.defaultRules()` is the New Game window's first choice (5.0.5), as the classic skin is the default skin.

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
| iOS 6 | `ios6` | the 2012 launch's system: Helvetica Neue, the blue-grey navigation bar, the dark blue glassy alert, a black action sheet of glossy buttons for the menus, the blue ON / grey OFF switch for every check box, the blue-filled slider | |
| iOS 10 | `ios10` | the system 1.2.9 was built for (iOS 10.3 SDK, 2017): San Francisco (Helvetica Neue where it's missing), a translucent bar, 270-point alerts with their buttons along the bottom, action sheets for the menus, green switches for every check box, the thin slider with its white knob, rounded text fields; no status bar (the app hid it) | ios |

Each skin lists its own looks in `js/skins.js` (`SKINS`' `os`, the default first: mac2 System
6 and 7, mac4 System 7 and Mac OS 8, dos DOS and Windows 3.1, classic Mac OS 8.6, 9 and X, ios iOS 10 and 6);
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
- `rs.barScale`: `{ budget, tech, toggle }`, each `'log'` or `'linear'` (left out:
  linear). The budget and technology bars are drawn, and set by a mouse, a pen or a
  finger, on that scale: the log scale every version has (engine `BAR_SCALES.log`: a
  bar's fraction x is worth trunc((e^(77x / 32.11 + 2.302) − 10) × 10) per mille, the
  end 1,000; Mac `InitHLogBarAmts`, 5.0.5 `FUN_100895a0`, iOS `initHLogBarAmts`). iOS,
  5.0.5, the Palm, 4.0.5 and 3.0.1 use it for both; 2.0 and 1.2 for the technology bars
  only, the budget bars being linear. `toggle` (1.2 to 3.0.1): a click on the Budget
  heading switches the budget bars between the two, kept per ruleset in the browser.
  `HO.barScale(G, kind, pick)` gives the scale. (`js/skins/classic/ui.js`, `bar`)
- `rs.barLocked(G, player, slot)`: a budget bar the version locks, or null: `{ text,
  free, dip, silent }`, its words drawn in the bar's place (5.0.5, iOS, Palm:
  "Evacuating", a finished colony's income, Savings while dipping "-N% (…)"; 3.0.1 and
  4.0.5: a finished colony's "$" income), `free` when it can still be dragged (3.0.1's and
  4.0.5's finished colony at star 0), `dip` when a click opens Dip Into Savings (5.0.5,
  the Palm), `silent` when a refused click makes no beep (iOS, the Palm). Left out:
  nothing is locked (2.0, 1.2). (`js/skins/classic/ui.js`, `bar`, `renderPanel`)
- `rs.battlePanel(G, battle, state, viewer)`: the battle window's ship panel as the
  version showed it, made with `HO.makeBattlePanel(cfg)`: the heading and closing lines
  and two columns of groups, each with its words ("3 Lancelot (5/4) Fighters", "one dead
  …", the colony's people), the owner's name and the side's luck where the version drew
  them. The skin draws it (`openBattlePanel`; `T.battleBg`, `T.battleFont`). Left out
  (Claude, Gemini): the remake's own battle window.
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
  browser's random numbers (5.0.5: STR# 6021 lines 4-43, `FUN_10072a10`; the Palm OS rules:
  tSTL 6021.4-43; iOS: its "Help Messages" 4-42; Windows 4.0.5: strings 781-806,
  `FUN_004320f8`; Mac 4.0.5: STR# 6250 lines 4-30, `DoOneTurn`), marked `hint: true` (the
  w95 and mac4 skins give them picture 3170). Left out (the Claude rules): one of
  `js/data.js`'s hints every seven turns. (`js/skins/classic/ui.js`, `addTurnNotes`)
- `rs.fmtNum(n)` and `rs.fmtMoney(n)`: how the version writes a number in reports and
  windows, and a sum in the panels (1.2 to 4.0.5: "12,345K" from ten million, engine
  `niceNum`; 5.0.5 and iOS: the same with the sign first, `num505`, and sums "$12.345M",
  "($1,234)", `money505`). Left out or null: the number in full with commas (the Palm OS,
  the Claude rules). The rules write their reports' numbers with `HO.num(G, n)`.
  (`js/engine.js`; `js/skins/classic/ui.js`, `fmt`, `money`)
- `rs.fixSpending`: `{ lines, single, next(G, player, cur) → { text, cur } }`, the Galaxy
  menu's Fix Spending (1.2, 2.0, Mac 2.0.1, 3.0.1): each step goes on from `cur` (-1 to
  start), fixes the next colony with a problem in the budget and gives the line to show,
  or null when there is nothing more. (`js/rules-dos.js` `fixSpending20`, `js/rules-301.js`
  `fixSpending301`; `js/skins/classic/ui.js`, `openFixSpending`)
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
- `rs.nameAStar`: Name a Star, `{ when: 'win' | 'rank', text, taken, max, min, match, keep,
  add, use, put, pick, slots, inRank }`: after a win (clicking the winner's report) or a
  new rank (Palm OS, 5.0.5 in the rank window itself with `inRank`), a star name of `min`
  to `max` letters (shorter names none), not one there is already (`taken`, with %s;
  `match` `'munger'`: found inside any kept or star name, the Mac versions; `'505'`); kept
  in localStorage "ho5.stars.<rules>" (`add(list, name)`, else at the end; the last
  `keep`, or all) and passed to `HO.newGame` as `opts.starNamesKept`, where `use` `'pool'`
  adds them to the version's star names (1.2, 2.0, 3.0.1) and `'put'` puts `put` of them
  in the galaxy (the last ones, or with `pick: 'run'` a run from a start drawn from the
  seed; `slots(G, names)` what the set-up makes of them), first in the star list, which
  is then shuffled (4.0.5, Palm OS, 5.0.5, iOS). (`js/skins/classic/ui.js`,
  `openNameStar`, `showRank`; `js/engine.js`, `newGame`)
- `rs.forceEndTurn`: `{ ask }`, Mac 2.0.1's Force End Turn, offered with several players:
  asks (box 3210, %s the player, those not done, all) and plays the turn with everyone
  marked done. (`js/skins/classic/ui.js`, `forceEndTurn`)
- `rs.msgText(G, text)`: a version's own wording of every message the rules send (iOS
  1.2.9: straight quotes, "ª" for "™"); left out, the text as given. (`js/engine.js`, `msg`)
- The New Game window of a version that had fewer choices (iOS 1.2.9): `rs.optionBoxes`
  `false` (no Alliances, Luck or Novas boxes; the rules turn all three on),
  `rs.anyComputers` `false` (no "Any (1-8)"; also the Palm OS), `rs.iqStep` (the IQ
  slider's step: 10), `rs.maxHumans` (how many people may play: 1; the ruleset's
  `fixOptions` keeps to it). (`js/skins/classic/ui.js`, `newGameDialog`)
- `rs.surrenderCommand` and `rs.chatCommand` `false`: the version had the rule but no
  command for the player (iOS: no Surrender, no Send Message; the computers still
  surrender and send messages). Left out: the command shows with its feature.
- `rs.allowDebt` (`{ label, words, on }`): Build Ships' "Allow Debt" switch (iOS): off,
  ships are bought only while Ship Savings stay at 0 or more; on, down to the borrowing
  limit. Left out: always down to the borrowing limit. (`js/skins/classic/ui.js`, `openBuild`)
- `rs.organizeFleets` (`'ios'` or `'505'`): the Organize Fleets window (iOS 1.2.9's, or
  5.0.5's Group Fleets with a count for part of a pile), worked through the engine's
  `splitFleet` and `mergeFleets`, so `rs.canMerge` and `rs.organized` decide what may join
  and what the fleets keep. Left out (or `null`, the Palm): Split… and "Merge all fleets
  here" only. (`js/skins/classic/ui.js`, `openOrganize`)
- `rs.autoPlayWindow` `'ios'` and `rs.autoPlayDefaults` (`{ aggr, colDef, stop, every }`):
  iOS's Auto Play window (Computer Play For Me, Just End My Turns Only, stop when
  something interesting happens, click through the messages every n seconds) and its
  preferences' defaults. (`js/skins/classic/ui.js`, `openAutoPlay`)
- `rs.gameCenter`: the iOS game's Game Center records, kept in the browser under their own
  key (`gameCenter.key`, "ho5.gamecenter.ios"), never with another ruleset's: master points,
  games won and seven achievements. `gameCenter.gameOver(record, { gameId, won,
  difficulty }, namedStars)` gives `{ rec, points, rank, newRank, askName }` (the award is
  5.0.5's; a game counts once among the last 10 won); `blank()`, `leaderboards`,
  `achievements` (listed, `{ id, title, goal }`). Such a ruleset has no `rs.masterPoints`,
  so the 5.0.5 rank history ("ho5.profile") isn't written for it.
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
- `js/rules-ios.js`: the "iOS 1.2.9" rules (Spaceward Ho! for iPhone and iPad, Ariton,
  2012; 1.2.9 from 2017 or later): the 5.0.5 rules recompiled, with the port's own New
  Game choices, one person, no Surrender or Send Message, Evacuate's questions, its
  hints, star names, Allow Debt, Auto Play window, report wording and Game Center
  records (`docs/ios-findings.md`)
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
- `js/rules-gemini.js`, `js/ai-gemini.js`, `js/skins/gemini/`: the AI homage by Google's Gemini:
  its own rules and computer players, written from the 5.0.5 manual alone, and its
  "Tactical console" skin (`docs/gemini-rules/`, `docs/gemini-skin/`)
- `js/homage.js`: the "AI homage, play at your own risk" note shown when a player picks
  an homage's rules or skin (`docs/ai-homages/`). Homage skins are `homage: true` in
  `js/skins.js` and come last in the menus, after a line; their rules are the "AI homages"
  ruleset version
- `js/skins/cozy/`: the Cozy skin, Claude-made and not a historical release: the 5.0.5 art
  upscaled with xBRZ (`tools/skins/cozy_art.py`, art in `assets/skins/cozy/`) in a western
  dress over the classic page; the Claude rules' own skin (`docs/cozy-skin/`)
- `js/skins/palm/`: the "5 (Palm OS)" skin: the classic page with the Palm OS game's art
  and a Palm OS look (art in `assets/skins/palm/`, from `tools/extract/palm.py`)
- `js/skins/ios/`: the "1.2.9 (iPhone and iPad)" skin: the classic page laid out as the
  app's landscape screen (the map filling it, the panel as the sidebar at the right, the
  HUD bar at the top) with the app's own art, its Retina pictures drawn at half size
  (planets with their hot, ice and boulder covers, ships from their parts, hats, fleet
  dots, the ring, the report pictures, the star markers, the cowboy on the title) and
  iOS's route line for a dragged fleet (`T.fleetPath: 'ios'`: the route finder's route,
  white leg by leg with each leg's length, or red straight to a star it can't reach), and its sounds as MP3s
  (art in `assets/skins/ios/`, from `tools/extract/ios.py`); its looks are iOS 10 (the
  default) and iOS 6. A sound set's manifest may say `"soundFormat": "mp3"` (its files
  are then `.mp3`, not `.wav`; `useSounds`, `tools/bundle.py`). With the iOS rules the
  Game menu's **Rank and Game Center…** shows the record `rs.gameCenter` keeps
  (`awardGameCenter`: once a game, won or lost, the points report, a new rank's window
  and Name a Star when asked).
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
