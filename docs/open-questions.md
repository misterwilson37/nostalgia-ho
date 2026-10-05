# Open questions

The remake has one ruleset per version of Spaceward Ho!, and each must play exactly as
that version played. This file lists, version by version, every question about the
rules that the version's own program doesn't settle, so they can be put to the original
developers. It is filled in one version at a time, earliest first.

## How a question is answered

1. **The version's own code first.** Every routine of the program is read (each version
   gets a coverage file, such as `docs/coverage-12.md`), including jump tables and dialog
   handlers, and the disassembly where the decompile is garbled. Odd or buggy behaviour
   is reproduced as the program did it.
2. **Only if that code truly doesn't settle it**, the next lower version's code: 3.0.1
   falls back on 2.0, then 1.2; 2.0 on 1.2; 1.2 on 2.0 (nothing is earlier); 4.0.5 on
   3.0.1; 5.0.5 on 4.0.5; Palm (a port of 5.0) on 5.0.5. A later version is the last
   resort.
3. **Then the user**, who is in contact with the original developers.

A fallback only keeps the game playable: the question stays open and stays on this list.

The versions, in order: Mac 1.2 (1992; a pre-release of 2.0), DOS / Windows 3.1 2.0
(1993), Mac 3.0.1 (1993), Windows 95 4.0.5 (1996), Mac 5.0.5 (2003), and Palm 5 (2003,
a port of 5.0).

## Legend

- **Open**: the code doesn't settle it. The entry says what the code shows, what the
  remake does now and which version that comes from.
- **Remake's choice**: not a rule of the game (or not one a browser game can follow); the
  remake does something of its own. Listed so nothing is hidden.
- **Interface not done**: a window or command of the original the remake doesn't have.
- **Settled, worth confirming**: the code settles it and the remake does it, but it
  looks like a slip; the developers may want to comment.

---

## Mac 1.2 (1992)

All 548 routines of the program have been read (`docs/coverage-12.md`; none unread), and
every rule question that came up was answered from 1.2's own code. No rule falls back on
2.0. The six rules of the turn the 2.0 pass pointed to (the bars kept per mille with −1
for a finished part, shares used as they stand with the $2,000,000 rule, a lost colony's
share to Savings with its colony ships loaded, a new colony's share by redistribution,
the turn run for out players, the computers planning in the new year) were read in 1.2's
code and are all 1.2's; the ruleset now plays them (`docs/12-findings.md`, "The turn,
read in 1.2's code"). What is left:

### Remake's choices

1. **Random numbers.** 1.2 draws from the C library's `rand()` (`RND`, `srand`); the remake
   has its own random numbers, so a game can't be replayed move for move. (The same
   for every version.)
2. **Nobody left standing.** If every player is out or dying at the same time, 1.2 just
   goes on with no one able to win (`CheckForWinner @a4948` needs exactly one player
   standing). The remake ends the game with no winner. (With one computer, the usual
   case of every human being out can't arise: the computer wins as soon as the last
   human is dying.)
3. **Several humans.** 1.2 lets up to 19 humans join the galaxy file in the year 2000,
   each with a name and password (`RegisterOrCreatePlayer @1016c2`, `DoPasswordDlg`),
   and each plays their turn from the shared file; the turn runs when everyone has
   ended theirs (`EndTurnMenuCall @100b06`, `CheckTurnDone`). The remake's hot seat
   passes one computer round instead, with no passwords.
4. **Sound of a won battle.** 1.2 plays nothing for battle reports
   (`PlayAnnounceSound @130f08`); the remake plays 7027 because its auto play stops on
   that sound.
5. **Battle replays.** 1.2 stores one replay per duel (`DoBattleStage @d0004`, a 'bTTl'
   resource each, deleted after 500 years by `ExpungeOldBattles`); the remake keeps one
   replay per star. The reports are per duel, as in 1.2.
6. **The blank report's picture.** The blank report for a colony wiped out by meteors
   shows your own planet in 1.2 (`GetIconID @130db0`, default case); the remake shows
   its destroyed-colony picture.
