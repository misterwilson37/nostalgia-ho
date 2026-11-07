#!/usr/bin/env node
// The online screens in each language, against the fake Firebase (tools/online-fake.js): the Account window, the lobby of a game hosted from New Game > Play online..., and the Join form,
// listing every text identical to English. Reports, does not fail: the example email, the galaxy and version names and "Code:" in German are not gaps.
//   NODE_PATH=$(npm root -g) node tools/skin-lang-online.js
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const fake = require('./online-fake.js');
const LANGS = ['en', 'fr', 'de', 'tr', 'es'];
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch(); const seen = {}; const errs = [];
  const texts = (pg) => pg.evaluate(() => { const w = document.querySelector('.scrim .win'); if (!w) return []; const out = []; const walk = (n) => { if (n.nodeType === 3) { const x = n.textContent.replace(/\s+/g, ' ').trim(); if (x) out.push(x); } else if (n.nodeType === 1 && n.getAttribute('translate') !== 'no' && !/^(SCRIPT|STYLE|OPTION)$/.test(n.tagName)) { if (n.placeholder) out.push(n.placeholder); n.childNodes.forEach(walk); } }; walk(w); return out; });
  const setTitleLang = (pg, l) => pg.evaluate((l) => { const s = [...document.querySelectorAll('select')].find(x => [...x.options].some(o => o.value === 'fr') && [...x.options].some(o => o.value === 'en')); if (s) { s.value = l; s.dispatchEvent(new Event('change', { bubbles: true })); return true; } return false; }, l);
  for (const lang of LANGS) {
    const server = fake.create(); const c1 = await b.newContext({ viewport: { width: 1100, height: 800 } }); await fake.install(c1, server); const host = await c1.newPage(); host.on('dialog', d => d.accept()); host.setDefaultTimeout(12000); host.on('pageerror', e => errs.push(lang + ' ' + e.message));
    const got = {};
    await host.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } } catch (e) {} });
    await host.goto('http://localhost:8000/?skin=mac12'); await host.waitForSelector('#tnew', { state: 'visible' }); await setTitleLang(host, lang); await sleep(500);
    await host.click('#tacct'); await host.waitForSelector('.cloudform'); got.AccountSignedOut = await texts(host);
    await host.click('.scrim .win button >> nth=-1').catch(() => {}); // the last button: Play as a guest
    await sleep(1500); const w1 = await texts(host); if (w1.length) got.AccountAfter = w1; await host.keyboard.press('Escape'); await sleep(300);
    await host.click('#tnew'); const form = host.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption('405'); await sleep(200); { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption('mac12'); }
    const lg = form.locator('select[name=lang]'); if (await lg.isVisible() && await lg.locator(`option[value=${lang}]`).count()) await lg.selectOption(lang);
    await form.locator('select[name=computers]').selectOption('1').catch(() => {}); await form.locator('select[name=humans]').selectOption('2').catch(() => {});
    if (lang === 'en') globalThis.__idx = await form.locator('button').evaluateAll(bs => bs.findIndex(x => x.textContent.trim() === 'Play online…'));
    const online = form.locator('button').nth(globalThis.__idx);
    got.NewGameOnlineButton = [await online.textContent().catch(() => '(none)')];
    await online.click().catch(() => {}); await host.waitForSelector('.lobby .lobbycode .code', { timeout: 15000 }).catch(() => {});
    const code = ((await host.textContent('.lobby .lobbycode .code').catch(() => '')) || '').trim(); got.Lobby = await texts(host);
    if (code) { const c2 = await b.newContext({ viewport: { width: 1100, height: 800 } }); await fake.install(c2, server); const g = await c2.newPage(); g.setDefaultTimeout(12000); await g.addInitScript(() => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); sessionStorage.setItem('x', '1'); } } catch (e) {} });
      await g.goto('http://localhost:8000/?skin=mac12'); await g.waitForSelector('#tnew', { state: 'visible' }); await setTitleLang(g, lang); await sleep(400); await g.goto(`http://localhost:8000/?skin=mac12&join=${code}`).catch(() => {}); await g.waitForSelector('form.newgame input[name=code]', { timeout: 15000 }).catch(() => {}); got.JoinForm = await g.evaluate(() => { const w = document.querySelector('.scrim .win') || document.querySelector('form.newgame'); if (!w) return []; const out = []; const walk = (n) => { if (n.nodeType === 3) { const x = n.textContent.replace(/\s+/g, ' ').trim(); if (x) out.push(x); } else if (n.nodeType === 1 && !/^(SCRIPT|STYLE|OPTION)$/.test(n.tagName)) { if (n.placeholder) out.push(n.placeholder); n.childNodes.forEach(walk); } }; walk(w); return out; }); await c2.close(); }
    seen[lang] = got; await c1.close();
  }
  const bad = []; let n = 0;
  for (const [k, en] of Object.entries(seen.en || {})) { n += en.length; const enSet = new Set(en); for (const lang of LANGS.slice(1)) for (const x of (seen[lang][k] || [])) if (enSet.has(x) && /[A-Za-z]{4,}/.test(x) && !/^[\d\s.,:$€%()\/+−-]+$/.test(x)) bad.push(`${lang} [${k}] ${x.slice(0, 90)}`); }
  console.log('screens captured in English:', Object.keys(seen.en || {}).map(k => k + '(' + seen.en[k].length + ')').join(', '));
  const u = [...new Set(bad)]; console.log(u.length ? 'SAME AS ENGLISH (' + u.length + '):\n  ' + u.join('\n  ') : 'nothing identical to English'); console.log(errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 3)) : 'no page errors'); await b.close(); srv.kill();
})();
