// Spaceward Ho! web remake — the Mac 1.0 skin's own parts (see js/skins/mac10/ui.js, which loads this before js/skins/mac12/ui.js).
//
// Everything here is drawn from the 1990 manual's figures (printed at about 1.67 times the Mac's pixels: Geneva 9 star names and menu
// items of 16 measure so). Page numbers are the manual's. What the manual doesn't show stays 1.2's (docs/mac10-skin.md).
// mac12/ui.js calls HOMAC10_BUILD with its drawing tools (K) and puts what it returns in place of its own hooks.
(function () {
'use strict';
const DIR = 'assets/skins/mac10/sprites/';
const PIC = {};
for (const n of ['colony', 'explored', 'unexplored', 'enemy']) for (const s of ['', '-sel']) { const im = new Image(); im.src = DIR + 'm10' + n + s + '.png'; PIC[n + s] = im; }
{ const im = new Image(); im.src = DIR + 'm10fleet.png'; PIC.fleet = im; }
const COVER = new Image(); COVER.src = DIR + 'cover.png';
// which windows are closed (a window's close box, the Windows menu), kept for the next game as the program kept them ("Spaceward Ho!
// automatically saves your window configuration when you quit and restores it the next time you play", p. 6)
const WINS = ['budget', 'planet', 'tech', 'report', 'help'];
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const closed = new Set((store.get('ho5.mac10.closed') || '').split(',').filter(Boolean));
let hideAll = false; // (Hide Floating Windows, ⌘W: every window but the map, until chosen again)
const saveClosed = () => store.set('ho5.mac10.closed', [...closed].join(','));
const shown = (k) => !hideAll && !closed.has(k);
let SOME = false; // the Budget Window's "all" / "some" (p. 15)
let BTOP = 0, FTOP = 0; // the Budget Window's and the Planet Window's fleet list's scroll
let HELP = 'This is the help window. Move the mouse on top of something to learn about it.'; // (p. 7, as the figure has it)

window.HOMAC10_BUILD = (K) => {
  const { A, G, H } = K;
  // 1.0 was English only: its own windows and dialogs show in an English game; in another language the 1.2 skin's (its French, 1.2F's own
  // words; the others, the remake's), as the 1.2 skin keeps its windows to 1.2's languages. The map's pictures and the menus are 1.0's in every
  // language (the menus' words through js/ui-text.js)
  const en = () => K.lang() === 'en';
  const ME = () => A().ME;
  const redraw = () => { const a = A(); if (a && a.G) { a.renderPanel(); a.draw(); } };
  const nice = (n) => K.nice(n);
  const money = (n) => (n < 0 ? '-$' : '$') + nice(Math.abs(n));

  // ---------- the Star Map (pp. 8-11) ----------
  // Four kinds of star, each a 32 x 32 icon (tools/skins/mac10_icons.py): yours ("the planets that look like good guys": the cowboy hat), one
  // explored and nobody's, one never seen ("?"), and an enemy's ("Any planet you lose a battle at becomes an enemy planet ... Enemy planets look
  // like a wide variety of bad guys": the manual shows one, the bandit, and it stands for them all). A selected star "looks funny": inverted
  // inside its outline (Nasl, p. 9). A dot at its top right when a fleet is there (Adhara, p. 10); a circle round it when it has satellites (p. 8).
  // (the look arrives as the skin's picture number, the DOS game's scheme that 1.2 uses: 1000-1003 and 1100, 1500-1603 yours, 1004-1006 and
  // 1010-1011 explored, 1007 and 1008 never seen, 1009 a battle seen there, 2000 on someone else's)
  const kind = (look) => {
    const b = String(look.base || ''), n = +(/(\d{4})$/.exec(b) || [])[1];
    if (b === 'unknown' || b === 'soon' || n === 1007 || n === 1008) return 'unexplored';
    if (b === 'battle' || n === 1009 || n >= 2000 || (look.hat && look.hat.startsWith('bad'))) return 'enemy';
    if (look.hat || (n >= 1000 && n <= 1003) || (n >= 1100 && n < 1200) || (n >= 1500 && n < 1700)) return 'colony';
    return 'explored';
  };
  function drawStar(cx, i) {
    if (!K.own()) return false;
    const a = A(), g = i.G, s = i.s, u = i.view.s / 2, zi = K.zoomIdx(i.view.s);
    const look = a.starLook ? a.starLook(s.id) : i.look;
    // the smallest zoom: a dot ("A lot of detail is lost when you zoom out all the way", p. 37), as 1.2's
    if (zi === 0) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(i.x, i.y, 2.5, 0, Math.PI * 2); cx.fill(); return 'all'; }
    const d = u >= 17 ? 32 * Math.max(1, u / 17) : 16, k = kind(look || {}), im = PIC[k + (i.sel ? '-sel' : '')];
    cx.save(); cx.imageSmoothingEnabled = false;
    if (im && im.complete && im.naturalWidth) cx.drawImage(im, Math.round(i.x - d / 2), Math.round(i.y - d / 2), d, d);
    const f = d / 32;
    // satellites: a circle round it
    if (g.fleets.some(fl => fl.star === s.id && fl.sat && fl.to == null && (fl.owner === i.ME || s.owner === i.ME))) {
      cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.beginPath(); cx.arc(Math.round(i.x) + 0.5, Math.round(i.y) + 0.5, 14.5 * f + 2, 0, Math.PI * 2); cx.stroke();
    }
    // a fleet there (yours; or anyone's at your colony)
    if (g.fleets.some(fl => fl.star === s.id && fl.to == null && !fl.sat && (fl.owner === i.ME || s.owner === i.ME)) && PIC.fleet.complete) cx.drawImage(PIC.fleet, Math.round(i.x + 13 * f), Math.round(i.y - 21 * f), 5 * Math.max(1, f), 5 * Math.max(1, f));
    // its name under it, white Geneva 9, from the second zoom on (1.2's rule)
    cx.font = K.G9; cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    if (zi === 1) cx.letterSpacing = '-1px';
    cx.fillText(s.name, Math.round(i.x), Math.round(i.y + d / 2 + 12));
    cx.letterSpacing = '0px'; cx.restore();
    return 'all';
  }
  // what the Help Window says of a star under the pointer: the manual's own sentences for each kind (pp. 8-11)
  const STAR_HELP = {
    colony: 'This is a planet where you have established a colony. Your colonies are the planets that look like good guys.',
    explored: 'This is a planet that you’ve explored recently, but have not established a colony at.',
    unexplored: 'This is a planet that you’ve never been to, or that you haven’t been to for a long time.',
    enemy: 'Any planet you lose a battle at becomes an enemy planet.',
  };

  // ---------- the windows ----------
  // a windoid: 1.2's title bar (11 rows dotted round a close box, no title: the figures on pp. 7-18 have the same) over its body; the close box
  // closes it (the Windows menu opens it again)
  function windoid(key, w, body, label) {
    const a = A(), tb = K.titleBar12(w);
    tb.addEventListener('click', (e) => { const r = tb.getBoundingClientRect(), x = (e.clientX - r.left) * w / r.width; if (x >= 5 && x <= 16) { closed.add(key); saveClosed(); redraw(); } });
    const box = a.el('section', { class: 'box win10 w10-' + key, style: `width:${w}px`, 'aria-label': label }, tb, body);
    box.hidden = !shown(key);
    return box;
  }

  // The Budget Window (pp. 13-15; the figure is 283 x 128): on the left "Current Year : 2020", "Current Resources :" with Money and Metal,
  // "Income Last Turn :" with ΔMoney and ΔMetal; "(done)" after the year once you have ended a turn in a game of several humans. On the right
  // the bars from 150: the heading "0", "all" (or "some") and "100", a rule under it, a row of 16 a slot from 19 (Savings, the colonies, Tech),
  // the name right-aligned at 146, the bar 11 high from the row's 3rd pixel, 100 pixels for 100%; a colony losing money has the black line at what
  // keeps it alive (p. 24); the scroll bar at the right edge. A click or a drag on a bar sets it, the others making room in proportion; a click
  // on a star's name selects it and brings the map to it, a double click opens its Planet Window; a click on "all" / "some" shows only what
  // you spend money on, or must (p. 15).
  let PB = {}; // (the panel's budget entries, B.ents, from the last drawing)
  function budget10() {
    const a = A(), g = G(), p = a.me(), rs = H().rules(g), Wd = 283, HT = 117, x0 = 150, L = 100;
    const q = K.qdCanvas(Wd, HT, 'Budget Window');
    const humans = g.players.filter(pl => pl.human).length, done = humans > 1 && (g.done || []).includes(ME());
    q.text(`Current Year : ${g.year}${done ? ' (done)' : ''}`, 4, 14);
    q.text('Current Resources:', 4, 29);
    q.text(`Money : ${money(p.savings)}`, 9, 38);
    q.text(`Metal:  ${nice(p.metal)}`, 9, 47);
    q.text('Income Last Turn:', 4, 65);
    const chg = p.chg || {};
    q.text(`ΔMoney : ${money(chg.money || 0)}`, 9, 74);
    q.text(`ΔMetal:  ${nice(chg.metal || 0)}`, 9, 83);
    // the bars
    q.text('0', x0 + 1, 12); q.text(SOME ? 'some' : 'all', 0, 12, K.G9, { center: x0 + L / 2 }); q.text('100', 0, 12, K.G9, { right: x0 + L });
    q.hline(x0, 265, 16); q.vline(x0, 16, HT);
    const ents = PB.ents || [];
    const cols = ents.filter(e => e.star != null), home = p.homeStar;
    const homeFirst = cols.filter(e => e.star === home).concat(cols.filter(e => e.star !== home));
    let slots = ents.filter(e => e.key === 'savings').concat(homeFirst, ents.filter(e => e.key === 'tech'));
    const losing = (st) => !!(st && (st.oInc != null ? st.oInc : H().planetIncome(g, p, st)) < 0);
    if (SOME) slots = slots.filter(e => e.key === 'savings' || e.key === 'tech' || e.get() > 0.0005 || losing(g.stars[e.star]));
    const rows = Math.trunc((HT - 19) / 16);
    BTOP = Math.max(0, Math.min(BTOP, slots.length - rows));
    const x = q.x, tb = [];
    slots.slice(BTOP, BTOP + rows).forEach((e, r) => {
      const y = 19 + 16 * r, pm = Math.round(e.get() * 1000), len = Math.min(L, Math.round(pm * L / 1000)), st = e.star != null ? g.stars[e.star] : null;
      x.fillStyle = '#000'; x.fillRect(x0 + 1, y + 3, len, 11);
      if (st && losing(st)) { const mn = rs.minShare ? rs.minShare(g, p, st.id) : 0; q.vline(x0 + 1 + Math.min(L, Math.round(mn * L / 1000)), y + 3, y + 16); }
      const name = e.key === 'savings' ? 'Savings' : e.key === 'tech' ? 'Tech' : st.name;
      q.text(name, 0, y + 13, K.G9, { right: 146 });
      tb.push({ x: x0 + 1, y: y + 3, w: L, h: 11, vert: false, frac: len / L, label: name });
    });
    K.drawBar(x, 265, 0, true, HT, 16, { on: true, value: BTOP, max: Math.max(0, slots.length - rows) });
    q.c.dataset.help = 'budget';
    q.c.dataset.bars = JSON.stringify(tb); q.c.dataset.w = String(Wd); q.c.dataset.h = String(HT); // (where the bars are, in the window's pixels: tools/real-play.js)
    q.c.style.touchAction = 'none';
    q.c.addEventListener('dblclick', (ev) => { const pt = q.at(ev); if (pt.h >= x0 || pt.v < 16) return; const e = slots[BTOP + Math.floor((pt.v - 19) / 16)]; if (e && e.star != null) { closed.delete('planet'); hideAll = false; saveClosed(); a.UI.sel = e.star; redraw(); } });
    q.c.addEventListener('pointerdown', (ev) => {
      const pt = q.at(ev), v = pt.v;
      if (pt.h >= 265) { if (v < 16) BTOP--; else if (v >= HT - 16) BTOP++; else BTOP += v < HT / 2 ? -rows : rows; a.renderPanel(); return; }
      if (v < 16) { if (pt.h >= x0 + 30 && pt.h < x0 + 70) { SOME = !SOME; BTOP = 0; a.renderPanel(); } return; }
      if (pt.h < x0 - 60) return;
      const e = slots[BTOP + Math.floor((v - 19) / 16)]; if (!e) return;
      if (pt.h < x0) { if (e.key === 'tech') { closed.delete('tech'); hideAll = false; saveClosed(); a.renderPanel(); } else if (e.star != null) { a.UI.sel = e.star; if (a.centerOn) a.centerOn(e.star); redraw(); } return; }
      ev.preventDefault();
      const lk = rs.barLocked ? rs.barLocked(g, p, e.key) : null; if (lk) { a.beep(); return; }
      const start = JSON.stringify(p.budget);
      const set = (e2) => {
        const f = Math.max(0, Math.min(1, (q.at(e2).h - x0) / L)), pm = Math.round(f * 1000);
        if (rs.dragShare) { const b = p.budget, o = JSON.parse(start); b.tech = o.tech; b.savings = o.savings; b.col = o.col; const r = rs.dragShare(g, p, e.key, pm); if (r) { if (r.tech != null) b.tech = r.tech / 1000; if (r.savings != null) b.savings = r.savings / 1000; for (const k in r.col || {}) b.col[k] = r.col[k] / 1000; } }
        else e.set(pm / 1000);
        const c = budgetBox(); box.replaceWith(c); box = c;
      };
      const up = (e2) => { window.removeEventListener('pointermove', set); window.removeEventListener('pointerup', up); set(e2); a.save(); a.renderPanel(); };
      window.addEventListener('pointermove', set); window.addEventListener('pointerup', up); set(ev);
    });
    K.wheel12(q.c, (n) => { BTOP += n; a.renderPanel(); }, () => slots.length > rows);
    let box = q.c;
    return q.c;
  }
  const budgetBox = () => budget10();

  // The Planet Window (pp. 16-17; the figure is 247 x 113): the star's name and its place "(20,14)", "Income: $20,370" under them; the bars
  // Trrfmg, Mining and Ships (1.2's DrawVBarControl: 18 wide, 9 apart, 50 high, the axis at 31 with "100" and "0" beside it, the names under
  // them, the middle one a row lower); on the right Population, Temperature, Gravity and "Metal Est." with their figures right-aligned at
  // 242; under them a list box (137..242, 47..101) of the fleets here, with its scroll bar. A star not yours shows what you know of it.
  function planet10() {
    const a = A(), g = G(), p = a.me(), s = a.UI.sel != null ? g.stars[a.UI.sel] : null, Wd = 247, HT = 105;
    const q = K.qdCanvas(Wd, HT, s ? s.name : 'Planet Window');
    q.c.dataset.help = 'planet';
    if (!s) return q.c;
    const k = H().know(g, p, s.id), mineS = s.owner === ME();
    q.text(s.name, 3, 12); q.text(`(${Math.round(s.x)},${Math.round(s.y)})`, 54, 12);
    const R = (lbl, val, v) => { q.text(lbl, 138, v); q.text(val, 0, v, K.G9, { right: 242 }); };
    if (mineS || k.explored) {
      const src = mineS ? s : k;
      if (mineS) q.text(`Income: ${money(Math.round(H().planetIncome(g, p, s)))}`, 33, 23);
      R('Population:', nice(H().popNum(g, mineS ? s.pop : (k.pop || 0))), 12);
      const t = H().seenT ? H().seenT(p, src) : src.temp;
      R('Temperature:', a.degF ? a.degF(t) : `${(+t).toFixed(1)}°F`, 22);
      R('Gravity:', `${(+src.g).toFixed(2)}G`, 31);
      R('Metal Est.:', nice(Math.round(src.metal || 0)), 41);
    } else q.text('Unexplored.', 138, 12);
    if (mineS) {
      const vals = K.colonyBars(s, p), names = ['Trrfmg', 'Mining', 'Ships'];
      const lin = (v) => Math.trunc(50 * v / 1000);
      // (no ticks on the axis in the figure: those vbars draws are painted out)
      const draw = () => { q.rect(0, 26, 136, 105, '#fff'); K.vbars(q, 31, 29, K.colonyBars(s, p), 2, names, lin); q.rect(29, 29, 31, 79, '#fff'); q.text('100', 10, 34); q.text('0', 21, 80); };
      draw();
      q.c.dataset.bars = JSON.stringify(K.colonyBars(s, p).map((v, i) => ({ x: 40 + 27 * i, y: 29, w: 18, h: 50, vert: true, frac: Math.max(0, v) / 1000, label: names[i] })).filter((b, i) => K.colonyBars(s, p)[i] >= 0));
      q.c.dataset.w = String(Wd); q.c.dataset.h = String(HT);
      K.dragBars(q, 31, 29, () => K.colonyBars(s, p), 2, (v, end) => { if (v) { K.setColonyBars(s, v); draw(); } if (end) { a.save(); a.renderPanel(); } }, (px) => px * 20);
      q.c.addEventListener('dblclick', () => a.openBuild(s.id));
    }
    // the fleets here: a list box, a row of 12 a fleet, the selected one inverted, each "Fleet 1", "Fleet 2" as the Organize Fleets dialog
    // names them (p. 23)
    const here = a.fleetOrder ? a.fleetOrder(g.fleets.filter(f => f.star === s.id && f.to == null && f.owner === ME())) : [];
    const rows = 4;
    FTOP = Math.max(0, Math.min(FTOP, here.length - rows));
    q.x.strokeStyle = '#000'; q.x.lineWidth = 1; q.x.strokeRect(137.5, 47.5, 105, 54);
    here.slice(FTOP, FTOP + rows).forEach((f, i) => {
      const top = 49 + 12 * i, t = `Fleet ${FTOP + i + 1}`;
      q.x.save(); q.x.beginPath(); q.x.rect(138, top, 88, 12); q.x.clip(); q.text(t, 140, top + 10); q.x.restore();
      if (f.id === a.UI.selFleet) { q.x.globalCompositeOperation = 'difference'; q.rect(138, top, 226, top + 12, '#fff'); q.x.globalCompositeOperation = 'source-over'; }
    });
    K.drawBar(q.x, 226, 47, true, 55, 16, { on: true, value: FTOP, max: Math.max(0, here.length - rows) });
    q.c.addEventListener('click', (ev) => {
      const pt = q.at(ev); if (pt.h < 137 || pt.v < 47 || pt.v > 101) return;
      if (pt.h >= 226) { FTOP += pt.v < 74 ? -1 : 1; a.renderPanel(); return; }
      const f = here[FTOP + Math.floor((pt.v - 49) / 12)]; if (f) { a.UI.selFleet = f.id; redraw(); }
    });
    K.wheel12(q.c, (n) => { FTOP += n; a.renderPanel(); }, () => here.length > rows);
    return q.c;
  }

  // The Tech Spending Window (p. 18; the figure is 245 x 93): "Tech Spending", "100" beside the axis; "Current Levels:" and the five
  // levels (Range, Speed, Weapons, Defense, Mini: 1.0 says Defense where 1.2 says Shields) a row of 10 from 35; the bars from the axis at 96,
  // their foot at 57, "0" beside it, the names under them, every other one a row lower.
  function tech10() {
    const a = A(), g = G(), p = a.me(), Wd = 245, HT = 82, sc = H().barScale(g, 'tech');
    const keys = ['range', 'speed', 'weapons', 'shields', 'mini'], names = ['Range', 'Speed', 'Weapons', 'Defense', 'Mini'];
    const q = K.qdCanvas(Wd, HT, 'Tech Spending Window');
    q.c.dataset.help = 'tech';
    const toPix = (v) => Math.trunc(50 * sc.toX(v)), fromPix = (px) => sc.toValue(px / 50);
    const vals = () => { const t = keys.reduce((s, k) => s + (p.talloc[k] || 0), 0) || 1; return keys.map(k => Math.round(1000 * (p.talloc[k] || 0) / t)); };
    const draw = () => {
      q.rect(0, 0, Wd, HT, '#fff');
      q.text('Tech Spending', 3, 12); q.text('100', 0, 13, K.G9, { right: 93 }); q.text('0', 0, 58, K.G9, { right: 93 });
      q.text('Current Levels:', 3, 25);
      keys.forEach((k, i) => { q.text(names[i], 7, 35 + 10 * i); q.text(String(p.tech[k]), 58, 35 + 10 * i); });
      K.vbars(q, 96, 7, vals(), 2, names, toPix); q.rect(94, 7, 96, 57, '#fff'); // (no ticks, as the figure)
    };
    draw();
    q.c.dataset.bars = JSON.stringify(vals().map((v, i) => ({ x: 105 + 27 * i, y: 7, w: 18, h: 50, vert: true, frac: toPix(v) / 50, label: names[i] })));
    q.c.dataset.w = String(Wd); q.c.dataset.h = String(HT);
    K.dragBars(q, 96, 7, vals, 2, (v, end) => { if (v) { keys.forEach((k, i) => { p.talloc[k] = v[i] / 1000; }); draw(); } if (end) { a.save(); a.renderPanel(); } }, fromPix);
    return q.c;
  }

  // The Report Window (p. 12; the figure is 352 x 117): plain text, Geneva 9, a line of 12; each turn's reports between "Report for new
  // turn starting in 2020." and "End of report for 2020.", a blank line between reports and two before a new turn; its scroll bar and grow
  // box at the right. "Using the mouse, select the name of a planet or fleet": a click on a report goes to what it is about.
  const REP = { key: '', top: null };
  function report10() {
    const a = A(), g = G(), p = a.me(), rs = H().rules(g), el = a.el;
    const old = rs.reportHistory ? (p.reportLog || []) : [], ms = old.concat(p.inbox || []);
    const ul = el('ul', { 'aria-label': 'Report Window' });
    let yr = null;
    const line = (t, o) => { const li = el('li', o || null); li.append(document.createTextNode(t)); li.setAttribute('translate', 'no'); ul.append(li); return li; };
    ms.forEach((m) => {
      const y = m.year != null ? m.year : g.year;
      if (y !== yr) { if (yr != null) { line(`End of report for ${yr}.`); line(''); line(''); } line(`Report for new turn starting in ${y}.`); line(''); yr = y; }
      const li = el('li', { class: 'click', tabindex: 0, onclick: () => a.reportAction(m) }); li.append(a.degText(H().say(g, m.text))); ul.append(li); line('');
    });
    if (yr != null) line(`End of report for ${yr}.`);
    const bc = el('canvas', { class: 'cv12' }), bar = el('div', { class: 'rbar10', 'aria-hidden': 'true' }, bc);
    const grow = K.qdCanvas(16, 16, ''); grow.c.classList.add('grow10'); grow.c.setAttribute('aria-hidden', 'true');
    grow.rect(0, 0, 16, 16, '#000'); grow.rect(1, 1, 15, 15, '#fff'); grow.x.strokeStyle = '#000'; grow.x.strokeRect(3.5, 3.5, 6, 6); grow.rect(6, 6, 12, 12, '#fff'); grow.x.strokeRect(5.5, 5.5, 7, 7);
    const body = el('div', { class: 'rep10', style: 'height:106px' }, ul, bar, grow.c);
    const paint = () => {
      const max = Math.max(0, Math.ceil((ul.scrollHeight - ul.clientHeight) / 12)), v = Math.min(max, Math.round(ul.scrollTop / 12));
      const L = 91, k = Math.max(2, Math.ceil(K.MACS.s * (window.devicePixelRatio || 1)));
      bc.width = 16 * k; bc.height = L * k; bc.style.width = '16px'; bc.style.height = L + 'px';
      const x = bc.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.fillStyle = '#fff'; x.fillRect(0, 0, 16, L);
      K.drawBar(x, 0, 0, true, L, 16, { on: true, value: v, max });
    };
    bar.addEventListener('pointerdown', (e) => { const r = bc.getBoundingClientRect(), y = (e.clientY - r.top) * 91 / r.height; ul.scrollTop += y < 16 ? -12 : y > 75 ? 12 : y < 45 ? -ul.clientHeight : ul.clientHeight; paint(); });
    ul.addEventListener('scroll', () => { REP.top = ul.scrollTop; paint(); });
    K.wheel12(ul, (n) => { ul.scrollTop += 12 * n; paint(); }, () => ul.scrollHeight > ul.clientHeight);
    const key = g.turn + ':' + ms.length;
    setTimeout(() => { if (REP.key === key && REP.top != null) ul.scrollTop = REP.top; else ul.scrollTop = ul.scrollHeight; REP.key = key; paint(); }, 0);
    return body;
  }

  // The Help Window (p. 7; the figure is 174 x 67): what the pointer is over, in a few lines
  let helpEl = null;
  function help10() { helpEl = A().el('div', { class: 'help10', style: 'height:56px', 'aria-live': 'polite' }); helpEl.textContent = HELP; return helpEl; }
  const setHelp = (t) => { if (!t || t === HELP) return; HELP = t; if (helpEl) helpEl.textContent = t; };
  document.addEventListener('pointerover', (e) => {
    if (!document.documentElement.classList.contains('mac10lay')) return;
    const t = e.target.closest && e.target.closest('[data-help]'); if (!t) return;
    const h = (window.HOHELP || {})[t.dataset.help]; if (h) setHelp(h[0]);
  });
  document.addEventListener('pointermove', (e) => { // a star on the map: what kind it is (pp. 8-11)
    const a = A(); if (!a || !a.G || !document.documentElement.classList.contains('mac10lay') || !e.target.closest || !e.target.closest('#map')) return;
    const h = a.UI.hover; if (h == null || !a.starLook) return;
    setHelp(STAR_HELP[kind(a.starLook(h) || {})]);
  });

  function panel10(panel, B) {
    const a = A(), el = a.el, de = document.documentElement;
    PB = B;
    de.classList.add('mac10lay'); de.classList.toggle('mac10help', shown('help'));
    panel.innerHTML = '';
    panel.append(windoid('budget', 283, budget10(), 'Budget Window'), windoid('planet', 247, planet10(), 'Planet Window'), windoid('tech', 245, tech10(), 'Tech Spending Window'), windoid('help', 174, help10(), 'Help Window'));
    let low = document.getElementById('low10');
    if (!low) { low = el('div', { id: 'low10' }); const m = document.getElementById('main'); if (m) m.append(low); }
    low.innerHTML = '';
    low.append(windoid('report', 352, report10(), 'Report Window'));
    // the map window's title: "Joe:Milky Way", your name and the galaxy's (p. 9)
    const t = document.getElementById('title'), g = G(); if (t && g) t.textContent = `${a.me().name}:${g.opts.galaxy || 'Milky Way'}`;
    requestAnimationFrame(K.measureMac);
  }

  // ---------- the dialogs (pp. 21, 23, 37) ----------
  // Items placed as the figures measure them (the dialog's outer frame at 0, 0; rects [top, left, bottom, right]); lists and buttons in
  // Chicago 12, a list row of 16; a list's scroll bar 16 wide at its right.
  const CH = K.SYS12;
  // a list box drawn on a canvas: rows [{ cols: [[text, x], ...], dim }], the chosen row inverted; click picks, double click acts
  function list10(r, rows, st, o) {
    const w = r[3] - r[1], h = r[2] - r[0], n = Math.floor((h - 2) / 16), q = K.qdCanvas(w, h, o.label || '');
    q.c.style.cssText = K.at20(r);
    st.top = Math.max(0, Math.min(st.top || 0, rows.length - n));
    q.x.strokeStyle = '#000'; q.x.strokeRect(0.5, 0.5, w - 1, h - 1);
    rows.slice(st.top, st.top + n).forEach((row, i) => {
      const t = 1 + 16 * i;
      row.cols.forEach(([txt, x, right]) => { q.x.save(); q.x.beginPath(); q.x.rect(1, t, w - 18, 16); q.x.clip(); q.text(txt, right ? 0 : x, t + 12, CH, right ? { right: x } : null); q.x.restore(); });
      if (st.top + i === st.pick) { q.x.globalCompositeOperation = 'difference'; q.rect(1, t, w - 17, t + 16, '#fff'); q.x.globalCompositeOperation = 'source-over'; }
    });
    K.drawBar(q.x, w - 16, 0, true, h, 16, { on: true, value: st.top, max: Math.max(0, rows.length - n) });
    q.c.dataset.t = rows.map(x => x.cols.map(c => c[0]).join(' ')).join('\n');
    q.c.addEventListener('click', (ev) => { const pt = q.at(ev); if (pt.h >= w - 16) { st.top += pt.v < 16 ? -1 : pt.v >= h - 16 ? 1 : pt.v < h / 2 ? -n : n; o.redraw(); } });
    // each row an option over the drawing (as 1.2's Build window: a reader, the keyboard and the test tools have something to click); a click
    // chooses it, a double click acts (1.2's dbl12: a double tap on a touch screen too)
    const lb = A().el('div', { role: 'listbox', 'aria-label': o.label || '', style: K.at20([r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 16]) });
    const pick = (i) => { st.pick = i; if (o.pick) o.pick(i); o.redraw(); };
    rows.slice(st.top, st.top + n).forEach((row, k) => {
      const i = st.top + k;
      lb.append(A().el('div', { class: 'li', role: 'option', tabindex: 0, 'aria-selected': i === st.pick ? 'true' : 'false', 'aria-label': row.cols.map(c => c[0]).join(' '),
        style: `position:absolute;left:0;right:0;top:${16 * k}px;height:16px;cursor:default`,
        onclick: K.dbl12('l10' + (o.label || '') + i, () => pick(i), () => { pick(i); if (o.dbl) o.dbl(i); }),
        onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); pick(i); if (o.dbl) o.dbl(i); } } }));
    });
    const wrap = A().el('div', { style: 'display:contents' }, q.c, lb);
    K.wheel12(q.c, (k) => { st.top += k; o.redraw(); }, () => rows.length > n);
    return wrap;
  }
  const button = (t, r, fn, o) => { const b = K.put20(A().el('button', { type: 'button', class: 'ok20' + (o && o.def ? ' def20' : ''), onclick: fn }, K.raw('span', t)), r); b.style.zIndex = '2'; if (o && o.off) b.disabled = true; return b; }; // (over the items' layer, whatever their order)
  const label = (t, r, bold) => { const n = K.txt20(t, r); n.style.overflow = 'visible'; n.style.whiteSpace = 'nowrap'; if (bold) n.style.fontWeight = 'normal'; return n; };

  // Ship Building Queue For <star> (p. 21; the figure is 465 x 305): "Loop Queue" at the top right; "Type", "Cost" and "% Done" over the
  // queue, a row a ship, its cost "$2746(P)", or "$95053(D)" for the first of a type never built ("It costs more to build the first one of a
  // new ship type", p. 30), "0%" on the first; "Avail. Types" over the types; Delete, Add, Done (the default) and Cancel. Add queues the type
  // chosen on the right, Delete takes the ship chosen on the left off. The ruleset's own queue holds: 1.2's has three slots, so a fourth
  // type beeps. Loop Queue is the ruleset's: no ruleset the remake has loops a queue, so it is dimmed.
  const BQ = { q: { top: 0, pick: -1 }, t: { top: 0, pick: -1 } };
  function build10(sid) {
    const a = A(), el = a.el, g = G(), p = a.me(), s = g.stars[sid];
    if (!s || s.owner !== ME() || !H().feature(g, 'buildQueue')) return false;
    const before = JSON.stringify(s.queue || []);
    const ds = p.designs.filter(d => !d.scrapped);
    BQ.q.pick = -1; BQ.t.pick = ds.length ? 0 : -1; // (the first type chosen when it opens, so Add works at once: the figure has one chosen; which one 1.0 chose first isn't known)
    const box = el('div', { style: 'position:absolute;left:0;top:0;width:465px;height:305px' });
    const draw = () => {
      box.innerHTML = '';
      const rows = [], seen = new Set(), Q = s.queue || [];
      Q.forEach((it, slot) => {
        const d = H().getDesign(g, ME(), it.did); if (!d) return;
        for (let k = 0; k < it.n; k++) {
          const c = H().designCost(g, d), dev = d.built === 0 && !d.free && !seen.has(d.id); seen.add(d.id);
          const cost = `$${Math.round(dev ? (c.protoTotal != null ? c.protoTotal : c.money) : c.money)}(${dev ? 'D' : 'P'})`;
          const yp = rows.length === 0 && H().rules(g).yardProgress ? H().rules(g).yardProgress(g, p, s) : null;
          rows.push({ slot, cols: [[d.name, 7], [cost, 136], ...(rows.length === 0 ? [[`${yp ? Math.max(0, Math.min(100, Math.round(yp.pct))) : 0}%`, 226, true]] : [])] });
        }
      });
      box.append(
        label(`Ship Building Queue For  ${s.name}`, [21, 32, 37, 280]),
        label('Type', [61, 32, 77, 90]), label('Cost', [61, 165, 77, 210]), label('% Done', [61, 226, 77, 280]), label('Avail. Types', [61, 305, 77, 420]),
        list10([77, 29, 229, 274], rows, BQ.q, { label: 'Queue', redraw: draw }),
        list10([77, 303, 228, 436], ds.map(d => ({ cols: [[d.name, 7]] })), BQ.t, { label: 'Avail. Types', redraw: draw, dbl: () => add() }),
      );
      const cb = el('label', { style: K.at20([22, 306, 38, 420]) + ';display:flex;align-items:center;gap:4px;white-space:nowrap' }, el('input', { type: 'checkbox', disabled: 'disabled' }), K.raw('span', 'Loop Queue'));
      box.append(cb);
      box.append(button('Delete', [246, 69, 265, 128], () => { const r = rows[BQ.q.pick]; if (!r) return; H().unqueueShip(g, ME(), sid, r.slot); BQ.q.pick = -1; draw(); }, { off: !rows[BQ.q.pick] }));
      box.append(button('Add', [246, 173, 265, 231], () => add(), { off: !ds[BQ.t.pick] })); // (dimmed until a type is chosen, as Delete is in the figure)
    };
    const add = () => { const d = ds[BQ.t.pick]; if (!d) { a.beep(); return; } if (d.scrap301 || !H().canBuildType(g, p, d.type) || !H().queueShips(g, ME(), sid, d.id, 1)) a.beep(); draw(); };
    draw();
    // (Done and Cancel first: a dialog's items 1 and 2, the default button and Cancel, as a Mac DITL orders them)
    const dl = K.dlog20(465, 305,
      button('Done', [261, 276, 280, 334], () => { a.closeModal(); a.save(); a.renderPanel(); }, { def: true }),
      button('Cancel', [261, 356, 281, 415], () => { s.queue = JSON.parse(before); a.closeModal(); a.renderPanel(); }), box);
    a.modal('', dl, { cls: 'mac12 dl20w mac10dlg', label: 'Ship Building Queue For ' + s.name });
    return true;
  }

  // Organize Fleets (p. 23; the figure is 431 x 281, "works a lot like the Font/DA Mover"): two lists of the ships in a fleet, a line a type
  // and its count, each under a pop-up of the fleets at the star ("Fleet 1", "Fleet 2"); between them ">> 1 >>" and ">> 10 >>", which move
  // one or ten of the type chosen across (the arrows point from the side chosen); New under each list starts an empty fleet there, Delete
  // drops it while it is still empty (dimmed otherwise, as in the figure); Done. What may join what is the ruleset's (HO.canMerge: 1.2's fleets
  // hold one design), and a move it refuses beeps.
  function organize10(f0) {
    const a = A(), el = a.el, g = G(), sid = f0 && f0.star; if (sid == null) return false;
    const fleets = () => (a.fleetOrder ? a.fleetOrder(g.fleets.filter(f => f.star === sid && f.to == null && f.owner === ME() && !f.sat)) : []);
    const side = [{ f: f0.id, st: { top: 0, pick: -1 }, empty: false }, { f: null, st: { top: 0, pick: -1 }, empty: false }];
    { const o = fleets().find(f => f.id !== f0.id); if (o) side[1].f = o.id; else side[1].empty = true; }
    let from = 0;
    const box = el('div', { style: 'position:absolute;left:0;top:0;width:431px;height:281px' });
    const fleetOf = (i) => g.fleets.find(f => f.id === side[i].f) || null;
    const lines = (f) => (f ? H().fleetDesigns(g, f).map(d => ({ did: d.id, cols: [[d.name, 7], [String(f.ships[d.id]), 147, true]] })) : []);
    const move = (n) => {
      const src = fleetOf(from), dstI = 1 - from, L = lines(src), ln = L[side[from].st.pick];
      if (!src || !ln) { a.beep(); return; }
      const nf = H().splitFleet(g, src, { [ln.did]: n });
      const dst = fleetOf(dstI);
      if (dst) { if (H().canMerge && !H().canMerge(g, dst, nf)) { H().mergeFleets(g, src, nf); a.beep(); draw(); return; } H().mergeFleets(g, dst, nf); }
      else { side[dstI].f = nf.id; side[dstI].empty = false; }
      if (!H().fleetCount(src)) { g.fleets.splice(g.fleets.indexOf(src), 1); side[from].f = null; side[from].empty = true; if (a.UI.selFleet === src.id) a.UI.selFleet = null; }
      draw();
    };
    const draw = () => {
      box.innerHTML = '';
      const fl = fleets();
      [0, 1].forEach((i) => {
        const L = i ? 249 : 14, sel = el('select', { 'aria-label': 'Fleet', style: K.at20([18, L + 13, 37, L + 113]) + ';font:' + CH });
        fl.forEach((f, k) => { if (f.id === side[1 - i].f) return; sel.append(el('option', { value: String(f.id) }, `Fleet ${k + 1}`)); });
        if (side[i].empty || side[i].f == null) sel.append(el('option', { value: '' }, `Fleet ${fl.length + 1}`));
        sel.value = side[i].f == null ? '' : String(side[i].f);
        sel.addEventListener('change', () => { side[i].f = sel.value ? +sel.value : null; side[i].empty = !sel.value; side[i].st.pick = -1; draw(); });
        box.append(sel, list10([50, L, 201, L + 163], lines(fleetOf(i)), side[i].st, { label: 'Ships', redraw: draw, pick: () => { from = i; side[1 - i].st.pick = -1; } }));
        box.append(button('New', [207, L + 46, 226, L + 106], () => { side[i].f = null; side[i].empty = true; side[i].st.pick = -1; draw(); }));
        box.append(button('Delete', [231, L + 46, 250, L + 106], () => { side[i].empty = false; const o = fleets().find(f => f.id !== side[1 - i].f); side[i].f = o ? o.id : null; draw(); }, { off: !(side[i].empty && side[i].f == null) }));
      });
      const arr = from === 0 ? ['>> 1 >>', '>> 10 >>'] : ['<< 1 <<', '<< 10 <<'];
      box.append(button(arr[0], [76, 183, 95, 243], () => move(1)), button(arr[1], [115, 183, 134, 243], () => move(10)));
    };
    draw();
    const dl = K.dlog20(431, 281, button('Done', [238, 183, 257, 248], () => { a.closeModal(); a.save(); redraw(); }, { def: true }), box);
    a.modal('', dl, { cls: 'mac12 dl20w mac10dlg', label: 'Organize Fleets' });
    return true;
  }

  // Compare Players (p. 37; the figure is 460 x 281): "Item" and "Rank" over a box of lines, "Your Range tech is 6." with "2nd (tied)",
  // the five technologies, "You have 1 star.", "Your income is $20,686.", "Your ship power is 103.", then the turn's time limit and "There
  // are currently 5 players in the game." (players out, whose income is 0, not counted: p. 36); Done.
  const ORD = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  function compare10() {
    const a = A(), el = a.el, g = G(), me = a.me(), live = g.players.filter(p => p.alive && !p.surrendered);
    if (!H().rules(g).shipPower) return false; // ("ship power" is a ruleset's own measure: one without it keeps its own Compare window)
    const rank = (f) => { const v = f(me), above = live.filter(p => f(p) > v).length, tie = live.filter(p => p !== me && f(p) === v).length; return ORD(above + 1) + (tie ? ' (tied)' : ''); };
    const inc = (p) => Math.round(H().projected(g, p).income), pow = (p) => Math.round(H().shipStrength(g, p)), nst = (p) => H().colonies(g, p.id).length;
    const T = [['Range', 'range'], ['Speed', 'speed'], ['Weapons', 'weapons'], ['Defense', 'shields'], ['Mini', 'mini']];
    const rows = T.map(([w, k]) => ({ cols: [[`Your ${w} tech is ${me.tech[k]}.`, 7], [rank(p => p.tech[k]), 211]] }));
    const n = nst(me);
    rows.push({ cols: [[`You have ${n} star${n === 1 ? '' : 's'}.`, 7], [rank(nst), 211]] });
    rows.push({ cols: [[`Your income is ${money(inc(me))}.`, 7], [rank(inc), 211]] });
    rows.push({ cols: [[`Your ship power is ${nice(pow(me))}.`, 7], [rank(pow), 211]] });
    rows.push({ cols: [['There is no turn time limit.', 7]] });
    rows.push({ cols: [[`There are currently ${live.length} players in the game.`, 7]] });
    const st = { top: 0, pick: -1 }, box = el('div', { style: 'position:absolute;left:0;top:0;width:460px;height:281px' });
    const draw = () => { box.innerHTML = ''; box.append(label('Item', [8, 18, 24, 80]), label('Rank', [8, 211, 24, 280]), list10([24, 14, 219, 424], rows, st, { label: 'Compare Players', redraw: draw, pick: () => { st.pick = -1; } })); };
    draw();
    const dl = K.dlog20(460, 281, button('Done', [238, 345, 257, 405], () => a.closeModal(), { def: true }), box);
    a.modal('', dl, { cls: 'mac12 dl20w mac10dlg', label: 'Compare Players' });
    return true;
  }
  const window0 = window.HOMAC12 && window.HOMAC12.window, panel0 = window.HOMAC12 && window.HOMAC12.panel;
  function windows10(name, ...x) {
    if (G() && en()) {
      if (name === 'build' && build10(x[0])) return true;
      if (name === 'compare' && compare10()) return true;
      if ((name === 'split' || name === 'group' || name === 'organize') && G()) { const f = name === 'split' ? x[0] : (K.selFleet() && K.selFleet().star === x[0] ? K.selFleet() : G().fleets.find(f => f.owner === ME() && f.star === x[0] && f.to == null && !f.sat)); if (f && organize10(f)) return true; }
    }
    return window0 ? window0(name, ...x) : false;
  }

  // ---------- the menus ----------
  // 1.0's Windows menu (p. 7) and Options menu (p. 38) as the figures have them; Ships and Galaxy hold the commands the manual names
  // (Build Ships..., Organize Fleets..., Create New Ship Type, List Ship Types..., Scrap Current Fleet; Review Battle at this Star,
  // Compare Players..., Zoom in and out), in an order the manual doesn't give. File and Edit are 1.2's.
  const it = K.it, P = () => A().Prefs, noGame = K.noGame;
  const toggleWin = (k) => () => { if (closed.has(k) || hideAll) { closed.delete(k); hideAll = false; } else closed.add(k); saveClosed(); A().renderPanel(); };
  function menu10() {
    const M = K.menuLayout12();
    M.Ships = [
      it(() => (K.mine() ? 'Build Ships…' : 'Build Ships…'), () => { if (K.mine()) A().openBuild(K.selStar().id); }, { ghost: () => noGame() || !K.mine(), key: 'B' }),
      it('Organize Fleets…', () => { const f = K.selFleet(); if (f && f.star != null && f.to == null) organize10(f); }, { ghost: () => noGame() || !(K.selFleet() && K.selFleet().star != null) }),
      '-',
      it('Create New Ship Type', () => K.createType(), { ghost: noGame, key: 'K' }),
      it('List Ship Types…', () => A().openScrapTypes(), { ghost: () => noGame() || !A().me().designs.some(d => !d.scrapped) }),
      it(() => (K.selFleet() && K.selFleet().scrap301 ? 'Don’t Scrap Current Fleet' : 'Scrap Current Fleet'), () => { const f = K.selFleet(); if (f) A().toggleScrapFleet(f); }, { ghost: () => noGame() || !K.selFleet() }),
    ];
    M.Galaxy = [
      it('Review Battle at this Star', () => { const b = K.lastBattle(); if (b) A().openBattle(b.id); }, { ghost: () => noGame() || !K.lastBattle(), key: 'R' }),
      it('Compare Players…', () => A().openCompare(), { ghost: noGame }),
      '-',
      it('Zoom In', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1.3); }, { ghost: () => noGame() || K.atZoom(-1), key: '=' }),
      it('Zoom Out', () => { const m = A().map(); A().zoomAt(m.w / 2, m.h / 2, 1 / 1.3); }, { ghost: () => noGame() || K.atZoom(0), key: '-' }),
    ];
    M.Options = [
      // (both dimmed in the figure: they are for a game of several Macs; "I'll Update Turns" ticked)
      it('Turn Always Done', () => {}, { ghost: () => true }),
      it('I’ll Update Turns', () => {}, { ghost: () => true, checked: () => true }),
      '-',
      it('Show Report Window', () => { P().m10report = P().m10report === false; A().savePrefs(); }, { ghost: noGame, checked: () => P().m10report !== false }),
      it('Spending Warnings', () => { const g = G(); g.opts.overspendWarnings = g.opts.overspendWarnings === false; A().save(); }, { ghost: noGame, checked: () => !!G() && G().opts.overspendWarnings !== false }),
      it('Always Review Battles', () => { P().review = !A().prefReview(); A().savePrefs(); }, { ghost: noGame, checked: () => A().prefReview() }),
      it('Announce Events', () => { P().showMsgs = P().showMsgs === false; A().savePrefs(); }, { ghost: noGame, checked: () => P().showMsgs !== false }),
      '-',
      // (the rules these three choose are the ruleset's, not the skin's: shown as they stand, dimmed)
      it('Graphic Battles', () => {}, { ghost: () => true, checked: () => true }),
      it('Scouts in New Fleets', () => {}, { ghost: () => true, checked: () => true }),
      it('Spend On New Stars', () => {}, { ghost: () => true, checked: () => true }),
      '-',
      it('Sound', () => { A().Sound.on = !A().Sound.on; A().savePrefs(); }, { ghost: noGame, checked: () => A().Sound.on }),
    ];
    const W = (label, k) => it(label, toggleWin(k), { ghost: noGame, checked: () => shown(k) });
    delete M.Window; // (1.0 calls it Windows, and it comes before Ships: p. 7, "Windows  Ships  Galaxy  Op...")
    M.Windows = [
      W('Budget Window', 'budget'), W('Planet Window', 'planet'),
      it('Fleet Window', () => {}, { ghost: () => true }),
      W('Tech Spending Window', 'tech'), W('Report Window', 'report'), W('Help Window', 'help'),
      '-',
      it('Hide Floating Windows', () => { hideAll = !hideAll; A().renderPanel(); }, { ghost: noGame, key: 'W' }),
    ];
    return { File: M.File, Edit: M.Edit, Windows: M.Windows, Ships: M.Ships, Galaxy: M.Galaxy, Options: M.Options };
  }

  // "Show Report Window": the Report Window opens at the beginning of each turn, even if you had closed it (p. 12)
  const afterTurn0 = window.HOMAC12 && window.HOMAC12.afterTurn;
  return {
    drawStar,
    window: windows10,
    mapBg: '#000', bgStars: false,
    panel(panel, B) { if (en()) return panel10(panel, B || {}); const low = document.getElementById('low10'); if (low) low.remove(); document.documentElement.classList.remove('mac10lay', 'mac10help'); if (panel0) panel0(panel, B); },
    afterTurn: (go) => { const a = A(); if (a && a.Prefs && a.Prefs.m10report !== false && closed.has('report')) { closed.delete('report'); saveClosed(); } return afterTurn0 ? afterTurn0(go) : go(); },
    get menuLayout() { return menu10(); },
    menuLayoutNow() { return menu10(); },
    // the title: the manual's cover (the cowboy planet), as 1.0's own start-up picture isn't known
    title(frame, IMG, Sound) {
      if (!COVER.complete || !COVER.naturalWidth) return false;
      frame.width = COVER.naturalWidth; frame.height = COVER.naturalHeight;
      frame.getContext('2d').drawImage(COVER, 0, 0);
      Sound.play(2000);
      return true;
    },
    page(doc) {
      const c = doc.querySelector('#titlescreen .credit');
      if (c) c.textContent = 'In the look of Spaceward Ho! 1.0 for the Macintosh (Delta Tao Software, 1990: written by Peter Commons), redrawn from its manual, the only part of it known to survive. The picture is the manual’s cover.';
      const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 1.0';
    },
    // a new game in this skin: English, 1.0's only language, unless the player picks another
    newGame(f) { const s = f && f.querySelector('select[name=lang]'); if (s && !s.dataset.m10 && [...s.options].some(o => o.value === 'en')) { s.value = 'en'; s.dataset.m10 = '1'; s.dispatchEvent(new Event('change', { bubbles: true })); } },
  };
};
})();
