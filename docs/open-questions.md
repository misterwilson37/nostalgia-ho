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
4. **Dragging a budget bar.** 1.2 redistributes at every step of the drag, from where
   the last step left the shares (`DoHBarClick @c1002` calls `DetermineNewLevels @c1470`
   at @c1324 for each mouse move); the remake once, from the shares as the drag began
   (`rs.dragShare`), so a long drag can end slightly differently. The rule itself (floor 0,
   ceiling 1,000, @c1212-c121a) is 1.2's.
5. **How long replays are kept.** 1.2 keeps each duel's replay ('bTTl') until
   `ExpungeOldBattles` deletes it after 500 years; the remake keeps the last 60 replays
   (`engine.js` `endTurn`, shared by every ruleset).

Now done (were remake's choices): no sound for battle reports and `won` for auto play
(`PlayAnnounceSound @130f08`); one replay per duel with each duel's reports pointing at it
(`DoBattleStage @d0004`, AddResource @d0738, `MakeResultMessages` @d0768); the blank
meteor report shows your own planet (`GetIconID @130db0`, default case); the budget bars
drag by `DoHBarClick`'s rule (`rs.dragShare`); and there is no Evacuate button at all,
even with modern conveniences (`DecolonizeStar @a3fd4` is called only by the turn).
Item 2 stays because following it needs the skin to go on with no human in the game
(the hot seat has no one to hand the turn to); items 1 and 3 stay at the user's request.

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
   Nor is there a command to give up a colony: `DecolonizeStar @a3fd4` is called only by
   `KillUnsupportedStars`, `ReactToSupernova` (never run) and `ComputeIncomeAndPopulation`,
   so the remake shows no Evacuate button.
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
   report formatter reads a player number from the report record's first spare word
   (`FUN_10c0_0784` @10c0:09b9) and prints the name at game header +0x16 + 16 × number.
   A player's reports are kept in a list of at most 50 records that is never cleared;
   when a report arrives with 50 there, records 10–49 move down to 0–39 and the new one
   goes into record 40, whose bytes are left from before (`FUN_10c0_0e20` @10c0:0e31-0e5e;
   the record is allocated zeroed, `FUN_10c8_04f9`, and starts with the two credits). So
   the k-th report a player gets goes into a fresh record while k ≤ 48 (number 0: player
   0's name), and after that into the record that report k − 10 used. The name is
   therefore that of the first spare word of the player's report ten back, or twenty back
   if that one wrote none, and so on: the attacker for 1009 and 1035, your ships lost for
   1033 and 1034 (so a player number by accident), the gravity × 100 for 1031, and the
   first two letters of a fleet's label or a design's name for 1016, 1017, 1019 and
   1023-1025 ("one …" or "3 …"). Numbers 20 and up point at other header bytes, or past
   the 1,562-byte header, where 2.0 itself would stop with a General Protection Fault.
   The remake keeps the same list (`rules-dos.js` `log20`) and prints the same name, or
   no name for numbers 20 and up. (1.2 prints a blank line here.)
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
7. **No command to give up a colony**: `FUN_1040_38c0` is called only by `FUN_1040_0925`
   (@1040:0ab5, a colony its share can't keep) and `FUN_1040_27ee` (@1040:29fa), so the
   remake shows no Evacuate button.

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
4. **Dragging a budget bar.** 2.0 redistributes at every step of the drag, from where
   the last step left the shares (`FUN_1010_155c` calls `FUN_1010_179a` for each mouse
   move); the remake once, from the shares as the drag began (`rs.dragShare`), so a long
   drag can end slightly differently. The rule itself is 2.0's: the drag sets every slot's
   least share to 0 and most to 1,000 (`FUN_1010_1303`), so unlike a new colony's share it
   does not keep losing colonies at their least share.
5. **How long replays are kept.** 2.0 deletes replays over 500 years old
   (`FUN_1040_486f`); the remake keeps the last 60 (`engine.js` `endTurn`, shared by every
   ruleset).

Now done (were remake's choices): no sound for reports 1033-1035 and 2001 for 1009
(`FUN_10c0_0c50`, jump table @10c0:0cc6), with `won` for auto play; one replay per duel
(`FUN_1018_0032` @1018:0720, `FUN_1050_2bf3`) with each duel's reports pointing at it; the
budget bars drag by 2.0's rule (`rs.dragShare`); no Evacuate button at all; and the meteor
report's stale name ("Settled, worth confirming" 1). Item 2 stays because following it
needs the skin to go on with no human in the game; items 1 and 3 stay at the user's request.

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
5. **Scrapping a fleet or a design** is by marks, as in 3.0.1 (`ScrapCurrentFleet
   @133a24`, `BuildDesignShips @13146a`; see "Scrapping by marks" in
   docs/301-findings.md). Left to the remake: the fleet row's button (3.0.1 has only the
   menu item), the type's button also in the remake's Scrap ship types window, a
   marked type's row dimmed (3.0.1 changes only the button's title), and the Build
   window giving back the ships bought in it when a type is marked, as the remake buys
   at once where 3.0.1 buys on OK. The remake also has its own Unbuild (−) for this
   turn's purchases.
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

All 8,703 routines of the program are accounted for (`docs/coverage-405.md`; none
unread), and every rule question that came up was answered from 4.0.5's own code, with
its address in `docs/405-findings.md`. The entries noted here before were re-checked:
the design window's limits, scrapping idle fleets for a colony ship's metal, how gifts
are weighed and Dreadnoughts open to humans are settled in the code and done (findings);
the novas option is below. Where the ruleset uses 3.0.1's code (Organize Ships, the
arrival messages), the 4.0.5 routine was read and does the same.

### Open

1. **Does a star ever turn red?** `FUN_00436c26` starts a red star only with option bit
   2 (galaxy +0x16). `FUN_00409170` builds the option word from the Alliances box (bit
   1) and the preferences (Luck bit 4, auto end bit 8); the rest of the word comes from a
   stack buffer in `FUN_00484788` that is never cleared, so bit 2 is whatever was in
   memory. Now: novas on (as 3.0.1, where the bit is always set). Armageddon doesn't
   depend on it.
2. **A Radical level with an empty hand.** Before the first deal (2010) a Radical level
   draws rand(0, 16) but the switch then reads the loop counter, not the draw
   (`FUN_0043a08c`). Now: the draw is used.
3. **A hand that runs out on a design card.** When the decoy, biological or free-design
   card can't be played (too many designs) and no card is left, `FUN_0043a08c` loops for
   ever. Now: the discovery is lost.

### Settled, worth confirming

These are what 4.0.5's code does and what the remake now does; they look like slips.

1. **The poorest player can be one who is out.** `FUN_00463030` takes the poorest and
   richest by Total Money over every player, and an out player's is 0, so a computer is
   seldom "far the poorest" and the richest's alliance penalty still works.
2. **Surrendering to someone who surrendered to you** is ruled out only after the choice
   is made (`FUN_004648d2` notes it after `FUN_00463030` has used it).
3. **30 designs.** With 30 designs `FUN_004639ba` stops, and the classes not yet looked
   at keep the design numbers chosen on an earlier turn (global `DAT_005b2dc0`), which
   may now be other designs or none; a Biological design reads past that table.
4. **ScrapOldShips** passes the fleet's number in the list as its Range (as 3.0.1; no
   effect), and a Biological fleet is retired at the Scouts' redesign mark (it reads past
   the retire table).
