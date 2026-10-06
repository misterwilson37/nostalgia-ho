# The unofficial patch: an inventory of each version's slips

Every ruleset plays its version exactly as released, bugs and quirks included. The
unofficial patch is a choice at New Game ("Apply the x.y.z.1 patch: fixes for obvious bugs
(not an official release)", `G.opts.patch`) that fixes a version's *obvious* bugs and
nothing else. Its number is the version's own with ".1" added (`HO.patchVersion`), so
"1.2.1", "2.0.1.1", "3.0.1.1", "4.0.5.1", "5.0.5.1" and Palm "1.0.4.1". It is not a release of the original
game; it is the remake's own.

This file goes through every slip and quirk listed for each version in
`docs/open-questions.md` ("Settled, worth confirming", and the Open entries that are slips)
and in the findings files, and puts each into one of three groups:

- **Obvious bug (fix it)**: the code plainly doesn't do what it meant: a sign error, an
  overflow, stale or uninitialised memory, reading past a table, a crash or an endless
  loop, a wrong variable passed, an off-by-one, a string-format slip, a check that can
  never succeed, a dead branch clearly meant to run, a blank or garbled message.
- **Quirk or design (leave it)**: plausibly intended, or a balance choice.
- **Unclear (leave it, ask the developers)**: the evidence could go either way.

A fix is the smallest change that does what the code evidently meant: what the same
routine does in the next version when a later version fixed it, or else the plain intent.
Never a redesign. When in doubt, an entry is "unclear".

## How it works in the code

- A ruleset lists its fixes: `rs.fixes = [{ id, title, text }]`, with a title and a
  sentence for the player. A ruleset built with `Object.assign` over another sets its own
  list (2.0's isn't inherited by 1.2, 3.0.1 or 4.0.5).
- The rules ask `E.fixed(G, 'id')` (`js/engine.js`): true only when `G.opts.patch` is on
  and the ruleset lists that id. A saved game without `G.opts.patch` plays the version as
  released.
- The quirk lines in `js/version-notes.js` that a fix covers carry `fix: 'id'`; About this
  version says "fixed in the x.y.z.1 patch" beside them, or, in a game with the patch on,
  that this game has them fixed and that the Patch notes (Ho menu, only then) say how.
- The New Game window shows the check box only for rulesets with fixes, with the list of
  fixes folded away below it; the last choice is kept in localStorage "ho5.patch".
- `node tools/test.js <rules> --patch` plays the test games with the patch on.

Phase 1 (done): the fixes for 1.2, 2.0 and 3.0.1. Phase 2 (to do): 4.0.5, 5.0.5 and Palm;
their entries are below so the list is complete, but their rulesets list no fixes yet.

## Counts

| Version | Obvious bug | Quirk or design | Unclear |
|---|---|---|---|
| Mac 1.2 | 2 | 8 | 2 |
| 2.0 | 5 | 5 | 3 |
| Mac 3.0.1 | 4 | 5 | 3 |
| 4.0.5 | 13 (+ 2 with nothing in the remake to fix) | 4 | 5 |
| 5.0.5 | 2 | 6 | 6 |
| Palm | 1 (+ 5.0.5's) | 5 (+ 5.0.5's) | 1 (+ 5.0.5's) |

Palm's code is 5.0.5's recompiled, with the same slips; its own entries are counted, and
5.0.5's apply to it as well.

---

## Mac 1.2 (patch 1.2.1)

### Obvious bug (fixed in 1.2.1)

1. **`meteorReport`: the blank meteor report.** `ComputeIncomeAndPopulation` (asm a3034)
   sends report 1059 for a colony wiped out by a meteor shower, but STR# 1000 has only
   59 templates (1000-1058), so `GetReportString @130746` reads past the list and prints
   an empty line. *Fix:* the report 2.0 sends for it (1009), with the meteor shower named:
   "A meteor shower destroyed your colony at S." (`js/rules-dos.js` `income20`, kept by
   `js/rules-12.js` `pass2_12`).
2. **`colonyBars32`: the computer's colony bars overflow.** `ResolveSpending @93378`
   works out each part's money × 1,000 in 32 bits (@9363c, @936a4, @936ec), so a part
   over $2,147,483 wraps and the bar comes out wrong. *Fix:* the same rounded-up per mille
   without the overflow (`js/rules-12.js` `setColonyBars12`).

### Quirk or design (left as released)

- Organize Fleets gives every fleet of the design the least fuel used (`OrganizeFleets
  @113896`): a rule that changed in every version (2.0 the average, 3.0.1 the most).
- No command to send the messages 1.2 has text for, and none to give up a colony
  (`DecolonizeStar @a3fd4` is called only by the turn): a cut-down pre-release.
- Ship and planet power noted at every star and never read (`NoteShipPowers @a4254`):
  leftover code with no effect on play.
- Players who are out still play their turn (`EndTurn @a0004`), interest and research
  going on; their fleets still fight and an out computer still moves them.
- Novas: the code is there but the style bit 0x10 is never set (`CheckForSupernova
  @a2640`); 2.0 has no novas at all, so leaving them out was the design.
- Report texts with no sender (a revolt, a volcano, metal found, a lost fleet, a nova,
  stolen tech, a forfeit): features not finished, not a slip.
- A terraforming or mining bar spent with no check that the planet still needs it, with
  the overshoot refunded (`TerraformMineStars @a0a9e`); the "never profitable" and "no
  technology money" warnings every turn.
- `ColonizeAndExplore @a3556` doesn't check that the star is nobody's before founding a
  colony: it can't matter (a loaded fleet left standing after the battles can't be at
  someone else's colony).

### Unclear (left; for the developers)

1. **Organize Fleets reloads colony ships.** A new Colony Ship fleet made by Organize
   Fleets comes loaded (`NewFleet @110004`), so splitting an empty colony fleet away from
   your colonies refills part of it. 2.0 does the same; 3.0.1 unloads such a fleet unless
   every fleet there was loaded. A free refill looks unintended, but `NewFleet` loads every
   new colony fleet on purpose (bought ones too).
2. **Underfunded colonies still grow.** `KillUnsupportedStars @a0960` clears the colony
   slot's "no growth" flag (+0x10) every turn and nothing ever sets it, so the growth
   check that reads it never stops a starving colony; 3.0.1 does stop one (+0xe). A dead
   branch, but the 2.0 reading of the same code is only medium confidence, and turning it
   on would change the economy a good deal.

---

## 2.0 (patch 2.0.1.1)

The program's own credits read "Version 2.0.1" (string 672), so its patch is 2.0.1.1
(`rs.patchVersion`), not 2.0.1.

### Obvious bug (fixed in 2.0.1.1)

1. **`meteorReport`: the stale name in the meteor report.** `FUN_1040_27ee`
   (@1040:2ab3-2acd) sends report 1009, "%s destroyed your colony at %s.", with nothing
   for the first %s; the formatter (`FUN_10c0_0784` @10c0:09b9) prints the name of
   whatever player number the reused report record held (`FUN_10c0_0e20`), and for a
   number of 20 or more reads past the game header (a General Protection Fault).
   *Fix:* the report names the meteor shower: "A meteor shower destroyed your colony at
   S." (`js/rules-dos.js` `income20`).
2. **`orgFuelCount`: Organize Ships counts at most 11 fleets.** ORGFLEETSDLGPROC
   (@10e8:2a7b-2ae6) divides the fleets' total fuel used by their number counted only up
   to 11, though the window makes up to 12 fleets, so with 12 the average comes out too
   high (an off-by-one). *Fix:* divide by the real number (`organized20`).
3. **`attack16`: the computers' attack rating wraps.** `FUN_10f0_05e9`
   (@10f0:079d-0851) works out W² × WPNRAT × (5W + 20) in 16-bit registers, so from about
   Weapons 4 it wraps round and the computers misjudge their warships. Mac 1.2 and 3.0.1
   work it out in 32 bits. *Fix:* 32 bits (`attack`, through `designCost`).
4. **`colonyBars32`: the computers' colony bars overflow.** `FUN_1020_35f9` (@1020:38da,
   3930, 3974; kept as a word @38fc, 3952, 3996), as 1.2's. *Fix:* no overflow
   (`setColonyBars20`).
5. **`scrapRange`: the wrong number passed as a Range.** ScrapOldFighters
   (`FUN_1020_4582` @1020:468b) passes the fleet's number in the list where the route
   finder (`FUN_1068_03a9`) wants its Range. No effect on play: the colony is within the
   fuel left. The remake's port (`js/ai-12.js` `scrapOldFighters`) already routes by the
   fleet's own Range, so the fix changes nothing in play; it is listed so the patch covers
   every slip found.

### Quirk or design (left as released)

- Organize Ships averages the fuel used (1.2: the least, 3.0.1: the most): a rule.
- Players who are out still play their turn (`FUN_1040_0038` @1040:02de-038b, 04c3-06d5).
- No command to give up a colony (`FUN_1040_38c0`): a colony goes only when left unfunded.
- Report texts with no sender (a nova, a revolt, a volcano, metal found, a lost fleet, a
  wormhole): features of later versions.
- The terraforming, "no ships queued" and "no technology money" warnings every turn.

### Unclear (left; for the developers)

1. **Organize Ships clears every fleet's orders** (@10e8:2e2c-2e6f), even one the window
   left alone. Deliberate code (it clears the next stop, the destination and the route),
   but 1.2 and 3.0.1 keep the orders.
2. **Organize Ships reloads colony ships** (`FUN_1068_0000` @1068:018c-0194), as 1.2.
3. **Underfunded colonies still grow** (`FUN_1040_0925`, medium confidence), as 1.2.

---

## Mac 3.0.1 (patch 3.0.1.1)

### Obvious bug (fixed in 3.0.1.1)

1. **`skip2010`: the computers skip 2010 on Spiral and Cluster maps.** `DoComputerTurn`
   does nothing while galaxy +0x10 is set (@9002a-9003a); `CreateGalaxy @f0004` sets it for
   those styles so the map is laid out in 2010, and nothing clears it before the
   computers' turn. 4.0.5 has no skip. *Fix:* the computers plan in 2010 (`js/ai-301.js`
   `aiTurn`).
