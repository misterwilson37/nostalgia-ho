// Spaceward Ho! web remake: one review document per language, for a second
// reader (Gemini) to proofread the remake's own translations.
//
//   node tools/translation-review.js [--out=<dir>] [--before=<dir>] [--help]
//
// --help: the hover help instead (js/ui-text-help.js), as help-review-<lang>.md:
// Part A the changes, Part B the tooltips, Part C the official words.
//
// Writes <out>/review-fr.md, review-de.md, review-tr.md, review-es.md
// (default out: ./translation-review). Each holds, for its language only:
//   A. the rows changed since --before (a copy of the repo's js/ before a
//      proofreading pass), old and new, to be checked first;
//   B. the game's text the remake wrote (js/lang-remake.js: own, over,
//      adapted with the official English it was adapted from, words, techs,
//      classes, fill, win);
//   C. the interface the remake wrote (js/ui-text.js rows that are not an
//      official translation's, adapted ones marked);
//   D. the official interface words, as a reference only (never corrected).
// Every row has an ID (G-... for the game's text, U-<row> for the
// interface) so corrections can be applied back by ID.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARGS = process.argv.slice(2);
const arg = (k, d) => { const a = ARGS.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = path.resolve(arg('out', path.join(ROOT, 'translation-review')));
const BEFORE = arg('before', null);
const HELP = ARGS.includes('--help');
const UIFILE = HELP ? 'ui-text-help.js' : 'ui-text.js';
const P = HELP ? 'H' : 'U';                       // the interface rows' ID prefix
const PT = HELP ? { ui: 'B', off: 'C', last: 'B' } : { ui: 'C', off: 'D', last: 'C' }; // part letters

const LANGS = {
  fr: { name: 'French', col: 1, own: 'Français' },
  de: { name: 'German', col: 2, own: 'Deutsch' },
  tr: { name: 'Turkish', col: 3, own: 'Türkçe' },
  es: { name: 'Spanish (Spain)', col: 4, own: 'Español' },
};

// ---------- loading ----------
function loadUI(jsDir) {
  const file = path.join(jsDir, UIFILE);
  const rows = [];
  const g = { HOUI: { add: (a) => rows.push(...a) } };
  // the file is an IIFE over window/globalThis: run it with a stand-in root
  new Function('window', 'globalThis', fs.readFileSync(file, 'utf8'))(g, g);
  // each row's section: the nearest "// ..." comment line before it
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const notes = [];
  let note = '';
  lines.forEach((ln, i) => {
    if (i > (HELP ? 6 : 13) && /^\/\/ /.test(ln) && !/^\/\//.test(lines[i - 1])) note = ln.replace(/^\/\/\s*-*\s*/, '').replace(/\s*-+\s*$/, '');
    if (/^\[['"]/.test(ln)) notes.push(note);
  });
  if (notes.length !== rows.length) throw new Error(`${UIFILE}: ${rows.length} rows but ${notes.length} row lines`);
  return rows.map((r, i) => ({ r, note: notes[i] }));
}
function loadGame(jsDir) {
  const file = path.join(jsDir, 'lang-remake.js');
  const m = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(file, 'utf8'))(m, m.exports);
  return m.exports;
}

const ui = loadUI(path.join(ROOT, 'js'));
const game = loadGame(path.join(ROOT, 'js'));
const uiBefore = BEFORE ? loadUI(BEFORE) : null;
const gameBefore = BEFORE ? loadGame(BEFORE) : null;

// ---------- the game's text as flat rows ----------
// [id, section, English, translation, adaptedFrom]
function gameRows(L) {
  const out = [];
  const walk = (o, sec, pre) => {
    let n = 0;
    for (const [k, v] of Object.entries(o)) {
      n++;
      const id = `G-${sec}${pre ? '.' + pre : ''}-${n}`;
      if (typeof v === 'string') out.push({ id, sec, key: (pre ? pre + '.' : '') + k, en: k, tr: v });
      else if (Array.isArray(v) && typeof v[0] === 'string') out.push({ id, sec, key: (pre ? pre + '.' : '') + k, en: k, tr: v[0], from: v[1] });
      else if (v && typeof v === 'object') walk(v, sec, (pre ? pre + '.' : '') + k);
    }
  };
  for (const sec of ['over', 'own', 'adapted', 'words', 'techs', 'classes', 'fill', 'win']) if (L[sec]) walk(L[sec], sec, '');
  return out;
}

// ---------- markdown ----------
const cell = (s) => String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ⏎ ');
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map(r => `| ${r.map(cell).join(' | ')} |`)].join('\n');

const SEC_TITLE = {
  over: 'Replacements for official lines that were broken (a filling lost, a word left in English)',
  own: 'The remake\'s own lines (reports, alerts, hints, questions)',
  adapted: 'Adapted from an official line (official translation edited for a slightly different English)',
  words: 'Whole fillings (words dropped into other lines)',
  techs: 'Technology names (filled into "Your %s technology…" lines)',
  classes: 'Ship classes', fill: 'Other fillings', win: 'Window words (battle window, Options, Explored list…)',
};

function guidance(code) {
  const common = `
**Conventions that apply to every language here**

- \`%s\` and \`%d\` are fillings (names, numbers, other phrases). Keep every one, in a sensible order. \`%1$s\`, \`%2$s\`… are fillings by position, used where the language needs a different order than English. \`%%\` is a literal percent sign. Never translate or drop a placeholder.
- **In this remake \`%s\`, \`%d\` and \`%.*s\` are interchangeable**: both of its formatters (the game's and the interface's) turn every filling into text the same way, and plain and positional fillings may be mixed in one line (a plain \`%s\` takes the first filling). Translations use \`%s\` for \`%d\` throughout, and that is tested. Do not flag a placeholder's letter; flag only a filling that is missing, extra, or in the wrong place for the meaning.
- \`⏎\` in this document marks a line break inside the string; keep it where it is.
- Names stay English: star names, computer players' names, ship design names, "Spaceward Ho!", "Game Center", "Hoedown", "Master Points" (in French), "Ship Info", "Cancel Fleet Trip", "Ships" (old Mac menu names quoted inside hints). Two jokes depend on stars literally named **Hope** and **Ship**, so those words stay English inside the jokes.
- The game is a 1990s space-western strategy game with a jokey tone (cowboy ranks, "best buddies", an "armageddon device" with eleven silly confirmation questions). Keep jokes funny, not literal.
- Typography follows each language's norms (e.g. French spaces before \`: ; ? !\`).
- Lines in **Part ${PT.off}** are the shipped official translations. They are reference only: do not correct them, but do flag a remake line that contradicts their vocabulary.
- Some lines look odd in English because the original game's English is odd ("It also so shows", "with with", "armadeddon"). Translate the intended meaning; do not reproduce the typo.`;
  const per = {
    fr: `
**French house rules**

- Address the player as **vous**.
- The voice is that of the official iOS French and the 1992 French Mac edition (1.2F). Their words for the game's things: vaisseau, flotte, étoile, recycler (scrap), évacuer, Epargne / épargne (savings), Fin Tour, Distance / Vitesse / Armes / Boucliers / Mini (tech), Eclaireur, Croiseur, Transport (colony ship), Epouvante (dreadnought), Leurre (decoy), Biologique, pluie de météores, Armageddon, meilleur ami, alliance / allié, "Organiser Flottes".
- "Master Points" stays in English (as iOS's French has it).
- "les belles petites planètes" (good planets) is the official iOS French idiom, used in several official hints: keep it.
- The remake keeps some official slips verbatim in **official** lines (e.g. "Bravo! Vous avez gagné." without the space): do not flag those.`,
    de: `
**German house rules**

- Address the player as **Sie**.
- The voice is that of the official German DOS 2.0 (1993) and the German Amiga 2.0. Reports are in the **present tense** ("Ihre Flotte von %s erreicht %s.", "Sie verlieren %d Schiffe."). Numbers as "1.234".
- Official / established words: Weite (range, tech bar) and Reichweite in prose, Tempo, Waffen, Schilder (only as the DOS 2.0's tech-bar label; in prose the correct plural "Schilde" is used), Mini; Reichweitentech, Tempotech, Waffentech, Schildtech, Minitech; Späher, Kampfschiff, Kolonieschiff, Satellit, Tanker, Schlachtschiff (dreadnought), Bioschiff, Täuschschiff (decoy); Sparen (savings bar), Ersparnisse (savings money), Schiffsbau, Zug Ende, verschrotten (scrap), abwracken (dismantle), verlassen (3.0.1/4.0.5 Abandon), räumen (5.0.5 Evacuate), Funkspruch (a message; "%s sendet einen Funkspruch: …"), Meteoritenschauer, Glückwunsch!, Bündnis, Verbündete, beste Kumpel, kapitulieren, Armageddon-Maschine, Radikalforscher, Galaxis.
- Jokes keep their stars: "Willst du wahrhaftig alle Hope fahren lassen?" (Dante, on a star called Hope), "Ship verlassen? Alle Mann von Bord!" (a star called Ship).
- One hint copies the DOS 2.0's own sentence verbatim, including its old spelling "daß": leave that.`,
    tr: `
**Turkish house rules**

- Address the player as **sen**.
- The voice is that of the official iOS/Android Turkish. Its words: Birikim (savings), Tahliye Et (evacuate), Sıran Bitti / sıra (turn), Filoları Hazırla (Organize Fleets), Menzil (range), Hız, Silâhlar, Kalkanlar, Mini, Tuzak (decoy), Metâl (with the circumflex, as iOS writes it), Armageddon aygıtı, hurdaya çıkar (scrap), parçala (dismantle), Savunucu (Defensive stance).
- **Allies**: the official game messages say **ortak / ortaklık** ("Sen ve ortakların…", "en iyi oyun arkadaşı"); the official interface labels say **Müttefik**. The remake keeps the same split (game text "ortak", interface "müttefik"): do not unify them.
- Official exclamations and idioms in adapted lines ("O, O!", "Keyiflen.", "Vay anasını!") are the official voice: keep them.
- **Suffix convention (deliberate, do not "fix")**: like the official iOS Turkish, a case suffix is written straight onto a placeholder with a fixed form, whatever the name's vowels: "%sye", "%sde", "%syi", "%snin" — so a game may show "Argotye", "Polluxyi". This matches the official lines around them. Only flag a suffix if it is wrong *as a fixed form* (wrong case for the meaning).
- Percentages: "%%s" means "%50" (the percent sign before the number, as Turkish writes it). Keep it.`,
    es: `
**Spanish house rules**

- Peninsular Spanish (Spain): **tú** for the player, **vosotros** where the English means "you and your allies" ("Tus aliados y tú habéis conquistado la galaxia"); "ordenador", "coste".
- There was never an official Spanish Spaceward Ho!, so **every** Spanish line is the remake's. It follows the French and German officials' choices in Spanish form.
- Glossary: nave, flota, estrella; Explorador, Caza, Nave colonia, Satélite, Acorazado, Cisterna (tanker), Bionave, Señuelo (a class is capitalised where the English writes it as a name, "Build Satellites" → "Construye Satélites", "una Nave colonia"; ordinary mentions stay lower-case where the English\'s are, "a decoy ship" → "un señuelo", "that many tankers" → "tantas cisternas"); Alcance, Velocidad, Armas, Escudos, Miniaturización, Radical; abandonar / evacuar; desguazar (scrap) / desmantelar (dismantle); terraformar, minas, ahorros; alianza, aliado, mejor amigo ("amistad del alma"); rendirse; máquina del Armagedón; lluvia de meteoritos; investigadores radicales; reports in the perfect tense ("Has explorado %s.").
- "You %slost…" is "Has perdido%s…" with " junto a tus aliados" filled in; "%s lost %d" is "Pérdidas de %s: %d" (so it agrees with a name and with "tus enemigos" alike). These are deliberate.
- Jokes keep their stars: "¿En verdad deseas abandonar toda Hope?", "¿Abandonar Ship? …".
- Quotation marks: the game's text uses “ ” and the interface uses « ». If you think one style should win everywhere, say so once in your notes rather than flagging every row.`,
  };
  return common + '\n' + per[code];
}

function instructions(code) {
  const L = LANGS[code];
  return `# Spaceward Ho! web remake: ${L.name} ${HELP ? 'hover help' : 'translation'} review

You are proofreading, as a native ${L.name} speaker and careful game localiser, the ${L.name} text of a fan remake of *Spaceward Ho!* (Delta Tao, 1990s). Some versions of the game shipped official translations; where they didn't, the remake wrote its own, in the voice of the nearest official translation. **Your job is to check the remake's own text** (Parts A–${PT.last}), not the official text (Part ${PT.off}, reference only).${HELP ? `

This document is the **hover help**: the short explanations that pop up when the pointer rests on part of the screen. Each is a paragraph from one of the original manuals (5.0.5's help book, the Windows 4.0.5 help, 3.0's Quick Help, the DOS 2.0 manual), trimmed for a tooltip, and translated by the remake. Several paragraphs say nearly the same thing in different manuals' words; their translations should agree where the English agrees. Keep them tooltip-short: plain, clear instructions matter more than elegance. The quoted English window titles with DITL numbers ("Fleet Can’t Reach", DITL 3330) name the original program's dialogs and stay English by design.` : ''}

Two writers have touched this text already: the translator who wrote it, and a first proofreader (Claude) whose changes are listed in **Part A**. Please check Part A first, then read ${HELP ? 'Part B' : 'Parts B and C'}.

## What to look for

1. **Errors**: grammar, spelling, agreement, wrong meaning, a placeholder lost or misplaced, a word left in English that shouldn't be.
2. **Unnatural wording**: correct but not what a native speaker would write in a game's interface.
3. **Inconsistency**: the same game term translated two ways; a line that contradicts the house vocabulary below or the official words in Part ${PT.off}.
4. **Tone**: a joke that fell flat, or a register that's off (too stiff, too slangy).

Do **not** rewrite lines that are fine just to put them your way. A short list of real problems is worth more than a long list of preferences.

## How to answer

Reply with one Markdown table, one row per problem, in the order the IDs appear:

| ID | Severity | Current | Suggested | Why (in English) |
|---|---|---|---|---|

- **ID**: the row's ID exactly as given (e.g. ${HELP ? '\`H-12\`' : '\`U-412\`, \`G-own-37\`'}). For Part A, list only the changes you **disagree** with; if you agree with them all, write "Part A: all agreed" above the table instead.
- **Severity**: \`error\` (wrong), \`awkward\` (unnatural), or \`style\` (optional polish).
- **Suggested**: the complete corrected string, placeholders included, ready to paste.
- After the table, add at most a few lines of general notes (patterns you saw, questions).

If a part has no problems, say so in one line.
${guidance(code)}
`;
}

function build(code) {
  const L = LANGS[code];
  const col = L.col;
  const parts = [instructions(code)];

  // ---- A: changed rows ----
  const changed = [];
  if (BEFORE) {
    const gb = new Map(gameRows(gameBefore[code] || {}).map(x => [x.sec + '|' + x.key, x]));
    if (!HELP) for (const x of gameRows(game[code] || {})) {
      const b = gb.get(x.sec + '|' + x.key);
      if (b && b.tr !== x.tr) changed.push([x.id, x.en, b.tr, x.tr]);
    }
    ui.forEach(({ r }, i) => {
      const b = uiBefore[i] && uiBefore[i].r;
      if (b && b[0] === r[0] && b[col] !== r[col]) changed.push([`${P}-${i}`, r[0], b[col], r[col]]);
    });
  }
  parts.push(`## Part A. Claude's corrections in this pass (${changed.length}) — check these first\n\n` +
    (changed.length ? table(['ID', 'English', 'Before', 'After (current)'], changed) : '_No changes recorded for this language._'));

  if (!HELP) {
  // ---- B: the game's text ----
  const g = gameRows(game[code] || {});
  let b = `## Part B. The game's text (the remake's own, ${g.length} rows)\n\nThese are the game's reports, alerts, hints and window words. The English is the original game's, quirks included.\n`;
  for (const sec of ['over', 'own', 'adapted', 'words', 'techs', 'classes', 'fill', 'win']) {
    const rows = g.filter(x => x.sec === sec);
    if (!rows.length) continue;
    b += `\n### ${SEC_TITLE[sec]} (${rows.length})\n\n`;
    if (sec === 'adapted') {
      b += 'Each was made by editing the official translation of the "Adapted from" English as little as the difference needs. **The line to check is the "English" column**; "Adapted from" is only the official source line, shown for context (its placeholders are not this line\'s). Check that the edit fits the new English; the rest of the sentence is official wording, and its style (its idioms, its exclamations) is not for correcting. Flag only outright errors: grammar, a wrong form of address, a typo.\n\n';
      b += table(['ID', 'English', 'Adapted from (official English)', L.own], rows.map(x => [x.id, x.en, x.from, x.tr]));
    } else if (sec === 'classes') {
      b += table(['ID', 'English', `${L.own} (singular)`, 'Plural'], rows.map(x => [x.id, x.en, x.tr, x.from]));
    } else {
      b += table(['ID', sec === 'win' ? 'Window word (key)' : 'English', L.own], rows.map(x => [x.id, sec === 'win' ? x.key : x.en, x.tr]));
    }
    b += '\n';
  }
  parts.push(b);
  }

  // ---- C: the interface ----
  const mine = [], official = [];
  ui.forEach(({ r, note }, i) => {
    const src = r[5] && r[5][code];
    const row = [`${P}-${i}`, note, r[0], r[col]];
    if (src && !String(src).startsWith('~')) official.push([...row, src]);
    else mine.push([...row, src ? `adapted from ${String(src).slice(1)}` : 'remake']);
  });
  // group by section note, to keep context readable
  let c = HELP
    ? `## Part B. The hover help (${mine.length} rows)\n\nThe tooltips, grouped by the manual they come from. The last rows are the help pages' names (shown as the tooltip's source line, "Adapted from the … manual: <page>").\n`
    : `## Part C. The remake's interface (${mine.length} rows)\n\nMenus, buttons, window titles, help text and messages of the remake's own interface, grouped by where they appear. "adapted" rows edit an official word for a slightly different English; "remake" rows are the remake's own.\n`;
  let cur = null, buf = [];
  const flush = () => { if (buf.length) c += `\n### ${cur || 'General'}\n\n` + table(['ID', 'English', L.own, 'Status'], buf) + '\n'; buf = []; };
  for (const [id, note, en, t, st] of mine) { if (note !== cur) { flush(); cur = note; } buf.push([id, en, t, st]); }
  flush();
  parts.push(c);

  // ---- D: official reference ----
  parts.push(`## Part ${PT.off}. Official ${HELP ? 'words in the hover help' : 'interface words'} (reference only — do not correct)\n\n` + (official.length
    ? table(['ID', 'English', L.own, 'Source'], official.map(([id, , en, t, s]) => [id, en, t, s]))
    : `_${L.name} has no official translation ${HELP ? 'of the hover help' : 'of the interface'}: every row above is the remake's._`));

  return parts.join('\n\n') + '\n';
}

fs.mkdirSync(OUT, { recursive: true });
for (const code of Object.keys(LANGS)) {
  const md = build(code);
  const f = path.join(OUT, `${HELP ? 'help-review' : 'review'}-${code}.md`);
  fs.writeFileSync(f, md);
  console.log(`${f}: ${md.length} characters`);
}
