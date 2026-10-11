# For the main Claudling: the AI homages package

This package finishes the remake's **AI homages**: the versions made by AIs from the Spaceward Ho! 5 manual, before the original developer's blessing made the real ones available. Claude's rules and the Cozy skin are already in the repo. This adds:

1. **Gemini's rules and AI.** Google's Gemini wrote every line, over many rounds of test results relayed by Jake.
2. **Gemini's skin**, "Tactical console": a dark, vector-drawn theme over classic.
3. **The homage notes:** a short "AI homage, play at your own risk" note whenever a player picks one of the homage rulesets or skins.
4. **A quiet divider in the menus** (no heading), plus honest names and years for the homages.

Every edit below was applied, all at once, to a fresh copy of Jake's latest upload and tested there (see the end). The edits are kept in `edits.py`, and this page's edit list was generated from it, so the two match: `python3 docs/ai-homages/edits.py apply <repo>` applies them all and stops if any find text has moved.

## The decisions (Jake's)

**Menus.**
- **No heading,** just a line, like the one the skin and OS look menus already have.
- **The Rules menu's first dropdown** becomes **"Ruleset version"**. Its last entry, after a line, is **"AI homages"**.
- **Skin menus:** the ruleset's own skins come first, then a line, then the originals, then a second line after Palm, then the homage skins.

**Names.**

| Kind | Name |
| --- | --- |
| Edition | Claude's rules (inspired by the 5.0.5 manual, 2026) |
| Edition | Gemini's rules (inspired by the 5.0.5 manual, 2026) |
| Skin | Cozy western (by Claude, 2026) |
| Skin | Tactical console (by Gemini, 2026) |

The homage skins carry their true years and no invented version numbers. In `js/skins.js` they're marked `homage: true`, which puts them after the originals and, with the second line, keeps them out of the originals' part of every menu.

**Defaults.**
- **Overall,** the default skin is still the newest original (classic).
- **Per ruleset:** Claude's rules open with Cozy, as before, and Gemini's rules open with Gemini's skin. Both offer classic next.

## Step 1: add the files (all new)

| Path | What |
| --- | --- |
| `js/rules-gemini.js`, `js/ai-gemini.js` | Gemini's rules and AI. Tidied by Claude with a header and trailing whitespace only; 8 seeded games played identically before and after. |
| `js/skins/gemini/ui.js`, `style.css` | Gemini's skin. Claude changed one character, with Jake's agreement: `<\\/script>` to `<\/script>` on the last line of `ui.js`, which otherwise loads a blank page. |
| `js/homage.js` | The homage notes: a self-contained file, using classic's window markup. Its words are in the `COMMON`, `RULES`, `SKINS` and `text()` tables at the top. |
| `docs/ai-homages/*` | This page, `edits.py`, and `preview-note.png`. |
| `docs/gemini-rules/*` | Gemini's README (its own words, with three footnoted accuracy corrections), the build history, a handoff, and Gemini's test runner (`tests/test-gemini.js`). |
| `docs/gemini-skin/*` | Gemini's README for the skin (its own words) and two previews. |

## Step 2: the edits to shared files

### `index.html`

**1. Load Gemini’s rules and AI (after the last ruleset).** Find:
```html
<script src="js/rules-mac405.js"></script>
```
Replace with:
```html
<script src="js/rules-mac405.js"></script>
<script src="js/rules-gemini.js"></script>
<script src="js/ai-gemini.js"></script>
```

**2. Load the homage notes (right after the skin loader).** Find:
```html
<script src="js/skins.js"></script>
```
Replace with:
```html
<script src="js/skins.js"></script>
<script src="js/homage.js"></script>
```


### `js/engine.js`

**3. The Node require list, near the end.** Find:
```js
  require('./rules-mac20.js'); require('./rules-mac405.js');
```
Replace with:
```js
  require('./rules-mac20.js'); require('./rules-mac405.js');
  require('./rules-gemini.js'); require('./ai-gemini.js');
```

**4. The editions table: Claude’s rules renamed; Gemini’s rules added, opening with Gemini’s skin.** Find:
```js
  claude: { family: 'remake', edition: { version: 'Claude', name: 'The remake’s own rules', platform: 'a web browser', year: 2026 }, skins: ['cozy', 'classic'] },
```
Replace with:
```js
  claude: { family: 'remake', edition: { version: 'Claude', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['cozy', 'classic'] },
  gemini: { family: 'remake', edition: { version: 'Gemini', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', platform: 'a web browser', year: 2026 }, skins: ['gemini', 'classic'] },
```


