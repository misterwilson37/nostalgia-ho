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
"Original" rules (`Object.assign` over `rules-original.js`). Its computer players are
4.0.5's own (`js/ai-405.js`, from `FUN_0045e8bb` and its 18 steps): the same scheme as
5.0.5's at an earlier stage, with many small differences (see "Computer players" below).
Every rule the ruleset still takes from 5.0.5 has been checked against 4.0.5's code (see
"Inherited rules audit"). The main differences are:

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
| Computer personalities | 5.0.5's table with small differences: see "Computer players" | CONFIRMED (`FUN_004438ba`) |
| Skill Level | Novice $100,000 savings / $51,000 income / 20,000 metal / 750k people, plus a Colony Ship and 2 Scouts. Beginner $50,000 / 41,000 / 12,000 / 625k, plus 2 Scouts. Normal $25,000 / 30,000 / 5,000 / 500k. Advanced $10,000 / 20,000 / 2,500 / 350k. Expert $0 / 20,000 / 0 / 350k. Income gets + rand(1–100). There is no Outpost and no Abundant (and so no second colony) | CONFIRMED (`FUN_004427a4`, dialog 318) |
| Computers' start | each computer's skill is the intelligence turned round: Dumb = Expert, Average = Advanced, Smart = Normal, Diabolical = Novice. For Average and Smart, each computer but the last has a 39% chance (rand(1–100) < 40) of being set one step lower, and then the next one is set one step higher. The computer joins with that skill, and its intelligence is worked back from it (Novice 4, Normal 3, Advanced 2, Expert 1), so the step changes its intelligence too | CONFIRMED (`FUN_004768cc`, `FUN_00484821` → `FUN_00480eb5`) |
| Several humans | `FUN_0043c9ea` then copies a human's skill onto each computer, but wealth was already set when the computer joined (`FUN_004427a4`), so only the skill shown changes | CONFIRMED |
| Computer names | 4.0.5's own: 20 men's names (strings 595–614) and 20 women's (615–634), cut to 11 letters; each computer is a man or a woman at even odds | CONFIRMED (`FUN_004768cc`) |
| Starting designs | Scout **R8** V2 W1 S1; Tanker **R6 V2** W2 S2; Satellite (R0), Colony Ship and Fighter R6 V2 W2 S2; Mini 0 | CONFIRMED (`FUN_004427a4`) |
| Technology, budget, home world | as 5.0.5 | CONFIRMED |
| Gone | "Best Buddies" for the computers, Home System for the computers, "Based on IQ", Hex galaxies | CONFIRMED |
| Options | Years per turn (10, 20, 30, 50) and three check boxes: Alliances, Luck in Battles, and "Automatically end turn for unconnected players" (option bit 8, `FUN_00473ced`). There is **no Novas check box**, so the remake always turns novas on | Options CONFIRMED (`FUN_00448856`, `FUN_004486bb`); novas always on INFERRED: `FUN_00436c26` tests option bit 2, but where the game sets it wasn't found |

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
| Star names | 4.0.5's own 191 names (strings 108–298), cut to 7 letters, each used once | CONFIRMED (`FUN_00442374`) |

### Money

| What | 4.0.5 | Status |
|---|---|---|
| Savings interest | 10 × √savings, with no "half of savings" cap and no prime-rate bonus | CONFIRMED (`FUN_0043361b`, `FUN_00437592`) |
| Debt interest | a flat 15% (no renegotiated credit) | CONFIRMED |
| Budget, colony support, global warming, borrowing limit, income, growth, maximum population, terraforming, mining | as 5.0.5 | CONFIRMED |
| Dip into savings | an amount, up to savings minus the borrowing limit, is moved at once into this turn's money, and the interest is worked out again on what is left. It happens once. The remake's Dip window gives a percentage, so the ruleset takes that percentage of the most you may take | CONFIRMED (`FUN_00469757`, dialog 358); the percentage is the remake's window |
| Population milestones | "Congratulations, *name*! Your population now exceeds …" at 1, 2.5, 5, 10 and 20 million units, each once. At most two a turn: the first of 1M/2.5M not yet said, and the first of 5M/10M/20M. The total leaves out a colony at star number 0 (4.0.5 counts list entries whose star number is above 0); because 4.0.5 lists computers first and the remake humans, a human's own home at star 0 is still counted (INFERRED). The figure is the unit count as 4.0.5 prints numbers: "1,000,000", "2,500,000", "5,000,000", "10,000K", "20,000K" | CONFIRMED (`FUN_0043b243`, msg 1065, number format `FUN_0042e5c2`) |

### Research

