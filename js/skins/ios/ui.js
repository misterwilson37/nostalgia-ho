// Spaceward Ho! web remake — the iOS skin (see js/skins.js)
//
// The art, sounds and look of Spaceward Ho! 1.2.9 for iPhone and iPad (Ariton
// Technologies, 2012; this build 2017) on top of the classic skin's page: this
// file says which of the app's pictures go where (window.HOTHEME, read by
// js/skins/classic/ui.js), then loads the classic skin. The pictures and
// sounds come from the app bundle (tools/extract/ios.py, assets/skins/ios/);
// almost all of them are Retina (@2x, -hd) pictures, drawn here at half their
// size. Where each is used was read from the app's code (docs/ios-findings.md,
// "Art and sound"); what wasn't read is marked as a guess. The app is
// landscape only, the map filling the screen with a sidebar of buttons at the
// right; the page keeps the classic layout with the panel moved to the right
// (style.css). A finger gets the app's gestures in every skin (ui.js, "touch").
(function () {
'use strict';
const P = 'ios:';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const trunc = Math.trunc;

const images = {
  p3030: 'Game_You_Won', p3040: 'Game_You_Lost', // the end of the game
  haloAlly: 'halo1', // an ally's colony (StarNode's halo)
  haloBuddy: 'halo2', // a best buddy's (the cyan one)
};
// the report pictures: 5.0.5's message pictures 9000-9050 redrawn at 80 x 80
// (+[MessageNode reportIcon:] builds "report_icon-%ld")
for (let n = 0; n <= 50; n++) images['m' + (9000 + n)] = 'report_icon-' + n;
// hats: your colonies by how they pay (the classic skin's rows: paying, then
// losing money on a good, a semi-habitable and a hostile planet) are
// player_<row>_<m|f>; another player's, enemy_<hat>_<m|f> (16 hats)
for (let row = 0; row < 4; row++) for (const f of [0, 1]) images['white' + row + '_' + f] = `player_${row}_${f ? 'f' : 'm'}`;
for (let n = 0; n < 16; n++) for (const f of [0, 1]) images['bad' + n + '_' + f] = `enemy_${n}_${f ? 'f' : 'm'}`;
// fleet markers: fleet_dots_<self|self_unfueld|self_old|others>_<class>_<count>,
// the classic skin's four sets of your own (plain, not fully fuelled, old,
// both) and everyone else's; the app has no "old and unfuelled" set, so that
// one is the old set (a guess)
const DOT_SET = ['self', 'self_unfueld', 'self_old', 'self_old', 'others'];
for (let set = 0; set < 5; set++) for (let t = 0; t < 7; t++) for (let b = 0; b < 4; b++) images[`dot${set}_${t}_${b}`] = `fleet_dots_${DOT_SET[set]}_${t}_${b}`;

// The planet (-[PlanetNode update:temp:metal:] 0x100090e58, read in the
// disassembly for the format strings' arguments): "planet_%d%@", one of seven
// planets by its gravity against your home's (the 5.0.5 sizes: 252, 201,
// 126, 76, 51, 39 per cent), with "_mined" below 100 metal. T is 720 + its
// temperature less your home's, in tenths (StarNode updateFor:withStar:
// withGame: 0x10001af5c). Over 770 the hot cover at min(100, (T - 770) / 30)
// x 1.5 / 255 opacity; under 650 "ice_cover%d" with T / 130, held to 0-4
// (so the coldest planets have ice_cover0); with 100 metal or more
// "boulder_0%d", 5 less one for each of 1,000, 2,500, 5,000 and 10,000
// reached (100-999 boulder_05, 10,000 or more boulder_01). Each cover is cut
// to the planet's shape (the app scales them to the planet's size). Drawn at
// 120 pixels (the 240 pixel Retina art at half size).
const SIZE = 120;
const cache = {};
function row(p, g) {
  const pct = trunc(Math.round(g * 100) * 100 / Math.max(1, Math.round(p.homeG * 100)));
  return [252, 201, 126, 76, 51, 39].filter(v => pct < v).length;
}
// The supernova, as the app times it. The turn a star blows, the map runs
// SupernovaAnimate on it (-[MapLayer ...] 0x10000e4ec, the stars whose nova
// year, +0x14, is this year): a CCActionInterval of frames x delay of
// +[SupernovaAnimate animation] (0x1000a6664: "supernova0.png" to
// "supernova19.png", 20 frames, setDelay: 0.15, the float at 0x1000d64b8),
// so 3 seconds; update: shows frame min(trunc(20 t), 19) (0x1000a64e0) by
// -[StarNode supernova:]; stop (0x1000a6354) marks the star blown
// (superNovaState:withState:) and calls supernova: nil, which shows
// supernovaed and the star dust at opacity 255 and hides the name. Before it
// the star still shows supernova_going3 (its +0x14 is the year, over 90).
// After that, each turn (-[StarNode updateFor:withStar:withGame:]
// 0x10001af5c): while the star's dust (+0x12) is 1 or more, supernovaed and
// stardust at opacity min(255, trunc(255 x dust / 20)); at 0 neither, an
// empty place. The nova sets dust to 20 (0x100030c30) and every turn takes 1
// off (0x1000323c0, LIKELY after it, so 19 the nova's turn); a big battle
// sets it back to 20 (0x1000211f4, not built: the remake keeps no dust for
// battles). Drawn: stardust under the special.
const novaStart = {}, novaPics = {};
let novaTimer = 0;
function novaLook(G, p, s, k, IMG, redraw) {
  const n = ((s.owner === p.id ? s : k) || {}).nova || 0;
  if (n < 210) return null;
  const age = Math.max(0, G.year - n), dust = 19 - age;
  const im = (x) => IMG[P + x], ok = (x) => x && x.complete !== false && x.width;
  if (age === 0) {
    const key = (G.opts && G.opts.seed) + ':' + s.id + ':' + n;
    const now = (typeof performance !== 'undefined' ? performance : Date).now();
    if (novaStart[key] == null) novaStart[key] = now;
    const t = (now - novaStart[key]) / 1000;
    if (t < 3) {
      if (redraw && !novaTimer) novaTimer = setTimeout(() => { novaTimer = 0; redraw(); }, 150 - ((t * 1000) % 150) + 1);
      const f = 'supernova' + Math.min(19, Math.trunc(t / 0.15));
      return ok(im(f)) ? { base: P + f } : null;
    }
  }
  const ck = 'nova:' + Math.max(0, dust) + ':' + (age === 0);
  if (novaPics[ck]) return { base: P + 'supernovaed', pic: novaPics[ck] };
  const sp = im('supernovaed'), du = im('stardust');
  if (!ok(sp)) return null;
  const c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height;
  if (dust < 1) return { base: P + 'supernovaed', pic: (novaPics[ck] = c) }; // nothing left
  const x = c.getContext('2d');
  if (ok(du)) { x.globalAlpha = age === 0 ? 1 : Math.min(255, Math.trunc(255 * dust / 20)) / 255; x.drawImage(du, 0, 0, c.width, c.height); x.globalAlpha = 1; }
  x.drawImage(sp, 0, 0, c.width, c.height);
  return { base: P + 'supernovaed', pic: (novaPics[ck] = c) };
}
// The star dust a big battle leaves (CONFIRMED, the turn's star loop 0x1000323a4-0x1000323e0 and
// -[StarNode updateFor:withStar:withGame:] 0x10001b078): each step the star's dust (+0x12) loses 1,
// and a star with the big-battle flag (sub_100021108, 0x1000211f4) is set to 20; while it is 1 or
// more (and the star isn't in its explosion) the stardust picture is drawn at opacity
// min(255, 255 x dust / 20), on any star. rs.starDust: the rules note the step (G.dust505[star]).
// Drawn over the planet (the order wasn't read); shown where the player has explored (the remake's choice).
const dustPics = {};
function dusted(r, look, { G, p, s, k, IMG }) {
  const by = G.dust505 && G.dust505[s.id];
  if (by == null || !r || /^nova/.test(look.base) || !(s.owner === p.id || (k && k.explored))) return r;
  const dust = 20 - Math.max(0, Math.round((G.year - by) / 10));
  const du = IMG[P + 'stardust'], bi = r.pic || IMG[r.base];
  if (dust < 1 || !du || !du.width || !bi || !bi.width) return r;
  const a = Math.min(255, Math.trunc(255 * dust / 20)), ck = r.base + ':' + a + ':' + (r.pic ? 'p' + (r.pic.__id || (r.pic.__id = ++dustId)) : '');
  if (!dustPics[ck]) {
    const c = document.createElement('canvas'); c.width = bi.width; c.height = bi.height; const x = c.getContext('2d');
    x.drawImage(bi, 0, 0); x.globalAlpha = a / 255; x.drawImage(du, 0, 0, c.width, c.height); x.globalAlpha = 1;
    dustPics[ck] = c;
  }
  return Object.assign({}, r, { pic: dustPics[ck] });
}
let dustId = 0;
function planetPic(IMG, p, src) {
  const r = row(p, src.g), mined = src.metal < 100;
  const T = Math.round(src.t * 10) - Math.round(p.homeT * 10) + 720;
  const hot = T > 770 ? Math.min(100, trunc((T - 770) / 30)) * 1.5 / 255 : 0;
  const ice = T < 650 ? clamp(trunc(T / 130), 0, 4) : -1;
  const rock = mined ? 0 : 5 - [1000, 2500, 5000, 10000].filter(v => src.metal >= v).length;
  const key = [r, mined, Math.round(hot * 100), ice, rock].join(':');
  if (cache[key]) return cache[key];
  const base = IMG[P + `planet_${r}${mined ? '_mined' : ''}`];
  if (!base || !base.width) return null;
  const c = document.createElement('canvas'); c.width = c.height = SIZE;
  const x = c.getContext('2d');
  x.drawImage(base, 0, 0, SIZE, SIZE);
  const over = (im, alpha) => {
    if (!im || !im.width) return;
    const t = document.createElement('canvas'); t.width = t.height = SIZE;
    const tx = t.getContext('2d');
    tx.globalAlpha = alpha; tx.drawImage(im, 0, 0, SIZE, SIZE); tx.globalAlpha = 1;
    tx.globalCompositeOperation = 'destination-in'; tx.drawImage(base, 0, 0, SIZE, SIZE);
    x.drawImage(t, 0, 0);
  };
  if (rock) over(IMG[P + 'boulder_0' + rock], 1);
  if (hot) over(IMG[P + 'hot_cover'], hot);
  if (ice >= 0) over(IMG[P + 'ice_cover' + ice], 1);
  return (cache[key] = c);
}

// Ships: the app's ship sheet is 5.0.5's ship sheet (PICT 11000) redrawn at
// twice the size and cut into parts (ship-engine-n, ship-middle-n,
// ship-weapon-n, ship-satellite-n, the colony, tanker and dreadnought bodies
// and the special designs), so a ship is put together as the classic skin
// builds it (FUN_100ad750), every distance doubled.
const SPECIAL = { bio: ['bio-1', 'bio-2', 'bio-3'], dread: ['dreadnought-1', 'dreadnought-2'], fighter: ['fighter-1', 'fighter-2'], satellite: ['satellite-1', 'satellite-2', 'satellite-3', 'satellite-4'] };
function special(d) {
  const { R, V, W, S, M } = d, t = d.type;
  if (t === 'bio') return SPECIAL.bio[W < 7 ? 0 : (W > 12 && W < 16) ? 1 : 2];
  if (t === 'scout' && W === 1) return 'scout-1';
  if (t === 'dread' && W > 30) return SPECIAL.dread[0];
  if (t === 'dread' && W === 8 && R > 10 && R < 14 && M > 1) return SPECIAL.dread[1];
  if ((t === 'fighter' || t === 'decoy') && W < 9 && V > 5) return SPECIAL.fighter[0];
  if ((t === 'fighter' || t === 'decoy') && W === 12 && S < 11) return SPECIAL.fighter[1];
  if (t === 'satellite' && W === 5 && S > 3 && S < 7) return SPECIAL.satellite[0];
  if (t === 'satellite' && W === 15 && S > 13 && S < 17) return SPECIAL.satellite[1];
  if (t === 'satellite' && W < 9 && S > 9 && S < 15) return SPECIAL.satellite[2];
  if (t === 'satellite' && S < 5 && W > 15 && W < 21) return SPECIAL.satellite[3];
  return null;
}
function shipPic(d, IMG, rusty) {
  const im = (n) => IMG[P + n];
  const part = (k, v) => im(`ship-${k}-${clamp(v, 0, 29)}`);
  const ops = []; // [picture, x, y] around the ship's centre, in Retina pixels
  const sp = special(d);
  if (sp) { const p = im('ship-special-' + sp); if (!p || !p.width) return null; ops.push([p, -trunc(p.width / 2), -trunc(p.height / 2)]); }
  else if (d.type === 'satellite') ops.push([part('satellite', d.W - 1), -40, -40]);
  else {
    const eng = part('engine', (d.R || 0) + (d.V || 0) - 8), nose = part('weapon', d.W - 1);
    if (d.type === 'dread') {
      ops.push([im('ship-dreadnaught-middle'), -130, -88]);
      for (const [x, y] of [[104, -84], [104, 22], [130, -34]]) ops.push([nose, x, y]);
      for (const [x, y] of [[-182, -90], [-182, 16], [-208, -40]]) ops.push([eng, x, y]);
    } else {
      const body = d.type === 'colony' ? [im('ship-colony-middle'), -70, -56] : d.type === 'tanker' ? [im('ship-tanker-middle'), -64, -44] : [part('middle', d.S - 1), -40, -40];
      const l = body[1], r = body[1] + (body[0] ? body[0].width : 80);
      ops.push(body, [nose, r, -40], [eng, l - 80, -40]);
    }
  }
  if (ops.some(o => !o[0] || !o[0].width)) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [p, x, y] of ops) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + p.width); y1 = Math.max(y1, y + p.height); }
  // half size: the Retina parts on a canvas half as big
  const c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) / 2); c.height = Math.ceil((y1 - y0) / 2);
  const cx = c.getContext('2d');
  for (const [p, x, y] of ops) {
    if (!rusty || !im('ship-rust')) { cx.drawImage(p, (x - x0) / 2, (y - y0) / 2, p.width / 2, p.height / 2); continue; }
    // a design far behind its owner's research: the rust laid over each part (as 5.0.5's sheet)
    const t = document.createElement('canvas'); t.width = p.width; t.height = p.height;
    const tx = t.getContext('2d'); tx.drawImage(p, 0, 0);
    tx.globalCompositeOperation = 'source-atop'; tx.drawImage(im('ship-rust'), 0, 0);
    cx.drawImage(t, (x - x0) / 2, (y - y0) / 2, p.width / 2, p.height / 2);
  }
  return c;
}


