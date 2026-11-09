#!/usr/bin/env node
// Sending a fleet by dragging it out of the Fleets dialog onto a star, in the iOS skin (docs/ios-findings.md "Sending a fleet", FleetMovementMenu 0x1000c9808), with every ruleset:
//   NODE_PATH=$(npm root -g) node tools/skin-fleet-drag.js [rulesets, default original,ios,android,405,12] [skin, ios] [shots dir, none]
// An iPad's window (1600 x 1000, a mouse) and an iPhone's (844 x 390, touch events, the move button first): a game is started, two scout ships are put at the home star, the first row of the dialog is dragged
// onto a star in reach and dropped; the fleet must have the star as its destination and arrive by End Turn. Exit 1 on a problem.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || 'original,ios,android,405,12').split(','), SKIN = process.argv[3] || 'ios', SHOTS = process.argv[4] || '';
const SIZES = { pad: { width: 1600, height: 1000, touch: false }, phone: { width: 844, height: 390, touch: true } };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const problems = []; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  for (const size of Object.keys(SIZES)) for (const rules of RULES) {
    const S = SIZES[size], tag = `${rules}/${size}`, fail = (m) => problems.push(`${tag}: ${m}`);
    const page = await (await b.newContext({ viewport: { width: S.width, height: S.height }, hasTouch: S.touch })).newPage(); page.setDefaultTimeout(5000);
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
    try {
      await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
      await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
      await page.evaluate(() => document.querySelectorAll('.scrim, .ios-gscrim, .card').forEach(x => x.classList.contains('card') ? 0 : x.remove()));
      const home = await page.evaluate(() => { const a = HOAPI, G = a.G, me = a.me(); const h = G.stars.find(x => x.owner === a.ME); const sc = me.designs.find(d => d.type === 'scout');
        HO.addShipsToStar(G, a.ME, h.id, sc, 2); for (const s of G.stars) HO.observe(G, me, s.id); G.fleets.forEach(f => { f.newThisTurn = false; }); a.UI.sel = h.id; a.renderPanel(); a.draw(); return h.id; });
      await sleep(700);
      if (S.touch) { await page.locator('.ios-pb-move').click({ force: true }); await sleep(300); }
      const row = await page.evaluate(() => { const r = document.querySelector('.ios-fdl .frow'); if (!r) return null; const b = r.getBoundingClientRect(); return { id: +r.dataset.fleet, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      if (!row) { fail('no fleet row in the dialog'); await page.context().close(); continue; }
      const tgt = await page.evaluate((h) => { const G = HOAPI.G, v = HOVIEW().view, c = document.getElementById('map').getBoundingClientRect(), fd = document.querySelector('.ios-fd').getBoundingClientRect(), f = G.fleets.find(f => f.owner === HOAPI.ME && f.star === h);
        for (const s of G.stars) { if (s.id === h || HO.starDist(G, h, s.id) > f.fuel) continue; const x = c.left + v.ox + s.x * v.s, y = c.top + v.oy + s.y * v.s; if (x > 40 && x < innerWidth - 40 && y > 40 && y < innerHeight - 60 && !(x > fd.left - 30 && x < fd.right + 30 && y > fd.top - 30 && y < fd.bottom + 30) && !(innerWidth > 1000 && x < 330)) return { x, y, id: s.id }; } }, home);
      if (!tgt) { fail('no star in reach on screen'); await page.context().close(); continue; }
      if (S.touch) {
        const cdp = await page.context().newCDPSession(page), tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
        await tp('touchStart', row.x, row.y); for (let i = 1; i <= 8; i++) { await tp('touchMove', row.x + (tgt.x - row.x) * i / 8, row.y + (tgt.y - row.y) * i / 8); await sleep(30); }
        await sleep(150); const sprite = await page.locator('.touchdrag').count(); if (SHOTS) await page.screenshot({ path: `${SHOTS}/iosfix-drag-${rules}-${size}.png` }); if (!sprite) fail('the ship was not picked up'); await tp('touchEnd'); 
      } else {
        await page.mouse.move(row.x, row.y); await page.mouse.down(); await page.mouse.move(row.x + 40, row.y - 40, { steps: 4 }); await page.mouse.move(tgt.x, tgt.y, { steps: 12 }); await sleep(150);
        const sprite = await page.locator('.touchdrag').count(); if (SHOTS) await page.screenshot({ path: `${SHOTS}/iosfix-drag-${rules}-${size}.png` }); if (!sprite) fail('the ship was not picked up'); await page.mouse.up();
      }
      await sleep(300);
      const dest = await page.evaluate((i) => { const f = HOAPI.G.fleets.find(f => f.id === i); return f && f.dest; }, row.id);
      if (dest !== tgt.id) fail(`the fleet's destination is ${dest}, ${tgt.id} was wanted`);
      for (let i = 0; i < 8; i++) { await page.evaluate(() => { document.querySelectorAll('.scrim, .ios-gscrim').forEach(x => x.remove()); HOAPI.doEndTurn(true); }); await sleep(900); const st = await page.evaluate((i) => { const f = HOAPI.G.fleets.find(f => f.id === i); return f ? f.star : null; }, row.id); if (st === tgt.id) break; }
      const at = await page.evaluate((i) => { const f = HOAPI.G.fleets.find(f => f.id === i); return f ? f.star : 'gone'; }, row.id);
      if (at !== tgt.id) fail(`the fleet did not arrive (at ${at}, ${tgt.id} wanted)`);
    } catch (e) { fail('threw ' + String(e.message).split('\n')[0]); }
    if (errs.length) fail('page errors: ' + errs.slice(0, 2).join(' | '));
    console.log(`${problems.some(p => p.startsWith(tag + ':')) ? 'FAIL' : 'ok  '} ${tag}`); await page.context().close();
  }
  await b.close(); srv.kill();
  if (problems.length) { console.log('\n' + problems.join('\n')); process.exit(1); }
  console.log('\nno problems');
})().catch(e => { console.error(e); process.exit(1); });
