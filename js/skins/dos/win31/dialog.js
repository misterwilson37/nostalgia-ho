// Spaceward Ho! web remake — the DOS skin's "Windows 3.1" look: Spaceward Ho! 2.0 for Windows' own dialogs, drawn from their templates
// (js/skins/dos/win31/templates.js, WINHO.EXE's 33) with Windows 3.1's controls. docs/win20-findings.md says which are built.
//
// Geometry, as Windows 3.1 does it: dialog units to pixels by the System font's base units (VGA: 8 x 16, GetDialogBaseUnits), x * 8 / 4
// and y * 16 / 8 (MulDiv). Checked against the running program (private repo, audit/win-2.0/captures/win20-orig-vga16-*.png, Windows 3.1
// VGA 640 x 480): Battle Speed's template, 134 x 87 du, has a 268 x 174 client and its scroll bar (23, 27, 74, 9) sits at (46, 54), 148 x 18;
// About's 192 x 156 makes 384 x 312. Everything below is in those Windows pixels, times --wu (CSS pixels per Windows pixel, 1 or 2, less on
// a small screen). The frame and controls are as measured on the captures: a black line and four of the active caption's navy around the
// client; with a title, three navy rows, a white row, the 18-pixel caption with the control-menu box and a black line.
//
//   HOWIN31.open(id, o) opens template <id> in the remake's modal layer. o: title (the caption's English: put in the language by HOUI like
//   all interface text), label; text {key: English}; pics {key: fn(ctx, w, h)} (an owner-painted static); checks {key: bool}; scroll
//   {key: {min, max, pos}}; on {key: fn(value, dlg)} (a button pressed, a box ticked, a bar moved; on an owner-painted control, a click); onKey(e, dlg);
//   closeOnClick; lists {key: {items, sel}} or, owner-drawn, {items, sel, rowH, draw(ctx, i, w, h, chosen)}; baseX, baseY, floor (a dialog's own units,
//   for the windows the program sizes itself); rects {key: [x, y, w, h]} and client [w, h] (in Windows pixels: a control or the client as measured);
//   moveBelow [units, pixels]: every control whose top is at or below that many units moved down that many pixels (List Ship Types').
//   A control's key is its id, or "#<n>" (its place in the template) for the ones with no id of their own (65535).
//   It returns the dialog: {el, get(key) (the control's element), value(key), close()}.
//   HOWIN31.show(name): runs the dialog registered as HOWIN31.dialogs[name] (js/skins/dos/win31/dialogs.js); false when there is none.
(function (root) {
'use strict';
const W = root.HOWIN31 = root.HOWIN31 || {};
W.base = { x: 8, y: 16 };
const mulDiv = (a, b, c) => Math.floor((a * b + c / 2) / c);
let BX = 8, BY = 16, FLOOR = false; // (the base units of the dialog being built: the System font's 8 x 16, or a dialog's own, o.baseX / o.baseY: Create New Galaxy's, the
// Build Ships window's, measured; o.floor: its pixels truncated, as measured on those the program sizes itself)
const unit = (n, b, d) => (FLOOR ? Math.floor(n * b / d) : mulDiv(n, b, d));
const dx = (n) => unit(n, BX, 4), dy = (n) => unit(n, BY, 8);
const U = (n) => `calc(${n} * var(--wu))`;
W.px = (r) => [dx(r[0]), dy(r[1]), dx(r[2]), dy(r[3])];

const WS_CAPTION = 0xC00000, WS_SYSMENU = 0x80000, WS_BORDER = 0x800000, WS_VISIBLE = 0x10000000, WS_DISABLED = 0x8000000;
// the window frame (measured): side, top without a title, top with one (black 1, navy 3, white 1, caption 18, black 1), bottom
const FR = { side: 5, top: 5, capTop: 24, bottom: 5, cap: 18 };

// Windows 3.1's colours (the default scheme; the captures show them through DOSBox's VGA DAC, e.g. navy as 0,0,170), as CSS variables that js/os/win31.css
// sets too: 16 colours (VGA) by default, 256 colours with html.w31-256 (the look's option: the active caption and the modal frame pale blue, its words
// black, as captured); a list's chosen row is the highlight colour, which stays navy (no 256-colour list was captured)
// (B: the push button's selector, with the class repeated to outrank the looks' rule for every button, js/os/dos.css and win31.css;
// the buttons also carry .quiet, which those rules' heavier variant leaves alone)
const B = 'html .w31d button.w31b.w31b.w31b.w31b';
// the drop-down button (16 x 22 inside the field's border: its black line, the face, white top and left, two of shade at the right and bottom, the arrow and its bar)
const COMBO = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22" shape-rendering="crispEdges"><path fill="#c0c0c0" d="M1 0h15v22h-15z"/>` +
  `<path fill="#fff" d="M1 0h14v1h-14zM1 1h1v19h-1z"/><path fill="#808080" d="M14 1h2v21h-2zM2 20h12v1h-12zM1 21h13v1h-13zM15 0h1v1h-1z"/><path d="M0 0h1v22h-1z` +
  `M7 6h3v3h-3zM5 9h7v1h-7zM6 10h5v1h-5zM7 11h3v1h-3zM8 12h1v1h-1zM5 14h7v1h-7z"/></svg>`;
const CSS = `
:root { --w31cap: #000080; --w31captext: #fff; --w31face: #c0c0c0; --w31shade: #808080; --w31hi: #000080; }
html.w31-256 { --w31cap: #a6caf0; --w31captext: #000; }
.win.w31dlg { background: none; border: 0; box-shadow: none; outline: 0; padding: 0; width: auto; max-width: none; min-width: 0; }
.win.w31dlg .wtitle { display: none; }
.win.w31dlg .wbody { padding: 0; overflow: visible; }
.w31d { position: relative; box-sizing: border-box; background: var(--w31cap); border: ${U(1)} solid #000;
  color: #000; font: bold ${U(13)}/${U(16)} "MS Sans Serif", "Microsoft Sans Serif", Arial, sans-serif; text-align: left; -webkit-font-smoothing: none; user-select: none; }
.w31d * { box-sizing: border-box; }
.w31d .w31cap { position: absolute; background: var(--w31cap); border: ${U(1)} solid #fff; border-bottom: 0; box-shadow: inset 0 ${U(-1)} 0 #000; color: var(--w31captext); text-align: center; white-space: nowrap; overflow: hidden; }
.w31d .w31cap .t { position: absolute; left: ${U(19)}; right: 0; top: ${U(1)}; line-height: ${U(16)}; }
.w31d .w31sys { position: absolute; left: 0; top: 0; width: ${U(19)}; height: ${U(18)}; background: var(--w31face); border-right: ${U(1)} solid #000; }
.w31d .w31sys::before { content: ""; position: absolute; left: ${U(2)}; top: ${U(7)}; width: ${U(13)}; height: ${U(3)}; background: #fff; border: ${U(1)} solid #000; box-shadow: ${U(1)} ${U(1)} 0 var(--w31shade); }
.w31d .w31client { position: absolute; background: #fff; overflow: hidden; }
.w31d .w31c { position: absolute; }
.w31d .w31s { overflow: hidden; white-space: pre-wrap; }
.w31d .w31s.nowrap { white-space: pre; }
.w31d .w31s.center { text-align: center; } .w31d .w31s.right { text-align: right; }
.w31d canvas.w31pic { position: absolute; image-rendering: pixelated; }
${B} { position: absolute; margin: 0; padding: 0; min-width: 0; min-height: 0; font: inherit; color: #000; text-shadow: none; cursor: pointer;
  background: var(--w31face); border: ${U(1)} solid #000; border-radius: 0; clip-path: polygon(${U(1)} 0, calc(100% - ${U(1)}) 0, 100% ${U(1)}, 100% calc(100% - ${U(1)}), calc(100% - ${U(1)}) 100%, ${U(1)} 100%, 0 calc(100% - ${U(1)}), 0 ${U(1)}); box-shadow: inset ${U(2)} ${U(2)} 0 #fff, inset ${U(-2)} ${U(-2)} 0 var(--w31shade); }
${B}.def { border-width: ${U(2)}; } /* (a corner pixel cut, as the plain one's: measured on the Startup window's Open Game) */
${B}:active { box-shadow: inset ${U(1)} ${U(1)} 0 var(--w31shade); }
${B}:active span { position: relative; left: ${U(1)}; top: ${U(1)}; }
${B}:focus-visible { outline: none; }
${B}:focus-visible span, html .w31d .w31chk:focus-visible span.t { outline: ${U(1)} dotted #000; }
.w31d .w31chk { cursor: pointer; }
.w31d .w31chk .box { position: absolute; left: 0; width: ${U(13)}; height: ${U(13)}; background: #fff; border: ${U(1)} solid #000; }
.w31d .w31chk.on .box { background: #fff url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11' shape-rendering='crispEdges'><path d='M0 0h1v1h-1zM1 1h1v1h-1zM2 2h1v1h-1zM3 3h1v1h-1zM4 4h1v1h-1zM5 5h1v1h-1zM6 6h1v1h-1zM7 7h1v1h-1zM8 8h1v1h-1zM9 9h1v1h-1zM10 10h1v1h-1zM10 0h1v1h-1zM9 1h1v1h-1zM8 2h1v1h-1zM7 3h1v1h-1zM6 4h1v1h-1zM4 6h1v1h-1zM3 7h1v1h-1zM2 8h1v1h-1zM1 9h1v1h-1zM0 10h1v1h-1z'/></svg>") no-repeat center / ${U(11)} ${U(11)}; }
.w31d .w31chk.radio .box { border: 0; background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' shape-rendering='crispEdges'><path d='M4 0h4v1h2v1h1v2h1v4h-1v2h-1v1h-2v1h-4v-1h-2v-1h-1v-2h-1v-4h1v-2h1v-1h2z'/><path fill='white' d='M4 1h4v1h2v2h1v4h-1v2h-2v1h-4v-1h-2v-2h-1v-4h1v-2h2z'/></svg>") no-repeat center / 100% 100%; }
.w31d .w31chk.radio.on .box { background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' shape-rendering='crispEdges'><path d='M4 0h4v1h2v1h1v2h1v4h-1v2h-1v1h-2v1h-4v-1h-2v-1h-1v-2h-1v-4h1v-2h1v-1h2z'/><path fill='white' d='M4 1h4v1h2v2h1v4h-1v2h-2v1h-4v-1h-2v-2h-1v-4h1v-2h2z'/><path d='M5 3h2v1h1v1h1v2h-1v1h-1v1h-2v-1h-1v-1h-1v-2h1v-1h1z'/></svg>") no-repeat center / 100% 100%; }
.w31d .w31chk .t { position: absolute; left: ${U(19)}; white-space: pre; }
.w31d .w31grp { border: ${U(1)} solid #000; }
.w31d .w31grp .t { position: absolute; left: ${U(8)}; top: ${U(-9)}; padding: 0 ${U(2)}; background: #fff; white-space: pre; line-height: ${U(16)}; }
.w31d .w31edit { background: #fff; font: inherit; font-weight: bold; color: #000; padding: 0 ${U(2)}; margin: 0; border: 0; border-radius: 0; outline: none; }
.w31d .w31edit.bd { border: ${U(1)} solid #000; }
.w31d select.w31combo { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 ${U(18)} 0 ${U(2)}; line-height: ${U(20)};
  background: #fff url("data:image/svg+xml;utf8,${encodeURIComponent(COMBO)}") no-repeat right top / ${U(16)} ${U(22)}; }
${B}:disabled { color: var(--w31shade); opacity: 1; cursor: default; border-color: #000; }
${B}.def:disabled { border-width: ${U(1)}; } /* (a dimmed default button loses its heavy edge: captured, Create New Ship Type's OK) */
/* (the edit fields and lists in the System font, bold, as the dialog's other words: measured on the File Open window, win20-orig-vga16-fileopen-sel.png) */
.w31d .w31list { background: #fff; border: ${U(1)} solid #000; overflow: hidden auto; font-weight: bold; }
.w31d .w31list .row { height: ${U(16)}; padding: 0 ${U(2)}; white-space: pre; overflow: hidden; cursor: pointer; }
.w31d .w31list .row.sel { background: var(--w31hi); color: #fff; }
/* (the fixed-pitch System font, SYSTEM_FIXED_FONT, 8 x 15, its strokes two pixels wide: the lists of explored stars and of skills; stand-in Courier New bold at 8 pixels a letter) */
.w31d .w31list.fixed { font: bold ${U(40 / 3)}/${U(15)} "Fixedsys", "Courier New", Courier, monospace; }
.w31d .w31list.fixed .row { padding: 0 ${U(2)}; }
:is(.w31d, .w31sbw) .w31sb { background: var(--w31face); border: ${U(1)} solid #000; cursor: pointer; touch-action: none; }
:is(.w31d, .w31sbw) .w31sb .part { position: absolute; background: var(--w31face); box-shadow: inset ${U(-2)} ${U(-2)} 0 var(--w31shade), inset ${U(1)} ${U(1)} 0 #fff; } /* (the shade over the light at the corners: measured) */
:is(.w31d, .w31sbw) .w31sb .sep { position: absolute; background: #000; }
:is(.w31d, .w31sbw) .w31sb svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
:is(.w31d, .w31sbw) .w31sb:focus-visible { outline: none; }
:is(.w31d, .w31sbw) .w31sb:focus-visible .thumb { background: repeating-conic-gradient(var(--w31face) 0 25%, #fff 0 50%) 0 0 / ${U(2)} ${U(2)}; }
`;
function style() {
  if (document.getElementById('w31-dialog-css')) return;
  const s = document.createElement('style'); s.id = 'w31-dialog-css'; s.textContent = CSS; document.head.append(s);
}

const at = (e, x, y, w, h) => { e.style.left = U(x); e.style.top = U(y); if (w != null) e.style.width = U(w); if (h != null) e.style.height = U(h); return e; };
const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
// a scroll-bar arrow (measured: in its 15 x 16 face, a head at rows 4-10 with its tip at column 4, a shaft to column 10), mirrored for the
// right one; a vertical bar's turned a quarter
const ARROW = [[4, 7, 7], [5, 6, 7], [6, 5, 10], [7, 4, 10], [8, 5, 10], [9, 6, 7], [10, 7, 7]];
function arrowSvg(dir, fw, fh) {
  const ox = Math.floor((fw - 15) / 2), oy = Math.floor((fh - 16) / 2);
  const d = ARROW.map(([r, a, b]) => {
    let x = a, y = r, w = b - a + 1, h = 1;
    if (dir === 'r') x = 14 - b;
    if (dir === 'u' || dir === 'd') { [x, y, w, h] = [r - 1, dir === 'u' ? a - 1 : 14 - b, 1, w]; }
    return `M${x + ox} ${y + oy}h${w}v${h}h${-w}z`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fw} ${fh}" shape-rendering="crispEdges"><path d="${d}"/></svg>`;
}

// the scroll bar control (SB_CTL): arrows 17 pixels with their black edges, a 17-pixel thumb at 16 + MulDiv(pos - min, length - 49, max - min)
// (measured: Battle Speed's, 148 wide, 56 steps, its thumb at 219 + 1.77 per step)
function scrollBar(r, o, fire, vertical) {
  const [x, y, w, h] = r, L = vertical ? h : w, T = vertical ? w : h, A = 17;
  const sb = at(mk('div', 'w31c w31sb'), x, y, w, h); sb.tabIndex = 0; sb.setAttribute('role', 'scrollbar');
  sb.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  let min = o.min | 0, max = o.max | 0, pos = Math.max(min, Math.min(max, o.pos | 0));
  const face = (a, b) => (vertical ? [0, a, T - 2, b] : [a, 0, b, T - 2]); // (inside the black edge)
  const part = (cls, a, b, glyph) => { const [px, py, pw, ph] = face(a, b); const p = at(mk('span', 'part ' + cls), px, py, pw, ph); if (glyph) p.innerHTML = glyph; sb.append(p); return p; };
  const sep = (a) => { const s = mk('span', 'sep'); sb.append(vertical ? at(s, 0, a, T - 2, 1) : at(s, a, 0, 1, T - 2)); return s; };
  const fw = vertical ? T - 2 : A - 2, fh = vertical ? A - 2 : T - 2;
  part('arrow', 0, A - 2, arrowSvg(vertical ? 'u' : 'l', fw, fh)); sep(A - 2);
  part('arrow', L - A, A - 2, arrowSvg(vertical ? 'd' : 'r', fw, fh)); sep(L - A - 1);
  const thumb = part('thumb', 0, A - 2), tl = sep(0), tr = sep(0);
  const place = () => {
    const off = max > min ? mulDiv(pos - min, L - 2 * (A - 1) - A, max - min) : 0, t = A - 2 + off; // (the thumb's left black edge, in the bar's face)
    const [px, py] = face(t + 1, 0); thumb.style[vertical ? 'top' : 'left'] = U(vertical ? py : px);
    tl.style[vertical ? 'top' : 'left'] = U(t); tr.style[vertical ? 'top' : 'left'] = U(t + A - 1);
    // (a bar whose range is one value keeps its thumb at the start: captured, Create New Ship Type's "0 / 0" and "1 / 1")
    sb.setAttribute('aria-valuemin', min); sb.setAttribute('aria-valuemax', max); sb.setAttribute('aria-valuenow', pos);
  };
  const set = (v) => { v = Math.max(min, Math.min(max, Math.round(v))); if (v === pos) return; pos = v; place(); fire(pos); };
  const page = Math.max(1, Math.round((max - min) / 10));
  sb.addEventListener('pointerdown', (e) => {
    e.preventDefault(); sb.focus();
    const rc = sb.getBoundingClientRect(), k = (vertical ? rc.height : rc.width) / L, at0 = ((vertical ? e.clientY - rc.top : e.clientX - rc.left) / k);
    const tPos = A - 1 + (max > min ? mulDiv(pos - min, L - 2 * (A - 1) - A, max - min) : 0);
    if (at0 < A) { set(pos - 1); return; } if (at0 >= L - A) { set(pos + 1); return; }
    if (at0 < tPos) { set(pos - page); return; } if (at0 >= tPos + A) { set(pos + page); return; }
    sb.setPointerCapture(e.pointerId); const grab = at0 - tPos;
    const mv = (ev) => { const p = (vertical ? ev.clientY - rc.top : ev.clientX - rc.left) / k - grab - (A - 1); set(min + p / (L - 2 * (A - 1) - A) * (max - min)); };
    const up = () => { sb.removeEventListener('pointermove', mv); sb.removeEventListener('pointerup', up); sb.removeEventListener('pointercancel', up); };
    sb.addEventListener('pointermove', mv); sb.addEventListener('pointerup', up); sb.addEventListener('pointercancel', up);
  });
  sb.addEventListener('keydown', (e) => {
    const k = e.key, d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, PageUp: -page, PageDown: page }[k];
    if (d) { e.preventDefault(); set(pos + d); } else if (k === 'Home') { e.preventDefault(); set(min); } else if (k === 'End') { e.preventDefault(); set(max); }
  });
  place();
  sb.w31 = { get value() { return pos; }, set: (v) => set(v), range: (a, b) => { min = a; max = b; pos = Math.max(min, Math.min(max, pos)); place(); } };
  return sb;
}

// an owner-drawn list box (LBS_OWNERDRAWFIXED: Build Ships' and List Ship Types' ship pictures): L = {items (their words, for a screen reader), sel, rowH,
// draw(ctx, i, w, h, chosen)}; rows of rowH pixels, and with WS_VSCROLL Windows' vertical scroll bar at the right when the rows do not fit (17 wide, over the
// list's right edge), scrolling a row at a time
function ownerList(r, L, fire, vs) {
  const [x, y, w, h] = r, e = at(mk('div', 'w31c w31list w31olist'), x, y, w, h); e.tabIndex = 0; e.setAttribute('role', 'listbox'); e.style.overflow = 'hidden';
  const rows = mk('div'); rows.style.position = 'absolute'; rows.style.left = rows.style.top = '0'; e.append(rows);
  let sel = L.sel == null ? -1 : L.sel, top = 0, bar = null;
  const fit = Math.max(1, Math.floor((h - 2) / L.rowH));
  const draw = () => {
    const n = L.items.length, more = vs && n > fit, rw = w - 2 - (more ? 16 : 0);
    rows.textContent = ''; top = Math.max(0, Math.min(top, n - fit));
    for (let i = top; i < Math.min(n, top + fit); i++) {
      const c = at(mk('canvas', 'w31pic'), 0, (i - top) * L.rowH, rw, L.rowH); c.width = rw; c.height = L.rowH; c.setAttribute('role', 'option');
      c.setAttribute('aria-label', L.items[i]); c.setAttribute('aria-selected', String(i === sel)); c.style.position = 'absolute'; c.style.cursor = 'pointer';
      L.draw(c.getContext('2d'), i, rw, L.rowH, i === sel);
      c.addEventListener('click', () => { sel = i; draw(); fire(i); }); rows.append(c);
    }
    if (bar) { bar.remove(); bar = null; }
    if (more) { bar = scrollBar([w - 18, -1, 17, h], { min: 0, max: n - fit, pos: top }, (p) => { top = p; draw(); }, true); bar.tabIndex = -1; e.append(bar); }
  };
  e.addEventListener('keydown', (ev) => { const d = { ArrowDown: 1, ArrowUp: -1 }[ev.key]; if (d && L.items.length) { ev.preventDefault(); sel = Math.max(0, Math.min(L.items.length - 1, sel + d)); if (sel < top) top = sel; if (sel >= top + fit) top = sel - fit + 1; draw(); fire(sel); } });
  e.w31 = { get value() { return sel; }, set: (i) => { sel = i; draw(); }, items: (a) => { L.items = a; draw(); }, redraw: () => draw() };
  draw();
  return e;
}

// a list box of words: L = {items, sel, rowH (16, the System font's rows; 15 with L.fixed, the fixed-pitch font, SYSTEM_FIXED_FONT, a dialog sets), fixed, dbl(i) (a double
// click)}; with WS_VSCROLL Windows' vertical scroll bar at the right when the rows do not fit (17 wide, over the list's right edge, from its top edge to its bottom
// edge: measured on Show Skills, win20-orig-vga16-skills*.png), scrolling a row at a time; no bar when they fit (the program's lists have no LBS_DISABLENOSCROLL)
function plainList(r, L, fire, vs) {
  const [x, y, w, h] = r, rh = L.rowH || 16, e = at(mk('div', 'w31c w31list' + (L.fixed ? ' fixed' : '')), x, y, w, h); e.tabIndex = 0; e.setAttribute('role', 'listbox'); e.style.overflow = 'hidden';
  const rows = mk('div'); rows.style.position = 'absolute'; rows.style.left = rows.style.top = '0'; e.append(rows);
  let sel = L.sel == null ? -1 : L.sel, top = 0, bar = null;
  const fit = Math.max(1, Math.floor((h - 2) / rh));
  const draw = () => {
    const n = L.items.length, more = vs && n > fit;
    rows.textContent = ''; top = Math.max(0, Math.min(top, n - fit));
    rows.style.width = U(w - 2 - (more ? 16 : 0));
    for (let i = top; i < Math.min(n, top + fit); i++) {
      const row = mk('div', 'row' + (i === sel ? ' sel' : ''), L.items[i]); row.style.height = U(rh); row.style.lineHeight = U(rh);
      row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(i === sel));
      row.addEventListener('click', () => { sel = i; draw(); fire(i); });
      if (L.dbl) row.addEventListener('dblclick', () => L.dbl(i));
      rows.append(row);
    }
    if (bar) { bar.remove(); bar = null; }
    if (more) { bar = scrollBar([w - 18, -1, 17, h], { min: 0, max: n - fit, pos: top }, (p) => { top = p; draw(); }, true); bar.tabIndex = -1; e.append(bar); }
  };
  e.addEventListener('keydown', (ev) => { const d = { ArrowDown: 1, ArrowUp: -1, PageDown: fit, PageUp: -fit }[ev.key]; if (d && L.items.length) { ev.preventDefault(); sel = Math.max(0, Math.min(L.items.length - 1, sel + d)); if (sel < top) top = sel; if (sel >= top + fit) top = sel - fit + 1; draw(); fire(sel); } });
  e.w31 = { get value() { return sel; }, set: (i) => { sel = i; draw(); }, items: (a) => { L.items = a; draw(); } };
  draw();
  return e;
}

function control(it, n, o, dlg) {
  const [id, kind, , , , , st] = it, key = id === 65535 ? '#' + n : String(id), r = (o.rects && o.rects[key]) || W.px(it.slice(2, 6));
  if (!(o.rects && o.rects[key]) && o.moveBelow && it[3] >= o.moveBelow[0]) r[1] += o.moveBelow[1]; // (the controls the program moves down under a list it lengthens)
  const txt = o.text && o.text[key] != null ? String(o.text[key]) : '';
  // (a list box with WS_BORDER: Windows draws its border outside the template's rectangle, one pixel each side, and, without LBS_NOINTEGRALHEIGHT, cuts it to whole
  // rows of its font: 16 for the System font, 15 for the fixed font a dialog sets (WM_SETFONT sizes it again). Measured: File Open's lists, 130 x 154 in the template,
  // 132 x 146 on the screen; List of All Fleets' 510 x 258 at (30, 32), 512 x 258 at (29, 31); List of All Explored Stars' and Show Skills' (fixed font) 257 high)
  if (kind === 'listbox' && !(o.rects && o.rects[key]) && !(o.lists && o.lists[key] && o.lists[key].draw) && (st & WS_BORDER)) {
    const rh = (o.lists && o.lists[key] && o.lists[key].rowH) || 16;
    r[0] -= 1; r[1] -= 1; r[2] += 2; r[3] += 2;
    if (!(st & 0x100)) r[3] = Math.floor((r[3] - 2) / rh) * rh + 2;
  }
  const fire = (v) => { const f = o.on && o.on[key]; if (f) f(v, dlg); };
  let e;
  if (o.pics && o.pics[key]) { // (an owner-painted static, or a frame the program paints a picture into: Startup's logo, control 500)
    e = at(mk('canvas', 'w31c w31pic'), r[0], r[1], r[2], r[3]); e.width = r[2]; e.height = r[3]; e.setAttribute('role', 'img');
    if (o.picLabel && o.picLabel[key]) e.setAttribute('aria-label', o.picLabel[key]);
    o.pics[key](e.getContext('2d'), r[2], r[3]);
    if (o.on && o.on[key]) { // (an owner-drawn button: Build Ships' queue cells)
      e.tabIndex = 0; e.setAttribute('role', 'button'); e.style.cursor = 'pointer';
      e.addEventListener('click', () => fire(id)); e.addEventListener('keydown', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); fire(id); } });
    }
    e.w31 = { repaint: () => o.pics[key](e.getContext('2d'), r[2], r[3]) };
  } else if (kind === 'static') {
    const a = st & 0x1f;
    e = at(mk('div', 'w31c w31s' + (a === 1 ? ' center' : a === 2 ? ' right' : '') + (a === 0xb || a === 0xc ? ' nowrap' : ''), txt), ...r);
  } else if (kind === 'push' || kind === 'def') {
    e = at(mk('button', 'w31c w31b quiet' + (kind === 'def' ? ' def' : '')), ...r); e.type = 'button'; e.append(mk('span', null, txt));
    e.addEventListener('click', () => fire(id));
  } else if (kind === 'check' || kind === 'autocheck' || kind === 'radio' || kind === 'autoradio') {
    const radio = kind.endsWith('radio');
    e = at(mk('div', 'w31c w31chk' + (radio ? ' radio' : '')), ...r); e.tabIndex = 0; e.setAttribute('role', radio ? 'radio' : 'checkbox');
    const bs = radio ? 12 : 13, top = Math.floor((r[3] - bs) / 2);
    e.append(at(mk('span', 'box'), 0, top, bs, bs), at(mk('span', 't', txt), 19, Math.floor((r[3] - 13) / 2)));
    let on = !!(o.checks && o.checks[key]);
    const show = () => { e.classList.toggle('on', on); e.setAttribute('aria-checked', String(on)); };
    // (the program's own check boxes, BS_CHECKBOX, are ticked by it on BN_CLICKED; the remake ticks them and tells the dialog)
    const flip = () => { on = radio ? true : !on; show(); fire(on); };
    e.addEventListener('click', flip); e.addEventListener('keydown', (ev) => { if (ev.key === ' ') { ev.preventDefault(); flip(); } });
    e.w31 = { get value() { return on; }, set: (v) => { on = !!v; show(); } };
    show();
  } else if (kind === 'group') {
    e = at(mk('div', 'w31c w31grp'), r[0], r[1] + 8, r[2], r[3] - 8); if (txt) e.append(mk('span', 't', txt));
  } else if (kind === 'edit') {
    e = at(mk('input', 'w31c w31edit' + (st & WS_BORDER ? ' bd' : '')), ...r); e.type = 'text'; e.value = txt;
    if (st & 0x20) e.type = 'password'; // (ES_PASSWORD)
    e.addEventListener('input', () => fire(e.value));
  } else if (kind === 'listbox' && o.lists && o.lists[key] && o.lists[key].draw) {
    e = ownerList(r, o.lists[key], fire, !!(st & 0x200000));
  } else if (kind === 'listbox') {
    e = plainList(r, (o.lists && o.lists[key]) || { items: [], sel: -1 }, fire, !!(st & 0x200000));
  } else if (kind === 'hscroll' || kind === 'vscroll') {
    e = scrollBar(r, (o.scroll && o.scroll[key]) || { min: 0, max: 0, pos: 0 }, fire, kind === 'vscroll');
  } else if (kind === 'combo' && (st & 3) === 1) {
    // (CBS_SIMPLE: an edit field with its list always under it; Player Entry's is as tall as the field, so the field alone shows: captured)
    e = at(mk('input', 'w31c w31edit bd'), ...r); e.type = 'text'; e.value = txt; e.addEventListener('input', () => fire(e.value));
  } else if (kind === 'blackframe') {
    e = at(mk('div', 'w31c'), ...r); e.style.border = U(1) + ' solid #000'; e.style.pointerEvents = 'none'; // (drawn over the controls it frames, as Windows paints it; it takes no clicks)
  } else if (kind === 'combo') {
    // (a drop-down list, CBS_DROPDOWNLIST: the field 24 high and, inside its right edge, the 17-pixel button with its arrow and the bar under it: measured on
    // Create New Ship Type's Class, win20-orig-vga16-newship.png; the list opens below, the browser's)
    e = at(mk('select', 'w31c w31edit bd w31combo'), r[0], r[1], r[2], 24);
    const L = (o.lists && o.lists[key]) || { items: [], sel: 0 };
    L.items.forEach((t, i) => { const op = mk('option', null, t); op.value = i; e.append(op); }); e.value = String(L.sel || 0);
    e.addEventListener('change', () => fire(+e.value));
    e.w31 = { get value() { return +e.value; }, set: (i) => { e.value = String(i); } };
  } else {
    e = at(mk('div', 'w31c'), ...r); // (icons, frames, rectangles and owner-drawn controls with nothing to draw: their place is kept)
  }
  e.dataset.w31 = key;
  if (!(st & WS_VISIBLE)) e.style.display = 'none';
  if (st & WS_DISABLED) { e.setAttribute('aria-disabled', 'true'); if ('disabled' in e) e.disabled = true; }
  return e;
}

