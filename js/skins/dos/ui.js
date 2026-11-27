// Spaceward Ho! web remake — the DOS 2.0 skin (see js/skins.js)
//
// The 1993 DOS version's art, sounds and Windows-3.1-style look on top of
// the classic skin's page: this file only says which of the DOS pictures
// and sounds to use where (window.HOTHEME, read by js/skins/classic/ui.js),
// then loads the classic skin. The pictures and sounds come from the DOS
// game's HOCOLOR.PRS and HO.PRS (tools/extract/dos.py). Where they go is
// read from the Windows 3.1 build of the same game (WINHO.EXE; the
// function names below are from its decompile). Anything the DOS game has
// no picture for (the Original rules' extra ship types, …) is drawn as in
// the classic skin.
//
// The DOS pictures are 256-colour icons: a planet's picture already
// includes its owner's hat or face, so there is no separate hat.
(function () {
'use strict';
const P = 'dos:';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---- Stand-ins (window.HOFILL, for this skin and those built on it) ----
// A picture this skin's version hasn't got comes from the nearest later
// version that has it, filtered to look like this one
// (tools/skins/fill_art.py), in the skin's sprites/fill/ as
// <version>-<name> (fill/mac4-p2263 is 4.0.5's p2263). A skin has at most
// one stand-in for each name, so the order of VERSIONS doesn't matter.
const VERSIONS = ['mac12', 'mac2', 'mac2c', 'mac3', 'mac3c', 'mac4', 'mac4c', 'w95', 'classic'];
const fillNames = (name) => VERSIONS.map(v => 'fill/' + v + '-' + name);
// the skin's own picture (P + name), else its stand-in, else null
function fillPic(IMG, name) {
  for (const n of [name].concat(fillNames(name))) if (IMG[P + n]) return P + n;
  return null;
}
// 3.0.1's report pictures (GetIconID @161216: by report template, STR# 1000),
// matched by the text: an icon number, 'own' (your own planet) or null.
// 3161 (the scroll) is for chat. (js/skins/mac3 shows these in 3.0.1.)
const ICONS301 = [
  [/Radical researchers|mining consortium|weather patterns|ship technicians|black and white to colou?r|hardware problems|already are running in colou?r/, 3105],
  [/not receiving sufficient funds|not spending any money on (technology|research)|Ship money is being used|no money to spend|borrow more ship money|enough money! You.re neglecting/, 4013],
  [/never become profitable|computer bug/, 3112],
  [/baby boom/i, 4017],
  [/meteor shower|shock wave from the supernova/, 4015],
  [/gone supernova|armageddon!|armageddon device was activated|half of the stars/i, 3118],
  [/has offered to ally|You have offered to ally/, 3164],
  [/no longer wants? to ally/, 3163],
  [/formed an alliance|alliance with .* is gone/, 3160],
  [/energy emanating/, 3119],
  [/given you \$|You just gave .* \$/, 3110],
  [/given you [\d,]+ metal|You just gave .* metal|archaeologists/, 3162],
  [/has just surrendered/, 4016],
  [/climatologists/, 1001],
  [/generals are now smarter/, 3142],
];
function look301(m, t) {
  for (const [re, n] of ICONS301) if (re.test(t)) return n;
  if (/^You have just surrendered|^You have abandoned|has revolted|people have revolted|sociologists|spies have stolen|alliance will win/.test(t)) return 'own';
  if (m.chat) return 3161;
  return null;
}
// 4.0.5's, for reports 3.0.1 has no picture for (js/skins/mac4/ui.js
// messageLook): an icon number or 'own'
const ICONS405 = [
  [/population now exceeds/, 4024], [/suggests a big battle/, 3119], [/has eaten .* people/, 4011],
  [/waiting to refuel|wormhole/, 4011], [/armageddon device is on|activated the armageddon/i, 'own'],
  [/\b(allies|ally|buddies|buddy)\b/i, 3160],
];
function look405(m, t) {
  if (m.hint) return 3170;
  for (const [re, n] of ICONS405) if (re.test(t)) return n;
  if (/money|metal/i.test(t) && /gave|given|offers/.test(t)) return 3110;
  return null;
}
// 2.0's report templates (and 1.2's, line for line: HO.REPORTS20, from
// js/languages.js): a report one of them makes is one the 2.0 skins have
let RE20 = null;
function is20Report(t) {
  if (!RE20) {
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    RE20 = (HO.REPORTS20 || []).map(s => new RegExp('^' + s.split(/(%(?:\.\*|\d*\.?\d*)?[sd]|%%)/).map((x, j) => j % 2 ? (x === '%%' ? '%' : '(.*?)') : esc(x)).join('')));
  }
  return RE20.some(re => re.test(t));
}
// The picture for a report this skin's version never had (a later
// version's rules): the nearest version's that has one, 3.0.1's, then
// 4.0.5's, then 5.0.5's own (cur.icon, classic's choice) as a stand-in;
// null when none has (the skin's own fallback stands).
function laterReportPic(m, t, cur, IMG) {
  if (is20Report(t)) return null;
  for (const n of [look301(m, t), look405(m, t)]) {
    if (n === 'own') return null;
    const k = n && fillPic(IMG, 'i' + n);
    if (k) return k;
  }
  return (cur && /^m9\d\d\d$/.test(cur.icon || '') && fillPic(IMG, cur.icon)) || null;
}
// A whole-ship stand-in (a 120x40 Dreadnought or Biological), twice the
// size, on a canvas h high with the skin's ship background (bg, or none)
function wholeShip(im, h, bg) {
  const c = document.createElement('canvas'); c.width = im.width * 2; c.height = Math.max(h, im.height * 2);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); }
  x.drawImage(im, 0, (c.height - im.height * 2) / 2, im.width * 2, im.height * 2);
  return c;
}
// a part's background colour (its corner pixel), or null when see-through
function partBg(im) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = x.getImageData(0, 0, 1, 1).data;
    return a > 200 ? `rgb(${r},${g},${b})` : null;
  } catch (e) { return null; }
}
const IMGS = () => (window.HOAPI && window.HOAPI.IMG) || {};
window.HOFILL = { names: fillNames, pic: fillPic, look301, look405, is20Report, laterReportPic, wholeShip, partBg };

window.HOTHEME = {
  dir: 'assets/skins/dos/',
  prefix: P,
  // its sounds: SOUNDS.dos in js/skins.js
  // DOS pictures shown in place of the Mac ones
  images: Object.assign({
    debris: fillNames('debris'), nova18: fillNames('nova18'), // stand-ins (5.0.5's, filtered)
    p3030: 'd5040', p3040: 'd5050', // won, eliminated (alert pictures 5040/5050)
    white0_0: 'i1000', white0_1: 'i1500', // you, in the Players window
  }, faces()),
  // The selected planet gets the green ring, DIB 500 with big icons and
  // 501 with small ones (FUN_1088_0fb5).
  select: P + 'd500', selectSmall: P + 'd501',
  satRing: '#ffffff', // a planet with your satellites gets a white circle
  // Fleets (FUN_1068_0288): only your own fleets sitting at a star are
  // marked, all with the same little icon 3114; satellites only get the
  // ring. (The game draws nothing for fleets in flight; this remake keeps
  // the icon on them so they can still be picked out.)
  marker: (f, mine) => (mine && !f.sat ? P + 's3114' : null),
  endTurnPic: P + 'd5000', // English; the other languages' own: German is the German DOS 2.0's (d5000-de), the rest drawn in its lettering (tools/skins/endturn_langs.py)
  endTurnPics: { de: P + 'd5000-de', fr: P + 'd5000-fr', tr: P + 'd5000-tr', es: P + 'd5000-es' },
  // pressed (FUN_2000_9b03: on the press the program draws picture 5001, 5501 in German, and holds the mouse until it is let go); the drawn languages have none
  endTurnPicDown: P + 'd5001', endTurnPicsDown: { de: P + 'd5001-de' },
  // the program's End Turn button stays on the map while the report bubble is up (Jake's image0012, 0015, 0182): the classic page leaves its button
  // out while a report card shows, so the skin puts the same button at its place then (as the Windows 95 skin's extraClock)
  afterMsg(box) {
    if (!box || !frameOn() || winOn()) return;
    const want = box.querySelector('.card:not(.end):not(.waiting)') && !box.querySelector('.clock'); if (!want) return;
    const a = window.HOAPI, L = (window.HOUI && HOUI.lang) || 'en', up = a.IMG[(this.endTurnPics || {})[L] || this.endTurnPic], dn = a.IMG[(this.endTurnPicsDown || {})[L] || this.endTurnPicDown]; if (!up || !up.src) return;
    const btn = a.el('button', { class: 'clock pic dd-extraclock', 'aria-label': 'End turn', onclick: (e) => { e.stopPropagation(); a.doEndTurn(); } }), im = a.el('img', { src: up.src, alt: '' }); btn.append(im);
    if (dn && dn.src && L === 'en' || (dn && L === 'de')) { btn.addEventListener('pointerdown', () => { im.src = dn.src; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, () => { im.src = up.src; })); }
    box.prepend(btn);
  },
  battlePlanet: P + 'i1004', // the planet in a battle: the DOS game's own plain planet (as the Mac skins built on this one)
  // stand-ins: an ally's halo over the planet (3.0.1's), the rank pictures
  allyPic: (IMG, small) => { const n = small ? 'p507' : 'p506', k = fillNames(n).map(x => P + x).find(x => IMG[x]); return k ? IMG[k] : null; }, // (always a stand-in: a skin's own is made see-through round the halo)
  explore: (i) => fillNames('rank' + String(i + 1).padStart(2, '0')),
  cascadeReports: true, // a later version's reports get the nearest later picture (laterReportPic)
  endTurnKey: 'Ctrl+T', // as the button says
  // Planets (FUN_1040_31c3). "Gravity OK" = the planet's gravity is within
  // 2.56 times your home's either way. Temperature plays no part.
  //   yours: 1000 making money, 1001 losing money, 1002 bad gravity (a
  //     mine), 1003 bad gravity and mined out; +500 if you're a woman
  //   explored, nobody's: 1004 gravity OK, 1005 bad gravity, 1006 bad
  //     gravity and mined out
  //   1007 unexplored, 1008 one of your fleets is on its way, 1009 a
  //     battle was seen there; someone else's: 2000+face (+500 a woman)
  // There is no nova picture: a nova showed as the plain empty planet. With
  // a stand-in (3.0.1's star turning red or gone nova, i1020) it shows that.
  starLook(look, { G, p, s, k, IMG }) {
    const b = look.base;
    const L = (n) => ({ base: P + 'i' + n, scale: 1.45 }); // the icons have room round the planet
    const nova = /^nova/.test(b) && fillPic(IMG || IMGS(), 'i1020');
    if (nova) return { base: nova, scale: 1.45 };
    if (b === 'unknown') return L(1007);
    if (b === 'soon') return L(1008);
    if (b === 'battle') return L(1009);
    if (look.hat && look.hat.startsWith('bad')) {
      const [n, f] = look.hat.slice(3).split('_');
      return L((f === '1' ? 2500 : 2000) + (+n % 20));
    }
    const src = look.hat ? s : k;
    if (!src || (!look.hat && !k.explored)) return L(1007);
    const r = Math.max(src.g, p.homeG) / Math.max(0.01, Math.min(src.g, p.homeG));
    const gOK = Math.round(r * 100) <= 256;
    if (look.hat) { // yours
      const n = HO.planetIncome(G, p, s) >= 0 ? 0 : gOK ? 1 : s.metal >= 100 ? 2 : 3;
      return L((p.female ? 1500 : 1000) + n);
    }
    return L(gOK ? 1004 : src.metal >= 100 ? 1005 : 1006);
  },
  // Report pictures and sounds (FUN_10c0_0b3b, FUN_10c0_0c50), matched
  // here by the report's text.
  messageLook(m, cur, { G, ME, starLook }) {
    const t = String(m.text || ''), me = G.players[ME];
    const own = 'i' + (me.female ? 1500 : 1000);
    const tech = ['Range', 'Speed', 'Weapon', 'Shield', 'Miniaturization'].findIndex(n => new RegExp('Your ' + n + 's? Technology').test(t));
    const R = (icon, sound) => ({ icon: icon && (P + icon), sound });
    if (/^Spaceward Ho! (Version [\d.]+ )?(by|par)\b/.test(t)) return R('i3115', null); // 1.2 says "Version 1.2 by" (French "par")
    // (DOS 2.0's second report is "Click here…"; 1.2's is its artwork credit, report 1001, ICON 3116 in 1.2's GetIconID @130db0: Jake's shot010)
    if (/^Click here|^Artwork by Howard Vives|^Graphismes de Howard Vives/.test(t)) return R('i3116', null);
    if (tech >= 0) return R('i' + (3100 + tech), 2000);
    if (/^Year \d+|updated to the year/.test(t)) return R('i3111', 2000);
    // 1.2's blank meteor report (the 1009 report with no player's name):
    // your own planet, with the report's own sound
    if (!t.trim()) return { icon: P + own, sound: m.sound != null ? m.sound : null };
    // a colony's own battle reports show your planet: 1009 "… destroyed your
    // colony at …" (sound 2001) and 1035 "… successfully defended itself
    // against an enemy attack from …" (no sound); only the fleets' reports,
    // 1033 and 1034 (won, lost), show the other side's face
    if (/ destroyed your colony at /.test(t)) return R(own, 2001);
    if (/ successfully defended itself against an enemy attack from /.test(t)) return R(own, null);
    if (m.battle) { // the other side's face, no sound (the replay has its own)
      const b = G.battles.find(x => x.id === m.battle), o = b && b.sides.find(x => x !== ME && G.players[x]);
      const q = o != null && G.players[o];
      return { icon: q && !q.human ? 'bad' + q.face + '_' + (q.female ? 1 : 0) : P + own, sound: null };
    }
    // chat: the report's own picture; a later version's (5.0.5's m9024)
    // becomes 3.0.1's scroll where there's a stand-in
    if (m.chat) { const k = /^m9\d\d\d$/.test(cur.icon || '') && fillPic(IMGS(), 'i3161'); return { icon: k || cur.icon, sound: 1000 }; }
    if (/run out of metal\. You should/.test(t)) return R('i1006', 1000);
    if (/not receiving sufficient funds|isn.t getting enough money|not spending enough/.test(t)) return R('i3112', 3002);
    if (/money|spending|no metal available|research|funds/i.test(t)) return R('i3112', 1000);
    if (/scrapped|metal has fallen|recovered .* metal/.test(t)) return R('i3113', 1000);
    if (/^Built |has arrived|has stopped at|can no longer reach/.test(t)) return R('i3114', 1000);
    if (/^You have explored/.test(t) && m.star != null) {
      const sound = m.explore === 'good' ? 6000 : m.explore === 'mediocre' ? 6002 : 6001;
      return { icon: starLook(m.star).base, sound };
    }
    if (/just become a profitable|You have colonized|has just been eliminated|You won!/.test(t) && !/You have just been eliminated/.test(t)) return R(own, 2000);
    if (/destroyed your colony|You have just been eliminated|has just won the game/.test(t)) return R(own, 2001);
    const later = window.HOTHEME.cascadeReports && laterReportPic(m, t, cur, IMGS());
    if (later) return { icon: later, sound: 1000 };
    return Object.assign(R(own, 1000), { fallback: true }); // (no picture of its own)
  },
  // Ship pictures (FUN_10f0_0066): three parts side by side, flying right:
  // engine (range + speed), hull (shields; colony ships carry the passenger
  // pod) and nose (weapons). A satellite is one picture that grows spikes
  // with weapons. Two hidden special ships: W = S = 12 with Range 9-11, and
  // W = S = 15 with Range 12-14.
  shipPic(d, IMG) {
    const big = (n) => IMG[P + 'd' + (12100 + n)];
    const fill = (n) => { const k = fillNames('p' + n).map(x => P + x).find(x => IMG[x]); return k ? IMG[k] : null; }; // (stand-ins only: these are 4.0.5's numbers, and 2.0.1's p2758 is a globe)
    // stand-ins: Dreadnoughts and Biologicals whole (4.0.5's), the Tanker's body
    if (d.type === 'dread' || d.type === 'bio') { const im = fill(d.type === 'dread' ? 2263 : 2261); return im && im.width ? wholeShip(im, 76, null) : null; }
    let parts, body = null;
    if (d.type === 'tanker') {
      body = fill(2758);
      if (!body || !body.width) return null;
      parts = [big(clamp(d.R + d.V - 8, 0, 23)), body, big(250 + clamp(d.W - 1, 0, 29))];
    } else if (d.type === 'satellite') parts = [big(301 + clamp(d.W - 1, 0, 25))];
    else if (d.type === 'scout' || d.type === 'fighter' || d.type === 'decoy' || d.type === 'colony') { // a Decoy looks like a Fighter
      if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R > 8 && d.R < 12) parts = [big(151), big(152), big(153)];
      else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R > 11 && d.R < 15) parts = [big(154), big(155), big(156)];
      else parts = [big(clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? big(150) : big(99 + clamp(d.S - 1, 0, 25)), big(250 + clamp(d.W - 1, 0, 29))];
    } else return null;
    if (parts.some(im => !im || !im.width)) return null;
    const c = document.createElement('canvas'); c.width = parts.length * 81; c.height = 76;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    parts.forEach((im, i) => im === body ? x.drawImage(im, i * 81 + 0.5, -2, 80, 80) : x.drawImage(im, i * 81, 0)); // (a 40x40 body twice the size)
    return c;
  },
  // The menu bar of the DOS program (File, Options, Ships, Galaxy, Window; the Windows program adds Help): the items and their order as the running
  // program shows them (screenshots v20dos-orig-menus.png in the audit; Windows' MENU 1 in docs/win20-findings.md). A command the remake has under
  // another name is laid out here under the original's; what a browser has no use for (Save Game, Revert: the remake saves every change; the polling
  // of a network game; I'll Update Turns) shows dimmed as in the original when nothing is to save. The remake's own commands (Preferences, Account saves,
  // Export, Import, Review battle, Next fleet ...) follow at the end of the last menu, as every layout does (docs/remake-controls.md).
  // The original writes "..." and its key equivalents as "[Ctrl+S]" (T.keyName).
  get menuLayout() { return menuLayoutDos(); },
  menuLayoutNow() { return menuLayoutDos(); },
  gameInfo(win) { return gameInfo(win); },
  licensee() { return licensee(); },
  turnProgress(g, go) {
    if (winOn() && playAloneWin(g, () => this.turnProgress(g, go))) return;
    if (winOn() && window.HOWIN31 && window.HOWIN31.status) window.HOWIN31.status(g, go); else go();
  }, // (the Windows program's Status window while the turn is worked out: template 33) // (the licence lines' name and organisation: licensee below)
  fleetList() { return fleetList(); },
  // the words of a ship type and of a number of ships, as the panes and the DOS look's windows write them (for the Windows look's dialogs, js/skins/dos/win31/dialogs.js):
  // caption "Patton (2/2) Fighter"; ships "one Patton (2/2) Fighter", "2 Patton (2/2) Fighters" (the program's fleet rows and its queue cells, captured)
  shipWords: { caption: (d) => caption(d), ships: (d, n) => { const g = window.HOAPI.G, r12 = RS12(); return wl() === 'de' ? deRow(d, n) : r12 ? r12.shipsDesc(enView(g), d, n) : `${n} ${d.name}`; }, className: (d) => className(d) },
  panel(panel, B) { panelDos(panel, B); },
  mapPixel() { return frameOn() ? [U, U] : null; },
  battleWindow(b, k) { battleDos(b, k); },
  mapInset() { return winOn() ? [17 * U, 17 * U] : frameOn() ? [8 * U, 14 * U] : [0, 0] ; }, // (the Windows program's scroll bars are 17 pixels)
  modernPan() { return frameOn(); },
  planetPx(s) { return frameOn() ? Math.round(s * 12 / 17) : Math.max(18, Math.min(52, s * 0.9)); }, // (measured: a star's ball is about 24 pixels at the zoom of 17 and 15 at 12)
  zoomTo(s, f) { return frameOn() ? dzoomTo(s, f) : Math.max(12, Math.min(140, s * f)); },
  syncView(v, c) { dSync(v, c); },
  centerOnStar(v, sid, c) { return dCenterOn(v, sid, c); },
  fitView(v, c) { dMapFit(v, c); },
  afterDraw() { dBars(); },
  mapBg: /\bos-(dos|win31)\b/.test(document.documentElement.className) ? '#000' : undefined, // (the program's map is plain black, in DOS and in Windows)
  bgStars: /\bos-(dos|win31)\b/.test(document.documentElement.className) ? false : undefined,
  mapFont(n) { return winOn() ? '11px ' + WSANS : frameOn() ? "12px 'DOS Geneva 9'" : null; },
  alertBox(paras) { return frameOn() ? alertDos(paras, [{ label: 'OK', def: true }]) : null; },
  youWonLayout(kind, Y, done) { return frameOn() ? youWonDos(kind, Y, done) : false; },
  nameStarLayout(f, o) { return winOn() && window.HOWIN31 && window.HOWIN31.nameStar ? window.HOWIN31.nameStar(f, o) : frameOn() ? nameStarDos(f, o) : false; },
  closingGame(go) { return frameOn() ? closingGameDos(go) : false; },
  // (a question whose caller asks for the program's Yes/No box: labels ['Yes', 'No'], the remake's own words before they are put in the page's language, or labels.yesNo)
  confirm(text, yes, labels) {
    if (!frameOn()) return false;
    const yn = !!labels && (!!labels.yesNo || (labels[0] === 'Yes' && labels[1] === 'No')), go = { label: labels ? tx(labels[0]) : 'OK', def: true, fn: yes }, no = { label: labels ? tx(labels[1]) : 'Cancel' };
    // (DOS: a question puts Cancel first and the action after it, as in its captured questions (revert, abandon); its Yes/No box keeps Yes, No)
    return !!alertDos([typeof text === 'string' ? text : (text.textContent || '')], yn || winOn() ? [go, no] : [no, go], { yesNo: yn });
  },
  alert(kind, text, yes) {
    if (!frameOn()) return false;
    // (End Turn with colonies left short: the program's box 5060, its words and its buttons Cancel and Let 'em Die, captured (Jake's image0056, 0087))
    if (kind === 'underfunded' && !winOn()) return !!alertDos([tx('Warning! You are not spending enough money to support some of your colonies.  Do you really want to abandon them?')], [{ label: tx('Cancel') }, { label: tx('Let ’em Die'), fn: yes }]);
    return !!alertDos([typeof text === 'string' ? text : (text.textContent || '')], winOn() ? [{ label: 'OK', def: true, fn: yes }, { label: 'Cancel' }] : [{ label: 'Cancel' }, { label: 'OK', fn: yes }]); // (DOS: Cancel first, as in its captured questions)
  },
  plainAlert(text) { return frameOn() && !winOn() ? !!alertDos([text], [{ label: 'OK', def: true }], { plain: true }) : false; }, // (the box without the mascot: MsgBox)
  window(name) { if (name === 'saved' && winOn() && window.HOWIN31 && window.HOWIN31.show('fileOpen', arguments[1])) return true; // (the Windows program's File Open window, template 12)
    if (winOn() && window.HOAPI.G && window.HOWIN31 && W31WIN[name] && window.HOWIN31.show(W31WIN[name], arguments[1])) return true; // (the Windows program's own windows: js/skins/dos/win31/dialogs.js)
    if (!frameOn() || !window.HOAPI.G) return false; if (name === 'autoplay') return autoPlayDos(); if (name === 'fleets') return fleetsDos(); if (name === 'types') return shipTypesDos(arguments[1]); if (name === 'build') return buildDos(arguments[1]); if (name === 'stars') return starsDos(); if (name === 'compare') return compareDos(); if (name === 'reports') return reportsDos(); if (name === 'group') return organizeDos(arguments[1]); if (name === 'chat') return chatDos(); return false; },
  newGame(f) { createGalaxyDos(f); },
  keyName(k) { return winOn() ? ((WINKEY[k]) || k) : '[' + k + ']'; }, // (the Windows menus write the key plain, "Ctrl+S", as captured, win20-jake-vga16-shot0007.png)
  hoIntoLast() { return winOn() && frameOn(); }, // (the Windows program has no Ho! item: the remake's own commands go to the end of Help) // (the Windows look: the Windows program's keys, WINKEY)
  menus(menus) { const k = (m, l, key) => { const f = (menus[m] || []).find(i => i[0] === l); if (f) f[5] = key; }; k('Ships', 'List all fleets…', 'Ctrl+L'); k('Galaxy', 'Report window…', 'Alt+2'); },
  // the DOS title screen: the two halves of its credits picture
  title(frame, IMG, Sound) {
    const top = IMG[P + 'd998'], bot = IMG[P + 'd999'];
    if (!top || !bot) return false;
    frame.width = 383; frame.height = 236;
    const x = frame.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 383, 113);
    x.fillStyle = '#fff'; x.fillRect(0, 113, 383, 123); // the lower half is drawn on white
    x.drawImage(top, 0, 0); x.drawImage(bot, 0, 113);
    Sound.play(2000);
    startupDos();
    return true;
  },
  lookOptions(where) { return w31Colours(where); },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'With the art and sounds of Spaceward Ho! 2.0 for DOS (New World Computing, 1993). DOS programming by Ed Murphy.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 2.0';
    frameSetup(doc.documentElement);
  },
};

