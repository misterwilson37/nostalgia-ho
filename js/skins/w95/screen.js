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
// Every word the skin writes goes through the remake's interface languages (js/ui-text.js, js/ui-lang.js: HOAPI.tl), the program's
// English being the key; a filled template is translated first, then filled. (Jake's rule: interface text through js/ui-text.js.)
const TL = (s) => { const a = window.HOAPI; try { return a && a.tl ? a.tl(s) : s; } catch (e) { return s; } };
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
const clickEndTurn = () => { const b = document.querySelector('#msg .clock') || document.querySelector('#w95clk .clock'); if (b) b.click(); };
const dim = () => true, noGame = () => !(window.HOAPI && HOAPI.G);
const battleHere = () => { const a = window.HOAPI; return !!(a && a.G && a.UI.sel != null && a.lastBattles(a.UI.sel).length); };
// Hide Information (shot 050, Alt+I): the information column goes and the map takes the window
const infoOff = () => de.classList.contains('w95noinfo');
const setInfo = (on) => { de.classList.toggle('w95noinfo', !on); const a = window.HOAPI; if (a && a.G) { a.resize(); a.draw(); } };
// (each item's words a function: the menus follow a change of language)
const lab = (w) => () => TL(w);
T.menuLayout = {
  File: [[lab('New Game'), 'Game/New game…'], [lab('Open Game...'), 'Game/Saved games…'], '-',
    [lab('Save Game'), 'Game/Export this game…'], '-',
    [lab('End Turn'), clickEndTurn, null, null, () => !(window.HOAPI && HOAPI.G), 'T'], '-',
    [lab('Recent File'), () => {}, null, null, dim], '-',
    [lab('Exit'), 'Game/Quit to title']],
  // (4.0.5's Edit menu has nothing the remake does: shown dimmed, as in shot 035)
  Edit: [[lab('Undo'), () => {}, null, null, dim, 'Z'], '-', [lab('Cut'), () => {}, null, null, dim, 'X'], [lab('Copy'), () => {}, null, null, dim, 'C'], [lab('Paste'), () => {}, null, null, dim, 'V']],
  Options: [[lab('Auto Play...'), () => (W95ON() ? autoPlayDialog() : HOAPI.openAutoPlay()), null, null, () => noGame() || !!(HOAPI.G && HOAPI.G.over)], '-', [null, 'View/#4'], '-',
    [lab('Master Point List...'), 'Game/Master Point List…'], [lab('Hall of Fame...'), 'Game/Hall of Fame…'], [lab('Hall of Shame...'), 'Game/Hall of Shame…'], '-',
    [lab('Preferences...'), () => (W95ON() ? prefsDialog() : HOAPI.openPrefs()), null, null, noGame]],
  Ships: [[lab('Build/Design Ships...'), 'Ships/Build ships at selected colony…'], '-',
    [lab('List All Fleets'), 'Ships/List all fleets…'], [lab('Organize Ships...'), () => { const a = HOAPI; if (a && a.G && a.UI.sel != null) (W95ON() ? organizeDialog(a.UI.sel) : a.openOrganize(a.UI.sel)); }, null, null, () => noGame() || HOAPI.UI.sel == null], [null, 'Ships/#3'], '-',
    // (the last item names the selected star's battle, or reads "No Battles here..." dimmed: shot 042)
    [null, 'Ships/#1']],
  Galaxy: [[lab('Compare Players...'), 'Galaxy/Compare players…'], [lab('Graph History...'), 'Game/Players and history'], [lab('List All Explored Stars...'), 'Galaxy/List explored stars…'], '-',
    [lab('Dip Into Savings'), 'Galaxy/Dip into savings…'], '-',
    [lab('Alliances...'), () => (W95ON() ? allianceDialog() : HOAPI.openPlayers()), null, null, noGame], [lab('Give Money/Metal...'), 'Galaxy/Give money or metal…'], [null, 'Galaxy/#9'], [lab('Send Message...'), 'Galaxy/Send a message…'], '-',
    [null, 'Galaxy/#10']],
  // (shot 050: no ticks; Chat Window is dimmed out of a network game; Zoom In dimmed at the closest zoom)
  Window: [[lab('Tech Spending Window'), () => setWin('tech', !winOpen('tech')), null, null, noGame, '1'],
    [lab('Report Window'), () => setWin('report', !winOpen('report')), null, null, noGame, '2'],
    [lab('Chat Window'), () => {}, null, null, dim, '3'], '-',
    [null, 'View/#0'], [null, 'View/#1'], [lab('Fit Galaxy'), 'View/Fit galaxy'], // (by place: T.menus has renamed them)
    [() => (infoOff() ? 'Show Information' : 'Hide Information'), () => setInfo(infoOff()), null, null, noGame, 'Alt+I'], '-',
    [lab('Clean Up Windows'), () => cleanUp(), null, null, noGame]],
  Help: [[lab('About Spaceho...'), () => aboutDialog(), null, null, () => !W95ON()], [lab('Help Topics'), 'Help/How to play'], [null, 'Help/#1']],
};
// the key equivalents the captures show, by the remake's item (its English label)
const KEYS = { 'New game…': 'N', 'Saved games…': 'O', 'Export this game…': 'S', 'Quit to title': 'Q', 'Build ships at selected colony…': 'B', 'List all fleets…': 'L',
  'Compare players…': 'Y', 'Players and history': 'H', 'Dip into savings…': 'D', 'Send a message…': 'M' };
