// Spaceward Ho! web remake — the Amiga 2.0 skin (see js/skins.js)
//
// Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD, 1994;
// the Amiga version by Stefan "Bebbo" Franke), in German. The game is the
// DOS 2.0 game: the same pictures in the same order and the same sounds,
// in the 16 colours of the original chip set (tools/extract/amiga.py
// writes them under the DOS skin's names), so this skin is the DOS skin
// (js/skins/dos/ui.js: where each picture and sound goes) on the classic
// skin's logic (js/skins/classic/ui.js), with the Amiga's own screen:
//
// - one hires PAL screen, 640 x 256 pixels, with a blue title bar ("Spaceward
//   Ho! – player in MARS im Jahre 2000": the player, the galaxy, the year),
//   whose menus show while the pointer is on it (or after a right click or
//   a tap there);
// - on the left, stacked panels: the star (its figures and the Terra./Met./
//   Schf. bars, or its owner and when it was seen), the fleets there
//   (Stationiert auf, Tank, Tempo, Voll/Leer or Schrott, the ships), the
//   totals with this turn's changes, and below them either the Technik
//   Ausgaben window (levels and upright research bars) or the players and
//   the spending window (0% linear 100, Sparen, Technik and a bar a planet);
// - on the right, the black map with Amiga scroll bars: open circles at the
//   far zoom, the planet pictures with their names close up, the green ring
//   on the selected star, "Zug Ende / Amiga+Z" at the top left;
// - the reports as white cards at the map's lower left ("--mehr--" while
//   more follow), and the Nachrichten window with the turn's reports;
// - its own windows: Neue Galaxis erstellen, Spieler Registration,
//   Schiffsbau, Typen Manager, Spielervergleich, Aufteilen der Schiffe, the
//   About window and the Startup window, as the screenshots show them
//   (docs/amiga-skin.md); every other window is the classic one in the
//   Workbench look.
//
// Nothing of the Amiga's windows was in its files (the program draws them),
// so they are matched to emulator screenshots, pixel by pixel where they
// show it; what they don't show is guessed in the same style (the list is
// in docs/amiga-skin.md). Its type is the X11 Adobe Helvetica bitmaps the
// Amiga's own font matches (assets/fonts/HoAmiga*, tools/amiga-font.py).
//
// The Amiga's pixels are twice as tall as they are wide (PAL hires on a 4:3
// monitor): "Amiga monitor (tall pixels)", the default, draws them so;
// "Square pixels" draws the raw 640 x 256 screen. A look option (with the
// Skin and OS look pickers, never in the rules), kept in localStorage
// "ho5.amiga.pixels". Everything on the screen is measured in Amiga pixels
// (CSS --u and --v, the CSS pixels one Amiga pixel takes across and down),
// the map too (T.mapPixel), so the map's clicks, drags and touches land
// where they should in both.
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for its (here the Amiga's) pictures
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* not kept */ } },
};
const TH = () => window.HOTHEME;
const api = () => TH() && TH().api;
const game = () => { const a = api(); return a && a.G; };

// ---------- words: the Amiga's German, and English for a game played in English ----------
const WORDS = {
  profit: ['Profit:', 'Profit:'], pop: ['Bev:', 'Pop:'], temp: ['Temp:', 'Temp:'], grav: ['Gravit:', 'Grav:'], metal: ['Metall:', 'Metal:'],
  owner: ['Besitzer:', 'Owner:'], nobody: ['Niemand', 'Nobody'], empty: ['Unbewohnt', 'Uninhabited'], seen: ['Info Datum:', 'Info date:'],
  orders: ['Aufträge:', 'Orders:'], none: ['Keine.', 'None.'], unexplored: ['Unerforscht.', 'Unexplored.'], battleSeen: ['Ein Kampf wurde hier gesehen.', 'A battle was seen here.'],
  terra: ['Terra.', 'Terra.'], met: ['Met.', 'Mine'], schf: ['Schf.', 'Ship'],
  at: ['Stationiert auf:', 'Stationed at:'], to: ['Unterwegs nach:', 'Bound for:'], tank: ['Tank:', 'Fuel:'], speed: ['Tempo:', 'Speed:'],
  full: ['Voll', 'Full'], emptyShip: ['Leer', 'Empty'], scrap: ['Schrott', 'Scrap'],
  metalLeft: ['Metall übrig', 'Metal left'], moneyTotal: ['Geld total', 'Money total'], profitTotal: ['Profit total', 'Profit total'],
  tech: ['Technik Ausgaben', 'Technology'], levels: ['Akt. Stufen', 'Levels'],
  range: ['Weite', 'Range'], vel: ['Tempo', 'Speed'], weapons: ['Waffen', 'Weapons'], shields: ['Schilder', 'Shields'], mini: ['Mini', 'Mini'], radical: ['Radikal', 'Radical'],
  savings: ['Sparen', 'Savings'], techBar: ['Technik', 'Tech'], linear: ['linear', 'linear'], log: ['logar.', 'log'],
  news: ['Nachrichten', 'Messages'], more: ['--mehr--', '--more--'],
  endTurn: ['Zug Ende', 'End turn'],
  title: ['Spaceward Ho! – %1 in %2 im Jahre %3', 'Spaceward Ho! – %1 in %2 in %3'], screen: ['Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Version 2.0'],
  ok: ['Ok', 'OK'], cancel: ['Abbruch', 'Cancel'],
  build: ['Schiffsbau', 'Shipbuilding'], queueAt: ['Auftragsliste bei %1', 'Orders at %1'], types: ['Vorhandene Typen', 'Types'], waiting: ['Auf Warteliste:', 'Waiting:'],
  done: ['%1% fertig', '%1% done'], newType: ['Neuer Typ…', 'New type…'], noShip: ['Keine Schiffsbaugelder: Schf. im Sternfenster.', 'No shipbuilding money: Ship bar in the star panel.'],
  typeMgr: ['Spaceward Ho! Typen Manager', 'Spaceward Ho! Ship Types'], name: ['Name:', 'Name:'], cls: ['Klasse:', 'Class:'], devCost: ['Entw.kosten:', 'Design cost:'],
  prodCost: ['Prod.kosten:', 'Unit cost:'], built: ['# Gebaut: %1', '# Built: %1'], exist: ['# Existent: %1', '# Existing: %1'], scrapType: ['Typ verschrotten', 'Scrap type'],
  nameBtn: ['Name', 'Name'], rename: ['Neuer Name für %1:', 'New name for %1:'], shields2: ['Schilde:', 'Shields:'], weite: ['Weite:', 'Range:'], tempo: ['Tempo:', 'Speed:'], waffen: ['Waffen:', 'Weapons:'], miniC: ['Mini:', 'Mini:'],
  scrapAsk: ['%1 und alle %2 Schiffe dieses Typs verschrotten?', 'Scrap %1 and all %2 ships of that type?'],
  compare: ['Spielervergleich von noch %1 Spielern im Jahre %2', 'Comparing the %1 players left in %2'], first: ['erster', 'first'], middle: ['mittlerer', 'middle'], last: ['letzter', 'last'],
  cProfit: ['Profit', 'Profit'], cMetal: ['Metall', 'Metal'], cPlanets: ['Planeten', 'Planets'], cShips: ['Schiffe', 'Ships'], cShields: ['Schilde', 'Shields'], info: ['Info', 'Info'],
  split: ['Aufteilen der Schiffe', 'Organize ships'], splitHelp1: ['– Stellen Sie die Schiffe beliebig zusammen.', '– Put the ships together as you like.'],
  splitHelp2: ['– Klick mit UMSCHALTEN wählt eine ganze Flotte an.', '– A click with SHIFT picks a whole fleet.'], group: ['Guppieren', 'Group'], single: ['Vereinzeln', 'Split up'],
  about: ['Spaceward Ho!', 'Spaceward Ho!'],
  ngTitle: ['Neue Galaxis erstellen', 'Create a new galaxy'], density: ['Sterndichte:', 'Star density:'], shape: ['Art der Galaxis:', 'Kind of galaxy:'], iq: ['Computerintelligenz:', 'Computer intelligence:'],
  size: ['Größe der Galaxis:', 'Size of the galaxy:'], computers: ['Anzahl der Computerspieler:', 'Number of computer players:'], bang: ['Urknall', 'Big Bang'], moreSettings: ['Mehr…', 'More…'],
  reg: ['Spaceward Ho! Spieler Registration', 'Spaceward Ho! Player Registration'], skill: ['Spielstufe:', 'Skill:'], yourName: ['Ihr Name:', 'Your name:'], password: ['Paßwort:', 'Password:'],
  sex: ['Geschlecht:', 'Sex:'], man: ['Mann', 'Man'], woman: ['Frau', 'Woman'],
  startup: ['Spaceward Ho! Startup', 'Spaceward Ho! Startup'], open: ['Spiel öffnen', 'Open game'], newGame: ['Neues Spiel', 'New game'],
  pixels: ['Pixel', 'Pixels'], tall: ['Amiga monitor (tall pixels)', 'Amiga monitor (tall pixels)'], square: ['Square pixels', 'Square pixels'],
  commands: ['Befehle', 'Orders'], noCommands: ['(keine)', '(none)'],
};
// no game yet: the Amiga's German
const de = () => { const G = game(); return G ? !!(G.opts && G.opts.lang === 'de') : true; };
const w = (k, ...v) => { const e = WORDS[k]; let s = e ? e[de() ? 0 : 1] : k; v.forEach((x, i) => { s = s.split('%' + (i + 1)).join(x); }); return s; };
// the classic page's own buttons, in the Amiga's German where a game is German
const CMD_DE = {
  'Build ships…': 'Schiffsbau…', 'Queue ships…': 'Schiffsbau…', Evacuate: 'Evakuieren', 'Stay here': 'Hierbleiben', 'Split…': 'Aufteilen der Schiffe…',
  'Plan route…': 'Route planen…', Scrap: 'Verschrotten', 'Arrive late': 'Später ankommen', 'Merge fleets of the same type': 'Flotten gleichen Typs vereinen',
  'Merge all fleets here': 'Alle Flotten hier vereinen', 'Group fleets…': 'Flotten gruppieren…', 'Organize fleets…': 'Flotten ordnen…',
  'Dismantle in hyperspace': 'Im Hyperraum verschrotten', Normal: 'Normal', Offensive: 'Angriff', Defensive: 'Verteidigung',
};
const cmdWord = (t) => (de() && CMD_DE[t]) || (de() && /^Review (battle|duel)/.test(t) ? t.replace(/^Review battle/, 'Kampf ansehen').replace(/^Review duel/, 'Duell ansehen') : t);
const CLASS_DE = { scout: 'Späher', fighter: 'Kampfschiff', colony: 'Kolonieschiff', satellite: 'Satellit', tanker: 'Tanker', dread: 'Schlachtschiff', bio: 'Biowaffe', decoy: 'Attrappe' };
const className = (t) => (de() ? CLASS_DE[t] : null) || (HO.TYPES[t] ? HO.TYPES[t].name : t);
// numbers the Amiga's way: 51.000, $ 51.000, $ -7.501
const num = (n) => Math.round(n).toLocaleString(de() ? 'de-DE' : 'en-US');
const cash = (n) => (de() ? '$ ' + num(n) : api().money(n));
const signed = (n, money) => {
  const a = Math.abs(Math.round(n)), s = n < 0 ? '–' : '+', m = money ? '$ ' : '';
  return `(${s} ${m}${money && a >= 1000 ? Math.round(a / 1000) + 'K' : num(a)})`;
};
const celsius = (f) => ((f - 32) * 5 / 9).toFixed(1) + '°C';
const temp = (f) => (de() ? celsius(f) : api().degF(f));

