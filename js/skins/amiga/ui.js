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
// The Amiga program (ho!, a self-unpacking (Imploder-style) 68000 executable, unpacked and
// decompiled: docs/amiga-skin.md) builds its windows from tables in its data
// (each item's kind, text, place and size) and draws its panels and map in
// code; this skin follows those, and the screenshots where the program draws
// with the system's own gadgets. Its type is the game's own fonts, HoFont 13,
// 11 and 9, HoBold 11 and HoCond 9 (assets/fonts/Ho*, tools/amiga-font.py).
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
  at: ['Stationiert auf: %1', 'Stationed at: %1'], dest: ['Zielort: %1 (Entf. %2; Dauer %3)', 'Destination: %1 (dist. %2; %3 turns)'],
  via: ['Unterwegs nach %1 (E %2; D %3) via %4', 'Bound for %1 (d %2; t %3) via %4'], scrapFleet: ['Flotte zum Verschrotten.', 'Fleet to be scrapped.'],
  noFleets: ['Keine Flotten auf diesem Planeten', 'No fleets at this planet'], tank: ['Tank:', 'Fuel:'], speed: ['Tempo:', 'Speed:'],
  full: ['Voll', 'Full'], emptyShip: ['Leer', 'Empty'], scrap: ['Schrott', 'Scrap'],
  metalLeft: ['Metall übrig', 'Metal left'], moneyTotal: ['Geld total', 'Money total'], profitTotal: ['Profit total', 'Profit total'],
  tech: ['Technik Ausgaben', 'Technology'], levels: ['Akt. Stufen', 'Levels'],
  range: ['Weite', 'Range'], vel: ['Tempo', 'Speed'], weapons: ['Waffen', 'Weapons'], shields: ['Schilder', 'Shields'], mini: ['Mini', 'Mini'], radical: ['Radikal', 'Radical'],
  savings: ['Sparen', 'Savings'], techBar: ['Technik', 'Tech'], linear: ['linear', 'linear'], log: ['logar.', 'log'],
  news: ['Nachrichten', 'Messages'], more: ['--mehr--', '--more--'],
  endTurn: ['Zug Ende', 'End turn'],
  title: ['Spaceward Ho! - %1 in %2 im Jahre %3', 'Spaceward Ho! - %1 in %2 in %3'], screen: ['Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Version 2.0'],
  ok: ['Ok', 'OK'], cancel: ['Abbruch', 'Cancel'],
  build: ['Schiffsbau', 'Shipbuilding'], queueAt: ['Auftragsliste bei %1', 'Orders at %1'], types: ['Vorhandene Typen', 'Types'], waiting: ['Auf Warteliste:', 'Waiting:'],
  done: ['%1% fertig', '%1% done'], newType: ['Neuer Typ…', 'New type…'], noShip: ['Keine Schiffsbaugelder: Schf. im Sternfenster.', 'No shipbuilding money: Ship bar in the star panel.'],
  typeMgr: ['Spaceward Ho! Typen Manager', 'Spaceward Ho! Ship Types'], name: ['Name:', 'Name:'], cls: ['Klasse:', 'Class:'], devCost: ['Entw.kosten:', 'Design cost:'],
  prodCost: ['Prod.kosten:', 'Unit cost:'], built: ['# Gebaut: %1', '# Built: %1'], exist: ['# Existent: %1', '# Existing: %1'], scrapType: ['Typ verschrotten', 'Scrap type'],
  nameBtn: ['Name', 'Name'], rename: ['Neuer Name für %1:', 'New name for %1:'], shields2: ['Schilde:', 'Shields:'], weite: ['Weite:', 'Range:'], tempo: ['Tempo:', 'Speed:'], waffen: ['Waffen:', 'Weapons:'], miniC: ['Mini:', 'Mini:'],
  rnHelp1: ['Geben Sie einen neuen Namen ein', 'Type a new name'], rnHelp2: ["oder wählen Sie 'Benennen' an", "or choose 'Name it'"],
  autoName: ['Benennen', 'Name it'], renameTitle: ['Schiff umbenennen', 'Rename ship'],
  noCompare: ['Es gibt keinen Vergleich vor dem Jahre 2010!', 'There is no comparison before 2010!'],
  cWon: ['Sie haben das Spiel im Jahre %1 gewonnen!', 'You won the game in %1!'], cLost: ['Sie haben das Spiel im Jahre %1 verloren!', 'You lost the game in %1!'],
  playerList: ['Liste aller Spieler und ihrer Eigenschaften', 'All the players and their settings'], iqLine: ['Computerintelligenz: %1', 'Computer intelligence: %1'],
  scrapAsk: ['%1 und alle %2 Schiffe dieses Typs verschrotten?', 'Scrap %1 and all %2 ships of that type?'],
  compare: ['Spielervergleich von noch %1 Spielern im Jahre %2', 'Comparing the %1 players left in %2'], first: ['erster', 'first'], middle: ['mittlerer', 'middle'], last: ['letzter', 'last'],
  cProfit: ['Profit', 'Profit'], cMetal: ['Metall', 'Metal'], cPlanets: ['Planeten', 'Planets'], cShips: ['Schiffe', 'Ships'], cShields: ['Schilde', 'Shields'], info: ['Info', 'Info'],
  split: ['Aufteilen der Schiffe', 'Organize ships'], splitHelp1: ['- Stellen Sie die Schiffe beliebig zusammen.', '- Put the ships together as you like.'],
  splitHelp2: ['- Klick mit UMSCHALTEN wählt eine ganze Flotte an.', '- A click with SHIFT picks a whole fleet.'], group: ['Guppieren', 'Group'], single: ['Vereinzeln', 'Split up'],
  about: ['Spaceward Ho!', 'Spaceward Ho!'],
  ngTitle: ['Neue Galaxis erstellen', 'Create a new galaxy'], density: ['Sterndichte:', 'Star density:'], shape: ['Art der Galaxis:', 'Kind of galaxy:'], iq: ['Computerintelligenz:', 'Computer intelligence:'],
  size: ['Größe der Galaxis:', 'Size of the galaxy:'], computers: ['Anzahl der Computerspieler:', 'Number of computer players:'], bang: ['Urknall', 'Big Bang'], moreSettings: ['Mehr…', 'More…'],
  reg: ['Spaceward Ho! Spieler Registration', 'Spaceward Ho! Player Registration'], skill: ['Spielstufe:', 'Skill:'], yourName: ['Ihr Name:', 'Your name:'], password: ['Paßwort:', 'Password:'],
  sex: ['Geschlecht:', 'Sex:'], man: ['Mann', 'Man'], woman: ['Frau', 'Woman'],
  startup: ['Spaceward Ho! Startup', 'Spaceward Ho! Startup'], open: ['Spiel öffnen', 'Open game'], newGame: ['Neues Spiel', 'New game'],
  pixels: ['Pixel', 'Pixels'], tall: ['Amiga monitor (tall pixels)', 'Amiga monitor (tall pixels)'], square: ['Square pixels', 'Square pixels'],
  commands: ['Befehle', 'Orders'], noCommands: ['(keine)', '(none)'],
  credit1: ['Spaceward Ho! Amiga Version 2.0 von Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Version 2.0 by Stefan Bebbo Franke.'],
  credit2: ['Grafiken von Howard Vives.', 'Graphics by Howard Vives.'],
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
// numbers the Amiga's way (ho!, FUN_0010eb24): 51.000, 1.234.567, and from
// ten million on in thousands, 12.345K; the totals' changes in money
// (FUN_0010ec04) in whole thousands or millions, 22K, 3M
const num = (n) => {
  const a = Math.abs(Math.trunc(n)), sg = n < 0 ? '-' : '', sep = de() ? '.' : ',';
  const m = Math.trunc(a / 1e6), k = Math.trunc((a % 1e6) / 1000), u = a % 1000, p3 = (v) => String(v).padStart(3, '0');
  if (m >= 10) return sg + m + sep + p3(k) + 'K';
  if (m) return sg + m + sep + p3(k) + sep + p3(u);
  if (k) return sg + k + sep + p3(u);
  return sg + u;
};
const cash = (n) => (de() ? '$ ' + num(n) : api().money(n));
// "(+ $ 22K)", "(- 889)": strings 90-93
const signed = (n, money) => {
  const a = Math.abs(Math.trunc(n)), s = n < 0 ? '-' : '+';
  if (!money) return `(${s} ${num(a)})`;
  const m = Math.trunc(a / 1e6), k = Math.trunc((a % 1e6) / 1000);
  return `(${s} $ ${m ? m + 'M' : k ? k + 'K' : a})`;
};
// a bar's colour goes with its height (FUN_001110fc): of 50 pixels, the
// colour table at data+0x21bc, pens 4, 11, 7 and 8 for a quarter each
const BAR_PENS = ['#003399', '#3333ff', '#993399', '#cc33ff'];
const barPen = (h) => BAR_PENS[Math.max(0, Math.min(3, Math.floor(Math.max(0, h) * 4 / 51)))];
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
  const cols = bars.map((v, i) => {
    const fill = el('div', { class: 'am-cfill' });
    fill.style.height = Math.max(0, v) / 10 + '%'; fill.style.background = barPen(Math.floor(Math.max(0, v) * 50 / 1000));
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
    cols.forEach((c, j) => { c.firstChild.style.height = Math.max(0, cur[j]) / 10 + '%'; c.firstChild.style.background = barPen(Math.floor(Math.max(0, cur[j]) * 50 / 1000)); });
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
  let m = 0; for (const k in f.ships) { const d = HO.getDesign(G, f.owner, +k); if (d) m += HO.designCost(G, d).metal * f.ships[k]; }
  return Math.floor(m * rate + 1e-9);
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
    const where = fleetWhere(G, f);
    const colony = HO.fleetDesigns(G, f).some(d => d.type === 'colony');
    const third = f.sat ? '' : colony ? (f.colonists > 0 ? w('full') : w('emptyShip')) : `${w('scrap')} ${num(scrapValue(G, f))}`;
    head.append(el('div', null, where),
      el('div', { class: 'am-f3' }, el('span', null, f.sat ? '' : `${w('tank')} ${Math.floor(f.fuel + 1e-9)}/${HO.fleetMaxRange(G, f)}`),
        el('span', null, f.sat ? '' : `${w('speed')} ${HO.fleetSpeed(G, f)}`), el('span', null, third)));
  } else if (sid != null && list.length) head.append(el('div', null, w('at', G.stars[sid].name)), el('div', null, ' '));
  else if (sid != null) head.append(el('div', null, w('noFleets'))); // string 543 (FUN_00106294)
  const rows = el('div', { class: 'am-flist fleets' });
  for (const x of list) {
    const mine = x.owner === ME, inb = x.to != null;
    const t = (mine ? '' : G.players[x.owner].name + ': ') + (inb ? '» ' : '') + fleetLine(G, x) + (mine && x.scrap301 ? ' ✕' : '');
    // a fleet with orders in HoBold 11; a row too long for the panel in HoFont 9 (FUN_00105d5a)
    const moving = mine && (x.to != null || x.dest != null);
    const fit = fits(t, moving ? 'HoBold11' : 'HoFont11', 216) ? '' : ' f9';
    const r = el('div', { class: 'frow am-frow' + (x.id === UI.selFleet ? ' sel' : '') + (mine ? '' : ' enemy') + (moving ? ' moving' : '') + fit, 'data-fleet': x.id, 'data-inbound': inb ? '1' : null,
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
// where the selected fleet is (FUN_00105e9a, strings 544-547): marked for
// scrapping; at a star; bound for its next stop ("Zielort", with the
// distance and the turns there); or with stops after that ("Unterwegs
// nach" the last, "via" the next)
function fleetWhere(G, f) {
  if (f.scrap301) return w('scrapFleet');
  if (f.to == null && f.dest == null) return w('at', G.stars[f.star].name);
  const next = f.to != null ? f.to : f.dest, last = f.path && f.path.length ? f.path[f.path.length - 1] : next;
  const d = f.to != null ? Math.max(0, f.dist - f.prog) : HO.starDist(G, f.star, next);
  const t = Math.max(1, Math.ceil(d / Math.max(1, HO.fleetSpeed(G, f)) - 1e-9));
  return last === next ? w('dest', G.stars[next].name, Math.round(d), t) : w('via', G.stars[last].name, Math.round(d), t, G.stars[next].name);
}
// whether a text fits a width in Amiga pixels in one of the fonts (as TextLength)
let MEASURE = null;
function fits(t, fam, width) {
  MEASURE = MEASURE || document.createElement('canvas').getContext('2d');
  MEASURE.font = `16px ${fam}, sans-serif`;
  return MEASURE.measureText(t).width <= width;
}
// a ship's caption: HoFont 11, else 9, else HoCond 9, whichever fits (FUN_001214e2)
const capFont = (t, width) => (fits(t, 'HoFont11', width) ? 'f11' : fits(t, 'HoFont9', width) ? 'f9' : 'fc9');
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
  for (const r of tb.querySelectorAll('.barrow')) {
    const key = r.dataset.help, l = r.querySelector('.blabel');
    if (KEYS[key]) l.textContent = w(KEYS[key]);
  }
  // each bar coloured by its height, again as it is dragged
  const pens = () => { for (const f of tb.querySelectorAll('.fill')) f.style.setProperty('background', barPen(Math.round((parseFloat(f.style.height) || 0) / 100 * 50)), 'important'); };
  pens(); for (const ev of ['pointermove', 'pointerup', 'keyup']) tb.addEventListener(ev, pens);
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
// The Amiga's map (ho!, FUN_00104ade, one star; FUN_001048de, the stars in
// view) has four zooms: 6, 9, 12 and 17 pixels to the light year (the menu's
// Vergrößern and Verkleinern step through them, FUN_00123138 and
// FUN_001231e4); a new player's preferences start at 17 (FUN_00100c60 sets
// the view's +0x26 to 0x11, as THE_HO!.PRF on the disk has it). What a star
// shows depends on the zoom alone, explored or not:
// - 6: an open circle in pen 0 (the grey, #bbbbbb), DrawEllipse 4 x 3 (9 x 7
//   pixels); the selected star first gets one in pen 10 (green), 6 x 5. No
//   names, no fleets, no satellites.
// - 9 and 12: the star's 16 x 16 picture (the player's view of it: the same
//   pictures as DOS, 86 records after the 32 x 32 ones), the selected star's
//   green ring (picture 242, DOS 501) 5 pixels up and left of it; your fleets'
//   marker (picture 531, DOS 3114) 12 right of it and 6 up; satellites a
//   white circle (pen 14) of radius 8 round its middle; the name in white,
//   HoFont 9, centred under it.
// - 17: the same with the 32 x 32 picture, the spiked ring (239, DOS 500) 12
//   left and 9 up of it, the marker 28 right, the circle of radius 16 and the
//   name in HoFont 11.
// The remake's map has 2 light years to its unit (LY_PER_UNIT in the rulesets).
const LY = 2, ZOOMS = [6, 9, 12, 17].map(z => z * LY);
const zoomIdx = (s) => { let b = 0; ZOOMS.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(ZOOMS[b] / s))) b = i; }); return b; };
// a wheel turn or a menu steps a zoom; a pinch goes to the zoom nearest its factor
function zoomTo(s, f) {
  const cur = zoomIdx(s);
  let i = zoomIdx(s * f);
  if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1);
  return ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i))];
}
const zoomOf = (view) => ZOOMS[zoomIdx(view.s)] / LY; // 6, 9, 12 or 17
// DrawEllipse's pixels (graphics.library's midpoint ellipse), as sprites
function ellipse(a, b, colour) {
  const c = document.createElement('canvas'); c.width = 2 * a + 1; c.height = 2 * b + 1;
  const x = c.getContext('2d'); x.fillStyle = colour;
  const put = (i, j) => { for (const [p, q] of [[i, j], [-i, j], [i, -j], [-i, -j]]) x.fillRect(a + p, b + q, 1, 1); };
  // the outline: for each column the rows it crosses, and for each row the columns
  for (let i = 0; i <= a; i++) { const j = Math.round(b * Math.sqrt(Math.max(0, 1 - (i * i) / (a * a)))); put(i, j); }
  for (let j = 0; j <= b; j++) { const i = Math.round(a * Math.sqrt(Math.max(0, 1 - (j * j) / (b * b)))); put(i, j); }
  return c;
}
function sprite(rows, colour) {
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d'); x.fillStyle = colour;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, j, 1, 1); });
  return c;
}
// (the 4 x 3 and 6 x 5 ellipses as the screenshots show them)
const CIRCLE = ['..#####..', '.#.....#.', '#.......#', '#.......#', '#.......#', '.#.....#.', '..#####..'];
const RING = ['....#####....', '..##.....##..', '.#.........#.', '.#.........#.', '#...........#', '#...........#', '#...........#', '.#.........#.', '.#.........#.', '..##.....##..', '....#####....'];
let SPR = null;
const sprites = () => SPR || (SPR = { circle: sprite(CIRCLE, '#bbbbbb'), ring: sprite(RING, '#33ff33'), sat16: ellipse(16, 16, '#ffffff'), sat8: ellipse(8, 8, '#ffffff') });
const smallPic = (name) => name && name.replace(/^dos:i(\d+)$/, 'dos:s$1');
function drawStar(cx, o) {
  const { s, x, y, look, sel, IMG, view, G, ME } = o;
  const X = Math.round(x), Y = Math.round(y), z = zoomOf(view), S = sprites();
  cx.imageSmoothingEnabled = false;
  if (z <= 6) {
    if (sel) cx.drawImage(S.ring, X - 6, Y - 5);
    cx.drawImage(S.circle, X - 4, Y - 3);
    return true;
  }
  const big = z === 17, n = big ? 32 : 16, L = X - n / 2, T0 = Y - n / 2;
  const ring = sel && IMG[P + (big ? 'd500' : 'd501')];
  if (ring) cx.drawImage(ring, L - (big ? 12 : 5), T0 - (big ? 9 : 5));
  const im = look.pic || IMG[big ? look.base : smallPic(look.base)] || IMG[look.base];
  if (im) cx.drawImage(im, L, T0, n, n);
  // satellites (yours, or anyone's you can see there): the white circle
  if (G.fleets.some(f => f.star === s.id && f.sat && f.to == null && (f.owner === ME || visibleAt(G, ME, s.id)))) cx.drawImage(big ? S.sat16 : S.sat8, X - n / 2, Y - n / 2);
  cx.font = big ? '16px HoFont11, sans-serif' : '16px HoFont9, sans-serif';
  cx.textAlign = 'left'; cx.textBaseline = 'alphabetic'; cx.fillStyle = '#ffffff';
  const len = Math.round(cx.measureText(s.name).width);
  cx.fillText(s.name, X - (len >> 1), T0 + n + (big ? 9 : 7));
  return true;
}
// your fleets at a star: the one marker, where the Amiga puts it (T.markerAt);
// at the far zoom none is drawn, but a drag can still pick the fleets up there
function markerAt(f, { x, y, view }) {
  const z = zoomOf(view), X = Math.round(x), Y = Math.round(y);
  if (z <= 6) return { x: X - 4, y: Y - 3, w: 9, hidden: true };
  const big = z === 17, n = big ? 32 : 16;
  return { x: X - n / 2 + (big ? 28 : 12), y: Y - n / 2 - 6, w: 16 };
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
// the first view: the Amiga's starting zoom, 17 pixels to the light year,
// on your home star (or the selected one)
function fitView(v, { G, ME, mapW, mapH, sel }) {
  const st = G.stars[sel != null ? sel : G.players[ME].homeStar];
  v.s = ZOOMS[3];
  if (st) { v.ox = mapW / 2 - st.x * v.s; v.oy = mapH / 2 - st.y * v.s; }
}

// ---------- the reports: the card, and the Nachrichten window ----------
const NEWSKEY = 'ho5.amiga.news';
// (open unless closed; on a phone, where it would hide the small map, closed unless opened)
const newsOpen = () => { const v = LS.get(NEWSKEY); return v == null ? !PX.phone : v !== '0'; };
// The first two reports credit the version: the Amiga's own (texte.pff,
// strings 569 and 570, as the Amiga game writes them for a new player), in
// place of the ruleset's (DOS 2.0: "Spaceward Ho! Version 2.0.1 von Peter
// Commons."), as each skin's title credit follows the skin.
function amigaSay(G, m) {
  const t = m && m.text;
  if (typeof t === 'string' && /^Spaceward Ho!.* by Peter Commons\.$/.test(t)) return w('credit1');
  if (t === 'Artwork by Howard Vives.') return w('credit2');
  return HO.say(G, m.text);
}
function afterMsg(box, ctx) {
  const card = box.querySelector('.card'), clock = box.querySelector('.clock');
  const m = ctx.inbox && ctx.inbox[ctx.idx];
  if (card && m) { const p = card.querySelector('.mtext p'), t = amigaSay(ctx.G, m); if (p && t !== HO.say(ctx.G, m.text)) p.textContent = t; }
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
    } }, img(newsIcon(m), 'am-nicon'), el('p', null, amigaSay(G, m))));
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

