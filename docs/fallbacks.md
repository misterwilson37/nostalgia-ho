# Fallbacks: what the engine decides when a ruleset doesn't

Each ruleset plays one original version from its decompiled code. The engine
(`js/engine.js`) holds the mechanics every ruleset shares, and many of its steps
ask the ruleset first: `rs.hook ? rs.hook(...) : <engine default>`. When a
ruleset leaves a hook out, the engine default is what that version plays. This
file lists those places, and says for each one whether the version's own
findings (`docs/*-findings.md`) confirm the default is what the version did.

`node tools/fallbacks.js` prints the hooks each ruleset leaves to the engine and
fails when one of them isn't listed in the tables below, so this file can't fall
behind the code.

## No ruleset is a fallback any more

The remake's own rules (`claude`, `js/rules-claude.js`) used to stand in whenever
something was missing. That is gone:

| Where | Before | Now |
|---|---|---|
| `rules(G)` (engine) | no game, or an unknown `G.rules`: the `claude` ruleset | an error. With no game a skin names the ruleset: `HO.rulesById(id)` (also an error for an unknown id) |
| `aiOf(G)` (engine) | `AIS[rs.ai \|\| rs.id] \|\| AIS.claude` | `AIS[rs.ai]`; every ruleset names its computer players (`rs.ai`), and a missing one is an error |
| `newGame(opts)` (engine) | an unknown or missing `opts.rules`: `claude` | an error |
| `load(str)` (engine) | no `rules` field: `claude` | kept, as a documented migration in `upgradeSave`: saves made before commit 0198d39 ("Move the Claude rules and computer players out of the engine") have no `rules` field, and the remake's own rules, now `claude`, were then the only rules. A save naming a ruleset the remake doesn't have is an error, shown to the player (the bug report window, with the save to attach) |
| classic skin, Ho menu > About with no game | `HO.RULESETS[id] \|\| HO.rules(null)` | the rules chosen last in New Game (`ho5.rules`), else `HO.newestRules()` (`chosenRules()`) |
| classic skin, Help's manual with no game | `ho5.rules`, else `'claude'` | the same `chosenRules()` |
| classic skin, hover help with no game | no rules-specific texts | the texts of the `chosenRules()` ruleset |
| classic skin, New Game | the Claude settings box for any ruleset the window has no box for, and `HO.newGame` with the Claude settings as the last `else` | the Claude box only for `claude`; 1.2 (no New Game window: `rs.fixOptions` sets every choice) by name; any other id is an error |
| `tools/test.js` | no ruleset named: `claude`; an unknown one: `claude` (through `newGame`) | a usage error (exit 2); an exception in New Game or a turn stops the test with the ruleset, seed, year and where it happened (exit 1) |
| `tools/human-play.js` | (uncaught page errors only) | also every exception the skin catches and shows in its bug report window (`[HO bug]` in the console) |

Defaults that remain and are not a ruleset fallback: `rs.fixes || []` (no
unofficial patch), `rs.features || {}` (no optional features), the version notes,
help texts and manual of a ruleset that has none (`window.HOVERSIONS`,
`HOHELP_RULES`, `HOMANUALS`: the 5.0.5 manual), and the text lists of `js/data.js`
(5.0.5's resources: star, computer and ship names, reports).

## Errors: the bug report window

An exception no longer leaves the game half done or silent. In the classic skin
(and every skin built on it):

- **End Turn** and **auto play** (`playTurn`): the game is saved just before the
  turn; if the turn throws, that save is put back, so a turn is never half played.
  The computers' turns run inside End Turn; the engine notes which computer's turn
  threw (`e.hoWhere`, from `during()` in `turnStep`).
- **UI handlers**: every handler made with `el()`, the map's pointer handlers, the
  bars, the message cards, the menus, the title buttons and the T key run through
  `guard()`; anything else (a timer) reaches the window's `error` and
  `unhandledrejection` events.
- Each shows one window in the skin's look: "Nice find! Something happened that
  this version's code didn't plan for, or that our remake got wrong. Want to send
  a bug report?", with **Send bug report** (a new GitHub issue on
  misterwilson37/nostalgia-ho, filled in with the ruleset and version, patch on or
  off, skin, year, where, the error and the top of the stack), **Keep playing**,
  and **Download the saved game** (the game as it was before End Turn, to attach).
  The same error comes up three times at most. `window.HOBUGS` lists what was shown.

