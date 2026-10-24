# For the main Claudling: integrating the version notes and patch notes in French

Jake asked a separate Claude ("Professor Pamplemousse") to translate the long English
texts that `docs/translations.md` lists under "What stays English". This is the first
language: **French**, the version notes and patch notes. German, Turkish and Spanish
follow as their own files in the same shape. The manuals are a later phase.

The zip mirrors the repo. **Step 1 is all that is required** for the French to show;
Steps 2 and 3 take away the page's "These notes are in English" line and its English
markings. Everything below was run in Chromium before handoff (see "What was checked").

## Step 1: drop in the files (required)

| File | What |
| --- | --- |
| `js/ui-text-notes-fr.js` | **Add.** 363 rows `[English, French, null, null, null]` for `HOUI.add`. |
| `tools/notes-check.js` | **Add.** Fails on a missing, stale or mis-filled row. |
| `docs/translations-notes/*` | **Add.** This page, README, HANDOFF and `work/` (the translators' tables). |

Then load it: **edit I** below (one script tag in `index.html`).

Check with:

```
node tools/notes-check.js --lang=fr      # fr: 363 rows, 363 source lines - ok
```

With only Step 1 and the script tag, the French already shows in About this version
and Patch notes (`el()` puts every string through `HOUI.tr` as the element is built),
but the page still says "Ces notes sont en anglais." and marks the text `lang="en"`
`translate="no"`, so a change of language mid-window won't redo it.

## Step 2: the notes' English line and markings (`js/skins/classic/ui.js`, recommended)

Eight search/replace edits, in this order. Each `Find` text appears exactly once.
They make a document English only when a line of it has no row: a language that has
the notes loses the English line, and a language that hasn't (German, Turkish and
Spanish today) behaves exactly as before.

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

## Step 3: the other two edits (recommended)

**I. index.html: load the file (one line per language, after the hover help's)**

`index.html`:

Find:
```js
<script src="js/ui-text-help.js"></script>
```
Replace with:
```js
<script src="js/ui-text-help.js"></script>
<script src="js/ui-text-notes-fr.js"></script>
```

**J. tools/ui-lang-audit.js: read the notes files too (so --count and the audit know their words)**

`tools/ui-lang-audit.js`:

Find:
```js
try { require(path.join(root, 'js/ui-text-help.js')); } catch (e) { /* (not there yet) */ }
```
Replace with:
```js
try { require(path.join(root, 'js/ui-text-help.js')); } catch (e) { /* (not there yet) */ }
for (const f of require('fs').readdirSync(path.join(root, 'js')).filter(f => /^ui-text-notes-[a-z]{2}\.js$/.test(f))) require(path.join(root, 'js', f));
```

Each new language adds one more script tag (`ui-text-notes-de.js`, `-tr.js`, `-es.js`);
`tools/ui-lang-audit.js` (edit J) picks them up by name with no further change.

## Things to know

- **Hoedown stays English.** The Full Hoedown list (`rs.hoedown.items`, Delta Tao's jokes)
  is not in `version-notes.js` and isn't part of this job; it keeps `translate="no"`
  and `lang="en"`. It could be a later file.
- **`HOUI.count()` / `ui-lang-audit.js --count`** will print "N missing" for German, Turkish
  and Spanish until their files exist: the rows carry `null` there on purpose.
- **A line edited in `version-notes.js` or a ruleset's `fixes`** makes its row stale. Run
  `node tools/notes-check.js`; it names the line. Edit the row's English to match, and its
  French if the meaning changed.
- **Delta Tao's change lists** are quoted word for word in English; the French rows are the
  remake's translation of them, and the source line says "(en anglais)".
- **What was checked:** `notes-check` (clean; broken on purpose to see it fail); every one of
  the 361 source lines has a French row, none collides with an existing row; Chromium, 4.0.5
  with the patch on, game in French: About this version and Patch notes show French, no
  English line after the edits, one `translate=no` element left (the Hoedown list), no page
  errors, the fixed-by-the-patch suffix in French. **Not run:** `tools/lang-test.js`,
  `tools/ui-lang-audit.js` in full, other rulesets in the browser. No native-French review yet.
