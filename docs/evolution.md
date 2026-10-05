# How Spaceward Ho! grew

Spaceward Ho! changed a great deal between 1992 and 2003. This file goes through the
versions the remake has, in order, and says what each one is and what it added, removed
or changed. It is written one version at a time, from the code of each (the findings
files and coverage files cited); anything not read in the code is marked INFERRED.

| Version | Year | Platform | Remake ruleset |
|---|---|---|---|
| 1.2F | 1992 | Mac (68k), French edition | `js/rules-12.js` |
| 2.0 | 1993 | DOS and Windows 3.1 | `js/rules-dos.js` |
| 3.0.1 | 1993 | Mac (68k), first in colour | `js/rules-301.js` |
| 4.0.5 | 1996 | Windows 95 (and Mac 4.0.5) | `js/rules-405.js` |
| 5.0.5 | 2003 | Mac OS 9 / X (PowerPC) | `js/rules-original.js` |
| 5 for Palm OS | 2003 | Palm (68k), a port of 5.0 | `js/rules-palm.js` |

---

## Mac 1.2 (1992)

### What it is

1.2F is the French edition of the Mac game (Delta Tao, published by Upgrade Editions,
Paris). It is not an older engine than 2.0 but **a cut-down pre-release of 2.0**: an
error box calls it "a development version of Spaceward Ho! 2.0", the about box says
"Pre-Release Version 2.0b1", and its routines and report list are 2.0's, line for line.
Its credits read "Spaceward Ho! Version 1.2 by Peter Commons. Artwork by Howard Vives."
Everything below is from its own code (`docs/12-findings.md`, `docs/coverage-12.md`).

### Rules

