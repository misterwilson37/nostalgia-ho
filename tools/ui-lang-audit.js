// The remake's interface in every language, in every skin:
//   node tools/ui-lang-audit.js [skin ...] [--lang=fr] [--count] [--show] [--port=8880]
//
// For every skin and every language its versions offer (rs.languages of the
// rulesets whose skins it is, js/engine.js editions), it opens the title
// screen, New Game, a game's main screen, each menu, and the common windows
// (Build Ships, Players, Preferences, About, Account, the version's Hall
// where it has one, …) through the page, collects the text a player sees
// (text nodes, field values and placeholders, outside translate="no"), and
// flags:
//   - untranslated: a string js/ui-text.js has a translation for, shown in
//     English in another language (HOUI.tr changes it);
//   - foreign: a word of a third language (not the run's, not English): a
//     word of another language's column of the table (or the official
//     texts' words, js/lang-data.js) found in no English and none of the
//     run's; in the English run, any word of French, German, Turkish or
//     Spanish;
//   - English: in another language, a string with two words or more that
//     are English and not the language's (the table's English column and
//     common English words).
// The names in the game (stars, players, ship types, the galaxy) and the
// languages' own names ("Français (traduction du remake)") are left out.
// --count prints the table's counts (official, adapted, the remake's) per
// language, for docs/translations.md. --show prints every string seen.
//
// Chromium comes from PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers here) and
// Playwright from NODE_PATH ($(npm root -g)). It serves the repository on
// the first free port from 8880 to 8889 and stops that server (by its
// PID) at the end. Exit code 1 on a finding.
'use strict';
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SHOW = args.includes('--show');

global.window = global;
require(path.join(root, 'js/ui-lang.js'));
require(path.join(root, 'js/ui-text.js'));
try { require(path.join(root, 'js/ui-text-help.js')); } catch (e) { /* (not there yet) */ }
if (args.includes('--count')) {
  const c = HOUI.count(), N = { fr: 'French', de: 'German', tr: 'Turkish', es: 'Spanish' };
  console.log(`${HOUI.rows().length} strings`);
  for (const l in c) console.log(`${N[l]}: ${c[l].official} official, ${c[l].adapted} adapted, ${c[l].remake} the remake's${c[l].missing ? `, ${c[l].missing} missing` : ''}`);
  process.exit(0);
}
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (NODE_PATH=$(npm root -g)).'); process.exit(2); }
const HO = require(path.join(root, 'js/engine.js'));

// ---------- the vocabularies ----------
const LANGS = ['en', 'fr', 'de', 'tr', 'es'];
const words = (s) => (String(s).match(/[A-Za-zÀ-ÖØ-öø-ÿĀ-ſ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿĀ-ſ]+)?/g) || []).map(w => w.toLocaleLowerCase('tr').replace(/’/g, "'"));
const V = {}; for (const l of LANGS) V[l] = new Set();
// every string of the table in each language (a translation may be another row's English: Turkish "Tip" for Type)
const TRANSLATED = {}; LANGS.forEach((l, i) => { TRANSLATED[l] = new Set(HOUI.rows().map(r => r[i]).filter(x => typeof x === 'string')); });
for (const r of HOUI.rows()) LANGS.forEach((l, i) => { if (typeof r[i] === 'string') for (const w of words(r[i].replace(/%(\d+\$)?[sd]/g, ' '))) V[l].add(w); });
// the official texts' words: the iOS game's French and Turkish, 1.2F's French, the German DOS 2.0
const HOLANG = require(path.join(root, 'js/lang-data.js'));
const addAll = (l, o) => { if (typeof o === 'string') for (const w of words(o.replace(/%[-.*0-9]*l?[sdu@F]+/g, ' '))) V[l].add(w); else if (o && typeof o === 'object') for (const k in o) addAll(l, o[k]); };
const iosSets = (L) => ['Report Window Templates', 'Alert Strings', 'Misc Strings', 'sprintf Templates', 'Help Messages'].map(k => HOLANG.ios[L][k]);
addAll('fr', iosSets('fr')); addAll('tr', iosSets('tr')); addAll('en', iosSets('en'));
addAll('fr', HOLANG.mac12Fr['1000']); addAll('fr', HOLANG.mac12Fr['1005']); addAll('fr', HOLANG.mac12Fr['4000']);
for (const k in HOLANG.dosDe.s) if (+k >= 600 || +k < 432) addAll('de', HOLANG.dosDe.s[k]);
// the Amiga skin's own words (its WORDS: German, English, French, Turkish, Spanish)
// (in the Amiga skin, a word of its own is never one left in English: its French "Mine" is 1.2F's)
const AMIGA_OWN = {}; LANGS.forEach(l => { AMIGA_OWN[l] = new Set(); });
{
  const src = require('fs').readFileSync(path.join(root, 'js/skins/amiga/ui.js'), 'utf8');
  const m = /const WORDS = (\{[\s\S]*?\n\});/.exec(src);
  const AW = m ? new Function('return ' + m[1])() : {};
  const order = ['de', 'en', 'fr', 'tr', 'es'];
  for (const k in AW) order.forEach((l, i) => { if (typeof AW[k][i] === 'string') { for (const w of words(AW[k][i].replace(/%\d/g, ' '))) V[l].add(w); AMIGA_OWN[l].add(AW[k][i].trim()); } });
}
// common English words (the table's English column has most)
for (const w of 'the a an and or of to in on at by for with from your you yours this that these those is are was were be been it its it\'s not no yes all any some more most less only just than then there their they them he she his her we our us who what which when where why how will would can could should may might must do does did done have has had get got make made one two three first last next new old other another each every own same such very too also here now off out up down over under again once into onto about'.split(' ')) V.en.add(w);
// a word belongs to another language when it is that language's and neither English nor the run's
const distinct = (w, M, L) => V[M].has(w) && !V.en.has(w) && !V[L].has(w) && w.length >= 4;
const isEnglish = (w, L) => V.en.has(w) && !V[L].has(w) && w.length >= 3;