5. **RefuelFighters** looks for a colony within the fuel left with the class as the
   mode and ignores the answer (`FUN_004644c5`).
6. **FindCloseEnoughColony's mode 4** answers your oldest colony when only a Colony Ship
   could get there (`FUN_0045f92b`).
7. **A colony at star 0** can always have its budget bar dragged (`FUN_0045c02c` tests
   the star number, not the slot kind) and is left out of the population milestones
   (`FUN_0043b243` counts star numbers above 0).
8. **Best buddies' battle news is never shared**: the second branch of `FUN_0043853c`
   asks for a battle this year that is also before this year.
9. **The auto play settings** put the old colonies-defended value into metal for defence
   (`FUN_00404c4e`).
10. **After Armageddon fizzles** every player hears each device "was just turned off"
    and next step "turned on" again (`FUN_00436988` clears the mask, the switches stay).
11. **The Valdez** message says the citizens sue for twice your net worth; nothing is
    taken (`FUN_00437ddd`).
12. **A rank past 1,000,000 master points** shows "%s: %s" (string 334) instead of a rank
    name (`FUN_00482b89`).
13. **Marking a ship type in the Ship Types window** gives back only one of the ships of
    it ordered in the window (`FUN_0044fd03`; the remake's window too, through
    `rs.scrapTypeRefundOne`); the others are bought and then scrapped with the type. The
    window's running money and metal are credited as if all its orders came back, plus
    the prototype price (twice when none is built); the remake buys at once and keeps no
    running total, so that part has nothing to act on.
