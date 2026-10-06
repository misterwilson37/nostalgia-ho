# Spaceward Ho! 5 for Palm OS: findings

Spaceward Ho! 5 for Palm OS (MobileFreon, 2003, version 1.0.4) is a port of the Mac
game 5.0 to Palm handhelds. This file explains how its rules compare with the Mac 5.0.5
rules in `js/rules-original.js`, and how the "Palm OS" ruleset (`js/rules-palm.js`,
`js/ai-palm.js`) is made. `docs/coverage-palm.md` accounts for every one of the program's
1,041 routines.

The program (`Spaceward Ho.prc`) was decompiled with `tools/decompile/palm68k.py` and
Ghidra (see `docs/decompiling.md`); the 44 routines Ghidra could not decompile were read
in a Capstone disassembly of the same layout. Palm code has no routine names, so
functions are cited by their address in that layout ('code' resource *n* at *n* ×
0x10000), for example `FUN_000232e6`. The 5.0.5 routines they are compared with are the
PowerPC ones named in `docs/original-findings.md` (for example `FUN_1006c4d0`). Text is
cited by resource: `tSTL 6020.n` is the n-th report template (report number 999 + n),
`tFRM n` a form.

Version 1.0.3 differs from 1.0.4 only in code and two string lists; the release notes
list only interface fixes ("fixed temperature preference", list and selection bugs).

Every rule is labelled:

- **CONFIRMED**: read in the decompiled Palm code (or its resources), cited by function.
- **OPEN**: the Palm code doesn't settle it; the remake falls back on 5.0.5 and the
  question is in `docs/open-questions.md` (Palm).
- **NOT IMPLEMENTED**: in the Palm version but not in the remake.

## The short version

The Palm version is **the 5.0 turn engine, recompiled for the 68000**. Its End Turn
(`FUN_000500d4`) calls the same routines in the same order as 5.0.5's (`FUN_10072a10`),
the routines keep 5.0.5's order in the program, and each was read beside its 5.0.5
twin: the same formulas, the same constants, the same slips (global warming that never
happens, shares used as they stand, the dip raising the borrowing limit, the chained
milestones, the Spiral look). Every random draw in 74 pairs of routines, the 26 of the
computer turn among them, has the same range in the same place. The player, star,
fleet and design records have the same fields, shifted by a few bytes.

So the Palm ruleset is now the 5.0.5 ruleset with **all** of its 5.0.5 hooks (the turn,
per-mille money, the marks for dismantling and evacuating, the dip, dragging a bar,
buying, late-arrival battles, the colony list, movement, novas, milestones, the
master-point cap), and its computers are the 5.0.5 port (`js/ai-original.js`, through
`js/ai-palm.js`). The Palm program differs from 5.0.5 in:

- **at most 90 stars** (5.0.5: 220);
- **no Alliances or Luck in Battles check boxes**: both always on (and novas);
- **Evacuate Planet**: "Kansas" always gets the Dorothy line and "Hope" always asks
  (5.0.5: one time in three each), the names are compared whole, and a star named
  "Ship" asks "Abandon Ship? ..." (new);
- **the star names**: "Courasant" in place of "Antares";
- **its own hints** (tSTL 6021), one every turn;
- **the difficulty rating** keeps the hot-seat factors (as before);
- random numbers from a fixed table of 5,000 (resource `RAND 1000`), no "Any (1-8)"
  computers, a demo mode, Palm system sounds, and the handheld's own windows.

Reading the Palm code also showed three things the remake's 5.0.5 rules do differently
from both programs (below, "Found for 5.0.5").

## The Palm pass (October 2026): every change to play, with addresses

"Before" is what the Palm ruleset did after the first Palm reading (5.0.5's pre-pass rules
with its own battles and computers); "now" is what the Palm code does.

