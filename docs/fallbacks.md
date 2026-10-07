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
| 12 | `computerIdentity` | the engine draws each computer's sex (`femaleComputers`) and name (`maleNames`, `femaleNames`) with the game's random numbers | gap: 12-findings names the computers in `DoGameSolidificationStuff` @a49d6 but doesn't say with which random numbers; Mac 2.0.1, the same code, uses the game's (below) |
| dos | `computerIdentity` | as above | gap: the Windows program isn't cited for it; Mac 2.0.1, the same version, uses the game's (below) |
| mac20 | `computerIdentity` | as above | verified: Mac 2.0.1 has one generator, `RND` @121a6 (no `aSynchRand`), and `DoGameSolidificationStuff` @a40d8 draws the names with it |
| 301 | `computerIdentity` | as above | gap: not stated for 3.0.1 |
| 405 | `computerIdentity` | as above | verified: 405-findings, "Computers' sexes, and the names of the computers, are drawn with `aSynchRand`, not the game's random numbers" on the Mac (Mac 4.0.5 differs, 7), so the game's on Windows (`FUN_004768cc`, coverage-405) |
| original | `computerIdentity` | as above | gap: not stated for 5.0.5 |
| palm | `computerIdentity` | as above | gap: as 5.0.5 |

### Mac 1.2 (`12`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 12 | `departs` | a fleet with orders leaves at once if the leg is within its fuel, and the fuel is taken as it leaves; beyond its fuel it waits on a path, else its orders are dropped | gap: 1.2's routes are confirmed (`CheckFleetDestination @a23d2`) but not when a fleet leaves or when its fuel is spent; 2.0's audit has the travel time only |
| 12 | `scrapAt` | a fleet scrapped over someone else's star: the metal falls onto the planet | verified: 12-findings, "Scrapping … over someone else's star it falls onto the planet" (`ScrapFleetsAndTypes @a0e02`) |
| 12 | `shipsAdded` | ships joining or making a fleet change nothing more (a new fleet has a full tank) | gap: `NewFleet @110004` is cited for Organize Fleets, not for a new fleet's fuel |
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
| dos | `departs` | as for 1.2 above | gap, in part: dos-findings' audit, "Fleet travel (engine): ⌈hop ÷ Speed⌉ turns a hop, matches (`FUN_1068_0a94`)", covers the travel time; when the fuel is spent (the engine: on leaving) is not stated |
| dos | `scrapAt` | the metal falls onto the planet | verified: dos-findings' audit, "Scrapping over someone else's star (engine) … matches (`FUN_1040_0fca` @1040:1134–1145)" |
| dos | `shipsAdded` | nothing more (a full tank) | gap: not stated |
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
| 301 | `departs` | as for 1.2 above (the fuel taken on leaving) | gap: 301-findings, "Travel: a leg takes ⌈distance ÷ speed⌉ turns; **the fuel is spent on arrival**" (`GiveFleetPath`, `MoveShips`): the travel time matches, the moment the fuel is spent differs from the engine's. Check whether it changes play (a fleet's fuel is read in flight by scrapping, routes and the computers) |
| 301 | `canMerge` | any two fleets of a player at a star may be put together | verified: 301-findings, "Fleets can be grouped to move together, at the slowest speed and shortest Range: the remake's fleets of several designs stand for such groups" |
| 301 | `shipsAdded` | nothing more (a full tank) | gap: 301-findings has which fleet new ships join (`BuildAShip @132e04`), not their fuel |
| 301 | `yardRoom` | no limit on ships bought at a colony in a turn | gap: 5.0.5 (`FUN_1009ab50`) and 4.0.5 limit them by the colony's people; 301-findings doesn't say whether 3.0.1 does |
| 301 | `shareMaps` | best buddies share maps | unused: no best buddies (301-findings, CONFIRMED: no text or code), so no pair ever shares |
| 301 | `fixOptions` | no New Game choice is fixed | unused in effect: 3.0.1 has its own Create New Galaxy window |
| 301 | `queueMergeAny` | (ship queues) | unused: no ship queues (set `undefined` on purpose) |
| 301 | `queueSlots` | (ship queues) | unused: no ship queues |
| 301 | `yardRefund` | (ship queues) | unused: no ship queues |

