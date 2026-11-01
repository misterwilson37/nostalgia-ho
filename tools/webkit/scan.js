() => {
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