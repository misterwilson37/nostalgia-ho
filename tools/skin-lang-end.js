#!/usr/bin/env node
// The end of a game in each language: the win and lose windows, the end card and the windows of its "You won…" and "Tell us how it went" buttons (the situation staged as
// tools/skin-endgame.js does), and what is still the same as English. Reports, does not fail (see tools/skin-lang-screens.js for how the result is judged).
//   NODE_PATH=$(npm root -g) [PATCH=1] [LANGS=en,fr,de,tr,es] node tools/skin-lang-end.js [rulesets, 301,405,original]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '301,405,original').split(','), LANGS = (process.env.LANGS || 'en,fr,de,tr,es').split(',');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const bad = [];
  for (const rules of RULES) for (const mode of ['conquer', 'lose']) {
    const byLang = {};
    for (const lang of LANGS) {
      const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
      await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
      await page.goto('http://localhost:8000/?skin=mac12'); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
      const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules); await sleep(200);
      { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
      if (process.env.PATCH) { const pc = form.locator('input[name=patch]'); if (await pc.count()) await pc.check().catch(() => {}); }
      const lg = form.locator('select[name=lang]'); if (await lg.isVisible()) { if (await lg.locator(`option[value=${lang}]`).count()) await lg.selectOption(lang); else if (lang !== 'en') { await page.close(); continue; } }
      await form.locator('select[name=computers]').selectOption('2').catch(() => {});
      await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
      const drain = async () => { for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); } };
      await drain(); await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1400); await drain(); await page.evaluate(() => document.querySelectorAll('.scrim').forEach(x => x.remove()));
      await page.evaluate((mode) => { const a = HOAPI, g = a.G, ME = a.ME, ai = g.players.filter(p => !p.human && p.alive); const who = mode === 'conquer' ? ai : [g.players[ME]]; for (const p of who) { for (const s of g.stars) if (s.owner === p.id) { s.owner = -1; s.pop = 0; } p.alive = false; delete p.slots301; } g.fleets = g.fleets.filter(f => !who.some(p => p.id === f.owner)); }, mode);
      await page.evaluate(() => { const c = document.querySelector('#msg .clock'); if (c) c.click(); }); await sleep(1600);
      const got = [];
      for (let step = 0; step < 40; step++) {
        const st = await page.evaluate(() => { const w = document.querySelector('.scrim .win'); if (w) return { k: 'w', t: [...w.querySelectorAll('*')].filter(e => e.children.length === 0 || e.tagName === 'P').map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean), b: [...w.querySelectorAll('button')].filter(x => !x.classList.contains('close') && !x.disabled).map(x => x.textContent.trim()) }; const e = document.querySelector('#msg .card.end'); if (e) return { k: 'e', t: [e.textContent.replace(/\s+/g, ' ').trim()], b: [...e.querySelectorAll('button')].map(x => x.textContent.trim()) }; const c = document.querySelector('#msg .card:not(.waiting)'); if (c) return { k: 'c', t: [c.textContent.replace(/\s+/g, ' ').trim()] }; return { k: 'n', t: [] }; });
        if (st.k === 'n') break;
        got.push(...st.t, ...(st.b || []));
        if (st.k === 'e') { // the end card's two buttons' windows
          for (const idx of [0, 2]) { const ok = await page.evaluate((i) => { const bs = [...document.querySelectorAll('#msg .card.end button')]; if (bs[i] && !/New game/i.test(bs[i].textContent)) { bs[i].click(); return true; } return false; }, idx); if (ok) { await sleep(600); const w = await page.evaluate(() => { const x = document.querySelector('.scrim .win'); return x ? [...x.querySelectorAll('*')].filter(e => e.children.length === 0 || e.tagName === 'P').map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).concat([...x.querySelectorAll('button')].map(y => y.textContent.trim())) : []; }); got.push(...w); await page.evaluate(() => document.querySelectorAll('.scrim').forEach(x => x.remove())); } }
          break; }
        if (st.k === 'w') { await page.evaluate(() => { const bs = [...document.querySelectorAll('.scrim .win button')].filter(x => !x.classList.contains('close') && !x.disabled); const x = bs.find(y => /^Not now/i.test(y.textContent.trim())) || bs[bs.length - 1]; if (x) x.click(); else document.querySelector('.scrim').remove(); }); await sleep(450); } else { await page.locator('#msg .card').first().click().catch(() => {}); await sleep(250); }
      }
      byLang[lang] = got; await page.close();
    }
    const en = new Set(byLang.en || []); const n = (byLang.en || []).length;
    for (const lang of LANGS.slice(1)) for (const x of (byLang[lang] || [])) if (en.has(x) && /[A-Za-z]{4,}/.test(x) && !/^[\d\s.,:$€%()\/+−-]+$/.test(x)) bad.push(`${rules} ${mode} ${lang}: ${x.slice(0, 100)}`);
    console.log(rules, mode, '- English run saw', n, 'texts; languages checked:', Object.keys(byLang).join(','));
  }
  const u = [...new Set(bad)]; console.log(u.length ? 'SAME AS ENGLISH (' + u.length + '):\n  ' + u.join('\n  ') : 'nothing identical to English'); await b.close(); srv.kill();
})();
