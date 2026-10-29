// The currency sign, checked in the page: node tools/currency-check.js [skin ...] [--lang=fr] [--port=8880]
//
// For every skin and the versions it shows, in each language (--lang= one), starts a game as the
// player would, puts money into the game's reports (a gift, a gift given, a surrender, a found
// treasure: the text the rules write with "$"), and reads what a player sees on the main screen,
// in the reports (the message window, the message log) and in the common windows (Build, Players,
// Preferences, Give, Dip Into Savings, Fix Spending ...). Money must be written with the sign
// HO.currency(G) says and with no other: "€" in French in iOS, Android, 5.0.5 and the Palm
// (js/engine.js, EURO_FRENCH), "$" everywhere else. A "$" in a curse ("#!$@*$&@") does not count.
// It also checks the engine: the report in each language, and each money format, directly.
// --patch plays with the unofficial patch on (the sign is the same). Chromium comes from PLAYWRIGHT_BROWSERS_PATH, Playwright from NODE_PATH ($(npm root -g)).
'use strict';
const path = require('path'), http = require('http');
const { spawn } = require('child_process');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HO = require(path.join(root, 'js/engine.js'));
Object.assign(HO.DATA, require(path.join(root, 'js/data.js')));
const EURO = (id, lang) => lang === 'fr' && ['ios', 'android', 'original', 'palm'].includes(id);
let chromium;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const up = (url) => new Promise(res => { const r = http.get(url, (x) => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); });

// what the rules write, with the money in it
const MONEY_TEXTS = (a, b) => [`${a} has just given you $1,234.`, `You just gave ${a} $2,500.`, `${a} surrenders to you, giving you $12,345K.`,
  'You have found a wealth of precious metals and have increased your savings by $3,456.', `${a} has just given you $12.345M.`];

// ---------- the engine, without a page ----------
let bad = 0;
const CURSE = /#!\$@\*\$&@|%\$\*\^&%!|#&@\$&\*!|!\$@\*\$&@!|\$\*@%\$&/g;
function engineChecks() {
  const out = [];
  for (const id of Object.keys(HO.RULESETS)) {
    const rs = HO.RULESETS[id];
    for (const lang of HO.languages(rs)) {
      const o = { seed: 5, rules: id, size: 'small', computers: 2, iq: 'average', shape: 'random', humans: [{ name: 'Ann' }] };
      if (HO.ownLanguage(rs) !== lang) o.lang = lang;
      let G;
      try { G = HO.newGame(o); } catch (e) { out.push(`${id} ${lang}: ${e.message}`); continue; }
      const want = EURO(id, G.opts.lang) ? '€' : '$', got = HO.currency(G);
      if (got !== want) out.push(`${id} ${lang}: HO.currency is ${got}, expected ${want}`);
      const other = want === '€' ? '$' : '€', who = G.players[1].name;
      for (const t of MONEY_TEXTS(who)) {
        const s = HO.say(G, t);
        if (!HO.saysIn(G, t) && lang !== 'en' && HO.ownLanguage(rs) !== lang) continue; // (untranslated: lang-test's)
        if (s.replace(CURSE, '').includes(other)) out.push(`${id} ${lang}: "${t}" -> "${s}"`);
        if (want === '€' && id !== 'palm' && !s.includes(want)) out.push(`${id} ${lang}: "${t}" -> "${s}" has no ${want}`);
      }
      // the money formats
      const R = HO.rules(G), f = R.fmtMoney;
      for (const n of [0, 5, -5, 1234, -1234, 123456, 12345678, -12345678]) {
        const s = f ? f(n, HO.currency(G)) : null;
        if (s != null && s.includes(other)) out.push(`${id} ${lang}: fmtMoney(${n}) = ${s}`);
        if (s != null && !s.includes(want)) out.push(`${id} ${lang}: fmtMoney(${n}) = ${s} has no ${want}`);
        const S = R.shortMoney;
        if (S) { const p = S.fn(n, HO.currency(G)); if (p.includes(other) || !p.includes(want)) out.push(`${id} ${lang}: shortMoney(${n}) = ${p}`); }
      }
    }
  }
  return out;
}

