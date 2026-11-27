// Spaceward Ho! web remake — the DOS skin's "Windows 3.1" look: the Windows program's dialogs, each wired to the game (HOWIN31.dialogs[name],
// run by HOWIN31.show(name) from the DOS skin's menus, js/skins/dos/ui.js winDlg). Each is drawn from its template (js/skins/dos/win31/dialog.js);
// its words are English here and go into the language through js/ui-text.js like all the remake's interface. docs/win20-findings.md lists
// the 33 templates and which are built; the chunks that build the rest add theirs here.
(function (root) {
'use strict';
const W = root.HOWIN31 = root.HOWIN31 || {};
const D = W.dialogs = W.dialogs || {};

// The licence lines (control 100 of About and Startup): the licensee's name, the organisation and "Spaceward Ho! Version 2.0", as the program writes them (captured,
// win20-orig-vga16-startup*.png); the remake's licensee: the DOS skin's T.licensee (js/skins/dos/ui.js licensee: the signed-in player, else the name last typed).
W.licence = function () {
  const a = root.HOAPI, T = root.HOTHEME, L = (T && T.licensee && T.licensee()) || { name: '', org: '' };
  return { name: L.name, org: L.org, lines: L.name + '\n' + L.org + '\n' + (a.tl ? a.tl('Spaceward Ho! Version 2.0') : 'Spaceward Ho! Version 2.0') };
};
// #1 About Spaceward Ho! (Help, About Spaceward Ho!): the picture (HOCOLOR.DLL's 1000, 383 x 236, painted one pixel in, at 1, 0, of control 999: measured), "Licensed to:"
// and the licence lines (control 100: the program shows the registered name, organisation and "Spaceward Ho! Version 2.0"; the remake, the
// player's name). No button: Return closes it (captured); so does a click, for touch.
D.about = function () {
  const a = root.HOAPI, img = a.IMG['dos:w1000'];
  W.open(1, {
    title: 'About Spaceward Ho!', label: 'About Spaceward Ho!',
    text: { '#2': 'Licensed to:', 100: W.licence().lines },
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
    text: { 15: 'File name of galaxy to open:', '#6': '&Directories', '#7': '&Files', '#8': 'Directory:', 17: a.tl ? a.tl('this browser') : 'this browser', 16: '*.HO!', 1: 'OK', 2: 'Cancel' },
    lists: { 18: { items: files.map(f => f.name), sel: -1, dbl: () => { if (sel >= 0) openIt(dlg); } }, 19: { items: [], sel: -1 } },
    on: {
      18: (i, d) => { sel = i; const e = d.get('16'); if (e && files[i]) e.value = files[i].name; },
      16: () => { sel = -1; },
      1: (_, d) => openIt(d), 2: (_, d) => d.close(),
    },
  });
  if (!dlg) return false;
  const ed = dlg.get('16'); if (ed) { ed.focus(); ed.select(); }
  return true;
};
// #32 STARTUP, on the title page (js/skins/dos/ui.js startupDos puts it in the title page's frame, as the DOS look's Startup window): HOCOLOR's 1002 (the DOS
// skin's d1002, the same picture) in control 999, at 0, -2 in the client, clipped by it; "Licensed to:" and the licence lines (the remake: the player's name and "Spaceward Ho!
// Version 2.0", as About); "Copyright 1992 New World Computing, Inc."; Open Game (default), New Game, Cancel; the New World Computing logo (the DOS skin's
// d9999, the same picture) centred in control 500 (measured on win20-orig-vga16-startup.png). Returns the dialog (HOWIN31.build) for the page to hold.
W.startup = function (o) {
  const a = root.HOAPI, img = a.IMG['dos:d1002'], logo = a.IMG['dos:d9999'];
  return W.build(32, {
    title: 'Spaceward Ho! Startup', label: 'Spaceward Ho! Startup', wu: o.wu, close: o.close,
    text: { '#5': 'Licensed to:', 100: W.licence().lines, '#7': 'Copyright 1992 New World Computing, Inc.', 101: 'Open Game', 102: 'New Game', 2: 'Cancel' },
    pics: {
      999: (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 0, 0); }, // (on black, as the program shows it: the picture's own background)
      500: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (logo && logo.width) x.drawImage(logo, Math.floor((w - logo.width) / 2), Math.floor((h - logo.height) / 2)); },
    },
    picLabel: { 999: 'Spaceward Ho! 2.0', 500: 'New World Computing, Inc.' },
    on: { 101: () => a.openSavedGames(), 102: () => { const b = document.getElementById('tnew'); if (b) b.click(); }, 2: () => o.close() },
    onKey: (e) => { if (e.key === 'Escape') { o.close(); return true; } return false; },
  });
};
// #14 LICENSEE ("Spaceward Ho! License", LICENSEEDLGPROC): the program opens it at the start, before Startup, when no licensee is kept (THE_HO!.PRF) or the
// warranty question was answered No (FUN_1050_..., captured with the PRF moved away: win20-orig-vga16-licensee*.png); centred on the screen (FUN_1108_0a3b).
// "Please Personalize Your Copy of Spaceward Ho! 2.0:", Name (100) and Organization (101), 80 letters each (EM_LIMITTEXT), "Have you sent in your Warranty
// Registration/Survey?" Yes, No, No, but I will (200-202: No when there is no name, else the kept answer), the copyright, Cancel and OK (dimmed until a name is
// typed, captured). OK keeps them; Cancel ends the program. THE REMAKE'S: on the title page with the Windows look, when the licensee (W.licence) has no name or
// the answer kept in this browser is No; OK keeps the name as the name last typed ("ho5.name": the New game window's too), the organisation and the answer, in this
// browser only, and goes on to Startup (o.next); Cancel leaves the title page without it, as Startup's Cancel. HOWIN31.licenceFirst(next): true when it opened.
W.licenceFirst = function (next) {
  const a = root.HOAPI, ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const L = W.licence(), kept = ls('ho5.w31.warranty');
  if (!W.templates || (L.name && kept !== '1')) return false;
  let ans = !L.name ? 1 : kept != null && /^[012]$/.test(kept) ? +kept : 0;
  const radios = (d) => [200, 201, 202].forEach((id, i) => { const r = d.get(String(id)); if (r && r.w31) r.w31.set(i === ans); });
  const on = {
    100: (v, d) => { const b = d.get('1'); if (b) b.disabled = !String(v).trim(); },
    2: (_, d) => d.close(),
    1: (_, d) => { const n = String(d.value(100) || '').trim(); if (!n) return; put('ho5.name', n); put('ho5.w31.org', String(d.value(101) || '').trim()); put('ho5.w31.warranty', String(ans)); d.close(); if (next) next(); },
  };
  [200, 201, 202].forEach((id, i) => { on[id] = (_, d) => { ans = i; radios(d); }; });
  const dlg = W.open(14, {
    title: 'Spaceward Ho! License', label: 'Spaceward Ho! License',
    text: { 100: L.name, 101: L.org, 200: 'Yes', 201: 'No', 202: 'No, but I will', 2: 'Cancel', 1: 'OK', '#7': 'Please Personalize Your Copy of Spaceward Ho! 2.0:', '#8': 'Name:',
      '#9': 'Organization:', '#10': 'Have you sent in your Warranty Registration/Survey?', '#11': '© 1992 New World Computing\nAll Rights Reserved' },
    on,
  });
  if (!dlg) return false;
  radios(dlg);
  for (const k of ['100', '101']) { const e = dlg.get(k); if (e) e.maxLength = 80; }
  const ok = dlg.get('1'); if (ok) ok.disabled = !L.name;
  const nm = dlg.get('100'); if (nm) { nm.focus(); nm.select(); }
  return true;
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
        x.fillStyle = '#000'; x.font = "11px 'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif"; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
        // (centred on a whole pixel: at a half pixel the bitmap font's strokes came out grey, captured all black: win20-jake-vga16-shot0002.png)
        const t = tl(G.names[i]); x.fillText(t, Math.floor((w - x.measureText(t).width) / 2), 47);
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

// ---- Ships (chunk 3) ----
// The ship pictures (FUN_10f0_0066, the owner-drawn cells' painter): three parts side by side, each from HOCOLOR.DLL: the engine (12100 + Range + Speed - 8, 0 to
// 23), the hull (12198 + Shields, to 25; 12250 for a colony ship's pod), the nose (12350 + Weapons - 1, to 29); a satellite one picture in the middle part (12401 + Weapons - 1);
// the two hidden special ships 12251-12253 (Weapons and Shields 12, Range 9-11) and 12254-12256 (15, 15, 12-14). The big parts 81 x 76 (a picture 243 x 76), the small
// ones 40 x 40 (500 on: 120 x 40). HOCOLOR's 228 ship parts are byte for byte the DOS program's (the DOS skin's d12100-d12926, checked pixel by pixel), so those are drawn.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
W.shipPic = function (d, small) {
  const a = root.HOAPI, k = small ? 500 : 0, n = small ? 40 : 81, h = small ? 40 : 76;
  const im = (id) => a.IMG['dos:d' + (id + k)];
  let parts;
  if (d.type === 'satellite') parts = [null, im(12401 + clamp(d.W - 1, 0, 25)), null];
  else if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R > 8 && d.R < 12) parts = [im(12251), im(12252), im(12253)];
  else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R > 11 && d.R < 15) parts = [im(12254), im(12255), im(12256)];
  else parts = [im(12100 + clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? im(12250) : im(12199 + clamp(d.S - 1, 0, 25)), im(12350 + clamp(d.W - 1, 0, 29))];
  const c = document.createElement('canvas'); c.width = 3 * n; c.height = h;
  const x = c.getContext('2d');
  if (parts.some(p => p && p.width) && ['scout', 'fighter', 'colony', 'satellite', 'decoy'].includes(d.type)) { parts.forEach((p, i) => { if (p && p.width) x.drawImage(p, i * n, 0); }); return c; }
  const o = a.shipPic(d); if (o && o.width) { x.imageSmoothingEnabled = false; const s = Math.min(3 * n / o.width, h / o.height); x.drawImage(o, 0, 0, o.width * s, o.height * s); } // (a type the program has no picture of: the skin's)
  return c;
};
// A caption under a ship in the program's small font (MS Sans Serif 8: the stand-in Arial 11 narrowed, as the panes), centred; a caption wider than its cell in the
// smaller font the program falls back on (measured: "one Minnow (2/2) Colony Ship" in a queue cell)
const SANS = "'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif";
function caption(x, t, w, y, colour) {
  x.save(); x.fillStyle = colour; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
  x.font = '11px ' + SANS; let k = 1, tw = x.measureText(t).width * k;
  if (tw > w - 2) { x.font = '9px ' + SANS; k = 1; tw = x.measureText(t).width * k; }
  x.translate(Math.round((w - tw) / 2), y); x.scale(k, 1); x.fillText(t, 0, 0); x.restore();
}
// The part of the queue's ship not yet built (FUN_10e8_18a8): from the right, (100 - done) % of the picture's width, PatBlt'ed with ROP 0xFA0089 (pattern OR
// screen). On the 16-colour screen that leaves every pixel white or dark grey, by its colour (measured on the Build Ships captures, win20-orig-vga16-build-*.png:
// 134 of the 255 colours of the ship parts; the others take the nearest measured colour's). The 256-colour screen's pattern (bitmap 0x22ce) was not captured: the same.
const GREY_W = '0033ff 0066ff 00ffff 3366cc 33cc66 33ccff 33ffcc 33ffff 6666cc 669999 6699cc 6699ff 66cc66 66cc99 66cccc 66ccff 66ff99 888888 996699 9966cc 999999 9999cc 9999ff 99cc99 99cccc 99ccff 99ff99 99ffcc aaaaaa bbbbbb cc3333 cc3366 cc6633 cc6666 cc6699 cc66cc cccc99 cccccc ccff99 ccffcc dddddd eeeeee ff0033 ff00ff ff3333 ff3366 ff3399 ff33cc ff6600 ff6633 ff6666 ff6699 ff9966 ff9999 ffffff';
const GREY_G = '000000 000011 000033 000044 000055 000066 0000ff 001100 003333 003366 003399 006633 006666 006699 0066cc 007700 008800 009900 009966 009999 0099cc 0099ff 00aa00 00bb00 00cc00 00cccc 00ccff 00dd00 00ee00 00ff00 110000 111111 220000 222222 330000 330033 330066 333333 333366 336633 336666 336699 339966 339999 33cc99 33cccc 440000 444444 550000 555555 660000 660033 660066 663300 666666 666699 669966 770000 777777 880000 990000 990033 993300 993333 993399 996600 996666 aa0000 bb0000 cc0000 cc0033 cc3300 cc3399 cc6600 dd0000 ee0000 ff0000 ff0099 ff00cc';
let GREY = null;
function greyOf(r, g, b) {
  if (!GREY) { GREY = new Map(); const add = (l, w) => l.split(' ').forEach(h => GREY.set(parseInt(h, 16), w)); add(GREY_W, true); add(GREY_G, false); }
  const v = (r << 16) | (g << 8) | b; if (GREY.has(v)) return GREY.get(v);
  let best = Infinity, w = false;
  for (const [c, cw] of GREY) { const d = (((c >> 16) & 255) - r) ** 2 + (((c >> 8) & 255) - g) ** 2 + ((c & 255) - b) ** 2; if (d < best) { best = d; w = cw; } }
  GREY.set(v, w); return w;
}
function undone(x, left, top, w, h) {
  if (w <= 0 || h <= 0) return;
  const im = x.getImageData(left, top, w, h), p = im.data;
  for (let i = 0; i < p.length; i += 4) { if (p[i + 3] === 0) continue; const wh = greyOf(p[i], p[i + 1], p[i + 2]); p[i] = p[i + 1] = p[i + 2] = wh ? 255 : 128; p[i + 3] = 255; }
  x.putImageData(im, left, top);
}

