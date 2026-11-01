# Spaceward Ho! 3.0.1 French (3.0.1F)

The French Macintosh 3.0.1, found by Jake: `Spaceward3_FR.sit` (StuffIt), a folder "The Ho! 3 F ƒ"
with the program ("The Ho! 3 F", resource fork 788,904 bytes, 1 Dec 1993), its colour pictures
("Ho! 3.0 CPicts", 7 Sep 1993) and the folder's icon. **No manual** is on it, and no read-me.

- `vers` 1 and 2: 3.0.1, region 1 (France); "3.0.1, ©1990-93 Delta Tao, Inc. & Upgrade" (the
  publisher of 1.2F, Upgrade Editions, Paris). An official translation, not a fan one.
- The program's resources, as the English 3.0.1's (`docs/source-inventory.md`): `STR#` 30
  (English 29), `DITL` 95 (96), `DLOG` 42 (43), `ALRT` 52 (52), `MENU` 10 (10), `CNTL` 19
  (19), `CODE` 26, `PICT` 146, `ICN#` 129 (131), `ics#` 73, `snd ` 21. Nothing in it was run; its code was read (below).

## What was extracted

`tools/extract/languages.py --mac301 <fork>` (unar leaves the fork in an AppleDouble file, as
1.2F's) writes `js/lang-data.js` `mac301Fr`, beside `mac12Fr`, nothing else in the file changed
(checked: `dosDe`, `ios`, `mac12Fr` identical):

- every `STR#` from 1000 up, by number, as `mac12Fr` (29 lists, 726 lines): the report
  templates (1000, 117 lines), tech names (1001), file strings (1002), star names (1003, 191),
  errors (1004), the map's words (1005), classes (1006), skills (1007, 1009), comparisons and
  graph items (1008, 1011), menu text (1010), the Galaxy menu's strings (1020), the battle
  window (1030), End Turn (1040), Fix Spending (1050), computer and ship names (1999-2004), more
  star names (2005), Send Message (3000-3002), **the hints (3100, 40)**, more strings (4000) and
  the standard alerts (4001);
- the windows, which 1.2F's extraction didn't keep: `DITL` (each item `[kind, text]`, a
  picture, icon or control as its number), `MENU` (title, then items with their command key
  after a tab), `DLOG` and `CNTL` titles. The `ALRT`s use the `DITL`s of the same numbers.

**Routed (October 2026).** `mac301Fr` is 3.0.1's French now, with the English 3.0.1's STR# lists and windows beside it (`mac301En`, `tools/extract/languages.py --mac301-en`, from `app.rsrc`, the English program's fork). See `docs/translations.md`, "3.0.1"; what follows is the plan it followed.

## The numbers are the English 3.0.1's

When this was first written the English 3.0.1 fork (`app.rsrc`) wasn't to hand, so the pairing couldn't be done line for
line here. Checked instead against the English lines `js/rules-301.js` and `docs/301-findings.md`
quote with their STR# numbers: 1000.3, 9, 12, 13, 16, 18-23, 25, 30-32, 65, 73, 84, 105 are the
same lines in both languages (e.g. 1000.12 "Year %d:" / "Année %d:"; 1000.105 "Warning! After
supporting your planets…" / "Attention! Une fois le soutien à vos planètes effectué…"). The few
quotes that don't line up (66, 69, 78, 85, 91) are loose references in comments, not a shifted
list. As 1.2F's, the French program keeps the English one's numbering: **with `app.rsrc`, pair
by (resource, index) mechanically**, then check the counts (English 3.0.1 has one `DITL` and
one `DLOG` more; find which). Done: the pairing is index for index, the French lists having a
few lines past the English's last (STR# 1000.115-116, 1020.21-22, 4000.41, 4001.26-27, the
training version's: "Version d'entraînement 3.01", "Si vous aviez eu la version réelle…") and the
hints list 3100 (the English has none); the extra `DITL` and `DLOG` are 4001, which the French
lacks; the shared windows have the same number of items.

## What it changes

**The iOS French descends from it.** 3100's hints are iOS's word for word ("Modifiez les barres
de dépenses. Partez à la conquête de la galaxie. Amusez-vous."), which is why the remake already
counted 119 of 3.0.1's French lines "official" (from iOS and 1.2F). But measured against the
disc, only **72 of those 119** are verbatim (or the same but for `%s`/`%d`), 2 of the 11
adapted lines and 0 of the remake's 2. The rest are iOS's later typesetting (the space before
"!" and "?") or rewordings, e.g. 3.0.1F "Oh-oh! %s a commencé à grossir et prend une teinte du
plus beau rouge." against iOS's "Oh-oh ! … rouge...".

Jake's rule (accuracy first, improvements only by the patch): **a version plays its own
official text, slips and all**; an official translation's wording is also the default wherever
the remake carries it (the nearest official one for the same English); corrections are the
patch's. So:

1. 3.0.1's French becomes 3.0.1F's text, verbatim, replacing (not beside: Rule 9) the remake's
   current 3.0.1 French, its windows too (the mac3 skin's French menus and dialogs from
   `MENU`/`DITL`).
2. The nearest official source for later versions' French changes where the English is 3.0.1's:
   4.0.5 (Windows and Mac) first of all, which today take iOS's French. Then 5.0.5 and the Palm,
   wherever their English is 3.0.1's and not iOS's.
3. Its own slips stay in the default, e.g. the Ship joke (DITL 3030): "Abandonner le vaisseau?
   Abandonnez le vaisseau! **Tous** le monde abandonne le vaisseau! Les femmes et les enfants
   d'abord!" (buttons "Dehors" / "Rester"), and the Hope joke (DITL 3020), "As-tu vraiment perdu
   tout espoir? Garde foi en toi." in "tu", unlike the rest's "vous". The remake's own French
   Ship line (`js/lang-remake.js` `fr.own`, "Abandonner Ship ? …") is then covered by an
   official line and must be deleted in the same change; the patch can carry corrections
   ("Tout le monde").
4. The 1.2F-lineage choices come with it: "galacto-dollar(s)", "Hé hé" after "vous venez d'être
   éliminé(e)", "%.*s" fillings, 1000.66 and 69's wording. They are the default.
5. `docs/translations.md` (Method, Counts, the 3.0.1 and 4.0.5 sections) and
   `node tools/lang-test.js --count` change with it.

## The End Turn button, and the other pictures

Unpacked with `unar` (1.10, from apt; the files come out as AppleDouble `.rsrc`, which
`tools/extract/mac3.py` reads) and compared picture by picture with the English 3.0.1's
(`tools/extract/mac3_fr.py`, which also writes the button):

- **The program's own button is French.** PICT 5500 (and 5501, pressed) read "Fin Tour",
  52x31 (54x33 pressed), pixel for pixel Mac 1.2F's p5500 / p5501. So the black-and-white skin
  (`mac3`) shows it in French by default (`mac3/sprites/p5500-fr`, replacing the drawn one of
  `endturn-langs`, which stays where no official exists: Mac 2.0.1, DOS 2.0).
- **The colour file's is not.** "Ho! 3.0 CPicts" PICT 5000 / 5001 (the colour End Turn, which a
  colour Mac shows instead of 5500) are the English "End Turn", unchanged, so a French game in the
  colour skin (`mac3c`) shows "End Turn" by default; the patch (fix `endTurnFr`, `docs/fixes.md`)
  shows the drawn "Fin Tour" (`mac3c/sprites/p5500-fr-patch`, `tools/skins/endturn_langs.py`).
- **Every other picture** (PICT 146 in each program; colour file `PICT` 30, `PPMp` 132, `icl8`
  167, `ics8` 69) is the English's, pixel for pixel, except: PICT 4010, only in the French
  program (202 bytes of drawing ops, a licence stamp with the copy's owner, address and serial
  number: not a game picture, not extracted, not quoted here); PICT 3550, only in the
  English program; and in the icons, `ICN#` 3010 (and its `icl8`: the French has the figure with
  its mouth open where the English has a steaming pile), 3170 (a question mark, the hints' icon;
  only in the French), and 3151, 3152 and 9993 (only in the English). No skin shows 3010, 3151,
  3152 or 9993 in 3.0.1, and the remake's 3.0.1 shows no hints (`hints: false`, as in English;
  the 3100 list and 3170's icon are dead data in the French program: see "Does 3.0.1F show hints?"
  below), so none of these changes what a game shows.

## Manual

There's no manual on the disc. If one turns up (printed, or a scan), it would be the only
official French manual: the remake could offer it from 3.0.1's Help menu instead of "Manuel (en
anglais)".

