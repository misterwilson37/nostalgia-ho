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
window.HOMAC_VERSION = '1.2';
(function () {
'use strict';
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
function menuLayout() {
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
      it('Set Battle Speed…', () => A().openPrefs(), { ghost: noGame }),
      '-',
      it('Show Event Messages', () => { P().showMsgs = P().showMsgs === false; A().savePrefs(); }, { ghost: noGame, checked: () => P().showMsgs !== false }),
      it('Review Announced Battles', () => { P().review = !A().prefReview(); A().savePrefs(); }, { ghost: noGame, checked: () => A().prefReview() }),
      it('Give Overspending Warnings', () => { const g = G(); g.opts.overspendWarnings = g.opts.overspendWarnings === false; A().save(); }, { ghost: noGame, checked: () => !!G() && G().opts.overspendWarnings !== false }),
      it('Sound', () => { A().Sound.on = !A().Sound.on; A().savePrefs(); }, { ghost: noGame, checked: () => A().Sound.on })],
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
        { ghost: () => noGame() || !lastBattle(), key: 'R' })],
    Galaxy: [
      it('List All Explored Stars…', () => A().openStarList(), { ghost: noGame }),
      '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || atZoom(3), key: '=' }),
      it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || atZoom(0), key: '-' }),
      '-',
      // (dimmed while announcements are still to be read: SetMenuItems' message count)
      it('Fix Spending', () => fixStep(), { ghost: () => noGame() || A().UI.msgIdx < (A().UI.inbox || []).length, key: 'F' })],
    Window: [
      it('Tech Spending Window', () => { const t = document.querySelector('#panel .box.tech, #panel section:nth-of-type(3)'); if (t) t.scrollIntoView({ block: 'nearest' }); }, { ghost: noGame, key: '1' }),
      it('Report Window', () => A().openReports(), { ghost: noGame, key: '2' }),
      '-',
      it('Clean Up Windows', () => {}, { ghost: () => true })],
  };
}


// ---------- the windows (in English as Mac 2.0.1 words them; in French the interface puts 1.2F's DITL words) ----------
const lang = () => (G() && G().opts && G().opts.lang) || 'fr';
const own = () => lang() === 'en' || lang() === 'fr';
const CLASS_FR = { scout: 'Eclaireur', fighter: 'Croiseur', colony: 'Transport', satellite: 'Satellite' };
const cls = (t) => (lang() === 'fr' ? CLASS_FR[t] : (H().TYPES[t] || { name: t }).name);
const nice = (n) => (H().rules(G()).fmtNum || H().niceNum)(Math.round(n));
const fill = (t, ...a) => { let i = 0; return t.replace(/%(\.\*)?[sd]/g, () => String(a[i++])).replace(/%%/g, '%'); };
// a text the interface must not translate (the program's own words, already in the language, or names)
const raw = (tag, t, attrs) => { const e = A().el(tag, attrs || null); e.append(document.createTextNode(t)); e.setAttribute('translate', 'no'); return e; };
// MakeFleetDescription with no count (the lists of designs): "Columbus (1/1) Scout" / "Eclaireur Columbus (1/1)"
const desc0 = (d) => (lang() === 'fr' ? `${cls(d.type)} ${d.name} (${d.W}/${d.S})` : `${d.name} (${d.W}/${d.S}) ${cls(d.type)}`).slice(0, 40);
const descN = (d, n) => (lang() === 'fr' ? (n === 1 ? `1 ${cls(d.type)} ${d.name} (${d.W}/${d.S})` : `${n} ${cls(d.type)}s ${d.name} (${d.W}/${d.S})`) : H().rules(G()).shipsDesc(G(), d, n)).slice(0, 40);
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
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: cur.scrap301 ? 'checked' : false, onchange: () => { rs.flagScrapDesign(G(), p, cur, 'command'); a.save(); show(); } }), el('span', null, 'Scrap This Type')),
      el('div', { class: 'btns' }, btn('Rename', () => renameType(cur))));
  };
  show();
  win(el('div', { class: 'types12' }, list, info, el('div', { class: 'btns right' }, btn('OK', () => a.closeModal()))));
  return true;
}
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
function alertBox(paras) { const b = A().alertOver(paras, lang()); if (b) b.setAttribute('translate', 'no'); }

