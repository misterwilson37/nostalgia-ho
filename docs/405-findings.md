# Spaceward Ho! 4.0.5 for Windows 95: findings

Spaceward Ho! 4.0.5 for Windows 95 (`SPACEHO.EXE`, 1996) plays across platforms with the
Mac 4.0.5. This file says what the "Windows 95 4.0.5" ruleset (`js/rules-405.js`) and
its computer players (`js/ai-405.js`) do, each rule with the routine it was read from.
Every routine of the program is accounted for in `docs/coverage-405.md`.

Labels:

- **CONFIRMED**: read from `SPACEHO.EXE`, cited by the Ghidra name of the routine
  (`FUN_address`), with `@address` for a place inside one. Float constants the decompile
  drops were read from the disassembly; switch tables were decoded by hand.
- **OPEN**: the code doesn't settle it; listed in `docs/open-questions.md` with what the
  remake does.
- **NOT IMPLEMENTED**: in 4.0.5 but not in the remake (interface).

## The short version

4.0.5 is **3.0.1's game grown up**, not an early 5.0.5: its End Turn (`FUN_004320f8`)
is 3.0.1's `EndTurn`, routine for routine, with pass 2 split in two loops; its battles
are 3.0.1's duels; its computer players are 3.0.1's `DoComputerTurn`, step for step. So
the ruleset is now built on 3.0.1's (`js/rules-301.js` and `js/ai-301.js`, themselves on
2.0's), using 3.0.1's pieces where 4.0.5's code does the same (Organize Ships, the
arrival messages) and writing out what 4.0.5 changed:

- six ship classes (Dreadnoughts and Tankers added) and the Biologicals and decoys of
  Radical tech; 30 designs; a colony builds no more ships a turn than it has people;
- Radical tech as a hand of four cards out of 17 discoveries, dealt from 2010;
- best buddies (humans only), who route through each other's colonies and share maps;
- 5.0.5's terraforming, mining and income formulas, interest on the exact root, its own
  ship costs, hit table and research divisors; three new kinds of report;
- its own galaxy generator (which Mac 3.0.1 shares).

The remake's earlier "4.0.5" ruleset was built on 5.0.5's rules; reading every routine
showed the turn, the money, the battles and the computers are 3.0.1's, so the ruleset
was rebuilt. What changed in play is listed under "What the rebuild changed".

## The turn (FUN_004320f8, ENDTURN.CPP)

CONFIRMED. One call per 10-year step (`FUN_00431bf0` loops over the years per turn).

1. The year goes up 10. The step's tables are cleared: meteors, other players' scrap
   over your colonies, the shock wave, battles at each star, big battles, arrivals.
2. **Pass 1**, for each player in 4.0.5's order (the computers first, then the humans;
   the remake's turn loops follow that order): "Year %d." (1012); a computer plans
   (`FUN_0045e8bb`, also a human on auto play); the alliance and best-buddy offers are
   copied for this step; a player who is out has its Armageddon switch turned on, and
   every switch that is on goes into the mask; `SurrenderIfDesired` (`FUN_0043427a`),
   `DeductInterest` (`FUN_0043361b`), `ScrapFleetsAndTypes` (`FUN_00434534`),
   `MaintainKillStars` (`FUN_00433977`), `TerraformMineStars` (`FUN_00433c52`),
   `SpendTechMoney` (`FUN_00434dad`), `MoveShips` (`FUN_004357fc`), `RestoreStarsBars`
   (`FUN_004360af`).
3. Every battle (`FUN_00421430`), Armageddon (`FUN_00436988`), the novas (`FUN_00436c26`).
4. **Pass 2a**, for each player: the Armageddon reports, `ReactToSupernova`
   (`FUN_00436ff8`), `GetOtherScrapMetal` (`FUN_0043747e`), income and growth
   (`FUN_00437592`), colonizing and exploring (`FUN_00437ddd`).
5. **Pass 2b**, for each player: allies' arrivals (`FUN_004383a8`), best buddies' maps
   (`FUN_0043853c`), big battles (`FUN_00438a0f`), surrenders (`FUN_00438718`), the
   canned messages and gifts of the turn, the net floor and clamps, the radical hand in
   2010, milestones (`FUN_0043b243`), `DoGameEndStuff` (`FUN_0043bd5f`), the pact news
   (`FUN_0043625c`, players still in), `RestoreStarsBars`, `SetPlanetDisplayValues`
   (`FUN_00438b77`).
