# Translations

Each version is offered in the languages it shipped in, from the official translations,
and in English, which is always there. Where a version had no translation, the remake
makes its own, and marks it so everywhere: in New Game's Language list and the Ho menu's
Language… (`HO.languageName`: "Français (traduction du remake)", "Deutsch (Übersetzung des
Remakes)", "Türkçe (yeniden yapımın çevirisi)"), and in the version's notes (About this
version, `js/version-notes.js`). This file says which text is official and which is the
remake's, version by version, and how the remake's was made.

## How a language works

`js/engine.js` (rs.languages, rs.lang, `inLanguage`, `say`) and `js/languages.js`:

- **Only words and names change.** The rules keep the version's own (English) words; the
  page puts a report in the game's language when it shows it (`HO.say`). Names are drawn
  from the version's own lists and then put in the game's language, entry for entry. So
  the same seed plays the same game in every language: `node tools/test.js <rules>
  --lang=<code> --digest` prints the English game's digests (the digest leaves out the
  language's code, `G.opts.lang`, with the messages and names).
- `rs.lang[code]` holds what a language changes: `say` (the reports, each `[the version's
  English, the translation]`, with `%s`/`%d` filled in order or by place, `%2$s`), the
  name lists (`starNames`, `maleNames`, `femaleNames`, `shipNames`), the hints
  (`hintTexts`), and the version's window words that the rules carry (`nameAStar`,
  `fixSpending.lines`, `battlePanel`, `options`, `exploredList`, `forceEndTurn`,
  `battleLines`). `remake: true` marks the remake's own translation; a report the remake
  wrote itself is marked `'remake'` (its third element), so it can be counted.
- A version whose own language isn't the rules' English keeps its reports as `rs.say`
  (1.2F's French: shown with no `G.opts.lang`).
- Names are translated only where an official list was made for the same English list,
  entry for entry. Computer names are not translations but other names in the same
  places (Peter → François → Tantek), so a version whose computer list differs keeps its
  English computers; star and ship names are matched by name.

**Checks:** `node tools/lang-test.js [rules ...] [--lang=<code>]` plays games in every
language and fails on a report left untranslated, a filling left in a translation, or a
name list or hint list that isn't entry for entry the version's own; `--count` prints the
counts below. `node tools/decency-test.js` passes every name in every language.

## Method

1. **Official, the version's own**: 1.2F's French; the German DOS 2.0 for DOS 2.0 and Mac
   2.0.1; iOS's and Android's French and Turkish.
2. **Official, the same English in another version**: a line whose English is the
   version's own, word for word (quotes, the "$" the number formatter writes and "%%"
   aside), is given that official translation verbatim, from the nearest version that
   has one. 1.2F's French carries forward to 2.0 (1.2's reports are 2.0's line for line);
   the German DOS 2.0 carries back to 1.2.
3. **The remake's own**: what no official translation says, translated in the voice of
   the nearest official one (its words for the game's things, its forms of address, its
   jokes), and marked.

Placeholders keep their order, or are given by place (`%2$s`) where the language's word
order needs it, as the official translations' slips were (`docs/ios-findings.md`,
"Languages"). Rules text is never invented: a line says what the English says.

## Counts

`node tools/lang-test.js --count`. **Lines** are the version's report templates, the
messages and questions its rules send, its first messages and the alerts the page shows
(each counted once; for 5.0.5, the Palm and iOS the hint list is among them, as it is in
their report list). **Hints** are the between-turn hints (`rs.hintTexts`), official /
the remake's. "Official" includes lines carried verbatim from another version's official
translation of the same English, and lines whose English differs from an official one
only by the version's own slip (`EQUIV`); "the remake's" are the lines marked `'remake'`
(`js/lang-remake.js`, and the few in `js/languages.js`).

