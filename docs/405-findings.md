# Spaceward Ho! 4.0.5 for Windows 95: findings

Spaceward Ho! 4.0.5 for Windows 95 (`SPACEHO.EXE`, 1996) plays across platforms with the
Mac 4.0.5. This file explains how the "Windows 95 4.0.5" ruleset (`js/rules-405.js`) was
made and how it differs from the Mac 5.0.5 rules in `js/rules-original.js`.

As in `original-findings.md` and `dos-findings.md`, every rule is labelled:

- **CONFIRMED**: read from `SPACEHO.EXE`, cited by the Ghidra name of the function
  (`FUN_address`). The float constants that the decompile drops were read from the
  disassembly.
- **INFERRED**: the decompile doesn't settle it, so the remake follows 5.0.5 or makes a
  choice.
- **NOT IMPLEMENTED**: in the 4.0.5 game but not in the remake.

## The short version

4.0.5 is an **earlier build of the 5.0.5 engine**, so the ruleset is built on the
"Original" rules (`Object.assign` over `rules-original.js`) and its computer players are the
Original ones (`js/ai-original.js`, unchanged). The personality table is the same in both
games (`FUN_004438ba`). The main differences are:

- **Setup**: you pick a Skill Level (Novice to Expert) instead of a Home System. One
  Computer Intelligence setting covers every computer. You can have up to 19 computers.
  There are 5 named sizes, Dense or Sparse, and 6 shapes (no Hex).
- **Galaxy**: star positions are whole light-years, and Armageddon does not shrink
  distances.
- **Ships cost** a product of all four stats, so high-tech ships cost about twice as much.
  You can have 30 designs.
- **Battles** are duels between two players at a time, with a steeper hit table. Leftover
  damage is lost, and there are no stances and no "arrive late".
- **Tankers** refuel every fleet at their star completely.
- **Radical tech** has 17 discoveries, dealt from 2010. The research facility, prime rate
  and cheaper credit are gone, so interest is a flat 10 × √savings, and debt costs 15%.
- Novas give less warning and have no miracle rescue.

## Ruleset differences from 5.0.5

### Setup

| What | 4.0.5 | Status |
|---|---|---|
| Computers | 0–19 (20 players in all). The remake still needs at least one computer when one person plays | CONFIRMED (`FUN_00448856`, scroll range 0..0x13) |
| Computer Intelligence | Dumb, Average, Smart or Diabolical, one setting for every computer. There is no IQ slider and no per-computer spread. "Super Genius" exists only as a string | CONFIRMED (`FUN_00448856`, game +0x14) |
| Computer personalities | the same table as 5.0.5. Diabolical computers start at −50..0 towards humans | CONFIRMED (`FUN_004438ba`) |
| Skill Level | Novice $100,000 savings / $51,000 income / 20,000 metal / 750k people, plus a Colony Ship and 2 Scouts. Beginner $50,000 / 41,000 / 12,000 / 625k, plus 2 Scouts. Normal $25,000 / 30,000 / 5,000 / 500k. Advanced $10,000 / 20,000 / 2,500 / 350k. Expert $0 / 20,000 / 0 / 350k. Income gets + rand(1–100). There is no Outpost and no Abundant (and so no second colony) | CONFIRMED (`FUN_004427a4`, dialog 318) |
| Computers' start | with several humans, each computer copies the skill of the human it is assigned to (the remake's humans all share one skill) | CONFIRMED (`FUN_0043c9ea`) |
| Computers' start, one human | the intelligence turned round: Diabolical = Novice wealth, Smart = Normal, Average = Advanced, Dumb = Expert (the inverse of `FUN_00480eb5`'s skill-to-IQ table) | INFERRED |
| Starting designs | Scout **R8** V2 W1 S1; Tanker **R6 V2** W2 S2; Satellite (R0), Colony Ship and Fighter R6 V2 W2 S2; Mini 0 | CONFIRMED (`FUN_004427a4`) |
| Technology, budget, home world | as 5.0.5 | CONFIRMED |
| Gone | "Best Buddies" for the computers, Home System for the computers, "Based on IQ", Hex galaxies | CONFIRMED |
| Options | Years per turn (10, 20, 30, 50), Alliances, Luck in battles. There is **no Novas check box**, so the remake always turns novas on | Options CONFIRMED; novas always on INFERRED (option bit 2 exists in `FUN_00436c26`) |

### Galaxy

