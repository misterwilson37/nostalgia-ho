# Research log

The full research history: every question met while reading each version, how it was
settled, and the remake's corrections. `docs/open-questions.md` has only what's left for
Delta Tao. What follows is the former `docs/open-questions.md`, kept as it was.

---

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
   3.0.1; 5.0.5 on 4.0.5; Palm and iOS (ports of 5.0) on 5.0.5. A later version is the
   last resort.
3. **Then the developers.** Jake's contact is Joe Williams ("Delta Joe") of
   Delta Tao; Peter Commons, who programmed it, may chime in too.

A fallback only keeps the game playable: the question stays open and stays on this list.

The versions, in order: Mac 1.2 (1992; a pre-release of 2.0), DOS / Windows 3.1 2.0
(1993, with its Mac 2.0.1 edition of 1992), Mac 3.0.1 (1993), Windows 95 4.0.5 (1996,
with its Mac 4.0.5 edition), Mac 5.0.5 (2003), Palm 5 (2003, a port of 5.0) and iOS
1.2.9 (2012, a port of 5.0). An
edition's questions are in its version's section.

## Legend

- **Open**: the code doesn't settle it. The entry says what the code shows, what the
  remake does now and which version that comes from.
- **Remake's choice**: not a rule of the game (or not one a browser game can follow); the
  remake does something of its own. Listed so nothing is hidden.
- **Interface not done**: a window or command of the original the remake doesn't have.
- **Settled, worth confirming**: the code settles it and the remake does it, but it
  looks like a slip; the developers may want to comment.

---

## The bars and the battle window, every version (October 2026)

Joe Williams ("Delta Joe") of Delta Tao, trying the remake, noted three things: "the bar charts aren't log scale",
"[the bars] don't lock at zero when mined and terraformed", and "battles don't show ship
info". Each was settled from each version's code, newest first (each version's findings
file, "Bars and battles"), and built as a rule of the ruleset, drawn by every skin:
`rs.barScale` (engine `BAR_SCALES`, `barScale`), `rs.barLocked` and `rs.battlePanel`
(engine `makeBattlePanel`).

| Version | The bars' scale | Locked at zero | Ships in the battle window |
|---|---|---|---|
| iOS 1.2.9 | log, budget and technology (the only scale) | evacuating, finished, Savings while dipping | yes: groups, (W/S), luck |
| Mac 5.0.5 | log, budget and technology (the only scale) | the same; a beep, or Dip Into Savings | yes: piles, names, luck |
| Palm 5 | log (the only scale) | the same | yes: one picture, "+name" for luck |
| Windows / Mac 4.0.5 | log by default (INI `useLogScale`, setup +0x3c: no switch in the game); technology always log | abandoning, finished at star ≥ 1 (the `star0` slip) | yes: "Summary of battle", (W/S), "N dead" |
| Mac 3.0.1 | log by default; a click above the bars switches; technology always log | the same as 4.0.5 (the same slip) | yes, as 4.0.5 |
| DOS / Mac 2.0.1 | **linear by default**; a click above the bars switches to log; technology always log | none | yes, as 4.0.5 |
| Mac 1.2F | as 2.0 | none | yes, in French |

So the **log scale** goes back to the oldest version read (1.2F), as a switch for the
budget bars and always for the technology bars; it became the budget bars' default in
3.0.1 and their only scale in 5.0. The **lock at zero** first appears in **Mac 3.0.1**;
the two versions before it, **2.0** (DOS and Mac 2.0.1, one step) and **1.2**, have none,
so the search stopped there (it is probably new in 3.0, for the developer to confirm).
The **ships in the battle window** go back to 1.2F as well.

Remake's choices in it:

1. **The scale switch** (1.2 to 3.0.1) is a click on the Budget heading, the strip above
   the bars; the original kept the setting in its setup file, the remake in the browser,
   one for each ruleset ("ho5.barScale.<ruleset>").
2. **The bars' grid**: 5.0.5 and the Palm (`rs.barGrid`) draw it on the budget bars (the Palm: and the technology bars) in the
   classic skin (`FUN_1008aff0`: ten lines at 100 ... 1,000 per mille through the bar's
   scale, so log spacing; each a black tick 3 pixels long at the top, the rest of the line
   drawn in the "transparent" pen mode, a colour and weight from a data table not read, so
   the remake blends black at 28 %, LIKELY; the bars' frame lines are black too). The older
   versions (read October 2026: Mac 1.2 `DrawHBarControl @c091e`, 2.0.1 @c091e, 3.0.1 @d0a7c,
   4.0.5 @50a80; DOS 2.0 `FUN_9000_0cd5`; Windows 3.1 `FUN_1010_0a7a`; Windows 4.0.5
   `FUN_0045aae1`) have no grid through the bars: only ten ticks, 2 pixels high (`Line(0, -2)` /
   MoveTo y+15, LineTo y+13) on the rule under the heading strip, black, at 77k/10 pixels when
   linear or on the log table at 100 ... 1,000 per mille, following the scale switch where
   there is one (1.2, 2.0, 3.0.1: the setup's +0x2a). `rs.barGrid` is `{ n, tick, line, above }`:
   5.0.5 `{ 10, 3, line: true }`; the Palm its own (`FUN_00048e7a`, settled October 2026:
   solid 1-pixel lines from the list's top to its bottom, over the bars, no tick, in the
   app's colour-table entry 3, #666666, on the technology bars too:
   `{ 10, 0, line: true, color: '#666666', tech: true }`); the older ones `{ 10, 2, line: false, above: true }`, drawn on
   the first bar only (the classic skin; the cozy skin clips them). The Mac draws its rule in
   ten LineTo strokes, so each tick's top joins the next tick's foot by a slant; the remake
   draws the ticks alone. The bars are the skin's own width, not 77 pixels, so the
   table is worked out for the bar's fraction (engine `BAR_SCALES.log`), not in 78 steps.
3. **A finger uses the version's own scale** (it used iOS's log scale in every skin):
   linear in 2.0 and 1.2 unless switched, log elsewhere. Rulesets that aren't an original
   version's (Claude, Gemini) have no `rs.barScale` and stay linear.
4. **The battle window**: the groups are laid out two to a row in each column (5.0.5:
   its own, one stack a column, the piles as `FUN_100aceb0` lays them, settled October
   2026, `docs/original-findings.md`, "The piles, laid out"), the
   pictures the skin's; where the version wrote no owner's name on a group (1.2 to 4.0.5;
   iOS, which draws the owner's hat) the remake heads each column with its side's name; the good-luck and bad-luck pictures are 5.0.5's PICT 9017 (a rainbow) and 9018 (a storm), drawn in the classic skin (extracted as `m9017`/`m9018`, 40 x 40, 20 pixels right of the group's picture); iOS draws `report_icon-17`/`-18` (`-[BattleShipNode init]` 0x10009c18c, `reportIcon:17`/`18`; settled October 2026), the Palm has no picture ("+name"/"-name");
   the Mac 1.2 to 4.0.5's damage shading (`DrawOneGroup`: a gray patOr rectangle over the group's cell, whole when the group is gone, else 120 x the next ship's damage / hit points from the left; satellites a third of it, in the middle) is drawn (`shade`), in Windows 4.0.5 too (`FUN_004251cd`, read October 2026: the same rectangle, 120 x damage / hit points, a third and 40 in for a satellite); DOS 2.0 too (`FUN_9000_4f72`: the same rectangle, its fill from a pattern resource, not identified, taken as the Mac's gray); Windows 3.1 is the DOS code, not separately read; the population is the remake's
   people count (the planet panel's). The side drawn on the left in the Mac 1.2 to 4.0.5 is
   the viewing player's (`DoOneBattle` sets the columns' x by `param_1[0] == viewer`;
   a watcher in neither side sees the second side on the left): done (`cols: 'mac'`);
   Windows 4.0.5 is the same (`FUN_00422339`: the first player is the viewer, the first list's x is 25 and the second's 300, else the other way about; `cols: 'mac'`) and DOS 2.0 (`FUN_9000_366d`: `*param_1 == viewer` sets `DAT_5000_3c8e` (the first list at 0x5442) to 25 and `DAT_5000_3c8c` to 300, else the reverse; DOS draws a 32 x 32 owner icon and the owner's name at the head of each column, which the remake's column heading stands for).
