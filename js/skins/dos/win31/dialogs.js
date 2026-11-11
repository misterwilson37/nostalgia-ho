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
// #13 GameInfo (the remake's Window menu, Game Info…: the Player Entry window's Info... in the program): the picture 3520 (the DOS skin's d3520, the same picture),
// painted at 17, 23 in its 120 x 120 control (measured on win20-orig-vga16-gameinfo.png), the sentence (control 100, wrapped by the static), "Human Players:",
// the human players' names (list 101), OK. The sentence and names: js/skins/dos/ui.js gameInfo (T.gameInfo).
D.gameInfo = function () {
  const a = root.HOAPI, T = root.HOTHEME; if (!a.G || !T || !T.gameInfo) return false;
  const I = T.gameInfo(true), img = a.IMG['dos:d3520'];
  W.open(13, {
    title: 'GameInfo', label: 'GameInfo',
    text: { 100: I.text, '#3': 'Human Players:', 1: 'OK' },
    lists: { 101: { items: I.names, sel: -1 } },
    pics: { 999: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 17, 23); } },
    on: { 1: (_, dlg) => dlg.close() },
  });
};
// #12 FILEOPEN (File, Open Game…; the Startup window's Open Game): the program's file window (FUN_1058_017e: "File name of galaxy to open:", the filter "*.HO!"
// selected in the edit field, "Directory:" and the folder, the Files and Directories lists, OK and Cancel; captured, win20-orig-vga16-fileopen*.png). A file
// chosen in the list goes into the field; OK or a double click opens it. THE REMAKE'S: the files are the remake's saved games (the page's slots for the ruleset,
// o.list from js/skins/classic/ui.js openSavedGames, and the game in progress), each named as the program names its files, "<galaxy>.ho!"; a browser has no
// folders or drives, so the Directories list is empty and the directory is the browser.
D.fileOpen = function (o) {
  const a = root.HOAPI; o = o || {};
  const files = [], seen = {};
  const nm = (gal, year) => { let n = String(gal || 'Milky Way').replace(/\s+/g, '') + '.ho!'; if (seen[n.toLowerCase()]) n = n.replace(/\.ho!$/, '-' + year + '.ho!'); seen[n.toLowerCase()] = 1; return n.toLowerCase(); };
  if (a.G) files.push({ name: nm(a.G.opts && a.G.opts.galaxy, a.G.year), go: () => true });
  else { let raw = null; try { raw = localStorage.getItem('ho5.save'); } catch (e) {} if (raw) { let g = null; try { g = root.HO.load(raw); } catch (e) {} if (g) files.push({ name: nm(g.opts && g.opts.galaxy, g.year), go: () => { const b = document.getElementById('tcont'); if (b) b.click(); return true; } }); } }
  for (const g of o.list || []) files.push({ name: nm(g.galaxy, g.year), go: () => { o.open(g); return true; } });
  let sel = -1;
  const openIt = (dlg) => {
    const want = String(dlg.value(16) || '').trim().toLowerCase(), f = sel >= 0 ? files[sel] : files.find(x => x.name === want);
    if (!f) { if (a.beep) a.beep(); return; }
    dlg.close(); f.go();
  };
  const dlg = W.open(12, {
    label: 'File name of galaxy to open:',
    text: { 15: 'File name of galaxy to open:', '#6': 'Directories', '#7': 'Files', '#8': 'Directory:', 17: a.tl ? a.tl('this browser') : 'this browser', 16: '*.HO!', 1: 'OK', 2: 'Cancel' },
    lists: { 18: { items: files.map(f => f.name), sel: -1 }, 19: { items: [], sel: -1 } },
    on: {
      18: (i, d) => { sel = i; const e = d.get('16'); if (e && files[i]) e.value = files[i].name; },
      16: () => { sel = -1; },
      1: (_, d) => openIt(d), 2: (_, d) => d.close(),
    },
  });
  if (!dlg) return false;
  const ed = dlg.get('16'); if (ed) { ed.focus(); ed.select(); }
  const lb = dlg.get('18'); if (lb) lb.addEventListener('dblclick', () => { if (sel >= 0) openIt(dlg); });
  return true;
};
})(typeof window !== 'undefined' ? window : globalThis);