7. **The budget sliders.** 1.2's budget window keeps shares in whole per mille; dragging
   one moves the others in proportion, with no floor (`DoHBarClick @c1002` gives every
   slot a floor of 0 and a ceiling of 1,000 before `DetermineNewLevels @c1470`; only a new
   colony's share, `GiveBarPercent @c139c`, keeps losing colonies at their least share).
   The remake's sliders move the others in proportion too; the turn reads each share to
   the nearest per mille.

### Interface not done

- **Fix Spending** (Galaxy menu, "Correction dépenses": `FixSpendingBars @c1fb0`,
  `FixNextSpendingBar @c1b48`): raises each colony that can't pay its loss to its
  minimum share.
- **Naming a star after a win** (`NameAStar @120a04`): the winner's star name is saved
  in the program's STR# 2005 for later galaxies. The remake keeps no such list.
- The preferences for battle speed, showing messages and watching battles, and the
  Explored Planets window.

### Settled, worth confirming

These are what 1.2's code does and what the remake now does; they look like slips.

1. **A colony wiped out by a meteor shower** gets a blank report: the report (1059) has
   no text in STR# 1000 (`ComputeIncomeAndPopulation`, `GetReportString @130746`).
2. **Organize Fleets refuels and reloads.** Rearranging one design's ships at a star
   gives every fleet of that design there the best fuel among them, and each new Colony
   Ship fleet it makes comes loaded with colonists (`OrganizeFleets @113896`,
   `NewFleet @110004`).
3. **Message texts with no command.** 1.2 has the French text for messages between
   players (STR# 1000.37–51, "ten messages per turn") but no way to send one.
4. **Ship and planet power** is worked out at every star each turn (`NoteShipPowers
   @a4254`) and never used.
5. **Out players keep playing their turn**: both passes of `EndTurn @a0004` run for every
   player slot, out or not (pass 1 @a01d4-a037c, pass 2 @a049c-a0534), so an out
   player's money still earns interest and its research goes on (only an out computer
   spends it). 2.0 does the same.
6. **The computers' colony bars in 32 bits**: `ResolveSpending @93378` works out each
   part's money × 1,000 in 32 bits and keeps the result as a word (@9363c, @936a4,
   @936ec), so a colony given more than $2,147,483 for one part gets a wrong bar. The
   remake does the same; it takes a very rich computer to see it.

---

## DOS / Windows 3.1 2.0 (1993)

All 743 routines of the Windows 3.1 program `WINHO.EXE` have been read
(`docs/coverage-20.md`; none unread), and every rule question that came up was answered
from 2.0's own code, with its address in `docs/dos-findings.md`. No rule falls back on 1.2
or a later version. The earlier notes here are settled: taking the first ship out of the
queue loses what was paid (`FUN_10e8_17af`); routes are planned again at every stop
(`FUN_1040_25ce`); a queued design gets new ships in its own slot (`FUN_10e8_16e4`); a
finished part's share is passed on (`FUN_1040_269d`, 2.0 has 1.2's `RestoreStarsBars`); the
Create Galaxy window allows 0 to 19 computers (CREATEGALAXYDLGPROC @1108:15f0-162c). What
is left:

### Settled, worth confirming

These are what 2.0's code does and what the remake now does; they look like slips.

1. **A colony wiped out by a meteor shower** gets report 1009, "%s destroyed your colony
   at %s.", but nothing is given for the first %s (`FUN_1040_27ee` @1040:2ab3-2acd): the
   report formatter reads a player number from the report record's spare bytes
   (`FUN_10c0_0784` @10c0:09b9), which only hold whatever an older report left there
   (`FUN_10c0_0e20` writes them only when it is given something). So 2.0 names a more or
   less random player as the destroyer. The remake says "A meteor shower destroyed your
   colony at …". (1.2 prints a blank line here.)
