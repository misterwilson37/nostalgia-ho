# What the original Spaceward Ho! 5.0.5 actually does

These notes come from taking apart the original program file
(`Spaceward Ho!.app/Contents/MacOS/Spaceward Ho!`, a 2003 PowerPC Mac program)
with a decompiler and reading the game logic directly. They are written for a
non-programmer. The technical appendix at the end lists where in the program
each finding lives, so anyone can double-check it.

Each finding is marked:

- **CONFIRMED**: read directly from the program's code or data.
- **INFERRED**: my best reading, with the reason given.
- **NOT IMPLEMENTED**: in the original but not in the web app, and why.

Unless a line says NOT IMPLEMENTED, the web app does it when you pick
**Rules: Original** in the New Game window. The **Claude** rules are the
earlier version, built from the manual alone. They are still there, unchanged.
The last big section lists every way the two rule sets differ.

---

## Contents

1. Units the original uses
2. The galaxy and the New Game window
3. Starting conditions
4. Money
5. Planets
6. Research and Radical discoveries
7. Ships
8. Movement and fuel
9. Combat
10. Novas, supernovas, Armageddon and other events
11. Alliances, best buddies, gifts, messages and surrender
12. Computer players
13. Years per turn, master points and ranks
14. What you see and hear
15. What can't be done in a browser, and what isn't done yet
16. Claude rules versus Original rules
17. Technical appendix
18. The 5.0.5 pass: every change to play, with addresses

---

## The 5.0.5 pass (October 2026)

Every one of the program's 5,388 routines is now accounted for
(`docs/coverage-505.md`, none unread), and every rule was checked against the code. The
web app's Original rules had been built from a first reading; this pass replaced what
that reading had wrong. Each change below is now what the web app does (section 18 lists
them all with their addresses); the sections that follow have been brought up to date.
The questions the code leaves, and its apparent slips, are in `docs/open-questions.md`
(Mac 5.0.5).

---

## 1. Units the original uses

- **Population** is stored as a whole number. A "Normal" home planet starts at
  500,000. INFERRED: one unit is 1,000 people, so that is 500 million. The
  program never prints a raw population without converting it, so the unit is
  a guess. It only affects how numbers are shown.
- **Temperature** is stored in tenths of a degree Fahrenheit. CONFIRMED (the
  hidden debug "Terraforming" window labels it "Temperature * 10").
- **Gravity** is stored in hundredths of a G. CONFIRMED ("Gravity * 100").
- **Star positions** are stored in tenths of a light-year. CONFIRMED.
- **Distance** between two stars is a whole number of light-years. Take the
  larger of the east-west and north-south gaps, add a third of the smaller
  gap, and round up. CONFIRMED. After each Armageddon every distance shrinks
  to three quarters, but never below 3. CONFIRMED.
