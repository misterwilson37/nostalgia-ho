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
- **French computer and ship names**, and one more star name (Tiber). A Language choice
  plays it in English instead (see "English").
- The 1.2 credits as the first messages, and an "updated to the year" message every turn.
- No notice when someone else's fleet arrives at your colony.
- **Its own computer players** (`js/ai-12.js`, a port of `DoComputerTurn` and the routines
  it calls), not the 5.0.5 ones the DOS 2.0 ruleset uses.
- **Its own end of the game**: a player with no colonies is out after one turn, colony
  ships or not, and the last player standing wins.
- **Shorter battle reports**, 1.2's own, one pair for each duel at a star.
- No messages between players, routes planned again at every stop, fleets of one design,
  and finished terraforming or mining bars handed on (see "Settled in the full pass").
- **The turn is 2.0's**, step for step: shares used as they stand, with the $2,000,000
  rule; bars per mille with −1 for a finished part; a lost colony's share to Savings; a
  new colony's share taken from the others; the turn run for out players; the computers
  planning in the new year (see "The turn, read in 1.2's code").

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
| Star names | STR# 1003 (the DOS 2.0 list of 190) plus STR# 2005 "More Star Names", where winners' names go; the program ships with one, "Tiber". At most 7 letters. A winner's name must have 4 to 7 letters (shorter: not kept) and is taken when `Munger` finds it inside any name of STR# 2005 or 1003; it goes on no star of the game just won (`MarkStarNamed` only marks the file) | CONFIRMED (`GiveStarsValues`, `NameAStar @120a04`, `MarkStarNamed @1014e8`) |
| Name a Star window's words (French) | DLOG/DITL 4050: "Vous venez de gagner, alors vous devez donner un nom à une étoile." "Le nom doit comprendre entre 4 et 7 lettres." "Nouveau nom d'étoile:" "(Si vous ne voulez pas donner un nom à une étoile, cliquez juste sur OK)."; name taken, DITL 3340: "Désolé, il y a déjà une Etoile nommée “^0.” Soyons créatifs!". Given in French as they are (`rs.nameAStar`) | CONFIRMED |
| Fix Spending | the Galaxy menu's "Correction dépenses" (⌘F): Mac 2.0.1's command, instruction for instruction (`docs/dos-findings.md`), its lines STR# 1050 in French; numbers "12,345K" from ten million (`LongToNiceString @1244a`) | CONFIRMED (`FixSpendingBars @c1fb0`, `FixNextSpendingBar @c1b48`, `ComputeMaxPercent @c1fde`, `ComputeMinPercent @c224a`); js/rules-dos.js fixSpending20 |
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
| New colonies: 10 colonists a colony ship, terraform 900 / mine 100 (or mine 1,000 when gravity is over 2.56 × home's), a share worth $15,000 (15,000,000 ÷ pool per mille, taken from the other slots) when the pool is over $20,000. Colony ships at your colonies are refilled; see "The turn, read in 1.2's code" | CONFIRMED (`ColonizeStar @a3d84`, `ColonizeAndExplore @a3556`) |
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
| A meteor shower wiping out a colony | 1.2 sends report 1059, which has no template in STR# 1000 (it has 59 lines), so the report is a blank line; the remake shows it blank, with your own planet's picture | CONFIRMED (`ComputeIncomeAndPopulation`, `GetReportString @130746`) |
| Exploration | "You have explored …" shows gravity relative to home and the temperature in **°C** to a tenth: (T − home + 720 − 324) × 5/9 in tenths, so a planet at home's temperature shows 22.0 °C. The ruleset sets `celsius: true` so a skin can turn its Celsius preference on | CONFIRMED (`ExploreStar @a3b4c`) |
| Ship names | a new design gets a random name from STR# 2001 + class that no current design has (up to 100 tries; then the last one tried) | CONFIRMED (`GiveTypeCoolName @9457e`) |

### Battle reports

1.2 fights a star's battle as duels (the holder against each other player in turn) and
writes two reports for each duel, one for the attacker and one for the defender
(`MakeResultMessages @d2828`); the remake does the same (`battle20` in `js/rules-dos.js`, 2.0's code being the same).
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
play stops on it (interface; listed in `docs/research-log.md`).

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
| You Lost | the dying player's own "Vous venez juste d'être éliminé du jeu." (report 0x41f) opens `Alert(5050)`, or 5051 on fewer than 16 colours, 1.2F's ALRT "You lost...": no title, "Il est regrettable que vous ayez été éliminé…" over PICT 3040 and "Bon, ça va…" (5051: "..." and PICT 3540). It comes when the player is marked as dying, so before a colony founded in time brings them back. Built: `rs.youLost` (the French its own words; in English Mac 2.0.1's ALRT 5050, "Unfortunately, you have been eliminated from the game…" and "Oh, well…") | CONFIRMED (`DoMessageAction @1315f0`, @131700) |
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
  over the total, per mille rounded up (for a slot given more than $2,000,000: its money
  over a thousandth of the total, rounded up), and each colony's own bars split its money
  between terraforming, mining and ships, a bar at −1 (finished) left as it is.
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
- **Scrapping a ship type** only marks it: the Existing Designs window's check box (DITL
  6000 item 17, "Modèle à recycler") sets the design's +0x6a to 1 minus itself
  (`ListShipTypes @110fc0`), so it can be taken off again, and `ScrapFleetsAndTypes`
  scraps the type and its ships at the start of the next turn. Nothing reads the mark
  before then (the build window queues a marked type). The remake scraped a type when it
  was ordered; it now marks it (js/rules-dos.js `flagScrapDesign20`, `scrapMarked20`).

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
(`DetermineStarQuality` ≥ 15, 1–14, 0); the credits and battle results (.34–.36) are silent, and
everything else plays the default sound. As DOS 2.0. The remake now follows this: no
sound on battle reports, which carry `won: true / false` for auto play instead.

## Names

(These are the French game's names; for its English ones see "English", below.)

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

## English

The remake plays 1.2 in French, as released, or in English: New Game's **Language**
(below the line, only for a version that shipped in more than one language) or the Ho
menu's **Language…** in the middle of a game (`G.opts.lang`; `rs.languages` and `rs.lang`
in `js/rules-12.js`, `inLanguage`, `gameName` and `setLanguage` in `js/engine.js`). Only
names and words change. The names are always drawn from 1.2F's own lists and then put in
the game's language, so a seed plays the same game in either: `node tools/test.js 12
--lang=en` prints what `node tools/test.js 12` does, with the English names (and a save a
few bytes longer).

What is French in 1.2 is its names, its windows' words and its reports: STR# 1000 (the
reports, DOS 2.0's strings 672–730 line for line), 1030 (the battle window), 1050 (Fix
Spending) and the rest, read by `tools/extract/languages.py --mac12` into
`js/lang-data.js` (`mac12Fr`). The remake shows them as released (`rs.say` in
`js/languages.js`: the rules keep 2.0's English words, and the page puts them in 1.2F's
French). The battle window's fleets are 1.2F's own order, the class first
(`MakeFleetDescription`: "%d %.*ss %.*s (%d/%d)", "1 %.*s %.*s (%d/%d)", and with no count
for the ships lost, "%.*s détruit(s)"); a report's numbers are written "1 234" (the
program's "%d %.3d", "%d %.3dK"; CONFIRMED: what `LongToNiceString @1244a` writes, a plain space, in the panels too: see "Display audit"); the
exploring report has the temperature in °C to a tenth. 1.2F says less than 2.0's English
in two lines: 1000.17 ("Votre flotte de %.*s à %s a été recyclée.") has no metal, and
1030.0's ships lost ("%.*s détruit(s)") no count; they are shown as they are.

The English is the nearest official English, **Mac 2.0.1**'s (1.2 is a pre-release of
2.0), read from its resources (`STR#`, `DITL`):


- **Star names**: none change. 1.2F's STR# 1003 is 2.0.1's (and DOS 2.0's) list of 190,
  entry for entry, all in English, and STR# 2005 is "Tiber" in both.
- **Computer and ship names**: 2.0.1's STR# 1999–2004 have the same number of entries as
  1.2F's, and the names that weren't translated stand in the same places in both (Joe,
  Sam; Laura, Imelda, Louise, Barbara; Magellan, Rudolph; Conan, Serpent, Dragon; Santa
  Maria; Gabriel, Sun Dog, Vision, Apple), so each French entry is matched with the English
  one in its place. 2.0.1's lists are DOS 2.0's. All 110 are matched (16 spelt the same);
  the translator rendered some (Mère → Mother, Murmure → Whisper, Bouclier → Shield,
  Bonaparte for Patton) and replaced many with names of his own (Lui for Paul, Dupont for
  Nick, Ravage for Killer, Fleur noire for Defender), so by meaning only about a quarter
  match, but each is the English name of its place:

| List | French → English (Mac 2.0.1) |
|---|---|
| Computers, men (STR# 1999) | François → Alex, Valery → Bert, Jacques → Carl, Georges → John, Bernard → Ed, Laurent → Frank, Michel → Gary, Adolf → Howard, Edouard → Bob, Joe, Mikhaïl → Kirk, Boris → Larry, Lui → Paul, Dupont → Nick, Muhamar → Dave, Saddam → Peter, Claude → Ralph, Sam, Arès → Tim, Averell → Walter |
| Computers, women (unused) (STR# 2000) | Agathe → Andrea, Aglaé → Beth, Ginette → Christie, 3615 → Mary, Flore → Leslie, Laura, Salômé → Natalie, Thècle → Heather, Imelda, Claude → Jennifer, Carmen → Kathy, Louise, Phèdre → Melissa, Lucrèce → Nancy, Zazie → Elizabeth, Thelma → Patricia, Sue LN → Sue, Barbara, Athêna → Wendy, Jackie → Anne |
| Scouts (STR# 2001) | Sonde → Needle, Echo → Explorer, Regard → Looker, Colomb → Columbus, Magellan, Esprit → Intrepid, Errance → Wanderer, Rudolph, Lueur → Eagle, Surprise → Sparrow, Fantôme → Ranger, Murmure → Whisper, Silence → Weasel, Ténèbres → Enterprise |
| Fighters (STR# 2002) | Ravage → Killer, Enfer → Destroyer, Démon → Demon, Ouragan → Hurricane, Gorgone → Typhoon, Tempête → Slasher, Bonaparte → Patton, Brasier → Stingray, Furie → Blaster, Conan, Serpent, Dragon, Scalpel → Tornado, Hadès → Wraith, Hydre → Storm, Maléfice → Dagger, Sabre → Sword, Foudre → Lance, Laser → Arrow, Cauchemar → Constitution, Carnage → Reliant, Styx → Panther, Terminator → Nightmare |
| Colony Ships (STR# 2003) | Océan → Spreader, Mère → Mother, Essor → Expander, Ninon → Nina, Croissance → Pinta, Santa Maria, Idéal → Stork, Liberté → Freedom, Sérénité → Kon Tiki, Union → Minnow, Espace → Taurus, Citadelle → Minerva, Moisson → Egg, Paix → Peaceful, Titan → Hardy |
| Satellites (STR# 2004) | Fleur noire → Defender, Ippon → Stopper, Patience → Protector, Eveil → Eye, Armure → Armor, Bouclier → Shield, Bienvenue → Peach, Eclat → Caltrop, Gardien → Washington, Gabriel, Sun Dog, Pitié → Mercy, Vision, Apple, Sourire → Pebble, Muraille → Rock, Désolation → Stone, Framboise → Berry |

- **Name a Star** (DITL 4050, the alert DITL 3340): 2.0.1's own words, the same window:
  "You won the game, so you get to name a star." / "Star names must be 4 to 7 characters
  long." / "New Star Name:" / "(If you’d rather not name a star, click “OK” with the name
  blank.)" / "Sorry, there’s already a star named  “%s.” Please pick another name."

**The remake's English**: none was needed. Every French name and line the remake shows
has an official English counterpart in Mac 2.0.1.

| French | The remake's English | Where |
|---|---|---|
| (none) | | |

Not changed by the language: the pictures (the title picture's French words, and 1.2's
"Fin Tour" End Turn button, which the skin already shows as 3.0.1's English one), and the
default galaxy name ("Voie Lactée", STR# 1002.7, which the remake never showed: New Game
offers "Milky Way"). Reports already received keep their words when the language changes
in the middle of a game. A computer's name is drawn again when a player already has it in
either language (as 2.0.1 does with its English names), so a human called Alex never meets
a computer called Alex; in that case an English game can play differently from the French
one with the same seed. A design a player renames with a
name from one language's list counts as taken in that language only (so, with that one
rename, a later design's name is drawn as it would be in that language).

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
it. It also exports a few internals (`designCost`, `WPNRAT`, `bars20`, `setBars20`) for
`js/rules-12.js`. 2.0 passes no hooks, so its games are unchanged. Since 1.2 plays 2.0's
turn, the older versions `js/rules-dos.js` kept for it (`base12`, `afterMovement`,
`refuel`, `giveShare`, `meteors`, `shareOf`, `colonyMoney`, the base `projected` and
`underfunded`) are no longer used by any ruleset.

`js/ai-12.js` got `rs.aiBigShares`: the computers' shares of a slot given more than
$2,000,000 by `ResolveSpending`'s own rule (1.2 sets it).

## Settled in the full pass

`docs/coverage-12.md` lists all 548 routines of the program; none is left unread. Reading
the rest of them changed these rules, each now 1.2's own in `js/rules-12.js` (2.0 keeps
its own code until its own pass):

| What | 1.2F | Status |
|---|---|---|
| A finished terraforming or mining part | the part is spent while its bar is above 0, with no check that the planet still needs it: a planet already at your temperature is "completely terraformed" again with 2 × (step − gap)² refunded, a planet with no metal "has run out of metal" with (excess² + 224) / 225 refunded; the bar is set to −1. Later in the same pass `RestoreStarsBars` spreads a −1 bar's share over the bars still above 0, in proportion (with none: both done → ships 1,000; mining done on a hostile-gravity planet → ships 1,000; terraforming done → mining 500, ships 500; else terraforming 500, ships 500). So the money is never wasted (2.0 does the same, `FUN_1040_269d`) | CONFIRMED (`TerraformMineStars @a0a9e`, asm a0b70–a0dce; `RestoreStarsBars @a24e2`, asm a2564–a2604) |
| Mining exactly what is left | 15 × √money equal to the metal left takes it all without the "run out" message (only more than what is left counts) | CONFIRMED (asm a0d0c `cmp.l`/`ble`) |
| Order of colonies in a turn | support, terraforming and mining, and ship queues go through the colony slots in slot order, newest colony first | CONFIRMED (`KillUnsupportedStars @a0960`, `TerraformMineStars`, `BuildNewShips @a1406`) |
| Battle reports | one pair a duel: each duel at a star is a battle of its own and `MakeResultMessages` writes the attacker's and the defender's report from that duel's counts. The defender's colony keeps its survivors; the debris of a duel goes to the colony's owner if it held ("You have recovered …"), else falls onto the planet with a note to the winner; when both sides die it is lost. A colony owner with no ships that loses gets "X destroyed your colony at S."; with ships, only "You lost a battle" | CONFIRMED (`DoBattleStage @d0004`, `MakeResultMessages @d2828`, `ResolveVictorFleetsAtStar @d3990`, `ZeroFleetsAtStar @d38ca`) |
| What a battle teaches | the estimates (above) are written per duel, from that duel's survivors | CONFIRMED (`MakeResultMessages`) |
| A meteor shower wiping out a colony | report 1059 has no template, so the report is a blank line (sound 2001, the picture of your own planet) | CONFIRMED (`ComputeIncomeAndPopulation` asm a3034, `GetReportString @130746` default case @130d62) |
| Messages between players | none: no command sends them and nothing fills the outgoing list | CONFIRMED (MENU 128–134; player +0xea0 written only by `CreatePlayer`, read by `EndTurn`) |
| Travel and fuel | a leg's fuel is spent when the fleet arrives: its length (fleet +0xe) is added to the fuel used (+4) the turn it reaches the star, so in flight a fleet shows the fuel it had at the last star. A new fleet starts with no fuel used | CONFIRMED (`MoveShips @a20ee`, `NewFleet @110004`; js/rules-dos.js departs20, legFuelArrives) |
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
scrapping a fleet (`ScrapCurrentFleet @1128ce` only marks it, and a second use takes the
mark off; `ScrapFleetsAndTypes` scraps it at the start of the next turn's pass, where it is;
the remake now marks it too: js/rules-dos.js `flagScrap20`, `scrapMarked20`). A fleet marked in hyperspace has star −1, and report 1016 (`GetReportString`'s
case 1016 @130838; `ScrapFleetsAndTypes` @a0f82-a0fc0) reads "star −1" in the galaxy
header, big-endian with 0x22-byte stars: its name (a C string from +0x31) is the low byte
of player slot 17's home star and then a 0, one stray character (none for star 0); its
owner (+0x1c) is slot 7's home star, so the English report's metal shows only when that
number is the player's (1.2F's French report has no metal). 1.2's galaxy is always a
Circle, so the 20 slots' homes are kept (`G.homes20`); the remake prints the same
(`limboMac20`: the Mac Roman letter, a box for a code below 32, as the Geneva 9 report
window has no letter there), and the patch says "at hyperspace" (fix `scrapLimbo`).

## The turn, read in 1.2's code

The 2.0 pass found six rules of the turn that 1.2 seemed to share, while the 1.2 ruleset
still played older versions of them. Each was read again in 1.2's own code. All six are
1.2's, so 1.2 now plays 2.0's turn from `js/rules-dos.js` (`economy20`, `pass2_20` and the
routines they call), with only the differences listed after the table.

| Rule | What 1.2's code does | Status |
|---|---|---|
| 1. The colony bars | Terraform, Mine and Ship bars are kept per mille in the colony slot (+2, +4, +6). A finished part is set to −1 (terraforming @a0c5a, mining @a0d3e) and stays −1: nothing sets it back, the planet window won't drag a bar below 0 (`DoVBarClick @c0446`), and the computers test for −1 and leave it (`AddColonySupportActions @90294`, `AddTerraformingActions @90b7a`, `AddColonizeAction @9139e`, `ResolveSpending @93378`). `RestoreStarsBars` scales every colony's bars above 0 to fill 1,000 at the end of each player's first pass. The "never profitable" warning goes by the colony's class (slot +0x12 = 2, @a0bc2), set each turn by `ComputeIncomeAndPopulation` | CONFIRMED (`TerraformMineStars @a0a9e`, `RestoreStarsBars @a24e2`) |
| 2. Shares | A slot's share of the pool is trunc(M × share ÷ 1,000) while the pool is under $2,000,000 and trunc(M ÷ 1,000) × share above (@a09ba, @a0b28, @a14ae, @a1af0, @a2e58); a colony's bars and each technology's share of its money work the same way (@a0b80, @a0cb0, @a157c, @a1b82). Nothing divides by the total of the shares, so the computers' shares, each rounded up, are used as they stand. The slots are Savings (star −2), Technology (star −1) and the home colony, set up as 0, 150 and 850 per mille with the home bars −1 / 200 / 800 (`CreatePlayer @e16a4`); `SpendTechMoney` takes the first slot with star −1, `ComputeIncomeAndPopulation` the first with −2 | CONFIRMED (`KillUnsupportedStars @a0960`, `TerraformMineStars`, `BuildNewShips @a1406`, `SpendTechMoney @a1a58`, `ComputeIncomeAndPopulation @a2de6`) |
| 3. A colony given up | `DecolonizeStar` loads the player's Colony Ship fleets at the star (fleet +6 = 1), adds the colony's share to the Savings slot, takes the slot out and makes the star nobody's. It is called for an abandoned colony (@a0a46) and, in the owner's second pass, for a colony lost in a battle or wiped out by meteors (@a2f90, @a2fac, @a3044). A lost battle makes the star nobody's at once (`MakeResultMessages @d2828`, at its end); the slot goes when `ComputeIncomeAndPopulation` sees that someone else won there (`DoBattleStage` notes each star's winner, @d06ac) | CONFIRMED (`DecolonizeStar @a3fd4`) |
| 4. A new colony's share | With more than $20,000 in the pool (@a3f96), `ColonizeStar` gives the new slot (put first) 15,000,000 ÷ pool per mille (@a3fa0) through `GiveBarPercent @c139c`. `DetermineNewLevels @c1470` takes it from the other slots in proportion, each giving ceil(left × its share ÷ their total) (@c155e–c1574, `left` copied at the start of each round, @c1652), none below its least share (`ComputeMinPercent @c224a`: ceil(loss × 1,000 ÷ pool) for a losing colony when the pool is $1,000 or more and bigger than the loss), round after round; a total outside 990–1,010 is then brought to 1,000 one per mille at a time, first within the floors, then without. This is 2.0's `FUN_1010_16f2` / `179a` / `218e`, number for number | CONFIRMED (`ColonizeStar @a3d84`, `GiveBarPercent`, `DetermineNewLevels`, `ComputeMinPercent`) |
| 5. Players who are out | Both player loops of `EndTurn` (pass 1 @a01d4–a037c, pass 2 @a049c–a0534) run for every player slot and check no state; only the call of `DoComputerTurn` asks who the player is (a computer slot, or a player in state 3, @a025e–a02ba). So an out player's money, interest, research and fleets keep going, and an out computer keeps giving its fleets orders | CONFIRMED (`EndTurn @a0004`) |
| 6. The computers' year | `EndTurn` adds 10 to the year (@a0126) before the player loop, so `DoComputerTurn` (@a027c, @a02b6) plans in the new year, and report 1010 (@a025a) gives the new year | CONFIRMED (`EndTurn @a0004`) |

Also read again, and the same as 2.0: the second pass for each player in turn
(`ComputeIncomeAndPopulation`, then `ColonizeAndExplore @a3556`, then the pool kept
within $0–$999,999,999, @a0522–a0534); a losing colony's people (`KillUnsupportedStars`);
the refunds reset at the start of each player's first pass (@a02bc); the new colony's
record (`ColonizeStar`: "You have colonized %s.", income −7,501, sink 0, bars 900 / 100 /
0 or 0 / 1,000 / 0); `ColonizeAndExplore` refuelling and loading at your colonies, then
exploring and colonizing in fleet-list order (newest first), with routes checked again.

What 1.2 does differently from 2.0's turn (now in `js/rules-12.js`):

| What | 1.2F | Status |
|---|---|---|
| A colony wiped out by meteors | report 1059, a blank line (as before), with the picture of your own planet (`GetIconID`'s default case) and sound 2001; 2.0 instead reports 1009 with a stale name | CONFIRMED (`ComputeIncomeAndPopulation` asm a3034, `GetIconID @130db0`, `PlayAnnounceSound @130f08`) |
| Battle report sounds and replays | 1033–1035 play nothing, 1009 plays 2001; each duel is its own replay ('bTTl', AddResource @d0738) handed to `MakeResultMessages` (@d0768) | CONFIRMED (`PlayAnnounceSound @130f08`, `DoBattleStage @d0004`) |
| Dragging a budget bar | every slot's least share 0 and most 1,000 (@c1212-c121a), then `DetermineNewLevels` at each step (@c1324): 2.0's rule, number for number (`rs.dragShare`) | CONFIRMED (`DoHBarClick @c1002`) |
| Giving up a colony | no command: `DecolonizeStar` is called only by `KillUnsupportedStars`, `ReactToSupernova` (never run) and `ComputeIncomeAndPopulation`, so there is no Evacuate button | CONFIRMED |
| The computers' shares over $2,000,000 | a slot given more than $2,000,000 gets ceil(money ÷ trunc(total ÷ 1,000)) per mille instead of ceil(money × 1,000 ÷ total) (the remake had only the second rule). 2.0's `FUN_1020_35f9` has the same branch; see `docs/open-questions.md` | CONFIRMED (`ResolveSpending @93378`, asm 93458–934c0); `rs.aiBigShares` in `js/ai-12.js` |
| The computers' colony bars | each part's money × 1,000 ÷ the colony's total, rounded up, with the product in 32 bits and the result stored as a word, so a part over $2,147,483 wraps | CONFIRMED (`ResolveSpending`, @9363c, @936a4, @936ec); `setColonyBars12` |
| Organize Fleets | every fleet of the design gets the least fuel used and the older records keep their orders (see "Settled in the full pass"); 2.0 gives the average and clears orders | CONFIRMED (`OrganizeFleets @113896`) |

Two things that make no difference: `ColonizeAndExplore` does not check that the star is
nobody's before founding a colony (only that it isn't the player's), but a star where
your loaded fleet is still standing after the battles can't be someone else's colony;
and `ComputeMinPercent` works in floating point where 2.0 uses integers, with the same
results for any money the game reaches.

How the game changed: the turn reads shares as they stand (the computers' add up to a
little over 1,000, so they spend a little more than they have, as in 1.2) and above
$2,000,000 by thousands; a new colony's share is taken from the others in whole per mille
and never below a losing colony's need; a lost colony's share goes to Savings instead of
being shared out by the next turn's sums, and colony ships waiting there are loaded; the
bars keep their −1 marks, so the computers stop terraforming a planet only when its
terraforming is finished, not when the temperature gap is 0; players who are out still
earn interest and research; and the computers' first turn is planned as 2010, not 2000.

## Bars and battles (October 2026)

Joe Williams' three notes (the bars' scale, the bars that lock at zero, the ships in
battles), read in 1.2F's code. 1.2 is 2.0 here too (`docs/dos-findings.md`, "Bars and
battles"):

- **The scale.** `InitHLogBarAmts @c07be` and `InitVLogBarAmts @c0004` build the log
  tables (77 and 50 pixels), `GetHPercBarAmt @c08d2` a share's pixel. The budget bars
  (`DrawHBarControl @c091e`, `DoHBarClick @c1002`) are linear (1,000 × x / 77, the ticks in
  tenths: ten black ticks 2 pixels high on the heading strip's rule, no grid through the bars, read in
  `DrawHBarControl`; `rs.barGrid`) unless the setup's +0x2a is set, 0 by default ('Stup' 1000 "Default Setup"); a
  click above the bars flips it (`DoHBarClick`'s last branch: 1 − the value, then
  `DrawBudgetRect`), and they are drawn and dragged on the log scale (the grid at 100 ...
  1,000 per mille) until clicked again. The technology bars are always on the log scale
  (`DoVBarClick @c0446` with 2, from the research window; with 1, a colony's bars, they are
  linear). So the log scale is in the oldest version read, as a choice for the budget
  bars. The remake: 2.0's `rs.barScale` (inherited). CONFIRMED.
- **The lock.** None in the budget bars: `DoHBarClick` checks no slot. A colony's own bar
  below 0 (a finished part) beeps when clicked (`DoVBarClick`). CONFIRMED.
- **The battle window.** 2.0's (`DrawAllGroups @d207c`, `DrawOneGroup @d214e`,
  `ReviewBattle @d26e6`, `MakeFleetDescription @110e28`), in French: STR# 1030 "Résumé de
  la bataille", "à %s en %d:", "Round %d", "Félicitations!" "Bataille gagnée!" or "Hélas,"
  "vous avez perdu…"; a group's words "%d %.*ss %.*s (%d/%d)" ("3 Chasseurs Lancelot
  (5/4)": the class first, French order), "1 %.*s %.*s (%d/%d)", and when it is gone the
  whole description with "%.*s détruit(s)" (STR# 1030.1, whatever the count); a colony
  its people or "%s morts" (STR# 4000.32). The remake gives them in English as Mac
  2.0.1's (`battlePanelMac`), as it gives 1.2's other French lines.
- **Which side is on the left** (`DoOneBattle @d07d0`, `DrawOneGroup @d214e`): when the record's first player
  (`param_1[0]`) is the viewing player the left column's x is set to 25 (4.0.5: 5) and the right's to 300,
  else the other way about; `DrawOneGroup` takes its x from the list it draws (the first side's list gets
  the first side's x). So the **viewer's side is on the left**, and a viewer in neither side (a hot-seat
  watcher) sees the record's *second* side there. The remake: `makeBattlePanel` `cols: 'mac'`. CONFIRMED.
- **The damage shading** (`DrawOneGroup @d214e`; the same code in 1.2, 2.0.1, 3.0.1 and 4.0.5): after the picture and the words,
  a group that is not a colony's has its 120 x 40 picture cell painted with the pen set to the gray pattern (the
  QuickDraw global qd.gray; the pen is put back to qd.black after) in patOr mode: a gone group (count 0) the whole
  cell, else the damage done to its next ship, 120 x damage / hit points pixels from the left (a satellite: a third
  of that, starting 40 pixels in, so at most 40 wide). No frame, no other bars. The remake: `rs.battlePanel` `shade`
  (the battle events' `f`), drawn as a translucent gray rectangle. CONFIRMED.

What changed in play: nothing. The finger uses 2.0's linear bars instead of iOS's log
scale.

## Interface built later

- The Options menu's preferences (`DoOptionsMenu @e2784`, `doBattleSpeedDialog @120c48`, DITL/CNTL 4040, Stup 1000's
  defaults) and the Explored Planets window (`ListExploredStars @120004`, `InitStarsList @120136`, DITL 6040,
  STR# 1020): `rs.options`, `rs.exploredList`; js/skins/classic/ui.js `verPrefs`, `openExploredList`, `openReports`.
- The names file, as 2.0's (`GetPrefNamesResource @12c5a`, `DoGameSolidificationStuff @a49d6`,
  `AddNewTypeNameToPrefs @112028`): `rs.namesFile` (inherited from rules-dos), kept as "ho5.names.12".

## Still open

See `docs/open-questions.md` (the 1.2 entries), and `docs/research-log.md`, section
"Mac 1.2", for how each question was settled.

## The panel's numbers (October 2026)

`DrawPlanetRect @c44f6` and `InitStarsList @12072a` print the temperature with STR# 4000.2 "%d,%1.1d°C" (tenths of
(T − 324) × 5 ÷ 9, truncated, T in tenths of °F: home's 72.0 reads 22.0) and the gravity with 4000.3 "%d,%2.2dG", the ratio
g × 100 ÷ home g truncated (`LDIV`, then `/ 100` and `% 100`). The remake's 1.2 shows exactly that in every language (a
comma in French, German and Spanish, a point in English and Turkish, which 1.2 never had). See `docs/dos-findings.md`,
"The panel's numbers", for all the versions.

## The reports' numbers (October 2026)

The exploring report (STR# 1000.32 in 1.2F) is filled by `ExploreStar @a3b4c`: the message holds r = `LDIV(g × 100, home g)` and
C = `LDIV((t + 720 − home − 324) × 5, 9)` in tenths, and `GetReportString` prints C ÷ 10 and |C| mod 10 with "%d,%1.1d°C", the
panel's own arithmetic (`HO.reportTemp`, a comma in French and German, a point in English and Turkish). `docs/dos-findings.md`, "The reports' numbers".

## The Explored Planets list (CONFIRMED, October 2026)

`InitStarsList @120136` builds a row of five fields (name 100 pixels, temperature 75, gravity 75, metal 75, status 75; "No Climate Info." 150 + 35 + 40 for a star with no climate: STR# 1020) in the cell data of `LDEF 1000` (426 bytes: each field is drawn left-aligned at the sum of the widths before it, cut with `TruncString` when wider than its column), the temperature from STR# 4000.2 and the gravity from 4000.3. The order is 2.0's (three groups). Mac 2.0.1 is the same code. `docs/dos-findings.md`, "The explored-stars lists".

## Display audit (November 2026)

The whole program was decompiled and saved (private repo, `decompiled/mac-1.2F/`: asm and C per routine, index; `HOW.md`), every one of
the 548 routines has a row in `docs/display/12.json` (`node tools/display-audit.js 12`), and the display routines were read with a
symbolic trace and compared with the remake in French and English. Found and fixed (each row names its commit):

- **`LongToNiceString @1244a` writes a plain space between thousands** ("%d %.3d", "%d %.3dK"), so 1.2F's panels, bars and lists read
  "$30 000", not "$30,000" (the remake had only the reports in French spacing). Base rules `niceNumSp` / `moneyNiceSp`; the English 1.2
  (Mac 2.0.1's) keeps the comma (`rs.lang.en.releaseRules`). tools/format-audit.js asserts both.
- **Fleets are named by `MakeFleetDescription` in the reports and rows** (built, arrived, stopped, lost, scrapped, can no longer reach;
  the fleet row and list): "3 Eclaireurs Silence (1/1)", "1 Transport Essor (2/2)"; English "3 Weasel (1/1) Scouts". `rs.fleetDesc`,
  `rs.shipsDesc`. (Callers: `docs/301-findings.md` left this for the other versions.)
- **The totals box** (`DrawIncomeRect @c3f70`) lists the metal first, then the money and the income, as "Réserve métal:", "Fortune
  totale:", "Revenu total:" (English DOS 2.0's "Reserve Metal:", "Total Money:", "Total Income:"). `rs.panelInfo`.
- **The planet box** (`DrawPlanetRect @c4334`): "Pas d'information sur cette planète." for a star never seen; "Pop: Inhabitée" /
  "Inconnue" for planets that are not yours (the remake guessed "~pop" for another player's colony, which 1.2 never shows). `rs.planetInfo`.
- **The window title** is STR# 4000.2 "%s en %s en %d" ("Jake en Voie Lactée en 2000"). `rs.windowTitle`.
- **The report window keeps the last 50 reports of all years** (`AddNewMessage @131052` drops the oldest 10 at 50) and opens on the
  current year. `rs.reportHistory`, `p.reportLog` (left out of tools/test.js's digest; the digests are unchanged).
- **The End Turn warning** is ALRT 5060 ("Attention, vous n'investissez pas assez ... Qu'elles meurent! / Annuler"; English "Let ’em Die");
  the lost-battle record is ALRT 3310; Options has "Alerter sur dépenses" ("Give Overspending Warnings"). `rs.alertWords`.
- **A new colony plays snd 2000** (the skin had no file for the id the rules asked); the **fleet list leaves out satellites**.

- **In its own skin (Mac 1.2), the windows are the program's**: the menus (MENU 128-134, their dimming and changing words), the
  battle window as `DoOneBattle` draws it (445 x 310, white on black with its 35 stars, one column of at most five groups a side
  cut as the fight cut them, the 40 x 40 ship parts, Geneva 9 words condensed when wide, the moving bolt of `DrawLaserBlast`, the hit
  pictures and rings of `DrawExplosion`, the sounds by 10 x damage / hit points, the no-information case of `DrawAllGroups`), the map
  window's boxes at the program's rects (unpacked from the %A5Init segment's A5 world: planet, fleets, totals, players beside the
  budget bars), the vertical bars of `DrawVBarControl` with a finished part's empty bar that beeps and the queue in their place once
  terraforming and mining are done, the Tech Spending and Report windows under the map window, route lines as `StarLine` and
  `MakeArrowRegion` make them, the names condensed at the second zoom, the turn's status window, the battles shown before the
  reports (`DoBattleStage`), Correction dépenses in the bubble, DLOG 4040 / 4050 / 6040 laid out as their DITLs, a report clicked
  inverted for 5 ticks. A marked fleet keeps its fuel, speed and scrap lines (`DrawSelectedFleetInfo @c5024`).

Every row is settled: none `open`, none with `"gap": true` (`node tools/display-audit.js 12`). Two differences are kept, each with
its reason in its row: New Game asks for the file name in the remake's New Game window (a browser has no Mac file dialog), and the
multi-player file's polling (`PollNextTurn`) is the remake's own hot seat.
## Remake-only controls (November 2026)

*Brief: `docs/brief-restyle.md`. Step 1, the list. Nothing here is designed yet.* Played with a later ruleset's rules, the 1.2 skin
shows 1.2's own screens for everything 1.2 had (the display audit) and **falls back to the classic page's controls** for what a later
version added. This is the list of those, from playing every ruleset in the skin.

**How the list was made.** `node tools/skin-rules-check.js --skin=mac12 --inventory` plays each of the 12 rulesets in the skin (three
turns, one colony selected), opens every command in the Ho! 1.2 menu (where `menus()` in `js/skins/mac12/ui.js` puts every command 1.2
has no menu item for) and records what each opens: a window of the skin's own (class `mac12`) or the classic page's (no such class).
A classic window is a **fallback and fails the check**, so the check is red now and goes green as controls are built. Items marked
*read* below were found in the code, not yet by playing; each is checked when it is built.

### What falls back, and in which rulesets

Rulesets: 12 = 1.2, dos = DOS 2.0, 301 = 3.0.1, 405 = 4.0.5, orig = 5.0.5, palm = Palm, clm = Claude, m20 = Mac 2.0.1, m405 =
Windows/Mac 4.0.5, gem = Gemini, ios/and = iOS and Android. A command shows only in the rulesets that have the feature.

| Command (Ho! 1.2 menu) | Opens (classic) | Rulesets |
|---|---|---|
| Players and history; Players and alliances… | Players: the list, history, and the alliance, best-buddy and surrender controls | the first in all; the second in all but ios, and |
| Give money or metal… | Give Money/Metal | 301, 405, orig, palm, clm, m405, gem |
| Send a message… | Send Message | all but 12, ios, and |
| Dip into savings… | Dip Into Savings | 301, 405, orig, palm, m405 |
| Surrender… | Surrender (and "Take back surrender") | 301, 405, orig, palm, clm, m405, gem |
| Armageddon device… | an "Are you sure?" alert | 301, 405, orig, palm, m405 |
| Radical research… | Radical Research | orig, palm |
| Compare players… | Compare Players | dos, 301, 405, m20, m405 |
| Hall of Fame…, Hall of Shame… | Hall of Fame / Shame | 301, 405, m405 |
| Master Point List… | Master Point List | 405, m405 |
| Rank history… | Rank history | orig, palm |
| Group fleets… | Group Fleets (1.2 has its own Organize Ships…, which is not touched) | orig |
| Organize fleets… | Organize Fleets (the Palm's) | palm |
| Preferences… | Preferences | all |
| Auto play… | Auto Play | all |

### Not reached by a menu item (found by playing 5.0.5 and 1.2, or by reading the code)

- **Create New Ship Type… offered four classes** whatever the ruleset. 5.0.5 lets you build **Tankers and Dreadnoughts**, and
  **Biologicals** and **Decoys** once the player has them (`canBuildType`). The art was already there
  (`assets/skins/mac12/sprites/fill/`: `mac4-p2263`, `mac4-p2261`, the Tanker's body `mac4-p2758` outlined).
- **French names for those classes were missing** (`CLASS_FR` had 1.2's four), so a Tanker or Dreadnought listed as "undefined ...". 1.2F
  and 3.0.1F have no words for them; iOS's are the nearest official (`docs/glossary-fr.md`).
- **Build Ships queued ships that were never built, in every ruleset but 1.2's and DOS 2.0's.** *Found by testing, not on the brief's
  list.* The skin's Build window always queued (`HO.queueShips`, 1.2's way); only a ruleset with `buildQueue` builds a queue. In 5.0.5 two
  ships queued, two turns passed, 0 ships and the queue still full, no money spent. Later rulesets buy ships at once.
- **The players' strip showed no pacts** and opened nothing.
- **Battle stance and Arrive late were unreachable.** The classic fleet row has them (a select and a check box); this skin's own panel has no
  such row. Six rulesets have them. *Found by comparing the features the classic UI acts on with those the skin acts on* (`waypoints`,
  `yearsPerTurn`, `stances`, `singleTypeFleets`, `lateArrival`: `waypoints` is the map drag and `yearsPerTurn` only changes the number of hints;
  `singleTypeFleets` is DOS 2.0's alone and was not looked at).
- **Evacuate was unreachable.** Classic offers it on the planet panel, in the map's right-click menu and on a Palm message; this skin has none of
  the three, and 1.2 itself had no command (`evacuateCommand: false`), so a 3.0.1 or later game could not give up a colony.
- **The Tech Spending box had 1.2's five techs,** so 5.0.5's sixth, Radical research, could not be given any of the budget in this skin.
- **Colour pictures in a black-and-white skin:** the Radical Research window's picture beside each program (5.0.5's `m9010`) and the Master
  Point List's rank picture (Windows 4.0.5's).
- **Checked and found nothing to build:** novas on the map and in reports (1.2-look stars, `fill/` art; `skin-holes` finds 0 classic
  pictures in 5.0.5, 4.0.5, 3.0.1 and 1.2 rules), a debt (the Totals box prints `Savings ($42,000)`, as classic does), an armed Armageddon
  device (classic shows only the menu item's changed words, "Turn off the armageddon device", and the Ho! menu does that).

### The remake's own windows, listed for Jake's call (decided: restyle them too)

**Skin and OS look…, Sounds…, Language…, Temperatures…** are the remake's own conveniences, not game features. Jake said to restyle them
too: they are dressed (below). Menu items that only toggle need no window and are already in the 1.2 menu: Modern conveniences, Full
Hoedown, Every version's jokes (shown while Full Hoedown is on), Turn sound on / off, Turn theme music on / off, Fit galaxy. **Left as they
are:** New game, Quit, About, Account, Import, Export, Suggestion box and the manuals, (the full-screen **Saved Games** page, the iOS and Android
rulesets' "Saved games…" and 1.2's own Open…, was first left too and was then restyled in CSS: see "Windows dressed, not rebuilt").

### What was built (November 2026)

Every item is **the remake's own** (there is no original to match). `remake12` marks each in the page, `native12` those built in `ui.js`,
`css12` a later version's own window dressed by `style.css`. See `HANDOFF.md` of the package for where each look came from.

| Control | Rulesets | How |
|---|---|---|
| Players window (pacts, best buddies, status, history, Surrender) | every ruleset (in 1.2's own rules only from the Ho! menu) | `native12`, `playersWindow` |
| The players' strip: a ring for an ally, a double ring for a best buddy; a click opens the Players window | later rulesets only | `native12` |
| Create New Ship Type: Tanker, Dreadnought, Biological, Decoy (the ruleset's `canBuildType`) | later rulesets | `native12` |
| Build Ships buying at once, with a refund, rs.manyShips and rs.allowDebt | rulesets without `buildQueue` | `native12`, `buyShips` |
| The sixth research bar, Radical | rulesets with Radical research | 1.2's vertical bars, narrower |
| Give, Message, Dip, Surrender, Armageddon's question, Radical Research, Rank history, Group / Organize Fleets, Compare, the Halls, Master Points, Preferences, Auto Play, Skin and OS look, Sounds, Language, Temperatures | each its ruleset's | `css12` (the window's own code, 1.2's content look) |
| Colour pictures in those windows in 1 bit | | Radical: the skin's stand-ins; Halls: Atkinson dither at display |
| Rank history: the rank's 1-bit picture in a frame, the ranks in a list box (own rank in inverse, earned ones starred), the wins in a second list | 5.0.5, Palm | `native12`, `ranksWindow`; needs the hook `skinWindow('ranks')` and `profile`, `rankOf` in `T.api` (classic `ui.js`) |
| Give Money/Metal, Send Message, Dip Into Savings, Surrender, Radical Research, Auto Play | the rulesets that have each | `native12`: `give12`, `chat12`, `dip12`, `surrender12`, `radical12`, `autoplay12`; hooks `skinWindow(...)` in classic `ui.js`, the helpers a skin needs added to `T.api` |
| Only the important messages, hints, best buddies' stars (Preferences, the 1.2 way) | rulesets whose Preferences window has them | `native12`: check-marked items in the Options menu (`prefItems12`), the ruleset's own words |
| The fleet box's rows and the selected fleet's lines; the planet and fleet words | every ruleset but 1.2 | borrowed from 1.2's own routines (`RS12`, `langView`, `planetWords`); mixed fleets: the engine's label |
| Battle stance (Normal, Offensive, Defensive) and Arrive late, on the selected fleet | rulesets with `stances` / `lateArrival`: 5.0.5, Palm, iOS, Android, Claude, Gemini | `native12`: check-marked items at the foot of the Ships menu (`fleetOrders12`), dimmed unless a fleet of yours on the ground is selected; absent from 1.2's own menu; the words are the table's (iOS's, the Palm's) |
| Evacuate planet (5.0.5's "Evacuate Planet" / "Don't Evacuate Planet" mark, 3.0.1 and 4.0.5's confirmation) | rulesets with `evacuateCommand` (3.0.1 on; not 1.2 or DOS 2.0) | `native12`: an item at the foot of the Galaxy menu on the selected colony of yours; the classic code's own `evacuateClick`, so each version's words, jokes and rules hold |
| The transient message (toast) and the hover tip in System 6's black and white; the full-screen Saved Games page as a System 6 window | all | CSS only |

`menus()` puts each remake command in the Ho! 1.2 menu. "Group fleets…" (5.0.5) and "Organize fleets…" (Palm) are the commands in it that
are strings; 1.2's own Organize Ships… (a function label) is the one `menus()` filters out, since the Ships menu has it. They are meant to be
there: it is how those two commands stay reachable.

### Found on the way

- **`lang()` said French for an English game.** It read `G.opts.lang`, unset in a game played in a ruleset's own language (5.0.5's is
  English), so a 5.0.5 game showed French in the Tech box and the class menu though the menus were English. Fixed: the fallback is
  `HO.ownLanguage(HO.ownRules(G))`. 1.2's rules (own language French) are unchanged; no exception for a game wrong at launch has been needed.
- **`descN` (the list of ships bought) needed `rs.shipsDesc`,** which only 1.2's family has; any later ruleset threw an error the first
  time a ship was bought. Fixed (found while testing the new Build window).
- **The remake's windows were dressing 1.2's own.** The first version tagged every classic window `remake12 css12`, so under 1.2's own rules
  the explored-stars list and the like took the remake's content look (Geneva 12, 9-pixel notes, pixelated images). The display audit checks
  words and data, not CSS, and did not see it. Now nothing is tagged under 1.2's rules except what the remake's own commands open (the Ho!
  menu's items tag their windows when they open them); `tools/skin-rules-check.js --skin=mac12` fails a remake command whose window is not.
- **The Players window offered Surrender where the ruleset has none:** iOS and Android have the `surrender` rule but `surrenderCommand: false`
  (no command, no menu item). Found by reading; the harness now checks the button against the command.
- **The Tech box's second row of names is cut at the box's foot** with five bars too: the original probe showed it before any change. Not
  touched.

### Update, round 3: most of those windows were then rebuilt (November 2026)

Jake asked for everything that could be in 1.2's own widgets to be. **The table below was written before that and is partly out of date;** this is
what is true now. Widgets (`ui.js`): `vbar12` (1.2's vertical bar: an axis with ticks, a black bar rising from a base line, dragged or moved by the
keys), `list12` (a list box, the chosen row in inverse, as 1.2's own lists), `ask12` (the plain "Are you sure?" as 1.2's title-less alert; under 1.2's
own rules the classic box stays). **Rebuilt as the skin's own windows (`native12`), each calling the engine as the classic window did and keeping each
ruleset's words, limits and forms:** Give Money/Metal (one window for the face grid, 5.0.5's sliders, the Palm's steps, iOS's tap), Send Message (all
three forms), Dip Into Savings, Surrender, Radical Research, Auto Play (all three forms), and the Armageddon and Surrender questions. **Preferences, the
1.2 way:** 1.2 kept its settings as check-marked Options menu items, so the preferences a later ruleset adds (only the important messages, the
between-turn hints, the stars your best buddies explore) are Options items too, in the ruleset's own words, only where its Preferences window has them
(1.2's and DOS 2.0's Options menu are as they were); the Preferences window itself stays the version's own, dressed.
**Not rebuilt, because they already are 1.2's widgets in the version's own arrangement:** Skin and OS look, Sounds, Language, Temperatures (a paragraph,
popup menus and check boxes, as 1.2's Create New Ship Type has); the Halls, Master Points and Compare (list boxes with the row in inverse). The Group
fleets (5.0.5) and Organize fleets (Palm) windows are piles of ship pictures like 1.2's own Organize Ships, and stay the classic code's, dressed.

**Found while doing it (all of the one kind: the skin assuming a routine only 1.2's ruleset has):**
- **The fleet box was blank in every ruleset but 1.2's.** Its rows use `rs.shipsText` and the selected fleet's lines `rs.fleetInfo`; `shipsText`,
  `fleetInfo`, `shipsDesc` and `planetInfo` exist only in rules-12 (checked in the live rulesets, not by reading, since several inherit). So from DOS
  2.0 to Gemini the box showed empty rows and no fuel, speed or destination. Now a ruleset without them gets 1.2's own routines through a view of the
  game in the player's language (they read `G.opts.lang` and say French when it is unset), or the engine's label ("3 Scouts", "6 ships").
- **A mixed fleet** (5.0.5 and later may hold Scouts, Fighters and Tankers together; 1.2's rule is one design) opened an empty Organize Ships window;
  it now opens the classic organizer, whose piles are a design in a fleet.
- **Scrap This Type** called `flagScrapDesign`, which Gemini lacks: it scraps at once after the question, as the classic window does there.
- **The skin's own battle window** (`bw12m`, 1.2's animation) was tagged as the remake's and so got its content CSS; it is excluded now.
- `battlePanel` is missing in Claude and Gemini; the skin's battle uses it only where it exists (the others use the classic written battle), so the
  fallback written for it is not reachable. Not staged: I could not make a battle happen in those two.

### Windows dressed, not rebuilt: a note for later (November 2026)

After the first package Jake asked for the noticeable ones to be rebuilt in a 1.2 layout and the rest noted. Each window below was looked at
full size beside a native 1.2 dialog (Create New Ship Type, List Ship Types, the battle speed window). **Rebuilt: Rank history only** (it
was a ruled table with centred paragraphs, a web page's; now a 1.2 list box, `ranksWindow`). The others already read as System 6 dialogs
through the OS look, and are **later versions' own windows, kept with their own rules**, so a rebuild would change a few pixels of layout and
carry the risk of dropping a version's behaviour. What a rebuild would do, and where it would pay:

| Window | Variants it carries (a rebuild must keep each) | What a rebuild would change | Worth it? |
|---|---|---|---|
| Preferences | `prefs505` (PPob 139), `prefsIOS`, `prefsPalm`, the generic form (`verPrefs`); needs `Prefs`, `savePrefs`, `ownCelsius`, `setOwnCelsius`, `modern`, `setModern` exposed in `T.api` | order and spacing; the remake's options below the line could be a 1.2-style group | Low: it is already the real 5.0.5 dialog; four variants make it the costliest |
| Auto Play | 5.0.5, iOS, generic (`openAutoPlay505`, `openAutoPlayIOS`, `prefsAutoPlay`) | none visible: group box, radio dots, thin slider rails already match | No |
| Give Money/Metal | `rs.giveWindow` per version (3.0.1 grid, 4.0.5, 5.0.5 sliders, iOS, Palm), recipient list, canned amounts | none visible: the bar sliders with ticks are 1.2's own idiom | No |
| Dip Into Savings, Surrender, Send Message | `rs.dipSet`, 5.0.5 `dip505`, iOS/Palm forms; `cannedChat` | none visible | No |
| Radical Research | `radicalHand.words`, timeout (4.0.5), keep-choice (5.0.5, Palm, iOS) | the radio rows could be a 1.2 list box with its picture; the 1-bit picture is done | Low |
| Compare Players, Hall of Fame / Shame, Master Point List | 4.0.5's own windows (`rs.hall`, `hallListBox`, dialog 386) | none: they are already list-box windows | No |
| Group fleets (5.0.5), Organize fleets (Palm) | version organizers, scrap marking | 1.2 has its own Organize Ships (kept, in the Ships menu) | Low |
| Skin and OS look, Sounds, Language, Temperatures | the remake's own, no version behind them | a pixel-font canvas or 1.2 popup menus in place of the `<select>` boxes | Low |
| Saved Games (full screen) | the iOS/Android rulesets and 1.2's Open… | **Done in CSS** (`html .hoscreen` in `style.css`): a window on the grey desktop with a striped title bar (Back where a close box would be), a list box whose row under the pointer is inverted, Mac buttons. What 1.2's own Open dialog showed is not in the repo's findings, so this is the remake's own look. The page's code is the classic's, unchanged | Done; a hand-made System 6 file dialog would be the next step, if wanted |

**Also restyled (CSS only, in `style.css`):** the transient message ("toast", a dark pill in the classic page) is System 6's white box with a
hard shadow, and the hover tip's pale yellow is white. Both are the remake's own.

**What rebuilding any of them would need first:** the window's hook in the classic code (`skinWindow('name')`, as 'players' and 'ranks' have;
Give, Dip, Surrender, Preferences and the rest have none yet) and its helpers added to `T.api`.

### The menu sweep and the harness (how the above were found)

`tools/skin-menu-sweep.js` opens every command of every menu in each ruleset, at the start of a game and after eight turns, and reports a page
error, the game's own bug-report window, and a window that will not close. It found **no crash** in any of the twelve rulesets after the fixes
above (it found 1.2's explored-stars window "stuck": a title-less 1.2 dialog whose close box is hidden and which Escape closes, not a bug). It
cannot find a control that is not there (Build never building, no Evacuate): those came from comparing the classic code's features, buttons and
context menu with the skin's.

`tools/skin-playthrough.js` plays a seeded game in each ruleset, for a number of turns, doing what a player does: buys or queues ships through the Build
window, sends fleets, drags the budget bars with the mouse, creates designs, opens windows, toggles Options items, ends the turn and answers what comes up.
It reports a page error, the bug window, a window that will not close, a blank box in the panel, a fleet box that draws nothing for fleets that are there, a
purchase that changes nothing (money not spent, ships not there, a queue not longer: unless the player could not afford it, or 1.2's queue has every slot
taken, which are the rules), and a turn that does not advance. It is the check the menu sweep cannot be: the Build and fleet-box bugs were in the panel and
the windows, not the menus. Mutation-tested (Build always queueing; the fleet-box fallback removed): both are reported. All twelve rulesets, 20 turns,
seed 7, and several 30-turn games on other seeds, are clean. It does not drag on the map itself (it orders with `HO.orderMove`), force a battle, or save and
reload.

`tools/skin-rules-check.js --skin=mac12` fails on: a Ho! menu command whose window is none of 1.2's own, `remake12` or `css12`; Battle stance,
Arrive late and Evacuate missing from the menus of a ruleset that has them, or present in one that has not (1.2's menus are as they were); the
Players window's Surrender button against the ruleset's Surrender command. What it cannot tell is whether a window *looks* right: each was
looked at.

### A long 3.0.1 game (November 2026): what was seen, for the next iteration

3.0.1 had been the one ruleset whose Give and Send Message were never opened, because it dims `alliances`, `give`, `surrender` and `chat` while the year is before
2001 (`rs.menuDimmed`) and a game starts in 2000. **One End Turn lifts it** (the first turn goes to 2010). So that was the test setup, not a gap.
- **40 turns (year 2000 to 2400, seed 41, `tools/skin-playthrough.js`): no problem** of any kind: no error, no stuck window, no blank box, every purchase real.
  At the end: 41 stars, 4 players all alive, 1 battle, 0 captures. A 3.0.1 game does not end by itself in 40 turns; **the play-through does not colonize or fight on
  purpose** (it sends fleets at random), so its "4 of 41 stars mine" says nothing about how the game plays.
- **After two turns every dimmed command opens as the skin's own window and works, checked against the game's state:** Give (3.0.1's words, "Give Stuff To:",
  "Give How Much Money?"; $1,500 given, savings 40,360 to 38,860, gifts this turn 0 to 1), Send Message (its stepped form: "Send Message To Who?", "Saying What?
  I Want / You Take ...", "Which Star?"; sent), Players (an Ally column only, 3.0.1 has no best buddies; ticking it set the pact and the status read "You offered to
  ally"; the Surrender button is there, 3.0.1 has the command), Surrender (the generic form; the take-back question: Cancel keeps it, OK clears it), Dip Into Savings
  (generic: to 100% in steps of 5), Armageddon (the question, then on). Compare Players ("Your rankings among the 4 remaining players in 2020") and the Halls open as
  the version's own windows, dressed.
- **Not covered, worth doing next:** a 3.0.1 game played *to its end* (a win or an elimination: the You Won / You Lost windows were looked at directly, never reached by
  play, and the "name a star" and rank windows after a win); **colonizing** on purpose (send colony ships to unowned stars and see them settle, the colony's panel,
  the budget bars of a new colony); a real fight (the skin's own battle window reached by play, not staged); and the same long game in 4.0.5 and 5.0.5 (3.0.1 was
  the only one given 40 turns). `tools/skin-playthrough.js` could be taught to colonize and to attack: that is the single best next addition.

### Playing to the end, colonizing, and a window that could not be closed (November 2026)

**Found by playing a win to its end: the "name a star" window could not be closed without naming a star** (1.2 and every ruleset that asks the winner for a star:
DOS 2.0, 3.0.1, 4.0.5, Mac 2.0.1, Mac 4.0.5). 1.2's own dialog (DLOG 4050) has no Cancel and says "click OK with the name blank"; the skin laid it out that way
(`nameStarLayout`) but the classic form ignores a blank name and relied on the Cancel button the layout removes, so after winning the game was stuck on it. A
blank OK now presses that Cancel's own handler (the decline, with its "no longer asking" record). The harness opens the window (`HOAPI.openNameStar`) and fails if a
blank OK does not close it; mutation-tested.

**`tools/skin-endgame.js`** plays a game to its end through the real End Turn, for each ruleset, a win and a loss, and drives every window and card the interface
offers (the eliminations, "Congratulations!", the name-a-star window, the Palm's and iOS's "New rank" windows, the Hall of Shame offer, the end card), then presses
"New game" and checks it gives a fresh game. All twelve rulesets, both ways: no problem (after the fix). It sets the situation up in the game's state, because each
ruleset keeps its own idea of who is out: 5.0.5 relies on `alive`; 4.0.5 caches a player's colony slots in `slots301` (emptying the planets alone left them counted
as colonies); 4.0.5 and Mac 4.0.5 do **not** end the game for an eliminated player (it plays on, the clock still works), which is how that version plays. **Not
staged: an alliance win**, which needs the computers to agree to ally (they answer "I hate Jake"); forcing it would bypass the engine's own rule.

**Colonizing by play** (a colony ship bought through the Build window, sent to the nearest unowned star in range, turns ended until it settled, the new colony's
panel looked at and its shipbuilding bar dragged by the mouse): 1.2, 3.0.1, 4.0.5, 5.0.5, the Palm, Mac 4.0.5, Gemini and iOS: it settles (stars 1 to 2), the panel is
not blank, the bar moves (share 0.877 then 0.36). **Not run:** DOS 2.0, Mac 2.0.1, Claude, Android.

**1.2's planet box with nothing left to buy** (72 degrees and no metal, so terraforming and mining are both finished): it draws the shipbuilding queue ("En cours:"
or "Néant.") in place of the bars, so there is no bar to drag. That is 1.2's own display, kept; it looked like a bug to a check that expected a bar to move.

**The play-through tool's own faults, fixed:** its "drag a budget bar" action began below the bars and moved nothing for a while, so it was not testing what it said; it
now drags inside the bars and fails if the shipbuilding bar does not change (except when 1.2 shows the queue, above, or the share is already 100%). It also reported
three false alarms of the kind "a purchase changed nothing", each a rule of the game: a design the player cannot afford, iOS's and the Palm's Allow Debt floor of $0, and
1.2's queue with every slot taken. It now prints a one-line summary at the end of each game (year, stars, ships, battles).

**Still not done:** a fight reached by playing (the skin's own battle window has been opened on battles made by planting an enemy fleet and ending the turn, in 5.0.5,
4.0.5 and DOS 2.0, with Modern conveniences off); 4.0.5 and 5.0.5 played as long as 3.0.1 was (40 turns); saving and reloading; the alliance win; the three colonizing
gaps above.

### Modern conveniences does not change the game (November 2026)

The New Game / Preferences option "Modern conveniences: automatic routes, the map follows the news, battle speed and written battle reports (not in the original games)".
- **Nothing outside the interface reads it.** A search of every file outside the skins finds it only in `online.js` (listed as a *local* look option, with the OS look and
  sounds, not shared game state) and in two comments in `rules-12.js` and `rules-dos.js` ("no Evacuate button, even with modern conveniences on": it adds no ability).
  In the interface it does three things: draws and uses a hop route through your colonies for an order that is too far (`findRoute`, `autoRoute`); centres the map on a
  report you click; shows a battle as a written report with a speed menu (Slow, Normal, Fast, Skip to the end) instead of the animation.
- **`tools/skin-modern-compare.js`**: the same game three times (Modern on, on again, off; the seed fixed by a fixed random sequence at the moment the game is made), a
  passive player, a fingerprint of the whole game after every turn. 3.0.1, a small dense galaxy, three strong computers: the passive player is eliminated at turn 69
  (year 2690), the lose window ("Unfortunately, you have been eliminated from the game…", "Oh, well…") and the end card appear, identically with the setting on and off; **all
  69 turns identical in all three runs** (planets, money, metal, ships, tech, battles and captures of all four players). On and on matching proves the game repeats.
- **`tools/skin-route-compare.js`**: with the setting on, one order sends a fleet along a route through your colonies; off, the direct order is refused and each hop is
  ordered by hand at once. The fleet **arrives on the same turn** (Claude 4 turns, Gemini 6). Only Claude and Gemini lack their own routing rule (`rs.route`, asked of the live
  rulesets); in every other ruleset the game routes the fleet itself, with or without the setting, so the setting changes nothing there.
- **A game the player WINS, with fighting, the same on and off (`tools/skin-modern-win-compare.js`).** Setup, chosen with the user: the smallest and densest galaxy (5.0.5: size 0,
  density 0 = dense, hex shape: 19 stars, each 4 from its neighbours, inside a fleet's range of 6), the fewest computer players (one, then two) at the dumbest level (strength 50),
  my start Abundant, theirs an Outpost. A scripted player decides everything from the game's state (research in weapons and shields, a fighter design, settle stepping stones toward
  the enemy by a path search, send a wave only with 30 ships and twice the enemy's), so the same game gets the same orders. Seed 8 (one computer): **won at turn 9**, one battle, one
  capture. Seed 5 (two computers): **won at turn 30**, 7 battles, 3 captures. Each game played three times (Modern on, on again, off): **every turn identical**
  (each player's planets, money, metal, ships, tech, and the battle and capture counts), and the scripted player's decisions identical. With "Review Announced Battles" on the battle
  is displayed, and the two presentations differ as designed: on, the written battle with its speed menu ("Slow, Normal, Fast, Skip to the end" and a "Written report" expander);
  off, the skin's own full-screen battle ending "413,478 killed" and an OK button. The win screen is the same: "You conquered the galaxy.", "You won…", "New game", "Tell us how it went".
- **Finding a galaxy the player can win in is the hard part** (`tools/skin-find-galaxy.js`): in 5.0.5's default grid the stars are 7 apart and a new ship goes 6, so no ship can reach any
  other star; of 600 random 3.0.1 galaxies only 6 connected the two sides; the hex shape at density 0 (dense) is connected in every seed tried. A scripted player that cannot cross the gap
  can only draw (an early attempt built 36 fighters it could never send). Version by version the New Game window has different controls (3.0.1's `m_size` ..., 4.0.5's `w_size` ...,
  5.0.5's `o_size` 0 to 100 and `o_iq` 50 to 200): the ones for the other versions are ignored.
- **Still not compared:** the same on a longer game (many turns, many battles); the other rulesets (the scripted player and the galaxy finder are written for 5.0.5's controls and
  3.0.1's/4.0.5's are set but unscanned).

### Screens: an inventory (November 2026)

Until now there was no list of every window and screen the game can open. The shared interface code has about fifty `open...` functions. **Seen and exercised in the 1.2 skin**
(by the menu sweep, the harness, and hand-driven tests): Build, Give, Message, Dip, Surrender, Radical, the three Auto Plays, Players, Rank history, name-a-star,
You Won / You Lost, both battle windows, Group fleets, the fleet and star lists, Scrap types, Compare, the Halls, Master Points, Preferences, Skin / Sounds / Language /
Temperatures, Saved Games and its account dialog. **Opened for the first time on this round** (`tools/skin-screens.js`): About this version, Help ("How to play"),
Reports, Account, Split fleet (5.0.5 and iOS); Compare's **Show Skills** (4.0.5: "List of all players and their skill levels"); iOS's Help and Game Center screens;
and, after a natural 5.0.5 win, the end card's **"You won…"** ("Congratulations! You have conquered the galaxy!" with the 1-bit conqueror) and **"Tell us how it went"**
(the feedback window). All look right except two, which are now adapted: **iOS's and Android's Help screen** is an iframe of the version's manual, a dark page with a
colour screenshot in a window too short to read; **iOS's Game Center** had iOS blue tabs, orange stars and grey icons. Now: the window has room, the manual page is restyled
black on white when it loads (the page is same-origin) and its screenshots dithered to 1 bit (`manuals`, `ditherImg` in `ui.js`), and Game Center's controls are black and
white (`style.css`). Under 1.2's own rules the Help window is 1.2's, untouched.
**The four that opened nothing at first all needed a set-up, and now all work** (`tools/skin-screens-flows.js`, and the battle list through the won-game tool): **Patch notes**
needs a game started with the Patch option in a version that has fixes (4.0.5: 13, 5.0.5: 4): the Ho! menu's "Patch notes…" opens "4.0.5.1 patch notes (unofficial)" and "5.0.5.1 …" with the
fix lists. **Game text** is not a window but the loader behind Import a game… and Account saves ▸ Open: Export this game… asks for an optional password and downloads
`Milky Way 2020.hogame` (85 KB); importing that file from the title opens it ("The imported game is open.", same year, turn and ruleset). **The Hall's Details** (`openHallSummary`) opens as
"Summary of Game Victory" (winner, date, difficulty, humans, computers, allies, computer intelligence) from a real entry. **The battle list** ("Review battle": star, year, against, lost
you / them) opens from a game in which the player fought, in the 1.2 look, and a row opens the battle: the written report with Modern conveniences on, the skin's own battle window off.
Online play (Join, Lobby, My online games, Account saves) was tested against a fake Firebase (see "Online play in the 1.2 skin").
**Still not seen:** nothing from the inventory except what needs the real Firebase.  About, Help, Reports and Split were looked at in all twelve rulesets (`tools/skin-screens.js`): every one opens, dressed in the skin's look, with no errors. The win and lose screens: lose reached by play in 3.0.1, win by play in 5.0.5 (with both end-card buttons), the rest of the twelve rulesets with the
situation staged (`tools/skin-endgame.js`).

### Online play in the 1.2 skin (November 2026)

The online screens (Account, Account saves, My online games, Join with a code, the Lobby, the online game's own window) are shared code (`js/skins/classic/ui.js`, `js/online.js`,
`js/cloud.js`) and are the remake's own: 1.2 had none. The question was whether they work in the 1.2 skin as they do in 5.0.5's.
- **Reached the same way:** the title's Sign in (and "Account: Guest" once in), New Game's "My online games…" and "Play online…", the Ho! menu's Account… and Account saves…, Export and
  Import; the same Account window (Google, email and password, Create account, Forgot password, Play as a guest); and offline each fails soft the same way (checked in the 1.2 skin and the
  classic skin, 5.0.5 and 1.2 rules).
- **The real emulators cannot run in a sandbox** (they are downloaded from Google's servers on first use), so `tools/online-fake.js` is a fake Firebase (Auth and Firestore, in memory, no
  `firestore.rules`) served in place of `js/vendor/firebase.js` and shared by every browser window of a test. `tools/skin-online-check.js` uses it with only the controls every skin shares.
  **Results, in the 1.2 skin:** (saves) a guest signs in from the title, End Turn uploads the game, Account saves lists it with Open / Download / Delete; (two) 2 players, 4.0.5, 9 turns, a page
  reloaded in the middle of a turn (Continue opens the game again): the same game state in both browsers after every turn, and each turn's orders give the page's own game; (three) 3 players,
  5.0.5, 8 turns, a player sitting a turn out (the host's "End turn for…"), a resignation, 9 to 13 battles: the same state in all three browsers after every turn. My online games lists the game.
  Mutation-tested (the Account saves item removed: reported).
- **Looks:** the lobby (code, seat list, Copy link, Start the game), the Join form and My online games are System 6 dialogs. Two leftovers fixed: the lobby's link was blue (now black,
  underlined) and the title's account button was a grey web pill (now a System 6 button).
- **Not shown:** real Firebase (the fake applies no security rules, and its Google sign-in is a fixed fake account; a real popup, real network failures and real rules were not exercised);
  `tools/online-test.js` against the emulators (it is written for the classic skin's page: its menus, panel and bar controls), which a machine that can run the emulators should still run;
  the shared Hall of Fame online (the Everyone view) and the shared star names; hosting with the 1.2 rules (no 1.2 game was played online); Android's and iOS's version of the lobby.

### The full regression battery on the final code (November 2026)

Run once more after the last changes (the online stylesheet, the iOS Help and Game Center screens, the new tools), in chunks. **All passing:** `skin-rules-check.js --skin=mac12`, all 12
rulesets; the same harness for the iOS skin and the DOS skin, all 12 rulesets each (the shared-code check); `display-audit.js 12` (0 gaps); `skin-holes.js` (0 classic pictures borrowed);
`human-play.js` (12 of 12); `skin-menu-sweep.js` (12 rulesets, turns 0 and 8, 0 problems); `skin-endgame.js` (12 rulesets, a win and a loss each); `skin-online-check.js mac12` (saves,
two players with a mid-turn reload, three players with a skipped turn and a resignation: the same state in every browser after every turn); `ui-lang-audit.js` (every skin, 72 runs);
`skin-playthrough.js` (12 rulesets, 20 turns, seed 7, 0 problems). **Notes on running it:** clear a stale web server first (`kill $(ps aux | grep "[h]ttp.server" | awk '{print $2}')`: a
crashed run leaves one holding the port, and a later tool then hangs or fails); keep each command under 300 s (three or four rulesets per call; a "page closed" failure at the end of a
long run is the time limit, not a bug; rerun that case alone); never `pkill -f` with a pattern that appears in the command itself. **Still not run:** `tools/online-test.js` against the
real Firebase emulators (they cannot be downloaded in a sandbox); `bundle.py` and `doc-sprites.py`; sounds by ear.

### The language rule, and what the language pass found (November 2026)

**The rule (Jake's, standing):** the game as published plays as published every time, and the patch makes it the best version of itself. For translation: a version with **no French edition of its own
takes the nearest published French edition's words**: the French iOS for the 5.0.5 family (5.0.5, Palm, iOS, Android), and where iOS has no such word, 3.0.1F, then 1.2F. A word stays English **only if
it stayed English in the original** (the French iOS keeps "Temp:", "Auto Play" and "Tanker" in English, so ours do). **The patched game (HO.fixed 'translations') uses the best translation regardless**
(the patch's typography and wording: `HOLANG_REMAKE.<lang>.patch`, `.patchWindows`, and now a row's patched variant in `js/ui-text.js`).

**Found by opening about 25 windows in all five languages in every ruleset** (`tools/skin-lang-screens.js`, `tools/skin-lang-end.js`):
- **Seven window words** were English in the French of every version without 3.0.1F's windows (5.0.5, Palm, iOS, Android, 4.0.5, Mac 4.0.5), though the French editions had them: the Scrap Ship Types window's
  "Class:" (1.2F "Classe:"), "Development Cost:" (1.2F "Coût de développement:"), "Rename" (1.2F "Renommer"), "# Built:" (3.0.1F "Construits:"), "#Existing:" (3.0.1F "Existants:"), and the fleet list's
  "List of All Fleets:" (3.0.1F "Statut des flottes:") and "Go To Fleet" (3.0.1F "Rejoindre flotte"). Now rows in `js/ui-text.js` with the official French, source-tagged (`1.2F`, `3.0.1F`), and the patch's
  typography as the patched variant (a space before a colon). A French 3.0.1 game still gets 3.0.1F's own words from its windows (`js/ui-lang.js`: a version's window words come first); 1.2, DOS 2.0 and Mac 2.0.1 keep their own official words.
- **`js/ui-lang.js` `add()`** now lets a row carry only a patched translation (null in the unpatched place), for a word with no published translation that the patched game should still put in the language. (A first
  attempt in `patchWindows` did nothing: that map only corrects a word the version's own French already had.)
- **A bug in this skin's Rank history window:** every earned rank was shown as "★ City Slicker", the star and the name in one string, which is in no table, so every earned rank stayed English in every language.
  The star and the name are now separate pieces.
- **Not gaps:** cognates and loan words (Mini, Population, Messages, Points, Ranger, Desperado, Metal, Name, Start), names and dates ("Windows 95 4.0.5 (1996)", ship names), and strings the French iOS itself left in English.
- German, Turkish and Spanish: nothing untranslated in any ruleset except the same-word cognates above. The Claude and Gemini rulesets offer English only.
- The end of a game (win, lose, end card, "You won…", feedback) in all five languages, 3.0.1 and 5.0.5: nothing identical to English.
- **Not covered:** the end of a game in the other rulesets and with the patch on; Patch notes, the Hall detail and the online screens in other languages.

**Menus, every ruleset, every language (`tools/skin-lang-menus.js`), unpatched and patched:** the only English left is words the language shares ("Options", "Normal", "Offensive"). One real forgotten
item was found and fixed, in this skin: the Options menu's iOS and Android item "Messages: Only Important" was built from iOS's two words *before* translation, so it was English in every language though both
words are in the table ("Seulement Important" is the French iOS's own); the two words are now translated apart and joined (`tr12` in `prefItems12`). The same slip as the Rank window's star: **a string made by joining
words in code is in no table; translate the pieces, then join.** No existing translation was changed (the seven French rows above are official words from 1.2F and 3.0.1F).

**End of a game, the online screens and the Halls, in every language (this round, `tools/skin-lang-end.js`, `tools/skin-lang-online.js`):** the end of a game (win, lose, end card, "You won…", feedback) in
1.2, DOS 2.0, 3.0.1, 4.0.5, 5.0.5, Palm, iOS, Android, Mac 2.0.1 and Mac 4.0.5; the online screens (Account, the lobby, the Join form, My online games); the Hall of Fame window: nothing forgotten in English.
**One gap, by the rule, fixed in the patch only:** the German DOS 2.0 and Mac 2.0.1 never translated the name-a-star window's rule line ("Star names must be 4 to 7 characters long.") and hint ("click OK with
the name blank"), only its heading and label. As published they stay English; the patched game now has them in German (`js/lang-remake.js`, the German `patch` map, in the German the remake already uses for
the "2 to 7" version of the same lines). **Not checked in other languages:** the Hall detail window ("Summary of Game Victory"; the Halls themselves are), Patch notes (plain text), the end of a game in the patched
games other than DOS 2.0.

### Final verification (6 November 2026)
Every check in `START-HERE.md`'s verification record was run on exactly the code in the package (the six changed code files are byte-identical to the working repo), and the package was laid over the original
upload and smoke-tested there. The last re-runs after the final edits (the Rank window's star, the iOS "Messages: Only Important" menu item, the German patch lines): `skin-endgame`, `skin-playthrough`, `skin-online-check`,
the harness for the 1.2, iOS and DOS skins, the menu sweep, and the language audit: all pass.

### The map window's scroll bars (Mac 1.2 and 2.0.1 skins, November 2026)
Jake's decision: if the original had scroll bars, so do the skins; dragging the map is a modern convenience (a finger always drags). Read in MapWinProc (2.0.1's routines are the same code, rows in `docs/display/mac201.json`):
- **The original's map is a scrolled part of the galaxy at every zoom.** GrowMapWin `@c29c0`: cells in view = pane pixels / zoom (6, 9, 12 or 17 pixels a cell, setup +0x26); each bar's maximum = the galaxy's size - the cells in view (0 when they all fit: the bar is then inactive and the galaxy sits at the pane's top left); page = 3/4 of the cells in view; the value is clamped to the new maximum. Bars 16 wide at the window's right edge and foot (CreateMapWin `@c2704`, procID 16).
- **Scrolling** (InitDelta `@c56d4`, ScrollMapWindow `@c5746`, ContentClick's CONTROLPROC `@118cc`): arrow 1 cell, page click the page, a held part repeats every 6 ticks; the thumb is dragged as an outline and the map moves when it is let go (ThumbMapWindow `@c5804`); ScrollMapResponse `@c588c` scrolls by the change x zoom pixels. A star's pixel is origin + cell x zoom + zoom/2 (GetStarCenterCoords `@c5cc2`).
- **Zoom and selection:** Zoom In / Out set the zoom then CenterOnStar(selected, 0, force) (`@120900`, `@120980`); CenterOnStar `@c5a0c` puts the star in the middle and, unforced, does nothing while it is inside the margins (40 pixels, 85 at the foot). 1.2 had no mouse wheel and no dragging of the map.
- **Built** (`js/skins/mac12/ui.js`, hooks in `js/skins/classic/ui.js`): the bars (the System 6/7 black and white look), whole-cell scrolling, the first view by CenterOnStar on the home star, Zoom as above, inactive bars while a dialog is up. A star's coordinates in the remake are half cells (2 light years to its unit, so a cell is half a unit), so the galaxy is `round(2 x G.W)` cells. Dragging with a mouse and the wheel work only with modern conveniences on (the map follows the pointer and settles on a whole cell at the end); a finger and a pinch always do.
- **Kept differences:** the grow box is not built (the map's pane is the page's remaining area; the browser window sizes it, and shrinking it would only hide cells; the corner is a blank square); only the map's two bars dim (the left column's fleet-box bar does not, and no window stacking exists, so "inactive" means a dialog is open); the thumb's snap-back when the pointer strays is left out (a finger drifts); the arrow glyph and page pattern are the OS's, drawn as `js/os/system7.css` has them (the OS's CDEF is not in the program); the remake's keyboard (arrows, Page Up/Down on a focused bar) and the bars' accessible names (`js/ui-text.js`) are additions.
- **Side by side:** no emulator or Mac ROM is in the sources, so the figure is the code's rectangles and star pixels against the skin (`mapbars-sidebyside.png`): the stars and the bars' rects coincide at V 4/7, H 1/1.