// Schiffsbau (13.png; ho! FUN_00120e12, table data+0x2afa, the one for a
// screen 256 to 399 lines high): the colony's orders. The big picture is the
// ship being built (the first order's type), its cost ("[P]" with the
// prototype) and how much of it is paid; "Auf Warteliste" shows the orders,
// a slot each (type and count), two on this screen. A click on a type
// (FUN_00121612) adds one ship to the first slot of that type, or fills the
// first empty slot, or beeps; a click on a slot (FUN_001216f4) takes one
// ship off it, and its last ship takes the order away (the first order's
// part-payment with it); the big picture takes no clicks. Ok keeps the
// orders, Abbruch takes back this window's. The classic window (the
// designer) opens from "Neuer Typ…".
function openShipyard(sid) {
  const a = api(), G = a.G, ME = a.ME, p = a.me(), s = G.stars[sid];
  if (!HO.feature(G, 'buildQueue') || G.over) return false;
  const before = JSON.stringify(s.queue || []), yard0 = s.yard, yardDid0 = s.yardDid;
  const slots = Math.min(2, HO.rules(G).queueSlots || 3); // the Amiga's two slots on a 256-line screen
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
      el('div', { class: 'am-ybig', title: first ? first.name : '' }, first ? shipCanvas(first) : ''),
      el('div', { class: 'am-ycost' }, el('span', null, cost ? `${cash(cost.money)}${cost.proto ? ' [P]' : ''}` : ''), el('span', null, pr ? w('done', pr.pct) : '')),
      el('div', { class: 'am-ywait' }, el('span', { class: 'am-ywl' }, w('waiting')),
        el('div', { class: 'am-yslots' }, ...Array.from({ length: slots }, (_, i) => {
          // slot i is order i
          const it = q[i], d = it && HO.getDesign(G, ME, it.did), cap = d ? `${countWord(it.n)} ${d.name} (${d.W}/${d.S}) ${className(d.type)}` : '';
          return el('div', { class: 'am-yslot', role: 'button', tabindex: 0, onclick: () => { if (it) { HO.unqueueShip(G, ME, sid, i); render(); a.renderPanel(); } else a.beep(); } },
            d ? shipCanvas(d) : '', d ? el('div', { class: 'am-ycap ' + capFont(cap, 120) }, cap) : '');
        }))),
      (s.ship || 0) > 0 || !q.length ? null : el('p', { class: 'am-ynote' }, w('noShip')));
    const listBox = el('div', { class: 'am-ytypes' });
    for (const d of p.designs.filter(x => !x.scrapped && types.includes(x.type))) {
      const cap = `${d.name} (${d.W}/${d.S}) ${className(d.type)}`;
      listBox.append(el('div', { class: 'am-ytype' + (sel === d.id ? ' sel' : '') + (d.scrap301 ? ' scrap' : ''), role: 'button', tabindex: 0,
        onclick: () => {
          sel = d.id;
          const q = s.queue || [], open = q.slice(0, slots).some(x => x.did === d.id) || q.length < slots;
          if (!d.scrap301 && open && HO.queueShips(G, ME, sid, d.id, 1)) a.Sound.play(7006); else a.beep();
          render(); a.renderPanel(); a.draw();
        } }, shipCanvas(d), el('div', { class: 'am-ycap ' + capFont(cap, 120) }, cap)));
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
      onclick: () => { cur = x.id; render(); } }, shipCanvas(x), el('div', { class: 'am-ycap ' + capFont(`${x.name} (${x.W}/${x.S}) ${className(x.type)}`, 120) }, `${x.name} (${x.W}/${x.S}) ${className(x.type)}`))));
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
        // the Amiga's is a toggle that marks the type for the end of the turn
        // (FUN_00122412 sets the design's +0x26); a ruleset that scraps a type
        // when ordered (DOS 2.0 here) asks first, as that can't be taken back
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
// "Name" (FUN_00122474): the "Schiff umbenennen" window (table data+0x2fd4,
// 250 x 162): a new name typed in, or "Benennen" for one the game makes up
// (FUN_00123126, the type's next name, here the ruleset's designName); Ok
// keeps it, Abbruch doesn't.
function renameType(d) {
  const a = api(), G = a.G, p = a.me();
  const inp = el('input', { class: 'am-field am-rnfield', value: d.name, maxlength: 14, 'aria-label': w('name') });
  const back = () => { a.closeModal(); openTypes(); };
  const box = el('div', { class: 'am-rename' }, el('p', { class: 'am-rn1' }, w('rnHelp1')), el('p', { class: 'am-rn2' }, w('rnHelp2')), inp,
    el('div', { class: 'am-rnbtns' },
      btn(w('ok'), () => { const v = inp.value.trim(); if (v) d.name = v; a.save(); back(); a.renderPanel(); }),
      btn(w('autoName'), () => { inp.value = HO.designName(G, p, d.type); inp.focus(); }),
      btn(w('cancel'), back)));
  amWin(w('renameTitle'), box, 'am-wrename');
  inp.focus(); inp.select();
}

