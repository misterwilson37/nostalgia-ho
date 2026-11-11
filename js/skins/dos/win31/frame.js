// Spaceward Ho! web remake — the DOS skin's "Windows 3.1" look: WINHO.EXE's screen. The DOS skin's frame (js/skins/dos/ui.js, "The original's screen")
// laid out as the Windows program lays out its windows on a 640 x 480 VGA screen, in the same unit --u (CSS pixels per screen pixel), so the template dialogs
// (dialog.js), the DOS skin's own windows and this screen share one scale.
//
// Measured on the running program (private repo, audit/win-2.0/captures/win20-orig-{vga16,s3-256}-main.png) and read in its decompile (the Window menu's
// Clean Up Windows, which also places the windows when the program starts, from the screen's size: the main window 0, 0 to 640, 480 - 96 - SM_CYCAPTION -
// 2 SM_CYFRAME = 356; Tech Spending 0, 356, 228 wide, to 356 + 100 + SM_CYCAPTION = 476; Reports 640 - 250 - 2 SM_CXFRAME = 382, 356, to 640, 480):
// - the main window: a sizing frame of four (black, two of the button face, black), the 18-row caption (the control-menu box, the title, minimize and maximize),
//   a black line, the 18-row menu bar, a black line; its client 632 x 310 at 4, 42: the panes 240 wide (planet 89, fleets 90, totals 46, players and budget 85,
//   the last column a black line) and the map 375 x 293 with Windows' scroll bars, 17 across, the corner between them white;
// - Tech Spending: a one-pixel frame, the caption, a client 226 x 99 (the DOS program's Tech Spending pane, as the Windows program draws it);
// - Reports: a sizing frame, the caption, a client 250 x 97: a row for each report, its 32 x 32 picture and its words.
// The window last pressed on has the active caption (navy, or the 256-colour pale blue); the others the inactive white. (The captured program had Reports active,
// the last window it opened; the remake starts with the main window active, as after the player's first click on the map.)
(function (root) {
'use strict';
const W = root.HOWIN31 = root.HOWIN31 || {};
const u = (n) => `calc(${n} * var(--du))`;
// a picture from rectangles [x, y, w, h, colour], as an SVG data URL
const svg = (w, h, rects) => 'url("data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">` +
  rects.map(([x, y, rw, rh, c]) => `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${c}"/>`).join('') + '</svg>') + '")';
const FACE = '#c0c0c0', SHADE = '#808080', K = '#000', WH = '#fff';
// a raised box n x n (white top and left, two of shade at the bottom and right: measured on the caption's buttons and the scroll bars' boxes)
const box = (x, y, n) => [[x, y, n, n, FACE], [x, y, n - 1, 1, WH], [x, y, 1, n - 1, WH], [x + n - 2, y + 1, 2, n - 1, SHADE], [x + 1, y + n - 2, n - 1, 2, SHADE], [x, y + n - 1, 1, 1, SHADE], [x + n - 1, y, 1, 1, SHADE]];
const rows = (x, y, r) => r.map(([ry, a, b]) => [x + a, y + ry, b - a + 1, 1, K]);
// the control-menu box, 18 x 18 and its black line (the bar: black 13 x 3 at 2, 7, white inside, its shadow)
const SYS = svg(19, 18, [[0, 0, 18, 18, FACE], [2, 7, 13, 3, K], [3, 8, 11, 1, WH], [3, 10, 13, 1, SHADE], [15, 8, 1, 2, SHADE], [18, 0, 1, 18, K]]);
// minimize and maximize: a black line, two 18 x 18 boxes with a black line between (their triangles measured)
const MINMAX = svg(38, 18, [[0, 0, 1, 18, K], ...box(1, 0, 18), [19, 0, 1, 18, K], ...box(20, 0, 18),
  ...rows(1, 0, [[7, 5, 11], [8, 6, 10], [9, 7, 9], [10, 8, 8]]), ...rows(20, 0, [[6, 8, 8], [7, 7, 9], [8, 6, 10], [9, 5, 11]])]);
// the scroll bar's boxes for the panes' HTML bars (15 x 15 and the black line under or over them; the arrows as wBar's in ui.js)
const UP = svg(15, 16, [...box(0, 0, 15), ...rows(0, 0, [[4, 7, 7], [5, 6, 8], [6, 5, 9], [7, 4, 10], [8, 6, 8], [9, 6, 8], [10, 6, 8]]), [0, 15, 15, 1, K]]);
const DN = svg(15, 16, [[0, 0, 15, 1, K], ...box(0, 1, 15), ...rows(0, 1, [[4, 6, 8], [5, 6, 8], [6, 6, 8], [7, 4, 10], [8, 5, 9], [9, 6, 8], [10, 7, 7]])]);
const TH = svg(15, 16, [...box(0, 0, 15), [0, 15, 15, 1, K]]);
const F = "'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif";
const S = 'html.dosframe.os-win31';
const CSS = `
${S} #app { height: ${u(480)}; margin-top: ${u(-240)}; background: var(--w31work); }
${S} #app::before { content: ""; position: absolute; left: 0; top: 0; width: ${u(640)}; height: ${u(356)}; box-sizing: border-box; border: ${u(1)} solid #000; box-shadow: inset 0 0 0 ${u(2)} ${FACE}, inset 0 0 0 ${u(3)} #000; background: #fff; }
${S} #menubar { left: ${u(4)}; top: ${u(4)}; width: ${u(632)}; height: ${u(38)}; box-sizing: border-box; padding: ${u(19)} 0 0 0; background: #fff; border-bottom: ${u(1)} solid #000; }
${S} #menubar #title { display: block; left: 0; top: 0; height: ${u(19)}; box-sizing: border-box; padding: 0 ${u(38)} 0 ${u(19)}; border-bottom: ${u(1)} solid #000; color: var(--w31captext);
  background: ${SYS} left top / ${u(19)} ${u(18)} no-repeat, ${MINMAX} right top / ${u(38)} ${u(18)} no-repeat, var(--w31cap); font: bold ${u(13)}/${u(18)} ${F}; white-space: nowrap; }
${S}:not(.w31-act-main) #menubar #title { background-color: #fff; color: #000; }
${S} #menubar .mbtn { font: bold ${u(13)}/${u(18)} ${F}; height: ${u(18)}; padding: 0 ${u(8)}; color: #000; background: none; border: 0; border-radius: 0; }
${S} #menubar .mbtn:hover, ${S} #menubar .mbtn[aria-expanded="true"] { background: var(--w31hi, #000080); color: #fff; }
${S} #menubar > .menu:first-child { top: ${u(19)}; }
${S} .dropdown { top: ${u(18)}; max-height: calc(100vh - ${u(42)} - 50vh + ${u(240)}); overflow-y: auto; }
/* the menus' items 18 apart, their words 16 in, a separator 7 (measured on win20-orig-vga16-optionsmenu.png); a menu longer than the screen scrolls */
${S} .dropdown button { font: bold ${u(13)}/${u(18)} ${F}; padding: 0 ${u(16)}; }
${S} .dropdown hr { margin: ${u(3)} 0; }
/* a dialog does not dim the screen (Windows dims nothing): the DOS skin's windows' rule (style.css) for the templates' too */
${S} .scrim:has(.win.w31dlg) { background: transparent; }
${S} #main { left: ${u(4)}; top: ${u(42)}; width: ${u(632)}; height: ${u(310)}; }
${S} #panel { width: ${u(240)}; }
${S} #mapwrap { left: ${u(240)}; width: ${u(392)}; right: auto; background: #fff; }
${S} #map { background: #000; }
${S} #msg .clock { left: ${u(3)}; top: ${u(2)}; }
${S} .dosbar.v { left: ${u(375)}; top: 0; width: ${u(17)}; height: ${u(293)}; }
${S} .dosbar.h { left: 0; top: ${u(293)}; width: ${u(375)}; height: ${u(17)}; }
${S} #panel .doslow { height: ${u(85)}; border-bottom: 0; box-shadow: inset ${u(-1)} 0 0 #000; font: ${u(11)} ${F}; }
${S} .dosroster { top: ${u(3)}; width: ${u(75)}; }
${S} .dosroster .rrow { gap: ${u(2)}; padding-left: ${u(9)}; height: ${u(16)}; }
${S} #panel .dosbudget { left: ${u(92)}; width: ${u(131)}; }
${S} #panel .dosbudget::before { left: ${u(53)}; top: ${u(15)}; }
${S} #panel .dosbudget h3.dosstrip { margin: 0 0 0 ${u(54)}; height: ${u(15)}; width: ${u(77)}; font: bold ${u(8)}/${u(12)} Arial, sans-serif; align-items: flex-start; padding-top: ${u(3)}; box-sizing: border-box; }
${S} #panel .dosbudget .barrow { grid-template-columns: ${u(53)} ${u(77)}; }
${S} #panel .dosbudget .barrow:first-of-type { margin-top: ${u(3)}; }
${S} #panel .dosbudget .blabel { font: ${u(11)}/${u(12)} ${F}; }
${S} #panel .dosbudget .track { margin-left: ${u(1)}; }
/* the budget bars and the chosen star's name: green, in 16 colours as the VGA screen shows it (0, 170, 85), in 256 the game's own (48, 207, 0): measured */
${S} #panel .dosbudget .fill, ${S} #panel .dosbudget .fill.tbar { background: #00aa55; }
${S}.w31-256 #panel .dosbudget .fill, ${S}.w31-256 #panel .dosbudget .fill.tbar { background: #30cf00; }
${S} #panel .dosbudget .blabel[style*=underline] { color: #00aa55; }
${S}.w31-256 #panel .dosbudget .blabel[style*=underline] { color: #30cf00; }
${S} .dd-vs { width: ${u(17)}; background: ${FACE}; }
${S} .dd-vs .a { height: ${u(16)}; left: 0; right: 0; background: ${UP} center / 100% 100% no-repeat; }
${S} .dd-vs .a.d { background-image: ${DN}; }
${S} .dd-vs .a::after { display: none; }
${S} .dd-vs .th { box-shadow: none; background: ${TH} center / 100% 100% no-repeat; }
.w31pop { display: none; }
${S} .w31pop { display: block; position: absolute; box-sizing: border-box; background: #fff; border: ${u(1)} solid #000; z-index: 4; font: ${u(11)}/${u(13)} ${F}; color: #000; }
${S} .w31pop.sz { box-shadow: inset 0 0 0 ${u(2)} ${FACE}, inset 0 0 0 ${u(3)} #000; }
${S} .w31pop .w31pcap { position: absolute; height: ${u(19)}; box-sizing: border-box; border-bottom: ${u(1)} solid #000; background: ${SYS} left top / ${u(19)} ${u(18)} no-repeat, #fff;
  padding-left: ${u(19)}; text-align: center; font: bold ${u(13)}/${u(18)} ${F}; white-space: nowrap; overflow: hidden; }
${S} .w31pop.act .w31pcap { background-color: var(--w31cap); color: var(--w31captext); }
${S} .w31pop .w31pcl { position: absolute; overflow: hidden; }
${S} .w31pop canvas.dq { display: block; image-rendering: pixelated; }
${S} #w31tech { left: 0; top: ${u(356)}; width: ${u(228)}; height: ${u(120)}; }
${S} #w31tech .w31pcap { left: 0; top: 0; width: ${u(226)}; }
${S} #w31tech .w31pcl { left: 0; top: ${u(19)}; width: ${u(226)}; height: ${u(99)}; }
${S} #w31rep { left: ${u(382)}; top: ${u(356)}; width: ${u(258)}; height: ${u(124)}; }
${S} #w31rep .w31pcap { left: ${u(3)}; top: ${u(3)}; width: ${u(250)}; }
${S} #w31rep .w31pcl { left: ${u(3)}; top: ${u(22)}; width: ${u(250)}; height: ${u(97)}; overflow-y: auto; scrollbar-width: none; }
${S} .w31rep { display: flex; align-items: flex-start; gap: ${u(5)}; padding: ${u(1)} ${u(2)} ${u(1)} ${u(1)}; min-height: ${u(34)}; box-sizing: border-box; cursor: pointer; }
${S} .w31rep img, ${S} .w31rep canvas { width: ${u(32)}; height: ${u(32)}; flex: none; image-rendering: pixelated; }
${S} .w31rep .cap { padding-top: ${u(3)}; }
${S} .w31rep:focus-visible { outline: ${u(1)} dotted #000; outline-offset: ${u(-1)}; }
`;
function style() {
  if (document.getElementById('w31-frame-css')) return;
  const s = document.createElement('style'); s.id = 'w31-frame-css'; s.textContent = CSS; document.head.append(s);
}
const de = document.documentElement;
// the active window: the one last pressed on
function activate(which) {
  de.classList.toggle('w31-act-main', which === 'main');
  for (const id of ['w31tech', 'w31rep']) { const e = document.getElementById(id); if (e) e.classList.toggle('act', e.id === which); }
}
function pop(id, title, sizing) {
  let e = document.getElementById(id); if (e) return e;
  const app = document.getElementById('app'); if (!app) return null;
  e = document.createElement('div'); e.id = id; e.className = 'w31pop' + (sizing ? ' sz' : ''); e.setAttribute('role', 'region'); e.setAttribute('aria-label', title);
  const cap = document.createElement('div'); cap.className = 'w31pcap'; cap.textContent = title;
  const cl = document.createElement('div'); cl.className = 'w31pcl';
  e.append(cap, cl); app.append(e);
  e.addEventListener('pointerdown', () => activate(id));
  return e;
}
let wired = false;
W.frame = {
  // the Tech Spending window's picture (ui.js techBoxDos) and the Reports window's rows ({el, go}: ui.js reportRows)
  panes(techCanvas, reps) {
    style();
    if (!wired) {
      wired = true; activate('main');
      for (const id of ['menubar', 'main']) { const e = document.getElementById(id); if (e) e.addEventListener('pointerdown', () => activate('main')); }
    }
    const t = pop('w31tech', 'Tech Spending', false), r = pop('w31rep', 'Reports', true);
    if (t) { const cl = t.querySelector('.w31pcl'); cl.textContent = ''; cl.append(techCanvas); }
    if (r) {
      const cl = r.querySelector('.w31pcl'), keep = cl.scrollTop; cl.textContent = ''; cl.setAttribute('role', 'listbox'); cl.setAttribute('aria-label', 'Reports');
      for (const x of reps) { x.el.addEventListener('click', x.go); x.el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); x.go(); } }); cl.append(x.el); }
      const now = cl.querySelector('[data-now]'); cl.scrollTop = now ? now.offsetTop : keep;
    }
  },
};
style();
})(typeof window !== 'undefined' ? window : globalThis);