| What | 4.0.5 | Status |
|---|---|---|
| Positions | whole light-years, ±1 ly jitter, at least 4 ly apart | CONFIRMED (`FUN_00442266`, `FUN_004422e9`) |
| Distance | trunc((10 × longer + 3 × shorter + 9) / 10) | CONFIRMED (`FUN_0042e480`) |
| Armageddon | does not shrink distances: the table is built once | CONFIRMED (`FUN_0042f4b3`) |
| Star count | Grid 25 / 36 / 64 / 100 / 169. Other shapes 20 + rand(1–12), 32 + rand(1–16), 48 + rand(1–20), 68 + rand(1–32), rand(101–190) | CONFIRMED (`FUN_0043ffe0`) |
| Circle and Ring | rings 4 ly apart (cap 35) when Dense, 6 ly apart (cap 49) when Sparse | CONFIRMED (`FUN_00440958`, `FUN_00440c31`) |
| Random | a square of side √(25 × stars), doubled when Sparse. The first stars are the homes | CONFIRMED (`FUN_00440796`) |
| Grid | spacing 4 or 6 ly | CONFIRMED (`FUN_00441988`) |
| Spiral | 5.0.5's spiral in whole light-years: the core is max(8, √stars × step / 2), one arm per player, 6° twist, and the arm tips get a wider search. Homes are shuffled | CONFIRMED (`FUN_00440f8a`) |
| Cluster | 5.0.5's clusters: size 4(1 + √(stars/players)), doubled when Sparse, one per player around a circle. Homes are shuffled | CONFIRMED (`FUN_0044162a`) |
| Home stars | other shapes: random stars for all 20 slots, at least 20 ly apart, relaxing by 4 ly, 25 tries each | CONFIRMED (`FUN_00441af4`) |
| Margin | the map is shifted so it starts 4 ly from the edge (5.0.5: 6) | CONFIRMED (`FUN_00441ddc`) |
| Star stats | as 5.0.5 | CONFIRMED (`FUN_00442374`) |
| Star names | the remake's (5.0.5) list; 4.0.5 has its own pool of 191 names | INFERRED |

### Money

| What | 4.0.5 | Status |
|---|---|---|
| Savings interest | 10 × √savings, with no "half of savings" cap and no prime-rate bonus | CONFIRMED (`FUN_0043361b`, `FUN_00437592`) |
| Debt interest | a flat 15% (no renegotiated credit) | CONFIRMED |
| Budget, colony support, global warming, borrowing limit, income, growth, maximum population, terraforming, mining | as 5.0.5 | CONFIRMED |
| Dip into savings | 4.0.5 asks for an amount, not a percentage, and how it is applied isn't known. The remake keeps 5.0.5's percentage | INFERRED |
| Population milestones | "Congratulations, *name*! Your population now exceeds …" at 1, 2.5, 5, 10 and 20 million units, each once. The remake shows the figure in people (1,000 a unit) | CONFIRMED (`FUN_0043b243`, msg 1065); the figure INFERRED |

### Research

| What | 4.0.5 | Status |
|---|---|---|
| Range level cost | **L³ / 9** (5.0.5: L^2.5 / 3): 24 vs 29 at level 6, 455 vs 341 at 16, 3,000 vs 1,643 at 30 | CONFIRMED (`FUN_00434dad`, `FUN_0042e559(L,3)/9`) |
| Other costs, points, head starts, cap 50 | as 5.0.5 | CONFIRMED |
| Gone | the +10% research facility, and the clamp of progress at 6,000 | CONFIRMED |
| No research money | the reminder comes every turn the tech budget is 0 (5.0.5: every 5th turn) | CONFIRMED |

### Radical discoveries

| What | 4.0.5 | Status |
|---|---|---|
| The hand | up to 4 pending discoveries, first dealt in 2010 with "Your radical researchers are hard at work on another discovery!" | CONFIRMED (`FUN_0043adac`, msg 1052) |
| A Radical level before 2010 | deals the hand first | INFERRED |
| The 17 discoveries and their weights (%) | metal 7, astronomers 7, wealth 7, mining 4, max population 4, terraforming 4, smarter generals 4, recycling 4, decoy 6, biological 6, steal tech 6, six free designs 6, Range/Speed/Weapons/Shields/Mini +2: 7 each | CONFIRMED (`FUN_0043a08c`, weights at 0x59cf10) |
| Gone | research facility, prime lending rate, cheaper credit | CONFIRMED |
| Astronomers | needs 6 never-explored stars. It explores 6–9 stars that were never explored, or whose news is more than 100 years old | CONFIRMED |
| Mining | only from the year 3000 on (see below) | CONFIRMED |
| Decoy | humans only, needs Alliances. It looks like a Fighter: R+1, **V+1**, W+2, S+2, Mini −1 | CONFIRMED |
| Biological | **humans only** (5.0.5: anyone) | CONFIRMED |
| Steal tech | copies the highest level among the living players | CONFIRMED |
| Free designs | needs fewer than 25 designs. Scout **R+2**, W−1, S−1. Fighter, Satellite (R0), Colony Ship, Tanker and Dreadnought at your current tech (no Tanker −1, no Colony Mini/3) | CONFIRMED |
| Cancelling one pending program | a human can cancel one of the 4 (dialog 348) | NOT IMPLEMENTED |