## Engine defaults each original ruleset relies on

Status:

- **verified**: the version's findings (or coverage list) confirm the engine's
  default is what the version did; the citation is given.
- **unused**: the ruleset never reaches the default (a feature it doesn't have, a
  hook that replaces the step, a command it doesn't offer); the reason is given.
- **gap**: not confirmed. To check in the next pass over that version; not changed
  here (no ruleset's play was changed).

Every hook the engine asks for and not listed for a ruleset is the ruleset's own.
The engine's shared mechanics that aren't hooks (a leg's travel time, refuelling
order inside the rules' own refuel step, and so on) are each version's findings'
business; the DOS 2.0 "Inherited rules audit" covers them for 2.0.

### Every original ruleset

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 12 | `battleText` | the engine's battle report wording | unused: 1.2's battles (2.0's `battle20`) write their own reports (`reported: true`) |
| dos | `battleText` | the engine's battle report wording | unused: `battle20` writes 2.0's reports (`reported: true`) |
| 301 | `battleText` | the engine's battle report wording | unused: 3.0.1's `battle` writes its own (`reported: true`) |
| 405 | `battleText` | the engine's battle report wording | unused: 4.0.5's `battle` writes its own (`reported: true`) |
| original | `battleText` | the engine's battle report wording | unused: `battle505` fights and reports every battle itself and returns nothing |
| palm | `battleText` | the engine's battle report wording | unused: 5.0.5's `battle505` (same code) |
| mac20 | `battleText` | the engine's battle report wording | unused: 2.0's `battle20` (rules-dos), which the Mac code is (`DoBattleStage` @d0004 … `ResolveVictorFleetsAtStar` @d39c6, dos-findings) |
| mac405 | `battleText` | the engine's battle report wording | unused: 4.0.5's `battle` (rules-405) |
| 12 | `computerIdentity` | the engine draws each computer's sex (`femaleComputers`) and name (`maleNames`, `femaleNames`) with the game's random numbers | verified: `DoGameSolidificationStuff` @a49d6 draws each computer's name with `RND` @12290 (a name from STR# 1999 at random, none the same and never a human's), and `RND` (the C library's `rand`) is 1.2's only generator |
| dos | `computerIdentity` | as above | verified: the names (`FUN_1040_4028`) and the sexes (`FUN_1050_1ec9` @1050:1fd5) are drawn with `FUN_1100_0000`, the game's `RND` (its error text "RND low > high") |
| mac20 | `computerIdentity` | as above | verified: Mac 2.0.1 has one generator, `RND` @121a6 (no `aSynchRand`), and `DoGameSolidificationStuff` @a40d8 draws the names with it |
| 301 | `computerIdentity` | as above | verified: `DoGameSolidificationStuff` @a741a seeds the game's generator with the galaxy's seed (`srand`, header +6) and draws the names with `RND` @11ea2, as 1.2 does; 3.0.1 has no other generator |
| 405 | `computerIdentity` | as above | verified: 405-findings, "Computers' sexes, and the names of the computers, are drawn with `aSynchRand`, not the game's random numbers" on the Mac (Mac 4.0.5 differs, 7), so the game's on Windows (`FUN_004768cc`, coverage-405) |

### Mac 1.2 (`12`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 12 | `scrapAt` | a fleet scrapped over someone else's star: the metal falls onto the planet | verified: 12-findings, "Scrapping … over someone else's star it falls onto the planet" (`ScrapFleetsAndTypes @a0e02`) |
| 12 | `shipsAdded` | ships joining or making a fleet change nothing more (a new fleet has a full tank) | verified: `NewFleet` @110004 sets a new fleet's fuel used (+4) to 0; ships joining a fleet only add to its count (2.0's `FUN_1040_1a2f`, below) |
| 12 | `checkEveryStep` | the winner is checked on an End Turn's last step | unused: no "Years per turn" (one step a turn) |
| 12 | `evacuate` | the engine's Evacuate | unused: no Evacuate command (`evacuateCommand: false`, 12-findings) |
| 12 | `pactNews` | the engine's alliance news | unused: no alliances |
| 12 | `processSurrenders` | the engine's surrender | unused: no surrender |
| 12 | `processHandovers` | the engine's surrender handover | unused: no surrender |
| 12 | `shareMaps` | best buddies share maps | unused: no alliances |
| 12 | `yardRoom` | no limit on ships built at a colony in a turn | unused: ships are queued (`buildQueue`); `buildShips` isn't called |

### DOS 2.0 (`dos`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| dos | `scrapAt` | the metal falls onto the planet | verified: dos-findings' audit, "Scrapping over someone else's star (engine) … matches (`FUN_1040_0fca` @1040:1134–1145)" |
| dos | `shipsAdded` | nothing more (a full tank) | verified: a new ship joins a fleet of its design at the star with no orders by adding one to its count, fuel untouched, else gets a new fleet (`FUN_1040_1a2f`), whose fuel used (+4) is 0 (`FUN_1068_0000`) |
| dos | `fixOptions` | no New Game choice is fixed | unused in effect: 2.0 has its own Create Galaxy window (coverage-20, `CREATEGALAXYDLGPROC`) |
| dos | `checkEveryStep` | the winner on the last step | unused: one step a turn |
| dos | `evacuate` | the engine's Evacuate | unused: no Evacuate (`evacuateCommand: false`, CONFIRMED in rules-dos) |
| dos | `pactNews` | the engine's alliance news | unused: no alliances |
| dos | `processSurrenders` | the engine's surrender | unused: no surrender |
| dos | `processHandovers` | the engine's handover | unused: no surrender |
| dos | `shareMaps` | best buddies share maps | unused: no alliances |
| dos | `yardRoom` | no per-colony limit | unused: ships are queued |

### Mac 3.0.1 (`301`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 301 | `shipsAdded` | nothing more (a full tank) | verified: `NewFleet` @130004 sets a new fleet's fuel used (+2) to 0; a ship joining a fleet (`BuildAShip` @132e04, `BuildAFleet` @92fc2) only adds to its count |
| 301 | `yardRoom` | no limit on ships bought at a colony in a turn | verified: `BuildAShip` @132e04 (a human's) checks only the metal and the borrowing limit, `BuildAFleet` @92fc2 (a computer's) only the money and metal; neither reads the colony's people (the limit is 4.0.5's) |
| 301 | `shareMaps` | best buddies share maps | unused: no best buddies (301-findings, CONFIRMED: no text or code), so no pair ever shares |
| 301 | `fixOptions` | no New Game choice is fixed | unused in effect: 3.0.1 has its own Create New Galaxy window |
| 301 | `queueMergeAny` | (ship queues) | unused: no ship queues (set `undefined` on purpose) |
| 301 | `queueSlots` | (ship queues) | unused: no ship queues |
| 301 | `yardRefund` | (ship queues) | unused: no ship queues |

### Windows 95 4.0.5 (`405`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 405 | `fixOptions` | no New Game choice is fixed | unused in effect: 4.0.5 has its own New Game window |
| 405 | `queueMergeAny` | (ship queues) | unused: no ship queues |
| 405 | `queueSlots` | (ship queues) | unused: no ship queues |
| 405 | `yardRefund` | (ship queues) | unused: no ship queues |

### Mac 5.0.5 (`original`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| original | `checkEveryStep` | the winner is checked on an End Turn's last step only | verified: rules-original `checkElimination505`, CONFIRMED (`FUN_1007acf0`, "on the last step of an End Turn"); the engine's own note cites `FUN_100728d0` |
| original | `maxPlayers` | 16 players | verified: 16 player slots (the masks for 16 in `FUN_1006c4d0`): up to 8 humans (`FUN_100b7f90`: a human joins while fewer than 8 are in) and 8 computers (`FUN_100b8770` @100b89a0: the computers' records after the humans', fewer than 16 in all and at most 8; 8 names are drawn, `FUN_10059570`) |
| original | `maleNames` | the computers' names from `js/data.js` | unused: `rs.computerIdentity` (`computerIdentity505`) names the computers itself, from the same lists (STR# 6280, `FUN_10095d50`) |
| original | `femaleNames` | as `maleNames` | unused: as `maleNames` (STR# 6281) |
| original | `starNames` | `js/data.js`'s 255 star names (5.0.5's) | verified: palm-findings, "Star names: 5.0.5's" 255 (tSTL 6060 against 5.0.5) |
| original | `femaleComputers` | a computer is a woman 45 % of the time | unused: `computerIdentity505` draws each sex, a woman one time in two (`FUN_10059570` @1005a318: the clock's rand(1, 2), 1 a man) |
| original | `shipNames` | the ship names the engine's `designName` uses | unused: `designName505` and `newDesign505` name every type themselves, from `js/data.js`'s lists (STR# 6010-6016, `FUN_10095b80`) |
| original | `nameAStar` | no Name a Star | gap (found in the October 2026 check, not built): 5.0.5's rank window (`FUN_1005e2b0`) has a star-naming field and the alert "Sorry, but there is already a star with that name" (STR# 6004.10, `FUN_100966c0(10)` @1005e73c); how the name is used in later games wasn't read |
| original | `outComputersPlay` | a computer out of the game gives no orders | verified: the computer turn (`FUN_10081cc0`, called for each computer by `FUN_10072a10`) runs its steps only while the player's out flag (+0x34, set by `FUN_1007abb0`) is 0; an out player's fleets are dismantled in its next pass 1 anyway |
| original | `scrapAt` | a fleet scrapped over someone else's star: the metal falls onto the planet | unused: nothing in the 5.0.5 rules reaches the engine's `scrapFleet` or `scrapDesign`. Fleets and types are marked (`rs.flagScrap`, `rs.flagScrapDesign`) and dismantled by 5.0.5's own routine at End Turn (`FUN_10074580`: over someone else's star the metal goes to that star's owner, `otherScrapMetal505`); the 5.0.5.1 patch's global warming marks its fleet the same way (`interest505`, 0x46c); the computers' scrapping is marks too |
| original | `scrapped` | no report when a fleet is scrapped | unused: as `scrapAt` (5.0.5's dismantling writes its own reports) |
| original | `patchVersion` | the version's number + ".1": 5.0.5.1 | verified: docs/fixes.md ("5.0.5"); not play |
| original | `fixOptions` | no New Game choice is fixed | unused in effect: 5.0.5's New Game window |
| original | `queueMergeAny` | (ship queues) | unused: no ship queues |
| original | `queueSlots` | (ship queues) | unused: no ship queues |
| original | `yardRefund` | (ship queues) | unused: no ship queues |

### Palm OS 5 (`palm`)

The Palm game is 5.0.5's turn recompiled (palm-findings), and its ruleset takes
every 5.0.5 hook. So its defaults are 5.0.5's, with the same status, except where
the Palm program is checked on its own:

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| palm | `checkEveryStep` | the winner on the last step only | verified: palm-findings, "Winning: 5.0.5's routine" (`FUN_000586fc`) |
| palm | `maleNames` | the engine's names | unused: 5.0.5's `computerIdentity505`, the same code (`FUN_000692c4`: SysRandom(1, 2), 1 a man; tSTL 6280 / 6281, the same 20 and 22 names as 5.0.5's STR#, `FUN_0002bf90`; the rename `FUN_00023cda` with the same two lists of 16) |
| palm | `femaleNames` | the engine's names | unused: as `maleNames` |
| palm | `femaleComputers` | 45 % | unused: as `maleNames` (a woman one time in two) |
| palm | `shipNames` | the engine's ship names | unused: 5.0.5's `designName505` / `newDesign505`, the same code (`FUN_0004cd18`; tSTL 6010-6016 the same as 5.0.5's) |
| palm | `outComputersPlay` | out computers give no orders | verified: the Palm's computer turn `FUN_00060178` runs only while the player's out flag (+0x36, set by `FUN_000585fc`) is 0, as 5.0.5's |
| palm | `scrapAt` | onto the planet | unused: as 5.0.5 (marks, dismantled by `FUN_00051dd0`; the 1.0.4.1 patch takes 5.0.5's `globalWarming`, which marks) |
| palm | `scrapped` | no report | unused: as 5.0.5 |
| palm | `fixOptions` | no fixed choice | unused in effect: the Palm game's New Game window |
| palm | `queueMergeAny` | (ship queues) | unused: no ship queues |
| palm | `queueSlots` | (ship queues) | unused: no ship queues |
| palm | `yardRefund` | (ship queues) | unused: no ship queues |

### Mac 2.0.1 (`mac20`)

The DOS 2.0 ruleset with Mac 2.0.1's differences (`js/rules-mac20.js`): its
defaults are 2.0's, with the same status, the Mac code being 2.0's routine for
routine (dos-findings, "Read again with the names, and the same as Windows"):

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| mac20 | `scrapAt` | the metal falls onto the planet | verified: as 2.0 (`ScrapFleetsAndTypes`, the turn being 1.2F's: dos-findings) |
| mac20 | `shipsAdded` | nothing more (a full tank) | verified: Mac 2.0.1's `NewFleet` @110004 sets a new fleet's fuel used (+4) to 0, as 1.2's |
| mac20 | `fixOptions` | no New Game choice is fixed | unused in effect: the Create Galaxy window (`CreateGalaxyDlg` @e03dc, 0 to 19 computers) |
| mac20 | `checkEveryStep` | the winner on the last step | unused: one step a turn |
| mac20 | `evacuate` | the engine's Evacuate | unused: no Evacuate (`evacuateCommand: false`, as 2.0) |
| mac20 | `pactNews` | the engine's alliance news | unused: no alliances |
| mac20 | `processSurrenders` | the engine's surrender | unused: no surrender |
| mac20 | `processHandovers` | the engine's handover | unused: no surrender |
| mac20 | `shareMaps` | best buddies share maps | unused: no alliances |
| mac20 | `yardRoom` | no per-colony limit | unused: ships are queued |

### Mac 4.0.5 (`mac405`)

The Windows 95 4.0.5 ruleset with the Mac 4.0.5's differences
(`js/rules-mac405.js`); the Mac code is Windows' compiled for the Mac, so its
defaults are 4.0.5's, with the same status:

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| mac405 | `fixOptions` | no New Game choice is fixed | unused in effect: the Mac's own New Game window |
| mac405 | `queueMergeAny` | (ship queues) | unused: no ship queues |
| mac405 | `queueSlots` | (ship queues) | unused: no ship queues |
| mac405 | `yardRefund` | (ship queues) | unused: no ship queues |

## Settled from the versions' code (October 2026)

These hooks were engine defaults and are now each ruleset's own, from its version's code:

- **`departs`** (1.2, 2.0, Mac 2.0.1, 3.0.1, 4.0.5, Mac 4.0.5): every one of these versions
  spends a leg's fuel when the fleet **arrives**, not when it leaves. The route routine
  keeps the leg's length in the fleet, and the turn the fleet reaches the star adds it to
  the fuel used: 1.2 `MoveShips` @a20ee, Mac 2.0.1 `MoveShips` @a20e2, Windows 2.0
  `FUN_1040_23ed` (with `FUN_1068_0a94`), 3.0.1 `MoveShips` @a26ac (with `GiveFleetPath`
  @130dc0), Windows 4.0.5 `FUN_004357fc`, Mac 4.0.5 `MoveShips` @c272e. `rules-dos`
  `departs20` gives back the fuel the engine takes on leaving and `legFuelArrives` takes
  it on arrival (`f.legFuel`). Play doesn't change: nothing in these turns or computers
  reads the fuel of a fleet in flight (they all look at fleets at a star), and a fleet
  that arrives is refuelled after it; only the fuel a fleet in flight shows changes.
- **`canMerge`** (3.0.1, 4.0.5, Mac 4.0.5): only fleets of the same design can be put
  together. The fallback (any two fleets) had been marked verified for 3.0.1 from
  301-findings' "Fleets can be grouped to move together", but nothing in 3.0.1 makes a
  group: the group leader (fleet +0x1a) is written only by `NewFleet`, `MarkUsedFleets`
  and `ReassignGroupLeader`; the Ships menu (MENU 132) has no group command; "Group
  Current Fleet" / "Ungroup Current Fleet" (STR# 1010.13-14) and DITL 4060 ("Which fleet
  would you like to group with your ^0?") are never loaded. 4.0.5 is the same (fleet
  +0x1e written only by `FUN_00415db0` and `FUN_004160d6`; no group command in either
  edition's Ships menu; "Group All" is the Organize window's button for one design's
  piles). This changes play for a human: "Merge all fleets here" now puts together only
  fleets of one design.

### 5.0.5 and the Palm game (October 2026, second pass)

These were engine defaults for 5.0.5 (and the Palm game, which takes 5.0.5's hooks) and
are now the ruleset's own, from the code (`docs/original-findings.md`, section 18;
`docs/palm-findings.md`):

- **`computerIdentity`** (5.0.5, Palm): the New Game window's OK draws, for each of 8
  computer slots, the sex (the clock's rand(1, 2) == 1: a man; a woman one time in two)
  and a name of that sex, drawn again while an earlier slot of the same sex has it
  (`FUN_10059570` @1005a2a4-1005a404, `FUN_100b0bc0` @100b1940; Palm `FUN_000692c4`, by
  SysRandom); the server gives computer k slot k's (`FUN_100b8770`), and the galaxy
  set-up renames a computer whose name begins another player's or is the start of it
  (`FUN_1006d0c0`; Palm `FUN_00023cda`). The draws are the clock's (CPrefs' virtual
  +0x18, `FUN_10054d40`), so the remake makes them with a stream of its own
  (`G.rsClock`), not the game's numbers.
- **`designName`** and the types the game makes (5.0.5, Palm): `FUN_1007dcf0` (Palm
  `FUN_0004cd18`): from a start the game's rand(0, 14) (set-up, Radical discoveries,
  the computers and auto play) or the clock's (the design window), the first name round
  the class's 15 that no live type of the player's has; a decoy takes a Fighter's name.
  The remake had named them in order.
- **`welcome`**: 5.0.5's first messages (`FUN_1006f870` @1006fa2c): with the hints
  preference on, hint 1, "Spaceward Ho! by Peter Commons.", "Artwork by Howard Vives and
  Bob Van de walle.", hints 2 and 3; with it off the two credits. The Palm game's own
  hints and a last "Palm OS version by ..." (`FUN_00026304` @000266fc). The engine's
  "Designed by Joe Williams" line was nobody's.
- **`chatLimit`**: 5.0.5, three a turn (Send Message is greyed out at 3, `FUN_10061af0`
  @10061d88); the Palm game counts nothing (`FUN_000371d6`, `FUN_000754b6`): no limit,
  three with its 1.0.4.1 patch (`palmMessages`).
- **`canMerge`**, **`organized`**: the Group Fleets window (`LOrganizeFleetsDialog`,
  `FUN_100a8400`, `FUN_100a85b0`, `FUN_100a8780`, `FUN_100aa240`, `FUN_100aa730`): all
  Biological fleets mix only with each other; the fleet that takes ships keeps its
  orders, gets the lower fuel, stays "bought this turn" only if both were, and keeps a
  new design's stance; a fleet split off takes the fuel, the mark and the stances.
- **`route`**: a fleet dragged on the map gets DeterminePath's route
  (`FUN_1008c5f0` @1008ce2c, `FUN_1008d140`), with or without modern conveniences.
- **`maxPlayers`** (Palm): 9 (`FUN_000232e6`'s masks; one human, `FUN_0003412a`).

## Gaps to check, by version

- **5.0.5**: Name a Star at a new rank (`nameAStar`, above: found, not built).
- **Palm OS 5**: none of 5.0.5's left but its own Name a Star words (the hook is the
  Palm's own).
- **Mac 4.0.5**: none of its own left (4.0.5's `computerIdentity` is the Mac's own hook).
