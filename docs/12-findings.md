# Spaceward Ho! 1.2F for the Macintosh: findings

Spaceward Ho! 1.2F is the French edition of the Mac game (Delta Tao, translated and
published by Upgrade Editions, Paris, 1992; a 68k program, `vers` 1 "1.2F"). It is the
oldest version decompiled for the remake. This file explains how the "Mac 1.2" ruleset
(`js/rules-12.js`) was made and how it differs from the DOS 2.0 rules in
`js/rules-dos.js` and the Mac 3.0.1 rules in `js/rules-301.js`.

The program was decompiled from its resource fork with `tools/decompile/mac68k.py` and
`tools/decompile/Mac68k.java`, as 3.0.1 was (see `docs/decompiling.md`). MPW left a
MacsBug name after every routine, so functions are cited by name and by address in that
layout (segment *n* at *n* × 0x10000), for example `SpendTechMoney @a1a58`. Text is cited
by resource: `STR# 1000.n` is the n-th report template, `DITL n` a dialog box.

Labels, as in the other findings files:

- **CONFIRMED**: read in the decompiled 1.2 code (or its resources), cited by function and
  address. "Same as DOS 2.0" means the 1.2 routine was read and does what
  `docs/dos-findings.md` describes.
- **GUESS**: the decompile doesn't settle it, so the remake follows DOS 2.0 or makes a choice.
- **NOT IMPLEMENTED**: in 1.2 but not in the remake.

## The short version

1.2F is **a cut-down build of the 2.0 engine**, the same engine as DOS / Windows 3.1 2.0.
Its own text gives this away: an error box says it is "a development version of Spaceward
Ho! 2.0" (DITL 2000), another that "Spaceward Ho! 2.0 can't read files made with versions
1.0 – 1.1.2" (DITL 3030), and the about-box strings are "Pre-Release Version 2.0b1" and
"Spaceward Ho! Version 2.0" (STR# 1002.9–10). Its 59 report templates (STR# 1000) are the
same list, line for line, as DOS 2.0's strings 672–730.

Routine by routine, its rules are DOS 2.0's: one money pool divided by per-mille shares,
colonies that pay for themselves, ships queued at each colony and paid from its ship share,
research at 60–140 %, the same ship costs, the same battles and the same galaxy generator.
So the ruleset is the DOS 2.0 one (`Object.assign` over `E.RULESETS.dos`) with these
differences:

- **No New Game choices.** Every galaxy is a small, dense Circle with one Average computer;
  every human starts at Normal skill.
- **No women.** Every player, computers too, is a man.
- **French computer and ship names**, and one more star name (Tiber).
- The 1.2 credits as the first messages, and an "updated to the year" message every turn.
- No notice when someone else's fleet arrives at your colony.
- **Its own computer players** (`js/ai-12.js`, a port of `DoComputerTurn` and the routines
  it calls), not the 5.0.5 ones the DOS 2.0 ruleset uses.
- **Its own end of the game**: a player with no colonies is out after one turn, colony
  ships or not, and the last player standing wins.
- **Shorter battle reports**, 1.2's own, one pair for each duel at a star.
- No messages between players, routes planned again at every stop, fleets of one design,
  and finished terraforming or mining bars handed on (see "Settled in the full pass").

## How it differs from 3.0.1

3.0.1 (1993) is the next Mac version and a different engine (the one behind 4.0.5 and
5.0.5). Compared with it, 1.2 has: one money pool instead of Ship Savings, no borrowing and
no interest on debt; ship queues instead of buying ships at once; random research
(60–140 %) with no head start; DOS 2.0's ship costs (S+13, ÷ 30.6; Satellites
(W+13)(S+13) × 4.445) instead of (S+17) ÷ 38.75; no prototype costs for computers; no
luck in battles; no Radical tech, alliances, gifts, surrender, Armageddon or novas; five
galaxy styles (no Cluster) and DOS 2.0's star placement and distance. See
`docs/301-findings.md` for 3.0.1's side.

## Ruleset differences from DOS 2.0

### Setup

