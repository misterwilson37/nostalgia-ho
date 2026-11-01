#!/usr/bin/env node
// tools/contrast-scan.js: the WCAG AA contrast scan of every skin under every OS look.
//
//   python3 -m http.server 8880 &                      (from the repository root)
//   node tools/contrast-scan.js <skin> [look,look...]  (URL=http://localhost:8880/ OUT=contrast-out by default)
//   SCHEME=dark node tools/contrast-scan.js <skin> safari,edge,firefox   (the browser looks' dark scheme)
//   python3 tools/contrast-report.py contrast-out      (what failed, by cause)
//
// For each skin it loads the page once and switches the look in place (HOSKINS.setOS), scanning the title screen, the
// New Game dialog, the game screen, an open menu, and the About, Prefs, Help and Reports windows: every visible piece of
// text against 4.5:1 (3:1 for large text), its background taken from the screenshot's pixels behind the text (the most
// common colour outside the text's own), since pseudo-elements, gradients and glass cannot be read from the DOM. Text
// clipped by a scrolling window, disabled controls and hover tooltips are left out. Chromium only (Playwright); WebKit
// and Gecko render differently. See docs/contrast-2026-10.md.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL = process.env.URL || 'http://localhost:8880/';
const skin = process.argv[2];
const onlyLooks = process.argv[3] ? process.argv[3].split(',') : null;

const SCAN = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const rgba = (s) => {
    if (cache.has(s)) return cache.get(s);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const m = /rgba?\([^)]*?(?:\/\s*|,\s*)([\d.]+%?)\s*\)\s*$/.exec(s);
    let a = d[3] / 255;
    if (/^(rgba|color|lab|lch|oklab|oklch|hsl)/.test(s) && m) { a = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]); }
    if (s === 'transparent') a = 0;
    const c = [d[0], d[1], d[2], a]; cache.set(s, c); return c;
  };
  const over = (top, bot) => { const a = top[3] + bot[3] * (1 - top[3]); if (a <= 0) return [0, 0, 0, 0]; return [0, 1, 2].map(i => (top[i] * top[3] + bot[i] * bot[3] * (1 - top[3])) / a).concat([a]); };
  const lum = (c) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sel = (el) => { const parts = []; for (let n = el, i = 0; n && n.nodeType === 1 && i < 3; n = n.parentElement, i++) { let s = n.tagName.toLowerCase(); if (n.id) s += '#' + n.id; else if (n.classList.length) s += '.' + [...n.classList].slice(0, 2).join('.'); parts.unshift(s); } return parts.join(' > '); };
  const out = []; let checked = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const txt = t.nodeValue.trim(); if (!txt) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue;
    if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|TITLE)$/.test(el.tagName)) continue;
    if (el.closest('[hidden],[aria-hidden="true"],[disabled],[aria-disabled="true"]')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    const rr = [...rg.getClientRects()].filter(r => r.width > 1 && r.height > 1);
    if (!rr.length) continue;
    let r = rr[0];
    { // keep only the part of the text a scroll container or an overflow:hidden ancestor lets through
      let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom; const area0 = r.width * r.height;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const c = getComputedStyle(n); if (n === document.documentElement || n === document.body) break;
        if (/(hidden|auto|scroll|clip)/.test(c.overflowX + c.overflowY)) { const b = n.getBoundingClientRect(); x0 = Math.max(x0, b.left); y0 = Math.max(y0, b.top); x1 = Math.min(x1, b.right); y1 = Math.min(y1, b.bottom); }
      }
      if (x1 - x0 < 2 || y1 - y0 < 2 || ((x1 - x0) * (y1 - y0)) < 0.85 * area0) continue;
      r = { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
    }
    if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue;
    const cxp = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cyp = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cxp, cyp);
    if (!top || !(el.contains(top) || top.contains(el))) continue;
    seen.add(el);
    let op = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
    if (op < 0.05) continue;
    const fg = rgba(cs.color).slice(); fg[3] *= op;
    let bg = [0, 0, 0, 0], img = false; const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = getComputedStyle(n); const bc = rgba(c.backgroundColor); const hasImg = c.backgroundImage && c.backgroundImage !== 'none';
      layers.push([bc, hasImg]); if (hasImg) img = true; if (bc[3] >= 0.999 || hasImg) break;
    }
    let acc = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i][0], acc);
    bg = acc;
    const fgc = over(fg, bg);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    checked++;
    out.push({ sel: sel(el), text: txt.slice(0, 32), fg: fgc.slice(0, 3).map(Math.round), bg: bg.slice(0, 3).map(Math.round), ratio: ratio(fgc, bg), need: large ? 3 : 4.5, size, weight, img, rect: [r.left, r.top, r.width, r.height] });
  }
  return { checked, items: out };
};

