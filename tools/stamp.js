// Stamps index.html with a build mark so browsers fetch the new files after
// an update instead of mixing cached old ones with new (GitHub Pages lets a
// browser keep a file for 10 minutes, and some keep them far longer):
//   node tools/stamp.js            sets a new stamp (UTC, to the minute)
//   node tools/stamp.js --check    exits 1 if a local script or stylesheet in
//                                  index.html lacks the current stamp
// Every local <script src> and <link rel="stylesheet"> in index.html gets
// ?v=<stamp>, and <meta name="ho-build"> holds it; js/skins.js and js/cloud.js
// add it to the files they load themselves (HO_BUILD). .githooks/pre-commit
// runs this whenever a commit changes js/ or index.html
// (git config core.hooksPath .githooks).
'use strict';
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let page = fs.readFileSync(file, 'utf8');
const local = (u) => !/^(https?:|data:|\/\/)/.test(u);
if (process.argv.includes('--check')) {
  const m = page.match(/<meta name="ho-build" content="([^"]+)">/);
  const bad = [...page.matchAll(/<script src="([^"]+)"|<link rel="stylesheet" href="([^"]+)"/g)].map(x => x[1] || x[2]).filter(u => local(u) && (!m || !u.endsWith('?v=' + m[1])));
  if (!m || bad.length) { console.error('not stamped:', m ? bad.join(', ') : 'no ho-build meta'); process.exit(1); }
  console.log('stamped', m[1]);
  process.exit(0);
}
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
const bare = (u) => u.replace(/\?v=[^"]*$/, '');
page = page.replace(/<script src="([^"]+)"/g, (all, u) => local(u) ? `<script src="${bare(u)}?v=${stamp}"` : all);
page = page.replace(/<link rel="stylesheet" href="([^"]+)"/g, (all, u) => local(u) ? `<link rel="stylesheet" href="${bare(u)}?v=${stamp}"` : all);
if (/<meta name="ho-build" content="[^"]*">/.test(page)) page = page.replace(/<meta name="ho-build" content="[^"]*">/, `<meta name="ho-build" content="${stamp}">`);
else page = page.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta name="ho-build" content="${stamp}">`);
fs.writeFileSync(file, page);
console.log('stamped', stamp);
