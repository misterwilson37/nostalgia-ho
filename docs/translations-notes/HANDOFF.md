# HANDOFF: translating the long English texts

**Claudlings so far:** Professor Pamplemousse (French notes and manuals, German notes); Admiral Apfelstrudel (the German
manuals: 5.0.5 table, reuse for the rest, helper fix); Capitán Churro (the Spanish notes and all four Spanish manuals);
Kaptan Kadayıf (the Turkish notes, the Turkish 5.0.5 manual, the song rule); **Paşa Pişmaniye** (the Turkish 4.0.5, 3.0.1 and DOS 2.0
manuals). Pick a different name next time; log it here.

## What's left after this package (Paşa Pişmaniye's list, for Jake)

Translation work is complete for the notes and manuals: four languages, four manuals each, each Gemini-reviewed and fixed. What remains:

1. **The main Claudling applies `docs/notes-and-manuals-integration.md`** (help.js steps 2–3 with all four languages, the ui-text row, the
   four notes script tags, `ui.js` edits A–H, the audit). Until then no game links a translated manual or shows translated notes.
   Not yet done anywhere: a click-through of a Turkish game's Help menu (French and German were tried; Spanish and Turkish only on paper).
2. **The main Claudling builds the translation notice** (`FOR-THE-MAIN-CLAUDLING-translation-notice.md`; all four "reviewed" flags true).
   Its own words, in four languages, are new and **not yet reviewed by Gemini**: run them past it once written.
   **Jake:** create a `translation` label in the GitHub repo.
3. **Not covered by the Gemini passes:** the interface strings (`js/ui-text.js`, `js/ui-text-help.js`, `js/lang-remake.js`), about
   1,180 per language. A `helper-reviewpage.py` 1.1.0 could add them.
