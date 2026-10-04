# Spaceward Ho! 5 for Palm OS: findings

Spaceward Ho! 5 for Palm OS (MobileFreon, 2003, version 1.0.4) is a port of the Mac
game 5.0 to Palm handhelds. This file explains how its rules compare with the Mac 5.0.5
rules in `js/rules-original.js`, and how the "Palm OS" ruleset (`js/rules-palm.js`) was
made.

The program (`Spaceward Ho.prc`) was decompiled with `tools/decompile/palm68k.py` and
`tools/decompile/Mac68k.java` (see `docs/decompiling.md`). Palm code has no routine
names, so functions are cited by their address in that layout ('code' resource *n* at
*n* × 0x10000), for example `FUN_000232e6`. The 5.0.5 routines they are compared with
are the PowerPC ones named in `docs/original-findings.md` (for example
`FUN_1006c4d0`). Text is cited by resource: `tSTL 6020.n` is the n-th report template
(report number 1000 + n), `tFRM n` a form.

Version 1.0.3 differs from 1.0.4 only in code and two string lists; the release notes
list only interface fixes ("fixed temperature preference", list and selection bugs).

As in `301-findings.md`, every rule is labelled:

- **CONFIRMED**: read in the decompiled Palm code (or its resources), cited by function.
- **GUESS**: the decompile doesn't settle it, so the remake follows 5.0.5.
- **NOT IMPLEMENTED**: in the Palm version but not in the remake.

## The short version

The Palm version is **the 5.0 turn engine, recompiled**. Routine by routine, the code
does what 5.0.5 does, with the same constants and the same structure; even the player
and game records have the same fields (shifted by a few bytes). The differences from
5.0.5 are few:

- **At most 90 stars** (5.0.5: 220). Galaxies above about size 36 (Grid from size 50,
  Hex from size 45) come out smaller.
- **No Alliances or Luck in Battles check boxes**: both are always on.
- The random numbers come from a fixed table of 5,000 numbers stored in the program
  (resource `RAND 1000`), not one made at the start of the game.
- No "Any (1-8)" choice for the number of computers.

