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
// #32 STARTUP, on the title page (js/skins/dos/ui.js startupDos puts it in the title page's frame, as the DOS look's Startup window): HOCOLOR's 1002 (the DOS
// skin's d1002, the same picture) in control 999, at 0, -2 in the client, clipped by it; "Licensed to:" and the licence lines (the remake: the player's name and "Spaceward Ho!
// Version 2.0", as About); "Copyright 1992 New World Computing, Inc."; Open Game (default), New Game, Cancel; the New World Computing logo (the DOS skin's
// d9999, the same picture) centred in control 500 (measured on win20-orig-vga16-startup.png). Returns the dialog (HOWIN31.build) for the page to hold.
W.startup = function (o) {
  const a = root.HOAPI, img = a.IMG['dos:d1002'], logo = a.IMG['dos:d9999'];
  let who = ''; try { who = localStorage.getItem('ho5.name') || ''; } catch (e) {}
  return W.build(32, {
    title: 'Spaceward Ho! Startup', label: 'Spaceward Ho! Startup', wu: o.wu, close: o.close,
    text: { '#5': 'Licensed to:', 100: who + '\n\n' + (a.tl ? a.tl('Spaceward Ho! Version 2.0') : 'Spaceward Ho! Version 2.0'), '#7': 'Copyright 1992 New World Computing, Inc.', 101: 'Open Game', 102: 'New Game', 2: 'Cancel' },
    pics: {
      999: (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 0, 0); }, // (on black, as the program shows it: the picture's own background)
      500: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (logo && logo.width) x.drawImage(logo, Math.floor((w - logo.width) / 2), Math.floor((h - logo.height) / 2)); },
    },
    picLabel: { 999: 'Spaceward Ho! 2.0', 500: 'New World Computing, Inc.' },
    on: { 101: () => a.openSavedGames(), 102: () => { const b = document.getElementById('tnew'); if (b) b.click(); }, 2: () => o.close() },
    onKey: (e) => { if (e.key === 'Escape') { o.close(); return true; } return false; },
  });
};
// The New Game sequence (File, New Game…; the Startup window's New Game), as the Windows program runs it, in the remake's New game window (whose form keeps the
// choices: js/skins/classic/ui.js; the dos skin's T.newGame hands it here under the win31 look):
// #11 CREATEGALAXY: the four rows of picture buttons (owner-drawn: the DOS skin's icons 3020-3050, the same pictures, 32 x 32 at the middle 3 down, the name
// under them, the chosen one on green: 0, 170, 85 in 16 colours, 0, 130, 0 in 256), their black frames, the number of computer players (scroll bar 0-19 and its
// number), Cancel, Create. Its horizontal dialog unit is the program's own, 9.87 pixels per 4 (measured: the window is 617 wide, the frames at 42, 286, 599,
// win20-orig-vga16-newgalaxy.png; the vertical is the System font's 16 per 8).
// #25 PLAYERENTRY: "Please Identify Yourself:", Player Name (an edit field: the combo box is CBS_SIMPLE, as tall as its field), Player Password (not a password
// field in the program: the letters show), Cancel, OK (dimmed until a name is typed, captured), Info... (dimmed in a new game, captured).
// #21 NEWPLAYER: "Your Name:" and the name, "Password:" and the password, Skill Level (Novice ... Expert; it opens on Novice), Sex (Male, Female), the picture
// 3520, Cancel, Join. Join starts the game with those choices (the form's name, d_skill and female). THE REMAKE'S: the password is not kept (the remake has
// none); the New game window's other choices (the ruleset, the look ...) stay under "Remake options…", as in the DOS look.
const CG = [
  { sel: 'd_density', ids: [100, 101], icons: [3050, 3051], names: ['Dense', 'Sparse'] },
  { sel: 'd_shape', ids: [200, 201, 202, 203, 204], icons: [3020, 3021, 3022, 3023, 3024], names: ['Circle', 'Random', 'Ring', 'Spiral', 'Grid'] },
  { sel: 'd_iq', ids: [300, 301, 302], icons: [3030, 3031, 3032], names: ['Dumb', 'Average', 'Smart'] },
  { sel: 'd_size', ids: [400, 401, 402, 403, 404], icons: [3040, 3041, 3042, 3043, 3044], names: ['Small', 'Medium', 'Large', 'Extra Large', 'Humongous'] }];