- **Each turn is 10 years**, starting in the year 2000. CONFIRMED. (See "Years
  per turn" in section 13.)
- **Randomness**: the original makes a list of 5,000 random numbers and cycles
  through it. CONFIRMED. The web app uses its own random numbers, so a game
  can't be replayed move for move against the original. Nothing else depends
  on this.

## 2. The galaxy and the New Game window

### The settings

The original New Game window has (CONFIRMED, from its layout resource):

- **Bad Guys**: 1 to 8 computers, or "Any (1-8)".
- **IQ**: a slider from 50 to 200.
- **Home System** for you, and one for the computers. The computers' list adds
  "Based on IQ".
- **Shape**: Circle, Spiral, Cluster, Ring, Grid, Random, Hex.
- **Size** and **Density**: sliders from 0 to 100. Size starts at 50 and
  Density at 25. Left is Small and Dense, right is Large and Sparse.
- **Years Per Turn**: 10, 20, 30 or 50.
- Check boxes: **Alliances**, **Luck in Battles**, **Best Buddies** (the
  computers start as best buddies with each other).
- A live **Game Difficulty Rating** (section 13).

All of these are in the web app's New Game window for Original rules. The web
app also keeps its own **Novas** check box (the original has no switch for
this; leave it ticked to match).

Network-only settings (turn time limit, password, "Fair Start", "All Humans
Are Best Buddies") are left out; see section 15.

### How many stars (CONFIRMED)

- **Grid**: a square, 5 to 14 stars per side: (Size ÷ 10, at most 9) + 5.
- **Hex**: a hexagon of rings. With k = Size ÷ 15 (at most 6), there are
  3 × (k + 2) × (k + 3) + 1 stars, from 19 to 217.
- **Every other shape**: 2 × Size + 19, give or take up to (Size ÷ 10 + 6),
  kept between 19 and 220.

### Where the stars go (CONFIRMED)

No two stars are ever closer than 4 light-years. Density mostly sets how far
apart the stars are spread.

- **Circle**: rings of stars around the centre, 4, 5 or 6 ly apart depending on
  Density. Each ring holds about as many stars as fit around it.
- **Ring**: the same, but the first ring starts 7 to 12 ly out, leaving the
  middle empty.
- **Spiral**: a round core, then one arm per player curling outward, turning
  6° further each step. The arms are filled from their tips inward, and each
  player's home is at the tip of an arm.
- **Cluster**: one clump of stars per player, spaced evenly around a circle.
  Each player's home is in a different clump.
- **Grid** and **Hex**: evenly spaced, 4 to 7 ly apart depending on Density.
- **Random**: scattered over a square, bunched slightly toward the middle.

Afterwards the whole map is shifted so it starts 6 ly from its edges.

**Home stars** (CONFIRMED): on Circle, Ring, Grid and Hex maps each player gets
a random star at least 20 ly from every other home. If that can't be done, the
game tries 16 ly, then 12, and so on. On Spiral and Cluster maps each player
gets one arm tip or one clump. On Random maps the first stars placed are the
homes.

### Each star (CONFIRMED)

- Temperature anywhere from −200°F to 400°F.
- Gravity: one of four bands picked evenly (0.25–0.5, 0.5–1, 1–2 or 2–4 G),
  then a random value inside the band.
- Metal: 60% of stars have 0–8,000, and 40% have 8,000–30,000.

### Computer skill from IQ (CONFIRMED)

The IQ slider doesn't give every computer the same skill. Each computer gets
a score of (IQ − 50) × ⅔ − 12, plus a step that grows for each later
computer. The step is 25 split across the computers, so the last one is about
25 points sharper than the first. The score sets the computer's skill:

| Score | Skill | "Based on IQ" home system |
|---|---|---|
| under 25 | Dumb | Barren |
| 25–49 | Average | Normal |
| 50–74 | Smart | Advanced |
| 75 or more | Diabolical | Thriving |

If you pick a computer home system instead of "Based on IQ", every computer
gets that one.

**Best Buddies** (CONFIRMED): the computers start allied and best buddies with
each other, and like each other 1,000 points more than usual (section 12).

## 3. Starting conditions

CONFIRMED, by home system:

| Setting  | Savings  | Income | Metal  | Home population |
|----------|---------:|-------:|-------:|----------------:|
| Outpost  |    1,000 |  1,000 |      0 |         200,000 |
| Barren   |    5,000 | 20,000 |    500 |         350,000 |
| Backward |   10,000 | 20,000 |  2,500 |         350,000 |
| Normal   |   25,000 | 30,000 |  5,000 |         500,000 |
| Advanced |   50,000 | 41,000 | 12,000 |         625,000 |
| Thriving |  100,000 | 51,000 | 20,000 |         750,000 |
| Abundant |  250,000 | 51,000 | 30,000 |         750,000 |

(Starting income also gets a random 1 to 100 added.)

- Everyone starts with the same technology: **Range 6, Speed 2, Weapons 2,
  Shields 2, Miniaturization 0, Radical 0**, each with a random head start of
  up to 0.4 of a level (0.8 for Radical). CONFIRMED. The tech-name list in the
  game's resources agrees: Range names start at level 7, "Topping off the
  Tanks".
- Starting budget: **65% savings, 25% technology, 10% home planet**, with
  technology split evenly six ways (167, 167, 167, 167, 166, 166 per mille).
  CONFIRMED for every player but the one who creates the game (`FUN_1006f640`).
- **The player who creates the game** gets the shares kept in the preferences when
  the New Game window's OK is pressed in the year 2000 (`FUN_1006579c`): research
  (player +0x80..+0x8a) from prefs +0x1b4..+0x1be, and the colony list's slots from
  prefs +0x1c2, +0x1c4 with the third 1,000 less those, or, for an Abundant player
  (player +0x29 = 7), from +0x1c8, +0x1ca, +0x1cc with the fourth 1,000 less those.
  The preferences' defaults (CPrefs, `FUN_10072490`) are **Range, Speed, Weapons,
  Shields and Mini 180 per mille each and Radical 100**; **Savings 650, Technology
  250, home 100**; Abundant **Savings 550, Technology 200, the second colony 150, the
  home 100**. 5.0.5 then keeps your first turn's shares as the next game's
  (`FUN_10064600`); the remake starts every game from the defaults. CONFIRMED (the
  Palm OS game does the same, `FUN_000395a6`, `FUN_0002b274`). Before this was found
  the remake gave the creator 167 each.
- Home planet: 0 to 200°F, 0.5 to 2.0 G, 10,000 metal, and already perfect for
  its owner. Your ideal temperature and gravity are defined as your home
  world's. CONFIRMED.
- Advanced, Thriving and Abundant get two free Scouts. Thriving and Abundant
  get a free Colony Ship. Abundant also gets a second small colony next door
  (10,000 people in 5.0.5's code, 2,500 metal, 50–100°F off, 20–50% off in gravity).
  CONFIRMED.
- **The Abundant start's colony list** (`FUN_1006f640`; the list at player +0x1138,
  its records 0x1c bytes at +0x1144): Savings 650, Technology 250 and the home (100)
  are appended; for the second colony the home's record is appended again with a share
  of 50 (the fourth slot), and the third slot is then rewritten as the second colony
  (share 50 at +0x38, bars 500 / 500 at +0x3a / +0x3c, income −7,500 at +0x40, 10,000
  people at +0x44, $5,000 sunk at +0x4e, the star at +0x50). So the second colony is
  third and the home fourth, and the shares add up to **650 + 250 + 50 + 50 = 1,000**.
  CONFIRMED (Palm `FUN_00026304` the same). The remake had the home third with 100,
  1,050 in all, until the Palm comparison showed it.
- Starting ship designs: Scout (Range 9, Speed 2, Weapons 1, Shields 1),
  Tanker (Range 5, Speed 1, Weapons 2, Shields 2), and Satellite, Colony Ship
  and Fighter (Range 6, Speed 2, Weapons 2, Shields 2), all with Mini 0.
  CONFIRMED.

## 4. Money

CONFIRMED (the turn, `FUN_10072a10`; section 18 has the addresses):

- **This turn's money** is last turn's colony income (the profitable colonies' income,
  added up in pass 2) plus any dip. Interest is added to it (or taken from it), then the
  colonies losing money are paid from it, and what is left is shared out by the budget
  bars.
- **The budget bars** are kept per mille (thousandths): Savings, Technology, then each
  colony. Each slot gets its share **as it stands**, not scaled to the total: trunc(money
  × share / 1000) under $2,000,000, trunc(money / 1000) × share above. The shares
  usually add up to 1,000, but not always (a computer's shares are each rounded up,
  `FUN_10085bd0`), and then more than the money is spent.
- **Ship Savings** get the Savings bar's share, the interest and the refunds (from
  terraforming and mining overshoots) at the end of the turn. Ships are bought from Ship
  Savings.
- **Savings interest**: trunc(10 × √savings) a turn, but never more than half your
  savings; +50% after the "prime lending rate" discovery.
- **Debt interest**: 15% of the debt a turn, 10% after "renegotiated credit".
- **Borrowing limit**: −5 times the gross income (the income of the profitable colonies
  plus the dip). At the start, trunc(−income / 2) × 10.
- **Buying a ship** works the interest out again on what is left in Ship Savings, so it
  lowers this turn's interest; dismantling a fleet bought this turn gives everything back
  and works the interest out again.
- **Dip Into Savings**: a percentage, 0 to 30% (the window's slider), of Ship Savings
  taken out every turn until it is set back to 0, and used as the next turn's money. It
  counts as income for the borrowing limit. While it is on, the Savings bar is at 0 and
  can't be dragged.
- **Can't pay the interest**: this turn's money pays what it can ("Uh-oh! Having to
  borrow more to pay all your interest!"), and Ship Savings the rest, past the borrowing
  limit if need be. The code has a further step, global warming and a fleet scrapped,
  but a sign slip means it never runs (`docs/open-questions.md`).
- **Can't support a colony**: each colony losing money, in the colony list's order, is
  paid from this turn's money, then from Ship Savings down to the borrowing limit
  ("Warning! Savings is being used to support %s."), then with its people: it keeps
  trunc(people × the part of the loss paid / the loss) − 100 and doesn't grow ("not
  receiving sufficient funds"); with nobody left it is given up.
- **The colony list** has a new colony in front, and is sorted by income, lowest first,
  at the end of every turn; so the colonies losing most are paid first.
- **No money to spend**: when the net is below 0 after all this, "Warning! After
  supporting your planets and paying your interest, you have no money to spend!", and
  the net is set to 0.

## 5. Planets

- **Maximum population** (CONFIRMED): 500,000 − 12 × H, but at least 10.
  +10% after the "sociologists" discovery.
- **Growth** (CONFIRMED). Below the maximum:
  - While a colony is losing more than $7,500 a turn, it grows by the smaller
    of (max ÷ 1,000) and (double its population), plus 0–5.
  - Otherwise it grows by about max ÷ 20, plus up to max ÷ 100 more, or
    doubles if it is still small. That switch is what the **"baby boom"**
    message announces. It is not a random event. CONFIRMED.
  - "Growth rate has slowed" appears when it reaches its maximum.
  - Above the maximum it keeps creeping up by max ÷ 1,000, plus a little.
- **New colonies** start with the colonists aboard (10 units per colony ship),
  an income of −$7,501, and a default budget of about $7,500 a turn, split 90%
  terraforming and 10% mining (100% mining if gravity is over 2.56×).
  CONFIRMED.
- **"Never profitable"** means gravity more than 2.56 times (or less than
  1/2.56 of) your home's. CONFIRMED.
- **Star rating** (CONFIRMED): when you explore a star the game rates it from 0
  to 20 for you. Gravity and temperature closeness each give a score, and the
  two are combined. More than 10,000 metal adds 1. A rating of 0 means it can
  never pay. The rating only picks the exploration sound (section 14).
- **Terraforming** (CONFIRMED, `FUN_10073d70`):
  - The first $5,000 spent on a new colony's terraforming is absorbed as a
    one-off setup cost.
  - After that, each turn moves the temperature by trunc(√trunc(⅔ × money)) tenths
    of a degree, or trunc(√trunc(⅞ × money)) after the climatologist discovery.
  - On reaching your temperature the Terraform bar is done (−1), the overshoot is
    refunded to Ship Savings at trunc(3d²/2) (trunc(8d²/7)), and "You have
    completely terraformed %s."
  - Spending more than $50 a turn on a planet that can never pay gives the
    "never become profitable" warning, every turn.
- **Mining** (CONFIRMED, `FUN_10055d90`, `FUN_10055e30`): trunc(20 × √money) metal per
  turn (25 × after the archaeologist discovery). Money that would mine more than is
  left mines what is left, the Mine bar is done, and the overshoot is refunded:
  trunc(m²/400) for m metal (625 with the discovery), trunc(m/400) × m from 25,001.
- **Evacuating** (CONFIRMED, `FUN_10060fac`): Evacuate Planet marks a colony and
  Don't Evacuate Planet takes the mark off. Marking a profitable colony asks first
  ("Do you really want to evacuate %s? It's a profitable colony!"); a star named
  Kansas, one time in three, gets "Dorothy, I guess that means we're not in Kansas
  anymore", and one named Hope the "Dost thou truly wish to abandon Hope?" question.
  The mark takes the colony's income off this turn's net (and puts it back when taken
  off), and gives its budget share to the other slots. The colony shows "Evacuating"
  and is given up at the start of the next End Turn ("You have evacuated %s."), its
  colony ships loaded first.

## 6. Research and Radical discoveries

### Research (CONFIRMED)

- Each technology's share of the tech budget buys
  0.8 × √(money ÷ 150) points per turn (Mini: ÷ 200; Radical:
  0.5 × √(money ÷ 200)). Because of the square root, spending steadily beats
  spending in bursts, as the manual says.
- Points needed for the next level, from current level L: Range ⌊L^2.5⌋ ÷ 3;
  Speed (L + 6)²; Weapons and Shields (L + 2)²; Mini and Radical (L + 7)².
- Finishing a level throws in a free 0–40% of the next one (0–80% for Radical).
- Levels stop at 50.
- +10% research after the "new research facility" discovery.
- Each Radical level gained triggers one Radical discovery.

### Radical discoveries (CONFIRMED)

Each player holds a hand of up to 4 possible discoveries. Each new Radical
level plays one of them at random, and the hand is topped up again. Cards are
drawn with these chances:

| Discovery | Chance | Notes |
|---|---:|---|
| Extra metal from your planets | 7% | 9,000–11,000 metal |
| Astronomers explore distant stars | 5% | 6–9 unexplored stars; only while more than 5 are unexplored |
| Wealth of precious metals | 7% | 2 to 12 times your income added to savings |
| Better mining (archaeologists) | 4% | once only, from the year 3000 on |
| Higher maximum population | 4% | once only |
| Better terraforming | 4% | once only |
| Smarter generals | 4% | once only, only with Luck in Battles on |
| Better recycling | 4% | once only |
| New research facility | 4% | once only |
| Higher interest on savings | 4% | once only |
| Cheaper borrowing | 4% | once only |
| Decoy ships | 4% | humans only, only with Alliances on |
| Biological ships | 8% | |
| Stolen technology | 6% | copies one tech level from a richer player |
| Free ship designs | 6% | 6 new designs with no development cost |
| Range +2 | 5% | |
| Speed +2 | 5% | |
| Weapons +2 | 5% | |
| Shields +2 | 5% | |
| Miniaturization +2 | 5% | |

A jump of 2 levels doesn't move research progress, so the next level takes as
long as it would have anyway.

## 7. Ships

### Costs (CONFIRMED)

With weapons W, shields S, range R, speed V and mini M:

- Base figure B = (13 + W) × (S + R + V + 38) ÷ 0.36.
  - Satellites: B = 4.762 × (13 + W) × (26 + S).
  - Decoys: 17 × (42 + R + V) ÷ 0.36.
- Mini factor m = 1 + M ÷ 2.
- Money = m × B. Metal = B ÷ (3 × m); Scouts divide by m + ½, so they are
  extra light on metal. Mini makes ships dearer in money and cheaper in metal.
- Colony Ship: +$45,000 and +3,000 metal. Tanker: +$22,500 and +1,500 metal.
- Dreadnought: 40× the money, 25× the metal, 25× the hit points.
- Biological: 8 × B money, no metal.
- Decoy: a twentieth of the money, about a fortieth of the metal (+10), and
  1 hit point.
- **Prototype** (the first ship of a new design): 4 × m times the normal price
  (Colony Ships and Tankers: 2 × m). Biological prototype: 40 × B.
- Hit points: B ÷ 3 (Colony Ship +1,000, Tanker +500).
- Example: the starting Fighter costs $2,000 and 666 metal ($8,000 for the
  prototype). A Colony Ship costs $47,000 and 3,666 metal.
- Computers above Dumb never pay prototype costs. CONFIRMED.

### Other ship rules

- **Dreadnoughts are not locked behind technology.** The computers design them
  from the start. CONFIRMED for computers; INFERRED for humans, because no
  check was found, so the web app lets you build them too.
- **Colony ships are not used up** (CONFIRMED). Each carries 10 colonists. It
  unloads them to found a colony and reloads them at any of your colonies.
  Computers send empty colony ships home to reload.
- **Tankers** (CONFIRMED): each Tanker holds 200 units of fuel for the fleets at
  its star. Refilling costs one unit per ship (25 per Dreadnought) for each
  light-year of range refilled. "There were not enough tankers…" appears if
  they run dry.
- **Biologicals** (CONFIRMED): they refuel only by eating population at your
  own or an ally's colony, 200 units of population per biological for each
  light-year. Both owners are told.
- **Decoys** (CONFIRMED): fake Fighters that show better numbers than you
  have. They cost very little and can't hurt anyone.
- **Dismantling** (CONFIRMED, `FUN_10062c10`, `FUN_100601e0`, `FUN_10099c84`,
  `FUN_10074580`): Dismantle Current Fleet marks a fleet (Don't Dismantle Current
  Fleet takes the mark off), and Scrap Ship Types or the Build Ships window marks a
  ship type (asking first when it has ships). The marks are carried out at the start
  of the next End Turn: every ship of a marked fleet or type is dismantled. Humans get
  back 75% of the metal (87.5% after the recycling discovery); computer players get
  100%. At your own colony it goes to your metal ("Your fleet of %s at %s has been
  dismantled for %s metal."); over someone else's star it falls onto the planet and
  its owner picks it up ("You just received %s metal from someone scrapping a
  fleet..."). A marked type reports "Your “%s” ship type has been dismantled." when it
  gave metal. Dismantling a fleet bought this turn instead cancels the purchase: the
  money (with the first-ship price when none of the design is left), the metal and the
  interest come back.
- **Scrapping in hyperspace** (CONFIRMED): ships dismantled mid-trip rain
  their metal onto their destination the next turn as a **meteor shower**. It
  kills people there; anyone who fits aboard your colony ships in orbit
  escapes. This is the only cause of meteor showers.
- A planet can only build as many ships in a turn as it has population units.
  CONFIRMED (`FUN_1009ab50` for you, `FUN_100852d0` for the computers). (It only
  matters for brand-new colonies.)
- At most 24 ship designs at once ("assembly lines are full"). CONFIRMED.
- **More than 17 types**: at the start of each turn's money step, a player
  with more than 17 ship types loses the oldest ones that have no ships in
  service and aren't the newest of their kind, until 17 are left. This is
  for every player, humans too. CONFIRMED (`FUN_10074580`); it was missing
  from the web app's 5.0.5 rules (it was thought to be the Palm game's own).

## 8. Movement and fuel

- Trip time = distance ÷ fleet speed, rounded up. CONFIRMED.
- A fleet can't leave if the trip is longer than its remaining fuel.
  CONFIRMED.
- Fleets refuel fully at your own and your allies' colonies. CONFIRMED.
- **Multi-star paths** (CONFIRMED): a fleet can be given a route. It stops at
  each star to refuel and waits if it can't reach the next one yet.
- **Arrival notices** (CONFIRMED, `FUN_10075b80`, `FUN_100782a0`): "Your fleet of %s
  has arrived at %s." at the end of a trip, when you had explored the star and it has
  an owner on your records, or the fleet isn't all Colony Ships. Your allies hear of
  your fleets arriving at stars that aren't yours.
- **Waiting** (CONFIRMED, `FUN_10075f10`): a fleet whose next hop is beyond its fuel
  waits with its orders; an empty Colony Ship fleet at one of your colonies (not being
  evacuated) waits there to reload.
- **Wormholes** (CONFIRMED): a fleet arriving at a star that has gone
  supernova "disappeared through a wormhole in space and is lost".

## 9. Combat

CONFIRMED:

- A battle happens wherever ships or a populated planet of players who aren't
  allied meet. That includes fleets that were already sitting there, not only
  new arrivals.
- There is no round limit. It goes on until nobody has anything left to shoot
  at.
- Everyone's ships are grouped by design. Groups fire in order of **Speed**,
  fastest first, and the planet fires last. Ships destroyed earlier in the
  same speed step still get their shot.
- Shots per ship per round: 1; **Satellites 2; Dreadnoughts 25**. A planet gets
  one shot per 200,000 population, rounded up.
- **Hit chance** depends only on (attacker's Weapons − target's Shields):
  50% when equal, 74% at +2, 90% at +7, 96% at +17 or more; 25% at −2,
  10% at −6, 3% at −18 or worse.
- **Damage** per shot = hit% × (5 × Weapons + 10 + random 0–20) ÷ 6, at least 1.
  Damage piles up on one ship at a time, and leftover damage carries over to
  the next ship.
- **Shooting at a planet** kills hit% × (5 × Weapons + 10 + random 0–20) × 4
  population units per shot.
- **Target choice**: ships always shoot ships before the planet. Among ships,
  Colony Ships are preferred (+10), then Tankers (+8), then Satellites (+6),
  plus a random 1–5. A group keeps shooting the same target group until it is
  gone.
- The planet uses its owner's Weapons and Shields tech.
- **Battle stances**: a fleet can be **Offensive** (+1 Weapons, −2 Shields) or
  **Defensive** (−2 Weapons, +1 Shields).
- **Arrive late** (`FUN_1007e870`): at a star, a first battle is fought without the
  ships that arrived this turn marked to arrive late, then a second with everyone. Each
  is a battle of its own, with its own replay, results and reports.
- **Order** (`FUN_1007f560`): the sides are drawn up as you see them: your side, your
  allies, the colony's owner, then the rest; each side's designs last to first.
- **Reports** (`FUN_100803e0`, pictures `FUN_1009d670`): "... destroyed your colony
  ..." and "You lost a battle ..." (with "and your allies" when they fought) show the
  enemy's face when there was one enemy; "You won a battle ...", "%s survived an
  attack from %s" and "You just watched some of your allies fight a battle at %s."
  A star where two or more sides brought more than one ship is a "big battle", which
  everyone not there hears of in pass 2 (`FUN_10078840`).
- **Luck in battles** (a game option): each side gets −1, 0 or +1 Weapons per
  battle. The "smarter generals" discovery removes the −1.
- **Debris**: a fifth of the metal of every destroyed ship. After the
  battle the sides are taken in player order, and the first side still
  standing gets it all: onto its colony's stockpile if it owned the planet
  ("You recovered … metal", ×5/4 with the recycling discovery), otherwise it
  falls onto the planet ("… metal has fallen onto …"), told to that side
  only. If every side was beaten, nobody gets it. CONFIRMED (`FUN_100803e0`).
- **Who keeps the survivors**: when a side loses some ships of a type, the
  ships left stay with its fleets listed first; the fleets listed last lose
  theirs, and each Colony Ship lost takes its 10 colonists. CONFIRMED
  (`FUN_10081810`). The web app used to take the losses from the first
  fleets.
- **What each side learns** (CONFIRMED, `FUN_100803e0`): every side's record
  of the star gets the battle's year, the enemy colony's population, and
  estimates of the strength there, which the computers plan with (see
  "Computer players"). Each side likes each enemy less: 10–30 points for a
  skirmish (one ship of its own, no Dreadnought present), 50–100 otherwise;
  when its colony there was destroyed, 100–200, or all its liking if that was
  over 500. An attacked computer colony (not the turtle's) puts more metal
  into defence: +10 (kept between 60 and 99) when the colony was beaten with
  over 20 people, then +5 (between 30 and 99) while under 70.
- Allies at the same star fight side by side.
- The sides of a battle are listed, and their luck drawn, in player order
  (`FUN_1007e870`).

## 10. Novas, supernovas, Armageddon and other events

- **Novas** (CONFIRMED):
  - From the year 2750, about once in 99 turns, an unowned star starts to
    "grow and turn bright red". Only one star does this at a time.
  - A red star gets closer to exploding every turn.
  - A star someone owns has a 7% chance each turn (rand(1, 100) of 94 or more) of being saved ("It's a
    miracle!"; others see "Wow, that's weird!").
  - Every player hears "Uh-oh! %s has started growing and is turning bright red
    in hue!" every turn while a star is red. CONFIRMED (`FUN_10076d20`).
- **Supernova** (CONFIRMED):
  - The star and everything at it are destroyed.
  - Stars within 10 ly are pelted with metal, more the closer they are: a star d ly
    away gets a random amount from max(100, 10000/d − 1000) to 10000/d.
  - Colonies there lose people (40–60 units per unit of metal thrown) but keep
    the metal.
  - The wreck stays on the map. Fleets sent there are lost (section 8).
- **Armageddon** (CONFIRMED):
  - Each human can switch on the Armageddon device. Everyone is told when it
    goes on or off.
  - When every surviving human has it on, half of the quiet stars start to go
    supernova ("Oh No! It's armageddon!").
  - Every distance shrinks to ¾, and the count of Armageddons lowers the game
    difficulty (section 13).
  - With fewer than two quiet stars it fizzles ("not enough mass"). The devices
    stay on, so it tries (and fizzles) again every turn. CONFIRMED (`FUN_10076680`).
- **The Valdez** (CONFIRMED, an Easter egg): a fleet you name "Valdez" has a 1
  in 250 chance each turn of springing a leak. You get a message and nothing
  else happens.
- **Messages with no code behind them** (INFERRED): the program has messages
  for a volcanic eruption, metal suddenly disappearing, a "nasty computer
  bug", and "is cheating". No code that sends them was found, so they look
  like leftovers. The web app leaves them out.

## 11. Alliances, best buddies, gifts, messages and surrender

All of this needs the **Alliances** option, as in the original. CONFIRMED.

- **Alliances**: both sides must tick each other. Allies don't fight, refuel at
  each other's colonies, and fight side by side.
- **Best buddies**: allies who also both tick "best buddy". Best buddies share
  what they explore.
- Every change is reported: "has offered to ally with you", "no longer wants
  to ally with you", "You have formed an alliance", and so on.
- **Alliance victory** (CONFIRMED): when every surviving player is allied with
  every other, they win together. With two or more humans still alive the
  game warns first ("Your alliance will win the game next turn if it holds!")
  and checks again the next turn. With one human, as in the web app, it ends
  at once.
- **Gifts** (CONFIRMED, `FUN_1005dcb0`): up to three a turn, of money (from Ship
  Savings) or metal, to a player still in; taken at once, and they arrive at the end
  of the turn.
- **Messages**: the original has canned phrases ("I like *name*.", "Thank You!",
  "Sorry!", "#!$@*$&@•™!" and so on). The computers react to some of them
  (section 12).
- **Surrender** (CONFIRMED):
  - You can surrender to a player or to no one.
  - Your fleets are dismantled.
  - The player you surrender to gets your savings plus a turn's income, your
    metal, and your planets.
  - A planet is handed over only if no enemy of theirs is sitting at it.
  - A computer that likes nobody surrenders to no one (`FUN_10088160`).

## 12. Computer players

### Personality (CONFIRMED)

Every computer has a personality made of the same settings as a hidden
"Computer Attrs" window the developers left in the game's resources.

| Setting | Usual range | Dumb | Average | Smart | Diabolical |
|---|---|---|---|---|---|
| Share of income put into research first | 35–45% | 15% | 30% | 45–50% | 40–60% |
| Income needed per extra colony | $33–37k | | | | |
| % of colonies defended | 30–70% | 10–20% | 30–40% | | |
| % of metal for defence | 60–80% | | | | |
| Attack strength wanted vs. enemy | 150–250% | 75–95% | 125–175% | 150–200% | |
| Defence strength wanted vs. threat | 150–250% | 75–95% | 125–185% | | |
| Aggressiveness (1–10) | 3–7 | 1 | 4 | | 10 |
| Importance of metal when choosing colonies | 25–75% | | | | |
| Savings goal (× income) | 2–4 | | | | |
| Minimum attack fleet | 3–6 ships | 1 | 1 | | 10–15 |

- **Research split**: Range 16–20%, Speed 16–20%, Weapons 20–26%, Shields
  20–26% (never more than Weapons), Radical 2%, and Mini gets the rest. When
  Range reaches 16, or Mini passes 1, they move budget into Weapons and
  Shields. CONFIRMED.
- **Special personalities**: some Smart and Diabolical computers get one of
  two, by the computer's number among the computers (the humans come first),
  counting from 0, mod 4 (`FUN_100704d0`, `FUN_10057de0`). CONFIRMED.
  - Number 3, 7, 11, 15 is the **turtle** (style 2): 50% research first (60%
    Diabolical), $35k per colony, every colony defended, 90% of metal for
    defence, defence 300%, attack 1,000%, aggressiveness 1, metal 75%, savings
    goal 4–6. Its defence share never drops, it never surrenders, and it only
    attacks stars weaker than one Fighter (`FUN_10085f60`, `FUN_10082d40`).
  - Number 2, 6, 10, 14 is the **pouncer** (style 3): 45% research first,
    $35k per colony, 25% of colonies defended, 10% of metal for defence,
    defence 150%, attack 200%, aggressiveness 10, metal 60%, savings goal 3,
    fleets of 25–30. Its defence share drops toward at most 50%.
  - Both research Range 20, Speed 380, Weapons 380, Shields 20, Mini 180,
    Radical 20; in a galaxy of density over 50 (game +0x58, the number the
    star layouts use) Range +80, Speed −40, Weapons −40.
  - The remake had these the wrong way round (the turtle got style 3), picked
    them by player number and gave the Range bonus for more than 3 players;
    fixed.
- **Random draws**: in 5.0.5's order (research share, income per colony,
  colonies defended, metal for defence, defence %, the four research shares,
  attack %, aggressiveness, metal %, savings goal, fleet size, then a starting
  attitude for all 16 player slots). The remake used to draw attitudes only
  toward players created before the computer, so later players started at 0;
  fixed.
- **Diabolical computers cheat** (CONFIRMED):
  - Before 2020 they know every star within 8 light-years of home: the
    star's record gets this year's gravity, temperature and metal and "no
    owner" (`FUN_10088460`), its own colonies near home included. The year the
    computers see is already the next one (below), so this happens on the
    first turn only.
  - They treat other computers' planets as a quarter as attractive to attack
    as humans' (the score divided by 4, rounded toward zero, `FUN_10082ea0`;
    the remake rounded up, fixed).
  - They start out disliking humans and liking other computers.

### Each turn (CONFIRMED, 21 steps)

1. Split mixed fleets apart.
2. Design new ship types when old ones fall too far behind technology, and
   scrap unused old designs.
3. Work out:
   - how many colonies its income supports;
   - a savings reserve it won't touch (the smaller of income × years since
     2000 ÷ 100, and income × savings goal);
   - how to split spare metal between defence and attack.

   The defence share drops by 5% a turn, so computers grow more aggressive
   over time.
4. Sort every star by what it knows (unexplored, free, enemy, friendly, its
   own) and estimate threats near its colonies.
5–8. Move outdated fleets home and dismantle them for metal; send warships
   out.
9. React to last turn's news (tech milestones, attacks, diplomacy).
10–16. Make a priority list of wishes:
   - research (priority 90);
   - mining (75 on hopeless planets, 30 elsewhere);
   - terraforming (70–80);
   - colony ships and scouts;
   - attacks (35 + 5 × aggressiveness);
   - satellites (60).
17. Work down the list. Research, terraforming and mining come out of this
    turn's budget; ships come out of savings.
18–21. Send idle fleets home, reload empty colony ships, and set the same
   budget bars a human uses.

`js/ai-original.js` follows these routines one by one (each is named in
the code next to the rule it carries out). Points worth knowing:

- **The year**: the turn routine (`FUN_10072a10`) moves the year on by 10
  before the computers plan, so every year test in their plans ("after
  2500", the savings reserve, how old a battle report is) uses the coming
  year. A human's Auto button plans before the year moves on (`FUN_10066bb0`).
- **Step 1** (`FUN_10088eb0`): a fleet of several designs at a star is split
  into one fleet per design, the first design in the list first, except
  satellite fleets and warships travelling with tankers. A split-off fleet
  starts with a full tank (a Biological's starts empty) (`FUN_1007bcb0`).
- **Star classes and threats** (`FUN_10088460`): each star is unexplored,
  unexplored but a battle seen there, explored and free or friendly, an
  enemy's, a best buddy's colony, with a fleet of yours there or on its way,
  or one of your colonies (making money, losing money, or losing money on a
  hostile planet). The threat to each colony is the largest of what the
  battles there and nearby left in the computer's records (a Fighter from a
  free or unknown star in reach). Other players' stars where it never saw a
  battle get a guess from its own Weapons and Shields. Old news fades: 100
  years after a battle the estimate there may drop to almost nothing, and
  every 200 years it is guessed again.
- **Routes** (DeterminePath, `FUN_1007d260`): a fleet goes straight when its
  fuel allows; otherwise it hops through colonies of the computer's own and
  its best buddies', at most 7 hops, never more than 3 times the straight
  line, shortest first. A fleet whose next hop is beyond its fuel waits with
  its orders (`FUN_10075f10`). A fleet with a Tanker uses a full tank and
  routes only through stars whose record is of this year; since the year has
  already moved on when the computers plan, that is in practice only the
  Diabolical first-turn look.
- **Tanker retirement** (`FUN_100870a0`): a computer's Tankers, like its
  obsolete ships, go home to be scrapped, or are scrapped at once at a
  colony. (The routine passes the fleet's number in the fleet list where the
  route-finder expects the fleet's Range; that slip is kept.)
- **Chained stops** (steps 18–19, `FUN_100843b0`, `FUN_100845f0`): a Smart or
  Diabolical computer's idle warships with tankers pick a target in Range
  that they beat by half again (the strongest such, each better one taken
  two times in three); a Diabolical computer playing more than 10 years a
  turn adds a second stop it can reach in the same turn.
- **Buying ships** (`FUN_100852d0`): from Ship Savings above the reserve,
  never reaching the borrowing limit, only where the colony has a thousand
  people per ship bought there this turn, not at a star going nova. Dumb and
  Average computers pay a type's first-ship price for their starting types;
  Average and up design new types free of it (`FUN_10086830`). When a
  purchase fails, no more ships are bought that turn, and if the metal was
  short for a colony ship (with none in service), idle ships at its
  colonies are scrapped for metal (`FUN_10085700`).
- **Ship types** (`FUN_10086830`): a type with no ships in service, or ten
  Weapons levels behind, is retired once any part of it is behind the
  computer's technology; a new type is designed when the best of a kind is
  obsolete enough; room is kept for six new types.
- **Messages** go through an outbox of three a turn (`FUN_100880f0`), as the
  canned lines "I like %s.", "I hate %s.", "You take %s.", "Thank You!",
  "Sorry!", "#!$@*$&@•™!", "I need money.", "I need metal." and "I like
  planets that are …".

### Settled in the 5.0.5 pass

The points this section used to list as unclear are all settled in the code, and the
web app now follows it (`docs/open-questions.md`, Mac 5.0.5):

- **The money a computer plans with** (`FUN_10081cc0`) is the net (player +0x40); the
  reserve it won't touch is min(this turn's money × (year − 2000) / 100, that money ×
  its savings goal); Total Money for the colony count is this turn's money plus the
  interest.
- **Its budget** (`FUN_10085bd0`) is 4.0.5's ResolveSpending, line for line: every slot
  of the colony list but a finished colony gets its money over the total, per mille
  rounded up, and each colony's bars split its money between terraforming and mining.
- **Evacuating** (`FUN_10081fe0`): a computer sets a colony's evacuate mark directly,
  with no question and no change to its net.
- **Terraforming** (`FUN_10082690`): wished for at every colony whose Terraform bar
  isn't done, with no other test.
- **The colonies** are walked in the colony list's order (a new colony in front, the
  list sorted by income each turn).
- **Late arrivals** are a battle of their own (section 9), and the Tankers a computer
  buys into an attack fleet are marked to arrive late and defend (stance byte 3,
  `FUN_10084860`).
- **Group order**, **big battles** and **the star's owner after a lost battle** follow
  `FUN_1007f560`, `FUN_10078840` and `FUN_10081230` (section 9).
- **Auto play**: a human's Auto button sets aggressiveness to a tenth of the
  Preferences' Friendly-Aggressive slider and colonies defended to the Dig In-No
  Defense slider (`FUN_10066bb0`, `FUN_1005ec40`); the web app has no such preferences
  and keeps the auto play personality's values.
- **Nobody to surrender to**: `FUN_10088160` answers the player count, which means "no
  one".

### Where to attack (CONFIRMED)

Each candidate star scores points for:

- aggressiveness, minus how strong the defence looks;
- a populated planet (+20, and +40 more if big);
- belonging to the richest rival (+25);
- its metal and how livable it is;
- how close it is;
- some randomness.

The computer attacks only with a fleet at least (enemy strength × its
attack-strength setting). If it needs more ships it builds Fighters, or one
Dreadnought when that is about the right size.

### Where to colonize (CONFIRMED)

Planets are scored by metal-importance × metal + (100 − metal-importance) ×
livability. The computer prefers free planets where its own ships are already
parked, usually a scout. It won't build anything but colony ships while it has
less than 5,000 metal, unless it already owns a colony ship.

In late games this rule often leaves a computer saving metal it never spends.
This is faithful, not a bug in the web app.

### Diplomacy (CONFIRMED)

- Each computer keeps a friendliness score for every player: 250–350 to start
  (Diabolical: −50 to 0 toward humans, 350–450 toward other computers). It
  wants an alliance at 500 or more and drops it below 500.
- **Raising** its score for one player **lowers** its score for everyone else
  by a sixth as much.
- **Gifts** raise the score by up to 50, more for a bigger gift compared with
  its income or metal. Sometimes it says "Thank You!"
- A new alliance raises the score by 50–150 and cools it toward some others.
  A broken one drops it to just under 500.
- When attacked it sometimes swears ("#!$@*$&@•™!").
- After 2500 the richest player becomes less popular with everyone, and the
  poorest computer loses heart.
- Computers dislike the allies of players they dislike.
- When it changes its mind it may say "I like *name*." or "I hate *name*."
  (messages 1041/1042, with the other player's name; the web app used to
  say "you").
- **Requests** (`FUN_10085f60`, CONFIRMED; were missing): to each ally, one
  time in 20, "I need metal." (message 1045) after 2500 when its metal in all
  is under 10,000, and "I need money." (1044) after 2400 when its income is
  the lowest and the next lowest is more than $2,000 higher. No computer acts
  on them.
- **Three messages a turn**: a computer's messages go through an outbox of
  three (`FUN_100880f0`, player +0x1058, emptied each turn by `FUN_10072a10`);
  the rest are dropped. Messages to other computers count too.
- Diplomacy runs after the assessment, star classes and fleet steps
  (`FUN_10081cc0` calls `FUN_10087530` ninth), so surrender and requests use
  last turn's attitudes; the remake used to run it first, fixed.
- **Surrender**: after 2500, with at least three players left, a computer
  that is broke, or the poorest by far (under a third of the next poorest's
  income), surrenders to the player it likes best. Turtles never surrender.
  `FUN_10085f60` doesn't look at the Alliances option (the remake used to
  require it; fixed).
- **After a battle** (`FUN_100803e0`, now in the remake): each side likes
  its enemies less, and an attacked computer puts more metal into defence;
  the exact rules are in section 9.
- **Best Buddies games**: when the game starts with the computers as best
  buddies, a computer's feelings never change (`FUN_10087f80` checks game
  option bit 0x20); the remake used to let them drift.
- With only two players feelings don't change at all (`FUN_10087f80` counts
  every player, out or not).
