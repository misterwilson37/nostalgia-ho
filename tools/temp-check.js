// The °C / °F preference, checked: node tools/temp-check.js [--port=8881] [--no-page]
//
// The player may choose, besides "As the original" (each version, language and skin as released), °C or
// °F for every temperature the game shows (docs/roadmap.md, 4h; HO.tempPref, HO.celsiusOf, js/engine.js
// tempText; the page's Prefs.temp in js/skins/classic/ui.js).
//
// The engine, without a page: for every version and each of its languages, plays a game and takes every exploring
// report (yours and a buddy's), then says it as the original does (no choice), in °C and in °F, and compares it with
// the report as the program printed it (REPORT_RULES below, written out from the sources: docs/dos-findings.md, "The
// reports' numbers"): "%d.%2.2dG" of the truncated ratio and the temperature of tenths, the unit as released, the
// version's formula (324, 360, the German 2.0's slip, the Spanish's whole degrees), the decimal sign, the degree sign.
// The page, in a browser: every skin and a version it shows, with each choice, reads the star panel and the
// explored-stars list (the Amiga's included) and the planet's report, which must agree with the choice.
// Chromium comes from PLAYWRIGHT_BROWSERS_PATH, Playwright from NODE_PATH ($(npm root -g)).
'use strict';
const path = require('path'), http = require('http');
const { spawn } = require('child_process');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
let bad = 0;
// What each version and language showed, from the sources (docs/roadmap.md 4h; docs/dos-findings.md "Languages", docs/12-findings.md,
// STR# 1000 and 4000 of 1.2F and 3.0.1F, the German 2.0's DOSHO.EXE): in the reports, °C in 1.2's French and German (and the
// remake's Spanish), the French 2.0, 3.0.1 and 4.0.5 (1.2F's and 3.0.1F's own reports), the German 2.0; the planet panel and
// explored list the same, and in 1.2 in every language (rs.celsius; its English and Turkish reports say a bare "N°" the page puts in °C)
const reportC = (id, lang) => lang === 'es' || (lang === 'fr' && ['12', 'dos', 'mac20', '301', '405', 'mac405'].includes(id)) || (lang === 'de' && ['12', 'dos', 'mac20'].includes(id));
const HOownLang = (id) => HO.ownLanguage(HO.RULESETS[id]);
const panelIsC = (id, lang) => id === '12' || reportC(id, lang);
const fail = (m) => { bad++; console.log('FAIL ' + m); };
const TOKEN = /(-?\d+(?:[.,]\d+)?)[\s ]?[°º][\s ]?([CF])?/g;
const tokens = (t) => [...String(t).matchAll(TOKEN)].map(m => ({ n: parseFloat(m[1].replace(',', '.')), u: m[2] || 'F', all: m[0] }));

