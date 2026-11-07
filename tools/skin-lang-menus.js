#!/usr/bin/env node
// Forgotten English in the menus: every menu title and item of the 1.2 skin, in each language, listing those identical to English.
//   NODE_PATH=$(npm root -g) [PATCH=1] [LANGS=en,fr,de,tr,es] node tools/skin-lang-menus.js [rulesets, original]
// Reports, does not fail: a word that is the same in the language ("Options", "Normal", "Offensive" in French; "Normal" in German, Spanish, Turkish) is not a gap. The Claude and Gemini
// rulesets offer English only: their "other languages" are English runs and are not meaningful. (The translations themselves are not to be changed wholesale: only a forgotten English item.)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || 'original').split(','), LANGS = (process.env.LANGS || 'en,fr,de,tr,es').split(',');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const bad = [];
  for (const rules of RULES) {
    const by = {};
    for (const lang of LANGS) {
      const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.setDefaultTimeout(10000);
      await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
      await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules); await sleep(200);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
      if (process.env.PATCH) { const pc = form.locator('input[name=patch]'); if (await pc.count()) await pc.check().catch(() => {}); }
      const lg = form.locator('select[name=lang]'); if (await lg.isVisible()) { if (await lg.locator(`option[value=${lang}]`).count()) await lg.selectOption(lang); else if (lang !== 'en') { await page.close(); continue; } }
      await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
      for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
      await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1300);
      for (let n = 0; n < 20 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
      const labels = await page.evaluate(async () => { const out = []; for (const m of document.querySelectorAll('#menubar .mbtn')) { out.push('MENU: ' + m.textContent.trim()); m.click(); await new Promise(r => setTimeout(r, 70)); for (const x of document.querySelectorAll('#menubar .dropdown.open [role=menuitem]')) { const t = x.textContent.replace(/[⌘⇧⌥].*$/, '').replace(/\s+/g, ' ').trim(); if (t) out.push(t); } document.body.click(); } return out; });
      by[lang] = labels; await page.close();
    }
    const en = by.en || [], enSet = new Set(en);
    for (const lang of LANGS.slice(1)) for (const x of (by[lang] || [])) if (enSet.has(x) && /[A-Za-z]{4,}/.test(x.replace(/^MENU: /, ''))) bad.push(`${rules} ${lang}: ${x}`);
    console.log(rules, process.env.PATCH ? '(patched)' : '(unpatched)', 'menu entries (English):', en.length, '| languages:', Object.keys(by).join(','));
  }
  const u = [...new Set(bad)]; console.log(u.length ? 'MENU TEXT SAME AS ENGLISH (' + u.length + '):\n  ' + u.join('\n  ') : 'no menu text identical to English'); await b.close(); srv.kill();
})();
