#!/usr/bin/env node
// The Windows 3.1 look (skin dos, os win31) beside the Windows 3.1 2.0 captures (docs/status-win31.md).
// Loads ?skin=dos&os=win31&rules=dos at 1280 x 960 (the frame's unit --u is then 2), runs an optional snippet (to open a window, a menu ...),
// halves our screen to the program's 640 x 480 (every second pixel, as the captures are the screen's own pixels) and writes:
//   win31-<name>-ours.png     our screen at 640 x 480
//   win31-<name>-side.png     ours left, the capture right, 640 x 480 each (8 magenta pixels between)
//   win31-<name>-zoom.png     with ZOOM=x,y,w,h (640 x 480 pixels): that part of both, x3, ours above the capture
//   node tools/win31-compare.js <name> <capture file> ['<js run in the page first>']
//   The capture is a file of the private repo's audit/win-2.0/captures (CAPS to change); a 1920 x 1440 DOSBox shot is sampled [1::3, 1::3].
//   env: BASE (a server already serving the repo, default http://127.0.0.1:8765), OUT (default the temp folder), SEED, Q (more address
//   parameters, e.g. "&computers=5"), TITLE=1 (stop at the title page: no game), CLEAR=1 (the report bubbles clicked away first), WAIT (ms after the snippet, default 700), ZOOM.
// Uses no Python: the halving and the x3 are done in a page canvas (image-rendering: pixelated, every second pixel drawn).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const CAPS = process.env.CAPS || path.resolve(__dirname, '../../nostalgia-ho-sources/audit/win-2.0/captures');
const OUT = process.env.OUT || require('os').tmpdir();
const [name = 'main', capName = 'win20-jake-vga16-shot0007.png', snippet = ''] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('ho5.name', 'Jake'); } catch (e) {} });
  // (&form: the New Game window stays open, so the look can be picked in it: the edition puts its skin's first look, DOS, on
  // even when the address names os=win31; docs/status-win31.md, "Needs a shared file")
  const q = process.env.TITLE ? '' : `&rules=dos&form${process.env.SEED ? '&seed=' + process.env.SEED : ''}${process.env.Q || ''}`;
  await page.goto(`${BASE}/index.html?skin=dos&os=win31${q}`);
  if (!process.env.TITLE) {
    await page.waitForFunction(() => document.querySelector('form.newgame select[name=os]'), null, { timeout: 30000 });
    await page.evaluate(() => { const f = document.querySelector('form.newgame'), o = f.querySelector('select[name=os]'); o.value = 'win31'; o.dispatchEvent(new Event('change')); f.requestSubmit(); });
    await page.waitForFunction(() => window.HOAPI && HOAPI.G, null, { timeout: 30000 }); await sleep(1000);
  } else await sleep(2500);
  if (process.env.CLEAR) for (let n = 0; n < 30 && await page.locator('#msg .card').count(); n++) { // (CLEAR=1: the report bubbles clicked away, as the player does)
    await page.evaluate(() => { const c = document.querySelector('#msg .card'); if (c) c.click(); }); await sleep(60);
  }
  if (snippet) { await page.evaluate(snippet); }
  await sleep(+(process.env.WAIT || 700));
  const full = await page.screenshot();
  let cap = fs.readFileSync(path.join(CAPS, capName));
  const side = await (await b.newContext({ viewport: { width: 1300, height: 1500 } })).newPage();
  const res = await side.evaluate(async ([o64, c64, zoom]) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [o, c] = [await load(o64), await load(c64)];
    const px = (img, step, off) => { // sample every step-th pixel from off: 640 x 480
      const k = document.createElement('canvas'); k.width = img.width; k.height = img.height; const kx = k.getContext('2d'); kx.drawImage(img, 0, 0);
      const d = kx.getImageData(0, 0, img.width, img.height).data, out = document.createElement('canvas'); out.width = 640; out.height = 480;
      const ox = out.getContext('2d'), od = ox.createImageData(640, 480);
      for (let y = 0; y < 480; y++) for (let x = 0; x < 640; x++) { const s = ((y * step + off) * img.width + x * step + off) * 4, t = (y * 640 + x) * 4; for (let i = 0; i < 4; i++) od.data[t + i] = d[s + i]; }
      ox.putImageData(od, 0, 0); return out;
    };
    const O = px(o, 2, 0), C = c.width === 1920 ? px(c, 3, 1) : px(c, 1, 0);
    const s = document.createElement('canvas'); s.width = 1288; s.height = 480; const sx = s.getContext('2d');
    sx.fillStyle = '#f0f'; sx.fillRect(0, 0, 1288, 480); sx.drawImage(O, 0, 0); sx.drawImage(C, 648, 0);
    const r = { ours: O.toDataURL().split(',')[1], side: s.toDataURL().split(',')[1] };
    if (zoom) {
      const [x, y, w, h] = zoom; const z = document.createElement('canvas'); z.width = w * 3; z.height = h * 6 + 6; const zx = z.getContext('2d');
      zx.imageSmoothingEnabled = false; zx.fillStyle = '#f0f'; zx.fillRect(0, 0, z.width, z.height);
      zx.drawImage(O, x, y, w, h, 0, 0, w * 3, h * 3); zx.drawImage(C, x, y, w, h, 0, h * 3 + 6, w * 3, h * 3);
      r.zoom = z.toDataURL().split(',')[1];
    }
    return r;
  }, [full.toString('base64'), cap.toString('base64'), process.env.ZOOM ? process.env.ZOOM.split(',').map(Number) : null]);
  for (const k of Object.keys(res)) { const f = path.join(OUT, `win31-${name}-${k}.png`); fs.writeFileSync(f, Buffer.from(res[k], 'base64')); console.log(f); }
  if (errs.length) console.log('page errors:', errs.slice(0, 5));
  await b.close();
})();
