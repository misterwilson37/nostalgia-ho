# Spaceward Ho! 3.0.1 for the Macintosh: findings

Spaceward Ho! 3.0.1 (Delta Tao, 1993) is the first colour Mac version, a 68k program.
This file explains how the "Mac 3.0.1" ruleset (`js/rules-301.js`) was made and how it
differs from the Mac 5.0.5 rules in `js/rules-original.js`.

The program was decompiled from its resource fork with `tools/decompile/mac68k.py` and
`tools/decompile/Mac68k.java` (see `docs/decompiling.md`). MPW left a MacsBug name after
every routine, so functions are cited by name and by address in that layout (segment
*n* at *n* × 0x10000), for example `SpendTechMoney @a1ed2`. Text is cited by resource:
`STR# 1000.n` is the n-th report template, `DITL n` a dialog.

As in `405-findings.md`, every rule is labelled:

- **CONFIRMED**: read in the decompiled 3.0.1 code (or its resources), cited by
  function and address.
- **GUESS**: the decompile doesn't settle it, so the remake follows 5.0.5 (or 4.0.5)
  or makes a choice.
- **NOT IMPLEMENTED**: in 3.0.1 but not in the remake.

## The short version

3.0.1 is an **earlier build of the engine behind 4.0.5 and 5.0.5**. Its money model is
already 5.0.5's (a share of each turn's money goes to "Ship Savings", which ships are
bought from and which can go into debt), and its galaxy, battles and novas are already
4.0.5's. So the ruleset is built on the "Original" rules (`Object.assign` over
`rules-original.js`), borrows the 4.0.5 galaxy, battle and nova code from
`rules-405.js`, and uses the Original computer players (`js/ai-original.js`). The main
differences from 5.0.5 are:

- **Setup**: a Skill Level (Novice to Expert) instead of a Home System; one Computer
  Intelligence setting; up to 19 computers; no savings to start with.
- **Only four ship classes**: Scout, Fighter, Colony Ship and Satellite; 20 designs.
- **Cheaper research of Range but weaker research points**, dearer mining and
  terraforming (as in DOS 2.0).
- **Ships cost** a product of all four stats (as 4.0.5), prototypes cost half as much as
  5.0.5's, and Satellites are half as strong and shoot once.
- **Battles** are 4.0.5's duels with the DOS 2.0 hit table; luck is always on.
- **Radical tech** has six outcomes, rolled fresh each time (no hand of four).
- No stances, "arrive late", best buddies, tankers, dreadnoughts, biologicals, decoys,
  ranks or master points.

## Ruleset differences from 5.0.5

### Setup