(async () => {
  const OUT = process.env.OUT || 'contrast-out'; fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const scheme = process.env.SCHEME || 'light'; const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const result = { skin, states: {}, errors: [] };
  const record = async (look, state) => {
    let r;
    try { await page.mouse.move(2, 2); await page.evaluate(() => document.querySelectorAll('.tip').forEach(e => { if (getComputedStyle(e).position === 'fixed') e.remove(); })); } catch (e) {}
    try { r = await page.evaluate(`(${SCAN.toString()})()`); } catch (e) { result.errors.push(`${look} ${state}: scan ${e.message.slice(0, 80)}`); return; }
    const key = `${look}|${state}`;
    let fails = [];
    const shot = await page.screenshot(); const { data, info } = await sharp(shot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const L = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    for (const it of r.items.slice(0, 400)) {
      const [x, y, w, h] = it.rect.map(Math.round); const hist = new Map(); let n = 0;
      const fgp = it.fg;
      for (let yy = Math.max(0, y); yy < Math.min(info.height, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(info.width, x + w); xx++) {
        const p = (yy * info.width + xx) * 4; const dr = data[p] - fgp[0], dg = data[p + 1] - fgp[1], db = data[p + 2] - fgp[2];
        if (dr * dr + dg * dg + db * db < 1800) continue; // the text's own colour (and its anti-aliasing)
        const k = (data[p] >> 3) << 10 | (data[p + 1] >> 3) << 5 | (data[p + 2] >> 3); hist.set(k, (hist.get(k) || 0) + 1); n++;
      }
      if (n < 6) continue; const [mk] = [...hist.entries()].sort((a, b) => b[1] - a[1])[0];
      const bgc = [((mk >> 10) & 31) << 3 | 4, ((mk >> 5) & 31) << 3 | 4, (mk & 31) << 3 | 4];
      const a = L(it.fg), b = L(bgc); it.bg = bgc; it.ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (it.ratio < it.need) fails.push(it);
    }
    result.states[key] = { checked: r.checked, fails: fails.map(f => ({ sel: f.sel, text: f.text, fg: f.fg, bg: f.bg, ratio: +f.ratio.toFixed(2), need: f.need, size: f.size, weight: f.weight, img: f.img })) };
  };
  const setLook = async (look) => { await page.evaluate(id => HOSKINS.setOS(id), look); await sleep(220); };
  try {
    await page.goto(`${URL}?skin=${skin}`);
    await page.waitForFunction(() => window.HOAPI && window.HOSKINS && document.querySelector('#titlescreen') && !document.querySelector('#titlescreen').classList.contains('loading'), null, { timeout: 40000 });
    const looks = onlyLooks || await page.evaluate(() => HOSKINS.oses.map(o => o.id));
    for (const l of looks) { await setLook(l); await record(l, 'title'); }
    await page.evaluate(() => HOAPI.newGameDialog()); await page.waitForSelector('form.newgame', { timeout: 10000 });
    for (const l of looks) { await setLook(l); await record(l, 'newgame'); }
    await page.evaluate(() => { const f = document.querySelector('form.newgame'); f.requestSubmit ? f.requestSubmit() : f.querySelector('button[type=submit]').click(); });
    await page.waitForFunction(() => HOAPI.G, null, { timeout: 20000 }); await sleep(900);
    for (let i = 0; i < 40 && !(await page.locator('.clock.pic, .clock').count()); i++) { await page.evaluate(() => { try { HOAPI.closeModal(); } catch (e) {} const c = document.querySelector('#msg .card, #msg [tabindex]'); if (c) c.click(); }); await sleep(120); }
    for (const l of looks) {
      await setLook(l); await record(l, 'game');
      try { const b = page.locator('#menubar .mbtn:not(.logo)').first(); if (await b.count()) { try { await b.click({ timeout: 1500 }); } catch (e) { await b.evaluate(n => n.click()); } await sleep(200); await record(l, 'menu'); await page.keyboard.press('Escape'); await page.evaluate(() => document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'))); await sleep(100); } } catch (e) { result.errors.push(`${l} menu ${e.message.slice(0, 60)}`); }
      for (const [name, fn] of [['about', 'openAbout'], ['prefs', 'openPrefs'], ['help', 'openHelp'], ['reports', 'openReports']]) {
        try { await page.evaluate(f => HOAPI[f](), fn); await sleep(250); await record(l, name); await page.evaluate(() => { try { HOAPI.closeModal(); } catch (e) {} }); await sleep(80); } catch (e) { result.errors.push(`${l} ${name} ${e.message.slice(0, 60)}`); }
      }
    }
  } catch (e) { result.errors.push('fatal: ' + e.message.slice(0, 200)); }
  fs.writeFileSync(`${OUT}/${skin}${scheme === 'dark' ? '-dark' : ''}.json`, JSON.stringify(result));
  const states = Object.keys(result.states).length, fails = Object.values(result.states).reduce((n, s) => n + s.fails.length, 0);
  console.log(`${skin}: ${states} states, ${fails} failing spans, ${result.errors.length} errors`);
  await browser.close();
})();