// ---------- the screen's pixels ----------
const PIXKEY = 'ho5.amiga.pixels';
const pixMode = () => (LS.get(PIXKEY) === 'square' ? 'square' : 'tall');
const PX = { x: 2, y: 4, r: 2, phone: false };
// --x/--y: the main screen's pixel (CSS px), --dx/--dy a window's, --tx/--ty
// the title screen's; each part of the page uses them as --u and --v
function layout() {
  const root = document.documentElement, vw = window.innerWidth || 640, vh = window.innerHeight || 512;
  const r = pixMode() === 'tall' ? 2 : 1, phone = vw < 600;
  const x = phone ? vw / 241 : Math.min(vw / 640, vh / (256 * r));
  Object.assign(PX, { x, y: x * r, r, phone });
  const dx = Math.min(x, (vw - 4) / 640);
  const tc = document.querySelector('#titlescreen .tcard');
  const below = tc ? tc.offsetHeight + 8 : 0;
  const tx = Math.max(0.4, Math.min(vw / 640, (vh - below) / (256 * r)));
  const S = root.style;
  S.setProperty('--x', x + 'px'); S.setProperty('--y', x * r + 'px');
  S.setProperty('--dx', dx + 'px'); S.setProperty('--dy', dx * r + 'px');
  S.setProperty('--tx', tx + 'px'); S.setProperty('--ty', tx * r + 'px');
  root.classList.toggle('am-tall', r === 2); root.classList.toggle('am-square', r === 1);
  root.classList.toggle('am-phone', phone); root.classList.toggle('am-desk', !phone);
  const a = api();
  if (a && a.map().ready) { a.resize(); }
}
function setPixels(m) {
  LS.set(PIXKEY, m === 'square' ? 'square' : 'tall');
  layout();
  for (const s of document.querySelectorAll('select.am-pixsel')) s.value = pixMode();
  const a = api(); if (a && a.G) { a.renderPanel(); a.draw(); }
}
document.documentElement.classList.add('amiga');
layout();
window.addEventListener('resize', () => layout());

// ---------- little helpers ----------
// (the classic page's el, without a class when none is given)
const el = (tag, attrs, ...kids) => {
  if (attrs && attrs.class == null && 'class' in attrs) { attrs = Object.assign({}, attrs); delete attrs.class; }
  return api().el(tag, attrs, ...kids);
};
const img = (name, cls) => { const a = api(), src = a.A.img[name]; return src ? el('img', { src, alt: '', class: cls || null, draggable: 'false' }) : el('span', { class: (cls || '') + ' am-noimg' }); };
const gadget = (kind, label, onclick) => el('button', { type: 'button', class: 'am-gad am-' + kind, 'aria-label': label, title: label, onclick });
// an Amiga window inside the screen (Technik Ausgaben, Nachrichten): a grey
// title bar (the active window's is cyan), its gadgets and a body
function screenWin(id, title, gads, body) {
  const bar = el('div', { class: 'am-wbar' });
  if (gads.close) bar.append(gadget('close', 'Close', gads.close));
  bar.append(el('span', { class: 'am-wname' }, title));
  if (gads.zoom) bar.append(gadget('zoom', 'Zoom', gads.zoom));
  if (gads.depth) bar.append(gadget('depth', 'Depth', gads.depth));
  return el('section', { id, class: 'am-swin' }, bar, el('div', { class: 'am-sbody' }, body));
}
// an Amiga scroll bar (a prop gadget with its two arrows) for a scrolling box
function scroller(box, vertical) {
  const knob = el('div', { class: 'am-knob' }), track = el('div', { class: 'am-track' }, knob);
  const step = (d) => { if (vertical) box.scrollTop += d * Math.max(10, box.clientHeight / 2); else box.scrollLeft += d * Math.max(10, box.clientWidth / 2); };
  const bar = el('div', { class: 'am-prop ' + (vertical ? 'am-pv' : 'am-ph') },
    el('button', { type: 'button', class: 'am-arrow am-up', 'aria-label': vertical ? 'Scroll up' : 'Scroll left', tabindex: -1, onclick: () => step(-1) }),
    track,
    el('button', { type: 'button', class: 'am-arrow am-down', 'aria-label': vertical ? 'Scroll down' : 'Scroll right', tabindex: -1, onclick: () => step(1) }));
  const sync = () => {
    const tot = vertical ? box.scrollHeight : box.scrollWidth, vis = vertical ? box.clientHeight : box.clientWidth, at = vertical ? box.scrollTop : box.scrollLeft;
    const f = tot > 0 ? Math.min(1, vis / tot) : 1, o = tot > vis ? at / tot : 0;
    knob.style[vertical ? 'top' : 'left'] = o * 100 + '%'; knob.style[vertical ? 'height' : 'width'] = f * 100 + '%';
  };
  box.addEventListener('scroll', sync);
  let drag = null;
  knob.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); knob.setPointerCapture(e.pointerId); drag = { p: vertical ? e.clientY : e.clientX, s: vertical ? box.scrollTop : box.scrollLeft }; });
  knob.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = track.getBoundingClientRect(), len = vertical ? r.height : r.width, tot = vertical ? box.scrollHeight : box.scrollWidth;
    const d = ((vertical ? e.clientY : e.clientX) - drag.p) / Math.max(1, len) * tot;
    if (vertical) box.scrollTop = drag.s + d; else box.scrollLeft = drag.s + d;
  });
  knob.addEventListener('pointerup', () => { drag = null; });
  track.addEventListener('pointerdown', (e) => { if (e.target === track) { const r = knob.getBoundingClientRect(); step((vertical ? e.clientY < r.top : e.clientX < r.left) ? -1 : 1); } });
  requestAnimationFrame(sync);
  bar._sync = sync;
  return bar;
}
// a small Amiga pop-up menu at the pointer (the commands of a star or fleet)
function popup(items, x, y) {
  closePopup();
  if (!items.length) return;
  const m = el('div', { class: 'am-popup dropdown open', role: 'menu' });
  for (const it of items) {
    if (it === '-') { m.append(el('hr')); continue; }
    m.append(el('button', { role: 'menuitem', class: it.checked != null ? 'check' + (it.checked ? ' on' : '') : null, onclick: () => { closePopup(); it.fn(); } }, it.label));
  }
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(2, Math.min(x, window.innerWidth - r.width - 2)) + 'px';
  m.style.top = Math.max(2, Math.min(y, window.innerHeight - r.height - 2)) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', popOut), 0);
}
function popOut(e) { if (!e.target.closest('.am-popup')) closePopup(); }
function closePopup() { document.querySelectorAll('.am-popup').forEach(n => n.remove()); document.removeEventListener('pointerdown', popOut); }

// ---------- the commands the classic page has for a star and its fleets ----------
// The left column shows the Amiga's panels; the classic planet box (with
// every control the ruleset gives a star and its fleets: Build ships,
// Evacuate, Stay here, Split, Plan route, the stance, Arrive late, Scrap,
// Merge, Review battle) is kept out of sight, and its controls are offered
// as the "Befehle" menu, the star panel's and the fleet list's right-click
// (or long-press) menu. They are the same buttons, so they come and go with
// the ruleset as the classic page's do.
let planetBox = null;
const CMDS = []; // the title bar's Befehle menu (refilled in place)
function commands() {
  const out = [];
  if (!planetBox) return out;
  for (const n of planetBox.querySelectorAll('button, select, input[type=checkbox]')) {
    if (n.closest('.frow') && !n.closest('.frow.sel')) continue; // only the selected fleet's
    if (n.tagName === 'BUTTON') { if (!n.disabled) out.push({ label: cmdWord(n.textContent.trim()), fn: () => n.click() }); }
    else if (n.tagName === 'SELECT') {
      const lab = n.getAttribute('aria-label') || '';
      for (const o of n.options) out.push({ label: (de() && lab === 'Battle stance' ? 'Haltung: ' : lab ? lab + ': ' : '') + cmdWord(o.textContent), checked: n.value === o.value, fn: () => { n.value = o.value; n.dispatchEvent(new Event('change', { bubbles: true })); api().renderPanel(); } });
    } else {
      const lab = n.closest('label'), t = lab ? lab.textContent.trim() : '';
      out.push({ label: cmdWord(t), checked: n.checked, fn: () => { n.checked = !n.checked; n.dispatchEvent(new Event('change', { bubbles: true })); api().renderPanel(); } });
    }
  }
  return out;
}
function fillCommandMenu() {
  CMDS.length = 0;
  const c = commands();
  if (!c.length) CMDS.push([w('noCommands'), () => {}]);
  for (const it of c) CMDS.push([it.label, it.fn, null, it.checked != null ? () => it.checked : undefined]);
}

