# HANDOFF — remake-only controls in the Mac 1.2 skin (`mac12`)

*Written by Dither Dolores (the Claude that did this package), November 2026. Brief: `docs/brief-restyle.md`. Branch
`claude/kind-davinci-ziq9bk`. iOS and Android skins untouched (`js/skins/ios/`, `js/skins/android/` not opened).*

**The goal (Jake):** play any ruleset, 5.0.5 above all, in the 1.2 skin. 1.2's own screens are unchanged; what a later version added is
drawn in 1.2's look instead of falling back to the desktop page's controls.

## Every control below is THE REMAKE'S OWN (1.2 had none; there is no original to match)

In the page each carries the class `remake12` (`native12`: built in `ui.js` in 1.2's manner; `css12`: a later version's own window,
its code unchanged, dressed by `style.css`). Remake windows keep a **title bar** (1.2's own dialogs have none), so a title marks them.

### Built here (`native12`)

| Control | Where | Look comes from | Words |
|---|---|---|---|
| **Players window**: players, colonies seen, status, Ally and Best buddy boxes, history, Surrender / Take back surrender | Ho! menu "Players and alliances…" / "Players and history", and the strip below | the 1.2 list box (`.lb`), 1.2's check boxes, `qdCanvas` 1 bit; history in solid, dashed and dotted lines (the classic colour graph has no 1-bit form) | the classic window's own (translated by `js/ui-text.js`); the legend "Solid: total population. Dashed: income. Dotted: tech." is the remake's |
| **Players' strip, later rulesets only**: click or Enter opens the Players window; an ally has a ring round the face, a best buddy a double ring | the left panel | the strip as 1.2 draws it; the ring is the remake's, in the idea of 3.0.1's halo (its picture is only the top of a planet's ring and smeared the 16-pixel faces: tried, dropped) | "Your ally", "Your best buddy" |
| **Create New Ship Type: Tanker, Dreadnought, Biological, Decoy** (what `canBuildType` allows) | Ships menu | 1.2's own Create window, unchanged | French names from **iOS** (`docs/glossary-fr.md`): Epouvante, Tanker, Biologique, Leurre (1.2F and 3.0.1F have none) |
| **Build Ships that buys at once** (3.0.1, 4.0.5, 5.0.5, the Palm, iOS ...), with refund, rs.manyShips (ask at 10 Scouts or Tankers in 5.0.5 and the Palm, a warning in iOS), rs.allowDebt (check box, iOS and the Palm) | Ships menu / the planet panel | 1.2's Build window: two lists, double click to add or give back, money and metal under | **1.2F's** "En production à:" and "Modèles disponibles:"; "Vaisseaux achetés ici" is the remake's. A negative balance reads `($35,498)` as the panel does |
| **Sixth research bar, Radical** (rulesets with Radical research; 1.2's rules, `noRadical`, keep five) | Tech Spending box | 1.2's vertical bars, drag as the others; the bars narrower (14 wide, 8 apart, not 18 and 9) so six fit where five did | "Radical" in every version |
| **Rank history** (5.0.5, Palm): the rank's 1-bit picture in a frame, name and points beside it, the ranks in a list box (own rank in inverse as 1.2's lists select, earned ranks starred), the wins in a second list | Ho! menu "Rank history…" | 1.2's list box and frame; was a ruled web table | the classic window's own words |
| **Battle stance** (Normal, Offensive, Defensive) and **Arrive late**, on the selected fleet | Ships menu, foot | the menus' check-marked, dimmable items; the classic fleet row's select and check box have no place in this skin's panel | the table's (iOS's, the Palm's): "Battle stance", "Normal", "Offensive", "Defensive", "Arrive late". Rulesets with the features: 5.0.5, Palm, iOS, Android, Claude, Gemini; 1.2's menu is unchanged |
| **Evacuate planet** (5.0.5's "Evacuate Planet" / "Don't Evacuate Planet" mark; 3.0.1 and 4.0.5's own question) | Galaxy menu, foot | the menu item; the classic code's own `evacuateClick`, so each version's words, jokes and rules hold. Classic had it on the planet panel and the right-click menu only | each ruleset's own. Rulesets with the command: all but 1.2 and DOS 2.0 |
| **Give Money/Metal**, **Send Message**, **Dip Into Savings**, **Surrender**, **Radical Research**, **Auto Play** (each the rulesets' own forms, one window each) | Ho! menu | 1.2's widgets, built here: a vertical bar as the Tech box's (`vbar12`), a list box with the chosen row in inverse (`list12`), the title-less question box (`ask12`); each calls the engine as the classic window did, keeps the ruleset's words, limits (3 gifts, the Palm's steps, iOS's fractions, 4.0.5's timeout) | the ruleset's own (translated by the table) |
| **Only the important messages, hints, best buddies' stars** (a later ruleset's preferences) | Options menu | 1.2 kept its settings as check-marked Options items, so these are too; only where the ruleset's Preferences window has them; 1.2's and DOS 2.0's Options are as they were | the ruleset's Preferences words |
| **The fleet box's rows and the selected fleet's lines; the planet and fleet words** (every ruleset but 1.2) | left panel | 1.2's own routines lent to the other rulesets, through a view of the game in the player's language; the engine's label for a mixed fleet | 1.2's |

### Dressed (`css12`: the later version's own window and rules, 1.2's content look)

What is left dressed is already 1.2's widgets in the version's own arrangement: **Skin and OS look, Sounds, Language, Temperatures** (a paragraph, popup menus and
check boxes, as 1.2's Create New Ship Type has), **Compare Players, Hall of Fame and Shame, Master Point List** (list boxes with the row in inverse),
**Group fleets** (5.0.5) and **Organize fleets** (Palm) (piles of ship pictures, as 1.2's own Organize Ships), and the **Preferences window** itself
(the version's own: the Palm's alone has a dozen choices; its settings are also Options-menu items now). The stylesheet sets Geneva, black on white, no
colour. Two colour pictures are put in 1 bit: Radical Research's (before it was rebuilt) and the Master Point List's (Atkinson dither at display, `ditherImg`).

### CSS only (the remake's own look; the code is the classic's, unchanged)
The transient message ("toast": the classic page's dark pill) is System 6's white box with a black border and hard shadow; the hover tip's
pale yellow is white; the full-screen **Saved Games** page (the iOS and Android rulesets' "Saved games…", and 1.2's own Open…) is a window on
the grey desktop: striped title bar with Back, a list box whose row under the pointer is inverted, Mac buttons. What 1.2's own Open dialog
showed is not in the repo, so this is not a copy of it.

### Left as they are
New game, Quit, About, Account, Import, Export, Suggestion box, manuals (the remake's own; the New Game window is kept by the display audit).

**Notes for later** (which windows were dressed not rebuilt, what a rebuild would carry and whether it pays): `docs/12-findings.md`,
"Windows dressed, not rebuilt". Looked at beside a native 1.2 dialog, only Rank history was visibly off; the rest are later versions' own
windows that already read as System 6.

## Bugs found and fixed on the way (none of them on the brief's list)

1. **Build Ships never built ships in any ruleset but 1.2's and DOS 2.0's.** The window always queued; the queue is only processed with
   `buildQueue`. 5.0.5: two queued, two turns, 0 ships, nothing spent. Fixed by `buyShips` above. 1.2's queue path is untouched (tested:
   2 ships built, as before).
2. **`lang()` said French for an English game** (`G.opts.lang` unset in a ruleset's own language), so 5.0.5 showed French in the Tech box and
   the class menu. Fallback is now `HO.ownLanguage(HO.ownRules(G))`. 1.2's own rules are unchanged. (Jake's exception, a game wrong at launch
   needing a patch, has not been needed.)
3. **A Tanker or Dreadnought listed as "undefined ..."**: `CLASS_FR` had four classes.
4. **The list of ships bought threw** under any ruleset without `rs.shipsDesc` (only 1.2's family has it). Fixed with 1.2's English form.
5. **A colour picture in a black-and-white skin** in two windows (above).
6. **Radical research could not be funded** in this skin (no sixth bar).
7. **Battle stance and Arrive late were unreachable** in the six rulesets that have them (the classic fleet row has them; this skin's panel has no such row).
8. **Evacuate was unreachable** from 3.0.1 on (planet panel and right-click menu only, neither in this skin).
9. **The remake's windows dressed 1.2's own** under 1.2's rules (my first version tagged every classic window, so the remake's content look reached 1.2's explored-stars list and the like). The display audit checks words, not CSS, and missed it. Fixed: under 1.2's rules only what a remake command opens is tagged.
10. **The Players window showed Surrender in iOS and Android,** whose rules have no Surrender command (`surrenderCommand: false`).
11. **The fleet box was blank in every ruleset but 1.2's.** `rs.shipsText`, `rs.fleetInfo`, `rs.shipsDesc` and `rs.planetInfo` exist only in rules-12 (checked in the live rulesets: several inherit, so grep lies). From DOS 2.0 to Gemini the rows were empty and the selected fleet showed no fuel, speed or destination. Fixed (above).
12. **A mixed fleet** (5.0.5 and later: Scouts, Fighters and Tankers in one) opened an empty Organize Ships window; it now opens the classic organizer.
13. **Scrap This Type crashed in Gemini** (no `flagScrapDesign`): it scraps at once after the question, as the classic window does there.
14. **1.2's own battle animation window was dressed as the remake's** (so `.remake12 canvas { filter … }` could distort it); excluded.
15. **The generic Give window's caption "Money"** was in no language but English; it uses the table's "Money:" (found by the language audit).
16. **The "name a star" window could not be closed without naming a star** (found by playing a win to its end; 1.2's own rules and every ruleset that asks the winner for a star). 1.2's dialog has no Cancel and says OK with a blank name declines; the classic form ignored a blank name. A blank OK now declines. The harness checks it (mutation-tested).

## Checked and needing nothing
Novas (map and reports: `skin-holes` finds 0 classic pictures in 5.0.5, 4.0.5, 3.0.1 and 1.2 rules); debt (`Savings ($42,000)` as classic);
an armed Armageddon device (classic shows only the changed menu words; the Ho! menu does that).

## Files changed
**The authoritative, computed list is in `START-HERE.md` (section 2): the skin (`js/skins/mac12/ui.js`, `style.css`), about 35 additive lines in four shared files (`js/skins/classic/ui.js`, `js/ui-lang.js`,
`js/ui-text.js`, `js/lang-remake.js`), the modified `tools/skin-rules-check.js`, 15 new tools, and these docs. Nothing in `engine.js`, `rules-*.js`, `skins/ios/` or `skins/android/`.** (An earlier version of this
section said `classic/ui.js` was the only change outside the mac12 files and that `ui-text.js` had 4 rows; both stopped being true when the language pass added rows, a loader change and two German lines.)
The tools, each with its header's description (newest first):

**`tools/skin-lang-online.js` (new)**: the online screens in each language against the fake Firebase. **`tools/skin-lang-menus.js` (new)**: every menu item in each language, listing those identical to English. **`tools/skin-lang-screens.js` and `tools/skin-lang-end.js` (new)**: every window (and the end of a game) in each language, listing what is still the same as English; judged by the language rule (findings, "The language rule"). Shared-file changes in the language pass: `js/ui-lang.js` (`add()` accepts a patch-only row), `js/ui-text.js` (seven French rows from 1.2F and 3.0.1F) and `js/lang-remake.js` (two German patch lines for DOS 2.0 / Mac 2.0.1).

**`tools/skin-screens-flows.js` (new)**: the screens that need a set-up: Patch notes (4.0.5 and 5.0.5 with the Patch option), the Export / Import file round trip (the loader the code calls "openGameText"), the Hall of Fame's Details after a won game. Exit 1 on a problem; mutation-tested. The battle list is reached by the won-game tool (`LIST=1`, probe only).

**`tools/online-fake.js` and `tools/skin-online-check.js` (new)**: `NODE_PATH=$(npm root -g) node tools/skin-online-check.js [skin, mac12] [saves,two,three]` tests the online parts through a skin against a FAKE Firebase (in memory, no rules; the real emulators cannot be downloaded in a sandbox):
a guest and the account saves; 2 players on 4.0.5 with a mid-turn reload; 3 players on 5.0.5 with a skipped turn and a resignation; the state the same in every browser after every turn. Pass `classic` to run the same against the classic skin. It does not replace
`tools/online-test.js` (the emulators; written for the classic skin's page).

**`tools/skin-screens.js` (new)**: `NODE_PATH=$(npm root -g) node tools/skin-screens.js [rulesets] [skin]` opens the rarely reached windows and screens (About, Patch notes, Help, Skills, Halls, Reports, battle list, Account, Game Center, Split) in each ruleset, says what opens, and saves a screenshot of each; a page error or a throwing opener is a problem, "nothing opened" is not (several need a state it does not make).

**`tools/skin-modern-win-compare.js` and `tools/skin-find-galaxy.js` (new)**: `NODE_PATH=$(npm root -g) node tools/skin-modern-win-compare.js [ruleset, original] [seed, 8] [max turns]` (env `COMP=2` for two computer players) plays a game the
player WINS (the smallest, densest galaxy; one or two computer players at the dumbest level; a scripted conqueror that decides from the game's state) three times, Modern on, on again and off, and compares every turn; exit 1 if the
game does not repeat, the setting changes it, or the player does not win. `skin-find-galaxy.js [ruleset] [seeds]` finds seeds where the two sides are connected within a fleet's range (most galaxies are not). Seeds that work for
5.0.5 (hex, density 0, size 0): 8, 66 (one stepping stone), and for two computers 3, 5, 8, 9. Written for 5.0.5's New Game controls.

**`tools/skin-modern-compare.js` and `tools/skin-route-compare.js` (new)**: do "Modern conveniences" change the game? The first plays the same fixed-seed game three times (on, on, off) with a passive player to its end and compares a
per-turn fingerprint (exit 1 if the game does not repeat or the setting changes it); the second compares when a fleet arrives with one automatic-route order against hop-by-hop orders (Claude and Gemini, the only rulesets without
their own routing). Results and the reasoning: `docs/12-findings.md`, "Modern conveniences does not change the game".

**`tools/skin-endgame.js` (new)**: `NODE_PATH=$(npm root -g) node tools/skin-endgame.js [rulesets] [conquer,lose] [skin]`. Plays a game to its end through the real End Turn (the situation is set up in the game state;
the header says how and why), drives every end-of-game window and card, then "New game". Fails on a page error, a window that cannot be closed, no end card, or a New game that is not fresh. Not an alliance win (the
computers will not agree). 4.0.5 and Mac 4.0.5 play on after an elimination, as that version does; the tool expects it.

**`tools/skin-playthrough.js` (new)**: `NODE_PATH=$(npm root -g) node tools/skin-playthrough.js [rulesets] [turns, 20] [skin, mac12] [seed, 7]`. Plays a seeded game in each ruleset
as a player does (buys or queues ships through the Build window, sends fleets, drags the budget bars with the mouse, creates designs, opens windows, toggles Options
items, ends the turn and answers what comes up) and reports a page error, the bug window, a window that will not close, a blank box in the panel, a fleet box that
draws nothing, a purchase that changed nothing (unless unaffordable, or 1.2's queue has every slot taken), and a turn that does not advance. It does not drag on the
map (it orders with `HO.orderMove`), force a battle, or save and reload. Allow ~100 s a ruleset at 20 turns; three rulesets per call fits a 5-minute limit.

`tools/skin-menu-sweep.js`: opens every command of every menu, in each ruleset, at the start of a game and after eight turns, and reports a page error,
the game's own "Something unexpected happened" window, and a window that will not close. It does not press OK on anything.
`NODE_PATH=$(npm root -g) node tools/skin-menu-sweep.js [rulesets] [turns, e.g. 0,8] [skin]`. It cannot find a control that is *absent*; those came from
comparing what the classic code acts on (features, buttons, the right-click menu) with what the skin does.

`tools/skin-rules-check.js`: the "am I in the skin" test now works for any skin (HOSKINS); `SKINS_CHECK.mac12` opens every command of the Ho! 1.2 menu and **fails**
on a window that is none of 1.2's own, `remake12` or `css12`; and it fails if Battle stance, Arrive late or Evacuate is missing from the menus of a ruleset that has
the feature, or present in one that has not (1.2's menus must be as they were); if the Players window's Surrender button disagrees with the ruleset's Surrender
command; or if 1.2's own explored-stars window is dressed as the remake's. `--inventory` prints each command and what it opened; a full-screen page is recorded as
the remake's file handling; `HO_VERBOSE=1` prints a failure's whole Playwright log. **Each of those checks was mutation-tested** (the code broken in a copy of the
repo; the harness failed with the expected message each time). Caution: it checks classes and menus, not looks; each window was also looked at (the screenshots).

## Tests (on the final code; the whole battery was rerun after the last changes: see docs/12-findings.md, "The full regression battery")

| Check | Result |
|---|---|
| `node tools/skin-rules-check.js --skin=mac12` | all 12 rulesets ok (pad) |
| mutation tests of the harness's new checks | stance items hidden, Evacuate always shown, Surrender ignoring the command, 1.2's own windows dressed, the fleet-box fallback removed, the Dip hook removed (Dip falls back to dressed): each fails with its message |
| `node tools/skin-rules-check.js --skin=ios,dos` (the shared-code change) | all ok |
| `node tools/skin-menu-sweep.js` (every menu command, 12 rulesets, turn 0 and 8) | no problems |
| `node tools/skin-modern-win-compare.js original 8` (won at turn 9) and `COMP=2 ... original 5` (won at turn 30, with fights); Modern on, on, off | every turn identical, the scripted player's decisions identical, the win screen the same; the battle shown as the written report (on) or the skin's own battle (off) |
| `node tools/skin-modern-compare.js 301` (3 games, 69 turns to a natural loss) and `skin-route-compare.js` | the setting changes nothing: every turn identical; fleets arrive on the same turn (4 and 6) |
| `node tools/skin-screens-flows.js` | no problems: Patch notes (405, 5.0.5), export then import gives the same game, the Hall's Details opens; the battle list looked at (screens/55, 56, 57) |
| `node tools/skin-online-check.js mac12` (saves, two, three) | no problems: same state in every browser after every turn, a reload, a skipped turn, a resignation, 13 battles (screens/54) |
| `node tools/skin-screens.js` (all twelve rulesets) | no problems; About, Help, Reports and Split open in every ruleset (screens/58); iOS's Help screen and Game Center restyled in 1-bit (screens/53), the rest of the unseen screens look right (screens/51, 52) |
| `node tools/skin-endgame.js` (12 rulesets, a win and a loss each) | no problem after the name-a-star fix; without it the tool reports the stuck window (mutation-tested) |
| a new colony by play (1.2, 3.0.1, 4.0.5, 5.0.5, Palm, Mac 4.0.5, Gemini, iOS) | settles, panel drawn, the shipbuilding bar moves (a probe script, not in the repo) |
| shared-code check: iOS-skin and DOS-skin harness, all 12 rulesets each; language audit, every skin (mac12 5 runs, the other skins 67) | all ok (72 language runs) |
| `node tools/skin-playthrough.js` (all 12 rulesets, 20 turns, seed 7; original, iOS, Palm 30 turns seed 21; 1.2, DOS 2.0, 4.0.5 30 turns seed 33) | no problems. It first reported three kinds of false alarm, all in the tool's own check and now fixed: a design the player cannot afford, iOS's and the Palm's Allow Debt floor of $0, and 1.2's full queue slots. Mutation-tested: Build always queueing and the fleet-box fallback removed are both reported |
| `node tools/display-audit.js 12` | ok, 0 gaps, 2 kept differences (as before) |
| `node tools/human-play.js` | all 12 rulesets ok |
| `node tools/ui-lang-audit.js` (every skin: mac12 5 runs, the other skins 67) | 72 runs ok, after the "Money:" fix |
| the new windows' strings (a script, not in the repo): each opened in English and four languages in five rulesets, strings identical to English listed | only cognates ("Metal:", "Start", "Points"), the 5.0.5 rank names (game data), the classic fleet-list window's words, and Claude, whose windows are all English (it is an English-only ruleset) |
| `node tools/skin-holes.js mac12` | 0 classic pictures borrowed (5.0.5: 154 own; 1.2: 144) |
| By hand-script, against engine state | Give (4.0.5, Mac 4.0.5, 5.0.5, Palm, Claude, Gemini: amounts, deductions, the Palm's steps), Send Message (2.0, Mac 2.0.1, 4.0.5, Mac 4.0.5, 5.0.5, Palm, Claude, Gemini), Dip, Surrender and Armageddon (4.0.5, 5.0.5, Palm; Surrender also Claude, Gemini), Radical (4.0.5, Mac 4.0.5, 5.0.5, Palm, iOS: keep, pick, the bitmask and the deck), Auto Play (1.2, 4.0.5, Mac 4.0.5, 5.0.5, Palm, iOS: turns played), the Options items (seven rulesets), Build buy mode, stance / arrive late / evacuate (earlier), the fleet box (4.0.5, Palm, Claude, 5.0.5), the mixed-fleet organizer (5.0.5), the skin's battle window (5.0.5, 4.0.5, modern off) |
| 3.0.1, 40 turns (2000 to 2400) by `skin-playthrough`, then Give, Send Message, Players (Ally), Surrender (with the take-back), Dip, Armageddon, Compare, the Halls opened after the first turn lifts its first-year dimming | no problem; each does its job against the game's state (details in `docs/12-findings.md`, "A long 3.0.1 game") |
| **Not run, or not reachable** | a battle in Claude or Gemini (could not make one happen: they use the classic written battle anyway); `tools/bundle.py`, `tools/doc-sprites.py` |

Screenshots: `docs/mac12-remake-controls/screens/` (58; each new control, English; the Build window also in French and under iOS).

## Not done, or to decide
(The short list is `START-HERE.md`, section 7. The detail:)
- **Sounds.** The brief asks for 1.2's sounds and beeps. The rebuilt windows play what the classic code played (ids 5000, 7001, 7002, 7003) through the skin's sound map and use 1.2's beep on a refused
  purchase; **not checked by ear** (Jake: "the sounds will be what they will be"). The Players window has no sounds.
- **Real Firebase:** online play was tested against a fake (`tools/online-fake.js`); `tools/online-test.js` against the real emulators needs a machine that can download them (Jake: the main claudling will test it).
- **Not rebuilt, and why:** see "Dressed" (they are 1.2's widgets already); `docs/12-findings.md` ("Windows dressed, not rebuilt") says what each carries if a rebuild is ever wanted.
- **Not looked at in other languages:** the Hall's detail window, Patch notes (plain text), the end of a game in the patched games other than DOS 2.0. The won-game comparison and the galaxy finder are written for 5.0.5's controls.
- **Not looked at by hand:** `singleTypeFleets` (DOS 2.0's alone); waypoints (the map drag is this skin's route planning).
- **Settled, no longer open:** mixed fleets (5.0.5's Group Fleets makes them, and checks `canMerge`; 1.2's Organize Ships lists only single-design fleets of the selected design, so it cannot mix them: tested with Biologicals,
  Fighters, Tankers and Scouts at one star); the first-year dimming of Players / Give / Message / Surrender in 3.0.1 (dimmed until the year is 2001, one End Turn lifts it: tested); Modern conveniences (it changes nothing about the game: proven).
- The Tech box's second row of names is cut at the box's foot (five bars too, before any change).
