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

Phase 1: the fixes for 1.2, 2.0 and 3.0.1. Phase 2: 4.0.5, 5.0.5 and Palm. Every version's
obvious bugs are now fixed in its patch, except those the remake already plays fixed and
those with nothing in the remake to fix (both noted below, with no fix entry);
their entries are below so the list is complete, but their rulesets list no fixes yet.

## Counts

| Version | Obvious bug | Quirk or design | Unclear |
|---|---|---|---|
| Mac 1.2 | 2 | 8 | 2 |
| 2.0 | 5 | 5 | 3 |
| Mac 3.0.1 | 4 | 5 | 3 |
| 4.0.5 | 9 fixed (+ 3 the remake already plays fixed, + 3 with nothing in the remake to fix) | 4 | 6 |
| 5.0.5 | 2 | 6 | 6 |
| Palm | 1 (+ 5.0.5's 2) | 5 (+ 5.0.5's) | 1 (+ 5.0.5's) |

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

## Windows 95 4.0.5 (patch 4.0.5.1)

### Obvious bug (fixed in 4.0.5.1)

1. **`poorestOut`: the poorest player can be one who is out.** `FUN_00463030` skips a
   player whose Total Money is −1 (3.0.1's mark for an out player, from its Compare
   Players table), but in 4.0.5 an out player's is 0, so it usually counts as the poorest
   and a computer is seldom "far the poorest". *Fix:* players who are out are left out, as
   3.0.1 and 5.0.5 do (`js/ai-405.js` `computeStatus`).
2. **`designs30`: stale design numbers with 30 designs.** With 30 designs `FUN_004639ba`
   stops making new ones, and the classes not yet reached keep last turn's choices, held
   as places in the design list (global `DAT_005b2dc0`, never cleared); a design scrapped
   since moves the others, so the number may now be another design or none. Keeping last
   turn's choice is the evident intent (the global is kept on purpose); the slip is that
   it is a list place. *Fix:* the design itself is kept, none if it is gone
   (`maintainShipTypes`).
3. **`refuelCheck`: RefuelFighters ignores its answer** (`FUN_004644c5`): it looks for a
   colony within the fuel left, passing the class as the mode, and drops the result.
   *Fix:* as 3.0.1.1: a fleet with a colony within the fuel it has left (mode 1, as
   3.0.1's routine calls it) asks for none (`refuelFighters`).
4. **`scrapRange`: ScrapOldShips passes the fleet's number in the list as its Range**
   (`FUN_004641ef`, as 3.0.1). *Fix:* the fleet's Range (`scrapOldShips`). Here the colony
   is looked for in mode 2, which can answer a colony out of the fuel's reach, so the
   Range can matter.
5. **`star0`: a colony at star 0.** `FUN_0045c02c` refuses to drag a finished colony's bar
   by testing the star number (≥ 1) instead of the slot kind, and `FUN_0043b243` counts
   colony slots whose star number is above 0 for the population milestones. *Fix:* both
   treat a colony at star 0 like any other (`dragShare`, `milestones` in
   `js/rules-405.js`).
6. **`scrapTypeRefund`: marking a ship type gives back only one ship** ordered in the
   window (`FUN_0044fd03`). *Fix:* all of them (the skin's build window, which reads
   `rs.scrapTypeRefundOne`, asks for the fix).
7. **`rankName`: "%s: %s" as the rank past 1,000,000 points** (`FUN_00482b89`, string
   334, a format string shown as it stands). *Fix:* the top rank's name, "Ho! Champion"
   (`hall.rank(points, G)`).
8. **`hallYear`: the Hall of Fame's year is `tm_year`** (`FUN_0049883d`, `FUN_00498b6a`):
   two digits only until 1999, so 2026 reads 126. *Fix:* the year's last two digits, as
   1996 showed (`hall.date(seconds, G)`).
9. **`loserColon`: the Hall of Shame's "Loser" lacks its colon** (`FUN_0046d1e8`; every
   other label has one). *Fix:* "Loser:" (`hall.loser(G)`).

The Hall of Fame, Hall of Shame and Master Point List are kept across games; the three
hall fixes apply while the game being played has the patch on.

**Already played fixed by the remake** (no fix entry: the patch changes nothing):
- Red stars depend on uninitialised memory (Open 1; `FUN_00436c26`, `FUN_00484788`): the
  remake sets the bit, as 3.0.1.
- A Radical level with an empty hand reads the loop counter (Open 2, `FUN_0043a08c`): the
  remake uses the draw.
- A hand that runs out on a design card loops for ever (Open 3, `FUN_0043a08c`): the
  remake loses the discovery.

**Obvious, with nothing in the remake to fix** (no fix entry): the auto play settings
put the old "colonies defended" into metal for defence (`FUN_00404c4e`; the window isn't
in the remake; the Mac 4.0.5's `DoConfigAutoPlayDialog` puts the new value in both, which
confirms the slip), the cheating mark is set for the wrong player (`FUN_004320f8`; the
remake keeps no checksum), and a best buddy's star record is shared by pointer
(`FUN_0043853c`'s second branch copies the record's pointer, so both players hold one
record until the game is saved, the buddy's own marked "you did not fight in that
battle" too; the Mac 4.0.5's `BestBuddiesExplore` copies the 46 bytes; the remake copies).

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
   The Mac 4.0.5 (`DRAWMASTERICON`) draws the computer-intelligence faces (icons 3030-3033,
   Dumb, Average, Smart, Diabolical) at the same steps, all present; but Windows' 0x7a,
   0x7b and 0x7d are not those four in order (0x7d, the top, is the Mac's Smart face), so
   it still isn't known which picture 0x7c was to be.
6. **A Biological fleet is retired at the Scouts' redesign mark** (moved here from
   "obvious" in phase 2). `FUN_004641ef` reads the retire table at class 6, one past its
   six entries, landing on the Scouts' redesign mark (30). Reading past the table is a
   slip, but which mark was meant isn't known: 4.0.5 has no Biological retire mark, and
   5.0.5's is 0 (retired as soon as it counts as obsolete at all), a different rule. (The
   Range slip in the same routine is fixed: `scrapRange`.) The Mac 4.0.5 has the same
   tables and reads them the same way (`ScrapOldShips`, `SetCompAttrs`).

*Settled since:* "Best buddies' battle news is never shared" (unclear 6 until the Mac
4.0.5 was read). The second branch of `FUN_0043853c` (the Mac's `BestBuddiesExplore`)
tests the buddy's record (a battle this year) and then the player's own (explored and
battle years older): two records, which the Windows decompile reads through accessors
that look alike. It runs, and shares the buddy's battle news (the record, marked so that
Review Battle says "Sorry, but since you did not fight in that battle, you have no
information about it."). The remake now does it (`shareBuddyMaps`).

---

## Mac 5.0.5 (patch 5.0.5.1)

### Obvious bug (fixed in 5.0.5.1)

1. **`globalWarming`: global warming never happens (a sign slip).** `FUN_100737b0`
   @10073870 compares the interest still owed (below 0) with what Ship Savings may still
   lend (0 or more), so the shortfall always goes on Ship Savings past the borrowing
   limit, and the branch with "Global warming is taking place!" (0x46b) and the fleet
   scrapped for lack of funds (0x46c) never runs. 4.0.5 (`FUN_0043361b`) compares the
   owed amount's negation. *Fix:* 4.0.5's comparison, then 5.0.5's own branch: what may be
   lent pays part, the rest goes on Ship Savings, each colony's temperature moves away
   from yours by rand(k, 2k) tenths, and a random fleet of the fleet list at a star is
   marked to be scrapped (`js/rules-original.js` `interest505`). One reading: in the
   decompile k is worked out from the (negative) owed amount ÷ 500, which would always
   give the floor of 1; the patch takes k = the shortfall ÷ 500 (1 to 1,000), as 4.0.5,
   since the branch was never run and its k is part of the same sign confusion.
2. **`scrapRange`: Tanker and obsolete-ship retirement passes the fleet's number as its
   Range** (`FUN_100870a0`, r8 at 0x10087228). *Fix:* the Range (`js/ai-original.js`
   `scrapOldShips`).

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
6. **On a Spiral map the computers explore the homes before 2100** (`FUN_10077aa0`
   @10077fc8; Palm `ho.c` the same test). Checked in phase 2 at the user's request; kept as
   unclear because the code looks written on purpose:
   - **Decision (the user): kept as released.** The rule needed code written only for it
     (computers only, before 2100, Spiral only, a bound that relies on Spiral home numbering),
     so it reads as intentional and stays out of the patch.
   - *What it does:* at the end of ColonizeAndExplore, when the player is a computer (the
     slot test against the player count and galaxy +0x54), the style is 2 (Spiral) and
     the year is under 2100 (0x834), it explores stars 0 to (players − 1).
   - *Stars 0 to players − 1 are always the homes on a Spiral:* the Spiral set-up
     (`FUN_1006c8c0`) calls the layout (`FUN_1006d9e0`, which fills the stars from the end
     so the arm tips come last, at the lowest numbers), then writes 0..players − 1 into
     the home table (galaxy +0x218) and shuffles it. The Cluster set-up (`FUN_1006ca18`)
     does exactly the same, so on Cluster maps too stars 0..players − 1 are the homes,
     but the rule tests only Spiral.
   - *No other version has it:* 1.2 and 2.0 give a Smart computer the stars within 9 ly of
     home before 2020; 3.0.1 and 4.0.5 give a Diabolical one the stars within 9 ly in its
     first turn (5.0.5 keeps that too). Those are by intelligence and on every map. 3.0.1
     lays Spiral and Cluster maps out in 2010 (`GiveGalaxyTemporaryCoords @f0df2` puts
     player i at star i until then) and its computers skip 2010 there; nothing in 3.0.1's
     ColonizeAndExplore or 4.0.5's code tests the style or the year 2100 (no 0x834 in
     either). So it isn't a leftover of the 2010 layout.
   - *Why unclear, not obvious:* three deliberate conditions (computers only, before
     2100, Spiral only), and a loop bound (the player count) that is only right because
     the author knew Spiral homes are stars 0..players − 1. It reads as a head start for
     the computers on the map where homes are farthest apart (arm tips), not as an
     accident. That it leaves out Cluster, which has the same home numbering, is the one
     sign of a slip, and it points the other way (to adding Cluster, not removing it).

---

## Palm 5 (patch 1.0.4.1)

The Palm program's own version is 1.0.4, so its patch is 1.0.4.1 (`rs.patchVersion`).
5.0.5's entries above apply to it, at the Palm addresses in `docs/coverage-palm.md`.

### Obvious bug (fixed in 1.0.4.1)

- **5.0.5's two, where the Palm code is the same:** `globalWarming` (DeductInterest
  `FUN_00050ed4`, the same test) and `scrapRange` (the computers are 5.0.5's code,
  `js/ai-original.js`).
- **`palmPictures`: missing ship pictures.** A ship is drawn from an engine
  (6200 + (R + V − 8) ÷ 5, up to 5), a hull and a nose (6100 + (W − 1) ÷ 5, up to 5), but
  6205 and 6105 aren't in the program, so the fastest engines and strongest noses aren't
  drawn (`FUN_000128e8`). *Fix:* the top pictures there are, 6204 and 6104 (the Palm skin,
  `js/skins/palm/ui.js` `shipPic`).

### Quirk or design (left as released)

- Two Evacuate commands with two sets of jokes (`FUN_0003734e`, `FUN_00040232`).
- The debris of a battle nobody wins is lost (`FUN_00021960`), as 5.0.5.
- An Abundant start's slot order (`FUN_00026304`), as 5.0.5.
- Report 0x475 ("has just taken over for the computer player") never sent.
- "%s is cheating" (`FUN_00058cf6`): anti-cheat.

### Unclear (left; for the developers)

1. The hints are drawn from 4 to 43 (the demo from 4 to 52, past the 51 strings): the
   first three are never shown, and the demo reads past its list. The remake has no demo.
2. The Spiral head start, as 5.0.5 (above).