// #9 BLDSHIP, Build Ships (Ships, Build Ships at <star>…; the remake's Build): BUILDSHIPSDLGPROC. Captured (win20-orig-vga16-build-{empty,dev,prod,two,remove,colony}.png):
// - the window is sized by the program, not by the System font's units: its client 524 x 332 for 258 x 160 units, every control where 8.132 and 16.6 units put it
//   (truncated); the list of types integral-height, 34 down and 218 high (four rows of 54);
// - "Shipbuilding queue at:" and the star's name; the big picture (control 300's black frame, 248 x 78) of the first ship in the queue, the part not yet built grey
//   (FUN_10e8_18a8; at 0 % all of it); under it the cost ("$4,000 (D)" while no ship of the type has been built, its development cost; "$1,960 (P)" after) and
//   "n% Done"; with nothing queued, the frame empty and both lines blank;
// - "In The Queue:" and three owner-drawn buttons (301-303, 121 x 55 framed): each kind of ship queued, its small picture (120 x 40) and "one Patton (2/2) Fighter" /
//   "2 Patton (2/2) Fighters" under it; a click on one takes ONE ship of it away (LISTBUTTONSUBPROC passes the click on; a double click does nothing more);
// - "Available Types" (list 200, owner-drawn rows of 54: the small picture, the caption "Patton (2/2) Fighter"; the chosen row black, its words white): a click
//   queues one ship of the type (a kind already queued gets the ship) and leaves the row chosen; a click on a queue cell unchooses it. Cancel, OK.
// THE REMAKE'S: the queue is the game's (rules: three kinds); OK sets it, Cancel leaves it as it was, as the DOS look's window.
const BLD = { baseX: 8.132, baseY: 16.6, floor: true, rects: { 200: [367, 34, 142, 218] } };
D.build = function (sid) {
  const a = root.HOAPI, H = root.HO, g = a.G, T = root.HOTHEME, SW = T && T.shipWords; if (!g || !SW) return false;
  const p = a.me(), s = g.stars[sid], rs = H.rules(g);
  if (!s || !H.feature(g, 'buildQueue') || s.owner !== a.ME) return false;
  const slots = rs.queueSlots || 3;
  const q = (s.queue || []).map(x => ({ did: x.did, n: x.n }));
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => H.canBuildType(g, p, t));
  const ds = p.designs.filter(d => !d.scrapped && types.includes(d.type)).reverse();
  const dsg = (id) => p.designs.find(d => d.id === id);
  let dlg = null;
  const pics = {};
  // the big picture: the first kind queued
  pics[300] = (x, w, h) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, w - 1, h - 1);
    const it = q[0], d = it && dsg(it.did); if (!d) return;
    const same = (s.queue || [])[0] && s.queue[0].did === d.id, pr = same && rs.yardProgress ? rs.yardProgress(g, p, s) : null, pct = pr ? pr.pct : 0;
    x.drawImage(W.shipPic(d, false), 1, 1);
    const gw = Math.floor((w - 2) * (100 - pct) / 100); undone(x, w - 1 - gw, 1, gw, h - 2);
  };
  // the queue's cells
  [301, 302, 303].forEach((id, i) => {
    pics[id] = (x, w, h) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, w - 1, h - 2);
      const it = q[i], d = it && dsg(it.did); if (!d) return;
      x.drawImage(W.shipPic(d, true), 1, 1); caption(x, SW.ships(d, it.n), w, 52, '#000');
    };
  });
  const lines = () => {
    const it = q[0], d = it && dsg(it.did), t1 = dlg && dlg.get('101'), t2 = dlg && dlg.get('102'); if (!t1 || !t2) return;
    if (!d) { t1.textContent = ''; t2.textContent = ''; return; }
    const c = H.shipCostNow(g, p, d), same = (s.queue || [])[0] && s.queue[0].did === d.id, pr = same && rs.yardProgress ? rs.yardProgress(g, p, s) : null;
    const nf = (n) => (rs.fmtNum || H.niceNum)(Math.round(n));
    t1.textContent = '$' + nf(c.money) + (d.built === 0 && !d.free ? ' (D)' : ' (P)'); t2.textContent = (pr ? pr.pct : 0) + '% Done';
  };
  const repaint = () => { for (const id of [300, 301, 302, 303]) { const e = dlg.get(String(id)); if (e && e.w31) e.w31.repaint(); } lines(); };
  const add = (i) => { const d = ds[i]; if (!d) return; const e = q.find(x => x.did === d.id); if (e) e.n++; else if (q.length < slots) q.push({ did: d.id, n: 1 }); else { if (a.beep) a.beep(); return; } repaint(); };
  const take = (i) => { if (!q[i]) return; if (--q[i].n <= 0) q.splice(i, 1); const L = dlg.get('200'); if (L && L.w31) L.w31.set(-1); repaint(); };
  const commit = () => {
    const cur = () => (s.queue || []).slice();
    for (let i = cur().length - 1; i >= 0; i--) { const w = q.find(x => x.did === cur()[i].did); let have = cur()[i].n; const want = w ? w.n : 0; while (have-- > want) H.unqueueShip(g, a.ME, sid, i); }
    for (const w of q) { const have = ((s.queue || []).find(x => x.did === w.did) || { n: 0 }).n; if (w.n > have) H.queueShips(g, a.ME, sid, w.did, w.n - have); }
    a.save(); a.renderPanel(); a.draw();
  };
  const rowDraw = (x, i, w, h, on) => {
    const d = ds[i]; x.fillStyle = on ? '#000' : '#fff'; x.fillRect(0, 0, w, h); if (!d) return;
    x.drawImage(W.shipPic(d, true), 0, 0); caption(x, SW.caption(d), w, 51, on ? '#fff' : '#000');
  };
  dlg = W.open(9, Object.assign({
    label: 'Shipbuilding queue at:',
    text: { '#0': 'Shipbuilding queue at:', 100: s.name, '#3': 'Available Types', 101: '', 102: '', '#7': 'In The Queue:', 2: 'Cancel', 1: 'OK' },
    lists: { 200: { items: ds.map(d => SW.caption(d)), sel: -1, rowH: 54, draw: rowDraw } },
    pics, picLabel: { 300: 'Shipbuilding queue', 301: 'In The Queue: 1', 302: 'In The Queue: 2', 303: 'In The Queue: 3' },
    on: { 200: (i) => add(i), 301: () => take(0), 302: () => take(1), 303: () => take(2), 2: (_, d) => d.close(), 1: (_, d) => { commit(); d.close(); } },
  }, BLD));
  if (!dlg) return false;
  for (const k of ['100', '101', '102']) { const e = dlg.get(k); if (e) e.setAttribute('translate', 'no'); } // (the star's name and the numbers)
  lines();
  return true;
};