| Area | Before | Now (the Palm code) | Where |
|---|---|---|---|
| The turn | the remake's generic order | 5.0.5's: pass 1 for each player (the computer plans first, then surrender, interest, dismantling, colony support, terraforming and mining, research, moves, RestoreStarsBars), the battles, Armageddon, the novas, pass 2a in a random order of players, pass 2b in order, the winner | `FUN_000500d4` (`FUN_00051b2c`, `FUN_00050ed4`, `FUN_00051dd0`, `FUN_00051184`, `FUN_00051446`, `FUN_00052832`, `FUN_00053702`, `FUN_00053c48`; `FUN_0002010e`, `FUN_00054296`, `FUN_00054498`; `FUN_00054832`, `FUN_00054ca4`, `FUN_00054d94`, `FUN_00055844`; `FUN_0005613e`, `FUN_00056244`, `FUN_000566e4`, `FUN_000563ec`, `FUN_00058206`, `FUN_000585fc`, `FUN_00053d74`, `FUN_00056828`, `FUN_0005253a`, `FUN_000583aa`; `FUN_000586fc`) |
| Money | the incomes pooled, losses paid, the rest shared out | this turn's money (last turn's income + the dip), the interest, losing colonies paid in the colony list's order, each bar's per-mille share as it stands ($2,000,000 rule); Ship Savings get the Savings share, the interest and the refunds in pass 2 | `FUN_00050ed4`, `FUN_00051184`, `FUN_00051446`, `FUN_00054d94` |
| Interest you can't pay | global warming and a fleet scrapped | never: the test compares the owed interest (below 0) with what may be lent, as 5.0.5's | `FUN_00050ed4` |
| Terraforming, mining refunds | √(⅔ money); rounded refunds | trunc(√trunc(⅔ money)), the "never profitable" warning every turn; trunc(m²/400), from 25,001 trunc(m/400) × m | `FUN_00051446`, `FUN_0002a6bc` |
| Research | shares of the tech budget | each tech's share as it stands, progress cut to 6,000, "not spending on research" every turn | `FUN_00052832` |
| Scrapping | at once | marks ("Dismantle Current Fleet" / "Dont Dismantle Current Fleet", tSTL 6001.16-17; Scrap Ship Types toggles a type's mark with no question), carried out at End Turn; a fleet bought this turn is un-bought; 3/4 (7/8) of the metal for humans, all for computers; over another's star to its owner; in hyperspace a meteor shower | `FUN_00036928`, `FUN_00073e48`, `FUN_00051dd0`, `FUN_00054ca4` |
| Evacuating | at once | a mark with Palm's jokes (above) and the profitable-colony question, the income off the net, the share to the others; carried out at End Turn | `FUN_0003734e`, `FUN_00051184` |
| Dip Into Savings | an amount | 0-30 % (tFRM 2000's slider) of Ship Savings each turn as next turn's money; the Savings bar given away and locked | `FUN_000743f6`, `FUN_00054d94`, `FUN_00049f82` |
| Dragging a bar | the remake's own | 5.0.5's redistribution, the same code; locked bars keep their shares | `FUN_00049496`, `FUN_00049f82` |
| Buying | no limit by people; interest unchanged | no more ships a turn at a colony than its people (counted before the money check); the interest worked out again; new ships join a fleet of the design bought this turn | `FUN_0004435a`, `FUN_0004d9d6` |
| Colony list | star order | a new colony in front; sorted by income each turn | `FUN_00056d34`, `FUN_000583aa` |
| Battles | one battle at a star, Palm's own order | two when ships arrive late (each its own record, replay and reports; `duel` 0 and 1), sides in viewing order, designs last to first; reports with "and your allies", the enemy's face for one enemy, "You just watched some of your allies fight"; big battles; the loser's record of the owner | `FUN_0002010e`, `FUN_00020cc8`, `FUN_00021960`, `FUN_000566e4`, `FUN_00022a6e` |
| Debris when every side is beaten | put on the planet | lost (no side standing takes it) | `FUN_00021960` |
| Arrivals and movement | everyone told | "has arrived" by 5.0.5's rule, allies told of arrivals at stars not theirs, fleets wait when the next hop is too far or to load colonists | `FUN_00053702`, `FUN_00053ac0`, `FUN_0005613e` |
| Novas and Armageddon | | the red-star warning every turn, the miracle reports, a fizzled device trying again every turn | `FUN_00054498`, `FUN_00054832`, `FUN_00054296` |
| Milestones | | chained, as 5.0.5 | `FUN_00058206` |
| Winning | Palm's own reading | 5.0.5's routine (warning 0x469, winners 0x436 with the master points capped, 0x434, 0x435) | `FUN_000586fc` |
| Master points | the whole award | at most the cap noted at the new game (halfway past your next rank), once per game | `FUN_0002a906`, `FUN_000395a6`, `FUN_000414a6` |
| Computers | a separate port | 5.0.5's port: they plan with the net and this turn's money in the coming year, ResolveSpending, evacuation by mark, terraform wishes where the bar isn't done, Tankers in attack fleets arriving late and defending, split fleets with a full tank, busy satellites left out of a colony's defence | segment 6 (table below) |
| Starting shares | 167 per mille each; Abundant 650/250/100/50 | the creator's research 180 × 5 and Radical 100; budget 650/250/100, an Abundant player 550/200/150/100 with the second colony third and the home fourth (computers 650/250/50/50) | `FUN_000395a6`, `FUN_0002b274`, `FUN_00026304` |
| Evacuate jokes | 5.0.5's | Palm's (above) | `FUN_0003734e` |
| Star names | 5.0.5's | Courasant for Antares (tSTL 6060) | `FUN_00023cda` |
| Hints | 5.0.5's, one every 7 turns | tSTL 6021.4-43, one every turn by the system's random numbers | `FUN_000500d4`, `FUN_00029b08`, `FUN_00027c4c` |

## How the routines pair up

| Step | Palm | 5.0.5 |
|---|---|---|
| End Turn, one 10-year step | `FUN_0005000c`, `FUN_000500d4` | `FUN_100728d0`, `FUN_10072a10` |
| Surrender, interest, dismantling | `FUN_00051b2c`, `FUN_00050ed4`, `FUN_00051dd0` | `FUN_100742b0`, `FUN_100737b0`, `FUN_10074580` |
| Colony support, terraforming and mining, research | `FUN_00051184`, `FUN_00051446`, `FUN_00052832` | `FUN_10073a80`, `FUN_10073d70`, `FUN_10074f90` |
| Moving, departing, RestoreStarsBars | `FUN_00053702`, `FUN_00053ac0`, `FUN_00053c48` | `FUN_10075b80`, `FUN_10075f10`, `FUN_10076070` |
| Battles | `FUN_0002010e` … `FUN_000230b2` | `FUN_1007e870` … `FUN_100819f0` |
| Armageddon, novas, ReactToSupernova, scrap metal | `FUN_00054296`, `FUN_00054498`, `FUN_00054832`, `FUN_00054ca4` | `FUN_10076680`, `FUN_100769b0`, `FUN_10076d20`, `FUN_10077110` |
| Income and growth, refuelling, colonizing and exploring | `FUN_00054d94`, `FUN_00055844` | `FUN_10077200`, `FUN_10077aa0` |
| Pass 2b | `FUN_0005613e`, `FUN_00056244`, `FUN_000566e4`, `FUN_000563ec`, `FUN_00058206`, `FUN_000585fc`, `FUN_00053d74`, `FUN_00056828`, `FUN_00056a4c`, `FUN_0005249e`, `FUN_0005253a`, `FUN_000583aa` | `FUN_100782a0`, `FUN_10078390`, `FUN_10078840`, `FUN_10078560`, `FUN_1007a3f0`, `FUN_1007abb0`, `FUN_100761c0`, `FUN_10078990`, `FUN_10078bd0`, `FUN_10074c10`, `FUN_10074cd0`, `FUN_1007a5e0` |
| Explore, colonize, give up a colony | `FUN_00056ac6`, `FUN_00056d34`, `FUN_00057076` | `FUN_10078c80`, `FUN_10078e80`, `FUN_10079190` |
| Radical discovery and hand | `FUN_0005730c`, `FUN_00058016` | `FUN_10079360`, `FUN_1007a180` |
| Winner, difficulty at the end | `FUN_000586fc`, `FUN_00058bee` | `FUN_1007acf0`, `FUN_1007b2c0` |
| Interest, mining, MetalToMoney | `FUN_00029b40`, `FUN_0002a5e2`, `FUN_0002a6bc` | `FUN_10054de0`, `FUN_10055d90`, `FUN_10055e30` |
| Ranks, master points, cap, difficulty | `FUN_0002a78a` … `FUN_0002a96c` | `FUN_10055ed0` … `FUN_100560a0` |
| Galaxy, star, players, personality | `FUN_000232e6`, `FUN_00025f4a`, `FUN_00026304`, `FUN_0002746e` | `FUN_1006c4d0`, `FUN_1006f280`, `FUN_1006f640`, `FUN_100704d0` |
| Bars | `FUN_00033180`, `FUN_000332d6`, `FUN_0003399c` | `FUN_100712b0`, `FUN_10071430`, `FUN_10071a50` |
| Fleets, DeterminePath, ship costs, buying | `FUN_0004adc0` … `FUN_0004c22c`, `FUN_0004ce40`, `FUN_0004d9d6` | `FUN_1007bcb0` … `FUN_1007d260`, `FUN_1007de60`, `FUN_1007e4a0` |
| Computers | `FUN_0006000c` … `FUN_00067fd6` (45 routines) | `FUN_10081af0` … `FUN_10088fd0` (45) |

## The 5.0.5 behaviours, checked one by one in the Palm code

Each CONFIRMED the same as `js/rules-original.js`, so the Palm ruleset uses it:

- **The turn routine**: the same calls in the same order (above); the computers plan in
  their own pass 1, after the year has moved on; the 2010 hand (0x466); the clamps;
  the gifts and canned messages delivered in pass 2b (0x44c-0x44f).
- **Per-mille money**: `FUN_00051446`, `FUN_00052832`, `FUN_00054d94` share each slot's
  money as trunc(M × pm / 1000) under $2,000,000, trunc(M / 1000) × pm above.
- **Marks for dismantling** (`FUN_00036928`: the mark at fleet +0x72, sound on setting
  it, a fleet bought this turn un-bought with its first-ship price when none of the
  design is left, the interest worked out again) and **evacuating** (`FUN_0003734e`:
  colony +0x11, the net −+ the colony's income, GiveBarPercent to 0, sounds 7002 / 4000).
- **Dip**: `FUN_0007437e` sets the slider 0 to 30; `FUN_000743f6` keeps the percentage
  (player +0x56) and gives the Savings share away; `FUN_00054d94` takes it from Ship
  Savings in pass 2 and counts it as income.
- **Bar drag**: `FUN_00049496` is `FUN_1008a7a0` line for line (in proportion; all to 0
  under a rise; the fall split when all are 0; the dragged bar 1,000 less the others or,
  dragged to 0, the first bar taking the rest); `FUN_00049f82` locks a colony being
  evacuated, a finished colony and Savings while dipping.
- **Buying limits**: `FUN_0004435a` (the count at most the colony's people less the ships
  built there this turn; a type marked for scrapping 0) and `FUN_0004d9d6`.
- **Late-arrival battles**: `FUN_0002010e`, two passes, the second with the ships whose
  stance byte has bit 1 and that arrived this turn.
- **Colony order**: `FUN_00056d34`, `FUN_000583aa`.
- **Movement**: `FUN_00053702`, `FUN_00053ac0`.
- **Novas**: `FUN_00054498` (from 2750, 94 in 100 to go on, a new red star when
  rand(1, 11) × rand(1, 9) < 2 and none is red). The Palm program draws the two in the
  other order from 5.0.5; with the remake's own random numbers this changes nothing.
- **Milestones**: `FUN_00058206`, chained.
- **Master-point cap**: `FUN_0002a906` (halfway past your next rank, `FUN_0002a7e4`),
  noted at the new game (`FUN_000395a6`, player +0x28), applied at the win
  (`FUN_000586fc` for the report, `FUN_000414a6` for the points, once per game).
- **The computers' spending**: `FUN_00064866` is ResolveSpending.

## Battle reports, replays, scrap marks, ranks and hints

- **Battle reports** (`FUN_00021960`): the codes and their arguments are 5.0.5's
  (0x3f3, 0x40c, 0x40d, 0x40e, 0x47f, 0x42f, 0x430), so `aftermath505` writes them with
  `won` set (0x40c, 0x40e and 0x47f won; 0x3f3 and 0x40d lost). The pictures come from
  the same table as 5.0.5's (`FUN_000292f8`; 0x40d the enemy's hat when there is one
  enemy, values 200-208), the sounds from the Palm system sounds (`FUN_0002c17e` turns a
  5.0.5 sound number into one, when Sound is on).
- **Replays**: each battle is its own record with its own seed (rand % 5000), and the
  battle screen replays it (`FUN_00030306` calls `FUN_00020736`), so a star with late
  arrivals has two (`duel` 0 and 1).
- **Scrap marks**: the words are "Dismantle Current Fleet" / "Dont Dismantle Current
  Fleet" (tSTL 6001.16-17), as 5.0.5's.
- **Ranks**: resource `RANK 1000`, the same 25 ranks, points and unlocks; a new rank
  shows tFRM 2900, where you may name a star for later games (NOT IMPLEMENTED).
- **Hints**: one every turn while the preference is on (`FUN_000500d4`, report 500;
  `FUN_00027c4c` reads tSTL 6021 at a SysRandom index from 4 to 43; the demo 4 to 52).
  `rs.hintTexts` holds them.

## Setup and the New Game window

| What | Palm 1.0.4 | Status |
|---|---|---|
| Star count | worked out as in 5.0.5, then kept between **19 and 90** (5.0.5: 220) | CONFIRMED (`FUN_000232e6`) |
| Layouts | 5.0.5's seven shapes (`FUN_000240aa` Circle, `FUN_0002472c` Spiral, `FUN_00024f04` Cluster, `FUN_000243c2` Ring, `FUN_00025360` Grid, `FUN_00023e66` Random, `FUN_0002552e` Hex) | CONFIRMED |
| Alliances, Luck in Battles | no check boxes (tFRM 1200 has only Best Buddies); the options keep the default 0x17 (bit 1 alliances, 2 novas, 4 luck, 0x10 humans start allied); Best Buddies is 0x20 | CONFIRMED (`FUN_0003825a`, `FUN_0002b274`) |
| Number of computers | 1 to the rank's limit; no "Any (1-8)" | CONFIRMED (`FUN_00038e72`) |
| Other settings and defaults | as 5.0.5 (4 computers, Circle, size 20, density 10, IQ 70, 10 years) | CONFIRMED (`FUN_0002b274`) |
| Locking settings by rank | as 5.0.5 | CONFIRMED; not done (as for 5.0.5) |
| Starting money, metal, population, technology, ships, designs, borrowing limit | as 5.0.5 | CONFIRMED (`FUN_00026304`) |
| Starting shares | the creator's from the preferences (above) | CONFIRMED (`FUN_000395a6`) |
| Computer skill and personalities | as 5.0.5 | CONFIRMED (`FUN_00026304`, `FUN_0002746e`) |
| Computer names | each computer's sex drawn (rand(1, 2)), no two names the same; up to five star names you chose at a new rank put in the galaxy | CONFIRMED (`FUN_000692c4`); the chosen names not |
| Difficulty rating | 5.0.5's formula; at a win × 0.97 per human after the first, × 0.95 per human who surrendered to a human (game +0x1a9, `FUN_00051b2c`), + 1 per human winner after the first, − 1 per human who didn't win; 0 when game +0x1d0 is set | CONFIRMED (`FUN_0002a96c`, `FUN_00058bee`) |

## Randomness

| What | Palm 1.0.4 | Status |
|---|---|---|
| Random numbers | `Random(lo, hi)` = lo + next() mod (hi − lo + 1), next() the next of 5,000 long words of resource `RAND 1000`; a new game starts at (seed mod 5000); the position is saved with the game | CONFIRMED (`FUN_00029abc`); the remake keeps its own |
| SysRandom | the hints and the Message History's Evacuate jokes | CONFIRMED (`FUN_00029b08`) |

## Computer players (`js/ai-palm.js`)

The computer turn is `FUN_00060178` (5.0.5 `FUN_10081cc0`); its 45 routines are 5.0.5's
45 in the same order (`docs/coverage-palm.md` pairs them). Every random draw in the 26
routines of the turn has the same range in the same place. So `js/ai-palm.js` registers
the 5.0.5 port of `js/ai-original.js` for the Palm ruleset. It replaces an earlier,
separate port of the Palm routines, which differed from `js/ai-original.js` in a few
places; in each, the Palm code sides with `js/ai-original.js`:

- a fleet split off at a star starts with a full tank, a Biological's empty
  (`FUN_0004adc0`, 5.0.5 `FUN_1007bcb0`);
- the satellites counted for a colony's defence leave out satellite fleets already
  given something to do (fleet +0x73, `FUN_0004d89e`, 5.0.5 `FUN_1007e380`);
- terraforming is wished for at each colony of class 9 or 10 whose Terraform bar isn't
  done, with no other test (`FUN_00060c9c`, 5.0.5 `FUN_10082690`);
- the year tests use the coming year (`FUN_000500d4` adds 10 before pass 1);
- a Tanker's route goes through stars whose record is of this year (`FUN_0004c22c`).

The steps: 1 `FUN_00067ebe`; 2 `FUN_000654e6`, `FUN_00065a46`; 3 `FUN_00064bd8`; 4
`FUN_000672b8`; 5 `FUN_00067fd6`; 6-8 `FUN_00065b5e`, `FUN_00065d16`, `FUN_00065f30`; 9
`FUN_000661fa`, `FUN_00066eb0`; 10-16 `FUN_00060506` research, `FUN_0006053a` colony
support, `FUN_00060c9c` terraforming, `FUN_00060e76` exploring, `FUN_000611f4` attacks,
`FUN_00061796` colonizing, `FUN_000620b6` satellites; 17 `FUN_000626d8`; 18-19
`FUN_00062cba`, `FUN_00062f2c`; 20 `FUN_0006455e`; 21 `FUN_00064866`.

## Found for 5.0.5

Reading the Palm code beside 5.0.5's turned up three places where `js/rules-original.js`
differs from both programs:

1. **The growth-slowed report** ("%s's population growth rate has slowed.", 0x408) is
   sent only in the branch for a colony earning −7,499 or more (`FUN_10077200`; Palm
   `FUN_00054d94`); the remake sent it for new colonies too. Fixed in `income505` (both
   rulesets; it doesn't change the games' course).
2. **An Abundant start** (`FUN_1006f640` @slot 3; Palm `FUN_00026304`): the second
   colony takes the third slot of the colony list and the home's record, copied to the
   fourth, gets 50 per mille, so the shares are 650 + 250 + 50 + 50 = 1,000, not 1,050
   with the home third. And the human creating a game gets the preferences' shares
   (`FUN_1006579c`; defaults in `FUN_10072490`: research 180 × 5 and Radical 100, budget
   650 / 250 / 100, Abundant 550 / 200 / 150 / 100). Checked in the 5.0.5 decompile and
   now done in `js/rules-original.js` `afterSetup` and `creatorShares505`, for both
   rulesets (`docs/original-findings.md`, section 3); the Palm ruleset's games are as
   they were.
3. **The Radical Research window** (`FUN_1005f280`, dialog 0x99; Palm tFRM 3000): with
   a full hand, the player may cancel one radical program. `docs/coverage-505.md` lists
   the routine as a report list; it is a rule-touching window (corrected there). Not in
   either ruleset.

Also, the research shares (player +0x80) are per mille as they stand; the skin's
Technology bars store them as fractions of 1 once drawn, which made `research505` give a
human almost nothing. `research505` now reads fractions as per mille (a total of 2 or
less); computer players' shares are per mille, so the test games don't change. 4.0.5's
research (`js/rules-405.js` `research`) had the same slip and reads them the same way
now; `tools/human-play.js` plays a human through the page in every ruleset to catch
any other.

## Pictures (for a Palm skin)

All pictures are `Tbmp` resources, drawn by `FUN_0001445c` (DmGetResource 'Tbmp',
WinPaintBitmap; nothing is drawn if the resource is missing).

### Planets on the galaxy map (`FUN_000128e8`)

At zoom levels 1–4 a star is a small coloured square, with no pictures. Above that:

- **Selected star**: 3101 (the green ring), drawn first, 11 px left and 10 px up.
- **Red or exploded star** (the star's nova counter, star + 0x14, is not 0): 2712;
  2713 when the counter is above 70; 2714 above 90 (this includes a star that has
  exploded, whose counter holds the year). No planet picture is drawn.
- **Explored star** (your record of it has a year ≥ 2000): the planet picture from
  `FUN_000144b4`: the gravity ratio star ÷ your home × 100 picks the size: ≥ 251 → 2101,
  201–250 → 2102, 126–200 → 2103, 76–125 → 2104, 51–75 → 2105, 40–50 → 2106, under 40 → 2107.
  **2201–2207 are the same sizes for a small drawing box** (under 26 px), not mined
  planets.
- **Seen but not explored, nobody's** (your record's second date ≥ 2000, owner none):
  2708.
- **Unexplored**: 2706 if one of your fleets is heading there, otherwise 3000 (the "?").
- **Someone else's colony**: their hat, 2818 + the player's hat number (+9 for the
  other Player Sex), 2918 + … in a small box; then 3400 (gold halo) if you are allies,
  3401 (blue halo) if best buddies (`FUN_00014670`).
- **Your colony** (explored, yours): `FUN_00013580` / `FUN_000145ac` draw your hat by the
  star's rating (0–20, `FUN_00033f00`): above 15 → 2801, 6–15 → 2802, 2–5 → 2803, 0–1 and
  not profitable → 2804; +4 (2805–2808) for the other Player Sex; 2901–2908 in a small
  box.

`FUN_0001456c` and `FUN_0001458c` work out 2505/2605 and 2701/2702 but the results are
thrown away; 2703–2705, 2707 and 2709–2711 were not found in use.

### Ships in battles (`FUN_000310a6`, called from the battle screen `FUN_00030a80`)

- **The planet** (no design): 6009, the striped planet.
- **Special pictures** (`FUN_00030e04`), in this order (types: 0 Scout, 1 Dreadnought,
  2 Fighter, 3 Tanker, 4 Colony Ship, 5 Satellite, 6 Biological):
  Biological W < 7 → 6000; Biological W 13–15 → 6001; other Biologicals → 6002;
  Scout W 1 → 6014; Dreadnought W > 30 → 6006; Dreadnought W 8, R 11–13, Mini > 1 →
  6005; other Dreadnoughts → 6004; Fighter W < 9 and Speed > 5 → 6007; Fighter W 12 and
  S < 11 → 6008; Satellite W 5, S 4–6 → 6010; W 15, S 14–16 → 6011; W < 9, S 10–14 →
  6012; S < 5, W 16–20 → 6013.
- **Other Satellites**: 6400 + clamp((W − 1) ÷ 6, 0, 4).
- **Other ships**: three parts side by side, 20 px apart: engine 6200 +
  clamp((R + V − 8) ÷ 5, 0, 5), hull 6300 + clamp((S − 1) ÷ 6, 0, 4) (Colony Ship: 6003,
  Tanker: 6015), nose 6100 + clamp((W − 1) ÷ 5, 0, 5). 6105 and 6205 don't exist, so the
  top engine and nose are simply not drawn (a bug in the original).
- **Destroyed**: 5000, 5001, 5002 drawn one after another (`FUN_0003137a`).

No ship pictures are drawn in lists. 8010 and 8011 were not found in use.

### Report pictures (`FUN_00013250`, table `FUN_000292f8`)

Report n gets picture 9000 + table(n); the table is 5.0.5's (`msg_pic` of
`FUN_1009d670`) except 1159 → 9051. Table values 200–208 mean "player k's hat"
(`FUN_00014670`, as on the map). Reports 1033–1035 (`0x409`–`0x40b`, exploring) draw
the explored planet's picture instead (`FUN_000144b4`). Reports 1003–1007 (technology
levels) print the new level over the picture.