T.menus = (menus) => {
  for (const m in menus) for (const it of menus[m]) if (typeof it[0] === 'string' && KEYS[it[0]]) it[5] = KEYS[it[0]];
  // Ships' last item (shot 042): "Review Battle", or "No Battles here..." dimmed when the selected star has had none; Window's zooms
  // dimmed at their ends, Ctrl+I and Ctrl+J (menu 2)
  for (const it of menus.Ships || []) if (it[0] === 'Review battle…') { it[0] = () => TL(battleHere() ? 'Review Battle' : 'No Battles here...'); it[4] = () => !battleHere(); it[5] = null; } // (shot 042: no key shown)
  for (const it of menus.View || []) {
    if (it[0] === 'Zoom in') { it[0] = lab('Zoom In'); it[4] = () => noGame() || zoomIdx(HOAPI.UI.view.s) >= zooms().length - 1; it[5] = 'I'; }
    if (it[0] === 'Zoom out') { it[0] = lab('Zoom Out'); it[4] = () => noGame() || zoomIdx(HOAPI.UI.view.s) <= 0; it[5] = 'J'; }
  }
  // Options' "Sound", ticked while on (shot 036), in place of the remake's "Turn sound off / on"
  for (const it of menus.View || []) if (typeof it[0] === 'function') { let t = ''; try { t = it[0](); } catch (e) {} if (/sound/i.test(t)) { it[0] = lab('Sound'); it[3] = () => !!(window.HOAPI && HOAPI.Sound.on); } }
};
T.keyName = (k) => (/^Alt/.test(k) ? k : 'Ctrl+' + k);
T.hoIntoLast = () => true;
// (the menu's name as one text, so that the page's languages can swap it; its first letter underlined by the CSS, as Windows marks its key)
T.menuName = (name) => TL(name);

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
  if (!yours && !(k && k.explored)) box.append(span('noinfo', TL('You have no information about this planet.')));
  else {
    const src = yours ? s : k;
    const t10 = Math.round(10 * (72 + (src.t - p.homeT))), gr = Math.trunc(100 * src.g / Math.max(0.01, p.homeG));
    if (yours) { row(0, TL('Income:'), '$' + H().niceNum(Math.round(H().planetIncome(g, p, s)))); row(1, TL('Pop:'), H().niceNum(H().popNum(g, s.pop))); }
    else { row(0, TL('Owner'), k.owner >= 0 ? g.players[k.owner].name : TL('No One')); row(1, TL('Pop:'), k.owner >= 0 ? TL('Unknown') : TL('Uninhabited')); }
    row(2, TL('Temp:'), cfmt('%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10)));
    row(3, TL('Gravity:'), cfmt('%d.%2.2dG', Math.trunc(gr / 100), gr % 100));
    row(4, TL('Metal:'), H().niceNum(Math.round(src.metal)));
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
  // (a click on the pane, but on the gauge, opens Planet Info: FUN_0048b262)
  box.addEventListener('click', (e) => { if (e.target.closest('.gauge')) return; planetInfoDialog(s.id); });
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
  const im = A().IMG['w95:b1410']; if (im) { const c = document.createElement('canvas'); c.width = 10; c.height = 67; c.getContext('2d').drawImage(im, 6, 0, 10, 67, 0, 0, 10, 67); g.append(c); } // (picture 1410 from its column 6: FUN_0048ada8)
  // the thumb: picture 1411's 8 x 6 at (width - 9, height - 7) (FUN_0048ada8, this+0x2cc), at 1 + share * 58 / 1000 (FUN_0048f855)
  const th = document.createElement('canvas'); th.width = 8; th.height = 6; th.className = 'gth'; const t1 = A().IMG['w95:b1411'];
  if (t1 && t1.width) th.getContext('2d').drawImage(t1, t1.width - 9, t1.height - 7, 8, 6, 0, 0, 8, 6); g.append(th);
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
// step the 14 stars behind it move a pixel left. The step's rate: the program steps the planet, the selection ring and the sky together
// (FUN_00468e55 -> FUN_0040aa02 -> FUN_0048bd31 / FUN_00492ccb) from the application's idle loop (FUN_0047d666), when time() has moved on
// by more than 0.1 second (so each new second) and on every 200th idle pass within one: a rate set by the machine's speed, not a timer.
// PLANET_MS keeps 3.0.1's six a second for all three.
const PLANET = { c: 0, n: 0, star: null, timer: null, stars: Array.from({ length: 14 }, () => ({ h: Math.floor(Math.random() * 116), v: 1 + Math.floor(Math.random() * 81) })) };
const PLANET_MS = 1000 / 6;
function texFor(s, p) {
  const r = Math.trunc(100 * Math.max(s.g, p.homeG) / Math.max(0.01, Math.min(s.g, p.homeG)));
  return r < 150 ? 6100 + s.id % 6 : r < 201 ? 6110 + s.id % 3 : r < 257 ? 6120 + s.id % 4 : 6130;
}
// the ice caps' white is see-through: the program loads each cap twice, a mask (all but white black) ANDed in and a copy with white made
// black ORed over it (FUN_00492c58's loader, FUN_00492ccb's 0x8800c6 / 0xee0086 blits)
const WCLR = new Map();
function whiteClear(im) {
  if (!im || !im.width) return null; if (WCLR.has(im)) return WCLR.get(im);
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  try { const d = x.getImageData(0, 0, c.width, c.height), p = d.data; for (let i = 0; i < p.length; i += 4) if (p[i] === 255 && p[i + 1] === 255 && p[i + 2] === 255) p[i + 3] = 0; x.putImageData(d, 0, 0); } catch (e) { return im; }
  WCLR.set(im, c); return c;
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
  if (d10 > 0) { const n = Math.min(22, Math.trunc(d10 / 107)) + 6, c1 = whiteClear(a.IMG['w95:b6150']), c2 = whiteClear(a.IMG['w95:b6151']);
    if (c1 && c1.width) sx.drawImage(c1, 0, 0, 167, D, 0, n - 28, 167, D); if (c2 && c2.width) sx.drawImage(c2, 0, 0, 167, D, 0, 28 - n, 167, D); }
  const o = document.createElement('canvas'); o.width = o.height = D; const ox = o.getContext('2d'); ox.imageSmoothingEnabled = false;
  ox.drawImage(strip, off, 0, 167 - off, D, 0, 0, 167 - off, D); if (off) ox.drawImage(strip, 0, 0, off, D, 167 - off, 0, off, D);
  const c = PLANET.n, m = document.createElement('canvas'); m.width = m.height = D; const mx = m.getContext('2d');
  const half = c < 112 ? [0, D / 2] : [D / 2, D], w = c < 56 ? 56 - c : c < 112 ? c - 56 : c < 168 ? 168 - c : c - 168, el = Math.trunc((D - w) / 2);
  mx.fillStyle = '#000'; mx.fillRect(half[0], 0, half[1] - half[0], D);
  mx.globalCompositeOperation = (c < 56 || c >= 168) ? 'destination-out' : 'source-over';
  if (w > 0) { mx.beginPath(); mx.ellipse(el + w / 2, D / 2, w / 2, D / 2, 0, 0, Math.PI * 2); mx.fill(); }
  mx.globalCompositeOperation = 'source-in'; mx.fillStyle = 'rgba(0,0,0,0.5)'; mx.fillRect(0, 0, D, D); // (the dark copy: every channel halved, FUN_004926df)
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
  if (f.scrap301) L.push([TL('Fleet to be scrapped for metal.')]);
  else if (f.dest == null) L.push([TL('Stationed at:'), star(f.star)]);
  else {
    const hops = [f.star, f.dest].concat(f.path || []); let dist = 0, time = 0;
    for (let i = 0; i + 1 < hops.length; i++) { const d = H().starDist(g, hops[i], hops[i + 1]); dist += d; time += Math.ceil(d / sp - 1e-9); }
    const end = hops[hops.length - 1];
    if (end === f.dest) L.push([TL('Departing To:'), cfmt(TL('%s (Dist %d; Time %d)'), star(end), Math.round(dist), time)]);
    else L.push([cfmt(TL('Going to %s (D %d; T %d) via %s'), star(end), Math.round(dist), time, star(f.dest))]);
  }
  const ds = H().fleetDesigns(g, f); let third;
  if (ds.some(d => d.type === 'colony')) third = (f.colonists || 0) > 0 ? TL('Full') : TL('Empty');
  else { let m = 0; for (const k in f.ships) { const d = H().getDesign(g, f.owner, +k); if (d) m += f.ships[k] * H().designCost(g, d).metal; } third = cfmt(TL('Scrap: %s'), H().niceNum(Math.trunc(m * 3 / 4))); }
  L.push([cfmt(TL('Fuel: %d/%d'), Math.round(f.fuel || 0), H().fleetMaxRange(g, f)), cfmt(TL('Speed: %d'), sp), third]);
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
  else if (s && !here.length && !others.length) head.append(span('', TL('There are no fleets at this planet.'), 'left:3px;top:1px'));
  const list = document.createElement('section'); list.className = 'w95pane w95flist'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Fleets');
  const rs = H().rules(g);
  here.forEach(f => { const r = span('row' + (sel && f.id === sel.id ? ' sel' : '') + (f.dest != null ? ' go' : '') + (f.newThisTurn ? ' new' : '') + (f.scrap301 ? ' scrap' : ''), fleetRow(g, f));
    r.setAttribute('role', 'option'); r.addEventListener('click', () => { if (a.UI.selFleet !== f.id) { a.UI.selFleet = f.id; a.renderPanel(); a.draw(); } }); list.append(r); });
  others.forEach(f => { const own = g.players[f.owner]; list.append(span('row other', rs.otherFleetRow ? (rs.otherFleetRow(null, f) || '') : cfmt(TL("%s's %s"), own ? own.name : '?', fleetRow(g, f)))); });
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
  row(0, TL('Metal:'), H().niceNum(Math.round(p.metal)), cm < 0 ? `(down ${H().niceNum(-cm)})` : `(up ${H().niceNum(cm)})`);
  row(1, TL('Savings:'), '$' + H().niceNum(Math.round(p.savings)), `(Int: ${kfmt(Math.round(pr.interest || 0))})`, p.savings < 0);
  row(2, TL('Net Income:'), '$' + H().niceNum(Math.round(pr.net)), ci < 0 ? `(down $${kfmt(-ci)})` : `(up $${kfmt(ci)})`);
  return box;
}
// The players (the list at the bottom left, 105 x 174 at (5, 271)): rows 24 high, a tick for a player whose turn is done, the small face
// (8405 / 8905 for you, 9000 + face / 9500 + face for the computer players: the 32 x 32 faces' numbers + 7000), the name; a cross over the
// face of one who is out. The order (FUN_00489232, a selection sort each time it draws): the players still in, the one with the larger first
// figure of his record (+0, beside Net Income's +8: gross income, the remake's lastGross) first; then those out, the latest out first. A
// mutual ally's face carries badge 13000, a best buddy's 13001.
function playersPane() {
  const a = A(), g = a.G, IMG = a.IMG;
  const box = document.createElement('section'); box.className = 'w95players'; box.setAttribute('aria-label', 'Players');
  const inP = (q) => q.alive !== false && !q.surrendered, outY = (q) => (q.outYear != null ? q.outYear : g.year);
  const list = g.players.slice();
  for (let i = 0; i < list.length - 1; i++) for (let j = i + 1; j < list.length; j++) {
    const A1 = list[i], B1 = list[j], ai = inP(A1), bi = inP(B1);
    if ((ai && bi && (A1.lastGross || 0) < (B1.lastGross || 0)) || (!ai && bi) || (!ai && !bi && outY(A1) < outY(B1))) { list[i] = B1; list[j] = A1; }
  }
  list.forEach((q) => {
    const r = document.createElement('div'); r.className = 'prow' + (q.alive === false ? ' out' : '');
    const done = !q.human || (g.done || []).includes(q.id);
    r.append(span('tick', done && q.id !== a.ME ? '√' : ''));
    const n = q.human ? (q.female ? 8905 : 8405) : (q.female ? 9500 : 9000) + (q.face || 0) % 20, im = IMG['w95:b' + n];
    const f = document.createElement('i'); f.className = 'face'; if (im && im.src) f.style.backgroundImage = `url("${im.src}")`; r.append(f);
    const lv = q.id === a.ME ? 0 : pactLevel(g, a.ME, q.id), bd = lv && IMG['w95:b' + (lv === 2 ? 13001 : 13000)];
    if (bd && bd.width) { const k = document.createElement('canvas'); k.width = k.height = 16; k.className = 'pact'; k.getContext('2d').drawImage(whiteClear(bd) || bd, 0, 0); f.append(k); }
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
  box.append(span('pct', TL('100%')));
  // the scale's ticks under "100%" (FUN_0045aae1): 2 pixels up from the scale's line, at i * 77 / 10 on the linear scale; on the log
  // scale at 10% ... 100% (the place of each measured from shot 010: the program's log table lost in the decompile)
  const tk = document.createElement('div'); tk.className = 'w95ticks'; tk.setAttribute('aria-hidden', 'true');
  let lg = false; try { const sc = A().budgetScale && A().budgetScale(); lg = !!(sc && sc.id === 'log'); } catch (e) {}
  (lg ? [22, 35, 45, 52, 57, 62, 66, 70, 73, 77] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => Math.trunc(i * 77 / 10))).forEach(x => { const t = document.createElement('i'); t.style.left = x + 'px'; tk.append(t); });
  box.append(tk);
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
    if (st.abandon || p.abandon === st.id) { r.classList.add('note', 'red'); if (bv) bv.textContent = TL('Abandoning'); }
    else if (tf && mf) { r.classList.add('note'); if (inc < 0) r.classList.add('red'); if (bv) bv.textContent = '$' + H().niceNum(inc); }
    else {
      const t = tf ? 0 : mf ? 1 : (st.terra == null ? 0.5 : st.terra), mix = (c1, c2) => c1.map((v, k) => Math.round(v * t + c2[k] * (1 - t)));
      // heavy gravity (FUN_0045aae1: more than 2.56 times your home's, or under 1 / 2.56) terraforms in red (DAT_005b19bc #dd0807) instead of
      // green; the shades as FUN_00446afe / FUN_004468c0 make them: the lines above at half saturation, below and right at half value
      // (red as 256-colour Windows showed #dd0807: shot 078's Metal line)
      const gr = Math.trunc(100 * Math.max(st.g, p.homeG) / Math.max(0.01, Math.min(st.g, p.homeG))) > 256;
      const hsvSet = (c) => { const [r0, g0, b0] = c.map(v => v / 255), mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0), v = mx, sat = mx ? (mx - mn) / mx : 0;
        let h = 0; if (mx !== mn) { const d = mx - mn; h = mx === r0 ? (g0 - b0) / d + (g0 < b0 ? 6 : 0) : mx === g0 ? (b0 - r0) / d + 2 : (r0 - g0) / d + 4; h /= 6; }
        const back = (hh, ss, vv) => { const i = Math.floor(hh * 6), f = hh * 6 - i, P = vv * (1 - ss), Q = vv * (1 - f * ss), Tt = vv * (1 - (1 - f) * ss); const m = [[vv, Tt, P], [Q, vv, P], [P, vv, Tt], [P, Q, vv], [Tt, P, vv], [vv, P, Q]][i % 6]; return m.map(x => Math.round(x * 255)); };
        return { light: back(h, sat / 2, v), dark: back(h, sat, v / 2) }; };
      const T0 = gr ? (() => { const b = [234, 51, 35], d = hsvSet(b); return { fill: b, edge: b, dark: d.dark, light: d.light }; })() : { fill: [0x52, 0x98, 0x40], edge: [0x38, 0x80, 0x22], dark: [0x22, 0x54, 0x13], light: [0x8c, 0xc4, 0x80] };
      const fill = mix(T0.fill, [0x00, 0x00, 0xc6]), edge = mix(T0.edge, [0x00, 0x00, 0xf5]), dark = mix(T0.dark, [0x00, 0x00, 0x61]), light = mix(T0.light, [0x65, 0x65, 0xc8]);
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
  const a = A(), p = a.me(), w = toolWin('tech', TL('Tech Spending')), body = w.querySelector('.tbody');
  body.innerHTML = '';
  const lv = document.createElement('div'); lv.className = 'lv';
  lv.append(span('cl', TL('Current Levels:')));
  ['range', 'speed', 'weapons', 'shields', 'mini'].forEach((k, i) => { const r = document.createElement('div'); r.className = 'lr'; r.append(span('', TL({ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Mini' }[k])), span('n', String(p.tech[k]))); lv.append(r); });
  const bars = document.createElement('div'); bars.className = 'vb';
  // the upright scale's ticks (shot 008: one pixel left of the axis, 15 23 29 34 38 41 44 46 49 51 pixels above its foot on the log scale,
  // the budget's ticks on a 51-pixel scale; i * 51 / 10 on the linear one)
  const vt = document.createElement('div'); vt.className = 'vt'; vt.setAttribute('aria-hidden', 'true');
  let tlog = true; try { tlog = H().barScale(a.G, 'tech').id === 'log'; } catch (e) {}
  (tlog ? [15, 23, 29, 34, 38, 41, 44, 46, 49, 51] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => Math.trunc(i * 51 / 10))).forEach(y => { const t = document.createElement('i'); t.style.bottom = y + 'px'; vt.append(t); });
  const tb = B && B.tech, rows = tb ? [...tb.querySelectorAll('.barrow')] : [];
  rows.forEach((r, i) => { r.classList.add('w95vbar'); bars.append(r); });
  const names = ['Range', 'Speed', 'Weapons', 'Shields', 'Mini', 'Radical'].slice(0, rows.length);
  const nm = document.createElement('div'); nm.className = 'vn';
  names.forEach((t, i) => nm.append(span(i % 2 ? 'lo' : 'hi', TL(t), `left:${11 + 22 * i}px`)));
  body.append(lv, bars, vt, nm);
  if (tb) tb.remove();
}

// Report Messages (dialog 351, drawn by the program; shots 008, 087, 090): this turn's reports, 32 pixels a row, the picture then the words,
// on white with the list's scroll bar; a click on a row acts on its report (the remake's reportAction: a battle's replay, a star shown).
function reportWindow() {
  const a = A(), w = toolWin('report', TL('Report Messages')), body = w.querySelector('.tbody'), list = document.createElement('ul');
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
  const c = card.querySelector('.count'); if (c) c.textContent = TL('more...');
};



// A ship's picture with the white that touches its edges made see-through (some extracted bitmaps, the basic scout's 2762 among them, keep
// a white margin the program masks away); cached by the picture.
const SHIPC = new WeakMap();
function edgeClear(im) { // a canvas of the picture with the white touching its edges made see-through (cached)
  if (!im || !im.width) return im;
  if (SHIPC.has(im)) return SHIPC.get(im);
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  try {
    const W = c.width, Hh = c.height, D = x.getImageData(0, 0, W, Hh), px = D.data, seen = new Uint8Array(W * Hh), q = [];
    const white = (i) => px[i * 4] > 245 && px[i * 4 + 1] > 245 && px[i * 4 + 2] > 245 && px[i * 4 + 3] > 0;
    for (let xx = 0; xx < W; xx++) q.push(xx, (Hh - 1) * W + xx); for (let yy = 0; yy < Hh; yy++) q.push(yy * W, yy * W + W - 1);
    while (q.length) { const i = q.pop(); if (seen[i] || !white(i)) continue; seen[i] = 1; px[i * 4 + 3] = 0; const xx = i % W, yy = (i / W) | 0;
      if (xx > 0) q.push(i - 1); if (xx < W - 1) q.push(i + 1); if (yy > 0) q.push(i - W); if (yy < Hh - 1) q.push(i + W); }
    x.putImageData(D, 0, 0);
  } catch (e) {}
  SHIPC.set(im, c); return c;
}
const edgeURL = (im) => { const c = edgeClear(im); try { return c && c.toDataURL ? c.toDataURL() : im && im.src; } catch (e) { return im && im.src; } };
function shipPicClean(d, IMG) { return edgeClear(T.shipPic ? T.shipPic(d, IMG) : null); }

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
    if (kind === 'STATIC') { e = document.createElement('div'); e.className = 'st' + (/\n/.test(text) || h > 10 ? ' ml' : ''); e.textContent = text ? TL(text) : ''; }
    else if (/push/.test(kind)) { e = document.createElement('button'); e.type = 'button'; e.className = 'pb' + (/default/.test(kind) ? ' def' : ''); e.textContent = TL(text.replace(/&/g, '')); }
    else if (kind === 'LISTBOX') { e = document.createElement('div'); e.className = 'lbx'; e.setAttribute('role', 'listbox'); e.tabIndex = 0; }
    else if (kind === 'COMBOBOX') { e = document.createElement('select'); e.className = 'cbx'; hh0(e); }
    else if (kind === 'EDIT') { e = document.createElement('input'); e.className = 'ed'; }
    else if (/check box/.test(kind)) { e = document.createElement('label'); e.className = 'ck'; const i = document.createElement('input'); i.type = 'checkbox'; e.append(i, document.createTextNode(TL(text))); }
    else if (/radio/.test(kind)) { e = document.createElement('label'); e.className = 'rb'; const i = document.createElement('input'); i.type = 'radio'; i.name = 'w95r' + id; e.append(i, document.createTextNode(TL(text))); }
    else if (kind === 'group box') { e = document.createElement('fieldset'); e.className = 'gb'; if (text) { const lg = document.createElement('legend'); lg.textContent = text; e.append(lg); } }
    else if (/scroll bar/.test(kind)) { // a Windows scroll bar: the arrows step it by one (the bar itself is the control the callers get)
      const w = document.createElement('div'); w.className = 'sbw'; const r = document.createElement('input'); r.type = 'range'; r.className = 'sb';
      const arrow = (cls, d) => { const b = document.createElement('i'); b.className = 'sba ' + cls; b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); if (r.disabled) return; const v = Math.max(+r.min, Math.min(+r.max, (+r.value) + d)); if (v !== +r.value) { r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); } }); return b; };
      w.append(arrow('l', -1), r, arrow('r', 1)); e = w; e.dataset.cid = String(cid);
      e.style.left = l + 'px'; e.style.top = t + 'px'; e.style.width = ww + 'px'; e.style.height = hh + 'px'; root.append(e); if (cid !== 65535) by[cid] = r; continue; }
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
  ['Ship Power', 'Ship Class'].forEach((t, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = TL(t); cb.append(o); });
  cb.value = String(FLT.sort);
  const power = (f) => { let n = 0; for (const k in f.ships) { const d = H().getDesign(g, f.owner, +k); if (d) n += f.ships[k] * (rs.shipPower ? rs.shipPower(g, d) : 1); } return n; };
  const TYPE_ORDER = ['dread', 'fighter', 'bio', 'satellite', 'tanker', 'colony', 'scout'];
  const klass = (f) => { const ds = H().fleetDesigns(g, f); return Math.min(...ds.map(d => { const i = TYPE_ORDER.indexOf(d.type); return i < 0 ? 99 : i; })); };
  const line = (f) => {
    const t = fleetRow(g, f), star = (i) => g.stars[i].name;
    if (f.to != null) return cfmt(TL('%s to arrive at %s in %d.'), t, star(f.to), H().arrivalYear ? H().arrivalYear(g, Math.ceil((f.dist - f.prog) / H().fleetSpeed(g, f))) : g.year);
    if (f.dest != null) { const d = H().starDist(g, f.star, f.dest), turns = Math.ceil(d / H().fleetSpeed(g, f) - 1e-9); return cfmt(TL('%s leaving %s for %s to arrive in %d.'), t, star(f.star), star(f.dest), g.year + turns * ((rs.yearsPerTurn) || 10)); }
    return cfmt(TL('%s stationed at %s.'), t, star(f.star));
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
  ['Metal', 'Quality', 'Gravity', 'Owner'].forEach((t, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = TL(t); cb.append(o); });
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

// Surrender To (dialog 363, shot 084): "Surrender To:", the group box (control 1148) holding a face for each other player still in, its
// name under it, then "No One"; a click picks one (outlined); OK asks dialog 364 ("Do you really, REALLY want to surrender?", Really /
// Cancel) and surrenders (engine surrender) at the end of the turn. While you are surrendering, the classic page's question takes it back.
// ("No One"'s dark planet is a stand-in: its bitmap is not identified.)
function surrenderDialog() {
  const a = A(), g = a.G, p = a.me(); if (p.surrenderTo != null) return false;
  const dl = W95DLG(363); if (!dl) return false;
  const gb = dl.by[1148], grid = document.createElement('div'); grid.className = 'sgrid'; gb.classList.add('sbox'); gb.append(grid);
  let pick = null;
  const cell = (id, name, src) => {
    const c = document.createElement('div'); c.className = 'sc'; c.setAttribute('role', 'option'); c.tabIndex = 0;
    const f = document.createElement('i'); f.className = 'sf'; if (src) f.style.backgroundImage = `url("${src}")`; else f.classList.add('none');
    c.append(f, span('sn', name));
    c.addEventListener('click', () => { pick = id; grid.querySelectorAll('.sc').forEach(x => x.classList.toggle('on', x === c)); });
    grid.append(c);
  };
  g.players.filter(q => q.id !== a.ME && q.alive !== false && !q.surrendered).forEach(q => {
    const n = q.human ? (q.female ? 1905 : 1405) : (q.female ? 2500 : 2000) + (q.face || 0) % 20, im = a.IMG['w95:b' + n];
    cell(q.id, q.name, im && im.src);
  });
  cell(-1, 'No One', null);
  dl.by[2].addEventListener('click', () => a.closeModal());
  dl.by[1].addEventListener('click', () => {
    if (pick == null) return;
    const q = W95DLG(364); if (!q) return;
    q.by[1].addEventListener('click', () => { a.closeModal(); H().surrender(g, a.ME, pick); a.save(); a.renderPanel(); });
    q.by[2].addEventListener('click', () => a.closeModal());
    showDlg(q, 'Surrender');
  });
  showDlg(dl, 'Surrender To');
  return true;
}

// Alliances (dialog 361, shot 082): three lists, "I Really Like Them" (control 1141), "I Like Them" (1142), "I Don't Like Them" (1143), each
// player's face in the column of your wish for them, 30 pixels apart with the name under. The columns are the three steps of strings
// 1016-1027: best buddies (and allies), allies, neither ("...no longer wants to be your best buddy. He just wants to be allies."). A click
// on a face moves it one column to the right, round to the first (the program's direction is not read yet). OK sets the pacts (engine
// setPact), Cancel leaves them.
function allianceDialog() {
  const a = A(), g = a.G, me = a.me();
  if (a.menuDim && a.menuDim('alliances')) return;
  const dl = W95DLG(361); if (!dl) return;
  const L = [dl.by[1141], dl.by[1142], dl.by[1143]];
  const want = {};
  g.players.filter(q => q.id !== a.ME && q.alive !== false).forEach(q => { want[q.id] = (me.buddies || []).includes(q.id) ? 0 : (me.allies || []).includes(q.id) ? 1 : 2; });
  // each picture is that player's own wish for you (shot 082: 4021 smiling for a best buddy, 4020 for an ally, 4019 frowning for neither);
  // you stand in the first list, smiling, and don't move
  const opinion = (q) => (q.id === a.ME ? 4021 : (q.buddies || []).includes(a.ME) ? 4021 : (q.allies || []).includes(a.ME) ? 4020 : 4019);
  const draw = () => {
    L.forEach(l => { l.innerHTML = ''; l.classList.add('agrid'); });
    [me].concat(g.players.filter(q => want[q.id] != null)).forEach(q => {
      const im = a.IMG['w95:b' + opinion(q)];
      const c = document.createElement('div'); c.className = 'ac'; c.setAttribute('role', 'button'); c.tabIndex = 0; c.title = q.name;
      const f = document.createElement('i'); f.className = 'af'; if (im && im.src) f.style.backgroundImage = `url("${im.src}")`;
      c.append(f, span('an', q.name));
      if (q.id !== a.ME) c.addEventListener('click', () => { want[q.id] = (want[q.id] + 1) % 3; draw(); });
      L[q.id === a.ME ? 0 : want[q.id]].append(c);
    });
  };
  // (the headings as the captures show them, shorter than the template's)
  if (dl.by['I Really Like Them']) dl.by['I Really Like Them'].textContent = TL('I Really Like');
  if (dl.by["I Don't Like Them"]) dl.by["I Don't Like Them"].textContent = TL("I Don't Like");
  dl.by[2].addEventListener('click', () => a.closeModal());
  dl.by[1].addEventListener('click', () => {
    for (const id in want) {
      const w = want[id], q = +id;
      if (w > 0) H().setPact(g, a.ME, q, 'buddy', false);
      H().setPact(g, a.ME, q, 'ally', w <= 1);
      if (w === 0) H().setPact(g, a.ME, q, 'buddy', true);
    }
    a.save(); a.closeModal(); a.renderPanel();
  });
  draw(); showDlg(dl, 'Alliances');
}

// Give Stuff (dialog 362, shot 083): "Give Stuff To:", the white box (group box 1148) with the other players' faces and names, the one
// picked in black; "Give How Much Money?" (field 1145) and "Give How Much Metal?" (1146); Cancel, Give. The ruleset's give rules as the
// classic page's (rs.giveWindow: three gifts a turn, the order, the one remembered; engine give).
function giveDialog() {
  const a = A(), g = a.G, p = a.me(), W = H().rules(g).giveWindow || {};
  if ((p.giftsThisTurn || 0) >= 3) { a.toast(H().say(g, W.limit || H().DATA.alerts[5] || 'Sorry, but you may only give 3 gifts per turn.')); return true; }
  const order = W.order ? W.order(g) : g.players, can = order.filter(q => q.id !== a.ME && q.alive !== false && !q.surrendered);
  const dl = W95DLG(362); if (!dl) return false;
  const last = W.remember ? p[W.remember] : null; let pick = can.some(q => q.id === last) ? last : can.length ? can[0].id : null;
  const gb = dl.by[1148], grid = document.createElement('div'); grid.className = 'sgrid'; gb.classList.add('sbox'); gb.append(grid);
  const cells = [];
  can.forEach(q => {
    const n = q.human ? (q.female ? 1905 : 1405) : (q.female ? 2500 : 2000) + (q.face || 0) % 20, im = a.IMG['w95:b' + n];
    const c = document.createElement('div'); c.className = 'sc gv' + (q.id === pick ? ' on' : ''); c.setAttribute('role', 'option'); c.tabIndex = 0;
    const f = document.createElement('i'); f.className = 'sf'; if (im && im.src) f.style.backgroundImage = `url("${im.src}")`;
    c.append(f, span('sn', q.name)); c.addEventListener('click', () => { pick = q.id; cells.forEach(x => x.classList.toggle('on', x === c)); });
    cells.push(c); grid.append(c);
  });
  if (dl.by['Give Stuff To:']) dl.by['Give Stuff To:'].textContent = TL('Give Stuff'); // (shot 083's words, not the template's)
  const mf = dl.by[1145], xf = dl.by[1146]; mf.value = '0'; xf.value = '0'; mf.inputMode = xf.inputMode = 'numeric';
  dl.by[2].addEventListener('click', () => a.closeModal());
  dl.by[1].addEventListener('click', () => {
    if (pick == null) { a.toast(H().say(g, W.none || H().DATA.alerts[6] || 'Sorry, but there is no one else alive to give or send something to.')); return; }
    const num = (v) => Math.max(0, Math.round(+String(v).replace(/[^0-9]/g, '') || 0));
    const r = H().give(g, a.ME, pick, Math.min(num(mf.value), Math.max(0, p.savings)), Math.min(num(xf.value), Math.max(0, p.metal)));
    if (r === 'limit') { a.toast(H().say(g, W.limit || H().DATA.alerts[5])); return; }
    if (r !== 'ok') return;
    if (W.remember) p[W.remember] = pick;
    a.Sound.play(5000); a.closeModal(); a.renderPanel(); a.save();
  });
  showDlg(dl, 'Give Stuff'); mf.focus(); mf.select();
  return true;
}

// Preferences (dialog 350, shot 040), wired to the remake's settings: Show Event Messages, But Only The Most Important Ones, Review Event
// Battles, Give Helpful Game Play Hints, Battle Speed (Fast 10 to Slow 60, 30 as it came), Fully Animated Battles, Polling Time (1 to 15
// seconds, 8 as it came), Temp. in Celsius. Kept as chosen with nothing in the remake to act on: Automatically Sort Planet List, Groups
// Shoot Together, Show Fleet Paths (all on as they came, shot 040). Your Password is dimmed (the remake keeps no password). OK applies.
function prefsDialog() {
  const a = A(), P = a.Prefs, O = (a.verOpts && a.verOpts()) || {}, dl = W95DLG(350); if (!dl) { if (a.openPrefs) a.openPrefs(); return; }
  const ck = (id, on) => { const i = dl.by[id] && dl.by[id].querySelector('input'); if (i) i.checked = !!on; return i; };
  const sort = ck(1092, P.sortPlanets !== false), show = ck(1093, P.showMsgs !== false), imp = ck(1094, !!P.important), rev = ck(1095, a.prefReview ? a.prefReview() : !!P.review);
  const hint = ck(1096, !!P.hints), full = ck(1097, P.fullAnim !== false), grp = ck(1098, P.groupsTogether !== false), paths = ck(1100, P.fleetPaths !== false), cel = ck(1101, !!P.celsius);
  const sl = (id, C, k) => { const r = dl.by[id]; const c = C || { min: 1, max: 10, def: 5 }; r.min = c.min; r.max = c.max; r.step = 1; r.value = P[k] != null ? P[k] : c.def; return r; };
  const bs = sl(1103, O.battleSpeed, 'battleSpeed'), po = sl(1104, O.poll, 'poll'), pv = dl.by[1099];
  const showPoll = () => { if (pv) pv.textContent = String(po.value); }; po.addEventListener('input', showPoll); showPoll();
  const sync = () => { imp.disabled = rev.disabled = !show.checked; }; show.addEventListener('change', sync); sync();
  const pw = dl.by[1102]; if (pw) { pw.disabled = true; pw.title = 'The remake keeps no password'; }
  dl.by[2].addEventListener('click', () => a.closeModal());
  // the remake's own options (Modern conveniences, the tips, temperatures, sounds...): the classic page's window, as the iOS skin's
  // "Remake options…" (the class is the one the test tools know that button by)
  const more = document.createElement('button'); more.type = 'button'; more.className = 'pb ios-bremake'; more.textContent = TL('Remake options…');
  more.setAttribute('style', 'position:absolute;left:12px;top:' + (198 * 1.625) + 'px;width:auto;padding:0 8px;height:23px'); dl.el.append(more);
  more.addEventListener('click', () => { a.closeModal(); a.openPrefs(); });
  dl.by[1].addEventListener('click', () => {
    P.sortPlanets = sort.checked; P.showMsgs = show.checked; P.important = imp.checked; P.review = rev.checked; P.hints = hint.checked;
    P.fullAnim = full.checked; P.groupsTogether = grp.checked; P.fleetPaths = paths.checked;
    const bsv = +bs.value, pov = +po.value; P.battleSpeed = O.battleSpeed && bsv === O.battleSpeed.def ? null : bsv; P.poll = O.poll && pov === O.poll.def ? null : pov;
    if (cel.checked !== !!P.celsius) { P.celsius = cel.checked; P.temp = null; }
    a.savePrefs(); a.closeModal(); a.renderPanel(); a.draw();
  });
  showDlg(dl, 'Preferences');
}

// Auto Play Options (dialog 379, shot 292): "Have Computer play for me." / "Just mark me done every turn." / "Mark me done until something
// interesting happens." / "I'll play my own turns, thank you." (the default), "Under auto play, event messages disappear after:" the
// seconds (shot 292: 2) and the bar; Config... (the remake's auto play settings, in place of dialog 380); OK starts it (runAutoPlay).
const AP = { mode: 3, every: 2 };
function autoPlayDialog() {
  const a = A(), dl = W95DLG(379); if (!dl) { a.openAutoPlay(); return; }
  const R = [1163, 1164, 1165, 1166].map(id => dl.by[id] && dl.by[id].querySelector('input'));
  R.forEach((r, i) => { if (r) { r.name = 'w95ap'; r.checked = i === AP.mode; } });
  // (Config... only for the computer's play: dimmed otherwise, shot 292)
  const cfg = () => { dl.by[1168].disabled = !(R[0] && R[0].checked); }; R.forEach(r => r && r.addEventListener('change', cfg)); cfg();
  const bar = dl.by[1167], out = dl.by[1170]; bar.min = 0; bar.max = 10; bar.step = 1; bar.value = AP.every;
  const show = () => { out.textContent = String(bar.value); }; bar.addEventListener('input', show); show();
  dl.by[1168].addEventListener('click', () => { a.closeModal(); if (a.openAutoPlaySettings) a.openAutoPlaySettings(() => autoPlayDialog()); });
  dl.by[1].addEventListener('click', () => {
    AP.mode = Math.max(0, R.findIndex(r => r && r.checked)); AP.every = +bar.value;
    a.closeModal();
    if (AP.mode === 3 || !a.G || a.G.over) return;
    const stop = AP.mode === 2;
    a.runAutoPlay({ turns: Infinity, computer: AP.mode === 0, won: stop, lost: stop, news: stop, every: AP.every, stopButton: true });
  });
  showDlg(dl, 'Auto Play Options');
}

// Build / Design Ships (dialog 176, shots 041, 053, 093; BuildDesignShips: FUN_0044d00c sets it up, FUN_00468f83 is its OK). At the left the
// types you have (the owner-drawn list 1016: each type's picture with "Rudolph (1/1) Scout" under it, the one chosen on black); at the top
// the chosen type's picture (1020), its name (1021) and class (1022), "Dev. Cost:", "Pro. Cost:", "Metal Cost:"; then Range, Speed,
// Weapons, Shields and Mini, each "n/max" and its scroll bar (to your technology); a changed design is a new type, its name suggested. At
// the right Savings and Metal with their piles (FUN_00450042: up to 36 coins of bitmap 311, 312 when in debt, in three stacks, one coin
// for each 36th of five times your income, at least $250,000; FUN_00450681: bars of 313, one for each 2,778 metal), Built, In Service,
// "# To Build:" with + and -; Build and Continue, Scap All (the template's spelling: marks the type for scrapping, "Don't Scrap" then),
// Max Out (every bar to its limit), Cancel, OK. Ships are bought at OK or Build and Continue (engine buildShips), not before; Cancel
// buys nothing and makes no type.
function buildDialog(sid) {
  const a = A(), g = a.G, p = a.me(), st = g.stars[sid]; if (!st || st.owner !== a.ME) return false;
  if (H().feature(g, 'buildQueue')) return false; // (the DOS 2.0 queue: the classic window)
  const dl = W95DLG(176); if (!dl) return false;
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => H().canBuildType(g, p, t));
  const K = ['R', 'V', 'W', 'S', 'M'], live = () => p.designs.filter(d => !d.scrapped && types.includes(d.type));
  let spec = null, name = '';
  const same = (d) => d.type === spec.type && d.R === spec.R && d.V === spec.V && d.W === spec.W && d.S === spec.S && d.M === spec.M;
  const pickDesign = (d) => { spec = { type: d.type, R: d.R, V: d.V, W: d.W, S: d.S, M: d.M }; name = d.name; };
  const clampSpec = () => { const L = H().designLimits(g, p, spec.type); for (const k of K) { const lo = H().designMin(g, k, spec.type), hi = Math.max(lo, L[k] || lo); spec[k] = Math.max(lo, Math.min(hi, spec[k] == null ? hi : spec[k])); } if (spec.type === 'satellite') spec.R = 0; };
  const fresh = (type) => { spec = { type }; clampSpec(); const d = live().find(same); name = d ? d.name : H().designName(g, p, type); };
  const L0 = live(); if (L0.length) pickDesign(L0[L0.length - 1]); else fresh(types[0]);
  const lb = dl.by[1016], pic = dl.by[1020], nm = dl.by[1021], cb = dl.by[1022], n = dl.by[1043];
  types.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = TL(H().TYPES[t].name); cb.append(o); });
  n.value = '0'; n.inputMode = 'numeric';
  const shipCanvas = (d, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const im = shipPicClean(d, a.IMG); if (im) { const sc = Math.min(1, w / im.width, h / im.height); c.getContext('2d').drawImage(im, (w - im.width * sc) / 2, (h - im.height * sc) / 2, im.width * sc, im.height * sc); } return c; };
  const pile = (el, coin, count) => {
    el.innerHTML = ''; const c = document.createElement('canvas'); c.width = 60; c.height = 52; el.append(c); const x = c.getContext('2d'), im0 = a.IMG['w95:b' + coin]; if (!im0 || !im0.width) return;
    // (the program draws these through a mask; the extracted bitmaps have none, so their white is made see-through here)
    const im = document.createElement('canvas'); im.width = im0.width; im.height = im0.height; const ix = im.getContext('2d'); ix.drawImage(im0, 0, 0);
    try { const d = ix.getImageData(0, 0, im.width, im.height); for (let i = 0; i < d.data.length; i += 4) if (d.data[i] > 245 && d.data[i + 1] > 245 && d.data[i + 2] > 245) d.data[i + 3] = 0; ix.putImageData(d, 0, 0); } catch (e) {}
    const nAll = Math.min(36, count), n1 = Math.trunc(nAll / 2), n2 = Math.trunc(nAll / 3), n3 = nAll - n1 - n2, base = 52 - im.height - 9;
    [[n1, 0, 0], [n2, 12, 3], [n3, 23, 6]].forEach(([k, dx, dy]) => { for (let i = 0; i < k; i++) x.drawImage(im, dx, base + dy - 2 * i); });
  };
  const inService = (did) => g.fleets.filter(f => f.owner === a.ME).reduce((t, f) => t + (f.ships[did] || 0), 0);
  const label = (d) => `${d.name} (${d.W}/${d.S}) ${TL(H().TYPES[d.type].name)}`;
  const draw = () => {
    const ds = live(), cur = ds.find(same) || null;
    lb.innerHTML = ''; lb.classList.add('blist');
    ds.forEach(d => { const r = document.createElement('div'); r.className = 'br' + (cur && cur.id === d.id ? ' sel' : '') + (d.scrap301 ? ' scrap' : ''); r.setAttribute('role', 'option');
      r.append(shipCanvas(d, 128, 40), span('bl', label(d))); r.addEventListener('click', () => { pickDesign(d); n.value = '0'; draw(); }); lb.append(r); });
    { const sl = lb.querySelector('.br.sel'); if (sl) sl.scrollIntoView({ block: 'nearest' }); }
    pic.innerHTML = ''; const pc = shipCanvas(Object.assign({ name }, spec), 98, 39); pc.style.background = '#000'; pic.append(pc); // (on black: shot 041)
    if (document.activeElement !== nm) nm.value = cur ? cur.name : name; nm.disabled = !!cur;
    cb.value = spec.type;
    const c = H().designCost(g, spec);
    // (Dev. Cost is the prototype's whole price: shot 041, $7,959 for a $1,989 Scout)
    dl.by[1026].textContent = a.money(c.protoTotal != null ? c.protoTotal : (c.proto || 0)); dl.by[1027].textContent = a.money(c.money); dl.by[1028].textContent = a.fmt(c.metal);
    const L = H().designLimits(g, p, spec.type);
    K.forEach((k, i) => { const lo = H().designMin(g, k, spec.type), hi = Math.max(lo, L[k] || lo), bar = dl.by[1034 + i];
      const sat = k === 'R' && spec.type === 'satellite';
      dl.by[1029 + i].textContent = sat ? '0/0' : `${spec[k]}/${hi}`; bar.min = lo; bar.max = hi; bar.value = spec[k]; bar.disabled = sat || hi <= lo; });
    dl.by[1039].textContent = a.fmt(Math.round(p.savings)); dl.by[1040].textContent = a.fmt(Math.round(p.metal));
    const inc = Math.max(50000, Math.round(H().projected(g, p).income || 0)) * 5;
    pile(dl.by[1047], p.savings < 0 ? 312 : 311, Math.trunc(Math.abs(p.savings) / Math.trunc((inc + 35) / 36)) + 1);
    pile(dl.by[1048], 313, Math.trunc(Math.max(0, p.metal) / 2778) + 1);
    dl.by[1041].textContent = cur ? String(cur.built || 0) : '0'; dl.by[1042].textContent = cur ? String(inService(cur.id)) : '0';
    dl.by[1018].textContent = cur && cur.scrap301 ? "Don't Scrap" : 'Scrap All'; dl.by[1018].disabled = !cur;
  };
  K.forEach((k, i) => dl.by[1034 + i].addEventListener('input', (e) => { spec[k] = +e.target.value; const d = live().find(same); name = d ? d.name : (nm.disabled ? H().designName(g, p, spec.type) : nm.value || H().designName(g, p, spec.type)); draw(); }));
  cb.addEventListener('change', () => { fresh(cb.value); n.value = '0'; draw(); });
  nm.addEventListener('input', () => { name = nm.value.slice(0, 15); });
  dl.by[1045].addEventListener('click', () => { n.value = String(Math.min(999, (+n.value || 0) + 1)); });
  dl.by[1046].addEventListener('click', () => { n.value = String(Math.max(0, (+n.value || 0) - 1)); });
  dl.by[1017].addEventListener('click', () => { const L = H().designLimits(g, p, spec.type); K.forEach(k => { spec[k] = L[k]; }); clampSpec(); const d = live().find(same); name = d ? d.name : H().designName(g, p, spec.type); draw(); });
  dl.by[1018].addEventListener('click', () => { const d = live().find(same); if (!d) return; const rs = H().rules(g); if (rs.flagScrapDesign) rs.flagScrapDesign(g, p, d, 'command'); a.save(); a.renderPanel(); draw(); });
  const buy = () => {
    const want = Math.max(0, Math.trunc(+String(n.value).replace(/[^0-9]/g, '') || 0)); if (!want) return true;
    let d = live().find(same);
    if (!d) { const lim = H().rules(g).maxDesigns; if (lim && H().liveDesigns(p) >= lim) { a.toast(H().say(g, H().DATA.alerts[15] || 'Your assembly lines are full.')); return false; }
      const sp = Object.assign({}, spec); if (name && name.trim()) sp.name = name.trim(); d = H().findOrCreateDesign(g, p, sp); }
    if (d.scrap301) { a.toast(`${d.name} is marked for scrapping.`); return false; }
    let made = 0; for (let i = 0; i < want; i++) { if (H().buildShips(g, a.ME, sid, d.id, 1)) made++; else break; }
    if (made) a.Sound.play(7006);
    if (made < want) a.toast(made ? `Built ${made} of ${want}: not enough money, metal or people.` : 'Not enough money or metal.');
    n.value = '0'; a.save(); a.renderPanel(); a.draw(); return made === want;
  };
  dl.by[1205].addEventListener('click', () => { buy(); draw(); });
  dl.by[1].addEventListener('click', () => { if (buy()) a.closeModal(); else draw(); });
  dl.by[2].addEventListener('click', () => a.closeModal());
  draw(); showDlg(dl, 'Build/Design Ships');
  return true;
}

// Organize Ships (dialog 347, shot 044; FLTORGCL.CPP, OrganizeFleets as 3.0.1's: FUN_0042b278). Twelve piles of one ship type at the star,
// each its count and the type's picture, three columns of four on black (FUN_0042b05d); drag a pile onto another to move one ship (Shift:
// the whole pile). Group All (FUN_0042aca6): everything into the first pile. Split All (FUN_0042ad1d): each pile of more than
// one that was there gives half to the next empty pile. Divide All (FUN_0042abad): the total over the twelve, a twelfth each (at least one),
// the last pile the rest. Next Type (FUN_0042b921): applies, then the next type at the star. OK applies (the piles become fleets: engine
// splitFleet / mergeFleets, as the Mac 3.0.1 skin's organize), Cancel leaves them.
function organizeDialog(sid, did0) {
  const a = A(), g = a.G;
  const single = (f) => f.owner === a.ME && f.star === sid && f.to == null && !f.sat && Object.keys(f.ships).length === 1;
  const dids = [...new Set(g.fleets.filter(single).map(f => +Object.keys(f.ships)[0]))];
  if (!dids.length) { a.toast('There are no fleets of yours here to organize.'); return; }
  const cf = a.curFleet && a.curFleet(), did = did0 != null && dids.includes(did0) ? did0 : cf && single(cf) ? +Object.keys(cf.ships)[0] : dids[0];
  const d = H().getDesign(g, a.ME, did), fleets = g.fleets.filter(f => single(f) && +Object.keys(f.ships)[0] === did).slice(0, 12);
  const piles = Array.from({ length: 12 }, (_, i) => fleets[i] ? { f: fleets[i], n: fleets[i].ships[did] } : { f: null, n: 0 });
  const dl = W95DLG(347); if (!dl) return;
  const field = dl.by[1065]; field.className = 'od opile';
  // the piles (FUN_0042b05d): twelve cells of 135 x 40 on a 45-pixel pitch, three columns of four (pile i at column i / 4, row i % 4);
  // the ship picture 15 in, the count over the cell's left, centred, smaller from 100 up. A pile is dragged onto another (FUN_0042bcb1 /
  // FUN_0042b952: an outline follows the pointer): one ship moves, the whole pile with Shift (MK_SHIFT). A click on one pile and then
  // another does the same, for fingers.
  let sel = null, drag = null;
  const at = (ev) => { const r = field.getBoundingClientRect(), z = r.width / field.offsetWidth || 1, x = (ev.clientX - r.left) / z, y = (ev.clientY - r.top) / z;
    const c = Math.floor(x / 135), rw = Math.floor(y / 45), i = c * 4 + rw; return x >= 0 && y >= 0 && c < 3 && rw < 4 ? i : -1; };
  const move = (from, to, all) => { if (from === to || to < 0 || to > 11 || !(piles[from].n > 0)) return; const n = all ? piles[from].n : 1; piles[from].n -= n; piles[to].n += n; };
  const draw = () => {
    field.innerHTML = '';
    piles.forEach((p, i) => {
      const c = document.createElement('div'); c.className = 'pl' + (sel && sel.pile === i ? ' on' : ''); c.style.left = (Math.trunc(i / 4) * 135) + 'px'; c.style.top = ((i % 4) * 45) + 'px';
      if (p.n > 0) { const cv = document.createElement('canvas'); cv.width = 120; cv.height = 40; const im = shipPicClean(d, a.IMG); if (im) { const sc = Math.min(1, 120 / im.width, 40 / im.height); cv.getContext('2d').drawImage(im, 0, (40 - im.height * sc) / 2, im.width * sc, im.height * sc); } c.append(cv, span('pn' + (p.n >= 100 ? ' sm' : ''), H().niceNum ? H().niceNum(p.n) : String(p.n))); }
      field.append(c);
    });
  };
  field.addEventListener('pointerdown', (ev) => {
    const i = at(ev); if (i < 0) return;
    if (sel && sel.pile !== i) { move(sel.pile, i, sel.all); sel = null; draw(); return; }
    if (!(piles[i].n > 0)) { sel = null; draw(); return; }
    ev.preventDefault(); try { field.setPointerCapture(ev.pointerId); } catch (e) {}
    const r = field.getBoundingClientRect(), z = r.width / field.offsetWidth || 1;
    const box = document.createElement('i'); box.className = 'pdrag'; box.style.left = (Math.trunc(i / 4) * 135) + 'px'; box.style.top = ((i % 4) * 45) + 'px'; field.append(box);
    drag = { i, all: ev.shiftKey, x0: ev.clientX, y0: ev.clientY, l: Math.trunc(i / 4) * 135, t: (i % 4) * 45, z, box, moved: false };
  });
  field.addEventListener('pointermove', (ev) => { if (!drag) return; const dx = (ev.clientX - drag.x0) / drag.z, dy = (ev.clientY - drag.y0) / drag.z; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; drag.box.style.left = (drag.l + dx) + 'px'; drag.box.style.top = (drag.t + dy) + 'px'; });
  const end = (ev) => { if (!drag) return; const g0 = drag; drag = null; g0.box.remove();
    if (g0.moved) { move(g0.i, at(ev), g0.all); sel = null; } else sel = sel && sel.pile === g0.i && !g0.all ? null : { pile: g0.i, all: g0.all };
    draw(); };
  field.addEventListener('pointerup', end); field.addEventListener('pointercancel', () => { if (drag) { drag.box.remove(); drag = null; } });
  const total = () => piles.reduce((t, p) => t + p.n, 0);
  dl.by[1066].addEventListener('click', () => { const t = total(); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; draw(); });
  dl.by[1067].addEventListener('click', () => { const had = piles.map(p => p.n > 0); for (let i = 0; i <= 10; i++) { if (piles[i].n > 1 && had[i]) { let j = i + 1; while (j <= 11 && piles[j].n !== 0) j++; if (j > 11) continue; piles[j].n = Math.trunc(piles[i].n / 2); piles[i].n -= piles[j].n; } } sel = null; draw(); });
  dl.by[1068].addEventListener('click', () => { let t = total(); const per = Math.max(1, Math.trunc(t / 12)); for (let i = 0; i < 11; i++) { piles[i].n = Math.min(per, t); t -= piles[i].n; } piles[11].n = Math.max(0, t); sel = null; draw(); });
  const apply = () => {
    const temps = [];
    for (const p of piles) if (p.f && p.n < p.f.ships[did]) { if (p.n === 0) temps.push(p.f); else { const t = H().splitFleet(g, p.f, { [did]: p.f.ships[did] - p.n }); if (t) temps.push(t); } }
    const take = (need) => { let got = null; while (need > 0 && temps.length) { let t = temps[0]; if (t.ships[did] > need) t = H().splitFleet(g, t, { [did]: need }); else temps.shift(); need -= t.ships[did]; if (got) H().mergeFleets(g, got, t); else got = t; } return got; };
    for (const p of piles) if (p.f && p.n > (p.f.ships[did] || 0)) { const t = take(p.n - p.f.ships[did]); if (t) H().mergeFleets(g, p.f, t); }
    for (const p of piles) if (!p.f && p.n > 0) take(p.n);
    a.save(); a.renderPanel(); a.draw();
  };
  dl.by[1].addEventListener('click', () => { apply(); a.closeModal(); });
  dl.by[2].addEventListener('click', () => a.closeModal());
  dl.by[1069].addEventListener('click', () => { apply(); a.closeModal(); const k = dids.indexOf(did); organizeDialog(sid, dids[(k + 1) % dids.length]); });
  draw(); showDlg(dl, 'Organize Ships');
}

// Planet Info (dialog 349, shot 291; FUN_0041e140 fills it, FUN_0041e5b1 draws the picture): a click on the star pane (but on the gauge,
// FUN_0048b262) opens it. The landscape by the planet's warmth against your home's, in tenths of a degree: 1501 and up 1300, 751 up 1301,
// 1 up 1302, -749 up 1303, -1499 up 1304, else 1305 (drawn from 2 pixels in); Gravity, Temperature, Metal and Owner ("you", the owner or
// "No One") under it; at the right Planet Info For:, Info Date: (the year, "Never Explored."), Population:, Battle Date: ("No battles."),
// Ships Built This Turn:, Income:; "unknown" for what you don't know.
function planetInfoDialog(sid) {
  const a = A(), g = a.G, p = a.me(), s = g.stars[sid]; if (!s) return;
  const dl = W95DLG(349); if (!dl) return;
  const yours = s.owner === a.ME, k = yours ? { explored: true, owner: a.ME, g: s.g, t: s.t, metal: s.metal, seen: g.turn } : H().know(g, p, sid);
  const set = (id, t) => { if (dl.by[id]) dl.by[id].textContent = t; };
  ['1082', '1083', '1084', '1085', '1088', '1091'].forEach(id => set(+id, 'unknown'));
  set(1086, s.name); set(1087, 'Never Explored.'); set(1089, 'No battles.'); set(1090, '');
  if (k && k.explored) {
    const t10 = Math.round(10 * (72 + (k.t - p.homeT))), gr = Math.trunc(100 * k.g / Math.max(0.01, p.homeG));
    set(1082, cfmt('%d.%2.2dG', Math.trunc(gr / 100), gr % 100)); set(1083, cfmt('%d.%1.1d°F', Math.trunc(t10 / 10), Math.abs(t10 % 10))); set(1084, H().niceNum(Math.max(0, Math.round(k.metal || 0))));
    set(1087, String(yours ? g.year : g.year - 10 * Math.max(0, g.turn - (k.seen != null ? k.seen : g.turn))));
    if (k.owner < 0) { set(1085, 'No One'); set(1088, ''); set(1091, ''); }
    else if (k.owner === a.ME) {
      set(1085, 'you'); set(1088, H().niceNum(H().popNum(g, s.pop))); set(1091, '$' + H().niceNum(Math.round(H().planetIncome(g, p, s))));
      set(1090, String((p.spentThisTurn || []).filter(e => e.sid === sid).length));
    } else set(1085, g.players[k.owner] ? g.players[k.owner].name : 'unknown');
    const d10 = Math.round(10 * (k.t - p.homeT)), n = d10 >= 1501 ? 0 : d10 >= 751 ? 1 : d10 >= 1 ? 2 : d10 >= -749 ? 3 : d10 >= -1499 ? 4 : 5;
    const im = a.IMG['w95:b' + (1300 + n)], pc = dl.by[1081];
    if (im && im.src && pc) { pc.style.background = `url("${im.src}") -2px 0 no-repeat`; pc.style.imageRendering = 'pixelated'; }
  }
  const bs = a.lastBattles(sid); if (bs.length) set(1089, String(bs[bs.length - 1].year));
  dl.by[1].addEventListener('click', () => a.closeModal());
  showDlg(dl, 'Planet Info');
}

// About Spaceho (dialog 108, shot 283): the "Version 4" picture in the group box (1007) at the top, the credits (its STATIC at (3, 154)),
// New World Computing's logo (1174 at (152, 155): bitmap 383) and "Licensed to:" (1173 at (4, 226)) in red: the licensee's name, the
// organisation ("Unknown" where there is none, as the program writes it) and "Spaceward Ho! V4.0.5". The licensee as the DOS skin's
// (js/skins/dos/ui.js licensee, Jake's rule): the signed-in account's display name, else the name this browser kept from it, else the
// New Game name; never an e-mail address or a stranger's name.
function licensee95() {
  const ls = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const own = (n, u) => !!n && !/@/.test(n) && n !== 'Guest' && n !== 'Signed in' && (!u || n !== u.email);
  const C = window.HOCLOUD, u = C && C.user; let name = '';
  if (u) { if (!u.anonymous && own(u.name, u)) name = u.name; } else if (!(C && C.known) && own(ls('ho5.cloud.name'))) name = ls('ho5.cloud.name');
  return { name: name || ls('ho5.name'), org: ls('ho5.w31.org') };
}
function aboutDialog() {
  const a = A(), dl = W95DLG(108); if (!dl) { a.openAbout(); return; }
  const gb = dl.by[1007], im = a.IMG['w95:b316'];
  if (gb && im && im.src) { gb.style.background = `#fff url("${im.src}") center / 100% 100% no-repeat`; gb.style.border = '0'; gb.style.imageRendering = 'pixelated'; }
  const lg = dl.by[1174], li = a.IMG['w95:b383']; if (lg && li && li.src) { lg.style.background = `url("${edgeURL(li)}") left top / 80px 121px no-repeat`; lg.style.overflow = 'visible'; lg.style.width = '80px'; lg.style.height = '121px'; }
  const L = licensee95(), lic = dl.by[1173];
  if (lic) { lic.innerHTML = ''; lic.classList.add('lic');
    lic.append(span('ll', TL('Licensed to:')), span('lv', [L.name || 'Unknown', L.org || 'Unknown', 'Spaceward Ho! V4.0.5'].join('\n'))); }
  // (no button: a click closes it, shot 283; the credits are cut at the box's foot, not wrapped)
  const cr = dl.el.querySelector('.st.ml'); if (cr) { cr.style.whiteSpace = 'pre'; cr.style.overflow = 'hidden'; }
  dl.el.addEventListener('click', () => a.closeModal()); dl.el.style.cursor = 'default';
  showDlg(dl, 'About Spaceho');
}
const prevWindow = T.window;

// Graph History (dialog 354, shot 078; FUN_0045630d, its icons FUN_0043093f, its graph FUN_00430686 / FUN_004567c8, the record
// FUN_0043b47f). Ten icons (pictures 3110, 3162, 3117, 4011, 4017, 3100-3104; list 646's names), black when chosen, grey c4c4c4
// when not, a white edge right and below, the name at y 34; a click flips one (the choice kept as the preferences' +0xae, none to
// start). Under each a 2-pixel line in its colour (the table at 0x5b1c58); a frame 3 pixels round the row. The graph: white, a 2-pixel
// black frame from 80 in, the axis at a sixth up from the foot, a tick at (74-78, 13); the years every max(100, span / 4) rounded
// to tens, in the text colour last set (the last chosen money line's: shot 078's purple); a line per chosen series, a white one a
// pixel lower first, one point a turn, x = right - 19 - (turns + 1 - turn) * ((width - 80) / 100), y = axis - v * (axis - 13) / max.
// The five money series are bytes against a maximum (100,000 / 50,000 / 100,000 / 10,000 / 1,000,000 to start, raised to the next
// 50,000 above any value, a negative value counting five times), their legends "$%s" "%sM" "$%s" "%sP" "%s" right-aligned at 72,
// a row of 10 each; the techs are the player's standing (6 for each living rival behind, 3 for each level with him, of 6 per
// rival), which is the remake's history's `hx.tr` in hundredths. Income: the record's player +8, the remake's `inc`; Metal `hx.met`;
// Ship Money (+0x10, the savings) `hx.sav`; Population `pop`. Ship Power (FUN_0041adc6) isn't in the remake's history: its line
// stays empty (docs/status-w95.md, needs a shared file).
const GRAPH = {
  pics: [3110, 3162, 3117, 4011, 4017, 3100, 3101, 3102, 3103, 3104],
  names: ['Income', 'Metal', 'Ship Money', 'Ship Power', 'Population', 'Range', 'Speed', 'Weapons', 'Shields', 'Mini'],
  ids: [1111, 1084, 1112, 1113, 1088, 1114, 1115, 1116, 1117, 1118],
  colors: ['#91713a', '#de0806', '#4600a6', '#1fb814', '#562c05', '#800000', '#ff6402', '#0000d5', '#404040', '#000000'],
  fmt: ['$%s', '%sM', '$%s', '%sP', '%s'], start: [100000, 50000, 100000, 10000, 1000000],
  get mask() { try { return +localStorage.getItem('ho5.w95.graph') || 0; } catch (e) { return 0; } },
  set mask(v) { try { localStorage.setItem('ho5.w95.graph', String(v)); } catch (e) {} },
};
function graphSeries(g, p) {
  const h = (p.hist || []).filter(e => e && e.y != null); if (!h.length) return null;
  const end = h[h.length - 1].y, first = Math.max(h[0].y, end - 990);
  const rows = h.filter(e => e.y >= first);
  const val = [(e) => e.inc, (e) => e.hx && e.hx.met, (e) => e.hx && e.hx.sav, () => null, (e) => e.pop];
  const max = GRAPH.start.slice();
  val.forEach((f, i) => rows.forEach(e => { const v = f(e); if (v == null) return; const m = v < 1 ? v * -5 : v; if (m > max[i]) max[i] = Math.ceil(m / 50000) * 50000; }));
  const pts = [];
  for (let i = 0; i < 10; i++) pts.push(rows.map(e => {
    const b = Math.round((e.y - first) / 10);
    if (i < 5) { const v = val[i](e), q = Math.trunc(max[i] / 127); return [b, v == null || !q ? 0 : Math.max(-128, Math.min(127, Math.trunc(v / q)))]; }
    const t = e.hx && e.hx.tr ? e.hx.tr[i - 5] : null; return [b, t == null ? 0 : t * 127 / 100];
  }));
  return { first, end, n: Math.round((end - first) / 10), max, pts };
}
function graphDialog() {
  const a = A(), g = a.G, dl = W95DLG(354); if (!dl) return false;
  const kfmt = (n) => Math.round(n).toLocaleString('en-US');
  const sr = graphSeries(g, a.me());
  const icons = GRAPH.ids.map((id, i) => {
    const box = dl.by[id]; box.classList.add('gi'); box.setAttribute('role', 'button'); box.tabIndex = 0; box.title = TL(GRAPH.names[i]);
    const im = a.IMG['w95:b' + GRAPH.pics[i]]; const pic = document.createElement('i'); pic.className = 'gp'; if (im && im.src) pic.style.backgroundImage = `url("${im.src}")`;
    box.append(pic, span('gn', TL(GRAPH.names[i])));
    const flip = () => { GRAPH.mask = GRAPH.mask ^ (1 << i); paint(); };
    box.addEventListener('click', flip); box.addEventListener('keydown', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); flip(); } });
    return box;
  });
  const gc = dl.by[1119], cv = document.createElement('canvas'); cv.className = 'gcv'; dl.el.append(cv);
  const paint = () => {
    const m = GRAPH.mask; icons.forEach((b, i) => { b.classList.toggle('on', !!(m & (1 << i))); b.setAttribute('aria-pressed', m & (1 << i) ? 'true' : 'false'); });
    const dpr = window.devicePixelRatio || 1, cw = parseFloat(dl.el.style.width), ch = parseFloat(dl.el.style.height);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, cw, ch);
    const ox = parseFloat(gc.style.left), oy = parseFloat(gc.style.top), w = parseFloat(gc.style.width), h = parseFloat(gc.style.height);
    const L = ox, T0 = oy, R = ox + w, B = oy + h;
    // the frame round the icons, their lines
    const r0 = icons[0], r9 = icons[9], rx = (e) => parseFloat(e.style.left), ry = (e) => parseFloat(e.style.top);
    x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(Math.round(rx(r0)) - 3 + 0.5, Math.round(ry(r0)) - 3 + 0.5, Math.round(rx(r9) + parseFloat(r9.style.width) - rx(r0)) + 5, Math.round(parseFloat(r0.style.height)) + 5);
    icons.forEach((b, i) => { const l = rx(b), t = ry(b) + parseFloat(b.style.height); x.strokeStyle = GRAPH.colors[i]; x.lineWidth = 2; x.beginPath(); x.moveTo(Math.round(l) + 2, Math.round(t) + 6); x.lineTo(Math.round(l + parseFloat(b.style.width)) - 2, Math.round(t) + 6); x.stroke(); });
    // the graph
    x.fillStyle = '#fff'; x.fillRect(L + 80, T0, w - 80, h); x.strokeStyle = '#000'; x.lineWidth = 2; x.strokeRect(L + 81, T0 + 1, w - 82, h - 2);
    const d0 = Math.round(B - h / 6), cH = d0 - T0 - 13, col = Math.trunc((w - 80) / 100);
    x.beginPath(); x.moveTo(L + 80, d0); x.lineTo(R, d0); x.moveTo(L + 78, T0 + 13); x.lineTo(L + 74, T0 + 13); x.stroke();
    x.font = '11px "MS Sans Serif", "Microsoft Sans Serif", Arial, sans-serif'; x.textBaseline = 'top';
    let ink = '#000';
    if (sr) for (let e = 0; e < 5; e++) if (m & (1 << e)) { ink = GRAPH.colors[e]; x.fillStyle = ink; x.textAlign = 'right'; x.fillText(cfmt(TL(GRAPH.fmt[e]), kfmt(sr.max[e])), L + 72, T0 + e * 10 - 5); }
    if (sr) {
      let step = Math.trunc((sr.end - sr.first) / 4); if (step < 101) step = 100; step -= step % 10;
      x.fillStyle = ink; x.strokeStyle = '#000'; x.lineWidth = 1; x.textAlign = 'center';
      for (let y = sr.first; y <= sr.end; y += step) { const px = R - 20 - (Math.trunc((sr.end - y) / 10) + 1) * col; x.beginPath(); x.moveTo(px + 0.5, d0 - 2); x.lineTo(px + 0.5, d0 + 2); x.stroke(); x.fillText(String(y), px, d0 + 4); }
      for (let i = 0; i < 10; i++) {
        if (!(m & (1 << i))) continue;
        const mx = 127; // (the techs kept in hundredths of 127: their own maximum is the whole span)
        for (const [pen, dy] of [['#fff', 1], [GRAPH.colors[i], 0]]) {
          x.strokeStyle = pen; x.lineWidth = 2; x.beginPath(); let on = false;
          for (const [b, v] of sr.pts[i]) { if (!(v > 0)) continue; const px = R - (sr.n + 1 - b) * col - 19, py = d0 - Math.trunc(v * cH / mx) + dy; if (!on) { x.moveTo(px, py); on = true; } else x.lineTo(px, py); }
          x.stroke();
        }
      }
    }
  };
  dl.by[1].addEventListener('click', () => a.closeModal());
  showDlg(dl, TL('Graph History...').replace(/\.\.\.$/, '')); paint();
  return true;
}


