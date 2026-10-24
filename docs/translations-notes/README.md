# Translating the long English texts

`docs/translations.md`, "What stays English", lists the long documents the remake
leaves in English. This folder is the work of translating them, one language at a time,
as drop-in files. **Done: French, German, Spanish and Turkish (notes and all four manuals each).** Next: the Turkish suffix patches (HANDOFF); a native
reader for any language.

## What is translated

| Text | Where it comes from | Where it shows |
| --- | --- | --- |
| Version notes | `js/version-notes.js` (`HOVERSIONS`: intro, quirks, differs, missing, changes, Delta Tao's change lists and their source line) | Ho menu, About this version |
| Patch notes | each ruleset's `rs.fixes` (title and text) | Ho menu, Patch notes |
| Two suffix lines | `ui.js`, after a quirk the patch fixes | About this version |

361 source lines (290 + 65 unique, plus Delta Tao's headings) and the two suffixes: 363 rows.
Lines repeated across versions are one row.

## How a language is added

1. `node docs/translations-notes/work/extract-notes.js` and `extract-fixes.js` (run from
   the repo root, after the temp paths in them are set) list the source lines;
   `work/source-lines.json` is the list this French was made from, with a number per line.
2. Translate into `work/<code>-N.tsv`, one `number<TAB>translation` per line.
3. `python3 work/build.py <code>` checks every line is there and its `%s`/`%d` fillings
   match, and writes the rows; `python3 work/assemble.py <code>` writes
   `js/ui-text-notes-<code>.js` (add the language's header text to `assemble.py` first).
4. `node tools/notes-check.js --lang=<code>`.

The numbers in `source-lines.json` are only as good as the notes were when it was made:
the checker, not the numbers, is what catches drift.

## Voice and words

As `docs/translations.md`: French "vous"; German "Sie"; Turkish "sen"; Spanish "tú". A word
an official translation has is used (1.2F's French lists, the iOS game's French and Turkish,
the German DOS 2.0, the Spanish glossary); the rest is the remake's own. Typography follows
the existing rows: a plain space before `: ; ? !` in French, curly quotes and apostrophes,
numbers with a plain space ("2 147 483 $"), the game's own "$12.345M" kept.

### French glossary used

| English | French | Source |
| --- | --- | --- |
| ship, fleet, star | vaisseau, flotte, étoile | iOS, 1.2F |
| Scout, Colony Ship | Éclaireur, Transport | iOS, 1.2F classes |
| Fighter, Dreadnought | Croiseur, Épouvante | iOS, 1.2F classes |
| Tanker, Biological, Decoy | Tanker, Biologique, Leurre | iOS |
| Range, Weapons, Shields, Mini, Radical | Distance, Armes, Boucliers, Miniaturisation, Radicaux | iOS |
| Evacuate, Abandon | Évacuer, Abandonner | iOS, 1.2F |
| scrap | recycler | 1.2F |
| Savings, Ship Savings | Épargne, Épargne des vaisseaux | iOS ("argent des vaisseaux") |
| Hall of Fame / Shame | Panthéon / Mur de la honte | ui-text.js |
| End Turn | Fin Tour | 1.2F |
| Organize Fleets | Organiser Flottes (and Organiser Vaisseaux, the Windows name) | ui-text.js; the second is mine |
| master points | master points / Master Points | ui-text.js |
| meteor shower | pluie de météores | 1.2F |

### Choices worth checking (nobody has read the French as a native)

- **Design** (a ship design) is "modèle": my word, no official one found.
- **"Let 'em die"** (DOS 2.0's warning for a colony left unfunded) is "Laissons-les mourir": mine.
  No official French has it.
- **The Hope joke** quotes the iOS French line ("Voulez-vous vraiment laisser tomber ? Tout n'est pas
  encore perdu…", hyphen added). The Dante pun doesn't carry in French; the official line doesn't try.
- **"Loser"** is "Perdant" (as the French menus show it).
- **Tech names in the notes** ("Pile à Fusion", "Réservoirs Supplémentaires") are iOS's.
- **"Carbonized"** (Delta Tao's pun) became "est passé à Carbon".
- The Delta Tao source line names the manual chapter “Changes From Previous Versions” in its English title, with “(en anglais)”.

## The manuals in French (done)

All four manuals the game links are translated: **5.0.5** (561 text runs, 33 pages), **4.0.5** (565 runs, 72 pages),
**3.0.1** (519 runs, 35 pages) and **2.0-dos** (403 runs, 28 pages), as `assets/manuals/<folder>-fr/`.
`assets/manuals/2.0-windows/` is linked from nowhere and was left out. The DOS 2.0 PDF and the scanned 3.0 PDF are not
translated (pictures of paper).

How: `tools/manuals/translate/manualtr.py` reads a manual's pages, finds each run of words between block tags, and swaps
each tag inside a run for a marker (`{a1}...{/a1}`, `{img2/}`); a translator keeps the markers and the rebuild puts the
tags back. Every run of the English is in `docs/translations-notes/manuals/<folder>/segments.json` (numbered); the French
is `fr-*.tsv` beside it (`number TAB French`). Pictures and the stylesheet are *linked* from the English folder, not copied,
and each French page ends with a line saying it is the remake's translation, linking its English page.

    python3 tools/manuals/translate/manualtr.py extract 5.0.5          # numbers the runs
    python3 tools/manuals/translate/manualtr.py build 5.0.5 fr         # checks every run + marker, writes 5.0.5-fr/
    python3 tools/manuals/translate/manualtr.py build 5.0.5 fr --check # same, written to /tmp instead

`build` refuses a missing run, a run for no number, or a translation whose markers differ from the English's. If a manual's
English pages change, `extract` gives new numbers: re-number the tables (or ask what changed, `build` names what is missing).
Before translating anything, every page of all four manuals was rebuilt with "translation = English" and compared with the
original (text, tags, links, pictures): 168 pages, no difference.

**Text the manuals share was translated once.** The 5.0.5 manual first; the later manuals reuse its French, and the French
notes', wherever the English is the same (about 40% of the 3.0.1 manual), with the markers re-placed by script and every
reused run checked by the same marker test. Where the English differed slightly, the closest French was adapted by hand.

### French choices in the manuals (nobody has read them as a native)

- Menu and window names are the game's own French (`js/ui-text.js`): "Galaxie", "Vaisseaux", "Fenêtre", "Organiser flottes…",
  "Corriger les dépenses", "Puiser dans l’épargne…", "Panthéon", "Mur de la honte". Ones the game does not have (the DOS 2.0 menus
  such as "Toujours revoir les batailles", or "Créer un nouveau type de vaisseau") are my wording of the English.
- Ship classes as in the notes: Transport, Éclaireur, Croiseur, Épouvante, Tanker, Biologique, Leurre; Distance, Vitesse, Armes,
  Boucliers, Mini(aturisation), Radicaux; "Épargne (des vaisseaux)".
- Book and game titles keep their English name; the book titles have a French title in brackets (Winnie l’Ourson, Calvin et Hobbes).
- A US phone number or an AOL / CompuServe / GEnie line (4.0.5 customer support) is translated as it stands: 1996 information.
- The glossary of the 4.0.5 help is typeset line by line in the original; the French keeps its lines (broken at a natural place),
  and its terms stay in the English alphabetical order, not French's.
- The 5.0.5 "Custom Galaxies" page has a stray `|` after a quotation mark (a Word-export leftover); dropped. The English
  "Ouput" typo in the same page is just "Avant-poste" in French.
- Screenshots and the cover scans show English menus; nothing can be done about those.

## German (done: the version notes and patch notes)

`js/ui-text-notes-de.js`: the same 363 rows as the French, in German: "Sie", the German DOS 2.0's words where it has them,
the remake's German (`js/lang-remake.js`) for the rest, the game's own German menu names ("Ausgaben anpassen", "Flotten ordnen",
"Ersparnisse anzapfen", "Ruhmeshalle", "Halle der Schande", "Meisterpunkte"), the classes (Späher, Kampfschiff, Kolonieschiff,
Schlachtschiff, Tanker, Bioschiff, Täuschschiff), „ “ quotes and numbers as "1.234". `node tools/notes-check.js` checks it.
Seen in a real German game (About this version and Patch notes, 4.0.5 with the patch on): all German, no English line.

German choices nobody has read as a native: **"Sollen sie doch sterben"** for DOS 2.0's "Let 'em die" warning (the German DOS has no line
for it, so it is mine); **"Terraformen / Abbauen"** for the Terraform and Mine bars (the game's own labels are the abbreviations
"Terra." and "Met."); **"Schiffsersparnisse"** for Ship Savings; "Radikaltech" after the remake's Reichweitentech, Tempotech, ...; the
Delta Tao change lists are the remake's translation of their English and the window says so ("auf Englisch").

## The German manuals: all four translated

| Manual | Runs | German | Pages built |
| --- | --- | --- | --- |
| 5.0.5 | 561 | 561 | **not yet** (English pages not in the zip this was done from) |
| 4.0.5 | 565 | 565 | **not yet** (same reason) |
| 3.0.1 | 519 | 519 | `assets/manuals/3.0.1-de/`: 35 pages, 0 broken links (English has 0 too) |
| 2.0-dos | 403 | 403 | `assets/manuals/2.0-dos-de/`: 28 pages, 0 broken links |

Every table passes `helper-checkpart.py` (0 problems) and `manualtr.py build <folder> de` (every run and marker accepted).
**For 5.0.5 and 4.0.5 run the build in the repo**, where the English pages are:

    python3 tools/manuals/translate/manualtr.py build 5.0.5 de
    python3 tools/manuals/translate/manualtr.py build 4.0.5 de
    python3 tools/manuals/translate/helper-linkcheck.py 5.0.5-de      # expect the English 5.0.5's Word-export leftovers only
    python3 tools/manuals/translate/helper-linkcheck.py 4.0.5-de

As was done for the French, rebuild with "translation = English" first if you want proof that nothing but the text differs; that
check was not possible here. The pages that were built (3.0.1-de, 2.0-dos-de) were built from the English pages in this archive.

How the tables came about: `5.0.5/de-0.tsv` (45 runs seeded from the German notes) plus `de-1` to `de-6` by hand; the other three
got the text they share with 5.0.5 reused first (exact matches 35 / 48 / 23 for 4.0.5 / 3.0.1 / 2.0-dos, then markers re-placed by
script 41 / 101 / 36) and the rest by hand (`4.0.5/de-1..4`, `3.0.1/de-1..3`, `2.0-dos/de-1..4`).

Two things that differ from the instructions this README had before:

- **`helper-autoreuse.py` and `helper-autoreuse2.py` wrote `fr-0c.tsv` / `fr-0d.tsv` whatever `LANG_CODE` was.** Run for German as the
  old instructions said, they would have overwritten the French reuse tables of 3.0.1 and 2.0-dos with German, and for 4.0.5
  made a German `fr-0c.tsv` that stops the French build ("translated twice"). They are fixed (version 1.0.1: the file is now
  `<LANG_CODE>-0c.tsv` / `-0d.tsv`) and were run only after that; every `fr-*.tsv` was checked unchanged afterwards (md5).
- **The `de-0.tsv` seed tables in the zip were empty** (0 bytes) although this README said they held 66 runs. They were re-seeded
  with `helper-seedde.py` from the German notes: 46 runs (45 in 5.0.5, 1 in 3.0.1). The 20 the old count included came from the hover
  help (`js/ui-text-help.js`), which was not in the zip; they were translated by hand with the rest. **Do not re-run
  `helper-seedde.py` now**: it skips every id any `de-*.tsv` has and then overwrites `de-0.tsv` with only the rest, which would
  delete the 46.

### German choices in the manuals (nobody has read them as a native)

The game's own German menu text (`js/ui-text.js`, `js/lang-remake.js`) was **not in the zip**, so the names below are
mine except where the German notes already used one ("Ausgaben anpassen", "Flotten ordnen", "Ruhmeshalle", "Räumen",
"Galaxis erstellen", "Verlaufsdiagramm", "Funkspruch" ...). **Compare them with the game's strings before building the other
manuals**, and fix 5.0.5's rows to match if they differ:

- Menus and items: Einstellungen…, Kämpfe ansehen, Kampf bei Proxima ansehen, Ereignismeldungen anzeigen, Aber nur die wichtigsten,
  Geschwindigkeit der Kampfansicht, Stapel schießen gemeinsam, Vollanimierte Kämpfe, Jeden Zug automatisch sichern, Chat-Stichwörter
  vertonen, Automatisch spielen…, Schiffe bauen…, Schiffe bauen/entwerfen…, Aktuelle Flotte auflösen, Schiffstypen verschrotten,
  Alle Flotten auflisten…, Zur Flotte, Alle erforschten Sterne auflisten…, Zum Stern, Hineinzoomen, Herauszoomen, Info anzeigen,
  Neues Spiel, Erstellen; menus Ablage (the Mac's German "File"; the Windows manuals would say "Datei"), Galaxie, Schiffe, Fenster, Optionen.
- Create Galaxy options: Heimatsystem des Spielers / des Computers, Anzahl der Computerspieler, Computer-IQ, Computer als beste
  Freunde, Galaxieform / -größe / -dichte, Jahre pro Zug; values Normal, Reichlich (Abundant), Blühend (Thriving), Außenposten
  (Outpost), Dumm / Schlau, Riesig (Humongous), Ring, Haufen, Spirale, Zufall, Gitter, Sechseck.
- Mac German words: Einblendmenü (popup menu), Wahltaste (option key), Befehlstaste (command key), Systemordner, Startvolume;
  "Schieberegler" for what the English calls scroll bars where they are sliders.
- Game terms as in the notes: Späher, Kampfschiff, Kolonieschiff, Schlachtschiff, Tanker, Bioschiff, Reichweite, Tempo, Waffen, Schilde,
  Miniaturisierung, Radikaltech, (Schiffs-)Ersparnisse, Meisterpunkte. "Technik" for tech ("Waffentechnik", "Technikausgaben").
- Money: "10.000 $", "15 %", "6 Billionen $" (a US trillion is a German Billion), decimals with a comma ("1,46 G"), "72°" as it is.
- Per manual: **5.0.5 and 3.0.1 are the Mac manuals** (menu "Ablage", Befehlstaste, Wahltaste); **4.0.5 and DOS 2.0 use "Datei"**
  and "Strg" where the English says File and Ctrl (the DOS 2.0 text is a dump of the Mac manual and says "Mac" and "System 7" in
  places; those stay). "Abandon" is **"verlassen"** in 4.0.5 and 3.0.1 and **"räumen"** in 5.0.5 (as the notes' HANDOFF says).
- 3.0.1 and DOS 2.0 name the Create Galaxy options "Map Style" and "Computer Skill": **"Kartenstil"** and **"Computerstärke"**
  (4.0.5: "Galaxiestil", "Computerintelligenz"; 5.0.5: "Galaxieform", "Computer-IQ"). Computer players are "dumm" / "schlau".
- "Sending Messages" is **"Funksprüche senden"** and the dialog "Funkspruch senden…" (the notes' word); "Master Points" **"Meisterpunkte"**;
  "Fix Spending" **"Ausgaben anpassen"**, "Dip Into Savings" **"Ersparnisse anzapfen"** (the game's own); 4.0.5's "Group Shoot Together" is
  **"Gruppen schießen gemeinsam"** and 5.0.5's "Piles Shoot Together" **"Stapel schießen gemeinsam"** (as written in each English).
- The printed 3.0.1 page references ("on page 41") became "auf Seite 41" / "(S. 41)" and still point at the printed manual's pages.
- The legal text of the 4.0.5 help says it may not be translated without consent; it is translated faithfully, and the page's own
  footer says the German is the remake's unofficial translation (as the French).
- **"Game Host"** is "Spielgastgeber" (mine); **"Bonehead"** is "Volltrottel"; **"Strip-Mine"** is "Raubbau"; the manual's address, phone
  and e-mail lines stay as they are.
- Book titles keep the English with a German title in brackets. "Das Tao von Pu dem Bären" and "Der Macintosh-Weg" are my wording.
  **"Sie belieben wohl zu scherzen, Mr. Feynman!"** is the German edition's title as I remember it, not checked.
- The spoken sound lines ("Hyaa!", "Whoa!", "Check this out!") stay English; they are what the game says aloud.
- The glossary keeps the English alphabetical order (as the French did), not German's.
- The stray `|` after a quotation mark in the 5.0.5 "Custom Galaxies" page is dropped, and the English typo "Ouput" is just
  "Außenposten" (as in the French).

### Folded and finished (Professor Pamplemousse, after Admiral Apfelstrudel)

- **5.0.5-de and 4.0.5-de are built** (the German Claudling had the tables but not the English pages to build from); all four German
  folders pass the link check (5.0.5's 34 Word leftovers are the English's own) and match a fresh build.
- **The manuals' menu and window names now match the game's German** (`js/ui-text.js`): 51 names changed inside their markers, e.g.
  "Galaxie" → "Galaxis" (the menu), "Ablage" → "Datei", "Automatisch spielen" → "Autospiel", "Herauszoomen" → "Verkleinern",
  "Spieler vergleichen" → "Spielervergleich". Left on purpose: four chapter titles and one ordinary word ("feindlich"). The French
  manuals already matched (143 of 143). The check: `/tmp/uiaudit.py`-style, now `tools/manuals/translate/helper-uiaudit.py <code>`.
- **Wired:** step 3 of the integration page now gives every version's Help entry `en`, `fr` and `de` in one edit (the old step 3b is
  folded in); tested in Chromium for 7 versions in German, French and English.


## Spanish (done: the notes and all four manuals)

**Notes:** `js/ui-text-notes-es.js`, the same 363 rows, Spanish in the last column (`[English, null, null, null, Spanish]`; the other three files
put theirs earlier, and `work/assemble.py` now writes the right column order in its header comment). Voice and words as `docs/translations.md`,
"Spanish glossary" ("tú"; Explorador, Caza, Nave colonia, Acorazado, Cisterna, Bionaves, Señuelo; Alcance, Velocidad, Armas, Escudos,
Miniaturización, Radical; "Ahorros de naves"; abandonar (3.0.1, 4.0.5) / evacuar (5.0.5); desguazar; lluvia de meteoritos), the game's own menu words
(`js/ui-text.js`: "Corregir los gastos", "Tirar de los ahorros", "Organizar flotas", "Salón de la Fama", "Salón de la Vergüenza", "puntos
maestros"), the tech names from `js/lang-remake.js` ("Pila de fusión", "Llenar el depósito"), curly quotes “ ”, numbers "1.234", money as
"$2.147.483" and "$12.345M" (the dollar sign first, as the game's panels have it), percentages without a space ("15%"), a trillion as "billón".
`node tools/notes-check.js --lang=es` passes.

**Manuals:** tables `manuals/<folder>/es-*.tsv` (561 / 565 / 519 / 403 runs, 0 problems from `helper-checkpart.py`, every run and marker accepted by
`manualtr.py build <folder> es`); built to `assets/manuals/<folder>-es/` (33 / 72 / 35 / 28 pages), `lang="es"`, 0 broken links except the 34 Word-export
leftovers 5.0.5's English has too. 5.0.5 was translated first by hand; the later manuals got `helper-seedde.py es` (66 runs from the Spanish notes and
the hover help: **do not re-run it**, it would overwrite `es-0.tsv`), `helper-autoreuse.py` (33 / 47 / 22 exact) and `helper-autoreuse2.py`
(35 / 99 / 34 with markers re-placed), then the rest by hand. `LANG_CODE=es` must be set for the two autoreuse helpers. `helper-uiaudit.py es`:
142 of 143 menu and window names match the game; the one left is a chapter title ("The Bar Charts" is "Los gráficos de barras", the game's tooltip
word is "Las barras"). **Not seen in a game or a browser.**

### Spanish choices (nobody has read them as a native)

- **Menus and windows** are the game's own Spanish (Archivo, Galaxia, Naves, Ventana, Opciones; Preferencias…, Revisar las batallas, Juego automático…,
  Dar dinero/metal…, Evacuar, Desguazar la flota actual, Frecuencia de consulta). Where the game has no Spanish (4.0.5's "Group Shoot Together" is
  "Los grupos disparan juntos", 5.0.5's "Piles Shoot Together" is "Las pilas disparan juntas", "Show Info" is "Mostrar información", DOS 2.0's
  "Always Review Battles" is "Revisar siempre las batallas", "Create New Ship Type" is "Crear un nuevo tipo de nave") the wording is mine.
- **The song.** 5.0.5 runs 316–317 (only that manual has them) quote a Clash song. Jake's call: the song is sung in English and has no translation, so both runs stay **in English, exactly as the manual has them** (copied from `segments.json`).
  **This is the rule for every language**, not only Spanish: covers of the song in French, German and Turkish are sung in English too. The French and German
  tables (`5.0.5/fr-3.tsv`, `de-3.tsv`) had translated it; they now hold the English, and `5.0.5-fr/` and `5.0.5-de/` were rebuilt (only `installing.html` changed).
  **Except the last sentence of run 317**, "Or is it the other way around?": Delta Tao's own aside, not a lyric (they swapped the song's stay and go),
  so it is translated in every language (Jake's call): "Ou est-ce l’inverse ?", "Oder war es umgekehrt?", "¿O es al revés?"; Turkish "Yoksa tam tersi mi?".
- **Book titles** keep the English with a Spanish title in brackets (parentheses): "El Tao de Pooh", "Calvin y Hobbes", "El camino Macintosh" (mine),
  **"¿Está usted de broma, Sr. Feynman? Aventuras de un curioso personaje"** (the Spanish edition's title, given by Jake). Game and product titles stay English.
- **"Let 'em die"** is "¡Que se mueran!", the game's own help text's word; **"carbonizado"** (Delta Tao's "Carbonized") is mine.
- **Spoken lines** ("Hyahh!", "Whoa!", "Check this out!") stay English; **"Ho! Down"** (the player gatherings) stays; **"Bonehead"** is "torpe".
- **Glossaries** keep the English alphabetical order, their terms translated (so "Aliado" sits where "Ally" did), as the French and German did; the
  4.0.5 glossary's lines are broken at a natural place, without hyphens.
- **Footer** of each page: "Traducción al español del remake, no oficial, del manual de Delta Tao."
- The stray `|` in 5.0.5's Custom Galaxies and its "Ouput" typo are fixed as in the French and German ("Puesto avanzado"); 5.0.5's "…even a 3rd
  of his life" keeps its empty `{sup2}` marker like theirs; a truncated heading in 4.0.5 ("…hasta el pun") is kept truncated like the English's.

### Gemini's review of the Spanish (Paşa Pişmaniye applied it)

Jake ran `review-es-spanish.html` past Gemini, which found the Spanish accurate and natural and flagged seven things, all accepted:
“acabar algo distinto” → “terminar de forma algo distinta”; replays kept “para” → “de” the last 60 battles; “cuyo Siguiente es” → “cuyo botón
Siguiente equivale a”; “gratuitos” → **“superfluos”** (Delta Tao's “gratuitous graphics”: a false friend); “juega entre plataformas” →
“permite jugar entre plataformas”; **“y hicimos” → “e hicimos”** (y → e before an i sound); “diez mensajes atrás dejó atrás por casualidad” →
“diez mensajes antes dejó en memoria por casualidad”. Gemini named one row for each; the same wording stood in 15 notes rows (the versions
share sentences) and in 4 manual runs (5.0.5 #66 and #72, 4.0.5 #479, 3.0.1 #95), and all were changed. `js/ui-text-notes-es.js` is 1.0.1;
`5.0.5-es/changes.html`, `4.0.5-es/spaceward-ho-changes-from-2-0-to-3-0.html` and `3.0.1-es/changes-from-version-2-to-3.html` were rebuilt
(nothing else differs). `work/assemble.py` is 1.1.0 (per-language versions; proved first to rebuild the Spanish and Turkish files byte for
byte from the old tables). Spanish is the first language whose Gemini pass is done: its notice flag can read “reviewed”.

### Gemini's review of the German (Paşa Pişmaniye applied it)

Gemini judged the German a natural, professional localization and flagged seven things. **Six accepted:** the Ed/Edward renaming row reworded
so “dessen” is no longer ambiguous; “einmal von dreien” → “in einem von drei Fällen” (2 rows); **“erwärmen oder kühlen sich … ab”** (a real
error: only “abkühlen” takes ab-) → “weichen … durch Erwärmung oder Abkühlung … ab”; 5.0.5's “den Mixer betatschen” → “streicheln” (betatschen
reads as groping); “kunterbunt” → “kreuz und quer” for higgledy-piggledy (4 manuals); 5.0.5 #191's verbless ending → “sie beginnen … und
verlaufen nach unten”. **One declined:** 4.0.5 #56 is not cut off; the table and the review page both have the whole paragraph (Gemini's
own input was probably truncated). `js/ui-text-notes-de.js` is 1.0.1 (its header comment now gives the right column order, which the old one
had wrong); rebuilt pages: `5.0.5-de/bonehead.html`, `custom.html`, `exploring.html`, `4.0.5-de/galaxy-style.html`,
`3.0.1-de/custom-galaxies.html`, `2.0-dos-de/custom-galaxies.html`. German's notice flag can read “reviewed”.

### Gemini's review of the French (Paşa Pişmaniye applied it)

Gemini found the French excellent and flagged five things. **Four accepted:** “parfaitement gratuits” → “purement superflus” (the same
false friend as the Spanish; 4 places); “qui se joue entre plateformes avec” → “qui est compatible multiplateforme avec” (2 rows);
“le jeu a un message” → “le jeu prévoit un message” (2 rows); “cette / une pratique liste” → “liste pratique” (3 places). **One declined:**
notes-40's “Voulez-vous vraiment laisser tomber ? Tout n’est pas encore perdu…” loses the Hope pun, as Gemini says, but it is the iOS game's
official French line (`js/lang-data.js`), quoted because it is what a French player sees; the remake keeps official lines as they shipped.
`helper-reviewpage.py` is 1.0.1: its brief now says so for French, German and Turkish, so later passes don't flag official quotations.
`js/ui-text-notes-fr.js` is 1.0.1 (6 rows; its header's column comment corrected, as the German's); rebuilt pages: `5.0.5-fr/changes.html`,
`4.0.5-fr/spaceward-ho-additions-from-3-0-to-4-0.html`, `4.0.5-fr/spaceward-ho-changes-from-2-0-to-3-0.html`,
`3.0.1-fr/changes-from-version-2-to-3.html`. French's notice flag can read “reviewed”.

## Turkish (Kaptan Kadayıf: the notes and the 5.0.5 manual; Paşa Pişmaniye: the other three manuals)

**Notes:** `js/ui-text-notes-tr.js`, 363 rows, Turkish in the fourth column. **5.0.5 manual:** `manuals/5.0.5/tr-*.tsv`, built to
`assets/manuals/5.0.5-tr/`; footer “Delta Tao kılavuzunun yeniden yapım tarafından yapılmış, resmî olmayan Türkçe çevirisi. İngilizce sayfa.”

Voice and words: “sen”; the game's Turkish wherever it has a word (`js/ui-text.js`, `js/lang-data.js`'s iOS strings, `js/lang-remake.js`),
spelled as the game spells it: İzci, Savaş / Savaşcılar (Fighter), Koloni Gemisi, Aba (Dreadnought), Tanker, Biyolojik, Tuzak, Uydu;
Menzil, Hız, Silâhlar, Kalkanlar, Mini / Minyatürleştirme, Radikal; Metâl; Birikim (Savings); **Gemi Tasarrufu** (Ship Savings, the remake's
own word in `lang-remake.js`, not iOS's “gemi parası”); Sıran Bitti; Filoları Hazırla; Harcamaları Düzelt; Birikimden Harca; Tahliye Et;
Şeref Listesi / Utanç Listesi; usta puanı; hurdaya çıkarmak; meteor yağmuru; hiperuzay; turn = **sıra**; the tech names iOS's
(“Tankların depolarını dolduruyor”, “Fuziyon Yığılımı”).

Typography: curly quotes “ ”; numbers “1.234” and decimals “1,46 G”; money “$7.500” (the dollar first, as the game shows it), or written
out where a suffix would follow it (“2.147.483 dolardan fazla”); percentages “%15”; in prose **a suffix after a name or number takes the
apostrophe and agrees with it** (3.0.1’in, 4.0.5’te, Mac’te, Vega’ya): correct Turkish. Text quoted from the game is quoted as the game
shows it (iOS's own lines with their glued suffixes: “…yi gerçekten boşaltmak istiyor musun?”).

Choices nobody has read as a native (Turkish is where a second pair of eyes helps most):

- **Mine, no official word:** Terk Et (3.0.1 / 4.0.5's Abandon), Gemileri Hazırla (Organize Ships), Grafik Geçmişi (Graph History),
  “Bırak ölsünler” (Let 'em die), Kalın Kafalılar İçin Talimatlar (Bonehead Directions), Oyun Sahibi (Game Host), Gemi Yap/Tasarla
  (Build/Design Ships), Filoya Git (Go to Fleet), Yığınlar Birlikte Ateş Eder (Piles Shoot Together), Bilgiyi Göster (Show Info, iOS's
  string), “derin / karmaşık” for the why page's “complex / complicated” (Turkish has no such pair).
- **The Hope joke** (notes row 39) quotes iOS's own Turkish line, whose pun works through “ümidini”.
- **Book titles** keep the English with a Turkish title in brackets: “Pooh’un Tao’su”, “Calvin ve Hobbes”, “Macintosh Yolu” (mine), and
  **“Eminim Şaka Yapıyorsunuz Bay Feynman!”** (the Turkish edition's title as I remember it: not checked).
- English kept: spoken lines (“Hyaa!”, “Hyahh!”, “Whoa!”, “Check this out!”), game and product titles, the address, UI labels quoted from
  versions with no Turkish (“Need more MPs”, “Exit Spaceward Ho?”), the song's lyric.
- The 5.0.5 English's doubled “See {See Preferences}” (runs 362, 364) is a single “Bkz. Tercihler”, as the Spanish did; its “3{sup}rd{/sup}”
  of a life is “üçte biri” with the empty marker kept; the stray `|` and “Ouput” in Custom Galaxies are fixed as in the other languages.
- The glossary keeps the English alphabetical order, as the others did.

### The Turkish 4.0.5, 3.0.1 and DOS 2.0 manuals (Paşa Pişmaniye)

Tables `manuals/<folder>/tr-*.tsv`: 565 / 519 / 403 runs, built to `assets/manuals/<folder>-tr/` (72 / 35 / 28 pages). Same voice, glossary and
typography as the 5.0.5 Turkish above; where a sentence recurs across the manuals the earlier Turkish was reused (by the helpers, or by hand
where the English differed a little) so the four read as one translation. Choices worth a native's eye:

- **Abandon is “Terk Et”** in 4.0.5 and 3.0.1 (as Kaptan Kadayıf ruled); **Ship Savings “Gemi Tasarrufu”**; Fighter “Savaşcı” (iOS's spelling).
- **Menus as the game shows them** (`js/ui-text.js`): Pencere, Galaksi, Gemiler, Seçenekler, Dosya; Gemi Yap, Gemi Yap/Tasarla, Filoları Hazırla
  (and Gemileri Hazırla for 4.0.5's Organize Ships), Filoyu Parçala / Filoyu Parçalama, Hepsini hurdaya çıkar, Bu tipi hurdaya çıkar, Para/Metâl
  Ver, Birikimden Harca, Harcamaları Düzelt, Oyuncuları Karşılaştır, Keşfedilen Tüm Yıldızları Listele, Filoların Listesini Yap, Yıldıza Git,
  Yakınlaştır / Uzaklaştır, Bilgiyi Göster, Olay mesajlarını göster, Ama Yalnızca En Önemlileri, Muharebeleri Gözden Geçir, Bildirilen savaşları
  gözden geçir, Tam Canlandırılmış Savaşlar, Sırayı Bitir ve Oyuncu Değiştir, Galaksi Yarat / Yarat, Şeref Listesi / Utanç Listesi, usta puanı.
- **Mine, the game has no Turkish for them:** Olay Savaşlarını Gözden Geçir (4.0.5's Review Event Battles), Savaş Hızını Ayarla / Yoklama Süresini
  Ayarla (the headings; the game's items are “Savaş Hızı…” / “Yoklama Süresi…”), Gruplar Birlikte Ateş Eder, Filo Rotalarını Göster, Gezegen
  Listesini Kendiliğinden Sırala, Becerileri Göster, Herkes Hazır, İstatistikler, Sıra Güncellemesini Zorla, Sıraları Ben Güncellerim, Savaşları
  Her Zaman Gözden Geçir, Fazla Harcama Uyarıları Ver, Yeni Gemi Tipi Yarat, Gemi Tasarımı, Gemi Tiplerini Listele, Gemi Tipini Hurdaya Çıkar,
  Tipi Hurdaya Çıkarma; the Auto Play choices “Her sıra beni bitti say”, “İlginç bir şey olana dek beni bitti say”, “Sıralarımı kendim oynayacağım”;
  “Doğrusal” / “Logaritmik” for the Linear / Log button; Harita Tarzı and Bilgisayar Becerisi (3.0.1 / DOS's Map Style, Computer Skill: the game's
  rows), Galaksinin Tarzı and Bilgisayar Zekâsı (4.0.5's).
- **`helper-uiaudit.py tr` differences left on purpose (9):** five chapter titles (“Teknolojiyi Geliştirmek”, “Gezegenler Nasıl
  Kolonileştirilir”, “Gemileri Hareket Ettirmek”, “Gezegen Bilgileri”, “Çubuk Grafikler”, as the 5.0.5 Turkish has them; the game's rows are its
  tooltip words); “List All Fleets” is “Filoların Listesini Yap” (the game's Title Case menu row; the audit picks the lower-case row's “Tüm
  filoları listele”); 4.0.5's “Have computer play for me” is “Bilgisayar benim için oynasın” (the remake's row, not iOS's “Computer Benim İçin
  Oynasın”, which is the 5.0.5 / iOS window's English); “Surrender To…” is the menu item “Teslim Ol…”, not the dialog's “Kime teslim ol”.
- **Mac keys:** Komut-Option-T (“Komut” as the 5.0.5 Turkish); page references “41. sayfa”, contents “(s. 41)”. Prices in prose are written out
  where a suffix follows (“15 dolarlık”), else “$10.000”. A degree after 72 takes no suffix (“sıcaklığı 72° değerine yaklaşır”).
- **Truncated heading kept truncated:** 4.0.5's “…grown to the poin” is “Bu, halkının kendini geçindirebilecek nok”, matching the full sentence's
  Turkish on the same page.
- **Kept as they stand:** titles of games and books (with a Turkish title in brackets for the four books), 1990s phone numbers, addresses and
  online-service commands (‘Go to’, GAMEDPUB, M805;1), the WIN.INI line, file names (“Spaceward Ho! 4.0 Prefs”), the spoken “Hyahh!” / “Whoa!”,
  “Ho! Down”, the candidate names in 3.0.1's About (Corral the Stars…). The 3.0.1 survey's “Which games are turkeys?” is “tam bir fiyasko” (a
  Turkish “hindi” would be a joke on the language's own name). The legal text of the 4.0.5 help is translated faithfully, as in the other languages.

### Gemini's review of the Turkish (Paşa Pişmaniye applied it)

Gemini judged the Turkish natural and flagged twelve things. **Eleven accepted**, every copy changed (the manuals share sentences):
“her seviyeye bir önden başlamayla” → “ve her seviyeye bir avansla başlar”; “oyunun mesajı bulunan” → “oyunda mesajı olan” (2 rows); the
Dorothy row's dangling “artık bir İptal düğmesiyle” → “; bu satırın artık bir İptal düğmesi de var”; “iyilerin arasında ayırt etmek” →
“iyilerden ayırt etmek” (5.0.5, 3.0.1); “tarafsız olabilir/kalabilir (…)” → “olabilirsin/kalabilirsin” (5.0.5, 4.0.5); “silâh ikramiyesi” →
“silâh bonusu” (manual and notes); “doların başına” → “dolar başına” (four manuals); “noktalar uydu gibi” → “ay gibi” (uydu is also the
Satellite ship); “göz zararı” → “göz hasarı”; “üzerinde çizgi varsa” → “üzeri çiziliyse”; “Duh”, which was “Hıh” (scorn) in 5.0.5 and 3.0.1
and “Hadi ya!” (disbelief) in 4.0.5, is now **“Ne sandın.”** in all three (Gemini offered “Yani.”, “Tabii ki.” or “Ne sandın.”; the last is
the one that says “obviously” with the English's eye-roll). **One declined:** “Fuziyon” (notes-77, -332) is the iOS game's own spelling of
the tech name (`js/lang-data.js`), quoted as a Turkish player sees it; the remake keeps official lines as shipped (the Turkish patch's typo
fixes, HANDOFF “Decided by Jake”, are where “Füzyon” belongs). `js/ui-text-notes-tr.js` is 1.0.1 (5 rows); 8 pages of `5.0.5-tr/` and the
matching pages of the other three Turkish folders were rebuilt. Turkish's notice flag can read “reviewed”: **all four languages have now had
their Gemini pass.**

## What a new conversation needs

This zip holds **only the new files** (it is unzipped over the repo). A translator working from it alone is missing what it
translates *from* and *with*: the English manual pages (5.0.5, 4.0.5), `docs/translations.md` (the glossaries: Spanish "tú", Turkish
suffixes), `js/ui-text.js` and `js/lang-remake.js` (the game's own words, which the manuals must match), `js/version-notes.js` and the
rulesets (the notes' English). So a new conversation gets **both**: the full repo zip and this package, unzipped over it. That is
all it needs; no copies of repo files are kept in this folder (two copies of a file go stale).

## Not done yet

The Turkish suffix and typo patches (HANDOFF, “Decided by Jake”); the Full Hoedown items; a native reader for any language.
