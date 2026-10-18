// The versions' languages, checked: node tools/lang-test.js [ruleset ...] [--lang=<code>] [--seeds=6] [--count]
//
// For each ruleset and each of its languages (rs.languages; the version's own
// too when it has its own reports, rs.say), plays a few computer-only games
// (the humans on autoplay, as tools/test.js; small and medium galaxies, the
// options on and off) and reads every human's reports as the page shows them
// (HO.say). It fails on:
//   - a report the language doesn't translate (none of its say.reports
//     matches): each is listed once, by its shape (names and numbers taken out);
//   - a translation with a filling left in it ("%s", "%d", "%2$s", "%P") or
//     "undefined" / "null";
//   - name lists that aren't entry for entry the version's own (the same
//     lengths: engine.js langMap), and hints that aren't (rs.hintTexts).
// --count prints, per ruleset and language, how many of its reports are
// official (an official translation's line) and how many the remake's own
// (an entry marked 'remake', js/languages.js), for docs/translations.md.
// That the same seed plays the same game is tools/test.js --lang --digest's.
'use strict';
const path = require('path'), root = path.join(__dirname, '..');
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
const ARGS = process.argv.slice(2);
const opt = (k, d) => { const a = ARGS.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SEEDS = +opt('seeds', 6), ONLY = opt('lang', null), COUNT = ARGS.includes('--count');
const RULES = ARGS.filter(a => !a.startsWith('--'));
const all = RULES.length ? RULES : Object.keys(HO.RULESETS).filter(id => HO.languages(HO.RULESETS[id]).length);
for (const id of RULES) if (!HO.RULESETS[id]) { console.error(`No ruleset "${id}"; rulesets: ${Object.keys(HO.RULESETS).join(', ')}`); process.exit(2); }
let failed = 0;
const LEFT = /%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%P|\bundefined\b|\bnull\b/;
function langsOf(rs) {
  const L = HO.languages(rs);
  // the version's own language counts when it has its own reports (1.2F's
  // French); English is the rules' own words
  return L.filter((c, i) => (ONLY ? c === ONLY : true) && c !== 'en' && (i > 0 || rs.say));

}
function counts(rs, code) {
  const own = HO.languages(rs)[0] === code;
  const L = own ? rs.say : rs.lang[code] && rs.lang[code].say;
  const seen = new Map();
  for (const r of (L && L.reports) || []) if (!seen.has(r[0])) seen.set(r[0], r[2] === 'remake' ? 'remake' : 'official');
  const n = { official: 0, remake: 0 };
  for (const v of seen.values()) n[v]++;
  const o = own ? rs : rs.lang[code];
  const hints = o.hintTexts && o.hintRemake ? { hints: o.hintTexts.length, hintsRemake: o.hintRemake.length } : {};
  return Object.assign(n, hints);
}
function listsOk(id, rs, code) {
  if (HO.languages(rs)[0] === code) return;
  const a = rs, b = Object.assign({}, rs, rs.lang[code]);
  const D = HO.DATA, len = (x) => (x || []).length;
  const bad = [];
  for (const k of ['starNames', 'maleNames', 'femaleNames']) if (rs.lang[code][k] && len(b[k]) !== len(a[k] || D[k])) bad.push(`${k} ${len(b[k])} for ${len(a[k] || D[k])}`);
  const sa = a.shipNames || D.shipNames, sb = b.shipNames || D.shipNames;
  if (rs.lang[code].shipNames) for (const c of Object.keys(sa)) if (len(sa[c]) !== len(sb[c])) bad.push(`shipNames.${c} ${len(sb[c])} for ${len(sa[c])}`);
  const h0 = rs.hintTexts, h1 = rs.lang[code].hintTexts;
  if (h0 && h0.length && h1 && h1.length !== h0.length) bad.push(`hintTexts ${h1.length} for ${h0.length}`);
  if (h1) h1.forEach((t, i) => { if (LEFT.test(String(t).replace(/%%/g, ''))) bad.push(`hint ${i}: ${t}`); });
  if (bad.length) { failed++; console.log(`FAIL ${id} ${code}: lists: ${bad.join('; ')}`); }
}
function play(id, code) {
  const rs = HO.RULESETS[id], own = HO.languages(rs)[0] === code;
  const shapes = new Map(), left = new Map();
  for (let seed = 1; seed <= SEEDS; seed++) {
    const o = { seed: 1000 + seed, rules: id, size: seed % 2 ? 'small' : 'medium', computers: 2 + seed % 4, iq: ['average', 'smart', 'dumb'][seed % 3], shape: 'random',
      alliances: seed % 2 === 0, luck: seed % 3 !== 0, novas: seed % 2 === 1, patch: seed % 3 === 1, hoedown: seed % 4 === 2,
      humans: [{ name: 'Ann' }, { name: 'Bob', female: false }] };
    if (!own) o.lang = code;
    let G;
    try { G = HO.newGame(o); } catch (e) { failed++; console.log(`FAIL ${id} ${code}: New Game: ${e.message}`); return; }
    for (const p of HO.humans(G)) p.auto = true;
    const at = new Map();
    const read = () => {
      const names = [...G.stars.map(s => s.name), ...G.players.map(q => q.name), ...G.players.flatMap(q => (q.designs || []).map(d => d.name))].filter(Boolean).sort((a, b) => b.length - a.length);
      for (const p of HO.humans(G)) {
        const box = p.inbox || [];
        for (let k = at.get(p.id) || 0; k < box.length; k++) {
          const t = String(box[k].text || '');
          if (!t) continue;
          if (!HO.saysIn(G, t)) {
            let s = t; for (const n of names) s = s.split(n).join('«name»');
            s = s.replace(/\$?-?\d[\d,.]*K?/g, '#');
            if (!shapes.has(s)) shapes.set(s, t);
            continue;
          }
          const out = HO.say(G, t);
          if (LEFT.test(out.replace(/%%/g, ''))) left.set(t, out);
        }
        at.set(p.id, box.length);
      }
    };
    read();
    for (let i = 0; i < 250 && !G.over; i++) {
      try { HO.endTurn(G); } catch (e) { failed++; console.log(`FAIL ${id} ${code}: seed ${o.seed}, year ${G.year}: ${e.message}`); break; }
      read();
    }
  }
  if (shapes.size || left.size) failed++;
  console.log(`${shapes.size || left.size ? 'FAIL' : 'ok  '} ${id} ${code}: ${shapes.size} untranslated, ${left.size} with a filling left`);
  for (const [s, t] of shapes) console.log(`    untranslated: ${s}${s !== t ? `   (${t})` : ''}`);
  for (const [t, out] of left) console.log(`    left in: ${t}  ->  ${out}`);
}
for (const id of all) {
  const rs = HO.RULESETS[id];
  for (const code of langsOf(rs)) {
    if (COUNT) { const n = counts(rs, code); console.log(`${id} ${code}${rs.lang && rs.lang[code] && rs.lang[code].remake ? ' (remake)' : ''}: reports ${n.official} official, ${n.remake} the remake's${n.hints != null ? `; hints ${n.hints - n.hintsRemake} official, ${n.hintsRemake} the remake's` : ''}`); continue; }
    listsOk(id, rs, code);
    play(id, code);
  }
}
if (!COUNT) { console.log(failed ? `${failed} failed` : 'all languages ok'); process.exit(failed ? 1 : 0); }
