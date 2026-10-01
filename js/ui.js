// Spaceward Ho! web remake — interface
(function () {
'use strict';
// Assets: the single-file build (tools/bundle.py) embeds them as window.ASSETS;
// otherwise they are fetched by name from assets/ (see assets/manifest.json).
const A = window.ASSETS || { img: {}, snd: {}, jpg: [], theme: 'assets/theme.mp3' };
function loadManifest(done) {
  if (window.ASSETS) return done();
  fetch('assets/manifest.json').then(r => r.json()).then(m => {
    for (const k of m.sprites) A.img[k] = 'assets/sprites/' + k + '.png';
    for (const k of m.sounds) A.snd[k] = 'assets/sounds/' + k + '.mp3';
    for (let i = 1; i <= m.explore; i++) A.jpg.push('assets/explore/' + String(i).padStart(2, '0') + '.jpg');
    done();
  }).catch(() => {
    document.body.append(el('p', { class: 'warn' }, 'Could not load assets/manifest.json. Open this game from a web server (for example GitHub Pages), not straight from a file.'));
  });
}
const $ = (s, el) => (el || document).querySelector(s);
const el = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const money = (n) => (n < 0 ? '-$' : '$') + fmt(Math.abs(n));

// ---------- images ----------
const IMG = {};
let imgPending = 0;
function loadImages(done) {
  const keys = Object.keys(A.img);
  imgPending = keys.length;
  for (const k of keys) {
    const im = new Image();
    im.onload = im.onerror = () => { if (--imgPending === 0) done(); };
    im.src = A.img[k];
    IMG[k] = im;
  }
}

// ---------- sound ----------
const Sound = {
  on: true, music: false, cache: {}, theme: null,
  play(id) {
    if (!this.on || id == null || !A.snd[id]) return;
    try {
      let a = this.cache[id];
      if (!a) a = this.cache[id] = new Audio(A.snd[id]);
      const b = a.paused ? a : a.cloneNode();
      b.currentTime = 0; b.volume = 0.8;
      b.play().catch(() => {});
    } catch (e) {}
  },
  startTheme() {
    if (!this.music) return;
    if (!this.theme) { this.theme = new Audio(A.theme); this.theme.loop = true; this.theme.volume = 0.5; }
    this.theme.play().catch(() => {});
  },
  stopTheme() { if (this.theme) this.theme.pause(); },
};
try { const s = JSON.parse(localStorage.getItem('ho5.prefs') || '{}'); if (s.sound === false) Sound.on = false; if (s.music) Sound.music = true; } catch (e) {}
function savePrefs() { try { localStorage.setItem('ho5.prefs', JSON.stringify({ sound: Sound.on, music: Sound.music })); } catch (e) {} }

// ---------- state ----------
let G = null;            // game
const me = () => G.players[0];
const UI = {
  sel: null,             // selected star id
  selFleet: null,        // selected fleet id
  view: { s: 40, ox: 0, oy: 0 },
  inbox: [], msgIdx: 0,
  drag: null, hover: null,
  dots: [],              // hit areas for fleet dots
};

// ---------- ship pictures ----------
const shipCache = {};
function shipPic(d) {
  const key = d.type + ':' + d.R + ':' + d.V + ':' + d.W + ':' + d.S;
  if (shipCache[key]) return shipCache[key];
  const c = document.createElement('canvas');
  const cl = (v) => Math.max(0, Math.min(29, v - 1));
  if (d.type === 'scout' || d.type === 'fighter') {
    c.width = 104; c.height = 45;
    const x = c.getContext('2d');
    x.drawImage(IMG['part0_' + cl(d.V)], 0, 0);
    x.drawImage(IMG['part1_' + cl(Math.round(d.R * (d.type === 'scout' ? 0.6 : 1)))], 30, 4);
    x.drawImage(IMG['part2_' + cl(d.W)], 62, 1);
  } else {
    const k = { dread: 'dread', colony: 'colony', satellite: 'satellite', tanker: 'tanker', decoy: 'decoy', bio: 'bio' + Math.min(3, Math.floor((d.W - 1) / 3)) }[d.type] || 'colony';
    const im = IMG[k];
    c.width = im.width; c.height = im.height;
    c.getContext('2d').drawImage(im, 0, 0);
  }
  shipCache[key] = c;
  return c;
}
function shipImgEl(d, h) {
  const c = shipPic(d);
  const i = new Image(); i.src = c.toDataURL(); i.style.height = (h || 28) + 'px'; i.alt = HO.TYPES[d.type].name; i.className = 'shippic';
  return i;
}

// ---------- star appearance ----------
function starLook(sid) {
  const p = me(), s = G.stars[sid], k = HO.know(G, p, sid);
  if (s.owner === 0) return { base: planetSprite(p, s, s.metal), hat: hatFor(p, s), metal: s.metal };
  if (!k.explored) {
    if (k.battleOnly) return { base: 'battle' };
    const coming = G.fleets.some(f => f.owner === 0 && (f.to === sid || f.dest === sid));
    return { base: coming ? 'soon' : 'unknown' };
  }
  const look = { base: planetSprite(p, { g: k.g, t: k.t, id: sid }, k.metal), metal: k.metal };
  if (k.owner > 0 && G.players[k.owner]) { const o = G.players[k.owner]; look.hat = 'bad' + o.face + '_' + (o.female ? 1 : 0); }
  return look;
}
function planetSprite(p, s, metal) {
  const gs = s.g / p.homeG;
  let row;
  if (gs > 2.5) row = 0; else if (gs > 2.0) row = 1; else if (gs >= 0.5) row = 2 + (s.id % 3); else if (gs >= 0.4) row = 5; else row = 6;
  return (metal <= 0 ? 'mined' : 'planet') + row;
}
function hatFor(p, s) {
  const prof = s.pop * HO.PROD_PER_POP >= HO.BASE_UPKEEP;
  const cls = HO.planetClass(HO.seenG(p, s));
  const row = prof ? 0 : cls === 'good' ? 1 : cls === 'semi' ? 2 : 3;
  return 'white' + row + '_' + (p.female ? 1 : 0);
}

// ---------- map ----------
let cv, cx, mapW = 0, mapH = 0, dpr = 1;
const bgStars = [];
function setupMap() {
  cv = $('#map'); cx = cv.getContext('2d');
  for (let i = 0; i < 260; i++) bgStars.push({ x: Math.random(), y: Math.random(), b: Math.random() });
  new ResizeObserver(resize).observe(cv.parentElement);
  cv.addEventListener('pointerdown', onDown);
  cv.addEventListener('pointermove', onMove);
  cv.addEventListener('pointerup', onUp);
  cv.addEventListener('pointercancel', () => { UI.drag = null; draw(); });
  cv.addEventListener('dblclick', onDbl);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.offsetX, e.offsetY, e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  resize();
}
function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  mapW = r.width; mapH = r.height;
  cv.width = Math.round(mapW * dpr); cv.height = Math.round(mapH * dpr);
  cv.style.width = mapW + 'px'; cv.style.height = mapH + 'px';
  if (G && !UI.fitted) fit();
  draw();
}
function fit() {
  if (!G || !mapW) return;
  const pad = 30;
  const s = Math.min((mapW - pad * 2) / G.W, (mapH - pad * 2 - 30) / G.H);
  UI.view = { s, ox: (mapW - G.W * s) / 2, oy: (mapH - 30 - G.H * s) / 2 + 4 };
  UI.fitted = true;
}
function zoomAt(px, py, f) {
  const v = UI.view;
  const ns = Math.max(12, Math.min(140, v.s * f));
  const wx = (px - v.ox) / v.s, wy = (py - v.oy) / v.s;
  v.s = ns; v.ox = px - wx * ns; v.oy = py - wy * ns;
  draw();
}
const sx = (x) => UI.view.ox + x * UI.view.s;
const sy = (y) => UI.view.oy + y * UI.view.s;
function planetPx() { return Math.max(18, Math.min(52, UI.view.s * 0.9)); }
function starAt(px, py) {
  const r = planetPx() * 0.6;
  let best = null, bd = 1e9;
  for (const s of G.stars) { const d = Math.hypot(sx(s.x) - px, sy(s.y) - py); if (d < r && d < bd) { bd = d; best = s.id; } }
  return best;
}
function dotAt(px, py) {
  for (let i = UI.dots.length - 1; i >= 0; i--) { const d = UI.dots[i]; if (px >= d.x - 2 && px <= d.x + d.w + 2 && py >= d.y - 2 && py <= d.y + d.h + 2) return d; }
  return null;
}
function countBucket(n) { return n <= 1 ? 0 : n <= 10 ? 1 : n <= 30 ? 2 : 3; }

function draw() {
  if (!cx) return;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.fillStyle = '#04030c'; cx.fillRect(0, 0, mapW, mapH);
  for (const b of bgStars) { cx.fillStyle = `rgba(200,210,255,${0.15 + b.b * 0.5})`; cx.fillRect(b.x * mapW, b.y * mapH, b.b > 0.9 ? 2 : 1, b.b > 0.9 ? 2 : 1); }
  if (!G) return;
  const ps = planetPx();
  cx.imageSmoothingEnabled = ps < 40;
  UI.dots = [];
  // routes of my fleets
  for (const f of G.fleets) {
    if (f.owner !== 0) continue;
    if (f.to != null) {
      const a = G.stars[f.from], b = G.stars[f.to];
      drawRoute(a, b, HO.fleetSpeed(G, f), '#7fd0ff', f.prog / f.dist);
    } else if (f.dest != null) {
      drawRoute(G.stars[f.star], G.stars[f.dest], HO.fleetSpeed(G, f), '#ffe066', 0, f.fuel >= 2 * HO.starDist(G, f.star, f.dest));
    }
  }
  // stars
  for (const s of G.stars) {
    const x = sx(s.x), y = sy(s.y);
    if (x < -60 || y < -60 || x > mapW + 60 || y > mapH + 60) continue;
    const look = starLook(s.id);
    if (UI.sel === s.id) {
      const g = cx.createRadialGradient(x, y, ps * 0.3, x, y, ps * 0.95);
      g.addColorStop(0, 'rgba(255,240,170,0.75)'); g.addColorStop(1, 'rgba(255,200,80,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, ps * 0.95, 0, Math.PI * 2); cx.fill();
    }
    const im = IMG[look.base];
    if (im) cx.drawImage(im, x - ps / 2, y - ps / 2, ps, ps);
    if (look.metal > 0 && look.base.startsWith('planet')) {
      const lv = Math.min(4, Math.floor(look.metal / 5000));
      cx.globalAlpha = 0.75; cx.drawImage(IMG['metal' + lv], x - ps / 2, y - ps / 2, ps, ps); cx.globalAlpha = 1;
    }
    // satellites ring
    const sats = G.fleets.filter(f => f.star === s.id && f.sat && (f.owner === 0 || visibleTo(s.id)));
    if (sats.length) {
      cx.strokeStyle = sats.some(f => f.owner === 0) ? 'rgba(120,230,255,0.9)' : 'rgba(255,120,200,0.9)';
      cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(x, y, ps * 0.62, ps * 0.62, 0, 0, Math.PI * 2); cx.stroke();
    }
    if (look.hat && IMG[look.hat]) { const h = ps * 1.18; cx.drawImage(IMG[look.hat], x - h / 2, y - h * 0.62, h, h * (IMG[look.hat].height / IMG[look.hat].width)); }
    // name
    if (UI.view.s > 18) {
      cx.font = `${Math.max(9, Math.min(12, UI.view.s / 3.6))}px Geneva, Verdana, sans-serif`;
      cx.textAlign = 'center'; cx.fillStyle = s.owner === 0 ? '#fff6d0' : '#9aa3c7';
      cx.fillText(s.name, x, y + ps / 2 + 11);
    }
    drawDots(s, x, y, ps);
  }
  // in-transit dots
  for (const f of G.fleets) {
    if (f.owner !== 0 || f.to == null) continue;
    const a = G.stars[f.from], b = G.stars[f.to], t = Math.min(1, f.prog / f.dist);
    const x = sx(a.x + (b.x - a.x) * t), y = sy(a.y + (b.y - a.y) * t);
    const kind = HO.fleetKind(G, f), T = HO.TYPES[kind];
    const im = IMG['dot0_' + T.dot + '_' + countBucket(HO.fleetCount(f))];
    const w = 14;
    cx.fillStyle = '#f4f7ff'; cx.beginPath(); cx.roundRect(x - w / 2 - 2, y - w / 2 - 2, w + 4, w + 4, 3); cx.fill();
    cx.drawImage(im, x - w / 2, y - w / 2, w, w);
    UI.dots.push({ x: x - w / 2, y: y - w / 2, w, h: w, f: f.id, transit: true });
  }
  // dragging
  if (UI.drag && UI.drag.fleet != null && UI.drag.moved) {
    const f = G.fleets.find(f => f.id === UI.drag.fleet);
    const a = G.stars[f.star];
    const tgt = UI.hover;
    let x2 = UI.drag.x, y2 = UI.drag.y;
    let ok = true, round = false;
    if (tgt != null && tgt !== f.star) {
      x2 = sx(G.stars[tgt].x); y2 = sy(G.stars[tgt].y);
      const d = HO.starDist(G, f.star, tgt); ok = d <= f.fuel + 1e-9; round = 2 * d <= f.fuel + 1e-9;
    }
    cx.save();
    cx.strokeStyle = ok ? '#ffe066' : '#8a8a8a'; cx.lineWidth = 2;
    if (!ok) cx.setLineDash([4, 5]);
    cx.beginPath(); cx.moveTo(sx(a.x), sy(a.y)); cx.lineTo(x2, y2); cx.stroke();
    cx.setLineDash([]);
    if (ok && tgt != null) { arrowHead(sx(a.x), sy(a.y), x2, y2, '#ffe066'); if (round) arrowHead(x2, y2, sx(a.x), sy(a.y), '#ffe066'); }
    if (tgt != null && tgt !== f.star) {
      const d = HO.starDist(G, f.star, tgt);
      const turns = Math.ceil(d / HO.fleetSpeed(G, f) - 1e-9);
      const label = ok ? `${d.toFixed(1)} away · ${turns} turn${turns === 1 ? '' : 's'}` : `Too far: ${d.toFixed(1)} away, fuel ${f.fuel.toFixed(1)}`;
      cx.font = '12px Geneva, Verdana, sans-serif'; cx.textAlign = 'left';
      const tw = cx.measureText(label).width;
      cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(x2 + 12, y2 - 24, tw + 10, 18);
      cx.fillStyle = ok ? '#ffe066' : '#ccc'; cx.fillText(label, x2 + 17, y2 - 11);
    }
    cx.restore();
  }
}
function visibleTo(sid) {
  if (G.stars[sid].owner === 0) return true;
  return G.fleets.some(f => f.owner === 0 && f.star === sid && f.to == null);
}
function drawDots(s, x, y, ps) {
  const here = G.fleets.filter(f => f.star === s.id && f.to == null && (f.owner === 0 || visibleTo(s.id)));
  if (!here.length) return;
  const w = Math.max(13, Math.min(18, ps * 0.36));
  let ri = 0, li = 0;
  for (const f of here) {
    const mine = f.owner === 0;
    const kind = f.sat ? 'satellite' : HO.fleetKind(G, f);
    const im = IMG['dot' + (mine ? 0 : 4) + '_' + HO.TYPES[kind].dot + '_' + countBucket(HO.fleetCount(f))];
    let dx, dy;
    if (f.sat) { dx = x - ps / 2 - w - 1; dy = y - ps / 2 + li * (w + 2); li++; }
    else { dx = x + ps / 2 + 1; dy = y - ps / 2 + ri * (w + 2); ri++; }
    cx.fillStyle = UI.selFleet === f.id ? '#ffe066' : (mine ? '#f4f7ff' : '#ffe3f1');
    cx.beginPath(); cx.roundRect(dx - 2, dy - 2, w + 4, w + 4, 3); cx.fill();
    cx.drawImage(im, dx, dy, w, w);
    if (f.dest != null && mine) { cx.fillStyle = '#ffe066'; cx.fillRect(dx + w - 4, dy, 4, 4); }
    UI.dots.push({ x: dx, y: dy, w, h: w, f: f.id, star: s.id, mine, sat: f.sat });
  }
}
function drawRoute(a, b, speed, color, frac, round) {
  const x1 = sx(a.x), y1 = sy(a.y), x2 = sx(b.x), y2 = sy(b.y);
  cx.strokeStyle = color; cx.lineWidth = 1.6; cx.globalAlpha = 0.85;
  cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
  arrowHead(x1, y1, x2, y2, color);
  if (round) arrowHead(x2, y2, x1, y1, color);
  // turn ticks
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  for (let t = speed; t < d - 1e-6; t += speed) {
    const fx = x1 + (x2 - x1) * t / d, fy = y1 + (y2 - y1) * t / d;
    cx.fillStyle = color; cx.beginPath(); cx.arc(fx, fy, 2.4, 0, Math.PI * 2); cx.fill();
  }
  cx.globalAlpha = 1;
}
function arrowHead(x1, y1, x2, y2, color) {
  const a = Math.atan2(y2 - y1, x2 - x1), back = planetPx() * 0.55, L = 9;
  const tx = x2 - Math.cos(a) * back, ty = y2 - Math.sin(a) * back;
  cx.fillStyle = color; cx.beginPath(); cx.moveTo(tx, ty);
  cx.lineTo(tx - Math.cos(a - 0.45) * L, ty - Math.sin(a - 0.45) * L);
  cx.lineTo(tx - Math.cos(a + 0.45) * L, ty - Math.sin(a + 0.45) * L); cx.closePath(); cx.fill();
}

// ---------- pointer ----------
function onDown(e) {
  if (!G) return;
  cv.setPointerCapture(e.pointerId);
  const px = e.offsetX, py = e.offsetY;
  const dot = dotAt(px, py);
  if (dot && dot.mine && !dot.sat && !dot.transit && !G.over) {
    UI.drag = { fleet: dot.f, x: px, y: py, sx: px, sy: py, moved: false, t: performance.now() };
    UI.selFleet = dot.f; UI.sel = dot.star; renderPanel(); draw();
    return;
  }
  if (dot) { UI.selFleet = dot.f; const f = G.fleets.find(f => f.id === dot.f); if (f && f.star != null) UI.sel = f.star; renderPanel(); draw(); return; }
  UI.drag = { pan: true, x: px, y: py, sx: px, sy: py, ox: UI.view.ox, oy: UI.view.oy, moved: false };
}
function onMove(e) {
  if (!G) return;
  const px = e.offsetX, py = e.offsetY;
  const d = UI.drag;
  if (!d) { const s = starAt(px, py); cv.style.cursor = dotAt(px, py) ? 'grab' : s != null ? 'pointer' : 'default'; return; }
  if (Math.hypot(px - d.sx, py - d.sy) > 4) d.moved = true;
  d.x = px; d.y = py;
  if (d.pan) { if (d.moved) { UI.view.ox = d.ox + (px - d.sx); UI.view.oy = d.oy + (py - d.sy); draw(); } return; }
  UI.hover = starAt(px, py);
  draw();
}
function onUp(e) {
  const d = UI.drag; UI.drag = null;
  if (!G || !d) return;
  const px = e.offsetX, py = e.offsetY;
  if (d.pan) {
    if (!d.moved) { const s = starAt(px, py); UI.sel = s; UI.selFleet = null; renderPanel(); draw(); }
    return;
  }
  const f = G.fleets.find(f => f.id === d.fleet);
  if (!f) return;
  const tgt = starAt(px, py);
  if (!d.moved) {
    if (performance.now() - d.t > 700 && f.dest != null) { HO.cancelMove(G, f); Sound.play(4000); }
    draw(); renderPanel(); return;
  }
  if (tgt == null || tgt === f.star) { if (f.dest != null) { HO.cancelMove(G, f); Sound.play(4000); } }
  else if (HO.orderMove(G, f, tgt)) Sound.play(4001);
  else { Sound.play(7016); toast(`${G.stars[tgt].name} is out of range. This fleet has ${f.fuel.toFixed(1)} fuel; the trip is ${HO.starDist(G, f.star, tgt).toFixed(1)}.`); }
  UI.hover = null; draw(); renderPanel(); save();
}
function onDbl(e) {
  if (!G) return;
  const s = starAt(e.offsetX, e.offsetY);
  if (s == null) return;
  if (G.stars[s].owner === 0) openBuild(s);
  else { const b = [...G.battles].reverse().find(b => b.star === s && b.sides.includes(0)); if (b) openBattle(b.id); }
}

// ---------- left panel ----------
function bar(label, val, max, onSet, opts) {
  opts = opts || {};
  const track = el('div', { class: 'track', role: 'slider', tabindex: 0, 'aria-label': label, 'aria-valuenow': Math.round(val / max * 100) });
  const fill = el('div', { class: 'fill' + (opts.cls ? ' ' + opts.cls : '') });
  fill.style.width = (max > 0 ? Math.min(100, val / max * 100) : 0) + '%';
  track.append(fill);
  const set = (ev) => {
    const r = track.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
    fill.style.width = f * 100 + '%';
    onSet(f, false);
  };
  track.addEventListener('pointerdown', (ev) => { track.setPointerCapture(ev.pointerId); set(ev); track._drag = true; });
  track.addEventListener('pointermove', (ev) => { if (track._drag) set(ev); });
  track.addEventListener('pointerup', (ev) => { track._drag = false; onSet(null, true); });
  track.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    ev.preventDefault();
    const cur = parseFloat(fill.style.width) / 100 || 0;
    const f = Math.max(0, Math.min(1, cur + (ev.key === 'ArrowRight' ? 0.05 : -0.05)));
    fill.style.width = f * 100 + '%'; onSet(f, false); onSet(null, true);
  });
  return el('div', { class: 'barrow' + (opts.rowCls ? ' ' + opts.rowCls : '') },
    el('span', { class: 'blabel', title: opts.title || label }, label),
    track,
    el('span', { class: 'bval' }, opts.right || ''));
}
// proportional budget setter: entries [{key, get, set}]
function setShare(entries, idx, f) {
  // f is the new fraction (0..1) for entries[idx]; others scale to fill 1-f
  const others = entries.filter((_, i) => i !== idx);
  const otot = others.reduce((a, e) => a + e.get(), 0);
  entries[idx].set(f);
  for (const e of others) e.set(otot > 0 ? e.get() / otot * (1 - f) : (1 - f) / others.length);
}
function budgetEntries() {
  const p = me(), b = p.budget;
  const norm = () => { let t = b.tech + b.savings; for (const k in b.col) t += b.col[k]; return t || 1; };
  const n = norm();
  b.tech /= n; b.savings /= n; for (const k in b.col) b.col[k] /= n;
  const list = [
    { key: 'tech', label: 'Tech', get: () => b.tech, set: (v) => b.tech = v },
    { key: 'savings', label: 'Savings', get: () => b.savings, set: (v) => b.savings = v },
  ];
  for (const s of HO.colonies(G, 0)) list.push({ key: s.id, label: s.name, star: s.id, get: () => b.col[s.id] || 0, set: (v) => b.col[s.id] = v });
  return list;
}
function renderPanel() {
  if (!G) return;
  const p = me();
  const panel = $('#panel');
  const scroll = panel.scrollTop;
  panel.innerHTML = '';
  $('#title').textContent = `${p.name} in ${G.opts.galaxy || 'Milky Way'} in ${G.year}`;
  // budget info
  const pr = HO.projected(G, p);
  const net = pr.net;
  panel.append(el('section', { class: 'box info' },
    row('Savings', money(p.savings), p.savings < 0 ? 'neg' : ''),
    row('Income', money(pr.income), pr.income < 0 ? 'neg' : ''),
    pr.interest ? row(pr.interest > 0 ? 'Interest' : 'Interest owed', money(pr.interest), pr.interest < 0 ? 'neg' : '') : null,
    row('Metal', fmt(p.metal)),
  ));
  // budget bars
  const ents = budgetEntries();
  const spendable = Math.max(0, net);
  const bb = el('section', { class: 'box' }, el('h3', null, 'Budget'));
  ents.forEach((e, i) => {
    const s = e.star != null ? G.stars[e.star] : null;
    const amt = e.get() * spendable;
    bb.append(bar(e.label, e.get(), 1, (f, end) => {
      if (f != null) { setShare(ents, i, f); ents.forEach((x, j) => { const r = bb.querySelectorAll('.barrow')[j]; if (r) { r.querySelector('.fill').style.width = x.get() * 100 + '%'; r.querySelector('.bval').textContent = money(x.get() * spendable); } }); }
      if (end) { renderPanel(); save(); }
    }, { right: money(amt), cls: e.key === 'tech' ? 'tech' : e.key === 'savings' ? 'sav' : 'col', rowCls: s && UI.sel === s.id ? 'hl' : '' }));
  });
  if (net <= 0) bb.append(el('p', { class: 'warn' }, 'After supporting your colonies and paying interest, there is nothing left to spend.'));
  panel.append(bb);
  // tech bars
  const tb = el('section', { class: 'box' }, el('h3', null, 'Technology'));
  const techSpend = spendable * p.budget.tech;
  const tents = HO.TECHS.map(k => ({ key: k, get: () => p.talloc[k], set: (v) => p.talloc[k] = v }));
  let tt = tents.reduce((a, e) => a + e.get(), 0) || 1; tents.forEach(e => e.set(e.get() / tt));
  const tnames = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Mini', radical: 'Radical' };
  tents.forEach((e, i) => {
    const lvl = e.key === 'radical' ? '' : p.tech[e.key];
    const nm = e.key !== 'radical' ? (HO.DATA.techNames[e.key] || [])[p.tech[e.key] - 1] : null;
    tb.append(bar(`${tnames[e.key]}${lvl !== '' ? ' ' + lvl : ''}`, e.get(), 1, (f, end) => {
      if (f != null) { setShare(tents, i, f); tents.forEach((x, j) => { const r = tb.querySelectorAll('.barrow')[j]; if (r) r.querySelector('.fill').style.width = x.get() * 100 + '%'; }); }
      if (end) { renderPanel(); save(); }
    }, { right: money(e.get() * techSpend), cls: 'tbar', title: nm && !/^\d+$/.test(nm) ? nm : tnames[e.key] }));
  });
  panel.append(tb);
  // planet
  if (UI.sel != null) panel.append(planetBox(UI.sel));
  panel.scrollTop = scroll;
}
function row(k, v, cls) { return el('div', { class: 'kv ' + (cls || '') }, el('span', null, k), el('b', null, v)); }
function planetBox(sid) {
  const p = me(), s = G.stars[sid], k = HO.know(G, p, sid);
  const look = starLook(sid);
  const box = el('section', { class: 'box planet' });
  const pic = el('div', { class: 'ppic' });
  pic.append(el('img', { src: A.img[look.base], alt: '' }));
  if (look.hat) pic.append(el('img', { src: A.img[look.hat], class: 'phat', alt: '' }));
  const ownerName = s.owner === 0 ? 'You' : k.explored && k.owner > 0 ? G.players[k.owner].name : k.explored ? 'No one' : 'Unknown';
  box.append(el('div', { class: 'phead' }, pic, el('div', null, el('h3', null, s.name), el('div', { class: 'sub' }, ownerName + (k.explored && s.owner !== 0 && k.seen >= 0 && k.seen < G.turn ? ` (seen ${2000 + k.seen * 10})` : '')))));
  if (s.owner === 0 || k.explored) {
    const src = s.owner === 0 ? s : k;
    const gs = src.g / p.homeG, ts = 72 + (src.t - p.homeT);
    box.append(row('Gravity', gs.toFixed(2) + 'G' + classNote(gs)), row('Temp', Math.round(ts) + '°'), row('Metal', fmt(src.metal)));
    if (s.owner === 0) {
      const gross = s.pop * HO.PROD_PER_POP;
      box.append(row('Population', fmt(s.pop * 1e6)), row('Max population', fmt(HO.maxPop(G, p, s) * 1e6)), row('Income', money(gross - HO.BASE_UPKEEP), gross < HO.BASE_UPKEEP ? 'neg' : ''));
      const terraOK = Math.abs(HO.seenT(p, s) - 72) > 0.5, metalOK = s.metal > 0;
      if (terraOK && metalOK) {
        const sl = el('div', { class: 'tm' }, el('span', null, 'Terraform'),
          el('input', { type: 'range', min: 0, max: 100, value: Math.round(s.terra * 100), 'aria-label': 'Terraform versus mining', oninput: (ev) => { s.terra = ev.target.value / 100; }, onchange: save }),
          el('span', null, 'Mine'));
        box.append(sl);
      } else box.append(el('p', { class: 'note' }, !terraOK && !metalOK ? 'Fully terraformed and mined out. Its budget goes to savings.' : !terraOK ? 'Fully terraformed; its budget goes to mining.' : 'No metal left; its budget goes to terraforming.'));
      box.append(el('div', { class: 'btns' },
        el('button', { onclick: () => openBuild(sid) }, 'Build ships…'),
        s.id !== p.homeStar || HO.colonies(G, 0).length > 1 ? el('button', { class: 'quiet', onclick: () => confirmBox(`Evacuate ${s.name}? Your colonists will leave; satellites stay.`, () => { HO.evacuate(G, 0, sid); Sound.play(7002); renderPanel(); draw(); save(); }) }, 'Evacuate') : null));
    } else if (k.owner > 0) {
      box.append(row('Population', k.pop ? '~' + fmt(k.pop * 1e6) : '?'));
    }
  } else box.append(el('p', { class: 'note' }, k.battleOnly ? 'Unexplored, but there has been a battle here.' : 'Unexplored. Send a ship to find out more.'));
  // fleets here
  const here = G.fleets.filter(f => f.star === sid && f.to == null && (f.owner === 0 || visibleTo(sid)));
  const inbound = G.fleets.filter(f => f.owner === 0 && f.to === sid);
  if (here.length || inbound.length) {
    const fl = el('div', { class: 'fleets' }, el('h4', null, 'Ships here'));
    for (const f of here) fl.append(fleetRow(f));
    for (const f of inbound) fl.append(fleetRow(f, true));
    box.append(fl);
    const mine = here.filter(f => f.owner === 0 && !f.sat);
    if (mine.length > 1) box.append(el('div', { class: 'btns' }, el('button', { class: 'quiet', onclick: () => { const [a, ...rest] = mine; rest.forEach(b => HO.mergeFleets(G, a, b)); UI.selFleet = a.id; renderPanel(); draw(); save(); } }, 'Merge all fleets here')));
  }
  const b = [...G.battles].reverse().find(b => b.star === sid && b.sides.includes(0));
  if (b) box.append(el('div', { class: 'btns' }, el('button', { class: 'quiet', onclick: () => openBattle(b.id) }, `Review battle (${b.year})`)));
  return box;
}
function classNote(gs) { const c = HO.planetClass(gs); return c === 'inhospitable' ? ' · never profitable' : c === 'semi' ? ' · barely habitable' : ''; }
function fleetRow(f, inbound) {
  const mine = f.owner === 0;
  const p = G.players[f.owner];
  const ds = HO.fleetDesigns(G, f);
  const sel = UI.selFleet === f.id;
  const r = el('div', { class: 'frow' + (sel ? ' sel' : '') + (mine ? '' : ' enemy'), onclick: () => { UI.selFleet = f.id; renderPanel(); draw(); } });
  const pics = el('div', { class: 'fpics' });
  ds.slice(0, 3).forEach(d => pics.append(shipImgEl(d, 18)));
  r.append(pics);
  const parts = Object.keys(f.ships).map(k => { const d = HO.getDesign(G, f.owner, +k); return `${f.ships[k]} ${f.ships[k] === 1 ? d.name : d.name}`; });
  let status = '';
  if (inbound) status = `arriving in ${Math.ceil((f.dist - f.prog) / HO.fleetSpeed(G, f))} turn(s)`;
  else if (!mine) status = p.name;
  else if (f.sat) status = 'satellites';
  else status = (f.dest != null ? `→ ${G.stars[f.dest].name}` : 'holding') + ` · fuel ${f.fuel.toFixed(1)}/${HO.fleetMaxRange(G, f)} · speed ${HO.fleetSpeed(G, f)}`;
  r.append(el('div', { class: 'ftext' }, el('div', null, parts.join(', ')), el('div', { class: 'sub' }, status)));
  if (sel && mine && !inbound && !f.sat) {
    const acts = el('div', { class: 'facts' });
    if (f.dest != null) acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); HO.cancelMove(G, f); Sound.play(4000); renderPanel(); draw(); } }, 'Stay here'));
    if (HO.fleetCount(f) > 1) acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); openSplit(f); } }, 'Split…'));
    acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); confirmBox(`Scrap this fleet for ${Math.round(HO.TYPES ? 75 : 75)}% of its metal?`, () => { const m = HO.scrapFleet(G, f); Sound.play(7003); toast(`Scrapped for ${fmt(m)} metal.`); UI.selFleet = null; renderPanel(); draw(); save(); }); } }, 'Scrap'));
    r.append(acts);
  }
  return r;
}