// Send Message (dialog 365, shot 085; FUN_0049a4b0's class: Erase FUN_0049a77d, Send FUN_0049a7cb, the steps FUN_0049b001 /
// FUN_0049a8e1, clicks FUN_0049b64a). The message is built a step at a time, the remake's own steps (rules.cannedChat, 'steps'):
// To Whom? (the other players still in, their faces, then Everyone (picture 1402) and, with alliances, Your Allies and Your Buddies
// (2021)), Saying What? (pictures 10000-10014), then what the line needs (Which Star? / Who? / Where?: stars as the map draws them,
// players' faces). The heading (1156) is list 771's line for the step, written as the program writes it ("Send MessageTo Whom?",
// shot 085). The choices sit in the big box (control 1148), 60-pixel cells five a row, the picture at (14, 2), the name centred
// under it at 30, the cell black with white words while pressed; what is chosen stacks in the narrow box (1154): a click there goes
// back to that step. Text Msg. shows MessageText (25 letters, a beep beyond). Send sends and starts again; Erase starts again;
// Done closes. Erase is dimmed until a step is taken, Send until the message is whole.
function sendDialog() {
  const a = A(), g = a.G, C = H().rules(g).cannedChat; if (!C || C.style !== 'steps') return false;
  const dl = W95DLG(365); if (!dl) return false;
  const big = dl.by[1148], col = dl.by[1154], head = dl.by[1156], txt = dl.by[1158], txtL = dl.by[1157];
  [big, col].forEach(b => { b.classList.add('sgrid'); b.textContent = ''; });
  const facePic = (o) => { const p = g.players[o]; if (!p) return 1402; return o === a.ME ? (p.female ? 1905 : 1405) : (p.female ? 2500 : 2000) + ((p.face || 0) % 20); };
  const starPic = (sid) => { try { const l = a.starLook(sid); const im = l && (l.pic || a.IMG[l.base]); return im && im.src ? im.src : null; } catch (e) { return null; } };
  const picSrc = (n) => { const im = a.IMG['w95:b' + n]; return im && im.src ? im.src : null; };
  let to = null, act = null, parts = [];
  const steps = () => { const ps = act != null ? C.actions[act].parts : []; return 2 + ps.length; };
  const stepNow = () => (to == null ? 0 : act == null ? 1 : 2 + parts.length);
  const done = () => to != null && act != null && parts.length >= C.actions[act].parts.filter(q => q[1] !== 'text').length;
  const isText = () => act != null && C.actions[act].parts.some(q => q[1] === 'text');
  const items = (k) => {
    if (k === 0) return C.to(g, a.ME).filter(o => !o[2]).map(([v, l]) => ({ v, l: typeof v === 'number' ? l : TL(l), src: typeof v === 'number' ? picSrc(facePic(v)) : picSrc(v === 'all' ? 1402 : 2021) }));
    if (k === 1) return C.actions.map((x, i) => ({ v: i, l: TL(x.label), src: picSrc(10000 + i) }));
    const pt = C.actions[act].parts[k - 2]; if (!pt || pt[1] === 'text') return [];
    return C.list(g, a.ME, pt[1], a.UI.sel).filter(o => !o[2]).map(([v, l]) => ({ v, l, src: pt[1] === 'players' ? picSrc(facePic(v)) : starPic(v) }));
  };
  const cell = (it, onPick) => {
    const c = document.createElement('div'); c.className = 'scell'; c.setAttribute('role', 'button'); c.tabIndex = 0; c.title = it.l;
    const i = document.createElement('i'); i.className = 'sp'; if (it.src) i.style.backgroundImage = `url("${it.src}")`;
    c.append(i, span('sl', it.l));
    c.addEventListener('pointerdown', () => c.classList.add('down'));
    ['pointerleave', 'pointercancel'].forEach(t => c.addEventListener(t, () => c.classList.remove('down')));
    c.addEventListener('click', () => { c.classList.remove('down'); onPick(); });
    c.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onPick(); } });
    return c;
  };
  const chosen = () => { const out = []; if (to != null) out.push(items(0).find(x => x.v === to)); if (act != null) out.push(items(1)[act]); parts.forEach((v, j) => { const it = items(2 + j).find(x => x.v === v); out.push(it || { v, l: String(v) }); }); return out.filter(Boolean); };
  const back = (k) => { if (k <= 0) { to = null; act = null; parts = []; } else if (k === 1) { act = null; parts = []; } else parts = parts.slice(0, k - 2); draw(); };
  const draw = () => {
    const k = stepNow(), whole = done();
    big.textContent = ''; col.textContent = '';
    if (!whole) items(k).slice(0, 20).forEach(it => big.append(cell(it, () => { if (k === 0) to = it.v; else if (k === 1) act = it.v; else parts.push(it.v); draw(); })));
    chosen().forEach((it, j) => col.append(cell(it, () => back(j))));
    const P = k === 0 ? C.prompts[0] : k === 1 ? C.prompts[1] : !whole && act != null ? C.actions[act].parts[k - 2][0] : '';
    head.textContent = TL(P).replace(/\n/g, '');
    const t = whole && isText(); txt.style.visibility = t ? 'visible' : 'hidden'; txtL.classList.toggle('dim', !t);
    dl.by[1151].disabled = k === 0; dl.by[1150].disabled = !whole;
    if (t) txt.focus();
  };
  txt.maxLength = 80; txt.addEventListener('input', () => { if (txt.value.length > 25) { txt.value = txt.value.slice(0, 25); try { a.beep(); } catch (e) {} } });
  dl.by[1151].addEventListener('click', () => back(0));
  dl.by[1150].addEventListener('click', () => {
    if (!done()) return;
    const v = parts.slice(); if (isText()) v.text = txt.value;
    const r = H().sendCanned(g, a.ME, C.make(g, a.ME, to, act, v));
    if (r === 'limit') { w95Note(TL('Sorry, you can only send ten messages per turn.')); return; }
    if (r === 'ok') { try { a.Sound.play(5000); } catch (e) {} a.save(); }
    txt.value = ''; back(0);
  });
  dl.by[1].addEventListener('click', () => a.closeModal());
  showDlg(dl, TL('Send Message')); draw();
  return true;
}
const w95Note = (t) => { const a = A(); if (a.toast) a.toast(t); else window.alert(t); };

