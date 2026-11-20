// FONT AUDIT: which font file does every visible piece of text really render in? (docs/brief-bitmap-fonts.md)
//   NODE_PATH=$(npm root -g) node tools/font-audit.js <skin> <ruleset> [os look]        e.g.  mac4 405   |   dos dos win31   |   w95 405 win95   |   palm palm
// Serve the repo first (python3 -m http.server 8000; another address: URL=http://host:port). It plays through the title, New Game, the game screen, each menu, About, Help, Skills, Hall,
// Reports, Account, Split and a toast, asks Chrome (CDP CSS.getPlatformFontsForNode) for the font behind each text and lists what came out in a SYSTEM font; "offenders: 0" is clean.
// Env: OFF=1 lists pixel-font text drawn off its font's native size; SHOT=<png> saves the game screen; ALL=1 lists every font used. It cannot see canvas text; deliberate Arial (the
// Windows program's own) shows up as an offender.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.URL || 'http://localhost:8000', SKIN = process.argv[2], RULES = process.argv[3], OSID = process.argv[4] || '';
const GOOD = { mac: /^(DOS Chicago 12|DOS Geneva 9( Bold)?)$/, dos: /^(DOS Bios|DOS Geneva 9( Bold)?|DOS Chicago 12|IBM VGA 9x16)$/, amiga: /^(Topaz|Ho\w+)/ };
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
  await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} });
  const collect = async (label) => {
    const r = await page.evaluate(() => {
      const out = {};
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        const t = n.nodeValue.trim(); if (!t) continue; const e = n.parentElement; if (!e || /^(SCRIPT|STYLE|OPTION)$/.test(e.tagName)) continue;
        const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
        const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); const key = fam + ' ' + cs.fontSize + (cs.fontWeight !== '400' ? ' w' + cs.fontWeight : '');if(!e.dataset.fa){window.__fa=(window.__fa||0)+1;e.dataset.fa='x'+window.__fa;}
        const sel = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
        (out[key] = out[key] || []).push(sel + ' "' + t.slice(0, 22) + '"|' + e.dataset.fa);
      } return out; });
    const cdp = await page.context().newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); const doc = await cdp.send('DOM.getDocument', {depth: 0});
    for (const [k, v] of Object.entries(r)) { const id = v[0].split('|').pop(); let fonts = '?'; try { const q = await cdp.send('DOM.querySelector', {nodeId: doc.root.nodeId, selector: '[data-fa=' + id + ']'}); const f = await cdp.send('CSS.getPlatformFontsForNode', {nodeId: q.nodeId}); fonts = f.fonts.map(x => x.familyName + (x.isCustomFont ? '' : '(SYS)')).join('+'); } catch (e) {} r[k] = v.map(x => x.split('|')[0]); r[k].fonts = fonts; }
    await cdp.detach(); return { label, r };
  };
  const stages = [];
  await page.goto(`${BASE}/?skin=${SKIN}` + (OSID ? '&os=' + OSID : '')); await page.waitForSelector('#tnew', { state: 'visible' }); await sleep(500);
  stages.push(await collect('title'));
  await page.keyboard.press('Escape').catch(()=>{}); await page.evaluate(() => document.querySelectorAll('.scrim').forEach(x => x.remove())); await page.click('#tnew'); const form = page.locator('form.newgame'); await form.waitFor(); await sleep(300); stages.push(await collect('newgame'));
  await form.locator('select[name=rules]').selectOption(RULES); { const sk = form.locator('select[name=skin]'); if (await sk.count() && await sk.isVisible()) await sk.selectOption(SKIN); }
  if (OSID) { const o = form.locator('select[name=os]'); if (await o.count()) await o.selectOption(OSID).catch(() => {}); await sleep(600); }
  await form.locator('select[name=computers]').selectOption('2').catch(() => {});
  await page.evaluate(() => document.querySelector('form.newgame').requestSubmit()); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(800);
  stages.push(await collect('game+cards'));
  for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
  await page.evaluate(() => { const a = HOAPI, p = a.me(); p.savings = 200000; p.metal = 50000; const s = a.G.stars.find(x => x.owner === a.ME); a.UI.sel = s.id; const d = p.designs.find(x => x.type === 'fighter' && !x.scrapped); if (d) try { HO.buildShips(a.G, a.ME, s.id, d.id, 4); } catch (e) {} a.renderPanel(); });
  await sleep(300); stages.push(await collect('game')); if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  // menus
  const mb = await page.locator('#menubar .mbtn').count(); for (let i = 0; i < mb; i++) { await page.locator('#menubar .mbtn').nth(i).click().catch(() => {}); await sleep(200); stages.push(await collect('menu' + i)); await page.keyboard.press('Escape'); }
  await page.evaluate(() => document.body.click());
  const list = [['About', 'HOAPI.openAbout()'], ['PatchNotes', 'HOAPI.openPatchNotes()'], ['Help', 'HOAPI.openHelp()'], ['Skills', 'HOAPI.openSkills()'], ['HallFame', "HOAPI.openHall('fame')"], ['Reports', 'HOAPI.openReports()'], ['BattleList', 'HOAPI.openBattleList()'], ['GameText', 'HOAPI.openGameText && HOAPI.openGameText()'], ['Account', 'HOAPI.openAccount()'], ['Split', 'const a = HOAPI, f = a.G.fleets.find(f => f.owner === a.ME && Object.values(f.ships).reduce((x, y) => x + y, 0) > 1 && f.star != null); f ? a.openSplit(f) : null']];
  for (const [name, code] of list) {
    await page.evaluate(() => { document.querySelectorAll('.scrim').forEach(x => x.remove()); document.querySelectorAll('.hoscreen').forEach(x => { try { HOAPI.closeScreen(); } catch (e) {} }); });
    try { await page.evaluate(code.includes('const ') ? `(() => { ${code} })()` : code); } catch (e) {} await sleep(400); stages.push(await collect(name));
  }
  await page.evaluate(() => { document.querySelectorAll('.scrim').forEach(x => x.remove()); document.querySelectorAll('.hoscreen').forEach(x => { try { HOAPI.closeScreen(); } catch (e) {} }); });
  await page.evaluate(() => { try { HOAPI.toast && HOAPI.toast('Toast test'); } catch (e) {} }); await sleep(200); stages.push(await collect('toast'));
  const re = SKIN === 'dos' ? GOOD.dos : /^mac/.test(SKIN) ? GOOD.mac : /^amiga/.test(SKIN) ? GOOD.amiga : /./;
  const bad = {};
  for (const s of stages) for (const [k, v] of Object.entries(s.r)) { if (/\(SYS\)|^\?$/.test(v.fonts) || process.env.ALL) { const kk = k + '  =>' + v.fonts; (bad[kk] = bad[kk] || []).push(s.label + ': ' + v.slice(0, 3).join(' | ')); } }
  if (process.env.OFF) { const NAT = { 'Chicago': ['12px'], 'Geneva': ['12px'], 'DOS Chicago 12': ['15px'], 'DOS Geneva 9': ['12px'], 'DOS Geneva 9 Bold': ['12px'], 'DOS Bios': ['14px'], 'MS Sans Serif': ['11px'], 'Microsoft Sans Serif': ['11px'], 'Win31 System': ['13px'], 'Win31 Fixedsys': ['12px'], 'Palm OS': ['11px'] }; const off = {}; for (const s of stages) for (const [k, v] of Object.entries(s.r)) { const m = k.match(/^(.*) ([\d.]+px)( w\d+)?$/); if (!m || !NAT[m[1]] || NAT[m[1]].includes(m[2])) continue; (off[k] = off[k] || new Set()).add(v.slice(0, 2).join(' | ')); } console.log('# OFF-NATIVE', SKIN, RULES, OSID); for (const [k, v] of Object.entries(off)) console.log('  ' + k + ': ' + [...v].slice(0, 3).join(' ;; ')); await b.close(); return; }
  console.log('#', SKIN, RULES, OSID, '- offenders:', Object.keys(bad).length);
  for (const [k, v] of Object.entries(bad)) console.log('  ' + k + '  (' + v.length + ' stages)\n     ' + v.slice(0, 4).join('\n     '));
  await b.close();
})();