// #22 NEWSHIP, Create New Ship Type (Ships, Create New Ship Type… [Ctrl+K]): CREATETYPEDLGPROC. Captured (win20-orig-vga16-newship{,-class,-fighter,-sat}.png;
// at the System font's units, 510 x 286): "Name of New Ship Type:" and its field (100), the five levels (Range, Speed, Weapons, Shields, Mini: "6 / 6", the level
// and the most the technology allows, statics 350-354) each with its scroll bar (300-304; a bar from a level to itself has no thumb: "0 / 0"), Name It For Me (600),
// the picture (FUN_10e8_0f32: the big picture painted in control 200, the white frame), "Class:" and its drop-down list (400: Scout, Fighter, Colony Ship,
// Satellite; it opens on Scout), the costs (Dev. Cost, Prod. Cost, Metal Cost: 500-502), Cancel, OK (dimmed until the type has a name). A Satellite's Range is
// "0 / 0" (its bar stays). THE REMAKE'S: the levels, limits and costs are the ruleset's (as the DOS look's window); OK makes the type (the DOS look's rule:
// the program's alert when every assembly line is taken).
D.newShip = function () {
  const a = root.HOAPI, H = root.HO, g = a.G; if (!g) return false;
  const p = a.me(), rs = H.rules(g), ok1 = (t) => H.canBuildType(g, p, t);
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(ok1);
  if (!types.length) return false;
  const NAMES = { scout: 'Scout', fighter: 'Fighter', colony: 'Colony Ship', satellite: 'Satellite', tanker: 'Tanker', dread: 'Dreadnought', bio: 'Biological', decoy: 'Decoy' };
  const KEYS = ['R', 'V', 'W', 'S', 'M'], st = { type: types[0], name: '' };
  const nf = (n) => (rs.fmtNum || H.niceNum)(Math.round(n));
  let dlg = null;
  const limits = () => { const L = H.designLimits(g, p, st.type); for (const k of KEYS) { const lo = H.designMin(g, k, st.type); if (st[k] == null || st._t !== st.type) st[k] = L[k]; st[k] = Math.max(lo, Math.min(Math.max(lo, L[k] || lo), st[k])); } st._t = st.type; return L; };
  const spec = () => ({ type: st.type, R: st.type === 'satellite' ? 0 : st.R, V: st.V, W: st.W, S: st.S, M: st.M });
  const show = () => {
    const L = limits();
    KEYS.forEach((k, i) => {
      const min = H.designMin(g, k, st.type), sat = k === 'R' && st.type === 'satellite', max = sat ? 0 : Math.max(min, L[k] || min), v = sat ? 0 : st[k];
      const t = dlg.get(String(350 + i)); if (t) t.textContent = `${v} / ${max}`;
      const b = dlg.get(String(300 + i)); if (b && b.w31) { b.w31.range(sat ? 0 : min, max); b.w31.set(v); }
    });
    const c = H.designCost(g, spec());
    const t = (id, v) => { const e = dlg.get(String(id)); if (e) e.textContent = v; };
    t(500, '$' + nf(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0))); t(501, '$' + nf(c.money)); t(502, nf(c.metal));
    const pic = dlg.get('200'); if (pic && pic.w31) pic.w31.repaint();
    const ok = dlg.get('1'); if (ok) ok.disabled = !st.name.trim();
  };
  const scroll = {}, on = {};
  KEYS.forEach((k, i) => { scroll[300 + i] = { min: 0, max: 0, pos: 0 }; on[300 + i] = (n) => { if (k === 'R' && st.type === 'satellite') return; st[k] = n; show(); }; });
  on[100] = (v) => { st.name = String(v).slice(0, 15); const ok = dlg.get('1'); if (ok) ok.disabled = !st.name.trim(); };
  on[400] = (i) => { st.type = types[i] || types[0]; show(); };
  on[600] = (_, d) => { st.name = H.designName(g, p, st.type); const e = d.get('100'); if (e) e.value = st.name; show(); };
  on[2] = (_, d) => d.close();
  on[1] = (_, d) => {
    if (!st.name.trim()) return;
    const lim = rs.maxDesigns; if (lim && H.liveDesigns(p) >= lim) { a.alertOver([H.say(g, H.DATA.alerts[15] || 'Your assembly lines are full.')], 'en'); return; }
    H.findOrCreateDesign(g, p, Object.assign(spec(), { name: st.name.trim() })); a.save(); d.close(); a.renderPanel();
  };
  dlg = W.open(22, {
    label: 'Name of New Ship Type:',
    text: { '#0': 'Name of New Ship Type:', 100: '', '#3': 'Range:', '#6': 'Speed:', '#9': 'Weapons:', '#12': 'Shields:', '#15': 'Mini:', 600: 'Name It For Me', '#19': 'Class:',
      '#20': 'Dev. Cost:', '#22': 'Prod. Cost:', '#24': 'Metal Cost:', 2: 'Cancel', 1: 'OK' },
    lists: { 400: { items: types.map(t => NAMES[t]), sel: 0 } },
    scroll, on,
    pics: { 200: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(W.shipPic(spec(), false), 0, 0); } },
    picLabel: { 200: 'Create New Ship Type' },
  });
  if (!dlg) return false;
  for (const k of ['350', '351', '352', '353', '354', '500', '501', '502']) { const e = dlg.get(k); if (e) e.setAttribute('translate', 'no'); }
  const ed = dlg.get('100'); if (ed) { ed.maxLength = 15; setTimeout(() => ed.focus(), 0); }
  show();
  return true;
};