6. `CheckForWinner` (`FUN_0043bf98`).

The remake's engine asks every computer to plan before pass 1 and moves every fleet
after it; 4.0.5 plans and moves for each player inside its own pass 1. As in 3.0.1, this
changes only what a computer sees of the players before it in the same step (a remake
choice, docs/open-questions.md).

### Setup

| What | 4.0.5 | Status |
|---|---|---|
| Computers | 0–19 (20 players in all). The remake still needs at least one computer when one person plays | CONFIRMED (`FUN_00448856`, scroll range 0..0x13) |
| Computer Intelligence | Dumb, Average, Smart or Diabolical, one setting for every computer. There is no IQ slider and no per-computer spread. "Super Genius" exists only as a string | CONFIRMED (`FUN_00448856`, game +0x14) |
| Computer personalities | 3.0.1's (`SetCompAttrs`) drawn in 4.0.5's order, with retire and redesign marks for six classes: see "Computer players" | CONFIRMED (`FUN_004438ba`) |
| Skill Level | Novice $100,000 savings / $51,000 income / 20,000 metal / 750k people, plus a Colony Ship and 2 Scouts. Beginner $50,000 / 41,000 / 12,000 / 625k, plus 2 Scouts. Normal $25,000 / 30,000 / 5,000 / 500k. Advanced $10,000 / 20,000 / 2,500 / 350k. Expert $0 / 20,000 / 0 / 350k. Income gets + rand(1–100). There is no Outpost and no Abundant (and so no second colony) | CONFIRMED (`FUN_004427a4`, dialog 318) |
| Computers' start | each computer's skill is the intelligence turned round: Dumb = Expert, Average = Advanced, Smart = Normal, Diabolical = Novice. For Average and Smart, each computer but the last has a 39% chance (rand(1–100) < 40) of being set one step lower, and then the next one is set one step higher. The computer joins with that skill, and its intelligence is worked back from it (Novice 4, Normal 3, Advanced 2, Expert 1), so the step changes its intelligence too | CONFIRMED (`FUN_004768cc`, `FUN_00484821` → `FUN_00480eb5`) |
| Several humans | `FUN_0043c9ea` then copies a human's skill onto each computer, but wealth was already set when the computer joined (`FUN_004427a4`), so only the skill shown changes | CONFIRMED |
| Computer names | 4.0.5's own: 20 men's names (strings 595–614) and 20 women's (615–634), cut to 11 letters; each computer is a man or a woman at even odds | CONFIRMED (`FUN_004768cc`) |
| Starting designs | in this order: Scout **R8** V2 W1 S1, Satellite (R0) V2 W2 S2, Colony Ship, Fighter and Tanker R6 V2 W2 S2; Mini 0; named as the computers' designs are (one of the first 15 names of the class) | CONFIRMED (`FUN_004427a4`, `FUN_0046472b`) |
| Technology | 6/2/2/2/0/0 with a head start of rand(0, 40) into each level (Radical 0-80); research split 167 x 4, 166, 166 | CONFIRMED (`FUN_004427a4`) |
| Budget | slots Savings 650, Technology 250, home 100 per mille; home bars Terraform done ($5,000 sunk), Mine 1,000; Ship Savings by skill; Total Money = income + rand(1, 100); borrowing limit trunc(gross / 2) x -10 | CONFIRMED (`FUN_004427a4` @0x18ee-0x1932) |
| Home world | 0-200 F, 0.5-2.0 G, 10,000 metal | CONFIRMED (`FUN_004427a4`) |
| Welcome | reports 1000 and 1002: "Spaceward Ho! Version 4.0.5 by Peter Commons.", "Artwork by Howard Vives and Bob Van de Walle." | CONFIRMED (`FUN_004427a4` @player +0x7cc) |
| Not in 4.0.5 | Home Systems, "Based on IQ", Hex galaxies; the computers never offer best buddies (only humans do) | CONFIRMED |
| Options | Years per turn (10, 20, 30, 50) and three check boxes: Alliances, Luck in Battles, and "Automatically end turn for unconnected players" (option bit 8, `FUN_00473ced`). There is **no Novas check box**: `FUN_00409170` builds the option word from the Alliances box (bit 1) and the preferences (Luck bit 4, auto end bit 8), the rest coming from a stack buffer `FUN_00484788` never clears, so bit 2, which `FUN_00436c26` tests before a star turns red, is whatever was there. The remake turns novas on (OPEN, docs/open-questions.md) | CONFIRMED (`FUN_00409170`, `FUN_00484788`, `FUN_00448856`) |

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
| Budget slots | Savings, Technology, then the colonies newest first, per mille, used as they stand; a share of an amount M is trunc(M x pm / 1000) under $2,000,000, trunc(M / 1000) x pm above (3.0.1's) | CONFIRMED (`FUN_00433c52`, `FUN_00434dad`, `FUN_00437592`) |
| Interest | trunc(10 x sqrt(savings)) on the exact root (3.0.1: the whole root); a debt costs trunc(savings x 15 / 100) | CONFIRMED (`FUN_00437592` @004376a3) |
| Borrowing limit | -5 x gross income, set in pass 2 (at the start, trunc(gross / 2) x -10) | CONFIRMED (`FUN_00437592`, `FUN_004427a4`) |
| DeductInterest | 3.0.1's: interest paid from this turn's money, then Ship Savings ("Uh-oh!  Having to borrow more ship money to pay all your interest!"), then global warming on every colony and a random fleet scrapped (1056-1058) | CONFIRMED (`FUN_0043361b`) |
| MaintainKillStars | 3.0.1's: colonies marked for abandoning given up, then losing colonies paid from this turn's money, Ship Savings (1053), then with people (starving, no growth) | CONFIRMED (`FUN_00433977`) |
| Terraforming | trunc(sqrt(trunc(money / 3) x 2)) tenths of a degree (trunc(sqrt(trunc(money / 8) x 7)) with the discovery); the first $5,000 sunk; the overshoot refunded at trunc(3d^2/2) (trunc(8d^2/7)) | CONFIRMED (`FUN_00433c52` @00433f01) |
| Mining | trunc(20 x sqrt(money)) metal (25 with the discovery); the overshoot refunded by MetalToMoney ceil(m^2/400) (625), above 30,000 metal ceil(m/400) x m | CONFIRMED (`FUN_00433c52` @004340d5, constants 0x57bf20/28; `FUN_0042f60c`) |
| Income | 5.0.5's: the log of the exact root of the people | CONFIRMED (`FUN_00437592` @00437b7d) |
| Growth | 3.0.1's rules, the random numbers drawn rand(0, 5) first | CONFIRMED (`FUN_00437592`) |
| Colony lost | at a star where a battle took place, if the star isn't the player's any more or none of its people are left (3.0.1 looked at who won) | CONFIRMED (`FUN_00437592`) |
| Net floor | "Warning!  After supporting your planets and paying your interest, you have no money to spend!" (1054) | CONFIRMED (`FUN_004320f8` @00433136) |
| Dip Into Savings | an amount up to Ship Savings less the borrowing limit, at once; the interest worked out again. The remake's window takes a percentage | CONFIRMED (`FUN_00469757`) |
| Buying | a human pays the prototype price while none of the design is built and the interest is worked out again (`FUN_004691c4`); computers below Smart pay it too (`FUN_00462105`); **a colony can build only while it has more people (units) than ships built there this turn** (slot +0xe; `FUN_0044eecd`, `FUN_00462105`); new ships but Scouts and Colony Ships join a fleet of the design at the star (a human's: one built this turn) | CONFIRMED |
| Scrapping | a fleet or design marked (fleet +0xb, design +0x26), scrapped in pass 1: a human gets 3/4 of the metal (7/8 with the recycling discovery), at its own colony; over someone else's planet the metal falls for the owner (at most 32,767 a star); in hyperspace it rains on the next star. "Your fleet of %s at %s has been scrapped for %s metal." only at a star | CONFIRMED (`FUN_00434534`) |
| Scrap Current Fleet | the Ships menu item (menu resource 2; its text never changes: strings 318-319 "Scrap current fleet" / "Don't Scrap Current Fleet" are never loaded) toggles the selected fleet's mark, with SCRAP when it was off; refused while the turn is worked out. A fleet built this turn (+0xd) is not marked but un-bought: every ship's price comes back, the prototype price for one of them when none of the design is left built, and the metal; the design's built and existing counts and the colony's count of ships built this turn go down; the interest (and the net) is worked out again; the fleet is gone. A marked fleet given orders on the map loses them (an alert, WHOA); its information line reads "Fleet to be scrapped for metal." (1338) | CONFIRMED (`FUN_00419a52`, `FUN_00469698`, `FUN_00413ba3`, `FUN_0048fe0f`) |
| Scrap a ship type | the Ship Types window's button, "Scrap All" / "Don't Scrap" (760-761), toggles the design's mark; a marked design can't be built (its Build button dimmed); marking gives back one ship of it ordered in the window (the window buys its orders when it closes) | CONFIRMED (`FUN_0044fd03`, `FUN_0044e9e4`, `FUN_00468f83`) |

### The colonies and the bars

| What | 4.0.5 | Status |
|---|---|---|
| Colony bars | Terraform and Mine, -1 for done, scaled to 1,000 at the end of each pass; at your temperature Terraform done, out of metal Mine done, a colony with both done is finished and gives its share away (3.0.1's) | CONFIRMED (`FUN_004360af`, `FUN_00438b77`) |
| GiveBarPercent | 3.0.1's redistribution, but every slot's bounds are 0..1,000 (0 for one being abandoned or finished); 3.0.1's ComputeMaxPercent is gone | CONFIRMED (`FUN_0045c61e`, `FUN_0045c6dc`, `FUN_0045ced4`, `FUN_0045cf57`) |
| Dragging a bar | refused for a colony being abandoned and for a slot whose star number is 1 or more with both bars done (so a colony at star 0 can be dragged: a slip); every slot 0..1,000; redistributed at every step of the drag | CONFIRMED (`FUN_0045c02c`) |
| Giving up a colony | its Colony Ships loaded; its share to 0, the others taking it (3.0.1 gave it to Savings); its owner's and best buddies' records cleared | CONFIRMED (`FUN_00439bf7`) |
| Colonizing | 3.0.1's (income -7,501, bars 900/100 or Mine 1,000, its share 7,500,000 / money); "You have colonized %s." | CONFIRMED (`FUN_004397ba`) |
| **Abandon (Evacuate)** | a human's toggle on a colony (slot +0x11), with confirmations for a profitable or nearly profitable colony and jokes for "Hope" and "Ship" (strings 661-671), ABANDON or WHOA; on, the colony's income comes off the net, off it goes back; either way its share goes to 0; the colony is given up at End Turn. The ruleset sets `evacuateCommand: true` | CONFIRMED (`FUN_00469b1d`) |

### Research

| What | 4.0.5 | Status |
|---|---|---|
| Points | the Technology slot's share by each tech's research share; trunc(sqrt(trunc(money / D)) x 8 / 10), D 150 for Range, Speed, Weapons, Shields and 200 for Mini; Radical trunc(sqrt(trunc(money / 200)) / 2) | CONFIRMED (`FUN_00434dad`, constants 0x57bf30-40) |
| Level costs | Range trunc(L^3 / 9); Speed (L+6)^2; Weapons and Shields (L+2)^2; Mini and Radical (L+7)^2; a head start of rand(0, 40) into each new level (Radical 0-80); at most 50 | CONFIRMED (`FUN_00434dad`) |
| Reports | to level 20 "You now have <name> <Tech> Technology (L)." with 4.0.5's name for it, from 21 "Your <Tech> Technology has reached level L.", BURST; "You are not spending any money on technology research." every turn it gets nothing | CONFIRMED (`FUN_0046ec5a`, `FUN_00434dad`) |

### Radical discoveries

CONFIRMED (`FUN_0043a08c`, the hand `FUN_0043adac`, weights at 0x59cf10). A hand of up to
four of 17 discoveries (player +0x18ce), first dealt in 2010 ("Your radical researchers
are hard at work on another discovery!") and filled again after each: rand(0, 99) by
weight 7 7 7 4 4 4 4 4 6 6 6 6 7 7 7 7 7; a card is dealt only if it isn't in the hand
and: astronomers, 6 or more stars never explored; mining, not had and 3000 or later;
population, terraforming, recycling, not had; generals, not had and Luck on; decoy, a
human with Alliances on; biological, a human. A Radical level draws a card at random
from the hand: metal rand(9,000-11,000) (the report divides it among your colonies);
astronomers explore 6-9 stars not turning red whose news is older than 100 years; money
rand(2-12) x this turn's money into Ship Savings; the five bonuses; a decoy (a Fighter
with R+1 V+1 W+2 S+2 and Mini -1); a biological (R-2 V-1 W-1 S-1 Mini 0, no metal); the
technology of the **last** player ahead of you (in 4.0.5's order); six free designs
(fewer than 25); a tech +2. Slips: an empty hand acts on an uninitialised index; a hand
that runs out while a design card can't be played loops for ever (both OPEN). The hand
window (`FUN_00471587`, opened by the 2010 report) lets a human throw a card out of a
full hand: NOT IMPLEMENTED.

### Ships and fleets

| What | 4.0.5 | Status |
|---|---|---|
| Classes | 0 Scout, 1 Dreadnought, 2 Fighter, 3 Tanker, 4 Colony Ship, 5 Satellite, 6 Biological; a decoy is a Fighter with Mini -1 | CONFIRMED (`FUN_004427a4`, `FUN_0041a9b4`) |
| Costs | mm = (Mini + 1) / 2 + 0.5; B = (V+15)(S+17)(W+13)(R+10) / 38.75, a Satellite's (S+26)(W+13) x 2.381 x 2; price mm B, metal B / 3mm, hit points B / 3, prototype 4 mm^2 B; Colony Ship +$45,000 / +3,000 metal / +1,000 hp, Tanker +$22,500 / +1,500 / +500 (prototype 2 mm price); Biological 8 B, no metal, prototype 40 B; Dreadnought metal and hp x 25, price x 40, prototype 2 x price; a decoy / 20, metal / 40, 1 hp. Worked out in float32. The attack rating max(W^2 trunc(hp/50), trunc((5W+20) W^2 hit(W) / 300)), not divided by 50 (the old ruleset divided it) | CONFIRMED (`FUN_0041a9b4`, 0x57abe0-0x57ac40) |
| Design window | Range 4 to your tech (Scout +2, Satellite 0), Speed 1 to yours (Satellite fixed), Weapons and Shields to yours (Scout -1), Mini 0 to yours; Dreadnoughts open from the start | CONFIRMED (`FUN_0044e51a`, `FUN_0044eb83`) |
| Names | a new design's name from its class's list: the computers' (and the starting and discovered designs) from a random one of the first 15 places, a human's from the whole list, then the next name not in use | CONFIRMED (`FUN_0046472b`, tables 0x59e028/48) |
| Fleets | one design each, kept by class (`FUN_00415db0`); a new Biological fleet starts with its fuel used up, a Colony Ship fleet loaded | CONFIRMED |
| Routes | 3.0.1's search through your colonies **and your best buddies'**, on whole distances | CONFIRMED (`FUN_004164b0`, `FUN_004221d7`) |
| Moves | satellites of a design at a star merged; every other fleet's route checked again ("Your %s can no longer reach %s."); arrivals as 3.0.1's (wormhole at a star that exploded) | CONFIRMED (`FUN_004357fc`, `FUN_00435dc3`) |
| Organize Ships | 3.0.1's | CONFIRMED (`FUN_0042b278`) |
| Refuelling | at your or an ally's colony; a Biological fleet doesn't refuel but **eats 200 people a ship** for each unit of fuel at your or an ally's colony while it has 200 x ships + 100 ("Your fleet of %s has eaten %s people while refueling at %s.", BIOCHOMP; the owner is told); a fleet short of fuel is refuelled by any Tanker fleet of yours at the star; "The Valdez has sprung a leak!" 1 time in 100 for a Tanker design named Valdez (nothing else happens) | CONFIRMED (`FUN_00437ddd`) |

### Battles

| What | 4.0.5 | Status |
|---|---|---|
| Duels | 3.0.1's: the colony's owner holds the star and the others take it on one at a time; one replay record and pair of reports per duel (`duel` on the record) | CONFIRMED (`FUN_00421430`) |
| Luck | with the Luck option, rand(-1, 1) Weapons a side, never -1 with smarter generals | CONFIRMED (@0042163c) |
| Groups | at most 30 a side, sized as 3.0.1's (the defender: designs + 1); decoys have Speed, Weapons and Shields 0 | CONFIRMED (`FUN_00423878`, `FUN_00423b52`) |
| Shots | Satellites 2 a round, Dreadnoughts 25, the planet ceil(pop / 200,000) | CONFIRMED (`FUN_00423b52`) |
| Hit table | trunc(50 + 31.51 atan(W - S)) | CONFIRMED (`FUN_0047b5dc`) |
| Targets | the first Colony Ship group, then Satellites, then from a random start | CONFIRMED (`FUN_00424b00`) |
| Reports | "You won a battle ..." (1035) and "You lost a battle ..." (1036) with the other side's face; "... survived an enemy attack ..." (1037) and "... destroyed your colony ..." (942) with your own face; only the last has a sound (SHUCKS). `won` is set on each | CONFIRMED (`FUN_00425c9a`, `FUN_0046f8cc`, `FUN_0046fe1b`) |
| Debris | a fifth of the metal of each ship lost; the winner's falls on the planet for its owner (or is recovered, x 5/4 with recycling) | CONFIRMED (`FUN_00425c9a`) |

### Novas and Armageddon

As 3.0.1's (CONFIRMED, `FUN_00436988`, `FUN_00436c26`, `FUN_00436ff8`): a red star
(10..100, +10 a step) explodes at 110, throwing rand(max(100, 10000/d - 1000), 10000/d)
metal at stars under 11 ly; a new one 1 time in 100 after 2749 (option bit 2, OPEN);
Armageddon when every human's switch is on (an out player's counts as on), half the quiet
stars at once. After a fizzle the mask is cleared but the switches stay on, so everyone
hears each device "was just turned off", and next step "turned on".

### Diplomacy and the end of the game

| What | 4.0.5 | Status |
|---|---|---|
| Alliances and best buddies | offers both ways; news of every change against the step before (1016-1027); best buddies learn each other's home and route through and see each other's exploring | CONFIRMED (`FUN_0043625c`, `FUN_0043853c`) |
| Gifts | 3 a turn out of Ship Savings and metal; delivered in pass 2b with "%s has just given you ..." and "You just gave ..." | CONFIRMED (`FUN_00457c55`, `FUN_004320f8`) |
| Surrender | 3.0.1's; money (Total Money + savings, not below 0) and metal reported to the winner (1073, 1074), and each planet nobody else watches given (1075) | CONFIRMED (`FUN_0043427a`, `FUN_00438718`) |
| Out | no colonies and no Colony Ship fleet (but those flying to an exploded star); offers of alliance withdrawn (best buddy ones kept); money, savings, metal to 0; back in with a colony again | CONFIRMED (`FUN_0043bd5f`) |
| Winning | from 2010, every player still in allied with every other: a lone player or computers alone at once, an alliance after a warning on an earlier step, and only on a step that ends a turn; "Congratulations!  You won the game.  Game difficulty rating was %d." | CONFIRMED (`FUN_0043bf98`, `FUN_0047fd97`, `FUN_0043c1ec`) |
| Every human out | the whole map is shown to them and the computers play on | CONFIRMED (`FUN_0047fb7b`) |
| Milestones | "Congratulations, %s!   Your population now exceeds %s!" at 1, 2.5, 5, 10, 20 million units, leaving out a colony at star 0 | CONFIRMED (`FUN_0043b243`) |

## Computer players (js/ai-405.js)

CONFIRMED: `FUN_0045e8bb` is 3.0.1's `DoComputerTurn` in the same order, and each step
is 3.0.1's routine with these changes:

- **Personality** (`FUN_004438ba`): 3.0.1's numbers, without the "additional" draw;
  feelings drawn for all 20 places; retire marks Scout 60, Dreadnought 120, Fighter 60,
  Tanker 120, Colony Ship 120, Satellite 100 and redesign marks 30, 60, 30, 60, 60, 20.
- **No Spiral/Cluster skip** in 2010; a computer that is out doesn't plan.
- **Designs** (`FUN_004639ba`): six classes, 30 designs; at 30 the classes left keep
  last turn's choices (a global never cleared).
- **Status** (`FUN_00463030`): Dreadnoughts count with the Fighters; the poorest and
  richest by Total Money over every player, one who is out (0) included.
- **Old ships** (`FUN_004641ef`, `FUN_004644c5`): a computer's Tankers are always
  retired; Dreadnoughts refuel like Fighters; the colony asked for uses
  FindCloseEnoughColony's mode 4 (answering your oldest colony when only a Colony Ship
  could get there).
- **News** (`FUN_004648d2`): read from its own reports of the last turn, with 4.0.5's
  codes; gifts weighed against the gross income or the metal, 50 when that is 0; a
  player who surrendered to it is noted after the surrender choice was made.
- **"You take %s"** offers use the ally's gravity and temperature (`FUN_0045eda0`).
- **Attacks** (`FUN_004616ee`): Dreadnoughts go with the Fighters, and one Dreadnought is
  bought when it is enough but not by more than a third.
- **Buying** (`FUN_00462105`): not at a star going nova; not more ships than the colony
  has people this turn.
- **SaveFleets** (`FUN_00462878`): Dreadnoughts with the Fighters.

## What the rebuild changed in play

The old ruleset took 5.0.5's rules for what it hadn't read. Read in 4.0.5's code:

- The turn, money, bars, colonies, battles and computers are 3.0.1's (above), not 5.0.5's.
- Ship attack ratings were divided by 50; they aren't (`FUN_0041a9b4`).
- Radical: money is rand(2, 12) x this turn's money; stealing takes the last player
  ahead; the metal report divides by your colonies; a decoy is a Fighter with Mini -1;
  the astronomers' card is checked when dealt only; free designs need fewer than 25.
- A computer's cap of colonies to keep counts slots (fewer than 4 slots).
- Colonies build no more ships a turn than they have people (`yardRoom`, engine hook).
- Abandon is 4.0.5's toggle (`evacuate`, `evacuateCommand: true`); dragging a bar is
  4.0.5's (`dragShare`).
- Battle reports carry `won`; each duel is its own replay (`duel`).
- Engine hooks added: `rs.shipsAdded` (a new fleet adjusted: Biologicals unfuelled),
  `rs.shareMaps` (4.0.5 shares maps in its own pass 2), `rs.yardRoom` (the colony's limit).

## Ranks and the Hall of Fame (not built yet)

CONFIRMED. A win (`FUN_0047fd97` → `FUN_00497e58(1000)`) adds an entry to the Hall of
Fame file `haloffam.ho` (the 25 last games: players, options, years, difficulty) and,
unless the player was caught cheating (`FUN_004782ac`), master points to the player's
name in a table of up to 25 names: 100 x trunc(10^((D - 25) / 25)) for the win's
difficulty D (`FUN_0043c836` through `FUN_0043c1ec`), added in full up to 500 while the
total is under 500, else at most a third of the total; the table is kept sorted and
carries a checksum (a table whose sum doesn't match is wiped). Being eliminated
(`FUN_00470dec`, report 0x432) adds a Hall of Shame entry (`FUN_00497e58(0x3e9)`), no
points. The Hall of Fame window (`FUN_00482b89`) lists every name with its points and
rank: under 1,000 Red-Neck, 2,500 Bow-legs, 5,000 Cowpoke, 10,000 Deputy Gunfighter,
25,000 Town Sheriff, 50,000 Federal Marshall, 100,000 Lone Ranger, 250,000 Quickdraw
McGraw, 500,000 Best in the West, 1,000,000 Ho! Champion (strings 324-333); at 1,000,000
or more it reads string 334, "%s: %s" (a slip). The window's picture goes by the top
player's points: under 5,000 bitmap 0x7a, 50,000 0x7b, 500,000 0x7c, else 0x7d.
