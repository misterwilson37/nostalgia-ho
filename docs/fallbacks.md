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
| original | `computerIdentity` | as above | gap: `FUN_1006d0c0` only renames a computer whose name another player already has, with the next unused name of a fixed list in order (men from "Peter", women, player +0x28 = 1, from "Christie"), no random numbers; where a computer's name is first given wasn't found |
| palm | `computerIdentity` | as above | gap: as 5.0.5 |

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
| original | `outComputersPlay` | a computer out of the game gives no orders | verified: the computer turn (`FUN_10081cc0`, called for each computer by `FUN_10072a10`) runs its steps only while the player's out flag (+0x34, set by `FUN_1007abb0`) is 0; an out player's fleets are dismantled in its next pass 1 anyway |
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
| palm | `outComputersPlay` | out computers give no orders | verified: the Palm's computer turn `FUN_00060178` runs only while the player's out flag (+0x36, set by `FUN_000585fc`) is 0, as 5.0.5's |
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

## Gaps to check, by version

- **5.0.5**: women computers' chance; the first naming of the computers (`computerIdentity`: `FUN_1006d0c0` only renames clashes); design names (read but not applied: `FUN_1007dcf0` starts at a random name, among the first 15 for set-up, computers and Radical designs and among all of them for the design window, and takes the next name round the list no design of yours has, as 4.0.5's `nameFor`; applying it would also change the Palm's, not checked); the first message; messages a turn for humans; grouping fleets and its fuel; routes planned on the map; and, for the patch only, scrapping over another's star and its report.
- **Palm OS 5**: 5.0.5's list (but out computers, checked), and whether the Palm program has 16 player slots and 5.0.5's computer names.
- **Mac 4.0.5**: none of its own left (4.0.5's `computerIdentity` is the Mac's own hook).
