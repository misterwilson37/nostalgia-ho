#!/usr/bin/env node
// The online parts through a skin, against a FAKE Firebase (tools/online-fake.js: in memory, no rules) because the real emulators (docs/online.md, "Testing") are
// downloaded from Google's servers on first use and may not be reachable. tools/online-test.js is the full test, against the emulators, written for the classic skin's page;
// this uses only the controls every skin shares (the title's Sign in, New Game > Play online..., the lobby, the clock, the Auto-play menu item, window.HOONLINE_VIEW).
//   NODE_PATH=$(npm root -g) node tools/skin-online-check.js [skin, mac12] [which: saves,two,three]
//   saves: a guest signs in from the title, a game's End Turn uploads it, Account saves lists it (Open, Download, Delete)
//   two:   2 players, 4.0.5, 9 turns, a page reloaded in the middle of a turn (Continue opens the game again)
//   three: 3 players, 5.0.5, 8 turns, one player sits a turn out (the host's "End turn for...") and one resigns; battles are fought
// After every turn every browser's game state (HOONLINE.digest) must be the same, and each turn's orders must give the page's own game. Exit 1 on a problem.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));

const path = require('path'), os = require('os'), { spawnSync } = require('child_process');
if (process.argv[2] !== '--run') {
  const skin0 = process.argv[2] || 'mac12', which = (process.argv[3] || 'saves,two,three').split(','); let bad = 0;
  const SC = { saves: { MODE: 'saves' }, two: { MODE: 'play', SEATS: '2', RELOAD: '3', COMP: '2', RULES: '405', TURNS: '9' }, three: { MODE: 'play', SEATS: '3', SKIP: '2', RESIGN: '5', COMP: '1', RULES: 'original', TURNS: '8' } };
  for (const w of which) { const r = spawnSync(process.execPath, [__filename, '--run', skin0], { env: { ...process.env, ...SC[w] }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }); process.stdout.write(r.stdout || ''); if (r.status !== 0 || /PROBLEM|ERRORS/.test(r.stdout || '')) bad++; }
  console.log(bad ? `\n${bad} scenario(s) with a problem` : '\nno problems'); process.exit(bad ? 1 : 0);
}
const OUT = process.env.OUT || os.tmpdir();
const fake = require('./online-fake.js');
const SKIN0 = process.argv[3] || 'mac12';
if (process.env.MODE === 'saves') { process.argv[2] = SKIN0; process.argv[3] = 'original'; }

