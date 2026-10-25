#!/usr/bin/env node
// Checks every relative href/src in assets/manuals/**/*.html: the file exists, and a #fragment
// matches an id= or name= in it. Usage: node tools/manual-links.js [--list]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'assets', 'manuals');
const list = process.argv.includes('--list');
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.html$/.test(e.name)) files.push(p); } })(root);
const anchors = {};
function anchorsOf(f) {
  if (!anchors[f]) { const s = fs.readFileSync(f, 'utf8'), set = new Set(); let m;
    const re = /\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi;
    while ((m = re.exec(s))) set.add(m[1] ?? m[2] ?? m[3]); anchors[f] = set; }
  return anchors[f];
}
const per = {}, bad = [];
for (const f of files) {
  const dir = path.relative(root, path.dirname(f)).split(path.sep)[0] || '.';
  per[dir] = per[dir] || 0;
  const s = fs.readFileSync(f, 'utf8'); let m;
  const re = /\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  while ((m = re.exec(s))) {
    let u = m[2] ?? m[3];
    if (!u || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(u)) continue;
    let [p, frag] = u.split('#'); p = p.split('?')[0];
    const target = p ? path.resolve(path.dirname(f), decodeURIComponent(p)) : f;
    let why = null;
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) why = 'missing file';
    else if (frag && /\.html$/.test(target) && !anchorsOf(target).has(decodeURIComponent(frag))) why = 'missing anchor';
    if (why) { per[dir]++; bad.push(`${path.relative(root, f)}: ${m[1]}="${u}" (${why})`); }
  }
}
for (const d of Object.keys(per).sort()) if (list || per[d]) console.log(`${d}: ${per[d]} broken`);
if (list || bad.length) bad.forEach(b => console.log('  ' + b));
console.log(`${files.length} pages checked, ${bad.length} broken`);
process.exit(bad.length ? 1 : 0);