The remake's 5.0.5 rules (`js/rules-original.js`, `js/ai-original.js`) are in places a
looser reading of that same code. So the Palm ruleset is built over `rules-original.js`,
but every rule it takes from there was checked against the Palm code (the "Inherited
rules audit" below), and where the remake's 5.0.5 rules differ from the code, the Palm
ruleset does what the Palm code does:

- its **own computer players** (`js/ai-palm.js`), a port of segment 6;
- the **battle's** order of groups, the losses falling on the fleets listed last, the
  debris going to the first side left standing, and what each side learns from it;
- the **retiring of unused ship types** once a player has more than 17;
- the **win check**: an alliance of two or more humans must hold for a turn;
- the **difficulty rating** at a win (the hot-seat factors).

## How the comparison was done

The turn routine (`FUN_000500d4`, 5.0.5 `FUN_10072a10`) calls the same steps in the
same order, which pairs up the routines:

| Step | Palm | 5.0.5 |
|---|---|---|
| Interest and debt | `FUN_00050ed4` | `FUN_100737b0` |
| Dismantling | `FUN_00051dd0` | `FUN_10074580` |
| Colony support | `FUN_00051184` | `FUN_10073a80` |
| Terraforming and mining | `FUN_00051446` (+ `FUN_0002a5e2`, `FUN_0002a6bc`) | `FUN_10073d70` (+ `FUN_10055d90`, `FUN_10055e30`) |
| Research | `FUN_00052832` | `FUN_10074f90` |
| Movement | `FUN_00053702` | `FUN_10075b80` |
| Battles | `FUN_0002010e`, `FUN_00021960` and the routines after them | `FUN_1007e870`, `FUN_1007eed0`, … |
| Armageddon, novas | `FUN_00054296`, `FUN_00054498` | `FUN_10076680`, `FUN_100769b0` |
| Supernova, population and income, tankers and biologicals | `FUN_00054832`, `FUN_00054d94`, `FUN_00055844` | `FUN_10076d20`, `FUN_10077200`, `FUN_10077aa0` |
| Radical discoveries, hand of four | `FUN_0005730c`, `FUN_00058016` | `FUN_10079360`, `FUN_1007a180` |
| Win check | `FUN_000586fc` | `FUN_1007acf0` |
| Interest formula | `FUN_00029b40` | `FUN_10054de0` |
| Master points | `FUN_0002a844` | `FUN_10055f60` |
| Galaxy setup, star stats, player setup | `FUN_000232e6`, `FUN_00025f4a`, `FUN_00026304` | `FUN_1006c4d0`, `FUN_1006f280`, `FUN_1006f640` |
| Computer personality | `FUN_0002746e` | `FUN_100704d0` |

Each pair was read side by side. The Palm code does its floating point through the
Palm OS soft-float traps (`Flp_d_mul` and so on, constants written out in full), so its
formulas are easier to read than the PowerPC ones.

## Ruleset differences from 5.0.5

### Setup and the New Game window

| What | Palm 1.0.4 | Status |
|---|---|---|
| Star count | worked out as in 5.0.5 (Grid (size ÷ 10 + 5)², Hex 3(k+2)(k+3)+1, others 2 × size + 19 ± (size ÷ 10 + 6)), then kept between **19 and 90** (5.0.5: 220) | CONFIRMED (`FUN_000232e6`) |
| Layouts | 5.0.5's seven shapes, built from the capped count | CONFIRMED (the shape routines `FUN_000240aa`, `FUN_0002472c`, `FUN_00024f04`, `FUN_000243c2`, `FUN_00025360`, `FUN_00023e66`, `FUN_0002552e` use the same constants as 5.0.5's) |
| Alliances, Luck in Battles | no check boxes (tFRM 1200 has only Best Buddies). The options word keeps the default 0x17: bit 1 alliances, bit 2 novas, bit 4 luck, bit 0x10 humans start allied; Best Buddies is bit 0x20 | CONFIRMED (tFRM 1200, `FUN_0003825a`, defaults in `FUN_0002b274`; bits read in `FUN_0002010e` (luck), `FUN_00054498` (novas), `FUN_000661fa` (alliances)) |
| Number of computers | a list from 1 to the rank's limit (4 to 8); no "Any (1-8)" | CONFIRMED (`FUN_00038e72`) |
| Other settings | IQ 50–200, Size, Density, Shape, your Home System, the computers' Home System (with "Based on IQ"), Years Per Turn 10/20/30/50, Best Buddies; the same defaults as 5.0.5 (4 computers, Circle, size 20, density 10, IQ 70, 10 years a turn) | CONFIRMED (`FUN_0002b274` matches 5.0.5's `FUN_10072490` field for field) |
| Locking settings by rank | as 5.0.5: resource `RANK 1000` has the same 25 ranks, points and unlocks | CONFIRMED (`FUN_00038c6a` … `FUN_000392ee`); the remake doesn't lock settings (as for 5.0.5) |
| Starting money, metal, population, technology, ships, designs | as 5.0.5 | CONFIRMED (`FUN_00026304`) |
| Computer skill from IQ | as 5.0.5: (IQ − 50) × ⅔ − 12 plus 25 split across the computers | CONFIRMED (`FUN_00026304`) |
| Computer personalities | the same ranges, value for value | CONFIRMED (`FUN_0002746e`) |
| Difficulty rating | the same formula, constant by constant: the six scores (gap 4 → 15, 5 → 25, 6 → 40, else gap + 7; −4 / −2 for Abundant / Thriving players; 1 + (IQ − 50) ÷ 15; 2 × buddies × (n − 1) + n + 2; shape 4 / 7 / 10; 12 − (size − 1) ÷ 15, the same for density), (10 × lowest + sum with the first counted twice) ÷ 2 + 25; at a win (`FUN_00058bee`) × 0.9 per Armageddon, × 0.95 per human who surrendered to a human, × 0.97 per human after the first, + 1 per human winner after the first, − 1 per human who didn't win, + 1 for a win from 2000 to 3000, − year ÷ 5000 from 5000, − (turn time limit term), kept to 30–140 | CONFIRMED (`FUN_0002a96c`, disassembly; `FUN_00058bee` for the arguments). The remake's 5.0.5 rating lacks the hot-seat factors; `rules-palm.js` has them |

