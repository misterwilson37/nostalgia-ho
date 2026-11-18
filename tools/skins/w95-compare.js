#!/usr/bin/env node
// The w95 skin beside Jake's Windows 95 4.0.5 captures (docs/status-w95.md).
// Starts a 4.0.5 game in the w95 skin at the original's 640 x 480, runs an optional snippet (to open a window, pick a star...),
// and writes our screen and a side-by-side PNG (ours left, the capture right) for each capture number given.
//   node tools/skins/w95-compare.js <crop numbers, comma-separated> ['<js run in the page first>']
//   env: BASE (a server already serving the repo, default http://127.0.0.1:8765), CROPS (the private repo's
//   audit/win-4.0.5/crops, default ../nostalgia-ho-sources/audit/win-4.0.5/crops), OUT (default the temp folder),
//   W, H (viewport, default 640 x 480), SEED (the galaxy, default 1)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const CROPS = process.env.CROPS || path.resolve(__dirname, '../../../nostalgia-ho-sources/audit/win-4.0.5/crops');
const OUT = process.env.OUT || require('os').tmpdir();
const W = +(process.env.W || 640), H = +(process.env.H || 480);
const nums = (process.argv[2] || '010').split(',').map(n => n.padStart(3, '0'));
const snippet = process.argv[3] || '';
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  await page.goto(`${BASE}/index.html?skin=w95&rules=405&computers=3${process.env.SEED ? '&seed=' + process.env.SEED : ''}`);
  await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 20000 }); await sleep(800);
  for (let n = 0; n < 30 && await page.locator('.card:not(.end):not(.waiting)').count(); n++) {
    if (await page.locator('.scrim').count()) { await page.keyboard.press('Escape'); await sleep(60); continue; }
    await page.evaluate(() => { const c = document.querySelector('.card'); if (c) c.click(); }); await sleep(40); // (a floating window may cover the bubble, as in the original)
  }
  if (snippet) { await page.evaluate(snippet); await sleep(600); }
  const ours = path.join(OUT, `w95-ours.png`); await page.screenshot({ path: ours });
  const o64 = fs.readFileSync(ours).toString('base64');
  for (const n of nums) {
    const crop = path.join(CROPS, n + '.png'); if (!fs.existsSync(crop)) { console.log('no crop', crop); continue; }
    const c64 = fs.readFileSync(crop).toString('base64');
    const side = await (await b.newContext({ viewport: { width: W + 8 + 640, height: Math.max(H, 480) } })).newPage();
    await side.setContent(`<body style="margin:0;background:#f0f;display:flex;gap:8px;align-items:flex-start"><img src="data:image/png;base64,${o64}"><img src="data:image/png;base64,${c64}"></body>`);
    await side.waitForTimeout(100);
    const out = path.join(OUT, `w95-side-${n}.png`); await side.screenshot({ path: out }); console.log(out); await side.close();
  }
  if (errs.length) console.log('page errors:', errs.slice(0, 5));
  await b.close();
})();
