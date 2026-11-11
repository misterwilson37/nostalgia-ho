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
window.HOMAC_VERSION = window.HOMAC2 ? '2.0.1' : '1.2'; // (the Mac 2.0.1 skins, js/skins/mac2, load this file: 2.0.1 is 1.2's program with additions)
(function () {
'use strict';
const V2 = window.HOMAC_VERSION === '2.0.1';
let HOMAC_RE20 = null;
const A = () => window.HOAPI;
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
const zoomIdx = (s) => { let b = 0; ZOOMS.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(ZOOMS[b] / s))) b = i; }); return b; };
function zoomTo(s, f) {
  const cur = zoomIdx(s);
  let i = zoomIdx(s * f);
  if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1);
  return ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i))];
}
const atZoom = (k) => { const a = A(); return !!a && zoomIdx(a.UI.view.s) === k; };

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
function menuLayout() { const M = menuLayout12(); return V2 ? menuLayout20(M) : M; }
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
    it('I’ll Update Turns', () => {}, { ghost: gone }), '-', it('Set Polling Time…', () => pollingTime20(), { ghost: noGame }), speed, '-', shows, review, warn, snd, ...extra];
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
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoom(3), key: '=' }),
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
      it('Tech Spending Window', () => { const t = document.querySelector('#panel .box.tech, #panel section:nth-of-type(3)'); if (t) t.scrollIntoView({ block: 'nearest' }); }, { ghost: noGame, key: '1' }),
      it('Report Window', () => { const r = own() && document.querySelector('#panel .rep12box'); if (r) { r.scrollIntoView({ block: 'nearest' }); const li = r.querySelector('li[data-now]') || r.querySelector('li'); if (li) li.focus(); } else A().openReports(); }, { ghost: noGame, key: '2' }),
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