| What | 3.0.1 | Status |
|---|---|---|
| Your start | a Skill Level (Join dialog, DITL 4010). Total Money for the first turn: Novice $51,000, Beginner $41,000, Normal $30,000, Advanced and Expert $20,000 (no random extra); metal 20,000 / 12,000 / 5,000 / 2,500 / 0; home population 750k / 625k / 500k / 350k / 350k. Ship Savings start at $0. Novice gets a Colony Ship and two Scouts, Beginner two Scouts | CONFIRMED (`CreatePlayer @f26a0`) |
| Borrowing limit | 5 × your income from the start (as 5.0.5) | CONFIRMED (`CreatePlayer`, `ComputeIncomeAndPopulation @a3bba`) |
| Home world, technology, head start, research split, budget | as 5.0.5: 0–200 °F, 0.5–2 G, 10,000 metal; tech 6/2/2/2/0/0 plus 0–40 (Radical 0–80); 167/…/166; Savings 650, Tech 250, home 100 (resource `Stup 1000`) | CONFIRMED (`CreatePlayer`) |
| Starting designs | Scout R8 V2 W1 S1, Satellite R0 V2 W2 S2, Colony Ship and Fighter R6 V2 W2 S2, all Mini 0. No Tanker | CONFIRMED (`CreatePlayer`) |
| Computers | 0–19 (`doCreateGalaxyDlg @f0550`, scroll range 0..0x13). One Computer Intelligence: Dumb, Average, Smart, Diabolical | CONFIRMED |
| Computers' start | Dumb starts like an Expert, Average like Advanced, Smart like Normal, Diabolical like a Novice. With several humans each computer copies a human's skill | CONFIRMED (`CreateNewPlayer @121fee`, `DoGameSolidificationStuff @a741a`). This settles the 4.0.5 "INFERRED" row the same way |
| Computer personalities | 5.0.5's (the remake's Original computer players) | GUESS (`SetCompAttrs @f32ec` not compared) |
| Options | Galaxy style, density, size, intelligence, number of computers, years per turn (10, 20, 30, 50, 100) and an Alliances check box. **No Luck and no Novas check boxes**: luck is always on and novas are on (option bit 2, set in the default `Stup 1000`) | CONFIRMED (DITL 6080, DITL 4120, `CheckForSupernova @a33cc`, `DoBattleStage @e0004`) |
| Gone | Home System, "Based on IQ", best buddies, ranks and master points (3.0.1 has a Hall of Fame and Hall of Shame instead) | CONFIRMED (no text or code) |
| Difficulty rating | a small number: intelligence (Dumb 2, Average 4, Smart 5, Diabolical 7) + skill − 2 (Novice −2 … Expert +2) − allies; +1 Small, −1 Humongous, −1 Sparse, −1 Spiral or Cluster, +1 with more than 8 computers unless Dumb, −1 with fewer than 4 computers and another −1 with fewer than 2; each Armageddon halves it, rounding up. 5 with no computers. Shown in the New Game window; it earns nothing | CONFIRMED (`AddToHall @144796`) |

### Galaxy

| What | 3.0.1 | Status |
|---|---|---|
| Styles, sizes, density, star counts | 4.0.5's: Circle, Random, Ring, Spiral, Grid, Cluster; Small to Humongous; Dense or Sparse; Grid 25/36/64/100/169, others 20 + 1–12 … 101–190 | CONFIRMED (`CreateGalaxy @f0004`) |
| Layout and distance | 4.0.5's: whole light-years, at least 4 ly apart, trunc((10 × longer + 3 × shorter + 9)/10), no shrinking at Armageddon | CONFIRMED (`Distance @11ef8`, `StarSafe @f2366`, `GiveGalaxyRandomCoords @f0eb8`, `GiveGalaxyGridCoords @f1c62`, `GiveGalaxyCircleCoords @f1032`, `AllocateHomeStars @f1d7e`) |
| Margin | the map starts 2 ly from the left and 4 ly from the top (4.0.5: 4 and 4) | CONFIRMED (`ConformCoordinates @f1fb6`) |
| Spiral and Cluster | laid out in 2010, once every player has joined ("Map will be created in 2010.", STR# 1005.27); the remake knows the players at the start, so it lays them out then | CONFIRMED (`CreateGalaxy` uses `GiveGalaxyTemporaryCoords @f0df2` for both) |
| Circle's last ring | 3.0.1 squeezes the last few stars of the outer ring differently | NOT IMPLEMENTED (the 4.0.5 circle is used) |
| Star stats | as 5.0.5 | CONFIRMED (`GiveStarsValues @f246c`) |
| Star names | 3.0.1's own list of 191 (STR# 1003, nearly the DOS 2.0 list), at most 7 letters | CONFIRMED (`GiveStarsValues`) |

### Money

3.0.1's budget is 5.0.5's: each turn's Total Money (last turn's income) pays interest and
the support of losing colonies, then is shared out between Ship Savings, Technology and
the colonies; ships are bought at once from Ship Savings, down to the borrowing limit.