// Spielervergleich (18.png; ho! FUN_00123c0e, table data+0x35c2): for each
// of nine figures (the turn's record: Profit total, Metall übrig, planets,
// ships, the five tech levels) a score of 10 for each other player ahead of
// you and 5 for each level with you; your picture goes down from "erster"
// by score / (10 x (players - 1)) of the way to "letzter" (a tie with
// everyone is the middle). None in 2000 ("Es gibt keinen Vergleich vor dem
// Jahre 2010!"), nor for a player out of the game ("Sie haben das Spiel im
// Jahre ... gewonnen/verloren!"). Info (gadget 2) opens the players' list.
function openCompare() {
  const a = api(), G = a.G, ME = a.ME, me = a.me();
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  const ships = (q) => G.fleets.filter(f => f.owner === q.id).reduce((n, f) => n + HO.fleetCount(f), 0);
  const cats = [['cProfit', q => HO.projected(G, q).income], ['cMetal', q => q.metal], ['cPlanets', q => HO.colonies(G, q.id).length], ['cShips', ships],
    ['range', q => q.tech.range], ['vel', q => q.tech.speed], ['weapons', q => q.tech.weapons], ['cShields', q => q.tech.shields], ['mini', q => q.tech.mini]];
  const others = alive.filter(q => q.id !== ME);
  const place = (fn) => {
    if (!others.length) return 0;
    const v = fn(me); let sc = 0;
    for (const q of others) { const u = fn(q); if (v < u) sc += 10; else if (v === u) sc += 5; }
    return sc / (10 * others.length);
  };
  const icon = P + 'i' + (me.female ? 1500 : 1000);
  const over = G.over || !me.alive || me.surrendered;
  const title = G.year <= 2000 ? w('noCompare') : over ? w(me.alive && !me.surrendered ? 'cWon' : 'cLost', G.year) : w('compare', alive.length, G.year);
  const plot = G.year <= 2000 || over ? el('div', { class: 'am-cplot am-cnone' }) : el('div', { class: 'am-cplot' },
    ...[w('first'), w('middle'), w('last')].map((t, i) => el('span', { class: 'am-crank r' + i }, t)),
    ...cats.map(([k, fn], i) => el('div', { class: 'am-ccat', style: `--i:${i}` }, el('span', { class: 'am-cpic', style: `--y:${place(fn)}` }, img(icon)), el('span', { class: 'am-cname' }, w(k)))));
  const body = el('div', { class: 'am-compare' }, frame('am-cframe', plot),
    el('div', { class: 'am-cbtns' }, btn(w('ok'), () => a.closeModal()), btn(w('info'), () => { a.closeModal(); openPlayerList(); }, 'am-default')));
  amWin(title, body, 'am-wcompare');
  return true;
}
// "Liste aller Spieler und ihrer Eigenschaften" (FUN_00123a8c, table
// data+0x34ea, 360 x 182): each player with the skill level (Neuling to
// Profi, strings 76-79), and under the list "Computerintelligenz: ..."
function openPlayerList() {
  const a = api(), G = a.G;
  const SK = { novice: 0, beginner: 1, normal: 2, advanced: 3, expert: 4 };
  const IQ = { dumb: ['Dumm', 'Dumb'], average: ['Normal', 'Normal'], smart: ['Klug', 'Smart'] };
  const rows = el('div', { class: 'am-plrows' }, ...G.players.map(q => {
    const k = SKILLS[SK[q.skill] != null ? SK[q.skill] : 2];
    return el('div', { class: 'am-plrow' }, el('span', null, q.name), el('span', null, de() ? k[1] : k[2]));
  }));
  const iq = IQ[G.opts.iq] || IQ.average;
  const body = el('div', { class: 'am-plist2' }, frame('am-plframe', rows, scroller(rows, true)),
    el('p', { class: 'am-pliq' }, w('iqLine', de() ? iq[0] : iq[1])),
    el('div', { class: 'am-plbtns' }, btn(w('ok'), () => { a.closeModal(); openCompare(); }, 'am-default')));
  amWin(w('playerList'), body, 'am-wplist');
}