### `js/help.js`

**5. Gemini’s rules use the 5 manual too.** Find:
```js
  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
```
Replace with:
```js
  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  gemini: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
```


### `js/version-notes.js`

**6. An "About this version" entry for Gemini’s rules, before Claude’s.** Find:
```js
  claude: {
    intro: 'Not an original version:
```
Replace with:
```js
  gemini: {
    intro: 'Not an original version: an AI homage. Google’s Gemini wrote it from the Spaceward Ho! 5 manual alone, so the game could be played while the originals weren’t available, as an experiment alongside Claude’s rules. Gemini never saw the original program or the other rulesets; it worked from the manual, the engine, and test results relayed round by round.',
    previous: null,
    quirks: [],
    differs: [
      'Every number the manual doesn’t give is Gemini’s invention, and so are its jokes.',
      'Biologicals (“Space Monsters”) refuel by eating colonists, wherever they are.',
      'Bankruptcy has consequences: colonists riot, research in progress is lost, most stored metal is seized, and half of every fleet is repossessed and sold toward the debt.',
      RANDOM, HOTSEAT,
    ],
    missing: [],
    changes: [],
  },
  claude: {
    intro: 'Not an original version:
```


### `js/skins.js`

**7. Cozy gets its honest name and year, marked as an homage, and Gemini’s skin joins it.** Find:
```js
  { id: 'cozy', version: '5.0.5', platform: 'cozy western, upscaled art', year: 2003, os: ['macos8', 'macos9', 'macosx'] },
```
Replace with:
```js
  { id: 'cozy', version: 'Cozy western', platform: 'by Claude', year: 2026, homage: true, os: ['macos8', 'macos9', 'macosx'] },
  { id: 'gemini', version: 'Tactical console', platform: 'by Gemini', year: 2026, homage: true, os: ['macosx', 'macos9', 'win95', 'macos8', 'system7', 'win31'] },
```

**8. The overall default is the newest original (a ruleset can still open with an homage skin of its own).** Find:
```js
const newest = list[list.length - 1].id; // the list runs oldest to newest
```
Replace with:
```js
const newest = (list.filter(s => !s.homage).pop() || list[list.length - 1]).id; // the newest original (the list runs oldest to newest; the AI homages come last and aren't the overall default)
```


### `js/skins/classic/ui.js`

**9. The last ruleset version is the AI homages.** Find:
```js
remake: 'Claude (the remake’s)', claude: 'Claude (the remake’s)' };
```
Replace with:
```js
remake: 'AI homages', claude: 'AI homages' };
```

**10. Edition names for the two AI homages (and Gemini’s rules open with Gemini’s skin).** Find:
```js
  claude: { family: 'remake', name: 'The remake’s own rules', skins: ['cozy', 'classic'] },
};
```
Replace with:
```js
  claude: { family: 'remake', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['cozy', 'classic'] },
  gemini: { family: 'remake', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['gemini', 'classic'] },
};
```

**11. Skin and look menus: a second line before the AI homages.** Find:
```js
// a select's options: the own ones, a line, then all the others
function fillOwnFirst(sel, own, all, value, name) {
  sel.replaceChildren(...own.map(id => el('option', { value: id }, name(id))),
    ...(own.length && all.some(id => !own.includes(id)) ? [sepOption()] : []),
    ...all.filter(id => !own.includes(id)).map(id => el('option', { value: id }, name(id))));
```
Replace with:
```js
// a select's options: the own ones, a line, then all the others, with the AI
// homages (skins marked homage: true in js/skins.js) last, after a second line
const isHomage = (id) => ((window.HOSKINS && HOSKINS.list) || []).some(k => k.id === id && k.homage);
function fillOwnFirst(sel, own, all, value, name) {
  const rest = all.filter(id => !own.includes(id)), orig = rest.filter(id => !isHomage(id)), hom = rest.filter(isHomage);
  const opt = (id) => el('option', { value: id }, name(id));
  sel.replaceChildren(...own.map(opt),
    ...(own.length && rest.length ? [sepOption()] : []),
    ...orig.map(opt),
    ...(orig.length && hom.length ? [sepOption()] : []),
    ...hom.map(opt));
```

