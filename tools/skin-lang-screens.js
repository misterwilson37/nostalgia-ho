#!/usr/bin/env node
// Every window the 1.2 skin can open, in each language, and what is still the same as English.
//   NODE_PATH=$(npm root -g) [PATCH=1] [LANGS=en,fr,de,tr,es] node tools/skin-lang-screens.js [rulesets, original]
// Opens about 25 windows (About, Help, Reports, Split, Account, Hall, Compare, Players, Ranks, Give, Message, Dip, Surrender, Auto Play, Build, Preferences, Skin, Sounds,
// Temperatures, Organize, Skills, Radical, Scrap types, the fleet and star lists) in the game's language and lists every text identical to English. It REPORTS, it does not fail: what is
// left is judged by the rule (docs/12-findings.md, "The language rule"): a word is English only if it stayed English in the nearest published edition of that language (the French iOS for the 5.0.5 family,
// then 3.0.1F, then 1.2F), and the patched game (PATCH=1) has the best translation regardless. Cognates ("Metal", "Start", "Name", "Mini"), names and dates are not gaps.
// The Claude and Gemini rulesets offer English only, so the other languages are skipped for them.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || 'original').split(','), LANGS = (process.env.LANGS || 'en,fr,de,tr,es').split(',');
const OPEN = { About: 'HOAPI.openAbout()', Help: 'HOAPI.openHelp()', Reports: 'HOAPI.openReports()', Split: 'const a = HOAPI, f = a.G.fleets.find(f => f.owner === a.ME && Object.values(f.ships).reduce((x, y) => x + y, 0) > 1 && f.star != null); f && a.openSplit(f)', Account: 'HOAPI.openAccount()', Hall: "HOAPI.openHall('fame')", Compare: 'HOAPI.openCompare()', Players: 'HOAPI.openPlayers()', Ranks: 'HOAPI.openRanks()', Give: 'HOAPI.openGive()', Chat: 'HOAPI.openChat()', Dip: 'HOAPI.openDip()', Surrender: 'HOAPI.openSurrender()', AutoPlay: 'HOAPI.openAutoPlay()', Build: 'HOAPI.openBuild(HOAPI.G.stars.find(s => s.owner === HOAPI.ME).id)', Prefs: 'HOAPI.openPrefs()', Skin: 'HOAPI.openSkin()', Sounds: 'HOAPI.openSounds()', Temperature: 'HOAPI.openTemperature()', Organize: 'HOAPI.openOrganize(HOAPI.G.stars.find(s => s.owner === HOAPI.ME).id)', Skills: 'HOAPI.openSkills()', Radical: 'HOAPI.openRadicalHand()', Scrap: 'HOAPI.openScrapTypes()', FleetList: 'HOAPI.openFleetList()', StarList: 'HOAPI.openStarList()' };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const bad = []; let opened = 0;
  for (const rules of RULES) {
    const texts = {};
    for (const lang of LANGS) {
      const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(10000);
      await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
      await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules); await sleep(250);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); } if (process.env.PATCH) { const pc = form.locator('input[name=patch]'); if (await pc.count()) await pc.check().catch(() => {}); } const lg = form.locator('select[name=lang]'); if (await lg.isVisible()) { if (await lg.locator(`option[value=${lang}]`).count()) await lg.selectOption(lang); else if (lang !== 'en') { await page.close(); continue; } } else if (lang !== 'en') { await page.close(); continue; }
      await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      console.log('  starting', rules, lang); await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }).catch(async e => { console.log('  START FAILED', rules, lang, await page.evaluate(() => (document.querySelector('.scrim .win') || {}).textContent || 'no window').then(t => t.slice(0, 160))); throw e; }); await sleep(600);
      for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
      await page.evaluate(() => { const a = HOAPI, p = a.me(); p.savings = 200000; p.metal = 50000; const s = a.G.stars.find(x => x.owner === a.ME); a.UI.sel = s.id; for (const t of ['fighter', 'scout']) { const d = p.designs.find(x => x.type === t && !x.scrapped); if (d) try { HO.buildShips(a.G, a.ME, s.id, d.id, 3); } catch (e) {} } p.deck = [0, 1, 2]; p.hand405 = 7; });
      await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1300); for (let n = 0; n < 20 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
      for (const [k, code] of Object.entries(OPEN)) {
        await page.evaluate(() => { document.querySelectorAll('.scrim').forEach(x => x.remove()); document.querySelectorAll('.hoscreen').forEach(x => x.remove()); });
        try { await page.evaluate(code.includes('const ') ? `(() => { ${code} })()` : code); } catch (e) { continue; } await sleep(260);
        const t = await page.evaluate(() => { const w = document.querySelector('.scrim .win') || document.querySelector('.hoscreen'); if (!w) return null; const out = []; const walk = (n) => { if (n.nodeType === 3) { const x = n.textContent.replace(/\s+/g, ' ').trim(); if (x) out.push(x); } else if (n.nodeType === 1 && n.getAttribute('translate') !== 'no' && !/^(SCRIPT|STYLE|CANVAS|OPTION|IFRAME)$/.test(n.tagName)) n.childNodes.forEach(walk); }; walk(w); return out; });
        if (t) { (texts[k] = texts[k] || {})[lang] = t; if (lang === 'en') opened++; }
      }
      await page.close();
    }
    for (const [k, byLang] of Object.entries(texts)) { const en = new Set(byLang.en || []); for (const lang of LANGS.slice(1)) for (const x of (byLang[lang] || [])) if (en.has(x) && /[A-Za-z]{4,}/.test(x) && !/^[\d\s.,:$€%()\/+−-]+$/.test(x)) bad.push(`${rules} ${lang} [${k}] ${x.slice(0, 80)}`); }
    console.log(rules, process.env.PATCH ? '(PATCH ON)' : '(unpatched)', 'windows opened in English:', Object.keys(texts).length, 'of', Object.keys(OPEN).length);
  }
  const u = [...new Set(bad)]; console.log(u.length ? 'SAME AS ENGLISH (' + u.length + '):\n  ' + u.join('\n  ') : 'nothing identical to English'); await b.close(); srv.kill();
})();