// ---------- the star panel ----------
// The bars (per mille): Terraform, Mine and, where the colony pays for ships
// in turn (the DOS 2.0 rules' build queue), Ship; -1 a finished part. 2.0
// keeps them as the ruleset's own (rs.bars20); otherwise they are the
// classic panel's two sliders, s.terra (the split between terraforming and
// mining) and s.ship (the shipbuilding share), which is what a drag here
// sets, just as those sliders would.
function colonyBars(G, p, s) {
  const rs = HO.rules(G);
  if (rs.bars20) return rs.bars20(s).slice();
  const terraOK = Math.abs(HO.seenT(p, s) - 72) > 0.5, metalOK = s.metal > 0;
  const ship = HO.feature(G, 'buildQueue') ? Math.round((s.ship || 0) * 1000) : null;
  const rest = 1000 - (ship || 0), tf = s.terra == null ? 0.5 : s.terra;
  const T = terraOK ? Math.round(rest * (metalOK ? tf : 1)) : -1, X = metalOK ? rest - Math.max(0, T) : -1;
  return ship == null ? [T, X] : [T, X, ship];
}
// the dragged bar takes v; the others (not finished) share the rest as they were
function dragColonyBar(G, s, bars, i, v) {
  const out = bars.slice(); out[i] = v;
  const others = bars.map((b, j) => j).filter(j => j !== i && bars[j] >= 0);
  const tot = others.reduce((a, j) => a + bars[j], 0), rest = 1000 - v;
  others.forEach((j, k) => { out[j] = tot > 0 ? Math.round(bars[j] / tot * rest) : Math.round(rest / others.length); });
  if (others.length) { const sum = out.reduce((a, b, j) => a + (b >= 0 ? b : 0), 0); out[others[others.length - 1]] += 1000 - sum; }
  else out[i] = 1000;
  // the classic sliders' values (bars20 reads them back)
  if (out.length > 2) s.ship = out[2] / 1000;
  const t = Math.max(0, out[0]), x = Math.max(0, out[1]);
  if (t + x > 0) s.terra = t / (t + x);
  return out;
}
function starChart(G, p, s) {
  const bars = colonyBars(G, p, s);
  const names = [w('terra'), w('met'), w('schf')].slice(0, bars.length);
  const max = Math.max(...bars);
  const cols = bars.map((v, i) => {
    const fill = el('div', { class: 'am-cfill' + (v === max && v > 0 ? ' top' : '') });
    fill.style.height = Math.max(0, v) / 10 + '%';
    return el('div', { class: 'am-ccol' + (v < 0 ? ' done' : ''), role: 'slider', tabindex: 0, 'aria-label': names[i], 'aria-valuenow': Math.max(0, Math.round(v / 10)), 'data-i': i }, fill);
  });
  const area = el('div', { class: 'am-carea' }, el('i', { class: 'am-axis' }), ...cols);
  const labs = el('div', { class: 'am-clabs' }, ...names.map(n => el('span', null, n)));
  let cur = null;
  const set = (e, col) => {
    const i = +col.dataset.i, r = area.getBoundingClientRect();
    const v = Math.max(0, Math.min(1000, Math.round((r.bottom - e.clientY) / r.height * 1000)));
    const now = cur || bars;
    cur = dragColonyBar(G, s, now, i, v);
    cols.forEach((c, j) => { c.firstChild.style.height = Math.max(0, cur[j]) / 10 + '%'; });
  };
  cols.forEach((col, i) => {
    col.addEventListener('pointerdown', (e) => {
      if (G.over || bars[i] < 0) { api().beep(); return; }
      col.setPointerCapture(e.pointerId); col._drag = true; set(e, col);
    });
    col.addEventListener('pointermove', (e) => { if (col._drag) set(e, col); });
    const end = () => { if (!col._drag) return; col._drag = false; cur = null; api().save(); api().renderPanel(); };
    col.addEventListener('pointerup', end); col.addEventListener('pointercancel', end);
    col.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 50 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -50 : 0;
      if (!d) return; e.preventDefault();
      if (G.over || bars[i] < 0) { api().beep(); return; }
      dragColonyBar(G, s, bars, i, Math.max(0, Math.min(1000, bars[i] + d))); api().save(); api().renderPanel();
    });
  });
  return el('div', { class: 'am-chart', 'data-help': 'terraMine' }, area, labs);
}
function kv(k, v) { return el('div', { class: 'am-kv' }, el('span', { class: 'am-k' }, k), el('span', { class: 'am-v' }, v)); }
function starPanel() {
  const a = api(), G = a.G, ME = a.ME, p = a.me(), sid = a.UI.sel;
  const box = el('section', { class: 'am-star' });
  if (sid == null) return box;
  const s = G.stars[sid], k = HO.know(G, p, sid);
  box.append(el('div', { class: 'am-sname' }, s.name));
  const rows = el('div', { class: 'am-rows' });
  box.append(rows);
  if (s.owner === ME) {
    const inc = HO.planetIncome(G, p, s);
    rows.append(kv(w('profit'), cash(inc)), kv(w('pop'), num(s.pop * 1000)), kv(w('temp'), temp(72 + (s.t - p.homeT))),
      kv(w('grav'), (s.g / p.homeG).toFixed(2) + 'G'), kv(w('metal'), num(s.metal)));
    const bars = colonyBars(G, p, s);
    if (bars.some((b, i) => b >= 0 && (i < 2 || bars[0] >= 0 || bars[1] >= 0))) box.append(starChart(G, p, s));
    else box.append(ordersList(G, p, s));
    box.addEventListener('dblclick', () => a.openBuild(sid));
  } else if (k.explored) {
    const own = k.owner >= 0 && G.players[k.owner];
    rows.append(kv(w('owner'), own ? own.name : w('nobody')), kv(w('pop'), own ? (k.pop ? '~' + num(k.pop * 1000) : '?') : w('empty')),
      kv(w('temp'), temp(72 + (k.t - p.homeT))), kv(w('grav'), (k.g / p.homeG).toFixed(2) + 'G'), kv(w('metal'), num(k.metal)));
    if (k.seen >= 0) box.append(el('div', { class: 'am-seen' }, `${w('seen')} ${2000 + k.seen * 10}`));
  } else rows.append(el('div', { class: 'am-note' }, k.battleOnly ? w('battleSeen') : w('unexplored')));
  box.addEventListener('contextmenu', (e) => { e.preventDefault(); popup(commands(), e.clientX, e.clientY); });
  return box;
}
function ordersList(G, p, s) {
  const q = s.queue || [];
  const lines = q.map(it => { const d = HO.getDesign(G, p.id, it.did); return d ? `${countWord(it.n)} ${d.name}` : ''; }).filter(Boolean);
  return el('div', { class: 'am-orders' }, el('div', null, w('orders')), ...(lines.length ? lines : [w('none')]).map(t => el('div', { class: 'am-oline' }, t)));
}
const countWord = (n) => (n === 1 ? (de() ? 'Ein' : 'One') : String(n));

// ---------- the fleet panel ----------
function fleetLine(G, f) {
  const parts = Object.keys(f.ships).map(k => {
    const d = HO.getDesign(G, f.owner, +k), n = f.ships[k];
    return d ? `${countWord(n)} ${d.name} (${d.W}/${d.S}) ${className(d.type)}` : '';
  }).filter(Boolean);
  return parts.join(', ');
}
function scrapValue(G, f) {
  const p = G.players[f.owner], rate = HO.rules(G).scrapReturn ? HO.rules(G).scrapReturn(G, p) : 0.75;
  let m = 0; for (const k in f.ships) { const d = HO.getDesign(G, f.owner, +k); if (d) m += HO.designCost(G, d).metal * f.ships[k] * rate; }
  return Math.round(m);
}
function fleetPanel() {
  const a = api(), G = a.G, ME = a.ME, UI = a.UI, sid = UI.sel;
  const box = el('section', { class: 'am-fleet' });
  const here = sid == null ? [] : G.fleets.filter(f => f.star === sid && f.to == null && (f.owner === ME || visibleAt(G, ME, sid)));
  const inbound = sid == null ? [] : G.fleets.filter(f => f.owner === ME && f.to === sid);
  const list = [...a.fleetOrder(here.filter(f => f.owner === ME)), ...here.filter(f => f.owner !== ME), ...a.fleetOrder(inbound)];
  let f = list.find(x => x.id === UI.selFleet);
  if (!f && UI.selFleet != null) { const g = G.fleets.find(x => x.id === UI.selFleet && x.owner === ME); if (g) f = g; }
  const head = el('div', { class: 'am-fhead' });
  if (f && f.owner === ME) {
    const where = f.to != null ? `${w('to')} ${G.stars[f.to].name}` : `${w('at')} ${G.stars[f.star].name}`;
    const colony = HO.fleetDesigns(G, f).some(d => d.type === 'colony');
    const third = f.sat ? '' : colony ? (f.colonists > 0 ? w('full') : w('emptyShip')) : `${w('scrap')} ${num(scrapValue(G, f))}`;
    head.append(el('div', null, where),
      el('div', { class: 'am-f3' }, el('span', null, f.sat ? '' : `${w('tank')} ${Math.floor(f.fuel + 1e-9)}/${HO.fleetMaxRange(G, f)}`),
        el('span', null, f.sat ? '' : `${w('speed')} ${HO.fleetSpeed(G, f)}`), el('span', null, third)));
  } else if (sid != null && list.length) head.append(el('div', null, `${w('at')} ${G.stars[sid].name}`), el('div', null, ' '));
  const rows = el('div', { class: 'am-flist fleets' });
  for (const x of list) {
    const mine = x.owner === ME, inb = x.to != null;
    const t = (mine ? '' : G.players[x.owner].name + ': ') + (inb ? '» ' : '') + fleetLine(G, x) + (mine && x.scrap301 ? ' ✕' : '');
    const r = el('div', { class: 'frow am-frow' + (x.id === UI.selFleet ? ' sel' : '') + (mine ? '' : ' enemy'), 'data-fleet': x.id, 'data-inbound': inb ? '1' : null,
      onclick: () => { UI.selFleet = x.id; a.renderPanel(); a.draw(); } }, t);
    r.addEventListener('dblclick', () => { if (mine && !inb && !x.sat && !G.over) a.openSplit(x); });
    r.addEventListener('contextmenu', (e) => { e.preventDefault(); UI.selFleet = x.id; a.renderPanel(); a.draw(); popup(commands(), e.clientX, e.clientY); });
    rows.append(r);
  }
  const wrap = el('div', { class: 'am-fwrap' }, rows, scroller(rows, true));
  box.append(head, wrap);
  // keep the selected row in view
  requestAnimationFrame(() => { const s = rows.querySelector('.sel'); if (s) { const o = s.offsetTop - rows.offsetTop; if (o < rows.scrollTop || o + s.offsetHeight > rows.scrollTop + rows.clientHeight) rows.scrollTop = o; } });
  return box;
}
function visibleAt(G, ME, sid) { return G.stars[sid].owner === ME || G.fleets.some(f => f.owner === ME && f.star === sid && f.to == null); }