14. **Buying at a colony** is allowed while its people (units) exceed the ships built
    there this turn; for a human the count goes up before the money check
    (`FUN_004691c4`), for a computer only when bought (`FUN_00462105`).
15. **Ship power noted and never read** (`FUN_0043b08a`), as 3.0.1.
16. **The Hall of Fame's dates** print `tm_year`, the years since 1900: a game won in
    2026 reads "10/6/126" (`FUN_0049883d`, `FUN_00498b6a`).
17. **The Hall of Shame's summary** labels the player "Loser", without the colon of
    "Winner:" (`FUN_0046d1e8`).
18. **The Master Point List's picture** for 50,000 to 499,999 points is bitmap 0x7c, which
    SPACEHO.EXE doesn't have: nothing is drawn (`FUN_00482b89`).
19. **The cheating mark** (a player record whose checksum fails at End Turn, "%s is
    cheating.") is set for the player at this computer, not the one whose record failed
    (`FUN_004320f8`); a marked player's win is rated -1 and earns no master points. The
    remake has no such checksum, so nobody is marked.

### Remake's choices

1. **Random numbers** are the remake's own (4.0.5: `FUN_0042a5c0`).
2. **When the computers plan and fleets move.** 4.0.5 plans and moves for each player in
   its own pass 1; the remake plans for every computer first and moves every fleet after
   pass 1. Only what a computer sees of the players before it in the same step differs.
3. **Scrapping** is 4.0.5's: Scrap Current Fleet and the Ship Types window's Scrap All
   toggle a mark carried out at End Turn, and a fleet bought this turn is un-bought
   (`FUN_00419a52`, `FUN_0044fd03`); the menu item reads "Scrap Current Fleet" either
   way, as 4.0.5's. Its alerts (string 518 for a marked fleet given orders) are the
   remake's short notes, not boxes to click.
4. **Dragging a budget bar** redistributes once, from where the drag began.
5. **Dip Into Savings** takes a percentage of the most (4.0.5: an amount).
6. **Abandon** is the Evacuate button; its confirmation is the remake's own.
7. **Several humans** play hot seat (4.0.5 also by network and by game file).
8. **Alliances during a step** are read as they stand; 4.0.5 reads the copy made in
   pass 1.
9. **The Hall of Fame, Hall of Shame and Master Point List** are kept in the browser
   (localStorage "ho5.hall.405") instead of `haloffam.ho`, and their menu items are in
   the Game menu (4.0.5: Options, which also held Auto Play and Preferences). With
   several humans on one computer each is recorded, as each would have been on their
   own computer. The summary's picture box (static 1194) is left empty: the summary
   never gives it a picture.

### Interface not done

- **The radical hand window** (`FUN_00471587`): shown with the 2010 report, it lists the
  four projects (strings 821-837) with a timer and lets the player throw one out.
- **Naming a star after a win** (dialog 378, `FUN_00456047`) and the "You have conquered
  the galaxy!" window with its picture (dialog 377, `FUN_0044bf5a`).
- **The auto play settings** (`FUN_00404c4e`).
- **The canned-message window** (codes 0x40e-0x42b): "Look at %s" explores a star for the
  receiver, "I own %s" marks it, "I like planets ..." gives your home; the remake's
  messages are free text, of which the computers read "I like ..." and "I like planets
  that are ...".
- **The turn time limit** and the computer playing a human who runs out of time
  (`FUN_0047f76e`); the date jokes (`FUN_00438f47`); network play.

## Mac 5.0.5 (2003)

All 5,388 routines of the program are accounted for (`docs/coverage-505.md`; none
unread), and every rule question that came up was answered from 5.0.5's own code, with
its address in `docs/original-findings.md`. No fallback to 4.0.5 was needed: where the
ruleset uses 4.0.5's code (the budget-bar routines GiveBarPercent, DetermineNewLevels,
RestoreStarsBars and SetPlanetDisplayValues, and the computers' ResolveSpending), the
5.0.5 routine was read and is the same line for line (`docs/evolution.md`).

The ten entries noted here before are settled in the code:

1. The order of colonies won in the same turn: a new colony goes in front of the colony
   list (`FUN_10078e80`), and the list is sorted by income, lowest first, at the end of
   every turn (`FUN_1007a5e0`). Done.
2. Colony +2 = −1 is "terraforming finished" (set by `FUN_10073d70` when the planet
   reaches your temperature, and by `FUN_10078990`); the computers' terraforming wish
   (`FUN_10082690`) skips such colonies and makes no other test. Done.
3. Late arrivals: two battles at a star, the first without the ships that arrived late,
   each with its own record, replay, aftermath and reports (`FUN_1007e870`). Done.
4. The stance byte (fleet +0x58 + design): bit 1 arrive late, 2 defensive, 4
   offensive; the computers' Tankers bought into an attack fleet get 3 (`FUN_10084860`
   @10084a1c, @10084b30). Done.
