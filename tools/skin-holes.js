// Which classic (5.0.5) pictures a skin still borrows:
//   node tools/skin-holes.js [skin] [--rules=original] [--json=out.json] [--port=8880]
//
// Opens the game in the skin (default mac12) with a ruleset (default
// original, the 5.0.5 rules: the one with the most features), plays it,
// and exercises every place a picture is drawn: the map (every planet
// state, novas, allies, every zoom), every ship type over a spread of tech,
// every 5.0.5 report template (HO.DATA.reports) and rank picture, real
// reports from played turns, a battle replay, and the windows (Players,
// Ranks, Master List, You Won, You Lost, Build, Fleets, Stars, About).
//
// Every picture drawn on a canvas (drawImage) or shown in an <img> is
// recorded. Those from assets/sprites/ or assets/explore/ are the classic
// skin's: the holes. Each is listed with where it was seen. Pictures from
// the skin's own folder are counted, not listed. Exit code 1 when a hole is
// found (0 for the classic skin itself).
//
// Chromium and Playwright as for tools/ui-lang-audit.js (NODE_PATH=$(npm
// root -g), PLAYWRIGHT_BROWSERS_PATH). It serves the repository on the
// free port picked at random from 8880-9879 (so runs side by side work)
// and stops that server at the end.
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SKIN = args.find(a => !a.startsWith('--')) || 'mac12';
const RULES = opt('rules', 'original');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (NODE_PATH=$(npm root -g)).'); process.exit(2); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const up = (port) => new Promise(res => http.get(`http://127.0.0.1:${port}/index.html`, r => { r.resume(); res(r.statusCode === 200); }).on('error', () => res(false)));

// recorded in the page: every picture drawn, by URL, with the step it was drawn in
function instrument() {
  // A picture counts once it reaches the screen: drawn on a canvas that is in
  // the page, or shown in an <img>. Off-screen canvases carry what was drawn
  // on them (__src) until they are shown, drawn on a shown canvas, or turned
  // into a data: URL (toDataURL) that an <img> shows.
  window.__seen = {}; window.__step = 'start';
  const data = {};
  const key = (src) => src.replace(/^.*?(assets\/)/, '$1');
  const note = (list) => { for (const k of list) (window.__seen[k] = window.__seen[k] || {})[window.__step] = 1; };
  const srcOf = (x) => !x ? [] : x.tagName === 'IMG' ? (x.src.startsWith('data:') ? data[x.src] || [] : [key(x.src)]) : x.tagName === 'CANVAS' ? [...(x.__src || [])] : [];
  const d = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (im, ...a) {
    const c = this.canvas, s = srcOf(im);
    if (c.isConnected) note(s); else { c.__src = c.__src || new Set(); s.forEach(k => c.__src.add(k)); }
    return d.call(this, im, ...a);
  };
  const td = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (...a) { const r = td.apply(this, a); data[r] = [...(this.__src || [])]; return r; };
  const scan = () => {
    document.querySelectorAll('img').forEach(i => { const s = i.currentSrc || i.src; if (s && !s.startsWith('blob:')) note(s.startsWith('data:') ? data[s] || [] : [key(s)]); });
    document.querySelectorAll('canvas').forEach(c => { if (c.__src) note([...c.__src]); });
  };
  window.__scan = scan;
  const watch = () => new MutationObserver(scan).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  if (document.documentElement) watch(); else document.addEventListener('DOMContentLoaded', watch);
}

