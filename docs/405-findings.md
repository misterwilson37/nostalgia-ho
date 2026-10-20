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
| Angles | Circle, Ring, Spiral and Cluster place stars at trunc(100 cos) and trunc(100 sin) of a whole degree, worked out with pi = 3.14159 (constants 0x57bfd0-0x57bfe0): sin 90 and 270 and cos 180 come out 99 and -99, sin 150 50, sin 210 -49, cos 300 49. The Mac 4.0.5 reads the same values from its MaTh 1000 / 1001 tables (Sines, Cosines). The remake had used the exact pi (corrected) | CONFIRMED (`FUN_00440f8a` and the other shapes) |
| Random | a square of side √(25 × stars), doubled when Sparse. The first stars are the homes | CONFIRMED (`FUN_00440796`) |
| Grid | spacing 4 or 6 ly | CONFIRMED (`FUN_00441988`) |
| Spiral | 5.0.5's spiral in whole light-years: the core is max(8, √stars × step / 2), one arm per player, 6° twist, and the arm tips get a wider search. Homes are shuffled | CONFIRMED (`FUN_00440f8a`) |
| Cluster | 5.0.5's clusters: size 4(1 + √(stars/players)), doubled when Sparse, one per player around a circle. Homes are shuffled | CONFIRMED (`FUN_0044162a`) |
| Home stars | other shapes: random stars for all 20 slots, at least 20 ly apart, relaxing by 4 ly, 25 tries each | CONFIRMED (`FUN_00441af4`) |
| Margin | the map is shifted so it starts 4 ly from the edge (5.0.5: 6) | CONFIRMED (`FUN_00441ddc`) |
| Star stats | as 5.0.5 | CONFIRMED (`FUN_00442374`) |
| Star names | 4.0.5's own 191 names (strings 108–298), cut to 7 letters, each used once; the kept winners' names first, one place late (the first place is "Hope", the last kept name lost: a slip, the patch's `keptStarNames`), the list then shuffled. Hints: report 24 every step with the help messages preference (strings 781-806; Mac STR# 6250.4-30), and hints around the credits in the first reports. Numbers "12,345K" from ten million (`FUN_0042e5c2`) | CONFIRMED (`FUN_00442374`) |

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
| Scrap Current Fleet | the Ships menu item (menu resource 2; its text never changes: strings 318-319 "Scrap current fleet" / "Don't Scrap Current Fleet" are never loaded) toggles the selected fleet's mark, with SCRAP when it was off (the remake's menu keeps its words: `scrapWords`); refused while the turn is worked out. A fleet built this turn (+0xd) is not marked but un-bought: every ship's price comes back, the prototype price for one of them when none of the design is left built, and the metal; the design's built and existing counts and the colony's count of ships built this turn go down; the interest (and the net) is worked out again; the fleet is gone. A marked fleet given orders on the map loses them (string 518, "Sorry, but you have that fleet marked for the scrap heap.  it's not going anywhere.", then WHOA); its information line reads "Fleet to be scrapped for metal." (1338) | CONFIRMED (`FUN_00419a52`, `FUN_00469698`, `FUN_00413ba3`, `FUN_0048fe0f`) |
| Scrap a ship type | the Ship Types window's button, "Scrap All" / "Don't Scrap" (760-761), toggles the design's mark; a marked design can't be built (its Build button dimmed); marking gives back only one ship of it ordered in the window (a slip, reproduced: `scrapTypeRefundOne`); the others are bought when the window closes and scrapped with the type at End Turn. The window's running money and metal are credited as if every ship ordered in the window, of any design, came back (price and metal x the window's count), plus the prototype price, twice when none of the design is built; the purchase at the close is priced again, so only what the window lets you order is wrong (the remake buys at once and keeps no running total) | CONFIRMED (`FUN_0044fd03`, `FUN_0044f4f7`, `FUN_0044e9e4`, `FUN_00468f83`) |

### The colonies and the bars

