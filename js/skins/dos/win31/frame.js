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
  background: ${SYS} left top / ${u(19)} ${u(18)} no-repeat, ${MINMAX} right top / ${u(38)} ${u(18)} no-repeat, var(--w31cap); font: ${u(13)}/${u(18)} "Win31 System", ${F}; white-space: nowrap; }
${S}:not(.w31-act-main) #menubar #title { background-color: #fff; color: #000; }
/* (a dialog open over it takes the activation: the main caption goes white, as in every capture with a dialog up, win20-jake-vga16-shot0012, 0017, 0037, 0061 ...) */
${S}:has(.scrim .win.w31dlg) #menubar #title { background-color: #fff; color: #000; } /* (not under an alert: the caption stays active in shots 5, 25, 26) */
${S} #menubar .mbtn { font: ${u(13)}/${u(18)} "Win31 System", ${F}; height: ${u(18)}; padding: 0 ${u(8)}; color: #000; background: none; border: 0; border-radius: 0; }
${S} #menubar .mbtn:hover, ${S} #menubar .mbtn[aria-expanded="true"] { background: var(--w31hi, #000080); color: #fff; }
${S} #menubar > .menu:first-child { top: ${u(19)}; }
${S} .dropdown { border: ${u(1)} solid #000; box-shadow: ${u(1)} ${u(1)} 0 ${FACE}; top: ${u(18)}; max-height: calc(100vh - ${u(42)} - 50vh + ${u(240)}); overflow-y: auto; }
/* the menus' items 18 apart, their words 16 in, a separator 7 (measured on win20-orig-vga16-optionsmenu.png); a menu longer than the screen scrolls */
${S} .dropdown button { font: ${u(13)}/${u(18)} "Win31 System", ${F}; padding: 0 ${u(12)} 0 ${u(16)}; }
/* the key text in a column, left aligned, as Windows tabs it (captured: win20-jake-vga16-shot0007.png); the words never wrap (the Ships menu's keys wrapped at 640 pixels); the Ho! button is not in the program (its commands are at the end of Help) */
${S} .dropdown.open { display: grid; grid-template-columns: auto auto; width: max-content; }
${S} .dropdown.open > button { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; white-space: nowrap; align-items: center; text-align: left; }
${S} .dropdown.open > hr { grid-column: 1 / -1; width: 100%; box-sizing: border-box; }
/* the check mark: Windows' own 8 x 10 bitmap, 4 in from the menu's edge, 2 below the item's top, its foot on the words' baseline (measured on
   win20-jake-vga16-shot0008.png, the Options menu; it had been the classic skin's text tick, a grid cell of its own that pushed the words into the keys' column) */
${S} .dropdown button.check { position: relative; }
${S} .dropdown button.check::before { content: ""; position: absolute; left: ${u(4)}; top: ${u(2)}; width: ${u(8)}; height: ${u(10)}; margin: 0;
  background: ${svg(8, 10, [[7, 0, 1, 2, K], [6, 2, 2, 1, K], [6, 3, 1, 1, K], [5, 4, 2, 1, K], [0, 5, 2, 1, K], [5, 5, 1, 1, K], [1, 6, 2, 1, K], [4, 6, 2, 1, K], [2, 7, 1, 1, K], [4, 7, 1, 1, K], [2, 8, 3, 1, K], [3, 9, 1, 1, K]])} 0 0 / 100% 100% no-repeat; }
${S} .dropdown button.check:hover::before { filter: invert(1); }
/* the system menu (the control-menu box's), as captured: Jake's win20-jake-vga16-shot0006.png (the main window's: a menu at 4, 22, 167 wide, items 18 apart, "Alt+F4"
   83 past the words; the box drawn pressed, its colours swapped as VGA XOR draws them: face and shade, black and white) and shot 0058 (About's: Move, Close) */
.w31sysm { position: fixed; z-index: 1000; display: grid; grid-template-columns: minmax(calc(97 * var(--du)), max-content) auto; width: max-content; min-width: calc(167 * var(--du));
  box-sizing: border-box; background: #fff; border: ${u(1)} solid #000; box-shadow: ${u(1)} ${u(1)} 0 ${FACE}; padding: 0; margin: 0; }
html .w31sysm button { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; align-items: center; text-align: left; white-space: nowrap; border: 0; border-radius: 0; box-shadow: none; margin: 0;
  min-width: 0; min-height: 0; background: #fff; color: #000; font: ${u(13)}/${u(18)} "Win31 System", ${F}; padding: 0 ${u(12)} 0 ${u(15)}; cursor: default; text-shadow: none; }
html .w31sysm button:hover, html .w31sysm button:focus-visible { background: var(--w31hi, #000080); color: #fff; outline: none; }
html .w31sysm button[disabled], html .w31sysm button[disabled]:hover { background: #fff; color: ${SHADE}; }
.w31sysm hr { grid-column: 1 / -1; width: 100%; border: 0; border-top: ${u(1)} solid #000; margin: ${u(3)} 0; }
.w31sysm .k { white-space: nowrap; }
.w31sysm u { text-decoration: underline; text-underline-offset: ${u(1)}; }
#w31sysbox { position: absolute; left: ${u(4)}; top: ${u(4)}; z-index: 21; width: ${u(18)}; height: ${u(18)}; padding: 0; margin: 0; border: 0; border-radius: 0; box-shadow: none; background: none; min-width: 0; min-height: 0; cursor: default; display: none; }
${S} #w31sysbox { display: block; }
#w31sysbox.on, .w31d .w31sys.on { background: ${svg(18, 18, [[0, 0, 18, 18, SHADE], [2, 7, 13, 3, WH], [3, 8, 11, 1, K], [3, 10, 13, 1, FACE], [15, 8, 1, 2, FACE]])} 0 0 / 100% 100% no-repeat; }
.w31d .w31sys.on::before { display: none; }
${S} .dropdown .mkey { margin-left: 0; white-space: nowrap; }
${S} #menubar > .menu:has(> .logo) { display: none; }
${S} #menubar > .menu:last-child { position: absolute; right: 0; top: ${u(19)}; }
${S} #menubar > .menu:last-child .dropdown { left: auto; right: 0; }
${S} .dropdown hr { margin: ${u(3)} 0; }
/* a dialog does not dim the screen (Windows dims nothing): the DOS skin's windows' rule (style.css) for the templates' too */
${S} .scrim:has(.win.w31dlg) { background: transparent; }
${S} #main { left: ${u(4)}; top: ${u(42)}; width: ${u(632)}; height: ${u(310)}; }
${S} #panel { width: ${u(240)}; }
${S} #mapwrap { left: ${u(240)}; width: ${u(392)}; right: auto; background: #fff; }
${S} #map { background: #000; }
${S} #msg .clock { left: ${u(3)}; top: ${u(2)}; }
/* the End Turn button as the Windows program draws it (captured, win20-jake-vga16-main-endturn.png, measured): 51 x 33 at 3, 2 in the map; a light grey frame, the cyan line 2 pixels under its top edge, a teal face, a dark grey base 5 high, "End Turn" and "Ctrl+T" in two lines (the DOS look's picture stays in the DOS look) */
${S} #msg .clock.pic { position: absolute; width: ${u(51)}; height: ${u(33)}; box-sizing: border-box;
  background: ${svg(51, 33, [[0, 0, 51, 33, '#c2c6ca'], [2, 4, 46, 25, '#55aaaa'], [2, 3, 46, 1, '#00ffff'], [3, 4, 44, 1, '#00ffff'], [3, 28, 44, 1, '#868a8e'], [2, 29, 46, 1, '#868a8e'], [1, 30, 48, 1, '#868a8e'], [0, 31, 50, 1, '#868a8e'], [0, 32, 51, 1, '#868a8e']])} 0 0 / 100% 100% no-repeat; }
${S} #msg .clock.pic img { visibility: hidden; }
${S} #msg .clock.pic::after { content: attr(aria-label) "\\A Ctrl+T"; text-transform: capitalize; position: absolute; left: ${u(2)}; top: ${u(5)}; width: ${u(46)}; height: ${u(23)}; display: flex; align-items: center; justify-content: center; text-align: center; white-space: pre; font: ${u(10)}/${u(10)} ${F}; color: #000; pointer-events: none; }
/* the English words in the program's own small face, its pixels as captured (shots 4 and 6 agree; the face is not Small Fonts 7, whose E is a pixel wider, and not otherwise
   identified); another language keeps the words as text */
${S}:lang(en) #msg .clock.pic[aria-label="End Turn" i]::after { content: ""; left: 0; top: 0; width: 100%; height: 100%; background: ${svg(51, 33, [[6, 7, 4, 1, K], [19, 7, 1, 1, K], [24, 7, 5, 1, K], [6, 8, 1, 1, K], [19, 8, 1, 1, K], [26, 8, 1, 1, K], [6, 9, 1, 1, K], [11, 9, 3, 1, K], [17, 9, 3, 1, K], [26, 9, 1, 1, K], [30, 9, 1, 1, K], [33, 9, 1, 1, K], [35, 9, 1, 1, K], [37, 9, 2, 1, K], [40, 9, 3, 1, K], [6, 10, 3, 1, K], [11, 10, 1, 1, K], [14, 10, 1, 1, K], [16, 10, 1, 1, K], [19, 10, 1, 1, K], [26, 10, 1, 1, K], [30, 10, 1, 1, K], [33, 10, 1, 1, K], [35, 10, 2, 1, K], [40, 10, 1, 1, K], [43, 10, 1, 1, K], [6, 11, 1, 1, K], [11, 11, 1, 1, K], [14, 11, 1, 1, K], [16, 11, 1, 1, K], [19, 11, 1, 1, K], [26, 11, 1, 1, K], [30, 11, 1, 1, K], [33, 11, 1, 1, K], [35, 11, 1, 1, K], [40, 11, 1, 1, K], [43, 11, 1, 1, K], [6, 12, 1, 1, K], [11, 12, 1, 1, K], [14, 12, 1, 1, K], [16, 12, 1, 1, K], [19, 12, 1, 1, K], [26, 12, 1, 1, K], [30, 12, 1, 1, K], [33, 12, 1, 1, K], [35, 12, 1, 1, K], [40, 12, 1, 1, K], [43, 12, 1, 1, K], [6, 13, 4, 1, K], [11, 13, 1, 1, K], [14, 13, 1, 1, K], [17, 13, 3, 1, K], [26, 13, 1, 1, K], [31, 13, 3, 1, K], [35, 13, 1, 1, K], [40, 13, 1, 1, K], [43, 13, 1, 1, K], [11, 17, 3, 1, K], [26, 17, 2, 1, K], [36, 17, 5, 1, K], [10, 18, 1, 1, K], [14, 18, 1, 1, K], [17, 18, 1, 1, K], [27, 18, 1, 1, K], [38, 18, 1, 1, K], [9, 19, 1, 1, K], [15, 19, 1, 1, K], [17, 19, 2, 1, K], [21, 19, 1, 1, K], [23, 19, 2, 1, K], [27, 19, 1, 1, K], [31, 19, 1, 1, K], [38, 19, 1, 1, K], [9, 20, 1, 1, K], [17, 20, 1, 1, K], [21, 20, 2, 1, K], [27, 20, 1, 1, K], [31, 20, 1, 1, K], [38, 20, 1, 1, K], [9, 21, 1, 1, K], [17, 21, 1, 1, K], [21, 21, 1, 1, K], [27, 21, 1, 1, K], [29, 21, 5, 1, K], [38, 21, 1, 1, K], [9, 22, 1, 1, K], [15, 22, 1, 1, K], [17, 22, 1, 1, K], [21, 22, 1, 1, K], [27, 22, 1, 1, K], [31, 22, 1, 1, K], [38, 22, 1, 1, K], [10, 23, 1, 1, K], [14, 23, 1, 1, K], [17, 23, 1, 1, K], [21, 23, 1, 1, K], [27, 23, 1, 1, K], [31, 23, 1, 1, K], [38, 23, 1, 1, K], [11, 24, 3, 1, K], [18, 24, 2, 1, K], [21, 24, 1, 1, K], [27, 24, 1, 1, K], [38, 24, 1, 1, K]])} 0 0 / 100% 100% no-repeat; }
${S} #msg .clock.pic:active::after { transform: translate(${u(1)}, ${u(1)}); }
/* the report bubble as the Windows program draws it (FUN_10c0_0f08; Jake's win20-jake-vga16-shot0039-0041, 0053, measured): the DOS program's 185 x 79 at the map's
   foot, 4 in, but in a frame of three: the button face round it (its bottom row the shade), inside it a white top row and the face at the sides, then a cyan top
   row, dark cyan sides and a shaded bottom; the picture at 14, half the height less 24; the words in MS Sans Serif 8 (lines 14 apart) from 54, 8 to 10 short
   of the right; "--more--" in the same font at 8 from the left, 5 above the foot (TEXTOUT at the foot - 5 - the font's height) */
${S} #msg .card { width: ${u(185)}; min-height: ${u(79)}; max-width: none; box-sizing: border-box; position: absolute; left: ${u(3)}; bottom: ${u(3 + 17)}; display: block; color: #000; border: 0; border-radius: 0; box-shadow: none;
  background: ${[[3, 3, -6, -6, WH], [2, 2, -4, 1, '#00ffff'], [2, 3, 1, -5, '#55aaaa'], [-3, 3, 1, -5, '#55aaaa'], [3, -3, -6, 1, SHADE], [1, 1, -2, 1, WH], [2, -2, -4, 1, SHADE], [1, -1, -2, 1, SHADE]]
    .map(([x, y, w, h, c]) => `linear-gradient(${c}, ${c}) ${x < 0 ? `right ${u(-x - 1)}` : `left ${u(x)}`} ${y < 0 ? `bottom ${u(-y - 1)}` : `top ${u(y)}`} / ${w > 0 ? u(w) : `calc(100% - ${u(-w)})`} ${h > 0 ? u(h) : `calc(100% - ${u(-h)})`} no-repeat`).join(', ')}, ${FACE};
  padding: ${u(9)} ${u(10)} ${u(22)} ${u(53)}; font: ${u(11)}/${u(14)} ${F}; } /* (the words 54, 8 in the program, whose DrawText puts the capitals 3 below the line top: 9 and 53 put this font's capitals on the same pixels) */
${S} #msg .card .icon, ${S} #msg .card .bigicon { position: absolute; left: ${u(14)}; top: calc(50% - ${u(24)}); width: ${u(32)}; height: ${u(32)}; }
${S} #msg .card:focus-visible { outline: none; } /* (no focus mark: the Windows program draws none on its bubble) */
${S} #msg .card .mtext p { font: inherit; margin: 0; }
${S} #msg .card .count { position: absolute; left: ${u(7)}; bottom: ${u(5)}; margin: 0; font: ${u(11)}/${u(14)} ${F}; color: #000; }
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
  padding-left: ${u(19)}; text-align: center; font: ${u(13)}/${u(18)} "Win31 System", ${F}; white-space: nowrap; overflow: hidden; }
${S} .w31pop.act .w31pcap { background-color: var(--w31cap); color: var(--w31captext); }
${S} .w31pop .w31pcl { position: absolute; overflow: hidden; }
${S} .w31pop canvas.dq { display: block; image-rendering: pixelated; }
${S} #w31tech { left: 0; top: ${u(356)}; width: ${u(228)}; height: ${u(120)}; }
${S} #w31tech .w31pcap { left: 0; top: 0; width: ${u(226)}; }
${S} #w31tech .w31pcl { left: 0; top: ${u(19)}; width: ${u(226)}; height: ${u(99)}; }
${S} #w31rep { left: ${u(382)}; top: ${u(356)}; width: ${u(258)}; height: ${u(124)}; }
${S} #w31rep .w31pcap { left: ${u(3)}; top: ${u(3)}; width: ${u(250)}; }
${S} #w31rep .w31pcl { left: ${u(3)}; top: ${u(22)}; width: ${u(250)}; height: ${u(97)}; overflow-y: auto; scrollbar-width: none; }
/* (a row: the picture at its top left, the words 6 right of it and 4 down to their capitals, the row 32 high, more for words of three lines: measured on
   win20-orig-vga16-main.png and -reports.png) */
${S} .w31rep { display: flex; align-items: flex-start; gap: ${u(6)}; padding: 0 ${u(2)} 0 0; min-height: ${u(32)}; box-sizing: border-box; cursor: pointer; }
${S} #w31rep .w31pcl.vs { width: ${u(234)}; }
${S} #w31rep .w31rsb { position: absolute; left: ${u(237)}; top: ${u(21)}; width: ${u(17)}; height: ${u(99)}; background: none; border: 0; --wu: var(--du); }
${S} #w31rep .w31rsb * { box-sizing: border-box; } ${S} #w31rep .w31rsb .w31c { position: absolute; } /* (what a dialog's .w31d gives its controls: dialog.js) */
${S} .w31rep img, ${S} .w31rep canvas { width: ${u(32)}; height: ${u(32)}; flex: none; image-rendering: pixelated; }
${S} .w31rep .cap { padding-top: ${u(2)}; }
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
    style(); sysBox();
    if (!wired) {
      wired = true; activate('main');
      for (const id of ['menubar', 'main']) { const e = document.getElementById(id); if (e) e.addEventListener('pointerdown', () => activate('main')); }
    }
    const t = pop('w31tech', 'Tech Spending', false), r = pop('w31rep', 'Reports', true);
    if (t) { const cl = t.querySelector('.w31pcl'); cl.textContent = ''; cl.append(techCanvas); }
    if (r) {
      const cl = r.querySelector('.w31pcl'), keep = cl.scrollTop; cl.textContent = ''; cl.setAttribute('role', 'listbox'); cl.setAttribute('aria-label', 'Reports');
      for (const x of reps) { x.el.addEventListener('click', x.go); x.el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); x.go(); } }); cl.append(x.el); }
      // the window's vertical scroll bar (WS_VSCROLL: from the caption's black line to the frame's, over the client's right 16 pixels) when the rows do not
      // fit, a row a step; the words then wrap 16 pixels sooner (captured: win20-orig-vga16-reports.png, three reports of 2140). The rows' offsets are the steps.
      const old = r.querySelector('.w31rsb'); if (old) old.remove();
      cl.classList.remove('vs');
      if (cl.scrollHeight > cl.clientHeight + 1 && W.scrollBar) {
        cl.classList.add('vs');
        const rows = [...cl.children], tops = rows.map(e => e.offsetTop), need = cl.scrollHeight - cl.clientHeight, k = tops.findIndex(t => t >= need), max = k < 0 ? rows.length - 1 : k;
        const go = (p) => { cl.scrollTop = Math.min(tops[p] || 0, cl.scrollHeight - cl.clientHeight); };
        const now = cl.querySelector('[data-now]'), at = Math.min(max, now ? rows.indexOf(now) : Math.max(0, tops.findIndex(t => t >= keep)));
        const box = document.createElement('div'); box.className = 'w31sbw w31rsb';
        const sb = W.scrollBar([0, 0, 17, 99], { min: 0, max, pos: at }, go, true); sb.tabIndex = -1; box.append(sb); r.append(box); go(at);
      } else { const now = cl.querySelector('[data-now]'); cl.scrollTop = now ? now.offsetTop : keep; }
    }
  },
};
// The system menu (the control-menu box at a window's top left): the main window's (Restore dimmed, Move, Size, Minimize, Maximize; Close Alt+F4; Switch To... Ctrl+Esc)
// and a dialog's (Move; Close Alt+F4), as Windows 3.1 shows them (captured, Jake's shots 6, 56, 58). Close is the program's Exit (the main window) or closes the dialog; Move,
// Size, Minimize, Maximize and Switch To... are Windows' own work on a window, which a page cannot do to the browser's: they close the menu and do nothing (the remake's
// screen is fixed). Opened by a click on the box, or Alt+Space (the main window) and Alt+- (a dialog), as in Windows.
let sysOpen = null;
function sysClose() {
  if (!sysOpen) return;
  const o = sysOpen; sysOpen = null; o.m.remove(); o.box.classList.remove('on');
  document.removeEventListener('pointerdown', o.away, true); document.removeEventListener('keydown', o.key, true);
}
function sysMenu(box, items) {
  if (sysOpen) { const same = sysOpen.box === box; sysClose(); if (same) return; }
  const m = document.createElement('div'); m.className = 'w31sysm'; m.setAttribute('role', 'menu');
  for (const it of items) {
    if (it === '-') { m.append(document.createElement('hr')); continue; }
    const [label, hot, key, fn, off] = it, b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'menuitem'); if (off) b.disabled = true;
    const w = document.createElement('span'), un = document.createElement('u'); un.textContent = label[hot]; w.append(label.slice(0, hot), un, label.slice(hot + 1));
    const k = document.createElement('span'); k.className = 'k'; k.textContent = key || '';
    b.append(w, k); b.dataset.hot = label[hot].toLowerCase();
    b.addEventListener('click', (e) => { e.stopPropagation(); sysClose(); if (fn) fn(); });
    m.append(b);
  }
  document.body.append(m);
  const r = box.getBoundingClientRect(); m.style.left = Math.round(r.left) + 'px'; m.style.top = Math.round(r.bottom) + 'px';
  box.classList.add('on');
  const away = (e) => { if (!m.contains(e.target) && e.target !== box) sysClose(); };
  const key = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); sysClose(); return; }
    const bs = [...m.querySelectorAll('button:not([disabled])')], i = bs.indexOf(document.activeElement), n = bs.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); bs[((i < 0 ? 0 : i) + (e.key === 'ArrowDown' ? 1 : n - 1)) % n].focus(); return; }
    if (e.key === 'Enter' && i >= 0) { e.preventDefault(); e.stopPropagation(); bs[i].click(); return; }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { const b = bs.find(x => x.dataset.hot === e.key.toLowerCase()); if (b) { e.preventDefault(); e.stopPropagation(); b.click(); } }
  };
  sysOpen = { m, box, away, key };
  setTimeout(() => { if (sysOpen && sysOpen.m === m) { document.addEventListener('pointerdown', away, true); document.addEventListener('keydown', key, true); } }, 0);
  const first = m.querySelector('button:not([disabled])'); if (first) first.focus({ preventScroll: true });
}
const noop = () => {};
function mainSysMenu(box) {
  const a = root.HOAPI;
  sysMenu(box, [['Restore', 0, '', noop, true], ['Move', 0, '', noop], ['Size', 0, '', noop], ['Minimize', 2, '', noop], ['Maximize', 2, '', noop], '-',
    ['Close', 0, 'Alt+F4', () => { if (a && a.G) a.quitToTitle(); }], '-', ['Switch To...', 1, 'Ctrl+Esc', noop]]);
}
function dlgSysMenu(box) {
  const d = box.closest('.w31d'), h = d && d.w31dlg;
  sysMenu(box, [['Move', 0, '', noop], ['Close', 0, 'Alt+F4', () => { if (h) h.close(); }]]);
}
function sysBox() {
  const t = document.getElementById('app'); if (!t || document.getElementById('w31sysbox')) return; // (in the screen over the caption's corner, 4, 4: the title's words are rewritten each year, and the menu bar's last child must stay Help)
  const b = document.createElement('button'); b.id = 'w31sysbox'; b.type = 'button'; b.setAttribute('aria-label', 'Control menu'); b.setAttribute('aria-haspopup', 'menu');
  b.addEventListener('click', (e) => { e.stopPropagation(); mainSysMenu(b); });
  t.append(b);
}
document.addEventListener('click', (e) => { const s = e.target.closest && e.target.closest('.w31d .w31sys'); if (s && de.classList.contains('os-win31')) { e.stopPropagation(); dlgSysMenu(s); } }, true);
document.addEventListener('keydown', (e) => {
  if (!de.classList.contains('os-win31') || !e.altKey || e.ctrlKey || e.metaKey) return;
  const dl = [...document.querySelectorAll('.w31d .w31sys')].pop();
  if (e.code === 'Space' && !dl) { const b = document.getElementById('w31sysbox'); if (b) { e.preventDefault(); mainSysMenu(b); } }
  else if (e.key === '-' && dl) { e.preventDefault(); dlgSysMenu(dl); }
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sysBox); else sysBox();
W.sysMenu = sysMenu;
style();
})(typeof window !== 'undefined' ? window : globalThis);