// ---------- the totals ----------
// "(+ $ 22K)": the change since the turn before, kept for each game and
// player in localStorage (the game keeps no such record)
function totalsNow(G, p) { return { m: p.metal, s: p.savings, p: HO.projected(G, p).income }; }
function totalsDelta(G, p) {
  const key = 'ho5.amiga.totals.' + (G.opts.seed || 0) + '.' + p.id;
  let rec = null; try { rec = JSON.parse(LS.get(key) || 'null'); } catch (e) { rec = null; }
  const now = totalsNow(G, p);
  if (!rec || rec.turn > G.turn) rec = { turn: G.turn, start: now, prev: null };
  if (rec.turn !== G.turn) { rec.prev = rec.start; rec.start = now; rec.turn = G.turn; }
  LS.set(key, JSON.stringify(rec));
  const b = rec.prev || rec.start;
  return { m: rec.start.m - b.m, s: rec.start.s - b.s, p: rec.start.p - b.p };
}
function totals() {
  const a = api(), G = a.G, p = a.me(), now = totalsNow(G, p), d = totalsDelta(G, p);
  const line = (k, v, dv, money) => el('div', { class: 'am-trow' }, el('b', { class: 'am-tk' }, k), el('b', { class: 'am-tv' }, v), el('span', { class: 'am-td' }, signed(dv, money)));
  return el('section', { class: 'am-totals', 'data-help': 'savings' },
    line(w('metalLeft'), num(now.m), d.m, false), line(w('moneyTotal'), cash(now.s), d.s, true), line(w('profitTotal'), cash(now.p), d.p, true));
}

// ---------- players and spending; Technik Ausgaben ----------
const TECHFRONT = 'ho5.amiga.tech';
const techFront = () => LS.get(TECHFRONT) !== '0';
function setTechFront(on) { LS.set(TECHFRONT, on ? '1' : '0'); const a = api(); if (a && a.G) a.renderPanel(); }
function playersBox() {
  const a = api(), G = a.G;
  const list = el('div', { class: 'am-plist' });
  for (const q of G.players.filter(x => x.alive && !x.surrendered)) {
    const icon = q.human ? 's' + (q.female ? 1500 : 1000) : 's' + ((q.female ? 2500 : 2000) + (q.face % 20));
    list.append(el('div', { class: 'am-prow', role: 'button', tabindex: 0, onclick: () => a.openPlayers() }, img(P + icon, 'am-pic'), el('span', null, q.name)));
  }
  return el('section', { class: 'am-players' }, list, scroller(list, true));
}
let budgetEnts = null;
function spendBox(bb) {
  const a = api(), G = a.G;
  let pick = null; try { pick = localStorage.getItem('ho5.barScale.' + G.rules); } catch (e) { pick = null; }
  const sc = HO.barScale(G, 'budget', pick);
  const h = bb.querySelector('h3');
  if (h) h.replaceChildren(el('span', null, '0%'), el('span', null, sc.id === 'log' ? w('log') : w('linear')), el('span', null, '100'));
  const ruler = el('div', { class: 'am-ruler' }, ...Array.from({ length: 11 }, (_, i) => el('i', { style: `left:${i * 10}%` })));
  if (h) h.after(ruler);
  for (const r of bb.querySelectorAll('.barrow')) {
    const l = r.querySelector('.blabel');
    if (r.dataset.help === 'tech') l.textContent = w('techBar');
    else if (r.dataset.help === 'savingsBar') l.textContent = w('savings');
  }
  // (the rows stay in the classic page's order, which its bars are kept by; CSS orders them)
  const p = a.me(), order = p.slots20 || null;
  if (order) {
    const rows = [...bb.querySelectorAll('.barrow')], ents = budgetEnts || [];
    rows.forEach((r, i) => { const e = ents[i]; if (!e) return; const k = e.key === 'savings' ? 'sav' : e.key; const at = order.indexOf(k); r.style.order = String(at < 0 ? 99 : at + 1); });
  }
  bb.classList.add('am-budget');
  const body = el('div', { class: 'am-spend' }, bb);
  return el('section', { class: 'am-spendwin' }, body, scroller(body, true));
}
function techWin(tb) {
  const a = api(), p = a.me();
  const KEYS = { range: 'range', speed: 'vel', weapons: 'weapons', shields: 'shields', mini: 'mini', radical: 'radical' };
  const levels = el('div', { class: 'am-levels' }, el('div', null, w('levels')),
    ...['range', 'speed', 'weapons', 'shields', 'mini'].map(k => el('div', { class: 'am-lrow' }, el('span', null, w(KEYS[k])), el('span', null, String(p.tech[k])))));
  const h = tb.querySelector('h3'); if (h) h.remove();
  let best = null, bv = -1;
  for (const r of tb.querySelectorAll('.barrow')) {
    const key = r.dataset.help, l = r.querySelector('.blabel');
    if (KEYS[key]) l.textContent = w(KEYS[key]);
    const v = r.querySelector('.track')._v || 0;
    if (v > bv + 1e-9) { bv = v; best = r; } else if (Math.abs(v - bv) < 1e-9) best = null;
  }
  if (best) best.classList.add('top');
  tb.classList.add('am-techbars');
  const front = techFront();
  const win = screenWin('am-tech', w('tech'), { close: () => setTechFront(false), depth: () => setTechFront(false) }, el('div', { class: 'am-techbody' }, levels, tb));
  win.hidden = !front;
  return win;
}

// the left column, laid out on the classic panel's own boxes (T.panel)
function panel(box, parts) {
  const a = api();
  planetBox = parts.planet; budgetEnts = parts.ents;
  const keep = el('div', { class: 'am-keep', 'aria-hidden': 'true' }, parts.info, parts.planet);
  keep.hidden = true;
  const bottom = el('div', { class: 'am-bottom' }, playersBox(), spendBox(parts.budget));
  box.replaceChildren(starPanel(), fleetPanel(), totals(), bottom, techWin(parts.tech), keep);
  setTitle();
  fillCommandMenu();
  if (!a.UI._amWheel) { a.UI._amWheel = true; }
}
function setTitle() {
  const G = game(), t = document.getElementById('title');
  if (!t) return;
  if (!G) { t.textContent = w('screen'); return; }
  const p = G.players[api().ME];
  t.textContent = w('title', p.name, G.opts.galaxy || 'Milky Way', G.year);
}