4. **The Turkish suffix and typo patches** ("Decided by Jake", 1), now with "Fuziyon" → "Füzyon" on the typo list.
5. **The 5.0.5 dead links behind the patch** ("Decided by Jake", 2) and **every version in every language** (3).
6. **Housekeeping:** `docs/translations.md` "What stays English" still lists the notes and manuals as English (the guide's Optional).
7. A native reader, any language, whenever one turns up (the Translation notes item is how they'd reach Jake).

## State: Gemini review, all four languages (Paşa Pişmaniye)

- **Turkish: reviewed by Gemini and fixed** (README): 11 of 12 accepted; 1 declined (“Fuziyon”, the iOS spelling: it belongs in the
  Turkish patch's typo list). 5 notes rows, 15 manual runs. When the Turkish typo patch is written, add “Fuziyon” → “Füzyon” to it.
- **French: reviewed by Gemini and fixed** (README): 4 of 5 accepted; 1 declined (an official iOS line); 6 notes rows, 6 manual runs,
  4 pages. The review brief now tells Gemini to leave official quotations alone (`helper-reviewpage.py` 1.0.1).
- **German: reviewed by Gemini and fixed** (README, “Gemini's review of the German”): 6 of 7 accepted, 1 declined (a truncation that
  wasn't); 4 notes rows and 8 manual runs; 6 pages changed. Check Gemini's “this is cut off” claims against the table before acting.
- **Spanish: reviewed by Gemini and fixed** (README, “Gemini's review of the Spanish”): 7 fixes in 15 notes rows and 4 manual runs; notes-check,
  build, link check clean; 3 pages changed. **All four passes done.** Regenerate a page with `helper-reviewpage.py` after any later fix. Gemini's row numbers (`notes-N`) are the order of rows in `js/ui-text-notes-<code>.js`, not the
  numbers in `work/source-lines.json` (the first is the second plus one); search the tables by the quoted text, as was done here, and fix
  every row and run that shares the wording, not only the one named.

## State: Turkish manuals finished (Paşa Pişmaniye, on Opus)

- **All four Turkish manuals: done.** New tables `manuals/4.0.5/tr-0c, tr-0d, tr-1..4.tsv` (565 of 565), `manuals/3.0.1/tr-0c, tr-0d, tr-1..4.tsv`
  (519 of 519), `manuals/2.0-dos/tr-0c, tr-0d, tr-1..3.tsv` (403 of 403); 0 problems from `helper-checkpart.py`, every run and marker accepted
  by `manualtr.py build`. Built to `assets/manuals/4.0.5-tr/` (72 pages), `3.0.1-tr/` (35), `2.0-dos-tr/` (28), `lang="tr"`; 0 broken links;
  each folder identical to a fresh `--check` build. Order kept so the reuse helpers could feed on finished Turkish: 4.0.5 first (reuse from
  5.0.5: 33 exact + 35 re-marked), then 3.0.1 (from 5.0.5 + 4.0.5: 92 + 75), then 2.0-dos (from all three: 67 + 8). Each helper was run
  **once** per manual with `LANG_CODE=tr`; `helper-seedde.py` was not run (the `tr-0.tsv` seeds are untouched).
- **Checks:** the full loop (`build <folder> <code> --check` for fr, de, es, tr × four manuals) all clean; `node tools/notes-check.js --lang=tr`
  ok; `helper-uiaudit.py tr`: 134 of 143 menu and window names match the game (the 9 left, all deliberate, are in the README's Turkish choices).
  Chromium: 4.0.5-tr glossary (3 of 3 pictures) and 3.0.1-tr Exploring Planets (8 of 8) rendered, no console errors; text identical to the
  English only where it should be (names, an address, a list of game titles).
- **Wiring:** `docs/notes-and-manuals-integration.md` step 3 now has `tr:` in all nine `js/help.js` blocks and step 5 the Turkish script tag;
  applied to a copy of `js/help.js`, every Find matches once, `node --check` passes and every `tr` path exists. **Not applied to the repo**
  (help.js is the main Claudling's), **not tried in a running game.**
- **Shared tools:** none changed (`manualtr.py` stays 1.2.0).
- **Added at Jake's request:** `tools/manuals/translate/helper-reviewpage.py` 1.0.0 (one review page per language for a Gemini pass:
  every notes line and manual run beside its English, with row IDs that map back to the tables; regenerate, don't keep copies) and
  `FOR-THE-MAIN-CLAUDLING-translation-notice.md` (a spec, with the words in all five languages, for an "About the translations" notice
  and a Ho menu "Translation notes…" item opening a `[translation]` GitHub issue). Jake took the four review pages to Gemini; when its
  notes come back, the fixes go into the tables, then rebuild, and the notice's per-language "reviewed" flag flips.

## State: Turkish (Kaptan Kadayıf, on Opus)

- **Turkish notes: done and seen in a game.** `js/ui-text-notes-tr.js` (363 rows), tables `work/tr-1..3.tsv`; `work/assemble.py` has a Turkish
  header (and writes the Turkish column). `node tools/notes-check.js` clean for `tr`, `fr`, `de`, `es`. On a throwaway copy with the
  integration edits applied (all four notes script tags, `ui.js` edits A–H), Chromium, a Turkish game with the patch on in 3.0.1, 405,
  mac405, original, palm, ios and android: About this version and Patch notes all Turkish, no “Bu notlar İngilizce” line, the fix suffix in
  Turkish, no page errors; the only `translate="no"` left is the Hoedown list and the language names (expected).
- **Turkish 5.0.5 manual: done.** `manuals/5.0.5/tr-0..7.tsv` (561 of 561, 0 problems), built to `assets/manuals/5.0.5-tr/` (33 pages,
  `lang="tr"`), 0 broken links beyond the English's own 34; `helper-uiaudit.py tr`: 36 of 36 menu names match the game. One page looked
  at in Chromium (exploring.html: text, 12 of 12 pictures, footer).
- **Turkish 4.0.5, 3.0.1, 2.0-dos manuals: done since, by Paşa Pişmaniye (above).** When this was written they were only seeded: `tr-0.tsv` (8 / 4 / 3 runs) by `helper-seedde.py tr` (**do not re-run
  it**: it would overwrite the `tr-0.tsv` files, 5.0.5's 51 included). Next: `LANG_CODE=tr` `helper-autoreuse.py` then `helper-autoreuse2.py`
  for each, then the rest by hand, `helper-checkpart.py <folder> tr`, `manualtr.py build <folder> tr`, `helper-linkcheck.py`, `helper-uiaudit.py tr`.
- **`manualtr.py` 1.1.0 → 1.2.0** (the Turkish footer line).
- **The song, every language (Jake):** 5.0.5 runs 316–317 keep the English lyric (covers in French, German and Turkish are sung in English);
  the last sentence of 317, “Or is it the other way around?”, is Delta Tao's aside, not a lyric, and is translated in every language. French
  and German had translated the lyric; their tables now hold the English, and `5.0.5-fr/`, `-de/`, `-es/` were rebuilt (only `installing.html`
  differs from the delivered pages).

## Decided by Jake in Kaptan Kadayıf's session (for later work, not this package)

1. **Turkish suffixes after a slot (the game's reports), after the manuals.** iOS's Turkish glues a guessed ending to each slot (`%sye`,
   `%sya`, `%s de`, `%s 'i`: 141 of its 265 slot lines), and its fixed text has typos (“btti”, “coloni”, “nufusu”, “Uyarma”…). Jake's rule:
   **unpatched, every Turkish version keeps that iOS attempt as it is**, mistakes included (the spirit of the original: a Turkish player
   expects them); the versions that never had an official Turkish (3.0.1, 4.0.5, 5.0.5, Palm) keep reading like the iOS translator's work
   too. **Each Turkish version's patch gets two language fixes**, like `trLostWord` / `trSpiesReport`: suffixes that agree with the filled
   name (vowel harmony, d/t, buffer y/n, numbers as said aloud; a hand-checked table for the game's own name lists, the spelling rule for
   typed names), and the typos corrected. The seven iOS lines the remake now corrects in every version (`lang-remake.js` `tr.over`) move
   behind the patch as well. A translation Claudling writes the Turkish (the corrected lines, the endings table, a spec); the shared code
   (`lang-remake.js`, the rules' `fixes`, the template filler) is the main Claudling's. `docs/translations.md`, “Turkish suffixes”, must be
   rewritten to say this. In prose (notes, manuals) Turkish is written correctly already (apostrophe and agreeing suffix: 3.0.1’in, Mac’te).
2. **The 5.0.5 manual's dead links go in the 5.0.5 patch, not a straight fix.** Checked against the original app Jake supplied
   (`5_0_5_for_Mac_OS_9___X.sit`, opened with `unar`; `Spaceward Ho!.app/Contents/Resources/Spaceward Ho Help Book/`, February 2003):
   its `CVS/Entries` lists all 60 files Delta Tao kept for the help book, and `ho5docs.html` (the target of the two visible “See
   Preferences” links in `problems.html` and the invisible one in `computer.html`) was never among them; `index.html`'s stylesheet is
   `file:///Zippy/…`, a Delta Tao machine's disk. So they were broken as shipped. Jake's rule: what worked originally is fixed outright,
   what didn't goes in the patch. The plan (for the main Claudling, after the translations): one set of pages; the Help menu opens the
   manual with a flag (e.g. `?patch=1`) when the game's patch is on; a few lines of script the manual build adds to every page, all
   languages, point the three links at `preferences.html` and the stylesheet at `ho5docs.css` only when the flag is there; a Patch
   notes entry says so. Not a second copy of the pages (Rule 9). The 31 Word-export `<link>` tags (`*_files/filelist.xml`,
   `editdata.mso`) are invisible and stay. The remake's English copy is otherwise faithful: 12 pages differ from the originals only by an
   added `<meta charset="utf-8">`, visible text identical in all.
3. **Not every version has every language** (2.0 has no Turkish; the AI homages are English only). Jake wants to tackle that next, once the
   translations are done: a job for another Claudling, to be planned with him then.


## State: Spanish (Capitán Churro)

- **Spanish notes: done**, `js/ui-text-notes-es.js` (363 rows), `node tools/notes-check.js` clean for `es`, `de` and `fr`. Tables: `work/es-1..5.tsv`;
  `work/assemble.py` gained its Spanish header and now writes the right column order (not rerun for fr and de).
- **Spanish manuals: all four done**: `manuals/<folder>/es-*.tsv` (561 / 565 / 519 / 403 runs, 0 problems), built to `assets/manuals/<folder>-es/`
  (33 / 72 / 35 / 28 pages), 0 broken links beyond the English 5.0.5's own 34. `helper-uiaudit.py es`: 142 / 143. **Not seen in a browser or a game.**
- **Shared tools touched:** `tools/manuals/translate/manualtr.py` 1.0.0 → 1.1.0 (the `es` footer line). `docs/notes-and-manuals-integration.md` now
  covers `es` (help.js entries, index.html script tag, check loop; a closing section). `FOR-THE-MAIN-CLAUDLING.md` is still the French notes' page: the
  Spanish file needs only the same one script tag (`js/ui-text-notes-es.js`) as the German.
- **Decided (Jake):** 5.0.5 runs 316–317 (The Clash's “Should I Stay or Should I Go”, quoted on the Installing page) stay in English as the manual has them **in every language** (the song is sung in English everywhere; French and German were changed to match by Kaptan Kadayıf, Turkish keeps it too), except run 317's last sentence ("Or is it the other way around?", Delta Tao's aside), translated in every language; the Feynman book's Spanish title is the edition's full title.
- **Not done:** a native Spanish reader; step 3 (help.js) and the script tag in the repo are only written in the integration page, not applied;
  `docs/translations.md` ("What stays English") still lists the notes and manuals as English.

## State: French and German

- **Folded with Footnote Fizzbin's manuals** (DOS 2.0 and Mac 3.0 as web pages) into one zip for the
  main Claudling: `docs/notes-and-manuals-integration.md` is the one page to follow. Done on Opus at
  Jake's request. While folding: their zip's top-level `README.md` would have replaced the project's
  (moved to `docs/manuals/`), and the new 3.0 manual's name had no `ui-text.js` row (added, replacing
  the stale "closest to 3.0.1" row).
- **German notes (version notes + patch notes): done**, `js/ui-text-notes-de.js`, checked (`notes-check`) and seen in a German game.
- **German manuals (Admiral Apfelstrudel): all four tables complete** (5.0.5 561, 4.0.5 565, 3.0.1 519, 2.0-dos 403 runs; 0 problems
  from `helper-checkpart`, accepted by `manualtr.py build`). **Built and link-checked here: `3.0.1-de/` (35 pages) and `2.0-dos-de/`
  (28 pages)**, 0 broken links, `lang="de"`. **Not built: `5.0.5-de/` and `4.0.5-de/`**, because the English 5.0.5 and 4.0.5 pages were not
  in the zip: run `build 5.0.5 de` and `build 4.0.5 de` in the repo. **Not seen in a game or a browser**; only tables and built HTML were
  checked. Menu and option names in the manuals are mine until compared with `js/ui-text.js` (README, "German choices in the manuals").
- **`helper-autoreuse.py` / `helper-autoreuse2.py` bumped to 1.0.1** (were unversioned): they always wrote `fr-0c.tsv` / `fr-0d.tsv`, which for
  any other language would overwrite or break the French tables. Now `<LANG_CODE>-0c.tsv` / `-0d.tsv`. Run only after the fix; French tables
  verified unchanged (md5).
- **`de-0.tsv` seeds** were empty in the zip (README claimed 66); re-seeded 46 from the German notes. Don't re-run `helper-seedde.py` (it
  would overwrite them). Other files changed by this session: `README.md` here, this file, `docs/notes-and-manuals-integration.md` (new step 3b).
- **French manuals: all four done and checked** (`<folder>-fr/`, see README); wired in the guide's step 3 (every version's Help item).
- **French, version notes and patch notes: complete, checked, not yet integrated.** 363 rows in
  `js/ui-text-notes-fr.js`; `node tools/notes-check.js` clean; seen in Chromium in French (4.0.5, patch on).
  The main Claudling applies `FOR-THE-MAIN-CLAUDLING.md`.
- **Shared files:** none touched. The `ui.js`, `index.html` and `ui-lang-audit.js` edits are written as
  search/replace for their owner (complete files for what this build owns; `ui.js` is the other
  Claudling's, as in the Claude-rules handoff). Jake can ask for a complete `ui.js` instead.
- **Versioning:** the two new files start at 1.0.0 (see their headers). Each new language's file is
  its own 1.0.0; a later edit to a row is a patch bump; a changed method is Jake's major.

## Next, in Jake's order

**A new conversation needs the full repo zip as well as this package** (README, "What a new conversation needs").

1. **German: done** (notes, all four manuals built, menu words matched to the game, wired in step 3). Kept for reference: "Sie", the DOS 2.0 German's words and the remake's German
   in `docs/translations.md` ("German for 3.0.1 onward"): Späher, Kampfschiff, Kolonieschiff,
   Schlachtschiff, Tanker, Bioschiff, Täuschschiff, Reichweite/Weite, Funkspruch, verschrotten, räumen
   (5.0.5) / verlassen (3.0.1, 4.0.5), Meteoritenschauer, "Glückwunsch!"; numbers "1.234".
2. **Turkish:** notes and all four manuals done (Kaptan Kadayıf, Paşa Pişmaniye). Next: the suffix and typo patches ("Decided by Jake", 1).
   Turkish is where a second pair of eyes helps most.
3. **Spanish: done** (notes and all four manuals).
4. **Manuals:** French is done. For each other language, the same tool and tables: `extract` once per manual (already in `segments.json`), translate into `<code>-*.tsv`, `build`. 5.0.5 first; reuse its text for the later manuals as was done for French (`manuals/README`).

## Rules from Jake's standing instructions that applied here

Complete files for what this build owns; bump versions on shipped files; a HANDOFF and a README; stop
and ask when a report doesn't match the code (nothing did here); never retain student data (none seen).

## Things that would have saved time

- A zip for translation work should carry the **English pages of every manual it builds from**; without `assets/manuals/5.0.5/` and `4.0.5/`
  `build` ran clean on the tables but wrote nothing, so no German page could be opened or link-checked.
- Before running any `helper-*` script for a new language, grep it for `fr-` (two had the French file names written in).
- `js/ui-text.js` and `js/lang-remake.js` (the game's German menu words) belong in the zip too: the manual names menus and dialogs all over.

- Long strings never need to be split: `HOUI.add` takes whole paragraphs, `HOUI.has(s)` is exact.
- `el()` translates when it builds a node, so `translate="no"` on a parent doesn't stop it; the notes'
  English markings are only marks (that is why `ui.js` needs edits, not the rows).
- The Mac 3.0.1/4.0.5 `fix` suffix was glued to the line (`x.text + note`), so no row could match it:
  it is two pieces now (edit D).
- Running Chromium for `about-test`-style checks works here: `NODE_PATH=$(npm root -g)`, a local
  `python3 -m http.server`, localStorage `ho5.language`, `ho5.rules`.