// ---------------------------------------------------------------------------
// The main screen (docs/ios-findings.md, "Main screen"; -[MainGameScene init]
// 0x10000c734, -[PlanetInfoLayer init] 0x1000b2a64 and updateData 0x1000b2df4,
// -[IncomeLayer init] 0x100008e00, -[TurnMessageLayer init] 0x10001c4e8,
// +[BarMenuItem calculate] 0x1000104ec, -[MapLayer setBoundsForSidebar]
// 0x10000db54). The app draws it in points of the device's own screen: this
// builds it in the same points (CSS --u pixels to the point), the map filling
// the window, the app's button column at the right (an iPhone) or row at the
// bottom left (an iPad), the HUD strip at the top, the totals box in the
// sidebar at the left, the report bar at the bottom left and End Turn with its
// gear at the bottom right. What the app opens from them in a screen of its
// own and the remake hasn't rebuilt yet opens the remake's window.
const SCREEN = { pad: false, u: 1, winW: 568, winH: 320, W: 255, row: 20, font: 14, gap: 4 };
const HOIOS = window.HOIOS = { sideOpen: () => false, side: () => {} };
let sideWanted = null; // the sidebar's state: the iPad opens it at the start (toggleInfo), the iPhone doesn't
function screenSize() {
  const vw = Math.max(1, window.innerWidth), vh = Math.max(1, window.innerHeight);
  // +[GraphicDefines setup]: the idiom picks the iPad's numbers or the iPhone's; a window has no idiom, so a
  // window whose short side is 600 CSS pixels or more is the iPad (the Android skin's approximation too)
  const pad = Math.min(vw, vh) >= 600, portrait = vh > vw * 1.1;
  const u = pad ? Math.max(0.6, Math.min(vh / 768, vw / 800)) : portrait ? vw / 360 : Math.min(vh / 320, vw / 480);
  const winW = vw / u, winH = vh / u;
  // +[BarMenuItem calculate]: the sidebar is 0.3 (iPad) or 0.45 (iPhone) of the width, at least 220; a row 0.08 of that, the type 0.7 of a row
  const W = Math.max(220, trunc(winW * (pad ? 0.3 : 0.45))), row = trunc(W * 0.08);
  Object.assign(SCREEN, { pad, u, winW, winH, W, row, font: row * 0.7, gap: pad ? 8 : 4 });
  const de = document.documentElement, st = de.style;
  st.setProperty('--u', u + 'px'); st.setProperty('--W', W); st.setProperty('--row', row);
  st.setProperty('--fs', String(row * 0.7)); st.setProperty('--gap', String(SCREEN.gap));
  de.classList.toggle('ios-pad', pad); de.classList.toggle('ios-phone', !pad);
  sideLayout();
}
const UIEl = (tag, cls, attrs, ...kids) => {
  const e = document.createElement(tag); if (cls) e.className = cls;
  for (const k in attrs || {}) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  for (const c of kids) if (c != null) e.append(c);
  return e;
};
const A = () => window.HOAPI;
let hudEl, hudRow, hudL, hudR, colEl, turnEl, gearBtn, tmEl, tmFill, tmThumb, sideBtn, gearOpen = false;
function sideOpen() { return document.documentElement.classList.contains('ios-side'); }
function sideLayout() {
  // -[MapLayer setBoundsForSidebar] 0x10000db54: the map's pan rectangle starts at the sidebar's width + 8 (iPad) or + 4 (iPhone)
  // (a80 x 10 from the top and bottom); the page keeps the map beside the sidebar when there is room for it
  const de = document.documentElement, room = SCREEN.winW - SCREEN.W - SCREEN.gap >= 300;
  de.style.setProperty('--mapx', (sideOpen() && room ? (SCREEN.W + SCREEN.gap) * SCREEN.u : 0) + 'px');
}
function setSide(open, quiet) {
  const de = document.documentElement;
  de.classList.toggle('ios-side', !!open);
  if (sideBtn) { sideBtn.classList.toggle('on', !!open); sideBtn.setAttribute('aria-pressed', open ? 'true' : 'false'); }
  sideLayout();
  if (!quiet && A() && A().G && A().fit) setTimeout(() => A().fit(), 220); // the map refits beside the sidebar (setBoundsForSidebar)
}
HOIOS.sideOpen = sideOpen; HOIOS.side = (o) => setSide(o);
function pic(name, cls) { const im = new Image(); im.src = HOTHEME.dir + 'sprites/' + name + '.png'; im.alt = ''; im.draggable = false; if (cls) im.className = cls; return im; }
function buildColumn(app) {
  const go = (fn) => () => { const a = A(); if (!a || !a.G) return; try { fn(a); } catch (e) { console.error(e); } };
  for (const o of app.querySelectorAll('.ios-col, .ios-graph')) o.remove();
  // -[MainGameScene init]: the column's items in order, each a CCMenuItemToggle of button-<name>.png (the second state tinted 0x7d7d7d)
  const items = [
    ['dollar', 'Information', () => setSide(!sideOpen())],            // toggleInfo: the totals and bars sidebar
    ['news', 'Reports', go(a => a.openReports())],                    // toggleHistory: the message history container
    ['planet', 'Stars', go(a => a.openStarList())],                   // toggleStars (iPhone): the explored stars list
    ['enemy', 'Players', go(a => a.openPlayers())],                   // togglePlayers (iPhone): the players list
  ]; // (the iPad's menu has the first two only; its stars and players lists are in the combined container, not rebuilt: kept difference, the buttons stay so the lists stay reachable)
  colEl = UIEl('div', 'ios-col', { role: 'toolbar', 'aria-label': 'Main buttons' });
  for (const [n, name, fn] of items) {
    const b = UIEl('button', 'ios-btn', { type: 'button', 'data-ios': n, 'aria-label': name, title: name }, pic('button-' + n));
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    if (n === 'dollar') sideBtn = b;
    colEl.append(b);
  }
  // -[MainGameScene init] (iPhone): button-graph at the top right opens the history graphs (HistoryGraphDialogLayer)
  const graph = UIEl('button', 'ios-btn ios-graph', { type: 'button', 'aria-label': 'Graphs', title: 'Graphs' }, pic('button-graph'));
  graph.addEventListener('click', go(a => a.openCompare()));
  app.append(colEl, graph);
}
// what each button of the column does here (the app's toggles, the remake's windows for the screens not yet rebuilt)
function buildScreen(doc) {
  const app = doc.getElementById('app'); if (!app) return;
  const go = (fn) => () => { const a = A(); if (!a || !a.G) return; try { fn(a); } catch (e) { console.error(e); } };
  buildColumn(app);
  // -[PlanetInfoLayer init]: the HUD strip: HUD-left and HUD-right (CCSpriteScale9, caps 8 and 5), the labels between
  hudL = UIEl('div', 'ios-hl'); hudR = UIEl('div', 'ios-hr'); hudRow = UIEl('div', 'ios-hrow');
  tmFill = UIEl('div', 'ios-tmL'); tmThumb = UIEl('div', 'ios-tmT');
  tmEl = UIEl('div', 'ios-tm', { role: 'slider', 'aria-label': 'Terraform and mine', 'aria-valuemin': '0', 'aria-valuemax': '100' }, tmFill, tmThumb);
  hudEl = UIEl('div', 'ios-hud', { 'aria-live': 'polite' }, hudL, hudR, hudRow);
  hudEl.hidden = true;
  tmDrag(tmEl);
  // -[TurnMessageLayer init]: End Turn (the report bar's own place is #msg) and, beside it, the gear (additional menus)
  gearBtn = UIEl('button', 'ios-btn ios-gear', { type: 'button', 'aria-label': 'Menu', 'aria-haspopup': 'true', title: 'Menu' }, pic('button-gear'));
  gearBtn.addEventListener('click', (e) => { e.stopPropagation(); setGear(!gearOpen); });
  turnEl = UIEl('div', 'ios-turn', null, gearBtn);
  const ui = UIEl('div', 'ios-ui', null, hudEl, turnEl);
  app.append(ui); ui.id = 'ios-ui';
  doc.addEventListener('click', (e) => { if (gearOpen && !e.target.closest('#menubar') && !e.target.closest('.ios-gear')) setGear(false); });
  // End Turn is the classic page's clock; it sits left of the gear (-[TurnMessageLayer init]: the menu's items in a row, padding a80)
  const msg = doc.getElementById('msg'); if (msg) app.append(msg);
}
function setGear(o) { gearOpen = o; document.documentElement.classList.toggle('ios-menus', o); if (gearBtn) gearBtn.classList.toggle('on', o); }
// The terraform / mine slider (CCSliderDeluxe "tmb1": slider-tmb1-left and -right, the thumb; the delegate -[PlanetInfoLayer
// valueChanged:tag:] 0x1000b38d0 sets the colony's share)
let tmStar = null;
function tmDrag(el) {
  const set = (e) => {
    const a = A(); if (!a || !a.G || tmStar == null) return;
    const r = el.getBoundingClientRect(), v = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
    const s = a.G.stars[tmStar]; if (!s || s.owner !== a.ME) return;
    s.terra = Math.round(v * 100) / 100; hud();
  };
  el.addEventListener('pointerdown', (e) => { e.stopPropagation(); el.setPointerCapture(e.pointerId); el._drag = true; set(e); });
  el.addEventListener('pointermove', (e) => { if (el._drag) set(e); });
  const end = () => { if (el._drag) { el._drag = false; const a = A(); if (a) { a.save(); a.renderPanel(); } } };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.addEventListener('keydown', (e) => {
    const a = A(); if (!a || !a.G || tmStar == null) return; const s = a.G.stars[tmStar]; if (!s || s.owner !== a.ME) return;
    const d = e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? 0.05 : 0; if (!d) return;
    e.preventDefault(); s.terra = clamp(Math.round((s.terra + d) * 100) / 100, 0, 1); hud(); a.save();
  });
  el.tabIndex = 0;
}
// -[PlanetInfoLayer updateData] 0x1000b2df4: the selected star's figures in a row of green labels
function hudLabels(a) {
  const G = a.G, p = a.me(), sel = a.UI.sel; if (sel == null) return null;
  const s = G.stars[sel], k = HO.know(G, p, sel);
  const word = (en) => (window.HOUI && HOUI.tr ? HOUI.tr(en) : en);
  const out = [];
  // the figures: under 100,000 in full, from there in the short form (vtable +0xe0 and +0xe8, FUN_10003cd4c and FUN_10003cfec)
  const sh = HO.rules(G).interestShort, big = (n, dollar) => n < 100000 ? (dollar ? a.money(n) : a.fmt(n)) : (dollar ? '$' : '') + (sh ? sh(n) : a.fmt(n));
  if (s.owner === a.ME) {
    const gs = 72 + (s.t - p.homeT);
    out.push(big(HO.planetIncome(G, p, s), true), big(HO.popNum(G, s.pop)) + ' ' + word('Pop'), a.degF(gs), a.gravF(s.g, p.homeG), a.fmt(s.metal) + ' ' + word('Metal'));
    return { labels: out, tm: sel };
  }
  if (!k.explored) return { labels: [word('Unexplored')], tm: null };
  const owner = k.owner >= 0 ? G.players[k.owner].name : word('No One');
  const stale = k.owner < 0 || !(k.seen >= G.turn) || !k.pop;
  if (stale) out.push(String(2000 + Math.max(0, k.seen) * 10), owner);
  else out.push(owner, big(HO.popNum(G, k.pop)) + ' ' + word('Pop'));
  out.push(a.degF(72 + (k.t - p.homeT)), a.gravF(k.g, p.homeG), a.fmt(k.metal) + ' ' + word('Metal'));
  return { labels: out, tm: null };
}
let hudKey = '';
function hud() {
  const a = A(); if (!a || !a.G || !hudEl) return;
  const r = hudLabels(a);
  if (!r) { hudEl.hidden = true; hudKey = ''; return; }
  const key = JSON.stringify([r, r.tm != null && a.G.stars[r.tm].terra]);
  if (key === hudKey && !hudEl.hidden) return;
  hudKey = key;
  hudRow.replaceChildren();
  for (const t of r.labels) hudRow.append(UIEl('span', 'ios-hl-t', null, t));
  tmStar = null;
  if (r.tm != null) {
    const s = a.G.stars[r.tm], p = a.me();
    // the bar is drawn only where the colony has both terraforming and mining to do (StarInfoLayer shouldDrawTMBar:player:)
    if (Math.abs(HO.seenT(p, s) - 72) > 0.5 && s.metal > 0) {
      tmStar = r.tm; const v = clamp(s.terra, 0, 1);
      tmEl.style.setProperty('--v', v); tmEl.setAttribute('aria-valuenow', String(Math.round(v * 100)));
      hudRow.append(tmEl);
    }
  }
  hudEl.hidden = false;
}
// the sidebar (-[IncomeLayer init]: the totals box W x 2.5 rows, three labels a line apart, the figure beside the label, the change at the right)
function sidebar(box, parts) {
  const info = parts.info, rows = [];
  if (info) for (const kv of info.querySelectorAll('.kv')) {
    const lab = kv.firstChild && kv.firstChild.textContent, b = kv.lastChild, chg = b && b.querySelector('.chg');
    let val = '', change = chg ? chg.textContent : '';
    if (b) { const c = b.cloneNode(true); const cc = c.querySelector('.chg'); if (cc) cc.remove(); val = c.textContent.trim(); }
    const m = /^(.*?)\s*(\(Int: .*\))$/.exec(val); if (m) { val = m[1]; change = m[2]; } // the savings line carries the interest ("(Int: $11K)")
    rows.push(UIEl('div', 'ios-inrow' + (kv.classList.contains('neg') ? ' neg' : ''), { 'data-help': kv.getAttribute('data-help') }, UIEl('span', 'l', null, lab), UIEl('span', 'v', null, val), UIEl('span', 'c', null, change)));
  }
  const income = UIEl('section', 'ios-income', null, ...rows);
  box.replaceChildren(income, parts.budget, parts.tech, ...(parts.planet ? [parts.planet] : []));
  hud();
}
function afterMsg(box, ctx) {
  const clock = box.querySelector('.clock'), card = box.querySelector('.card');
  box.classList.toggle('ios-clockbox', !!clock && !card);
  if (clock) { const f = clock.querySelector('.face'); if (f) f.remove(); }
  if (turnEl) { if (clock && !card) turnEl.prepend(box); else if (box.parentNode === turnEl) document.getElementById('app').append(box); }
  hud();
}