// ---------- messages ----------
function showMessages() {
  UI.inbox = G.inbox.slice(); UI.msgIdx = 0;
  renderMsg();
}
function renderMsg() {
  const box = $('#msg');
  box.innerHTML = '';
  if (G.over && UI.msgIdx >= UI.inbox.length) {
    box.append(el('div', { class: 'card end' }, el('img', { src: A.img[G.winner === 0 ? 'p3030' : 'p3040'], alt: '' }),
      el('div', null, el('p', null, G.winner === 0 ? 'You conquered the galaxy.' : 'The game is over.'), el('button', { onclick: newGameDialog }, 'New game'))));
    return;
  }
  if (UI.msgIdx < UI.inbox.length) {
    const m = UI.inbox[UI.msgIdx];
    if (m.sound) Sound.play(m.sound);
    const card = el('div', { class: 'card', tabindex: 0, role: 'button', 'aria-label': 'Next message' });
    const big = m.big || (m.jpg != null ? 'jpg' : null);
    if (m.jpg != null) card.append(el('img', { class: 'jpg', src: A.jpg[m.jpg], alt: '' }));
    else if (m.icon && A.img[m.icon]) card.append(el('img', { class: m.big ? 'bigicon' : 'icon', src: A.img[m.icon], alt: '' }));
    const body = el('div', { class: 'mtext' }, el('p', null, m.text));
    const extra = el('div', { class: 'mbtns' });
    if (m.battle) extra.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); openBattle(m.battle); } }, 'Review battle'));
    body.append(extra, el('div', { class: 'count' }, `${UI.msgIdx + 1} of ${UI.inbox.length} · click to continue`));
    card.append(body);
    const next = () => { if (m.star != null) { UI.sel = m.star; renderPanel(); } UI.msgIdx++; Sound.play(7001); renderMsg(); draw(); };
    card.addEventListener('click', next);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } });
    if (m.star != null) { UI.sel = m.star; renderPanel(); draw(); }
    box.append(card);
    card.focus({ preventScroll: true });
    return;
  }
  const clock = el('button', { class: 'clock', onclick: doEndTurn, 'aria-label': 'End turn' },
    el('span', { class: 'face', html: '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#fffef6" stroke="#222" stroke-width="2.5"/><path d="M20 20V8M20 20l8 5" stroke="#222" stroke-width="3" stroke-linecap="round"/></svg>' }),
    el('span', null, 'End turn'));
  box.append(clock);
}
function doEndTurn() {
  if (!G || G.over) return;
  HO.endTurn(G);
  Sound.play(11111);
  save();
  // keep selection valid
  if (UI.selFleet != null && !G.fleets.some(f => f.id === UI.selFleet)) UI.selFleet = null;
  renderPanel(); draw();
  if (!G.inbox.length) G.inbox.push({ text: `Year ${G.year}. Nothing much happened.`, icon: 'm9024', quiet: true });
  showMessages();
}

