// Spaceward Ho! web remake — the Mac 5.0.5 skin's map window (docs/status-505.md)
//
// 5.0.5's one document window as Jake's captures show it (private repo audit/mac-5.0.5/crops, shots 008-034: Mac OS 9.0.4 at
// 1024 x 768): the Mac OS 9 menu bar (Apple, File, Edit, Ships, Galaxy, Window, Help: MBAR 128 and the menus as the program
// rewrites them), the window zoomed to the screen with a 2-pixel margin, its title "Peter in Milky Way in 2000", and inside it
// PPob 136 "Map Window" (docs/505-windows.md): the information column, 197 wide, at the left (LHoIncomeView 'Hinc', the technology
// bars LHoBarControl 'TBAR', the budget bars 'PBAR' with their scroll bar, a resizer, the players list LHoPlayerListView, the graph
// LHoGraphView) and the map LHoMapView in a scrolling view filling the rest. Loaded by js/skins/mac5/ui.js before the page; it adds
// its hooks to window.HOTHEME.
//
// The window is resizable in 5.0.5 and its panes are bound to its edges (PPob 136's "bound" flags), so here it fills the browser
// window. S is the size of a Mac pixel in CSS pixels: 1 up to a 1024 x 768 screen's worth, then in half steps (a big screen), as the
// other Mac skins make the Mac's screen big (js/skins/mac12/ui.js setMacScale); under 760 x 540 (a phone) the page keeps its own layout.
(function () {
'use strict';
const T = window.HOTHEME;
const de = document.documentElement;
de.classList.add('m5fam');
const TL = (s) => { const a = window.HOAPI; try { return a && a.tl ? a.tl(s) : s; } catch (e) { return s; } };
const A = () => window.HOAPI, H = () => window.HO;
// a length in Mac pixels (the stylesheet's --u: --m5 CSS pixels each)
const U = (n) => `calc(${n} * var(--u))`;
// ---------- the screen made big ----------
const M5 = { s: 1 };
function m5Scale() {
  const w = window.innerWidth, h = window.innerHeight;
  if (w < 760 || h < 540) return 0;
  const u = Math.min(w / 1024, h / 768);
  return u >= 1.5 ? Math.floor(u * 2) / 2 : 1;
}
function setM5Scale() {
  const s0 = M5.s; M5.s = m5Scale();
  de.style.setProperty('--m5', String(M5.s || 1));
  de.classList.toggle('m5win', M5.s >= 1);
  const a = A();
  if (s0 !== M5.s && a && a.G) { a.UI.fitted = false; a.resize(); a.renderPanel(); }
}
setM5Scale(); window.addEventListener('resize', setM5Scale);
T.m5 = M5;
const M5ON = () => de.classList.contains('m5win') && !!(A() && A().G);

// ---------- the window's title bar ----------
// (the page writes "Jake in Milky Way in 2000" into #title; the skin moves it into the window's title bar, shot 008)
function caption() {
  if (document.getElementById('m5cap')) return;
  const cap = document.createElement('div'); cap.id = 'm5cap'; cap.setAttribute('aria-hidden', 'false');
  cap.innerHTML = '<i class="m5close"></i><i class="m5boxes"></i>';
  const t = document.getElementById('title'); if (t) cap.insertBefore(t, cap.lastChild);
  const app = document.getElementById('app'); if (app) app.insertBefore(cap, document.getElementById('main'));
}
// (T.page: the page has just been written; js/skins/classic/ui.js)
T.page = () => caption();

// ---------- the menus ----------
// MBAR 128: Apple, File, Edit, Ships, Galaxy, Window (MENU 128-136, docs/505-windows.md), and Help (Mac OS 9's own, with the
// program's "Spaceward Ho! Help"), with the words, keys and dimming of shots 008, 011, 014, 023, 024, 031, 033. The program
// rewrites some items as it runs: "Don't Evacuate Planet" for a colony marked (023), Window's "Hide Information" and "Hide Planet
// Info Box" (031). Network play's items (Connect To Server..., Lobby Window, Pre-Start Window) are dimmed, as in a local game.
// The remake's own commands, which 5.0.5 has no menu for, go into the Apple menu after the program's two items (the place a Mac
// keeps a program's own), so nothing is dropped.
const lab = (w) => () => TL(w);
const noGame = () => !(A() && A().G), over = () => !!(A() && A().G && A().G.over), dim = () => true;
const clickEndTurn = () => { const b = document.querySelector('#msg .clock') || document.querySelector('#m5clk .clock'); if (b) b.click(); };
const sel = () => { const a = A(); return a && a.G && a.UI.sel != null ? a.G.stars[a.UI.sel] : null; };
const mineSel = () => { const s = sel(); return !!(s && s.owner === A().ME && s.pop > 0); };
const battleHere = () => { const a = A(); return !!(a && a.G && a.UI.sel != null && a.lastBattles(a.UI.sel).length); };
const fleetSel = () => { const a = A(); const f = a && a.G && a.curFleet && a.curFleet(); return f && f.owner === a.ME ? f : null; };
// Hide Information (Mcmd 5029): the column goes and the map takes the window; Hide Planet Info Box (5038, ⌘I): the box beside the
// selected star (shot 031's words while each is shown)
const infoOff = () => de.classList.contains('m5noinfo');
const setInfo = (on) => { de.classList.toggle('m5noinfo', !on); const a = A(); if (a && a.G) { a.resize(); a.draw(); } };
const boxOff = () => de.classList.contains('m5nobox');
const setBox = (on) => { de.classList.toggle('m5nobox', !on); const a = A(); if (a && a.G) a.draw(); };
T.menuLayout = {
  // (the Apple menu: MENU 128; the page's Ho! button stands in its place, its own items after these two)
  File: [[lab('New Local Game…'), 'Game/New game…', null, null, null], [lab('Open Local Game…'), 'Game/Saved games…'], [lab('Connect To Server...'), () => {}, null, null, dim], '-',
    [lab('End Turn'), clickEndTurn, null, null, () => noGame() || over(), 'T'], '-',
    [lab('Close'), () => A().quitToTitle(), null, null, noGame, 'W'], '-',
    [lab('Save'), 'Game/Export this game…'], [lab('Save As…'), 'Game/Export this game…'], '-',
    [lab('Quit'), 'Game/Quit to title']],
  Edit: [[lab('Undo'), () => {}, null, null, dim, 'Z'], '-', [lab('Cut'), () => {}, null, null, dim, 'X'], [lab('Copy'), () => {}, null, null, dim, 'C'], [lab('Paste'), () => {}, null, null, dim, 'V'],
    [lab('Clear'), () => {}, null, null, dim], [lab('Select All'), () => {}, null, null, dim, 'A'], '-',
    [lab('Preferences…'), 'Game/Preferences…'], [lab('Rank History…'), 'Game/Rank history…']],
  Ships: [[lab('Build Ships…'), 'Ships/Build ships at selected colony…'], '-',
    [lab('List All Fleets…'), 'Ships/List all fleets…'], [lab('Group Fleets…'), 'Ships/#4'], [lab('Dismantle Fleet'), 'Ships/#3'],
    [lab('Cancel Fleet Trip'), () => cancelTrip(), null, null, () => !tripOf()], '-',
    [lab('Scrap Ship Types…'), 'Ships/Scrap ship types…'], '-',
    [lab('Review Battle…'), 'Ships/Review battle…']],
  Galaxy: [[lab('List All Explored Stars…'), 'Galaxy/List explored stars…'],
    [() => TL(sel() && sel().abandon301 ? "Don't Evacuate Planet" : 'Evacuate Planet'), () => A().evacuateHere && A().evacuateHere(), null, null, () => noGame() || over() || !mineSel(), 'E'], '-',
    [lab('Dip Into Savings…'), 'Galaxy/Dip into savings…'], '-',
    [lab('Give Money/Metal To…'), 'Galaxy/Give money or metal…'], [lab('Send Message To…'), 'Galaxy/Send a message…'], [lab('Surrender To…'), 'Galaxy/#9'], '-',
    [lab('Auto Play…'), 'Game/Auto play…'], [lab('Play One Turn For Me'), 'Game/Auto-play this turn'], '-',
    [lab('Armageddon…'), 'Galaxy/#10']],
  Window: [[lab('Message History'), () => (A().openReports ? A().openReports() : null), null, null, noGame, '1'], [lab('Graph History'), 'Game/Players and history'], '-',
    [() => TL(infoOff() ? 'Show Information' : 'Hide Information'), () => setInfo(infoOff()), null, null, noGame],
    [() => TL(boxOff() ? 'Show Planet Info Box' : 'Hide Planet Info Box'), () => setBox(boxOff()), null, null, noGame, 'I'],
    [lab('Zoom In'), 'View/Zoom in'], [lab('Zoom Out'), 'View/Zoom out'], '-',
    [lab('Lobby Window'), () => {}, null, null, dim, 'Y'], [lab('Pre-Start Window'), () => {}, null, null, dim], [lab('Map Window'), () => {}, null, null, dim], '-',
    [lab('Clean Up Windows'), () => { const a = A(); if (a && a.G) { a.UI.fitted = false; a.resize(); a.draw(); } }, null, null, noGame]],
  Help: [[lab('About Balloon Help…'), () => {}, null, null, dim], [lab('Show Balloons'), () => {}, null, null, dim], '-', [lab('Spaceward Ho! Help'), 'Help/How to play']],
};
// the keys MENU 129-136 give the items the page already has (the layout's own items carry theirs above)
const KEYS = { 'New game…': 'N', 'Saved games…': 'O', 'Export this game…': 'S', 'Quit to title': 'Q', 'Build ships at selected colony…': 'B',
  'Review battle…': 'R', 'List explored stars…': 'L', 'Auto-play this turn': 'U', 'Zoom in': '=', 'Zoom out': '-', 'Players and history': '2' };
const DIMS = { 'Review battle…': () => !battleHere() };
T.menus = (menus) => {
  for (const m in menus) for (const it of menus[m]) {
    if (typeof it[0] !== 'string') continue;
    if (KEYS[it[0]]) it[5] = KEYS[it[0]];
    if (DIMS[it[0]]) it[4] = DIMS[it[0]];
  }
  // Group Fleets ⌘G and Dismantle Fleet ⌘D (MENU 133), by place: their words change with the fleet
  if (menus.Ships && menus.Ships[4]) { menus.Ships[4] = menus.Ships[4].slice(); menus.Ships[4][2] = null; menus.Ships[4][5] = 'G'; }
  if (menus.Ships && menus.Ships[3]) { menus.Ships[3] = menus.Ships[3].slice(); menus.Ships[3][4] = () => !fleetSel(); menus.Ships[3][5] = 'D'; }
};
T.keyName = (k) => '⌘' + k;
T.ownOrganize = false;
T.leftoversIntoHo = () => true;
T.menuName = (name) => TL(name);
// Cancel Fleet Trip (Mcmd 5036): the selected fleet of yours, under way to another star, stays where it is
function tripOf() { const f = fleetSel(); return f && f.dest != null && f.dest !== f.star ? f : null; }
function cancelTrip() { const f = tripOf(); if (!f) return; f.dest = null; if (f.route) f.route = null; const a = A(); a.save(); a.renderPanel(); a.draw(); }

// ---------- the information column ----------
// LHoIncomeView (FUN_10098654): Geneva 9; the backdrop copied from PICT 10000 (520, 337)-(717, 377) (assets/skins/mac5/incbg.png);
// three rows with their baselines at 12, 23 and 34: the label right-aligned at 52 (STR# 0x18 "Metal:", 0x19 "Savings:", 0x1a
// "Income:") and the figure 5 after it, both bold in the view's grey; savings in red (ForeColor 205) below 0; at the right,
// right-aligned 4 from the edge in plain type, the metal's change "(+ %s)" / "(- %s)", the interest "(Int: %s)" and the income's
// change, each from the player's record (+0x60, +0x4c, +0x44).
function incomeView(B) {
  const a = A(), p = a.me(), box = document.createElement('section'); box.className = 'm5inc';
  // the figures in 5.0.5's words, as the page's own box writes them (B.info: rs.interestShort, HO.totalChange): the figure, then
  // its change "(+ 1,043)" or the interest "(Int: $5,503)"
  const part = (key) => {
    const b = B && B.info && B.info.querySelector(`.kv[data-help="${key}"] b`); if (!b) return ['', ''];
    const c = b.querySelector('.chg'), all = b.textContent.trim(), chg = c ? c.textContent.trim() : '';
    let main = (c ? all.slice(0, all.length - chg.length) : all).trim(), extra = chg;
    const m = main.match(/^(.*?)\s*(\(.*\))$/); if (m) { main = m[1]; extra = m[2]; }
    return [main, extra];
  };
  const [mv, mc] = part('metal'), [sv, si] = part('savings'), [iv, ic] = part('income');
  const sav = p.savings || 0;
  const row = (y, label, value, right, red) => {
    const l = document.createElement('span'); l.className = 'lb'; l.style.top = U(y - 9); l.textContent = TL(label);
    const v = document.createElement('span'); v.className = 'vl' + (red ? ' neg' : ''); v.style.top = U(y - 9); v.textContent = value;
    const r = document.createElement('span'); r.className = 'rt'; r.style.top = U(y - 9); r.textContent = right;
    box.append(l, v, r);
  };
  row(12, 'Metal:', mv, mc);
  row(23, 'Savings:', sv, si, sav < 0);
  row(34, 'Income:', iv, ic);
  return box;
}
// LHoBarControl (FUN_1008aff4), PPob 136's two: 'TBAR' (type 1: on the backdrop PICT 10000 (520, 377)-(717, 464), bars at most 133
// long, left space 64) and 'PBAR' (type 2: on white, at most 115, left space 63, its own scroll bar). Rows from y 5, each bar 7 high
// with 7 between; the label right-aligned 2 before the bars, its baseline 7 down; a black line down the bars' left edge; at each
// tenth of the scale a 3-pixel black tick at the top and a light line (pen mode addOver) down to the last row. A bar is painted in
// its colour blended (OpColor 50000) with what is under it, two lines of its light shade above it, two of its dark below and at its
// right. In 'PBAR' a black line separates Savings and Tech from the colonies, and a colony being evacuated shows "Evacuating" in
// place of its bar (the text at left + 3). The colours: sampled from shot 034 (the HSV the code builds are blended by the emulator's
// screen; to read again from FUN_10089750 for the colonies' exact mix).
const TECH_NAMES = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini', 'Radical'];
function techBars(B) {
  const box = document.createElement('section'); box.className = 'm5tech m5bars';
  const tb = B && B.tech; if (!tb) return box;
  const p = A().me(), lv = p.tech || {};
  const levels = [lv.range, lv.speed, lv.weapons, lv.shields, lv.mini];
  [...tb.querySelectorAll('.barrow')].forEach((r, i) => {
    r.classList.add('m5row'); r.style.top = U(5 + 14 * i);
    const l = r.querySelector('.blabel'); if (l) { const n = TECH_NAMES[i] || l.textContent; l.textContent = TL(n) + (i < 5 && levels[i] != null ? ' (' + Math.floor(levels[i]) + ')' : ''); }
    box.append(r);
  });
  box.append(ticks(133, 64, 5 + 14 * 6 - 7));
  return box;
}
// the ten ticks: at the scale's tenths (FUN_100896a0 through the control's table at +0xf4: the page's own scale, rs.barScale)
function ticks(width, left, bottom) {
  const tk = document.createElement('div'); tk.className = 'm5ticks'; tk.setAttribute('aria-hidden', 'true'); tk.style.left = U(left); tk.style.width = U(width); tk.style.height = U(bottom);
  let fr = []; try { const g = document.querySelector('#panel .track .grid') ? [...document.querySelectorAll('#panel .barrow .track')][0] : null; if (g) fr = [...g.querySelectorAll('.grid')].map(i => parseFloat(i.style.left) / 100); } catch (e) {}
  if (!fr.length) fr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => i / 10);
  fr.forEach(x => { const t = document.createElement('i'); t.style.left = U(Math.round(x * width)); tk.append(t); });
  return tk;
}
function budgetBars(B) {
  const a = A(), g = a.G, p = a.me();
  const box = document.createElement('section'); box.className = 'm5budget m5bars';
  const bb = B && B.budget; if (!bb) return box;
  const rows = [...bb.querySelectorAll('.barrow')], ents = B.ents || [];
  const top = [], cols = [];
  rows.forEach((r, i) => {
    const e = ents[i]; if (!e) return;
    r.classList.add('m5row');
    if (e.key === 'savings') { r.classList.add('sav'); top.unshift(r); return; }
    if (e.key === 'tech') { r.classList.add('tech'); top.push(r); return; }
    const st = g.stars[e.star]; if (!st) return;
    const inc = Math.round(H().planetIncome(g, p, st));
    if (inc < 0) r.classList.add('losing');
    const tf = Math.abs(H().seenT(p, st) - 72) <= 0.5, mf = !(st.metal > 0);
    const t = tf ? 0 : mf ? 1 : (st.terra == null ? 0.5 : st.terra);
    // green (Kamino, terraforming, shot 034) to blue (Rho, all mining, shot 034)
    const mix = (c1, c2) => c1.map((v, k) => Math.round(v * t + c2[k] * (1 - t)));
    const css = (c) => `rgb(${c.join(',')})`;
    r.style.setProperty('--bf', css(mix([116, 197, 93], [60, 60, 214])));
    r.style.setProperty('--bl', css(mix([179, 239, 212], [131, 131, 215])));
    r.style.setProperty('--bd', css(mix([70, 130, 55], [30, 30, 140])));
    if (st.abandon301 || st.abandon) { r.classList.add('evac'); const tr = r.querySelector('.track'); if (tr) tr.dataset.evac = TL('Evacuating'); }
    cols.push(r);
  });
  const inner = document.createElement('div'); inner.className = 'm5binner';
  top.forEach((r, i) => { r.style.top = U(5 + 14 * i); inner.append(r); });
  const line = document.createElement('i'); line.className = 'm5sep'; line.style.top = U(5 + 14 * 2); inner.append(line);
  cols.forEach((r, i) => { r.style.top = U(5 + 14 * 2 + 7 + 14 * i); inner.append(r); });
  const h = 5 + 14 * 2 + 7 + 14 * cols.length;
  inner.style.height = U(Math.max(85, h));
  inner.append(ticks(115, 63, h - 7));
  box.append(inner);
  return box;
}
// LHoPlayerListView (PPob 136 'plvw', 180 wide, in a scrolling view 197 x 131 bound to the window's foot): one row of 24 a player,
// the face (the hat as the map draws it), the name, and the relation pop-up (Myself, or Enemy / Ally / Best Buddy) at the right;
// a tick before a player whose turn is in (the computers' always, in a local game: shot 008). The pop-up sets the pact as the
// Alliances window does (HO.setPact).
function playersList() {
  const a = A(), g = a.G, me = a.me();
  const box = document.createElement('section'); box.className = 'm5players';
  const list = document.createElement('div'); list.className = 'm5plist';
  const rs = H().rules(g), pacts = !!(rs.alliances !== false && g.opts && g.opts.alliances !== false), buddies = !!(H().isBuddy);
  for (const p of g.players) {
    if (!p.alive && !p.surrendered) continue;
    const row = document.createElement('div'); row.className = 'm5prow';
    const done = !p.human || p.id !== a.ME && p.turnDone;
    const ck = document.createElement('span'); ck.className = 'ck'; ck.textContent = done ? '√' : '';
    const face = p.human ? 'white0_' + (p.female ? 1 : 0) : 'bad' + p.face + '_' + (p.female ? 1 : 0);
    const im = document.createElement('img'); im.alt = ''; im.className = 'face'; im.src = (a.A && a.A.img && a.A.img[face]) || 'assets/sprites/' + face + '.png';
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = p.name;
    const pop = document.createElement('select'); pop.className = 'm5pop'; pop.setAttribute('aria-label', TL('Relation with') + ' ' + p.name);
    if (p.id === a.ME) { pop.append(new Option(TL('Myself'), 'me')); pop.disabled = true; }
    else {
      pop.append(new Option(TL('Enemy'), 'enemy'));
      if (pacts) pop.append(new Option(TL('Ally'), 'ally'));
      if (pacts && buddies) pop.append(new Option(TL('Best Buddy'), 'buddy'));
      pop.value = H().isBuddy && H().isBuddy(g, a.ME, p.id) ? 'buddy' : (me.allies || []).includes(p.id) ? 'ally' : 'enemy';
      if (!pacts || over()) pop.disabled = true;
      pop.addEventListener('change', () => {
        const v = pop.value;
        try {
          H().setPact(g, a.ME, p.id, 'ally', v === 'ally' || v === 'buddy');
          H().setPact(g, a.ME, p.id, 'buddy', v === 'buddy');
        } catch (e) {}
        a.save(); a.renderPanel(); a.draw();
      });
    }
    row.append(ck, im, nm, pop);
    list.append(row);
  }
  box.append(list);
  return box;
}
// LHoGraphView ('grvw', 197 x 90 at the window's foot): the history drawn by Graph History's routine; "No Graph Information
// Available" before the first update (shot 008); ten bevel buttons 18 x 18 at (3 + 19 i, 70) choosing the line (Income, Metal,
// Savings, Ship Power, then Rank, Range, Speed, Weapons, Shields, Mini against the other players): their pictures to extract (unit 3).
const GRAPH_HINTS = ['Income', 'Metal', 'Savings', 'Ship Power', 'Rank vs. Other Players', 'Range vs. Other Players', 'Speed vs. Other Players', 'Weapons vs. Other Players', 'Shields vs. Other Players', 'Mini vs. Other Players'];
function graphView() {
  const a = A(), g = a.G;
  const box = document.createElement('section'); box.className = 'm5graph';
  const hist = (g.history || []).length;
  if (!hist || g.year <= (g.startYear || 2000)) { const t = document.createElement('span'); t.className = 'none'; t.textContent = TL('No Graph Information Available'); box.append(t); }
  const bar = document.createElement('div'); bar.className = 'm5gbtns';
  GRAPH_HINTS.forEach((h, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'm5bevel'; b.title = TL(h); b.setAttribute('aria-label', TL(h)); b.addEventListener('click', () => { const m = A(); if (m && m.openPlayers) m.openPlayers(); }); bar.append(b); });
  box.append(bar);
  return box;
}
T.panel = (panel, B) => {
  if (!M5ON()) return;
  const keep = [incomeView(B), techBars(B), budgetBars(B), resizer(), playersList(), graphView()];
  if (B && B.info) B.info.remove();
  if (B && B.budget) B.budget.remove();
  if (B && B.tech) B.tech.remove();
  if (B && B.planet) B.planet.classList.add('m5hidden');
  panel.prepend(...keep);
};
// LHoResizerView 'resz' (197 x 3): the line between the budget bars and the players list; dragging it gives one more room (PBAR at
// least 85, the players at least 60)
function resizer() { const r = document.createElement('div'); r.className = 'm5resz'; r.setAttribute('aria-hidden', 'true'); return r; }

// ---------- the map (unit 4) ----------
// LHoSampleMapView. Its cell (the view's +0xe4) is how many pixels a light year takes: a star at (x10, y10) tenths of a light year has
// its cell-sized rect at x10 * cell / 10 from the map's corner (FUN_10091e30), the map is cell x the galaxy's size (game +0x212) and is
// centred in the view when it is smaller (FUN_100935c0). Zoom In (Mcmd 5011) steps the cell 4, 8, 10, 13, 16, 20, 24 and Zoom Out
// (5012) back (the case blocks at 0x10060dec-0x10060f74); 24 is the preferences' first value (prefs +0x1f0 = 0x18, kept from game to
// game) and the closest (shot 031: Zoom In dimmed). The remake's map unit is 2 light years, so its scale is twice the cell.
// From a cell of 9 every star is a 40 x 40 picture from PICT 10000 centred in its cell, whatever the zoom (FUN_1008f470); under 9 an
// oval the cell's size: cyan for the selected star (ForeColor 273), white for one you know nothing of (30), else its owner's colour.
const CELLS = [4, 8, 10, 13, 16, 20, 24], FIRST = 24;
const cellOf = (sc) => sc / 2;
const near = (sc) => { let b = 0; CELLS.forEach((c, i) => { if (Math.abs(c - cellOf(sc)) < Math.abs(CELLS[b] - cellOf(sc))) b = i; }); return b; };
const mapOn = () => M5ON();
T.mapBg = '#000';
Object.defineProperty(T, 'bgStars', { configurable: true, get: () => !mapOn() }); // (5.0.5's map is plain black: shots 008, 034)
const prevZoom = T.zoomTo, prevFit = T.fitView, prevClamp = T.clampView;
T.zoomTo = (s0, f) => {
  if (!mapOn()) return prevZoom ? prevZoom(s0, f) : Math.max(12, Math.min(140, s0 * f));
  const i = near(s0) + (f > 1 ? 1 : f < 1 ? -1 : 0);
  return 2 * CELLS[Math.max(0, Math.min(CELLS.length - 1, i))];
};
// the limits of the view's offset: the galaxy's picture (cell x size, from half a cell before the first star's centre) centred when
// smaller than the view, else kept inside it
function limits(v, g, w, h) {
  const cell = cellOf(v.s), W = g.W * v.s, H = g.H * v.s, half = cell / 2;
  const x = W <= w ? [(w - W) / 2 + half, (w - W) / 2 + half] : [w - W + half, half];
  const y = H <= h ? [(h - H) / 2 + half, (h - H) / 2 + half] : [h - H + half, half];
  return { x, y };
}
const clampTo = (v, g, w, h) => { const L = limits(v, g, w, h); v.ox = Math.max(L.x[0], Math.min(L.x[1], v.ox)); v.oy = Math.max(L.y[0], Math.min(L.y[1], v.oy)); };
T.fitView = (v, c) => {
  if (!mapOn()) { if (prevFit) prevFit(v, c); return; }
  v.s = 2 * FIRST;
  const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar];
  if (st) { v.ox = c.mapW / 2 - st.x * v.s; v.oy = c.mapH / 2 - st.y * v.s; }
  clampTo(v, c.G, c.mapW, c.mapH);
};
T.clampView = (v, c) => { if (!mapOn()) { if (prevClamp) prevClamp(v, c); return; } clampTo(v, c.G, c.mapW, c.mapH); };
// (the map in Mac pixels: one is --m5 CSS pixels)
const prevPixel = T.mapPixel;
T.mapPixel = () => (de.classList.contains('m5win') && M5.s > 1 ? [M5.s, M5.s] : prevPixel ? prevPixel() : null); // (by the layout alone: the canvas is sized before a game is on)
const prevPx = T.planetPx;
T.planetPx = (sc) => (!mapOn() ? (prevPx ? prevPx(sc) : Math.max(18, Math.min(52, sc * 0.9))) : cellOf(sc) >= 9 ? 40 : cellOf(sc));
T.mapNames = (sc) => (mapOn() ? cellOf(sc) >= 9 : sc > 18);
// the names: Geneva 9, bold, light grey, under the picture (shots 008, 011, 034)
T.mapNameStyle = (cx) => { if (mapOn()) { cx.font = 'bold 9px Geneva, "Lucida Grande", Verdana, sans-serif'; cx.fillStyle = '#d7d7d7'; } };
T.selectScale = () => (mapOn() ? 0 : 1); // (the selection is 5.0.5's ring, drawn under the stars)
// (a blank picture as the page's selection, so that it draws neither its own picture nor its yellow glow: the ring is 5.0.5's)
Object.defineProperty(T, 'select', { configurable: true, get: () => { const a = A(); if (!mapOn() || !a || !a.IMG) return undefined; if (!a.IMG.m5none) { const c = document.createElement('canvas'); c.width = c.height = 1; a.IMG.m5none = c; } return 'm5none'; } });
const prevDrawStar = T.drawStar;
T.drawStar = (cx, i) => {
  if (!mapOn() || cellOf(i.view.s) >= 9) return prevDrawStar ? prevDrawStar(cx, i) : false;
  const k = H().know(i.G, i.G.players[i.ME], i.s.id), cell = cellOf(i.view.s);
  cx.fillStyle = i.sel ? '#02abea' : !(k && k.explored) && i.s.owner !== i.ME ? '#ffffff' : ownerColour(i.G, i.s.owner === i.ME ? i.ME : k.owner);
  cx.beginPath(); cx.ellipse(i.x, i.y, cell / 2, cell / 2, 0, 0, Math.PI * 2); cx.fill();
  return 'all';
};
// (an owner's colour: 5.0.5's colour table (_DAT_100ef770 + owner x 6) is not extracted; the hats' main colours stand in, grey for nobody)
const OWNER = ['#3cc83c', '#d22828', '#2850dc', '#e6c828', '#c83cc8', '#28c8c8', '#e68228', '#8c8c8c', '#a05028', '#50a050', '#ffffff'];
function ownerColour(g, o) { return o == null || o < 0 ? '#8c8c8c' : OWNER[o % OWNER.length]; }
// the selection ring (FUN_1008f300): frame (n mod 8) of the eight 82 x 82 rings at (84 n, 590) in PICT 10000
// (assets/skins/mac5/ring.png), drawn in transparent mode 23 pixels outside the 40-pixel picture; n steps with the map's idle
// animation (the view's +0x1e8). Its rate is the machine's; the remake steps six a second.
const RING_IMG = new Image(); RING_IMG.src = 'assets/skins/mac5/ring.png';
// (transparent mode leaves the sheet's black out: the frames' near-black is made see-through, each pixel's alpha its brightest channel)
let RING = { complete: false, width: 0 };
RING_IMG.onload = () => {
  const c = document.createElement('canvas'); c.width = RING_IMG.width; c.height = RING_IMG.height; const x = c.getContext('2d'); x.drawImage(RING_IMG, 0, 0);
  try { const d = x.getImageData(0, 0, c.width, c.height), q = d.data; for (let i = 0; i < q.length; i += 4) { const m = Math.max(q[i], q[i + 1], q[i + 2]); if (m < 40) q[i + 3] = 0; } x.putImageData(d, 0, 0); } catch (e) {}
  c.complete = true; RING = c;
};
const SEL = { n: 0, timer: null };
const prevUnder = T.mapUnder;
T.mapUnder = (cx, i) => {
  if (prevUnder) prevUnder(cx, i);
  if (!mapOn()) return;
  const a = A(), sid = a.UI.sel; if (sid == null || cellOf(i.view.s) < 9 || !RING.complete || !RING.width) return;
  const st = i.G.stars[sid], x = Math.round(i.sx(st.x)), y = Math.round(i.sy(st.y));
  cx.save(); cx.imageSmoothingEnabled = false;
  cx.drawImage(RING, (SEL.n % 8) * 82, 0, 82, 82, x - 20 - 23 + 2, y - 20 - 23 + 2, 82, 82);
  cx.restore();
  if (!SEL.timer) SEL.timer = setInterval(() => { if (!mapOn() || document.hidden) return; SEL.n = (SEL.n + 1) % 8; A().draw(); }, 1000 / 6);
};
// The Planet Info Box (FUN_10092300; Window > Hide Planet Info Box, ⌘I): with a cell over 8, under the selected star's picture, 101 x 75
// (120 x 75 for a colony of yours with its terraform / mine gauge), its backdrop PICT 10000 (109, 246)-(210, 321) or (473, 163)-(593, 238)
// blended through a round rect (12); Geneva 9 in green (the colour table's +0x48: #54b53a sampled from shot 008): the name bold, centred,
// at 12; then the rows at 25, 35, 45, 55, 65, the labels at 39 left of the centre and the figures at the centre + 1 (STR# 6001):
// a colony of yours "Income:" and "Pop:"; a star known to be someone's "Owner:" and "Pop:"; another explored star "Info:" (the year it
// was seen) and "Owner:" (or "No One"); then "Temp:", "Grav:" (%d.%02dG of your home's) and "Metal:". A star never explored: "No
// Information" alone at 30. The gauge itself (FUN_100933f0) is drawn from the page's bars for now.
function infoBox() {
  const wrap = document.getElementById('mapwrap'); if (!wrap) return null;
  let b = document.getElementById('m5info');
  if (!b) { b = document.createElement('div'); b.id = 'm5info'; b.setAttribute('aria-live', 'polite'); wrap.append(b); }
  return b;
}
const prevAfterDraw = T.afterDraw;
T.afterDraw = () => {
  if (prevAfterDraw) prevAfterDraw();
  const b = infoBox(); if (!b) return;
  const a = A(), g = a && a.G, sid = a && a.UI.sel;
  if (!mapOn() || boxOff() || sid == null || !g || cellOf(a.UI.view.s) < 9) { b.hidden = true; return; }
  const st = g.stars[sid], p = a.me(), k = H().know(g, p, sid), mine = st.owner === a.ME && st.pop > 0;
  const gauge = mine && !(Math.abs(H().seenT(p, st) - 72) <= 0.5) && st.metal > 0;
  const v = a.UI.view, z = M5.s || 1, x = v.ox + st.x * v.s, y = v.oy + st.y * v.s;
  const w = gauge ? 120 : 101, left = Math.round(x - (gauge ? 60 : 50)), top = Math.round(y + 20 + 1);
  b.hidden = false; b.className = gauge ? 'wide' : '';
  b.style.left = (left * z) + 'px'; b.style.top = (top * z) + 'px'; b.style.width = (w * z) + 'px';
  const rows = [];
  const yr = (seen) => (g.year != null && g.turn != null ? g.year - (g.turn - seen) * ((g.opts && +g.opts.yearsPerTurn) || 10) : '');
  const nm = (o) => (o >= 0 && g.players[o] ? g.players[o].name : TL('No One'));
  const t10 = Math.round(10 * H().seenT(p, mine ? st : (k || st))), gr = Math.trunc(100 * (mine ? st : k).g / Math.max(0.01, p.homeG));
  if (!mine && !(k && k.explored)) { b.innerHTML = ''; b.append(line('nm', st.name), line('none', TL('No Information'))); return; }
  if (mine) rows.push([TL('Income:'), a.money(Math.round(H().planetIncome(g, p, st)))], [TL('Pop:'), H().niceNum(H().popNum(g, st.pop))]);
  else if (k.owner >= 0 && k.seen === g.turn && k.pop > 0) rows.push([TL('Owner:'), nm(k.owner)], [TL('Pop:'), H().niceNum(H().popNum(g, k.pop))]);
  else rows.push([TL('Info:'), String(yr(k.seen))], [TL('Owner:'), nm(k.owner)]);
  rows.push([TL('Temp:'), (a.degF ? a.degF(t10 / 10) : (t10 / 10).toFixed(1) + '°F')], [TL('Grav:'), Math.trunc(gr / 100) + '.' + String(gr % 100).padStart(2, '0') + 'G'], [TL('Metal:'), H().niceNum(Math.round((mine ? st : k).metal))]);
  b.innerHTML = ''; b.append(line('nm', st.name));
  rows.forEach(([l, val], i) => { const r = line('row', ''); r.style.top = U(25 + 10 * i - 9); r.append(span2('lb', l), span2('vl', val)); b.append(r); });
  if (gauge) b.append(gaugeOf(st));
};
// ---------- End Turn (unit 5) ----------
// LHoEndTurnView (FUN_100a6f64; PPob 136 'Hend', 83 x 83): the glass globe, PICT 10000 (0, 423)-(83, 506), or (85, 423)-(168, 506) while
// pressed, in transparent mode; on it the clock's window, PICT 10000 (158, 147)-(196, 167) at (22, 50), and in it the time the turn has
// taken, minutes:seconds, Geneva 9, right-aligned at 55 on the baseline 63, in the colour table's +0x12 (green, sampled from shot 034).
// A click inside the oval ends the turn (FUN_100a6dd4: PtInRgn on the oval). It stands at the map's foot left (shots 008, 034: 7 in
// from the map's edge, 4 above the scroll bar). (The arc the routine can paint over it for a timed turn shows in no capture: left out.)
const CLK = { t0: Date.now(), turn: null, timer: null };
function globe() {
  const wrap = document.getElementById('mapwrap'); if (!wrap) return null;
  let g = document.getElementById('m5clk');
  if (!g) {
    g = document.createElement('div'); g.id = 'm5clk';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'clock m5globe'; b.setAttribute('aria-label', TL('End Turn')); b.setAttribute('aria-keyshortcuts', 'T');
    const t = document.createElement('span'); t.className = 'm5time'; b.append(t);
    // (inside the oval only, as the program's PtInRgn)
    const inOval = (e) => { const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; return x * x + y * y <= 0.25; };
    b.addEventListener('pointerdown', (e) => { if (inOval(e)) b.classList.add('down'); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(k => b.addEventListener(k, () => b.classList.remove('down')));
    b.addEventListener('click', (e) => { if (e.detail && !inOval(e)) return; const a = A(); if (a && a.G && !a.G.over) a.doEndTurn(); });
    g.append(b); wrap.append(g);
  }
  return g;
}
function clockTick() {
  const a = A(), g = document.getElementById('m5clk'); if (!g) return;
  const on = mapOn() && a && a.G && !a.G.over; g.hidden = !on; if (!on) return;
  if (CLK.turn !== a.G.turn) { CLK.turn = a.G.turn; CLK.t0 = Date.now(); }
  const sec = Math.floor((Date.now() - CLK.t0) / 1000);
  g.querySelector('.m5time').textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}
const prevAfterDraw2 = T.afterDraw;
T.afterDraw = () => { if (prevAfterDraw2) prevAfterDraw2(); if (!mapOn()) { const g = document.getElementById('m5clk'); if (g) g.hidden = true; return; } globe(); clockTick(); if (!CLK.timer) CLK.timer = setInterval(clockTick, 1000); };
const line = (cls, text) => { const e = document.createElement('div'); e.className = cls; e.textContent = text; return e; };
const span2 = (cls, text) => { const e = document.createElement('span'); e.className = cls; e.textContent = text; return e; };
// the terraform / mine gauge at the box's left (FUN_100933f0, to read): green above for terraforming, blue below for mining, the red
// mark between them at the split (shot 008, x3)
function gaugeOf(st) {
  const g = document.createElement('div'); g.className = 'gauge';
  const rs = H().rules(A().G); let t = st.terra == null ? 0.5 : st.terra; if (rs.bars) { const bb = rs.bars(st); t = bb[0] < 0 ? 0 : bb[1] < 0 ? 1 : bb[0] / 1000; }
  g.style.setProperty('--t', String(t));
  return g;
}
})();