5. **The beep** of a locked bar is a short tone the page makes (the originals' system
   beep).

A change to vanilla play: **Mac 3.0.1** now lets a finished colony at star 0 have its
bar dragged, as 3.0.1 does (`DoHBarClick @d18a0` tests the star number); the remake had
locked it. The 3.0.1.1 patch locks it (`star0`, `docs/fixes.md`). No version's lock was
missing from the remake's rules: 5.0.5's, iOS's, the Palm's and 4.0.5's were already
refused there; the bars now show it.

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

- Now done (October 2026): **Fix Spending** (Galaxy menu, "Correction dépenses", ⌘F:
  `FixSpendingBars @c1fb0`, `FixNextSpendingBar @c1b48`, `ComputeMaxPercent @c1fde`,
  `ComputeMinPercent @c224a`; `rs.fixSpending`, the Galaxy menu's "Fix spending"): Mac
  2.0.1's routines instruction for instruction (2.0 below). Its four lines are STR# 1050
  in French; the remake shows Mac 2.0.1's English ones, the same lines in the same order
  ("Vous n'avez pas de problème." is "You have no spending problems."). The original
  put each line in the message bubble and a click on the bubble took the next step; the
  remake shows it in a small window whose Next is that click.
- **A name shorter than 4 letters names no star**, and a name found inside another by
  `Munger` (STR# 2005 and 1003, letter case counting) is taken (`NameAStar @120a04`).
  Done (`rs.nameAStar.min`, `match: 'munger'`). The name never goes on a star of the game
  just won: `MarkStarNamed @1014e8` only marks the game file.
- Now done: **naming a star after a win** (`NameAStar @120a04`, `rs.nameAStar`): clicking
  the winner's report opens Name a Star; the name is kept in this browser (localStorage
  "ho5.stars.12", the program's STR# 2005) and later 1.2 galaxies draw their star names
  from the list and those names, as `GiveStarsValues` does. The window's own
  words are read (DLOG/DITL 4050 and DITL 3340 of the French 1.2F: "Vous venez de gagner,
  alors vous devez donner un nom à une étoile." / "Le nom doit comprendre entre 4 et 7
  lettres." / "Nouveau nom d'étoile:" / "(Si vous ne voulez pas donner un nom à une étoile,
  cliquez juste sur OK)." and the alert "Désolé, il y a déjà une Etoile nommée “^0.”
  Soyons créatifs!") and given in French as they are (`rs.nameAStar` text, rule, label,
  hint, taken).
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
7. **A leg's fuel is spent on arrival** (`MoveShips @a20ee`: the leg's length, fleet
   +0xe, is added to the fuel used, +4, the turn the fleet reaches the star), so a fleet
   in flight shows the fuel it had at the last star. Nothing reads it in flight, so play
   is the same either way; the remake now does it so (`departs`, `docs/fallbacks.md`).
   Settled in October 2026 with the other engine defaults: a new fleet's full tank
   (`NewFleet @110004`) and the computers' names drawn with the game's `RND` @12290
   (`DoGameSolidificationStuff @a49d6`).

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
   never used; 1.2 and Mac 2.0.1 (`OrganizeFleets` @1137e6) give every fleet the least
   fuel used, so the average is the Windows port's own. Was it meant?
3. **Organize Ships clears orders**: every fleet of that design at the star loses its
   destination and route, even one the window left alone (@10e8:2e2c-2e6f). Mac 2.0.1
   keeps them (`OrganizeFleets` @1137e6).
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
8. **A leg's fuel is spent on arrival** (`FUN_1040_23ed`: the leg's length kept by
   `FUN_1068_0a94`, fleet +0xe, is added to the fuel used the turn the fleet arrives; Mac
   2.0.1 `MoveShips` @a20e2 the same). No play changes; the remake now does it so.
   Settled with it in October 2026: a new ship joins an idle fleet of its design by its
   count only, else gets a new fleet with a full tank (`FUN_1040_1a2f`, `FUN_1068_0000`;
   Mac `NewFleet` @110004), and the computers' names and sexes are drawn with the game's
   `RND` (`FUN_1100_0000`).

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
- Now done (October 2026): **Fix Spending** (`FUN_1010_1f55`, `1ce7`, `1f6b`, `218e`;
  Mac `FixSpendingBars @c2018`, `FixNextSpendingBar @c1b48`, `ComputeMaxPercent @c2046`,
  `ComputeMinPercent @c22b2`; `rs.fixSpending`, js/rules-dos.js `fixSpending20`): each
  step goes on from the slot after the last one and stops at the first colony whose
  share is above its most + 1 per mille (cut to that, the rest to Savings: "You were
  overspending at %s. The problem has been fixed.") or under its least (raised from
  Savings: "You were underspending at %s. ..."; with a share of 0 or too little in
  Savings, "You are abandoning %s.", the Mac "You’re abandoning %s."); with none on the
  first step "You have no spending problems.". The most is the colony's loss, plus 2 ×
  the temperature gap² with Terraform on, plus (metal left² + 224) / 225 with Mine on,
  plus each queue slot's count × its price (the prototype's while none was built) less
  what was paid, with Ship on, over the pool, rounded up (1,000 when the need isn't under
  the pool). The lines are in WINHO.EXE's data (0x3f6e4-0x3f776) and Mac 2.0.1's code
  (@c1f6e-c1ff8). The original's message bubble is the remake's small window (Next).