2. **`refuelCheck`: a check that can never succeed.** `RefuelFighters @9508a` looks for a
   colony within a stranded fighter fleet's fuel, but tests the answer through a flag
   cleared just before (@951b4-951c6), so a colony in reach never stops the request for a
   new colony. *Fix:* a fleet with one of your colonies within the fuel it has left asks
   for none (`refuelFighters`, `FindCloseEnoughColony` mode 1 as the routine calls it).
3. **`colonyBars32`: the computers' colony bars overflow.** `ResolveSpending @93abc`, as
   1.2 and 2.0. *Fix:* no overflow (`js/ai-301.js`, the budget).
4. **`scrapRange`: the wrong number passed as a Range.** `ScrapOldShips @94e3e` passes the
   fleet's number in the list as its Range (@94f70); no effect on play. *Fix:* the fleet's
   Range (`scrapOldShips`).

### Quirk or design (left as released)

- Organize Ships gives every fleet the most fuel used (`OrganizeFleets @133d14`): a rule.
- Ship power noted and never read (`NoteShipPowers @a6410`): no effect.
- Report texts with no sender (volcanoes, revolts, metal disappearing, the "computer bug",
  STR# 1000.14, .17, .72, .77).
- A computer's skill copied from a human's after its start is set
  (`DoGameSolidificationStuff @a741a`): only the skill shown changes.
- Dip Into Savings works once; buying a ship works the interest out again: rules.

### Unclear (left; for the developers)

1. **Turning Abandon off doesn't give the share back.** `DoGalaxyMenu` calls
   `GiveBarPercent(slot, 0)` both ways (@f40e6), so an un-marked colony keeps a share of 0
   until the player drags it up. It looks like a copy-and-paste slip, but 4.0.5 and 5.0.5
   do exactly the same, the program keeps no record of the old share to give back, and
   the player can raise the bar at once.
2. **An abandoned colony with a colony ship there is colonized again at once.**
   `DecolonizeStar @a5ac0` loads the colony ships at the star, and `ColonizeAndExplore`
   then settles them there in the same turn. An unlucky interaction of two deliberate
   rules; what was meant isn't clear.
3. **Routes use the low byte of the distance table** (`CreateDistArray @130e2`,
   `DeterminePath @130686`). Distances over 255 would wrap; it isn't known whether a
   galaxy ever has them between colonies a route would use.

---

## Windows 95 4.0.5 (patch 4.0.5.1: phase 2)

### Obvious bug (to fix in phase 2)

1. **Red stars depend on uninitialised memory** (Open 1). `FUN_00436c26` starts a red
   star only with option bit 2, which comes from a stack buffer in `FUN_00484788` never
   cleared. *Fix:* the bit set, as in 3.0.1 (what the remake already plays).
2. **A Radical level with an empty hand reads the loop counter** (Open 2,
   `FUN_0043a08c`), not the draw. *Fix:* use the draw (what the remake already plays).
3. **A hand that runs out on a design card loops for ever** (Open 3, `FUN_0043a08c`).
   *Fix:* the discovery is lost (what the remake already plays).
4. **The poorest player can be one who is out** (`FUN_00463030`): out players are skipped
   by a Total Money of −1, but an out player's is 0. *Fix:* skip players who are out, as
   3.0.1 (−1 in the Compare Players table) and 5.0.5 do.
5. **30 designs: stale choices and a read past a table** (`FUN_004639ba`, global
   `DAT_005b2dc0`). *Fix:* no stale design numbers (exactly how, to settle in phase 2).
6. **ScrapOldShips**: the fleet's number as its Range (no effect), and a Biological fleet
   retired at the Scouts' mark, read past the retire table (`FUN_004641ef`). *Fix:* the
   Range; the Biological's own mark (from 5.0.5's retire rule).
