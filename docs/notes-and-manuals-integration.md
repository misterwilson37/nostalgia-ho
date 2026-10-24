# Integrating the French, German and Spanish notes and manuals, and the DOS 2.0 / Mac 3.0.1 manuals

For the main Claudling. Three pieces of side work, folded into one zip:

- **Footnote Fizzbin's manuals:** the DOS 2.0 manual as web pages (from `dos-2.0.pdf`) and the printed **Mac 3.0
  manual** (scanned; folder `3.0.1`) as web pages and a cleaned PDF. Their notes: `docs/manuals/README.md`, `HANDOFF.md`.
- **Professor Pamplemousse's French and German notes:** About this version and Patch notes in French and in German. Notes: `docs/translations-notes/`.
- **The French, German and Spanish manuals** (French: Professor Pamplemousse; German: Admiral Apfelstrudel; Spanish: Capitán Churro, see below): new folders next to the English
  ones, `<folder>-fr/`, `<folder>-de/`, `<folder>-es/` and `<folder>-tr/` (Turkish: Kaptan Kadayıf and Paşa Pişmaniye), for
  **all four** manuals (5.0.5, 4.0.5, 3.0.1, 2.0-dos), built by `tools/manuals/translate/manualtr.py` from
  the translators' tables in `docs/translations-notes/manuals/<folder>/`. Pictures and stylesheets are linked from the
  English folder, not copied; each French page ends with a line saying it is the remake's translation, linking its English page.

The projects touch no file in common. Everything below was applied together to a clean copy of the repo and run (see "Checked").

## 1. Unzip at the repo root

It overwrites nothing (check: every file in the zip is new). It adds `assets/manuals/2.0-dos/`, `3.0.1/`, `3.0.1.pdf`,
`5.0.5-fr/`, `4.0.5-fr/`, `3.0.1-fr/`, `2.0-dos-fr/`, the same four `-de/`, `-es/` and `-tr/`, `tools/manuals/`, `js/ui-text-notes-fr.js`, `js/ui-text-notes-de.js`, `js/ui-text-notes-es.js`, `tools/notes-check.js`, `docs/manuals/`,
`docs/translations-notes/` and this page. **Keep `assets/manuals/dos-2.0.pdf`** (`2.0-dos/` is built from it).