- **Design names for the computers** (`FUN_10e8_0f64`, Mac `AddNewTypeNameToPrefs`): the
  names humans give their designs go into the names file, and the computers' later
  designs draw from it. The remake keeps no names file.
- **The humans' names added to the computer names** (`FUN_1040_4028`): 2.0 keeps them in
  its names file for later galaxies. The remake keeps no such list.
- Now done: **naming a star after a win** (NAMESTARDLGPROC, opened by clicking the
  winner's report, `FUN_10c0_12de`; `rs.nameAStar`): the name is kept in this browser
  (localStorage "ho5.stars.dos", "ho5.stars.mac20"), at most 7 letters, never one there is
  already (string 3340), and later galaxies draw their star names from the 190 and those
  names (`FUN_1030_1049`). Not read: the window's own words (the remake shows 4.0.5's).
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

### The Mac 2.0.1 edition (`mac20`)

Every rule routine of the Mac 2.0.1 program has its Windows namesake and does the same,
but for the rows of `docs/dos-findings.md`, "Mac 2.0.1 differs", which the `mac20` ruleset
(`js/rules-mac20.js`) plays. Nothing in it is open. The entries above apply to it, except
Organize Ships' average and cleared orders (the Mac gives the least fuel used and keeps
the orders, `OrganizeFleets` @1137e6) and the computers' 16-bit attack rating (32 bits on
the Mac, `CalcShipCosts` @114c9a).

**Settled, worth confirming:**

- **The meteor report's stale name** (`GetReportString` @130adc): as on Windows it names
  whoever the reused report record left behind; for a number outside 0-19 the Mac reads
  outside the game's header (no fault on a 68k Mac) and prints whatever bytes are there.
  The remake names no one then, since those bytes aren't known; the 2.0.1.1 patch names
  the meteor shower.

**Remake's choices:** the default sound is the skin's, where the Mac beeped (`PlaySound`
@12636, `SysBeep`).

**Interface not done:** the Windows list above. Now done: **Force End Turn**
(`ForceEndTurn` @122382, box 3210, calling `MarkAllPlayersDone` @101616;
`rs.forceEndTurn`), in the File menu of a game with several players: it asks with box
3210's text (the Windows build's string 3210, the same words; the buttons' words weren't
read: "Wait" and "Force End Turn") and then plays the turn with everyone marked done.

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
10. **Fleet groups that can't be made.** The route and move code can move a group of
    fleets at the slowest speed and shortest Range (group leader fleet +0x1a,
    `ReassignGroupLeader @130342`, `CheckFleetDestination`, `GiveFleetPath @130dc0`), but
    nothing makes a group: the Ships menu (MENU 132) has no group command, and "Group
    Current Fleet" / "Ungroup Current Fleet" (STR# 1010.13-14) and DITL 4060 ("Which
    fleet would you like to group with your ^0?") are never loaded. Unfinished, it seems
    (Delta Tao lists grouped fleets as new in 5.0). The remake had let any fleets be put
    together as such groups; it now lets only fleets of one design be (October 2026).
11. **A leg's fuel is spent on arrival** (`MoveShips @a26ac`, the leg's length kept at
    fleet +0x10 by `GiveFleetPath`), as 1.2 and 2.0. No play changes; the remake now does
    it so. Settled with it: no limit on ships bought at a colony in a turn (`BuildAShip
    @132e04`, `BuildAFleet @92fc2`), a new fleet's full tank (`NewFleet @130004`), and
    the computers' names drawn with the game's `RND` after `srand` with the galaxy's seed
    (`DoGameSolidificationStuff @a741a`).

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