### Randomness

| What | Palm 1.0.4 | Status |
|---|---|---|
| Random numbers | `Random(lo, hi)` = lo + next() mod (hi − lo + 1), where next() reads the next of 5,000 long words from resource `RAND 1000`, wrapping from 4999 back to 1. A new game starts at (seed mod 5000); the position is saved with the game | CONFIRMED (`FUN_00029abc`, `FUN_0002c34a`, `FUN_000232e6`, the turn routine) |
| The remake | keeps its own random numbers, as for 5.0.5 | (no change) |

`SysRandom` is used once, for something cosmetic (`FUN_00029b08`).

### Everything else

Money, interest, colony support, global warming, terraforming (√(⅔ × money), refund
3/2 d²), mining (20 × √money), population growth, income
(pop × max(1, ln √pop) ÷ 76 − (7,500 + pop × (100 + H ÷ 40) ÷ 10,000)), research
(0.8 × √(money ÷ 150), Range L^2.5 ÷ 3), the radical hand of four and its odds
(7, 5, 7, 4 … 5, the same table), novas (from 2750, 1 in 99, 6% miracle), supernova
shock waves, Armageddon, battles (the hit table, one planet shot per 200,000 people),
debris, scrapping, tankers, biologicals, the win check and master points
(3^((difficulty − 30) ÷ 10), at most 10,000,000): all CONFIRMED the same as 5.0.5 in the
routines listed above.

### Not rules, but different

| What | Palm 1.0.4 | Status |
|---|---|---|
| Report pictures | the same table as 5.0.5 (`FUN_000292f8`), except report 1159 (the "Palm OS version by…" credit) gets picture 9051. Player pictures are the player's hat | CONFIRMED |
| Hot seat | a Players form (tFRM 1300) to add humans and pass the handheld | the remake's own hot seat |
| Demo mode | an unregistered copy plays only a small galaxy against three computers (shape 2, IQ 70) and caps technology | NOT IMPLEMENTED (nothing to register) |
| Ship pictures | no parts sheet: whole pictures and three parts per ship (below) | for the skin |

## Computer players (`js/ai-palm.js`)

The computer turn is `FUN_00060178` (5.0.5 `FUN_10081cc0`): the same 21 steps in the same
order, each step's Palm routine read beside its 5.0.5 twin and found the same (the
4-byte-shifted record offsets apart; the Palm decompile drops some call arguments, which
were read in the disassembly). `js/ai-original.js`, the remake's 5.0.5 computers, is an
earlier and looser reading of this code, so the Palm computers are a fresh port of the
Palm routines, not built on it. Everything below is CONFIRMED in the routine named.