// Aufteilen der Schiffe (16.png; ho! FUN_001229ea, table data+0x326e): the
// ships of ONE type at this star, the selected fleet's, in a grid of 4 x 2
// cells (145 x 41 pixels, filled down then across), a cell a fleet: its
// count and the ship's picture; an eighth fleet and more go into the last
// cell. A drag from one cell to another moves one ship, with Shift the whole
// cell (FUN_001227fe, FUN_00122748; a finger: a long press first takes the
// whole cell, the remake's stand-in for Shift). Guppieren puts every ship in
// the first cell (FUN_00122950), Vereinzeln one in each of the first seven
// and the rest in the last (FUN_0012298a). Ok makes the cells the fleets
// (the Amiga's: the lowest fuel and no orders, as merging fleets gives
// here: the engine's mergeFleets and splitFleet with the ruleset's rules);
// Abbruch changes nothing.
function openSplitter(f0) {
  const a = api(), G = a.G, ME = a.ME, sid = f0.star;
  if (sid == null || G.over || f0.to != null) return false;
  const did0 = +Object.keys(f0.ships)[0];
  const only = (f) => Object.keys(f.ships).length === 1 && +Object.keys(f.ships)[0] === did0;
  if (!only(f0)) return a.classic('split', a.openSplit, f0); // a fleet of several types: the classic window
  const fleets = a.fleetOrder(G.fleets.filter(f => f.owner === ME && f.star === sid && f.to == null && !f.sat && only(f)));
  const d = HO.getDesign(G, ME, did0);
  const N = 8, cells = new Array(N).fill(0);
  fleets.forEach((f, i) => { cells[Math.min(i, N - 1)] += HO.fleetCount(f); });
  const start = cells.slice();
  const body = el('div', { class: 'am-split' });
  const grid = el('div', { class: 'am-sgrid' });
  const paint = () => {
    grid.replaceChildren(...cells.map((n, i) => el('div', { class: 'am-scell', 'data-i': i, style: `--c:${Math.floor(i / 2)};--r:${i % 2}` },
      n ? el('span', { class: 'am-sn' }, num(n)) : null, n ? shipCanvas(d) : null)));
  };
  // a drag: one ship, or the whole cell with Shift (or after a long press)
  let drag = null;
  const cellAt = (x, y) => { const e = document.elementFromPoint(x, y); const c = e && e.closest('.am-scell'); return c && grid.contains(c) ? +c.dataset.i : -1; };
  grid.addEventListener('pointerdown', (e) => {
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0 || !cells[i]) return;
    e.preventDefault(); grid.setPointerCapture(e.pointerId);
    drag = { i, all: e.shiftKey, t: setTimeout(() => { if (drag) { drag.all = true; grid.classList.add('am-sall'); } }, 500) };
    grid.children[i].classList.add('am-sfrom');
  });
  grid.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const j = cellAt(e.clientX, e.clientY);
    for (const c of grid.children) c.classList.toggle('am-sto', +c.dataset.i === j && j !== drag.i);
  });
  const end = (e, ok) => {
    if (!drag) return;
    clearTimeout(drag.t); grid.classList.remove('am-sall');
    const j = ok ? cellAt(e.clientX, e.clientY) : -1, i = drag.i, all = drag.all || e.shiftKey;
    drag = null;
    if (j >= 0 && j !== i && cells[i]) { const k = all ? cells[i] : 1; cells[j] += k; cells[i] -= k; }
    paint();
  };
  grid.addEventListener('pointerup', (e) => end(e, true));
  grid.addEventListener('pointercancel', (e) => end(e, false));
  const group = () => { const t = cells.reduce((x, y) => x + y, 0); cells.fill(0); cells[0] = t; paint(); };
  const single = () => { let t = cells.reduce((x, y) => x + y, 0); for (let i = 0; i < N; i++) { const k = i < N - 1 ? Math.min(1, t) : t; cells[i] = k; t -= k; } paint(); };
  const ok = () => {
    const want = cells.filter(n => n > 0);
    if (JSON.stringify(cells) !== JSON.stringify(start) && fleets.length && G.fleets.includes(fleets[0])) {
      // one fleet of them all, then a fleet split off for each cell after the first
      const into = fleets[0];
      for (const f of fleets.slice(1)) if (G.fleets.includes(f)) HO.mergeFleets(G, into, f);
      for (const n of want.slice(1)) if (HO.fleetCount(into) > n) HO.splitFleet(G, into, { [did0]: n });
      a.UI.selFleet = into.id;
    }
    a.closeModal(); a.save(); a.renderPanel(); a.draw();
  };
  paint();
  body.append(el('p', null, w('splitHelp1')), el('p', null, w('splitHelp2')), frame('am-sframe', grid),
    el('div', { class: 'am-spbtns' }, btn(w('ok'), ok), btn(w('group'), group), btn(w('single'), single), btn(w('cancel'), () => a.closeModal(), 'am-default')));
  amWin(w('split'), body, 'am-wsplit', { onClose: () => { a.renderPanel(); a.draw(); } });
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
  // a tap (or click) on the bar itself, not on a menu, shows or hides the menus
  bar.addEventListener('click', (e) => { if (e.target === bar || e.target.id === 'title' || e.target.classList.contains('am-sdepth')) bar.classList.toggle('am-menus'); });
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
  if (credit) credit.textContent = 'With the art and sounds of Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD, 1994). Amiga version by Stefan "Bebbo" Franke; pictures by Howard Vives. Type: the Amiga game\'s own fonts.';
  const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho!';
  setTitle();
  // the panels measure their texts in the Amiga's fonts: again once they are loaded
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { const A = api(); if (A && A.G) { A.renderPanel(); A.draw(); } });
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
  M.Galaxy.push(['-'], [() => (de() ? 'Spielervergleich…' : 'Compare players…'), () => a().G && openCompare()]);
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
  mapFont: () => '16px HoFont11, sans-serif',
  planetPx: (s) => [9, 16, 16, 32][zoomIdx(s)],
  drawStar, markerAt, ownRings: true, zoomTo, afterDraw: syncMapBars, fitView,
  techBars: 'vertical', barGrid: false,
  panel, afterMsg, window: skinWindow, newGame, menus, lookOptions, page, title,
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