### Windows 95 4.0.5 (`405`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| 405 | `departs` | as for 1.2 above (the fuel taken on leaving) | gap: 405-findings doesn't say when a fleet leaves or spends its fuel; its arrivals are 3.0.1's (`FUN_004357fc`), and 3.0.1 spends the fuel on arrival (above) |
| 405 | `canMerge` | any two fleets may be put together | gap: 405-findings, "Fleets: one design each, kept by class (`FUN_00415db0`)"; grouping fleets of several designs (3.0.1's groups) isn't stated for 4.0.5 |
| 405 | `fixOptions` | no New Game choice is fixed | unused in effect: 4.0.5 has its own New Game window |
| 405 | `queueMergeAny` | (ship queues) | unused: no ship queues |
| 405 | `queueSlots` | (ship queues) | unused: no ship queues |
| 405 | `yardRefund` | (ship queues) | unused: no ship queues |

### Mac 5.0.5 (`original`)

| Ruleset | Hook | Engine default | Status |
|---|---|---|---|
| original | `checkEveryStep` | the winner is checked on an End Turn's last step only | verified: rules-original `checkElimination505`, CONFIRMED (`FUN_1007acf0`, "on the last step of an End Turn"); the engine's own note cites `FUN_100728d0` |
| original | `maxPlayers` | 16 players | verified: original-findings, "attitude for all 16 player slots" |
| original | `maleNames` | the computers' names from `js/data.js` (5.0.5's lists), none the same | verified: coverage-505, `FUN_1006d0c0` "Computer names from the lists, none the same: engine names" |
| original | `femaleNames` | as `maleNames` | verified: as above |
| original | `starNames` | `js/data.js`'s 255 star names (5.0.5's) | verified: palm-findings, "Star names: 5.0.5's" 255 (tSTL 6060 against 5.0.5) |
| original | `femaleComputers` | a computer is a woman 45 % of the time | gap: no finding gives 5.0.5's chance (2.0 and 4.0.5: a half, CONFIRMED there) |
| original | `designName` | a new design is named from `js/data.js`'s ship names by type, in order, skipping names in use | gap: 5.0.5's "default ship-type name" (`FUN_1007dcf0`) is listed in coverage-505, not described |
| original | `shipNames` | the ship names `designName` uses | gap: with `designName` |
| original | `welcome` | "Spaceward Ho! by Peter Commons. Designed by Joe Williams." (sound 11111), then "Click here to make this message go away. Click on the clock to end your turn." | gap: the second is 5.0.5's text (`js/data.js`); the first message's text and sound aren't cited |
| original | `chatLimit` | no limit on messages a turn | gap: 5.0.5's Send Message window sends canned lines (coverage-505, `FUN_1005d940`, "Interface, not done"); its computers send three a turn (original-findings). A limit for humans isn't stated |
| original | `canMerge` | any two fleets may be put together | gap: 5.0.5's Group Fleets window is not implemented; "Merge all fleets here" and splitting stand in for it (original-findings, "Group Fleets…"). Its rules (who may group, the fuel) aren't confirmed |
| original | `organized` | merging: the fuel is the lower of the two, the orders are cleared; splitting: both keep the fuel | gap: with `canMerge` |
| original | `route` | no route: a fleet sent beyond its fuel isn't given orders (the classic skin plans a route itself only with modern conveniences) | gap: 5.0.5's map plans and gives routes when a fleet is dragged (coverage-505, `FUN_1008c5f0`) |
| original | `outComputersPlay` | a computer out of the game gives no orders | gap: not stated for 5.0.5 (2.0 and 1.2: out computers keep playing, CONFIRMED there) |
| original | `scrapAt` | a fleet scrapped over someone else's star: the metal falls onto the planet | gap, patch only: the engine's `scrapFleet` is reached only by the 5.0.5.1 patch's global warming (`globalWarming`, a fleet scrapped for lack of funds). 5.0.5's own dismantling (`FUN_10074580`) gives such metal to the star's owner |
| original | `scrapped` | no report when a fleet is scrapped | gap, patch only: as `scrapAt` (the patch's message is its own) |
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
| palm | `maxPlayers` | 16 players | gap: as 5.0.5, not stated for the Palm program |
| palm | `maleNames` | 5.0.5's names | gap: palm-findings checks the star names (Courasant for Antares) but not the computers' names |
| palm | `femaleNames` | 5.0.5's names | gap: as `maleNames` |
| palm | `femaleComputers` | 45 % | gap: as 5.0.5 |
| palm | `designName` | as 5.0.5 | gap: as 5.0.5 |
| palm | `shipNames` | as 5.0.5 | gap: as 5.0.5 |
| palm | `welcome` | as 5.0.5 | gap: as 5.0.5 |
| palm | `chatLimit` | no limit | gap: as 5.0.5 |
| palm | `canMerge` | any two fleets | gap: as 5.0.5 |
| palm | `organized` | as 5.0.5 | gap: as 5.0.5 |
| palm | `route` | no route | gap: as 5.0.5 |
| palm | `outComputersPlay` | out computers give no orders | gap: as 5.0.5 |
| palm | `scrapAt` | onto the planet | gap, patch only: as 5.0.5 (the 1.0.4.1 patch takes 5.0.5's `globalWarming`) |
| palm | `scrapped` | no report | gap, patch only: as 5.0.5 |
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
| mac20 | `departs` | as for 1.2 above | gap: as 2.0 (`MoveShips`, `CheckFleetDestination` @a23d2 are 1.2's and 2.0's) |
| mac20 | `scrapAt` | the metal falls onto the planet | verified: as 2.0 (`ScrapFleetsAndTypes`, the turn being 1.2F's: dos-findings) |
| mac20 | `shipsAdded` | nothing more (a full tank) | gap: as 2.0 |
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
| mac405 | `departs` | as for 1.2 above (the fuel taken on leaving) | gap: as 4.0.5 |
| mac405 | `canMerge` | any two fleets may be put together | gap: as 4.0.5 |
| mac405 | `fixOptions` | no New Game choice is fixed | unused in effect: the Mac's own New Game window |
| mac405 | `queueMergeAny` | (ship queues) | unused: no ship queues |
| mac405 | `queueSlots` | (ship queues) | unused: no ship queues |
| mac405 | `yardRefund` | (ship queues) | unused: no ship queues |

## Gaps to check, by version

- **1.2**: when a fleet leaves and spends its fuel (`departs`); a new fleet's fuel (`shipsAdded`).
- **2.0**: when a fleet spends its fuel (`departs`); a new fleet's fuel (`shipsAdded`).
- **3.0.1**: the fuel is spent on arrival in 3.0.1, on leaving in the engine (`departs`); a new fleet's fuel (`shipsAdded`); a limit on ships bought at a colony in a turn (`yardRoom`).
- **4.0.5**: when a fleet spends its fuel (`departs`); fleets of several designs (`canMerge`).
- **5.0.5**: women computers' chance; design names; the first message; messages a turn for humans; grouping fleets and its fuel; routes planned on the map; out computers' orders; and, for the patch only, scrapping over another's star and its report.
- **Palm OS 5**: 5.0.5's list, and whether the Palm program has 16 player slots and 5.0.5's computer names.
- **Mac 2.0.1** and **Mac 4.0.5**: their versions' other editions' lists (2.0, 4.0.5).
- **Every version but 2.0.1 and 4.0.5**: which random numbers name the computers (`computerIdentity`).
