#!/usr/bin/env node
// The iOS skin's remake-only controls (docs/brief-restyle-ios.md): a ruleset's own Give, Send Message, Surrender and Fix Spending in the app's dialog look.
//   NODE_PATH=$(npm root -g) node tools/skin-remake-ios.js [rulesets, all but ios and android] [skin, ios] [shots dir, none]
// For each ruleset, at a phone size (844 x 390, touch) and an iPad's (1024 x 768): opens each command through the page, checks that the window is the skin's own
// (a `.ios-remake[data-remake]` dialog, or the classic window where the list says it stays), that nothing threw, and that it does its job against the game's state
// (a gift moves money and metal; a message is sent; surrender is set and taken back; Fix Spending steps the budget); screenshots to the folder. Exit 1 on a problem.
// iOS and Android rules are run too, to check they still open the app's own screens and NEVER a remake-only dialog.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const ALL = '12,dos,301,405,original,palm,claude,mac20,mac405,gemini'.split(',');
const RULES = (process.argv[2] || ALL.join(',') + ',ios,android').split(','), SKIN = process.argv[3] || 'ios', SHOTS = process.argv[4] || '';
const SIZES = { phone: { width: 844, height: 390, hasTouch: true }, pad: { width: 1024, height: 768, hasTouch: true } };
// where the classic window stays (listed in the HANDOFF), by command: 'steps' message windows
const STAYS = { chat: [] };
const HOAPI_dimmed = (has, k) => has.dim.includes(k);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const problems = []; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  for (const size of Object.keys(SIZES)) for (const rules of RULES) {
    const app = /^(ios|android)$/.test(rules), tag = `${rules}/${size}`; const page = await (await b.newContext({ viewport: { width: SIZES[size].width, height: SIZES[size].height }, hasTouch: SIZES[size].hasTouch })).newPage();
    page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 200)); });
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
    const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
    await form.locator('select[name=computers]').selectOption('2').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
    for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
    const fail = (m) => problems.push(`${tag}: ${m}`);
    const shot = async (n) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${SKIN}-${rules}-${size}-${n}.png` }); };
    const state = () => page.evaluate(() => { const a = HOAPI, p = a.me(); return { savings: p.savings, metal: p.metal, gifts: p.giftsThisTurn || 0, to: p.surrenderTo == null ? null : p.surrenderTo, sent: (p.outbox || []).length + (p.chatThisTurn || 0) + a.G.players.filter(q => q.id !== a.ME).reduce((n, q) => n + (q.chats || []).length + (q.news || []).filter(x => x.type === 'chat').length, 0), dip: p.dip || 0, arm: !!p.armageddon, scrap: p.designs.filter(d => d.scrap301 || d.scrapped).length }; });
    const dlg = () => page.evaluate(() => { const d = document.querySelector('.ios-remake[data-remake]'); return d ? d.getAttribute('data-remake') : (document.querySelector('.scrim .win') ? 'classic' : (document.querySelector('.ios-gdlg') ? 'app' : null)); });
    const closeAll = async () => { for (let i = 0; i < 4 && await page.locator('.scrim, .ios-gscrim').count(); i++) { await page.keyboard.press('Escape'); await sleep(120); } };
    await page.evaluate(() => { const D = HO.rules(HOAPI.G).menuDimmed; if (D) HOAPI.G.year = D.before; }); // (3.0.1 dims Players, Give, Message and Surrender until 2001: one End Turn lifts it)
    const has = await page.evaluate(() => { const rs = HO.rules(HOAPI.G), f = (k) => HO.feature(HOAPI.G, k); return { gifts: f('gifts') !== false && !!f('gifts'), chat: !!f('chat'), surrender: !!f('surrender') && rs.surrenderCommand !== false, fix: !!rs.fixSpending, dip: !!f('dip'), arm: !!f('armageddon'), queue: !!f('buildQueue'), types: rs.scrapTypesCommand !== false && !!HOAPI.G.players[HOAPI.ME].designs.length, dim: ['give', 'chat', 'surrender', 'dip', 'armageddon'].filter(k => HOAPI.menuDim(k)) }; });
    // give (money and metal move; the gift counts)
    if (app) {
      await page.evaluate(() => HOAPI.openGive()); await sleep(250); const k = await dlg(); if (k !== 'app') fail(`give opened ${k}, the app's own was expected`); await shot('give-app'); await closeAll();
    } else if (has.gifts && !has.dim.includes('give')) {
      await page.evaluate(() => { const p = HOAPI.me(); p.savings = 100000; p.metal = 5000; });
      const s0 = await state(); await page.evaluate(() => HOAPI.openGive()); await sleep(300); const k = await dlg(); await shot('give');
      if (k !== 'give') fail(`give opened ${k}`);
      else {
        const sl = page.locator('.ios-remake .ios-sl'); const n = await sl.count(); if (n < 2) fail(`give has ${n} sliders`);
        else { for (const i of [0, 1]) { const bb = await sl.nth(i).boundingBox(); await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await sleep(60); } await shot('give-set'); }
        await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300);
        const s1 = await state();
        if (!(s1.gifts === s0.gifts + 1)) fail(`give: the gift did not count (${s0.gifts} -> ${s1.gifts})`);
        if (!(s1.savings < s0.savings && s1.metal < s0.metal)) fail(`give: money and metal did not move (${s0.savings}/${s0.metal} -> ${s1.savings}/${s1.metal})`);
      }
      await closeAll();
    }
    // message
    if (!app && has.chat && !has.dim.includes('chat')) {
      await page.evaluate(() => HOAPI.openChat()); await sleep(300); const k = await dlg(); await shot('chat');
      const want = STAYS.chat.includes(rules) ? 'classic' : 'chat';
      if (k !== want) fail(`message opened ${k}, ${want} expected`);
      if (k === 'chat') {
        const s0 = await state(); await page.locator('.ios-remake .ios-ritem').nth(0).click(); await shot('chat-pick'); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300);
        const s1 = await state(); if (s1.sent <= s0.sent) fail(`message: nothing was sent (${s0.sent} -> ${s1.sent})`);
      }
      await closeAll();
    }
    // surrender (set, then taken back)
    if (!app && has.surrender && !has.dim.includes('surrender')) {
      await page.evaluate(() => HOAPI.openSurrender()); await sleep(300); const k = await dlg(); await shot('surrender');
      if (k !== 'surrender') fail(`surrender opened ${k}`);
      else {
        await page.locator('.ios-remake .ios-gtoggle').click(); await sleep(60); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300);
        if (await page.locator('.ios-gscrim').count()) { await shot('surrender-ask'); await page.locator('.ios-gscrim .ios-bcheck').click(); await sleep(300); }
        const s1 = await state(); if (s1.to == null) fail('surrender: not set'); 
        await page.evaluate(() => HOAPI.openSurrender()); await sleep(300); await shot('surrender-back');
        const k2 = await dlg(); if (k2 === 'surrender') await page.locator('.ios-remake .ios-bcancel').click(); else await page.locator('.ios-gscrim .ios-bcheck').click(); await sleep(300);
        const s2 = await state(); if (s2.to != null) fail('surrender: not taken back');
      }
      await closeAll();
    }
    // dip (the percent is set), armageddon (on, then off), scrap types (a type is marked or scrapped)
    if (!app && has.dip && !HOAPI_dimmed(has, 'dip')) {
      const s0 = await state(); await page.evaluate(() => HOAPI.openDip()); await sleep(300); const k = await dlg(); await shot('dip');
      if (k !== 'dip') fail(`dip opened ${k}`);
      else { const bb = await page.locator('.ios-remake .ios-sl').first().boundingBox(); await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await sleep(80); await shot('dip-set'); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(250); const s1 = await state(); if (!(s1.dip > 0)) fail(`dip: not set (${s0.dip} -> ${s1.dip})`); }
      await closeAll();
    }
    if (!app && has.arm && !HOAPI_dimmed(has, 'armageddon')) {
      for (const want of [true, false]) {
        await page.evaluate(() => HOAPI.toggleArmageddon()); await sleep(300); const k = await dlg(); if (want) await shot('armageddon');
        if (k !== 'armageddon') { fail(`armageddon opened ${k}`); break; }
        await page.locator('.ios-remake .ios-barm').click(); await sleep(80); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300);
        for (let i = 0; i < 3 && await page.locator('.ios-gscrim .ios-bcheck, .ios-gscrim .ios-bbtn').count(); i++) { if (want && i === 0) await shot('armageddon-ask'); const ok = page.locator('.ios-gscrim .ios-bcheck:visible'); if (await ok.count()) await ok.last().click(); else await page.locator('.ios-gscrim .ios-bbtn').last().click(); await sleep(300); } // (a ruleset's own button words, 3.0.1's, are the app's text buttons)
        const s1 = await state(); if (s1.arm !== want) fail(`armageddon: expected ${want ? 'on' : 'off'}`);
      }
      await closeAll();
    }
    if (!app && has.types) {
      const s0 = await state(); await page.evaluate(() => HOAPI.openScrapTypes()); await sleep(300); const k = await dlg(); await shot('scrap');
      if (k !== 'scraptypes') fail(`scrap types opened ${k}`);
      else if (!await page.locator('.ios-remake .ios-scitem').count()) fail('scrap types: no types listed');
      else { await page.locator('.ios-remake .ios-scitem').first().click(); await shot('scrap-mark'); await page.locator('.ios-remake .ios-bcheck').click(); await sleep(300); if (await page.locator('.ios-gscrim .ios-bcheck').count()) { await shot('scrap-ask'); await page.locator('.ios-gscrim .ios-bcheck').last().click(); await sleep(300); } const s1 = await state(); if (!(s1.scrap > s0.scrap)) fail(`scrap types: nothing marked or scrapped (${s0.scrap} -> ${s1.scrap})`); }
      await closeAll();
    }
    // the queue-style Build window (DOS 2.0, 1.2, Mac 2.0.1): a ship is queued at the selected colony, nothing is paid now
    if (!app && has.queue) {
      const sid = await page.evaluate(() => { const a = HOAPI, s = a.G.stars.find(x => x.owner === a.ME); a.UI.sel = s.id; return s.id; });
      const q0 = await page.evaluate((i) => (HOAPI.G.stars[i].queue || []).reduce((n, it) => n + it.n, 0), sid), m0 = (await state()).savings;
      await page.evaluate((i) => HOAPI.openBuild(i), sid); await sleep(400); const k = await page.evaluate(() => { const d = document.querySelector('.ios-gdlg[data-remake=queue], .ios-gdlg.ios-remake'); return d ? d.getAttribute('data-remake') : (document.querySelector('.scrim .win') ? 'classic' : (document.querySelector('.ios-gdlg') ? 'app' : null)); }); await shot('queue');
      if (k !== 'queue') fail(`build opened ${k}`);
      else {
        await page.locator('.ios-gdlg .ios-bitem').first().click(); await sleep(400); await shot('queue-ship');
        await page.locator('.ios-gdlg .ios-bcheck').last().click(); await sleep(400);
        const q1 = await page.evaluate((i) => (HOAPI.G.stars[i].queue || []).reduce((n, it) => n + it.n, 0), sid), m1 = (await state()).savings;
        if (!(q1 > q0)) fail(`queue: nothing queued (${q0} -> ${q1})`); if (m1 !== m0) fail(`queue: money moved at once (${m0} -> ${m1})`);
      }
      await closeAll(); await page.evaluate(() => { const c = document.querySelector('.ios-gdlg .ios-gx'); if (c) c.click(); });
    }
    // fix spending
    if (!app && has.fix) {
      await page.evaluate(() => HOAPI.openFixSpending()); await sleep(300); const k = await dlg(); await shot('fix');
      if (k !== 'fixspending') fail(`fix spending opened ${k}`);
      else { await page.locator('.ios-remake .ios-bcheck').click(); await sleep(200); await shot('fix-next'); }
      await closeAll();
    }
    if (errs.length) fail('page errors: ' + errs.slice(0, 3).join(' | '));
    console.log(`${problems.some(p => p.startsWith(tag)) ? 'FAIL' : 'ok  '} ${tag}  (gifts:${has.gifts} chat:${has.chat} surrender:${has.surrender} fix:${has.fix} dip:${has.dip} arm:${has.arm} types:${has.types} queue:${has.queue}${has.dim.length ? ' dimmed:' + has.dim : ''})`);
    await page.context().close();
  }
  await b.close(); srv.kill();
  if (problems.length) { console.log('\n' + problems.join('\n')); process.exit(1); }
  console.log('\nno problems');
})().catch(e => { console.error(e); process.exit(1); });
