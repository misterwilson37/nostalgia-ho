#!/usr/bin/env node
// Does "Modern conveniences" change a game the player WINS, with fighting? Plays the same game three times and compares them turn by turn.
//   NODE_PATH=$(npm root -g) node tools/skin-modern-win-compare.js [ruleset, original] [seed, 8] [max turns, 90]
// The game: the smallest and densest galaxy (5.0.5: size 0, density 0, hex shape: 19 stars, each 4 from its neighbours, within a fleet's range of 6), ONE computer
// player at the dumbest level (strength 50), my start Abundant and theirs an Outpost. The seed is exactly the one given (the seed the game draws is made to be it);
// tools/skin-find-galaxy.js finds seeds where the two sides are connected within a fleet's range. A scripted player (BOT below) decides everything from the game's
// state, so the same game gets the same orders: it researches weapons and shields, builds a fighter design, settles stepping-stone stars toward the enemy by a path
// search when it must, and sends a wave only when it has 30 ships and twice the enemy's. "Review Announced Battles" is on, so the battle is DISPLAYED: Modern on gives
// the written battle with its speed menu; off, the skin's own battle window. After every turn the whole game is fingerprinted (each player's planets, money, metal,
// ships, tech; battles; captures). Runs: A (Modern on), B (on again), C (off). Exit 1 if A differs from B (the game does not repeat) or from C (the setting changes
// the game), or if the player did not win. Seed 8 wins at turn 9 (one battle, one capture); both battle windows and the win screen are saved to the temp folder.
const { chromium } = require('playwright'); const { spawn, spawnSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const rules = process.argv[3] || 'original', MOD = process.argv[4] !== 'off', TAG = process.argv[5] || 'w', MAXT = +(process.argv[6] || 90);
const BOT = () => { // everything it decides comes from the game's state: the same game, the same orders
  const a = HOAPI, g = a.G, ME = a.ME, p = a.me(), q = HO.feature(g, 'buildQueue'), out = [];
  const mine = g.stars.filter(s => s.owner === ME), foes = g.stars.filter(s => s.owner >= 0 && s.owner !== ME && g.players[s.owner].alive);
  if (!mine.length || !foes.length) return 'idle';
  const d2 = (x, y) => HO.starDist(g, x, y), buy = (sid, did, n) => { for (let k = n; k >= 1; k--) { try { const r = q ? HO.queueShips(g, ME, sid, did, k) : HO.buildShips(g, ME, sid, did, k); if (r) return k; } catch (e) {} } return 0; };
  const cnt = (f) => Object.values(f.ships).reduce((x, y) => x + y, 0), idle = (f) => f.owner === ME && f.star != null && f.to == null && !f.dest;
  let best = null; for (const m of mine) for (const f of foes) { const d = d2(m.id, f.id); if (!best || d < best.d || (d === best.d && m.id < best.m.id)) best = { m, f, d }; }
  const T = best.f, R = (() => { const f = g.fleets.find(f => f.owner === ME && f.star != null); return f ? HO.fleetMaxRange(g, f) : 6; })();
  let fd = null;
  p.talloc = Object.assign({}, p.talloc, { range: 0.1, speed: 0, weapons: 0.5, shields: 0.4, mini: 0 }); // research: what wins fights
  fd = p.designs.find(x => x.name === 'Warbot' && !x.scrapped && x.W >= HO.designLimits(g, p, 'fighter').W && x.S >= HO.designLimits(g, p, 'fighter').S);
  if (!fd) { const L = HO.designLimits(g, p, 'fighter'); fd = HO.findOrCreateDesign(g, p, { type: 'fighter', name: 'Warbot', R: Math.min(L.R, 6), V: HO.designMin(g, 'V', 'fighter'), W: L.W, S: L.S, M: HO.designMin(g, 'M', 'fighter') }); }
  const cd = p.designs.find(x => x.type === 'colony' && !x.scrapped);
  const fighters = g.fleets.filter(f => idle(f) && HO.fleetHas(g, f, 'fighter') && !HO.fleetHas(g, f, 'colony'));
  // 1. fighters: buy a few at the colony nearest them, bring the idle ones there, and when enough are there send them all
  const at = fighters.filter(f => f.star === best.m.id), n = at.reduce((s, f) => s + cnt(f), 0);
  out.push('buy ' + (n < 60 ? buy(best.m.id, fd.id, 6) : 0));
  for (const f of fighters) if (f.star !== best.m.id) { try { HO.orderMove(g, f, best.m.id); } catch (e) {} }
  const enemyShips = g.fleets.filter(f => f.owner !== ME && g.players[f.owner].alive).reduce((s, f) => s + cnt(f), 0);
  let sent = 0; if (n >= 30 && n >= 2 * enemyShips && best.d <= R * 1.0001) for (const f of at) { try { if (HO.orderMove(g, f, T.id)) sent++; } catch (e) {} }
  out.push('at ' + n + ' vs ' + enemyShips + ' sent ' + sent + ' -> ' + T.name + ' d' + Math.round(best.d) + ' R' + R);
  // 2. stepping stones: a path of stars, each within range of the last, from my colonies to one within range of the target; settle the first star of it
  if (best.d > R) {
    const owned = new Set(mine.map(m => m.id)), depth = {}, prev = {}, queue = mine.map(m => m.id).sort((x, y) => x - y); for (const id of queue) { depth[id] = 0; prev[id] = null; }
    let goal = null; for (let i = 0; i < queue.length && goal === null; i++) { const u = queue[i]; for (const v of g.stars) { if (v.id in depth || (v.owner >= 0 && v.owner !== ME) || d2(u, v.id) > R) continue; depth[v.id] = depth[u] + 1; prev[v.id] = u; queue.push(v.id); if (d2(v.id, T.id) <= R) { goal = v.id; break; } } }
    if (goal === null) { const reached = Object.keys(depth).map(Number); const closest = reached.map(id => ({ id, d: d2(id, T.id) })).sort((x, y) => x.d - y.d)[0]; out.push('NO PATH within range ' + R + ' to ' + T.name + ': reached ' + reached.length + ' stars, closest ' + g.stars[closest.id].name + ' at ' + Math.round(closest.d) + '; mine ' + mine.map(m => m.name + (m.id)).join(',')); }
    else {
      let c = goal; while (prev[c] !== null && !owned.has(prev[c])) c = prev[c];
      const from = prev[c], cship = g.fleets.find(f => idle(f) && HO.fleetHas(g, f, 'colony')), flying = g.fleets.some(f => f.owner === ME && HO.fleetHas(g, f, 'colony') && (f.dest != null || f.to != null));
      if (cship) { let ok = false; try { ok = HO.orderMove(g, cship, c); } catch (e) {} out.push('colony ship -> ' + g.stars[c].name + ' ' + ok); }
      else if (!flying && cd) out.push('colony ship bought ' + buy(from, cd.id, 1) + ' at ' + g.stars[from].name + ' for ' + g.stars[c].name);
    }
  }
  return out.join('; ');
};

if (process.argv[2] !== '--play') {
  const rules0 = process.argv[2] || 'original', seed0 = process.argv[3] || '8', maxT0 = process.argv[4] || '90', OUT0 = path.join(os.tmpdir(), 'ho-modern-win-compare'); fs.mkdirSync(OUT0, { recursive: true });
  for (const [tag, mod] of [['A', 'on'], ['B', 'on'], ['C', 'off']]) { const r = spawnSync(process.execPath, [__filename, '--play', rules0, mod, tag, maxT0], { env: { ...process.env, OUT: OUT0, SEED: seed0, REVIEW: '1' }, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' }); if (r.stdout) process.stdout.write(r.stdout.split('\n').filter(l => /game:|ENDED|recorded/.test(l)).join('\n') + '\n'); }
  const L = {}; for (const t of 'ABC') { try { L[t] = JSON.parse(fs.readFileSync(path.join(OUT0, `win-${t}.json`), 'utf8')); } catch (e) { L[t] = null; } }
  if (!L.A || !L.B || !L.C) { console.log('a run did not finish'); process.exit(1); }
  const strip = (r) => { const { seq, ...rest } = r; return JSON.stringify(rest); };
  const diff = (x, y) => { const d = []; for (let i = 0; i < Math.min(x.rows.length, y.rows.length); i++) if (strip(x.rows[i]) !== strip(y.rows[i])) d.push(i); if (x.rows.length !== y.rows.length) d.push('length'); return d; };
  const ab = diff(L.A, L.B), ac = diff(L.A, L.C), won = L.A.rows[L.A.rows.length - 1].winner === 0 && L.A.rows[L.A.rows.length - 1].over;
  console.log(`${rules0} seed ${seed0}: ${L.A.rows.length - 1} turns, ${won ? 'WON' : 'NOT WON'}; A vs B (Modern on twice): ${ab.length ? 'DIFFER at ' + ab[0] : 'identical every turn'}; A vs C (on vs off): ${ac.length ? 'DIFFER at ' + ac[0] : 'identical every turn'}; the scripted player's decisions ${JSON.stringify(L.A.botlog) === JSON.stringify(L.C.botlog) ? 'identical' : 'DIFFERENT'}`);
  const bad = ab.length || ac.length || !won; console.log(bad ? '\nPROBLEM' : '\nModern conveniences does not change a game that is won'); process.exit(bad ? 1 : 0);
}
const OUT = process.env.OUT || path.join(os.tmpdir(), 'ho-modern-win-compare');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 200)); });
  await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
  await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
  const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
  const setSel = async (n, v) => { const el = form.locator(`select[name=${n}]`); if (await el.count()) await el.selectOption(v).catch(() => {}); };
  const setRange = async (n, v) => { await page.evaluate(([n, v]) => { const e = document.querySelector(`form.newgame input[name=${n}]`); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } }, [n, String(v)]); };
  await sleep(300); await setSel('computers', process.env.COMP || '1');
  // the smallest, densest galaxy, one computer player at the dumbest level, my start abundant and theirs an outpost
  if (rules === 'original' || rules === 'palm') { await setRange('o_size', 0); await setRange('o_iq', 50); await setRange('o_density', 0); await setSel('start', 'abundant'); await setSel('o_cstart', 'outpost'); await setSel('o_shape', 'hex'); }
  else { const pre = rules === '301' ? 'm_' : rules === '405' ? 'w_' : 'd_'; await setSel(pre + 'iq', 'dumb'); await setSel(pre + 'size', 'small'); await setSel(pre + 'density', 'dense'); await setSel(pre + 'skill', 'expert'); await setSel(pre + 'shape', 'hex'); }
  const mc = form.locator('input[name=modern]'); if (await mc.count()) { if (MOD) await mc.check().catch(() => {}); else await mc.uncheck().catch(() => {}); }
  await page.evaluate((sd) => { window.__R = Math.random; Math.random = () => (sd + 0.5) / 2147483648; }, +(process.env.SEED || 138)); // the seed the game draws is exactly this one
  await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(500);
  await page.evaluate(() => { Math.random = window.__R; });
  if (process.env.REVIEW) await page.evaluate(() => { HOAPI.Prefs.review = true; });
  const head = await page.evaluate(() => { const g = HOAPI.G; return { seed: g.opts.seed, modern: !!g.opts.modern, stars: g.stars.length, players: g.players.length, rules: g.rules }; });
  console.log(TAG, 'game:', JSON.stringify(head));
  const click = () => page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .win button')].filter(x => !x.classList.contains('close') && !x.disabled); const x = bs.find(y => /^Not now/i.test(y.textContent.trim())) || [...bs].reverse().find(y => /^(OK|Yes|Continue|Done|Close)/i.test(y.textContent.trim())) || bs[0]; if (x) x.click(); else { const s = document.querySelector('.scrim'); s && s.remove(); } });
  const drain = async () => { for (let n = 0; n < 60 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await click(); await sleep(100); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(30); } };
  const digest = () => page.evaluate(() => { const g = HOAPI.G; return { turn: g.turn, year: g.year, over: !!g.over, winner: g.winner, p: g.players.map(p => [p.alive ? 1 : 0, g.stars.filter(s => s.owner === p.id).length, Math.round(p.savings), Math.round(p.metal), g.fleets.filter(f => f.owner === p.id).reduce((n, f) => n + Object.values(f.ships).reduce((x, y) => x + y, 0), 0), Object.values(p.tech).join('')].join(':')), battles: (g.stat || {}).battles || 0, captures: (g.stat || {}).captures || 0 }; });
  await drain(); const rows = [await digest()]; let end = null; const botlog = [];
  for (let t = 1; t <= MAXT; t++) {
    const bl = await page.evaluate(BOT); botlog.push(bl);
    await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(700);
    const seq = [];
    for (let k = 0; k < 50; k++) {
      const st = await page.evaluate(() => { const w = document.querySelector('.scrim .win'); if (w) return { kind: 'window', text: w.textContent.replace(/\s+/g, ' ').slice(0, 70) }; const e = document.querySelector('#msg .card.end'); if (e) return { kind: 'end', text: e.textContent.replace(/\s+/g, ' ').slice(0, 90) }; if (document.querySelector('#msg .card:not(.waiting)')) return { kind: 'card' }; return { kind: 'nothing' }; });
      if (st.kind === 'end') { end = st.text; seq.push('END CARD: ' + st.text); break; }
      if (st.kind === 'nothing') break;
      if (st.kind === 'window') { seq.push('window: ' + st.text); await page.screenshot({ path: `${OUT}/win-${TAG}-turn${t}-${seq.length}.png` }).catch(() => {}); await click(); await sleep(400); }
      else { await page.locator('#msg .card').first().click().catch(() => {}); await sleep(50); }
    }
    const d = await digest(); d.seq = seq; rows.push(d);
    if (t % 10 === 0 || seq.length) console.log(TAG, 'turn', t, 'year', d.year, 'alive', d.p.map(x => x[0]).join(''), 'stars', d.p.map(x => x.split(':')[1]).join('/'), 'ships', d.p.map(x => x.split(':')[4]).join('/'), 'battles', d.battles, 'captures', d.captures, '| bot:', bl.slice(0, 330), seq.length ? '| ' + seq.join(' > ') : '');
    if (end || d.over) { console.log(TAG, 'ENDED at turn', t, 'year', d.year, 'winner', d.winner, '|', end); await page.screenshot({ path: `${OUT}/win-${TAG}-final.png` }); break; }
  }
  fs.writeFileSync(`${OUT}/win-${TAG}.json`, JSON.stringify({ head, rows, end, botlog }));
  console.log(TAG, 'turns recorded:', rows.length - 1, errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 3)) : 'no page errors');
  await b.close(); srv.kill();
})();
