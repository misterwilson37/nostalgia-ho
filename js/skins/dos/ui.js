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
    if (/^Spaceward Ho! (Version [\d.]+ )?by/.test(t)) return R('i3115', null); // 1.2 says "Version 1.2 by"
    if (/^Click here/.test(t)) return R('i3116', null);
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
  panel(panel, B) { panelDos(panel, B); },
  mapPixel() { return frameOn() ? [U, U] : null; },
  battleWindow(b, k) { battleDos(b, k); },
  mapInset() { return frameOn() ? [8 * U, 14 * U] : [0, 0] ; },
  modernPan() { return frameOn(); },
  planetPx(s) { return frameOn() ? Math.round(s * 12 / 17) : Math.max(18, Math.min(52, s * 0.9)); }, // (measured: a star's ball is about 24 pixels at the zoom of 17 and 15 at 12)
  zoomTo(s, f) { return frameOn() ? dzoomTo(s, f) : Math.max(12, Math.min(140, s * f)); },
  syncView(v, c) { dSync(v, c); },
  centerOnStar(v, sid, c) { return dCenterOn(v, sid, c); },
  fitView(v, c) { dMapFit(v, c); },
  afterDraw() { dBars(); },
  mapBg: document.documentElement.classList.contains('os-dos') ? '#000' : undefined, // (the program's map is plain black)
  bgStars: document.documentElement.classList.contains('os-dos') ? false : undefined,
  mapFont(n) { return frameOn() ? "12px 'DOS Geneva 9'" : null; },
  alertBox(paras) { return frameOn() ? alertDos(paras, [{ label: 'OK', def: true }]) : null; },
  youWonLayout(kind, Y, done) { return frameOn() ? youWonDos(kind, Y, done) : false; },
  nameStarLayout(f, o) { return frameOn() ? nameStarDos(f, o) : false; },
  confirm(text, yes, labels) { return frameOn() ? !!alertDos([typeof text === 'string' ? text : (text.textContent || '')], [{ label: labels ? labels[0] : 'OK', def: true, fn: yes }, { label: labels ? labels[1] : 'Cancel' }]) : false; },
  alert(kind, text, yes) { return frameOn() ? !!alertDos([typeof text === 'string' ? text : (text.textContent || '')], [{ label: 'OK', def: true, fn: yes }, { label: 'Cancel' }]) : false; },
  window(name) { if (!frameOn() || !window.HOAPI.G) return false; if (name === 'autoplay') return autoPlayDos(); if (name === 'fleets') return fleetsDos(); if (name === 'types') return shipTypesDos(arguments[1]); if (name === 'build') return buildDos(arguments[1]); if (name === 'stars') return starsDos(); if (name === 'compare') return compareDos(); if (name === 'reports') return reportsDos(); if (name === 'group') return organizeDos(arguments[1]); if (name === 'chat') return chatDos(); return false; },
  newGame(f) { createGalaxyDos(f); },
  keyName(k) { return '[' + k + ']'; },
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
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'With the art and sounds of Spaceward Ho! 2.0 for DOS (New World Computing, 1993). DOS programming by Ed Murphy.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 2.0';
    frameSetup(doc.documentElement);
  },
};

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
      it('Set Polling Time…', () => {}, { ghost: off }),
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
      it(() => (orgGhost() ? A().tl('No ships to organize…') : A().tl('Organize Ships…')), () => { const f = A().curFleet && A().curFleet(); if (f && f.star != null) organizeDos(f.star); }, { ghost: orgGhost, key: 'Ctrl+O' }),
      it(() => (mine() ? A().tl('Build Ships at %s…', star().name) : A().tl('Can’t Build Ships Here…')), () => { if (mine()) A().openBuild(star().id); }, { ghost: () => noGame() || !mine(), key: 'Ctrl+B' }),
      ['Scrap Current Fleet', 'Ships/#3'], '-',
      // (captured: "Review Battle at <star>…" [Ctrl+R] shows the selected star's last battle; "No Battles here…" is dimmed)
      it(() => { const bs = !noGame() && star() ? A().lastBattles(star().id) : []; return bs.length ? A().tl('Review Battle at %s…', star().name) : A().tl('No Battles here…'); }, () => { const bs = star() ? A().lastBattles(star().id) : []; if (bs.length) A().openBattle(bs[0].id); }, { ghost: () => noGame() || !star() || !A().lastBattles(star().id).length, key: 'Ctrl+R' })],
    Galaxy: [
      it('Compare Players…', () => A().openCompare(), { shown: () => !!G() && !!rs().compare, key: 'Ctrl+Y' }), ['List All Explored Stars…', 'Galaxy/List explored stars…'], ['Send Message…', 'Galaxy/Send a message…'], '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoomD(3), key: '+' }), it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || atZoomD(0), key: '-' }), '-',
      it('Fix Spending', () => A().openFixSpending(), { shown: () => !!G() && !!rs().fixSpending, ghost: noGame, key: 'Ctrl+F' })],
    Window: [it('Tech Spending', () => {}, { checked: () => true, key: 'Alt+1' }), ['Reports', 'Galaxy/Report window…']] // (the program's Window menu: Tech Spending, checked while its window shows; the remake's panel always shows it)
  };
  if (win === 'win31') M.Help = [['How to play', 'Help/How to play']];
  return M;
}

// The program reds the hot letter of every enabled menu item, as of the menus (the pool's "~Scrap Current Fleet" marks it; read off the captured menus
// v20dos-orig-menu-*.png and v20dos-orig-alert-force.png; a ghosted item shows none). The German program's strings carry no "~", so only the English words are marked.
const MENU_HOT = { 'About Ho!…': 0, 'New Game…': 0, 'Open Game…': 0, 'Close': 0, 'End Turn': 0, 'Exit': 1,
  'Force Turn Update': 0, 'Auto Play…': 0, 'I’ll Update Turns': 0, 'Set Polling Time…': 4, 'Set Battle Speed…': 4, 'Show Event Messages': 5, 'Review Announced Battles': 0, 'Give Overspending Warnings': 0, 'Sound': 0,
  'List Ship Types…': 0, 'Create New Ship Type…': 7, 'List All Fleets…': 9, 'Organize Ships…': 0, 'Scrap Current Fleet': 0,
  'Compare Players…': 0, 'List All Explored Stars…': 0, 'Send Message…': 5, 'Zoom In': 5, 'Zoom Out': 5, 'Fix Spending': 0, 'Reports': 0, 'Tech Spending': 0 };
