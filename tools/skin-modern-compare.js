#!/usr/bin/env node
// Does "Modern conveniences" change the game? Plays the SAME game three times and compares them turn by turn.
//   NODE_PATH=$(npm root -g) node tools/skin-modern-compare.js [rulesets, 301] [max turns, 120]
// The galaxy is the same each time (the random sequence is fixed for the moment the game is made, so the seed is the same), the player passes every turn, and
// after every turn the whole game is fingerprinted: for each player, alive, planets, savings, metal, ships, tech levels, and the battle and capture counts.
// Runs: A (Modern on), B (Modern on again), C (Modern off). A = B proves the game repeats exactly, which is what makes A = C mean anything. The setting is a
// look-and-feel option (docs/12-findings.md, "Modern conveniences"): the engine, the rulesets and the computer players never read it, and this checks it.
// The game is small and the computers strong, so a passive player is eliminated and the game ENDS (the lose window and the end card are reached by playing).
// Not covered here: the automatic routes (a passive player gives no orders; see tools/skin-route-compare.js) and a game the player wins.
// Exit 1 if A differs from B (not repeatable: the test means nothing) or A from C (the setting changes the game).
const { chromium } = require('playwright'); const { spawn, spawnSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const rules = process.argv[3] || '301', MOD = process.argv[4] !== 'off', TAG = process.argv[5] || 'run', MAXT = +(process.argv[6] || 120);

// ---- the comparison: three child processes, then the fingerprints ----
if (process.argv[2] !== '--play') {
  const RULES0 = (process.argv[2] || '301').split(','), MAXT0 = process.argv[3] || '120', OUT0 = path.join(os.tmpdir(), 'ho-modern-compare'); fs.mkdirSync(OUT0, { recursive: true });
  let bad = 0;
  for (const rules0 of RULES0) {
    for (const [tag, mod] of [['A', 'on'], ['B', 'on'], ['C', 'off']]) { const r = spawnSync(process.execPath, [__filename, '--play', rules0, mod, `${rules0}-${tag}`, MAXT0], { env: { ...process.env, OUT: OUT0 }, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' }); if (r.stdout) process.stdout.write(r.stdout.split('\n').filter(l => /ENDED|game:|recorded/.test(l)).join('\n') + '\n'); }
    const L = {}; for (const t of 'ABC') { try { L[t] = JSON.parse(fs.readFileSync(path.join(OUT0, `modern-${rules0}-${t}.json`), 'utf8')); } catch (e) { L[t] = null; } }
    if (!L.A || !L.B || !L.C) { console.log(`${rules0}: a run did not finish`); bad++; continue; }
    const strip = (r) => { const { seq, ...rest } = r; return JSON.stringify(rest); };
    const diff = (x, y) => { const n = Math.min(x.rows.length, y.rows.length); const d = []; for (let i = 0; i < n; i++) if (strip(x.rows[i]) !== strip(y.rows[i])) d.push(i); if (x.rows.length !== y.rows.length) d.push('length'); return d; };
    const ab = diff(L.A, L.B), ac = diff(L.A, L.C);
    console.log(`${rules0}: ${L.A.rows.length - 1} turns; A vs B (Modern on twice): ${ab.length ? 'DIFFER at ' + ab[0] : 'identical every turn'}; A vs C (on vs off): ${ac.length ? 'DIFFER at ' + ac[0] : 'identical every turn'}; ended: ${L.A.end}`);
    if (ab.length || ac.length) bad++;
  }
  console.log(bad ? `\n${bad} PROBLEM(S)` : '\nModern conveniences does not change the game'); process.exit(bad ? 1 : 0);
}
const OUT = process.env.OUT || path.join(os.tmpdir(), 'ho-modern-compare');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 200)); });
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
  const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
  const set = async (n, v) => { const el = form.locator(`select[name=${n}]`); if (await el.count()) await el.selectOption(v).catch(() => {}); };
  await set('computers', '3'); await set('iq', 'diabolical'); await set('cstart', 'abundant'); await set('start', 'outpost'); await set('size', 'small'); await set('density', 'dense'); await set('shape', 'random'); await set('c_years', '50');
  const mc = form.locator('input[name=modern]'); if (await mc.count()) { if (MOD) await mc.check().catch(() => {}); else await mc.uncheck().catch(() => {}); }
  // the same galaxy every time: a fixed random sequence for the moment the game is made (the seed is drawn from Math.random)
  await page.evaluate(() => { window.__R = Math.random; let a = 424242; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(500);
  await page.evaluate(() => { Math.random = window.__R; });
  const head = await page.evaluate(() => { const g = HOAPI.G; return { seed: g.opts.seed, modern: !!g.opts.modern, years: g.opts.yearsPerTurn, stars: g.stars.length, players: g.players.length, galaxy: g.stars.slice(0, 5).map(s => Math.round(s.x) + ',' + Math.round(s.y)).join(' '), rules: g.rules }; });
  console.log(TAG, 'game:', JSON.stringify(head));
  const drain = async () => { for (let n = 0; n < 60 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .win button')].filter(x => !x.classList.contains('close') && !x.disabled); const x = bs.find(y => /^Not now/i.test(y.textContent.trim())) || [...bs].reverse().find(y => /^(OK|Yes|Continue|Done|Close)/i.test(y.textContent.trim())) || bs[0]; if (x) x.click(); else document.querySelector('.scrim').remove(); }); await sleep(120); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(30); } };
  const digest = () => page.evaluate(() => { const g = HOAPI.G; return { turn: g.turn, year: g.year, over: !!g.over, p: g.players.map(p => [p.alive ? 1 : 0, g.stars.filter(s => s.owner === p.id).length, Math.round(p.savings), Math.round(p.metal), g.fleets.filter(f => f.owner === p.id).reduce((n, f) => n + Object.values(f.ships).reduce((x, y) => x + y, 0), 0), Object.values(p.tech).join('')].join(':')), battles: (g.stat || {}).battles || 0, captures: (g.stat || {}).captures || 0 }; });
  await drain();
  const rows = [await digest()]; let end = null;
  for (let t = 1; t <= MAXT; t++) {
    await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(700);
    const seq = [];
    for (let k = 0; k < 40; k++) {
      const st = await page.evaluate(() => { const w = document.querySelector('.scrim .win'); if (w) return { kind: 'window', text: w.textContent.replace(/\s+/g, ' ').slice(0, 60) }; if (document.querySelector('#msg .card.end')) return { kind: 'end', text: document.querySelector('#msg .card.end').textContent.replace(/\s+/g, ' ').slice(0, 80) }; if (document.querySelector('#msg .card:not(.waiting)')) return { kind: 'card' }; return { kind: 'nothing' }; });
      if (st.kind === 'end') { end = st.text; seq.push('END CARD'); break; }
      if (st.kind === 'nothing') break;
      if (st.kind === 'window') { seq.push('window: ' + st.text); await page.screenshot({ path: `${OUT}/modern-${TAG}-window-${t}.png` }).catch(() => {}); await page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .win button')].filter(x => !x.classList.contains('close') && !x.disabled); const x = bs.find(y => /^Not now/i.test(y.textContent.trim())) || [...bs].reverse().find(y => /^(OK|Yes|Continue|Done|Close)/i.test(y.textContent.trim())) || bs[0]; if (x) x.click(); else document.querySelector('.scrim').remove(); }); await sleep(400); }
      else { await page.locator('#msg .card').first().click().catch(() => {}); await sleep(60); }
    }
    const d = await digest(); d.seq = seq; rows.push(d);
    if (end || d.over) { console.log(TAG, 'ENDED at turn', t, 'year', d.year, '|', end || '(over, no end card seen)'); await page.screenshot({ path: `${OUT}/modern-${TAG}-final.png` }); break; }
    if (t % 25 === 0) console.log(TAG, 'turn', t, 'year', d.year, 'alive', d.p.map(x => x[0]).join(''), 'stars', d.p.map(x => x.split(':')[1]).join('/'));
  }
  fs.writeFileSync(`${OUT}/modern-${TAG}.json`, JSON.stringify({ head, rows, end }));
  console.log(TAG, 'turns recorded:', rows.length - 1, errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 3)) : 'no page errors');
  await b.close(); srv.kill();
})();