// ---------- the runs ----------
const ED = {}; // skin -> [ruleset ids]
for (const f of HO.families()) for (const e of HO.editions(typeof f === 'string' ? f : f.id)) for (const s of e.skins || []) (ED[s] = ED[s] || []).push(e.id);
const langsOf = (id) => { const L = HO.languages(HO.RULESETS[id]); return L.length ? L : ['en']; };
const SKINS = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : Object.keys(ED);
const ONLY = opt('lang', null);
const runs = [];
for (const skin of SKINS) {
  const rs = ED[skin] || ['original'], done = new Set();
  const mine = [];
  for (const id of rs) for (const l of langsOf(id)) if (!done.has(l)) { done.add(l); mine.push({ skin, rules: id, lang: l }); }
  // English first: its strings are what another language's run must not show unchanged
  mine.sort((a, b) => (a.lang === 'en' ? 0 : 1) - (b.lang === 'en' ? 0 : 1));
  for (const r of mine) if (!ONLY || ONLY === r.lang || r.lang === 'en') runs.push(Object.assign(r, { quiet: ONLY && ONLY !== r.lang }));
}
// what may show the same in every language: names of products and people
const SAME = /^(Spaceward Ho!?|Ho!.*|Game Center|System \d|Windows (3\.1|95)|Palm OS|Mac OS 9|iOS \d+|Mac OS X \(Aqua\)|Workbench \(Amiga\)|Mac OS 8\.6\/9\/X|Mac|DOS|Amiga|Delta Tao Software|#!\$@\*\$&@•™!|%\$\*\^&%!!|Jake|Player \d|iOS .*|you@example\.com|Marc & Christoph|Airospace|Copyright 1992-94 New World Computing Inc\.|Big Bang|Terra\.|Info|Mini:?|Tip|Profit:?|Profit total|Temp:|linear|log|Pixels|Metal:|Spaceward HO! © .*)$/;

const up = (url) => new Promise(res => { const r = http.get(url, (x) => { x.resume(); res(x.statusCode < 500); }); r.on('error', () => res(false)); r.setTimeout(1500, () => { r.destroy(); res(false); }); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const EN_SEEN = {};

// in the page: the text a player sees, and the names to leave out
function pageText() {
  const out = new Set();
  const visible = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { if (n.hidden) return false; const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
  const keep = (e) => !!(e && e.closest('[translate=no], script, style, svg'));
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.data.trim(), e = n.parentElement;
    if (!t || !/[A-Za-zÀ-ÿ]/.test(t) || keep(e)) continue;
    // a select's options all count (they show when it opens); else only what shows
    if (e.tagName === 'OPTION' ? !visible(e.closest('select') || e) : !visible(e)) continue;
    out.add(t);
  }
  for (const i of document.querySelectorAll('input:not([type]), input[type=text], input[type=email], input[type=password], input[type=number], textarea')) {
    if (!visible(i) || keep(i)) continue;
    if (i.placeholder) out.add(i.placeholder.trim());
    if (i.value && /[A-Za-z]/.test(i.value) && i.type !== 'password') out.add(i.value.trim());
  }
  return [...out];
}
function pageNames() {
  const a = HOAPI, G = a.G, n = new Set();
  const add = (s) => { if (s) for (const w of String(s).split(/[^A-Za-zÀ-ÖØ-öø-ÿĀ-ſ'’]+/)) if (w) n.add(w.toLocaleLowerCase('tr').replace(/’/g, "'")); };
  if (G) {
    for (const s of G.stars) add(s.name);
    for (const p of G.players) { add(p.name); for (const d of p.designs || []) add(d.name); }
    add(G.opts.galaxy);
  }
  for (const id in HO.RULESETS) for (const l of HO.languages(HO.RULESETS[id])) add(HO.languageName(HO.RULESETS[id], l));
  for (const k of (window.HOSKINS && HOSKINS.list) || []) add(k.name);
  for (const k of (window.HOSKINS && HOSKINS.soundSets) || []) add(k.name);
  return [...n];
}

async function audit(browser, url, run) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } }); // (each run its own localStorage)
  const page = await ctx.newPage();
  const errors = [], seen = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && m.text().startsWith('[HO bug]')) errors.push(m.text()); });
  page.on('dialog', d => d.accept());
  // the run's language chosen as the player would (the title screen's Language,
  // js/ui-lang.js HOUI.pref): the title in it, and New Game starting from it
  await page.addInitScript(([r, l]) => { try { if (!sessionStorage.getItem('aud')) { localStorage.clear(); localStorage.setItem('ho5.rules', r); localStorage.setItem('ho5.language', l); localStorage.setItem('ho5.language.at', String(Date.now())); sessionStorage.setItem('aud', '1'); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } } catch (e) {} }, [run.rules, run.lang]);
  await page.goto(`${url}?skin=${run.skin}`);
  await page.waitForFunction(() => window.HOAPI && document.querySelector('#titlescreen') && !document.querySelector('#titlescreen').classList.contains('loading'), null, { timeout: 30000 });
  await sleep(400);
  const grab = async (where) => { const t = await page.evaluate(pageText); seen.push({ where, t }); };
  await grab('title screen');
  // New Game: the version, its language, this skin
  await page.evaluate(() => HOAPI.newGameDialog());
  await page.waitForSelector('form.newgame');
  await page.evaluate(([r, l, s]) => {
    const f = document.querySelector('form.newgame'), set = (n, v) => { const e = f.querySelector(`select[name=${n}]`); if (e && [...e.options].some(o => o.value === v)) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); } };
    set('rules', r); set('lang', l); set('skin', s);
  }, [run.rules, run.lang, run.skin]);
  await sleep(250);
  await grab('New Game');
  await page.evaluate(() => { const f = document.querySelector('form.newgame'); f.requestSubmit ? f.requestSubmit() : f.querySelector('button[type=submit]').click(); });
  await page.waitForFunction(() => HOAPI.G, null, { timeout: 15000 });
  await sleep(700);
  await grab('the game');
  // the menus
  const nMenus = await page.locator('#menubar .menu > button').count();
  for (let i = 0; i < nMenus; i++) {
    const b = page.locator('#menubar .menu > button').nth(i);
    if (!(await b.isVisible())) continue;
    await b.click({ force: true }); await sleep(120);
    await grab('menu ' + (await b.innerText()).trim());
    await page.keyboard.press('Escape'); await page.mouse.click(5, 850); await sleep(60);
    await page.evaluate(() => document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open')));
  }
  // the windows
  const WINDOWS = [
    ['Build Ships', 'api.openBuild(api.me().homeStar)'], ['Players', 'api.openPlayers()'], ['Preferences', 'api.openPrefs()'],
    ['About', 'api.openAbout()'], ['How to play', 'api.openHelp()'], ['Account', 'api.openAccount()'], ['All fleets', 'api.openFleetList()'],
    ['Explored stars', 'api.openStarList()'], ['Ship types', 'api.openScrapTypes()'], ['Give', 'api.openGive()'], ['Send a message', 'api.openChat()'],
    ['Skin and OS look', 'api.openSkin()'], ['Sounds', 'api.openSounds()'], ['Language', 'api.openLanguage()'], ['Auto play', 'api.openAutoPlay()'],
    ['Surrender', 'api.openSurrender()'], ['Hall of Fame', 'api.hasHall(api.G) && api.openHall("fame")'], ['Hall of Shame', 'api.hasHall(api.G) && api.openHall("shame")'],
    ['Master points', 'api.hasHall(api.G) && HO.rules(api.G).hall.master !== false && api.openMasterList()'], ['Ranks', 'HO.rules(api.G).masterPoints && !HO.rules(api.G).gameCenter && api.openRanks()'],
    ['Game Center', 'HO.rules(api.G).gameCenter && api.openGameCenter()'], ['Saved games', '(HO.rules(api.G).screens || {}).savedGames && api.openSavedGames()'],
  ];
  for (const [name, code] of WINDOWS) {
    try {
      await page.evaluate((c) => { const api = HOAPI; return new Function('api', 'return ' + c)(api); }, code);
      await sleep(name === 'Account' ? 1500 : 200);
      if (await page.evaluate(() => !!document.querySelector('.scrim, .hoscreen'))) await grab(name);
    } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); }
    await page.evaluate(() => { const a = HOAPI; a.closeModal(); if (a.closeScreen) a.closeScreen(); document.querySelectorAll('.scrim').forEach(s => s.remove()); });
    await sleep(60);
  }
  const names = new Set(await page.evaluate(pageNames));
  await ctx.close();
  // ---- the checks ----
  const L = run.lang, found = [];
  const enRun = EN_SEEN[run.skin] || new Set();
  if (L === 'en') EN_SEEN[run.skin] = new Set(seen.flatMap(x => x.t));
  for (const { where, t } of seen) for (const s of t) {
    if (SHOW) console.log(`   ${where}: ${s}`);
    const ws = words(s).filter(w => !names.has(w) && w.length > 1);
    if (!ws.length || SAME.test(s)) continue;
    if (L !== 'en' && HOUI.tr(s, L) !== s && !TRANSLATED[L].has(s) && !(run.skin === 'amiga' && AMIGA_OWN[L].has(s))) { found.push({ kind: 'untranslated', where, s }); continue; }
    const third = [];
    for (const M of LANGS) if (M !== 'en' && M !== L) for (const w of ws) if (distinct(w, M, L)) third.push(`${w} (${M})`);
    if (third.length) { found.push({ kind: 'foreign', where, s, why: third.join(', ') }); continue; }
    if (L === 'en') continue;
    // shown the same as in the English run, and the table doesn't say it is the same in this language
    if (enRun.has(s) && !(HOUI.known(s, L) && HOUI.tr(s, L) === s) && !TRANSLATED[L].has(s) && !(run.skin === 'amiga' && AMIGA_OWN[L].has(s))) { found.push({ kind: 'same as English', where, s }); continue; }
    const e = ws.filter(w => isEnglish(w, L)); if (e.length >= 2 || (e.length && e.length === ws.length)) found.push({ kind: 'English', where, s, why: e.join(' ') });
  }
  return { found, errors };
}