5. Group order and targeting (`FUN_1007eed0`, `FUN_1007f560`, `FUN_1007f430`): the
   viewer's side, its allies, the colony's owner, the rest; designs in reverse order.
   Done.
6. The big-battle flag is read by `FUN_10078840` (pass 2b: "There was a big battle at
   %s"). Done.
7. The star's owner in the loser's record after a battle (`FUN_10081230`). Done.
8. The Auto button (`FUN_10066bb0`) sets aggressiveness to a tenth of the Preferences'
   Friendly-Aggressive slider and colonies defended to the Dig In-No Defense slider
   (both 0-100, `FUN_1005ec40`), then plans with the computer's routine. The settings
   are below under "Interface not done".
9. Surrendering with nobody liked: `FUN_10088160` answers the player count, which
   `FUN_100742b0` reads as "to no one". Done.
10. A Tanker's route goes only through stars whose record is of this year: below.

### Open

None: the code settles every rule question met.

### Settled, worth confirming

These are what 5.0.5's code does and what the remake now does; they look like slips.

1. **Global warming never happens.** `FUN_100737b0` @10073870 compares the interest
   still owed (below 0) with what Ship Savings may still lend (0 or more), so the
   shortfall always goes on Ship Savings, past the borrowing limit; "Global warming is
   taking place!" and the fleet scrapped for a lack of funds (0x46b, 0x46c) are never
   sent. 4.0.5 (`FUN_0043361b`) compared the owed amount the right way round.
2. **Budget shares are used as they stand.** Each slot's money is its per-mille share of
   this turn's money, not scaled to the shares' total (`FUN_10073d70`, `FUN_10074f90`,
   `FUN_10077200`). The total can be over 1,000: Abundant starts at 1,050 (Savings 650,
   Technology 250, home 100, second colony 50; `FUN_1006f640`), and dragging a bar with
   others locked leaves the locked ones as they were (`FUN_1008a7a0`). The money is then
   spent more than once.
3. **Dipping raises the borrowing limit.** The dip counts in the gross income
   (`FUN_10077200`), and the limit is −5 times the gross.
4. **A Tanker's route** goes only through stars whose record is of this year
   (`FUN_1007d260`); the computers plan after the year has moved on, so in practice only
   the Diabolical first-turn look.
5. **After Armageddon fizzles**, the devices stay on (they are turned off only after one
   fired, `FUN_10076d20` @10076d4c), so it tries again, and fizzles again, every turn.
6. **A failed purchase still uses up a building slot**: `FUN_1007e4a0` counts the ship
   at the colony (+0x10) before it checks the money and metal (as 4.0.5's
   `FUN_004691c4`).
7. **Population milestones are chained** (`FUN_1007a3f0`): a player hears of one of the
   first two marks and one of the last three a turn, so a jump past two marks reports
   the higher one on a later turn.
8. **On a Spiral map**, before 2100, each computer explores the stars numbered 0 to
   (players − 1), which are the players' homes (`FUN_10077aa0` @10077fc8).
9. **Warnings every turn**: "you are terraforming %s, a planet that will never become
   profitable" (0x3f7), "You are not spending any money on technology research" (0x437)
   and the red-star warning (0x43a, to every player) repeat every turn.
10. **The computers' evacuations** set the colony's mark directly (`FUN_10081fe0`),
    without the question or the change to the net that the Evacuate command makes.
11. **Buying a ship lowers this turn's interest**: the interest is worked out again on
    what is left in Ship Savings (`FUN_1007e4a0`, `FUN_10062c10`); the computers'
    purchases leave it alone (`FUN_100852d0`).
12. **"%s is cheating"** (0x41d) comes from a checksum of the player record
    (`FUN_1007b410`) compared at the start of a turn: anti-cheat, not a rule, and not in
    the remake.

### Remake's choices

1. **Random numbers** are the remake's own (5.0.5: a table of 5,000, `FUN_10054ce0`).
2. **When the computers plan and fleets move.** 5.0.5 plans and moves for each player in
   its own pass 1 (`FUN_10075b80`); the remake plans for every computer first and moves
   every fleet after pass 1.
3. **Dragging a budget bar** redistributes once, from where the drag began
   (`FUN_1008a7a0` does it at every step of the drag).
4. **A failed purchase** doesn't use up a building slot in the remake (item 6 above):
   the remake stops at the first ship it can't pay for.
5. **Gifts**: the sender's "You just gave ..." comes at once; 5.0.5 sends it at the end
   of the turn with the receiver's (pass 2b, 0x44e/0x44f).
6. **Master points**: the cap on what one win adds is worked out at the win from your
   points then; 5.0.5 notes it when you join the game (`FUN_10063a40`). With one human
   it is the same.
7. **Several humans** play hot seat (5.0.5 also by network and by game file).

### Interface not done

- **The auto play settings** (Preferences, `FUN_1005ec40`; used by the Auto button,
  `FUN_10066bb0`): a human on auto play keeps the auto play personality's own
  aggressiveness and colonies defended.
- **The canned-message window** (`FUN_1005d940`, codes 0x416-0x42c): "Look at %s"
  explores a star for the receiver (`FUN_10078c80`), "I own %s" marks it in the
  receiver's records, "I like planets ..." gives your home; messages to everyone, your
  allies or your best buddies. The remake's messages are free text.
- **Options locked by rank** ("Need more MPs", `FUN_10059570`); left open on purpose.
- **The questions before buying more than 9 Scouts or Tankers** (alerts 0x24, 0x25,
  `FUN_1005cf40`).
- **The first turn's budget kept for the next game** (`FUN_10064600`, `FUN_1006579c`).
- **The turn time limit** (`FUN_10058360`, `FUN_10066260`), network play and the lobby.

## Palm 5 (2003)

All 1,041 routines of the program are accounted for (`docs/coverage-palm.md`; none
unread), and every rule question was answered from the Palm program's own code, with
its address in `docs/palm-findings.md`. The Palm End Turn and computers are 5.0.5's,
recompiled (each routine read beside its 5.0.5 twin; the same random draws in all 74
pairs checked), so the ruleset uses the 5.0.5 rules and computers wherever the Palm code
does the same, and its own code where it doesn't. No fallback to 5.0.5 was needed.

The questions noted here or in `docs/palm-findings.md` before are settled in the code:

1. When every side at a star is beaten, the battle's debris is lost (`FUN_00021960`
   pays it only to a side left standing). Done (the ruleset used to put it on the
   planet).