| What | 3.0.1 | Status |
|---|---|---|
| Interest | 10 × the whole square root of Ship Savings, with no "half of savings" cap and no prime-rate bonus; debt costs 15% | CONFIRMED (`ComputeIncomeAndPopulation @a3bba`, `DeductInterest @a0e32`) |
| Paying interest, supporting colonies, global warming, a fleet scrapped for lack of funds | as 5.0.5 ("Warning! Ship money is being used to support …") | CONFIRMED (`DeductInterest`, `MaintainKillStars @a10c8`) |
| Terraforming | the first $5,000 goes into the planet; then the money moves the temperature √(money / 2) tenths of a degree (5.0.5: √(2/3 money)), √(3/5 money) with the radical bonus. The overshoot is refunded at 2 × d² (5/3 × d²). The "never profitable" warning comes every turn | CONFIRMED (`TerraformMineStars @a129a`) |
| Mining | 15 × the whole square root of the money (5.0.5: 20 × √), 18 × with the radical bonus. A mined-out planet refunds the unneeded money: ⌈m²/225⌉ (⌈m²/324⌉), above 30,000 metal ⌈m/225⌉ × m | CONFIRMED (`TerraformMineStars`, `MetalToMoney @13676`) |
| Growth, maximum population, the +10% bonus | as 5.0.5 | CONFIRMED (`ComputeIncomeAndPopulation`) |
| Income | as 5.0.5, except the log is of the *whole* square root of the population | CONFIRMED (`ComputeIncomeAndPopulation`, SANE calls) |
| New colonies | as 5.0.5: 10 colonists per colony ship, terraform 900 / mine 100 (mine all when gravity is more than 2.56 times home's), a $7,500 share when Total Money is above $20,000 | CONFIRMED (`ColonizeStar @a566a`) |
| Meteor showers | metal × 50 units killed; nobody escapes onto colony ships | CONFIRMED (`ComputeIncomeAndPopulation`) |
| Dip into savings | 3.0.1 asks for an amount, up to Ship Savings minus the borrowing limit, and moves it into this turn's money at once. The remake keeps 5.0.5's percentage | CONFIRMED (`DipIntoSavings @f41cc`); the percentage GUESS |
| Fix Spending | a menu command that rebalances overspent and underspent colonies | NOT IMPLEMENTED (STR# 1050) |

### Research

| What | 3.0.1 | Status |
|---|---|---|
| Points | the whole square root of (money ÷ divisor), × 8/10; Radical ÷ 2 (5.0.5: 0.8 × and 0.5 × the exact root). Divisors: Range 120, Speed, Weapons and Shields 150, Mini and Radical 200 (5.0.5: Range 150) | CONFIRMED (`SpendTechMoney @a1ed2`) |
| Level costs | Range L² (5.0.5: L^2.5/3); Speed (L+6)², Weapons and Shields (L+2)², Mini and Radical (L+7)² as 5.0.5. Head start on reaching a level 0–40 (Radical 0–80) | CONFIRMED |
| Gone | the research facility and the clamp of progress at 6,000 | CONFIRMED |
| No research money | "You are not spending any money on technology research." every turn (5.0.5: every 5th) | CONFIRMED |
| Messages | "Your Range Technology has reached level N." | CONFIRMED (STR# 1000.3–7) |

### Radical discoveries

| What | 3.0.1 | Status |
|---|---|---|
| How one is chosen | no hand of pending discoveries: each new Radical level rolls 0–99 and tries again if the result can't be used | CONFIRMED (`DoSomethingRadical @a5d4e`) |
| 0–9: metal | 1,000–3,000 metal; the message divides it among your colonies (5.0.5: 9,000–11,000) | CONFIRMED |
| 10–19: astronomers | 6–9 stars you haven't had news of in 100 years, walking on one star at a time from a random one (no "6 unexplored stars" condition) | CONFIRMED |
| 20–39: a one-time bonus | five tries at mining, maximum population, terraforming or smarter generals that you don't have yet; the first try counts only before the year 3000 | CONFIRMED |
| 40–49: steal tech | the best level of a tech, starting from a random one | CONFIRMED |
| 50–59: free designs | Scout, Fighter, Satellite and Colony Ship at your tech, with no development cost, while you have fewer than 17 designs; otherwise a tech jump | CONFIRMED |
| 60–99: a tech jumps two levels | a random one of the five | CONFIRMED |
| Gone | money, recycling, research facility, prime rate, cheaper credit, decoys, biologicals | CONFIRMED |
| The colour-monitor joke | in a random year from 2000 to 5000, on a black-and-white screen | NOT IMPLEMENTED (`AddEasterEggs @b0004`, STR# 1000.96) |

### Ships and fleets

| What | 3.0.1 | Status |
|---|---|---|
| Classes | Scout, Fighter, Colony Ship, Satellite | CONFIRMED (STR# 1006, `CalcShipCosts @134de6`) |
| Design limit | 20 | CONFIRMED (DITL 3280) |
| Cost base | B = (R+10)(V+15)(W+13)(S+17)/38.75 (as 4.0.5); a Satellite's B is 2.381 (W+13)(S+26), half of 5.0.5's, so it costs and endures half as much | CONFIRMED (`CalcShipCosts`; the 4.0.5 help's "Additions from 3.0 to 4.0" says satellites became twice as hard to kill and twice as dear) |
| Price, metal, hit points | mm × B, B / 3mm, B / 3, with mm = (Mini+1)/2 + 0.5; Colony Ship +$45,000, +3,000 metal, +1,000 hp. No extra metal divisor for Scouts | CONFIRMED |
| Prototype | 2 mm² B (5.0.5: 4 mm² B); Colony Ship 2 mm × price, as 5.0.5 | CONFIRMED |
| Who pays development costs | humans, and Dumb and Average computers (5.0.5: only Dumb) | CONFIRMED (`BuildAFleet @92fc2`) |
| Attack rating | max(W² × hp/50, W² × hit(W) × (5W+20)/300), not divided by 50; the remake divides it so the 5.0.5 computer players keep their scale | CONFIRMED formula; the scale GUESS |
| Design sliders | Range 3 to your Range (Scout +2, Satellite 0), Speed 1 to tech (a Satellite's fixed at your Speed), Weapons and Shields 1 to tech (Scout −1), Mini 0 to tech (5.0.5: Scout +3) | CONFIRMED (`SetSBMinMax @132792`) |
| Fuel, colony ships, wormholes | as 5.0.5: fleets refuel at your own and your allies' colonies; colony ships reload colonists at your colonies; a fleet arriving at an exploded star is lost | CONFIRMED (`ColonizeAndExplore @a4414`, `MoveShips @a26ac`) |
| Routes | 3.0.1 plans a route through your colonies and plans it again at every stop ("Your … can no longer reach …"); the remake uses its 5.0.5 waypoints | CONFIRMED (`CheckFleetDestination @a2b8e`, `DeterminePath @130686`); re-planning NOT IMPLEMENTED |
| Fleets | one design per fleet, grouped to move together; the remake's mixed fleets stand in for groups | GUESS |
| Scrapping | humans get 3/4 of the metal, computers all of it; in hyperspace it falls on the next star as a meteor shower; over someone else's colony it goes to that colony's owner later in the turn ("You just received … metal from someone scrapping a fleet over …") | CONFIRMED (`ScrapFleetsAndTypes @a194e`, `GetOtherScrapMetal @a3abe`) |
| Automatically scrapping old designs past 15 | a preference | NOT IMPLEMENTED |

### Battles

| What | 3.0.1 | Status |
|---|---|---|
| Who fights | 4.0.5's duels: the colony's owner defends, the others are shuffled and each fights the current holder; allies take turns | CONFIRMED (`DoBattleStage @e0004`, `AreAllies @e09d2`, `EverybodyNotAllied @e0a56`) |
| Luck | −1, 0 or +1 Weapons for each side in each duel, **always on**; smarter generals never get −1 (the black cat and the horseshoe) | CONFIRMED (`DoBattleStage`) |
| Order of fire | rounds until one side is gone; fastest first, the attacker's groups then the defender's at each speed; ships hit during a speed still fire in it; the planet fires only as its side's last group | CONFIRMED (`DoOneBattle @e0aee`) |
| Hit table | resource `MaTh 1002` "Weapon Ratios": 1% at W−S ≤ −22, 25% at −1, 50% at 0, 74% at +1, 98% at +22 (the DOS 2.0 table) | CONFIRMED (`HaveGroupShoot @e1cc2`, `CalcShipCosts`) |
| A shot | hit × (0–20 + 5W + 10); ÷ 6 against ships (at least 1), × 4 against the planet; leftover damage is lost | CONFIRMED (`HaveGroupShoot`) |
| Shots | every ship fires once a round, satellites too (5.0.5/4.0.5: twice); the planet once, with your Weapons (+ luck) and Shields tech and its population as hit points | CONFIRMED (`CalcOneGroup @e17e4`, `DoBattleStage`) |
| Targets | colony ships first, then satellites, then a ship group from a random start, the planet last | CONFIRMED (`PickTarget @e250e`) |
| Groups | each side's ships are cut into at most 5 groups of equal size | NOT IMPLEMENTED (`CalculateGroups @e1614`; the remake keeps one group per design) |
| Debris, big-battle rumour | as 4.0.5 | CONFIRMED (`DoOneBattle`, `DetectBigBattles @a4a20`) |
| Stances, "arrive late" | not in 3.0.1 | CONFIRMED (no text or code) |

### Events

| What | 3.0.1 | Status |
|---|---|---|
| Red stars and supernovas | as 4.0.5: after 2749 a 1% chance a turn, one at a time, 3–10 turns of warning to every player, no miracle; metal and shock wave as 5.0.5 | CONFIRMED (`CheckForSupernova @a33cc`, `ReactToSupernova @a3702`) |
| Armageddon | when every human has switched it on, half the quiet stars go supernova the next turn; no shrinking | CONFIRMED (`CheckForArmageddon @a3268`) |
| Volcanoes, revolts, metal disappearing, the "computer bug" | their text is in the program (STR# 1000.14, .17, .72, .77) but nothing shows them | CONFIRMED (no caller) |

### Diplomacy and the end of the game

| What | 3.0.1 | Status |
|---|---|---|
| Alliances (option), gifts, surrender, alliance victory | all present: at most 3 gifts a turn; "Your alliance will win the game next turn if it holds!". The details follow 5.0.5 | present and the gift limit CONFIRMED (STR# 1000.78–106, STR# 1020.21); the details GUESS (`ConformPlayerAlliances @a2f76`, `DoSurrenders @a482a`, `CheckForWinner @a731a` not compared step by step) |
| Messages | canned messages ("I Want", "Let's Attack", …), at most 10 a turn | CONFIRMED (STR# 3000, STR# 1020.17) |
| Hall of Fame and Hall of Shame, naming a star after a win | | NOT IMPLEMENTED |

## Changes to the shared code

The ruleset needed a few hooks; none changes the other rulesets:

- `rules-original.js`: `economy()` takes `opt.terraStep`, `opt.terraCost`,
  `opt.mineMetal`, `opt.mineMoney` and `opt.terraWarnAlways`, and `afterMovement()`
  takes `opt.incomeU`.
- `rules-405.js`: `battle()` asks the active ruleset for `hit`, `designCost`,
  `shotsPerShip` and `planetShots` (4.0.5's own values are unchanged).

## Still unclear

- The 3.0.1 computer players (`DoComputerTurn @90004` and its segment) were not
  compared with 5.0.5's. The remake uses the 5.0.5 ones, with 3.0.1's mining and
  terraforming prices.
- `SetCompAttrs @f32ec` (computer personalities) was not compared.
- How the 3.0.1 planet window splits a colony's money: 3.0.1 uses a pie chart with
  terraforming and mining only (`RestoreStarsBars @a2e4c`); the "Ship" bar label in
  STR# 1005 seems to be unused.
- The exploration sounds and star ratings (`ExploreStar @a549e`) were not compared.
