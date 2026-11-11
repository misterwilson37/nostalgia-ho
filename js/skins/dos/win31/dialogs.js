// Spaceward Ho! web remake — the DOS skin's "Windows 3.1" look: the Windows program's dialogs, each wired to the game (HOWIN31.dialogs[name],
// run by HOWIN31.show(name) from the DOS skin's menus, js/skins/dos/ui.js winDlg). Each is drawn from its template (js/skins/dos/win31/dialog.js);
// its words are English here and go into the language through js/ui-text.js like all the remake's interface. docs/win20-findings.md lists
// the 33 templates and which are built; the chunks that build the rest add theirs here.
(function (root) {
'use strict';
const W = root.HOWIN31 = root.HOWIN31 || {};
const D = W.dialogs = W.dialogs || {};

// #1 About Spaceward Ho! (Help, About Spaceward Ho!): the picture (HOCOLOR.DLL's 1000, 383 x 236, painted one pixel in, at 1, 0, of control 999: measured), "Licensed to:"
// and the licence lines (control 100: the program shows the registered name, organisation and "Spaceward Ho! Version 2.0"; the remake, the
// player's name). No button: Return closes it (captured); so does a click, for touch.
D.about = function () {
  const a = root.HOAPI, img = a.IMG['dos:w1000'], who = a.me ? (a.me() || {}).name || '' : '';
  W.open(1, {
    title: 'About Spaceward Ho!', label: 'About Spaceward Ho!',
    text: { '#2': 'Licensed to:', 100: who + '\n\n' + (a.tl ? a.tl('Spaceward Ho! Version 2.0') : 'Spaceward Ho! Version 2.0') },
    pics: { 999: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 1, 0); } },
    picLabel: { 999: 'Spaceward Ho! 2.0: credits' },
    onKey: (e, dlg) => { if (e.key === 'Enter' || e.key === ' ') { dlg.close(); return true; } return false; },
    closeOnClick: true,
  });
};

// #8 Battle Speed (Options, Set Battle Speed…): the scroll bar from Fast to Slow (control 100), "Fully Animated Battles" (101), OK (1).
// The program's bar has 56 steps and opens 12 from Fast (measured on the running program); the remake's bar is the ruleset's battle speed
// (its range and default), the same one the DOS look's window sets.
D.battleSpeed = function () {
  const a = root.HOAPI, H = root.HO, g = a.G, P = a.Prefs, O = (g && H.rules(g).options || {}).battleSpeed || { min: 10, max: 60, def: 30 };
  let v = P.battleSpeed != null && P.battleSpeed >= O.min && P.battleSpeed <= O.max ? P.battleSpeed : O.def, full = P.fullAnim !== false;
  W.open(8, {
    label: 'Battle Speed',
    text: { '#0': 'Battle Speed:', '#2': 'Fast', '#3': 'Slow', 101: 'Fully Animated Battles', 1: 'OK' },
    scroll: { 100: { min: O.min, max: O.max, pos: v } }, checks: { 101: full },
    on: { 100: (n) => { v = n; }, 101: (on) => { full = on; }, 1: (_, dlg) => { P.battleSpeed = v; P.fullAnim = full; a.savePrefs(); dlg.close(); } },
  });
};
})(typeof window !== 'undefined' ? window : globalThis);