2. DeterminePath's ninth argument, the cap on the hops, is 7 from every caller (for
   example `PEA 7` at 0x6357e before the call). Done.
3. A fleet with a Tanker routes through stars whose record is of this year
   (`FUN_0004c22c`), as 5.0.5. Done.
4. The computers note another player's planet preference when "I like planets that
   are ..." is delivered (`FUN_000500d4`, pass 2b, code 0x41a) and when they become
   best buddies (`FUN_00053d74`). Done.
5. The order of colonies won in the same turn: a new colony goes in front, the list is
   sorted by income each turn (`FUN_00056d34`, `FUN_000583aa`). Done.
6. The number of human winners for the difficulty rating is counted by `FUN_000322da`
   (game +0x1a6); the remake passes what its interface knows (one human unless told).

### Open

None: the code settles every rule question met.

### Settled, worth confirming

These are what the Palm code does and what the remake now does; they look like slips.

1. **Two Evacuate commands, two sets of jokes.** The Galaxy menu's Evacuate Planet
   (`FUN_0003734e`) always answers a star named Kansas with "Dorothy, I guess that means
   we're not in Kansas anymore", always asks for Hope, and asks "Abandon Ship? ..." for a
   star named Ship; the Message History's Evacuate button (`FUN_00040232`) keeps 5.0.5's
   one time in three for Kansas and Hope and has no Ship. The remake has the menu's.
