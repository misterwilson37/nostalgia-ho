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
2.0. What is left:

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

---

## DOS / Windows 3.1 2.0 (1993)

To be done in turn (2.0's full pass comes next). Already noted from an earlier look at
`WINHO.EXE`, to be settled in that pass:

- Taking the first slot's last ship out of a queue: the Build Ships window's remove
  handler (10e8:17af, @10e8:181a) zeroes the part-payment, as 1.2's does, so it would be
  lost; the ruleset still gives it back.
- Routes are planned again at every stop (`FUN_1040_25ce`, called from `FUN_1040_23ed`
  and `FUN_1040_2fa8`); the ruleset plans them once.
- A design already queued gets new ships in its own slot (10e8:16e4).
- Whether 2.0 has 1.2's `RestoreStarsBars` (a finished part's share passed on); the
  ruleset currently wastes it.
- How many computers the Create Galaxy window allows (its handlers sit behind a jump
  table at 1108:1d57).

## Mac 3.0.1 (1993)

To be done in turn. Already noted: in 2010, on Spiral and Cluster maps, the computers
skip their first turn (`DoComputerTurn @90004` with galaxy +0x10); and `ScrapOldShips
@94e3e` passes the fleet's list number as the Range (harmless: the colony it heads for
is always within the fuel left, so the route is direct).

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