// ---------- the map ----------
// far: open circles (9 x 7 pixels, the selected one in a green ring, 13 x
// 11), close up: the planet pictures (32 x 32) with their names under them
const BIG = 18; // Amiga pixels per light year from which the pictures show
function sprite(rows, colour) {
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d'); x.fillStyle = colour;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, j, 1, 1); });
  return c;
}
const CIRCLE = ['..#####..', '.#.....#.', '#.......#', '#.......#', '#.......#', '.#.....#.', '..#####..'];
const RING = ['....#####....', '..##.....##..', '.#.........#.', '.#.........#.', '#...........#', '#...........#', '#...........#', '.#.........#.', '.#.........#.', '..##.....##..', '....#####....'];
let SPR = null;
const sprites = () => SPR || (SPR = { grey: sprite(CIRCLE, '#bbbbbb'), white: sprite(CIRCLE, '#ffffff'), ring: sprite(RING, '#33ff33') });
function drawStar(cx, o) {
  const { s, x, y, look, sel, IMG, view, G, ME } = o;
  const X = Math.round(x), Y = Math.round(y);
  cx.imageSmoothingEnabled = false;
  if (view.s < BIG) {
    const S = sprites();
    cx.drawImage(s.owner === ME ? S.white : S.grey, X - 4, Y - 3);
    if (sel) cx.drawImage(S.ring, X - 6, Y - 5);
    return true;
  }
  if (sel && IMG[P + 'd500']) { const r = IMG[P + 'd500']; cx.drawImage(r, X - Math.floor(r.width / 2), Y - Math.floor(r.height / 2)); }
  const im = look.pic || IMG[look.base];
  if (im) { const z = look.pic ? 32 : im.width; cx.drawImage(im, X - z / 2, Y - z / 2, z, look.pic ? 32 : im.height); }
  cx.font = '16px HoAmiga, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
  cx.fillStyle = '#ffffff'; cx.fillText(s.name, X, Y + 16 + 9);
  return true;
}
// the scroll bars follow the view (T.afterDraw)
function syncMapBars() {
  const a = api(); if (!a) return;
  const G = a.G, v = a.UI.view, m = a.map();
  const vb = document.querySelector('#mapwrap > .am-pv .am-knob'), hb = document.querySelector('#mapwrap > .am-ph .am-knob');
  if (!vb || !hb) return;
  if (!G || !m.w) { vb.style.top = hb.style.left = '0'; vb.style.height = hb.style.width = '100%'; return; }
  const ext = (lo, hi, a0, a1) => { const t0 = Math.min(lo, a0), t1 = Math.max(hi, a1); return [(a0 - t0) / (t1 - t0), (a1 - a0) / (t1 - t0)]; };
  const vx0 = -v.ox / v.s, vx1 = (m.w - v.ox) / v.s, vy0 = -v.oy / v.s, vy1 = (m.h - v.oy) / v.s;
  const [hx, hw] = ext(-1, G.W + 1, vx0, vx1), [vy, vh] = ext(-1, G.H + 1, vy0, vy1);
  hb.style.left = hx * 100 + '%'; hb.style.width = hw * 100 + '%';
  vb.style.top = vy * 100 + '%'; vb.style.height = vh * 100 + '%';
}
function mapBars(wrap) {
  const mk = (vertical) => {
    const knob = el('div', { class: 'am-knob' }), track = el('div', { class: 'am-track' }, knob);
    const pan = (d) => { const a = api(); if (!a.G) return; const v = a.UI.view; if (vertical) v.oy -= d; else v.ox -= d; a.draw(); };
    const step = (dir) => { const m = api().map(); pan(dir * (vertical ? m.h : m.w) / 4); };
    const bar = el('div', { class: 'am-prop ' + (vertical ? 'am-pv' : 'am-ph') },
      el('button', { type: 'button', class: 'am-arrow am-up', 'aria-label': vertical ? 'Scroll the map up' : 'Scroll the map left', tabindex: -1, onclick: () => step(-1) }),
      track,
      el('button', { type: 'button', class: 'am-arrow am-down', 'aria-label': vertical ? 'Scroll the map down' : 'Scroll the map right', tabindex: -1, onclick: () => step(1) }));
    let drag = null;
    knob.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); knob.setPointerCapture(e.pointerId); drag = vertical ? e.clientY : e.clientX; });
    knob.addEventListener('pointermove', (e) => {
      if (drag == null) return;
      const a = api(), G = a.G; if (!G) return;
      const r = track.getBoundingClientRect(), now = vertical ? e.clientY : e.clientX, len = vertical ? r.height : r.width;
      const m = a.map(), v = a.UI.view, span = vertical ? Math.max(G.H + 2, m.h / v.s) : Math.max(G.W + 2, m.w / v.s);
      const d = (now - drag) / Math.max(1, len) * span * v.s; drag = now;
      pan(d);
    });
    knob.addEventListener('pointerup', () => { drag = null; });
    track.addEventListener('pointerdown', (e) => { if (e.target !== track) return; const r = knob.getBoundingClientRect(); step((vertical ? e.clientY < r.top : e.clientX < r.left) ? -1 : 1); });
    return bar;
  };
  wrap.append(mk(true), mk(false), el('div', { class: 'am-corner', 'aria-hidden': 'true' }));
}
// the first view: the Amiga's far zoom, on your home star
function fitView(v, { G, ME, mapW, mapH, sel }) {
  const s = Math.max(v.s, 14);
  const st = G.stars[sel != null ? sel : G.players[ME].homeStar];
  if (s !== v.s && st) { v.s = s; v.ox = mapW / 2 - st.x * s; v.oy = mapH / 2 - st.y * s; }
}

// ---------- the reports: the card, and the Nachrichten window ----------
const NEWSKEY = 'ho5.amiga.news';
const newsOpen = () => LS.get(NEWSKEY) !== '0';
function afterMsg(box, ctx) {
  const card = box.querySelector('.card'), clock = box.querySelector('.clock');
  box.classList.toggle('am-cardbox', !!card && !clock);
  box.classList.toggle('am-clockbox', !!clock);
  if (card && !card.classList.contains('end') && !card.classList.contains('waiting') && ctx.idx < ctx.inbox.length - 1) {
    const t = card.querySelector('.mtext'); if (t) t.append(el('div', { class: 'am-more' }, w('more')));
  }
  if (clock) {
    const im = clock.querySelector('img');
    const want = TH().endTurnPic;
    if (im && api().A.img[want]) im.src = api().A.img[want];
    clock.setAttribute('aria-label', w('endTurn'));
  }
  renderNews(clock ? ctx.inbox : null);
}
function newsIcon(m) {
  const a = api(), G = a.G;
  let icon = m.icon;
  const T = TH();
  if (T.messageLook) { const t = T.messageLook(m, { icon, sound: m.sound }, { G, ME: a.ME, starLook: a.starLook }); if (t) icon = t.icon; }
  return icon && a.A.img[icon] ? icon : P + 'i' + (a.me().female ? 1500 : 1000);
}
function renderNews(inbox) {
  const wrap = document.getElementById('mapwrap'); if (!wrap) return;
  let win = document.getElementById('am-news');
  const show = !!(inbox && inbox.length && newsOpen() && game());
  if (!show) { if (win) win.remove(); return; }
  const a = api(), G = a.G;
  const list = el('div', { class: 'am-nlist' });
  for (const m of inbox) {
    list.append(el('div', { class: 'am-nrow', role: 'button', tabindex: 0, onclick: () => {
      if (m.battle) { a.openBattle(m.battle); return; }
      if (m.star != null) { a.UI.sel = m.star; a.centerOn(m.star); a.renderPanel(); a.draw(); }
    } }, img(newsIcon(m), 'am-nicon'), el('p', null, HO.say(G, m.text))));
  }
  const body = el('div', { class: 'am-nwrap' }, list, scroller(list, true));
  const nw = screenWin('am-news', w('news'), {
    close: () => { LS.set(NEWSKEY, '0'); renderNews(null); },
    zoom: () => { const n = document.getElementById('am-news'); if (n) n.classList.toggle('zoomed'); },
    depth: () => { LS.set(NEWSKEY, '0'); renderNews(null); },
  }, body);
  if (win && win.classList.contains('zoomed')) nw.classList.add('zoomed');
  if (win) win.replaceWith(nw); else wrap.append(nw);
}
function toggleNews() {
  LS.set(NEWSKEY, newsOpen() ? '0' : '1');
  const a = api(); if (a && a.G) a.renderMsg();
}

// ---------- windows ----------
// an Amiga window: the classic modal (scrim, .win, .wtitle, .wbody) with
// the Amiga's own body; cls names its layout in style.css
function amWin(title, body, cls, opts) {
  const a = api();
  const win = a.modal(title, body, Object.assign({ cls: 'am-win ' + cls }, opts || {}));
  return win;
}
const btn = (label, fn, cls) => el('button', { type: 'button', class: 'am-btn' + (cls ? ' ' + cls : ''), onclick: fn }, label);
const frame = (cls, ...kids) => el('div', { class: 'am-frame ' + (cls || '') }, ...kids);
function shipCanvas(d, owner) {
  const a = api(), c = a.shipPic(d, owner);
  if (!c) return el('span', { class: 'am-noimg' });
  const im = el('img', { class: 'am-ship', alt: '', src: c.toDataURL ? c.toDataURL() : c.src, draggable: 'false' });
  return im;
}

// Schiffsbau (13.png): the colony's build queue. The first order, its cost
// ("[P]" with the prototype) and how much of it is paid; the next orders
// ("Auf Warteliste", the ruleset's slots); the player's types, a click
// queuing one. Ok keeps the orders, Abbruch takes back this window's. The
// classic window (the designer) opens from "Neuer Typ…".
function openShipyard(sid) {
  const a = api(), G = a.G, ME = a.ME, p = a.me(), s = G.stars[sid];
  if (!HO.feature(G, 'buildQueue') || G.over) return false;
  const before = JSON.stringify(s.queue || []), yard0 = s.yard, yardDid0 = s.yardDid;
  const slots = HO.rules(G).queueSlots || 3;
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => HO.canBuildType(G, p, t));
  let sel = null;
  const body = el('div', { class: 'am-yard' });
  const render = () => {
    const q = s.queue || [];
    const first = q[0] && HO.getDesign(G, ME, q[0].did);
    const pr = first ? HO.rules(G).yardProgress(G, p, s) : null;
    const cost = first ? HO.shipCostNow(G, p, first) : null;
    const left = el('div', { class: 'am-yleft' },
      el('div', { class: 'am-ytitle' }, w('queueAt', s.name)),
      el('div', { class: 'am-ybig', role: 'button', tabindex: 0, title: first ? first.name : '', onclick: () => { if (q[0]) { HO.unqueueShip(G, ME, sid, 0); render(); a.renderPanel(); } } }, first ? shipCanvas(first) : ''),
      el('div', { class: 'am-ycost' }, el('span', null, cost ? `${cash(cost.money)}${cost.proto ? ' [P]' : ''}` : ''), el('span', null, pr ? w('done', pr.pct) : '')),
      el('div', { class: 'am-ywait' }, el('span', { class: 'am-ywl' }, w('waiting')),
        el('div', { class: 'am-yslots' }, ...Array.from({ length: Math.max(1, slots - 1) }, (_, i) => {
          // the ships waiting: the first order's others, then the next orders
          const wait = [...(q[0] && q[0].n > 1 ? [{ did: q[0].did, n: q[0].n - 1, at: 0 }] : []), ...q.slice(1).map((x, j) => ({ did: x.did, n: x.n, at: j + 1 }))];
          const it = wait[i], d = it && HO.getDesign(G, ME, it.did);
          return el('div', { class: 'am-yslot', role: 'button', tabindex: 0, onclick: () => { if (it) { HO.unqueueShip(G, ME, sid, it.at); render(); a.renderPanel(); } } },
            d ? shipCanvas(d) : '', d ? el('div', { class: 'am-ycap' }, `${countWord(it.n)} ${d.name} (${d.W}/${d.S}) ${className(d.type)}`) : '');
        }))),
      (s.ship || 0) > 0 || !q.length ? null : el('p', { class: 'am-ynote' }, w('noShip')));
    const listBox = el('div', { class: 'am-ytypes' });
    for (const d of p.designs.filter(x => !x.scrapped && types.includes(x.type))) {
      listBox.append(el('div', { class: 'am-ytype' + (sel === d.id ? ' sel' : '') + (d.scrap301 ? ' scrap' : ''), role: 'button', tabindex: 0,
        onclick: () => {
          sel = d.id;
          if (!d.scrap301 && HO.queueShips(G, ME, sid, d.id, 1)) a.Sound.play(7006); else a.beep();
          render(); a.renderPanel(); a.draw();
        } }, shipCanvas(d), el('div', { class: 'am-ycap' }, `${d.name} (${d.W}/${d.S}) ${className(d.type)}`)));
    }
    const right = el('div', { class: 'am-yright' }, el('div', { class: 'am-ytitle' }, w('types')),
      el('div', { class: 'am-ylist' }, listBox, scroller(listBox, true)));
    const btns = el('div', { class: 'am-ybtns' },
      btn(w('newType'), () => { a.closeModal(); a.classic('build', a.openBuild, sid); }, 'am-small'),
      btn(w('ok'), () => { a.closeModal(); }),
      btn(w('cancel'), () => { s.queue = JSON.parse(before); s.yard = yard0; s.yardDid = yardDid0; a.closeModal(); a.renderPanel(); a.draw(); }));
    const keepTop = listBox.scrollTop;
    body.replaceChildren(left, right, btns);
    listBox.scrollTop = keepTop;
  };
  render();
  amWin(w('build'), body, 'am-wyard', { onClose: () => { a.save(); a.renderPanel(); } });
  return true;
}