*(The manuals zip had its `README.md` and `HANDOFF.md` at the top level, where unzipping would have replaced the
project's `README.md`; they are in `docs/manuals/` now.)*

## 2. `js/help.js`: link the new English manuals (Footnote Fizzbin's block)

Find:
```js
  dos: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
  // 3.0.1 shipped without an online manual; the 4.0.5 help is the closest
  // (it has a page on what changed from 3.0 to 4.0)
  301: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (closest to 3.0.1)'],
  // no 1.2F manual is in the archive; its rules are DOS 2.0's, so the DOS
  // 2.0 manual is the closest
  12: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
  // the Mac editions (js/rules-mac20.js, js/rules-mac405.js): their manuals
  // aren't in the archive; the same version's other edition's is the closest
  mac20: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
```
Replace with:
```js
  dos: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
  // the printed Mac manual for 3.0 (the scan is titled 3.0.1); it has the
  // chapter on what changed from 2.0 to 3.0
  301: ['assets/manuals/3.0.1/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'],
  // no 1.2F manual is in the archive; its rules are DOS 2.0's, so the DOS
  // 2.0 manual is the closest
  12: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
  // the Mac editions (js/rules-mac20.js, js/rules-mac405.js): their manuals
  // aren't in the archive; the same version's other edition's is the closest
  mac20: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
```

And two comments:

Find:
```js
// 301 = the Mac 3.0.1 program's own Quick Help (DITL 3010; it has no manual),
```
Replace with:
```js
// 301 = the Mac 3.0.1 program's own Quick Help (DITL 3010) and the printed 3.0 manual (assets/manuals/3.0.1/),
```

Find:
```js
// DOS 2.0 manual (assets/manuals/dos-2.0.pdf):
```
Replace with:
```js
// DOS 2.0 manual (assets/manuals/2.0-dos/, from assets/manuals/dos-2.0.pdf):
```

## 3. `js/help.js`: link the French, German and Spanish manuals (after step 2)

The game already takes a manual per language (`HOMANUALS[id] = { en: [...], fr: [...] }`, as iOS's help does):
`manualFor()` and `manualEnglish()` in `ui.js` read it, so **no `ui.js` change** is needed for this, and the Help menu
drops "(en anglais)" by itself for a language that has an entry. Other languages are untouched.

**5.0.5 (Original, Claude, Gemini and, by fallback, Palm)**

Find:
```js
  original: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  gemini: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
```
Replace with:
```js
  // a version's manual in the game's language: { en: [path, name], fr: [path, name], de: [path, name], es: [path, name], tr: [path, name] }. The name stays the
  // English one (its row is in js/ui-text.js); a language with no entry opens the English manual and the
  // Help menu says "(in English)", as before.
  original: { en: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'], fr: ['assets/manuals/5.0.5-fr/index.html', 'Spaceward Ho! 5 manual'], de: ['assets/manuals/5.0.5-de/index.html', 'Spaceward Ho! 5 manual'], es: ['assets/manuals/5.0.5-es/index.html', 'Spaceward Ho! 5 manual'], tr: ['assets/manuals/5.0.5-tr/index.html', 'Spaceward Ho! 5 manual'] },
  claude: { en: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'], fr: ['assets/manuals/5.0.5-fr/index.html', 'Spaceward Ho! 5 manual'], de: ['assets/manuals/5.0.5-de/index.html', 'Spaceward Ho! 5 manual'], es: ['assets/manuals/5.0.5-es/index.html', 'Spaceward Ho! 5 manual'], tr: ['assets/manuals/5.0.5-tr/index.html', 'Spaceward Ho! 5 manual'] },
  gemini: { en: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'], fr: ['assets/manuals/5.0.5-fr/index.html', 'Spaceward Ho! 5 manual'], de: ['assets/manuals/5.0.5-de/index.html', 'Spaceward Ho! 5 manual'], es: ['assets/manuals/5.0.5-es/index.html', 'Spaceward Ho! 5 manual'], tr: ['assets/manuals/5.0.5-tr/index.html', 'Spaceward Ho! 5 manual'] },
```

**4.0.5 (Windows)**

Find:
```js
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
```
Replace with:
```js
  405: { en: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'], fr: ['assets/manuals/4.0.5-fr/index.html', 'Spaceward Ho! 4.0.5 help'], de: ['assets/manuals/4.0.5-de/index.html', 'Spaceward Ho! 4.0.5 help'], es: ['assets/manuals/4.0.5-es/index.html', 'Spaceward Ho! 4.0.5 help'], tr: ['assets/manuals/4.0.5-tr/index.html', 'Spaceward Ho! 4.0.5 help'] },
```

**4.0.5 (the Mac edition, which uses the Windows help)**

Find:
```js
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
```
Replace with:
```js
  mac405: { en: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'], fr: ['assets/manuals/4.0.5-fr/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'], de: ['assets/manuals/4.0.5-de/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'], es: ['assets/manuals/4.0.5-es/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'], tr: ['assets/manuals/4.0.5-tr/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'] },
```

**3.0.1 (Mac)**

Find:
```js
  301: ['assets/manuals/3.0.1/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'],
```
Replace with:
```js
  301: { en: ['assets/manuals/3.0.1/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'], fr: ['assets/manuals/3.0.1-fr/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'], de: ['assets/manuals/3.0.1-de/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'], es: ['assets/manuals/3.0.1-es/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'], tr: ['assets/manuals/3.0.1-tr/index.html', 'Spaceward Ho! 3.0 manual (Mac 3.0.1)'] },
```

**DOS 2.0**

Find:
```js
  dos: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS)'],
```
Replace with:
```js
  dos: { en: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS)'], fr: ['assets/manuals/2.0-dos-fr/index.html', 'Spaceward Ho! 2.0 manual (DOS)'], de: ['assets/manuals/2.0-dos-de/index.html', 'Spaceward Ho! 2.0 manual (DOS)'], es: ['assets/manuals/2.0-dos-es/index.html', 'Spaceward Ho! 2.0 manual (DOS)'], tr: ['assets/manuals/2.0-dos-tr/index.html', 'Spaceward Ho! 2.0 manual (DOS)'] },
```

**Mac 1.2 (which uses the DOS 2.0 manual)**

Find:
```js
  12: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
```
Replace with:
```js
  12: { en: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'], fr: ['assets/manuals/2.0-dos-fr/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'], de: ['assets/manuals/2.0-dos-de/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'], es: ['assets/manuals/2.0-dos-es/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'], tr: ['assets/manuals/2.0-dos-tr/index.html', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'] },
```

**Mac 2.0.1 (which uses the DOS 2.0 manual)**

Find:
```js
  mac20: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
```
Replace with:
```js
  mac20: { en: ['assets/manuals/2.0-dos/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'], fr: ['assets/manuals/2.0-dos-fr/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'], de: ['assets/manuals/2.0-dos-de/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'], es: ['assets/manuals/2.0-dos-es/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'], tr: ['assets/manuals/2.0-dos-tr/index.html', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'] },
```

## 4. `js/ui-text.js`: the new manual's name in the four languages

The Help menu shows "Manual (in English): <name>". The 3.0.1 name is new, so it had no row, and in every other language the
whole item showed in English. The row it replaces ("closest to 3.0.1") is no longer used once step 2 is in.

Find:
```js
['Spaceward Ho! 4.0.5 help (closest to 3.0.1)', 'aide de Spaceward Ho! 4.0.5 (la plus proche de 3.0.1)', 'Hilfe von Spaceward Ho! 4.0.5 (am nächsten an 3.0.1)', 'Spaceward Ho! 4.0.5 yardımı (3.0.1’e en yakın)', 'ayuda de Spaceward Ho! 4.0.5 (la más cercana a 3.0.1)'],
```
Replace with:
```js
['Spaceward Ho! 3.0 manual (Mac 3.0.1)', 'manuel de Spaceward Ho! 3.0 (Mac 3.0.1)', 'Handbuch von Spaceward Ho! 3.0 (Mac 3.0.1)', 'Spaceward Ho! 3.0 kılavuzu (Mac 3.0.1)', 'manual de Spaceward Ho! 3.0 (Mac 3.0.1)'],
```

## 5. `index.html`: load the French, German and Spanish notes

Find:
```html
<script src="js/ui-text-help.js"></script>
```
Replace with:
```html
<script src="js/ui-text-help.js"></script>
<script src="js/ui-text-notes-fr.js"></script>
<script src="js/ui-text-notes-de.js"></script>
<script src="js/ui-text-notes-es.js"></script>
<script src="js/ui-text-notes-tr.js"></script>
```

## 6. `js/skins/classic/ui.js`: the notes' "These notes are in English" line and markings

Without these the French notes already show (el() translates as it builds), but the window still says "Ces notes sont en
anglais." and marks the text English. A language without the notes behaves exactly as before. Eight edits, each `Find` once:

**A. Helpers: say when a long document is in the language**

Find:
```js
const inEnglish = (text) => UIL.lang === 'en' ? null : el('p', { class: 'note' }, text || 'These notes are in English.');
```
Replace with:
```js
// A document whose every line has a row in the language (js/ui-text-notes-<code>.js,
// checked by tools/notes-check.js) is shown in it: no line says it's English, and
// it isn't kept out of the translation. Any other stays English, as before.
const inLang = (lines) => UIL.lang !== 'en' && !!lines && lines.length > 0 && lines.every(s => UIL.has(s));
const docAttrs = (lines) => inLang(lines) ? {} : { translate: 'no', lang: 'en' };
const inEnglish = (text, lines) => UIL.lang === 'en' || inLang(lines) ? null : el('p', { class: 'note' }, text || 'These notes are in English.');
```

**B. The patch's fixes as a list**

Find:
```js
const fixList = (rs) => el('ul', { translate: 'no', lang: 'en' }, ...HO.fixes(rs).map(f => el('li', null, el('b', null, f.title), el('br'), f.text)));
```
Replace with:
```js
const fixLines = (rs) => HO.fixes(rs).flatMap(f => [f.title, f.text]);
const fixList = (rs) => el('ul', docAttrs(fixLines(rs)), ...HO.fixes(rs).map(f => el('li', null, el('b', null, f.title), el('br'), f.text)));
```

**C. Patch notes window: the English line only while the fixes are English**

Find:
```js
el('h4', null, 'Fixed'), inEnglish(), fixList(rs)),
```
Replace with:
```js
el('h4', null, 'Fixed'), inEnglish(null, fixLines(rs)), fixList(rs)),
```

**D. About this version: the suffix after a fixed quirk is its own line, and the lines are listed**

Find:
```js
  const fixNote = (x) => typeof x !== 'string' && x.fix && fixIds.includes(x.fix) ? (patched ? ` (fixed in this game by the ${pv} patch: see Patch notes)` : ` (fixed in the ${pv} patch)`) : '';
  const lines = (list) => (list || []).filter(x => typeof x === 'string' || !x.show || x.show(rs)).map(x => typeof x === 'string' ? x : x.text + fixNote(x));
```
Replace with:
```js
  const fixNote = (x) => typeof x !== 'string' && x.fix && fixIds.includes(x.fix) ? ' ' + UIL.t(patched ? '(fixed in this game by the %s patch: see Patch notes)' : '(fixed in the %s patch)', pv) : '';
  const shown = (list) => (list || []).filter(x => typeof x === 'string' || !x.show || x.show(rs));
  const base = (list) => shown(list).map(x => typeof x === 'string' ? x : x.text);
  // a line is its text and, for a quirk the patch fixes, the note after it: el() puts each in the language
  const lines = (list) => shown(list).map(x => typeof x === 'string' ? x : [x.text, fixNote(x)]);
```

**E. About this version: each list keeps or drops 'English' by its own lines**

Find:
```js
      L.length ? el('ul', { translate: 'no', lang: 'en' }, ...L.map(t => el('li', null, t))) : none ? el('p', { class: 'sub' }, none) : null);
```
Replace with:
```js
      L.length ? el('ul', docAttrs(base(list)), ...L.map(t => el('li', null, t))) : none ? el('p', { class: 'sub' }, none) : null);
```

**F. About this version: every line of the notes, for the one 'These notes are in English' line**

Find:
```js
  const body = el('div', { class: 'about' },
    el('h3', null, rs.label || id),
```
Replace with:
```js
  const noteLines = [N.intro, ...base(N.quirks), ...base(N.differs), ...base(N.missing), ...(N.previous !== undefined ? base(N.changes) : []),
    ...(N.deltaTao ? [...N.deltaTao.text, N.deltaTao.source] : [])].filter(Boolean);
  const body = el('div', { class: 'about' },
    el('h3', null, rs.label || id),
```

**G. About this version: the line, the intro**

Find:
```js
    inEnglish(),
    N.intro ? el('p', { translate: 'no', lang: 'en' }, N.intro) : null,
```
Replace with:
```js
    inEnglish(null, noteLines),
    N.intro ? el('p', docAttrs([N.intro]), N.intro) : null,
```

**H. About this version: Delta Tao's paragraphs and their source line**

Find:
```js
      ...N.deltaTao.text.map(t => el('p', { translate: 'no', lang: 'en' }, t)),
      el('p', { class: 'sub', translate: 'no', lang: 'en' }, N.deltaTao.source, ' ',
```
Replace with:
```js
      ...N.deltaTao.text.map(t => el('p', docAttrs([t]), t)),
      el('p', Object.assign({ class: 'sub' }, docAttrs([N.deltaTao.source])), N.deltaTao.source, ' ',
```

## 7. `tools/ui-lang-audit.js`: read the notes files

Find:
```js
try { require(path.join(root, 'js/ui-text-help.js')); } catch (e) { /* (not there yet) */ }
```
Replace with:
```js
try { require(path.join(root, 'js/ui-text-help.js')); } catch (e) { /* (not there yet) */ }
for (const f of require('fs').readdirSync(path.join(root, 'js')).filter(f => /^ui-text-notes-[a-z]{2}\.js$/.test(f))) require(path.join(root, 'js', f));
```

## Checked

On a clean copy with steps 2–7 applied (the guide's own Find/Replace text, parsed and applied by a script):

```
python3 tools/manuals/build-manuals.py --check          # 2.0-dos: 28 pages, 15 images; 3.0.1: 35 pages, 18 images
node tools/notes-check.js                               # de, es, fr: 363 rows ... ok
for m in 5.0.5 4.0.5 3.0.1 2.0-dos; do for l in fr de es tr; do python3 tools/manuals/translate/manualtr.py build $m $l --check; done; done   # every run translated, markers intact
node --check js/help.js js/ui-text.js js/skins/classic/ui.js
```

In Chromium, a game per ruleset, Help menu's manual item clicked: `301` opens 3.0.1, `dos`/`12`/`mac20` open 2.0-dos,
`405`/`mac405` open 4.0.5; with the game in French or German, every version's manual item opens that language's folder (5.0.5 for Original/Claude/Gemini, 4.0.5 for 405/mac405, 3.0.1 for 301, 2.0-dos for dos/12/mac20) and the item reads
"Manuel : manuel de Spaceward Ho! …" (no "en anglais"); in English and German they open the English folder as before.
Every French page was rebuilt from the English page with "translation = English" first: the text, tags, links and images
of all 168 pages came out identical, so what differs in the French pages is the translation and nothing else. The French pages'
local links and pictures resolve exactly as the English ones' do (34 Word-export leftovers in 5.0.5, e.g. `*_files/filelist.xml`
and `ho5docs.html#...`, are broken in the English too and are left alone).
**Not run:** `tools/test.js`, `lang-test.js`, `human-play.js`, the full `ui-lang-audit` (nothing here changes a rule or a report).

## Optional

- `docs/translations.md`, "What stays English": the notes and the French manuals are now French; the manuals list gains `2.0-dos`,
  `3.0.1` and the `-fr` folders.
- `docs/source-inventory.md` / `docs/coverage-301.md`: *Mac 3.0 manual (printed, scanned): `assets/manuals/3.0.1/`, `3.0.1.pdf`;
  DOS 2.0 manual as HTML: `assets/manuals/2.0-dos/`.*
- Log the session names: Footnote Fizzbin (manuals), Professor Pamplemousse (translations), Admiral Apfelstrudel (German manuals), Capitán Churro (Spanish notes and manuals), Kaptan Kadayıf (Turkish notes and the 5.0.5 manual; the song rule), Paşa Pişmaniye (the Turkish 4.0.5, 3.0.1 and DOS 2.0 manuals).

## Spanish (added by Capitán Churro)

Spanish was done the same way as German, as a third column everywhere: `js/ui-text-notes-es.js` (363 rows; `node tools/notes-check.js --lang=es`
passes), `assets/manuals/{5.0.5,4.0.5,3.0.1,2.0-dos}-es/` (built by `manualtr.py build <folder> es`, 0 broken links beyond the English's own 34 Word
leftovers in 5.0.5) and `es:` entries in step 3's `js/help.js` blocks. The script tag in step 5 and the check loop under "Checked" now list `es`.
`manualtr.py` is 1.1.0 (adds the Spanish footer line). Not run in a browser or a game; only tables, built HTML and `notes-check` were checked.

## Turkish (added by Kaptan Kadayıf)

**Notes, ready to wire:** `js/ui-text-notes-tr.js` (363 rows; `node tools/notes-check.js --lang=tr` passes). Add its script tag to step 5,
after the Spanish one:

```html
<script src="js/ui-text-notes-tr.js"></script>
```

With that and step 6 (`ui.js` edits A–H, unchanged), About this version and Patch notes show in Turkish: tried in Chromium on a copy, a
Turkish game with the patch on in 3.0.1, 405, mac405, original, palm, ios and android (no English line, no page errors).

**Manuals: all four done** (5.0.5 by Kaptan Kadayıf; 4.0.5, 3.0.1 and 2.0-dos by Paşa Pişmaniye): `assets/manuals/{5.0.5,4.0.5,3.0.1,2.0-dos}-tr/`
(33 / 72 / 35 / 28 pages, `lang="tr"`), 0 broken links beyond the English 5.0.5's own 34. **Step 3 above now carries the `tr:` entries** in every
block (nine of them), so applying step 3 once wires French, German, Spanish and Turkish together; step 5 lists the Turkish script tag too.
Checked on a copy: every Find in steps 2 and 3 matches `js/help.js` exactly once, the result passes `node --check`, and each version's `tr` path
exists. The DOS 2.0, Mac 1.2 and Mac 2.0.1 entries point at `2.0-dos-tr/` although those versions have no Turkish yet (a Turkish game can't
be started in them today); the entry is harmless and ready for Jake's "every version, every language" work.

**Kaptan Kadayıf's package also overwrote three delivered pages:** `assets/manuals/5.0.5-fr/installing.html`, `5.0.5-de/` and `5.0.5-es/`'s (Jake: the
Clash lyric stays English in every language, Delta Tao's aside after it is translated). Their tables (`5.0.5/fr-3.tsv`, `de-3.tsv`,
`es-6.tsv`) changed with them. `tools/manuals/translate/manualtr.py` is 1.2.0 (the Turkish footer).
