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

Reports (the version's report templates, its messages and alerts the rules send; each
counted once), from `node tools/lang-test.js --count`. "Official" includes lines carried
verbatim from another version's official translation of the same English.

| Version | Language | Official | The remake's | Names |
|---|---|---|---|---|
| Mac 1.2 | French (its own) | 57 | 2 (the patch's meteor report, a fleet waiting for fuel) | 1.2F's |
| Mac 1.2 | German (the remake's) | 58 (the German DOS 2.0's) | 1 (the credit line's number) + 4 the German 2.0 already had | the German DOS 2.0's lists |
| DOS 2.0, Mac 2.0.1 | German (official) | 58 | 4 (the German had them) | the German DOS 2.0's |
| DOS 2.0, Mac 2.0.1 | French (the remake's) | 56 (1.2F's; one line and two messages the iOS game's) | 3 | 1.2F's lists |

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
2.0's messages between players (strings 708-722), which the remake had left in English.

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

## What stays English, and why

The remake's own interface (its windows, buttons, menus, New Game, Preferences, the help
the remake wrote) stays English in every language, as it does for the official
translations: it isn't the version's text, and translating every window of
`js/skins/classic/ui.js` would put the remake's words in the original's mouth. What the
language system already carries is translated: the reports and the questions the rules
ask, the names, the hints, and the window words each version's rules hold (above).