// Typen Manager (21.png): the player's types; the chosen one's picture,
// figures, how many were built and how many there are; "Typ verschrotten"
// scraps it (or marks it, where the ruleset marks: rs.flagScrapDesign);
// "Name" renames it.
function openTypes() {
  const a = api(), G = a.G, ME = a.ME, p = a.me();
  const live = () => p.designs.filter(d => !d.scrapped);
  if (!live().length) return false;
  let cur = live()[0].id;
  const count = () => { const c = {}; for (const f of G.fleets) if (f.owner === ME) for (const k in f.ships) c[k] = (c[k] || 0) + f.ships[k]; return c; };
  const body = el('div', { class: 'am-types' });
  const render = () => {
    const ds = live(); if (!ds.some(d => d.id === cur)) cur = ds.length ? ds[0].id : null;
    const d = ds.find(x => x.id === cur), n = count();
    const listBox = el('div', { class: 'am-tlist' }, ...ds.map(x => el('div', { class: 'am-ytype' + (x.id === cur ? ' sel' : '') + (x.scrap301 ? ' scrap' : ''), role: 'button', tabindex: 0,
      onclick: () => { cur = x.id; render(); } }, shipCanvas(x), el('div', { class: 'am-ycap' }, `${x.name} (${x.W}/${x.S}) ${className(x.type)}`))));
    const c = d ? HO.designCost(G, d) : null;
    const fig = (k, v) => [el('span', null, k), el('span', null, v)];
    const marks = !!HO.rules(G).flagScrapDesign;
    body.replaceChildren(
      el('div', { class: 'am-tleft' }, frame('am-tlistf', listBox, scroller(listBox, true)),
        frame('am-tcount', el('div', null, w('built', d ? (d.built || 0) : 0)), el('div', null, w('exist', d ? (n[d.id] || 0) : 0)))),
      el('div', { class: 'am-tright' },
        el('div', { class: 'am-tbig' }, d ? shipCanvas(d) : ''),
        frame('am-tfigs', ...(d ? [...fig(w('name'), d.name), ...fig(w('weite'), d.type === 'satellite' ? '0' : String(d.R)),
          ...fig(w('cls'), className(d.type)), ...fig(w('tempo'), String(d.V)),
          ...fig(w('devCost'), cash(c.proto || 0)), ...fig(w('waffen'), String(d.W)),
          ...fig(w('prodCost'), cash(c.money)), ...fig(w('shields2'), String(d.S)),
          ...fig(w('metal'), num(c.metal)), ...fig(w('miniC'), String(d.M))] : []))),
      el('label', { class: 'am-radio am-tscrap' }, el('input', { type: 'checkbox', checked: d && d.scrap301 ? 'checked' : false, disabled: !d || G.over, onchange: (e) => {
        if (!d) return;
        if (marks) { HO.rules(G).flagScrapDesign(G, p, d, 'command'); a.save(); render(); a.renderPanel(); return; }
        e.target.checked = false;
        a.confirmBox(w('scrapAsk', d.name, n[d.id] || 0), () => {
          const m = HO.scrapDesign(G, ME, d.id); a.Sound.play(7003); a.toast(`${d.name}: ${num(m)} ${de() ? 'Metall' : 'metal'}`);
          if (a.UI.selFleet != null && !G.fleets.some(f => f.id === a.UI.selFleet)) a.UI.selFleet = null;
          a.renderPanel(); a.draw(); a.save(); openTypes();
        });
      } }), el('span', null, w('scrapType'))),
      el('div', { class: 'am-tbtns' }, btn(w('ok'), () => a.closeModal()), btn(w('nameBtn'), () => d && renameType(d, render), 'am-default')));
  };
  render();
  amWin(w('typeMgr'), body, 'am-wtypes', { onClose: () => a.save() });
  return true;
}
function renameType(d, done) {
  const a = api();
  const inp = el('input', { value: d.name, maxlength: 15, 'aria-label': w('name') });
  const box = el('div', { class: 'am-rename' }, el('p', null, w('rename', d.name)), inp,
    el('div', { class: 'am-tbtns' }, btn(w('ok'), () => { const v = inp.value.trim(); if (v) d.name = v; a.save(); a.closeModal(); openTypes(); a.renderPanel(); }), btn(w('cancel'), () => { a.closeModal(); openTypes(); })));
  amWin(w('nameBtn'), box, 'am-wsmall');
  inp.focus(); inp.select();
}

// Spielervergleich (18.png): where you stand among the players left, in
// each of nine things: your picture at erster, mittlerer or letzter (a tie
// is mittlerer). Info opens the players window.
function openCompare() {
  const a = api(), G = a.G, ME = a.ME, me = a.me();
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  const ships = (q) => G.fleets.filter(f => f.owner === q.id).reduce((n, f) => n + HO.fleetCount(f), 0);
  const cats = [['cProfit', q => q.lastGross || 0], ['cMetal', q => q.metal], ['cPlanets', q => HO.colonies(G, q.id).length], ['cShips', ships],
    ['range', q => q.tech.range], ['vel', q => q.tech.speed], ['weapons', q => q.tech.weapons], ['cShields', q => q.tech.shields], ['mini', q => q.tech.mini]];
  const rank = (fn) => {
    const mine = fn(me), others = alive.filter(q => q.id !== ME).map(fn);
    if (!others.length) return 0;
    if (others.every(v => mine > v)) return 0;
    if (others.every(v => mine < v)) return 2;
    return 1;
  };
  const icon = P + 'i' + (me.female ? 1500 : 1000);
  const plot = el('div', { class: 'am-cplot' },
    ...[w('first'), w('middle'), w('last')].map((t, i) => el('span', { class: 'am-crank r' + i }, t)),
    ...cats.map(([k, fn], i) => { const r = rank(fn); return el('div', { class: 'am-ccat', style: `--i:${i}` }, el('span', { class: 'am-cpic r' + r }, img(icon)), el('span', { class: 'am-cname' }, w(k))); }));
  const body = el('div', { class: 'am-compare' }, frame('am-cframe', plot),
    el('div', { class: 'am-cbtns' }, btn(w('ok'), () => a.closeModal()), btn(w('info'), () => { a.closeModal(); a.classic('players', a.openPlayers); }, 'am-default')));
  amWin(w('compare', alive.length, G.year), body, 'am-wcompare');
  return true;
}

