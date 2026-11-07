#!/usr/bin/env node
// Do "Modern conveniences" automatic routes change WHEN a fleet arrives?
//   NODE_PATH=$(npm root -g) node tools/skin-route-compare.js [rulesets, claude,gemini]
// The same galaxy twice (a fixed random sequence at the moment the game is made). A stepping-stone colony is settled, then a fleet is sent to a star too far to
// reach directly but reachable through that colony: with Modern conveniences ON by ONE order (the automatic route, `autoRoute` in js/skins/classic/ui.js); OFF the
// direct order is refused and each hop is ordered by hand, at once, when the fleet arrives. The turn it arrives must be the same. Only rulesets WITHOUT their own
// routing rule (`rs.route`: Claude and Gemini) have a difference to find: in every other ruleset the game routes the fleet itself, with or without the setting.
// Exit 1 if the arrival turns differ.
const { chromium } = require('playwright'); const { spawn, spawnSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const rules = process.argv[3] || 'claude', MOD = process.argv[4] !== 'off', TAG = process.argv[5] || 'r';

if (process.argv[2] !== '--play') {
  const RULES0 = (process.argv[2] || 'claude,gemini').split(','), OUT0 = path.join(os.tmpdir(), 'ho-route-compare'); fs.mkdirSync(OUT0, { recursive: true }); let bad = 0;
  for (const r0 of RULES0) {
    const res = {}; for (const mod of ['on', 'off']) { spawnSync(process.execPath, [__filename, '--play', r0, mod, `${r0}-${mod}`], { env: { ...process.env, OUT: OUT0 }, stdio: 'ignore' }); try { res[mod] = JSON.parse(fs.readFileSync(path.join(OUT0, `route-${r0}-${mod}.json`), 'utf8')); } catch (e) { res[mod] = null; } }
    if (!res.on || !res.off) { console.log(`${r0}: a run did not finish`); bad++; continue; }
    const same = res.on.arrived != null && res.on.arrived === res.off.arrived && res.on.head.seed === res.off.head.seed;
    console.log(`${r0}: automatic route (Modern on) arrives after ${res.on.arrived} turn(s); by hand (off) after ${res.off.arrived}; route through ${JSON.stringify(res.on.route)}${same ? '' : '  <- DIFFERENT'}`); if (!same) bad++;
  }
  console.log(bad ? `\n${bad} PROBLEM(S)` : '\nautomatic routes change nothing about when a fleet arrives'); process.exit(bad ? 1 : 0);
}
const OUT = process.env.OUT || path.join(os.tmpdir(), 'ho-route-compare');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
  await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
  const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
  for (const [n, v] of [['computers', '1'], ['size', 'small'], ['density', 'dense'], ['shape', 'random']]) { const el = form.locator(`select[name=${n}]`); if (await el.count()) await el.selectOption(v).catch(() => {}); }
  const mc = form.locator('input[name=modern]'); if (await mc.count()) { if (MOD) await mc.check().catch(() => {}); else await mc.uncheck().catch(() => {}); }
  await page.evaluate(() => { window.__R = Math.random; let a = 777; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(500);
  await page.evaluate(() => { Math.random = window.__R; });
  const drain = async () => { for (let n = 0; n < 40 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(50); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(30); } };
  const endTurn = async () => { await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(900); await drain(); await page.evaluate(() => document.querySelectorAll('.scrim').forEach(x => x.remove())); };
  await drain();
  const log = []; const head = await page.evaluate(() => ({ seed: HOAPI.G.opts.seed, modern: !!HOAPI.G.opts.modern }));
  // 1. a colony ship (direct purchase / queue), sent to the nearest unowned star, settled (the same engine-level orders in both runs)
  await page.evaluate(() => { const a = HOAPI, g = a.G, p = a.me(); p.savings = 500000; p.metal = 100000; const home = g.stars.find(s => s.owner === a.ME); const d = p.designs.find(x => x.type === 'colony' && !x.scrapped); if (HO.feature(g, 'buildQueue')) HO.queueShips(g, a.ME, home.id, d.id, 1); else HO.buildShips(g, a.ME, home.id, d.id, 1); });
  let ship = null; for (let t = 0; t < 6 && !ship; t++) { ship = await page.evaluate(() => { const a = HOAPI, g = a.G, f = g.fleets.find(f => f.owner === a.ME && f.to == null && HO.fleetHas(g, f, 'colony')); return f ? f.id : null; }); if (!ship) await endTurn(); }
  const stepId = await page.evaluate((fid) => { const a = HOAPI, g = a.G, f = g.fleets.find(x => x.id === fid), max = HO.fleetMaxRange(g, f); const c = g.stars.filter(s => s.owner === -1 && HO.starDist(g, f.star, s.id) <= max).sort((x, y) => HO.starDist(g, f.star, x.id) - HO.starDist(g, f.star, y.id))[0]; HO.orderMove(g, f, c.id); return c.id; }, ship);
  for (let t = 0; t < 10 && !(await page.evaluate((id) => HOAPI.G.stars[id].owner === HOAPI.ME, stepId)); t++) await endTurn();
  // 2. a target beyond the home's reach, within reach of the new colony; a fighter fleet at home
  const plan = await page.evaluate((stepId) => { const a = HOAPI, g = a.G, p = a.me(), home = g.stars.find(s => s.owner === a.ME && s.id !== stepId); const d = p.designs.find(x => x.type === 'fighter' && !x.scrapped) || p.designs[0]; HO.feature(g, 'buildQueue') ? HO.queueShips(g, a.ME, home.id, d.id, 1) : HO.buildShips(g, a.ME, home.id, d.id, 1); return { home: home.id }; }, stepId);
  let fl = null; for (let t = 0; t < 6 && !fl; t++) { fl = await page.evaluate((hid) => { const a = HOAPI, g = a.G, f = g.fleets.find(f => f.owner === a.ME && f.star === hid && f.to == null && !HO.fleetHas(g, f, 'colony')); return f ? f.id : null; }, plan.home); if (!fl) await endTurn(); }
  const tgt = await page.evaluate(([fid, stepId]) => { const a = HOAPI, g = a.G, f = g.fleets.find(x => x.id === fid), max = HO.fleetMaxRange(g, f); const c = g.stars.filter(s => s.id !== f.star && s.id !== stepId && HO.starDist(g, f.star, s.id) > max && HO.starDist(g, stepId, s.id) <= max).sort((x, y) => HO.starDist(g, stepId, x.id) - HO.starDist(g, stepId, y.id))[0]; return c ? { id: c.id, name: c.name, direct: Math.round(HO.starDist(g, f.star, c.id)), max } : null; }, [fl, stepId]);
  log.push('target: ' + JSON.stringify(tgt)); if (!tgt) { console.log(TAG, 'no suitable target in this galaxy'); await b.close(); srv.kill(); return; }
  const t0 = await page.evaluate(() => HOAPI.G.turn);
  // 3. the order: one automatic-route order (modern), or the hop by hand
  const route = await page.evaluate(([fid, tid]) => { const a = HOAPI, f = a.G.fleets.find(x => x.id === fid); const r = a.findRoute(f, tid); return r ? r.slice() : null; }, [fl, tgt.id]);
  log.push('route found through my colonies: ' + JSON.stringify(route));
  const ordered = await page.evaluate(([fid, tid, mod]) => { const a = HOAPI, g = a.G, f = g.fleets.find(x => x.id === fid); if (mod) return { how: 'autoRoute', ok: a.autoRoute(f, tid) }; return { how: 'direct order (refused: too far)', ok: HO.orderMove(g, f, tid) }; }, [fl, tgt.id, MOD]);
  log.push('order: ' + JSON.stringify(ordered));
  if (!MOD && !ordered.ok && route) { const first = await page.evaluate(([fid, n]) => { const g = HOAPI.G, f = g.fleets.find(x => x.id === fid); return HO.orderMove(g, f, n); }, [fl, route[0]]); log.push('  first hop ordered by hand at once: ' + first); }
  let arrived = null;
  for (let t = 1; t <= 14 && arrived === null; t++) {
    if (!MOD) await page.evaluate(([fid, r]) => { const a = HOAPI, g = a.G, f = g.fleets.find(x => x.id === fid); if (f && f.to == null && !f.dest && r) { const next = r.find(s => s !== f.star && HO.starDist(g, f.star, s) <= HO.fleetMaxRange(g, f) && r.indexOf(s) >= 0 && !(g.fleets.find(x => x.id === fid).visited || []).includes(s)); } }, [fl, route]);
    await endTurn();
    const st = await page.evaluate(([fid, tid]) => { const g = HOAPI.G, f = g.fleets.find(x => x.id === fid); return f ? { at: f.star, dest: f.dest, path: f.path ? f.path.length : 0, turn: g.turn } : null; }, [fl, tgt.id]);
    log.push(`  turn +${t}: ${JSON.stringify(st)}`);
    if (st && st.at === tgt.id && st.dest == null) arrived = t;
    else if (!MOD && st && st.dest == null && route && st.at !== tgt.id) { // by hand: the next star of the route
      const idx = route.indexOf(st.at); const nxt = idx >= 0 ? route[idx + 1] : route[0];
      await page.evaluate(([fid, n]) => { const g = HOAPI.G, f = g.fleets.find(x => x.id === fid); HO.orderMove(g, f, n); }, [fl, nxt]);
    }
  }
  console.log(TAG, JSON.stringify(head)); console.log(log.join('\n')); console.log(TAG, 'arrived after', arrived, 'turn(s)', errs.length ? 'ERRORS ' + errs : '');
  fs.writeFileSync(`${OUT}/route-${TAG}.json`, JSON.stringify({ head, arrived, route })); await b.close(); srv.kill();
})();
