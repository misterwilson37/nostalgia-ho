#!/usr/bin/env node
// The iOS skin's remake-only controls in each language: opens each native control in English and in fr, de, tr, es and lists the words a player sees (outside translate="no": names, figures)
// that are the same as the English ones. Cognates ("Metal", "Players") and a ruleset's own text the page never translates are listed too: judge them by the language rule (docs/translations.md).
//   NODE_PATH=$(npm root -g) node tools/skin-remake-ios-lang.js [rulesets, original,405,dos] [langs, fr,de,tr,es]
// Exit 1 only on a page error or a window that did not open. (Rulesets without the language in their New Game choices are skipped.)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || 'original,405,dos').split(','), LANGS = (process.argv[3] || 'fr,de,tr,es').split(',');
const OPEN = [['give', 'HOAPI.openGive()'], ['chat', 'HOAPI.openChat()'], ['surrender', 'HOAPI.openSurrender()'], ['fix', 'HOAPI.openFixSpending()'], ['dip', 'HOAPI.openDip()'], ['armageddon', 'HOAPI.toggleArmageddon()'], ['types', 'HOAPI.openScrapTypes()'], ['players', 'HOAPI.openPlayers()'],
  ['queue', "HOAPI.openBuild((HOAPI.G.stars.find(x => x.owner === HOAPI.ME) || {}).id)"], ['confirm', "HOAPI.confirmBox('Are you sure?', () => {})"],
  ['stars', 'HOAPI.openStarList()'], ['fleets', 'HOAPI.openFleetList()'], ['reports', 'HOAPI.openReports()'], ['temps', 'HOAPI.openTemperature()'], ['auto', 'HOAPI.openAutoPlay()'],
  ['compare', 'HOAPI.G.year = 2030; HOAPI.openCompare()'], ['skills', 'HOAPI.openSkillsList()'], ['hall', "HOAPI.hasHall(HOAPI.G) && HOAPI.openHall('fame')"], ['ranks', 'HOAPI.G.rules === \'original\' && HOAPI.openRanks()']];
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); let bad = 0;
  const words = async (rules, lang) => {
    const page = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(([l]) => { try { localStorage.clear(); localStorage.setItem('ho5.language', l); localStorage.setItem('ho5.language.at', String(Date.now())); } catch (e) {} }, [lang]);
    await page.goto('http://localhost:8000/?skin=ios'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
    const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
    const lg = form.locator('select[name=lang]'); if (await lg.count() && await lg.isVisible()) { if (!await lg.locator(`option[value=${lang}]`).count()) { await page.context().close(); return null; } await lg.selectOption(lang); }
    else if (lang !== 'en') { await page.context().close(); return null; }
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('ios'); } await form.locator('select[name=computers]').selectOption('2').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G); await sleep(800);
    for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
    await page.evaluate(() => { const D = HO.rules(HOAPI.G).menuDimmed; if (D) HOAPI.G.year = D.before; const p = HOAPI.me(); p.savings = 100000; p.metal = 5000; });
    const out = {};
    for (const [n, code] of OPEN) {
      await page.evaluate(code).catch(() => {}); await sleep(300);
      out[n] = await page.evaluate(() => { const d = document.querySelector('[data-remake]'); if (!d) return null; const r = []; const w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT); let x; while ((x = w.nextNode())) { const t = x.textContent.trim(); if (t && !x.parentElement.closest('[translate=no]') && /[A-Za-z]{2}/.test(t)) r.push(t); } return r; });
      for (let i = 0; i < 4 && await page.locator('.scrim, .ios-gscrim').count(); i++) { await page.keyboard.press('Escape'); await sleep(100); await page.evaluate(() => { const c = document.querySelector('.ios-gdlg .ios-gx, .ios-gdlg .ios-bcancel'); if (c) c.click(); }); }
    }
    if (errs.length) { bad++; console.log(`${rules}/${lang}: page errors ${errs.slice(0, 2).join(' | ')}`); }
    await page.context().close(); return out;
  };
  for (const rules of RULES) {
    const en = await words(rules, 'en'); if (!en) continue;
    for (const lang of LANGS) {
      const o = await words(rules, lang); if (!o) { console.log(`${rules}/${lang}: (not offered)`); continue; }
      const same = [];
      for (const n of Object.keys(en)) { if (en[n] && !o[n]) { bad++; console.log(`${rules}/${lang}: ${n} did not open`); continue; } if (!en[n]) continue; for (const t of en[n]) if (o[n].includes(t) && !same.includes(`${n}: ${t}`)) same.push(`${n}: ${t}`); }
      console.log(`${rules}/${lang}: ${same.length ? same.length + ' the same as English:\n   ' + same.join('\n   ') : 'every word differs'}`);
    }
  }
  await b.close(); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