7. **RefuelFighters ignores its answer** (`FUN_004644c5`), as 3.0.1's. *Fix:* as 3.0.1.1.
8. **A colony at star 0** (`FUN_0045c02c` tests the star number, not the slot kind;
   `FUN_0043b243` counts star numbers above 0). *Fix:* test the slot kind; count every
   colony.
9. **Best buddies' battle news is never shared**: the second branch of `FUN_0043853c`
   asks for a battle this year that is also before this year. *Fix:* this year's battles.
10. **Marking a ship type gives back only one ship** ordered in the window
    (`FUN_0044fd03`). *Fix:* all of them (`rs.scrapTypeRefundOne` off).
11. **"%s: %s" as the rank past 1,000,000 points** (`FUN_00482b89`, string 334). *Fix:*
    the top rank's name, "Ho! Champion".
12. **The Hall of Fame's year** prints `tm_year` (1996 is 96, 2026 is 126;
    `FUN_0049883d`, `FUN_00498b6a`). *Fix:* the year's last two digits, as in 1996.
13. **The Hall of Shame's "Loser" without its colon** (`FUN_0046d1e8`). *Fix:* "Loser:".

Also obvious, with nothing in the remake to fix: the auto play settings put the old
"colonies defended" into metal for defence (`FUN_00404c4e`; the window isn't in the
remake), and the cheating mark is set for the wrong player (`FUN_004320f8`; the remake
keeps no checksum).