// ---- the Windows 3.1 look's display: 16 colours (VGA, the default: what Windows 3.1 shipped with) or 256 colours (docs/win20-findings.md; the colours are
// CSS variables in js/os/win31.css and js/skins/dos/win31/dialog.js, switched by html.w31-256). Kept in the browser as the Amiga skin keeps its pixels
// (localStorage "ho5.dos.colors"), offered with the Skin and OS look pickers (T.lookOptions: the title screen while the look is Windows 3.1, Skin and OS look…)
// and in Preferences; it takes effect at once.
const W31KEY = 'ho5.dos.colors';
const w31Mode = () => { try { return localStorage.getItem(W31KEY) === '256' ? '256' : '16'; } catch (e) { return '16'; } };
function setW31Mode(m) {
  try { if (m === '256') localStorage.setItem(W31KEY, '256'); else localStorage.removeItem(W31KEY); } catch (e) { /* not kept */ }
  document.documentElement.classList.toggle('w31-256', m === '256');
  for (const s of document.querySelectorAll('select.w31-colsel')) s.value = m;
  const a = window.HOAPI; if (a && a.G && winOn()) a.renderPanel(); // (the panes' bars take the display's colours)
}
document.documentElement.classList.toggle('w31-256', w31Mode() === '256');
function w31Colours(where) {
  const a = window.HOAPI, el = a ? a.el : null; if (!el) return null;
  const s = el('select', { class: 'w31-colsel', name: where === 'newgame' ? null : 'w31colors', 'aria-label': 'Windows 3.1 colours' },
    el('option', { value: '16' }, '16 colours (VGA)'), el('option', { value: '256' }, '256 colours'));
  s.value = w31Mode();
  s.addEventListener('change', (e) => { e.stopPropagation(); setW31Mode(s.value); });
  const row = el('label', { class: where === 'prefs' ? 'w31-colrow' : 'tskin w31-colrow' }, el('span', null, 'Windows 3.1 colours'), ' ', s);
  // (on the title screen only while the look is Windows 3.1; in Skin and OS look… and Preferences always, as the look may be chosen there)
  if (where === 'title' || where === 'newgame') {
    const sync = () => { row.hidden = !document.documentElement.classList.contains('os-win31'); };
    sync(); new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  return row;
}

// ---- the menu bar (see menuLayout in HOTHEME) ----
function menuLayoutDos() {
  const A = () => window.HOAPI, G = () => A() && A().G, H = () => window.HO;
  const noGame = () => !G(), off = () => true;
  const orgGhost = () => { const f = noGame() ? null : A().curFleet && A().curFleet(); return !f || f.star == null || f.to != null || Object.keys(f.ships).length !== 1; };
  const it = (label, fn, o) => { o = o || {}; return [label, fn, o.shown || null, o.checked || null, o.ghost || null, o.key || null]; };
  const rs = () => (G() ? H().rules(G()) : {});
  const star = () => (G() && A().UI.sel != null ? G().stars[A().UI.sel] : null);
  const mine = () => !!star() && star().owner === A().ME;
  const win = (window.HOSKINS && HOSKINS.os) || '';
  const M = {
    File: [
      it('About Ho!…', () => (frameOn() ? aboutDos() : A().openAbout())), '-',
      ['New Game…', 'Game/New game…'],
      it('Open Game…', () => A().openSavedGames()),
      it('Save Game', () => {}, { ghost: off, key: 'Ctrl+S' }),
      it('Revert To Saved', () => {}, { ghost: off }),
      it('Close', () => A().quitToTitle(), { ghost: noGame, key: 'Ctrl+W' }), '-',
      it('End Turn', () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); else if (G()) A().doEndTurn(); }, { ghost: noGame, key: 'Ctrl+T' }),
      ['End Turn & Switch Players', 'Game/#1'], '-',
      it('Exit', () => A().quitToTitle())],
    Options: [
      it('Force Turn Update', () => A().forceEndTurn(), { ghost: () => noGame() || !rs().forceEndTurn || !A().hotSeat() }),
      ['Auto Play…', 'Game/Auto play…'],
      it('I’ll Update Turns', () => {}, { ghost: off }), '-',
      it('Set Polling Time…', () => {}, { ghost: () => !winOn() || noGame() }), // (enabled in the Windows program, captured: its window, template 26, js/skins/dos/win31/hook.js)
      it('Set Battle Speed…', () => (frameOn() ? battleSpeedDos() : A().openPrefs()), { ghost: noGame }), '-',
      it('Show Event Messages', () => { const P = A().Prefs; P.showMsgs = P.showMsgs === false; A().savePrefs(); }, { ghost: noGame, checked: () => A().Prefs.showMsgs !== false }),
      it('Review Announced Battles', () => { A().Prefs.review = !A().prefReview(); A().savePrefs(); }, { ghost: noGame, checked: () => A().prefReview() }),
      it('Give Overspending Warnings', () => { const g = G(); g.opts.overspendWarnings = g.opts.overspendWarnings === false; A().save(); }, { ghost: noGame, checked: () => !!G() && G().opts.overspendWarnings !== false }),
      it('Sound', () => { A().Sound.on = !A().Sound.on; A().savePrefs(); }, { checked: () => A().Sound.on })],
    Ships: [
      ['List Ship Types…', 'Ships/Scrap ship types…'],
      it('Create New Ship Type…', () => (frameOn() ? newTypeDos() : A().openBuild(star().id)), { ghost: () => noGame() || (!frameOn() && !mine()), key: 'Ctrl+K' }), '-',
      ['List All Fleets…', 'Ships/List all fleets…'], // (its key [Ctrl+L] is put on the classic item in T.menus)
      // (the line changes with the selection, FUN_b000_2998: "~Organize Ships..." (358), dimmed "No ships to organize..." (359) when there is nothing to organize)
      it(() => (orgGhost() ? A().tl('No ships to organize…') : A().tl('Organize Ships…')), () => { const f = A().curFleet && A().curFleet(); if (f && f.star != null) ((winOn() && window.HOWIN31 && window.HOWIN31.show('group', f.star)) || organizeDos(f.star)); }, { ghost: orgGhost, key: 'Ctrl+O' }),
      it(() => (mine() ? A().tl('Build Ships at %s…', star().name) : A().tl('Can’t Build Ships Here…')), () => { if (mine()) A().openBuild(star().id); }, { ghost: () => noGame() || !mine(), key: 'Ctrl+B' }),
      ['Scrap Current Fleet', 'Ships/#3'], '-',
      // (captured: "Review Battle at <star>…" [Ctrl+R] shows the selected star's last battle; "No Battles here…" is dimmed)
      it(() => { const bs = !noGame() && star() ? A().lastBattles(star().id) : []; return bs.length ? A().tl('Review Battle at %s…', star().name) : A().tl('No Battles here…'); }, () => { const bs = star() ? A().lastBattles(star().id) : []; if (bs.length) A().openBattle(bs[0].id); }, { ghost: () => noGame() || !star() || !A().lastBattles(star().id).length, key: 'Ctrl+R' })],
    Galaxy: [
      it('Compare Players…', () => A().openCompare(), { shown: () => !!G() && !!rs().compare, key: 'Ctrl+Y' }), ['List All Explored Stars…', 'Galaxy/List explored stars…'], ['Send Message…', 'Galaxy/Send a message…'], '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoomD(dzs().length - 1), key: '+' }), it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || atZoomD(0), key: '-' }), '-',
      it('Fix Spending', () => A().openFixSpending(), { shown: () => !!G() && !!rs().fixSpending, ghost: noGame, key: 'Ctrl+F' })],
    Window: [it('Tech Spending', () => {}, { checked: () => true, key: 'Alt+1' }), ['Reports', 'Galaxy/Report window…'],
      it('Game Info…', () => ((winOn() && window.HOWIN31 && window.HOWIN31.show('gameInfo')) || gameInfoDos()), { ghost: noGame, shown: () => !!G() && !!G().opts.modern })] // (a modern convenience: not in either program's Window menu; the remake's own place for the Player Entry window's Info..., gameInfo) // (the program's Window menu: Tech Spending, checked while its window shows; the remake's panel always shows it)
  };
  if (win === 'win31' && frameOn()) {
    // The Windows program's menus as captured (Jake's game, win20-jake-vga16-shot0007 to 0011, 0054, 0059; MENU 1 in WINHO.EXE): the words, the order, the separators.
    // Page Setup and Print Map: the program's Print Map says "Unable to create printer device context" when there is no printer (shot0067); the remake prints nothing, so
    // it says that (T.printAlert); Page Setup is dimmed (its box was not captured).
    const endTurn = M.File.find(i => i[0] === 'End Turn'), exit = M.File.find(i => i[0] === 'Exit');
    M.File = [['New…', 'Game/New game…'], it('Open…', () => A().openSavedGames()), it('Save…', () => A().save(true), { ghost: noGame, key: 'Ctrl+S' }), it('Revert to Saved…', () => {}, { ghost: off }),
      it('Close…', () => A().quitToTitle(), { ghost: noGame, key: 'Ctrl+W' }), '-', endTurn,
      it('End Turn & Switch Players', () => A().switchPlayers(), { ghost: () => noGame() || !rs().switchPlayers || !A().hotSeat(), key: 'Ctrl+/' }), '-',
      it('Page Setup…', () => {}, { ghost: off }), it('Print Map…', () => printMapAlert(), { ghost: noGame, key: 'Ctrl+P' }), '-', exit];
    // Save... and I'll Update Turns are enabled in the program (shots 7 and 8, I'll Update Turns ticked: the machine works out its own turns). Save... saves the game
    // now (the remake also saves after every move); I'll Update Turns stays ticked (there is no other machine to wait for). Revert to Saved... stays dimmed: the
    // remake keeps no older copy of the game to go back to.
    const iu = M.Options.findIndex(i => i[0] === 'I’ll Update Turns');
    if (iu >= 0) M.Options[iu] = it('I’ll Update Turns', () => {}, { ghost: noGame, checked: () => !noGame() });
    M.Window = [it('Tech Spending Window', () => {}, { key: 'Alt+1' }), ['Report Window', 'Galaxy/Report window…'], '-', it('Clean Up Windows', () => {}, { ghost: off }), M.Window[2]];
    M.Help = [['Help on Ho!', 'Help/How to play']];
  } else if (win === 'win31') M.Help = [['How to play', 'Help/How to play']];
  return M;
}

// The program reds the hot letter of every enabled menu item, as of the menus (the pool's "~Scrap Current Fleet" marks it; read off the captured menus
// v20dos-orig-menu-*.png and v20dos-orig-alert-force.png; a ghosted item shows none). The German program's strings carry no "~", so only the English words are marked.
const MENU_HOT = { 'About Ho!…': 0, 'New Game…': 0, 'Open Game…': 0, 'Close': 0, 'End Turn': 0, 'Exit': 1,
  'Force Turn Update': 0, 'Auto Play…': 0, 'I’ll Update Turns': 0, 'Set Polling Time…': 4, 'Set Battle Speed…': 4, 'Show Event Messages': 5, 'Review Announced Battles': 0, 'Give Overspending Warnings': 0, 'Sound': 0,
  'List Ship Types…': 0, 'Create New Ship Type…': 7, 'List All Fleets…': 9, 'Organize Ships…': 0, 'Scrap Current Fleet': 0,
  'Compare Players…': 0, 'List All Explored Stars…': 0, 'Send Message…': 5, 'Zoom In': 5, 'Zoom Out': 5, 'Fix Spending': 0, 'Reports': 0, 'Tech Spending': 0 };
// The Windows program's (MENU 1, the private repo's extracted/win-2.0/resources/menus.txt): its hot letters underlined, where they differ from the DOS program's
// (the Ships menu's List Ship Types, Organize, Build Ships at, Scrap Current Fleet and No Battles here carry no underline in the running program, captured
// win20-orig-vga16-shipsmenu.png: it sets them from its strings, 354-361, which have no "&"; menus.txt's "&L", "&O", "&B", "&S", "He&re" never show)
const WIN_HOT = Object.assign({}, MENU_HOT, { 'Give Overspending Warnings': 5, 'End Turn & Switch Players': 'End Turn & Switch Players'.indexOf('Switch') + 2, 'List Ship Types…': -1, 'Organize Ships…': -1, 'Scrap Current Fleet': -1, 'No Battles Here…': -1, 'Review Battle at': -1, 'Save Game': 0, 'Revert To Saved': 0,
  'New…': 0, 'Open…': 0, 'Save…': 0, 'Revert to Saved…': 0, 'Close…': 0, 'Page Setup…': 7, 'Print Map…': 0, 'Tech Spending Window': 0, 'Report Window': 0, 'Clean Up Windows': 0, 'Help on Ho!': 0 });