### Ships and fleets

| What | 4.0.5 | Status |
|---|---|---|
| Cost base | B = (V+15)(S+17)(W+13)(R+10) / 38.75 (5.0.5: (13+W)(S+R+V+38)/0.36). The starting Fighter is still $2,000 / 666 metal; R16 V8 W10 S10 is $9,583 against about $4,600 | CONFIRMED (`FUN_0041a9b4`) |
| Mini factor, satellites, colony ships, tankers, dreadnoughts, biologicals, prototypes | as 5.0.5 | CONFIRMED |
| Scouts | no extra metal divisor (5.0.5: mm + ½) | CONFIRMED |
| Decoys | B from their own stats; money and prototype ÷ 20, metal ÷ 40 (no +10), 1 hp | CONFIRMED |
| Attack rating | no Dreadnought +⅕ and no cap | CONFIRMED |
| Design limit | 30 (5.0.5: 24) | CONFIRMED (string 540) |
| Scout range limit in the design window | your Range + 2, like the starting and free Scouts (5.0.5: + 3) | INFERRED |
| Computers' designs | the free-design rules above | INFERRED |
| Prototypes for computers, dreadnoughts from the start | as 5.0.5 | INFERRED (not traced) |
| Tankers | any of your tankers at a star refuels **every** one of your fleets there completely. There is no 200-unit pool and no "not enough tankers" | CONFIRMED (`FUN_00437ddd`) |
| Valdez | a 1 in 100 chance, only for a Tanker design named "Valdez" that refuels another fleet (5.0.5: 1 in 250, any fleet named Valdez). Only a message | CONFIRMED (`FUN_00437ddd`) |
| Scrapped at someone else's colony | the metal goes to that colony's owner later in the turn: "You just received … metal from someone scrapping a fleet or from a battle over …" | CONFIRMED (`FUN_00434534`, `FUN_0043747e`, msg 1064) |
| Meteor showers | metal × 50 units killed; **no escape** onto orbiting colony ships | CONFIRMED (`FUN_00437592`) |
| Fuel, biologicals, colony ships, routes, scrapping rates | as 5.0.5 | CONFIRMED |
| Survival | you stay in the game while you hold a colony or a colony ship that isn't lost at an exploded star. The engine already works this way for every ruleset | CONFIRMED (`FUN_0043bd5f`) |

### Battles

| What | 4.0.5 | Status |
|---|---|---|
| Who fights | duels between two players. The colony's owner defends and the others are shuffled. Each in turn fights the current holder, and the winner holds the star. An ally of the holder goes to the back of the line; if everyone left is its ally, the holder changes places with the last in line. **Allies never fight side by side** (5.0.5: one battle with every side) | CONFIRMED (`FUN_00421430`, `FUN_0042227b`) |
| Order of fire | no round limit. Fastest first; at each speed the attacker's groups fire, then the defender's. Ships hit at a speed still fire at it | CONFIRMED (`FUN_00422339`) |
| Hit table | trunc(50 + 31.51 × atan(W − S)), clamped to ±25: 1% at −25, 5% at −6, 25% at −1, 50% at 0, 74% at +1, 89% at +3, 98% at +25 | CONFIRMED (`FUN_0047b5dc`) |
| Damage | as 5.0.5, but leftover damage is lost when a ship dies | CONFIRMED (`FUN_00424088`) |
| Targets | colony ships first, then satellites, then a random ship group; the planet only when no ships are left. No tanker preference | CONFIRMED (`FUN_00424b00`) |
| The planet | fires only when it is its side's last group | CONFIRMED (`FUN_00422339`) |
| Luck | rand(−1, 1) for each side in each duel; smarter generals remove the −1 | CONFIRMED |
| Decoys | W 0, S 0, 1 hp | CONFIRMED |
| Stances, "arrive late" | **gone**: no text and no code | CONFIRMED |
| Debris | as 5.0.5 | CONFIRMED |
| Battle replay | the remake shows all of a star's duels as one replay | INFERRED |
| Big-battle rumour | players whose news of the star is more than 10 years old hear "The amount of energy emanating from … suggests a big battle just took place." | CONFIRMED (`FUN_00438a0f`, msg 1028) |