- Now done (October 2026): **Fix Spending** (`FixSpendingBars @d28ca`,
  `FixNextSpendingBar @d2552`, STR# 1050; js/rules-301.js `fixSpending301`): 2.0's steps
  with 3.0.1's most (`ComputeMaxPercent @d28f8`) and only overspending fixed: the
  difference goes to Savings and Technology in proportion to their shares (truncated, so
  a per mille or two can be lost); `ComputeMinPercent` is 0, so lines 3 and 4 never show.
  A colony being abandoned or finished (most 0) is cut to 1 per mille.
- **The Hall of Fame and Hall of Shame** (`AddToHall @144796`, `doHallOfFameDlg`); the
  difficulty rating it records is worked out.
- **The auto play settings** (`DoConfigAutoPlayDialog @144226`): which of the player's
  fields it sets and its scroll bars' ranges weren't recorded in the 3.0.1 pass, so the
  window isn't built for 3.0.1 (4.0.5's would be a later version's guess).
- Now done: **naming a star after a win** (`NameAStar @1424b2`, `rs.nameAStar`): the
  window opens from the winner's report; a name of 2 to 7 letters not found by Munger in
  STR# 2005 or 1003 is added to the Preferences' STR# 2005 ("ho5.stars.301"), and
  `GiveStarsValues @f246c` draws every star's name from the 191 and those names (settled
  October 2026: it reads STR# 2005 too, `use: 'pool'`). The window's words are read
  (DLOG/DITL 4050; the alert is in STR# 4001): "You won the game, so you get to name a
  star." / "Star names must be 2 to 7 characters long." / "New Star Name:" / "(If you’d rather
  not name a star, click “OK” with the name blank.)", and the alert "Sorry, there’s already a
  star named  “^0.” Please pick another name." (`rs.nameAStar` text, rule, label, hint, taken).
- **The canned-message window** (`SendMessage @140fa2`): the remake's messages are free
  text, of which the computers read "I like …" and "I like planets that are …".
- **The auto-scrap preference** (old designs past 15, `ScrapFleetsAndTypes`, prefs +0x74).
- **The colour-monitor joke** (`AddEasterEggs @b0004`, STR# 1000.96).

### To re-check (from Delta Tao's changelog)

1. **Settled: colour came with 2.0, not 3.0.1.** Mac 2.0.1 (January 1992) has its own colour
   pictures file, "TheHo Color Picts", and colour icons in the program, as Delta Tao's manual
   says. The remake's wording ("the first colour Mac version") is corrected.

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
   depend on it. The Mac 4.0.5 is no help: its New Game window (`GetDialogValues`
   @10c8e) adds or takes away bits 1, 4 and 8 only, in the same uncleared 600-byte stack
   buffer (`handleNewGameQueryEvent` @141316), which `HandleNewGameEvent` and
   `CreateGalaxy` copy as they find it.
2. **A Radical level with an empty hand.** Before the first deal (2010) a Radical level
   draws rand(0, 16) but the switch then reads the loop counter, not the draw
   (`FUN_0043a08c`). Now: the draw is used.
3. **A hand that runs out on a design card.** When the decoy, biological or free-design
   card can't be played (too many designs) and no card is left, `FUN_0043a08c` loops for
   ever. Now: the discovery is lost.

(2 and 3: the Mac 4.0.5's `DoSomethingRadical` @d0bba does the same; the names don't
settle what was meant.)

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
8. **Best buddies' battle news** is shared by handing over the buddy's whole record of
   the star (`FUN_0043853c`'s second branch, the Mac's `BestBuddiesExplore`: the
   buddy's record has a battle this year, the player's is older), marked so Review
   Battle says the player didn't fight there. Windows copies the record's pointer, so the
   two players share one record until the game is saved; the Mac and the remake copy
   it. (This was listed as "never shared": the two tests read two different records,
   which the Windows decompile shows through look-alike accessors.)
9. **The auto play settings** put the old colonies-defended value into metal for defence
   (`FUN_00404c4e`; the Mac 4.0.5's `DoConfigAutoPlayDialog` puts the new value).
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
    SPACEHO.EXE doesn't have: nothing is drawn (`FUN_00482b89`). The Mac 4.0.5 draws the
    computer-intelligence faces there (icons 3030-3033), all present.
19. **The cheating mark** (a player record whose checksum fails at End Turn, "%s is
    cheating.") is set for the player at this computer, not the one whose record failed
    (`FUN_004320f8`); a marked player's win is rated -1 and earns no master points. The
    remake has no such checksum, so nobody is marked.
20. **Fleet groups that can't be made**, as in 3.0.1: the group number (fleet +0x1e) is
    read by the routes (`FUN_00435dc3`) but set only to -1 (`FUN_00415db0`) and by
    `FUN_004160d6`; neither edition's Ships menu has a group command ("Group All" is the
    Organize window's button for one design's piles). The remake now lets only fleets of
    one design be put together (October 2026). A leg's fuel is spent on arrival
    (`FUN_004357fc`, the Mac's `MoveShips` @c272e), as 3.0.1; no play changes.

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

- Now done: **the radical hand window** (`FUN_00471587`, Mac `DoRadicalChoiceDlg`;
  `rs.radicalHand`): the "hard at work on another discovery" report has a Radical
  projects… button (the original opened it by clicking the report); it lists the hand in
  strings 821-837, and the one picked leaves the hand. Open: the timer the window was
  noted with, its title and its buttons' words (the remake: "Radical Research", "Cancel
  Project", "OK"), and whether it also lets a hand of fewer than four be thinned.
- Now done: **the "You have conquered the galaxy!" window** (dialog 377, `FUN_0044bf5a`,
  `rs.conquered`) with the won picture, then **Name a Star** (dialog 378, `FUN_00456047`,
  `rs.nameAStar`), opened by clicking the winner's report (and from the end of the
  messages). The name (2 to 7 letters, not one there is already: string 513) is kept
  (localStorage "ho5.stars.405", "ho5.stars.mac405"). Settled October 2026: Windows keeps
  four, a fifth replacing the fourth and going first (`FUN_00456047`: RemoveAt(3),
  InsertAt(0)); the Mac keeps every name (STR# 2000) and its New Game window takes four in
  a row from `aSynchRand(0, kept − 4)` (`doCreateGalaxyDlg @10f5e`); both set-ups give the
  names the first places of the star list and shuffle it, so they land on stars at
  random, and both number them one place late: the first place reads the 191st own name,
  "Hope", and the last kept name is lost (`FUN_00442374`, `GiveStarsValues @81a0a`; the
  patch's `keptStarNames`). Open: dialog 377's title.
- Now done (October 2026): **the hints.** Both 4.0.5s send one every 10-year step with
  the help messages preference on (Windows `FUN_004320f8` @4321f6: report 24 with
  rand(4, 29), strings 781-806; Mac `DoOneTurn` @c0350: aSynchRand(4, 30), STR# 6250
  lines 4-30), and start the reports with hint 0 (1 on the Mac), the credits and hints 1
  and 2 (2 and 3) (`FUN_004427a4`, `CreatePlayer`). The remake had one of 5.0.5's every
  seven turns; now `rs.hintTexts` and `welcome`, with picture 3170 in the w95 and mac4
  skins. As 5.0.5's, the skin draws them with the browser's random numbers.
- Now done: **the auto play settings** (`FUN_00404c4e`, Mac `DoConfigAutoPlayDialog`;
  `rs.autoPlaySettings`): the Auto play window's Config… opens Friendly-Aggressive and Dig
  In-No Defense sliders. Open: the scroll bars' ranges (the remake: aggressiveness 0-10,
  colonies defended 100 % at Dig In to 0 at No Defense) and the human's values before the
  first auto play turn (the remake makes the auto play record when the window opens, as
  the first auto play turn would).
- **The canned-message window** (codes 0x40e-0x42b): "Look at %s" explores a star for the
  receiver, "I own %s" marks it, "I like planets ..." gives your home; the remake's
  messages are free text, of which the computers read "I like ..." and "I like planets
  that are ...".
- **The turn time limit** and the computer playing a human who runs out of time
  (`FUN_0047f76e`); the date jokes (`FUN_00438f47`); network play.

### The Mac 4.0.5 edition (`mac405`)

The Mac 4.0.5 is the Windows program compiled for the Mac; the `mac405` ruleset
(`js/rules-mac405.js`) plays it with the rows of `docs/405-findings.md`, "Mac 4.0.5
differs", and three read for it (`CreatePlayer`'s extra draw, the Ship Types window's
refund, the ranks and dates of the Hall of Fame). The open questions above are the Mac's
too (its code reads the same option word and the same hand), and so are the settled
slips it shares: `poorestOut`, `designs30`, `refuelCheck`, `scrapRange`, `star0`, the
Biological retire mark.

**Open:**

Settled by Jake: **Windows' ten ranks stay.** The Mac has eleven (Deputy and Gunfighter
apart, Ho! Champion from 1,000,000); Windows has ten, "Deputy Gunfighter" as one, so from
10,000 points each Windows rank is the Mac's next one up. It reads as a choice made for
the Windows build, so `405` keeps it, patch or not; the `rankName` fix still names the
rank past 1,000,000, which showed the unfilled "%s: %s".

**Remake's choices:**

- **aSynchRand**: the Mac's second generator is kept in the game (`G.rsA`), seeded once
  from the game's state without drawing from it, so a game plays again from its seed; the
  Mac's ran apart from the game file.
- **The Preferences' name lists**: the Mac adds every human's name to the computers'
  names (`DoGameSolidificationStuff` @d2432) and each name typed in the design window to
  its class's ship names (`AddNewTypeNameToPrefs`); the remake uses the program's own
  lists only.
- **The colour-monitor joke's year** is drawn (`CreatePlayer` @81c9c, the game's random
  numbers) and kept (`p.colorJoke`), but no report is made: a browser always shows
  colour.

**Interface not done:** the New Game window's Luck in Battles, "Automatically end turn
for unconnected players", time limit menu and the four winners' star names (the names
are kept and used: above); the floating windows and Switch Players; the colour-monitor
joke; network play. Now done: the auto play settings window (`rs.autoPlaySettings`, the
new value in metal for defence), the radical hand window, the conquered window and Name
a Star, as 4.0.5's above. The End Turn button's black window shows the year (PICT 5500;
4.0 also showed the time left there, and the remake has no time limit).

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

None of the rules. The engine defaults the ruleset relied on are settled from 5.0.5's
code (`docs/fallbacks.md`); the last of them, in October 2026:

1. **The computers' sexes and names.** The New Game window's OK draws them, for 8
   computer slots: the sex is the clock's rand(1, 2) == 1 (a man; so a woman one time in
   two, not the engine's 45 %), then a name of that sex, both drawn again while an
   earlier slot of the same sex has the name (`FUN_10059570` @1005a2a4-1005a404, and its
   twin `FUN_100b0bc0`). The names are the Preferences' list of past players of that sex
   (`FUN_10066000` adds every player's name when a game is played) and then STR# 6280
   (men) / 6281 (women) (`FUN_10095d50`, `FUN_10095ea0`). The server gives computer k the
   k-th (`FUN_100b8770`), and the galaxy set-up's `FUN_1006d0c0` renames a computer whose
   name begins another player's, or is the start of it, with the next of the designers'
   names for its sex (men from "Peter", player +0x28 = 1; women from "Christie"; the
   earlier note had the sexes the other way round). The draws are the clock's
   (`FUN_10054d40`, CPrefs' virtual +0x18), not the game's table. Done
   (`computerIdentity505`); the past players' names aren't kept (below).
2. **Design names.** `FUN_1007dcf0` as read, now applied (`shipName505`): the game's
   rand(0, 14) and 15 names for the set-up types, the Radical discoveries' types, the
   computers' and auto play's; the clock's over the whole list for the design window;
   then the first name round the list no live type of the player's has, and when all are
   taken the last one tried (not the first drawn, as noted before); a decoy is a Fighter
   record and takes a Fighter's name. The Palm program's `FUN_0004cd18` is the same, so
   the Palm ruleset keeps 5.0.5's.
3. **The first messages** (`FUN_1006f870` @1006fa2c-1006fab0): with the "Give helpful
   game play hints" preference on (its default), hint 1 ("Click here to make this
   message go away. ..."), "Spaceward Ho! by Peter Commons.", "Artwork by Howard Vives
   and Bob Van de walle.", hints 2 and 3; with it off, the two credits. Done
   (`welcome505`; the New Game passes the preference as `hints`).
   **Humans' messages a turn**: three (Send Message is greyed out at 3, `FUN_10061af0`
   @10061d88). Done (`chatLimit`).
   **The Group Fleets window** (`LOrganizeFleetsDialog`): its rules for "Merge all
   fleets here" and splitting are done (`canMerge505`, `organized505`): all-Biological
   fleets mix only with each other; the fleet that takes ships keeps its orders and the
   lower fuel. The window itself is now built too (`rs.organizeFleets: '505'`, js/skins/classic/ui.js
   `openOrganize`), with a count field for part of a pile (5.0.5's Option-drag).
   **Routes planned on the map**: a dragged fleet gets DeterminePath's route
   (`FUN_1008c5f0` @1008ce2c, `FUN_1008d140`). Done (`rs.route`).
   **Scrapping over someone else's star, patch only**: nothing reaches the engine's
   scrapping; the patch's global warming marks its fleet, and 5.0.5's own dismantling
   gives the metal to the star's owner. Nothing to do.

Settled in October 2026: an out computer plays no turn (`FUN_10081cc0` runs its steps
only while the player's out flag, +0x34, is 0; Palm `FUN_00060178`, +0x36).

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
13. **A computer is renamed by a prefix.** `FUN_1006d0c0` compares names over the
    shorter one's length, letter case aside, so a human called Edward has a computer
    called Ed renamed Peter, and one called P has Pam renamed. The designers' lists it
    renames from hold 16 names each; the men's runs on into the women's.

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
8. **The clock's random numbers** (`FUN_10054d40`: the computers' sexes and names, the
   design window's names) are a stream of the remake's own, apart from the game's
   (`G.rsClock`).
9. **The past players' names**: 5.0.5 adds every player's name to the Preferences'
   lists of names (`FUN_10066000`), which later games draw computers' names from; the
   remake keeps no such list and draws from the game's 20 and 22.
10. **The hints** (settled October 2026): 5.0.5's turn sends a hint every 10-year step
    to each player with the hints preference on (`FUN_10072a10`: report 500 with the
    clock's rand(4, 43), STR# 6021 lines 4-43); the remake had shown one every seven
    turns. Now one every turn (`rs.hintTexts`), but the skin shows it, so: once an End
    Turn even with 20, 30 or 50 years a turn (5.0.5: one a step), drawn by the browser,
    from the viewer's hints preference, after the turn's other messages and with the
    skin's picture (5.0.5: report 500's, 9049, first in the list).

### Interface not done

- Now done: **the Group Fleets window** (October 2026), as 5.0.5's: drag (or tap) piles between
  fleets with a count for part of a pile, Group All, Split, the stance and late-arrival
  controls (`openOrganize`, `rs.organizeFleets: '505'`).
- **The one-time alert** when a dragged fleet can't reach the star ("Sorry, but that
  fleet doesn't have enough fuel ...", STR# 6004.30, shown once, prefs +0x290 bit 1):
  the remake shows its own note each time.
- Now done: **the auto play settings** (Preferences, `FUN_1005ec40`; used by the Auto
  button, `FUN_10066bb0`; `rs.autoPlaySettings`): Preferences has the Friendly-Aggressive
  and Dig In-No Defense sliders (0-100), and each turn the computer plays for you it sets
  aggressiveness to a tenth of the first and colonies defended to the second. Open: the
  Preferences' defaults, so until the sliders are set the auto play personality keeps its
  own values; and the sliders' direction (5.0.5 reads Dig In-No Defense straight into
  colonies defended; the remake puts 100 % at Dig In).
- Now done: **the Radical Research window** (`FUN_1005f280`, dialog 0x99;
  `rs.radicalHand`): from the "hard at work" report's button or the Galaxy menu, with a
  full hand of four you may cancel one program. Open: its program names; the remake lists
  4.0.5's strings 821-837 for the 17 both versions have (the fallback to 4.0.5), and for
  the three 5.0.5 added words from their own reports ("Build a new research facility.",
  "Raise the prime lending rate.", "Renegotiate your line of credit.").
- **The canned-message window** (`FUN_1005d940`, codes 0x416-0x42c): "Look at %s"
  explores a star for the receiver (`FUN_10078c80`), "I own %s" marks it in the
  receiver's records, "I like planets ..." gives your home; messages to everyone, your
  allies or your best buddies. The remake's messages are free text.
- **Options locked by rank** ("Need more MPs", `FUN_10059570`); left open on purpose.
- **The questions before buying more than 9 Scouts or Tankers** (alerts 0x24, 0x25,
  `FUN_1005cf40`).
- **The first turn's budget kept for the next game** (`FUN_10064600`). The new game's
  shares from the preferences (`FUN_1006579c`) are done with the preferences' defaults
  (`FUN_10072490`): every game starts from them.
- **The Radical Research window** (`FUN_1005f280`, dialog 0x99): with a full hand of four
  programs, cancel one (it leaves the hand). A rule, in a window; not in the remake.
- **The turn time limit** (`FUN_10058360`, `FUN_10066260`), network play and the lobby.
- Now done (October 2026): **naming a star at a new rank** (the rank window
  `FUN_1005e2b0`, `rs.nameAStar.inRank`): its field takes up to 11 letters; OK refuses a
  kept name (letter case aside) or one Munger finds in STR# 6060 with alert 10 ("Sorry,
  but there is already a star with that name. How about a different name?"), else adds
  it to the Preferences' list (+0x2e8); New Game (`FUN_10059570` @1005a2f0) takes up to
  five in a row from the clock's rand(0, kept − 5), and `FUN_1006f280` gives them the
  first places of the star list and shuffles it. Open: the window's own words (its PPob
  isn't in the remake's copy of the program): the remake shows the iOS port's, "You may
  name a star for use in future games:" (a later version's, the last resort).
- Now done (October 2026): **numbers from ten million**: 5.0.5's `FUN_10055050` writes
  them "12,345K" in reports and windows ("$12,345K" in a report, whose template has the
  "$"), and the panels' sums "$12.345M", a negative sum "($1,234)" (`rs.fmtNum`,
  `rs.fmtMoney`). 1.2 to 4.0.5 write "12,345K" (`LongToNiceString`, `FUN_0042e5c2`); the
  Palm writes every number in full (`FUN_0002c510`). The income view
  (`FUN_10098650`) writes the interest shorter ("12K", "1.23M", `FUN_100552e0`) inside STR#
  6003 item 8, "(Int: $%s)" (found in the resource fork; the same list holds 4 "(+ $%s)",
  5 "(- $%s)", 6 "(+ %s)", 7 "(- %s)"; the view loads item 8 and then calls `FUN_100552e0`
  on the player record's +0x4c, drawn right-aligned 0x17 pixels down). Not built: the
  remake's Interest row is a row of its own, written as the other sums.

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

None: the code settles every rule question met. Settled in October 2026 (they had been
5.0.5's engine defaults):

1. **Player slots**: 9, not 16. `FUN_000232e6` sets the alliance and best-buddy masks
   (game +0x1aa, +0x1bc) for 9 players (5.0.5's `FUN_1006c4d0` for 16); a human joins
   only while there are no players (`FUN_0003412a`, the New Game window's Create and the
   Players window's Add, else 0x13a2), and 8 computers' names are drawn
   (`FUN_000692c4`). Done (`maxPlayers: 9`; the remake's hot seat shares the 9).
2. **The computers' names**: 5.0.5's. tSTL 6280 / 6281 are STR# 6280 / 6281 name for
   name, read the same way (`FUN_0002bf90`, `FUN_0002c0b8`: the Preferences' past
   players first); the sex is SysRandom(1, 2) == 1, a man (`FUN_000692c4`); the rename
   (`FUN_00023cda`, listed before as the star names) has 5.0.5's two lists of 16.
3. **Design names**: 5.0.5's routine (`FUN_0004cd18`; tSTL 6010-6016 the same lists).
4. **The first messages** are the Palm's own (`FUN_00026304` @000266fc-000268cc):
   tSTL 6021.0-2 for the hints (`FUN_0002be5c` reads report 500's number less one), the
   two credits, and "Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon
   (tm)" (1159) last. Done (`welcome` in `js/rules-palm.js`).
5. **Messages a turn**: below (item 8 of "Settled, worth confirming"). **Organize
   Fleets** (tFRM 2300): Group All (`FUN_00079a18`) and Split (`FUN_00079ea8`) are
   5.0.5's (the lower fuel, the "bought this turn" mark, a new design's stance, the
   colonists, Biologicals grouped apart; Split copies the fuel), so the remake's "Merge
   all fleets here" and Split keep 5.0.5's rules. Moving a pile is the Palm's own (item
   10 below). **The map's routes**: 5.0.5's DeterminePath (`FUN_0004c22c`).

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
8. **A human's messages aren't counted.** The player record has room for 3 messages a
   turn (+0x124, +0x126; the gift count follows at +0x1b0), the computers stop at 3
   (`FUN_00066fdc`) and 5.0.5 greys out Send Message at 3, but the Palm's Send Message
   and Send (`FUN_000371d6`, `FUN_000754b6`) never check: a 4th is written over the
   gifts, and the End Turn copies past each player's 0xb8 bytes. The remake can't play
   the overwrite and allows any number; the 1.0.4.1 patch keeps to 3 (`palmMessages`).
9. **One human a game** (item 1 above): the Players window's Add refuses once the game
   exists (0x1390) or anyone is in (0x13a2), and its End and Take buttons do nothing.
10. **Moving a pile in Organize Fleets** (`FUN_000790ea`, `FUN_0004af48`; 5.0.5 drags
    piles with `FUN_100a8780`): to "Empty Fleet" the new fleet (`FUN_0004adc0`) has a
    full tank (a Biological's empty) and isn't "bought this turn"; into another fleet,
    that fleet keeps its own fuel, takes the moved design's stance, and its colonists
    are replaced by the moved ones (5.0.5: the lower fuel, the stance only for a design
    new to it, the colonists added). The remake has no pile move (Interface not done),
    so neither is played.

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
7. **Several humans** play hot seat with the remake's own cover screen. The Palm game
   has room for one: its Players window (tFRM 1300, `FUN_00039c2c`) adds a person through
   `FUN_0003412a`, which refuses once the game exists (0x1390) or has a player (0x13a2),
   and its End and Take buttons do nothing.
8. **Every game starts from the default shares**: the Palm game keeps your first turn's
   research and budget shares as the next game's (`FUN_0002d91c`).
9. **Sounds**: the skin's own (Palm: a handful of system sounds, `FUN_0002c17e`).

### Interface not done

- Now done: **the Radical Research window** (tFRM 3000, `FUN_00041aa4`, `FUN_00075dba`-
  `FUN_00075ff0`), as 5.0.5's (above), from the report or the Galaxy menu (not the Radical
  bar). Its program names are open as 5.0.5's.
- Now done: **the auto play settings** (tFRM 1700, `FUN_000713be`): the Friendly and Dig
  In sliders on the Auto play window, used as 5.0.5's (above), with the same open points.
- **Organize Fleets' pile moves** (`FUN_000790ea`, `FUN_0004af48`; item 10 above): not
  built (`rs.organizeFleets: null`): the Palm's pile move keeps the taking fleet's own fuel
  and replaces its colonists, so 5.0.5's Group Fleets window would play 5.0.5's rules. The
  Palm keeps Split… and "Merge all fleets here".
- **Build Ships' Allow Debt box** (`FUN_0004435a`) and the questions before building more
  than 9 Scouts or Tankers (`FUN_00043754`, tSTL 6004.36-37).
- **The research bars** dragged per mille like the budget bars (`FUN_00049496`), and
  tapping the Savings bar while dipping to open Dip Into Savings.
- **The Message History's Evacuate button** (`FUN_00040232`).
- Now done: **naming a star at a new rank** (tFRM 2900, `rs.nameAStar`): after the new
  rank's window; the names are kept (localStorage "ho5.stars.palm"). Settled October
  2026: `FUN_000692c4` puts up to five in a row from SysRandom(0, kept − 5) into the game,
  and `FUN_00025f4a` gives them the first places of the star list and shuffles it, so
  they land on stars at random. Settled October 2026 (`FUN_00075c40`, the Cool!
  button): the list grows without limit, each name added at the end, none replaced;
  the name (11 letters, the field's maxChars) is refused only when it equals a kept name,
  letter case aside (not the star list), with tSTL 6004 item 10; the form's words are
  tFRM 2900's ("Congratulation!", "You may name a star for use in future games:", Cool!,
  Nevermind). Built (`rs.nameAStar` `match: 'kept'`, `max: 11`).
- **The canned-message window** (tFRM 2600: Thank You, Sorry, the curse); the remake's
  messages are free text.
- **Options locked by rank** (`FUN_0003825a`), left open on purpose.
- **The Palm report texts** where they differ from 5.0.5's (the decoy discovery: "Your
  ship technicians have designed a decoy ship. It's really weak, but it looks menacing
  and can help keep your allies in line!"; the miracle: "Your scientist have figured out
  how to prevent %s ..."; money without "$"); the remake shows 5.0.5's.
- **The demo** (three computers, a small galaxy, capped technology, report 0x474) and
  registration: nothing to register.

---

## iOS 1.2.9 (2012)

The C++ rule core of the iOS program (0x100020614-0x10003e7b4, 291 routines) was read
beside its 5.0.5 twins (`docs/coverage-ios.md`), and the interface routines that change
the game one by one (`docs/ios-findings.md`). The ruleset (`js/rules-ios.js`) takes the
5.0.5 rules and computers wherever the iOS code does the same, and its own code where
it doesn't. One page of the program (0x10008d000-0x10008dfff) is encrypted by the App
Store and was never decrypted or read; no rule routine lies there.

Settled from the code in October 2026 (they were open in `docs/ios-findings.md`):

1. **"Hope" and "SparksMcGee" are dealt like any other name.** The galaxy set-up
   (`0x10002a38c` @0x10002b9d8-0x10002bcac) draws each star's name over the whole list
   of 257 (rand(0, count − 1), again while an earlier star has it), then shuffles; the
   names named at a new rank come first. A saved game's "Sparks McGee" (12 letters, too
   long for a star) is renamed "SparksMcGee" when loaded (`0x10003c2c8`). "Hope" comes
   after "Naboo" (the 192nd). Done (`rs.starNames`).
2. **No first messages.** Messages enter the report list only through `0x10003b028` and
   `0x10003af9c`, called from the battles (`0x100021108`), the turn (`0x10002dca8`),
   exploring (`0x10003405c`) and the new colony (`0x100034238`); no pointer to either is
   stored anywhere. No call passes the credits (1000-1002), and report 500 is sent only
   by the turn's hint. Done (`welcome: []`). (Nothing in the encrypted page can be
   ruled out, but it holds `RootViewController` and drawing code.)
3. **The hints are lines 4-42 of the 42.** The turn sends report 500 with rand(4, 42)
   (the interface's numbers, `0x10003cb08`; the count from `0x10008e5c4`) and report 500
   reads line n − 1 (`0x10008e508`). Done (`rs.hintTexts`, 39 lines).
4. **Name a Star at a new rank** (`-[RankLevelDialogLayer initDialog]` 0x1000b8b78,
   `doClose:` 0x1000b90ec; `-[EndGameLayer doUpdateMPs]` 0x10009ce54;
   `-[NewGameScene SetupExtraGameInfo:]` 0x1000162d8): new in this pass. Done
   (`rs.nameAStar`, five names a galaxy, from a start the remake draws from the seed).

### Open

None of the rules.

### Settled, worth confirming

1. **Kansas has a Cancel button.** 5.0.5 tells you "Dorothy, ..." and evacuates; iOS
   shows the line with OK and Cancel (`tryEvacuatePlanet:` 0x1000941e0), so it is a
   question. Done as a question.
2. **Evacuate asks for every colony**, including one losing money ("Do you really want
   to evacuate %s?", sprintf Templates 36).
3. **The Allow Debt switch starts at "No"** each time Build Ships opens (CONFIRMED
   October 2026: `initDialog` 0xb4d60 makes `debtSlider` a SliderArray of Misc Strings
   159 "No" and 160 "Yes" and never calls `setValue:` on it, and nothing else writes
   it; `determineCapacity` 0xb6a08 reads 0 as "stop at Ship Savings", as the remake's
   `allowDebt` `on: false`), so by default you can't buy past your Ship Savings.

### Remake's choices

1. **Random numbers** are the remake's own (iOS: 5.0.5's table of 5,000 for the game,
   `0x1000d0fbc`; the C library's `rand()` for the interface).
2. **When the computers plan and fleets move**, **dragging a budget bar**, **a failed
   purchase**, **gifts** and **master points' cap**: as 5.0.5's choices above.
3. **Game Center** (the "master_points" and "games_won" leaderboards and seven
   achievements): kept in the browser (`rs.gameCenter`, its own key
   "ho5.gamecenter.ios"), never with another ruleset's records. A game counts once by
   its seed (iOS: its creation time, among the last 10 won).
4. **Which five named stars go in** is drawn from the game's seed (iOS: `rand()`).
5. **The hints** are shown by the skin, as 5.0.5's (above).
6. **Every game starts from the default shares** (iOS keeps the first turn's for the
   next game, `-[SimpleServer copyPrefsToPlayerRec]` 0x10009030c).
7. **Money over ten million**: settled October 2026. 5.0.5's own formatter
   (`FUN_10055050`) writes "$12.345M" and "12,345K" as iOS's (`0x10003cd4c`) does, so the
   remake now writes them so too (`rs.fmtNum`, `rs.fmtMoney`; the four reports whose "$"
   moved into the formatter, `msgText`).
8. **Touch follows iOS 1.2.9 in every skin.** Whenever a finger is used (a pointer
   event of type "touch"), every skin and every ruleset get the iOS game's gestures
   (`docs/ios-findings.md`, "Touch controls"; `js/skins/classic/ui.js`, "touch"): pinch
   zoom from the whole galaxy to 1.5 (phone) or 2.0 (tablet) with no rubber band, a pan
   thrown on release, a tap selecting the nearest star, the selected star's ruler, single
   tap (deselect) and double tap (Build Ships or the battle), fleets dragged out of the
   planet panel's list and dropped on a star (the planet's buttons, and on a tablet the
   star's information, hidden meanwhile), the double tap on the fleet list (Organize
   Fleets, or Split… without it), the satellite's long hold (with a ruleset that marks
   for scrapping), lists sliding after 30 points (the fleet list thrown on as iOS's
   inertial menu); a gesture whose command the
   ruleset hasn't got is skipped. A mouse and a pen keep the remake's own behaviour. No
   other version had a touch screen; if an Android version turns up and handles touch
   differently, it becomes a choice like the OS look. The remake's own choices in it:
   - a double tap is two taps within 0.4 s and 30 points: iOS counts taps with UIKit's
     own tapCount (`-[CCMenu tapCount]` asks the touch), so the game sets no window;
   - a screen whose short side is 600 points or more is a tablet: iOS asks the device
     (`+[GraphicDefines setup]`: the iPad idiom), which a browser can't;
   - the tap's reach and the selected star's square follow iOS's planet scale
     (`-[MapLayer setScale:]`, now read), with the remake's own smallest scale (the
     whole galaxy showing; iOS's covers the screen); where stars crowd, the square gives
     way to a nearer star, and a slow drag from it counts as a drag;
   - the fuel alert is shown once per browser;
   - (October 2026) the budget and technology bars are no longer on iOS's log scale for
     every finger: each ruleset's own scale is used by the finger, the mouse and the pen
     alike, and for drawing them (`rs.barScale`, above, "The bars and the battle window");
   - Organize Fleets: a pinch counts past 10% either way (iOS: any scale over 1 splits,
     any other groups); a pile moved to a fleet that hasn't its design keeps that fleet's
     own stance for it, not the pile's (built October 2026; iOS's `move:from:to:` leaves the fleet's stance byte
     for that design as it was; CONFIRMED October 2026, 0xc27e0 writes only the counts
     (+0x28), the larger fuel used, "bought" and the Colony Ships' colonists, so it keeps
     whatever the byte held); the fleet a
     pile leaves is gone at once when empty (iOS: when the window closes);
   - the iOS skin's route line: a route under 3 light years (none on iOS) is drawn as
     one white leg, and the legs' labels keep one size (iOS scales them with the
     planets).
9. **Settled from the code in this pass** (were the earlier build's guesses):
   Organize Fleets' arrows page the fleets, four showing (`moveContainer:`, not a ship
   move); the whole pile moves, part of one only by Split; the route line is the route
   finder's, white leg by leg or red straight; the iPad hides the star's information
   while a fleet is dragged; the fleet list is inertial; the planets' ice cover is
   `T / 130` (coldest `ice_cover0`) and the boulders `5 −` the metal steps (most metal
   `boulder_01`); the star markers (`planet-x` for a battle seen at a star of no known
   owner, `planet-exclamation` for the end of one of your fleets' routes, the supernova
   pictures at 71 and 91); the tap's reach (√(2,200 × planet scale), under √32,768 map
   units) and the selected star's square (40 × the planet scale's target).