// The Windows program's End Turn in 2000 (WINHO.EXE 1050:0fcd-10b2, read in the disassembly: Ghidra's C of FUN_1050_0d02 lost it): when the year-2000 turn is
// done and the header's +0xc is still -1, unless the galaxy has 20 players, one human is asked ALERT 3230 (kind 1, "&Wait", "&Continue": "%s, do you want to play
// alone, or wait for more humans to join?\n\n(Computer Opponents: %s)", Jake's win20-jake-vga16-shot0005.png); Continue (201) sets +0xc to 0 and the turn is
// worked out, Wait leaves the turn undone, so End Turn asks again. (Two humans or more are asked ALERT 3070 instead: the remake's hot seat has its own hand-over.)
// The same as Mac 3.0.1's ALRT 3230 (js/skins/mac12/ui.js playAlone301). Asked in the DOS ruleset only (the question is 2.0's); the answer is kept with the game.
function playAloneWin(g, go) {
  const a = window.HOAPI; if (!g || g.year !== 2000 || g.alone20 || g.players.length >= 20 || window.HO.rules(g).id !== 'dos') return false;
  if (g.players.filter(p => p.human).length >= 2 || (a.me && !a.me())) return false;
  const me = a.me(), comps = g.players.filter(p => !p.human).length;
  return !!alertDos([`${me.name}, do you want to play alone, or wait for more humans to join?`, `(Computer Opponents: ${comps})`],
    [{ label: 'Wait' }, { label: 'Continue', def: true, fn: () => { g.alone20 = true; go(); } }]);
}
// Print Map without a printer: the program's alert (captured, win20-jake-vga16-shot0067.png), the remake prints nothing
function printMapAlert() { if (!(window.HOWIN31 && window.HOWIN31.printAlert && window.HOWIN31.printAlert())) window.HOAPI.toast('Unable to create printer device context'); }
function hotMenus() {
  // (the Windows program's items end in three full stops, "Save...": menus.txt and every captured menu, win20-jake-vga16-shot0007-0011; MS Sans Serif and the
  // System font have no "…", which they drew as a block)
  const dots = (b) => { if (!winOn()) return; const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (n.nodeValue.includes('…')) n.nodeValue = n.nodeValue.replace(/…/g, '...'); };
  // (each Windows menu's key column and width as captured, from the words' left edge and between the borders: File, shot 7; Options 8; Ships 9; Galaxy 10;
  // Window 11; Help 54. Windows' own rule did not come out of these five: the column is 9 past the widest words in File and Ships, but not in Galaxy or
  // Window. A longer star name in "Build Ships at" widens the column, as Windows would.)
  const WCOL = { File: [180, 252], Options: [0, 221], Ships: [168, 236], Galaxy: [175, 235], Window: [168, 229], Help: [144, 186] };
  const cols = (dd) => {
    const b = dd.previousElementSibling, k = b && WCOL[(b.textContent || '').trim()];
    dd.style.gridTemplateColumns = winOn() && k && k[0] ? `minmax(calc(${k[0] + 16} * var(--du)), max-content) auto` : '';
    dd.style.minWidth = winOn() && k ? `calc(${k[1] + 2} * var(--du))` : '';
  };
  const mark = (dd) => { cols(dd); dd.querySelectorAll('button[role=menuitem]').forEach(b => { mark1(b); dots(b); }); };
  const mark1 = (b) => {
    if (b.dataset.hot || (b.disabled && !winOn()) || !frameOn()) return;
    const n = b.firstChild; if (!n || n.nodeType !== 3) return;
    const t = n.nodeValue, W = winOn(); let i = (W ? WIN_HOT : MENU_HOT)[t];
    if (i == null && /^Build Ships at /.test(t) && !W) i = 0;
    if (i == null && /^Review Battle at /.test(t) && !W) i = 0;
    if (i == null || i < 0 || i >= t.length) return;
    b.dataset.hot = '1'; const sp = document.createElement('span'); sp.className = 'mhot'; sp.textContent = t[i];
    const w = document.createElement('span'); w.setAttribute('translate', 'no'); w.append(t.slice(0, i), sp, t.slice(i + 1)); n.replaceWith(w);
  };
  new MutationObserver(() => document.querySelectorAll('.dropdown.open').forEach(mark)).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
}
// The key equivalents the menus show ("[Ctrl+K]"): the keys the browser lets a page have. Ctrl+W, Ctrl+T and Ctrl+N belong to the browser (kept difference); the first letter T
// of the classic skin ends the turn.
// The Windows program's own keys where they differ from the DOS program's (WINHO.EXE's MENU 1, extracted/win-2.0/resources/menus.txt in the private repo; captured
// for Compare Players): shown and taken with the Windows look, the DOS ones with the DOS look. (Its Alt+2 for the Report Window and Ctrl+/ for End Turn & Switch
// Players are on the classic skin's items the layout borrows, which carry no key here: not shown.)
const WINKEY = { 'Ctrl+Y': 'Ctrl+M', '+': 'Ctrl+=', '-': 'Ctrl+-' }, WINKEY_DOS = { 'Ctrl+M': 'Ctrl+Y', 'Ctrl+=': '+', 'Ctrl+-': '-' };
function dosKeys() {
  // The Windows look's menu bar: Alt+letter opens the menu whose underlined first letter it is, and a letter chosen in an open menu presses the item with that underlined letter
  document.addEventListener('keydown', (e) => {
    if (!frameOn() || !winOn() || e.ctrlKey || e.metaKey || e.shiftKey || e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
    const k = e.key.toLowerCase(), open = document.querySelector('#menubar .dropdown.open');
    if (open && !e.altKey) { const b = [...open.querySelectorAll('button[role=menuitem]:not(:disabled)')].find(x => { const h = x.querySelector('.mhot'); return h && h.textContent.toLowerCase() === k; }); if (b) { e.preventDefault(); b.click(); } return; }
    if (!e.altKey || document.querySelector('.scrim')) return;
    const m = [...document.querySelectorAll('#menubar .mbtn:not(.logo)')].find(x => x.textContent.trim().charAt(0).toLowerCase() === k); if (m) { e.preventDefault(); m.click(); }
  });
  // (Escape closes an open menu, as in both programs; found by real-play: a menu left open by Escape covered the map)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !frameOn()) return;
    const open = document.querySelectorAll('#menubar .dropdown.open'); if (!open.length) return;
    open.forEach(d => { d.classList.remove('open'); if (d.previousElementSibling) d.previousElementSibling.setAttribute('aria-expanded', 'false'); }); e.preventDefault();
  });
  document.addEventListener('keydown', (e) => {
    const a = window.HOAPI; if (!frameOn() || !a || !a.G || document.querySelector('.scrim') || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    let k = null;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.length === 1) k = 'Ctrl+' + e.key.toUpperCase();
    else if (e.altKey && !e.ctrlKey && /^[12]$/.test(e.key)) k = 'Alt+' + e.key;
    else if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.key === '+' || e.key === '-' || e.key === '=')) k = e.key === '=' ? '+' : e.key;
    if (!k) return;
    if (winOn()) { if (WINKEY_DOS[k]) k = WINKEY_DOS[k]; else if (WINKEY[k]) return; } // (the Windows look takes the Windows program's keys, not the DOS ones)
    const M = menuLayoutDos();
    for (const m in M) for (const it of M[m]) if (it[5] === k) { if (typeof it[1] !== 'function' || (it[2] && !it[2]()) || (it[4] && it[4]())) return; e.preventDefault(); it[1](); return; }
  });
}
// F10, the program's boss key (FUN_9000_7450, which its event loop FUN_2000_fd17 calls on the key code 0x10c4, at any time, over any window): the screen goes to
// text mode and shows a DOS prompt, "C:\>" in grey at its top left, until a key is pressed, then the program sets its graphics mode again and redraws its screen
// (captured over the licence window: v20dos-orig-bosskey.png). Here a black page with the prompt in the VGA text mode's own 9 x 16 font (IBM VGA 9x16, int10h.org, CC BY-SA 4.0); a key or a click brings the page back.
function bossKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'F10' || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || !frameOn() || document.querySelector('.dd-boss')) return;
    e.preventDefault(); e.stopPropagation();
    const s = document.createElement('div'); s.className = 'dd-boss'; s.tabIndex = -1; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', 'C:\\>'); s.textContent = 'C:\\>';
    const was = document.activeElement, back = (ev) => { ev.preventDefault(); ev.stopPropagation(); s.remove(); document.removeEventListener('keydown', back, true); if (was && was.isConnected && was.focus) was.focus(); };
    setTimeout(() => document.addEventListener('keydown', back, true), 0); s.addEventListener('pointerdown', back);
    document.body.append(s); s.focus();
  }, true);
}
// A caption that is wider than its cell is drawn with the letters a pixel closer together (captured: a ship type named "wagon train 123" in the Ship Types list, whose words
// ("wagon train 123 (6/6) Fighter") are squeezed into the cell; the Mac 1.2 program does the same at 120 pixels), and what still does not fit is cut at the cell. The Name
// on the right is cut at its rectangle (captured: "wagon train" of "wagon train 123").
function condenseCaps() {
  const sel = '.dd-type .cap, .dd-qcell .cap, .dd-qtop .cap';
  const fit = (c) => { c.classList.remove('cond'); if (c.scrollWidth > c.clientWidth + 0.5) c.classList.add('cond'); };
  const all = (n) => (n.matches && n.matches(sel) ? [n] : []).concat([...(n.querySelectorAll ? n.querySelectorAll(sel) : [])]);
  new MutationObserver((ms) => { if (!frameOn()) return; for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) all(n).forEach(fit); }).observe(document.body, { subtree: true, childList: true });
}
// The Windows look in 16 colours (its VGA driver: Jake's Windows 3.1 battles, audit/win-2.0/captures/image0028-0060): each colour the nearest of the 16 as
// they show there; a bolt's outer lines take its inner side lines' colour (Weapons 2: red, olive, olive; Weapons 6: yellow, green, green). In 256 colours,
// and in the DOS look, the colours as they are.
const WIN16 = [[0, 0, 0], [0, 0, 170], [0, 0, 255], [0, 170, 85], [0, 255, 0], [0, 255, 255], [85, 170, 170], [134, 138, 142], [170, 0, 85], [170, 85, 170], [170, 170, 85], [194, 198, 202], [255, 0, 0], [255, 0, 255], [255, 255, 0], [255, 255, 255]];
function win16(cols, bolt) {
  if (!winOn() || document.documentElement.classList.contains('w31-256')) return cols;
  const rgb = (c) => { const m = /^#(..)(..)(..)$/.exec(c); if (m) return [1, 2, 3].map(i => parseInt(m[i], 16)); const n = String(c).match(/\d+/g).map(Number); return n.slice(0, 3); };
  const near = (c) => { const v = rgb(c); let b = WIN16[0], d = 1e9; for (const p of WIN16) { const e = (p[0] - v[0]) ** 2 + (p[1] - v[1]) ** 2 + (p[2] - v[2]) ** 2; if (e < d) { d = e; b = p; } } return `rgb(${b.join(',')})`; };
  const out = cols.map(near); if (bolt) out[2] = out[1]; return out;
}
// The bolt's three colours in the DOS program, by the shooting group's Weapons (Mac 2.0.1 DrawLaserBlast @d3e20: the middle line at hue (W - 1) x 4000,
// full value; the lines 1 and 2 to each side 7500 and 15000 further round at values 45000 and 25000; the DOS program's palette puts them on these,
// measured on its battles, W 1 to 5: battles/v20dos-orig-battle01..06, and 9: Jake's image0134). Between and past those, not captured, the hue is interpolated.
const BOLT = { 1: ['#ff0000', '#9a3000', '#653000'], 2: ['#ff3000', '#9a6500', '#653000'], 3: ['#ff6500', '#9a6500', '#653000'], 4: ['#ff9a00', '#9a9a00', '#656500'], 5: ['#ffcf00', '#00aa00', '#006500'],
  9: ['#00ff65', '#009a9a', '#006565'] }; // (9: Jake's Tornado (9/8) fighters, image0134)
function boltColours(W) {
  if (BOLT[W]) return BOLT[W];
  // (not captured: the hue between the measured levels' hues, the wheel's step from the last two measured past them; the values as measured)
  const hue = (hex) => { const r = parseInt(hex.slice(1, 3), 16), g2 = parseInt(hex.slice(3, 5), 16), b2 = parseInt(hex.slice(5, 7), 16), mx = Math.max(r, g2, b2), mn = Math.min(r, g2, b2), d = mx - mn || 1;
    return ((mx === r ? (g2 - b2) / d : mx === g2 ? 2 + (b2 - r) / d : 4 + (r - g2) / d) * 60 + 360) % 360; };
  const hsv = (h, v) => { h = (((h % 360) + 360) % 360) / 60; const i = Math.floor(h), f = h - i, q = v * (1 - f), t = v * f; const [r, g2, b2] = [[v, t, 0], [q, v, 0], [0, v, t], [0, q, v], [t, 0, v], [v, 0, q]][i % 6]; return `rgb(${Math.round(r * 255)},${Math.round(g2 * 255)},${Math.round(b2 * 255)})`; };
  const ks = Object.keys(BOLT).map(Number).sort((p2, q2) => p2 - q2), lo = ks.filter(k => k < W).pop(), hi = ks.find(k => k > W);
  const at = (k) => hue(BOLT[k][0]), h = hi != null ? at(lo) + (at(hi) - at(lo)) * (W - lo) / (hi - lo) : at(lo) + (at(lo) - at(ks[ks.length - 2])) / (lo - ks[ks.length - 2]) * (W - lo);
  return [hsv(h, 1), hsv(h + 41, 0.6), hsv(h + 82, 0.4)];
}
// ======== Review Battle: the program's battle window (Windows template 7, "Skip"; measured on the summary of a battle reviewed in DOSBox) ========
// 456 x 364 with the program's frame (the interior black with 35 white stars): the two sides' faces (a red-brown cross over a side with nothing left), the viewer's group
// pictures with a line of words under each (the Geneva 9, a lost group dimmed in a stipple), the title and the result in Geneva 9 Bold, the picture of the winner
// (d3500) or the loser (d3510), "Round n" and the button, which says Skip while the shots are fired and OK after. Measured on seven battles fought in DOSBox (23 Nov 2026,
// the private repo's audit/dos-2.0.1/captures/battles): rows 53 apart, the bolts' colours by Weapons (BOLT), a kill's ovals (explosion), your name in an announced
// battle (k.live) but not in Review Battle's summary. The hits (17 x 17 pictures) and the Windows look's shots are still the Mac 1.2 window's (js/skins/mac12).
function battleDos(b, k) {
  const a = window.HOAPI, g = a.G, H = window.HO, rs = H.rules(g), el = a.el, ME = a.ME, IMG = a.IMG;
  const pic = (n) => { const im = IMG['dos:' + n]; return im && im.complete && im.naturalWidth ? im : null; };
  const VB = k.verBattle(), speed = Math.max(1, Math.round(30 * VB.f)), TICK = 1000 / 60, S = 2;
  const alive = b.start.map(() => true), hurt = []; let seq = 0, pop = b.pop0;
  const st = () => ({ alive, hurt, pop, over: false, won: false });
  const P0 = rs.battlePanel(g, b, st(), ME);
  const leftSide = P0.leftSide, rightSide = b.sides.find(o => o !== leftSide);
  const fAlive = b.start.map(() => true); let fPop = b.pop0;
  for (const r of b.rounds) for (const ev of r) if (ev.k && !ev.p) fAlive[ev.ti] = false;
  if (b.popR && b.popR.length) fPop = b.popR[b.popR.length - 1];
  const viewer = b.sides.includes(ME) ? ME : b.sides[0], foe = (o) => o !== viewer && !H.isAllied(g, o, viewer);
  const liveF = (pred) => b.start.some((u, i) => fAlive[i] && pred(u.o));
  const won = (liveF(o => !foe(o)) || (b.planetOwner >= 0 && !foe(b.planetOwner) && fPop > 0.0005)) && !liveF(foe) && !(b.planetOwner >= 0 && foe(b.planetOwner) && fPop > 0.0005);
  let sides;
  if (b.grp) sides = b.grp.map(L => L.map(x => (x === -1 ? { planet: true, units: [] } : { units: x }))); else sides = [[], []], P0.cols.forEach((c, ci) => c.forEach(r => sides[ci].push({ planet: r.planet, units: r.units })));
  const ownerOf = (L) => { const s = L.find(x => !x.planet && x.units.length); return s ? b.start[s.units[0]].o : b.planetOwner; };
  if (b.grp && ownerOf(sides[0]) !== leftSide && ownerOf(sides[1]) === leftSide) sides.reverse();
  const cols = sides.map((L, ci) => L.slice().sort((p, q) => (q.planet ? 1 : 0) - (p.planet ? 1 : 0)).map((x, row) => Object.assign(x, { o: x.planet ? b.planetOwner : b.start[x.units[0]] ? b.start[x.units[0]].o : -1, ci, row })));
  const owners = [leftSide, rightSide], where = new Map(), planetAt = {};
  cols.forEach(L => L.forEach(x => { x.units.forEach(i => where.set(i, x)); if (x.planet) planetAt[x.o] = x; }));
  const hidden = [0, 1].map(ci => !won && b.rounds.length === 1 && owners[ci] !== ME && !(owners[ci] != null && H.isAllied(g, owners[ci], ME)));
  // geometry (the canvas is the window's inside, 446 x 354, 5 in from its frame)
  const win0 = winOn() && window.HOWIN31 && window.HOWIN31.has && window.HOWIN31.has(7); // (the Windows window's pictures sit 3 to 5 further left: measured against the capture)
  let Hh = 354; const W = 446, FACE = win0 ? [[25, 21], [297, 21]] : [[28, 21], [302, 21]], SHIP = win0 ? [[43, 57], [304, 56]] : [[47, 57], [308, 56]], CAPC = win0 ? [85, 360] : [87.5, 362.5], PIT = 53;
  // (the Windows look: template 7 of WINHO.EXE, a 446 x 358 client with the navy modal frame, the program's own place, 32, 19 on the 640 x 480 screen, and its Skip / OK button
  // (def, 198, 316, 48 x 28): captured, win20-orig-vga16-battle-{skip,mid,done}.png; the picture is the same canvas as the DOS look's)
  const win = win0;
  const c = el('canvas', { class: win ? 'w31c w31pic' : 'dd-pic', 'aria-label': 'Summary of battle', role: 'img' }); const dpr = window.devicePixelRatio || 1;
  let stop = false, skip = false, done = false, btn, d, S1 = U;
  const onBtn = () => { if (done) a.closeModal(); else skip = true; };
  if (win) {
    const dlg = window.HOWIN31.open(7, { label: 'Summary of battle', client: [446, 358], text: { 2: 'Skip' }, on: { 2: onBtn }, close: () => a.closeModal() });
    d = dlg.el; btn = dlg.get('2'); S1 = parseFloat(getComputedStyle(d).getPropertyValue('--wu')) || U;
    Object.assign(c.style, { background: '#000', position: 'absolute', left: '0', top: '0', width: 'calc(446 * var(--wu))', height: 'calc(358 * var(--wu))' }); Hh = 358;
    d.querySelector('.w31client').prepend(c); d.style.transform = 'translate(calc(-60 * var(--wu)), calc(-37 * var(--wu)))'; // (placed by the template's x, y, not centred)
  }
  c.width = Math.round(W * S1 * dpr * 1); c.height = Math.round(Hh * S1 * dpr);
  if (!win) dAt(c, 5, 5, W, Hh);
  const x = c.getContext('2d'); x.setTransform(S1 * dpr, 0, 0, S1 * dpr, 0, win ? -9 * S1 * dpr : 0); x.imageSmoothingEnabled = false; x.textBaseline = 'alphabetic'; // (the Windows window's contents sit 9 higher: measured against the capture)
  if (!win) { btn = dButton('Skip', 202, 310, 52, 24, onBtn, { hot: -1 }); d = dDialog(456, 364, null, [c, btn], 'Summary of battle'); d.classList.add('dd-black'); } // (placed as every window, by placeDos: 88 from the screen's left, 4 left of its middle)
  const prevClose = () => { stop = true; };
  const mo = new MutationObserver(() => { if (!d.isConnected) { stop = true; mo.disconnect(); } }); mo.observe(document.body, { childList: true });
  const pat = (col) => { const p = document.createElement('canvas'); p.width = p.height = 2; const q = p.getContext('2d'); q.fillStyle = col; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); return x.createPattern(p, 'repeat'); };
  const grayPat = pat('#000'), whiteGray = pat('#fff');
  const text = (t, h, v, bold, center) => { x.font = win ? (bold ? "13px 'Win31 System', 'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif" : F9) : bold ? C12 : F9; /* (the Windows look's group words too in the small pixel face: Jake's Windows battles, audit/win-2.0/captures/image0030-0060) */ x.fillStyle = '#fff'; x.textAlign = center ? 'center' : 'left'; x.fillText(t, h, v); }; // (the title, the names, the result and "Round n" in Chicago 12, the groups' words in Geneva 9: Jake's battle captures, image0033-0174)
  let seed = (b.id | 0) * 7919 + 13; const rnd = (lo, hi) => { seed = (seed * 16807) % 2147483647; return lo + (seed % (hi - lo + 1)); };
  const stars = Array.from({ length: 35 }, () => [rnd(5, 440), rnd(5, 348)]);
  const drawStars = () => { x.fillStyle = '#fff'; for (const [h, v] of stars) x.fillRect(h, v, 1, 1); };
  const face = (o, ci) => {
    const p = g.players[o]; if (!p) return;
    const id = o === ME ? (p.female ? 1500 : 1000) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20), im = pic('i' + id);
    if (im) x.drawImage(im, FACE[ci][0], FACE[ci][1], 32, 32);
    if (o !== ME || k.live) text(p.name || '', FACE[ci][0] + (win ? 38 : 36), FACE[ci][1] + (win ? 29 : 28), true); // (DOS: 2 left and 1 up of the Windows look's place, in Chicago 12: image0033) // (a battle announced in the turn's reports names your side too: captured, battles/v20dos-orig-battle01..06; Review Battle's summary does not, v20dos-orig-battle-summary)
  };
  const groupWords = (gr) => { if (gr.planet) return P0.planetWords(pop); const u = b.start[gr.units[0]], dd = H.getDesign(g, u.o, u.did) || { type: u.t, name: '', W: 1, S: 1 }; return P0.shipWords(dd, gr.units.filter(i => alive[i]).length, gr.units.length, u.o === ME); };
  const drawGroup = (gr) => {
    let [sx0, sy0] = SHIP[gr.ci]; const gy = sy0 + PIT * gr.row;
    x.fillStyle = '#000'; x.fillRect(sx0 - 40, gy - 3, 200, PIT - 1);
    let im = null, w = 97, h = 35;
    // (a planet, and a satellite, is one 40 x 40 picture, not the three parts of a ship: the small set's planet 12757 and satellite 12900 + Weapons (Mac 2.0.1
    // DrawShipPicture: 2257 + 500 + 10000; the DOS program's d12757, d12901-12926), at its own size, centred on the group's words and 3 above its row: fitted to
    // Jake's captures with no pixel off (image0033: the planet at 73, 59 of the window and its satellites 53 apart; image0153: the planet on the right at 348, 59))
    const one = groupOne(gr);
    if (one) { const [ox, oy] = oneAt(gr); x.drawImage(one, ox, oy, 40, 40); sx0 = ox; w = 40; }
    else if (!gr.planet) { const u = b.start[gr.units[0]], dd = H.getDesign(g, u.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 }; im = a.shipPic(dd, u.o); }
    if (im) { w = Math.round(im.width * 35 / im.height); x.drawImage(im, sx0, gy, w, 35); }
    const n = gr.units.filter(i => alive[i]).length;
    if (!gr.planet) {
      let f = 0, q = -1; for (const i of gr.units) { const hh = hurt[i]; if (hh && hh.n > q && alive[i]) { q = hh.n; f = hh.f; } }
      let l = sx0, r = sx0 + w; if (n > 0) r = Math.min(sx0 + w, sx0 + Math.trunc(w * Math.max(0, Math.min(1, f))));
      if (r > l) { x.fillStyle = grayPat; if (one) x.fillRect(l, oneAt(gr)[1], r - l, 40); else x.fillRect(l, gy, r - l, 35); }
    }
    text(groupWords(gr), CAPC[gr.ci], gy + 47, false, true); drawStars();
  };
  const paintHead = () => { x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh); drawStars(); text(P0.head[0], win ? 219 : 220, 34, true, true); text(P0.head[1], win ? 219 : 220, 50, true, true); [0, 1].forEach(ci => { if (owners[ci] != null) face(owners[ci], ci); }); };
  const roundLabel = (n) => { x.fillStyle = '#000'; x.fillRect(190, 263, 80, 21); text(tx('Round %d').replace('%d', n), 198, win ? 280 : 277, true); }; // (DOS: 3 higher, image0033)
  paintHead();
  [0, 1].forEach(ci => { if (hidden[ci]) { const L = rs.battleLines || {}; text(L.noInfo || '', win ? 150 : 159, win ? 100 : 116, true); text(L.destroyed || '', win ? 150 : 159, win ? 116 : 132, true); /* (DOS: at 164, 112 and 128 of the window, the glyphs' tops: Jake's image0058, 0063, 0170) */ skip = true; } else cols[ci].forEach(drawGroup); });
  const wait = (until) => new Promise(res => { const f = () => (stop || skip || performance.now() >= until ? res() : setTimeout(f, Math.min(TICK, until - performance.now()))); f(); });
  const cellOf = (ev, shooter) => shooter ? (ev.si >= 0 ? where.get(ev.si) : planetAt[ev.a]) : (ev.p ? planetAt[b.planetOwner] : where.get(ev.ti));
  const pxLine = (h0, v0, h1, v1, col) => { x.fillStyle = col; let dx = Math.abs(h1 - h0), dy = -Math.abs(v1 - v0), sx = h0 < h1 ? 1 : -1, sy = v0 < v1 ? 1 : -1, e = dx + dy;
    for (;;) { x.fillRect(h0, v0, 1, 1); if (h0 === h1 && v0 === v1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; h0 += sx; } if (e2 <= dx) { e += dx; v0 += sy; } } };
  async function laser(s, t) {
    let x1 = SHIP[s.ci][0], y1 = SHIP[s.ci][1] + PIT * s.row + 18, x2 = SHIP[t.ci][0], y2 = SHIP[t.ci][1] + PIT * t.row + 18;
    if (x2 > x1) { x1 += 121; x2 -= 1; } else { x2 += 121; x1 -= 1; }
    const dx = Math.trunc((x2 - x1) / 5), dy = Math.trunc((y2 - y1) / 5);
    const cols = win16(boltColours(shooterW(s)), true);
    const seg = (h0, v0, h1, v1, col) => { for (const o of [0, 1, -1, 2, -2]) pxLine(h0, v0 + o, h1, v1 + o, col || cols[Math.abs(o)]); }; // (whole pixels, as QuickDraw's LineTo: an anti-aliased line left a trail when drawn over in black)
    let h = x1, v = y1, ph = -1, pv = -1;
    for (let i = 0; i < 5 && !stop && !skip; i++) { const t0 = performance.now(); seg(h, v, h + dx, v + dy); if (ph !== -1) seg(ph, pv, h, v, '#000'); ph = h; pv = v; h += dx; v += dy; await wait(t0 + TICK); }
    seg(ph, pv, h, v, '#000');
  }
  async function explosion(t, ev) {
    const dm = ev.dm | 0, im = pic('s' + (12000 + (dm % 3)));
    if (ev.snd !== 3003) { if (im) x.drawImage(im, SHIP[t.ci][0] + (dm % 103), SHIP[t.ci][1] + PIT * t.row + (dm % 23), 17, 17); return; }
    // a kill (sound 3003): Mac 2.0.1's colour DrawExplosion @d412e, which the DOS program draws too (captured: battles/v20dos-orig-battle01-00203,
    // -battle02-00566, -battle05-01374): over the group's picture rectangle, 59 framed ovals from the middle out, the s-th inset s across and s / 3
    // down (40 s / 120), its hue (59 - s) x 175 from red; the DOS palette gives three bands, measured: s 45 and up red, 20 to 44 (255, 48, 0), 1 to
    // 19 (255, 101, 0). Then the same ovals in black from the outside in, and the group is drawn again. Two ovals a tick, as the program's BattleWait.
    const [sx0, sy0] = SHIP[t.ci], gy = sy0 + PIT * t.row, w = groupW(t), one = groupOne(t) ? oneAt(t) : null, L = one ? one[0] : sx0, T0 = one ? one[1] : gy, R = L + w, B = T0 + (one ? 40 : 35);
    // an oval's row spans (its rectangle l..r x tp..bt, ends excluded, as QuickDraw's); a ring is the s-th oval less the (s + 1)-th, so whole pixels
    // and nothing left over when the same rings are drawn in black
    const spans = (s) => { const l = L + s, r = R - s, tp = T0 + Math.trunc(s / 3), bt = B - Math.trunc(s / 3), m = new Map(); if (r - l < 1 || bt - tp < 1) return m;
      const cx = (l + r) / 2, cy = (tp + bt) / 2, rx = (r - l) / 2, ry = (bt - tp) / 2;
      for (let v = tp; v < bt; v++) { const dy = (v + 0.5 - cy) / ry, k = 1 - dy * dy; if (k <= 0) continue; const hw = rx * Math.sqrt(k); m.set(v, [Math.round(cx - hw), Math.round(cx + hw)]); } return m; };
    const oval = (s, col) => { const A0 = spans(s), A1 = spans(s + 1); x.fillStyle = col;
      for (const [v, [h0, h1]] of A0) { const inner = A1.get(v); if (!inner) { x.fillRect(h0, v, h1 - h0, 1); continue; } if (inner[0] > h0) x.fillRect(h0, v, inner[0] - h0, 1); if (h1 > inner[1]) x.fillRect(inner[1], v, h1 - inner[1], 1); } };
    let t1 = performance.now();
    const OV = win16(['#ff0000', '#ff3000', '#ff6500']); for (let s = 59; s >= 1 && !stop && !skip; s--) { oval(s, s >= 45 ? OV[0] : s >= 20 ? OV[1] : OV[2]); if (s % 2 === 0) { t1 += TICK; await wait(t1); } }
    for (let s = 1; s <= 59 && !stop && !skip; s++) { oval(s, '#000'); if (s % 2 === 0) { t1 += TICK; await wait(t1); } }
    drawGroup(t);
  }
  // the shooting group's Weapons: its design's, or for a planet its owner's (as the shot's colour, DrawLaserBlast @d3e20's hue (W - 1) x 4000)
  function shooterW(s) { if (s.planet) { const p = g.players[s.o]; return Math.max(1, Math.trunc(p && p.tech ? p.tech.weapons || 1 : 1)); } const u = b.start[s.units[0]], dd = u && H.getDesign(g, u.o, u.did); return Math.max(1, Math.trunc(dd && dd.W || 1)); }
  function groupOne(gr) { if (gr.planet) return pic('d12757'); const u = b.start[gr.units[0]], dd = u && H.getDesign(g, u.o, u.did); return dd && dd.type === 'satellite' ? pic('d' + (12900 + Math.max(1, Math.min(26, dd.W | 0)))) : null; }
  function oneAt(gr) { return [Math.ceil(CAPC[gr.ci] - 20), SHIP[gr.ci][1] + PIT * gr.row - 3]; }
  function groupW(gr) { if (groupOne(gr)) return 40; if (gr.planet) return 97; const u = b.start[gr.units[0]], dd = H.getDesign(g, u.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 }, im = a.shipPic(dd, u.o); return im ? Math.round(im.width * 35 / im.height) : 97; }
  const apply = (ev) => { if (ev.p) { if (ev.php != null) pop = ev.php / 1000; } else { if (ev.f != null) hurt[ev.ti] = { n: ++seq, f: ev.f }; if (ev.k) alive[ev.ti] = false; } };
  const finish = () => {
    if (stop) return;
    for (const r of b.rounds) for (const ev of r) apply(ev);
    pop = fPop; done = true; paintHead(); roundLabel(Math.max(1, b.rounds.length));
    [0, 1].forEach(ci => { if (!hidden[ci]) cols[ci].forEach(drawGroup); });
    [0, 1].forEach(ci => { const o = owners[ci]; if (o == null) return; const left = b.start.some((u, i) => alive[i] && u.o === o) || (b.planetOwner === o && pop > 0.0005);
      if (!left) { const [h, v] = FACE[ci]; x.strokeStyle = '#8a0000'; x.lineWidth = 2; x.beginPath(); x.moveTo(h + 1, v + 1); x.lineTo(h + 33, v + 32); x.moveTo(h + 1, v + 32); x.lineTo(h + 33, v + 1); x.stroke(); } });
    const P = rs.battlePanel(g, b, { alive, hurt, pop, over: true, won }, ME);
    (P.end || []).forEach((t, i) => text(t, 217.5, i ? 172 : 156, true, true));
    const im = pic(won ? 'd3500' : 'd3510'); if (im) x.drawImage(im, 183, 184, 74, 74);
    btn.querySelector('span').textContent = 'OK';
  };
  (async () => {
    let deadline = performance.now() + speed * TICK;
    for (let r = 0; r < b.rounds.length && !stop && !skip; r++) {
      roundLabel(r + 1); const R = b.rounds[r];
      for (let e = 0; e < R.length && !stop && !skip;) {
        let n = 1; if (!VB.full) while (R[e + n] && R[e + n].si === R[e].si && R[e + n].a === R[e].a && !R[e + n - 1].k) n++;
        for (let j = 0; j < n - 1; j++) apply(R[e + j]);
        const ev = R[e + n - 1], s = cellOf(ev, true), t = cellOf(ev, false);
        if (s && t && !hidden[t.ci] && !hidden[s.ci]) { await laser(s, t); if (stop || skip) break; a.Sound.play(k.shotSnd(ev, 3000)); apply(ev); drawGroup(t); deadline += speed * TICK; await explosion(t, ev); await wait(deadline); } else apply(ev);
        e += n;
      }
      if (b.popR && b.popR[r] != null) pop = b.popR[r];
    }
    finish();
  })();
}
// ======== The map's scroll bars and zoom (measured on the running program: v20dos-orig-*.png and DOSBox clicks) ========
// The program's map is a window onto a galaxy of cells: the zoom's cell is 6, 9, 12 or 17 pixels (Zoom In at 17 is dimmed, measured: stars 410.7 apart at 17 and
// 290.5 at 12, ratio 0.707 = 12/17); the galaxy of the captured game was 27 cells a side (it scrolled 4 cells across and 2 down at 17, in a 392 x 434 pane); the remake's galaxies have their own sizes,
// so a side is 2 x its size cells, with room after the last star; an arrow scrolls one cell (17 pixels, measured), the thumb is a fixed 7 x 13 box and rests at the far end when nothing scrolls (measured at Zoom Out).
// Not measured and taken from the Mac 1.2 program's rules (the same lineage; js/skins/mac12): a page is three quarters of the cells in view, a held arrow repeats every
// 100 ms, CenterOnStar centres the selected star on a zoom (unless it is already inside the pane's margins), the opening view is Zoom In on your home star.
const DZ = [6, 9, 12, 17].map(z => z * 2);
// With modern conveniences, three closer zooms beyond the program's largest (the remake's, as the Mac skins'); the plain game keeps the four.
const DZM = DZ.concat([24, 34, 48].map(z => z * 2));
const dzs = () => { const a = window.HOAPI, g = a && a.G; return g && g.opts && g.opts.modern ? DZM : DZ; };
const dzIdx = (s) => { const Z = dzs(); let b = 0; Z.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(Z[b] / s))) b = i; }); return b; };
function dzoomTo(s, f) { const Z = dzs(), cur = dzIdx(s); let i = dzIdx(s * f); if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1); return Z[Math.max(0, Math.min(Z.length - 1, i))]; }
const DB = { H: 0, V: 0, maxH: 0, maxV: 0, pgH: 0, pgV: 0, s: 0, wrap: null, v: null, h: null, press: null, drag: null, shown: false };
const GEO = new WeakMap();
function dgeo(g) {
  let r = GEO.get(g); if (r && r.n === g.stars.length) return r;
  const xs = g.stars.map(s => s.x), ys = g.stars.map(s => s.y);
  // (the cell of a star is 2 x its place, so a star 1 in from the edge is 2 cells in, clear of the End Turn button; room is kept after the last star for its fleets' dots)
  const mg = Math.min(0, Math.floor((Math.min(...xs, ...ys) - 1) * 2) / 2); // (a ruleset that places stars nearer than 1 to the edge gets room at the top and left)
  r = { n: g.stars.length, mg, cw: Math.max(Math.round(g.W * 2), Math.floor(2 * (Math.max(...xs) - mg)) + 3), ch: Math.max(Math.round(g.H * 2), Math.floor(2 * (Math.max(...ys) - mg)) + 3) };
  GEO.set(g, r); return r;
}
const dcells = (g) => { const r = dgeo(g); return [r.cw, r.ch]; };
let DMG = 1; // (the origin of the galaxy being shown)
function dMetrics(s, mapW, mapH, g) {
  DMG = dgeo(g).mg;
  const z = s / 2, [cw, ch] = dcells(g), visH = Math.max(1, Math.floor(mapW / z + 1e-6)), visV = Math.max(1, Math.floor(mapH / z + 1e-6));
  DB.maxH = visH < cw ? cw - visH : 0; DB.maxV = visV < ch ? ch - visV : 0; DB.pgH = Math.trunc(visH * 3 / 4); DB.pgV = Math.trunc(visV * 3 / 4);
}
const dCellOf = (v) => [(-(2 * DMG - 0.5) * (v.s / 2) - v.ox) / (v.s / 2), (-(2 * DMG - 0.5) * (v.s / 2) - v.oy) / (v.s / 2)];
const dPut = (v, H, V) => { v.ox = (-(2 * DMG - 0.5) - H) * (v.s / 2); v.oy = (-(2 * DMG - 0.5) - V) * (v.s / 2); };
const dClamp = (H, V) => [Math.max(0, Math.min(DB.maxH, H)), Math.max(0, Math.min(DB.maxV, V))];
function dCenter(st, g) { const [cw, ch] = dcells(g); return dClamp(Math.round((st.x - DMG) * 2) - Math.trunc((cw - (DB.maxH - 1)) / 2), Math.round((st.y - DMG) * 2) - Math.trunc((ch - (DB.maxV - 1)) / 2)); }
function dSync(v, c) {
  if (!frameOn()) return;
  v.s = dzs()[dzIdx(v.s)]; dMetrics(v.s, c.mapW, c.mapH, c.G);
  let [H, V] = dCellOf(v);
  if (DB.s && DB.s !== v.s && c.sel != null && c.G.stars[c.sel]) [H, V] = dCenter(c.G.stars[c.sel], c.G); // (Zoom In / Zoom Out: the selected star is centred)
  else if (!c.live) { H = Math.round(H); V = Math.round(V); }
  [H, V] = dClamp(H, V); dPut(v, H, V); DB.H = H; DB.V = V; DB.s = v.s;
}
function dCenterOn(v, sid, c) {
  if (!frameOn()) return false; const st = c.G.stars[sid]; if (!st) return false;
  v.s = dzs()[dzIdx(v.s)]; dMetrics(v.s, c.mapW, c.mapH, c.G);
  const [H, V] = dCellOf(v), z = v.s / 2, px = (((st.x - DMG) * 2) - H + 0.5) * z, py = (((st.y - DMG) * 2) - V + 0.5) * z;
  if (px > 40 && px < c.mapW - 40 && py > 40 && py < c.mapH - 85) return true;
  const [h2, v2] = dCenter(st, c.G); dPut(v, h2, v2); return true;
}
const atZoomD = (k) => { const a = window.HOAPI; return !!a && !!a.UI.view && dzIdx(a.UI.view.s) === k; };
// the bar's pixels (program pixels; the vertical bar is 7 x 433 at 393 right and 1 down of the map's corner, the horizontal 391 x 13 at 1 right and 435 down)
function dBox(q, x, y, w, h) {
  q.rect(x, y, x + w, y + h, '#aaa'); q.rect(x, y, x + w - 1, y + 1, '#fff'); q.rect(x, y + 1, x + 1, y + h - 1, '#fff');
  q.rect(x + w - 1, y, x + w, y + h, '#555'); q.rect(x, y + h - 1, x + w, y + h, '#555');
}
const dGlyph = (q, x, y, rows) => rows.forEach(([r, c0, c1]) => q.rect(x + c0, y + r, x + c1 + 1, y + r + 1, '#000'));
function dPaintBar(b, o) {
  const q = b.q, L = b.L, v = b.vertical;
  if (b.win) { wBar(q, 0, 0, L, v, o.max > 0 ? o.value / o.max : null, o.press); return; }
  q.rect(0, 0, v ? 7 : L, v ? L : 13, '#000');
  const full = o.max > 0 ? o.value / o.max : 1;
  if (v) {
    q.rect(0, 14, 6, L - 14, '#aaa');
    dBox(q, 0, 0, 7, 14); dGlyph(q, 0, 0, [[3, 2, 3], [4, 1, 4], [5, 1, 4], [6, 2, 3], [7, 2, 3], [8, 2, 3], [9, 2, 3], [10, 2, 3]]);
    dBox(q, 0, L - 14, 7, 14); dGlyph(q, 0, L - 14, [[3, 2, 3], [4, 2, 3], [5, 2, 3], [6, 2, 3], [7, 1, 4], [8, 1, 4], [9, 2, 3], [10, 2, 3]]);
    const t = 14 + Math.round((L - 28 - 13) * full); dBox(q, 0, t, 7, 13); dGlyph(q, 0, t, [2, 3, 4, 5, 6, 7, 8, 9].map(r => [r, 2, 3]));
  } else {
    q.rect(8, 0, L - 8, 12, '#aaa');
    dBox(q, 0, 0, 8, 13); dGlyph(q, 0, 0, [[2, 4, 4], [3, 3, 4], [4, 2, 4], [5, 1, 4], [6, 1, 4], [7, 2, 4], [8, 3, 4], [9, 4, 4]]);
    dBox(q, L - 8, 0, 8, 13); dGlyph(q, L - 8, 0, [[2, 3, 3], [3, 3, 4], [4, 3, 5], [5, 3, 6], [6, 3, 6], [7, 3, 5], [8, 3, 4], [9, 3, 3]]);
    const t = 8 + Math.round((L - 16 - 7) * full); dBox(q, t, 0, 7, 13);
  }
  if (o.press) { // (a held arrow: its box pressed in)
    const r = o.press === 'lo' ? (v ? [0, 0, 7, 14] : [0, 0, 8, 13]) : (v ? [0, L - 14, 7, 14] : [L - 8, 0, 8, 13]);
    q.x.globalCompositeOperation = 'difference'; q.rect(r[0] + 1, r[1] + 1, r[0] + r[2] - 1, r[1] + r[3] - 1, '#fff'); q.x.globalCompositeOperation = 'source-over';
  }
}
// The Windows program's scroll bars (Windows 3.1's, measured on win20-orig-vga16-main.png): 17 pixels across with their black edges, a 15 x 15 box at each end
// and a 15 x 15 thumb (white top and left, two rows of shade at the bottom and right), each with its black line, the track the button face; the thumb at
// 17 + (L - 49) * value / max. The arrows, as rows of [row, first, last] in the box:
const WARROW = { u: [[4, 7, 7], [5, 6, 8], [6, 5, 9], [7, 4, 10], [8, 6, 8], [9, 6, 8], [10, 6, 8]], d: [[4, 6, 8], [5, 6, 8], [6, 6, 8], [7, 4, 10], [8, 5, 9], [9, 6, 8], [10, 7, 7]],
  l: [[4, 7, 7], [5, 6, 7], [6, 5, 10], [7, 4, 10], [8, 5, 10], [9, 6, 7], [10, 7, 7]], r: [[4, 7, 7], [5, 7, 8], [6, 4, 9], [7, 4, 10], [8, 4, 9], [9, 7, 8], [10, 7, 7]] };