(async () => {
  let port = +opt('port', 0), server = null;
  if (!port) {
    for (let p = 8880; p <= 8889; p++) if (!(await up(`http://localhost:${p}/`))) { port = p; break; }
    server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await up(`http://localhost:${port}/`)); i++) await sleep(100);
  }
  const url = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  let bad = 0;
  const seenKey = new Set();
  // the skins side by side (--jobs, 4), each skin's runs in turn, English first
  const bySkin = []; for (const r of runs) { const g = bySkin.find(x => x[0].skin === r.skin); if (g) g.push(r); else bySkin.push([r]); }
  const out = new Map();
  const one = async (run) => {
    let r;
    try { r = await audit(browser, url, run); } catch (e) { r = { found: [], errors: ['exception: ' + (e && e.message)] }; }
    out.set(run, r);
  };
  try {
    const queue = bySkin.slice(), JOBS = +opt('jobs', 4);
    await Promise.all([...Array(JOBS)].map(async () => { for (let g; (g = queue.shift());) for (const run of g) await one(run); }));
    for (const run of runs) {
      const r = out.get(run), n = r.found.length + r.errors.length;
      if (run.quiet) continue;
      console.log(`== ${run.skin} · ${run.rules} · ${run.lang}: ${n ? n + ' finding(s)' : 'ok'}`);
      for (const f of r.found) { const k = run.lang + '|' + f.kind + '|' + f.s; const again = seenKey.has(k); seenKey.add(k); console.log(`   ${f.kind}${again ? ' (again)' : ''} [${f.where}]: ${f.s}${f.why ? '  <- ' + f.why : ''}`); }
      for (const e of r.errors) console.log('   error: ' + e);
      if (n) bad++;
    }
  } finally {
    await browser.close();
    if (server) process.kill(server.pid);
  }
  console.log(bad ? `\n${bad} of ${runs.length} run(s) with findings` : `\nall ${runs.length} runs ok`);
  process.exit(bad ? 1 : 0);
})();
