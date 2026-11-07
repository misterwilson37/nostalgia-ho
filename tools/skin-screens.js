#!/usr/bin/env node
// Opens the windows and screens a player rarely reaches (About, Patch notes, Help, Skills, the Halls, Reports, the battle list, Account, Game Center, Split fleet)
// in each ruleset and says what each opens, with a screenshot of every one that opens (PNG files in the temp folder, or $OUT).
//   NODE_PATH=$(npm root -g) node tools/skin-screens.js [rulesets, all twelve] [skin, mac12]
// It reports a page error or an opener that throws as a problem (exit 1). "(nothing opened)" is NOT a problem: several need a state this does not make (Patch notes
// a patched game, the Halls an entry, Skills Compare Players after the first year, the battle list a battle); the first time round it was the inventory of screens
// that had never been looked at in the 1.2 skin (docs/12-findings.md, "Screens").
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const RULES = (process.argv[2] || '12,dos,301,405,original,palm,claude,mac20,mac405,ios,gemini,android').split(','), SKIN = process.argv[3] || 'mac12', OUT = process.env.OUT || require('os').tmpdir();
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: process.env.REPO || process.cwd(), stdio: 'ignore' }); await sleep(800);
  const b = await chromium.launch();
  for (const rules of RULES) {
    const page = await (await b.newContext({ viewport: { width: 1100, height: 800 } })).newPage(); page.on('dialog', d => d.accept()); page.setDefaultTimeout(8000);
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && /HO bug/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 160)); });
    await page.addInitScript(() => { try { localStorage.clear(); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} }); // (the Claude and Gemini rulesets show a notice before the first game)
    await page.goto(`http://localhost:8000/?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
    const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
    { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
    await form.locator('select[name=computers]').selectOption('2').catch(() => {});
    await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(600);
    for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) { if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; } await page.locator('.card').first().click().catch(() => {}); await sleep(40); }
    await page.evaluate(() => { const a = HOAPI, p = a.me(); p.savings = 200000; p.metal = 50000; const s = a.G.stars.find(x => x.owner === a.ME); a.UI.sel = s.id; const d = p.designs.find(x => x.type === 'fighter' && !x.scrapped); if (d) try { HO.buildShips(a.G, a.ME, s.id, d.id, 4); } catch (e) {} const d2 = p.designs.find(x => x.type === 'scout' && !x.scrapped); if (d2) try { HO.buildShips(a.G, a.ME, s.id, d2.id, 2); } catch (e) {} a.renderPanel(); });
    const list = [['About', 'HOAPI.openAbout()'], ['PatchNotes', 'HOAPI.openPatchNotes()'], ['Help', 'HOAPI.openHelp()'], ['Skills', 'HOAPI.openSkills()'], ['HallFame', "HOAPI.openHall('fame')"], ['HallShame', "HOAPI.openHall('shame')"], ['Reports', 'HOAPI.openReports()'], ['BattleList', 'HOAPI.openBattleList()'], ['GameText', 'HOAPI.openGameText && HOAPI.openGameText()'], ['Account', 'HOAPI.openAccount()'], ['GameCenter', 'HOAPI.openGameCenter()'], ['Split', 'const a = HOAPI, f = a.G.fleets.find(f => f.owner === a.ME && Object.values(f.ships).reduce((x, y) => x + y, 0) > 1 && f.star != null); f ? a.openSplit(f) : null']];
    const out = [];
    for (const [name, code] of list) {
      await page.evaluate(() => { document.querySelectorAll('.scrim').forEach(x => x.remove()); document.querySelectorAll('.hoscreen').forEach(x => { try { HOAPI.closeScreen(); } catch (e) {} }); });
      let threw = null; try { await page.evaluate(code.includes('const ') ? `(() => { ${code} })()` : code); } catch (e) { threw = e.message.split('\n')[0].slice(0, 80); } await sleep(500);
      const info = await page.evaluate(() => { const w = document.querySelector('.scrim .win'), sc = document.querySelector('.hoscreen'); if (w) return { kind: 'window', cls: w.className.replace(/\bwin |mac12 /g, '').trim(), text: w.textContent.replace(/\s+/g, ' ').slice(0, 70) }; if (sc) return { kind: 'screen', text: sc.textContent.replace(/\s+/g, ' ').slice(0, 70) }; return { kind: 'nothing' }; });
      out.push(`${name}: ${threw ? 'THREW ' + threw : info.kind === 'nothing' ? '(nothing opened)' : info.kind + (info.cls ? ' {' + info.cls + '}' : '') + ' | ' + info.text}`);
      if (info.kind !== 'nothing') await page.screenshot({ path: `${OUT}/screen-${SKIN}-${rules}-${name}.png` });
    }
    console.log('==', rules, '\n  ' + out.join('\n  '), errs.length ? '\n  ERRORS ' + JSON.stringify(errs.slice(0, 4)) : '\n  no page errors'); if (errs.length || out.some(x => / THREW /.test(x))) globalThis.__bad = (globalThis.__bad || 0) + 1;
    await page.close();
  }
  await b.close(); srv.kill(); console.log(globalThis.__bad ? `\n${globalThis.__bad} ruleset(s) with a problem` : '\nno problems'); process.exit(globalThis.__bad ? 1 : 0);
})();