2. **Organize Ships and fuel.** On OK every fleet of the design at the star gets the
   average fuel used of those fleets, and the average is their total over their number
   counted only up to 11, so with 12 or more fleets it comes out too high (ORGFLEETSDLGPROC
   @10e8:2a7b-2ae6). The smallest fuel used is worked out alongside (@10e8:2a9b-2ab6) and
   never used; 1.2 gives every fleet the least fuel used. Was the average meant?
3. **Organize Ships clears orders**: every fleet of that design at the star loses its
   destination and route, even one the window left alone (@10e8:2e2c-2e6f).
4. **Organize Ships fills colony ships**: a new fleet made in the window is loaded with
   colonists (`FUN_1068_0000` @1068:018c-0194), so splitting an empty colony fleet at a star that
   isn't your colony refills part of it (as in 1.2).
5. **A slip with no effect**: the computers' ScrapOldFighters passes a fleet's number in
   the list as its Range to the route finder (`FUN_1020_4582` @1020:468b); the colony it
   sends the fleet to is always within its fuel, so the Range is never used (3.0.1 has the
   same slip).
6. **Out players keep playing their turn**: the first and second passes run for every
   player, out or not (`FUN_1040_0038` @1040:02de-038b, 04c3-06d5), so an out player's money
   still earns interest and its research goes on (only out computers spend it).

### Remake's choices

1. **Random numbers.** 2.0 draws from Borland's `rand()` (`FUN_1000_13e9`, seeded by
   `FUN_1000_13d6`) through `RND` (`FUN_1100_0000`); the remake has its own random numbers,
   so a game can't be replayed move for move.
2. **Every human out.** 2.0 goes on as long as the computers play (`FUN_1040_3fa6` needs
   exactly one player standing); the remake ends the game when every human is out, and
   with no winner if nobody is left standing.
3. **Several humans.** 2.0 lets humans join the game file in the year 2000, each with a
   name and password (`FUN_1050_1d08`, PLAYERENTRYDLGPROC), and plays each turn when
   everyone has ended theirs, also across machines (`FUN_1050_0e65`, `FUN_1050_1216`). The
   remake's hot seat passes one computer round instead.
4. **The budget sliders.** 2.0's budget window keeps shares in whole per mille, and
   dragging one moves the others in proportion but never below a losing colony's least
   share (`FUN_1010_179a`, `FUN_1010_218e`). The remake's sliders move the others in
   proportion with no floor; the turn reads each share to the nearest per mille.
5. **Evacuate.** The remake's planet panel has an Evacuate button; 2.0 has no command to
   give up a colony (only leaving it unfunded, with the "Let 'em die" warning, box 5060).
6. **Sound of a won battle.** 2.0 plays nothing for the battle reports (`FUN_10c0_0c50`);
   the remake plays 7027 because its auto play stops on that sound.
7. **Battle replays.** 2.0 stores one replay per duel and deletes those over 500 years old
   (`FUN_1050_2bf3`, `FUN_1040_486f`); the remake keeps one replay per star.

### Interface not done

- **Send Message** (SENDMESSAGEDLGPROC): 2.0's messages are built from "I like", "I don't
  like" or "I own" and a planet or a player, ten a turn; an "I own" message about a star
  the sender owns marks it as the sender's on the receiver's map (`FUN_1040_0038`
  @1040:062f-0668). The remake's messages are free text with no effect.
- **Fix Spending** (`FUN_1010_1ce7`, `1f55`, `1f6b`): cuts each colony's share to what it
  can use, or raises a losing colony to its least share out of Savings.
- **Naming a star after a win** (NAMESTARDLGPROC) and the humans' names added to the
  computer names (`FUN_1040_4028`): 2.0 keeps them in a names file for later galaxies
  (`FUN_1030_1049` draws star names from it too). The remake keeps no such file.
- The Explored Planets list (LISTSTARSDLGPROC) and the poll and battle speed settings.

### Found in the 1.2 pass, for 2.0 (now done)