| Version | Language | Lines, official | Lines, the remake's | Hints |
|---|---|---|---|---|
| Mac 1.2 | French (its own) | 57 | 3 | – |
| Mac 1.2 | German (the remake's) | 54 | 6 | – |
| DOS 2.0 | German (official) | 54 | 5 | – |
| DOS 2.0 | French (the remake's) | 56 | 4 | – |
| Mac 2.0.1 | German (official) | 54 | 5 | – |
| Mac 2.0.1 | French (the remake's) | 56 | 4 | – |
| Mac 3.0.1 | French (the remake's) | 119 | 13 | – |
| Mac 3.0.1 | Turkish (the remake's) | 111 | 21 | – |
| Mac 3.0.1 | German (the remake's) | 30 | 102 | – |
| Windows 4.0.5 | French (the remake's) | 163 | 33 | 22 / 4 |
| Windows 4.0.5 | Turkish (the remake's) | 152 | 44 | 22 / 4 |
| Windows 4.0.5 | German (the remake's) | 31 | 165 | 0 / 26 |
| Mac 4.0.5 | French (the remake's) | 180 | 33 | 23 / 4 |
| Mac 4.0.5 | Turkish (the remake's) | 168 | 45 | 23 / 4 |
| Mac 4.0.5 | German (the remake's) | 31 | 182 | 0 / 27 |
| 5.0.5 | French (the remake's) | 250 | 27 | 35 / 5 |
| 5.0.5 | Turkish (the remake's) | 240 | 37 | 35 / 5 |
| 5.0.5 | German (the remake's) | 25 | 230 | 0 / 40 |
| Palm OS 5 | French (the remake's) | 247 | 31 | 33 / 7 |
| Palm OS 5 | Turkish (the remake's) | 237 | 41 | 33 / 7 |
| Palm OS 5 | German (the remake's) | 25 | 231 | 0 / 40 |
| iOS 1.2.9 | French (official) | 201 | 0 | – |
| iOS 1.2.9 | Turkish (official) | 201 | 0 | – |
| iOS 1.2.9 | German (the remake's) | 25 | 227 | 0 / 39 |
| Android 1.2.8 | French (official) | 201 | 0 | – |
| Android 1.2.8 | Turkish (official) | 201 | 0 | – |
| Android 1.2.8 | German (the remake's) | 25 | 227 | 0 / 39 |

Names, besides: 1.2F's French lists (1.2's own; carried to 2.0's French), the German DOS
2.0's lists (2.0's own; carried to 1.2's German, and to 3.0.1's and 4.0.5's lists that
are 2.0's), iOS's lists (iOS's and Android's own; carried to 5.0.5 and the Palm, whose
lists are the same, and to the Mac 4.0.5's ships); stars everywhere by name from the
nearest official list. Window words: Name a Star, Fix Spending, the battle window,
4.0.5's won window and Armageddon questions, 1.2's and 2.0's Options menu and Explored
Planets list, Mac 2.0.1's Force End Turn (the counts above leave them out; they are said
in each version's section).

## Mac 1.2 (French, as released)

1.2F's reports (STR# 1000), battle window (STR# 1030) and Fix Spending (STR# 1050) are
shown in its French; until now the remake gave them in Mac 2.0.1's English. The English
is still offered (Mac 2.0.1's own words, `docs/12-findings.md`, "English"). Two lines say
less than the English: the scrapped fleet (1000.17, no metal) and a battle's lost ships
(1030.0, no count); they are shown as they are.

**German (the remake's):** the German DOS 2.0's reports, names, battle window, Name a
Star and Fix Spending, which are 1.2's line for line (1.2's star list is 2.0's and
Tiber). The remake's own: 1.2's credit line (2.0's German with "1.2"), the note under
Name a Star's field, the Options menu (Kampfgeschwindigkeit…, Ereignismeldungen zeigen,
Gemeldete Kämpfe zeigen, Berichtsfenster) and the Explored Planets list's title and
button (its classes are the German table's 144-147). The battle window's two lines the
German table has swapped are in their places.

## DOS 2.0 and Mac 2.0.1

**German (official):** as before (`docs/dos-findings.md`, "Languages"), and now also
2.0's messages between players (strings 708-722) and the Explored Planets list's classes
(144-147), which the remake had left in English, and the remake's line for a turn with
no news.


**French (the remake's):** 1.2F's text, which is 2.0's line for line: the reports by
string id (1.2F's line = id − 671), the battle window, Fix Spending, the classes, the
computer and ship names (1999-2004; 1.2F's women's names too, which 1.2 never drew),
the Name a Star window, the Options menu and the Explored Planets list. A report's
numbers are "1 234". Where 1.2F says less than 2.0's English, the iOS game's line for the
same English is used (the scrapped fleet's metal, Report Window Templates 18), and the
free-text messages are iOS's ("%s dit: %s", "Votre message à %s: %s"). The remake's own:
2.0.1's credit line (1.2F's with its number), the patch's meteor report ("Une pluie de
météores a détruit votre colonie à %s.", 1000.10's and 1000.54's words), a fleet waiting
for fuel, Mac 2.0.1's Force End Turn question and the polling time's window.

## 5.0.5 (Mac and Windows)

**French and Turkish (the remake's), backwards from iOS.** The iOS game is 5.0.5's code
and text: its 159 report templates, 39 alerts and name lists are 5.0.5's entry for entry
(quotes, the "$" its number formatter writes, "%%" and the "¥ª" for "•™" aside; three
alerts end "!!" where 5.0.5 has "…"), and its hints are 5.0.5's but for the mouse. So
every line whose English is 5.0.5's is iOS's translation, verbatim, as the iOS game reads
it (`docs/ios-findings.md`, "Languages": the fillings given their places, the French
temperatures in °C). The names are iOS's lists (5.0.5's computers, ships and stars are
the same English lists; only the Turkish changes two stars, Sol → Güneş and Hope →
Ümidini, and Hope is in 5.0.5's list only as a named star). Tech names and the classes
are iOS's words; "Your %s technology just jumped" gets the techs' own names from iOS's
lines (French Misc Strings 3-6 and report 7's "Miniaturisation"; Turkish reports
142-146's, its Misc Strings 3 "Dizi" being another sense of "Range"). The battle window is
iOS's words (sprintf Templates 9-14). Name a Star is iOS's (Misc Strings 74, Alert
Strings 9).

The remake's own (`js/lang-remake.js`), in iOS's words:
- 5.0.5's own lines: its three first messages and five hints written for the mouse (click, the clock,
  the contextual menu, the option key, option-drag, the graph), the fuel alert's "no
  arrows on either end of the dragged line", the Evacuate questions for a profitable
  colony and the Palm's "Ship" (Full Hoedown), the Radical Research window's three
  projects 5.0.5 added (the remake's English for them, in iOS's words for their reports),
  and the remake's "Year %d. Nothing much happened.".

- Lines the iOS translation got wrong, given right in the remake's languages (iOS keeps
  its own): French 37 ("You %savez perdu une bataille à%s…", the counts out of place);
  Turkish 11 ("lost" left in English), 14 (says the colony now does *not* belong to the
  rebels' new master), 35 (the exploring report's "inceledin" for "colonized"), 38 (the
  star and the attacker run together, the attacker's losses left out), 62 (the star lost),
  124 (a second copy of 123), 156 ("can no longer reach us"), and the credit lines iOS
  left in English with a "!" in front.
- The French "et vos alliés" gets the space its lines need ("Vous%s avez perdu" read
  "Vouset vos alliés avez").

The remake now gives the alerts the page shows from 5.0.5's list (the gifts, the
assembly lines, surrender, Armageddon, the many-scouts warning, the fuel alert) through
the language, so iOS's French and Turkish show them too.

## Palm OS 5

**French and Turkish (the remake's), backwards from iOS**, as 5.0.5's: the Palm's
reports are 5.0.5's as it words them (`rules-palm` msgTextPalm), so iOS's lines serve for
all of them but its decoy report (4.0.5's, "Your ship technicians have designed a decoy
ship…": the remake's) and its two slips ("Your scientist have figured out how to
prevent", "wierd": iOS's lines for 157 and 158 all the same). The remake's own: its 7
hints of its own (the Ship Info window, the Galaxy screen's menus, the Enemies and
Allies screen…), its first messages (the G, $ and H buttons; "Palm OS version by…"),
Name a Star's buttons (Cool! → "Cool !", "Süper!"; Nevermind → "Laisse tomber", "Boşver";
the title is iOS's "Félicitations!" / "Tebrikler!", the Palm's "Congratulation!" being a
slip) and its battle window's words ("N Class (W/S)", with iOS's class names; "détruit(s)",
1.2F's word, and "habitants"; "ölü", "insan"). The names are iOS's lists; the stars are
matched by name (the Palm's "Courasant" for Antares has no translation).

## 4.0.5 (Windows and Mac)

**French and Turkish (the remake's), backwards from iOS.** 4.0.5's lines are listed in
`js/languages.js` (`TEXT405`: its reports, messages and questions as the program writes
them, double spaces and all), with its hints, first messages and the engine's own lines.
Most are 5.0.5's words, so they get iOS's lines; where 4.0.5's English is 2.0's (the
battle reports without "and your allies", "You have abandoned …", the scrapped fleet),
the French gets 1.2F's line for it. A few lines differ from an official one only by a
slip of the version's ("You alliance with", "with with", "puts it in your reserve",
"armadeddon"): they get that line's translation (`EQUIV`), counted as official. Tech
names are iOS's, matched by name (two typos aside); the battle window is 2.0's with
1.2F's words and iOS's classes (the Turkish the remake's); Name a Star and the won
window ("You have conquered the galaxy!") are 1.2F's in French.

The remake's own: Armageddon's two questions (the eleven jokes, strings 299-309, now
also asked in the language: `rs.armageddonAsk`), the Windows build's own curse in the
messages, the battle reports' colony lines in 4.0.5's form (no "and your allies"), the
"ship money" lines, the welcome lines and credits, the fleet marked for scrapping, a
handful of hints ("A dot by a planet…", "Good planets are close to 72 degrees.", "Ship
savings…"; the French ones iOS's own words where iOS's French had already said just
that), the Send Message groups (Everyone, Your Allies, Your Buddies), and the Turkish
for the lines whose only official translation is 1.2F's French.

## 3.0.1

**French and Turkish (the remake's)**, as 4.0.5's: 3.0.1's lines (`TEXT301`), the
engine's, its Send Message window's (5.0.5's words) and its first messages get iOS's
lines where the English is the same, and 1.2F's where it is 2.0's: Name a Star's text,
field, note and alert (Mac 2.0.1's window, DITL 4050 and 3340 in 1.2F), and Fix
Spending's four lines (Mac 2.0.1's, 1.2F's STR# 1050). The remake's own: Name a Star's
rule (3.0.1 takes 2 to 7 letters, 1.2F's line says 4 to 7), the battle reports' colony
lines in 3.0.1's form, "ship money", the credit line, and the Turkish for the Name a Star
and Fix Spending windows, which only 1.2F's French has.

## German for 3.0.1 onward (the remake's): 3.0.1, 4.0.5, 5.0.5, the Palm, iOS and Android


Forward from the German DOS 2.0 (`HO.PRS`, `DOSHO.EXE`), the one official German after
1.2: its lines wherever a later version's English is 2.0's (the battle reports, "You have
colonized", the tech levels, the debris, Name a Star's window and alert, Fix Spending),
and for the rest the remake's German in its voice, `js/lang-remake.js` `de`: "Sie", the
reports in the present tense ("Ihre Flotte von %s erreicht %s.", "Sie verlieren %d
Schiffe."), its words (Reichweitentech, Tempotech, Waffentech, Schildtech, Minitech;
Späher, Kampfschiff, Kolonieschiff, Satellit; Funkspruch for a message; verschrotten;
Meteoritenschauer; "Glückwunsch!"), its numbers ("1.234") and its battle window
(Kampfbericht, "%d %s besiegt", "%s Tote"). Where the DOS German has a line for the same
alert, its words are used (3330, the fleet out of fuel, "keine Pfeilspitzen"; 3310, the
battle record gone; 3280, the yards full; 5040, "Sie haben die Galaxis erobert!").

The remake's own words for what 2.0 hadn't: the classes Schlachtschiff (Dreadnought),
Tanker, Bioschiff (Biological), Täuschschiff (Decoy); the tech names (Volltanken,
Fusionsmeiler, Gelb getupfter Bikini, Schon da, Gestern-Antrieb, +5 rostfreies
Vorpalschwert…, the jokes kept); Radikalforscher; Bündnis, Verbündete, beste Kumpel;
kapitulieren; Armageddon-Maschine; räumen for 5.0.5's Evacuate (2.0's "verlassen" stays
for 3.0.1's and 4.0.5's Abandon). The jokes keep their star: "Willst du wahrhaftig alle
Hope fahren lassen?" (Dante's "Lasst alle Hoffnung fahren", on a star still called
Hope), "Ship verlassen? Alle Mann von Bord!". The alerts are those the page shows (5.0.5's
network and registration alerts are never shown and stay untranslated). The names: the
stars by name from the German DOS 2.0's list; a computer or ship list only where it is
2.0's list (3.0.1's Scouts, Colony Ships and Satellites, 4.0.5's Colony Ships and
Satellites); 5.0.5's computers and ships stay English. iOS and Android get the same German
for their own English (iOS's lists), with the remake's lines for their touch hints and
alerts; their help page stays English (`js/help.js` has French and Turkish only).


## Turkish suffixes

iOS's Turkish puts a fixed suffix straight after a name ("%sye", "%sde", "%syi",
"%snin"), whatever the name's last vowel, so "Argotye", "Polluxyi"; the iOS patch's fix
'trLostWord' keeps that. The remake's Turkish does the same, so its lines read like the
official ones around them; a suffix that agreed with each name would need the name's
vowels in every report, which no official line does.

## What stays English, and why

The remake's own interface stays English in every language, as it does for the official
translations: it isn't the version's text, and putting all of `js/skins/classic/ui.js`
into French, Turkish and German would put the remake's words in the original's mouth.
What the language system carries is translated: the reports and questions the rules
send, the alerts the page shows from 5.0.5's list, the names, the hints and the window
words each version's rules hold. What stays English:

- **The remake's windows and menus**: New Game, Preferences, the Ho, Game and Galaxy
  menus, Saved Games and Account, the toasts ("That project has been cancelled."), the
  remake's own Evacuate question for 3.0.1 and 4.0.5 ("Evacuate %s? Your colonists will
  leave; satellites stay."), the help the remake wrote, About this version and its notes.
  They are the remake's, in its own English.
- **The versions' window words the rules don't carry**: the Send Message window's labels
  and prompts ("I Want", "Saying What?", 3.0.1's and 4.0.5's `cannedChat`), the Hall of
  Fame's ranks and columns, the Technology window's names, the planet and fleet panels,
  4.0.5's "End Turn and Switch Players". They are drawn by the skin from its own words or
  the version's English; translating them would mean translating the skin.
- **The 2.0 German's Options menu, and the Explored Planets list's title and button**
  (DOS 2.0 and Mac 2.0.1): the German table has no words for them (the list's four
  classes are its strings 144-147, now used), so they keep 2.0's English; the remake's
  German 1.2 has them in its own German.

- **Help pages**: only iOS and Android have them in French and Turkish (their own); every
  other version's manual is English.
- **5.0.5's network and registration alerts** in German (never shown by the remake).
- **The pictures**: words drawn in the art (1.2F's "Fin Tour", the title pictures).

## Choices worth checking

- iOS's own slips are kept in iOS's languages (as released) but put right in the
  remake's: French 37; Turkish 11, 14, 35, 38, 62, 124, 156 and the credits. Other
  official lines that are clumsy but say the right thing are used verbatim (French 20's
  "Votre flotte de Type…", Turkish "Sizin Düşmanları", "1yi kaybetti").
- 1.2F's battle window counts no ships lost ("%.*s détruit(s)") and its scrapped-fleet
  report has no metal: shown as they are for 1.2, and for 2.0 the scrapped fleet is iOS's
  line, which has it.
- Lines matched by their English with the last stop set aside take the official line's
  stop: 5.0.5's "…" in "Dorothy… Kansas anymore…" shows iOS's "?" in French.
- German: 5.0.5's Evacuate is "räumen" and 3.0.1's and 4.0.5's Abandon "verlassen"
  (2.0's word); Dreadnought "Schlachtschiff", Biological "Bioschiff", Decoy
  "Täuschschiff"; the Hope joke keeps the star's English name.