window.HOTHEME = {
  dir: 'assets/skins/ios/',
  prefix: P,
  // its sounds are 5.0.5's recordings as MP3s: SOUNDS.ios in js/skins.js
  images,
  select: P + 'ring', // the green ring round the selected star
  fleetPath: 'ios', // a dragged fleet's route line (js/skins/classic/ui.js iosFleetPath)
  satRing: 'rgba(200,215,235,0.85)', // the satellites' grey oval (fleet_sat_oval), as a ring
  battlePlanet: P + 'ship-planet',
  battleBg: null,
  endTurnKey: null,
  // Stars (-[StarNode updateFor:withStar:withGame:] 0x10001af5c): an
  // unexplored star is planet-question, or planet-x when no owner is known
  // and a battle was seen there, or planet-exclamation when it is the end of
  // one of your fleets' routes (the last star of its path); a star turning
  // red (its nova count, star +0x14, not 0) is supernova_going1 under 71,
  // going2 under 91, else going3; a star gone supernova shows supernovaed
  // (-[StarNode supernova:] 0x10001ac78) after the explosion (novaLook
  // below). Planets: planetPic.
  starLook(look, c) { return dusted(HOTHEME.starLook0(look, c), look, c); },
  starLook0(look, { G, p, s, k, IMG, redraw }) {
    const b = look.base, B = (n) => ({ base: P + n, hat: look.hat });
    if (b === 'unknown' || b === 'soon') {
      const end = (f) => f.path && f.path.length ? f.path[f.path.length - 1] : f.dest != null ? f.dest : f.to;
      return B(G.fleets.some(f => f.owner === p.id && end(f) === s.id) ? 'planet-exclamation' : 'planet-question');
    }
    if (b === 'battle') return B('planet-x');
    if (/^nova\d$/.test(b)) { const n = ((s.owner === p.id ? s : k) || {}).nova || 0; return B(n < 71 ? 'supernova_going1' : n < 91 ? 'supernova_going2' : 'supernova_going3'); }
    if (b === 'nova12' || b === 'nova18') return novaLook(G, p, s, k, IMG, redraw) || B(b === 'nova12' ? 'supernova10' : 'supernovaed');
    const src = look.hat && s.owner === p.id ? s : k;
    if (!src || src.g == null) return look;
    const pic = planetPic(IMG, p, src);
    return pic ? { base: look.base, pic, hat: look.hat } : look;
  },
  shipPic(d, IMG, rusty) { return shipPic(d, IMG, rusty); },
  // the title: the app's welcome screen, its name down the side and the
  // cowboy planet (hoguy_0-19) twirling his six-gun
  title(frame, IMG, Sound) {
    const name = IMG[P + 'spacewardho_name'], guy = (n) => IMG[P + 'hoguy_' + n];
    if (!name || !name.width || !guy(0) || !guy(0).width) return false;
    frame.width = 400; frame.height = 300;
    const x = frame.getContext('2d');
    const paint = (n) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, 400, 300);
      x.drawImage(name, 8, 4, name.width * 292 / name.height, 292);
      x.fillStyle = '#fff'; x.fillRect(84, 20, 300, 260);
      const g = guy(n); if (g) x.drawImage(g, 84 + (300 - g.width * 1.25) / 2, 20 + (260 - g.height * 1.25) / 2, g.width * 1.25, g.height * 1.25);
    };
    paint(0);
    const ts = document.getElementById('titlescreen'), gen = frame._gen = (frame._gen || 0) + 1;
    let i = 0;
    const tick = () => {
      if (!ts || ts.hidden || frame._gen !== gen) return;
      paint(i % 20); if (i % 20 === 10) Sound.play(7023);
      i++;
      if (i > 60) { paint(0); Sound.play(7022); i = 0; setTimeout(tick, 4000); return; }
      setTimeout(tick, 110);
    };
    setTimeout(tick, 900);
    return true;
  },
  panel: sidebar, afterMsg,
  afterDraw: () => hud(),
  page(doc) {
    buildScreen(doc); screenSize();
    window.addEventListener('resize', () => { const was = SCREEN.pad; screenSize(); if (was !== SCREEN.pad) buildColumn(doc.getElementById('app')); });
    setSide(sideWanted != null ? sideWanted : SCREEN.pad, true);
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'With the art and sounds of Spaceward Ho! 1.2.9 for iPhone and iPad (Ariton Technologies, 2017). Art by Howard Vives and Bob Van de walle.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho!';
    doc.documentElement.classList.add('skin-ios');
  },
};
// a skin built on this one (js/skins/android/ui.js) adjusts the theme here
if (window.HOTHEME_VARIANT) window.HOTHEME_VARIANT(window.HOTHEME);
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
})();