W.newGame = function (f) {
  const a = root.HOAPI, el = a.el, win = f.closest('.win'); if (!win || !W.templates) return false;
  const field = (n) => f.querySelector(`[name="${n}"]`), fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true })), tl = (t) => (a.tl ? a.tl(t) : t);
  // (the form's untouched choices become the program's own: Dense, Random, Dumb, Small, Novice, MilkyWay, one computer player: as the DOS look)
  for (const [n, from, to] of [['d_density', 'dense', 'dense'], ['d_shape', 'ring', 'random'], ['d_iq', 'average', 'dumb'], ['d_size', 'medium', 'small'], ['d_skill', 'normal', 'novice'], ['computers', '4', '1']]) {
    const e = field(n); if (e && e.value === from && [...e.options].some(o => o.value === to)) e.value = to;
  }
  const gal = field('galaxy'); if (gal && gal.value === 'Milky Way') gal.value = 'MilkyWay';
  const holder = el('div', { class: 'cg-dos w31-newgame' }), rest = [...f.childNodes];
  let opened = false, step = null;
  const more = el('button', { type: 'button', class: 'dd-more', onclick: () => { opened = !opened; dress(); } }, tl('Remake options…'));
  const put = (dlg) => { holder.textContent = ''; holder.append(dlg.el, more); step = dlg; dlg.focus(); };
  const keep = (n) => n.classList && (n.classList.contains('picks') || n.classList.contains('langnote') || n.classList.contains('btns'));
  const rs = field('rules');
  const dress = () => { const on = !rs || rs.value === 'dos'; holder.style.display = on ? '' : 'none'; win.classList.toggle('dosw', on && !opened); // (the DOS look's frame for its own Create New Galaxy: style.css .win.dosw:has(.cg-dos))
    for (const n of rest) if (n.style && !keep(n)) n.style.display = on && !opened ? 'none' : ''; };
  const green = () => (document.documentElement.classList.contains('w31-256') ? '#008200' : '#00aa55');
  function create() {
    const comp = field('computers'), n0 = comp && /^\d+$/.test(comp.value) ? +comp.value : 1;
    const pics = {}, painters = {};
    CG.forEach((G) => G.ids.forEach((id, i) => {
      painters[id] = (x, w, h) => {
        const sel = field(G.sel), on = !!sel && sel.value === [...sel.options].map(o => o.value)[i], im = a.IMG['dos:i' + G.icons[i]];
        x.fillStyle = on ? green() : '#fff'; x.fillRect(0, 0, w, h);
        if (im && im.width) x.drawImage(im, Math.floor((w - 32) / 2), 3);
        x.fillStyle = '#000'; x.font = "11px 'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif"; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(tl(G.names[i]), w / 2, 47);
      };
      pics[id] = painters[id];
    }));
    const dlg = W.build(11, {
      title: 'Create New Galaxy', label: 'Create New Galaxy', baseX: 9.87, close: () => a.closeModal(),
      text: { 501: String(n0), '#19': 'Galaxy Density:', '#20': 'Galaxy Style:', '#21': 'Computer Intelligence:', '#22': 'Galaxy Size:', '#23': 'Number of Computer Players:', 2: 'Cancel', 1: 'Create' },
      pics, scroll: { 500: { min: 0, max: 19, pos: n0 } },
      on: { 500: (n, d) => { if (comp) { comp.value = String(n); fire(comp); } const t = d.get('501'); if (t) t.textContent = String(n); }, 2: () => a.closeModal(), 1: () => put(entry()) },
    });
    CG.forEach((G) => G.ids.forEach((id, i) => {
      const c = dlg.get(String(id)); if (!c) return;
      c.tabIndex = 0; c.setAttribute('role', 'radio'); c.setAttribute('aria-label', tl(G.names[i])); c.style.cursor = 'pointer';
      const pick = () => { const sel = field(G.sel); if (!sel) return; sel.value = [...sel.options].map(o => o.value)[i]; fire(sel); G.ids.forEach((j) => { const cj = dlg.get(String(j)); if (cj) painters[j](cj.getContext('2d'), cj.width, cj.height); }); };
      c.addEventListener('click', pick); c.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); pick(); } });
    }));
    return dlg;
  }
  function entry() {
    const nm = field('name');
    const dlg = W.build(25, {
      title: 'Spaceward Ho! Player Entry', label: 'Spaceward Ho! Player Entry', close: () => a.closeModal(),
      text: { '#5': 'Please Identify Yourself:', '#6': 'Player Password:', '#7': 'Player Name:', 100: '', 101: '', 2: 'Cancel', 1: 'OK', 102: 'Info...' },
      on: { 100: (v, d) => { const b = d.get('1'); if (b) b.disabled = !String(v).trim(); }, 2: () => a.closeModal(), 1: (_, d) => { const v = String(d.value(100) || '').trim(); if (!v) return; if (nm) nm.value = v; put(register(v, String(d.value(101) || ''))); } },
    });
    const ok = dlg.get('1'), info = dlg.get('102'); if (ok) ok.disabled = true; if (info) info.disabled = true;
    setTimeout(() => { const e = dlg.get('100'); if (e) e.focus(); }, 0);
    return dlg;
  }
  function register(name, pw) {
    const sk = field('d_skill'), fem = field('female'), skills = ['novice', 'beginner', 'normal', 'advanced', 'expert'], img = a.IMG['dos:d3520'];
    let skill = sk && skills.includes(sk.value) ? sk.value : 'novice', female = !!fem && fem.value === '1';
    const radios = (d) => { skills.forEach((k, i) => { const r = d.get(String(200 + i)); if (r && r.w31) r.w31.set(k === skill); }); [300, 301].forEach((id, i) => { const r = d.get(String(id)); if (r && r.w31) r.w31.set(i === (female ? 1 : 0)); }); };
    const on = { 2: () => a.closeModal(), 1: () => { if (sk) { sk.value = skill; fire(sk); } if (fem) { fem.value = female ? '1' : '0'; fire(fem); } f.requestSubmit(); } };
    skills.forEach((k, i) => { on[200 + i] = (_, d) => { skill = k; radios(d); }; });
    on[300] = (_, d) => { female = false; radios(d); }; on[301] = (_, d) => { female = true; radios(d); };
    const dlg = W.build(21, {
      title: 'Spaceward Ho! New Player Registration', label: 'Spaceward Ho! New Player Registration', close: () => a.closeModal(),
      text: { '#0': 'Your Name:', 100: name, '#2': 'Password:', 101: pw, '#4': 'Skill Level:', '#5': 'Sex:', 200: 'Novice', 201: 'Beginner', 202: 'Normal', 203: 'Advanced', 204: 'Expert', 300: 'Male', 301: 'Female', 2: 'Cancel', 1: 'Join' },
      pics: { 999: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 17, 23); } },
      on,
    });
    radios(dlg);
    return dlg;
  }
  f.prepend(holder); put(create());
  if (rs) rs.addEventListener('change', dress); dress();
  // (Return in a step is its default button, Escape its Cancel: the form's own submit is not the program's)
  holder.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.stopPropagation(); });
  return true;
};
})(typeof window !== 'undefined' ? window : globalThis);