async function run(url) {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.addInitScript(instrument);
  await page.addInitScript((r) => { try { if (!sessionStorage.getItem('holes')) { localStorage.clear(); localStorage.setItem('ho5.rules', r); sessionStorage.setItem('holes', '1'); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } } catch (e) {} }, RULES);
  await page.goto(`${url}?skin=${SKIN}`);
  await page.waitForFunction(() => window.HOAPI && !document.querySelector('#titlescreen').classList.contains('loading'), null, { timeout: 30000 });
  await sleep(300);
  const step = (s) => page.evaluate((x) => { window.__scan(); window.__step = x; }, s);
  const tidy = () => page.evaluate(() => { const a = HOAPI; try { a.closeModal(); } catch (e) {} try { a.closeScreen && a.closeScreen(); } catch (e) {} document.querySelectorAll('.scrim').forEach(s => s.remove()); });
  const tryIn = async (name, code, wait = 150) => {
    await step(name);
    try { await page.evaluate(code); } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); }
    await sleep(wait); await page.evaluate(() => window.__scan()); await tidy();
  };

  await step('title screen');
  await page.evaluate(() => HOAPI.newGameDialog());
  await page.waitForSelector('form.newgame');
  const chosen = await page.evaluate(([r, s]) => {
    const f = document.querySelector('form.newgame'), set = (n, v) => { const e = f.querySelector(`select[name=${n}]`); if (e && [...e.options].some(o => o.value === v)) { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); return true; } return false; };
    return { rules: set('rules', r), skin: set('skin', s) };
  }, [RULES, SKIN]);
  if (!chosen.rules) errors.push(`New Game doesn't offer the ${RULES} rules`);
  await sleep(200);
  await page.evaluate(() => { const f = document.querySelector('form.newgame'); f.requestSubmit ? f.requestSubmit() : f.querySelector('button[type=submit]').click(); });
  await page.waitForFunction(() => HOAPI.G, null, { timeout: 15000 });
  await sleep(500); await tidy();
  const info = await page.evaluate(() => ({ rules: HOAPI.G.rules, skin: window.HOSKINS && HOSKINS.current }));

  // the map, at a few zooms
  await tryIn('map', () => { const a = HOAPI; const m = a.map(); a.draw(); a.zoomAt(m.w / 2, m.h / 2, 0.4); a.draw(); a.zoomAt(m.w / 2, m.h / 2, 6); a.draw(); a.fit(); });

  // play: the human's colonies and ships are left to the computers' rules
  await tryIn('played turns', () => {
    const a = HOAPI, G = a.G;
    window.__all = [];
    for (let t = 0; t < 150 && !G.over; t++) { HO.endTurn(G); window.__all.push(...(G.players[a.ME].inbox || [])); }
    a.draw();
    window.__info = { turn: G.turn, year: G.year, battles: (G.battles || []).length, over: G.over };
  }, 300);

  // every planet state on the map: each star in turn as yours, a computer's,
  // an ally's, unknown, turning red and gone nova
  await tryIn('map: planet states', () => {
    const a = HOAPI, G = a.G, ME = a.ME, me = G.players[ME];
    const other = G.players.find(p => p.id !== ME);
    G.opts = G.opts || {};
    // allies with everyone, best buddies with the last player, so both halos show
    const others = G.players.filter(p => p.id !== ME), bud = others[others.length - 1];
    for (const o of others) { (me.allies = me.allies || []).includes(o.id) || me.allies.push(o.id); (o.allies = o.allies || []).includes(ME) || o.allies.push(ME); }
    if (bud && bud !== other) { (me.buddies = me.buddies || []).push(bud.id); (bud.buddies = bud.buddies || []).push(ME); }
    const saved = G.stars.map(s => ({ owner: s.owner, nova: s.nova }));
    const K = (s) => HO.know(G, me, s.id);
    const savedK = G.stars.map(s => Object.assign({}, K(s)));
    const states = [s => { s.owner = ME; }, s => { if (other) { s.owner = other.id; K(s).owner = other.id; } }, s => { if (bud) { s.owner = bud.id; K(s).owner = bud.id; } }, s => { s.owner = -1; K(s).owner = -1; },
      s => { s.nova = K(s).nova = 40; }, s => { s.nova = K(s).nova = 150; }, s => { s.nova = K(s).nova = G.year + 5; }, s => { s.nova = K(s).nova = 250; }];
    for (const f of states) { G.stars.forEach((s, i) => { if (i % 3 === 0) { K(s).explored = true; f(s); } }); a.draw(); window.__scan(); for (const s of G.stars.filter((s, i) => i % 3 === 0).slice(0, 25)) { a.UI.sel = s.id; a.renderPanel(); window.__scan(); } }
    G.stars.forEach((s, i) => { Object.assign(s, saved[i]); Object.assign(K(s), savedK[i]); });
    a.UI.sel = null;
    a.draw();
  });

  // every ship type over a spread of tech, as yours and someone else's, new and rusty
  await tryIn('ship pictures', () => {
    const a = HOAPI, G = a.G;
    const types = ['scout', 'fighter', 'colony', 'satellite', 'dread', 'tanker', 'bio', 'decoy'];
    const Ws = [1, 3, 5, 6, 8, 9, 12, 13, 15, 16, 20, 31, 35], Ss = [1, 3, 5, 10, 12, 15, 20], Rs = [3, 9, 10, 12, 13];
    const owners = [a.ME, G.players.findIndex(p => p.id !== a.ME)];
    const box = document.body.appendChild(document.createElement('div')); box.style.display = 'none';
    const show = (c) => { if (c && c.tagName === 'CANVAS') { const k = c.cloneNode(); k.__src = c.__src; box.append(k); } };
    for (const type of types) { window.__step = 'ship pictures: ' + type; for (const W of Ws) for (const S of Ss) for (const R of Rs) for (const o of owners) {
      show(a.shipPic({ type, R, V: 6, W, S, M: 2 }, o));
      if (W < 4 && S < 4) { const p = G.players[o]; const t = p.tech; p.tech = Object.assign({}, t, { weapons: 30, shields: 30 }); show(a.shipPic({ type, R, V: 4, W, S, M: 1 }, o)); p.tech = t; }
    }
      window.__scan(); box.innerHTML = ''; }
    box.remove();
  });

  // every 5.0.5 report template, then the rank pictures, then the played game's real reports
  const reports = await page.evaluate(() => (HO.DATA.reports || []).length);
  await step('reports: 5.0.5 templates');
  await page.evaluate(() => {
    const a = HOAPI, G = a.G, me = G.players[a.ME], other = G.players.find(p => p.id !== a.ME) || me, star = G.stars[0];
    let names = [other.name, star.name, '12', '3', me.name];
    const fill = (t) => { let i = 0; return t.replace(/%(?:\.\*|\d*\.?\d*)?[sd]|%%/g, (x) => x === '%%' ? '%' : x.endsWith('d') ? String(10 + i++) : names[i++ % names.length]); };
    // each with what the game's own report would carry: its star, its battle, chat
    const bid = (G.battles || []).length ? G.battles[G.battles.length - 1].id : undefined;
    a.UI.inbox = (HO.DATA.reports || []).map((t) => {
      const text = fill(t), m = { text, star: star.id, icon: 'bad' + (other.face || 0) + '_0' };
      if (/ says|^You told|^You said|^Your message to/.test(t)) m.chat = true;
      if (/won a battle|lost a battle|survived an attack|destroyed your colony at/.test(t) && bid != null) m.battle = bid;
      if (/^You have explored/.test(t)) m.explore = 'good';
      return m;
    });
    a.UI.msgIdx = 0; a.UI.modal = null;
  });
  const icons = [];
  for (let i = 0; i < reports; i++) {
    icons.push(await page.evaluate((i) => { const a = HOAPI; a.UI.msgIdx = i; try { a.renderMsg(); } catch (e) {} window.__scan(); try { a.closeModal(); } catch (e) {}
      const im = document.querySelector('#msg .card img'), m = a.UI.inbox[i];
      return { report: 1000 + i, text: m.text.slice(0, 90), picture: im ? (im.src.startsWith('data:') ? 'data:' : im.src.replace(/^.*?(assets\/)/, '$1')) : null };
    }, i));
  }
  await step('reports: rank pictures');
  await page.evaluate(() => { const a = HOAPI; a.UI.inbox = a.A.jpg.map((_, i) => ({ text: 'Rank', jpg: i })); for (let i = 0; i < a.UI.inbox.length; i++) { a.UI.msgIdx = i; a.renderMsg(); window.__scan(); } });
  await step('reports: played game');
  const played = await page.evaluate(() => {
    const a = HOAPI, G = a.G; const all = []; all.push(...(window.__all || []));
    a.UI.inbox = all.slice(-3000); const out = {};
    for (let i = 0; i < a.UI.inbox.length; i++) {
      a.UI.msgIdx = i; try { a.renderMsg(); } catch (e) {} window.__scan();
      const im = document.querySelector('#msg .card img'), m = a.UI.inbox[i], text = String(m.text || '');
      const key = text.replace(/\d[\d,.]*/g, '#').slice(0, 70);
      if (!out[key]) out[key] = { text: text.slice(0, 110), picture: im ? (im.src.startsWith('data:') ? 'data:' : im.src.replace(/^.*?(assets\/)/, '$1')) : null, n: 0 };
      out[key].n++;
      try { a.closeModal(); } catch (e) {}
    }
    a.UI.inbox = []; a.UI.msgIdx = 0; a.renderMsg();
    return Object.values(out);
  });
  await tidy();

  // a battle replay, left to run
  // (the three biggest battles, a few seconds each, so some ships die)
  const bids = await page.evaluate(() => (HOAPI.G.battles || []).slice().sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length).slice(0, 3).map(b => b.id));
  for (const id of bids) { await step('battle replay'); await page.evaluate((id) => HOAPI.openBattle(id), id); await sleep(7000); await page.evaluate(() => window.__scan()); await tidy(); }
  if (!bids.length) errors.push('no battle was fought, so the battle replay wasn\'t seen');

  // the windows
  for (const [name, code] of [
    ['Players', 'api.openPlayers()'], ['Ranks', 'api.openRanks()'], ['Master List', 'api.hasHall(api.G) && HO.rules(api.G).hall.master !== false && api.openMasterList()'],
    ['Build Ships', 'api.openBuild(api.me().homeStar)'], ['Fleets', 'api.openFleetList()'], ['Stars', 'api.openStarList()'], ['About', 'api.openAbout()'],
    ['You Won', 'api.openYouWon(() => {})'], ['You Lost', 'api.openYouLost(() => {})'], ['Hall', 'api.hasHall(api.G) && api.openHall(\'fame\')'],
  ]) await tryIn(name, `(${(c) => new Function('api', 'return ' + c)(HOAPI)})(${JSON.stringify(code)})`, 250);

  // the game-over card
  await tryIn('game over', () => { const a = HOAPI, G = a.G; for (const w of [a.ME, -1]) { G.over = true; G.winner = w; a.UI.inbox = []; a.UI.msgIdx = 0; a.renderMsg(); window.__scan(); } });

  const seen = await page.evaluate(() => window.__seen);
  info.played = await page.evaluate(() => window.__info);
  await browser.close();
  return { seen, errors, info, icons, played };
}