function wBox(q, x, y, glyph) {
  q.rect(x, y, x + 15, y + 15, '#c0c0c0'); q.rect(x, y, x + 14, y + 1, '#fff'); q.rect(x, y + 1, x + 1, y + 14, '#fff');
  q.rect(x + 13, y + 1, x + 15, y + 15, '#808080'); q.rect(x + 1, y + 13, x + 15, y + 15, '#808080'); q.rect(x, y + 14, x + 1, y + 15, '#808080'); q.rect(x + 14, y, x + 15, y + 1, '#808080');
  if (glyph) dGlyph(q, x, y, glyph);
}
function wBar(q, x, y, L, vertical, frac, press) {
  const r = (a, b, c, d, col) => (vertical ? q.rect(x + a, y + b, x + c, y + d, col) : q.rect(x + b, y + a, x + d, y + c, col));
  r(0, 0, 17, L, '#000'); r(1, 17, 16, L - 17, '#c0c0c0');
  const box = (o, g) => { if (vertical) wBox(q, x + 1, y + o, g); else wBox(q, x + o, y + 1, g); };
  box(1, vertical ? WARROW.u : WARROW.l); box(L - 16, vertical ? WARROW.d : WARROW.r);
  if (frac != null) { const t = 17 + Math.round((L - 49) * Math.max(0, Math.min(1, frac))); r(1, t - 1, 16, t, '#000'); box(t); r(1, t + 15, 16, t + 16, '#000'); }
  if (press) { const o = press === 'lo' ? 1 : L - 16; q.x.globalCompositeOperation = 'difference'; if (vertical) q.rect(x + 1, y + o, x + 16, y + o + 15, '#fff'); else q.rect(x + o, y + 1, x + o + 15, y + 16, '#fff'); q.x.globalCompositeOperation = 'source-over'; }
}
const dVals = (b) => (b.vertical ? { value: DB.V, max: DB.maxV, page: DB.pgV } : { value: DB.H, max: DB.maxH, page: DB.pgH });
const dActive = (b) => dVals(b).max > 0 && !document.querySelector('.scrim');
function dSetCells(H, V) { const a = window.HOAPI, v = a.UI.view; if (!v) return; const [h2, v2] = dClamp(H, V); dPut(v, h2, v2); a.draw(); }
function dScrollBy(b, d) { const cur = Math.round(b.vertical ? DB.V : DB.H), nv = Math.max(0, Math.min(dVals(b).max, cur + d)); if (nv === cur) return false; if (b.vertical) dSetCells(DB.H, nv); else dSetCells(nv, DB.V); return true; }
function dPart(b, p) {
  const { value, max } = dVals(b), L = b.L, e = b.e, th = b.th;
  if (p < e) return 'lo'; if (p >= L - e) return 'hi';
  const T = L - 2 * e - th, t = e + Math.round(T * value / max);
  if (T >= 0 && p >= t && p < t + th) return 'thumb';
  return p < t ? 'pagelo' : 'pagehi';
}
function dWire(b) {
  const el = b.el, pos = (e) => { const r = b.q.c.getBoundingClientRect(); return ((b.vertical ? e.clientY - r.top : e.clientX - r.left) / (b.vertical ? r.height : r.width)) * b.L; };
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); el.focus({ preventScroll: true }); if (!dActive(b)) return;
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const p = pos(e), part = dPart(b, p), { value, max } = dVals(b), e0 = b.e, th = b.th;
    if (part === 'thumb') { DB.drag = { b, p0: p, t0: e0 + (b.L - 2 * e0 - th) * value / max, id: e.pointerId }; return; }
    const st = { b, part, id: e.pointerId, p, timer: 0 }; DB.press = st;
    const tick = () => { if (DB.press !== st) return; if (dPart(b, st.p) === part) { const g = dVals(b); dScrollBy(b, part === 'lo' ? -1 : part === 'hi' ? 1 : part === 'pagelo' ? -g.page : g.page); } dBars(); st.timer = setTimeout(tick, 100); };
    tick();
  });
  el.addEventListener('pointermove', (e) => {
    if (DB.press && DB.press.b === b && DB.press.id === e.pointerId) { DB.press.p = pos(e); dBars(); }
    else if (DB.drag && DB.drag.b === b && DB.drag.id === e.pointerId) { // (the thumb: the map follows it a cell at a time)
      const g = DB.drag, e0 = b.e, T = b.L - 2 * e0 - b.th, t = Math.max(e0, Math.min(e0 + T, g.t0 + pos(e) - g.p0)), max = dVals(b).max;
      const nv = Math.round(T > 0 ? (t - e0) / T * max : 0); if (nv !== Math.round(b.vertical ? DB.V : DB.H)) { if (b.vertical) dSetCells(DB.H, nv); else dSetCells(nv, DB.V); }
    }
  });
  const up = (e) => { if (DB.press && DB.press.b === b && DB.press.id === e.pointerId) { clearTimeout(DB.press.timer); DB.press = null; dBars(); } else if (DB.drag && DB.drag.b === b && DB.drag.id === e.pointerId) { DB.drag = null; dBars(); } };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', (e) => { // (from the keyboard, the remake's: arrows a cell, Page Up and Down a page)
    const g = dVals(b); if (!dActive(b)) return;
    const d = { ArrowUp: b.vertical && -1, ArrowLeft: !b.vertical && -1, ArrowDown: b.vertical && 1, ArrowRight: !b.vertical && 1, PageUp: -g.page, PageDown: g.page }[e.key];
    if (d) { e.preventDefault(); dScrollBy(b, d); }
  });
}
function dEnsureBars() {
  const win = winOn();
  // (with the modern convenience's bigger frame the bars run the map window's length: 433 and 391 on the program's 640 x 476)
  const lv = DOSGROW.on ? DOSGROW.h - 43 : 433, lh = DOSGROW.on ? DOSGROW.w - 249 : 391;
  if (DB.wrap && DB.wrap.isConnected && DB.win === win && (win || (DB.lv === lv && DB.lh === lh))) return true;
  if (DB.v) { DB.v.el.remove(); DB.h.el.remove(); }
  const a = window.HOAPI, host = document.getElementById('mapwrap'); if (!a || !host) return false;
  // (the Windows program's: Windows' bars, 17 across, the vertical 293 long, the horizontal 375 (measured); the arrow boxes and the thumb 17 and 15 along: wBar)
  const mk = (vertical) => {
    const L = win ? (vertical ? 293 : 375) : vertical ? lv : lh, T = win ? 17 : vertical ? 7 : 13, q = dq(vertical ? T : L, vertical ? L : T, vertical ? 'Vertical scroll bar' : 'Horizontal scroll bar'), el = a.el('div', { class: 'dosbar ' + (vertical ? 'v' : 'h'), role: 'scrollbar', tabindex: 0, 'aria-orientation': vertical ? 'vertical' : 'horizontal', 'aria-controls': 'map', 'aria-label': vertical ? 'Map, up and down' : 'Map, left and right' }, q.c);
    q.c.removeAttribute('role'); q.c.setAttribute('aria-hidden', 'true'); return { vertical, q, el, L, key: '', win, e: win ? 17 : vertical ? 14 : 8, th: win ? 15 : vertical ? 13 : 7 };
  };
  DB.v = mk(true); DB.h = mk(false); host.append(DB.v.el, DB.h.el); DB.wrap = host; DB.win = win; DB.lv = lv; DB.lh = lh; [DB.v, DB.h].forEach(dWire); return true;
}
function dBars() {
  const a = window.HOAPI; if (!a || !frameOn() || !a.G || !dEnsureBars()) { if (DB.v) { DB.v.el.style.display = DB.h.el.style.display = 'none'; } return; }
  const g = a.G; DB.v.el.style.display = DB.h.el.style.display = '';
  for (const b of [DB.v, DB.h]) {
    const vals = dVals(b), act = dActive(b), press = DB.press && DB.press.b === b && /^(lo|hi)$/.test(DB.press.part) && dPart(b, DB.press.p) === DB.press.part ? DB.press.part : null;
    const key = [vals.value, vals.max, press, U, window.devicePixelRatio].join();
    b.el.setAttribute('aria-valuemin', '0'); b.el.setAttribute('aria-valuemax', String(vals.max)); b.el.setAttribute('aria-valuenow', String(Math.round(vals.value))); b.el.setAttribute('aria-disabled', vals.max > 0 ? 'false' : 'true');
    if (b.key !== key) { b.key = key; dPaintBar(b, { value: vals.value, max: vals.max, press }); }
  }
}
function dMapFit(v, c) { if (!frameOn()) return; const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = DZ[3]; if (st) { dMetrics(v.s, c.mapW, c.mapH, c.G); const [H, V] = dCenter(st, c.G); dPut(v, H, V); } }
// ======== The original's screen: a 640 x 476 frame in a unit u (docs/dos20-findings.md, "Rebuilding the dos skin") ========
// Measured on the running program (DOSBox, screenshots v20dos-orig-*.png): the window is 640 x 476, a 15-row teal title bar, a 13-row grey menu bar,
// then the left column 240 wide (planet 74, fleets 79, totals 43, players and budget bars 169, Tech Spending 83 rows) and the map. Every length below is in
// the program's pixels; the page's unit u (CSS pixels per program pixel, --u) fits the frame to the window. The map is drawn in those pixels
// (T.mapPixel, as the Amiga skin does). Under the "DOS" OS look (html.os-dos) and, as the Windows program lays it out, under "Windows 3.1"
// (html.os-win31: the 640 x 480 screen with WINHO.EXE's main window, its Tech Spending and Reports windows; winOn below and js/skins/dos/win31/frame.css).
let U = 1;
const winOn = () => document.documentElement.classList.contains('os-win31');
const frameOn = () => document.documentElement.classList.contains('os-dos') || winOn();
function setUnit() {
  const de = document.documentElement, u0 = Math.min(window.innerWidth / 640, window.innerHeight / (winOn() ? 480 : 476));
  U = u0 >= 1 ? Math.floor(u0 * 2) / 2 : Math.max(0.4, u0);
  de.style.setProperty('--u', String(U));
  // (a modern convenience, Jake 22 Nov 2026: DOS had one 640 x 476 screen and no way to make it bigger; with the conveniences on, in a
  // game, the frame takes the whole window at the same scale, the left column the program's 240 and the map window all the rest)
  const a = window.HOAPI, grow = frameOn() && !winOn() && !!(a && a.G && a.modern && a.modern()) && !!(document.getElementById('titlescreen') || {}).hidden;
  de.classList.toggle('dosgrow', grow);
  DOSGROW.w = grow ? Math.max(640, Math.floor(window.innerWidth / U)) : 640; DOSGROW.h = grow ? Math.max(476, Math.floor(window.innerHeight / U)) : 476;
  if (grow) { de.style.setProperty('--dw', String(DOSGROW.w)); de.style.setProperty('--dh', String(DOSGROW.h)); }
  DOSGROW.on = grow;
}
const DOSGROW = { on: false, w: 640, h: 476 };
// (the setting and the game come and go without a resize: looked at twice a second, and the map fitted again when the frame changes)
setInterval(() => { const was = [DOSGROW.on, DOSGROW.w, DOSGROW.h].join(); setUnit(); if (was !== [DOSGROW.on, DOSGROW.w, DOSGROW.h].join()) { const a = window.HOAPI; if (a && a.G && a.resize) { a.resize(); a.renderPanel(); a.draw(); } window.dispatchEvent(new Event('hoframe')); } }, 500);
const F9 = "12px 'DOS Geneva 9'", F9B = "12px 'DOS Geneva 9 Bold'", C12 = "15px 'DOS Chicago 12'";
// the Windows program's panels are in MS Sans Serif 8 (measured: capitals 8 pixels, lines 14 apart) and the planet's name in the bold System font
// (capitals 10); neither font is in the repo, so the look's MS Sans Serif / Arial at those sizes (docs/win20-findings.md)
const WSANS = "'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif", WFONT = { [F9]: '11px ' + WSANS, [F9B]: 'bold 11px ' + WSANS, [C12]: "13px 'Win31 System', " + WSANS };
const wf = (f) => (winOn() && WFONT[f]) || f, WK = 1; // (the real MS Sans Serif bitmap, from Windows 3.1's disks: js/os/win31.css, needs no narrowing)
let fontsReady = false;
function loadFonts() {
  if (fontsReady || !document.fonts) return;
  Promise.all(["12px 'DOS Geneva 9'", "12px 'DOS Geneva 9 Bold'", "15px 'DOS Chicago 12'"].map(f => document.fonts.load(f))).then(() => {
    fontsReady = true; const a = window.HOAPI; if (a && a.G && frameOn()) a.renderPanel();
  }, () => {});
}
// a box drawn in the program's pixels (w x h of them), as wide as w units
function dq(w, h, label) {
  const a = window.HOAPI, dpr = window.devicePixelRatio || 1;
  const c = a.el('canvas', { class: 'dq', width: Math.round(w * U * dpr), height: Math.round(h * U * dpr), role: 'img', 'aria-label': label || '' });
  c.style.width = `calc(${w} * var(--du))`; c.style.height = `calc(${h} * var(--du))`; // (--du, in px: --u alone has no unit, the size was dropped and a 2x screen drew the canvas at twice its size)
  const x = c.getContext('2d'); x.setTransform(U * dpr, 0, 0, U * dpr, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
  x.textBaseline = 'alphabetic'; x.imageSmoothingEnabled = false;
  const api = {
    c, x, w, h,
    // y: the baseline; o.right / o.center: the text ends / is centred at that x
    text(t, px, y, font, o) {
      o = o || {}; c.dataset.t = (c.dataset.t ? c.dataset.t + '\n' : '') + t;
      x.font = wf(font || F9); x.fillStyle = o.color || '#000'; x.textAlign = o.right != null ? 'right' : o.center != null ? 'center' : 'left';
      const ax = o.right != null ? o.right : o.center != null ? o.center : px;
      // (Arial, standing in for the Windows program's MS Sans Serif, is about a tenth wider: narrowed to its widths)
      if (winOn()) { x.save(); x.translate(ax, 0); x.scale(WK, 1); x.fillText(t, 0, y); x.restore(); }
      // (centred on a whole pixel: an odd width put the bitmap face on a half pixel and blurred it, the planet's name, Jake 20 Nov)
      else if (o.center != null) { x.textAlign = 'left'; x.fillText(t, Math.floor(ax - x.measureText(t).width / 2), y); } else x.fillText(t, ax, y);
    },
    width(t, font) { x.font = wf(font || F9); return x.measureText(t).width * (winOn() ? WK : 1); },
    hline(x0, x1, y) { x.fillStyle = '#000'; x.fillRect(x0, y, x1 - x0, 1); },
    vline(x0, y0, y1) { x.fillStyle = '#000'; x.fillRect(x0, y0, 1, y1 - y0); },
    rect(l, t, r, b, col) { x.fillStyle = col; x.fillRect(l, t, r - l, b - t); },
    at(ev) { const r = c.getBoundingClientRect(); return { h: (ev.clientX - r.left) * w / r.width, v: (ev.clientY - r.top) * h / r.height }; },
  };
  return api;
}

// the panels' words in the two languages the program has: English, and the German build's own (HO.PRS strings 385-409, 666, 667; the data pool: "Besitz:", "Info Datum: %u",
// "Auftragsliste:", "Keine Flotten auf diesem Planeten.", "Stationiert auf: %Fs", "Tank: %d/%d" ...); another language gets the English panel
const DOSW = {
  en: { income: 'Income:', pop: 'Pop:', temp: 'Temp:', grav: 'Gravity:', metal: 'Metal:', terra: 'Terra', mine: 'Mine', ship: 'Ship', owner: 'Owner:', info: 'Info Date:', battle: 'Battle Date:', queued: 'Ships Queued:', none: 'None.',
    noInfo: 'You have no information about this planet.', noFleets: 'There are no fleets at this planet.', totals: ['Reserve Metal:', 'Total Money:', 'Total Income:'], head: 'Tech  Spending', levels: 'Current Levels:',
    tech: ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'], lin: 'Linear', log: 'Log', techBar: 'Tech', sav: 'Savings' },
  de: { income: 'Profit:', pop: 'Bev.:', temp: 'Temp.:', grav: 'Gravit.:', metal: 'Metall:', terra: 'Terra', mine: 'Met.', ship: 'Schf.', owner: 'Besitz:', info: 'Info Datum:', battle: 'Kampf Datum:', queued: 'Auftragsliste:', none: 'Keine.',
    noInfo: 'Sie haben keine Info über diesen Planeten.', noFleets: 'Keine Flotten auf diesem Planeten.', totals: ['Metall übrig:', 'Geld total:', 'Profit total:'], head: 'Tech Ausgaben', levels: 'Akt. Stufen:',
    tech: ['Weite', 'Tempo', 'Waffen', 'Schilder', 'Mini'], lin: 'Linear', log: 'Log', techBar: 'Tech', sav: 'Sparen' } };
const wl = () => { const a = window.HOAPI; return a && a.G && a.G.opts && a.G.opts.lang === 'de' ? 'de' : 'en'; };
const WD = () => DOSW[wl()];
// the fleet lines the program builds (English, from the ruleset's own text) in the German build's formats
const DE_FLEET = [[/^Stationed at: (.*)$/, 'Stationiert auf: $1'], [/^Departing to: (.*?) \(Dist (\d+); Time (\d+)\)$/, 'Zielort: $1 (Entf. $2; Dauer $3)'], [/^Going to (.*?) \(D (\d+); T (\d+)\) via (.*)$/, 'Unterwegs nach $1 (E $2; D $3) via $4'],
  [/^Fuel: (.*)$/, 'Tank: $1'], [/^Speed: (.*)$/, 'Tempo: $1'], [/^Full$/, 'Voll'], [/^Empty$/, 'Leer'], [/^Scrap: (.*)$/, 'Schrott: $1'], [/^Fleet to be scrapped for metal\.$/, 'Flotte zum Verschrotten.']];
// the German build's fleet row (data pool: "Ein %Fs (%d/%d) %Fs", "%d %Fs (%d/%d) %Fs") with its class names (strings 368-371)
// the remake's windows that the Windows look shows as the Windows program's dialogs (T.window's name: the dialog's in js/skins/dos/win31/dialogs.js)
const W31WIN = { chat: 'sendMsg', autoplay: 'autoPlay', build: 'build', types: 'types', group: 'group', fleets: 'fleets', stars: 'stars', compare: 'compare' };
const DE_CLASS = { scout: 'Späher', fighter: 'Kampfschiff', colony: 'Kolonieschiff', satellite: 'Satellit' };
const deRow = (d, n) => `${n === 1 ? 'Ein' : n} ${d.name} (${d.W}/${d.S}) ${DE_CLASS[d.type] || d.type}`;
const fl = (t) => { if (wl() !== 'de') return t; for (const [re, to] of DE_FLEET) if (re.test(t)) return t.replace(re, to); return t; };
const RS12 = () => (window.HO.RULESETS || {})['12'] || null;
const enView = (g) => Object.assign(Object.create(g), { opts: Object.assign({}, g.opts, { lang: 'en' }) });
const PWORDS = () => { const w = WD(); return { income: w.income, pop: w.pop, temp: w.temp, grav: w.grav, metal: w.metal, terra: w.terra, mine: w.mine, prod: w.ship, owner: w.owner, infoDate: w.info, queued: w.queued, none: w.none, noInfo: w.noInfo, noFleets: w.noFleets }; };
const kvText = (box, key) => { const r = box && box.querySelector(`.kv[data-help="${key}"]`); if (!r) return null; const b = r.querySelector('b'); return { label: r.querySelector('span').textContent, value: b ? Array.from(b.childNodes).filter(n => !(n.classList && n.classList.contains('chg'))).map(n => n.textContent).join('').trim() : '', chg: (r.querySelector('.chg') || {}).textContent || '' }; };
// DrawVBarControl: the bars of a colony (kind 1) and of the technologies (kind 2): a rule up the left with ticks, each bar 18 wide with 9 before it
function vbars(q, x0, y0, vals, kind, names, toPix, colors, geo) {
  const BW = (geo && geo.b) || 18, GP = (geo && geo.g) || 9, d5 = y0 + 50; q.vline(x0, y0, d5 + 1);
  // (the Windows program's ticks are one pixel, its names 12 below the bars and the technologies' second row 14 lower: measured)
  const w = winOn(), tk = w ? 1 : 2, LY = w ? 12 : 11, LZ = w ? 14 : 8;
  if (kind === 2) for (let v = 100; v <= 1000; v += 100) q.hline(x0 - tk, x0, d5 - toPix(v)); else for (let i = 1; i <= 10; i++) q.hline(x0 - tk, x0, d5 - Math.trunc(50 * i / 10));
  let d4 = x0;
  vals.forEach((v, i) => {
    q.hline(d4, d4 + GP + BW, d5 + 1); d4 += GP;
    const hpx = v <= 0 ? 0 : kind === 2 ? toPix(v) : Math.trunc(50 * v / 1000);
    q.rect(d4, d5 - hpx, d4 + BW, d5, colors[i % colors.length]);
    q.text(names[i], d4 + Math.trunc((BW - q.width(names[i])) / 2), d5 + LY + (kind === 2 ? LZ * (i % 2) : 0));
    d4 += BW;
  });
  q.hline(d4, d4 + GP, d5 + 1);
}
function vbarHit(x0, y0, n, pt, geo) { const BW = (geo && geo.b) || 18, GP = (geo && geo.g) || 9, i = Math.floor((pt.h - x0 - GP) / (GP + BW)), off = (pt.h - x0 - GP) - (GP + BW) * i; return i >= 0 && i < n && off >= 0 && off < BW && pt.v >= y0 - 2 && pt.v <= y0 + 52 ? i : -1; }
function spread(vals, i, nv) {
  const out = vals.slice(); out[i] = Math.max(0, Math.min(1000, Math.round(nv)));
  const others = vals.map((v, j) => (j !== i && v >= 0 ? j : -1)).filter(j => j >= 0), tot = others.reduce((a, j) => a + vals[j], 0), rest = 1000 - out[i];
  others.forEach(j => { out[j] = tot > 0 ? Math.round(rest * vals[j] / tot) : Math.round(rest / others.length); });
  if (!others.length) out[i] = 1000;
  return out;
}
function dragBars(q, x0, y0, getVals, kind, set, fromPix, geo) {
  q.c.style.touchAction = 'none';
  q.c.addEventListener('pointerdown', (ev) => {
    const i = vbarHit(x0, y0, getVals().length, q.at(ev), geo); if (i < 0) return;
    ev.preventDefault(); if (getVals()[i] < 0) { window.HOAPI.beep(); return; }
    const start = getVals();
    const move = (e) => { const pt = q.at(e), px = Math.max(0, Math.min(50, y0 + 50 - pt.v)); set(spread(start, i, kind === 2 ? fromPix(px) : px * 1000 / 50), false); };
    const up = (e) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); move(e); set(null, true); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev);
  });
}
function colonyBars(s, p) {
  const H = window.HO, tf = Math.abs(H.seenT(p, s) - 72) <= 0.5, mf = !(s.metal > 0), ship = s.ship || 0, rest = 1 - ship, t = s.terra || 0;
  return [tf ? -1 : Math.round(1000 * rest * (mf ? 1 : t)), mf ? -1 : Math.round(1000 * rest * (tf ? 1 : 1 - t)), Math.round(1000 * ship)];
}
function setColonyBars(s, v) { const terra = Math.max(0, v[0]), mine = Math.max(0, v[1]); s.ship = Math.max(0, v[2]) / 1000; if (terra + mine > 0) s.terra = terra / (terra + mine); }
const BARC = ['#3000cf', '#3000cf', '#cf00ff']; // terraform and mine blue, ships magenta; the technologies' #6500cf
// (the Windows program in 16 colours shows them as the VGA screen has them: blue 0, 0, 170, ships and the technologies 170, 85, 170; in 256 colours the game's own: measured)
const w16 = () => winOn() && !document.documentElement.classList.contains('w31-256');
const barc = () => (w16() ? ['#0000aa', '#0000aa', '#aa55aa'] : BARC), techc = () => (w16() ? '#aa55aa' : '#6500cf');
// DrawPlanetRect: 240 x 74. The Windows program's: 240 x 89, its lines 14 apart (measured on win20-orig-vga16-main.png: baselines 28, 42 ... 84, the labels
// ending at 38, the double rule at 86 and 88); the bars where the DOS program has them
const PGEO = { dos: { h: 74, cx: 48, lr: 40, y: [28, 38, 48, 58, 68], by: 40, rule: [71, 73], q: [14, 26, 12] }, win: { h: 89, cx: 47, lr: 38, y: [28, 42, 56, 70, 84], by: 42, rule: [86, 88], q: [14, 28, 14] } };
function planetBoxDos(old) {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, W = PWORDS(), G = PGEO[winOn() ? 'win' : 'dos'];
  const q = dq(240, G.h, s ? s.name : '');
  if (s) {
    q.text(s.name, 0, 14, C12, { center: G.cx });
    const R = (k) => kvText(old, k), L = (t, y) => q.text(t, 0, y, F9, { right: G.lr });
    if (s.owner !== a.ME && R('temp') == null) q.text(W.noInfo || '', 3, 28, F9);
    else {
      const own = s.owner === a.ME;
      if (own) { const r = R('planetIncome'); if (r) { L(W.income || 'Income:', 28); q.text(r.value, 45, 28); } }
      else {
        const o = R('owner'), d = R('infodate');
        if (o) { L((W.owner || 'Owner:'), 28); q.text(o.value, 45, 28); }
        if (d) { q.text((W.infoDate || 'Info Date:'), 100, 28); q.text(d.value, 160, 28); }
        const bt = R('battle'); if (bt) { q.text(WD().battle, 100, G.by); q.text(bt.value, 160, G.by); }
      }
      [['population', G.y[1], W.pop || 'Pop:'], ['temp', G.y[2], W.temp || 'Temp:'], ['gravity', G.y[3], W.grav || 'Gravity:'], ['planetMetal', G.y[4], W.metal || 'Metal:']].forEach(([k, y, lab]) => { const r = R(k); if (r) { L(lab, y); q.text(r.value, 45, y); } });
      if (own) {
        const vals = colonyBars(s, p), names = [W.terra || 'Terra', W.mine || 'Mine', W.prod || 'Ship'];
        if (vals[0] >= 0 || vals[1] >= 0) {
          const draw = () => { q.rect(90, 0, 238, G.rule[0] - 1, '#fff'); vbars(q, 100, 2, colonyBars(s, p), 1, names, null, barc()); };
          draw(); dragBars(q, 100, 2, () => colonyBars(s, p), 1, (v, end) => { if (v) { setColonyBars(s, v); draw(); } if (end) { a.save(); a.renderPanel(); } });
        } else {
          q.text(W.queued || 'Ships Queued:', 100, G.q[0]);
          const rs = H.rules(g), lines = (s.queue || []).map(it => { const d = H.getDesign(g, a.ME, it.did); return d && rs.shipsText ? rs.shipsText(g, d, it.n) : (d ? it.n + ' ' + d.name : null); }).filter(Boolean).slice(0, 3);
          if (!lines.length) q.text(W.none || 'None.', 103, G.q[1]);
          lines.forEach((t, i) => q.text(t, 103, G.q[1] + G.q[2] * i));
        }
      }
    }
  }
  q.hline(0, 240, G.rule[0]); q.hline(0, 240, G.rule[1]); if (winOn()) q.vline(239, 0, G.rule[0]);
  if (s && s.owner === a.ME) q.c.addEventListener('dblclick', () => a.openBuild(s.id));
  return q.c;
}
// DrawFleetRect: 240 x 79. The Windows program's: 240 x 90, the list of four rows 14 apart from 28 (the chosen one 15 high), Windows' scroll bar at 223,
// the double rule at 87 and 89 (measured)
let FLEET_TOP = 0;
const FGEO = { dos: { h: 79, y2: 23, top: 25, row: 12, hi: 12, base: 10, sel: 230, bar: 232, rule: [78] }, win: { h: 90, y2: 25, top: 28, row: 14, hi: 15, base: 12, sel: 223, bar: 223, rule: [87, 89] } };
function fleetBoxDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, rs = H.rules(g), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, W = PWORDS(), r12 = RS12(), G = FGEO[winOn() ? 'win' : 'dos'];
  const q = dq(240, G.h, 'Fleets');
  // (order: two captured games list the scouts first and the colony ship last, and pick the first; only that is known of the program's order, so colony ships are put after the rest, otherwise as the game has them)
  const isCol = (f) => H.fleetDesigns(g, f).some(d => d.type === 'colony');
  const list0 = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const here = list0.filter(f => !isCol(f)).concat(list0.filter(isCol));
  let sel = here.find(f => f.id === a.UI.selFleet);
  if (!sel && here.length) { sel = here[0]; a.UI.selFleet = sel.id; } // (the program has the first fleet of the star picked)
  FLEET_TOP = Math.max(0, Math.min(FLEET_TOP, here.length - 4));
  if (sel && r12) {
    const L = (rs.fleetInfo || r12.fleetInfo)(enView(g), sel), first = L[0] || '', m = /^(.*?:) (.*)$/.exec(first);
    if (m && !sel.scrap301 && !/ via /.test(first)) { const lb = fl(m[1] + ' x').replace(/ x$/, ''); q.text(lb, 3, 11); q.text(m[2], winOn() ? 70 : 3 + Math.round(q.width(lb + ' ')), 11); } else q.text(fl(first), 3, 11); // (DOS: the name after the label and a space, 64 in English: v20dos-orig-turn1, -turn2, -fleets)
    if (L[1]) q.text(fl(L[1]), 3, G.y2); if (L[2]) q.text(fl(L[2]), 70, G.y2); if (L[3]) q.text(fl(L[3]), 127, G.y2);
  }
  if (!here.length) q.text(W.noFleets || 'There are no fleets at this planet.', 3, 36);
  here.slice(FLEET_TOP, FLEET_TOP + 4).forEach((f, i) => {
    const top = G.top + G.row * i, ds = H.fleetDesigns(g, f), d = ds[0], n = H.fleetCount ? H.fleetCount(f) : Object.values(f.ships).reduce((x, y) => x + y, 0);
    const t = wl() === 'de' && d ? deRow(d, n) : rs.shipsText ? (d ? rs.shipsText(g, d, n) : '') : ds.length === 1 && r12 ? r12.shipsText(enView(g), d, n) : H.fleetLabel(g, f);
    const sl = f.id === a.UI.selFleet;
    if (sl) q.rect(0, top, G.sel, top + G.hi, '#000');
    q.text(t, 3, top + G.base, f.dest != null ? F9B : F9, { color: sl ? '#fff' : '#000' });
  });
  if (winOn()) { q.rect(G.sel, G.top, 240, G.top + 4 * G.row, '#fff'); wBar(q, G.bar, G.top, 4 * G.row + 3, true, here.length > 4 ? FLEET_TOP / (here.length - 4) : 0); q.hline(0, 240, G.rule[0]); q.hline(0, 240, G.rule[1]); q.vline(239, 0, G.rule[0]); }
  else {
  q.rect(232, 25, 240, 73, '#aaa'); q.x.strokeStyle = '#000'; q.x.lineWidth = 1; q.x.strokeRect(232.5, 25.5, 7, 47);
  q.x.fillStyle = '#000'; q.x.beginPath(); q.x.moveTo(233, 33); q.x.lineTo(239, 33); q.x.lineTo(236, 28); q.x.fill(); q.x.beginPath(); q.x.moveTo(233, 65); q.x.lineTo(239, 65); q.x.lineTo(236, 70); q.x.fill();
  if (here.length > 4) { const hh = Math.max(6, 45 * 4 / here.length), y = 26 + (45 - hh) * FLEET_TOP / (here.length - 4); q.rect(233, y, 239, y + hh, '#555'); }
  q.hline(0, 240, 78);
  }
  q.c.addEventListener('click', (ev) => { const pt = q.at(ev); if (pt.v < G.top || pt.v > G.top + 4 * G.row) return;
    if (pt.h >= G.bar) { if (here.length > 4) { FLEET_TOP += pt.v < G.top + 2 * G.row ? -1 : 1; a.renderPanel(); } return; }
    const f = here[FLEET_TOP + Math.floor((pt.v - G.top) / G.row)]; if (f) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); } });
  if (a.wheelList) a.wheelList(q.c, (n) => { FLEET_TOP += n; a.renderPanel(); }, () => here.length > 4); // (the wheel: a modern convenience, the classic page's whole rows)
  return q.c;
}
// the totals: 240 x 43
// (the Windows program's: 240 x 46, baselines 11, 25, 39, the names ending at 89, the rule at 45: measured)
function totalsBoxDos(info) {
  const w = winOn(), q = dq(240, w ? 46 : 43, 'Totals'), P = (RS12() || {}).panelInfo || { order: ['metal', 'savings', 'income'], words: { en: { metal: 'Reserve Metal:', savings: 'Total Money:', income: 'Total Income:' } } };
  const keyOf = { metal: 'metal', savings: 'savings', income: 'income' };
  P.order.filter(k => k !== 'interest').forEach((k, i) => {
    const row = info && Array.from(info.querySelectorAll('.kv')).find(r => (r.getAttribute('data-help') || '') .toLowerCase().includes(keyOf[k]));
    const t = row ? kvText(info, row.getAttribute('data-help')) : null; if (!t) return;
    const y = w ? 11 + 14 * i : 13 + 12 * i;
    q.text(WD().totals[['metal', 'savings', 'income'].indexOf(k)], 0, y, F9B, { right: w ? 89 : 91 }); q.text(t.value, w ? 94 : 95, y, F9B); if (t.chg) q.text(t.chg, 0, y, F9, { right: w ? 235 : 236 });
  });
  q.hline(0, 240, w ? 45 : 42); if (w) q.vline(239, 0, 45);
  return q.c;
}
const TECHK = ['range', 'speed', 'weapons', 'shields', 'mini'], TECHN = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'];
function techBoxDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me();
  const rad = !H.feature(g, 'noRadical') && H.TECHS.includes('radical');
  const keys = rad ? TECHK.concat('radical') : TECHK, names = rad ? WD().tech.concat('Radical') : WD().tech;
  // (the Windows program's is its own window, Tech Spending: a client 226 x 99, no heading, the levels' lines 14 apart, the bars from 5: measured)
  const w = winOn(), TW = w ? 226 : 240, TH = w ? 99 : 83, y0 = w ? 5 : 13;
  const q = dq(TW, TH, 'Tech Spending'), sc = H.barScale(g, 'tech');
  const toPix = (v) => Math.trunc(50 * sc.toX(v)), fromPix = (px) => sc.toValue(px / 50);
  const vals = () => { const t = keys.reduce((s, k) => s + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
  const draw = () => {
    q.rect(0, 0, TW, TH, '#fff');
    if (!w) q.text(WD().head, 80, 11, F9B);
    q.text(WD().levels, 3, w ? 16 : 24);
    TECHK.forEach((k, i) => { const y = w ? 30 + 14 * i : 36 + 11 * i; q.text(WD().tech[i], 5, y); q.text(String(p.tech[k]), 54, y); });
    vbars(q, 80, y0, vals(), 2, names, toPix, [techc()], rad ? { b: 14, g: 8 } : null);
  };
  draw();
  dragBars(q, 80, y0, vals, 2, (v, end) => { if (v) { keys.forEach((k, i) => { p.talloc[k] = v[i] / 1000; }); draw(); } if (end) { a.save(); a.renderPanel(); } }, fromPix, rad ? { b: 14, g: 8 } : null);
  return q.c;
}
function rosterDos() {
  const a = window.HOAPI, g = a.G, box = a.el('div', { class: 'dosroster' });
  for (const p of g.players.filter(x => x.human || g.turn > 0)) {
    const im = a.IMG[p.id === a.ME ? 'white0_0' : 'bad' + (p.face || 0) + '_0'], done = !p.human || (g.done || []).includes(p.id);
    const row = a.el('div', { class: 'rrow' + (p.alive ? '' : ' out') }, im ? a.el('img', { src: im.src, alt: '', width: 16, height: 16 }) : a.el('span'), a.el('span', { class: 'rname', translate: 'no' }, p.name));
    if (g.turn > 0 && p.alive && done) row.prepend(a.el('span', { class: 'rdone', translate: 'no' }, '\u2713'));
    box.append(row);
  }
  return box;
}

// a vertical scroll bar of the program's window library: 8 wide, an arrow box at each end, a thumb (the program draws one beside the players and one beside the budget bars)
function vScroll(target, l, t, h) {
  const a = window.HOAPI, bar = a.el('div', { class: 'dd-vs', 'aria-hidden': 'true' }), up = a.el('span', { class: 'a u' }), dn = a.el('span', { class: 'a d' }), th = a.el('span', { class: 'th' });
  bar.append(up, th, dn); bar.style.left = du(l); bar.style.top = du(t); bar.style.height = du(h);
  // (the Windows program's: Windows' bar, 17 across, 16-pixel arrows with their black lines and a thumb of a fixed 15 + 1: wBar's, as boxes; js/skins/dos/win31/frame.css)
  const w = winOn(), A = w ? 16 : 14, trk = h - 2 * A, upd = () => { // (DOS: 14-row arrow boxes and a fixed 13-row thumb, v20dos-orig-turn2)
    const tot = target.scrollHeight, vis = target.clientHeight, max = Math.max(0, tot - vis), k = vis ? tot / vis : 1, th0 = w ? 16 : 13;
    th.style.height = du(th0); th.style.top = du(A + (max ? Math.round(target.scrollTop / max * (trk - th0)) : 0));
  };
  const step = (d) => { target.scrollTop += d; upd(); };
  up.addEventListener('pointerdown', (e) => { e.preventDefault(); step(-14); }); dn.addEventListener('pointerdown', (e) => { e.preventDefault(); step(14); });
  bar.addEventListener('pointerdown', (e) => { if (e.target !== bar) return; const r = bar.getBoundingClientRect(); step((e.clientY - r.top) / r.height * h < th.offsetTop / (r.height / h) ? -target.clientHeight : target.clientHeight); });
  th.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const y0 = e.clientY, s0 = target.scrollTop, r = bar.getBoundingClientRect(), k = r.height / h;
    const mv = (ev) => { const max = Math.max(1, target.scrollHeight - target.clientHeight), span = Math.max(1, trk - th.offsetHeight / k); target.scrollTop = s0 + (ev.clientY - y0) / k / span * max; upd(); };
    const upf = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upf); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upf);
  });
  target.addEventListener('scroll', upd); if (window.HOAPI && HOAPI.wheelList) HOAPI.wheelList(target, (n) => step(14 * n), () => target.scrollHeight > target.clientHeight); // (the wheel: a modern convenience, a 14-pixel line a row)
  setTimeout(upd, 0); return bar;
}
function panelDos(panel, B) {
  if (!frameOn() || !window.HOAPI || !window.HOAPI.G) return;
  const a = window.HOAPI, w = winOn(); loadFonts();
  const low = a.el('div', { class: 'doslow' }, rosterDos());
  if (B.budget) {
    const bx = B.budget, h = bx.querySelector('h3'), sc = a.budgetScale();
    if (h) { h.textContent = ''; h.classList.add('dosstrip'); ['0%', sc.id === 'log' ? WD().log : WD().lin, '100%'].forEach(t => h.append(a.el('span', { translate: 'no' }, t))); }
    const rows = bx.querySelectorAll('.barrow');
    (B.ents || []).forEach((e, i) => {
      const r = rows[i], lab = r && r.querySelector('.blabel'); if (!lab) return;
      if (e.key === 'tech') { lab.textContent = WD().techBar; lab.setAttribute('translate', 'no'); } else if (e.key === 'savings') { lab.textContent = WD().sav; lab.setAttribute('translate', 'no'); }
      if (e.star != null) { lab.style.textDecoration = a.UI.sel === e.star ? 'underline' : ''; lab.style.cursor = 'pointer'; lab.onclick = (ev) => { ev.stopPropagation(); a.UI.sel = e.star; a.centerOn(e.star); a.renderPanel(); a.draw(); }; }
    });
    { const rr = Array.from(bx.querySelectorAll('.barrow')), ti = (B.ents || []).findIndex(e => e.key === 'tech'), si = (B.ents || []).findIndex(e => e.key === 'savings'); if (ti >= 0 && si >= 0 && rr[ti] && rr[si] && ti < si) rr[ti].before(rr[si]); }
    bx.classList.add('dosbudget'); low.append(bx); setTimeout(() => { const r = bx.querySelector('.barrow:has(.blabel[style*=underline])'); if (r && r.offsetTop + r.offsetHeight > bx.clientHeight) bx.scrollTop = r.offsetTop - 28; }, 0);
  }
  // (the Windows program's players and budget pane, 240 x 85: the roster 75 wide, its bar at 75, the budget's at 223: measured)
  low.append(vScroll(low.querySelector('.dosroster'), w ? 75 : 80, 0, w ? 85 : 169));
  if (B.budget) low.append(vScroll(B.budget, w ? 223 : 232, 0, w ? 85 : 169));
  panel.innerHTML = '';
  panel.append(planetBoxDos(B.planet), fleetBoxDos(), totalsBoxDos(B.info), low);
  if (w && window.HOWIN31 && window.HOWIN31.frame) window.HOWIN31.frame.panes(techBoxDos(), reportRows()); else panel.append(techBoxDos());
}
// the rows of the Windows program's Reports window (its picture, 32 x 32, and the words), the remake's reports of the turn as the DOS Reports window lists them
function reportRows() {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), rs = H.rules(g);
  const old = rs.reportHistory ? (p.reportLog || []) : [], ms = old.concat(p.inbox || []);
  return ms.map((m, i) => { const t = a.el('span', { class: 'cap', translate: 'no' }); t.append(a.degText(H.say(g, m.text))); return { el: a.el('div', { class: 'w31rep', 'data-now': i === old.length ? '1' : null, tabindex: 0, role: 'option' }, a.msgIconEl(m), t), go: () => a.reportAction(m) }; });
}