| What | 1.2F | Status |
|---|---|---|
| New Game | no options window. `NewGame` asks only for the galaxy file's name ("Nom de la nouvelle galaxie:", STR# 1002.3); then players join one at a time with a name and a password (DITL 4001 "Your nom de guerre, please:") | CONFIRMED (`NewGame @100004`, `RegisterOrCreatePlayer @1016c2`) |
| Galaxy settings | `CreateGalaxy` copies style, density, size, computer skill and number of computers from the preferences (`Stup 1000`) and then overwrites them all: style 1 (Circle), density 1 (Dense), size 1 (Small, 21–32 stars), computer skill 2 (Average), 1 computer. The generator itself still has all five DOS 2.0 styles and sizes, and both densities | CONFIRMED (`CreateGalaxy @e0004` @e0166–e01b8) |
| Your skill | always 2 (Normal): $30,000, 5,000 metal, 500,000 people, the four starting designs and no free ships. The table for the other four skill levels is DOS 2.0's and is still in `CreatePlayer` | CONFIRMED (`CreateNewPlayer @101972` @101a48, `CreatePlayer @e16a4`) |
| Computer | one, Average ("Moyen"); it starts at 4 − 2 × (skill − 1) = Normal, like DOS 2.0's Average | CONFIRMED (`CreateNewPlayer` @101a50, `CreateGalaxy`) |
| Joining | humans may join only in 2000 ("too late to join", DITL 3060), up to 19 of them (20 slots minus the computer). The box "this version is for up to two human players" (DITL 3370) is never shown | CONFIRMED (`CreateNewPlayer`; no caller of ALRT 3370) |
| Gender | `CreateNewPlayer` gives every player gender 0, so every planet icon and face is the man's and the computers are named only from the men's list | CONFIRMED (`CreateNewPlayer` @101aee; nothing else writes that field) |
| Computer names | STR# 1999 (men), picked at random without repeats | CONFIRMED (`DoGameSolidificationStuff @a49d6`) |
| Home world, technology, budget, designs, free ships | as DOS 2.0 | CONFIRMED (`CreatePlayer`) |
| Computer personalities | `SetCompAttrs` sets the fields the DOS 2.0 ruleset uses to the same ranges (Average: attack margin 150–200), and some more; see "Computer players" below | CONFIRMED (`SetCompAttrs @e20f6`) |
| First messages | "Spaceward Ho! Version 1.2 by Peter Commons." and "Artwork by Howard Vives." (STR# 1000.1–2) | CONFIRMED (`CreatePlayer` seeds the message list with reports 1000 and 1001) |

The remake fixes these settings in `fixOptions`, so whatever the New Game window sends, a
1.2 game is a Small, Dense Circle with one Average computer, Normal skill, no women, no
novas, no alliances, no luck and 10 years a turn.

### Galaxy

| What | 1.2F | Status |
|---|---|---|
| Star counts | as DOS 2.0 (Small: 20 + 1–12) | CONFIRMED (`CreateGalaxy`) |
| Circle | rings 4 ly apart (Dense), r × 44 / 35 + 1 stars a ring, up to 20 tries at ± 1 ly | CONFIRMED (`GiveGalaxyCircleCoords @e05a6`) |
| Spacing, home stars, margin, distance | as DOS 2.0: at least 4 ly between stars; homes 20 ly apart, relaxing by 4; shifted to a 2 ly margin; distance (10 × longer + 3 × shorter + 9) ÷ 10 | CONFIRMED (`StarSafe @e1432`, `AllocateHomeStars @e1024`, `ConformCoordinates @e125c`, `Distance @122e6`) |
| Star stats | as DOS 2.0 | CONFIRMED (`GiveStarsValues @e14ae`) |
| Star names | STR# 1003 (the DOS 2.0 list of 190) plus STR# 2005 "More Star Names", where winners' names go; the program ships with one, "Tiber". At most 7 letters | CONFIRMED (`GiveStarsValues`) |
| Novas | `CheckForSupernova` only runs when style bit 0x10 is set, and 1.2F always sets style 1. So there are no novas, and no black holes (a fleet is lost only at a star that has exploded) | CONFIRMED (`CheckForSupernova @a2640`, `MoveShips @a20ee`) |

### Money, research, ships, battles

All as DOS 2.0:

| What | Status |
|---|---|
| A losing colony that its share can't support loses people (population × share ÷ loss − 100) and is abandoned at 0 | CONFIRMED (`KillUnsupportedStars @a0960`) |
| Terraforming: first $5,000 into the planet, then √(money/2) tenths of a degree, overshoot refunded at 2 d²; the "never profitable" warning every turn. Mining: 15 × √money, overshoot refunded at ⌈ex²/225⌉ | CONFIRMED (`TerraformMineStars @a0a9e`) |
| Ship queues: three slots a colony, part-payment of the first ship, humans pay the prototype, computers never do; the three shipbuilding warnings; Fighters and Satellites join an idle fleet of their type | CONFIRMED (`BuildNewShips @a1406`, `PutNewShipAtStar @a18b8`) |
| Research: √(money ÷ 120/150/150/150/200) × 60–140 %; Range L², Speed (L+6)², Weapons and Shields (L+2)², Mini (L+7)²; "not spending any money on technology research" every turn | CONFIRMED (`SpendTechMoney @a1a58`) |
| Interest 10 × √(kept + refunds); meteors 50 per unit of metal; growth; income with the log of the whole square root; pool clamped to 0..999,999,999 | CONFIRMED (`ComputeIncomeAndPopulation @a2de6`, `EndTurn @a0004`) |
| New colonies: 10 colonists a colony ship, terraform 900 / mine 100 (or mine 1,000 when gravity is over 2.56 × home's), a $15,000 share when the pool is over $20,000. Colony ships at your colonies are refilled | CONFIRMED (`ColonizeStar @a3d84`, `ColonizeAndExplore @a3556`) |
| Scrapping: humans get 3/4 of the metal; in hyperspace it falls on the next star; over someone else's star it falls onto the planet | CONFIRMED (`ScrapFleetsAndTypes @a0e02`) |
| Routes through your colonies, at most 42 ÷ Range hops, planned again at every stop | CONFIRMED (`CheckFleetDestination @a23d2`, `DeterminePath @1105ae`) |
| Ship costs: B = (R+10)(V+15)(W+13)(S+13) ÷ 30.6, Satellite (W+13)(S+13) × 4.445; mm = (Mini+1)/2 + 0.5; Colony Ship + $45,000, + 3,000 metal, + 1,000 hit points; prototype 2 mm × price | CONFIRMED (`CalcShipCosts @114746`) |
| Design sliders and the 20-type limit | CONFIRMED (`SetSBMinMax @111c3c`, DITL 3280) |
| Battles: the colony's owner holds the star and the others fight it in random order; at most 5 groups; fastest first; one target a side (colony ship, satellite, a ship from a random start, the planet); (0–20 + 5W + 10) × WPNRAT (resource `MaTh 1002`, the DOS table), ÷ 6 against ships, × 4 against the planet; the planet fires last with its owner's Weapons; no luck | CONFIRMED (`DoBattleStage @d0004`, `CalculateGroups @d1194`, `HaveGroupShoot @d1746`, `PickTarget @d1f0e`) |

### Events and messages

| What | 1.2F | Status |
|---|---|---|
| Random events | none, as DOS 2.0. The text of a revolt (STR# 1000.13, DITL 3090), a volcano (1000.16), metal found (DITL 3110), a lost fleet (DITL 3120), a nova (1000.9, DITL 3130), stolen tech (DITL 3160) and a forfeit (DITL 3150) is there, but nothing shows it | CONFIRMED (every caller of `AddNewMessage`) |
| "You have entered the year N." | every player's turn opens with it (STR# 1000.11, worded in English as DOS 2.0's line 682, "The game has been updated to the year N.") | CONFIRMED (`EndTurn` @a025e); added in `economy` |
| A fleet arriving at your colony | no message to the colony's owner (DOS 2.0's ruleset turns the remake's `arrivalNotices` on; 1.2 has no text for it) | CONFIRMED (`MoveShips`, STR# 1000) |
| A meteor shower wiping out a colony | 1.2 sends report 1059, which has no template in STR# 1000 (it has 59 lines), so the report is a blank line; the remake shows it blank | CONFIRMED (`ComputeIncomeAndPopulation`, `GetReportString @130746`) |
| Exploration | "You have explored …" shows gravity relative to home and the temperature in **°C** to a tenth: (T − home + 720 − 324) × 5/9 in tenths, so a planet at home's temperature shows 22.0 °C. The ruleset sets `celsius: true` so a skin can turn its Celsius preference on | CONFIRMED (`ExploreStar @a3b4c`) |
| Ship names | a new design gets a random name from STR# 2001 + class that no current design has (up to 100 tries; then the last one tried) | CONFIRMED (`GiveTypeCoolName @9457e`) |

### Battle reports

1.2 fights a star's battle as duels (the holder against each other player in turn) and
writes two reports for each duel, one for the attacker and one for the defender
(`MakeResultMessages @d2828`); the remake does the same (`battle12` in `js/rules-12.js`).
The texts are 1.2's, worded as DOS 2.0's lines 705–707 and 681:

| Who | Report | Status |
|---|---|---|
| the winner | "You won a battle at S. You lost N of your ships. X lost M." (STR# 1000.34) | CONFIRMED |
| a defending colony that won with no ships of its own left | "S successfully defended itself against an enemy attack from X." (1000.36) | CONFIRMED |
| the loser | "You lost a battle at S. You lost N of your ships. X lost M." (1000.35) | CONFIRMED |
| a defending colony that had no ships and lost | "X destroyed your colony at S." (1000.10) | CONFIRMED |
| debris | "You have recovered N metal from the battle at S." to a winning colony owner, else "N metal has fallen onto S from your recent battle." to the winner (1000.52–53) | CONFIRMED (as DOS 2.0) |

There is no "You lost N people" line, and nothing about the colony when a defender with
ships loses. `PlayAnnounceSound @130f08` plays nothing for the battle reports and 2001 for
a destroyed colony. The remake keeps sound 7027 on a won battle, because the skin's auto
play stops on it (interface; listed in `docs/open-questions.md`).

Each battle also leaves every player who fought there an estimate of the enemy strength,
which the computers use (see below). The loser learns the strength of the ships left and,
at a colony, of the planet, ((population + 49) / 50) × (Weapons + 1)² / 125. Half the time
it learns less. The winner's estimates are cleared. A colony's owner that was attacked
puts more of its metal into defence: at least 70 % after a loss and at least 40 %, then
+10, but no more than its "% of colonies defended". All CONFIRMED (`MakeResultMessages`).

### The end of the game

| What | 1.2F | Status |
|---|---|---|
| Losing your last colony | at the end of each turn a player with no colonies is marked as dying, colony ships or not, and everyone is told "X has just been eliminated from the game." (STR# 1000.55–56) | CONFIRMED (`DoGameEndStuff @a4406`, `CheckEndGame @100702`) |
| Out for good | still no colonies at the end of the next turn; a colony founded in between brings the player back | CONFIRMED (`DoGameEndStuff`) |
| The winner | from 2010 on, with more than one player, the only player who is neither out nor dying: "Congratulations! You have just won the game." / "X has just won the game." (1000.57–58) | CONFIRMED (`CheckForWinner @a4948`, `CheckEndGame`) |
| The fleets of a player out for good | nothing removes them. They still fight whoever comes (no battle routine checks who is out), and a computer keeps giving them orders: `EndTurn` runs `DoComputerTurn` for every computer slot whatever its state. A colony ship of theirs that lands brings the player back into the game: `DoGameEndStuff` sets an out player with a colony back to playing. Once someone has won, that stands. | CONFIRMED (`EndTurn @a0004`, `DoGameEndStuff @a4406`, `CheckForWinner @a4948`) |

## Computer players

`js/ai-12.js` is a port of `DoComputerTurn @90004` and segment 9. DOS / Windows 2.0 turned
out to have the same computer turn (`docs/dos-findings.md`, "Computer players"), so the DOS
2.0 ruleset uses it too; the one difference, the attack rating's arithmetic, comes from each
ruleset (`rs.shipPower`). Everything in this section is CONFIRMED from the routine named.

**Personality** (`SetCompAttrs @e20f6`; the fields of the hidden "Computer Params" window,
DLOG 500):
- rebuild difference 1;
- up-front research 15–25 % and more research 15–25 % of income;
- income per colony $33,000–37,000;
- colonies defended 30–70 %;
- metal for defence 30–70 %;
- defending domination 150–250 %;
- attacking domination 150–250 %;
- aggressiveness 3–7;
- desire for metal 25–75;
- satellite shields cap 11–13;
- research shares: Range and Speed 160–200, Weapons 200–260, Shields 200–260 but no more
  than Weapons, Mini the rest of 1,000.

The skill levels change some of these:
- **Dumb**: up-front 4 %, more 1–6 %, colonies defended 10–20 %, both dominations 75–95 %,
  aggressiveness 1, satellite cap 30.
- **Average**: up-front 10–20 %, attacking domination 150–200 %.
- **Smart**: up-front 10–20 %, aggressiveness 10.

A human on auto play keeps the base values, with skill 0.

**Each turn:**
- **Designs** (`MaintainShipTypes @93cdc`).
  - A design with no ships in service that is behind your tech in any stat is scrapped.
  - Each class has one design to build: the one with the best Mini (colony ships: the
    best Range).
  - A new design (Scout Range +2 and Weapons and Shields −1; Satellite Range 0, Shields 1
    above the cap; Colony Ship Mini ÷ 3) comes when Mini tech is 1 ahead of it. Colony
    ships get a new design when Range is 2 ahead and none are in service.
  - Past 15 designs, unused older ones are scrapped, then all older ones.
- **Assessment** (`ComputeStatus @9388e`).
  - Metal for defence drops by 1 a turn (0–80).
  - Colonies the income supports: (income per colony + income − 30,000) ÷ income per
    colony.
  - Colonies to keep terraforming: (income per colony × 1.5 + income − 30,000) ÷ income
    per colony.
  - Spare metal: metal in hand and on your colonies, plus your fleets' metal, less 5,000,
    or less a colony ship's metal for each colony ship.
  - The spare metal is split between defence and offence by the smaller of metal for
    defence and colonies defended, less the satellites and fighters you already have.
- **The map** (`FillInStarStatus @94878`).
  - Each star gets a class: unexplored, explored and free, someone else's, a battle seen,
    a fleet of yours there or on its way, or your colony (paying, losing, or losing with
    hostile gravity).
  - It gets two threats from the battle estimates:
    - at your colonies: what was seen there, or a fighter from every unknown star within
      Range + 1;
    - elsewhere: what was seen there, or within 10 ly of an unexplored star.
  - Estimates fade:
    - 60 years after a battle, half the time to 5;
    - every 200 years, to 6 or 56 × (Weapons + 1)².
  - Other players' stars with no battle seen are guessed at 40 × (Weapons + 1)².
- **Old ships** (`ScrapOldSats @94220`, `ScrapOldFighters @9432e`). Satellites of an old
  design at your colonies are scrapped. Fighters of an old design are scrapped at your
  colonies; elsewhere they head for the nearest colony.
- **Actions** (`AddActionToList @94662`): at most 50, by priority:

| Action | Priority | Status |
|---|---|---|
| research: up-front % of income, then more % (only out of income not yet spent) | 90, 25 | CONFIRMED (`DoComputerTurn`, `SpendPercentOnTech @930c2`) |
| support a losing colony (its loss) | 99, hostile gravity 98 | CONFIRMED (`AddColonySupportActions @90294`) |
| colonies beyond what the income supports: the worst stop getting support, unless ships are refuelling there | — | CONFIRMED (same) |
| mining: ⌈(metal + 25)² / 225⌉, at most 7,500 (hostile, not Dumb) or 2,500 | 75 hostile, 30 others | CONFIRMED (same) |
| finish queued ships (their price, the full prototype price for a design never built) | 87 | CONFIRMED (`AddShipFinishingActions @90982`) |
| explore unexplored and free stars with no enemy near, from the nearest colony within a colony ship's (55) or a scout's (54) Range | 55, 54 | CONFIRMED (`AddExploreActions @90d2e`) |
| attack: stars scored by aggressiveness, their worth, metal and distance from the middle of your colonies, ± a quarter at random (Smart computers score other computers' stars a quarter) | aggressiveness × 5 + 35 | CONFIRMED (`AddAttackActions @9103e`, `PickAttackLoc @9118e`) |
| colonize only stars where you have a fleet: a planet 10 better than your worst colony, then the best by worth and desire for metal | worth + 38 (+ 77 with no colony ship) | CONFIRMED (`AddColonizeAction @9139e`) |
| terraform: 3/5 of your money shared by the colonies still being terraformed, at most 5,000 for a paying colony, 1,800 (Dumb), 7,200 under $150,000, 20,000 above | 70 paying, 80 losing | CONFIRMED (`AddTerraformingActions @90b7a`) |
| satellites where the threat × defending domination % beats your satellites and the planet, at most colonies defended % of colonies; one at each hostile colony with none; scrap satellites where there is no threat | 60 (scrap 10) | CONFIRMED (`AddSatelliteActions @91d04`) |

- **Carrying them out** (`PerformActions @92180` and the `Go…` routines).
  - Each action takes what it needs from the money in hand.
  - A scout, fighter fleet or colony ship that can make the trip goes. A fighter fleet
    must be stronger than the threat × attacking domination %.
  - Otherwise ships are queued at the colony and paid for out of its ship money
    (`BuildAFleet @9297e`, `AddShipToQueue @92c66`). Only Dumb computers budget for the
    prototype price.
  - What can't be paid for is saved up, and missing metal is mined (`MineMetal @92dbc`).
    For a colony ship, idle warships are scrapped for it.
- **Idle fleets** (`SaveFleets @93148`). Fighters and colony ships idle at stars that
  aren't yours, and scouts at your hostile colonies, go to the nearest colony. A colony
  ship heading for a star someone has taken stops.
- **The budget** (`ResolveSpending @93378`). What is left is saved. Every bar is its money
  over the total, per mille rounded up, and each colony's own bars split its money
  between terraforming, mining and ships.
- **Research**. Research shifts from Range at level 10 and from Speed at level 5 to
  Weapons and Shields.

### Corrections made while checking DOS 2.0

Four 1.2 rules were changed after comparing 1.2's code with 2.0's; each is 1.2's own:

- **Colony order**: a new colony's budget slot goes in front of all the others
  (`ColonizeStar @a3d84`, its `BlockMove` @a3e3c moves the slots up one), so the computers
  go through their colonies newest first, home last. The remake had them oldest first.
- **Colonizing**: at the end of every turn a fleet with colonists at a star that isn't yours
  founds a colony, not only on arrival; fleets at your colonies are refuelled and refilled
  first (`ColonizeAndExplore @a3556`).
- **The sine table** of the Circle style: 1.2's resource fork holds the same two tables as
  2.0's `COSINES` / `SINES` (six entries differ from a computed one), read by
  `GiveGalaxyCircleCoords @e05a6` (A5 − 0x710, − 0x70c).
- **A scrapped type in a ship queue** leaves the queue and, if it was first, what was paid
  toward it is lost (`ScrapFleetsAndTypes @a0e02`).

## Pictures and sounds the skin needs

### Map icons (`SetPlanetTypesForStar @a3806`)

Each star's icon is worked out for each player from what that player knows of it
(`SetPlanetTypesForMap @a3782` runs it on every star at the end of the turn). "Ratio" is
100 × the larger of the planet's and home's gravity ÷ the smaller; "metal" is the metal
the player last saw.

| The star | Icon |
|---|---|
| your colony making money | `ICN 1000` |
| your colony losing money, ratio ≤ 256 | `1001` |
| your colony losing money, ratio > 256, 100 or more metal | `1002` |
| your colony losing money, ratio > 256, less than 100 metal | `1003` |
| explored, nobody's, ratio ≤ 256 | `1004` |
| explored, nobody's, ratio > 256, 100 or more metal | `1005` |
| explored, nobody's, ratio > 256, less than 100 metal | `1006` |
| never seen, nobody's | `1007`; `1008` if one of your fleets is heading there |
| only a battle seen there, nobody's | `1009` |
| someone else's (as last seen) | `2000` + face |

A woman's icons would be 500 higher (`1500`–, `2500`–), but in 1.2F every player is a man.
The face is the player's slot number (0–19), shuffled once in 2000
(`DoGameSolidificationStuff @a49d6`). This is DOS 2.0's scheme (`FUN_1040_31c3` in
`docs/dos-findings.md`).

### Report icons (`GetIconID @130db0`)

Report *n* is STR# 1000.(n − 999).

| Report | Icon |
|---|---|
| credits (1000.1, 1000.2) | `3115`, `3116` |
| tech level reached (1000.3–7) | `3100`–`3104` |
| new year (1000.11) | `3111` |
| money warnings: colony not supported (.12), terraforming warning (.14), ships queued with no money (.19), money with no ships or no metal (.22, .23), no tech money (.59) | `3112` |
| scrapping (.17, .18) and battle metal (.52, .53) | `3113` |
| ships built (.20), black hole (.21), can't reach (.24), arrived (.25), stopped (.26) | `3114` |
| run out of metal, should abandon (.28) | `1006` |
| explored (.32) | that star's map icon |
| battles and chat (.34, .35, .37, .38, .41–.43, .46–.48, .51) | the other player's face, `2000` + face |
| anything else | your own planet, `1000` |

Sounds (`PlayAnnounceSound @130f08`): 2000 for a tech level, the new year, a profitable
colony, a new colony, another player eliminated and winning (.3–.7, .11, .29, .33, .55,
.58); 2001 for a colony destroyed, a black hole, being eliminated, someone else winning
and a meteor wiping out a colony (.10, .21, .56, .57, report 1059); 3002 for a colony that
isn't supported (.12); 6000 / 6002 / 6001 for exploring a good / middling / bad star
(`DetermineStarQuality` ≥ 15, 1–14, 0); the credits and battle results are silent, and
everything else plays the default sound. As DOS 2.0.

## Names

Star names are kept as they are; 1.2's list is DOS 2.0's plus "Tiber" (the river; French
would say "Tibre"), so it has no French-only star names. The default galaxy name is
"Voie Lactée", the Milky Way (STR# 1002.7). Computer and ship names are kept in French;
these are French words (or French spellings) with an English gloss:

| Name | Gloss | | Name | Gloss |
|---|---|---|---|---|
| **Computers** (STR# 1999) | | | **Fighters** (STR# 2002) | |
| Lui | Him | | Ravage | Havoc |
| Dupont | the commonest French surname (Smith) | | Enfer | Hell |
| Arès | Ares | | Démon | Demon |
| Mikhaïl | Mikhail | | Ouragan | Hurricane |
| **Women** (STR# 2000, unused) | | | Gorgone | Gorgon |
| 3615 | the Minitel dial code | | Tempête | Storm |
| Sue LN | Sue Ellen, spelt as a pun | | Brasier | Blaze |
| Phèdre | Phaedra | | Furie | Fury |
| Lucrèce | Lucretia | | Hadès | Hades |
| Athêna | Athena | | Hydre | Hydra |
| Flore | Flora | | Maléfice | Curse |
| Salômé | Salome | | Foudre | Lightning |
| **Scouts** (STR# 2001) | | | Cauchemar | Nightmare |
| Sonde | Probe | | **Colony Ships** (STR# 2003) | |
| Regard | Gaze | | Océan | Ocean |
| Colomb | Columbus | | Mère | Mother |
| Esprit | Spirit | | Essor | Soaring |
| Errance | Wandering | | Croissance | Growth |
| Lueur | Glimmer | | Idéal | Ideal |
| Fantôme | Ghost | | Liberté | Liberty |
| Murmure | Whisper | | Sérénité | Serenity |
| Ténèbres | Darkness | | Espace | Space |
| **Satellites** (STR# 2004) | | | Citadelle | Citadel |
| Fleur noire | Black Flower | | Moisson | Harvest |
| Eveil | Awakening | | Paix | Peace |
| Armure | Armour | | | |
| Bouclier | Shield | | | |
| Bienvenue | Welcome | | | |
| Eclat | Shard | | | |
| Gardien | Guardian | | | |
| Pitié | Mercy | | | |
| Sourire | Smile | | | |
| Muraille | Rampart | | | |
| Désolation | Desolation | | | |
| Framboise | Raspberry | | | |

The other names (François, Valery, Jacques, Georges, Bernard, Laurent, Michel, Adolf,
Edouard, Joe, Boris, Muhamar, Saddam, Claude, Sam, Averell; Agathe, Aglaé, Ginette, Laura,
Thècle, Imelda, Carmen, Louise, Zazie, Thelma, Barbara, Jackie; Echo, Magellan, Rudolph,
Surprise, Silence, Bonaparte, Conan, Serpent, Dragon, Scalpel, Sabre, Laser, Carnage, Styx,
Terminator, Ninon, Santa Maria, Union, Titan, Ippon, Patience, Gabriel, Sun Dog, Vision,
Apple) are names, or the same word in English.

Some interface words, for a skin: ship classes Eclaireur (Scout), Croiseur (Fighter;
literally "cruiser"), Transport (Colony Ship), Satellite (STR# 1006); computer skills
Stupide (Dumb), Moyen (Average), Brillant (Smart) (STR# 1009); "Joueurs de Silicium" /
"Silicium" (silicon players: the computers); techs Distance (Range), Vitesse (Speed),
Armes (Weapons), Boucliers (Shields), Mini; Epargne (Savings), Fortune totale (Total
Money), Revenu (Income), Réserve métal (Metal reserve), Terra / Mine / Prod (terraforming,
mining, shipbuilding) (STR# 1001, 1005).

## Changes to the shared code

`js/engine.js` got a few optional hooks; none changes the other rulesets (their test
games are byte for byte the same):

- `rs.fixOptions(opts)`: called at the start of `newGame`, so a ruleset can fix the New
  Game settings.
- `rs.maleNames`, `rs.femaleNames`, `rs.femaleComputers` (false: no computer is a woman):
  the computers' names.
- `rs.shipNames` (by type): the names `designName` gives new designs.
- `rs.welcome` (`[[text, opt], …]`): the first messages of a new game.
- `rs.designName(G, p, type)`: the name of a new design (1.2's random pick).
- `rs.battleText(G, sid, battle, playerId, info)`: the wording, sound and picture of a
  player's battle report.
- `rs.checkElimination(G)`: replaces the engine's check for who is out and who has won.
- `rs.queueMergeAny`: a queued design gets new ships in whatever slot it is in.
- `rs.canMerge(G, a, b)` and `rs.organized(G, fleet, merged, newFleet, orders)`: a
  ruleset's own rule for which fleets may merge, and what merging or splitting does to
  fuel, colonists and orders.
- a battle result with `reported: true` gets no reports from the engine (the ruleset
  wrote them).

`js/rules-dos.js` got an optional third argument to `battle(G, sid, hooks)`:
`hooks.duel(info)` is called after each duel, and the battle then leaves the debris to
it. It also exports a few internals (`shareOf`, `colonyMoney`, `shipyard`,
`removeColony`, `isqrt`, `wpn`, `battleOnly`) for `js/rules-12.js`. 2.0 passes no hooks,
so its games are unchanged.

## Settled in the full pass

`docs/coverage-12.md` lists all 548 routines of the program; none is left unread. Reading
the rest of them changed these rules, each now 1.2's own in `js/rules-12.js` (2.0 keeps
its own code until its own pass):

| What | 1.2F | Status |
|---|---|---|
| A finished terraforming or mining part | the part is spent while its bar is above 0, with no check that the planet still needs it: a planet already at your temperature is "completely terraformed" again with 2 × (step − gap)² refunded, a planet with no metal "has run out of metal" with (excess² + 224) / 225 refunded; the bar is set to −1. Later in the same pass `RestoreStarsBars` spreads a −1 bar's share over the bars still above 0, in proportion (with none: both done → ships 1,000; mining done on a hostile-gravity planet → ships 1,000; terraforming done → mining 500, ships 500; else terraforming 500, ships 500). So the money is never wasted (2.0's ruleset wasted it) | CONFIRMED (`TerraformMineStars @a0a9e`, asm a0b70–a0dce; `RestoreStarsBars @a24e2`, asm a2564–a2604) |
| Mining exactly what is left | 15 × √money equal to the metal left takes it all without the "run out" message (only more than what is left counts) | CONFIRMED (asm a0d0c `cmp.l`/`ble`) |
| Order of colonies in a turn | support, terraforming and mining, and ship queues go through the colony slots in slot order, newest colony first | CONFIRMED (`KillUnsupportedStars @a0960`, `TerraformMineStars`, `BuildNewShips @a1406`) |
| Battle reports | one pair a duel: each duel at a star is a battle of its own and `MakeResultMessages` writes the attacker's and the defender's report from that duel's counts. The defender's colony keeps its survivors; the debris of a duel goes to the colony's owner if it held ("You have recovered …"), else falls onto the planet with a note to the winner; when both sides die it is lost. A colony owner with no ships that loses gets "X destroyed your colony at S."; with ships, only "You lost a battle" | CONFIRMED (`DoBattleStage @d0004`, `MakeResultMessages @d2828`, `ResolveVictorFleetsAtStar @d3990`, `ZeroFleetsAtStar @d38ca`) |
| What a battle teaches | the estimates (above) are written per duel, from that duel's survivors | CONFIRMED (`MakeResultMessages`) |
| A meteor shower wiping out a colony | report 1059 has no template, so the report is a blank line (sound 2001) | CONFIRMED (`ComputeIncomeAndPopulation` asm a3034, `GetReportString @130746` default case @130d62) |
| Messages between players | none: no command sends them and nothing fills the outgoing list | CONFIRMED (MENU 128–134; player +0xea0 written only by `CreatePlayer`, read by `EndTurn`) |
| Routes | planned again at every stop: at the start of `MoveShips` and after `ColonizeAndExplore` a fleet whose next stop isn't its destination gets a new route from where it is, with the fuel it has left; with none it stops: "Your %s can no longer reach %s." | CONFIRMED (`CheckFleetDestination @a23d2`) |
| The ship queue | a design already queued in any slot gets the new ships; taking one ship off a slot of several keeps what was paid; emptying the first slot loses what was paid toward it, money and metal | CONFIRMED (`AddTypeToQueue @11311a`, `RemoveTypeFromQueue @1131ec`, `BuildShips @112946`; part-payment at slot +0xf0a/+0xf0e) |
| Fleets | a fleet is one design and a count. Organize Fleets deals one design's ships at a star into up to 12 fleets; on OK all of them get the least fuel used among them, the older records keep their orders, and a new Colony Ship fleet comes loaded with colonists | CONFIRMED (`NewFleet @110004`, `OrganizeFleets @113896`) |
| Underfunded colonies | still grow: `KillUnsupportedStars` clears the slot's no-growth flag (+0x10) every turn and never sets it | CONFIRMED (`KillUnsupportedStars @a0960`) |
| Novas | `CheckForSupernova` and `ReactToSupernova` both stop at style bit 0x10, never set | CONFIRMED (`ReactToSupernova @a2afc`) |
| Ship and planet power noted at each star | computed by `NoteShipPowers` but never read (cleared each turn by `EndTurn`) | CONFIRMED (no reader of star +0x48–0x51) |

Checked and the same as before: the per-player order of the turn (`EndTurn` runs one
player's planning, money and moves before the next player's; nothing a computer reads
is changed by another player's money or moves, so the remake's "everyone plans, then
everyone pays, then everyone moves" gives the same game), losses falling on the oldest
fleets (`ResolveVictorFleetsAtStar`), the design limit of 20 (`CreateShipType @111866`),
scrapping a fleet (`ScrapCurrentFleet @1128ce` only marks it; `ScrapFleetsAndTypes`
scraps it at the start of the next turn's pass, where it is, so the remake's immediate
scrapping gives the same metal in the same place).

## Still open

See `docs/open-questions.md`, section "Mac 1.2".
