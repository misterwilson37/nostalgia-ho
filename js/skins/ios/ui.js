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
  // +[BarMenuItem calculate] 0x1000104ec (the disassembly: frintp = round up, frintm = round down; the decompile's (int) casts are wrong):
  // the sidebar is ceil(winW x 0.3 iPad / 0.45 iPhone), at least 220; a row ceil(W x 0.08); the label column ceil(W x 0.45);
  // the type floor(row x 0.7); the bars start at labelW + 8 + 1 (barOffset: spacing is the constant 8)
  const W = Math.max(220, Math.ceil(Math.fround(winW * (pad ? 0.3 : 0.45)))), row = Math.ceil(Math.fround(W * 0.08));
  Object.assign(SCREEN, { pad, u, winW, winH, W, row, font: Math.floor(Math.fround(row * 0.7)), labelW: Math.ceil(Math.fround(W * 0.45)), gap: pad ? 8 : 4 });
  const de = document.documentElement, st = de.style;
  st.setProperty('--u', u + 'px'); st.setProperty('--W', W); st.setProperty('--row', row);
  st.setProperty('--fs', String(SCREEN.font)); st.setProperty('--more', pad ? '24' : '18'); st.setProperty('--mfs', String(Math.floor(Math.fround(row * 3 / 6)) - 1)); st.setProperty('--labw', String(SCREEN.labelW)); { const g = barGeom(); st.setProperty('--bo', String(g.barOffset)); st.setProperty('--bw', String(g.mw)); } st.setProperty('--gap', String(SCREEN.gap));
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
let gnEl, gnCv, pbEl, fdEl, fdList, fleetsOpen = false, hudEl, hudRow, hudL, hudR, colEl, turnEl, gearBtn, tmEl, tmFill, tmThumb, sideBtn, gearOpen = false;
function sideOpen() { return document.documentElement.classList.contains('ios-side'); }
// -[MainGameScene toggleNodes:] 0x10000bf5c: one container at a time. An iPad has the one (CombinedInfoContainer: totals, technology, budget bars and players);
// an iPhone's buttons show IPhoneCombinedInfoContainer (totals and technology), StarsListContainer (the budget bars: the colonies),
// PlayerListContainer; pressing the one that shows closes it.
let cont = 'info';
const CBTN = { dollar: 'info', planet: 'stars', enemy: 'players' };
function setCont(name) {
  if (SCREEN.pad || name === 'info' && !CBTN.x) { if (SCREEN.pad) { setSide(!sideOpen()); return; } }
  if (sideOpen() && cont === name) { setSide(false); return; }
  cont = name; document.documentElement.dataset.iosc = name; setSide(true);
  for (const b of document.querySelectorAll('.ios-col .ios-btn')) { const c = CBTN[b.dataset.ios]; b.classList.toggle('on', !!c && c === name); }
}
function sideLayout() {
  // -[MapLayer setBoundsForSidebar] 0x10000db54: the map's pan rectangle starts at the sidebar's width + 8 (iPad) or + 4 (iPhone)
  // (a80 x 10 from the top and bottom); the page keeps the map beside the sidebar when there is room for it
  const de = document.documentElement, room = SCREEN.winW - SCREEN.W - SCREEN.gap >= 300;
  de.style.setProperty('--mapx', (sideOpen() && room ? (SCREEN.W + SCREEN.gap) * SCREEN.u : 0) + 'px');
}
function setSide(open, quiet) {
  const de = document.documentElement;
  de.classList.toggle('ios-side', !!open);
  if (sideBtn) { sideBtn.classList.toggle('on', !!open && (SCREEN.pad || cont === 'info')); sideBtn.setAttribute('aria-pressed', open ? 'true' : 'false'); }
  if (!open) for (const b of document.querySelectorAll('.ios-col .ios-btn')) b.classList.remove('on');
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
    ['dollar', 'Information', () => setCont('info')],                  // toggleInfo: the totals and bars sidebar
    ['news', 'Reports', go(a => a.openReports())],                    // toggleHistory: the message history container
    ['planet', 'Stars', () => setCont('stars')],                       // toggleStars (iPhone): StarsListContainer, the colonies' budget bars
    ['enemy', 'Players', () => setCont('players')],                    // togglePlayers (iPhone): PlayerListContainer
  ].filter(i => !SCREEN.pad || i[0] === 'dollar' || i[0] === 'news');
  // the iPad's menu has the first two only (-[MainGameScene init]): its stars (the colonies' bars, PlayerPlanetsLayer) and players
  // (PlayerListLayer) lists are in its combined container (-[CombinedInfoContainer initWithWidth:height:button:] 0x1000b0e44), the sidebar
  colEl = UIEl('div', 'ios-col', { role: 'toolbar', 'aria-label': 'Main buttons' });
  for (const [n, name, fn] of items) {
    const b = UIEl('button', 'ios-btn', { type: 'button', 'data-ios': n, 'aria-label': name, title: name }, pic('button-' + n));
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    if (n === 'dollar') sideBtn = b;
    colEl.append(b);
  }
  // -[MainGameScene init]: an iPhone has button-graph at the top right (it opens the history graphs: HistoryGraphDialogLayer); an iPad a window shade
  // (graphs-window-shade, 200 x 24) at the top right that rolls a GraphNode (200 x 100, the fill 0xe1cccccc, the line 0xffd63c39) down from under it, open at the start
  if (!SCREEN.pad) {
    const graph = UIEl('button', 'ios-btn ios-graph', { type: 'button', 'aria-label': 'Graphs', title: 'Graphs' }, pic('button-graph'));
    graph.addEventListener('click', go(a => a.openCompare()));
    app.append(colEl, graph);
  } else {
    const shade = UIEl('button', 'ios-shade ios-graph', { type: 'button', 'aria-label': 'Graphs', title: 'Graphs', 'aria-pressed': 'true' }, pic('graphs-window-shade'));
    gnEl = UIEl('div', 'ios-gnode', { role: 'img', 'aria-label': 'History graphs' }, gnCv = UIEl('canvas', null, { width: 196, height: 96 }));
    shade.addEventListener('click', (e) => { e.stopPropagation(); const open = gnEl.classList.toggle('shut') === false; shade.setAttribute('aria-pressed', open ? 'true' : 'false'); shade.firstChild.src = HOTHEME.dir + 'sprites/graphs-window-shade' + (open ? '' : '-selected') + '.png'; });
    gnEl.addEventListener('click', go(a => a.openCompare()));
    app.append(colEl, shade, gnEl);
  }
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
  // -[PlanetButtons setupButtons] 0x1000c3928: round buttons around the selected star (add, move, organize); -[FleetMovementDialog init] (an iPhone's list of fleets)
  pbEl = UIEl('div', 'ios-pb', { hidden: '' });
  for (const [n, name, fn] of [['move', 'Fleets', () => setFleets(!fleetsOpen)], ['organize', 'Organize fleets', go(a => a.openOrganize(a.UI.sel))], ['add', 'Build ships', go(a => a.openBuild(a.UI.sel))]]) {
    const b = UIEl('button', 'ios-pbb ios-pb-' + n, { type: 'button', 'aria-label': name, title: name }, pic('button-' + n));
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    pbEl.append(b);
  }
  fdEl = UIEl('div', 'ios-fd', { hidden: '', role: 'dialog', 'aria-label': 'Fleets' }, UIEl('div', 'ios-fdbg'), UIEl('div', 'ios-fdt', null, 'Fleets'), fdList = UIEl('div', 'ios-fdl'));
  const fdx = UIEl('button', 'ios-fdx', { type: 'button', 'aria-label': 'Close' }, pic('button-x'));
  fdx.addEventListener('click', (e) => { e.stopPropagation(); setFleets(false); });
  fdEl.append(fdx);
  const pan = doc.getElementById('panel'); if (pan) { const rc = () => requestAnimationFrame(() => { recolor(pan.querySelector('.ios-bars-tech')); recolor(pan.querySelector('.ios-bars-budget')); }); pan.addEventListener('pointermove', rc); pan.addEventListener('pointerup', rc); pan.addEventListener('keyup', rc); }
  const ui = UIEl('div', 'ios-ui', null, hudEl, pbEl, fdEl, turnEl);
  app.append(ui); ui.id = 'ios-ui';
  doc.addEventListener('click', (e) => { if (gearOpen && !e.target.closest('#menubar') && !e.target.closest('.ios-gear')) setGear(false); });
  // End Turn is the classic page's clock; it sits left of the gear (-[TurnMessageLayer init]: the menu's items in a row, padding a80)
  const msg = doc.getElementById('msg'); if (msg) app.append(msg);
}
// -[MainGameScene toggleFleetMovement] 0x10000d074: the move button adds or removes the dialog (an iPhone's: the iPad has no move button)
function setFleets(o) { fleetsOpen = !!o; if (fdEl) fdEl.hidden = !fleetsOpen || SCREEN.pad || !pbShown; document.documentElement.classList.toggle('ios-fleets', fleetsOpen); }
// -[PlanetButtons updatePlanet:where:] 0x1000c3c6c: add shows for your own colony, move and organize while you have a fleet at the star; all hide while a
// fleet is dragged (fleetDragging:). -[MapLayer setScale:] 0x10000e590: the buttons' scale is the planet's on-screen scale (the page's planetTarget: 2, or 3 on an iPad,
// when zoomed in); they sit at the star (container 46 x 46 about the star: add's corner at (+23, +23), move's right edge at (-23, +23), organize's middle at (0, +35)).
let pbShown = false;
function placeButtons() {
  const a = A(); if (!a || !a.G || !pbEl || !window.HOVIEW) return;
  const v = window.HOVIEW(), sel = a.UI.sel, cv = document.getElementById('map');
  const s = sel != null ? a.G.stars[sel] : null;
  if (!s || !cv || a.G.over || v.path || !v.view) { pbEl.hidden = true; pbShown = false; if (fdEl) fdEl.hidden = true; return; }
  const own = s.owner === a.ME && a.G.players[a.ME].alive !== false;
  const ships = a.G.fleets.some(f => f.owner === a.ME && f.star === sel && f.to == null);
  const r = cv.getBoundingClientRect(), x = r.left + v.view.ox + s.x * v.view.s, y = r.top + v.view.oy + s.y * v.view.s;
  // -[MapLayer setScale:] 0x10000e590: the box's scale is the planet scale times the map's, i.e. the planets' on-screen scale (HOVIEW().target:
  // 2.0 iPhone / 3.0 iPad zoomed in, a line from 0.2 / 0.6 below), the box 46 points a side about the star (map points are CSS pixels here)
  const k = (v.target || 1) / SCREEN.u, pad = SCREEN.pad;
  const show = (cls, on) => { const b = pbEl.querySelector('.ios-pb-' + cls); if (b) b.hidden = !on || (cls === 'move' && pad); };
  show('add', own); show('move', ships); show('organize', ships);
  pbShown = own || ships;
  pbEl.hidden = !pbShown;
  pbEl.style.setProperty('--px', x + 'px'); pbEl.style.setProperty('--py', y + 'px'); pbEl.style.setProperty('--pk', (k * SCREEN.u) + 'px');
  if (fdEl) fdEl.hidden = !fleetsOpen || pad || !pbShown;
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
  const word = (en) => en; // (the page's interface translator writes them in the game's language: ui-text.js '%s Pop', '%s Metal', 'Unexplored', 'No One')
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
  // a window narrower than the strip (a portrait phone) shrinks it to fit
  hudEl.style.setProperty('--hudk', '1');
  const wdt = hudEl.offsetWidth; hudEl.style.setProperty('--hudk', String(wdt > window.innerWidth - 8 ? Math.max(0.4, (window.innerWidth - 8) / wdt) : 1));
}
// ---- the bars: -[HoBarLayer initWithWidth:height:inertial:] 0x100009a74, -[BarMenuItem initWithTarget:selector:] 0x1000106c4 and the rest ----
// A layer W wide on a BackgroundBorderNode; the items (a row high, 1 point between) from the top; in each the name right-aligned at labelW, the bar
// sprite (tech_bar_white, half the row high) from barOffset = labelW + 8 + 1, its length on the log scale (getHPercBarAmt: over mBarWidth = W - barOffset - a80
// pixels), the value text over the start of the bar; vertical lines (0, 0, 170), 1 point, at barOffset - 1 and at the values 100 ... 1000 (HoBarLayer draw).
// Colours: the technology bars' hue = ((-15 v - 1) mod 65536) / 65535 (v per mille; TechLayer getBarColor:), Tech's ((-20 v - 1) ...), Savings blends
// (255, 133, 18) to (255, 85, 0) by v, a colony's by its state (PlayerPlanetsLayer getBarColor:withVal: 0x10000b644): terraforming done (0, 0, 212); mined
// out (31, 183, 20) or, when its gravity is over 2.56 times home's, (221, 8, 6); both to do, blue blended with that by the shares; names by
// getBarStringColor: 0x10000b560: Savings and Tech (226, 226, 226) (Savings (221, 8, 6) while dipping), a colony losing money (221, 8, 6) or, far from home's
// gravity, (124, 115, 0), one earning (31, 183, 212), one being evacuated (125, 125, 125).
function hsb(h, sat, br) {
  const i = Math.floor(h * 6) % 6, f = h * 6 - Math.floor(h * 6), q = br * (1 - sat), r = br * (1 - f * sat), t = br * (1 - (1 - f) * sat);
  const [R, G, B] = [[br, t, q], [r, br, q], [q, br, t], [q, r, br], [t, q, br], [br, q, r]][i];
  return [R, G, B].map(x => Math.floor(x * 255));
}
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const GRAYN = [226, 226, 226];
function barGeom() { const barOffset = SCREEN.labelW + 8 + 1, mw = trunc(SCREEN.W - barOffset - SCREEN.gap); return { barOffset, mw }; }
function hpercTable(mw) { const t = []; for (let i = 0; i < mw; i++) t.push(trunc((Math.exp(i * 77 / mw / 32.11 + 2.302) - 10) * 10)); t[mw] = 1000; return t; }
function hperc(t, mw, v) { for (let i = 1; i <= mw; i++) if (t[i] > v) return i - 1; return mw; }
function placeGrid(box) {
  if (!box) return;
  for (const o of box.querySelectorAll('.ios-gl')) o.remove();
  const { barOffset, mw } = barGeom(), tb = hpercTable(mw), xs = [barOffset - 1];
  for (let v = 100; v <= 1000; v += 100) xs.push(barOffset + hperc(tb, mw, v));
  for (const x of xs) box.append(UIEl('i', 'ios-gl', { style: `left:calc(${x} * var(--pt))` }));
}
function colonyRatio(G, p, s) { const a = Math.round(s.g * 100), b = Math.round(p.homeG * 100), lo = Math.min(a, b), hi = Math.max(a, b); return lo ? trunc(hi * 100 / lo) : 0; }
function styleBars(box, kind, parts) {
  const a = A(), G = a && a.G; if (!box || !G) return;
  box.classList.add('ios-bars', 'ios-bars-' + kind);
  const hd = box.querySelector('h3'); if (hd && !hd.classList.contains('scaleflip')) hd.remove();
  const rows = [...box.querySelectorAll('.barrow')], p = a.me();
  rows.forEach((row, j) => {
    for (const o of row.querySelectorAll('.bval, .grid')) o.remove();
    const tr = row.querySelector('.track'), fl = row.querySelector('.fill'), lab = row.querySelector('.blabel');
    row._k = kind === 'tech' ? { kind: 'tech' } : (() => { const e = parts.ents && parts.ents[j]; return e ? { kind: e.key === 'tech' ? 'btech' : e.key === 'savings' ? 'sav' : 'col', star: e.star } : { kind: 'col' }; })();
    row.style.setProperty('--ord', kind === 'budget' && row._k.kind === 'btech' ? 1 : kind === 'budget' && row._k.kind === 'sav' ? 0 : 2 + j);
    // the name's colour (getBarStringColor:)
    let nc = GRAYN;
    if (row._k.kind === 'sav') nc = row.querySelector('.locktext') ? [221, 8, 6] : GRAYN;
    else if (row._k.kind === 'col' && row._k.star != null) {
      const s = G.stars[row._k.star], ev = HO.rules(G).evacuateToggle && HO.rules(G).evacuateToggle.marked(G, s.id);
      nc = ev ? [125, 125, 125] : HO.planetIncome(G, p, s) < 0 ? (colonyRatio(G, p, s) <= 256 ? [221, 8, 6] : [124, 115, 0]) : [31, 183, 212];
    }
    if (lab) lab.style.color = rgb(nc);
    // -[PlayerPlanetsLayer updateSelectedStar] 0x10000b890 highlights the bar of the colony on the selected star (-[BarMenuItem setHighlighted:] 0x100010d7c):
    // -[BarMenuItem draw] 0x100010c50 draws a 1 point line in the name's colour under the name (at 1 point from the bottom of the row, as wide as the name),
    // and button-evacuate (88 pixels at scale 0.7, left at a80, centred on the row) joins the row: its block calls +[AdditionalMenu tryEvacuateCurrentSelectedPlanet]
    if (row._k.kind === 'col' && row._k.star != null && a.UI.sel === row._k.star && G.stars[row._k.star].owner === a.ME) {
      if (lab) { const t = lab.textContent; lab.textContent = ''; lab.append(UIEl('span', 'nm', null, t)); lab.classList.add('hi'); }
      if (a.evacuateHere && a.evacuateHere(G.stars[row._k.star])) {
        const b = UIEl('button', 'ios-evac', { type: 'button', 'aria-label': 'Evacuate', title: 'Evacuate' }, pic('button-evacuate'));
        b.addEventListener('click', (e) => { e.stopPropagation(); const x = A(); if (x && x.G && x.UI.sel === row._k.star) x.evacuateClick(row._k.star); });
        row.append(b);
      }
    }
    const lt = row.querySelector('.locktext'); if (lt) lt.style.color = rgb(nc);
    if (tr) { tr.querySelectorAll('.grid').forEach(o => o.remove()); }
  });
  recolor(box);
}
// the bars' colours from their present values (the page keeps a share, a fraction of 1, in track._v)
function recolor(box) {
  const a = A(), G = a && a.G; if (!box || !G) return;
  const p = a.me();
  for (const row of box.querySelectorAll('.barrow')) {
    const tr = row.querySelector('.track'), fl = row.querySelector('.fill'), k = row._k; if (!tr || !fl || !k) continue;
    const v = Math.max(0, Math.min(1000, Math.round((tr._v || 0) * 1000)));
    let c;
    if (k.kind === 'tech') c = hsb((((-15 * v - 1) & 0xffff)) / 65535, 1, 1);
    else if (k.kind === 'btech') c = hsb((((-20 * v - 1) & 0xffff)) / 65535, 1, 1);
    else if (k.kind === 'sav') c = [255, trunc((85 * v + 133 * (1000 - v)) / 1000), trunc((18 * (1000 - v)) / 1000)];
    else {
      const s = G.stars[k.star], terraOK = Math.abs(HO.seenT(p, s) - 72) > 0.5, mineOK = s.metal > 0;
      const X = colonyRatio(G, p, s) <= 256 ? [31, 183, 20] : [221, 8, 6], tm = Math.round((s.terra == null ? 0.5 : s.terra) * 1000);
      if (!terraOK) c = [0, 0, 212]; else if (!mineOK) c = X;
      else c = [0, 1, 2].map(i => trunc(([0, 0, 212][i] * (1000 - tm) + X[i] * tm) / 1000));
    }
    fl.style.background = rgb(c);
  }
}
// The players list (PlayerListLayer / PlayerListContainer; the rows are PlayerMenuItem, the toggle PlayerMenuItemToggle). CONFIRMED, read in the disassembly.
// -[PlayerListLayer updateData] 0x10009d7c0 puts the players in order: those still in by their savings (player +0x40), the richest first, then those who are out
// by the time they went out (+0x3c), the latest first (an exchange sort, i before j, swapping when the first is smaller); a row is 1.5 x the bar row high and
// the list as wide as the container, a white BackgroundBorderNode (0xffffffff, the blue line). -[PlayerMenuItem update] 0x1000a2224 draws a row, in points from
// its left and bottom (H = 1.5 rows): the hat (GraphicsHoMap smallPlayerHat:) at (14, H/2), the "eliminated" sprite over it when the player is out; the
// name, black Arial of the bar's type size, left at (26, H/2) in a box W/3 wide (labelFitToSize shrinks the type a point at a time, to 6, till it fits);
// a second line, black Arial ceil(0.8 x the type), in a box 0.6 W wide centred on (W/3 + 64, H/4 - 4): for a computer "%@ %lu IQ" (the home system's
// System Names word, the game's IQ), for a human, once he is your best buddy or the year is 2000 or later, "%@ %lu IQ %@" with "%ld.%2.2ldG %@" (his home
// gravity against yours and his home temperature against yours, the temperature unit by the preference), before that the word alone; the happy or sad face
// (player_list_happy / _sad) at (W/3 + 84, H/2); and the pact word, black Arial 0.9 x the type, centred at (0.75 W, H/2), Misc Strings 175-183 by the item's
// toggle number (below), nothing for toggles 1 and 11.
// +[PlayerMenuItemToggle menuWithWidth:...] 0x10009dda0 builds each row as a CCMenuItemToggle whose items are PlayerMenuItems of one toggle number each, by
// the game's masks (FUN_10003a0ec allied, FUN_10003a148 best buddies: both sides' bit; the game's masks are the players' as they stood when the last turn
// began, so a pact asked for this turn shows from the next: the remake's G.pactPrev) and the player's own (+0x1114 allies, +0x1116 best buddies, which
// the pact lists hold here): you, or a player who is out: [1], [11] (no word); best buddies: [2 "Buddies", 3 "Only Ally"]; allied: [4 "Buddy!" if he asks
// for it too else 5 "Buddy?", 6 "Allies", 7 "Declare War"]; not allied: [8 "Ally!" if he asks for it else 9 "Ally?", 10 "Enemy"]; the item showing is
// "Buddies"/"Buddy"/"Ally" when your own bit is set (the first), "Allies" (the second) when only your alliance is, else the last. A tap steps to the next
// item (cocos2d) and -[PlayerMenuItemToggle toggle] 0x10009e34c sets or clears your bit for that item (below). The locked "Buddies" alone (the
// game's option 0x10, humans start allied) is never set by the iOS New Game.
// -[PlayerMenuItem update] 0x1000a2224 draws the happy face for a player who asks for a pact (best buddy, else alliance) you have not asked for back, the
// sad one when you ask and he does not (updateData).
const START_ORDER = ['outpost', 'barren', 'backward', 'normal', 'advanced', 'thriving', 'abundant'];
const APPWORDS = { // the app's own lists (fr.lproj / tr.lproj objectdictionary.plist): Misc Strings 175-183, System Names
  fr: { pact: { 2: 'Copains', 3: 'Tout Allié', 4: 'Copain!', 5: 'Copain?', 6: 'Alliés', 7: 'Déclarer la guerre', 8: 'Allié!', 9: 'Allié?', 10: 'Ennemi' }, sys: ['Avant-poste', 'Stérile', 'Arriéré', 'Normal', 'Avancé', 'Prospère', 'Abondant'] },
  tr: { pact: { 2: 'Arkadaşlar', 3: 'Sadece Müttefik', 4: 'Arkadaş!', 5: 'Arkadaş?', 6: 'Müttefikler', 7: 'Savaş İlan Et', 8: 'Müttefik!', 9: 'Müttefik?', 10: 'Düşman' }, sys: ['Nöbet Bölge', 'Verimsiz', 'Geri Kalmış', 'Normal', 'Gelişmiş', 'İlerleyen', 'Bol'] },
};
const PACTWORD = { 2: 'Buddies', 3: 'Only Ally', 4: 'Buddy!', 5: 'Buddy?', 6: 'Allies', 7: 'Declare War', 8: 'Ally!', 9: 'Ally?', 10: 'Enemy' };
const SYSWORD = ['Outpost', 'Barren', 'Backward', 'Normal', 'Advanced', 'Thriving', 'Abundant'];
const uiLang = () => (window.HOUI && window.HOUI.lang) || 'en';
// a label's words: the app's own French or Turkish (left as they are), else English for the page's translator (ui-text.js)
function appWord(kind, i) {
  const l = APPWORDS[uiLang()];
  if (l) return { text: kind === 'pact' ? l.pact[i] : l.sys[i], no: true };
  return { text: kind === 'pact' ? PACTWORD[i] : SYSWORD[i], no: false };
}
// the player's home system (player +0x2d, 1-7, the System Names index + 1): the start the player chose, a computer's the one its setup gave it
function homeLevel(G, p) {
  const o = G.opts || {}, rs = HO.rules(G), hum = G.players.filter(q => q.human).length;
  let st;
  if (p.human) st = o.start;
  else { const cs = rs.computerSetup ? rs.computerSetup(G, o, p.id - hum, G.players.length - hum) : null; st = cs ? cs.start : o.cstart; }
  const i = START_ORDER.indexOf(st);
  return i < 0 ? 0 : i + 1;
}
// the order (-[PlayerListLayer updateData]): the exchange sort, alive by savings, then those out by when they went out
function listOrder(G) {
  const ids = G.players.map(p => p.id), out = (p) => (p.alive ? 0 : (p.outYear505 || p.outYear || 1));
  for (let i = 0; i < ids.length - 1; i++) for (let j = i + 1; j < ids.length; j++) {
    const A = G.players[ids[i]], B = G.players[ids[j]], a = out(A), b = out(B);
    const swap = a === 0 ? (b === 0 && (A.savings || 0) < (B.savings || 0)) : (b === 0 || a < b);
    if (swap) { const t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
  }
  return ids;
}
// the pacts as the game holds them (the masks at the last turn's start: G.pactPrev; a ruleset that keeps none has them as they stand)
function pactMasks(G) {
  const prev = G.pactPrev, has = (a, b, k) => prev ? !!(prev[a] && prev[a][k] && prev[a][k].includes(b)) : false;
  const allied = (a, b) => a === b || (prev ? has(a, b, 'allies') && has(b, a, 'allies') : HO.isAllied(G, a, b));
  const buddy = (a, b) => a === b || (allied(a, b) && (prev ? has(a, b, 'buddies') && has(b, a, 'buddies') : HO.isBuddy(G, a, b)));
  return { allied, buddy };
}
// the row's toggle: { items: [toggle numbers], cur }; (me, other) for the signed-in player and a row's player
function pactToggle(G, me, p, pm, buddies) {
  if (p.id === me.id || !p.alive) return { items: [p.id === me.id ? 1 : 11], cur: 0 };
  const has = (q, k, x) => (q[k] || []).includes(x);
  const myAlly = has(me, 'allies', p.id), myBud = has(me, 'buddies', p.id), hisAlly = has(p, 'allies', me.id), hisBud = has(p, 'buddies', me.id);
  if (pm.buddy(me.id, p.id)) return { items: [2, 3], cur: myBud ? 0 : 1 };
  if (pm.allied(me.id, p.id)) return buddies ? { items: [hisBud ? 4 : 5, 6, 7], cur: myBud ? 0 : myAlly ? 1 : 2 } : { items: [6, 7], cur: myAlly ? 0 : 1 };
  return { items: [hisAlly ? 8 : 9, 10], cur: myAlly ? 0 : 1 };
}
// -[PlayerMenuItemToggle toggle] 0x10009e34c: idx is the item the tap stepped to
function pactToggled(G, me, p, pm, buddies, idx) {
  const has = (q, k, x) => (q[k] || []).includes(x);
  const set = (k, on) => { const l = (me[k] || []).filter(x => x !== p.id); if (on) l.push(p.id); me[k] = l; };
  const myAlly = has(me, 'allies', p.id), myBud = has(me, 'buddies', p.id);
  if (p.id === me.id) return;
  if (pm.buddy(me.id, p.id)) { if (idx === 1) { if (myBud) set('buddies', false); } else if (idx === 0) { if (!myBud) set('buddies', true); } return; }
  if (pm.allied(me.id, p.id)) {
    if (!buddies) { if (idx === 1 && myAlly) set('allies', false); else if (idx === 0 && !myAlly) set('allies', true); return; }
    if (idx === 0) { if (!myBud) set('buddies', true); }
    else if (idx === 2) { if (myAlly) set('allies', false); }
    else if (idx === 1) { if (myBud) set('buddies', false); else if (!myAlly) set('allies', true); }
    return;
  }
  if (idx === 0) { if (!myAlly) set('allies', true); } else if (idx === 1 && myAlly) set('allies', false);
}
// labelFitToSize (+[CCLabelTTF labelFitToSizeWithString:dimensions:alignment:fontName:fontSize:] 0x100017864): the type a point smaller until the text is as narrow as the box, to 6
let fitCx = null;
function fitSize(text, size, w) {
  if (!fitCx) { try { fitCx = document.createElement('canvas').getContext('2d'); } catch (e) { return size; } }
  const fam = getComputedStyle(document.documentElement).getPropertyValue('--appfont') || 'Arial, Helvetica, sans-serif';
  for (;;) { fitCx.font = `${size}px ${fam}`; if (fitCx.measureText(text).width <= w || size <= 6) return size; size -= 1; }
}
function textW(text, size) {
  if (!fitCx) { try { fitCx = document.createElement('canvas').getContext('2d'); } catch (e) { return text.length * size * 0.5; } }
  const fam = getComputedStyle(document.documentElement).getPropertyValue('--appfont') || 'Arial, Helvetica, sans-serif';
  fitCx.font = `${size}px ${fam}`; return fitCx.measureText(text).width;
}
// UIKit's word wrap (sizeWithFont:constrainedToSize: with the word-wrap line break mode): the words as far as they fit, a word wider than the box broken by letters
function wrapLines(text, size, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (textW(t, size) <= maxW) { line = t; continue; }
      if (line) { out.push(line); line = ''; }
      if (textW(word, size) <= maxW) { line = word; continue; }
      let c = '';
      for (const ch of word) { if (c && textW(c + ch, size) > maxW) { out.push(c); c = ''; } c += ch; }
      line = c;
    }
    out.push(line);
  }
  return out;
}
function playersList() {
  const a = A(), G = a && a.G, list = UIEl('section', 'ios-plist', { 'aria-label': 'Players', 'data-c': 'players' });
  if (!G) return list;
  const me = G.players[a.ME], pacts = HO.feature(G, 'alliances'), buddies = pacts && HO.rules(G).bestBuddies !== false, pm = pactMasks(G);
  const Wd = SCREEN.W, H = SCREEN.row * 1.5, fs = SCREEN.font, iqSize = Math.ceil(Math.fround(fs * 0.8)), iq = G.opts && typeof G.opts.iqNum === 'number' ? G.opts.iqNum : null;
  const pt = (n) => `calc(${n} * var(--pt))`;
  const sys = SYSWORD.map((_, i) => appWord('sys', i)), box = UIEl('div', 'ios-pbox');
  list.append(box);
  // -[PlayerListLayer initWithWidth:anchorPoint:position:] 0x10009d410: the list is n rows + 8 high; an iPad's, when that is over a quarter of the screen's
  // height, is the whole rows that fit in that quarter less a third of a row, and scrolls
  { const full = G.players.length * H + 8, lim = SCREEN.winH * 0.25;
    if (SCREEN.pad && full > lim) { box.style.height = pt(Math.floor(Math.fround(lim / H)) * H - H / 3); box.classList.add('scroll'); } }
  for (const id of listOrder(G)) {
    const p = G.players[id], out = !p.alive, tg = pacts ? pactToggle(G, me, p, pm, buddies) : { items: [p.id === me.id ? 1 : 11], cur: 0 };
    const row = UIEl('div', 'ios-prow', null);
    const hat = pic('player_list_' + (p.human ? 16 : p.face) + '_' + (p.female ? 'f' : 'm'), 'ios-phat');
    row.append(hat);
    if (out) row.append(pic('player_list_eliminated', 'ios-phat ios-pelim'));
    // the name
    const nm = UIEl('span', 'ios-pl ios-pname', { translate: 'no' }, p.name);
    nm.style.fontSize = pt(fitSize(p.name, fs, Wd / 3)); nm.style.top = pt(H / 2 - (fs + 4) / 2); row.append(nm);
    // the second line
    const lv = homeLevel(G, p), word = lv ? sys[lv - 1] : null;
    const hum = p.human;
    let line = null;
    if (!hum) line = iq != null ? [word, `${iq} IQ`] : [word];
    else if (pm.buddy(me.id, p.id) || G.year >= 2000) {
      const g = HO.gravText(G, p.homeG, me.homeG), t = a.degF ? a.degF(72 + (p.homeT - me.homeT)) : '';
      line = iq != null ? [word, `${iq} IQ`, `${g} ${t}`] : [word, `${g} ${t}`];
    } else line = [word];
    if (line && line.some(x => x != null && x !== '')) {
      const el = UIEl('span', 'ios-pl ios-piq', null);
      const parts = line.filter(x => x != null && x !== '');
      let size = iqSize;
      const flat = parts.map(x => (typeof x === 'string' ? x : x.text)).join(' ');
      size = fitSize(flat, iqSize, Wd * 0.6);
      parts.forEach((x, i) => { if (i) el.append(' '); if (typeof x === 'string') el.append(UIEl('span', null, { translate: 'no' }, x)); else el.append(UIEl('span', null, x.no ? { translate: 'no' } : null, x.text)); }); // ("%lu IQ" and the figures are the app's literals, not in its string lists)
      el.style.fontSize = pt(size); el.style.top = pt(H * 0.75 + 4 - (iqSize + 4) / 2); row.append(el);
    }
    // the faces
    if (pacts && !out && p.id !== me.id) {
      const has = (q, k, x) => (q[k] || []).includes(x);
      const hisB = has(p, 'buddies', me.id), hisA = has(p, 'allies', me.id), myB = has(me, 'buddies', p.id), myA = has(me, 'allies', p.id);
      const happy = (hisB && !myB) || (hisA && !myA), sad = (!hisB && myB) || (!hisA && myA);
      if (happy) row.append(pic('player_list_happy', 'ios-phat ios-pface'));
      if (sad) row.append(pic('player_list_sad', 'ios-phat ios-pface'));
    }
    // the pact word and the toggle
    const num = tg.items[tg.cur];
    if (num >= 2) {
      const w = appWord('pact', num), bt = UIEl('button', 'ios-pact', { type: 'button', title: p.name }, UIEl('span', null, w.no ? { translate: 'no' } : null, w.text));
      bt.style.fontSize = pt(fs * 0.9);
      if (tg.items.length > 1) bt.addEventListener('click', (e) => { e.stopPropagation(); const x = A(); if (!x || !x.G) return; pactToggled(G, me, p, pm, buddies, (tg.cur + 1) % tg.items.length); x.save(); x.renderPanel(); });
      else bt.classList.add('lone');
      row.append(bt);
    }
    box.append(row);
  }
  const more = UIEl('button', 'ios-pmore', { type: 'button' }, 'Players and history…');
  more.addEventListener('click', () => { const x = A(); if (x && x.G) x.openPlayers(); });
  list.append(more);
  return list;
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
  // the app's sidebar has no star box (the star's figures are the HUD strip, its commands the round buttons): its fleets go in the dialog.
  // A ruleset that is not iOS's or Android's has features the app had no screen for (the build queue, merging, battle reviews): its box stays below the bars.
  const G = A() && A().G, appRules = !!G && /^(ios|android)$/.test(G.rules || '');
  const fl = appRules && parts.planet && parts.planet.querySelector('.fleets');
  if (fdList) { fdList.replaceChildren(); if (fl) { const h = fl.querySelector('h4'); if (h) h.remove(); fdList.append(fl); } }
  // CombinedInfoContainer 0x1000b0e44: the totals, the technology bars (TechLayer), the budget bars (PlayerPlanetsLayer), the players
  styleBars(parts.tech, 'tech', parts); styleBars(parts.budget, 'budget', parts);
  income.dataset.c = 'info'; parts.tech.dataset.c = 'info'; parts.budget.dataset.c = 'stars';
  if (parts.planet && !appRules) parts.planet.dataset.c = 'stars';
  box.replaceChildren(income, parts.tech, parts.budget, ...(parts.planet && !appRules ? [parts.planet] : []));
  for (const r of parts.budget.querySelectorAll('.blabel')) { const row = r.closest('.barrow'); if (row && row._k && row._k.star != null) { r.style.cursor = 'pointer'; r.onclick = () => { const a = A(); if (a && a.G) { a.UI.sel = row._k.star; a.centerOn(row._k.star); a.renderPanel(); a.draw(); } }; } } // PlayerPlanetsLayer pressed: selects the star and scrolls the map to it
  placeGrid(parts.tech); placeGrid(parts.budget);
  box.append(playersList());
  hud();
}
// -[TurnMessageLayer init] 0x10001c4e8: End Turn (button-empty, "End Turn" 18) and the gear are one menu at the bottom right and stay there while the
// report bar (MessageNode, the layer's messageMenuItem) shows at the bottom left; the remake's page draws a report OR the clock in #msg, so while a
// report shows the skin keeps an End Turn button of its own (it calls the same doEndTurn). -[MessageNode update:] 0x100013064: the bar is
// BarMenuItem width x 3 rows; the picture's middle is 30 across and its top at 0.75 x (height - a80); the text starts at 60, vertically centred, its
// type floor(height / 6) - 1; "more..." (Misc 30, 0.6 x 24) at the bottom right while more reports follow (-[TurnMessageLayer updateMessageState]
// 0x10001cde0: shown while the current one is not the last).
// GraphNode's graph (HistoryGraphNode draw: not read): the remake's history of your population, income and tech
function drawGraph() {
  const a = A(); if (!gnCv || !a || !a.G) return;
  const x = gnCv.getContext('2d'), h = a.me().hist || [];
  x.clearRect(0, 0, 196, 96);
  if (h.length < 2) return;
  for (const [key, col] of [['pop', '#c8960a'], ['inc', '#2a5fd0'], ['tech', '#1a9a2a']]) {
    const max = Math.max(...h.map(e => e[key]), 1);
    x.strokeStyle = col; x.lineWidth = 2; x.beginPath();
    h.forEach((e, i) => { const px = 4 + i / (h.length - 1) * 188, py = 92 - e[key] / max * 86; i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.stroke();
  }
}
function afterMsg(box, ctx) {
  const clock = box.querySelector('.clock'), card = box.querySelector('.card');
  box.classList.toggle('ios-clockbox', !!clock && !card);
  if (clock) { const f = clock.querySelector('.face'); if (f) f.remove(); }
  const lbl = clock && !clock.querySelector('.ios-endt') ? (clock.textContent || '').trim() : null;
  if (clock && !clock.classList.contains('pic')) { clock.textContent = ''; clock.append(UIEl('span', 'ios-endt', null, clock.id === 'autostop' ? 'STOP' : 'End Turn')); clock.setAttribute('translate', 'yes'); }
  if (turnEl) {
    const old = turnEl.querySelector('.ios-end'); if (old) old.remove();
    const a = A();
    if (card && !card.classList.contains('end') && !card.classList.contains('waiting') && !card.classList.contains('hand') && a && a.G && !a.G.over) {
      const b = UIEl('button', 'ios-end', { type: 'button', 'aria-label': 'End turn' }, UIEl('span', 'ios-endt', null, 'End Turn'));
      b.addEventListener('click', (e) => { e.stopPropagation(); const x = A(); if (x && x.G) x.doEndTurn(); });
      turnEl.insertBefore(b, gearBtn);
    }
    if (box.parentNode !== turnEl) turnEl.prepend(box); // the message bar is the first item of the bottom right menu: [bar] [End Turn] [gear] (-[TurnMessageLayer init])
  }
  if (card) {
    const m = ctx && ctx.inbox && ctx.inbox[ctx.idx], ym = m && /^Year (\d+):?$/.exec(String(m.text || ''));
    card.classList.remove('year');
    if (ym) {
      // report 1012 "Year %d:" has no picture (FUN_100038788) and no text: -[MessageNode addDigits:] 0x100012f44 puts the year in a CCLabelAtlas of digits_atlas.png
      // (26 x 29 points a digit, from '0'), centred on the bar (-[MessageNode update:] 0x100013064 at 0x100013418)
      card.classList.add('year');
      const dg = UIEl('span', 'ios-digits', { 'aria-hidden': 'true' });
      for (const ch of ym[1]) dg.append(UIEl('i', null, { style: `--d:${ch}` }));
      card.append(dg);
    } else {
      // the five technology reports (1003-1007, "Your Range Technology has reached level %d." ...): the level in red Arial 30, centred at x 30, its top at the
      // picture's middle (update: 0x100013064 at 0x100013318: setColor 0xff, anchor (0.5, 1), the picture's top less half its height)
      const lv = m && /^Your (?:Range|Speed|Weapons|Shield|Miniaturization) Technology has reached level (\d+)\.$/.exec(String(m.text || ''));
      if (lv) card.append(UIEl('span', 'ios-lvl', { 'aria-hidden': 'true' }, lv[1]));
      // the text (update: 0x100013064 at 0x10001345c): a label from x 60, its box the size the text takes constrained to the bar's width less 64 (60 and 4)
      // and its height, measured at type floor(height / 6) and drawn a point smaller, left aligned, wrapped by words, its middle on the bar's
      const p = card.querySelector('.mtext p');
      if (p) {
        const H = SCREEN.row * 3, s0 = Math.floor(Math.fround(H / 6)), lines = wrapLines(p.textContent, s0, SCREEN.W - 64);
        const wid = Math.max(1, ...lines.map(l => textW(l, s0)));
        p.style.width = `calc(${Math.ceil(wid) + 1} * var(--pt))`; p.style.height = `calc(${lines.length * s0 * 1.15} * var(--pt))`;
        p.style.fontSize = `calc(${s0 - 1} * var(--pt))`; p.style.lineHeight = `calc(${(s0 - 1) * 1.15} * var(--pt))`;
      }
    }
    const cnt = card.querySelector('.count');
    if (cnt) { cnt.textContent = ctx && ctx.inbox && ctx.idx + 1 < ctx.inbox.length ? 'more...' : ''; cnt.setAttribute('translate', 'yes'); }
  }
  hud(); drawGraph();
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
  quietNext: true, // -[TurnMessageLayer clickMessage] plays no sound: a dismissed report is silent here
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
  afterDraw: () => { hud(); placeButtons(); },
  page(doc) {
    screenSize(); buildScreen(doc);
    window.addEventListener('resize', () => { const was = SCREEN.pad; screenSize(); hudKey = ''; hud(); if (was !== SCREEN.pad) buildColumn(doc.getElementById('app')); });
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
