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
  technology split evenly six ways. CONFIRMED.
- Home planet: 0 to 200°F, 0.5 to 2.0 G, 10,000 metal, and already perfect for
  its owner. Your ideal temperature and gravity are defined as your home
  world's. CONFIRMED.
- Advanced, Thriving and Abundant get two free Scouts. Thriving and Abundant
  get a free Colony Ship. Abundant also gets a second small colony next door
  (5,000 population, 2,500 metal, 50–100°F off, 20–50% off in gravity).
  CONFIRMED.
- Starting ship designs: Scout (Range 9, Speed 2, Weapons 1, Shields 1),
  Tanker (Range 5, Speed 1, Weapons 2, Shields 2), and Satellite, Colony Ship
  and Fighter (Range 6, Speed 2, Weapons 2, Shields 2), all with Mini 0.
  CONFIRMED.

## 4. Money

- **Income from a colony** (CONFIRMED):
  population × max(1, ln(√population)) ÷ 76, minus upkeep of
  7,500 + population × (100 + H ÷ 40) ÷ 10,000. **H** is the planet's
  "hostility", explained next. A Normal home world (500,000 people, H = 0)
  earns about $30,700. That matches the hard-coded starting income of
  $30,000, a good sign the formula is right.
- **Hostility H** (CONFIRMED): take the gravity ratio as a percentage. It is
  always 100 or more, so 1.5× either way is 150. Take the temperature gap in
  tenths of a degree. Then H = ((ratio − 100) × 12,000 + gap²) ÷ 100.
- **Disposable income** (CONFIRMED):
  1. Each turn, the incomes of your profitable colonies are pooled.
  2. Positive interest is added to the pool, not to savings.
  3. Interest you owe is paid from the pool first.
  4. Colonies running at a loss are paid for next.
  5. Whatever is left is split by your budget bars.
- **Savings interest** (CONFIRMED): 10 × √savings per turn, but never more than
  half your savings. +50% after the "prime lending rate" discovery.
- **Debt interest** (CONFIRMED): 15% of the debt per turn, 10% after the
  "renegotiated credit" discovery.
- **Borrowing limit**: 5 times your last turn's income. CONFIRMED.
- **Dip into savings**: you can set a share of savings to be added to this
  turn's spending. CONFIRMED.
- **Can't pay** (CONFIRMED):
  - If the pool can't cover interest, the rest comes out of savings, down to
    the borrowing limit ("Having to borrow more…").
  - If even that isn't enough, every colony's temperature drifts away from
    ideal by an amount that grows with the shortfall ("Global warming is
    taking place!"), and one random fleet is scrapped.
  - If a losing colony can't be supported, savings pay for it ("Savings is
    being used to support…").
  - If that runs out, the colony loses population in proportion to the
    shortfall and stops growing that turn ("not receiving sufficient funds").
    It is lost if it reaches zero.

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
- **Terraforming** (CONFIRMED):
  - The first $5,000 spent on a new colony's terraforming is absorbed as a
    one-off setup cost.
  - After that, each turn moves the temperature by √(⅔ × money) tenths of a
    degree, or √(⅞ × money) after the climatologist discovery.
  - Any overshoot is refunded to savings.
- **Mining** (CONFIRMED): 20 × √money metal per turn (25 × after the
  archaeologist discovery). Money that would mine more than is left is
  refunded.
- **Evacuating** a planet removes its people and gives up the colony.
  INFERRED from the menu item and the manual; the code wasn't read.

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
| Better mining (archaeologists) | 4% | once only, before the year 3000 |
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
- **Scrapping** (CONFIRMED): humans get back 75% of the metal (87.5% after the
  recycling discovery); computer players get 100%.
- **Scrapping in hyperspace** (CONFIRMED): ships dismantled mid-trip rain
  their metal onto their destination the next turn as a **meteor shower**. It
  kills people there; anyone who fits aboard your colony ships in orbit
  escapes. This is the only cause of meteor showers.
- A planet can only build as many ships in a turn as it has population units.
  CONFIRMED. (It only matters for brand-new colonies.)
- At most 24 ship designs at once ("assembly lines are full"). CONFIRMED.

## 8. Movement and fuel

- Trip time = distance ÷ fleet speed, rounded up. CONFIRMED.
- A fleet can't leave if the trip is longer than its remaining fuel.
  CONFIRMED.
- Fleets refuel fully at your own and your allies' colonies. CONFIRMED.
- **Multi-star paths** (CONFIRMED): a fleet can be given a route. It stops at
  each star to refuel and waits if it can't reach the next one yet.
- **Arrival notices**: you are told when your fleets arrive, stop on the way,
  or are fully refuelled and ready to go on. CONFIRMED.
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
- **Arrive late**: ships marked late sit out a first exchange, then everyone
  fights again.
- **Luck in battles** (a game option): each side gets −1, 0 or +1 Weapons per
  battle. The "smarter generals" discovery removes the −1.
- **Debris**: a fifth of the metal of every destroyed ship. It goes to the
  planet's owner ("You recovered … metal") or falls onto the planet.
- Allies at the same star fight side by side.

## 10. Novas, supernovas, Armageddon and other events

- **Novas** (CONFIRMED):
  - From the year 2750, about once in 99 turns, an unowned star starts to
    "grow and turn bright red". Only one star does this at a time.
  - A red star gets closer to exploding every turn.
  - A star someone owns has a 6% chance each turn of being saved ("It's a
    miracle!"; others see "Wow, that's weird!").
- **Supernova** (CONFIRMED):
  - The star and everything at it are destroyed.
  - Stars within 10 ly are pelted with metal, more the closer they are.
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
  - With fewer than two quiet stars it fizzles ("not enough mass").
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
- **Gifts**: up to three a turn, of money or metal. They arrive at the end of
  the turn.
- **Messages**: the original has canned phrases ("I like you", "Thank you!",
  "Sorry!", "#!$@*$&@•™!" and so on). The computers react to some of them
  (section 12).
- **Surrender** (CONFIRMED):
  - You can surrender to a player or to no one.
  - Your fleets are dismantled.
  - The player you surrender to gets your savings plus a turn's income, your
    metal, and your planets.
  - A planet is handed over only if no enemy of theirs is sitting at it.

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
  two. A **turtle** defends heavily and almost never attacks. A **pouncer**
  defends little and attacks in big fleets. CONFIRMED.
- **Diabolical computers cheat** (CONFIRMED):
  - Before 2020 they know every star within 8 light-years of home.
  - They treat other computers' planets as a quarter as attractive to attack
    as humans'.
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
- When it changes its mind it may say "I like you." or "I hate you."
- **Surrender**: after 2500, with Alliances on and at least three players
  left, a computer that is broke, or the poorest by far (under a third of the
  next poorest's income), surrenders to the player it likes best. Pouncers
  never surrender.

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
  most 10,000,000. That is 1 point at difficulty 30, about 100 at 72 (the
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
| Ship picture builder / special pictures | FUN_100ad750 / FUN_100af8e0 (sheet PICT 11000, mask 11001) |
| Planet picture | FUN_10090170 (sheet PICT 10000) |
| Fleet markers | FUN_10091640 |
| Message picture / message sound | FUN_1009d670 / FUN_1009cff0 (jump table at 0x10112ee8) |
| Sound player | FUN_10095690 |
| Sine and cosine tables | 0x100de4cc, 0x100dea6c |

Tools used are in `tools/extract/`. The web app's `js/rules-original.js` and
`js/ai-original.js` name the original routine next to each rule.