### Other pictures

3201–3207 are the galaxy-shape icons of the New Game windows (Circle, Spiral, Cluster,
Ring, Grid, Random, Hex; `FUN_00070938`, `FUN_00070a86`); 3300–3302 the list marks
(cross, smiley, frown) of the Enemies and Allies screen (`FUN_00076988`); 9401–9404 the
won and lost pictures (`FUN_00071acc`…); 1170–1173 scroll arrows; 1007 the splash
screen.


## Changes to the shared code

- `js/rules-original.js`: `is505(G)` is the ruleset flag `turn505` (not enumerable on the
  5.0.5 ruleset, set by the Palm ruleset); `income505` sends 0x408 only for established
  colonies; `research505` reads research shares kept as fractions. `makeGalaxy()` takes
  an optional cap on the star count (from before).
- `js/skins/classic/ui.js`: `rs.hintTexts`, a version's own hints, one every turn
  (README hook list).
- The 5.0.5, 1.2, 2.0, 3.0.1, 4.0.5 and Claude test games are the same, byte for byte.

## Still open

`docs/open-questions.md` (Palm) has the questions for the developers. In short: the
debris lost when every side is beaten, the Message History's Evacuate keeping 5.0.5's
one-in-three, the Abundant shares, and the unused report 0x475 ("%s has just taken over
for the computer player %s.").
