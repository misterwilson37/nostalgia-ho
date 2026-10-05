# Spaceward Ho! 3.0.1 for the Macintosh: findings

Spaceward Ho! 3.0.1 (Delta Tao, 1993) is the first colour Mac version, a 68k program.
This file explains how the "Mac 3.0.1" ruleset (`js/rules-301.js`, with its computer
players in `js/ai-301.js`) was made, rule by rule, from 3.0.1's own code.

The program was decompiled from its resource fork with `tools/decompile/mac68k.py` and
`tools/decompile/Mac68k.java` (see `docs/decompiling.md`). MPW left a MacsBug name after
every routine, so functions are cited by name and by address in that layout (segment
*n* at *n* × 0x10000), for example `SpendTechMoney @a1ed2`. Text is cited by resource:
`STR# 1000.n` is the n-th report template (report code 0x3e8 + n − 1), `DITL n` a
dialog. Every routine of the program is listed in `docs/coverage-301.md`; the questions
the code leaves open are in `docs/open-questions.md`, and what changed from 2.0 in
`docs/evolution.md`.

Every rule is labelled:

- **CONFIRMED**: read in the decompiled 3.0.1 code (or its resources), cited by
  function and address.
- **NOT IMPLEMENTED**: in 3.0.1 but not in the remake (all of these are interface:
  windows, menu commands, preferences).

No rule of this ruleset falls back on another version: where it uses 2.0's code
(`js/rules-dos.js`) or 4.0.5's (`js/rules-405.js`), the 3.0.1 routine was read and does
the same (see "Inherited rules audit" at the end).

## The short version

3.0.1 is **2.0's game with a new money model and new events**. Its turn is 2.0's turn,
routine for routine (`EndTurn @a0004`: for each player in turn the computer plans, then
the money, terraforming and mining, research and moves; then every battle; then for each
player income, colonizing and exploring), worked out with 2.0's arithmetic: budget
shares per mille used as they stand (the $2,000,000 rule), colony bars per mille with −1
for a finished part, a new colony's share found by redistribution, a lost colony's share
going to Savings with its colony ships loaded, battles fought as duels, routes planned
again at every stop. So the ruleset is built over the "DOS 2.0" rules
(`Object.assign` over `rules-dos.js`). What 3.0.1 added on top:

- **Ship Savings**: a share of each turn's money goes to Ship Savings, which earn
  interest, pay for ships at once (no shipyard queues) and can go into debt down to a
  borrowing limit; losing colonies are paid for out of this turn's money first.
- **Setup**: a Skill Level (Novice to Expert), one Computer Intelligence setting, up to
  19 computers, the 4.0.5 galaxy generator (six styles, five sizes).
- **Only four ship classes**: Scout, Fighter, Colony Ship and Satellite; 20 designs,
  4.0.5's cost formula with 2.0's hit table.
- **Radical tech** with six outcomes; **alliances**, gifts, surrender and canned
  messages; **novas** and **Armageddon**; **luck** in battle.
- **Its own computer players**: 1.2's and 2.0's scheme grown up (see "Computer players").
- **Its own end of the game**: an alliance wins only if it holds for a turn; a player
  who is out has its fleets scrapped.
- No stances, "arrive late", best buddies, tankers, dreadnoughts, biologicals, decoys,
  ranks or master points (those are later).

## The turn