(async () => {
  let port = +opt('port', 0), server = null;
  if (!port) {
    // (a random free-looking port, so runs side by side don't share one)
    for (let tries = 0; tries < 20; tries++) { port = 8880 + Math.floor(Math.random() * 1000); if (!(await up(port))) break; }
    server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !(await up(port)); i++) await sleep(100);
  }
  let res;
  try { res = await run(`http://127.0.0.1:${port}/index.html`); } finally { if (server) try { process.kill(server.pid); } catch (e) {} }
  const { seen, errors, info, icons, played } = res;
  const classic = (k) => /^assets\/(sprites|explore)\//.test(k);
  const holes = Object.keys(seen).filter(classic).sort();
  const own = Object.keys(seen).filter(k => !classic(k)).length;
  console.log(`${SKIN} skin, ${info.rules} rules: ${own} of its own pictures drawn, ${holes.length} classic pictures borrowed`);
  if (info.played) console.log(`  (played to year ${info.played.year}, turn ${info.played.turn}: ${info.played.battles} battles${info.played.over ? ', game over' : ''})`);
  for (const k of holes) console.log(`  ${k.replace(/^assets\/sprites\/|\.png$/g, '')}  (${Object.keys(seen[k]).join('; ')})`);
  const byPic = {};
  for (const r of icons) (byPic[r.picture || '(none)'] = byPic[r.picture || '(none)'] || []).push(r.report);
  const top = Object.entries(byPic).sort((a, b) => b[1].length - a[1].length)[0];
  if (top) console.log(`  ${icons.length} 5.0.5 report templates; the most shared picture, ${top[0].replace(/^assets\/(skins\/\w+\/)?(sprites\/)?/, '')}, goes with ${top[1].length} of them (see --json for each report's picture)`);
  for (const e of errors) console.log('  ! ' + e);
  if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify({ skin: SKIN, rules: info.rules, holes: Object.fromEntries(holes.map(k => [k, Object.keys(seen[k])])), reports: icons, played, errors }, null, 1));
  process.exit(holes.length && SKIN !== 'classic' ? 1 : 0);
})();
