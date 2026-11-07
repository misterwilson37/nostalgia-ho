// Every command of every menu, in each ruleset, early and late in a game, in a skin with a menu bar (the Mac 1.2 skin by default): reports a page
// error, the game's own "Something unexpected happened" window, and a window that will not close (Escape and its close box). It does not press
// OK on anything, so no game is changed beyond what opening a window does.
//   NODE_PATH=$(npm root -g) node tools/skin-menu-sweep.js [rulesets, comma-separated] [turns to play before each pass, e.g. 0,8] [skin]
// Why: the 1.2 skin has its own panel and windows, and a later ruleset's rules can reach a routine only 1.2's family defines (docs/12-findings.md,
// "Remake-only controls": the Build window, the list of ships bought). Chromium: PLAYWRIGHT_BROWSERS_PATH as for the other tools.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '12,dos,301,405,original,palm,claude,mac20,mac405,ios,gemini,android').split(',');
const STAGES = (process.argv[3] || '0,8').split(',').map(Number);
const SKIN = process.argv[4] || 'mac12';
const SKIP = /^(new game|quit|import|export|account|about|patch notes|suggestion box|how to play|manual|spaceward ho|auto-play this turn|force end|end turn|saved games|open|close|save|revert|skin and os|language)/i;
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const problems = [];
  for (const rules of RULES) {
    const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(6000);
    let cur = ''; const errs = []; page.on('pageerror', e => errs.push(cur + ' :: ' + e.message.slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(cur + ' :: ' + m.text().replace(/\s+/g, ' ').slice(0, 200)); });
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
    await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
    const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
    await form.locator('select[name=computers]').selectOption('3').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 });
    await sleep(600);
    const drain = async () => { for (let n = 0; n < 40 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); } };
    await drain();
    let turns = 0;
    for (const stage of STAGES) {
      while (turns < stage) { await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1300); await drain(); turns++; if (await page.evaluate(() => HOAPI.G.over)) break; }
      await page.evaluate(() => { const a = HOAPI, s = a.G.stars.find(x => x.owner === a.ME); if (s) { a.UI.sel = s.id; a.centerOn(s.id); a.renderPanel(); a.draw(); } });
      const nMenus = await page.locator('#menubar .mbtn').count(); let tried = 0;
      for (let m = 0; m < nMenus; m++) {
        const open = async () => { await page.evaluate(() => { document.body.click(); if (document.querySelector('.scrim')) { try { HOAPI.closeModal(); } catch (e) {} document.querySelectorAll('.scrim').forEach(x => x.remove()); } }); await page.locator('#menubar .mbtn').nth(m).click(); await sleep(120); };
        await open();
        const items = await page.evaluate(() => [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].map(x => ({ t: x.textContent.replace(/⌘.*/, '').trim(), off: x.disabled, chk: x.classList.contains('check') })));
        for (const it of items) {
          if (it.off || it.chk || !it.t || SKIP.test(it.t)) continue;
          cur = `${rules} t${stage} [${m}] ${it.t}`; tried++;
          await open();
          await page.evaluate((label) => { const x = [...document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')].find(e => e.textContent.replace(/⌘.*/, '').trim() === label); if (x) x.click(); }, it.t);
          await sleep(260);
          const bug = await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w && /unexpected happened/i.test(w.textContent) ? (w.querySelector('pre') || {}).textContent : ''; });
          if (bug) errs.push(cur + ' :: BUG WINDOW: ' + bug.replace(/\s+/g, ' ').slice(0, 200));
          await page.evaluate(() => { if (window.HOAPI && HOAPI.closeScreen && document.querySelector('.hoscreen')) HOAPI.closeScreen(); });
          for (let k = 0; k < 4 && await page.locator('.scrim').count(); k++) { await page.keyboard.press('Escape'); await sleep(120); if (await page.locator('.scrim').count()) { const x = page.locator('.scrim .close:visible'); if (await x.count()) await x.last().click({ timeout: 1500 }).catch(() => {}); await sleep(80); } }
          if (await page.locator('.scrim').count()) { errs.push(cur + ' :: A WINDOW THAT WILL NOT CLOSE (close box and Escape): ' + (await page.evaluate(() => { const w = document.querySelector('.scrim .win'); return w ? w.className + ' / ' + ((w.querySelector('.wtitle span') || {}).textContent || w.textContent.slice(0, 40)) : '?'; }))); await page.evaluate(() => { try { HOAPI.closeModal(); } catch (e) {} document.querySelectorAll('.scrim').forEach(x => x.remove()); }); }
        }
        await page.evaluate(() => document.body.click());
      }
      console.log(`${rules} stage ${stage}: ${tried} commands tried, ${errs.length} problem(s)`);
    }
    for (const e of [...new Set(errs)]) { console.log('   !! ' + e); problems.push(e); }
    await page.close();
  }
  console.log(problems.length ? `\n${problems.length} PROBLEMS` : '\nno problems'); await b.close(); srv.kill();
})();
