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
and game records have the same fields (shifted by a few bytes). The differences are
few:

- **At most 90 stars** (5.0.5: 220). Galaxies above about size 36 (Grid from size 50,
  Hex from size 45) come out smaller.
- **No Alliances or Luck in Battles check boxes**: both are always on.
- The random numbers come from a fixed table of 5,000 numbers stored in the program
  (resource `RAND 1000`), not one made at the start of the game.
- No "Any (1-8)" choice for the number of computers.

So the ruleset is the Original rules (`Object.assign` over `rules-original.js`) with
the star cap, and alliances and luck forced on. The computer players are the Original
ones (`js/ai-original.js`).

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
| Difficulty rating | the same formula, including the end-of-game factors | CONFIRMED in outline (`FUN_0002a96c`); not compared constant by constant |

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

## Still unclear

- The computer players' turn (`FUN_0006000c` and the routines after it, segment 6) was
  only sampled; the personalities match exactly, so the remake uses the 5.0.5 ones.
- The difficulty rating was compared in outline only.
- The design limit (24 in 5.0.5) was not looked up; the remake keeps 24.
- What the second date in a star record (+0xC) means (the 2708 picture).