// ---------- the engine ----------
// The reports, version by version and language (docs/dos-findings.md, "The reports' numbers"). Every original filled the exploring
// report with the panel's arithmetic (2.0: ExploreStar FUN_1040_34e9 / GetReportString case 0x407 in WINHO.EXE, DOSHO.EXE English
// (the T and the ratio as the message's tenths and r) and the German DOSHO.EXE's overlay at file offset 0x75030 (trunc((trunc(T / 10)
// - 32) x 5 / 9) and its last digit); Mac 1.2 ExploreStar @a3b4c (T - 324) x 5 / 9; Mac 2.0.1 @a32d8, 3.0.1 @a549e, 4.0.5 Win FUN_00439558 +
// FUN_0042f742, Mac CreateTempString, 5.0.5 FUN_10078c80 / FUN_1009c240 -> FUN_1009d520, Palm FUN_000291dc, iOS FUN_100038310:
// the message holds r = g x 100 / home g (truncated) and T = star t + 720 - home t (tenths of a degree Fahrenheit); a report prints
// "%d.%2.2dG" with r / 100 and r mod 100 and the temperature the way the panel does. This table is written out here, from those
// sources, not read from engine.js: K (324 or 360: T - K, x 5 / 9, truncated), the unit as released, the German 2.0's slip, the
// Spanish remake's whole degrees, the decimal sign of the temperature and of the gravity in the report, the degree sign.
const REPORT_RULES = (id, lang) => {
  const two = id === 'dos' || id === 'mac20', three = ['301', '405', 'mac405'].includes(id), own = ['original', 'palm', 'ios', 'android'].includes(id);
  const R = { K: own ? 360 : 324, deg: id === 'ios' || id === 'android' ? 'º' : '°', c: false, slip: false, whole: false, tc: false, gc: false };
  if (id === '12') R.c = true;
  if (lang === 'fr') { R.gc = true; if (id === '12' || two || three) { R.c = true; R.tc = true; } }              // 1.2F, 3.0.1F: "%d,%1.1d°C", "%d,%2.2dG"; iOS's French "%d,%2.2dG" with its °F "72.0ºF"
  if (lang === 'de') { R.gc = true; R.tc = true; if (two) { R.c = true; R.slip = true; } }                          // DOSHO.EXE: "%d,%1.1d°C" (the slip), "%d,%2.2dG"
  if (lang === 'es') { R.gc = true; R.c = true; R.whole = true; }                                                   // the remake's own Spanish
  return R;
};
const tenthsStr = (T, comma) => Math.trunc(T / 10) + (comma ? ',' : '.') + Math.abs(T % 10);
const wantTemp = (id, lang, T, unit) => {
  const R = REPORT_RULES(id, lang), u = unit || (R.c ? 'C' : 'F');
  if (R.whole) return u === 'C' ? Math.round((T / 10 - 32) * 5 / 9) + '°C' : Math.round(T / 10) + '°F';
  if (u === 'F') return tenthsStr(T, R.tc) + R.deg + 'F';
  if (R.slip) { const c = Math.trunc((Math.trunc(T / 10) - 32) * 5 / 9); return c + (R.tc ? ',' : '.') + (Math.abs(c) % 10) + '°C'; }
  return tenthsStr(Math.trunc((T - R.K) * 5 / 9), R.tc) + R.deg + 'C';
};
const wantGrav = (id, lang, r) => Math.trunc(r / 100) + (REPORT_RULES(id, lang).gc ? ',' : '.') + String(r % 100).padStart(2, '0') + 'G';
function engine() {
  let texts = 0;
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id];
    if (!rs.languages) continue; // (the AI homages: whole degrees, no original)
    for (const lang of HO.languages(rs)) {
      const o = { seed: 11, rules: id, size: 'small', computers: 3, iq: 'average', shape: 'random', humans: [{ name: 'Ann' }, { name: 'Bob', female: false }], alliances: true, novas: true };
      if (HO.ownLanguage(rs) !== lang) o.lang = lang;
      const G = HO.newGame(o);
      for (const p of HO.humans(G)) p.auto = true;
      const seen = [];
      for (let i = 0; i < 60 && !G.over && seen.length < 40; i++) {
        HO.endTurn(G);
        for (const p of HO.humans(G)) for (const m of p.inbox || []) if (m.star != null && /has explored|You have explored/.test(m.text) && !seen.some(x => x.m === m)) seen.push({ m, p, early: i < 2 });
      }
      if (!seen.length) fail(`${id} ${lang}: no exploring report`);
      for (const { m, p, early } of seen) {
        texts++;
        const s = G.stars[m.star];
        // what the program had: r and T, from the game's own numbers (in the first turns, before anything is terraformed; later the token is the truth)
        const tok = (/Temp: (-?\d+\.\d)°F/.exec(m.text) || [])[1], gm = /Gravity: (\d+)\.(\d\d)G/.exec(m.text);
        const T = HO.tokenTenths(tok), r = +gm[1] * 100 + +gm[2];
        const T0 = Math.round(s.t * 10) + 720 - Math.round(p.homeT * 10), r0 = Math.trunc(Math.round(s.g * 100) * 100 / Math.round(p.homeG * 100));
        if (early && s.owner < 0 && (T !== T0 || r !== r0)) fail(`${id} ${lang} "${m.text}": the star has T ${T0}, r ${r0}`);
        const tag = `${id} ${lang} "${m.text}"`;
        for (const u of [null, 'C', 'F']) {
          HO.tempPref = u ? () => u : null;
          const out = HO.say(G, m.text);
          HO.tempPref = null;
          const wt = wantTemp(id, lang, T, u), wg = wantGrav(id, lang, r);
          // the report holds the gravity and the temperature as the version prints them, nothing else with a degree sign
          if (!out.includes(wg)) fail(`${tag} (${u || 'as released'}): gravity is not ${wg}: "${out}"`);
          if (!out.includes(' ' + wt) && !out.includes(': ' + wt)) fail(`${tag} (${u || 'as released'}): temperature is not ${wt} (T = ${T}): "${out}"`);
          const n = (out.match(/[°º][CF]/g) || []).length;
          if (n !== 1) fail(`${tag} (${u || 'as released'}): ${n} temperatures in "${out}"`);
        }
      }
      // the canned message a computer sends ("I like planets that are 1.00G and 72.0°F.", 3.0.1 and later): the same text as the panel's
      const like = 'I like planets that are 1.00G and 72.0°F.';
      HO.tempPref = null; const l0 = HO.say(G, like);
      if (/I like planets/.test(l0) || /Planeten|planètes|gezegen|planetas/.test(l0)) {
        const wt = wantTemp(id, lang, 720, null), wtc = wantTemp(id, lang, 720, 'C');
        if (!l0.includes(wt) && !(rs.say && lang !== HO.ownLanguage(rs))) { /* (a version with its own wording of the line: checked by the language tests) */ }
        HO.tempPref = () => 'C'; const lc = HO.say(G, like); HO.tempPref = null;
        if (/72\.0°F|72,0°F/.test(lc)) fail(`${id} ${lang}: the canned message in °C still says °F: "${lc}"`);
        void wtc;
      }
    }
  }
  // the sign the programs lose, and the token the engine writes
  {
    const G = HO.newGame({ seed: 1, rules: 'dos', size: 'small', computers: 1, iq: 'average', shape: 'random' });
    for (const [T, tok] of [[720, '72.0°F'], [-5, '-0.5°F'], [5, '0.5°F'], [-352, '-35.2°F'], [0, '0.0°F']]) if (HO.tempToken(T) !== tok) fail(`token ${T}: ${HO.tempToken(T)}`);
    if (HO.say(G, 'You have explored X. Gravity: 1.00G. Temp: -0.5°F. Metal: 1.') !== 'You have explored X. Gravity: 1.00G. Temp: 0.5°F. Metal: 1.') fail('English -0.5: ' + HO.say(G, 'You have explored X. Gravity: 1.00G. Temp: -0.5°F. Metal: 1.'));
    HO.tempPref = () => 'C';
    const c = HO.say(G, 'You have explored X. Gravity: 1.00G. Temp: -0.5°F. Metal: 1.'); HO.tempPref = null;
    if (c !== 'You have explored X. Gravity: 1.00G. Temp: -18.2°C. Metal: 1.') fail('English -0.5 in °C: ' + c);
  }
  // the version's own °C formula, whole degrees as it shows them
  const G12 = HO.newGame({ seed: 1, rules: '12', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  const Gde = HO.newGame({ seed: 1, rules: 'dos', lang: 'de', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  const Gen = HO.newGame({ seed: 1, rules: 'original', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  for (const [G, f, want, name] of [[G12, 72, '22.0', '1.2 ((T - 324) x 5 / 9)'], [G12, 50, '9.7', '1.2 ((T - 324) x 5 / 9)'], [Gde, 71, '21', 'DOS 2.0 in German (truncated)'], [Gde, 33, '0', 'DOS 2.0 in German (truncated)'],
    [Gde, 20, '-6', 'DOS 2.0 in German (truncated toward zero)'], [Gen, 71, '22', '5.0.5 (rounded)'], [Gen, 33, '1', '5.0.5 (rounded)'], [Gen, 20, '-7', '5.0.5 (rounded)']]) {
    const got = HO.celsiusOf(G, f);
    if (got !== want) fail(`celsiusOf ${name}: ${f}°F is ${got}, expected ${want}`);
  }
  // the panel and the list as released (HO.panelFormat), and the text they write
  const PG = (id, lang) => { const rs = HO.RULESETS[id], o = { seed: 1, rules: id, size: 'small', computers: 1, iq: 'average', shape: 'random' }; if (HO.ownLanguage(rs) !== lang) o.lang = lang; return HO.newGame(o); };
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id]; if (!rs.languages) continue;
    for (const lang of HO.languages(rs)) if (HO.panelFormat(PG(id, lang)).c !== panelIsC(id, lang)) fail(`panel ${id} ${lang}: ${HO.panelFormat(PG(id, lang)).c ? 'shows °C' : 'shows °F'}, the original ${panelIsC(id, lang) ? '°C' : '°F'}`);
  }
  for (const [id, lang, f, want] of [['dos', 'de', 72, '22,2°C'], ['dos', 'de', 71, '21,1°C'], ['dos', 'de', 33, '0,0°C'], ['dos', 'de', 20, '-6,6°C'], ['mac20', 'de', 72, '22,2°C'],
    ['dos', 'fr', 72, '22,0°C'], ['dos', 'fr', 50, '9,7°C'], ['mac20', 'fr', 72, '22,0°C'], ['12', 'fr', 72, '22,0°C'], ['12', 'en', 72, '22.0°C'],
    ['301', 'fr', 72, '22.0°C'], ['405', 'fr', 72, '22.0°C'], ['mac405', 'fr', 215, '101.4°C'], ['dos', 'es', 72, '22°C'], ['original', 'es', 71, '22°C']]) {
    const got = HO.panelC(PG(id, lang), f);
    if (got !== want) fail(`panel ${id} ${lang}: ${f}°F is "${got}", expected "${want}"`);
  }
  panelFormats(PG);
  console.log(`engine: ${texts} reports in ${Object.values(HO.RULESETS).filter(r => r.languages).length} versions checked`);
}

// The panel's and the list's temperature and gravity in each version's own format, from the sources (docs/dos-findings.md,
// "The panel's numbers"; docs/roadmap.md 4h). Per version: the format string, with (T / 10, |T| mod 10) for a temperature T in
// tenths of a degree Fahrenheit, and (r / 100, r mod 100) for the gravity r = g x 100 / home g truncated:
//   1.2/1.2F    STR# 4000.2 "%d,%1.1d°C", 4000.3 "%d,%2.2dG"          (T - 324) x 5 / 9    (no English 1.2: a point)
//   2.0 (DOS, Win 3.1, Mac 2.0.1)  "%d.%1.1d%cF", "%d.%2.2dG"          the German "%d,%1.1d%cC", "%d,%2.2dG": whole degrees' last digit
//   3.0.1       STR# 4000.2 "%d.%1.1d°F", 4000.3 "%d.%2.2dG"; 3.0.1F "%d.%1.1d°C", "%d.%2.2dG"
//   4.0.5       Win 1333-1335, Mac STR# 6170.3-5: "%d.%1.1d°F", "°C", "%d.%2.2dG"     (T - 324) x 5 / 9
//   5.0.5, Palm STR# 6003 "%d.%2.2dG", "%d.%1.1d°F", "%d.%1.1d°C"      (T - 360) x 5 / 9
//   iOS, Android sprintf Templates "%d.%2.2dG", "%d.%1.1dºF", "%d.%1.1dºC" (º U+00BA)   (T - 360) x 5 / 9
function panelFormats(PG) {
  // [version, language, as released at home's 72.0°F, in °F, in °C]
  const T = [
    ['12', 'en', '22.0°C', '72.0°F', '22.0°C'], ['12', 'fr', '22,0°C', '72,0°F', '22,0°C'], ['12', 'de', '22,0°C', '72,0°F', '22,0°C'], ['12', 'tr', '22.0°C', '72.0°F', '22.0°C'],
    ['dos', 'en', '72.0°F', '72.0°F', '22.0°C'], ['dos', 'de', '22,2°C', '72,0°F', '22,2°C'], ['dos', 'fr', '22,0°C', '72,0°F', '22,0°C'], ['dos', 'tr', '72.0°F', '72.0°F', '22.0°C'], ['dos', 'es', '22°C', '72°F', '22°C'],
    ['mac20', 'en', '72.0°F', '72.0°F', '22.0°C'], ['mac20', 'de', '22,2°C', '72,0°F', '22,2°C'], ['mac20', 'fr', '22,0°C', '72,0°F', '22,0°C'],
    ['301', 'en', '72.0°F', '72.0°F', '22.0°C'], ['301', 'fr', '22.0°C', '72.0°F', '22.0°C'], ['301', 'de', '72,0°F', '72,0°F', '22,0°C'], ['301', 'tr', '72.0°F', '72.0°F', '22.0°C'], ['301', 'es', '22°C', '72°F', '22°C'],
    ['405', 'en', '72.0°F', '72.0°F', '22.0°C'], ['405', 'fr', '22.0°C', '72.0°F', '22.0°C'], ['mac405', 'en', '72.0°F', '72.0°F', '22.0°C'], ['mac405', 'fr', '22.0°C', '72.0°F', '22.0°C'],
    ['original', 'en', '72.0°F', '72.0°F', '20.0°C'], ['original', 'fr', '72.0°F', '72.0°F', '20.0°C'], ['original', 'de', '72,0°F', '72,0°F', '20,0°C'], ['original', 'tr', '72.0°F', '72.0°F', '20.0°C'], ['original', 'es', '22°C', '72°F', '22°C'],
    ['palm', 'en', '72.0°F', '72.0°F', '20.0°C'], ['palm', 'fr', '72.0°F', '72.0°F', '20.0°C'],
    ['ios', 'en', '72.0ºF', '72.0ºF', '20.0ºC'], ['ios', 'fr', '72.0ºF', '72.0ºF', '20.0ºC'], ['ios', 'tr', '72.0ºF', '72.0ºF', '20.0ºC'], ['ios', 'de', '72,0ºF', '72,0ºF', '20,0ºC'],
    ['android', 'en', '72.0ºF', '72.0ºF', '20.0ºC'], ['android', 'tr', '72.0ºF', '72.0ºF', '20.0ºC']];
  for (const [id, lang, own, f, c] of T) {
    if (!HO.RULESETS[id] || !HO.languages(HO.RULESETS[id]).includes(lang)) { fail(`panel ${id} ${lang}: no such version/language`); continue; }
    const G = PG(id, lang);
    for (const [u, want] of [[null, own], ['F', f], ['C', c]]) { const got = HO.panelTemp(G, 72, u); if (got !== want) fail(`panel ${id} ${lang} ${u || 'as released'}: 72°F is "${got}", expected "${want}"`); }
  }
  // the tenth is real (T is in tenths), the sign is lost under one degree (T / 10 is 0), the °C by (T - K) x 5 / 9 truncated
  const E = PG('original', 'en'), D = PG('dos', 'en'), M = PG('12', 'en'), O = PG('ios', 'en');
  for (const [G, f, u, want] of [[D, 72.5, 'F', '72.5°F'], [D, 101.3, null, '101.3°F'], [D, -0.5, null, '0.5°F'], [D, -5.3, null, '-5.3°F'], [D, 0, null, '0.0°F'], [D, 400, null, '400.0°F'], [D, -200, null, '-200.0°F'],
    [M, 50, null, '9.7°C'], [M, 72.5, null, '22.2°C'], [M, -200, null, '-129.1°C'], [E, 50, 'C', '7.7°C'], [E, 72.5, 'C', '20.2°C'], [E, 0, 'C', '-20.0°C'], [E, 20, 'C', '-8.8°C'], [O, 99.9, 'C', '35.5ºC']]) {
    const got = HO.panelTemp(G, f, u); if (got !== want) fail(`panel ${f}°F ${u || 'as released'}: "${got}", expected "${want}"`);
  }
  // the gravity: g x 100 / home g truncated, "%d.%2.2dG"; the comma where the language or the version's French had one
  const GT = [['dos', 'en', '1.00G'], ['dos', 'de', '1,00G'], ['dos', 'fr', '1,00G'], ['dos', 'tr', '1.00G'], ['dos', 'es', '1,00G'], ['mac20', 'de', '1,00G'], ['12', 'en', '1.00G'], ['12', 'fr', '1,00G'],
    ['301', 'en', '1.00G'], ['301', 'fr', '1.00G'], ['301', 'de', '1,00G'], ['405', 'fr', '1.00G'], ['mac405', 'fr', '1.00G'], ['original', 'en', '1.00G'], ['original', 'fr', '1.00G'], ['palm', 'fr', '1.00G'],
    ['ios', 'fr', '1.00G'], ['ios', 'tr', '1.00G'], ['android', 'en', '1.00G']];
  for (const [id, lang, want] of GT) { const got = HO.gravText(PG(id, lang), 1.37, 1.37); if (got !== want) fail(`gravity ${id} ${lang}: home's own is "${got}", expected "${want}"`); }
  for (const [g, home, want] of [[1.38, 1.37, '1.00G'], [1.36, 1.37, '0.99G'], [0.5, 1.37, '0.36G'], [2, 0.5, '4.00G'], [0.25, 2, '0.12G'], [2.99, 0.25, '11.96G'], [1.05, 1.0, '1.05G'], [0.99, 1.0, '0.99G']]) {
    const got = HO.gravText(D, g, home); if (got !== want) fail(`gravity ${g}/${home}: "${got}", expected "${want}" (truncated)`);
  }
  if (HO.gravText(PG('dos', 'de'), 1.5, 1) !== '1,50G') fail('gravity German 1.5: ' + HO.gravText(PG('dos', 'de'), 1.5, 1));
  if (HO.gravText(PG('dos', 'de'), 1.5, 1, false) !== '1.50G') fail('gravity with a point (the Amiga)');
}

// ---------- the page ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const up = (url) => new Promise(res => { const r = http.get(url, (x) => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); });
async function page() {
  const port = +opt('port', 8881), url = `http://localhost:${port}/index.html`;
  let srv = null;
  if (!(await up(url))) { srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: root, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up(url)); i++) await sleep(250); }
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  // the versions each skin shows, and what a star panel reads as released (no choice)
  const RUNS = [['classic', '301'], ['classic', 'original'], ['classic', '12'], ['classic', 'palm'], ['amiga', 'dos'], ['amiga', 'dos', 'tr'], ['mac3', '301'], ['mac4', 'mac405'], ['w95', '405'], ['ios', 'ios'], ['dos', 'dos', 'de'], ['dos', 'dos', 'fr'], ['mac2', 'mac20', 'de'], ['mac2', 'mac20', 'fr'], ['classic', '301', 'fr'], ['classic', '12', 'fr'], ['classic', 'original', 'fr'], ['classic', '301', 'de'], ['classic', 'original', 'es'], ['android', 'android'], ['palm', 'palm'], ['classic', 'dos'], ['mac2', 'mac20'], ['dos', 'dos', 'es']];
  let n = 0;
  for (const [skin, rules, lang] of RUNS) {
    const seen = {};
    for (const pref of ['', 'C', 'F']) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
      const pg = await ctx.newPage();
      const errors = []; pg.on('pageerror', e => errors.push(e.message));
      await pg.addInitScript(([p]) => { try { if (!sessionStorage.getItem('cur')) { localStorage.clear(); sessionStorage.setItem('cur', '1'); if (p) localStorage.setItem('ho5.prefs', JSON.stringify({ temp: p })); } } catch (e) {} }, [pref]);
      await pg.goto(`${url}?skin=${skin}`);
      await pg.waitForFunction(() => window.HOAPI && document.querySelector('#titlescreen') && !document.querySelector('#titlescreen').classList.contains('loading'), null, { timeout: 30000 });
      await sleep(300);
      await pg.evaluate(() => HOAPI.newGameDialog());
      await pg.waitForSelector('form.newgame');
      await pg.evaluate(([id, l, s]) => {
        const f = document.querySelector('form.newgame'), set = (n, v) => { const e = f.querySelector(`select[name=${n}]`); if (e && [...e.options].some(o => o.value === v)) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } };
        set('rules', id); if (l) set('lang', l); set('skin', s);
      }, [rules, lang || '', skin]);
      await sleep(200);
      await pg.evaluate(() => { const f = document.querySelector('form.newgame'); f.requestSubmit ? f.requestSubmit() : f.querySelector('button[type=submit]').click(); });
      await pg.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 });
      await sleep(500);
      // the home planet's panel, the explored list, and an exploring report said as the page says it
      const got = await pg.evaluate(() => {
        const A = HOAPI, G = A.G, me = A.me();
        A.UI.sel = me.homeStar; A.renderPanel(); A.draw();
        const panel = document.body.innerText;
        const rep = HO.say(G, `You have explored ${G.stars[me.homeStar].name}. Gravity: 1.00G. Temp: 72.0°F. Metal: 1,000.`);
        return { panel: (panel.match(/[^\n]*[°º][^\n]*/g) || []).join(' | '), grav: (panel.match(/\d+[.,]\d\dG/g) || []).join(' '), rep, deg: A.degF(72) };
      });
      if (errors.length) fail(`${skin} ${rules} ${pref || 'as the original'}: ${errors.join('; ')}`);
      seen[pref || 'orig'] = got;
      const u = pref;
      const panelTok = tokens(got.panel), repTok = tokens(got.rep);
      if (u === 'C' && ![...panelTok, ...repTok].every(t => t.u === 'C')) fail(`${skin} ${rules} °C: "${got.panel}" / "${got.rep}"`);
      if (u === 'F' && [...panelTok, ...repTok].some(t => t.u === 'C')) fail(`${skin} ${rules} °F: "${got.panel}" / "${got.rep}"`);
      // as the original (no choice): the panel says what the source did (panelIsC), in the version's own format
      if (!u && skin !== 'amiga') { // (the Amiga skin's own panels are the Amiga's °C: docs/amiga-skin.md)
        const want = panelIsC(rules, lang || HOownLang(rules));
        if (want && !(panelTok.length && panelTok.every(t => t.u === 'C'))) fail(`${skin} ${rules} ${lang || ''}: the panel should show °C as the original: "${got.panel}"`);
        if (!want && panelTok.some(t => t.u === 'C')) fail(`${skin} ${rules} ${lang || ''}: the panel should show °F as the original: "${got.panel}"`);
      }
      if (u === 'C' && !panelTok.length) fail(`${skin} ${rules} °C: no temperature in the star panel`);
      // the panel's own format at home (72.0°F, 1.00G) in each version and language, for each choice (HO.panelTemp, HO.gravText)
      if (skin !== 'amiga') {
        const PGx = { seed: 1, rules, size: 'small', computers: 1, iq: 'average', shape: 'random' }; if ((lang || 'en') !== HO.ownLanguage(HO.RULESETS[rules])) PGx.lang = lang || 'en'; // (no language chosen: the page's English)
        const Gx = HO.newGame(PGx), want = HO.panelTemp(Gx, 72, u || null);
        if (!got.panel.includes(want)) fail(`${skin} ${rules} ${lang || ''} ${u || 'as released'}: the panel reads "${got.panel}", expected "${want}"`);
        const wantG = HO.gravText(Gx, 1, 1);
        if (!got.grav.split(' ').includes(wantG)) fail(`${skin} ${rules} ${lang || ''}: the gravity reads "${got.grav}", expected "${wantG}"`);
      } else if (!/^1\.00G\b/.test(got.grav)) fail(`${skin} ${rules} ${lang || ''}: the Amiga's gravity reads "${got.grav}", expected 1.00G`);
      n++;
      await ctx.close();
    }
    if (seen.C && seen.orig && seen.F) console.log(`  ${skin} ${rules}${lang ? ' ' + lang : ''}: as released "${seen.orig.deg}" / "${seen.orig.rep.slice(-40)}", °C "${seen.C.deg}", °F "${seen.F.deg}"`);
  }
  await browser.close();
  if (srv) srv.kill();
  console.log(`page: ${n} runs`);
}

(async () => {
  engine();
  if (!args.includes('--no-page')) await page();
  console.log(bad ? `${bad} failed` : 'all ok');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
