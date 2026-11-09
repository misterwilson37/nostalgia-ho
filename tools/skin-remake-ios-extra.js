#!/usr/bin/env node
// The iOS skin's remake-only controls that tools/skin-remake-ios.js and tools/skin-remake-ios-lists.js do not shoot: the Players window (a pact tap, the History button), the lists once dressed
// (none may be the classic window now), the plain "Are you sure?" box (the app's message box, data-remake="confirm"), and Force End Turn (Mac 2.0.1, a hot-seat game). Screenshots of each at a phone and an iPad size. Exit 1 on a problem.
//   NODE_PATH=$(npm root -g) node tools/skin-remake-ios-extra.js [rulesets, 405,original] [skin, ios] [shots dir]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '405,original').split(','), SKIN = process.argv[3] || 'ios', SHOTS = process.argv[4] || '';
const SIZES = { phone: { width: 844, height: 390 }, pad: { width: 1024, height: 768 } };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const problems = []; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  for (const size of Object.keys(SIZES)) for (const rules of RULES) {
    const tag = `${rules}/${size}`, fail = (m) => problems.push(`${tag}: ${m}`);
    const page = await (await b.newContext({ viewport: SIZES[size], hasTouch: true })).newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
    const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
    const hot = rules === 'mac20'; if (hot) await form.locator('select[name=humans]').selectOption('2'); await form.locator('select[name=computers]').selectOption(hot ? '1' : '2').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G); await sleep(800);
    if (hot && await page.locator('#handover button').count()) { await page.locator('#handover button').click(); await sleep(500); } // (the hot-seat cover waits for the first player)
    for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting):not(.hand)').count(); n++) { await page.locator('.card:not(.hand)').first().click().catch(() => {}); await sleep(40); }
    await page.evaluate(() => { const D = HO.rules(HOAPI.G).menuDimmed; if (D) HOAPI.G.year = D.before; });
    const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${SKIN}-${rules}-${size}-${n}.png` }); };
    const closeAll = async () => { for (let i = 0; i < 5 && await page.locator('.scrim, .ios-gscrim').count(); i++) { await page.keyboard.press('Escape'); await sleep(100); await page.evaluate(() => { const c = document.querySelector('.win .close'); if (c) c.click(); }); } };
    const kind = () => page.evaluate(() => { const e = document.querySelector('[data-remake]'); return e ? e.getAttribute('data-remake') : (document.querySelector('.scrim .win') ? 'classic' : null); });
    // players: a pact tap changes the alliance data; History opens the app's graph
    if (await page.evaluate(() => HO.feature(HOAPI.G, 'alliances'))) {
      await page.evaluate(() => HOAPI.openPlayers()); await sleep(400); await shot('players');
      if (await kind() !== 'players') fail('players opened ' + await kind());
      else {
        const a0 = await page.evaluate(() => JSON.stringify(HOAPI.me().allies || []));
        await page.locator('.ios-remake .ios-rrow .ios-bbtn').first().click(); await sleep(250); await shot('players-pact');
        if (a0 === await page.evaluate(() => JSON.stringify(HOAPI.me().allies || []))) fail('players: a pact tap changed nothing');
        await page.locator('.ios-remake .ios-bbtn').last().click(); await sleep(400);
        if (!await page.locator('.ios-gdlg').count()) fail('players: History opened nothing'); else await shot('players-history');
      }
      await closeAll();
    }
    // the dressed windows: each opens as dressed, with no page error
    for (const [n, code] of [['stars', 'HOAPI.openStarList()'], ['fleets', 'HOAPI.openFleetList()'], ['compare', 'HOAPI.openCompare()'], ['hall', "HOAPI.openHall('fame')"], ['ranks', 'HOAPI.openRanks && HOAPI.openRanks()'], ['reports', 'HOAPI.openReports()']]) {
      await page.evaluate(code).catch(() => {}); await sleep(350); const k = await kind();
      if (k === 'classic') fail(`${n} opened the classic window`); if (k) await shot('dressed-' + n); await closeAll();
    }
    // Force End Turn (hot seat, Mac 2.0.1): the app's question box with the version's two button words; the second ends the turn for the others
    if (await page.evaluate(() => !!HO.rules(HOAPI.G).forceEndTurn)) {
      const y0 = await page.evaluate(() => HOAPI.G.year); await page.evaluate(() => HOAPI.forceEndTurn()); await sleep(350); await shot('forceend');
      if (await kind() !== 'confirm') fail('force end turn is ' + await kind());
      else { const w = await page.locator('[data-remake=confirm] .ios-bbtn').allTextContents(); if (w.join('|') !== 'Wait|Force End Turn') fail('force end turn words: ' + w.join('|')); else { await page.locator('[data-remake=confirm] .ios-bbtn').last().click(); await sleep(600); if (!(await page.evaluate(() => HOAPI.G.year) > y0)) fail('force end turn: the turn did not end'); } }
      if (await page.locator('#handover button:visible').count()) { await shot('cover'); await page.locator('#handover button').click(); await sleep(500); } // (the next player's cover)
      await closeAll();
    }
    // the plain Are you sure? box is the app's
    await page.evaluate(() => HOAPI.confirmBox('Are you sure you want to do that?', () => { window.__yes = true; })); await sleep(300); await shot('confirm');
    if (await kind() !== 'confirm') fail('confirm box is ' + await kind()); else { await page.locator('[data-remake=confirm] .ios-bcheck').click(); await sleep(150); if (!await page.evaluate(() => window.__yes)) fail('confirm: the check did not go on'); }
    await closeAll();
    // a question with a ruleset's own button words: the app's text buttons carry them, the second goes on
    await page.evaluate(() => HOAPI.confirmBox('Do you really want to go on?', () => { window.__yes2 = true; }, null, ['Go on', 'Never mind'])); await sleep(300); await shot('confirm-words');
    if (await kind() !== 'confirm') fail('confirm with words is ' + await kind());
    else { const w = await page.locator('[data-remake=confirm] .ios-bbtn').allTextContents(); if (w.join('|') !== 'Never mind|Go on') fail('confirm words: ' + w.join('|')); else { await page.locator('[data-remake=confirm] .ios-bbtn').last().click(); await sleep(150); if (!await page.evaluate(() => window.__yes2)) fail('confirm with words: Go on did not go on'); } }
    await closeAll();
    if (errs.length) fail('page errors: ' + errs.slice(0, 2).join(' | '));
    console.log(`${problems.some(p => p.startsWith(tag)) ? 'FAIL' : 'ok  '} ${tag}`); await page.context().close();
  }
  await b.close(); srv.kill();
  if (problems.length) { console.log('\n' + problems.join('\n')); process.exit(1); }
  console.log('\nno problems');
})().catch(e => { console.error(e); process.exit(1); });