| Step | Palm | 5.0.5 | What it does |
|---|---|---|---|
| 1 | `FUN_00067ebe` | `FUN_10088eb0` | fleets of several types at a star are split into one fleet per type (not satellites, or warships with tankers) |
| 2 | `FUN_000654e6`, `FUN_00065a46` | `FUN_10086830`, `FUN_10086d90` | obsolescence (Range × 5, Speed × 15, Weapons × 15, Shields × 10, Mini × 10, with the Scout/Tanker/Colony/Satellite exceptions); types with no ships, or 10 Weapons levels behind, are retired if behind your tech; a new type when the best has reached its kind's redesign mark (30/60/30/60/60/20) and there are fewer than **24**; room is kept for 6 new types; Average and up pay no development cost for their own types |
| 3 | `FUN_00064bd8` | `FUN_10085f60` | metal for defence −5 a turn (1–80; raiders 1–50; turtles never), colonies the income supports, the reserve, total metal, broke, defence and attack metal (spare metal less 5,000 with no colony ship, else less the colony ships' metal), surrender after 2500, **"I need metal."** (after 2500, under 10,000 metal) and **"I need money."** (after 2400, the poorest by over $2,000) to each ally one time in 20, the middle of your colonies (summed in 16 bits) |
| 4 | `FUN_000672b8` | `FUN_10088460` | the star classes 0–10 (a best buddy's colony counts as class 6); **Diabolical computers see every star within 8 ly of home before 2020**; threats from the battle estimates in your star records; old news fades |
| 5 | `FUN_00067fd6` | `FUN_10088fd0` | colony ships heading for a star now unsafe stop; moving fleets are busy |
| 6–8 | `FUN_00065b5e`, `FUN_00065d16`, `FUN_00065f30` | `FUN_10086f20`, `FUN_100870a0`, `FUN_100872a0` | obsolete satellites scrapped; obsolete ships (and **every computer's tankers**) go home to be scrapped (passing the fleet's list number as its Range, a slip kept); stranded warships of 5 or more ask for a colony where they are (priority 58/78/98); biologicals go back to a colony |
| 9 | `FUN_000661fa`, `FUN_00066eb0` | `FUN_10087530`, `FUN_10087f80` | last turn's reports: Range 16 and Mini levels move research to Weapons and Shields, Weapons levels raise the planet part of the estimates; curses and "I hate %s." when a colony is destroyed, "Sorry!" after an easy win, "Thank You!" for gifts, the planet-preference exchange, alliances made and broken; after 2500 the richest is liked less; dislike the friends of the disliked; ally at a feeling of 500. With three or more players, raising a feeling lowers it for the others by a sixth; **frozen in a Best Buddies game**. At most **3 messages a turn** (`FUN_00066fdc`) |
| 10–16 | `FUN_00060506`, `FUN_0006053a`, `FUN_00060e76`, `FUN_000611f4`, `FUN_00061796`, `FUN_00060c9c`, `FUN_000620b6` | `FUN_10081fa0` … `FUN_100839a0` | the action list (at most 50, by priority): research 90; mining 75/30; abandoning colonies beyond the income (offered with "You take %s." to an ally who likes the planet); exploring 86/55/54; attacking 35 + 5 × aggressiveness, targets scored (a random start, ties to the first) with the richest *other* player +25; colonizing (+38 or +77); terraforming 70/80 ($3,000 / $10,000 / $15,000, Dumb the whole job); satellites 60 (the threat ÷ 100 × defence %), scrapping unthreatened ones 10 |
| 17 | `FUN_000626d8` and the routines it calls | `FUN_10083e30` … | the actions in order; ships are bought from Ship Savings above the reserve, never past the borrowing limit, one thousand people a ship at the colony this turn, development costs for Dumb and Average (their starting types); a failed purchase stops ship buying for the turn and scraps idle ships for a colony ship's metal; with under 5,000 metal and no colony ship only colony ships are bought; attacks use a fleet strong enough, else biologicals late in the game, one dreadnought (with a tanker over 10,000 metal) or a wing of fighters (tankers for big wings) |
| 18–19 | `FUN_00062cba`, `FUN_00062f2c` | `FUN_100843b0`, `FUN_100845f0` | Smart and up: idle warships with tankers add a target in Range as a stop; Diabolical with more than 10 years a turn: a second stop |
| 20 | `FUN_0006455e` | `FUN_10085900` | idle fleets that have used fuel go home from danger; colony ships bound for an enemy star stop |
| 21 | `FUN_00064866` | `FUN_10085bd0` | the budget bars, per mille rounded up |

Routes: fleets are sent with DeterminePath (`FUN_0004c22c`, 5.0.5 `FUN_1007d260`), which
goes straight within the fuel left, else through colonies of yours and your best
buddies' (any star seen this turn for a fleet with a tanker), at most 7 hops, shorter
than three times the straight line.

Personalities (`FUN_0002746e`, 5.0.5 `FUN_100704d0`): the 5.0.5 ranges, value for value.
Of the computers (numbered after the humans), every 4th from the 4th is the **turtle
(style 2**: defence 100 %, metal for defence 90 %, attack domination 1,000 %,
aggressiveness 1) and every 4th from the 3rd the **raider (style 3**: aggressiveness 10,
fleets of 25–30), Smart and Diabolical only; with density over 50 their Range research
is raised by 80. Diabolical computers start at −50–0 toward humans and 350–450 toward
computers.

**`js/ai-original.js` (5.0.5)** used to be a looser reading of this code; it has since
been ported again from the 5.0.5 decompile itself (routes, star-record estimates, the
ship-type rules, tanker retirement, chained stops, 5.0.5's own buying; see
docs/original-findings.md, "Computer players"). The two ports are separate code. Two
places where the 5.0.5 code was read to differ from this port (not checked in the
Palm code): a fleet split off in step 1 starts with a full tank (`FUN_1007bcb0`), and
the satellites counted for a colony's defence leave out satellite fleets already given
something to do (`FUN_1007e380`).

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

- `rules-original.js`: `makeGalaxy()` takes an optional fourth argument, a lower cap on
  the star count. 5.0.5 passes nothing and keeps its 220.
- `engine.js` loads `js/ai-palm.js` under Node, and `index.html` lists it. No other
  ruleset changes (their test games are the same, byte for byte).

## Inherited rules audit

Every rule the Palm ruleset takes from `rules-original.js` (5.0.5) or the engine, checked
against the Palm code. "Same" means the Palm routine was read and does what the remake
does; "Palm's own" means it differed and `rules-palm.js` / `ai-palm.js` now do the Palm
thing. The economy, research, events and movement rows rest on the routine-by-routine
comparison above (each Palm routine's formulas and constants against the remake's);
the computers, the battles, the type limits, the win check and the difficulty rating
were read in full for this audit.

| Rule | From | Palm | Result |
|---|---|---|---|
| Computer players and personalities | `ai-original.js` | segment 6, `FUN_0002746e` | Palm's own (`js/ai-palm.js`, above) |
| Computers' development costs | 5.0.5 `paysPrototype` | `FUN_00063e62`, `FUN_000654e6` | Palm's own: Dumb and Average pay for types never built, except Average's own new types |
| Star count, layouts | 5.0.5 `makeGalaxy` | `FUN_000232e6` and the shape routines | Palm's own cap of 90 (above) |
| Star stats, home systems, starting conditions, computer skill from IQ | 5.0.5 | `FUN_00025f4a`, `FUN_00026304` | same |
| Alliances and luck options | engine | tFRM 1200, `FUN_0002b274` | Palm's own: always on |
| Best Buddies start | 5.0.5 `afterSetup` | `FUN_000232e6` | same (and feelings then frozen, in `ai-palm.js`) |
| Years per turn; computers plan on the first 10-year step | engine | `FUN_000500d4` | same |
| Interest and debt, global warming, the fleet scrapped for lack of funds | 5.0.5 `economy` | `FUN_00050ed4`, `FUN_00029b40` | same |
| Colony support | 5.0.5 `economy` | `FUN_00051184` | same |
| Terraforming (√(⅔ money), refund 3/2 d²) and mining (20 √money) | 5.0.5 `economy` | `FUN_00051446`, `FUN_0002a5e2`, `FUN_0002a6bc` | same |
| Research (0.8 √(money ÷ 150), level costs) | 5.0.5 `research` | `FUN_00052832` | same |
| Radical discoveries, the hand of four and its odds | 5.0.5 `radical` | `FUN_0005730c`, `FUN_00058016` | same (the free designs and monster need fewer than 24 types, `FUN_0005730c`) |
| Dismantling: scrap returns 3/4 (7/8) to humans, all to computers | 5.0.5 `scrapReturn` | `FUN_00051dd0` | same |
| Retiring unused types beyond 17 | 5.0.5 does it too (`FUN_10074580`), now in `rules-original.js` for the 5.0.5 ruleset | `FUN_00051dd0` | same (`rules-palm.js` keeps its own copy) |
| Design limit | 5.0.5 `maxDesigns` 24 | `FUN_00043754`, `FUN_000654e6` | same: 24 |
| Movement, fuel, waiting to refuel, wormholes | engine, 5.0.5 `fleetArrives` | `FUN_00053702` | same |
| Routes for humans' fleets | engine (direct moves; waypoints by hand) | DeterminePath `FUN_0004c22c` | the computers use it (`ai-palm.js`); humans set stops by hand as for 5.0.5 (interface) |
| Battles: luck, stances, hit table, damage, targets, initiative, shots, debris, late arrivals | 5.0.5 `battle` | `FUN_0002010e`, `FUN_00020736`, `FUN_00020cc8`, `FUN_00020f0a`, `FUN_00020bb8`, `FUN_0002144e` (read in full) | same |
| Battles: group order, which fleets keep the survivors, debris to the first side standing (5/4 with recycling) | 5.0.5 `battle` | `FUN_00020cc8`, `FUN_00021370`, `FUN_00021960` | Palm's own (`rules-palm.js`) |
| What a battle teaches, the computers' feelings and defence after it | engine `battleNews`, `ai-original` `noteBattle` | `FUN_00021960`, `FUN_000212c6` … `FUN_00021370` | Palm's own (star-record estimates, feelings −30…−10 / −100…−50 / −200…−100, defence +10 / +5) |
| Battles as one report per star (the Palm game reports the late arrivals' second exchange as a second battle) | engine | `FUN_0002010e` (two passes) | accepted (interface) |
| Population growth, income, maximum population, meteors | 5.0.5 `afterMovement` | `FUN_00054d94` | same |
| Tankers and biologicals refuelling | 5.0.5 `refuel` | `FUN_00055844` | same |
| Novas, supernovas and their shock waves, Armageddon | 5.0.5 `randomEvents` | `FUN_00054296`, `FUN_00054498`, `FUN_00054832` | same |
| Colonizing, exploring, star rating | engine, 5.0.5 `settle`, `exploreQuality` | `FUN_00055844`, `FUN_00033ece` | same |
| Gifts, alliance news, best buddies sharing maps, surrender | engine | `FUN_00051b2c` and the turn routine | same |
| Who is out | engine `checkElimination` | `FUN_000586fc` (the elimination notices; the out flag is set elsewhere) | same in outline: no colony and no colony ship |
| Who has won | engine `checkElimination` | `FUN_000586fc` | Palm's own: two or more surviving humans must hold the alliance a turn (6020.129); checked after 2000 |
| Difficulty rating, master points | 5.0.5 `difficulty`, `masterPoints` | `FUN_0002a96c`, `FUN_00058bee`, `FUN_0002a844` | rating Palm's own (hot-seat factors); master points same |

## Still unclear

- The 9th value DeterminePath reads beyond its 8 arguments (a cap on the hops) is
  whatever lies on the caller's stack; the remake takes it as no cap.
- A fleet with a tanker routes through "stars seen this year"; the remake takes stars
  observed in the last turn (GUESS).
- Where the computers note another player's planet preference ("I like planets that
  are …"); the remake notes it when the message arrives (GUESS).
- The order of colonies won in the same turn in the colony list (it only breaks ties);
  the remake takes star order.
- At a win, the number of human winners for the difficulty rating is not passed by the
  remake's interface; one is assumed.
- What the second date in a star record (+0xC) means is now settled: the year a battle
  was last seen there. Unexplored stars with such a date are class 3 for the computers
  (and show picture 2708 on the map).