### Quirk or design (left as released)

- A colony builds no more ships a turn than it has people (in thousands).
- Computers never keep Tankers.
- The Valdez leak threatens a lawsuit and takes nothing: a joke.
- Ship power noted and never read (`FUN_0043b08a`).

### Unclear (left; for the developers)

1. Surrendering to someone who surrendered to you is ruled out only after the choice is
   made (`FUN_004648d2`, `FUN_00463030`).
2. `FindCloseEnoughColony` mode 4 answers your oldest colony when only a Colony Ship
   could get there (`FUN_0045f92b`).
3. After Armageddon fizzles, everyone hears each device "turned off", then "on" again
   (`FUN_00436988`): 5.0.5 changed it differently (the devices stay on and it tries again).
4. A human's purchase counts against the colony's limit before the money check
   (`FUN_004691c4`); 5.0.5 does the same.
5. The Master Point List's picture for 50,000-499,999 points is bitmap 0x7c, which the
   program hasn't got (`FUN_00482b89`): a missing picture, but which one was meant isn't known.

---

## Mac 5.0.5 (patch 5.0.5.1: phase 2)

### Obvious bug (to fix in phase 2)

1. **Global warming never happens: a sign slip.** `FUN_100737b0` @10073870 compares the
   interest still owed (below 0) with what Ship Savings may still lend (0 or more), so the
   shortfall always goes on Ship Savings past the borrowing limit; "Global warming is
   taking place!" and the fleet scrapped for lack of funds (0x46b, 0x46c) are never sent.
   4.0.5 (`FUN_0043361b`) compares the right way round. *Fix:* 4.0.5's comparison.