// A finger on one of your fleets drags it, as a mouse does (the program has no other way to send a fleet; the classic skin's touch gestures only pan, and the
// iOS ones send a fleet from a Move button). Everything else a finger does stays the classic gestures (pan, pinch, taps). The finger's events are handed to the
// map as a mouse's, with the same pointer id.
// the Mac skins (this file's, on the classic page): their programs send a fleet by dragging it, a finger as well
const macLook = () => !!(window.HOSKINS && /^mac\d/.test(HOSKINS.current || ''));
function touchFleets() {
  if (window._dosTouch) return; window._dosTouch = true; // (on the document, so it does not matter when the map is made)
  const cv = document, isMap = (e) => e.target && e.target.id === 'map';
  let id = null;
  const mouse = (type, e) => new PointerEvent(type, { pointerId: e.pointerId, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true });
  cv.addEventListener('pointerdown', (e) => {
    const a = window.HOAPI; if (!isMap(e) || !(frameOn() || macLook()) || e.pointerType !== 'touch' || !e.isTrusted || !a || !a.G || a.G.over) return;
    const mp = !frameOn() && window.HOTHEME && HOTHEME.mapPixel && HOTHEME.mapPixel(), k = frameOn() ? U : mp ? mp[0] : 1, px = e.offsetX / k, py = e.offsetY / k, // (the map's pixel in CSS pixels: the frame's unit, the Mac skins' scale (T.mapPixel), else 1)
    d = (a.UI.dots || []).slice().reverse().find(k => k.mine && !k.sat && !k.transit && px >= k.x - 6 && px <= k.x + k.w + 6 && py >= k.y - 6 && py <= k.y + k.h + 6);
    if (!d) return;
    id = e.pointerId; e.stopImmediatePropagation(); e.preventDefault(); e.target.dispatchEvent(mouse('pointerdown', e));
  }, true);
  for (const t of ['pointermove', 'pointerup', 'pointercancel']) cv.addEventListener(t, (e) => {
    if (id == null || e.pointerId !== id || e.pointerType !== 'touch' || !e.isTrusted || !isMap(e)) return;
    e.stopImmediatePropagation(); e.preventDefault(); e.target.dispatchEvent(mouse(t === 'pointercancel' ? 'pointerup' : t, e));
    if (t !== 'pointermove') id = null;
  }, true);
}
touchFleets(); // (at once: the Mac skins, which do not call frameSetup, need it too; the handler asks which look is on)
function frameSetup(de) {
  const sync = () => {
    const was = de.classList.contains('dosframe'); de.classList.toggle('dosframe', frameOn()); setUnit();
    const ts = document.getElementById('titlescreen'); if (was !== frameOn() && ts && !ts.hidden && window.HOAPI && window.HOAPI.IMG) startupDos(); // (the look changed on the title page: the Startup window comes or goes)
  };
  sync(); window.addEventListener('load', touchFleets); touchFleets(); window.addEventListener('resize', () => { const u0 = U; setUnit(); if (u0 !== U && window.HOAPI && window.HOAPI.G && frameOn()) { window.HOAPI.renderPanel(); window.dispatchEvent(new Event('hoframe')); } });
  new MutationObserver(sync).observe(de, { attributes: true, attributeFilter: ['class'] });
  loadFonts(); hotMenus(); dosKeys(); bossKey(); condenseCaps();
}

// ======== The original's own windows (docs/dos20-findings.md; geometry measured on the running program, v20dos-orig-*.png) ========
// A dialog is a box with a five-pixel frame (black, light grey, dark grey twice, black), white inside, its text in the screen font (the VGA 8x14), the hot
// letter of a control red, a button grey with a black edge. Every rectangle below is in the program's pixels from the dialog's outer corner, in the unit --u.
const du = (n) => `calc(${n} * var(--du))`;
function dAt(e, l, t, w, h) { e.style.position = 'absolute'; e.style.left = du(l); e.style.top = du(t); if (w != null) e.style.width = du(w); if (h != null) e.style.height = du(h); return e; }
function dText(txt, l, t, o) {
  const a = window.HOAPI, e = a.el('span', { class: 'dd-t' + (o && o.cls ? ' ' + o.cls : ''), translate: 'no' });
  const w = String(txt), hot = o && o.hot != null ? o.hot : -1;
  if (hot >= 0) { e.append(w.slice(0, hot)); const h = a.el('span', { class: 'hot' }, w[hot]); e.append(h, w.slice(hot + 1)); } else e.textContent = w;
  dAt(e, l, t, o && o.w, 14); if (o && o.w) e.style.overflow = 'hidden'; if (o && o.color) e.style.color = o.color; return e;
}
function dButton(txt, l, t, w, h, fn, o) {
  const a = window.HOAPI, b = a.el('button', { type: 'button', class: 'dd-btn' + (o && o.def ? ' def' : ''), onclick: fn });
  const hot = o && o.hot != null ? o.hot : -1, sp = a.el('span', { translate: 'no' });
  if (hot >= 0) { sp.append(txt.slice(0, hot), a.el('span', { class: 'hotu' }, txt[hot]), txt.slice(hot + 1)); } else sp.textContent = txt;
  b.append(sp);
  // (a label centred on a half pixel blurred the bitmap face: put it on the next whole pixel, where the program's centring lands, e.g. "Cancel" 19 in from a 78-wide button's edge)
  requestAnimationFrame(() => { if (!b.isConnected) return; const x = sp.getBoundingClientRect().left, d = Math.ceil(x - 0.01) - x; if (d > 0.01) { sp.style.position = 'relative'; sp.style.left = d + 'px'; } });
  return dAt(b, l, t, w, h);
}
// a scroll-bar slider (the control the program calls a scroll bar: an arrow at each end, a small thumb): min..max, value; the arrows step by one, a click on the track by a tenth
function dSlider(l, t, w, h, min, max, val, onChange, label) {
  const a = window.HOAPI, box = a.el('div', { class: 'dd-slider', role: 'slider', tabindex: 0, 'aria-label': label || '', 'aria-valuemin': min, 'aria-valuemax': max });
  const lb = a.el('span', { class: 'arr l' }), rb = a.el('span', { class: 'arr r' }), th = a.el('span', { class: 'thumb' });
  box.append(lb, th, rb); dAt(box, l, t, w, h);
  let v = val;
  const place = () => { box.setAttribute('aria-valuenow', v); const run = w - 2 * 16 - 8; th.style.left = du(16 + Math.round((v - min) / (max - min) * run)); };
  const set = (nv) => { v = Math.max(min, Math.min(max, Math.round(nv))); place(); onChange(v); };
  const frac = (ev) => { const r = box.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * w; return (x - 16 - 4) / (w - 2 * 16 - 8); };
  box.addEventListener('pointerdown', (ev) => {
    ev.preventDefault(); const x = (ev.clientX - box.getBoundingClientRect().left) / box.getBoundingClientRect().width * w;
    if (x < 16) { set(v - 1); return; } if (x > w - 16) { set(v + 1); return; }
    box.setPointerCapture(ev.pointerId); const mv = (e) => set(min + Math.max(0, Math.min(1, frac(e))) * (max - min)); mv(ev);
    const up = () => { box.removeEventListener('pointermove', mv); box.removeEventListener('pointerup', up); }; box.addEventListener('pointermove', mv); box.addEventListener('pointerup', up);
  });
  box.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(v - 1); } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(v + 1); } });
  place(); return box;
}
function dDialog(w, h, title, kids, label) {
  const a = window.HOAPI, d = a.el('div', { class: 'dd', role: 'dialog', 'aria-label': label || title || '' });
  d.style.width = du(w); d.style.height = du(h);
  if (title) d.append(dAt(a.el('div', { class: 'dd-title', translate: 'no' }, title), 5, 5, w - 10, 17));
  kids.forEach(k => k && d.append(k));
  const bs = [...d.querySelectorAll('.dd-btn')], cb = bs.find(b => /^cancel$/i.test(b.textContent.trim())); if (cb && !d.querySelector('[data-esc-close]')) cb.setAttribute('data-esc-close', '1'); // (a window of the program closes by its Cancel)
  const win = a.modal('', d, { cls: 'dosw', label: label || title || 'Spaceward Ho!' });
  // --du is the DOS frame's scale (html.dosframe, js/skins/dos/style.css). Outside that frame (the Mac 3.0.1 skins use this window from their Ships menu)
  // nothing defines it, every size computed to 0 and the window was an invisible 0 x 0 box under a scrim that nothing could close: the window's own scale,
  // whole pixels, as large as the screen lets it be
  if (win && !document.documentElement.classList.contains('dosframe')) {
    const k = Math.max(0.5, Math.min(2, (window.innerWidth - 16) / w, (window.innerHeight - 16) / h)); win.style.setProperty('--du', (k >= 1 ? Math.floor(k * 4) / 4 : k) + 'px');
  }
  placeDos(win, w, h);
  return d;
}
// Where the program puts a window (its templates say x, y = -1: centred): on its 80 x 34-cell screen in whole cells, 8 * floor((80 - columns) / 2) from the left and
// 14 * floor((34 - rows) / 2) from the top (measured on every captured window: Ship Types, 62 x 25 cells, at 72, 56; Battle Speed, 35 x 13, at 176, 140; Auto Play,
// 47 x 19, at 128, 98; List of All Fleets, 68 x 23, at 48, 70; the fuel alert, 44 x 15, at 144, 126 ...). The page centres a window on the 640 x 476 frame; this moves
// it by the difference (Ship Types 7 pixels up).
function placeDos(win, w, h) {
  if (!win) return;
  const cols = Math.round(w / 8), rows = Math.round(h / 14), dx = 8 * Math.floor((80 - cols) / 2) - (640 - w) / 2, dy = 14 * Math.floor((34 - rows) / 2) - (476 - h) / 2;
  win.style.transform = `translate(${du(dx)}, ${du(dy)})`;
}
const tx = (t) => (window.HOAPI && window.HOAPI.tl ? window.HOAPI.tl(t) : t);
// Options, Set Battle Speed: 280 x 182 (DITL of Windows template 8; "Fully Animated Battles" is the DOS program's own check box)
function battleSpeedDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, P = a.Prefs, O = (g && H.rules(g).options || {}).battleSpeed || { min: 10, max: 60, def: 30 };
  let v = P.battleSpeed != null && P.battleSpeed >= O.min && P.battleSpeed <= O.max ? P.battleSpeed : O.def, full = P.fullAnim !== false;
  const cb = dText(full ? '[x] Fully Animated Battles' : '[ ] Fully Animated Battles', 16, 98, { hot: 4 }); cb.style.cursor = 'pointer'; cb.setAttribute('role', 'checkbox'); cb.tabIndex = 0;
  const flip = () => { full = !full; cb.textContent = ''; const t = (full ? '[x] ' : '[ ] ') + 'Fully Animated Battles'; cb.append(t.slice(0, 4), a.el('span', { class: 'hot' }, 'F'), t.slice(5)); cb.setAttribute('aria-checked', String(full)); };
  cb.setAttribute('aria-checked', String(full)); cb.addEventListener('click', flip); cb.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } });
  flip(); flip();
  dDialog(280, 182, null, [dText(tx('Battle Speed:'), 16, 42), dText(tx('Fast'), 16, 70), dSlider(64, 70, 144, 14, O.min, O.max, v, (n) => { v = n; }, 'Battle Speed'), dText(tx('Slow'), 208, 70), cb,
    dButton('OK', 176, 126, 72, 28, () => { P.battleSpeed = v; P.fullAnim = full; a.savePrefs(); a.closeModal(); }, { hot: 0, def: true })], 'Battle Speed');
  return true;
}
// Options, Auto Play: 376 x 266
function autoPlayDos() {
  const a = window.HOAPI, P = a.Prefs; let secs = P.autoSecs != null ? P.autoSecs : 2, mode = 2;
  const words = ['Have computer play for me.', 'Just mark me done every turn.', 'I’ll play my own turns, thank you.'], hots = [0, 0, 0], tops = [70, 84, 98], rows = [];
  const draw = () => rows.forEach((r, i) => { r.textContent = ''; const t = (mode === i ? '(•) ' : '( ) ') + tx(words[i]); r.append(t.slice(0, 4), a.el('span', { class: 'hot' }, t[4]), t.slice(5)); r.setAttribute('aria-checked', String(mode === i)); });
  words.forEach((w, i) => { const r = dText('', 32, tops[i], i === 0 ? { color: '#6a6aff' } : null); r.setAttribute('role', 'radio'); r.tabIndex = 0; r.style.cursor = 'pointer'; r.addEventListener('click', () => { mode = i; draw(); }); r.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); mode = i; draw(); } }); rows.push(r); });
  draw();
  const num = dText(String(secs), 32, 168);
  dDialog(376, 266, null, [dText(tx('Auto Play:'), 24, 42), ...rows, dText(tx('Under auto play, event messages'), 32, 126), dText(tx('should disappear after:'), 32, 140), num, dText(tx('Seconds'), 64, 168),
    dSlider(128, 168, 144, 14, 0, 15, secs, (n) => { secs = n; num.textContent = String(n); }, 'Seconds'),
    dButton('OK', 248, 210, 71, 27, () => { P.autoSecs = secs; a.savePrefs(); a.closeModal(); if (mode < 2) a.runAutoPlay({ turns: Infinity, computer: mode === 0, won: false, lost: false, news: false, every: secs }); }, { hot: 0, def: true })], 'Auto Play');
  return true;
}
// File, About Ho!: 392 x 364: a title bar, the credits picture, the licence lines, OK
function aboutDos() {
  const a = window.HOAPI, IMG = a.IMG, top = IMG['dos:d998'], bot = IMG['dos:d999'];
  const c = a.el('canvas', { class: 'dd-pic', width: 383, height: 236, role: 'img', 'aria-label': 'Spaceward Ho! 2.0: credits' });
  const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 383, 113); x.fillStyle = '#fff'; x.fillRect(0, 113, 383, 123); if (top) x.drawImage(top, 0, 0); if (bot) x.drawImage(bot, 0, 113);
  dAt(c, 4, 28, 383, 236);
  const L = licensee();
  dDialog(392, 364, 'About Spaceward Ho!', [c, dText('Licensed to:', 8, 266), dText(L.name, 112, 266), dText(L.org, 112, 280), dText('Spaceward Ho! Version 2.0', 112, 294), dButton('OK', 152, 322, 71, 28, () => a.closeModal(), { hot: 0, def: true })], 'About Spaceward Ho!');
  return true;
}