function hotMenus() {
  const mark = (dd) => dd.querySelectorAll('button[role=menuitem]').forEach(b => {
    if (b.dataset.hot || b.disabled || !frameOn()) return;
    const n = b.firstChild; if (!n || n.nodeType !== 3) return;
    const t = n.nodeValue; let i = MENU_HOT[t];
    if (i == null && /^(Build Ships at|Review Battle at) /.test(t)) i = 0;
    if (i == null || i >= t.length) return;
    b.dataset.hot = '1'; const sp = document.createElement('span'); sp.className = 'mhot'; sp.textContent = t[i];
    const w = document.createElement('span'); w.setAttribute('translate', 'no'); w.append(t.slice(0, i), sp, t.slice(i + 1)); n.replaceWith(w);
  });
  new MutationObserver(() => document.querySelectorAll('.dropdown.open').forEach(mark)).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
}
// The key equivalents the menus show ("[Ctrl+K]"): the keys the browser lets a page have. Ctrl+W, Ctrl+T and Ctrl+N belong to the browser (kept difference); the first letter T
// of the classic skin ends the turn.
function dosKeys() {
  document.addEventListener('keydown', (e) => {
    const a = window.HOAPI; if (!frameOn() || !a || !a.G || document.querySelector('.scrim') || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    let k = null;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.length === 1) k = 'Ctrl+' + e.key.toUpperCase();
    else if (e.altKey && !e.ctrlKey && /^[12]$/.test(e.key)) k = 'Alt+' + e.key;
    else if (!e.ctrlKey && !e.altKey && !e.metaKey && (e.key === '+' || e.key === '-' || e.key === '=')) k = e.key === '=' ? '+' : e.key;
    if (!k) return;
    const M = menuLayoutDos();
    for (const m in M) for (const it of M[m]) if (it[5] === k) { if (typeof it[1] !== 'function' || (it[2] && !it[2]()) || (it[4] && it[4]())) return; e.preventDefault(); it[1](); return; }
  });
}
// F10, the program's boss key (FUN_9000_7450, which its event loop FUN_2000_fd17 calls on the key code 0x10c4, at any time, over any window): the screen goes to
// text mode and shows a DOS prompt, "C:\>" in grey at its top left, until a key is pressed, then the program sets its graphics mode again and redraws its screen
// (captured over the licence window: v20dos-orig-bosskey.png). Here a black page with the prompt in the screen font; a key or a click brings the page back.
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
// ======== Review Battle: the program's battle window (Windows template 7, "Skip"; measured on the summary of a battle reviewed in DOSBox) ========
// 456 x 364 with the program's frame (the interior black with 35 white stars): the two sides' faces (a red-brown cross over a side with nothing left), the viewer's group
// pictures with a line of words under each (the Geneva 9, a lost group dimmed in a stipple), the title and the result in Geneva 9 Bold, the picture of the winner
// (d3500) or the loser (d3510), "Round n" and the button, which says Skip while the shots are fired and OK after. What was measured is one group a side; the pitch
// of further rows (53), the shots (as the Mac 1.2 program's DrawLaserBlast, 17 x 17 hits) and the other side's name being left out for the viewer are taken from the
// Mac 1.2 window (js/skins/mac12) and are not measured on DOS.
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
  const W = 446, Hh = 354, FACE = [[28, 21], [302, 21]], SHIP = [[47, 57], [308, 56]], CAPC = [87.5, 362.5], PIT = 53;
  const c = el('canvas', { class: 'dd-pic', 'aria-label': 'Summary of battle', role: 'img' }); const dpr = window.devicePixelRatio || 1;
  c.width = Math.round(W * U * dpr * 1); c.height = Math.round(Hh * U * dpr); dAt(c, 5, 5, W, Hh);
  const x = c.getContext('2d'); x.setTransform(U * dpr, 0, 0, U * dpr, 0, 0); x.imageSmoothingEnabled = false; x.textBaseline = 'alphabetic';
  let stop = false, skip = false, done = false;
  const btn = dButton('Skip', 202, 310, 52, 24, () => { if (done) a.closeModal(); else skip = true; }, { hot: -1 });
  const d = dDialog(456, 364, null, [c, btn], 'Summary of battle'); d.classList.add('dd-black'); // (placed as every window, by placeDos: 88 from the screen's left, 4 left of its middle)
  const prevClose = () => { stop = true; };
  const mo = new MutationObserver(() => { if (!d.isConnected) { stop = true; mo.disconnect(); } }); mo.observe(document.body, { childList: true });
  const pat = (col) => { const p = document.createElement('canvas'); p.width = p.height = 2; const q = p.getContext('2d'); q.fillStyle = col; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); return x.createPattern(p, 'repeat'); };
  const grayPat = pat('#000'), whiteGray = pat('#fff');
  const text = (t, h, v, bold, center) => { x.font = bold ? F9B : F9; x.fillStyle = '#fff'; x.textAlign = center ? 'center' : 'left'; x.fillText(t, h, v); };
  let seed = (b.id | 0) * 7919 + 13; const rnd = (lo, hi) => { seed = (seed * 16807) % 2147483647; return lo + (seed % (hi - lo + 1)); };
  const stars = Array.from({ length: 35 }, () => [rnd(5, 440), rnd(5, 348)]);
  const drawStars = () => { x.fillStyle = '#fff'; for (const [h, v] of stars) x.fillRect(h, v, 1, 1); };
  const face = (o, ci) => {
    const p = g.players[o]; if (!p) return;
    const id = o === ME ? (p.female ? 1500 : 1000) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20), im = pic('i' + id);
    if (im) x.drawImage(im, FACE[ci][0], FACE[ci][1], 32, 32);
    if (o !== ME) text(p.name || '', FACE[ci][0] + 38 + (ci ? 0 : 0), FACE[ci][1] + 29, true);
  };
  const groupWords = (gr) => { if (gr.planet) return P0.planetWords(pop); const u = b.start[gr.units[0]], dd = H.getDesign(g, u.o, u.did) || { type: u.t, name: '', W: 1, S: 1 }; return P0.shipWords(dd, gr.units.filter(i => alive[i]).length, gr.units.length, u.o === ME); };
  const drawGroup = (gr) => {
    const [sx0, sy0] = SHIP[gr.ci], gy = sy0 + PIT * gr.row;
    x.fillStyle = '#000'; x.fillRect(sx0 - 40, gy - 2, 200, PIT - 2);
    let im = null, w = 97, h = 35;
    if (gr.planet) { im = null; } else { const u = b.start[gr.units[0]], dd = H.getDesign(g, u.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 }; im = a.shipPic(dd, u.o); }
    if (im) { w = Math.round(im.width * 35 / im.height); x.drawImage(im, sx0, gy, w, 35); }
    const n = gr.units.filter(i => alive[i]).length;
    if (!gr.planet) {
      let f = 0, q = -1; for (const i of gr.units) { const hh = hurt[i]; if (hh && hh.n > q && alive[i]) { q = hh.n; f = hh.f; } }
      let l = sx0, r = sx0 + w; if (n > 0) r = Math.min(sx0 + w, sx0 + Math.trunc(w * Math.max(0, Math.min(1, f))));
      if (r > l) { x.fillStyle = grayPat; x.fillRect(l, gy, r - l, 35); }
    }
    text(groupWords(gr), CAPC[gr.ci], gy + 47, false, true); drawStars();
  };
  const paintHead = () => { x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh); drawStars(); text(P0.head[0], 219, 34, true, true); text(P0.head[1], 219, 50, true, true); [0, 1].forEach(ci => { if (owners[ci] != null) face(owners[ci], ci); }); };
  const roundLabel = (n) => { x.fillStyle = '#000'; x.fillRect(190, 266, 80, 18); text(tx('Round %d').replace('%d', n), 198, 280, true); };
  paintHead();
  [0, 1].forEach(ci => { if (hidden[ci]) { const L = rs.battleLines || {}; text(L.noInfo || '', 150, 100, true); text(L.destroyed || '', 150, 116, true); skip = true; } else cols[ci].forEach(drawGroup); });
  const wait = (until) => new Promise(res => { const f = () => (stop || skip || performance.now() >= until ? res() : setTimeout(f, Math.min(TICK, until - performance.now()))); f(); });
  const cellOf = (ev, shooter) => shooter ? (ev.si >= 0 ? where.get(ev.si) : planetAt[ev.a]) : (ev.p ? planetAt[b.planetOwner] : where.get(ev.ti));
  async function laser(s, t) {
    let x1 = SHIP[s.ci][0], y1 = SHIP[s.ci][1] + PIT * s.row + 18, x2 = SHIP[t.ci][0], y2 = SHIP[t.ci][1] + PIT * t.row + 18;
    if (x2 > x1) { x1 += 121; x2 -= 1; } else { x2 += 121; x1 -= 1; }
    const dx = Math.trunc((x2 - x1) / 5), dy = Math.trunc((y2 - y1) / 5);
    const seg = (h0, v0, h1, v1, col) => { x.strokeStyle = col; x.lineWidth = 1; x.beginPath(); for (const o of [0, 1, -1, 2, -2]) { x.moveTo(h0 + 0.5, v0 + o + 0.5); x.lineTo(h1 + 0.5, v1 + o + 0.5); } x.stroke(); };
    let h = x1, v = y1, ph = -1, pv = -1;
    for (let i = 0; i < 5 && !stop && !skip; i++) { const t0 = performance.now(); seg(h, v, h + dx, v + dy, '#fff'); if (ph !== -1) seg(ph, pv, h, v, '#000'); ph = h; pv = v; h += dx; v += dy; await wait(t0 + TICK); }
    seg(ph, pv, h, v, '#000');
  }
  async function explosion(t, ev) {
    const dm = ev.dm | 0, im = pic('s' + (12000 + (dm % 3)));
    if (ev.snd !== 3003) { if (im) x.drawImage(im, SHIP[t.ci][0] + (dm % 103), SHIP[t.ci][1] + PIT * t.row + (dm % 23), 17, 17); }
  }
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
const dzIdx = (s) => { let b = 0; DZ.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(DZ[b] / s))) b = i; }); return b; };
function dzoomTo(s, f) { const cur = dzIdx(s); let i = dzIdx(s * f); if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1); return DZ[Math.max(0, Math.min(DZ.length - 1, i))]; }
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
  v.s = DZ[dzIdx(v.s)]; dMetrics(v.s, c.mapW, c.mapH, c.G);
  let [H, V] = dCellOf(v);
  if (DB.s && DB.s !== v.s && c.sel != null && c.G.stars[c.sel]) [H, V] = dCenter(c.G.stars[c.sel], c.G); // (Zoom In / Zoom Out: the selected star is centred)
  else if (!c.live) { H = Math.round(H); V = Math.round(V); }
  [H, V] = dClamp(H, V); dPut(v, H, V); DB.H = H; DB.V = V; DB.s = v.s;
}
function dCenterOn(v, sid, c) {
  if (!frameOn()) return false; const st = c.G.stars[sid]; if (!st) return false;
  v.s = DZ[dzIdx(v.s)]; dMetrics(v.s, c.mapW, c.mapH, c.G);
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
const dVals = (b) => (b.vertical ? { value: DB.V, max: DB.maxV, page: DB.pgV } : { value: DB.H, max: DB.maxH, page: DB.pgH });
const dActive = (b) => dVals(b).max > 0 && !document.querySelector('.scrim');
function dSetCells(H, V) { const a = window.HOAPI, v = a.UI.view; if (!v) return; const [h2, v2] = dClamp(H, V); dPut(v, h2, v2); a.draw(); }
function dScrollBy(b, d) { const cur = Math.round(b.vertical ? DB.V : DB.H), nv = Math.max(0, Math.min(dVals(b).max, cur + d)); if (nv === cur) return false; if (b.vertical) dSetCells(DB.H, nv); else dSetCells(nv, DB.V); return true; }
function dPart(b, p) {
  const { value, max } = dVals(b), L = b.L, e = b.vertical ? 14 : 8, th = b.vertical ? 13 : 7;
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
    const p = pos(e), part = dPart(b, p), { value, max } = dVals(b), e0 = b.vertical ? 14 : 8, th = b.vertical ? 13 : 7;
    if (part === 'thumb') { DB.drag = { b, p0: p, t0: e0 + (b.L - 2 * e0 - th) * value / max, id: e.pointerId }; return; }
    const st = { b, part, id: e.pointerId, p, timer: 0 }; DB.press = st;
    const tick = () => { if (DB.press !== st) return; if (dPart(b, st.p) === part) { const g = dVals(b); dScrollBy(b, part === 'lo' ? -1 : part === 'hi' ? 1 : part === 'pagelo' ? -g.page : g.page); } dBars(); st.timer = setTimeout(tick, 100); };
    tick();
  });
  el.addEventListener('pointermove', (e) => {
    if (DB.press && DB.press.b === b && DB.press.id === e.pointerId) { DB.press.p = pos(e); dBars(); }
    else if (DB.drag && DB.drag.b === b && DB.drag.id === e.pointerId) { // (the thumb: the map follows it a cell at a time)
      const g = DB.drag, e0 = b.vertical ? 14 : 8, T = b.L - 2 * e0 - (b.vertical ? 13 : 7), t = Math.max(e0, Math.min(e0 + T, g.t0 + pos(e) - g.p0)), max = dVals(b).max;
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
  if (DB.wrap && DB.wrap.isConnected) return true;
  const a = window.HOAPI, host = document.getElementById('mapwrap'); if (!a || !host) return false;
  const mk = (vertical) => {
    const L = vertical ? 433 : 391, q = dq(vertical ? 7 : L, vertical ? L : 13, vertical ? 'Vertical scroll bar' : 'Horizontal scroll bar'), el = a.el('div', { class: 'dosbar ' + (vertical ? 'v' : 'h'), role: 'scrollbar', tabindex: 0, 'aria-orientation': vertical ? 'vertical' : 'horizontal', 'aria-controls': 'map', 'aria-label': vertical ? 'Map, up and down' : 'Map, left and right' }, q.c);
    q.c.removeAttribute('role'); q.c.setAttribute('aria-hidden', 'true'); return { vertical, q, el, L, key: '' };
  };
  DB.v = mk(true); DB.h = mk(false); host.append(DB.v.el, DB.h.el); DB.wrap = host; [DB.v, DB.h].forEach(dWire); return true;
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
// (T.mapPixel, as the Amiga skin does). Only under the "DOS" OS look (html.os-dos): the Windows look keeps the classic page.
let U = 1;
const frameOn = () => document.documentElement.classList.contains('os-dos');
function setUnit() {
  const de = document.documentElement, u0 = Math.min(window.innerWidth / 640, window.innerHeight / 476);
  U = u0 >= 1 ? Math.floor(u0 * 2) / 2 : Math.max(0.4, u0);
  de.style.setProperty('--u', String(U));
}
const F9 = "12px 'DOS Geneva 9'", F9B = "12px 'DOS Geneva 9 Bold'", C12 = "15px 'DOS Chicago 12'";
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
  c.style.width = `calc(${w} * var(--u))`; c.style.height = `calc(${h} * var(--u))`;
  const x = c.getContext('2d'); x.setTransform(U * dpr, 0, 0, U * dpr, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
  x.textBaseline = 'alphabetic'; x.imageSmoothingEnabled = false;
  const api = {
    c, x, w, h,
    // y: the baseline; o.right / o.center: the text ends / is centred at that x
    text(t, px, y, font, o) {
      o = o || {}; c.dataset.t = (c.dataset.t ? c.dataset.t + '\n' : '') + t;
      x.font = font || F9; x.fillStyle = o.color || '#000'; x.textAlign = o.right != null ? 'right' : o.center != null ? 'center' : 'left';
      x.fillText(t, o.right != null ? o.right : o.center != null ? o.center : px, y);
    },
    width(t, font) { x.font = font || F9; return x.measureText(t).width; },
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
  if (kind === 2) for (let v = 100; v <= 1000; v += 100) q.hline(x0 - 2, x0, d5 - toPix(v)); else for (let i = 1; i <= 10; i++) q.hline(x0 - 2, x0, d5 - Math.trunc(50 * i / 10));
  let d4 = x0;
  vals.forEach((v, i) => {
    q.hline(d4, d4 + GP + BW, d5 + 1); d4 += GP;
    const hpx = v <= 0 ? 0 : kind === 2 ? toPix(v) : Math.trunc(50 * v / 1000);
    q.rect(d4, d5 - hpx, d4 + BW, d5, colors[i % colors.length]);
    q.text(names[i], d4 + Math.trunc((BW - q.width(names[i])) / 2), d5 + 11 + (kind === 2 ? 8 * (i % 2) : 0));
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
// DrawPlanetRect: 240 x 74
function planetBoxDos(old) {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me(), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, W = PWORDS();
  const q = dq(240, 74, s ? s.name : '');
  if (s) {
    q.text(s.name, 0, 14, C12, { center: 48 });
    const R = (k) => kvText(old, k), L = (t, y) => q.text(t, 0, y, F9, { right: 40 });
    if (s.owner !== a.ME && R('temp') == null) q.text(W.noInfo || '', 3, 28, F9);
    else {
      const own = s.owner === a.ME;
      if (own) { const r = R('planetIncome'); if (r) { L(W.income || 'Income:', 28); q.text(r.value, 45, 28); } }
      else {
        const o = R('owner'), d = R('infodate');
        if (o) { L((W.owner || 'Owner:'), 28); q.text(o.value, 45, 28); }
        if (d) { q.text((W.infoDate || 'Info Date:'), 100, 28); q.text(d.value, 160, 28); }
        const bt = R('battle'); if (bt) { q.text(WD().battle, 100, 40); q.text(bt.value, 160, 40); }
      }
      [['population', 38, W.pop || 'Pop:'], ['temp', 48, W.temp || 'Temp:'], ['gravity', 58, W.grav || 'Gravity:'], ['planetMetal', 68, W.metal || 'Metal:']].forEach(([k, y, lab]) => { const r = R(k); if (r) { L(lab, y); q.text(r.value, 45, y); } });
      if (own) {
        const vals = colonyBars(s, p), names = [W.terra || 'Terra', W.mine || 'Mine', W.prod || 'Ship'];
        if (vals[0] >= 0 || vals[1] >= 0) {
          const draw = () => { q.rect(90, 0, 238, 70, '#fff'); vbars(q, 100, 2, colonyBars(s, p), 1, names, null, BARC); };
          draw(); dragBars(q, 100, 2, () => colonyBars(s, p), 1, (v, end) => { if (v) { setColonyBars(s, v); draw(); } if (end) { a.save(); a.renderPanel(); } });
        } else {
          q.text(W.queued || 'Ships Queued:', 100, 14);
          const rs = H.rules(g), lines = (s.queue || []).map(it => { const d = H.getDesign(g, a.ME, it.did); return d && rs.shipsText ? rs.shipsText(g, d, it.n) : (d ? it.n + ' ' + d.name : null); }).filter(Boolean).slice(0, 3);
          if (!lines.length) q.text(W.none || 'None.', 103, 26);
          lines.forEach((t, i) => q.text(t, 103, 26 + 12 * i));
        }
      }
    }
  }
  q.hline(0, 240, 71); q.hline(0, 240, 73);
  if (s && s.owner === a.ME) q.c.addEventListener('dblclick', () => a.openBuild(s.id));
  return q.c;
}
// DrawFleetRect: 240 x 79
let FLEET_TOP = 0;
function fleetBoxDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, rs = H.rules(g), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, W = PWORDS(), r12 = RS12();
  const q = dq(240, 79, 'Fleets');
  // (order: two captured games list the scouts first and the colony ship last, and pick the first; only that is known of the program's order, so colony ships are put after the rest, otherwise as the game has them)
  const isCol = (f) => H.fleetDesigns(g, f).some(d => d.type === 'colony');
  const list0 = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const here = list0.filter(f => !isCol(f)).concat(list0.filter(isCol));
  let sel = here.find(f => f.id === a.UI.selFleet);
  if (!sel && here.length) { sel = here[0]; a.UI.selFleet = sel.id; } // (the program has the first fleet of the star picked)
  FLEET_TOP = Math.max(0, Math.min(FLEET_TOP, here.length - 4));
  if (sel && r12) {
    const L = (rs.fleetInfo || r12.fleetInfo)(enView(g), sel), first = L[0] || '', m = /^(.*?:) (.*)$/.exec(first);
    if (m && !sel.scrap301 && !/ via /.test(first)) { q.text(fl(m[1] + ' x').replace(/ x$/, ''), 3, 11); q.text(m[2], 70, 11); } else q.text(fl(first), 3, 11);
    if (L[1]) q.text(fl(L[1]), 3, 23); if (L[2]) q.text(fl(L[2]), 70, 23); if (L[3]) q.text(fl(L[3]), 127, 23);
  }
  if (!here.length) q.text(W.noFleets || 'There are no fleets at this planet.', 3, 36);
  here.slice(FLEET_TOP, FLEET_TOP + 4).forEach((f, i) => {
    const top = 25 + 12 * i, ds = H.fleetDesigns(g, f), d = ds[0], n = H.fleetCount ? H.fleetCount(f) : Object.values(f.ships).reduce((x, y) => x + y, 0);
    const t = wl() === 'de' && d ? deRow(d, n) : rs.shipsText ? (d ? rs.shipsText(g, d, n) : '') : ds.length === 1 && r12 ? r12.shipsText(enView(g), d, n) : H.fleetLabel(g, f);
    const sl = f.id === a.UI.selFleet;
    if (sl) q.rect(0, top, 230, top + 12, '#000');
    q.text(t, 3, top + 10, f.dest != null ? F9B : F9, { color: sl ? '#fff' : '#000' });
  });
  q.rect(232, 25, 240, 73, '#aaa'); q.x.strokeStyle = '#000'; q.x.lineWidth = 1; q.x.strokeRect(232.5, 25.5, 7, 47);
  q.x.fillStyle = '#000'; q.x.beginPath(); q.x.moveTo(233, 33); q.x.lineTo(239, 33); q.x.lineTo(236, 28); q.x.fill(); q.x.beginPath(); q.x.moveTo(233, 65); q.x.lineTo(239, 65); q.x.lineTo(236, 70); q.x.fill();
  if (here.length > 4) { const hh = Math.max(6, 45 * 4 / here.length), y = 26 + (45 - hh) * FLEET_TOP / (here.length - 4); q.rect(233, y, 239, y + hh, '#555'); }
  q.hline(0, 240, 78);
  q.c.addEventListener('click', (ev) => { const pt = q.at(ev); if (pt.v < 25 || pt.v > 73) return;
    if (pt.h >= 232) { if (here.length > 4) { FLEET_TOP += pt.v < 49 ? -1 : 1; a.renderPanel(); } return; }
    const f = here[FLEET_TOP + Math.floor((pt.v - 25) / 12)]; if (f) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); } });
  q.c.addEventListener('wheel', (ev) => { if (here.length <= 4) return; ev.preventDefault(); FLEET_TOP += ev.deltaY > 0 ? 1 : -1; a.renderPanel(); }, { passive: false });
  return q.c;
}
// the totals: 240 x 43
function totalsBoxDos(info) {
  const q = dq(240, 43, 'Totals'), P = (RS12() || {}).panelInfo || { order: ['metal', 'savings', 'income'], words: { en: { metal: 'Reserve Metal:', savings: 'Total Money:', income: 'Total Income:' } } };
  const keyOf = { metal: 'metal', savings: 'savings', income: 'income' };
  P.order.filter(k => k !== 'interest').forEach((k, i) => {
    const row = info && Array.from(info.querySelectorAll('.kv')).find(r => (r.getAttribute('data-help') || '') .toLowerCase().includes(keyOf[k]));
    const t = row ? kvText(info, row.getAttribute('data-help')) : null; if (!t) return;
    const y = 13 + 12 * i;
    q.text(WD().totals[['metal', 'savings', 'income'].indexOf(k)], 0, y, F9B, { right: 91 }); q.text(t.value, 95, y, F9B); if (t.chg) q.text(t.chg, 0, y, F9, { right: 236 });
  });
  q.hline(0, 240, 42);
  return q.c;
}
const TECHK = ['range', 'speed', 'weapons', 'shields', 'mini'], TECHN = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'];
function techBoxDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, p = a.me();
  const rad = !H.feature(g, 'noRadical') && H.TECHS.includes('radical');
  const keys = rad ? TECHK.concat('radical') : TECHK, names = rad ? WD().tech.concat('Radical') : WD().tech;
  const q = dq(240, 83, 'Tech Spending'), sc = H.barScale(g, 'tech');
  const toPix = (v) => Math.trunc(50 * sc.toX(v)), fromPix = (px) => sc.toValue(px / 50);
  const vals = () => { const t = keys.reduce((s, k) => s + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
  const draw = () => {
    q.rect(0, 0, 240, 83, '#fff');
    q.text(WD().head, 80, 11, F9B); q.text(WD().levels, 3, 24);
    TECHK.forEach((k, i) => { q.text(WD().tech[i], 5, 36 + 11 * i); q.text(String(p.tech[k]), 54, 36 + 11 * i); });
    vbars(q, 80, 13, vals(), 2, names, toPix, ['#6500cf'], rad ? { b: 14, g: 8 } : null);
  };
  draw();
  dragBars(q, 80, 13, vals, 2, (v, end) => { if (v) { keys.forEach((k, i) => { p.talloc[k] = v[i] / 1000; }); draw(); } if (end) { a.save(); a.renderPanel(); } }, fromPix, rad ? { b: 14, g: 8 } : null);
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
  const trk = h - 18, upd = () => {
    const tot = target.scrollHeight, vis = target.clientHeight, max = Math.max(0, tot - vis), k = vis ? tot / vis : 1, th0 = Math.max(8, Math.min(trk, Math.round(trk / Math.max(1, k))));
    th.style.height = du(th0); th.style.top = du(9 + (max ? Math.round(target.scrollTop / max * (trk - th0)) : 0));
  };
  const step = (d) => { target.scrollTop += d; upd(); };
  up.addEventListener('pointerdown', (e) => { e.preventDefault(); step(-14); }); dn.addEventListener('pointerdown', (e) => { e.preventDefault(); step(14); });
  bar.addEventListener('pointerdown', (e) => { if (e.target !== bar) return; const r = bar.getBoundingClientRect(); step((e.clientY - r.top) / r.height * h < th.offsetTop / (r.height / h) ? -target.clientHeight : target.clientHeight); });
  th.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const y0 = e.clientY, s0 = target.scrollTop, r = bar.getBoundingClientRect(), k = r.height / h;
    const mv = (ev) => { const max = Math.max(1, target.scrollHeight - target.clientHeight), span = Math.max(1, trk - th.offsetHeight / k); target.scrollTop = s0 + (ev.clientY - y0) / k / span * max; upd(); };
    const upf = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upf); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upf);
  });
  target.addEventListener('scroll', upd); target.addEventListener('wheel', (e) => { if (target.scrollHeight > target.clientHeight) { e.preventDefault(); step(e.deltaY > 0 ? 14 : -14); } }, { passive: false });
  setTimeout(upd, 0); return bar;
}
function panelDos(panel, B) {
  if (!frameOn() || !window.HOAPI || !window.HOAPI.G) return;
  const a = window.HOAPI; loadFonts();
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
  low.append(vScroll(low.querySelector('.dosroster'), 80, 0, 169));
  if (B.budget) low.append(vScroll(B.budget, 232, 0, 169));
  panel.innerHTML = '';
  panel.append(planetBoxDos(B.planet), fleetBoxDos(), totalsBoxDos(B.info), low, techBoxDos());
}

// A finger on one of your fleets drags it, as a mouse does (the program has no other way to send a fleet; the classic skin's touch gestures only pan, and the
// iOS ones send a fleet from a Move button). Everything else a finger does stays the classic gestures (pan, pinch, taps). The finger's events are handed to the
// map as a mouse's, with the same pointer id.
function touchFleets() {
  const cv = document.getElementById('map'); if (!cv || cv._dosTouch) return; cv._dosTouch = true;
  let id = null;
  const mouse = (type, e) => new PointerEvent(type, { pointerId: e.pointerId, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true });
  cv.addEventListener('pointerdown', (e) => {
    const a = window.HOAPI; if (!frameOn() || e.pointerType !== 'touch' || !e.isTrusted || !a || !a.G || a.G.over) return;
    const px = e.offsetX / U, py = e.offsetY / U, d = (a.UI.dots || []).slice().reverse().find(k => k.mine && !k.sat && !k.transit && px >= k.x - 6 && px <= k.x + k.w + 6 && py >= k.y - 6 && py <= k.y + k.h + 6);
    if (!d) return;
    id = e.pointerId; e.stopImmediatePropagation(); e.preventDefault(); cv.dispatchEvent(mouse('pointerdown', e));
  }, true);
  for (const t of ['pointermove', 'pointerup', 'pointercancel']) cv.addEventListener(t, (e) => {
    if (id == null || e.pointerId !== id || e.pointerType !== 'touch' || !e.isTrusted) return;
    e.stopImmediatePropagation(); e.preventDefault(); cv.dispatchEvent(mouse(t === 'pointercancel' ? 'pointerup' : t, e));
    if (t !== 'pointermove') id = null;
  }, true);
}
function frameSetup(de) {
  const sync = () => { de.classList.toggle('dosframe', frameOn()); setUnit(); };
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
  b.append(sp); return dAt(b, l, t, w, h);
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
  placeDos(a.modal('', d, { cls: 'dosw', label: label || title || 'Spaceward Ho!' }), w, h);
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
    dButton('OK', 177, 127, 70, 26, () => { P.battleSpeed = v; P.fullAnim = full; a.savePrefs(); a.closeModal(); }, { hot: 0, def: true })], 'Battle Speed');
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
  const who = a.me() ? a.me().name : '';
  dDialog(392, 364, 'About Spaceward Ho!', [c, dText('Licensed to:', 8, 266), dText(who, 112, 266), dText('Spaceward Ho! Version 2.0', 112, 294), dButton('OK', 152, 322, 71, 28, () => a.closeModal(), { hot: 0, def: true })], 'About Spaceward Ho!');
  return true;
}