// DLOG 6000 "List Ship Types…" (ListShipTypes @110fc0, InitShipTypesList, SetShipTypeAttrs @11153c, doRenameTypeDialog @11170e)
function shipTypes(selId) {
  const a = A(), el = a.el, p = a.me(), rs = H().rules(G());
  const ds = p.designs.filter(d => !d.scrapped);
  if (!ds.length) return true;
  let cur = ds.find(d => d.id === selId) || ds[ds.length - 1];
  const list = el('div', { class: 'lb', role: 'listbox' }), info = el('div', { class: 'tinfo' });
  const show = () => {
    list.innerHTML = '';
    for (const d of ds.slice().reverse()) list.append(raw('div', desc0(d), { class: 'li' + (d === cur ? ' sel' : ''), role: 'option', onclick: () => { cur = d; show(); } }));
    const c = H().designCost(G(), cur);
    info.innerHTML = '';
    const pic = a.shipImgEl(cur, 48);
    const r = (label, v) => el('div', { class: 'kv' }, el('span', null, label), raw('b', String(v)));
    info.append(pic, r('Name:', cur.name), r('Class:', cls(cur.type)), r('Development Cost:', '$' + nice(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0))),
      r('Production Cost:', '$' + nice(c.money)), r(lang() === 'fr' ? raw('span', 'Coût en métal:') : 'Metal Cost:', nice(c.metal)),
      r('Range', cur.R), r('Speed', cur.V), r('Weapons', cur.W), r('Shields', cur.S), r('Mini', cur.M),
      r('# Built:', nice(cur.built || 0)), r('#Existing:', nice(shipCount(cur.id))),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: cur.scrap301 ? 'checked' : false, onchange: (e) => { if (rs.flagScrapDesign) { rs.flagScrapDesign(G(), p, cur, 'command'); a.save(); show(); return; }
          // (a ruleset that marks nothing, Gemini: scrapped at once, after the question the classic window asks)
          e.target.checked = false; const n = shipCount(cur.id); a.confirmBox(`Scrap this ship type and all ${n} existing ship${n === 1 ? '' : 's'} of it?`, () => { const m = H().scrapDesign(G(), a.ME, cur.id); a.Sound.play(7003); a.toast(`Scrapped 1 type for ${a.fmt(m)} metal.`); a.renderPanel(); a.draw(); a.save(); show(); }); } }), el('span', null, 'Scrap This Type')),
      el('div', { class: 'btns' }, btn('Rename', () => renameType(cur))));
  };
  show();
  win(el('div', { class: 'types12' }, list, info, el('div', { class: 'btns right' }, btn('OK', () => a.closeModal()))));
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
  a.modal('', dlog20(430, 301, list, pane, put20(el('button', { type: 'button', class: 'ok20', onclick: () => renameType(cur) }, raw('span', 'Rename')), [271, 253, 291, 311]),
    put20(el('button', { type: 'button', class: 'ok20', onclick: () => a.closeModal() }, raw('span', 'OK')), [271, 343, 291, 401])), { cls: 'mac12 dl20w', label: 'List Ship Types' });
  return true;
}
const put20 = (n, r) => { n.setAttribute('style', (n.getAttribute('style') || '') + ';' + at20(r) + ';min-width:0;padding:0'); return n; };
// DLOG 6090: a type's new name, 15 letters at most (a beep past them), "Name It" draws one from the list
function renameType(d) {
  const a = A(), el = a.el;
  const inp = el('input', { maxlength: 15, value: d.name, 'aria-label': 'New Ship Name', onkeydown: (e) => { if (e.key.length === 1 && inp.value.length >= 15 && inp.selectionStart === inp.selectionEnd) { a.beep && a.beep(); } } });
  inp.setAttribute('translate', 'no');
  win(el('div', null, el('p', null, 'Type your new ship name or click on “Name It” for a suggestion:'), inp,
    el('div', { class: 'btns' }, btn('Name It', () => { inp.value = H().designName(G(), a.me(), d.type); }), btn('Cancel', () => shipTypes(d.id), { class: 'quiet' }),
      btn('OK', () => { const n = inp.value.trim(); if (n) { d.name = n.slice(0, 15); a.save(); a.renderPanel(); } shipTypes(d.id); }))), 'small');
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
  const a = A(), el = a.el, W = FLEET_LINES[lang()], g = G();
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
  let cur = null;
  const list = el('div', { class: 'lb', role: 'listbox' });
  const show = () => { list.innerHTML = ''; for (const f of order) list.append(raw('div', line(f), { class: 'li' + (f === cur ? ' sel' : ''), role: 'option', onclick: () => { cur = f; show(); }, ondblclick: go })); };
  function go() {
    if (!cur) return;
    if (cur.to != null) { alertBox([W.hyper]); return; }
    a.UI.selFleet = cur.id; a.UI.sel = cur.star; a.closeModal(); a.centerOn(cur.star); a.renderPanel(); a.draw();
  }
  show();
  win(el('div', null, el('p', null, 'List of All Fleets:'), list, el('div', { class: 'btns right' }, btn('Go To Fleet', go, { class: 'quiet' }), btn('OK', () => a.closeModal()))));
  return true;
}
// an alert over what is open (the dialog stays under it), in the program's words; its picture 3020 is the skin's
// Mac 2.0.1's alerts (ALRT size and DITL: text, picture and button rectangles, from the resource fork; made by audit/mac-2.0.1 of the private repo): an alert is drawn at those rectangles,
// the words being the paragraphs the page gives (the same lines) in the order of the DITL's text items
const ALERTS20 = {"128":[432,160,[["b",[123,312,143,402],"OK"],["t",[13,84,45,406],"Sorry ^0 requires the follow things to be able to run:"],["t",[58,110,74,380],"• ^1 CPU or better"],["t",[74,110,90,380],"• System Software ^2 or later"],["t",[90,110,106,380],"• ^3"]]],"2000":[230,172,[["b",[143,91,163,220],"Return To Finder"],["t",[26,26,128,224],"Sorry, but this is a development version of Spaceward Ho! 2.0 that's past it's prime. To get a newer copy, call Delta Tao Software, Inc. at (408) 730-9336."]]],"2010":[282,200,[["b",[169,156,189,253],"Play in B/W"],["p",[117,26,191,100],3010],["t",[13,13,48,279],"Sorry, but Spaceward Ho! 2.0 requires 32-bit Color Quickdraw to run in color."],["t",[52,13,106,278],"You can obtain Color Quickdraw from any Apple dealer for a nominal charge."]]],"3000":[240,228,[["b",[195,169,215,227],"OK"],["t",[39,26,71,227],"^0"],["t",[117,26,149,226],"File: ^1"],["t",[78,26,110,227],"Error Type: ^2"],["t",[156,26,172,225],"Error Code: ^3"],["t",[13,91,29,166],"File Error"]]],"3001":[237,210,[["b",[182,169,202,227],"OK"],["t",[39,26,71,227],"^0"],["t",[78,26,110,227],"Error Type: ^2"],["t",[117,26,133,225],"Error Code: ^3"],["t",[13,78,30,200],"Memory Error"],["t",[143,26,175,226],"Please quit Spaceward Ho! and start again."]]],"3010":[235,159,[["b",[130,169,150,227],"OK"],["p",[78,13,152,87],3020],["t",[13,13,65,229],"Sorry, but that is not the correct password for “^0”. Please try again."]]],"3020":[240,149,[["b",[117,169,137,227],"OK"],["t",[13,13,48,236],"Sorry, but this galaxy is already full. No more players can join."],["p",[65,13,139,87],3020]]],"3030":[232,180,[["b",[143,156,163,214],"OK"],["p",[91,26,165,100],3010],["t",[13,26,77,223],"Sorry, but Spaceward Ho! 2.0 can't read galaxy files created with versions 1.0 - 1.1.2."]]],"3040":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,49,212],"Please name your new ship type."],["p",[60,10,134,84],3020]]],"3050":[218,150,[["b",[110,150,130,208],"OK"],["t",[10,10,49,212],"Please set your new ship type’s tech levels."],["p",[60,10,134,84],3020]]],"3060":[301,206,[["b",[162,207,182,265],"OK"],["t",[13,13,80,290],"Sorry, but the name you just typed in doesn’t match any of those in this game. And since the game has  progressed past the year 2000, it’s too late to join…"],["p",[120,17,194,91],3020],["t",[92,13,112,284],"Maybe you typed your name in wrong?"]]],"3070":[335,210,[["b",[143,223,163,292],"Continue"],["b",[143,117,163,186],"Wait"],["p",[117,13,191,87],3020],["t",[13,13,46,327],"^0, all of the ^1 currently registered players have finished their first turn. "],["t",[52,13,92,328],"Should we continue with the game, or wait for more human players to join?"]]],"3080":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,98,232],"All currently registered players have ended their first turn. We’re waiting for the game administrator to give his okay to continue…"]]],"3090":[236,132,[["t",[10,14,74,223],"^0’s Star System “^1” has had a revolution, and is now under your control."],["b",[100,157,120,215],"OK"]]],"3100":[236,132,[["t",[10,14,74,223],"^0 has offerred ^1 units of metal for ^2 dollars."],["b",[100,157,120,215],"OK"]]],"3110":[236,132,[["t",[10,14,74,223],"You have found an additional ^0 units of metal on ^0."],["b",[100,157,120,215],"OK"]]],"3120":[236,132,[["t",[10,14,74,223],"Your fleet of ^0 ^1 unexpectedly disappeared in hyperspace on their way to ^2."],["b",[100,157,120,215],"OK"]]],"3130":[236,132,[["t",[10,14,74,223],"^0 has gone nova.  Everything there has been destroyed."],["b",[100,157,120,215],"OK"]]],"3140":[236,132,[["t",[10,14,74,223],"Your Terraforming Technology has reached level ^0."],["b",[100,157,120,215],"OK"]]],"3150":[236,132,[["t",[10,14,74,223],"^0 has turned all his planets over to your control.  "],["b",[100,157,120,215],"OK"]]],"3160":[236,132,[["t",[10,14,74,223],"You have destroyed the Star System ^0, previously owned by ^1."],["b",[100,157,120,215],"OK"]]],"3170":[236,132,[["t",[10,14,74,223],"You have stolen ^0 Technology from ^1.  Your Tech level is now ^2."],["b",[100,157,120,215],"OK"]]],"3180":[233,177,[["b",[143,143,163,210],"OK"],["t",[13,13,84,224],"Sorry, your turn can’t be saved. Although you are in the year ^0, the game has already been updated to ^1…"],["p",[91,13,165,87],3020]]],"3190":[237,161,[["b",[104,156,124,214],"OK"],["p",[65,26,139,100],3020],["t",[13,26,66,224],"The game has been updated to the year ^0. Click “OK” to go to the next turn…"]]],"3200":[234,185,[["b",[143,156,163,214],"OK"],["t",[13,13,93,232],"Sorry, but the file was busy and your new auto play setting was not changed. Please try again shortly."],["p",[104,13,178,87],3020]]],"3210":[335,210,[["b",[143,222,163,299],"Force End"],["b",[143,117,163,194],"Wait"],["p",[117,13,191,87],3020],["t",[13,13,46,327],"^0, ^1 of the ^2 players haven’t finished their turn yet. "],["t",[52,13,92,328],"Do you really want to force an end of turn, or do you want to wait for them to finish?"]]],"3220":[238,201,[["b",[154,156,174,214],"OK"],["p",[102,26,176,100],3020],["t",[13,26,84,230],"Sorry, but the file way busy and the turn could not be marked “done”. Please try again in a moment."]]],"3230":[286,190,[["b",[145,188,165,257],"Continue"],["b",[145,110,165,168],"Wait"],["p",[99,13,173,87],3020],["t",[13,13,52,268],"^0, do you want to play alone, or wait for more humans to join?"],["t",[64,13,84,264],"(Computer Opponents: ^1)"]]],"3240":[230,182,[["b",[125,156,145,214],"OK"],["t",[13,13,80,220],"Auto play has been turned off, but your current turn has already been marked “done.” Update may occur at any time."],["p",[86,13,160,87],3020]]],"3250":[216,137,[["b",[78,143,98,201],"OK"],["t",[13,26,45,211],"Please unlock this disk and try again."],["p",[52,26,126,100],3020]]],"3260":[228,159,[["b",[117,156,137,214],"OK"],["t",[13,13,65,222],"Please enter both your name and a company name or address."],["p",[65,13,139,87],3020]]],"3270":[227,184,[["b",[156,156,176,214],"OK"],["t",[13,13,102,223],"The game has been updated to the next turn. You made some changes since ending your turn that you didn’t save. These changes have now been lost."],["p",[104,13,178,87],3020]]],"3280":[329,258,[["b",[208,182,228,240],"OK"],["p",[182,26,256,100],3020],["t",[13,26,49,320],"Sorry, but Spaceward Ho! allows you to have only 20 ship types at one time. "],["t",[52,26,119,320],"If you would like to create another ship type, scrap an old type by checking the “Scrap” box for it in the “List Ship Types…” Dialog."],["t",[130,26,178,325],"The ship will be scrapped during the turn update and you can create a new type next turn…"]]],"3290":[231,174,[["b",[143,156,163,214],"OK"],["t",[13,13,81,227],"Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location."],["p",[91,13,165,87],3020]]],"3300":[240,200,[["b",[156,156,176,214],"OK"],["t",[13,13,46,223],"There are no colonists aboard that colony ship."],["p",[117,26,191,100],3020],["t",[56,14,106,223],"To refill it, you must either wait one turn or abandon the colony."]]],"3310":[259,249,[["b",[192,156,212,214],"OK"],["t",[14,13,68,252],"Sorry, but the battle information on that battle is no longer available."],["p",[140,13,214,87],3020],["t",[70,13,134,251],"Battle reports that are more that 500 years old are automatically deleted to keep the game file size small."]]],"3320":[235,192,[["b",[156,156,176,214],"OK"],["t",[13,13,98,224],"Sorry, but the game file was busy, and the battle information could not be read for this battle. Please try again in a moment."],["p",[104,13,178,87],3020]]],"3330":[240,200,[["b",[171,156,191,214],"OK"],["p",[119,13,193,87],3020],["t",[13,13,61,234],"Sorry, but that fleet doesn’t have enough fuel to reach the selected destination. "],["t",[67,13,117,234],"You can tell this because there are no arrows on either end of the dragged line."]]],"3340":[240,200,[["b",[156,169,176,227],"OK"],["p",[104,26,178,100],3020],["t",[13,26,82,228],"Sorry, there’s already a star named  “^0.” Please pick another name."]]],"5000":[325,140,[["b",[104,247,124,305],"Save"],["b",[104,26,124,98],"Don't Save"],["b",[104,156,124,214],"Cancel"],["t",[13,78,86,306],"^0, do you want to save the changes you've made before closing the current game?"]]],"5010":[240,200,[["b",[156,156,176,214],"OK"],["p",[117,13,191,87],3020],["t",[13,13,107,230],"^0^1^2^3"]]],"5020":[325,140,[["b",[104,247,124,305],"Save"],["b",[104,78,124,150],"Don't Save"],["b",[200,200,220,258],"Cancel"],["t",[13,78,86,306],"^0, do you want to save the changes you've made before updating the turn?"]]],"5030":[305,234,[["b",[195,234,215,292],"OK"],["t",[13,13,99,297],"Oops! Something kinda funny has happened in TheHo 2.0. Please write down the following problem with as much information as you can on what you think led up to it. Then let us know. Thanks."],["t",[104,13,185,295],"^0^1^2^3"]]],"5040":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Congratulations! You have conquered the galaxy!"],["p",[52,39,203,188],3030]]],"5041":[227,249,[["b",[216,91,236,149],"OK"],["t",[13,13,49,215],"Congratulations! You have conquered the galaxy!"],["p",[52,39,203,188],3530]]],"5050":[235,244,[["b",[212,78,232,149],"Oh, well…"],["p",[52,39,203,188],3040],["t",[13,13,47,222],"Unfortunately, you have been eliminated from the game…"]]],"5051":[235,244,[["b",[212,78,232,149],"Oh, well…"],["p",[52,39,204,188],3540],["t",[13,13,47,222],"Unfortunately, you have been eliminated from the game…"]]],"5060":[282,177,[["b",[143,193,163,272],"Let ’em Die"],["b",[143,104,163,181],"Cancel"],["p",[91,13,165,87],3020],["t",[13,13,83,263],"Warning! You are not spending enough money to support some of your colonies. Do you really want to abandon them?"]]],"5070":[232,153,[["b",[104,156,124,214],"OK"],["t",[13,13,64,224],"Sorry, but the file was busy. Please try again in a few seconds."],["p",[65,13,139,87],3020]]],"5080":[262,153,[["b",[104,182,124,240],"Revert"],["b",[104,117,124,175],"Cancel"],["p",[65,13,139,87],3020],["t",[13,13,62,254],"Do you really want to revert to the saved version of the game? All changes will be lost…"]]],"5090":[228,191,[["b",[143,143,163,201],"OK"],["p",[104,13,178,87],3020],["t",[13,13,72,219],"Sorry, but this game was created with a newer version of Spaceward Ho! "]]]};
function alert20(paras) {
  const norm = (t) => String(t).replace(/[‘’“”]/g, "'").replace(/\s+/g, ' ').replace(/\^\d|%[sd]/g, '').trim();
  const p0 = norm(paras[0]); if (p0.length < 8) return null;
  const common = (x) => { let i = 0; while (i < x.length && i < p0.length && x[i] === p0[i]) i++; return i; };
  let id = null, best = 17;
  for (const k of Object.keys(ALERTS20)) { const t = ALERTS20[k][2].find(x => x[0] === 't'); const c = t ? common(norm(t[2])) : 0; if (c > best) { best = c; id = k; } }
  if (!id) return null;
  const [w, h, items] = ALERTS20[id], a = A(), el = a.el; let ti = 0;
  const done = () => back.remove();
  const kids = items.map(it => {
    if (it[0] === 't') return raw('span', paras[ti] != null && items.filter(x => x[0] === 't').length === paras.length ? paras[ti++] : (ti++, it[2]), { class: 'dt20', style: at20(it[1]) + ';white-space:pre-line' });
    if (it[0] === 'p') { const im = a.IMG['dos:p' + it[2]]; return im ? el('img', { src: im.src, alt: '', style: at20(it[1]) + ';image-rendering:pixelated' }) : null; }
    return el('button', { type: 'button', class: 'ok20', style: at20(it[1]) + ';min-width:0;padding:0', onclick: done }, raw('span', it[2]));
  });
  const back = el('div', { class: 'scrim', onclick: (e) => { if (e.target === back) done(); }, onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); } } },
    el('div', { class: 'win small alert notitle mac12 dl20w', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': paras[0] }, dlog20(w, h, ...kids)));
  document.body.append(back); const b = back.querySelector('button'); if (b) b.focus();
  return back;
}
function alertBox(paras) { const b = (V2 && alert20(paras)) || A().alertOver(paras, lang()); if (b) b.setAttribute('translate', 'no'); }

// DLOG 6020 "Build Ships at …" (BuildShips @112946): "Shipbuilding Queue at:" the star; "Available Types" (the designs);
// "In The Queue:" (each line MakeFleetDescription of the design and its count); for the type picked, "$%s (D)" its development and
// "$%s (P)" its production cost (STR# 4000.28-29), and "%d%% Done" of the first ship queued (4000.30). A double click on a type adds one
// (AddTypeToQueue: a beep when it can't), on a queued line takes one off (RemoveTypeFromQueue). OK keeps the queue, Cancel puts it back.
const DONE = { en: '%d%% Done', fr: '%d%% finition' };
function buildShips(sid) {
  const a = A(), el = a.el, g = G(), p = a.me(), s = g.stars[sid];
  if (!s || s.owner !== a.ME) return false;
  if (!H().feature(g, 'buildQueue')) return buyShips(sid); // (a later ruleset buys ships at once, as its own window does; only 1.2's and DOS 2.0's queue)
  const before = JSON.stringify(s.queue || []);
  const ds = p.designs.filter(d => !d.scrapped).reverse(); // (InitBuildShipsTypesList: every type, the newest first)
  let pick = ds[0] || null;
  const types = el('div', { class: 'lb', role: 'listbox' }), queue = el('div', { class: 'lb', role: 'listbox' });
  const dev = raw('span', ''), pro = raw('span', ''), done = raw('span', '');
  const show = () => {
    types.innerHTML = ''; queue.innerHTML = '';
    for (const d of ds) types.append(raw('div', desc0(d), { class: 'li' + (d === pick ? ' sel' : ''), role: 'option', onclick: () => { pick = d; show(); }, ondblclick: () => add(d) }));
    (s.queue || []).forEach((it, i) => { const d = H().getDesign(g, a.ME, it.did); if (d) queue.append(raw('div', descN(d, it.n), { class: 'li', role: 'option', ondblclick: () => { H().unqueueShip(g, a.ME, sid, i); show(); } })); });
    const c = pick ? H().designCost(g, pick) : null;
    dev.textContent = c ? fill('$%s (D)', nice(c.protoTotal != null ? c.protoTotal : c.money)) : '';
    pro.textContent = c ? fill('$%s (P)', nice(c.money)) : '';
    const pr = (s.queue || []).length ? H().rules(g).yardProgress(g, p, s) : null;
    done.textContent = pr ? fill(DONE[lang()], pr.pct) : '';
  };
  const add = (d) => { if (d.scrap301 || !H().canBuildType(g, p, d.type) || !H().queueShips(g, a.ME, sid, d.id, 1)) { if (a.beep) a.beep(); } show(); };
  show();
  win(el('div', { class: 'build12' },
    el('div', { class: 'kv' }, el('span', null, 'Shipbuilding Queue at:'), raw('b', s.name)),
    el('div', { class: 'cols' }, el('div', null, el('p', null, 'In The Queue:'), queue, dev, ' ', pro, el('br'), done), el('div', null, el('p', null, 'Available Types'), types)),
    el('div', { class: 'btns right' }, btn('Cancel', () => { s.queue = JSON.parse(before); a.closeModal(); a.renderPanel(); }, { class: 'quiet' }), btn('OK', () => { a.closeModal(); a.save(); a.renderPanel(); }))));
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
    for (const d of ds) types.append(raw('div', desc0(d), { class: 'li' + (d === pick ? ' sel' : '') + (d.scrap301 && !rs.queueMarked ? ' dim12' : ''), role: 'option', 'aria-selected': d === pick ? 'true' : 'false', tabindex: 0, onclick: () => { pick = d; show(); }, ondblclick: () => add(d), onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); add(d); } } }));
    for (const d of ds) if (session[d.id] > 0) bought.append(raw('div', descN(d, session[d.id]), { class: 'li', role: 'option', tabindex: 0, ondblclick: () => take(d), onkeydown: (e) => { if (e.key === 'Enter' || e.key === 'Delete') { e.preventDefault(); take(d); } } }));
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
function ask12(text, yes, labels) {
  if (!G() || own12Rules()) return false;
  const a = A(), el = a.el;
  rwin('', el('div', null, text && text.nodeType ? text : el('p', { style: 'white-space: pre-line' }, text),
    el('div', { class: 'btns right' }, btn(labels ? labels[1] : 'Cancel', () => a.closeModal(), { class: 'quiet' }), btn(labels ? labels[0] : 'OK', () => { a.closeModal(); yes(); }))), 'ask12w');
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
function createType() {
  const a = A(), el = a.el, g = G(), p = a.me(), W = ALERT_TYPES[lang()];
  if (p.designs.filter(d => !d.scrapped).length >= (H().rules(g).maxDesigns || 20)) { alertBox(W.full); return; }
  const types = CLASSES();
  const st = { type: 'scout', R: 0, V: 0, W: 0, S: 0, M: 0, name: '' };
  let named = false, moved = false;
  const box = el('div', { class: 'create12' });
  const name = el('input', { maxlength: 15, value: '', 'aria-label': 'Name of New Ship Type:', oninput: () => { st.name = name.value.trim(); named = !!st.name; },
    onkeydown: (e) => { if (e.key.length === 1 && name.value.length >= 15 && name.selectionStart === name.selectionEnd && a.beep) a.beep(); } });
  name.setAttribute('translate', 'no');
  const sel = el('select', { 'aria-label': 'Class', onchange: () => { st.type = sel.value; render(); } }, ...types.map(t => raw('option', cls(t), { value: t })));
  const sliders = el('div'), costs = el('div');
  const render = () => {
    const L = H().designLimits(g, p, st.type);
    sliders.innerHTML = '';
    for (const [k, lab] of [['R', 'Range'], ['V', 'Speed'], ['W', 'Weapons'], ['S', 'Shields'], ['M', 'Mini']]) {
      const min = k === 'R' && st.type === 'satellite' ? 0 : H().designMin(g, k, st.type), max = k === 'R' && st.type === 'satellite' ? 0 : Math.max(min, L[k] || min);
      st[k] = Math.max(min, Math.min(max, st[k]));
      const out = raw('b', `${st[k]}/${max}`);
      sliders.append(el('label', { class: 'slide' }, el('span', null, lab), el('input', { type: 'range', min, max, value: st[k], disabled: max <= min,
        oninput: (e) => { st[k] = +e.target.value; moved = true; out.textContent = `${st[k]}/${max}`; showCost(); } }), out));
    }
    showCost();
  };
  const showCost = () => {
    const c = H().designCost(g, st);
    costs.innerHTML = '';
    costs.append(el('div', { class: 'kv' }, el('span', null, 'Dev. Cost:'), raw('b', '$' + nice(c.protoTotal != null ? c.protoTotal : c.money))),
      el('div', { class: 'kv' }, el('span', null, 'Prod. Cost:'), raw('b', '$' + nice(c.money))),
      el('div', { class: 'kv' }, lang() === 'fr' ? raw('span', 'CT Métal:') : el('span', null, 'Metal Cost:'), raw('b', nice(c.metal))));
  };
  render();
  box.append(el('p', null, 'Name of New Ship Type:'), name, sel, sliders, costs,
    el('div', { class: 'btns' }, btn('Name It For Me', () => { st.name = H().designName(g, p, st.type); name.value = st.name; named = true; }, { class: 'quiet' }),
      btn('Cancel', () => a.closeModal(), { class: 'quiet' }),
      btn('Create', () => {
        if (!named || !st.name) { alertBox(W.name); return; }
        if (!moved) { alertBox(W.tech); return; }
        H().findOrCreateDesign(g, p, { type: st.type, R: st.R, V: st.V, W: st.W, S: st.S, M: st.M, name: st.name });
        a.closeModal(); a.save(); a.renderPanel();
      })));
  win(box);
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
function turnProgress(g, go) {
  const a = A(), el = a.el, W = PASSES[lang()], n = g.players.length;
  const steps = [W[0]];
  for (let i = 1; i <= n; i++) steps.push(fill(W[1], i));
  steps.push(W[2]);
  for (let i = 1; i <= n; i++) steps.push(fill(W[3], i));
  steps.push(W[4]);
  const txt = raw('p', steps[0]), bar = el('progress', { max: steps.length, value: 0 });
  a.modal('', el('div', { class: 'status12' }, txt, bar), { cls: 'small mac12', label: steps[0] });
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
  a.modal('', body, { cls: 'mac12 about', label: V2 ? 'About Spaceward Ho! 2.0…' : 'About Spaceward Ho! 1.2…' });
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
  const box = el('div', { class: 'piles12' });
  const show = () => {
    box.innerHTML = '';
    piles.forEach((p, i) => {
      if (!p.n && !p.f) return;
      const col = el('div', { class: 'pile', ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); moveTo(i); }, onclick: (e) => { if (sel && sel.pile !== i && e.target === col) moveTo(i); } });
      for (let k = 0; k < p.n; k++) {
        const sh = el('div', { class: 'ship' + (sel && sel.pile === i && (sel.all || k === p.n - 1) ? ' sel' : ''), draggable: 'true',
          onclick: (e) => { e.stopPropagation(); if (sel && sel.pile !== i) { moveTo(i); return; } sel = { pile: i, all: e.shiftKey }; show(); },
          ondragstart: (e) => { sel = { pile: i, all: e.shiftKey || (sel && sel.pile === i && sel.all) }; try { e.dataTransfer.setData('text/plain', 'ship'); } catch (x) {} } },
          a.shipImgEl(d, 24));
        col.append(sh);
      }
      box.append(col);
    });
    box.append(el('div', { class: 'pile new', ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); moveTo(-1); }, onclick: () => { if (sel) moveTo(-1); } }));
  };
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
  if (V2) { // DLOG 6060 (439 x 285, DITL 6060): the heading (0, 13), the two lines (18, 16) and (35, 16), the piles (56, 12, 405 x 180), the buttons at y 249: Group All (45), Divide All (131), Cancel (232), OK (340)
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
const typed = { s: '', t: 0 };
document.addEventListener('keydown', (e) => {
  const a = A(), g = G();
  if (!a || !g || !own() || a.UI.modal || document.querySelector('.scrim') || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
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
    el('button', { type: 'button', class: 'ok20', style: at20([225, 351, 245, 409]) + ';min-width:0;padding:0', onclick: () => f.requestSubmit() }, raw('span', 'Create')),
    el('button', { type: 'button', class: 'ok20', style: at20([225, 273, 245, 331]) + ';min-width:0;padding:0', onclick: () => a.closeModal() }, raw('span', 'Cancel')), moreBtn);
  const holder = el('div', { class: 'cg20' }, box);
  const rest = [...f.childNodes]; f.prepend(holder);
  // (the version, language and skin choices stay where they are: they are the remake's own and the skin's rules checks use them)
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules'), dress = () => { const on = !rs || rs.value === 'mac20'; box.style.display = on ? '' : 'none'; moreBtn.style.display = on ? '' : 'none'; for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  if (rs) rs.addEventListener('change', dress); dress();
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
    const t = String(d.turns);
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
const G9 = '9px Geneva, Verdana, sans-serif', G9B = 'bold 9px Geneva, Verdana, sans-serif', SYS12 = '12px Chicago, Charcoal, Geneva, sans-serif';
function qdCanvas(w, h, label) { // a box drawn at twice its pixels, as wide as the panel
  const c = A().el('canvas', { class: 'qd12', width: w * 2, height: h * 2, role: 'img', 'aria-label': label || '' });
  c.style.aspectRatio = w + ' / ' + h;
  const x = c.getContext('2d'); x.setTransform(2, 0, 0, 2, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
  x.textBaseline = 'alphabetic'; x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineWidth = 1;
  const api = {
    c, x,
    text(t, h0, v, font, o) { c.dataset.t = (c.dataset.t ? c.dataset.t + '\n' : '') + t; /* (what the box says, for a reader or a test: the canvas has no text of its own) */ x.font = font || G9; x.letterSpacing = o && o.cond ? '-1px' : '0px'; x.fillStyle = '#000'; const w0 = x.measureText(t).width; const at = o && o.right != null ? o.right - w0 : o && o.center != null ? o.center - Math.trunc(w0 / 2) : h0; x.fillText(t, at, v); x.letterSpacing = '0px'; return w0; },
    width(t, font) { x.font = font || G9; return x.measureText(t).width; },
    hline(h0, h1, v) { x.fillStyle = '#000'; x.fillRect(h0, v, h1 - h0, 1); },
    vline(h0, v0, v1) { x.fillStyle = '#000'; x.fillRect(h0, v0, 1, v1 - v0); },
    rect(l, t, r, b, col) { x.fillStyle = col; x.fillRect(l, t, r - l, b - t); },
    // pointer position in the box's pixels
    at(ev) { const r = c.getBoundingClientRect(); return { h: (ev.clientX - r.left) * w / r.width, v: (ev.clientY - r.top) * h / r.height }; },
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
  const q = qdCanvas(226, 62, 'Fleets');
  const here = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const sel = here.find(f => f.id === a.UI.selFleet);
  FLEET_TOP = Math.max(0, Math.min(FLEET_TOP, here.length - 4));
  if (sel) {
    const L = rs.fleetInfo ? rs.fleetInfo(g, sel) : r12 ? r12.fleetInfo(langView(g), sel) : [];
    const first = L[0] || '', m = /^(.*?:) (.*)$/.exec(first);
    if (m && !sel.scrap301 && !/ via /.test(first)) { q.text(m[1], 3, 6); q.text(m[2], 70, 6); } else q.text(first, 3, 6);
    if (L[1]) q.text(L[1], 3, 16); if (L[2]) q.text(L[2], 70, 16); if (L[3]) q.text(L[3], 125, 16);
  }
  q.hline(0, 214, 18);
  if (!here.length) q.text(W.noFleets || '', 3, 28);
  here.slice(FLEET_TOP, FLEET_TOP + 4).forEach((f, i) => {
    const top = 19 + 10 * i, ds = H().fleetDesigns(g, f), d = ds[0], n = H().fleetCount ? H().fleetCount(f) : Object.values(f.ships).reduce((x, y) => x + y, 0);
    // (a ruleset without shipsText: 1.2's line for a fleet of one design; the engine's own label, "6 ships", for a mixed fleet)
    const t = rs.shipsText ? (d ? rs.shipsText(g, d, n) : '') : ds.length === 1 && r12 ? r12.shipsText(langView(g), d, n) : H().fleetLabel(g, f);
    const font = f.dest != null ? G9B : G9, cond = q.width(t, font) > 214 - 3;
    q.text(t, 3, top + 8, font, { cond });
    if (f.id === a.UI.selFleet) { q.x.globalCompositeOperation = 'difference'; q.rect(0, top, 214, top + 10, '#fff'); q.x.globalCompositeOperation = 'source-over'; }
  });
  // the scroll bar (an OS control: drawn plainly), 12 wide, from the rule to the foot
  q.x.strokeStyle = '#000'; q.x.strokeRect(214.5, 18.5, 11, 41); if (here.length > 4) { const h = Math.max(6, 41 * 4 / here.length), y = 18.5 + (41 - h) * FLEET_TOP / (here.length - 4); q.rect(215, y, 225, y + h, '#888'); }
  q.hline(0, 226, 59); q.hline(0, 226, 61); q.vline(225, 0, 62);
  q.c.addEventListener('click', (ev) => { // ClickInFleetRect @c67d0: a row selects its fleet
    const pt = q.at(ev); if (pt.h >= 214 || pt.v < 19) return;
    const f = here[FLEET_TOP + Math.floor((pt.v - 19) / 10)]; if (f) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); }
  });
  q.c.addEventListener('wheel', (ev) => { if (here.length <= 4) return; ev.preventDefault(); FLEET_TOP += ev.deltaY > 0 ? 1 : -1; a.renderPanel(); }, { passive: false });
  return a.el('section', { class: 'box fleets12' }, q.c);
}
function incomeBox12(old) {
  const a = A(), q = qdCanvas(226, 34, 'Totals');
  const rows = old ? Array.from(old.querySelectorAll('.kv')) : [];
  rows.slice(0, 3).forEach((r, i) => {
    const t = kvText(old, r.getAttribute('data-help')) || { label: r.querySelector('span').textContent, value: '', chg: '' }, v = 10 + 10 * i;
    q.text(t.label, 0, v, G9B, { right: 87 }); q.text(t.value, 90, v, G9B); if (t.chg) q.text(t.chg, 0, v, G9, { right: 225 });
  });
  q.hline(0, 226, 32); q.vline(225, 0, 34);
  return a.el('section', { class: 'box info12' }, q.c);
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
  const q = qdCanvas(bw, 80, W.head), sc = H().barScale(g, 'tech');
  const toPix = (v) => Math.trunc(50 * sc.toX(v)), fromPix = (px) => sc.toValue(px / 50);
  const vals = () => { const t = keys.reduce((s, k) => s + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
  const draw = () => {
    q.rect(0, 0, bw, 80, '#fff');
    q.text(W.head, 3, 10); q.text(W.levels, 3, 25);
    TECH12.forEach((k, i) => { q.text(names[i], 5, 35 + 10 * i); q.text(String(p.tech[k]), 50, 35 + 10 * i); });
    vbars(q, x0, 15, vals(), 2, names, toPix, geo);
  };
  draw();
  dragBars(q, x0, 15, vals, 2, (v, end) => { if (v) { keys.forEach((k, i) => { p.talloc[k] = v[i] / 1000; }); draw(); } if (end) { a.save(); a.renderPanel(); } }, fromPix, geo);
  if (rad) q.c.classList.add('remake12');
  return a.el('section', { class: 'box tech12', 'aria-label': W.head }, q.c);
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
  const box = el('section', { class: 'box rep12box' }, list);
  // (kept where the player scrolled it while the reports are the same; a new turn opens it at the current year's first)
  const key = g.turn + ':' + ms.length;
  setTimeout(() => { if (REP12.key === key && REP12.top != null) list.scrollTop = REP12.top; else { const now = list.querySelector('li[data-now]'); if (now) list.scrollTop = now.offsetTop - list.offsetTop; } REP12.key = key; }, 0);
  list.addEventListener('scroll', () => { REP12.top = list.scrollTop; });
  return box;
}

function panel12(panel, B) {
  const a = A(), el = a.el;
  bars(panel, B);
  const old = B.planet;
  const pb = planetBox12(old);
  const fb = fleetBox12();
  const ib = incomeBox12(B.info);
  const rost = el('div', { class: 'rost12' }); roster(rost);
  const low = el('div', { class: 'low12' }, rost, B.budget);
  const tb = techBox12();
  panel.innerHTML = '';
  panel.append(pb, fb, ib, low, tb, reportsBox12());
  // (the budget bars go down to the map window's foot, 136 of its pixels under the totals, and scroll; CenterOnStarBar @c5c26
  // scrolls them to the selected colony's row)
  if (B.budget) {
    const k = (panel.clientWidth || 226) / 226, bx = B.budget;
    bx.style.maxHeight = Math.round(136 * k) + 'px'; bx.style.overflowY = 'auto'; bx.style.position = 'relative';
    const r = bx.querySelector('.barrow.hl');
    if (r && (r.offsetTop < bx.scrollTop || r.offsetTop + r.offsetHeight > bx.scrollTop + bx.clientHeight)) bx.scrollTop = Math.max(0, r.offsetTop - bx.clientHeight / 2);
  }
}

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
const SYS = '12px Chicago, Charcoal, Geneva, sans-serif', GEN9 = '9px Geneva, Verdana, sans-serif';
function battleWindow(b, k) {
  const a = A(), g = G(), rs = H().rules(g), el = a.el, IMG = a.IMG, ME = a.ME;
  const fr = lang() === 'fr', W = 445, Hh = 310, S = 2, TICK = 1000 / 60;
  const pic = (n) => { const im = IMG['dos:' + n]; return im && im.complete && im.naturalWidth ? im : null; };
  const VB = k.verBattle(), speed = Math.max(1, Math.round(30 * VB.f));
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
  const text = (t, h, v, font, cond) => { x.font = font || SYS; x.letterSpacing = cond ? '-1px' : '0px'; x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(t, h, v); x.letterSpacing = '0px'; };
  // DrawBattleStars: 35 points (CalcBattleStars, the record's seed: one field a battle)
  let seed = (b.id | 0) * 7919 + 13;
  const rnd = (lo, hi) => { seed = (seed * 16807) % 2147483647; return lo + (seed % (hi - lo + 1)); };
  const stars = Array.from({ length: 35 }, () => [rnd(10, 435), rnd(35, 290)]);
  const drawStars = () => { x.fillStyle = '#fff'; for (const [h, v] of stars) x.fillRect(h, v, 1, 1); };
  const face = (o, ci) => {
    const p = g.players[o]; if (!p) return;
    const id = o === ME ? (p.female ? 1500 : 1000) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20);
    const im = pic('i' + id); if (im) x.drawImage(im, colX[ci], 2, 32, 32);
    text(p.name || '', colX[ci] + 35, 24);
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
  const drawGroup = (gr) => { // DrawOneGroup @d214e
    const gx = colX[gr.ci], gy = 53 * gr.row + 35;
    tile(gr, gx, gy);
    x.fillStyle = '#000'; x.fillRect(gx - 20, gy + 40, 160, 13);
    const t = groupWords(gr);
    x.font = SYS; const cond = x.measureText(t).width > 120;
    x.font = GEN9; x.letterSpacing = cond ? '-1px' : '0px';
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
    else cols[ci].forEach(drawGroup);
  });
  // a shot
  const wait = (until) => new Promise(res => { const f = () => (stop || skip || performance.now() >= until ? res() : setTimeout(f, Math.min(TICK, until - performance.now()))); f(); });
  const cellOf = (ev, shooter) => shooter ? (ev.si >= 0 ? where.get(ev.si) : planetAt[ev.a]) : (ev.p ? planetAt[b.planetOwner] : where.get(ev.ti));
  async function laser(s, t) { // DrawLaserBlast @d3dea
    let x1 = colX[s.ci], y1 = 53 * s.row + 55, x2 = colX[t.ci], y2 = 53 * t.row + 55;
    if (x2 > x1) { x1 += 121; x2 -= 1; } else { x2 += 121; x1 -= 1; }
    const dx = Math.trunc((x2 - x1) / 5), dy = Math.trunc((y2 - y1) / 5);
    const seg = (h0, v0, h1, v1, col) => { x.strokeStyle = col; x.lineWidth = 1; x.beginPath(); for (const o of [0, 1, -1, 2, -2]) { x.moveTo(h0 + 0.5, v0 + o + 0.5); x.lineTo(h1 + 0.5, v1 + o + 0.5); } x.stroke(); };
    let h = x1, v = y1, ph = -1, pv = -1;
    for (let i = 0; i < 5 && !stop && !skip; i++) {
      const t0 = performance.now();
      seg(h, v, h + dx, v + dy, '#fff');
      if (ph !== -1) seg(ph, pv, h, v, '#000');
      ph = h; pv = v; h += dx; v += dy;
      await wait(t0 + TICK);
    }
    seg(ph, pv, h, v, '#000');
  }
  async function explosion(t, ev, until) { // DrawExplosion @d40f8
    const l = colX[t.ci], tp = 53 * t.row + 35, dm = ev.dm | 0;
    if (ev.snd !== 3003) { const im = pic('s' + (12000 + (dm % 3))); if (im) x.drawImage(im, l + (dm % 103), tp + (dm % 23), 17, 17); return; }
    if (!VB.full) return;
    const oval = (s, style) => { const r = { l: l + s, r: l + 120 - s, t: tp + Math.trunc(40 * s / 120), b: tp + 40 - Math.trunc(40 * s / 120) }; if (r.r <= r.l || r.b <= r.t) return; x.strokeStyle = style; x.lineWidth = 1; x.beginPath(); x.ellipse((r.l + r.r) / 2, (r.t + r.b) / 2, (r.r - r.l - 1) / 2, (r.b - r.t - 1) / 2, 0, 0, Math.PI * 2); x.stroke(); };
    for (let s = 59; s > 0 && !stop && !skip; s--) { oval(s, whiteGray); if (s % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
    for (let s = 1; s < 60 && !stop && !skip; s++) { oval(s, '#000'); if (s % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
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
    [0, 1].forEach(ci => { if (!hidden[ci]) cols[ci].forEach(drawGroup); });
    // DrawX over a side with nothing left
    [0, 1].forEach(ci => {
      const o = owners[ci]; if (o == null) return;
      const left = b.start.some((u, i) => alive[i] && u.o === o) || (b.planetOwner === o && pop > 0.0005);
      if (!left) { const h = colX[ci]; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(h + 1, 3); x.lineTo(h + 33, 35); x.moveTo(h + 1, 35); x.lineTo(h + 33, 3); x.stroke(); }
    });
    const P = (rs.battlePanel || RS12().battlePanel)(rs.battlePanel ? g : langView(g), b, { alive, hurt, pop, over: true, won }, ME);
    (P.end || []).forEach((t, i) => text(t, 155, i ? 150 : 135));
    const im = pic(won ? 'p3500' : 'p3510'); if (im) x.drawImage(im, 180, 175, 74, 64);
    setBtn(fr ? 'Bien' : 'OK');
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
        if (s && t && !hidden[t.ci] && !hidden[s.ci]) {
          await laser(s, t);
          if (stop || skip) break;
          a.Sound.play(k.shotSnd(ev, 3000));
          apply(ev);
          drawGroup(t);
          deadline += speed * TICK;
          await explosion(t, ev, deadline);
          await wait(deadline);
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
  if (!li || li.dataset.inv12 === 'go' || !G() || !own()) return;
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
  v.s = ZOOMS[zoomIdx(v.s)];
  barMetrics(v.s, c.mapW, c.mapH, c.G);
  let [H, V] = cellOf(v);
  if (MB.s && MB.s !== v.s && MB.centerSel && c.sel != null && c.G.stars[c.sel]) [H, V] = centerCells(c.G.stars[c.sel], c.G); // (Zoom In / Zoom Out: CenterOnStar, forced)
  else if (!c.live) { H = Math.round(H); V = Math.round(V); } // (whole cells; while a drag or a throw is on, the map follows it and settles at its end)
  [H, V] = clampCell(H, V);
  putCell(v, H, V);
  MB.H = H; MB.V = V; MB.s = v.s; MB.centerSel = false;
}
function centerOnStar12(v, sid, c) {
  if (!barsOn()) return false;
  const st = c.G.stars[sid]; if (!st) return false;
  v.s = ZOOMS[zoomIdx(v.s)]; barMetrics(v.s, c.mapW, c.mapH, c.G);
  const [H, V] = cellOf(v), z = v.s / 2, px = (st.x * 2 - H) * z - 6, py = (st.y * 2 - V) * z - 7;
  if (px > 40 && px < c.mapW - 40 && py > 40 && py < c.mapH - 85) return true; // (already in view: CenterOnStar leaves the map)
  const [h2, v2] = centerCells(st, c.G); putCell(v, h2, v2); return true;
}
let BAR_TILE = null;
const barTile = () => BAR_TILE || (() => { const t = document.createElement('canvas'); t.width = t.height = 2; const x = t.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 2, 2); x.fillStyle = '#000'; x.fillRect(0, 0, 1, 1); x.fillRect(1, 1, 1, 1); return (BAR_TILE = t); })();
// one bar, drawn as the standard scroll bar of System 6 and 7 in black and white: a frame, an arrow box at each end (a black arrow, inverted while
// it is held), a grey page area (the 50% pattern), the thumb a white square with a frame; inactive (no room to scroll, or a dialog is up): an empty bar
function paintBar(b, vertical, L, o) {
  const k = Math.max(1, Math.round(window.devicePixelRatio || 1)), cw = vertical ? BAR12 : L, ch = vertical ? L : BAR12, c = b.c;
  if (c.width !== cw * k || c.height !== ch * k) { c.width = cw * k; c.height = ch * k; }
  c.style.width = cw + 'px'; c.style.height = ch + 'px';
  const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.imageSmoothingEnabled = false;
  // (a, b, w, h): a across the bar, b along it
  const R = (a, p, w, h, col) => { x.fillStyle = col; if (vertical) x.fillRect(a, p, w, h); else x.fillRect(p, a, h, w); };
  R(0, 0, BAR12, L, '#000'); R(1, 1, BAR12 - 2, L - 2, '#fff');
  if (!o.active) return;
  const pat = x.createPattern(barTile(), 'repeat'); x.fillStyle = pat;
  if (vertical) x.fillRect(1, 16, 14, L - 32); else x.fillRect(16, 1, L - 32, 14);
  R(1, 15, BAR12 - 2, 1, '#000'); R(1, L - 16, BAR12 - 2, 1, '#000');
  // the arrows: a 7 x 4 triangle (js/os/system7.css has the same) in each box
  const arrow = (end, dir, inv) => {
    const p0 = end ? L - 15 : 1; // the box: 14 along, between the frame and the divider
    if (inv) R(1, p0, BAR12 - 2, 14, '#000');
    for (let r = 0; r < 4; r++) { const w = dir < 0 ? 1 + 2 * r : 7 - 2 * r; R(7 - (w - 1) / 2, p0 + 5 + r, w, 1, inv ? '#fff' : '#000'); }
  };
  arrow(0, -1, o.press === 'lo'); arrow(1, 1, o.press === 'hi');
  // the thumb
  const T = L - 46;
  if (T >= 0) {
    const t = 15 + Math.round(T * Math.max(0, Math.min(1, o.value / o.max)));
    R(0, t, BAR12, 16, '#000'); R(1, t + 1, BAR12 - 2, 14, '#fff');
    if (o.ghost != null) { // the outline that is dragged (the map moves when it is let go)
      for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i === 0 || j === 0 || i === 15 || j === 15) && (i + j) % 2 === 0) R(i, o.ghost + j, 1, 1, '#000');
    }
  }
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
    if (b.key !== key) { b.key = key; paintBar(b, b.vertical, b.L, { active: act, value: vals.value, max: Math.max(1, vals.max), press, ghost }); }
  }
  MB.v.el.style.height = MB.v.L + 'px'; MB.h.el.style.width = MB.h.L + 'px';
  MB.v.el.dataset.value = String(MB.V); MB.h.el.dataset.value = String(MB.H);
}
// a dialog opening or closing activates or deactivates the map window (DeactivateMapWindow @c30a4 / ActivateMapWindow @c3012)
new MutationObserver(() => { if (MB.wrap) updateBars(); }).observe(document.body, { childList: true });

window.HOMAC12 = {
  alertBox: (paras) => { const b = V2 && G() && own12Rules() ? alert20(paras) : null; if (b) b.setAttribute('translate', 'no'); return b; },
  battleWindow,
  // (the Edit menu's French title is 1.2F's "Edition", which the interface would take for its English word "Edition": written as it is)
  menuName(name) {
    if (name !== 'Edit') return name;
    const sp = document.createElement('span'), set = () => { sp.textContent = window.HOUI && HOUI.t ? HOUI.t('Edit') : 'Edit'; };
    sp.setAttribute('translate', 'no'); set(); if (window.HOUI && HOUI.onChange) HOUI.onChange(set);
    return sp;
  },
  // (NewGame @100004: the status window "Ecriture nouveau fichier Jeu..." (STR# 4000.1; Mac 2.0.1 "Writing New Game File...") while the
  // galaxy file is written, its bar moving once a player)
  beforeFirstTurn(go) {
    if (!own()) return false;
    const a = A(), el = a.el, n = G().players.length, txt = lang() === 'fr' ? 'Ecriture nouveau fichier Jeu...' : 'Writing New Game File...';
    const bar = el('progress', { max: n, value: 0 });
    a.modal('', el('div', { class: 'status12' }, raw('p', txt), bar), { cls: 'small mac12', label: txt });
    let i = 0; const step = () => { if (++i > n) { a.closeModal(); go(); return; } bar.value = i; setTimeout(step, 60); }; setTimeout(step, 60);
    return true;
  },
  // Mac 2.0.1's PlayAnnounceSound @130eb0 (the jump table of 1000 + 0 to $39): 2000 for the technology levels (1002-1006), the new year (1010) and 1028, 1032, 1054,
  // 1057; 2001 for 1009, 1055, 1056; 3002 for 1011; none for 1000, 1001, 1033-1035; the system beep for every other report (1.2's table also had 1020, a fleet lost in a
  // wormhole, and 1059 at 2001)
  sysBeep: (g) => V2 && !!g && H().rules(g).id === 'mac20',
  messageLook(m, cur) {
    if (!V2 || !G() || H().rules(G()).id !== 'mac20') return null;
    const R = H().REPORTS20 || [];
    const t = String(m.text || '');
    if (!HOMAC_RE20) HOMAC_RE20 = R.map((x, i) => ({ i, re: new RegExp('^' + x.split(/(%(?:\.\*|\d*\.?\d*)?[sd]|%%)/).map((y, j) => j % 2 ? (y === '%%' ? '%' : '.*?') : y.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')), len: x.length })).filter(o => o.len > 8).sort((a, b) => b.len - a.len);
    const hit = HOMAC_RE20.find(o => o.re.test(t));
    const code = hit ? 1000 + hit.i : 9999;
    const snd = [1002, 1003, 1004, 1005, 1006, 1010, 1028, 1032, 1054, 1057].includes(code) ? 2000 : [1009, 1055, 1056].includes(code) ? 2001 : code === 1011 ? 3002 : null;
    return { icon: cur.icon, sound: snd };
  },
  // (the New Game window, for 2.0.1's own rules: its Create New Galaxy dialog over the form)
  newGame(f, ctx) { if (V2) createGalaxy20(f, ctx); },
  zoomTo: (s, f) => (own() ? zoomTo(s, f) : Math.max(12, Math.min(140, s * f))),
  // the map window's scroll bars and the whole-cell scrolling they give (above); dragging the map with a mouse and the wheel are modern conveniences
  mapInset: () => (barsOn() ? [BAR12, BAR12] : [0, 0]),
  modernPan: () => barsOn(),
  syncView: syncMapView, afterDraw: updateBars, centerOnStar: centerOnStar12,
  zoomed: (i) => { if (barsOn() && i.menu) MB.centerSel = true; },
  fitView(v, c) { if (!own()) return; const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = ZOOMS[3]; if (st) { barMetrics(v.s, c.mapW, c.mapH, c.G); const [H, V] = centerCells(st, c.G); putCell(v, H, V); } },
  mapNames: (s) => (own() ? zoomIdx(s) > 0 : s > 18),
  // (DrawOneBWStarSubProc @c38ce: at the second zoom the names are drawn condensed, TextFace 0x20: a pixel less between letters)
  // (StarLine: the line while a fleet is dragged, and a fleet's orders)
  // (FollowPathDrag @c69d6: PickStar under the pointer, a line only to a star)
  dragRoute(cx, d) { if (!own()) return false; if (!d.star) return true; return starLine(cx, { x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, ok: d.ok, round: d.round, turns: d.turns }); },
  routeLine(cx, d) { if (!own()) return false; return starLine(cx, { x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, ok: true, round: d.round, turns: d.turns }); },
  nameStarLayout,
  mapNameStyle(cx, s) { cx.letterSpacing = own() && zoomIdx(s) === 1 ? '-1px' : '0px'; },
  drawStar(cx, i) { if (!own() || zoomIdx(i.view.s) > 0) return false; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(i.x, i.y, 2.5, 0, Math.PI * 2); cx.fill(); return 'all'; },
  lettersPickStars: true,
  // (the planet box without the remake's own additions: classic ui planetBox)
  ownPanel: true,
  turnProgress(g, go) { LASTB = g.battles.length; if (!own()) return go(); turnProgress(g, go); },
  // (DoBattleStage @d0004: with Voir batailles on, the battles you were in are shown during the update, before the reports)
  afterTurn(go) {
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
  },
  panel(panel, B) { if (own()) panel12(panel, B || {}); },
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
    if (name === 'build') return buildShips(x[0]);
    return false;
  },
  // the remake's commands that 1.2 has no menu item for (Import, Export, the Halls, Auto play, Players ...) go to the Ho! menu
  menus(M, ho) {
    ITEMS = {};
    for (const k in M) for (const x of M[k]) if (x[0] !== '-' && typeof x[0] === 'string') ITEMS[x[0]] = x;
    const own = new Set(['New game…', 'Quit to title', 'Build ships at selected colony…', 'Review battle…', 'List all fleets…', 'Scrap ship types…', 'Next fleet',
      'List explored stars…', 'Fix spending', 'Report window…', 'Zoom in', 'Zoom out', ...(V2 ? ['Compare players…', 'Send a message…', 'Force end turn…', 'Auto play…', 'End turn and switch players'] : [])]);
    const extra = [];
    for (const k in M) { for (const x of M[k]) if (x[0] !== '-' && !(typeof x[0] === 'string' && own.has(x[0]))) extra.push(x); M[k].length = 0; }
    // (View's sound and music, Help's How to play and the manual stay reachable)
    ho.unshift([V2 ? 'About Spaceward Ho! 2.0…' : 'About Spaceward Ho! 1.2…', aboutBox], ['-']);
    // (each command is the remake's own: a window it opens is tagged at once, which is what keeps 1.2's own windows out of the remake's look;
    // the Ho! menu's own items too: Skin and OS look, Sounds, Language, Temperatures)
    const tagged = (x) => { const f = x[1], y = x.slice(); y[1] = (...a) => { const r = f(...a); tagRemakeWindows(); return r; }; return y; };
    for (let i = 0; i < ho.length; i++) if (ho[i][0] !== '-' && typeof ho[i][1] === 'function') ho[i] = tagged(ho[i]);
    if (extra.length) ho.push(['-'], ...extra.filter(x => !(typeof x[0] === 'function' && /scrap|organize|organi|switch players/i.test(String(x[0]())))).map(tagged));
  },
  get menuLayout() { return menuLayout(); },
};
// key equivalents: ⌘ or Ctrl and the item's key, as the menus show them (a browser keeps some of them, ⌘N, ⌘W, ⌘T, ⌘Q, for itself)
document.addEventListener('keydown', (e) => {
  if (!(e.metaKey || e.ctrlKey) || e.altKey || !A() || !G() || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  const L = menuLayout();
  for (const k in L) for (const x of L[k]) {
    if (x === '-' || !x[5] || x[5].toLowerCase() !== e.key.toLowerCase()) continue;
    if (x[4] && x[4]()) return;
    e.preventDefault(); x[1](); return;
  }
});
})();
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac3/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