### Interface not done

- **Several saved games**, e-mailing a game, the welcome screen and the help page.
- **Game Center's own windows**: the leaderboards and achievements are listed, not
  shown as Game Center shows them.
- **The questions before building many Scouts or Tankers** (Alert Strings 36-37, shown
  in the Build Ships window).
- Now done: **Organize Fleets** (`rs.organizeFleets: 'ios'`, `openOrganize`): the
  columns and arrows, moving a pile, Delayed Arrival and Attitude, Scrap, Group, Split,
  New Fleet, the pinch. 5.0.5 has its Group Fleets window the same way
  (`organizeFleets: '505'`, with a count for part of a pile); the Palm keeps Split…
  (its pile moves differ, item 10 of the Palm's "Settled, worth confirming").
- Now done: **the supernova's explosion** (settled October 2026, `docs/ios-findings.md`):
  `SupernovaAnimate` runs 20 frames (`supernova0`-`19`) at 0.15 s, 3 seconds, the turn
  the star blows, then `supernovaed` with the star dust at full; after that the dust
  (+0x12, 20 at the nova, one less a turn) fades at 255 x dust / 20 and the wreck and dust
  go at 0. `supernova_going1-3` aren't timed: they are the turns before, by the nova
  count. Built in the iOS skin (`novaLook`); the dust that big battles leave (+0x12 set to
  20 by `sub_100021108`) isn't, the remake keeping no dust for battles.
- **Options locked by rank**: none on iOS, so nothing to do.
- **The Kansas and Hope words** in other languages (`fr.lproj`, `tr.lproj`).