| What | 4.0.5 | Status |
|---|---|---|
| Range level cost | **L³ / 9** (5.0.5: L^2.5 / 3): 24 vs 29 at level 6, 455 vs 341 at 16, 3,000 vs 1,643 at 30 | CONFIRMED (`FUN_00434dad`, `FUN_0042e559(L,3)/9`) |
| Other costs, points, head starts, cap 50 | as 5.0.5 | CONFIRMED |
| Gone | the +10% research facility, and the clamp of progress at 6,000 | CONFIRMED |
| No research money | the reminder comes every turn the tech budget is 0 (5.0.5: every 5th turn) | CONFIRMED |
| New level message | up to level 20: "You now have *name* Range Technology (L)." with 4.0.5's name list, which gives level L the name 5.0.5 gives level L+1 (string base + L; bases 841, 861, 881, 1892, 911). Numbers in the list are printed as names ("You now have 3 Range Technology (2).") and level 20 gets the next list's first entry. From level 21: "Your Range Technology has reached level L." | CONFIRMED (`FUN_00434dad`, `FUN_0046ec5a`, table at 0x59d2ac) |

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
| Big-battle rumour | only after a duel where each side had more ships than rand(5–10). Every player whose news of the star is more than 10 years old hears "The amount of energy emanating from … suggests a big battle just took place.", explored or not; a computer notes the battle | CONFIRMED (`FUN_00425c9a`, `FUN_00438a0f` called for every player by `FUN_004320f8`, msg 1028) |

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
| Handed-over planets | re-founded as new 10-unit colonies, so their people are lost | CONFIRMED (`FUN_00438718` → `FUN_004397ba(player, star, 1)`, 10 units per colony ship) |
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

## Computer players

4.0.5's computer turn is `FUN_0045e8bb` (COMPUTER.CPP). It runs 18 steps where 5.0.5 runs
21, and `js/ai-405.js` follows it. Each step was compared with 5.0.5's (`FUN_10081cc0`'s
steps, the source of `js/ai-original.js`). The scheme is the same; these are the differences.

| What | 4.0.5 | 5.0.5 | Where (4.0.5) |
|---|---|---|---|
| Steps | 18. No "split mixed fleets" step, and no computer biologicals (two 5.0.5 steps send them roaming) | 21 | `FUN_0045e8bb` |
| Who plans | each computer with its own intelligence; a human on auto-play with intelligence 0 | — | `FUN_004320f8` |
| Minimum attack fleet | 4–6 ships | 3–6 | `FUN_004438ba` |
| Turtle and pouncer | among Smart and Diabolical computers, computer number 1, 6, 11, 16 (counting from 0) is a turtle (style 2) and number 3, 8, 13, 18 a pouncer (style 3). In a Sparse galaxy they research +80 Range, −40 Speed, −40 Weapons | by computer number mod 4 (3 the turtle, style 2; 2 the pouncer, style 3), density over 50 for the Range shift (`FUN_100704d0`); the remake's 5.0.5 port had them swapped, now fixed | `FUN_004438ba` (game +0x10 = density) |
| Research shifts | Range 16, **Speed 5** and each Mini level move research into Weapons and Shields | no Speed rule | `FUN_004648d2` (cases 0x3eb, 0x3ec, 0x3ef) |
| Design limit and lag score | 30 designs; Range counts ×10; Scout R+2, W−1, S−1; no Tanker −1 | 24; Range ×5; Scout R+3; Tanker R−1, V−1 | `FUN_004639ba`, `FUN_00463f2f` |
| Designs nobody has built | dropped as soon as they lag today's tech in any stat they use | only when far behind | `FUN_004639ba` |
| At the design limit | stops designing for the rest of the turn | keeps its old design | `FUN_004639ba` |
| Pruning | past 30 − 6: designs that aren't current and have no ships, then the first six that aren't current, ships and all (`FUN_00434534` dismantles them) | the same at 24 | `FUN_004639ba` |
| Development cost | Dumb and Average pay it for a design never built; above Dumb the computer's own designs have none (so Average pays only for its starting designs) | the remake's port: Dumb only | `FUN_00462105`, `FUN_004639ba` |
| "I need metal." / "I need money." | after 2500 with under 10,000 metal; after 2400 when poorest by $2,000: to each ally, 1 in 20 | the same (`FUN_10085f60`; now in the 5.0.5 port) | `FUN_00463030` (codes 0x414/0x413 = strings 975/974) |
| Surrender | no Alliances condition | the 5.0.5 port requires Alliances | `FUN_00463030`, `FUN_004656b4` |
| Threat near a colony | unexplored, free or en-route stars count as one Fighter | the same; the port counted only unexplored ones | `FUN_00465a0d` |
| Enemy defence it remembers | ships' attack + ceil(pop/50) × (W+2)² / 75 + 1; an enemy star never measured: the figure for 350,000 people at its own weapons | (S+1)(W+1)² ceil(pop/2500)/570, at least 1 | `FUN_00425c9a`, `FUN_00425c5d`, `FUN_00465a0d` |
| Retiring fleets | a fleet past its type's limit, and **every tanker**, is scrapped at a safe colony or sent home; obsolete satellites at safe colonies are scrapped | the same | `FUN_004641ef`, `FUN_004640c4` |
| Big war fleets | 5+ ships away from home ask for a colony ship, priority 58 | 58, 78 or 98 by size | `FUN_004644c5` |
| Diplomacy | a broken alliance changes nothing; after 2500 the richest likes itself 30–60 more and the poorest 25–50 less; no dislike of the richest or of enemies' friends. It answers "I like *you*" messages and offers a hopeless planet it evacuates to an ally ("You take …") | broken alliance → under 500; ±20–40; dislikes the richest and enemies' friends | `FUN_004648d2`, `FUN_0045eda0` |
| After a battle | it dislikes each enemy by 10–30 (one ship) or 100–200; a computer whose colony survived an attack it lost puts 10 more (at least 60) into defence, then 5 more (at least 30) while under 70 | — (not in the port) | `FUN_00425c9a` |
| Scouting | only after a colony ship or 5,000 metal; unexplored stars only when no fleet of its own sits at a star rated over 12. Scouts that arrive stay where they are, marking a colony target | — | `FUN_0045f740`, `FUN_00462878` |
| Attack score | aggressiveness − defence, +20 populated, planet value, closeness, metal, ±¼ at random; no +40 for big planets and no +25 for the richest rival; at most one attack from each colony | ±½, +40, +25 | `FUN_0045fb2f`, `FUN_0045fd65` |
| Attacks | need = defence × attack ratio / 100 + 1; one Dreadnought or a Fighter wing; **no tanker escort**, no biologicals | tanker escorts; biologicals late in the game | `FUN_004616ee` |
| Planet value | counts the metal in its own Fighters parked there | Fighters and Dreadnoughts | `FUN_0046097d` |
| Colonizing | also sends a colony ship to a star rated 10 above its worst colony when none is out | the same | `FUN_00460125` |
| Defence | need = threat × defence ratio / 100; planet: ceil(pop/50)(W+1)²/75; satellites where nothing threatens are scrapped | (threat/100) × ratio | `FUN_00460cbb`, `FUN_00462f76` |
| Buying | a failed purchase stops all buying that turn except satellite orders of up to 5 | the same | `FUN_00462105` |
| Idle fleets | Fighters, Dreadnoughts and colony ships idle at a star that isn't its own go home; at a hopeless colony, scouts go home, and the others too once its metal is gone | — | `FUN_00462878` |
| Research split | set every turn for computers only; a human on auto-play keeps theirs | everyone | `FUN_00462be4` |
| Assessment, star classes, mining, terraforming, colony-ship limits, request queue (50, by priority), Diabolical sight of stars within 8 ly before 2020 | as 5.0.5 | | `FUN_00463030`, `FUN_00465a0d`, `FUN_0045eda0`, `FUN_0045f599`, `FUN_00465796` |