// ---------- the page ----------
function pageText() {
  const out = [];
  const visible = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { if (n.hidden) return false; const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.data.trim(), e = n.parentElement;
    if (!t || !e || e.closest('script, style')) continue;
    if (e.tagName === 'OPTION' ? !visible(e.closest('select') || e) : !visible(e)) continue;
    out.push(t);
  }
  for (const i of document.querySelectorAll('input, textarea')) if (i.value && visible(i)) out.push(i.value);
  for (const e of document.querySelectorAll('[title], [aria-label]')) if (visible(e)) { if (e.title) out.push(e.title); const a = e.getAttribute('aria-label'); if (a) out.push(a); }
  return out;
}
function wrong(texts, want) {
  const other = want === '€' ? '$' : '€', res = [];
  // (not money: a curse, the Palm's "$" button named in its help, the Palm's "Money in € not $" preference)
  for (const t of texts) { const s = t.replace(CURSE, ''); if (s.includes(other) && !(s.includes('€') && s.includes('$')) && !(other === '$' && /button|bouton|Taste|düğme|botón/i.test(s)) && !(other === '$' && /^(Need \$|Besoin de \$|Brauche \$|\$ lazım|Necesito \$)$/.test(s))) res.push(s); }
  return res;
}
async function run(browser, url, r) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errors = [], seen = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.addInitScript(([id, l, p]) => { try { if (!sessionStorage.getItem('cur')) { localStorage.clear(); localStorage.setItem('ho5.rules', id); localStorage.setItem('ho5.language', l); localStorage.setItem('ho5.language.at', String(Date.now())); if (p) localStorage.setItem('ho5.patch', '1'); sessionStorage.setItem('cur', '1'); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } } catch (e) {} }, [r.rules, r.lang, args.includes('--patch')]);
  await page.goto(`${url}?skin=${r.skin}`);
  await page.waitForFunction(() => window.HOAPI && document.querySelector('#titlescreen') && !document.querySelector('#titlescreen').classList.contains('loading'), null, { timeout: 30000 });
  await sleep(300);
  await page.evaluate(() => HOAPI.newGameDialog());
  await page.waitForSelector('form.newgame');
  await page.evaluate(([id, l, s]) => {
    const f = document.querySelector('form.newgame'), set = (n, v) => { const e = f.querySelector(`select[name=${n}]`); if (e && [...e.options].some(o => o.value === v)) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } };
    set('rules', id); set('lang', l); set('skin', s);
  }, [r.rules, r.lang, r.skin]);
  await sleep(200);
  await page.evaluate(() => { const f = document.querySelector('form.newgame'); f.requestSubmit ? f.requestSubmit() : f.querySelector('button[type=submit]').click(); });
  await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 });
  await sleep(500);
  const grab = async (where) => { const t = await page.evaluate(pageText); seen.push({ where, t }); };
  const want = await page.evaluate(() => HO.currency(HOAPI.G));
  if (want !== (EURO(r.rules, r.lang) ? '€' : '$')) errors.push(`HO.currency is ${want}`);
  await grab('the game');
  // the player's own colony: its panel and the bars
  await page.evaluate(() => { const a = HOAPI, me = a.me(); const s = me.homeStar; if (a.UI) { a.UI.sel = s; } try { a.centerOn && a.centerOn(s); } catch (e) {} });
  await sleep(200); await grab('the home star');
  // reports with money in them
  await page.evaluate((texts) => { const G = HOAPI.G, me = HOAPI.me(); for (const t of texts) HO.msg(G, me.id, t, { icon: 'm9048' }); HOAPI.showMessages && HOAPI.showMessages(); }, MONEY_TEXTS(r.lang === 'tr' ? 'Joe' : 'Joe'));
  await sleep(400); await grab('the reports');
  await page.evaluate(() => { try { document.querySelectorAll('#msg button').forEach(b => { if (/Next|Suivant|Sonraki|Weiter|Siguiente|OK/i.test(b.textContent)) b.click(); }); } catch (e) {} });
  await sleep(150); await grab('the next report');
  const WINDOWS = [['Build Ships', 'api.openBuild(api.me().homeStar)'], ['Players', 'api.openPlayers()'], ['Preferences', 'api.openPrefs()'], ['Give', 'api.openGive()'],
    ['Dip', 'api.openDip && api.openDip()'], ['Fix Spending', 'api.openFixSpending && api.openFixSpending(api.me().homeStar)'], ['Surrender', 'api.openSurrender()'],
    ['Send a message', 'api.openChat()'], ['Auto play', 'api.openAutoPlay()'], ['Reports', 'api.openReports && api.openReports()'], ['Explored stars', 'api.openStarList()'], ['About', 'api.openAbout()']];
  for (const [name, code] of WINDOWS) {
    try {
      await page.evaluate((c) => { const api = HOAPI; return new Function('api', 'return ' + c)(api); }, code);
      await sleep(200);
      if (await page.evaluate(() => !!document.querySelector('.scrim, .hoscreen'))) await grab(name);
    } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); }
    await page.evaluate(() => { const a = HOAPI; a.closeModal(); if (a.closeScreen) a.closeScreen(); document.querySelectorAll('.scrim').forEach(s => s.remove()); });
    await sleep(50);
  }
  // a turn on, with money moving
  try { await page.evaluate(() => HOAPI.doEndTurn && HOAPI.doEndTurn()); await sleep(900); await grab('after a turn'); } catch (e) { errors.push('turn: ' + e.message.split('\n')[0]); }
  await ctx.close();
  const found = [];
  let anyMoney = false;
  for (const { where, t } of seen) {
    for (const s of wrong(t, want)) found.push(`[${where}] ${s}`);
    if (t.some(x => x.includes(want) && /\d/.test(x))) anyMoney = true;
  }
  if (!anyMoney) found.push('no money with the sign was seen at all');
  return { found, errors };
}