// the list windows (List of All Fleets: 544 x 322, List of All Explored Stars: 528 x 322): the title line, a list box (double rule) from (19, 47), rows of 14, the picked row
// black with white text, two buttons at the foot
function dListBox(w, h, x, y) {
  const a = window.HOAPI, box = a.el('div', { class: 'dd-list', role: 'listbox', tabindex: 0 });
  dAt(box, x == null ? 19 : x, y == null ? 47 : y, w, h); return box;
}
// the rows of List of All Fleets (DOS and Windows: the program's sentences, the German build's in German), and the hyperspace alert: fleetList().line(f), .stuck(f), .hyper
function fleetList() {
  const a = window.HOAPI, H = window.HO, g = a.G, W = Object.assign({ at: '%s stationed at %s.', leave: '%s leaving %s for %s to arrive in %d.', fly: '%s to arrive at %s in %d.', stuck: '%s marooned at %s.',
    hyper: 'Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location.' }, wl() === 'de' ? { at: '%s stationiert auf %s.', leave: '%s fliegt von %s nach %s. Ankunft: %d.', fly: '%s fliegt nach %s. Ankunft: %d.', stuck: '%s hängt auf %s fest.' } : {});
  const fill = (t, ...v) => { let i = 0; return t.replace(/%[sd]/g, () => String(v[i++])); };
  const stuck = (f) => f.star != null && g.stars[f.star].owner !== a.ME && !g.stars.some(s => s.id !== f.star && H.starDist(g, f.star, s.id) <= f.fuel + 1e-9);
  const turns = (f) => Math.ceil((f.dist - (f.prog || 0)) / H.fleetSpeed(g, f) - 1e-9);
  const line = (f) => {
    // (a fleet of one type: the program's "one Weasel (1/1) Scout", captured in both programs, v20dos-orig-fleets.png, win20-orig-vga16-fleets.png; the German build's row in German)
    const d = f.ships ? (() => { const ds = H.fleetDesigns(g, f); return ds.length === 1 ? window.HOTHEME.shipWords.ships(ds[0], H.fleetCount ? H.fleetCount(f) : 1) : H.fleetText(g, f); })() : H.fleetText(g, f), st = (i) => g.stars[i].name;
    if (stuck(f)) return fill(W.stuck, d, st(f.star));
    if (f.to != null) return fill(W.fly, d, st(f.to), H.arrivalYear(g, turns(f)));
    if (f.dest != null) return fill(W.leave, d, st(f.star), st(f.dest), H.arrivalYear(g, Math.ceil(H.starDist(g, f.star, f.dest) / H.fleetSpeed(g, f) - 1e-9)));
    return fill(W.at, d, st(f.star));
  };
  return { line, stuck, hyper: W.hyper };
}
function fleetsDos() {
  const a = window.HOAPI, g = a.G, F = fleetList(), W = { hyper: F.hyper }, stuck = F.stuck, line = F.line;
  const fs = g.fleets.filter(f => f.owner === a.ME && !f.sat), order = fs.filter(f => !stuck(f)).concat(fs.filter(stuck));
  let cur = order[0] || null;
  const box = dListBox(505, 214);
  const show = () => { box.textContent = ''; order.forEach(f => { const r = a.el('div', { class: 'dd-row' + (f === cur ? ' sel' : ''), role: 'option', 'aria-selected': String(f === cur), translate: 'no', onclick: dblc(f, () => { cur = f; show(); }, go) }, line(f)); box.append(r); }); };
  function go() {
    if (!cur) return;
    if (cur.to != null) { a.alertOver([W.hyper], 'en'); return; }
    a.UI.selFleet = cur.id; a.UI.sel = cur.star; a.closeModal(); a.centerOn(cur.star); a.renderPanel(); a.draw();
  }
  show();
  dDialog(544, 322, null, [dText(tx('List of All Fleets:'), 16, 26), box, dButton('Go To Fleet', 112, 280, 111, 27, go, { hot: 0 }), dButton('OK', 328, 280, 72, 27, () => a.closeModal(), { hot: 0 })], 'List of All Fleets');
  return true;
}
function starsDos() { // the classic window, set as the program's (its list is already the program's fixed-pitch text, columns from the ruleset)
  setTimeout(() => { const w = document.querySelector('.scrim .win'); if (w && w.querySelector('.exlist')) { w.classList.add('dosx'); const r = w.querySelector('.exrow'); if (r) r.click(); } }, 0); // (the first row is picked on opening, as the program shows it)
  return false;
}

// New Game, the program's Create New Galaxy window (536 x 280; the remake's own choices stay in the form behind "More…")
function createGalaxyDos(f) {
  if (!frameOn()) return;
  if (winOn() && window.HOWIN31 && window.HOWIN31.newGame && window.HOWIN31.newGame(f)) return; // (the Windows program's New Game sequence: js/skins/dos/win31/dialogs.js)
  const a = window.HOAPI, el = a.el, win = f.closest('.win'); if (!win) return;
  const field = (n) => f.querySelector(`[name="${n}"]`), fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  const LISTS = [
    { sel: 'd_density', box: [19, 35, 122, 71], label: 'Galaxy Density', xs: [24, 80], y: 42, icons: [3050, 3051], names: ['Dense', 'Sparse'] },
    { sel: 'd_shape', box: [228, 35, 289, 71], label: 'Galaxy Style', xs: [232, 288, 344, 400, 456], y: 42, icons: [3020, 3021, 3022, 3023, 3024], names: ['Circle', 'Random', 'Ring', 'Spiral', 'Grid'] },
    { sel: 'd_iq', box: [19, 133, 186, 71], label: 'Computer Intelligence', xs: [24, 80, 143], y: 140, icons: [3030, 3031, 3032], names: ['Dumb', 'Average', 'Smart'] },
    { sel: 'd_size', box: [228, 133, 289, 71], label: 'Galaxy Size', xs: [232, 288, 344, 400, 456], y: 140, icons: [3040, 3041, 3042, 3043, 3044], names: ['Small', 'Medium', 'Large', 'Extra Large', 'Humongous'] }];
  const kids = [], rest = [...f.childNodes];
  LISTS.forEach((L) => {
    const sel = field(L.sel); if (!sel) return;
    const dflt = { d_density: ['dense', 'dense'], d_shape: ['ring', 'random'], d_iq: ['average', 'dumb'], d_size: ['medium', 'small'] }[L.sel]; // (the form's untouched choice becomes the program's own: Dense, Random, Dumb, Small)
    if (dflt && sel.value === dflt[0] && [...sel.options].some(o => o.value === dflt[1])) sel.value = dflt[1];
    const vals = [...sel.options].map(o => o.value), frame = dAt(el('div', { class: 'dd-gbox' }), L.box[0], L.box[1], L.box[2], L.box[3]);
    kids.push(frame, dAt(el('span', { class: 'dd-gtitle', translate: 'no' }, tx(L.label)), L.box[0] + 5, L.box[1] - 7, null, 14));
    const cells = L.icons.map((n, i) => {
      const im = a.IMG['dos:i' + n], c = dAt(el('div', { class: 'dd-cell', role: 'option', tabindex: 0 }), L.xs[i], L.y, 56, 56);
      if (im) c.append(dAt(el('img', { src: im.src, alt: '', style: 'image-rendering:pixelated' }), 12, 7, 32, 32));
      c.append(dAt(el('span', { class: 'dd-cn', translate: 'no' }, tx(L.names[i])), 0, 43, 56, 14));
      const pick = () => { sel.value = vals[i]; fire(sel); paint(); };
      c.addEventListener('click', pick); c.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
      kids.push(c); return c;
    });
    const paint = () => cells.forEach((c, i) => { c.classList.toggle('sel', sel.value === vals[i]); c.setAttribute('aria-selected', String(sel.value === vals[i])); });
    paint(); sel.addEventListener('change', paint);
  });
  const sk = field('d_skill'); if (sk && sk.value === 'normal') sk.value = 'novice'; // (the program's New Player Registration opens on Novice)
  const gal = field('galaxy'); if (gal && gal.value === 'Milky Way') gal.value = 'MilkyWay'; // (the program's default galaxy file is MilkyWay.Ho!, its window title "<player> in MilkyWay in 2000")
  const comp = field('computers');
  if (comp && comp.value === '4') comp.value = '1'; // (the program opens with one computer player)
  const num = dText(comp ? comp.value : '', 24, 238);
  kids.push(dAt(el('div', { class: 'dd-gbox' }), 19, 230, 200, 30), dAt(el('span', { class: 'dd-gtitle', translate: 'no' }, tx('Number of Computer Players')), 24, 223, null, 14), num,
    dSlider(48, 238, 176, 13, 0, 19, comp && /^\d+$/.test(comp.value) ? +comp.value : 4, (n) => { if (comp) { comp.value = String(n); fire(comp); } num.textContent = String(n); }, 'Number of Computer Players'),
    dButton('Cancel', 272, 224, 71, 26, () => a.closeModal(), { hot: 0 }), dButton('Create', 401, 225, 70, 26, () => playerEntryDos(), { hot: 1, def: true }));
  let opened = false;
  // (the remake's own choices, version, edition, language, skin, look: behind a link under the program's screen, not on its window)
  const more = el('button', { type: 'button', class: 'dd-more', onclick: () => { opened = !opened; dress(); } }, tx('Remake options…'));
  const box = el('div', { class: 'dd', role: 'group', 'aria-label': 'Create New Galaxy' }); box.style.width = du(536); box.style.height = du(280);
  box.append(dAt(el('div', { class: 'dd-title', translate: 'no' }, tx('Create New Galaxy')), 5, 5, 526, 17), ...kids);
  // the program's screen behind it (v20dos-orig-n2.png, measured: the 640 x 476 screen, its teal title bar and grey menu bar, the left column
  // white, the map black with its scroll bars; the window at (48, 99) on it): nothing in the panes yet, as before a game exists
  const stage = el('div', { class: 'dd-stage', 'aria-hidden': 'false' });
  const bar = (cls, l, t, w, h, txt) => { const e = dAt(el('div', { class: cls, 'aria-hidden': 'true' }), l, t, w, h); if (txt) e.append(txt); return e; };
  const menus = el('span', null); ['File', 'Options', 'Ships', 'Galaxy', 'Window'].forEach((m) => { const w = tx(m); menus.append(el('b', null, w.charAt(0)), w.slice(1), '  '); });
  stage.append(bar('dd-st-title', 0, 0, 640, 15, tx('Spaceward Ho!')), bar('dd-st-menu', 0, 15, 640, 13, menus), bar('dd-st-left', 0, 28, 240, 448), bar('dd-st-map', 240, 28, 400, 448),
    bar('dd-st-vbar', 624, 28, 16, 432), bar('dd-st-hbar', 240, 460, 400, 16), dAt(box, 48, 99, 536, 280));
  const holder = el('div', { class: 'cg-dos' }, stage, el('div', { class: 'dd-morerow' }, more)); f.prepend(holder);
  const keep = (n) => n.classList && opened && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules'), dress = () => { const on = !rs || rs.value === 'dos'; stage.style.display = on && opened ? 'none' : ''; more.textContent = opened ? tx('Back to Create New Galaxy') : tx('Remake options…'); more.parentNode.style.position = opened ? 'static' : ''; more.style.fontSize = opened ? '13px' : ''; box.style.display = on ? '' : 'none'; win.classList.toggle('dosw', on && !opened); for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  if (rs) rs.addEventListener('change', dress); dress();
  // Create goes on to the program's Player Entry, then New Player Registration (FUN_a000_b60f / FUN_b000_53a0 and FUN_a000_ba93 / FUN_b000_44f0; captured,
  // v20dos-orig-playerentry, -playerentry-name, -registration): each a window of the program on the same screen, placed by its rule (placeDos's cells).
  // Player Entry, 38 x 13 cells (304 x 182) at 168, 140: "Please Identify Yourself:", Player Name and Player Password with their fields (216 x 14), Cancel,
  // OK (dimmed until a name is typed), Info... (dimmed in a new game). New Player Registration, 48 x 15 (384 x 210) at 128, 126: "Your Name:" and the name,
  // "Password:" and the password, the picture d3520, Skill Level (Novice ... Expert, opening on Novice) and Sex (Male, Female) in their boxes, Cancel, Join.
  // Join starts the game with those choices (the form's name, d_skill and female). THE REMAKE'S: the password is not kept (the remake has none). The words sit
  // a row lower than dText's other windows put them (measured: every line 1 pixel high at 28 / 56 / 70 ...).
  const swap = (w, h, l, t, title, kids, label) => {
    const nb = el('div', { class: 'dd', role: 'group', 'aria-label': label }); nb.style.width = du(w); nb.style.height = du(h);
    nb.append(dAt(el('div', { class: 'dd-title', translate: 'no' }, title), 5, 5, w - 10, 17), ...kids);
    const cur = stage.querySelector(':scope > .dd'); if (cur) cur.replaceWith(dAt(nb, l, t, w, h)); else stage.append(dAt(nb, l, t, w, h)); return nb;
  };
  function playerEntryDos() {
    const nm = field('name'); let name = '', pw = '';
    const ok = dButton('OK', 112, 140, 72, 28, () => { if (name.trim()) registrationDos(name.trim(), pw); }, { hot: 0, def: true }), info = dButton('Info...', 200, 140, 72, 28, () => {}, { hot: 0 });
    ok.disabled = true; info.disabled = true;
    const nf = dField(40, 70, 216, 14, '', 31, (v) => { name = v; ok.disabled = !v.trim(); }, 'Player Name'), pf = dField(40, 112, 216, 14, '', 31, (v) => { pw = v; }, 'Player Password');
    [nf, pf].forEach(i => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!ok.disabled) ok.click(); } }));
    swap(304, 182, 168, 140, 'Spaceward Ho! Player Entry', [dText(tx('Please Identify Yourself:'), 40, 29), dText('Player Name:', 40, 57, { hot: 7 }), nf, dText('Player Password:', 40, 99, { hot: 7 }), pf,
      dButton('Cancel', 24, 140, 72, 28, () => a.closeModal(), { hot: 0 }), ok, info], 'Spaceward Ho! Player Entry');
    setTimeout(() => nf.focus(), 0);
  }
  function registrationDos(name, pw) {
    const sk = field('d_skill'), fem = field('female'), skills = ['novice', 'beginner', 'normal', 'advanced', 'expert'], SK = ['Novice', 'Beginner', 'Normal', 'Advanced', 'Expert'], SKH = [0, 0, 2, 0, 0];
    let skill = sk && skills.includes(sk.value) ? sk.value : 'novice', female = !!fem && fem.value === '1';
    const radio = (label, hot, l, t, on, pick) => { const r = dText('', l, t); r.setAttribute('role', 'radio'); r.tabIndex = 0; r.style.cursor = 'pointer';
      const draw = () => { r.textContent = ''; const w = (on() ? '(\u2022) ' : '( ) ') + label; r.append(w.slice(0, 4 + hot), a.el('span', { class: 'hot' }, w[4 + hot]), w.slice(5 + hot)); r.setAttribute('aria-checked', String(on())); };
      r.addEventListener('click', () => { pick(); all.forEach(f2 => f2()); }); r.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); pick(); all.forEach(f2 => f2()); } });
      all.push(draw); return r; };
    const all = [];
    const rows = skills.map((k, i) => radio(SK[i], SKH[i], 128, 71 + 14 * i, () => skill === k, () => { skill = k; }));
    const sexes = [radio('Male', 0, 264, 71, () => !female, () => { female = false; }), radio('Female', 0, 264, 85, () => female, () => { female = true; })];
    all.forEach(f2 => f2());
    const img = a.IMG['dos:d3520'], pic = img ? dAt(el('img', { src: img.src, alt: '', style: 'image-rendering:pixelated' }), 19, 68, 74, 74) : null;
    const join = () => { if (sk) { sk.value = skill; fire(sk); } if (fem) { fem.value = female ? '1' : '0'; fire(fem); } const nm = field('name'); if (nm) { nm.value = name; fire(nm); } f.requestSubmit(); };
    swap(384, 210, 128, 126, 'Spaceward Ho! New Player Registration', [dText(tx('Your Name:') + name, 16, 29), dText(tx('Password:') + pw, 224, 29), pic,
      dAt(el('div', { class: 'dd-gbox' }), 123, 63, 106, 85), dAt(el('span', { class: 'dd-gtitle', translate: 'no' }, tx('Skill Level')), 128, 57, null, 14), ...rows,
      dAt(el('div', { class: 'dd-gbox' }), 259, 63, 90, 43), dAt(el('span', { class: 'dd-gtitle', translate: 'no' }, tx('Sex')), 264, 57, null, 14), ...sexes,
      dButton('Cancel', 80, 168, 72, 28, () => a.closeModal(), { hot: 0 }), dButton('Join', 232, 168, 72, 28, join, { hot: 0, def: true })], 'Spaceward Ho! New Player Registration');
  }
}

// ---- Ships: List Ship Types (496 x 350), Create New Ship Type (512 x 280), Build Ships / the shipbuilding queue (496 x 336) ----
function dField(l, t, w, h, val, max, onInput, label) {
  const a = window.HOAPI, i = a.el('input', { type: 'text', class: 'dd-field', maxlength: max, value: val || '', 'aria-label': label || '', spellcheck: 'false', autocomplete: 'off' });
  i.addEventListener('input', () => onInput(i.value)); return dAt(i, l, t, w, h);
}
const className = (d) => (wl() === 'de' ? DE_CLASS[d.type] : window.HO.TYPES[d.type].name) || d.type;
const caption = (d) => `${d.name} (${d.W}/${d.S}) ${className(d)}`;
const nf = (n) => (window.HO.rules(window.HOAPI.G).fmtNum || window.HO.niceNum)(Math.round(n));
function shipPicEl(d, h) { const e = window.HOAPI.shipImgEl(d, h); e.style.width = 'auto'; e.style.imageRendering = 'pixelated'; return e; }
function renameDos(d, back) {
  const a = window.HOAPI; let v = d.name;
  const f = dField(24, 52, 200, 14, v, 15, (x) => { v = x; }, 'New Ship Name');
  dDialog(320, 150, null, [dText(tx('Type your new ship name or click on “Name It” for a suggestion:'), 16, 12, { w: 290 }), f,
    dButton('Name It', 16, 100, 90, 27, () => { v = window.HO.designName(a.G, a.me(), d.type); f.value = v; }, { hot: 0 }), dButton('Cancel', 118, 100, 90, 27, back, { hot: 0 }),
    dButton('OK', 220, 100, 80, 27, () => { const n = v.trim(); if (n) { d.name = n.slice(0, 15); a.save(); a.renderPanel(); } back(); }, { hot: 0 })], 'Rename');
}
function shipTypesDos(selId) {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), rs = H.rules(g);
  const ds = p.designs.filter(d => !d.scrapped).reverse(); if (!ds.length) return false;
  let cur = ds.find(d => d.id === selId) || ds[0];
  const box = dListBox(138, 224, 15, 28), kids = [dText(tx('Ship Types:'), 24, 14), box], pane = [];
  const shipCount = (did) => g.fleets.filter(f => f.owner === a.ME).reduce((n, f) => n + (f.ships[did] || 0), 0);
  const draw = () => {
    box.textContent = ''; box.style.padding = '0';
    ds.forEach(d => { const it = a.el('div', { class: 'dd-type' + (d === cur ? ' sel' : ''), role: 'option', 'aria-selected': String(d === cur), onclick: () => { cur = d; draw(); } }, shipPicEl(d, 40), a.el('span', { class: 'cap', translate: 'no' }, caption(d))); box.append(it); });
    pane.splice(0).forEach(n => n.remove());
    const c = H.designCost(g, cur), T = (t, l, y, w) => { const e = dText(String(t), l, y, w ? { w } : undefined); pane.push(e); dlg.append(e); return e; };
    const pic = shipPicEl(cur, 76); dAt(pic, 235, 33); pane.push(pic); dlg.append(pic);
    T(tx('Name:'), 232, 112); T(cur.name, 376, 112, 93); T(tx('Class:'), 232, 126); T(className(cur), 376, 126, 93);
    T(tx('Development Cost:'), 232, 140); T('$' + nf(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0)), 376, 140); T(tx('Production Cost:'), 232, 154); T('$' + nf(c.money), 376, 154); T(tx('Metal Cost:'), 232, 168); T(nf(c.metal), 376, 168);
    T(tx('Range') + ':', 232, 196); T(String(cur.R), 288, 196); T(tx('Speed') + ':', 232, 210); T(String(cur.V), 288, 210); T(tx('Weapons') + ':', 232, 224); T(String(cur.W), 304, 224); T(tx('Shields') + ':', 376, 196); T(String(cur.S), 440, 196); T(tx('Mini') + ':', 376, 210); T(String(cur.M), 440, 210);
    T('# Built:', 24, 265); T(nf(cur.built || 0), 120, 265); T('# Existing:', 24, 279); T(nf(shipCount(cur.id)), 120, 279);
    const on = !!cur.scrap301, ck = dText((on ? '[x] ' : '[ ] ') + 'Scrap This Type', 24, 308, { hot: 4 }); ck.style.cursor = 'pointer'; ck.setAttribute('role', 'checkbox'); ck.setAttribute('aria-checked', String(on)); ck.tabIndex = 0;
    ck.textContent = ''; ck.append((on ? '[x] ' : '[ ] ') + 'S'.slice(0, 0), a.el('span', { class: 'hot' }, 'S'), 'crap This Type');
    const flip = () => { if (rs.flagScrapDesign) { rs.flagScrapDesign(g, p, cur, 'command'); a.save(); draw(); } else { const n = shipCount(cur.id); a.confirmBox(`Scrap this ship type and all ${n} existing ship${n === 1 ? '' : 's'} of it?`, () => { H.scrapDesign(g, a.ME, cur.id); a.closeModal(); a.renderPanel(); a.draw(); }); } };
    ck.addEventListener('click', flip); ck.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } }); pane.push(ck); dlg.append(ck);
  };
  kids.push(dButton('Rename', 264, 280, 72, 27, () => { a.closeModal(); renameDos(cur, () => { a.closeModal(); shipTypesDos(cur.id); }); }, { hot: 0 }), dButton('OK', 368, 280, 72, 27, () => a.closeModal(), { hot: 0 }));
  const dlg = dDialog(496, 350, null, kids, 'List Ship Types'); box.parentNode === dlg && dlg.append(vScroll(box, 143, 28, 224));
  draw(); return true;
}
function newTypeDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), rs = H.rules(g);
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => H.canBuildType(g, p, t));
  const st = { type: types[0], name: '' }; const sl = {};
  const KEYS = ['R', 'V', 'W', 'S', 'M'], LAB = ['Range:', 'Speed:', 'Weapons:', 'Shields:', 'Mini:'];
  const dyn = []; let dlg, ok, nameF;
  const limits = () => { const L = H.designLimits(g, p, st.type); for (const k of KEYS) { const lo = H.designMin(g, k, st.type); if (st[k] == null || st._t !== st.type) st[k] = L[k]; st[k] = Math.max(lo, Math.min(Math.max(lo, L[k] || lo), st[k])); } st._t = st.type; return L; };
  const draw = () => {
    dyn.splice(0).forEach(n => n.remove()); const L = limits(), add = (e) => { dyn.push(e); dlg.append(e); return e; };
    const spec = { type: st.type, R: st.type === 'satellite' ? 0 : st.R, V: st.V, W: st.W, S: st.S, M: st.M };
    add(dAt(shipPicEl(spec, 66), 252, 15));
    KEYS.forEach((k, i) => {
      const min = H.designMin(g, k, st.type), max = Math.max(min, L[k] || min), y = 98 + 28 * i; if (k === 'R' && st.type === 'satellite') return;
      add(dText(tx(LAB[i].slice(0, -1)) + ':', 16, y)); add(dText(`${st[k]} / ${max}`, 88, y));
      add(dSlider(137, y, 103, 13, min, max, st[k], (n) => { st[k] = n; draw(); }, LAB[i].slice(0, -1)));
    });
    const c = H.designCost(g, spec);
    add(dText(tx('Dev. Cost:'), 272, 181)); add(dText('$' + nf(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0)), 375, 181)); add(dText(tx('Prod. Cost:'), 272, 195)); add(dText('$' + nf(c.money), 375, 195)); add(dText(tx('Metal Cost:'), 272, 209)); add(dText(nf(c.metal), 382, 209));
    ok.disabled = !st.name.trim(); ok.classList.toggle('off', ok.disabled);
  };
  const cls = dAt(a.el('div', { class: 'dd-list', role: 'listbox', 'aria-label': 'Class' }), 355, 105, 105, 70); cls.style.padding = du(0);
  const paintCls = () => { cls.textContent = ''; types.slice(0, 4).forEach((t, i) => { const r = a.el('div', { class: 'dd-row' + (st.type === t ? ' sel' : ''), role: 'option', onclick: () => { st.type = t; paintCls(); draw(); } }, H.TYPES[t].name); r.style.padding = '0 ' + du(5); cls.append(r); }); };
  nameF = dField(16, 56, 160, 14, '', 15, (v) => { st.name = v; ok.disabled = !v.trim(); ok.classList.toggle('off', ok.disabled); }, 'Name of Ship Type');
  ok = dButton('OK', 392, 238, 71, 27, () => {
    const lim = rs.maxDesigns, spec = { type: st.type, R: st.type === 'satellite' ? 0 : st.R, V: st.V, W: st.W, S: st.S, M: st.M, name: st.name.trim() };
    if (lim && H.liveDesigns(p) >= lim) { a.alertOver([H.say(g, H.DATA.alerts[15] || 'Your assembly lines are full.')], 'en'); return; }
    H.findOrCreateDesign(g, p, spec); a.save(); a.closeModal(); a.renderPanel();
  }, { hot: 0 });
  dlg = dDialog(512, 280, null, [dText(tx('Name of Ship Type:'), 16, 41, { hot: 13 }), nameF, dText(tx('Class:'), 296, 112, { hot: 1 }), cls,
    dButton('Name It For Me', 64, 238, 136, 27, () => { st.name = H.designName(g, p, st.type); nameF.value = st.name; ok.disabled = false; ok.classList.remove('off'); }, { hot: 0 }), dButton('Cancel', 272, 238, 71, 27, () => a.closeModal(), { hot: 0 }), ok], 'Create New Ship Type');
  paintCls(); draw(); return true;
}
// A double click counted by the window itself, for lists that redraw on the first click: the second click lands on a new row, and Firefox and
// Safari send no dblclick for it (Chrome does). Two clicks within 500 ms on the same item are a double click (as js/skins/mac12/ui.js dbl12).
let DBLC = null;
function dblc(key, one, two) {
  return () => { const t = Date.now(), hit = !!DBLC && DBLC.k === key && t - DBLC.t < 500; DBLC = hit ? null : { k: key, t }; if (hit) two(); else one(); };
}
function buildDos(sid) {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), s = g.stars[sid], rs = H.rules(g);
  if (!H.feature(g, 'buildQueue') || s.owner !== a.ME) return false;
  const slots = rs.queueSlots || 3;
  let q = (s.queue || []).map(x => ({ did: x.did, n: x.n })), sel = 0;
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => H.canBuildType(g, p, t));
  const designs = () => p.designs.filter(d => !d.scrapped && types.includes(d.type)).reverse();
  const top = dAt(a.el('div', { class: 'dd-gbox dd-qtop' }), 48, 42, 248, 83), cells = [0, 1, 2].map(i => { const c = dAt(a.el('div', { class: 'dd-qcell', role: 'option', tabindex: 0 }), 152, [154, 210, 265][i], 120, i === 2 ? 56 : 56); return c; });
  const lst = dAt(a.el('div', { class: 'dd-list dd-types', role: 'listbox', 'aria-label': 'Available Types' }), 311, 42, 130, 224);
  const dsg = (id) => p.designs.find(d => d.id === id);
  const add = (d) => { const e = q.find(x => x.did === d.id); if (e) e.n++; else if (q.length < slots) q.push({ did: d.id, n: 1 }); else { a.toast(`${s.name}’s queue is full: it holds ${slots} kinds of ship.`); return; } draw(); };
  const draw = () => {
    top.textContent = ''; sel = Math.min(sel, Math.max(0, q.length - 1));
    cells.forEach((c, i) => { c.textContent = ''; const it = q[i]; c.classList.toggle('sel', i === sel && !!it); c.setAttribute('aria-selected', String(i === sel && !!it)); if (!it) return; const d = dsg(it.did); if (!d) return;
      c.append(dAt(shipPicEl(d, 28), 4, 4), dAt(a.el('span', { class: 'cap', translate: 'no' }, `${it.n} ${d.name}`), 4, 36, 112, 14)); });
    const it = q[sel], d = it && dsg(it.did);
    // (the cost line, FUN_b000_be04 / b9f6: "$cost (D)" while no ship of the type has been built (its development cost is due), "$cost (P)" after; seen on the
    // running Windows program, whose BLDSHIP writes the same: a new Fighter type "$4,000 (D)", the starting Scout "$1,960 (P)", win20-orig-vga16-build-{dev,prod}.png)
    if (d) { const pr = rs.yardProgress ? rs.yardProgress(g, p, s) : null, c = H.shipCostNow(g, p, d);
      top.append(dAt(shipPicEl(d, 40), 8, 8), dAt(a.el('span', { class: 'dd-t', translate: 'no' }, '$' + nf(c.money) + (d.built === 0 && !d.free ? ' (D)' : ' (P)')), 140, 14, 100, 14), dAt(a.el('span', { class: 'dd-t', translate: 'no' }, (sel === 0 && pr ? pr.pct : 0) + '% Done'), 140, 34, 100, 14), dAt(a.el('span', { class: 'cap', translate: 'no' }, caption(d)), 8, 56, 232, 14)); }
  };
  const fill = () => { lst.textContent = ''; designs().forEach(d => { const it = a.el('div', { class: 'dd-type', role: 'option', tabindex: 0, 'aria-label': caption(d), onclick: () => add(d), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(d); } } }, shipPicEl(d, 40), a.el('span', { class: 'cap', translate: 'no' }, caption(d))); lst.append(it); }); };
  cells.forEach((c, i) => { c.addEventListener('click', dblc('q' + i, () => { if (q[i]) { sel = i; draw(); } }, () => { if (q[i] && --q[i].n <= 0) q.splice(i, 1); draw(); }));
    c.addEventListener('keydown', (e) => { if (q[i] && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); if (--q[i].n <= 0) q.splice(i, 1); draw(); } }); });
  const commit = () => { const cur = () => (s.queue || []).slice();
    // take away what is no longer wanted (last first), then add what was
    for (let i = cur().length - 1; i >= 0; i--) { const w = q.find(x => x.did === cur()[i].did); let have = cur()[i].n, want = w ? w.n : 0; while (have-- > want) H.unqueueShip(g, a.ME, sid, i); }
    for (const w of q) { const have = ((s.queue || []).find(x => x.did === w.did) || { n: 0 }).n; if (w.n > have) H.queueShips(g, a.ME, sid, w.did, w.n - have); }
    a.save(); a.renderPanel(); a.draw(); };
  const dlg = dDialog(496, 336, null, [dText('Shipbuilding queue at ' + s.name, 16, 14), top, dText(tx('In The Queue:'), 49, 154, { hot: 7 }), ...cells, dText(tx('Available Types'), 312, 28), lst,
    dButton('Cancel', 305, 295, 70, 26, () => a.closeModal(), { hot: 0 }), dButton('OK', 385, 295, 70, 26, () => { commit(); a.closeModal(); }, { hot: 0 })], 'Shipbuilding queue');
  dlg.append(vScroll(lst, 432, 42, 224)); fill(); draw(); return true;
}