CONFIRMED (`EndTurn @a0004`, read in the disassembly). Each End Turn runs this once per
10 years of the turn (`PerformEndTurn @1216e8`). The players go in their slot order,
computers first (`CreateNewPlayer @121fee` numbers the computers 0.. and the humans
after them; the remake numbers humans first, so the ruleset's loops go computers first).

**Pass 1, for each player** (@a02a0-a0596):
1. "Year %d:" (report 1011, STR# 1000.12) opens its reports (@a033e).
2. A computer, or a human on auto play, plans (`DoComputerTurn @90004`; only while
   the player's state is below 4, so not once it is out).
3. `SurrenderIfDesired @a1760`, `DeductInterest @a0e32`, `ScrapFleetsAndTypes @a194e`
   (marked fleets and designs; every fleet of a player who is out, @a1ae8),
   `MaintainKillStars @a10c8` (colonies marked to be abandoned, then losing colonies
   paid or starved), `TerraformMineStars @a129a`, `SpendTechMoney @a1ed2`,
   `SaveComparisonInfoOne @a65bc`, `MoveShips @a26ac`, `RestoreStarsBars @a2e4c`.

**Between the passes** (@a0600-a0618): `DoBattleStage @e0004` (every battle),
`CheckForArmageddon @a3268`, `CheckForSupernova @a33cc`.

**Pass 2, for each player** (@a0628-a0d64): the Armageddon reports,
`ReactToSupernova @a3702`, `GetOtherScrapMetal @a3abe`, `ComputeIncomeAndPopulation
@a3bba`, `ColonizeAndExplore @a4414`, `DetectBigBattles @a4a20`, `DoSurrenders @a482a`,
the reports and gifts between players, the net floored at 0 ("After supporting your
planets and paying your interest, you have no money to spend!", 1000.105, @a0bdc) and
the money clamped (@a0bdc-a0c9c), `NoteShipPowers` (never read), `DoGameEndStuff
@a6d06`, `ConformPlayerAlliances @a2f76` (players still in), `RestoreStarsBars`,
`SetPlanetDisplayValues @a4b60`, `SaveComparisonInfoTwo @a663c`.

Then `CheckForWinner @a731a`. The remake runs every computer's plan before the money of
pass 1 rather than in each player's turn (see `docs/open-questions.md`).

## The rules

### Setup

| What | 3.0.1 | Status |
|---|---|---|
| Your start | a Skill Level (Join dialog, DITL 4010). Total Money for the first turn: Novice $51,000, Beginner $41,000, Normal $30,000, Advanced and Expert $20,000 (no random extra); metal 20,000 / 12,000 / 5,000 / 2,500 / 0; home population 750k / 625k / 500k / 350k / 350k. Ship Savings start at $0. Novice gets a Colony Ship and two Scouts, Beginner two Scouts | CONFIRMED (`CreatePlayer @f26a0`) |
| Borrowing limit | 5 × your income from the start (as 5.0.5) | CONFIRMED (`CreatePlayer`, `ComputeIncomeAndPopulation @a3bba`) |
| Home world, technology, head start, research split, budget | as 5.0.5: 0–200 °F, 0.5–2 G, 10,000 metal; tech 6/2/2/2/0/0 plus 0–40 (Radical 0–80); 167/…/166; Savings 650, Tech 250, home 100 (resource `Stup 1000`) | CONFIRMED (`CreatePlayer`) |
| Starting designs | Scout R8 V2 W1 S1, Satellite R0 V2 W2 S2, Colony Ship and Fighter R6 V2 W2 S2, all Mini 0. No Tanker | CONFIRMED (`CreatePlayer`) |
| Computers | 0–19 (`doCreateGalaxyDlg @f0550`, scroll range 0..0x13). One Computer Intelligence: Dumb, Average, Smart, Diabolical | CONFIRMED |
| Computers' start | Dumb starts like an Expert, Average like Advanced, Smart like Normal, Diabolical like a Novice, every computer the same: no random step down or up (4.0.5 has one). `CreatePlayer` sets the money, metal, people and free ships from that skill when the computer is created. With several humans `DoGameSolidificationStuff` later copies a human's skill onto each computer, but by then the start is set, so only the skill shown (and the difficulty rating) changes; the remake doesn't show computers' skills | CONFIRMED (`CreateNewPlayer @121fee`, jump table at `122128`: Dumb 4, Average 3, Smart 2, Diabolical 0; `CreatePlayer @f26a0` reads player +0x308; `DoGameSolidificationStuff @a741a`). The remake used to give the computers the humans' start in a hot-seat game; fixed |
| Computer personalities | 3.0.1's own; see "Computer players" | CONFIRMED (`SetCompAttrs @f32ec`) |
| Computer names | a man or a woman with even odds, named at random from STR# 1999 (Peter, Joe, Timmer, Howard, Bob, Ed, Mike, Guy, Ben, Dan, Kon, Robert, Clinton, Mike, Dave, Steve, Rosko, Willy, Jack, Albert) or STR# 2000 (Christie … Grace, 20 names), no two alike | CONFIRMED (`CreateNewPlayer @121fee`: `RND(0,1) × 500`; `DoGameSolidificationStuff @a741a`) |
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
| Circle's last ring | as 4.0.5, except: when fewer stars are left than the ring has places and no more than a quarter ring's worth (90 ÷ angle step), 3.0.1 goes back and lays the last 90 ÷ step stars out again, evenly round that ring (re-placing some of the ring before). Ring, Random, Grid, Spiral and Cluster are 4.0.5's | CONFIRMED (`GiveGalaxyCircleCoords @f1032`, `GiveGalaxyRingCoords @f12c0`) |
| Star stats | as 5.0.5 | CONFIRMED (`GiveStarsValues @f246c`) |
| Star names | 3.0.1's own list of 191 (STR# 1003, nearly the DOS 2.0 list), at most 7 letters | CONFIRMED (`GiveStarsValues`) |

### Money

Each turn's Total Money (last turn's income, player +0) pays interest and the support
of losing colonies, then is shared out between the budget slots: Ship Savings,
Technology and the colonies; ships are bought at once from Ship Savings, down to the
borrowing limit. The shares are 2.0's.

| What | 3.0.1 | Status |
|---|---|---|
| Budget slots | Savings, Technology, then the colonies, the newest first (a new colony's slot goes in front of the other colonies). Each slot's share is a whole per mille, used as it stands (the shares need not add up to 1,000) | CONFIRMED (`CreatePlayer @f26a0`, `ColonizeStar @a566a`) |
| A share of an amount M | trunc(M × pm ÷ 1,000) while M is under $2,000,000, trunc(M ÷ 1,000) × pm above (2.0's rule) | CONFIRMED (`TerraformMineStars @a1318-a1360`, `SpendTechMoney @a1f5a-a1fa2`, `ComputeIncomeAndPopulation @a3c1a-a3ca0`) |
| Setting one share | the others (but colonies being abandoned or finished) give it up, or take it up, in proportion, ⌈left × share ÷ total⌉ each, round after round, none below 0 nor above the colony's most (⌈cost of finishing ÷ net × 1,001⌉; 1,000 for Savings and Technology; 0 for a colony being abandoned or finished); a total outside 990–1,010 is then brought to 1,000 one per mille at a time | CONFIRMED (`GiveBarPercent @d1d40`, `DetermineNewLevels @d1e1e`, `ComputeMaxPercent @d28f8`, `ComputeMinPercent @d2a94`) |
| Dragging a budget bar | the same, with every other slot between 0 and 1,000; 3.0.1 does it at every step of the drag, the remake once, from where the drag began | CONFIRMED (`DoHBarClick @d18a0`; `rs.dragShare`) |
| Interest | 10 × the whole square root of Ship Savings, with no "half of savings" cap and no prime-rate bonus; debt costs 15% | CONFIRMED (`ComputeIncomeAndPopulation @a3bba`, `DeductInterest @a0e32`) |
| Paying interest, supporting colonies, global warming, a fleet scrapped for lack of funds | as 5.0.5 ("Warning! Ship money is being used to support …") | CONFIRMED (`DeductInterest`, `MaintainKillStars @a10c8`) |
| Terraforming | the first $5,000 goes into the planet; then the money moves the temperature √(money / 2) tenths of a degree (5.0.5: √(2/3 money)), √(3/5 money) with the radical bonus. The overshoot is refunded at 2 × d² (5/3 × d²). The "never profitable" warning comes every turn | CONFIRMED (`TerraformMineStars @a129a`) |
| Mining | 15 × the whole square root of the money (5.0.5: 20 × √), 18 × with the radical bonus. A mined-out planet refunds the unneeded money: ⌈m²/225⌉ (⌈m²/324⌉), above 30,000 metal ⌈m/225⌉ × m | CONFIRMED (`TerraformMineStars`, `MetalToMoney @13676`) |
| Growth, maximum population, the +10% bonus | as 5.0.5 | CONFIRMED (`ComputeIncomeAndPopulation`) |
| Income | as 5.0.5, except the log is of the *whole* square root of the population | CONFIRMED (`ComputeIncomeAndPopulation`, SANE calls) |
| New colonies | 10 colonists per colony ship; income −$7,501 until worked out (the net drops by as much); bars Terraform 900 / Mine 100 (Mine 1,000 when gravity is more than 2.56 times home's); at your own temperature Terraform is done and $5,000 counted as sunk, with no metal Mine is done; its share is set to 7,500,000 ÷ Total Money per mille when the money is over $20,000 (none if both parts are done) | CONFIRMED (`ColonizeStar @a566a`, `GiveBarPercent`) |
| Giving up a colony | its colony ships at the star are loaded, its share goes to Savings, its slot is taken out, the star is nobody's | CONFIRMED (`DecolonizeStar @a5ac0`, 2.0's `FUN_1040_38c0`) |
| Abandon | a toggle on the colony (Galaxy menu): on, its income comes off the net and its share goes to 0 (the others take it up); off, the income goes back; confirmations for a profitable or nearly profitable colony (DITL 3410, 3420) and two jokes for a star named "Hope" or "Ship" (DITL 3020, 3030). The colony is given up at the start of the money at End Turn ("You have abandoned %s.", 1000.9). The remake's Evacuate button is this command | CONFIRMED (`DoGalaxyMenu @f3ece-f4110`, `MaintainKillStars @a10c8`) |
| Meteor showers | metal × 50 units killed; nobody escapes onto colony ships | CONFIRMED (`ComputeIncomeAndPopulation`) |
| Dip into savings | an amount, up to Ship Savings minus the borrowing limit (so into debt), moves into this turn's money at once and the interest is worked out again on what is left; once (nothing is dipped next turn) | CONFIRMED (`DipIntoSavings @f41cc`). The remake's Dip window gives a percentage: here it is that percentage of the most you may dip (interface) |
| Interest after buying | buying a ship works the interest out again on the Ship Savings left (a computer's buying doesn't) | CONFIRMED (`BuildAShip @132e04`, `BuildAFleet @92fc2`) |
| Fix Spending | a menu command that rebalances overspent and underspent colonies | NOT IMPLEMENTED: interface (STR# 1050) |
| A colony's money | split by two bars, Terraform and Mine (slot +2, +4), per mille, −1 for a finished part; a bar above 0 is spent whether the planet still needs it or not. At the end of each pass the bars above 0 are scaled to 1,000, and with none above 0 the one not done gets 1,000. The home colony starts at Terraform −1, Mine 1,000. The "Ship" bar of STR# 1005 is unused | CONFIRMED (`RestoreStarsBars @a2e4c`, 2.0's `FUN_1040_269d` with two bars; `TerraformMineStars @a129a`; `CreatePlayer @f26a0`) |
| Bars set right | at the end of pass 2, for each colony: at your own temperature Terraform is set done (and Mine, if not done, to 1,000); moved away from it (global warming) with Terraform done, Terraform gets 1,000 less Mine; out of metal, Mine is set done (and Terraform, if not done, to 1,000). A colony with both done is marked finished (slot +0x10) and its share is given to the others | CONFIRMED (`SetPlanetDisplayValues @a4b60`, called at `EndTurn @a0d0a`) |
| Refunds | a terraforming step past your temperature refunds cost(step) − cost(gap); a mined-out planet refunds MetalToMoney(got) − MetalToMoney(left); refunds go into Ship Savings in pass 2 | CONFIRMED (`TerraformMineStars`, `ComputeIncomeAndPopulation`) |
| No money to spend | a net below 0 is set to 0: "Warning! After supporting your planets and paying your interest, you have no money to spend!" (1000.105); money kept within $0–$1,000,000,000, Ship Savings within ±$1,000,000,000 | CONFIRMED (`EndTurn @a0bdc-a0c9c`) |
| Losing a colony in battle | given up in pass 2 when the star's last duel was won by someone else (or none of its people are left) | CONFIRMED (`ComputeIncomeAndPopulation @a3df8`) |

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
| Who pays development costs | humans, and Dumb and Average computers (5.0.5: only Dumb); but the designs an Average (or better) computer draws up itself have none, so Average pays only for its starting designs | CONFIRMED (`BuildAFleet @92fc2`, `MaintainShipTypes @94794`) |
| Attack rating | max(W² × hp/50, W² × hit(W) × (5W+20)/300), not divided by 50. Only the computer players use it | CONFIRMED (`CalcShipCosts`, `CalcShipPower @1354bc`) |
| Design names | every new design, yours too, gets a name at random from STR# 2001–2004 by class (3.0.1's own lists) that no design of yours has; up to 100 tries | CONFIRMED (`GiveTypeCoolName @95296` and its callers `CreatePlayer`, `BuildDesignShips`, `DoSomethingRadical`, `MaintainShipTypes`) |
| Design sliders | Range 3 to your Range (Scout +2, Satellite 0), Speed 1 to tech (a Satellite's fixed at your Speed), Weapons and Shields 1 to tech (Scout −1), Mini 0 to tech (5.0.5: Scout +3) | CONFIRMED (`SetSBMinMax @132792`) |
| Fuel, colony ships, wormholes | as 5.0.5: fleets refuel at your own and your allies' colonies; colony ships reload colonists at your colonies; a fleet arriving at an exploded star is lost | CONFIRMED (`ColonizeAndExplore @a4414`, `MoveShips @a26ac`) |
| Routes | a fleet sent farther than its fuel goes by way of your colonies (not ones being abandoned), looked at in slot order (the newest first), depth first: the first hop within the fuel left, the others within its Range; a colony from which the destination is in Range ends the route; at most 42 ÷ Range stops; a route is kept if it is under three times the direct distance and shorter than the best so far, or as long with no more stops (so of two routes as good, the later found wins). Distances are the low byte of the distance table. Planned again on arriving at each stop and before leaving it; with no route left the fleet stops: "Your … can no longer reach …" (STR# 1000.21) | CONFIRMED (`DeterminePath @130686`, `CreateDistArray @130e2`, `GiveFleetPath @130dc0`, `CheckFleetDestination @a2b8e`, called from `MoveShips @a26ac` and `ColonizeAndExplore @a4414`) |
| Travel | a leg takes ⌈distance ÷ speed⌉ turns; the fuel is spent on arrival | CONFIRMED (`GiveFleetPath`, `MoveShips`) |
| Manual waypoints | not in 3.0.1 (a fleet has only a next stop and a destination); the remake's "Plan route…" stays as an interface convenience | CONFIRMED (fleet record +0xe, +0x14) |
| Fleets | a fleet holds one design. A player's fleet list is kept by class (Scouts, Fighters, Colony Ships, Satellites), a new fleet in front of the others of its class; the turn and the computers go through it in that order. New Fighters and Satellites join a fleet of the same design at the star that has no orders (a human's only one built this turn); each Scout and Colony Ship is a fleet of its own. Fleets can be grouped to move together, at the slowest speed and shortest Range: the remake's fleets of several designs stand for such groups | CONFIRMED (`BuildAShip @132e04`, `BuildAFleet`, `NewFleet @130004`, `GiveFleetPath`) |
| Organize Ships | one design's ships at a star are dealt out again among up to 12 fleets; every fleet of that design there then has the most fuel used of any of them; a fleet whose count changed stops counting as built this turn unless all of them were, and its colony ships are unloaded unless all of them were loaded; the fleets kept keep their orders | CONFIRMED (`OrganizeFleets @133d14`) |
| Scrapping | a fleet or design is marked (fleet +7, design +0x88; a toggle for a human, which undoes the purchase of a ship built this turn) and scrapped at the start of the money at End Turn. Humans get 3/4 of the metal, computers all of it; at your colony it goes to you; in hyperspace it falls on the next star as a meteor shower; elsewhere it falls onto the planet, and the planet's owner picks it up later in the turn ("You just received … metal from someone scrapping a fleet over …") | CONFIRMED (`ScrapCurrentFleet`, `BuildDesignShips`, `ScrapFleetsAndTypes @a194e`, `GetOtherScrapMetal @a3abe`). The remake scraps a human's fleet at once (see open questions) |
| Automatically scrapping old designs past 15 | a preference of the program (not of the game): when on, at the end of each turn every player's unused designs older than the newest of their class are scrapped while there are more than 15 | NOT IMPLEMENTED: interface preference (`ScrapFleetsAndTypes @a194e`, prefs +0x74) |

### Battles

| What | 3.0.1 | Status |
|---|---|---|
| Who fights | 2.0's duels: at every star where two players are, the colony's owner holds the star and the others, shuffled, take it on one at a time from the end of the list; the winner holds it (both dead: the next in the list); an ally of the holder goes to the front, and once everyone left is the holder's ally the holder steps down. One replay is kept for each duel | CONFIRMED (`DoBattleStage @e0004`, `AreAllies @e09d2`, `EverybodyNotAllied @e0a56`, `ReviewBattle @e2d36`) |
| Luck | −1, 0 or +1 Weapons for each side in each duel, **always on**; smarter generals never get −1 (the black cat and the horseshoe) | CONFIRMED (`DoBattleStage`) |
| Order of fire | rounds until one side is gone; fastest first, the attacker's groups then the defender's at each speed; ships hit during a speed still fire in it; the planet fires only as its side's last group | CONFIRMED (`DoOneBattle @e0aee`) |
| Hit table | resource `MaTh 1002` "Weapon Ratios": 1% at W−S ≤ −22, 25% at −1, 50% at 0, 74% at +1, 98% at +22 (the DOS 2.0 table) | CONFIRMED (`HaveGroupShoot @e1cc2`, `CalcShipCosts`) |
| A shot | hit × (0–20 + 5W + 10); ÷ 6 against ships (at least 1), × 4 against the planet; leftover damage is lost | CONFIRMED (`HaveGroupShoot`) |
| Shots | every ship fires once a round, satellites too (5.0.5/4.0.5: twice); the planet once, with your Weapons (+ luck) and Shields tech and its population as hit points | CONFIRMED (`CalcOneGroup @e17e4`, `DoBattleStage`) |
| Targets | colony ships first, then satellites, then a ship group from a random start, the planet last | CONFIRMED (`PickTarget @e250e`) |
| Groups | in each duel a side's ships are cut into groups of at most N ships of one design, each a target of its own. N starts at a fifth of the side's ships (at least 1) and grows until the side has at most 5 groups (the planet counts) or one a design; with 5 or more designs N is the whole side; both sides use the larger N | CONFIRMED (`CalculateGroups @e1614`, `CalcOneGroup @e17e4`) |
| Reports | one pair a duel: "You won a battle at %s. You lost %d of your ships. %s lost %d." / "You lost a battle …" (1000.32–.33), and for the colony's owner "%s survived an enemy attack from %s. … You lost %s people." (.34) / "%s destroyed your colony at %s. …" (.11). Only the last plays a sound (2001); the other three play none | CONFIRMED (`MakeResultMessages @e2ea2`, `PlayAnnounceSound @16156e`) |
| What a battle teaches | the year, and strength estimates for the computers; see "Computer players" | CONFIRMED (`MakeResultMessages`) |
| Debris, big-battle rumour | as 4.0.5: a duel is a big battle when each side has more ships than `RND(5, 10)` (`MakeResultMessages @e2ea2`; the star's flag is cleared each 10-year step); at the end of the step every player, computers too, whose record of the star was last seen and last heard of a battle more than 10 years ago gets "The amount of energy emanating from … suggests a big battle just took place." (0x43b) and the year in its record. The remake used to tell only humans, after every battle; fixed (`bigDuels`) | CONFIRMED (`DoOneBattle`, `MakeResultMessages @e2ea2`, `DetectBigBattles @a4a20`, called for every player in `EndTurn`) |
| Stances, "arrive late" | not in 3.0.1 | CONFIRMED (no text or code) |

### Events

| What | 3.0.1 | Status |
|---|---|---|
| Red stars and supernovas | after 2749, 1 time in 100, if no star is red (or went this turn), a quiet star nobody owns starts turning red, 3–10 turns; every player hears "%s has started growing and is turning bright red in hue!" every turn it grows. Then each star within 11 ly gets RND(max(100, 10000 ÷ d − 1000), 10000 ÷ d) metal; a colony hit loses metal × RND(40, 60) people, its owner gets the metal; no miracle | CONFIRMED (`CheckForSupernova @a33cc`, `ReactToSupernova @a3702`) |
| Armageddon | when every human has switched it on, half the quiet stars go supernova the next turn; no shrinking | CONFIRMED (`CheckForArmageddon @a3268`) |
| Volcanoes, revolts, metal disappearing, the "computer bug" | their text is in the program (STR# 1000.14, .17, .72, .77) but nothing shows them | CONFIRMED (no caller) |

### Diplomacy

Step by step, as 3.0.1 does it:

| What | 3.0.1 | Status |
|---|---|---|
| Alliances | each player says whom it wants to ally with; an alliance is two players who both want it. Allies don't fight, refuel at each other's colonies and share the end of the game | CONFIRMED (`AreAllies @e09d2`, `ColonizeAndExplore @a4414`) |
| Alliance news | at the end of the turn each player still in hears of every change since the last one: "%s has offered to ally with you." / "%s no longer wants to ally with you." (1000.78–.79), "You have offered to ally with %s." / "You no longer want to ally with %s." (.80–.81), and "You have formed an alliance with %s." / "Your alliance with %s is gone." (.82–.83). All that apply are sent (5.0.5 sends only the alliance when one forms) | CONFIRMED (`ConformPlayerAlliances @a2f76`) |
| Gifts | money (no more than your Ship Savings, if positive) and metal (no more than you have), at most 3 a turn; taken from you at once and given after the moves: the money into Ship Savings, "%s has just given you $%s." / "… %s metal." (1000.85–.86) | CONFIRMED (`DoGiveThingsDlg @1437e0`, `EndTurn @a0004`, STR# 1020.21). The giver's own note (1000.87–.88) comes at once in the remake, at the end of the turn in 3.0.1 (interface) |
| Messages | canned ones (STR# 3000: I Want, You Take, I Like, I Don't Like, I Own, I Need Money, I Need Metal, Let's Attack, Thank You, Sorry, #!$@*$&@•™!, My Stats, I Saw, Star Stats), at most 10 a turn. The computers read "I like …" and "I like planets that are …"; see "Computer players" | CONFIRMED (STR# 3000, STR# 1020.17, `SendAMessage @95f14`, `MsgReactDetermineAllies @9537e`). The remake's chat is free text; the computers read those two lines from it |
| Surrender, 1 | at the start of the turn a surrendering player's colonies are given up, every fleet is scrapped where it is (metal falls on the star, or rains on the next stop from hyperspace; over another player's colony it goes to its owner), and its Total Money plus Ship Savings (not below 0) and its metal are kept for the winner. "You have just surrendered." / "… to %s." (1000.91–.92); everyone else: "%s has just surrendered." / "… to %s." (.89–.90) | CONFIRMED (`SurrenderIfDesired @a1760`, `ScrapFleetsAndTypes @a194e`, `DoSurrenders @a482a`). 5.0.5 removes the fleets without scrapping |
| Surrender, 2 | after the moves the winner gets the money into Ship Savings and the metal, and colonizes each of the stars nobody has taken or has ships at (other than its allies'), as with a colony ship: 10 colonists, "You have colonized %s." | CONFIRMED (`DoSurrenders`, `ColonizeStar @a566a`). 5.0.5 gives 1 colonist and three notices of its own |
| Who may surrender | anyone, to anyone or to no one; the computers: see "Computer players" | CONFIRMED (`DoSurrenderToDlg`, `ComputeStatus @93fa8`) |

### The end of the game

| What | 3.0.1 | Status |
|---|---|---|
| Out | every turn (each 10 years, also within one End Turn of several), a player with no colonies and no colony ships is out: its money, Ship Savings and metal go to 0, and next turn's pass 1 scraps every fleet it has left. "%s has just been eliminated from the game." / "You have just been eliminated from the game." (1000.66–.67). A player who is out but has a colony again is back | CONFIRMED (`DoGameEndStuff @a6d06`, `ScrapFleetsAndTypes @a1ae8`, `CheckEndGame @12085a`; `DoComputerTurn` only for players still in) |
| Winning | from 2010, when every player still in is allied with every other: a lone player wins at once; an alliance must hold for one more turn, "Your alliance will win the game next turn if it holds!" (1000.106). "Congratulations! You won the game." / "%s has just won the game." (1000.69, .68), for each winner | CONFIRMED (`CheckForWinner @a731a`, `CheckEndGame`) |
| Hall of Fame and Hall of Shame, naming a star after a win | | NOT IMPLEMENTED: interface (`AddToHall @144796`, `NameAStar`) |

## Computer players

`js/ai-301.js` is a port of `DoComputerTurn @90004` and segment 9 (personalities:
`SetCompAttrs @f32ec`). It is 1.2's scheme (`docs/12-findings.md`, `js/ai-12.js`) grown
up: the same star classes, strength estimates and list of at most 50 actions by
priority, but ships are bought at once out of Ship Savings, designs come and go by an
"obsolescence" score, colonies it can't afford are abandoned, and it has feelings for
every player. Everything here is CONFIRMED from the routine named.

**When.** A computer plans on the first 10-year step of each End Turn (`(year − 2010)
mod years-per-turn = 0`), only while it is still in. A human on auto play runs the same
code as skill 0 (`EndTurn @a0004`).

**Personality** (`SetCompAttrs`; player record +0x4c2…):
- research 35–45 % of income; income per colony $33,000–37,000; colonies defended
  30–70 %; metal for defence 60–80 %; defending and attacking domination 150–250 %;
  aggressiveness 3–7; desire for metal 25–75; reserve 2–4 turns of income; smallest
  attack fleet 4–6; feelings for every player 250–350 (allies at 500);
- research shares Range and Speed 160–200, Weapons 200–260, Shields 200–260 but no more
  than Weapons, Radical 20, Mini the rest of 1,000;
- design marks: retire at obsolescence 60 (Scout, Fighter), 120 (Colony Ship), 100
  (Satellite); design anew at 30, 30, 60, 20.
- **Dumb**: research 15 %, colonies defended 10–20 %, dominations 75–95 %,
  aggressiveness 1, smallest fleet 1. **Average**: research 30 %, colonies defended
  30–40 %, attacking 125–175 %, defending 125–185 %, aggressiveness 4, smallest fleet 1.
  **Smart**: research 45–50 %, attacking 150–200 %. **Diabolical**: research 40–60 %,
  aggressiveness 10, smallest fleet 10–15, feelings 350–450 for computers and −50–0 for
  humans.
- Smart and Diabolical only: the 2nd, 7th, 12th … computer is a **turtle** (research 50 %,
  60 % if Diabolical; colonies defended 100 %, metal for defence 90 %, defending 300 %,
  attacking 1,000 %, aggressiveness 1, desire for metal 75, reserve 4–6 turns); the 4th,
  9th, 14th … a **raider** (research 45 %, colonies defended 25 %, metal for defence 10 %,
  defending 150 %, attacking 200 %, aggressiveness 10, desire for metal 60, reserve 3,
  smallest fleet 25–30). Both research Range 20, Speed 380, Weapons 380, Shields 20, Mini
  180, Radical 20 (Sparse galaxies: Range +80, Speed and Weapons −40).
- On auto play: research shares 200/200/200/200/150/50, colonies defended and metal for
  defence 50 %.

**Each turn:**
- **Money.** Ship money is Ship Savings less a reserve: the smaller of reserve × income
  and 1 % of income for each year since 2000 (income here is Total Money). The money
  to share out is the net (player +8: interest and every colony's income, never below
  0). In 2010 on a Spiral or Cluster map the computers don't plan at all: galaxy +0x10,
  set for those styles to lay the map out in 2010, is never cleared (`DoComputerTurn
  @9002a-9003a`, `CreateGalaxy @f0004`); the remake keeps the skip.
- **Scrapping** is by marks (fleet +7, design +0x88), carried out by
  `ScrapFleetsAndTypes` at the start of the money.
- **Designs** (`MaintainShipTypes @94794`, `CalcTypeObsolescence @94bcc`). Obsolescence:
  how far behind your tech, Range × 10 (not Satellites; Scouts +2), Speed × 15, Weapons ×
  15 (not Colony Ships; Scouts −1), Shields × 10 (Scouts −1), Mini × 10 (not Colony
  Ships). A design with no ships in service behind your tech is dropped; each class builds
  its least obsolete design, and a new one is drawn up (at your tech; Scout Range +2,
  Weapons and Shields −1; Satellite Range 0; Colony Ship Mini ÷ 3) when even that one has
  reached the class's mark; Average and up pay no development cost for their own
  designs. Near the 20-design limit unused designs not being built are dropped, then any
  four.
- **Assessment** (`ComputeStatus @93fa8`). Metal for defence drops by 5 a turn (1–80;
  raiders 1–50; not turtles). Colonies the income supports: (income + interest + income
  per colony − 30,000) ÷ income per colony; small colonies kept: the same with a quarter
  more. Spare metal (metal, colonies' metal, ships' metal less 5,000 or the colony ships')
  is split between defence and offence by metal for defence, less the satellites and
  fighters you have. After 2500, a computer that is broke (no colony ship and no metal
  for one) or has under a third of the next poorest's income surrenders, with 3 or more
  players left, to the player it likes best (or to no one); turtles never do. "I need
  metal." (under 10,000 metal, after 2500) and "I need money." (far the poorest, after
  2400) go to each ally 1 time in 20.
- **The map** (`FillInStarStatus @9623e`). Classes as 1.2's (allies' stars count as free);
  a colony losing money is hostile when gravity is over 2.56 times home's or over 2 times
  with more than 50 °F difference. Threats look within Range + 1, at least 10 ly.
  Estimates fade: 100 years after a battle half the time to 5; every 200 years a third of
  the time to 6, otherwise to 7,000 × (Weapons + 1)² ÷ 75. Others' stars with no battle
  seen: 7,000 × (Weapons + 1)² ÷ 75. A Diabolical computer sees the stars within 9 ly of
  home in its first turn (not who owns them).
- **Busy fleets** (`MarkUsedFleets @97112`): colony ships heading for an enemy's star stop.
- **Old ships** (`ScrapOldSats @94d22`, `ScrapOldShips @94e3e`): ships at or past their
  class's retire mark are scrapped at your colonies and sent home from elsewhere (not
  scouts). 3.0.1 passes the fleet's number in its list as the Range when sending them
  home (@94f70; a slip with no effect, since the colony is within the fuel left); the
  remake does the same.
- **Stranded fighters** (`RefuelFighters @9508a`): a fighter fleet of 5 or more that has
  used fuel and is not yet retired asks for a colony where it is (priority 58). The
  routine also looks for a colony within the fuel left, but its test of the answer
  (@951b4-951c6) reads a flag cleared just before, so a colony in reach never stops the
  request.
- **Feelings** (`MsgReactDetermineAllies @9537e`, `ModifyAlliances @95dc8`), from last
  turn's reports: Range level 16 and Speed level 5 move research to Weapons and Shields;
  a Mini level moves some of it; a Weapons level raises the planets' part of its
  estimates; a colony destroyed: "#!$@*$&@•™!" to the attacker 4 times in 10, and "I hate
  …" to everyone (one message, @95f14) 2 in 15; a battle won where the other side lost no ships: "Sorry!" 4 in
  10; "I like you." from someone it nearly likes enough: sometimes up to 500; "I like X":
  likes X 25–50 more; an alliance formed: likes the ally 50–150 more and half the others
  15–35 less; a gift of money (against gross income) or metal: up to 50 more, and "Thank
  You!" sometimes. Raising one feeling lowers everyone else's by a sixth as much (with 3
  or more players). With the Alliances option only, a computer (not on auto play): after
  2500, if it is the richest it likes everyone 5–10 less, if the poorest 4–8 more
  (`ModifyAlliances` on its own entry); it wants an alliance with anyone it likes 500 or more ("I like X."
  half the time) and drops those it likes less ("I hate X." half the time); players out
  of the game go to 0.
- **Battles** (`MakeResultMessages`): an attacked computer likes the attacker 10–30 less
  if it came with one ship, else 100–200 less; a colony lost to it: 200–400 less, or to 0
  if it was liked enough to ally with. A computer whose colony was attacked raises its
  metal for defence (to at least 60 % if it lost, then at least 30 % and +5 while under
  70 %; not turtles).
- **Actions** (`AddActionToList @96024`), at most 50 by priority:

| Action | Priority |
|---|---|
| research: % of income | 90 (`AddSavingsTechActions @90308`, `SpendPercentOnTech @9372e`) |
| abandon small colonies beyond what the income supports, the worst first, unless ships are refuelling there; abandon a hostile colony out of metal unless ships are refuelling or stationed there (and say "You take %s." to an ally who would like it) | — (`AddColonySupportActions @90356`, `MaintainKillStars @a10c8`: "You have abandoned %s.") |
| mining: the price of metal + 25 (hostile colony: no more than 1,000, Dumb no limit; others: 5,000 Dumb and Average, 600 Smart and up) | 75 hostile, 30 others |
| explore: unexplored stars (only while no good star, quality over 12, with a fleet of yours waits) and free ones, no enemy near, from the nearest colony within a colony ship's (55) or scout's (54) Range; the first free one a colony ship could reach | 55, 54, 86 (`AddExploreActions @90c22`) |
| attack: stars scored by aggressiveness, a population seen there (+20, not Dumb), worth, metal and distance from the middle of your colonies, ± a quarter at random (Diabolical: other computers' stars a quarter); turtles only where one fighter will do | aggressiveness × 5 + 35 (`AddAttackActions @90f42`, `PickAttackLoc @91096`) |
| colonize stars nobody owns where you have a fleet: a planet 10 better than your worst colony, then the best by worth | quality + 38 (+ 77 with no colony ship) (`AddColonizeAction @9133a`, `DetermineColQuality @91a42`, `DetermineStarQuality @91c1c`) |
| terraform: Dumb the whole job's price; otherwise $3,000 within 100 °F, else $10,000 ($15,000 with $150,000 to spend) | 70 paying, 80 losing (`AddTerraformingActions @90aac`) |
| satellites: at least a fighter's worth × defending domination at every colony under threat, more where the threat × defending domination beats satellites and planet ((pop + 49) ÷ 50 × (Weapons + 1)² ÷ 75), at most colonies-defended % of colonies, paid out of the defence metal; one at each hostile colony with none; scrapped where there is no threat | 60 (scrap 10) (`AddSatelliteActions @91d9e`) |

- **Carrying them out** (`PerformActions @923d0`, `GoExplore @92536`, `GoAttack @927c8`,
  `GoColonize @92d0a`): a scout, fighter fleet (attacking domination × the force there;
  an obsolete design counts half) or colony ship that can make the trip goes, by route;
  otherwise one is bought at the colony and sent (`BuildAFleet @92fc2`): fighters
  enough for the job, at least the smallest attack fleet when the job is over 20, not
  when the fighter design is within 10 of being replaced. A purchase needs ship money
  above the borrowing limit and the metal; when one fails no more ships are bought that
  turn, and a colony ship short of metal with none in service has idle warships at your
  colonies scrapped (`MineMetal @93566`; it pays for no mining).
- **Idle fleets** (`SaveFleets @937d0`): idle ships go to the nearest colony from a star
  going nova; fighters and colony ships from stars that aren't yours; scouts, and fighters
  and colony ships at a mined-out one, from hostile colonies. Colony ships heading for an
  enemy's star stop.
- **The budget** (`ResolveSpending @93abc`): what is left goes to Ship Savings; each
  slot's share is its money over the total, per mille rounded up (by thousands of the
  total above $2,000,000), kept as a word; each colony's bars split its money the same
  way (the part's money × 1,000 worked out in 32 bits), a done part left at −1 and the
  other then 1,000; a finished colony (slot +0x10) is passed over; with no money at all
  Savings gets 1,000; research shares are the personality's.

**Strength estimates** (`MakeResultMessages`), per player and star, after each duel:
the year of the last battle seen and e16 (the force to beat there), e1a (what it shows
to stars near it), e1e (the threat to your colony), e22 (what it shows to your colonies
near it) and the population seen. A defender that held: e16, e1a, e22 0; e1e = its ships
less fighters (2 in 5, after more than one round) or a tenth of that (2 in 5). A
defender that lost: e16 = the winners' ships + 1, e1a 0 a third of the time else the
same, e22 the same. A winner: all 0. A loser elsewhere: the population seen, e16 = the
winners' ships + the planet ((pop + 49) ÷ 50 × (Weapons + 2)² ÷ 75) + 1 (half the time,
at a colony, less their fighters and scouts), e1a their satellites + planet (0 a third
of the time if the population was under 100), e22 their fighters and scouts.

## Play changes in this pass

The ruleset was first built over the 5.0.5 rules. Reading 3.0.1's whole program showed
that its turn is 2.0's, so it was rebuilt over `js/rules-dos.js`. Each change below is
3.0.1's own code, cited:

- **The turn**: 2.0's two passes for each player in turn, battles and events between
  them, computers first (`EndTurn @a0004`); "Year %d:" opens each player's reports
  (@a033e); a human on auto play is planned for like a computer (state 3, intelligence
  0); a player who is out no longer plans (state below 4).
- **Shares**: per mille slots, Savings, Technology, colonies newest first, used as they
  stand with the $2,000,000 rule (`TerraformMineStars @a1318-a1360`, `SpendTechMoney
  @a1f5a-a1fa2`, `ComputeIncomeAndPopulation @a3c1a-a3ca0`); a share is set with 2.0's
  redistribution bounded by `ComputeMaxPercent @d28f8` (`GiveBarPercent @d1d40`,
  `DetermineNewLevels @d1e1e`); a dragged bar keeps the others between 0 and 1,000
  (`DoHBarClick @d18a0`, `rs.dragShare`).
- **Colony bars**: Terraform and Mine per mille with −1 for done (`RestoreStarsBars
  @a2e4c`); the home colony starts at −1 / 1,000 with $5,000 sunk (`CreatePlayer
  @f26a0`); bars set right and finished colonies' shares given away at the end of pass
  2 (`SetPlanetDisplayValues @a4b60`); the computers pass finished colonies over
  (`ResolveSpending @93abc`).
- **Terraforming and mining**: a bar above 0 is spent whether needed or not; the
  refunds are cost(step) − cost(gap) and MetalToMoney(got) − MetalToMoney(left)
  (`TerraformMineStars @a129a`).
- **New and lost colonies**: the slot after Savings and Technology, income −$7,501, a
  share of 7,500,000 ÷ Total Money per mille (`ColonizeStar @a566a`); a colony is lost
  in pass 2 when its star's last duel was won by someone else (`ComputeIncomeAndPopulation
  @a3df8`), its share going to Savings and its colony ships loaded (`DecolonizeStar
  @a5ac0`).
- **Money**: the net floored at 0 with report 1000.105 and the money clamped
  (`EndTurn @a0bdc-a0c9c`); the computers share out the net (`DoComputerTurn @90004`).
- **Abandon**: a toggle that takes the colony's income off the net and its share away at
  once; the colony is given up at End Turn (`DoGalaxyMenu @f3ece-f4110`,
  `MaintainKillStars @a10c8`). The Evacuate button now does this
  (`rs.evacuate`, `rs.evacuateCommand: true`).
- **Out players**: their fleets are scrapped in the next pass 1 (`ScrapFleetsAndTypes
  @a1ae8`); before, they stayed and fought.
- **Battles**: 2.0's duels taken from the end of the list; luck RND(−1, 1) on Weapons
  (@e01f6-e0218); the planet with its owner's Weapons and Shields (@e0780-e07c6) counted
  among the defender's groups and first (`CalculateGroups @e1614`); targets
  (`PickTarget @e250e`); reports, estimates and feelings per duel (`MakeResultMessages
  @e2ea2`); one replay per duel (`DoBattleStage`, `ReviewBattle @e2d36`); no sound for
  "won", "lost" or "survived", 2001 for "destroyed your colony" (`PlayAnnounceSound
  @16156e`).
- **Novas**: a new red star only on a quiet star nobody owns; the warning every turn;
  shock-wave metal to the colony's owner (`CheckForSupernova @a33cc`, `ReactToSupernova
  @a3702`). Armageddon notices follow the switches as they stood (`EndTurn
  @a03d0-a0450`).
- **Fleets**: the list kept in class order (`NewFleet @130004`); routes by 3.0.1's
  depth-first search, later ties winning (`DeterminePath @130686`); Organize Ships'
  fuel, "built" and "loaded" rules (`OrganizeFleets @133d14`); satellites of one design
  merged at each star (`MoveShips @a26ac`).
- **Scrapping and surrender**: marks carried out at the start of the money; metal over
  another's colony picked up by its owner (`ScrapFleetsAndTypes @a194e`,
  `GetOtherScrapMetal @a3abe`); a surrendering player's fleets scrapped (`SurrenderIfDesired
  @a1760`).
- **Computers**: Total Money as income and the net as money to share
  (`DoComputerTurn`); designs always new records, free from Average up
  (`MaintainShipTypes @94794`); scrapping by marks; fleets in list order; the
  `ScrapOldShips` slip (@94f70) and the `RefuelFighters` test (@951b4-951c6) as 3.0.1
  has them; "I hate" as one message to everyone (`SendAMessage @95f14`); terraforming
  by the bar (`AddTerraformingActions @90aac`); `ResolveSpending` in words and 32 bits;
  the 2010 skip on Spiral and Cluster maps (@9002a).

## Changes to the shared code

- `js/rules-dos.js` (2.0, step 0 of this pass, see `docs/dos-findings.md`): the
  computers' shares over $2,000,000 (`rs.aiBigShares`, `FUN_1020_35f9` @1020:3709-3774)
  and the computers' colony bars worked out in 32 bits and kept as a word
  (@1020:38da, 3930, 3974). Only 2.0's test games change (the money of the players over
  $2,000,000 at turn 100).
- `js/engine.js`: `evacuate()` hands over to `rs.evacuate` when a ruleset has one (only
  3.0.1's does). Nothing else in the engine changed; the ruleset uses the hooks the
  engine already had (`rs.processSurrenders`, `rs.pactNews`, `rs.checkElimination`,
  `rs.fleetFor`, `rs.route`, `rs.fleetArrives`, `rs.organized`, `rs.dragShare`, `rs.scrapAt`,
  `rs.designName`, the economy and refuel slots).

## Inherited rules audit

Every rule the 3.0.1 ruleset takes from another ruleset, checked against 3.0.1's code.

| Rule | From | 3.0.1 | Result |
|---|---|---|---|
| Bars per mille, −1 for done; scaling to 1,000 | 2.0 `bars20`, `setBars20` (no Ship bar) | `RestoreStarsBars @a2e4c` | same (2.0's routine with two bars) |
| Share of an amount | 2.0 `share20` | `TerraformMineStars`, `SpendTechMoney`, `ComputeIncomeAndPopulation` | same |
| Redistribution of shares | 2.0 `giveShare20` | `GiveBarPercent`, `DetermineNewLevels` | same scheme; 3.0.1's bounds (`ComputeMaxPercent`, finished and abandoned colonies) are its own, in `giveBarPercent` |
| Giving up a colony | 2.0 `removeColony20` | `DecolonizeStar @a5ac0` | same |
| Distance | 2.0 / 4.0.5 | `Distance @11ef8` | same |
| Galaxy shapes, star counts, home stars | 4.0.5 `makeGalaxy` | `CreateGalaxy` and the `GiveGalaxy…Coords` routines | same, but the Circle's last ring and the 2 ly margin are 3.0.1's own (`circleGalaxy`) |
| Star stats | 5.0.5 / 4.0.5 `newStar` | `GiveStarsValues @f246c` | same |
| Growth, maximum population, income, meteors | 5.0.5 `popU`, `hab` | `ComputeIncomeAndPopulation` | same, with the whole square root in the income's log (`incomeU`) |
| Exploring, star rating | engine | `ExploreStar @a549e`, `DetermineStarQuality @91c1c` | same |
| Alliances: both must want it | engine `isAllied` | `AreAllies @e09d2` | same |
| Gifts: at most 3 a turn, from what you have, delivered after the moves into Ship Savings | engine `give`, `deliverGifts` | `DoGiveThingsDlg @1437e0`, `EndTurn` | same |
| Messages: at most 10 a turn | engine `sendChat` | `SendAMessage @95f14`, `SendMessage @140fa2` | same (the remake's messages are free text) |
| Buying ships at once out of Ship Savings, needing the metal | engine `buildShips` | `BuildAShip @132e04` | same; the prototype and interest rules are the ruleset's |
| Merging and splitting fleets | engine `mergeFleets`, `splitFleet` | `OrganizeFleets @133d14` | the engine's moves with 3.0.1's flags (`organized301`) |
| Years per turn | engine | `PerformEndTurn @1216e8` | same |

Everything else (the turn, money, research, radical tech, ships, battles, events,
diplomacy, the end of the game, the computers) is the ruleset's own port of 3.0.1, as
described above.

## Still open

The questions 3.0.1's code doesn't settle, and the remake's own choices, are in
`docs/open-questions.md` ("Mac 3.0.1").