// DLOG 6020 "Build Ships at …" (BuildShips @112946): "Shipbuilding Queue at:" the star; "Available Types" (the designs);
// "In The Queue:" (each line MakeFleetDescription of the design and its count); for the type picked, "$%s (D)" its development and
// "$%s (P)" its production cost (STR# 4000.28-29), and "%d%% Done" of the first ship queued (4000.30). A double click on a type adds one
// (AddTypeToQueue: a beep when it can't), on a queued line takes one off (RemoveTypeFromQueue). OK keeps the queue, Cancel puts it back.
const DONE = { en: '%d%% Done', fr: '%d%% finition' };
function buildShips(sid) {
  const a = A(), el = a.el, g = G(), p = a.me(), s = g.stars[sid];
  if (!s || s.owner !== a.ME) return false;
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
  const types = ['scout', 'fighter', 'colony', 'satellite'];
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
  const box = el('section', { class: 'box roster12', 'aria-label': 'Players' });
  for (const p of g.players) {
    const key = p.id === a.ME ? 'white0_0' : 'bad' + (p.face || 0) + '_0', im = a.IMG[key];
    const done = !p.human || (g.done || []).includes(p.id);
    box.append(el('div', { class: 'rrow' + (p.alive ? '' : ' out') },
      im ? el('img', { src: im.src, alt: '', width: 16, height: 16 }) : el('span'), raw('span', p.name, { class: 'rname' }),
      done && p.alive ? raw('span', '✓', { class: 'rdone', 'aria-label': 'done' }) : null));
  }
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
  a.modal('', body, { cls: 'mac12 about', label: 'About Spaceward Ho! 1.2…' });
}

// DLOG 6060 "Organize “<type>” Fleets…" (OrganizeFleets @113896): the fleets of the selected fleet's design at the star as piles of ship
// pictures; "To Organize Fleets:", "• Click and drag fleets into desired number of piles", "• Shift-Click selects an entire pile";
// "Group All" (one pile), "Divide All" (a pile per ship); OK makes the piles the fleets (the first fleets keep their records and orders,
// a new pile is a new fleet: rs.organized), Cancel leaves them
function organize(f0) {
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

// ---------- the battle window (DoOneBattle @d07d0, DLOG 7010: 445 x 300, black; drawn at twice the size) ----------
// Everything here is read in the decompile (docs/display/12.json rows DoOneBattle, DrawAllGroups, DrawOneGroup, HaveGroupShoot,
// DrawLaserBlast, DrawExplosion, DrawX, CalcBattleStars, DrawBattleStars, DrawShipPicture): the black-and-white program's drawing.
// The window is white on black (ForeColor 30, BackColor 33; DrawBattleStars' 35 white points at random, h 10-435, v 35-290);
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
  const fr = lang() === 'fr', W = 445, Hh = 300, S = 2, TICK = 1000 / 60;
  const pic = (n) => { const im = IMG['dos:' + n]; return im && im.complete && im.naturalWidth ? im : null; };
  const VB = k.verBattle(), speed = Math.max(1, Math.round(30 * VB.f));
  // the state as the shots go
  const alive = b.start.map(() => true), hurt = []; let seq = 0, pop = b.pop0;
  const st = () => ({ alive, hurt, pop, over: false, won: false });
  const P0 = rs.battlePanel(g, b, st(), ME);
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
    const P = rs.battlePanel(g, b, { alive, hurt, pop, over: true, won }, ME);
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

window.HOMAC12 = {
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
  zoomTo: (s, f) => (own() ? zoomTo(s, f) : Math.max(12, Math.min(140, s * f))),
  fitView(v, c) { if (!own()) return; const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = ZOOMS[3]; if (st) { v.ox = c.mapW / 2 - st.x * v.s; v.oy = c.mapH / 2 - st.y * v.s; } },
  mapNames: (s) => (own() ? zoomIdx(s) > 0 : s > 18),
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
  panel(panel, B) { if (own()) { bars(panel, B || {}); roster(panel); } },
  // the program's own windows, in English and French (another language keeps the remake's)
  window(name, ...x) {
    if (!G() || !own()) return false;
    if (name === 'types') return shipTypes();
    if (name === 'fleets') return fleetsStatus();
    if (name === 'build') return buildShips(x[0]);
    return false;
  },
  // the remake's commands that 1.2 has no menu item for (Import, Export, the Halls, Auto play, Players ...) go to the Ho! menu
  menus(M, ho) {
    ITEMS = {};
    for (const k in M) for (const x of M[k]) if (x[0] !== '-' && typeof x[0] === 'string') ITEMS[x[0]] = x;
    const own = new Set(['New game…', 'Quit to title', 'Build ships at selected colony…', 'Review battle…', 'List all fleets…', 'Scrap ship types…', 'Next fleet',
      'List explored stars…', 'Fix spending', 'Report window…', 'Zoom in', 'Zoom out']);
    const extra = [];
    for (const k in M) { for (const x of M[k]) if (x[0] !== '-' && !(typeof x[0] === 'string' && own.has(x[0]))) extra.push(x); M[k].length = 0; }
    // (View's sound and music, Help's How to play and the manual stay reachable)
    ho.unshift(['About Spaceward Ho! 1.2…', aboutBox], ['-']);
    if (extra.length) ho.push(['-'], ...extra.filter(x => !(typeof x[0] === 'function' && /scrap|organize|organi/i.test(String(x[0]())))));
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