## Does 3.0.1F show hints? No: STR# 3100 and ICN# 3170 are dead data (read in the code, November 2026)

The program's 26 `CODE` resources (the same 25 segments and the same MPW runtime as the English
3.0.1's; laid out and named by `tools/decompile/mac68k.py`, segment *n* at *n* x 0x10000, 596 named
routines) were searched for every use of 3100 and 3170, as immediates and as resource ids, and
the resources for any item that could show one:

- `STR#` 3100 (40 hints; hint 1 "Cliquez ici pour faire disparaître ce message.") is loaded in **one**
  place: `GetReportString @1607e8`, which for a Reports-window record of **type 29** (the other
  types are 1000 + n - 1, STR# 1000.n) calls `GetIndString(3100, record+2)` (@160804-@16081a).
  `ICN#` 3170 (the question mark) is loaded in one place too: `GetIconID @161394`, the same type
  29 (@161722: `move.w #$c62, d7`). `DetermineFocusStar @161fce` and the other report-window
  routines list type 29 as a report with no star. That is the whole of it: no `MENU` item (the 10
  menus: Apple, File, Edit, Options, Ships, Galaxy, Windows and three pop-ups; none says hint), no `DITL`/`DLOG`/`ALRT`
  item (`ALRT` 3100 and 3160 contain the numbers 3100 and 3170 only as their `DITL` ids: the
  metal-offer and "destroyed the system" dialogs), no other `GetIndString` caller with 3100.
- **Nothing creates a type 29 report.** A Reports-window record is made only by `AddNewMessage
  @161a6e` (jump-table entry `$84a`; no other code references it) and, for a new player's first two
  reports, by `CreatePlayer @f26a0` (@f29fa-@f2a0e: types 0x3e8 and 0x3e9, the welcome). All 79
  `AddNewMessage` calls were listed with their type argument: 74 are constants between 0x3f0 and
  0x45a (the English 3.0.1's range: STR# 1000 has 115 lines there, and the French 117); the other
  five are 0x3ea + a small index (@a2666, @a607a), 0x44a + RND(0..3) (@a5f40, the four tech
  messages) and the Send Message queue's own type (@a0868, @a09ec), which `SendMessage @141052`
  fills only with constants 0x40a-0x417. The constant 29 occurs in the program only as a
  comparison in the three report-window routines named above. So no game, however played,
  makes the French 3.0.1 show a hint: **the hint list and the question-mark icon are dead data**, as
  the French strings 1000.116-117 and 4001.27-28 ("version d'entraînement", the training version,
  mono-joueur) are: nothing in this program refers to them either (`StandardAlert @13460` is
  called with 4001's indices up to 26 only; 1000.116 is never sent, 4001.27-28 never asked for). They are left over from another
  build of the same source (the training version), which the French disc does not contain.
  A type 29 report in a saved game, were one ever made by another build, would be drawn with
  the question mark and the hint; nothing in the French program writes one.

So the remake's 3.0.1 keeps `hints: false` in French and English alike, and the hints stay out of
the game: showing them would be an invention, not the program's behaviour. (The 40 hints are still
of use as the official French for the later versions' hints, which have them, e.g. iOS.)

## What else differs in the French program's code (read against the English, November 2026)

Both programs were laid out by `tools/decompile/mac68k.py` (segment *n* at *n* x 0x10000) and
compared routine by routine with the English 3.0.1's from `SpacewardHo301.img` (the same build
the English rules were read from: `docs/301-findings.md`, "Which build"). The comparison is
instruction by instruction, with the numbers that move when a program is relinked taken out:
jump-table numbers (a call is compared by the routine it reaches), branch targets (compared as
the instruction they reach), PC-relative and A5-relative addresses (the 409 A5 globals both
programs use pair one to one, in every routine compared), and the literal pools after each
routine (only text differs there). Immediates, field offsets, conditions and arithmetic are
compared as they stand. **574 routines have the same name in both** (the French has 16 more,
below).

| Class | Routines | What it means |
|---|---:|---|
| Identical | 468 | the same instructions after the numbers above |
| Code generation only | 58 | the same program, built differently (below) |
| Runtime and library | 26 | MPW's C library, start-up and file glue; no game |
| Localisation | 19 | strings, text layout, the Celsius figure, licensing, the Reports window |
| **Behaviour** | **3** | the two-human edition and the old-file check (below) |
| Only in French | 16 | licensing and alias glue (below), `memchr`, `memcpy`, `memcmp`, `PLStrCmp`, trap helpers |

Of the 574, **93 differ in size** (the first pass listed 91 by comparing the two routine lists): 48 are code generation,
24 library, 19 localisation, 2 behaviour (`CreateGalaxy`, `ReadGalaxyInfo`; the third behaviour
routine, `CreateNewPlayer`, is the same size).

**Code generation (58).** The French was built with another compiler build or options: it
drops the English's register copies (`move.l d1,d0` after computing in `d1`;
`movea.l a1,a0`), saves fewer address registers (`a2` unused), keeps 16-bit values in 16-bit
registers (`ext.w` after `swap`, `tst.b` or `tst.w` where the English tests the long, `sub.w`
where it has `sub.l`), and writes a condition as `sle.b / neg.b / beq`. 39 of the 58 are the same
instructions once register names, register copies and register lists are ignored; the other 19
were read hunk by hunk (the value ranges make each pair equal: a remainder of 100 or 2 or 5 fits a
word; `LMOD` and `ULMOD` by 0xffff on a positive number). `SpendTechMoney` (18 bytes longer in French) is `100 - (money mod 100)` done in 16 bits, plus a test of a local that is
`clr.w`'d just before (`bne` never taken) in front of the tech-level report: the guard of the training
version's "Si vous aviez eu la version réelle..." line (STR# 1000.116, whose sound case
`PlayAnnounceSound` has too), switched off in this build. `EndTurn` (-12), `ColonizeStar` /
`DecolonizeStar` (-14: the English keeps a pointer on the stack across `BlockMove`), `BuildDesignShips`
(-12), `DoBattleStage` (-100: the same), `DoComputerTurn` (-10), `AddToHall` (-14), `FollowStarNameClick`
(-28), `SetCellsToNearbyStars` and `SetCellsToKnownStars` (-20) and the rest are of this class: no
rule differs.

