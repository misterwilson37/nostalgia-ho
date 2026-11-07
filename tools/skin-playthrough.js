#!/usr/bin/env node
// Plays a seeded game in a skin, for each ruleset, clicking through the panel and map as a player does, and reports what breaks.
//   NODE_PATH=$(npm root -g) node tools/skin-playthrough.js [rulesets, comma-separated] [turns, 20] [skin, mac12] [seed, 7]
//   e.g.  node tools/skin-playthrough.js original,405 30 mac12 3
// Why: tools/skin-menu-sweep.js opens every menu command but does not touch the panel, the map, the budget bars, the orders, the
// designs or the end-of-turn questions, and the 1.2 skin's panel and windows were written for 1.2's rules (docs/12-findings.md,
// "Remake-only controls": the Build window that queued ships a later ruleset never built, the fleet box that was blank in every ruleset
// but 1.2's). Each turn it does a few of: buy or queue ships through the Build window; send a fleet (HO.orderMove); drag a budget bar
// with the mouse; create a ship design through its window; open the Create/Build/Organize windows; toggle an Options item; then it ends
// the turn and answers what pops up. After every step it reports:
//   - a page error, or the game's own "Something unexpected happened" window
//   - a window that will not close (Escape, then its close box)
//   - a blank canvas in the panel (a box the skin drew nothing in)
//   - the turn not advancing after End Turn (a stuck question)
// It changes only the game it makes. Chromium: PLAYWRIGHT_BROWSERS_PATH as for the other tools; serves the repository itself.
const { chromium } = require('playwright'); const { spawn } = require('child_process');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '12,dos,301,405,original,palm,claude,mac20,mac405,ios,gemini,android').split(',');
const TURNS = +(process.argv[3] || 20), SKIN = process.argv[4] || 'mac12', SEED = +(process.argv[5] || 7);
const PORT = +(process.env.PORT || 8000), SHOTS = process.env.SHOTS || '';
const rng = (a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(SEED);
const pick = (xs) => xs[Math.floor(rng() * xs.length)];

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const all = [];
  for (const rules of RULES) {
    const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
    let cur = rules + ' start'; const probs = []; const note = (m) => { const s = `${cur} :: ${m}`; if (!probs.includes(s)) probs.push(s); };
    page.on('pageerror', e => note('PAGE ERROR ' + e.message.slice(0, 150)));
    page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) note('HO BUG ' + m.text().replace(/\s+/g, ' ').slice(0, 170)); });
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    const counts = { buy: 0, send: 0, bars: 0, design: 0, windows: 0, options: 0, turns: 0 };
    try {
      await page.goto(`http://localhost:${PORT}/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
      await form.locator('select[name=computers]').selectOption('3').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);

      const closeAll = async (why) => {
        for (let k = 0; k < 5 && await page.locator('.scrim').count(); k++) { await page.keyboard.press('Escape'); await sleep(100); if (await page.locator('.scrim').count()) { const x = page.locator('.scrim .close:visible'); if (await x.count()) await x.last().click({ timeout: 1500 }).catch(() => {}); await sleep(80); } }
        if (await page.locator('.scrim').count()) { note('A WINDOW THAT WILL NOT CLOSE (' + why + '): ' + await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w ? w.className + ' / ' + (w.textContent || '').replace(/\s+/g, ' ').slice(0, 60) : '?'; })); await page.evaluate(() => { try { HOAPI.closeModal(); } catch (e) {} document.querySelectorAll('.scrim').forEach(x => x.remove()); }); }
      };
      const bugWindow = async () => { const t = await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w && /unexpected happened/i.test(w.textContent) ? w.textContent.replace(/\s+/g, ' ').slice(0, 200) : ''; }); if (t) note('BUG WINDOW: ' + t); };
      const drain = async () => { for (let n = 0; n < 40 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await bugWindow(); await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); } };
      const blank = () => page.evaluate(() => [...document.querySelectorAll('#panel canvas')].map((c, i) => { const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let dark = 0; for (let k = 0; k < d.length; k += 4) if (d[k] < 100 && d[k + 3] > 0) dark++; return dark < 15 ? `canvas #${i} (${c.getAttribute('aria-label') || c.parentElement.className}) is blank` : null; }).filter(Boolean));
      const menuClick = async (mi, re) => { await page.evaluate(() => { document.body.click(); document.querySelectorAll('.scrim').forEach(x => x.remove()); }); await page.locator('#menubar .mbtn').nth(mi).click(); await sleep(120); return page.evaluate((r) => { const x = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(e => new RegExp(r, 'i').test(e.textContent)); if (x && !x.disabled) { x.click(); return true; } return false; }, re); };
      await drain();

      for (let t = 1; t <= TURNS; t++) {
        cur = `${rules} turn ${t}`;
        const over = await page.evaluate(() => !!HOAPI.G.over); if (over) { note('(game over: stopped)'); break; }
        await drain(); await closeAll('before the turn'); await bugWindow();
        // choose one of my stars and show it
        await page.evaluate((r) => { const a = HOAPI, mine = a.G.stars.filter(s => s.owner === a.ME); if (mine.length) { const s = mine[Math.floor(r * mine.length)]; a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } }, rng());
        await sleep(150);
        // 1. the panel draws something in every box
        for (const m of await blank()) note(m);
        // 2. the fleet box with fleets here, none selected (a selected row is inverted whatever it says)
        const fb = await page.evaluate(() => { const a = HOAPI, s = a.G.stars[a.UI.sel]; const had = a.UI.selFleet; if (!s || !a.G.fleets.some(f => f.owner === a.ME && f.star === s.id && f.to == null)) return null; a.UI.selFleet = null; a.renderPanel(); const c = document.querySelector('#panel .fleets12 canvas'); let dark = 0; if (c) { const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, Math.round(h * 20 / 62), Math.round(w * 214 / 226), Math.round(h * 38 / 62)).data; for (let i = 0; i < d.length; i += 4) if (d[i] < 100) dark++; } a.UI.selFleet = had; a.renderPanel(); return c ? dark : -1; });
        if (fb !== null && fb >= 0 && fb < 60) note(`the fleet box draws nothing for fleets here (${fb} dark pixels)`);
        // 3. a few actions
        const acts = ['buy', 'send', 'bars', 'design', 'window', 'options'].filter(() => rng() < 0.55);
        for (const act of acts) {
          cur = `${rules} turn ${t} ${act}`;
          try {
            if (act === 'buy') {
              const state = () => page.evaluate(() => { const a = HOAPI, g = a.G, p = a.me(), s = g.stars[a.UI.sel]; return { q: HO.feature(g, 'buildQueue'), sv: Math.round(p.savings), ships: g.fleets.filter(f => f.owner === a.ME).reduce((n, f) => n + Object.values(f.ships).reduce((x, y) => x + y, 0), 0), queued: ((s && s.queue) || []).reduce((n, e) => n + e.n, 0) }; });
              await page.evaluate(() => { const a = HOAPI, p = a.me(); p.savings = Math.max(p.savings, 80000); p.metal = Math.max(p.metal, 20000); });
              const before = await state();
              await page.evaluate(() => { const a = HOAPI; a.openBuild(a.UI.sel); }); await sleep(250);
              const n = await page.locator('.scrim .cols > div:last-child .li').count();
              if (n) {
                const row = page.locator('.scrim .cols > div:last-child .li').nth(Math.floor(rng() * n)); const rowText = (await row.textContent().catch(() => '')).trim(); await row.dblclick().catch(() => {}); await sleep(120); await row.dblclick().catch(() => {}); counts.buy++; await sleep(150);
                const after = await state();
                // (a design the player cannot afford, one made by an earlier random design with a long range, is rightly refused: the window's own rule)
                const afford = await page.evaluate((name) => { const a = HOAPI, g = a.G, p = a.me(), d = p.designs.filter(x => !x.scrapped).find(x => x.name === name); if (!d) return true; const c = HO.shipCostNow(g, p, d), rs = HO.rules(g), floor = rs.allowDebt && !rs.allowDebt.on ? 0 : HO.borrowLimit(g, p); /* iOS and the Palm: Allow Debt is off at first, so the floor is $0 */ const st = g.stars[a.UI.sel], q = (st && st.queue) || [], full = !!(rs.queueSlots && HO.feature(g, 'buildQueue') && q.length >= rs.queueSlots && !q.some(e => e.did === d.id)); /* a queue with every slot taken takes no new design: 1.2's rule, the window beeps */ return !(p.savings - c.money < floor || p.metal < c.metal || full); }, rowText.split(' (')[0].replace(/^(one|\d+) /, '').trim());
                // a purchase must change the game: a queue grows (1.2, DOS 2.0), or money is spent and the ships are there (every other ruleset)
                if (afford && (before.q ? after.queued <= before.queued : (after.sv >= before.sv || after.ships <= before.ships))) note(`a purchase in the Build window changed nothing: "${rowText}" (${before.q ? 'queue ' + before.queued + '->' + after.queued : 'savings ' + before.sv + '->' + after.sv + ', ships ' + before.ships + '->' + after.ships}); ${await page.evaluate(() => { const a = HOAPI, p = a.me(), w = document.querySelector('.scrim .win'); return 'metal ' + Math.round(p.metal) + ', designs ' + p.designs.filter(d => !d.scrapped).length + ', window: ' + (w ? w.textContent.replace(/\\s+/g, ' ').slice(0, 90) : 'closed'); })}`);
              }
              await bugWindow(); await closeAll('build');
            } else if (act === 'send') {
              const ok = await page.evaluate((r) => { const a = HOAPI, g = a.G, fs = g.fleets.filter(f => f.owner === a.ME && f.to == null && f.star != null && !f.sat); if (!fs.length) return false; const f = fs[Math.floor(r * fs.length)], near = g.stars.filter(s => s.id !== f.star).sort((x, y) => Math.hypot(x.x - g.stars[f.star].x, x.y - g.stars[f.star].y) - Math.hypot(y.x - g.stars[f.star].x, y.y - g.stars[f.star].y)).slice(0, 4); const s = near[Math.floor((r * 997) % near.length)]; HO.orderMove(g, f, s.id); a.renderPanel(); a.draw(); return true; }, rng());
              if (ok) counts.send++;
            } else if (act === 'bars') {
              // a drag on a budget bar of the planet box, by the mouse. The three bars (terraforming, mining, shipbuilding) are drawn in the top 54 units of the
              // box, at x 109-127, 136-154 and 163-181 of its 226: the drag starts inside them (an earlier version started below and moved nothing)
              const box = await page.evaluate(() => { const c = document.querySelector('#panel section.box canvas'); if (!c) return null; const r = c.getBoundingClientRect(); const a = HOAPI, s = a.G.stars[a.UI.sel]; return { x: r.x, y: r.y, w: r.width, h: r.height, mine: !!s && s.owner === a.ME, ship: s && s.ship, queueShown: !!s && Math.abs(HO.seenT(a.me(), s) - 72) <= 0.5 && !(s.metal > 0) }; });
              if (box) {
                const bar = Math.floor(rng() * 3), x = box.x + box.w * [118, 145, 172][bar] / 226, y0 = box.y + box.h * 0.52, y1 = box.y + box.h * (0.12 + rng() * 0.3);
                await page.mouse.move(x, y0); await page.mouse.down(); await page.mouse.move(x, (y0 + y1) / 2, { steps: 4 }); await page.mouse.move(x, y1, { steps: 4 }); await page.mouse.up(); counts.bars++; await sleep(120);
                const ship2 = await page.evaluate(() => { const a = HOAPI, s = a.G.stars[a.UI.sel]; return s && s.ship; });
                // (a bar already at 100% cannot go up: that is not a failure; the drag is upward, to 12-42% of the box's height from its middle)
                // (both other parts finished, 72 degrees and no metal: 1.2 draws the shipbuilding queue in place of the bars, so there is no bar to drag)
                if (box.mine && !box.queueShown && bar === 2 && box.ship != null && box.ship < 0.999 && Math.abs(ship2 - box.ship) < 1e-9) {
                  const d = await page.evaluate(() => { const a = HOAPI, s = a.G.stars[a.UI.sel]; return `${s.name}: pop ${Math.round(s.pop)}, terra ${s.terra}, metal ${Math.round(s.metal)}, selFleet ${a.UI.selFleet}, modal ${!!document.querySelector('.scrim')}, boxes ${document.querySelectorAll('#panel section.box').length}`; });
                  note(`dragging the shipbuilding bar changed nothing (${box.ship} -> ${ship2}); ${d}; drag from ${Math.round(y0)} to ${Math.round(y1)} at x ${Math.round(x)}, box ${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.w)}x${Math.round(box.h)}`);
                }
              }
            } else if (act === 'design') {
              if (await menuClick(4, '^(Create New|Créer)')) { await sleep(250); const n = await page.locator('.scrim select option').count(); if (n) { const sel = page.locator('.scrim select').first(); await sel.selectOption({ index: Math.floor(rng() * n) }).catch(() => {}); } await page.locator('.scrim input[type=range]').first().focus().catch(() => {}); for (let k = 0; k < Math.floor(rng() * 5); k++) await page.keyboard.press('ArrowRight'); await page.evaluate(() => { const bt = [...document.querySelectorAll('.scrim .btns button')].pop(); bt && bt.click(); }); await sleep(250); counts.design++; await bugWindow(); await closeAll('create design'); }
            } else if (act === 'window') {
              const w = pick([[4, '^(List Ship|Lister)'], [4, '^(List All Fleets|Lister toutes)'], [4, '^(Organize|Répartir)'], [5, '^(List All Explored|Lister les)'], [4, '^Build Ships']]);
              if (await menuClick(w[0], w[1])) { await sleep(300); counts.windows++; await bugWindow(); await closeAll('menu window'); }
            } else if (act === 'options') {
              const items = await page.evaluate(() => { document.body.click(); return null; }); void items;
              await page.locator('#menubar .mbtn').nth(3).click(); await sleep(120);
              const n = await page.locator('#menubar .dropdown.open [role=menuitem].check:not([disabled])').count();
              if (n) { await page.locator('#menubar .dropdown.open [role=menuitem].check:not([disabled])').nth(Math.floor(rng() * n)).click().catch(() => {}); counts.options++; }
              await page.evaluate(() => document.body.click());
            }
          } catch (e) { note('action threw: ' + e.message.split('\n')[0].slice(0, 120)); await closeAll('after a failed action'); }
          for (const m of await blank()) note(m + ' (after ' + act + ')');
        }
        // 4. End Turn, and what comes up
        cur = `${rules} turn ${t} end turn`;
        const t0 = await page.evaluate(() => HOAPI.G.turn);
        await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1100);
        for (let k = 0; k < 6; k++) { // a question (underfunded, overspending ...): answer with its default button
          if (!(await page.locator('.scrim').count())) break; await bugWindow();
          const did = await page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .btns button, .scrim button')].filter(x => !x.disabled && !x.classList.contains('close')); const b = bs.reverse().find(x => /^(OK|Yes|Oui|Continue|Go|End|Fin)/i.test(x.textContent.trim())) || bs[0]; if (b) { b.click(); return true; } return false; });
          await sleep(500); if (!did) break;
        }
        await sleep(700); await drain(); await closeAll('after the turn'); await bugWindow();
        const t1 = await page.evaluate(() => HOAPI.G.turn);
        if (t1 === t0 && !(await page.evaluate(() => !!HOAPI.G.over))) { // the turn did not advance: try once more
          await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1500); await drain(); await closeAll('retry');
          if ((await page.evaluate(() => HOAPI.G.turn)) === t0) { note('THE TURN DID NOT ADVANCE after End Turn (twice)'); break; }
        }
        counts.turns++;
      }
      // what the game looked like at the end (for notes on how a ruleset plays: length, growth, fights)
      const sm = await page.evaluate(() => { const a = HOAPI, g = a.G, me = a.me(); const mine = g.stars.filter(s => s.owner === a.ME), ships = g.fleets.filter(f => f.owner === a.ME).reduce((n, f) => n + Object.values(f.ships).reduce((x, y) => x + y, 0), 0); return `year ${g.year}, turn ${g.turn}, ${mine.length} of ${g.stars.length} stars mine, ${g.players.filter(p => p.alive).length}/${g.players.length} players alive, ${ships} ships of mine in ${g.fleets.filter(f => f.owner === a.ME).length} fleets, savings ${Math.round(me.savings)}, tech ${Object.values(me.tech).join('/')}, ${g.stat ? g.stat.battles + ' battles, ' + g.stat.captures + ' captures' : ''}${g.over ? ', GAME OVER' : ''}`; });
      console.log(`   summary: ${sm}`);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/playthrough-${SKIN}-${rules}.png` });
    } catch (e) { note('script stopped: ' + e.message.split('\n')[0].slice(0, 160)); }
    const c = counts; console.log(`${rules}: ${c.turns} turns; ${c.buy} buys, ${c.send} orders, ${c.bars} bar drags, ${c.design} designs, ${c.windows} windows, ${c.options} options; ${probs.length} problem(s)`);
    for (const p of probs) console.log('   !! ' + p); all.push(...probs);
    await page.close();
  }
  console.log(all.length ? `\n${all.length} PROBLEMS` : '\nno problems'); await b.close(); srv.kill(); process.exit(all.length ? 1 : 0);
})();
