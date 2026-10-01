# What the original Spaceward Ho! 5.0.5 actually does

These notes come from taking apart the original program file
(`Spaceward Ho!.app/Contents/MacOS/Spaceward Ho!`, a 2003 PowerPC Mac program)
with a decompiler and reading the game logic directly. They are written for a
non-programmer. A technical appendix at the end lists where in the program each
finding lives, so anyone can double-check it.

Each finding is marked:

- **CONFIRMED**: read directly from the program's code.
- **INFERRED**: my best interpretation, with the reason.
- **NOT IMPLEMENTED**: in the original but not in the web app yet, and why.

> Status: this is a working draft saved partway through. The rules below have
> been decoded; the web app does not use them yet. Implementation notes will be
> added as each part goes in.

---

## Units the original uses

- **Population** is stored as a whole number. A "Normal" home planet starts at
  500,000. INFERRED: one unit is 1,000 people, so that is 500 million people.
  (The program never prints a population without converting it first, so the
  exact unit is a guess; it only affects how numbers are displayed.)
- **Temperature** is stored in tenths of a degree Fahrenheit. CONFIRMED (the
  hidden debug "Terraforming" window labels it "Temperature * 10").
- **Gravity** is stored in hundredths of a G. CONFIRMED ("Gravity * 100").
- **Distance** between stars is a whole number of light-years, worked out with a
  shortcut: the longer of the east-west and north-south gaps, plus one third of
  the shorter gap, rounded up. CONFIRMED. After each Armageddon every distance
  shrinks to three quarters (never below 3). CONFIRMED.
- **Each turn is 10 years**; games start in the year 2000. CONFIRMED.
- **Randomness**: the original makes a list of 5,000 random numbers and cycles
  through it. CONFIRMED. (The web app can use any random source; this only
  matters for exact replays.)

## Starting conditions

CONFIRMED, by home-system setting:

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
  up to 0.4 of a level. CONFIRMED. (The tech-name list in the game's resources
  agrees: Range names start at level 7 "Topping off the Tanks", Weapons at 3,
  Miniaturization at 1.)
- Starting budget: **65% savings, 25% technology, 10% home planet**; technology
  split evenly six ways. CONFIRMED.