- **Planet preferences**: "I like planets that are …" tells the receiver
  your home's gravity and temperature (`FUN_10072a10`, at delivery), and new
  best buddies learn each other's (`FUN_100761c0`). A computer that must
  abandon a hostile colony offers it to an ally whose liking it suits ("You
  take *star*.", `FUN_10081fe0`), and tells an ally its own preference once,
  when asked.
- A computer that won a battle where the other side lost nothing may say
  "Sorry!"; when its colony is destroyed it may swear at the attacker and
  tell everyone "I hate *name*." (`FUN_10087530`).

## 13. Years per turn, master points and ranks

### Years per turn (CONFIRMED)

With 20, 30 or 50 years per turn, one End Turn runs two, three or five
10-year turns in a row. The computers only make plans on the first of them,
and the winner is only checked on the last.

### Game difficulty rating (CONFIRMED)

The rating runs from 30 to 140 and is shown live in the New Game window. It
adds up scores for:

- how much better the computers' home system is than yours;
- the IQ;
- the number of computers (more if they are best buddies);
- the shape (Cluster counts lowest, then Spiral);
- the size and the density (bigger and sparser are easier).

The weakest of these counts extra.

At the end of a game it is adjusted:

- ×0.9 for each Armageddon;
- −1 for each human who didn't win;
- +1 for winning between 2000 and 3000;
- −1 for every 5,000 years at 5000 or later.

### Master points and ranks (CONFIRMED)

- A win earns 3 to the power of ((difficulty − 30) ÷ 10) master points, at
  most 10,000,000. But one win can't take you more than halfway past your
  next rank: when you join a game, the game notes the points you may still win in it
  (halfway between your next rank and the one after, less what you have; no limit from
  65,535 up), and the win adds at most that. CONFIRMED (`FUN_10063a40`, `FUN_10056000`,
  `FUN_10055f20`, `FUN_100b24c0`). The message says what was added. That is 1 point at difficulty 30, about 100 at 72 (the
  default settings), and 177,147 at 140.
- Points add up across games. In the web app they are kept in your browser,
  and only Original-rules wins count.
- There are 25 ranks, each with its own picture (these are the 25 JPEG files):

| # | Rank | Points | Unlocks in the original |
|---|---|---:|---|
| 1 | City Slicker | 0 | |
| 2 | Shopkeeper | 10 | grid-shaped galaxy |
| 3 | Farmer | 25 | IQ 125 computers |
| 4 | Miner | 50 | starting as 'Backward' |
| 5 | Greenhorn | 75 | 20 years per turn |
| 6 | Sourdough | 100 | computers on 'Advanced' |
| 7 | Muletender | 150 | IQ 150 computers |
| 8 | Cowpoke | 200 | starting as 'Barren' |
| 9 | Ranch Hand | 250 | up to 5 computers |
| 10 | Buckaroo | 300 | 30 years per turn |
| 11 | Horseman | 400 | IQ 175 computers |
| 12 | Horse Breaker | 500 | computers on 'Thriving' |
| 13 | Cowboy | 750 | up to 6 computers |
| 14 | Vaquero | 1,000 | random galaxy |
| 15 | Deputy | 1,500 | 50 years per turn |
| 16 | Lawman | 2,000 | IQ 200 computers |
| 17 | Sherriff | 3,000 | up to 7 computers |
| 18 | Marshall | 5,000 | starting as 'Outpost' |
| 19 | Ranger | 10,000 | computers on 'Abundant' |
| 20 | Gunfighter | 20,000 | up to 8 computers |
| 21 | Outlaw | 50,000 | hex-shaped galaxy |
| 22 | Desperado | 100,000 | best-buddy computers |
| 23 | Shootist | 1,000,000 | |
| 24 | Antares Kid | 10,000,000 | |
| 25 | Ho! Champion | 100,000,000 | |

- Reaching a rank shows "Congratulations! You have achieved the rank of: …"
  with its picture and what it unlocks. Game > Rank history shows your rank,
  your points and your wins.
- NOT IMPLEMENTED: **locking options by rank.** The original greys out
  settings until you reach the rank, marked "(Need more MPs)". The web app
  leaves every setting open, so a parent and child can play any game from the
  start. The unlock list is shown for interest.
- INFERRED: in the web app, no points are given when the computer was playing
  your final turn (Auto play). The original's rule for this wasn't found.

## 14. What you see and hear

### Ship pictures (CONFIRMED)

Ships are built from a sheet of parts (picture 11000), with four rows of 30
pieces. Every ship faces right.

- **Engine** at the back, picked by Range + Speed − 8.
- **Hull** in the middle, picked by Shields.
- **Weapon nose** at the front, picked by Weapons.
- **Satellites** are a single orb, picked by Weapons.
- **Tankers** and **Colony Ships** swap the hull for their own body. The
  Colony Ship body is the green-domed drum, which the old asset list wrongly
  called "satellite".
- **Dreadnoughts** have a big green-and-purple body with three noses and three
  engines.
- **Decoys** look like Fighters.
- **Special pictures** replace the built-up ship for some designs:
  - **Biologicals** are always a creature: a red squid (Weapons under 7), a
    cow-fish (Weapons 13–15) or a worm (otherwise).
  - A Scout with Weapons 1 is the "eye ship".
  - A Dreadnought with Weapons over 30 gets a big magenta body.
  - A Dreadnought with Weapons 8, Range 11–13 and Mini over 1 gets another.
  - A Fighter with Weapons under 9 and Speed over 5 is a blue rocket.
  - A Fighter with Weapons 12 and Shields under 11 is a grey-green ship.
  - Four critter pictures replace certain satellites.
- **Rusty ships**: a design whose Weapons and Shields are both more than 3
  levels behind your research is drawn rusty.
- **The striped planet** (the blue-green striped ball on the ship sheet) is
  what the original draws for **a planet in a battle**. The old asset list
  called it "colony". Battle replays now show it.

### Planet pictures (CONFIRMED)

- **Size** shows gravity compared with your home, in seven sizes. The cut-offs
  are 252%, 201%, 126%, 76%, 51% and 39% of your home gravity. Your own home
  is the middle size.
- **The "Mined" column** is a reddish version of each planet, used once fewer
  than 100 units of metal are left.
- **Metal overlays**: brown speckles in five levels, from 100, 1,000, 2,500,
  5,000 and 10,000 metal.
- **Heat**: a planet more than 5° warmer than you like glows orange, fully at
  about 300° warmer.
- **Cold**: a planet more than 7° colder grows ice caps at top and bottom,
  bigger the colder it is and on smaller planets.
- All overlays are cut to the planet's shape.

### Fleet markers (CONFIRMED)

The small squares beside a star show **one square per ship design** in a
fleet, side by side. Each square's column is the ship type, and its row is how
many ships there are (1, 2–10, 11–30, 31+). Your own markers come in four
sets:

- plain;
- **striped**: the fleet isn't fully fuelled, or a colony ship is empty;
- **faded**: that design's Weapons are more than 3 levels behind yours;
- striped and faded together.

Everyone else's markers are pink. Satellites sit on the left of a star and
fleets on the right.

### Sounds and message pictures (CONFIRMED)

Every one of the original's 159 report lines has its own picture and sound,
read from two tables in the program. The web app matches each message to its
report line and uses those. Some examples:

- Technology levels and good news: sound 2000.
- Bad news (lost colony, broken alliance): 2001.
- Exploring: 6000 for a good star (rating 15+), 6002 for so-so (1–14), 6001
  for useless (0).
- Colonizing: 7018.
- Biologicals eating people: 7013.
- Armageddon: 8000.
- Gifts and surrenders received: 7015.
- Alliances formed: 7017.
- A player eliminated: 7021, or 2001 if they were your best buddy.
- Battle reports are silent; the battle itself has its own sounds.
- Most other messages: 7001.

### The 25 pictures (CONFIRMED)

The 25 JPEG pictures (`assets/explore/01.jpg` to `25.jpg`) are **rank
pictures**, shown when you reach a new rank. They are never shown for
exploring. The original builds the file name from the rank number. The folder
keeps the name "explore" because that is what the project layout asked for.

## 15. What can't be done in a browser, and what isn't done yet

- **Network play** (hosting, joining, the lobby, the spacewardho.net server,
  turn time limits, passwords, "Fair Start", "All Humans Are Best Buddies"):
  NOT IMPLEMENTED. These need the original's server, which no longer runs, and
  the web app has a single human player. "Network master points" go with them.
- **Registration and the demo limits**: NOT IMPLEMENTED; there is nothing to
  register.
- **Locking options by rank**: NOT IMPLEMENTED on purpose (section 13).
- **Hidden debug menu** (God View, "Computer Do Turn", the Computer Attrs and
  Terraform test windows): NOT IMPLEMENTED. These are developer tools.
- **Group Fleets…** (the original's window for rearranging ships between
  fleets): NOT IMPLEMENTED as a window. The web app has "Merge all fleets
  here" and fleet splitting instead.
- **Saving where you like**: the web app saves one game in the browser rather
  than to a file.
- **Exact replays**: the original's own list of 5,000 random numbers is not
  copied (section 1).
- **Computers knowing all stars**: an option in some versions; no such switch
  was found in 5.0.5's New Game window, so it isn't offered.
- **The auto play settings** (Preferences: the Friendly-Aggressive and Dig In-No
  Defense sliders the Auto button uses): NOT IMPLEMENTED.
- **The canned-message window** ("Look at %s" explores a star for the receiver, "I own
  %s" marks it, "I like planets ..." tells your home): NOT IMPLEMENTED; the web app's
  messages are free text.
- **The questions before buying more than 9 Scouts or Tankers**, and **the first
  turn's budget kept for the next game**: NOT IMPLEMENTED.

## 16. Claude rules versus Original rules

The Claude rules were written from the manual before the program was taken
apart. They are kept exactly as they were (in `js/rules-claude.js`). Here is
every difference that matters in play.

| Area | Claude rules | Original rules |
|---|---|---|
| Galaxy layout | Own generator: Random, Ring, Cluster, Spiral, Grid, Hex; four sizes, three densities | Original routines for all seven shapes (adds Circle); Size and Density sliders |
| Home stars | Spread out as far as possible | Original rules (section 2) |
| Distance | Straight-line distance on the map | Original "longest gap + a third of the shorter" rule, in whole light-years |
| Computer IQ | Four named levels, all computers alike | IQ 50–200, each computer a bit different, "Based on IQ" home systems |
| Starting tech | Range 3, Speed 1, Weapons 1, Shields 1, Mini 1, Radical 1 | Range 6, Speed 2, Weapons 2, Shields 2, Mini 0, Radical 0 |
| Starting money and population | Own table (Normal: $25,000, 3,000 metal, 100 million people) | Original table (Normal: $25,000, 5,000 metal, 500 million people) |
| Free starting ships | Thriving: colony ship; Abundant: colony ship and 2 scouts | Advanced+: 2 scouts; Thriving+: colony ship; Abundant: also a second colony |
| Planet population | Max 125 million × gravity factor × temperature factor | Max 500,000 − 12 × hostility (units of 1,000) |
| Income | 375 per million people, $7,500 upkeep per colony | Original income formula (section 4) |
| Interest | 2% of savings (capped), 15% on debt | 10 × √savings, 15% on debt |
| Research cost | 1,800 × 1.45^level | Different curve for each technology (section 6) |
| Radical discoveries | Random chance from points spent; equal odds | One per Radical level, from a hand of 4 with set odds |
| Ship costs | Fixed price per type, scaled by tech | Original formula with prototypes and Mini (section 7) |
| Dreadnoughts | Need total tech ≥ 22 | Available from the start |
| Colony ships | Used up when they found a colony | Carry 10 colonists, can be reused |
| Tankers | Refuel by number of tankers | 200 fuel units each, used per ship per light-year |
| Combat | Up to 40 rounds, damage grows ×1.6 per Weapons level over Shields | No round limit, original hit table and damage (section 9) |
| Battles | Only where a fleet arrives | Everywhere enemies share a star |
| Debris | 30% of ship metal | 20% of ship metal |
| Stances, arrive late, luck | Not used | Used |
| Multi-star paths | Off | On |
| Alliances, gifts, surrender, messages | Off | On (with the Alliances option) |
| Novas, supernovas, Armageddon, wormholes | Off | On |
| Meteor showers | — | Only from ships scrapped in hyperspace |
| Years per turn | Always 10 | 10, 20, 30 or 50 |
| Master points and ranks | Not awarded | Awarded for wins |
| Max ship designs | Unlimited | 24 |
| Computer players | The Claude AI | The original's 21-step AI (section 12) |

Pictures, sounds, fleet markers and planet pictures follow the original in
both rule sets, because they are part of the interface, not the rules.

**Where I think the Claude rules are wrong** (noted here instead of changing
them, as asked):

- The starting technology levels are far lower than the original's, so early
  ships have much shorter range.
- Colony ships should not be used up.
- Dreadnoughts should not need a tech total of 22.
- Battles should continue until one side is gone, not stop at 40 rounds.
- Meteor showers in the original are never random; they only come from ships
  scrapped in hyperspace.

## 17. Technical appendix

All addresses are for the PowerPC code of version 5.0.5, analysed with Ghidra
11.4.2 (language PowerPC:BE:32:default). The program's TOC register r2 is
0x100f6630. Report messages are numbered 1000 + (line in STR# 6020 − 1).

| What | Where |
|---|---|
| Whole turn / years-per-turn loop | FUN_10072a10 / FUN_100728d0 (years per turn at game +0x62) |
| Interest / debt | FUN_10054de0, FUN_100737b0 |
| Colony support | FUN_10073a80 |
| Terraforming and mining | FUN_10073d70, FUN_10055d90, FUN_10055e30 |
| Research | FUN_10074f90 |
| Radical discoveries / hand refill | FUN_10079360 / FUN_1007a180 |
| Population and colony income | FUN_10077200 |
| Star rating | FUN_10072100 |
| Colonizing | FUN_10078e80 |
| Tankers, biologicals, colonists | FUN_10077aa0 |
| Dismantling fleets | FUN_10074580 |
| Novas, supernovas, Armageddon | FUN_100769b0, FUN_10076d20, FUN_10076680 |
| Galaxy setup and shape switch | FUN_1006c4d0 (jump table 0x10110ac8) |
| Circle, Ring, Random, Spiral, Cluster, Grid, Hex | FUN_1006d460, FUN_1006d700, FUN_1006d280, FUN_1006d9e0, FUN_1006dff0, FUN_1006e3c0, FUN_1006e550 |
| Star spacing checks / home stars / map shift | FUN_1006efb0, FUN_1006f050 / FUN_1006eb40 / FUN_1006edc0 |
| Star generation | FUN_1006f280 |
| Player setup, computer skill from IQ | FUN_1006f640 (jump table 0x10110ae8) |
| Ship costs | FUN_1007de60 (hit table at 0x100df00c) |
| Obsolete-design flag | FUN_10074c10 |
| Battle setup / rounds / shots / targets | FUN_1007e870, FUN_1007eed0, FUN_1007f7f0, FUN_1007f9f0, FUN_1007fe30, FUN_1007f430 |
| Star distances | FUN_100589f0 (Armageddon count at game +0x216) |
| Trip time | FUN_10075f10, FUN_1007c3a0 |
| Alliance / best-buddy tests | FUN_100587a0 / FUN_10058830 |
| Win check and master-point messages | FUN_1007acf0 |
| Difficulty rating / master points / rank from points | FUN_100560a0 / FUN_10055f60 / FUN_10055ed0 |
| Rank table (name, points, unlock) | 0x100e3f10, 25 entries of 0x74 bytes |
| Rank dialog (builds "NN.jpg") | FUN_1005e2b0 |
| Computer player main / personality | FUN_10081cc0 / FUN_100704d0 |
| Computer steps | FUN_10088eb0, 10086830, 10085f60, 10088460, 10088fd0, 10086f20, 100870a0, 100872a0, 10087530, 10081fa0, 10081fe0, 10082820, 10082bb0, 10083110, 10082690, 100839a0, 10083e30, 100843b0, 100845f0, 10085900, 10085bd0 |
| Computer diplomacy | FUN_10087530, FUN_10087f80, FUN_10088160 |
| Computer action list / jump table of actions | FUN_10088240, FUN_10088330 / FUN_10083e30 (cases 0x10083e78–0x10083fa4: FUN_10083fe0, FUN_10084860, FUN_10085880, FUN_10085070, FUN_100852d0, FUN_10085eb0, FUN_100858d0) |
| Computer purchase / metal from scrapping / nearest colony | FUN_100852d0 / FUN_10085700 / FUN_100829e0 |
| Computer obsolescence / colony rating / target score | FUN_10086d90 / FUN_10083810 / FUN_10082d40, FUN_10082ea0 |
| Route finding (DeterminePath; every caller passes 7 as the 9th argument) | FUN_1007d260 |
| New fleet / split a design off / fleet class / main design | FUN_1007bcb0 / FUN_1007bdc0 / FUN_1007cc70 / FUN_1007d160 |
| After a battle: feelings, defence, star records, debris, survivors | FUN_100803e0 (FUN_10081570, FUN_10081160, FUN_10081380, FUN_10081440, FUN_10081230, FUN_10081810, FUN_100816e0) |
| Auto button (a human's plan) | FUN_10066bb0 |
| Ship picture builder / special pictures | FUN_100ad750 / FUN_100af8e0 (sheet PICT 11000, mask 11001) |
| Planet picture | FUN_10090170 (sheet PICT 10000) |
| Fleet markers | FUN_10091640 |
| Message picture / message sound | FUN_1009d670 / FUN_1009cff0 (jump table at 0x10112ee8) |
| Sound player | FUN_10095690 |
| Sine and cosine tables | 0x100de4cc, 0x100dea6c |
| Interest shortfall (the sign slip) | FUN_100737b0 @10073870 |
| Colony support, evacuations carried out | FUN_10073a80 |
| Colony list order / new colony in front | FUN_1007a5e0 / FUN_10078e80 |
| Budget bars: GiveBarPercent, DetermineNewLevels, most and least | FUN_100712b0, FUN_10071430, FUN_10071a50, FUN_10071ab0 |
| Dragging a bar / bars that can't be dragged | FUN_1008a7a0 / FUN_1008a030 |
| Dip Into Savings window (slider 0-30, PPob 157) / the dip in pass 2 | FUN_1005d380 / FUN_10077200 |
| Evacuate Planet / Dismantle Current Fleet / Scrap Ship Types / build window mark | FUN_10060fac / FUN_10062c10 / FUN_100601e0 / FUN_10099c84 |
| Buying a ship (human) / Build Ships window's count | FUN_1007e4a0 / FUN_1009ab50 |
| Give / Surrender / Armageddon / Send Message windows | FUN_1005dcb0 / FUN_1005d5a0 / FUN_1005e8e0 / FUN_1005d940 |
| Moving, arrivals / departures / allies' arrival list | FUN_10075b80 / FUN_10075f10 / FUN_100782a0 |
| Pass 2b: best buddies' maps, surrenders, big battles, milestones, end of a player | FUN_10078390, FUN_10078560, FUN_10078840, FUN_1007a3f0, FUN_1007abb0 |
| Battle reports' wording and pictures | FUN_100803e0, FUN_1009c240, FUN_1009d670 |
| Master points at a win, the cap | FUN_100b24c0, FUN_10063a40, FUN_10056000, FUN_10055f20 |
| Preferences (auto play sliders) / Auto button | FUN_1005ec40 / FUN_10066bb0 |

Tools used are in `tools/extract/`. The web app's `js/rules-original.js` and
`js/ai-original.js` name the original routine next to each rule.

## 18. The 5.0.5 pass: every change to play, with addresses

What the web app's Original rules did before this pass, and what they do now, as 5.0.5's
code does it. "Before" is the remake's earlier reading.

| Area | Before | Now (5.0.5's code) | Where |
|---|---|---|---|
| The turn | the web app's own order | 5.0.5's: pass 1 for every player in order (interest, dismantling, colony support, terraforming and mining, research), the battles, Armageddon, the novas, pass 2a in a random order of players (supernova damage, scrap metal, income and growth, refuelling, colonizing, exploring), pass 2b in order (allies' arrivals, best buddies' maps, surrenders, big battles, clamps, the first radical hand, milestones, the end of a player, pact news, bars, the design and colony lists), the winner | `FUN_10072a10` |
| Money | the incomes pooled with the interest, losses paid, the rest shared out | this turn's money (last turn's income), the interest, the losing colonies paid in the colony list's order, then each bar's per-mille share as it stands; Ship Savings get the Savings share, the interest and the refunds in pass 2 | `FUN_100737b0`, `FUN_10073a80`, `FUN_10077200` |
| Interest you can't pay | global warming and a fleet scrapped | never: Ship Savings pay it all (a sign slip) | `FUN_100737b0` @10073870 |
| Terraforming | √(⅔ money) | trunc(√trunc(⅔ money)); the "never profitable" warning every turn | `FUN_10073d70` |
| Mining refunds | rounded up, from 30,000 | trunc(m²/400), from 25,001 trunc(m/400) × m | `FUN_10055e30` |
| Research | shares of the tech budget | each tech's share as it stands; progress cut to 6,000; "not spending any money on technology research" every turn | `FUN_10074f90` |
| Scrapping | at once | marks, carried out at the next End Turn ("Dismantle Current Fleet" / "Don't Dismantle Current Fleet"; Scrap Ship Types; the build window's mark); a fleet bought this turn is un-bought; 3/4 (7/8) of the metal for humans, all for computers; over another's star the metal falls to its owner; in hyperspace, a meteor shower | `FUN_10062c10`, `FUN_100601e0`, `FUN_10099c84`, `FUN_10074580`, `FUN_10077110` |
| Evacuating | at once | a mark (Evacuate Planet / Don't Evacuate Planet) with the profitable-colony question and the Kansas and Hope jokes, the income off the net, the share to the others; carried out at the next End Turn ("You have evacuated %s.") | `FUN_10060fac`, `FUN_10073a80` |
| Dip Into Savings | 0-100%, into this turn's budget | 0-30% of Ship Savings each turn as next turn's money, counted in the gross income; the Savings bar at 0 and locked | `FUN_1005d380`, `FUN_10077200`, `FUN_1008a030` |
| Dragging a bar | the web app's own | 5.0.5's redistribution; locked bars (evacuating, finished, Savings while dipping) can't be dragged and keep their shares | `FUN_1008a7a0`, `FUN_1008a030` |
| Colony list | star order | a new colony in front; sorted by income each turn | `FUN_10078e80`, `FUN_1007a5e0` |
| Buying | no limit by people for you; interest unchanged | no more ships a turn at a colony than its people; the interest worked out again after each purchase | `FUN_1009ab50`, `FUN_1007e4a0` |
| Start | | an Outpost's home made hostile; an Abundant player's second colony with 10,000 people, a 50 per-mille share and bars 500/500, third in the colony list, the home fourth with 50; the borrowing limit trunc(−income / 2) × 10 | `FUN_1006f640` |
| The creator's shares | | research 180 × 5 and Radical 100; Savings 650, Technology 250, home 100; Abundant 550 / 200 / 150 / 100 (the preferences' defaults) | `FUN_1006579c`, `FUN_10072490` |
| Battles | one battle at a star | two when ships arrive late, each with its own replay and reports; sides drawn up in viewing order, designs last to first; reports with the enemy's face for one enemy, "and your allies", "You just watched some of your allies fight"; big battles reported to everyone else; the loser's record of the star's owner | `FUN_1007e870`, `FUN_1007f560`, `FUN_100803e0`, `FUN_10078840`, `FUN_10081230` |
| Arrivals | everyone told | "has arrived" by 5.0.5's rule; allies told of arrivals at stars not yours; fleets wait when the next hop is too far | `FUN_10075b80`, `FUN_100782a0`, `FUN_10075f10` |
| Novas and Armageddon | | the red-star warning every turn to everyone; the miracle reports; after a fizzle the devices stay on and it tries every turn | `FUN_100769b0`, `FUN_10076d20`, `FUN_10076680` |
| Radical tech | | the hand as a set of cards (any card when empty); a new hand report after each discovery; the metal report divides by your colonies | `FUN_10079360`, `FUN_1007a180` |
| Winning | | the winner check and its messages as 5.0.5's; a game won only by computers has no human winner | `FUN_1007acf0` |
| Milestones | | chained: one of the first two marks and one of the last three a turn | `FUN_1007a3f0` |
| Master points | the whole award | at most halfway past your next rank | `FUN_100b24c0`, `FUN_10055f20` |
| Computer players | the remake's money figures | plan with the net (player +0x40), a reserve from this turn's money, 4.0.5's ResolveSpending; evacuation by mark; terraform wishes where the bar isn't done; Tankers in attack fleets arrive late and defend; the colony list's order | `FUN_10081cc0`, `FUN_10085bd0`, `FUN_10081fe0`, `FUN_10082690`, `FUN_10084860` |
| Spiral maps | | before 2100 each computer explores the stars numbered 0 to players − 1, the homes | `FUN_10077aa0` @10077fc8 |