// Aufteilen der Schiffe (16.png): your fleets at the star, a row each (its
// count and picture). A click picks one ship of a row, a click with Shift
// the whole fleet; Guppieren puts the picked ships together, Vereinzeln
// makes each a fleet of its own; Abbruch puts the fleets back as they were.
// It does what the classic page's Split and Merge do (the engine's
// splitFleet and mergeFleets, with the ruleset's own fuel rules).
function openSplitter(f0) {
  const a = api(), G = a.G, ME = a.ME, sid = f0.star;
  if (sid == null || G.over) return false;
  const mineHere = () => a.fleetOrder(G.fleets.filter(f => f.owner === ME && f.star === sid && f.to == null && !f.sat));
  const snap = JSON.stringify(mineHere()), nextId = G.nextId, sel0 = a.UI.selFleet;
  const pick = new Map(); // fleet id -> ships picked
  const body = el('div', { class: 'am-split' });
  const render = () => {
    const rows = el('div', { class: 'am-srows' });
    for (const f of mineHere()) {
      const n = HO.fleetCount(f), k = pick.get(f.id) || 0, d = HO.fleetDesigns(G, f)[0];
      rows.append(el('div', { class: 'am-srow' + (k ? ' sel' : ''), role: 'button', tabindex: 0, onclick: (e) => {
        const now = pick.get(f.id) || 0;
        pick.set(f.id, e.shiftKey ? (now === n ? 0 : n) : now ? 0 : 1);
        render();
      } }, el('span', { class: 'am-sn' }, k && k < n ? `${k}/${n}` : String(n)), ...HO.fleetDesigns(G, f).slice(0, 4).map(x => shipCanvas(x))));
      void d;
    }
    const keep = rows.scrollTop;
    body.replaceChildren(el('p', null, w('splitHelp1')), el('p', null, w('splitHelp2')), frame('am-sframe', rows),
      el('div', { class: 'am-spbtns' },
        btn(w('ok'), () => a.closeModal()),
        btn(w('group'), group),
        btn(w('single'), single),
        btn(w('cancel'), cancel, 'am-default')));
    rows.scrollTop = keep;
  };
  // the picked ships of a fleet as a fleet of their own (the whole fleet when all are picked)
  const takeOut = (f, k) => {
    if (k >= HO.fleetCount(f)) return f;
    const take = {}; let left = k;
    for (const did of Object.keys(f.ships)) { const m = Math.min(left, f.ships[did]); if (m > 0) { take[did] = m; left -= m; } }
    return HO.splitFleet(G, f, take);
  };
  function group() {
    const fs = mineHere().filter(f => pick.get(f.id));
    if (fs.length < 2 && !(fs.length === 1 && pick.get(fs[0].id) < HO.fleetCount(fs[0]))) {
      // nothing picked to group: every fleet that may join another, as Merge does
      const all = mineHere(); let n = 0;
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (G.fleets.includes(all[i]) && G.fleets.includes(all[j]) && HO.canMerge(G, all[i], all[j])) { HO.mergeFleets(G, all[i], all[j]); n++; }
      if (!n) a.beep();
    } else {
      const parts = fs.map(f => takeOut(f, pick.get(f.id))).filter(Boolean);
      let into = parts[0], n = 0;
      for (const f of parts.slice(1)) if (G.fleets.includes(f) && HO.canMerge(G, into, f)) { HO.mergeFleets(G, into, f); n++; }
      if (!n && parts.length > 1) a.beep();
      a.UI.selFleet = into ? into.id : a.UI.selFleet;
    }
    pick.clear(); render(); a.renderPanel(); a.draw();
  }
  function single() {
    const fs = mineHere().filter(f => pick.get(f.id));
    if (!fs.length) { a.beep(); return; }
    for (const f of fs) {
      let k = pick.get(f.id);
      while (k-- > 0 && G.fleets.includes(f) && HO.fleetCount(f) > 1) {
        const did = Object.keys(f.ships)[0];
        HO.splitFleet(G, f, { [did]: 1 });
      }
    }
    pick.clear(); render(); a.renderPanel(); a.draw();
  }
  function cancel() {
    const back = JSON.parse(snap);
    const at = G.fleets.findIndex(f => f.owner === ME && f.star === sid && f.to == null && !f.sat);
    G.fleets = G.fleets.filter(f => !(f.owner === ME && f.star === sid && f.to == null && !f.sat));
    G.fleets.splice(at < 0 ? G.fleets.length : Math.min(at, G.fleets.length), 0, ...back);
    G.nextId = nextId; a.UI.selFleet = sel0;
    a.closeModal(); a.renderPanel(); a.draw();
  }
  render();
  amWin(w('split'), body, 'am-wsplit', { onClose: () => { a.save(); a.renderPanel(); a.draw(); } });
  return true;
}

// the About window (20.png): the Amiga version's credits
function openAmigaAbout() {
  const a = api();
  const lines = ['Spaceward HO! © by NewWorld Computing in 1992-1994', 'lizensiert durch SOFTGOLD Computerspiele GmbH', '',
    'AMIGA-Umsetzung von Stefan Bebbo Franke, BebboSoft', 'Vorlage von Joe Williams und Peter Commons', 'Grafik von Howard Vives', '',
    'Dank an: Frank, Ilja, Michael, Micky, Olaf und Thomas'];
  const body = el('div', { class: 'am-about' }, el('div', { class: 'am-apic' }, img(P + 'd3520')),
    frame('am-atext', ...lines.map(t => el('p', null, t || ' '))), el('div', { class: 'am-abtns' }, btn(w('ok'), () => a.closeModal(), 'am-dotted')));
  const win = amWin(w('about'), body, 'am-wabout');
  win.querySelector('.wtitle').append(gadget('depth', 'Depth', () => a.closeModal()));
}

// T.window: the Amiga's own windows in place of the classic ones
function skinWindow(name, ...args) {
  if (!game()) return false;
  if (name === 'build') return openShipyard(args[0]);
  if (name === 'types') return openTypes();
  if (name === 'players') return openCompare();
  if (name === 'split') return openSplitter(args[0]);
  return false;
}

// ---------- Neue Galaxis erstellen and Spieler Registration (9.png, 11.png) ----------
// The classic New Game form stays as it is (every setting the rules have);
// for the DOS 2.0 rules its galaxy settings are the Amiga's picture buttons
// and slider, and its player's the Registration window; anything else it
// has is under "Mehr…". Another ruleset shows the whole form.
const PICS = {
  density: { sel: 'd_density', opts: [['dense', 3050, 'Dicht', 'Dense'], ['sparse', 3051, 'Licht', 'Sparse']] },
  shape: { sel: 'd_shape', opts: [['circle', 3020, 'Kreis', 'Circle'], ['random', 3021, 'Zufall', 'Random'], ['ring', 3022, 'Ring', 'Ring'], ['spiral', 3023, 'Spiral', 'Spiral'], ['grid', 3024, 'Gitter', 'Grid']] },
  iq: { sel: 'd_iq', opts: [['dumb', 3030, 'Dumm', 'Dumb'], ['average', 3031, 'Normal', 'Normal'], ['smart', 3032, 'Klug', 'Smart']] },
  size: { sel: 'd_size', opts: [['small', 3040, 'Klein', 'Small'], ['medium', 3041, 'Mittel', 'Medium'], ['large', 3042, 'Groß', 'Large'], ['xl', 3043, 'Sehr Groß', 'Very large'], ['huge', 3044, 'Riesig', 'Huge']] },
};
const SKILLS = [['novice', 'Neuling', 'Novice'], ['beginner', 'Anfänger', 'Beginner'], ['normal', 'Normal', 'Normal'], ['advanced', 'Profi', 'Advanced'], ['expert', 'Experte', 'Expert']];
function newGame(f, ctx) {
  const a = api(), win = f.closest('.win');
  if (!win) return;
  win.classList.add('am-win', 'am-wng');
  const titleSpan = win.querySelector('.wtitle span');
  const field = (n) => f.querySelector(`[name="${n}"]`);
  const fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  const more = el('div', { class: 'am-more' }, ...[...f.childNodes]);
  f.append(more);
  const dosOn = () => { const g = field('d_skill'); const box = g && g.closest('.group'); return !!box && !box.hidden; };
  // the galaxy
  const group = (key, label) => {
    const P2 = PICS[key], sel = field(P2.sel);
    const row = el('div', { class: 'am-ngrow am-ng-' + key, role: 'radiogroup', 'aria-label': label });
    for (const [v, n, deW, enW] of P2.opts) {
      row.append(el('button', { type: 'button', class: 'am-picbtn' + (sel && sel.value === v ? ' on' : ''), role: 'radio', 'aria-checked': sel && sel.value === v ? 'true' : 'false',
        onclick: () => { if (!sel) return; sel.value = v; fire(sel); paint(); } }, img(P + 'i' + n), el('span', null, de() ? deW : enW)));
    }
    return el('div', { class: 'am-nggroup am-g-' + key }, el('div', { class: 'am-nglabel' }, label), row);
  };
  const comp = field('computers');
  const cmax = () => [...comp.options].filter(o => /^\d+$/.test(o.value) && !o.hidden && !o.disabled).reduce((m, o) => Math.max(m, +o.value), 1);
  const cmin = () => [...comp.options].filter(o => /^\d+$/.test(o.value) && !o.hidden && !o.disabled).reduce((m, o) => Math.min(m, +o.value), 99);
  const cnum = el('span', { class: 'am-cnum' });
  const slider = el('input', { type: 'range', class: 'am-slider', min: 1, max: 8, step: 1, 'aria-label': w('computers'),
    oninput: (e) => { comp.value = String(e.target.value); fire(comp); cnum.textContent = comp.value; } });
  const galaxy = el('div', { class: 'am-ngpane am-galaxy' },
    group('density', w('density')), group('shape', w('shape')), group('iq', w('iq')), group('size', w('size')),
    el('div', { class: 'am-nggroup am-g-comp' }, el('div', { class: 'am-nglabel' }, w('computers')), el('div', { class: 'am-comprow' }, cnum,
      el('button', { type: 'button', class: 'am-arrow am-sl', 'aria-label': '−', tabindex: -1, onclick: () => { slider.value = String(Math.max(+slider.min, +slider.value - 1)); slider.dispatchEvent(new Event('input')); } }),
      slider,
      el('button', { type: 'button', class: 'am-arrow am-sr', 'aria-label': '+', tabindex: -1, onclick: () => { slider.value = String(Math.min(+slider.max, +slider.value + 1)); slider.dispatchEvent(new Event('input')); } }))),
    el('div', { class: 'am-ngbtns' },
      btn(w('moreSettings'), () => { win.classList.toggle('am-showmore'); }, 'am-small am-morebtn'),
      btn(w('bang'), () => { if (dosOn()) showReg(); else f.requestSubmit(); }),
      btn(w('cancel'), () => a.closeModal(), 'am-default')));
  // the player
  const skillSel = field('d_skill'), nameIn = field('name'), femSel = field('female');
  const radio = (name, v, label, on, set) => el('label', { class: 'am-radio' }, el('input', { type: 'radio', name: 'am-' + name, value: v, checked: on ? 'checked' : false, onchange: () => set(v) }), el('span', null, label));
  const reg = el('div', { class: 'am-ngpane am-reg', hidden: true });
  const showReg = () => {
    const fem = femSel && femSel.value === '1';
    const nameBox = el('input', { class: 'am-field', value: nameIn ? nameIn.value : '', maxlength: 20, 'aria-label': w('yourName'), oninput: (e) => { if (nameIn) nameIn.value = e.target.value; } });
    reg.replaceChildren(
      frame('am-rskill', el('div', null, w('skill')), ...SKILLS.map(([v, d1, e1]) => radio('skill', v, de() ? d1 : e1, skillSel && skillSel.value === v, (x) => { skillSel.value = x; fire(skillSel); }))),
      frame('am-rname', el('div', null, w('yourName')), nameBox, el('div', null, w('password')), el('input', { class: 'am-field', type: 'password', disabled: 'disabled', 'aria-label': w('password'), title: 'Not used: this remake keeps no passwords.' })),
      frame('am-rsex', el('div', null, w('sex')), el('div', { class: 'am-rsexrow' }, radio('sex', '0', w('man'), !fem, (x) => { if (femSel) { femSel.value = x; fire(femSel); } }), radio('sex', '1', w('woman'), fem, (x) => { if (femSel) { femSel.value = x; fire(femSel); } }))),
      el('div', { class: 'am-rpic' }, img(P + 'd3520')),
      el('div', { class: 'am-rbtns' }, btn(w('ok'), () => f.requestSubmit()), btn(w('cancel'), () => { reg.hidden = true; galaxy.hidden = false; win.classList.remove('am-regstep'); titleSpan.textContent = w('ngTitle'); })));
    galaxy.hidden = true; reg.hidden = false; win.classList.add('am-regstep'); titleSpan.textContent = w('reg');
    nameBox.focus();
  };
  const paint = () => {
    const on = dosOn();
    win.classList.toggle('am-plain', !on);
    galaxy.querySelectorAll('.am-nggroup').forEach(g => { g.hidden = !on; });
    for (const key of Object.keys(PICS)) {
      const sel = field(PICS[key].sel);
      galaxy.querySelectorAll('.am-ng-' + key + ' .am-picbtn').forEach((b, i) => { const v = PICS[key].opts[i][0]; b.classList.toggle('on', !!sel && sel.value === v); b.setAttribute('aria-checked', sel && sel.value === v ? 'true' : 'false'); });
    }
    slider.min = String(cmin()); slider.max = String(cmax());
    const cv = /^\d+$/.test(comp.value) ? +comp.value : 4;
    slider.value = String(cv); cnum.textContent = String(cv);
  };
  f.prepend(galaxy, reg);
  titleSpan.textContent = w('ngTitle');
  f.addEventListener('change', paint);
  paint();
  ctx.refresh();
}

