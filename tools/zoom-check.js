#!/usr/bin/env node
// ZOOM CHECK: is "Interface size" a true zoom? (docs/interface-zoom/README.md)
//   NODE_PATH=$(npm root -g) node tools/zoom-check.js [--skin=ios|android] [--rules=ios] [--sizes=844x390,1024x768,1920x1080,3840x2160] [--zooms=0.5,0.7,1.15,1.5]
//        [--url=http://localhost:8000/] [--shots=dir]
//
// Real games, started through the title screen with modern conveniences on and the size kept as the page keeps it
// (localStorage 'ho5.ios.size'). Two checks, in every window size:
//   1. THE ZOOM: the pixel size of each part of the interface (the sidebar's width, a bar, a row, the report bar with a card, End Turn,
//      the gear, the column's buttons, the graphs, the round buttons about a colony, the star information) at each size is F times what
//      it is at 100%. (The sidebar's height is the window's, so only its width is compared.) A landscape phone cannot hold the
//      button stack past about 118%, so its size is capped there (js/skins/ios/ui.js, screenSize) and the check expects the cap.
//   2. THE WINDOWS: with ships at home, the Build window (the round + button), Organize Fleets (the round button), Preferences, its
//      Remake options window, Give and the Graphs window are opened with real clicks; none may run outside the window.
// Exit 1 on a failure. Serves the repository with `python3 -m http.server` when nothing answers at --url.
'use strict';
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs'); const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (NODE_PATH=$(npm root -g)).'); process.exit(2); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SKIN = opt('skin', 'ios'), RULES = opt('rules', 'ios'), URL0 = opt('url', 'http://localhost:8000/'), SHOTS = opt('shots', '');
const SIZES = opt('sizes', '844x390,1024x768,1920x1080,3840x2160').split(',').map(s => s.split('x').map(Number));
const ZOOMS = opt('zooms', '0.5,0.7,1.15,1.5').split(',').map(Number);
const ROOT = path.join(__dirname, '..');
const SEL = { dollar: '.ios-col .ios-btn', end: '.ios-end', gear: '.ios-gear', panel: '#panel', income: '.ios-income', prow: '.ios-prow', card: '#msg .card', pbAdd: '.ios-pb-add', si: '.ios-si', shade: '.ios-shade', graphsBtn: '.ios-graph', hud: '.ios-hud', barRow: '.ios-bars .barrow' };
const up = () => new Promise(res => http.get(URL0, r => { r.resume(); res(true); }).on('error', () => res(false)));

async function start(b, W, H, F, rules) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: Math.min(W, H) < 1100 && W < 1100 }); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(([F]) => { try { localStorage.clear(); localStorage.setItem('ho5.modern', '1'); if (+F !== 1) localStorage.setItem('ho5.ios.size', String(F)); for (const k of ['rules.claude', 'rules.gemini', 'skins.cozy', 'skins.gemini']) localStorage.setItem('ho5.homage.hide.' + k, '1'); } catch (e) {} }, [F]);
  await page.goto(`${URL0}?skin=${SKIN}`); await page.waitForSelector('#tnew', { state: 'visible' }); await page.click('#tnew');
  const form = page.locator('form.newgame'); await form.waitFor(); await form.locator('select[name=rules]').selectOption(rules);
  { const sk = form.locator('select[name=skin]'); if (await sk.count()) await sk.selectOption(SKIN); }
  await form.locator('select[name=computers]').selectOption('2').catch(() => {});
  await form.locator('button[type=submit]').click(); await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 15000 }); await sleep(900);
  return { ctx, page, errs };
}
// ships at the home colony, which is selected (what a player has after a turn or two)
const ready = (page) => page.evaluate(() => { const a = HOAPI, G = a.G, me = a.me(), h = G.stars.find(x => x.owner === a.ME); me.designs.filter(d => ['scout', 'fighter', 'colony'].includes(d.type)).forEach((d, i) => HO.addShipsToStar(G, a.ME, h.id, d, 2 + i)); G.fleets.forEach(f => { f.newThisTurn = false; }); a.UI.sel = h.id; a.renderPanel(); a.draw(); });

