// The °C / °F preference, checked: node tools/temp-check.js [--port=8881] [--no-page]
//
// The player may choose, besides "As the original" (each version, language and skin as released), °C or
// °F for every temperature the game shows (docs/roadmap.md, 4h; HO.tempPref, HO.celsiusOf, js/engine.js
// tempText; the page's Prefs.temp in js/skins/classic/ui.js).
//
// The engine, without a page: for every version and each of its languages, plays a few turns and takes every
// report with a temperature, then says it as the original does (no choice), in °C and in °F. As the original
// must be what the translations write; in °C every temperature is a °C one, a version's own °C (the Amiga's,
// 1.2F's, the German 2.0's, iOS's French) left as it was, an °F one converted by the version's own formula
// where it had one; in °F no temperature says °C and the number is the report's own whole degrees.
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
const fail = (m) => { bad++; console.log('FAIL ' + m); };
const TOKEN = /(-?\d+(?:[.,]\d+)?)[\s ]?°[\s ]?([CF])?/g;
const tokens = (t) => [...String(t).matchAll(TOKEN)].map(m => ({ n: parseFloat(m[1].replace(',', '.')), u: m[2] || 'F', all: m[0] }));

// ---------- the engine ----------
function engine() {
  let texts = 0;
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id];
    if (!rs.languages) continue; // (the AI homages)
    for (const lang of HO.languages(rs)) {
      const o = { seed: 11, rules: id, size: 'small', computers: 3, iq: 'average', shape: 'random', humans: [{ name: 'Ann' }, { name: 'Bob', female: false }], alliances: true, novas: true };
      if (HO.ownLanguage(rs) !== lang) o.lang = lang;
      const G = HO.newGame(o);
      for (const p of HO.humans(G)) p.auto = true;
      const seen = new Map();
      for (let i = 0; i < 40 && !G.over; i++) {
        HO.endTurn(G);
        for (const p of HO.humans(G)) for (const m of p.inbox || []) if (m.text && m.text.includes('°')) seen.set(m.text, m);
      }
      // a canned message the computers send (I like planets that are 1.00G and 72.0°F.)
      seen.set('I like planets that are 1.00G and 72.0°F.', {});
      if (!seen.size) fail(`${id} ${lang}: no report with a temperature`);
      for (const [text] of seen) {
        texts++;
        const src = tokens(text);
        if (src.length !== 1) continue; // (one temperature in a report, or the text is not checked)
        const F = src[0].n;
        HO.tempPref = null; const own = HO.say(G, text);
        HO.tempPref = () => 'C'; const c = HO.say(G, text);
        HO.tempPref = () => 'F'; const f = HO.say(G, text);
        HO.tempPref = null;
        const ot = tokens(own), ct = tokens(c), ft = tokens(f);
        const tag = `${id} ${lang} "${text}"`;
        if (!ot.length) { if (own !== c || own !== f) fail(`${tag}: no temperature in "${own}" but "${c}" / "${f}"`); continue; }
        if (ct.length !== 1 || ft.length !== 1) { fail(`${tag}: "${c}" / "${f}" lost the temperature`); continue; }
        // °C: a °C one; the version's own °C untouched; else the plain conversion
        const wantC = (F - 32) * 5 / 9;
        if (ct[0].u !== 'C') fail(`${tag}: °C gave "${c}"`);
        else if (ot[0].u === 'C') { if (c !== own) fail(`${tag}: a °C the version wrote itself was changed: "${own}" -> "${c}"`); }
        else if (Math.abs(ct[0].n - wantC) > 0.51) fail(`${tag}: °C gave "${c}" for ${F}°F (${wantC.toFixed(2)})`);
        // °F: no °C left, the report's own whole degrees; an °F one untouched
        if (ft[0].u !== 'F') fail(`${tag}: °F gave "${f}"`);
        else if (ot[0].u === 'F') { if (f !== own && !(rs.celsius && ft[0].n === ot[0].n)) fail(`${tag}: an °F the version wrote itself was changed: "${own}" -> "${f}"`); } // (1.2's bare "71°" was shown in °C: it gets its unit)
        else if (ft[0].n !== F) fail(`${tag}: °F gave "${f}" for ${F}°`);
        if (own !== HO.say(G, text)) fail(`${tag}: as the original changed`);
      }
    }
  }
  // the version's own °C formula, whole degrees as it shows them
  const G12 = HO.newGame({ seed: 1, rules: '12', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  const Gde = HO.newGame({ seed: 1, rules: 'dos', lang: 'de', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  const Gen = HO.newGame({ seed: 1, rules: 'original', size: 'small', computers: 1, iq: 'average', shape: 'random' });
  for (const [G, f, want, name] of [[G12, 72, '22.2', '1.2'], [G12, 50, '10.0', '1.2'], [Gde, 71, '21', 'DOS 2.0 in German (truncated)'], [Gde, 33, '0', 'DOS 2.0 in German (truncated)'],
    [Gde, 20, '-6', 'DOS 2.0 in German (truncated toward zero)'], [Gen, 71, '22', '5.0.5 (rounded)'], [Gen, 33, '1', '5.0.5 (rounded)'], [Gen, 20, '-7', '5.0.5 (rounded)']]) {
    const got = HO.celsiusOf(G, f);
    if (got !== want) fail(`celsiusOf ${name}: ${f}°F is ${got}, expected ${want}`);
  }
  console.log(`engine: ${texts} reports in ${Object.values(HO.RULESETS).filter(r => r.languages).length} versions checked`);
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
  const RUNS = [['classic', '301'], ['classic', 'original'], ['classic', '12'], ['classic', 'palm'], ['amiga', 'dos'], ['amiga', 'dos', 'tr'], ['mac3', '301'], ['mac4', 'mac405'], ['w95', '405'], ['ios', 'ios'], ['dos', 'dos', 'de']];
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
        const rep = HO.say(G, `You have explored ${G.stars[me.homeStar].name}. Gravity: 1.00G. Temp: 72°. Metal: 1,000.`);
        return { panel: (panel.match(/[^\n]*°[^\n]*/g) || []).join(' | '), rep, deg: A.degF(72) };
      });
      if (errors.length) fail(`${skin} ${rules} ${pref || 'as the original'}: ${errors.join('; ')}`);
      seen[pref || 'orig'] = got;
      const u = pref;
      const panelTok = tokens(got.panel), repTok = tokens(got.rep);
      if (u === 'C' && ![...panelTok, ...repTok].every(t => t.u === 'C')) fail(`${skin} ${rules} °C: "${got.panel}" / "${got.rep}"`);
      if (u === 'F' && [...panelTok, ...repTok].some(t => t.u === 'C')) fail(`${skin} ${rules} °F: "${got.panel}" / "${got.rep}"`);
      if (u === 'C' && !panelTok.length) fail(`${skin} ${rules} °C: no temperature in the star panel`);
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
