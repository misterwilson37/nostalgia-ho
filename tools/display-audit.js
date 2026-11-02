// The display audit: every routine of a program, one row, and what the program puts in front of the player.
//   node tools/display-audit.js <version> [--list] [--open] [--gaps]
//
// A program's routines are not all rules. Some draw, write text, build a string the player reads, show a window, alert,
// menu, list or report, play a sound, set a cursor, enable or dim a menu item. The rules were read from each decompile;
// this audit reads the DISPLAY side the same way: for each routine, what it puts in front of the player (the exact
// strings, resources, formats, and layout facts: positions, fonts, sizes, order), the remake's corresponding place, and
// a status:
//   matched   the remake shows the same; "how" says how it was verified (rendered and compared, or code read side by side)
//   fixed     the remake showed something else and was changed; "fix" is the commit
//   notShown  the remake does not show it; "reason" says why (printing, file dialogs, network, copy protection ...)
//   internal  the routine is purely internal (runtime, arithmetic, files, rules): it shows nothing; "reason" says how that
//             was checked
//   open      not yet done: the tool FAILS while any row is open
// A row may also carry "gap": true. That is a mismatch found by the audit that was NOT fixed (the remake shows something else, or
// less, than the original, and the reason says what and why); it is counted and listed with --gaps. "diff" on a matched or fixed row
// names a difference that was kept on purpose (the remake's own layout or wording, said plainly).
//
// The data is docs/display/<version>.json: { version, program, routines: "<coverage doc>", rows: [ ... ] }, a row:
//   { r: routine, a: address (hex, as in the coverage doc), seg, shows, remake: ["file:function", ...], status,
//     how | reason, fix, formats: ["family", ...] }
// The tool fails when
//   - a routine of the version has no row (the list is the coverage doc's table, docs/coverage-<version>.md, and, when the
//     private sources repo is beside this one (or HO_SOURCES is set), the decompile's index.tsv there as well), or a row
//     names no routine of it, or a routine has two rows;
//   - a row has no status or no reason ("how" for matched, "fix" for fixed, "reason" otherwise);
//   - any row is open;
//   - a matched or fixed row names no place in the remake, or the place (file and function) is not in the source;
//   - a row's "formats" names a family that tools/format-audit.js does not have (numbers are audited there: link, don't repeat).
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const ver = args.find(a => !a.startsWith('--'));
if (!ver) { console.error('Usage: node tools/display-audit.js <version> [--list] [--open] [--gaps]   (docs/display/<version>.json)'); process.exit(2); }
const file = path.join(root, 'docs/display', ver + '.json');
if (!fs.existsSync(file)) { console.error('no ' + path.relative(root, file)); process.exit(2); }
const D = JSON.parse(fs.readFileSync(file, 'utf8'));
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL ' + m); };

// ---------- the version's routines ----------
const cov = fs.readFileSync(path.join(root, D.routines), 'utf8');
const routines = new Map(); // "name@addr" -> true
for (const l of cov.split('\n')) {
  const m = /^\| `(\S+)` @ ?([0-9a-f]+) \|/.exec(l);
  if (m) routines.set(m[1] + '@' + m[2].replace(/^0+/, ''), m[1]);
}
const SRC = process.env.HO_SOURCES || path.join(root, '..', 'nostalgia-ho-sources');
const idx = path.join(SRC, 'decompiled', D.decompile || '', 'index.tsv');
let fromIndex = false;
if (D.decompile && fs.existsSync(idx)) {
  fromIndex = true;
  const list = new Map();
  for (const l of fs.readFileSync(idx, 'utf8').split('\n').slice(1)) { const f = l.split('\t'); if (f.length > 3) list.set(f[3] + '@' + f[1].replace(/^0+/, ''), 1); }
  for (const k of list.keys()) if (!routines.has(k)) fail(`${k} is in the decompile's index but not in ${D.routines}`);
  for (const k of routines.keys()) if (!list.has(k)) fail(`${k} is in ${D.routines} but not in the decompile's index`);
}

// ---------- the rows ----------
const STATUS = new Set(['matched', 'fixed', 'notShown', 'internal', 'open']);
const seen = new Map();
const formatSrc = fs.readFileSync(path.join(root, 'tools/format-audit.js'), 'utf8');
const familyIds = new Set([...formatSrc.matchAll(/\bfam\('([^']+)'/g)].map(m => m[1]));
const fileCache = {};
const text = (f) => fileCache[f] === undefined ? (fileCache[f] = fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : null) : fileCache[f];
const counts = {};
for (const row of D.rows) {
  const key = row.r + '@' + String(row.a).replace(/^0+/, '');
  const id = `${row.r} @${row.a}`;
  if (!routines.has(key)) fail(`${id}: not a routine of ${D.routines}`);
  if (seen.has(key)) fail(`${id}: two rows`);
  seen.set(key, row);
  if (!STATUS.has(row.status)) { fail(`${id}: status "${row.status}" is not one of ${[...STATUS].join(', ')}`); continue; }
  counts[row.status] = (counts[row.status] || 0) + 1;
  if (row.status === 'open') { fail(`${id}: still open`); continue; }
  const why = row.status === 'matched' ? row.how : row.status === 'fixed' ? row.fix : row.reason;
  if (!why || String(why).trim().length < 8) fail(`${id}: ${row.status} needs ${row.status === 'matched' ? 'a "how"' : row.status === 'fixed' ? 'a "fix" (the commit)' : 'a "reason"'}`);
  if (row.status === 'fixed' && !(row.how && row.how.length > 8)) fail(`${id}: fixed needs a "how" too (what was different and how it was verified after)`);
  if (row.status !== 'internal' && !(row.shows && row.shows.length > 8)) fail(`${id}: ${row.status} needs "shows": what the routine puts in front of the player`);
  if (row.status === 'matched' || row.status === 'fixed') {
    if (!Array.isArray(row.remake) || !row.remake.length) fail(`${id}: needs "remake": ["file:function"]`);
    else for (const p of row.remake) {
      const [f, fn] = p.split(':');
      const t = text(f);
      if (t === null) fail(`${id}: remake file ${f} is missing`);
      else if (fn && !t.includes(fn)) fail(`${id}: ${fn} is not in ${f}`);
    }
  }
  for (const f of row.formats || []) if (!familyIds.has(f)) fail(`${id}: format-audit has no family "${f}"`);
}
for (const k of routines.keys()) if (!seen.has(k)) fail(`${k}: no row`);

if (args.includes('--list') || args.includes('--open') || args.includes('--gaps')) {
  for (const row of D.rows) if (args.includes('--list') || (args.includes('--gaps') ? row.gap : row.status === 'open')) console.log(`${row.status.padEnd(8)} ${row.seg || ''} ${row.r} @${row.a}${row.shows ? ' - ' + row.shows.slice(0, 100) : ''}`);
}
const total = D.rows.length;
console.log(`display audit ${ver} (${D.program}): ${routines.size} routines${fromIndex ? ' (also checked against the decompile index)' : ''}, ${total} rows: ` +
  ['matched', 'fixed', 'notShown', 'internal', 'open'].map(s => `${counts[s] || 0} ${s}`).join(', '));
const gaps = D.rows.filter(r => r.gap).length;
console.log(`${gaps} gap(s) (mismatches found and not fixed: node tools/display-audit.js ${ver} --gaps), ${D.rows.filter(r => r.diff).length} row(s) with a kept difference`);
console.log(bad ? `${bad} problem(s)` : 'ok');
process.exit(bad ? 1 : 0);