Interpretation the remake had to make (INFERRED):

- The remake keeps one "known defence" number per star, from the last time a player saw it,
  instead of 4.0.5's four fields and their slow decay.
- A gift is measured against income (money) or metal (metal), as in the 5.0.5 port.
- "Sorry!" (4.0.5 case 0x40b) is said to a beaten side that had no ships in the battle.
- With no colonies left, a loaded colony ship goes to the best free planet it can reach.
- When short of metal for a colony ship, 4.0.5 also scraps idle fleets (`FUN_00462600`);
  this is not done.

## Inherited rules audit

Every rule the 4.0.5 ruleset takes unchanged from `rules-original.js` or the engine, checked
against SPACEHO.EXE: 33 rows, of which 11 differed and now use 4.0.5's rule and 22 match. Four
interface-only hooks were not checked, and two are unused.

| Rule (key) | Result | Where |
|---|---|---|
| Computer players (`ai`) | DIFFERED: now `js/ai-405.js` | `FUN_0045e8bb` (above) |
| Computers' start (`computerSetup`) | DIFFERED: fixed (step up/down; no wealth copy) | `FUN_004768cc`, `FUN_00480eb5`, `FUN_004427a4` |
| Development cost (`paysPrototype`) | DIFFERED: Dumb and Average pay | `FUN_00462105` |
| Remembered enemy defence (`observe`, `planetStrength`) | DIFFERED: 4.0.5's estimate | `FUN_00425c9a`, `FUN_00425c5d` |
| Dip into savings (`projected`, `economy`) | DIFFERED: a one-off amount | `FUN_00469757` |
| Tech level message (`techMsg`) | DIFFERED: 4.0.5's names and wording | `FUN_0046ec5a` |
| Handed-over planets (engine `processHandovers`) | DIFFERED: 10-unit colony | `FUN_00438718`, `FUN_004397ba` |
| Star names (engine) | DIFFERED: 4.0.5's 191 | `FUN_00442374` |
| Computer names and sex (engine) | DIFFERED: 4.0.5's 40 names, even odds | `FUN_004768cc` |
| Population milestones | DIFFERED (two a turn, star 0 left out, figure): fixed | `FUN_0043b243` |
| Big-battle rumour | DIFFERED (big duels only, every player): fixed | `FUN_00425c9a`, `FUN_00438a0f` |
| Years per turn (`yearsPerTurn` 10, option) | MATCHES | `FUN_00448856`, `FUN_004320f8` |
| Colony ships not used up; 10 colonists each (`colonyShipUsedUp`, `canColonize`) | MATCHES | `FUN_004397ba`, `FUN_00437ddd` |
| New colony's values (`settle`) | MATCHES | `FUN_004397ba` |
| Battles at every contested star (`battleEverywhere`) | MATCHES | `FUN_00421430` |
| Hostility, maximum population, income (`hab`, `maxPopU`, `incomeU`, `planetIncome`) | MATCHES | `FUN_00437592` |
| Population units (`popU`) | MATCHES | `FUN_004427a4` |
| Mining and terraforming (`mineMetal`, `mineMoney`, `terraCost`, `terraStep`) | MATCHES | `FUN_00433c52` |
| Money pool, colony support (`disposable`, economy) | MATCHES | `FUN_0043361b`, `FUN_00433977` |
| Borrowing limit (`borrowLimit`) | MATCHES: −5 × income | `FUN_00437592`, `FUN_004427a4` |
| Star stats (`newStar`) | MATCHES | `FUN_00442374` |
| Shots per ship (`shotsPerShip`) | MATCHES: satellite 2, Dreadnought 25, others 1 | `FUN_00423b52` |
| Fleet attack (`fleetStrength`) | MATCHES (sum of `FUN_0041a9b4`'s attack) | `FUN_0041a9b4` |
| Building biologicals and decoys (`canBuild`) | MATCHES (after the discovery) | `FUN_0043a08c` |
| Scrap return: humans ¾ (⅞ with recycling), computers all (`scrapReturn`) | MATCHES | `FUN_00434534` |
| Scrapped in hyperspace: metal falls on the destination (`scrapInSpace`) | MATCHES | `FUN_00434534`, `FUN_00437592` |
| Fleets reaching an exploded star are lost (`fleetArrives`) | MATCHES | `FUN_004357fc` |
| Surrender (engine `processSurrenders`) | MATCHES | `FUN_0043427a` |
| Alliances and best buddies (engine `pactNews`) | MATCHES | `FUN_0043625c` |
| Buddies share what they explore (engine `shareMaps`) | MATCHES | `FUN_0043853c` |
| Who is out (engine `checkElimination`) | MATCHES | `FUN_0043bd5f` |
| Ten messages a turn (`chatLimit`) | MATCHES (computers too) | string 755, `FUN_00465607` |
| Gifts (three a turn) | MATCHES according to the first 4.0.5 survey; not re-read for this audit | — |
| Not used by this ruleset (`START`, `galaxySizes`) | — | |
| Not checked (interface only): `planetClass` (planet list colours), `exploreQuality` (which sound plays), `designMin` (design window), the welcome messages | — | |

## What 3.0.1 shares

The Mac 3.0.1 rules use 4.0.5's `makeGalaxy`, `distance`, `battle`, `randomEvents` and
`scrapAt`. Checked against 3.0.1's own code (docs/301-findings.md): the big-battle flag and
the rumour are the same (`MakeResultMessages @e2ea2`, `DetectBigBattles @a4a20`), so both
rulesets set `bigDuels`; the computers' start is not (no random step in
`CreateNewPlayer @121fee`), so 3.0.1 has its own `computerSetup`.

## Not implemented

- Cancelling one of the four pending radical programs (dialog 348): a player's choice that
  needs a window; the remake has none.
- The Hall of Fame and Hall of Shame, the 10 cowboy ranks, and naming a star after a win.
- The "is cheating" check (an anti-tamper checksum, not a rule).
- Network play, turn time limits, "take over for a computer player", and automatically
  ending turns for players who aren't connected.
- Automatically scrapping unused old designs past 15 (a preference, not a rule).
- Up to 20 players: the remake's rules allow it, but there are 16 computer faces, so
  computers beyond 16 reuse faces.

## Still unclear

- Whether novas can be switched off. The three New Game check boxes are Alliances, Luck and
  auto-end; `FUN_00436c26` tests option bit 2, but where it is set wasn't found, so novas are
  always on.
- Beginner's intelligence in `FUN_00480eb5` (code 1 is unhandled) doesn't matter: computers
  never get the Beginner skill, and a human's intelligence is never used (auto-play runs
  with 0).