const runPlay = () => {
const SKIN = SKIN0, RULES = process.env.RULES || 'original', TURNS = +(process.env.TURNS || 5), SEATS = +(process.env.SEATS || 2), RELOAD = process.env.RELOAD != null ? +process.env.RELOAD : -1, SKIP = process.env.SKIP != null ? +process.env.SKIP : -1, RESIGN = process.env.RESIGN != null ? +process.env.RESIGN : -1;
return (async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const server = fake.create(); const P = []; const errs = [];
  const view = (pg) => pg.evaluate(() => window.HOONLINE_VIEW && window.HOONLINE_VIEW());
  const waitFor = async (fn, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await fn(); if (r) return r; await sleep(200); } return null; };
  for (let i = 0; i < SEATS; i++) {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } }); await fake.install(ctx, server);
    const pg = await ctx.newPage(); pg.on('dialog', d => d.accept()); pg.setDefaultTimeout(15000);
    pg.on('pageerror', e => errs.push('P' + (i + 1) + ' ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push('P' + (i + 1) + ' ' + m.text().replace(/\s+/g, ' ').slice(0, 160)); });
    P.push({ ctx, pg });
  }
  const log = [];
  // each player: a guest account
  for (const [i, { pg }] of P.entries()) { await pg.goto(`http://localhost:8000/?skin=${SKIN}`); await pg.waitForSelector('#tnew', { state: 'visible' }); await pg.click('#tacct'); await pg.waitForSelector('.cloudform'); await pg.click('.cloudform button:text-is("Play as a guest")'); await sleep(1200); await pg.keyboard.press('Escape'); await sleep(200); }
  const host = P[0].pg;
  // New Game, Play online…
  await host.click('#tnew'); const form = host.locator('form.newgame'); await form.waitFor();
  await form.locator('select[name=rules]').selectOption(RULES); await form.locator('input[name=name]').fill('Host');
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
  await form.locator('select[name=computers]').selectOption(process.env.COMP || '1').catch(() => {});
  if (RULES === 'original') await host.evaluate(() => { const e = document.querySelector('form.newgame input[name=o_size]'); if (e) { e.value = '0'; e.dispatchEvent(new Event('input', { bubbles: true })); } });
  await form.locator('select[name=humans]').selectOption(String(SEATS));
  await host.click('form.newgame button:text-is("Play online…")');
  await host.waitForSelector('.lobby .lobbycode .code', { timeout: 20000 });
  const code = (await host.textContent('.lobby .lobbycode .code')).trim(); log.push('lobby code: ' + code + ' ' + (/^[A-Z0-9]{6}$/.test(code) ? 'ok' : 'BAD'));
  await host.screenshot({ path: `${OUT}/OLP-${SKIN}-lobby-host.png` });
  for (let i = 1; i < SEATS; i++) {
    const pg = P[i].pg; await pg.goto(`http://localhost:8000/?skin=${SKIN}&join=${code}`);
    await pg.waitForSelector('form.newgame input[name=code]', { timeout: 20000 }); await pg.fill('form.newgame input[name=name]', 'Player' + (i + 1));
    await pg.screenshot({ path: `${OUT}/OLP-${SKIN}-join.png` });
    await pg.click('form.newgame button:text-is("Join")'); await pg.waitForSelector('.lobby .lobbylist', { timeout: 20000 });
  }
  const n = await waitFor(async () => (await host.$$('.lobby .lobbylist li:not(.sub)')).length === SEATS ? 1 : 0); log.push('the host lobby lists everyone: ' + (n ? 'yes' : 'NO'));
  await host.screenshot({ path: `${OUT}/OLP-${SKIN}-lobby-full.png` });
  await host.click('.lobby button:text-is("Start the game")');
  for (const x of P) await waitFor(() => view(x.pg).then(v => v && v.status === 'playing' && v.turn === 0), 25000);
  const v0 = await Promise.all(P.map(x => view(x.pg))); log.push('started: ' + JSON.stringify(v0.map(v => v && { turn: v.turn, seat: v.seat, d: (v.digest || '').slice(0, 8) })));
  const readReports = async (pg) => { for (let i = 0; i < 120; i++) { if (await pg.$('.scrim')) { const ok = await pg.$('.scrim .win button:text-is("OK")'); if (ok) await ok.click().catch(() => null); else await pg.keyboard.press('Escape'); continue; } if (await pg.$('#msg .clock') || await pg.$('#msg .card.waiting') || await pg.$('#msg .card.end')) return; const c = await pg.$('#msg .card:not(.end):not(.waiting)'); if (c) await c.click().catch(() => null); else await sleep(80); } };
  const autoPlay = (pg) => pg.evaluate(async () => { for (const m of document.querySelectorAll('#menubar .mbtn')) { m.click(); await new Promise(r => setTimeout(r, 60)); const x = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(e => /^Auto-play this turn/i.test(e.textContent)); if (x && !x.disabled) { x.click(); return true; } document.body.click(); } return false; });
  const menuClick = (pg, re) => pg.evaluate(async (src) => { const r = new RegExp(src, 'i'); for (const m of document.querySelectorAll('#menubar .mbtn')) { m.click(); await new Promise(r2 => setTimeout(r2, 60)); const x = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(e => r.test(e.textContent)); if (x && !x.disabled) { x.click(); return true; } document.body.click(); } return false; }, re);
  let bad = 0;
  for (let t = 0; t < TURNS; t++) {
    const sitOut = SKIP === t ? SEATS - 1 : -1;
    for (const [i, { pg }] of P.entries()) {
      if (i === sitOut) continue;
      if (RESIGN === t && i === SEATS - 1) { await readReports(pg); const okm = await menuClick(pg, '^Online game'); if (okm) { await pg.click('.scrim button:text-is("Resign…")'); await pg.click('.win.alert button:text-is("OK"), .win button:text-is("OK")'); log.push(`turn ${t}: P${i + 1} resigned`); } else log.push('NO Online game… item to resign'); await sleep(800); continue; }
      if (RELOAD === t && i === 1) { await readReports(pg); await sleep(300); await pg.reload(); await pg.waitForSelector('#tcont:not([hidden])', { timeout: 30000 }); await pg.click('#tcont'); const back = await waitFor(() => view(pg).then(v => (v && v.turn === t && v.status === 'playing' ? v : null)), 20000); log.push(`turn ${t}: P2 reloaded the page in the middle of the turn and Continue ${back ? 'opened the game again' : 'DID NOT'}`); if (!back) bad++; }
      await readReports(pg); if (await pg.$('#msg .card.waiting') || await pg.$('#msg .card.end')) continue; if (t % 2 === 0 || !(await pg.$('#msg .clock'))) { const ok = await autoPlay(pg); if (!ok) log.push('P' + (i + 1) + ': NO Auto-play item'); } else await pg.click('#msg .clock'); await waitFor(() => pg.$('#msg .card.waiting, #msg .card.end'), 12000); }
    if (sitOut >= 0) { const w = await waitFor(() => view(host).then(v => v.waiting && v.waiting.length === 1 ? v : null), 10000); log.push(`turn ${t}: the turn waits for ${w && w.waiting}; the host's "End turn for…"`); await host.click('#msg .card.waiting button:text-is("End turn for…")'); await host.click('.scrim button:text-is("End their turn")'); }
    const ok = await waitFor(async () => { const vs = await Promise.all(P.map(x => view(x.pg))); return vs.every(v => v && v.turn === t + 1) ? vs : null; }, 60000);
    if (!ok) { log.push(`turn ${t}: NOT PLAYED in every browser: ` + JSON.stringify(await Promise.all(P.map(x => view(x.pg).then(v => v && { turn: v.turn, waiting: v.waiting }))))); bad++; break; }
    const same = ok.every(v => v.digest === ok[0].digest); if (!same) bad++;
    log.push(`turn ${t}: ${same ? 'same state in every browser' : 'DIFFERENT STATES'} (${ok.map(v => v.digest.slice(0, 8)).join(' ')}) year ${ok[0].year} battles ${ok[0].battles}`);
  }
  const vs = await Promise.all(P.map(x => view(x.pg)));
  log.push('every turn\'s orders gave the page\'s own game: ' + (vs.flatMap(v => v.self).every(s => s.ok || s.news) ? 'yes' : 'NO'));
  await host.screenshot({ path: `${OUT}/OLP-${SKIN}-playing.png` });
  // My online games
  const res = await host.evaluate(async () => { document.querySelectorAll('.scrim').forEach(x => x.remove()); for (const m of document.querySelectorAll('#menubar .mbtn')) { m.click(); await new Promise(r => setTimeout(r, 60)); const x = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(e => /^Account…/i.test(e.textContent)); if (x) { x.click(); return true; } document.body.click(); } return false; });
  if (res) { await sleep(800); const g = host.locator('.scrim button:text-is("My online games…")'); if (await g.count()) { await g.click(); await sleep(1500); log.push('My online games: ' + JSON.stringify(await host.evaluate(() => { const w = document.querySelector('.scrim .win'); return w ? w.textContent.replace(/\s+/g, ' ').slice(0, 140) : 'no window'; }))); await host.screenshot({ path: `${OUT}/OLP-${SKIN}-mygames.png` }); } else log.push('no My online games button'); }
  console.log(`== ${SKIN} / ${RULES} / ${SEATS} players / ${TURNS} turns\n  ` + log.join('\n  '), errs.length ? '\n  ERRORS ' + JSON.stringify(errs.slice(0, 4)) : '\n  no page errors', bad ? `\n  ${bad} PROBLEM(S)` : '\n  ok');
  for (const x of P) await x.ctx.close(); await b.close(); srv.kill();
})();

};
const runSaves = () => {
const SKINS = [SKIN0], RULES = 'original';
return (async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch();
  for (const skin of SKINS) {
    const server = fake.create(); const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } }); await fake.install(ctx, server);
    const page = await ctx.newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(10000);
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 200)); });
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } } catch (e) {} });
    const out = [];
    await page.goto(`http://localhost:8000/?skin=${skin}`); await page.waitForSelector('#tnew', { state: 'visible' });
    await page.click('#tacct'); await page.waitForSelector('.cloudform', { timeout: 15000 });
    await page.click('.cloudform button:text-is("Play as a guest")'); await sleep(1500);
    out.push('after Play as a guest: ' + JSON.stringify(await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w ? w.textContent.replace(/\s+/g, ' ').slice(0, 150) : 'no window'; })));
    await page.keyboard.press('Escape'); await sleep(300);
    out.push('title account button: ' + JSON.stringify(await page.evaluate(() => (document.querySelector('#tacct') || {}).textContent)));
    await page.click('#tnew'); const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(RULES);
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(skin); }
    await form.locator('select[name=computers]').selectOption('2').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(800);
    for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
    await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(2500);
    out.push('docs in the fake server after one End Turn: ' + JSON.stringify([...server.docs.keys()].slice(0, 6)));
    // Account saves, from the menu
    const items = await page.evaluate(async () => { const out = []; const btn = [...document.querySelectorAll('#menubar .mbtn')]; for (const m of btn) { m.click(); await new Promise(r => setTimeout(r, 50)); for (const x of document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')) if (/account saves/i.test(x.textContent)) { x.click(); return 'clicked in ' + m.textContent.trim(); } document.body.click(); } return 'not found'; });
    await sleep(1500);
    out.push('Account saves: ' + items + ' -> ' + JSON.stringify(await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w ? { cls: w.className.replace(/\bwin |mac12 /g, '').trim(), text: w.textContent.replace(/\s+/g, ' ').slice(0, 170), rows: document.querySelectorAll('.scrim .aclist li').length } : 'no window'; })));
    await page.screenshot({ path: `${OUT}/OL2-${skin}-accountsaves.png` });
    const listed = out.some(l => /^Account saves: .*"rows":[1-9]/.test(l)), signed = out.some(l => /^title account button: "Account: Guest"/.test(l)), uploaded = out.some(l => /^docs in the fake server after one End Turn: \["users\/.+\/saves\//.test(l));
    console.log(`== ${skin} / ${RULES}\n  ` + out.join('\n  '), errs.length ? '\n  ERRORS ' + JSON.stringify(errs.slice(0, 3)) : '\n  no page errors', (listed && signed && uploaded) ? '\n  ok' : `\n  PROBLEM: ${!signed ? 'the guest was not signed in; ' : ''}${!uploaded ? 'End Turn did not upload the game; ' : ''}${!listed ? 'Account saves did not list it' : ''}`);
    await ctx.close();
  }
  await b.close(); srv.kill();
})();

};
(process.env.MODE === 'saves' ? runSaves : runPlay)();