// ---------- dialogs ----------
function modal(title, content, opts) {
  opts = opts || {};
  closeModal();
  const win = el('div', { class: 'win ' + (opts.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    el('div', { class: 'wtitle' }, el('button', { class: 'close', 'aria-label': 'Close', onclick: closeModal }), el('span', null, title)),
    el('div', { class: 'wbody' }, content));
  const back = el('div', { class: 'scrim', onclick: (e) => { if (e.target === back && !opts.sticky) closeModal(); } }, win);
  document.body.append(back);
  UI.modal = back; UI.onClose = opts.onClose;
  const f = win.querySelector('button:not(.close), input, select'); if (f) f.focus();
  return win;
}
function closeModal() { if (UI.modal) { UI.modal.remove(); UI.modal = null; const c = UI.onClose; UI.onClose = null; if (c) c(); } }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.modal) closeModal(); });
function confirmBox(text, yes) {
  const w = modal('Are you sure?', el('div', null, el('p', null, text), el('div', { class: 'btns right' },
    el('button', { class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { onclick: () => { closeModal(); yes(); } }, 'OK'))), { cls: 'small' });
}
function toast(t) {
  const d = el('div', { class: 'toast', role: 'status' }, t);
  document.body.append(d); setTimeout(() => d.remove(), 3600);
}

// ----- build ships -----
function openBuild(sid) {
  const p = me(), s = G.stars[sid];
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker'];
  if (HO.techSum(p) >= HO.DREAD_TECH) types.push('dread');
  if (p.hasBio) types.push('bio');
  if (p.hasDecoy) types.push('decoy');
  const st = UI.build = UI.build || { type: 'fighter' };
  if (!types.includes(st.type)) st.type = 'fighter';
  const body = el('div', { class: 'build' });
  const render = () => {
    body.innerHTML = '';
    const left = el('div', { class: 'blist' });
    left.append(el('div', { class: 'money' }, `Savings ${money(p.savings)} · Metal ${fmt(p.metal)}`));
    const designs = p.designs.filter(d => !d.scrapped && types.includes(d.type));
    const builtHere = (did) => p.spentThisTurn.filter(e => e.sid === sid && e.did === did).length;
    for (const d of designs) {
      const c = HO.shipCostNow(G, p, d);
      const n = builtHere(d.id);
      const can = (p.savings - c.money >= HO.borrowLimit(G, p)) && p.metal >= c.metal;
      left.append(el('div', { class: 'drow' },
        shipImgEl(d, 26),
        el('div', { class: 'dtext' }, el('b', null, d.name), el('div', { class: 'sub' }, `${HO.TYPES[d.type].name} · R${d.type === 'satellite' ? 0 : d.R} Sp${d.V} W${d.W} Sh${d.S} M${d.M}`),
          el('div', { class: 'sub' }, `${money(c.money)} · ${fmt(c.metal)} metal${c.proto ? ' (incl. prototype)' : ''}`)),
        el('div', { class: 'pm' },
          el('button', { class: 'quiet', disabled: !n, 'aria-label': 'Remove one', onclick: () => { HO.unbuildShip(G, 0, sid, d.id); render(); renderPanel(); draw(); } }, '−'),
          el('span', { class: 'n' }, String(n)),
          el('button', { disabled: !can, 'aria-label': 'Build one', onclick: () => { if (HO.buildShips(G, 0, sid, d.id, 1)) Sound.play(7006); render(); renderPanel(); draw(); } }, '+'))));
    }
    // designer
    const L = HO.designLimits(p, st.type);
    for (const k of ['R', 'V', 'W', 'S', 'M']) { if (st[k] == null || st._t !== st.type) st[k] = L[k]; st[k] = Math.max(1, Math.min(L[k] || 1, st[k])); }
    st._t = st.type;
    const spec = { type: st.type, R: st.type === 'satellite' ? 0 : st.R, V: st.V, W: st.W, S: st.S, M: st.M };
    const c = HO.designCost(spec);
    const exists = p.designs.find(d => d.type === spec.type && d.R === spec.R && d.V === spec.V && d.W === spec.W && d.S === spec.S && d.M === spec.M);
    const right = el('div', { class: 'designer' }, el('h4', null, 'Design a new type'));
    const tsel = el('div', { class: 'types' });
    for (const t of types) tsel.append(el('button', { class: 'tbtn' + (st.type === t ? ' on' : ''), onclick: () => { st.type = t; render(); } }, HO.TYPES[t].name));
    right.append(tsel);
    const prev = el('div', { class: 'preview' }); prev.append(shipImgEl(spec, 48)); right.append(prev);
    const lab = { R: 'Range', V: 'Speed', W: 'Weapons', S: 'Shields', M: 'Mini' };
    for (const k of ['R', 'V', 'W', 'S', 'M']) {
      if (k === 'R' && st.type === 'satellite') continue;
      const max = L[k] || 1;
      right.append(el('label', { class: 'slide' }, el('span', null, lab[k]),
        el('input', { type: 'range', min: 1, max, value: st[k], disabled: max <= 1, oninput: (e) => { st[k] = +e.target.value; render(); } }),
        el('b', null, `${st[k]}/${max}`)));
    }
    right.append(el('p', { class: 'sub' }, `${money(c.money)} and ${fmt(c.metal)} metal each` + (exists && exists.built ? '' : `, plus ${money(c.proto)} to build the prototype`) + '.'));
    if (st.type === 'scout') right.append(el('p', { class: 'note' }, 'Scouts get 3 extra range but weaker weapons and shields. Each scout flies alone.'));
    if (st.type === 'satellite') right.append(el('p', { class: 'note' }, 'Satellites can’t move. They shoot twice per round.'));
    if (st.type === 'colony') right.append(el('p', { class: 'note' }, 'Colony ships settle the first unowned planet they’re sent to.'));
    if (st.type === 'mini') {}
    right.append(el('div', { class: 'btns' }, el('button', { onclick: () => {
      const d = HO.findOrCreateDesign(G, p, spec);
      if (HO.buildShips(G, 0, sid, d.id, 1)) { Sound.play(7006); } else toast('Not enough money or metal.');
      render(); renderPanel(); draw();
    } }, exists && exists.built ? `Build another ${exists.name}` : 'Build the prototype')));
    body.append(left, right);
  };
  render();
  modal(`Build ships at ${s.name}`, body, { cls: 'wide', onClose: () => save() });
}
function openSplit(f) {
  const take = {};
  const body = el('div', null, el('p', { class: 'sub' }, 'Choose ships to move into a new fleet.'));
  for (const k in f.ships) {
    const d = HO.getDesign(G, f.owner, +k); take[k] = 0;
    const n = el('b', null, '0');
    body.append(el('div', { class: 'drow' }, shipImgEl(d, 22), el('div', { class: 'dtext' }, `${d.name} (${f.ships[k]})`),
      el('div', { class: 'pm' }, el('button', { class: 'quiet', onclick: () => { take[k] = Math.max(0, take[k] - 1); n.textContent = take[k]; } }, '−'), n,
        el('button', { class: 'quiet', onclick: () => { take[k] = Math.min(f.ships[k], take[k] + 1); n.textContent = take[k]; } }, '+'))));
  }
  body.append(el('div', { class: 'btns right' }, el('button', { onclick: () => { const nf = HO.splitFleet(G, f, take); if (nf) UI.selFleet = nf.id; closeModal(); renderPanel(); draw(); save(); } }, 'Split fleet')));
  modal('Split fleet', body, { cls: 'small' });
}

// ----- battle replay -----
function openBattle(bid) {
  const b = G.battles.find(x => x.id === bid);
  if (!b) { toast('The record of that battle is no longer available.'); return; }
  const c = el('canvas', { class: 'bcv', width: 760, height: 380 });
  const status = el('p', { class: 'sub' }, '');
  const body = el('div', null, c, status);
  modal(`Battle at ${G.stars[b.star].name}, ${b.year}`, body, { cls: 'wide', onClose: () => { b._stop = true; } });
  const x = c.getContext('2d');
  // layout: sides spread horizontally
  const sides = b.sides;
  const cols = sides.length;
  const pos = [];
  const counts = {};
  b.start.forEach((u, i) => { counts[u.o] = (counts[u.o] || 0) + 1; });
  const idx = {};
  b.start.forEach((u, i) => {
    const si = sides.indexOf(u.o), n = counts[u.o];
    idx[u.o] = (idx[u.o] || 0) + 1;
    const k = idx[u.o] - 1;
    const per = Math.ceil(Math.sqrt(n * 1.6));
    const colW = 760 / cols;
    const cw = Math.min(64, (colW - 30) / Math.max(1, Math.ceil(n / per)));
    const ch = Math.min(40, 300 / per);
    const gx = Math.floor(k / per), gy = k % per;
    const mirror = si % 2 === 1;
    const bx = si * colW + 20 + (mirror ? (colW - 40 - gx * cw - cw) : gx * cw);
    pos.push({ x: bx, y: 50 + gy * ch, w: cw, h: ch, mirror });
  });
  const alive = b.start.map(() => true);
  const planetSide = b.planetOwner >= 0 ? sides.indexOf(b.planetOwner) : -1;
  const pl = { x: planetSide >= 0 ? planetSide * (760 / cols) + (760 / cols) / 2 : -1, y: 330 };
  let pop = b.pop0;
  const drawAll = (shot) => {
    x.fillStyle = '#04030c'; x.fillRect(0, 0, 760, 380);
    for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(200,210,255,.35)'; x.fillRect((i * 97) % 760, (i * 53) % 380, 1, 1); }
    sides.forEach((o, si) => {
      const pp = G.players[o];
      x.fillStyle = o === 0 ? '#fff2c0' : '#ffb3d9'; x.font = '13px Geneva, Verdana, sans-serif'; x.textAlign = 'center';
      x.fillText(o === 0 ? 'You' : pp.name, si * (760 / cols) + (760 / cols) / 2, 24);
    });
    if (pl.x >= 0) {
      const s = G.stars[b.star]; const p = me();
      x.globalAlpha = pop > 0.01 ? 1 : 0.3;
      x.drawImage(IMG[planetSprite(p, s, 1)], pl.x - 22, pl.y - 22, 44, 44);
      x.globalAlpha = 1;
      x.fillStyle = '#ccc'; x.font = '11px Geneva, Verdana, sans-serif'; x.fillText(`pop ${fmt(pop * 1e6)}`, pl.x, pl.y + 36);
    }
    b.start.forEach((u, i) => {
      if (!alive[i]) return;
      const d = HO.getDesign(G, u.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 };
      const im = shipPic(d); const P = pos[i];
      const sc = Math.min(P.w / im.width, P.h / im.height) * 0.92;
      x.save(); x.translate(P.x + P.w / 2, P.y + P.h / 2); if (P.mirror) x.scale(-1, 1);
      x.drawImage(im, -im.width * sc / 2, -im.height * sc / 2, im.width * sc, im.height * sc); x.restore();
    });
    if (shot) {
      x.strokeStyle = shot.a === 0 ? '#ffe066' : '#ff6fb5'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(shot.x1, shot.y1); x.lineTo(shot.x2, shot.y2); x.stroke();
    }
  };
  const center = (i) => i < 0 ? { x: pl.x, y: pl.y } : { x: pos[i].x + pos[i].w / 2, y: pos[i].y + pos[i].h / 2 };
  let r = 0, e = 0;
  const step = () => {
    if (b._stop) return;
    if (r >= b.rounds.length) {
      drawAll();
      const mine = (b.survivors[0] || 0);
      status.textContent = `Battle over after ${b.rounds.length} round${b.rounds.length === 1 ? '' : 's'}. ` + sides.map(o => `${o === 0 ? 'You' : G.players[o].name} lost ${b.lost[o] || 0}`).join('; ') + '.' + (b.planetDied ? ' The colony was wiped out.' : '');
      return;
    }
    const ev = b.rounds[r][e];
    if (!ev) { r++; e = 0; if (b.popR) pop = b.popR[r - 1]; status.textContent = `Round ${r + 1}`; setTimeout(step, 160); return; }
    const a = center(ev.si);
    let t;
    if (ev.p) { t = { x: pl.x, y: pl.y }; Sound.play(3000); }
    else { t = center(ev.ti); if (ev.k) { alive[ev.ti] = false; Sound.play(e % 3 === 0 ? 3003 : 3002); } else if (e % 4 === 0) Sound.play(3000 + (e % 2)); }
    drawAll({ x1: a.x, y1: a.y, x2: t.x, y2: t.y, a: ev.a });
    if (ev.k && !ev.p) { const P = pos[ev.ti]; x.drawImage(IMG.debris, 0, 0, 288, 138, P.x - 6, P.y - 4, P.w + 12, P.h + 8); }
    e++;
    setTimeout(step, Math.max(18, 110 - b.rounds[r].length * 2));
  };
  status.textContent = 'Round 1';
  drawAll(); setTimeout(step, 400);
}

// ----- players -----
function openPlayers() {
  const rows = G.players.map(p => ({ p, sc: HO.score(G, p) })).sort((a, b) => b.sc - a.sc);
  const t = el('table', { class: 'ptable' }, el('thead', null, el('tr', null, el('th', null, ''), el('th', null, 'Player'), el('th', null, 'Colonies seen'), el('th', null, 'Status'))));
  const tb = el('tbody');
  for (const { p } of rows) {
    const face = p.human ? 'white0_' + (p.female ? 1 : 0) : 'bad' + p.face + '_' + (p.female ? 1 : 0);
    const seen = p.human ? HO.colonies(G, 0).length : G.stars.filter(s => { const k = HO.know(G, me(), s.id); return k.explored && k.owner === p.id; }).length;
    tb.append(el('tr', { class: p.alive ? '' : 'dead' }, el('td', null, el('img', { src: A.img[face], alt: '', class: 'face' })), el('td', null, p.human ? p.name + ' (you)' : p.name), el('td', null, String(seen)), el('td', null, p.alive ? 'In the game' : 'Eliminated')));
  }
  t.append(tb);
  const h = me().hist;
  const g = el('canvas', { width: 520, height: 160, class: 'graph' });
  const body = el('div', null, t, el('h4', null, 'Your history'), g, el('p', { class: 'sub' }, 'Gold: total population. Blue: income. Green: tech.'));
  modal('Players', body, { cls: 'mid' });
  const x = g.getContext('2d');
  x.fillStyle = '#0b0a1a'; x.fillRect(0, 0, 520, 160);
  const plot = (key, color) => {
    if (h.length < 2) return;
    const max = Math.max(...h.map(e => e[key]), 1);
    x.strokeStyle = color; x.lineWidth = 2; x.beginPath();
    h.forEach((e, i) => { const px = 10 + i / (h.length - 1) * 500, py = 150 - e[key] / max * 135; i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.stroke();
  };
  plot('pop', '#ffd166'); plot('inc', '#7fd0ff'); plot('tech', '#7be37b');
}

// ----- help -----
function openHelp() {
  const tips = HO.DATA.tips || [];
  const body = el('div', { class: 'help' },
    el('p', null, 'Play with the bar charts to divide your money. Click a message to see the next one; when they’re all read, click the clock to end your turn. Double-click your colony to build ships. Drag a fleet’s dot to another star to send it there; drag it back onto its own star to cancel.'),
    el('h4', null, 'Planets'), el('p', null, 'Good planets are near 1.00G and 72°. Terraforming moves temperature toward 72°; gravity never changes. Anything above 2.5G or below 0.4G will never turn a profit, but you can still strip-mine it and then evacuate. Every colony costs $7,500 a turn to support until its population grows.'),
    el('h4', null, 'Ships'), el('p', null, 'Range is total fuel; ships refuel at your own colonies. A path drawn with two arrowheads means the fleet can get there and back. Speed sets how far a fleet goes each turn and who shoots first. Weapons against Shields decides damage. Mini makes ships cost more money but less metal.'),
    el('h4', null, 'Money and metal'), el('p', null, 'Savings earn a little interest. You can borrow up to five times your income, at 15% a turn. Metal only comes from mining, and it runs out.'),
    el('h4', null, 'Tip'), el('p', { class: 'tip' }, tips.length ? tips[Math.floor(Math.random() * tips.length)] : ''),
    el('p', { class: 'sub' }, 'This remake uses the original art, sounds, and text. Its rules are reconstructed from the manual (the “Claude” ruleset); numbers are not the original formulas.'));
  modal('How to play', body, { cls: 'mid' });
}

// ----- new game / title -----
function titleScreen() {
  const t = $('#titlescreen');
  t.hidden = false;
  const has = !!localStorage.getItem('ho5.save');
  const frame = $('#tframe'), fx = frame.getContext('2d');
  let i = 0;
  clearInterval(UI.anim);
  const paint = (k) => { fx.fillStyle = '#fff'; fx.fillRect(0, 0, 304, 200); fx.drawImage(IMG.p6999, 0, 0); if (k != null) fx.drawImage(IMG['t' + (7000 + k)], 96, 1); };
  paint(null);
  setTimeout(() => {
    UI.anim = setInterval(() => { paint(i % 18); if (i % 18 === 9) Sound.play(7023); i++; if (i > 54) { clearInterval(UI.anim); paint(0); Sound.play(7022); } }, 110);
  }, 900);
  $('#tcont').hidden = !has;
  Sound.startTheme();
}
function hideTitle() { $('#titlescreen').hidden = true; clearInterval(UI.anim); Sound.stopTheme(); }
function newGameDialog() {
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); start(); } });
  const sel = (name, label, opts, def) => el('label', null, el('span', null, label), el('select', { name }, ...opts.map(([v, t]) => el('option', { value: v, selected: v === def ? 'selected' : false }, t))));
  f.append(
    el('label', null, el('span', null, 'Your name'), el('input', { name: 'name', value: localStorage.getItem('ho5.name') || 'Jake', maxlength: 20 })),
    el('label', null, el('span', null, 'Galaxy name'), el('input', { name: 'galaxy', value: 'Milky Way', maxlength: 24 })),
    sel('female', 'Your hat', [['0', 'Cowboy'], ['1', 'Cowgirl']], '0'),
    sel('computers', 'Computer players', [1, 2, 3, 4, 5, 6, 7, 8].map(n => [String(n), String(n)]), '4'),
    sel('iq', 'Computer IQ', [['dumb', 'Dumb'], ['average', 'Average'], ['smart', 'Smart']], 'average'),
    sel('start', 'Your home system', [['outpost', 'Outpost'], ['barren', 'Barren'], ['backward', 'Backward'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['thriving', 'Thriving'], ['abundant', 'Abundant']], 'normal'),
    sel('cstart', 'Computer home systems', [['outpost', 'Outpost'], ['barren', 'Barren'], ['backward', 'Backward'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['thriving', 'Thriving'], ['abundant', 'Abundant']], 'normal'),
    sel('shape', 'Galaxy shape', [['random', 'Random'], ['ring', 'Ring'], ['cluster', 'Cluster'], ['spiral', 'Spiral'], ['grid', 'Grid'], ['hex', 'Hex']], 'random'),
    sel('size', 'Galaxy size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['huge', 'Humongous']], 'medium'),
    sel('density', 'Galaxy density', [['dense', 'Dense'], ['normal', 'Normal'], ['sparse', 'Sparse']], 'normal'),
    sel('rules', 'Rules', [['claude', 'Claude (reconstructed from the manual)']], 'claude'),
    el('div', { class: 'btns right' }, el('button', { type: 'submit' }, 'Create galaxy')));
  const start = () => {
    const d = Object.fromEntries(new FormData(f).entries());
    localStorage.setItem('ho5.name', d.name);
    G = HO.newGame({ seed: (Math.random() * 2 ** 31) | 0, name: d.name || 'You', galaxy: d.galaxy || 'Milky Way', female: d.female === '1', computers: +d.computers, iq: d.iq, start: d.start, cstart: d.cstart, shape: d.shape, size: d.size, density: d.density, rules: d.rules });
    closeModal(); hideTitle();
    UI.sel = G.players[0].homeStar; UI.selFleet = null; UI.fitted = false; fit();
    Sound.play(128);
    save(); renderPanel(); draw(); showMessages();
  };
  modal('Create galaxy', f, { cls: 'mid' });
}
function continueGame() {
  try { G = HO.load(localStorage.getItem('ho5.save')); } catch (e) { toast('That saved game could not be read.'); return; }
  hideTitle(); UI.sel = G.players[0].homeStar; UI.fitted = false; fit(); renderPanel(); draw();
  G.inbox = [{ text: `Welcome back. It’s the year ${G.year}.`, icon: 'm9024' }]; showMessages();
}
function save() { if (!G) return; try { localStorage.setItem('ho5.save', HO.save(G)); } catch (e) {} }

// ---------- menus ----------
function setupMenus() {
  const menus = {
    Game: [['New game…', newGameDialog], ['Players and history', () => G && openPlayers()], ['Auto-play this turn', () => { if (!G || G.over) return; me().auto = true; doEndTurn(); me().auto = false; }], ['-'], ['Quit to title', () => { save(); Sound.play(7002); G = null; renderPanel(); draw(); $('#panel').innerHTML = ''; $('#msg').innerHTML = ''; titleScreen(); }]],
    Ships: [['Build ships at selected colony…', () => { if (G && UI.sel != null && G.stars[UI.sel].owner === 0) openBuild(UI.sel); else toast('Select one of your colonies first.'); }], ['Review last battle', () => { const b = G && [...G.battles].reverse().find(b => b.sides.includes(0)); if (b) openBattle(b.id); else toast('No battles yet.'); }], ['Next fleet', nextFleet]],
    View: [['Zoom in', () => zoomAt(mapW / 2, mapH / 2, 1.3)], ['Zoom out', () => zoomAt(mapW / 2, mapH / 2, 1 / 1.3)], ['Fit galaxy', () => { UI.fitted = false; fit(); draw(); }], ['-'], [() => (Sound.on ? 'Turn sound off' : 'Turn sound on'), () => { Sound.on = !Sound.on; savePrefs(); }], [() => (Sound.music ? 'Turn theme music off' : 'Turn theme music on'), () => { Sound.music = !Sound.music; savePrefs(); if (Sound.music && !$('#titlescreen').hidden) Sound.startTheme(); else Sound.stopTheme(); }]],
    Help: [['How to play', openHelp]],
  };
  const bar = $('#menubar');
  for (const name in menus) {
    const btn = el('button', { class: 'mbtn', 'aria-haspopup': 'true' }, name);
    const dd = el('div', { class: 'dropdown', role: 'menu' });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.contains('open');
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      if (open) return;
      dd.innerHTML = '';
      for (const [label, fn] of menus[name]) {
        if (label === '-') { dd.append(el('hr')); continue; }
        dd.append(el('button', { role: 'menuitem', onclick: () => { dd.classList.remove('open'); fn(); } }, typeof label === 'function' ? label() : label));
      }
      dd.classList.add('open');
    });
    bar.append(el('div', { class: 'menu' }, btn, dd));
  }
  document.addEventListener('click', () => document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open')));
}
function nextFleet() {
  if (!G) return;
  const mine = G.fleets.filter(f => f.owner === 0 && f.star != null && !f.sat);
  if (!mine.length) return;
  const i = mine.findIndex(f => f.id === UI.selFleet);
  const f = mine[(i + 1) % mine.length];
  UI.selFleet = f.id; UI.sel = f.star; renderPanel(); draw();
}
document.addEventListener('keydown', (e) => {
  if (UI.modal || !G) return;
  if (e.key === 'Tab' && e.target === document.body) { e.preventDefault(); nextFleet(); }
});

// ---------- boot ----------
window.addEventListener('DOMContentLoaded', () => {
  Object.assign(HO.DATA, window.HODATA);
  setupMenus();
  $('#tnew').addEventListener('click', newGameDialog);
  $('#tcont').addEventListener('click', continueGame);
  $('#thelp').addEventListener('click', openHelp);
  loadManifest(() => loadImages(() => { setupMap(); titleScreen(); }));
});
})();
