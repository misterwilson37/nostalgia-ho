# Spaceward Ho! 3.0.1 French (3.0.1F)

The French Macintosh 3.0.1, found by Jake: `Spaceward3_FR.sit` (StuffIt), a folder "The Ho! 3 F ƒ"
with the program ("The Ho! 3 F", resource fork 788,904 bytes, 1 Dec 1993), its colour pictures
("Ho! 3.0 CPicts", 7 Sep 1993) and the folder's icon. **No manual** is on it, and no read-me.

- `vers` 1 and 2: 3.0.1, region 1 (France); "3.0.1, ©1990-93 Delta Tao, Inc. & Upgrade" (the
  publisher of 1.2F, Upgrade Editions, Paris). An official translation, not a fan one.
- The program's resources, as the English 3.0.1's (`docs/source-inventory.md`): `STR#` 30
  (English 29), `DITL` 95 (96), `DLOG` 42 (43), `ALRT` 52 (52), `MENU` 10 (10), `CNTL` 19
  (19), `CODE` 26, `PICT` 146, `ICN#` 129 (131), `ics#` 73, `snd ` 21. Nothing in it was run.

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
  3152 or 9993 in 3.0.1, and the remake's 3.0.1 shows no hints (`hints: false`, as in English; the
  French program has the 3100 list and 3170's icon, but nothing in it was run, so whether it
  shows them is not known), so none of these changes what a game shows.

## Manual

There's no manual on the disc. If one turns up (printed, or a scan), it would be the only
official French manual: the remake could offer it from 3.0.1's Help menu instead of "Manuel (en
anglais)".