// Galaxy, Compare Players: 536 x 308. Before 2010 it is the sentence, a dimmed Show Skills and OK; the chart of later years is the classic window (kept difference)
function compareDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, C = H.rules(g).compare; if (!C) return false;
  const info = H.compareInfo(g, a.ME), me = a.me();
  const title = info.kind === 'none' ? a.tl(C.texts.none) : info.kind === 'won' ? a.tl(C.texts.won, info.year) : info.kind === 'out' ? a.tl(C.texts.out, info.year) : a.tl(C.texts.ranks, info.n, info.year);
  const kids = [dText(title, 23, 14)];
  if (info.kind === 'ranks') {
    // the chart of Compare Players (536 x 308; measured: the axes at x 80 and y 238, Best 16 under the top (42), Worst 16 above the axis, nine columns 43.2 apart)
    const cv = a.el('canvas', { class: 'dd-pic', 'aria-label': title, role: 'img' }); const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(536 * U * dpr); cv.height = Math.round(308 * U * dpr); dAt(cv, 0, 0, 536, 308); cv.style.pointerEvents = 'none';
    const x = cv.getContext('2d'); x.setTransform(U * dpr, 0, 0, U * dpr, 0, 0); x.imageSmoothingEnabled = false; x.strokeStyle = x.fillStyle = '#000'; x.font = "12px 'DOS Geneva 9'"; x.lineWidth = 1;
    const words = a.compareWords && a.compareWords(), word = (i) => (words ? words[i] : a.tl(a.CMP_EN[i]));
    const x0 = 80, top = 42, y0 = 238, right = 512, n = info.n, unit = n >= 2 ? Math.trunc((y0 - top - 32) / (n - 1)) : Math.trunc((y0 - top) / 2) - 16, step = (right - x0) / 10;
    const ln = (p1, q1, p2, q2) => { x.beginPath(); x.moveTo(p1 + .5, q1 + .5); x.lineTo(p2 + .5, q2 + .5); x.stroke(); };
    ln(x0, top, x0, y0); ln(x0, y0, right, y0);
    const side = (y, t) => { ln(x0 - 1, y, x0 + 1, y); x.textAlign = 'right'; x.fillText(t, x0 - 6, y + 4); };
    side(top + 16, word(9)); side(Math.trunc((top + y0) / 2), word(10)); side(y0 - 16, word(11));
    x.textAlign = 'center';
    for (let k = 1; k < 10; k++) { const xx = Math.round(x0 + step * k); ln(xx, y0 - 1, xx, y0 + 1); x.fillText(word(k - 1), xx, y0 + 12); }
    const im = a.IMG['white0_' + (me.female ? 1 : 0)] || a.IMG['dos:i' + (me.female ? 1500 : 1000)];
    for (let k = 0; k < 9; k++) { const ix = Math.round(x0 + step * (k + 1)) - 16, iy = top + Math.trunc(unit * info.scores[k] / 10); if (im && im.width) x.drawImage(im, ix, iy, 32, 32); }
    kids.push(cv);
  }
  const sk = dButton('Show Skills', 120, 267, 111, 27, () => skillsDos(dlg), { hot: 0, def: info.kind === 'ranks' });
  kids.push(sk, dButton('OK', 345, 267, 70, 27, () => a.closeModal(), { hot: 0, def: info.kind !== 'ranks' }));
  const dlg = dDialog(536, 308, null, kids, 'Compare Players');
  if (info.kind === 'none') { sk.disabled = true; sk.classList.add('off'); }
  return true;
}
// Show Skills: a second window over the chart (432 x 308 at 56 right of the chart's left edge; the chart stays under it), the list of players with their skill, the Computer Intelligence, OK
function skillsDos(under) {
  const a = window.HOAPI, H = window.HO, g = a.G, L = window.HOLANG, lang = (g.opts && g.opts.lang) || H.ownLanguage(H.ownRules(g));
  const SKK = ['novice', 'beginner', 'normal', 'advanced', 'expert'], IQK = ['dumb', 'average', 'smart', 'diabolical'], SK = ['Novice', 'Beginner', 'Normal', 'Advanced', 'Expert'], IQ = ['Dumb', 'Average', 'Smart', 'Diabolical'];
  const off = L && lang === 'de' && L.dosDe && L.dosDe.s ? { sk: [96, 97, 98, 99, 100].map(i => L.dosDe.s[i]), iq: [16, 17, 18].map(i => L.dosDe.s[i]) } : null;
  const skillName = (k) => { const i = SKK.indexOf(k) < 0 ? 2 : SKK.indexOf(k); return off && off.sk && off.sk[i] ? off.sk[i] : tx(SK[i]); };
  const iqi = Math.max(0, IQK.indexOf((g.opts && g.opts.iq) || 'average')), iq = off && off.iq && off.iq[iqi] ? off.iq[iqi] : tx(IQ[iqi]);
  const d = a.el('div', { class: 'dd dd-over', role: 'dialog', 'aria-label': tx('List of all players and their skill levels:') });
  d.style.width = du(432); d.style.height = du(308); dAt(d, 56, 0);
  const box = dListBox(397, 213, 18, 33); let cur = 0;
  // (in the name's order, and a computer reads Novice: its skill field is never set, the player's choice at registration being the only one written;
  // Jake's image0083, "Bert Novice", "Jake Novice" with Dumb computers, as the Windows program shows it, js/skins/dos/win31/dialogs.js)
  const order = g.players.slice().sort((p2, q2) => String(p2.name).localeCompare(String(q2.name), undefined, { sensitivity: 'base' }));
  const show = () => { box.textContent = ''; order.forEach((q, i) => box.append(a.el('div', { class: 'dd-row dd-skill' + (i === cur ? ' sel' : ''), role: 'option', 'aria-selected': String(i === cur), translate: 'no', onclick: () => { cur = i; show(); } },
    a.el('span', { class: 'n' }, q.name), a.el('span', { class: 'k' }, skillName(q.human ? q.skill : 'novice'))))); };
  show();
  const ok = dButton('OK', 328, 266, 71, 27, () => d.remove(), { hot: 0 });
  d.append(dText(tx('List of all players and their skill levels:'), 22, 14, { hot: lang === 'en' || !lang ? 0 : -1 }), box, dText(tx('Computer Intelligence:') + ' ' + iq, 22, 266), ok);
  under.append(d); ok.focus();
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); d.remove(); } }, true);
  return d;
}
// The program's alert box, measured on seven captured alerts (the fuel alert; Jake's 24 Nov captures: abandon, revert, a fleet in hyperspace, a star's name taken,
// ten messages: the private repo's audit/dos-2.0.1/captures, image0056, 0084, 0159, 0165, 0190). Its size follows its words, in screen cells (8 x 14): the text wraps at 40
// characters and the box is 6 cells wider than its longest line (or as wide as its buttons need), as many rows as its lines and 8 more (with the mascot) or 6 (without).
// It is placed by the program's rule for every window (placeDos). With the mascot (PicMsgBox): the text from cell 2 (pixel 23) and 13 down, the mascot (d3520) 6 below
// the text at 22, the buttons 23 below the picture's top. Without it (MsgBox; "Sorry, you can only send ten messages per turn."): a grey box, the text from cell (1, 1),
// the buttons a row under it. The buttons are all as wide as the widest (a one-word label is padded with a space each side: " OK " 8 cells at least, " Cancel " 9,
// "Let 'em Die" 12; 8 x cells + 8 pixels) and spaced evenly between cell 11 (1 without the mascot) and 4 cells from the right edge, a cell's spare left over.
function alertDos(paras, btns, o) {
  if (winOn() && window.HOWIN31 && window.HOWIN31.alert) { const w = window.HOWIN31.alert(paras, btns, o); if (w) return w; } // (the Windows program's alert box, template 4: js/skins/dos/win31/dialogs.js)
  const a = window.HOAPI, plain = !!(o && o.plain), wrap = (t) => { const out = []; String(t).split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { if (line && (line + ' ' + w).length > 40) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }); out.push(line); }); return out; };
  const dosq = (t) => String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); // (the DOS character set has no curly quotes: the program's straight ones, captured)
  const lines = []; paras.forEach((t, i) => { if (i) lines.push(''); wrap(dosq(t)).forEach(l => lines.push(l)); }); btns.forEach(b => { b.label = dosq(b.label); });
  const n = btns.length, bw = Math.max(8, ...btns.map(b => { const L = String(b.label).length; return (/\s/.test(b.label) ? L : L + 2) + 1; }));
  const L0 = plain ? 1 : 11, need = L0 + n * bw + 2 * (n + 1) + 1 + 4, cols = Math.max(Math.max(0, ...lines.map(l => l.length)) + 6, need), rows = lines.length + (plain ? 6 : 8);
  const w = 8 * cols, h = 14 * rows, pic = 13 + 14 * lines.length + 6, by = plain ? 28 + 14 * lines.length + 14 : pic + 23;
  const d = a.el('div', { class: 'dd dd-alert' + (plain ? ' plain' : ''), role: 'alertdialog', 'aria-modal': 'true', 'aria-label': paras[0] });
  d.style.width = du(w); d.style.height = du(h);
  const done = () => back.remove();
  lines.forEach((l, i) => l && d.append(plain ? dText(l, 16, 29 + 14 * i) : dText(l, 24, 15 + 14 * i))); // (a pixel lower and, beside the mascot, a pixel right of where the fuel alert's first measure put them: all seven captures)
  const im = a.IMG['dos:d3520']; if (im && !plain) { const c = a.el('canvas', { class: 'dd-pic', 'aria-hidden': 'true' }); c.width = 74; c.height = 74; c.getContext('2d').drawImage(im, 0, 0); dAt(c, 23, pic, 74, 74); c.style.imageRendering = 'pixelated'; d.append(c); }
  const R = cols - 4, gap = Math.floor((R - L0 - n * bw) / (n + 1));
  // (the thick border: on the first button, the one the program gives the focus: Cancel in its questions, a lone OK (images 0165, 0190, the fuel alert; the
  // hyperspace alert, opened over the fleet list, left the focus there, image 0159))
  btns.forEach((b, i) => d.append(dButton(b.label, 8 + 8 * (L0 + gap * (i + 1) + bw * i), by, 8 * bw + 8, 28, () => { done(); if (b.fn) b.fn(); }, { hot: /^Revert$/.test(b.label) ? 0 : -1, def: i === 0 }))); // (an underlined letter only where the program's label has one: Revert; " OK ", " Cancel " and Let 'em Die none)
  const cb = [...d.querySelectorAll('.dd-btn')].find(x => /cancel/i.test(x.textContent)) || [...d.querySelectorAll('.dd-btn')].pop(); if (cb) cb.setAttribute('data-esc-close', '1');
  const bs = d.querySelectorAll('.dd-btn');
  const yi = btns.findIndex(b => b.fn), ni = btns.findIndex(b => !b.fn);
  if (btns.length >= 2 && a.markYesNo && yi >= 0 && ni >= 0) a.markYesNo(d, bs[yi], bs[ni], !!(o && o.yesNo));
  const pos = a.el('div', { class: 'dd-alertpos' }, d); pos.style.transform = `translate(${du(8 * Math.floor((80 - cols) / 2) - (640 - w) / 2)}, ${du(14 * Math.floor((34 - rows) / 2) - (476 - h) / 2)})`; // (placeDos's rule)
  const back = a.el('div', { class: 'scrim dd-alertscrim', onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); } } }, pos);
  document.body.append(back); const f = d.querySelector('.dd-btn.def') || d.querySelector('.dd-btn'); if (f) f.focus();
  return back;
}
// ======== Windows read from the program's own dialog templates ========
// DOSHO.EXE keeps its 32 windows as templates in a far data segment (40df:xxxx in the unpacked image, 0x430 bytes apart, from RegisterDlgBox to PatchDlgBox): a name,
// the window's size in screen cells (8 x 14 pixels), then each item as x, y, height and width in cells, its control class (9 a button, 11 a line of words, 18 a picture
// the window's procedure paints, 4 an edit field ...), its words and its id. An item at cell (x, y) sits at (8 + 8x, 14 + 14y) of the window: Battle Speed (35 x 13
// cells, 280 x 182) and Auto Play (47 x 19) were measured so; a button is 8w + 8 by 28 from its cell's corner (Battle Speed's OK: 21, 8, 8 wide -> 176, 126, 72 x 28; it had been
// measured a pixel inside, before the button's cut corners were drawn).
const cell = (x, y) => [8 + 8 * x, 14 + 14 * y];
function tplButton(txt, x, y, w, fn, o) { const [l, t] = cell(x, y); return dButton(txt, l, t, 8 * w + 8, 28, fn, o); } // (the button fills its cells from their corner, 8 w + 8 by 28 with its cut corners: Battle Speed's OK and You Won's, measured on v20dos-orig-battlespeed and Jake's image0160)
function tplText(lines, x, y) { const [l, t] = cell(x, y); return lines.map((ln, i) => dText(ln, l, t + 1 + 14 * i)); } // (a row lower than dText's cell: You Won, You Lost (Jake's image0160, 0179), as Player Entry and the alerts)
function tplPic(name, x, y, w, h) {
  const a = window.HOAPI, im = a.IMG['dos:' + name], [l, t] = cell(x, y); if (!im) return null;
  const c = a.el('canvas', { class: 'dd-pic', 'aria-hidden': 'true' }); c.width = im.width; c.height = im.height; { const x2 = c.getContext('2d'); x2.fillStyle = '#000'; x2.fillRect(0, 0, c.width, c.height); x2.drawImage(im, 0, 0); } /* (opaque, on black: the extracted sprites keep black as see-through, and the window's white showed through: Jake's image0160, 0161, 0179) */ // (painted at its own size, not fitted to the item: FUN_2000_2ac4)
  return w == null ? dAt(c, l, t, im.width, im.height) : dAt(c, l + Math.floor((8 * w - im.width) / 2), t + Math.floor((14 * h - im.height) / 2), im.width, im.height); // (centred in the item's cells: You Won's 149 x 151 in 19 x 11 cells, Name a Star's 74 x 74 in 10 x 5: Jake's image0160, 0161, 0179)
}
// You Won and You Lost: YouWonDlgBox (21 x 20 cells, 168 x 280) and YouLostDlgBox (21 x 21, 168 x 294), opened by the turn's news (FUN_b000_88b3, alerts 5040 and 5050
// through FUN_3000_8395) with the window procedure FUN_9000_76c0, which loads picture 5040 or 5050 and paints it in item 999 (cell 0, 0, 19 x 11); the words, item 100, at
// cell 1, 11 (three lines, four for the lost one, left aligned as every line of words: FUN_b000_f240), and "   ~OK   " at cell 5, 15 (16), 8 wide. No title bar.
function youWonDos(kind, Y, done) {
  if (winOn() && window.HOWIN31 && window.HOWIN31.youWon && window.HOWIN31.youWon(kind, Y, done)) return true; // (the Windows program's box, template 3: js/skins/dos/win31/dialogs.js)
  const a = window.HOAPI, won = kind === 'won', h = won ? 20 : 21, lines = String(Y.text).split('\n');
  const d = a.el('div', { class: 'dd', role: 'dialog', 'aria-label': lines.join(' ') });
  d.style.width = du(168); d.style.height = du(14 * h);
  const ok = tplButton(Y.ok || 'OK', 5, won ? 15 : 16, 8, () => a.closeModal(), { hot: 0, def: true });
  [tplPic(won ? 'd5040' : 'd5050', 0, 0, 19, 11), ...tplText(lines, 1, 11), ok].forEach(k => k && d.append(k));
  placeDos(a.modal('', d, { cls: 'dosw', sticky: true, label: lines.join(' '), onClose: done }), 168, 14 * h);
  ok.focus(); return true;
}
// Closing Game: CloseGameDlgBox (22 x 8 cells, 176 x 112, no title bar), shown by FUN_a000_a3e4 (File, Close; Exit) while it writes the game file (FUN_3000_3fc0)
// and closed when that is done; its one item, "Closing Game..." (the German build's "Schließe Spiel..."), a line of words at cell 4, 2. The remake saves in a moment,
// so the box stays about a second (no button: nothing to press) and then the title page comes, for Close, Exit and the quit question alike.
function closingGameDos(go) {
  const a = window.HOAPI;
  if (winOn() && window.HOWIN31 && window.HOWIN31.notify && window.HOWIN31.notify(tx('Closing Game...'), go)) return true; // (the Windows program's notice, template 23)
  const de = wl() === 'de', d = dDialog(176, 112, null, tplText([de ? 'Schließe Spiel...' : tx('Closing Game...')], de ? 1 : 4, 2), 'Closing Game...'); // (the German build's template: its words at cell 1, 2)
  d.setAttribute('aria-busy', 'true'); d.setAttribute('aria-live', 'polite');
  setTimeout(() => { if (d.isConnected) a.closeModal(); go(); }, 1000);
  return true;
}
// The licensee, for every "Licensed to:" (About and Startup in both looks, the Windows program's licence window, template 14; Jake, November 2026: the
// licensee is the signed-in player): the signed-in account's display name (HOCLOUD.user when it is not anonymous and has a name of its own: never the
// e-mail address js/cloud.js describe() falls back to), else, while the account is not back yet this visit, the name this browser kept from it
// ("ho5.cloud.name", unless it is an e-mail address), else the name last typed at New Game ("ho5.name"). The organisation is the one typed in the
// licence window ("ho5.w31.org"; the program keeps both in THE_HO!.PRF). Read when a window opens; nothing waits for the account or is sent anywhere.
function licensee() {
  const ls = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const own = (n, u) => !!n && !/@/.test(n) && n !== 'Guest' && n !== 'Signed in' && (!u || n !== u.email);
  const C = window.HOCLOUD, u = C && C.user;
  let name = '';
  if (u) { if (!u.anonymous && own(u.name, u)) name = u.name; } else if (!(C && C.known) && own(ls('ho5.cloud.name'))) name = ls('ho5.cloud.name');
  return { name: name || ls('ho5.name'), org: ls('ho5.w31.org') };
}
// The Startup window: StartupDlgBox (40 x 29 cells, 320 x 406, title "Spaceward Ho! Startup"), made by FUN_b000_4130 when the program starts (captured,
// v20dos-orig-startup.png, measured): item 999, the picture 1002 (304 x 200), painted by the window procedure; "Licensed to:" at
// cell 0, 15 (the picture is painted from 8, 19, on black, and shows below the title bar from row 29: its rows 10 to 199, measured by the "2.0"); item 100 at cell 13, 15, three lines (the licensee's name, the organisation, "Spaceward Ho! Version 2.0"); "(C) 1993 New World Computing, Inc." at
// cell 2, 19; the buttons " ~Open Game " (101, the default), " ~New Game " (102) and " ~Cancel " (2) on row 21 (cells 2, 15 and 27; 11, 10 and 8 wide); item 500
// (cell 0, 24, 38 x 3) the New World Computing logo 9999 (268 x 48) centred in it. The German build's template (read in its DOSHO.EXE): the title "Spaceward Ho!",
// "Lizenz:" (7 cells) and item 100 at cell 8, 15, " ~Spiel öffnen ", " ~Neues Spiel ", "~Abbruch " in the same cells; shown when the page is in German. A word longer
// than its button (the German "Spiel öffnen", the remake's translations) is drawn narrower to fit.
// THE REMAKE'S OWN: it is shown FRAMED on the title page beside the remake's credits and options (as the iOS skin shows the app's title scene), at a size that
// fits; its buttons go through the remake's own commands: Open Game the Saved Games list, New Game the New Game window, Cancel closes it (the program's Cancel
// leaves the empty screen; the title page stays here). The licensee: licensee() above. Only in the DOS look.
function startupDos() {
  const a = window.HOAPI, ts = document.getElementById('titlescreen'); if (!a || !ts) return;
  const old = ts.querySelector('.dd-startframe'); if (old) old.remove();
  ts.classList.remove('dd-wel', 'dd-wide');
  if (!frameOn()) return;
  // (the Windows look: the Windows program's Startup window, template 32, js/skins/dos/win31/dialogs.js HOWIN31.startup, in the same frame)
  if (winOn() && window.HOWIN31 && window.HOWIN31.startup && window.HOWIN31.templates) {
    // (the program's licence window first, when no licensee is kept or the warranty answer was No: template 14, HOWIN31.licenceFirst; Startup after its OK)
    if (window.HOWIN31.licenceFirst && !startupDos.lic && window.HOWIN31.licenceFirst(() => { startupDos.lic = true; startupDos(); })) return;
    const close = () => { fr.remove(); ts.classList.remove('dd-wel', 'dd-wide'); };
    const dlg = window.HOWIN31.startup({ close, wu: 1 }); if (!dlg) return;
    dlg.el.setAttribute('role', 'dialog'); dlg.el.setAttribute('aria-label', tx('Spaceward Ho! Startup'));
    const fr = a.el('div', { class: 'dd-startframe w31-startframe' }, a.el('div', { class: 'dd-startscr' }, dlg.el));
    const fit = () => {
      if (!fr.isConnected) return;
      const vw = window.innerWidth, vh = window.innerHeight, wide = vw >= 640 && vw > vh * 1.05, bz = vw < 900 ? 8 : 14, side = vw < 900 ? 24 + 24 : 96, OW = 314, OH = 407;
      const k0 = wide ? Math.min((vw - side - 420 - 2 * bz) / OW, (vh - 32 - 2 * bz) / OH) : Math.min((vw - 24 - 2 * bz) / OW, (vh * 0.8 - 2 * bz) / OH);
      const k = Math.max(0.4, Math.min(k0, 2)), kk = k >= 1 ? Math.floor(k * 4) / 4 : k;
      ts.classList.toggle('dd-wide', wide); dlg.el.style.setProperty('--wu', kk + 'px'); fr.style.padding = bz + 'px';
    };
    ts.classList.add('dd-wel'); ts.prepend(fr); fit();
    if (!ts._ddFit) { ts._ddFit = true; window.addEventListener('resize', () => { const f = ts.querySelector('.dd-startframe'); if (f && f._fit) f._fit(); }); }
    fr._fit = fit;
    return;
  }
  const de = !!(window.HOUI && window.HOUI.lang === 'de'), W = de ? { title: 'Spaceward Ho!', lic: 'Lizenz:', at: 8, open: 'Spiel öffnen', neu: 'Neues Spiel', cancel: 'Abbruch' }
    : { title: tx('Spaceward Ho! Startup'), lic: tx('Licensed to:'), at: 13, open: tx('Open Game'), neu: tx('New Game'), cancel: tx('Cancel') };
  const d = a.el('div', { class: 'dd dd-startup', role: 'dialog', 'aria-label': W.title });
  d.style.width = du(320); d.style.height = du(406);
  d.append(dAt(a.el('div', { class: 'dd-title', translate: 'no' }, W.title), 5, 5, 310, 17));
  const pic = (name, l, t, label, top, bg) => { const im = a.IMG[P + name]; if (!im || !im.width) return null; const c = a.el('canvas', { class: 'dd-pic', role: label ? 'img' : null, 'aria-label': label || null, 'aria-hidden': label ? null : 'true' }); const y0 = top || 0; c.width = im.width; c.height = im.height - y0; const x = c.getContext('2d'); if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); } x.drawImage(im, 0, -y0); return dAt(c, l, t, c.width, c.height); };
  const L = licensee();
  const [lx, ly] = cell(W.at, 15);
  // (a word wider than its place, in program pixels, is drawn narrower: measured once laid out, again when the window is fitted)
  const narrow = [], fitB = (e, px) => { const sp = e.matches('.dd-btn') ? e.querySelector('span') : e; narrow.push([sp, px]); return e; };
  const doNarrow = () => { const k = d.getBoundingClientRect().width / 320; if (!k) return; for (const [sp, px] of narrow) { sp.style.display = 'inline-block'; sp.style.transform = ''; sp.style.transformOrigin = sp.parentNode.matches('.dd-btn') ? '50% 50%' : '0 50%'; sp.style.margin = ''; const w = sp.getBoundingClientRect().width; if (w > px * k) { sp.style.transform = `scaleX(${(px * k / w).toFixed(3)})`; if (sp.parentNode.matches('.dd-btn')) sp.style.margin = `0 ${(-(w - px * k) / 2).toFixed(2)}px`; } } };
  const close = () => { fr.remove(); ts.classList.remove('dd-wel', 'dd-wide'); };
  const lic = tplText([W.lic], 0, 15)[0]; fitB(lic, 8 * W.at - 4);
  [pic('d1002', 8, 29, 'Spaceward Ho! 2.0', 10, '#000'), lic, dText(L.name, lx, ly, { w: 304 - lx + 8 }), dText(L.org, lx, ly + 14, { w: 304 - lx + 8 }), dText(tx('Spaceward Ho! Version 2.0'), lx, ly + 28),
    ...tplText(['(C) 1993 New World Computing, Inc.'], 2, 19),
    fitB(tplButton(W.open, 2, 21, 11, () => a.openSavedGames(), { hot: 0, def: true }), 8 * 11 - 8),
    fitB(tplButton(W.neu, 15, 21, 10, () => { const b = document.getElementById('tnew'); if (b) b.click(); }, { hot: 0 }), 8 * 10 - 8),
    fitB(tplButton(W.cancel, 27, 21, 8, close, { hot: 0 }), 8 * 8 - 8),
    pic('d9999', 8 + (304 - 268) / 2, 350 + Math.round((42 - 48) / 2), 'New World Computing, Inc.')].forEach(e => e && d.append(e));
  // (the window's own keys while it has the keyboard: Return the default button, the red letters their buttons, Escape its Cancel)
  d.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const bs = [...d.querySelectorAll('.dd-btn')], k = e.key.toLowerCase(), hit = e.key === 'Escape' ? bs[2] : e.key === 'Enter' && !bs.includes(document.activeElement) ? bs[0] : bs.find(b => b.textContent.trim()[0].toLowerCase() === k);
    if (hit) { e.preventDefault(); hit.click(); }
  });
  const inner = a.el('div', { class: 'dd-startscr' }, d), fr = a.el('div', { class: 'dd-startframe' }, inner);
  const fit = () => {
    if (!fr.isConnected) return;
    const vw = window.innerWidth, vh = window.innerHeight, wide = vw >= 640 && vw > vh * 1.05, bz = vw < 900 ? 8 : 14, side = vw < 900 ? 24 + 24 : 96;
    const k0 = wide ? Math.min((vw - side - 420 - 2 * bz) / 320, (vh - 32 - 2 * bz) / 406) : Math.min((vw - 24 - 2 * bz) / 320, (vh * 0.8 - 2 * bz) / 406);
    const k = Math.max(0.4, Math.min(k0, 2)), kk = k >= 1 ? Math.floor(k * 4) / 4 : k;
    ts.classList.toggle('dd-wide', wide); fr.style.setProperty('--du', kk + 'px'); fr.style.padding = bz + 'px';
    doNarrow(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(doNarrow);
  };
  ts.classList.add('dd-wel'); ts.prepend(fr); fit();
  if (!ts._ddFit) { ts._ddFit = true; window.addEventListener('resize', () => { const f = ts.querySelector('.dd-startframe'); if (f && f._fit) f._fit(); }); }
  fr._fit = fit;
}
// Name a Star: NameStarBox (49 x 16 cells, 392 x 224), the window procedure FUN_a000_fa92: its words (cell 1, 1, six lines: the sentence, the rule and the hint, a blank
// line between), picture 3500 painted in item 999 (cell 1, 8, 10 x 5), "New Star Name:" at cell 12, 9, the edit field (item 100, cell 27, 9, 8 wide, at most 7 letters:
// message 0x4c with 7 on opening) and OK at cell 25, 11; no Cancel (OK with the field blank names no star, as its hint says). A taken name brings the program's alert
// 3340 ("Sorry, there's already a star named ...") through FUN_3000_8395; here the alert box with those words.
function nameStarDos(f, o) {
  const a = window.HOAPI, NS = o.NS, wrap = (t, n) => { const out = []; let line = ''; String(t).split(' ').forEach(w => { if (line && (line + ' ' + w).length > n) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }); out.push(line); return out; };
  const decline = f.querySelector('button[type=button]');
  f.addEventListener('submit', (e) => { if (!o.inp.value.trim() && decline) { e.preventDefault(); e.stopImmediatePropagation(); decline.click(); } }, true);
  new MutationObserver(() => { const t = o.err.textContent; if (t) { o.err.textContent = ''; alertDos([t], [{ label: 'OK', def: true, fn: () => o.inp.focus() }]); } }).observe(o.err, { childList: true, characterData: true, subtree: true });
  // (the words fill the item's 45 columns; the template breaks the hint after "click", as a 40-column wrap does)
  const lines = [...wrap(NS.text, 45), '', ...(NS.rule ? [...wrap(NS.rule, 45), ''] : []), ...(NS.hint ? wrap(NS.hint, 40) : [])];
  f.innerHTML = ''; f.className = 'dd'; f.style.width = du(392); f.style.height = du(224);
  o.inp.className = 'dd-field'; o.inp.setAttribute('spellcheck', 'false'); const [fl, ft] = cell(27, 9); dAt(o.inp, fl, ft, 64, 14);
  o.err.style.display = 'none';
  const ok = tplButton(NS.ok || 'OK', 25, 11, 8, null, { hot: 0, def: true }); ok.type = 'submit';
  [...tplText(lines, 1, 1), tplPic('d3500', 1, 8, 10, 5), ...tplText([NS.label || 'New Star Name:'], 12, 9), o.inp, o.err, ok].forEach(k => k && f.append(k));
  setTimeout(() => { placeDos(f.closest('.win'), 392, 224); o.inp.focus(); }, 0);
  return 'dosw';
}
// Window, Reports: the program's report window, 321 x 125, a title bar and the reports, each its picture and its sentence, a scroll bar
function reportsDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), rs = H.rules(g);
  const old = rs.reportHistory ? (p.reportLog || []) : [], ms = old.concat(p.inbox || []);
  const box = dListBox(307, 99, 5, 21); box.classList.add('dd-reports'); box.style.padding = '0';
  if (!ms.length) box.append(a.el('div', { class: 'dd-rep' }, a.el('span', { class: 'cap' }, tx('No reports this turn.'))));
  ms.forEach((m, i) => { const t = a.el('span', { class: 'cap', translate: 'no' }); t.append(a.degText(H.say(g, m.text)));
    box.append(a.el('div', { class: 'dd-rep', 'data-now': i === old.length ? '1' : null, tabindex: 0, role: 'option', onclick: () => { a.closeModal(); a.reportAction(m); } }, a.msgIconEl(m), t)); });
  const d = dDialog(321, 125, 'Reports', [box], 'Reports'); let vs = vScroll(box, 305, 21, 99); d.append(vs);
  // (the program's Reports window has a teal title bar like the main window's, and at its left the control-menu box of three bars: its System Menu, sysMenuDos)
  const tb = d.querySelector('.dd-title');
  if (tb) {
    tb.classList.add('teal');
    sysMenuDos(d, tb, { minW: 160, minH: 70, resize: (w, h) => { box.style.width = du(w - 14); box.style.height = du(h - 26); vs.remove(); vs = vScroll(box, w - 16, 21, h - 26); d.append(vs); tb.style.width = du(w - 10); } });
  }
  const now = box.querySelector('[data-now]'); if (now) box.scrollTop = now.offsetTop - box.offsetTop;
  return true;
}
// The System Menu of a window with a control-menu box (the Reports window; FUN_b000_ea30, its window procedure, sets the menu "System Menu" at 49c5:1362 when the
// window is made: "~Move" (ID_SYSMOVE, 0x46), "~Size" (ID_SYSSIZE, 0x47), a rule, "~Close" (ID_SYSCLOSE, 0x48)). A click on the box opens it (FUN_1000_db96: a press on
// the title row's third column sends the window the key Alt+Space, which opens it; Alt+Space opens it from the keyboard too). The commands (FUN_3000_054d):
// - Move: the pointer goes to the window's top left corner and the window follows it; Size: the same with its bottom right corner. A press on the title bar starts
//   a Move and a press on the bottom right cell a Size as well (FUN_3000_0a6a). The tracking (FUN_3000_03f3) goes by whole screen cells (8 x 14 pixels): the
//   arrow keys move the corner a cell, Return ends it, Escape gives it up (FUN_3000_154f: no position is put back, so the window has not moved while it is
//   tracked: an outline is moved and the window goes there at the end); the corner stays on the 80 x 34-cell screen;
// - Close closes the window (message 8).
// Mouse and touch the same: after Move or Size the outline follows the pointer (or the finger, from where it touches) and the release puts the window there.
// THE REMAKE'S OWN: the menu's look is the menu bar's drop-down (the program's menus: grey, red letters, the green bar), and the smallest size (20 x 5 cells).
function sysMenuDos(d, tb, o) {
  const a = window.HOAPI, win = d.closest('.win'); if (!win) return;
  const sz = { w: o.w || 321, h: o.h || 125 }; sz.x = 8 * Math.floor((80 - Math.round(sz.w / 8)) / 2); sz.y = 14 * Math.floor((34 - Math.round(sz.h / 14)) / 2);
  const put = () => { win.style.transform = `translate(${du(sz.x - (640 - sz.w) / 2)}, ${du(sz.y - (476 - sz.h) / 2)})`; };
  const sb = a.el('button', { type: 'button', class: 'dd-sysbox', 'aria-label': 'System Menu', 'aria-haspopup': 'menu' }); dAt(sb, 8, 0, 14, 17); tb.append(sb);
  let menu = null, track = null;
  const closeMenu = () => { if (menu) { menu.remove(); menu = null; sb.setAttribute('aria-expanded', 'false'); } };
  const openMenu = () => {
    if (menu) { closeMenu(); return; }
    const items = [['Move', 0, () => startTrack('move')], ['Size', 0, () => startTrack('size')], '-', ['Close', 0, () => a.closeModal()]];
    menu = a.el('div', { class: 'dd-sysmenu', role: 'menu', 'aria-label': 'System Menu' });
    items.forEach(it => {
      if (it === '-') { menu.append(a.el('div', { class: 'dd-sysrule', role: 'separator' })); return; }
      const w = tx(it[0]), b = a.el('button', { type: 'button', role: 'menuitem', translate: 'no', onclick: (e) => { e.stopPropagation(); closeMenu(); it[2](); } }, a.el('span', { class: 'mhot' }, w[0]), w.slice(1));
      menu.append(b);
    });
    menu.addEventListener('keydown', (e) => {
      const bs = [...menu.querySelectorAll('button')], i = bs.indexOf(document.activeElement), k = e.key.toLowerCase();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(); sb.focus(); }
      else if (k.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) { const b = bs.find(x => x.textContent.trim()[0].toLowerCase() === k); if (b) { e.preventDefault(); b.click(); } }
    });
    dAt(menu, 13, 22); d.append(menu); sb.setAttribute('aria-expanded', 'true');
    const f = menu.querySelector('button'); if (f) f.focus();
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (menu && !menu.contains(e.target) && e.target !== sb) closeMenu(); if (!menu) document.removeEventListener('pointerdown', off, true); }, true), 0);
  };
  sb.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); });
  // the tracking: an outline in the program's cells, the window put where it ends
  function startTrack(kind, ev) {
    if (track) return;
    const k = () => d.getBoundingClientRect().width / sz.w; // (CSS pixels per program pixel)
    const ol = a.el('div', { class: 'dd-track', 'aria-hidden': 'true' }), t = { kind, x: sz.x, y: sz.y, w: sz.w, h: sz.h, anchor: null, base: null };
    const draw = () => { dAt(ol, t.x - sz.x, t.y - sz.y, t.w, t.h); };
    const cellX = (v) => Math.round(v / 8) * 8, cellY = (v) => Math.round(v / 14) * 14;
    const clamp = () => {
      if (kind === 'move') { t.x = Math.max(0, Math.min(632, t.x)); t.y = Math.max(0, Math.min(462, t.y)); }
      else { t.w = Math.max(o.minW, Math.min(640 - t.x, t.w)); t.h = Math.max(o.minH, Math.min(476 - t.y, t.h)); }
    };
    const at = (cx, cy) => {
      if (!t.anchor) { t.anchor = [cx, cy]; t.base = [t.x, t.y, t.w, t.h]; return; }
      const dx = cellX((cx - t.anchor[0]) / k()), dy = cellY((cy - t.anchor[1]) / k());
      if (kind === 'move') { t.x = t.base[0] + dx; t.y = t.base[1] + dy; } else { t.w = t.base[2] + dx; t.h = t.base[3] + dy; }
      clamp(); draw();
    };
    const end = (ok) => {
      track = null; ol.remove(); layer.remove(); document.removeEventListener('keydown', key, true);
      // (the click that ends it is the window's, not the map's under it)
      const eat = (e) => { e.stopPropagation(); e.preventDefault(); }; window.addEventListener('click', eat, true); setTimeout(() => window.removeEventListener('click', eat, true), 0);
      if (!ok) return;
      if (kind === 'size' && (t.w !== sz.w || t.h !== sz.h)) { sz.w = t.w; sz.h = t.h; d.style.width = du(sz.w); d.style.height = du(sz.h); o.resize(sz.w, sz.h); }
      sz.x = t.x; sz.y = t.y; put();
    };
    const key = (e) => {
      const step = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] }[e.key];
      if (step) { e.preventDefault(); e.stopPropagation(); if (kind === 'move') { t.x += step[0]; t.y += step[1]; } else { t.w += step[0]; t.h += step[1]; } t.anchor = null; clamp(); draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); end(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(false); }
    };
    // (a layer over the page takes the pointer while the window is tracked: a mouse moves the outline as it moves and a click puts the window there; a finger drags it)
    const layer = a.el('div', { class: 'dd-tracklayer', 'aria-hidden': 'true' });
    layer.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!t.anchor || e.pointerType !== 'mouse') { t.anchor = null; at(e.clientX, e.clientY); } try { layer.setPointerCapture(e.pointerId); } catch (x) {} t.down = true; });
    layer.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || t.down) at(e.clientX, e.clientY); });
    layer.addEventListener('pointerup', (e) => { if (t.down || e.pointerType === 'mouse') { at(e.clientX, e.clientY); end(true); } });
    track = t; draw(); d.append(ol); document.body.append(layer); document.addEventListener('keydown', key, true);
    if (ev) { t.anchor = null; at(ev.clientX, ev.clientY); t.down = true; try { layer.setPointerCapture(ev.pointerId); } catch (x) {} }
  }
  // a press on the title bar moves the window, on the bottom right cell sizes it (FUN_3000_0a6a)
  tb.addEventListener('pointerdown', (e) => { if (e.button || e.target === sb) return; e.preventDefault(); startTrack('move', e); });
  tb.addEventListener('click', () => {}); // (a listener the browser counts, so a finger near the title bar is taken as the title bar's and not moved onto the list below)
  const grip = a.el('div', { class: 'dd-grip', 'aria-hidden': 'true' }); d.append(grip);
  const placeGrip = () => dAt(grip, sz.w - 8, sz.h - 14, 8, 14); placeGrip();
  const r0 = o.resize; o.resize = (w, h) => { r0(w, h); placeGrip(); };
  grip.addEventListener('pointerdown', (e) => { if (e.button) return; e.preventDefault(); startTrack('size', e); }); grip.addEventListener('click', () => {});
  d.addEventListener('keydown', (e) => { if (e.altKey && (e.key === ' ' || e.code === 'Space')) { e.preventDefault(); openMenu(); } });
  put();
}

