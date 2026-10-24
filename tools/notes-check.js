// The version notes and patch notes in each language, checked:
//   node tools/notes-check.js [--lang=fr] [--list]
//
// For every js/ui-text-notes-<code>.js it finds, reads each row as HOUI.add
// would and fails on:
//   - a source line with no row: a line of js/version-notes.js (HOVERSIONS;
//     every string of every version's lists, Delta Tao's change lists and
//     their source line included), a fix's title or text (rs.fixes of every
//     ruleset, patched ones too), or one of the notes' two suffix lines
//     (NOTE_SUFFIXES, which the About window adds to a quirk its patch fixes);
//   - a row whose English isn't a source line any more (a stale row: the
//     notes were edited and the translation wasn't);
//   - a translation whose %s / %d fillings aren't its English's;
//   - a translation left empty, or identical to its English where the line
//     isn't a version label or number (the strings in SAME below).
// --list prints the lines that fail, in full. Exit code 1 on any failure.
// Version 1.1.0 (1.1.0: fails when a language has no notes file)
'use strict';
const path = require('path'), fs = require('fs'), root = path.join(__dirname, '..');
const ARGS = process.argv.slice(2);
const ONLY = (ARGS.find(a => a.startsWith('--lang=')) || '').slice(7) || null, LIST = ARGS.includes('--list');
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => /^rules-.*\.js$/.test(f))) require(path.join(root, 'js', f));

// the two lines js/skins/classic/ui.js adds after a quirk its patch fixes
const NOTE_SUFFIXES = ['(fixed in this game by the %s patch: see Patch notes)', '(fixed in the %s patch)'];
// lines that are the same in every language (versions, sizes, labels)
const SAME = /^(\d+(\.\d+)*( \(Mac\))?|iOS \d+(\.\d+)*|\d+ MB)$/;

const sandbox = {};
new Function('root', fs.readFileSync(path.join(root, 'js/version-notes.js'), 'utf8').replace('})(this);', '})(root);'))(sandbox);
const source = new Set(NOTE_SUFFIXES);
(function walk(o) {
  if (typeof o === 'string') source.add(o);
  else if (Array.isArray(o)) o.forEach(walk);
  else if (o && typeof o === 'object') for (const k in o) { if (['url', 'show', 'fix'].includes(k) && typeof o[k] !== 'object') continue; walk(o[k]); }
})(sandbox.HOVERSIONS);
for (const rs of Object.values(HO.RULESETS)) for (const f of rs.fixes || []) for (const k of ['title', 'text']) if (typeof f[k] === 'string') source.add(f[k]);

const COL = { fr: 1, de: 2, tr: 3, es: 4 };
const files = fs.readdirSync(path.join(root, 'js')).map(f => (f.match(/^ui-text-notes-([a-z]{2})\.js$/) || [])[1]).filter(Boolean).filter(c => !ONLY || c === ONLY);
if (!files.length) { console.log('No js/ui-text-notes-<code>.js to check.'); process.exit(1); }
// every interface language must have its notes file (a language added to js/ui-text.js without one fails)
const absent = ONLY ? [] : Object.keys(COL).filter(c => !files.includes(c));
if (absent.length) { console.log('Missing notes file(s): ' + absent.map(c => `js/ui-text-notes-${c}.js`).join(', ')); process.exit(1); }
const ph = (s) => (s.match(/%(?:\d+\$)?[sd]/g) || []).sort().join(' ');
let failed = 0;
for (const code of files) {
  const rows = [];
  new Function('root', fs.readFileSync(path.join(root, `js/ui-text-notes-${code}.js`), 'utf8').replace("})(typeof window !== 'undefined' ? window : globalThis);", '})(root);'))({ HOUI: { add: (r) => rows.push(...r) } });
  const have = new Map(); const problems = { missing: [], stale: [], filling: [], empty: [], same: [], dup: [] };
  for (const r of rows) {
    const t = r[COL[code]];
    if (have.has(r[0])) problems.dup.push(r[0]);
    have.set(r[0], t);
    if (!source.has(r[0])) problems.stale.push(r[0]);
    if (typeof t !== 'string' || !t.trim()) { problems.empty.push(r[0]); continue; }
    if (ph(r[0]) !== ph(t)) problems.filling.push(r[0]);
    if (t === r[0] && !SAME.test(r[0])) problems.same.push(r[0]);
  }
  for (const s of source) if (!have.has(s)) problems.missing.push(s);
  const n = Object.values(problems).reduce((a, l) => a + l.length, 0);
  console.log(`${code}: ${rows.length} rows, ${source.size} source lines — ${n ? n + ' problem(s)' : 'ok'}`);
  for (const [k, l] of Object.entries(problems)) if (l.length) { console.log(`  ${k}: ${l.length}`); if (LIST) l.forEach(s => console.log('    - ' + s)); else l.slice(0, 3).forEach(s => console.log('    - ' + s.slice(0, 90))); }
  failed += n;
}
process.exit(failed ? 1 : 0);