// #31 SHIPTYPE, List Ship Types (Ships, List Ship Types…): LISTSHIPTYPESDLGPROC. Captured (win20-orig-vga16-shiptype.png): the System font's units, but the program lengthens
// the list to four whole rows and moves what is under the labels down 11 pixels (its client 448 x 337 for 224 x 163 units), the list of types (600: owner-drawn rows of 54 as Build Ships', the chosen row black; a scroll bar when more than four), the chosen
// type's big picture (in the white frame 700), Name, Class, Development Cost, Production Cost, Metal Cost (100-104), Range, Speed, Weapons (200-202), Shields,
// Mini (203, 204), # Built, # Existing (300, 301), "Scrap This Type" (400), Rename (500: NAMETYPE), OK. It opens on the newest type.
// THE REMAKE'S: the numbers are the ruleset's (as the DOS look's window); Scrap This Type marks or scraps the type as the ruleset does.
// (measured: the list made integral-height, 19, 13, 140 x 218, and every control under the labels, from 99 units down, 11 pixels lower; the client 11 taller)
const SHT = { client: [448, 337], rects: { 600: [19, 13, 140, 218] }, moveBelow: [99, 11] };
D.types = function (selId) {
  const a = root.HOAPI, H = root.HO, g = a.G, T = root.HOTHEME, SW = T && T.shipWords; if (!g || !SW) return false;
  const p = a.me(), rs = H.rules(g), ds = p.designs.filter(d => !d.scrapped).reverse(); if (!ds.length) return false;
  let i0 = Math.max(0, ds.findIndex(d => d.id === selId)), cur = ds[i0], dlg = null;
  const nf = (n) => (rs.fmtNum || H.niceNum)(Math.round(n));
  const shipCount = (did) => g.fleets.filter(f => f.owner === a.ME).reduce((n, f) => n + (f.ships[did] || 0), 0);
  const show = () => {
    const c = H.designCost(g, cur), t = (id, v) => { const e = dlg.get(String(id)); if (e) { e.textContent = String(v); e.setAttribute('translate', 'no'); } };
    t(100, cur.name); t(101, SW.className(cur)); t(102, '$' + nf(c.protoTotal != null ? c.protoTotal : c.money + (c.proto || 0))); t(103, '$' + nf(c.money)); t(104, nf(c.metal));
    t(200, cur.R); t(201, cur.V); t(202, cur.W); t(203, cur.S); t(204, cur.M); t(300, nf(cur.built || 0)); t(301, nf(shipCount(cur.id)));
    const ck = dlg.get('400'); if (ck && ck.w31) ck.w31.set(!!cur.scrap301);
    const pic = dlg.get('700'); if (pic && pic.w31) pic.w31.repaint();
  };
  const rowDraw = (x, i, w, h, on) => { const d = ds[i]; x.fillStyle = on ? '#000' : '#fff'; x.fillRect(0, 0, w, h); if (!d) return; x.drawImage(W.shipPic(d, true), 0, 0); caption(x, SW.caption(d), w, 51, on ? '#fff' : '#000'); };
  const scrap = () => {
    if (rs.flagScrapDesign) { rs.flagScrapDesign(g, p, cur, 'command'); a.save(); show(); return; }
    const n = shipCount(cur.id); a.confirmBox(`Scrap this ship type and all ${n} existing ship${n === 1 ? '' : 's'} of it?`, () => { H.scrapDesign(g, a.ME, cur.id); a.closeModal(); a.renderPanel(); a.draw(); });
  };
  dlg = W.open(31, Object.assign({
    label: 'List Ship Types',
    text: { '#2': 'Name:', '#3': 'Class:', '#4': 'Development Cost:', '#5': 'Production Cost:', '#6': 'Metal Cost:', '#12': 'Range:', '#13': 'Speed:', '#14': 'Weapons:',
      '#18': 'Shields:', '#19': 'Mini:', '#22': '# Built:', '#23': '# Existing:', 400: 'Scrap This Type', 500: 'Rename', 1: 'OK' },
    lists: { 600: { items: ds.map(d => SW.caption(d)), sel: i0, rowH: 54, draw: rowDraw } },
    pics: { 700: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(W.shipPic(cur, false), 0, 0); } },
    picLabel: { 700: 'List Ship Types' },
    on: { 600: (i) => { cur = ds[i] || cur; show(); }, 400: () => scrap(), 500: (_, d) => { const keep = cur; d.close(); W.show('renameType', keep, () => D.types(keep.id)); }, 1: (_, d) => d.close() },
  }, SHT));
  if (!dlg) return false;
  show();
  return true;
};
// #20 NAMETYPE, the List Ship Types window's Rename: RENAMETYPEDLGPROC. Captured (win20-orig-vga16-nametype.png; the System font's units): "Type your new ship name or
// click on "Name It" for a suggestion:", the field (100: empty, at most 15 letters, EM_LIMITTEXT 15), Name It (101), Cancel, OK (dimmed while the field is empty).
// Back to List Ship Types after (back()).
D.renameType = function (d, back) {
  const a = root.HOAPI, H = root.HO, g = a.G; if (!g || !d) return false;
  let v = '';
  const dlg = W.open(20, {
    label: 'Rename',
    text: { '#0': 'Type your new ship name or click on "Name It" for a suggestion:', 100: '', 101: 'Name It', 2: 'Cancel', 1: 'OK' },
    on: {
      100: (x, dl) => { v = String(x); const ok = dl.get('1'); if (ok) ok.disabled = !v.trim(); },
      101: (_, dl) => { v = H.designName(g, a.me(), d.type); const e = dl.get('100'); if (e) e.value = v; const ok = dl.get('1'); if (ok) ok.disabled = false; },
      2: () => { a.closeModal(); if (back) back(); },
      1: () => { const n = v.trim(); if (!n) return; d.name = n.slice(0, 15); a.save(); a.renderPanel(); a.closeModal(); if (back) back(); },
    },
  });
  if (!dlg) return false;
  const ok = dlg.get('1'); if (ok) ok.disabled = true;
  const ed = dlg.get('100'); if (ed) { ed.maxLength = 15; setTimeout(() => ed.focus(), 0); }
  return true;
};

// #24 ORGFLEETS, Organize Fleets (Ships, Organize Ships… [Ctrl+O]): ORGFLEETSDLGPROC. Captured (win20-orig-vga16-orgfleets{,-group}.png): the window sized by the
// program (its client 452 x 316 for 223 x 151 units: 8.11 and 16.74 units, truncated), "To Organize Fleets:", "· Click and drag fleets into desired number of piles",
// "· Shift-Click selects an entire pile" (static #1), the black frame (100) holding the piles of the star's fleets of the chosen fleet's type: one a row, 45 apart,
// the number right-aligned at 35 (the bold System font) and the small picture at 16, 1 in; Group All, Divide All, Cancel, OK. THE REMAKE'S (not captured): a
// pile is moved by dragging or, for touch, a tap on a pile and a tap on another (or on the empty part of the frame for a new pile), one ship, the whole pile with
// Shift; more than four piles go on in columns 136 apart; OK applies it as the DOS look's window.
const ORG = { baseX: 8.11, baseY: 16.74, floor: true };
D.group = function (sid) {
  const a = root.HOAPI, H = root.HO, g = a.G; if (!g) return false;
  const f0 = (a.curFleet && a.curFleet()) || g.fleets.find(f => f.owner === a.ME && f.star === sid && f.to == null && !f.sat);
  if (!f0 || f0.star !== sid || Object.keys(f0.ships).length !== 1) return false;
  const did = +Object.keys(f0.ships)[0], d = H.getDesign(g, a.ME, did);
  const fleets = g.fleets.filter(f => f.owner === a.ME && f.star === sid && f.to == null && Object.keys(f.ships).length === 1 && +Object.keys(f.ships)[0] === did);
  const piles = fleets.map(f => ({ f, n: f.ships[did] })); let sel = null, dlg = null;
  const shown = () => piles.map((p, i) => i).filter(i => piles[i].n || piles[i].f);
  const at = (x, y) => { const k = Math.floor((y - 1) / 45) + 4 * Math.floor((x - 1) / 136), l = shown(); return k < l.length ? l[k] : -1; };
  const paint = () => { const c = dlg && dlg.get('100'); if (c && c.w31) c.w31.repaint(); };
  const draw = (x, w, h) => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, w - 1, h - 1);
    const pic = W.shipPic(d, true);
    shown().forEach((i, k) => {
      const px = 1 + 136 * Math.floor(k / 4), py = 1 + 45 * (k % 4), p = piles[i];
      if (p.n) { x.drawImage(pic, px + 16, py); x.fillStyle = '#000'; x.font = 'bold 13px ' + SANS; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(String(p.n), px + 14, py + 37); }
      if (sel && sel.pile === i) { x.save(); x.setLineDash([1, 1]); x.strokeRect(px + 0.5, py + 0.5, 135, 43); x.restore(); }
    });
  };
  const moveTo = (i) => { if (!sel) return; const from = piles[sel.pile], n = sel.all ? from.n : 1; if (i === -1) { piles.push({ f: null, n: 0 }); i = piles.length - 1; } if (i !== sel.pile) { from.n -= n; piles[i].n += n; } sel = null; paint(); };
  const apply = (dl) => {
    const temps = [];
    for (const p of piles) if (p.f && p.n < p.f.ships[did]) { if (p.n === 0) temps.push(p.f); else { const t = H.splitFleet(g, p.f, { [did]: p.f.ships[did] - p.n }); if (t) temps.push(t); } }
    const take = (need) => { let got = null; while (need > 0 && temps.length) { let t = temps[0]; if (t.ships[did] > need) t = H.splitFleet(g, t, { [did]: need }); else temps.shift(); need -= t.ships[did]; if (got) H.mergeFleets(g, got, t); else got = t; } return got; };
    for (const p of piles) if (p.f && p.n > (p.f.ships[did] || 0)) { const t = take(p.n - p.f.ships[did]); if (t) H.mergeFleets(g, p.f, t); }
    for (const p of piles) if (!p.f && p.n > 0) take(p.n);
    dl.close(); a.save(); a.renderPanel(); a.draw();
  };
  const total = () => piles.reduce((x, p) => x + p.n, 0);
  dlg = W.open(24, Object.assign({
    label: 'To Organize Fleets:',
    text: { '#1': 'To Organize Fleets:\n· Click and drag fleets into desired number of piles\n· Shift-Click selects an entire pile', 101: 'Group All', 102: 'Divide All', 2: 'Cancel', 1: 'OK' },
    pics: { 100: draw }, picLabel: { 100: 'Piles' },
    on: {
      101: () => { const t = total(); piles.forEach((p, i) => { p.n = i ? 0 : t; }); sel = null; paint(); },
      102: () => { const t = total(); piles.forEach(p => { p.n = 0; }); for (let k = 0; k < t; k++) { if (k < piles.length) piles[k].n = 1; else piles.push({ f: null, n: 1 }); } sel = null; paint(); },
      2: (_, dl) => dl.close(), 1: (_, dl) => apply(dl),
    },
  }, ORG));
  if (!dlg) return false;
  const c = dlg.get('100');
  if (c) {
    c.style.cursor = 'pointer'; c.style.touchAction = 'none'; c.tabIndex = 0;
    const pt = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
    let down = null;
    c.addEventListener('pointerdown', (e) => { const i = at(...pt(e)); down = { i, moved: false }; if (sel && sel.pile !== i) return; if (i >= 0 && piles[i].n) { sel = { pile: i, all: e.shiftKey }; paint(); } });
    c.addEventListener('pointermove', (e) => { if (down && e.buttons) down.moved = true; });
    c.addEventListener('pointerup', (e) => { const i = at(...pt(e)); const dn = down; down = null; if (!sel) return; if (i === sel.pile && !(dn && dn.i !== i)) return; moveTo(i); });
  }
  return true;
};