// The Game Info window (DOS GameInfoDlgBox, FUN_b000_562b; Windows template 13 GAMEINFO, GAMEINFODLGPROC 1108:1dda), opened in both programs by the Player Entry
// window's Info... button. Both build the sentence the same way (read in the code): the galaxy's size, density and style (string ids 0x415, 0x40b, 0x40d plus the
// game's own), "%d %s" of the computer players' count and intelligence (0x412 plus), or "no", then " computer player" and "s" unless there is one, "human" and "s"
// unless there is one; DOS writes it "This game contains a\n%s, %s, %s\ngalaxy with %d %s and\n%s.\n\nThe current year is %d.", Windows "This is a %s, %s, %s galaxy
// with %d %s and %s.\n\nThe current year is %d." (the static wraps it). Then the human players' names in a list. THE REMAKE'S OWN: the remake has no Player Entry
// window, so Game Info opens from the Window menu (its last item); a double click on a name, which in the programs fills in Player Entry's name, does nothing.
const SIZEW = { small: 'Small', medium: 'Medium', large: 'Large', xl: 'Extra Large', huge: 'Humongous' }, DENSW = { dense: 'Dense', sparse: 'Sparse', normal: 'Dense' },
  SHAPEW = { circle: 'Circle', random: 'Random', ring: 'Ring', spiral: 'Spiral', grid: 'Grid' }, IQW = { dumb: 'Dumb', average: 'Average', smart: 'Smart' };
function gameInfo(win) {
  const a = window.HOAPI, g = a.G, o = g.opts || {}, hum = g.players.filter(p => p.human), comp = g.players.filter(p => !p.human), nc = comp.length, nh = hum.length;
  const iq = IQW[o.iq] || IQW[(comp[0] || {}).iq] || 'Average';
  const cw = nc === 0 ? tx('no computer players') : a.tl(nc === 1 ? '%d %s computer player' : '%d %s computer players', nc, tx(iq));
  const hw = tx(nh === 1 ? 'human' : 'humans');
  const t = a.tl(win ? 'This is a %s, %s, %s galaxy with %d %s and %s.\n\nThe current year is %d.' : 'This game contains a\n%s, %s, %s\ngalaxy with %d %s and\n%s.\n\nThe current year is %d.',
    tx(SIZEW[o.size] || 'Medium'), tx(DENSW[o.density] || 'Dense'), tx(SHAPEW[o.shape] || 'Random'), nh, hw, cw, g.year);
  return { text: t, names: hum.map(p => p.name) };
}
// DOS: GameInfoDlgBox, 51 x 24 cells (408 x 336): the picture 3520 at cell 1, 1 (painted at its corner), the words at 1, 10, "Human Players:" at 28, 1, the list at 29, 3
// (18 x 15 cells), OK at 11, 18 (the template's cells; no capture of the DOS window)
function gameInfoDos() {
  const a = window.HOAPI; if (!a.G) return false;
  const I = gameInfo(false), [lx, ly] = cell(29, 3), box = dListBox(8 * 18, 14 * 15, lx, ly); box.setAttribute('aria-label', tx('Human Players:'));
  I.names.forEach(n => box.append(a.el('div', { class: 'dd-row', role: 'option', translate: 'no' }, n)));
  dDialog(408, 336, null, [tplPic('d3520', 1, 1), ...tplText(I.text.split('\n'), 1, 10), ...tplText([tx('Human Players:')], 28, 1), box, tplButton('OK', 11, 18, 5, () => a.closeModal(), { hot: 0, def: true })], tx('GameInfo'));
  return true;
}

// Ships, Organize Ships: 457 x 323 (the program's Organize Fleets window: the fleets of one design at the star as piles; click a pile, then another to move a ship, Shift-click moves the whole pile)
function organizeDos(sid) {
  const a = window.HOAPI, H = window.HO, g = a.G, f0 = (a.curFleet && a.curFleet()) || g.fleets.find(f => f.owner === a.ME && f.star === sid && f.to == null && !f.sat);
  if (!f0 || f0.star !== sid || Object.keys(f0.ships).length !== 1) return false;
  const did = +Object.keys(f0.ships)[0], d = H.getDesign(g, a.ME, did);
  const fleets = g.fleets.filter(f => f.owner === a.ME && f.star === sid && f.to == null && Object.keys(f.ships).length === 1 && +Object.keys(f.ships)[0] === did);
  const piles = fleets.map(f => ({ f, n: f.ships[did] })); let sel = null;
  const box = dListBox(416, 195, 20, 64); box.classList.add('dd-piles'); box.style.padding = '0';
  const moveTo = (i) => { if (!sel) return; const from = piles[sel.pile], n = sel.all ? from.n : 1; if (i === -1) { piles.push({ f: null, n: 0 }); i = piles.length - 1; } if (i === sel.pile) { sel = null; show(); return; } from.n -= n; piles[i].n += n; sel = null; show(); };
  function show() {
    box.textContent = '';
    piles.forEach((p, i) => { if (!p.n && !p.f) return;
      const row = a.el('div', { class: 'dd-pile' + (sel && sel.pile === i ? ' sel' : ''), role: 'option', tabindex: 0, draggable: p.n ? 'true' : null, onclick: (e) => { if (sel && sel.pile !== i) { moveTo(i); return; } if (p.n) { sel = { pile: i, all: e.shiftKey }; show(); } },
        ondragstart: (e) => { sel = { pile: i, all: e.shiftKey }; try { e.dataTransfer.setData('text/plain', 'ship'); } catch (x) {} }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); moveTo(i); } },
        a.el('span', { class: 'n', translate: 'no' }, p.n ? String(p.n) : ''), p.n ? shipPicEl(d, 40) : a.el('span'));
      box.append(row); });
    box.append(a.el('div', { class: 'dd-pile new', 'aria-label': 'New pile', onclick: () => { if (sel) moveTo(-1); }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); moveTo(-1); } }));
  }
  const apply = () => {
    const temps = [];
    for (const p of piles) if (p.f && p.n < p.f.ships[did]) { if (p.n === 0) temps.push(p.f); else { const t = H.splitFleet(g, p.f, { [did]: p.f.ships[did] - p.n }); if (t) temps.push(t); } }
    const take = (need) => { let got = null; while (need > 0 && temps.length) { let t = temps[0]; if (t.ships[did] > need) t = H.splitFleet(g, t, { [did]: need }); else temps.shift(); need -= t.ships[did]; if (got) H.mergeFleets(g, got, t); else got = t; } return got; };
    for (const p of piles) if (p.f && p.n > (p.f.ships[did] || 0)) { const t = take(p.n - p.f.ships[did]); if (t) H.mergeFleets(g, p.f, t); }
    for (const p of piles) if (!p.f && p.n > 0) take(p.n);
    a.closeModal(); a.save(); a.renderPanel(); a.draw();
  };
  const grp = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; show(); };
  const dvd = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach(p => { p.n = 0; }); for (let k = 0; k < t; k++) { if (k < piles.length) piles[k].n = 1; else piles.push({ f: null, n: 1 }); } sel = null; show(); };
  dDialog(457, 323, null, [dText(tx('To Organize Fleets:'), 24, 14), dText('♦ ' + tx('Click and drag fleets into desired number of piles'), 24, 28), dText('♦ ' + tx('Shift-Click selects an entire pile'), 24, 42), box,
    dButton('Group All', 33, 281, 94, 25, grp, { hot: 0 }), dButton('Divide All', 145, 281, 102, 25, dvd, { hot: 0 }), dButton('Cancel', 272, 281, 71, 25, () => a.closeModal(), { hot: 0 }), dButton('OK', 361, 281, 70, 25, apply, { hot: 0 })], 'Organize Fleets');
  show(); return true;
}

// Galaxy, Send Message: 417 x 337 (the program's four-step window: who, saying what, about what, which one; the left list holds what is chosen, the right the choices)
function dCells(l, t, w, h, cols, cw, chh) {
  const a = window.HOAPI, box = a.el('div', { class: 'dd-list dd-cells', role: 'listbox' }); box.style.padding = '0'; dAt(box, l, t, w, h);
  return { el: box, set(cells) {
    box.textContent = '';
    cells.forEach((c, i) => { const d = dAt(a.el('div', { class: 'dd-cell2' + (c.icon ? ' has' : '') + (c.off ? ' off' : ''), role: 'option', tabindex: c.off ? -1 : 0 }), (i % cols) * cw + 2, Math.floor(i / cols) * chh + 3, cw - 2, chh - 3);
      const im = c.icon && a.IMG[c.icon]; if (im) d.append(dAt(a.el('img', { src: im.src, alt: '' }), (cw - 2 - 32) / 2, 4, 32, 32));
      d.append(dAt(a.el('span', { class: 'cap', translate: 'no' }, c.name || ''), 0, c.icon ? 36 : 38, cw - 2, c.icon ? 22 : 14)); if (c.pick) { d.addEventListener('click', c.pick); d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.pick(); } }); } box.append(d); });
  } };
}
function chatDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, ME = a.ME, C = H.rules(g).cannedChat; if (!C) return false;
  const tos = C.to(g, ME), ok = tos.filter(o => !o[2]);
  if (!ok.length) { a.toast(H.say(g, H.DATA.alerts[6] || 'There is no one else to send something to.')); return true; }
  const PR = ['Send Message To Who?', 'Saying What?', 'About What?', 'Which One?'];
  const hat = (q) => 'dos:i' + (q.id === ME ? (q.female ? 1500 : 1000) : (q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const pl = (id) => g.players[+id];
  let step = 0; const ch = [null, null, null, null];
  const prompt = dText(tx(PR[0]), 151, 14);
  const left = dCells(75, 35, 58, 238, 1, 58, 59), right = dCells(148, 35, 248, 238, 5, 50, 59);
  const send = dButton('Send', 288, 294, 71, 27, () => {
    const r = H.sendCanned(g, ME, C.make(g, ME, isNaN(+ch[0].id) ? ch[0].id : +ch[0].id, ch[1].i, [ch[2].i, isNaN(+ch[3].id) ? ch[3].id : +ch[3].id]));
    if (r === 'limit') { a.chatLimitToast(); return; } if (r !== 'ok') return; a.Sound.play(5000); a.closeModal(); a.save();
  }, { hot: 0 });
  const choices = () => {
    if (step === 0) return tos.map(o => ({ id: String(o[0]), name: o[1], icon: pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
    if (step === 1) return C.actions.map((x, i) => ({ id: i, i, name: x.label, icon: 'dos:i' + (3000 + i) }));
    if (step === 2) return C.actions[ch[1].i].parts[0][2].map((o, i) => ({ id: i, i, name: o[0], icon: 'dos:i' + (3010 + i), kind: o[1] }));
    const kind = ch[2].kind; return C.list(g, ME, kind, a.UI.sel).map(o => ({ id: String(o[0]), name: o[1], icon: kind === 'players' && pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
  };
  const refresh = () => {
    prompt.textContent = tx(PR[Math.min(step, 3)]);
    left.set(ch.map((c, i) => c ? { name: c.name, icon: c.icon, pick: () => { for (let k = i; k < 4; k++) ch[k] = null; step = i; refresh(); } } : { name: '' }));
    right.set(step > 3 ? [] : choices().map(c => Object.assign(c, { pick: c.off ? null : () => { ch[step] = { id: c.id, i: c.i, name: c.name, icon: c.icon, kind: c.kind }; step = ch[1] && ch[1].i === 2 && step === 1 ? 2 : step + 1; refresh(); } })));
    send.disabled = !(step > 3); send.classList.toggle('off', send.disabled);
  };
  dDialog(417, 337, null, [dText(tx('Send Message:'), 7, 14), prompt, dText(tx('To:'), 49, 41), dText(tx('Content:'), 7, 97), left.el, right.el, dButton('Cancel', 184, 294, 71, 27, () => a.closeModal(), { hot: 0 }), send], 'Send Message');
  refresh(); return true;
}
// enemy faces: the Mac skin's 16 hats become the DOS game's planet faces
function faces() {
  const o = {};
  for (let n = 0; n < 16; n++) { o['bad' + n + '_0'] = 'i' + (2000 + n); o['bad' + n + '_1'] = 'i' + (2500 + n); }
  return o;
}
// a skin built on this one (js/skins/amiga, mac3) changes what it needs; its
// hooks can call this skin's own as HOTHEME.base
window.HOTHEME = Object.assign({ base: window.HOTHEME }, window.HOTHEME, window.HOTHEME_OVER || {});
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/win31/hook.js' + (window.HO_BUILD || '') + '"><\/script>'); // the win31 look's own dialogs (js/skins/dos/win31/hook.js)
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
})();