### Events

| What | 4.0.5 | Status |
|---|---|---|
| New red star | after 2749, 1% a turn (5.0.5: about 1 in 99), one at a time | CONFIRMED (`FUN_00436c26`) |
| Warning | starts at 10 + 10 × rand(0–7) and explodes at 110, so 3–10 turns (5.0.5: 10–20). The remake stores it on 5.0.5's scale (+100), so the map and the computers read it unchanged | CONFIRMED |
| "It's a miracle" | **gone** (no string) | CONFIRMED |
| Red-star warning | goes to every player every turn | CONFIRMED (msg 1011) |
| Supernova | stars within 10 ly get rand(max(100, 10000/d − 1000), 10000/d) metal; colonies there lose rand(40–60) × metal units, and the owner gets the metal. Fleets arriving at an exploded star are lost | CONFIRMED (`FUN_00436ff8`, `FUN_004357fc`) |
| Armageddon | as 5.0.5, without the shrink | CONFIRMED (`FUN_00436988`) |

### Diplomacy and the end of the game

| What | 4.0.5 | Status |
|---|---|---|
| Alliances, best-buddy pacts, gifts (3 a turn), surrender, alliance victory | as 5.0.5 | CONFIRMED |
| Messages | at most **10 a turn** ("Sorry, you can only send ten messages per turn.") | CONFIRMED (string 755) |
| Handed-over planets | 4.0.5 re-founds them as new 10-unit colonies; the engine re-founds them with 1 unit, as for 5.0.5 | INFERRED (left as the engine does it) |
| Base difficulty rating | IQ and number of computers give 30–80; your skill adds (5 × skill − 10) × 2; −10 per ally; −5 for Medium–Extra Large and −10 for Humongous; −10 for Sparse; −10 for Spiral or Cluster; each Armageddon gives D = (2D − 38)/3 + 20. One human only. The ruleset's `difficulty()` gives the figure for the New Game window | CONFIRMED (`FUN_0043c351`) |
| Rating of a win, master points, 10 ranks | in the ruleset as `winDifficulty`, `masterPoints`, `addMasterPoints` and `RANKS` (Red-Neck … Ho! Champion), but **not used**. The remake's rank window is built round 5.0.5's 25 ranks, their pictures and unlocks, and one points total. 4.0.5 games earn no points | CONFIRMED formulas (`FUN_0043c836`, `FUN_00497e58`, `FUN_00482b89`); ranks NOT IMPLEMENTED |

## Two points checked against the Mac code

In two places, 4.0.5 disagreed with what the remake's 5.0.5 ruleset used to do. Both were
checked against the Mac 5.0.5 program, and `rules-original.js` has been fixed to match.
4.0.5 and 5.0.5 now agree:

- **The mining discovery** comes only **from** the year 3000 on (5.0.5 `FUN_1007a180`
  case 3: year ≥ 0xbb8; the remake used to allow it only *before* 3000).
- **Supernova metal**: a star at distance d (1–10) gets
  rand(max(100, 10000/d − 1000), 10000/d) metal (5.0.5 `FUN_100769b0` @10076ae8; the
  remake used to draw from 0).

## Not implemented

- Cancelling one of the four pending radical programs (dialog 348).
- The Hall of Fame and Hall of Shame, the 10 cowboy ranks, and naming a star after a win.
- The "is cheating" check (an anti-tamper checksum, not a rule).
- Network play, turn time limits, "take over for a computer player", and automatically
  ending turns for players who aren't connected.
- Automatically scrapping unused old designs past 15 (a preference).
- The computers' "I need metal" request after 2500.
- Up to 20 players: the remake's rules allow it, but there are 16 computer faces, so
  computers beyond 16 reuse faces.

## Still unclear

- Where a computer's start wealth comes from in a one-human game (see Setup).
- Whether novas can be switched off. There is no check box, but the code tests an option bit.
- How "Dip into savings" applies its amount.
- The detailed scoring in the 4.0.5 computer players was not compared step by step. It looks
  like the same AI at an earlier stage, so the remake uses the 5.0.5 one, which still prunes
  designs at 24 rather than 30.
- Whether every player hears the big-battle rumour, even about stars they never explored.
  The code doesn't check, so the remake tells every human. A star where fighting goes on
  every turn brings a rumour every other turn.
- Population milestones: `FUN_0043b243` sends at most two a turn and counts only some
  colonies (a field at +0x1904 > 0). The remake counts every colony and sends each
  milestone once.
- Beginner's computer IQ in `FUN_00480eb5` (code 1 is unhandled in the decompile).