// ---- Lists (chunk 4) ----
// #15 LISTFLEETS, List of All Fleets (Ships, List All Fleets… [Ctrl+L]): LISTFLEETSDLGPROC. Captured (win20-orig-vga16-fleets{,-sel,-marooned,-hyper}.png; the System font's
// units, the caption "Spaceward Ho!"): "List of All Fleets:", the list (100: every fleet of the player but the satellites, in the fleets' own order, a marooned one where
// it stands: "%s stationed at %s.", "%s to arrive at %s in %d.", "%s leaving %s for %s to arrive in %d.", "%s marooned at %s."), nothing chosen at the opening, Go To
// Fleet (101) dimmed until a row is chosen; a double click is Go To Fleet. Go To Fleet: the program tests "in hyperspace" on the fleet at the chosen row's place in
// ALL the player's fleets, satellites counted (the list skips them: the original's bug, kept; the patch of 1993 keeps it too), and shows the alert, else it selects
// the row's fleet, centres the map on it and closes. THE REMAKE'S: the order is the remake's fleets'; a fleet chosen in flight past that test is selected without
// a star to centre on.
// #6 AUTOPLAY (Options, Auto Play…; AUTOPLAYDLGPROC, opened by FUN_10a0_02c7; captured, win20-orig-vga16-autoplay.png): "Auto Play:", the three radio buttons
// (100 "Have computer play for me." for the player's mode 3, 101 "Just mark me done every turn." for 2, 102 "I'll play my own turns, thank you." else), the sentence,
// the seconds (static 201) and their scroll bar (200: SetScrollRange 0 to 15, at the preference / 60: 2 in the capture), OK (the only way out: no Cancel).
// OK keeps the seconds and, when the mode changed, sets it. The remake's: the DOS look's window's wiring (js/skins/dos/ui.js autoPlayDos: the remake keeps no
// mode between windows, so it opens on "I'll play my own turns"; OK with another starts the auto play, every n seconds).
D.autoPlay = function () {
  const a = root.HOAPI, P = a.Prefs; let secs = P.autoSecs != null ? Math.max(0, Math.min(15, P.autoSecs)) : 2, mode = 2;
  const radios = (d) => [100, 101, 102].forEach((id, i) => { const r = d.get(String(id)); if (r && r.w31) r.w31.set(i === mode); });
  const on = {
    200: (n, d) => { secs = n; const t = d.get('201'); if (t) t.textContent = String(n); },
    1: (_, d) => { P.autoSecs = secs; a.savePrefs(); d.close(); if (mode < 2) a.runAutoPlay({ turns: Infinity, computer: mode === 0, won: false, lost: false, news: false, every: secs }); },
  };
  [100, 101, 102].forEach((id, i) => { on[id] = (_, d) => { mode = i; radios(d); }; });
  const dlg = W.open(6, {
    label: 'Auto Play',
    text: { '#0': 'Auto Play:', 100: 'Have computer play for me.', 101: 'Just mark me done every turn.', 102: "I'll play my own turns, thank you.",
      '#4': 'Under auto play, event messages should disappear after:', 201: String(secs), '#6': 'Seconds', 1: 'OK' },
    scroll: { 200: { min: 0, max: 15, pos: secs } }, on,
  });
  if (!dlg) return false;
  radios(dlg); const r = dlg.get('102'); if (r) r.focus();
  return true;
};
// #26 POLLSPEED (Options, Set Polling Time…, enabled in the Windows program: captured, win20-orig-vga16-optionsmenu.png; POLLSPEEDDLGPROC, opened by FUN_10a0_03e8;
// captured, win20-orig-vga16-pollspeed.png): "Polling Time:", Fast, the scroll bar (100: SetScrollRange 1 to 30, at the preference / 60: 8), Slow, the seconds (101)
// and "Seconds", the sentence, OK (the only way out). OK keeps the time. The remake keeps it (Prefs.poll, the Preferences window's), as the original had it: nothing
// in the remake polls (the rules' note, js/rules-dos.js options.poll).
D.pollSpeed = function () {
  const a = root.HOAPI, P = a.Prefs; let v = P.poll != null ? Math.max(1, Math.min(30, P.poll)) : 8;
  W.open(26, {
    label: 'Polling Time',
    text: { '#0': 'Polling Time:', '#2': 'Fast', '#3': 'Slow', 101: String(v), '#5': 'Seconds', '#6': 'A fast polling time will let you know about turn updates more quickly but may slow down the computer.', 1: 'OK' },
    scroll: { 100: { min: 1, max: 30, pos: v } },
    on: { 100: (n, d) => { v = n; const t = d.get('101'); if (t) t.textContent = String(n); }, 1: (_, d) => { P.poll = v; a.savePrefs(); d.close(); } },
  });
};
// #4 ALERT_LLPIC, the program's alert box (the ALERT resources 3010-5090: their kind 1, FUN_1108_01fc; ALERTPICDLGPROC, read in the disassembly; captured, the
// hyperspace alert win20-orig-vga16-fleets-hyper.png, the fuel alert win20-orig-vga16-alert-fuel.png, the two-button wait alert win20-orig-vga16-alert-wait.png): no caption; the words (static 100 at 14, 12, wrapped)
// measured by DrawText (DT_CALCRECT | DT_WORDBREAK) and the window grown by what they need, centred on the screen (measured: 421 wide for the template's 410, 146
// high for two lines, 179 for four, 195 for five: 128 + 16 a line - 18 + 4, a pixel more with a blank line); the buttons at that height without the pixel - 68; the mascot (HOCOLOR's 3520, the DOS skin's d3520, the same picture) at
// 16, height - 87; the buttons (one to three, 203 202 201 from the left, the last of the resource's words the rightmost, 201, the default push button) each
// (letters + 4) x 8 wide (the longest word's; "&OK" 56), 28 high, 16 apart, at height - 68, the rightmost at (88 + width) / 2 + the row's width / 2 - one button and
// its gap (the middle between the picture's right edge and the window's, measured: the hyperspace and fuel alerts' OK at 218). Every alert of the DOS look's
// (js/skins/dos/ui.js alertDos: the remake's words and buttons) comes here with the Windows look. Not built: kind 2 (ALERT_CPIC: W.youWon below), kind 3
// (ALERT_NOPIC) and #2 ALERTBOX (not captured).
W.alert = function (paras, btns, o) {
  const a = root.HOAPI; if (!W.templates || !W.templates[4]) return null;
  const text = paras.join('\n\n'), cx = document.createElement('canvas').getContext('2d');
  cx.font = "bold 13px 'MS Sans Serif', 'Microsoft Sans Serif', Arial, sans-serif";
  let n = 0;
  text.split('\n').forEach((par) => { let line = ''; par.split(' ').forEach((w) => { const t = line ? line + ' ' + w : w; if (line && cx.measureText(t).width > 387) { n++; line = w; } else line = t; }); n++; });
  const CW = 421, H0 = 128 + Math.max(0, 16 * n - 18) + 4, CH = H0 + (/\n\n/.test(text) ? 1 : 0); // (a pixel taller with a blank line: measured, the fuel and wait alerts)
  // (the default button the rightmost, 201, as the program's resources have it; the others to its left in their order)
  const order = btns.filter(b => !b.def).concat(btns.filter(b => b.def)).slice(-3), k = order.length;
  const bw = Math.max(...order.map(b => (String(b.label).length + 1 + 4) * 8)), step = bw + 16, xr = Math.floor((88 + CW) / 2) + Math.floor(k * step / 2) - step;
  const rects = { 100: [14, 12, 387, 16 * n], 999: [16, CH - 87, 74, 74] }, text0 = { 100: text }, on = {};
  let back = null; const done = () => { if (back) back.remove(); };
  // (the resource's "&OK", "&Cancel", "&Yes", "&No": the first letter is the access letter, captured under the wait alert's Wait and Continue)
  [201, 202, 203].forEach((id, i) => { rects[id] = [xr - i * step, H0 - 68, bw, 28]; const b = order[k - 1 - i]; text0[id] = b ? '&' + String(b.label).replace(/&/g, '&&') : ''; if (b) on[id] = () => { done(); if (b.fn) b.fn(); }; });
  const img = a.IMG['dos:d3520'];
  const dlg = W.build(4, { label: paras[0], client: [CW, CH], rects, text: text0, on, close: done,
    pics: { 999: (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 0, 0); } } });
  if (!dlg) return null;
  [201, 202, 203].forEach((id, i) => { const e = dlg.get(String(id)); if (e && i >= k) e.style.display = 'none'; });
  dlg.el.setAttribute('role', 'alertdialog'); dlg.el.setAttribute('aria-modal', 'true');
  const shown = order.map((b) => dlg.get(String(201 + (k - 1 - order.indexOf(b)))));
  const first = shown[0]; if (first) first.setAttribute('data-esc-close', '1');
  const bs = btns.map(b => shown[order.indexOf(b)]).filter(Boolean);
  if (btns.length >= 2 && a.markYesNo) a.markYesNo(dlg.el, bs[0], bs[1], !!(o && o.yesNo));
  back = a.el('div', { class: 'scrim dd-alertscrim w31alert', onkeydown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); } } }, dlg.el);
  // (with two or three buttons the leftmost, the resource's first word, is drawn as the default button and takes Return, while the rightmost has the focus: captured,
  // the wait alert's "Wait" with the heavy edge and "Continue" with the dotted frame; the first word is the safe one, Wait, Cancel)
  if (k > 1) { const r = dlg.get('201'), l = dlg.get(String(200 + k)); if (r) r.classList.remove('def'); if (l) l.classList.add('def'); }
  document.body.append(back); const f = dlg.get('201'); if (f) f.focus(); else dlg.focus();
  return back;
};
// #3 ALERT_CPIC, the won and lost boxes (alerts 5040 and 5050; captured in Jake's own game, win20-jake-vga16-won-galaxy.png and -lost-galaxy.png, measured): no caption, the
// frame black, four navy, black; its client 258 x 277 (the template's 129 dialog units is 258 wide; the height is the program's, the template's 134 does not give it);
// the words (static 100, bold, wrapped) at 12, 12, 234 wide; the picture (149 x 151, the won or lost picture) at 54, 76; the one button, 112 x 28, at 72, 242, the
// default, its first letter the access letter (the O of "OK" and of "Oh Well..." is underlined in both captures). The words are the program's:
// "Congratulations! You have conquered the galaxy!" with OK, "Unfortunately, you have been eliminated from the game..." with "Oh Well...". Used by the turn's news where
// the DOS look shows its won and lost boxes (T.youWonLayout, js/skins/dos/ui.js).
W.youWon = function (kind, Y, done) {
  const a = root.HOAPI; if (!W.templates || !W.templates[3]) return false;
  const won = kind === 'won', text = String(Y.text).replace(/\n/g, ' '), label = String(Y.ok || 'OK');
  const img = a.IMG[won ? 'dos:d5040' : 'dos:d5050'];
  // (the frame's corner at 168, 93 in the 640 x 480 screen, as captured: not centred)
  const dlg = W.open(3, { label: text, client: [258, 277], rects: { 100: [13, 11, 234, 34], 999: [54, 76, 149, 151], 201: [72, 242, 112, 28] }, at: [168, 93], onClose: done,
    text: { 100: text, 201: '&' + label.replace(/&/g, '&&') }, on: { 201: (_, d) => d.close() },
    pics: { 999: (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 0, 0); } } });
  if (!dlg) return false;
  dlg.el.setAttribute('role', 'alertdialog');
  return true;
};
// #2 ALERTBOX with the information icon: the message the program's Print Map gives when there is no printer ("Unable to create printer device context", captured, win20-jake-vga16-shot0067.png,
// measured): the caption "Spaceward Ho!" with its control-menu box, a client 346 x 88; the icon (the system's information icon, drawn here: a navy ball with a white "i") 32 x 32 at 19, 21; the words at 69, 23; OK
// 39 x 28 at 150, 51; the frame's corner at 141, 180. The remake prints nothing, so Print Map says this (js/skins/dos/ui.js printMapAlert).
W.printAlert = function () {
  const a = root.HOAPI; if (!W.templates || !W.templates[2]) return false;
  const words = a.tl ? a.tl('Unable to create printer device context') : 'Unable to create printer device context';
  const icon = (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#000'; x.beginPath(); x.arc(16, 16, 15.5, 0, 7); x.fill(); x.fillStyle = '#000080'; x.beginPath(); x.arc(16, 16, 14, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.fillRect(14, 12, 5, 12); x.fillRect(14, 6, 5, 4); };
  const dlg = W.open(2, { title: 'Spaceward Ho!', label: words, client: [346, 88], at: [141, 180], rects: { 101: [19, 21, 32, 32], 100: [69, 23, 265, 20], 201: [150, 51, 39, 28], 202: [0, 0, 0, 0], 203: [0, 0, 0, 0], 204: [0, 0, 0, 0] },
    text: { 100: words, 201: '&OK' }, pics: { 101: icon }, on: { 201: (_, d) => d.close() } });
  if (!dlg) return false;
  ['202', '203', '204'].forEach((k) => { const e = dlg.get(k); if (e) e.style.display = 'none'; });
  const ok = dlg.get('201'); if (ok) { ok.classList.add('def'); ok.focus(); } // (the program's one button is the default one)
  dlg.el.setAttribute('role', 'alertdialog');
  return true;
};
// #33 STATUS ("Spaceward Ho! Status", FUN_1100_05b4: CreateDialog, modeless, while the turn is worked out (FUN_1040_0038, End Turn, unless the main window is an
// icon) and while a new galaxy is written; captured with a 20-player Humongous galaxy, frames grabbed while it showed: win20-orig-vga16-status (empty bar),
// -status-bar ("Pass 1 for Player 11...", 50 of the bar's 254 pixels), -status-write ("Writing Game File...", 228)): the step (static 100: the program's strings 48-53,
// "Processing Turn...", "Pass 1 for Player %d...", "Battle Stage...", "Pass 2 for Player %d...", "Writing Game File...", "Removing Old Battles...") and the bar
// (static 101, painted: a black frame, filled from the left in the 16 colours' green, 0, 170, 85). The remake works the turn out at once: the steps are shown one
// after another (40 ms each, as the Mac 1.2 skin's status window, js/skins/mac12/ui.js turnProgress), the bar at step / steps (the program's own fraction was not
// worked out: its two frames are a fifth and nine tenths), then the turn goes on (T.turnProgress, js/skins/dos/ui.js).
W.status = function (g, go) {
  const a = root.HOAPI, tl = (t) => (a.tl ? a.tl(t) : t), n = g.players.length, steps = ['Processing Turn...'];
  if (!W.templates) return go();
  for (let i = 1; i <= n; i++) steps.push(tl('Pass 1 for Player %d...').replace('%d', i));
  steps.push('Battle Stage...');
  for (let i = 1; i <= n; i++) steps.push(tl('Pass 2 for Player %d...').replace('%d', i));
  steps.push('Writing Game File...', 'Removing Old Battles...');
  let i = 0;
  const bar = (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = document.documentElement.classList.contains('w31-256') ? '#008200' : '#00aa55'; x.fillRect(1, 1, Math.round((w - 2) * i / steps.length), h - 2); x.strokeStyle = '#000'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, w - 1, h - 1); };
  // (the template's 113, 18 dialog units give 222, 54; Windows 3.1 byte-aligns a dialog's window at 16 colours (CS_BYTEALIGNWINDOW), its left edge a multiple of 8: 224, as captured twice, win20-orig-vga16-status-bar.png and win20-jake-vga16-status-pass.png)
  const dlg = W.open(33, { title: 'Spaceward Ho! Status', label: 'Spaceward Ho! Status', text: { 100: steps[0] }, pics: { 101: bar }, at: [W.snap(222), 54] });
  if (!dlg) return go();
  dlg.el.setAttribute('aria-busy', 'true');
  const t = dlg.get('100'), b = dlg.get('101');
  const step = () => {
    if (!dlg.el.isConnected) return go();
    if (++i >= steps.length) { a.closeModal(); go(); return; }
    if (t) t.textContent = tl(steps[i]); if (b && b.w31) b.w31.repaint();
    setTimeout(step, 40);
  };
  setTimeout(step, 40);
};
// #23 NOTIFY1 (NOTIFYDLGPROC; FUN_1008_0788: CreateDialog, modeless, with "Closing Game..." while the game file is closed, FUN_1050_0d02: File, Close and opening
// another game; captured, frames grabbed while it showed: win20-orig-vga16-closing.png): WS_DLGFRAME without a caption: a black line, four of navy and a black line
// round the 224 x 44 client (measured), the words centred (static 100). The remake: the DOS look's Closing Game window's place (js/skins/dos/ui.js closingGameDos,
// T.closingGame: shown a second, then the game closes).
W.notify = function (text, go) {
  const a = root.HOAPI; if (!W.templates) return false;
  const dlg = W.open(23, { label: text, text: { 100: text }, at: [32, 93] }); // (its client at the template's 18, 28 dialog units = 36, 56 pixels from the main window's client, whose corner is 1, 42: the frame's corner 32, 93, measured in win20-orig-vga16-closing.png) if (!dlg) return false;
  const c = dlg.el.querySelector('.w31client'); if (c) c.style.boxShadow = 'inset 0 0 0 var(--wu) #000';
  dlg.el.setAttribute('aria-busy', 'true'); dlg.el.setAttribute('aria-live', 'polite');
  setTimeout(() => { if (dlg.el.isConnected) a.closeModal(); go(); }, 1000);
  return true;
};
D.fleets = function () {
  const a = root.HOAPI, g = a.G, T = root.HOTHEME; if (!g || !T || !T.fleetList) return false;
  const F = T.fleetList(), all = g.fleets.filter(f => f.owner === a.ME), shown = all.filter(f => !f.sat);
  let sel = -1;
  const go = (dlg) => {
    if (sel < 0) return;
    if (all[sel] && all[sel].to != null) { a.alertOver([F.hyper], 'en'); return; }
    const f = shown[sel]; if (!f) return;
    dlg.close(); a.UI.selFleet = f.id; if (f.star != null) { a.UI.sel = f.star; a.centerOn(f.star); } a.renderPanel(); a.draw();
  };
  let dlg = null;
  dlg = W.open(15, {
    title: 'Spaceward Ho!', label: 'List of All Fleets',
    text: { '#1': 'List of All Fleets:', 101: 'Go To Fleet', 1: 'OK' },
    lists: { 100: { items: shown.map(f => F.line(f)), sel: -1, dbl: () => go(dlg) } },
    on: { 100: (i, d) => { sel = i; const b = d.get('101'); if (b) b.disabled = i < 0; }, 101: (_, d) => go(d), 1: (_, d) => d.close() },
  });
  if (!dlg) return false;
  const b = dlg.get('101'); if (b) b.disabled = true;
  const L = dlg.get('100'); if (L) L.setAttribute('translate', 'no');
  return true;
};
// #17 LISTSTARS, List of All Explored Stars (Galaxy, List All Explored Stars…): LISTSTARSDLGPROC and FUN_1070_0033. Captured (win20-orig-vga16-stars{,-2140,-sel}.png):
// as List of All Fleets' window, "List of All Explored Stars:", Go To Star (dimmed until a row is chosen; a double click is Go To Star: the star selected and centred);
// the list in the fixed-pitch System font (SYSTEM_FIXED_FONT, rows of 15: WM_SETFONT makes the list 257 high), a row a line of text: the name padded to 8 letters, the
// temperature to 18, the gravity to 28, the metal to 37 ("No Climate Info." in their place), then Own, Explored or Enemy; the unowned first by quality, then other
// players' by quality, then the player's own by name (the ruleset's exploredList; js/skins/classic/ui.js exploredText).
D.stars = function () {
  const a = root.HOAPI, H = root.HO, g = a.G; if (!g || !a.exploredText) return false;
  const L = H.rules(g).exploredList; if (!L || L.layout !== 'text' || !L.cols) return false; // (a ruleset with another list: its own window)
  const cols = L.cols.win, rows = a.exploredText(cols);
  let sel = -1, dlg = null;
  const go = (d) => { const r = rows[sel]; if (!r) return; d.close(); a.UI.sel = r.id; a.centerOn(r.id); a.renderPanel(); a.draw(); };
  dlg = W.open(17, {
    title: 'Spaceward Ho!', label: 'List of All Explored Stars',
    text: { '#1': 'List of All Explored Stars:', 101: 'Go To Star', 1: 'OK' },
    lists: { 100: { items: rows.map(r => r.line), sel: -1, rowH: 15, fixed: true, dbl: () => go(dlg) } },
    on: { 100: (i, d) => { sel = i; const b = d.get('101'); if (b) b.disabled = i < 0; }, 101: (_, d) => go(d), 1: (_, d) => d.close() },
  });
  if (!dlg) return false;
  const b = dlg.get('101'); if (b) b.disabled = true;
  const l = dlg.get('100'); if (l) l.setAttribute('translate', 'no');
  return true;
};
// #10 COMPPLAYERS, Compare Players (Galaxy, Compare Players… [Ctrl+M]): COMPAREPLAYERSDLGPROC. Captured (win20-orig-vga16-compare{-2000,}.png; the System font's units):
// the title (100: "Sorry, no comparisons until the year 2010." in 2000, with Show Skills dimmed; else "Your rankings among the %d remaining players in %d:"), the chart
// (painted in the client, measured): the axes along the left and bottom edges of the hidden frame 101 (76, 34 to 505, 258), ticks of one pixel left of the axis at Best
// (16 under the top), Average (the middle) and Worst (16 over the axis), and over the axis every 43 pixels for the nine columns (Income ... Mini), the words in the small
// font (right-aligned 4 left of the axis; centred under the ticks, their baseline 13 under it); in each column the player's picture (32 x 32) 16 left of the tick and
// down by (place among the players) x trunc((258 - 34 - 32) / (players - 1)), as the DOS program's chart; Show Skills (102), OK (1, the default). The hidden frame 103
// shows nothing.
D.compare = function () {
  const a = root.HOAPI, H = root.HO, g = a.G, C = g && H.rules(g).compare; if (!C || C.style !== 'win' || !C.texts) return false; // (a ruleset with another chart: its own window)
  const info = H.compareInfo(g, a.ME), me = a.me();
  const title = info.kind === 'none' ? a.tl(C.texts.none) : info.kind === 'won' ? a.tl(C.texts.won, info.year) : info.kind === 'out' ? a.tl(C.texts.out, info.year) : a.tl(C.texts.ranks, info.n, info.year);
  let skills = null;
  const dlg = W.open(10, {
    label: 'Compare Players',
    text: { 100: title, 102: 'Show Skills', 1: 'OK' },
    on: { 102: (_, d) => { if (!skills) skills = D.skills(d, () => { skills = null; }); }, 1: (_, d) => d.close() },
  });
  if (!dlg) return false;
  const t = dlg.get('100'); if (t) t.setAttribute('translate', 'no'); // (the title, already in the game's language)
  // (the focus on Show Skills, the first control that takes it, as Windows gives it at the opening: captured, its dotted frame and heavy edge; dimmed in 2000, OK has it)
  const sk = dlg.get('102'); if (sk) { if (info.kind === 'none') sk.disabled = true; else sk.focus(); }
  if (info.kind === 'ranks') {
    const client = dlg.el.querySelector('.w31client'), cw = 534, ch = 318;
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; cv.className = 'w31c w31pic'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', title);
    Object.assign(cv.style, { left: '0', top: '0', width: `calc(${cw} * var(--wu))`, height: `calc(${ch} * var(--wu))`, pointerEvents: 'none' });
    const x = cv.getContext('2d'), words = a.compareWords && a.compareWords(), word = (i) => (words ? words[i] : a.tl(a.CMP_EN[i]));
    const x0 = 76, top = 34, y0 = 258, right = 505, n = info.n, unit = n >= 2 ? Math.trunc((y0 - top - 32) / (n - 1)) : Math.trunc((y0 - top) / 2) - 16;
    x.fillStyle = '#000';
    x.fillRect(x0, top, 1, y0 - top + 1); x.fillRect(x0, y0, right - x0, 1);
    const small = (s, px, py, align) => { x.save(); x.font = '11px ' + SANS; x.textBaseline = 'alphabetic'; const k = 1, w = x.measureText(s).width * k;
      x.translate(Math.round(align === 'right' ? px - w : px - w / 2), py); x.scale(k, 1); x.textAlign = 'left'; x.fillText(s, 0, 0); x.restore(); };
    [[top + 16, 9], [Math.trunc((top + y0) / 2), 10], [y0 - 16, 11]].forEach(([y, i]) => { x.fillRect(x0 - 1, y, 1, 1); small(word(i), x0 - 4, y + 4, 'right'); });
    const im = a.IMG['white0_' + (me.female ? 1 : 0)] || a.IMG['dos:i' + (me.female ? 1500 : 1000)];
    for (let k = 1; k <= 9; k++) {
      const xx = x0 + 43 * k; x.fillRect(xx, y0 - 1, 1, 1); small(word(k - 1), xx, y0 + 13, 'center');
      if (im && im.width) x.drawImage(im, xx - 16, top + Math.trunc(unit * info.scores[k - 1] / 10), 32, 32);
    }
    client.prepend(cv);
  }
  return true;
};
// #16 LISTSKILLS, Show Skills (Compare Players' Show Skills): LISTSKILLSDLGPROC and FUN_1070_2073. Captured (win20-orig-vga16-skills{,-scrolled}.png): a window of its own
// over Compare Players (which stays), at (12, 11) units in its client, with the caption "Spaceward Ho!": "List of all players and their skill levels:", the list (100,
// LBS_SORT: the players by name; the fixed-pitch font, rows of 15, 17 rows: the name padded to 18 letters, then the skill, Novice for a computer), the vertical scroll
// bar when the players do not fit (20 players: scrolled by 3), "Computer Intelligence:" and the computers' (101), OK.
D.skills = function (under, done) {
  const a = root.HOAPI, H = root.HO, g = a.G, Lg = root.HOLANG, lang = (g.opts && g.opts.lang) || H.ownLanguage(H.ownRules(g)), tx = (t) => (a.tl ? a.tl(t) : t);
  const SKK = ['novice', 'beginner', 'normal', 'advanced', 'expert'], IQK = ['dumb', 'average', 'smart', 'diabolical'], SK = ['Novice', 'Beginner', 'Normal', 'Advanced', 'Expert'], IQ = ['Dumb', 'Average', 'Smart', 'Diabolical'];
  const off = Lg && lang === 'de' && Lg.dosDe && Lg.dosDe.s ? { sk: [96, 97, 98, 99, 100].map(i => Lg.dosDe.s[i]), iq: [16, 17, 18].map(i => Lg.dosDe.s[i]) } : null;
  const skillName = (k) => { const i = SKK.indexOf(k) < 0 ? 2 : SKK.indexOf(k); return off && off.sk && off.sk[i] ? off.sk[i] : tx(SK[i]); };
  const iqi = Math.max(0, IQK.indexOf((g.opts && g.opts.iq) || 'average')), iq = off && off.iq && off.iq[iqi] ? off.iq[iqi] : tx(IQ[iqi]);
  const pad = (t, n) => t + ' '.repeat(Math.max(1, n - t.length));
  // (a computer player's skill field is never set (the 0x2fa table: the player's choice at registration), so it reads Novice: captured, 19 Dumb computers all "Novice";
  // the remake's computers keep their starting skill elsewhere, js/rules-dos.js COMPUTER_START)
  const rows = g.players.map(q => pad(q.name, 18) + skillName(q.human ? q.skill : 'novice')).sort((p, q) => p.localeCompare(q, undefined, { sensitivity: 'base' }));
  let dlg = null;
  const close = () => { if (dlg) dlg.el.remove(); if (done) done(); const ok = under.get('1'); if (ok) ok.focus(); };
  dlg = W.build(16, {
    title: 'Spaceward Ho!', label: 'List of all players and their skill levels:', close,
    text: { '#1': 'List of all players and their skill levels:', 1: 'OK', '#3': 'Computer Intelligence:', 101: iq },
    lists: { 100: { items: rows, sel: -1, rowH: 15, fixed: true } },
    on: { 1: () => close() },
    onKey: (e) => { e.stopPropagation(); if (e.key === 'Escape' || e.key === 'Enter') { close(); return true; } return false; }, // (its keys stay in it: Compare Players' Return is its own OK)
  });
  if (!dlg) return null;
  // (its frame's top left: the client of Compare Players (5, 5 in its frame) and (24, 22) for the template's 12, 11 units, less this window's own frame and caption, 5 and 24)
  Object.assign(dlg.el.style, { position: 'absolute', left: 'calc(24 * var(--wu))', top: 'calc(3 * var(--wu))', zIndex: '1' });
  dlg.el.setAttribute('role', 'dialog'); dlg.el.setAttribute('aria-label', tx('List of all players and their skill levels:'));
  for (const k of ['100', '101']) { const e = dlg.get(k); if (e) e.setAttribute('translate', 'no'); }
  under.el.append(dlg.el); dlg.focus();
  return dlg;
};