- **The computers' shares over $2,000,000.** 2.0's `FUN_1020_35f9` gives a slot whose
  money is over $2,000,000 ⌈money ÷ trunc(total ÷ 1,000)⌉ per mille (@1020:3709-3774, the
  compare at @1020:3721-372c), as 1.2's `ResolveSpending` does. The 2.0 ruleset now sets
  `rs.aiBigShares` (done at the start of the 3.0.1 pass; only the money of players over
  $2,000,000 changes in 2.0's test games).
- **The computers' colony bars in 32 bits.** `FUN_1020_35f9` multiplies the part's money
  by 1,000 in 32 bits (@1020:38da, 3930, 3974) and keeps the quotient as a word
  (@1020:38fc, 3952, 3996), so they wrap as 1.2's do; the 2.0 ruleset now does the same.

## Mac 3.0.1 (1993)

All 648 routines of the program have been read (`docs/coverage-301.md`; none unread), and
every rule question that came up was answered from 3.0.1's own code, with its address in
`docs/301-findings.md`. No rule falls back on 2.0, 1.2 or a later version; where the
ruleset uses 2.0's or 4.0.5's code, the 3.0.1 routine was read and does the same. The
two entries noted here before were re-checked in the code and are below ("Settled, worth
confirming" 1 and 2). There are no open questions; what is left:

### Settled, worth confirming

These are what 3.0.1's code does and what the remake now does; they look like slips.

1. **The computers skip their first turn on Spiral and Cluster maps.** In 2010
   `DoComputerTurn` does nothing while galaxy +0x10 is set (@9002a-9003a); `CreateGalaxy`
   sets it for those two styles so the map is laid out in 2010, and nothing clears it
   before the computers' turn.
2. **A slip with no effect in ScrapOldShips**: it passes the fleet's number in the list
   as its Range to the route finder (@94f70); the colony it sends the fleet to is always
   within its fuel, so the Range is never used (2.0 has the same slip).
3. **Stranded fighters always ask for a colony.** `RefuelFighters @9508a` looks for a
   colony within a fighter fleet's fuel, but tests the answer through a flag cleared just
   before (@951b4-951c6), so a colony in reach never stops the request.
4. **Turning Abandon off doesn't give the share back.** Both ways, `DoGalaxyMenu`
   calls `GiveBarPercent(slot, 0)` (@f40e6), so a colony un-marked keeps a share of 0
   until the player raises it.
5. **An abandoned colony with a colony ship there is colonized again at once.** Giving
   the colony up loads the colony ships at the star (`DecolonizeStar @a5ac0`), and
   `ColonizeAndExplore` then settles them there in the same turn ("You have abandoned
   %s." followed by "You have colonized %s.").
6. **Organize Ships gives every fleet the most fuel used** of the fleets of that design
   at the star (`OrganizeFleets @133d14`); 1.2 gave the least, 2.0 the average. A fleet
   whose count changed is unloaded unless every fleet there was loaded.
7. **The computers' colony bars in 32 bits**: `ResolveSpending @93abc` works out each
   part's money × 1,000 in 32 bits and keeps the result as a word, so a colony given more
   than $2,147,483 for one part gets a wrong bar (as in 1.2 and 2.0).
8. **Ship power noted and never read**: `NoteShipPowers @a6410` writes each star's ship
   power into the galaxy record every turn; nothing reads it.
9. **Report texts with no sender**: volcanoes, revolts, metal disappearing and the
   "computer bug" (STR# 1000.14, .17, .72, .77) have text but no code sends them.

### Remake's choices

1. **Random numbers.** 3.0.1 draws from the C library's `rand()` through `RND @11ea2`;
   the remake has its own random numbers, so a game can't be replayed move for move.
2. **Every human out.** 3.0.1 goes on as long as the computers play (`CheckForWinner
   @a731a`); the remake ends the game when every human is out.
3. **Several humans.** 3.0.1 lets humans join the game file, each with a name and
   password (`RegisterOrCreatePlayer @121c20`), and plays each turn when everyone has
   ended theirs, also across a network (`PollNextTurn`, `CheckTurnDone`). The remake's
   hot seat passes one computer round instead.
4. **When the computers plan.** 3.0.1 plans for each computer at the start of its own
   pass 1, after the players before it have paid, scrapped and moved (`EndTurn @a0004`);
   the remake plans for every computer before anyone's money. A computer plans from its
   own records of the stars, the battle estimates, last turn's reports and the Compare
   Players money row (written in pass 2), which another player's pass 1 doesn't change,
   so the plans come out the same but for rare cases (a colony another player gives up
   in the same pass, a fleet that has just left).
5. **Scrapping a fleet or a design.** 3.0.1 marks it and scraps it at the start of the
   money at End Turn (marking a ship built this turn undoes its purchase:
   `ScrapCurrentFleet`, `BuildDesignShips`); the remake scraps a human's fleet or design
   at once (where the metal goes is 3.0.1's), and has its own Unbuild for this turn's
   purchases. The computers' scrapping is 3.0.1's.
6. **Dragging a budget bar.** 3.0.1 redistributes at every step of the drag, from where
   the last step left the shares (`DoHBarClick @d18a0`); the remake once, from the shares
   as the drag began, so a long drag can end slightly differently.
7. **Spiral and Cluster maps** are laid out at the start (3.0.1: in 2010, once every
   player has joined); the computers' 2010 skip is kept.
8. **Dip Into Savings** takes an amount in 3.0.1 (`DipIntoSavings @f41cc`); the remake's
   window gives a percentage of the most that may be dipped.
9. **Abandon.** The remake's Evacuate button is 3.0.1's Abandon toggle; its
   confirmation is the remake's own (3.0.1 asks only for a profitable or nearly
   profitable colony, with two jokes for "Hope" and "Ship"), and the colony isn't
   shown as marked.

### Interface not done

- **Fix Spending** (`FixSpendingBars @d28ca`, `FixNextSpendingBar @d2552`).
- **The Hall of Fame and Hall of Shame** (`AddToHall @144796`, `doHallOfFameDlg`); the
  difficulty rating it records is worked out.
- **Naming a star after a win** (`NameAStar`).
- **The auto play settings** (`DoConfigAutoPlayDialog @144226`).
- **The canned-message window** (`SendMessage @140fa2`): the remake's messages are free
  text, of which the computers read "I like …" and "I like planets that are …".
- **The auto-scrap preference** (old designs past 15, `ScrapFleetsAndTypes`, prefs +0x74).
- **The colour-monitor joke** (`AddEasterEggs @b0004`, STR# 1000.96).

## Windows 95 4.0.5 (1996)

To be done in turn. Already noted: the novas option bit (galaxy +0x16 bit 2) is never
set by the New Game code (`FUN_00409170` sets bit 1 from the Alliances box and bits 4
and 8 from the preferences; the rest of the word is left from an uninitialised stack
buffer in `FUN_00484788`); the design window's limits (`FUN_0044e51a`: Range 4 to
tech, Scout tech + 2, no exception for Biologicals); scrapping idle fleets for a colony
ship's metal (`FUN_00462600`); how gifts are weighed (`FUN_004648d2` cases 0x44a and
0x44b); dreadnoughts open to humans from the start (`FUN_0044eb83`).

## Mac 5.0.5 (2003)

A full pass comes later. Open from the work on the computer players (each says which
way the game goes now):

1. Open: the order of colonies won in the same turn. Now: 4.0.5's star order.
2. Open: the reading of colony +2 = −1. Now: taken from 4.0.5.
3. Open: late arrivals. Now: fought as two battles.
4. Open: the per-design stance byte.
5. Open: group order and targeting in `FUN_1007eed0`. Now: not ported.
6. Open: who reads the big-battle flag.
7. Open: the star's owner after a lost battle (`FUN_10081230`).
8. Open: the Auto-button preferences.
9. Open: surrender when there is nobody to surrender to.
10. Open (read in the code, but surprising; please confirm): a tanker's route goes only
    through stars recorded this year.

## Palm 5 (2003)

To be done in turn. Already noted: when every side at a star is beaten, the battle's
debris is lost (`FUN_00021960` pays it only to a side left standing); the ruleset puts
it on the planet.