(async () => {
  const eng = engineChecks();
  for (const e of eng) console.log('engine: ' + e);
  if (eng.length) bad++;
  console.log(eng.length ? `engine: ${eng.length} finding(s)` : 'engine: ok');
  if (args.includes('--engine')) process.exit(bad ? 1 : 0);
  try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (NODE_PATH=$(npm root -g)).'); process.exit(2); }
  const ED = {};
  for (const f of HO.families()) for (const e of HO.editions(typeof f === 'string' ? f : f.id)) for (const s of e.skins || []) (ED[s] = ED[s] || []).push(e.id);
  const SKINS = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : Object.keys(ED);
  const LANGS = opt('lang', null) ? [opt('lang')] : ['fr', 'tr', 'en'];
  const runs = [];
  for (const skin of SKINS) for (const id of ED[skin] || []) for (const lang of LANGS) {
    const L = HO.languages(HO.RULESETS[id]);
    if (L.includes(lang) || (lang === 'en' && !L.length)) runs.push({ skin, rules: id, lang });
  }
  let port = +opt('port', 0), server = null;
  if (!port) {
    for (let p = 8890; p <= 8899; p++) if (!(await up(`http://localhost:${p}/`))) { port = p; break; }
    server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await up(`http://localhost:${port}/`)); i++) await sleep(100);
  }
  const url = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  try {
    const queue = runs.slice(), results = new Map();
    await Promise.all([...Array(+opt('jobs', 4))].map(async () => { for (let r; (r = queue.shift());) { try { results.set(r, await run(browser, url, r)); } catch (e) { results.set(r, { found: [], errors: ['exception: ' + (e && e.message)] }); } } }));
    for (const r of runs) {
      const x = results.get(r), n = x.found.length + x.errors.length;
      console.log(`== ${r.skin} · ${r.rules} · ${r.lang}: ${n ? n + ' finding(s)' : 'ok'}`);
      for (const f of x.found) console.log('   ' + f);
      for (const e of x.errors) console.log('   error: ' + e);
      if (n) bad++;
    }
  } finally { await browser.close(); if (server) process.kill(server.pid); }
  console.log(bad ? `\n${bad} finding group(s)` : `\nall ${runs.length} runs ok`);
  process.exit(bad ? 1 : 0);
})();