// #19 NAMESTAR, Name a Star (when the player has won: the ruleset's nameAStar): NAMESTARDLGPROC, in the remake's Name a Star form (js/skins/classic/ui.js openNameStar
// hands it to the skin, T.nameStarLayout). From the template (the System font's units, as the window is not one the program sizes; NOT CAPTURED: reaching it needs a
// won game): the words (static #0, wrapped: the sentence, the rule and the hint, as the DOS program's NameStarBox has them), picture 3500 (the DOS skin's d3500,
// 74 x 74, the size of control 999's black frame) in it, "New Star Name:", the field (100, at most 7 letters), OK; no Cancel (OK with the field blank names no
// star). A taken name brings the program's alert (the DOS look's alert box).
W.nameStar = function (f, o) {
  const a = root.HOAPI, T = root.HOTHEME, NS = o.NS, img = a.IMG['dos:d3500'];
  const decline = f.querySelector('button[type=button]');
  f.addEventListener('submit', (e) => { if (!o.inp.value.trim() && decline) { e.preventDefault(); e.stopImmediatePropagation(); decline.click(); } }, true);
  new MutationObserver(() => { const t = o.err.textContent; if (t) { o.err.textContent = ''; if (T && T.alertBox) T.alertBox([t]); } }).observe(o.err, { childList: true, characterData: true, subtree: true });
  const words = [NS.text, NS.rule, NS.hint].filter(Boolean).join('\n\n');
  const dlg = W.build(19, {
    label: NS.label || 'New Star Name:',
    text: { '#0': words, '#2': NS.label || 'New Star Name:', 1: NS.ok || 'OK' },
    pics: { 999: (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); if (img && img.width) x.drawImage(img, 0, 0); } }, // (black behind the picture: captured, win20-jake-vga16-won-namestar.png)
    rects: { '#0': [10, 10, 244, 142] }, // (the words wrap where the capture's do: our font is a little narrower)
    on: { 1: () => f.requestSubmit() },
  });
  if (!dlg) return false;
  const ed = dlg.get('100');
  if (ed) { o.inp.className = ed.className; o.inp.style.cssText = ed.style.cssText; o.inp.dataset.w31 = '100'; o.inp.maxLength = NS.max || 7; o.inp.setAttribute('spellcheck', 'false'); ed.replaceWith(o.inp); }
  o.err.style.display = 'none';
  f.innerHTML = ''; f.className = 'w31-namestar'; f.append(dlg.el, o.err);
  setTimeout(() => W.placeAt(dlg, [32, 74]), 0); // (the frame's corner at 32, 74 in the 640 x 480 screen, as captured)
  setTimeout(() => o.inp.focus(), 0);
  return 'w31dlg';
};
// #30 SENDMSG, Galaxy, Send Message… (the program's four-step window: who, saying what, about what, which one; the left list holds what is chosen, the right the choices;
// the remake's rs.cannedChat and H.sendCanned as the DOS look's window, js/skins/dos/ui.js chatDos). The program sizes it itself (captured, win20-orig-vga16-sendmsg*.png,
// the window 559 x 333 at 32, 65 with a 549 x 323 client): "Send Message:", the step's question (100), "To:" and "Content:" right-aligned at 95, the left list (a black frame, 80 x 211
// at 103, 41; one cell of 48 under the last, the picture 32 x 32 2 under the cell's top, the word's baseline 41 under the picture's top, centred) and the choices (a black frame
// 310 x 211 at 196, 41; five columns of 57 and rows of 48, cells 56 x 47 at 209, 49, the first with the focus's dotted frame), Cancel (2) and Send (1, dimmed until the fourth
// step is chosen), both 99 x 31 at 259 and 409, 276. Choosing a thing in the left list goes back to that step. The pictures are the DOS skin's (the Windows program's are the same).
D.sendMsg = function () {
  const a = root.HOAPI, H = root.HO, g = a.G, ME = a.ME, C = g && H.rules(g).cannedChat; if (!C || !W.templates || !W.templates[30]) return false;
  const tos = C.to(g, ME), ok = tos.filter(o => !o[2]);
  if (!ok.length) { a.toast(H.say(g, H.DATA.alerts[6] || 'There is no one else to send something to.')); return true; }
  const PR = ['Send Message To Who?', 'Saying What?', 'About What?', 'Which One?'];
  const hat = (q) => 'dos:i' + (q.id === ME ? (q.female ? 1500 : 1000) : (q.female ? 2500 : 2000) + ((q.face || 0) % 20));
  const pl = (id) => g.players[+id];
  let step = 0; const ch = [null, null, null, null]; let right = [];
  const rects = { '#26': [16, 17, 170, 16], 100: [196, 17, 340, 16], '#28': [196, 41, 310, 211], '#30': [16, 110, 79, 16], '#31': [16, 57, 79, 16], 2: [259, 276, 99, 31], 1: [409, 276, 99, 31] };
  const pics = {}, on = {}, cells = {};
  const paint = (c) => (x, w, h) => {
    x.clearRect(0, 0, w, h); if (!c) return;
    const im = c.icon && a.IMG[c.icon]; if (im && im.width) x.drawImage(im, Math.floor((w - 32) / 2), 2, 32, 32);
    x.font = '11px ' + SANS; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = c.off ? '#808080' : '#000';
    x.fillText(c.name || '', Math.floor((w - x.measureText(c.name || '').width) / 2), c.icon ? 43 : 28); // (on a whole pixel: a half one greys the bitmap font)
  };
  for (let k = 0; k < 4; k++) { rects[200 + k] = [104, 49 + 48 * k, 78, 48]; pics[200 + k] = (x, w, h) => paint(ch[k])(x, w, h); on[200 + k] = () => { if (ch[k]) { for (let j = k; j < 4; j++) ch[j] = null; step = k; refresh(); } }; }
  for (let i = 0; i < 20; i++) { rects[300 + i] = [209 + 57 * (i % 5), 49 + 48 * Math.floor(i / 5), 56, 47]; pics[300 + i] = (x, w, h) => paint(right[i])(x, w, h); on[300 + i] = () => { const c = right[i]; if (c && !c.off) { ch[step] = { id: c.id, i: c.i, name: c.name, icon: c.icon, kind: c.kind }; step = ch[1] && ch[1].i === 2 && step === 1 ? 2 : step + 1; refresh(); } }; }
  const choices = () => {
    if (step === 0) return tos.map(o => ({ id: String(o[0]), name: o[1], icon: pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
    if (step === 1) return C.actions.map((x, i) => ({ id: i, i, name: x.label, icon: 'dos:i' + (3000 + i) }));
    if (step === 2) return C.actions[ch[1].i].parts[0][2].map((o, i) => ({ id: i, i, name: o[0], icon: 'dos:i' + (3010 + i), kind: o[1] }));
    const kind = ch[2].kind; return C.list(g, ME, kind, a.UI.sel).map(o => ({ id: String(o[0]), name: o[1], icon: kind === 'players' && pl(o[0]) ? hat(pl(o[0])) : null, off: !!o[2] }));
  };
  let dlg;
  const refresh = () => {
    right = step > 3 ? [] : choices().slice(0, 20);
    const q = dlg.get('100'); if (q) q.textContent = step > 3 ? '' : a.tl(PR[step]);
    for (let k = 0; k < 4; k++) { const e = dlg.get(String(200 + k)); if (e) { e.w31.repaint(); e.style.cursor = ch[k] ? 'pointer' : 'default'; e.tabIndex = ch[k] ? 0 : -1; } }
    for (let i = 0; i < 20; i++) { const e = dlg.get(String(300 + i)); if (e) { e.w31.repaint(); const c = right[i]; e.style.cursor = c && !c.off ? 'pointer' : 'default'; e.tabIndex = c && !c.off ? 0 : -1; e.setAttribute('aria-label', c ? c.name : ''); e.style.display = c ? '' : 'none'; } }
    const s = dlg.get('1'); if (s) s.disabled = !(step > 3);
    const f = right.length && dlg.get('300'); if (f && !a.noFocus) f.focus(); // (the first choice has the focus, its dotted frame: captured)
  };
  dlg = W.open(30, {
    label: 'Send Message', client: [549, 323], rects, pics, on: Object.assign(on, {
      2: (_, d) => d.close(),
      1: (_, d) => { if (step <= 3) return; const r = H.sendCanned(g, ME, C.make(g, ME, isNaN(+ch[0].id) ? ch[0].id : +ch[0].id, ch[1].i, [ch[2].i, isNaN(+ch[3].id) ? ch[3].id : +ch[3].id]));
        if (r === 'limit') { a.chatLimitToast(); return; } if (r !== 'ok') return; a.Sound.play(5000); d.close(); a.save(); } }),
    text: { '#26': 'Send Message:', 100: PR[0], '#31': 'To:', '#30': 'Content:', 2: 'Cancel', 1: 'Send' },
  });
  if (!dlg) return false;
  // (the template's left black frame shares id 100 with the question: put it where it was measured)
  dlg.el.querySelectorAll('[data-w31="100"]').forEach((e) => { if (!e.classList.contains('w31s')) Object.assign(e.style, { left: 'calc(103 * var(--wu))', top: 'calc(41 * var(--wu))', width: 'calc(80 * var(--wu))', height: 'calc(211 * var(--wu))' }); });
  dlg.el.querySelectorAll('canvas.w31pic').forEach((e) => { e.addEventListener('focus', () => { e.style.outline = 'calc(1 * var(--wu)) dotted #000'; e.style.outlineOffset = 'calc(-1 * var(--wu))'; }); e.addEventListener('blur', () => { e.style.outline = ''; }); });
  const q = dlg.get('100'); if (q) q.setAttribute('translate', 'no');
  refresh();
  return true;
};
})(typeof window !== 'undefined' ? window : globalThis);
