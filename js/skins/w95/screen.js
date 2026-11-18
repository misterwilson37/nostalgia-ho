// Spaceward Ho! web remake — the 4.0.5 Windows 95 skin's main window (docs/status-w95.md)
//
// SPACEHO.EXE's main window as Jake's captures show it (audit/win-4.0.5 in the private repo, shot 010 and on), at the
// program's 640 x 480 screen: a captioned window ("Jake in Milky Way in 2000", the title the classic page already writes),
// the menu bar File / Edit / Options / Ships / Galaxy / Window / Help, then the information column at the left (x 5-253:
// the star pane, the fleet header and list, the money pane, the players beside the budget bars) and the map at the right
// with Windows scroll bars. Loaded by js/skins/w95/ui.js before the classic page; it adds its hooks to window.HOTHEME.
// The screen is made as big as the browser window allows, as the Mac skins do (js/skins/mac12/ui.js setMacScale): S is
// how many times 640 x 480 fits, in half steps from 1.5; below that (a phone) the page keeps its own layout.
(function () {
'use strict';
const T = window.HOTHEME;
const de = document.documentElement;
de.classList.add('w95fam');
// ---------- the screen made big ----------
const W95 = { s: 1 };
function w95Scale() { const u = Math.min(window.innerWidth / 640, window.innerHeight / 480); return u >= 1.5 ? Math.floor(u * 2) / 2 : u >= 1 ? 1 : 0; }
function setW95Scale() {
  const s0 = W95.s; W95.s = w95Scale();
  de.style.setProperty('--w95', String(W95.s || 1));
  de.classList.toggle('w95win', W95.s >= 1); // the program's window layout (a phone keeps the page's own)
  de.classList.toggle('w95scale', W95.s > 1);
  const a = window.HOAPI;
  if (s0 !== W95.s && a && a.G) { a.UI.fitted = false; a.resize(); a.renderPanel(); }
  document.querySelectorAll('.w95tool').forEach(w => { if (W95.s < 1) w.hidden = true; });
}
setW95Scale(); window.addEventListener('resize', setW95Scale);
T.w95 = W95;

// ---------- the menus ----------
// As the captures show them (shots 032, 035, 036, 042, 046, 047, 050, 074, 075, 282): the program rewrites some of menu 2's
// words when it runs (Build/Design Ships..., Organize Ships..., Zoom Out Ctrl+-), and the captures win. Items the remake
// hasn't got are left out; the remake's own commands not placed here go at the end of Help (layoutMenus).
const clickEndTurn = () => { const b = document.querySelector('#msg .clock'); if (b) b.click(); };
const dim = () => true, noGame = () => !(window.HOAPI && HOAPI.G);
const battleHere = () => { const a = window.HOAPI; return !!(a && a.G && a.UI.sel != null && a.lastBattles(a.UI.sel).length); };
// Hide Information (shot 050, Alt+I): the information column goes and the map takes the window
const infoOff = () => de.classList.contains('w95noinfo');
const setInfo = (on) => { de.classList.toggle('w95noinfo', !on); const a = window.HOAPI; if (a && a.G) { a.resize(); a.draw(); } };
T.menuLayout = {
  File: [['New Game', 'Game/New game…'], ['Open Game...', 'Game/Saved games…'], '-',
    ['Save Game', 'Game/Export this game…'], '-',
    ['End Turn', clickEndTurn, null, null, () => !(window.HOAPI && HOAPI.G), 'T'], '-',
    ['Recent File', () => {}, null, null, dim], '-',
    ['Exit', 'Game/Quit to title']],
  // (4.0.5's Edit menu has nothing the remake does: shown dimmed, as in shot 035)
  Edit: [['Undo', () => {}, null, null, dim, 'Z'], '-', ['Cut', () => {}, null, null, dim, 'X'], ['Copy', () => {}, null, null, dim, 'C'], ['Paste', () => {}, null, null, dim, 'V']],
  Options: [['Auto Play...', 'Game/Auto play…'], '-', [null, 'View/#4'], '-',
    ['Master Point List...', 'Game/Master Point List…'], ['Hall of Fame...', 'Game/Hall of Fame…'], ['Hall of Shame...', 'Game/Hall of Shame…'], '-',
    ['Preferences...', 'Game/Preferences…']],
  Ships: [['Build/Design Ships...', 'Ships/Build ships at selected colony…'], '-',
    ['List All Fleets', 'Ships/List all fleets…'], [null, 'Ships/#4'], [null, 'Ships/#3'], '-',
    // (the last item names the selected star's battle, or reads "No Battles here..." dimmed: shot 042)
    [null, 'Ships/#1']],
  Galaxy: [['Compare Players...', 'Galaxy/Compare players…'], ['Graph History...', 'Game/Players and history'], ['List All Explored Stars...', 'Galaxy/List explored stars…'], '-',
    ['Dip Into Savings', 'Galaxy/Dip into savings…'], '-',
    ['Alliances...', 'Galaxy/Players and alliances…'], ['Give Money/Metal...', 'Galaxy/Give money or metal…'], [null, 'Galaxy/#9'], ['Send Message...', 'Galaxy/Send a message…'], '-',
    [null, 'Galaxy/#10']],
  // (shot 050: no ticks; Chat Window is dimmed out of a network game; Zoom In dimmed at the closest zoom)
  Window: [['Tech Spending Window', () => setWin('tech', !winOpen('tech')), null, null, noGame, '1'],
    ['Report Window', () => setWin('report', !winOpen('report')), null, null, noGame, '2'],
    ['Chat Window', () => {}, null, null, dim, '3'], '-',
    [null, 'View/#0'], [null, 'View/#1'], ['Fit Galaxy', 'View/Fit galaxy'], // (by place: T.menus has renamed them)
    [() => (infoOff() ? 'Show Information' : 'Hide Information'), () => setInfo(infoOff()), null, null, noGame, 'Alt+I'], '-',
    ['Clean Up Windows', () => cleanUp(), null, null, noGame]],
  Help: [['Help Topics', 'Help/How to play'], [null, 'Help/#1']],
};
// the key equivalents the captures show, by the remake's item (its English label)
const KEYS = { 'New game…': 'N', 'Saved games…': 'O', 'Export this game…': 'S', 'Quit to title': 'Q', 'Build ships at selected colony…': 'B', 'List all fleets…': 'L',
  'Compare players…': 'Y', 'Players and history': 'H', 'Dip into savings…': 'D', 'Send a message…': 'M' };
T.menus = (menus) => {
  for (const m in menus) for (const it of menus[m]) if (typeof it[0] === 'string' && KEYS[it[0]]) it[5] = KEYS[it[0]];
  // Ships' last item (shot 042): "Review Battle", or "No Battles here..." dimmed when the selected star has had none; Window's zooms
  // dimmed at their ends, Ctrl+I and Ctrl+J (menu 2)
  for (const it of menus.Ships || []) if (it[0] === 'Review battle…') { it[0] = () => (battleHere() ? 'Review Battle' : 'No Battles here...'); it[4] = () => !battleHere(); it[5] = null; } // (shot 042: no key shown)
  for (const it of menus.View || []) {
    if (it[0] === 'Zoom in') { it[0] = 'Zoom In'; it[4] = () => noGame() || zoomIdx(HOAPI.UI.view.s) >= zooms().length - 1; it[5] = 'I'; }
    if (it[0] === 'Zoom out') { it[0] = 'Zoom Out'; it[4] = () => noGame() || zoomIdx(HOAPI.UI.view.s) <= 0; it[5] = 'J'; }
  }
  // Options' "Sound", ticked while on (shot 036), in place of the remake's "Turn sound off / on"
  for (const it of menus.View || []) if (typeof it[0] === 'function') { let t = ''; try { t = it[0](); } catch (e) {} if (/sound/i.test(t)) { it[0] = 'Sound'; it[3] = () => !!(window.HOAPI && HOAPI.Sound.on); } }
};
T.keyName = (k) => (/^Alt/.test(k) ? k : 'Ctrl+' + k);
T.hoIntoLast = () => true;
T.menuName = (name) => { const n = document.createElement('span'); n.innerHTML = '<u>' + name[0] + '</u>' + name.slice(1); return n; };

// ---------- the panes (unit 2: the star pane, the fleet header and the fleet list) ----------
// Words from SPACEHO.EXE's string table (the numbers below); places measured on Jake's captures (shots 010, 052, 285, 287, 294).
const A = () => window.HOAPI, H = () => window.HO;
const W95ON = () => de.classList.contains('w95win') && !!(A() && A().G);
const cfmt = (f, ...v) => { let i = 0; return f.replace(/%(\d*)\.?(\d*)([sd])/g, (m, w, d, t) => { const x = v[i++]; return t === 'd' && d ? String(Math.abs(x)).padStart(+d, '0') : String(x); }); };
const span = (cls, text, style) => { const e = document.createElement('span'); if (cls) e.className = cls; e.textContent = text; if (style) e.style.cssText = style; return e; };
// The star pane (FUN_0048eb07, MAPWINPR.CPP), 249 x 85 at (5, 43): the star's name in bold centred at x 42; rows 13 pixels apart from 15,
// the labels (711-715) right-aligned at 44 and the values from 46; "Owner" (1336, no colon) and the owner or "No One" (1360) for a star not
// yours; "You have no information about this planet." (719) at (3, 15) for one never explored. At the right the picture: black from x 118
// (130 when your colony's terraform / mine gauge stands at 118), the turning planet in it (FUN_00492ccb).
function starPane() {
  const a = A(), g = a.G, p = a.me(), sid = a.UI.sel, s = sid != null ? g.stars[sid] : null;
  const box = document.createElement('section'); box.className = 'w95pane w95star';
  if (!s) return box;
  const k = H().know(g, p, sid), yours = s.owner === a.ME;
  box.append(span('nm', s.name));
  const row = (i, label, value) => { box.append(span('lb', label, `top:${15 + 13 * i}px`)); box.append(span('vl', value, `top:${15 + 13 * i}px`)); };
  let gauge = null;
  if (!yours && !(k && k.explored)) box.append(span('noinfo', 'You have no information about this planet.'));
  else {
    const src = yours ? s : k;
    const t10 = Math.round(10 * (72 + (src.t - p.homeT))), gr = Math.trunc(100 * src.g / Math.max(0.01, p.homeG));
    if (yours) { row(0, 'Income:', '$' + H().niceNum(Math.round(H().planetIncome(g, p, s)))); row(1, 'Pop:', H().niceNum(H().popNum(g, s.pop))); }
    else { row(0, 'Owner', k.owner >= 0 ? g.players[k.owner].name : 'No One'); row(1, 'Pop:', k.owner >= 0 ? 'Unknown' : 'Uninhabited'); }
    row(2, 'Temp:', cfmt('%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10)));
    row(3, 'Gravity:', cfmt('%d.%2.2dG', Math.trunc(gr / 100), gr % 100));
    row(4, 'Metal:', H().niceNum(Math.round(src.metal)));
    if (yours) gauge = gaugeOf(s, p);
  }
  // the picture (none for a star you know nothing of: shot 315's pane is grey across)
  if (!(yours || (k && k.explored))) return box;
  const L = gauge ? 130 : 118, pic = document.createElement('canvas'); pic.className = 'pic';
  const K = Math.max(2, Math.ceil((W95.s || 1) * (window.devicePixelRatio || 1)));
  pic.width = (249 - L) * K; pic.height = 85 * K; pic.style.left = L + 'px'; pic.style.width = (249 - L) + 'px';
  pic.dataset.star = String(s.id); pic.dataset.k = String(K); pic.dataset.left = String(L);
  box.append(pic);
  if (gauge) box.append(gauge);
  { PLANET.star = s.id; drawPlanet(pic, false); if (!PLANET.timer) PLANET.timer = setInterval(planetTick, PLANET_MS); }
  return box;
}
// your colony's terraform / mine gauge (FUN_0048f855): bitmap 1410's left 10 x 67 at (118, 0), the grey below it, and the 8 x 6 thumb at
// 1 + 58 x the terraforming share (of 1000). Shown while terraforming or mining is unfinished; drag it to set the share.
function gaugeOf(s, p) {
  const tf = Math.abs(H().seenT(p, s) - 72) <= 0.5, mf = !(s.metal > 0); if (tf || mf) return null; // (shown only while there is a split to make: shot 010's new home, only mining left, has none)
  const rs = H().rules(A().G);
  const share = () => { if (rs.bars) { const b = rs.bars(s); return b[0] < 0 ? 0 : b[1] < 0 ? 1000 : b[0]; } return tf ? 0 : mf ? 1000 : Math.round(1000 * (s.terra == null ? 0.5 : s.terra)); };
  const g = document.createElement('div'); g.className = 'gauge'; g.setAttribute('role', 'slider'); g.setAttribute('aria-label', 'Terraform / mine'); g.tabIndex = 0;
  const im = A().IMG['w95:b1410']; if (im) { const c = document.createElement('canvas'); c.width = 10; c.height = 67; c.getContext('2d').drawImage(im, 0, 0, 10, 67, 0, 0, 10, 67); g.append(c); }
  const th = document.createElement('i'); g.append(th);
  const put = () => { const v = share(); th.style.top = (1 + Math.trunc(v * 58 / 1000)) + 'px'; g.setAttribute('aria-valuenow', String(v)); };
  put();
  if (!tf && !mf) {
    const set = (e) => { const r = g.getBoundingClientRect(), z = r.height / 85; const v = Math.max(0, Math.min(1000, Math.round(((e.clientY - r.top) / z - 4) * 1000 / 58)));
      if (rs.setBars) rs.setBars(s, v, 1000 - v); else s.terra = v / 1000; put(); };
    g.addEventListener('pointerdown', (e) => { e.preventDefault(); set(e); const mv = (ev) => set(ev), up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); A().save(); A().renderPanel(); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); });
  }
  return g;
}
// The turning planet (FUN_00492ccb): a 56 x 56 oval at (156, 10) of the pane. The texture (6100 + star % 6 when the bigger of its gravity
// and your home's is under 1.5 times the smaller, 6110 + % 3 to 2.00, 6120 + % 4 to 2.56, else 6130) wraps round every 167 pixels, a pixel a
// step; for a planet colder than your home the ice caps (6150 at the top, 6151 at the bottom) come in 6 + (difference in tenths / 107, at
// most 22) pixels; the night side, a darkened copy, sweeps across over 224 steps (0x38, 0x70, 0xa8: the 3.0.1 program's phases); every 10th
// step the 14 stars behind it move a pixel left. (The Windows timer's rate is not read yet: PLANET_MS is 3.0.1's six a second.)
const PLANET = { c: 0, n: 0, star: null, timer: null, stars: Array.from({ length: 14 }, () => ({ h: Math.floor(Math.random() * 116), v: 1 + Math.floor(Math.random() * 81) })) };
const PLANET_MS = 1000 / 6;
function texFor(s, p) {
  const r = Math.trunc(100 * Math.max(s.g, p.homeG) / Math.max(0.01, Math.min(s.g, p.homeG)));
  return r < 150 ? 6100 + s.id % 6 : r < 201 ? 6110 + s.id % 3 : r < 257 ? 6120 + s.id % 4 : 6130;
}
function drawPlanet(cv, step) {
  const a = A(), g = a.G, p = a.me(), s = g && g.stars[+cv.dataset.star]; if (!s) return;
  const K = +cv.dataset.k, L = +cv.dataset.left, x = cv.getContext('2d'); x.setTransform(K, 0, 0, K, 0, 0); x.imageSmoothingEnabled = false;
  if (step) { PLANET.c = (PLANET.c + 1) % 167; PLANET.n = (PLANET.n + 1) % 224; }
  x.fillStyle = '#000'; x.fillRect(0, 0, 249 - L, 85);
  const SX = 131 - L; // the stars' field starts 118 from the pane's right
  if (step && PLANET.c % 10 === 0) PLANET.stars.forEach(st => { st.h -= 1; if (st.h < 0) { st.h = 115; st.v = 1 + Math.floor(Math.random() * 81); } });
  x.fillStyle = '#fff'; PLANET.stars.forEach(st => x.fillRect(SX + 1 + st.h, st.v, 1, 1));
  const tex = a.IMG['w95:b' + texFor(s, p)]; if (!tex || !tex.width) return;
  const D = 56, off = PLANET.c;
  const strip = document.createElement('canvas'); strip.width = 167; strip.height = D; const sx = strip.getContext('2d'); sx.imageSmoothingEnabled = false;
  sx.drawImage(tex, 0, 0, 167, D, 0, 0, 167, D);
  const d10 = Math.round(10 * (p.homeT - (s.owner === a.ME ? s.t : (H().know(g, p, s.id) || s).t)));
  if (d10 > 0) { const n = Math.min(22, Math.trunc(d10 / 107)) + 6, c1 = a.IMG['w95:b6150'], c2 = a.IMG['w95:b6151'];
    if (c1 && c1.width) sx.drawImage(c1, 0, 0, 167, D, 0, n - 28, 167, D); if (c2 && c2.width) sx.drawImage(c2, 0, 0, 167, D, 0, 28 - n, 167, D); }
  const o = document.createElement('canvas'); o.width = o.height = D; const ox = o.getContext('2d'); ox.imageSmoothingEnabled = false;
  ox.drawImage(strip, off, 0, 167 - off, D, 0, 0, 167 - off, D); if (off) ox.drawImage(strip, 0, 0, off, D, 167 - off, 0, off, D);
  const c = PLANET.n, m = document.createElement('canvas'); m.width = m.height = D; const mx = m.getContext('2d');
  const half = c < 112 ? [0, D / 2] : [D / 2, D], w = c < 56 ? 56 - c : c < 112 ? c - 56 : c < 168 ? 168 - c : c - 168, el = Math.trunc((D - w) / 2);
  mx.fillStyle = '#000'; mx.fillRect(half[0], 0, half[1] - half[0], D);
  mx.globalCompositeOperation = (c < 56 || c >= 168) ? 'destination-out' : 'source-over';
  if (w > 0) { mx.beginPath(); mx.ellipse(el + w / 2, D / 2, w / 2, D / 2, 0, 0, Math.PI * 2); mx.fill(); }
  mx.globalCompositeOperation = 'source-in'; mx.fillStyle = 'rgba(0,0,0,0.75)'; mx.fillRect(0, 0, D, D);
  ox.drawImage(m, 0, 0);
  const ph = 156 - L, pv = 10;
  x.save(); x.beginPath(); x.ellipse(ph + D / 2, pv + D / 2, D / 2, D / 2, 0, 0, Math.PI * 2); x.clip(); x.drawImage(o, ph, pv); x.restore();
}
function planetTick() {
  const cv = document.querySelector('#panel .w95star canvas.pic');
  if (!cv || !W95ON()) { clearInterval(PLANET.timer); PLANET.timer = null; return; }
  drawPlanet(cv, true);
}
// The fleet header (FUN_0048fe0f), 249 x 23 at (5, 131): row 1 at (3, 1) "Stationed at:" (1339) or "Departing To:" (1340) and at 70 the star,
// or "%s (Dist %d; Time %d)" (1341); on a route "Going to %s (D %d; T %d) via %s" (1342) at 3; "Fleet to be scrapped for metal." (1338) when
// marked. Row 2 at (3, 11) "Fuel: %d/%d" (1343), at 70 "Speed: %d" (1344), at 125 "Full" / "Empty" (1345, 1346) for a colony fleet, else
// "Scrap: %s" (1347: three quarters of its metal). "There are no fleets at this planet." (1337) when there are none.
function fleetLines(g, f) {
  const star = (i) => g.stars[i].name, sp = H().fleetSpeed(g, f), L = [];
  if (f.scrap301) L.push(['Fleet to be scrapped for metal.']);
  else if (f.dest == null) L.push(['Stationed at:', star(f.star)]);
  else {
    const hops = [f.star, f.dest].concat(f.path || []); let dist = 0, time = 0;
    for (let i = 0; i + 1 < hops.length; i++) { const d = H().starDist(g, hops[i], hops[i + 1]); dist += d; time += Math.ceil(d / sp - 1e-9); }
    const end = hops[hops.length - 1];
    if (end === f.dest) L.push(['Departing To:', cfmt('%s (Dist %d; Time %d)', star(end), Math.round(dist), time)]);
    else L.push([cfmt('Going to %s (D %d; T %d) via %s', star(end), Math.round(dist), time, star(f.dest))]);
  }
  const ds = H().fleetDesigns(g, f); let third;
  if (ds.some(d => d.type === 'colony')) third = (f.colonists || 0) > 0 ? 'Full' : 'Empty';
  else { let m = 0; for (const k in f.ships) { const d = H().getDesign(g, f.owner, +k); if (d) m += f.ships[k] * H().designCost(g, d).metal; } third = cfmt('Scrap: %s', H().niceNum(Math.trunc(m * 3 / 4))); }
  L.push([cfmt('Fuel: %d/%d', Math.round(f.fuel || 0), H().fleetMaxRange(g, f)), cfmt('Speed: %d', sp), third]);
  return L;
}
// The fleet list (an owner-drawn list box), 249 x 66 at (5, 155): white, rows 13 high, the selected fleet in black with white words;
// your fleets at the star, then the others' ("%s's %s", 1365) where you own the star or have a fleet there. Its scroll bar is the list
// box's own (the browser's, in this look).
// A fleet's row as 4.0.5 words it ("one Rudolph (1/1) Scout", "32 Storm (8/8) Fighters": shots 010, 294; "one" is 1364): the design's name and
// weapons / shields. The 405 ruleset has no rs.fleetDesc (docs/status-w95.md, "Needs a shared file"), so the skin words its own rows; a
// ruleset that has one keeps its own words.
function fleetRow(g, f) {
  const ds = H().fleetDesigns(g, f), n = H().fleetCount(f);
  if (H().rules(g).fleetDesc || ds.length !== 1) return H().fleetText(g, f);
  const d = ds[0], T = H().TYPES[d.type]; if (!T) return H().fleetText(g, f);
  return n === 1 ? `one ${d.name} (${d.W}/${d.S}) ${T.name}` : `${n} ${d.name} (${d.W}/${d.S}) ${T.name}s`;
}
function fleetPanes() {
  const a = A(), g = a.G, sid = a.UI.sel, s = sid != null ? g.stars[sid] : null;
  const here = s ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === a.ME)) : [];
  const others = s && (s.owner === a.ME || here.length) ? g.fleets.filter(f => f.star === s.id && f.to == null && f.owner !== a.ME && !f.newThisTurn) : [];
  const sel = here.find(f => f.id === a.UI.selFleet) || null;
  const head = document.createElement('section'); head.className = 'w95pane w95fhead';
  if (sel) { const L = fleetLines(g, sel);
    head.append(span('', L[0][0], 'left:3px;top:1px')); if (L[0][1]) head.append(span('', L[0][1], 'left:70px;top:1px'));
    head.append(span('', L[1][0], 'left:3px;top:11px')); head.append(span('', L[1][1], 'left:70px;top:11px')); head.append(span('', L[1][2], 'left:125px;top:11px')); }
  else if (s && !here.length && !others.length) head.append(span('', 'There are no fleets at this planet.', 'left:3px;top:1px'));
  const list = document.createElement('section'); list.className = 'w95pane w95flist'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Fleets');
  const rs = H().rules(g);
  here.forEach(f => { const r = span('row' + (sel && f.id === sel.id ? ' sel' : '') + (f.dest != null ? ' go' : '') + (f.newThisTurn ? ' new' : '') + (f.scrap301 ? ' scrap' : ''), fleetRow(g, f));
    r.setAttribute('role', 'option'); r.addEventListener('click', () => { if (a.UI.selFleet !== f.id) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); } }); list.append(r); });
  others.forEach(f => { const own = g.players[f.owner]; list.append(span('row other', rs.otherFleetRow ? (rs.otherFleetRow(null, f) || '') : cfmt("%s's %s", own ? own.name : '?', fleetRow(g, f)))); });
  return [head, list];
}