**Behaviour (3 routines, 2 differences).**

1. **The French copy is a two-human edition (Upgrade Editions'): CONFIRMED.**
   - `CreateGalaxy @f0004` (hunk @f02a6; English hunk @f02a8): the game header's byte +1, the number of humans that may
     still join, is `min(2, 20 - computers)` in French and `20 - computers` in English.
   - `CreateNewPlayer @122010` (hunk @1220e0): the English refuses a human when the humans joined (header +2) reach
     that number (`StandardAlert(3)`, STR# 4001.3, "this galaxy is already full. No more players can
     join"). The French does not read byte +1 at all; it refuses the third human, when header +2 is 2,
     with the toolbox `Alert(3370)` (ALRT/DITL 3370: "Désolé, mais cette version de Spaceward Ho! est
     limitée à 2 Joueurs Humains." and "Contactez Upgrade Editions si vous souhaitez acquérir une
     extension à 20 Joueurs Humains."). The English has the same ALRT/DITL 3370 ("Sorry, but this version of Spaceward Ho!
     is for up to two human players. Contact us to get the upgraded 20 player version, if you'd like.")
     and never shows it, as 1.2's (`docs/12-findings.md`).
   - `ReadGalaxyInfo @12045c` (hunk @12065a): after the version checks, the French refuses (the same alert, the file
     closed) a galaxy whose header +2 is more than 2; the English has no such check.
   - Computers are not limited: 0 to 19 as in English. With 19 computers the French check still lets a
     second human join (byte +1 is not read), 21 players; what the program does with 21 was not read and
     the remake keeps 20 players in all.
   - In the remake: `rs.lang.fr.releaseRules.maxHumans = 2` for the 3.0.1 ruleset (`js/languages.js`),
     laid over the ruleset when a game is in French, with or without the patch (`js/engine.js`
     `inLanguage`, `rulesIn`). New Game takes 1 or 2 people on this computer (and online seats) in
     French, 3 or more get the program's box (below); `newGame` keeps the first two humans of a French game. English and every other language
     are untouched (`node tools/test.js 301 --digest` is the same).
   - **The patch lifts the cap** (fix `frTwoHumans`, `docs/fixes.md`; Jake, November 2026). It is a product limit (the box says
     the 20-player extension is bought from Upgrade Editions), not a mistake in the program, so by default the remake keeps it
     and the patch removes it: with the patch a French game takes as many people as the English 3.0.1 does in the remake (at
     New Game, online seats, a saved game). **By default** a third person is refused with the program's own box, ALRT/DITL
     3370, in **French whatever the page's language** (it is the French program's box): choosing 3 or more people in New Game
     gives it and sets the choice back to 2 (`rs.lang.fr.releaseRules.limitAlert`, `alertOver` in the classic skins'
     `ui.js`: "Désolé, mais cette version de Spaceward Ho! est limitée à 2 Joueurs Humains." / "Contactez Upgrade Editions
     si vous souhaitez acquérir une extension à 20 Joueurs Humains." and the publisher's telephone line the DITL ends with, an OK
     button); a saved game with more than two people is refused with the same words (`ReadGalaxyInfo @12065a`: `HO.load`).
2. **`ReadGalaxyInfo @12045c`, hunk @120484: the old-file check.** The English refuses a file whose first four bytes
   are `FMS∂` or `SH2∂` (0xb6 is MacRoman ∂) (STR# 4001.4, "can't read galaxy files created with versions 1.0 - 2.0.1"); the French
   `FMR∂` or `SH2∂`. File format only: the remake reads no original files.

**Localisation (19).** Strings, layout and tables that follow the language:

| Routine | What differs |
|---|---|
| `DrawPlanetRect @154bae`, `ExploreStar @a5556`, `GetReportString @1612bc`, `MakeOneListedStar @1407ea`, `MsgReactDetermineAllies @95722` | the Celsius figure `(t + 720 - home - 324) x 5 / 9` (STR# 4000.3 "%d.%1.1d°C"); settled above and already in the remake (`cFormula`) |
| `LongToNiceString @1247e` | thousands are separated by a plain space, not a comma: "%d %.3d", "%d %.3d %.3d", "%d %.3dK" (the English "%d,%.3d"). **Now in the remake's French by default** (`rs.lang.fr.releaseRules.fmtNum`, `engine.js niceNumSp`; the patch makes the space a no-break one, `frFilled`) |
| `InitHOFList @144c76` | the Hall of Fame list's date: the same "%d/%d/%d" with the arguments in another order, day / month / year in French (`DateTimeRec` year, month and day pushed so that the day is first), month / day / year in English. Numbers not padded ("1/11/2026"). The Details window's date (`doDetailsDlg @144f34`, @14516a) is month / day / year in **both** programs. **In the remake**: the list's date is day / month / year in a French game (`rs.lang.fr.releaseRules.hofDate`, `hall301.date(t, G)`), the Details window's stays month / day / year |
| `MakeFleetDescription @130fa0` | the formats of a fleet's line: French "%d %.*ss %.*s (%d/%d)", "%P %.*s %.*s (%d/%d)" (the %P is "un", STR# 4000.42, which only the French has) and "%.*s %.*s (%d/%d)"; English "%d %.*s (%d/%d) %.*ss", "one %.*s (%d/%d) %.*s" and "%.*s (%d/%d) %.*s": the class (the French STR# 1006: Eclaireur, Croiseur, Transport, Satellite) comes first, with an "s" after a count of two or more, then the design's name, then (weapons/shields). Capped at 40 characters in both. **In the remake**: the battle window's group lines in a French 3.0.1 game are the French formats (`BATTLE_301F` in `js/languages.js`): "4 Croiseurs Serpent (8/7)", "un Transport Mother (6/6)"; before, they were the English order with iOS's class names. **Not reproduced: the same function's other callers**, the fleet reports (`MoveShips`, `ScrapFleetsAndTypes`, `MakeResultMessages`: "Your fleet of %.*s has arrived at %s.") and the Fleets window's own rows (`DrawOneFleet`): in both programs they print the description, "3 Columbus (1/1) Scouts" in English, but the remake's reports (English too) say "3 Scouts" / "one Scout" (`E.fleetLabel`) and its fleet rows "3 Columbus" (a name and a count), so there is no description of the original's form to put the French formats into (see "Seen, not changed" below) |
| `DrawOneGroup @e2702`, `DoOneBattle @e0a8a` | the battle window's lines: the French passes the group's count to `MakeFleetDescription` (for a group that is gone, the count lost: "3 Eclaireurs Sonde (1/1) détruit(s)", "un Eclaireur Sonde (1/1) détruit(s)"), the English passes 0 and prints the count itself ("%d dead %.*s"). `DoOneBattle` sets `TextSize(12)` before and after each player's name over the columns and draws the name with `MoveTo` 12 pixels above the bottom of the 32 x 32 face rectangle, the English 10. **The size is not a difference you can see**: the English never calls `TextSize` there, the battle window is a new window (`NewXWindow @11a1c`) whose port starts in the System font at size 0, which is 12, and `DrawOneGroup` ends with `TextFont(0)`, `TextSize(12)`, `TextFace(0)` in both programs (its groups' words are Geneva 9 in both). What does differ is the names' place: two pixels higher in French. **In the remake**: the French count in the group lines (above) and the heading names two pixels higher (`nameUp: 2`, `makeBattlePanel`, the classic skins' battle window) |
| `RecalcFleetsAtNewStar @15078c` | the rows that list other players' ships at a star (the list under your own fleets) come from two formats, STR# 4000.43 and .44 in the French (the English has them as literals, "%P’s ships" when the game file can't be opened to read the other players' fleets, "%P’s %P", the owner and the fleet's `MakeFleetDescription`, one row for each of their fleets there that is not in hyperspace). **The French resource has only 42 strings**, so `GetIndString` (@111a2: the C string is cleared first, and a string is copied only when its index is within the list) leaves each format an empty string, `sprintf` writes nothing and the row is a Pascal string of length 0: **an empty row**, one for each such fleet, not a partial one. **In the remake**: a French 3.0.1 game's other-player rows in "Ships here" are empty rows (`rs.lang.fr.releaseRules.otherFleetRow`, `fleetRow` in the classic skins' `ui.js`); the patch (fix `frFleetRows`, `docs/fixes.md`) fills them: "Claude : un Eclaireur Eagle (1/1)". The "%P’s ships" row (when the file can't be read) is not reproduced: the remake has no such state |
| `SetButtonStates @132bf0` | "Scrap All" / "Don't Scrap" from STR# 1020.22-23 ("Recycler tous", "Ne pas recycler"; the English has the two as literals). **In the remake**: the Ship Types window's button in a French 3.0.1 game says "Recycler tous" (`officialWindows`; "Ne pas recycler" was already there from the window's own text) |
| `SetMenuItems @f44a4` | the same enables; when no game is open the French also dims File item 9 ("Forcer la fin du tour...", the English "Force Turn Update"), which the English leaves as it was. **Not reproduced: the remake's 3.0.1 has no Force Turn Update command** (`rs.forceEndTurn` is only Mac 2.0.1's, `rules-mac20.js`; its Galaxy menu entry shows only in hot-seat games), so there is no item to dim, and the remake has no menu bar with no game open to show it in |
| `LoadDrawPicture @134c76`, `LoadDrawColorIcon @12aca` | a missing colour picture or icon falls back to the black-and-white one (the English draws nothing / erases). **Already the French behaviour in the remake**: `mac3c`'s sprites are the colour file's pictures and the black-and-white ones for every picture it lacks (every name `mac3` has, `mac3c` has); the colour file has the same pictures in both programs (pixel for pixel, above), so no picture is missing in one and present in the other. The English draws nothing where the remake's `mac3c` draws the black-and-white picture: not listed here, the English default is not part of this comparison |
| `GetReportString @1607e8`, `GetIconID @161394`, `DetermineFocusStar @161fce`, `PlayAnnounceSound @161844` | the Reports window: type 29 (the dead hint), the training report (code 0x45b, STR# 1000.116, which plays sound 2001), and the cases in a compare chain instead of a jump table. `PlayAnnounceSound` was compared case by case: the 115 shared report types play the same sounds. The icon and focus-star cases are display and were not compared one by one; nothing makes either extra report |
| `GetLicensePict @c0004`, `GetLicenseStrings @c0464` | the licensing (below); "Spaceward Ho! 3.0F2" in the serial line |

The text of every other table (STR#, DITL, MENU) is what `tools/extract/languages.py --mac301` already
reads; the code's literal pools differ only in these strings (checked pool by pool).

**Licensing, no game rule.** The French has `LicenseMasterApp @c015e`, `InsertMasterDisk @c0262`,
`LicenseThisApp @c037a`, `CreateLicensePict @c06a4`, `AddLicensePict @c07c6`, `SetNamedVolume @c00e0`
and the alias helpers (`_ResolveFileAlias`, `_GetAliasInfo`, `ResolveFolderAliases`), so a copy
written for its owner (`PICT` 4010, a licence stamp with a person's name and address: not a game
picture, not extracted, not quoted) can be personalised from a master disk. `GetLicensePict @c0004`
calls them in the French and is a stub in the English; it changes nothing in a game.

**Runtime and library (26)** are MPW's C library and start-up (`_doprnt`, `fwrite`, `_fsOpen` with the
alias resolving, `main`'s Gestalt tests, `_RTInit`, `signal`, `abs`, ...): different build, no game.

**What was left:** the first pass listed `GetReportString` +382 / `GetIconID` +344 /
`DetermineFocusStar` +126 as unexplained: they are the Reports window's chain of cases (above) plus the
Celsius arithmetic and the dead type 29; none plays. Nothing else in the 91 changes what a game does.

**What changed in the remake (November 2026), from the table above.** In a French 3.0.1 game, by default (patch off) and in
the mac3 and mac3c skins and wherever else 3.0.1 French shows: the Hall of Fame list's date (day / month / year), the battle
window's group lines (3.0.1F's formats and "un") with the names over the columns two pixels higher, the Ship Types window's
"Recycler tous", and the other-player rows at a star empty. The patch fills those rows (fix `frFleetRows`). The size-12 text, the
Force Turn Update item and the colour fallback are not differences the remake can show (their rows say why). The Details window's
date and the fleet reports keep the English forms in French, as the program prints them (the Details date) or as the remake words
every language (the reports: see the `MakeFleetDescription` row).

**Seen, not changed.** STR# 1020.12 and .16 are "%ème" and "%ème ex-aequo": a `%` followed by `è`, no `d`; what the program's
`_doprnt` prints for it was not read, so the remake's French rank ("4ème") is left as it is. The remake's English 3.0.1 reports
(and the French ones) word a fleet "3 Scouts" where `MakeFleetDescription` gives "3 Columbus (1/1) Scouts" (the `MakeFleetDescription` row).
