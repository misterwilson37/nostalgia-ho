// The engine defaults each original ruleset relies on: node tools/fallbacks.js
//
// Lists, for each ruleset playing an original version, every hook the engine
// asks the ruleset for (rs.<name> in js/engine.js) that the ruleset leaves out,
// so the engine's default plays. Exit code 1 when one of them has no row in
// docs/fallbacks.md ("| <ruleset> | `<hook>` | ... |"), or a row names a hook
// the ruleset now has: the file must say for each default whether the
// version's findings confirm it.
'use strict';
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const HO = require(path.join(root, 'js/engine.js'));
const src = fs.readFileSync(path.join(root, 'js/engine.js'), 'utf8');
const doc = fs.readFileSync(path.join(root, 'docs/fallbacks.md'), 'utf8');
const hooks = new Set();
for (const m of src.matchAll(/\b(?:rs|rules\(G\))\.([A-Za-z_]\w*)/g)) hooks.add(m[1]);
const rows = new Set();
for (const m of doc.matchAll(/^\| *([\w-]+) *\| *`(\w+)` *\|/gm)) rows.add(m[1] + ' ' + m[2]);
const ids = Object.values(HO.RULESETS).filter(r => r.year).map(r => r.id); // the original games' rulesets
let bad = 0;
for (const id of ids) {
  const rs = HO.RULESETS[id];
  const left = [...hooks].sort().filter(h => rs[h] === undefined);
  console.log(`${id}: ${left.join(' ')}`);
  for (const h of left) if (!rows.has(id + ' ' + h)) { console.log(`  x ${id} leaves \`${h}\` to the engine: not in docs/fallbacks.md`); bad++; }
}
for (const r of rows) {
  const [id, h] = r.split(' ');
  if (HO.RULESETS[id] && HO.RULESETS[id][h] !== undefined) { console.log(`  x docs/fallbacks.md lists \`${h}\` for ${id}, which now has its own`); bad++; }
}
console.log(bad ? `${bad} problem(s)` : 'docs/fallbacks.md lists every engine default');
process.exit(bad ? 1 : 0);