**12. "Version" becomes "Ruleset version" (the menu).** Find:
```js
  const famSel = el('select', { name: 'version', 'aria-label': 'Version' });
```
Replace with:
```js
  const famSel = el('select', { name: 'version', 'aria-label': 'Ruleset version' });
```

**13. A line before the AI homages in the Ruleset version menu.** Find:
```js
  famSel.append(...familyList().map(fm => el('option', { value: fm, selected: fm === famNow ? 'selected' : false }, FAMILY_NAMES[fm] || fm)));
```
Replace with:
```js
  famSel.append(...familyList().flatMap(fm => [...(fm === 'remake' ? [sepOption()] : []), el('option', { value: fm, selected: fm === famNow ? 'selected' : false }, FAMILY_NAMES[fm] || fm)]));
```

**14. "Version" becomes "Ruleset version" (the label).** Find:
```js
    el('label', null, el('span', null, 'Version'), famSel),
```
Replace with:
```js
    el('label', null, el('span', null, 'Ruleset version'), famSel),
```


### `tools/human-play.js`

**15. Gemini’s rules join the browser test.** Find:
```js
const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude', 'mac20', 'mac405'];
```
Replace with:
```js
const ALL = ['12', 'dos', '301', '405', 'original', 'palm', 'claude', 'mac20', 'mac405', 'gemini'];
```

**16. The homage notes would cover the New Game window: hide them for the test.** Find:
```js
  await page.addInitScript((rules) => { try { if (!sessionStorage.getItem('hp')) { localStorage.clear(); localStorage.setItem('ho5.rules', rules); sessionStorage.setItem('hp', '1'); } } catch (e) {} }, rules);
```
Replace with:
```js
  await page.addInitScript((rules) => { try { if (!sessionStorage.getItem('hp')) { localStorage.clear(); localStorage.setItem('ho5.rules', rules); sessionStorage.setItem('hp', '1'); } } catch (e) {} }, rules);
  // the homage notes (js/homage.js) would cover the New Game window: hide them for the test
  await page.addInitScript(() => { try { for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
```


### `tools/test.js`

**17. The headless test’s usage line.** Find:
```js
// Headless AI-vs-AI test: node tools/test.js <claude|original|dos|405|301|12|palm|mac20|mac405> [--patch]
```
Replace with:
```js
// Headless AI-vs-AI test: node tools/test.js <claude|original|dos|405|301|12|palm|mac20|mac405|gemini> [--patch]
```


## What was tested (Jake's latest upload, with everything above applied)

- **Every edited file passes a syntax check.**
- **`node tools/test.js gemini`:** three games, one ending in a computer conquest.
- **`node tools/human-play.js`:** all ten rulesets pass, Gemini's included, with every shadow check the same.
- **The same test through each homage skin:** through Cozy and through Gemini's skin, the Original, Claude's and Gemini's rules all pass.
- **The menus, checked in the browser:**
  - The overall default skin is classic.
  - "Ruleset version" reads 1.2 | 2.0 | 3.0 | 4.0 | 5 | ── | AI homages.
  - Both edition names show as above.
  - Picking Claude's rules selects Cozy; picking Gemini's selects Gemini's skin.
  - Every skin menu (the title screen, New Game, and the Ho! menu, which share the same code) puts a line after Palm and lists the homages after it.
- **The homage notes:** a note appears when Claude's or Gemini's rules are picked, and when the player switches to Cozy or to Gemini's skin. There were no page errors.
- **`python3 tools/bundle.py`:** classic, cozy and gemini each build, and the Cozy and Gemini builds open from disk with the notes loaded.

## Later

- **Adding another homage:**
  - give its skin `homage: true` in `js/skins.js`, or put its rules in the `remake` family;
  - add it to `RULES` or `SKINS` in `js/homage.js`;
  - add it to the note-hiding line in `tools/human-play.js`.
- **Each homage keeps its own docs:**
  - `docs/claude-rules/` (already in), `docs/cozy-skin/` (already in), `docs/gemini-rules/` and `docs/gemini-skin/`.
  - Their older "for the main Claudling" pages are replaced by this one.
