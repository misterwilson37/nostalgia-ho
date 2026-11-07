#!/usr/bin/env node
// Finds galaxies where the two sides are connected within a fleet's range: seeds for tools/skin-modern-win-compare.js.
//   NODE_PATH=$(npm root -g) node tools/skin-find-galaxy.js [ruleset, original] [how many seeds, 200]     (env: SIZE, DENS, SHAPE, COMP)
// Makes one game through the New Game window with the smallest, densest settings (5.0.5: size 0, density 0 = dense, shape hex, strength 50, one computer player),
// then asks the engine for the same game with seeds 1..N (HO.newGame) and, for each, whether a fleet of range 6 can get from my colonies to within range of an enemy
// planet by hopping from star to star, and how many stepping-stone stars that takes. Prints the best. Why it exists: most galaxies are NOT connected (in 5.0.5's
// default "grid" the stars are 7 apart and a ship goes 6; of 600 random 3.0.1 galaxies only 6 connected), and a game the scripted player cannot cross can only be a draw.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const rules = process.argv[2] || 'original', N = +(process.argv[3] || 200);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.setDefaultTimeout(8000);
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
  const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
  const setSel = async (n, v) => { const el = form.locator(`select[name=${n}]`); if (await el.count()) await el.selectOption(v).catch(() => {}); };
  const setRange = async (n, v) => { await page.evaluate(([n, v]) => { const e = document.querySelector(`form.newgame input[name=${n}]`); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } }, [n, String(v)]); };
  await sleep(300); await setSel('computers', process.env.COMP || '1');
  if (rules === 'original' || rules === 'palm') { await setRange('o_size', process.env.SIZE || 0); await setRange('o_iq', 50); await setRange('o_density', process.env.DENS || 0); await setSel('start', 'abundant'); await setSel('o_cstart', 'outpost'); await setSel('o_shape', process.env.SHAPE || 'hex'); }
  else { const pre = rules === '301' ? 'm_' : rules === '405' ? 'w_' : 'd_'; await setSel(pre + 'iq', 'dumb'); await setSel(pre + 'size', 'small'); await setSel(pre + 'density', 'dense'); await setSel(pre + 'skill', 'expert'); await setSel(pre + 'shape', process.env.SHAPE || 'hex'); }
  await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(300);
  const res = await page.evaluate((N) => {
    const base = JSON.parse(JSON.stringify(HOAPI.G.opts)); const out = []; const R = 6;
    for (let seed = 1; seed <= N; seed++) {
      let g; try { g = HO.newGame(Object.assign({}, base, { seed })); } catch (e) { return { err: e.message, base }; }
      const ME = 0, d2 = (x, y) => HO.starDist(g, x, y), mine = g.stars.filter(s => s.owner === ME), foes = g.stars.filter(s => s.owner >= 0 && s.owner !== ME);
      let best = Infinity; for (const m of mine) for (const f of foes) best = Math.min(best, d2(m.id, f.id));
      const depth = {}, q = mine.map(m => m.id); for (const id of q) depth[id] = 0; let hops = best <= R ? 0 : null;
      for (let i = 0; i < q.length && hops === null; i++) { const u = q[i]; for (const v of g.stars) { if (v.id in depth || (v.owner >= 0 && v.owner !== ME) || d2(u, v.id) > R) continue; depth[v.id] = depth[u] + 1; q.push(v.id); if (foes.some(f => d2(v.id, f.id) <= R)) { hops = depth[v.id]; break; } } }
      if (hops !== null) out.push({ seed, direct: Math.round(best), hops, stars: g.stars.length });
    }
    const g0 = HO.newGame(Object.assign({}, base, { seed: 1 })), p0 = g0.players[0], d0 = (x, y) => HO.starDist(g0, x, y);
    const nn = g0.stars.map(s => Math.min(...g0.stars.filter(t => t.id !== s.id).map(t => d0(s.id, t.id))));
    const cs = p0.designs.find(d => d.type === 'colony'); const hs = g0.stars.find(x => x.owner === 0);
    let rng = null; try { HO.buildShips(g0, 0, hs.id, cs.id, 1); const f = g0.fleets.find(f => f.owner === 0); rng = f ? HO.fleetMaxRange(g0, f) : 'no fleet'; } catch (e) { rng = 'err ' + e.message; }
    out.push({ seed: 0, direct: Math.round(Math.min(...g0.stars.filter(s => s.owner > 0).map(s => d0(hs.id, s.id)))), hops: 'STATS', stars: g0.stars.length, nnMean: Math.round(10 * nn.reduce((a, b) => a + b, 0) / nn.length) / 10, nnMax: Math.round(Math.max(...nn)), range: rng });
    return { out, base: { shape: base.shape, size: base.size, density: base.density, iq: base.iq, comps: base.computers, stars: HOAPI.G.stars.length } };
  }, N);
  if (res.err) console.log('newGame failed:', res.err, JSON.stringify(res.base).slice(0, 400)); else { res.out.sort((x, y) => (x.hops === 'STATS') - (y.hops === 'STATS') || x.hops - y.hops || x.direct - y.direct); console.log('options:', JSON.stringify(res.base), '| connected galaxies among', N, ':', res.out.length); console.log(res.out.slice(0, 12).map(x => x.hops === 'STATS' ? `STATS seed 1: enemy home ${x.direct} away; nearest-neighbour distance mean ${x.nnMean} max ${x.nnMax}; a new ship's range ${x.range}; ${x.stars} stars` : `seed ${x.seed}: enemy ${x.direct} away, ${x.hops} stepping stone(s), ${x.stars} stars`).join('\n')); }
  await b.close(); srv.kill();
})();
