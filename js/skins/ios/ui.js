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
for (let n = -1; n <= 8; n++) images['spgood' + n] = 'special_good_' + n; // the holiday hats (HatNode specialGoodStar)
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
      // -[ShipNode buildDreadnought] 0x1000183e0 (the parts' centres in points, y up, about the middle's: weapons (72, -28), (72, 25), (85, -3), engines (-71, -25), (-71, 28), (-84, 0); then updateContentSize: 211 x 88 moves every child by half of it): in these
      // Retina pixels (y down) the 80-pixel parts' top lefts are
      ops.push([im('ship-dreadnaught-middle'), -131, -88]);
      for (const [x, y] of [[104, 16], [104, -90], [130, -34]]) ops.push([nose, x, y]);
      for (const [x, y] of [[-182, 10], [-182, -96], [-208, -40]]) ops.push([eng, x, y]);
    } else {
      const body = d.type === 'colony' ? [im('ship-colony-middle'), -70, -56] : d.type === 'tanker' ? [im('ship-tanker-middle'), -65, -44] : [part('middle', d.S - 1), -40, -40];
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
  st.setProperty('--u', u + 'px'); st.setProperty('--ww', String(winW)); st.setProperty('--wh', String(winH)); st.setProperty('--W', W); st.setProperty('--row', row);
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
const CBTN = { dollar: 'info', news: 'history', planet: 'stars', enemy: 'players' };
function setCont(name) {
  // (the iPad's two containers: the combined one the dollar button shows and the history the news button does; each button closes the one it shows)
  if (sideOpen() && cont === name) { setSide(false); return; }
  cont = name; document.documentElement.dataset.iosc = name; setSide(true);
  const a = A(); if (name === 'history' && a && a.G) a.renderPanel(); // (the history list is built while it shows)
}
function colButtons(open) { for (const b of document.querySelectorAll('.ios-col .ios-btn')) { const c = CBTN[b.dataset.ios]; b.classList.toggle('on', !!open && !!c && c === cont); b.setAttribute('aria-pressed', open && c === cont ? 'true' : 'false'); } }
function sideLayout() {
  // -[MapLayer setBoundsForSidebar] 0x10000db54: the map's pan rectangle starts at the sidebar's width + 8 (iPad) or + 4 (iPhone)
  // (a80 x 10 from the top and bottom); the page keeps the map beside the sidebar when there is room for it
  const de = document.documentElement, room = SCREEN.winW - SCREEN.W - SCREEN.gap >= 300;
  de.style.setProperty('--mapx', (sideOpen() && room ? (SCREEN.W + SCREEN.gap) * SCREEN.u : 0) + 'px');
}
function setSide(open, quiet) {
  const de = document.documentElement;
  de.classList.toggle('ios-side', !!open);
  colButtons(open);
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
    ['news', 'Reports', () => setCont('history')],                    // toggleHistory: the message history container (MessageHistoryNode)
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
    graph.addEventListener('click', go(a => openGraphs()));
    app.append(colEl, graph);
  } else {
    const shade = UIEl('button', 'ios-shade ios-graph', { type: 'button', 'aria-label': 'Graphs', title: 'Graphs', 'aria-pressed': 'true' }, pic('graphs-window-shade'));
    gnEl = UIEl('div', 'ios-gnode', { role: 'img', 'aria-label': 'History graphs' }, gnCv = UIEl('canvas', null, { width: 200, height: 100 }));
    shade.addEventListener('click', (e) => { e.stopPropagation(); const open = gnEl.classList.toggle('shut') === false; shade.setAttribute('aria-pressed', open ? 'true' : 'false'); shade.firstChild.src = HOTHEME.dir + 'sprites/graphs-window-shade' + (open ? '' : '-selected') + '.png'; });
    gnEl.addEventListener('click', go(a => openGraphs()));
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
  amEl = UIEl('div', 'ios-am', { hidden: '', role: 'menu', 'aria-label': 'Menu' });
  const ui = UIEl('div', 'ios-ui', null, hudEl, pbEl, fdEl, turnEl, amEl);
  app.append(ui); ui.id = 'ios-ui';
  doc.addEventListener('click', (e) => { if (gearOpen && !e.target.closest('#menubar') && !e.target.closest('.ios-gear') && !e.target.closest('.ios-am')) setGear(false); else if (!gearOpen && document.documentElement.classList.contains('ios-menus') && !e.target.closest('#menubar') && !e.target.closest('.ios-gear') && !e.target.closest('.ios-amx')) { document.documentElement.classList.remove('ios-menus'); if (gearBtn) gearBtn.classList.remove('on'); } });
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
// The gear (-[TurnMessageLayer init]'s additionalMenu, AdditionalMenu 0x100093824): a navy bordered list of CCMenuItemFonts (Arial 24 on an iPhone, 28 on an iPad, white),
// in this order: Dip Into Savings (Misc Strings 116), Auto Play (118), Armageddon (117), Give Money/Metal (115), Scrap Ship Types (114, enabled while the player has a ship type:
// updateMenus 0x100093ec0), Main Menu (120), Preferences (122). An iPhone's are a grid of rows of 1, 2, 1, 1 and 2 items with 10 points between; an iPad's one column 8 apart,
// the box the column and 4 x a80 by 2 x a80 more; an iPad's sits at (winW - 44, 44 + 2 a80) anchored (1, 0), an iPhone's anchored (0, 0.5) at the middle of the screen. A tap
// hides it (makeHidden: scale in y to 0 in 0.1 s) and does the item: the screens are the app's (AutoPlayLayer, GiveDialogLayer, DipIntoSavingsDialogLayer, ArmageddonLayer,
// ScrapShipTypesLayer, PreferencesLayer) where the remake has built them as such, else the remake's own windows; Main Menu saves the game and goes to the title.
let amEl;
const AM_ITEMS = [
  ['Dip Into Savings', 'dip', (a) => a.openDip(), (a) => HO.feature(a.G, 'dip')],
  ['Auto Play', 'auto', (a) => a.openAutoPlay(), () => true],
  ['Armageddon', 'arm', (a) => a.toggleArmageddon(), (a) => HO.feature(a.G, 'armageddon')],
  ['Give Money/Metal', 'give', (a) => a.openGive(), (a) => HO.feature(a.G, 'gifts')],
  ['Scrap Ship Types', 'scrap', (a) => a.openScrapTypes(), (a) => a.me().designs.some(d => !d.scrapped)],
  ['Main Menu', 'main', (a) => a.quitToTitle(), () => true],
  ['Preferences', 'prefs', (a) => a.openPrefs(), () => true],
];
const AM_NAMES = { fr: { dip: "Puiser dans l'épargne", auto: 'Auto Play', arm: 'Armageddon', give: "Donner de l'argent / métal", scrap: 'Types de vaisseaux à recycler', main: 'Menu principal', prefs: 'Préférences' },
  tr: { dip: 'Tasarruftan Harca', auto: 'Otomatik Oyna', arm: 'Armageddon (en büyük savaş)', give: 'Para/Metal Ver', scrap: 'Çöpe Atılacak Gemiler', main: 'Esas Program', prefs: 'Tercihler' } };
function buildAdditionalMenu() {
  const a = A(), G = a && a.G;
  if (!amEl) return;
  amEl.replaceChildren();
  if (!G) return;
  const L = AM_NAMES[uiLang()], rows = SCREEN.pad ? AM_ITEMS.map(i => [i]) : [[0], [1, 2], [3], [4], [5, 6]].map(r => r.map(k => AM_ITEMS[k]));
  for (const r of rows) {
    const row = UIEl('div', 'ios-amr' + (r.length === 2 ? ' two' : ''));
    for (const [name, key, fn, ok] of r) {
      const on = !!ok(a), b = UIEl('button', 'ios-ami' + (on ? '' : ' off'), { type: 'button', 'aria-disabled': on ? null : 'true' }, UIEl('span', null, L ? { translate: 'no' } : null, L ? L[key] : name));
      b.addEventListener('click', (e) => { e.stopPropagation(); if (!on) return; setGear(false); const x = A(); if (x && x.G && (!x.G.over || key === 'main' || key === 'prefs')) try { fn(x); } catch (er) { console.error(er); } });
      row.append(b);
    }
    amEl.append(row);
  }
  amEl.classList.toggle('xtra', !/^(ios|android)$/.test(G.rules || ''));
  // a ruleset the app has no screen for keeps the page's menus in one more item
  if (!/^(ios|android)$/.test(G.rules || '')) {
    const b = UIEl('button', 'ios-ami ios-amx', { type: 'button' }, 'More menus…');
    b.addEventListener('click', (e) => { e.stopPropagation(); setGear(false); document.documentElement.classList.add('ios-menus'); gearOpen = true; if (gearBtn) gearBtn.classList.add('on'); });
    amEl.append(UIEl('div', 'ios-amr', null, b));
  }
}
function setGear(o) {
  gearOpen = !!o; document.documentElement.classList.remove('ios-menus');
  if (gearOpen) buildAdditionalMenu();
  // -[AdditionalMenu makeHidden] 0x1000945e8: a scale to 0 in y over 0.1 s, then hidden
  if (amEl) {
    clearTimeout(amEl._t); amEl.classList.toggle('open', gearOpen);
    if (gearOpen) { amEl.classList.remove('closing'); amEl.hidden = false; }
    else if (!amEl.hidden && !amEl.classList.contains('closing')) { amEl.classList.add('closing'); amEl._t = setTimeout(() => { amEl.hidden = true; amEl.classList.remove('closing'); }, 100); }
  }
  if (gearBtn) gearBtn.classList.toggle('on', gearOpen);
}
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
// the order (-[PlayerListLayer updateData]): the exchange sort, alive by income (player +0x40, the remake's lastGross: the figure the handover adds to savings), then those out by when they went out
function listOrder(G) {
  const ids = G.players.map(p => p.id), out = (p) => (p.alive ? 0 : (p.outYear505 || p.outYear || 1));
  for (let i = 0; i < ids.length - 1; i++) for (let j = i + 1; j < ids.length; j++) {
    const A = G.players[ids[i]], B = G.players[ids[j]], a = out(A), b = out(B);
    const swap = a === 0 ? (b === 0 && (A.lastGross || 0) < (B.lastGross || 0)) : (b === 0 || a < b);
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
    const hat = pic(hatName(p), 'ios-phat');
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
// The news screen (HistoryContainer / MessageHistoryNode: a CCInertialMenu of MessageNodes, one for each report the player has been sent, 80 at most): the
// navy bordered container's list, the newest first from the top (alignItemsVerticallyWithPadding: 0, bottom to top, the first report at the bottom, the list held
// to the top of its rectangle 2 points in), each item the width of the container and as tall as its report needs: a non end-turn MessageNode (update: 0x100013064) sizes
// itself to max(text + 2 a80, picture + 2 a80), the picture 30 from the left with its top a80 down, the text from x 60 (the width less 64 wide), no message_bar behind it;
// a year report is only its digits (29 x 1.5 high); a tap does the report's action (-[MessageNode doReportAction:game:]: select the star, review a battle...).
function historySection() {
  const a = A(), G = a && a.G, sec = UIEl('section', 'ios-hist', { 'data-c': 'history', 'aria-label': 'Reports' });
  if (!G || !(sideOpen() && cont === 'history')) return sec;
  const me = a.me(), ms = (HO.rules(G).reportHistory ? (me.reportLog || []) : []).concat(me.inbox || []);
  const H = SCREEN.row * 3, s0 = Math.floor(Math.fround(H / 6)), gap = SCREEN.gap;
  const pt = (n) => `calc(${n} * var(--pt))`;
  const list = UIEl('div', 'ios-hlist');
  for (let i = ms.length - 1; i >= 0; i--) {
    const m = ms[i], txt = a.degText(HO.say(G, m.text)), ym = /^Year (\d+):?$/.exec(String(m.text || '')), lv = /^Your (?:Range|Speed|Weapons|Shield|Miniaturization) Technology has reached level (\d+)\.$/.exec(String(m.text || ''));
    const it = UIEl('div', 'ios-hitem', { role: 'button', tabindex: '0' });
    if (ym) {
      it.style.height = pt(29 * 1.5);
      const dg = UIEl('span', 'ios-digits ios-hdigits', { 'aria-hidden': 'true' });
      for (const ch of ym[1]) dg.append(UIEl('i', null, { style: `--d:${ch}` }));
      it.append(dg);
    } else {
      const lines = wrapLines(txt, s0, SCREEN.W - 64), wid = Math.max(1, ...lines.map(l => textW(l, s0))), th = lines.length * s0 * 1.15;
      const rp = reportPicture(m), ic = rp ? null : a.msgIconEl(m), hasIcon = !!(ic && ic.src);
      it.style.height = pt(Math.max(th + 2 * gap, (hasIcon ? 40 : 0) + 2 * gap)); // (a planet or a hat does not count in the height: only the report icon is the size the node takes)
      if (hasIcon) { ic.className = 'ricon'; it.append(ic); }
      if (rp) { rp.el.classList.add('ios-hrpic'); it.append(rp.el); }
      if (lv) it.append(UIEl('span', 'ios-lvl ios-hlvl', { 'aria-hidden': 'true' }, lv[1]));
      const p = UIEl('p', null, null, txt);
      p.style.width = pt(Math.ceil(wid) + 1); p.style.height = pt(th); p.style.fontSize = pt(s0 - 1); p.style.lineHeight = pt((s0 - 1) * 1.15);
      it.append(p);
    }
    const act = () => { const x = A(); if (x && x.G) { x.reportAction(m); } };
    it.addEventListener('click', (e) => { e.stopPropagation(); act(); });
    it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    list.append(it);
  }
  sec.append(list);
  if (!ms.length) list.append(UIEl('p', 'ios-hnone', null, 'No reports this turn.'));
  return sec;
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
  if (fdList) { fdList.replaceChildren(); if (fl) { const h = fl.querySelector('h4'); if (h) h.remove(); fleetItems(fl); fdList.append(fl); } }
  // CombinedInfoContainer 0x1000b0e44: the totals, the technology bars (TechLayer), the budget bars (PlayerPlanetsLayer), the players
  styleBars(parts.tech, 'tech', parts); styleBars(parts.budget, 'budget', parts);
  income.dataset.c = 'info'; parts.tech.dataset.c = 'info'; parts.budget.dataset.c = 'stars';
  if (parts.planet && !appRules) parts.planet.dataset.c = 'stars';
  box.replaceChildren(income, parts.tech, parts.budget, ...(parts.planet && !appRules ? [parts.planet] : []));
  for (const r of parts.budget.querySelectorAll('.blabel')) { const row = r.closest('.barrow'); if (row && row._k && row._k.star != null) { r.style.cursor = 'pointer'; r.onclick = () => { const a = A(); if (a && a.G) { a.UI.sel = row._k.star; a.centerOn(row._k.star); a.renderPanel(); a.draw(); } }; } } // PlayerPlanetsLayer pressed: selects the star and scrolls the map to it
  placeGrid(parts.tech); placeGrid(parts.budget);
  box.append(playersList(), historySection());
  hud();
}
// -[TurnMessageLayer init] 0x10001c4e8: End Turn (button-empty, "End Turn" 18) and the gear are one menu at the bottom right and stay there while the
// report bar (MessageNode, the layer's messageMenuItem) shows at the bottom left; the remake's page draws a report OR the clock in #msg, so while a
// report shows the skin keeps an End Turn button of its own (it calls the same doEndTurn). -[MessageNode update:] 0x100013064: the bar is
// BarMenuItem width x 3 rows; the picture's middle is 30 across and its top at 0.75 x (height - a80); the text starts at 60, vertically centred, its
// type floor(height / 6) - 1; "more..." (Misc 30, 0.6 x 24) at the bottom right while more reports follow (-[TurnMessageLayer updateMessageState]
// 0x10001cde0: shown while the current one is not the last).
// The history graphs (HistoryGraphNode refreshData 0x1000ab658; the iPad's shade is a GraphNode 200 x 100, the iPhone's button-graph and a tap on the shade open a
// HistoryGraphDialogLayer): ten series from the player's history records (a record each turn: the year, then 0 income, 1 metal, 2 savings, 3 ships, 4 rank in 100, and
// 5-9 how far ahead of the others in each of the five technologies, in 100), each a line of its own colour; series 0-3 are scaled to a maximum that starts at 100,000, 100,000,
// 1,000,000 and 10,000 and grows by as much until the largest record fits, 4-9 to 100. Drawn in a rectangle inside margins (a small graph: left 0, right 0, bottom 20, top 2; a big
// one, over 200 wide: 70, 20, 75, 10); white axes along the bottom (and, big, the left), the ticks and the scale as the code draws them; the small graph's years run over 1,000
// from the first record (then the last 100 turns), the big one's over every record. The icons beneath are the series' pictures; a big one's are buttons that show and hide a series
// (kept in the preferences for both graphs; only the first series shows at first). A small graph is on a 0xe1cccccc fill (204, 204, 204 at 225) with no line; with fewer than two
// records "No Graph Information Available" (Misc Strings 47) is written in white in the middle.
const GCOL = [[0, 170, 40], [255, 255, 255], [105, 250, 105], [137, 22, 185], [212, 212, 87], [0, 0, 230], [250, 152, 0], [255, 0, 255], [0, 250, 250], [250, 0, 0]];
const GMAX0 = [100000, 100000, 1000000, 10000, 100], GSTEP = [100000, 100000, 1000000, 10000, 0];
function graphFlags() { try { const f = JSON.parse(localStorage.getItem('ho.ios.graphs')); if (Array.isArray(f) && f.length === 10) return f; } catch (e) {} return [true, false, true, false, false, false, false, true, true, false]; } // (CPrefs defaults 0x10003dbd8: bytes +0x1fc, +0x1fe, +0x203, +0x204 set; saved with the preferences by -[HistoryGraphNode toggleIcons:] through CPrefsPhone's save, 'ho.prefs')
function setGraphFlags(f) { try { localStorage.setItem('ho.ios.graphs', JSON.stringify(f)); } catch (e) {} }
// the hats of the players who are out, a big graph's (-[HistoryGraphNode initWithBackground:...] 0x1000aa444 makes one per player, GraphicsHoMap smallPlayerHat: with the eliminated sprite its child at (0, 0), tag 0x32 + the
// player, hidden; -[HistoryGraphNode refreshData] 0x1000ab658 shows those whose player went out (player +0x3c, the year), the earliest first, at x = the year's place on the years' axis, y = ten under the graph's top less
// k (graph height / (players - 1)) for the k-th, or half the height for a one-player game; a hat is 20 points (40 pixels at 2 x); it hangs under the lines and the axes (added first, same z))
const hatImgs = {};
function hatImg(name, redraw) { let im = hatImgs[name]; if (!im) { im = hatImgs[name] = new Image(); im.onload = () => { if (redraw) redraw(); }; im.src = HOTHEME.dir + 'sprites/' + name + '.png'; } return im.complete && im.naturalWidth ? im : null; }
function hatName(p) { const a = A(); return 'player_list_' + (a && p.id === a.ME ? 16 : p.face) + '_' + (p.female ? 'f' : 'm'); } // (+[GraphicsHoMap smallPlayerHat:] 0x100008734: the current player's is hat 16, another's his hat byte +0x95; "f" when his +0x2c is 0)
// the legend's tint: -[HistoryGraphNode updateMiniIcons] 0x1000ac788 / createMiniIcon: 0x1000ab1b4: a series that shows (selected index 1) has setColor (199, 199, 199) (bytes +0xf of the table at 0x1001495f8), one that does not (index 0) (255, 255, 255): both items are the same picture 0990N
function tinted(im, k) { const t = document.createElement('canvas'); t.width = im.width; t.height = im.height; const x = t.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgb(${k},${k},${k})`; x.fillRect(0, 0, t.width, t.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0); return t; }
function graphVals(h) { const x = h.hx || {}; return [h.inc, x.met, x.sav, h.ships, x.rk].concat(x.tr || [null, null, null, null, null]); }
function paintGraph(cv, w, h, big, redraw) {
  const a = A(); if (!cv || !a || !a.G) return;
  const dpr = Math.max(1, Math.min(3, (window.devicePixelRatio || 1) * SCREEN.u)), c = cv.getContext('2d');
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  c.setTransform(dpr, 0, 0, -dpr, 0, h * dpr); // y runs up, as cocos2d's
  const rec = (a.me().hist || []).filter(r => r), flags = graphFlags();
  const L = big ? 70 : 0, R = big ? 20 : 0, B = big ? 75 : 20, T = big ? 10 : 2, gW = w - R - L, gH = h - B - T, x0 = L, y0 = B;
  const fam = getComputedStyle(document.documentElement).getPropertyValue('--appfont') || 'Arial, Helvetica, sans-serif';
  const text = (t, x, y, size, col, ax, ay) => { // (x, y in the node's y-up points; ax, ay the anchor)
    c.save(); c.translate(x, y); c.scale(1, -1); c.font = `${size}px ${fam}`; c.fillStyle = col; c.textAlign = ax === 1 ? 'right' : ax === 0.5 ? 'center' : 'left'; c.textBaseline = ay === 0.5 ? 'middle' : 'alphabetic'; c.fillText(t, 0, ay === 0.5 ? 0 : 0); c.restore();
  };
  const line = (x1, y1, x2, y2) => { c.moveTo(x1, y1); c.lineTo(x2, y2); };
  c.clearRect(0, 0, w, h);
  if (!big) { c.fillStyle = 'rgba(204,204,204,0.882)'; c.fillRect(0, 0, w, h); }
  if (big && rec.length >= 2) { // the hats (under the axes and the lines)
    const xMin = rec[0].y, xMax = rec[rec.length - 1].y + 10, sc = Math.trunc(gW * 100 / (xMax - xMin)), G = a.G, n = G.players.length;
    const out = []; // (player, year), the earliest first; a later one with the same year after
    for (const p of G.players) { if (p.alive) continue; const yr = p.outYear505 || p.outYear || 1; let i = 0; while (i < out.length && !(yr < out[i][1])) i++; out.splice(i, 0, [p, yr]); }
    out.forEach(([p, yr], k) => {
      const hx = Math.trunc(x0 + Math.trunc((yr - xMin) * sc / 100)), hy = Math.trunc(y0 + gH - 10 - (n === 1 ? gH * 0.5 : k * (gH / (n - 1)))), im = hatImg(hatName(p), redraw), el = hatImg('player_list_eliminated', redraw);
      if (!im) return;
      c.save(); c.translate(hx, hy); c.scale(1, -1); c.drawImage(im, -10, -10, 20, 20); c.restore();
      if (el) { c.save(); c.translate(hx - 10, hy - 10); c.scale(1, -1); c.drawImage(el, -10, -10, 20, 20); c.restore(); }
    });
  }
  c.lineWidth = 1; c.strokeStyle = '#fff';
  c.beginPath();
  for (let k = 1; k <= 10; k++) { const y = gH / 10 * k, len = (k % 2 ? 1 : 3) + (big ? 2 : 0); line(0, y, len, y); }
  for (let k = 1; k <= 10; k++) { const x = gW / 10 * k; line(x, 0, x, big ? 3 : 1); }
  c.stroke();
  c.beginPath(); if (big) line(x0, y0, x0, y0 + gH); line(x0, y0, x0 + gW, y0); c.stroke();
  if (rec.length < 2) { text('No Graph Information Available', w / 2, h / 2, SCREEN.pad ? 12 : 10, '#fff', 0.5, 0.5); return; }
  const first = rec[0].y, last = rec[rec.length - 1].y;
  let xMin = first, xMax = last + 10;
  if (!big) { if (xMax - xMin > 1000) xMin = last - 990; else xMax = xMin + 1000; }
  const sc = Math.trunc(gW * 100 / (big ? xMax - xMin : 1000)), px = (yr) => Math.trunc(x0 + Math.trunc((yr - xMin) * sc / 100));
  const max = GMAX0.slice();
  for (const r of rec) { const v = graphVals(r); for (let s = 0; s < 4; s++) while (v[s] != null && max[s] < v[s]) max[s] += GSTEP[s]; }
  const money = (n, d) => (d ? '$' : '') + (HO.rules(A().G).interestShort ? HO.rules(A().G).interestShort(n) : A().fmt(n));
  if (big) {
    text(String(xMin), px(xMin), y0 - 12, 16, '#fff', 0.5, 0.5); text(String(xMax), x0 + gW, y0 - 12, 16, '#fff', 0.5, 0.5);
    for (let s = 0; s < 4; s++) if (flags[s]) text(money(max[s], s === 0 || s === 2), x0 - 5, y0 + gH - 50 - s * 22, 12, rgb(GCOL[s]), 1, 0.5);
  }
  for (let s = 0; s < 10; s++) {
    if (!flags[s]) continue;
    c.strokeStyle = rgb(GCOL[s]); c.beginPath();
    let prev = null;
    for (const r of rec) {
      if (r.y < xMin || r.y > xMax) continue;
      const v = graphVals(r)[s]; if (v == null) { prev = null; continue; }
      const x = px(r.y), y = Math.trunc(y0 + Math.trunc((s < 5 ? gH / max[s] * v : v * gH / 100)));
      if (prev) line(prev[0], prev[1], x, y); prev = [x, y];
    }
    c.stroke();
  }
  if (!big) { // the legend: the series' pictures (0990N, 32 x 14) scaled to (20 - 0.4) / 32, from (2, 2) edge to edge; the ones that show are tinted (199, 199, 199), the others are as drawn
    const k = (20 - 0.4) / 32;
    for (let s = 0; s < 10; s++) {
      const im = A().IMG && A().IMG[P + '0990' + s]; if (!im || !im.width) { if (redraw) setTimeout(redraw, 300); continue; }
      c.save(); c.translate(2 + s * 32 * k, 2); c.scale(1, -1); c.drawImage(flags[s] ? tinted(im, 199) : im, 0, -14 * k, 32 * k, 14 * k); c.restore();
    }
  }
}
function drawGraph() { if (gnCv && !gnEl.classList.contains('shut')) paintGraph(gnCv, 200, 100, false, drawGraph); }
// -[HistoryGraphDialogLayer initDialog] 0x1000b89a0 on -[DialogLayerSprite init] 0x1000bc294 (read in the disassembly): the dialog is a layer anchored at the middle of the screen, 480 x 320 on an iPhone, min(winW, 620) x min(winH, 400) on an iPad, scaled by
// min(winW / its width, winH / its height) (an iPad's: 0.8 of each); its background is dialog-background.png as a nine-patch (capInsets 40, 40, 325, 239: 40 points all round of a 405 x 319 picture); the graph is a big HistoryGraphNode
// (width - 2 a88) x (height - a88) (a88 6 on an iPhone, 8 on an iPad) at (a88, 0), the ten series' buttons in it (anchor (0.5, 0), at (width / 2, 4), scale 0.9, 5 apart on an iPad, 1 on an iPhone); the mini close button (button-x, scale 0.5,
// 44 points) has its top left at (12, height - 14); a touch that begins and ends outside the dialog closes it (-[DialogLayerSprite ccTouchBegan:withEvent:] 0x1000bce5c, ccTouchEnded: 0x1000bcf0c), one that begins inside does not
let gdEl = null;
function closeGraphs() { if (gdEl) { gdEl.remove(); gdEl = null; } }
function openGraphs() {
  const a = A(); if (!a || !a.G) return;
  if (gdEl) { closeGraphs(); return; }
  const pad = SCREEN.pad, a88 = pad ? 8 : 6, cw = pad ? Math.min(SCREEN.winW, 620) : 480, ch = pad ? Math.min(SCREEN.winH, 400) : 320;
  const k = pad ? Math.min(SCREEN.winW * 0.8 / cw, SCREEN.winH * 0.8 / ch) : Math.min(SCREEN.winW / cw, SCREEN.winH / ch);
  const gw = cw - 2 * a88, gh = ch - a88;
  const cv = UIEl('canvas', 'ios-gcv'), bar = UIEl('div', 'ios-gbar');
  const flags = graphFlags();
  const paint = () => paintGraph(cv, gw, gh, true, paint);
  for (let s = 0; s < 10; s++) {
    const b = UIEl('button', 'ios-gic', { type: 'button', 'aria-pressed': flags[s] ? 'true' : 'false', 'aria-label': 'Series ' + (s + 1) }, pic('icon' + s + (flags[s] ? '-selected' : '-not-selected')));
    b.addEventListener('click', () => { const f = graphFlags(); f[s] = !f[s]; setGraphFlags(f); b.setAttribute('aria-pressed', f[s] ? 'true' : 'false'); b.firstChild.src = HOTHEME.dir + 'sprites/icon' + s + (f[s] ? '-selected' : '-not-selected') + '.png'; paint(); drawGraph(); });
    bar.append(b);
  }
  const x = UIEl('button', 'ios-gx', { type: 'button', 'aria-label': 'Close' }, pic('button-x'));
  x.addEventListener('click', closeGraphs);
  const graph = UIEl('div', 'ios-ggraph', { style: `left:calc(${a88} * var(--pt));bottom:0;width:calc(${gw} * var(--pt));height:calc(${gh} * var(--pt))` }, cv, bar);
  const dlg = UIEl('div', 'ios-gdlg', { role: 'dialog', 'aria-label': 'Graphs', style: `width:calc(${cw} * var(--pt));height:calc(${ch} * var(--pt));transform:translate(-50%,-50%) scale(${k})` }, UIEl('div', 'ios-gbg'), graph, x);
  let began = false; // (the layer swallows every touch: this is it)
  gdEl = UIEl('div', 'ios-gscrim', null, dlg);
  gdEl.addEventListener('pointerdown', (e) => { began = e.target === gdEl; e.stopPropagation(); });
  gdEl.addEventListener('pointerup', (e) => { if (began && e.target === gdEl) closeGraphs(); began = false; e.stopPropagation(); });
  gdEl.addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('app').append(gdEl);
  paint(); setTimeout(paint, 300);
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape' && gdEl) closeGraphs(); if (!gdEl) document.removeEventListener('keydown', esc); });
}
// The report's picture by its number (-[MessageNode update:] 0x100013064, FUN_100038788: the table from report number to picture is the page's own 5.0.5 table but for two: 1033 and 1034 ("You have explored ..." and
// "... has explored ...") are drawn as a PlanetNode, a 40 x 40 box with the planet (planet_N scaled 1/3 over its temperature and metal: -[PlanetNode update:temp:metal:] 0x100090e58, the page's planetPic) from the star's figures
// ((msg + 8) the gravity kind, its temperature less your home's + 720, its metal); and 1037 (a battle lost) is the HatNode of the player the report names (guy:game: 0x100091928: the enemy hat frame of his hat and sex, 50 points wide, and
// halo1 (allied) or halo2 (best buddy) at (0, 17) over it when he is allied with the player), or report_icon-25 when it names no one. The planet's top and the picture's top are at the same place (30, 0.75 x (height - a80) up),
// the hat's middle is there.
function reportPicture(m) {
  const a = A(); if (!a || !a.G || !m || !a.msgReportNo) return null;
  const G = a.G, no = a.msgReportNo(m), me = a.me();
  if ((no === 1033 || no === 1034) && m.star != null) {
    const k = HO.know(G, me, m.star), src = k && k.g != null ? k : null; if (!src) return null;
    const c = planetPic(a.IMG, me, src); if (!c) return null;
    const el = document.createElement('canvas'); el.width = c.width; el.height = c.height; el.getContext('2d').drawImage(c, 0, 0);
    el.className = 'ios-rpic ios-rplanet'; return { el, kind: 'planet' };
  }
  if (no === 1037 && m.who != null && G.players[m.who]) {
    const q = G.players[m.who], box = UIEl('span', 'ios-rpic ios-rhat');
    box.append(pic(`enemy_${q.face || 0}_${q.female ? 'f' : 'm'}`, 'h'));
    if (HO.isAllied(G, a.ME, q.id)) box.append(pic(HO.isBuddy(G, a.ME, q.id) ? 'halo2' : 'halo1', 'o')); // (FUN_10003a0ec: allied, FUN_10003a148: best buddies)
    return { el: box, kind: 'hat' };
  }
  return null;
}

// -[FleetMenuItem initWithTarget:selector:] 0x1000c3f70 and updateData:player:isMe:star:fleetNumber: 0x1000c40e0 (the arguments of its formats read in the disassembly), listed by
// -[FleetMovementMenu updateSelected] 0x1000c8ed0: a row is the fleet's strongest pile as a ShipNode scaled to the row's width / 210 (the Fleets dialog's menu is 100 wide), the
// name (Arial 32 at the scale that fits the row: matchParentWidth: 0x100016e28, at most 1) and "Fuel: %d" (Arial 18 at 0.5), centred, nothing between them, the rows 8 (2 a80) apart.
// The name is the fleet's strongest pile (the record's power x its count; the first on a tie) as FUN_100035be4 words it: "1 Sco (4/2)" for one ship, "5 Fig (3/3)s" for more
// (the class's name cut to three letters, the weapons and the shields), a "+" after it when the fleet has more than one pile; the colour is red when the fleet is marked to be
// scrapped, else with no orders white (yellow when it was bought this turn), with orders (31, 183, 20) when it holds a Colony Ship and (187, 255, 255) when not (the bytes at
// 0x100149601 and 0x100149637). "Fuel" is the least range of its piles less the fuel used (FUN_100035580 less FUN_100035634: +0x7a).
const FLEET_CLASS = ['Scout', 'Dreadnought', 'Fighter', 'Tanker', 'Colony Ship', 'Satellite', 'Biological', 'Decoy'];
function fleetItem(G, f, a) {
  const piles = Object.keys(f.ships).map(k => ({ d: HO.getDesign(G, f.owner, +k), n: f.ships[k] })).filter(x => x.d && x.n > 0);
  if (!piles.length) return null;
  const pw = (x) => HO.designCost(G, x.d).att * x.n;
  let best = piles[0]; for (const x of piles) if (pw(x) > pw(best)) best = x;
  const cls = FLEET_CLASS[Math.max(0, ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite', 'bio', 'decoy'].indexOf(best.d.type))].slice(0, 3);
  let name = best.n === 1 ? `1 ${cls} (${best.d.W}/${best.d.S})` : `${best.n} ${cls} (${best.d.W}/${best.d.S})s`;
  if (piles.length > 1) name += '+';
  const mine = f.owner === a.ME;
  let color = '#fff';
  if (mine && f.scrap301) color = 'rgb(255,0,0)';
  else if (mine && f.dest != null) color = piles.some(x => x.d.type === 'colony') ? 'rgb(31,183,20)' : 'rgb(187,255,255)';
  else if (mine && f.newThisTurn) color = 'rgb(255,255,0)';
  const W = 100, cv = a.IMG && HOTHEME.shipPic(best.d, a.IMG), ks = W / 210;
  const box = UIEl('div', 'ios-fi');
  if (cv) { cv.className = 'ios-fis'; cv.style.width = `calc(${cv.width * ks} * var(--pt))`; cv.style.height = `calc(${cv.height * ks} * var(--pt))`; box.append(cv); }
  const sc = Math.min(1, W / Math.max(1, textW(name, 32)));
  const nl = UIEl('span', 'ios-fin', { style: `font-size:calc(${32 * sc} * var(--pt));color:${color}` }); nl.textContent = name; nl.setAttribute('translate', 'no');
  const fl = UIEl('span', 'ios-fif', { style: 'font-size:calc(9 * var(--pt))' }); fl.textContent = `Fuel: ${HO.plainNum(f.fuel)}`; fl.setAttribute('translate', 'yes');
  box.append(nl, fl);
  return box;
}
function fleetItems(box) {
  const a = A(), G = a && a.G; if (!G || !box) return;
  for (const r of [...box.querySelectorAll('.frow')]) {
    const f = G.fleets.find(x => String(x.id) === r.getAttribute('data-fleet'));
    if (!f || f.sat || r.getAttribute('data-inbound')) { r.remove(); continue; } // (the app's list is the fleets at the star; satellites have their own menu)
    // FUN_100035dd4 / FUN_100035fa8: your own fleets, then those of a player who is allied with you both ways (FUN_10003a0ec) and is also your best buddy both ways (FUN_10003a148) or whose fleet is at one of your colonies
    if (f.owner !== a.ME && !(HO.isAllied(G, a.ME, f.owner) && (HO.isBuddy(G, a.ME, f.owner) || (G.stars[f.star] && G.stars[f.star].owner === a.ME)))) { r.remove(); continue; }
    const it = fleetItem(G, f, a); if (!it) continue;
    for (const c of [...r.children]) if (!c.classList.contains('facts')) c.remove();
    r.prepend(it); r.classList.add('ios-frow');
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
    { const old = card.querySelector('.icon, .bigicon, .jpg'), rp = m && reportPicture(m); if (rp) { if (old) old.remove(); card.append(rp.el); } }
    const cnt = card.querySelector('.count');
    if (cnt) { cnt.textContent = ctx && ctx.inbox && ctx.idx + 1 < ctx.inbox.length ? 'more...' : ''; cnt.setAttribute('translate', 'yes'); }
  }
  hud(); drawGraph();
}

// A colony's hat (-[HatNode updateMyPlayer:star:] 0x100091bc8, read in the disassembly; the page's own hat by pay and planet class is not the app's):
// q is the star's quality for the player (FUN_10003bf18, 0 to 20, -1 for one not explored): its gravity's ratio to his home's (the larger over the smaller, in per cent, over 256 is 0) and
// its temperature's distance from his home's (tenths of a degree; over 200 per cent with 500 or more is 0) give a x b / 527 + 2 where a = 100 - (ratio / 10 - 10) x (ratio / 10 - 9) (at least 23)
// and b = 100 - (distance / 330 + 1) x (distance / 330) (at least 40), one more (to 20) when the star holds over 10,000 metal. The hat is player_<row>_<m|f>: row 0 for a star not explored
// or q 16 and over, 1 for q 6 to 15, 2 for q 2 to 5, and for q 0 and 1 row 3 unless the colony pays (its income over 0) and then 2. A colony marked for evacuation has its hat tinted
// (125, 125, 125). On a good star (q 16 or more) the hat is special_good_<n> on certain days (specialGoodStar 0x100091db0: the device's date)
function starQuality(p, k) {
  if (!k || !k.explored || k.g == null) return -1;
  const g = Math.round(k.g * 100), hg = Math.round(p.homeG * 100), t = Math.round(k.t * 10), ht = Math.round(p.homeT * 10);
  const hi = Math.max(g, hg), lo = Math.min(g, hg), ratio = lo !== 0 ? trunc(hi * 100 / lo) : 0, dT = Math.abs(ht - t);
  let q = 0;
  if (ratio <= 256 && (ratio < 201 || dT < 501)) {
    let a = 100 - (trunc(ratio / 10) - 10) * (trunc(ratio / 10) - 9); if (!(a > 22)) a = 23;
    let b = 100 - (trunc(dT / 330) + 1) * (trunc(dT / 330)); if (!(b > 39)) b = 40;
    q = trunc(b * a / 527) + 2;
  }
  return (k.metal || 0) < 10001 ? q : Math.min(q + 1, 20);
}
function specialDay(d) {
  const wd = d.getDay() + 1, m = d.getMonth() + 1, day = d.getDate(), y = d.getFullYear();
  if (wd === 5 && m === 11 && day >= 22 && day <= 28) return -1; // Thanksgiving
  if (m === 9 && day === 22) return 6;
  if (m === 7 && day === 9) return 7;
  if (m === 11 && day === 15) return 5;
  if (m === 12 && day === 25) return 1;
  if (m === 10 && day === 31) return 0;
  if (m === 3 && day === 17) return 3;
  if (m === 7 && day === 29) return 8;
  const on = (list) => list.some(([mm, dd, yy]) => m === mm && day === dd && y === yy);
  if (on([[4, 8, 2012], [3, 31, 2013], [4, 20, 2014], [4, 5, 2015], [3, 27, 2016], [4, 16, 2017], [4, 1, 2018], [4, 21, 2019], [4, 12, 2020], [4, 4, 2021], [4, 17, 2022]])) return 2; // Easter
  if (on([[12, 16, 2014], [12, 8, 2012], [11, 27, 2013], [12, 6, 2015], [12, 24, 2016], [12, 12, 2017], [12, 2, 2018], [12, 22, 2019], [12, 10, 2020]])) return 4; // Hanukkah
  return null;
}
function colonyHat(look, c) {
  const { G, p, s } = c;
  if (!look.hat || s.owner !== p.id || !/^white\d_\d$/.test(look.hat)) return look;
  const q = starQuality(p, c.k || HO.know(G, p, s.id)), f = p.female ? 1 : 0;
  let row = 0, sp = null;
  if (q === -1) row = 0;
  else if (q >= 16) { row = 0; sp = specialDay(new Date()); }
  else { row = q < 6 ? 2 : 1; if (q <= 1 && !((s.oInc || 0) > 0)) row = 3; }
  return Object.assign({}, look, { hat: sp != null ? 'spgood' + sp : 'white' + row + '_' + f, hatTint: s.abandon301 ? 125 : 0 });
}
// ---------------------------------------------------------------------------
// The Build flow (docs/ios-findings.md, "Build flow"; BuildShipsDialog 0x1000b3b58, ShipClassMenu 0x1000b447c, ShipMenuItem 0x100011c4c,
// BuildSingleShipDialog 0x1000b4d60, on DialogLayerSprite 0x1000bc294; the numbers are from the disassembly with
// tools/floats.py in the private repo, GraphicDefines +[setup] 0x100008548 for the iPhone's and iPad's). It draws in the dialog's own points
// (y up, as cocos2d does): put() places a node by its anchor point.
const BGD = () => SCREEN.pad ? { a80: 8, a88: 8, f: 18, fi: 20, a18: 24, a30: 28, a38: 12, a58: 24 } : { a80: 4, a88: 6, f: 14, fi: 18, a18: 18, a30: 24, a38: 10, a58: 16 }; // GraphicDefines 0x100148a80, a88, 1001489e8, 1001489f0
const bpt = (v) => `calc(${v} * var(--pt))`;
function put(e, x, y, ax, ay) {
  e.style.position = 'absolute'; e.style.left = bpt(x); e.style.bottom = bpt(y);
  e.style.transform = `translate(${-(ax || 0) * 100}%, ${(ay || 0) * 100}%)`;
  return e;
}
const BFONT = (size, extra) => `font:${bpt(size)}/1.15 var(--appfont,Arial,Helvetica,sans-serif);${extra || ''}`;
// -[DialogLayerSprite init] 0x1000bc294: 480 x 320 on an iPhone, an iPad's min(winW, 620) x min(winH, 400); scaled by min(winW / w, winH / h) (an iPad's 0.8 of each)
function dlgGeom() {
  const W = SCREEN.winW, H = SCREEN.winH;
  if (!SCREEN.pad) return { cw: 480, ch: 320, k: Math.min(W / 480, H / 320) };
  const cw = Math.min(W, 620), ch = Math.min(H, 400);
  return { cw, ch, k: Math.min(W * 0.8 / cw, H * 0.8 / ch) };
}
// the layer: scrim (swallows touches; a touch that begins and ends outside the dialog is a cancel: ccTouchBegan/Ended 0x1000bce5c, 0x1000bcf0c), nine-patch, content
function dialogLayer(cw, ch, k, label, onCancel) {
  const bg = UIEl('div', 'ios-gbg');
  const dlg = UIEl('div', 'ios-gdlg ios-bdlg', { role: 'dialog', 'aria-label': label, style: `width:${bpt(cw)};height:${bpt(ch)};transform:translate(-50%,-50%) scale(${k})` }, bg);
  const scrim = UIEl('div', 'ios-gscrim', null, dlg);
  let began = false;
  scrim.addEventListener('pointerdown', (e) => { began = e.target === scrim; e.stopPropagation(); });
  scrim.addEventListener('pointerup', (e) => { if (began && e.target === scrim && onCancel) onCancel(); began = false; e.stopPropagation(); });
  scrim.addEventListener('click', (e) => e.stopPropagation());
  return { scrim, dlg };
}
function bLabel(text, size, x, y, ax, ay, color) {
  const e = UIEl('span', 'ios-bt'); e.textContent = text; e.style.fontSize = bpt(size); if (color) e.style.color = color;
  return put(e, x, y, ax, ay);
}
// +[Button buttonWithText:size:fontName:fontSize:block:] 0x1000b9d10: button-text.png as a nine-patch (capInsets 5, 5, 34, 5 of 44 x 15 points), the label white, the type
// shrunk (minimum 6) until the text fits the width less 16
function textButton(text, w, h, size, fn) {
  let s = size; while (s > 6 && textW(text, s) > w - 16) s -= 1;
  const b = UIEl('button', 'ios-bbtn', { type: 'button', style: `width:${bpt(w)};height:${bpt(h)};font-size:${bpt(s)}` });
  b.textContent = text; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
  return b;
}
// CCSliderDeluxe (0x1000aef50..0x1000afb7c): 19 points high, slider-m5 (left and right scale9 pieces of 216 x 19, the thumb 28.5 x 29); the thumb runs from 14.25
// to width - 11.25; a touch anywhere on it puts the thumb at the finger (clamped), a drag follows; the value is the fraction
function ccSlider(width, onFrac) {
  const L = UIEl('i', 'ios-sll'), R = UIEl('i', 'ios-slr'), T = UIEl('i', 'ios-slt');
  const el = UIEl('div', 'ios-sl', { style: `width:${bpt(width)}` }, L, R, T);
  const mn = 14.25, mx = width - 11.25;
  const api = { el, width, set(f0) { // -[CCSliderDeluxe setValue:] 0x1000af4e8 (a NaN, the 0 / 0 of a slider with nothing to choose, is kept: the thumb has no place)
    const f = f0 !== f0 ? NaN : f0 > 0 ? Math.min(1, f0) : 0;
    const x = mn + (f === f ? f : 0) * (mx - mn);
    L.style.width = bpt(x); R.style.width = bpt(width - x); T.style.left = bpt(x); T.classList.toggle('nan', f !== f);
    api.f = f;
  }, f: 0 };
  const at = (e) => { const r = el.getBoundingClientRect(), pts = (e.clientX - r.left) / (r.width / width); return Math.min(Math.max(pts, mn), mx); };
  let down = false;
  const move = (e) => { const x = at(e), f = (x - mn) / (mx - mn); api.set(f); onFrac(f); };
  el.addEventListener('pointerdown', (e) => { if (el.classList.contains('off')) return; down = true; el.setPointerCapture(e.pointerId); T.classList.add('sel'); move(e); e.stopPropagation(); });
  el.addEventListener('pointermove', (e) => { if (down) move(e); });
  const up = () => { down = false; T.classList.remove('sel'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  api.set(0);
  return api;
}
// SliderArray (0x1000afb98): [left arrow] [slider] [right arrow] [label] 4 apart, the label the value or its word; value min..max
// (valueChanged:tag: 0x1000b03b0 truncates min + (max - min) x fraction), setValue: clamps and moves the thumb to it
function sliderArray(o) {
  const gd = BGD(), pad = gd.a80, lw = textW('0', gd.f);
  const arrows = o.arrows !== false;
  const sl = ccSlider(o.width, (f) => { let v = Math.trunc(S.min + (S.max - S.min) * f); v = Math.min(Math.max(v, S.min), S.max); S.value = v; S.show(); o.change && o.change(); });
  const lab = UIEl('span', 'ios-bt ios-bsl'); lab.style.fontSize = bpt(gd.f);
  const total = (arrows ? 24 : 0) + o.width + lw + pad * (arrows ? 3 : 1);
  const el = UIEl('div', 'ios-sla', { style: `width:${bpt(total)};height:${bpt(19)}` });
  let x = 0;
  const addAt = (n, w, h, cls) => { n.style.position = 'absolute'; n.style.left = bpt(x); n.style.top = '50%'; n.style.transform = 'translateY(-50%)'; el.append(n); x += w + pad; return n; };
  let la = null, ra = null;
  if (arrows) {
    la = UIEl('button', 'ios-sla-b', { type: 'button', 'aria-label': 'Less' }, pic('arrow-left')); addAt(la, 12, 18);
  }
  addAt(sl.el, o.width, 19);
  if (arrows) { ra = UIEl('button', 'ios-sla-b', { type: 'button', 'aria-label': 'More' }, pic('arrow-right')); addAt(ra, 12, 18); }
  lab.style.position = 'absolute'; lab.style.left = bpt(x + lw / 2); lab.style.top = '50%'; lab.style.transform = 'translate(-50%,-50%)'; el.append(lab);
  const S = { el, min: 0, max: 0, value: 0, sl, lab, la, ra, words: o.words || null,
    show() { lab.textContent = S.words && S.value < S.words.length ? S.words[S.value] : String(S.value); },
    // -[SliderArray setValue:] 0x1000b0568 and updateSlider 0x1000b0314
    setValue(v) { S.value = Math.min(Math.max(v, S.min), S.max); S.show(); sl.set((S.value - S.min) / (S.max - S.min)); },
    maxed() { return S.value === S.max; },
    enable(on) { const d = on ? '' : 'hidden'; sl.el.style.visibility = d; if (la) la.style.visibility = d; if (ra) ra.style.visibility = d; }, // enableTech:enabled: 0x1000b73d0
  };
  if (la) la.addEventListener('click', (e) => { e.stopPropagation(); if (S.value !== 0) { S.setValue(S.value - 1); o.change && o.change(); } }); // FUN_1000aff64
  if (ra) ra.addEventListener('click', (e) => { e.stopPropagation(); S.setValue(S.value + 1); o.change && o.change(); }); // FUN_1000b0030
  S.setValue(0);
  return S;
}

const ShipClass = ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite', 'bio', 'decoy'];
const classOf = (t) => ShipClass.indexOf(t);
const CLASS_NAMES = ['Scout', 'Dreadnought', 'Fighter', 'Tanker', 'Colony Ship', 'Satellite', 'Biological', 'Decoy']; // Ship Class Names 0-6 (the decoy is the remake's own)
const bnum = (n, dollar) => { const a = A(), sh = HO.rules(a.G).interestShort; return n < 100000 && n > -100000 ? (dollar ? a.money(n) : a.fmt(n)) : (n < 0 ? '-' : '') + (dollar ? '$' : '') + (sh ? sh(Math.abs(n)) : a.fmt(Math.abs(n))); };
const designsOf = (p) => p.designs.filter(d => !d.scrapped);
function aliveOf(G, me, d) { let n = 0; for (const f of G.fleets) if (f.owner === me && f.ships && f.ships[d.id]) n += f.ships[d.id]; return n; }
function pushScrim(scrim) { document.getElementById('app').append(scrim); }
let buildFlow = null;
function closeBuildFlow() { if (buildFlow) { for (const s of buildFlow.scrims.slice().reverse()) s.remove(); buildFlow = null; } }

// -[BuildShipsDialog initDialog] 0x1000b3b58: the layer takes the whole screen (an iPhone) or 0.8 of the width by the height the most ships of one class need
// at 100 points each (within 0.5 and 0.8 of the screen's); the mini close button; the star's PlanetNode at (120, height - 25) and its name 24 further (4 + 20) at
// 16 points; a ShipClassMenu column for each class (six, seven with a Biological), (width - 8 a80) / columns wide and height - 50 high, in a node at (4 a80, 0)
function openBuildFlow(sid) {
  const a = A(), G = a.G, p = a.me(), s = G.stars[sid];
  closeBuildFlow();
  const { cw, ch, k } = dlgGeom(), gd = BGD();
  const classes = [0, 1, 2, 3, 4, 5]; if (designsOf(p).some(d => d.type === 'bio')) classes.push(6); // hasBiological 0x1000b3ad8
  if (designsOf(p).some(d => d.type === 'decoy') || (HO.canBuildType(G, p, 'decoy') && p.hasDecoy)) classes.push(7); // (the remake's own column for a ruleset's decoy: iOS has none)
  let W, H, K = k;
  if (!SCREEN.pad) { W = Math.trunc(SCREEN.winW / k); H = Math.trunc(SCREEN.winH / k); }
  else {
    const counts = {}; let most = 0; for (const d of designsOf(p)) { counts[d.type] = (counts[d.type] || 0) + 1; most = Math.max(most, counts[d.type]); } // maxCountSingleType 0x1000b4098
    const hh = Math.min(Math.max(most * 100 * k, SCREEN.winH * 0.5), SCREEN.winH * 0.8);
    W = Math.trunc(SCREEN.winW * 0.8 / k); H = Math.trunc(hh / k);
  }
  const L = dialogLayer(W, H, K, 'Build ships', closeBuildFlow);
  const flow = buildFlow = { scrims: [L.scrim], sid, dlg: L.dlg, W, H, cols: {}, shown: 0, single: null };
  const x = UIEl('button', 'ios-gx', { type: 'button', 'aria-label': 'Close' }, pic('button-x')); // enableMiniCloseButton
  x.addEventListener('click', (e) => { e.stopPropagation(); closeBuildFlow(); });
  L.dlg.append(x);
  const pc = a.IMG && planetPic(a.IMG, p, s), pcv = UIEl('canvas', 'ios-bplanet');
  if (pc) { pcv.width = pc.width; pcv.height = pc.height; pcv.getContext('2d').drawImage(pc, 0, 0); }
  L.dlg.append(put(pcv, 120, H - 25, 0.5, 0.5));
  L.dlg.append(bLabel(s.name, 16, gd.a80 + 20 + 120, H - 25, 0, 0.5, '#fff'));
  const colW = (W + gd.a80 * -8) / classes.length, colH = H - 50;
  classes.forEach((c, i) => {
    const col = UIEl('div', 'ios-bcol' + (i && i < classes.length - 1 ? ' bord' : ''), { style: `left:${bpt(gd.a80 * 4 + i * colW)};width:${bpt(colW)};height:${bpt(colH)}` });
    const bw = Math.trunc(colW) - gd.a80, bh = gd.f * 2, bsz = SCREEN.pad ? gd.f : gd.f - 4;
    const t = textButton(CLASS_NAMES[c], bw, bh, bsz, () => openSingleShip(flow, c, -1)); // designNewShip: the title button
    put(t, colW / 2, colH - gd.a88, 0.5, 1);
    col.style.setProperty('--bl', bpt(colH - bh)); // ShipClassMenu draw 0x1000b49f8: the inner columns' edges, 1 point, 0x393cd6, up to the title button's top less its height
    const menu = UIEl('div', 'ios-bmenu', { style: `width:${bpt(colW)};height:${bpt(colH - (bh + gd.a88 * 2))}` });
    const inner = UIEl('div', 'ios-bmin', { style: `gap:${bpt(gd.a88)}` }); menu.append(inner);
    col.append(menu, t); L.dlg.append(col);
    flow.cols[c] = inner;
  });
  pushScrim(L.scrim);
  updateShipTypes(flow);
  return true;
}
// -[BuildShipsDialog updateShipTypes:] 0x1000b4164 and -[ShipClassMenu addShip:index:] 0x1000b4884: every type of the player's in its class's column, the first at the bottom
// (alignItemsVerticallyWithPadding:bottomToTop: with a88 between); a type added since scales in over 0.4 s
function updateShipTypes(flow) {
  const a = A(), p = a.me(), gd = BGD(), ds = designsOf(p);
  for (const c in flow.cols) flow.cols[c].textContent = '';
  const colW = (flow.W + gd.a80 * -8) / Object.keys(flow.cols).length;
  const grew = flow.shown && ds.length > flow.shown;
  ds.forEach((d, i) => {
    const inner = flow.cols[classOf(d.type)]; if (!inner) return;
    const name = `${d.name} (${d.W}/${d.S})`, maxW = colW - gd.a80;
    const cv = a.IMG && HOTHEME.shipPic(d, a.IMG), sw = cv ? cv.width : 0, lw = textW(name, gd.f);
    const ss = sw && maxW <= sw ? maxW / sw : 1, ls = maxW <= lw ? maxW / lw : 1; // -[ShipMenuItem setMaxWidth:] 0x100011e80
    const it = UIEl('button', 'ios-bitem', { type: 'button', style: `width:${bpt(Math.max(sw * ss, lw * ls))}` });
    if (cv) { cv.classList.add('ios-bship'); cv.style.width = bpt(cv.width * ss); cv.style.height = bpt(cv.height * ss); it.append(cv); }
    const lb = UIEl('span', 'ios-bt ios-bin'); lb.textContent = name; lb.style.fontSize = bpt(gd.f * ls); it.append(lb);
    it.addEventListener('click', (e) => { e.stopPropagation(); openSingleShip(flow, classOf(d.type), i); }); // shipSelected: -> setShip:
    inner.append(it);
    if (grew && i === ds.length - 1) it.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 400 });
  });
  flow.shown = ds.length;
}

// -[BuildSingleShipDialog initDialog] 0x1000b4d60, layout 0x1000b5e14
// The app's strings (its own lists, in the game's language: fr.lproj / tr.lproj): Misc Strings are read by index (FUN_10008e4c8: objectAtIndex), Alert Strings and sprintf
// Templates by number less one (FUN_10008ecfc and the strings object's +0x60 method: objectAtIndex n - 1)
const IOSTR = (list, i) => { const L = window.HOLANG && window.HOLANG.ios, l = L && (L[uiLang()] || L.en), t = l && (l[list] || (L.en || {})[list]); return t && t[i] != null ? t[i] : ''; };
const miscS = (i) => IOSTR('Misc Strings', i), alertS = (n) => IOSTR('Alert Strings', n - 1), tmplS = (n) => IOSTR('sprintf Templates', n - 1);
const fillT = (t, ...v) => t.replace(/%(?:l|h)?[dus@]/g, () => String(v.shift())).replace(/%%/g, '%');
// +[DialogLayerSprite message:closeButton:cancelButton:] 0x1000bc9dc and DialogLayerSprite init 0x1000bc294 (FUN_10008ecb0 calls it with the check button on and the cross off): a dialog (dlgGeom), the message
// (addMessage: 0x1000bcad0: Arial 18, 24 on an iPad, centred, in a box (width - 4 a80) x (height - 8 a80) about the dialog's middle, so the text's top is 4 a80 under the top), the check and
// cancel buttons in a menu aligned horizontally (a80 apart) at (width - 4 a80, a80), anchored right bottom (enableCloseButton:cancelButton: 0x1000bca44 hides one and leaves its place).
// A touch outside the dialog is its cancel (doCancel 0x1000bcda8 -> doClose: YES).
//   o.message  the message text (addMessage:), o.ok  the check's work (doClose: NO), o.build(dlg, cw, ch, gd)  the subclass's own nodes, o.cross / o.check  false hides that button
function appDialog(o) {
  const { cw, ch, k } = dlgGeom(), gd = BGD(), pad = SCREEN.pad;
  const L = dialogLayer(cw, ch, k, o.label || o.message || 'Dialog', () => L.close());
  L.close = () => L.scrim.remove();
  if (o.message != null) {
    const msg = UIEl('div', 'ios-omsg', { style: `width:${bpt(cw - gd.a80 * 4)};font-size:${bpt(pad ? 24 : 18)}` });
    msg.textContent = o.message;
    L.dlg.append(put(msg, cw / 2, ch - gd.a80 * 4, 0.5, 1));
    L.msg = msg;
  }
  const bx = UIEl('button', 'ios-bcancel', { type: 'button', 'aria-label': 'Cancel' }, pic('button-x')), bk = UIEl('button', 'ios-bcheck', { type: 'button', 'aria-label': 'OK' }, pic('button-check'));
  bx.addEventListener('click', (e) => { e.stopPropagation(); L.close(); });
  bk.addEventListener('click', (e) => { e.stopPropagation(); L.close(); if (o.ok) o.ok(); });
  if (o.cross === false) bx.style.visibility = 'hidden';
  L.bx = bx; L.bk = bk; L.gd = gd; L.cw = cw; L.ch = ch;
  if (o.build) o.build(L.dlg, cw, ch, gd, L);
  L.dlg.append(put(UIEl('div', 'ios-bbtns', { style: `gap:${bpt(gd.a80)}` }, bx, bk), cw - gd.a80 * 4, gd.a80, 1, 0));
  pushScrim(L.scrim);
  return L;
}
// a message with the check button only (FUN_10008ecb0), or with the cross as well when it asks (message:closeButton:YES cancelButton:YES + setOkBlock:)
function appMessage(text, onOk) {
  const L = appDialog({ message: text, ok: onOk, cross: !!onOk });
  return L.scrim;
}
// a touch label: the text white, at (x, y) by its anchor, in the dialog's points (CCLabelTTF, Arial)
const dlabel = (text, size, x, y, ax, ay) => bLabel(text, size, x, y, ax, ay, '#fff');
// the app's number the way a CCLabelTTF is sized
const labelW = (text, size) => textW(String(text), size);
// -[DipIntoSavingsDialogLayer initDialog] 0x1000a7d74, valueChanged:tag: 0x1000a8438, doClose: 0x1000a8354 (layout read with tools/floats.py and the assembly): the message Misc Strings 78; Misc 79 and 80
// (Arial a58 = 16, 24 on an iPad) centred, their tops 10 a88 and 13.75 a88 under the top; Misc 81 (a38 = 10, 12) 18.75 a88 under the top; a CCSliderDeluxe 50 a88 wide (the slider:enableScale: is
// 300 on an iPhone) centred with its bottom 17.5 a88 up, set to percent / 30; the percent ("%ld%%", sprintf Template 27, Arial a18) centred 24 (a30) above its top; "0%", "15%", "30%" (a38) centred
// 2 a88 inside each end and 12 (2 a88) under its bottom. The slider's value is (int)(value x 30); the check keeps it (0 to 100) in the player (+0x5c); above 0 the Savings bar is given up (the ruleset's dipSet)
function openDipIOS() {
  const a = A(), G = a.G, p = a.me(), rs = HO.rules(G);
  let percent = p.dip || 0;
  const L = appDialog({ message: miscS(78), label: miscS(78),
    build(dlg, cw, ch, gd) {
      const q1 = dlabel(miscS(79), gd.a58, cw / 2, ch - gd.a88 * 10, 0.5, 1), q2 = dlabel(miscS(80), gd.a58, cw / 2, ch - gd.a88 * 13.75, 0.5, 1);
      const note = dlabel(miscS(81), gd.a38, cw / 2, ch - gd.a88 * 18.75, 0.5, 1);
      const sw = gd.a88 * 50, sy = gd.a88 * 17.5;
      const pctText = (v) => fillT(tmplS(27), v);
      const pl = dlabel(pctText(percent), gd.a18, cw / 2, sy + 19 + gd.a30, 0.5, 0.5);
      const sl = ccSlider(sw, (f) => { percent = Math.trunc(Math.fround(Math.fround(f) * 30)); pl.textContent = pctText(percent); });
      sl.set(percent / 30);
      dlg.append(q1, q2, note, put(sl.el, cw / 2, sy, 0.5, 0), pl);
      const inset = sw / 2 - gd.a88 * 2, ly = sy - gd.a88 * 2;
      dlg.append(dlabel(pctText(0), gd.a38, cw / 2 - inset, ly, 0.5, 0.5), dlabel(pctText(15), gd.a38, cw / 2, ly, 0.5, 0.5), dlabel(pctText(30), gd.a38, cw / 2 + inset, ly, 0.5, 0.5));
    },
    ok() {
      const v = percent > 100 ? 100 : percent < 0 ? 0 : percent;
      if ((p.dip || 0) !== v) { if (rs.dipSet) rs.dipSet(G, p, v); else p.dip = v; a.renderPanel(); a.draw(); a.save(); }
    } });
  return L;
}
// -[ArmageddonLayer setup] 0x1000a4acc, toggleArmageddon 0x1000a4f30, doClose: 0x1000a4fcc, reallyArmageddon 0x1000a5230 / cancelArmageddon 0x1000a5274: the message Misc Strings 102; Misc 103 (Arial a58) in a
// box (width - 80) x (height - 200), left aligned, its top 8.75 a88 under the top, centred; a CCMenuItemToggle of armageddon_off / armageddon_on (110 points square, each item scaled 0.125 a88 = 0.75) in a menu
// at (6.25 a88, 8.75 a88) anchored at its bottom left; to its right (menu left + width + 5 a88) and centred on its height, Misc 104 "Off" / 105 "On" (Arial a18). Choosing the check with a changed choice asks
// first (a message with the check and the cross; the layer has closed): Alert Strings 4 for turning it on, 5 for turning it off (the check calls reallyArmageddon / cancelArmageddon: both set the player's
// flag, +0x1118, to the choice); with the choice unchanged nothing is asked
function openArmageddonIOS() {
  const a = A(), G = a.G;
  let wants = !!a.me().armageddon;
  const L = appDialog({ message: miscS(102), label: miscS(102),
    build(dlg, cw, ch, gd) {
      const desc = UIEl('div', 'ios-bt ios-bwrap', { style: `width:${bpt(cw - 80)};font-size:${bpt(gd.a58)};text-align:left` }); desc.textContent = miscS(103);
      dlg.append(put(desc, cw / 2, ch - gd.a88 * 8.75, 0.5, 1));
      const mx = gd.a88 * 6.25, my = gd.a88 * 8.75, sz = 110, ks = gd.a88 * 0.125;
      const img = UIEl('button', 'ios-bmi ios-barm', { type: 'button', 'aria-label': miscS(102), style: `width:${bpt(sz)};height:${bpt(sz)}` });
      const word = dlabel(miscS(wants ? 105 : 104), gd.a18, mx + sz + gd.a88 * 5, my + sz / 2, 0, 0.5);
      const show = () => { img.replaceChildren(pic(wants ? 'armageddon_on' : 'armageddon_off')); img.firstChild.style.cssText = `width:${bpt(sz * ks)};height:${bpt(sz * ks)}`; word.textContent = miscS(wants ? 105 : 104); };
      img.addEventListener('click', (e) => { e.stopPropagation(); wants = !wants; show(); });
      show();
      dlg.append(put(img, mx, my, 0, 0), word);
    },
    ok() {
      if (wants === !!a.me().armageddon) return;
      const apply = () => { HO.setArmageddon(G, a.ME, wants); a.renderPanel(); a.draw(); a.save(); };
      appMessage(alertS(wants ? 4 : 5), apply);
    } });
  return L;
}
// -[ScrapShipTypesLayer initDialog] 0x1000a3b40, addShipMenu:player: 0x1000a3d8c, doClose: 0x1000a3e84, shipSelected: 0x1000a3e48; ScrapShipMenuItem init 0x1000a404c, draw 0x1000a4338: the message Misc Strings 106; a
// scrolling list (CCMenuAdvanced) from 10 a88 under the top to 10 a88 above the bottom, its items 15 apart from the top; each item scaled 0.8: the ship's picture (ShipNode) and, 4 further (a80) and centred
// on it, two Arial 16 lines 4 apart: the type's name and "Number in Existence: %d" (sprintf Template 26); a tap flips the item's scrapped mark, drawn as a red (221, 8, 6) cross over the item (GL lines one pixel
// wide from corner to corner). The check writes the marks to the ship types (the remake's mark: flagScrapDesign, kept to the end of the turn)
function openScrapIOS() {
  const a = A(), G = a.G, p = a.me(), rs = HO.rules(G);
  const types = p.designs.filter(d => !d.scrapped);
  const count = {}; for (const f of G.fleets) if (f.owner === a.ME) for (const k in f.ships) count[k] = (count[k] || 0) + f.ships[k];
  const want = new Map(types.map(d => [d.id, !!d.scrap301]));
  const L = appDialog({ message: miscS(106), label: miscS(106),
    build(dlg, cw, ch, gd) {
      const list = UIEl('div', 'ios-scl', { style: `top:${bpt(gd.a88 * 10)};bottom:${bpt(gd.a88 * 10)}` });
      for (const d of types) {
        const cv = a.IMG && HOTHEME.shipPic(d, a.IMG), sw = cv ? cv.width : 0, sh = cv ? cv.height : 0;
        const t1 = d.name, t2 = fillT(tmplS(26), count[d.id] || 0), tw = Math.max(labelW(t1, 16), labelW(t2, 16));
        const w = sw + gd.a80 + tw, h = Math.max(sh, 16 * 1.15 * 2 + gd.a80);
        const item = UIEl('button', 'ios-scitem', { type: 'button', style: `width:${bpt(w * 0.8)};height:${bpt(h * 0.8)}` });
        const inner = UIEl('div', 'ios-scin', { style: `width:${bpt(w)};height:${bpt(h)};transform:scale(0.8)` });
        if (cv) { cv.style.cssText = `width:${bpt(sw)};height:${bpt(sh)};flex:none`; inner.append(cv); }
        const tx = UIEl('div', 'ios-sctx', { style: `margin-left:${bpt(gd.a80)}` }, UIEl('span', null, { translate: 'no' }), UIEl('span'));
        tx.children[0].textContent = t1; tx.children[1].textContent = t2; tx.style.gap = bpt(gd.a80);
        inner.append(tx);
        const cross = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cross.setAttribute('class', 'ios-sccross'); cross.setAttribute('viewBox', `0 0 ${w} ${h}`); cross.setAttribute('preserveAspectRatio', 'none');
        cross.innerHTML = `<path d="M0 0L${w} ${h}M0 ${h}L${w} 0" stroke="rgb(221,8,6)" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`;
        inner.append(cross);
        const mark = () => { item.classList.toggle('scrapped', want.get(d.id)); };
        item.addEventListener('click', (e) => { e.stopPropagation(); want.set(d.id, !want.get(d.id)); mark(); });
        mark();
        item.append(inner); list.append(item);
      }
      dlg.append(list);
    },
    ok() {
      for (const d of types) if (want.get(d.id) !== !!d.scrap301) rs.flagScrapDesign(G, p, d, 'command');
      a.renderPanel(); a.draw(); a.save();
    } });
  return L;
}
// FUN_100038438 0x100038438 (read in full): report number -> Sounds item. The Sounds list's items are the files 2000, 2001, 3000-3003, 4000, 4001, 5000-5003, 6000-6002 (items 0-14), 7000-7007 (15-22),
// 7012-7027 (23-38), then 8000 (39): the evacuate marks (items 17 and 6 = 7002 and 4000), the drag tick (16 = 7001), the end turn "ahem" (15 = 7000) and the eliminated player's two sounds (item 1, 32) fix the order
const TAP_FILE = [2000, 2001, 3000, 3001, 3002, 3003, 4000, 4001, 5000, 5001, 5002, 5003, 6000, 6001, 6002, 7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7012, 7013, 7014, 7015, 7016, 7017, 7018, 7019, 7020, 7021, 7022, 7023, 7024, 7025, 7026, 7027, 8000];
const TAP_TABLE = (() => {
  const t = {}, set = (item, ...ids) => { for (const i of ids) t[i] = item; };
  set(0, 0x3eb, 0x3ec, 0x3ed, 0x3ee, 0x3ef, 0x3f0, 0x406, 0x43d, 0x450, 0x451, 0x45c, 0x45d, 0x45e, 0x45f, 0x460, 0x461, 0x462, 0x463, 0x464, 0x465, 0x469, 0x472);
  set(1, 0x3f3, 0x433, 0x434, 0x444, 0x44a, 0x452, 0x453, 0x46f);
  set(4, 0x3f5); set(0x1f, 0x3fd, 0x43e, 0x440, 0x442, 0x446, 0x448, 0x468, 0x46a, 0x46b, 0x46c, 0x474); set(0x18, 0x402, 0x403); set(0x1d, 0x40b);
  set(null, 0x40c, 0x40d, 0x40e, 0x47f);
  set(10, 0x417, 0x427); set(11, 0x418, 0x428); set(9, 0x419, 0x429, 0x47e); set(0x1b, 0x41d, 0x42d); set(5, 0x431, 0x438, 0x43c);
  set(0x20, 0x435, 0x436); set(0x1c, 0x443, 0x449); set(0x1a, 0x44c, 0x44d, 0x44e, 0x44f, 0x47b, 0x47c, 0x47d); set(0x27, 0x46d, 0x470); set(0x19, 0x471, 0x482, 0x485, 0x486); set(0x1e, 0x473);
  return t;
})();
function tapItem(id, m, a) {
  if (id in TAP_TABLE) return TAP_TABLE[id];
  if (id === 0x409 || id === 0x40a) { // FUN_10003befc: the star's quality for the player
    const p = a.me(), q = m.star != null ? starQuality(p, HO.know(a.G, p, m.star)) : -1;
    return q < 15 ? (q === 0 ? 13 : 14) : 12;
  }
  if (id === 0x432) { const who = a.G.players.find(q => String(m.text || '').startsWith(q.name + ' ')); return who && HO.isBuddy(a.G, a.ME, who.id) ? 1 : 0x20; }
  return 16;
}
// -[PreferencesLayer initDialog] 0x1000a6a4c, setupPreferenceXPosition:yPosition:label:tag:choiceLabel: 0x1000a7b3c, valueChanged:tag: 0x1000a799c, the toggles 0x1000a75dc-0x1000a7940, doClose: 0x1000a74c8
// (the numbers read in the assembly; H the dialog's height, y up). The message Misc 82. Eight rows, the first (Event Messages, 195) with its centre H - 60 (H - 90 on an iPad), each next 32.5 (19 + 2.25 a88) lower; a row is
// the title (Arial 14, anchored at its left, middle) at x 4 a88 (Messages, Battles, Hints and Best Buddies at 5.5 a88), a switch (a CCSliderDeluxe 10 a88 wide, anchored at its left) at x 24 a88, and the words of its
// state (Arial 14) 20 right of the switch. A switch is on at 50 or over of its 100 (the thumb is left where the finger lets go), the words follow (Show / Hide ...); Event Messages on Hide hides the switches and words
// of the four rows under it (the titles are plain labels no field holds, and stay). "Review Battle Speed:" (Misc 97, Arial 14) centred at (60 a88, the Hints row's y), the slider (28 a88 wide, scale 0.125 a88, anchored at its
// bottom middle) 6 a88 under that, Slow (98) and Fast (99) (Arial 11, anchored at their bottom middles) 20 under it, 30 inside the ends of its unscaled width; its value is 30 - delay, the delay (int)(30 - 30 x value).
// The check keeps all of it, the cross nothing. The remake's own options are in a separate window (a browser has no use for the others), reached by a small button under the dialog.
function openPrefsIOS(P) {
  const { D, W } = P, a = A();
  const pad = SCREEN.pad;
  const L = appDialog({ message: miscS(82), label: miscS(82),
    build(dlg, cw, ch, gd) {
      const a88 = gd.a88, rowsDef = [['show', 195, 186, 187, 0], ['important', 196, 188, 189, 1], ['review', 197, 190, 154, 1], ['hints', 198, 105, 104, 1], ['buddies', 149, 105, 104, 1], ['celsius', 14, 192, 191, 0], ['sound', 199, 105, 104, 0], ['male', 200, 193, 194, 0]];
      let y = ch - (pad ? 90 : 60); const pos = {}, under = [];
      for (const [k, t, on, off, ind] of rowsDef) {
        if (k !== 'show') y -= 19 + a88 * 2.25;
        pos[k] = y;
        const title = dlabel(miscS(t), 14, a88 * 4 + (ind ? a88 * 1.5 : 0), y, 0, 0.5);
        const words = dlabel('', 14, a88 * 24 + a88 * 10 + 20, y, 0, 0.5);
        const sw = ccSlider(a88 * 10, (f) => { D[k] = Math.fround(f * 100) >= 50; D_sync(); });
        sw.set(D[k] ? 1 : 0);
        dlg.append(title, put(sw.el, a88 * 24, y, 0, 0.5), words);
        if (ind) under.push(sw.el, words);
        const upd = () => { words.textContent = miscS(D[k] ? on : off); };
        sw.upd = upd; pos[k + '_sw'] = sw;
      }
      function D_sync() {
        for (const k of ['show', 'important', 'review', 'hints', 'buddies', 'celsius', 'sound', 'male']) pos[k + '_sw'].upd();
        for (const e of under) e.style.visibility = D.show ? '' : 'hidden';
      }
      D_sync();
      const hy = pos.hints, sx = a88 * 60, sw2 = a88 * 28;
      dlg.append(dlabel(miscS(97), 14, sx, hy, 0.5, 0.5));
      const sp = ccSlider(sw2, (f) => { const delay = Math.trunc(Math.fround(30 - Math.fround(Math.fround(f) * 30))); D.speed = 30 - delay; });
      sp.set(D.speed / 30);
      const spEl = put(sp.el, sx, hy - a88 * 6, 0.5, 0); spEl.style.transform += ` scale(${a88 * 0.125})`; spEl.style.transformOrigin = '50% 100%';
      dlg.append(spEl);
      dlg.append(dlabel(miscS(98), 11, sx - sw2 / 2 + 30, hy - a88 * 6 - 20, 0.5, 0), dlabel(miscS(99), 11, sx + sw2 / 2 - 30, hy - a88 * 6 - 20, 0.5, 0));
    },
    ok() { P.ok(); } });
  // the remake's own options (a browser's: sound effects of its own, modern conveniences, tips): not in the app, so a small plain button outside the dialog
  const ro = UIEl('button', 'ios-bmi ios-bremake', { type: 'button' }); ro.textContent = 'Remake options…'; ro.setAttribute('translate', 'yes');
  ro.addEventListener('click', (e) => { e.stopPropagation(); P.options(); });
  L.scrim.append(ro);
  return L;
}
// -[WebViewDialog initDialog] 0x1000b92b0, setupResource: 0x1000b94a8, webView:shouldStartLoadWithRequest:navigationType: 0x1000b9618, backButtonPressed 0x1000b9784 (WelcomeScene doHelp 0x10001e0e0 hands it
// help_index_iphone, or help_index on an iPad): a dialog as big as the screen (scale 1), the message "Spaceward Ho Help" (a literal, in English), the mini close button, and a UIWebView (black, not opaque) 24 points
// narrower than the dialog (12 each side), from 68 under the top to 28 above the bottom (the frame's height is the dialog's less 96, its centre 20 under the middle). Links: a page that is not a file (a web address,
// mail) is opened outside the app; "closeme.html" closes the help; the rest load in place. Back (backButtonPressed): on the index page it closes, else the web view goes back. The page is the help's own HTML
// (assets/skins/ios/help, help-fr, help-tr: the game's language), in a frame; the browser's own back button (Escape closes)
function openHelpIOS(url) {
  const gd = BGD(), { k } = dlgGeom(), cw = Math.trunc(SCREEN.winW / k), ch = Math.trunc(SCREEN.winH / k);
  if (!SCREEN.pad) url = url.replace(/help_index\.html$/, 'help_index_iphone.html');
  const L = dialogLayer(cw, ch, k, 'Spaceward Ho Help', () => {});
  const close = () => { fr.remove(); L.scrim.remove(); document.removeEventListener('keydown', esc, true); };
  const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', esc, true);
  const msg = UIEl('div', 'ios-omsg', { style: `width:${bpt(cw - gd.a80 * 4)};font-size:${bpt(SCREEN.pad ? 24 : 18)}` });
  msg.textContent = 'Spaceward Ho Help'; msg.setAttribute('translate', 'no');
  L.dlg.append(put(msg, cw / 2, ch - gd.a80 * 4, 0.5, 1));
  const x = UIEl('button', 'ios-gx', { type: 'button', 'aria-label': 'Close' }, pic('button-x'));
  x.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  L.dlg.append(x);
  const fr = UIEl('iframe', 'ios-help', { src: url, title: 'Spaceward Ho Help', style: `left:${bpt(12)};top:${bpt(68)};width:${bpt(cw - 24)};height:${bpt(ch - 96)}` });
  L.dlg.append(fr);
  fr.addEventListener('load', () => {
    let d; try { d = fr.contentDocument; } catch (e) { return; }
    if (!d) return;
    d.addEventListener('click', (e) => {
      const an = e.target.closest && e.target.closest('a[href]'); if (!an) return;
      const href = an.getAttribute('href');
      if (/closeme\.html$/.test(href)) { e.preventDefault(); close(); }
      else if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^file:/i.test(href)) { e.preventDefault(); window.open(an.href, '_blank', 'noopener'); }
    });
  });
  pushScrim(L.scrim);
  return L;
}
// -[AutoPlayLayer initDialog] 0x100096584, valueChanged:tag: 0x100097aa0, showPlayOneTurn 0x100097ddc / showJustEndTurns 0x10009801c / showPlayForMe 0x10009822c, togglePlayOneTurn 0x1000978ec, toggleEndMyTurns
// 0x1000979fc, toggleAutoPlay 0x10009795c, doClose: 0x100097870 (positions read in the assembly; a88 = 6, 8 on an iPad; H the dialog's height; y up). The message Misc 118. The state slider (tag 3, 40 a88 wide) is centred at
// H - trunc(6.875 a88 + trunc(3.75 a88)) (63): up to 33 per cent of it is "Play One Turn" (Misc 119, or 184 "Already Played One Turn" when the computer has played this turn, when the check goes too), 34 to 67
// "Just End My Turns Only" (134), 68 and over "Computer Play For Me" (133); the state's label (Arial a18) hangs from 3.5 a88 under the slider, centred. The Friendly (124) - Aggressive (125) slider (tag 2, 30 a88 wide)
// at (W / 4, H - trunc(18 a88 + trunc(3.75 a88))) and the No Defense (126) - Dig In (127) slider (tag 1) at (3 W / 4, the same), the end words (Arial a38) hanging 10 under the sliders' bottoms from their ends; values
// (int)(value x 100), set from the preferences (aggressiveness +0x219, defensiveness +0x21a; first 50 and 50). The toggle (a CCMenuItemFont in Arial at 0.75 of the font size the gear's init left, a30) of "Do NOT
// Turn Off When Something Interesting Happens" (135) / "Do Turn Off ..." (136), centred at H - trunc(30 a88 + trunc(3.75 a88)), index from +0x21b (first 1). The seconds slider (tag 4, 15 a88 wide, value
// seconds / 10, seconds from +0x21e, first 4) at (27 a88, trunc(3.125 a88 + trunc(3.75 a88))) with "0" (128) and "10" (129) under its ends, "Click through the" (130) and "messages every" (131) right-aligned
// 10 left of it (7.5 and 3.75 above and below its middle), the number (Arial a18) 10 right of it and "seconds" (132, Arial 16) 10 further. Just End My Turns shows the toggle and the seconds; Computer Play For Me
// all. The check: Play One Turn has the computer plan this turn (the orders, the turn not ended); the others save the choices, set auto play on and start it (the computer plays, or only ends turns; the
// seconds between messages; the toggle's choice stops it on something interesting). The browser keeps the toggle and the seconds in 'ho.ios.auto'
let playedOne = null;
function readAuto() { try { const v = JSON.parse(localStorage.getItem('ho.ios.auto')); if (v && typeof v.every === 'number') return v; } catch (e) {} return { stop: 1, every: 4 }; }
function openAutoPlayIOS() {
  const a = A(), G = a.G, p = a.me(), rs = HO.rules(G), auto = readAuto();
  const cur = rs.autoPlaySettings ? rs.autoPlaySettings(G, p) : { aggr: 50, colDef: 50 };
  const V = { aggr: cur.aggr, def: cur.colDef, stop: auto.stop ? 1 : 0, secs: auto.every };
  let state = 1;
  const played = () => !!playedOne && playedOne.G === G && playedOne.turn === G.turn && playedOne.me === a.ME;
  const pct = (f) => Math.trunc(Math.fround(Math.fround(f) * 100));
  const L = appDialog({ message: miscS(118), label: miscS(118),
    build(dlg, cw, ch, gd, Lr) {
      const a88 = gd.a88, t375 = Math.trunc(a88 * 3.75), W = cw, H = ch;
      const yState = H - Math.trunc(a88 * 6.875 + t375), yDef = H - Math.trunc(a88 * 18 + t375), yStop = H - Math.trunc(a88 * 30 + t375), yRev = Math.trunc(a88 * 3.125 + t375);
      const sh = 19, els = {};
      const lab = (key, text, size, x, y, ax, ay) => { els[key] = dlabel(text, size, x, y, ax, ay); dlg.append(els[key]); return els[key]; };
      const stateSl = ccSlider(a88 * 40, (f) => { const v = pct(f); setState(v <= 33 ? 1 : v < 68 ? 2 : 3); });
      stateSl.set(0); dlg.append(put(stateSl.el, W / 2, yState, 0.5, 0.5));
      for (const [k, t] of [['p1', miscS(119)], ['pd', miscS(184)], ['je', miscS(134)], ['cp', miscS(133)]]) lab(k, t, gd.a18, W / 2, yState - a88 * 3.5, 0.5, 1);
      const offSl = ccSlider(a88 * 30, (f) => { V.aggr = pct(f); }), defSl = ccSlider(a88 * 30, (f) => { V.def = pct(f); });
      offSl.set(V.aggr / 100); defSl.set(V.def / 100);
      const ox = W * 0.25, dx = W * 0.25 * 3, ey = yDef - sh / 2 - 10, hw = a88 * 15;
      dlg.append(put(offSl.el, ox, yDef, 0.5, 0.5), put(defSl.el, dx, yDef, 0.5, 0.5));
      lab('fr', miscS(124), gd.a38, ox - hw, ey, 0, 1); lab('ag', miscS(125), gd.a38, ox + hw, ey, 1, 1);
      lab('nd', miscS(126), gd.a38, dx - hw, ey, 0, 1); lab('di', miscS(127), gd.a38, dx + hw, ey, 1, 1);
      const stop = UIEl('button', 'ios-bmi ios-bstop', { type: 'button', style: `font-size:${bpt(gd.a30 * 0.75)}` });
      const stopText = () => { stop.textContent = miscS(V.stop ? 136 : 135); };
      stop.addEventListener('click', (e) => { e.stopPropagation(); V.stop = V.stop ? 0 : 1; stopText(); });
      stopText(); els.stop = stop; dlg.append(put(stop, W / 2, yStop, 0.5, 0.5));
      const rw = a88 * 15, rx = a88 * 27;
      const revSl = ccSlider(rw, (f) => { V.secs = Math.trunc(Math.fround(Math.fround(f) * 10)); num.textContent = String(V.secs); });
      revSl.set(V.secs / 10); dlg.append(put(revSl.el, rx, yRev, 0.5, 0.5)); els.rev = revSl.el;
      lab('z', miscS(128), gd.a38, rx - rw / 2, yRev - sh / 2 - 10, 0.5, 1); lab('t', miscS(129), gd.a38, rx + rw / 2, yRev - sh / 2 - 10, 0.5, 1);
      lab('ct', miscS(130), gd.a38, rx - rw / 2 - 10, yRev + a88 * 1.25, 1, 0.5); lab('me', miscS(131), gd.a38, rx - rw / 2 - 10, yRev - a88 * 0.625, 1, 0.5);
      const num = lab('n', String(V.secs), gd.a18, rx + rw / 2 + 10, yRev, 0, 0.5);
      lab('s', miscS(132), 16, rx + rw / 2 + 10 + labelW(String(V.secs), gd.a18) + 10, yRev, 0, 0.5);
      const gone = ['fr', 'ag', 'nd', 'di'];
      const all = { play: [offSl.el, defSl.el, ...gone.map(k => els[k]), stop, revSl.el, ...['z', 't', 'ct', 'me', 'n', 's'].map(k => els[k])] };
      const show = (list, on) => { for (const e of list) e.style.visibility = on ? '' : 'hidden'; };
      const end = [stop, revSl.el, ...['z', 't', 'ct', 'me', 'n', 's'].map(k => els[k])];
      function setState(s) {
        state = s;
        show([els.p1], s === 1 && !played()); show([els.pd], s === 1 && played()); show([els.je], s === 2); show([els.cp], s === 3);
        show([offSl.el, defSl.el, ...gone.map(k => els[k])], s === 3); show(end, s >= 2);
        Lr.bk.style.visibility = s === 1 && played() ? 'hidden' : '';
      }
      setState(1);
    },
    ok() {
      if (state === 1) { if (played()) return; HO.aiOf(G).turn(G, p); playedOne = { G, turn: G.turn, me: a.ME }; a.renderPanel(); a.draw(); a.save(); return; }
      try { localStorage.setItem('ho.ios.auto', JSON.stringify({ stop: V.stop, every: V.secs })); } catch (e) {}
      if (state === 3 && rs.autoPlaySettings) { rs.autoPlaySettings(G, p, { aggr: V.aggr, colDef: V.def }); a.save(); }
      a.runAutoPlay({ turns: Infinity, computer: state === 3, won: !!V.stop, lost: !!V.stop, news: !!V.stop, every: V.secs, stopButton: true });
    } });
  return L;
}
function openSingleShip(flow, cls, index) {
  const a = A(), G = a.G, p = a.me(), sid = flow.sid, gd = BGD();
  if (flow.single) { flow.single.remove(); flow.scrims = flow.scrims.filter(x => x !== flow.single); flow.single = null; }
  const { cw: W, ch: H, k } = dlgGeom();
  const close = () => { if (flow.single) { flow.single.remove(); flow.scrims = flow.scrims.filter(x => x !== flow.single); flow.single = null; } };
  const L = dialogLayer(W, H, k, 'Build', close), dlg = L.dlg;
  flow.single = L.scrim; flow.scrims.push(L.scrim);
  const hw = (W - 40) / 2, xc = hw / 2 + W / 2, step = SCREEN.pad ? gd.a80 * 4 : gd.a88 * 5, r = gd.a88 * 3;
  let selected = -1; // mSelected: the index into the player's types, -1 for a type not yet made
  let cur = { type: ShipClass[cls], R: 0, V: 0, W: 0, S: 0, M: 0 };
  const lv = () => ({ R: p.tech.range, V: p.tech.speed, W: p.tech.weapons, S: p.tech.shields, M: p.tech.mini });
  // the name: a BackgroundBorderNode 0x100093738 (fill 0xff5a1c18, a white border 2 points wide drawn 2 in) and a CCTextField (centred text, Arial 18) over it
  const nw = hw - 20, nameY = H - 16 - gd.a88;
  const nbg = UIEl('div', 'ios-bnbg', { style: `width:${bpt(nw)};height:${bpt(32)}` }, UIEl('i'));
  dlg.append(put(nbg, xc, nameY, 0.5, 1));
  const name = UIEl('input', 'ios-bname', { type: 'text', maxlength: '15', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Ship name', style: `width:${bpt(nw)};height:${bpt(32)};font-size:${bpt(gd.fi)}` });
  name.setAttribute('translate', 'no');
  dlg.append(put(name, xc, nameY - 5, 0.5, 1));
  let shipEl = null;
  const inSvc = bLabel('', gd.f, xc, nameY - 5 - 32 - 90, 0.5, 1, '#fff'); dlg.append(inSvc);
  // five technologies: the label at x 20, the SliderArray's right edge at width / 2 - 10, 30 apart (an iPad's 32)
  const labs = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'], maxLab = Math.max(...labs.map(t => textW(t, gd.f)));
  const dummy = 24 + 0 + textW('0', gd.f) + gd.a80 * 3;
  const sw = hw - maxLab - dummy - 20;
  const T = labs.map((t, i) => {
    const y = H - 30 - i * step;
    dlg.append(bLabel(t, gd.f, 20, y, 0, 0.5, '#fff'));
    const S = sliderArray({ width: sw, change: () => techAdjusted() });
    S.min = (i === 0 || i === 4) ? 0 : 1; S.max = [p.tech.range, p.tech.speed, p.tech.weapons, p.tech.shields, p.tech.mini][i]; S.setValue(S.max); // adjustControlsForPlayer 0x1000b745c
    dlg.append(put(S.el, W / 2 - 10, y, 1, 0.5));
    return S;
  });
  // the costs: ValueWithLabel rows (the label at x 20 / width / 2, the value right at width / 2 - 10 / width - 20)
  const Y0 = nameY - 5 - 32 - 90 - step * 1.5, Y = [Y0, Y0 - r, Y0 - 2 * r, Y0 - 3 * r, Y0 - 4 * r, Y0 - 6 * r];
  const row = (text, col, y) => {
    const lx = col === 1 ? 20 : W / 2, vx = col === 1 ? W / 2 - 10 : W - 20;
    const lab = bLabel(text, gd.f, lx, y, 0, 0.5, '#fff'), val = bLabel('', gd.f, vx, y, 1, 0.5, '#fff');
    dlg.append(lab, val); return { lab, val, show(on) { lab.style.display = val.style.display = on ? '' : 'none'; } };
  };
  const dev = row('Dev Cost', 1, Y[0]), pro = row('Pro Cost', 1, Y[1]), tot = row('Total Cost', 2, Y[1]), met = row('Metal Cost', 1, Y[2]), totM = row('Total Metal', 2, Y[2]),
    mon = row('Savings:', 1, Y[3]), metL = row('Metal:', 2, Y[3]);
  // Allow Debt: a two-word slider of 60 points, no arrows, at "No"
  dlg.append(bLabel('Allow Debt', gd.f, 20, Y[4], 0, 0.5, '#fff'));
  const debt = sliderArray({ width: 60, arrows: false, words: ['No', 'Yes'], change: () => { updateDebt(); } }); debt.min = 0; debt.max = 1; debt.setValue(0);
  dlg.append(put(debt.el, W / 2 - 10, Y[4], 1, 0.5));
  const nl = bLabel('# To Build', gd.f, 20, Y[5], 0, 0.5, '#fff'); dlg.append(nl);
  const bs = sliderArray({ width: (W - 40) / 2 * 0.5 * 1.25, change: () => updateCosts() });
  dlg.append(put(bs.el, gd.a80 + textW('# To Build', gd.f) + 20, Y[5], 0, 0.5));
  const warnT = UIEl('div', 'ios-bwarnt'), warn = UIEl('div', 'ios-bwarn', { style: `width:${bpt(222.222)};font-size:${bpt(gd.f)}` }, warnT); dlg.append(put(warn, xc, nameY - 5 - 32 - 90 - 20, 0.5, 1)); warn.style.display = 'none';
  // the buttons: the cancel cross and the check, 4 apart, at (width - 4 a80, a80), anchored right bottom (enableCloseButton:cancelButton: 0x1000bca44, setContentSize: 0x1000bcc94)
  const bx = UIEl('button', 'ios-bcancel', { type: 'button', 'aria-label': 'Cancel' }, pic('button-x')), bk = UIEl('button', 'ios-bcheck', { type: 'button', 'aria-label': 'Build' }, pic('button-check'));
  bx.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  bk.addEventListener('click', (e) => { e.stopPropagation(); buildNow(); });
  const bm = UIEl('div', 'ios-bbtns', { style: `gap:${bpt(gd.a80)}` }, bx, bk); dlg.append(put(bm, W - gd.a80 * 4, gd.a80, 1, 0));

  // ---- the logic (BuildSingleShipDialog) ----
  const specOf = () => ({ type: cur.type, R: T[0].value, V: T[1].value, W: T[2].value, S: T[3].value, M: T[4].value });
  const shipRec = () => selected >= 0 ? designsOf(p)[selected] : null;
  // the record's costs (FUN_100037124): the first ship's whole price, the next ones', the metal
  function costs() {
    const d = shipRec(), spec = d || specOf(), c = HO.designCost(G, spec);
    const probe = d || Object.assign({}, spec, { built: 0, free: false, id: -1 });
    const first = HO.shipCostNow(G, p, probe);
    return { dev: first.money, pro: c.money, metal: c.metal, built: d ? d.built : 0, alive: d ? aliveOf(G, a.ME, d) : 0 };
  }
  function drawShip() {
    if (shipEl) shipEl.remove();
    const cv = a.IMG && HOTHEME.shipPic(shipRec() || specOf(), a.IMG);
    if (cv) { cv.className = 'ios-bshipc'; cv.style.width = bpt(cv.width); cv.style.height = bpt(cv.height); dlg.append(put(cv, xc, nameY - 5 - 32, 0.5, 1)); } // ShipNode ship, anchor (0.5, 1)
    shipEl = cv;
  }
  // -[BuildSingleShipDialog flashRed:] 0x1000b77f8: a CCTintTo to (255, 0, 0) over 1 s, then (255, 175, 175) over 0.2 s, for ever
  const flashing = new Map();
  function flash(r) {
    if (flashing.has(r.val)) return;
    const lead = r.val.animate([{ color: '#fff' }, { color: '#f00', offset: 1 / 1.2 }, { color: '#ffafaf' }], { duration: 1200, fill: 'forwards' });
    const anims = [lead]; flashing.set(r.val, anims);
    lead.onfinish = () => { if (flashing.get(r.val) === anims) anims.push(r.val.animate([{ color: '#ffafaf' }, { color: '#f00', offset: 1 / 1.2 }, { color: '#ffafaf' }], { duration: 1200, iterations: Infinity })); };
  }
  function calm(r) { const an = flashing.get(r.val); if (an) { an.forEach(x => x.cancel()); flashing.delete(r.val); } r.val.style.color = '#fff'; }
  // -[BuildSingleShipDialog determineCapacity] 0x1000b6a08
  function determineCapacity() {
    const c = costs(), d = shipRec();
    let avail = p.savings; if (debt.value) avail = p.savings - HO.borrowLimit(G, p);
    let first = 0;
    if (c.built === 0) { avail -= c.dev; first = avail > 0 ? 1 : 0; avail = Math.max(0, avail); }
    const money = c.pro !== 0 ? Math.trunc(avail / c.pro) + first : first;
    const metalN = c.metal === 0 ? 9999 : Math.trunc(p.metal / c.metal);
    let n = Math.max(0, Math.min(money, metalN));
    n = Math.min(n, colonyRoom());
    if (d && d.scrap301) n = 0;
    bs.max = n; bs.min = 0;
    let v = bs.value;
    if (v <= n) v = (n < 1 || v !== 0) ? v : 1; else v = n;
    bs.setValue(v);
    if (bs.value === 0) {
      bk.style.visibility = 'hidden';
      if (metalN !== 0) calm(met); else flash(met);
      if (money === 0) { flash(pro); flash(dev); } else { calm(pro); calm(dev); }
    } else { bk.style.visibility = ''; calm(met); calm(pro); calm(dev); }
    return c;
  }
  // how many more ships the colony can take (the colony record's [0xc] less [0x10]): the ruleset's yardRoom, counted by trying
  function colonyRoom() {
    const rs = HO.rules(G), st = G.stars[sid];
    if (!rs.yardRoom) return 9999;
    const probe = Object.assign({}, specOf(), { id: -1, built: 1, free: false });
    const mark = p.spentThisTurn.length; let n = 0;
    while (n < 9999 && rs.yardRoom(G, p, st, probe)) { p.spentThisTurn.push({ did: -1, sid, money: 0, metal: 0 }); n++; }
    p.spentThisTurn.length = mark;
    return n;
  }
  // -[BuildSingleShipDialog updateCosts] 0x1000b6704
  function updateCosts() {
    const c = costs(), n = bs.value, spec = shipRec() || specOf();
    const money = n < 1 ? 0 : c.built === 0 ? c.dev + c.pro * (n - 1) : c.pro * n, metal = c.metal * Math.max(0, n);
    const many = n >= 10 && (cur.type === 'scout' || cur.type === 'tanker');
    bs.lab.style.color = many ? '#f00' : '#fff';
    warn.style.display = many ? '' : 'none';
    if (many) warnT.textContent = HO.say(G, HO.DATA.alerts[cur.type === 'scout' ? 35 : 36]);
    tot.val.textContent = bnum(money, true); totM.val.textContent = bnum(metal, false);
    mon.val.textContent = bnum(p.savings - money, true); metL.val.textContent = bnum(p.metal - metal, false);
  }
  function updateDebt() { determineCapacity(); updateCosts(); }
  // -[BuildSingleShipDialog updateExtraShipData] 0x1000b64b8
  function updateExtra() {
    const c = costs();
    dev.val.textContent = bnum(c.dev, true); dev.show(c.built === 0);
    pro.val.textContent = bnum(c.pro, true); met.val.textContent = bnum(c.metal, false);
    inSvc.textContent = `${a.fmt(c.alive)}/${a.fmt(c.built)} In Service`;
    determineCapacity(); updateCosts();
  }
  function fromControls() { const sp = specOf(); Object.assign(cur, sp); cur.name = name.value; drawShip(); }
  // -[BuildSingleShipDialog adjustControlsFor:] 0x1000b70f4: first each slider whose thumb is off the left end is shown and the others hidden (enableTech:enabled: on the
  // CCSliderDeluxe's 0-1 value), then the limits from the player's levels: range up to the level (+3 for a scout, -1 for a tanker), speed (-1 for a tanker), weapons and
  // shields (-1 for a scout), minimum 1 but for the range (0) and the mini; a slider that was at its top, or above the new top (the range: or 0) goes to it; a satellite
  // has no range or speed (0, hidden); a biological has none of the five
  function adjustFor(c) {
    cur.type = ShipClass[c];
    if (c === 7) { // (the remake's decoy: the ruleset's own limits)
      const Lm = HO.designLimits(G, p, 'decoy'); [Lm.R, Lm.V, Lm.W, Lm.S, Lm.M].forEach((mx, i) => { T[i].max = mx; T[i].setValue(mx); T[i].enable(true); }); return;
    }
    T.forEach((S) => S.enable(S.sl.f > 0));
    const lvl = lv();
    let m = lvl.R + (c === 0 ? 3 : c === 3 ? -1 : 0), was = T[0].maxed(); T[0].max = m;
    if (c === 5) { T[0].setValue(0); T[0].enable(false); }
    else if (was || T[0].value > m || T[0].value === 0) T[0].setValue(m);
    m = lvl.V - (c === 3 ? 1 : 0); was = T[1].maxed(); T[1].max = m; T[1].min = 1;
    if (c === 5 || was || T[1].value > m) T[1].setValue(m);
    [2, 3].forEach((i) => { const mm = (i === 2 ? lvl.W : lvl.S) - (c === 0 ? 1 : 0), w = T[i].maxed(); T[i].max = mm; T[i].min = 1; if (w || T[i].value > mm) T[i].setValue(mm); });
    if (c === 6) T.forEach(S => S.enable(false));
  }
  function autoName(c) { return HO.designName(G, p, ShipClass[c]); }
  // -[BuildSingleShipDialog handleTechAdjusted] 0x1000b6408
  function matching() { const ds = designsOf(p), sp = specOf(); return ds.findIndex(d => d.type === sp.type && d.R === sp.R && d.V === sp.V && d.W === sp.W && d.S === sp.S && d.M === sp.M); }
  function techAdjusted() {
    const was = selected;
    fromControls(); selected = matching(); updateExtra();
    if (selected !== was) {
      if (selected >= 0) setShip(selected);
      else if (was >= 0) { name.value = autoName(classOf(cur.type)); fromControls(); }
    }
  }
  // -[BuildSingleShipDialog setShip:] 0x1000b6d98
  function setShip(i) {
    const ds = designsOf(p), d = ds[i]; if (!d) return;
    selected = i; adjustFor(classOf(d.type));
    [d.R, d.V, d.W, d.S, d.M].forEach((v, j) => T[j].setValue(v));
    if (name.value !== d.name) name.value = d.name;
    updateExtra(); fromControls();
  }
  // -[BuildSingleShipDialog setShipClass:] 0x1000b6ef4
  function setClass(c) {
    if (c === 6) { const ds = designsOf(p); for (let i = ds.length - 1; i >= 0; i--) if (ds[i].type === 'bio') return setShip(i); c = 0; }
    selected = -1; adjustFor(c); name.value = autoName(c); techAdjusted();
  }
  // -[BuildSingleShipDialog textFieldDidReturn:] 0x1000b795c: a new name takes (15 letters); an empty one puts the old back
  const commit = () => {
    const d = shipRec();
    if (!name.value.trim()) { name.value = d ? d.name : cur.name || autoName(classOf(cur.type)); return; }
    name.value = name.value.slice(0, 15);
    if (d) { d.name = name.value; updateShipTypes(flow); a.save(); }
    cur.name = name.value;
  };
  name.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { name.blur(); } });
  name.addEventListener('change', commit); name.addEventListener('blur', commit);
  // -[BuildSingleShipDialog buildShips] 0x1000b7630
  function buildNow() {
    const n = bs.value;
    if (n < 1) return;
    let d = shipRec();
    if (!d) {
      if (designsOf(p).length >= (HO.rules(G).maxDesigns || 24)) { appMessage(HO.say(G, HO.DATA.alerts[15])); return; } // Alert Strings 16: buildShips 0x1000b7630 shows it (FUN_10008ecb0: +[DialogLayerSprite message:closeButton:cancelButton:] with the check button) and returns, the dialog staying
      const sp = specOf(); sp.name = (name.value || '').trim().slice(0, 15) || autoName(classOf(sp.type));
      d = HO.findOrCreateDesign(G, p, sp);
    }
    for (let i = 0; i < n; i++) if (!HO.buildShips(G, a.ME, sid, d.id, 1)) break;
    close(); a.save(); a.renderPanel(); a.draw(); updateShipTypes(flow);
  }
  pushScrim(L.scrim);
  if (index >= 0) setShip(index); else setClass(cls);
  return true;
}


// -[OrganizeFleetsLayer initDialog] 0x1000bfe20 and the routines it calls (addCurrentShipInfo 0x1000bffd0, addLeftRight 0x1000c0440, addExtraButtons 0x1000c0520, updateData: 0x1000c0f38,
// updateFleetContainerPosition 0x1000c0d0c, moveContainer: 0x1000c0e00), on DialogLayerSprite (480 x 320 on an iPhone; an iPad's 0.8 x 0.7 of the screen, scale 1): the message
// (Arial 18, centred, its top 16 under the top), a column for each fleet of yours at the star but the Satellites (84 wide on an iPhone, 160 on an iPad; a column's rectangle at
// x 2 a80 + n (width + 2 a80), y 95 (iPad 115), height - 137 (iPad - 190), the contents hanging from its top, bottom-up: the fleet's name "Fleet n" (n its number in your fleets) or "Scrapped"
// (Arial 16), "Fuel: n" (Arial 9), one ShipMenuItem for each of its piles); the Scrap / Group / Split / New Fleet buttons (90 x 30, scale 0.85) 16 up from the bottom, the selected pile's
// "Selected Ship:  Delayed Arrival" and "Attitude" buttons 56 up (80 on an iPad), hidden until a pile is selected; the arrows at the top right (more than four columns) slide the row by one
// column's width in 0.2 s. The rules are the page's own (the engine's split and merge), as the earlier notes read them.
function plainButton(text, w, h, size, fn) {
  const b = UIEl('button', 'ios-bbtn ios-bpl', { type: 'button', style: `width:${bpt(w)};height:${bpt(h)};font-size:${bpt(size)}` });
  b.textContent = text; b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
  return b;
}
function openOrganizeIOS(sid) {
  const a = A(), G = a.G, gd = BGD(), pad = SCREEN.pad;
  closeBuildFlow(); closeGraphs();
  let W, H, k = 1;
  if (!pad) ({ cw: W, ch: H, k } = dlgGeom()); else { W = SCREEN.winW * 0.8; H = SCREEN.winH * 0.7; }
  const nodeW = pad ? 160 : 84, pitch = nodeW + gd.a80 * 2, ry = pad ? 115 : 95, rh = H - (pad ? 190 : 137), top = ry + rh;
  const S = { sel: null, first: 0, empties: [], scrapping: false, nextEmpty: 1 };
  const allBio = (f) => { const ds = HO.fleetDesigns(G, f); return ds.length > 0 && ds.every(d => d.type === 'bio'); };
  const fleets = () => a.fleetOrder(G.fleets.filter(f => f.owner === a.ME && f.star === sid && f.to == null && !f.sat && HO.fleetCount(f) > 0));
  const cols = () => [...fleets().map(f => ({ key: 'f' + f.id, f })), ...S.empties.map(e => ({ key: 'e' + e, empty: e }))];
  const selFleet = () => S.sel && G.fleets.find(f => f.id === S.sel.fid && f.ships[S.sel.did] > 0);
  const canTake = (c) => { // OrganizerFleetFleetsContainer startWith:ship:block: 0x1000a5478
    const f = selFleet(); if (!f) return false;
    if (c.empty) return true;
    if (c.f === f) return false;
    return (HO.getDesign(G, f.owner, S.sel.did).type === 'bio') === allBio(c.f);
  };
  const L = dialogLayer(W, H, k, 'Organize fleets', () => closeIt()), dlg = L.dlg; dlg.style.overflow = 'hidden'; // visit 0x1000c0c30: glScissor to the layer's box
  const closeIt = () => { if (S.unwatch) S.unwatch(); L.scrim.remove(); org = null; S.empties = []; a.renderPanel(); a.draw(); a.save(); };
  let org = { scrim: L.scrim };
  const done = (keyToShow) => {
    S.sel = null; S.scrapping = false;
    if (keyToShow) { const i = cols().findIndex(c => c.key === keyToShow); if (i >= 0 && (i < S.first || i >= S.first + 4)) S.first = i; } // (updateData: 0x1000c0f38: a column that is off the screen becomes the first one showing, then kept within the last four)
    a.save(); a.renderPanel(); a.draw(); render();
  };
  const move = (c) => { // move:from:to: 0x1000c27e0: the whole pile; the engine's split and merge give the fleet that takes it the fuel, "bought" and colonists rules
    const f = selFleet(); if (!f || !canTake(c)) return;
    const nf = HO.splitFleet(G, f, { [S.sel.did]: f.ships[S.sel.did] }); if (!nf) return;
    if (c.f) HO.mergeFleets(G, c.f, nf); else S.empties = S.empties.filter(e => e !== c.empty);
    done(c.f ? 'f' + c.f.id : 'f' + nf.id);
  };
  const group = () => { // groupClick 0x1000c1a84
    const fl = fleets(), pick = selFleet();
    for (const bio of [false, true]) {
      const same = fl.filter(f => allBio(f) === bio), tgt = pick && allBio(pick) === bio ? pick : same[0];
      for (const f of same) if (f !== tgt && G.fleets.includes(f) && G.fleets.includes(tgt) && HO.canMerge(G, tgt, f)) HO.mergeFleets(G, tgt, f);
    }
    S.empties = []; done();
  };
  const split = () => { // splitClick 0x1000c1e4c
    const f = selFleet(); if (!f) return;
    const n = f.ships[S.sel.did]; let nf = null;
    if (n > 1) nf = HO.splitFleet(G, f, { [S.sel.did]: n >> 1 });
    else for (const kk of Object.keys(f.ships).filter(x => f.ships[x] > 0).slice(1)) nf = HO.splitFleet(G, f, { [kk]: f.ships[kk] }) || nf;
    done(nf && 'f' + nf.id);
  };
  const newFleet = () => { // newFleetClick 0x1000c232c
    const f = selFleet();
    if (f) { const nf = HO.splitFleet(G, f, { [S.sel.did]: f.ships[S.sel.did] }); done(nf && 'f' + nf.id); return; }
    const e = S.nextEmpty++; S.empties.push(e); done('e' + e);
  };
  const scrapAt = (c) => { // scrapFleet: 0x1000c17e0
    if (!c.f) return;
    const was = !!c.f.scrap301; HO.rules(G).flagScrap(G, c.f, 'command');
    if (!was) a.Sound.play(7003);
    if (!G.fleets.includes(c.f)) a.toast('Purchase undone.');
    done();
  };
  const stanceOf = (f, did) => f.dstance && f.dstance[did] != null ? f.dstance[did] : (f.delayed ? 1 : 0) | (f.stance === 'defensive' ? 2 : f.stance === 'offensive' ? 4 : 0);
  const setStance = (bits) => { const f = selFleet(); if (!f) return; f.dstance = Object.assign({}, f.dstance, { [S.sel.did]: bits }); a.save(); render(); };
  const tapCol = (c) => { if (S.scrapping) { scrapAt(c); return; } if (S.sel && canTake(c)) move(c); };
  const x = UIEl('button', 'ios-gx', { type: 'button', 'aria-label': 'Close' }, pic('button-x')); x.addEventListener('click', (e) => { e.stopPropagation(); closeIt(); });
  const msg = UIEl('div', 'ios-omsg', { style: `width:${bpt(W - gd.a80 * 4)};font-size:${bpt(pad ? 24 : 18)}` });
  const cont = UIEl('div', 'ios-oc'), adj = UIEl('div', 'ios-oadj'), info = UIEl('div', 'ios-oinfo'), btns = UIEl('div', 'ios-obtns', { style: `gap:${bpt(gd.a80 * 2)};transform:translateX(-50%) scale(${pad ? 1 : 0.85})` });
  dlg.append(cont, x, put(msg, W / 2, H - gd.a80 * 4, 0.5, 1), adj, info, btns);
  // RepeatingSpriteMenuItem (0x100011af0 selected: every 0.1 s a total of the time held grows; update: 0x100011bb4: while it is over 0.15 s the item is activated again and 0.15 s taken off; unselected: stops):
  // the arrows repeat while held, and the lift activates once more (CCMenu ccTouchEnded: activates the item)
  { let rep = null;
    const stop = () => { if (rep) { clearInterval(rep.t); rep = null; } };
    adj.addEventListener('pointerdown', (e) => { const b = e.target.closest('.ios-oad'); if (!b) return; e.preventDefault(); stop(); const dir = b.dataset.dir; rep = { dir, total: 0, t: setInterval(() => { rep.total += 0.1; while (rep.total > 0.15) { rep.total -= 0.15; if (adj._fns[dir]) adj._fns[dir](); } }, 100) }; });
    const up = (e) => { if (!rep) return; const dir = rep.dir; stop(); if (e.type === 'pointerup') { const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('.ios-oad'); if (b && b.dataset.dir === dir && adj._fns[dir]) adj._fns[dir](); } };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up); S.unwatch = () => { stop(); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    adj.addEventListener('pointerleave', stop); }
  const render = () => {
    const all = cols();
    if (S.sel && !selFleet()) S.sel = null;
    S.first = Math.max(0, Math.min(S.first, all.length - 4));
    msg.textContent = S.scrapping ? 'Fleets will be scrapped at turn end' : 'Tap the ship you wish to move';
    cont.textContent = ''; cont.style.transform = `translateX(${bpt(-S.first * nodeW)})`;
    const mine = G.fleets.filter(f => f.owner === a.ME);
    all.forEach((c, i) => {
      const target = S.scrapping ? !!c.f : S.sel ? canTake(c) : false;
      const col = UIEl('div', 'ios-ocol' + (target ? ' t' : ''), { style: `left:${bpt(gd.a80 * 2 + i * pitch)};bottom:${bpt(ry)};width:${bpt(nodeW)};height:${bpt(rh)}` });
      const stack = UIEl('div', 'ios-ostack', { style: `gap:${bpt(gd.a80)};width:${bpt(nodeW)}` });
      const nm = UIEl('span', 'ios-bt ios-on'); nm.style.fontSize = bpt(16);
      nm.textContent = c.f ? (c.f.scrap301 && a.marksScrap() ? 'Scrapped' : `Fleet ${Math.max(0, mine.indexOf(c.f))}`) : `Fleet ${mine.length + all.slice(0, i).filter(z => z.empty).length}`; // the sprintf template 37, "Fleet %d", with the fleet's number
      stack.append(nm);
      if (c.f) {
        const fu = UIEl('span', 'ios-bt ios-on'); fu.style.fontSize = bpt(9); fu.textContent = `Fuel: ${HO.plainNum(c.f.fuel)}`; stack.append(fu);
        for (const key of Object.keys(c.f.ships)) {
          const n = c.f.ships[key]; if (!(n > 0)) continue;
          const d = HO.getDesign(G, c.f.owner, +key), on = S.sel && S.sel.fid === c.f.id && S.sel.did === +key;
          const text = fleetPileText(d, n), cv = a.IMG && HOTHEME.shipPic(d, a.IMG), sw = cv ? cv.width : 0, lw = textW(text, gd.f);
          const ss = sw && nodeW <= sw ? nodeW / sw : 1, ls = nodeW <= lw ? nodeW / lw : 1;
          const it = UIEl('button', 'ios-bitem' + (on ? ' act' : ''), { type: 'button', 'aria-pressed': on ? 'true' : 'false', style: `width:${bpt(Math.max(sw * ss, lw * ls))}` });
          if (cv) { cv.classList.add('ios-bship'); cv.style.width = bpt(cv.width * ss); cv.style.height = bpt(cv.height * ss); it.append(cv); }
          const lb = UIEl('span', 'ios-bt ios-bin'); lb.textContent = text; lb.style.fontSize = bpt(gd.f * ls); lb.setAttribute('translate', 'no'); it.append(lb);
          if (on) it.animate([{ opacity: 1 }, { opacity: 80 / 255, offset: 0.5 }, { opacity: 1 }], { duration: 600, iterations: Infinity }); // ShipMenuItem highlight 0x100012354: CCFadeTo 0.3 s to 80 and back
          it.addEventListener('click', (e) => {
            e.stopPropagation();
            if (S.scrapping) { scrapAt(c); return; }
            if (S.sel && S.sel.fid !== c.f.id) { tapCol(c); return; }
            S.sel = on ? null : { fid: c.f.id, did: +key }; render();
          });
          stack.append(it);
        }
      }
      col.append(stack);
      // CCMenuAdvanced ccTouchMoved: 0x10001f7cc: a drag of 30 points or more slides a menu taller than its rectangle (setPosition: 0x10001f3c4 keeps its top at the rectangle's top or higher, its bottom at the rectangle's bottom or lower)
      let slid = 0;
      if (!S.sel) {
        let d2 = null;
        col.addEventListener('pointerdown', (e) => { d2 = { y: e.clientY, len: 0, last: e.clientY, slid: false }; });
        col.addEventListener('pointermove', (e) => { if (!d2) return; const s = dlg.getBoundingClientRect().width / W; d2.len += Math.abs(e.clientY - d2.last) / s; d2.last = e.clientY; if (d2.len >= 30) { d2.slid = true; slid = Math.max(0, Math.min(slid + (d2.y - e.clientY) / s, Math.max(0, stack.getBoundingClientRect().height / s - rh))); d2.y = e.clientY; stack.style.transform = `translateY(${bpt(-slid)})`; } });
        col.addEventListener('pointerup', () => { d2 = null; });
        col.addEventListener('click', (e) => { if (S.scrapping) tapCol(c); });
      } else if (target) {
        // OrganizerFleetFleetsContainer (a swallowing targeted delegate while a pile is chosen): ccTouchBegan: 0x1000a5e08 takes a touch that begins in a column that can take the pile and outlines it red;
        // ccTouchMoved: updateSelectedFleet: 0x1000a5e80 follows the finger (a column under it, or none); ccTouchEnded: calls the block with the one under the finger: move:from:to: 0x1000c27e0 (nothing for none)
        col.addEventListener('pointerdown', (e) => {
          e.preventDefault(); try { col.setPointerCapture(e.pointerId); } catch (er) {} col.classList.add('press');
          const cs = [...cont.querySelectorAll('.ios-ocol.t')], at = (ev) => cs.find(z => { const r = z.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX < r.right && ev.clientY >= r.top && ev.clientY < r.bottom; });
          const mv = (ev) => { const z = at(ev); for (const o of cs) o.classList.toggle('press', o === z); };
          const up = (ev) => { col.removeEventListener('pointermove', mv); col.removeEventListener('pointerup', up); col.removeEventListener('pointercancel', up); const z = at(ev); for (const o of cs) o.classList.remove('press'); if (z && z._c) tapCol(z._c); };
          col.addEventListener('pointermove', mv); col.addEventListener('pointerup', up); col.addEventListener('pointercancel', up);
        });
        col._c = c;
      }
      cont.append(col);
    });
    // MenuAdjusters (0x100011868): adjuster_left and adjuster_right, 4 apart, scale 0.7 (items 0.5 on an iPhone, 1 on an iPad), top right with 2 a80
    adj.textContent = ''; adj.style.display = all.length > 4 ? '' : 'none';
    const mk = (nm, fn, dis) => { const b = UIEl('button', 'ios-oad', { type: 'button', 'aria-label': nm === 'left' ? 'Earlier fleets' : 'Later fleets', style: `width:${bpt(34 * (pad ? 1 : 0.5) * 0.7)};height:${bpt(34 * (pad ? 1 : 0.5) * 0.7)}` }, pic('adjuster_' + nm)); b.dataset.dir = nm; b.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); }); adj._fns = adj._fns || {}; adj._fns[nm] = fn; return b; };
    adj.style.right = bpt(gd.a80 * 2); adj.style.top = bpt(gd.a80 * 2); adj.style.gap = bpt(gd.a80 * 0.7);
    adj.append(mk('left', () => { if (S.first > 0) { S.first--; render(); } }), mk('right', () => { if (S.first < all.length - 4) { S.first++; render(); } }));
    // the selected pile's settings (addCurrentShipInfo 0x1000bffd0, updateCurrentShipInfo 0x1000c090c)
    const f = selFleet(); info.textContent = ''; info.style.display = f ? '' : 'none';
    info.style.bottom = bpt(pad ? 80 : 56); info.style.transform = `translateX(-50%) scale(${pad ? 1 : 0.85})`; info.style.gap = bpt(gd.a80);
    if (f) {
      const bits = stanceOf(f, S.sel.did), att = bits & 4 ? 'Aggressive' : bits & 2 ? 'Defensive' : 'Normal';
      const l1 = UIEl('span', 'ios-bt ios-oil'), l2 = UIEl('span', 'ios-bt ios-oil'); l1.textContent = 'Selected Ship:  Delayed Arrival'; l2.textContent = 'Attitude'; l1.style.fontSize = bpt(gd.f); l2.style.fontSize = bpt(gd.f);
      info.append(l1, plainButton(bits & 1 ? 'Yes' : 'No', 90, 30, gd.f, () => setStance(bits ^ 1)), l2, plainButton(att, 90, 30, gd.f, () => setStance(bits & 4 ? (bits & ~4) | 2 : bits & 2 ? bits & ~2 : bits | 4)));
    }
    btns.textContent = '';
    if (a.marksScrap()) btns.append(plainButton('Scrap', 90, 30, 16, () => { S.scrapping = !S.scrapping; S.sel = null; render(); }));
    btns.append(plainButton('Group', 90, 30, 16, group), plainButton('Split', 90, 30, 16, split), plainButton('New Fleet', 90, 30, 16, newFleet));
    btns.style.bottom = bpt(gd.a80 * 4);
  };
  // UIPinchGestureRecognizer (pinching: 0x1000c2ae0): spread to Split, pinch to Group
  const pins = new Map(); let d0 = 0, d1 = 0;
  L.scrim.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; pins.set(e.pointerId, [e.clientX, e.clientY]); if (pins.size === 2) { const [p, q] = [...pins.values()]; d0 = d1 = Math.hypot(p[0] - q[0], p[1] - q[1]); } });
  L.scrim.addEventListener('pointermove', (e) => { if (!pins.has(e.pointerId)) return; pins.set(e.pointerId, [e.clientX, e.clientY]); if (pins.size === 2) { const [p, q] = [...pins.values()]; d1 = Math.hypot(p[0] - q[0], p[1] - q[1]); } });
  const pinEnd = (e) => { if (!pins.has(e.pointerId)) return; const two = pins.size === 2; pins.delete(e.pointerId); if (!two || !d0) return; const r = d1 / d0; d0 = 0; if (r > 1.1) split(); else if (r < 0.9) group(); };
  L.scrim.addEventListener('pointerup', pinEnd); L.scrim.addEventListener('pointercancel', pinEnd);
  pushScrim(L.scrim);
  render();
  return true;
}
// ---------------------------------------------------------------------------
// The battle screen (BattleStageLayer 0x1000949b4-0x100096238, BattleShipNode 0x10009c18c-0x10009ccfc, and the rule core's CBattleStagePhone / CBattleStage, whose
// routines in the zeroed page 0x10008d000 were read from the Android build, the same program: CBattleStagePhone::DrawGroup 0x251a4c, FinishDrawing 0x251b8c,
// IsSpecialShip 0x251be0, DrawShot 0x251e0c, BattleWait 0x251d4c, ReviewPhoneBattle 0x251978; CBattleStage::DoOneBattle 0x22702c, CalculateGroups 0x228528,
// CreateGroupsForPlayer 0x229300, CreateOneGroup 0x229544, CalcShipPileDimensions 0x229774, GetNumDrawnShips 0x229718, HaveGroupShoot 0x228970).
// A DialogLayerSprite (the Build dialog's: 480 x 320 on an iPhone, an iPad's width x 1.2 and height min(groups + 32 a80, 0.9 of the screen's)), the mini close button (while the
// shots go it skips to the end, afterwards it closes), the heading (Arial 16, 4 a80 under the top), "Round %d" (Arial 16, 2 a80 over the bottom), the explosion sprite (added
// first, so under the groups), and the groups: a plain node centred 64 under the top when its height + a80 is no more than (the layer's height - 20) less 85 (an iPad's 100),
// else a CCLayerPanZoom viewport (a80, 20, width - 2 a80, height - 85) the groups scroll in. Each BattleShipNode is 0.4 of the groups' width wide, the ShipNode on top,
// the label (Arial 16, scaled to the width) a80 under it, the hat and the dead-ship sprite at the ship's middle, the luck icon at the node's outer edge; its top is the record's
// short at +0x30 under the groups' top, the viewer's side (and his allies) anchored (0, 1) at x 2 a80, the others (1, 1) at the width less 2 a80 with the ship mirrored.
// The groups' places: a column keeps one running y: each player (the viewer, then his allies in the list's order; on the other side the first player with a colony, then the
// rest) adds 5 when y is over 0, his colony (if any) is a group 62 x 62 that takes 72 + 20, then each of his ship types from the last, the offensive, defensive, then plain group of
// it, takes the pile's height + 32 (the ShipNode's own height when it is a special picture, else 40 (dreadnought 100, tanker 44, colony ship 56) + 2n - 2 for the n = round(count^0.68)
// (1 to 30) pictures the group would have drawn), and the groups' height is the taller column's.
const BATTLE_PILE = { dread: 100, tanker: 44, colony: 56 };
const battleDrawn = (c) => c < 2 ? 1 : clamp(Math.trunc(Math.pow(c, 0.68) + 0.5), 1, 30);
let battleWin = null;
function closeBattleIOS() { if (battleWin) { battleWin.closed = true; clearTimeout(battleWin.timer); battleWin.scrim.remove(); battleWin = null; } }
function openBattleIOS(b, k) {
  const a = A(), G = a.G, rs = HO.rules(G), ME = a.ME, gd = BGD(), tl = k.tl, Prefs = a.Prefs;
  closeBuildFlow(); closeGraphs(); closeBattleIOS();
  const viewer = b.sides.includes(ME) ? ME : (b.sides.find(o => HO.isAllied(G, ME, o)) ?? b.sides[0]); // DoOneBattle 0x22702c: you, else the first of your allies, else the first
  const alive = b.start.map(() => true), hurt = []; let seq = 0, pop = b.pop0, over = false;
  const state = () => ({ alive, hurt, pop, over, won: false });
  const aliveEnd = b.start.map(() => true); let popEnd = b.pop0;
  b.rounds.forEach((r, i) => { for (const ev of r) if (ev.k && !ev.p) aliveEnd[ev.ti] = false; if (b.popR && b.popR[i] != null) popEnd = b.popR[i]; });
  const surv = (o) => b.start.some((u, i) => u.o === o && aliveEnd[i]) || (b.planetOwner === o && popEnd > 0.0005); // the mask at +0x1c of the record
  const nRounds = b.rounds.filter(r => r.length).length;
  const hideMode = nRounds === 1 && !surv(viewer); // DoOneBattle 0x227154 (no shots) and DrawGroup (the other side is not drawn)
  const friend = (o) => o === viewer || HO.isAllied(G, o, viewer);
  let P = rs.battlePanel(G, b, state(), viewer);
  // the groups, in the rule core's order, each with its running y
  const flat = [], cols = [[], []], totals = [0, 0], key = (g) => g.planet ? 'p' + g.o : 'u' + g.units[0];
  let dreadIn = false;
  const shipOf = (g) => g.planet ? null : HO.getDesign(G, g.o, g.did);
  const picOf = (g) => { const d = shipOf(g); return d && a.IMG ? HOTHEME.shipPic(d, a.IMG) : null; };
  P.cols.forEach((col, ci) => {
    const sideOf = (o) => ci === 0 ? (o === viewer ? -1 : b.sides.indexOf(o)) : (o === b.planetOwner && b.pop0 > 0 ? -1 : b.sides.indexOf(o));
    const ord = col.slice().sort((p, q) => sideOf(p.o) - sideOf(q.o) || (q.planet ? 1 : 0) - (p.planet ? 1 : 0) || (q.did - p.did) || ('odn'.indexOf(P0st(p)) - 'odn'.indexOf(P0st(q))));
    let y = 0, last = null;
    for (const g of ord) {
      if (g.o !== last) { if (y >= 1) y += 5; last = g.o; }
      g.y = y; g.key = key(g); g.side = ci; g.pic = picOf(g);
      const d = shipOf(g);
      if (d && d.type === 'dread') dreadIn = true;
      if (g.planet) y += 92;
      else { const base = d && g.pic && special(d) ? g.pic.height : (BATTLE_PILE[d && d.type] || 40); y += base + 2 * battleDrawn(g.n0) - 2 + 32; }
      cols[ci].push(g); flat.push(g);
    }
    totals[ci] = y;
  });
  function P0st(g) { const u = b.start[g.units[0]]; return u && u.st || 'n'; }
  const total = Math.max(totals[0], totals[1]);
  const tagOf = new Map(); flat.forEach((g, i) => { g.tag = i; for (const u of g.units) tagOf.set(u, i); });
  // the layer
  let cw, ch, kk;
  const dg = dlgGeom(); kk = dg.k;
  if (!SCREEN.pad) { cw = 480; ch = 320; } else { cw = dg.cw * 1.2; ch = Math.min(total + gd.a80 * 32, SCREEN.winH * 0.9); }
  const finishNow = () => { if (S.done) closeBattleIOS(); else { S.skip = true; } };
  const L = dialogLayer(cw, ch, kk, 'Battle', finishNow);
  const S = battleWin = { scrim: L.scrim, closed: false, skip: false, done: false, timer: 0 };
  const dlg = L.dlg;
  const x = UIEl('button', 'ios-gx', { type: 'button', 'aria-label': 'Close' }, pic('button-x'));
  x.addEventListener('click', (e) => { e.stopPropagation(); finishNow(); });
  dlg.append(x);
  const LH = (size) => size * 1.15;
  const desc = bLabel(tl(P.head[0] || ''), 16, cw / 2, ch - 4 * gd.a80, 0.5, 1, '#fff');
  const roundL = bLabel('', 16, cw / 2, 2 * gd.a80, 0.5, 0, '#fff');
  const expl = UIEl('div', 'ios-bexp'); expl.style.cssText = `position:absolute;display:none;width:${bpt(200)};height:${bpt(60)};background:url("${HOTHEME.dir}sprites/HoExplosions.png") 0 0 / ${bpt(400)} ${bpt(300)} no-repeat`;
  dlg.append(desc, roundL, expl);
  // the groups' parent
  const Wg = cw - 2 * gd.a80, pan = total + gd.a80 > (ch - 20) - (SCREEN.pad ? 100 : 85);
  const nodeW = Wg * 0.4;
  const holder = UIEl('div', 'ios-bgroups'), box = UIEl('div', 'ios-bgbox');
  let vh = 0, off = 0, ch2 = total + (pan ? gd.a80 : 0);
  holder.style.cssText = `position:absolute;left:${bpt(gd.a80)};width:${bpt(Wg)}`;
  box.style.cssText = `position:absolute;left:0;top:0;width:${bpt(Wg)};height:${bpt(ch2)}`;
  if (pan) { vh = ch - (SCREEN.pad ? 100 : 85); holder.style.bottom = bpt(20); holder.style.height = bpt(vh); holder.style.overflow = 'hidden'; }
  else { holder.style.top = bpt(64); holder.style.height = bpt(total); }
  holder.append(box); dlg.append(holder);
  const setOff = (v) => { off = clamp(v, Math.min(0, vh - ch2), 0); box.style.top = bpt(off); };
  if (pan) { // CCLayerPanZoom (targeted, no rubber band): a drag or the wheel moves the groups
    let drag = null;
    holder.addEventListener('pointerdown', (e) => { drag = { y: e.clientY, off }; holder.setPointerCapture(e.pointerId); });
    holder.addEventListener('pointermove', (e) => { if (drag) { const s = dlg.getBoundingClientRect().width / cw; setOff(drag.off + (e.clientY - drag.y) / s); } });
    holder.addEventListener('pointerup', () => { drag = null; }); holder.addEventListener('pointercancel', () => { drag = null; });
    holder.addEventListener('wheel', (e) => { e.preventDefault(); const s = dlg.getBoundingClientRect().width / cw; setOff(off - e.deltaY / s); }, { passive: false });
  }
  // BattleShipNode update:player:myPlayer: 0x10009c3f0
  for (const g of flat) {
    const n = UIEl('div', 'ios-bsn'), shipH = g.planet ? 62 : g.pic ? g.pic.height : 40, shipW = g.planet ? 62 : g.pic ? g.pic.width : 120;
    n.style.cssText = `position:absolute;top:${bpt(g.y)};width:${bpt(nodeW)};height:${bpt(gd.a80 + shipH + LH(16))};left:${bpt(g.side === 0 ? 2 * gd.a80 : Wg - 2 * gd.a80 - nodeW)}`;
    const cv = document.createElement('canvas'); cv.width = Math.ceil(shipW); cv.height = Math.ceil(shipH);
    cv.style.cssText = `position:absolute;top:0;left:${bpt((nodeW - shipW) / 2)};width:${bpt(shipW)};height:${bpt(shipH)}${g.side ? ';transform:scaleX(-1)' : ''}`;
    const lab = UIEl('span', 'ios-bt'); lab.style.cssText = `position:absolute;white-space:nowrap;top:${bpt(shipH + gd.a80)};left:50%;transform-origin:50% 0;font-size:${bpt(16)}`;
    const q = G.players[g.o] || {}, hn = g.o === viewer ? `player_0_${q.female ? 'f' : 'm'}` : `enemy_${q.face || 0}_${q.female ? 'f' : 'm'}`; // HatNode updateMyPlayer:star: (star -1: row 0) / update:game:halo: (no halo)
    const hat = pic(hn); hat.style.cssText = `position:absolute;width:${bpt(50)};height:${bpt(50)};left:${bpt(nodeW / 2 - 25)};top:${bpt(shipH / 2 - 25)}`;
    const dead = pic('deadship'); dead.style.cssText = `position:absolute;width:${bpt(50)};height:${bpt(50)};left:${bpt(nodeW / 2 - 25)};top:${bpt(shipH / 2 - 25)};display:none`;
    n.append(cv, lab, hat, dead);
    const lk = b.luck ? (b.luck[g.o] | 0) : 0;
    if (lk) { const ic = pic('report_icon-' + (lk > 0 ? 17 : 18)); ic.style.cssText = `position:absolute;width:${bpt(40)};height:${bpt(39)};top:${bpt(shipH / 2 - 19.5)};${g.side === 0 ? 'left:0' : 'right:0'}`; n.append(ic); }
    g.el = { n, cv, lab, dead }; box.append(n);
  }
  const paint = (g, r) => { // the ShipNode: the parts, and over them the damage bar when the group's front ship is hurt
    const c = g.el.cv, cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height);
    if (g.planet) { const im = a.IMG[HOTHEME.battlePlanet]; if (im) cx.drawImage(im, 0, 0, c.width, c.height); }
    else if (g.pic) { cx.drawImage(g.pic, 0, 0); if (r.dmg > 0) HOTHEME.battleDamage(cx, r.dmg, { x: c.width / 2, y: c.height / 2 }, c.width, c.height, false); }
    else { cx.fillStyle = '#888'; cx.fillRect(0, c.height / 2 - 8, c.width, 16); }
    const text = tl(r.text), lw = textW(text, 16), sc = lw > nodeW ? nodeW / lw : 1;
    g.el.lab.textContent = text; g.el.lab.style.transform = `translateX(-50%) scale(${sc})`;
    g.el.dead.style.display = r.n === 0 ? '' : 'none';
    g.el.n.style.display = hideMode && !friend(g.o) ? 'none' : '';
  };
  const refresh = () => { P = rs.battlePanel(G, b, state(), viewer); const by = new Map(); for (const col of P.cols) for (const r of col) by.set(key(r), r); for (const g of flat) { const r = by.get(g.key); if (r) paint(g, r); } };
  // shots
  const lz = document.createElement('canvas'); lz.width = cw * 2; lz.height = ch * 2; lz.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  dlg.append(lz);
  const centre = (tag) => {
    const g = flat[tag]; if (!g) return { x: cw / 2, y: ch / 2 };
    const r = g.el.cv.getBoundingClientRect(), d = dlg.getBoundingClientRect(), s = d.width / cw;
    return { x: (r.left + r.width / 2 - d.left) / s, y: (r.top + r.height / 2 - d.top) / s };
  };
  const wEff = (ev) => { // the record's +0xc: the ship's weapons level + the side's luck (+1 offensive, -2 defensive), 1 at least; the colour is its hue (fireShot: (w - 1) x 4000 of 65535)
    const u = ev.si >= 0 ? b.start[ev.si] : null, d = u ? HO.getDesign(G, u.o, u.did) : null;
    // a colony's shot (CreateGroupsForPlayer 0x229300): the record's +0x14, the owner's Weapons level (DoBattleStage 0x226b2c copies it from the player), and the side's luck, 1 at least: the ruleset keeps it (rec.pw)
    const w = !u && b.pw != null ? b.pw : Math.max(1, ((d && d.W) || 1) + (b.luck ? (b.luck[u ? u.o : b.planetOwner] | 0) : 0) + (u && u.st === 'o' ? 1 : u && u.st === 'd' ? -2 : 0));
    return hsb((((w - 1) * 4000) % 65535) / 65535, 1, 1);
  };
  let beam = null;
  const laser = (p0, p1, dur, col) => { // +[CCMotionStreak streakWithFade: 0.4 minSeg: 1 width: 6 length: 5 color:] moved to the target in speed / 60 s
    const cx = lz.getContext('2d'), t0 = performance.now(), trail = [], my = beam = {};
    const tick = () => {
      if (S.closed || beam !== my) return;
      const t = (performance.now() - t0) / 1000, f = dur > 0 ? Math.min(1, t / dur) : 1;
      trail.push({ x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f, t });
      cx.clearRect(0, 0, lz.width, lz.height);
      for (let i = 1; i < trail.length; i++) {
        const age = (t - trail[i].t) / 0.4; if (age >= 1) continue;
        cx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${1 - age})`; cx.lineWidth = 12 * (1 - age) + 1;
        cx.beginPath(); cx.moveTo(trail[i - 1].x * 2, trail[i - 1].y * 2); cx.lineTo(trail[i].x * 2, trail[i].y * 2); cx.stroke();
      }
      if (t < dur + 0.5) requestAnimationFrame(tick); else cx.clearRect(0, 0, lz.width, lz.height);
    };
    tick();
  };
  const speedTicks = () => Math.max(0, 30 - (Prefs.reviewSpeed != null ? Prefs.reviewSpeed : rs.prefsWindow ? rs.prefsWindow.def : 10)); // Preferences +0x220 (default 20); the slider is (30 - it) / 30
  const explode = (tag, sp) => { // explosion: 0x100095e80: ten 200 x 60 frames, speed / 300 s each, then hidden
    const c = centre(tag); expl.style.left = bpt(c.x); expl.style.bottom = bpt(ch - c.y); expl.style.transform = 'translate(-50%, 50%)'; expl.style.display = '';
    let i = 0; const step = () => { if (S.closed) return; if (i >= 10) { expl.style.display = 'none'; return; } expl.style.backgroundPosition = `${bpt(i >= 5 ? -200 : 0)} ${bpt(-(i % 5) * 60)}`; i++; setTimeout(step, Math.max(0, sp / 300 * 1000)); };
    step();
  };
  const play = (ev, kill) => { if (kill) a.Sound.play(k.shotSnd(ev, 3003)); else if (ev.p) a.Sound.play(k.shotSnd(ev, 3002)); else a.Sound.play(k.shotSnd(ev, 3000)); };
  let r = 0, e = 0;
  const apply = (ev) => {
    if (ev.p) return;
    const f = ev.f != null ? ev.f : ev.hf; if (f != null) hurt[ev.ti] = { n: ++seq, f };
    if (ev.k) alive[ev.ti] = false;
  };
  const afterReview = () => { // 0x100095770 (the strings are Misc Strings 53-58: you / your best buddy won, lost, or has no information)
    over = true; S.done = true; refresh();
    const me = viewer === ME, won = surv(viewer), oneRound = dreadIn || nRounds === 1; // the record's +0x1a: one round, or a dreadnought group made by CreateOneGroup
    const text = won ? (me ? 'Congratulations! You won the battle.' : 'Cool! Your best buddy won this battle.') : oneRound ? (me ? 'You have no information about the battle; your fleet was destroyed too quickly.' : 'Your buddy was destroyed too fast and has no information about this battle.') : (me ? 'Unfortunately, you lost the battle.' : 'Darn. Your best buddy lost this battle.');
    const t = tl(text), avail = cw - 2 * gd.a80, tw = textW(t, 16), size = tw > avail ? 16 * avail / tw : 16, top = ch - 4 * gd.a80 - LH(16) - gd.a80;
    dlg.append(bLabel(t, size, cw / 2, top, 0.5, 1, '#fff'));
    const ic = pic('report_icon-' + (won ? 36 : 37)); ic.style.cssText = `position:absolute;width:${bpt(40)};height:${bpt(39)};left:${bpt(cw / 2 - 20)};top:${bpt(ch - top + gd.a80 + LH(size) - 0)}`;
    ic.style.top = bpt(ch - top + LH(size) + gd.a80); dlg.append(ic);
  };
  const next = () => {
    if (S.closed) return;
    if (r >= b.rounds.length) { afterReview(); return; }
    const rd = b.rounds[r];
    if (e === 0 && rd.length) roundL.textContent = tl('Round %s', r + 1);
    if (e >= rd.length) { if (b.popR && b.popR[r] != null) pop = b.popR[r]; r++; e = 0; refresh(); next(); return; }
    const ev = rd[e++];
    if (S.skip || hideMode) { apply(ev); next(); return; }
    const sp = speedTicks(), from = centre(ev.si < 0 ? flat.findIndex(g => g.planet && g.o === b.planetOwner) : tagOf.get(ev.si)), toTag = ev.p ? flat.findIndex(g => g.planet && g.o === b.planetOwner) : tagOf.get(ev.ti), to = centre(toTag);
    laser(from, to, sp / 60, wEff(ev));
    S.timer = setTimeout(() => { // DrawShot sleeps speed / 300 x 12 s; then the target is redrawn, a kill explodes (sound 5, Ship Dead)
      if (S.closed) return;
      apply(ev); play(ev, ev.k); refresh();
      if (ev.k) explode(toTag, sp);
      S.timer = setTimeout(next, 0);
    }, sp * 40);
  };
  pushScrim(L.scrim);
  refresh();
  S.timer = setTimeout(next, 300);
  return true;
}
// FUN_100035be4: "1 Sco (4/2)", "5 Fig (3/3)s" (see fleetItem)
function fleetPileText(d, n) { const cls = FLEET_CLASS[Math.max(0, ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite', 'bio', 'decoy'].indexOf(d.type))].slice(0, 3); return n === 1 ? `1 ${cls} (${d.W}/${d.S})` : `${n} ${cls} (${d.W}/${d.S})s`; }

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
  starLook(look, c) { const l2 = colonyHat(look, c), r = dusted(HOTHEME.starLook0(l2, c), l2, c); if (l2.hatTint && r) r.hatTint = l2.hatTint; return r; },
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
  // -[ShipNode setDamage:] 0x1000179f4 and init 0x1000186a8: the sprite tech_bar_white tinted red (255, 0, 0) at opacity 60 of 255, anchored (1, 0.5) at (width, height / 2), its x scaled to the damage
  // fraction of the node's width and its y to the node's height, drawn over the ship's parts (draw 0x100017980: only when the damage is over 0); BattleShipNode's dead-ship sprite (deadship, 100 x 100 px) over the ship's middle
  battleDamage(cx, dmg, at, w, h, mirror) {
    const im = A().IMG[P + 'tech_bar_white']; if (!im || !im.width) return;
    const bw = w * Math.min(1, dmg), t = document.createElement('canvas'); t.width = Math.max(1, Math.ceil(bw)); t.height = Math.max(1, Math.ceil(h));
    const tx = t.getContext('2d'); tx.drawImage(im, 0, 0, t.width, t.height); tx.globalCompositeOperation = 'multiply'; tx.fillStyle = '#f00'; tx.fillRect(0, 0, t.width, t.height);
    tx.globalCompositeOperation = 'destination-in'; tx.drawImage(im, 0, 0, t.width, t.height);
    cx.save(); cx.globalAlpha = 60 / 255; cx.drawImage(t, mirror ? at.x - w / 2 : at.x + w / 2 - bw, at.y - h / 2, bw, h); cx.restore();
  },
  battleDead(cx, at) { const im = A().IMG[P + 'deadship']; if (im && im.width) cx.drawImage(im, at.x - im.width / 4, at.y - im.height / 4, im.width / 2, im.height / 2); },
  shipPic(d, IMG) { return shipPic(d, IMG, false); }, // (the app's ShipNode has no rust: ship-rust is in the sheet but no code names it)
  battleWindow(b, k) { return openBattleIOS(b, k); }, // the Battle screen (BattleStageLayer; openBattleIOS)
  // the app's own windows in this skin: Build (BuildShipsDialog, ShipClassMenu, ShipMenuItem, BuildSingleShipDialog); a ruleset whose ships are queued (DOS 2.0) keeps the remake's window
  window(name, ...x) {
    const a = A(); if (!a || !a.G) return false;
    if (name === 'build') { const s = a.G.stars[x[0]]; if (!s || s.owner !== a.ME || HO.feature(a.G, 'buildQueue')) return false; return openBuildFlow(x[0]); }
    const appRules = /^(ios|android)$/.test(a.G.rules || '');
    if (appRules && name === 'dip') { openDipIOS(); return true; }
    if (appRules && name === 'auto') { openAutoPlayIOS(); return true; }
    if (appRules && name === 'armageddon') { openArmageddonIOS(); return true; }
    if (appRules && name === 'types') { openScrapIOS(); return true; }
    if (appRules && name === 'help') { openHelpIOS(x[0]); return true; }
    if (appRules && name === 'prefs') { openPrefsIOS(x[0]); return true; }
    if (name === 'organize') { if (x[0] == null || HO.rules(a.G).organizeFleets !== 'ios') return false; return openOrganizeIOS(x[0]); }
    return false;
  },
  // the report-tap sounds (-[MessageNode doReportAction:game:] 0x1000137cc calls FUN_100038438 with the report's number, its first short): the Sounds item (the app's list, "%@.wav") by report number;
  // reports 1036-1038 and 1151 (0x40c-0x40e, 0x47f) are silent; the explored reports (0x409, 0x40a) by the star's quality (0 bad, under 15 mediocre, else good); 0x432 (a player eliminated) by whether he
  // was your best buddy. A number the table doesn't name plays item 16 "Next Message"
  reportTap(m, id, ctx) {
    const a = A(); if (!a || !a.G || !/^(ios|android)$/.test(a.G.rules || '') || id == null) return;
    const item = tapItem(id, m, a);
    if (item != null) a.Sound.play(TAP_FILE[item]);
  },
  // the app's message box for a question (+[DialogLayerSprite message:closeButton:cancelButton:] with setOkBlock:): the Evacuate question, with the check and the cross
  alert(kind, text, yes) {
    const a = A(); if (kind !== 'evacuate' || !a || !a.G || !/^(ios|android)$/.test(a.G.rules || '')) return false;
    appMessage(text, yes); return true;
  },
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