2. **The debris of a battle nobody wins is lost** (item 1 above), as in 5.0.5.
3. **An Abundant start**: the second colony takes the third slot of the colony list and
   the home the fourth, both at 50 per mille (`FUN_00026304`; 5.0.5 `FUN_1006f640` the
   same), so the colonies losing money are paid second colony first on the first turn.
   The creator's own shares come from the preferences (`FUN_000395a6`): 550 / 200 / 150
   / 100 by slot, so the second colony gets 150 and the home 100.
4. **Report 0x475** ("%s has just taken over for the computer player %s.", tSTL
   6020.142) is never sent.
5. **The hints** are drawn by the handheld's SysRandom, not the game's table, from 4 to
   43 (the demo from 4 to 52, past the 51 strings).
6. **5.0.5's slips, kept**: global warming never happens (`FUN_00050ed4`), shares are
   used as they stand, dipping raises the borrowing limit, a failed purchase uses up a
   building place (`FUN_0004d9d6`), a fizzled Armageddon tries again every turn,
   milestones are chained, the Spiral look before 2100 (`FUN_00055844`), the warnings
   every turn, computers' evacuations by mark, buying lowers this turn's interest. The
   same as `docs/open-questions.md` (Mac 5.0.5), at the Palm addresses in
   `docs/coverage-palm.md`.
7. **"%s is cheating"** (0x41d) from a checksum of the player record (`FUN_00058cf6`):
   anti-cheat, not a rule, not in the remake.

### Remake's choices

1. **Random numbers** are the remake's own (Palm: resource `RAND 1000`, `FUN_00029abc`).
   The Palm novas draw rand(1, 11) before rand(1, 9) (5.0.5 the other way); with the
   remake's numbers this changes nothing.
2. **When the computers plan and fleets move**: for every player at once, as for 5.0.5.
3. **Dragging a budget bar** works it out once, from where the drag began
   (`FUN_00049496` does it at every pen move).
4. **A failed purchase** doesn't use up a building place.
5. **Gifts**: the sender hears at once (Palm: in pass 2b, 0x44e/0x44f).
6. **Master points**: the cap is worked out at the win (Palm notes it at the new game,
   `FUN_000395a6`); the same with one human.
7. **Several humans** play hot seat with the remake's own cover screen (Palm: the
   Players window, tFRM 1300).
8. **Every game starts from the default shares**: the Palm game keeps your first turn's
   research and budget shares as the next game's (`FUN_0002d91c`).
9. **Sounds**: the skin's own (Palm: a handful of system sounds, `FUN_0002c17e`).

### Interface not done

- **The Radical Research window** (tFRM 3000, `FUN_00041aa4`, `FUN_00075dba`-
  `FUN_00075ff0`): with a full hand, tapping the "hard at work on another discovery"
  report or the Radical bar lets you cancel one program. (5.0.5 has it too,
  `FUN_1005f280`.)
- **The auto play settings** (tFRM 1700, `FUN_000713be`): Friendly and Dig In sliders,
  "Just End My Turns" or "Have Computer Play For Me", turn off when something interesting
  happens.
- **Build Ships' Allow Debt box** (`FUN_0004435a`) and the questions before building more
  than 9 Scouts or Tankers (`FUN_00043754`, tSTL 6004.36-37).
- **The research bars** dragged per mille like the budget bars (`FUN_00049496`), and
  tapping the Savings bar while dipping to open Dip Into Savings.
- **The Message History's Evacuate button** (`FUN_00040232`).
- **Naming a star at a new rank** (tFRM 2900) for later galaxies (`FUN_000692c4` puts up to
  five of them in).
- **The canned-message window** (tFRM 2600: Thank You, Sorry, the curse); the remake's
  messages are free text.
- **Options locked by rank** (`FUN_0003825a`), left open on purpose.
- **The Palm report texts** where they differ from 5.0.5's (the decoy discovery: "Your
  ship technicians have designed a decoy ship. It's really weak, but it looks menacing
  and can help keep your allies in line!"; the miracle: "Your scientist have figured out
  how to prevent %s ..."; money without "$"); the remake shows 5.0.5's.
- **The demo** (three computers, a small galaxy, capped technology, report 0x474) and
  registration: nothing to register.