2. **Tanker retirement passes the fleet's number as its Range** (`FUN_100870a0`): no
   effect. *Fix:* the Range.

### Quirk or design (left as released)

- Population milestones chained, one of each kind a turn (`FUN_1007a3f0`).
- The "never profitable", "no technology money" and red-star warnings every turn.
- The computers' evacuations set the mark directly (`FUN_10081fe0`).
- Buying a ship lowers this turn's interest (`FUN_1007e4a0`).
- An Abundant start puts the second colony before the home in the budget list.
- "%s is cheating" from a checksum: anti-cheat, not in the remake.

### Unclear (left; for the developers)

1. Budget shares used as they stand, even over 1,000 (`FUN_10073d70`, `FUN_10074f90`,
   `FUN_10077200`).
2. Dipping into savings counts as income and so raises the borrowing limit (`FUN_10077200`).
3. A Tanker's route goes only through stars recorded this year (`FUN_1007d260`).
4. After Armageddon fizzles the devices stay on and it fizzles again every turn
   (`FUN_10076d20` @10076d4c).
5. A failed purchase still uses up a building place (`FUN_1007e4a0`; 4.0.5 the same).
6. On a Spiral map the computers explore stars 0 to players − 1, the homes, before 2100
   (`FUN_10077aa0` @10077fc8): a deliberate head start or a slip.

---

## Palm 5 (patch 1.0.4.1)

The Palm program's own version is 1.0.4, so its patch is 1.0.4.1 (`rs.patchVersion`). 5.0.5's entries above apply to it, at the Palm addresses in
`docs/coverage-palm.md` (global warming: `FUN_00050ed4`).

### Obvious bug (to fix in phase 2)

1. **Missing ship pictures**: the engine and nose pictures 6205 and 6105 don't exist, so
   the fastest engines and strongest noses aren't drawn (`FUN_000128e8`). *Fix:* the
   highest picture there is (a skin matter).

### Quirk or design (left as released)

- Two Evacuate commands with two sets of jokes (`FUN_0003734e`, `FUN_00040232`).
- The debris of a battle nobody wins is lost (`FUN_00021960`), as 5.0.5.
- An Abundant start's slot order (`FUN_00026304`), as 5.0.5.
- Report 0x475 ("has just taken over for the computer player") never sent.
- "%s is cheating" (`FUN_00058cf6`): anti-cheat.

### Unclear (left; for the developers)

1. The hints are drawn from 4 to 43 (the demo from 4 to 52, past the 51 strings): the
   first three are never shown, and the demo reads past its list. The remake has no demo.