// ---------- the panes (unit 3: the money pane, the players, the budget bars) ----------
// FUN_0042e6fc: a figure rounded to millions ("%dM") from 500,000, else to thousands ("%dK") from 500, else whole
const kfmt = (v) => { const a = Math.abs(v), sg = v < 0 ? -1 : 1, M = Math.trunc((a + 500000) / 1000000), K = Math.trunc((a + 500) / 1000); return M ? (sg * M) + 'M' : K ? (sg * K) + 'K' : String(Math.round(v)); };
// The money pane (FUN_00489ebe), 249 x 44 at (5, 224), in the semibold font: "Metal:", "Savings:", "Net Income:" (703, 701, 702) right-aligned
// at 87 on rows one line apart, the figures from 90 (savings in red below zero), and right-aligned at the pane's right "(up %s)" / "(down %s)"
// (706, 707: the metal's change), "(Int: %s)" (the interest, rounded), "(up $%s)" / "(down $%s)" (704, 705: the income's change, rounded).
function moneyPane() {
  const a = A(), g = a.G, p = a.me(), pr = H().projected(g, p), ch = p.chg || {};
  const box = document.createElement('section'); box.className = 'w95pane w95money';
  const row = (i, label, value, right, red) => { box.append(span('lb', label, `top:${13 * i}px`)); const v = span('vl', value, `top:${13 * i}px`); if (red) v.style.color = '#f00'; box.append(v); box.append(span('rt', right, `top:${13 * i}px`)); };
  const cm = Math.round(ch.metal || 0), ci = Math.round(ch.income || 0);
  row(0, 'Metal:', H().niceNum(Math.round(p.metal)), cm < 0 ? `(down ${H().niceNum(-cm)})` : `(up ${H().niceNum(cm)})`);
  row(1, 'Savings:', '$' + H().niceNum(Math.round(p.savings)), `(Int: ${kfmt(Math.round(pr.interest || 0))})`, p.savings < 0);
  row(2, 'Net Income:', '$' + H().niceNum(Math.round(pr.net)), ci < 0 ? `(down $${kfmt(-ci)})` : `(up $${kfmt(ci)})`);
  return box;
}
// The players (the list at the bottom left, 105 x 174 at (5, 271)): rows 24 high, a tick for a player whose turn is done, the small face
// (8405 / 8905 for you, 9000 + face / 9500 + face for the computer players: the 32 x 32 faces' numbers + 7000), the name; a cross over the
// face of one who is out. (The order is the players' own, you first: how the program sorts them is not read yet.)
function playersPane() {
  const a = A(), g = a.G, IMG = a.IMG;
  const box = document.createElement('section'); box.className = 'w95players'; box.setAttribute('aria-label', 'Players');
  const list = [a.me()].concat(g.players.filter(q => q.id !== a.ME));
  list.forEach((q) => {
    const r = document.createElement('div'); r.className = 'prow' + (q.alive === false ? ' out' : '');
    const done = !q.human || (g.done || []).includes(q.id);
    r.append(span('tick', done && q.id !== a.ME ? '√' : ''));
    const n = q.human ? (q.female ? 8905 : 8405) : (q.female ? 9500 : 9000) + (q.face || 0) % 20, im = IMG['w95:b' + n];
    const f = document.createElement('i'); f.className = 'face'; if (im && im.src) f.style.backgroundImage = `url("${im.src}")`; r.append(f);
    r.append(span('pn', q.name));
    box.append(r);
  });
  return box;
}
// The budget (FUN_0045aae1): "100%" over the scale, then Savings and Tech, then a rule and your colonies, 14 a row, labels right-aligned
// at 153, the bars from 155: at most 77 long and 7 high, a one-pixel edge, two lighter lines above and two darker below and at the right.
// Savings orange, Tech magenta; a colony's bar mixes the terraforming colour (green) and the mining colour (blue) by its shares; a colony
// with nothing left to terraform or mine shows its income instead ("$%s", red when it loses money); one being abandoned "Abandoning".
// The bars are the classic page's own (dragged as there), laid out here; the selected star's name underlined.
function budgetPane(B) {
  const a = A(), g = a.G, p = a.me();
  const box = document.createElement('section'); box.className = 'w95budget';
  box.append(span('pct', '100%'));
  const bb = B && B.budget; if (!bb) return box;
  const rows = [...bb.querySelectorAll('.barrow')], ents = B.ents || [];
  const top = document.createElement('div'), cols = document.createElement('div'); top.className = 'btop'; cols.className = 'bcols';
  rows.forEach((r, i) => {
    const e = ents[i]; if (!e) return;
    r.classList.add('w95bar');
    if (e.key === 'savings') { r.classList.add('sav'); top.prepend(r); return; }
    if (e.key === 'tech') { r.classList.add('tech'); top.append(r); return; }
    const st = g.stars[e.star]; if (!st) return;
    if (a.UI.sel === st.id) r.classList.add('selrow');
    const tf = Math.abs(H().seenT(p, st) - 72) <= 0.5, mf = !(st.metal > 0), inc = Math.round(H().planetIncome(g, p, st));
    const bv = r.querySelector('.bval');
    if (st.abandon || p.abandon === st.id) { r.classList.add('note', 'red'); if (bv) bv.textContent = 'Abandoning'; }
    else if (tf && mf) { r.classList.add('note'); if (inc < 0) r.classList.add('red'); if (bv) bv.textContent = '$' + H().niceNum(inc); }
    else {
      const t = tf ? 0 : mf ? 1 : (st.terra == null ? 0.5 : st.terra), mix = (c1, c2) => c1.map((v, k) => Math.round(v * t + c2[k] * (1 - t)));
      const fill = mix([0x52, 0x98, 0x40], [0x00, 0x00, 0xc6]), edge = mix([0x38, 0x80, 0x22], [0x00, 0x00, 0xf5]), dark = mix([0x22, 0x54, 0x13], [0x00, 0x00, 0x61]), light = mix([0x8c, 0xc4, 0x80], [0x65, 0x65, 0xc8]);
      const css = (c) => `rgb(${c.join(',')})`;
      r.style.setProperty('--bf', css(fill)); r.style.setProperty('--be', css(edge)); r.style.setProperty('--bd', css(dark)); r.style.setProperty('--bl', css(light));
      if (inc < 0) r.classList.add('red');
    }
    cols.append(r);
  });
  box.append(top, cols);
  return box;
}

