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

// ---------- the map ----------
// (unit 4: the map's own zooms, stars, the selection ring, the Planet Info Box, fleets and routes. For now the page's map, on black.)
T.mapBg = '#000';
})();