// the scale: the screen's (the DOS skin's frame unit --u, js/skins/dos/ui.js setUnit: the 640 x 480 screen fitted to the window), so every window opens at
// one scale; without the frame, whole Windows pixels where the screen has room (2 on a large screen), else what fits
function scale(ow, oh) {
  const de = document.documentElement, fu = de.classList.contains('dosframe') ? parseFloat(getComputedStyle(de).getPropertyValue('--u')) : 0;
  if (fu > 0) return fu;
  const fit = Math.min((root.innerWidth - 8) / ow, (root.innerHeight - 8) / oh);
  return fit >= 2 ? 2 : fit >= 1 ? 1 : Math.max(0.5, fit);
}

W.scrollBar = (...a) => { style(); return scrollBar(...a); }; // (the Reports window's, js/skins/dos/win31/frame.js: in a .w31sbw box with --wu set, not a .w31d, which is a dialog)
W.has = (id) => !!(W.templates && W.templates[id]);
// HOWIN31.build(id, o): the dialog's element and its handle without opening it (for a window that lives in the page, as the Startup window on the title page);
// o.wu: its scale in CSS pixels per Windows pixel (else the screen's). HOWIN31.open(id, o): built and opened in the remake's modal layer.
W.open = function (id, o) {
  const dlg = W.build(id, o), a = root.HOAPI; if (!dlg) return null;
  o = o || {};
  a.modal('', dlg.el, { cls: 'w31dlg', label: o.label || o.title || 'Spaceward Ho!', sticky: true, onClose: o.onClose });
  dlg.focus();
  return dlg;
};
W.build = function (id, o) {
  o = o || {};
  const t = W.templates[id], a = root.HOAPI; if (!t || !a) return null;
  style(); BX = o.baseX || W.base.x; BY = o.baseY || W.base.y; FLOOR = !!o.floor;
  const cap = !!(t.style & WS_CAPTION) && (t.style & WS_CAPTION) === WS_CAPTION, cw = o.client ? o.client[0] : dx(t.w), ch = o.client ? o.client[1] : dy(t.h);
  const top = cap ? FR.capTop : FR.top, ow = cw + 2 * FR.side, oh = ch + top + FR.bottom;
  const d = mk('div', 'w31d'); d.setAttribute('translate', 'yes');
  d.style.setProperty('--wu', (o.wu || scale(ow, oh)) + 'px'); d.style.width = U(ow); d.style.height = U(oh);
  if (cap) {
    const c = at(mk('div', 'w31cap'), FR.side - 1, FR.top - 2, cw, FR.cap + 2);
    // (the control-menu box only with WS_SYSMENU: the captions of List of All Fleets and Create New Galaxy have none, their title centred across: captured)
    const tt = mk('span', 't', o.title || '');
    if (t.style & WS_SYSMENU) c.append(mk('span', 'w31sys'), tt); else { tt.style.left = '0'; c.append(tt); }
    d.append(c);
  }
  const client = at(mk('div', 'w31client'), FR.side - 1, top - 1, cw, ch); d.append(client);
  const dlg = { el: d, id, get: (k) => client.querySelector(`[data-w31="${k}"]`), value: (k) => { const e = dlg.get(k); return e && e.w31 ? e.w31.value : e && 'value' in e ? e.value : null; }, close: () => (o.close ? o.close() : a.closeModal()) };
  t.items.forEach((it, n) => client.append(control(it, n, o, dlg)));
  // the keyboard: Return is IDOK (the button with id 1, or the default push button), as in Windows
  d.addEventListener('keydown', (e) => {
    if (o.onKey && o.onKey(e, dlg)) { e.preventDefault(); return; }
    if (e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) { const b = client.querySelector('button.w31b.def') || dlg.get('1'); if (b) { e.preventDefault(); b.click(); } }
  });
  if (o.closeOnClick) d.addEventListener('click', () => dlg.close());
  dlg.focus = () => { const f = client.querySelector('button.w31b.def') || client.querySelector('button.w31b, .w31chk, .w31sb, input, .w31list'); if (f) f.focus(); else { d.tabIndex = -1; d.focus(); } };
  return dlg;
};
W.dialogs = W.dialogs || {};
W.show = (name, ...args) => { const f = W.dialogs[name]; return !!(f && W.templates && f(...args) !== false); };
})(typeof window !== 'undefined' ? window : globalThis);