T.window = (name, ...args) => {
  if (W95ON()) { if (name === 'fleets') return fleetsDialog(); if (name === 'stars') return starsDialog(); if (name === 'surrender' && surrenderDialog()) return true; if (name === 'give') return giveDialog(); if (name === 'players') return graphDialog(); if (name === 'chat' && sendDialog()) return true; if (name === 'build' && buildDialog(args[0])) return true; }
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
  const cred = doc.createElement('div'); cred.className = 'w95cred'; cred.textContent = TL(CREDITS);
  const logo = doc.createElement('i'); logo.className = 'w95logo';
  const row = doc.createElement('div'); row.className = 'w95btns';
  const o = doc.querySelector('#tcont'), n = doc.querySelector('#tnew');
  const q = doc.createElement('button'); q.type = 'button'; q.className = 'w95quit'; q.textContent = TL('Quit'); q.disabled = true; q.title = 'A web page can’t close itself';
  if (o) { o.textContent = TL('Open Game'); row.append(o); } if (n) { n.textContent = TL('New Game'); row.append(n); } row.append(q);
  body.append(cred, logo, row);
}
const prevTitle = T.title;
T.title = (frame, IMG, Sound) => {
  const r = prevTitle ? prevTitle(frame, IMG, Sound) : false;
  const lg = document.querySelector('#titlescreen .w95logo'), im = IMG && IMG['w95:b383'];
  if (lg && im && im.src) lg.style.backgroundImage = `url("${edgeURL(im)}")`;
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
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bw95b'; btn.textContent = TL('Skip');
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
    // the side's luck (FUN_00422339: picture 3141 + the record's +0x104 / +0x106, beside the face, 32 to the right, none at 0; the
    // record keeps rand(-1, 1) with Luck in Battles on, FUN_00421430). The remake's battle record keeps it as b.luck when the rules
    // write it (docs/status-w95.md, needs a shared file).
    const lk = b.luck ? b.luck[b.sides ? b.sides.indexOf(o) : ci] : 0;
    if (lk) { const mp = pic(3141 + lk); if (mp) x.drawImage(mp, colX[ci] + 32, 2); }
    text(p.name || '', colX[ci] + 67, p.name && p.name.length > 7 ? 24 : 20, p.name && p.name.length > 7 ? '600 11px Arial, sans-serif' : BAT_FONT);
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const GY = (row) => 53 * row + 38;
  const tile = (gr, gx, gy) => {
    let im = null;
    if (gr.planet) im = pic(1003);
    else { const u = b.start[gr.units[0]], d = H().getDesign(g, gr.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 }; im = shipPicClean(d, IMG); }
    x.fillStyle = '#000'; x.fillRect(gx, gy, 120, 40); // (a group's box is 120 x 40: FUN_004251cd)
    if (im) { const w = im.width, h = im.height, sc = Math.min(1, 120 / w, 40 / h), dx = gx + (120 - w * sc) / 2, dy = gy + (40 - h * sc) / 2;
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
    text(t, gx + 60 - Math.trunc(w / 2), gy + 41, BAT_SMALL); // (centred on the box, under it: FUN_004251cd)
    if (!gr.planet) {
      const n = gr.units.filter(i => alive[i]).length;
      let f = 0, q = -1; for (const i of gr.units) { const h = hurt[i]; if (h && h.n > q && alive[i]) { q = h.n; f = h.f; } }
      let l = gx, r = gx + 120;
      if (n > 0) r = Math.min(gx + 120, gx + Math.trunc(120 * clamp(f, 0, 1)));
      if (r > l) { x.fillStyle = grayPat; x.fillRect(l, gy, r - l, 40); }
    }
    drawStars();
  };
  const roundLabel = (n) => { x.fillStyle = '#000'; x.fillRect(190, 254, 110, 18); text(cfmt(TL('Round %d'), n), 194, 256); };
  x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh);
  drawStars();
  P0.head.forEach((t, i) => text(t, 155, i ? 18 : 1));
  [0, 1].forEach(ci => { if (owners[ci] != null) face(owners[ci], ci); });
  [0, 1].forEach(ci => {
    if (hidden[ci]) { const L = rs.battleLines || {}; text(L.noInfo || TL('You have no information.'), 145, 85); text(L.destroyed || TL('You were destroyed immediately.'), 145, 100); skip = true; }
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
  // a hit and a kill as FUN_00428118: a hit stamps picture 12000 + n % 3 (17 x 17) at (n % 103, n % 23) in the target's box; a kill (sound
  // 3003, with Fully Animated Battles) fills 59 ovals from the middle out (inset i across, i * 40 / 120 down, i from 59 to 1), each the
  // colour of hue (59 - i) * 175 of 65535 at full saturation and value (red to yellow), a tick every second one, then fills them black
  // from the largest in.
  async function explosion(tg, ev, until) {
    const l = colX[tg.ci], tp = GY(tg.row), dm = ev.dm | 0, W0 = 120, H0 = 40;
    if (ev.snd !== 3003) { const im = pic(12000 + (dm % 3)); if (im) x.drawImage(im, l + (dm % 103), tp + (dm % 23), 17, 17); return; }
    if (!VB.full) return;
    const oval = (i, style) => { const a = l + i, b2 = l + W0 - i, t = tp + Math.trunc(i * 40 / 120), bt = tp + H0 - Math.trunc(i * 40 / 120); if (b2 <= a || bt <= t) return;
      x.fillStyle = style; x.beginPath(); x.ellipse((a + b2) / 2, (t + bt) / 2, (b2 - a) / 2, (bt - t) / 2, 0, 0, Math.PI * 2); x.fill(); };
    for (let i = 59; i > 0 && !stop && !skip; i--) { oval(i, hsv((59 - i) * 175, 1)); if (i % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
    for (let i = 1; i < 60 && !stop && !skip; i++) { oval(i, '#000'); if (i % 2 === 0 && performance.now() < until) await wait(performance.now() + TICK); }
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
    btn.textContent = TL('Done');
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
  const ok = dl.by[1]; const sub = document.createElement('button'); sub.type = 'submit'; sub.className = ok.className; sub.setAttribute('style', ok.getAttribute('style')); sub.textContent = TL('OK'); ok.replaceWith(sub);
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
    const im = a.IMG['w95:b3520']; if (im && im.src) dl.by[1138].style.background = `url("${edgeURL(im)}") left top / 80px 74px no-repeat`;
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


// ---------- Create New Galaxy (unit 9): the remake's New Game form dressed as dialog 111 (shot 002) while the 405 ruleset is chosen ----------
// The program draws the four choices itself (not in the template): boxes of 48-pixel cells, each its picture over its name, the chosen one
// black: Galaxy Density (Dense 114, Sparse 115) at (18, 58), Galaxy Style (Circle 116, Random 117, Ring 118, Spiral 119, Grid 120, Cluster
// 121) at (179, 58), Computer Intelligence (Dumb 122, Average 123, Smart 125, Diabolical 127) at (18, 138), Galaxy Size (Small 129 ...
// Humongous 133) at (228, 138) (measured on shot 002; the pictures matched on it). From the template: the computer players' bar (1012), the
// check boxes Alliances (1015), Luck in Battles (1203) and Automatically end turn for unconnected players (1204), Turn Time Limit (1013) and
// Years Per Turn (1014), Cancel and Create. They set the form's own fields (w_density, w_shape, w_iq, w_size, computers, alliances, luck,
// autoend, timelimit, w_years); the remake's other choices (name, the version, skin, language...) stay under "More…".
const CNG = [
  { f: 'w_density', at: [18, 58], label: 'Galaxy Density:', pics: { dense: 114, sparse: 115 } },
  { f: 'w_shape', at: [179, 58], label: 'Galaxy Style:', pics: { circle: 116, random: 117, ring: 118, spiral: 119, grid: 120, cluster: 121 } },
  { f: 'w_iq', at: [18, 138], label: 'Computer Intelligence:', pics: { dumb: 122, average: 123, smart: 125, diabolical: 127 } },
  { f: 'w_size', at: [228, 138], label: 'Galaxy Size:', pics: { small: 129, medium: 130, large: 131, xl: 132, huge: 133 } }];
function createGalaxy95(f) {
  const a = A(), win = f.closest('.win'); if (!win || f.querySelector('.w95cng')) return;
  const field = (n) => f.querySelector(`[name="${n}"]`), fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  const dl = W95DLG(111); if (!dl) return;
  dl.el.classList.add('w95cng');
  const title = span('cngt', TL('Create New Galaxy')); dl.el.append(title);
  const IMG = () => (window.HOAPI && HOAPI.IMG) || {};
  const boxes = CNG.map((B) => {
    const sel = field(B.f); if (!sel) return null;
    const lab = span('cngl', TL(B.label), `left:${B.at[0]}px;top:${B.at[1] - 13}px`); dl.el.append(lab);
    const box = document.createElement('div'); box.className = 'cngb'; box.style.left = B.at[0] + 'px'; box.style.top = B.at[1] + 'px';
    const draw = () => { box.innerHTML = ''; [...sel.options].forEach(o => { if (!(o.value in B.pics)) return; const c = document.createElement('div'); c.className = 'cc' + (sel.value === o.value ? ' on' : ''); c.setAttribute('role', 'option');
      const im = IMG()['w95:b' + B.pics[o.value]], i = document.createElement('i'); if (im && im.src) i.style.backgroundImage = `url("${im.src}")`; c.append(i, span('', TL(o.textContent)));
      c.addEventListener('click', () => { sel.value = o.value; fire(sel); draw(); }); box.append(c); }); };
    draw(); dl.el.append(box); return draw;
  });
  // the computer players (0 to 19) and the rest
  const comp = field('computers'), bar = dl.by[1012], num = span('cngn', '', 'left:196px;top:196px');
  dl.el.append(span('cngl', TL('Number of Computer Players:'), 'left:18px;top:196px'), num);
  if (comp && bar) { bar.min = 0; bar.max = 19; bar.value = /^\d+$/.test(comp.value) ? comp.value : 4; const sh = () => { num.textContent = String(bar.value); }; sh();
    bar.addEventListener('input', () => { comp.value = String(bar.value); fire(comp); sh(); }); }
  const ck = (id, name, text) => { const l = dl.by[id], fi = field(name); if (!l) return; l.querySelector('input').remove(); if (!fi) { l.style.display = 'none'; return; } const c = fi.cloneNode(); c.checked = fi.checked; c.removeAttribute('name');
    c.addEventListener('change', () => { fi.checked = c.checked; fire(fi); }); l.prepend(c); l.append(document.createTextNode(' ' + TL(text))); l.style.width = 'auto'; };
  ck(1015, 'alliances', 'Alliances'); ck(1203, 'luck', 'Luck in Battles'); ck(1204, 'autoend', 'Automatically end turn for unconnected players');
  const mirror = (id, name, label, lx) => { const c = dl.by[id], fi = field(name); if (!c) return; if (!fi || !fi.options.length) { c.style.display = 'none'; return; }
    [...fi.options].forEach(o => { const n = document.createElement('option'); n.value = o.value; n.textContent = o.textContent; c.append(n); }); c.value = fi.value;
    c.addEventListener('change', () => { fi.value = c.value; fire(fi); }); dl.el.append(span('cngl', TL(label), `left:${lx}px;top:${parseFloat(c.style.top) + 3}px`)); };
  mirror(1013, 'timelimit', 'Turn Time Limit:', 252); mirror(1014, 'w_years', 'Years Per Turn:', 252);
  dl.by[2].addEventListener('click', () => a.closeModal());
  dl.by[1].addEventListener('click', () => f.requestSubmit());
  let opened = false;
  const more = document.createElement('button'); more.type = 'button'; more.className = 'pb cngmore'; more.textContent = TL('More… (the remake’s own)'); dl.el.append(more);
  const holder = document.createElement('div'); holder.className = 'w95cngh'; holder.append(dl.el);
  const rest = [...f.childNodes]; f.prepend(holder);
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote'));
  const rs = field('rules');
  const dress = () => { const on = !rs || rs.value === '405'; holder.style.display = on ? '' : 'none'; win.classList.toggle('w95cngw', on);
    for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; boxes.forEach(d => d && d()); };
  more.addEventListener('click', () => { opened = !opened; dress(); });
  if (rs) rs.addEventListener('change', dress); dress();
}
const prevNewGame = T.newGame;
T.newGame = (f, ctx) => { if (prevNewGame) prevNewGame(f, ctx); if (de.classList.contains('w95win')) createGalaxy95(f); };


// The fleets' orders (FUN_0048e811): for each of your fleets with a next stop, a line 2 wide from where it is (a fleet on its way: part way
// along, by its progress) to that stop: green (0x00FF00) for a colony fleet, cyan (0xFFFF00 in Windows' BGR) for any other; no arrow. The
// classic page's own arrows are off meanwhile (T.routes).
Object.defineProperty(T, 'routes', { configurable: true, get: () => (W95ON() ? false : undefined) });
T.fleetPaths = (cx, c) => {
  if (!W95ON()) return;
  for (const f of c.G.fleets) {
    if (f.owner !== c.ME || f.sat) continue;
    let x1, y1, to;
    if (f.to != null) { const a = c.G.stars[f.from], b = c.G.stars[f.to], t = Math.max(0, Math.min(1, f.dist ? f.prog / f.dist : 0)); x1 = c.sx(a.x + (b.x - a.x) * t); y1 = c.sy(a.y + (b.y - a.y) * t); to = b; }
    else if (f.dest != null && f.star != null) { const a = c.G.stars[f.star]; x1 = c.sx(a.x); y1 = c.sy(a.y); to = c.G.stars[f.dest]; }
    else continue;
    const colony = H().fleetDesigns(c.G, f).some(d => d.type === 'colony');
    cx.save(); cx.strokeStyle = colony ? '#00ff00' : '#00ffff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(c.sx(to.x), c.sy(to.y)); cx.stroke(); cx.restore();
  }
};
// The drag line (FUN_004148a7, MAPCLICK.CPP): XOR-ed in white (R2_XORPEN), solid to a star in reach, dotted to one beyond it; an arrow
// head at the end it can reach; the distance (shot 048: "7") beside the middle, 5 to the side the line leans away from and 5 up.
T.dragRoute = (cx, o) => {
  if (!W95ON()) return false;
  cx.save(); cx.globalCompositeOperation = 'difference'; cx.strokeStyle = '#fff'; cx.lineWidth = 1;
  if (!o.ok) cx.setLineDash([1, 2]);
  cx.beginPath(); cx.moveTo(o.x1, o.y1); cx.lineTo(o.x2, o.y2); cx.stroke(); cx.setLineDash([]);
  const head = (xa, ya, xb, yb) => { const ang = Math.atan2(yb - ya, xb - xa), L = 8; cx.beginPath();
    cx.moveTo(xb - L * Math.cos(ang - 0.45), yb - L * Math.sin(ang - 0.45)); cx.lineTo(xb, yb); cx.lineTo(xb - L * Math.cos(ang + 0.45), yb - L * Math.sin(ang + 0.45)); cx.stroke(); };
  if (o.ok) head(o.x1, o.y1, o.x2, o.y2);
  if (o.round) head(o.x2, o.y2, o.x1, o.y1); // (and at the start when it can come back)
  cx.globalCompositeOperation = 'source-over';
  if (o.dist != null) {
    const t = String(o.dist); cx.font = '11px "MS Sans Serif", "Microsoft Sans Serif", Arial, sans-serif'; cx.fillStyle = '#fff'; cx.textBaseline = 'top';
    const mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2, w = cx.measureText(t).width;
    cx.fillText(t, (o.y2 - o.y1) * (o.x2 - o.x1) < 0 ? mx - 5 - w : mx + 5, my - 5 - 11);
  }
  cx.restore(); return true;
};


// End Turn's clock (FUN_004903ea): with no time limit, its window shows the time you have played this game, "%1.1ld:%2.2ld" (hours,
// minutes: shot 010 "0:00", 054 "0:32"), and its orange hand turns with the seconds, 6 degrees a second, from the clock's middle. The
// remake keeps the time per game and player in this browser ("ho5.w95.clock.<game>.<player>"), counting while the page is shown and the
// game goes on. (With a time limit the classic page's countdown stays.)
const CLK = { t: 0, key: '', timer: null };
const clockKey = () => { const a = A(); return a && a.G ? 'ho5.w95.clock.' + (a.G.gameId || 'g') + '.' + a.ME : ''; };
function clockPaint() {
  const btn = document.querySelector('#msg .clock') || document.querySelector('#w95clk .clock'); if (!btn || !W95ON()) return;
  const yr = btn.querySelector('.clockyear'); const a = A(); if (!yr || (a.G && a.G.opts && a.G.opts.timeLimit > 0)) return;
  const k = clockKey(); if (k !== CLK.key) { CLK.key = k; try { CLK.t = +localStorage.getItem(k) || 0; } catch (e) { CLK.t = 0; } }
  const m = Math.floor(CLK.t / 60); yr.textContent = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); yr.classList.add('w95time');
  let h = btn.querySelector('.w95hand'); if (!h) { h = document.createElement('i'); h.className = 'w95hand'; btn.append(h); }
  h.style.transform = `rotate(${(CLK.t % 60) * 6 - 90}deg)`;
}
function clockTick() {
  const a = A(); if (!W95ON() || !a.G || a.G.over || document.visibilityState !== 'visible') return;
  const k = clockKey(); if (k !== CLK.key) { CLK.key = k; try { CLK.t = +localStorage.getItem(k) || 0; } catch (e) { CLK.t = 0; } }
  CLK.t++; if (CLK.t % 10 === 0) try { localStorage.setItem(k, String(CLK.t)); } catch (e) {}
  clockPaint();
}
if (!CLK.timer) CLK.timer = setInterval(clockTick, 1000);
const prevAfterMsg2 = T.afterMsg;
// 4.0.5 shows the clock and the report bubble together (shots 008, 010): while a report is up the remake's message box holds only the
// bubble, so the skin puts a clock of its own at the clock's place (#w95clk, the same pictures and End Turn).
function extraClock(box) {
  const wrap = document.getElementById('mapwrap'); let host = document.getElementById('w95clk');
  const want = W95ON() && box && box.querySelector('.card:not(.end):not(.waiting)') && !box.querySelector('.clock');
  if (!want) { if (host) host.remove(); return; }
  if (host && host.isConnected) return;
  const a = A(), up = a.IMG['w95:b367'], down = a.IMG['w95:b368']; if (!wrap || !up || !up.src) return;
  host = document.createElement('div'); host.id = 'w95clk';
  const btn = document.createElement('button'); btn.className = 'clock pic'; btn.setAttribute('aria-label', 'End turn');
  const im = document.createElement('img'); im.src = up.src; im.alt = ''; btn.append(im);
  if (down && down.src) { btn.addEventListener('pointerdown', () => { im.src = down.src; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, () => { im.src = up.src; })); }
  const Y = T.endTurnYear, Hh = up.height || 61, yr = document.createElement('span'); yr.className = 'clockyear'; yr.setAttribute('aria-hidden', 'true');
  yr.style.cssText = `left:${Y[0] / Y[4] * 100}%;top:${Y[1] / Hh * 100}%;width:${Y[2] / Y[4] * 100}%;height:${Y[3] / Hh * 100}%`; btn.append(yr);
  btn.addEventListener('click', () => { try { a.doEndTurn(); } catch (e) {} });
  host.append(btn); wrap.append(host);
}
T.afterMsg = (box, info) => { if (prevAfterMsg2) prevAfterMsg2(box, info); extraClock(box); clockPaint(); };


// ---------- the selection ring and the pact halos (FUN_00493baa) ----------
// Planets are the original's star rectangles (FUN_0048c169): 32 pixels at zoom 17, 16 at 9 and 12, the zoom itself at 6 (the
// pictures are drawn 1.3 times planetPx, starLook's scale). Under each star (T.mapUnder, as the original copies the sprite into the
// star's buffer first) picture 175: the selected star gets the green ring, one of five frames, the next one each tick of the frame
// idle step (PLANET_MS, see the turning planet); its owner in a mutual pact adds a halo over it, yellow for allies (players
// +0x238 both ways), cyan for best buddies (+0x288 both ways). Another player's star in a mutual pact gets the halo alone. Big
// frames 56 x 51 at (star - 12, star - 9), source x 15 + 58 * frame, rows 0 / 52 / 104, halos (159 | 244, 156); small 26 x 26 at
// (star - 5, star - 5), 15 + 29 * frame, rows 156 / 183 / 210, halos (217, 156 | 183). Nothing at zoom 6. The opaque black of the
// sprite covers the sky's points, as there. (The star's owner as the program reads it, +0x2a: a mutual ally's stars are no secret.)
const zoomOf = (v) => Math.round(v.s / 2);
const prevPlanetPx = T.planetPx;
T.planetPx = (sc) => { if (!W95ON()) return prevPlanetPx ? prevPlanetPx(sc) : Math.max(18, Math.min(52, sc * 0.9)); const z = Math.round(sc / 2); return (z >= 17 ? 32 : z >= 7 ? 16 : z) / 1.3; };
T.selectScale = () => (W95ON() ? 0 : 1); // (the classic picture drawn at nothing: the ring is drawn below)
const SEL = { f: 0 }, SKY = { off: [], seed: (g) => { const t = String(g.gameId || '') + g.W + 'x' + g.H; let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; } };
Object.defineProperty(T, 'bgStars', { configurable: true, get: () => !W95ON() }); // (not the classic page's blue points)
const pactLevel = (g, me, o) => {
  if (o == null || o < 0 || o === me) return 0;
  const p = g.players[me], q = g.players[o]; if (!p || !q) return 0;
  const both = (k) => (p[k] || []).includes(o) && (q[k] || []).includes(me);
  return both('buddies') ? 2 : both('allies') || both('buddies') ? 1 : 0;
};
const prevMapUnder = T.mapUnder;
T.mapUnder = (cx, i) => {
  if (prevMapUnder) prevMapUnder(cx, i);
  if (!W95ON()) return;
  const a = A(), sheet = a.IMG['w95:b175'], z = zoomOf(i.view);
  // the sky (FUN_0048bd31): every star keeps a white point somewhere in the galaxy (its +0x2a / +0x2c cell), dark while its flag is
  // set, the flag flipping with a 2% chance each tick; the second point's colour (7 or 9, near black) doesn't show. The remake puts the
  // points by the galaxy's seed and the star's number, so they keep their places as the map scrolls.
  cx.fillStyle = '#fff';
  i.G.stars.forEach((st, n) => {
    let h = (SKY.seed(i.G) ^ Math.imul(n + 1, 2654435761)) >>> 0; const r = () => { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return h / 4294967296; };
    if (SKY.off[n]) return;
    const x = Math.floor(i.sx(r() * i.G.W)), y = Math.floor(i.sy(r() * i.G.H));
    if (x >= 0 && y >= 0 && x < i.mapW && y < i.mapH) cx.fillRect(x, y, 1, 1);
  });
  if (!sheet || !sheet.width || z < 7) return;
  const big = z >= 17;
  for (const st of i.G.stars) {
    const x = i.sx(st.x), y = i.sy(st.y);
    if (x < -40 || y < -40 || x > i.mapW + 40 || y > i.mapH + 40) continue;
    const lv = pactLevel(i.G, i.ME, st.owner), sel = a.UI.sel === st.id;
    let sxy = null;
    if (sel) sxy = big ? [15 + 58 * SEL.f, [0, 52, 104][lv]] : [15 + 29 * SEL.f, [156, 183, 210][lv]];
    else if (lv) sxy = big ? [lv === 2 ? 244 : 159, 156] : [217, lv === 2 ? 183 : 156];
    if (!sxy) continue;
    const w = big ? 56 : 26, h = big ? 51 : 26, l = big ? x - 16 - 12 : x - 8 - 5, t = big ? y - 16 - 9 : y - 8 - 5;
    cx.drawImage(sheet, sxy[0], sxy[1], w, h, Math.round(l), Math.round(t), w, h);
  }
};
setInterval(() => { // one idle step (FUN_0048bd31): the sky's points flip (2% each), the selection ring's next frame
  const a = A(); if (!W95ON() || document.visibilityState !== 'visible' || a.UI.drag) return;
  let ch = false; a.G.stars.forEach((st, n) => { if (Math.random() < 0.02) { SKY.off[n] = !SKY.off[n]; ch = true; } });
  if (a.UI.sel != null && zoomOf(a.UI.view) >= 7) { SEL.f = (SEL.f + 1) % 5; ch = true; }
  if (ch) a.draw();
}, PLANET_MS);

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