async function measure(b, W, H, F) {
  const { ctx, page, errs } = await start(b, W, H, F, RULES); await ready(page); await sleep(600);
  await page.locator('.clock').first().click().catch(() => {}); await sleep(1800); // End Turn: the report bar has a card
  const r = await page.evaluate((SEL) => { const o = {}; for (const k in SEL) { const e = [...document.querySelectorAll(SEL[k])].find(x => { const b = x.getBoundingClientRect(); return b.width > 2 && b.height > 2 && getComputedStyle(x).visibility !== 'hidden'; }); if (e) { const b = e.getBoundingClientRect(); o[k] = [b.width, b.height]; } } return o; }, SEL);
  await ctx.close(); return { r, errs };
}
async function windows(b, W, H, F, bad) {
  const tag = `${W}x${H} at ${F}`, { ctx, page, errs } = await start(b, W, H, F, RULES); await ready(page); await sleep(600);
  const phone = Math.min(W, H) < 600;
  const inside = async (n) => { const r = await page.evaluate(() => { const o = []; for (const e of document.querySelectorAll('.ios-gdlg, .win, .ios-sg')) { const b = e.getBoundingClientRect(); if (b.width > 5) o.push([e.className.toString().slice(0, 28), b.left, b.top, b.right, b.bottom]); } return o; });
    for (const [c, l, t, rr, bb] of r) if (l < -2 || t < -2 || rr > W + 2 || bb > H + 2) bad.push(`${tag}: ${n}: ${c} runs outside the window (${[l, t, rr, bb].map(Math.round)})`); };
  const closeAll = async () => { for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await sleep(110); } };
  const click = async (sel, n) => { const l = page.locator(sel).first(); if (!(await l.count()) || !(await l.isVisible())) { bad.push(`${tag}: ${n}: ${sel} is not on screen`); return false; } await l.click({ timeout: 4000 }).catch(e => bad.push(`${tag}: ${n}: click failed (${e.message.split('\n').filter(x => /intercepts|covered|not visible|outside/.test(x)).concat(e.message.split('\n')[0]).map(x => x.replace(/\x1b\[[0-9;]*m/g, '').trim()).slice(0, 2).join(' | ').slice(0, 200)})`)); await sleep(600); return true; };
  const shot = (n) => SHOTS ? (fs.mkdirSync(SHOTS, { recursive: true }), page.screenshot({ path: `${SHOTS}/${SKIN}-${W}x${H}-${F}-${n}.png` })) : null;
  if (await click('.ios-pb-add', 'Build')) { await shot('build'); await inside('Build'); await closeAll(); }
  if (await click('.ios-pb-organize', 'Organize Fleets')) { await shot('organize'); await inside('Organize Fleets'); await closeAll(); }
  if (phone && await click('.ios-pb-move', 'Fleets')) { await shot('fleets'); await inside('Fleets'); await closeAll(); } // (an iPad has no move button: its fleets are a node on the map)
  await page.evaluate(() => HOAPI.openPrefs()); await sleep(500); await shot('prefs'); await inside('Preferences');
  if (await click('.ios-bremake', 'Remake options')) { await shot('remake'); await inside('Remake options'); } await closeAll(); await closeAll();
  await page.evaluate(() => HOAPI.openGive && HOAPI.openGive()); await sleep(500); await inside('Give'); await closeAll();
  if (await click('.ios-graph', 'Graphs')) { await shot('graphs'); await inside('Graphs'); await closeAll(); }
  if (errs.length) bad.push(`${tag}: page errors: ${errs[0]}`);
  await ctx.close();
}
(async () => {
  let srv = null; if (!(await up())) { if (!/^http:\/\/localhost:8000\/?$/.test(URL0)) { console.error('Nothing answers at ' + URL0); process.exit(2); } srv = spawn('python3', ['-m', 'http.server', '8000'], { cwd: ROOT, stdio: 'ignore' }); await sleep(1000); }
  const b = await chromium.launch(); const bad = [];
  for (const [W, H] of SIZES) {
    const phone = Math.min(W, H) < 600, u0 = phone ? Math.min(H / 320, W / 480) : 1, cap = phone ? Math.max(1, H / (u0 * 270)) : Infinity;
    const base = await measure(b, W, H, 1);
    for (const F0 of ZOOMS) {
      const F = Math.min(F0, cap), m = await measure(b, W, H, F0), rows = [];
      for (const k in base.r) {
        if (!m.r[k]) { bad.push(`${W}x${H} at ${F0}: ${k} is missing`); continue; }
        const rw = m.r[k][0] / base.r[k][0], rh = m.r[k][1] / base.r[k][1];
        const okW = Math.abs(rw - F) < 0.04 + 1.5 / base.r[k][0], okH = k === 'panel' || Math.abs(rh - F) < 0.04 + 1.5 / base.r[k][1]; // (the sidebar is as tall as the window)
        if (!okW || !okH) bad.push(`${W}x${H} at ${F0}${F !== F0 ? ` (capped to ${F.toFixed(2)})` : ''}: ${k} is ${rw.toFixed(2)} x ${rh.toFixed(2)} of its size at 100%, not ${F.toFixed(2)}`);
        rows.push(k);
      }
      if (m.errs.length) bad.push(`${W}x${H} at ${F0}: page error ${m.errs[0]}`);
      console.log(`zoom   ${W}x${H} at ${F0}${F !== F0 ? ` (capped ${F.toFixed(2)})` : ''}: ${rows.length} parts compared`);
    }
    for (const F0 of [Math.min(...ZOOMS), 1, Math.max(...ZOOMS)]) { await windows(b, W, H, F0, bad); console.log(`window ${W}x${H} at ${F0}: opened and checked`); }
  }
  await b.close(); if (srv) srv.kill();
  if (bad.length) { console.log('\nFAIL'); for (const x of bad) console.log('  ' + x); process.exit(1); }
  console.log('\nzoom check ok');
})();
