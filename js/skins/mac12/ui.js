// Spaceward Ho! web remake — the Mac 1.2 skin (see js/skins.js)
//
// Spaceward Ho! 1.2 for the Macintosh (the French edition, 1992): the Mac
// 3.0.1 skin (js/skins/mac3/ui.js) with 1.2's own black-and-white pictures
// and sounds (tools/extract/mac12.py writes them to assets/skins/mac12).
// 1.2's colour pictures were in a separate file that we haven't got.
//
// In its own skin a version's windows are its own: their contents, words,
// order, dimming and sounds (docs/display/12.json, the display audit). The
// words are written here in English as the Mac 2.0.1 program has them (the
// nearest official English: 1.2 is a pre-release of 2.0, docs/12-findings.md
// "English"); in French the interface puts them in 1.2F's own words (its
// MENU, DITL and STR# lines, paired with 2.0.1's: js/languages.js windows12,
// and the rows of js/ui-text.js marked 1.2F).
// The Mac 3.0.1 skins (js/skins/mac3, window.HOMAC3) load it too, and take from it only what 3.0.1 shares with 2.0.1: window.HOMAC301 below.
// The Mac 4.0.5 skins (js/skins/mac4, window.HOMAC4V) run its 3.0.1 path: 4.0.5's main screen is 3.0.1's (ResetWindows @8477a = 3.0.1's
// @f4b9a, with the Chat window added); where 4.0.5's own routine differs, V4 below (docs/status-mac405.md says which part rests on what).
window.HOMAC_VERSION = window.HOMAC4V ? '4.0.5' : window.HOMAC3 ? '3.0.1' : window.HOMAC2 ? '2.0.1' : '1.2'; // (the Mac 2.0.1 skins, js/skins/mac2, load this file: 2.0.1 is 1.2's program with additions)
(function () {
'use strict';
const V2 = window.HOMAC_VERSION === '2.0.1';
const V4 = window.HOMAC_VERSION === '4.0.5';
const V3 = window.HOMAC_VERSION === '3.0.1' || V4; // (3.0.1's path: 4.0.5 takes it too, with V4 where it differs)
const COLOUR3 = !!(window.HOMAC3_COLOUR || window.HOMAC4_COLOUR); // (a colour 3.0.1 or 4.0.5)
let HOMAC_RE20 = null;
const A = () => window.HOAPI;
// ---------- the Mac's screen, made as big as the window allows (Jake, 17 November 2026: "scale the whole Mac", every Mac skin) ----------
// As the DOS look's frame (js/skins/dos/ui.js setUnit): S is how many times the program's 640 x 480 screen fits the window, in half steps, from
// 1.5 (below it, a phone, the page is as it was). The map is drawn in the Mac's pixels, S CSS pixels each (T.mapPixel: its clicks and drags
// follow), so its zooms are the program's 6, 9, 12 and 17 pixels a cell, S times bigger; the panel is the Mac's 226 pixels wide, and it, the
// menu bar, the windows, the report bubble and the map's scroll bars are zoomed by S (html.macscale, --mac: js/skins/mac12/panel.css). A
// window that big shows as much of the galaxy as the Mac's screen did, in the same proportion.
// The remake's panel holds more than the program's (the Report Window under Tech Spending, where 3.0.1 put it under the map), so the screen
// is fitted to the panel's height too: S is the largest quarter step at which the Mac's 640 pixels fit across and the menu bar and the whole
// panel fit down (its height in the Mac's pixels, measured after each drawing; the zoom doesn't change it).
const MACS = { s: 1, need: 480 };
// (quarter steps since 18 Nov: 3.0.1's panel is the tallest, and in half steps a laptop's screen left it at x1.5 with a band to spare, Jake's report)
function macScale() { const u0 = Math.min(window.innerWidth / 640, window.innerHeight / Math.max(480, MACS.need)); return u0 >= 1.25 ? Math.floor(u0 * 4) / 4 : 1; }
function measureMac() {
  const p = document.getElementById('panel'), m = document.getElementById('menubar'); if (!p || !p.firstChild || MACS.s <= 1 || document.documentElement.classList.contains('mac75')) { if (MACS.need !== 480 && document.documentElement.classList.contains('mac75')) { MACS.need = 480; setMacScale(); } return; } // (only in the Mac's layout: the page's own panel is wider, so taller)
  const z = MACS.s, pr = p.getBoundingClientRect(), last = p.lastElementChild.getBoundingClientRect();
  const t3 = document.documentElement.classList.contains('mac301lay') && document.getElementById('tech301'); // (3.0.1's bottom row: Tech Spending's height too)
  const need = Math.ceil((last.bottom - pr.top + p.scrollTop * z) / z + 16 + (m ? m.getBoundingClientRect().height / z : 20) + (t3 ? t3.getBoundingClientRect().height / z : 0)); // (the content's foot, the panel's padding above and below, the menu bar)
  if (need !== MACS.need) { MACS.need = need; setMacScale(); }
}
function setMacScale() {
  const s0 = MACS.s, de = document.documentElement; MACS.s = macScale();
  de.style.setProperty('--mac', String(MACS.s)); de.classList.toggle('macscale', MACS.s > 1);
  if (s0 !== MACS.s && A() && A().G) { A().UI.fitted = false; A().resize(); A().renderPanel(); }
}
setMacScale(); window.addEventListener('resize', setMacScale);
document.documentElement.classList.add('macfam'); // (the Mac 1.2, 2.0.1 and 3.0.1 skins: their End Turn's place, js/skins/mac12/panel.css)
const macPixel = () => (MACS.s > 1 ? [MACS.s, MACS.s] : null);
// a pane's canvas has enough pixels for the zoom and the screen (twice the Mac's at the least)
const QK = () => Math.max(2, Math.ceil(MACS.s * (window.devicePixelRatio || 1)));
const G = () => A() && A().G;
const H = () => window.HO;
// the selected star and fleet
const selStar = () => { const a = A(); return a && a.UI.sel != null && G() ? G().stars[a.UI.sel] : null; };
const selFleet = () => { const a = A(); const f = a && a.curFleet ? a.curFleet() : null; return f && f.owner === a.ME ? f : null; };
const mine = () => { const s = selStar(); return !!(s && s.owner === A().ME); };
const lastBattle = () => { const s = selStar(); if (!s) return null; const bs = A().lastBattles(s.id); return bs.length ? bs[bs.length - 1] : null; };
// the remake's own command for an item it already has (setupMenus' menus), by its English
let ITEMS = {};
const run = (k) => () => { const it = ITEMS[k]; if (it) it[1](); };
// an item: [label, fn, shown, checked, ghosted, key]
const it = (label, fn, o) => [label, fn, (o && o.shown) || null, (o && o.checked) || null, (o && o.ghost) || null, (o && o.key) || null];
const noGame = () => !G();

// the map's four zooms (MapWinProc, the setup's +0x26: 6, 9, 12 and 17 pixels to two light years' unit, 17 to start; Zoom + / Zoom -
// step them and are dimmed at the ends); at the smallest a star is a dot, with no picture and no name (DrawOneBWStarSubProc @c38ce:
// PaintOval), names from the second on
const LY = 2, ZOOMS = [6, 9, 12, 17].map(z => z * LY);
// With modern conveniences, three closer zooms beyond the original's largest (the remake's: on a big screen 17 is small); the plain game keeps the four.
const ZOOMS_MODERN = ZOOMS.concat([24, 34, 48].map(z => z * LY));
const zoomsBase = () => { const g = G(); return g && g.opts && g.opts.modern ? ZOOMS_MODERN : ZOOMS; };
// The window filled (Jake, 19 Nov 2026, the remake's own: on a big screen the whole galaxy shows at 17 with a wide empty band at the right or
// the foot): when every star fits at the largest zoom with room to spare, that zoom becomes the one that fills the window, the stars and their
// names as far from the top as from the foot (or from the left as from the right, whichever binds); the smaller zooms are the program's, and a
// galaxy that doesn't fit at 17 is shown as the program shows it. The edge round the stars: half a planet's picture, and its name under it.
const FILL = { key: '', s: 0 };
const planetPx12 = (s) => Math.max(18, Math.min(52, s * 0.9)); // (the classic map's planet size, js/skins/classic/ui.js planetPx)
function starBox(g, s) { // the stars' extent at scale s, in map pixels, with each one's picture and name
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const st of g.stars) { x0 = Math.min(x0, st.x); x1 = Math.max(x1, st.x); y0 = Math.min(y0, st.y); y1 = Math.max(y1, st.y); }
  const ps = planetPx12(s), side = Math.max(ps / 2, 30), top = ps / 2 + 2, foot = ps / 2 + 15;
  return { x0: x0 * s - side, x1: x1 * s + side, y0: y0 * s - top, y1: y1 * s + foot };
}
function fillZoom() {
  const g = G(), a = A(); if (!g || !a || !g.stars || !g.stars.length) return 0;
  const [w, h] = mapSize(); if (!w || !h) return 0;
  const key = [w, h, g.stars.length, g.W, g.H, g.stars[0].x, g.stars[0].y].join();
  if (FILL.key === key) return FILL.s;
  const GAP = 16; let s = ZOOMS[3];
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const st of g.stars) { x0 = Math.min(x0, st.x); x1 = Math.max(x1, st.x); y0 = Math.min(y0, st.y); y1 = Math.max(y1, st.y); }
  for (let i = 0; i < 6; i++) { // (the edge grows with the zoom until the planets are their largest: a few rounds settle it)
    const ps = planetPx12(s), padX = 2 * Math.max(ps / 2, 30), padY = ps + 17;
    s = Math.min((w - 2 * GAP - padX) / Math.max(1, x1 - x0), (h - 2 * GAP - padY) / Math.max(1, y1 - y0));
  }
  FILL.key = key; FILL.s = s > ZOOMS[3] * 1.02 ? Math.floor(s * 100) / 100 : 0;
  return FILL.s;
}
const zooms = () => { const Z = zoomsBase(), f = own() ? fillZoom() : 0; return f ? ZOOMS.slice(0, 3).concat([f], Z.slice(4).filter(z => z > f * 1.1)) : Z; };
const zoomIdx = (s) => { const Z = zooms(); let b = 0; Z.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(Z[b] / s))) b = i; }); return b; };
const snapZoom = (s) => zooms()[zoomIdx(s)];
function zoomTo(s, f) {
  const Z = zooms(), cur = zoomIdx(s);
  let i = zoomIdx(s * f);
  if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1);
  return Z[Math.max(0, Math.min(Z.length - 1, i))];
}
const atZoom = (k) => { const a = A(); return !!a && zoomIdx(a.UI.view.s) === (k < 0 ? zooms().length + k : k); };

// The menus, as 1.2's MENU resources 128-134 have them (SetMenuItems @e29aa: what is dimmed, the words that
// change with the selection, the check marks). The Apple menu is the skin's "Ho! 1.2" menu.
// A later ruleset's fleet orders, the remake's own (1.2 had none; the classic fleet row has them as a select and a check box, and this skin's
// own panel has no such row): Battle stance (5.0.5, the Palm, iOS, Android, Claude, Gemini) and Arrive late, as check-marked items at the foot
// of the Ships menu, on the selected fleet of yours that is on the ground, dimmed otherwise, as 1.2's Organize Ships and Scrap Current Fleet are.
// 1.2's own rules have neither feature, so its Ships menu is as it was. The words are the table's (js/ui-text.js: iOS's and the Palm's).
// A later ruleset's preferences as 1.2 keeps its own, check-marked items in the Options menu (1.2 had no Preferences window): only the most
// important messages, the between-turn hints, the stars your best buddies explore, in the words of the ruleset's own Preferences window
// (rs.prefsWindow: 5.0.5's, the Palm's, iOS's rows) or the generic ones; each only where the ruleset's Preferences window has it, dimmed while
// "Show Event Messages" is off (as 5.0.5's window disables them), and none under 1.2's own rules. The Preferences window stays: the rest of it
// (the player's sex, °C, the Palm's choices) is there.
const tr12 = (x) => (window.HOUI && HOUI.tr ? HOUI.tr(x) : x);
function prefItems12() {
  const rs = () => H().rules(G()), W = () => (G() && rs().prefsWindow) || null;
  const row = (k) => { const w = W(); return w && w.rows ? (w.rows.find(r => r[0] === k) || [])[1] : null; };
  // (iOS words its row "Messages", "Only Important")
  const spec = {
    important: { word: () => { const w = W(); if (!w) return 'Show only the most important messages'; if (w.important) return w.important; const r = (w.rows || []).find(x => x[0] === 'important'); return r ? `${tr12(r[1])}: ${tr12(r[2])}` : null; /* (the two words apart: joined, "Messages: Only Important" is in no table and stayed English in every language) */ }, avail: () => !W() ? !rs().options : !!(W().important || row('important')), get: () => !!A().Prefs.important, set: (v) => { A().Prefs.important = v; } },
    hints: { word: () => { const w = W(); return !w ? 'Give helpful game play hints' : w.hints || row('hints'); }, avail: () => !W() ? rs().hints !== false : !!(W().hints || row('hints')), get: () => !!A().Prefs.hints, set: (v) => { A().Prefs.hints = v; } },
    buddies: { word: () => { const w = W(); return w && (w.buddies || row('buddies')); }, avail: () => !!W() && !!(W().buddies || row('buddies')), get: () => A().Prefs.buddyStars !== false, set: (v) => { A().Prefs.buddyStars = v; } },
  };
  return Object.entries(spec).map(([k, d]) => it(() => d.word() || k, () => { d.set(!d.get()); A().savePrefs(); A().renderPanel(); },
    { shown: () => !!G() && !own12Rules() && !!d.avail(), ghost: () => noGame() || (!!W() && A().Prefs.showMsgs === false), checked: d.get }));
}
function fleetOrders12() {
  // (the menus are laid out once, before any game: the items are always in the list and each says by `shown` whether its ruleset has the
  // feature when the menu is opened; the dimmed "Battle stance" is the heading, as a separator cannot be hidden)
  const has = (k) => () => !!G() && H().feature(G(), k);
  const f = () => { const x = selFleet(); return x && x.owner === A().ME && !x.sat && x.star != null && x.to == null ? x : null; };
  return [
    it('Battle stance', () => {}, { shown: has('stances'), ghost: () => true }),
    ...[['normal', 'Normal'], ['offensive', 'Offensive'], ['defensive', 'Defensive']].map(([v, t]) => it(t, () => { const x = f(); if (x) { x.stance = v; A().save(); } },
      { shown: has('stances'), ghost: () => !f(), checked: () => !!f() && (f().stance || 'normal') === v })),
    it('Arrive late', () => { const x = f(); if (x) { x.delayed = !x.delayed; A().save(); } }, { shown: has('lateArrival'), ghost: () => !f(), checked: () => !!f() && !!f().delayed })];
}
function menuLayout() { if (V3) return menuLayout301(); const M = menuLayout12(); return V2 ? menuLayout20(M) : M; }
// Mac 3.0.1's menus: MENU 128-134 in its words (HOLANG.mac301En.MENU; 3.0.1F's French through the interface), the words that change
// from STR# 1010, and what is dimmed and checked as SetMenuItems @f4492 sets them:
// - no game: Ships, Galaxy and Window dimmed whole; File's Save, Revert, Close, End Turn, End Turn & Switch Players, Page Setup, Print
//   and Options' Auto Play, Sound, I'll Update Turns, Preferences dimmed (the Halls and Force Turn Update are not touched);
// - Save and Revert only with unsaved changes (the remake saves every change: always dimmed); Force Turn Update for the player whose
//   number is the header's +3 byte, with two humans or more (+2); I'll Update Turns dimmed with fewer than two humans;
// - the selected star yours (GetPlayerStarNum): Ships 1 "Build/Design Ships…" (1010.3) and Galaxy's Abandon Planet ("Don't Abandon
//   Planet" / "Abandon Planet", 1010.15/.16, by the colony's flag), else "Can't Build Ships Here…" (1010.4) and both dimmed;
// - the star's selected fleet: Organize Ships… (1010.7) and Scrap Current Fleet / Don't (1010.9/.10), else "No ships to organize…" (.8)
//   and both dimmed; the star's last battle in 2000 or later: "Review Battle at %s…" (.5), else "No Battles here…" (.6), dimmed;
// - the year 2000 or less: Alliances, Give Money/Metal, Surrender To, Send Message dimmed; a player out of the game (mode 4 and up):
//   Alliances, Surrender, Auto Play and Armageddon dimmed; Armageddon checked while the player's switch is on;
// - Fix Spending dimmed while reports are unread; Zoom In dimmed at the largest zoom (17), Zoom Out at the smallest (6);
//   Window 6 "Hide Information" / "Show Information" (1010.11/.12: ShowHideMapInfo, the info panes' width 226 or 0).
// Print and Page Setup are there and dimmed (a browser has no Mac printing); Clean Up Windows does nothing here (the remake's windows
// are always where ResetWindows puts them). The Apple menu is the skin's "Ho! 3.0.1" menu.
let INFO301 = true;
function menuLayout301() {
  const P = () => A().Prefs, g = () => G(), me = () => A().me();
  const cmd = (re) => () => { const k = Object.keys(ITEMS).find(n => re.test(n)); if (k) ITEMS[k][1](); };
  const out = () => { const p = me(); return !p.alive || !!p.surrendered; };
  const early = () => g().year <= 2000;
  const humans = () => g().players.filter(p => p.human).length;
  const gone = () => true;
  const S = (i) => (STR301(1010)[i - 1] || '');
  const fleetHere = () => { const s = selStar(), f = selFleet(); return s && f && f.star === s.id ? f : null; };
  const abandonMarked = () => { const t = H().rules(g()).evacuateToggle, s = selStar(); return !!(t && s && t.marked(g(), s.id)); };
  const hideInfo = () => { INFO301 = !INFO301; document.documentElement.classList.toggle('mac301noinfo', !INFO301); A().resize(); A().renderPanel(); A().draw(); };
  return {
    File: [
      it('New…', () => A().newGameDialog(), { key: 'N' }),
      it('Open…', () => A().openSavedGames(), { key: 'O' }),
      it('Save', () => {}, { ghost: gone, key: 'S' }),
      it('Revert To Saved…', () => {}, { ghost: gone }),
      it('Close…', cmd(/^quit to title/i), { ghost: noGame, key: 'W' }),
      '-',
      it('End Turn', () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); else if (G()) A().doEndTurn(); }, { ghost: noGame, key: 'T' }),
      it('End Turn & Switch Players', () => { if (A().hotSeat()) A().switchPlayers(); else { const b = document.querySelector('#msg .clock'); if (b) b.click(); else A().doEndTurn(); } }, { ghost: noGame, key: '†' }),
      it('Force Turn Update…', cmd(/force end turn/i), { ghost: () => noGame() || humans() < 2 || A().ME !== g().players.findIndex(p => p.human) }),
      '-',
      it('Page Setup…', () => {}, { ghost: gone }),
      it('Print…', () => {}, { ghost: gone, key: 'P' }),
      '-',
      it('Quit', cmd(/^quit to title/i), { key: 'Q' })],
    Edit: [it('Undo', () => {}, { key: 'Z' }), '-', it('Cut', () => {}, { key: 'X' }), it('Copy', () => {}, { key: 'C' }), it('Paste', () => {}, { key: 'V' }), it('Clear', () => {})],
    Options: [
      it('Auto Play…', cmd(/^auto play/i), { ghost: () => noGame() || out() }),
      '-',
      it('Sound', () => { A().Sound.on = !A().Sound.on; A().savePrefs(); }, { ghost: noGame, checked: () => A().Sound.on }),
      it('I’ll Update Turns', () => {}, { ghost: () => noGame() || humans() < 2, checked: () => true }),
      '-',
      it('Preferences…', () => A().openPrefs(), { ghost: noGame }),
      it('Hall Of Fame…', () => A().openHall('fame')),
      it('Hall Of Shame…', () => A().openHall('shame'))],
    Ships: [
      it(() => (noGame() || mine() ? S(3) : S(4)), () => { if (mine()) build301(selStar().id); }, { ghost: () => noGame() || !mine(), key: 'B' }),
      '-',
      it('List All Fleets…', () => A().openFleetList(), { ghost: noGame, key: 'L' }),
      it(() => (noGame() || fleetHere() ? S(7) : S(8)), () => { const s = selStar(); if (fleetHere()) organize301(s.id); }, { ghost: () => noGame() || !fleetHere(), key: 'G' }),
      it(() => (fleetHere() && fleetHere().scrap301 ? S(10) : S(9)), () => { const f = fleetHere(); if (f) A().toggleScrapFleet(f); }, { ghost: () => noGame() || !fleetHere() }),
      '-',
      it(() => (lastBattle() ? S(5).replace('%s', selStar().name) : S(6)), () => { const b = lastBattle(); if (b) A().openBattle(b.id); }, { ghost: () => noGame() || !lastBattle(), key: 'R' })],
    Galaxy: [
      it('Compare Players…', () => A().openCompare(), { ghost: noGame }),
      it('Graph History…', () => A().openPlayers(), { ghost: noGame }),
      it('List All Explored Stars…', () => A().openStarList(), { ghost: noGame }),
      '-',
      it('Fix Spending', cmd(/^fix spending/i), { ghost: () => noGame() || A().UI.msgIdx < (A().UI.inbox || []).length, key: 'F' }),
      it('Dip Into Savings…', () => A().openDip(), { ghost: noGame, key: 'D' }),
      it(() => (mine() ? (abandonMarked() ? S(15) : S(16)) : 'Abandon Planet…'), () => { if (mine()) A().evacuateClick(selStar().id); }, { ghost: () => noGame() || !mine(), key: 'A' }),
      '-',
      it('Alliances…', () => alliances301(), { ghost: () => noGame() || early() || out() }),
      it('Give Money/Metal…', () => A().openGive(), { ghost: () => noGame() || early() }),
      it('Surrender To…', () => A().openSurrender(), { ghost: () => noGame() || early() || out() }),
      it('Send Message…', () => A().openChat(), { ghost: () => noGame() || early(), key: 'M' }),
      '-',
      it('Armageddon', () => A().toggleArmageddon(), { ghost: () => noGame() || out(), checked: () => !!G() && !!me().armageddon })],
    Window: [
      it('Tech Spending Window', () => { const t = document.querySelector('#panel .tech301'); if (t) t.scrollIntoView({ block: 'nearest' }); }, { ghost: noGame, key: '1', checked: () => true }),
      it('Report Window', () => { const r = document.querySelector('#panel .rep12box'); if (r) r.scrollIntoView({ block: 'nearest' }); else A().openReports(); }, { ghost: noGame, key: '2', checked: () => true }),
      '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoom(-1), key: '=' }),
      it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || atZoom(0), key: '-' }),
      it(() => (INFO301 ? S(11) : S(12)), hideInfo, { ghost: noGame, key: 'I' }),
      '-',
      it('Clean Up Windows', () => {}, { ghost: noGame })],
  };
}
// Mac 2.0.1's menus: MENU 129 (File), 131 (Options) and 133 (Galaxy) as that program has them (the rest are 1.2's, in the same words), from the resource fork
// (audit/mac-2.0.1/tools/menu.py in the private repo). What the remake has no command for is there and dimmed (printing: a browser has no Mac Page Setup or
// Print Map; the network polling), and a command it has only in a hot-seat game is dimmed otherwise.
function menuLayout20(M) {
  const pick = (L, name) => L.find(x => x !== '-' && x[0] === name);
  const cmd = (re) => () => { const k = Object.keys(ITEMS).find(n => re.test(n)); if (k) ITEMS[k][1](); };
  const has = (re) => () => { const k = Object.keys(ITEMS).find(n => re.test(n)); return !!k && (!ITEMS[k][2] || !!ITEMS[k][2]()); };
  const no = (f) => () => noGame() || !f();
  const gone = () => true;
  const F = M.File, O = M.Options, Gx = M.Galaxy;
  const speed = pick(O, 'Set Battle Speed…'), shows = pick(O, 'Show Event Messages'), review = pick(O, 'Review Announced Battles'), warn = pick(O, 'Give Overspending Warnings'), snd = pick(O, 'Sound');
  const extra = O.filter(x => x !== '-' && ![speed, shows, review, warn, snd].includes(x));
  M.File = [pick(F, 'New…'), pick(F, 'Open…'), pick(F, 'Save…'), pick(F, 'Revert To Saved…'), pick(F, 'Close…'), '-', pick(F, 'End Turn'),
    it('End Turn & Switch Players', cmd(/switch players/i), { ghost: no(has(/switch players/i)) }), '-',
    it('Page Setup…', () => {}, { ghost: gone }), it('Print Map…', () => {}, { ghost: gone, key: 'P' }), '-', pick(F, 'Quit')];
  M.Options = [// (SetMenuItems @e2f2e: Force Turn Update needs the player whose number is the game header's +6 word, the number of computers, so the first human, and two humans; Auto Play a player still in the game: mode below 4)
    it('Force Turn Update…', cmd(/force end turn/i), { ghost: () => noGame() || !has(/force end turn/i)() || A().ME !== G().players.findIndex(p => p.human) }), it('Auto Play…', cmd(/^auto play/i), { ghost: () => noGame() || !has(/^auto play/i)() || !(A().me().alive && !A().me().surrendered) }),
    it('I’ll Update Turns', () => {}, { ghost: gone, checked: () => true }), '-', it('Set Polling Time…', () => pollingTime20(), { ghost: noGame }), speed, '-', shows, review, warn, snd, ...extra];
  M.Galaxy = [it('Compare Players…', cmd(/^compare players/i), { ghost: no(has(/^compare players/i)) }), pick(Gx, 'List All Explored Stars…'), it('Send Message…', cmd(/^send a message/i), { ghost: () => noGame() || !has(/^send a message/i)() || G().year <= 2000 }) /* (SetMenuItems @e2f2e: item 3 is dimmed while the year is 2000 or less) */, '-',
    ...Gx.slice(Gx.findIndex(x => x !== '-' && x[0] === 'Zoom In'))];
  return M;
}
function menuLayout12() {
  const P = () => A().Prefs;
  return {
    File: [
      it('New…', () => A().newGameDialog(), { key: 'N' }),
      it('Open…', () => A().openSavedGames(), { key: 'O' }),
      // (Save and Revert: dimmed unless the game has changed since it was saved; the remake saves every change at once)
      it('Save…', () => {}, { ghost: () => true, key: 'S' }),
      it('Revert To Saved…', () => {}, { ghost: () => true }),
      it('Close…', run('Quit to title'), { ghost: noGame, key: 'W' }),
      '-',
      it('End Turn', () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); else if (G()) A().doEndTurn(); }, { ghost: noGame, key: 'T' }),
      '-',
      it('Quit', run('Quit to title'), { key: 'Q' })],
    // (for desk accessories; never enabled in a game window)
    Edit: [it('Undo', () => {}, { ghost: () => true, key: 'Z' }), '-', it('Cut', () => {}, { ghost: () => true, key: 'X' }), it('Copy', () => {}, { ghost: () => true, key: 'C' }),
      it('Paste', () => {}, { ghost: () => true, key: 'V' }), it('Clear', () => {}, { ghost: () => true })],
    Options: [
      it('Set Battle Speed…', () => battleSpeed12(), { ghost: noGame }),
      '-',
      it('Show Event Messages', () => { P().showMsgs = P().showMsgs === false; A().savePrefs(); }, { ghost: noGame, checked: () => P().showMsgs !== false }),
      it('Review Announced Battles', () => { P().review = !A().prefReview(); A().savePrefs(); }, { ghost: noGame, checked: () => A().prefReview() }),
      it('Give Overspending Warnings', () => { const g = G(); g.opts.overspendWarnings = g.opts.overspendWarnings === false; A().save(); }, { ghost: noGame, checked: () => !!G() && G().opts.overspendWarnings !== false }),
      it('Sound', () => { A().Sound.on = !A().Sound.on; A().savePrefs(); }, { ghost: noGame, checked: () => A().Sound.on }),
      ...prefItems12()],
    Ships: [
      it('List Ship Types…', () => A().openScrapTypes(), { ghost: () => noGame() || !A().me().designs.some(d => !d.scrapped) }),
      it('Create New Ship Type…', () => createType(), { ghost: noGame, key: 'K' }),
      '-',
      it('List All Fleets…', () => A().openFleetList(), { ghost: noGame, key: 'L' }),
      // (1010.7 / .8: the selected fleet's ships to organize)
      it(() => (selFleet() && selFleet().star != null ? 'Organize Ships…' : 'No ships to organize…'), () => { const f = selFleet(); if (f && f.star != null && f.to == null) organize(f); },
        { ghost: () => noGame() || !(selFleet() && selFleet().star != null) }),
      // (1010.3 / .4: the selected star, yours)
      it(() => (mine() ? `Build Ships at ${selStar().name}…` : 'Can’t Build Ships Here…'), () => { if (mine()) A().openBuild(selStar().id); },
        { ghost: () => noGame() || !mine(), key: 'B' }),
      // (1010.9 / .10)
      it(() => (selFleet() && selFleet().scrap301 ? 'Don’t Scrap Current Fleet' : 'Scrap Current Fleet'), () => { const f = selFleet(); if (f) A().toggleScrapFleet(f); },
        { ghost: () => noGame() || !selFleet() }),
      '-',
      // (1010.5 / .6: a battle seen at the selected star)
      it(() => (lastBattle() ? `Review Battle at ${selStar().name}…` : 'No Battles here…'), () => { const b = lastBattle(); if (b) A().openBattle(b.id); },
        { ghost: () => noGame() || !lastBattle(), key: 'R' }),
      ...fleetOrders12()],
    Galaxy: [
      it('List All Explored Stars…', () => A().openStarList(), { ghost: noGame }),
      '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoom(-1), key: '=' }),
      it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || atZoom(0), key: '-' }),
      '-',
      // (dimmed while announcements are still to be read: SetMenuItems' message count)
      it('Fix Spending', () => fixStep(), { ghost: () => noGame() || A().UI.msgIdx < (A().UI.inbox || []).length, key: 'F' }),
      // the remake's own: a later ruleset's Evacuate (3.0.1 on; 1.2 and DOS 2.0 had none, rs.evacuateCommand false), on the selected colony of yours,
      // in the ruleset's own words ("Evacuate Planet" / "Don't Evacuate Planet" in 5.0.5, which marks the colony instead). Not on the planet's
      // box: this skin's own is 1.2's, which has no such button, and a context menu would need a right click
      it(() => (mine() && A().evacuateLabel ? A().evacuateLabel(selStar().id, 'Evacuate planet…') : 'Evacuate planet…'), () => { if (mine()) A().evacuateClick(selStar().id); },
        { shown: () => !!G() && A().evacuateShown(), ghost: () => noGame() || !mine() || !A().evacuateHere(selStar()) })],
    Window: [
      it('Tech Spending Window', () => { const t = document.querySelector('#panel .box.tech, #panel section:nth-of-type(3)'); if (t) t.scrollIntoView({ block: 'nearest' }); }, { ghost: noGame, key: '1', checked: () => V2 }),
      it('Report Window', () => { const r = own() && document.querySelector('#panel .rep12box'); if (r) { r.scrollIntoView({ block: 'nearest' }); const li = r.querySelector('li[data-now]') || r.querySelector('li'); if (li) li.focus(); } else A().openReports(); }, { ghost: noGame, key: '2', checked: () => V2 }),
      '-',
      it('Clean Up Windows', () => {}, { ghost: () => true })],
  };
}


// ---------- the windows (in English as Mac 2.0.1 words them; in French the interface puts 1.2F's DITL words) ----------
// the game's language: the one chosen at New Game, else the ruleset's own (1.2's is French, 5.0.5's English). Only a game with its language
// unset in a later ruleset used to read French here (docs/12-findings.md, "Remake-only controls"); 1.2's own rules are as before.
const lang = () => (G() && G().opts && G().opts.lang) || (G() && H().ownLanguage && H().ownRules ? H().ownLanguage(H().ownRules(G())) : null) || 'fr';
const own = () => lang() === 'en' || lang() === 'fr';
// 1.2F's four classes; the later ones are not in 1.2F or 3.0.1F, so iOS's French (docs/glossary-fr.md): Epouvante, Tanker, Biologique, Leurre
const CLASS_FR = { scout: 'Eclaireur', fighter: 'Croiseur', colony: 'Transport', satellite: 'Satellite', dread: 'Epouvante', tanker: 'Tanker', bio: 'Biologique', decoy: 'Leurre' };
// the classes a ruleset lets you build, 1.2's four first (MENU 6015), then the later ones in the order the classic Build window lists them
const CLASSES = () => ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => H().canBuildType(G(), A().me(), t));
const cls = (t) => (lang() === 'fr' ? CLASS_FR[t] : (H().TYPES[t] || { name: t }).name);
const nice = (n) => (H().rules(G()).fmtNum || H().niceNum)(Math.round(n));
const fill = (t, ...a) => { let i = 0; return t.replace(/%(\.\*)?[sd]/g, () => String(a[i++])).replace(/%%/g, '%'); };
// a text the interface must not translate (the program's own words, already in the language, or names)
const raw = (tag, t, attrs) => { const e = A().el(tag, attrs || null); e.append(document.createTextNode(t)); e.setAttribute('translate', 'no'); return e; };
// MakeFleetDescription with no count (the lists of designs): "Columbus (1/1) Scout" / "Eclaireur Columbus (1/1)"
const desc0 = (d) => (lang() === 'fr' ? `${cls(d.type)} ${d.name} (${d.W}/${d.S})` : `${d.name} (${d.W}/${d.S}) ${cls(d.type)}`).slice(0, 40);
// (a ruleset without shipsDesc, a later one: the same English form, 1.2's shipsDesc12)
const descN = (d, n) => (lang() === 'fr' ? (n === 1 ? `1 ${cls(d.type)} ${d.name} (${d.W}/${d.S})` : `${n} ${cls(d.type)}s ${d.name} (${d.W}/${d.S})`) : (H().rules(G()).shipsDesc ? H().rules(G()).shipsDesc(G(), d, n) : n === 1 ? `one ${d.name} (${d.W}/${d.S}) ${cls(d.type)}` : `${n} ${d.name} (${d.W}/${d.S}) ${cls(d.type)}s`)).slice(0, 40);
const say = (t) => H().say(G(), t);
const shipCount = (did) => G().fleets.filter(f => f.owner === A().ME).reduce((a, f) => a + (f.ships[did] || 0), 0);
function win(body, cls2) { A().modal('', body, { cls: 'mid mac12 ' + (cls2 || ''), label: 'Spaceward Ho!' }); }
const btn = (t, fn, o) => A().el('button', Object.assign({ onclick: fn }, o || {}), t);

// DLOG 6000 "Modèles existants…" (ListShipTypes @110fc0, InitShipTypesList, DRAWSHIPTYPEPICTURE @1114ae, SetShipTypeAttrs @11153c; 430 x 301,
// DITL 6000 read in 1.2F's resource fork; Jake's capture list-ship-types): the types at the left (3, 3, 137 x 214) as 53-pixel cells, each the
// small picture over "Classe Nom (A/B)", the chosen one inverted, with the list's scroll bar; the chosen type's big picture (149, 3, 243 x 76);
// "Nom du modèle:", "Classe:", the three costs, the five levels in two columns, "Construits:" and "En service:", the check box "Modèle à
// recycler", Renommer (253, 271) and OK. English has no 1.2: 2.0.1's English window (shipTypes20).
const R6000 = { name: [[87, 148, 102, 261], [87, 311, 103, 419]], cls: [[107, 148, 123, 203], [105, 311, 120, 419]],
  costs: [[[132, 148, 148, 309], [132, 311, 148, 415]], [[150, 148, 166, 296], [150, 311, 166, 415]], [[167, 148, 183, 276], [167, 311, 183, 415]]],
  lv: [[[196, 151, 211, 236], [195, 258, 211, 278]], [[215, 151, 231, 206], [215, 258, 231, 279]], [[235, 151, 251, 217], [235, 258, 251, 280]], [[196, 311, 212, 375], [196, 388, 212, 412]], [[215, 311, 231, 365], [215, 388, 231, 414]]],
  built: [[226, 14, 242, 91], [226, 94, 242, 133]], exist: [[246, 14, 262, 87], [246, 94, 262, 133]], chk: [270, 14, 288, 188], ren: [271, 253, 290, 329], ok: [271, 343, 291, 401] };
let L6000 = { top: 0 };
function shipTypes(selId) {
  if (lang() !== 'fr') return shipTypes20(selId);
  const a = A(), el = a.el, g = G(), p = a.me(), rs = H().rules(g);
  const ds = p.designs.filter(d => !d.scrapped).reverse();
  if (!ds.length) return true;
  let cur = ds.find(d => d.id === selId) || ds[0];
  const pane = el('div', { style: 'position:absolute;left:0;top:0;width:430px;height:301px' });
  const picOf = (d) => (a.shipPic ? a.shipPic(d, a.ME) : null);
  const putPic = (q, d, l, t, w, h) => { const im = picOf(d); if (!im || !im.width) return; const k = Math.min(w / im.width, h / im.height), pw = Math.round(im.width * k), ph = Math.round(im.height * k); q.x.imageSmoothingEnabled = false; q.x.drawImage(im, l + Math.round((w - pw) / 2), t + Math.round((h - ph) / 2), pw, ph); };
  const T = (t, r) => { const n = txt20(String(t), r); n.style.overflow = 'visible'; n.style.whiteSpace = 'nowrap'; return n; };
  const show = () => {
    pane.innerHTML = '';
    // the list
    const LW = 137, LH = 214, rows = Math.floor((LH - 2) / 53), maxTop = Math.max(0, ds.length - rows);
    const ci = ds.indexOf(cur); if (ci < L6000.top) L6000.top = ci; if (ci >= L6000.top + rows) L6000.top = ci - rows + 1;
    L6000.top = Math.max(0, Math.min(L6000.top, maxTop));
    const lq = qdCanvas(LW, LH, 'Modèles'); lq.c.style.cssText = at20([3, 3, 3 + LH, 3 + LW]); lq.x.strokeStyle = '#000'; lq.x.strokeRect(0.5, 0.5, LW - 1, LH - 1);
    const lb = el('div', { role: 'listbox', 'aria-label': 'Modèles existants', style: at20([4, 4, 2 + LH, 3 + LW - 16]) });
    ds.slice(L6000.top, L6000.top + rows).forEach((d, i) => {
      const t = 1 + 53 * i; putPic(lq, d, 1, t + 2, LW - 18, 40);
      const lab = desc0(d); lq.text(lab, 0, t + 50, G9, { center: (LW - 16) / 2, cond: lq.width(lab, G9) > LW - 18 });
      if (d === cur) { lq.x.globalCompositeOperation = 'difference'; lq.rect(1, t, LW - 16, t + 53, '#fff'); lq.x.globalCompositeOperation = 'source-over'; }
      lb.append(el('div', { class: 'li', role: 'option', tabindex: 0, 'aria-selected': d === cur ? 'true' : 'false', 'aria-label': lab, style: `position:absolute;left:0;right:0;top:${53 * i}px;height:53px;cursor:default`, onclick: () => { cur = d; show(); } }));
    });
    drawBar(lq.x, LW - 16, 0, true, LH, 16, { on: true, value: L6000.top, max: maxTop });
    lq.c.addEventListener('click', (ev) => { const pt = lq.at(ev); if (pt.h < LW - 16 || !maxTop) return; L6000.top += pt.v < 16 ? -1 : pt.v >= LH - 16 ? 1 : pt.v < LH / 2 ? -rows : rows; show(); });
    lq.c.addEventListener('wheel', (ev) => { if (!maxTop) return; ev.preventDefault(); L6000.top += ev.deltaY > 0 ? 1 : -1; show(); }, { passive: false });
    // the chosen type
    const bq = qdCanvas(243, 76, cur.name); bq.c.style.cssText = at20([3, 149, 79, 392]); putPic(bq, cur, 0, 0, 243, 76);
    const c = H().designCost(g, cur), R = R6000;
    pane.append(lq.c, lb, bq.c, T('Nom du modèle:', R.name[0]), T(cur.name, R.name[1]), T('Classe:', R.cls[0]), T(cls(cur.type), R.cls[1]),
      ...[['Coût de développement:', '$' + nice(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0))], ['Coût de production:', '$' + nice(c.money)], ['Coût en métal:', nice(c.metal)]].flatMap(([l, v], i) => [T(l, R.costs[i][0]), T(v, R.costs[i][1])]),
      ...[['Distance', cur.R], ['Vitesse', cur.V], ['Armes', cur.W], ['Boucliers', cur.S], ['Mini', cur.M]].flatMap(([l, v], i) => [T(l, R.lv[i][0]), T(v, R.lv[i][1])]),
      T('Construits:', R.built[0]), T(nice(cur.built || 0), R.built[1]), T('En service:', R.exist[0]), T(nice(shipCount(cur.id)), R.exist[1]),
      put20(el('label', { class: 'chk', style: 'display:flex;align-items:center;gap:6px' }, el('input', { type: 'checkbox', checked: cur.scrap301 ? 'checked' : false, onchange: (e) => {
        if (rs.flagScrapDesign) { rs.flagScrapDesign(g, p, cur, 'command'); a.save(); show(); return; }
        e.target.checked = false; } }), raw('span', 'Modèle à recycler')), R.chk));
  };
  show();
  const B = (t, r, fn, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
  a.modal('', dlog20(430, 301, pane, B('Renommer', R6000.ren, () => renameType(cur, show)), B('OK', R6000.ok, () => a.closeModal(), true)), { cls: 'mac12 dl20w dlg6010', label: 'Modèles existants' });
  return true;
}
// DLOG 6000 "List Ship Types" (ListShipTypes @111b0c; 430 x 301, DITL 6000): the list of types at (3, 3, 137 x 214), the ship picture at (3, 149, 243 x 76), then the lines at their rectangles: Name (87), Class (107),
// Development / Production / Metal Cost (127, 147, 167) with their values at x 279, Range, Speed, Weapons (195, 215, 235; x 188 and 258) and Shields, Mini (195, 215; x 298 and 358), # Built and #Existing
// (226, 246; x 14 and 94), the Scrap This Type check box (90, 272), Rename (253, 271) and OK (343, 271).
function shipTypes20(selId) {
  const a = A(), el = a.el, p = a.me(), rs = H().rules(G());
  const ds = p.designs.filter(d => !d.scrapped);
  if (!ds.length) return true;
  let cur = ds.find(d => d.id === selId) || ds[ds.length - 1];
  const list = el('div', { class: 'lb', role: 'listbox', style: at20([3, 3, 217, 140]) + ';overflow-y:auto;border:1px solid #000;box-sizing:border-box' }), pane = el('div', { style: 'position:absolute;left:0;top:0;width:430px;height:301px' });
  const T = (t, r, right) => raw('span', String(t), { class: 'dt20', style: at20(r) + (right ? ';text-align:right' : '') });
  const show = () => {
    list.innerHTML = '';
    for (const d of ds.slice().reverse()) list.append(raw('div', desc0(d), { class: 'li' + (d === cur ? ' sel' : ''), role: 'option', onclick: () => { cur = d; show(); } }));
    const c = H().designCost(G(), cur);
    pane.innerHTML = '';
    const pic = a.shipImgEl(cur, 76); pic.setAttribute('style', (pic.getAttribute('style') || '') + ';height:76px;width:auto;max-width:100%;display:block');
    const pbox = el('div', { style: at20([3, 149, 79, 392]) + ';display:flex;justify-content:center;overflow:hidden' }, pic);
    pane.append(pbox, T('Name:', [87, 149, 103, 205]), T(cur.name, [87, 279, 103, 421]), T('Class:', [107, 149, 123, 204]), T(cls(cur.type), [107, 279, 123, 417]),
      T('Development Cost:', [127, 149, 143, 277]), T('$' + nice(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0)), [127, 279, 143, 383]), T('Production Cost:', [147, 149, 163, 277]), T('$' + nice(c.money), [147, 279, 163, 383]),
      T('Metal Cost:', [167, 149, 183, 277]), T(nice(c.metal), [167, 279, 183, 383]),
      T('Range', [195, 188, 211, 235]), T(cur.R, [195, 258, 211, 278]), T('Speed', [215, 188, 231, 235]), T(cur.V, [215, 258, 231, 279]), T('Weapons', [235, 188, 251, 254]), T(cur.W, [235, 258, 251, 280]),
      T('Shields', [195, 298, 211, 352]), T(cur.S, [195, 358, 211, 382]), T('Mini', [215, 298, 231, 352]), T(cur.M, [215, 358, 231, 384]),
      T('# Built:', [226, 14, 242, 86]), T(nice(cur.built || 0), [226, 94, 242, 133]), T('#Existing:', [246, 14, 262, 87]), T(nice(shipCount(cur.id)), [246, 94, 262, 133]),
      put20(CHK, [272, 90, 290, 224]));
  };
  const CHK = el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: cur.scrap301 ? 'checked' : false, onchange: (e) => { if (rs.flagScrapDesign) { rs.flagScrapDesign(G(), p, cur, 'command'); a.save(); show(); return; }
          // (a ruleset that marks nothing, Gemini: scrapped at once, after the question the classic window asks)
          e.target.checked = false; const n = shipCount(cur.id); a.confirmBox(`Scrap this ship type and all ${n} existing ship${n === 1 ? '' : 's'} of it?`, () => { const m = H().scrapDesign(G(), a.ME, cur.id); a.Sound.play(7003); a.toast(`Scrapped 1 type for ${a.fmt(m)} metal.`); a.renderPanel(); a.draw(); a.save(); show(); }); } }), el('span', null, 'Scrap This Type'));
  show();
  a.modal('', dlog20(430, 301, list, pane, put20(el('button', { type: 'button', class: 'ok20', onclick: () => renameType(cur, show) }, raw('span', 'Rename')), [271, 253, 291, 311]),
    put20(el('button', { type: 'button', class: 'ok20', onclick: () => a.closeModal() }, raw('span', 'OK')), [271, 343, 291, 401])), { cls: 'mac12 dl20w', label: 'List Ship Types' });
  return true;
}
const put20 = (n, r) => { n.setAttribute('style', (n.getAttribute('style') || '') + ';' + at20(r) + ';min-width:0;padding:0'); return n; };
// DLOG 6090: a type's new name, 15 letters at most (a beep past them), "Name It" draws one from the list
// DLOG 6090 (doRenameTypeDialog @11170e; 236 x 143, DITL 6090, the same rects in 1.2F and 2.0.1; Jake's captures rename-type*): the line
// (13, 13, 211 x 48), the field (16, 68, 205 x 20; its frame 3 outside), Idée / Name It (13, 104), Annuler (91, 104), OK (156, 104) with the
// default ring; over the List Ship Types window, which shows the new name when it closes. 15 letters at most, a beep past them.
function renameType(d, back) {
  const a = A(), el = a.el, fr = lang() === 'fr';
  const W = fr ? ['Entrez le nouveau nom du vaisseau ou cliquez sur Idée:', 'Idée', 'Annuler', 'OK'] : ['Type your new ship name or click on “Name It” for a suggestion:', 'Name It', 'Cancel', 'OK'];
  const close = (ok) => { if (ok) { const n = inp.value.trim(); if (n) { d.name = n.slice(0, 15); a.save(); a.renderPanel(); } } scr.remove(); if (back) back(); };
  const inp = el('input', { type: 'text', maxlength: 15, value: d.name, 'aria-label': W[0], style: at20([65, 13, 91, 224]),
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); close(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); } else if (e.key.length === 1 && inp.value.length >= 15 && inp.selectionStart === inp.selectionEnd && a.beep) a.beep(); } });
  inp.setAttribute('translate', 'no');
  const B = (t, r, fn, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
  const txt = txt20(W[0], [13, 13, 61, 224]); txt.style.whiteSpace = 'normal';
  const scr = el('div', { class: 'scrim' }, el('div', { class: 'win small notitle mac12 dl20w dlg6010 ct6010', role: 'dialog', 'aria-modal': 'true', 'aria-label': W[0] },
    dlog20(236, 143, txt, inp, B(W[1], [104, 13, 124, 71], () => { inp.value = H().designName(G(), a.me(), d.type); inp.focus(); }), B(W[2], [104, 91, 124, 149], () => close(false)), B(W[3], [104, 156, 124, 214], () => close(true), true))));
  document.body.append(scr); inp.focus(); inp.select();
}

// DLOG 6030 "List All Fleets…" (ListAllFleets @1120dc, InitFleetsList @1123a0): every fleet of yours but satellites, one line each
// (STR# 4000.24-27 / Mac 2.0.1's literals), the fleets that are stuck last; "Go To Fleet" selects it (ALRT 3290 in hyperspace)
const FLEET_LINES = {
  en: { at: '%s stationed at %s.', leave: '%s leaving %s for %s to arrive in %d.', fly: '%s to arrive at %s in %d.', stuck: '%s marooned at %s.',
    hyper: 'Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location.' },
  fr: { at: '%s en orbite à %s.', leave: '%s quittant %s pour %s. Prévision: %d.', fly: '%s arrivant à %s en %d.', stuck: '%s en panne sèche à %s.',
    hyper: 'Désolé, mais cette flotte est actuellement en hyperespace et ne pourra être contactée qu\'arrivée à destination.' },
};
function stuck(f) {
  if (f.star == null || G().stars[f.star].owner === A().ME) return false;
  return !G().stars.some(s => s.id !== f.star && H().starDist(G(), f.star, s.id) <= f.fuel + 1e-9);
}
function fleetsStatus() {
  const a = A(), W = FLEET_LINES[lang()], g = G();
  const fs = g.fleets.filter(f => f.owner === a.ME && !f.sat);
  const order = fs.filter(f => !stuck(f)).concat(fs.filter(stuck));
  const turns = (f) => Math.ceil((f.dist - (f.prog || 0)) / H().fleetSpeed(g, f) - 1e-9);
  const line = (f) => {
    const d = H().fleetText(g, f), st = (i) => g.stars[i].name;
    if (stuck(f)) return fill(W.stuck, d, st(f.star));
    if (f.to != null) return fill(W.fly, d, st(f.to), H().arrivalYear(g, turns(f)));
    if (f.dest != null) return fill(W.leave, d, st(f.star), st(f.dest), H().arrivalYear(g, Math.ceil(H().starDist(g, f.star, f.dest) / H().fleetSpeed(g, f) - 1e-9)));
    return fill(W.at, d, st(f.star));
  };
  let cur = order[0] || null;
  function go() {
    if (!cur) return;
    if (cur.to != null) { alertBox([W.hyper]); return; }
    a.UI.selFleet = cur.id; a.UI.sel = cur.star; a.closeModal(); a.centerOn(cur.star); a.renderPanel(); a.draw();
  }
  const fr = lang() === 'fr';
  return list6030(fr ? 'Statut des flottes:' : 'List of All Fleets:', order.map(f => ({ id: f, cells: [[0, line(f)]] })), fr ? 'Rejoindre flotte' : 'Go To Fleet',
    (f) => { cur = f; go(); }, { head: fr ? [5, 12, 24, 210] : [2, 13, 18, 200], go: fr ? [264, 238, 283, 352] : [264, 255, 284, 352], first: true }); // (the first fleet chosen when it opens: Jake's capture)
}
// DLOG 6030 and 6040 (ListAllFleets @1120dc, ListExploredStars @120004; 486 x 296, DITL 6030 / 6040: the line at (12, 5) / (13, 2), the list user item
// (13, 26, 455 x 225), "Rejoindre flotte" (238, 264, 114 x 19) / "Rejoindre planète" (229, 264, 124 x 19), OK (364, 264, 82 x 20) with the default ring):
// a List Manager list in Chicago 12, 16 pixels a row, the text a pixel in from the cell, the fields at 1, 101, 176, 251, 326 (Jake's shot078, read
// pixel by pixel: the frame at the window's 90, 60), its 16-pixel scroll bar inside the frame at the right, the chosen row inverted (the explored
// stars open with the first chosen, shot078); a double click is the button. rows: [{ id, cells: [[x, text]] }]
function list6030(title, rows, goWord, onGo, o) {
  const a = A(), el = a.el, LW = 455, LH = 226, n = Math.floor((LH - 2) / 16);
  let pick = o.first && rows.length ? 0 : -1, top = 0;
  const lq = qdCanvas(LW, LH, title), lb = el('div', { role: 'listbox', 'aria-label': title, style: at20([27, 14, 25 + LH, 13 + LW - 16]) });
  const draw = () => {
    top = Math.max(0, Math.min(top, rows.length - n));
    lq.rect(0, 0, LW, LH, '#fff'); lq.x.strokeStyle = '#000'; lq.x.lineWidth = 1; lq.x.strokeRect(0.5, 0.5, LW - 1, LH - 1);
    lq.x.save(); lq.x.beginPath(); lq.x.rect(1, 1, LW - 17, LH - 2); lq.x.clip();
    lb.innerHTML = '';
    rows.slice(top, top + n).forEach((r, i) => {
      const y = 1 + 16 * i;
      r.cells.forEach(([cx, t]) => lq.text(t, 1 + cx, y + 13, SYS12));
      if (top + i === pick) { lq.x.globalCompositeOperation = 'difference'; lq.rect(1, y, LW - 16, y + 16, '#fff'); lq.x.globalCompositeOperation = 'source-over'; }
      const k = top + i;
      lb.append(el('div', { class: 'li', role: 'option', tabindex: 0, 'aria-selected': k === pick ? 'true' : 'false', 'aria-label': r.cells.map(c => c[1]).join(' '),
        style: `position:absolute;left:0;right:0;top:${16 * i}px;height:16px;cursor:default`,
        onclick: dbl12('l' + k, () => { pick = k; draw(); }, () => { pick = k; onGo(rows[k].id); }), onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); pick = k; onGo(rows[k].id); } } }));
    });
    lq.x.restore();
    drawBar(lq.x, LW - 16, 0, true, LH, 16, { on: true, value: top, max: Math.max(0, rows.length - n) });
  };
  lq.c.style.cssText = at20([26, 13, 26 + LH, 13 + LW]);
  lq.c.addEventListener('click', (ev) => { const pt = lq.at(ev); if (pt.h < LW - 16 || rows.length <= n) return; top += pt.v < 16 ? -1 : pt.v >= LH - 16 ? 1 : pt.v < LH / 2 ? -(n - 1) : n - 1; draw(); });
  lq.c.addEventListener('wheel', (ev) => { if (rows.length <= n) return; ev.preventDefault(); top += ev.deltaY > 0 ? 1 : -1; draw(); }, { passive: false });
  draw();
  const B = (t, r, fn, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
  const head = txt20(title, o.head); head.style.overflow = 'visible'; head.style.whiteSpace = 'nowrap';
  a.modal('', dlog20(486, 296, head, lq.c, lb, B(goWord, o.go, () => { if (pick >= 0) onGo(rows[pick].id); }), B('OK', [264, 364, 284, 446], () => a.closeModal(), true)), { cls: 'mac12 dl20w dlg6010', label: title });
  return true;
}
// the explored stars (ListExploredStars @120004, DITL 6040; rs.exploredList and the classic code's exploredData: 1.2's order and its words)
function stars6040() {
  const a = A(), X = a.exploredData ? a.exploredData() : null; if (!X) return false;
  const L = X.L, rows = X.plain().map(s => { const c = X.climate(s), cells = [[0, s.name]];
    if (c) cells.push([100, c.t], [175, c.g], [250, c.m]); else cells.push([100, L.noClimate]);
    cells.push([325, X.status(s)]); return { id: s.id, cells }; });
  const fr = lang() === 'fr';
  return list6030(L.title, rows, L.go, (sid) => { a.closeModal(); a.UI.sel = sid; a.centerOn(sid); a.renderPanel(); a.draw(); },
    { head: fr ? [2, 13, 22, 299] : [2, 13, 18, 300], go: fr ? [264, 229, 283, 353] : [264, 255, 284, 352], first: true });
}
// an alert over what is open (the dialog stays under it), in the program's words; its picture 3020 is the skin's
// Mac 2.0.1's alerts (ALRT size and DITL: text, picture and button rectangles, from the resource fork; made by audit/mac-2.0.1 of the private repo): an alert is drawn at those rectangles,
// the words being the paragraphs the page gives (the same lines) in the order of the DITL's text items
if (window.HOMAC2_COLOUR || (V3 && COLOUR3)) document.documentElement.classList.add('col20'); // (the colour Mac's bevelled dialog frame: panel.css, html.col20; 3.0.1's too, Jake's captures 015, 018)
const ALERTS20 = {"128":[432,160,[["b",[123,312,143,402],"OK"],["t",[13,84,45,406],"Sorry ^0 requires the follow things to be able to run:"],["t",[58,110,74,380],"• ^1 CPU or better"],["t",[74,110,90,380],"• System Software ^2 or later"],["t",[90,110,106,380],"• ^3"]]],"2000":[230,172,[["b",[143,91,163,220],"Return To Finder"],["t",[26,26,128,224],"Sorry, but this is a development version of Spaceward Ho! 2.0 that's past it's prime. To get a newer copy, call Delta Tao Software, Inc. at (408) 730-9336."]]],"2010":[282,200,[["b",[169,156,189,253],"Play in B/W"],["p",[117,26,191,100],3010],["t",[13,13,48,279],"Sorry, but Spaceward Ho! 2.0 requires 32-bit Color Quickdraw to run in color."],["t",[52,13,106,278],"You can obtain Color Quickdraw from any Apple dealer for a nominal charge."]]],"3000":[240,228,[["b",[195,169,215,227],"OK"],["t",[39,26,71,227],"^0"],["t",[117,26,149,226],"File: ^1"],["t",[78,26,110,227],"Error Type: ^2"],["t",[156,26,172,225],"Error Code: ^3"],["t",[13,91,29,166],"File Error"]]],"3001":[237,210,[["b",[182,169,202,227],"OK"],["t",[39,26,71,227],"^0"],["t",[78,26,110,227],"Error Type: ^2"],["t",[117,26,133,225],"Error Code: ^3"],["t",[13,78,30,200],"Memory Error"],["t",[143,26,175,226],"Please quit Spaceward Ho! and start again."]]],"3010":[235,159,[["b",[130,169,150,227],"OK"],["p",[78,13,152,87],3020],["t",[13,13,65,229],"Sorry, but that is not the correct password for “^0”. Please try again."]]],"3020":[240,149,[["b",[117,169,137,227],"OK"],["t",[13,13,48,236],"Sorry, but this galaxy is already full. No more players can join."],["p",[65,13,139,87],3020]]],"3030":[232,180,[["b",[143,156,163,214],"OK"],["p",[91,26,165,100],3010],["t",[13,26,77,223],"Sorry, but Spaceward Ho! 2.0 can't read galaxy files created with versions 1.0 - 1.1.2."]]],"3040":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,49,212],"Please name your new ship type."],["p",[60,10,134,84],3020]]],"3050":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,49,212],"Please set your new ship type’s tech levels."],["p",[60,10,134,84],3020]]],"3060":[301,206,[["b",[162,207,182,265],"OK"],["t",[13,13,80,290],"Sorry, but the name you just typed in doesn’t match any of those in this game. And since the game has  progressed past the year 2000, it’s too late to join…"],["p",[120,17,194,91],3020],["t",[92,13,112,284],"Maybe you typed your name in wrong?"]]],"3070":[335,210,[["b",[143,223,163,292],"Continue"],["b",[143,117,163,186],"Wait"],["p",[117,13,191,87],3020],["t",[13,13,46,327],"^0, all of the ^1 currently registered players have finished their first turn. "],["t",[52,13,92,328],"Should we continue with the game, or wait for more human players to join?"]]],"3080":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,98,232],"All currently registered players have ended their first turn. We’re waiting for the game administrator to give his okay to continue…"]]],"3090":[236,132,[["t",[10,14,74,223],"^0’s Star System “^1” has had a revolution, and is now under your control."],["b",[100,157,120,215],"OK"]]],"3100":[236,132,[["t",[10,14,74,223],"^0 has offerred ^1 units of metal for ^2 dollars."],["b",[100,157,120,215],"OK"]]],"3110":[236,132,[["t",[10,14,74,223],"You have found an additional ^0 units of metal on ^0."],["b",[100,157,120,215],"OK"]]],"3120":[236,132,[["t",[10,14,74,223],"Your fleet of ^0 ^1 unexpectedly disappeared in hyperspace on their way to ^2."],["b",[100,157,120,215],"OK"]]],"3130":[236,132,[["t",[10,14,74,223],"^0 has gone nova.  Everything there has been destroyed."],["b",[100,157,120,215],"OK"]]],"3140":[236,132,[["t",[10,14,74,223],"Your Terraforming Technology has reached level ^0."],["b",[100,157,120,215],"OK"]]],"3150":[236,132,[["t",[10,14,74,223],"^0 has turned all his planets over to your control.  "],["b",[100,157,120,215],"OK"]]],"3160":[236,132,[["t",[10,14,74,223],"You have destroyed the Star System ^0, previously owned by ^1."],["b",[100,157,120,215],"OK"]]],"3170":[236,132,[["t",[10,14,74,223],"You have stolen ^0 Technology from ^1.  Your Tech level is now ^2."],["b",[100,157,120,215],"OK"]]],"3180":[233,177,[["b",[143,143,163,210],"OK"],["t",[13,13,84,224],"Sorry, your turn can’t be saved. Although you are in the year ^0, the game has already been updated to ^1…"],["p",[91,13,165,87],3020]]],"3190":[237,161,[["b",[104,156,124,214],"OK"],["p",[65,26,139,100],3020],["t",[13,26,66,224],"The game has been updated to the year ^0. Click “OK” to go to the next turn…"]]],"3200":[234,185,[["b",[143,156,163,214],"OK"],["t",[13,13,93,232],"Sorry, but the file was busy and your new auto play setting was not changed. Please try again shortly."],["p",[104,13,178,87],3020]]],"3210":[335,210,[["b",[143,222,163,299],"Force End"],["b",[143,117,163,194],"Wait"],["p",[117,13,191,87],3020],["t",[13,13,46,327],"^0, ^1 of the ^2 players haven’t finished their turn yet. "],["t",[52,13,92,328],"Do you really want to force an end of turn, or do you want to wait for them to finish?"]]],"3220":[238,201,[["b",[154,156,174,214],"OK"],["p",[102,26,176,100],3020],["t",[13,26,84,230],"Sorry, but the file way busy and the turn could not be marked “done”. Please try again in a moment."]]],"3230":[286,190,[["b",[145,188,165,257],"Continue"],["b",[145,110,165,168],"Wait"],["p",[99,13,173,87],3020],["t",[13,13,52,268],"^0, do you want to play alone, or wait for more humans to join?"],["t",[64,13,84,264],"(Computer Opponents: ^1)"]]],"3240":[230,182,[["b",[125,156,145,214],"OK"],["t",[13,13,80,220],"Auto play has been turned off, but your current turn has already been marked “done.” Update may occur at any time."],["p",[86,13,160,87],3020]]],"3250":[216,137,[["b",[78,143,98,201],"OK"],["t",[13,26,45,211],"Please unlock this disk and try again."],["p",[52,26,126,100],3020]]],"3260":[228,159,[["b",[117,156,137,214],"OK"],["t",[13,13,65,222],"Please enter both your name and a company name or address."],["p",[65,13,139,87],3020]]],"3270":[227,184,[["b",[156,156,176,214],"OK"],["t",[13,13,102,223],"The game has been updated to the next turn. You made some changes since ending your turn that you didn’t save. These changes have now been lost."],["p",[104,13,178,87],3020]]],"3280":[329,258,[["b",[208,182,228,240],"OK"],["p",[182,26,256,100],3020],["t",[13,26,49,320],"Sorry, but Spaceward Ho! allows you to have only 20 ship types at one time. "],["t",[52,26,119,320],"If you would like to create another ship type, scrap an old type by checking the “Scrap” box for it in the “List Ship Types…” Dialog."],["t",[130,26,178,325],"The ship will be scrapped during the turn update and you can create a new type next turn…"]]],"3290":[231,174,[["b",[143,156,163,214],"OK"],["t",[13,13,81,227],"Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location."],["p",[91,13,165,87],3020]]],"3300":[240,200,[["b",[156,156,176,214],"OK"],["t",[13,13,46,223],"There are no colonists aboard that colony ship."],["p",[117,26,191,100],3020],["t",[56,14,106,223],"To refill it, you must either wait one turn or abandon the colony."]]],"3310":[259,249,[["b",[192,156,212,214],"OK"],["t",[14,13,68,252],"Sorry, but the battle information on that battle is no longer available."],["p",[140,13,214,87],3020],["t",[70,13,134,251],"Battle reports that are more that 500 years old are automatically deleted to keep the game file size small."]]],"3320":[235,192,[["b",[156,156,176,214],"OK"],["t",[13,13,98,224],"Sorry, but the game file was busy, and the battle information could not be read for this battle. Please try again in a moment."],["p",[104,13,178,87],3020]]],"3330":[240,200,[["b",[171,156,191,214],"OK"],["p",[119,13,193,87],3020],["t",[13,13,61,234],"Sorry, but that fleet doesn’t have enough fuel to reach the selected destination. "],["t",[67,13,117,234],"You can tell this because there are no arrows on either end of the dragged line."]]],"3340":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,82,228],"Sorry, there’s already a star named  “^0.” Please pick another name."]]],"5000":[325,140,[["b",[104,247,124,305],"Save"],["b",[104,26,124,98],"Don't Save"],["b",[104,156,124,214],"Cancel"],["t",[13,78,86,306],"^0, do you want to save the changes you've made before closing the current game?"]]],"5010":[240,200,[["b",[156,156,176,214],"OK"],["p",[117,13,191,87],3020],["t",[13,13,107,230],"^0^1^2^3"]]],"5020":[325,140,[["b",[104,247,124,305],"Save"],["b",[104,78,124,150],"Don't Save"],["b",[200,200,220,258],"Cancel"],["t",[13,78,86,306],"^0, do you want to save the changes you've made before updating the turn?"]]],"5030":[305,234,[["b",[195,234,215,292],"OK"],["t",[13,13,99,297],"Oops! Something kinda funny has happened in TheHo 2.0. Please write down the following problem with as much information as you can on what you think led up to it. Then let us know. Thanks."],["t",[104,13,185,295],"^0^1^2^3"]]],"5040":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Congratulations! You have conquered the galaxy!"],["p",[52,39,203,188],3030]]],"5041":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Congratulations! You have conquered the galaxy!"],["p",[52,39,203,188],3530]]],"5050":[235,244,[["b",[212,78,232,149],"Oh, well…"],["p",[52,39,203,188],3040],["t",[13,13,47,222],"Unfortunately, you have been eliminated from the game…"]]],"5051":[235,244,[["b",[212,78,232,149],"Oh, well…"],["p",[52,39,204,188],3540],["t",[13,13,47,222],"Unfortunately, you have been eliminated from the game…"]]],"5060":[282,177,[["b",[143,193,163,272],"Let ’em Die"],["b",[143,104,163,181],"Cancel"],["p",[91,13,165,87],3020],["t",[13,13,83,263],"Warning! You are not spending enough money to support some of your colonies. Do you really want to abandon them?"]]],"5070":[232,153,[["b",[104,156,124,214],"OK"],["t",[13,13,64,224],"Sorry, but the file was busy. Please try again in a few seconds."],["p",[65,13,139,87],3020]]],"5080":[262,153,[["b",[104,182,124,240],"Revert"],["b",[104,117,124,175],"Cancel"],["p",[65,13,139,87],3020],["t",[13,13,62,254],"Do you really want to revert to the saved version of the game? All changes will be lost…"]]],"5090":[228,191,[["b",[143,143,163,201],"OK"],["p",[104,13,178,87],3020],["t",[13,13,72,219],"Sorry, but this game was created with a newer version of Spaceward Ho! "]]]};
// 1.2F's own alerts (ALRT and DITL from its resource fork: size, items' rectangles, French words, pictures), for the 1.2 skin in French: the
// abandon question (5060 "Qu'elles meurent!"), "Merci de baptiser…" (3040), eliminated (5050), as Jake's captures 025, 081 and 165 show them.
// English, which 1.2 never had, takes 2.0.1's (ALERTS20).
const ALERTS12 = {"128":[432,160,[["b",[123,312,143,402],"OK"],["t",[13,84,45,406],"Désolé, ^0 requiert les éléments suivants:"],["t",[58,110,74,380],"• ^1 CPU ou davantage"],["t",[74,110,90,380],"• System ^2 ou plus"],["t",[90,110,106,380],"• ^3"]]],"2000":[230,172,[["b",[143,91,163,220],"Return To Finder"],["t",[26,26,128,224],"Sorry, but this is a development version of Spaceward Ho! 2.0 that's past it's prime. To get a newer copy, call Delta Tao Software, Inc. at (408) 730-9336."]]],"3000":[240,228,[["b",[195,169,215,227],"OK"],["t",[39,26,71,227],"^0"],["t",[117,26,149,226],"Fichier: ^1"],["t",[78,26,110,227],"Type erreur: ^2"],["t",[156,26,172,225],"Code erreur: ^3"],["t",[13,77,28,175],"Erreur Fichier"]]],"3001":[237,210,[["b",[182,169,202,227],"OK"],["t",[39,26,71,227],"^0"],["t",[78,26,110,227],"Type erreur: ^2"],["t",[117,26,133,225],"Code erreur: ^3"],["t",[13,78,30,200],"Erreur mémoire"],["t",[143,26,175,226],"Merci de quitter Spaceward Ho! et de recommencer."]]],"3010":[235,159,[["b",[130,169,150,227],"OK"],["p",[78,13,152,87],3020],["t",[12,12,64,228],"Désolé, mais ce n'est pas le bon mot de passe pour “^0”. Merci de réessayer."]]],"3020":[240,149,[["b",[117,169,137,227],"OK"],["t",[13,13,67,237],"Désolée mais cette Galaxie est complète. Aucun Joueur supplémentaire n'est admis."],["p",[65,13,139,87],3020]]],"3030":[232,180,[["b",[143,156,163,214],"OK"],["p",[91,26,165,100],3010],["t",[13,26,77,223],"Désolé, mais Spaceward Ho! 2.0 ne peut lire les fichiers créés avec les versions 1.0 - 1.1.2."]]],"3040":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,49,212],"Merci de baptiser votre nouveau modèle de vaisseau."],["p",[60,10,134,84],3020]]],"3050":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,59,212],"Merci d'affecter un minimum technologique à votre nouveau modèle."],["p",[60,10,134,84],3020]]],"3060":[301,206,[["b",[162,207,182,265],"OK"],["t",[13,13,80,290],"Désolé, mais le nom que vous venez de taper ne correspond pas à ceux qui sont prévus pour ce jeu. Il est désormais trop tard pour y participer."],["p",[120,17,194,91],3020],["t",[92,13,112,284],"Aviez-vous fait une fraute de fappe?"]]],"3070":[335,210,[["b",[143,223,163,292],"Continuer"],["b",[143,117,163,186],"Attendre"],["p",[117,13,191,87],3020],["t",[14,13,47,327],"^0, tous les Joueurs enregistrés (^1) ont fini leur premier tour. "],["t",[52,13,92,328],"Devons nous continuer le jeu, ou attendre l'arrivée d'autres Joueurs humains?"]]],"3080":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,98,232],"Psst! Tous mes Joueurs enregistrés ont fini leur premier tour. J'attends l'accord de l'administrateur du Jeu pour continuer."]]],"3090":[236,132,[["t",[9,14,73,223],"Le système  “^1” de ^0 vient de se révolter et se trouve maintenant sous votre contrôle."],["b",[100,157,120,215],"OK"]]],"3100":[236,132,[["t",[10,14,74,223],"^0 a proposé ^1 unités de métal pour ^2 dollars galactiques."],["b",[100,157,120,215],"OK"]]],"3110":[236,132,[["t",[10,14,74,223],"Vous avez trouvé ^0 unités de métal supplémentaires sur ^0."],["b",[100,157,120,215],"OK"]]],"3120":[236,132,[["t",[9,13,73,222],"Votre flotte ^0 ^1 a bizarrement disparu dans l'hyperespace sur la route de ^2."],["b",[100,157,120,215],"OK"]]],"3130":[236,132,[["t",[10,14,74,223],"^0 s'est transformée en nova.  Tout y a été détruit."],["b",[100,157,120,215],"OK"]]],"3140":[236,132,[["t",[10,14,74,223],"Votre technologie de terraformatage a atteint le niveau ^0."],["b",[100,157,120,215],"OK"]]],"3150":[236,132,[["t",[10,14,74,223],"^0 a placé l'ensemble de ses planètes sous votre contrôle.  "],["b",[100,157,120,215],"OK"]]],"3160":[236,132,[["t",[10,14,74,223],"Vous avez détruit le système ^0, jusqu'à présent contrôlé par ^1."],["b",[100,157,120,215],"OK"]]],"3170":[236,132,[["t",[10,14,74,223],"Vous avez volé la technologie ^0 de ^1.  Votre niveau de technologie est maintenant de ^2."],["b",[100,157,120,215],"OK"]]],"3180":[233,177,[["b",[143,143,163,210],"OK"],["t",[13,13,84,224],"Désolé, votre tour ne peut être sauvé. Bien que vous soyez en année ^0, le Jeu a déjà été mis à jour vers l'année ^1…"],["p",[91,13,165,87],3020]]],"3190":[237,161,[["b",[104,156,124,214],"OK"],["p",[65,26,139,100],3020],["t",[13,26,66,224],"Le jeu a été mis à jour vers l'année ^0. Cliquez sur “OK” pour le prochain tour…"]]],"3200":[234,185,[["b",[143,156,163,214],"OK"],["t",[13,13,93,232],"Désolé, mais le fichier était en service et votre nouveau réglage de jeu automatique n'a pas été pris en compte. Réessayez sous peu."],["p",[104,13,178,87],3020]]],"3210":[335,210,[["b",[143,222,163,299],"Fin du tour"],["b",[143,117,163,194],"Attendre"],["p",[117,13,191,87],3020],["t",[13,13,46,327],"^0,  des Joueurs (^1 sur ^2) n'ont pas encore fini leur tour. "],["t",[52,13,92,328],"Voulez-vous vraiment forcer la fin du tour, ou voulez-vous attendre qu'ils aient fini?"]]],"3220":[238,201,[["b",[154,156,174,214],"OK"],["p",[102,26,176,100],3020],["t",[13,26,84,230],"Désolé, le fichier était en service et le tour n'a pu être marqué \"fini\". Merci de réessayer dans un instant."]]],"3230":[286,190,[["b",[145,188,165,257],"Continuer"],["b",[145,110,165,174],"Attendre"],["p",[99,13,173,87],3020],["t",[12,13,64,269],"^0, voulez-vous jouer seul, ou attendre que d'autres Humains arrivent?"],["t",[64,13,84,264],"(Joueurs de Silicium: ^1)"]]],"3240":[230,182,[["b",[125,156,145,214],"OK"],["t",[4,13,88,218],"Le jeu automatique est arrêté mais votre tour a déjà été marqué \"fini\". La mise à jour va se produire n'importe quand."],["p",[86,13,160,87],3020]]],"3250":[216,137,[["b",[78,143,98,201],"OK"],["t",[13,26,45,211],"Merci de déverrouiller ce disque et de recommencer."],["p",[52,26,126,100],3020]]],"3260":[228,159,[["b",[117,156,137,214],"OK"],["t",[13,13,65,222],"Merci d'entrer non seulement votre nom mais aussi votre adresse."],["p",[65,13,139,87],3020]]],"3270":[227,184,[["b",[156,156,176,214],"OK"],["t",[13,13,102,223],"Le jeu a été mis à jour vers le nouveau tour. Depuis la fin de votre tour vous avez fait des modifications. Elles n'ont pas été sauvées."],["p",[104,13,178,87],3020]]],"3280":[329,258,[["b",[208,182,228,240],"OK"],["p",[182,26,256,100],3020],["t",[13,26,61,320],"Désolé, mais Spaceward Ho! vous autorise seulement 20 modèles de vaisseaux simultanés. "],["t",[64,26,117,318],"Pour créer ce nouveau modèle, recyclez-en d'abord un ancien en cochant la case correspondante de la boîte de dialogue."],["t",[130,26,178,325],"Ce modèle sera détruit lors de la mise à jour du tour, et vous pourrez en créer un autre au prochain tour."]]],"3290":[231,174,[["b",[143,156,163,214],"OK"],["t",[13,13,81,227],"Désolé, mais cette flotte est actuellement en hyperespace et ne pourra être contactée qu'arrivée à destination."],["p",[91,13,165,87],3020]]],"3300":[240,200,[["b",[156,156,176,214],"OK"],["t",[9,13,42,223],"Il n'y a pas de colons sur ce Transport.\r"],["p",[117,26,191,100],3020],["t",[41,13,120,222],"Si vous confirmez votre départ, ceux qui ont débarqué seront récupérés et vous abandonnerez cette planète.\rOu alors attendez un tour..."]]],"3310":[259,249,[["b",[192,156,212,214],"OK"],["t",[14,13,68,252],"Désolé mais il n'y a plus d'informations disponibles sur cette bataille."],["p",[140,13,214,87],3020],["t",[70,13,134,251],"Les rapports de batailles de plus de 500 ans ne sont pas conservés."]]],"3320":[235,192,[["b",[156,156,176,214],"OK"],["t",[13,13,98,224],"Désolé, mais j'étais occupé, et je n'ai pu vous fournir cette information. Soyez assez aimable pour me redemander ça dans un instant."],["p",[104,13,178,87],3020]]],"3330":[240,200,[["b",[171,156,191,214],"OK"],["p",[119,13,193,87],3020],["t",[13,13,61,234],"Désolé, mais cette flotte ne dispose pas d'assez de carburant pour atteindre cette destination."],["t",[61,14,122,233],"Soit dit en passant, il suffisait d'observer l'absence de flèche aux extrémités du trajet..."]]],"3340":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,82,228],"Désolé, il y a déjà une Etoile nommée “^0.” Soyons créatifs!"]]],"3350":[240,178,[["b",[143,169,163,227],"OK"],["b",[143,91,163,149],"Annuler"],["t",[13,13,84,231],"Le Jeu que vous venez d'ouvrir a été créé par une version antérieure de Spaceward Ho! Voulez-vous le mettre à niveau?"],["p",[91,13,165,87],3020]]],"3370":[240,200,[["b",[156,169,176,227],"OK"],["t",[13,13,63,229],"Sorry, but this version of Spaceward Ho! is for up to two human players."],["t",[78,13,113,229],"Contact us to get the upgraded 20 player version, if you’d like."]]],"5000":[325,140,[["b",[104,226,124,315],"Enregistrer"],["b",[105,10,124,143],"Ne pas enregistrer"],["b",[105,156,124,214],"Annuler"],["t",[13,78,86,306],"^0, voulez-vous enregistrer les changements effectués avant de clore cette partie?"]]],"5010":[240,200,[["b",[156,156,176,214],"OK"],["p",[117,13,191,87],3020],["t",[13,13,107,230],"^0^1^2^3"]]],"5020":[325,140,[["b",[104,216,124,311],"Enregistrer"],["b",[104,78,124,208],"Ne pas enregistrer"],["b",[200,200,220,258],"Cancel"],["t",[13,78,86,306],"^0, voulez-vous enregistrer les changements effectués avant de mettre à jour le tour?"]]],"5030":[305,234,[["b",[195,234,215,292],"OK"],["t",[13,13,99,297],"Oops! Quelque d'imprévu vient de se produire dans The Ho 2.0. Merci de nous décrire le problème en nous fournissant le maximum d'information sur les circonstances de l'accident."],["t",[104,13,185,295],"^0^1^2^3"]]],"5040":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Bravo, vous venez de conquérir la Galaxie!"],["p",[52,39,203,188],3030]]],"5041":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Bravo, vous venez de conquérir la galaxie!"],["p",[52,39,203,188],3530]]],"5050":[235,244,[["b",[212,72,232,163],"Bon, ça va…"],["p",[52,39,203,188],3040],["t",[13,13,47,222],"Il est regrettable que vous ayez été éliminé…"]]],"5051":[235,244,[["b",[212,67,232,158],"Bon, ça va..."],["p",[52,39,204,188],3540],["t",[13,13,47,222],"Il est regrettable que vous ayez été éliminé..."]]],"5060":[282,177,[["b",[142,158,163,279],"Qu'elles meurent!"],["b",[143,89,162,150],"Annuler"],["p",[91,13,165,87],3020],["t",[13,13,83,263],"Attention, vous n'investissez pas assez pour soutenir vos colonies. Voulez-vous vraiment les abandonner?"]]],"5070":[232,153,[["b",[104,156,124,214],"OK"],["t",[13,13,64,224],"Désolé, le fichier était en service. Merci de recommencer dans un instant."],["p",[65,13,139,87],3020]]],"5080":[262,153,[["b",[103,171,124,245],"Retourner"],["b",[104,98,124,156],"Annuler"],["p",[65,13,139,87],3020],["t",[5,13,67,257],"Voulez-vous vraiment retourner à une version antérieure du jeu? Toutes les modifications seront perdues."]]],"5090":[228,191,[["b",[143,143,163,201],"OK"],["p",[104,13,178,87],3020],["t",[13,13,83,221],"Désolé, mais ce jeu a été créé avec une version de Spaceward HO que je ne connais pas encore."]]]};
const alertTables = () => (!V2 && lang() === 'fr' ? [ALERTS12, ALERTS20] : [ALERTS20]);
// (a box of ALERTS20 by its id, with its own words: the won and lost boxes, ALRT 5040 / 5041 and 5050 / 5051, in the captures `shot103`-`105`, `lost027`)
function alertById20(id, paras, ok, done) {
  const [w, h, items] = alertTables().map(T => T[id]).find(Boolean), a = A(), el = a.el; let ti = 0;
  const close = () => { back.remove(); if (done) done(); };
  const kids = items.map(it => {
    if (it[0] === 't') return raw('span', paras[ti++], { class: 'dt20', style: at20(it[1]) + ';white-space:pre-line' });
    if (it[0] === 'p') { const im = a.IMG['dos:p' + it[2]]; return im ? el('img', { src: im.src, alt: '', style: at20(it[1]) + ';image-rendering:pixelated' }) : null; }
    return el('button', { type: 'button', class: 'ok20' + (it === items.find(x => x[0] === 'b') ? ' def20' : ''), style: at20(it[1]) + ';min-width:0;padding:0', onclick: close }, raw('span', ok || it[2]));
  });
  const back = el('div', { class: 'scrim', onkeydown: (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.stopPropagation(); close(); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': paras[0] }, dlog20(w, h, ...kids)));
  document.body.append(back); const b = back.querySelector('button'); if (b) b.focus();
  return back;
}
function alert20(paras) {
  const norm = (t) => String(t).replace(/[‘’“”]/g, "'").replace(/\s+/g, ' ').replace(/\^\d|%[sd]/g, '').trim();
  const p0 = norm(paras[0]); if (p0.length < 8) return null;
  const common = (x) => { let i = 0; while (i < x.length && i < p0.length && x[i] === p0[i]) i++; return i; };
  let id = null, best = 17, TB = null;
  for (const T of alertTables()) for (const k of Object.keys(T)) { const t = T[k][2].find(x => x[0] === 't'); const c = t ? common(norm(t[2])) : 0; if (c > best) { best = c; id = k; TB = T; } }
  if (!id) return null;
  const [w, h, items] = TB[id], a = A(), el = a.el; let ti = 0;
  const done = () => back.remove();
  const kids = items.map(it => {
    if (it[0] === 't') return raw('span', paras[ti] != null && items.filter(x => x[0] === 't').length === paras.length ? paras[ti++] : (ti++, it[2]), { class: 'dt20', style: at20(it[1]) + ';white-space:pre-line' });
    if (it[0] === 'p') { const im = a.IMG['dos:p' + it[2]]; return im ? el('img', { src: im.src, alt: '', style: at20(it[1]) + ';image-rendering:pixelated' }) : null; }
    return el('button', { type: 'button', class: 'ok20' + (it === items.find(x => x[0] === 'b') ? ' def20' : ''), style: at20(it[1]) + ';min-width:0;padding:0', onclick: done }, raw('span', it[2]));
  });
  const back = el('div', { class: 'scrim', onclick: (e) => { if (e.target === back) done(); }, onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': paras[0] }, dlog20(w, h, ...kids)));
  document.body.append(back); const b = back.querySelector('button'); if (b) b.focus();
  return back;
}
function alertBox(paras) { const b = ((V2 || own12Rules()) && alert20(paras)) || A().alertOver(paras, lang()); if (b) b.setAttribute('translate', 'no'); }

// DLOG 6020 "Build Ships at …" (BuildShips @112946): "Shipbuilding Queue at:" the star; "Available Types" (the designs);
// "In The Queue:" (each line MakeFleetDescription of the design and its count); for the type picked, "$%s (D)" its development and
// "$%s (P)" its production cost (STR# 4000.28-29), and "%d%% Done" of the first ship queued (4000.30). A double click on a type adds one
// (AddTypeToQueue: a beep when it can't), on a queued line takes one off (RemoveTypeFromQueue). OK keeps the queue, Cancel puts it back.
const DONE = { en: '%d%% Done', fr: '%d%% finition' };
function buildShips(sid) {
  const a = A(), g = G(), s = g.stars[sid];
  if (!s || s.owner !== a.ME) return false;
  if (!H().feature(g, 'buildQueue')) return buyShips(sid); // (a later ruleset buys ships at once, as its own window does; only 1.2's and DOS 2.0's queue)
  const before = JSON.stringify(s.queue || []);
  return build6020(sid, before);
}
// DLOG 6020 drawn as BuildShips @112946 draws it (476 x 304; DITL 6020, 1.2F's, 2.0.1's for that skin; Jake's shot035 and shot077):
// "En production à:" and the star; the production box (item 5, 245 x 78, DRAWBUILDSHIPTYPEPICTURE @1132e4): framed, the first queued type's
// picture, and over the part not yet built (the right (100 - done)% of the box) the 50% grey painted white (PenMode patOr, ForeColor white),
// so it shows as a dotted sketch (Jake's captures at 0, 44, 67 and 89%), "$x (D)" while the type has never been built, else "$x (P)" (STR# 4000.28-29), and
// "%d%% finition" (.30) under it; "En attente:" and the queue's three slots (items 6-8, 124 x 55, DRAWBUILDLISTSHIPBORDER @112f7c: framed,
// the type's small picture, MakeFleetDescription of the type and count in Geneva 9, condensed when wider, centred); "Modèles disponibles:"
// and the types (item 4, 137 x 214: a list of 53-pixel cells, each the small picture over its description, with its scroll bar), Annuler,
// OK with the default ring. A double click on a type queues one (AddTypeToQueue: its slot, or the first free of three; a beep when none);
// a click on a slot takes one off (RemoveTypeFromQueue, the slot inverted meanwhile). Annuler puts the queue back.
const D6020 = {
  12: { head: [0, 39, 15, 150], star: [0, 156, 16, 231], prod: [26, 39, 104, 284], dev: [107, 39, 124, 136], pct: [107, 159, 124, 274], wait: [129, 39, 145, 132],
    slots: [[130, 143, 185, 267], [186, 143, 241, 267], [242, 143, 297, 267]], avail: [2, 323, 17, 468], list: [28, 323, 242, 460], cancel: [250, 286, 270, 344], ok: [250, 366, 270, 424] },
  20: { head: [0, 0, 16, 150], star: [0, 156, 16, 231], prod: [26, 39, 104, 284], dev: [107, 65, 124, 162], pct: [107, 182, 125, 265], wait: [143, 39, 159, 132],
    slots: [[130, 143, 185, 267], [186, 143, 241, 267], [242, 143, 297, 267]], avail: [2, 323, 18, 430], list: [28, 323, 242, 460], cancel: [250, 286, 270, 344], ok: [250, 366, 270, 424] },
};
const W6020 = { fr: { head: 'En production à:', wait: 'En attente:', avail: 'Modèles disponibles:', cancel: 'Annuler', ok: 'OK' },
  en: { head: 'Shipbuilding Queue at:', wait: 'In The Queue:', avail: 'Available Types', cancel: 'Cancel', ok: 'OK' } };
let B6020 = { top: 0 };
function build6020(sid, before) {
  const a = A(), el = a.el, g = G(), p = a.me(), s = g.stars[sid], D = D6020[V2 || lang() !== 'fr' ? 20 : 12], Wd = W6020[lang()] || W6020.en; // (English has no 1.2 of its own: 2.0.1's English dialog)
  const ds = p.designs.filter(d => !d.scrapped).reverse(); // (InitBuildShipsTypesList: every type, the newest first)
  let pick = null; // (none chosen when it opens: shot035)
  const picOf = (d) => (a.shipPic ? a.shipPic(d, a.ME) : null);
  const putPic = (q, d, l, t, w, h) => { const im = picOf(d); if (!im || !im.width) return; const k = Math.min(w / im.width, h / im.height), pw = Math.round(im.width * k), ph = Math.round(im.height * k); q.x.imageSmoothingEnabled = false; q.x.drawImage(im, l + Math.round((w - pw) / 2), t + Math.round((h - ph) / 2), pw, ph); };
  const centre = (q, t, w, v) => { const cond = q.width(t, G9) > w - 2; q.text(t, 0, v, G9, { center: w / 2, cond }); };
  const box = el('div', { style: 'position:absolute;left:0;top:0;width:476px;height:304px' });
  const draw = () => {
    box.innerHTML = '';
    const Q = s.queue || [], first = Q[0] ? H().getDesign(g, a.ME, Q[0].did) : null;
    // the production box
    const pr = D.prod, pw = pr[3] - pr[1], ph = pr[2] - pr[0], q = qdCanvas(pw, ph, ''); q.c.style.cssText = at20(pr);
    q.x.strokeStyle = '#000'; q.x.strokeRect(0.5, 0.5, pw - 1, ph - 1);
    let devT = '', pctT = '';
    if (first) {
      putPic(q, first, 1, 1, pw - 2, ph - 2);
      const c = H().designCost(g, first), never = first.built === 0 && !first.free;
      devT = fill(never ? '$%s (D)' : '$%s (P)', nice(never ? (c.protoTotal != null ? c.protoTotal : c.money) : c.money));
      const yp = H().rules(g).yardProgress ? H().rules(g).yardProgress(g, p, s) : null, pct = yp ? Math.max(0, Math.min(100, Math.round(yp.pct))) : 0;
      pctT = fill(DONE[lang()], pct);
      // (the part not yet built: the right (100 - done)% of the box, drawn over in white every other pixel, so it shows as a dotted sketch:
      // Jake's captures at 0, 44, 67 and 89%; the asm moves the rect's left to right - (100 - done) x width / 100)
      const left = Math.round((pw - 1) - (100 - pct) * (pw - 2) / 100);
      for (let y = 1; y < ph - 1; y++) for (let x = left; x < pw - 1; x++) if ((x + y) % 2 === 0) q.rect(x, y, x + 1, y + 1, '#fff');
    }
    q.c.setAttribute('aria-label', first ? descN(first, Q[0].n) : '');
    const lab = (t, r) => { const n = txt20(t, r); n.style.overflow = 'visible'; n.style.whiteSpace = 'nowrap'; return n; }; // (a static text item draws past its rectangle: TextBox wraps, it doesn't clip a word that fits the line)
    box.append(lab(Wd.head, D.head), lab(s.name, D.star), q.c, lab(devT, D.dev), lab(pctT, D.pct), lab(Wd.wait, D.wait), lab(Wd.avail, D.avail));
    // the queue's three slots
    D.slots.forEach((r, i) => {
      const w = r[3] - r[1], h = r[2] - r[0], qs = qdCanvas(w, h, ''), it = Q[i], d = it ? H().getDesign(g, a.ME, it.did) : null;
      qs.c.style.cssText = at20(r) + ';cursor:default'; qs.x.strokeStyle = '#000'; qs.x.strokeRect(0.5, 0.5, w - 1, h - 1);
      if (d) { putPic(qs, d, 2, 2, w - 4, 40); centre(qs, descN(d, it.n), w, h - 4); qs.c.setAttribute('aria-label', descN(d, it.n)); }
      qs.c.addEventListener('click', () => { if (!d) return; qs.x.globalCompositeOperation = 'difference'; qs.rect(0, 0, w, h, '#fff'); qs.x.globalCompositeOperation = 'source-over';
        setTimeout(() => { H().unqueueShip(g, a.ME, sid, i); draw(); }, 120); });
      box.append(qs.c);
    });
    // the types: 53-pixel cells, 121 wide, the scroll bar at the right
    const L = D.list, lw = L[3] - L[1], lh = L[2] - L[0], rows = Math.floor((lh - 2) / 53), maxTop = Math.max(0, ds.length - rows);
    B6020.top = Math.max(0, Math.min(B6020.top, maxTop));
    const lq = qdCanvas(lw, lh, Wd.avail); lq.c.style.cssText = at20(L); lq.x.strokeStyle = '#000'; lq.x.strokeRect(0.5, 0.5, lw - 1, lh - 1);
    ds.slice(B6020.top, B6020.top + rows).forEach((d, i) => {
      const t = 1 + 53 * i; putPic(lq, d, 1, t + 2, lw - 18, 40); centre(lq, desc0(d), lw - 16, t + 50);
      if (d === pick) { lq.x.globalCompositeOperation = 'difference'; lq.rect(1, t, lw - 16, t + 53, '#fff'); lq.x.globalCompositeOperation = 'source-over'; }
    });
    drawBar(lq.x, lw - 16, 0, true, lh, 16, { on: true, value: B6020.top, max: maxTop });
    lq.c.addEventListener('click', (ev) => {
      const pt = lq.at(ev);
      if (pt.h >= lw - 16) { if (maxTop) { B6020.top += pt.v < 16 ? -1 : pt.v >= lh - 16 ? 1 : pt.v < lh / 2 ? -rows : rows; draw(); } return; }
    });
    // each cell an option over the picture (a reader, the keyboard and the test tools have something to click; the drawing is the canvas's)
    const lb = el('div', { role: 'listbox', 'aria-label': Wd.avail, style: at20([L[0] + 1, L[1] + 1, L[2] - 1, L[3] - 16]) });
    ds.slice(B6020.top, B6020.top + rows).forEach((d, i) => {
      const queueOne = () => { pick = d; if (d.scrap301 || !H().canBuildType(g, p, d.type) || !H().queueShips(g, a.ME, sid, d.id, 1)) { if (a.beep) a.beep(); } draw(); };
      lb.append(el('div', { class: 'li', role: 'option', tabindex: 0, 'aria-selected': d === pick ? 'true' : 'false', 'aria-label': desc0(d), style: `position:absolute;left:0;right:0;top:${53 * i}px;height:53px;cursor:default`,
        onclick: dbl12('b' + d.id, () => { pick = d; draw(); }, queueOne), onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); queueOne(); } } }));
    });
    lq.c.addEventListener('wheel', (ev) => { if (!maxTop) return; ev.preventDefault(); B6020.top += ev.deltaY > 0 ? 1 : -1; draw(); }, { passive: false });
    box.append(lq.c, lb);
  };
  draw();
  const B = (t, r, fn, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
  const dl = dlog20(476, 304, box, B(Wd.cancel, D.cancel, () => { s.queue = JSON.parse(before); a.closeModal(); a.renderPanel(); }), B(Wd.ok, D.ok, () => { a.closeModal(); a.save(); a.renderPanel(); }, true));
  a.modal('', dl, { cls: 'mac12 dl20w dlg6010', label: Wd.head + ' ' + s.name });
  return true;
}

// The remake's own, in 1.2's window: Build Ships in a ruleset that buys ships at once (3.0.1, 4.0.5, 5.0.5, the Palm, iOS ...: 1.2 and DOS 2.0
// queue them, above, and a ship queued here would never be built). The same two lists as 1.2's: "Available Types" (a double click buys one,
// at its price, in money and metal) and what was bought here (a double click gives one back: HO.unbuildShip refunds it). The ruleset's own
// rules hold: its prices (HO.shipCostNow), its borrowing limit, rs.manyShips (5.0.5: ten Scouts or Tankers ask first, Alert Strings 35 and 36;
// iOS: the same words under the types), rs.allowDebt (iOS, the Palm: a check box that lets purchases go below $0).
let BUY12 = null;
function buyShips(sid) {
  const a = A(), el = a.el, g = G(), p = a.me(), s = g.stars[sid], rs = H().rules(g);
  const c0 = BUY12 && BUY12.carry && BUY12.sid === sid ? BUY12 : { sid, session: {}, asked: {}, debt: !!(rs.allowDebt && rs.allowDebt.on) };
  c0.carry = false; BUY12 = c0;
  const AD = rs.allowDebt, MS = rs.manyShips, session = c0.session, asked = c0.asked;
  const ds = p.designs.filter(d => !d.scrapped && CLASSES().includes(d.type)).reverse();
  let pick = ds.find(d => !d.scrap301) || ds[0] || null;
  const types = el('div', { class: 'lb', role: 'listbox' }), bought = el('div', { class: 'lb', role: 'listbox' });
  const dev = raw('span', ''), pro = raw('span', ''), funds = el('div', { class: 'funds12' }), warn = el('div', { class: 'fine' });
  const floor = () => (AD && !c0.debt ? 0 : H().borrowLimit(g, p));
  const affordable = (d) => { const c = H().shipCostNow(g, p, d); return p.savings - c.money >= floor() && p.metal >= c.metal; };
  const manyText = (d) => (d.type === 'scout' ? H().DATA.alerts[35] : d.type === 'tanker' ? H().DATA.alerts[36] : null);
  const show = () => {
    types.innerHTML = ''; bought.innerHTML = '';
    for (const d of ds) types.append(raw('div', desc0(d), { class: 'li' + (d === pick ? ' sel' : '') + (d.scrap301 && !rs.queueMarked ? ' dim12' : ''), role: 'option', 'aria-selected': d === pick ? 'true' : 'false', tabindex: 0, onclick: dbl12('t' + d.id, () => { pick = d; show(); }, () => add(d)), onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); add(d); } } }));
    for (const d of ds) if (session[d.id] > 0) bought.append(raw('div', descN(d, session[d.id]), { class: 'li', role: 'option', tabindex: 0, onclick: dbl12('b' + d.id, () => {}, () => take(d)), onkeydown: (e) => { if (e.key === 'Enter' || e.key === 'Delete') { e.preventDefault(); take(d); } } }));
    const c = pick ? H().shipCostNow(g, p, pick) : null;
    dev.textContent = c && c.proto ? fill('$%s (D)', nice(c.proto)) : '';
    pro.textContent = c ? fill('$%s (P)', nice(c.money)) : '';
    funds.textContent = ''; funds.append(el('span', null, 'Savings'), raw('b', ' ' + (rs.buildSavingsPlain ? a.fmt(p.savings) : a.money(p.savings))), ' · ', el('span', null, 'Metal'), raw('b', ' ' + nice(p.metal)));
    warn.textContent = MS && MS.how === 'warn' && pick && manyText(pick) && (session[pick.id] || 0) >= MS.at ? H().say(g, manyText(pick)) : '';
  };
  const done = () => { a.renderPanel(); a.draw(); show(); };
  const buy = (d) => { if (H().buildShips(g, a.ME, sid, d.id, 1)) session[d.id] = (session[d.id] || 0) + 1; else if (a.beep) a.beep(); done(); };
  const add = (d) => {
    if (d.scrap301 && !rs.queueMarked) { if (a.beep) a.beep(); return; } // (a type marked for scrapping can't be bought)
    if (AD && !affordable(d)) { if (a.beep) a.beep(); return; }
    if (MS && MS.how === 'ask' && manyText(d) && (session[d.id] || 0) + 1 >= MS.at && !asked[d.id]) {
      c0.carry = true; // (the question is a window of its own; the purchases so far stay)
      a.confirmBox(H().say(g, manyText(d)), () => { asked[d.id] = true; c0.carry = true; buy(d); buyShips(sid); }, null);
      return;
    }
    buy(d);
  };
  const take = (d) => { if (session[d.id] > 0 && H().unbuildShip(g, a.ME, sid, d.id)) { session[d.id]--; done(); } else if (a.beep) a.beep(); };
  show();
  const debt = AD ? el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: c0.debt ? 'checked' : false, onchange: (e) => { c0.debt = e.target.checked; show(); } }), el('span', null, AD.label || 'Allow Debt')) : null;
  rwin('', el('div', { class: 'build12 buy12' },
    el('div', { class: 'kv' }, el('span', null, 'Build ships at'), raw('b', s.name)),
    el('div', { class: 'cols' }, el('div', null, el('p', null, 'Ships Bought Here'), bought, dev, ' ', pro), el('div', null, el('p', null, 'Available Types'), types)),
    funds, debt, warn,
    el('div', { class: 'btns right' }, btn('OK', () => { BUY12 = null; a.closeModal(); a.save(); a.renderPanel(); a.draw(); }))), 'buy12w', { sticky: false, onClose: () => { if (!(BUY12 && BUY12.carry)) BUY12 = null; a.save(); } });
  return true;
}

// The Rank history (5.0.5 and the Palm: ranks by master points), the remake's own in 1.2's manner: the rank's 1-bit picture in a frame with
// its name and the points beside it, the ranks as a list box (the player's own rank selected in inverse, as 1.2's lists select, the ranks
// earned starred), and what the wins were below. What the classic window shows, in a list box not a ruled table.
function ranksWindow() {
  const a = A(), el = a.el, R = H().DATA.ranks || [];
  if (!R.length || !a.profile) return false;
  const pr = a.profile(), cur = a.rankOf(pr.points), fmt = a.fmt;
  const row = (cls, ...c) => el('div', { class: 'prow ' + cls }, ...c.map(x => (x && x.nodeType ? x : el('span', null, x))));
  const ranks = el('div', { class: 'rk12 lb', role: 'listbox', 'aria-label': 'Rank' });
  ranks.append(row('head', 'Rank', 'Points', 'Unlocks'));
  R.forEach((r, i) => ranks.append(row(i === cur ? 'sel' : '', el('span', null, i <= cur ? '★ ' : '', r[0]), fmt(r[1]), r[2] || ''))); // (the star and the name apart: joined, "★ City Slicker" is in no table, and every earned rank stayed English in every language)
  const wins = pr.games && pr.games.length ? el('div', null, el('p', { class: 'cap' }, 'Wins'),
    el('div', { class: 'rk12 wins lb' }, row('head', 'Date', 'Year', 'Difficulty', 'Points'),
      ...pr.games.slice(-30).reverse().map(g => row('', g.date, String(g.year), String(g.difficulty), fmt(g.points))))) : null;
  const pic = el('img', { class: 'rkpic', src: a.A.jpg[cur], alt: '', width: 160 });
  const top = el('div', { class: 'rktop' }, pic, el('div', { class: 'rkinfo' }, raw('b', R[cur][0]), el('div', null, `Total master points: ${fmt(pr.points)}`),
    el('p', { class: 'fine' }, 'You earn master points by winning games with the 5.0.5 or Palm OS 5 rules. The harder the game, the more points.')));
  setTimeout(() => { const s = ranks.querySelector('.prow.sel'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' }); }, 0);
  rwin('Rank history', el('div', { class: 'ranks12' }, top, ranks, wins, el('div', { class: 'btns' }, el('span', { class: 'fill' }), btn('OK', () => a.closeModal()))), 'ranks12w');
  return true;
}

// ======================================================================================================================================
// 1.2's WIDGETS for the remake's windows (the remake's own windows, in 1.2's look): a vertical bar as 1.2 draws its bars, a list box with the
// chosen row in inverse (as 1.2's own lists), and the question box. Every window below calls the engine as the classic window does.
// ======================================================================================================================================
// A vertical bar as DrawVBarControl draws one (the Tech Spending bars): an axis with ticks, a base line, a black bar rising from it. Dragged, or
// moved by the keys (Up/Down, PageUp/PageDown by a tenth, Home, End): o { max, value, h (50 as 1.2's), ticks (10), label, text(v), onchange(v) }
function vbar12(o) {
  const H0 = o.h || 50, W0 = 34, max = Math.max(0, o.max | 0), ticks = o.ticks || 10;
  const q = qdCanvas(W0, H0 + 4, o.label), c = q.c; let v = Math.max(0, Math.min(max, o.value | 0));
  c.classList.add('vbar12'); c.tabIndex = max > 0 ? 0 : -1; c.setAttribute('role', 'slider'); c.style.touchAction = 'none';
  c.setAttribute('aria-valuemin', '0'); c.setAttribute('aria-valuemax', String(max)); if (o.label) c.setAttribute('aria-label', o.label);
  const draw = () => {
    q.rect(0, 0, W0, H0 + 4, '#fff');
    q.vline(8, 1, H0 + 2); for (let i = 0; i <= ticks; i++) q.hline(5, 8, H0 + 1 - Math.round(H0 * i / ticks));
    q.hline(8, 32, H0 + 1);
    const px = max > 0 ? Math.round(H0 * v / max) : 0; if (px > 0) q.rect(12, H0 + 1 - px, 30, H0 + 1, '#000');
    c.setAttribute('aria-valuenow', String(v)); c.setAttribute('aria-valuetext', o.text ? o.text(v) : String(v));
  };
  const step = o.step || 1; // (a bar that moves in steps: the generic Dip's 5%)
  const set = (n, fire) => { n = Math.max(0, Math.min(max, Math.round(Math.round(n / step) * step))); if (n === v) return; v = n; draw(); if (fire !== false && o.onchange) o.onchange(v); };
  const fromY = (ev) => { const pt = q.at(ev); return max * (H0 + 1 - pt.v) / H0; };
  c.addEventListener('pointerdown', (ev) => { if (!max) { A().beep(); return; } ev.preventDefault(); c.focus(); const move = (e) => set(fromY(e)); const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); }; window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev); });
  c.addEventListener('keydown', (e) => { const st = Math.max(step, Math.round(max / H0)), d = { ArrowUp: st, ArrowRight: st, ArrowDown: -st, ArrowLeft: -st, PageUp: Math.max(step, Math.round(max / 10)), PageDown: -Math.max(step, Math.round(max / 10)) }[e.key]; if (d != null) { e.preventDefault(); set(v + d); } else if (e.key === 'Home') { e.preventDefault(); set(0); } else if (e.key === 'End') { e.preventDefault(); set(max); } });
  draw();
  return { el: c, get: () => v, set };
}
// A double click counted by the window itself, for the lists that redraw their rows on the first click (Build Ships, the fleet list): the
// second click then lands on a new row, and Firefox and Safari send no dblclick for it (Chrome does). Two clicks within 500 ms on the same item
// (key) are a double click, as the Mac's own; the first click does what a click does. A mouse and a finger alike.
let DBL12 = null;
function dbl12(key, one, two) {
  return () => { const t = Date.now(), hit = !!DBL12 && DBL12.k === key && t - DBL12.t < 500; DBL12 = hit ? null : { k: key, t }; if (hit) two(); else one(); };
}
// A list box, the chosen row in inverse: items [{ id, label, pic, disabled }] (a null item is a rule between rows); o { value, label, onpick, ondbl }
function list12(items, o) {
  const a = A(), el = a.el, box = el('div', { class: 'lb list12', role: 'listbox', 'aria-label': (o && o.label) || '' }); let cur = o ? o.value : null; const rows = [];
  const mark = () => { for (const r of rows) { const on = r.id === cur; r.row.classList.toggle('sel', on); r.row.setAttribute('aria-selected', on ? 'true' : 'false'); r.row.tabIndex = on || (cur == null && r === rows.find(x => !x.disabled)) ? 0 : -1; } };
  const pick = (id) => { cur = id; mark(); if (o && o.onpick) o.onpick(id); };
  for (const it of items) {
    if (!it) { box.append(el('div', { class: 'li rule12', role: 'separator' })); continue; }
    const row = el('div', { class: 'li' + (it.disabled ? ' dim12' : ''), role: 'option', 'aria-disabled': it.disabled ? 'true' : null, onclick: () => { if (!it.disabled) pick(it.id); }, ondblclick: () => { if (!it.disabled && o && o.ondbl) o.ondbl(it.id); } },
      it.pic ? el('img', { src: it.pic, alt: '', width: it.picSize || 16, height: it.picSize || 16 }) : null, typeof it.label === 'string' ? raw('span', it.label) : it.label);
    rows.push({ id: it.id, row, disabled: !!it.disabled }); box.append(row);
  }
  box.addEventListener('keydown', (e) => {
    const live = rows.filter(r => !r.disabled), i = live.findIndex(r => r.id === cur), d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (d != null && live.length) { e.preventDefault(); const n = live[Math.max(0, Math.min(live.length - 1, (i < 0 ? (d > 0 ? -1 : live.length) : i) + d))]; pick(n.id); n.row.focus(); }
    else if (e.key === 'Enter' && cur != null && o && o.ondbl) { e.preventDefault(); o.ondbl(cur); }
  });
  mark();
  return { el: box, get: () => cur, set: (id) => { cur = id; mark(); } };
}
// the question box (the plain "Are you sure?" of a later ruleset's commands: Armageddon, Evacuate, Surrender ...): 1.2's alert, no title, the
// default button ringed; under 1.2's own rules the classic box stays, as 1.2's own questions are not this skin's to restyle
// a question the program asks with an alert of two buttons (ALRT 5060's "Qu'elles meurent!" / "Annuler": GiveSpendingWarning @102498): the table's
// box by its words, the first button (the default, with its ring) answers yes
function ask12alert(text, yes) {
  const norm = (t) => String(t).replace(/[‘’“”]/g, "'").replace(/\s+/g, ' ').trim(), p0 = norm(text);
  let hit = null;
  for (const T of alertTables()) for (const k of Object.keys(T)) { const t = T[k][2].find(x => x[0] === 't'); if (t && T[k][2].filter(x => x[0] === 'b').length === 2 && norm(t[2]).slice(0, 30) === p0.slice(0, 30)) { hit = T[k]; break; } }
  if (!hit) return false;
  const [w, h, items] = hit, a = A(), el = a.el, bs = items.filter(x => x[0] === 'b');
  const close = (ok) => { back.remove(); if (ok) yes(); };
  const kids = items.map(it => {
    if (it[0] === 't') return raw('span', it[2], { class: 'dt20', style: at20(it[1]) + ';white-space:pre-line' });
    if (it[0] === 'p') { const im = a.IMG['dos:p' + it[2]]; return im ? el('img', { src: im.src, alt: '', style: at20(it[1]) + ';image-rendering:pixelated' }) : null; }
    return el('button', { type: 'button', class: 'ok20' + (it === bs[0] ? ' def20' : ''), style: at20(it[1]) + ';min-width:0;padding:0', onclick: () => close(it === bs[0]) }, raw('span', it[2]));
  });
  const back = el('div', { class: 'scrim', onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(false); } else if (e.key === 'Enter') { e.stopPropagation(); close(true); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': text }, dlog20(w, h, ...kids)));
  document.body.append(back); const b = back.querySelector('button.def20'); if (b) b.focus();
  return true;
}
function ask12(text, yes, labels) {
  if (G() && own12Rules() && typeof text === 'string') return ask12alert(text, yes);
  if (!G() || own12Rules()) return false;
  const a = A(), el = a.el;
  const no = btn(labels ? labels[1] : 'Cancel', () => a.closeModal(), { class: 'quiet' }), ok = btn(labels ? labels[0] : 'OK', () => { a.closeModal(); yes(); });
  const w = rwin('', el('div', null, text && text.nodeType ? text : el('p', { style: 'white-space: pre-line' }, text), el('div', { class: 'btns right' }, no, ok)), 'ask12w');
  a.markYesNo(w, ok, no); // (the typed yes or no of modern conveniences: js/skins/classic/ui.js markYesNo)
  return true;
}

// Give Money/Metal, one window for every ruleset that has gifts (3.0.1's face grid, 4.0.5's, 5.0.5's two upright sliders, the Palm's and iOS's
// steps): the players to give to as a list, the two amounts as 1.2's bars, each with its figure to type. HO.give as the classic window calls it;
// each ruleset's own words (rs.giveWindow), its limit of three a turn, the Palm's steps and iOS's tenth-thousandths of what you have.
function give12() {
  const a = A(), el = a.el, g = G(), p = a.me(), ME = a.ME, W = H().rules(g).giveWindow || {}, out = (q) => !q.alive || q.surrendered;
  const lim = () => a.toast(H().say(g, W.limit || H().DATA.alerts[5] || 'Sorry, but you may only give 3 gifts per turn.'));
  if (H().rules(g).giveWindow && (p.giftsThisTurn || 0) >= 3) { lim(); return true; } // (the other rulesets' limit comes back from HO.give)
  const order = W.order ? W.order(g) : g.players, can = order.filter(q => q.id !== ME && (W.style ? !out(q) : !!a.others().find(o => o.id === q.id)));
  if (W.style !== 'grid' && !can.length) { a.toast(H().say(g, W.none || H().DATA.alerts[6] || 'There is no one else to give anything to.')); return true; }
  const last = W.remember ? p[W.remember] : null, first = can.some(q => q.id === last) ? last : can.length ? can[0].id : null;
  const have = Math.max(0, Math.floor(p.savings)), hasM = Math.max(0, Math.floor(p.metal));
  // (what a bar's position means: the amount itself; the Palm's: a number of steps; iOS's: tenth-thousandths of what you have)
  const amtOf = W.style === 'palm' ? (Hh, n) => n >= W.steps ? Hh : n <= 0 ? 0 : Math.trunc(Hh / W.steps) * n : W.style === 'ios' ? (Hh, n) => Math.trunc(Math.fround(Math.fround(Hh) * Math.fround(n / 10000))) : (Hh, n) => n;
  const range = (Hh) => Hh <= 0 ? 0 : W.style === 'palm' ? W.steps : W.style === 'ios' ? 10000 : Hh;
  let mAmt = 0, xAmt = 0;
  const face = (q) => a.IMG[q.human ? 'white0_' + (q.female ? 1 : 0) : 'bad' + q.face + '_' + (q.female ? 1 : 0)];
  const who = list12(can.map(q => ({ id: q.id, label: q.name, pic: face(q) && face(q).src })), { value: first, label: W.to || W.recipient || 'Give to' });
  const col = (label, Hh, key) => {
    const fig = el('input', { type: 'text', inputmode: 'numeric', size: 8, autocomplete: 'off', value: '0', 'aria-label': label, class: 'fig12' });
    const bar = vbar12({ max: range(Hh), value: 0, h: 80, label, text: (n) => String(amtOf(Hh, n)), onchange: (n) => { const m = amtOf(Hh, n); if (key === 'm') mAmt = m; else xAmt = m; fig.value = a.fmt(m); } });
    fig.addEventListener('input', () => { const n = Math.max(0, Math.min(Hh, parseInt(fig.value.replace(/\D/g, ''), 10) || 0)); if (key === 'm') mAmt = n; else xAmt = n; const r = range(Hh); bar.set(Hh > 0 && r > 0 ? n * r / Hh : 0, false); });
    fig.addEventListener('blur', () => { fig.value = a.fmt(key === 'm' ? mAmt : xAmt); });
    return el('div', { class: 'givecol12' }, el('div', { class: 'cap12' }, label), bar.el, el('div', { class: 'ends12' }, el('span', null, a.fmt(Hh)), el('span', null, '0')), fig);
  };
  const submit = () => {
    const to = who.get(); if (to == null || (W.style === 'grid' && !(mAmt > 0 || xAmt > 0))) { a.closeModal(); return; }
    const r = H().give(g, ME, to, mAmt, xAmt);
    if (r === 'limit') { lim(); return; }
    if (r === 'short') { a.toast('You don’t have that much to give.'); return; }
    if (r !== 'ok') return;
    if (W.remember) p[W.remember] = to;
    a.Sound.play(5000); a.closeModal(); a.renderPanel(); a.save();
  };
  rwin(W.title || 'Give money or metal', el('div', { class: 'give12' },
    el('div', { class: 'give12cols' }, el('div', null, el('p', { class: 'cap12' }, W.to || W.recipient || 'Give to'), who.el),
      col(W.money || 'Money:', have, 'm'), col(W.metal || 'Metal:', hasM, 'x')),
    el('div', { class: 'btns right' }, btn(W.cancel || 'Cancel', () => a.closeModal(), { class: 'quiet' }), btn(W.ok || 'Give', submit))), 'give12w');
  return true;
}

// Send Message: to whom and what to say, two lists side by side as 1.2's Build window has its two. The ruleset's own forms (rs.cannedChat: 5.0.5's
// and the Palm's "popup", 2.0's, 3.0.1's and 4.0.5's "steps" with what the line needs under the lists: a star, a player, a line of text), or the
// generic form (a few lines or your own words). HO.sendCanned / HO.sendChat as the classic window calls them; the limit per turn, the words.
function chat12() {
  const a = A(), el = a.el, g = G(), ME = a.ME, C = H().rules(g).cannedChat, val = (v) => /^\d+$/.test(String(v)) ? +v : v;
  const sent = (r) => { if (r === 'limit') { a.chatLimitToast(); return false; } if (r !== 'ok') return false; a.Sound.play(5000); a.closeModal(); a.save(); return true; };
  const none = () => a.toast(H().say(g, H().DATA.alerts[6] || 'There is no one else to send something to.'));
  const lists = (toItems, sayItems, toVal) => { const to = list12(toItems, { value: toVal, label: 'To whom' }), say = list12(sayItems, { value: sayItems[0].id, label: 'Say what' }); return { to, say }; };
  const two = (c1, l1, c2, l2) => el('div', { class: 'chat12cols' }, el('div', null, el('p', { class: 'cap12' }, c1), l1.el), el('div', null, el('p', { class: 'cap12' }, c2), l2.el));
  if (C) {
    const tos = C.to(g, ME), ok = tos.filter(o => !o[2]);
    if (!ok.length) { none(); return true; }
    const toItems = tos.map(o => ({ id: String(o[0]), label: o[1], disabled: !!o[2] }));
    if (C.style === 'popup') {
      const cur = C.remember && ok.some(o => o[0] === a.me().chatTo) ? a.me().chatTo : ok[0][0];
      const L = lists(toItems, C.lines.map((l, i) => ({ id: i, label: l })), String(cur));
      rwin(C.title, el('div', { class: 'chat12' }, two(C.prompts[0], L.to, C.prompts[1], L.say),
        el('div', { class: 'btns right' }, btn(C.buttons[0], () => a.closeModal(), { class: 'quiet' }), btn(C.buttons[1], a.guard(() => {
          const t = val(L.to.get()); if (C.remember) a.me().chatTo = t; sent(H().sendCanned(g, ME, C.make(g, ME, t, +L.say.get())));
        })))), 'chat12w');
      return true;
    }
    // "steps" (2.0, 3.0.1, 4.0.5): what the line needs is chosen under the lists, one popup each (a star, a player, "About What?" then "Which One?", a line of text)
    const L = lists(toItems, C.actions.map((x, i) => ({ id: i, label: x.label })), String(ok[0][0]));
    const more = el('div', { class: 'chat12more' }); let parts = [];
    const sel = (name, opts) => el('select', { name, 'aria-label': name }, ...opts.map(o => el('option', { value: String(o[0]), disabled: o[2] ? 'disabled' : false }, o[1])));
    const build = () => {
      more.textContent = ''; parts = []; let kind = null;
      for (const [prompt, k, opts] of C.actions[+L.say.get()].parts) {
        let c;
        if (k === 'text') c = el('input', { name: prompt, maxlength: opts || 24, 'aria-label': prompt });
        else if (k === 'about') { c = sel(prompt, opts.map((o, i) => [i, o[0]])); c.addEventListener('change', a.guard(() => which())); kind = opts; }
        else c = sel(prompt, C.list(g, ME, k === 'which' ? kind[0][1] : k, a.UI.sel));
        c.dataset.kind = k; parts.push(c); more.append(el('label', { class: 'chat12part' }, el('span', null, prompt.replace('\n', ' ')), c));
      }
    };
    const which = () => { // (2.0's "Which One?" follows its "About What?")
      const ab = parts.find(x => x.dataset.kind === 'about'), w = parts.find(x => x.dataset.kind === 'which'); if (!ab || !w) return;
      const opts = C.actions[+L.say.get()].parts.find(x => x[1] === 'about')[2];
      const n = sel(w.name, C.list(g, ME, opts[+ab.value][1], a.UI.sel)); n.dataset.kind = 'which'; w.replaceWith(n); parts[parts.indexOf(w)] = n;
    };
    L.say.el.addEventListener('click', a.guard(() => { build(); which(); }));
    L.say.el.addEventListener('keyup', a.guard(() => { build(); which(); }));
    build(); which();
    rwin(C.title, el('div', { class: 'chat12' }, two(C.prompts[0].replace('\n', ' '), L.to, C.prompts[1], L.say), more,
      el('div', { class: 'btns right' }, btn('Cancel', () => a.closeModal(), { class: 'quiet' }), btn('Send', a.guard(() => {
        if (parts.some(x => x.dataset.kind !== 'text' && x.value === '')) return;
        const v = parts.map(x => x.dataset.kind === 'text' ? null : val(x.value)), t = parts.find(x => x.dataset.kind === 'text'); if (t) v.text = t.value;
        sent(H().sendCanned(g, ME, C.make(g, ME, val(L.to.get()), +L.say.get(), v)));
      })))), 'chat12w');
    return true;
  }
  const others = a.others();
  if (!others.length) { none(); return true; }
  const lines = ['Thank You!', 'Sorry!', '#!$@*$&@•™!', 'I need money.', 'I need metal.', 'I like you.', 'I hate you.', 'Let’s be allies.'];
  const L = lists(others.map(q => ({ id: String(q.id), label: q.name })), lines.map((l, i) => ({ id: i, label: l })), String(others[0].id));
  const own = el('input', { name: 'custom', maxlength: 80, 'aria-label': 'Or type your own', class: 'chat12own' });
  rwin('Send a message', el('div', { class: 'chat12' }, two('Send to', L.to, 'Say', L.say), el('label', { class: 'chat12part' }, el('span', null, 'Or type your own'), own),
    el('div', { class: 'btns right' }, btn('Cancel', () => a.closeModal(), { class: 'quiet' }), btn('Send', () => { const text = own.value.trim() || lines[+L.say.get()]; const r = H().sendChat(g, ME, +L.to.get(), text); if (r === 'limit') { a.chatLimitToast(); return; } /* (HO.sendChat says nothing on success) */ a.Sound.play(5000); a.closeModal(); a.save(); }))), 'chat12w');
  return true;
}

// Radical Research (4.0.5, 5.0.5, the Palm, iOS): the programs your radical researchers are working on, as a list with each one's picture; the
// one picked is cancelled by OK. The ruleset's own forms (rs.radicalHand.words: its prompt, the picture beside each program, "keep" as the last
// choice and picked at first in 5.0.5, the Palm and iOS, none picked in 4.0.5; 4.0.5's five minutes, after which the window answers OK as it
// stands), or the plain one (a "Cancel Project" button beside OK). RH.discard as the classic window calls it.
function radical12() {
  const a = A(), el = a.el, g = G(), p = a.me(), RH = H().rules(g).radicalHand;
  if (!RH || g.over) return true;
  const cards = RH.cards(g, p);
  if (!cards.length || (RH.full && cards.length < RH.full)) { a.toast(cards.length ? 'Your radical researchers have fewer than four projects: none can be cancelled.' : 'Your radical researchers have no projects yet.'); return true; }
  const W = RH.words, pre = (window.HOTHEME && HOTHEME.prefix) || 'dos:';
  const pic = W && W.pic ? (a.IMG[pre + 'fill/classic-' + W.pic] || a.IMG[W.pic]) : null; // (the skin's 1-bit stand-in for the colour picture)
  if (!W) {
    let sel = null;
    const list = list12(cards.map((c, i) => ({ id: i, label: H().say(g, c.text) })), { label: 'Radical Research', onpick: (i) => { sel = i; go.disabled = false; } });
    const go = btn('Cancel Project', () => { if (sel == null) return; RH.discard(g, p, cards[sel].id); a.save(); a.closeModal(); a.Sound.play(7002); a.toast('That project has been cancelled.'); }, { disabled: true });
    rwin('Radical Research', el('div', { class: 'rad12' }, el('p', null, 'Your radical researchers are working on these projects. You may cancel one; another takes its place after the next discovery.'), list.el,
      el('div', { class: 'btns right' }, go, btn('OK', () => a.closeModal()))), 'rad12w');
    return true;
  }
  const items = cards.map((c, i) => ({ id: String(i), label: H().say(g, c.text), pic: pic && pic.src, picSize: 36 }));
  if (W.keep) items.push(null, { id: 'keep', label: W.keep });
  let timer = null;
  const list = list12(items, { value: W.keep ? 'keep' : null, label: W.prompt || 'Radical Research', onpick: () => a.Sound.play(7001) });
  const done = () => { clearTimeout(timer); const v = list.get(); a.closeModal(); if (v == null || v === 'keep') return; RH.discard(g, p, cards[+v].id); a.save(); a.Sound.play(7002); };
  rwin(W.title || '', el('div', { class: 'rad12' }, W.prompt ? el('p', null, W.prompt) : null, list.el, el('div', { class: 'btns right' }, btn(W.ok || 'OK', done))), 'rad12w', { onClose: () => clearTimeout(timer) });
  if (RH.timeout) timer = setTimeout(() => { if (a.UI.modal && a.UI.modal.contains(list.el)) done(); }, RH.timeout * 1000);
  return true;
}

// Auto Play: the computer plays your turns until something interesting happens. 1.2 had none; the later versions' windows are three (5.0.5's
// with its "Auto Play" box, iOS's with Play One Turn and a STOP button, the generic one with a number of turns and what to stop for), here in one
// layout of 1.2's: the way to play as a two-row list, the computer's settings as 1.2's sliders (the classic code's own, autoPlaySliders), the
// check boxes, "Click through messages every" as a slider. runAutoPlay as the classic window calls it; the settings kept as it keeps them.
function autoplay12() {
  const a = A(), el = a.el, g = G(), rs = H().rules(g), kind = rs.autoPlayWindow === 'ios' ? 'ios' : rs.autoPlayWindow === '505' ? '505' : 'generic', where = a.autoPlayWhere();
  const D = Object.assign(kind === '505' ? { on: true, computer: true } : {}, rs.autoPlayDefaults || { stop: true, every: 4 }, kind === '505' ? (a.Prefs.auto505 || {}) : {});
  const chk = (name, label, on, o) => { const i = el('input', Object.assign({ type: 'checkbox', name, checked: on ? 'checked' : false }, o || {})); return { i, el: el('label', { class: 'chk' }, i, el('span', null, label)) }; };
  const modeWords = kind === '505' ? ['Have Computer Play For Me', 'Just End My Turns'] : kind === 'ios' ? ['Computer Play For Me', 'Just End My Turns Only'] : ['Have the computer play for me', 'Just end my turns'];
  const mode = list12([{ id: 'computer', label: modeWords[0] }, { id: 'end', label: modeWords[1] }], { value: kind === '505' ? (D.computer ? 'computer' : 'end') : 'computer', label: 'Play', onpick: () => sync() });
  mode.el.classList.add('ap12mode');
  let sl = null;
  const showSl = kind === '505' || where === 'autoplay';
  if (showSl) sl = a.autoPlaySliders();
  const on = kind === '505' ? chk('on', 'Auto Play', D.on) : null, stop = kind !== 'generic' ? chk('stop', 'Turn Off When Something Interesting Happens', D.stop !== false) : null;
  const secs = el('b', null, String(D.every || 0));
  const every = el('input', { type: 'range', name: 'every', min: 0, max: 10, value: D.every || 0, 'aria-label': 'Seconds', oninput: (e) => { secs.textContent = e.target.value; } });
  const turns = kind === 'generic' ? el('input', { type: 'number', name: 'turns', min: 1, max: 500, value: 20, class: 'ap12turns', 'aria-label': 'For up to this many turns' }) : null;
  const gen = kind === 'generic' ? { won: chk('won', 'Battles I win', true), lost: chk('lost', 'Battles I lose', true), news: chk('news', 'Colonies, tech levels and other news', true) } : null;
  const sync = () => { if (sl) for (const i of sl.box.querySelectorAll('input')) i.disabled = kind === '505' && mode.get() !== 'computer'; };
  const go = (start) => {
    if (sl) sl.apply();
    if (kind === '505') { const o = { on: on.i.checked, computer: mode.get() === 'computer', stop: stop.i.checked, every: +every.value || 0 }; a.Prefs.auto505 = o; a.savePrefs(); a.closeModal(); if (o.on) a.runAutoPlay({ turns: Infinity, computer: o.computer, won: o.stop, lost: o.stop, news: o.stop, every: o.every, stopButton: true }); return; }
    a.closeModal();
    if (kind === 'ios') { const s = stop.i.checked; a.runAutoPlay({ turns: Infinity, computer: mode.get() === 'computer', won: s, lost: s, news: s, every: +every.value || 0, stopButton: true }); return; }
    a.runAutoPlay({ turns: +turns.value || 10, computer: mode.get() === 'computer', won: gen.won.i.checked, lost: gen.lost.i.checked, news: gen.news.i.checked });
  };
  const btns = el('div', { class: 'btns right' });
  if (where === 'config') btns.append(btn('Config…', () => { a.closeModal(); a.openAutoPlaySettings(a.openAutoPlay); }, { class: 'quiet' }));
  if (kind === 'ios') btns.append(btn('Play One Turn', () => { if (sl) sl.apply(); a.closeModal(); a.playOneTurn(); }, { class: 'quiet' }));
  if (kind === '505') btns.append(btn('Cancel', () => a.closeModal(), { class: 'quiet' }));
  btns.append(btn(kind === '505' ? 'OK' : 'Start', () => go()));
  rwin(kind === '505' ? 'Auto Play' : 'Auto play', el('div', { class: 'ap12' },
    on ? on.el : null, el('p', { class: 'cap12' }, 'Play'), mode.el, sl ? sl.box : null,
    gen ? el('div', null, el('p', { class: 'cap12' }, 'Stop when something interesting happens'), gen.won.el, gen.lost.el, gen.news.el) : null,
    stop ? el('div', null, stop.el, kind === '505' ? el('p', { class: 'fine' }, 'Battles, colonizations, tech level changes, etc.') : null) : null,
    kind !== 'generic' ? el('label', { class: 'slide ap12every' }, el('span', null, kind === '505' ? 'Click through messages every:' : 'Click through the messages every'), every, el('output', null, secs, ' ', 'Seconds')) : null,
    turns ? el('label', { class: 'chat12part' }, el('span', null, 'For up to this many turns'), turns) : null, btns), 'ap12w');
  sync();
  return true;
}

// Dip Into Savings (3.0.1 on): the question, one bar (the share of the savings that goes into the budget each turn), what it is now, Cancel, OK.
// The ruleset's own words (rs.windowWords.dip: 5.0.5's PPob 157) and its maximum (rs.dipMax), as the classic window has them.
function dip12() {
  const a = A(), el = a.el, g = G(), p = a.me(), rs = H().rules(g), W = a.winWords('dip'), max = rs.dipMax || 100;
  const now = raw('b', (p.dip || 0) + '%');
  const bar = vbar12({ max, value: p.dip || 0, h: 60, ticks: Math.min(10, max), step: rs.dipMax ? 1 : 5, label: W ? W.title : 'Dip into savings', text: (n) => n + '%', onchange: (n) => { now.textContent = n + '%'; } });
  const marks = W && W.marks ? W.marks : [max + '%', Math.round(max / 2) + '%', '0%'];
  const ok = () => { const v = bar.get(); if (rs.dipSet) rs.dipSet(g, p, v); else p.dip = v; a.closeModal(); a.renderPanel(); a.save(); };
  rwin(W ? W.title : 'Dip into savings', el('div', { class: 'dip12' },
    el('div', { class: 'dip12row' }, el('p', null, W ? W.text : 'Each turn, move this share of your savings into the budget'),
      el('div', { class: 'dip12bar' }, bar.el, el('div', { class: 'marks12' }, ...marks.map(m => el('span', null, m))))),
    el('p', { class: 'fine' }, W ? W.note : 'Once started, you will continue to dip each turn until cancelled.', ' ', now),
    el('div', { class: 'btns right' }, btn(W ? W.cancel : 'Cancel', () => a.closeModal(), { class: 'quiet' }), btn(W ? W.ok : 'OK', ok))), 'dip12w');
  return true;
}

// Surrender (3.0.1 on): who to surrender to, a list; yourself and those out dimmed, then "No One". The questions and the words as the classic window's
// (rs.windowWords.surrender: 5.0.5's PPob 147: OK the first time asks Alert 1, Cancel while surrendering takes it back, Alert 2).
function surrender12() {
  const a = A(), el = a.el, g = G(), p = a.me(), ME = a.ME, W = a.winWords('surrender');
  const set = (to) => { H().surrender(g, ME, to); a.save(); a.renderPanel(); };
  if (W) {
    const cur = p.surrenderTo;
    const list = list12([...g.players.map(q => ({ id: q.id, label: q.name, disabled: q.id === ME || !q.alive || q.surrendered })), null, { id: -1, label: W.noOne }], { value: cur == null || cur === -1 ? -1 : cur, label: W.text });
    rwin(W.title, el('div', { class: 'surr12' }, el('p', null, W.text), list.el,
      el('div', { class: 'btns right' },
        btn(W.cancel, () => { a.closeModal(); if (cur != null) { set(null); a.toast(H().say(g, H().DATA.alerts[2] || 'You are no longer surrendering to anyone.')); } }, { class: 'quiet' }),
        btn(W.ok, () => { const to = list.get(); a.closeModal(); if (cur == null) a.confirmBox(H().say(g, H().DATA.alerts[1] || 'Do you really want to surrender?'), () => set(to)); else if (to !== cur) set(to); }))), 'surr12w');
    return true;
  }
  if (p.surrenderTo != null) { a.confirmBox('You are surrendering at the end of this turn. Take it back?', () => { H().surrender(g, ME, null); a.save(); }); return true; }
  const list = list12([...a.others().map(q => ({ id: q.id, label: q.name })), { id: -1, label: 'No one' }], { value: a.others().length ? a.others()[0].id : -1, label: 'Surrender to' });
  rwin('Surrender', el('div', { class: 'surr12' }, el('p', null, H().say(g, H().DATA.alerts[1] || 'Do you really want to surrender?')), el('p', { class: 'cap12' }, 'Surrender to'), list.el,
    el('p', { class: 'fine' }, 'Your fleets are dismantled. Whoever you surrender to gets your savings, your metal, and your planets.'),
    el('div', { class: 'btns right' }, btn('Cancel', () => a.closeModal(), { class: 'quiet' }), btn('Surrender', () => { H().surrender(g, ME, list.get()); a.closeModal(); a.save(); a.toast('You will surrender at the end of this turn.'); }))), 'surr12w');
  return true;
}

// DLOG 6010 "Create New Ship Type…" ⌘K (CreateShipType @111866): ALRT 3280 first when there are 20 types; "Name of New Ship Type:" (15
// letters, "Name It For Me"), the class menu (MENU 6015), five sliders each "%d/%d" (its level / the most), "Dev. Cost:", "Prod. Cost:",
// "Metal Cost:"; "Create" asks ALRT 3040 until a name is given and ALRT 3050 until a slider has been moved
const ALERT_TYPES = {
  en: { full: ['Sorry, but Spaceward Ho! allows you to have only 20 ship types at one time. ', 'If you would like to create another ship type, scrap an old type by checking the “Scrap” box for it in the “List Ship Types…” Dialog.', 'The ship will be scrapped during the turn update and you can create a new type next turn…'],
    name: ['Please name your new ship type.'], tech: ['Please set your new ship type’s tech levels.'] },
  fr: { full: ['Désolé, mais Spaceward Ho! vous autorise seulement 20 modèles de vaisseaux simultanés. ', 'Pour créer ce nouveau modèle, recyclez-en d\'abord un ancien en cochant la case correspondante de la boîte de dialogue.', 'Ce modèle sera détruit lors de la mise à jour du tour, et vous pourrez en créer un autre au prochain tour.'],
    name: ['Merci de baptiser votre nouveau modèle de vaisseau.'], tech: ['Merci d\'affecter un minimum technologique à votre nouveau modèle.'] },
};
// The dialog as DITL 6010 lays it out (1.2F's, read in its resource fork; 2.0.1's is the same dialog, 458 x 270, a few items a pixel or two
// apart and in English), Jake's System 6 capture of 1.2F (19 Nov 2026): "Nom du nouveau modèle:" (10, 40), the field (13, 70, 174 x 16),
// the ship's picture in user item 4 (210, 20, 243 x 76: DRAWNEWSHIPTYPEPICTURE, DrawShipPicture of the levels set), the five rows: the
// level's name (7, 110 ...), "%d/%d" (its level / the most, 80, 110 ...: CreateShipType's sprintf) and its scroll bar (CNTL 6010-6014, 70 x 16
// at 123, 110 ...: the standard bar, empty when the level can't move), the Class pop-up (CNTL 6015, 214 x 20 at 221, 114, its title 90
// wide), "CT Dév:" / "CT Prod:" / "CT Métal:" (220, 140 ...) and their values (310), "Donner un nom" (76, 220), Annuler (280, 220), Créer
// (360, 221) with the default's ring (user item 3). SetSBMinMax @111c3c sets the bars' ranges: rs.designLimits / designMin.
const DITL6010 = {
  12: { title: [40, 10, 57, 190], field: [70, 13, 86, 187], pic: [20, 210, 96, 453], rows: [110, 130, 150, 170, 190], lab: [7, 74], num: 80, bar: 123,
    pop: [114, 221, 134, 435], popW: 90, costL: [220, 85], costV: [310, 104], costY: [140, 160, 180], name: [220, 76, 240, 194], cancel: [220, 280, 240, 338], ok: [221, 360, 241, 418] },
  20: { title: [40, 10, 58, 179], field: [70, 13, 86, 187], pic: [20, 210, 96, 453], rows: [110, 130, 150, 170, 190], lab: [10, 66], num: 80, bar: 123,
    pop: [110, 220, 130, 434], popW: 90, costL: [220, 85], costV: [310, 104], costY: [140, 160, 180], name: [220, 85, 240, 195], cancel: [220, 280, 240, 338], ok: [220, 360, 240, 418] },
};
const WORDS6010 = {
  fr: { title: 'Nom du nouveau modèle:', rows: ['Distance', 'Vitesse', 'Armes', 'Boucliers', 'Mini'], cls: 'Classe:', costs: ['CT Dév:', 'CT Prod:', 'CT Métal:'], name: 'Donner un nom', cancel: 'Annuler', ok: 'Créer' },
  en: { title: 'Name of New Ship Type:', rows: ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'], cls: 'Class:', costs: ['Dev. Cost:', 'Prod. Cost:', 'Metal Cost:'], name: 'Name It For Me', cancel: 'Cancel', ok: 'Create' },
};
// a dialog's scroll bar (the standard control, drawn as the map's: paintBar), horizontal, L long; arrows a step, the grey a step towards the
// pointer, the thumb dragged and let go; the keyboard's arrows (the remake's)
function dlgBar(L, get, set) {
  const a = A(), c = a.el('canvas', { class: 'cv12' }), b = { c, L };
  const el = a.el('div', { class: 'dbar12', role: 'scrollbar', tabindex: 0, 'aria-orientation': 'horizontal' }, c);
  let press = null, ghost = null;
  const paint = () => { const g = get(), span = g.max - g.min; el.setAttribute('aria-valuemin', g.min); el.setAttribute('aria-valuemax', g.max); el.setAttribute('aria-valuenow', g.v);
    el.setAttribute('aria-disabled', span > 0 ? 'false' : 'true'); paintBar(b, false, L, { on: true, value: g.v - g.min, max: span, press, ghost }); };
  const pos = (e) => { const r = c.getBoundingClientRect(); return (e.clientX - r.left) / r.width * L; };
  const thumbAt = () => { const g = get(); return 15 + Math.round((L - 46) * (g.v - g.min) / Math.max(1, g.max - g.min)); };
  const step = (d) => { const g = get(), n = Math.max(g.min, Math.min(g.max, g.v + d)); if (n !== g.v) set(n); paint(); };
  let timer = 0, drag = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); el.focus({ preventScroll: true });
    const g = get(); if (g.max <= g.min) return;
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const p = pos(e), t = thumbAt();
    if (p >= t && p < t + 16 && p >= 16 && p < L - 16) { drag = { p0: p, t0: t }; ghost = t; paint(); return; }
    const d = p < 16 ? -1 : p >= L - 16 ? 1 : p < t ? -1 : 1;
    press = p < 16 ? 'lo' : p >= L - 16 ? 'hi' : null;
    const tick = () => { step(d); timer = setTimeout(tick, 100); }; tick();
  });
  el.addEventListener('pointermove', (e) => { if (drag) { ghost = Math.max(15, Math.min(L - 31, drag.t0 + pos(e) - drag.p0)); paint(); } });
  const up = (e) => {
    clearTimeout(timer); press = null;
    if (drag) { const g = get(), T = L - 46, n = g.min + Math.round(Math.max(0, Math.min(1, T > 0 ? (ghost - 15) / T : 0)) * (g.max - g.min)); drag = null; ghost = null; if (e.type !== 'pointercancel' && n !== g.v) set(n); }
    paint();
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (d) { e.preventDefault(); step(d); } });
  return { el, paint };
}
function createType() {
  const a = A(), el = a.el, g = G(), p = a.me(), W = ALERT_TYPES[lang()];
  if (p.designs.filter(d => !d.scrapped).length >= (H().rules(g).maxDesigns || 20)) { alertBox(W.full); return; }
  const types = CLASSES(), D = DITL6010[V2 || lang() !== 'fr' ? 20 : 12], /* (English has no 1.2 of its own: 2.0.1's English dialog) */ Wd = WORDS6010[lang()] || WORDS6010.en, K = ['R', 'V', 'W', 'S', 'M'];
  const st = { type: types[0] || 'scout', R: 0, V: 0, W: 0, S: 0, M: 0, name: '' };
  let named = false, moved = false;
  const lim = (k) => { const L = H().designLimits(g, p, st.type), min = k === 'R' && st.type === 'satellite' ? 0 : H().designMin(g, k, st.type); return { min, max: k === 'R' && st.type === 'satellite' ? 0 : Math.max(min, L[k] || min) }; };
  const clamp = () => { for (const k of K) { const l = lim(k); st[k] = Math.max(l.min, Math.min(l.max, st[k])); } };
  clamp();
  // the field: its frame 3 pixels outside the text's rectangle, as a dialog's edit text item is drawn
  const fr = D.field, name = el('input', { type: 'text', maxlength: 15, value: '', 'aria-label': Wd.title, style: at20([fr[0] - 3, fr[1] - 3, fr[2] + 3, fr[3] + 3]),
    oninput: () => { st.name = name.value.trim(); named = !!st.name; },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); create(); } else if (e.key.length === 1 && name.value.length >= 15 && name.selectionStart === name.selectionEnd && a.beep) a.beep(); } });
  name.setAttribute('translate', 'no');
  const pr = D.pic, picBox = el('div', { style: at20(pr) + ';display:flex;justify-content:center;align-items:center;overflow:hidden', 'aria-hidden': 'true' });
  const drawPic = () => { picBox.innerHTML = ''; const im = a.shipImgEl({ type: st.type, R: st.R, V: st.V, W: st.W, S: st.S, M: st.M, name: st.name }, pr[2] - pr[0]); im.style.maxWidth = '100%'; im.style.width = 'auto'; im.style.imageRendering = 'pixelated'; picBox.append(im); };
  const nums = [], bars = [], parts = [];
  K.forEach((k, i) => {
    const y = D.rows[i];
    parts.push(txt20(Wd.rows[i], [y, D.lab[0], y + 16, D.lab[0] + D.lab[1]]));
    const n = raw('span', '', { class: 'dt20', style: at20([y, D.num, y + 16, D.num + 43]) }); nums.push(n); parts.push(n);
    const b = dlgBar(70, () => Object.assign({ v: st[k] }, lim(k)), (v) => { st[k] = v; moved = true; show(); });
    b.el.setAttribute('aria-label', Wd.rows[i]); b.el.setAttribute('style', at20([y, D.bar, y + 16, D.bar + 70])); bars.push(b); parts.push(b.el);
  });
  // the Class pop-up (CNTL 6015, the standard pop-up menu control): its title, then the box with its shadow and the black triangle; the menu the system's
  const pp = D.pop, sel = el('select', { class: 'pop12', 'aria-label': Wd.cls, style: at20([pp[0], pp[1] + D.popW, pp[2] - 1, pp[3] - 1]),
    onchange: () => { st.type = sel.value; clamp(); show(); } }, ...types.map(t => raw('option', cls(t), { value: t })));
  const costs = D.costY.map((y, i) => { parts.push(txt20(Wd.costs[i], [y, D.costL[0], y + 16, D.costL[0] + D.costL[1]])); const v = raw('span', '', { class: 'dt20', style: at20([y, D.costV[0], y + 16, D.costV[0] + D.costV[1]]) }); parts.push(v); return v; });
  const show = () => {
    K.forEach((k, i) => { nums[i].textContent = `${st[k]}/${lim(k).max}`; bars[i].paint(); });
    const c = H().designCost(g, st);
    costs[0].textContent = '$' + nice(c.protoTotal != null ? c.protoTotal : c.money); costs[1].textContent = '$' + nice(c.money); costs[2].textContent = nice(c.metal);
    drawPic();
  };
  const create = () => {
    if (!named || !st.name) { alertBox(W.name); return; }
    if (!moved) { alertBox(W.tech); return; }
    H().findOrCreateDesign(g, p, { type: st.type, R: st.R, V: st.V, W: st.W, S: st.S, M: st.M, name: st.name });
    a.closeModal(); a.save(); a.renderPanel();
  };
  const B = (t, r, fn, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
  const box = dlog20(458, 270, txt20(Wd.title, D.title), name, picBox, ...parts, txt20(Wd.cls, [pp[0] + 1, pp[1], pp[2], pp[1] + D.popW]), sel, ...[],
    B(Wd.name, D.name, () => { st.name = H().designName(g, p, st.type); name.value = st.name; named = true; }),
    B(Wd.cancel, D.cancel, () => a.closeModal()), B(Wd.ok, D.ok, create, true));
  box.classList.add('ct6010');
  show();
  a.modal('', box, { cls: 'mac12 dl20w dlg6010', label: Wd.title });
  setTimeout(() => name.focus(), 0);
}

// the players' strip at the foot of the map window (DrawIconRect @c5452): each player's face (your own planet for you), the name, a cross
// over a player who is out, and a check mark by a player who has ended the turn
function roster(panel) {
  const a = A(), el = a.el, g = G();
  if (!g) return;
  const later = H().rules(g).id !== '12'; // 1.2's own rules: the strip is as 1.2 draws it
  const box = el('section', { class: 'box roster12', 'aria-label': 'Players' });
  for (const p of g.players) {
    const key = p.id === a.ME ? 'white0_0' : 'bad' + (p.face || 0) + '_0', im = a.IMG[key];
    const done = !p.human || (g.done || []).includes(p.id);
    // (the remake's own: a later ruleset's pacts, a ring round the face, double for a best buddy: the idea of 3.0.1's halo drawn in 1 bit,
    // as the halo's picture is only the top of a planet's ring; 1.2's own rules show none)
    const bud = later && p.id !== a.ME && p.alive && H().isBuddy(g, a.ME, p.id), ally = bud || (later && p.id !== a.ME && p.alive && H().isAllied(g, a.ME, p.id));
    const face0 = im ? el('img', { src: im.src, alt: '', width: 16, height: 16 }) : el('span');
    const face = ally ? el('span', { class: 'rface remake12 ' + (bud ? 'buddy' : 'ally'), title: bud ? 'Your best buddy' : 'Your ally' }, face0) : face0;
    box.append(el('div', { class: 'rrow' + (p.alive ? '' : ' out') },
      face, raw('span', p.name, { class: 'rname' }),
      done && p.alive ? raw('span', '✓', { class: 'rdone', 'aria-label': 'done' }) : null));
  }
  // (the remake's own: in a later ruleset the strip opens the Players window, where the pacts are; no right click)
  if (later) { box.classList.add('remake12', 'rclick'); box.setAttribute('role', 'button'); box.tabIndex = 0; box.title = 'Players'; box.addEventListener('click', () => a.openPlayers()); box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.openPlayers(); } }); }
  panel.append(box);
}

// the status window while the turn is worked out (EndTurn @a0004, OpenStatusDialog: DLOG 7000, its text and progress bar; STR# 1040)
const PASSES = {
  en: ['Processing Turn...', 'Pass 1 for Player %d...', 'Battle Stage...', 'Pass 2 for Player %d...', 'Writing Game File...'],
  fr: ['Calcul du tour...', 'Phase 1 pour Joueur %d...', 'Phase des batailles...', 'Phase 2 pour Joueur %d...', 'Ecriture fichier Jeu...'],
};
// the status window (DLOG 7000, shot031, lost003-007): 243 x 73 inside the frame, the words in Chicago 12 at (13, 15) and a 200 x 16 bar at (13, 39), black line, filled with a black and white checker as far as the work has got
function status20(text, max) {
  const a = A(), el = a.el, txt = raw('span', text, { class: 'dt20', style: 'position:absolute;left:13px;top:15px;white-space:nowrap' }), fill = el('div', { class: 'fill20' });
  const bar = el('div', { class: 'bar20', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, style: 'position:absolute;left:13px;top:39px' }, fill);
  const st = { txt, box: dlog20(237, 67, txt, bar), set value(v) { fill.style.width = Math.round(198 * Math.min(1, v / max)) + 'px'; bar.setAttribute('aria-valuenow', v); } };
  st.value = 0; return st;
}
function turnProgress(g, go) {
  const a = A(), el = a.el, W = PASSES[lang()], n = g.players.length;
  const steps = [W[0]];
  for (let i = 1; i <= n; i++) steps.push(fill(W[1], i));
  steps.push(W[2]);
  for (let i = 1; i <= n; i++) steps.push(fill(W[3], i));
  steps.push(W[4]);
  const st = status20(steps[0], steps.length), txt = st.txt, bar = st;
  a.modal('', st.box, { cls: 'small mac12 dl20w', label: steps[0] });
  let i = 0;
  const step = () => {
    if (++i >= steps.length) { a.closeModal(); go(); return; }
    txt.textContent = steps[i]; bar.value = i;
    setTimeout(step, 40);
  };
  setTimeout(step, 40);
}

// the budget and technology boxes as 1.2 draws them: the budget bars' heading strip (DrawHBarControl @c091e: "0%" at the left, "100%"
// at the right, STR# 1001.6 and .10, and the scale's word "Lin" / "Log", 1005.24 / .23; English Mac 2.0.1 "Linear" / "Log"), the slots
// "Tech" and "Epargne" (1005.25, .26), a colony's name in italics when its share is under what pays its loss and underlined when it is
// the selected star, a tick at that least share; the technology window's "Technologie" / "Niveaux actuels" (1001.11-12; English
// "Tech Spending", "Current Levels:") over the five bars
const BAR_WORDS = { fr: { lin: 'Lin', log: 'Log', tech: 'Tech', sav: 'Epargne', head: 'Technologie', levels: 'Niveaux actuels' },
  en: { lin: 'Linear', log: 'Log', tech: 'Tech', sav: 'Savings', head: 'Tech Spending', levels: 'Current Levels:' } };
function bars(panel, B) {
  const a = A(), el = a.el, g = G(), W = BAR_WORDS[lang()], rs = H().rules(g), p = a.me();
  if (B.budget) {
    const h = B.budget.querySelector('h3');
    if (h) {
      const sc = a.budgetScale();
      h.textContent = ''; h.classList.add('strip12');
      h.append(raw('span', '0%'), raw('span', sc.id === 'log' ? W.log : W.lin), raw('span', '100%'));
    }
    const rows = B.budget.querySelectorAll('.barrow'), low = new Set((rs.underfunded ? rs.underfunded(g, p) : []).map(s => s.id));
    (B.ents || []).forEach((e, i) => {
      const r = rows[i]; if (!r) return;
      const lab = r.querySelector('.blabel');
      if (lab && e.key === 'tech') { lab.textContent = W.tech; lab.setAttribute('translate', 'no'); }
      if (lab && e.key === 'savings') { lab.textContent = W.sav; lab.setAttribute('translate', 'no'); }
      if (e.star != null && lab) {
        lab.style.fontStyle = low.has(e.star) ? 'italic' : '';
        lab.style.textDecoration = a.UI.sel === e.star ? 'underline' : '';
        lab.style.fontWeight = 'normal';
        // (FollowStarNameClick @c2388: a click on a colony's name selects it and brings the map to it)
        lab.style.cursor = 'pointer'; lab.onclick = (ev) => { ev.stopPropagation(); a.UI.sel = e.star; a.centerOn(e.star); a.renderPanel(); a.draw(); };
        const min = rs.minShare ? rs.minShare(g, p, e.star) : 0, tr = r.querySelector('.track');
        if (min > 0 && tr) { tr.style.position = 'relative'; tr.append(el('div', { class: 'mintick', style: `left:${(a.budgetScale().toX(min) * 100).toFixed(1)}%` })); }
      }
    });
  }
  if (B.tech) {
    const h = B.tech.querySelector('h3');
    if (h) { h.textContent = W.head; h.setAttribute('translate', 'no'); h.after(raw('p', W.levels, { class: 'sub' })); }
  }
}

// the Apple menu's "About Spaceward Ho! 1.2…" (DoAppleMenu @e2604: DLOG 1101, PICT 1001 over PICT 4010; a click closes it, WaitForInput)
function aboutBox() {
  const a = A(), el = a.el, im = a.IMG['dos:p1001'], pl = a.IMG['dos:p4010'];
  const body = el('div', { class: 'about12', onclick: () => a.closeModal() }, im ? el('img', { src: im.src, alt: 'Spaceward Ho!' }) : null, pl ? el('img', { src: pl.src, alt: '' }) : null);
  a.modal('', body, { cls: 'mac12 about', label: V4 ? 'About Spaceward Ho! 4.0…' : V3 ? 'About Spaceward Ho! 3.0…' : V2 ? 'About Spaceward Ho! 2.0…' : 'About Spaceward Ho! 1.2…' });
  // (3.0.1's DoAppleMenu @f3b48: the colour box, DLOG 1100, plays sound 10000, "Move 'em out!"; the black-and-white one, 1101, none. Its
  // licensee's plate, PICT 4010, is drawn by the program (GetLicensePict) and isn't in the resources: not drawn here)
  if (V3 && COLOUR3) a.Sound.play(10000);
}

// DLOG 6060 "Organize “<type>” Fleets…" (OrganizeFleets @113896): the fleets of the selected fleet's design at the star as piles of ship
// pictures; "To Organize Fleets:", "• Click and drag fleets into desired number of piles", "• Shift-Click selects an entire pile";
// "Group All" (one pile), "Divide All" (a pile per ship); OK makes the piles the fleets (the first fleets keep their records and orders,
// a new pile is a new fleet: rs.organized), Cancel leaves them
function organize(f0) {
  // a fleet of more than one design (5.0.5's can be): this window moves ships of one design between single-design fleets (1.2's rule), so the classic
  // organizer, whose piles are a design in a fleet, does it
  if (Object.keys(f0.ships).length > 1 && A().organizeStyle && A().organizeStyle()) { A().openOrganize(f0.star); return; }
  const a = A(), el = a.el, g = G(), did = +Object.keys(f0.ships)[0], d = H().getDesign(g, a.ME, did);
  const fleets = g.fleets.filter(f => f.owner === a.ME && f.star === f0.star && f.to == null && Object.keys(f.ships).length === 1 && +Object.keys(f.ships)[0] === did);
  const piles = fleets.map(f => ({ f, n: f.ships[did] }));
  let sel = null; // { pile, all }
  // OrganizeFleets @113896 / DRAWORGFLEETS @113ea8, DrawOneOrgFleet @113f10 (Jake's captures organize-*): each pile one cell, the small picture
  // (120 x 40) with its count at the left, the piles down the box 50 pixels apart (3 to a column, the next column 135 to the right); the chosen
  // pile inverted; a drag carries a dotted outline of the cell, and dropping it on a pile moves one ship there (Shift: the whole pile), below
  // the piles makes a new one. A click alone chooses the pile.
  const box = el('div', { class: 'org12', style: 'position:relative;overflow:hidden;background:#fff' });
  const cellAt = (i) => [16 + 135 * Math.floor(i / 3), 1 + 50 * (i % 3)];
  const shown = () => piles.map((p, i) => ({ p, i })).filter(o => o.p.n || o.p.f);
  const show = () => {
    box.innerHTML = '';
    shown().forEach(({ p, i }, k) => {
      if (!p.n) return;
      const [x, y] = cellAt(k), on = sel && sel.pile === i;
      const cell = el('div', { class: 'opile' + (on ? ' sel' : ''), 'data-pile': i, role: 'button', tabindex: 0, 'aria-label': `${p.n} × ${d.name}`, style: `position:absolute;left:${x}px;top:${y}px;width:128px;height:43px` },
        raw('span', String(p.n), { class: 'ocount' }), a.shipImgEl(d, 40));
      box.append(cell);
    });
  };
  // the drag: pointer events (a mouse and a finger alike), the outline following the pointer
  let drag = null;
  box.addEventListener('pointerdown', (e) => {
    const cell = e.target.closest('.opile'); if (!cell) return;
    e.preventDefault(); const i = +cell.dataset.pile, r = box.getBoundingClientRect(), z = r.width / box.offsetWidth || 1;
    sel = { pile: i, all: e.shiftKey }; show();
    const ghost = el('div', { class: 'oghost', style: `position:absolute;width:128px;height:43px;left:${cell.offsetLeft}px;top:${cell.offsetTop}px` });
    drag = { i, ghost, dx: (e.clientX - r.left) / z - cell.offsetLeft, dy: (e.clientY - r.top) / z - cell.offsetTop, moved: false, z };
    try { box.setPointerCapture(e.pointerId); } catch (x) {}
  });
  box.addEventListener('pointermove', (e) => {
    if (!drag) return; const r = box.getBoundingClientRect(), x = (e.clientX - r.left) / drag.z - drag.dx, y = (e.clientY - r.top) / drag.z - drag.dy;
    if (!drag.moved && Math.hypot(x - drag.ghost.offsetLeft, y - drag.ghost.offsetTop) > 3) { drag.moved = true; box.append(drag.ghost); }
    drag.ghost.style.left = x + 'px'; drag.ghost.style.top = y + 'px';
  });
  const drop = (e) => {
    if (!drag) return; const g0 = drag; drag = null; g0.ghost.remove(); if (!g0.moved || e.type === 'pointercancel') return;
    const r = box.getBoundingClientRect(), x = (e.clientX - r.left) / g0.z, y = (e.clientY - r.top) / g0.z;
    const hit = shown().filter(o => o.p.n).map(({ i }, k) => ({ i, at: cellAt(k) })).find(o => x >= o.at[0] && x < o.at[0] + 128 && y >= o.at[1] && y < o.at[1] + 43);
    moveTo(hit ? hit.i : -1);
  };
  box.addEventListener('pointerup', drop); box.addEventListener('pointercancel', drop);
  const moveTo = (i) => {
    if (!sel) return;
    const from = piles[sel.pile], n = sel.all ? from.n : 1;
    if (i === -1) { piles.push({ f: null, n: 0 }); i = piles.length - 1; }
    if (i === sel.pile) { sel = null; show(); return; }
    from.n -= n; piles[i].n += n; sel = null; show();
  };
  show();
  const apply = () => {
    // the piles that stay with a fleet, the ships to hand out, then the new piles
    const temps = [];
    for (const p of piles) if (p.f && p.n < p.f.ships[did]) {
      if (p.n === 0) temps.push(p.f); else { const t = H().splitFleet(g, p.f, { [did]: p.f.ships[did] - p.n }); if (t) temps.push(t); }
    }
    const take = (need) => { // a fleet of exactly `need` ships from the temps
      let got = null;
      while (need > 0 && temps.length) {
        let t = temps[0];
        if (t.ships[did] > need) t = H().splitFleet(g, t, { [did]: need }); else temps.shift();
        need -= t.ships[did];
        if (got) H().mergeFleets(g, got, t); else got = t;
      }
      return got;
    };
    for (const p of piles) if (p.f && p.n > (p.f.ships[did] || 0)) { const t = take(p.n - p.f.ships[did]); if (t) H().mergeFleets(g, p.f, t); }
    for (const p of piles) if (!p.f && p.n > 0) take(p.n);
    a.closeModal(); a.save(); a.renderPanel(); a.draw();
  };
  if (!V2 && lang() === 'fr') { // 1.2F's DITL 6060 (439 x 285): the heading (13, 5), the two lines (16, 21) and (16, 35), the piles (12, 56, 405 x 180), Tout regrouper (11, 249), Tout diviser (126, 249), Annuler (263, 249), OK (340, 249)
    const b2 = (t, fn, r, def) => put20(el('button', { type: 'button', class: 'ok20' + (def ? ' def20' : ''), onclick: fn }, raw('span', t)), r);
    const grp = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; show(); };
    const dvd = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach(p => { p.n = 0; }); for (let k = 0; k < t; k++) { if (k < piles.length) piles[k].n = 1; else piles.push({ f: null, n: 1 }); } sel = null; show(); };
    box.style.border = '1px solid #000'; box.style.boxSizing = 'border-box';
    const T = (t, r) => { const n = txt20(t, r); n.style.whiteSpace = 'nowrap'; n.style.overflow = 'visible'; return n; };
    a.modal('', dlog20(439, 285, T('Pour organiser les flottes:', [5, 13, 20, 207]), T('•\u00a0Cliquer et tirer chaque vaisseau vers le groupe final.', [21, 16, 37, 427]), T('•\u00a0Shift-Clic sélectionne un groupe de vaisseaux.', [35, 16, 51, 362]),
      put20(box, [56, 12, 236, 417]), b2('Tout regrouper', grp, [249, 11, 271, 117]), b2('Tout diviser', dvd, [249, 126, 271, 214]), b2('Annuler', () => a.closeModal(), [249, 263, 271, 328]), b2('OK', apply, [249, 340, 269, 412], true)), { cls: 'mac12 dl20w dlg6010', label: 'Pour organiser les flottes' });
    return;
  }
  if (V2 || lang() !== 'fr') { // DLOG 6060 (439 x 285, DITL 6060): the heading (0, 13), the two lines (18, 16) and (35, 16), the piles (56, 12, 405 x 180), the buttons at y 249: Group All (45), Divide All (131), Cancel (232), OK (340)
    box.style.border = '1px solid #000'; box.style.boxSizing = 'border-box';
    const b2 = (t, fn, r) => put20(el('button', { type: 'button', class: 'ok20', onclick: fn }, raw('span', t)), r);
    const grp = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; show(); };
    const dvd = () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach(p => { p.n = 0; }); for (let k = 0; k < t; k++) { if (k < piles.length) piles[k].n = 1; else piles.push({ f: null, n: 1 }); } sel = null; show(); };
    a.modal('', dlog20(439, 285, txt20('To Organize Fleets:', [0, 13, 16, 142]), txt20('• Click and drag fleets into desired number of piles', [18, 16, 35, 363]), txt20('• Shift-Click selects an entire pile', [35, 16, 51, 362]),
      put20(box, [56, 12, 236, 417]), b2('Group All', grp, [249, 45, 269, 110]), b2('Divide All', dvd, [249, 131, 269, 196]), b2('Cancel', () => a.closeModal(), [249, 232, 269, 297]), b2('OK', apply, [249, 340, 269, 412])), { cls: 'mac12 dl20w', label: 'Organize Fleets' });
    return;
  }
  win(el('div', null, el('p', null, 'To Organize Fleets:'), el('p', { class: 'sub' }, '• Click and drag fleets into desired number of piles'), el('p', { class: 'sub' }, '• Shift-Click selects an entire pile'), box,
    el('div', { class: 'btns' }, btn('Group All', () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; show(); }, { class: 'quiet' }),
      btn('Divide All', () => { const t = piles.reduce((x, p) => x + p.n, 0); piles.forEach(p => { p.n = 0; }); for (let k = 0; k < t; k++) { if (k < piles.length) piles[k].n = 1; else piles.push({ f: null, n: 1 }); } sel = null; show(); }, { class: 'quiet' }),
      btn('Cancel', () => a.closeModal(), { class: 'quiet' }), btn('OK', apply))));
}

// keys on the map (KeyTheHo): letters pick a star by the first letters of its name (KeyPlanet @c6252: what was typed within a second, six
// letters at most, a beep past them), Tab the next fleet of yours at the selected star (TabThroughFleets @c68c2); End Turn is ⌘T
// (3.0.1's KeyTheHo, KeyPlanet and TabThroughFleets differ from 2.0.1's: not in the 3.0.1 skins until read)
const typed = { s: '', t: 0 };
document.addEventListener('keydown', (e) => {
  const a = A(), g = G();
  if (V3 || !a || !g || !own() || a.UI.modal || document.querySelector('.scrim') || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.key === 'Tab') {
    const s = selStar(); if (!s) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const fs = a.fleetOrder(g.fleets.filter(f => f.owner === a.ME && f.star === s.id && f.to == null));
    if (!fs.length) return;
    const i = fs.findIndex(f => f.id === a.UI.selFleet);
    a.UI.selFleet = fs[(i + 1) % fs.length].id; a.renderPanel(); a.draw();
    return;
  }
  if (!/^[A-Za-z]$/.test(e.key)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const now = Date.now();
  if (now - typed.t > 1000) typed.s = '';
  typed.t = now;
  if (typed.s.length >= 6) { if (a.beep) a.beep(); return; }
  typed.s += e.key.toLowerCase();
  const st = g.stars.find(x => x.name.toLowerCase().startsWith(typed.s));
  if (st) { a.UI.sel = st.id; a.centerOn(st.id); a.renderPanel(); a.draw(); }
}, true);

// Correction dépenses ⌘F (FixSpendingBars @c1fb0, FixNextSpendingBar @c1b48): one step at a time, its line in the announcement bubble
// (DrawAnnounceBubble: the report picture 3110, the line, "Suite…" while slots are left to look at); a click on the bubble, or ⌘F
// again, takes the next step; when none is left the bubble goes and the End Turn button is back
const FIX = { cur: null, n: 0 };
let LASTB = 0;
function fixStep() {
  const a = A(), g = G(), FS = H().rules(g).fixSpending;
  if (!FS) return;
  const r = FS.next(g, a.me(), FIX.cur == null ? -1 : FIX.cur);
  FIX.cur = r.cur; a.renderPanel(); a.save();
  const box = document.querySelector('#msg');
  if (r.text == null || !box) { FIX.cur = null; a.renderMsg(); return; }
  const el = a.el, im = a.IMG[(window.HOTHEME && HOTHEME.prefix || 'dos:') + 'i3110'] || a.IMG['m9024'];
  const slots = 2 + H().colonies(g, a.ME).length, more = FIX.cur < slots - 1;
  box.innerHTML = '';
  const card = el('div', { class: 'card', tabindex: 0, role: 'button', onclick: fixStep });
  card.append(im ? el('img', { src: im.src, alt: '', class: 'micon' }) : el('span'), el('div', { class: 'mtext' }, raw('p', r.text.indexOf('{') >= 0 ? H().trSuffixes(r.text) : r.text), more ? raw('div', H().rules(g).bubbleMore[lang()] || '', { class: 'count' }) : null));
  box.append(card);
}

// ---------- Mac 2.0.1's own dialogs (the DLOGs it added; read in audit/mac-2.0.1 of the private repo) ----------
// a dialog's item at its DITL rectangle (top, left, bottom, right), in the DLOG's pixels
const at20 = (r) => `position:absolute;left:${r[1]}px;top:${r[0]}px;width:${r[3] - r[1]}px;height:${r[2] - r[0]}px`;
const dlog20 = (w, h, ...items) => A().el('div', { class: 'dl20', style: `position:relative;width:${w}px;height:${h}px` }, ...items);
const txt20 = (t, r) => raw('span', t, { class: 'dt20', style: at20(r) });
const ok20 = (t, r, fn) => A().el('button', { type: 'button', class: 'ok20', onclick: fn, style: at20(r) + ';min-width:0;padding:0' }, raw('span', t));
// DLOG 4060 (doPollingTimeDialog @1227b4, DITL 4060, CNTL 4060: the setup +0x3e in ticks / 60 as seconds, 1 to 30 (SetCtlMin 1, SetCtlMax $1e), the number
// in the text at (56, 99); OK only, no Cancel: the value is kept when the slider is let go and OK is pressed)
function pollingTime20() {
  const a = A(), P = a.Prefs, O = (H().rules(G()).options || {}).poll || H().rulesById('mac20').options.poll, v0 = P.poll != null ? P.poll : O.def; // (another ruleset in the 2.0.1 skin: 2.0.1's own setting)
  const num = raw('span', String(v0), { class: 'dt20', style: at20([56, 99, 72, 124]) + ';text-align:right' });
  const sl = a.el('input', { type: 'range', min: 1, max: 30, value: v0, style: at20([39, 58, 55, 188]), 'aria-label': 'Polling Time', oninput: (e) => { num.textContent = e.target.value; } });
  a.modal('', dlog20(263, 194, txt20('Polling Time:', [13, 13, 33, 168]), txt20('Fast', [39, 26, 55, 58]), sl, txt20('Slow', [39, 190, 55, 235]), num, txt20('Seconds', [56, 125, 72, 200]),
    txt20('A fast polling time will let you know about turn updates more quickly but may slow down the computer.', [78, 13, 142, 250]),
    ok20('OK', [147, 173, 167, 231], () => { P.poll = +sl.value; a.savePrefs(); a.closeModal(); })), { cls: 'mac12 dl20w', label: 'Polling Time' });
  return true;
}
// DLOG 4020 (doAutoPlayDialog @12243c, DITL 4020, CNTL 4020): three radio buttons (the player's mode: 2 "Have computer play for me", 3 "Just mark me done every turn",
// else "I'll play my own turns, thank you."), the seconds an event message stays (setup +0x40 in ticks / 60, 0 to 15); OK only. The remake plays the turns itself, in
// the page, until the Auto Play window or another one is opened (the original sets the player's mode in the game file, which another machine's update acts on:
// its alerts 3200 "the file was busy" and 3240 "your current turn has already been marked done" have nothing to say here)
function autoPlay20() {
  const a = A(), P = a.Prefs, secs0 = P.autoSecs != null ? P.autoSecs : 2;
  const words = ['Have computer play for me.', 'Just mark me done every turn.', 'I’ll play my own turns, thank you.'], rects = [[39, 12, 57, 236], [65, 12, 82, 275], [90, 12, 109, 300]];
  let mode = 2;
  const radios = words.map((w, i) => { const r = a.el('input', { type: 'radio', name: 'ap20', checked: i === 2 ? 'checked' : false, onchange: () => { mode = i; } }); return a.el('label', { style: at20(rects[i]) + ';display:flex;align-items:center;gap:4px' }, r, raw('span', w)); });
  const num = raw('span', String(secs0), { class: 'dt20', style: at20([164, 13, 180, 34]) });
  const sl = a.el('input', { type: 'range', min: 0, max: 15, value: secs0, style: at20([164, 104, 180, 234]), 'aria-label': 'Seconds', oninput: (e) => { num.textContent = e.target.value; } });
  a.modal('', dlog20(314, 241, txt20('Auto Play:', [13, 13, 29, 88]), ...radios, txt20('Under auto play, event messages disappear after:', [121, 13, 153, 245]), num, txt20('Seconds', [164, 39, 180, 95]), sl,
    ok20('OK', [205, 235, 225, 293], () => {
      P.autoSecs = +sl.value; a.savePrefs(); a.closeModal();
      if (mode < 2) a.runAutoPlay({ turns: Infinity, computer: mode === 0, won: false, lost: false, news: false, every: P.autoSecs });
    })), { cls: 'mac12 dl20w', label: 'Auto Play' });
  return true;
}

// A list of cells as the program draws them (LDEF 1001 @ the resource fork; InitMessageLists @121c4c, SetCellsToPlayers / Actions / ObjTypes): a grid of 45 x 45 cells, each an
// icon 32 x 32 (ICN#, at the cell's centre less (16, 21)) with its name under it (a 13 pixel strip, Geneva 9, centred, condensed when too wide), the picked cell inverted;
// no scroll bars. cells: [{ icon: 'dos:i3000', name, id, off }]
function cells20(cols, rows, cells, o) {
  const a = A(), el = a.el, W = 45, box = el('div', { class: 'cl20', role: 'listbox', style: `position:relative;width:${cols * W}px;height:${rows * W}px;border:0` });
  let sel = o && o.sel != null ? o.sel : null;
  const draw = () => {
    box.textContent = '';
    setTimeout(() => fitNames(), 0);
    cells.forEach((c, i) => {
      const x = (i % cols) * W, y = Math.floor(i / cols) * W, im = c.icon && a.IMG[c.icon];
      const d = el('div', { class: 'c20' + (sel === i ? ' sel' : '') + (c.off ? ' off' : ''), role: 'option', 'aria-selected': sel === i ? 'true' : 'false', tabindex: c.off ? -1 : 0, style: `position:absolute;left:${x}px;top:${y}px;width:${W}px;height:${W}px`, onclick: () => { if (c.off || !o || !o.pick) return; sel = i; draw(); o.pick(c, i); } },
        im ? el('img', { src: im.src, alt: '', style: 'position:absolute;left:6px;top:1px;width:32px;height:32px;image-rendering:pixelated' }) : null,
        raw('span', c.name, { class: 'n20', style: 'position:absolute;left:0;right:0;top:33px;height:13px;line-height:13px;text-align:center;white-space:nowrap;overflow:hidden' }));
      box.append(d);
    });
  };
  const fitNames = () => { for (const n of box.querySelectorAll('.n20')) { n.style.transform = ''; const w = n.scrollWidth; if (w > W) { n.style.overflow = 'visible'; n.style.transform = `scaleX(${(W - 1) / w})`; } } };
  draw(); fitNames(); setTimeout(fitNames, 0);
  return { el: box, set(c, s2) { cells = c; sel = s2 == null ? null : s2; draw(); } };
}
// DLOG 6070 "Send Message" (SendMessage @120f42, DITL 6070, STR# 3000-3002): "Send Message:" at (7, 6), the prompt of the step at (7, 154) (STR# 3002: "Send Message To Who?", "Saying What?",
// "About What?", "Which One?"), the left list (item 4, one column of four cells, 47 x 182 at (33, 81)) holding what has been chosen (labelled "To:" at (47, 44) and "Content:" at (85, 15)),
// the right list (item 5, five columns of four cells, 227 x 182 at (33, 154)) the choices of this step: the other players (their hats), "I Like" / "I Don’t Like" / "I Own" (ICN# 3000-3002),
// "Planet" / "Player" (ICN# 3010, 3011; "I Own" has only the planet), then the stars or the players. Send (default, dimmed until all four are chosen) and Cancel at (227, 318) and (228, 241);
// a chosen cell on the left takes the message back to its step. The lines the choices make are the ruleset's (rs.cannedChat: report codes $40c-$410).
function chat20() {
  const a = A(), el = a.el, g = G(), ME = a.ME, C = H().rules(g).cannedChat;
  const tos = C.to(g, ME), ok = tos.filter(o => !o[2]);
  if (!ok.length) { a.toast(H().say(g, H().DATA.alerts[6] || 'There is no one else to send something to.')); return true; }
  const PR = ['Send Message To Who?', 'Saying What?', 'About What?', 'Which One?'];
  const hat = (q) => 'dos:i' + (q.id === ME ? (q.female ? 1500 : 1000) : (q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const pl = (id) => g.players[+id];
  let step = 0; const ch = [null, null, null, null]; // each: { id, name, icon, i }
  const prompt = raw('span', PR[0], { class: 'dt20', style: at20([7, 154, 24, 355]) });
  const left = cells20(1, 4, [], {}), right = cells20(5, 4, [], {});
  const send = a.el('button', { type: 'button', class: 'ok20', disabled: 'disabled', style: at20([227, 318, 247, 376]) + ';min-width:0;padding:0', onclick: a.guard(() => {
    const r = H().sendCanned(g, ME, C.make(g, ME, isNaN(+ch[0].id) ? ch[0].id : +ch[0].id, ch[1].i, [ch[2].i, isNaN(+ch[3].id) ? ch[3].id : +ch[3].id]));
    if (r === 'limit') { a.chatLimitToast(); return; } if (r !== 'ok') return; a.Sound.play(5000); a.closeModal(); a.save();
  }) }, raw('span', 'Send'));
  const choices = () => {
    if (step === 0) return tos.map(o => ({ id: String(o[0]), name: o[1], icon: pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
    if (step === 1) return C.actions.map((x, i) => ({ id: i, i, name: x.label, icon: 'dos:i' + (3000 + i) }));
    if (step === 2) return C.actions[ch[1].i].parts[0][2].map((o, i) => ({ id: i, i, name: o[0], icon: 'dos:i' + (3010 + i), kind: o[1] }));
    const kind = ch[2].kind; return C.list(g, ME, kind, a.UI.sel).map(o => ({ id: String(o[0]), name: o[1], icon: kind === 'players' && pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
  };
  const refresh = () => {
    prompt.textContent = PR[Math.min(step, 3)];
    left.set(ch.map(c => c ? { name: c.name, icon: c.icon } : { name: '' }), null);
    right.set(step > 3 ? [] : choices(), null);
    right.el.querySelectorAll('.c20').forEach((d, i) => { const c = step > 3 ? null : choices()[i]; if (c) d.onclick = () => { if (c.off) return; ch[step] = { id: c.id, i: c.i, name: c.name, icon: c.icon, kind: c.kind }; step = ch[1] && ch[1].i === 2 && step === 1 ? 2 : step + 1; if (step === 2 && ch[1].i === 2) { /* "I Own": the planet is the one choice */ } refresh(); }; });
    left.el.querySelectorAll('.c20').forEach((d, i) => { d.onclick = () => { if (!ch[i]) return; for (let k = i; k < 4; k++) ch[k] = null; step = i; refresh(); }; });
    if (step > 3) send.removeAttribute('disabled'); else send.setAttribute('disabled', 'disabled');
  };
  const frame = (r) => a.el('div', { style: at20([r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]) + ';border:1px solid #000;box-sizing:border-box' });
  const put = (n, r) => { n.setAttribute('style', (n.getAttribute('style') || '') + ';' + at20(r)); return n; };
  refresh();
  a.modal('', dlog20(392, 261, txt20('Send Message:', [7, 6, 25, 137]), prompt, txt20('To:', [47, 44, 63, 74]), txt20('Content:', [85, 15, 101, 74]), frame([33, 81, 215, 128]), frame([33, 154, 215, 381]),
    put(left.el, [34, 82, 214, 127]), put(right.el, [34, 155, 214, 380]), send,
    a.el('button', { type: 'button', class: 'ok20', style: at20([228, 241, 248, 299]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'Cancel'))), { cls: 'mac12 dl20w', label: 'Send Message' });
  return true;
}

// DLOG 6080 "Create New Galaxy" (CreateGalaxyDlg @e03dc, InitCreateGalaxyLists @e06e8, DITL 6080, 460 x 273): four lists of one row of 45 x 45 picture cells (the ICN# 3020-3024 shapes, 3050-3051
// densities, 3030-3032 computer intelligence, 3040-3044 sizes: each cell's name is its icon's resource name), the number of computers on a slider from 0 to 19 with its number at (234, 13),
// Create (225, 351) and Cancel (225, 273). It sits over the New Game window's own fields, which it sets (the form stays the model; the version, language, skin, names and
// skill, which the original asked in its Identify and Join dialogs, are under "More…": the remake's own).
function createGalaxy20(f, ctx) {
  const a = A(), el = a.el, win = f.closest('.win'); if (!win) return;
  const field = (n) => f.querySelector(`[name="${n}"]`), fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  const LISTS = [
    { sel: 'd_shape', rect: [52, 221, 99, 448], icons: [3020, 3021, 3022, 3023, 3024], names: ['Circle', 'Random', 'Ring', 'Spiral', 'Grid'], label: ['Galaxy Style:', [26, 221, 46, 356]] },
    { sel: 'd_density', rect: [52, 13, 99, 105], icons: [3050, 3051], names: ['Dense', 'Sparse'], label: ['Galaxy Density:', [26, 13, 49, 153]] },
    { sel: 'd_iq', rect: [143, 13, 190, 150], icons: [3030, 3031, 3032], names: ['Dumb', 'Average', 'Smart'], label: ['Computer Intelligence:', [117, 13, 135, 193]] },
    { sel: 'd_size', rect: [143, 221, 190, 448], icons: [3040, 3041, 3042, 3043, 3044], names: ['Small', 'Medium', 'Large', 'Extra Large', 'Humongous'], label: ['Galaxy Size:', [117, 221, 136, 343]] }];
  const comp = field('computers'), parts = [];
  const frame = (r) => el('div', { style: at20([r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]) + ';border:1px solid #000;box-sizing:border-box' });
  const lists = LISTS.map((L) => {
    const sel = field(L.sel); if (!sel) return null;
    const vals = [...sel.options].map(o => o.value), cl = () => cells20(L.icons.length, 1, L.icons.map((n, i) => ({ icon: 'dos:i' + n, name: L.names[i], id: vals[i] })), { sel: Math.max(0, vals.indexOf(sel.value)),
      pick: (c) => { sel.value = c.id; fire(sel); } }), w = cl();
    w.el.setAttribute('style', w.el.getAttribute('style') + ';' + at20([L.rect[0] + 1, L.rect[1] + 1, L.rect[2] - 1, L.rect[3] - 1]));
    parts.push(frame(L.rect), txt20(L.label[0], L.label[1]), w.el); return w;
  });
  const num = raw('span', comp ? comp.value : '', { class: 'dt20', style: at20([234, 13, 250, 38]) + ';text-align:right' });
  const sl = el('input', { type: 'range', min: 0, max: 19, value: comp && /^\d+$/.test(comp.value) ? comp.value : 4, style: at20([234, 39, 250, 169]), 'aria-label': 'Number of Computer Players',
    oninput: (e) => { if (comp) { comp.value = e.target.value; fire(comp); } num.textContent = e.target.value; } });
  if (comp && !/^\d+$/.test(comp.value)) num.textContent = comp.value;
  let opened = false;
  const moreBtn = el('button', { type: 'button', class: 'ok20', style: 'position:absolute;left:13px;top:254px;min-width:0;padding:0 6px;height:20px', onclick: () => { opened = !opened; dress(); } }, raw('span', 'More… (the remake’s own)'));
  const box = dlog20(460, 273, txt20('Create New Galaxy', [0, 143, 19, 284]), ...parts, txt20('Number of Computer Players:', [208, 13, 228, 216]), num, sl,
    el('button', { type: 'button', class: 'ok20 def20', style: at20([225, 351, 245, 409]) + ';min-width:0;padding:0', onclick: () => f.requestSubmit() }, raw('span', 'Create')),
    el('button', { type: 'button', class: 'ok20', style: at20([225, 273, 245, 331]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'Cancel')), moreBtn);
  const holder = el('div', { class: 'cg20' }, box);
  const rest = [...f.childNodes]; f.prepend(holder);
  // (the version, language and skin choices stay where they are: they are the remake's own and the skin's rules checks use them)
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules'), dress = () => { const on = !rs || rs.value === 'mac20'; box.style.display = on ? '' : 'none'; moreBtn.style.display = on ? '' : 'none'; for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  if (rs) rs.addEventListener('change', dress); dress();
}

// 3.0.1's Create New Galaxy (doCreateGalaxyDlg @f0550; DLOG 6080, 456 x 263, DITL 6080 read in the private repo's resource fork): the
// four lists at their user items (Style 3020-3025 with Cluster, Density 3050-3051, Intelligence 3030-3033 with Diabolical, Size 3040-3044;
// LDEF 1001's 45 x 45 cells, as 2.0.1's), "Number of Computer Players:" with its number (200, 10) and slider (CNTL 6080 at 200, 36),
// "Years Per Turn…" (188, 220) and the years (190, 348), "Alliances" (230, 10), Cancel (228, 301) and Create (228, 379), the default ring
// (user item 3). Jake's captures 005, 006, 165. The remake's own choices (version, skin, language, the rest) under "More…", as 2.0.1's.
function createGalaxy301(f) {
  const a = A(), el = a.el, win = f.closest('.win'); if (!win) return;
  const field = (n) => f.querySelector(`[name="${n}"]`), fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  const LISTS = [
    { sel: 'm_shape', rect: [40, 170, 87, 442], icons: [3020, 3021, 3022, 3023, 3024, 3025], names: ['Circle', 'Random', 'Ring', 'Spiral', 'Grid', 'Cluster'], label: ['Galaxy Style:', [20, 170, 38, 262]] },
    { sel: 'm_density', rect: [40, 10, 87, 102], icons: [3050, 3051], names: ['Dense', 'Sparse'], label: ['Galaxy Density:', [20, 10, 38, 119]] },
    { sel: 'm_iq', rect: [120, 10, 167, 192], icons: [3030, 3031, 3032, 3033], names: ['Dumb', 'Average', 'Smart', 'Diabolical'], label: ['Computer Intelligence:', [100, 10, 118, 190]] },
    { sel: 'm_size', rect: [120, 220, 167, 447], icons: [3040, 3041, 3042, 3043, 3044], names: ['Small', 'Medium', 'Large', 'ExtraLarge', 'Humongous'], label: ['Galaxy Size:', [100, 220, 117, 342]] }];
  const comp = field('computers'), years = field('m_years'), all = field('alliances'), parts = [];
  const frame = (r) => el('div', { style: at20([r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]) + ';border:1px solid #000;box-sizing:border-box' });
  for (const L of LISTS) {
    const sel = field(L.sel); if (!sel) continue;
    const vals = [...sel.options].map(o => o.value);
    const w = cells20(L.icons.length, 1, L.icons.map((n, i) => ({ icon: 'dos:i' + n, name: L.names[i], id: vals[i] })), { sel: Math.max(0, vals.indexOf(sel.value)), pick: (c) => { sel.value = c.id; fire(sel); } });
    w.el.setAttribute('style', w.el.getAttribute('style') + ';' + at20([L.rect[0] + 1, L.rect[1] + 1, L.rect[2] - 1, L.rect[3] - 1]));
    parts.push(frame(L.rect), txt20(L.label[0], L.label[1]), w.el);
  }
  const nums = comp ? [...comp.options].map(o => +o.value).filter(n => !isNaN(n)) : [0, 9];
  const num = raw('span', comp ? comp.value : '', { class: 'dt20', style: at20([200, 10, 216, 35]) });
  const sl = el('input', { type: 'range', min: Math.min(...nums), max: Math.max(...nums), value: comp && /^\d+$/.test(comp.value) ? comp.value : 4, style: at20([200, 36, 216, 166]), 'aria-label': 'Number of Computer Players',
    oninput: (e) => { if (comp) { comp.value = e.target.value; fire(comp); } num.textContent = e.target.value; } });
  const yrs = raw('span', years ? years.value : '10', { class: 'dt20', style: at20([190, 348, 206, 380]) });
  const cb = el('input', { type: 'checkbox', checked: !all || all.checked ? 'checked' : false, onchange: (e) => { if (all) { all.checked = e.target.checked; fire(all); } } });
  let opened = false;
  const moreBtn = el('button', { type: 'button', class: 'ok20', style: 'position:absolute;left:10px;top:268px;min-width:0;padding:0 6px;height:20px', onclick: () => { opened = !opened; dress(); } }, raw('span', 'More… (the remake’s own)'));
  const box = dlog20(456, 263, txt20('Create New Galaxy', [0, 143, 19, 284]), ...parts, txt20('Number of Computer Players:', [180, 10, 198, 211]), num, sl,
    ok20('Years Per Turn…', [188, 220, 208, 343], () => yearsPerTurn301(years, (v) => { yrs.textContent = v; })), yrs,
    el('label', { style: at20([230, 10, 248, 116]) + ';display:flex;align-items:center;gap:4px' }, cb, raw('span', 'Alliances')),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([228, 379, 248, 437]) + ';min-width:0;padding:0', onclick: () => f.requestSubmit() }, raw('span', 'Create')),
    el('button', { type: 'button', class: 'ok20', style: at20([228, 301, 248, 359]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'Cancel')), moreBtn);
  box.style.marginBottom = '30px';
  const holder = el('div', { class: 'cg20' }, box);
  const rest = [...f.childNodes]; f.prepend(holder);
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules'), dress = () => { const on = !rs || /^301/.test(rs.value); box.style.display = on ? '' : 'none'; moreBtn.style.display = on ? '' : 'none'; for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  if (rs) rs.addEventListener('change', dress); dress();
}
// DLOG 4120 (doYearsPerTurnDialog @f0c28, 293 x 228; DITL 4120): "How many years should go by every time the turn is ended?" (12, 12), five
// radio buttons 10 (Normal), 20, 30, 50, 100 Years (56, 80, 104, 128, 152 at 12), Cancel (192, 144) and OK (192, 220, default ring);
// user item 9 (80, 188, 154, 262) is drawn by a routine of the program not read yet: left empty. Not in Jake's games.
function yearsPerTurn301(sel, done) {
  const a = A(), el = a.el, V = ['10', '20', '30', '50', '100'], W = ['10 Years (Normal)', '20 Years', '30 Years', '50 Years', '100 Years'];
  let pick = Math.max(0, V.indexOf(sel ? sel.value : '10'));
  const radios = V.map((v, i) => el('label', { style: at20([56 + 24 * i, 12, 74 + 24 * i, i ? 118 : 160]) + ';display:flex;align-items:center;gap:4px' },
    el('input', { type: 'radio', name: 'ypt301', checked: i === pick ? 'checked' : false, onchange: () => { pick = i; } }), raw('span', W[i])));
  const dl = dlog20(293, 228, txt20('How many years should go by every time the turn is ended?', [12, 12, 44, 283]), ...radios,
    ok20('Cancel', [192, 144, 212, 202], () => close()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([192, 220, 212, 278]) + ';min-width:0;padding:0', onclick: () => { if (sel) { sel.value = V[pick]; sel.dispatchEvent(new Event('change', { bubbles: true })); } done(V[pick]); close(); } }, raw('span', 'OK')));
  // (over the New Game window, which is a modal itself: a layer of its own)
  const scrim = el('div', { class: 'yp301', style: 'position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0)' },
    el('div', { class: 'win mac12 dl20w', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Years Per Turn', style: 'background:#fff;border:1px solid #000;box-shadow:2px 2px 0 #000;padding:0;zoom:var(--mac, 1)' }, dl));
  const close = () => scrim.remove();
  document.body.append(scrim);
}

// DLOG 6000 "Build / Design Ships" (BuildDesignShips @131150 and its helpers, read in the decompile and, for the item cases, the assembly's
// jump table at $1313e4; 492 x 285, DITL 6000; Jake's capture 065). Left, the list of your types (InitShipTypesList), newest first: the
// small picture and "Name (W/S) Class", "15 Name (W/S) Fighters" while 15 are ordered. Right: Ship Money and Metal with their bars
// (DRAWSHIPMONEYBAR: 153 wide, nothing at its middle, 75 pixels either way for the money over 5 x the income, at least 10,000, green;
// DRAWMETALBAR: 75 pixels for 100,000 metal), the big picture, # To Build with + and -, Name, the Class menu, Dev. Cost, Pro. Cost,
// Metal Cost, # Built, #Existing, the five levels "n/most" with their scroll bars, "Building At:" (STR# 4000.40) or "Viewing At:" (.41,
// not your colony: + dimmed) and the star, Scrap All / Don't Scrap, Cancel, OK.
// - Picking a type shows it; moving the Class menu or a scroll bar shows the type with those levels if you have one (FindMatchingType),
//   else a new design, with a new name; the Name field (15 letters at most, a beep past them) renames the type shown.
// - + / - / the field: one ship at a time, each costing the development cost while the type has never been built (this visit's orders
//   counted), else the production cost, and its metal; too little metal is the standard alert 4001.19, money past the borrowing limit
//   4001.25. + on a new design first makes it a type: 4001.5 if it has no name, ALRT 3280 at 20 types.
// - Scrap All marks the type to be scrapped (Don't Scrap unmarks it) and takes back this visit's orders of it; - and Scrap are dimmed
//   as SetButtonStates has them.
// - OK builds every type's count at once (BuildAShip a ship: 3.0.1 builds when OK is pressed); Cancel builds nothing (a type made stays).
let BUILD301 = null; // (the setup's +0x72: the type last shown)
function build301(sid) {
  const a = A(), el = a.el, g = G(), p = a.me(), rs = H().rules(g), star = g.stars[sid], S4 = STR301(4000), S41 = STR301(4001);
  const mine = star && star.owner === a.ME;
  const live = () => p.designs.filter(d => !d.scrapped);
  const counts = {};
  let money = p.savings, metal = p.metal;
  let sel = (live().find(d => d.id === BUILD301) || live()[live().length - 1] || null);
  const spec = sel ? { type: sel.type, R: sel.R, V: sel.V, W: sel.W, S: sel.S, M: sel.M, name: sel.name } : { type: 'fighter', R: 6, V: 2, W: 2, S: 2, M: 0, name: H().designName(g, p, 'fighter') };
  const K = ['R', 'V', 'W', 'S', 'M'], KW = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'];
  const clampSpec = () => { const L = H().designLimits(g, p, spec.type); for (const k of K) { const lo = H().designMin(g, k, spec.type); spec[k] = Math.max(lo, Math.min(Math.max(lo, L[k] || lo), spec[k])); } return L; };
  clampSpec();
  const beep = () => { if (a.beep) a.beep(); };
  const cost1 = (d) => { const c = H().designCost(g, d), first = d.built === 0 && !(counts[d.id] > 0) && !d.free && rs.paysPrototype(g, p, d); return { money: c.money + (first ? c.proto : 0), metal: c.metal, first }; };
  const picOf = (d) => (a.shipPic ? a.shipPic(d, a.ME) : null);
  // (the picture keeps its shape: a ship's three parts fill the 120 x 40, a satellite's one square part is drawn 40 high in the middle, as
  // DrawShipPicture does, Jake's report of a stretched satellite)
  const drawPic = (cv, d) => { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.fillStyle = '#000'; x.fillRect(0, 0, cv.width, cv.height); const im = picOf(d); if (!im) return; const k = Math.min(cv.width / im.width, cv.height / im.height), w = im.width * k, h = im.height * k; x.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h); };
  // the list
  const list = el('div', { class: 'lst301 types301', role: 'listbox', 'aria-label': 'Ship types', style: at20([5, 5, 217, 125]) });
  const drawList = () => {
    list.textContent = '';
    for (const d of live().slice().reverse()) {
      const n = counts[d.id] || 0, row = el('div', { class: 'tr301' + (sel && d.id === sel.id ? ' sel' : '') + (d.scrap301 ? ' scrap' : ''), role: 'option', onclick: () => pick(d) });
      const cv = el('canvas', { width: 120, height: 40, style: 'display:block;margin:0 auto;width:120px;height:40px' }); drawPic(cv, d);
      row.append(cv, raw('div', n > 0 ? descN(d, n) : desc0(d), { class: 'tl301' }));
      list.append(row);
    }
    // (a name wider than the row is drawn condensed, as the program's lists do: squeezed to fit)
    requestAnimationFrame(() => { for (const t of list.querySelectorAll('.tl301')) { t.style.transform = ''; const w = t.scrollWidth, c = t.clientWidth; if (w > c && c) { t.style.overflow = 'visible'; t.style.transform = `scaleX(${(c - 1) / w})`; t.style.transformOrigin = 'center'; } } });
  };
  // the right side
  const big = el('canvas', { width: 240, height: 80, style: at20([42, 222, 82, 342]) });
  const shown = () => sel || Object.assign({ id: null, built: 0, free: false }, spec);
  const numIn = el('input', { type: 'text', inputmode: 'numeric', style: at20([56, 432, 72, 459]), 'aria-label': '# To Build' });
  const nameIn = el('input', { type: 'text', maxlength: 40, style: at20([88, 224, 104, 364]), 'aria-label': 'Name' });
  const clsSel = el('select', { style: at20([112, 202, 132, 358]), 'aria-label': 'Class' }, ...CLASSES().map(t => el('option', { value: t }, cls(t))));
  const T = {}; const tx = (k, r, right) => (T[k] = raw('span', '', { class: 'dt20', style: at20(r) + (right ? ';text-align:right' : '') }));
  const bars = K.map((k, i) => el('input', { type: 'range', 'aria-label': KW[i], style: at20([136 + 20 * i, 417, 152 + 20 * i, 487]) }));
  const mBar = el('canvas', { width: 153, height: 12, style: at20([23, 161, 35, 314]) }), tBar = el('canvas', { width: 77, height: 12, style: at20([22, 370, 34, 447]) });
  const plus = ok20('+', [44, 464, 64, 484], () => change(1)), minus = ok20('-', [68, 464, 88, 484], () => change(-1));
  const scrapB = ok20('Scrap All', [247, 224, 267, 300], () => toggleScrap());
  const colour = COLOUR3;
  const drawBars = () => {
    const scale = Math.max(10000, p.oInc || 0) * 5, x = mBar.getContext('2d'); x.clearRect(0, 0, 153, 12); x.fillStyle = '#fff'; x.fillRect(0, 0, 153, 12); x.strokeStyle = '#000'; x.strokeRect(0.5, 0.5, 152, 11);
    const w = Math.max(-75, Math.min(75, Math.trunc(money * 75 / scale)));
    x.fillStyle = w >= 0 ? (colour ? '#090' : '#000') : (colour ? '#d00' : '#000'); if (w > 0) x.fillRect(76, 1, w, 10); else if (w < 0) x.fillRect(76 + w, 1, -w, 10);
    const y = tBar.getContext('2d'), mw = Math.max(0, Math.min(75, Math.trunc(metal * 75 / 100000))); y.fillStyle = '#fff'; y.fillRect(0, 0, 77, 12); y.strokeStyle = '#000'; y.strokeRect(0.5, 0.5, 76, 11); y.fillStyle = '#000'; y.fillRect(1, 1, mw, 10);
  };
  const refresh = () => {
    const d = shown(), c = H().designCost(g, d), L = clampSpec();
    drawPic(big, d);
    T.money.textContent = String(money); T.metal.textContent = String(metal);
    T.dev.textContent = '$' + nice(c.money + (c.proto || 0)); T.pro.textContent = '$' + nice(c.money); T.mc.textContent = nice(c.metal);
    T.built.textContent = String(sel ? sel.built || 0 : 0); T.exist.textContent = String(sel ? shipCount(sel.id) : 0);
    K.forEach((k, i) => { T['l' + k].textContent = `${spec[k]}/${Math.max(H().designMin(g, k, spec.type), L[k] || 0)}`; const lo = H().designMin(g, k, spec.type); bars[i].min = lo; bars[i].max = Math.max(lo, L[k] || lo); bars[i].value = spec[k]; bars[i].disabled = bars[i].max == lo; });
    numIn.value = String(sel ? counts[sel.id] || 0 : 0); nameIn.value = spec.name; clsSel.value = spec.type;
    plus.disabled = !mine || !!(sel && sel.scrap301); minus.disabled = !sel || !(counts[sel.id] > 0);
    scrapB.disabled = !sel; scrapB.firstChild.textContent = sel && sel.scrap301 ? 'Don’t Scrap' : 'Scrap All';
    drawBars(); drawList();
  };
  const pick = (d) => { sel = d; BUILD301 = d.id; Object.assign(spec, { type: d.type, R: d.R, V: d.V, W: d.W, S: d.S, M: d.M, name: d.name }); refresh(); };
  const rematch = () => {
    const had = sel, m = live().find(d => d.type === spec.type && K.every(k => d[k] === spec[k]));
    if (m) { pick(m); return; }
    sel = null; if (had || !spec.name) spec.name = H().designName(g, p, spec.type); refresh();
  };
  clsSel.addEventListener('change', () => { spec.type = clsSel.value; clampSpec(); rematch(); });
  bars.forEach((b, i) => b.addEventListener('input', () => { spec[K[i]] = +b.value; rematch(); }));
  nameIn.addEventListener('input', () => { let v = nameIn.value; if (v.length > 15) { beep(); v = v.slice(0, 15); nameIn.value = v; } spec.name = v; if (sel) { sel.name = v; drawList(); } });
  numIn.addEventListener('change', () => { let v = parseInt(numIn.value, 10); if (!(v >= 0)) v = 0; change(v - (sel ? counts[sel.id] || 0 : 0)); });
  function change(dn) {
    if (dn > 0 && !sel) {
      if (live().length >= 20) { alertById301(3280); refresh(); return; }
      if (!spec.name.trim()) { std301(S41[4] || 'Please name your new ship type.'); refresh(); return; }
      sel = H().findOrCreateDesign(g, p, Object.assign({}, spec)); BUILD301 = sel.id;
    }
    if (!sel) return;
    for (; dn > 0; dn--) {
      const c = cost1(sel);
      if (c.metal > metal) { std301(S41[18] || 'Sorry, but you don’t have any metal to build more ships.'); break; }
      if (money - c.money < H().borrowLimit(g, p)) { std301(S41[24] || 'You can’t build that ship because you can’t go any further into debt!'); break; }
      money -= c.money; metal -= c.metal; counts[sel.id] = (counts[sel.id] || 0) + 1;
    }
    for (; dn < 0 && counts[sel.id] > 0; dn++) { counts[sel.id]--; const c = cost1(sel); money += c.money; metal += c.metal; }
    refresh();
  }
  function toggleScrap() {
    if (!sel) return;
    const on = rs.flagScrapDesign ? rs.flagScrapDesign(g, p, sel, 'command') : (sel.scrap301 = !sel.scrap301);
    if (on) while (counts[sel.id] > 0) { counts[sel.id]--; const c = cost1(sel); money += c.money; metal += c.metal; }
    refresh();
  }
  const ok = () => {
    for (const [did, n] of Object.entries(counts)) if (n > 0) H().buildShips(g, a.ME, sid, +did, n);
    a.closeModal(); a.save(); a.renderPanel(); a.draw();
  };
  const L = (t, r) => txt20(t, r);
  const box = dlog20(492, 285, el('div', { style: at20([4, 4, 218, 141]) + ';border:1px solid #000;box-sizing:border-box' }), list,
    L('Ship Money:', [4, 144, 20, 234]), tx('money', [4, 236, 20, 337]), mBar, L('Metal:', [4, 347, 20, 393]), tx('metal', [4, 396, 20, 492]), tBar,
    big, L('# To Build:', [56, 352, 72, 427]), numIn, plus, minus,
    L('Name:', [88, 144, 104, 200]), nameIn, L('Class:', [114, 144, 130, 200]), clsSel,
    L('Dev. Cost:', [136, 144, 152, 223]), tx('dev', [136, 224, 152, 306]), L('Pro. Cost:', [156, 144, 172, 223]), tx('pro', [156, 224, 172, 306]),
    L('Metal Cost:', [176, 144, 192, 222]), tx('mc', [176, 224, 192, 306]), L('# Built:', [196, 144, 212, 216]), tx('built', [196, 224, 212, 263]), L('#Existing:', [216, 144, 232, 217]), tx('exist', [216, 224, 232, 263]),
    ...KW.map((w, i) => L(w, [136 + 20 * i, 309, 152 + 20 * i, 370])), ...K.map((k, i) => tx('l' + k, [136 + 20 * i, 372, 152 + 20 * i, 414])), ...bars,
    L(mine ? (S4[39] || 'Building At:') : (S4[40] || 'Viewing At:'), [249, 15, 265, 93]), L(star ? star.name : '', [249, 96, 265, 171]),
    scrapB, ok20('Cancel', [247, 354, 267, 412], () => a.closeModal()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([246, 426, 266, 484]) + ';min-width:0;padding:0', onclick: ok }, raw('span', 'OK')));
  a.modal('', box, { cls: 'mac12 dl20w', label: 'Build / Design Ships' });
  refresh();
  return true;
}
// ALRT 5010 (3.0.1: 240 x 200; "^0^1^2^3" at (8, 12, 116, 236), PICT 3020 at (117, 13), OK at (156, 156)): the program's alert of a line
function alert5010(text) {
  const a = A(), el = a.el, im = a.IMG['dos:p3020'];
  const back = el('div', { class: 'scrim', onkeydown: (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.stopPropagation(); back.remove(); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': text },
      dlog20(240, 200, txt20(text, [8, 12, 116, 236]), im ? el('img', { src: im.src, alt: '', style: at20([117, 13, 191, 87]) + ';image-rendering:pixelated' }) : null,
        el('button', { type: 'button', class: 'ok20 def20', style: at20([156, 156, 176, 214]) + ';min-width:0;padding:0', onclick: () => back.remove() }, raw('span', 'OK')))));
  document.body.append(back); back.querySelector('button').focus();
}
// DLOG 6120 "Give Stuff" (DoGiveThingsDlg @1437e0, InitGTPlayerList @143b00, SetCellsToPlayers @141776; 463 x 214, DITL 6120; Jake's capture
// 074): with three gifts given this turn, ALRT 5010 with STR# 1020.21 and no window. "Give Stuff To:" (0, 20) over the players' cells (20,
// 20, 202, 247: 5 x 4 cells of 45, the icon 2000 + face, + 500 a woman, and the name; the other players still in the game, in the players'
// order; the first picked); "Give How Much Money?" (20, 260) and its field (40, 263), "Give How Much Metal?" (80, 260) and its field
// (100, 263), each put back between 0 and the Ship Savings (the metal) as it is typed; Cancel (140, 384) above Give (168, 384, default).
// Give with both 0 or no cell gives nothing; else the gift is recorded and taken at once (rules: HO.give), sound 5000.
function give301() {
  const a = A(), el = a.el, g = G(), me = a.me(), ME = a.ME;
  if ((me.giftsThisTurn || 0) >= 3) { alert5010(STR301(1020)[20] || 'Sorry, you can only give three gifts per turn.'); return true; }
  const hat = (q) => 'dos:i' + ((q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const order = (H().rules(g).giveWindow && H().rules(g).giveWindow.order) ? H().rules(g).giveWindow.order(g) : g.players;
  const ps = order.filter(q => q.id !== ME && q.alive && !q.surrendered);
  let pick = ps.length ? 0 : null;
  const cl = cells20(5, 4, ps.map((q, i) => ({ icon: hat(q), name: q.name, id: i })), { sel: pick, pick: (c) => { pick = c.id; } });
  cl.el.setAttribute('style', cl.el.getAttribute('style') + ';' + at20([21, 21, 201, 246]));
  const maxM = Math.max(0, me.savings), maxT = Math.max(0, me.metal);
  const field = (r, max, label) => { const f = el('input', { type: 'text', inputmode: 'numeric', value: '0', 'aria-label': label, style: at20(r) });
    f.addEventListener('input', () => { let v = parseInt(f.value, 10); if (!(v >= 0)) v = 0; if (v > max) v = max; if (String(v) !== f.value && f.value !== '') f.value = String(v); }); return f; };
  const fm = field([40, 263, 56, 335], maxM, 'Give How Much Money?'), ft = field([100, 263, 116, 335], maxT, 'Give How Much Metal?');
  const go = () => {
    const m = Math.min(maxM, parseInt(fm.value, 10) || 0), t = Math.min(maxT, parseInt(ft.value, 10) || 0);
    a.closeModal();
    if (pick == null || (m <= 0 && t <= 0)) return;
    if (H().give(g, ME, ps[pick].id, m, t) === 'ok') { a.Sound.play(5000); a.save(); a.renderPanel(); }
  };
  a.modal('', dlog20(463, 214, txt20('Give Stuff To:', [0, 20, 18, 173]), el('div', { style: at20([20, 20, 202, 247]) + ';border:1px solid #000;box-sizing:border-box' }), cl.el,
    txt20('Give How Much Money?', [20, 260, 36, 423]), fm, txt20('Give How Much Metal?', [80, 260, 95, 422]), ft,
    ok20('Cancel', [140, 384, 160, 442], () => a.closeModal()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([168, 384, 188, 442]) + ';min-width:0;padding:0', onclick: go }, raw('span', 'Give'))),
    { cls: 'mac12 dl20w', label: 'Give Stuff' });
  setTimeout(() => { fm.focus(); fm.select(); }, 0);
  return true;
}

// DLOG 6110 "Alliances" (DoAlliancesDlg @1432a4, InitAllianceLists @1434b6, SetAllianceLists @143600; 443 x 300, DITL 6110; Jake's capture
// 073): the line "Click on a player's icon…" (5, 7), "I Like Them" (43, 97) and "I Don't Like Them" (43, 268) over the columns, "They Like
// Me" (88, 8) and "They Don't Like Me" (171, 7) beside the rows; four lists (63, 52) (63, 236) (157, 52) (157, 236), each 182 x 92, four
// cells across: the players still in the game in the players' order, yourself too (your icon 1000, + 500 a woman; another's 2000 + face),
// each in the list of whether you like them and whether they like you. A click on another player moves them across (your like of them
// turned over); on yourself, a beep. OK keeps it (the player's +0x1960 mask: the remake's allies), Cancel (261, 289) leaves it.
function alliances301() {
  const a = A(), el = a.el, g = G(), ME = a.ME, me = a.me();
  const order = (H().rules(g).giveWindow && H().rules(g).giveWindow.order) ? H().rules(g).giveWindow.order(g) : g.players;
  const ps = order.filter(q => q.alive && !q.surrendered);
  const like = new Set(me.allies || []);
  const theyLike = (q) => q.id === ME || (q.allies || []).includes(ME);
  const hat = (q) => 'dos:i' + (q.id === ME ? (q.female ? 1500 : 1000) : (q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const R = [[63, 52, 155, 234], [63, 236, 155, 418], [157, 52, 249, 234], [157, 236, 249, 418]];
  const lists = R.map(r => { const c = cells20(4, 2, [], { pick: (x) => tap(x.id) }); c.el.setAttribute('style', c.el.getAttribute('style') + ';' + at20([r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 1]) + ';overflow-y:auto'); return c; });
  const draw = () => {
    const by = [[], [], [], []];
    for (const q of ps) by[((q.id === ME || like.has(q.id)) ? 0 : 1) + (theyLike(q) ? 0 : 2)].push({ icon: hat(q), name: q.name, id: q.id });
    by.forEach((L, i) => lists[i].set(L, null));
  };
  function tap(id) { if (id === ME) { if (a.beep) a.beep(); return; } if (like.has(id)) like.delete(id); else like.add(id); draw(); }
  const ok = () => { for (const q of g.players) if (q.id !== ME) H().setPact(g, ME, q.id, 'ally', like.has(q.id)); a.closeModal(); a.save(); a.renderPanel(); a.draw(); };
  draw();
  a.modal('', dlog20(443, 300, txt20('Click on a player’s icon to move it horizontally to specify whether you would or would not like to ally with that player.', [5, 7, 38, 428]),
    txt20('I Like Them', [43, 97, 58, 176]), txt20('I Don’t Like Them', [43, 268, 58, 390]), txt20('They Like Me', [88, 8, 137, 42]), txt20('They Don’t Like Me', [171, 7, 239, 43]),
    ...R.map(r => el('div', { style: at20(r) + ';border:1px solid #000;box-sizing:border-box' })), ...lists.map(c => c.el),
    ok20('Cancel', [261, 289, 281, 347], () => a.closeModal()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([261, 361, 281, 419]) + ';min-width:0;padding:0', onclick: ok }, raw('span', 'OK'))),
    { cls: 'mac12 dl20w', label: 'Alliances' });
  return true;
}

// DLOG 6070 "Send Message" (SendMessage @140fa2, InitMessageLists @1421de (the same code as 2.0.1's), SetCellsToPlayers; 392 x 261, DITL
// 6070; Jake's capture 075). "Send Message:" (7, 6), the step's prompt (7, 154; STR# 3002: "Send Message To Who?", "Saying What?", then the
// message's own: "Which Star?", "Who?", "Where?"), "To:" and "Content:" beside the left list (33, 81: one column of four 45 cells, what is
// chosen, a click on one taking the message back to that step) and the right list (33, 154: 5 x 4 cells, this step's choices: the players
// still in and "Everyone"; the fourteen messages, ICN# 3000-3013; then the stars or players the message names). Erase (229, 164) clears it,
// dimmed with nothing chosen; Send (228, 241, the default ring) is enabled once the message is whole and Done (228, 314) is dimmed then;
// a message sent (rs.cannedChat, the engine's cannedSteps: 3.0.1's codes $40a-$417) plays sound 5000 and the window starts again for the next;
// ten in a turn: ALRT 5010 with STR# 1020.17, and the window closes. Done closes it.
function chat301() {
  const a = A(), el = a.el, g = G(), ME = a.ME, C = H().rules(g).cannedChat, me = a.me();
  const limitText = STR301(1020)[16] || 'Sorry, you can only send ten messages per turn.';
  const lim = H().rules(g).chatLimit;
  if (lim && (me.outbox || []).length >= lim) { alert5010(limitText); return true; }
  const tos = C.to(g, ME);
  const P = STR301(3002);
  const hat = (q) => 'dos:i' + (q.id === ME ? (q.female ? 1500 : 1000) : (q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const pl = (id) => g.players[+id];
  let ch = [];
  const act = () => (ch[1] ? C.actions[ch[1].i] : null);
  const steps = () => 2 + (act() ? act().parts.length : 0);
  const whole = () => !!act() && ch.length >= steps() && ch.slice(0, steps()).every(Boolean);
  const prompt = raw('span', '', { class: 'dt20', style: at20([7, 154, 24, 355]) });
  const left = cells20(1, 4, [], {}), right = cells20(5, 4, [], {});
  const choices = (k) => {
    if (k === 0) return tos.map(o => ({ id: String(o[0]), name: o[1], icon: pl(o[0]) && !isNaN(+o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
    if (k === 1) return C.actions.map((x, i) => ({ id: i, i, name: x.label, icon: 'dos:i' + (3000 + i) }));
    const part = act().parts[k - 2], kind = part[1];
    return C.list(g, ME, kind, a.UI.sel).map(o => ({ id: String(o[0]), name: o[1], icon: kind === 'players' && pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
  };
  const step = () => { for (let k = 0; k < steps(); k++) if (!ch[k]) return k; return steps(); };
  const erase = ok20('Erase', [229, 164, 249, 222], () => { ch = []; refresh(); });
  const done = ok20('Done', [228, 314, 248, 372], () => a.closeModal());
  const send = el('button', { type: 'button', class: 'ok20 def20', style: at20([228, 241, 248, 299]) + ';min-width:0;padding:0', onclick: a.guard(() => {
    if (!whole()) return;
    const v = ch.slice(2).map(c => (isNaN(+c.id) ? c.id : +c.id));
    const r = H().sendCanned(g, ME, C.make(g, ME, isNaN(+ch[0].id) ? ch[0].id : +ch[0].id, ch[1].i, v));
    if (r === 'limit') { a.closeModal(); alert5010(limitText); return; }
    if (r !== 'ok') return;
    a.Sound.play(5000); a.save(); ch = []; refresh();
    if (lim && (me.outbox || []).length >= lim) { a.closeModal(); alert5010(limitText); }
  }) }, raw('span', 'Send'));
  function refresh() {
    const k = step();
    prompt.textContent = k === 0 ? (P[0] || 'Send Message To Who?') : k === 1 ? (P[1] || 'Saying What?') : k < steps() ? act().parts[k - 2][0] : '';
    left.set([0, 1, 2, 3].map(i => ch[i] ? { name: ch[i].name, icon: ch[i].icon } : { name: '' }), null);
    const list = k < steps() ? choices(k) : [];
    right.set(list, null);
    right.el.querySelectorAll('.c20').forEach((d, i) => { const c = list[i]; if (c) d.onclick = () => { if (c.off) { if (a.beep) a.beep(); return; } ch[k] = c; ch.length = k + 1; refresh(); }; });
    left.el.querySelectorAll('.c20').forEach((d, i) => { d.onclick = () => { if (!ch[i]) return; ch.length = i; refresh(); }; });
    const w = whole();
    send.disabled = !w; done.disabled = w; erase.disabled = !ch.some(Boolean);
  }
  const frame = (r) => el('div', { style: at20([r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]) + ';border:1px solid #000;box-sizing:border-box' });
  const put = (n, r) => { n.setAttribute('style', (n.getAttribute('style') || '') + ';' + at20(r)); return n; };
  refresh();
  a.modal('', dlog20(392, 261, txt20('Send Message:', [7, 6, 25, 137]), prompt, txt20('To:', [47, 44, 63, 74]), txt20('Content:', [85, 15, 101, 74]), frame([33, 81, 215, 128]), frame([33, 154, 215, 381]),
    put(left.el, [34, 82, 214, 127]), put(right.el, [34, 155, 214, 380]), erase, send, done), { cls: 'mac12 dl20w', label: 'Send Message' });
  return true;
}

// an ALRT of 3.0.1's (its DITL in HOLANG.mac301En: the static texts joined, OK), as the standard alert
function alertById301(id) { const D = (window.HOLANG && HOLANG.mac301En.DITL[String(id)]) || []; std301(D.filter(x => x[0] === 'text').map(x => x[1]).join(' ')); }

// DLOG 6060 "Organize Fleets" (OrganizeFleets @133d14, DrawOneOrgFleet @13459a, DRAWORGFLEETS @134532; 427 x 283, DITL 6060: the heading
// (0, 13), the two lines (18, 16) and (35, 16), the piles (56, 12, 236, 417), Next Type (249, 27), Group All (249, 107), Divide All (249, 187),
// Cancel (249, 264), OK (249, 340, default)). The fleets of the selected fleet's design at the selected star, in the order of the fleet records,
// one a pile (from the twelfth on, all in the last); twelve piles in three columns of four, a pile 135 x 45 (col = pile / 4, row = pile mod 4),
// its ship count (condensed past 99) at its left and the small ship picture (120 x 40) 15 in, the pile being dragged inverted. A drag from a
// pile to another moves one ship, with Shift the whole pile; an empty pile is a beep. Group All puts all in the first pile; Divide All gives
// each of the first eleven the total / 12 (at least 1) while they last, the rest to the last. OK: the piles become the fleets in order (a
// fleet beyond the piles is removed, a pile beyond the fleets is a new fleet), with the ruleset's rule for fuel, "built this turn" and colonists
// (rules-301 organized301: the least fuel of them; a fleet whose count changed stops counting as built this turn unless all were, and its
// colony ships are unloaded unless all were loaded; a new pile the same; the fleets kept keep their orders). Next Type does
// OK, then opens the window again on the star's next fleet of another design (in record order, round), a beep when there is none.
// Jake's capture 069.
function organize301(sid) {
  const a = A(), el = a.el, g = G(), me = a.me();
  const at = g.fleets.filter(f => f.owner === a.ME && f.star === sid && !f.sat && Object.keys(f.ships).length === 1);
  let f0 = at.find(f => f.id === a.UI.selFleet) || at[0];
  if (!f0) { if (a.beep) a.beep(); return true; }
  const did = +Object.keys(f0.ships)[0], d = me.designs.find(x => x.id === did);
  const fleets = at.filter(f => +Object.keys(f.ships)[0] === did);
  const piles = new Array(12).fill(0); fleets.forEach((f, i) => { piles[Math.min(i, 11)] += f.ships[did]; });
  const fuel = Math.min(...fleets.map(f => f.fuel || 0)), allNew = fleets.every(f => !!f.newThisTurn), colony = d && d.type === 'colony', allLoaded = colony && fleets.every(f => (f.colonists || 0) > 0);
  const flags = (f, changed) => { f.fuel = fuel; if (!changed) return; if (!allNew) f.newThisTurn = false; if (colony) f.colonists = allLoaded ? 10 * f.ships[did] : 0; };
  const pic = a.shipPic ? a.shipPic(d, a.ME) : null;
  const area = el('div', { class: 'org301', style: at20([56, 12, 236, 417]) + ';border:1px solid #000;box-sizing:border-box;touch-action:none' });
  let drag = -1;
  const draw = () => {
    area.textContent = '';
    piles.forEach((n, k) => {
      const c = el('div', { class: 'pile301' + (k === drag ? ' sel' : ''), 'data-pile': k, style: `position:absolute;left:${Math.floor(k / 4) * 135}px;top:${(k % 4) * 45}px;width:135px;height:40px` });
      if (n > 0) {
        if (pic) { const cv = el('canvas', { width: 120, height: 40, style: 'position:absolute;left:15px;top:0;width:120px;height:40px' }); cv.getContext('2d').drawImage(pic, 0, 0, 120, 40); c.append(cv); }
        c.append(raw('span', a.fmt ? a.fmt(n) : String(n), { class: 'n301' + (n > 99 ? ' cond' : ''), style: 'position:absolute;left:0;top:22px' }));
      }
      area.append(c);
    });
  };
  const pileAt = (e) => { const r = area.getBoundingClientRect(), z = r.width / 405, x = (e.clientX - r.left) / z, y = (e.clientY - r.top) / z, k = Math.floor(x / 135) * 4 + Math.floor(y / 45); return x < 0 || y < 0 || k < 0 || k > 11 ? -1 : k; };
  let shift = false;
  area.addEventListener('pointerdown', (e) => { const k = pileAt(e); if (k < 0 || !piles[k]) { if (a.beep) a.beep(); return; } drag = k; shift = e.shiftKey; area.setPointerCapture(e.pointerId); draw(); });
  area.addEventListener('pointerup', (e) => {
    if (drag < 0) return;
    const k = pileAt(e);
    if (k >= 0 && k !== drag) { if (shift) { piles[k] += piles[drag]; piles[drag] = 0; } else { piles[drag]--; piles[k]++; } }
    drag = -1; draw();
  });
  const total = () => piles.reduce((x, y) => x + y, 0);
  const group = () => { const t = total(); piles.fill(0); piles[0] = t; draw(); };
  const divide = () => { let t = total(); const per = Math.max(1, Math.floor(t / 12)); for (let k = 0; k < 11; k++) { piles[k] = Math.min(per, t); t -= piles[k]; } piles[11] = Math.max(0, t); draw(); };
  const apply = () => {
    fleets.forEach((f, i) => {
      if (i < 12 && piles[i] > 0) { const ch = f.ships[did] !== piles[i]; f.ships[did] = piles[i]; flags(f, ch); }
      else { const j = g.fleets.indexOf(f); if (j >= 0) g.fleets.splice(j, 1); if (a.UI.selFleet === f.id) a.UI.selFleet = null; }
    });
    for (let k = fleets.length; k < 12; k++) if (piles[k] > 0) { const nf = H().newFleet(g, a.ME, sid, false); nf.ships[did] = piles[k]; nf.newThisTurn = allNew; flags(nf, true); }
    if (a.UI.selFleet == null) { const f = g.fleets.find(x => x.owner === a.ME && x.star === sid && x.ships[did]); if (f) a.UI.selFleet = f.id; }
    a.save(); a.renderPanel(); a.draw();
  };
  const next = () => {
    apply(); a.closeModal();
    const mine = g.fleets.filter(f => f.owner === a.ME && !f.sat), i0 = mine.findIndex(f => f.ships[did] && f.star === sid);
    for (let s = 1; s <= mine.length; s++) { const f = mine[(Math.max(0, i0) + s) % mine.length]; if (f.star === sid && f.to == null && Object.keys(f.ships).length === 1 && !f.ships[did]) { a.UI.selFleet = f.id; a.renderPanel(); organize301(sid); return; } }
    if (a.beep) a.beep();
  };
  draw();
  a.modal('', dlog20(427, 283, txt20('To Organize Fleets:', [0, 13, 16, 142]), txt20('• Click and drag fleets into desired number of piles', [18, 16, 35, 363]), txt20('• Shift-Click selects an entire pile', [35, 16, 51, 362]), area,
    ok20('Next Type', [249, 27, 269, 92], next), ok20('Group All', [249, 107, 269, 172], group), ok20('Divide All', [249, 187, 269, 252], divide), ok20('Cancel', [249, 264, 269, 329], () => a.closeModal()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([249, 340, 269, 412]) + ';min-width:0;padding:0', onclick: () => { apply(); a.closeModal(); } }, raw('span', 'OK'))),
    { cls: 'mac12 dl20w', label: 'Organize Fleets' });
  return true;
}

// 3.0.1's standard alert (StandardAlert @13030: DLOG 6140, colour 6141, 240 x 200; DITL: the line of STR# 4001 at (10, 10, 97, 230), OK at
// (160, 160) with the default ring, PICT 3020 at (110, 10)); the system beep
function std301(text, done) {
  const a = A(), el = a.el, im = a.IMG['dos:p3020'];
  const back = el('div', { class: 'scrim', onkeydown: (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.stopPropagation(); close(); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': text },
      dlog20(240, 200, txt20(text, [10, 10, 97, 230]), im ? el('img', { src: im.src, alt: '', style: at20([110, 10, 184, 84]) + ';image-rendering:pixelated' }) : null,
        el('button', { type: 'button', class: 'ok20 def20', style: at20([160, 160, 180, 218]) + ';min-width:0;padding:0', onclick: () => close() }, raw('span', 'OK')))));
  const close = () => { back.remove(); if (done) done(); };
  document.body.append(back); back.querySelector('button').focus();
  if (a.beep) a.beep();
}
// DLOG 6030 "List of All Fleets" (ListAllFleets @13311a, InitFleetsList @133378, MakeListFleetsStr @1336e8; 486 x 296, DITL 6030: the heading at
// (2, 13), the list at (26, 13, 252, 468) less its scroll bar, the Sort By menu CNTL 6030 (MENU 6030 "Ship Power", "Ship Class") at (265, 13),
// Go To Fleet (264, 260), OK (264, 364, default)). Your fleets but satellites, in the order of the fleet records, then swap-sorted: Ship Power
// (each fleet's ships times its design's power, CalcShipPower's +0x7a: rs.shipPower), the strongest first; Ship Class (scout, fighter, colony
// ship), the lower first. Ship Power when it opens; the first row picked. A row: STR# 4000.24-27, "%s stationed at %s.", "%s leaving %s for %s
// to arrive in %d.", "%s to arrive at %s in %d.", "%s marooned at %s." (FleetStuck), the year being this year plus ten a turn left (the patch:
// the game's years per turn, 'listYears'). Go To Fleet: a fleet in hyperspace gets the standard alert 4001.14; else its star is selected,
// the fleet made the star's fleet and the map centred on it. Jake's capture 068.
function fleets301() {
  const a = A(), el = a.el, g = G(), rs = H().rules(g), S4 = STR301(4000), CL = ['scout', 'fighter', 'colony', 'satellite'];
  const mine = g.fleets.filter(f => f.owner === a.ME && !f.sat);
  const design = (f) => { const k = Object.keys(f.ships || {}).find(x => f.ships[x] > 0); return a.me().designs.find(d => String(d.id) === k) || {}; };
  const cls = (f) => { const i = CL.indexOf(design(f).type); return i < 0 ? 9 : i; };
  const count = (f) => Object.values(f.ships || {}).reduce((x, y) => x + y, 0);
  const power = (f) => count(f) * (rs.shipPower ? rs.shipPower(g, design(f)) : 0);
  const list0 = mine.filter(f => cls(f) !== 3);
  const sorted = (mode) => { const L = list0.slice(); for (let i = 0; i < L.length - 1; i++) for (let j = i + 1; j < L.length; j++) if (mode === 1 ? power(L[i]) < power(L[j]) : cls(L[j]) < cls(L[i])) { const t = L[i]; L[i] = L[j]; L[j] = t; } return L; };
  const yr = (t) => H().fixed(g, 'listYears') ? H().arrivalYear(g, t) : g.year + t * 10;
  const turns = (f) => Math.ceil((f.dist - (f.prog || 0)) / H().fleetSpeed(g, f) - 1e-9);
  const line = (f) => {
    const d = H().fleetText(g, f), st = (i) => g.stars[i].name;
    if (stuck(f)) return fill(S4[26] || '%s marooned at %s.', d, st(f.star));
    if (f.to != null) return fill(S4[25] || '%s to arrive at %s in %d.', d, st(f.to), yr(turns(f)));
    if (f.dest != null) return fill(S4[24] || '%s leaving %s for %s to arrive in %d.', d, st(f.star), st(f.dest), yr(Math.ceil(H().starDist(g, f.star, f.dest) / H().fleetSpeed(g, f) - 1e-9)));
    return fill(S4[23] || '%s stationed at %s.', d, st(f.star));
  };
  let mode = 1, list = sorted(mode), cur = 0;
  const box = el('div', { class: 'lst301', role: 'listbox', 'aria-label': 'List of All Fleets', style: at20([27, 14, 251, 452]) });
  const show = () => { box.textContent = ''; list.forEach((f, i) => box.append(raw('div', line(f), { class: 'li301' + (i === cur ? ' sel' : ''), role: 'option', 'aria-selected': i === cur ? 'true' : 'false', onclick: () => { cur = i; show(); }, ondblclick: () => { cur = i; go(); } }))); };
  const go = () => {
    const f = list[cur]; if (!f) return;
    if (f.to != null || f.star == null) { std301(STR301(4001)[13] || FLEET_LINES.en.hyper); return; }
    a.closeModal(); a.UI.sel = f.star; a.UI.selFleet = f.id; a.centerOn(f.star); a.renderPanel(); a.draw();
  };
  const M = (window.HOLANG && HOLANG.mac301En && HOLANG.mac301En.MENU && HOLANG.mac301En.MENU['6030']) || [0, 'Ship Power', 'Ship Class'];
  // (the pop-up menu's title, "Sort By:", is drawn inside the control's rectangle at its left, as capture 068 shows)
  const sel = el('select', { 'aria-label': 'Sort By', style: at20([265, 80, 285, 213]), onchange: (e) => { mode = +e.target.value; list = sorted(mode); cur = 0; show(); } },
    el('option', { value: 1 }, M[1]), el('option', { value: 2 }, M[2]));
  show();
  a.modal('', dlog20(486, 296, txt20('List of All Fleets:', [2, 13, 22, 145]), txt20('Sort By:', [267, 13, 285, 78]), el('div', { style: at20([26, 13, 252, 468]) + ';border:1px solid #000;box-sizing:border-box' }), box, sel,
    ok20('Go To Fleet', [264, 260, 284, 342], go),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([264, 364, 284, 446]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'OK'))),
    { cls: 'mac12 dl20w', label: 'List of All Fleets' });
  return true;
}

// 3.0.1's ALRT 3230 (EndTurnMenuCall @120da4: 286 x 190; DITL 3230 "Continue" (145, 188, default), "Wait" (145, 110), PICT 3020 at
// (99, 13), "^0, do you want to play alone, or wait for more humans to join?" (13, 13, 63, 278), "(Computer Opponents: ^1)" (64, 13)):
// asked when the year-2000 turn is done, with fewer than two humans, until it is answered Continue (the header's +6 byte, -1 till then).
// Wait leaves the game unupdated (CheckTurnDone's +6 test), so End Turn asks again. Jake's captures 015 and 166.
// (With two humans or more the program asks ALRT 3070 instead, when the last one is done: the remake's hot seat has its own hand-over.)
function playAlone301(g, go) {
  const a = A(), el = a.el, im = a.IMG['dos:p3020'], me = a.me(), comps = g.players.filter(p => !p.human).length;
  const pic = im ? el('img', { src: im.src, alt: '', style: at20([99, 13, 173, 87]) + ';image-rendering:pixelated' }) : null;
  a.modal('', dlog20(286, 190, pic, txt20(`${me.name}, do you want to play alone, or wait for more humans to join?`, [13, 13, 63, 278]), txt20(`(Computer Opponents: ${comps})`, [64, 13, 84, 264]),
    ok20('Wait', [145, 110, 165, 168], () => a.closeModal()),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([145, 188, 165, 257]) + ';min-width:0;padding:0', onclick: () => { g.alone301 = true; a.closeModal(); go(); } }, raw('span', 'Continue'))),
    { cls: 'mac12 dl20w', label: 'Play alone?' });
}

// ALRT / DITL 3210 (ForceEndTurn @122382, 335 x 210): PICT 3020 at (117, 13), the two paragraphs at (13, 13) and (52, 13), "Wait" at (143, 117) and "Force End" (default) at (143, 222);
// the words are the ruleset's (rs.forceEndTurn.ask, the paragraphs split at the blank line). The second alert (3220, "the file was busy") has no cause in a page.
function forceEnd20(text, go) {
  const a = A(), el = a.el, im = a.IMG['dos:p3020'], [p1, p2] = String(text).split('\n\n');
  const pic = im ? el('img', { src: im.src, alt: '', style: at20([117, 13, 191, 87]) + ';image-rendering:pixelated' }) : null;
  a.modal('', dlog20(335, 210, pic, raw('span', p1, { class: 'dt20', style: at20([13, 13, 46, 327]) }), raw('span', p2 || '', { class: 'dt20', style: at20([52, 13, 92, 328]) }),
    el('button', { type: 'button', class: 'ok20', style: at20([143, 117, 163, 194]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'Wait')),
    el('button', { type: 'button', class: 'ok20 def20', style: at20([143, 222, 163, 299]) + ';min-width:0;padding:0', onclick: () => { a.closeModal(); go(); } }, raw('span', 'Force End'))), { cls: 'mac12 dl20w', label: 'Force End Turn' });
  return true;
}

// DLOG 4040 "Vitesse des batailles…" (doBattleSpeedDialog @120c48: 265 x 168; DITL 4040: "Vitesse des batailles:" at (26, 13),
// "Rapide" (27, 46), the slider CNTL 4040 (84, 46, 214, 62; 10 to 60 ticks a shot), "Lente" (215, 46), the value's text at 295,
// outside the window, "Animation complète" (26, 74), OK (186, 116, 244, 136)); Stup +0x4e and +0x48
function battleSpeed12() {
  const a = A(), el = a.el, P = a.Prefs, O = (H().rules(G()).options || {}).battleSpeed || { min: 10, max: 60, def: 30 };
  if (!own()) return a.openPrefs();
  const fr = lang() === 'fr', W = fr ? ['Vitesse des batailles:', 'Rapide', 'Lente', 'Animation complète', 'OK'] : ['Battle Speed:', 'Fast', 'Slow', 'Fully Animated Battles', 'OK'];
  const v = P.battleSpeed != null && P.battleSpeed >= O.min && P.battleSpeed <= O.max ? P.battleSpeed : O.def;
  const at = (l, t, w, h) => `position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px`;
  const sl = el('input', { type: 'range', min: O.min, max: O.max, value: v, style: at(84, 46, 130, 16), 'aria-label': W[0] });
  const cb = el('input', { type: 'checkbox', checked: P.fullAnim !== false ? 'checked' : false });
  const ok = () => { P.battleSpeed = +sl.value; P.fullAnim = cb.checked; a.savePrefs(); a.closeModal(); };
  // (2.0.1's DITL 4040 has the same size and its own rectangles: the title (13, 13, 95 x 18), Fast (27, 47), the slider CNTL 4040 (59, 47, 130 x 16), Slow (191, 47), the check box (27, 74))
  if (V2) sl.setAttribute('style', at(59, 47, 130, 16));
  const box = el('div', { class: 'bs12', style: 'position:relative;width:265px;height:168px' },
    raw('span', W[0], { style: V2 ? at(13, 13, 95, 18) : at(26, 13, 155, 17) }), raw('span', W[1], { style: V2 ? at(27, 47, 32, 16) : at(27, 46, 57, 14) }), sl, raw('span', W[2], { style: V2 ? at(191, 47, 45, 16) : at(215, 46, 45, 16) }),
    el('label', { style: (V2 ? at(27, 74, 216, 18) : at(26, 74, 216, 18)) + ';display:flex;align-items:center;gap:4px' }, cb, raw('span', W[3])),
    el('button', { onclick: ok, style: at(186, 116, 58, 20) + ';min-width:0;padding:0' }, raw('span', W[4])));
  a.modal('', box, { cls: 'mac12 bs12w', label: W[0] });
}

// DLOG 4050 (NameAStar @120a04: a dialog box with no title, 281 x 217; DITL 4050: the two lines at (9, 6) and (9, 45), the
// "(Si vous ne voulez pas…)" line at (9, 82), a picture item for PICT 3000 at (10, 118), which 1.2F's file hasn't got (its colour
// pictures were in a file of their own; only 3500 and up are here), so nothing, "Nouveau nom d'étoile:" at (95, 119), the field
// (97, 144, 187, 160) and OK (196, 179, 254, 199); no Cancel)
function nameStarLayout(f, o) {
  if (!own()) return false;
  const a = A(), el = a.el, NS = o.NS, at = (l, t, w, h) => `position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px`;
  o.inp.setAttribute('style', at(97, 144, 90, 16) + ';box-sizing:border-box;padding:0 2px');
  o.err.setAttribute('style', at(97, 162, 180, 14) + ';margin:0;font-size:10px');
  // 1.2's dialog has no Cancel (its hint says: OK with the name blank, to name no star), but the classic form ignores a blank name and relies on its Cancel
  // button, which is removed below: the form was never dismissable without a name (found by playing a win to its end). A blank OK presses that Cancel's own
  // handler, as the classic window's Cancel does (the "no longer asking" record included).
  const decline = f.querySelector('button[type=button]');
  f.addEventListener('submit', (e) => { if (!o.inp.value.trim() && decline) { e.preventDefault(); e.stopImmediatePropagation(); decline.click(); } }, true);
  f.innerHTML = '';
  f.setAttribute('style', 'position:relative;width:281px;height:217px');
  f.append(raw('p', NS.text, { style: at(9, 6, 265, 35) + ';margin:0' }), raw('p', NS.rule || '', { style: at(9, 45, 263, 34) + ';margin:0' }),
    raw('p', NS.hint || '', { style: at(9, 82, 263, 34) + ';margin:0' }),
    V2 ? el('img', { src: window.HOMAC2_COLOUR ? 'assets/skins/mac2/sprites/p3500.png' : (a.IMG['dos:p3500'] || {}).src, // (the colour game shows the black and white sketch too: the colour pictures' file has no 3500, shot105)
       alt: '', style: at(10, 118, 74, 74) + ';image-rendering:pixelated' }) : null, // (2.0.1's DITL 4050 item 4: PICT 3500 at (118, 10, 192, 84))
    raw('span', NS.label || '', { style: at(95, 119, 150, 16) }), o.inp, o.err,
    el('button', { type: 'submit', style: at(196, 179, 58, 20) + ';min-width:0;padding:0' }, raw('span', NS.ok || 'OK')));
  return true;
}

// ---------- a route line (StarLine @c70c4, MakeArrowRegion @12da0) ----------
// A region from star centre to star centre, 2 pixels wide, with an open arrow head at an end the fleet can reach (the far
// end when it can get there, the near one too when it can come back): the tip on the centre, the barbs 13 pixels out and 9
// back, 11 out and 11 back on the inside; painted white (PaintRgn after ForeColor 30), in qd.gray when the fleet can't
// reach; the turns in white on a black box at the middle (left at the midpoint, 11 high, the number 3 in and 2 up). Drawn
// at the map's pixel size (two of the page's to one of the program's).
function starLine(cx, d) {
  const k = LY, dx = d.x2 - d.x1, dy = d.y2 - d.y1, len = Math.hypot(dx, dy);
  if (len < 1) return true;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux, mx = (d.x1 + d.x2) / 2, my = (d.y1 + d.y2) / 2, L = len / 2 / k, w = 1;
  const pts = [[w, L - w], [w, -L + w]];
  if (d.ok) pts.push([w + 10, -L + 12 - w], [w + 12, -L + 10 - w], [0, -L], [-w - 12, -L + 10 - w], [-w - 10, -L + 12 - w]);
  pts.push([-w, -L + w], [-w, L - w]);
  if (d.ok && d.round) pts.push([-w - 10, L - 12 + w], [-w - 12, L - 10 + w], [0, L], [w + 12, L - 10 + w], [w + 10, L - 12 + w]);
  cx.save();
  cx.beginPath();
  pts.forEach(([h, v], i) => { const X = mx + k * (h * nx - v * ux), Y = my + k * (h * ny - v * uy); if (i) cx.lineTo(X, Y); else cx.moveTo(X, Y); });
  cx.closePath();
  if (d.ok) cx.fillStyle = '#fff';
  else { const p = document.createElement('canvas'); p.width = 2 * k; p.height = 2 * k; const q = p.getContext('2d'); q.fillStyle = '#fff'; q.fillRect(0, 0, k, k); q.fillRect(k, k, k, k); cx.fillStyle = cx.createPattern(p, 'repeat'); }
  cx.fill();
  if (d.turns != null) {
    const t = String(V2 && d.dist != null ? d.dist : d.turns); // (the label is the leg's distance: Mac 2.0.1 captures, "Dist 5; Time 3" under a line marked 5)
    cx.font = (9 * k) + 'px Geneva, Verdana, sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    const tw = cx.measureText(t).width;
    cx.fillStyle = '#000'; cx.fillRect(mx, my - 11 * k, tw + 4 * k, 11 * k);
    cx.fillStyle = '#fff'; cx.fillText(t, mx + 3 * k, my - 2 * k);
  }
  cx.restore();
  return true;
}

// ---------- the map window's boxes as 1.2 draws them (MapWinProc; the rects from the program's initial data: planet 0,0-226,68,
// fleets 0,70-226,132, totals 0,132-226,166, then the players' icons 0-67 and the budget bars 79-214 down to the foot; the
// Tech Spending window, 228 x 80, sits under the map window's left: Stup 1000 +0xa). Drawn in the window's font, Geneva 9,
// at the panel's width (226 pixels to it), as canvases: the planet box (DrawPlanetRect @c4334), the totals (DrawIncomeRect
// @c3f70) and the technology window (UpdateTechWin @1400f0); the vertical bars are DrawVBarControl @c0164 and DoVBarClick
// @c0446: an axis 50 high with ten ticks (linear for a colony, the log table for the technologies), bars 18 wide 27 apart
// on a base line, each name centred under its bar (the technologies' every other one 10 lower), a finished part's bar empty
// and a click on it the system beep; a drag sets the share and spreads the rest over the others in proportion. ----------
// (the Mac's own bitmap Geneva 9, Geneva 9 Bold and Chicago 12, as the DOS 2.0 program carries them: js/skins/dos/style.css's faces, 12 and 15
// pixels to the em for one font pixel to one of the Mac's; a browser without them draws with the fallbacks)
const G9 = "12px 'DOS Geneva 9', Geneva, Verdana, sans-serif", G9B = "12px 'DOS Geneva 9 Bold', Geneva, Verdana, sans-serif", SYS12 = "15px 'DOS Chicago 12', Chicago, Charcoal, Geneva, sans-serif";
try { if (document.fonts) Promise.all([G9, G9B, SYS12].map(f => document.fonts.load(f))).then(() => { const a = A(); if (a && a.G && a.renderPanel) a.renderPanel(); }).catch(() => {}); } catch (e) { /* (the fallbacks) */ }
function qdCanvas(w, h, label) { // a box drawn at twice its pixels, as wide as the panel
  let lastR = null;
  const K = QK(), c = A().el('canvas', { class: 'qd12', width: w * K, height: h * K, role: 'img', 'aria-label': label || '' });
  c.style.aspectRatio = w + ' / ' + h; c.dataset.k = String(K);
  const x = c.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
  x.textBaseline = 'alphabetic'; x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineWidth = 1;
  const api = {
    c, x,
    text(t, h0, v, font, o) { c.dataset.t = (c.dataset.t ? c.dataset.t + '\n' : '') + t; /* (what the box says, for a reader or a test: the canvas has no text of its own) */ x.font = font || G9; x.letterSpacing = o && o.cond ? '-1px' : '0px'; x.fillStyle = (o && o.color) || '#000'; const w0 = x.measureText(t).width; const at = o && o.right != null ? o.right - w0 : o && o.center != null ? o.center - Math.trunc(w0 / 2) : h0; if (o && o.shadow) { /* (drawn first one pixel down and right in the shadow's colour, then in its own: 4.0.5's panes) */ x.fillStyle = o.shadow; x.fillText(t, at + 1, v + 1); x.fillStyle = o.color || '#000'; } x.fillText(t, at, v); x.letterSpacing = '0px'; return w0; },
    width(t, font) { x.font = font || G9; return x.measureText(t).width; },
    hline(h0, h1, v) { x.fillStyle = '#000'; x.fillRect(h0, v, h1 - h0, 1); },
    vline(h0, v0, v1) { x.fillStyle = '#000'; x.fillRect(h0, v0, 1, v1 - v0); },
    rect(l, t, r, b, col) { x.fillStyle = col; x.fillRect(l, t, r - l, b - t); },
    // pointer position in the box's pixels
    // (a drag that redraws its pane replaces this canvas with a new one: the pointer is then measured against where this one last was, not
    // against the detached canvas, whose box is empty and put every move at the far right: Jake, 18 Nov, a click on a budget bar gave it all)
    at(ev) { const r = c.isConnected || !lastR ? (lastR = c.getBoundingClientRect()) : lastR; return { h: (ev.clientX - r.left) * w / r.width, v: (ev.clientY - r.top) * h / r.height }; },
  };
  return api;
}
// DrawVBarControl(x, y, values per mille (-1: finished), kind 1 colony / 2 technologies, names)
function vbars(q, x0, y0, vals, kind, names, toPix, geo) {
  const BW = (geo && geo.b) || 18, GP = (geo && geo.g) || 9; // (a bar 18 wide with 9 before it, as DrawVBarControl; narrower for the remake's sixth)
  const d5 = y0 + 50;
  q.vline(x0, y0, d5 + 1);
  if (kind === 2) for (let v = 100; v <= 1000; v += 100) q.hline(x0 - 2, x0, d5 - toPix(v));
  else for (let i = 1; i <= 10; i++) q.hline(x0 - 2, x0, d5 - Math.trunc(50 * i / 10));
  let d4 = x0;
  vals.forEach((v, i) => {
    q.hline(d4, d4 + GP + BW, d5 + 1); d4 += GP;
    const hpx = v <= 0 ? 0 : kind === 2 ? toPix(v) : Math.trunc(50 * v / 1000);
    q.rect(d4, d5 - hpx, d4 + BW, d5, '#000'); q.rect(d4, y0, d4 + BW, d5 - hpx, '#fff');
    const w = q.width(names[i]);
    q.text(names[i], d4 + Math.trunc((BW - w) / 2), d5 + 10 + (kind === 2 ? 10 * (i % 2) : 0));
    d4 += BW;
  });
  q.hline(d4, d4 + GP, d5 + 1);
}
// which bar a point is on, and its value from the height (DoVBarClick)
function vbarHit(x0, y0, n, pt, geo) { const BW = (geo && geo.b) || 18, GP = (geo && geo.g) || 9, i = Math.floor((pt.h - x0 - GP) / (GP + BW)), off = (pt.h - x0 - GP) - (GP + BW) * i; return i >= 0 && i < n && off >= 0 && off < BW && pt.v >= y0 - 2 && pt.v <= y0 + 52 ? i : -1; }
// the share set on one bar, the rest spread over the others that are not finished, in proportion (equally when they are all 0)
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
    ev.preventDefault();
    if (getVals()[i] < 0) { A().beep(); return; } // (a finished part: PlaySound(-1))
    const start = getVals();
    const move = (e) => { const pt = q.at(e), px = Math.max(0, Math.min(50, y0 + 50 - pt.v)); set(spread(start, i, kind === 2 ? fromPix(px) : px * 1000 / 50), false); };
    const up = (e) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); move(e); set(null, true); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev);
  });
}
// a colony's three bars per mille from the remake's shares (the production share; terraforming's part of the rest), -1 when finished
function colonyBars(s, p) {
  const tf = Math.abs(H().seenT(p, s) - 72) <= 0.5, mf = !(s.metal > 0), ship = s.ship || 0, rest = 1 - ship, t = s.terra || 0;
  return [tf ? -1 : Math.round(1000 * rest * (mf ? 1 : t)), mf ? -1 : Math.round(1000 * rest * (tf ? 1 : 1 - t)), Math.round(1000 * ship)];
}
function setColonyBars(s, v) {
  const terra = Math.max(0, v[0]), mine = Math.max(0, v[1]);
  s.ship = Math.max(0, v[2]) / 1000;
  if (terra + mine > 0) s.terra = terra / (terra + mine);
}
const kvText = (box, key) => { const r = box && box.querySelector(`.kv[data-help="${key}"]`); if (!r) return null; const b = r.querySelector('b'); return { label: r.querySelector('span').textContent, value: b ? Array.from(b.childNodes).filter(n => !(n.classList && n.classList.contains('chg'))).map(n => n.textContent).join('').trim() : '', chg: (b && b.querySelector('.chg') || {}).textContent || '' }; };
function planetBox12(old) {
  const a = A(), g = G(), p = a.me(), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, rs = H().rules(g), W = planetWords(g);
  const q = qdCanvas(226, 68, s ? s.name : '');
  const box = a.el('section', { class: 'box planet12' }, q.c);
  if (s) {
    q.text(s.name, 0, 11, SYS12, { center: 43 });
    const R = (k) => kvText(old, k);
    const note = old && old.querySelector('p.note');
    if (s.owner !== a.ME && R('temp') == null) q.text(W.noInfo || (note && note.textContent) || '', 3, 22);
    else {
      const L = (t, v) => q.text(t, 0, v, G9, { right: 40 });
      const own = s.owner === a.ME;
      if (own) { const r = R('planetIncome'); if (r) { q.text(r.label, 5, 22); q.text(r.value, 45, 22); } }
      else {
        const o = R('owner'), d = R('infodate');
        if (o) { L(o.label, 22); q.text(o.value, 45, 22); }
        if (d) { q.text(d.label, 100, 22); q.text(d.value, 155, 22); }
        const bt = R('battle'); if (bt) { q.text(bt.label, 100, 32); q.text(bt.value, 155, 32); }
      }
      [['population', 32], ['temp', 42], ['gravity', 52], ['planetMetal', 62]].forEach(([k, v]) => { const r = R(k); if (r) { L(r.label, v); q.text(r.value, 45, v); } });
      if (own) {
        const vals = colonyBars(s, p);
        if (vals[0] >= 0 || vals[1] >= 0) {
          const draw = () => { q.rect(90, 0, 225, 66, '#fff'); vbars(q, 100, 2, colonyBars(s, p), 1, [W.terra || 'Terra', W.mine || 'Mine', W.prod || 'Prod']); };
          draw();
          dragBars(q, 100, 2, () => colonyBars(s, p), 1, (v, end) => { if (v) { setColonyBars(s, v); draw(); } if (end) { a.save(); a.renderPanel(); } });
        } else { // (both parts finished: the queue in place of the bars, "En cours:" and up to three MakeFleetDescription lines, or "Néant.")
          q.text(W.queued || 'En cours:', 100, 10);
          const lines = (s.queue || []).map(it => { const d = H().getDesign(g, a.ME, it.did); return d && rs.shipsText ? rs.shipsText(g, d, it.n) : null; }).filter(Boolean).slice(0, 3);
          if (!lines.length) q.text(W.none || 'Néant.', 103, 22);
          lines.forEach((t, i) => { const cond = q.width(t) > 226 - 103; q.text(t, 103, 22 + 10 * i, G9, { cond }); });
        }
      }
    }
    // (DrawPlanetRect: a double rule along the foot and a rule down the right)
  }
  q.hline(0, 226, 65); q.hline(0, 226, 67); q.vline(225, 0, 68);
  // (a double click on your colony opens Build Ships, as on the map: ClickInPlanetRect)
  if (s && s.owner === a.ME) q.c.addEventListener('dblclick', () => a.openBuild(s.id));
  return box;
}
// the fleets box (DrawFleetRect @c4c6c, DrawSelectedFleetInfo @c4f7e, DrawOneFleet @c4e3a): 226 x 62; the selected fleet's two
// lines at the top (its place or orders at 3, the star or the trip at 70; then fuel at 3, speed at 70 and "Recycl." or "Plein" /
// "Vide" at 125), a rule at 18 over the rows, your fleets at the star four rows of 10 (MakeFleetDescription at 3, bold when it has
// orders, condensed when wider than the row, the selected one inverted) with the scroll bar at the right, or "Pas de vaisseau sur
// cette planète." (4000.11); a double rule along the foot and a rule down the right.
let FLEET_TOP = 0;
// 1.2's own routines for what only its ruleset defines (the fleet rows and the selected fleet's lines, the panels' words, the battle panel), lent to a
// later ruleset: shipsText, fleetInfo, planetInfo and battlePanel exist only in rules-12, so in every other ruleset the fleet box was blank and the
// planet box had no words. They read G.opts.lang and say French when it is unset (a ruleset played in its own language), so they are handed the game as
// the player's language sees it: a view of it, not a change to it.
const RS12 = () => (H().RULESETS || {})['12'] || null;
const langView = (g) => Object.assign(Object.create(g), { opts: Object.assign({}, g.opts, { lang: lang() }) });
const planetWords = (g) => { const rs = H().rules(g), r12 = RS12(); return ((rs.planetInfo || (r12 && r12.planetInfo)) || {})[lang()] || {}; };
function fleetBox12() {
  const a = A(), g = G(), rs = H().rules(g), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, W = planetWords(g), r12 = RS12();
  const q = qdCanvas(226, 64, 'Fleets'); // (the window's 68 to 132: the fleet rect starts two rows under the planet's, Jake's shot015)
  const here = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const sel = here.find(f => f.id === a.UI.selFleet);
  FLEET_TOP = Math.max(0, Math.min(FLEET_TOP, here.length - 4));
  if (sel) {
    const L = rs.fleetInfo ? rs.fleetInfo(g, sel) : r12 ? r12.fleetInfo(langView(g), sel) : [];
    const first = L[0] || '', m = /^(.*?:) (.*)$/.exec(first);
    if (m && !sel.scrap301 && !/ via /.test(first)) { q.text(m[1], 3, 8); q.text(m[2], 70, 8); } else q.text(first, 3, 8);
    if (L[1]) q.text(L[1], 3, 18); if (L[2]) q.text(L[2], 70, 18); if (L[3]) q.text(L[3], 125, 18);
  }
  q.hline(0, 214, 20);
  if (!here.length) q.text(W.noFleets || '', 3, 30);
  here.slice(FLEET_TOP, FLEET_TOP + 4).forEach((f, i) => {
    const top = 21 + 10 * i, ds = H().fleetDesigns(g, f), d = ds[0], n = H().fleetCount ? H().fleetCount(f) : Object.values(f.ships).reduce((x, y) => x + y, 0);
    // (a ruleset without shipsText: 1.2's line for a fleet of one design; the engine's own label, "6 ships", for a mixed fleet)
    const t = rs.shipsText ? (d ? rs.shipsText(g, d, n) : '') : ds.length === 1 && r12 ? r12.shipsText(langView(g), d, n) : H().fleetLabel(g, f);
    const font = f.dest != null ? G9B : G9, cond = q.width(t, font) > 214 - 3;
    q.text(t, 3, top + 8, font, { cond });
    if (f.id === a.UI.selFleet) { q.x.globalCompositeOperation = 'difference'; q.rect(0, top, 214, top + 10, '#fff'); q.x.globalCompositeOperation = 'source-over'; }
  });
  // the list's scroll bar, 12 wide, from the rule (the window's 88) to the first of the two rules under it (129, 131): shot015
  drawBar(q.x, 214, 20, true, 42, 12, { on: true, value: FLEET_TOP, max: Math.max(0, here.length - 4) });
  q.hline(0, 226, 61); q.hline(0, 226, 63); q.vline(225, 0, 64);
  q.c.addEventListener('click', (ev) => { // ClickInFleetRect @c67d0: a row selects its fleet
    const pt = q.at(ev);
    if (pt.h >= 214) { if (here.length > 4 && pt.v >= 20 && pt.v < 62) { FLEET_TOP += pt.v < 41 ? -1 : 1; a.renderPanel(); } return; } // (the bar: a row up or down)
    if (pt.v < 21) return;
    const f = here[FLEET_TOP + Math.floor((pt.v - 21) / 10)]; if (f) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); }
  });
  q.c.addEventListener('wheel', (ev) => { if (here.length <= 4) return; ev.preventDefault(); FLEET_TOP += ev.deltaY > 0 ? 1 : -1; a.renderPanel(); }, { passive: false });
  return a.el('section', { class: 'box fleets12' }, q.c);
}
function incomeBox12(old) {
  const a = A(), q = qdCanvas(226, 32, 'Totals'); // (its rule, the window's 164, is the first row of the players and budget pane below: lowBox12)
  const rows = old ? Array.from(old.querySelectorAll('.kv')) : [];
  rows.slice(0, 3).forEach((r, i) => {
    const t = kvText(old, r.getAttribute('data-help')) || { label: r.querySelector('span').textContent, value: '', chg: '' }, v = 10 + 10 * i;
    q.text(t.label, 0, v, G9B, { right: 87 }); q.text(t.value, 90, v, G9B); if (t.chg) q.text(t.chg, 0, v, G9, { right: 225 });
  });
  q.vline(225, 0, 32);
  return a.el('section', { class: 'box info12' }, q.c);
}
// The small windows' title bar (Tech Spending, the Report Window: Jake's shot010, rows 371-381): 11 rows, the frame, then four rows dotted on
// every other pixel round a 7 x 7 close box at 7..13 (two white pixels either side of it), and a rule; no title.
function titleBar12(w) {
  const q = qdCanvas(w, 11, ''); q.c.setAttribute('aria-hidden', 'true'); q.c.classList.add('tbar12');
  q.hline(0, w, 0); q.hline(0, w, 10);
  for (let r = 2; r <= 8; r += 2) for (let h = 0; h < w; h += 2) if (h < 5 || h > 15) q.rect(h, r, h + 1, r + 1, '#000');
  q.x.strokeStyle = '#000'; q.x.lineWidth = 1; q.x.strokeRect(7.5, 2.5, 6, 6);
  return q.c;
}
const TECH12 = ['range', 'speed', 'weapons', 'shields', 'mini'];
const TECH_NAMES12 = { fr: ['Distance', 'Vitesse', 'Armes', 'Boucliers', 'Mini'], en: ['Range', 'Speed', 'Weapons', 'Shields', 'Mini'] };
// (the remake's own, in 1.2's drawing: a later ruleset's sixth bar, Radical research (5.0.5 and the Palm; 1.2's rules have none: noRadical).
// "Radical" is the word of every version that has it, French included; the bar is one more of the same vertical bars, and the box a little
// same size, the bars 14 wide with 8 before them (not 18 and 9) so the six fit where the five did; the levels are the five's, Radical has none)
function techBox12() {
  const a = A(), g = G(), p = a.me(), W = BAR_WORDS[lang()], names0 = TECH_NAMES12[lang()];
  const rad = !H().feature(g, 'noRadical') && H().TECHS.includes('radical');
  const keys = rad ? TECH12.concat('radical') : TECH12, names = rad ? names0.concat('Radical') : names0;
  const bw = 228, x0 = 80, geo = rad ? { b: 14, g: 8 } : null;
  const q = qdCanvas(bw, 96, W.head), sc = H().barScale(g, 'tech'); // (96 high, its second row of names at 85: shot010's window 382..477)
  const toPix = (v) => Math.trunc(50 * sc.toX(v)), fromPix = (px) => sc.toValue(px / 50);
  const vals = () => { const t = keys.reduce((s, k) => s + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
  const draw = () => {
    q.rect(0, 0, bw, 96, '#fff');
    q.text(W.head, 3, 10); q.text(W.levels, 3, 25);
    TECH12.forEach((k, i) => { q.text(names[i], 5, 35 + 10 * i); q.text(String(p.tech[k]), 50, 35 + 10 * i); });
    vbars(q, x0, 15, vals(), 2, names, toPix, geo);
  };
  draw();
  dragBars(q, x0, 15, vals, 2, (v, end) => { if (v) { keys.forEach((k, i) => { p.talloc[k] = v[i] / 1000; }); draw(); } if (end) { a.save(); a.renderPanel(); } }, fromPix, geo);
  if (rad) q.c.classList.add('remake12');
  return a.el('section', { class: 'box tech12', 'aria-label': W.head }, titleBar12(bw), q.c);
}
// the Report Window (CreateReportWin @1300b8: 250 x 96 under the map window, Stup +0x12, beside the Tech Spending window;
// UpdateReportWin @130370, DrawMessage @130652): the last 50 reports, 32 a row, each its icon (GetIconID) at the row's left and its
// sentence in a text box from 35, wrapped; opened at the current year's first (ScrollReportToCurrentDate); a click on one is
// ClickInReportWindow's (inverted 5 ticks, then its star and DoMessageAction). Here under the Tech Spending window.
const REP12 = { key: null, top: null };
function reportsBox12() {
  const a = A(), el = a.el, g = G(), p = a.me(), rs = H().rules(g);
  const old = rs.reportHistory ? (p.reportLog || []) : [], ms = old.concat(p.inbox || []);
  const list = el('ul', { class: 'reports rep12', 'aria-label': 'Report Window' });
  ms.forEach((m, i) => {
    const li = el('li', { class: 'click', tabindex: 0, 'data-now': i === old.length ? '1' : null, onclick: () => a.reportAction(m) }, a.msgIconEl(m));
    const t = el('span', { class: 'rt' }); t.append(a.degText(H().say(g, m.text))); li.append(t);
    list.append(li);
  });
  if (V3 && !document.documentElement.classList.contains('mac75')) { // (3.0.1's layout gives the list its own window: js/skins/mac12/panel.css #rep301; on the System 7.5 screen, html.mac75, its scroll bar and grow box too, below)
    const box3 = el('section', { class: 'box rep12box' }, list), key3 = g.turn + ':' + ms.length;
    setTimeout(() => { if (REP12.key === key3 && REP12.top != null) list.scrollTop = REP12.top; else { const now = list.querySelector('li[data-now]'); if (now) list.scrollTop = now.offsetTop - list.offsetTop; } REP12.key = key3; }, 0);
    list.addEventListener('scroll', () => { REP12.top = list.scrollTop; });
    return box3;
  }
  // its scroll bar (16 wide, the window's right edge, above the grow box: shot010) over the list's rows of 32 pixels (InitDelta: an arrow a row,
  // the grey a window less a row), and the grow box (16 x 16, its two squares); the browser's own scroll bar never shows
  list.classList.add('nosb12');
  const bc = el('canvas', { class: 'cv12' }), bar = el('div', { class: 'rbar12', role: 'scrollbar', 'aria-orientation': 'vertical', 'aria-controls': 'reports', tabindex: 0 }, bc), bb = { c: bc };
  const grow = qdCanvas(16, 16, ''); grow.c.classList.add('grow12'); grow.c.setAttribute('aria-hidden', 'true');
  grow.rect(0, 0, 16, 16, '#000'); grow.rect(1, 1, 15, 15, '#fff'); grow.x.strokeStyle = '#000'; grow.x.strokeRect(3.5, 3.5, 6, 6); grow.x.strokeRect(5.5, 5.5, 7, 7); grow.rect(6, 6, 12, 12, '#fff'); grow.x.strokeRect(5.5, 5.5, 7, 7);
  const vals = () => { const max = Math.max(0, Math.ceil((list.scrollHeight - list.clientHeight) / 32)); return { v: Math.min(max, Math.round(list.scrollTop / 32)), max }; };
  let press = null, ghost = null, timer = 0, drag = null;
  const L = () => Math.max(34, Math.round(list.clientHeight) - 15 + (BAR75() ? 2 : 0)); // (System 7.5's: from the title bar's black row to the grow box's, html.mac75)
  if (BAR75()) { const x = grow.x; x.setTransform(grow.x.getTransform()); drawGrow75(x); }
  const paint = () => { const o = vals(); bar.setAttribute('aria-valuenow', o.v); bar.setAttribute('aria-valuemax', o.max); paintBar(bb, true, L(), { on: true, value: o.v, max: o.max, press, ghost }); };
  const go = (d) => { list.scrollTop = Math.max(0, list.scrollTop + d); paint(); };
  bar.addEventListener('pointerdown', (e) => {
    const o = vals(); if (!o.max) return; e.preventDefault();
    try { bar.setPointerCapture(e.pointerId); } catch (x) {}
    const r = bc.getBoundingClientRect(), p0 = (e.clientY - r.top) / r.height * L(), t = 15 + Math.round((L() - 46) * o.v / o.max);
    if (p0 >= t && p0 < t + 16 && p0 >= 16 && p0 < L() - 16) { drag = { p0, t0: t, r }; ghost = t; paint(); return; }
    const page = Math.max(32, list.clientHeight - 32), d = p0 < 16 ? -32 : p0 >= L() - 16 ? 32 : p0 < t ? -page : page;
    press = p0 < 16 ? 'lo' : p0 >= L() - 16 ? 'hi' : null;
    const tick = () => { go(d); timer = setTimeout(tick, 100); }; tick();
  });
  bar.addEventListener('pointermove', (e) => { if (drag) { ghost = Math.max(15, Math.min(L() - 31, drag.t0 + (e.clientY - drag.r.top) / drag.r.height * L() - drag.p0)); paint(); } });
  const up = () => { clearTimeout(timer); press = null; if (drag) { const o = vals(), T = L() - 46; list.scrollTop = Math.round(Math.max(0, Math.min(1, T > 0 ? (ghost - 15) / T : 0)) * o.max) * 32; drag = null; ghost = null; } paint(); };
  bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
  bar.addEventListener('keydown', (e) => { const d = { ArrowUp: -32, ArrowDown: 32, PageUp: -64, PageDown: 64 }[e.key]; if (d) { e.preventDefault(); go(d); } });
  const body = el('div', { class: 'rep12body' }, list, bar, grow.c);
  const box = V3 ? el('section', { class: 'box rep12box' }, body) : el('section', { class: 'box rep12box' }, titleBar12(226), body); // (3.0.1, 4.0.5: the windoid's title bar is frame75's)
  // (kept where the player scrolled it while the reports are the same; a new turn opens it at the current year's first)
  const key = g.turn + ':' + ms.length;
  setTimeout(() => { if (REP12.key === key && REP12.top != null) list.scrollTop = REP12.top; else { const now = list.querySelector('li[data-now]'); if (now) list.scrollTop = now.offsetTop - list.offsetTop; } REP12.key = key; paint(); }, 0);
  list.addEventListener('scroll', () => { REP12.top = list.scrollTop; paint(); });
  return box;
}

// The players and the budget bars under the totals, as 1.2 draws them (the same code in 2.0.1), one canvas from the totals' rule (R, the map
// window's 164) to the window's foot (R + 166 at 640 x 480), each pixel placed as Jake's captures show it (captures/shot010, captures-system6/):
//   DrawIconRect @c5452: the players' rect 0..67 from R + 2, 18 pixels a row; each player's 16 x 16 icon at (9, row + 3) (you 1000, the
//     others 2000 + their face), the name at (28, row + 16) clipped at 67, a cross (pen 2) from (9, row + 3) to (25, row + 19) over a player
//     who is out, and a check mark (1, row + 11) (3, row + 15) (7, row + 7) by one who has ended the turn; before 2010 only you, on the first
//     row. Its scroll bar, 12 wide, 67..79 from R to the foot. ClickInIconRect @c745a does nothing.
//   DrawBudgetRect @c53bc, DrawHBarControl @c091e (79, R + 1): the heading "0%" at 124, "Lin" or "Log" at 146 and "100%" ending at 202 on
//     R + 13, ten ticks 2 high above a rule along R + 16 from 123 (linear: every 77 / 10 pixels; log: GetHPercBarAmt of 100, 200 ...);
//     then a row every 14 pixels from R + 16, Savings ("Epargne"), Tech, then the colonies: a rule down 123, the bar from 124 as long as
//     the share (77 at most), 9 high from the row's 5th pixel, black, or 50% grey for a colony losing money (its slot's +0x3c1, set by
//     ComputeIncomeAndPopulation when its income is below 0); for such a colony a tick 12 high from the row's 3rd pixel at its least share
//     (ComputeMinPercent; at 202 when it can't be met); the name right-aligned at 122 on the row's 13th pixel, italic below its least share,
//     underlined for the selected star. A rule down 123 to the foot. Its scroll bar, 12 wide, 214..226 from R + 16 to the foot.
//   DoHBarClick @c1002: a drag on a bar sets its share (rs.dragShare), a click above the bars switches the scale; a click on a colony's name
//     selects it (FollowStarNameClick); the bars' arrows scroll a row.
// The remake's own, for a later ruleset: a ring round an ally's icon (double for a best buddy), and a click on the players opens the Players window.
const LOW12 = { pTop: 0, bTop: 0 };
function lowBox12(B) {
  const a = A(), g = G(), p = a.me(), rs = H().rules(g), Wd = BAR_WORDS[lang()], later = rs.id !== (V2 ? 'mac20' : '12');
  const HT = 167, q = qdCanvas(226, HT, ''), x = q.x, FOOT = HT - 1;
  q.hline(0, 226, 0); // (the totals' rule, R)
  // DrawIconRect
  const prow = Math.trunc((FOOT - 2) / 18), early = g.year < 2010;
  const order = early ? [a.ME] : g.players.map((pl, i) => i);
  LOW12.pTop = early ? 0 : Math.max(0, Math.min(LOW12.pTop, order.length - prow));
  x.save(); x.beginPath(); x.rect(0, 2, 67, FOOT - 2); x.clip();
  order.slice(LOW12.pTop, LOW12.pTop + prow).forEach((i, r) => {
    const pl = g.players[i], top = 2 + 18 * r;
    // (LoadDrawBWIcon: the icon's own pixels inside its mask and black outside it, so on the pane it reads as a black square: shot015)
    const im = a.IMG['dos:s' + (i === a.ME ? 1000 : 2000 + (pl.face || 0))] || a.IMG[i === a.ME ? 'white0_0' : 'bad' + (pl.face || 0) + '_0'];
    q.rect(9, top + 3, 25, top + 19, '#000'); if (im && im.width) x.drawImage(im, 9, top + 3, 16, 16);
    if (later && i !== a.ME && pl.alive && H().isAllied(g, a.ME, i)) { // (the remake's ring for an ally, double for a best buddy)
      x.strokeStyle = '#000'; x.lineWidth = 1; x.beginPath(); x.arc(17, top + 11, 10.5, 0, Math.PI * 2); x.stroke();
      if (H().isBuddy(g, a.ME, i)) { x.beginPath(); x.arc(17, top + 11, 12.5, 0, Math.PI * 2); x.stroke(); }
    }
    q.text(pl.name, 28, top + 16, G9);
    if (!pl.alive || pl.surrendered) { x.strokeStyle = '#000'; x.lineWidth = 2; x.beginPath(); x.moveTo(10, top + 4); x.lineTo(26, top + 20); x.moveTo(26, top + 4); x.lineTo(10, top + 20); x.stroke(); x.lineWidth = 1; }
    if (!pl.human || (g.done || []).includes(i)) { x.strokeStyle = '#000'; x.lineWidth = 1; x.beginPath(); x.moveTo(1.5, top + 11.5); x.lineTo(3.5, top + 15.5); x.lineTo(7.5, top + 7.5); x.stroke(); }
  });
  x.restore();
  drawBar(x, 67, 0, true, HT, 12, { on: true, value: LOW12.pTop, max: Math.max(0, order.length - prow) });
  // DrawHBarControl
  const x0 = 124, sc = a.budgetScale(), log = sc.id === 'log';
  q.text('0%', x0, 13, G9); q.text(log ? Wd.log : Wd.lin, log ? 153 : 147, 13, G9); q.text('100%', 0, 13, G9, { right: 203 }); // ("Lin" at 147 and "100%" ending at 202 in shot010; English "Linear" / "Log" at 2.0.1's 147 / 153, as the 3.0.1 skin has them)
  for (let k = 1; k <= 10; k++) { const tx = x0 + (log ? hPercBar(100 * k) : Math.trunc(77 * k / 10)); q.vline(tx, 14, 16); }
  q.hline(123, 226, 16);
  const ents = B.ents || [], brow = Math.trunc((FOOT - 16) / 14);
  // the slots in the player's order (CreatePlayer: Savings, Tech, home; ColonizeStar puts each new colony's slot in front: shot015, Regor
  // above Epargne): the newer colonies newest first (rs colOrder, p.colOrder), Savings, Tech, then the home star
  const cols = ents.filter(e => e.star != null), ord = p.colOrder || [], home = p.homeStar;
  if (ord.length) cols.sort((e1, e2) => { const i1 = ord.indexOf(e1.star), i2 = ord.indexOf(e2.star); return (i1 < 0 ? 1e9 : i1) - (i2 < 0 ? 1e9 : i2); });
  const first = cols.filter(e => e.star !== home), last = cols.filter(e => e.star === home);
  const slots = first.concat(ents.filter(e => e.key === 'savings'), ents.filter(e => e.key === 'tech'), last);
  LOW12.bTop = Math.max(0, Math.min(LOW12.bTop, slots.length - brow));
  const low = new Set((rs.underfunded ? rs.underfunded(g, p) : []).map(st => st.id));
  const lenOf = (pm) => pm < 1 ? 0 : log ? hPercBar(pm) : Math.trunc((pm * 77 + 999) / 1000);
  let y = 16; const tb = [];
  slots.slice(LOW12.bTop, LOW12.bTop + brow).forEach((e) => {
    const pm = Math.round(e.get() * 1000), len = Math.min(77, lenOf(pm)), st = e.star != null ? g.stars[e.star] : null;
    const losing = !!(st && (st.oInc != null ? st.oInc : H().planetIncome(g, p, st)) < 0); // (the slot's +0x3c1, set from the income the last turn left)
    q.vline(123, y, y + 14);
    x.fillStyle = losing ? orPat(x, GRAY, '#000') : '#000'; x.fillRect(x0, y + 5, len, 9);
    if (losing) { const mn = rs.minShare ? rs.minShare(g, p, st.id) : 0; const tx = mn > 1000 ? 202 : x0 + Math.min(78, lenOf(mn)); q.vline(tx, y + 3, y + 15); }
    const name = e.key === 'savings' ? Wd.sav : e.key === 'tech' ? Wd.tech : st.name;
    tb.push({ x: x0, y: y + 3, w: 77, h: 12, vert: false, frac: len / 77, label: name });
    const font = st && low.has(st.id) ? 'italic ' + G9 : G9;
    const w = q.text(name, 0, y + 13, font, { right: 122 });
    if (st && a.UI.sel === st.id) q.hline(122 - Math.ceil(w), 122, y + 14);
    y += 14;
  });
  q.vline(123, y, FOOT);
  drawBar(x, 214, 16, true, HT - 16, 12, { on: true, value: LOW12.bTop, max: Math.max(0, slots.length - brow) });
  q.c.dataset.bars = JSON.stringify(tb); q.c.dataset.w = '226'; q.c.dataset.h = String(HT);
  q.c.setAttribute('aria-label', (W => W)(lang() === 'fr' ? 'Joueurs et budget' : 'Players and budget'));
  // the clicks
  q.c.style.touchAction = 'none';
  const scroll = (k, d) => { LOW12[k] += d; a.renderPanel(); };
  q.c.addEventListener('pointerdown', (ev) => {
    const pt = q.at(ev), v = pt.v;
    if (pt.h >= 67 && pt.h < 79) { if (v < 12) scroll('pTop', -1); else if (v >= HT - 12) scroll('pTop', 1); return; }
    if (pt.h >= 214) { if (v >= 16 && v < 28) scroll('bTop', -1); else if (v >= HT - 12) scroll('bTop', 1); return; }
    if (pt.h < 67) { if (later && a.openPlayers) a.openPlayers(); return; } // (ClickInIconRect: nothing in 1.2; the remake's Players window for a later ruleset)
    if (pt.h < 79) return;
    if (v < 16) { if (pt.h >= 123 && a.flipBarScale) a.flipBarScale(); return; }
    const e = slots[LOW12.bTop + Math.floor((v - 16) / 14)]; if (!e) return;
    if (pt.h < 123) { if (e.star != null) { a.UI.sel = e.star; if (a.centerOn) a.centerOn(e.star); a.renderPanel(); a.draw(); } return; }
    ev.preventDefault();
    const lk = rs.barLocked ? rs.barLocked(g, p, e.key) : null; if (lk) { a.beep(); return; }
    const start = JSON.stringify(p.budget);
    const set = (e2) => { const h = q.at(e2).h, f = Math.max(0, Math.min(1, (h - x0) / 77)), pm = log ? sc.toValue(f) : Math.round(f * 1000);
      if (rs.dragShare) { const b = p.budget, o = JSON.parse(start); b.tech = o.tech; b.savings = o.savings; b.col = o.col; const r = rs.dragShare(g, p, e.key, Math.max(0, Math.min(1000, Math.round(pm)))); if (r) { if (r.tech != null) b.tech = r.tech / 1000; if (r.savings != null) b.savings = r.savings / 1000; for (const k in r.col || {}) b.col[k] = r.col[k] / 1000; } }
      else e.set(pm / 1000);
      const c = lowBox12(B); box.replaceWith(c); box = c; };
    let pend = null, raf = 0;
    const later2 = (e2) => { pend = e2; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (pend) { const e3 = pend; pend = null; set(e3); } }); };
    const up = (e2) => { window.removeEventListener('pointermove', later2); window.removeEventListener('pointerup', up); if (raf) { cancelAnimationFrame(raf); raf = 0; } pend = null; set(e2); a.save(); a.renderPanel(); };
    window.addEventListener('pointermove', later2); window.addEventListener('pointerup', up); set(ev);
  });
  q.c.addEventListener('wheel', (ev) => { ev.preventDefault(); const pt = q.at(ev); scroll(pt.h < 79 ? 'pTop' : 'bTop', ev.deltaY > 0 ? 1 : -1); }, { passive: false });
  let box = a.el('section', { class: 'box low12c' }, q.c);
  return box;
}

function panel12(panel, B) {
  const a = A(), el = a.el;
  bars(panel, B);
  const old = B.planet;
  const pb = planetBox12(old);
  const fb = fleetBox12();
  const ib = incomeBox12(B.info);
  const low = lowBox12(B);
  const tb = techBox12();
  panel.innerHTML = '';
  panel.append(pb, fb, ib, low, tb, reportsBox12());
}

// ---------- Mac 3.0.1's main screen (js/skins/mac3, docs/status-301.md) ----------
// The arrangement is 2.0.1's (ResetWindows and SetWindowLocations are the same code in 3.0.1; Jake's shot012 and shot040): down the
// map window's left side the planet pane, the fleet pane, the money pane, then the players beside the budget bars; under it the Tech
// Spending window and the Report Window (CreateTechWin, UpdateTechWin and CreateReportWin are the same code). A pane that 3.0.1 draws
// with its own routine (DrawPlanetRect and DrawPieChart, DrawFleetRect, DrawIncomeRect, DrawIconRect, DrawBudgetRect and
// DrawHBarControl, DrawVBarControl, UpdateReportWin) is built from that routine; until it is, its place is left empty (white, as
// the window's background, with a dotted edge), never 2.0.1's drawing. data-todo names the routine still to read.
// the Tech Spending window (UpdateTechWin @1700f0, the same code as 2.0.1's: its heading, "Current Levels:" and the five levels; erased, grey on a
// colour screen), and its bars: DrawVBarControl @d0164 (80, 15, 6 bars, technologies, depth): an axis down 80 from 15 to 65 with ten ticks to its
// left at GetVPercBarAmt (the 50-pixel log table: x / 20.85); each bar a 22-pixel step from 80: a base line along 66, the bar from x + 7, 15 wide,
// as high as GetVPercBarAmt of its share (player +0x4c), painted in hue (50 - height) x 0x1BA - 0x5655 at full saturation and value (black in black
// and white), with two lines up its left and along its top at half saturation and two down its right at half value, the slot above it erased;
// its name (STR# 1001.1-6) centred under it at 75, every other one at 85; a last base line 7 long. DoVBarClick: a drag sets the share, the others
// spread in proportion over the rest.
const VLOG = Array.from({ length: 51 }, (_, x) => x === 50 ? 1000 : Math.trunc(10 * (Math.exp(2.302 + x / 20.85) - 10)));
const vPercBar = (pm) => { for (let x = 0; x < 51; x++) if (VLOG[x] >= pm) return Math.max(0, x - 1); return 50; };
function techBox301() {
  const a = A(), p = a.me(), W = BAR_WORDS[lang()], names = TECH_NAMES12[lang()], S1 = STR301(1001), col = COL301();
  const keys = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
  const q = qdCanvas(228, 96, W.head), x = q.x, bg = col ? RGB301.grey : '#fff';
  const vals = () => { const t = keys.reduce((s0, k) => s0 + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
  const draw = () => {
    q.rect(0, 0, 228, 96, bg);
    q.text(S1[11] || W.head, 3, 10); q.text(S1[12] || W.levels, 3, 25);
    TECH12.forEach((k, i) => { q.text(names[i], 5, 35 + 10 * i); q.text(String(p.tech[k]), 50, 35 + 10 * i); });
    const X0 = 80, Yb = 66;
    q.vline(X0, 15, 66); for (let k = 10; k <= 100; k += 10) q.hline(X0 - 2, X0, 65 - vPercBar(10 * k));
    let x1 = X0;
    vals().forEach((v, i) => {
      q.hline(x1, x1 + 23, Yb);
      const h = v < 1 ? 0 : vPercBar(v), l = x1 + 7, r = x1 + 22, t = Yb - h;
      if (col) {
        const hue = ((50 - h) * 0x1ba - 0x5655) & 0xffff;
        q.rect(l, t, r, Yb, css16(hsv2rgb([hue, 0xffff, 0xffff])));
        if (h > 0) {
          const hi = css16(hsv2rgb([hue, 0x7fff, 0xffff])), lo = css16(hsv2rgb([hue, 0xffff, 0x7fff]));
          q.rect(l - 2, t - 2, l - 1, Yb, hi); q.rect(l - 2, t - 2, r + 2, t - 1, hi); q.rect(l - 1, t - 1, l, Yb, hi); q.rect(l - 1, t - 1, r + 1, t, hi);
          q.rect(r, t, r + 1, Yb, lo); q.rect(r + 1, t - 1, r + 2, Yb, lo);
        }
      } else q.rect(l, t, r, Yb, '#000');
      const nm = S1[i] || names[i] || 'Radical', w = q.width(nm);
      q.text(nm, l + Math.trunc((15 - w) / 2), 75 + (i % 2) * 10);
      x1 += 22;
    });
    q.hline(x1, x1 + 8, Yb);
    q.c.dataset.bars = JSON.stringify(vals().map((v, i) => ({ x: 87 + 22 * i, y: 16, w: 15, h: 50, vert: true, frac: (v < 1 ? 0 : vPercBar(v)) / 50, label: S1[i] || names[i] || 'Radical' }))); q.c.dataset.w = '228'; q.c.dataset.h = '96';
  };
  draw();
  q.c.style.touchAction = 'none';
  q.c.addEventListener('pointerdown', (ev) => {
    const pt = q.at(ev), i = Math.floor((pt.h - 87) / 22), off = (pt.h - 87) - 22 * i;
    if (i < 0 || i >= keys.length || off < 0 || off >= 15 || pt.v < 13 || pt.v > 74) return; // (to just above the names: a finger on a short bar lands under its base line)
    ev.preventDefault();
    const start = vals(), sc = H().barScale(G(), 'tech');
    const move = (e) => { const px = Math.max(0, Math.min(50, 66 - q.at(e).v)); const nv = spread(start, i, sc.toValue(px / 50)); keys.forEach((k, j) => { p.talloc[k] = nv[j] / 1000; }); draw(); };
    const up = (e) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); move(e); a.save(); a.renderPanel(); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev);
  });
  return a.el('section', { class: 'box tech12 tech301', 'aria-label': W.head }, q.c);
}
// 3.0.1's words: its STR# lists (English 3.0.1; in French 3.0.1F's), js/lang-data.js
const STR301 = (id) => { const L = window.HOLANG && (lang() === 'fr' ? HOLANG.mac301Fr : HOLANG.mac301En); return (L && L[String(id)]) || []; };
const COL301 = () => COLOUR3;
// The 3.0.1 skins draw these panes for any ruleset played in them: 3.0.1's own keeps a colony's terraform / mine split as rs.bars (per mille
// of the two, -1 finished); any other the remake's s.terra, with a part finished as the 1.2 panes see it (colonyBars)
function bars301(s) {
  const rs = H().rules(G()); if (rs.bars) return rs.bars(s);
  const v = colonyBars(s, A().me()); if (v[0] < 0 && v[1] < 0) return [-1, -1]; if (v[0] < 0) return [-1, 1000]; if (v[1] < 0) return [1000, -1];
  const t = Math.round(1000 * (s.terra == null ? 0.5 : s.terra)); return [t, 1000 - t];
}
const setBars301 = (s, t, x) => { const rs = H().rules(G()); if (rs.setBars) rs.setBars(s, t, x); else s.terra = t / 1000; };
// sprintf as 3.0.1's strings need it: %s, %d, %.*s and %N.Md (at least M digits: "%d.%1.1d°F", "%d.%2.2dG")
const cfmt = (t, ...v) => { let i = 0; return t.replace(/%(\.\*)?(\d*)(?:\.(\d+))?([sd])|%%/g, (m, star, w, prec, c) => { if (m === '%%') return '%'; let x = String(v[i++]); if (c === 'd' && prec) { const neg = x.startsWith('-'); x = (neg ? '-' : '') + x.replace('-', '').padStart(+prec, '0'); } return w ? x.padStart(+w) : x; }); };
// The money pane (DrawIncomeRect @154294): the rect (the window's +0x70 + 4 down, 34 high, 226 wide) erased (black and white) or, on a
// colour screen (the window's depth, +0xc2, 4 or more), painted in the panes' grey (RGBForeColor -$ba6: 0xBBBB, shot012) less its 2 bottom
// rows. In bold, right-aligned at 87: "Reserve Metal:", "Ship Savings:", "Total Money:" (STR# 1005.4, .2, .3) on the base lines 10, 20, 30;
// at 90 the reserve metal (player +0x1c, LongToNiceString), Ship Savings (+0x10, "$%s", 1005.9; red, ForeColor 205, when below 0) and
// Total Money (+8, "$%s"). Then plain, right-aligned at the right edge less 1: the metal's change ((+0x24) "(up %s)" / "(down %s)", 1005.7
// and .8, in full), the interest (+0x14, the program's own "(Int: %s)", LongToNiceShortString) and Total Money's change ((+0xc) "(up $%s)" /
// "(down $%s)", 1005.5 and .6, short). A line along the bottom less 2, and one down the right edge less 1.
// 4.0.5's words (HOLANG.mac405En: its STR# lists by number; English only, as the program is)
const STR405 = (id) => { const L = window.HOLANG && HOLANG.mac405En; return (L && L[String(id)]) || []; };
// Mac 4.0.5's DrawIncomeRect @113340, the same three rows as 3.0.1's in its own words and look: Geneva (TextFont 3) bold, on a colour
// screen (depth 4 or more) the pane painted grey first (RGBForeColor, #cccccc in Jake's shot 012) and on a 1-bit one erased; every
// string drawn twice, white (ForeColor 30) one pixel down and right, then black (33) on it. Left, right-aligned at 87: "Metal:",
// "Savings:", "Net Income:" (STR# 6070.4, .2, .3) on baselines 10, 20, 30; at 90 the metal (player +0x1c, LongToNiceString), the savings
// (+0x10, "$%s" 6070.9; ForeColor 205, red, below zero) and the net income (+8, "$%s"). Then plain (TextFace 0), right-aligned at the
// pane's right less 1: the metal's change ("(up %s)" / "(down %s)", .7 / .8, in full), the interest (+0x14, "(Int: $%s)" .10,
// LongToNiceShortString) and the net income's change ("(up $%s)" / "(down $%s)", .5 / .6, short). A line along the bottom less 2 and one
// down the right edge less 1, as 3.0.1's. (The remake's p.net301 is the +8 the rules keep: equal to HO.projected's net each turn.)
// (4.0.5's panes in the Mac's own Geneva 9, plain and bold: the bitmap faces the DOS skin carries, js/skins/dos/style.css, at 12 CSS pixels a 9-point
// line as the battle window's GEN93; the 3.0.1 panes' G9 / G9B fall back to the system's Geneva or Verdana)
const G9M = "12px 'DOS Geneva 9', Geneva, Verdana, sans-serif", G9MB = "12px 'DOS Geneva 9 Bold', Geneva, Verdana, sans-serif";
function incomeBox405() {
  const a = A(), g = G(), p = a.me(), S = STR405(6070), col = COL301();
  const q = qdCanvas(226, 34, S[3] || 'Metal:');
  if (col) q.rect(0, 0, 226, 32, '#ccc');
  const sh = { shadow: '#fff' };
  const L = (t, v) => q.text(t, 0, v, G9MB, Object.assign({ right: 87 }, sh));
  const V = (t, v, color) => q.text(t, 90, v, G9MB, Object.assign({ color }, sh));
  const R = (t, v) => q.text(t, 0, v, G9M, Object.assign({ right: 225 }, sh));
  L(S[3] || 'Metal:', 10); L(S[1] || 'Savings:', 20); L(S[2] || 'Net Income:', 30);
  V(H().niceNum(Math.round(p.metal)), 10);
  V(fill(S[8] || '$%s', H().niceNum(Math.round(p.savings))), 20, p.savings < 0 && col ? '#dd0000' : null);
  V(fill(S[8] || '$%s', H().niceNum(Math.round(p.net301 || 0))), 30);
  const ch = (which) => { const c = (p.chg && p.chg[which]) || 0, up = c >= 0, n = Math.abs(Math.round(c));
    return which === 'metal' ? fill(S[up ? 6 : 7] || (up ? '(up %s)' : '(down %s)'), H().niceNum(n)) : fill(S[up ? 4 : 5] || (up ? '(up $%s)' : '(down $%s)'), H().niceShort(n)); };
  R(ch('metal'), 10);
  R(fill(S[9] || '(Int: $%s)', H().niceShort(Math.round(p.oInterest || 0))), 20);
  R(ch('income'), 30);
  q.hline(0, 227, 32); q.vline(225, 0, 34);
  return a.el('section', { class: 'box info12 info301 info405' }, q.c);
}
function incomeBox301() {
  if (V4) return incomeBox405();
  const a = A(), g = G(), p = a.me(), rs = H().rules(g), S = STR301(1005), col = COL301();
  const q = qdCanvas(226, 34, S[3] || 'Reserve Metal:');
  if (col) q.rect(0, 0, 226, 32, '#bbb');
  const L = (t, v) => q.text(t, 0, v, G9B, { right: 87 });
  const V = (t, v, color) => q.text(t, 90, v, G9B, { color });
  const R = (t, v) => q.text(t, 0, v, G9, { right: 225 });
  const fmt = (t, x) => fill(t, x);
  L(S[3] || 'Reserve Metal:', 10); L(S[1] || 'Ship Savings:', 20); L(S[2] || 'Total Money:', 30);
  V(H().niceNum(Math.round(p.metal)), 10);
  V(fmt(S[8] || '$%s', H().niceNum(Math.round(p.savings))), 20, p.savings < 0 && col ? '#dd0000' : null); // (redColor, as an 8-bit screen shows it; black on a 1-bit screen)
  V(fmt(S[8] || '$%s', H().niceNum(Math.round(p.net301 || 0))), 30);
  const ch = (which) => { const c = (p.chg && p.chg[which]) || 0, up = c >= 0, n = Math.abs(Math.round(c));
    return which === 'metal' ? fmt(S[up ? 6 : 7] || (up ? '(up %s)' : '(down %s)'), H().niceNum(n)) : fmt(S[up ? 4 : 5] || (up ? '(up $%s)' : '(down $%s)'), H().niceShort(n)); };
  R(ch('metal'), 10);
  R(rs.interestRow ? rs.interestRow(Math.round(p.oInterest || 0)) : '', 20);
  R(ch('income'), 30);
  q.hline(0, 227, 32); q.vline(225, 0, 34);
  return a.el('section', { class: 'box info12 info301' }, q.c);
}
// QuickDraw's ltGray and dkGray patterns (the QD globals' ltGray at A5-$485c, dkGray at -$4864: 88 22 88 22 ..., 77 DD 77 DD ...), as canvas patterns
const qdPat = (x, rows) => { const t = document.createElement('canvas'); t.width = t.height = 8; const c = t.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#000';
  rows.forEach((r, v) => { for (let h = 0; h < 8; h++) if (r & (0x80 >> h)) c.fillRect(h, v, 1, 1); }); return x.createPattern(t, 'repeat'); };
const LTGRAY = [0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22], DKGRAY = [0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd];
// 3.0.1's colour table (XWinProc @180bae: eighteen SetRGB at A5-$bf4..), as an 8-bit screen shows them (the system palette: Jake's shot012, shot042)
const RGB301 = { terra: '#00bb00' /* 1F21 B793 1431 */, poor: '#dd0000' /* DD6B 08C2 06A2 */, mine: '#0000dd' /* 0000 0000 D400 */, grey: '#bbbbbb' /* BBBB BBBB BBBB */ };
// DrawPieChart @d2da8 (h, v, depth, ring): a 44 x 44 oval at (h, v); on a colour screen PICT 600 (a bevelled ring) 3 pixels round it; then, unless
// terraforming or mining is finished (-1), the terraform share (player's star slot +0, per mille of the two) as an arc from 12 o'clock clockwise,
// green (A5-$bf4) or, when the planet's gravity is more than 2.56 times the player's either way, red (-$bee), ltGray in black and white; "Terra"
// (1005.17) at (h + 44, v - 2) in the arc's colour; the rest, mine, blue (-$bdc; dkGray), "Mine" (1005.18) right-aligned at (h, v - 2); a frame
// round the oval in black and white
function pieChart301(q, h, v, s, T, X) {
  const a = A(), p = a.me(), col = COL301(), S = STR301(1005), x = q.x;
  if (col) { const ring = a.IMG['dos:p600']; if (ring && ring.width) x.drawImage(ring, h - 3, v - 3, 50, 50); }
  if (T === -1 || X === -1) return;
  const r = Math.max(s.g, p.homeG) / Math.max(0.01, Math.min(s.g, p.homeG));
  const cx = h + 22, cy = v + 22, d6 = Math.trunc(360 * T / 1000);
  const arc = (from, to, fill) => { x.fillStyle = fill; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 22, (from - 90) * Math.PI / 180, (to - 90) * Math.PI / 180); x.closePath(); x.fill(); };
  const tc = col ? (Math.trunc(100 * r) > 256 ? RGB301.poor : RGB301.terra) : qdPat(x, LTGRAY), mc = col ? RGB301.mine : qdPat(x, DKGRAY);
  if (d6 > 0) arc(0, d6, tc);
  q.text(S[16] || 'Terra', h + 44, v - 2, G9, { color: col ? tc : '#000' });
  if (d6 < 360) arc(d6, 360, mc);
  q.text(S[17] || 'Mine', 0, v - 2, G9, { right: h, color: col ? mc : '#000' });
  if (!col) { x.strokeStyle = '#000'; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy, 21.5, 21.5, 0, 0, Math.PI * 2); x.stroke(); }
}
// The turning planet (DoGratuitousGraphics @1571c2, its first part; the second twinkles the map's stars): called by DrawPlanetRect (1) and by the
// idle loop (IdleTheHo, 0) at most every 10 ticks. Only for your colony with terraforming or mining finished, in the pane's black region (CreateMapWin:
// the rect 96..224 x 0..65 less the planet's 56 x 56 oval at (132, 4)). Each call: the frame count (-$1006) goes on by 1 in 0..223 and the picture
// slides by (count mod 112) pixels. Every fourth frame the 14 stars (-$a58: v, h, from 0, 0, never set first) are drawn out in black, moved a pixel
// left by the idle call, put back at h 127, v RND(1, 64) once past the left edge, and drawn in white: so they cross together as a column, and only
// in the region (behind the planet they don't show). The planet is a 168 x 56 picture strip by the planet's gravity against yours (bigger x 100 over
// smaller): under 150 PICT 6100 + star mod 6, to 200 6110 + mod 3, to 256 6120 + mod 4, else 6130; black and white: the strip's PICT through the oval.
// Colour (depth 4 or more): the strip (PPMp) into a 56 x 56 offscreen at -slide; a cold planet (your ideal temperature over the planet's, in tenths,
// / 107, at most 22: n) gets its ice caps, PICT 6150 at (-slide, n - 22) through RGN 6150 and PICT 6151 at (-slide, 22 - n) through RGN 6151 at
// (-slide, 48 - n); a hot one (the other way, at most 30) the desert strip PPMp 6140 through the square less RGN 6150 at (-slide, -n) and RGN 6151
// at (-slide, 26 + n); then the night side, blended 0xBFFF of black over it (a quarter of the picture left), the region by the count: a half
// (left under 112, right from it) less (count < 56, >= 168) or with (else) an oval as tall as the planet and as wide as how far the count is from 56,
// 112 or 168 or 224; then through the oval into the window.
const GRAT = { c: 0, stars: Array.from({ length: 14 }, () => ({ v: 0, h: 0 })), timer: null };
// (4.0.5's region starts at 108 and its planet at 139, 4: Jake's shots 008, 027, 158; 3.0.1's at 96 and 132)
const GREG = { l: V4 ? 108 : 96, r: V4 ? 226 : 224 };
const OVAL301 = { h: V4 ? 139 : 132, v: 4, d: 56 }, inOval301 = (h, v) => { const r = OVAL301.d / 2, dx = h + 0.5 - (OVAL301.h + r), dy = v + 0.5 - (OVAL301.v + r); return dx * dx + dy * dy <= r * r; };
function gratuitous301(x, s, idle) {
  const a = A(), p = a.me(), col = COL301(), IMG = a.IMG;
  GRAT.c = (GRAT.c + 1) % 224;
  const c = GRAT.c, off = c % 112, sid = s.id;
  if ((c & 3) === 3) GRAT.stars.forEach((st) => {
    const put = (fill) => { const h = GREG.l + st.h, v = st.v; if (h >= GREG.l && h < GREG.r && v >= 0 && v < 65 && !inOval301(h, v)) { x.fillStyle = fill; x.fillRect(h, v, 1, 1); } };
    put('#000');
    if (idle) st.h -= 1;
    if (st.h < 0) { st.h = GREG.r - GREG.l - 1; st.v = 1 + Math.floor(Math.random() * 64); }
    put('#fff');
  });
  const r = Math.trunc(100 * Math.max(s.g, p.homeG) / Math.max(0.01, Math.min(s.g, p.homeG)));
  const pic = r < 150 ? 6100 + sid % 6 : r <= 200 ? 6110 + sid % 3 : r <= 256 ? 6120 + sid % 4 : 6130;
  const tex = IMG['dos:p' + pic]; if (!tex || !tex.width) return;
  const D = OVAL301.d, o = document.createElement('canvas'); o.width = o.height = D;
  const ox = o.getContext('2d'); ox.imageSmoothingEnabled = false;
  ox.drawImage(tex, -off, 0);
  if (col) {
    // a picture at (ih, iv) through masks: inside the first (cap), or through the square less all of them (desert)
    const through = (im, masks, ih, iv, minus) => {
      if (!im || !im.width || masks.some(([m]) => !m || !m.width)) return;
      const t = document.createElement('canvas'); t.width = t.height = D; const tx = t.getContext('2d');
      tx.drawImage(im, ih, iv); tx.globalCompositeOperation = minus ? 'destination-out' : 'destination-in';
      masks.forEach(([m, h, v]) => tx.drawImage(m, h, v));
      ox.drawImage(t, 0, 0);
    };
    const d10 = Math.round(10 * (p.homeT - s.t)); // (your ideal less the planet's: above 0 it is colder)
    if (d10 > 0) {
      const n = Math.min(22, Math.trunc(d10 / 107));
      through(IMG['dos:p6150'], [[IMG['dos:rgn6150'], -off, n - 22]], -off, n - 22, false);
      through(IMG['dos:p6151'], [[IMG['dos:rgn6151'], -off, 48 - n]], -off, 22 - n, false);
    } else if (d10 < 0) {
      const n = Math.min(30, Math.trunc(-d10 / 107));
      through(IMG['dos:p6140'], [[IMG['dos:rgn6150'], -off, -n], [IMG['dos:rgn6151'], -off, 26 + n]], -off, 0, true);
    }
    // the night side
    const m = document.createElement('canvas'); m.width = m.height = D; const mx = m.getContext('2d');
    const half = c < 112 ? [0, D / 2] : [D / 2, D], w = c < 56 ? 56 - c : c < 112 ? c - 56 : c < 168 ? 168 - c : c - 168, el = Math.trunc((D - w) / 2);
    mx.fillStyle = '#000'; mx.fillRect(half[0], 0, half[1] - half[0], D);
    mx.globalCompositeOperation = (c < 56 || c >= 168) ? 'destination-out' : 'source-over';
    if (w > 0) { mx.beginPath(); mx.ellipse(el + w / 2, D / 2, w / 2, D / 2, 0, 0, Math.PI * 2); mx.fill(); }
    mx.globalCompositeOperation = 'source-in'; mx.fillStyle = 'rgba(0,0,0,' + (0xbfff / 0xffff) + ')'; mx.fillRect(0, 0, D, D);
    ox.drawImage(m, 0, 0);
  }
  x.save(); x.beginPath(); x.ellipse(OVAL301.h + D / 2, OVAL301.v + D / 2, D / 2, D / 2, 0, 0, Math.PI * 2); x.clip();
  x.imageSmoothingEnabled = false; x.drawImage(o, OVAL301.h, OVAL301.v); x.restore();
}
// the idle loop's call, every 10 ticks, on the pane as it is now
function gratuitousTick() {
  const cv = document.querySelector('#panel .planet301 canvas[data-planet]');
  const g = G(); if (!cv || !g) { clearInterval(GRAT.timer); GRAT.timer = null; return; }
  const s = g.stars[+cv.dataset.planet]; if (!s) return;
  const K = +cv.dataset.k || 2, x = cv.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0);
  gratuitous301(x, s, true);
}
// The planet pane (DrawPlanetRect @15491e): 226 x 68. Erased, or on a colour screen painted grey (A5-$ba6) less its right column (and, for your colony
// with terraforming or mining finished, less the 130 pixels at the right, which are black: the region -$10a8, CreateMapWin's rect round the planet's oval,
// where DoGratuitousGraphics draws the turning planet). The star's name in Chicago 12 centred at 43, base line 11; then Geneva 9:
//   no information (its info year below 2000): "You have no information about this planet." (1005.20) at (3, 22);
//   else "Pop:", "Temp:", "Gravity:", "Metal:" (1005.13-16) right-aligned at 40 on 32, 42, 52, 62; at 45 the temperature (720 less the player's
//   ideal plus the star's, in tenths: "%d.%1.1d°F", 4000.3), the gravity (100 x the star's over the player's: "%d.%2.2dG", 4000.4) and the metal;
//   yours: "Income:" (1005.12) at (5, 22), at 45 the colony's income ("$%s") and its population (on 32), then the pie chart at (130, 12) or the
//     planet's picture;
//   another's or nobody's: "Owner:" (4000.5) right-aligned at 40 on 22, at 45 the owner's name or "No One" (4000.38); at 45 on 32 "Uninhabited" or
//     "Unknown" (1005.21, .22); "Info Date:" (4000.7) at (100, 22) and the year at 155; "Battle Date:" (4000.10) at (100, 32) and the year at 155
//     when you know of a battle there.
// Rules at 65 and 67 and down 225. A click on your colony's pane while one part is not finished is DoPieClick @d3028: the beep if the other is finished;
// else, while the button is down, the angle round the pie (PtToAngle, 1 to 359; across 12 o'clock it stops at the end it came from) sets terraforming
// to (angle - 1) x 1000 / 358 and mining to the rest, and the pie and the budget bars are drawn again.
// Mac 4.0.5's DrawPlanetRect @113ab0: 226 x 68, erased or on a colour screen painted grey (#cccccc) to 108, or to the whole width when you have
// no information (the info year below 2000), or to 98 when your colony's slider is there; the rest black, DoGratuitousGraphics' stars and the
// planet's picture (3.0.1's routine, as gratuitous301: here for every star you know, not only your finished colonies). Every string twice, white
// one pixel down and right, then black: the star's name in Chicago 12 centred at 43 on 11; then Geneva 9: "You have no information about this
// planet." at (3, 22); else "Pop:", "Temp:", "Gravity:", "Metal:" (STR# 6070.13-16) right-aligned at 40 on 32, 42, 52, 62 and at 45 the figures
// (the temperature by CreateTempString, °F or °C); yours: "Income:" (6070.12) at (5, 22) and the colony's income at 45 ("$%s"), its people on 32;
// another's or nobody's: "Owner:" (6170.6) right-aligned at 40 on 22, the owner or "No One" (6170.30) at 45, "Uninhabited" / "Unknown" (6070.21,
// .22) at 45 on 32. No Info Date or Battle Date (3.0.1's). Three rules along the bottom (65, 66, 67) and one down the right. Your colony with
// both terraforming and mining unfinished (star +0x18f0, +0x18f2 not -1) has DrawVSliderBar @11448c at (98, 0): PICT 900 (colour 901, 10 x 67)
// and the thumb PICT 902 (903, 8 x 4) at (99, 1 + terraforming x 62 / 1000); ClickVSliderControl @110180 sets terraforming to
// clamp(v - 2, 0, 62) x 1000 / 62 and mining to the rest while the button is down, and draws the budget bars again.
function planetBox405() {
  const a = A(), g = G(), p = a.me(), sid = a.UI.sel, s = sid != null ? g.stars[sid] : null, S = STR405(6070), S7 = STR405(6170), col = COL301();
  const q = qdCanvas(226, 68, s ? s.name : '');
  const box = a.el('section', { class: 'box planet12 planet301 planet405' }, q.c);
  const yours = !!s && s.owner === a.ME, k = s ? H().know(g, p, sid) : null, info = !!s && (yours || !!(k && k.explored));
  const B = yours ? bars301(s) : null, slider = !!B && B[0] !== -1 && B[1] !== -1;
  const sh = { shadow: '#fff' }, T = (t, h0, v, o) => q.text(t, h0, v, (o && o.font) || G9M, Object.assign({}, sh, o));
  if (col) q.rect(0, 0, !info ? 225 : slider ? 98 : 108, 65, '#ccc');
  if (s) {
    T(s.name, 0, 11, { font: SYS3, center: 43 }); // (Chicago 12: the battle window's bitmap face)
    if (!info) T(S[19] || 'You have no information about this planet.', 3, 22);
    else {
      const src = yours ? s : k, L = (t, v) => T(t, 0, v, { right: 40 }), at = (t, v) => T(t, 45, v);
      L(S[12] || 'Pop:', 32); L(S[13] || 'Temp:', 42); L(S[14] || 'Gravity:', 52); L(S[15] || 'Metal:', 62);
      const t10 = Math.round(10 * (72 + (src.t - p.homeT))), gr = Math.trunc(100 * src.g / Math.max(0.01, p.homeG));
      at(cfmt(S7[2] || '%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10)), 42);
      at(cfmt(S7[4] || '%d.%2.2dG', Math.trunc(gr / 100), gr % 100), 52);
      at(H().niceNum(Math.round(src.metal)), 62);
      if (yours) { T(S[11] || 'Income:', 5, 22); at(fill(S[8] || '$%s', H().niceNum(Math.round(H().planetIncome(g, p, s)))), 22); at(H().niceNum(H().popNum(g, s.pop)), 32); }
      else { L(S7[5] || 'Owner:', 22); at(k.owner >= 0 ? g.players[k.owner].name : (S7[29] || 'No One'), 22); at(k.owner >= 0 ? (S[21] || 'Unknown') : (S[20] || 'Uninhabited'), 32); }
      q.rect(108, 0, 226, 65, '#000');
      q.c.dataset.planet = String(s.id); gratuitous301(q.x, s, false); if (!GRAT.timer) GRAT.timer = setInterval(gratuitousTick, 1000 / 6);
      if (slider) {
        const IMG = a.IMG, bar = IMG['dos:p901'], th = IMG['dos:p903'], off = Math.max(0, Math.min(62, Math.trunc(B[0] * 62 / 1000)));
        q.x.imageSmoothingEnabled = false;
        if (bar && bar.width) q.x.drawImage(bar, 98, 0); else q.rect(98, 0, 108, 67, '#888');
        if (th && th.width) q.x.drawImage(th, 99, 1 + off); else q.rect(99, 1 + off, 107, 5 + off, '#fff');
        q.c.style.touchAction = 'none';
        q.c.addEventListener('pointerdown', (ev) => {
          const pt0 = q.at(ev); if (pt0.h < 98 || pt0.h >= 108) return;
          ev.preventDefault();
          const move = (e) => { const v = q.at(e).v, t = Math.trunc(Math.max(0, Math.min(62, Math.trunc(v) - 2)) * 1000 / 62); if (t !== bars301(s)[0]) { setBars301(s, t, 1000 - t); const c = planetBox405(); box.replaceWith(c); } };
          const up = (e) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); move(e); a.save(); a.renderPanel(); };
          window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev);
        });
      }
    }
  }
  q.hline(0, 226, 65); q.hline(0, 226, 66); q.hline(0, 226, 67); q.vline(225, 0, 68);
  return box;
}
function planetBox301() {
  if (V4) return planetBox405();
  const a = A(), g = G(), p = a.me(), rs = H().rules(g), sid = a.UI.sel, s = sid != null ? g.stars[sid] : null, S = STR301(1005), S4 = STR301(4000), col = COL301();
  const q = qdCanvas(226, 68, s ? s.name : '');
  const box = a.el('section', { class: 'box planet12 planet301' }, q.c);
  const yours = !!s && s.owner === a.ME, B = yours ? bars301(s) : null, done = !!B && (B[0] === -1 || B[1] === -1);
  if (col) q.rect(0, 0, done ? 96 : 225, 68, RGB301.grey);
  if (done) q.rect(96, 0, 224, 65, '#000');
  if (s) {
    const k = H().know(g, p, sid);
    q.text(s.name, 0, 11, SYS12, { center: 43 });
    if (!yours && !(k && k.explored)) q.text(S[19] || 'You have no information about this planet.', 3, 22);
    else {
      const src = yours ? s : k, L = (t, v) => q.text(t, 0, v, G9, { right: 40 }), at = (t, v) => q.text(t, 45, v);
      L(S[12] || 'Pop:', 32); L(S[13] || 'Temp:', 42); L(S[14] || 'Gravity:', 52); L(S[15] || 'Metal:', 62);
      const t10 = Math.round(10 * (72 + (src.t - p.homeT))), gr = Math.trunc(100 * src.g / Math.max(0.01, p.homeG));
      at(cfmt(S4[2] || '%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10)), 42);
      at(cfmt(S4[3] || '%d.%2.2dG', Math.trunc(gr / 100), gr % 100), 52);
      at(H().niceNum(Math.round(src.metal)), 62);
      if (yours) {
        q.text(S[11] || 'Income:', 5, 22); at(fill(S[8] || '$%s', H().niceNum(Math.round(H().planetIncome(g, p, s)))), 22);
        at(H().niceNum(H().popNum(g, s.pop)), 32);
        if (!done) pieChart301(q, 130, 12, s, B[0], B[1]);
        else { q.c.dataset.planet = String(s.id); gratuitous301(q.x, s, false); if (!GRAT.timer) GRAT.timer = setInterval(gratuitousTick, 1000 / 6); }
      } else {
        L(S4[4] || 'Owner:', 22); at(k.owner >= 0 ? g.players[k.owner].name : (S4[37] || 'No One'), 22);
        at(k.owner >= 0 ? (S[21] || 'Unknown') : (S[20] || 'Uninhabited'), 32);
        q.text(S4[6] || 'Info Date:', 100, 22); q.text(String(2000 + Math.max(0, k.seen) * 10), 155, 22);
        const bs = a.lastBattles(sid); if (bs.length) { q.text(S4[9] || 'Battle Date:', 100, 32); q.text(String(bs[bs.length - 1].year), 155, 32); }
      }
    }
  }
  q.hline(0, 226, 65); q.hline(0, 226, 67); q.vline(225, 0, 68);
  if (yours && B && !(B[0] === -1 && B[1] === -1)) {
    q.c.style.touchAction = 'none';
    q.c.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      if (done) { a.beep(); return; }
      let last = Math.trunc(360 * B[0] / 1000) + 1, moved = false;
      const move = (e) => {
        const pt = q.at(e); let ang = Math.round(Math.atan2(pt.h - 152, -(pt.v - 34)) * 180 / Math.PI); if (ang < 0) ang += 360;
        if (last < 20 && ang > 338 && moved) ang = 1; if (last > 339 && ang < 20 && moved) ang = 359;
        ang = Math.max(1, Math.min(359, ang));
        const t = Math.trunc((ang - 1) * 1000 / 358);
        if (t !== bars301(s)[0]) { setBars301(s, t, 1000 - t); const c = planetBox301(); box.replaceWith(c); }
        last = ang; moved = true;
      };
      const up = (e) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); move(e); a.save(); a.renderPanel(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); move(ev);
    });
  }
  return box;
}
// The fleet pane, in the panel's rows 68 to 132 (A5 world: the fleet rect 70..129 x 0..226, the drag bar 130..132 under it; the fleet list's scroll
// bar, GrowMapWin: 214..226 x 89..131; here drawn as a plain System 7 scroll bar).
//   DrawSelectedFleetInfo @155826: the rect (1, 68)..(225, 89) erased or grey; for the star's selected fleet (one of yours there): "Fleet to be
//     scrapped for metal." (4000.12) at (4, 76) if it is marked (fleet +7); else with no orders "Stationed at:" (4000.13) at (4, 76) and the star at
//     (71, 76); with orders to its next stop "Departing to:" (.14) and "%s (Dist %d; Time %d)" (.15) at 71; on a route "Going to %s (D %d; T %d)
//     via %s" (.16) at 4. Then "Fuel: %d/%d" (.17: the design's range less the fuel used, the range) at (4, 86), "Speed: %d" (.18) at 71 and at
//     126 a colony fleet's "Full" or "Empty" (.19, .20; colonists aboard, +6), another's "Scrap: %s" (.21, LongToNiceString: what scrapping it
//     returns you, ScrapFleetsAndTypes: three quarters of its metal; shot012's one Columbus (1/1) Scout 497 = 663 x 3 / 4).
//   DrawFleetRect @1551a0: the list (0, 90)..(214, 130) erased or grey; four rows of 10 from 90: your fleets at the star from the scroll bar's
//     value (DrawOneFleet @155516), then the other players' (DrawOneOtherFleet @155728: RecalcFleetsAtNewStar's "%P’s %P", the owner and the
//     fleet, for a star you own or have a fleet at, fleets not built this turn; the ruleset's otherFleetRow), "There are no fleets at this planet."
//     (4000.11) at (3, 99) when there are none; a rule along 89 and one down 225; the drag bar painted black. (A bracket joins a fleet to the
//     one it will join, fleet +0x1a: 3.0.1 has no way to set one, so none is drawn.)
//   DrawOneFleet: the row erased (grey in colour), the selected fleet's in black with the words in grey (white in black and white); bold with
//     orders (+0x12), italic when built this turn (+9), condensed when wider than the row; at (3, row + 8) the fleet's description
//     (MakeFleetDescription); a fleet marked for scrapping gets the 50% grey pattern ORed over its row in grey (black on the selected row; white
//     in black and white).
//   ClickInFleetRect @150f3c: a click on a row of your fleets selects it.
const FLT301 = { top: 0 };
const GRAY = [0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55];
const orPat = (x, rows, colour) => { const t = document.createElement('canvas'); t.width = t.height = 8; const c = t.getContext('2d'); c.fillStyle = colour; rows.forEach((r, v) => { for (let h = 0; h < 8; h++) if (r & (0x80 >> h)) c.fillRect(h, v, 1, 1); }); return x.createPattern(t, 'repeat'); };
// (4.0.5's STR# 6170 has 3.0.1's STR# 4000 lines at four places less: "There are no fleets at this planet." 6170.7 = 4000.11 ... "Scrap: %s"
// 6170.17 = 4000.21, the same words; DrawSelectedFleetInfo @114c12 reads them there)
const FLEETWORDS = () => (V4 ? [0, 0, 0, 0].concat(STR405(6170)) : STR301(4000));
function fleetInfo301(g, f) {
  const S = FLEETWORDS(), star = (i) => g.stars[i].name, sp = H().fleetSpeed(g, f), L = [];
  if (f.scrap301) L.push([S[11] || 'Fleet to be scrapped for metal.']);
  else if (f.dest == null) L.push([S[12] || 'Stationed at:', star(f.star)]);
  else {
    const hops = [f.star, f.dest].concat(f.path || []);
    let dist = 0, time = 0;
    for (let i = 0; i + 1 < hops.length; i++) { const d = H().starDist(g, hops[i], hops[i + 1]); dist += d; time += Math.ceil(d / sp - 1e-9); }
    const end = hops[hops.length - 1];
    if (end === f.dest) L.push([S[13] || 'Departing to:', cfmt(S[14] || '%s (Dist %d; Time %d)', star(end), Math.round(dist), time)]);
    else L.push([cfmt(S[15] || 'Going to %s (D %d; T %d) via %s', star(end), Math.round(dist), time, star(f.dest))]);
  }
  const ds = H().fleetDesigns(g, f), col = ds.some(d => d.type === 'colony');
  let third;
  if (col) third = (f.colonists || 0) > 0 ? (S[18] || 'Full') : (S[19] || 'Empty');
  else {
    let m = 0; for (const k in f.ships) { const d = H().getDesign(g, f.owner, +k); if (d) m += f.ships[k] * H().designCost(g, d).metal; }
    // (4.0.5, DrawSelectedFleetInfo @114c12: 7/8 once the player has improved the recycling program, player +0x5c bit 0x10; else 3/4)
    const own = g.players[f.owner], rec = V4 && own && own.flags && own.flags.recycle;
    third = cfmt(S[20] || 'Scrap: %s', H().niceNum(rec ? Math.trunc(m * 7 / 8) : Math.trunc(m * 3 / 4)));
  }
  L.push([cfmt(S[16] || 'Fuel: %d/%d', Math.round(f.fuel || 0), H().fleetMaxRange(g, f)), cfmt(S[17] || 'Speed: %d', sp), third]);
  return L;
}
function fleetBox301() {
  const a = A(), g = G(), rs = H().rules(g), sid = a.UI.sel, s = sid != null ? g.stars[sid] : null, S = FLEETWORDS(), col = COL301();
  // (4.0.5 draws every line of the pane twice, white one pixel down and right, then black, on its grey (DrawSelectedFleetInfo @114c12,
  // DrawOneFleet @1148d6), in the Mac's Geneva 9)
  const T4 = V4 ? { shadow: '#fff' } : null, F9 = V4 ? G9M : G9, BG = col ? (V4 ? '#ccc' : RGB301.grey) : '#fff';
  const Y0 = 68, q = qdCanvas(226, 65, 'Fleets'), x = q.x, Y = (v) => v - Y0;
  const here = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const others = s && (s.owner === a.ME || here.length) ? g.fleets.filter(f => f.star === s.id && f.to == null && f.owner !== a.ME && !f.newThisTurn) : [];
  const total = here.length + others.length;
  FLT301.top = Math.max(0, Math.min(FLT301.top, total - 4));
  // RecalcFleetsAtNewStar (3.0.1 @15078c, 4.0.5 @110644, the same start): the selected fleet is dropped when it isn't at the star, and the
  // first of yours there becomes the selected one (Jake's 4.0.5 shots 008, 027, 065: the star's first fleet highlighted)
  // (the patch's firstShip, Jake 20 Nov 2026: a ship that can move first, Scout, Fighter, Dreadnought, Tanker, Colony Ship, then the rest,
  // the satellites last; ties keep the list's order)
  const SHIP_FIRST = { scout: 0, fighter: 1, dread: 2, tanker: 3, colony: 4, bio: 5, decoy: 6 };
  const firstOf = (list) => { if (!H().fixed(g, 'firstShip')) return list[0]; const k = (f) => { if (f.sat) return 99; const d = H().fleetDesigns(g, f)[0]; return d && d.type === 'satellite' ? 99 : d && SHIP_FIRST[d.type] != null ? SHIP_FIRST[d.type] : 50; }; return list.map((f, i) => [f, i]).sort((p, q) => k(p[0]) - k(q[0]) || p[1] - q[1])[0][0]; };
  if (here.length && !here.some(f => f.id === a.UI.selFleet)) a.UI.selFleet = firstOf(here).id;
  const sel = here.find(f => f.id === a.UI.selFleet);
  // DrawSelectedFleetInfo
  q.rect(1, Y(68), 225, Y(89), BG);
  if (sel) {
    const L = fleetInfo301(g, sel), t = (w, h0, v) => q.text(w, h0, v, F9, T4);
    t(L[0][0], 4, Y(76)); if (L[0][1]) t(L[0][1], 71, Y(76));
    t(L[1][0], 4, Y(86)); t(L[1][1], 71, Y(86)); t(L[1][2], 126, Y(86));
  }
  // DrawFleetRect: the list
  q.rect(0, Y(90), 214, Y(130), BG);
  const rows = [];
  here.forEach((f) => rows.push({ f }));
  others.forEach((f) => rows.push({ f, other: true }));
  rows.slice(FLT301.top, FLT301.top + 4).forEach((r, i) => {
    const top = Y(90 + 10 * i), f = r.f, selRow = !r.other && sel && f.id === sel.id;
    x.save(); x.beginPath(); x.rect(0, top, 214, 10); x.clip();
    q.rect(0, top, 214, top + 10, selRow ? '#000' : BG);
    let t;
    if (r.other) t = rs.otherFleetRow ? (rs.otherFleetRow(langView(g), f) || '') : '';
    else t = H().fleetText(g, f);
    const style = (r.other || f.newThisTurn ? 'italic ' : '') + (!r.other && f.dest != null ? 'bold ' : '') + (V4 ? (!r.other && f.dest != null ? G9MB : G9M) : '9px Geneva, Verdana, sans-serif');
    q.text(t, 3, top + 8, style, Object.assign({ cond: q.width(t, style) > 214, color: selRow ? (col ? BG : '#fff') : '#000' }, V4 && !selRow ? T4 : null));
    if (!r.other && f.scrap301) { x.fillStyle = orPat(x, GRAY, selRow ? (col ? '#000' : '#fff') : (col ? RGB301.grey : '#fff')); x.fillRect(0, top, 214, 10); }
    x.restore();
  });
  if (!total) q.text(S[10] || 'There are no fleets at this planet.', 3, Y(99), F9, T4);
  q.hline(0, 227, Y(89)); q.vline(225, 0, 65);
  q.rect(0, Y(130), 226, Y(133), '#000'); // DrawDragBarRect
  // the scroll bar (an OS control), 214..226 x 89..131: arrows at its ends, the thumb when there is more than fits
  if (V4 && COLOUR3) scrollBar75s(q, x, 215, Y(89), Y(131), Math.max(0, total - 4), FLT301.top, 1, 108); // (4.0.5's: 216..227 x 129..170 on the screen, shot 008)
  else {
  q.rect(214, Y(89), 226, Y(130), '#fff'); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(214.5, Y(89) + 0.5, 11, 41);
  [[Y(89), 1], [Y(119), -1]].forEach(([t0, d]) => { x.strokeRect(214.5, t0 + 0.5, 11, 11); x.beginPath(); const cy = t0 + 6; x.moveTo(217, cy + 2 * d); x.lineTo(220, cy - 2 * d); x.lineTo(223, cy + 2 * d); x.closePath(); x.stroke(); });
  if (total > 4) { x.fillStyle = orPat(x, GRAY, '#000'); x.fillRect(215, Y(101), 10, 18); const ty = Y(101) + Math.round(10 * FLT301.top / (total - 4)); q.rect(215, ty, 225, ty + 8, '#fff'); x.strokeRect(214.5, ty + 0.5, 11, 7); }
  }
  q.c.addEventListener('click', (ev) => {
    const pt = q.at(ev), v = pt.v + Y0;
    if (pt.h >= 214) { if (v < 101) FLT301.top--; else if (v >= 119) FLT301.top++; else return; a.renderPanel(); return; }
    if (v <= 89 || v >= 131) return;
    const r = rows[FLT301.top + Math.floor((v - 90) / 10)];
    if (r && !r.other && r.f.id !== a.UI.selFleet) { a.UI.selFleet = r.f.id; a.renderPanel(); a.draw(); }
  });
  q.c.addEventListener('wheel', (ev) => { if (total <= 4) return; ev.preventDefault(); FLT301.top += ev.deltaY > 0 ? 1 : -1; a.renderPanel(); }, { passive: false });
  return a.el('section', { class: 'box fleets12 fleets301' }, q.c);
}
// 3.0.1's colour table (XWinProc @180bae), all eighteen, as RGB 0..65535: the bars mix and shade them
const CT301 = [[0x1F21, 0xB793, 0x1431], [0xDD6B, 0x08C2, 0x06A2], [0x7FFE, 0, 0], [0x7FFF, 0x8000, 0x7FFF], [0, 0, 0xD400], [0x0500, 0x0500, 0x0500],
  [0x46E3, 0, 0xA53E], [0xFFFF, 0xFFFF, 0xFFFF], [0, 0x64AF, 0x11B0], [0, 0, 0], [0xF2D7, 0x0856, 0x84EC], [0x0FA0, 0x8FA7, 0x12DC], [0x7C00, 0x737E, 0],
  [0xBBBB, 0xBBBB, 0xBBBB], [0x1F21, 0xB793, 0xD400], [0xFFFF, 0x85A6, 0x12CA], [0xFFFF, 0x557A, 0], [0xB1B1, 0x8D8D, 0xD9D9]];
const css16 = (c) => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v / 257))).toString(16).padStart(2, '0')).join('');
// the Color Picker's RGB2HSV and HSV2RGB (Pack12 selectors 8 and 7), in SmallFracts (0..65535)
function rgb2hsv([r, g, b]) { const R = r / 65535, Gc = g / 65535, B = b / 65535, mx = Math.max(R, Gc, B), mn = Math.min(R, Gc, B), d = mx - mn; let h = 0;
  if (d > 0) h = mx === R ? ((Gc - B) / d + 6) % 6 : mx === Gc ? (B - R) / d + 2 : (R - Gc) / d + 4; return [Math.round(h / 6 * 65535) & 0xffff, mx ? Math.round(d / mx * 65535) : 0, Math.round(mx * 65535)]; }
function hsv2rgb([h, s, v]) { const H = (h & 0xffff) / 65536 * 6, S = s / 65535, V = v / 65535, i = Math.floor(H), f = H - i, p = V * (1 - S), q = V * (1 - S * f), t = V * (1 - S * (1 - f));
  const [R, Gc, B] = [[V, t, p], [q, V, p], [p, V, t], [p, q, V], [t, p, V], [V, p, q]][i % 6]; return [R, Gc, B].map(x => Math.round(x * 65535)); }
// GetHPercBarAmt @d0a30: a share's length on the 77-pixel log bar (InitHLogBarAmts: pixel x worth trunc(10 (e^(2.302 + x / 32.11) - 10)), the
// last 1,000): the first pixel whose worth passes it, less one
const HLOG = Array.from({ length: 78 }, (_, x) => x === 77 ? 1000 : Math.trunc(10 * (Math.exp(2.302 + x / 32.11) - 10)));
const hPercBar = (pm) => { for (let x = 0; x < 78; x++) if (HLOG[x] >= pm) return Math.max(0, x - 1); return 77; };
// The players and the budget, the panel's rows 166 to 330 (the map window's foot):
//   DrawIconRect @155d9e: the players' rect (0..67 x 167..330), 18 pixels a row; each player on the row of its place in the order (the
//     header's +0x2f4 bytes, which are also its face: CreateGalaxy numbers them, DoGameSolidificationStuff shuffles them; before 2010 only
//     you, on the first); its 16 x 16 icon at (9, row + 3) (you: 1000, another 2000 + face; +500 a woman), the allies' halo icon 5000 over
//     it, the name at (28, row + 16) (condensed when wider than 39), a cross (pen 2) over the icon of a player who is out (mode above 3)
//     and a check mark at the left of one who has ended the turn. Its scroll bar 67..79 x 165..331.
//   DrawBudgetRect @155c86: the budget rect (79..214 x 166..330) and the strip at its right erased or grey; DrawHBarControl @d0a7c (79, 166,
//     10 rows, 100): the heading: a "Sort" button (FrameRoundRect 6) ending at 122, "0%" (STR# 1001.7) at 124, "100%" (.11) ending at 202,
//     "Log" (1005.23) at 153 or "Linear" (.24) at 147 by the switch, a rule along 181 from 124 to 214 and ten ticks up from it; then a row
//     every 14 from 181 for each slot (Ships, Tech, the colonies): a rule down 123, the bar from 124, as long as its share (log: GetHPercBarAmt;
//     linear: the share x 77 / 1000 rounded up), 7 high at the row's foot, painted in its colour (Ships: the two oranges, 16 and 15 of the
//     table, mixed by its share; Tech: hue -(200 x length + 1), full saturation and value; a colony: blue (4) for mining and green (0; red,
//     1, on a planet of poor gravity) for terraforming, mixed by its two shares), with two lines above it in the colour at half saturation
//     and two below and at its right at half value (black and white: black, a colony losing money 50% grey, a row higher and lower); the row
//     past it erased to 203; the name right-aligned at 122 on the foot (underlined for the selected star), near black (5), or for a colony
//     losing money red (1; 2 on a planet of poor gravity); "Abandoning" at 127 for a colony being abandoned, else "$" and the income
//     there for a colony with both its parts finished. A rule down 123 to the foot. Its scroll bar 214..226 x 181..331.
//   DoHBarClick: a drag on a bar sets its share (the ruleset's rs.dragShare, the others moved as it says); a click on the heading switches
//     the scale. ("Sort" is not built.)
const LOW301 = { pTop: 0, bTop: 0 };
function scrollBar301(q, x, l, t, b, max, val, oy) { // an OS scroll bar, drawn plainly: arrows at the ends, the grey track and its thumb when it scrolls
  if (V4 && COLOUR3) return scrollBar75s(q, x, l, t, b, max, val, 1, oy == null ? 206 : oy); // (the canvas's place on the 640 x 480 screen: its dots as the screen's; the players and budget pane's from (1, 206))
  q.rect(l, t, l + 12, b, '#fff'); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(l + 0.5, t + 0.5, 11, b - t - 1);
  [[t, 1], [b - 12, -1]].forEach(([t0, d]) => { x.strokeRect(l + 0.5, t0 + 0.5, 11, 11); x.beginPath(); const cy = t0 + 6; x.moveTo(l + 3, cy + 2 * d); x.lineTo(l + 6, cy - 2 * d); x.lineTo(l + 9, cy + 2 * d); x.closePath(); x.stroke(); });
  if (max > 0) { const tr = b - t - 24; x.fillStyle = orPat(x, GRAY, '#000'); x.fillRect(l + 1, t + 12, 10, tr); const ty = t + 12 + Math.round((tr - 8) * val / max); q.rect(l + 1, ty, l + 11, ty + 8, '#fff'); x.strokeRect(l + 0.5, ty + 0.5, 11, 7); }
}
// 4.0.5's 12-pixel scroll bars (the panes': players, colonies, fleets), System 7.5's colour bar copied from Jake's shot 008: the frame black
// both sides, an arrow box 10 rows (#dddddd, the arrow #9999cc edged #333366, a #777777 last row and column), black dividers, the track's
// #777777 dots on #dddddd aligned to the screen, a 12-row thumb (#555555, #ccccff, #aaaaaa, a #9999cc / #666699 grip, #333366); with nothing to
// scroll, #eeeeee with the arrows outlined in #777777 and no thumb.
const AR75S = [' ', '    E', '   EFE', '  EEFFE', ' EFFFFFE', 'EEEEFFEEE', '   EFFE', '   EFFE', '   EEEE'];
function scrollBar75s(q, x, l, t, b, max, val, ox, oy) {
  const on = max > 0, R = (h, v, w, hh, c) => q.rect(h, v, h + w, v + hh, c);
  R(l, t, 12, b - t, '#000'); R(l + 1, t + 1, 10, b - t - 2, on ? '#dddddd' : '#eeeeee');
  const box = (t0, down) => {
    R(l + 1, t0, 10, 10, on ? '#dddddd' : '#eeeeee'); if (on) { R(l + 10, t0, 1, 10, '#777777'); R(l + 1, down ? t0 + 9 : t0 + 9, 10, 1, '#777777'); }
    AR75S.forEach((row, i) => { for (let j = 0; j < row.length; j++) { const ch = row[j]; if (ch === ' ' || (!on && ch === 'F')) continue; R(l + 1 + j, down ? t0 + 9 - i : t0 + i, 1, 1, on ? (ch === 'E' ? '#333366' : '#9999cc') : '#777777'); } });
  };
  box(t + 1, false); R(l + 1, t + 11, 10, 1, on ? '#000' : '#777777'); R(l + 1, b - 12, 10, 1, on ? '#000' : '#777777'); box(b - 11, true);
  if (!on) return;
  for (let v = t + 12; v < b - 12; v++) for (let h = l + 1; h < l + 11; h++) { const gx = h + ox, gy = v + oy; if ((gy & 1) ? (gx & 3) === 0 : (gx & 3) === 2) R(h, v, 1, 1, '#777777'); }
  const T = b - t - 36; if (T < 0) return;
  const tp = t + 12 + Math.round(T * Math.max(0, Math.min(1, val / max)));
  R(l + 1, tp, 10, 12, '#aaaaaa'); R(l + 1, tp, 10, 1, '#555555'); R(l + 1, tp + 1, 1, 10, '#ccccff'); R(l + 10, tp + 1, 1, 10, '#333366'); R(l + 1, tp + 11, 10, 1, '#333366');
  R(l + 4, tp + 2, 4, 1, '#9999cc'); [3, 6, 9].forEach(k => R(l + 4, tp + k, 4, 1, '#ccccff')); [4, 5, 7, 8].forEach(k => R(l + 4, tp + k, 4, 1, '#666699'));
}
function lowBox301(B) {
  const a = A(), g = G(), p = a.me(), rs = H().rules(g), col = COL301(), S5 = STR301(1005), S1 = STR301(1001);
  // (the window's foot: 331 on the 640 x 480 screen; on a taller one GrowMapWin runs the players' and budget's rects and scroll bars to the
  // map window's foot, eff60c (4.0.5 @120306), so the pane grows with the window: html.mac75)
  const pnl = document.getElementById('panel'), FT = document.documentElement.classList.contains('mac75') && pnl ? Math.max(331, Math.floor(pnl.getBoundingClientRect().height / (MACS.s || 1))) : 331;
  const Y0 = 166, q = qdCanvas(226, FT - 166, ''), x = q.x, Y = (v) => v - Y0, bg = col ? (V4 ? '#ccc' : RGB301.grey) : '#fff'; // (4.0.5's grey: #cccccc, shot 008)
  // 4.0.5 (Jake's shot 008, at 640 x 480): the players' rect 0..78 with its scroll bar 78..90, 22 pixels a row from 166, the icon at (10, row + 7),
  // the name at (29, row + 19), the check mark (2, row + 15) (4, row + 19) (7, row + 12), every player from the start (2000 shows all seven);
  // the budget from 90 (DrawBudgetRect @115252: DrawHBarControl at the rect's left - 1)
  const PW = V4 ? 78 : 67, RH = V4 ? 22 : 18, BL = V4 ? 90 : 79, SH = V4 ? { shadow: '#fff' } : null;
  // DrawIconRect
  q.rect(0, Y(166), PW, Y(FT), bg);
  const prow = V4 ? Math.trunc((FT - 1 - 166) / RH) : Math.trunc((FT - 1 - 167 - 3) / 18);
  // (the remake's faces are picked from the twenty, not numbered 0 to n - 1 as 3.0.1's are: the order is the players sorted by face, a player with
  // none, the human, after them)
  const ranked = g.players.map((pl, i) => i).sort((i, j) => ((g.players[i].face ?? 99) - (g.players[j].face ?? 99)) || i - j);
  const early = g.year < 2010 && !V4;
  const order = g.players.map((pl, i) => ({ pl, i, at: early ? (i === a.ME ? 0 : -1) : ranked.indexOf(i) }));
  const nP = early ? 1 : g.players.length;
  LOW301.pTop = Math.max(0, Math.min(LOW301.pTop, nP - prow));
  order.forEach(({ pl, i, at }) => {
    const r = at - (early ? 0 : LOW301.pTop); if (at < 0 || r < 0 || r >= prow) return;
    const top = V4 ? Y(166 + RH * r) + 4 : Y(167 + 18 * r); // (4.0.5: the icon at row + 7, the 3.0.1 code's + 3)
    const ic = a.IMG['dos:s' + ((i === a.ME ? (V4 ? 1406 : 1000) : 2000 + (pl.face || 0)) + (pl.female ? 500 : 0))]; // (4.0.5 numbers its small icons as its planets: you are 1406, shot 008)
    if (ic && ic.width) x.drawImage(ic, 9, top + 3, 16, 16);
    if (i !== a.ME && pl.alive && H().isAllied(g, a.ME, i)) { const h = a.IMG['dos:s5000']; if (h && h.width) x.drawImage(h, 9, top + 3, 16, 16); }
    q.text(pl.name, V4 ? 29 : 28, top + (V4 ? 15 : 16), G9, Object.assign({ cond: q.width(pl.name) > (V4 ? 48 : 39) }, SH));
    if (!pl.alive || pl.surrendered) { x.strokeStyle = '#000'; x.lineWidth = 2; x.beginPath(); x.moveTo(10, top + 4); x.lineTo(25, top + 19); x.moveTo(25, top + 4); x.lineTo(10, top + 19); x.stroke(); x.lineWidth = 1; }
    if (!pl.human || (g.done || []).includes(i)) {
      if (V4) [[7, 8], [7, 9], [6, 10], [2, 11], [6, 11], [3, 12], [5, 12], [3, 13], [5, 13], [4, 14], [4, 15]].forEach(([h, v]) => q.rect(h, top + v, h + 1, top + v + 1, '#000')); // (shot 008's pixels)
      else { x.strokeStyle = '#000'; x.beginPath(); x.moveTo(1.5, top + 11.5); x.lineTo(3.5, top + 15.5); x.lineTo(7.5, top + 7.5); x.stroke(); }
    }
  });
  scrollBar301(q, x, PW, Y(165), Y(FT), Math.max(0, nP - prow), LOW301.pTop);
  // DrawBudgetRect, DrawHBarControl
  q.rect(BL, Y(166), 214, Y(FT), bg); q.rect(214, Y(V4 ? 166 : 181), 225, Y(FT), bg); if (V4 && col) q.rect(225, Y(166), 226, Y(FT), '#fff');
  const L = BL, x0 = L + 45, sc = a.budgetScale(), log = sc.id === 'log';
  x.font = G9;
  const pc100 = S1[10] || '100%';
  if (V4) { // (4.0.5's heading: "100%" ending at the rect's left + 128, with its shadow, and the ticks; no Sort, no "0%", no scale's name: shot 008)
    q.text(pc100, 0, Y(178), G9, Object.assign({ right: L + 128 }, SH)); q.hline(x0 - 1, 215, Y(181));
  } else {
    const sw = q.width('Sort');
    x.strokeStyle = '#000'; x.lineWidth = 1; x.beginPath(); x.roundRect(x0 - sw - 7 + 0.5, Y(169) + 0.5, (x0 - 2) - (x0 - sw - 7) - 1, 10, 3); x.stroke();
    q.text('Sort', x0 - sw - 4, Y(178));
    q.text(pc100, L + 123 - q.width(pc100), Y(178)); q.text(S1[6] || '0%', x0, Y(178));
    q.hline(x0, 215, Y(181));
    q.text(log ? (S5[22] || 'Log') : (S5[23] || 'Linear'), log ? L + 74 : L + 68, Y(178));
  }
  for (let k = 1; k <= 10; k++) { const tx = x0 + (log ? hPercBar(100 * k) : Math.trunc(77 * k / 10)); q.vline(tx, Y(179), Y(181)); }
  const ents = B.ents || [], brow = Math.trunc((FT - 1 - 167 - 15) / 14);
  // 3.0.1's slots: Ships first, then Tech, then the colonies
  const slots = ents.filter(e => e.key === 'savings').concat(ents.filter(e => e.key === 'tech'), ents.filter(e => e.star != null));
  LOW301.bTop = Math.max(0, Math.min(LOW301.bTop, slots.length - brow));
  const low = new Set((rs.underfunded ? rs.underfunded(g, p) : []).map(st => st.id));
  const lenOf = (pm) => pm < 1 ? 0 : log ? hPercBar(pm) : Math.trunc((pm * 77 + 999) / 1000);
  let y = Y(181);
  const tb = []; // (where the bars are, in the canvas's pixels: for a test tool, data-bars)
  // 4.0.5 (DrawHBarControl @50a80): Ships and Tech always on top; at the third slot a rule down the bars' left, then 7 lower a rule across to
  // the rect's right, and the colonies below it, scrolled by their own bar (shot 008: the rule at 256, the colonies' bar from 257)
  const shown = V4 ? slots.slice(0, 2).concat(slots.slice(2).slice(LOW301.bTop, LOW301.bTop + brow - 2)) : slots.slice(LOW301.bTop, LOW301.bTop + brow);
  let sepY = null;
  shown.forEach((e, k) => {
    if (V4 && k === 2) { q.vline(L + 44, y, y + 14); y += 7; q.hline(L + 44, 226, y); sepY = y; }
    const pm = Math.round(e.get() * 1000), len = Math.min(77, lenOf(pm)), st = e.star != null ? g.stars[e.star] : null;
    const inc = st ? H().planetIncome(g, p, st) : 0, abandoning = !!(st && st.abandon301);
    const ratio = st ? Math.trunc(100 * Math.max(st.g, p.homeG) / Math.max(0.01, Math.min(st.g, p.homeG))) : 0;
    q.vline(L + 44, y, y + 15);
    let top = y + 7, bottom = y + 14;
    if (!col) {
      top -= 1; bottom += 1;
      x.fillStyle = st && inc < 0 ? orPat(x, GRAY, '#000') : '#000'; x.fillRect(x0, top, len, bottom - top);
    } else {
      let rgb, hsv;
      if (e.key === 'tech') { hsv = [(len * -200 - 1) & 0xffff, 0xffff, 0xffff]; rgb = hsv2rgb(hsv); }
      else {
        if (e.key === 'savings') rgb = [0, 1, 2].map(k => Math.trunc((CT301[16][k] * pm + CT301[15][k] * (1000 - pm)) / 1000));
        else { const bb = bars301(st), T = bb[0], X = bb[1], tc = ratio <= 256 ? CT301[0] : CT301[1]; rgb = [0, 1, 2].map(k => Math.trunc((CT301[4][k] * X + tc[k] * T) / 1000)); }
        hsv = rgb2hsv(rgb);
      }
      x.fillStyle = css16(rgb); x.fillRect(x0, top, len, bottom - top);
      if (len > 0 && !abandoning) {
        const hi = css16(hsv2rgb([hsv[0], hsv[1] >> 1, hsv[2]])), lo = css16(hsv2rgb([hsv[0], hsv[1], hsv[2] >> 1]));
        q.rect(x0, top - 1, x0 + len + 1, top, hi); q.rect(x0, top - 2, x0 + len + 2, top - 1, hi);
        q.rect(x0, bottom, x0 + len + 1, bottom + 1, lo); q.rect(x0 + len, top, x0 + len + 1, bottom + 1, lo);
        q.rect(x0, bottom + 1, x0 + len + 2, bottom + 2, lo); q.rect(x0 + len + 1, top - 1, x0 + len + 2, bottom + 2, lo);
      }
    }
    const name = e.key === 'savings' ? (S5[25] || 'Ships') : e.key === 'tech' ? (S5[24] || 'Tech') : st.name;
    tb.push({ x: x0, y: y + 3, w: 77, h: 13, vert: false, frac: len / 77, label: name });
    const lc = !col ? '#000' : !st || inc >= 0 ? css16(CT301[5]) : css16(ratio <= 256 ? CT301[1] : CT301[2]);
    const w = q.text(name, 0, y + 14, G9, Object.assign({ right: L + 43, color: lc }, SH));
    if (st && a.UI.sel === st.id) q.rect(L + 43 - w, y + 15, L + 43, y + 16, lc);
    if (abandoning) q.text('Abandoning', L + 48, y + 14, G9, { color: lc });
    else if (st) { const bb = bars301(st); if (bb[0] === -1 && bb[1] === -1) q.text('$' + H().niceNum(Math.round(inc)), L + 48, y + 14, G9, { color: lc }); }
    y += 14;
  });
  q.vline(L + 44, y, Y(FT));
  if (V4 && sepY == null) { q.vline(L + 44, y, y + 14); y += 7; q.hline(L + 44, 226, y); sepY = y; }
  q.c.dataset.bars = JSON.stringify(tb); q.c.dataset.w = '226'; q.c.dataset.h = String(FT - 166);
  if (V4) scrollBar301(q, x, 213, sepY + 1, Y(FT), Math.max(0, slots.length - 2 - (brow - 2)), LOW301.bTop);
  else scrollBar301(q, x, 214, Y(181), Y(FT), Math.max(0, slots.length - brow), LOW301.bTop);
  // DoHBarClick: a drag on a bar, a click on the heading; the scroll bars; a click on a colony's name selects it (FollowStarNameClick)
  q.c.style.touchAction = 'none';
  q.c.addEventListener('pointerdown', (ev) => {
    const pt = q.at(ev), v = pt.v + Y0;
    if (pt.h >= PW && pt.h < PW + 12) { LOW301.pTop += v < (165 + FT) / 2 ? -1 : 1; a.renderPanel(); return; }
    if (pt.h >= (V4 ? 213 : 214) && (!V4 || v > 181 + 35)) { LOW301.bTop += v < (V4 ? (181 + 35 + FT) / 2 : (181 + FT) / 2) ? -1 : 1; a.renderPanel(); return; }
    if (pt.h < BL) return;
    if (v < 181) { if (pt.h >= x0 && a.flipBarScale) a.flipBarScale(); return; }
    const e = V4 ? (v < 181 + 28 ? slots[Math.floor((v - 181) / 14)] : v >= 181 + 35 ? slots[2 + LOW301.bTop + Math.floor((v - 181 - 35) / 14)] : null) : slots[LOW301.bTop + Math.floor((v - 181) / 14)]; if (!e) return;
    if (pt.h < x0 - 1) { if (e.star != null) { a.UI.sel = e.star; if (a.centerOn) a.centerOn(e.star); a.renderPanel(); a.draw(); } return; }
    ev.preventDefault();
    const lk = rs.barLocked ? rs.barLocked(g, p, e.key) : null; if (lk) { a.beep(); return; }
    const start = JSON.stringify(p.budget);
    const set = (e2) => { const h = q.at(e2).h, f = Math.max(0, Math.min(1, (h - x0) / 77)), pm = log ? sc.toValue(f) : Math.round(f * 1000);
      if (rs.dragShare) { const b = p.budget, o = JSON.parse(start); b.tech = o.tech; b.savings = o.savings; b.col = o.col; const r = rs.dragShare(g, p, e.key, Math.max(0, Math.min(1000, Math.round(pm)))); if (r) { if (r.tech != null) b.tech = r.tech / 1000; if (r.savings != null) b.savings = r.savings / 1000; for (const k in r.col || {}) b.col[k] = r.col[k] / 1000; } }
      else e.set(pm / 1000);
      const c = lowBox301(B); box.replaceWith(c); };
    // (a move redraws the whole pane: at most once a frame, the last position, so a drag keeps up with the pointer, Jake's report, Firefox, 18 Nov)
    let pend = null, raf = 0;
    const later = (e2) => { pend = e2; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (pend) { const e3 = pend; pend = null; set(e3); } }); };
    const up = (e2) => { window.removeEventListener('pointermove', later); window.removeEventListener('pointerup', up); if (raf) { cancelAnimationFrame(raf); raf = 0; } pend = null; set(e2); a.save(); a.renderPanel(); };
    window.addEventListener('pointermove', later); window.addEventListener('pointerup', up); set(ev);
  });
  q.c.addEventListener('wheel', (ev) => { ev.preventDefault(); const pt = q.at(ev); if (pt.h < BL) LOW301.pTop += ev.deltaY > 0 ? 1 : -1; else LOW301.bTop += ev.deltaY > 0 ? 1 : -1; a.renderPanel(); }, { passive: false });
  const box = a.el('section', { class: 'box low301' }, q.c);
  return box;
}
// The Report Window (CreateReportWin, the same code as 2.0.1's: 250 x 96 under the map window; UpdateReportWin @1603aa: a row every 32 pixels from
// its scroll bar's value; DrawMessage @160620: the row erased, the report's sentence wrapped from (35, 1) (MyTextBox), its icon (GetIconID: the
// skin's messageLook) 32 x 32 at the row's left, then DrawSpecial @160732 over it: for the chat reports (STR# 1000.35-62: "%.*s says, ...", "You told
// %.*s ...") and the alliance ones (.78-.83) the player's face (2000 + face, +500 a woman) 16 x 16 in the icon's middle; for the two eliminations
// (.66, .67) a cross 2 x 2 from corner to corner; none for the others. ClickInReportWindow: as 2.0.1's (the click handler above).
let RE301 = null;
function special301(t) {
  const g = G(), L = STR301(1000);
  if (!RE301 || RE301.L !== L) {
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    RE301 = L.map((x, i) => ({ i, re: new RegExp('^' + String(x).split(/(%(?:\.\*|\d*\.?\d*)?[sdP]|%%)/).map((y, j) => j % 2 ? (y === '%%' ? '%' : '(.*?)') : esc(y)).join('') + '$'), len: String(x).length }))
      .filter(o => (o.i >= 34 && o.i <= 82)).sort((a2, b) => b.len - a2.len);
    RE301.L = L;
  }
  const hit = RE301.find(o => o.re.test(t)); if (!hit) return null;
  const k = 1000 + hit.i;
  if (k === 1065 || k === 1066) return 'cross';
  if ((k >= 1034 && k <= 1061) || (k >= 1077 && k <= 1082)) {
    const caps = hit.re.exec(t).slice(1), pl = g.players.find(p0 => caps.includes(p0.name));
    if (pl) return 'dos:s' + ((pl.id === A().ME ? (V4 ? 1406 : 1000) : 2000 + (pl.face || 0)) + (pl.female ? 500 : 0));
  }
  return null;
}
function reportsBox301() {
  const box = reportsBox12();
  const g = G(), list = box.querySelector('ul');
  list.querySelectorAll('li').forEach((li) => {
    const t = (li.querySelector('.rt') || {}).textContent || '', sp = special301(t), ic = li.querySelector('img');
    if (!sp || !ic) return;
    const wrap = A().el('span', { class: 'ric301' }); ic.replaceWith(wrap); wrap.append(ic);
    if (sp === 'cross') wrap.append(A().el('span', { class: 'x301' }));
    else { const im = A().IMG[sp]; if (im && im.src) wrap.append(A().el('img', { class: 'sp301', src: im.src, alt: '' })); }
  });
  return box;
}
function panel301(panel, B) {
  const a = A(), el = a.el;
  const low = lowBox301(B || {});
  { const de = document.documentElement, on = !NARROW301.matches && !!document.getElementById('main'); de.classList.toggle('mac301lay', on); de.classList.toggle('mac75', on); } // (before the boxes: the Report Window's scroll bar follows html.mac75)
  const rep = reportsBox301();
  panel.innerHTML = '';
  const tech = techBox301();
  // (a page wide enough for the panel beside the map: Tech Spending and the Report Window in #main's bottom row, as the original's screen; js/skins/mac12/panel.css)
  const main = document.getElementById('main'), wide = !NARROW301.matches;
  let t3 = document.getElementById('tech301'), r3 = document.getElementById('rep301');
  document.documentElement.classList.toggle('mac301lay', wide && !!main);
  if (wide && main) {
    if (!t3) { t3 = el('div', { id: 'tech301', class: 'p301x' }); r3 = el('div', { id: 'rep301', class: 'p301x' }); main.append(t3, r3); }
    t3.replaceChildren(tech); r3.replaceChildren(rep);
    panel.append(planetBox301(), fleetBox301(), incomeBox301(), low);
  } else {
    if (t3) t3.remove(); if (r3) r3.remove();
    panel.append(planetBox301(), fleetBox301(), incomeBox301(), low, tech, rep);
  }  frame75();
}
// ---------- the System 7.5 screen (html.mac75; js/skins/mac12/panel.css): 3.0.1's and 4.0.5's windows as Jake's shots show them ----------
// The map window's title bar and the windoids' (Tech Spending, Report Window) are System 7.5's window definition, read pixel by pixel in Jake's
// 4.0.5 shot 008 (3.0.1's shot 012 the same): colour, interior rows of the title bar: a #ccccff row, #eeeeee with a #ccccff left column and a
// #9999cc right one, #777777 stripes on rows 3-13 (every other row) but for the close box (11 x 11 from the interior's x 8), the zoom box (11 x 11
// ending 8 from the right) and the title (Chicago 12, centred in the window, stripes stopped 6 pixels each side); a #9999cc foot row. A windoid's
// 9 rows: #9999cc, then #eeeeee / #888888 stripes, a 7 x 7 close box (black frame, white) at x 7, #9999cc. Black and white (no capture of 4.0.5
// in black and white): the same shapes in black on white.
const TB75 = { title: '', obs: null, on: null };
function tbBox75(x, cx0, l, t, zoom) { // the close and zoom boxes' colours: dark top-left frame, light inner top-left, grey face, dark inner bottom-right
  const R = (h, v, w, hh, c) => { x.fillStyle = c; x.fillRect(l + h, t + v, w, hh); };
  if (!COLOUR3) { R(0, 0, 11, 11, '#000'); R(1, 1, 9, 9, '#fff'); if (zoom) { R(1, 1, 6, 6, '#000'); R(1, 1, 5, 5, '#fff'); } return; }
  R(0, 0, 11, 11, '#ccccff'); R(0, 0, 11, 1, '#333366'); R(0, 0, 1, 11, '#333366'); R(2, 2, 7, 7, '#aaaaaa'); R(9, 2, 1, 8, '#333366'); R(2, 9, 8, 1, '#333366');
  if (zoom) { R(6, 2, 1, 5, '#333366'); R(2, 6, 5, 1, '#333366'); }
}
function drawTb75(cv, W, title) {
  const K = QK(); if (cv.width !== W * K || cv.height !== 17 * K) { cv.width = W * K; cv.height = 17 * K; }
  const x = cv.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0); x.imageSmoothingEnabled = false;
  const C = COLOUR3, R = (h, v, w, hh, c) => { x.fillStyle = c; x.fillRect(h, v, w, hh); };
  R(0, 0, W, 17, C ? '#eeeeee' : '#fff'); if (C) { R(0, 0, W, 1, '#ccccff'); R(0, 0, 1, 16, '#ccccff'); R(W - 1, 0, 1, 17, '#9999cc'); R(0, 16, W, 1, '#9999cc'); }
  x.font = SYS; const tw = title ? Math.ceil(x.measureText(title).width) : 0, tx = Math.floor((W + 2 - tw) / 2) - 1; // (centred in the window, its frame counted)
  const gaps = [[7, 20], [W - 20, W - 7]]; if (tw) gaps.push([tx - 6, tx + tw + 6]);
  for (let v = 3; v <= 13; v += 2) { let h = 1; gaps.slice().sort((a2, b) => a2[0] - b[0]).forEach(([g0, g1]) => { if (g0 > h) R(h, v, g0 - h, 1, C ? '#777777' : '#000'); h = Math.max(h, g1); }); if (W - 1 > h) R(h, v, W - 1 - h, 1, C ? '#777777' : '#000'); }
  tbBox75(x, 0, 8, 3, false); tbBox75(x, 0, W - 19, 3, true);
  if (tw) { x.fillStyle = '#000'; x.textBaseline = 'alphabetic'; x.fillText(title, tx, 13); }
}
function drawWd75(cv, W) {
  const K = QK(); if (cv.width !== W * K || cv.height !== 9 * K) { cv.width = W * K; cv.height = 9 * K; }
  const x = cv.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0);
  const C = COLOUR3, R = (h, v, w, hh, c) => { x.fillStyle = c; x.fillRect(h, v, w, hh); };
  R(0, 0, W, 9, C ? '#eeeeee' : '#fff');
  if (C) { R(0, 0, W, 1, '#9999cc'); R(0, 8, W, 1, '#9999cc'); }
  for (let v = 2; v <= 6; v += 2) { R(0, v, 6, 1, C ? '#888888' : '#000'); R(15, v, W - 15, 1, C ? '#888888' : '#000'); }
  R(7, 1, 7, 7, '#000'); R(8, 2, 5, 5, '#fff');
}
function frame75() {
  const de = document.documentElement, on = V3 && de.classList.contains('mac301lay');
  de.classList.toggle('mac75', on); de.classList.toggle('mac405', V4);
  // (the frame changes the map's box: the first view, fitted before it, is fitted again once it is in place, so a home star near the foot
  // isn't left under the windows there: real-play's 4k select-colony failures, 19-20 Nov)
  if (TB75.on !== on) { TB75.on = on; requestAnimationFrame(() => { const a = A(); if (a && a.G) { a.UI.fitted = false; a.resize(); a.renderPanel(); } }); }
  const main = document.getElementById('main'); let mw = document.getElementById('mapwin301');
  if (!on) { if (mw) mw.remove(); const ck = document.getElementById('clock405'); if (ck) ck.remove(); return; }
  if (!mw) { mw = A().el('div', { id: 'mapwin301', 'aria-hidden': 'true' }, A().el('canvas', { class: 'tb75' })); main.prepend(mw); }
  const t = document.getElementById('title');
  if (t && !TB75.obs) { TB75.obs = new MutationObserver(() => frame75()); TB75.obs.observe(t, { childList: true, characterData: true, subtree: true }); }
  const S = MACS.s || 1, W = Math.round(mw.clientWidth / S);
  if (W > 0) drawTb75(mw.firstChild, W, t ? t.textContent : '');
  ['tech301', 'rep301'].forEach((id) => {
    const w = document.getElementById(id); if (!w) return;
    let c = w.querySelector(':scope > canvas.wd75'); if (!c) { c = A().el('canvas', { class: 'wd75', 'aria-hidden': 'true' }); w.prepend(c); }
    drawWd75(c, id === 'tech301' ? 225 : 250);
  });
  const cn = document.querySelector('#mapwrap .mapcorner12');
  if (cn && BAR75() && !cn.querySelector('canvas')) { const c = A().el('canvas', { width: 64, height: 64, 'aria-hidden': 'true' }); const x = c.getContext('2d'); x.setTransform(4, 0, 0, 4, 0, 0); drawGrow75(x); cn.append(c); }
  if (V4) clock405();
}
// 4.0.5's clock (DrawTimeClock @115af2; EndTurnButtonShowing @111944: shown whenever the turn is open, reports read or not): PICT 5500, the time
// the turn has taken (no time limit: hours and minutes, "%d:%02d") in its black window, green (0, 187, 0) in Geneva 9, and a seconds hand 23
// pixels long from (28, 30), two pixels wide, orange (255, 153, 0), turning 6 degrees a second (shots 008, 031: "0:00" and "0:02").
// A click on it ends the turn (ClickInMapWindow). Pressed: PICT 5501. In black and white (no capture): the hand black, the time white.
const CK405 = { turn: null, t0: 0, last: '' };
function clock405() {
  const a = A(), g = G(), wrap = document.getElementById('mapwrap'); if (!wrap) return;
  let b = document.getElementById('clock405');
  const open = !!(g && !g.over && !document.querySelector('#msg .waiting') && document.documentElement.classList.contains('mac75'));
  if (!open) { if (b) b.hidden = true; return; }
  if (!b) {
    b = a.el('button', { id: 'clock405', type: 'button', 'aria-label': 'End turn', 'aria-keyshortcuts': 'T', 'data-help': 'endTurn' }, a.el('canvas', { width: 60 * 4, height: 61 * 4 }));
    b.addEventListener('click', () => { const c = document.querySelector('#msg .clock'); if (c) c.click(); else a.doEndTurn(); });
    b.addEventListener('pointerdown', () => { b.dataset.down = '1'; CK405.last = ''; clock405(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => { delete b.dataset.down; CK405.last = ''; clock405(); }));
    wrap.append(b);
  }
  b.hidden = false;
  if (CK405.turn !== g.turn) { CK405.turn = g.turn; CK405.t0 = Date.now(); }
  const secs = Math.floor((Date.now() - CK405.t0) / 1000), txt = Math.floor(secs / 3600) + ':' + String(Math.floor(secs / 60) % 60).padStart(2, '0'), ang = (secs % 60) * 6;
  const key = txt + '|' + ang + '|' + (b.dataset.down || ''); if (key === CK405.last) return; CK405.last = key;
  const cv = b.firstChild, x = cv.getContext('2d'); x.setTransform(4, 0, 0, 4, 0, 0); x.clearRect(0, 0, 60, 61); x.imageSmoothingEnabled = false;
  const im = a.IMG[b.dataset.down ? 'dos:p5501' : 'dos:p5500'] || a.IMG['dos:p5500']; if (im && im.complete) x.drawImage(im, 0, 0);
  x.font = G9; x.fillStyle = COLOUR3 ? 'rgb(0,187,0)' : '#fff'; const w = Math.ceil(x.measureText(txt).width); x.fillText(txt, Math.floor(29.5 - w / 2), 43);
  const r = ang * Math.PI / 180, ex = 28 + Math.trunc(Math.sin(r) * 23), ey = 30 - Math.trunc(Math.cos(r) * 23);
  x.fillStyle = COLOUR3 ? 'rgb(255,153,0)' : '#000'; // (QuickDraw's Line with a 2 x 2 pen: every point of the line, the pen's square to its right and below)
  const n = Math.max(Math.abs(ex - 28), Math.abs(ey - 30)); for (let i = 0; i <= n; i++) { const px = Math.round(28 + (ex - 28) * i / n), py = Math.round(30 + (ey - 30) * i / n); x.fillRect(px, py, 2, 2); }
}
if (V4) setInterval(() => { if (document.getElementById('clock405') || (G() && document.documentElement.classList.contains('mac75'))) clock405(); }, 250);
window.addEventListener('resize', () => { if (V3 && G()) { frame75(); if (document.documentElement.classList.contains('mac75')) A().renderPanel(); } }); // (the players and budget pane follows the window's height)
const NARROW301 = window.matchMedia('(max-width: 760px)');
NARROW301.addEventListener('change', () => { if (window.HOMAC301 && A() && A().G) { A().renderPanel(); A().resize(); } });

// ---------- the battle window (DoOneBattle @d07d0, DLOG 7010: 445 x 310, black; drawn at twice the size) ----------
// Everything here is read in the decompile (docs/display/12.json rows DoOneBattle, DrawAllGroups, DrawOneGroup, HaveGroupShoot,
// DrawLaserBlast, DrawExplosion, DrawX, CalcBattleStars, DrawBattleStars, DrawShipPicture): the black-and-white program's drawing.
// The window (DLOG 7010, the black-and-white one; 7011, the colour one, is 300 high and black by its dctb) is white on black
// (ForeColor 30, BackColor 33, the content erased; DrawBattleStars' 35 white points at random, h 10-435, v 35-290);
// "Résumé de la bataille" (STR# 1030.3) at (155, 13) and "à %s en %d:" at (155, 29) in the system font; each side's face
// (ICN#: yours 1000, +500 for a woman; another's 2000 + face, +500) at (x, 2), 32 x 32, its player's name at (x + 35, 24); x is
// 25 for the viewer's side and 300 for the other. A side's groups (CalculateGroups: at most five, a design cut into groups of
// the same size; the colony's first) in one column, group k's 120 x 40 picture at (x, 53k + 35) (DrawShipPicture, small: the
// 40 x 40 parts PICT 2600 + Range + Speed - 8, 2699 + Shields (2750 a colony ship's), 2850 + Weapons; a satellite's 2900 +
// Weapons between two black squares, the colony's 2757; never mirrored in black and white), its words in Geneva 9 centred
// under it (baseline 53k + 85; condensed when wider than 120 in the system font), its damage as a qd.gray PaintRect in patOr.
// "Round %d" at (194, 256) each round. A shot (HaveGroupShoot @d1746 with "full animation", Stup +0x48, on: every shot; off:
// a group's last shot of its turn, and a group wiped out): DrawLaserBlast, a bolt a fifth of the way long that moves from the
// shooter's facing edge to the target's in five steps of a tick (Stup +0x52 = 1), five white lines one pixel apart, the last
// step erased in black; its sound; the target redrawn; DrawExplosion: a hit puts ics# 12000 + (damage mod 3) 17 x 17 at
// (damage mod 103, damage mod 23) in the target's cell, a colony wiped out (snd 3003) gray ovals growing from the cell's
// centre (inset s across and s/3 down, s from 59 to 1, two a tick) then erased in black the other way. Each shot waits for
// the battle speed (Stup +0x4e, ticks a shot). At the end a cross (pen 2) over the face of a side with nothing left, STR#
// 1030.6-7 or .8-9 at (155, 135) and (155, 150) with PICT 3500 (won) or 3510 at (180, 175, 254, 239), and the button
// (DITL 7010: "Passe" at 193, 273, 58 x 20, which skips to the end) says "Bien". A viewer who lost a battle of one round sees
// nothing of the other side (DrawAllGroups: STR# 1030.11 and .12 at (155, 85) and (155, 100)) and no shots.
// (the battle window's text in the Mac's own bitmap Chicago 12 and Geneva 9, as the panes: Jake's battle captures; they were the browser's Chicago / Geneva)
const SYS = "15px 'DOS Chicago 12', Chicago, Charcoal, Geneva, sans-serif", GEN9 = "12px 'DOS Geneva 9', Geneva, Verdana, sans-serif";
// (3.0.1's battle window in the skins' bitmap Chicago 12 and Geneva 9, the sizes the dialogs use: js/skins/dos/style.css's faces)
const SYS3 = SYS, GEN93 = GEN9;
function battleWindow(b, k) {
  const a = A(), g = G(), rs = H().rules(g), el = a.el, IMG = a.IMG, ME = a.ME;
  const fr = lang() === 'fr', W = 445, Hh = 310, S = 2, TICK = 1000 / 60;
  const pic = (n) => { const im = IMG['dos:' + n]; return im && im.complete && im.naturalWidth ? im : null; };
  // (the pace: 2.0.1's 30 ticks a shot; 3.0.1's 'Stup' 1000 has long +0x50 = 10 ticks, which HaveGroupShoot adds to the deadline after each
  // drawn shot and again for each ship or planet destroyed)
  const VB = k.verBattle(), speed = Math.max(1, Math.round((V3 ? 10 : 30) * VB.f));
  // the state as the shots go
  const alive = b.start.map(() => true), hurt = []; let seq = 0, pop = b.pop0;
  const st = () => ({ alive, hurt, pop, over: false, won: false });
  const P0 = (rs.battlePanel || RS12().battlePanel)(rs.battlePanel ? g : langView(g), b, st(), ME);
  const leftSide = P0.leftSide, rightSide = b.sides.find(o => o !== leftSide);
  // the final result (a dry run of the record)
  const fAlive = b.start.map(() => true); let fPop = b.pop0;
  for (const r of b.rounds) for (const ev of r) if (ev.k && !ev.p) fAlive[ev.ti] = false;
  if (b.popR && b.popR.length) fPop = b.popR[b.popR.length - 1];
  const viewer = b.sides.includes(ME) ? ME : b.sides[0];
  const foe = (o) => o !== viewer && !H().isAllied(g, o, viewer);
  const liveF = (pred) => b.start.some((u, i) => fAlive[i] && pred(u.o));
  const won = (liveF(o => !foe(o)) || (b.planetOwner >= 0 && !foe(b.planetOwner) && fPop > 0.0005)) && !liveF(foe) && !(b.planetOwner >= 0 && foe(b.planetOwner) && fPop > 0.0005);
  // the groups, each column's (the record's grp: the fight's own groups; an old record: one a design)
  let sides;
  if (b.grp) sides = b.grp.map(L => L.map(x => (x === -1 ? { planet: true, units: [] } : { units: x })));
  else sides = [[], []], P0.cols.forEach((c, ci) => c.forEach(r => sides[ci].push({ planet: r.planet, units: r.units })));
  const ownerOf = (L) => { const s = L.find(x => !x.planet && x.units.length); return s ? b.start[s.units[0]].o : b.planetOwner; };
  if (b.grp && ownerOf(sides[0]) !== leftSide && ownerOf(sides[1]) === leftSide) sides.reverse();
  const cols = sides.map((L, ci) => L.slice().sort((p, q) => (q.planet ? 1 : 0) - (p.planet ? 1 : 0)).map((x, row) => Object.assign(x, { o: x.planet ? b.planetOwner : b.start[x.units[0]] ? b.start[x.units[0]].o : -1, ci, row })));
  const colX = [25, 300], owners = [leftSide, rightSide];
  const where = new Map(), planetAt = {};
  cols.forEach(L => L.forEach(x => { x.units.forEach(i => where.set(i, x)); if (x.planet) planetAt[x.o] = x; }));
  // a viewer who lost a battle of one round sees nothing of the other side (DrawAllGroups)
  const hidden = [0, 1].map(ci => !won && b.rounds.length === 1 && owners[ci] !== ME && !(owners[ci] != null && H().isAllied(g, owners[ci], ME)));
  // the canvas, twice the size
  const c = el('canvas', { class: 'bw12', width: W * S, height: Hh * S, 'aria-label': 'Summary of battle' });
  const x = c.getContext('2d'); x.setTransform(S, 0, 0, S, 0, 0); x.imageSmoothingEnabled = false;
  const btn = el('button', { class: 'bw12b', onclick: () => { if (done) a.closeModal(); else skip = true; } });
  const setBtn = (t) => { btn.textContent = ''; btn.append(document.createTextNode(t)); btn.setAttribute('translate', 'no'); };
  setBtn(fr ? 'Passe' : 'Skip');
  const box = el('div', { class: 'bw12w' }, c, btn);
  let stop = false, skip = false, done = false;
  a.modal('', box, { cls: 'bw12m', label: 'Summary of battle', onClose: () => { stop = true; } });
  // QuickDraw's qd.gray in patOr with black: every other pixel black
  const grayPat = (() => { const p = document.createElement('canvas'); p.width = 2; p.height = 2; const q = p.getContext('2d'); q.fillStyle = '#000'; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); return x.createPattern(p, 'repeat'); })();
  const whiteGray = (() => { const p = document.createElement('canvas'); p.width = 2; p.height = 2; const q = p.getContext('2d'); q.fillStyle = '#fff'; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); return x.createPattern(p, 'repeat'); })();
  const text = (t, h, v, font, cond) => { x.font = (V3 && font !== GEN9 ? SYS3 : V3 ? GEN93 : null) || font || SYS; x.letterSpacing = cond ? '-1px' : '0px'; x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(t, h, v); x.letterSpacing = '0px'; };
  // DrawBattleStars: 35 points (CalcBattleStars, the record's seed: one field a battle)
  let seed = (b.id | 0) * 7919 + 13;
  const rnd = (lo, hi) => { seed = (seed * 16807) % 2147483647; return lo + (seed % (hi - lo + 1)); };
  const stars = Array.from({ length: 35 }, () => [rnd(10, 435), rnd(35, 290)]);
  const drawStars = () => { x.fillStyle = '#fff'; for (const [h, v] of stars) x.fillRect(h, v, 1, 1); };
  const face = (o, ci) => {
    const p = g.players[o]; if (!p) return;
    const id = o === ME ? (p.female ? 1500 : 1000) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20);
    const im = pic('i' + id); if (im) x.drawImage(im, colX[ci], 2, 32, 32);
    // (3.0.1's DoOneBattle @e0aee: the side's luck, ICN# 3141 + luck (3140 bad, 3142 good, none for 0), 32 to the right of the face, and the
    // name at +67; 1.2 and 2.0.1 have no luck and the name at +35)
    if (V3) { const L = b.lk ? b.lk[b.sides.indexOf(o)] : 0, li = L ? pic('i' + (3141 + L)) : null; if (li) x.drawImage(li, colX[ci] + 32, 2, 32, 32); }
    text(p.name || '', colX[ci] + (V3 ? 67 : 35), 24);
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const tile = (gr, gx, gy) => { // DrawShipPicture, small, black and white
    const parts = [];
    if (gr.planet) parts.push(null, 'p2757', null);
    else {
      const d = H().getDesign(g, gr.o, b.start[gr.units[0]].did) || { type: b.start[gr.units[0]].t, R: 1, V: 1, W: 1, S: 1 };
      if (d.type === 'satellite') parts.push(null, 'p' + (2901 + clamp(d.W - 1, 0, 25)), null);
      else if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R >= 9 && d.R <= 11) parts.push('p2751', 'p2752', 'p2753');
      else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R >= 12 && d.R <= 14) parts.push('p2754', 'p2755', 'p2756');
      else parts.push('p' + (2600 + clamp(d.R + d.V - 8, 0, 23)), 'p' + (d.type === 'colony' ? 2750 : 2699 + clamp(d.S - 1, 0, 25)), 'p' + (2850 + clamp(d.W - 1, 0, 29)));
    }
    parts.forEach((n, i) => { const im = n && pic(n); if (im) x.drawImage(im, gx + 40 * i, gy, 40, 40); else { x.fillStyle = n ? '#fff' : '#000'; x.fillRect(gx + 40 * i, gy, 40, 40); } });
  };
  const groupWords = (gr) => {
    if (gr.planet) return P0.planetWords(pop);
    const u = b.start[gr.units[0]], d = H().getDesign(g, u.o, u.did) || { type: u.t, name: '', W: 1, S: 1 };
    const n = gr.units.filter(i => alive[i]).length;
    return P0.shipWords(d, n, gr.units.length, u.o === ME);
  };
  const drawGroup = (gr, keepPic) => { // DrawOneGroup @d214e (keepPic: 3.0.1's DrawOneGroup @e274e called with its picture flag 0, as
    // HaveGroupShoot does after a hit: the words and the damage again, the picture and the bursts on it left as they are)
    const gx = colX[gr.ci], gy = 53 * gr.row + 35;
    if (!keepPic) tile(gr, gx, gy);
    x.fillStyle = '#000'; x.fillRect(gx - 20, gy + 40, 160, 13);
    const t = groupWords(gr);
    x.font = V3 ? SYS3 : SYS; const cond = x.measureText(t).width > 120;
    x.font = V3 ? GEN93 : GEN9; x.letterSpacing = cond ? '-1px' : '0px';
    const w = x.measureText(t).width; text(t, gx + 60 - Math.trunc(w / 2), gy + 50, GEN9, cond);
    if (!gr.planet) { // the shading: the whole cell when gone, else the front ship's damage from the left (a satellite: a third, from 40)
      const n = gr.units.filter(i => alive[i]).length;
      let f = 0, q = -1; for (const i of gr.units) { const h = hurt[i]; if (h && h.n > q && alive[i]) { q = h.n; f = h.f; } }
      const u = b.start[gr.units[0]], sat = u && u.t === 'satellite';
      let l = gx, r = gx + 120;
      if (n > 0) { const dw = Math.trunc(120 * clamp(f, 0, 1)); if (sat) { l = gx + 40; r = Math.min(gx + 80, l + Math.trunc(dw / 3)); } else r = Math.min(gx + 120, gx + dw); }
      if (r > l) { x.fillStyle = grayPat; x.fillRect(l, gy, r - l, 40); }
    }
    drawStars();
  };
  const roundLabel = (n) => { x.fillStyle = '#000'; x.fillRect(194, 240, 101, 16); text(fill('Round %d', n), 194, 256); };
  // the first picture
  x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh);
  drawStars();
  P0.head.forEach((t, i) => text(t, 155, i ? 29 : 13));
  [0, 1].forEach(ci => { if (owners[ci] != null) face(owners[ci], ci); });
  [0, 1].forEach(ci => {
    if (hidden[ci]) { const L = rs.battleLines || {}; text(L.noInfo || '', 155, 85); text(L.destroyed || '', 155, 100); skip = true; }
    else cols[ci].forEach(gr => drawGroup(gr));
  });
  // a shot
  const wait = (until) => new Promise(res => { const f = () => (stop || skip || performance.now() >= until ? res() : setTimeout(f, Math.min(TICK, until - performance.now()))); f(); });
  const cellOf = (ev, shooter) => shooter ? (ev.si >= 0 ? where.get(ev.si) : planetAt[ev.a]) : (ev.p ? planetAt[b.planetOwner] : where.get(ev.ti));
  // Colour (DAT_00efff1e >= 4: the colour skin, Mac 2.0.1's colour window): the bolt's centre line is HSV hue (weapons - 1) x 4000 mod $ffff, full
  // saturation and value; the pair beside it hue + 7500, value $afc8; the outer pair hue + 15000, value $61a8 (DrawLaserBlast @d3e20 through Pack12's
  // HSV2RGB; in the captures, Sue's Sword (3/3) fighters' bolt is yellow-orange over olive and green, Jake's Conan (5/5) lime over green and teal)
  // (3.0.1's DrawLaserBlast is the same size as 2.0.1's, 764 bytes, and its colour bolt the same in the captures: the colour skin's too)
  const COL = (!!window.HOMAC2_COLOUR && V2) || (COLOUR3 && V3);
  const hsv = (h, v) => { h = (h % 65535) / 65535 * 6; const i = Math.floor(h), f = h - i, q = v * (1 - f), t = v * f; const [r, gg, bb] = [[v, t, 0], [q, v, 0], [0, v, t], [0, q, v], [t, 0, v], [v, 0, q]][i % 6]; return 'rgb(' + [r, gg, bb].map(u => Math.round(u * 255)).join(',') + ')'; };
  // (the hue's value is word 2 of the shooting group's record, DrawLaserBlast's first argument at all three of HaveGroupShoot's calls. A ship group's is its design's weapons (CalcOneGroup); the planet's group gets
  // param_7 = *(short *)(battle + 0xac), which DoBattleStage @d0004 sets to the star owner's weapons tech / 100 (player + 0x30: SpendTechMoney's tech array at +0x2c is range, speed, weapons, shields, mini): the owner's weapons level)
  const weaponsOf = (gr) => { if (gr.planet) { const pl = g.players[gr.o]; return (pl && pl.tech && (pl.tech.weapons || pl.tech.W)) || 1; } const u = b.start[gr.units[0]], d = H().getDesign(g, u.o, u.did); return d && d.W ? d.W : 1; };
  async function laser(s, t) { // DrawLaserBlast @d3dea
    let x1 = colX[s.ci], y1 = 53 * s.row + 55, x2 = colX[t.ci], y2 = 53 * t.row + 55;
    if (x2 > x1) { x1 += 121; x2 -= 1; } else { x2 += 121; x1 -= 1; }
    const dx = Math.trunc((x2 - x1) / 5), dy = Math.trunc((y2 - y1) / 5);
    const h0 = ((weaponsOf(s) - 1) * 4000) % 65535, cols3 = COL ? [hsv(h0, 1), hsv(h0 + 7500, 45000 / 65535), hsv(h0 + 15000, 25000 / 65535)] : ['#fff', '#fff', '#fff'];
    const snap = document.createElement('canvas'); snap.width = c.width; snap.height = c.height; snap.getContext('2d').drawImage(c, 0, 0); // (what the bolt is drawn over, put back where it was: the original paints its last step black)
    const back = () => { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(snap, 0, 0); x.restore(); };
    // (the lines are drawn at the pixel centres of the 2 x canvas, so a step's pixels are whole)
    const seg = (h0_, v0, h1, v1) => { x.lineWidth = 1; for (const [o, ci] of [[0, 0], [1, 1], [-1, 1], [2, 2], [-2, 2]]) { x.strokeStyle = cols3[ci]; x.beginPath(); x.moveTo(h0_ + 0.25, v0 + o + 0.25); x.lineTo(h1 + 0.25, v1 + o + 0.25); x.stroke(); } };
    let h = x1, v = y1;
    for (let i = 0; i < 5 && !stop && !skip; i++) {
      const t0 = performance.now();
      back(); seg(h, v, h + dx, v + dy);
      h += dx; v += dy;
      await wait(t0 + TICK);
    }
    back();
  }
  async function explosion(t, ev, until) { // DrawExplosion @d40f8
    const l = colX[t.ci], tp = 53 * t.row + 35, dm = ev.dm | 0;
    if (ev.snd !== 3003) { const im = pic('s' + (12000 + (dm % 3))); if (im) x.drawImage(im, l + (dm % 103), tp + (dm % 23), 17, 17); return; }
    if (!VB.full) return; // (in colour each oval is HSV hue (59 - s) x 175, full saturation and value: red at the middle to yellow at the rim, as captured)
    const oval = (s, style, lw) => { const r = { l: l + s, r: l + 120 - s, t: tp + Math.trunc(40 * s / 120), b: tp + 40 - Math.trunc(40 * s / 120) }; if (r.r <= r.l || r.b <= r.t) return; x.strokeStyle = style; x.lineWidth = lw || 1; x.beginPath(); x.ellipse((r.l + r.r) / 2, (r.t + r.b) / 2, (r.r - r.l - 1) / 2, (r.b - r.t - 1) / 2, 0, 0, Math.PI * 2); x.stroke(); };
    for (let s = 59; s > 0 && !stop && !skip; s--) { oval(s, COL ? hsv((59 - s) * 175, 1) : whiteGray); if (s % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
    for (let s = 1; s < 60 && !stop && !skip; s++) { oval(s, '#000', 2); if (s % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
  }
  const apply = (ev) => {
    if (ev.p) { if (ev.php != null) pop = ev.php / 1000; }
    else { if (ev.f != null) hurt[ev.ti] = { n: ++seq, f: ev.f }; if (ev.k) alive[ev.ti] = false; }
  };
  const finish = () => {
    if (stop) return;
    for (const r of b.rounds) for (const ev of r) apply(ev); // (skipped: every shot counted)
    pop = fPop;
    done = true;
    [0, 1].forEach(ci => { if (!hidden[ci]) cols[ci].forEach(gr => drawGroup(gr)); });
    // DrawX over a side with nothing left
    [0, 1].forEach(ci => {
      const o = owners[ci]; if (o == null) return;
      const left = b.start.some((u, i) => alive[i] && u.o === o) || (b.planetOwner === o && pop > 0.0005);
      if (!left) { const h = colX[ci]; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(h + 1, 3); x.lineTo(h + 33, 35); x.moveTo(h + 1, 35); x.lineTo(h + 33, 3); x.stroke(); }
    });
    const P = (rs.battlePanel || RS12().battlePanel)(rs.battlePanel ? g : langView(g), b, { alive, hurt, pop, over: true, won }, ME);
    (P.end || []).forEach((t, i) => text(t, 155, i ? 150 : 135));
    const im = pic(won ? 'p3500' : 'p3510'); if (im) x.drawImage(im, 180, 175, 74, 64);
    setBtn(fr ? 'Bien' : 'OK'); btn.classList.add('done');
  };
  (async () => {
    let deadline = performance.now() + speed * TICK;
    for (let r = 0; r < b.rounds.length && !stop && !skip; r++) {
      roundLabel(r + 1);
      const R = b.rounds[r];
      for (let e = 0; e < R.length && !stop && !skip;) {
        // full animation: every shot; else a group's last shot of its turn (and a colony wiped out), the others counted
        let n = 1;
        if (!VB.full) while (R[e + n] && R[e + n].si === R[e].si && R[e + n].a === R[e].a && !R[e + n - 1].k) n++;
        for (let j = 0; j < n - 1; j++) apply(R[e + j]);
        const ev = R[e + n - 1], s = cellOf(ev, true), t = cellOf(ev, false);
        if (ev.q) apply(ev); // (3.0.1: a ship killed between the drawn shots, counted, not drawn: rules-301 shoot)
        else if (s && t && !hidden[t.ci] && !hidden[s.ci]) {
          await laser(s, t);
          if (stop || skip) break;
          a.Sound.play(k.shotSnd(ev, 3000));
          apply(ev);
          const kill = V3 && ev.snd === 3003;
          drawGroup(t, V3);
          if (kill && VB.full) deadline += speed * TICK; // (HaveGroupShoot: the time again for a ship or the planet destroyed)
          deadline += speed * TICK;
          await explosion(t, ev, deadline);
          await wait(deadline);
          if (kill && VB.full && !stop && !skip) drawGroup(t); // (then the whole group again: the ovals and bursts gone)
        } else apply(ev);
        e += n;
      }
      if (b.popR && b.popR[r] != null) pop = b.popR[r];
    }
    finish();
  })();
}

// (ClickInReportWindow @1304f8: the report clicked is inverted while the button is down and at least 5 ticks, then acted on)
document.addEventListener('click', (ev) => {
  const li = ev.target && ev.target.closest && ev.target.closest('ul.reports li');
  if (!li || li.dataset.inv12 === 'go' || !G() || !own()) return; // (3.0.1's ClickInReportWindow @16049c does the same: InvertRect, 5 ticks, then the action)
  ev.stopImmediatePropagation(); ev.preventDefault();
  li.classList.add('inv12');
  setTimeout(() => { li.classList.remove('inv12'); li.dataset.inv12 = 'go'; li.click(); delete li.dataset.inv12; }, 5000 / 60);
}, true);
// ======================================================================================================================================
// REMAKE-ONLY CONTROLS (docs/12-findings.md, "Remake-only controls"; docs/brief-restyle.md). 1.2 had none of these: they are the
// REMAKE'S OWN, drawn in 1.2's look (black on white, Geneva, the System 6 window, 1.2's bars and halo) and marked so:
//   remake12   every window or control of this section, however it is drawn
//   native12   built here, in 1.2's own manner (a window's own code)
//   css12      a later version's own window (rs.giveWindow, rs.windowWords ...) kept as it is and dressed in 1.2's look by style.css
// Their words are 1.2F's where it has them, then 3.0.1F's, then iOS's, else the remake's (js/ui-text.js, each row marked).
// ======================================================================================================================================
const rwin = (title, body, cls, o) => A().modal(title, body, Object.assign({ cls: 'mid mac12 remake12 native12 ' + (cls || ''), label: title }, o || {}));
// the later rulesets' own windows (not 1.2's) are dressed by style.css: a window that is not one of this skin's own gets the class
// a later version's window may carry a colour picture of its own (5.0.5's Radical Research: a picture beside each program, named in
// rs.radicalHand.words.pic); the skin has 1-bit stand-ins for them (assets/skins/mac12/sprites/fill, docs/mac12-fill), 1.2's order
function standIns(w) {
  if (!G()) return; // (a window before any game: the New Game window)
  const pic = ((H().rules(G()) || {}).radicalHand || {}).words; const name = pic && pic.pic; if (!name) return;
  const pre = (window.HOTHEME && HOTHEME.prefix) || 'dos:', k = pre + 'fill/classic-' + name, im = A().IMG[k];
  if (im) w.querySelectorAll('img.radpic').forEach((i) => { i.src = im.src; });
}
// A colour picture a later version's window shows (the Halls' rank picture, Windows 4.0.5's) is drawn in 1 bit, with the Mac's own dither
// (Atkinson's: an eighth of the error to six neighbours), as tools/skins/fill_art.py does for the stand-ins; done once, when it loads
function ditherImg(im) {
  if (im.dataset.dith12) return; im.dataset.dith12 = '1';
  const go = () => {
    try {
      const w = im.naturalWidth, h = im.naturalHeight; if (!w || !h) return;
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, w, h), g = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) { const a = d.data[4 * i + 3] / 255; g[i] = (0.299 * d.data[4 * i] + 0.587 * d.data[4 * i + 1] + 0.114 * d.data[4 * i + 2]) * a + 255 * (1 - a); }
      const near = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
        const i = y * w + xx, old = g[i], nv = old < 128 ? 0 : 255, err = (old - nv) / 8; g[i] = nv;
        for (const [dx, dy] of near) { const X = xx + dx, Y = y + dy; if (X >= 0 && X < w && Y < h) g[Y * w + X] += err; }
      }
      for (let i = 0; i < w * h; i++) { d.data[4 * i] = d.data[4 * i + 1] = d.data[4 * i + 2] = g[i]; d.data[4 * i + 3] = 255; }
      x.putImageData(d, 0, 0); im.src = c.toDataURL('image/png');
    } catch (e) { /* (a picture the page may not read back: left as it is) */ }
  };
  if (im.complete && im.naturalWidth) go(); else im.addEventListener('load', go, { once: true });
}
// 1.2's own rules are being played: the windows the classic code opens are 1.2's (the explored stars, the battle list ...) and must show as 1.2
// showed them, so style.css's content rules for the remake's windows (.remake12) must not reach them
const own12Rules = () => !!(G() && H().rules(G()).id === (V2 ? 'mac20' : '12'));
// the windows a remake command has just opened (a Ho! menu item) are the remake's own, whatever the ruleset
function tagRemakeWindows() {
  document.querySelectorAll('.scrim .win').forEach((w) => { if (!w.classList.contains('mac12') && !w.classList.contains('remake12') && !/\bbw12/.test(w.className)) { w.classList.add('remake12', 'css12'); standIns(w); } });
}
function dressLaterWindows() {
  const dress = (n) => { if (n.nodeType !== 1 || own12Rules()) return; // (under 1.2's own rules a classic window is 1.2's own, drawn as it was: left alone; the remake's commands tag theirs, tagRemakeWindows)
    for (const w of (n.matches && n.matches('.win') ? [n] : n.querySelectorAll ? n.querySelectorAll('.win') : [])) if (!w.classList.contains('mac12') && !w.classList.contains('remake12') && !/\bbw12/.test(w.className)) { w.classList.add('remake12', 'css12'); standIns(w); } };
  // (the scrim that holds a window is added to the body: watch the page, not the body, which may not exist yet when this loads)
  const pics = (n) => { if (n.nodeType !== 1) return; const l = n.matches && n.matches('.hpic img') ? [n] : n.querySelectorAll ? n.querySelectorAll('.hpic img') : []; for (const i of l) if (i.closest('.css12')) ditherImg(i); };
  // The iOS and Android rulesets' Help screen shows the version's manual in an iframe: a dark page with a colour screenshot. In 1.2's black on white, and its picture
  // in 1 bit (same-origin, so the page can be restyled once it has loaded)
  const MANUAL_CSS = 'html, body { background: #fff !important; color: #000 !important; font: 12px/1.4 Geneva, Verdana, sans-serif !important; } body * { background: transparent !important; color: #000 !important; border-color: #000 !important; text-shadow: none !important; box-shadow: none !important; } h1, h2, h3 { font-family: Chicago, Geneva, sans-serif !important; } a { text-decoration: underline; } img { image-rendering: pixelated; } hr { border-color: #000 !important; }';
  const manuals = (n) => { if (n.nodeType !== 1) return; const l = n.matches && n.matches('iframe.shelp') ? [n] : n.querySelectorAll ? n.querySelectorAll('iframe.shelp') : []; for (const f of l) { if (f.dataset.h12) continue; f.dataset.h12 = '1'; const go = () => { try { const d = f.contentDocument; if (!d || !d.head) return; const st = d.createElement('style'); st.textContent = MANUAL_CSS; d.head.appendChild(st); for (const im of d.images) ditherImg(im); } catch (e) { /* (a page that cannot be read: left as it is) */ } }; f.addEventListener('load', go); } };
  new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) { dress(n); pics(n); manuals(n); } }).observe(document.documentElement, { childList: true, subtree: true });
}
dressLaterWindows();

// The Players window (the remake's own: 1.2 has no such window): who is in the game, the pacts and the history, in 1.2's manner:
// a bordered list with a heading line, 1.2's check boxes, the history drawn as the Tech Spending window draws, 1 bit, and its buttons.
// The same rules as the classic window's (HO.setPact, HO.score, HO.isAllied ...); a pact still starts when both sides have ticked it.
const HIST12 = [['pop', []], ['inc', [4, 3]], ['tech', [1, 3]]]; // solid, dashed, dotted
function playersWindow() {
  const a = A(), el = a.el, g = G(), me = a.me(), ME = a.ME, rs = H().rules(g);
  const pacts = H().feature(g, 'alliances'), buddies = pacts && rs.bestBuddies !== false;
  const dim = () => { const m = ITEMS['Players and alliances…']; return !!(m && m[4] && m[4]()); }; // (a version dims some commands in its first year, rs.menuDimmed: the pact boxes are dimmed then, as the classic window's are)
  const rows = g.players.map(p => ({ p, sc: H().score(g, p) })).sort((x, y) => y.sc - x.sc);
  const list = el('div', { class: 'pl12 lb', role: 'table', 'aria-label': 'Players' });
  const cols = (...c) => el('div', { class: 'prow' + (pacts ? ' pacts' : '') + (buddies ? ' buddies' : '') }, ...c);
  list.append(cols(el('span'), el('span', null, 'Player'), el('span', null, 'Colonies seen'), el('span', null, 'Status'), pacts ? el('span', null, 'Ally') : null, buddies ? el('span', null, 'Best buddy') : null));
  list.firstChild.classList.add('head');
  for (const { p } of rows) {
    const im = a.IMG[p.human ? 'white0_' + (p.female ? 1 : 0) : 'bad' + p.face + '_' + (p.female ? 1 : 0)];
    const seen = p.human ? H().colonies(g, ME).length : g.stars.filter(s => { const k = H().know(g, me, s.id); return k.explored && k.owner === p.id; }).length;
    let status = p.surrendered ? 'Surrendered' : p.alive ? 'In the game' : 'Eliminated';
    if (pacts && p.id !== ME && p.alive) {
      const they = (p.allies || []).includes(ME), we = (me.allies || []).includes(p.id);
      if (H().isBuddy(g, ME, p.id)) status = 'Your best buddy';
      else if (H().isAllied(g, ME, p.id)) status = 'Your ally' + (buddies && (p.buddies || []).includes(ME) ? ' (offers best buddies)' : '');
      else if (they) status = 'Offers to ally';
      else if (we) status = 'You offered to ally';
    }
    const chk = (kind, on) => el('input', { type: 'checkbox', checked: on ? 'checked' : false, disabled: dim() ? 'disabled' : false, 'aria-label': (kind === 'ally' ? 'Ally with ' : 'Best buddies with ') + p.name,
      onchange: (e) => { H().setPact(g, ME, p.id, kind, e.target.checked); a.save(); a.renderPanel(); playersWindow(); } });
    const can = p.id !== ME && p.alive;
    list.append(cols(im ? el('img', { src: im.src, alt: '', width: 16, height: 16 }) : el('span'), raw('span', p.human ? p.name + ' (you)' : p.name, { class: 'pname' }), el('span', null, String(seen)), el('span', null, status),
      pacts ? el('span', null, can ? chk('ally', (me.allies || []).includes(p.id)) : '') : null, buddies ? el('span', null, can ? chk('buddy', (me.buddies || []).includes(p.id)) : '') : null));
    if (!p.alive) list.lastChild.classList.add('out');
  }
  const note = pacts ? el('p', { class: 'fine' }, buddies ? 'An alliance or best-buddy pact starts when both sides tick it. Allies don’t fight each other, refuel at each other’s colonies, and win together if every survivor is allied. Best buddies also share what they explore.'
    : 'An alliance starts when both sides tick it. Allies don’t fight each other, refuel at each other’s colonies, and win together if every survivor is allied.') : null;
  // the history: three lines in 1 bit (solid, dashed, dotted), each scaled to its own greatest, in a box with an axis at its foot
  const W = 300, Hh = 84, q = qdCanvas(W, Hh, 'Your history'), x = q.x, h = me.hist || [];
  q.hline(0, W, Hh - 1); q.vline(0, 0, Hh); q.hline(0, W, 0); q.vline(W - 1, 0, Hh);
  HIST12.forEach(([key, dash]) => {
    if (h.length < 2) return;
    const max = Math.max(...h.map(e => e[key]), 1);
    x.setLineDash(dash); x.lineWidth = 1; x.beginPath();
    h.forEach((e, i) => { const px = 6 + Math.round(i / (h.length - 1) * (W - 12)) + .5, py = Hh - 6 - Math.round(e[key] / max * (Hh - 14)) + .5; if (i) x.lineTo(px, py); else x.moveTo(px, py); });
    x.stroke(); x.setLineDash([]);
  });
  const legend = el('p', { class: 'fine' }, 'Solid: total population. Dashed: income. Dotted: tech.');
  const btns = el('div', { class: 'btns' });
  // (rs.surrenderCommand false: iOS and Android have the rule but no command, so no button here either, as the Galaxy menu has none)
  if (H().feature(g, 'surrender') && rs.surrenderCommand !== false) btns.append(btn(me.surrenderTo != null ? 'Take back surrender' : 'Surrender…', () => { a.closeModal(); a.openSurrender(); }, { class: 'quiet' }));
  btns.append(el('span', { class: 'fill' }), btn('OK', () => a.closeModal()));
  rwin('Players', el('div', { class: 'players12' }, list, note, el('p', { class: 'cap' }, 'Your history'), q.c, legend, btns), 'players12w');
  return true;
}

// ---------- the map window's scroll bars (MapWinProc) ----------
// The map window has a vertical and a horizontal scroll bar (CreateMapWin @c2704: two NewControl, procID 16, the standard scroll bar, 16 pixels
// thick, at the window's right edge and foot) and the grow box between them. The bars' value is the galaxy cell at the window's top left, in whole
// cells: GrowMapWin @c29c0 sets each bar's range from the zoom (the setup's +0x26: 6, 9, 12 or 17 pixels to a cell) and the window's size:
// cells in view = pane pixels / zoom (the pane: from x 226 to the bar, from the top to the bar), maximum = the galaxy's size - the cells in view (0
// when the window shows the whole galaxy, and then the bar is inactive), the page = 3/4 of the cells in view (SetCRefCon), the value clamped
// to the new maximum. So the window shows a scrolled part of the galaxy at every zoom, with cell 0 at the pane's top left when the whole galaxy
// fits. InitDelta @c56d4: the arrows scroll 1 cell, a page click the page; ScrollMapWindow @c5746 (a part held repeats, every 6 ticks, ContentClick's
// CONTROLPROC @118cc) sets the value and, when it changed, ScrollMapResponse @c588c scrolls the pane by the difference x zoom pixels (ScrollRect) and
// draws the rest; ThumbMapWindow @c5804: the thumb is dragged as an outline and the map moves when it is let go. Zoom In and Zoom Out (@120900,
// @120980) set the zoom, GrowMapWin, then CenterOnStar(the selected star, 0, force 1); CenterOnStar @c5a0c puts the star in the middle
// (value = its cell - (galaxy size - (max - 1)) / 2) unless it is already inside the pane's margins (40 pixels, 85 at the foot).
// ActivateMapWindow @c3012 / DeactivateMapWindow @c30a4: HiliteControl 0 / 255 on the bars: an inactive bar is drawn empty.
const BAR12 = 16; // a bar's thickness in the program's pixels (the map is drawn at one CSS pixel to one; a cell is the zoom's 6, 9, 12 or 17 of them, which is half the view's scale: the remake's unit is two cells)
const cellsOf = (g) => [Math.round(g.W * 2), Math.round(g.H * 2)];
const MB = { H: 0, V: 0, maxH: 0, maxV: 0, pgH: 0, pgV: 0, s: 0, shown: null, centerSel: false, press: null, ghost: null, drag: null, key: '', wrap: null, v: null, h: null, corner: null };
const barsOn = () => own();
const mapView = () => { const a = A(); return a && a.UI.view; };
const mapSize = () => { const a = A(), m = a && a.map(); return m ? [m.w, m.h] : [0, 0]; };
function barMetrics(s, mapW, mapH, g) {
  const z = s / 2, [cw, ch] = cellsOf(g), visH = Math.max(1, Math.floor(mapW / z + 1e-6)), visV = Math.max(1, Math.floor(mapH / z + 1e-6)); // (the cells in view: pane pixels / zoom)
  MB.maxH = visH < cw ? cw - visH : 0; MB.maxV = visV < ch ? ch - visV : 0;
  MB.pgH = Math.trunc(visH * 3 / 4); MB.pgV = Math.trunc(visV * 3 / 4);
}
const cellOf = (v) => [(0.25 * v.s - v.ox) / (v.s / 2), (0.25 * v.s - v.oy) / (v.s / 2)]; // the cell at the top left (a star's middle is half a cell in)
const putCell = (v, H, V) => { v.ox = (0.5 - H) * (v.s / 2); v.oy = (0.5 - V) * (v.s / 2); };
const clampCell = (H, V) => [Math.max(0, Math.min(MB.maxH, H)), Math.max(0, Math.min(MB.maxV, V))];
// CenterOnStar @c5a0c: the cell that puts the star in the middle
function centerCells(st, g) { const [cw, ch] = cellsOf(g); return clampCell(Math.round(st.x * 2) - Math.trunc((cw - (MB.maxH - 1)) / 2), Math.round(st.y * 2) - Math.trunc((ch - (MB.maxV - 1)) / 2)); }
function syncMapView(v, c) {
  if (!barsOn()) return;
  v.s = snapZoom(v.s);
  barMetrics(v.s, c.mapW, c.mapH, c.G);
  if (FILL.s && v.s === FILL.s) MB.maxH = MB.maxV = 0; // (the window filled: the stars all show, the bars have nothing to scroll)
  if (!MB.maxH && !MB.maxV) { centreStars(v, c); MB.H = 0; MB.V = 0; MB.s = v.s; MB.centerSel = false; return; }
  let [H, V] = cellOf(v);
  if (MB.s && MB.s !== v.s && MB.centerSel && c.sel != null && c.G.stars[c.sel]) [H, V] = centerCells(c.G.stars[c.sel], c.G); // (Zoom In / Zoom Out: CenterOnStar, forced)
  else if (!c.live) { H = Math.round(H); V = Math.round(V); } // (whole cells; while a drag or a throw is on, the map follows it and settles at its end)
  [H, V] = clampCell(H, V);
  putCell(v, H, V);
  MB.H = H; MB.V = V; MB.s = v.s; MB.centerSel = false;
}
// the whole galaxy in view: the stars in the middle of the window, as far from the top as from the foot and from the left as from the right
// (the remake's: the program put cell 0 at the window's top left and left the rest empty)
function centreStars(v, c) { const b = starBox(c.G, v.s); v.ox = (c.mapW - (b.x1 - b.x0)) / 2 - b.x0; v.oy = (c.mapH - (b.y1 - b.y0)) / 2 - b.y0; }
function centerOnStar12(v, sid, c) {
  if (!barsOn()) return false;
  const st = c.G.stars[sid]; if (!st) return false;
  v.s = snapZoom(v.s); barMetrics(v.s, c.mapW, c.mapH, c.G);
  if ((FILL.s && v.s === FILL.s) || (!MB.maxH && !MB.maxV)) { centreStars(v, c); return true; } // (all of it in view: nothing to bring nearer)
  const [H, V] = cellOf(v), z = v.s / 2, px = (st.x * 2 - H) * z - 6, py = (st.y * 2 - V) * z - 7;
  if (px > 40 && px < c.mapW - 40 && py > 40 && py < c.mapH - 85) return true; // (already in view: CenterOnStar leaves the map)
  const [h2, v2] = centerCells(st, c.G); putCell(v, h2, v2); return true;
}
let BAR_TILE = null;
const barTile = () => BAR_TILE || (() => { const t = document.createElement('canvas'); t.width = t.height = 2; const x = t.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 2, 2); x.fillStyle = '#000'; x.fillRect(0, 0, 1, 1); x.fillRect(1, 1, 1, 1); return (BAR_TILE = t); })();
// one bar, drawn as the standard scroll bar of System 6 in black and white, read pixel by pixel in Jake's System 6 captures of 1.2F
// (captures-system6/, the map window's bars and the panes' narrow ones): a frame; an arrow box at each end, its outline arrow (filled black
// while it is held); between them the light grey (QuickDraw's ltGray: every fourth pixel, two along on the next row) and the thumb, a white
// square with a frame. With nothing to scroll the arrows stay and the track is white, with no thumb (the players' bar in shot010, a level
// that can't move in DITL 6010); an inactive bar (a dialog is up) is an empty frame. t: the bar's thickness, 16 (the map, the dialogs)
// or 12 (the panes' bars: GrowMapWin's 67..79 and 214..226).
const ARROW = {
  16: { out: [[], [], [[7, 7]], [[6, 6], [8, 8]], [[5, 5], [9, 9]], [[4, 4], [10, 10]], [[3, 3], [11, 11]], [[2, 2], [12, 12]], [[1, 4], [10, 13]], [[4, 4], [10, 10]], [[4, 4], [10, 10]], [[4, 4], [10, 10]], [[4, 10]]],
    fill: [[], [], [[7, 7]], [[6, 8]], [[5, 9]], [[4, 10]], [[3, 11]], [[2, 12]], [[1, 13]], [[4, 10]], [[4, 10]], [[4, 10]], [[4, 10]]] },
  12: { out: [[], [[5, 5]], [[4, 4], [6, 6]], [[4, 4], [7, 7]], [[2, 3], [7, 8]], [[1, 1], [9, 9]], [[1, 3], [7, 10]], [[3, 3], [7, 7]], [[3, 3], [7, 7]], [[3, 7]]],
    fill: [[], [[5, 5]], [[4, 6]], [[4, 7]], [[2, 8]], [[1, 9]], [[1, 10]], [[3, 7]], [[3, 7]], [[3, 7]]] },
};
function drawBar(x, ox, oy, vertical, L, t, o) {
  // (a, p, w, h): a across the bar, p along it
  const R = (a0, p0, w, h, col) => { x.fillStyle = col; if (vertical) x.fillRect(ox + a0, oy + p0, w, h); else x.fillRect(ox + p0, oy + a0, h, w); };
  R(0, 0, t, L, '#000'); R(1, 1, t - 2, L - 2, '#fff');
  if (o.on === false) return;
  const box = t; // an arrow box: the frame, the arrow, the divider (16 rows for the 16-pixel bar, 12 for the narrow one)
  R(1, box - 1, t - 2, 1, '#000'); R(1, L - box, t - 2, 1, '#000');
  const A0 = ARROW[t] || ARROW[16];
  const arrow = (end, inv) => (inv ? A0.fill : A0.out).forEach((segs, i) => { for (const [a0, a1] of segs) R(a0, end ? L - 1 - i : i, a1 - a0 + 1, 1, '#000'); });
  arrow(0, o.press === 'lo'); arrow(1, o.press === 'hi');
  if (!(o.max > 0)) return;
  // the light grey, aligned to the window's pixels
  for (let p0 = box; p0 < L - box; p0++) for (let a0 = 1; a0 < t - 1; a0++) {
    const gx = vertical ? ox + a0 : ox + p0, gy = vertical ? oy + p0 : oy + a0;
    if ((gy & 1) ? (gx & 3) === 2 : (gx & 3) === 0) R(a0, p0, 1, 1, '#000');
  }
  const T = L - 3 * box + 2; // the thumb's travel: from the first divider to the last, less its own size
  if (T >= 0) {
    const tp = box - 1 + Math.round(T * Math.max(0, Math.min(1, o.value / o.max)));
    R(0, tp, t, t, '#000'); R(1, tp + 1, t - 2, t - 2, '#fff');
    if (o.ghost != null) { // the outline that is dragged
      for (let i = 0; i < t; i++) for (let j = 0; j < t; j++) if ((i === 0 || j === 0 || i === t - 1 || j === t - 1) && (i + j) % 2 === 0) R(i, o.ghost + j, 1, 1, '#000');
    }
  }
}
// System 7.5's colour scroll bar (the colour 3.0.1 and 4.0.5 on the System 7.5 screen, html.mac75), copied from Jake's 4.0.5 shot 008 (the map's
// bars): 16 across with its black frame both sides; an arrow box 14 long (a white first row and column, #dddddd, the arrow #9999cc edged
// #333366, a #777777 last row and column), black dividers, the track #dddddd with #777777 dots aligned to the screen as the desktop's
// pattern, the thumb 16 long (#555555 edge, #ccccff and #aaaaaa, a grip of #9999cc then #666699 / #ccccff lines, #333366 far edges).
const AR75 = ['', '', '      E', '     EFE', '    EFFFE', '   EFFFFFE', '  EFFFFFFFE', ' EEEEFFFEEEE', '    EFFFE', '    EFFFE', '    EFFFE', '    EEEEE'];
const C75 = { E: '#333366', F: '#9999cc' };
function drawBar75(x, ox, oy, vertical, L, o, ax, ay) {
  const R = (a0, p0, w, h, col) => { x.fillStyle = col; if (vertical) x.fillRect(ox + a0, oy + p0, w, h); else x.fillRect(ox + p0, oy + a0, h, w); };
  R(0, 0, 16, L, '#000'); R(1, 1, 14, L - 2, '#dddddd');
  if (o.on === false) return;
  const box = (p0, down, press) => {
    R(1, p0, 14, 14, press ? '#999999' : '#dddddd'); R(1, p0, 13, 1, '#fff'); R(1, p0, 1, 13, '#fff'); R(1, p0 + 13, 14, 1, '#777777'); R(14, p0, 1, 14, '#777777');
    AR75.forEach((row, i) => { for (let j = 0; j < row.length; j++) if (row[j] !== ' ') R(1 + j, down ? p0 + 13 - i : p0 + i, 1, 1, C75[row[j]]); });
  };
  box(1, false, o.press === 'lo'); R(1, 15, 14, 1, '#000'); R(1, L - 16, 14, 1, '#000'); box(L - 15, true, o.press === 'hi');
  if (!(o.max > 0)) return;
  for (let p0 = 16; p0 < L - 16; p0++) for (let a0 = 1; a0 < 15; a0++) {
    const gx = (vertical ? a0 : p0) + (ax || 0), gy = (vertical ? p0 : a0) + (ay || 0);
    if ((gy & 1) ? (gx & 3) === 0 : (gx & 3) === 2) R(a0, p0, 1, 1, '#777777');
  }
  const T = L - 48; // (the thumb, 16 long, between the dividers)
  if (T < 0) return;
  const thumb = (tp, ghost) => {
    if (ghost) { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i === 0 || j === 0 || i === 15 || j === 15) && (i + j) % 2 === 0) R(i, tp + j, 1, 1, '#000'); return; }
    R(1, tp, 14, 16, '#aaaaaa'); R(1, tp, 14, 1, '#555555'); R(1, tp + 1, 13, 1, '#ccccff'); R(1, tp + 1, 1, 14, '#ccccff'); R(14, tp + 1, 1, 15, '#333366'); R(1, tp + 15, 14, 1, '#333366');
    R(5, tp + 3, 6, 1, '#9999cc'); for (let k = 4; k <= 12; k++) R(5, tp + k, 6, 1, k % 2 ? '#666699' : '#ccccff');
  };
  thumb(16 + Math.round(T * Math.max(0, Math.min(1, o.value / o.max))), false);
  if (o.ghost != null) thumb(o.ghost, true);
}
// the map window's grow box (System 7.5, colour: shot 008, 14 x 14 inside the bars' frames)
const GROW75 = ['GGGGGGGGGGGGGG', 'GGGGGGGGGGGGGG', 'GGEEEEEEGGGGGG', 'GGEHHHHHEEEEGG', 'GGEHIIIEHHHHGG', 'GGEHIIIEJJJEGG', 'GGEHIIIEJJJEGG', 'GGEHEEEEJJJEGG', 'GGGEHJJJJJJEGG', 'GGGEHJJJJJJEGG', 'GGGEHJJJJJJEGG', 'GGGEHEEEEEEEGG', 'GGGGGGGGGGGGGG', 'GGGGGGGGGGGGGG'];
function drawGrow75(x) { const P = { G: '#eeeeee', E: '#333366', H: '#ccccff', I: '#bbbbbb', J: '#aaaaaa' }; x.fillStyle = '#000'; x.fillRect(0, 0, 16, 16); GROW75.forEach((r, i) => { for (let j = 0; j < 14; j++) { x.fillStyle = P[r[j]]; x.fillRect(1 + j, 1 + i, 1, 1); } }); }
const BAR75 = () => COLOUR3 && document.documentElement.classList.contains('mac75');
function paintBar(b, vertical, L, o) {
  const k = Math.max(1, Math.round(window.devicePixelRatio || 1)), cw = vertical ? BAR12 : L, ch = vertical ? L : BAR12, c = b.c;
  if (c.width !== cw * k || c.height !== ch * k) { c.width = cw * k; c.height = ch * k; }
  c.style.width = cw + 'px'; c.style.height = ch + 'px';
  const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.imageSmoothingEnabled = false;
  if (BAR75() && BAR12 === 16) drawBar75(x, 0, 0, vertical, L, o); else drawBar(x, 0, 0, vertical, L, BAR12, o);
}
function ensureBars() {
  if (MB.wrap && MB.wrap.isConnected) return true;
  const a = A(), host = document.getElementById('mapwrap'); if (!a || !host) return false;
  const mk = (vertical) => {
    const c = a.el('canvas', { class: 'cv12' }), bar = a.el('div', { class: 'mapbar12 ' + (vertical ? 'v' : 'h'), role: 'scrollbar', tabindex: 0, 'aria-orientation': vertical ? 'vertical' : 'horizontal', 'aria-controls': 'map', 'aria-label': tr12(vertical ? 'Map vertical scroll bar' : 'Map horizontal scroll bar') }, c);
    return { vertical, c, el: bar, L: 0 };
  };
  MB.v = mk(true); MB.h = mk(false);
  MB.corner = a.el('div', { class: 'mapcorner12', 'aria-hidden': 'true' });
  host.append(MB.v.el, MB.h.el, MB.corner); MB.wrap = host;
  for (const b of [MB.v, MB.h]) wireBar(b);
  return true;
}
const barVals = (b) => (b.vertical ? { value: MB.V, max: MB.maxV, page: MB.pgV } : { value: MB.H, max: MB.maxH, page: MB.pgH });
const barActive = (b) => barVals(b).max > 0 && !document.querySelector('.scrim');
function setCells(H, V) { const a = A(), v = mapView(); if (!v) return; const [h2, v2] = clampCell(H, V); putCell(v, h2, v2); a.draw(); }
function scrollBy12(b, d) { // ScrollMapWindow @c5746: the value moves, and the map only when it changed
  const cur = Math.round(b.vertical ? MB.V : MB.H), nv = Math.max(0, Math.min(barVals(b).max, cur + d));
  if (nv === cur) return false;
  if (b.vertical) setCells(MB.H, nv); else setCells(nv, MB.V);
  return true;
}
// where along the bar a pointer is, in the program's pixels, and the part it is on (FindControl)
function barPos(b, e) { const r = b.c.getBoundingClientRect(), L = b.L; return ((b.vertical ? e.clientY - r.top : e.clientX - r.left) / (b.vertical ? r.height : r.width)) * L; }
function barPart(b, p) {
  const { value, max } = barVals(b), L = b.L;
  if (p < 16) return 'lo'; if (p >= L - 16) return 'hi';
  const T = L - 46, t = 15 + Math.round(T * value / max);
  if (T >= 0 && p >= t && p < t + 16) return 'thumb';
  return p < t ? 'pagelo' : 'pagehi';
}
function wireBar(b) {
  const el = b.el;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); el.focus({ preventScroll: true });
    if (!barActive(b)) return; // (an inactive bar answers no click: FindControl finds no part)
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const p = barPos(b, e), part = barPart(b, p), { value, max } = barVals(b);
    if (part === 'thumb') { MB.drag = { b, p0: p, t0: 15 + Math.round((b.L - 46) * value / max), id: e.pointerId }; MB.ghost = { b, t: MB.drag.t0 }; updateBars(); return; }
    const st = { b, part, id: e.pointerId, p, timer: 0 };
    MB.press = st;
    const tick = () => { // CONTROLPROC @118cc: the first call at once, then every 6 ticks (100 ms), while the pointer is still in the part
      if (MB.press !== st) return;
      if (barPart(b, st.p) === part) {
        const g = barVals(b), d = part === 'lo' ? -1 : part === 'hi' ? 1 : part === 'pagelo' ? -g.page : g.page; // InitDelta @c56d4
        scrollBy12(b, d);
      }
      updateBars(); st.timer = setTimeout(tick, 100);
    };
    tick();
  });
  el.addEventListener('pointermove', (e) => {
    if (MB.press && MB.press.b === b && MB.press.id === e.pointerId) { MB.press.p = barPos(b, e); updateBars(); }
    else if (MB.drag && MB.drag.b === b && MB.drag.id === e.pointerId) {
      const g = MB.drag, T = b.L - 46; g.t = Math.max(15, Math.min(15 + T, g.t0 + barPos(b, e) - g.p0)); MB.ghost = { b, t: g.t }; updateBars();
    }
  });
  const up = (e) => {
    if (MB.press && MB.press.b === b && MB.press.id === e.pointerId) { clearTimeout(MB.press.timer); MB.press = null; updateBars(); }
    else if (MB.drag && MB.drag.b === b && MB.drag.id === e.pointerId) { // ThumbMapWindow @c5804: the map moves when the thumb is let go, if the value changed
      const g = MB.drag, T = b.L - 46, { max } = barVals(b); MB.drag = null; MB.ghost = null;
      const nv = e.type === 'pointercancel' ? null : Math.round(Math.max(0, Math.min(1, T > 0 ? (g.t - 15) / T : 0)) * max);
      if (nv != null && nv !== Math.round(b.vertical ? MB.V : MB.H)) { if (b.vertical) setCells(MB.H, nv); else setCells(nv, MB.V); } else updateBars();
    }
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  // from the keyboard (the remake's): arrows scroll a cell, Page Up and Page Down a page
  el.addEventListener('keydown', (e) => {
    const k = e.key, g = barVals(b); if (!barActive(b)) return;
    const d = { ArrowUp: b.vertical && -1, ArrowLeft: !b.vertical && -1, ArrowDown: b.vertical && 1, ArrowRight: !b.vertical && 1, PageUp: -g.page, PageDown: g.page }[k];
    if (d) { e.preventDefault(); scrollBy12(b, d); }
  });
}
function updateBars() {
  const a = A(); if (!a || !ensureBars()) return;
  const on = barsOn(), g = G();
  document.documentElement.classList.toggle('bars12', on);
  if (on !== MB.shown) { MB.shown = on; if (g) a.UI.fitted = false; a.resize(); return; }
  for (const b of [MB.v, MB.h]) b.el.style.display = MB.corner.style.display = on && g ? '' : 'none';
  if (!on || !g) return;
  const [w, h] = mapSize();
  MB.v.L = Math.max(34, Math.round(h)); MB.h.L = Math.max(34, Math.round(w));
  for (const b of [MB.v, MB.h]) {
    const vals = barVals(b), act = barActive(b), press = MB.press && MB.press.b === b && barPart(b, MB.press.p) === MB.press.part && /^(lo|hi)$/.test(MB.press.part) ? MB.press.part : null;
    const ghost = MB.ghost && MB.ghost.b === b ? MB.ghost.t : null;
    const key = [b.L, vals.value, vals.max, act, press, ghost, window.devicePixelRatio].join();
    b.el.setAttribute('aria-valuemin', '0'); b.el.setAttribute('aria-valuemax', String(vals.max)); b.el.setAttribute('aria-valuenow', String(Math.round(vals.value)));
    b.el.setAttribute('aria-disabled', act ? 'false' : 'true');
    if (b.key !== key) { b.key = key; paintBar(b, b.vertical, b.L, { on: !document.querySelector('.scrim'), value: vals.value, max: vals.max, press, ghost }); }
  }
  MB.v.el.style.height = MB.v.L + 'px'; MB.h.el.style.width = MB.h.L + 'px';
  MB.v.el.dataset.value = String(MB.V); MB.h.el.dataset.value = String(MB.H);
}
// a dialog opening or closing activates or deactivates the map window (DeactivateMapWindow @c30a4 / ActivateMapWindow @c3012)
new MutationObserver(() => { if (MB.wrap) updateBars(); }).observe(document.body, { childList: true });

// ---------- Mac 3.0.1's map (DrawGalaxyMap @152d54, DrawOneColorStarSubProc @1531a4, DrawOneBWStarSubProc @1539b0) ----------
// The map scrolls and zooms as 2.0.1's (ZoomIn, ZoomOut and ThumbMapWindow are the same code; ScrollMapWindow, CenterOnStar and InitDelta differ only
// in what they keep: the same formulas), so 3.0.1 takes this file's zooms (6, 9, 12, 17 pixels a cell), cells and scroll bars. Its own drawing:
//   the map painted black; then, under the stars, each star's blinking points (SetBlinkLocs @f21a0: one at a random cell 1..size - 2 that holds no
//     star, a second for a sparse galaxy; each at its cell plus (the other coordinate mod the cell), white or black at random; the idle loop,
//     DoGratuitousGraphics' second part, flips each at 1 in 100 every 10 ticks);
//   on a Spiral or Cluster map in 2000 (galaxy +0x10: laid out in 2010) PICT 6000 tiled every 128 pixels (50% grey in black and white), a disc 8
//     cells across at the middle, its edge blended in grey steps, "Map will be created in 2010." (1005.27) white, centred 15 above the foot (on a
//     black strip in black and white), and only your home, at the middle;
//   each star by its cell (h, v) and the zoom u: at 17 its 32 x 32 icon at (h - 7, v - 7), at 9 and 12 its 16 x 16 one at (h - 1, v - 1), at 6 a
//     dot (PaintOval of the cell, white; a 50% pattern of white and the star's colour, not read: plain white here); the icon is the star's own
//     (SetPlanetTypesForStar: js/skins/mac3/pictures.js starLook). Before it, the selected star's halo (colour PICT 500, 501 small: the extractor's
//     p502, p503), an ally's (504, 505), both (508, 509), at (h - 19, v - 16) 56 x 51, or 26 x 26 round the small icon; in black and white the
//     selected star's PICT 502 / 503 and for an ally a white oval cap (EraseOval: the icon's width less 2 each side, from u / 3 above its top to
//     u / 6 below it). A colony being abandoned gets the 50% grey ORed over its icon's square grown by u / 2. At 6 the selected dot gets a white
//     frame 2 out. Then, from zoom 9: ICN 3114 (a small ship) at the icon's top right (right - 9, top - 8; at 17 right - 5, top - 10) when one of
//     your fleets other than satellites is there (the star's +0x2a, bit 0x4000: CalcFleetsAtAllStars); the same at its top left when another
//     player has ships there and the star is yours or you have ships there; a white ring (FrameOval of the icon's square) round it when you have
//     satellites there (+0x2a's count); the name in white, centred under the icon, base line 8 below it (condensed at 9).
const BLINK = { key: null, pts: [], timer: null };
function blinkPoints(g) {
  const key = g.id + ':' + g.stars.length;
  if (BLINK.key === key) return BLINK.pts;
  const [cw] = cellsOf(g), taken = new Set(g.stars.map(s0 => Math.round(s0.x * 2) + ',' + Math.round(s0.y * 2))), sparse = g.opts && g.opts.density === 'sparse';
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = () => { for (let n = 0; n < 200; n++) { const h = rnd(1, cw - 2), v = rnd(1, cw - 2); if (!taken.has(h + ',' + v)) return [h, v]; } return [1, 1]; };
  BLINK.pts = g.stars.map(() => [pick(), sparse ? pick() : null].filter(Boolean).map(([h, v]) => ({ h, v, on: rnd(0, 1) === 1 })));
  BLINK.key = key;
  return BLINK.pts;
}
const in2000 = (g) => g.year === 2000 && g.opts && (g.opts.shape === 'spiral' || g.opts.shape === 'cluster');
function mapUnder301(cx, i) {
  const g = i.G, col = COL301(), u = i.view.s / 2;
  if (in2000(g)) {
    const tile = i.IMG['dos:p6000'];
    if (col && tile && tile.width) { for (let y = 0; y < i.mapH; y += 128) for (let x = 0; x < i.mapW; x += 128) cx.drawImage(tile, x, y, 128, 128); }
    else { cx.fillStyle = orPat(cx, GRAY, '#000'); cx.fillRect(0, 0, i.mapW, i.mapH); }
    const mx = Math.trunc(i.mapW / 2), my = Math.trunc(i.mapH / 2), R = 4 * u;
    if (col) { const steps = Math.trunc(2 * R / 4); for (let k = 0; k < steps; k++) { cx.strokeStyle = 'rgba(0,0,0,' + (k / steps) + ')'; cx.beginPath(); cx.ellipse(mx, my, R - k - 0.5, R - k - 0.5, 0, 0, Math.PI * 2); cx.stroke(); } }
    cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(mx, my, R - (col ? Math.trunc(2 * R / 4) : 0), R - (col ? Math.trunc(2 * R / 4) : 0), 0, 0, Math.PI * 2); cx.fill();
    const t = STR301(1005)[26] || 'Map will be created in 2010.';
    cx.font = G9; cx.textAlign = 'left'; const w = cx.measureText(t).width, tx = Math.trunc((i.mapW - w) / 2);
    if (!col) { cx.fillStyle = '#000'; cx.fillRect(tx - 2, i.mapH - 24, w, 12); }
    cx.fillStyle = '#fff'; cx.fillText(t, tx, i.mapH - 15);
    return;
  }
  blinkPoints(g).forEach((pts) => pts.forEach((pt) => {
    const x = i.sx(0) + u * pt.h - u / 2 + (pt.v % Math.max(1, Math.round(u))), y = i.sy(0) + u * pt.v - u / 2 + (pt.h % Math.max(1, Math.round(u)));
    if (x < 0 || y < 0 || x > i.mapW || y > i.mapH) return;
    cx.fillStyle = pt.on ? '#fff' : '#000'; cx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }));
  if (!BLINK.timer) BLINK.timer = setInterval(() => { // (the idle loop's flips; the map drawn again when one flipped)
    const g2 = G(); if (!g2 || !window.HOMAC301) return;
    let n = 0; blinkPoints(g2).forEach(pts => pts.forEach(pt => { if (Math.random() < 0.01) { pt.on = !pt.on; n++; } }));
    if (n && !document.querySelector('.scrim')) A().draw();
  }, 1000 / 6);
}
function drawStar301(cx, i) {
  const a = A(), g = i.G, s = i.s, col = COL301(), ME = i.ME, IMG = i.IMG;
  if (in2000(g)) { if (s.owner !== ME || s.id !== g.players[ME].homeStar) return 'all'; i = Object.assign({}, i, { x: a.map().w / 2, y: a.map().h / 2 }); }
  const u = i.view.s / 2, z = u > 17 ? u / 17 : 1; // (a modern convenience's closer zooms: the largest's layout, bigger)
  const h = i.x - u / 2, v = i.y - u / 2; // the star's cell
  let r; // the icon's square
  if (u >= 17) r = [h - 7 * z, v - 7 * z, h + 25 * z, v + 25 * z]; else if (u < 7) r = [h, v, h + u, v + u]; else r = [h - 1, v - 1, h + 15, v + 15];
  const big = u >= 17, small = u > 6 && u < 17;
  const ally = s.owner >= 0 && s.owner !== ME && H().isAllied(g, ME, s.owner) && H().know(g, g.players[ME], s.id).explored;
  // the halos
  if (big || small) {
    const id = col ? (i.sel && ally ? 508 : i.sel ? 502 : ally ? 504 : 0) : (i.sel ? 502 : 0);
    const pic = id && IMG['dos:p' + (small ? (id === 502 ? 503 : id + 1) : id)];
    if (pic && pic.width) { if (big) cx.drawImage(pic, r[0] - 12 * z, r[1] - 9 * z, 56 * z, 51 * z); else cx.drawImage(pic, r[0] - 5, r[1] - 5, 26, 26); }
    if (!col && ally) { cx.fillStyle = '#fff'; cx.beginPath(); const l = r[0] + 2, rr = r[2] - 2, t = r[1] - Math.trunc(u / 3), b = r[1] + Math.trunc(u / 6); cx.ellipse((l + rr) / 2, (t + b) / 2, (rr - l) / 2, (b - t) / 2, 0, 0, Math.PI * 2); cx.fill(); }
  }
  // the star
  if (u < 7) { cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, u / 2, u / 2, 0, 0, Math.PI * 2); cx.fill(); }
  else { const base = i.look && i.look.base, im = base && (small ? IMG[base.replace(/:i(\d+)$/, ':s$1')] : IMG[base]); if (im && im.width) cx.drawImage(im, r[0], r[1], r[2] - r[0], r[3] - r[1]); }
  if (s.owner === ME && s.abandon301) { cx.fillStyle = orPat(cx, GRAY, '#000'); cx.fillRect(r[0] - u / 2, r[1] - u / 2, r[2] - r[0] + u, r[3] - r[1] + u); }
  if (u < 7 && i.sel) { cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.strokeRect(r[0] - 2 + 0.5, r[1] - 2 + 0.5, r[2] - r[0] + 3, r[3] - r[1] + 3); }
  if (u > 6) {
    const here = g.fleets.filter(f => f.star === s.id && f.to == null), mine = here.filter(f => f.owner === ME);
    const sats = mine.filter(f => f.sat).length, others = here.some(f => f.owner !== ME);
    const ship = IMG['dos:s3114'], dy = u < 13 ? 8 : 10, dr = u < 13 ? 9 : 5;
    if (ship && ship.width && mine.some(f => !f.sat)) cx.drawImage(ship, r[2] - dr * z, r[1] - dy * z, 16, 16);
    if (ship && ship.width && others && (s.owner === ME || mine.length)) cx.drawImage(ship, r[0] + dr * z - 16, r[1] - dy * z, 16, 16);
    if (sats) { cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, (r[2] - r[0] - 1) / 2, (r[3] - r[1] - 1) / 2, 0, 0, Math.PI * 2); cx.stroke(); }
    cx.font = G9; cx.textAlign = 'left'; cx.letterSpacing = u === 9 ? '-1px' : '0px';
    const w = cx.measureText(s.name).width; cx.fillStyle = '#fff';
    cx.fillText(s.name, Math.trunc((r[0] + r[2]) / 2) - Math.trunc(w / 2), r[3] + 8 * z); cx.letterSpacing = '0px';
  }
  return 'all';
}
// DrawFleetPaths @15466e (when the Preferences' "Show Fleets Paths" is on, 'Stup' 1000 +0x5c, on by default; the remake has no 3.0.1 Preferences
// window, so always): for each of your fleets with a destination (+0xe) not marked for scrapping, a line 2 x 2 in the 50% grey pattern from where it
// is (its star, or between the two stars by the turns left, +0x12, of the trip's turns, the distance (+0x10) over the speed rounded up) to the
// destination star's middle: greenColor for colony ships, cyanColor for the others (0000 8000 11B0 and 0241 AB54 EAFF; black on a 1-bit screen,
// where they don't show on the black map).
function fleetPaths301(cx, i) {
  const g = i.G, col = COL301(), u = i.view.s / 2;
  cx.save(); cx.lineWidth = 2; cx.lineCap = 'butt';
  for (const f of g.fleets) {
    if (f.owner !== i.ME || f.scrap301) continue;
    const dest = f.to != null ? f.to : f.dest; if (dest == null) continue;
    const b = g.stars[dest]; let x1, y1;
    if (f.to != null) { const a0 = g.stars[f.from], t = Math.min(1, (f.prog || 0) / (f.dist || 1)); x1 = i.sx(a0.x + (b.x - a0.x) * t); y1 = i.sy(a0.y + (b.y - a0.y) * t); }
    else { x1 = i.sx(g.stars[f.star].x); y1 = i.sy(g.stars[f.star].y); }
    const colony = H().fleetDesigns(g, f).some(d => d.type === 'colony');
    cx.strokeStyle = col ? orPat(cx, GRAY, colony ? '#008011' : '#02abea') : 'rgba(0,0,0,0)';
    cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(i.sx(b.x), i.sy(b.y)); cx.stroke();
  }
  cx.restore();
}
// MapLine @151ac6, drawn by FollowPathDrag while a fleet is dragged to a star: XORed (white on the black map), 2 x 2, solid when the fleet can go
// (else the light grey pattern); an arrowhead at the star (DetermineArrowTips: (8, 14) and (8, -14) turned to the line, 16 long at 30 degrees), and
// one at the fleet's star too for a round trip; the leg's distance (%d) in white on a black box beside its middle (left of it when the line runs
// down to the left or up to the right, 5 pixels off; base line 5 above the middle).
function dragLine301(cx, d) {
  if (!d.star) return true;
  // (a route through your colonies, DeterminePath: MapLine draws each leg with its distance, the arrowhead at the destination)
  if (d.legs && d.legs.length > 2) {
    let r = true;
    for (let i = 1; i < d.legs.length; i++) { const A0 = d.legs[i - 1], B0 = d.legs[i], last = i === d.legs.length - 1; r = dragLine301(cx, { star: true, ok: true, x1: A0.x, y1: A0.y, x2: B0.x, y2: B0.y, dist: B0.dist, round: false, noHead: !last }) && r; }
    return r;
  }
  cx.save(); cx.lineWidth = 2; cx.strokeStyle = d.ok ? '#fff' : orPat(cx, LTGRAY.map(r => r), '#fff');
  cx.beginPath(); cx.moveTo(d.x1, d.y1); cx.lineTo(d.x2, d.y2); cx.stroke();
  const head = (xa, ya, xb, yb) => { const ang = Math.atan2(ya - yb, xa - xb); cx.beginPath(); for (const sgn of [-1, 1]) { cx.moveTo(xb + 16 * Math.cos(ang + sgn * 0.52), yb + 16 * Math.sin(ang + sgn * 0.52)); cx.lineTo(xb, yb); } cx.stroke(); };
  if (d.ok && !d.noHead) head(d.x1, d.y1, d.x2, d.y2);
  if (d.round) head(d.x2, d.y2, d.x1, d.y1);
  if (d.dist != null) {
    const t = String(d.dist); cx.font = G9; cx.textAlign = 'left'; const w = cx.measureText(t).width;
    const mx = Math.trunc((d.x1 + d.x2) / 2), my = Math.trunc((d.y1 + d.y2) / 2), lx = (d.x2 - d.x1) * (d.y2 - d.y1) < 0 ? mx - 5 - w : mx + 5;
    cx.fillStyle = '#000'; cx.fillRect(lx - 2, my - 14, w + 3, 10); cx.fillStyle = '#fff'; cx.fillText(t, lx, my - 5);
  }
  cx.restore();
  return true;
}
// DrawAnnounceBubble @1618cc, from DrawGalaxyMap while reports are unread: the bubble's region (GrowMapWin: the map's bottom left, 3 in, 185 x 79)
// filled with PICT 5030 (colour) or 5530 (black and white: the extractor's p5530 in either skin); the report's icon (GetIconID) 32 x 32 at (18, the
// middle less 24), DrawSpecial over it; the sentence wrapped (MyTextBox) from (58, 8) to the right edge less 10; "more…" (STR# 4000.22) at (18, the
// foot less 5) while more reports follow. EndTurnButtonShowing @151f36: once they are read and the turn is not ended, PICT 5000 / 5500 at (3, 2) on
// the map. (The classic page's bubble and button, dressed: html.mac301, js/skins/mac12/panel.css.)
function afterMsg301(box, info) {
  const card = box.querySelector('.card:not(.end):not(.waiting)'), a = A();
  box.classList.toggle('et301', !!box.querySelector('.clock'));
  if (!card) return;
  card.classList.add('bub301');
  const bg = a.IMG['dos:p5530']; if (bg && bg.src) card.style.backgroundImage = `url("${bg.src}")`;
  const c = card.querySelector('.count'); if (c) { c.textContent = info.idx + 1 < info.inbox.length ? (STR301(4000)[21] || 'more…') : ''; c.setAttribute('translate', 'no'); card.append(c); }
  const m = info.inbox[info.idx], ic = card.querySelector('img.icon');
  const sp = m && ic ? special301(String(m.text || '')) : null;
  if (sp) { const w = a.el('span', { class: 'ric301' }); ic.replaceWith(w); w.append(ic); if (sp === 'cross') w.append(a.el('span', { class: 'x301' })); else { const im = a.IMG[sp]; if (im && im.src) w.append(a.el('img', { class: 'sp301', src: im.src, alt: '' })); } }
}
function menuName12(name) {
  if (name !== 'Edit') return name;
  const sp = document.createElement('span'), set = () => { sp.textContent = window.HOUI && HOUI.t ? HOUI.t('Edit') : 'Edit'; };
  sp.setAttribute('translate', 'no'); set(); if (window.HOUI && HOUI.onChange) HOUI.onChange(set);
  return sp;
}
// the remake's commands that 1.2 has no menu item for (Import, Export, the Halls, Auto play, Players ...) go to the Ho! menu
function menus12(M, ho) {
  ITEMS = {};
  for (const k in M) for (const x of M[k]) if (x[0] !== '-' && typeof x[0] === 'string') ITEMS[x[0]] = x;
  const own = new Set(['New game…', 'Quit to title', 'Build ships at selected colony…', 'Review battle…', 'List all fleets…', 'Scrap ship types…', 'Next fleet',
    'List explored stars…', 'Fix spending', 'Report window…', 'Zoom in', 'Zoom out', ...(V2 || V3 ? ['Compare players…', 'Send a message…', 'Force end turn…', 'Auto play…', 'End turn and switch players'] : []),
    ...(V3 ? ['Players and history', 'Players and alliances…', 'Give money or metal…', 'Dip into savings…', 'Preferences…', 'Hall of Fame…', 'Hall of Shame…'] : [])]);
  const extra = [];
  for (const k in M) { for (const x of M[k]) if (x[0] !== '-' && !(typeof x[0] === 'string' && own.has(x[0]))) extra.push(x); M[k].length = 0; }
  // (View's sound and music, Help's How to play and the manual stay reachable)
  // (3.0.1's About box: DLOG 1100 / 1101, PICT 1000 / 1001, which the skins have as p1001)
  ho.unshift([V4 ? 'About Spaceward Ho! 4.0…' : V3 ? 'About Spaceward Ho! 3.0…' : V2 ? 'About Spaceward Ho! 2.0…' : 'About Spaceward Ho! 1.2…', aboutBox], ['-']);
  // (each command is the remake's own: a window it opens is tagged at once, which is what keeps 1.2's own windows out of the remake's look;
  // the Ho! menu's own items too: Skin and OS look, Sounds, Language, Temperatures)
  const tagged = (x) => { const f = x[1], y = x.slice(); y[1] = (...a) => { const r = f(...a); tagRemakeWindows(); return r; }; return y; };
  for (let i = 0; i < ho.length; i++) if (ho[i][0] !== '-' && typeof ho[i][1] === 'function') ho[i] = tagged(ho[i]);
  if (extra.length) ho.push(['-'], ...extra.filter(x => !(typeof x[0] === 'function' && (V3 ? /scrap|organize|organi|switch players|surrender|armageddon/i : /scrap|organize|organi|switch players/i).test(String(x[0]())))).map(tagged));
}
// (DoBattleStage: with Review Event Battles on, the battles you were in are shown during the update, before the reports: 1.2, 2.0.1 and 3.0.1)
function afterTurn12(go) {
  const a = A(), g = G();
  if (!own() || !a.prefReview()) return go();
  const list = g.battles.slice(LASTB).filter(b => b.sides.includes(a.ME));
  for (const m of a.me().inbox || []) if (m.battle && list.some(b => b.id === m.battle)) m._reviewed = true;
  const next = () => {
    const b = list.shift(); if (!b) return go();
    a.openBattle(b.id);
    const wait = setInterval(() => { if (!document.querySelector('.scrim')) { clearInterval(wait); next(); } }, 200);
  };
  next();
}
// 3.0.1 (js/skins/mac3): only the arrangement and the shared windows, above; the rest of this file is 1.2's and 2.0.1's
if (V3) {
  document.documentElement.classList.add('mac301'); if (V4) document.documentElement.classList.add('mac405');
  // (the battle window's canvas text needs its bitmap faces loaded before its first frame)
  try { if (document.fonts) { document.fonts.load(SYS3); document.fonts.load(GEN93); if (V4) { document.fonts.load("12px 'DOS Geneva 9 Bold'"); document.fonts.load("12px 'DOS Geneva 9'").then(() => { const a = A(); if (a && a.G) a.renderPanel(); }); } } } catch (e) { /* (an old browser draws with the fallbacks) */ }
  window.HOMAC301 = {
    get ownPanel() { return !!G() && own(); },
    // (the New Game window, for 3.0.1's own rules: its Create New Galaxy dialog over the form)
    newGame(f) { createGalaxy301(f); },
    // the battle window: DLOG 7010 / 7011 are 2.0.1's and HaveGroupShoot the same code; 3.0.1's own drawing in battleWindow (V3)
    battleWindow: (b, k) => (own() ? battleWindow(b, k) : false),
    // (the program's own battle window with modern conveniences on too: Jake, 18 Nov, the remake's looked wrong in this skin)
    battleWindowAlways: true,
    // (3.0.1 works the battles out during the update without showing them: DoBattleStage passes 0 to DoOneBattle; each is shown as its
    // report is announced, GoToNextAnnouncement @161bc8 -> DoMessageAction @161e44 -> ReviewBattle, with Review Event Battles on (Stup
    // +0x46, default 1). Jake, 18 Nov: "Year XXXX", then the battle as its card comes up. 1.2 and 2.0.1 keep afterTurn12.)
    // (Object.assign copies these onto the theme: functions, so they ask at the time)
    battleBeforeCard: () => own(),
    afterTurn: (go) => go(),
    // the windows 3.0.1 draws with its own routines (docs/status-301.md, "Windows from the menus")
    window(name, ...x) {
      if (!G() || !own()) return false;
      if (name === 'fleets') return fleets301();
      if (name === 'build') return build301(x[0]);
      if (name === 'give') return give301();
      if (name === 'chat') return chat301();
      if (name === 'organize' || name === 'group') return organize301(x[0]);
      return false;
    },
    // the status window (DLOG 7000, the same items as 2.0.1's: "Writing New Game File..." (STR# 4000.1) while the new galaxy is written,
    // then "Pass 1 for Player %d..." and the rest while a turn is worked out; Jake's captures 017-019, 169-174), and the play-alone question
    beforeFirstTurn(go) {
      if (!own()) return false;
      const a = A(), n = G().players.length, txt = STR301(4000)[0] || 'Writing New Game File...', bar = status20(txt, n);
      a.modal('', bar.box, { cls: 'small mac12 dl20w', label: txt });
      let i = 0; const step = () => { if (++i > n) { a.closeModal(); go(); return; } bar.value = i; setTimeout(step, 60); }; setTimeout(step, 60);
      return true;
    },
    turnProgress(g, go) {
      LASTB = g.battles.length;
      if (!own()) return go();
      if (g.year === 2000 && !g.alone301 && g.players.filter(p => p.human).length < 2 && H().rules(g).id === '301') return playAlone301(g, () => turnProgress(g, go));
      turnProgress(g, go);
    },
    panel(panel, B) { if (G() && own()) panel301(panel, B); requestAnimationFrame(measureMac); },
    // the map: 2.0.1's zooms, cells and scroll bars (the same code), 3.0.1's own drawing (above)
    zoomTo: (s0, f) => (own() ? zoomTo(s0, f) : Math.max(12, Math.min(140, s0 * f))),
    mapInset: () => (barsOn() ? [BAR12 * MACS.s, BAR12 * MACS.s] : [0, 0]),
    mapPixel: macPixel,
    modernPan: () => barsOn(),
    syncView: syncMapView, afterDraw: updateBars, centerOnStar: centerOnStar12,
    zoomed: (i) => { if (barsOn() && i.menu) MB.centerSel = true; },
    fitView(v, c) { if (!own()) return; const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = zooms()[3]; if (st) { barMetrics(v.s, c.mapW, c.mapH, c.G); const [h0, v0] = centerCells(st, c.G); putCell(v, h0, v0); } },
    mapBg: '#000', bgStars: false, transitDots: false,
    routes: false, routesOver: true,
    fleetPaths: (cx, i) => { if (own()) fleetPaths301(cx, i); },
    afterMsg: (box, info) => { if (own()) afterMsg301(box, info); },
    dragRoute: (cx, d) => (own() ? dragLine301(cx, d) : false),
    mapUnder: (cx, i) => { if (own()) mapUnder301(cx, i); },
    drawStar: (cx, i) => (own() ? drawStar301(cx, i) : false),
    // your selected fleet is picked up from its star, as FollowPathDrag does (an unseen handle over the star's icon); no markers are drawn
    marker: () => 'none',
    // the menus (menuLayout301 above); the remake's commands that 3.0.1 has no item for go to the Ho! menu, as in 1.2's and 2.0.1's
    menus: (M, ho) => menus12(M, ho),
    get menuLayout() { return menuLayout(); },
    menuLayoutNow() { return menuLayout(); },
    menuName: (name) => menuName12(name),
    // (a Mac menu's key equivalent is ⌘ and the key, as the MENU resources and every capture have it; the DOS skin under this one writes "[N]")
    keyName: (k) => '⌘' + k,
    markerAt(f, i) { if (!own() || !i.mine) return null; const a = A(), here = a.fleetOrder(a.G.fleets.filter(x => x.owner === a.ME && x.star === i.s.id && x.to == null)), cur = here.find(x => x.id === a.UI.selFleet) || here[0]; if (!cur || f.id !== cur.id) return null; const u = i.view.s / 2, d = u >= 17 ? 32 * Math.max(1, u / 17) : u < 7 ? u + 4 : 16; return { x: i.x - d / 2, y: i.y - d / 2, w: d, hidden: true }; },
  };
  document.addEventListener('keydown', keyEquiv);
  return;
}
window.HOMAC12 = {
  alertBox: (paras) => { const b = G() && own12Rules() ? alert20(paras) : null; if (b) b.setAttribute('translate', 'no'); return b; },
  battleWindow,
  battleWindowAlways: true,
  // (the Edit menu's French title is 1.2F's "Edition", which the interface would take for its English word "Edition": written as it is)
  menuName: (name) => menuName12(name),
  keyName: (k) => '⌘' + k,
  // (NewGame @100004: the status window "Ecriture nouveau fichier Jeu..." (STR# 4000.1; Mac 2.0.1 "Writing New Game File...") while the
  // galaxy file is written, its bar moving once a player)
  beforeFirstTurn(go) {
    if (!own()) return false;
    const a = A(), el = a.el, n = G().players.length, txt = lang() === 'fr' ? 'Ecriture nouveau fichier Jeu...' : 'Writing New Game File...';
    const bar = status20(txt, n);
    a.modal('', bar.box, { cls: 'small mac12 dl20w', label: txt });
    let i = 0; const step = () => { if (++i > n) { a.closeModal(); go(); return; } bar.value = i; setTimeout(step, 60); }; setTimeout(step, 60);
    return true;
  },
  // Mac 2.0.1's PlayAnnounceSound @130eb0 (the jump table of 1000 + 0 to $39): 2000 for the technology levels (1002-1006), the new year (1010) and 1028, 1032, 1054,
  // 1057; 2001 for 1009, 1055, 1056; 3002 for 1011; none for 1000, 1001, 1033-1035; the system beep for every other report (1.2's table also had 1020, a fleet lost in a
  // wormhole, and 1059 at 2001)
  sysBeep: (g) => V2 && !!g && H().rules(g).id === 'mac20',
  // The report pictures are the DOS skin's choices (1.2's and 2.0.1's icons are the DOS game's), from this skin's own folder: black and white in the
  // black-and-white skins (HOTHEME.base is the DOS skin's; without it the reports showed 5.0.5's colour pictures, m9020 ...). 2.0.1's sounds below.
  messageLook(m, cur, ctx) {
    const B = window.HOTHEME && HOTHEME.base && HOTHEME.base.messageLook, look = B && ctx ? B.call(window.HOTHEME, m, cur, ctx) : null;
    if (!V2 || !G() || H().rules(G()).id !== 'mac20') return look;
    const R = H().REPORTS20 || [];
    const t = String(m.text || '');
    if (!HOMAC_RE20) HOMAC_RE20 = R.map((x, i) => ({ i, re: new RegExp('^' + x.split(/(%(?:\.\*|\d*\.?\d*)?[sd]|%%)/).map((y, j) => j % 2 ? (y === '%%' ? '%' : '.*?') : y.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')), len: x.length })).filter(o => o.len > 8).sort((a, b) => b.len - a.len);
    const hit = HOMAC_RE20.find(o => o.re.test(t));
    const code = hit ? 1000 + hit.i : 9999;
    const snd = [1002, 1003, 1004, 1005, 1006, 1010, 1028, 1032, 1054, 1057].includes(code) ? 2000 : [1009, 1055, 1056].includes(code) ? 2001 : code === 1011 ? 3002 : null;
    return { icon: look ? look.icon : cur.icon, sound: snd };
  },
  // (the New Game window, for 2.0.1's own rules: its Create New Galaxy dialog over the form)
  newGame(f, ctx) { if (V2) createGalaxy20(f, ctx); },
  zoomTo: (s, f) => (own() ? zoomTo(s, f) : Math.max(12, Math.min(140, s * f))),
  // the map window's scroll bars and the whole-cell scrolling they give (above); dragging the map with a mouse and the wheel are modern conveniences
  mapInset: () => (barsOn() ? [BAR12 * MACS.s, BAR12 * MACS.s] : [0, 0]),
  mapPixel: macPixel,
  // no fleet markers on the map, as 1.2 and 2.0.1 draw none (Jake's captures: fleets at Gemini, nothing beside it; the remake's markers boxed the
  // selected fleet's ship in yellow): the selected fleet is picked up from its star by an unseen handle, as FollowPathDrag does (3.0.1's markerAt)
  // (getters: under a later version's rules this skin keeps the remake's markers)
  get marker() { return own() ? () => 'none' : undefined; },
  get markerAt() { return own() ? (f, i) => { if (!i.mine) return null; const a = A(), here = a.fleetOrder(a.G.fleets.filter(x => x.owner === a.ME && x.star === i.s.id && x.to == null)), cur = here.find(x => x.id === a.UI.selFleet) || here[0]; if (!cur || f.id !== cur.id) return null; const u = i.view.s / 2, d = u >= 17 ? 32 * Math.max(1, u / 17) : u < 7 ? u + 4 : 16; return { x: i.x - d / 2, y: i.y - d / 2, w: d, hidden: true }; } : undefined; },
  modernPan: () => barsOn(),
  syncView: syncMapView, afterDraw: updateBars, centerOnStar: centerOnStar12,
  zoomed: (i) => { if (barsOn() && i.menu) MB.centerSel = true; },
  fitView(v, c) { if (!own()) return; const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = zooms()[3]; if (st) { barMetrics(v.s, c.mapW, c.mapH, c.G); const [H, V] = centerCells(st, c.G); putCell(v, H, V); } },
  mapNames: (s) => (own() ? zoomIdx(s) > 0 : s > 18),
  // (DrawOneBWStarSubProc @c38ce: at the second zoom the names are drawn condensed, TextFace 0x20: a pixel less between letters)
  // (StarLine: the line while a fleet is dragged, and a fleet's orders)
  // (FollowPathDrag @c69d6: PickStar under the pointer, a line only to a star)
  routesOver: true,
  // MapLine @c6f7e is called only from FollowPathDrag @c69d6 (the same code in 1.2F and 2.0.1): a route line shows only while a fleet is dragged, and every capture of one has the pointer at its tip; a line that stays is a modern convenience
  routesDragOnly: true,
  dragRoute(cx, d) { if (!own()) return false; if (!d.star) return true; return starLine(cx, { x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, ok: d.ok, round: d.round, turns: d.turns, dist: d.dist }); },
  routeLine(cx, d) { if (!own()) return false; return starLine(cx, { x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, ok: true, round: d.round, turns: d.turns, dist: d.dist }); },
  nameStarLayout,
  // (ALRT 5040 / 5041: "Congratulations! You have conquered the galaxy!" with PICT 3030 / 3530 and OK; ALRT 5050 / 5051: "Unfortunately, you have been
  // eliminated from the game…" with PICT 3040 / 3540 and "Oh, well…": the colour ones are the odd ids)
  youWonLayout(kind, Y, done) {
    if (!own() || !G() || !own12Rules()) return false;
    // (1.2F: 5040 / 5050 name PICT 3030 / 3040 of its lost colour pictures' file; 5041 / 5051 name 3530 / 3540, which its own file has: Jake's System 6 shot168)
    const col = !V2 || window.HOMAC2_COLOUR ? 1 : 0;
    alertById20(String((kind === 'won' ? 5040 : 5050) + col), [Y.text], Y.ok, done); return true;
  },
  mapNameStyle(cx, s) { cx.letterSpacing = own() && zoomIdx(s) === 1 ? '-1px' : '0px'; },
  drawStar(cx, i) { if (!own() || zoomIdx(i.view.s) > 0) return false; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(i.x, i.y, 2.5, 0, Math.PI * 2); cx.fill(); return 'all'; },
  lettersPickStars: true,
  // (the planet box without the remake's own additions: classic ui planetBox)
  ownPanel: true,
  turnProgress(g, go) { LASTB = g.battles.length; if (!own()) return go(); turnProgress(g, go); },
  // (DoBattleStage @d0004: with Voir batailles on, the battles you were in are shown during the update, before the reports)
  afterTurn: (go) => afterTurn12(go),
  panel(panel, B) { if (own()) panel12(panel, B || {}); requestAnimationFrame(measureMac); },
  // End Turn at the map's top left (as the 3.0.1 skins: html.macfam #msg.et301)
  afterMsg: (box) => { box.classList.toggle('et301', !!box.querySelector('.clock')); },
  // the program's own windows, in English and French (another language keeps the remake's)
  confirm: (text, yes, labels) => ask12(text, yes, labels),
  window(name, ...x) {
    if (G() && name === 'players') return playersWindow();
    if (G() && name === 'ranks') return ranksWindow();
    if (G() && name === 'give') return give12();
    if (G() && name === 'forceend' && V2 && H().rules(G()).id === 'mac20') return forceEnd20(x[0], x[1]);
    if (G() && name === 'chat') return V2 && H().rules(G()).cannedChat && H().rules(G()).cannedChat.style === 'steps' ? chat20() : chat12();
    if (G() && name === 'radical') return radical12();
    if (G() && name === 'autoplay') return V2 ? autoPlay20() : autoplay12();
    if (G() && name === 'dip') return dip12();
    if (G() && name === 'surrender') return surrender12();
    if (!G() || !own()) return false;
    if (name === 'types') return V2 ? shipTypes20() : shipTypes();
    if (name === 'fleets') return fleetsStatus();
    if (name === 'stars' && H().rules(G()).exploredList && H().rules(G()).exploredList.layout === 'mac') return stars6040();
    if (name === 'build') return buildShips(x[0]);
    return false;
  },
  menus: (M, ho) => menus12(M, ho),
  get menuLayout() { return menuLayout(); },
  // (the menus laid out again when the OS look changes ask for this: without it they took the DOS skin's, js/skins/dos/ui.js, with no New and no Edit
  // menu: Jake's 1.2 game in the System 7 look, 17 Nov 2026)
  menuLayoutNow() { return menuLayout(); },
};
// key equivalents: ⌘ or Ctrl and the item's key, as the menus show them (a browser keeps some of them, ⌘N, ⌘W, ⌘T, ⌘Q, for itself)
function keyEquiv(e) {
  if (!(e.metaKey || e.ctrlKey) || e.altKey || !A() || !G() || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  const L = menuLayout();
  for (const k in L) for (const x of L[k]) {
    if (x === '-' || !x[5] || x[5].toLowerCase() !== e.key.toLowerCase()) continue;
    if (x[4] && x[4]()) return;
    e.preventDefault(); x[1](); return;
  }
}
document.addEventListener('keydown', keyEquiv);
})();
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac3/pictures.js' + (window.HO_BUILD || '') + '"><\/script>');
