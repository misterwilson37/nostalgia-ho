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

## What else differs in the French program's code (beyond strings)

The English 3.0.1's fork (`app.rsrc`) and its decompile were not in the working area when this was
read (neither is in the repository), so the two programs' code could not be compared instruction
by instruction. What was done instead: the English routines' addresses and sizes in
`docs/coverage-301.md` (642 routines) against the French program's (590 named, 574 in common):
**91 routines differ in size** (most of the other named routines in common are the same size; the English list
also has unnamed library stubs). Read in the French code, and settled:

1. **Temperatures are shown in Celsius, by the formula of 1.2F and 4.0.5: CONFIRMED.** Five routines
   compute `(t + 720 - home - 324) x 5 / 9` (`move.l #$2d0 ... sub.l #$144 ... x5 ... LDIV(., 9)`, in
   tenths, truncated toward zero) where the English 3.0.1 keeps `t + 720 - home` in degrees
   Fahrenheit: `DrawPlanetRect @154bae` (the planet panel, "%d.%1.1d°C": T / 10 and |T| mod 10),
   `ExploreStar @a5556` (the exploring report's number, message 0x405), `GetReportString @1612bc`
   (the exploring report's text, 1000.29, with the gravity r / 100 and r mod 100 beside it),
   `MakeOneListedStar @1407ea` (a row of the Explored Planets list) and `MsgReactDetermineAllies
   @95722` (a computer's remembered liking of a player's "I like planets that are ..." message, in
   °C tenths; nothing reads that field afterwards, in either language, so it shows nowhere). The
   gravity is the English's (g x 100 / home g, hundredths). Before this was read it was LIKELY;
   the remake's French 3.0.1 already did exactly this (`js/engine.js` `cFormula`/`panelFormat`,
   `k: 324`). Those five routines are 24-30 bytes longer than the English's, as the added arithmetic would make them.
2. **A licensing scheme (Upgrade Editions' personalised copy), no game rule.** New in the French
   program: `LicenseMasterApp @c015e`, `InsertMasterDisk @c0262`, `LicenseThisApp @c037a`,
   `CreateLicensePict @c06a4`, `AddLicensePict @c07c6`, `SetNamedVolume @c00e0` and the
   `_ResolveFileAlias`/`_GetAliasInfo` helpers (the English has only a 34-byte `GetLicensePict @c0004`
   and `IsVolumeLocked`, `GetLicenseStrings`). `GetLicensePict @c0004` (called by `DoAppleMenu` and
   `DoStartupFileStuff`) returns at once when `PICT` 4010 is in the program; otherwise it asks for
   the master disk and writes the licence stamp as `PICT` 4010 into the copy. The stamp is the
   owner's name and address, so it is not reproduced; it changes nothing in a game.
3. **The Reports window has more**: `GetReportString` (+382 bytes), `GetIconID` (+344) and
   `DetermineFocusStar` (+126) are longer: the type 29 case above, the Celsius figure, and a
   different order of the cases (the exploring report's text is made at @1612bc, near the end of the
   French routine, where the English's is at @160b94, near its start). A different layout, so the French was
   not built from the very same object files; not by itself a difference in what the game does.
4. **Small size differences with no cause found yet (the English code is needed)**: `SpendTechMoney` +18,
   `DoOneBattle` +24, `DoBattleStage` -100, `CreateGalaxy` +26, `ReadGalaxyInfo` +38, `EndTurn` -12,
   `ColonizeStar` / `DecolonizeStar` -14, `BuildDesignShips` -12, `DoComputerTurn` -10, `AddToHall`
   -14, `FollowStarNameClick` -28, `SetCellsToNearbyStars` / `SetCellsToKnownStars` -20,
   `MakeFleetDescription` +20, `SetMenuItems` +10 and a score of routines within 2-8 bytes. Most
   of the small ones are the compiler's (a different layout moves a branch's size), but a rule change
   among them cannot be excluded without the English code. **Unsettled; each is to be read against the
   English routine when the English fork is available.** Until then the French game plays the
   remake's 3.0.1 rules, whose documented behaviour was read from the English program.