- Home planet: 0 to 200°F, 0.5 to 2.0 G, 10,000 metal, already perfect for its
  owner (your ideal temperature and gravity are defined as your home world's).
  CONFIRMED.
- Advanced, Thriving, Abundant: two free Scouts. Thriving and Abundant: a free
  Colony Ship. Abundant: a second small colony next door (5,000 population,
  2,500 metal, 50–100°F off, 20–50% off in gravity). CONFIRMED.
- Starting ship designs: Scout (Range 9, Speed 2, Weapons 1, Shields 1),
  Tanker (Range 5, Speed 1, Weapons 2, Shields 2), Satellite, Colony Ship and
  Fighter (Range 6, Speed 2, Weapons 2, Shields 2), all with Mini 0. CONFIRMED.

## Galaxy

CONFIRMED, for each star:
- Temperature anywhere from −200°F to 400°F.
- Gravity: one of four bands picked evenly (0.25–0.5, 0.5–1, 1–2, 2–4 G), then a
  random value inside the band.
- Metal: 60% of stars have 0–8,000; 40% have 8,000–30,000.

## Money

- **Income from a colony** (CONFIRMED):
  `population × max(1, ln(√population)) ÷ 76`, minus upkeep of
  `7,500 + population × (100 + H÷40) ÷ 10,000`, where **H** is the planet's
  "hostility" (below). A Normal home world (500,000 people, H = 0) earns about
  $30,700, which matches the hard-coded starting income of $30,000, a good
  sign the formula is right.
- **Hostility H** (CONFIRMED): take the gravity ratio as a percentage (always
  100 or more: 1.5× either way is 150), and the temperature gap in tenths of a
  degree. H = ((ratio − 100) × 12,000 + gap²) ÷ 100.
- **Disposable income**: each turn, the incomes of your profitable colonies are
  pooled. CONFIRMED. Positive interest is added to that pool (not to savings).
  CONFIRMED. Interest you owe is paid from the pool first. Colonies running at
  a loss are paid for from the pool next. Whatever is left is split by your
  budget bars. CONFIRMED.
- **Savings interest** (CONFIRMED): 10 × √savings per turn (but never more than
  half your savings); +50% after the "prime lending rate" radical discovery.
- **Debt interest** (CONFIRMED): 15% of the debt per turn, 10% after the
  "renegotiated credit" discovery.
- **Borrowing limit**: 5 times your last turn's income. CONFIRMED.
- **Can't pay** (CONFIRMED): if the pool can't cover interest, the rest comes out
  of savings down to the borrowing limit ("Having to borrow more…"). If even
  that isn't enough: every colony's temperature drifts away from ideal by an
  amount that grows with the shortfall ("Global warming is taking place!") and
  one random fleet is scrapped. If a losing colony can't be supported, savings
  pay for it ("Savings is being used to support…"); if that runs out, the
  colony loses population in proportion to the shortfall, stops growing that
  turn ("not receiving sufficient funds"), and is lost if it reaches zero.

## Planets

- **Maximum population** (CONFIRMED): 500,000 − 12 × H, but at least 10.
  +10% after the "sociologists" discovery.
- **Growth** (CONFIRMED). Below the maximum:
  - while a colony is losing more than $7,500 a turn, it grows by the smaller of
    (max ÷ 1,000) and (double its population), plus 0–5;
  - otherwise it grows by about max ÷ 20 plus up to max ÷ 100 more, or doubles
    if it's still small. That switch is what the **"baby boom"** message
    announces; it is not a random event. CONFIRMED.
  - "Growth rate has slowed" appears when it reaches its maximum.
  - Above the maximum it keeps creeping up by max ÷ 1,000 (plus a little). CONFIRMED.
- **New colonies** start with the colonists aboard (10 units per colony ship),
  an income of −$7,501, and a default budget of about $7,500 a turn, 90%
  terraforming / 10% mining (100% mining if gravity is over 2.56×). CONFIRMED.
- **"Never profitable"** means gravity more than 2.56 times (or less than
  1/2.56 of) your home's. CONFIRMED.
- **Terraforming** (CONFIRMED): the first $5,000 spent on a new colony's
  terraforming is absorbed as a one-off setup cost. After that, each turn moves
  the temperature by √(⅔ × money) tenths of a degree (√(⅞ × money) after the
  climatologist discovery). Any overshoot is refunded to savings.
- **Mining** (CONFIRMED): 20 × √money metal per turn (25 × after the
  archaeologist discovery). Money that would mine more than is left is refunded.

## Research

CONFIRMED:
- Each technology's share of the tech budget buys
  `0.8 × √(money ÷ 150)` points per turn (Mini: ÷200; Radical: 0.5 × √(money ÷ 200)).
  Because of the square root, spending steadily beats spending in bursts, as the
  manual says.
- Points needed for the next level, from current level L:
  Range ⌊L^2.5⌋ ÷ 3; Speed (L+6)²; Weapons and Shields (L+2)²; Mini and Radical (L+7)².
- Finishing a level throws in a free 0–40% of the next one (0–80% for Radical).
- Levels stop at 50.
- +10% research after the "new research facility" discovery.
- Each Radical level gained triggers one Radical discovery.

## Ships

**Costs** (CONFIRMED). With weapons W, shields S, range R, speed V, mini M:
- Base figure B = (13 + W) × (S + R + V + 38) ÷ 0.36.
  Satellites: B = 4.762 × (13 + W) × (26 + S). Decoys: 17 × (42 + R + V) ÷ 0.36.
- Mini factor m = 1 + M ÷ 2.
- Money = m × B; metal = B ÷ (3 × m) (Scouts divide by m + ½, so they are
  extra light on metal). So Mini makes ships dearer in money, cheaper in metal.
- Colony Ship: +$45,000 and +3,000 metal. Tanker: +$22,500 and +1,500 metal.
- Dreadnought: 40× the money, 25× the metal, 25× the hit points.
- Biological: 8 × B money, no metal.
- Decoy: one twentieth of the money, about one fortieth of the metal (+10), 1 hit point.
- **Prototype** (first ship of a new design): 4 × m times the normal price
  (Colony Ships and Tankers: 2 × m). Biological prototype 40 × B. CONFIRMED.
- Hit points: B ÷ 3 (Colony +1,000, Tanker +500). CONFIRMED.
- Example: the starting Fighter costs $2,000 and 666 metal ($8,000 for the
  prototype); a Colony Ship $47,000 and 3,666 metal.
- **Dreadnoughts are not locked behind technology** in the code: the computer
  players design them from the start. CONFIRMED for computers; INFERRED for
  humans (the build window code wasn't checked yet).
- **Scrapping** (CONFIRMED): humans get back 75% of the metal (87.5% after the
  recycling discovery); computer players get 100%.
- A planet can only build as many ships in a turn as it has population units.
  CONFIRMED (only matters for brand-new colonies).
- At most 24 ship designs at once ("assembly lines are full"). CONFIRMED.

## Movement

- Trip time = distance ÷ fleet speed, rounded up. CONFIRMED.
- A fleet can't leave if the trip is longer than its remaining fuel. CONFIRMED.
- Fleets can follow multi-star paths (waypoints). CONFIRMED.
  NOT IMPLEMENTED in the web app yet.

## Combat

CONFIRMED:
- A battle has no round limit: it goes on until nobody has anything left to
  shoot at.
- Everyone's ships are grouped by design. Groups fire in order of **Speed**,
  fastest first; the planet fires last. Ships destroyed earlier in the same
  speed step still get their shot.
- Shots per ship per round: 1; **Satellites 2; Dreadnoughts 25**.
  A planet gets one shot per 200,000 population (rounded up).
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
  plus a random 1–5. A group keeps shooting the same target group until it's gone.
- The planet uses its owner's Weapons and Shields tech.
- **Battle stances**: ships can be marked **Offensive** (+1 Weapons, −2 Shields)
  or **Defensive** (−2 Weapons, +1 Shields). The game's own tips say so:
  "Offensive ships attack better but defend worse." CONFIRMED.
  NOT IMPLEMENTED in the web app yet.
- **Arrive late**: ships marked late sit out a first exchange, then everyone
  fights again. CONFIRMED. (The web app has a "delayed" flag but doesn't use
  it this way yet.)
- **Luck in battles** (a game option): each side gets −1, 0 or +1 Weapons per
  battle; the "generals are smarter" discovery removes the −1. CONFIRMED.
  NOT IMPLEMENTED yet.
- **Debris**: one fifth of the metal of every destroyed ship. It goes to the
  planet's owner ("You recovered … metal") or falls onto the planet. CONFIRMED.

## Computer players

Every computer has a personality made of the same settings as a hidden
"Computer Attrs" window the developers left in the game's resources. CONFIRMED.

| Setting | Usual range | Dumb (IQ 1) | IQ 2 | IQ 3 | Diabolical (IQ 4) |
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

Research split: Range 16–20%, Speed 16–20%, Weapons 20–26%, Shields 20–26%
(never more than Weapons), Radical 2%, Mini gets the rest. When Range reaches
16, or Mini passes 1, they move budget into Weapons and Shields. CONFIRMED.

Some smart computers get one of two special personalities: a **turtle**
(heavy defence, almost never attacks) or a **pouncer** (little defence, attacks
in big fleets). CONFIRMED.

**Diabolical computers cheat**: before 2020 they know every star within 8
light-years of home, and they treat other computers' planets as a quarter as
attractive to attack as humans'. CONFIRMED. Computers above Dumb also never
pay prototype costs. CONFIRMED.

**Each turn, a computer** (CONFIRMED, 21 steps):
1. Splits mixed fleets apart.
2. Designs new ship types when its old ones fall too far behind its technology,
   and scraps unused old designs.
3. Works out how many colonies its income supports, a savings reserve it won't
   touch (the smaller of income × years-since-2000 ÷ 100 and income × savings
   goal), and splits its spare metal into a defence budget and an attack budget.
   The defence share drops by 5% every turn, so computers get more aggressive
   over time.
4. Sorts every star by what it knows: unexplored, free, enemy, friendly, its own
   (profitable / struggling / hopeless), and estimates threats near its colonies.
5–8. Moves outdated fleets home and dismantles them for metal; sends warships out.
9. Reacts to last turn's news (tech milestones, attacks, diplomacy).
10–16. Makes a priority list of wishes: research (priority 90), mining (75 on
   hopeless planets, 30 elsewhere), terraforming (70–80), colony ships, scouts,
   attacks (35 + 5 × aggressiveness), satellites (60).
17. Works down the list, spending this turn's budget on research, terraforming
   and mining, and its savings on ships.
18–21. Sends idle fleets home and turns its decisions into the same budget
   bars a human uses.

**Where to attack** (CONFIRMED): each candidate star scores points for
aggressiveness minus how strong the defence looks, a populated planet (+20,
+40 more if big), belonging to the richest rival (+25), metal and how livable it
is, and closeness; plus randomness. It attacks only with a fleet whose strength
is at least (enemy strength × attack-strength setting), building fighters (or
one Dreadnought, when that's about the right size) if needed, from its attack
metal budget.

**Where to colonize** (CONFIRMED): planets scored by
(metal-importance × metal + (100 − metal-importance) × livability). It
prefers free planets where its own ships are already parked (usually a scout).
It won't build anything but colony ships while it has less than 5,000 metal in
total, unless it already owns a colony ship.

**Alliances, surrender and gifts**: each computer keeps a friendliness score
for every other player (250–350 normally; Diabolical computers start at −50 to
0 toward humans and 350–450 toward other computers). The diplomacy steps were
located but not fully read yet. NOT IMPLEMENTED.

---

## Not yet investigated

- Which radical discovery happens, and how often each is picked.
- Random events: meteor showers, supernovas, wormholes, Armageddon, the
  "computer bug", the oil-tanker spill.
- Tanker refuelling and biologicals eating people.
- The exact rules for alliances, best buddies, surrender and gifts.
- Ship and planet pictures, fleet markers, sounds, exploration pictures.

---

## Technical appendix (addresses in the decompiled program)

All addresses are for the PowerPC code of version 5.0.5, analysed with Ghidra
11.4.2 (language PowerPC:BE:32:default). The program's TOC register r2 is
0x100f6630. Report messages are numbered 1000 + (line in STR# 6020 − 1).

| What | Function |
|---|---|
| Whole turn | FUN_10072a10 |
| Interest / debt | FUN_10054de0, FUN_100737b0 |
| Colony support | FUN_10073a80 |
| Terraforming and mining | FUN_10073d70, FUN_10055d90, FUN_10055e30 |
| Research | FUN_10074f90 |
| Population and colony income | FUN_10077200 |
| Colonizing | FUN_10078e80 |
| Dismantling fleets | FUN_10074580 |
| Star generation | FUN_1006f280 |
| Player setup / starting conditions | FUN_1006f640 (jump table at 0x10110ae8) |
| Ship costs | FUN_1007de60 (hit table at 0x100df00c) |
| Battle setup / rounds / shots / targets | FUN_1007e870, FUN_1007eed0, FUN_1007f7f0, FUN_1007f9f0, FUN_1007fe30, FUN_1007f430 |
| Star distances | FUN_100589f0 |
| Trip time | FUN_10075f10, FUN_1007c3a0 |
| Alliances / best buddies tests | FUN_100587a0, FUN_10058830 |
| Computer player main | FUN_10081cc0 (personality: FUN_100704d0) |
| Computer steps | FUN_10088eb0, 10086830, 10085f60, 10088460, 10088fd0, 10086f20, 100870a0, 100872a0, 10087530, 10081fa0, 10081fe0, 10082820, 10082bb0, 10083110, 10082690, 100839a0, 10083e30, 100843b0, 100845f0, 10085900, 10085bd0 |
