// The versions' languages, checked: node tools/lang-test.js [ruleset ...] [--lang=<code>] [--seeds=6] [--count] [--adapted]
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
// official (an official translation's line), adapted from official (an entry
// marked 'adapted': an official line for a slightly different English, edited
// as little as the difference needs) and the remake's own (an entry marked
// 'remake', js/languages.js), for docs/translations.md. --adapted lists the
// adapted lines with their source line and the two Englishes' word-level
// likeness (2 x the longest common subsequence of words / both lengths), and fails on
// one whose source isn't an official line of the language, or is less like
// it than ADAPT_MIN.

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
  return L.filter((c) => (ONLY ? c === ONLY : true) && c !== 'en' && (c !== HO.ownLanguage(rs) || rs.say));

}
const tier = (r) => r[2] === 'remake' ? 'remake' : r[2] === 'adapted' ? 'adapted' : 'official';
function reportsOf(rs, code) {
  const own = HO.ownLanguage(rs) === code;
  const L = own ? rs.say : rs.lang[code] && rs.lang[code].say;
  return (L && L.reports) || [];
}
function counts(rs, code) {
  const own = HO.ownLanguage(rs) === code;
  const seen = new Map();
  for (const r of reportsOf(rs, code)) if (!seen.has(r[0])) seen.set(r[0], tier(r));
  const n = { official: 0, adapted: 0, remake: 0 };
  for (const v of seen.values()) n[v]++;
  const o = own ? rs : rs.lang[code];
  const hints = o.hintTexts && o.hintRemake ? { hints: o.hintTexts.length, hintsRemake: o.hintRemake.length, hintsAdapted: (o.hintAdapted || []).length } : {};
  return Object.assign(n, hints);
}
// adapted lines: the source must be an official line of the language, and like it
const ADAPT_MIN = 0.5;
const words = (t) => String(t).toLowerCase().replace(/[‘’`´]/g, '\'').replace(/%(?:\d+\$)?(?:\.\*)?[-0-9.]*l?[sdu]|%P/g, ' %s ').match(/[a-z0-9']+|%s/g) || [];
function likeness(a, b) {
  // the longest common subsequence of words
  const x = words(a), y = words(b), L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) L[i][j] = x[i - 1] === y[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
  return x.length + y.length ? 2 * L[x.length][y.length] / (x.length + y.length) : 1;
}
function adaptedList(code) {
  const N = HO.langNormEn, off = new Set((HO.langOfficial(code) || []).map(([en]) => N(en))), list = new Map();
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id];
    if (!HO.languages(rs).includes(code)) continue;
    for (const r of reportsOf(rs, code)) if (tier(r) === 'official') off.add(N(r[0]));
    const o = HO.ownLanguage(rs) === code ? null : rs.lang[code];
    if (o && o.hintTexts && !o.remake) for (const t of rs.hintTexts || []) off.add(N(t));
  }
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id];
    if (!HO.languages(rs).includes(code)) continue;
    for (const r of reportsOf(rs, code)) if (tier(r) === 'adapted') { const k = r[0] + '\u0000' + r[3]; if (!list.has(k)) list.set(k, { en: r[0], to: r[1], src: r[3], ids: [] }); list.get(k).ids.push(id); }
  }
  const RMK = require(path.join(root, 'js/lang-remake.js'));
  for (const [en, [to, src]] of Object.entries((RMK[code] || {}).adapted || {})) { const k = en + '\u0000' + src; if (!list.has(k)) list.set(k, { en, to, src, ids: [] }); }
  let bad = 0;
  for (const a of list.values()) {
    const r = likeness(a.en, a.src), ok = off.has(N(a.src)) && r >= ADAPT_MIN;
    if (!ok) bad++;
    console.log(`${ok ? '' : 'FAIL '}${code} ${r.toFixed(2)}  ${a.en}\n      from: ${a.src}${off.has(N(a.src)) ? '' : '  (no official line)'}\n      ${a.to}${a.ids.length ? '' : '\n      (in no version\'s reports: a hint or a window\'s line)'}`);
  }
  return bad;
}
function listsOk(id, rs, code) {
  if (HO.ownLanguage(rs) === code) return;
  const a = rs, b = Object.assign({}, rs, rs.lang[code]);
  const D = HO.DATA, len = (x) => (x || []).length;
  const bad = [];
  for (const k of ['starNames', 'maleNames', 'femaleNames']) if (rs.lang[code][k] && len(b[k]) !== len(a[k] || D[k])) bad.push(`${k} ${len(b[k])} for ${len(a[k] || D[k])}`);
  const sa = a.shipNames || D.shipNames, sb = b.shipNames || D.shipNames;
  if (rs.lang[code].shipNames) for (const c of Object.keys(sa)) if (len(sa[c]) !== len(sb[c])) bad.push(`shipNames.${c} ${len(sb[c])} for ${len(sa[c])}`);
  const h0 = rs.hintTexts, h1 = rs.lang[code].hintTexts;
  if (h0 && h0.length && h1 && h1.length !== h0.length) bad.push(`hintTexts ${h1.length} for ${h0.length}`);
  if (h1) h1.forEach((t, i) => { if (LEFT.test(String(t).replace(/%%/g, ''))) bad.push(`hint ${i}: ${t}`); });
  // a line of the version's that no translation has (js/languages.js translator)
  for (const t of rs.lang[code].missing || []) bad.push(`no translation: ${t}`);

  if (bad.length) { failed++; console.log(`FAIL ${id} ${code}: lists: ${bad.join('; ')}`); }
}
// A name is never a word (engine.js sayNames): a star or a player named like a tech (Quark,
// Maser...) keeps its name in a report, while a tech's own name in "You now have X Shield
// Technology (3)." is still put in the language.
function namesNotWords(id, rs, code) {
  const own = HO.ownLanguage(rs) === code, L = own ? rs.say : rs.lang[code] && rs.lang[code].say;
  if (!L || !L.words) return;
  const W = ['Quark', 'Maser', 'Hyperspace', 'Singularity', 'Scout', 'Fighter', 'Speed'].filter(w => L.words[w] && L.words[w] !== w && !String(L.words[w]).includes(w));
  if (!W.length) return;
  const o = { seed: 7, rules: id, size: 'small', computers: 2, iq: 'average', shape: 'random', humans: [{ name: 'Ann' }, { name: 'Bob', female: false }] };
  if (!own) o.lang = code;
  const G = HO.newGame(o);
  const bad = [];
  const star = (t) => HO.say(G, t);
  for (const w of W) {
    G.stars[0].name = w; G.players[2].name = w;
    const t1 = `The amount of energy emanating from ${w} suggests a big battle just took place.`;
    if (HO.saysIn(G, t1) && star(t1).includes(L.words[w])) bad.push(`star ${w}: ${star(t1)}`);
    const t2 = `You won a battle at ${w}. You lost 2 of your ships. ${w} lost 3.`;
    if (HO.saysIn(G, t2) && star(t2).includes(L.words[w])) bad.push(`battle ${w}: ${star(t2)}`);
  }
  G.stars[0].name = 'Quark';
  const t3 = 'You now have Quark Shield Technology (3).';
  if (L.words.Quark && HO.saysIn(G, t3) && star(t3).includes('Quark') && !String(L.words.Quark).includes('Quark')) bad.push(`tech slot not translated: ${star(t3)}`);
  if (bad.length) { failed++; console.log(`FAIL ${id} ${code}: names taken for words: ${bad.join('; ')}`); }
}
function play(id, code) {
  const rs = HO.RULESETS[id], own = HO.ownLanguage(rs) === code;
  const shapes = new Map(), left = new Map();
  for (let seed = 1; seed <= SEEDS; seed++) {
    const o = { seed: 1000 + seed, rules: id, size: seed % 2 ? 'small' : 'medium', computers: 2 + seed % 4, iq: ['average', 'smart', 'dumb'][seed % 3], shape: 'random',
      alliances: seed % 2 === 0, luck: seed % 3 !== 0, novas: seed % 2 === 1, patch: seed % 3 === 1, hoedown: seed % 4 === 2, hoedownAll: seed % 4 === 2 && seed % 2 === 0,
      humans: [{ name: 'Ann' }, { name: 'Bob', female: false }] };
    if (!own) o.lang = code;
    HO.screenBW = o.hoedownAll ? () => true : null; // (the colour-monitor joke of "Every version's jokes" comes on a black-and-white screen)
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
// Turkish case endings by how an English name sounds (engine.js trReading; the patch's tokens only)
function trEndings() {
  const want = { 'Joe’{den}': 'Joe’dan', 'Joe’{e}': 'Joe’ya', 'Joe’{i}': 'Joe’yu', 'Mike’{den}': 'Mike’tan', 'Mike’{i}': 'Mike’ı', 'Kate’{e}': 'Kate’e', 'Kate’{den}': 'Kate’ten',
    'Dave’{e}': 'Dave’e', 'Steve’{den}': 'Steve’den', 'Grace’{den}': 'Grace’ten', 'Jack’{e}': 'Jack’e', 'Ann’{den}': 'Ann’den', 'Guy’{i}': 'Guy’ı', 'Hope’{den}': 'Hope’tan',
    // spelled as read (unchanged): Turkish names keep their aloud final e/h, numbers are read
    'Lale’{e}': 'Lale’ye', 'Nazife’{den}': 'Nazife’den', 'Sabah’{e}': 'Sabah’a', 'Argot’{e}': 'Argot’a', 'Nancy’{den}': 'Nancy’den', 'Sirius’{den}': 'Sirius’tan', '3’{i}': '3’ü', 'Peter’{e}': 'Peter’e' };
  const bad = Object.keys(want).filter(k => HO.trSuffixes(k) !== want[k]).map(k => `${k} -> ${HO.trSuffixes(k)} (not ${want[k]})`);
  if (bad.length) { failed++; console.log(`FAIL Turkish endings: ${bad.join('; ')}`); }
  else console.log(`ok   Turkish endings: ${Object.keys(want).length} names`);
}
if (!COUNT && !ARGS.includes('--adapted') && (!ONLY || ONLY === 'tr')) trEndings();
if (ARGS.includes('--adapted')) {
  let bad = 0;
  for (const code of ONLY ? [ONLY] : ['fr', 'tr', 'de', 'es']) bad += adaptedList(code);
  console.log(bad ? `${bad} adapted lines failed` : 'adapted lines ok');
  process.exit(bad ? 1 : 0);
}
for (const id of all) {
  const rs = HO.RULESETS[id];
  for (const code of langsOf(rs)) {
    if (COUNT) { const n = counts(rs, code); console.log(`${id} ${code}${rs.lang && rs.lang[code] && rs.lang[code].remake ? ' (remake)' : ''}: reports ${n.official} official, ${n.adapted} adapted, ${n.remake} the remake's${n.hints != null ? `; hints ${n.hints - n.hintsRemake - n.hintsAdapted} official, ${n.hintsAdapted} adapted, ${n.hintsRemake} the remake's` : ''}`); continue; }
    listsOk(id, rs, code);
    namesNotWords(id, rs, code);
    play(id, code);
  }
}
if (!COUNT) { console.log(failed ? `${failed} failed` : 'all languages ok'); process.exit(failed ? 1 : 0); }