| What | 4.0.5 | Status |
|---|---|---|
| Colony bars | Terraform and Mine, -1 for done, scaled to 1,000 at the end of each pass; at your temperature Terraform done, out of metal Mine done, a colony with both done is finished and gives its share away (3.0.1's) | CONFIRMED (`FUN_004360af`, `FUN_00438b77`) |
| GiveBarPercent | 3.0.1's redistribution, but every slot's bounds are 0..1,000 (0 for one being abandoned or finished); 3.0.1's ComputeMaxPercent is gone | CONFIRMED (`FUN_0045c61e`, `FUN_0045c6dc`, `FUN_0045ced4`, `FUN_0045cf57`) |
| Dragging a bar | refused for a colony being abandoned and for a slot whose star number is 1 or more with both bars done (so a colony at star 0 can be dragged: a slip); every slot 0..1,000; redistributed at every step of the drag | CONFIRMED (`FUN_0045c02c`) |
| Giving up a colony | its Colony Ships loaded; its share to 0, the others taking it (3.0.1 gave it to Savings); its owner's and best buddies' records cleared | CONFIRMED (`FUN_00439bf7`) |
| Colonizing | 3.0.1's (income -7,501, bars 900/100 or Mine 1,000, its share 7,500,000 / money); "You have colonized %s." | CONFIRMED (`FUN_004397ba`) |
| **Abandon (Evacuate)** | a human's toggle on a colony (slot +0x11), with confirmations for a profitable or nearly profitable colony and jokes for "Hope" and "Ship" (strings 661-671; the jokes are in the remake, `rs.evacuateJoke`: always, `strcmp`, no draw), ABANDON or WHOA; on, the colony's income comes off the net, off it goes back; either way its share goes to 0; the colony is given up at End Turn. The ruleset sets `evacuateCommand: true` | CONFIRMED (`FUN_00469b1d`) |

### Research

| What | 4.0.5 | Status |
|---|---|---|
| Points | the Technology slot's share by each tech's research share; trunc(sqrt(trunc(money / D)) x 8 / 10), D 150 for Range, Speed, Weapons, Shields and 200 for Mini; Radical trunc(sqrt(trunc(money / 200)) / 2) | CONFIRMED (`FUN_00434dad`, constants 0x57bf30-40) |
| Level costs | Range trunc(L^3 / 9); Speed (L+6)^2; Weapons and Shields (L+2)^2; Mini and Radical (L+7)^2; a head start of rand(0, 40) into each new level (Radical 0-80); at most 50 | CONFIRMED (`FUN_00434dad`) |
| Reports | to level 20 "You now have <name> <Tech> Technology (L)." with 4.0.5's name for it, from 21 "Your <Tech> Technology has reached level L.", BURST; "You are not spending any money on technology research." every turn it gets nothing | CONFIRMED (`FUN_0046ec5a`, `FUN_00434dad`) |

The research shares are per mille as they stand (a tech's money is trunc(T x share / 1000),
as the budget slots). The skin's Technology bars keep a human's shares as fractions of 1
once they are drawn, so `research` (`js/rules-405.js`) reads shares that add up to 2 or
less as fractions and turns them to per mille (the nearest), as `research505` does for
5.0.5. Until that was found (by `tools/human-play.js`, which plays a human through the
page) a human playing 4.0.5 got almost nothing for research. The computers' shares are
per mille, so their games are as they were.

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
rand(2 x, 12 x this turn's money) into Ship Savings (an amount between the two); the five bonuses; a decoy (a Fighter
with R+1 V+1 W+2 S+2 and Mini -1); a biological (R-2 V-1 W-1 S-1 Mini 0, no metal); the
technology of the **last** player ahead of you (in 4.0.5's order); six free designs
(fewer than 25); a tech +2. Slips: an empty hand acts on an uninitialised index; a hand
that runs out while a design card can't be played loops for ever (both OPEN). The hand
window (`FUN_00471587`, opened by the 2010 report) lets a human throw a card out of a
full hand: built (`rs.radicalHand`; the skin's Radical projects… button on that report).

### Ships and fleets

| What | 4.0.5 | Status |
|---|---|---|
| Classes | 0 Scout, 1 Dreadnought, 2 Fighter, 3 Tanker, 4 Colony Ship, 5 Satellite, 6 Biological; a decoy is a Fighter with Mini -1 | CONFIRMED (`FUN_004427a4`, `FUN_0041a9b4`) |
| Costs | mm = (Mini + 1) / 2 + 0.5; B = (V+15)(S+17)(W+13)(R+10) / 38.75, a Satellite's (S+26)(W+13) x 2.381 x 2; price mm B, metal B / 3mm, hit points B / 3, prototype 4 mm^2 B; Colony Ship +$45,000 / +3,000 metal / +1,000 hp, Tanker +$22,500 / +1,500 / +500 (prototype 2 mm price); Biological 8 B, no metal, prototype 40 B; Dreadnought metal and hp x 25, price x 40, prototype 2 x price; a decoy / 20, metal / 40, 1 hp. Worked out in float32. The attack rating max(W^2 trunc(hp/50), trunc((5W+20) W^2 hit(W) / 300)), not divided by 50 (the old ruleset divided it) | CONFIRMED (`FUN_0041a9b4`, 0x57abe0-0x57ac40) |
| Design window | Range 4 to your tech (Scout +2, Satellite 0), Speed 1 to yours (Satellite fixed), Weapons and Shields to yours (Scout -1), Mini 0 to yours; Dreadnoughts open from the start | CONFIRMED (`FUN_0044e51a`, `FUN_0044eb83`) |
| Names | a new design's name from its class's list: the computers' (and the starting and discovered designs) from a random one of the first 15 places, a human's from the whole list, then the next name not in use | CONFIRMED (`FUN_0046472b`, tables 0x59e028/48) |
| Fleets | one design each, kept by class (`FUN_00415db0`); only fleets of one design can be put together (Organize; the group number, fleet +0x1e, is never set to another fleet, and neither edition has a group command); a new Biological fleet starts with its fuel used up, a Colony Ship fleet loaded | CONFIRMED |
| Routes | 3.0.1's search through your colonies **and your best buddies'**, on whole distances | CONFIRMED (`FUN_004164b0`, `FUN_004221d7`) |
| Moves | satellites of a design at a star merged; every other fleet's route checked again ("Your %s can no longer reach %s."); arrivals as 3.0.1's (wormhole at a star that exploded); a leg's fuel spent on arrival (its length, fleet +0x14, added to the fuel used, +6) | CONFIRMED (`FUN_004357fc`, `FUN_00435dc3`; Mac `MoveShips` @c272e) |
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
| Targets | the first Colony Ship group, then Satellites, then from a random start (the Mac 4.0.5 looks for Tankers between Colony Ships and Satellites: see "Mac 4.0.5 differs") | CONFIRMED (`FUN_00424b00`) |
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
| Alliances and best buddies | offers both ways; news of every change against the step before (1016-1027); best buddies learn each other's home and route through and see each other's exploring; a buddy's record of a star where it saw a battle this year replaces the player's when the player's news is older (Review Battle then says "since you did not fight in that battle, you have no information about it"; Windows copies the record's pointer, the Mac and the remake copy the record) | CONFIRMED (`FUN_0043625c`, `FUN_0043853c`) |
| Gifts | 3 a turn out of Ship Savings and metal; delivered in pass 2b with "%s has just given you ..." and "You just gave ..." | CONFIRMED (`FUN_00457c55`, `FUN_004320f8`) |
| Surrender | 3.0.1's; money (Total Money + savings, not below 0) and metal reported to the winner (1073, 1074), and each planet nobody else watches given (1075) | CONFIRMED (`FUN_0043427a`, `FUN_00438718`) |
| Out | no colonies and no Colony Ship fleet (but those flying to an exploded star); offers of alliance withdrawn (best buddy ones kept); money, savings, metal to 0; back in with a colony again | CONFIRMED (`FUN_0043bd5f`) |
| Winning | from 2010, every player still in allied with every other: a lone player or computers alone at once, an alliance after a warning on an earlier step, and only on a step that ends a turn; "Congratulations!  You won the game.  Game difficulty rating was %d." | CONFIRMED (`FUN_0043bf98`, `FUN_0047fd97`, `FUN_0043c1ec`) |
| Every human out | the whole map is shown to them and the computers play on | CONFIRMED (`FUN_0047fb7b`) |
| Milestones | "Congratulations, %s!   Your population now exceeds %s!" at 1, 2.5, 5, 10, 20 million units, leaving out a colony at star 0 | CONFIRMED (`FUN_0043b243`) |

## Bars and battles (October 2026)

Joe Williams' three notes (the bars' scale, the bars that lock at zero, the ships in
battles), read in both programs (Windows `SPACEHO.EXE`, Mac 4.0.5 with its routine names):

- **The scale.** Both build the log table: the 77-pixel budget bars (Windows
  `FUN_0045aa60`, Mac `InitHLogBarAmts` @50924: trunc(10 × (e^(i / 32.11 + 2.302) − 10)),
  the 78th entry 1,000) and the 50-pixel technology bars (`FUN_00459ba0`,
  `InitVLogBarAmts` @5000c: i / 20.85, the same curve). The budget bars use it for the
  mouse and the drawing when a setting says so (Windows `FUN_0045c02c` and `FUN_0045aae1`
  read SPACEHO.INI's `[prefs] useLogScale`, written back on quitting and read with 1 by
  default, `FUN_0047d8e8`; Mac `DoHBarClick` @514e2 and `DrawHBarControl` @50a80 read the
  setup's +0x3c, 1 in 'Stup' 1000 "Default Setup", which nothing in the program writes),
  otherwise 1,000 × x / 77 with a linear grid (Windows `FUN_0045aae1` and Mac `DrawHBarControl` @50a80 draw it as ten 2-pixel ticks on the heading strip's rule, 77k/10 pixels linear or the log table, none through the bars: `rs.barGrid`). So both draw and drag them on the log scale
  unless the setting is edited by hand; neither has 3.0.1's click to switch. The
  technology bars are always on the log scale (`FUN_0045a5d6` called with 2 by the
  research window; `DoVBarClick` @5060c with 2 from `ClickInTechWin` @18025a). The
  remake: `rs.barScale` `{ budget: 'log', tech: 'log' }`. CONFIRMED.
- **The lock** (above, "Dragging a bar"): a colony being abandoned, or a finished one at
  star 1 or more (the star-0 slip, fixed by the 4.0.5.1 patch); a click on it beeps
  (Windows `MessageBeep`, Mac `PlaySound`). Savings and Technology are never locked (no
  Dip Into Savings in 4.0.5). The drawing (`FUN_0045aae1`, `DrawHBarControl`) writes "$"
  and the income of a finished colony 4 pixels into its empty bar, at any star number,
  so a finished colony at star 0 says so and can still be dragged. The remake already
  refused the drag in its rules (`dragShare`); now the bar says so and refuses it too
  (`rs.barLocked`, `barLocked405`). CONFIRMED.
- **The battle window** (Mac `ReviewBattle` @6273e, `DrawAllGroups` @6208a,
  `DrawOneGroup` @6226c, `MakeFleetDescription` @f0c26, disassembled: its decompile
  fails; STR# 1030; Windows strings 1081-1091 and the formats "%s (%d/%d) %s", "%s %s
  (%d/%d) %s", "%d %s (%d/%d) %ss" @0x59c48c): headed "Summary of battle", "at %s in %d:",
  "Round %d" while it runs, and closed with "Congratulations!" "You won the battle!" or
  "Unfortunately," "you lost the battle…" ("..." on Windows). The duel's two sides are two
  lists, a group a row 53 pixels high: one ship picture, a bar of the damage done to its
  next ship (up to 120 pixels), and its words under it, cut to 120 pixels with "…": "N
  Name (W/S) Classs", "one Name (W/S) Class" (the design's own Weapons and Shields; a decoy
  "Decoy" to its owner; cut to 39 letters), "1 dead Name (W/S) Class" / "N dead Name (W/S)
  Classs" (STR# 1030.1-2, by the starting count) once the group is gone; a colony its
  people, or "%s dead" with the people it had. No owner's name or luck. The remake:
  `rs.battlePanel` (rules-dos `battlePanel20`, Windows `battlePanelWin`, Mac
  `battlePanelMac`), the columns headed with the sides' names (the remake's).
- **Which side is on the left** (`DoOneBattle @6094e`, `DrawOneGroup @6226c`): when the record's first player
  (`param_1[0]`) is the viewing player the left column's x is set to 25 (4.0.5: 5) and the right's to 300,
  else the other way about; `DrawOneGroup` takes its x from the list it draws (the first side's list gets
  the first side's x). So the **viewer's side is on the left**, and a viewer in neither side (a hot-seat
  watcher) sees the record's *second* side there. The remake: `makeBattlePanel` `cols: 'mac'`. CONFIRMED for the Mac. Windows 4.0.5's battle routine is `FUN_00422339` (strings 1081-1089 as `FUN_0042e172(buf, 0x439, k)`; k 0-1 the "dead" formats, 2 and 3 the heading, 4 the round, 5-8 the ending, 10-11 "no information"); it has the same rule: `*param_1 == viewer` sets the first list's x (`DAT_005abda4`) to 25 and the second's to 300, else the reverse. The remake's `battlePanelWin` has `cols: 'mac'` (read October 2026).
- **The damage shading** (Windows `FUN_004251cd`, the same: rows 53 pixels from y 35, the 120 x 40 picture cell, the bar 120 x damage / hit points from the left, a satellite a third of it starting 40 in; the words in a white box under it, centred, the font one size smaller when wider than 140 pixels instead of the Mac's cut; `DrawOneGroup @6226c`; the same code in 1.2, 2.0.1, 3.0.1 and 4.0.5): after the picture and the words,
  a group that is not a colony's has its 120 x 40 picture cell painted with the pen set to the gray pattern (the
  QuickDraw global qd.gray; the pen is put back to qd.black after) in patOr mode: a gone group (count 0) the whole
  cell, else the damage done to its next ship, 120 x damage / hit points pixels from the left (a satellite: a third
  of that, starting 40 pixels in, so at most 40 wide). No frame, no other bars. The remake: `rs.battlePanel` `shade`
  (the battle events' `f`), drawn as a translucent gray rectangle. CONFIRMED.

What changed in play: nothing in the rules. The bars are on the log scale for the mouse
and the finger, and a locked bar refuses the drag and says why. Windows 4.0.5's battle drawing is read (above): the viewer's side on the left and the shading are the Mac's.

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
- Radical: money is rand(2 x, 12 x this turn's money); stealing takes the last player
  ahead; the metal report divides by your colonies; a decoy is a Fighter with Mini -1;
  the astronomers' card is checked when dealt only; free designs need fewer than 25.
- A computer's cap of colonies to keep counts slots (fewer than 4 slots).
- Colonies build no more ships a turn than they have people (`yardRoom`, engine hook).
- Abandon is 4.0.5's toggle (`evacuate`, `evacuateCommand: true`); dragging a bar is
  4.0.5's (`dragShare`).
- Battle reports carry `won`; each duel is its own replay (`duel`).
- A win's difficulty rating counts the winner's own allies and skill (`FUN_0043c1ec`); it
  had counted no allies.
- Engine hooks added: `rs.shipsAdded` (a new fleet adjusted: Biologicals unfuelled),
  `rs.shareMaps` (4.0.5 shares maps in its own pass 2), `rs.yardRoom` (the colony's limit).

## The Hall of Fame, the Hall of Shame and master points

CONFIRMED. Built: `hall` in `js/rules-405.js` (the entries and tables), the windows and
the Game menu items in `js/skins/classic/ui.js` (every skin), 4.0.5's look in the w95 skin.

**The file** (`FUN_00497e58`, `haloffam.ho`, 0x1520 bytes; the remake keeps the same
tables in localStorage, "ho5.hall.405", apart from 5.0.5's "ho5.profile"):

| Offset | What |
|---|---|
| 0 | the Hall of Fame: a count, then 25 entries of 100 bytes, newest first |
| 0x9c6 | the Hall of Shame, the same |
| 0x138c | the master point table: a count, a checksum (the low 16 bits of every total, added in a short), then 25 slots of a 12-byte name and the points (int) |

An entry, by short: 0 humans (galaxy +1), 1 computers (+2), 2 style (+0xe: 1 Circle,
2 Random, 3 Ring, 4 Spiral, 5 Grid, 6 Cluster), 3 density (+0x10: 1 Dense, 2 Sparse),
4 size (+0x12: 1 Small .. 5 Humongous), 5 intelligence (+0x14: 1 Dumb .. 4 Diabolical),
6 (+0x16), 7 the game year, 8 allies, 9 difficulty, 10 (+0x20), 11-12 (+6), 13 years per
turn (+0x18), 14-15 the date (`time()`), 16 the player's skill (player +0x26: 0 Novice ..
4 Expert), 17 Armageddons (+0x22), 18.. the player's name. The game year is the year of
the win (galaxy +6), or for a loss the year the player went out (+0x2dc; this year while
that still reads 1). Allies are the other players allied both ways (`FUN_0043c7c2`,
`FUN_0042210e`); the difficulty is `FUN_0043c1ec`'s, below.

**When.** A win (`FUN_0047fd97`, and report 0x434 in `FUN_00470dec`) calls
`FUN_00497e58(1000)` for the player at this computer; being eliminated (report 0x432,
"Unfortunately, you have been eliminated ...", `FUN_00470dec`) calls `FUN_00497e58(0x3e9)`.
Each first asks `FUN_004782ac` whether this game is already on record for that player,
and writes nothing if so; afterwards `FUN_00478196` sets that player's bit, saved in the
game (+0x160). So each game is recorded once a player: a player who is out and comes back
to win is never in the Hall of Fame for it. (The remake: `G.hallDone`, after each End
Turn, for each human.)

**Master points** (a win only). A table whose checksum doesn't match is wiped. The player
is found by name, else added (with 25 names the 25th, the lowest, is replaced, at 0). The
win adds 100 x trunc(10^((D - 25) / 25)) (`pow` and `__ftol`, 25.0 at 0x580670): in full,
up to 500, while the total is under 500, else at most a third of the total. The table is
sorted, most first, by an exchange sort, and the checksum written again.

**The difficulty** (`FUN_0043c1ec` → `FUN_0043c836`, the remake's `winDifficulty`): for
the player at this computer, with its own allies and skill (the remake's win report now
uses them; it had read the Alliances option for the allies, always 0). A player marked
as cheating (galaxy +8) is rated -1, which earns 0 points: the mark is set at End Turn
when a player record's checksum (`FUN_0043c2a1` against +0x18d2) fails, with "%s is
cheating." and NOCHEAT (report 0x41c, `FUN_004320f8` @004323d4-004327c4); it marks the player at
this computer, not the one whose record failed. The remake keeps no such checksum.

**The Master Point List** (Options menu, dialog 388, `FUN_00482b89`, `FUN_00482f45`):
"Master Points:"; a list on tab stops 6, 142, 278 of "\t<name>\t%d\t<rank>"; the rank
by points: under 1,000 Red-Neck, 2,500 Bow-legs, 5,000 Cowpoke, 10,000 Deputy Gunfighter,
25,000 Town Sheriff, 50,000 Federal Marshall, 100,000 Lone Ranger, 250,000 Quickdraw
McGraw, 500,000 Best in the West, 1,000,000 Ho! Champion (strings 324-333); at 1,000,000
or more it loads string 334, "%s: %s", and shows that (a slip; the remake does too). The
picture (36 x 39 at the top right) goes by the top player's points when the window
opens and by the selected player's after: under 5,000 bitmap 0x7a, 50,000 0x7b, 500,000
0x7c, else 0x7d. Bitmap 0x7c (124) is not in SPACEHO.EXE, so from 50,000 to 499,999
points nothing is drawn (docs/missing-assets.md).

**The Hall of Fame and Hall of Shame** (Options menu, dialog 386, `FUN_0046c8fe`,
`FUN_0049883d`): "Hall of Fame" or "Hall of Shame" (0x59e118); Name, When, Difficulty on
tab stops 92, 209; the date "%d/%d/%d" of the month + 1, the day and `tm_year`, the years
since 1900 (1996 reads 96, 2026 reads 126: reproduced); the first row selected; Details,
dimmed when the list is empty, opens the summary (dialog 387, `FUN_0046d1e8`,
`FUN_00498b6a`): "Summary of Game Victory" or "... Defeat"; Winner: (for the Hall of
Shame the label reads "Loser", without the colon: reproduced), Date, Difficulty, # Humans,
# of Computers, # Allies, Computer Intelligence, Game Date, Galaxy Size with its density
and style, Player Skill, Armageddons. Its picture box (static 1194, a `youwonga.cpp`
picture control) is given no picture by the summary; the remake leaves it empty. The
dialogs have no caption bar.

**Built since:** naming a star after a win (dialog 378, `FUN_00456047`: "You won the game,
so you get to name a star", kept in a list of four for later galaxies; `rs.nameAStar`) and
the "You have conquered the galaxy!" window with its picture (dialog 377, `FUN_0044bf5a`;
`rs.conquered`), opened by clicking the winner's report; the radical card window
(`rs.radicalHand`, strings 821-837) and the auto play settings (`rs.autoPlaySettings`).

**Their layouts** (CONFIRMED, October 2026; `docs/405-windows.md`, both programs' dialogs,
read with `tools/extract/ppob.py` and `tools/extract/windlg.py`):
- the radical card window: Windows dialog 348 (`FUN_0047a6f8`, `FUN_00471587`), the Mac's
  DLOG/DITL 6170 "Radical Choice": no title, "You can cancel one research program:", the
  four programs each beside its picture (statics 1070-1073 / user items), and OK. A program
  clicked is cancelled by OK (+0x434, -1 until one is clicked). With fewer than four in the
  hand it doesn't open. Windows closes it by itself 18,000 ticks after it opens
  (`FUN_0042404f` is GetTickCount × 60 / 1000, so 5 minutes; a timed network game's own
  deadline instead; the dialog's timer `FUN_0047aa1b`). Built (`rs.radicalHand.words`); the
  remake leaves the timer out.
- "You have conquered the galaxy!": Windows dialog 377, "Congratulations!  You have
  conquered the galaxy!" (the Mac's DITL 5040, one space), the won picture, OK, no title.
  Built (`rs.conquered`, `rs.conqueredTitle`). (Not yet followed: `FUN_00470dec` sets the
  dialog's line itself before it opens, +0x9c, to "Congratulations! You conquered the
  Galaxy!" (0x59e364), and its picture, +0x98, to bitmap 3000: the template's words never
  show on Windows.)
- **You Lost** (CONFIRMED, October 2026): Windows `FUN_00470dec` on report 0x432 (the
  player's own "You have just been eliminated from the game."): the same dialog 377
  (`FUN_0044bf5a`, no title), its line set to "Unfortunately, you have been eliminated from
  the game..." (0x59e390) and its picture to bitmap 3010 (0xbc2), OK; it closes itself
  after 18,000 ticks (5 minutes; a timed network game's deadline instead), which the
  remake leaves out. Then the Hall of Shame (`FUN_00497e58(0x3e9)`, once a game) and, with
  every human out, the whole map (`FUN_0047fb7b`). The Mac's `DoMessageAction` @1523c2:
  `SimpleOKDialog` with DLOG 5050 "You Lose Color" (16 colours or more; 5051 "You Lose",
  PICT 3540, otherwise), no title, "Unfortunately, you have been eliminated from the
  game…" over PICT 3040 and "Oh, well…"; then `AddToHall`, `MarkEndGameDone`,
  `ExploreEverything` with every human out. Only being eliminated opens it (a surrender
  leads there; "%s has just won the game." opens nothing). A player who is out, comes
  back with a colony or Colony Ship and goes out again hears the report, and sees the
  window, again; clicking the report in the list opens it again. Built: `rs.youLost`
  (`js/skins/classic/ui.js` `openYouLost`), in the w95 skin with bitmap 3010 and in mac4 /
  mac4c with "Oh, well…".
- the auto play settings (Config…): Windows dialog 380, the Mac's DLOG/DITL 4021, "Configure
  Computer's Auto Play Style:", Friendly to Aggressive (scroll bar 1171, 0-10:
  `SetScrollRange` in `FUN_00408f3b`; the Mac's CNTL 4021 "Aggressiveness" 0-10) and No
  Defense to Dig In (1172, 0-100; CNTL 4022 "Defensiveness" 0-100): **Dig In at the right**,
  the value the colonies defended itself (`FUN_00404c4e`). The Auto Play window's delay
  slider is 0-15 on Windows (`FUN_00404d29`), CNTL 4020 "Message Delay" 1-15 on the Mac.
  Built (`rs.autoPlayRange` digRight).

## Read against the Mac 4.0.5

The Mac 4.0.5 (`Spaceward Ho! 4.0.5`, a fat application: 68k `CODE` resources built
with Metrowerks CodeWarrior, and a PowerPC PEF in the data fork) was decompiled with its
MacsBug routine names (`tools/decompile/cw68k.py` and `Mac68k.java`, `docs/decompiling.md`):
600 names in 24 named segments (`EndTurn`, `EndTurn2`, `Battles`, `Computer`, `Fleets`,
`Rare`, …). Addresses below are in that layout (CODE n at n × 0x10000). Every game-rule
routine of `docs/coverage-405.md` now has its Mac name beside it, matched by what it
calls, its constants and its strings. The PowerPC code is the same program: spot checks
of `PickTarget` and `CheckForSupernova` find the same code, Tankers included.

The Mac code is Windows' code compiled for the Mac, routine for routine: the same
records (Windows' star and player records carry an 8-byte header more), the same
constants, the same slips (the uncleared New Game buffer, the empty radical hand, the
Biological retire mark, the colony at star 0, 30 designs, `refuelCheck`, `scrapRange`,
`poorestOut`). Each routine of the remake was read against it; the routines whose Mac
decompile failed ("Cannot properly adjust input varnodes": `GiveBarPercent`,
`CalcOneGroup`, `HaveGroupShoot`, `PickTarget`, `CheckFleetDestination`, `DeterminePath`,
`NewFleet` and 28 more) were read in the disassembly. The Mac stores what Windows
computes: the hit table is resource MaTh 1002 ("Weapon Ratios", the same 51 values as
50 + 31.51 atan), the angles MaTh 1000 / 1001.

### What the names corrected (Windows read again)

- **The galaxy's angles** use pi = 3.14159 (`FUN_00440f8a` and the other shapes; the Mac's
  MaTh tables are this formula). The remake used the exact pi, which moves the stars at
  90°, 150°, 180°, 210°, 270° and 300° by up to a light-year in Circle, Ring, Spiral and
  Cluster galaxies. Fixed (`cos100`, `sin100` in `js/rules-405.js`; 3.0.1, which uses
  this generator, keeps the exact pi: see below).
- **The New Game window's Base Difficulty Rating** is the rating of a win
  (`FUN_0043c836` = `CalcGameRating`) for the window's settings, with 1 human of Normal
  skill, no allies and no Armageddons (`FUN_00447bdb`; Mac `AdjustDifficulty` @10c1e).
  It had been read from `FUN_0043c351`, a rating with a float formula that nothing calls
  and the Mac doesn't have. Fixed (`difficulty`).
- **Best buddies' battle news** (`FUN_0043853c` = `BestBuddiesExplore` @c4636): the second
  branch was thought unreachable; it tests the buddy's record and then the player's, and
  runs (above, Diplomacy). Built (`shareBuddyMaps`).
- **`FUN_00427584`** is `CalcBiggestAndNumTypes` (the most numerous design at a star, for
  a report's fleet description), not the survivors' fleet (that is `FUN_0042780e`,
  `ResolveVictorFleetsAtStar`); **`FUN_00438f47`** is `SetPlanetTypesForStar` (each
  star's map picture, with a Christmas picture and pictures for rich colonies of players
  named Peter or Howard), not birthday jokes (built: the Christmas picture and Windows' Peter and Howard pictures in the skins, the Mac's Peter and Howard only in Full Hoedown; Abandon's Hope and Ship jokes and Armageddon's two questions, strings 299-309 and 661-662, are the rules'); **`FUN_0047f76e`** is `EndTurnMenuCall`
  (End Turn: the computer plays a human set to "Have computer play for me", then the
  turn-time bank), not the time limit's routine; **`FUN_0045ed5a`**,
  `AddSavingsTechActions`, adds the research action only. No rule changed.
- Wording: the Radical money is rand(2 × this turn's money, 12 ×), not a multiple.

### Mac 4.0.5 differs

The '405' ruleset stays Windows'; the 'mac405' ruleset (`js/rules-mac405.js`) plays the
Mac, items 1-7 and 9-11 below (5 changes nothing: the remake already copied). Where the
Mac does otherwise:

1. **Targets in battle** (`PickTarget` @61f86, and the PowerPC code): the first Colony
   Ship group, then the first **Tanker** group, then Satellites, then from a random
   start. Windows (`FUN_00424b00`) has no Tanker step.
2. **The technology names in the reports** ("You now have %s Range Technology (%d).",
   `GetReportString` @1507d4): the Mac takes the level's own name (STR# 6270-6274, index
   = level). Windows reads one past (string table base + level, with the lists starting
   at level 1): Range 7 is "Fusion Pile" instead of "Topping off the Tanks", and Mini 20
   is "Spaceward Ho! Version 4.0.5 by Peter Commons."
3. **Ship design names** come from STR# 6210-6216, 15 a class (Dreadnoughts "Big
   Surprise" … "Annihilator", Biologicals "Medusa" … "Trash Compactor", Scouts with "De
   Gama"), copied to the Preferences, where a name a human types is added to its class's
   list (`AddNewTypeNameToPrefs`). A computer draws from places 1-15 (`RND`), a human from
   the whole list (`aSynchRand`, the Mac's other random generator). Windows' lists are
   its own (14 Scouts, 3 Dreadnoughts, 23 Fighters, 7 Tankers, 18 Satellites, 2
   Biologicals).
4. **The auto play settings** (`DoConfigAutoPlayDialog` @10440e) set metal for defence to
   the new colonies-defended value; Windows to the old one (a Windows slip).
5. **Best buddies' battle news**: the Mac copies the buddy's record; Windows copies its
   pointer, so the two players share one record until the game is saved.
6. **The welcome report** reads "Spaceward Ho! Version 4.0.3 by Peter Commons." (STR#
   6040, not updated; the program's `vers` is 4.0.5). Computer and star names match
   Windows'.
7. **Computers' sexes, and the names of the computers**, are drawn with `aSynchRand`, not
   the game's random numbers, from the Preferences' name lists, to which every human's
   name is added when a game starts (`DoGameSolidificationStuff` @d2432, which also
   shuffles the players' colours and copies a human's skill to the computers, as
   `FUN_0043c9ea`).
8. **The New Game window** has the Luck in Battles and "Automatically end turn for
   unconnected players" boxes (Windows: the Preferences), a time limit menu (No Time
   Limit, Fast 30/120, Medium 60/180, Slow 90/180) and the four winners' star names.
9. **`CreatePlayer`** @81c9c draws one more of the game's random numbers, RND(20, 50) x
   100, the colour-monitor joke's year (player +0x5e, below).
10. **The Ship Types window's Scrap box** (`BuildDesignShips` @f0d8e, case 8) gives back
   every ship of the design ordered in the window and zeroes its count; Windows
   (`FUN_0044fd03`) gives back one (`scrapTypeRefundOne`).
11. **The Hall of Fame** (`doMasterListDlg` @10538e, `doHallOfFameDlg` @105020,
   `doDetailsDlg` @1057e4): eleven ranks from STR# 6280 (Red-neck, Bow-legs, Cowpoke,
   Deputy, Gunfighter, Town Sheriff, Federal Marshall, Lone Ranger, QuickDraw™ McGraw,
   Best in the West, Ho! Champion; from 0, 1,000, 2,500, 5,000, 10,000, 25,000, 50,000,
   100,000, 250,000, 500,000 and 1,000,000 points), where Windows has ten with "Deputy
   Gunfighter" as one and "%s: %s" past 1,000,000; dates as month/day/whole year
   (`Secs2Date`, "%d/%d/%d"); "Loser:" with its colon (DITL 4110).

Built since: the turn time limit (both: `rs.timeLimit`, the New Game menu, the countdown
and the bank, `EndTurnMenuCall`, `TimeIsUp`, `DrawTimeClock`, `FUN_0047f76e`,
`FUN_004152f6`), and for the Mac the New Game window's "Automatically end turn for
unconnected players" (`rs.autoEndBox`, no effect) and End Turn and Switch Players
(`rs.switchPlayers`, `ServerEndAroundSwitch`). Luck in Battles was already in the window,
and the four winners' star names are drawn as the window opens (`rs.nameAStar.pick`
'run'), with nothing of them shown.

### Mac-only interface

- **The colour-monitor joke** (`AddEasterEggs` @b000c, segment "TopSecret"): in a random
  year from 2000 to 5000 (player +0x5e, `CreatePlayer`), if the screen shows fewer than 16
  colours and could show 256, the report "Your scientists have discovered how to turn
  your monitor from black and white to color!" (1111; 1112 and 1113 are its follow-ups).
  Built (October 2026): a black-and-white skin is that screen, so the joke comes in
  `p.colorJoke`'s year, once (`rs.colorMonitorBW`, engine.js `endTurn`).
- **Menus** (MBAR 128): File has Begin Game, End Turn and Switch Players (hot seat on one
  Mac), Page Setup and Print; Options has Auto Play, Sound, Master Point List, Hall of
  Fame, Hall of Shame, Preferences; Ships' "Scrap Current Fleet" reads "Don't Scrap
  Current Fleet" for a marked fleet (`SetMenuItems`; Windows' text never changes); a
  Window menu shows the
  floating Tech Spending, Report and Chat windows, Zoom In / Out, Hide Information and
  Clean Up Windows (`WinMgr`).
- **Auto Play** (`doAutoPlayDialog`, DITL 4020): "Have computer play for me", "Just mark
  me done every turn", "I'll play my own turns", "Mark me done until something
  interesting happens", with a Config window (Friendly, Aggressive, Dig In, No Defense).
- **The Hall of Fame, Hall of Shame and Master Point List** (`AddToHall` @104ade,
  `doHallOfFameDlg`, `doDetailsDlg`, `doMasterListDlg`): the Master Point List's picture
  is the computer-intelligence face for the points (icons 3030-3033: Dumb under 5,000,
  Average under 50,000, Smart under 500,000, else Diabolical), all four present; a
  winner names a star (`NameAStar`, STR# 2000 in the Preferences, four used a galaxy).
- **Network play** through a "mailbox" game file on a shared volume, with semaphores and
  a server window (segments Network, ServerWinProc), Apple events, printing, the
  supernova and Armageddon graphics with gamma fades (`DoGratuitousGraphics`,
  `DoFadeAndBack`), black-and-white and colour drawing throughout.

### 3.0.1

Mac 3.0.1 reads the same MaTh tables, so its galaxy (`js/rules-301.js`, which uses this
generator) has the same pi; it keeps the exact pi for now (its output is unchanged).

## Built later (October 2026)

- **Send Message** (built, October 2026; `FUN_0049a8e1`, `FUN_0049b2d0`, delivery in
  `FUN_004320f8`): 3.0.1's four columns in Windows' words (strings 674-688, 771-776), with
  "Text Msg." (0x41d, 24 letters) and, in a game with alliances, "Your Allies" and "Your
  Buddies"; "I own" (0x412) marks the star, Star Stats (0x41b) explores it, My Stats
  (0x419) gives your home. The Mac's words are STR# 6220/6240/6040 (`js/rules-mac405.js`).
- **The date jokes** (checked, October 2026): the only date the program reads in play is
  in `FUN_00438f47` (SetPlanetTypesForStar; Mac @d020a): on 25 December your colonies show
  the Christmas planet, already in the w95 and mac4 skins. The other clock reads are the
  Hall of Fame's dates (`FUN_0049883d`, `FUN_00498b6a`) and the Mac's licence strings.
