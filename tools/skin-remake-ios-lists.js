#!/usr/bin/env node
// The iOS skin's rebuilt lists (docs/remake-controls.md): All Fleets, Review battle, the explored stars (5.0.5's sortable list, the Mac and DOS lists with Go To Star, the Palm's and iOS's own), Rank history,
// the Halls with their Summary, the Master Point List. Each is opened through the page, must be the skin's own (`data-remake`, no classic window), and is used: a fleet or a star is chosen and the window
// closes with it selected, a battle opens its report, a Hall entry's Details opens its Summary and the check comes back. Screenshots at a phone and an iPad size. Exit 1 on a problem.
//   NODE_PATH=$(npm root -g) node tools/skin-remake-ios-lists.js [rulesets, all but ios and android] [skin, ios] [shots dir]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const ALL = '12,dos,301,405,original,palm,claude,mac20,mac405,gemini'.split(',');
const RULES = (process.argv[2] || ALL.join(',')).split(','), SKIN = process.argv[3] || 'ios', SHOTS = process.argv[4] || '';
const SIZES = { phone: { width: 844, height: 390 }, pad: { width: 1024, height: 768 } };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const problems = []; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  try {
    for (const size of Object.keys(SIZES)) for (const rules of RULES) {
      const tag = `${rules}/${size}`, fail = (m) => problems.push(`${tag}: ${m}`);
      const page = await (await b.newContext({ viewport: SIZES[size], hasTouch: true })).newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
      await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); } await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G); await sleep(800);
      for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
      const ran = []; const shot = async (n) => { ran.push(n); if (SHOTS) await page.screenshot({ path: `${SHOTS}/${SKIN}-${rules}-${size}-${n}.png` }); };
      const kind = () => page.evaluate(() => { const e = document.querySelector('[data-remake]'); return e ? e.getAttribute('data-remake') : (document.querySelector('.scrim .win') ? 'classic' : null); });
      const closeAll = async () => { for (let i = 0; i < 5 && await page.locator('.scrim, .ios-gscrim').count(); i++) { await page.keyboard.press('Escape'); await sleep(100); await page.evaluate(() => { const c = document.querySelector('.ios-gdlg .ios-gx, .ios-gdlg .ios-bcancel, .win .close'); if (c) c.click(); }); await sleep(60); } };
      await page.evaluate(() => { const D = HO.rules(HOAPI.G).menuDimmed; if (D) HOAPI.G.year = D.before; HOAPI.G.year = Math.max(HOAPI.G.year, 2010); });
      if (/^(ios|android)$/.test(rules)) { // (the app's own rules: nothing here may open a remake-only dialog, the skin shows what it showed before)
        for (const code of ['HOAPI.openStarList()', 'HOAPI.openFleetList()', 'HOAPI.openBattleList()', 'HOAPI.openReports()', 'HOAPI.openTemperature()', 'HOAPI.openPlayers()', 'HOAPI.openGive()', 'HOAPI.openDip && HOAPI.openDip()', 'HOAPI.openAutoPlay()', 'HOAPI.openRadicalHand()', 'HOAPI.openCompare && HOAPI.openCompare()']) {
          await page.evaluate(code).catch(() => {}); await sleep(250);
          const rk = await page.evaluate(() => { const e = document.querySelector('[data-remake]'); return e ? e.getAttribute('data-remake') : null; }); if (rk) fail(`${code} opened the remake-only ${rk}`);
          await closeAll();
        }
        if (errs.length) fail('page errors: ' + errs.slice(0, 2).join(' | '));
        console.log(`${problems.some(p => p.startsWith(tag)) ? 'FAIL' : 'ok  '} ${tag}  (the app's own rules: no remake-only dialog opened)`); await page.context().close(); continue;
      }
      // explored stars: a star is chosen (a Mac or DOS list: touch it, then Go To Star)
      await page.evaluate(() => HOAPI.openStarList()); await sleep(400); await shot('stars');
      if (await kind() !== 'stars') fail('stars opened ' + await kind());
      else {
        const n = await page.locator('.ios-remake .ios-ritem').count(); if (!n) fail('stars: no rows');
        else {
          const idx = Math.min(1, n - 1), want = await page.locator('.ios-remake .ios-ritem').nth(idx).locator('.ios-rcell').nth(/^original$/.test(rules) ? 1 : 0).innerText();
          await page.locator('.ios-remake .ios-ritem').nth(idx).click(); await sleep(150);
          const go = page.locator('.ios-remake .ios-bbtn'); if (await go.count()) { if (await go.first().isDisabled()) fail('stars: Go To Star stayed disabled'); else await go.first().click(); await sleep(250); }
          if (await page.locator('.ios-remake').count()) { await page.locator('.ios-remake .ios-ritem.on').click().catch(() => {}); await sleep(250); }
          if (await page.locator('[data-remake=stars]').count()) fail('stars: the list stayed open after a choice');
          else { const got = await page.evaluate(() => HOAPI.G.stars[HOAPI.UI.sel].name); if (got !== want) fail(`stars: chose ${want}, selected ${got}`); }
        }
      }
      await closeAll();
      // fleets
      await page.evaluate(() => { HOAPI.UI.selFleet = null; HOAPI.openFleetList(); }); await sleep(400); await shot('fleets');
      if (await kind() !== 'fleets') fail('fleets opened ' + await kind());
      else if (await page.locator('.ios-remake .ios-ritem').count()) { await page.locator('.ios-remake .ios-ritem').first().click(); await sleep(250); if (await page.locator('[data-remake=fleets]').count()) fail('fleets: stayed open'); else if (await page.evaluate(() => HOAPI.UI.selFleet == null)) fail('fleets: no fleet selected'); }
      await closeAll();
      // a battle
      await page.evaluate(() => { const a = HOAPI, G = a.G; if (!G.battles.length) G.battles.push({ id: 1, star: a.G.players[a.ME].homeStar, year: G.year, sides: [a.ME, 1], lost: { 0: 1, 1: 2 }, duel: null }); });
      await page.evaluate(() => HOAPI.openBattleList()); await sleep(400); await shot('battles');
      if (await kind() !== 'battles') fail('battle list opened ' + await kind()); else if (!await page.locator('.ios-remake .ios-ritem').count()) fail('battle list: no rows');
      await closeAll();
      // rank history, the Halls and the Master Point List
      if (await page.evaluate(() => !!(HO.DATA.ranks && HO.DATA.ranks.length && HO.rules(HOAPI.G).rankWindow !== false && /^(original|palm)$/.test(HOAPI.G.rules)))) {
        await page.evaluate(() => HOAPI.openRanks()); await sleep(350); await shot('ranks'); if (await kind() !== 'ranks') fail('ranks opened ' + await kind()); await closeAll();
      }
      if (await page.evaluate(() => HOAPI.hasHall(HOAPI.G))) {
        // two entries are put where the page keeps its Hall (the key is found by watching what hallTables reads)
        await page.evaluate(() => {
          let key = null; const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { if (!key && /hall/i.test(k)) key = k; return g.call(this, k); }; HOAPI.hallTables(HOAPI.G); Storage.prototype.getItem = g;
          const e = (n, d) => ({ name: n, time: Date.now() - d * 86400000, difficulty: 40 + d, humans: 1, computers: 2, allies: 0, iq: 1, year: 2100, size: 1, density: 1, shape: 0, skill: 2, armageddons: 0, points: 100 * d });
          localStorage.setItem(key, JSON.stringify({ fame: [e('Ada', 1), e('Brin', 2)], shame: [e('Cy', 3)], master: { list: [{ name: 'Ada', points: 900 }, { name: 'Brin', points: 400 }], sum: 1300 } }));
        });
        for (const k of ['fame', 'shame']) {
          await page.evaluate((kk) => HOAPI.openHall(kk), k); await sleep(400); await shot('hall-' + k); if (await kind() !== 'hall') { fail(`hall ${k} opened ${await kind()}`); await closeAll(); continue; }
          await page.locator('.ios-remake .ios-ritem').first().click(); await sleep(120);
          await page.locator('.ios-remake .ios-bbtn').first().click(); await sleep(350); await shot('hall-' + k + '-summary');
          if (await kind() !== 'hallsummary') fail(`hall ${k}: Details opened ${await kind()}`);
          else { await page.locator('.ios-remake .ios-bcheck').click(); await sleep(350); if (await kind() !== 'hall') fail(`hall ${k}: the check did not go back to the Hall (${await kind()})`); }
          await closeAll();
        }
        if (await page.evaluate(() => typeof HO.rules(HOAPI.G).hall.rank === 'function')) {
        await page.evaluate(() => HOAPI.openMasterList()); await sleep(400); await shot('master'); if (await kind() !== 'master') fail('master list opened ' + await kind()); else if (await page.locator('.ios-remake .ios-ritem').count() !== 2) fail('master list: rows'); await closeAll(); }
      }
      // the Report Window (a touch on a report does what it offers) and Temperatures (the unit is kept)
      await page.evaluate(() => HOAPI.openReports()); await sleep(400); await shot('reports');
      if (await kind() !== 'reports') fail('reports opened ' + await kind()); else if (await page.locator('.ios-remake .ios-ritem').count()) { await page.locator('.ios-remake .ios-ritem').first().click(); await sleep(300); if (await page.locator('[data-remake=reports]').count()) fail('reports: stayed open after a touch'); }
      await closeAll();
      await page.evaluate(() => HOAPI.openTemperature()); await sleep(350); await shot('temps');
      if (await kind() !== 'temps') fail('temperatures opened ' + await kind());
      else { await page.locator('.ios-remake .ios-gtoggle').click(); await sleep(80); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(250); if (!await page.evaluate(() => HOAPI.Prefs.temp)) fail('temperatures: the unit was not kept'); await page.evaluate(() => { HOAPI.Prefs.temp = null; HOAPI.savePrefs(); }); }
      await closeAll();
      // Compare Players (the early game's one line, then the chart) and Show Skills, which the check leaves for Compare again
      if (await page.evaluate(() => !!HO.rules(HOAPI.G).compare)) {
        for (const year of [2000, 2030]) {
          await page.evaluate((y) => { HOAPI.G.year = y; HOAPI.openCompare(); }, year); await sleep(450); await shot('compare-' + year);
          if (await kind() !== 'compare') { fail(`compare (${year}) opened ${await kind()}`); await closeAll(); continue; }
          if (year === 2030 && !await page.locator('.ios-remake canvas.ios-rchart').count()) fail('compare: no chart at 2030');
          await page.locator('.ios-remake .ios-bbtn').first().click(); await sleep(350); if (year === 2000) await shot('skills');
          if (await kind() !== 'skills') fail(`compare: Show Skills opened ${await kind()}`);
          else { if (!await page.locator('.ios-remake .ios-ritem').count()) fail('skills: no players'); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(350); if (await kind() !== 'compare') fail('skills: the check did not go back to Compare (' + await kind() + ')'); }
          await closeAll();
        }
      }
      // Split fleet (a fleet of two or more ships: some go into a new fleet) and Group Fleets (the app's Organize screen for 5.0.5 and the Palm)
      await page.evaluate(() => { try { const a = HOAPI, G = a.G, p = a.me(); p.savings = Math.max(p.savings, 500000); p.metal = Math.max(p.metal, 50000); const home = G.stars.find(x => x.owner === a.ME); const d = p.designs.find(x => !x.scrapped) || p.designs[0]; if (!G.fleets.some(f => f.owner === a.ME && Object.values(f.ships).reduce((n, v) => n + v, 0) >= 2) && home && d) HO.buildShips(G, a.ME, home.id, d.id, 3); const f = G.fleets.find(x => x.owner === a.ME && x.star != null); if (f && d && Object.values(f.ships).reduce((n, v) => n + v, 0) < 2) f.ships = { [Object.keys(f.ships)[0] || d.id]: 3 }; } catch (e) {} });
      const sp = await page.evaluate(() => { const a = HOAPI, f = a.G.fleets.find(x => x.owner === a.ME && x.star != null && Object.values(x.ships).reduce((n, v) => n + v, 0) >= 2); return f ? { id: f.id, star: f.star, n: a.G.fleets.length } : null; });
      if (sp && await page.evaluate(() => !HO.rules(HOAPI.G).organizeFleets)) {
        await page.evaluate((i) => HOAPI.openSplit(HOAPI.G.fleets.find(f => f.id === i)), sp.id); await sleep(350); await shot('split');
        if (await kind() !== 'split') fail('split opened ' + await kind());
        else { const sl = page.locator('.ios-remake .ios-sl').first(); const bb = await sl.boundingBox(); await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await sleep(100); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300); const n1 = await page.evaluate(() => HOAPI.G.fleets.length); if (!(n1 > sp.n)) fail(`split: no new fleet (${sp.n} -> ${n1})`); }
        await closeAll();
      }
      if (sp && await page.evaluate(() => /^(505|palm)$/.test(HO.rules(HOAPI.G).organizeFleets || ''))) {
        await page.evaluate((i) => HOAPI.openOrganize(i), sp.star); await sleep(500); await shot('group');
        if (await kind() !== 'group') fail('group fleets opened ' + await kind());
        await closeAll();
      }
      // Auto Play (opened, not run) and Radical Research (where the hand has its four projects)
      {
        await page.evaluate(() => HOAPI.openAutoPlay()); await sleep(400); await shot('auto');
        const k = await kind(); if (k !== 'auto') fail('auto play opened ' + k); await closeAll();
      }
      await page.evaluate(() => { const RH = HO.rules(HOAPI.G).radicalHand, p = HOAPI.me(); if (RH && RH.cards(HOAPI.G, p).length < 4 && Array.isArray(p.deck || [])) p.deck = [0, 1, 2, 3]; });
      const rad = await page.evaluate(() => { const RH = HO.rules(HOAPI.G).radicalHand; return !!RH && RH.cards(HOAPI.G, HOAPI.me()).length >= (RH.full || 4); });
      if (rad) { await page.evaluate(() => HOAPI.openRadicalHand()); await sleep(400); await shot('radical'); const k = await kind(); if (k !== 'radical') fail('radical research opened ' + k); await closeAll(); }
      if (errs.length) fail('page errors: ' + errs.slice(0, 2).join(' | '));
      console.log(`${problems.some(p => p.startsWith(tag)) ? 'FAIL' : 'ok  '} ${tag}  ran: ${ran.join(' ')}`); await page.context().close();
    }
  } finally { await b.close(); srv.kill(); }
  if (problems.length) { console.log('\n' + problems.join('\n')); process.exit(1); }
  console.log('\nno problems');
})().catch(e => { console.error(e); process.exit(1); });