// ---------- the floating windows (unit 5: Tech Spending; the Report window and the bubble follow) ----------
// Tool windows over the whole screen, as the captures show them (shots 008, 010, 051): a grey (inactive) caption 18 high with the
// Windows flag, the title in bold and a close box; Clean Up's places along the screen's foot: Tech Spending at (87, 349), the Report
// window at (338, 349). Dragged by the caption; where each is and whether it is open is kept ("ho5.win.w95").
const WIN_KEY = 'ho5.win.w95', WIN_HOME = { tech: [87, 349], report: [338, 349] };
const WS = (() => { try { return JSON.parse(localStorage.getItem(WIN_KEY)) || {}; } catch (e) { return {}; } })();
const saveWS = () => { try { localStorage.setItem(WIN_KEY, JSON.stringify(WS)); } catch (e) {} };
const winOpen = (k) => !(WS[k] && WS[k].closed);
function toolWin(k, title) {
  let w = document.getElementById('w95' + k);
  if (!w) {
    w = document.createElement('div'); w.id = 'w95' + k; w.className = 'w95tool'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', title);
    w.innerHTML = '<div class="tcap"><i class="flag"></i><span></span><i class="x" role="button" aria-label="Close"></i></div><div class="tbody"></div>';
    w.querySelector('.tcap span').textContent = title;
    w.querySelector('.x').addEventListener('click', () => { setWin(k, false); });
    const cap = w.querySelector('.tcap');
    cap.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('x')) return; e.preventDefault();
      const z = W95.s || 1, x0 = e.clientX, y0 = e.clientY, p0 = (WS[k] && WS[k].at) || WIN_HOME[k];
      const mv = (ev) => { const at = [Math.round(p0[0] + (ev.clientX - x0) / z), Math.round(p0[1] + (ev.clientY - y0) / z)]; WS[k] = Object.assign(WS[k] || {}, { at }); placeWin(w, k); };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); saveWS(); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
    document.getElementById('app').append(w);
  }
  placeWin(w, k);
  return w;
}
function placeWin(w, k) {
  const at = (WS[k] && WS[k].at) || WIN_HOME[k], z = W95.s || 1;
  const x = Math.max(0, Math.min(at[0], window.innerWidth / z - 40)), y = Math.max(0, Math.min(at[1], window.innerHeight / z - 20));
  w.style.left = x + 'px'; w.style.top = y + 'px'; w.hidden = !(W95ON() && winOpen(k));
}
function setWin(k, on) { WS[k] = Object.assign(WS[k] || {}, { closed: !on }); saveWS(); const w = document.getElementById('w95' + k); if (w) placeWin(w, k); if (on && A()) A().renderPanel(); }
function cleanUp() { for (const k in WIN_HOME) { WS[k] = Object.assign(WS[k] || {}, { at: null }); delete WS[k].at; } saveWS(); for (const k in WIN_HOME) { const w = document.getElementById('w95' + k); if (w) placeWin(w, k); } }
// Tech Spending (dialog 102, drawn by the program): "Current Levels:" and the five levels at the left (the names left, the levels right at
// 69); the six bars standing on an axis at the right, 18 wide, 22 apart, magenta; their names under them in two staggered rows
// ("Range Weapons Mini" / "Speed Shields Radical"). The bars are the classic page's own (T.techBars 'vertical': dragged up and down).
T.techBars = 'vertical';
function techWindow(B) {
  const a = A(), p = a.me(), w = toolWin('tech', 'Tech Spending'), body = w.querySelector('.tbody');
  body.innerHTML = '';
  const lv = document.createElement('div'); lv.className = 'lv';
  lv.append(span('cl', 'Current Levels:'));
  ['range', 'speed', 'weapons', 'shields', 'mini'].forEach((k, i) => { const r = document.createElement('div'); r.className = 'lr'; r.append(span('', { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Mini' }[k]), span('n', String(p.tech[k]))); lv.append(r); });
  const bars = document.createElement('div'); bars.className = 'vb';
  const tb = B && B.tech, rows = tb ? [...tb.querySelectorAll('.barrow')] : [];
  rows.forEach((r, i) => { r.classList.add('w95vbar'); bars.append(r); });
  const names = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini', 'Radical'].slice(0, rows.length);
  const nm = document.createElement('div'); nm.className = 'vn';
  names.forEach((t, i) => nm.append(span(i % 2 ? 'lo' : 'hi', t, `left:${11 + 22 * i}px`)));
  body.append(lv, bars, nm);
  if (tb) tb.remove();
}

// Report Messages (dialog 351, drawn by the program; shots 008, 087, 090): this turn's reports, 32 pixels a row, the picture then the words,
// on white with the list's scroll bar; a click on a row acts on its report (the remake's reportAction: a battle's replay, a star shown).
function reportWindow() {
  const a = A(), w = toolWin('report', 'Report Messages'), body = w.querySelector('.tbody'), list = document.createElement('ul');
  list.className = 'rl'; list.setAttribute('role', 'list');
  (a.me().inbox || []).forEach((m) => {
    const li = document.createElement('li'); li.append(a.msgIconEl(m), span('rt', H().say ? H().say(a.G, m.text) : m.text));
    li.addEventListener('click', () => a.reportAction(m)); list.append(li);
  });
  body.innerHTML = ''; body.append(list);
}
T.panel = (panel, B) => {
  if (!W95ON()) return;
  if (B && B.planet) B.planet.remove();
  const [head, list] = fleetPanes();
  const low = document.createElement('div'); low.className = 'w95low';
  low.append(playersPane(), budgetPane(B));
  if (B && B.info) B.info.remove();
  if (B && B.budget) B.budget.remove();
  panel.prepend(starPane(), head, list, moneyPane(), low);
  techWindow(B);
  reportWindow();
};


// ---------- the map (unit 4) ----------
// Zoom In / Zoom Out (FUN_00455f49, FUN_00455fc8, the menu's 0x8020 / 0x8021 through the message map) step the map's cell through 6, 9,
// 12 and 17 pixels, 17 to start, as the Mac's: a cell is two light years (shot 054: Alshain to Wazn, "Dist 7", 111 pixels). The map
// opens centred on your home. Windows scroll bars, 16 pixels, at its right and foot; the stars' names in white under them; End Turn's
// clock at the map's top left (17, 15). With modern conveniences the remake's closer zooms follow the program's.
const LY = 2, ZOOMS = [6, 9, 12, 17].map(z => z * LY), ZOOMS_MODERN = ZOOMS.concat([24, 34, 48].map(z => z * LY));
const zooms = () => { const g = A() && A().G; return g && g.opts && g.opts.modern ? ZOOMS_MODERN : ZOOMS; };
const zoomIdx = (sc) => { const Z = zooms(); let b = 0; Z.forEach((z, i) => { if (Math.abs(Math.log(z / sc)) < Math.abs(Math.log(Z[b] / sc))) b = i; }); return b; };
const BAR = 16, MARGIN = 2; // the scroll bars' width; cells of black round the galaxy
const SB = { h: null, v: null };
function mapBox() { const a = A(), m = a && a.map(); return m ? [m.w, m.h] : [0, 0]; } // (the page's mapW / mapH: program pixels, the scroll bars already left out by T.mapInset)
function limits(v, g, w, h) { // the view's ox, oy between these keep the galaxy (and MARGIN cells round it) in reach
  const m = MARGIN * v.s, gw = g.W * v.s + 2 * m, gh = g.H * v.s + 2 * m;
  const x = gw <= w ? [(w - g.W * v.s) / 2, (w - g.W * v.s) / 2] : [w - g.W * v.s - m, m];
  const y = gh <= h ? [(h - g.H * v.s) / 2, (h - g.H * v.s) / 2] : [h - g.H * v.s - m, m];
  return { x, y };
}
const prevZoom = T.zoomTo, prevFit = T.fitView, prevClamp = T.clampView;
T.zoomTo = (s0, f) => {
  if (!W95ON()) return prevZoom ? prevZoom(s0, f) : Math.max(12, Math.min(140, s0 * f));
  const Z = zooms(), cur = zoomIdx(s0); let i = cur + (f > 1 ? 1 : f < 1 ? -1 : 0); return Z[Math.max(0, Math.min(Z.length - 1, i))];
};
T.fitView = (v, c) => {
  if (!W95ON()) { if (prevFit) prevFit(v, c); return; }
  const st = c.G.stars[c.sel != null ? c.sel : c.G.players[c.ME].homeStar]; v.s = ZOOMS[3];
  const w = c.mapW, h = c.mapH; if (st) { v.ox = w / 2 - st.x * v.s; v.oy = h / 2 - st.y * v.s; }
  const L = limits(v, c.G, w, h); v.ox = Math.max(L.x[0], Math.min(L.x[1], v.ox)); v.oy = Math.max(L.y[0], Math.min(L.y[1], v.oy));
};
T.clampView = (v, c) => {
  if (!W95ON()) { if (prevClamp) prevClamp(v, c); return; }
  const L = limits(v, c.G, c.mapW, c.mapH); v.ox = Math.max(L.x[0], Math.min(L.x[1], v.ox)); v.oy = Math.max(L.y[0], Math.min(L.y[1], v.oy));
};
// (on whenever the window layout is, game or not: the page measures the map before a game starts)
const W95LAY = () => de.classList.contains('w95win');
T.mapInset = () => (W95LAY() ? [BAR * (W95.s || 1), BAR * (W95.s || 1)] : [0, 0]);
T.mapPixel = () => (W95LAY() && W95.s > 1 ? [W95.s, W95.s] : null);
T.mapBg = '#000';
T.mapNames = (sc) => (W95ON() ? zoomIdx(sc) > 0 : sc > 18);
T.mapNameStyle = (cx) => { if (W95ON()) { cx.fillStyle = '#fff'; cx.font = '11px "MS Sans Serif", "Microsoft Sans Serif", Arial, sans-serif'; } };
// the scroll bars: a Windows 95 bar each, its thumb where the view is between the limits; an arrow moves a cell, the track a page,
// the thumb drags the map
function scrollBar(vertical) {
  const b = document.createElement('div'); b.className = 'w95sb ' + (vertical ? 'v' : 'h'); b.setAttribute('aria-hidden', 'true');
  b.innerHTML = '<i class="ar a0"></i><i class="tr"><i class="th"></i></i><i class="ar a1"></i>';
  const step = (d, page) => { const a = A(), v = a.UI.view, [w, h] = mapBox(); const n = page ? (vertical ? h : w) * 0.9 : v.s;
    if (vertical) v.oy -= d * n; else v.ox -= d * n; T.clampView(v, { G: a.G, mapW: w, mapH: h }); a.draw(); };
  b.querySelector('.a0').addEventListener('pointerdown', (e) => { e.preventDefault(); step(-1); });
  b.querySelector('.a1').addEventListener('pointerdown', (e) => { e.preventDefault(); step(1); });
  const tr = b.querySelector('.tr'), th = b.querySelector('.th');
  tr.addEventListener('pointerdown', (e) => { if (e.target !== tr) return; e.preventDefault(); const r = th.getBoundingClientRect(); step((vertical ? e.clientY < r.top : e.clientX < r.left) ? -1 : 1, true); });
  th.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation(); const a = A(), v = a.UI.view, [w, h] = mapBox(), L = limits(v, a.G, w, h), R = tr.getBoundingClientRect(), T0 = th.getBoundingClientRect();
    const span0 = (vertical ? R.height - T0.height : R.width - T0.width) || 1, lim = vertical ? L.y : L.x, p0 = vertical ? e.clientY : e.clientX, o0 = vertical ? v.oy : v.ox;
    const mv = (ev) => { const d = ((vertical ? ev.clientY : ev.clientX) - p0) / span0 * (lim[1] - lim[0]); if (vertical) v.oy = o0 - d; else v.ox = o0 - d; T.clampView(v, { G: a.G, mapW: w, mapH: h }); a.draw(); };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  });
  return b;
}
const prevAfterDraw = T.afterDraw;
T.afterDraw = () => {
  if (prevAfterDraw) prevAfterDraw();
  const wrap = document.getElementById('mapwrap'); if (!wrap) return;
  if (!W95ON()) { wrap.querySelectorAll('.w95sb, .w95corner').forEach(x => x.remove()); SB.h = SB.v = null; return; }
  if (!SB.h || !SB.h.isConnected) { SB.h = scrollBar(false); SB.v = scrollBar(true); const c = document.createElement('i'); c.className = 'w95corner'; wrap.append(SB.h, SB.v, c); }
  const a = A(), v = a.UI.view, [w, h] = mapBox(), L = limits(v, a.G, w, h);
  const put = (bar, lim, o, vis, tot) => { const th = bar.querySelector('.th'), f = lim[1] > lim[0] ? (lim[1] - o) / (lim[1] - lim[0]) : 0; th.style.setProperty('--f', String(Math.max(0, Math.min(1, f)))); th.style.setProperty('--z', String(Math.max(0.08, Math.min(1, vis / tot)))); };
  put(SB.h, L.x, v.ox, w, a.G.W * v.s + 2 * MARGIN * v.s); put(SB.v, L.y, v.oy, h, a.G.H * v.s + 2 * MARGIN * v.s);
};


// The report bubble (shots 010, 051, 293): bitmap 345 at the map's bottom left (3 in, its foot 31 above the map's), the report's picture
// at (12, 13), the words from (50, 6), "more..." (1348) at (50, 61). Click it for the next report, as everywhere in the remake.
const prevAfterMsg = T.afterMsg;
T.afterMsg = (box, info) => {
  if (prevAfterMsg) prevAfterMsg(box, info);
  box.classList.toggle('w95bub', !!box.querySelector('.card:not(.end):not(.waiting)'));
  if (!W95ON()) return;
  const card = box.querySelector('.card:not(.end):not(.waiting)'); if (!card) return;
  card.classList.add('bub95');
  const im = A().IMG['w95:b345']; if (im && im.src) card.style.backgroundImage = `url("${im.src}")`;
  const c = card.querySelector('.count'); if (c) c.textContent = 'more...';
};


// ---------- the dialogs (unit 7): SPACEHO.EXE's templates (js/skins/w95/dialogs.js) drawn at their dialog units ----------
// W95DLG(id): the dialog's controls placed at 1.5 x 1.625 pixels a unit (MS Sans Serif 8): STATIC words, push buttons (the default one
// ringed), list boxes (white, sunken, their own scroll bar), combo boxes (a <select>), edit fields, check boxes, group boxes, horizontal
// scroll bars (an <input type=range>); hidden controls left out. Returns the dialog's element and its controls by id (a STATIC's by its
// words). It opens through the remake's own window (A().modal), so Escape and the remake's window rules hold.
const DU = (x, y) => [x * 1.5, y * 1.625];
function W95DLG(id) {
  const D = (window.W95DLGS || {})[id]; if (!D) return null;
  const root = document.createElement('div'); root.className = 'w95dlg'; const [W, Hh] = DU(D.w, D.h);
  root.style.width = W + 'px'; root.style.height = Hh + 'px';
  const by = {};
  for (const [cid, kind, text, x, y, w, h, flags] of D.c) {
    if (/hidden/.test(flags)) continue;
    const [l, t] = DU(x, y), [ww, hh] = DU(w, h); let e;
    if (kind === 'STATIC') { e = document.createElement('div'); e.className = 'st' + (/\n/.test(text) || h > 10 ? ' ml' : ''); e.textContent = text; }
    else if (/push/.test(kind)) { e = document.createElement('button'); e.type = 'button'; e.className = 'pb' + (/default/.test(kind) ? ' def' : ''); e.textContent = text.replace(/&/g, ''); }
    else if (kind === 'LISTBOX') { e = document.createElement('div'); e.className = 'lbx'; e.setAttribute('role', 'listbox'); e.tabIndex = 0; }
    else if (kind === 'COMBOBOX') { e = document.createElement('select'); e.className = 'cbx'; hh0(e); }
    else if (kind === 'EDIT') { e = document.createElement('input'); e.className = 'ed'; }
    else if (/check box/.test(kind)) { e = document.createElement('label'); e.className = 'ck'; const i = document.createElement('input'); i.type = 'checkbox'; e.append(i, document.createTextNode(text)); }
    else if (/radio/.test(kind)) { e = document.createElement('label'); e.className = 'rb'; const i = document.createElement('input'); i.type = 'radio'; i.name = 'w95r' + id; e.append(i, document.createTextNode(text)); }
    else if (kind === 'group box') { e = document.createElement('fieldset'); e.className = 'gb'; if (text) { const lg = document.createElement('legend'); lg.textContent = text; e.append(lg); } }
    else if (/scroll bar/.test(kind)) { e = document.createElement('input'); e.type = 'range'; e.className = 'sb'; }
    else { e = document.createElement('div'); e.className = 'od'; }
    e.style.left = l + 'px'; e.style.top = t + 'px'; e.style.width = ww + 'px';
    if (kind !== 'COMBOBOX') e.style.height = hh + 'px';
    e.dataset.cid = String(cid); root.append(e);
    if (cid !== 65535) by[cid] = e; else if (text) by[text] = e;
  }
  return { el: root, by, D };
  function hh0(e) { e.style.height = '21px'; } // (a combo box's height is its list's; the field is one line)
}
function showDlg(dl, label) { const w = A().modal('', dl.el, { cls: 'w95dlgwin', label }); return w; }
// List of All Fleets (dialog 384, shot 043): "List of All Fleets:", the list (your fleets, one a line: "%s stationed at %s.", "%s leaving %s
// for %s to arrive in %d.", "%s to arrive at %s in %d.", "%s marooned at %s", 1350-1353), Sort By "Ship Power" / "Ship Class" (its
// DLGINIT), Go To Fleet and OK. The selected line in navy; a double click goes to the fleet.
const FLT = { sort: 0 };
function fleetsDialog() {
  const a = A(), g = a.G, rs = H().rules(g), dl = W95DLG(384); if (!dl) return false;
  const lb = dl.by[1175], cb = dl.by[1177];
  ['Ship Power', 'Ship Class'].forEach((t, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = t; cb.append(o); });
  cb.value = String(FLT.sort);
  const power = (f) => { let n = 0; for (const k in f.ships) { const d = H().getDesign(g, f.owner, +k); if (d) n += f.ships[k] * (rs.shipPower ? rs.shipPower(g, d) : 1); } return n; };
  const TYPE_ORDER = ['dread', 'fighter', 'bio', 'satellite', 'tanker', 'colony', 'scout'];
  const klass = (f) => { const ds = H().fleetDesigns(g, f); return Math.min(...ds.map(d => { const i = TYPE_ORDER.indexOf(d.type); return i < 0 ? 99 : i; })); };
  const line = (f) => {
    const t = fleetRow(g, f), star = (i) => g.stars[i].name;
    if (f.to != null) return cfmt('%s to arrive at %s in %d.', t, star(f.to), H().arrivalYear ? H().arrivalYear(g, Math.ceil((f.dist - f.prog) / H().fleetSpeed(g, f))) : g.year);
    if (f.dest != null) { const d = H().starDist(g, f.star, f.dest), turns = Math.ceil(d / H().fleetSpeed(g, f) - 1e-9); return cfmt('%s leaving %s for %s to arrive in %d.', t, star(f.star), star(f.dest), g.year + turns * ((rs.yearsPerTurn) || 10)); }
    return cfmt('%s stationed at %s.', t, star(f.star));
  };
  let sel = null;
  const fill = () => {
    let fs = g.fleets.filter(f => f.owner === a.ME && !f.sat);
    fs = fs.slice().sort((x, y) => FLT.sort ? klass(x) - klass(y) || power(y) - power(x) : power(y) - power(x));
    lb.innerHTML = '';
    fs.forEach((f) => { const r = span('li' + (sel === f.id ? ' sel' : ''), line(f)); r.setAttribute('role', 'option');
      r.addEventListener('click', () => { sel = f.id; fill(); }); r.addEventListener('dblclick', () => go(f)); lb.append(r); });
    if (sel == null && fs[0]) { sel = fs[0].id; fill(); }
  };
  const go = (f) => { a.closeModal(); const st = f.to != null ? f.from : f.star; if (st != null) { a.UI.sel = st; if (f.to == null) a.UI.selFleet = f.id; a.centerOn(st); } a.renderPanel(); a.draw(); };
  cb.addEventListener('change', () => { FLT.sort = +cb.value; fill(); });
  dl.by[1176].addEventListener('click', () => { const f = g.fleets.find(x => x.id === sel); if (f) go(f); });
  dl.by[1].addEventListener('click', () => a.closeModal());
  fill(); showDlg(dl, 'List of All Fleets');
  return true;
}

// List of All Explored Stars (dialog 356, shot 081): the stars you know (explored or owned; not those gone nova), sorted by name, then by
// Sort By (its DLGINIT: Metal, Quality, Gravity, Owner; Quality at first, the choice kept), the original's swap sort as FUN_004540a8 and the
// classic page's openExploredList: metal and quality down, gravity and owner up, the unexplored last. A row 20 high: the star's small
// picture (its map picture + 7000), the name at 21, the temperature at 121, the gravity at 196, the metal at 271; the selected row black.
const EXS = { mode: 1 };
function starsDialog() {
  const a = A(), g = a.G, p = a.me(), L = H().rules(g).exploredList || {}, dl = W95DLG(356); if (!dl) return false;
  const lb = dl.by[1131], cb = dl.by[1132];
  ['Metal', 'Quality', 'Gravity', 'Owner'].forEach((t, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = t; cb.append(o); });
  cb.value = String(EXS.mode);
  const rec = (st) => st.owner === a.ME ? { explored: true, owner: a.ME, g: st.g, t: st.t, metal: st.metal } : H().know(g, p, st.id);
  const ex = (st) => !!rec(st).explored, ownerOf = (st) => rec(st).owner;
  const q = (st) => ex(st) && L.quality ? L.quality(p, rec(st)) : 0;
  const swapSort = (arr, before) => { for (let i = 0; i < arr.length - 1; i++) for (let j = i + 1; j < arr.length; j++) if (before(arr[j], arr[i])) { const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
  const order = () => {
    const seen = g.stars.filter(st => { const k = rec(st); return (k.explored || k.owner >= 0) && !st.nova; });
    const arr = swapSort(seen, (x, y) => x.name < y.name), m = EXS.mode;
    const val = [(st) => ex(st) ? Math.max(0, rec(st).metal || 0) : -1, (st) => ex(st) ? q(st) : -1, (st) => ex(st) ? Math.round(rec(st).g * 100) : 0x7fff, (st) => ownerOf(st) < 0 ? 0x15 : ownerOf(st)][m];
    return swapSort(arr, m >= 2 ? (x, y) => val(x) < val(y) : (x, y) => val(x) > val(y));
  };
  let sel = null;
  const fill = () => {
    lb.innerHTML = '';
    order().forEach((st) => {
      const r = document.createElement('div'); r.className = 'xr' + (sel === st.id ? ' sel' : ''); r.setAttribute('role', 'option');
      const look = a.starLook(st.id), base = look && look.base, small = base && /^w95:b\d+$/.test(base) ? a.IMG['w95:b' + (+base.slice(5) + 7000)] : null, im = small || (base && a.IMG[base]);
      const ic = document.createElement('i'); ic.className = 'xi'; if (im && im.src) ic.style.backgroundImage = `url("${im.src}")`; r.append(ic);
      r.append(span('xn', st.name));
      if (ex(st)) { const k = rec(st), t10 = Math.round(10 * (72 + (k.t - p.homeT))), gr = Math.trunc(100 * k.g / Math.max(0.01, p.homeG));
        r.append(span('xt', cfmt('%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10))), span('xg', cfmt('%d.%2.2dG', Math.trunc(gr / 100), gr % 100)), span('xm', H().niceNum(Math.max(0, Math.round(k.metal || 0))))); }
      r.addEventListener('click', () => { sel = st.id; fill(); }); r.addEventListener('dblclick', () => go(st.id));
      lb.append(r);
    });
  };
  const go = (sid) => { a.closeModal(); a.UI.sel = sid; a.UI.selFleet = null; a.centerOn(sid); a.renderPanel(); a.draw(); };
  cb.addEventListener('change', () => { EXS.mode = +cb.value; fill(); });
  dl.by[1].addEventListener('click', () => { if (sel != null) go(sel); });
  dl.by[2].addEventListener('click', () => a.closeModal());
  fill(); showDlg(dl, 'List of All Explored Stars');
  return true;
}
const prevWindow = T.window;
T.window = (name, ...args) => {
  if (W95ON()) { if (name === 'fleets') return fleetsDialog(); if (name === 'stars') return starsDialog(); }
  return prevWindow ? prevWindow(name, ...args) : false;
};


// ---------- start-up (unit 9): the splash as dialog 315 (shot 001) ----------
// 231 x 251 units: the picture (control 1051, 231 x 149 at the top: the "Version 4" animation, js/skins/w95/ui.js title), the credits
// (its STATIC at (4, 154)), New World Computing's logo (control 1174 at (159, 152): bitmap 383), and Open Game, New Game and Quit along
// the foot (Quit, the default, can't close a web page: dimmed). The remake's own title-screen choices stay outside it.
const CREDITS = 'Written by Peter Commons\nArt by Howard Vives and Bob Van de Walle\nSounds by Mark Madeley and Guy Vardaman\nWindows programming by Paul Toth\nCopyright 1991-1996 by Delta Tao Software, Inc.\n760 Harvard Avenue Sunnyvale, CA 94087';
function splash315(doc) {
  const sp = doc.querySelector('#titlescreen .tsplash'), body = sp && sp.querySelector('.wbody'); if (!body || sp.classList.contains('w95splash')) return;
  sp.classList.add('w95splash');
  const cred = doc.createElement('div'); cred.className = 'w95cred'; cred.textContent = CREDITS;
  const logo = doc.createElement('i'); logo.className = 'w95logo';
  const row = doc.createElement('div'); row.className = 'w95btns';
  const o = doc.querySelector('#tcont'), n = doc.querySelector('#tnew');
  const q = doc.createElement('button'); q.type = 'button'; q.className = 'w95quit'; q.textContent = 'Quit'; q.disabled = true; q.title = 'A web page can’t close itself';
  if (o) { o.textContent = 'Open Game'; row.append(o); } if (n) { n.textContent = 'New Game'; row.append(n); } row.append(q);
  body.append(cred, logo, row);
}
const prevTitle = T.title;
T.title = (frame, IMG, Sound) => {
  const r = prevTitle ? prevTitle(frame, IMG, Sound) : false;
  const lg = document.querySelector('#titlescreen .w95logo'), im = IMG && IMG['w95:b383'];
  if (lg && im && im.src) lg.style.backgroundImage = `url("${im.src}")`;
  return r;
};


// ---------- battles (unit 10): DoOneBattle's window (FUN_00422339 with its "show" flag; the dialog FUN_00418b96 makes, template 346) ----------
// As shots 094-281 show it and the code draws it, the Mac 3.0.1 window's layout (the same program, ported: js/skins/mac12/ui.js battleWindow
// is this one's model): a black field 499 x 302; in white Arial semibold (FUN_00488fc9) "Summary of battle" / "at %s in %d:" (the 0x439 list,
// items 2 and 3) at (155, 1) and the line under; each side's face (yours 1405 / 1905, a computer's 2000 / 2500 + face) at (25, 2) for you and
// (300, 2) for the other, the name at (x + 67, 22); the groups (CalcOneGroup's) in a column under each, 53 apart, the ship's picture
// (T.shipPic) and the group's words under it; "Round %d" (item 4) at (194, 256); the bolts and bursts in colour; at the end the won / lost
// words and picture (3000 / 3010) in the middle. Skip, then Done, under the field. (The mood picture beside each face, 3141 + a mood the
// record doesn't keep, is left out.)
const BAT_FONT = '600 14px Arial, sans-serif', BAT_SMALL = '10px Arial, sans-serif';
function battleWindow95(b, k) {
  const a = A(), g = a.G, rs = H().rules(g), IMG = a.IMG, ME = a.ME;
  const W = 499, Hh = 302, S = 2, TICK = 1000 / 60;
  const pic = (n) => { const im = IMG['w95:b' + n]; return im && im.complete && im.naturalWidth ? im : null; };
  const VB = k.verBattle(), speed = Math.max(1, Math.round(30 * VB.f));
  const alive = b.start.map(() => true), hurt = []; let seq = 0, pop = b.pop0;
  const P0 = rs.battlePanel(g, b, { alive, hurt, pop, over: false, won: false }, ME);
  const leftSide = P0.leftSide, rightSide = b.sides.find(o => o !== leftSide);
  const fAlive = b.start.map(() => true); let fPop = b.pop0;
  for (const r of b.rounds) for (const ev of r) if (ev.k && !ev.p) fAlive[ev.ti] = false;
  if (b.popR && b.popR.length) fPop = b.popR[b.popR.length - 1];
  const viewer = b.sides.includes(ME) ? ME : b.sides[0];
  const foe = (o) => o !== viewer && !H().isAllied(g, o, viewer);
  const liveF = (pred) => b.start.some((u, i) => fAlive[i] && pred(u.o));
  const won = (liveF(o => !foe(o)) || (b.planetOwner >= 0 && !foe(b.planetOwner) && fPop > 0.0005)) && !liveF(foe) && !(b.planetOwner >= 0 && foe(b.planetOwner) && fPop > 0.0005);
  let sides;
  if (b.grp) sides = b.grp.map(L => L.map(x => (x === -1 ? { planet: true, units: [] } : { units: x })));
  else { sides = [[], []]; P0.cols.forEach((c, ci) => c.forEach(r => sides[ci].push({ planet: r.planet, units: r.units }))); }
  const ownerOf = (L) => { const q = L.find(x => !x.planet && x.units.length); return q ? b.start[q.units[0]].o : b.planetOwner; };
  if (b.grp && ownerOf(sides[0]) !== leftSide && ownerOf(sides[1]) === leftSide) sides.reverse();
  const cols = sides.map((L, ci) => L.slice().sort((p, q) => (q.planet ? 1 : 0) - (p.planet ? 1 : 0)).map((x, row) => Object.assign(x, { o: x.planet ? b.planetOwner : b.start[x.units[0]] ? b.start[x.units[0]].o : -1, ci, row })));
  const colX = [25, 300], owners = [leftSide, rightSide];
  const where = new Map(), planetAt = {};
  cols.forEach(L => L.forEach(x => { x.units.forEach(i => where.set(i, x)); if (x.planet) planetAt[x.o] = x; }));
  // a viewer who lost a battle of one round sees nothing of the other side: "You have no information." / "You were destroyed immediately."
  // at (145, 85) and (145, 100) (FUN_00424ce5, items 10 and 11)
  const hidden = [0, 1].map(ci => !won && b.rounds.length === 1 && owners[ci] !== ME && !(owners[ci] != null && H().isAllied(g, owners[ci], ME)));
  const c = document.createElement('canvas'); c.className = 'bw95'; c.width = W * S; c.height = Hh * S; c.setAttribute('aria-label', 'Summary of battle');
  const x = c.getContext('2d'); x.setTransform(S, 0, 0, S, 0, 0); x.imageSmoothingEnabled = false;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bw95b'; btn.textContent = 'Skip';
  const box = document.createElement('div'); box.className = 'bw95w'; box.append(c, btn);
  let stop = false, skip = false, done = false;
  btn.addEventListener('click', () => { if (done) a.closeModal(); else skip = true; });
  a.modal('', box, { cls: 'w95dlgwin bw95m', label: 'Summary of battle', onClose: () => { stop = true; } });
  const text = (t, h, v, font) => { x.font = font || BAT_FONT; x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText(t, h, v); };
  let seed = (b.id | 0) * 7919 + 13;
  const rnd = (lo, hi) => { seed = (seed * 16807) % 2147483647; return lo + (seed % (hi - lo + 1)); };
  const stars = Array.from({ length: 35 }, () => [rnd(10, W - 10), rnd(35, Hh - 12)]);
  const drawStars = () => { x.fillStyle = '#fff'; for (const [h, v] of stars) x.fillRect(h, v, 1, 1); };
  const face = (o, ci) => {
    const p = g.players[o]; if (!p) return;
    const id = o === ME ? (p.female ? 1905 : 1405) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20);
    const im = pic(id); if (im) x.drawImage(im, colX[ci], 2, 32, 32);
    text(p.name || '', colX[ci] + 67, p.name && p.name.length > 7 ? 24 : 20, p.name && p.name.length > 7 ? '600 11px Arial, sans-serif' : BAT_FONT);
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const GY = (row) => 53 * row + 38;
  const tile = (gr, gx, gy) => {
    let im = null;
    if (gr.planet) im = pic(1003);
    else { const u = b.start[gr.units[0]], d = H().getDesign(g, gr.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 }; im = T.shipPic ? T.shipPic(d, IMG) : null; }
    x.fillStyle = '#000'; x.fillRect(gx, gy, 128, 40);
    if (im) { const w = im.width, h = im.height, sc = Math.min(1, 128 / w, 40 / h), dx = gx + (128 - w * sc) / 2, dy = gy + (40 - h * sc) / 2;
      // (the right-hand side's ships face left, towards the other side: shots 094-099)
      if (gr.ci === 1 && !gr.planet) { x.save(); x.translate(dx + w * sc, dy); x.scale(-1, 1); x.drawImage(im, 0, 0, w * sc, h * sc); x.restore(); } else x.drawImage(im, dx, dy, w * sc, h * sc); }
  };
  const groupWords = (gr) => {
    if (gr.planet) return P0.planetWords(pop);
    const u = b.start[gr.units[0]], d = H().getDesign(g, u.o, u.did) || { type: u.t, name: '', W: 1, S: 1 };
    return P0.shipWords(d, gr.units.filter(i => alive[i]).length, gr.units.length, u.o === ME);
  };
  const grayPat = (() => { const p = document.createElement('canvas'); p.width = 2; p.height = 2; const q = p.getContext('2d'); q.fillStyle = '#000'; q.fillRect(0, 0, 1, 1); q.fillRect(1, 1, 1, 1); return x.createPattern(p, 'repeat'); })();
  const drawGroup = (gr) => {
    const gx = colX[gr.ci], gy = GY(gr.row);
    tile(gr, gx, gy);
    x.fillStyle = '#000'; x.fillRect(gx - 20, gy + 40, 170, 13);
    const t = groupWords(gr); x.font = BAT_SMALL; const w = x.measureText(t).width;
    text(t, gx + 64 - Math.trunc(w / 2), gy + 42, BAT_SMALL);
    if (!gr.planet) {
      const n = gr.units.filter(i => alive[i]).length;
      let f = 0, q = -1; for (const i of gr.units) { const h = hurt[i]; if (h && h.n > q && alive[i]) { q = h.n; f = h.f; } }
      let l = gx, r = gx + 128;
      if (n > 0) r = Math.min(gx + 128, gx + Math.trunc(128 * clamp(f, 0, 1)));
      if (r > l) { x.fillStyle = grayPat; x.fillRect(l, gy, r - l, 40); }
    }
    drawStars();
  };
  const roundLabel = (n) => { x.fillStyle = '#000'; x.fillRect(190, 254, 110, 18); text(cfmt('Round %d', n), 194, 256); };
  x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh);
  drawStars();
  P0.head.forEach((t, i) => text(t, 155, i ? 18 : 1));
  [0, 1].forEach(ci => { if (owners[ci] != null) face(owners[ci], ci); });
  [0, 1].forEach(ci => {
    if (hidden[ci]) { const L = rs.battleLines || {}; text(L.noInfo || 'You have no information.', 145, 85); text(L.destroyed || 'You were destroyed immediately.', 145, 100); skip = true; }
    else cols[ci].forEach(drawGroup);
  });
  const wait = (until) => new Promise(res => { const f = () => (stop || skip || performance.now() >= until ? res() : setTimeout(f, Math.min(TICK, until - performance.now()))); f(); });
  const cellOf = (ev, shooter) => shooter ? (ev.si >= 0 ? where.get(ev.si) : planetAt[ev.a]) : (ev.p ? planetAt[b.planetOwner] : where.get(ev.ti));
  const hsv = (h, v) => { h = (h % 65535) / 65535 * 6; const i = Math.floor(h), f = h - i, q = v * (1 - f), t = v * f; const [r, gg, bb] = [[v, t, 0], [q, v, 0], [0, v, t], [0, q, v], [t, 0, v], [v, 0, q]][i % 6]; return 'rgb(' + [r, gg, bb].map(u => Math.round(u * 255)).join(',') + ')'; };
  const weaponsOf = (gr) => { if (gr.planet) { const pl = g.players[gr.o]; return (pl && pl.tech && pl.tech.weapons) || 1; } const u = b.start[gr.units[0]], d = H().getDesign(g, u.o, u.did); return d && d.W ? d.W : 1; };
  async function laser(sg, tg) {
    let x1 = colX[sg.ci], y1 = GY(sg.row) + 20, x2 = colX[tg.ci], y2 = GY(tg.row) + 20;
    if (x2 > x1) { x1 += 129; x2 -= 1; } else { x2 += 129; x1 -= 1; }
    const dx = Math.trunc((x2 - x1) / 5), dy = Math.trunc((y2 - y1) / 5);
    const h0 = ((weaponsOf(sg) - 1) * 4000) % 65535, cols3 = [hsv(h0, 1), hsv(h0 + 7500, 45000 / 65535), hsv(h0 + 15000, 25000 / 65535)];
    const snap = document.createElement('canvas'); snap.width = c.width; snap.height = c.height; snap.getContext('2d').drawImage(c, 0, 0);
    const back = () => { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(snap, 0, 0); x.restore(); };
    const seg = (h0_, v0, h1, v1) => { x.lineWidth = 1; for (const [o, ci] of [[0, 0], [1, 1], [-1, 1], [2, 2], [-2, 2]]) { x.strokeStyle = cols3[ci]; x.beginPath(); x.moveTo(h0_ + 0.25, v0 + o + 0.25); x.lineTo(h1 + 0.25, v1 + o + 0.25); x.stroke(); } };
    let h = x1, v = y1;
    for (let i = 0; i < 5 && !stop && !skip; i++) { const t0 = performance.now(); back(); seg(h, v, h + dx, v + dy); h += dx; v += dy; await wait(t0 + TICK); }
    back();
  }
  async function explosion(tg, ev, until) {
    const l = colX[tg.ci], tp = GY(tg.row), dm = ev.dm | 0;
    if (ev.snd !== 3003) { const im = pic(12000 + (dm % 3)); if (im) x.drawImage(im, l + (dm % 111), tp + (dm % 23), 17, 17); return; }
    if (!VB.full) return;
    const oval = (sz, style, lw) => { const r = { l: l + sz, r: l + 128 - sz, t: tp + Math.trunc(40 * sz / 128), b: tp + 40 - Math.trunc(40 * sz / 128) }; if (r.r <= r.l || r.b <= r.t) return; x.strokeStyle = style; x.lineWidth = lw || 1; x.beginPath(); x.ellipse((r.l + r.r) / 2, (r.t + r.b) / 2, (r.r - r.l - 1) / 2, (r.b - r.t - 1) / 2, 0, 0, Math.PI * 2); x.stroke(); };
    for (let sz = 63; sz > 0 && !stop && !skip; sz--) { oval(sz, hsv((63 - sz) * 175, 1)); if (sz % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
    for (let sz = 1; sz < 64 && !stop && !skip; sz++) { oval(sz, '#000', 2); if (sz % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
  }
  const apply = (ev) => { if (ev.p) { if (ev.php != null) pop = ev.php / 1000; } else { if (ev.f != null) hurt[ev.ti] = { n: ++seq, f: ev.f }; if (ev.k) alive[ev.ti] = false; } };
  const finish = () => {
    if (stop) return;
    for (const r of b.rounds) for (const ev of r) apply(ev);
    pop = fPop; done = true;
    [0, 1].forEach(ci => { if (!hidden[ci]) cols[ci].forEach(drawGroup); });
    [0, 1].forEach(ci => {
      const o = owners[ci]; if (o == null) return;
      const left = b.start.some((u, i) => alive[i] && u.o === o) || (b.planetOwner === o && pop > 0.0005);
      if (!left) { const h = colX[ci]; x.strokeStyle = '#f00'; x.lineWidth = 2; x.beginPath(); x.moveTo(h + 1, 3); x.lineTo(h + 33, 35); x.moveTo(h + 1, 35); x.lineTo(h + 33, 3); x.stroke(); }
    });
    const P = rs.battlePanel(g, b, { alive, hurt, pop, over: true, won }, ME);
    (P.end || []).forEach((t, i) => text(t, 155, i ? 147 : 130));
    const im = pic(won ? 3000 : 3010); if (im) x.drawImage(im, 185, 164, 74, 74);
    btn.textContent = 'Done';
  };
  (async () => {
    let deadline = performance.now() + speed * TICK;
    for (let r = 0; r < b.rounds.length && !stop && !skip; r++) {
      roundLabel(r + 1);
      const R = b.rounds[r];
      for (let e = 0; e < R.length && !stop && !skip;) {
        let n = 1;
        if (!VB.full) while (R[e + n] && R[e + n].si === R[e].si && R[e + n].a === R[e].a && !R[e + n - 1].k) n++;
        for (let j = 0; j < n - 1; j++) apply(R[e + j]);
        const ev = R[e + n - 1], sg = cellOf(ev, true), tg = cellOf(ev, false);
        if (sg && tg && !hidden[tg.ci] && !hidden[sg.ci]) {
          await laser(sg, tg); if (stop || skip) break;
          a.Sound.play(k.shotSnd(ev, 3000)); apply(ev); drawGroup(tg);
          deadline += speed * TICK; await explosion(tg, ev, deadline); await wait(deadline);
        } else apply(ev);
        e += n;
      }
      if (b.popR && b.popR[r] != null) pop = b.popR[r];
    }
    finish();
  })();
}
// (a getter: the classic page uses any T.battleWindow it finds, so it exists only while the window layout is on and the ruleset has the words)
Object.defineProperty(T, 'battleWindow', { configurable: true, get: () => (W95ON() && H().rules(A().G).battlePanel ? battleWindow95 : undefined) });


// ---------- end of the game (unit 11) ----------
// You won / you lost (dialog 377, shots 295, 323): the words (control 1161) at (25, 9), the picture (1160: 3000 won, 3010 lost) at (31, 34),
// OK at the foot. The words are the ruleset's (rs.youWon / rs.youLost).
const prevWonLayout = T.youWonLayout;
T.youWonLayout = (kind, Y, done) => {
  if (!W95ON()) return prevWonLayout ? prevWonLayout(kind, Y, done) : false;
  const a = A(), dl = W95DLG(377); if (!dl) return false;
  dl.by[1161].textContent = Y.text || dl.by[1161].textContent; dl.by[1161].classList.add('ml');
  const im = a.IMG['w95:b' + (kind === 'lost' ? 3010 : 3000)], pc = dl.by[1160];
  if (im && im.src) { pc.style.background = `#000 url("${im.src}") center / contain no-repeat`; pc.style.imageRendering = 'pixelated'; } // (on black: shots 295, 323)
  dl.by[1].addEventListener('click', () => a.closeModal());
  a.modal('', dl.el, { cls: 'w95dlgwin', sticky: true, label: kind === 'lost' ? 'You lost' : 'You won', onClose: done });
  return true;
};
// Name a Star (dialog 378, shot 297): the words at (6, 6), the won picture (control 1159) at (9, 61), "New Star Name:" at (88, 71), the
// field at (86, 84), OK at (111, 116); no Cancel: OK with the name blank names none (as the dialog says). The remake's own form and field.
const prevNameStar = T.nameStarLayout;
T.nameStarLayout = (f, o) => {
  if (!W95ON()) return prevNameStar ? prevNameStar(f, o) : false;
  const a = A(), dl = W95DLG(378); if (!dl) return false;
  const decline = f.querySelector('button[type=button]');
  f.addEventListener('submit', (e) => { if (!o.inp.value.trim() && decline) { e.preventDefault(); e.stopImmediatePropagation(); decline.click(); } }, true);
  const NS = o.NS, words = [NS.text, NS.rule, NS.hint].filter(Boolean).join('\n\n');
  const st = dl.el.querySelector('.st.ml'); if (st && words && (NS.rule || NS.hint)) st.textContent = words; // (else the dialog's own three paragraphs)
  const im = a.IMG['w95:b3000'], pc = dl.by[1159]; if (im && im.src) pc.style.background = `#000 url("${im.src}") center / contain no-repeat`;
  const ed = dl.by[1162]; o.inp.className = 'ed'; o.inp.setAttribute('style', ed.getAttribute('style')); ed.replaceWith(o.inp);
  o.err.setAttribute('style', 'position:absolute;left:129px;top:160px;width:140px;margin:0;font-size:10px');
  const ok = dl.by[1]; const sub = document.createElement('button'); sub.type = 'submit'; sub.className = ok.className; sub.setAttribute('style', ok.getAttribute('style')); sub.textContent = 'OK'; ok.replaceWith(sub);
  f.innerHTML = ''; f.append(dl.el); dl.el.append(o.err);
  return 'w95dlgwin';
};


// The remake's plain questions (T.confirm): the armageddon device's (4.0.5's two lists, rs.armageddonAsk) as dialog 376 (shots 086, 298, 299:
// the words (control 1106) at (7, 3), the picture (1138: bitmap 3520) at (7, 46), Cancel at (83, 79), OK at (151, 79); shot 299's question
// has Abort and Party Pooper); every other one as the program's message box (shots 033, 034, 311): the caption "V4.0.5", the warning
// sign, the words, the buttons centred.
const CAPTURED_BUTTONS = { "Are you just doing this because you think you'll win but it's really late and so you want to go to bed?": ['Party Pooper', 'Abort'] };
const prevConfirm = T.confirm;
T.confirm = (text, yes, labels) => {
  if (!W95ON() || (text && text.nodeType)) return prevConfirm ? prevConfirm(text, yes, labels) : false;
  const a = A(), t = String(text), AA = H().rules(a.G).armageddonAsk || [];
  const norm = (u) => String(u).replace(/\s+/g, ' ').trim();
  const arm = AA.some(L => L.some(q => norm(H().say(a.G, q)) === norm(t)));
  const L2 = labels || CAPTURED_BUTTONS[norm(t)] || null;
  if (arm) {
    const dl = W95DLG(376); if (!dl) return false;
    dl.by[1106].textContent = t; dl.by[1106].classList.add('ml');
    const im = a.IMG['w95:b3520']; if (im && im.src) dl.by[1138].style.background = `url("${im.src}") left top / 80px 74px no-repeat`;
    dl.by[1].textContent = L2 ? L2[0] : 'OK'; dl.by[2].textContent = L2 ? L2[1] : 'Cancel';
    dl.by[1].addEventListener('click', () => { a.closeModal(); yes(); }); dl.by[2].addEventListener('click', () => a.closeModal());
    showDlg(dl, 'Armageddon'); return true;
  }
  const box = document.createElement('div'); box.className = 'w95msg';
  box.innerHTML = '<div class="mcap"><span>V4.0.5</span><i class="x"></i></div><div class="mbody"><i class="warn"></i><p></p></div><div class="mbtns"></div>';
  box.querySelector('p').textContent = t;
  const mk = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', fn); return b; };
  const ok = mk(L2 ? L2[0] : 'OK', () => { a.closeModal(); yes(); }), no = mk(L2 ? L2[1] : 'Cancel', () => a.closeModal());
  box.querySelector('.mbtns').append(ok, no); box.querySelector('.x').addEventListener('click', () => a.closeModal());
  const w = a.modal('', box, { cls: 'w95msgwin', label: 'V4.0.5' }); if (a.markYesNo) try { a.markYesNo(w, ok, no); } catch (e) {}
  ok.focus(); return true;
};

// ---------- the caption bar ----------
// The window's own: the program's icon, the title (#title, written by the classic page), and the minimise, maximise and
// close boxes (drawn only: the remake has no window to shrink).
const page0 = T.page;
T.page = (doc) => {
  if (page0) page0(doc);
  splash315(doc);
  const bar = doc.getElementById('menubar'), title = doc.getElementById('title');
  if (!bar || !title || doc.getElementById('w95cap')) return;
  const cap = doc.createElement('div'); cap.id = 'w95cap'; cap.setAttribute('aria-hidden', 'true');
  cap.innerHTML = '<span class="w95icon"></span><span class="w95boxes"><i class="mn"></i><i class="mx"></i><i class="cl"></i></span>';
  bar.parentNode.insertBefore(cap, bar);
  cap.insertBefore(title, cap.lastChild);
};
})();