// ---------- the title screen: the Startup window (10.png) ----------
function page(doc) {
  const a = api();
  doc.body.classList.add('amiga');
  // the End Turn picture: the German one in a German game
  Object.defineProperty(TH(), 'endTurnPic', { configurable: true, get: () => (de() ? P + 'd5000' : P + 'endturn') });
  // the screen's title bar and its depth gadget
  const bar = doc.getElementById('menubar');
  bar.append(el('span', { class: 'am-sdepth', 'aria-hidden': 'true' }));
  bar.addEventListener('contextmenu', (e) => { e.preventDefault(); bar.classList.toggle('am-menus'); });
  doc.getElementById('title').addEventListener('click', () => bar.classList.toggle('am-menus'));
  doc.addEventListener('click', (e) => { if (!e.target.closest('#menubar')) bar.classList.remove('am-menus'); });
  const logo = doc.querySelector('#menubar .logo'); if (logo) logo.textContent = 'Ho!';
  // the map in its window: the canvas, its scroll bars
  const wrap = doc.getElementById('mapwrap'), cv = doc.getElementById('map');
  const view = el('div', { id: 'mapview' }); cv.replaceWith(view); view.append(cv);
  mapBars(wrap);
  // the title screen
  const ts = doc.getElementById('titlescreen'), card = ts.querySelector('.tcard');
  const frameC = doc.getElementById('tframe');
  const hasSave = () => { try { return !!localStorage.getItem('ho5.save'); } catch (e) { return false; } };
  const info = frame('am-sinfo', el('p', { class: 'am-s1' }, 'Spaceward Ho! Amiga Version 2.0'), el('p', null, 'Copyright 1992-94 New World Computing Inc.'),
    el('p', { class: 'am-slic' }, el('span', null, 'Lizenz:'), el('span', null, 'Marc & Christoph')), el('p', { class: 'am-slic2' }, 'Airospace'));
  const startup = el('div', { class: 'win am-win am-wstartup', role: 'dialog', 'aria-label': w('startup') },
    el('div', { class: 'wtitle' }, el('span', null, w('startup'))),
    el('div', { class: 'wbody' },
      el('div', { class: 'am-sleft' }, info,
        el('div', { class: 'am-sbtns' },
          btn(w('open'), () => { const c = doc.getElementById('tcont'); if (c && !c.hidden && hasSave()) c.click(); else doc.getElementById('timport').click(); }),
          btn(w('newGame'), () => doc.getElementById('tnew').click()),
          btn(w('cancel'), () => { a.hideTitle(); setTitle(); a.draw(); }, 'am-default am-orange')),
        el('div', { class: 'am-nwc' })),
      el('div', { class: 'am-spic' }, frameC)));
  const scr = el('div', { class: 'am-tscreen' },
    el('div', { class: 'am-tbar' }, el('span', null, w('screen')), el('span', { class: 'am-sdepth', 'aria-hidden': 'true' })),
    el('div', { class: 'am-tback', 'aria-hidden': 'true' }), startup);
  ts.prepend(scr);
  card.classList.add('am-tcard');
  const credit = card.querySelector('.credit');
  if (credit) credit.textContent = 'With the art and sounds of Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD, 1994). Amiga version by Stefan "Bebbo" Franke; pictures by Howard Vives. Type: the X11 Adobe Helvetica bitmaps.';
  const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho!';
  setTitle();
  // the title screen's height changes with its credits: fit the screen again
  new ResizeObserver(() => layout()).observe(card);
  void a;
}
function title(frameC, IMG, Sound) {
  const t = IMG[P + 'd1002'];
  if (!t || !t.width) return false;
  frameC.width = t.width; frameC.height = t.height;
  frameC.getContext('2d').drawImage(t, 0, 0);
  const nwc = document.querySelector('.am-nwc');
  if (nwc && !nwc.firstChild) nwc.append(img(P + 'a538'));
  Sound.play(2000);
  setTitle();
  layout();
  return true;
}

// ---------- menus: the Amiga's German names, its windows, the pixels ----------
function menus(M, ho) {
  const g = de();
  const ren = { Game: g ? 'Projekt' : 'Game', Ships: g ? 'Schiffe' : 'Ships', Galaxy: g ? 'Galaxis' : 'Galaxy', View: g ? 'Ansicht' : 'View', Help: g ? 'Hilfe' : 'Help' };
  const a = () => api();
  M.Ships.push(['-'], [w('split') + '…', () => { const A2 = a(), G = A2.G; if (!G) return; const f = A2.curFleet() || G.fleets.find(x => x.owner === A2.ME && x.star === A2.UI.sel && x.to == null && !x.sat); if (f) openSplitter(f); else A2.toast(de() ? 'Wählen Sie eine Flotte.' : 'Select one of your fleets first.'); }],
    [() => w('typeMgr').replace('Spaceward Ho! ', '') + '…', () => a().G && openTypes()]);
  M.Galaxy.push(['-'], [() => w('compare', '', '').replace(/ von noch.*| the .*/, '').replace('Comparing', 'Compare players') + '…', () => a().G && openCompare()]);
  M.View.push(['-'], [() => w('tech'), () => setTechFront(!techFront()), () => !!game(), () => techFront()],
    [() => w('news'), toggleNews, () => !!game(), () => newsOpen()],
    [w('tall'), () => setPixels(pixMode() === 'tall' ? 'square' : 'tall'), null, () => pixMode() === 'tall']);
  M.Game.splice(1, 0, [de() ? 'Startfenster…' : 'Startup window…', () => { const A2 = a(); if (A2.G) A2.save(); A2.titleScreen(); }]);
  ho.splice(1, 0, [de() ? 'Über Spaceward Ho! Amiga…' : 'About Spaceward Ho! Amiga…', openAmigaAbout]);
  const out = {};
  for (const k of Object.keys(M)) { out[ren[k] || k] = M[k]; delete M[k]; }
  out[w('commands')] = CMDS;
  Object.assign(M, out);
}
// the pixels, with the Skin and OS look pickers
function lookOptions(where) {
  const s = el('select', { class: 'am-pixsel', name: where === 'newgame' ? null : 'pixels', 'aria-label': w('pixels') },
    el('option', { value: 'tall' }, w('tall')), el('option', { value: 'square' }, w('square')));
  s.value = pixMode();
  s.addEventListener('change', (e) => { e.stopPropagation(); setPixels(s.value); });
  return el('label', { class: 'tskin am-look' }, el('span', null, w('pixels')), s);
}

window.HOTHEME_OVER = {
  dir: 'assets/skins/amiga/',
  // the Amiga game is German: New Game starts in German for the rulesets
  // that have it (DOS 2.0 and Mac 2.0.1, js/languages.js); English can be
  // chosen there, and is kept for this skin
  lang: 'de',
  endTurnPic: P + 'd5000', // (a getter from page(): the English copy in an English game)
  endTurnKey: 'Amiga+Z',
  select: null, selectSmall: null, // the selection is drawStar's
  mapBg: '#000', bgStars: false,
  mapPixel: () => [PX.x, PX.y],
  mapFont: () => '16px HoAmiga, sans-serif',
  planetPx: (s) => (s >= BIG ? 32 : 12),
  drawStar, afterDraw: syncMapBars, fitView,
  techBars: 'vertical', barGrid: false,
  panel, afterMsg, window: skinWindow, newGame, menus, lookOptions, page, title,
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