| Area | 1.2 |
|---|---|
| Money | one pool, divided every turn by per-mille shares: one per colony, one for Technology, one kept as Savings, used as they stand (and by thousands once the pool passes $2,000,000). No borrowing, no debt, no "Dip into savings". Kept money earns 10 × √(kept + refunds). A new colony's share is taken from the others; a lost colony's goes to Savings |
| Colonies | each pays for itself from its own share; a losing colony whose share can't cover the loss loses people, and is abandoned at none. Each colony splits its money between terraforming, mining and ships; a finished part's share passes to the others |
| Planets | growth and income as later versions (income uses the log of the whole square root of the population); maximum population 500,000 − 12 × hostility |
| Terraforming | the first $5,000 goes into the planet, then √(money / 2) tenths of a degree a turn |
| Mining | 15 × √money metal |
| Research | √(money ÷ 120 for Range, 150 Speed, Weapons, Shields, 200 Mini) × a random 60–140 % each turn; Range costs L², the others (L+6)², (L+2)², (L+7)²; five technologies, no Radical |
| Ships | four classes: Scout, Fighter, Colony Ship, Satellite; 20 designs; cost (R+10)(V+15)(W+13)(S+13) ÷ 30.6; a design's first ship costs a prototype premium (humans only) |
| Shipbuilding | three queue slots at each colony, paid from its ship share; a ship that can't be finished is part-paid |
| Fleets | a fleet is one design; routes through your own colonies, planned again at every stop |
| Battles | the colony's owner holds the star; each other player fights the holder in turn, one duel each, with its own reports. Fastest ships fire first; one target per side (colony ships, then satellites, then a random group, then the planet); a hit table ("WPNRAT"); no luck, no stances |
| Events | none: no novas, revolts or volcanoes (their text is in the program, unused) |
| Diplomacy | none: no alliances, no messages between players, no gifts or surrender |
| End of the game | a player with no colonies is "dying" for a turn, then out (colony ships don't save them); from 2010 the last player standing wins. An out player's fleets stay and still fight |

### Computer players

One computer, at Average. Its turn (`DoComputerTurn`) keeps a map of what it knows
(star classes and battle estimates), lists up to 50 wants by priority (research, colony
support, mining, finishing queued ships, exploring, attacking, colonizing,
terraforming, satellites) and works down the list, queueing ships like a human. Its
personality has ranges for research, income per colony, defence, domination margins,
aggressiveness and desire for metal. 2.0 kept this computer turn almost unchanged.

### Options and galaxy

There is **no New Game window**: the program asks only for the galaxy file's name, and
every galaxy is a Small (21–32 stars), Dense Circle with one Average computer; every
human starts at Normal skill ($30,000, 5,000 metal, 500,000 people). The galaxy
generator underneath already has 2.0's five styles and sizes. Up to 19 humans may join
the file in 2000, each with a password. Every player is a man (no women's faces or
names); the computer and ship names are French.

### Interface

Menus: File (New, Open, Save, End Turn), Edit, Options (battle speed, show messages,
watch battles, spending alert, sound), Ships (existing designs, new design, fleet
status, organize ships of a design, build ships at a planet, scrap fleet, review
battle), Galaxy (explored planets, zoom, Fix Spending), Windows (Technology, Reports).
Temperatures are shown in °C.

### Art and sound

Black-and-white and colour icons (`ICN#`, `icl8`): planets by state, a face per player
(2000 + face), report pictures; 13 sounds (good and bad news, exploring good / middling
/ bad, battle). Ships are drawn from parts.

---

## DOS / Windows 3.1 2.0 (1993)

### What it is

2.0 is the game 1.2 was a pre-release of. The Windows 3.1 edition (`WINHO.EXE`, 1992,
Windows programming by Steven Ohmert at Presage) came first; the DOS edition (1993, Ed
Murphy at Presage, for New World Computing) is a port of it, with the same art, sounds,
tables and turn code. Its credits read "Spaceward Ho! Version 2.0.1 by Peter Commons.
Artwork by Howard Vives." Everything below is from the code of both programs
(`docs/coverage-20.md`, `docs/dos-findings.md`; 1.2: `docs/coverage-12.md`,
`docs/12-findings.md`).

### Rules: what stayed

The turn is 1.2's, routine by routine and constant by constant: one money pool divided
by per-mille shares; colonies paying for themselves from their own share; the three bars
per colony and `RestoreStarsBars` (`FUN_1040_269d` = `@a24e2`); terraforming (√(money/2)
tenths of a degree), mining (15 × √money); research (√(money ÷ 120/150/150/150/200) ×
60-140 %, Range costing L²); the three-slot ship queues; costs with 30.6 and 4.445;
routes through your colonies planned again at every stop; colonizing at the end of any
turn; battles as duels with the colony's owner, the WPNRAT hit table and a pair of
reports a duel; the dying-then-out rule and the last player standing from 2010. So is the
money arithmetic: shares used as they stand, not divided by their total, and worked out
by thousands once the pool passes $2,000,000; a lost colony's share going to Savings,
with its colony ships there loaded (`DecolonizeStar @a3fd4`); a new colony's share taken
from the others in proportion, never below a losing colony's need (`GiveBarPercent
@c139c` = `FUN_1010_16f2`); both passes of the turn run for players who are out; and the
year moved on before the computers plan. The galaxy generator is 1.2's too, with the
same sine tables.

### Rules: what changed

| Area | 1.2 | 2.0 |
|---|---|---|
| New game | no New Game window: every galaxy a Small, Dense Circle with one Average computer, every human at Normal skill (`CreateGalaxy @e0004`, `CreateNewPlayer @101972`) | the Create Galaxy window: five sizes, five shapes, Dense or Sparse, the computers' IQ (Dumb, Average, Smart) and 0 to 19 computers (CREATEGALAXYDLGPROC); each human picks a skill, Novice to Expert, and a gender (NEWPLAYERDLGPROC). The skill table and the computers' IQ branches were already in 1.2's code, unreachable |
| Women | every player a man | women's faces and names; each computer a woman half the time (`FUN_1050_1ec9`) |
| Novas | the code is there, gated by a style bit that is never set (`CheckForSupernova @a2640`) | gone: the turn has no nova step (`FUN_1040_0038`) |
| Messages between players | French text but no command | the Send Message window: "I like", "I don't like" or "I own" a planet or a player, ten a turn; a true "I own" shows the star as the sender's on the receiver's map (SENDMESSAGEDLGPROC, `FUN_1040_0038` @1040:062f) |
| Organize Fleets | every fleet of the design at the star gets the least fuel used; the older records keep their orders (`OrganizeFleets @113896`) | every such fleet gets the average fuel used (counted up to 11 fleets) and loses its orders (ORGFLEETSDLGPROC) |
| Dragging a budget bar | the others move in proportion with no floor (`DoHBarClick @c1002` sets every floor to 0) | a losing colony's share doesn't go below what it needs (`FUN_1010_0a7a` with `FUN_1010_218e`) |
| The computers' attack rating | worked out in 32 bits (`CalcShipPower @114e10`) | the second term in 16 bits, so it wraps from about Weapons 4 (`FUN_10f0_05e9`) |
| A colony wiped out by meteors | a blank report (1059, no text) | report 1009, "%s destroyed your colony at %s.", with a stray player's name |
| Temperatures | °C | °F |
| Names | French computer and ship names; the star list plus "Tiber" | English names (Alex … Walter, Andrea … Anne; Needle, Killer, Spreader, Defender …); 190 star names plus those winners add to a names file |

### Computer players

The same 36 routines as 1.2's `DoComputerTurn`, in the same order, with the same
constants (segment 1020). What changed is around them: there can be up to 19 computers
instead of one; their IQ can be Dumb, Average or Smart, so 1.2's unreachable Dumb and
Smart branches now play (Smart: aggressiveness 10, a free look at the stars within 9 ly
on the first turn, other computers' stars scored at a quarter); a computer is a woman half
the time; and the attack rating they compare wraps in 16 bits. A human can hand their
turn to the computer (Auto Play, AUTOPLAYDLGPROC).

### Interface

A Windows 3.1 program: a map window with floating windows for the budget, the
technology, the reports and the selected planet (`Show/Hide Floating Windows`), the
planet's three bars and the budget dragged with the mouse (`FUN_1010_04a7`,
`FUN_1010_155c`), fleets dragged on the map with the route drawn as you go
(`FUN_1080_09e5`). Windows: Ship Types (rename, mark for scrapping), New Type, Build Ships
at a planet, Fleets (mark for scrapping), Organize Ships, Explored Planets, Review Battle,
Compare Players (rankings from 2010, new in 2.0), Send Message (new), the players' skills,
Name a Star for the winner, Game Info, Auto Play, poll speed and battle speed; Fix
Spending in the budget window; printing the map (segment 10b0). Several humans join the game file
in 2000 with passwords, as in 1.2, and can play from different machines: the game waits
for everyone or lets a player force the turn (boxes 3070, 3210, 3230).

### Art and sound

The DOS and Windows editions share 392 of their 394 pictures (planets by state, faces,
ship parts drawn by Range + Speed, Shields and Weapons, with hidden ships at 12/12 and
15/15, report pictures) and the same 14 sounds; see `docs/dos-findings.md`, "The DOS
skin".

## Mac 3.0.1 (1993)

### What it is

3.0.1 (Delta Tao, 1993) is the first colour Mac version, a 68k program with MPW's
MacsBug names left in, so every routine is named. It is **2.0's game with a new money
model and new events**: its turn is 2.0's two passes, routine for routine, worked out
with 2.0's arithmetic, and the engine of 4.0.5 and 5.0.5 starts here (Ship Savings,
alliances, Radical tech, novas, the 4.0.5 galaxy generator). Everything below is from
the code of both programs (`docs/coverage-301.md`, `docs/301-findings.md`; 2.0:
`docs/coverage-20.md`, `docs/dos-findings.md`).

### Rules: what stayed

The turn (`EndTurn @a0004` against `FUN_1040_0038`): for each player the computer plans,
then the money, terraforming and mining, research and moves; then every battle; then
for each player income, colonizing and exploring. Budget shares per mille, used as they
stand, with the $2,000,000 rule; Savings, Technology and the colonies newest first; a
new colony's share set by redistribution (7,500,000 ÷ the money, when over $20,000), a
lost colony's share going to Savings with its colony ships loaded (`DecolonizeStar
@a5ac0` = `FUN_1040_38c0`); colony bars with −1 for a finished part scaled to 1,000 at
the end of each pass (`RestoreStarsBars @a2e4c` = `FUN_1040_269d`); terraforming
(√(money/2) tenths, the first $5,000 sunk) and mining (15 × √money); income with the log
of the whole square root; 10 colonists a colony ship; meteors from ships scrapped in
hyperspace; routes through your colonies planned again at every stop; battles as duels
with the colony's owner, the WPNRAT hit table (resource `MaTh 1002` "Weapon Ratios"),
groups of one design, colony ships and satellites targeted first, a pair of reports and
a replay per duel, debris a fifth of the metal; the four ship classes, 20 designs and
2.0's design sliders; Skill Levels Novice to Expert with 2.0's starting money, metal
and people; 0 to 19 computers; 1.2's and 2.0's computer players at the core (star
classes, strength estimates, a list of at most 50 actions by priority).

### Rules: what changed

| Area | 2.0 | 3.0.1 |
|---|---|---|
| Money | one pool, never below $0; interest 10 × √(kept money + refunds); colonies paid from their own share (`FUN_1040_27ee`) | Total Money shared out each turn and **Ship Savings**: 10 × √savings interest, debt at 15 %, a borrowing limit of −5 × income; losing colonies paid from this turn's money, then Ship Savings; global warming and a fleet scrapped when even that fails; Dip Into Savings (`DeductInterest @a0e32`, `MaintainKillStars @a10c8`, `DipIntoSavings @f41cc`) |
| A colony's bars | three: Terraform, Mine, Ships; a finished part −1 for good | two: Terraform and Mine; at the end of each turn a part is set done at your temperature or out of metal and set back after global warming, and a colony with both done gives its share away (`SetPlanetDisplayValues @a4b60`) |
| Starting budget | Savings 0, Technology 150, home 850; home bars terraform done, mine 200, ships 800 | Savings 650, Technology 250, home 100; home bars Terraform done, Mine 1,000 (`CreatePlayer @f26a0`, `Stup 1000`) |
| Ships | three-slot queues at each colony paid from its Ships bar; costs (R+10)(V+15)(W+13)(S+13) ÷ 30.6, satellites (W+13)(S+13) × 4.445 | bought at once out of Ship Savings, with a prototype price for a new design; (R+10)(V+15)(W+13)(S+17) ÷ 38.75, satellites 2.381 (W+13)(S+26) (`BuildAShip @132e04`, `CalcShipCosts @134de6`) |
| Research | √(money ÷ divisor) × a random 60–140 % each turn; no Radical; no head start | × 8/10, fixed; Radical tech with six outcomes; a head start of 0–40 into each level (`SpendTechMoney @a1ed2`, `DoSomethingRadical @a5d4e`) |
| Starting tech | exactly 6/2/2/2/0 | the same plus a head start, and a research split by tech (`CreatePlayer`) |
| Battles | no luck; the planet uses its owner's Weapons tech for both Weapons and Shields | luck: −1, 0 or +1 Weapons a side each duel; the planet uses its owner's Weapons and Shields; allies don't fight (`DoBattleStage @e0004`) |
| Novas | none | red stars after 2749 (1 in 100 a turn), supernovas hitting stars within 11 ly, and Armageddon when every human switches it on (`CheckForSupernova @a33cc`, `CheckForArmageddon @a3268`) |
| Diplomacy | Send Message only ("I like", "I don't like", "I own") | alliances (both must want them), gifts of money and metal (3 a turn), surrender to another player, 14 canned messages (10 a turn) (`ConformPlayerAlliances @a2f76`, `DoGiveThingsDlg @1437e0`, `SurrenderIfDesired @a1760`, `DoSurrenders @a482a`) |
| Giving up a colony | no command (only leaving it unfunded) | Abandon, a toggle carried out at End Turn (`DoGalaxyMenu @f3ece`) |
| Underfunded colonies | still grow | don't grow that turn (`MaintainKillStars`) |
| Out of the game | no colonies: dying for a turn, then out (colony ships don't count); out players still play their turn | no colonies and no colony ships: out at once, money, savings and metal to 0, fleets scrapped next turn, no more planning (`DoGameEndStuff @a6d06`, `ScrapFleetsAndTypes @a1ae8`) |
| Winning | the last player standing, from 2010 | from 2010, every player left allied with every other: a lone player at once, an alliance if it holds a turn (`CheckForWinner @a731a`) |
| Organize Ships | the average fuel used (counted up to 11 fleets); orders cleared; new fleets loaded | the most fuel used; orders kept; "built this turn" and "loaded" only if all were (`OrganizeFleets @133d14`) |
| Dragging a budget bar | never below a losing colony's least share | between 0 and 1,000 (`DoHBarClick @d18a0`) |
| Battle reports' sounds | none | none, but 2001 for "destroyed your colony" (`PlayAnnounceSound @16156e`) |
| A colony wiped out by meteors | report 1009 with a stray player's name | "The meteor shower destroyed your colony at %s." (1000.71) |
| Galaxy | five sizes; five shapes (Circle, Random, Ring, Spiral, Grid); Dense or Sparse | 4.0.5's: six styles (Circle, Random, Ring, Spiral, Grid, Cluster), five sizes, Dense or Sparse; Spiral and Cluster laid out in 2010; the map 2 ly from the left; a Circle's last ring evened out (`CreateGalaxy @f0004`) |
| Star names | 190 | 191: 2.0's and "Hope" |
| Ship names | 2.0's lists | 3.0.1's own (STR# 2001–2004), for humans' designs too (`GiveTypeCoolName @95296`) |
| Options | computer IQ Dumb, Average, Smart; 10 years a turn | Dumb, Average, Smart, Diabolical; 10, 20, 30, 50 or 100 years a turn; an Alliances check box (DITL 6080) |

### Computer players

40 routines instead of 36 (segment 9), the old scheme grown up: ships bought at once out
of Ship Savings, keeping a reserve of a few turns' income; designs dropped and drawn up
by an "obsolescence" score (`MaintainShipTypes @94794`, `CalcTypeObsolescence @94bcc`),
old ships scrapped or sent home, stranded fighter fleets asking for a colony; colonies
the income can't support abandoned; a feeling for every player, moved by battles,
messages, gifts and alliances, which decides alliances (with the option on) and whom a
broke computer surrenders to (`MsgReactDetermineAllies @9537e`, `ModifyAlliances
@95dc8`, `ComputeStatus @93fa8`). A fourth level, Diabolical, and among Smart and
Diabolical computers "turtles" and "raiders" with their own personalities
(`SetCompAttrs @f32ec`).

### Interface

A colour Mac program with floating tool windows (map, budget, technology, reports) and
pie and bar controls for the colonies (`BarControl` segment). New windows: Alliances,
Give, Surrender, the canned Send Message, Player Skills, History graph, the Hall of
Fame and Hall of Shame with a difficulty rating, the auto play settings; Dip Into
Savings and Abandon in the Galaxy menu. Kept from 2.0: Compare Players, Explored
Planets, Organize Ships, Review Battle, Fix Spending, naming a star after a win, auto
play, several humans joining the game file with passwords, across a network.

## Windows 95 4.0.5 (1996)

To be written in turn.

## Mac 5.0.5 (2003)

To be written in turn.

## Palm 5 (2003)

To be written in turn.