// the list windows (List of All Fleets: 544 x 322, List of All Explored Stars: 528 x 322): the title line, a list box (double rule) from (19, 47), rows of 14, the picked row
// black with white text, two buttons at the foot
function dListBox(w, h, x, y) {
  const a = window.HOAPI, box = a.el('div', { class: 'dd-list', role: 'listbox', tabindex: 0 });
  dAt(box, x == null ? 19 : x, y == null ? 47 : y, w, h); return box;
}
function fleetsDos() {
  const a = window.HOAPI, H = window.HO, g = a.G, W = Object.assign({ at: '%s stationed at %s.', leave: '%s leaving %s for %s to arrive in %d.', fly: '%s to arrive at %s in %d.', stuck: '%s marooned at %s.',
    hyper: 'Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location.' }, wl() === 'de' ? { at: '%s stationiert auf %s.', leave: '%s fliegt von %s nach %s. Ankunft: %d.', fly: '%s fliegt nach %s. Ankunft: %d.', stuck: '%s hängt auf %s fest.' } : {});
  const fill = (t, ...v) => { let i = 0; return t.replace(/%[sd]/g, () => String(v[i++])); };
  const stuck = (f) => f.star != null && g.stars[f.star].owner !== a.ME && !g.stars.some(s => s.id !== f.star && H.starDist(g, f.star, s.id) <= f.fuel + 1e-9);
  const fs = g.fleets.filter(f => f.owner === a.ME && !f.sat), order = fs.filter(f => !stuck(f)).concat(fs.filter(stuck));
  const turns = (f) => Math.ceil((f.dist - (f.prog || 0)) / H.fleetSpeed(g, f) - 1e-9);
  const line = (f) => {
    const d = wl() === 'de' && f.ships ? (() => { const ds = H.fleetDesigns(g, f); return ds.length === 1 ? deRow(ds[0], H.fleetCount ? H.fleetCount(f) : 1) : H.fleetText(g, f); })() : H.fleetText(g, f), st = (i) => g.stars[i].name;
    if (stuck(f)) return fill(W.stuck, d, st(f.star));
    if (f.to != null) return fill(W.fly, d, st(f.to), H.arrivalYear(g, turns(f)));
    if (f.dest != null) return fill(W.leave, d, st(f.star), st(f.dest), H.arrivalYear(g, Math.ceil(H.starDist(g, f.star, f.dest) / H.fleetSpeed(g, f) - 1e-9)));
    return fill(W.at, d, st(f.star));
  };
  let cur = order[0] || null;
  const box = dListBox(505, 214);
  const show = () => { box.textContent = ''; order.forEach(f => { const r = a.el('div', { class: 'dd-row' + (f === cur ? ' sel' : ''), role: 'option', 'aria-selected': String(f === cur), translate: 'no', onclick: () => { cur = f; show(); }, ondblclick: go }, line(f)); box.append(r); }); };
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
    dButton('Cancel', 272, 224, 71, 26, () => a.closeModal(), { hot: 0 }), dButton('Create', 401, 225, 70, 26, () => f.requestSubmit(), { hot: 1, def: true }));
  let opened = false;
  const more = el('button', { type: 'button', class: 'dd-more', onclick: () => { opened = !opened; dress(); } }, tx('Remake options…'));
  dAt(more, 19, 264, 230, 14); kids.push(more);
  const box = el('div', { class: 'dd', role: 'group', 'aria-label': 'Create New Galaxy' }); box.style.width = du(536); box.style.height = du(280);
  box.append(dAt(el('div', { class: 'dd-title', translate: 'no' }, tx('Create New Galaxy')), 5, 5, 526, 17), ...kids);
  const holder = el('div', { class: 'cg-dos' }, box); f.prepend(holder);
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules'), dress = () => { const on = !rs || rs.value === 'dos'; box.style.display = on ? '' : 'none'; win.classList.toggle('dosw', on && !opened); for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  if (rs) rs.addEventListener('change', dress); dress();
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
    if (d) { const pr = rs.yardProgress ? rs.yardProgress(g, p, s) : null, c = H.shipCostNow(g, p, d);
      top.append(dAt(shipPicEl(d, 40), 8, 8), dAt(a.el('span', { class: 'dd-t', translate: 'no' }, '$' + nf(c.money)), 140, 14, 100, 14), dAt(a.el('span', { class: 'dd-t', translate: 'no' }, (sel === 0 && pr ? pr.pct : 0) + '% Done'), 140, 34, 100, 14), dAt(a.el('span', { class: 'cap', translate: 'no' }, caption(d)), 8, 56, 232, 14)); }
  };
  const fill = () => { lst.textContent = ''; designs().forEach(d => { const it = a.el('div', { class: 'dd-type', role: 'option', tabindex: 0, 'aria-label': caption(d), onclick: () => add(d), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(d); } } }, shipPicEl(d, 40), a.el('span', { class: 'cap', translate: 'no' }, caption(d))); lst.append(it); }); };
  cells.forEach((c, i) => { c.addEventListener('click', () => { if (q[i]) { sel = i; draw(); } }); c.addEventListener('dblclick', () => { if (q[i] && --q[i].n <= 0) q.splice(i, 1); draw(); });
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
  const show = () => { box.textContent = ''; g.players.forEach((q, i) => box.append(a.el('div', { class: 'dd-row dd-skill' + (i === cur ? ' sel' : ''), role: 'option', 'aria-selected': String(i === cur), translate: 'no', onclick: () => { cur = i; show(); } },
    a.el('span', { class: 'n' }, q.name), a.el('span', { class: 'k' }, skillName(q.skill))))); };
  show();
  const ok = dButton('OK', 328, 266, 71, 27, () => d.remove(), { hot: 0 });
  d.append(dText(tx('List of all players and their skill levels:'), 22, 14, { hot: lang === 'en' || !lang ? 0 : -1 }), box, dText(tx('Computer Intelligence:') + ' ' + iq, 22, 266), ok);
  under.append(d); ok.focus();
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); d.remove(); } }, true);
  return d;
}
// The program's alert box (captured: the fuel alert, 352 x 210): the text in the screen font from 24 right and 13 down (40 characters a line, a blank line between paragraphs),
// the mascot (d3520) under it at 23 / 6 below the text, the buttons beside it at 23 below the picture's top; the box is 19 under the picture, and sits 7 above the screen's middle.
// Kept difference: only the fuel alert was captured, so the picture and the button words of other alerts, and the box's height for other lengths, follow the same rule.
function alertDos(paras, btns) {
  const a = window.HOAPI, wrap = (t) => { const out = []; String(t).split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { if (line && (line + ' ' + w).length > 40) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }); out.push(line); }); return out; };
  const lines = []; paras.forEach((t, i) => { if (i) lines.push(''); wrap(t).forEach(l => lines.push(l)); });
  const pic = 13 + 14 * lines.length + 6, h = pic + 74 + 19, d = a.el('div', { class: 'dd dd-alert', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': paras[0] });
  d.style.width = du(352); d.style.height = du(h);
  const done = () => back.remove();
  lines.forEach((l, i) => l && d.append(dText(l, 23, 13 + 14 * i)));
  const im = a.IMG['dos:d3520']; if (im) { const c = a.el('canvas', { class: 'dd-pic', 'aria-hidden': 'true' }); c.width = 74; c.height = 74; c.getContext('2d').drawImage(im, 0, 0); dAt(c, 22, pic, 74, 74); c.style.imageRendering = 'pixelated'; d.append(c); }
  const n = btns.length, bw = 72, gap = 16, x0 = Math.round(176 - (n - 1) * (bw + gap) / 2);
  btns.forEach((b, i) => d.append(dButton(b.label, x0 + i * (bw + gap), pic + 23, bw, 28, () => { done(); if (b.fn) b.fn(); }, { hot: 0, def: b.def })));
  const cb = [...d.querySelectorAll('.dd-btn')].pop(); if (cb) cb.setAttribute('data-esc-close', '1');
  // (the program's Yes/No boxes, FUN_9000_0000's types 0 and 1, take the keys Y and N as their first two buttons: their window procedures FUN_b000_36f9 and
  // FUN_b000_3656 compare the keys y and n, whatever the language; here the same in a box whose first two buttons say Yes and No)
  const yn = btns.length >= 2 && /^y/i.test(String(btns[0].label).trim()) && /^n/i.test(String(btns[1].label).trim());
  const letter = (e) => { const k = e.key.toLowerCase(); if (!yn || e.ctrlKey || e.altKey || e.metaKey || (k !== 'y' && k !== 'n')) return false; e.preventDefault(); e.stopPropagation(); d.querySelectorAll('.dd-btn')[k === 'y' ? 0 : 1].click(); return true; };
  const back = a.el('div', { class: 'scrim dd-alertscrim', onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); } else letter(e); } }, a.el('div', { class: 'dd-alertpos' }, d));
  document.body.append(back); const f = d.querySelector('.dd-btn.def') || d.querySelector('.dd-btn'); if (f) f.focus();
  return back;
}
// ======== Windows read from the program's own dialog templates ========
// DOSHO.EXE keeps its 32 windows as templates in a far data segment (40df:xxxx in the unpacked image, 0x430 bytes apart, from RegisterDlgBox to PatchDlgBox): a name,
// the window's size in screen cells (8 x 14 pixels), then each item as x, y, height and width in cells, its control class (9 a button, 11 a line of words, 18 a picture
// the window's procedure paints, 4 an edit field ...), its words and its id. An item at cell (x, y) sits at (8 + 8x, 14 + 14y) of the window: Battle Speed (35 x 13
// cells, 280 x 182) and Auto Play (47 x 19) were measured so; a button is 8w + 6 by 26 from a pixel inside its cell (Battle Speed's OK: 21, 8, 8 wide -> 177, 127, 70 x 26).
const cell = (x, y) => [8 + 8 * x, 14 + 14 * y];
function tplButton(txt, x, y, w, fn, o) { const [l, t] = cell(x, y); return dButton(txt, l + 1, t + 1, 8 * w + 6, 26, fn, o); }
function tplText(lines, x, y) { const [l, t] = cell(x, y); return lines.map((ln, i) => dText(ln, l, t + 14 * i)); }
function tplPic(name, x, y, w, h) {
  const a = window.HOAPI, im = a.IMG['dos:' + name], [l, t] = cell(x, y); if (!im) return null;
  const c = a.el('canvas', { class: 'dd-pic', 'aria-hidden': 'true' }); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); // (painted at the item's corner at its own size, not fitted to the item: FUN_2000_2ac4)
  return dAt(c, l, t, im.width, im.height);
}
// You Won and You Lost: YouWonDlgBox (21 x 20 cells, 168 x 280) and YouLostDlgBox (21 x 21, 168 x 294), opened by the turn's news (FUN_b000_88b3, alerts 5040 and 5050
// through FUN_3000_8395) with the window procedure FUN_9000_76c0, which loads picture 5040 or 5050 and paints it in item 999 (cell 0, 0, 19 x 11); the words, item 100, at
// cell 1, 11 (three lines, four for the lost one, left aligned as every line of words: FUN_b000_f240), and "   ~OK   " at cell 5, 15 (16), 8 wide. No title bar.
function youWonDos(kind, Y, done) {
  const a = window.HOAPI, won = kind === 'won', h = won ? 20 : 21, lines = String(Y.text).split('\n');
  const d = a.el('div', { class: 'dd', role: 'dialog', 'aria-label': lines.join(' ') });
  d.style.width = du(168); d.style.height = du(14 * h);
  const ok = tplButton(Y.ok || 'OK', 5, won ? 15 : 16, 8, () => a.closeModal(), { hot: 0, def: true });
  [tplPic(won ? 'd5040' : 'd5050', 0, 0, 19, 11), ...tplText(lines, 1, 11), ok].forEach(k => k && d.append(k));
  placeDos(a.modal('', d, { cls: 'dosw', sticky: true, label: lines.join(' '), onClose: done }), 168, 14 * h);
  ok.focus(); return true;
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
  const d = dDialog(321, 125, 'Reports', [box], 'Reports'); d.append(vScroll(box, 305, 21, 99));
  // (the program's Reports window has a teal title bar like the main window's, and at its left the Windows control-menu mark of three bars; a click on it closes the window here)
  const tb = d.querySelector('.dd-title'); if (tb) { tb.classList.add('teal'); const sb = a.el('button', { type: 'button', class: 'dd-sysbox', 'aria-label': 'Close', onclick: () => a.closeModal() }); dAt(sb, 8, 0, 14, 17); tb.append(sb); }
  const now = box.querySelector('[data-now]'); if (now) box.scrollTop = now.offsetTop - box.offsetTop;
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
