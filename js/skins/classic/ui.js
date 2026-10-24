// Spaceward Ho! web remake — the classic skin (see js/skins.js)
(function () {
'use strict';
// the classic skin's page
const PAGE = `
<div id="app">
  <nav id="menubar" aria-label="Menus"><button class="mbtn logo" aria-haspopup="true" aria-label="Ho menu: this version, skin, sounds and modern conveniences">Ho!</button><span id="title"></span></nav>
  <div id="main">
    <aside id="panel" aria-label="Budget, technology and planet"></aside>
    <div id="mapwrap"><canvas id="map" aria-label="Star map"></canvas><div id="msg" aria-live="polite"></div></div>
  </div>
</div>
<div id="titlescreen" hidden>
  <div class="tcard">
    <h1>Spaceward Ho!</h1>
    <p class="ver">Version 5.1 (Alpha)</p>
    <p class="by">by Peter Commons &amp; Joe Williams · Delta Tao Software</p>
    <div class="win tsplash"><div class="wtitle"><span id="tname">Spaceward Ho!</span></div>
      <div class="wbody"><canvas id="tframe" width="304" height="200" role="img" aria-label="The Spaceward Ho! title picture"></canvas></div></div>
    <div class="tbtns"><button id="tnew">New game</button><button id="tcont" hidden>Continue</button><button id="timport" class="quiet">Import a game…</button><button id="thelp" class="quiet">How to play</button></div>
    <label class="tskin" hidden><span>Skin</span> <select id="tskin"></select></label>
    <label class="tskin tos" hidden><span>OS look</span> <select id="tos"></select></label>
    <label class="tskin tlang" hidden><span>Language</span> <select id="tlang"></select></label>
    <p class="credit">Art by Howard Vives and Bob Van de walle.</p>
    <p class="madeby">Updated and adapted for the web by Jake Wilson, with an abundance of help from Claude (Anthropic).</p>
    <p class="madeby legal"><a href="privacy.html" target="_blank" rel="noopener">Privacy and terms</a></p>
  </div>
</div>
`;
// Assets: the single-file build (tools/bundle.py) embeds them as window.ASSETS;
// otherwise they are fetched by name from assets/ (see assets/manifest.json).
const A = window.ASSETS || { img: {}, snd: {}, jpg: [], theme: 'assets/theme.mp3' };
// Another skin can reuse this one by setting window.HOTHEME before loading
// it (see js/skins/dos/ui.js): its own art and sounds come from T.dir, and
// a few hooks let it draw planets, ships, the selection and the title its
// own way. Anything it leaves out looks and sounds as here.
const T = window.HOTHEME || {};
function loadManifest(done) {
  const fin = () => { Object.assign(BASE_SND, A.snd); loadTheme(() => useSounds(soundsWanted(), done)); };
  if (window.ASSETS) return fin();
  fetch('assets/manifest.json').then(r => r.json()).then(m => {
    for (const k of m.sprites) A.img[k] = 'assets/sprites/' + k + '.png';
    for (const k of m.sounds) A.snd[k] = 'assets/sounds/' + k + '.mp3';
    for (let i = 1; i <= m.explore; i++) A.jpg.push('assets/explore/' + String(i).padStart(2, '0') + '.jpg');
    fin();
  }).catch(() => {
    $('#titlescreen').hidden = true;
    document.body.append(el('p', { class: 'warn' }, 'Could not load assets/manifest.json. Open this game from a web server (for example GitHub Pages), not straight from a file.'));
  });
}
// The theme's pictures are added as T.prefix + name, and T.images shows
// one of its pictures in place of one of ours. (Its sounds are a sound set:
// see useSounds.)
function loadTheme(done) {
  if (!T.dir) return done();
  const use = (sk) => {
    for (const k in sk.img) A.img[T.prefix + k] = sk.img[k];
    for (const k in T.images || {}) if (sk.img[T.images[k]]) A.img[k] = sk.img[T.images[k]];
    done();
  };
  if (A.skin) return use(A.skin); // single-file build
  fetch(T.dir + 'manifest.json').then(r => r.json()).then(m => {
    const sk = { img: {} };
    for (const k of m.sprites) sk.img[k] = T.dir + 'sprites/' + k + '.png';
    use(sk);
  }).catch(() => done());
}
// ---------- sound sets ----------
// Sounds belong to the skin (js/skins.js, SOUNDS): a game plays only the
// sounds of its skin's original, and an event that original had no sound
// for is silent. "Choose sounds" (New Game, or the Ho menu mid-game) puts
// another original's set, or 'none', in G.opts.sounds (and remembers it in
// localStorage "ho5.sounds" for the next New Game).
const BASE_SND = {}; // the 5.0.5 sounds (assets/sounds), the "classic" set
const skinSoundsId = () => {
  if (!window.HOSKINS) return 'classic';
  const k = HOSKINS.list.find(x => x.id === HOSKINS.current);
  return (k ? k.sounds : 'classic') || 'none';
};
// the Macs' colour-monitor joke looks for a black-and-white screen: a
// black-and-white skin is one (engine.js endTurn, rs.colorMonitorBW)
HO.screenBW = () => !!(window.HOSKINS && HOSKINS.bw);
const soundsWanted = () => (G && G.opts && G.opts.sounds) || skinSoundsId();
// true when the game plays its skin's own sounds (a skin's messageLook
// names its own sounds; with another set the message's own sound is used)
const ownSounds = () => { const w = soundsWanted(), o = skinSoundsId(), s = window.HOSKINS && HOSKINS.soundSet(o); return w === o || !!(s && s.same === w); };
function useSounds(id, done) {
  done = done || (() => {});
  if (Sound.set === id) return done();
  Sound.set = id; Sound.cache = {};
  const set = !window.HOSKINS ? (id === 'none' ? null : { dir: null }) : HOSKINS.soundSet(id);
  if (!set) { A.snd = {}; return done(); }
  if (!set.dir) { A.snd = Object.assign({}, BASE_SND); return done(); }
  // the set's own files, by their own numbers (or names), then its map
  const use = (files) => {
    const snd = Object.assign({}, files);
    for (const n in set.map || {}) { const f = set.map[n]; if (f != null && files[f]) snd[n] = files[f]; else delete snd[n]; }
    if (Sound.set === id) A.snd = snd;
    done();
  };
  A.snd = {}; // silent while the set loads, never another set's sounds
  const own = window.HOSKINS && HOSKINS.soundSet(skinSoundsId());
  if (A.skin && own && (id === own.id || id === own.same)) return use(A.skin.snd || {}); // single-file build
  fetch(set.dir + 'manifest.json').then(r => r.json()).then(m => {
    const files = {}, ext = m.soundFormat || 'wav'; // a set's files are .wav unless its manifest says (iOS: "mp3")
    for (const k of m.sounds || []) files[k] = set.dir + 'sounds/' + k + '.' + ext;
    use(files);
  }).catch(() => use({})); // never fall back on another set's sounds
}
const applySounds = () => useSounds(soundsWanted());
const $ = (s, el) => (el || document).querySelector(s);
// The remake's own words in the chosen language (js/ui-lang.js): every string
// el() is given, and the words a skin writes into the page, are put in
// HOUI's language, keeping their English; tl() for text drawn on a canvas.
const UIL = window.HOUI || { t: (s, ...a) => { let i = 0; return s.replace(/%(?:\d+\$)?[sd]/g, () => String(a[i++])); }, tr: (s) => s, text: (d, s) => d.createTextNode(s), en: (n) => n.textContent, set: () => false, pref: { get: () => null, at: () => 0, set: () => false }, onChange() {}, lang: 'en' };
const tl = (s, ...a) => (a.length ? UIL.t(s, ...a) : UIL.tr(s));
const TL_ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
const el = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), guard(attrs[k])); // an exception: the bug report window
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (TL_ATTRS.includes(k) && typeof attrs[k] === 'string') { const v = attrs[k], w = UIL.tr(v); e.setAttribute(k, w); if (w !== v) (e.hoA || (e.hoA = {}))[k] = [v, w]; }
    else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : UIL.text(document, String(c)));
  return e;
};
// numbers and sums as the game's version writes them (rs.fmtNum, rs.fmtMoney:
// 5.0.5's "12,345K" and "$12.345M", 1.2 to 4.0.5's "12,345K"); left out, in full
const fmt = (n) => { const f = G && HO.rules(G).fmtNum; return f ? f(n) : Math.round(n).toLocaleString('en-US'); };
const money = (n) => { const f = G && HO.rules(G).fmtMoney; return f ? f(n) : (n < 0 ? '-$' : '$') + fmt(Math.abs(n)); };
// a panel's figure (rs.shortMoney, the Palm): in full inside the screen's
// range ([lo, hi)), else the version's compact form
const panelFig = (key, n, cur) => { const S = G && HO.rules(G).shortMoney, r = S && S.full[key]; return r && !(n >= r[0] && n < r[1]) ? S.fn(n, cur) : cur ? money(n) : fmt(n); };

// ---------- images ----------
const IMG = {};
let imgPending = 0;
function loadImages(done) {
  const keys = Object.keys(A.img);
  imgPending = keys.length;
  for (const k of keys) {
    const im = new Image();
    im.onload = im.onerror = () => { if (--imgPending === 0) done(); };
    im.src = A.img[k];
    IMG[k] = im;
  }
}

// ---------- sound ----------
const Sound = {
  on: true, music: false, cache: {}, theme: null, set: undefined,
  play(id) {
    if (!this.on || id == null || !A.snd[id]) return;
    try {
      let a = this.cache[id];
      if (!a) a = this.cache[id] = new Audio(A.snd[id]);
      const b = a.paused ? a : a.cloneNode();
      b.currentTime = 0; b.volume = 0.8;
      b.play().catch(() => {});
    } catch (e) {}
  },
  startTheme() {
    if (!this.music) return;
    if (!this.theme) { this.theme = new Audio(A.theme); this.theme.loop = true; this.theme.volume = 0.5; }
    this.theme.play().catch(() => {});
  },
  stopTheme() { if (this.theme) this.theme.pause(); },
};
// preferences (the original's Preferences window: Celsius, only important messages, review battles, hints)
const Prefs = { celsius: false, important: false, review: null, hints: true, autoRoute: true, tips: true,
  // the version's own preferences (rs.options, 1.2 and 2.0): battle speed in
  // ticks a shot (null: the version's default), fully animated battles,
  // event messages shown, the polling time in seconds (null: the default)
  battleSpeed: null, fullAnim: true, showMsgs: true, poll: null,
  // 5.0.5's Auto Play window's own settings (openAutoPlay505)
  auto505: null,
  // 5.0.5's Preferences window (rs.prefsWindow, prefs505): stars best buddies
  // explore, battle review speed 0-30 (null: 15), vocalized chat keywords
  buddyStars: true, reviewSpeed: null, vocal: true,
  // the Palm's Preferences form (rs.prefsWindow style 'palm', prefsPalm): money
  // in euros, Jump To History, Auto-Zoom, Disable Auto-Off (kept, nothing yet
  // to act on)
  euro: false, jumpHistory: true, autoZoom: false, autoOff: false };
try { const s = JSON.parse(localStorage.getItem('ho5.prefs') || '{}'); if (s.sound === false) Sound.on = false; if (s.music) Sound.music = true; for (const k in Prefs) if (s[k] != null) Prefs[k] = s[k]; } catch (e) {}
// Review Battles: what was chosen, else the version's own default (iOS: on;
// rs.prefsWindow.defaults), else off
function prefReview() { const PW = G && HO.rules(G).prefsWindow; return Prefs.review != null ? !!Prefs.review : !!(PW && PW.defaults && PW.defaults.review); }
function savePrefs() { try { localStorage.setItem('ho5.prefs', JSON.stringify(Object.assign({ sound: Sound.on, music: Sound.music }, Prefs))); } catch (e) {} }
// rs.celsius: the version showed temperatures in °C, to a tenth (1.2, the
// French edition); otherwise °C is the player's preference
const rsCelsius = () => !!(G && HO.rules(G).celsius);
const toC = (f) => rsCelsius() ? ((f - 32) * 5 / 9).toFixed(1) : Math.round((f - 32) * 5 / 9);
const degF = (f) => Prefs.celsius || rsCelsius() ? toC(f) + '°C' : Math.round(f) + '°';
// (a degree already in °C, as a translation writes it, stays as it is)
const degText = (t) => Prefs.celsius || rsCelsius() ? t.replace(/(-?\d+)°(?!C)(F)?/g, (m, n) => toC(+n) + '°C') : t;
// rs.options: the version's own Options menu preferences (1.2, 2.0)
const verOpts = () => (G && HO.rules(G).options) || null;
const optVal = (O, k) => { const v = Prefs[k]; return v != null && v >= O.min && v <= O.max ? v : O.def; };
// the battle's pace from the version's battle speed (rs.options.battleSpeed:
// ticks a shot, the remake's pace at the default) and fully animated
// battles (off: each pile shoots as a group, no explosions)
function verBattle() {
  const BS = (verOpts() || {}).battleSpeed, PW = G && HO.rules(G).prefsWindow;
  // 5.0.5's Battle Review Speed (0 Slow to 30 Fast, 15 the remake's pace):
  // each step is a quarter of an octave
  if (PW && PW.range && !BS) { const v = Prefs.reviewSpeed != null ? Prefs.reviewSpeed : PW.def; return { f: Math.pow(2, (PW.def - v) / 7.5), full: true }; }
  return BS ? { f: optVal(BS, 'battleSpeed') / BS.def, full: Prefs.fullAnim !== false } : { f: 1, full: true };
}

// ---------- state ----------
let G = null;            // game
// "Modern conveniences" (a New Game option, also in Preferences): helpers the
// original games didn't have. Off, the game plays as the originals did.
const modern = () => !!(G && G.opts && G.opts.modern);
// Evacuate (give up a colony) is a rule: rs.evacuateCommand says whether the
// version had the command. true or left out: the planet panel's Evacuate
// button and the map menu's "Evacuate planet…" show; false (1.2 and 2.0 had
// no such command): they never show, modern conveniences or not.
const evacuateShown = () => HO.rules(G).evacuateCommand !== false;
// rs.evacuateToggle: the command marks the colony and the ruleset gives it up
// at End Turn (5.0.5: "Evacuate Planet" / "Don't Evacuate Planet",
// FUN_10060fac). { words: [mark, unmark], marked(G, sid), ask(G, player, sid) }:
// ask gives null (no question), { text } (a yes/no question) or { text,
// notice: true } (said, then done). Sounds 7002 on, 4000 off. Without it, the
// remake's own confirmation and an immediate HO.evacuate.
function evacuateClick(sid, tog) {
  const t = tog || HO.rules(G).evacuateToggle, s = G.stars[sid];
  // 3.0.1's and 4.0.5's "Hope" and "Ship" jokes (rs.evacuateJoke) in place of the remake's question
  const hj = !t && HO.rules(G).evacuateJoke && HO.rules(G).evacuateJoke(G, s);
  if (!t) return confirmBox(hj ? HO.say(G, hj) : `Evacuate ${s.name}? Your colonists will leave; satellites stay.`, () => { HO.evacuate(G, ME, sid); Sound.play(7002); renderPanel(); draw(); save(); });
  const on = !t.marked(G, sid);
  const go = () => { HO.evacuate(G, ME, sid); Sound.play(on ? 7002 : 4000); renderPanel(); draw(); save(); };
  const a = on ? t.ask(G, me(), sid) : null;
  if (!a) go(); else if (a.notice) { toast(HO.say(G, a.text)); go(); } else confirmBox(HO.say(G, a.text), go);
}
const evacuateLabel = (sid, plain) => { const t = HO.rules(G).evacuateToggle; return t ? t.words[t.marked(G, sid) ? 1 : 0] : plain; };
const evacuateHere = (s) => evacuateShown() && (HO.rules(G).evacuateToggle || s.id !== me().homeStar || HO.colonies(G, ME).length > 1);
// whose turn it is (several humans can share one computer: hot seat)
let ME = 0;
const me = () => G.players[ME];
const UI = {
  sel: null,             // selected star id
  selFleet: null,        // selected fleet id
  view: { s: 40, ox: 0, oy: 0 },
  inbox: [], msgIdx: 0,
  drag: null, hover: null,
  ruler: null,           // a finger's distance ruler from the selected star (touch)
  dots: [],              // hit areas for fleet dots
  bug: null, bugSeen: {}, // the bug report window (showBug), and how often each error came up
};

// ---------- ship pictures ----------
// Built the way the original builds them (FUN_100ad750 / FUN_100af8e0), from
// the ship sheet (PICT 11000, assets/sprites/ships.png). The sheet has four
// rows of 30 parts, 41 pixels apart: engines (picked by Range + Speed - 8),
// hulls (Shields), weapon noses (Weapons) and satellite orbs (Weapons).
// Tankers, colony ships and dreadnoughts swap the hull for a body of their
// own; a few designs get a whole picture of their own instead. Ships face
// right. Rectangles are [x1, y1, x2, y2] on the sheet.
const SHIP_CODE = { scout: 0, dread: 1, fighter: 2, decoy: 2, tanker: 3, colony: 4, satellite: 5, bio: 6 };
function specialShip(t, d) {
  const { R, V, W, S, M } = d;
  if (t === 6) return W < 7 ? [0, 320, 120, 360] : (W > 12 && W < 16) ? [692, 279, 892, 339] : [692, 165, 876, 221];
  if (t === 0 && W === 1) return [270, 236, 366, 289];
  if (t === 1 && W > 30) return [481, 165, 691, 255];
  if (t === 1 && W === 8 && R > 10 && R < 14 && M > 1) return [270, 165, 480, 235];
  if (t === 2 && W < 9 && V > 5) return [692, 222, 890, 278];
  if (t === 2 && W === 12 && S < 11) return [69, 254, 269, 314];
  if (t === 5 && W === 5 && S > 3 && S < 7) return [120, 320, 160, 360];
  if (t === 5 && W === 15 && S > 13 && S < 17) return [161, 320, 201, 360];
  if (t === 5 && W < 9 && S > 9 && S < 15) return [202, 320, 242, 360];
  if (t === 5 && S < 5 && W > 15 && W < 21) return [243, 320, 283, 360];
  return null;
}
function shipParts(d) {
  const t = SHIP_CODE[d.type] != null ? SHIP_CODE[d.type] : 2;
  const col = (v) => 41 * Math.max(0, Math.min(29, v)) + 1;
  const part = (v, y) => [col(v), y, col(v) + 40, y + 40];
  const ops = []; // [source rect, destination rect around the ship's centre]
  const sp = specialShip(t, d);
  if (sp) {
    const w = sp[2] - sp[0], h = sp[3] - sp[1], x = -Math.trunc(w / 2), y = -Math.trunc(h / 2);
    ops.push([sp, [x, y, x + w, y + h]]);
  } else if (t === 5) ops.push([part(d.W - 1, 124), [-20, -20, 20, 20]]);
  else {
    const eng = part((d.R || 0) + (d.V || 0) - 8, 1), nose = part(d.W - 1, 83);
    if (t === 1) {
      ops.push([[138, 165, 269, 253], [-65, -44, 66, 44]]);
      for (const r of [[52, -42, 92, -2], [52, 11, 92, 51], [65, -17, 105, 23]]) ops.push([nose, r]);
      for (const r of [[-91, -45, -51, -5], [-91, 8, -51, 48], [-104, -20, -64, 20]]) ops.push([eng, r]);
    } else {
      const body = t === 4 ? [[67, 165, 137, 221], [-35, -28, 35, 28]]
        : t === 3 ? [[1, 165, 66, 209], [-32, -22, 33, 22]]
        : [part(d.S - 1, 42), [-20, -20, 20, 20]];
      const [l, r] = [body[1][0], body[1][2]];
      ops.push(body, [nose, [r, -20, r + 40, 20]], [eng, [l - 40, -20, l, 20]]);
    }
  }
  return { t, ops };
}
const shipCache = {};
function shipPic(d, owner) {
  const p = G && G.players[owner == null ? 0 : owner];
  // a design whose weapons and shields are both more than 3 levels behind
  // its owner's research is drawn rusty (design flag +0xd, FUN_10074c10)
  const rusty = !!(p && p.tech && d.type !== 'bio' && p.tech.weapons - d.W > 3 && p.tech.shields - d.S > 3);
  // the Palm patch (fix 'palmPictures') draws the parts the Palm game lacked
  const palmFix = !!(G && HO.fixed(G, 'palmPictures'));
  const key = [d.type, d.R, d.V, d.W, d.S, d.M, rusty].join(':') + (palmFix ? ':fix' : '');
  if (shipCache[key]) return shipCache[key];
  if (T.shipPic) { const t = T.shipPic(d, IMG, rusty, palmFix); if (t) return (shipCache[key] = t); }
  const { ops } = shipParts(d);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [, r] of ops) { x0 = Math.min(x0, r[0]); y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[2]); y1 = Math.max(y1, r[3]); }
  const c = document.createElement('canvas');
  c.width = x1 - x0; c.height = y1 - y0;
  const x = c.getContext('2d'), sh = IMG.ships;
  for (const [s, r] of ops) {
    const w = s[2] - s[0], h = s[3] - s[1];
    if (!rusty) { x.drawImage(sh, s[0], s[1], w, h, r[0] - x0, r[1] - y0, r[2] - r[0], r[3] - r[1]); continue; }
    const t = document.createElement('canvas'); t.width = w; t.height = h;
    const tx = t.getContext('2d');
    tx.drawImage(sh, s[0], s[1], w, h, 0, 0, w, h);
    tx.globalCompositeOperation = 'source-atop';
    tx.drawImage(sh, 904, 169, w, h, 0, 0, w, h);
    x.drawImage(t, 0, 0, w, h, r[0] - x0, r[1] - y0, r[2] - r[0], r[3] - r[1]);
  }
  shipCache[key] = c;
  return c;
}
// what the original draws for the planet itself in a battle
function planetBattlePic() {
  if (shipCache.planet) return shipCache.planet;
  if (T.battlePlanet && IMG[T.battlePlanet]) return (shipCache.planet = IMG[T.battlePlanet]);
  const c = document.createElement('canvas'); c.width = 62; c.height = 62;
  c.getContext('2d').drawImage(IMG.ships, 1, 222, 62, 62, 0, 0, 62, 62);
  return (shipCache.planet = c);
}
function shipImgEl(d, h, owner) {
  const c = shipPic(d, owner);
  const i = new Image(); i.src = c.toDataURL(); i.style.height = (h || 28) + 'px'; i.alt = HO.TYPES[d.type].name; i.className = 'shippic';
  return i;
}

// ---------- star appearance ----------
// novas (Original rules): 10..209 = turning red (nova0-4); a star that has
// gone supernova shows the explosion the turn it happens, then its wreck.
function novaLook(k) {
  const n = k.nova || 0;
  if (n >= 10 && n < 210) return 'nova' + Math.min(4, Math.floor((n - 10) / 40));
  if (n >= 210) return n >= G.year ? 'nova12' : 'nova18';
  return null;
}
function starLook(sid) {
  const look = ourStarLook(sid);
  return (T.starLook && T.starLook(look, { G, p: me(), s: G.stars[sid], k: HO.know(G, me(), sid), IMG, redraw: draw })) || look;
}
function ourStarLook(sid) {
  const p = me(), s = G.stars[sid], k = HO.know(G, p, sid);
  const nv = novaLook(s.owner === ME ? s : k);
  if (nv) return { base: nv };
  if (s.owner === ME) return { base: planetSprite(p, s, s.metal), pic: planetPic(p, s, s.metal), hat: hatFor(p, s) };
  if (!k.explored) {
    if (k.battleOnly) return { base: 'battle' };
    const coming = G.fleets.some(f => f.owner === ME && (f.to === sid || f.dest === sid));
    return { base: coming ? 'soon' : 'unknown' };
  }
  const look = { base: planetSprite(p, k, k.metal), pic: planetPic(p, k, k.metal) };
  if (k.owner >= 0 && k.owner !== ME && G.players[k.owner]) { const o = G.players[k.owner]; look.hat = 'bad' + o.face + '_' + (o.female ? 1 : 0); }
  return look;
}
// The original (FUN_10090170) picks one of seven planet sizes from the
// planet's gravity as a percentage of your home gravity, uses the reddish
// "Mined" picture once fewer than 100 units of metal are left, and lays the
// metal, heat and ice pictures over it, each cut to the planet's shape.
function planetRow(p, g) {
  const pct = Math.trunc(Math.round(g * 100) * 100 / Math.max(1, Math.round(p.homeG * 100)));
  return [252, 201, 126, 76, 51, 39].filter(v => pct < v).length;
}
function planetSprite(p, s, metal) { return (metal < 100 ? 'mined' : 'planet') + planetRow(p, s.g); }
const planetCache = {};
function planetPic(p, s, metal) {
  const row = planetRow(p, s.g);
  const T = Math.round(s.t * 10) - Math.round(p.homeT * 10) + 720; // 72.0 = just right
  const heat = T > 770 ? Math.min(100, Math.trunc((T - 770) / 30)) : 0;
  const cap = T < 650 ? Math.min(20, Math.trunc((650 - T) / 150)) + row : 0;
  const ml = metal < 100 ? -1 : [1000, 2500, 5000, 10000].filter(v => metal >= v).length;
  const key = [row, ml, heat, cap].join(':');
  if (planetCache[key]) return planetCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 40;
  const x = c.getContext('2d');
  x.drawImage(IMG[(ml < 0 ? 'mined' : 'planet') + row], 0, 0, 40, 40);
  const masked = (fn) => { // draw through the planet-shaped mask
    const t = document.createElement('canvas'); t.width = t.height = 40;
    const tx = t.getContext('2d'); fn(tx);
    tx.globalCompositeOperation = 'destination-in'; tx.drawImage(IMG['pmask' + row], 0, 0);
    x.drawImage(t, 0, 0);
  };
  if (heat) masked(tx => { tx.globalAlpha = heat / 100; tx.drawImage(IMG.hot, 0, 0); });
  if (cap) masked(tx => { // polar caps grow from the top and bottom as it gets colder
    tx.drawImage(IMG.icecap, 0, 0, 40, 20, 0, cap - 20, 40, 20);
    tx.drawImage(IMG.icecap, 0, 20, 40, 20, 0, 40 - cap, 40, 20);
  });
  if (ml >= 0) masked(tx => tx.drawImage(IMG['metal' + ml], 0, 0, 40, 40));
  return (planetCache[key] = c);
}
function hatFor(p, s) {
  const prof = HO.planetIncome(G, p, s) >= 0;
  const cls = HO.planetClass(G, HO.seenG(p, s));
  const row = prof ? 0 : cls === 'good' ? 1 : cls === 'semi' ? 2 : 3;
  return 'white' + row + '_' + (p.female ? 1 : 0);
}

// ---------- map ----------
let cv, cx, mapW = 0, mapH = 0, dpr = 1;
const bgStars = [];
// A skin may draw the map in pixels of its own (T.mapPixel(): [w, h], the
// CSS pixels one map pixel takes; the Amiga skin's tall pixels): mapW, mapH,
// the view and every pointer position are then in those pixels.
const mapPx = () => (T.mapPixel && T.mapPixel()) || [1, 1];
const ox = (e) => e.offsetX / mapPx()[0], oy = (e) => e.offsetY / mapPx()[1];
// the map's type (T.mapFont(px): a skin's own font for its names and labels)
const mapFont = (n, fam) => (T.mapFont && T.mapFont(n)) || `${n}px ${fam || 'Geneva, Verdana, sans-serif'}`;
function setupMap() {
  cv = $('#map'); cx = cv.getContext('2d');
  for (let i = 0; i < 260; i++) bgStars.push({ x: Math.random(), y: Math.random(), b: Math.random() });
  new ResizeObserver(resize).observe(cv.parentElement);
  // a finger (pointerType 'touch') gets iOS 1.2.9's gestures (Touch.map*,
  // below); a mouse and a pen keep these, so a hybrid laptop has both
  cv.addEventListener('pointerdown', guard((e) => isTouch(e) ? Touch.mapDown(e) : onDown(e))); // guard(): an exception shows the bug report window
  cv.addEventListener('pointermove', guard((e) => isTouch(e) ? Touch.mapMove(e) : onMove(e)));
  cv.addEventListener('pointerup', guard((e) => isTouch(e) ? Touch.mapUp(e) : onUp(e)));
  cv.addEventListener('pointercancel', guard((e) => { if (isTouch(e)) Touch.mapCancel(e); else { UI.drag = null; draw(); } }));
  cv.addEventListener('dblclick', guard((e) => { if (lastPointer !== 'touch') onDbl(e); })); // iOS: a double tap on the map does nothing
  cv.addEventListener('contextmenu', guard((e) => { if (!G) return; e.preventDefault(); if (lastPointer === 'touch') return; const s = starAt(ox(e), oy(e)); if (s != null) starMenu(s, e.clientX, e.clientY); }));
  cv.addEventListener('wheel', guard((e) => { e.preventDefault(); zoomAt(ox(e), oy(e), e.deltaY < 0 ? 1.15 : 1 / 1.15); }), { passive: false });
  resize();
}
function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  const [kx, ky] = mapPx();
  mapW = r.width / kx; mapH = r.height / ky;
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
  if (G && !UI.fitted) fit();
  draw();
}
function fit() {
  if (!G || !mapW) return;
  const pad = 30;
  const s = Math.min((mapW - pad * 2) / G.W, (mapH - pad * 2 - 30) / G.H);
  UI.view = { s, ox: (mapW - G.W * s) / 2, oy: (mapH - 30 - G.H * s) / 2 + 4 };
  // T.fitView(view, ctx): a skin's own first view (the Amiga's zoom, on your home)
  if (T.fitView) T.fitView(UI.view, { G, ME, mapW, mapH, sel: UI.sel });
  UI.fitted = true;
}
// right-click on a star: the commands that apply to it (5.0.5 had a
// contextual menu in the map window; its items are the menu-bar commands)
function starMenu(sid, px, py) {
  closeStarMenu();
  const s = G.stars[sid], mine = s.owner === ME;
  UI.sel = sid; renderPanel(); draw();
  const items = [];
  if (mine && !G.over) items.push([HO.feature(G, 'buildQueue') ? 'Queue ships…' : 'Build ships…', () => openBuild(sid)]);
  const fl = fleetOrder(G.fleets.filter(f => f.owner === ME && f.star === sid && f.to == null && !f.sat));
  if (fl.length) items.push(['Select a fleet here', () => { UI.selFleet = fl[0].id; renderPanel(); draw(); }]);
  for (const bt of lastBattles(sid)) items.push([`Review ${battleName(bt)}`, () => openBattle(bt.id)]);
  if (mine && !G.over && evacuateHere(s))
    items.push([evacuateLabel(sid, 'Evacuate planet…'), () => evacuateClick(sid)]);
  items.push(['Centre the map here', () => { const x = sx(s.x), y = sy(s.y); UI.view.ox += mapW / 2 - x; UI.view.oy += mapH / 2 - y; draw(); }]);
  const m = el('div', { class: 'dropdown open starmenu', role: 'menu', id: 'starmenu' },
    el('div', { class: 'mhead' }, s.name), ...items.map(([t, fn]) => el('button', { role: 'menuitem', onclick: () => { closeStarMenu(); fn(); } }, t)));
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.min(px, window.innerWidth - r.width - 6) + 'px';
  m.style.top = Math.min(py, window.innerHeight - r.height - 6) + 'px';
  const first = m.querySelector('button'); if (first) first.focus();
  setTimeout(() => document.addEventListener('pointerdown', closeStarMenuOutside), 0);
}
function closeStarMenuOutside(e) { if (!e.target.closest('#starmenu')) closeStarMenu(); }
function closeStarMenu() { const m = $('#starmenu'); if (m) m.remove(); document.removeEventListener('pointerdown', closeStarMenuOutside); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeStarMenu(); });
// bring a star to the middle of the map (zooming in a little if the map is far out)
function centerOn(sid) {
  const s = G.stars[sid]; if (!s || !UI.view) return;
  const x = sx(s.x), y = sy(s.y);
  if (x > mapW * 0.2 && x < mapW * 0.8 && y > mapH * 0.2 && y < mapH * 0.8) return; // already in view
  UI.view.ox += mapW / 2 - x; UI.view.oy += mapH / 2 - y;
}
// T.zoomTo(s, f): a skin's own zoom levels (the Amiga's four): the scale
// that a zoom by f from s gives (a pinch passes its whole factor so far)
function zoomAt(px, py, f) {
  const v = UI.view;
  const ns = T.zoomTo ? T.zoomTo(v.s, f) : Math.max(12, Math.min(140, v.s * f));
  const wx = (px - v.ox) / v.s, wy = (py - v.oy) / v.s;
  v.s = ns; v.ox = px - wx * ns; v.oy = py - wy * ns;
  draw();
}
const sx = (x) => UI.view.ox + x * UI.view.s;
const sy = (y) => UI.view.oy + y * UI.view.s;
function planetPx() { return T.planetPx ? T.planetPx(UI.view.s) : Math.max(18, Math.min(52, UI.view.s * 0.9)); }
function starAt(px, py) {
  const r = planetPx() * 0.6;
  let best = null, bd = 1e9;
  for (const s of G.stars) { const d = Math.hypot(sx(s.x) - px, sy(s.y) - py); if (d < r && d < bd) { bd = d; best = s.id; } }
  return best;
}
function dotAt(px, py) {
  for (let i = UI.dots.length - 1; i >= 0; i--) { const d = UI.dots[i]; if (px >= d.x - 2 && px <= d.x + d.w + 2 && py >= d.y - 2 && py <= d.y + d.h + 2) return d; }
  return null;
}
function countBucket(n) { return n <= 1 ? 0 : n <= 10 ? 1 : n <= 30 ? 2 : 3; }

// T.afterDraw(): a skin follows the view (the Amiga's scroll bars)
function draw() {
  draw0();
  if (T.afterDraw) T.afterDraw();
}
function draw0() {
  if (!cx) return;
  cx.setTransform(dpr * mapPx()[0], 0, 0, dpr * mapPx()[1], 0, 0);
  cx.fillStyle = T.mapBg || '#04030c'; cx.fillRect(0, 0, mapW, mapH);
  if (T.bgStars !== false) for (const b of bgStars) { cx.fillStyle = `rgba(200,210,255,${0.15 + b.b * 0.5})`; cx.fillRect(b.x * mapW, b.y * mapH, b.b > 0.9 ? 2 : 1, b.b > 0.9 ? 2 : 1); }
  if (!G) return;
  const ps = planetPx();
  cx.imageSmoothingEnabled = ps < 40;
  UI.dots = [];
  // routes of my fleets
  for (const f of T.routes === false ? [] : G.fleets) { // (T.routes false: the Amiga draws a route only while it is dragged)
    if (f.owner !== ME) continue;
    if (f.to != null) {
      const a = G.stars[f.from], b = G.stars[f.to];
      drawRoute(a, b, HO.fleetSpeed(G, f), '#7fd0ff', f.prog / f.dist);
    } else if (f.dest != null) {
      drawRoute(G.stars[f.star], G.stars[f.dest], HO.fleetSpeed(G, f), '#ffe066', 0, f.fuel >= 2 * HO.starDist(G, f.star, f.dest));
    }
    // later legs of a multi-star route
    if (f.path && f.path.length) {
      let a = G.stars[f.to != null ? f.to : f.dest != null ? f.dest : f.star];
      for (const sid of f.path) { const b = G.stars[sid]; drawRoute(a, b, HO.fleetSpeed(G, f), 'rgba(255,224,102,0.55)', 0); a = b; }
    }
  }
  if (UI.route) {
    const f = G.fleets.find(x => x.id === UI.route.fleet);
    if (f) { let a = G.stars[f.star]; for (const sid of UI.route.stops) { const b = G.stars[sid]; drawRoute(a, b, HO.fleetSpeed(G, f), '#ffffff', 0); a = b; } }
  }
  // a finger dragged from the selected star: a distance ruler (iOS StarNode)
  if (UI.ruler && G.stars[UI.ruler.from] && G.stars[UI.ruler.to]) {
    const a = G.stars[UI.ruler.from], b = G.stars[UI.ruler.to], x2 = sx(b.x), y2 = sy(b.y);
    cx.save(); cx.strokeStyle = '#bfe8ff'; cx.lineWidth = 2; cx.setLineDash([6, 5]);
    cx.beginPath(); cx.moveTo(sx(a.x), sy(a.y)); cx.lineTo(x2, y2); cx.stroke(); cx.setLineDash([]);
    const label = tl('%s: %s away', b.name, HO.starDist(G, a.id, b.id).toFixed(1));
    cx.font = mapFont(12); cx.textAlign = 'left';
    const tw = cx.measureText(label).width;
    cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(x2 + 12, y2 - 24, tw + 10, 18);
    cx.fillStyle = '#bfe8ff'; cx.fillText(label, x2 + 17, y2 - 11); cx.restore();
  }
  // stars
  for (const s of G.stars) {
    const x = sx(s.x), y = sy(s.y);
    if (x < -60 || y < -60 || x > mapW + 60 || y > mapH + 60) continue;
    const look = starLook(s.id);
    // T.drawStar(cx, info): a skin draws the star, its selection and its
    // name its own way (true: done); the rings, hats and fleets follow
    const own = T.drawStar && T.drawStar(cx, { s, x, y, ps, look, sel: UI.sel === s.id, IMG, view: UI.view, G, ME });
    const selPic = !own && T.select && (ps < 24 && T.selectSmall ? IMG[T.selectSmall] : IMG[T.select]);
    if (UI.sel === s.id && selPic) { const r = ps * 0.85; cx.drawImage(selPic, x - r, y - r, r * 2, r * 2); }
    else if (!own && UI.sel === s.id) {
      const g = cx.createRadialGradient(x, y, ps * 0.3, x, y, ps * 0.95);
      g.addColorStop(0, 'rgba(255,240,170,0.75)'); g.addColorStop(1, 'rgba(255,200,80,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, ps * 0.95, 0, Math.PI * 2); cx.fill();
    }
    const im = !own && (look.pic || IMG[look.base]);
    if (im) { const z = ps * (look.scale || 1); cx.drawImage(im, x - z / 2, y - z / 2, z, z); }
    // satellites ring
    const sats = G.fleets.filter(f => f.star === s.id && f.sat && (f.owner === ME || visibleTo(s.id)));
    if (sats.length && !(own && T.ownRings)) { // (T.ownRings: drawStar drew them)
      cx.strokeStyle = T.satRing || (sats.some(f => f.owner === ME) ? 'rgba(120,230,255,0.9)' : 'rgba(255,120,200,0.9)');
      cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(x, y, ps * 0.62, ps * 0.62, 0, 0, Math.PI * 2); cx.stroke();
    }
    if (s.owner >= 0 && s.owner !== ME && HO.feature(G, 'alliances') && HO.isAllied(G, ME, s.owner) && HO.know(G, me(), s.id).explored && IMG.haloAlly) cx.drawImage(IMG.haloAlly, x - ps * 0.6, y + ps * 0.28, ps * 1.2, ps * 0.4);
    if (look.hat && IMG[look.hat]) { const h = ps * 1.18; cx.drawImage(IMG[look.hat], x - h / 2, y - h * 0.62, h, h * (IMG[look.hat].height / IMG[look.hat].width)); }
    // name
    if (!own && UI.view.s > 18) {
      cx.font = mapFont(Math.max(9, Math.min(12, UI.view.s / 3.6)));
      cx.textAlign = 'center'; cx.fillStyle = s.owner === ME ? '#fff6d0' : '#9aa3c7';
      cx.fillText(s.name, x, y + ps / 2 + 11);
    }
    drawDots(s, x, y, ps);
  }
  // in-transit dots
  for (const f of G.fleets) {
    if (f.owner !== ME || f.to == null) continue;
    const a = G.stars[f.from], b = G.stars[f.to], t = Math.min(1, f.prog / f.dist);
    const x = sx(a.x + (b.x - a.x) * t), y = sy(a.y + (b.y - a.y) * t);
    const w = 14, box = drawMarkers(f, x - w / 2, y - w / 2, w, 1);
    UI.dots.push({ x: box.x, y: y - w / 2, w: box.w, h: w, f: f.id, transit: true });
  }
  // dragging (a skin with T.fleetPath 'ios' draws iOS's route line instead,
  // over a star, and for a finger over empty space nothing: iosFleetPath)
  const iosPath = T.fleetPath === 'ios' && UI.drag && UI.drag.fleet != null && UI.drag.moved && (UI.hover != null || UI.drag.touch);
  if (iosPath) iosFleetPath(G.fleets.find(f => f.id === UI.drag.fleet), UI.hover);
  else if (UI.drag && UI.drag.fleet != null && UI.drag.moved) {
    const f = G.fleets.find(f => f.id === UI.drag.fleet);
    const a = G.stars[f.star];
    const tgt = UI.hover;
    let x2 = UI.drag.x, y2 = UI.drag.y;
    let ok = true, round = false;
    if (tgt != null && tgt !== f.star) {
      x2 = sx(G.stars[tgt].x); y2 = sy(G.stars[tgt].y);
      const d = HO.starDist(G, f.star, tgt); ok = d <= f.fuel + 1e-9; round = 2 * d <= f.fuel + 1e-9;
    }
    // T.dragRoute(cx, { x1, y1, x2, y2, ok, turns }): a skin's own line for a fleet being dragged
    // (the Amiga's double white line, its turns and its open chevrons)
    if (T.dragRoute) {
      const inReach = tgt != null && tgt !== f.star;
      T.dragRoute(cx, { x1: sx(a.x), y1: sy(a.y), x2, y2, ok: inReach && ok, turns: inReach ? Math.ceil(HO.starDist(G, f.star, tgt) / HO.fleetSpeed(G, f) - 1e-9) : null, round: inReach && ok && round });
      return;
    }
    cx.save();
    // too far, but a route through your colonies exists (modern): show it
    const route = !ok && tgt != null && tgt !== f.star && modern() && HO.feature(G, 'waypoints') && !f.sat ? findRoute(f, tgt) : null;
    if (route) {
      let p0 = a;
      for (const sid of route) { const b = G.stars[sid]; cx.strokeStyle = '#ffe066'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(sx(p0.x), sy(p0.y)); cx.lineTo(sx(b.x), sy(b.y)); cx.stroke(); arrowHead(sx(p0.x), sy(p0.y), sx(b.x), sy(b.y), '#ffe066'); p0 = b; }
      for (const sid of route.slice(0, -1)) { const b = G.stars[sid]; cx.strokeStyle = '#ffe066'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(sx(b.x), sy(b.y), planetPx() * 0.6, 0, Math.PI * 2); cx.stroke(); }
    }
    // a finger's drag: red when the fleet hasn't the fuel (iOS, FleetMovementMenu updateFleetPath:)
    cx.strokeStyle = ok ? '#ffe066' : UI.drag.touch ? '#e8402a' : '#8a8a8a'; cx.lineWidth = 2;
    if (!ok && !UI.drag.touch) cx.setLineDash([4, 5]);
    if (!route) { cx.beginPath(); cx.moveTo(sx(a.x), sy(a.y)); cx.lineTo(x2, y2); cx.stroke(); }
    cx.setLineDash([]);
    if (ok && tgt != null) { arrowHead(sx(a.x), sy(a.y), x2, y2, '#ffe066'); if (round) arrowHead(x2, y2, sx(a.x), sy(a.y), '#ffe066'); }
    if (tgt != null && tgt !== f.star) {
      const d = HO.starDist(G, f.star, tgt);
      const turns = Math.ceil(d / HO.fleetSpeed(G, f) - 1e-9);
      const via = !ok && modern() && HO.feature(G, 'waypoints') && !f.sat ? findRoute(f, tgt) : null;
      const label = ok ? tl(turns === 1 ? '%s away · %s turn' : '%s away · %s turns', d.toFixed(1), turns) : via ? tl(via.length === 2 ? 'Too far to fly straight: will go via %s stop' : 'Too far to fly straight: will go via %s stops', via.length - 1) : tl('Too far: %s away, fuel %s', d.toFixed(1), f.fuel.toFixed(1));
      cx.font = mapFont(12); cx.textAlign = 'left';
      const tw = cx.measureText(label).width;
      cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(x2 + 12, y2 - 24, tw + 10, 18);
      cx.fillStyle = ok ? '#ffe066' : '#ccc'; cx.fillText(label, x2 + 17, y2 - 11);
    }
    cx.restore();
  }
}
// iOS's line while a fleet is dragged (-[FleetMovementMenu updateFleetPath:]
// 0x1000c90d0, -[MapLayer updateFleetPath:fleet:] 0x10000f190, drawFleetPaths
// 0x10000e93c): the route finder's route (0x100036674, DeterminePath, flag 7:
// the ruleset's rs.route, else straight there within the fuel, else the
// remake's own route with modern conveniences) to the star under the finger,
// leg by leg, 2 points wide, white when the route can be flown, else one red
// leg straight there (0xff0000ff: "the red fleet line"); each leg labelled
// with its length in light years (addDistanceLabelWithFrom:withTo:
// withDistance: 0x10000f538: "%d" in white on the dark "supernovaed" disc at
// 220/255, to the side of the leg's middle). Over the fleet's own star or
// empty space there is none (the fleet's orders are drawn). Two remake
// choices: the route finder's "under 3 light years" (no line on iOS) is
// drawn as one white leg, and the labels keep one size whatever the zoom.
function iosFleetPath(f, tgt) {
  UI.lastPath = null;
  if (!f || tgt == null || tgt === f.star || f.star == null) return;
  const rs = HO.rules(G);
  let path = null, ok = true;
  if (HO.starDist(G, f.star, tgt) <= f.fuel + 1e-9) path = [tgt];
  else {
    path = rs.route ? rs.route(G, f, tgt) : modern() && HO.feature(G, 'waypoints') && !f.sat ? findRoute(f, tgt) : null;
    if (!path || !path.length) { path = [tgt]; ok = false; }
  }
  cx.save();
  cx.lineWidth = 2; cx.strokeStyle = ok ? '#ffffff' : '#ff0000';
  const legs = [];
  let a = G.stars[f.star];
  for (const sid of path) {
    const b = G.stars[sid];
    cx.beginPath(); cx.moveTo(sx(a.x), sy(a.y)); cx.lineTo(sx(b.x), sy(b.y)); cx.stroke();
    legs.push([a, b]); a = b;
  }
  const disc = IMG[(T.prefix || '') + 'supernovaed'];
  cx.font = mapFont(14, 'Arial, Helvetica, sans-serif'); cx.textAlign = 'center'; cx.textBaseline = 'middle';
  for (const [p, q] of legs) {
    const x1 = sx(p.x), y1 = sy(p.y), x2 = sx(q.x), y2 = sy(q.y);
    const lx = (x1 + x2) / 2 + ((x2 - x1) * (y2 - y1) <= 0 ? 10 : -22), ly = (y1 + y2) / 2 + 10;
    cx.globalAlpha = 220 / 255;
    if (disc && disc.width) cx.drawImage(disc, lx + 2 - 13, ly + 2 - 13, 26, 26);
    else { cx.fillStyle = '#000'; cx.beginPath(); cx.arc(lx + 2, ly + 2, 12, 0, Math.PI * 2); cx.fill(); }
    cx.globalAlpha = 1; cx.fillStyle = '#fff';
    cx.fillText(String(Math.round(HO.starDist(G, p.id, q.id))), lx, ly);
  }
  cx.restore();
  UI.lastPath = { fleet: f.id, to: tgt, stops: path.slice(), ok }; // for the test tools (HOVIEW)
}
function visibleTo(sid) {
  if (G.stars[sid].owner === ME) return true;
  return G.fleets.some(f => f.owner === ME && f.star === sid && f.to == null);
}
// Fleet markers (FUN_10091640): one small square per design in the fleet,
// side by side; the picture's column is the ship type and its row the
// number of ships (1, 2-10, 11-30, 31+). Your own markers come in four
// sets: plain, striped (the fleet is not fully fuelled, or a colony ship is
// empty), faded (that design's weapons are more than 3 levels behind
// yours) and both; everyone else's are pink.
function fleetMarkers(f) {
  const p = G.players[f.owner], mine = f.owner === ME;
  const low = !f.sat && f.fuel < HO.fleetMaxRange(G, f) - 1e-9;
  const keep = !HO.rules(G).colonyShipUsedUp;
  const out = [];
  for (const k of Object.keys(f.ships)) {
    const n = f.ships[k], d = HO.getDesign(G, f.owner, +k);
    if (!d || !(n > 0)) continue;
    let set = 4;
    if (mine) {
      set = 0;
      if (low || (keep && d.type === 'colony' && !(f.colonists > 0))) set += 1;
      if (p.tech && d.W + 3 < p.tech.weapons) set += 2;
    }
    out.push(IMG['dot' + set + '_' + HO.TYPES[d.type].dot + '_' + countBucket(n)]);
  }
  return out;
}
function drawMarkers(f, dx, dy, w, dir) {
  if (T.marker) { // the theme draws one picture per fleet
    const k = T.marker(f, f.owner === ME), im = k && IMG[k];
    if (im) cx.drawImage(im, dx, dy, w, w);
    if (im && UI.selFleet === f.id) { cx.strokeStyle = '#ffe066'; cx.lineWidth = 2; cx.strokeRect(dx - 1, dy - 1, w + 2, w + 2); }
    return { x: dx, w: im ? w : 0 };
  }
  const ims = fleetMarkers(f), n = Math.max(1, ims.length), span = n * w + (n - 1) * 2;
  const left = dir < 0 ? dx + w - span : dx;
  cx.fillStyle = UI.selFleet === f.id ? '#ffe066' : (f.owner === ME ? '#f4f7ff' : '#ffe3f1');
  cx.beginPath(); cx.roundRect(left - 2, dy - 2, span + 4, w + 4, 3); cx.fill();
  ims.forEach((im, i) => { if (im) cx.drawImage(im, dir < 0 ? dx - i * (w + 2) : dx + i * (w + 2), dy, w, w); });
  return { x: left, w: span };
}
function drawDots(s, x, y, ps) {
  const here = G.fleets.filter(f => f.star === s.id && f.to == null && (f.owner === ME || visibleTo(s.id)));
  if (!here.length) return;
  const w = Math.max(13, Math.min(18, ps * 0.36));
  let ri = 0, li = 0;
  for (const f of here) {
    const mine = f.owner === ME;
    if (T.marker && !T.marker(f, mine)) continue; // the theme doesn't show this fleet
    // T.markerAt(f, info): a skin places the marker itself ({x, y, w}; hidden:
    // only where a drag can pick it up; null: none), without the extras
    if (T.markerAt) {
      const m = T.markerAt(f, { s, x, y, ps, mine, view: UI.view });
      if (!m) continue;
      const im = !m.hidden && IMG[T.marker(f, mine)];
      if (im) cx.drawImage(im, m.x, m.y, m.w, m.w);
      UI.dots.push({ x: m.x, y: m.y, w: m.w, h: m.w, f: f.id, star: s.id, mine, sat: f.sat });
      continue;
    }
    let dx, dy, dir = 1;
    if (f.sat) { dx = x - ps / 2 - w - 1; dy = y - ps / 2 + li * (w + 2); li++; dir = -1; }
    else { dx = x + ps / 2 + 1; dy = y - ps / 2 + ri * (w + 2); ri++; }
    const box = drawMarkers(f, dx, dy, w, dir);
    if (f.dest != null && mine) { cx.fillStyle = '#ffe066'; cx.fillRect(box.x + box.w - 4, dy, 4, 4); }
    UI.dots.push({ x: box.x, y: dy, w: box.w, h: w, f: f.id, star: s.id, mine, sat: f.sat });
  }
}
function drawRoute(a, b, speed, color, frac, round) {
  const x1 = sx(a.x), y1 = sy(a.y), x2 = sx(b.x), y2 = sy(b.y);
  cx.strokeStyle = color; cx.lineWidth = 1.6; cx.globalAlpha = 0.85;
  cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
  arrowHead(x1, y1, x2, y2, color);
  if (round) arrowHead(x2, y2, x1, y1, color);
  // turn ticks (trip length in the ruleset's own distance units)
  const d = a.id != null && b.id != null ? HO.starDist(G, a.id, b.id) : Math.hypot(b.x - a.x, b.y - a.y);
  for (let t = speed; t < d - 1e-6; t += speed) {
    const fx = x1 + (x2 - x1) * t / d, fy = y1 + (y2 - y1) * t / d;
    cx.fillStyle = color; cx.beginPath(); cx.arc(fx, fy, 2.4, 0, Math.PI * 2); cx.fill();
  }
  cx.globalAlpha = 1;
}
function arrowHead(x1, y1, x2, y2, color) {
  const a = Math.atan2(y2 - y1, x2 - x1), back = planetPx() * 0.55, L = 9;
  const tx = x2 - Math.cos(a) * back, ty = y2 - Math.sin(a) * back;
  cx.fillStyle = color; cx.beginPath(); cx.moveTo(tx, ty);
  cx.lineTo(tx - Math.cos(a - 0.45) * L, ty - Math.sin(a - 0.45) * L);
  cx.lineTo(tx - Math.cos(a + 0.45) * L, ty - Math.sin(a + 0.45) * L); cx.closePath(); cx.fill();
}

// ---------- pointer ----------
function onDown(e) {
  if (!G) return;
  cv.setPointerCapture(e.pointerId);
  const px = ox(e), py = oy(e);
  const dot = dotAt(px, py);
  if (dot && dot.mine && !dot.sat && !dot.transit && !G.over) {
    UI.drag = { fleet: dot.f, x: px, y: py, sx: px, sy: py, moved: false, t: performance.now() };
    UI.selFleet = dot.f; UI.sel = dot.star; renderPanel(); draw();
    return;
  }
  if (dot) { UI.selFleet = dot.f; const f = G.fleets.find(f => f.id === dot.f); if (f && f.star != null) UI.sel = f.star; renderPanel(); draw(); return; }
  UI.drag = { pan: true, x: px, y: py, sx: px, sy: py, ox: UI.view.ox, oy: UI.view.oy, moved: false };
}
function onMove(e) {
  if (!G) return;
  const px = ox(e), py = oy(e);
  const d = UI.drag;
  if (!d) { const s = starAt(px, py); cv.style.cursor = dotAt(px, py) ? 'grab' : s != null ? 'pointer' : 'default'; return; }
  if (Math.hypot(px - d.sx, py - d.sy) > 4) d.moved = true;
  d.x = px; d.y = py;
  if (d.pan) { if (d.moved) { UI.view.ox = d.ox + (px - d.sx); UI.view.oy = d.oy + (py - d.sy); draw(); } return; }
  const h = starAt(px, py);
  if (h !== UI.hover) { UI.hover = h; dragTick(d.fleet, h); }
  draw();
}
// rs.dragTick (iOS 1.2.5 and later, Android; -[FleetMovementMenu updateFleetPath:] 0x1000c90d0): each
// new star the dragged fleet is over, other than its own, plays Sounds item 16, "Next Message" (7001)
function dragTick(fid, s) {
  const k = HO.rules(G).dragTick, f = G.fleets.find(x => x.id === fid);
  if (k && s != null && f && s !== f.star) Sound.play(k);
}
function onUp(e) {
  const d = UI.drag; UI.drag = null;
  if (!G || !d) return;
  const px = ox(e), py = oy(e);
  if (d.pan) {
    if (!d.moved && UI.route) { routeStop(starAt(px, py)); return; }
    if (!d.moved) { const s = starAt(px, py); UI.sel = s; UI.selFleet = null; renderPanel(); draw(); }
    return;
  }
  const f = G.fleets.find(f => f.id === d.fleet);
  if (!f) return;
  const tgt = starAt(px, py);
  if (!d.moved) {
    if (performance.now() - d.t > 700 && f.dest != null) { HO.cancelMove(G, f); Sound.play(4000); }
    draw(); renderPanel(); return;
  }
  if (scrapBlocks(f) && tgt != null && tgt !== f.star) { toast(scrapWords('heap')); HO.cancelMove(G, f); Sound.play(4000); } // (FollowPathDrag @1516d8-151702: the alert, no path, sound 4000)
  else if (tgt == null || tgt === f.star) { if (f.dest != null) { HO.cancelMove(G, f); Sound.play(4000); } }
  else if (HO.orderMove(G, f, tgt)) Sound.play(4001);
  else if (autoRoute(f, tgt)) Sound.play(4001);
  else { Sound.play(7016); if (HO.rules(G).fuelAlert === '505') fuelAlert(HO.say(G, HO.DATA.alerts[29]), 'ho5.fuelAlert505'); else toast(outOfRange(f, tgt)); }
  UI.hover = null; draw(); renderPanel(); save();
}
// Plan route…: a clicked (or tapped) star is the next stop
function routeStop(s) {
  const f = G.fleets.find(x => x.id === UI.route.fleet);
  if (s == null || !f) return;
  const prev = UI.route.stops.length ? UI.route.stops[UI.route.stops.length - 1] : f.star;
  if (s !== prev) { if (HO.starDist(G, prev, s) <= HO.fleetMaxRange(G, f)) UI.route.stops.push(s); else toast(`${G.stars[s].name} is too far for one hop.`); }
  renderRouteBar(); draw();
}
function onDbl(e) {
  if (!G) return;
  const s = starAt(ox(e), oy(e));
  if (s == null) return;
  if (G.stars[s].owner === ME) openBuild(s);
  else { const b = [...G.battles].reverse().find(b => b.star === s && b.sides.includes(ME)); if (b) openBattle(b.id); }
}

// ---------- touch: iOS 1.2.9's gestures, in every skin ----------
// Whenever a finger is used (a pointer event's pointerType 'touch'), the map,
// the fleet lists, the budget bars and the scrolling lists do what the iOS
// game (Spaceward Ho! 1.2.9 for iPhone and iPad, 2012) does with a finger,
// whatever the skin; a mouse and a pen keep the remake's own behaviour, so a
// hybrid laptop has both. Every number is the iOS game's (docs/ios-findings.md,
// "Touch controls"); distances are in points, a CSS pixel here. A gesture
// whose command the ruleset hasn't got is skipped (the satellite's long hold
// needs rs.flagScrap). The long press that explains a control (hover help,
// below) is kept, and given up when the finger moves.
const isTouch = (e) => !!e && e.pointerType === 'touch';
let lastPointer = 'mouse'; // the last pointer pressed anywhere: a double click or a context menu made by a finger is ignored
document.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType || 'mouse'; }, true);
const TOUCH = {
  TAP: 15,          // a lift after less than this much movement is a tap (CCLayerPanZoom maxTouchDistanceToClick)
  FAR: 5,           // a step from the selected star longer than this is a drag ("moved far", StarNode); here also the whole way
  SLIDE: 30,        // a list follows the finger once it has moved this far (CCMenuAdvanced minimumTouchLengthToSlide)
  HOLD: 500,        // the satellite's long hold, and the selected star's single tap waits this long to deselect (ms)
  DOUBLE: 400, DOUBLE_AT: 30, // two taps this quick and this close are a double tap (iOS's tapCount is UIKit's own, not the game's: the remake's choice)
  KEEP: 6, RECENT: 200, THROW: 0.5, THROW_MS: 3000, // the throw (InertialScroller): last 6 touches, those of the last 0.2 s, speed x 0.5, over 3 s
  PICK: 2200, PICK_MAX: 32768, // a tap picks the nearest star with squared distance <= planetScale x 2,200 and < 32,768 (pickStar:, map units)
};
// the iOS fuel alert (Alert String 30), once (the app state's bit at +0x298)
const FUEL_ALERT = 'Sorry, but that fleet doesn’t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.';
// map scale 1.0 is 40 points to a galaxy unit (the map's content is the
// galaxy's extent x 40 points); a phone zooms to 1.5, a tablet to 2.0 (the
// iPad flag), and out only to the scale that shows the whole galaxy
// iOS's iPad flag is the device's idiom (+[GraphicDefines setup]:
// userInterfaceIdiom == pad); a browser can't ask, so a screen whose short
// side is 600 points or more counts as a tablet (every iPad has 768 or more,
// every iPhone 430 or less: the remake's choice of line between them)
const isTablet = () => Math.min(window.innerWidth, window.innerHeight) >= 600;
// The planets' scale (-[MapLayer setScale:]): zoomed in past 1.0 (iPhone) or
// 1.7 (iPad), or 0.1 past the smallest scale if that is larger, a planet is
// drawn 2.0 (iPhone) or 3.0 (iPad) times its map size whatever the zoom;
// below that, from 0.2 (0.6) at the smallest scale up to it, in a line. The
// map's scale 1.0 is 40 points to a galaxy unit (UI.view.s / 40); a
// planet's scale is this over the map's. What a tap picks and the selected
// star's square grow and shrink with it.
function planetTarget() {
  const pad = isTablet(), s = UI.view.s / 40, lo = Math.min(fitScale(), UI.view.s) / 40;
  let thr = pad ? 1.7 : 1.0;
  if (lo >= thr) thr = lo + 0.1;
  return s >= thr ? (pad ? 3 : 2) : (pad ? 0.6 : 0.2) + (pad ? 2.4 : 1.8) / (thr - lo) * (s - lo);
}
const fitScale = () => G && mapW ? Math.min((mapW - 60) / G.W, (mapH - 90) / G.H) : UI.view.s;
const zoomRange = () => { const lo = Math.min(fitScale(), UI.view.s), hi = Math.max(40 * (isTablet() ? 2 : 1.5), lo); return [lo, hi]; };
// no rubber band: the galaxy (with the fit's margin) never leaves the map:
// when it is wider than the map it covers it, else it stays inside it
function clampView() {
  if (!G) return;
  const v = UI.view, ax = (o, len, view) => len <= view ? Math.min(Math.max(o, 0), view - len) : Math.min(0, Math.max(o, view - len));
  v.ox = ax(v.ox - 30, G.W * v.s + 60, mapW) + 30;
  v.oy = ax(v.oy - 30, G.H * v.s + 60, mapH) + 30;
}
// the star a tap picks (-[MapLayer pickStar:]): the nearest whose squared
// distance in map units (40 to a galaxy unit at scale 1.0) is at most the
// planets' scale x 2,200 and under 32,768, not one gone supernova; on the
// screen that is sqrt(2,200 x planetTarget() x map scale) points
function pickStar(px, py) {
  const k = UI.view.s / 40, t = planetTarget();
  const r = Math.min(Math.sqrt(TOUCH.PICK * t / k), Math.sqrt(TOUCH.PICK_MAX)) * k;
  let best = null, bd = r * r;
  for (const s of G.stars) {
    const b = ourStarLook(s.id).base; if (b === 'nova12' || b === 'nova18') continue;
    const d = (sx(s.x) - px) ** 2 + (sy(s.y) - py) ** 2;
    if (d <= bd) { bd = d; best = s.id; }
  }
  return best;
}
// only the selected star takes touches of its own: an 80 x 80 square about
// it (StarNode ourTouch:, -40 to +40 in the star's own units, which the
// planets' scale sizes), so 40 x planetTarget() points each way; where the
// galaxy is crowded, a touch nearer another star is the map's (the remake's
// choice: a far-out map would otherwise hide the selected star's
// neighbours under its square)
function onSelected(px, py) {
  if (!G || UI.sel == null || !G.stars[UI.sel]) return false;
  const s = G.stars[UI.sel], h = 40 * planetTarget();
  if (Math.abs(sx(s.x) - px) > h || Math.abs(sy(s.y) - py) > h) return false;
  const n = pickStar(px, py);
  return n == null || n === UI.sel;
}
// the double-tap count, as iOS's tapCount: a tap soon after another, near it
function tapCount(x, y, where) {
  const now = performance.now(), l = Touch.lastTap;
  const n = l && l.where === where && now - l.t < TOUCH.DOUBLE && Math.hypot(x - l.x, y - l.y) < TOUCH.DOUBLE_AT ? l.n + 1 : 1;
  Touch.lastTap = { x, y, t: now, n, where };
  return n;
}
// Double tap on the selected star (-[MapLayer showBuildShips]): Build Ships
// at your colony; elsewhere, the replay of a battle you were in there
function starDoubleTap(sid) {
  if (sid == null) return;
  if (G.stars[sid].owner === ME && !G.over) { openBuild(sid); return; }
  const b = [...G.battles].reverse().find(b => b.star === sid && b.sides.includes(ME));
  if (b) openBattle(b.id);
}
const Touch = {
  pts: new Map(), mode: null, lastTap: null, fling: 0, deselect: 0,
  stopFling() { if (this.fling) cancelAnimationFrame(this.fling); this.fling = 0; },
  // the map (CCLayerPanZoom in "sheet" mode: one finger pans, two pinch)
  mapDown(e) {
    if (!G) return;
    this.stopFling(); tipHide();
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    const x = ox(e), y = oy(e);
    this.pts.set(e.pointerId, { x, y });
    if (this.pts.size === 2) { // a pinch is never a tap
      const [a, b] = [...this.pts.values()], v = UI.view, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      this.mode = 'pinch'; this.d0 = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)); this.s0 = v.s;
      this.wx = (mx - v.ox) / v.s; this.wy = (my - v.oy) / v.s;
      if (UI.ruler) { UI.ruler = null; draw(); }
      return;
    }
    if (this.pts.size > 2) return;
    this.dist = 0; this.last = { x, y }; this.hist = [{ x, y, t: performance.now() }];
    if (!UI.route && onSelected(x, y)) { // StarNode ccTouchBegan: cancels a pending single tap
      clearTimeout(this.deselect); this.mode = 'star'; this.far = false; this.rulerTo = null;
    } else this.mode = 'pan';
  },
  mapMove(e) {
    if (!G || !this.pts.has(e.pointerId)) return;
    const x = ox(e), y = oy(e), p = this.pts.get(e.pointerId);
    p.x = x; p.y = y;
    if (this.mode === 'pinch') {
      if (this.pts.size < 2) return;
      const [a, b] = [...this.pts.values()], v = UI.view, [lo, hi] = zoomRange();
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const pf = Math.hypot(a.x - b.x, a.y - b.y) / this.d0;
      v.s = T.zoomTo ? T.zoomTo(this.s0, pf) : Math.max(lo, Math.min(hi, this.s0 * pf));
      v.ox = mx - this.wx * v.s; v.oy = my - this.wy * v.s; // about the fingers' midpoint, panning with it
      clampView(); draw(); return;
    }
    const dx = x - this.last.x, dy = y - this.last.y, step = Math.hypot(dx, dy);
    this.last = { x, y }; this.dist += step;
    if (this.mode === 'pan') {
      UI.view.ox += dx; UI.view.oy += dy; clampView();
      this.hist.push({ x, y, t: performance.now() }); if (this.hist.length > TOUCH.KEEP) this.hist.shift();
      draw();
    } else if (this.mode === 'star') { // the map stays; a ruler to the star under the finger
      if (step > TOUCH.FAR || Math.hypot(x - this.hist[0].x, y - this.hist[0].y) > TOUCH.FAR) this.far = true; // (a slow drag too: the remake's)
      if (!this.far) return;
      const s = pickStar(x, y);
      if (s !== this.rulerTo) { this.rulerTo = s; UI.ruler = s != null && s !== UI.sel ? { from: UI.sel, to: s } : null; draw(); }
    }
  },
  mapUp(e) {
    if (!G || !this.pts.has(e.pointerId)) return;
    const x = ox(e), y = oy(e), mode = this.mode;
    this.pts.delete(e.pointerId);
    if (mode === 'pinch') { // the finger left goes on panning, never a tap
      this.lastTap = null;
      if (this.pts.size === 1) { const r = [...this.pts.values()][0]; this.mode = 'pan'; this.dist = Infinity; this.last = { x: r.x, y: r.y }; this.hist = [{ x: r.x, y: r.y, t: performance.now() }]; }
      else if (!this.pts.size) this.mode = null;
      return;
    }
    if (this.pts.size) return;
    this.mode = null;
    if (mode === 'pan') {
      if (this.dist < TOUCH.TAP) this.mapTap(x, y, tapCount(x, y, 'map'));
      else { this.lastTap = null; this.throw(); } // a touch that moved breaks a run of taps (UIKit's tapCount)
    } else if (mode === 'star') {
      if (UI.ruler) { UI.ruler = null; draw(); }
      if (this.far) { this.lastTap = null; return; }
      if (tapCount(x, y, 'map') === 2) { clearTimeout(this.deselect); starDoubleTap(UI.sel); return; }
      const sid = UI.sel; // a single tap deselects the star after 0.5 s, unless a second tap comes first
      this.deselect = setTimeout(guard(() => { if (G && UI.sel === sid) { UI.sel = null; UI.selFleet = null; renderPanel(); draw(); } }), TOUCH.HOLD);
    }
  },
  mapCancel(e) { this.pts.delete(e.pointerId); if (!this.pts.size) this.mode = null; if (UI.ruler) { UI.ruler = null; draw(); } },
  // a tap (-[MapLayer layerPanZoom:clickedAtPoint:tapCount:]): a star near it
  // becomes the selected one and the map doesn't move; a tap away from the
  // stars, or a double tap, does nothing
  mapTap(x, y, n) {
    if (UI.route) { routeStop(pickStar(x, y)); return; } // Plan route…: the remake's own, by tap as by click
    if (n === 2) return;
    const s = pickStar(x, y);
    if (s == null) return;
    clearTimeout(this.deselect);
    UI.sel = s; UI.selFleet = null; renderPanel(); draw();
  },
  // the throw (InertialScroller touchEnded:node:)
  throw() {
    const now = performance.now(), h = this.hist.filter(p => now - p.t <= TOUCH.RECENT);
    if (h.length < 2) return;
    const a = h[0], b = h[h.length - 1], d = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= 5) return;
    const dt = (b.t - a.t) / 1000, k = dt > 0 ? TOUCH.THROW / dt : 5;
    const cw = G.W * UI.view.s / 2, ch = G.H * UI.view.s / 2;
    const mx = Math.max(-cw, Math.min(cw, (b.x - a.x) * k)), my = Math.max(-ch, Math.min(ch, (b.y - a.y) * k));
    const t0 = performance.now();
    let done = 0;
    const step = () => {
      if (!G) { this.fling = 0; return; }
      const t = Math.min(1, (performance.now() - t0) / TOUCH.THROW_MS), f = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); // CCEaseExponentialOut
      UI.view.ox += mx * (f - done); UI.view.oy += my * (f - done); done = f;
      clampView(); draw();
      this.fling = t < 1 ? requestAnimationFrame(step) : 0;
    };
    this.fling = requestAnimationFrame(step);
  },
};
// The planet panel's lists, the windows' lists and the menus (CCMenuAdvanced,
// CCScrollLayer): a finger on an item doesn't scroll at once; once it has
// moved 30 points the list follows it (and the item isn't chosen), and keeps
// going a little when let go. In the fleets at a star, a fleet of yours dragged
// out of the list is picked up and dropped on a star to send it
// (FleetMovementMenu); a double tap on the list opens the fleet's Split (the
// remake's Organize Fleets); holding one of your satellites for 0.5 s marks it
// for scrapping or unmarks it (SatelliteMenu), with a ruleset that marks.
const SLIDERS = '#panel, .wbody, .dropdown, .lb, .starmenu';
const List = { t: null };
document.addEventListener('pointerdown', guard((e) => {
  if (!isTouch(e) || !e.isPrimary) return;
  List.stopSpin();
  const box = e.target.closest && e.target.closest(SLIDERS);
  if (!box || e.target.closest('.track, input[type=range], input[type=text], input[type=number], input:not([type]), textarea, select')) { List.t = null; return; }
  const row = e.target.closest('.frow'), f = row && G && G.fleets.find(x => x.id === +row.dataset.fleet);
  const t = List.t = { x: e.clientX, y: e.clientY, box, scroller: scrollerOf(e.target), mode: null, hist: [], row, f: null, sat: null, fleets: row && row.closest('.fleets') };
  if (f && f.owner === ME && !G.over && !row.dataset.inbound) {
    if (!f.sat) t.f = f;
    else if (marksScrap()) t.hold = setTimeout(guard(() => { if (List.t === t && !t.mode) { t.mode = 'held'; toggleScrapFleet(f); } }), TOUCH.HOLD);
  }
}));
document.addEventListener('pointermove', guard((e) => {
  const t = List.t;
  if (!isTouch(e) || !t || !e.isPrimary) return;
  const dx = e.clientX - t.x, dy = e.clientY - t.y;
  if (Math.hypot(dx, dy) > 10) { clearTimeout(Tip.timer); clearTimeout(t.hold); }
  if (t.mode === 'drag') { List.dragTo(e.clientX, e.clientY); return; }
  if (t.mode === 'held') return;
  if ((!t.mode || t.mode === 'slide') && t.f && t.fleets) { // out of the fleet list (sliding it or not): picked up
    const r = t.fleets.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { List.pickUp(t, e.clientX, e.clientY); return; }
  }
  if (!t.mode && Math.hypot(dx, dy) >= TOUCH.SLIDE && t.scroller) { t.mode = 'slide'; t.y0 = e.clientY; t.x0 = e.clientX; t.st = t.scroller.scrollTop; t.sl = t.scroller.scrollLeft; tipHide(); }
  if (t.mode === 'slide') {
    t.scroller.scrollTop = t.st - (e.clientY - t.y0);
    if (t.scroller.scrollWidth > t.scroller.clientWidth) t.scroller.scrollLeft = t.sl - (e.clientX - t.x0);
    t.hist.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (t.hist.length > TOUCH.KEEP) t.hist.shift();
  }
}));
const listEnd = guard((e) => {
  const t = List.t;
  if (!isTouch(e) || !t || !e.isPrimary) return;
  List.t = null; clearTimeout(t.hold);
  if (t.mode === 'drag') { List.drop(e.type === 'pointerup' ? e : null); List.noClick(); return; }
  if (t.mode === 'held') { List.noClick(); return; }
  if (t.mode === 'slide') { List.noClick(); if (e.type === 'pointerup') { if (t.fleets) List.fling(t); else List.spin(t); } return; }
  // a double tap on the fleets at a star (tapCount 2 in FleetMovementMenu):
  // Organize Fleets (+[OrganizeFleetsLayer dialog]) with a ruleset that has
  // it, else that fleet's Split
  if (e.type === 'pointerup' && t.fleets && tapCount(e.clientX, e.clientY, 'fleets') === 2) {
    const at = document.elementFromPoint(e.clientX, e.clientY), row = at && at.closest('.frow');
    const f = row && G && G.fleets.find(x => x.id === +row.dataset.fleet);
    const sid = f ? f.star : UI.sel;
    if (organizeStyle() && sid != null && !(row && row.dataset.inbound)) { List.noClick(); openOrganize(sid); }
    else if (f && f.owner === ME && !f.sat && !G.over && !row.dataset.inbound && HO.fleetCount(f) > 1) { List.noClick(); openSplit(f); }
  }
});
document.addEventListener('pointerup', listEnd);
document.addEventListener('pointercancel', listEnd);
// after a slide, a drag or a hold, the lift chooses nothing
document.addEventListener('click', (e) => { if (List.quiet && performance.now() - List.quiet < 400) { e.stopPropagation(); e.preventDefault(); List.quiet = 0; } }, true);
Object.assign(List, {
  noClick() { this.quiet = performance.now(); },
  // the throw after a slide (CCScrollLayer: half the last step's speed, x 0.95 every 0.02 s)
  spin(t) {
    const now = performance.now(), h = t.hist.filter(p => now - p.t <= TOUCH.RECENT);
    if (h.length < 2) return;
    let v = (h[h.length - 1].y - h[0].y) / Math.max(1, h[h.length - 1].t - h[0].t) * 20 / 2; // points per 0.02 s tick
    const sc = t.scroller, tick = () => { sc.scrollTop -= v; v *= 0.95; if (Math.abs(v) > 0.3) this.spinT = setTimeout(tick, 20); };
    this.spinT = setTimeout(tick, 20);
  },
  // the fleet list's own throw (FleetMovementMenu is a CCInertialMenu, whose
  // InertialScroller is the map's: the touches of the last 0.2 s, if they
  // cover more than 5 points, carry the list on by half their speed, at most
  // half its length, easing out over 3 s; a new touch stops it)
  fling(t) {
    const now = performance.now(), h = t.hist.filter(p => now - p.t <= TOUCH.RECENT);
    if (h.length < 2) return;
    let path = 0; for (let i = 1; i < h.length; i++) path += Math.hypot(h[i].x - h[i - 1].x, h[i].y - h[i - 1].y);
    if (path <= 5) return;
    const a = h[0], b = h[h.length - 1], dt = (b.t - a.t) / 1000, k = dt > 0 ? TOUCH.THROW / dt : 5;
    const sc = t.scroller, half = sc.scrollHeight / 2, my = Math.max(-half, Math.min(half, -(b.y - a.y) * k));
    const y0 = sc.scrollTop, t0 = performance.now();
    const step = () => {
      const u = Math.min(1, (performance.now() - t0) / TOUCH.THROW_MS), f = u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); // CCEaseExponentialOut
      sc.scrollTop = y0 + my * f;
      this.flingT = u < 1 ? requestAnimationFrame(step) : 0;
    };
    this.flingT = requestAnimationFrame(step);
  },
  stopSpin() { clearTimeout(this.spinT); if (this.flingT) cancelAnimationFrame(this.flingT); this.flingT = 0; },
  // picked up (-[FleetMovementMenu ccTouchMoved:withEvent:]): the ship
  // follows the finger, drawn above it so the finger doesn't hide it
  pickUp(t, x, y) {
    t.mode = 'drag'; tipHide();
    const d = HO.fleetDesigns(G, t.f)[0];
    t.sprite = d ? shipImgEl(d, 30, t.f.owner) : el('span');
    t.sprite.classList.add('touchdrag');
    document.body.append(t.sprite);
    UI.selFleet = t.f.id; UI.sel = t.f.star;
    UI.drag = { fleet: t.f.id, x: 0, y: 0, moved: true, touch: true };
    // fleetDraggingChanged: 1: the planet's buttons hide (PlanetButtons
    // fleetDragging: 0x1000c3e10), and on an iPad the star's information
    // (StarInfoLayer fleetDragging: 0x10001a000, only with the iPad flag)
    document.documentElement.classList.add('fleetdrag');
    document.documentElement.classList.toggle('fleetdrag-pad', isTablet());
    this.dragTo(x, y);
  },
  // the route to the star under the finger, with the "Next Message" sound for
  // every new star other than the fleet's own (updateFleetPath:)
  dragTo(x, y) {
    const t = this.t; if (!t || !UI.drag) return;
    t.sprite.style.left = x + 'px'; t.sprite.style.top = (y - (t.sprite.offsetHeight || 30) - 8) + 'px';
    const r = cv.getBoundingClientRect(), px = (x - r.left) / mapPx()[0], py = (y - r.top) / mapPx()[1];
    const inMap = px >= 0 && py >= 0 && px <= mapW && py <= mapH;
    const s = inMap ? pickStar(px, py) : null;
    UI.drag.x = px; UI.drag.y = py;
    if (s !== UI.hover) { UI.hover = s; dragTick(t.f.id, s); }
    draw();
  },
  // dropped (-[FleetMovementMenu ccTouchEnded:withEvent:], moveFleet): on a
  // star, the fleet is sent there; back on its own star, it stays; over empty
  // space, nothing
  drop(e) {
    const t = this.t || {}, f = UI.drag && G && G.fleets.find(x => x.id === UI.drag.fleet), tgt = e ? UI.hover : null;
    document.querySelectorAll('.touchdrag').forEach(n => n.remove());
    document.documentElement.classList.remove('fleetdrag', 'fleetdrag-pad'); // fleetDraggingChanged: 0
    UI.drag = null; UI.hover = null;
    if (f && tgt != null) {
      if (scrapBlocks(f) && tgt !== f.star) { toast(scrapWords('heap')); HO.cancelMove(G, f); Sound.play(4000); }
      else if (tgt === f.star) { if (f.dest != null) { HO.cancelMove(G, f); Sound.play(4000); } }
      else if (HO.orderMove(G, f, tgt)) Sound.play(4001);
      else if (autoRoute(f, tgt)) Sound.play(4001);
      else { Sound.play(7016); fuelAlert(); }
      save();
    }
    renderPanel(); draw();
  },
});
List.t = null;
// rs.fuelAlert '505' (FUN_1008c5f0: Alert String 30, shown once, then the drag just gives no orders;
// the preference bit 1 at +0x290): the mouse drag shows it the first time and says nothing after
function fuelAlert(text, key) {
  key = key || 'ho5.fuelAlert';
  let seen = false; try { seen = localStorage.getItem(key) === '1'; localStorage.setItem(key, '1'); } catch (e) {}
  if (!seen) modal('Not enough fuel', el('div', null, el('p', null, text || FUEL_ALERT), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))), { cls: 'small alert' });
}
// the nearest box that scrolls (else the page)
function scrollerOf(n) {
  for (let e = n; e && e !== document.body; e = e.parentElement) {
    const st = getComputedStyle(e);
    if (/(auto|scroll)/.test(st.overflowY + st.overflowX) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) return e;
  }
  return document.scrollingElement;
}

// ---------- left panel ----------
// A bar chart (budget, technology). Rule controls follow the ruleset, never
// the skin: opts.scale is the ruleset's scale for this kind of bar
// (HO.barScale: rs.barScale, engine BAR_SCALES), used for drawing it and for
// where a mouse, a pen or a finger puts it; opts.locked is the ruleset's
// rs.barLocked answer for it: its words, drawn in the bar's place, and
// whether it can be dragged (`free`), a click opening Dip Into Savings
// (`dip`) or doing nothing (`silent`) instead of the beep. A finger stays on
// the bar's row while it drags (HoBarLayer ccTouchMoved:, iOS).
// opts.vertical: the bar stands up (the Amiga's Technik Ausgaben), filled
// from the bottom, and the pointer's height sets it.
function bar(label, val, max, onSet, opts) {
  opts = opts || {};
  const sc = opts.scale || HO.BAR_SCALES.linear, lk = opts.locked || null, refuse = !!lk && !lk.free;
  const track = el('div', { class: 'track' + (lk ? ' locked' : '') + (opts.vertical ? ' vert' : ''), 'aria-orientation': opts.vertical ? 'vertical' : null, role: 'slider', tabindex: 0, 'aria-label': label, 'aria-valuenow': Math.round(val / max * 100), 'aria-disabled': refuse ? 'true' : null, title: lk && lk.text ? lk.text : null });
  const fill = el('div', { class: 'fill' + (opts.cls ? ' ' + opts.cls : '') });
  fill._vert = !!opts.vertical;
  track._v = max > 0 ? Math.min(1, val / max) : 0;
  setFill(fill, track._v, sc);
  track.append(fill);
  // 5.0.5's grid (FUN_1008aff0): ten lines at 100 ... 1,000 per mille on the bar's scale,
  // each a black tick 3 pixels long at the top, the rest of the line a faint blend
  // opts.grid is the ruleset's rs.barGrid: n lines, tick pixels long; line: faint through the bar;
  // above: the older versions' ticks sit on the heading strip's rule (2 pixels above the first bar), none through the bars;
  // color: the line drawn solid in that colour, tech: the technology bars too (the Palm's)
  if (opts.grid) { const g = opts.grid; for (let k = 1; k <= g.n; k++) track.append(el('i', { class: 'grid' + (g.line ? '' : ' tickonly') + (g.above ? ' above' : ''), style: `left:${barWidth(k / g.n, sc)};--tick:${g.tick}px` + (g.color ? `;background:${g.color}` : '') })); }
  if (lk && lk.text) track.append(el('span', { class: 'locktext' }, lk.text));
  const set = (ev) => {
    const r = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, opts.vertical ? (r.bottom - ev.clientY) / r.height : (ev.clientX - r.left) / r.width));
    const f = sc.toValue(x) / 1000;
    track._v = f; setFill(fill, f, sc);
    onSet(f, false);
  };
  // a locked bar refuses the drag: the version's beep (5.0.5 SysBeep, 3.0.1
  // and 4.0.5 PlaySound / MessageBeep), or Dip Into Savings, or nothing
  const refused = () => { if (lk.dip) openDip(); else if (!lk.silent) beep(); };
  track.addEventListener('pointerdown', guard((ev) => {
    if (refuse) { refused(); return; }
    track.setPointerCapture(ev.pointerId); set(ev); track._drag = true;
  }));
  track.addEventListener('pointermove', guard((ev) => {
    if (!track._drag) return;
    if (isTouch(ev) && !opts.vertical) { const r = track.parentElement.getBoundingClientRect(); if (ev.clientY < r.top || ev.clientY > r.bottom) return; }
    set(ev);
  }));
  track.addEventListener('pointerup', guard((ev) => { if (!track._drag) return; track._drag = false; onSet(null, true); }));
  track.addEventListener('pointercancel', guard((ev) => { if (track._drag) { track._drag = false; onSet(null, true); } }));
  track.addEventListener('keydown', (ev) => {
    const up = ev.key === 'ArrowRight' || ev.key === 'ArrowUp';
    if (!up && ev.key !== 'ArrowLeft' && ev.key !== 'ArrowDown') return;
    ev.preventDefault();
    if (refuse) { refused(); return; }
    // a step of 5% of the bar's length, on its own scale
    const x = Math.max(0, Math.min(1, sc.toX((track._v || 0) * 1000) + (up ? 0.05 : -0.05)));
    const f = sc.toValue(x) / 1000;
    track._v = f; setFill(fill, f, sc); onSet(f, false); onSet(null, true);
  });
  return el('div', { class: 'barrow' + (opts.rowCls ? ' ' + opts.rowCls : ''), 'data-help': opts.help || null },
    el('span', { class: 'blabel', title: opts.title || label }, label),
    track,
    el('span', { class: 'bval' }, opts.right || ''));
}
// a share's length on the bar's scale (engine BAR_SCALES: the log scale's
// GetHPercBarAmt, or the share itself)
const barWidth = (f, sc) => (sc || HO.BAR_SCALES.linear).toX(f * 1000) * 100 + '%';
// a bar's fill: its width, or its height when the bar stands up
const setFill = (fill, f, sc) => { if (fill.parentElement && fill.parentElement.classList.contains('vert') || fill._vert) fill.style.height = barWidth(f, sc); else fill.style.width = barWidth(f, sc); };
// The budget bars' scale switch (rs.barScale.toggle: Mac 1.2 to 3.0.1, DOS
// 2.0): a click on the strip above the bars flips the setup's scale, kept
// with the player's other settings (the original kept it in its setup file),
// one for each ruleset.
const barPickKey = () => 'ho5.barScale.' + G.rules;
function barPick() { try { return localStorage.getItem(barPickKey()); } catch (e) { return null; } }
function flipBarScale() {
  const now = HO.barScale(G, 'budget', barPick()).id;
  try { localStorage.setItem(barPickKey(), now === 'log' ? 'linear' : 'log'); } catch (e) {}
  renderPanel();
}
// the system beep a locked bar gives (no sound file: a short square wave)
let beepCtx = null;
function beep() {
  if (!Sound.on) return;
  try {
    beepCtx = beepCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = beepCtx.createOscillator(), g = beepCtx.createGain();
    o.type = 'square'; o.frequency.value = 880; g.gain.value = 0.06;
    o.connect(g); g.connect(beepCtx.destination); o.start(); o.stop(beepCtx.currentTime + 0.12);
  } catch (e) {}
}
// proportional budget setter: entries [{key, get, set}]
function setShare(entries, idx, f) {
  // f is the new fraction (0..1) for entries[idx]; others scale to fill 1-f
  const others = entries.filter((_, i) => i !== idx);
  const otot = others.reduce((a, e) => a + e.get(), 0);
  entries[idx].set(f);
  for (const e of others) e.set(otot > 0 ? e.get() / otot * (1 - f) : (1 - f) / others.length);
}
// A ruleset may drag the budget bars its own way: rs.dragShare(G, player,
// slot, newPerMille), where slot is 'tech', 'savings' or a colony's star id
// and newPerMille the dragged bar's new share (0-1000, whole). It is called
// with the shares as they were when the drag began (so the result depends
// only on where the bar is), and either returns the new shares in per mille,
// { tech, savings, col: { [starId]: pm } } (any left out stay as they are),
// or sets player.budget itself (shares as fractions of 1) and returns
// nothing. With it, the bars are not scaled to add up to exactly 1 (the
// rules keep whole per mille, and a total near 1,000 is left alone). 2.0:
// the others move in proportion, with a floor of 0 (FUN_1010_1303 sets every
// slot's least share to 0 for the drag; FUN_1010_179a); 1.2: the same
// (DoHBarClick @c1002). Only a new colony's first share uses the least-share
// floor, and not in a drag. Without it, the others are scaled in proportion.
function dragBudget(p, key, f, start) {
  const b = p.budget, o = JSON.parse(start);
  b.tech = o.tech; b.savings = o.savings; b.col = o.col;
  const r = HO.rules(G).dragShare(G, p, key, Math.max(0, Math.min(1000, Math.round(f * 1000))));
  if (!r) return;
  if (r.tech != null) b.tech = r.tech / 1000;
  if (r.savings != null) b.savings = r.savings / 1000;
  for (const k in r.col || {}) b.col[k] = r.col[k] / 1000;
}
function budgetEntries() {
  const p = me(), b = p.budget;
  const norm = () => { let t = b.tech + b.savings; for (const k in b.col) t += b.col[k]; return t || 1; };
  const n = HO.rules(G).dragShare ? 1 : norm();
  if (n !== 1) { b.tech /= n; b.savings /= n; for (const k in b.col) b.col[k] /= n; }
  const list = [
    { key: 'tech', label: 'Tech', get: () => b.tech, set: (v) => b.tech = v },
    { key: 'savings', label: 'Savings', get: () => b.savings, set: (v) => b.savings = v },
  ];
  for (const s of HO.colonies(G, ME)) list.push({ key: s.id, label: s.name, star: s.id, get: () => b.col[s.id] || 0, set: (v) => b.col[s.id] = v });
  return list;
}
function renderPanel() {
  if (!G) return;
  syncLang();
  const p = me();
  const panel = $('#panel');
  const scroll = panel.scrollTop;
  panel.innerHTML = '';
  $('#title').textContent = `${p.name} in ${G.opts.galaxy || 'Milky Way'} in ${G.year}${titleTag()}`;
  // budget info
  const pr = HO.projected(G, p);
  const net = pr.net;
  panel.append(el('section', { class: 'box info' },
    row('Savings', panelFig('savings', p.savings, true), p.savings < 0 ? 'neg' : '', 'savings'),
    row('Income', panelFig('income', pr.income, true) + (HO.rules(G).interestShort ? ` (Int: $${HO.rules(G).interestShort(pr.interest)})` : ''), pr.income < 0 ? 'neg' : '', 'income'),
    pr.interest && !HO.rules(G).interestShort ? row(pr.interest > 0 ? 'Interest' : 'Interest owed', money(pr.interest), pr.interest < 0 ? 'neg' : '', 'interest') : null,
    row('Metal', panelFig('metal', p.metal, false), '', 'metal'),
  ));
  // budget bars
  const ents = budgetEntries();
  const spendable = Math.max(0, net);
  // the scales are the ruleset's (rs.barScale); where it has the switch, a
  // click on the heading (the strip above the bars) flips the budget bars'
  const rsB = HO.rules(G), bsc = HO.barScale(G, 'budget', barPick()), tsc = HO.barScale(G, 'tech');
  const flip = rsB.barScale && rsB.barScale.toggle;
  const bb = el('section', { class: 'box' }, el('h3', flip ? { 'data-help': 'budget', class: 'scaleflip', role: 'button', tabindex: 0, title: bsc.id === 'log' ? 'Click to show the bars on a linear scale' : 'Click to show the bars on a logarithmic scale',
    onclick: flipBarScale, onkeydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); flipBarScale(); } } } : { 'data-help': 'budget' }, 'Budget'));
  const own = HO.rules(G).dragShare;
  let start = null; // the shares when the drag began (own drag rule)
  // a colony losing money has the row class "loss" (2.0.1 drew its bar 50% grey: js/skins/mac2)
  ents.forEach((e, i) => {
    const s = e.star != null ? G.stars[e.star] : null;
    const amt = e.get() * spendable;
    bb.append(bar(e.label, e.get(), 1, (f, end) => {
      if (f != null && own) { if (!start) start = JSON.stringify(p.budget); dragBudget(p, e.key, f, start); }
      else if (f != null) setShare(ents, i, f);
      if (f != null) { ents.forEach((x, j) => { const r = bb.querySelectorAll('.barrow')[j]; if (r) { r.querySelector('.track')._v = x.get(); setFill(r.querySelector('.fill'), x.get(), bsc); r.querySelector('.bval').textContent = money(x.get() * spendable); } }); }
      if (end) { start = null; renderPanel(); save(); }
    }, { scale: bsc, grid: rsB.barGrid && T.barGrid !== false && (!rsB.barGrid.above || i === 0) ? rsB.barGrid : null, locked: rsB.barLocked ? rsB.barLocked(G, p, e.key) : null, right: money(amt), cls: e.key === 'tech' ? 'tech' : e.key === 'savings' ? 'sav' : 'col', rowCls: (s && UI.sel === s.id ? 'hl' : '') + (s && HO.planetIncome(G, p, s) < 0 ? ' loss' : ''), help: e.key === 'tech' ? 'tech' : e.key === 'savings' ? 'savingsBar' : 'colonyBar' }));
  });
  if (net <= 0) bb.append(el('p', { class: 'warn' }, 'After supporting your colonies and paying interest, there is nothing left to spend.'));
  panel.append(bb);
  // tech bars
  const tb = el('section', { class: 'box' }, el('h3', { 'data-help': 'tech' }, 'Technology'));
  const techSpend = spendable * p.budget.tech;
  const tents = HO.TECHS.filter(k => !(k === 'radical' && HO.feature(G, 'noRadical'))).map(k => ({ key: k, get: () => p.talloc[k], set: (v) => p.talloc[k] = v }));
  // rs.dragTech (the Palm: per mille like the budget bars): the shares are kept as they stand
  // (a total of 1,000 per mille is 1), not scaled to add up to 1 whatever happens
  const tdrag = HO.rules(G).dragTech; let tstart = null;
  let tt = tents.reduce((a, e) => a + e.get(), 0) || 1; if (tdrag) tt = tt > 2 ? 1000 : 1; tents.forEach(e => e.set(e.get() / tt));
  const tnames = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Mini', radical: 'Radical' };
  tents.forEach((e, i) => {
    const lvl = e.key === 'radical' ? '' : p.tech[e.key];
    // the level's name in the version's own characters (rs.msgText: iOS shows "ª" for "™", patch-aware)
    const nm0 = e.key !== 'radical' ? (HO.DATA.techNames[e.key] || [])[p.tech[e.key] - 1] : null, nm = nm0 && HO.rules(G).msgText ? HO.rules(G).msgText(G, nm0) : nm0;
    tb.append(bar(`${tnames[e.key]}${lvl !== '' ? ' ' + lvl : ''}`, e.get(), 1, (f, end) => {
      if (f != null && tdrag) { if (!tstart) tstart = JSON.stringify(p.talloc); Object.assign(p.talloc, JSON.parse(tstart)); tdrag(G, p, e.key, Math.max(0, Math.min(1000, Math.round(f * 1000)))); }
      else if (f != null) setShare(tents, i, f);
      if (f != null) { tents.forEach((x, j) => { const r = tb.querySelectorAll('.barrow')[j]; if (r) { r.querySelector('.track')._v = x.get(); setFill(r.querySelector('.fill'), x.get(), tsc); } }); }
      if (end) { tstart = null; renderPanel(); save(); }
    }, { vertical: T.techBars === 'vertical', scale: tsc, grid: rsB.barGrid && rsB.barGrid.tech && T.barGrid !== false ? rsB.barGrid : null, right: money(e.get() * techSpend), cls: 'tbar', title: nm && !/^\d+$/.test(nm) ? nm : tnames[e.key], help: e.key }));
  });
  panel.append(tb);
  // planet
  const pb = UI.sel != null ? planetBox(UI.sel) : null;
  if (pb) panel.append(pb);
  fitBars(bb); fitBars(tb);
  // T.panel: a skin lays these out its own way (the Amiga's windows), its
  // controls being these same ones
  if (T.panel) T.panel(panel, { info: panel.querySelector('.box.info'), budget: bb, tech: tb, planet: pb, ents, tents });
  panel.scrollTop = scroll;
}
// Widen a box's bar labels and amounts to fit their text (long colony
// names, amounts in the hundreds of millions, a skin's wider type): the
// label column grows to at most 42% of the box (beyond that it ends in "…",
// with the whole name on hover), the amount column to the widest amount.
function fitBars(box) {
  const rows = box.querySelectorAll('.barrow');
  let lw = 0, vw = 0;
  rows.forEach(r => { lw = Math.max(lw, r.querySelector('.blabel').scrollWidth); vw = Math.max(vw, r.querySelector('.bval').scrollWidth); });
  if (!rows.length || !box.clientWidth) return;
  box.style.setProperty('--blabel', Math.min(Math.max(82, Math.ceil(lw) + 1), Math.floor(box.clientWidth * 0.42)) + 'px');
  box.style.setProperty('--bval', Math.max(70, Math.ceil(vw) + 1) + 'px');
}
function row(k, v, cls, help) { return el('div', { class: 'kv ' + (cls || ''), 'data-help': help || null }, el('span', null, k), el('b', null, v)); }
function planetBox(sid) {
  const p = me(), s = G.stars[sid], k = HO.know(G, p, sid);
  const look = starLook(sid);
  const box = el('section', { class: 'box planet' });
  const pic = el('div', { class: 'ppic' });
  pic.append(el('img', { src: look.pic ? look.pic.toDataURL() : A.img[look.base], alt: '' }));
  if (look.hat) pic.append(el('img', { src: A.img[look.hat], class: 'phat', alt: '' }));
  const ownerName = s.owner === ME ? 'You' : k.explored && k.owner >= 0 && k.owner !== ME ? G.players[k.owner].name : k.explored ? 'No one' : 'Unknown';
  box.append(el('div', { class: 'phead' }, pic, el('div', null, el('h3', null, s.name), el('div', { class: 'sub' }, ownerName + (k.explored && s.owner !== ME && k.seen >= 0 && k.seen < G.turn ? ` (seen ${2000 + k.seen * 10})` : '')))));
  if (s.owner === ME || k.explored) {
    const src = s.owner === ME ? s : k;
    const gs = src.g / p.homeG, ts = 72 + (src.t - p.homeT);
    box.append(row('Gravity', gs.toFixed(2) + 'G' + classNote(gs), '', 'gravity'), row('Temp', degF(ts), '', 'temp'), row('Metal', panelFig('planetMetal', src.metal, false), '', 'planetMetal'));
    if (s.owner === ME) {
      const inc = HO.planetIncome(G, p, s);
      box.append(row('Population', fmt(s.pop * 1e6), '', 'population'), row('Max population', fmt(HO.maxPop(G, p, s) * 1e6), '', 'maxPop'), row('Income', panelFig('planetIncome', inc, true), inc < 0 ? 'neg' : '', 'planetIncome'));
      const terraOK = Math.abs(HO.seenT(p, s) - 72) > 0.5, metalOK = s.metal > 0;
      // in 2.0 and 1.2 a finished part's share is wasted, not passed on, so
      // the bar stays (as in 2.0's planet window) and a note says so
      const wasted = HO.rules(G).finishedPartWasted;
      if ((terraOK && metalOK) || (wasted && (terraOK || metalOK))) {
        // a balance, not an amount: the colony's money is split between
        // terraforming (left, green) and mining (right, rust). The handle
        // sits at the split; the more green, the more terraforming.
        const pct = () => Math.round(s.terra * 100);
        const lt = el('span', { class: 'tmv' }), rt = el('span', { class: 'tmv' });
        const inp = el('input', { type: 'range', min: 0, max: 100, value: pct(), 'aria-label': 'Split between terraforming and mining',
          oninput: (ev) => { s.terra = ev.target.value / 100; show(); }, onchange: save });
        const waste = el('p', { class: 'note' });
        const show = () => {
          inp.style.setProperty('--split', pct() + '%'); lt.textContent = pct() + '%'; rt.textContent = (100 - pct()) + '%'; inp.setAttribute('aria-valuetext', `${pct()}% terraforming, ${100 - pct()}% mining`);
          // only when money is actually going to the finished part
          waste.textContent = !terraOK && pct() > 0 ? 'Fully terraformed: money on terraforming is wasted. Move the bar to Mine.'
            : !metalOK && pct() < 100 ? 'No metal left: money on mining is wasted. Move the bar to Terraform.' : '';
          waste.hidden = !waste.textContent;
        };
        show();
        box.append(el('div', { class: 'tm', 'data-help': 'terraMine' }, el('span', { class: 'tml' }, 'Terraform ', lt), inp, el('span', { class: 'tmr' }, rt, ' Mine')));
        box.append(waste);
      } else if (wasted) box.append(el('p', { class: 'note' }, 'Fully terraformed and mined out. Money spent here on terraforming or mining is wasted.'));
      else box.append(el('p', { class: 'note' }, !terraOK && !metalOK ? 'Fully terraformed and mined out. Its budget goes to savings.' : !terraOK ? 'Fully terraformed; its budget goes to mining.' : 'No metal left; its budget goes to terraforming.'));
      if (HO.feature(G, 'buildQueue')) box.append(yardBox(s));
      box.append(el('div', { class: 'btns' },
        el('button', { onclick: () => openBuild(sid), 'data-help': 'build' }, HO.feature(G, 'buildQueue') ? 'Queue ships…' : 'Build ships…'),
        evacuateHere(s) ? el('button', { class: 'quiet', 'data-help': 'evacuate', onclick: () => evacuateClick(sid) }, evacuateLabel(sid, 'Evacuate')) : null,
        HO.rules(G).evacuateToggle && HO.rules(G).evacuateToggle.marked(G, sid) ? el('span', { class: 'note' }, 'Evacuating') : null));
    } else if (k.owner >= 0 && k.owner !== ME) {
      box.append(row('Population', k.pop ? '~' + fmt(k.pop * 1e6) : '?'));
    }
  } else box.append(el('p', { class: 'note' }, k.battleOnly ? 'Unexplored, but there has been a battle here.' : 'Unexplored. Send a ship to find out more.'));
  // fleets here
  const here = G.fleets.filter(f => f.star === sid && f.to == null && (f.owner === ME || visibleTo(sid)));
  const inbound = G.fleets.filter(f => f.owner === ME && f.to === sid);
  if (here.length || inbound.length) {
    const fl = el('div', { class: 'fleets' }, el('h4', null, 'Ships here'));
    for (const f of fleetOrder(here)) fl.append(fleetRow(f));
    for (const f of fleetOrder(inbound)) fl.append(fleetRow(f, true));
    box.append(fl);
    const mine = fleetOrder(here.filter(f => f.owner === ME && !f.sat));
    const mergeable = mine.some((a, i) => mine.some((b, j) => j > i && HO.canMerge(G, a, b)));
    if (mergeable) box.append(el('div', { class: 'btns' }, el('button', { class: 'quiet', onclick: () => {
      // merge each fleet into the first one it may join (one ship type per fleet under the DOS rules)
      for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++)
        if (G.fleets.includes(mine[i]) && G.fleets.includes(mine[j]) && HO.canMerge(G, mine[i], mine[j])) HO.mergeFleets(G, mine[i], mine[j]);
      UI.selFleet = mine[0].id; renderPanel(); draw(); save(); } }, HO.feature(G, 'singleTypeFleets') ? 'Merge fleets of the same type' : 'Merge all fleets here'),
      organizeStyle() ? el('button', { class: 'quiet', onclick: () => openOrganize(sid) }, organizeName()) : null));
    else if (mine.length && organizeStyle()) box.append(el('div', { class: 'btns' }, el('button', { class: 'quiet', onclick: () => openOrganize(sid) }, organizeName())));
  }
  const bs = lastBattles(sid);
  if (bs.length) box.append(el('div', { class: 'btns' }, ...bs.map(b => el('button', { class: 'quiet', onclick: () => openBattle(b.id) }, `Review ${battleName(b)}`))));
  return box;
}
// Scrapping by marks (rs.flagScrap(G, fleet, how), rs.flagScrapDesign(G,
// player, design, how): Mac 3.0.1). The Scrap commands put a mark on a fleet
// or a ship type, or take it off ('command'), and the ruleset scraps what is
// marked at End Turn. f.scrap301 / d.scrap301 is the mark: the fleet's row,
// the fleet list and the type lists show it (class "scrap", in each skin's
// style). A ruleset without the hooks scraps at once (HO.scrapFleet,
// HO.scrapDesign). The words are 3.0.1's: the Ships menu's "Scrap Current
// Fleet" / "Don't Scrap Current Fleet" (STR# 1010.9-10, SetMenuItems
// @f4878/@f488a) and the Ship Types window's "Scrap All" / "Don't Scrap"
// (SetButtonStates @132cca-132ce0).
const marksScrap = () => !!(G && HO.rules(G).flagScrap);
const marksScrapDesign = () => !!(G && HO.rules(G).flagScrapDesign);
const SCRAP_FLEET = ['Scrap Current Fleet', 'Don’t Scrap Current Fleet'];
const SCRAP_TYPE = ['Scrap All', 'Don’t Scrap'];
// (STR# 4001.22: FollowPathDrag @1516d8 gives a marked fleet no orders)
const SCRAP_HEAP = 'Sorry, but you have that fleet marked for the scrap heap. It’s not going anywhere!';
// rs.scrapWords: a ruleset's own words for these ({ fleet: [mark, unmark],
// type: [...], heap: the alert when a marked fleet is given orders }; 5.0.5:
// "Dismantle Current Fleet" / "Don't Dismantle Current Fleet", its Ships
// menu's string list; 4.0.5: "Scrap Current Fleet" both ways, and its own
// alert, string 518)
const scrapWords = (k) => (G && (HO.rules(G).scrapWords || {})[k]) || (k === 'type' ? SCRAP_TYPE : k === 'heap' ? SCRAP_HEAP : SCRAP_FLEET);
const MARKED_FLEET = 'Fleet to be scrapped for metal.'; // (STR# 4000.12, DrawSelectedFleetInfo @155826; rs.scrapWords.marked: a version's own)
const markedLine = () => (G && (HO.rules(G).scrapWords || {}).marked) || MARKED_FLEET;
// a fleet marked for scrapping can't be given orders (3.0.1's FollowPathDrag
// alert), unless the ruleset says it can (rs.scrapMarkedMoves: 2.0)
const scrapBlocks = (f) => !!(f && f.scrap301 && marksScrap() && !HO.rules(G).scrapMarkedMoves);
// Scrap Current Fleet (ScrapCurrentFleet @133a24): sound 7003 when the mark
// was off; a fleet bought this turn is given back instead (it is gone)
// (rs.scrapSound false: 2.0 marks in silence, FUN_10f0_0000, Mac ScrapCurrentFleet)
function toggleScrapFleet(f) {
  const was = !!f.scrap301;
  HO.rules(G).flagScrap(G, f, 'command');
  if (!was && HO.rules(G).scrapSound !== false) Sound.play(7003);
  if (!G.fleets.includes(f)) { UI.selFleet = null; toast('Purchase undone.'); }
  renderPanel(); draw(); save();
}
function curFleet() { const f = UI.selFleet != null && G.fleets.find(x => x.id === UI.selFleet); return f && f.owner === ME ? f : null; }
// rs.fleetList(G, player): the order a ruleset keeps a player's fleets in
// (3.0.1: by class, NewFleet @130004). Your fleets at a star (DrawFleetRect
// @1551a0), the fleet list and Next fleet follow it; others' come after, as
// they were.
function fleetOrder(list) {
  const rs = G && HO.rules(G);
  if (!rs || !rs.fleetList) return list;
  const at = new Map(rs.fleetList(G, me()).map((f, i) => [f.id, i]));
  const k = (f) => at.has(f.id) ? at.get(f.id) : Infinity;
  return list.slice().sort((a, b) => k(a) - k(b) || 0);
}
function classNote(gs) { const c = HO.planetClass(G, gs); return c === 'inhospitable' ? ' · never profitable' : c === 'semi' ? ' · barely habitable' : ''; }
function fleetRow(f, inbound) {
  const mine = f.owner === ME;
  const p = G.players[f.owner];
  const ds = HO.fleetDesigns(G, f);
  const sel = UI.selFleet === f.id;
  const marked = mine && !!f.scrap301;
  const r = el('div', { class: 'frow' + (sel ? ' sel' : '') + (mine ? '' : ' enemy') + (marked ? ' scrap' : ''), 'data-fleet': f.id, 'data-inbound': inbound ? '1' : null, onclick: () => { UI.selFleet = f.id; renderPanel(); draw(); } });
  const pics = el('div', { class: 'fpics' });
  ds.slice(0, 3).forEach(d => pics.append(shipImgEl(d, 18)));
  r.append(pics);
  const parts = Object.keys(f.ships).map(k => { const d = HO.getDesign(G, f.owner, +k); return `${f.ships[k]} ${f.ships[k] === 1 ? d.name : d.name}`; });
  let status = '';
  if (inbound) status = `arriving in ${Math.ceil((f.dist - f.prog) / HO.fleetSpeed(G, f))} turn(s)`;
  else if (!mine) status = p.name;
  else if (f.sat) status = 'satellites';
  else status = (f.dest != null ? `→ ${G.stars[f.dest].name}` : 'holding') + ` · fuel ${f.fuel.toFixed(1)}/${HO.fleetMaxRange(G, f)} · speed ${HO.fleetSpeed(G, f)}`;
  if (marked) status = markedLine() + (inbound ? ` · ${status}` : '');
  r.append(el('div', { class: 'ftext' }, el('div', null, parts.join(', ')), el('div', { class: 'sub' }, status)));
  // (3.0.1 scraps satellites as any other fleet: Scrap Current Fleet)
  if (sel && mine && !inbound && f.sat && marksScrap())
    r.append(el('div', { class: 'facts' }, el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); toggleScrapFleet(f); } }, scrapWords('fleet')[marked ? 1 : 0])));
  if (sel && mine && !inbound && !f.sat) {
    const acts = el('div', { class: 'facts' });
    if (f.dest != null) acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); HO.cancelMove(G, f); Sound.play(4000); renderPanel(); draw(); } }, 'Stay here'));
    if (HO.fleetCount(f) > 1) acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); openSplit(f); } }, 'Split…'));
    if (HO.feature(G, 'waypoints')) acts.append(el('button', { class: 'quiet', 'data-help': 'route', onclick: (e) => { e.stopPropagation(); startRoute(f); } }, 'Plan route…'));
    if (HO.feature(G, 'stances')) acts.append(el('select', { 'aria-label': 'Battle stance', onclick: (e) => e.stopPropagation(), onchange: (e) => { f.stance = e.target.value; save(); } },
      ...[['normal', 'Normal'], ['offensive', 'Offensive'], ['defensive', 'Defensive']].map(([v, t]) => el('option', { value: v, selected: (f.stance || 'normal') === v ? 'selected' : false }, t))));
    if (HO.feature(G, 'lateArrival')) acts.append(el('label', { class: 'chk', onclick: (e) => e.stopPropagation() }, el('input', { type: 'checkbox', checked: f.delayed ? 'checked' : false, onchange: (e) => { f.delayed = e.target.checked; save(); } }), el('span', null, 'Arrive late')));
    if (marksScrap()) acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); toggleScrapFleet(f); } }, scrapWords('fleet')[marked ? 1 : 0]));
    else acts.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); confirmBox(`Scrap this fleet for ${Math.round(HO.TYPES ? 75 : 75)}% of its metal?`, () => { const m = HO.scrapFleet(G, f); Sound.play(7003); toast(`Scrapped for ${fmt(m)} metal.`); UI.selFleet = null; renderPanel(); draw(); save(); }); } }, 'Scrap'));
    r.append(acts);
  }
  if (sel && mine && inbound && marksScrap()) // marked in hyperspace: its metal falls on the next star at End Turn
    r.append(el('div', { class: 'facts' }, el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); toggleScrapFleet(f); } }, scrapWords('fleet')[marked ? 1 : 0])));
  else if (sel && mine && inbound && HO.rules(G).scrapInSpace) {
    r.append(el('div', { class: 'facts' }, el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); confirmBox('Dismantle this fleet in hyperspace? Its metal will rain down on its destination as a meteor shower.', () => { HO.scrapFleet(G, f); Sound.play(7003); UI.selFleet = null; renderPanel(); draw(); save(); }); } }, 'Dismantle in hyperspace')));
  }
  if (mine && f.path && f.path.length) r.querySelector('.sub').append(' · then ' + f.path.map(x => G.stars[x].name).join(' → '));
  return r;
}
// multi-star route: click stars in order, then Done
function startRoute(f) {
  if (scrapBlocks(f)) { Sound.play(4000); toast(scrapWords('heap')); return; }
  UI.route = { fleet: f.id, stops: [] };
  toast('Click the stars to visit in order, then press Done.');
  renderRouteBar();
}
function renderRouteBar() {
  let bar = $('#routebar');
  if (!UI.route) { if (bar) bar.remove(); return; }
  if (!bar) { bar = el('div', { id: 'routebar', class: 'card' }); $('#mapwrap').append(bar); }
  const f = G.fleets.find(x => x.id === UI.route.fleet);
  bar.innerHTML = '';
  bar.append(el('span', null, 'Route: ' + (UI.route.stops.length ? UI.route.stops.map(x => G.stars[x].name).join(' → ') : 'click stars…')),
    el('button', { onclick: () => { if (f && UI.route.stops.length && HO.orderPath(G, f, UI.route.stops)) Sound.play(4001); else if (UI.route.stops.length) toast('The first stop is out of range.'); UI.route = null; renderRouteBar(); renderPanel(); draw(); save(); } }, 'Done'),
    el('button', { class: 'quiet', onclick: () => { UI.route = null; renderRouteBar(); draw(); } }, 'Cancel'));
}

// ---------- messages ----------
// Each report line in the original comes with its own picture and sound
// (HO.DATA.reportLook). A message whose text starts like one of those lines
// gets that line's picture and sound; longer lines are tried first so
// "has run out of metal. You should probably evacuate it." wins over
// "has run out of metal."
let LOOKS = null;
function originalLook(m) {
  if (!LOOKS) {
    const R = HO.DATA.reports || [], L = HO.DATA.reportLook || [];
    const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    LOOKS = R.map((t, i) => ({ i, len: t.length, look: L[i],
      re: new RegExp('^' + t.split(/(%(?:\.\*|\d*\.?\d*)?[sd]|%%)/).map((x, j) => j % 2 ? (x === '%%' ? '%' : '(.*?)') : esc(x)).join('')) }))
      .filter(o => o.look && o.len > 8).sort((a, b) => b.len - a.len);
  }
  const t = String(m.text || '');
  const hit = LOOKS.find(o => o.re.test(t));
  if (!hit) return null;
  let [pic, snd] = hit.look;
  const id = 1000 + hit.i;
  if (snd === 'explore') snd = m.explore === 'good' ? 6000 : m.explore === 'mediocre' ? 6002 : 6001;
  if (snd === 'elim') { const who = G.players.find(q => t.startsWith(q.name + ' ')); snd = who && HO.isBuddy(G, ME, who.id) ? 2001 : 7021; }
  let icon;
  if (pic === 'tech') { const k = ['Range', 'Speed', 'Weapons', 'Shield', 'Miniaturization'].findIndex(n => t.includes(' ' + n + ' ')); icon = k >= 0 ? 'm' + (9039 + k) : m.icon; }
  else if (pic === 'face') icon = m.icon;
  else icon = pic >= 0 ? 'm' + (9000 + pic) : null;
  return { id, icon: icon && A.img[icon] ? icon : m.icon, sound: snd };
}
function showMessages() {
  UI.inbox = me().inbox.slice(); UI.msgIdx = 0;
  // Show Event Messages off (rs.options): the reports are only in the Report Window
  const O = verOpts(), PW = G && HO.rules(G).prefsWindow;
  if (((O && O.showMessages) || (PW && PW.show) || T.showMsgsPref) && Prefs.showMsgs === false) UI.msgIdx = UI.inbox.length;
  renderMsg();
}
// T.afterMsg(box, ctx): a skin dresses the report card or the End Turn
// button after they are drawn (the Amiga's "--mehr--")
function renderMsg() {
  renderMsg0();
  if (T.afterMsg) T.afterMsg($('#msg'), { inbox: UI.inbox, idx: UI.msgIdx, G });
}
function renderMsg0() {
  const box = $('#msg');
  box.innerHTML = '';
  if (G.over && UI.msgIdx >= UI.inbox.length) {
    box.append(el('div', { class: 'card end' }, el('img', { src: A.img[G.winner === ME ? 'p3030' : 'p3040'], alt: '' }),
      el('div', null, el('p', null, G.winner === ME ? 'You conquered the galaxy.' : 'The game is over.'),
        winPending() ? el('button', { onclick: () => openWinWindows(renderMsg) }, youWonWords() && !G.conqueredSeen ? 'You won…' : 'Name a star…') : null, ' ',
        el('button', { onclick: newGameDialog }, 'New game'), ' ',
        el('button', { class: 'quiet', onclick: () => openFeedback('game') }, 'Tell us how it went'))));
    maybeHallOffer();
    return;
  }
  if (UI.msgIdx < UI.inbox.length) {
    const m = UI.inbox[UI.msgIdx];
    if (Prefs.important && m.quiet && !m.battle && UI.msgIdx < UI.inbox.length - 1) { UI.msgIdx++; return renderMsg(); }
    const look = originalLook(m);
    let sound = look ? look.sound : m.sound, icon = look ? look.icon : m.icon;
    if (T.messageLook) { const t = T.messageLook(m, { icon, sound }, { G, ME, starLook }); if (t) { icon = t.icon; if (ownSounds()) sound = t.sound; } }
    if (sound) Sound.play(sound);
    if (prefReview() && m.battle && !m._reviewed) { m._reviewed = true; setTimeout(() => openBattle(m.battle), 50); }
    const card = el('div', { class: 'card', tabindex: 0, role: 'button', 'aria-label': 'Next message' });
    const big = m.big || (m.jpg != null ? 'jpg' : null);
    if (m.jpg != null) card.append(el('img', { class: 'jpg', src: A.jpg[m.jpg], alt: '' }));
    else if (icon && A.img[icon]) card.append(el('img', { class: m.big ? 'bigicon' : 'icon', src: A.img[icon], alt: '' }));
    // in the game's language (engine.js say; the report is kept in the version's own words)
    const body = el('div', { class: 'mtext' }, el('p', null, degText(HO.say(G, m.text))));
    const extra = el('div', { class: 'mbtns' });
    if (m.battle) extra.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); openBattle(m.battle); } }, 'Review battle'));
    // the radical hand opens from its report (rs.radicalHand)
    if (radicalReport(m) && HO.rules(G).radicalHand && !G.over) extra.append(el('button', { class: 'quiet', onclick: (e) => { e.stopPropagation(); openRadicalHand(); } }, 'Radical projects…'));
    // rs.messageEvacuate (the Palm's Message History): a message about one of your colonies has an Evacuate button
    const ME2 = HO.rules(G).messageEvacuate;
    if (ME2 && m.star != null && !G.over && G.stars[m.star].owner === ME) extra.append(el('button', { class: 'quiet', style: 'float:right', onclick: (e) => { e.stopPropagation(); evacuateClick(m.star, ME2); renderMsg(); } }, ME2.words[ME2.marked(G, m.star) ? 1 : 0]));
    body.append(extra, el('div', { class: 'count' }, `${UI.msgIdx + 1} of ${UI.inbox.length} · click to continue`));
    card.append(body);
    const next0 = () => { if (m.star != null) { UI.sel = m.star; renderPanel(); } UI.msgIdx++; Sound.play(7001); renderMsg(); draw(); };
    // the winner's report has opened the version's win windows as it came up (below); a Next that finds them still pending opens them
    const next = () => winReport(m) && winPending() ? openWinWindows(next0) : next0();
    card.addEventListener('click', guard(next));
    card.addEventListener('keydown', guard((e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } }));
    if (m.star != null) { UI.sel = m.star; if (modern()) centerOn(m.star); renderPanel(); draw(); }
    box.append(card);
    card.focus({ preventScroll: true });
    // the winner's report opens the version's You Won window as it comes up, then the rank window and Name a Star (rs.youWon)
    if (winReport(m) && winPending() && !UI.modal) openWinWindows(() => { if (card.isConnected) card.focus({ preventScroll: true }); });
    // the eliminated player's report opens the version's You Lost window as it comes up (rs.youLost)
    if (lostReport(m) && !m.lostSeen && !UI.modal) { m.lostSeen = true; save(); openYouLost(() => { if (card.isConnected) card.focus({ preventScroll: true }); }); }
    return;
  }
  // online: once this player's orders are in (or they have no turn), who the turn waits for
  if (G.online && (ONL.sent || !onlineCanMove()) && !G.over) { box.append(waitingCard()); maybeHallOffer(); return; }
  if (T.endTurnPic && A.img[T.endTurnPic]) { // the theme's own End Turn button picture
    const btn = el('button', { class: 'clock pic', onclick: doEndTurn, 'aria-label': 'End turn', 'aria-keyshortcuts': 'T', 'data-help': 'endTurn', 'data-key': END_KEY() }, el('img', { src: A.img[T.endTurnPic], alt: '' }));
    // T.endTurnYear [x, y, w, h, picture width]: the picture's window where
    // the original writes the year (4.0: p5500's black window, the Windows
    // 4.0.5's clock); placed in percent, so it follows the picture's size
    const Y = T.endTurnYear;
    if (Y) {
      const im = IMG[T.endTurnPic], H = (im && im.height) || Y[4];
      btn.append(el('span', { class: 'clockyear', 'aria-hidden': 'true', style: `left:${Y[0] / Y[4] * 100}%;top:${Y[1] / H * 100}%;width:${Y[2] / Y[4] * 100}%;height:${Y[3] / H * 100}%` }, String(G.year)));
    }
    box.append(btn); clockTime(); maybeHallOffer();
    return;
  }
  const clock = el('button', { class: 'clock', onclick: doEndTurn, 'aria-label': 'End turn', 'aria-keyshortcuts': 'T', 'data-help': 'endTurn', 'data-key': END_KEY() },
    el('span', { class: 'face', html: '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#fffef6" stroke="#222" stroke-width="2.5"/><path d="M20 20V8M20 20l8 5" stroke="#222" stroke-width="3" stroke-linecap="round"/></svg>' }),
    el('span', null, 'End turn'));
  box.append(clock); clockTime(); maybeHallOffer();
}
// ---------- ranks and master points ----------
// The original keeps a record of your wins. Each win in an Original-rules
// game earns master points from its difficulty (3 to the power of
// (difficulty - 30) / 10), and enough points raise your rank. The 25 rank
// pictures are assets/explore/01.jpg to 25.jpg.
function profile() {
  try { return Object.assign({ points: 0, games: [] }, JSON.parse(localStorage.getItem('ho5.profile') || '{}')); } catch (e) { return { points: 0, games: [] }; }
}
function rankOf(points) { const R = HO.DATA.ranks || []; let i = 0; while (i + 1 < R.length && points >= R[i + 1][1]) i++; return i; }
// The rulesets with 5.0.5's ranks: a difficulty rating and master points,
// and no rank table of their own (rs.RANKS: 4.0.5's ten ranks, shown by its
// rs.hall below). Original (5.0.5) and Palm OS 5 (the same code); 1.2, 2.0,
// 3.0.1 and the Claude rules have no ranks.
const hasRanks = (g) => { const rs = HO.rules(g); return !!(rs.masterPoints && rs.difficulty && !rs.RANKS); };
function awardMasterPoints(byComputer) {
  if (!G || !G.over || G.mpDone || !hasRanks(G) || hotSeat()) return;
  G.mpDone = true;
  const won = G.winner === ME || (G.winners || []).includes(ME);
  if (!won || byComputer) return; // INFERRED: no points when the computer played your last turn
  const RS = HO.rules(G);
  const d = RS.difficulty(Object.assign({}, G.opts, { armageddons: G.armageddons || 0, won: true, year: G.year }));
  const pr = profile(), before = rankOf(pr.points);
  // rs.addMasterPoints: a ruleset that caps what one win may add (5.0.5)
  const was = pr.points;
  pr.points = RS.addMasterPoints ? RS.addMasterPoints(was, RS.masterPoints(d)) : was + RS.masterPoints(d);
  const pts = pr.points - was;
  pr.games.push({ date: new Date().toISOString().slice(0, 10), year: G.year, difficulty: d, points: pts });
  try { localStorage.setItem('ho5.profile', JSON.stringify(pr)); } catch (e) {}
  me().inbox.push({ text: HO.report(79, d, fmt(pts)), icon: 'm9035' });
  const after = rankOf(pr.points);
  // the Palm OS names a star at a new rank (rs.nameAStar.when 'rank', tFRM 2900)
  const NS = RS.nameAStar, named = NS && NS.when === 'rank' && !NS.inRank ? () => openNameStar() : null;
  // rs.rankAfterWin (5.0.5, FUN_10060580): the rank window comes after the
  // You Won window, which the winner's report opens (openWinWindows)
  if (after > before && RS.rankAfterWin && youWonWords() && !G.conqueredSeen && !byComputer) { G.rankAfter = after; return; }
  if (after > before) setTimeout(() => showRank(after, named), 300);
}
// Game Center (rs.gameCenter, iOS 1.2.9): the app keeps master points and
// games won on Game Center leaderboards, with seven achievements. The remake
// keeps that record in the browser (localStorage, the ruleset's own key), and
// the ruleset says what a finished game earns (gameCenter.gameOver): once a
// game, when it ends for you (won, lost, or you were eliminated), the points
// report (79), a new rank's window, then the Name a Star window
// (rs.nameAStar) when the record asks for one; Cancel there stops the asking.
// The Game menu's "Game Center…" shows the record.
function gameCenterRec(GC) { try { return JSON.parse(localStorage.getItem(GC.key) || 'null'); } catch (e) { return null; } }
function awardGameCenter() {
  const rs = G && HO.rules(G), GC = rs && rs.gameCenter;
  if (!GC || G.gcDone || hotSeat() || !(G.over || !me().alive)) return;
  G.gcDone = true;
  const won = !!G.over && (G.winners || [G.winner]).includes(ME);
  const d = won && rs.difficulty ? rs.difficulty(Object.assign({}, G.opts, { armageddons: G.armageddons || 0, won: true, year: G.year })) : 0;
  const r = GC.gameOver(gameCenterRec(GC), { gameId: String(G.opts.seed), won, difficulty: d }, keptStars(G.rules).length);
  try { localStorage.setItem(GC.key, JSON.stringify(r.rec)); } catch (e) {}
  if (r.points) me().inbox.push({ text: HO.report(79, d, fmt(r.points)), icon: 'm9035' });
  const decline = () => { const rec = gameCenterRec(GC) || GC.blank(); rec.starsDeclined = true; try { localStorage.setItem(GC.key, JSON.stringify(rec)); } catch (e) {} };
  const name = r.askName && rs.nameAStar ? () => openNameStar(null, decline) : null;
  if (r.newRank) setTimeout(() => showRank(r.rank, name), 300);
  else if (name) setTimeout(name, 300);
}
function openGameCenter() {
  const GC = HO.RULESETS[rulesId()] && HO.RULESETS[rulesId()].gameCenter; if (!GC) return;
  if (GC.leaderboards.length && (screensOf(rulesId()) || {}).gameCenterButtons) return openGameCenterScreen('leaderboards');
  const rec = Object.assign(GC.blank(), gameCenterRec(GC) || {}), R = HO.DATA.ranks || [], cur = rankOf(rec.master_points);
  const body = el('div', { class: 'rank gamecenter' },
    A.jpg[cur] ? el('img', { src: A.jpg[cur], alt: '' }) : null, R[cur] ? el('h3', null, R[cur][0]) : null,
    GC.leaderboards.length ? el('h4', null, 'Leaderboards') : null, GC.leaderboards.length ? el('table', { class: 'ptable' }, ...GC.leaderboards.map(b => el('tr', null, el('td', null, b.title), el('td', null, fmt(rec[b.id] || 0))))) : null,
    GC.achievements.length ? el('h4', null, 'Achievements') : null, GC.achievements.length ? el('table', { class: 'ptable' }, ...GC.achievements.map(a => { const n = (rec.achievements || {})[a.id] || 0; return el('tr', { class: n >= a.goal ? 'me' : '' }, el('td', null, n >= a.goal ? '★ ' : null, a.title), el('td', null, a.goal > 1 ? `${fmt(n)} of ${fmt(a.goal)}` : n ? 'Done' : '')); })) : null,
    // no leaderboards (Android): just the points the app kept in its preferences file
    GC.leaderboards.length ? null : el('p', null, `Master points: ${fmt(rec.master_points)}`),
    el('p', { class: 'sub' }, GC.note || 'The app kept these on Game Center; here they stay in this browser.'));
  modal(GC.title || 'Game Center', body, { cls: 'mid' });
}
function showRank(i, then) {
  const R = HO.DATA.ranks[i];
  // 5.0.5's rank window has the star-name field itself (rs.nameAStar.inRank,
  // FUN_1005e2b0, PPob 156): OK with a name keeps it, unless it is taken (the
  // alert, and the window stays); OK blank or Cancel names none. Its words:
  // NS.title, the ability or NS.allEarned, NS.cancel and NS.ok
  const NS = G && HO.rules(G).nameAStar, inRank = NS && NS.when === 'rank' && NS.inRank;
  const body = el('div', { class: 'rank' },
    el('img', { src: A.jpg[i], alt: '' }),
    el('p', null, 'Congratulations! You have achieved the rank of:'), el('h3', null, R[0]));
  // the ability (STR# 6003.20), or NS.allEarned (5.0.5: pane 3, under the star's field)
  const ability = R[2] ? el('p', null, `You have earned the ability to ${R[2]}.`) : inRank && NS.allEarned ? el('p', null, NS.allEarned) : null;
  if (ability && !inRank) body.append(ability);
  if (inRank) {
    const inp = el('input', { name: 'star', maxlength: NS.max || 11, autocomplete: 'off', 'aria-label': 'Star name' }), err = el('p', { class: 'note', role: 'alert' });
    const ok = () => {
      const n = inp.value.trim().slice(0, NS.max || 11);
      if (n && starTaken(NS, G.rules, n)) { err.textContent = NS.taken.replace('%s', n); Sound.play(4000); inp.select(); return; }
      if (n) { keepStar(NS, G.rules, n); toast(`“${n}” will be among the stars of your next galaxies.`); }
      closeModal(); if (then) then();
    };
    body.append(el('form', { class: 'newgame namestar', onsubmit: (e) => { e.preventDefault(); ok(); } }, el('p', null, NS.text), el('label', null, el('span', null, 'Star name'), inp), err, ability,
      el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: () => { closeModal(); if (then) then(); } }, NS.cancel || 'Cancel'), el('button', { type: 'submit' }, NS.ok || 'OK'))));
  } else body.append(el('div', { class: 'btns right' }, el('button', { onclick: () => { closeModal(); if (then) then(); } }, 'OK')));
  Sound.play(7021);
  modal(inRank && NS.title || 'New rank', body, { cls: 'mid' });
}
function openRanks() {
  const pr = profile(), cur = rankOf(pr.points), R = HO.DATA.ranks || [];
  const body = el('div', { class: 'rank' },
    el('img', { src: A.jpg[cur], alt: '' }),
    el('h3', null, R[cur][0]), el('p', null, `Total master points: ${fmt(pr.points)}`),
    el('p', { class: 'sub' }, 'You earn master points by winning games with the 5.0.5 or Palm OS 5 rules. The harder the game, the more points.'),
    el('table', { class: 'ptable' }, el('tr', null, el('th', null, 'Rank'), el('th', null, 'Points'), el('th', null, 'Unlocks')),
      ...R.map((r, i) => el('tr', { class: i === cur ? 'me' : '' }, el('td', null, i <= cur ? '★ ' : null, r[0]), el('td', null, fmt(r[1])), el('td', null, r[2] || '')))));
  if (pr.games.length) body.append(el('h4', null, 'Wins'), el('table', { class: 'ptable' }, el('tr', null, el('th', null, 'Date'), el('th', null, 'Year'), el('th', null, 'Difficulty'), el('th', null, 'Points')),
    ...pr.games.slice(-30).reverse().map(g => el('tr', null, el('td', null, g.date), el('td', null, String(g.year)), el('td', null, String(g.difficulty)), el('td', null, fmt(g.points))))));
  modal('Rank history', body, { cls: 'mid' });
}
// ---------- the Hall of Fame, the Hall of Shame and the Master Point List ----------
// rs.hall (4.0.5): a ruleset's own record of games, kept in localStorage per
// ruleset ("ho5.hall.<rules>", the stand-in for 4.0.5's haloffam.ho; 5.0.5's
// rank history is "ho5.profile"). The ruleset makes each entry and keeps the
// tables (hall.entry(G, player, won), hall.record(tables, entry, won)), says
// who is out (hall.out), and gives the rank names, pictures and dates; this
// skin writes an entry once a game for each human who wins or is eliminated
// (G.hallDone, as 4.0.5's bit at game +0x160) and draws the three windows
// (the Game menu, in each skin's style; 4.0.5's Options menu).
const hasHall = (g) => !!(g && HO.rules(g).hall);
const hallKey = (g) => 'ho5.hall.' + g.rules;
function hallTables(g) {
  let T = {};
  try { T = JSON.parse(localStorage.getItem(hallKey(g)) || '{}') || {}; } catch (e) { T = {}; }
  return { fame: T.fame || [], shame: T.shame || [], master: T.master || { list: [], sum: 0 } };
}
function recordHall() {
  if (!hasHall(G)) return;
  const H = HO.rules(G).hall, done = G.hallDone = G.hallDone || {};
  // (online: this computer's player only; each player's computer keeps its own)
  for (const p of G.online ? [me()] : HO.humans(G)) {
    if (done[p.id]) continue;
    const won = !!G.over && (G.winners || [G.winner]).includes(p.id);
    if (!won && !H.out(G, p)) continue;
    const e = H.entry(G, p, won);
    e.time = Math.floor(Date.now() / 1000);
    // (a copy: hall.record keeps the entry it is given)
    const shared = Object.assign({}, e);
    try { localStorage.setItem(hallKey(G), JSON.stringify(H.record(hallTables(G), e, won))); } catch (err) {}
    done[p.id] = 1;
    // the shared Hall too, when signed in (else the offer, once the game's own windows are done)
    cloudHall({ rules: G.rules, edition: editionLabel(G.rules), kind: won ? 'fame' : 'shame', entry: shared, name: p.name });
  }
}
// a list box: rows of cells laid out on the window's tab stops (--cols),
// one row selected; dbl: what a double click does
function hallListBox(rows, cols, sel, onSel, dbl) {
  const lb = el('div', { class: 'lb', role: 'listbox', tabindex: 0, style: `--cols: ${cols}` });
  const mark = () => lb.querySelectorAll('.lbrow').forEach((r, i) => { r.classList.toggle('sel', i === sel); r.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
  rows.forEach((cells, i) => {
    const r = el('div', { class: 'lbrow', role: 'option', onclick: () => { sel = i; mark(); if (onSel) onSel(i); } }, ...cells.map(c => el('span', null, c)));
    if (dbl) r.addEventListener('dblclick', () => dbl(i));
    lb.append(r);
  });
  lb.addEventListener('keydown', (e) => {
    if (!rows.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault(); sel = Math.max(0, Math.min(rows.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1))); mark(); if (onSel) onSel(sel);
  });
  mark();
  return lb;
}
const hallHeads = (names, cols) => el('div', { class: 'lbhead', style: `--cols: ${cols}` }, ...names.map(n => el('span', null, n)));
// The Hall of Fame / Hall of Shame window (dialog 386, FUN_0046c8fe,
// FUN_0049883d): "Hall of Fame" or "Hall of Shame"; Name, When, Difficulty
// on the list's tab stops (92, 209); the first row selected; Details (dimmed
// with no entries) opens the Summary of the selected game.
function openHall(kind, at, everyone) {
  if (!hasHall(G)) return;
  const H = HO.rules(G).hall, local = hallTables(G)[kind === 'shame' ? 'shame' : 'fame'], W = H.words || {};
  // hall.words (3.0.1): the version's own titles and heads; hall.again: Play Again's New Game options
  const title = (kind === 'shame' ? W.shame : W.fame) || (kind === 'shame' ? 'Hall of Shame' : 'Hall of Fame'), cols = '92fr 117fr 71fr';
  everyone = !!(everyone && CLOUD);
  let list = everyone ? [] : local;
  let sel = Math.min(at | 0, Math.max(0, list.length - 1));
  const details = () => { const i = sel; if (list[i]) openHallSummary(list[i], kind, () => openHall(kind, everyone ? 0 : i, everyone)); };
  const detailsBtn = el('button', { class: 'quiet', disabled: !list.length, onclick: details }, 'Details');
  const again = H.again && !everyone && el('button', { class: 'quiet', disabled: !list.length, onclick: () => { const o = list[sel] && H.again(list[sel]); if (o) closeModal(), playAgain(o); } }, W.playAgain || 'Play Again');
  // online (js/cloud.js): this computer's Hall, as the version kept it, or
  // the one everyone shares for this ruleset (newest or best 25)
  const radio = (label, on, go) => el('label', { class: 'chk' }, el('input', { type: 'radio', name: 'hallwhere', checked: on ? 'checked' : false, onchange: go }), el('span', null, label));
  const order = everyone ? el('select', { 'aria-label': 'Which games', onchange: (e) => { UI.hallOrder = e.target.value; openHall(kind, 0, true); } },
    el('option', { value: 'new', selected: UI.hallOrder !== 'top' ? 'selected' : false }, 'Newest'), el('option', { value: 'top', selected: UI.hallOrder === 'top' ? 'selected' : false }, 'Best (highest difficulty)')) : null;
  const where = CLOUD ? el('div', { class: 'hwhere', role: 'radiogroup', 'aria-label': 'Whose games' },
    radio('This computer', !everyone, () => openHall(kind, 0, false)), radio('Everyone', everyone, () => openHall(kind, 0, true)), order) : null;
  const box = el('div', { class: 'hbox' });
  if (everyone) hallEveryone(kind, H, cols, box, UI.hallOrder === 'top' ? 'top' : 'new', (L, i, open) => { list = L; sel = i | 0; detailsBtn.disabled = !L.length; if (open) details(); });
  else box.append(hallListBox(list.map(e => [e.name, H.date(e.time, G), String(e.difficulty)]), cols, sel, (i) => { sel = i; }, (i) => { sel = i; details(); }));
  const body = el('div', { class: 'hall hall-list' },
    el('div', { class: 'htitle' }, title), where,
    hallHeads(W.heads || ['Name', 'When', 'Difficulty'], cols),
    box,
    el('div', { class: 'btns' }, detailsBtn, again, el('button', { onclick: closeModal }, 'OK')));
  modal((kind === 'shame' ? W.shameTitle : W.fameTitle) || title, body, { cls: 'mid hallwin' });
}
// Play Again (3.0.1, hall.again): the same galaxy, from its seed, with you as
// its one human; the rest as a new game from the New Game window
function playAgain(o) {
  save();
  G = HO.newGame(Object.assign({ name: me().name, female: me().female, hints: !!Prefs.hints }, o));
  closeModal(); hideTitle(); ME = 0;
  UI.sel = G.players[ME].homeStar; UI.selFleet = null; UI.fitted = false; fit();
  save(); renderPanel(); draw();
  useSounds(soundsWanted(), () => { Sound.play(128); showMessages(); });
}
// The Summary window (dialog 387, FUN_0046d1e8, FUN_00498b6a): "Summary of
// Game Victory" / "Summary of Game Defeat"; the Hall of Shame's "Winner:"
// reads "Loser" (no colon, as 4.0.5). The picture box (static 1194) is left
// empty: the summary never gives it a picture.
function openHallSummary(e, kind, back) {
  const H = HO.rules(G).hall, N = H.names, shame = kind === 'shame', W = H.words || {};
  const row = (label, ...vals) => [el('span', { class: 'hl' }, label), el('span', { class: 'hv' }, ...vals.map(v => el('span', null, v)))];
  const heading = (shame ? W.loss : W.win) || (shame ? 'Summary of Game Defeat' : 'Summary of Game Victory');
  const body = el('div', { class: 'hall hall-sum' },
    el('div', { class: 'htitle' }, heading),
    el('div', { class: 'hsum' },
      // hall.summary (3.0.1): the version's own rows, [label, ...values]
      H.summary ? el('div', { class: 'hgrid' }, ...H.summary(G, e, shame).flatMap(r => row(...r))) : el('div', { class: 'hgrid' },
        ...row(shame ? (H.loser ? H.loser(G) : 'Loser') : 'Winner:', e.name), ...row('Date:', H.date(e.time, G)), ...row('Difficulty:', String(e.difficulty)),
        ...row('# Humans:', String(e.humans)), ...row('# of Computers:', String(e.computers)), ...row('# Allies:', String(e.allies)),
        ...row('Computer Intelligence:', N.iq[e.iq] || ''), ...row('Game Date:', String(e.year)),
        ...row('Galaxy Size:', N.size[e.size] || '', N.density[e.density] || '', N.shape[e.shape] || ''),
        ...row('Player Skill:', N.skill[e.skill] || ''), ...row('Armageddons:', String(e.armageddons))),
      el('div', { class: 'hpic', 'aria-hidden': 'true' })),
    el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK')));
  // closing it goes back to the list it was opened from
  modal(heading, body, { cls: 'small hallwin', onClose: back });
}
// The Master Point List (dialog 388, FUN_00482b89, FUN_00482f45): "Master
// Points:"; Name, Points, Rank on tab stops 6, 142, 278; points written
// plainly ("%d"); the picture goes by the top player's points, then by the
// selected player's (hall.picture: a bitmap number; 124 isn't in 4.0.5, so
// nothing is drawn for it).
function openMasterList() {
  if (!hasHall(G)) return;
  const H = HO.rules(G).hall, L = hallTables(G).master.list, cols = '6fr 136fr 136fr 101fr';
  const pic = el('div', { class: 'hpic master' });
  const show = (pts) => {
    const n = H.picture(pts | 0), src = A.img[(T.prefix || '') + 'b' + n] || `assets/skins/w95/sprites/b${n}.png`;
    pic.innerHTML = '';
    const im = el('img', { src, alt: '' }); im.onerror = () => im.remove(); pic.append(im);
  };
  show(L.length ? L[0].points : 0);
  const body = el('div', { class: 'hall hall-master' },
    el('div', { class: 'htop' }, el('div', { class: 'htitle' }, 'Master Points:'), pic),
    hallHeads(['', 'Name', 'Points', 'Rank'], cols),
    hallListBox(L.map(r => ['', r.name, String(r.points), H.rank(r.points, G)]), cols, 0, (i) => show(L[i].points)),
    el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK')));
  modal('Master Point List', body, { cls: 'mid hallwin' });
}
function doEndTurn(confirmed) {
  if (!G || G.over) return;
  if (confirmed !== true && HO.feature(G, 'buildQueue')) {
    const rs = HO.rules(G), starved = rs.underfunded ? rs.underfunded(G, me()) : HO.colonies(G, ME).filter(s => s.id !== me().homeStar && !(me().budget.col[s.id] > 0));
    if (starved.length && rs.underfunded) { confirmBox(`${starved.map(s => s.name).join(', ')} ${starved.length === 1 ? 'isn’t' : 'aren’t'} getting enough money to cover ${starved.length === 1 ? 'its' : 'their'} losses. Ending the turn will cost colonists, and a colony left with none is abandoned. Go ahead?`, () => doEndTurn(true), 'underfunded'); return; }
    if (starved.length) { confirmBox(`You aren’t spending any money on ${starved.map(s => s.name).join(', ')}. Ending the turn will abandon ${starved.length === 1 ? 'it' : 'them'}. Go ahead?`, () => doEndTurn(true), 'underfunded'); return; }
  }
  // the turn time limit: this turn's time banked or taken from the bank
  timeAtEnd(me());
  // online: the orders go; the turn is played when everyone's are in (online play, below)
  if (G.online) { onlineEndTurn(); return; }
  // the game as it was: put back if the turn throws (playTurn)
  const before = HO.save(G);
  // hot seat: the turn goes to the next human; the year moves on after the last one
  if (hotSeat()) {
    G.done = G.done || [];
    if (!G.done.includes(ME)) G.done.push(ME);
    const next = seatOrder().find(p => !G.done.includes(p.id));
    Sound.play(11111);
    if (next) { G.cur = next.id; save(true); handOver(next); return; }
    G.done = [];
  }
  if (!playTurn('End Turn', before)) return;
  awardMasterPoints(); awardGameCenter();
  recordHall();
  Sound.play(11111);
  for (const p of HO.humans(G)) addTurnNotes(p);
  if (hotSeat()) { const first = seatOrder()[0] || me(); G.cur = first.id; save(true); handOver(first); return; }
  save(true);
  // keep selection valid
  if (UI.selFleet != null && !G.fleets.some(f => f.id === UI.selFleet)) UI.selFleet = null;
  renderPanel(); draw();
  showMessages();
}
function addTurnNotes(p) {
  p.inbox = p.inbox || [];
  // rs.hintTexts: a version's own hints, one every turn picked by the system's
  // random numbers, not the game's (Palm OS: tSTL 6021.4-43, FUN_000500d4)
  const ownHints = HO.rules(G).hintTexts;
  // one a 10-year step (report 500, sent on every step of the turn: 20, 30 or 50 years a turn give 2, 3 or 5)
  const steps = HO.feature(G, 'yearsPerTurn') ? Math.max(1, Math.round((G.opts.yearsPerTurn || 10) / 10)) : 1;
  if (Prefs.hints && ownHints && ownHints.length) for (let i = 0; i < steps; i++) p.inbox.push({ text: ownHints[Math.floor(Math.random() * ownHints.length)], icon: 'm9024', quiet: true, hint: true });
  else if (Prefs.hints && HO.rules(G).hints !== false && G.turn % 7 === 3 && (HO.DATA.hints || []).length) { const h = HO.DATA.hints; p.inbox.push({ text: h[G.turn % Math.min(h.length, 40)], icon: 'm9024', quiet: true }); }
  if (!p.inbox.length) p.inbox.push({ text: `Year ${G.year}. Nothing much happened.`, icon: 'm9024', quiet: true });
}
// ----- hot seat -----
// Several people can play on one computer: each takes their turn in
// order, and between turns a blank screen asks the next one to sit down,
// so nobody sees anyone else's planets. Humans who are out of the game
// get one last turn to read the news.
// (an online game's humans are each on their own computer: not hot seat)
function hotSeat() { return !!G && !G.online && HO.humans(G).length > 1; }
function seatOrder() {
  return HO.humans(G).filter(p => (p.alive && !p.auto) || (!p.alive && !p.sawEnd && (p.inbox || []).length));
}
// ---------- the turn time limit (rs.timeLimit, G.opts.timeLimit) ----------
// 4.0.5's and 5.0.5's: the player's time this turn (p.timeUsed) and bank
// (p.timeBank), in the version's units (4.0.5 seconds, 5.0.5 ticks), count
// while the player's map is up, at most a minute at a time; the version
// says what is banked at End Turn and when time is up, and then the open
// windows close and the turn ends as it stands. Off unless chosen.
function timeLimit() {
  if (!G || !G.opts || !(G.opts.timeLimit > 0)) return null;
  const T = HO.rules(G).timeLimit;
  return T && T.ids.includes(G.rules) ? Object.assign({}, T, { limit: G.opts.timeLimit, cap: (T.caps || {})[G.opts.timeLimit] || G.opts.timeLimit }) : null;
}
const pad2 = (n) => String(n).padStart(2, '0');
// the time left in all (this turn's, then the bank), as h:mm:ss or m:ss
function timeLeftText(T, p) {
  const s = Math.max(0, Math.ceil(T.left(T, p.timeUsed || 0, p.timeBank || 0) * T.unit)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
  return h ? `${h}:${pad2(m)}:${pad2(s % 60)}` : `${m}:${pad2(s % 60)}`;
}
const timeCounting = () => !!G && !G.over && me() && me().human && me().alive && !(G.done || []).includes(ME) && !(G.online && (ONL.sent || !onlineCanMove())) && !($('#handover') && !$('#handover').hidden) && !$('#titlescreen:not([hidden])');
let timeLast = 0, timeSaved = 0;
function timeTick() {
  const now = Date.now(), dt = Math.min(60, Math.max(0, (now - (timeLast || now)) / 1000)); timeLast = now;
  const T = timeLimit(); if (!T || !timeCounting()) return;
  const p = me(), prev = p.timeUsed || 0, bank0 = p.timeBank || 0, left0 = T.left(T, prev, bank0);
  let used = prev + dt / T.unit, up = false;
  p.timeFlags = p.timeFlags || {};
  if (used > T.limit && prev <= T.limit && bank0 > 0 && !p.timeFlags.bonus) { p.timeFlags.bonus = true; Sound.play(T.sounds.bonus); }
  if (T.drain && used > T.limit) { p.timeBank = bank0 - (used - T.limit); used = T.limit; if (p.timeBank < 0) { p.timeBank = 0; up = true; } }
  p.timeUsed = used;
  if (left0 > T.warn && T.left(T, used, p.timeBank || 0) <= T.warn && !p.timeFlags.warn) { p.timeFlags.warn = true; Sound.play(T.sounds.timeUp); }
  clockTime();
  if (up || T.timeUp(T, used, p.timeBank || 0)) { closeModal(); toast(`${p.name}’s time is up.`); doEndTurn(true); return; }
  if (now - timeSaved > 10000) { timeSaved = now; save(); }
}
setInterval(timeTick, 1000);
// at End Turn: this turn's time goes to the bank (or comes out of it)
function timeAtEnd(p) {
  const T = timeLimit(); if (!T || !p) return;
  p.timeBank = T.bankAtEnd(T, p.timeUsed || 0, p.timeBank || 0);
  p.timeUsed = 0; p.timeFlags = {};
}
// the countdown on the End Turn button (4.0.5: its black window, T.endTurnYear)
function clockTime() {
  const T = timeLimit(), b = $('#msg .clock'); if (!T || !b) return;
  let t = b.querySelector('.timeleft');
  if (!t) { t = el('span', { class: 'timeleft' + (b.querySelector('.clockyear') ? ' inyear' : '') }); b.append(t); const y = b.querySelector('.clockyear'); if (y) y.style.visibility = 'hidden'; }
  const p = me(), over = (p.timeUsed || 0) >= T.limit;
  t.textContent = timeLeftText(T, p); t.classList.toggle('bonus', over);
  b.title = `${T.label}: ${t.textContent} left${over ? ' (bonus time)' : ''}`;
  const y = b.querySelector('.clockyear'); if (y) { t.style.cssText = y.style.cssText.replace(/visibility:[^;]*;?/, ''); }
}
// End Turn and Switch Players (rs.switchPlayers, Mac 4.0.5): ends this
// player's turn if it isn't ended, and passes the computer to the next
function switchPlayers() {
  if (!G || G.over || !hotSeat()) return;
  if (!(G.done || []).includes(ME)) { doEndTurn(); return; }
  const next = seatOrder().find(p => !(G.done || []).includes(p.id));
  if (next) { G.cur = next.id; save(); handOver(next); }
}
function handOver(p) {
  closeModal(); clearInterval(UI.anim);
  syncLang();
  $('#msg').innerHTML = '';
  let cover = $('#handover');
  if (!cover) { cover = el('div', { id: 'handover', role: 'dialog', 'aria-modal': 'true' }); document.body.append(cover); }
  cover.innerHTML = '';
  cover.hidden = false;
  const go = el('button', { onclick: () => takeSeat(p.id) }, `I’m ${p.name}: start my turn`);
  cover.append(el('div', { class: 'card hand' },
    el('h2', null, G.over ? 'Game over' : `${G.year}: ${p.name}’s turn`),
    el('p', null, `Pass the computer to ${p.name}. Everyone else, no peeking!`), go));
  go.focus();
}
function takeSeat(id) {
  ME = id; G.cur = id;
  const p = me();
  if (!p.alive) p.sawEnd = true;
  $('#handover').hidden = true;
  UI.sel = G.stars[p.homeStar].owner === ME ? p.homeStar : (HO.colonies(G, ME)[0] || G.stars[p.homeStar]).id;
  UI.selFleet = null; UI.route = null; UI.fitted = false; fit();
  addTurnNotes(p);
  save(); renderPanel(); draw(); showMessages();
}

// ---------- dialogs ----------
function modal(title, content, opts) {
  opts = opts || {};
  closeModal();
  // (a window with no title bar, as the originals' alerts: opts.label names it)
  const win = el('div', { class: 'win ' + (opts.cls || '') + (title ? '' : ' notitle'), role: 'dialog', 'aria-modal': 'true', 'aria-label': title || opts.label || null },
    el('div', { class: 'wtitle' }, el('button', { class: 'close', 'aria-label': 'Close', onclick: closeModal }), el('span', null, title)),
    el('div', { class: 'wbody' }, content));
  const back = el('div', { class: 'scrim', onclick: (e) => { if (e.target === back && !opts.sticky) closeModal(); } }, win);
  document.body.append(back);
  UI.modal = back; UI.onClose = opts.onClose;
  const f = win.querySelector('button:not(.close), input, select'); if (f) f.focus();
  return win;
}
function closeModal() { if (UI.modal) { UI.modal.remove(); UI.modal = null; const c = UI.onClose; UI.onClose = null; if (c) c(); } }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.modal) closeModal(); });
function confirmBox(text, yes, kind) {
  // a skin's own alert for a kind of question ('underfunded': the colonies left short at End Turn): T.alert(kind, text, yes)
  if (kind && T.alert && T.alert(kind, text, yes)) return;
  const w = modal('Are you sure?', el('div', null, text.nodeType ? text : el('p', null, text), el('div', { class: 'btns right' },
    el('button', { class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { onclick: () => { closeModal(); yes(); } }, 'OK'))), { cls: 'small alert' });
}
function toast(t) {
  const d = el('div', { class: 'toast', role: 'status' }, t);
  document.body.append(d); setTimeout(() => d.remove(), 3600);
}

// ----- something went wrong: the bug report window -----
// Every handler made with el() runs through guard(); End Turn and auto play
// catch their own (playTurn); anything else that escapes reaches the window's
// error event. Each shows this window in the skin's own look: an honest "this
// version's code didn't plan for it, or the remake got it wrong", a
// prefilled GitHub issue and the saved game to attach. window.HOBUGS keeps
// what was shown (the test tools read it; it is also written to the console
// as "[HO bug]").
const BUG_REPO = 'https://github.com/misterwilson37/nostalgia-ho';
window.HOBUGS = window.HOBUGS || [];
// the test tools open a battle's window by its record (tools/, scratch scripts)
window.HOBATTLE = (bid) => { if (G) openBattle(bid); };
// what the map shows, for the test tools (read only): its scale and offset,
// the selected star and fleet, a finger's ruler and drag
window.HOVIEW = () => ({ view: Object.assign({}, UI.view), sel: UI.sel, selFleet: UI.selFleet, ruler: UI.ruler && Object.assign({}, UI.ruler), drag: !!UI.drag, path: UI.drag && UI.lastPath ? Object.assign({}, UI.lastPath) : null, barScale: G ? { budget: HO.barScale(G, 'budget', barPick()).id, tech: HO.barScale(G, 'tech').id } : null, mapW, mapH, fit: fitScale(), zoom: zoomRange(), modal: !!UI.modal });
function guard(fn, where) {
  if (typeof fn !== 'function' || fn.hoGuarded) return fn;
  const g = function (...a) { try { return fn.apply(this, a); } catch (e) { showBug(e, where); } };
  g.hoGuarded = true;
  return g;
}
function bugFacts() {
  const id = rulesId(), rs = HO.RULESETS[id];
  const ver = rs ? (rs.version ? `${rs.version} (${rs.platform}, ${rs.year})` : rs.label || id) : '(unknown)';
  const patch = G ? (patchOn() ? `on (${HO.patchVersion(HO.rules(G))})` : 'off') : '(no game)';
  return { id, ver, patch, skin: (window.HOSKINS && HOSKINS.current) || 'classic', os: osNow() || '(default)', year: G ? G.year : null, turn: G ? G.turn : null };
}
function bugReportUrl(e, where, f) {
  const msg = String((e && e.message) || e);
  const stack = String((e && e.stack) || '').split('\n').filter(l => l.trim() && !l.includes(msg)).slice(0, 8)
    .map(l => l.replace(location.origin, '').trim()).join('\n');
  const body = [
    '**What happened**', '', '(What were you doing when it happened?)', '',
    '**Error**', '', '```', `${where ? where + ': ' : ''}${msg}`, stack, '```', '',
    '**Game**', '',
    `- Rules: ${f.ver} — ruleset \`${f.id}\``,
    `- Patch: ${f.patch}`,
    `- Skin: ${f.skin}`,
    f.year != null ? `- Year: ${f.year} (turn ${f.turn})` : '- No game in progress',
    `- Browser: ${navigator.userAgent}`, '',
    '**Saved game**', '', '(If you downloaded the saved game, drag the file in here.)',
  ].join('\n');
  const title = `[${f.id}] ${msg}`.slice(0, 120);
  return `${BUG_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body.slice(0, 6000))}`;
}
// Feedback and suggestions: like a bug report, a new GitHub issue with the
// facts filled in, which the player finishes and sends (nothing is sent
// from here). kind: 'game' (offered when a game ends, won or lost) or 'idea'
// (the Ho menu's Suggestion box, any time).
function feedbackUrl(kind) {
  const f = bugFacts(), game = kind === 'game' && G && G.over;
  const won = game && (G.winners || [G.winner]).includes(ME);
  const facts = [
    `- Rules: ${f.ver} — ruleset \`${f.id}\``,
    `- Patch: ${f.patch}`,
    `- Modern conveniences: ${G ? (modern() ? 'on' : 'off') : '(no game)'}`,
    `- Skin: ${f.skin} · OS look: ${f.os}`,
    G ? `- Galaxy: ${G.stars.length} stars, ${G.players.length} players; ${game ? (won ? 'won' : 'lost') : 'in'} ${G.year} (turn ${G.turn})` : '- No game in progress',
  ];
  const body = (game ? [
    '**How did the game go?**', '', '(Fun? Too easy, too hard? Anything that surprised you?)', '',
    '**Did anything play differently from how you remember it?**', '', '(Which version, and what did it do?)', '',
    '**Anything else?**', '', '',
  ] : [
    '**Your suggestion**', '', '(An idea, a wish, something you missed, something that felt off.)', '',
  ]).concat(['**Game**', '', ...facts, `- Browser: ${navigator.userAgent}`]).join('\n');
  const title = game ? `[feedback][${f.id}] ${won ? 'Won' : 'Lost'} in ${G.year}` : `[suggestion] `;
  return `${BUG_REPO}/issues/new?title=${encodeURIComponent(title)}&labels=${game ? 'feedback' : 'suggestion'}&body=${encodeURIComponent(body.slice(0, 6000))}`;
}
function openFeedback(kind) {
  const game = kind === 'game';
  const body = el('div', { class: 'about' },
    el('p', null, game ? 'Win or lose, we’d love to hear how the game went: what was fun, what wasn’t, and anything that didn’t play like the version you remember.'
      : 'Got an idea, a wish, or something that felt off? Drop it in the suggestion box.'),
    el('p', { class: 'sub' }, 'This opens a new issue on GitHub with the game’s details filled in; you write the rest and send it. A GitHub account is needed.'),
    el('div', { class: 'btns right' },
      el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Not now'),
      el('button', { type: 'button', onclick: () => { window.open(feedbackUrl(kind), '_blank', 'noopener'); closeModal(); } }, game ? 'Send feedback' : 'Open the suggestion box')));
  modal(game ? 'How did it go?' : 'Suggestion box', body, { cls: 'small' });
}
function downloadText(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = el('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
// o.save: the saved game to offer (default: the game as it is now);
// o.restored: End Turn was undone; o.keep: the label of the closing button
function showBug(e, where, o) {
  o = o || {};
  where = (e && e.hoWhere) || where || '';
  const msg = String((e && e.message) || e);
  console.error('[HO bug]', where ? where + ':' : '', e);
  window.HOBUGS.push({ where, message: msg });
  if (UI.bug) return; // one window at a time
  // the same error over and over (drawn every frame, say): the window comes up three times at most
  const n = UI.bugSeen[msg] = (UI.bugSeen[msg] || 0) + 1;
  if (n > 3) { toast('The same thing went wrong again.'); return; }
  if (!document.body) { window.addEventListener('DOMContentLoaded', () => showBug(e, where, o)); return; }
  let f = null, saved = o.save;
  try { f = bugFacts(); } catch (x) { f = { id: (G && G.rules) || '?', ver: '(unknown)', patch: '?', skin: '?', year: G ? G.year : null, turn: G ? G.turn : null }; }
  if (saved == null && G) { try { saved = HO.save(G); } catch (x) {} }
  const url = bugReportUrl(e, where, f);
  const done = () => { UI.bug = null; closeModal(); };
  const file = `spaceward-ho-${f.id}-${f.year != null ? f.year : 'save'}.json`;
  const body = el('div', { class: 'about bugreport' },
    el('p', null, 'Nice find! Something happened that this version’s code didn’t plan for, or that our remake got wrong. Want to send a bug report?'),
    o.restored ? el('p', null, 'The turn didn’t go through: your game is just as it was before you ended the turn.') : null,
    o.text ? el('p', null, o.text) : null,
    el('p', { class: 'sub' }, saved ? 'The report opens a new issue on GitHub with the details filled in. The saved game helps us see it happen: download it, then drag the file into the report.' : 'The report opens a new issue on GitHub with the details filled in.'),
    el('details', null, el('summary', null, 'What went wrong'),
      el('pre', { style: 'white-space: pre-wrap; font-size: 11px; max-height: 9em; overflow: auto; margin: 4px 0' }, `${where ? where + ': ' : ''}${msg}\nRules: ${f.ver} · patch ${f.patch} · skin ${f.skin}${f.year != null ? ` · ${f.year}` : ''}`)),
    el('div', { class: 'btns right' },
      saved ? el('button', { type: 'button', class: 'quiet', onclick: () => downloadText(saved, file) }, 'Download the saved game') : null,
      el('button', { type: 'button', class: 'quiet', onclick: done }, o.keep || 'Keep playing'),
      el('button', { type: 'button', onclick: () => { window.open(url, '_blank', 'noopener'); done(); } }, 'Send bug report')));
  modal('Something unexpected happened', body, { cls: 'mid', onClose: () => { UI.bug = null; } });
  UI.bug = UI.modal;
}
// what escapes everything else (a timer, a listener not made with el())
window.addEventListener('error', (ev) => {
  if (!ev.error && /^Script error\.?$|ResizeObserver loop/.test(ev.message || '')) return;
  showBug(ev.error || ev.message, '');
});
window.addEventListener('unhandledrejection', (ev) => showBug(ev.reason, ''));
// End Turn (and auto play): the game saved just before is put back when the
// turn throws, so a turn is never half played
// (T.beforeTurn(G): a skin notes what it needs as the turn is played)
function playTurn(where, before) {
  try { if (T.beforeTurn) T.beforeTurn(G); } catch (e) { /* a skin's note never stops a turn */ }
  // T.busy(on): a skin's busy pointer while the turn runs (the Amiga's W A I T)
  if (T.busy) try { T.busy(true); } catch (e) { /* (a skin's pointer never stops a turn) */ }
  try { HO.endTurn(G); if (T.busy) T.busy(false); return true; } catch (e) {
    if (T.busy) try { T.busy(false); } catch (x) { /* (as above) */ }
    G = HO.load(before); save();
    if (UI.selFleet != null && !G.fleets.some(f => f.id === UI.selFleet)) UI.selFleet = null;
    try { renderPanel(); draw(); renderMsg(); } catch (x) {}
    showBug(e, where, { save: before, restored: true });
    return false;
  }
}

// ----- build ships -----
// shipbuilding under the DOS 2.0 rules: part of a colony's money pays for
// the ships queued there, one at a time
function yardBox(s) {
  const p = me(), box = el('div', { class: 'yard' });
  // the bar is filled up to the share (--split), in each skin's bar colours
  const inp = el('input', { type: 'range', min: 0, max: 100, value: Math.round((s.ship || 0) * 100), 'aria-label': 'Share of this colony’s money for shipbuilding',
    oninput: (ev) => { s.ship = ev.target.value / 100; ev.target.style.setProperty('--split', ev.target.value + '%'); ev.target.nextSibling.textContent = ev.target.value + '%'; }, onchange: save });
  inp.style.setProperty('--split', Math.round((s.ship || 0) * 100) + '%');
  box.append(el('div', { class: 'tm' }, el('span', null, 'Shipbuilding'), inp,
    el('span', null, Math.round((s.ship || 0) * 100) + '%')));
  const q = s.queue || [];
  if (q.length) {
    const pr = HO.rules(G).yardProgress(G, p, s);
    box.append(el('p', { class: 'sub' }, 'Queued: ' + q.map(it => { const d = HO.getDesign(G, ME, it.did); return d ? `${it.n} ${d.name}` : ''; }).join(', ') + (pr ? ` · first one ${pr.pct}% paid for` : '')));
  } else box.append(el('p', { class: 'sub' }, 'Nothing queued.'));
  return box;
}
// T.window(name, ...): a skin's own window in place of this one (true: shown);
// T.api.classic(name, fn, ...) opens this skin's anyway (the Amiga's
// Schiffsbau keeps the designer here)
let skipSkinWin = null;
function skinWindow(name, ...a) {
  if (skipSkinWin === name) { skipSkinWin = null; return false; }
  return !!(T.window && T.window(name, ...a));
}
function openBuild(sid) {
  if (skinWindow('build', sid)) return;
  const p = me(), s = G.stars[sid];
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => HO.canBuildType(G, p, t));
  const queue = HO.feature(G, 'buildQueue'); // DOS 2.0 rules: ships are queued and paid for over time
  const st = UI.build = UI.build || { type: 'fighter' };
  if (!types.includes(st.type)) st.type = 'fighter';
  const body = el('div', { class: 'build' });
  // ships bought in this window, by design: marking a type gives them back
  // (BuildDesignShips @1314d4-1315ac); rs.scrapTypeRefundOne: only one of
  // them (4.0.5's slip, FUN_0044fd03)
  // rs.manyShips (5.0.5 and the Palm: FUN_1005cf40, FUN_00043754): a purchase of
  // 10 or more Scouts or Tankers asks first (Alert Strings 36 and 37, any answer but
  // OK buys nothing); { at: 10, how: 'ask' }. iOS and Android
  // (-[BuildSingleShipDialog updateCosts] 0x2b2bb8, count >= 10): the same texts shown
  // in red in the window, { at: 10, how: 'warn' }. This window buys one ship a click,
  // so it asks at the click that takes a design's ships bought here to 10, once.
  const carry = UI.buildCarry && UI.buildCarry.sid === sid ? UI.buildCarry : null; UI.buildCarry = null;
  const session = carry ? carry.session : {}, asked = carry ? carry.asked : {};
  const MS = !queue && HO.rules(G).manyShips;
  const manyText = (d) => d.type === 'scout' ? HO.say(G, HO.DATA.alerts[35]) : d.type === 'tanker' ? HO.say(G, HO.DATA.alerts[36]) : null;
  const manyAsk = (d, go) => {
    if (MS && MS.how === 'ask' && manyText(d) && (session[d.id] || 0) + 1 >= MS.at && !asked[d.id]) {
      UI.buildCarry = { sid, session, asked };
      modal('Are you sure?', el('div', null, el('p', null, manyText(d)), el('div', { class: 'btns right' },
        el('button', { class: 'quiet', onclick: () => { closeModal(); openBuild(sid); } }, 'Cancel'),
        el('button', { onclick: () => { asked[d.id] = true; closeModal(); UI.buildCarry = { sid, session, asked }; go(); openBuild(sid); } }, 'OK'))), { cls: 'small alert' });
    } else go();
  };
  const marking = marksScrapDesign() && !queue;
  // rs.allowDebt (iOS 1.2.9, -[BuildSingleShipDialog determineCapacity]): an
  // "Allow Debt" switch, { label, words: [off, on], on: its setting when the
  // window opens }; off, buying stops while savings stay at $0 or more; on,
  // at the borrowing limit (the other versions always allow debt)
  const AD = !queue && HO.rules(G).allowDebt, debtSwitch = !!AD;
  if (debtSwitch) st.debt = !!AD.on;
  const floor = () => debtSwitch && !st.debt ? 0 : HO.borrowLimit(G, p);
  const affordable = (c) => p.savings - c.money >= floor() && p.metal >= c.metal;
  const render = () => {
    body.innerHTML = '';
    const left = el('div', { class: 'blist' });
    left.append(el('div', { class: 'money' }, `Savings ${money(p.savings)} · Metal ${fmt(p.metal)}`));
    // (the Palm's is a plain check box, rs.allowDebt.box: tFRM 2100's control 0x709, FUN_0004248a)
    if (debtSwitch && AD.box) left.append(el('label', { class: 'chk' },
      el('input', { type: 'checkbox', checked: st.debt ? 'checked' : false, onchange: (e) => { st.debt = e.target.checked; render(); } }), el('span', null, AD.label || 'Allow Debt')));
    else if (debtSwitch) left.append(el('label', { class: 'chk switchrow' }, el('span', null, AD.label || 'Allow Debt'),
      el('input', { type: 'checkbox', class: 'switch', role: 'switch', 'aria-label': AD.label || 'Allow Debt', checked: st.debt ? 'checked' : false, onchange: (e) => { st.debt = e.target.checked; render(); } }),
      el('small', { class: 'switchword' }, (AD.words || ['No', 'Yes'])[st.debt ? 1 : 0])));
    const designs = p.designs.filter(d => !d.scrapped && types.includes(d.type));
    const builtHere = (did) => queue ? (s.queue || []).filter(it => it.did === did).reduce((a, it) => a + it.n, 0) : p.spentThisTurn.filter(e => e.sid === sid && e.did === did).length;
    if (queue) left.append(el('p', { class: 'note' }, 'Ships you add here are queued. They are built as this colony’s shipbuilding money pays for them' + ((s.ship || 0) > 0 ? '.' : ' — give it a Shipbuilding share in the planet panel.')));
    for (const d of designs) {
      const c = HO.shipCostNow(G, p, d);
      const n = builtHere(d.id);
      const slots = HO.rules(G).queueSlots, sq = s.queue || [];
      const can = (!d.scrap301 || !!HO.rules(G).queueMarked) && (queue ? !(slots && sq.length >= slots && sq[sq.length - 1].did !== d.id) : affordable(c));
      left.append(el('div', { class: 'drow' + (d.scrap301 ? ' scrap' : '') },
        shipImgEl(d, 26),
        el('div', { class: 'dtext' }, el('b', null, d.name), el('div', { class: 'sub' }, `${HO.TYPES[d.type].name} · R${d.type === 'satellite' ? 0 : d.R} Sp${d.V} W${d.W} Sh${d.S} M${d.M}`),
          el('div', { class: 'sub' }, `${money(c.money)} · ${fmt(c.metal)} metal${c.proto ? ' (incl. prototype)' : ''}`),
          MS && MS.how === 'warn' && manyText(d) && (session[d.id] || 0) >= MS.at ? el('div', { class: 'sub manywarn', style: 'color:#d00' }, manyText(d)) : null),
        el('div', { class: 'pm' },
          marking ? el('button', { class: 'quiet', onclick: () => {
            // a type marked for scrapping: the ships of it bought in this window go back
            if (HO.rules(G).flagScrapDesign(G, p, d, 'command')) {
              if (HO.rules(G).scrapTypeRefundOne && !HO.fixed(G, 'scrapTypeRefund')) { if (session[d.id] > 0 && HO.unbuildShip(G, ME, sid, d.id)) session[d.id]--; }
              else for (; session[d.id] > 0; session[d.id]--) HO.unbuildShip(G, ME, sid, d.id);
            }
            render(); renderPanel(); draw(); save();
          } }, scrapWords('type')[d.scrap301 ? 1 : 0]) : null,
          el('button', { class: 'quiet', disabled: !n, 'aria-label': 'Remove one', onclick: () => { if (queue) { const i = (s.queue || []).map(it => it.did).lastIndexOf(d.id); if (i >= 0) HO.unqueueShip(G, ME, sid, i); } else if (HO.unbuildShip(G, ME, sid, d.id) && session[d.id] > 0) session[d.id]--; render(); renderPanel(); draw(); } }, '−'),
          el('span', { class: 'n' }, String(n)),
          el('button', { disabled: !can, 'aria-label': queue ? 'Queue one' : 'Build one', onclick: () => { manyAsk(d, () => { if (queue ? HO.queueShips(G, ME, sid, d.id, 1) : HO.buildShips(G, ME, sid, d.id, 1)) { Sound.play(7006); session[d.id] = (session[d.id] || 0) + 1; } render(); renderPanel(); draw(); }); } }, '+'))));
    }
    // designer
    const L = HO.designLimits(G, p, st.type);
    for (const k of ['R', 'V', 'W', 'S', 'M']) { const lo = HO.designMin(G, k, st.type); if (st[k] == null || st._t !== st.type) st[k] = L[k]; st[k] = Math.max(lo, Math.min(Math.max(lo, L[k] || lo), st[k])); }
    st._t = st.type;
    const spec = { type: st.type, R: st.type === 'satellite' ? 0 : st.R, V: st.V, W: st.W, S: st.S, M: st.M };
    // the names file (rs.namesFile): a human names a new type, or takes a suggestion
    const NF = HO.rules(G).namesFile;
    const c = HO.designCost(G, spec);
    const exists = p.designs.find(d => d.type === spec.type && d.R === spec.R && d.V === spec.V && d.W === spec.W && d.S === spec.S && d.M === spec.M);
    const right = el('div', { class: 'designer' }, el('h4', null, 'Design a new type'));
    const tsel = el('div', { class: 'types' });
    for (const t of types) tsel.append(el('button', { class: 'tbtn' + (st.type === t ? ' on' : ''), onclick: () => { st.type = t; render(); } }, HO.TYPES[t].name));
    right.append(tsel);
    const prev = el('div', { class: 'preview' }); prev.append(shipImgEl(spec, 48)); right.append(prev);
    const lab = { R: 'Range', V: 'Speed', W: 'Weapons', S: 'Shields', M: 'Mini' };
    for (const k of ['R', 'V', 'W', 'S', 'M']) {
      if (k === 'R' && st.type === 'satellite') continue;
      const min = HO.designMin(G, k, st.type), max = Math.max(min, L[k] || min);
      right.append(el('label', { class: 'slide' }, el('span', null, lab[k]),
        el('input', { type: 'range', min, max, value: st[k], disabled: max <= min, oninput: (e) => { st[k] = +e.target.value; render(); } }),
        el('b', null, `${st[k]}/${max}`)));
    }
    if (NF && !exists) {
      const inp = el('input', { maxlength: 15, value: st.name || '', 'aria-label': 'Ship type name', placeholder: 'a name of your own', oninput: (e) => { st.name = e.target.value.trim(); } });
      right.append(el('label', { class: 'dname' }, el('span', null, 'Name: '), inp, ' ',
        el('button', { type: 'button', class: 'quiet', onclick: () => { st.name = HO.designName(G, p, st.type); inp.value = st.name; } }, 'Name It For Me')));
    }
    right.append(el('p', { class: 'sub' }, `${money(c.money)} and ${fmt(c.metal)} metal each` + (exists && exists.built ? '' : `, plus ${money(c.proto)} to build the prototype`) + '.'));
    if (st.type === 'scout') right.append(el('p', { class: 'note' }, `Scouts get ${L.R - p.tech.range} extra range but weaker weapons and shields. Each scout flies alone.`));
    if (st.type === 'satellite') right.append(el('p', { class: 'note' }, `Satellites can’t move. They shoot ${HO.feature(G, 'buildQueue') ? 'once' : 'twice'} per round.`));
    if (st.type === 'colony') right.append(el('p', { class: 'note' }, 'Colony ships settle the first unowned planet they’re sent to.'));
    if (st.type === 'mini') {}
    // a type marked for scrapping can't be bought (SetButtonStates @132c44)
    const live = p.designs.find(d => !d.scrapped && d.type === spec.type && d.R === spec.R && d.V === spec.V && d.W === spec.W && d.S === spec.S && d.M === spec.M);
    right.append(el('div', { class: 'btns' }, el('button', { disabled: !!(live && live.scrap301), title: live && live.scrap301 ? `${live.name} is marked for scrapping.` : null, onclick: () => {
      const lim = HO.rules(G).maxDesigns;
      if (lim && !exists && HO.liveDesigns(p) >= lim) { toast(HO.say(G, HO.DATA.alerts[15] || 'Your assembly lines are full.')); return; }
      if (NF && st.name) spec.name = st.name;
      const d = HO.findOrCreateDesign(G, p, spec);
      if (NF && !exists && spec.name) { keepName('ships', d.name, d.type); st.name = ''; }
      if (queue) { if (HO.queueShips(G, ME, sid, d.id, 1)) Sound.play(7006); else toast(`${s.name}’s queue is full: it holds ${HO.rules(G).queueSlots} kinds of ship.`); }
      else if (debtSwitch && !affordable(HO.shipCostNow(G, p, d))) toast(`Not enough money or metal. Turn on ${AD.label || 'Allow Debt'} to borrow.`);
      else manyAsk(d, () => { if (HO.buildShips(G, ME, sid, d.id, 1)) { Sound.play(7006); session[d.id] = (session[d.id] || 0) + 1; } else toast('Not enough money or metal.'); render(); renderPanel(); draw(); });
      render(); renderPanel(); draw();
    } }, queue ? (exists ? `Queue another ${exists.name}` : 'Create this type and queue one') : exists && exists.built ? `Build another ${exists.name}` : 'Build the prototype')));
    body.append(left, right);
  };
  render();
  modal(`${queue ? 'Queue' : 'Build'} ships at ${s.name}`, body, { cls: 'wide', onClose: () => save() });
}
function openSplit(f) {
  if (skinWindow('split', f)) return;
  const take = {};
  const body = el('div', null, el('p', { class: 'sub' }, 'Choose ships to move into a new fleet.'));
  for (const k in f.ships) {
    const d = HO.getDesign(G, f.owner, +k); take[k] = 0;
    const n = el('b', null, '0');
    body.append(el('div', { class: 'drow' }, shipImgEl(d, 22, f.owner), el('div', { class: 'dtext' }, `${d.name} (${f.ships[k]})`),
      el('div', { class: 'pm' }, el('button', { class: 'quiet', onclick: () => { take[k] = Math.max(0, take[k] - 1); n.textContent = take[k]; } }, '−'), n,
        el('button', { class: 'quiet', onclick: () => { take[k] = Math.min(f.ships[k], take[k] + 1); n.textContent = take[k]; } }, '+'))));
  }
  body.append(el('div', { class: 'btns right' }, el('button', { onclick: () => { const nf = HO.splitFleet(G, f, take); if (nf) UI.selFleet = nf.id; closeModal(); renderPanel(); draw(); save(); } }, 'Split fleet')));
  modal('Split fleet', body, { cls: 'small' });
}

// ----- Organize Fleets (iOS OrganizeFleetsLayer; 5.0.5's Group Fleets) -----
// A ruleset with rs.organizeFleets has the window ('ios': iOS 1.2.9's
// Organize Fleets; '505': 5.0.5's Group Fleets, LOrganizeFleetsDialog); the
// others keep Split… and "Merge all fleets here". What it does is the
// ruleset's (the engine's splitFleet and mergeFleets with rs.organized and
// rs.canMerge); only the controls differ. iOS (docs/ios-findings.md,
// "Organize Fleets"): your fleets at the star that hold ships, Satellites
// apart (updateData: 0x1000c0f38), side by side in columns, four showing,
// the arrows paging one column (moveContainer: 0x1000c0e00); in each the
// fleet's name ("Scrapped" when marked) and fuel, then a picture and count
// for each pile (one design's ships). Tap a pile (shipSelected:
// 0x1000c2714), then a fleet outlined as able to take it
// (OrganizerFleetFleetsContainer startWith:ship:block: 0x1000a5478: not an
// all-Biological fleet, unless the pile is Biological; an empty one takes
// anything): the whole pile goes there (move:from:to: 0x1000c27e0, count -1).
// The selected pile's Delayed Arrival and Attitude (0x1000c0a98,
// 0x1000c0b5c: Normal, Aggressive, Defensive in turn); Scrap (0x1000c2144:
// then tap a fleet to mark it, scrapFleet: 0x1000c17e0), Group (0x1000c1a84:
// every fleet into the selected pile's or the first, Biologicals apart),
// Split (0x1000c1e4c: half the selected pile, rounded down, to a new fleet;
// a pile of one: each other pile to a fleet of its own), New Fleet
// (0x1000c232c: the selected pile to a new fleet, else an empty column);
// pinching the window out splits, in groups (pinching: 0x1000c2ae0). 5.0.5's
// window (FUN_100a8400, FUN_100a8780, FUN_100aa240, FUN_100aa730) moves
// piles the same way with Group All and Split, and lets you move part of a
// pile (Option-drag asks how many, Option-Shift moves one: here a count).
function organizeStyle() { return !!G && !G.over && HO.rules(G).organizeFleets; }
// the window's name: iOS and the Palm's "Organize Fleets", 5.0.5's "Group Fleets"
const organizeName = () => organizeStyle() === 'ios' || organizeStyle() === 'palm' ? 'Organize fleets…' : 'Group fleets…';
const pileStance = (f, did) => f.dstance && f.dstance[did] != null ? f.dstance[did] : (f.delayed ? 1 : 0) | (f.stance === 'defensive' ? 2 : f.stance === 'offensive' ? 4 : 0);
function openOrganize(sid) {
  const style = organizeStyle();
  if (!style || sid == null) return;
  const ios = style === 'ios';
  // the Palm (rs.pileMove): a whole pile at a time, to any other fleet or to
  // "Empty Fleet", always there at the end of the list
  const palm = style === 'palm';
  const W = { sel: null, first: 0, empties: palm ? [0] : [], scrapping: false, n: 0, pressed: null };
  let nextEmpty = 1;
  const allBio = (f) => { const ds = HO.fleetDesigns(G, f); return ds.length > 0 && ds.every(d => d.type === 'bio'); };
  const fleets = () => fleetOrder(G.fleets.filter(f => f.owner === ME && f.star === sid && f.to == null && !f.sat && HO.fleetCount(f) > 0));
  const cols = () => [...fleets().map(f => ({ key: 'f' + f.id, f })), ...W.empties.map(e => ({ key: 'e' + e, empty: e }))];
  const selFleet = () => W.sel && G.fleets.find(f => f.id === W.sel.fid && f.ships[W.sel.did] > 0);
  const canTake = (c) => {
    const f = selFleet(); if (!f) return false;
    if (c.empty) return true;
    if (c.f === f) return false;
    if (palm) return true;
    return (HO.getDesign(G, f.owner, W.sel.did).type === 'bio') === allBio(c.f);
  };
  const done = (keyToShow) => {
    W.sel = null; W.scrapping = false;
    if (keyToShow) { const i = cols().findIndex(c => c.key === keyToShow); if (i >= 0 && (i < W.first || i >= W.first + 4)) W.first = Math.max(0, i - 3); }
    save(); renderPanel(); draw(); render();
  };
  // a pile into a fleet (or an empty column): the engine's split and merge,
  // so the ruleset's rules apply (5.0.5: the fleet that takes it keeps its
  // orders, the larger fuel used, "bought this turn" only if both, the
  // colonists with the Colony Ships)
  const move = (c, n) => {
    const f = selFleet(); if (!f || !canTake(c)) return;
    if (palm) { const to = HO.rules(G).pileMove(G, f, W.sel.did, c.f || null); done(to && 'f' + to.id); return; }
    n = Math.max(1, Math.min(f.ships[W.sel.did], n || f.ships[W.sel.did]));
    const nf = HO.splitFleet(G, f, { [W.sel.did]: n });
    if (!nf) return;
    if (c.f) HO.mergeFleets(G, c.f, nf);
    else W.empties = W.empties.filter(e => e !== c.empty);
    done(c.f ? 'f' + c.f.id : 'f' + nf.id);
  };
  const group = () => {
    const fl = fleets(), pick = selFleet();
    for (const bio of [false, true]) {
      const same = fl.filter(f => allBio(f) === bio);
      const tgt = pick && allBio(pick) === bio ? pick : same[0];
      for (const f of same) if (f !== tgt && G.fleets.includes(f) && G.fleets.includes(tgt) && HO.canMerge(G, tgt, f)) HO.mergeFleets(G, tgt, f);
    }
    W.empties = palm ? [0] : [];
    done();
  };
  const split = () => {
    const f = selFleet(); if (!f) return;
    const n = f.ships[W.sel.did];
    let nf = null;
    if (n > 1) nf = HO.splitFleet(G, f, { [W.sel.did]: n >> 1 });
    else for (const k of Object.keys(f.ships).filter(k => f.ships[k] > 0).slice(1)) nf = HO.splitFleet(G, f, { [k]: f.ships[k] }) || nf;
    done(nf && 'f' + nf.id);
  };
  const newFleet = () => {
    const f = selFleet();
    if (f) { const nf = HO.splitFleet(G, f, { [W.sel.did]: f.ships[W.sel.did] }); done(nf && 'f' + nf.id); return; }
    const e = nextEmpty++; W.empties.push(e); done('e' + e);
  };
  const scrapAt = (c) => {
    if (!c.f) return;
    const was = !!c.f.scrap301;
    HO.rules(G).flagScrap(G, c.f, 'command');
    if (!was) Sound.play(7003);
    if (!G.fleets.includes(c.f)) toast('Purchase undone.');
    done();
  };
  const setStance = (bits) => {
    const f = selFleet(); if (!f) return;
    f.dstance = Object.assign({}, f.dstance, { [W.sel.did]: bits });
    save(); render();
  };
  const colW = () => isTablet() ? 160 : 84;
  const body = el('div', { class: 'organize' + (ios ? ' ios' : ' m505') });
  const tapCol = (c) => {
    if (W.scrapping) { scrapAt(c); return; }
    if (W.sel && canTake(c)) move(c, ios ? 0 : W.n);
  };
  const render = () => {
    if (!G) return;
    const all = cols();
    if (W.sel && !selFleet()) W.sel = null;
    W.first = Math.max(0, Math.min(W.first, all.length - 4));
    body.innerHTML = '';
    const msg = W.scrapping ? 'Fleets will be scrapped at turn end' : ios ? 'Tap the ship you wish to move' : 'Choose a pile of ships, then the fleet to move it to.';
    const left = el('button', { class: 'quiet orgarrow', 'aria-label': 'Earlier fleets', disabled: W.first > 0 ? false : 'disabled', onclick: () => { if (W.first > 0) { W.first--; render(); } } }, '◀');
    const right = el('button', { class: 'quiet orgarrow', 'aria-label': 'Later fleets', disabled: W.first < all.length - 4 ? false : 'disabled', onclick: () => { if (W.first < all.length - 4) { W.first++; render(); } } }, '▶');
    body.append(el('div', { class: 'orghead' }, el('p', { class: 'sub orgmsg' }, msg), all.length > 4 ? el('span', { class: 'orgarrows' }, left, right) : null));
    const strip = el('div', { class: 'orgstrip' });
    strip.style.setProperty('--colw', colW() + 'px');
    strip.style.transform = `translateX(${-W.first * (colW() + 8)}px)`;
    if (!all.length) body.append(el('p', { class: 'note' }, 'No fleets of yours here.'));
    for (const c of all) {
      const target = W.scrapping ? !!c.f : W.sel ? canTake(c) : false;
      const col = el('div', { class: 'orgcol' + (target ? ' target' : '') + (c.f && W.sel && W.sel.fid === c.f.id ? ' from' : ''), 'data-col': c.key });
      if (c.f) {
        col.append(el('div', { class: 'orgname' }, c.f.scrap301 && marksScrap() ? 'Scrapped' : c.f.name || 'Fleet'),
          el('div', { class: 'sub orgfuel' }, `Fuel: ${Math.floor(c.f.fuel)}`));
        for (const k of Object.keys(c.f.ships)) {
          const n = c.f.ships[k]; if (!(n > 0)) continue;
          const d = HO.getDesign(G, c.f.owner, +k), on = W.sel && W.sel.fid === c.f.id && W.sel.did === +k;
          col.append(el('button', { class: 'orgpile' + (on ? ' on' : ''), 'data-did': k, 'aria-pressed': on ? 'true' : 'false', title: d.name,
            onclick: (e) => {
              e.stopPropagation();
              if (W.scrapping) { scrapAt(c); return; }
              if (W.sel && W.sel.fid !== c.f.id) { tapCol(c); return; } // another fleet's pile: that fleet is the target
              W.sel = on ? null : { fid: c.f.id, did: +k }; W.n = n; render();
            } }, shipImgEl(d, isTablet() ? 26 : 18, c.f.owner), el('b', null, String(n))));
        }
      } else col.append(el('div', { class: 'orgname' }, palm ? 'Empty Fleet' : 'New fleet'), el('div', { class: 'sub orgfuel' }, 'empty'));
      col.addEventListener('click', guard(() => tapCol(c)));
      // a finger or button held on a target is drawn red (the container's
      // selected fleet); lifted off it, nothing happens
      col.addEventListener('pointerdown', () => { if (target) col.classList.add('press'); });
      col.addEventListener('pointerleave', () => col.classList.remove('press'));
      col.addEventListener('pointerup', () => col.classList.remove('press'));
      strip.append(col);
    }
    body.append(el('div', { class: 'orgview' }, strip));
    // the selected pile's Delayed Arrival and Attitude (5.0.5's window has
    // the same, per pile: fleet +0x58 + design)
    const f = selFleet();
    if (f) {
      const bits = pileStance(f, W.sel.did), att = bits & 4 ? 'Aggressive' : bits & 2 ? 'Defensive' : 'Normal';
      const info = el('div', { class: 'orginfo' },
        el('span', null, 'Selected Ship:  Delayed Arrival'),
        el('button', { class: 'quiet', onclick: () => setStance(bits ^ 1) }, bits & 1 ? 'Yes' : 'No'),
        el('span', null, 'Attitude'),
        el('button', { class: 'quiet', onclick: () => setStance(bits & 4 ? (bits & ~4) | 2 : bits & 2 ? bits & ~2 : bits | 4) }, att));
      if (!ios && !palm && f.ships[W.sel.did] > 1) {
        const max = f.ships[W.sel.did];
        info.append(el('label', { class: 'orgcount' }, 'Move ', el('input', { type: 'number', min: 1, max, value: W.n || max, 'aria-label': 'Ships to move',
          onchange: (e) => { W.n = Math.max(1, Math.min(max, Math.trunc(+e.target.value) || max)); } }), ` of ${max}`));
      }
      body.append(info);
    }
    const btns = el('div', { class: 'btns orgbtns' });
    if (ios && marksScrap()) btns.append(el('button', { class: W.scrapping ? 'on' : null, onclick: () => { W.scrapping = !W.scrapping; W.sel = null; render(); } }, 'Scrap'));
    btns.append(el('button', { onclick: group }, ios ? 'Group' : 'Group All'),
      el('button', { onclick: split, disabled: f ? false : 'disabled' }, 'Split'));
    if (ios) btns.append(el('button', { onclick: newFleet }, 'New Fleet'));
    body.append(btns);
  };
  // two fingers on the window: spread them to split, pinch them to group
  // (UIPinchGestureRecognizer: scale over 1 splits; here only past 10% either way)
  const pins = new Map(); let d0 = 0, d1 = 0;
  body.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; pins.set(e.pointerId, [e.clientX, e.clientY]); if (pins.size === 2) { const [a, b] = [...pins.values()]; d0 = d1 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  body.addEventListener('pointermove', (e) => { if (!pins.has(e.pointerId)) return; pins.set(e.pointerId, [e.clientX, e.clientY]); if (pins.size === 2) { const [a, b] = [...pins.values()]; d1 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  const pinEnd = guard((e) => {
    if (!pins.has(e.pointerId)) return;
    const two = pins.size === 2; pins.delete(e.pointerId);
    if (!two || !d0) return;
    const r = d1 / d0; d0 = 0;
    List.noClick();
    if (r > 1.1) split(); else if (r < 0.9) group();
  });
  body.addEventListener('pointerup', pinEnd); body.addEventListener('pointercancel', pinEnd);
  render();
  modal(ios || palm ? 'Organize Fleets' : 'Group Fleets', body, { cls: 'wide orgwin', onClose: () => { W.empties = []; renderPanel(); draw(); save(); } });
}

// ----- battle replay -----
// The replays of the latest battle you were in at a star. The remake keeps
// one replay per star a turn; a ruleset may keep one per duel instead (1.2
// and 2.0 did): several records for the star that year, each with a duel
// index (rec.duel = 0, 1, …), and each is offered.
function lastBattles(sid) {
  const last = [...G.battles].reverse().find(b => b.star === sid && b.sides.includes(ME));
  if (!last) return [];
  return G.battles.filter(b => b === last || (last.duel != null && b.duel != null && b.star === sid && b.year === last.year && b.sides.includes(ME)));
}
const battleName = (b) => b.duel != null ? `duel ${b.duel + 1} (${b.year})` : `battle (${b.year})`;
// modern: the battle as text, round by round
function battleReport(b) {
  const who = (o) => o === ME ? 'Your' : `${G.players[o].name}’s`;
  const unit = (i) => { const u = b.start[i], d = HO.getDesign(G, u.o, u.did); return `${who(u.o)} ${d ? d.name + ' (' + HO.TYPES[d.type].name + ')' : 'ship'}`; };
  const list = el('ol', { class: 'breport' });
  b.rounds.forEach((evs, ri) => {
    const shots = {}, kills = [];
    let planetHits = 0;
    for (const ev of evs) {
      const o = ev.si >= 0 ? b.start[ev.si].o : b.planetOwner;
      shots[o] = (shots[o] || 0) + 1;
      if (ev.p) planetHits++;
      else if (ev.k) kills.push(`${ev.si >= 0 ? unit(ev.si) : 'The planet'} destroyed ${unit(ev.ti).replace(/^Your/, 'your')}.`);
    }
    const sh = Object.keys(shots).map(o => `${+o === ME ? 'you' : G.players[o].name} fired ${shots[o]}`).join(', ');
    const pop = b.popR && b.popR[ri] != null ? ` The colony is down to ${fmt(b.popR[ri] * 1e6)} people.` : '';
    list.append(el('li', null, `${sh ? sh[0].toUpperCase() + sh.slice(1) : 'No shots'}.` + (planetHits ? ` ${planetHits} shot${planetHits === 1 ? '' : 's'} hit the planet.${pop}` : ''), ...kills.map(k => el('div', { class: 'kill' }, k))));
  });
  const sum = b.sides.map(o => `${o === ME ? 'You' : G.players[o].name} lost ${b.lost[o] || 0}`).join('; ') + '.';
  return el('details', { class: 'breport-box' }, el('summary', null, `Written report (${b.rounds.length} round${b.rounds.length === 1 ? '' : 's'}): ${sum}`), list);
}
// the battle window's last line: the rounds, each side's losses, the colony
function battleOver(b, sides) {
  const n = b.rounds.length;
  return tl(n === 1 ? 'Battle over after %s round.' : 'Battle over after %s rounds.', n) + ' ' +
    sides.map(o => o === ME ? tl('You lost %s', b.lost[o] || 0) : tl('%s lost %s', G.players[o].name, b.lost[o] || 0)).join('; ') + '.' + (b.planetDied ? ' ' + tl('The colony was wiped out.') : '');
}
// the shots shown at once: one, or (not fully animated, verBattle) the
// shooting pile's run of shots
function pileShots(round, e, VB) {
  const evs = [round[e]];
  if (!VB.full) while (round[e + evs.length] && round[e + evs.length].si === round[e].si) evs.push(round[e + evs.length]);
  return evs;
}
function openBattle(bid) {
  const b = G.battles.find(x => x.id === bid);
  if (!b) { toast('The record of that battle is no longer available.'); return; }
  if (HO.rules(G).battlePanel) { openBattlePanel(b); return; }
  const c = el('canvas', { class: 'bcv', width: 760, height: 380 });
  const status = el('p', { class: 'sub' }, '');
  const body = el('div', null, c, status);
  // modern: a speed control and a written account of the battle
  let speed = 1;
  const VB = verBattle();
  if (modern()) {
    const sp = el('select', { 'aria-label': 'Battle speed', onchange: (e) => { speed = +e.target.value; if (speed === 0) finish(); } },
      ...[['0.5', 'Slow'], ['1', 'Normal'], ['3', 'Fast'], ['0', 'Skip to the end']].map(([v, t]) => el('option', { value: v, selected: v === '1' ? 'selected' : false }, t)));
    body.append(el('div', { class: 'bctl' }, el('label', null, 'Speed ', sp)), battleReport(b));
  }
  b._stop = false;
  modal(`Battle at ${G.stars[b.star].name}, ${b.year}` + (b.duel != null ? `, duel ${b.duel + 1}` : ''), body, { cls: 'wide', onClose: () => { b._stop = true; } });
  const x = c.getContext('2d');
  // layout: sides spread horizontally
  const sides = b.sides;
  const cols = sides.length;
  const pos = [];
  const counts = {};
  b.start.forEach((u, i) => { counts[u.o] = (counts[u.o] || 0) + 1; });
  const idx = {};
  b.start.forEach((u, i) => {
    const si = sides.indexOf(u.o), n = counts[u.o];
    idx[u.o] = (idx[u.o] || 0) + 1;
    const k = idx[u.o] - 1;
    const per = Math.ceil(Math.sqrt(n * 1.6));
    const colW = 760 / cols;
    const cw = Math.min(64, (colW - 30) / Math.max(1, Math.ceil(n / per)));
    const ch = Math.min(40, 300 / per);
    const gx = Math.floor(k / per), gy = k % per;
    const mirror = si % 2 === 1;
    const bx = si * colW + 20 + (mirror ? (colW - 40 - gx * cw - cw) : gx * cw);
    pos.push({ x: bx, y: 50 + gy * ch, w: cw, h: ch, mirror });
  });
  const alive = b.start.map(() => true);
  const planetSide = b.planetOwner >= 0 ? sides.indexOf(b.planetOwner) : -1;
  const pl = { x: planetSide >= 0 ? planetSide * (760 / cols) + (760 / cols) / 2 : -1, y: 330 };
  let pop = b.pop0;
  const drawAll = (shot) => {
    x.fillStyle = T.battleBg || '#04030c'; x.fillRect(0, 0, 760, 380); // a theme may draw battles on its own colour
    for (let i = 0; i < 70; i++) { x.fillStyle = T.battleBg ? 'rgba(0,0,0,.25)' : 'rgba(200,210,255,.35)'; x.fillRect((i * 97) % 760, (i * 53) % 380, 1, 1); }
    sides.forEach((o, si) => {
      const pp = G.players[o];
      x.fillStyle = T.battleBg ? '#000' : o === ME ? '#fff2c0' : '#ffb3d9'; x.font = '13px Geneva, Verdana, sans-serif'; x.textAlign = 'center';
      x.fillText(o === ME ? tl('You') : pp.name, si * (760 / cols) + (760 / cols) / 2, 24);
    });
    if (pl.x >= 0) {
      const s = G.stars[b.star]; const p = me();
      x.globalAlpha = pop > 0.01 ? 1 : 0.3;
      x.drawImage(planetBattlePic(), pl.x - 24, pl.y - 24, 48, 48);
      x.globalAlpha = 1;
      x.fillStyle = T.battleBg ? '#000' : '#ccc'; x.font = '11px Geneva, Verdana, sans-serif'; x.fillText(tl('pop %s', fmt(pop * 1e6)), pl.x, pl.y + 36);
    }
    b.start.forEach((u, i) => {
      if (!alive[i]) return;
      const d = HO.getDesign(G, u.o, u.did) || { type: u.t, R: 1, V: 1, W: 1, S: 1 };
      const im = shipPic(d, u.o); const P = pos[i];
      const sc = Math.min(P.w / im.width, P.h / im.height) * 0.92;
      x.save(); x.translate(P.x + P.w / 2, P.y + P.h / 2); if (P.mirror) x.scale(-1, 1);
      x.drawImage(im, -im.width * sc / 2, -im.height * sc / 2, im.width * sc, im.height * sc); x.restore();
    });
    for (const sh of [].concat(shot || [])) {
      x.strokeStyle = T.battleBg ? '#000' : sh.a === 0 ? '#ffe066' : '#ff6fb5'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(sh.x1, sh.y1); x.lineTo(sh.x2, sh.y2); x.stroke();
    }
  };
  const center = (i) => i < 0 ? { x: pl.x, y: pl.y } : { x: pos[i].x + pos[i].w / 2, y: pos[i].y + pos[i].h / 2 };
  let r = 0, e = 0;
  const step = () => {
    if (b._stop) return;
    if (r >= b.rounds.length) {
      drawAll();
      const mine = (b.survivors[0] || 0);
      status.textContent = battleOver(b, sides);
      return;
    }
    const ev = b.rounds[r][e];
    if (!ev) { r++; e = 0; if (b.popR) pop = b.popR[r - 1]; status.textContent = tl('Round %s', r + 1); setTimeout(step, 160 / speed * VB.f); return; }
    const evs = pileShots(b.rounds[r], e, VB);
    const shots = evs.map((ev, j) => {
      const a = center(ev.si), q = e + j;
      let t;
      if (ev.p) { t = { x: pl.x, y: pl.y }; if (!j) Sound.play(3000); }
      else { t = center(ev.ti); if (ev.k) { alive[ev.ti] = false; if (!j) Sound.play(q % 3 === 0 ? 3003 : 3002); } else if (!j && q % 4 === 0) Sound.play(3000 + (q % 2)); }
      return { x1: a.x, y1: a.y, x2: t.x, y2: t.y, a: ev.a };
    });
    drawAll(shots);
    if (VB.full && ev.k && !ev.p) { const P = pos[ev.ti]; x.drawImage(IMG.debris, 0, 0, 288, 138, P.x - 6, P.y - 4, P.w + 12, P.h + 8); }
    e += evs.length;
    setTimeout(step, Math.max(18, 110 - b.rounds[r].length * 2) / speed * VB.f);
  };
  // skip to the end: apply every remaining shot at once
  const finish = () => {
    for (; r < b.rounds.length; r++, e = 0) {
      for (; e < b.rounds[r].length; e++) { const ev = b.rounds[r][e]; if (ev.k && !ev.p) alive[ev.ti] = false; }
      if (b.popR) pop = b.popR[r];
    }
    step();
  };
  status.textContent = tl('Round %s', 1);
  drawAll(); setTimeout(step, 400);
}

// The battle window of a ruleset that describes its panel (rs.battlePanel,
// engine makeBattlePanel): each side's groups of ships as the version showed
// them, a picture (5.0.5: a pile) with the group's words under it, updated as
// ships die; the version's own heading and closing lines. The skin styles it
// (T.battleBg: its own background, black words; T.battleFont). The modern
// conveniences' speed control and account are kept.
function openBattlePanel(b) {
  const rs = HO.rules(G), viewer = b.sides.includes(ME) ? ME : b.sides[0];
  const alive = b.start.map(() => true), hurt = [];
  let seq = 0;
  let pop = b.pop0, over = false;
  const state = () => {
    const foe = (o) => o !== viewer && !HO.isAllied(G, o, viewer);
    const live = (pred) => b.start.some((u, i) => alive[i] && pred(u.o));
    const won = (live(o => !foe(o)) || (b.planetOwner >= 0 && !foe(b.planetOwner) && pop > 0.0005)) && !live(foe) && !(b.planetOwner >= 0 && foe(b.planetOwner) && pop > 0.0005);
    return { alive, hurt, pop, over, won };
  };
  let P = rs.battlePanel(G, b, state(), ME);
  // layout: two columns, two groups a row in each; a cell is 180 wide
  // (5.0.5, P.layout 'pile505': each column one stack, pile505Layout)
  const dark = !!T.battleBg;
  const headH = 12 + P.head.length * 18 + (P.owner ? 0 : 18);
  const L = P.layout === 'pile505' ? pile505Layout(P) : null;
  const W = L ? L.W : 760, CW = 180, RH = 70;
  const rows = Math.max(1, ...P.cols.map(c => Math.ceil(c.length / 2)));
  const H = L ? L.H + 24 : headH + rows * RH + 44;
  const c = el('canvas', { class: 'bcv', width: W, height: H });
  const status = el('p', { class: 'sub' }, '');
  const body = el('div', null, c, status);
  let speed = 1;
  const VB = verBattle();
  if (modern()) {
    const sp = el('select', { 'aria-label': 'Battle speed', onchange: (e) => { speed = +e.target.value; if (speed === 0) finish(); } },
      ...[['0.5', 'Slow'], ['1', 'Normal'], ['3', 'Fast'], ['0', 'Skip to the end']].map(([v, t]) => el('option', { value: v, selected: v === '1' ? 'selected' : false }, t)));
    body.append(el('div', { class: 'bctl' }, el('label', null, 'Speed ', sp)), battleReport(b));
  }
  b._stop = false;
  modal(`Battle at ${G.stars[b.star].name}, ${b.year}` + (b.duel != null ? `, duel ${b.duel + 1}` : ''), body, { cls: 'wide', onClose: () => { b._stop = true; } });
  const x = c.getContext('2d');
  const font = T.battleFont || 'Geneva, Verdana, sans-serif', ink = dark ? '#000' : '#e8e8f0', sub = dark ? '#000' : '#b9bdd6';
  // each group's cell; each ship's place is its group's
  const cellOf = (ci, k) => L ? L.at[ci][k] : ({ x: ci * (W / 2) + (k % 2) * CW + CW / 2 + (ci ? 20 : 0), y: headH + Math.floor(k / 2) * RH + 24 });
  const where = new Map(); let planetAt = null;
  P.cols.forEach((col, ci) => col.forEach((g, k) => { const at = cellOf(ci, k); g.units.forEach(i => where.set(i, at)); if (g.planet) planetAt = at; }));
  const cut = (t, w) => { if (x.measureText(t).width <= w) return t; while (t.length > 1 && x.measureText(t + '…').width > w) t = t.slice(0, -1); return t + '…'; };
  const drawAll = (shot) => {
    P = rs.battlePanel(G, b, state(), ME);
    x.fillStyle = T.battleBg || '#04030c'; x.fillRect(0, 0, W, H);
    if (!dark) for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(200,210,255,.35)'; x.fillRect((i * 97) % W, (i * 53) % H, 1, 1); }
    x.textAlign = 'center'; x.fillStyle = ink;
    P.head.forEach((t, i) => { x.font = (i ? '' : 'bold ') + '13px ' + font; x.fillText(tl(t), W / 2, 20 + i * 18); });
    if (!P.owner) { // the remake's own: each column headed with its side's name (the version drew none)
      x.font = '12px ' + font; x.fillStyle = sub;
      [P.leftSide ?? b.sides[0], b.sides.find(o => o !== (P.leftSide ?? b.sides[0]))].forEach((o, ci) => { if (o == null) return; x.fillText(o === ME ? tl('You') : (G.players[o] || {}).name || '', ci * (W / 2) + W / 4 + (ci ? 20 : 0), headH - 6); });
    }
    if (!L) { x.strokeStyle = dark ? '#000' : 'rgba(200,210,255,.25)'; x.beginPath(); x.moveTo(W / 2 + 10, headH - 2); x.lineTo(W / 2 + 10, H - 40); x.stroke(); }
    P.cols.forEach((col, ci) => col.forEach((g, k) => {
      const at = cellOf(ci, k);
      if (L) { drawGroup505(x, g, at, ci, font); return; }
      if (g.planet) {
        x.globalAlpha = g.n ? 1 : 0.3; x.drawImage(planetBattlePic(), at.x - 20, at.y - 20, 40, 40); x.globalAlpha = 1;
      } else {
        const d = HO.getDesign(G, g.o, g.did) || { type: 'fighter', R: 1, V: 1, W: 1, S: 1 }, im = shipPic(d, g.o);
        const n = g.n ? Math.max(1, g.pics || 1) : 1, sc = Math.min(56 / im.width, 36 / im.height);
        x.globalAlpha = g.n ? 1 : 0.3;
        for (let j = 0; j < n; j++) { // 5.0.5's pile: a V, each ship 2 points from the last
          const o = j - Math.floor(n / 2), px = at.x - 2 * Math.abs(o), py = at.y + 2 * o;
          x.save(); x.translate(px, py); if (ci) x.scale(-1, 1); x.drawImage(im, -im.width * sc / 2, -im.height * sc / 2, im.width * sc, im.height * sc); x.restore();
        }
        x.globalAlpha = 1;
        if (g.shade && g.shade[1] > g.shade[0]) { // 1.2 to 4.0.5: the cell's damage shading (a gray PaintRect in patOr)
          x.fillStyle = 'rgba(128,128,128,.55)'; x.fillRect(at.x - 30 + 60 * g.shade[0], at.y - 20, 60 * (g.shade[1] - g.shade[0]), 40);
        }
      }
      if (P.owner && g.owner) { // the owner's name over the group (5.0.5: a black pill; the Palm: "+name" for good luck)
        x.font = '10px ' + font; const t = cut(g.owner, CW - 20), w = x.measureText(t).width + 8;
        if (P.owner === 'pill') { x.fillStyle = '#000'; roundRect(x, at.x - w / 2, at.y + 10, w, 12, 6); x.fill(); x.fillStyle = '#fff'; x.fillText(t, at.x, at.y + 19); }
        else { x.fillStyle = ink; x.fillText(t, at.x, at.y - 22); }
      }
      const lim = g.luck && P.owner === 'pill' && IMG[g.luck > 0 ? 'm9017' : 'm9018']; // 'pill': 5.0.5's panel (iOS keeps the marks)
      if (lim && lim.complete && lim.naturalWidth) { // 5.0.5's PICT 9017 (a rainbow) or 9018 (a storm), 40 x 40, beside the group
        x.drawImage(lim, at.x + 22, at.y - 20, 40, 40);
      } else if (g.luck) { // the good-luck / bad-luck picture (iOS icons 17/18; where the skin has no picture): a mark
        x.fillStyle = g.luck > 0 ? '#3c9a3c' : '#c03a3a'; x.beginPath(); x.arc(at.x + 40, at.y - 8, 7, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff'; x.font = 'bold 11px ' + font; x.fillText(g.luck > 0 ? '+' : '−', at.x + 40, at.y - 4);
      }
      x.font = '11px ' + font; x.fillStyle = ink;
      x.fillText(cut(tl(g.text), CW - 6), at.x, at.y + (P.owner === 'pill' ? 36 : 32));
    }));
    if (P.end) { x.font = 'bold 13px ' + font; x.fillStyle = ink; x.fillText(P.end.map(e => tl(e)).join(' '), W / 2, H - 14); }
    for (const sh of [].concat(shot || [])) {
      x.strokeStyle = dark ? '#000' : sh.a === viewer ? '#ffe066' : '#ff6fb5'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(sh.x1, sh.y1); x.lineTo(sh.x2, sh.y2); x.stroke();
    }
  };
  const center = (i) => i < 0 ? (planetAt || { x: W / 2, y: H / 2 }) : (where.get(i) || { x: W / 2, y: H / 2 });
  let r = 0, e = 0;
  const step = () => {
    if (b._stop) return;
    if (r >= b.rounds.length) {
      over = true; drawAll();
      status.textContent = battleOver(b, b.sides);
      return;
    }
    const ev = b.rounds[r][e];
    if (!ev) { r++; e = 0; if (b.popR) pop = b.popR[r - 1]; status.textContent = tl('Round %s', r + 1); setTimeout(step, 160 / speed * VB.f); return; }
    const evs = pileShots(b.rounds[r], e, VB);
    let t;
    const shots = evs.map((ev, j) => {
      const a = center(ev.si), q = e + j;
      if (ev.p) { t = center(-1); if (!j) Sound.play(3000); }
      else { t = center(ev.ti); if (ev.f != null) hurt[ev.ti] = { n: ++seq, f: ev.f }; if (ev.k) { alive[ev.ti] = false; if (!j) Sound.play(q % 3 === 0 ? 3003 : 3002); } else if (!j && q % 4 === 0) Sound.play(3000 + (q % 2)); }
      return { x1: a.x, y1: a.y, x2: t.x, y2: t.y, a: ev.a };
    });
    drawAll(shots);
    if (VB.full && ev.k && !ev.p) x.drawImage(IMG.debris, 0, 0, 288, 138, t.x - 30, t.y - 18, 60, 36);
    e += evs.length;
    setTimeout(step, Math.max(18, 110 - b.rounds[r].length * 2) / speed * VB.f);
  };
  const finish = () => {
    for (; r < b.rounds.length; r++, e = 0) {
      for (; e < b.rounds[r].length; e++) { const ev = b.rounds[r][e]; if (ev.f != null && !ev.p) hurt[ev.ti] = { n: ++seq, f: ev.f }; if (ev.k && !ev.p) alive[ev.ti] = false; }
      if (b.popR) pop = b.popR[r];
    }
    step();
  };
  status.textContent = tl('Round %s', 1);
  drawAll(); setTimeout(step, 400);
}
// 5.0.5's battle window (FUN_1007f560, FUN_1007f7f0, FUN_1007f9f0 lay the
// groups out; FUN_100ac8c0 and FUN_100aceb0 draw one). Each column is one
// stack from the top, its x 145 (the viewer's side) or 465 (the others,
// mirrored), each group's x moved 9 right when offensive and 9 left when
// defensive; a side's groups follow 5 below the last side's, a colony takes
// 84 + 12, a pile its height (as it started) + 24, its centre 75 below its
// top (95 for a dreadnought). A pile (pile505Size, FUN_1007fcb0): the
// picture's size (a dreadnought 211 x 100, a tanker 145 x 44, a colony ship
// 150 x 56, a satellite 40 x 40, else 120 x 40, where the PICT has none) and
// 2 more each way for each picture after the first.
const PILE505_BOX = { dread: [211, 100], tanker: [145, 44], colony: [150, 56], satellite: [40, 40] };
function pile505Pic(g) {
  if (g.planet) return { im: planetBattlePic(), w: 62, h: 62 };
  const d = HO.getDesign(G, g.o, g.did) || { type: g.type || 'fighter', R: 1, V: 1, W: 1, S: 1 }, im = shipPic(d, g.o);
  const [bw, bh] = PILE505_BOX[d.type] || [120, 40], sc = Math.min(1, bw / im.width, bh / im.height);
  return { im, w: Math.round(im.width * sc), h: Math.round(im.height * sc) };
}
const pile505Size = (w, h, k) => ({ w: w + Math.floor(k / 2) * 2, h: h + (k - 1) * 2 });
function pile505Layout(P) { // the window's own coordinates: a column's first group at 0, its centre at 75
  const at = [[], []]; let H = 140;
  P.cols.forEach((col, ci) => {
    let y = 0, last = null;
    col.forEach((g, k) => {
      if (g.o !== last && y > 0) y += 5;
      last = g.o;
      const x0 = ci ? 465 : 145, dx = g.st === 'o' ? 9 : g.st === 'd' ? -9 : 0;
      at[ci][k] = { x: x0 + dx, y: y + (g.type === 'dread' ? 95 : 75) };
      if (g.planet) y += 84 + 12;
      else { const p = pile505Pic(g); y += pile505Size(p.w, p.h, g.pics0 || 1).h + 24; }
    });
    H = Math.max(H, y + 75);
  });
  return { W: 610, H, at };
}
// one group (FUN_100ac8c0, FUN_100aceb0): the pile, n pictures, the i-th
// 2(n/2 - |i - n/2|) right and 2(i - n/2) down of the first's place, each
// drawn over the last; the last shaded (qd.gray, patOr) over its right
// damage-fraction (all of it when the group is gone); the whole mirrored in
// the right column and centred on the group's place. Over it the owner's
// face (50 x 50) and name (a black pill, white Geneva 9, 11 to 23 below the
// centre); the side's luck, PICT 9017/9018, 132 left of the centre (right
// column: 82 right), 20 above; the words in a black pill 51 wider each side
// than the words, from 2 to 16 below the pile, whose height the window works
// out from the picture count put through the n^0.68 rule twice (FUN_1007fcb0
// called with the count FUN_1007fc20 already made), so a big pile's pill
// sits on its last pictures.
function drawGroup505(x, g, at, ci, font) {
  const p = pile505Pic(g), n = g.planet ? 1 : Math.max(1, g.pics || 1), k2 = Math.floor(n / 2), sz = pile505Size(p.w, p.h, n);
  const c = document.createElement('canvas'); c.width = sz.w; c.height = sz.h;
  const cx = c.getContext('2d');
  for (let j = 0; j < n; j++) {
    const d = j - k2, px = 2 * k2 - 2 * Math.abs(d), py = 2 * (d + k2);
    cx.drawImage(p.im, px, py, p.w, p.h);
    if (j === n - 1 && g.dmg > 0) {
      const sw = Math.trunc(p.w * Math.min(1, g.dmg)), t = document.createElement('canvas'); t.width = t.height = 2;
      const tx = t.getContext('2d'); tx.fillStyle = '#000'; tx.fillRect(0, 0, 1, 1); tx.fillRect(1, 1, 1, 1);
      cx.fillStyle = cx.createPattern(t, 'repeat'); cx.fillRect(px + p.w - sw, py, sw, p.h);
    }
  }
  const l = at.x - Math.trunc(sz.w / 2), tp = at.y - Math.trunc(sz.h / 2);
  x.save(); if (ci) { x.translate(l * 2 + sz.w, 0); x.scale(-1, 1); } x.drawImage(c, l, tp); x.restore();
  const P = G.players[g.o], fk = P && (P.human ? 'white0_' : 'bad' + P.face + '_') + (P && P.female ? 1 : 0), fim = fk && IMG[fk];
  if (fim && fim.complete && fim.naturalWidth) { x.globalAlpha = g.n ? 1 : 0.4; x.drawImage(fim, at.x - 25, at.y - 25, 50, 50); x.globalAlpha = 1; }
  x.font = '9px ' + font; x.textAlign = 'left';
  if (g.owner) {
    const t = g.owner, w = x.measureText(t).width, pl = at.x - w / 2 - 3;
    x.fillStyle = '#000'; roundRect(x, pl, at.y + 11, w + 6, 12, 4); x.fill(); x.fillStyle = '#fff'; x.fillText(t, pl + 3, at.y + 20);
  }
  const lim = g.luck && IMG[g.luck > 0 ? 'm9017' : 'm9018'];
  if (lim && lim.complete && lim.naturalWidth) x.drawImage(lim, ci ? at.x + 82 : at.x - 132, at.y - 20, 40, 40);
  const lh = g.planet ? sz.h : pile505Size(p.w, p.h, g.pics ? Math.max(1, Math.min(30, Math.trunc(0.5 + Math.pow(n, 0.68)))) : 1).h;
  const t = tl(g.text), w = x.measureText(t).width, y0 = at.y + Math.trunc(lh / 2);
  x.fillStyle = '#000'; roundRect(x, at.x - w / 2 - 51, y0 + 2, w + 102, 14, 2.5); x.fill();
  x.fillStyle = '#fff'; x.fillText(t, at.x - w / 2, y0 + 11);
  x.textAlign = 'center';
}
function roundRect(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }

// ----- players -----
function openPlayers() {
  if (skinWindow('players')) return;
  const rows = G.players.map(p => ({ p, sc: HO.score(G, p) })).sort((a, b) => b.sc - a.sc);
  const pacts = HO.feature(G, 'alliances');
  // rs.bestBuddies false: the version had alliances but no best buddies (3.0.1)
  const buddies = pacts && HO.rules(G).bestBuddies !== false;
  const t = el('table', { class: 'ptable' }, el('thead', null, el('tr', null, el('th', null, ''), el('th', null, 'Player'), el('th', null, 'Colonies seen'), el('th', null, 'Status'),
    pacts ? el('th', null, 'Ally') : null, buddies ? el('th', null, 'Best buddy') : null)));
  const tb = el('tbody');
  const mine = me();
  for (const { p } of rows) {
    const face = p.human ? 'white0_' + (p.female ? 1 : 0) : 'bad' + p.face + '_' + (p.female ? 1 : 0);
    const seen = p.human ? HO.colonies(G, ME).length : G.stars.filter(s => { const k = HO.know(G, me(), s.id); return k.explored && k.owner === p.id; }).length;
    let status = p.surrendered ? 'Surrendered' : p.alive ? 'In the game' : 'Eliminated';
    if (pacts && p.id !== 0 && p.alive) {
      const they = (p.allies || []).includes(0), we = (mine.allies || []).includes(p.id);
      if (HO.isBuddy(G, ME, p.id)) status = 'Your best buddy';
      else if (HO.isAllied(G, ME, p.id)) status = 'Your ally' + (buddies && (p.buddies || []).includes(ME) ? ' (offers best buddies)' : '');
      else if (they) status = 'Offers to ally';
      else if (we) status = 'You offered to ally';
    }
    const chk = (kind, on) => el('input', { type: 'checkbox', checked: on ? 'checked' : false, 'aria-label': (kind === 'ally' ? 'Ally with ' : 'Best buddies with ') + p.name,
      onchange: (e) => { HO.setPact(G, ME, p.id, kind, e.target.checked); save(); closeModal(); openPlayers(); } });
    tb.append(el('tr', { class: p.alive ? '' : 'dead' }, el('td', null, el('img', { src: A.img[face], alt: '', class: 'face' })), el('td', null, p.human ? p.name + ' (you)' : p.name), el('td', null, String(seen)), el('td', null, status),
      pacts ? el('td', null, p.id === ME || !p.alive ? '' : chk('ally', (mine.allies || []).includes(p.id))) : null,
      buddies ? el('td', null, p.id === ME || !p.alive ? '' : chk('buddy', (mine.buddies || []).includes(p.id))) : null));
  }
  t.append(tb);
  const h = me().hist;
  const g = el('canvas', { width: 520, height: 160, class: 'graph' });
  const note = pacts ? el('p', { class: 'sub' }, buddies ? 'An alliance or best-buddy pact starts when both sides tick it. Allies don’t fight each other, refuel at each other’s colonies, and win together if every survivor is allied. Best buddies also share what they explore.'
    : 'An alliance starts when both sides tick it. Allies don’t fight each other, refuel at each other’s colonies, and win together if every survivor is allied.') : null;
  const body = el('div', null, t, note, el('h4', null, 'Your history'), g, el('p', { class: 'sub' }, 'Gold: total population. Blue: income. Green: tech.'));
  modal('Players', body, { cls: 'mid' });
  const x = g.getContext('2d');
  x.fillStyle = '#0b0a1a'; x.fillRect(0, 0, 520, 160);
  const plot = (key, color) => {
    if (h.length < 2) return;
    const max = Math.max(...h.map(e => e[key]), 1);
    x.strokeStyle = color; x.lineWidth = 2; x.beginPath();
    h.forEach((e, i) => { const px = 10 + i / (h.length - 1) * 500, py = 150 - e[key] / max * 135; i ? x.lineTo(px, py) : x.moveTo(px, py); });
    x.stroke();
  };
  plot('pop', '#ffd166'); plot('inc', '#7fd0ff'); plot('tech', '#7be37b');
}
const others = () => G.players.filter(p => p.id !== 0 && p.alive && !p.surrendered);
function playerSelect(name) { return el('select', { name }, ...others().map(p => el('option', { value: p.id }, p.name))); }
// the version's own Give window (rs.giveWindow; js/engine.js give, which
// online play records): 'style' '505' (5.0.5's PPob 154: the Recipient
// popup, every player with yourself and those out greyed, and two standing
// sliders from 0 to what you have, any whole amount), 'palm' (tFRM 2500: the
// others in a popup, sliders lying down of 1,000 steps, each a thousandth of
// what you have, rounded down), 'ios' (GiveDialogLayer: a name that a tap
// steps on, sliders lying down of fractions, the check mark and the X),
// 'grid' (3.0.1 and 4.0.5: "Give Stuff To:" over a list of the others'
// icons, 5 a row, and two number fields put back between 0 and what you have
// as they are typed; both 0 gives nothing). W.remember: the player field
// that keeps the last one given to ('chatTo', which 5.0.5's Send Message
// shares; 'giveTo'); W.order: the list's order. Without rs.giveWindow (the
// remake's own rules), number fields.
function giveSlider(max, label, onval, o) {
  o = o || {};
  const s = el('input', { type: 'range', min: 0, max: Math.max(0, max), step: 1, value: 0, 'aria-label': label, disabled: max > 0 ? false : 'disabled', class: o.vertical ? 'vert' : null });
  const set = (v) => { s.value = String(Math.max(0, Math.min(max, v))); onval(+s.value); };
  // keys: an arrow moves a hundredth of the way, Page Up / Down a tenth,
  // Home / End to the ends (the originals' sliders took only the mouse)
  s.addEventListener('keydown', (e) => {
    const k = e.key, step = Math.max(1, Math.round(max / 100)), v = +s.value;
    const to = k === 'ArrowUp' || k === 'ArrowRight' ? v + step : k === 'ArrowDown' || k === 'ArrowLeft' ? v - step
      : k === 'PageUp' ? v + step * 10 : k === 'PageDown' ? v - step * 10 : k === 'Home' ? 0 : k === 'End' ? max : null;
    if (to == null) return;
    e.preventDefault(); set(to);
  });
  s.addEventListener('input', () => onval(+s.value));
  return s;
}
function openGive() {
  const W = G && HO.rules(G).giveWindow;
  if (W) { openGiveWindow(W); return; }
  if (!others().length) { toast(HO.say(G, HO.DATA.alerts[6] || 'There is no one else to give anything to.')); return; }
  const f = el('form', { class: 'newgame', onsubmit: (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const r = HO.give(G, ME, +d.to, +d.money || 0, +d.metal || 0);
    if (r === 'limit') toast(HO.say(G, HO.DATA.alerts[5] || 'Sorry, but you may only give 3 gifts per turn.'));
    else if (r === 'short') toast('You don’t have that much to give.');
    else if (r === 'ok') { Sound.play(5000); closeModal(); renderPanel(); save(); }
  } });
  f.append(el('label', null, el('span', null, 'Give to'), playerSelect('to')),
    el('label', null, el('span', null, `Money (you have ${money(Math.max(0, me().savings))})`), el('input', { name: 'money', type: 'number', min: 0, step: 1000, value: 0 })),
    el('label', null, el('span', null, `Metal (you have ${fmt(me().metal)})`), el('input', { name: 'metal', type: 'number', min: 0, step: 100, value: 0 })),
    el('p', { class: 'sub' }, 'Gifts arrive at the end of the turn. You can give three a turn.'),
    el('div', { class: 'btns right' }, el('button', { type: 'submit' }, 'Give')));
  modal('Give money or metal', f, { cls: 'mid' });
}
function openGiveWindow(W) {
  const p = me(), out = (q) => !q.alive || q.surrendered;
  if ((p.giftsThisTurn || 0) >= 3) { toast(HO.say(G, W.limit || HO.DATA.alerts[5] || 'Sorry, but you may only give 3 gifts per turn.')); return; }
  const order = W.order ? W.order(G) : G.players;
  const can = order.filter(q => q.id !== ME && !out(q));
  const noOne = W.none || HO.DATA.alerts[6] || 'Sorry, but there is no one else alive to give or send something to.';
  if (W.style !== 'grid' && !can.length) { toast(HO.say(G, noOne)); return; }
  const last = W.remember ? p[W.remember] : null;
  const first = can.some(q => q.id === last) ? last : can.length ? can[0].id : null;
  const have = Math.max(0, p.savings), hasM = Math.max(0, p.metal);
  const give = (to, m, x) => {
    const r = HO.give(G, ME, to, m, x);
    if (r === 'limit') { toast(HO.say(G, W.limit || HO.DATA.alerts[5])); return; }
    if (r !== 'ok') return;
    if (W.remember) p[W.remember] = to;
    Sound.play(5000); closeModal(); renderPanel(); save();
  };
  const cancel = el('button', { type: 'button', class: 'quiet', onclick: closeModal }, W.cancel || 'Cancel');
  if (W.style === 'grid') {
    // the list: cols x rows cells, the others' icons and names, the empty
    // cells left blank (a click there picks nothing)
    let pick = first;
    const n = (W.cols || 5) * (W.rows || 4), cells = [];
    const face = (q) => A.img[q.human ? 'white0_' + (q.female ? 1 : 0) : 'bad' + q.face + '_' + (q.female ? 1 : 0)];
    const mark = () => { for (const c of cells) if (c.dataset.pid) { const on = +c.dataset.pid === pick; c.classList.toggle('on', on); c.setAttribute('aria-checked', on ? 'true' : 'false'); c.tabIndex = on || (pick == null && c === cells[0]) ? 0 : -1; } };
    const grid = el('div', { class: 'givegrid', role: 'radiogroup', 'aria-label': W.to, style: `--cols:${W.cols || 5};--cell:${W.cell || 45}px` });
    for (let i = 0; i < n; i++) {
      const q = can[i];
      const c = q ? el('div', { class: 'givecell', role: 'radio', tabindex: -1, 'data-pid': q.id, onclick: () => { pick = q.id; mark(); } },
        face(q) ? el('img', { src: face(q), alt: '' }) : null, el('span', { translate: 'no' }, q.name)) : el('span', { class: 'givecell empty' });
      cells.push(c); grid.append(c);
    }
    grid.addEventListener('keydown', (e) => {
      const live = cells.filter(c => c.dataset.pid), i = live.findIndex(c => +c.dataset.pid === pick), cols = W.cols || 5;
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, ' ': 0, Enter: 0 }[e.key];
      if (d == null || !live.length) return;
      e.preventDefault();
      const at = live.indexOf(document.activeElement), j = d === 0 ? Math.max(0, at) : Math.max(0, Math.min(live.length - 1, (i < 0 ? 0 : i) + d));
      pick = +live[j].dataset.pid; mark(); live[j].focus();
    });
    mark();
    // the fields: each change puts the number back between 0 and what you have
    const field = (name, max) => {
      const f = el('input', { type: 'text', inputmode: 'numeric', name, value: '0', 'aria-label': name === 'money' ? W.money : W.metal, autocomplete: 'off', size: 9 });
      f.addEventListener('input', () => { const t = f.value.trim(), v = Math.max(0, Math.min(max, parseInt(t, 10) || 0)); if (t !== String(v)) f.value = String(v); });
      return f;
    };
    const fm = field('money', have), fx = field('metal', hasM);
    const f = el('form', { class: 'origwin give-grid', onsubmit: (e) => {
      e.preventDefault();
      const m = +fm.value || 0, x = +fx.value || 0;
      if (!(m > 0 || x > 0) || pick == null) { closeModal(); return; } // nothing to give: the window just closes
      give(pick, m, x);
    } }, el('div', { class: 'givecols' },
      el('div', null, el('p', { class: 'gtitle' }, W.to), grid),
      el('div', { class: 'givef' }, el('label', null, el('span', null, W.money), fm), el('label', null, el('span', null, W.metal), fx),
        el('div', { class: 'btns col' }, cancel, el('button', { type: 'submit' }, W.ok)))));
    modal('', f, { cls: 'mid', label: W.ok });
    fm.focus(); fm.select();
    return;
  }
  // the recipient: 5.0.5's and the Palm's popup, iOS's name to tap
  let toPick = first;
  let who;
  if (W.style === 'ios') {
    const btn = el('button', { type: 'button', class: 'givetoggle', translate: 'no', onclick: () => { const i = can.findIndex(q => q.id === toPick); toPick = can[(i + 1) % can.length].id; btn.textContent = G.players[toPick].name; } }, G.players[toPick].name);
    who = el('div', { class: 'giverow' }, el('span', null, W.recipient), btn);
  } else {
    const list = W.style === '505' ? G.players : can;
    const sel = el('select', { name: 'to', 'aria-label': W.recipient, translate: 'no', onchange: () => { toPick = +sel.value; } },
      ...list.map(q => el('option', { value: q.id, disabled: q.id === ME || out(q) ? 'disabled' : false, selected: q.id === first ? 'selected' : false }, q.name)));
    who = el('label', { class: 'giverow' }, el('span', null, W.recipient), sel);
  }
  // the amounts
  let mAmt = 0, xAmt = 0;
  const amtOf = W.style === 'palm' ? (H, v) => v >= W.steps ? H : v <= 0 ? 0 : Math.trunc(H / W.steps) * v
    : W.style === 'ios' ? (H, v) => Math.trunc(Math.fround(Math.fround(H) * Math.fround(v / 10000))) : (H, v) => v;
  const range = W.style === 'palm' ? () => W.steps : W.style === 'ios' ? () => 10000 : (H) => H;
  const moneyText = (n) => W.style === 'ios' ? money(n) : '$' + fmt(n);
  const mOut = el('output', null, W.style === '505' ? fmt(0) : moneyText(0)), xOut = el('output', null, fmt(0));
  const ms = giveSlider(have > 0 ? range(have) : 0, W.money, (v) => { mAmt = amtOf(have, v); mOut.textContent = W.style === '505' ? fmt(mAmt) : moneyText(mAmt); }, { vertical: W.style === '505' });
  const xs = giveSlider(hasM > 0 ? range(hasM) : 0, W.metal, (v) => { xAmt = amtOf(hasM, v); xOut.textContent = fmt(xAmt); }, { vertical: W.style === '505' });
  const okBtn = W.okPic && A.img[(T.prefix || '') + W.okPic], noBtn = W.cancelPic && A.img[(T.prefix || '') + W.cancelPic];
  const pb = (img, text, attrs) => el('button', Object.assign({ class: img ? 'picbtn' : null, 'aria-label': img ? text : null }, attrs), img ? el('img', { src: img, alt: '' }) : text);
  const btns = el('div', { class: 'btns right' }, pb(noBtn, W.cancel || 'Cancel', { type: 'button', class: noBtn ? 'picbtn' : 'quiet', onclick: closeModal }), pb(okBtn, W.ok, { type: 'submit' }));
  let body;
  if (W.style === '505') {
    // two columns: "Money: $" and the amount over the slider, its most at the
    // top and 0 at the foot, the 11 tick marks beside it
    const ticks = () => el('div', { class: 'giveticks', 'aria-hidden': 'true' }, ...Array.from({ length: W.ticks || 11 }, () => el('i')));
    const col = (label, dollar, out, s, top) => el('div', { class: 'givecol' },
      el('div', { class: 'giveamt' }, el('span', null, label), dollar ? el('span', null, '$') : null, out),
      el('div', { class: 'givesl' }, s, ticks(), el('div', { class: 'giveends' }, el('span', null, top), el('span', null, '0'))));
    body = el('div', null, who, el('div', { class: 'givecols' }, col(W.money, true, mOut, ms, '$' + fmt(p.savings)), col(W.metal, false, xOut, xs, fmt(p.metal))));
  } else {
    // a label and the amount, the slider lying down, its ends under it
    const row = (label, out, s, lo, hi) => el('div', { class: 'giverow2' }, el('div', { class: 'giveamt' }, el('span', null, label), out), s,
      el('div', { class: 'giveends' }, el('span', null, lo), el('span', null, hi)));
    body = el('div', null, who, row(W.money, mOut, ms, moneyText(0), moneyText(have)), row(W.metal, xOut, xs, fmt(0), fmt(hasM)));
  }
  const f = el('form', { class: 'origwin give' + W.style, onsubmit: (e) => { e.preventDefault(); if (toPick != null) give(toPick, mAmt, xAmt); } }, body, btns);
  modal(W.title, f, { cls: 'small' });
}
// the version's own Send Message window (rs.cannedChat, js/engine.js
// sendCanned): 'popup' (5.0.5, the Palm) two menus, To Whom and Say What;
// 'steps' (2.0, 3.0.1, 4.0.5) the columns filled one after another, here a
// menu each: to whom, saying what, then what the message needs (a star, a
// player, a line of text, or 2.0's "About What?" and "Which One?")
function chatLimitToast() {
  // rs.chatLimit, a number or (G) => one (5.0.5: 3, its Send Message greyed out once three are sent)
  const L = HO.rules(G).chatLimit, n = typeof L === 'function' ? L(G) : L;
  toast(n === 10 ? 'Sorry, you can only send ten messages per turn.' : `You have sent the ${n} messages you may send this turn.`);
}
function openCanned(C) {
  const send = (m) => {
    const r = HO.sendCanned(G, ME, m);
    if (r === 'limit') { chatLimitToast(); return; }
    if (r !== 'ok') return;
    Sound.play(5000); closeModal(); save();
  };
  const sel = (name, opts, cur) => el('select', { name, 'aria-label': name }, ...opts.map(o => el('option', { value: String(o[0]), disabled: o[2] ? 'disabled' : false, selected: String(o[0]) === String(cur) ? 'selected' : false }, o[1])));
  const val = (v) => /^\d+$/.test(v) ? +v : v;
  const tos = C.to(G, ME), ok = tos.filter(o => !o[2]);
  if (!ok.length) { toast(HO.say(G, HO.DATA.alerts[6] || 'There is no one else to send something to.')); return; }
  const f = el('form', { class: 'newgame' });
  if (C.style === 'popup') {
    const cur = C.remember && ok.some(o => o[0] === me().chatTo) ? me().chatTo : ok[0][0];
    const to = sel('to', tos, cur), say = sel('say', C.lines.map((l, i) => [i, l]), 0);
    f.addEventListener('submit', guard((e) => {
      e.preventDefault();
      const t = val(to.value);
      if (C.remember) me().chatTo = t;
      send(C.make(G, ME, t, +say.value));
    }));
    f.append(el('label', null, el('span', null, C.prompts[0]), to), el('label', null, el('span', null, C.prompts[1]), say),
      el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, C.buttons[0]), el('button', { type: 'submit' }, C.buttons[1])));
    modal(C.title, f, { cls: 'mid' });
    return;
  }
  const to = sel('to', tos, ok[0][0]), say = sel('say', C.actions.map((a, i) => [i, a.label]), 0), more = el('div');
  let parts = [];
  const build = () => {
    more.textContent = ''; parts = [];
    let kind = null;
    for (const [prompt, k, opts] of C.actions[+say.value].parts) {
      let c;
      if (k === 'text') c = el('input', { name: prompt, maxlength: opts || 24, 'aria-label': prompt });
      else if (k === 'about') { c = sel(prompt, opts.map((o, i) => [i, o[0]]), 0); c.addEventListener('change', guard(() => build2())); kind = opts; }
      else c = sel(prompt, C.list(G, ME, k === 'which' ? kind[0][1] : k, UI.sel), null);
      c.dataset.kind = k;
      parts.push(c);
      more.append(el('label', null, el('span', null, prompt.replace('\n', ' ')), c));
    }
  };
  // 2.0's "Which One?" follows its "About What?"
  const build2 = () => {
    const a = parts.find(x => x.dataset.kind === 'about'), w = parts.find(x => x.dataset.kind === 'which');
    if (!a || !w) return;
    const opts = C.actions[+say.value].parts.find(x => x[1] === 'about')[2];
    const n = sel(w.name, C.list(G, ME, opts[+a.value][1], UI.sel), null); n.dataset.kind = 'which';
    w.replaceWith(n); parts[parts.indexOf(w)] = n;
  };
  say.addEventListener('change', guard(() => { build(); build2(); }));
  build(); build2();
  f.addEventListener('submit', guard((e) => {
    e.preventDefault();
    const v = parts.map(x => x.dataset.kind === 'text' ? null : val(x.value));
    if (parts.some(x => x.dataset.kind !== 'text' && x.value === '')) return;
    const t = parts.find(x => x.dataset.kind === 'text');
    if (t) v.text = t.value;
    send(C.make(G, ME, val(to.value), +say.value, v));
  }));
  f.append(el('label', null, el('span', null, C.prompts[0].replace('\n', ' ')), to), el('label', null, el('span', null, C.prompts[1]), say), more,
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'Send')));
  modal(C.title, f, { cls: 'mid' });
}
function openChat() {
  if (HO.rules(G).cannedChat) { openCanned(HO.rules(G).cannedChat); return; }
  if (!others().length) { toast(HO.say(G, HO.DATA.alerts[6] || 'There is no one else to send something to.')); return; }
  const lines = ['Thank You!', 'Sorry!', '#!$@*$&@•™!', 'I need money.', 'I need metal.', 'I like you.', 'I hate you.', 'Let’s be allies.'];
  const f = el('form', { class: 'newgame', onsubmit: (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const text = (d.custom || '').trim() || d.line;
    if (HO.sendChat(G, ME, +d.to, text) === 'limit') { chatLimitToast(); return; }
    Sound.play(5000); closeModal(); save();
  } });
  f.append(el('label', null, el('span', null, 'Send to'), playerSelect('to')),
    el('label', null, el('span', null, 'Say'), el('select', { name: 'line' }, ...lines.map(l => el('option', { value: l }, l)))),
    el('label', null, el('span', null, 'Or type your own'), el('input', { name: 'custom', maxlength: 80 })),
    el('div', { class: 'btns right' }, el('button', { type: 'submit' }, 'Send')));
  modal('Send a message', f, { cls: 'mid' });
}
// Fix Spending (rs.fixSpending: 1.2, 2.0, 3.0.1; the Galaxy menu): the
// original put each step's line in the map window's message bubble, and a
// click on the bubble took the next step, until the last slot, when the
// bubble went back to the reports. Here the line is a small window's: Next
// is the click on the bubble, Done leaves the bubble. The budget bars move
// with each step (rules-dos fixSpending20, rules-301 fixSpending301).
function openFixSpending() {
  const FS = HO.rules(G).fixSpending; if (!FS) return;
  let cur = -1;
  const line = el('p', { class: 'fixline', role: 'status' });
  const next = el('button', { onclick: () => step() }, 'Next');
  const step = () => {
    const r = FS.next(G, me(), cur); cur = r.cur;
    renderPanel(); save();
    if (r.text == null) { closeModal(); return; }
    line.textContent = r.text;
  };
  modal('Fix Spending', el('div', null, line, el('div', { class: 'btns right' }, el('button', { class: 'quiet', onclick: closeModal }, 'Done'), next)), { cls: 'small' });
  step();
  if (UI.modal) next.focus();
}
// the version's own words for a window (rs.windowWords, 5.0.5: its PPobs)
const winWords = (k) => (G && (HO.rules(G).windowWords || {})[k]) || null;
function openDip() {
  const p = me();
  // 5.0.5's Dip Into Savings (PPob 157): the question, a slider standing up,
  // 30% at the top, the note, Cancel and OK
  const W = winWords('dip');
  if (W) {
    const max = HO.rules(G).dipMax || 100;
    const out = el('b', null, (p.dip || 0) + '%');
    const f = el('form', { class: 'origwin dip505', onsubmit: (e) => { e.preventDefault(); const v = +new FormData(f).get('dip'); const rs = HO.rules(G); if (rs.dipSet) rs.dipSet(G, p, v); else p.dip = v; closeModal(); renderPanel(); save(); } },
      el('div', { class: 'dipbox' }, el('p', null, W.text),
        el('div', { class: 'dipslider' }, el('input', { name: 'dip', type: 'range', min: 0, max, step: 1, value: p.dip || 0, 'aria-label': W.title, oninput: (e) => { out.textContent = e.target.value + '%'; } }),
          el('div', { class: 'dipmarks' }, ...W.marks.map(m => el('span', null, m))))),
      el('p', { class: 'note' }, W.note, ' ', out),
      el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, W.cancel), el('button', { type: 'submit' }, W.ok)));
    modal(W.title, f, { cls: 'small' });
    return;
  }
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); const v = +new FormData(f).get('dip'); const rs = HO.rules(G); if (rs.dipSet) rs.dipSet(G, p, v); else p.dip = v; closeModal(); renderPanel(); save(); } });
  const out = el('b', null, (p.dip || 0) + '%');
  f.append(el('label', null, el('span', null, 'Each turn, move this share of your savings into the budget'),
    el('input', { name: 'dip', type: 'range', min: 0, max: HO.rules(G).dipMax || 100, step: HO.rules(G).dipMax ? 1 : 5, value: p.dip || 0, oninput: (e) => { out.textContent = e.target.value + '%'; } }), out),
    el('div', { class: 'btns right' }, el('button', { type: 'submit' }, 'OK')));
  modal('Dip into savings', f, { cls: 'small' });
}
function openSurrender() {
  const p = me();
  // 5.0.5's Surrender (PPob 147, FUN_1005d5a0): every player in the menu,
  // yourself and those out greyed, then "No One"; picked: the one you are
  // surrendering to, else "No One". OK the first time asks Alert 2; Cancel
  // while surrendering takes it back (Alert 3)
  const W = winWords('surrender');
  if (W) {
    const cur = p.surrenderTo;
    const sel = el('select', { name: 'to', 'aria-label': W.text }, ...G.players.map(q => el('option', { value: q.id, disabled: q.id === ME || !q.alive || q.surrendered ? 'disabled' : false, selected: cur === q.id ? 'selected' : false }, q.name)),
      el('option', { disabled: 'disabled' }, '-'), el('option', { value: -1, selected: cur == null || cur === -1 ? 'selected' : false }, W.noOne));
    const set = (to) => { HO.surrender(G, ME, to); save(); renderPanel(); };
    const f = el('form', { class: 'newgame', onsubmit: (e) => {
      e.preventDefault();
      const to = +sel.value;
      closeModal();
      if (cur == null) confirmBox(HO.say(G, HO.DATA.alerts[1] || 'Do you really want to surrender?'), () => set(to));
      else if (to !== cur) set(to);
    } }, el('p', null, W.text), sel,
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: () => {
      closeModal();
      if (cur != null) { set(null); toast(HO.say(G, HO.DATA.alerts[2] || 'You are no longer surrendering to anyone.')); } // (engine surrender reports it too)
    } }, W.cancel), el('button', { type: 'submit' }, W.ok)));
    modal(W.title, f, { cls: 'small' });
    return;
  }
  if (p.surrenderTo != null) { confirmBox('You are surrendering at the end of this turn. Take it back?', () => { HO.surrender(G, ME, null); save(); }); return; }
  const sel = el('select', { name: 'to' }, ...others().map(q => el('option', { value: q.id }, q.name)), el('option', { value: -1 }, 'No one'));
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); HO.surrender(G, ME, +sel.value); closeModal(); save(); toast('You will surrender at the end of this turn.'); } });
  f.append(el('p', null, HO.say(G, HO.DATA.alerts[1] || 'Do you really want to surrender?')),
    el('label', null, el('span', null, 'Surrender to'), sel),
    el('p', { class: 'sub' }, 'Your fleets are dismantled. Whoever you surrender to gets your savings, your metal, and your planets.'),
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'Surrender')));
  modal('Surrender', f, { cls: 'mid' });
}
function toggleArmageddon() {
  const p = me();
  if (p.armageddon) { HO.setArmageddon(G, ME, false); toast(HO.say(G, HO.DATA.alerts[4] || 'Whew!')); save(); return; }
  // 4.0.5's two questions, each drawn from its list (rs.armageddonAsk); with
  // Full Hoedown, the later versions ask them too (rs.hoedown.armageddon)
  const hq = HO.rules(G).armageddonAsk || (HO.hoedown(G) && HO.ownRules(G).hoedown.armageddon);
  const any = (L) => L[Math.floor(Math.random() * L.length)];
  if (hq) return confirmBox(HO.say(G, any(hq[0])), () => confirmBox(HO.say(G, any(hq[1])), () => { HO.setArmageddon(G, ME, true); save(); toast('The armageddon device is on. It fires when every human player has turned theirs on.'); }));
  confirmBox(HO.say(G, HO.DATA.alerts[3] || 'Are you sure you want to destroy half the galaxy?'), () => { HO.setArmageddon(G, ME, true); save(); toast('The armageddon device is on. It fires when every human player has turned theirs on.'); });
}

function table(head, rows) {
  return el('table', { class: 'ptable list' }, el('thead', null, el('tr', null, ...head.map(h => el('th', null, h)))), el('tbody', null, ...rows));
}
function openFleetList() {
  if (skinWindow('fleets')) return;
  const mine = fleetOrder(G.fleets.filter(f => f.owner === ME));
  const rows = mine.map(f => {
    const where = f.star != null ? G.stars[f.star].name : `${G.stars[f.from].name} → ${G.stars[f.to].name}`;
    const go = f.dest != null ? G.stars[f.dest].name + (f.path && f.path.length ? ' → …' : '') : f.to != null ? `${Math.ceil((f.dist - f.prog) / HO.fleetSpeed(G, f))} turn(s)` : '';
    return el('tr', { class: 'click' + (f.scrap301 ? ' scrap' : ''), title: f.scrap301 ? markedLine() : null, onclick: () => { UI.selFleet = f.id; UI.sel = f.star != null ? f.star : f.to; closeModal(); renderPanel(); draw(); } },
      el('td', null, HO.fleetLabel(G, f)), el('td', null, where), el('td', null, f.scrap301 ? 'to be scrapped' : go), el('td', null, f.sat ? '' : `${Math.floor(f.fuel)}/${HO.fleetMaxRange(G, f)}`));
  });
  // 5.0.5's List All Fleets (PPob 166): its title and its line under the list
  const W = winWords('fleets');
  const list = mine.length ? table(['Fleet', 'Where', 'Going to', 'Fuel'], rows) : el('p', null, 'You have no fleets.');
  modal(W ? W.title : 'All your fleets', W ? el('div', null, list, el('p', { class: 'note' }, W.note)) : list, { cls: 'mid' });
}
function openScrapTypes() {
  if (skinWindow('types')) return;
  const p = me();
  const count = {}; for (const f of G.fleets) if (f.owner === ME) for (const k in f.ships) count[k] = (count[k] || 0) + f.ships[k];
  const live = p.designs.filter(d => !d.scrapped);
  if (marksScrapDesign()) {
    // marks, as the Ship Types window's "Scrap All" / "Don't Scrap": a
    // marked type and every ship of it are scrapped at End Turn
    // (rs.scrapWords.typeCheck: 2.0's is a check box, "Scrap This Type",
    // dialog 31 item 400 / DITL 6000 item 17)
    const flip = (d) => { HO.rules(G).flagScrapDesign(G, p, d, 'command'); save(); closeModal(); openScrapTypes(); };
    const check = !!(HO.rules(G).scrapWords || {}).typeCheck;
    const rows = live.map(d => el('tr', { class: d.scrap301 ? 'scrap' : null },
      el('td', null, shipImgEl(d, 18), ' ', d.name), el('td', null, HO.TYPES[d.type].name), el('td', null, String(count[d.id] || 0)),
      el('td', null, check ? el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: d.scrap301 ? 'checked' : false, onchange: () => flip(d) }), el('span', null, scrapWords('type')[0]))
        : el('button', { class: 'quiet', onclick: () => flip(d) }, scrapWords('type')[d.scrap301 ? 1 : 0]))));
    // 5.0.5's Scrap Ship Types (PPob 165): its title and its two lines
    const W = winWords('scrapTypes');
    modal(W ? W.title : 'Scrap ship types', el('div', null, ...(W ? W.lines.map(t => el('p', { class: 'sub' }, t)) : [el('p', { class: 'sub' }, `A type marked here is scrapped at the end of the turn, with every ship of it, and frees an assembly line${HO.rules(G).maxDesigns ? ` (you can have ${HO.rules(G).maxDesigns})` : ''}. Until then you can take the mark off.`)]),
      table(['Type', 'Class', 'Ships', ''], rows)), { cls: 'mid' });
    return;
  }
  const picked = new Set();
  const go = el('button', { disabled: true }, 'Scrap checked types…');
  const update = () => { go.disabled = !picked.size; go.textContent = picked.size > 1 ? `Scrap ${picked.size} types…` : 'Scrap checked types…'; };
  const rows = live.map(d => el('tr', null,
    el('td', null, el('input', { type: 'checkbox', 'aria-label': 'Scrap ' + d.name, onchange: (e) => { if (e.target.checked) picked.add(d.id); else picked.delete(d.id); update(); } })),
    el('td', null, shipImgEl(d, 18), ' ', d.name), el('td', null, HO.TYPES[d.type].name), el('td', null, String(count[d.id] || 0))));
  // one confirmation listing every type and how many ships go with it
  go.addEventListener('click', () => {
    const ds = live.filter(d => picked.has(d.id));
    const list = el('ul', null, ...ds.map(d => el('li', null, `${d.name} (${HO.TYPES[d.type].name}): ${count[d.id] || 0} ship${count[d.id] === 1 ? '' : 's'}`)));
    const ships = ds.reduce((a, d) => a + (count[d.id] || 0), 0);
    confirmBox(el('div', null, el('p', null, `Scrap ${ds.length === 1 ? 'this ship type' : `these ${ds.length} ship types`} and all ${ships} existing ship${ships === 1 ? '' : 's'} of ${ds.length === 1 ? 'it' : 'them'}?`), list), () => {
      let m = 0; for (const d of ds) m += HO.scrapDesign(G, ME, d.id);
      Sound.play(7003); toast(`Scrapped ${ds.length} type${ds.length === 1 ? '' : 's'} for ${fmt(m)} metal.`);
      if (UI.selFleet != null && !G.fleets.some(f => f.id === UI.selFleet)) UI.selFleet = null;
      renderPanel(); draw(); save();
    });
  });
  modal('Scrap ship types', el('div', null, el('p', { class: 'sub' }, `Retiring a type frees an assembly line${HO.rules(G).maxDesigns ? ` (you can have ${HO.rules(G).maxDesigns})` : ''} and scraps every ship of that type. Check the types to retire.`),
    table(['', 'Type', 'Class', 'Ships'], rows), el('div', { class: 'btns right' }, go)), { cls: 'mid' });
}
function openBattleList() {
  const bs = G.battles.filter(b => b.sides.includes(ME)).reverse();
  if (!bs.length) { toast('No battles yet.'); return; }
  const rows = bs.map(b => el('tr', { class: 'click', onclick: () => { closeModal(); openBattle(b.id); } }, el('td', null, G.stars[b.star].name + (b.duel != null ? ` (duel ${b.duel + 1})` : '')), el('td', null, String(b.year)),
    el('td', null, b.sides.filter(o => o !== ME).map(o => G.players[o].name).join(', ')), el('td', null, `${b.lost[ME] || 0} / ${b.sides.filter(o => o !== ME).reduce((a, o) => a + (b.lost[o] || 0), 0)}`)));
  modal('Review battle', table(['Star', 'Year', 'Against', 'Lost (you / them)'], rows), { cls: 'mid' });
}
function openStarList() {
  if (skinWindow('stars')) return;
  if (HO.rules(G).exploredList) return openExploredList();
  const p = me();
  const ks = G.stars.map(s => ({ s, k: HO.know(G, p, s.id) })).filter(o => o.k.explored);
  const rows = ks.map(({ s, k }) => {
    const src = s.owner === ME ? s : k;
    const owner = s.owner === ME ? 'You' : k.owner >= 0 && G.players[k.owner] ? G.players[k.owner].name : '';
    return el('tr', { class: 'click', onclick: () => { UI.sel = s.id; closeModal(); renderPanel(); draw(); } }, el('td', null, s.name), el('td', null, (src.g / p.homeG).toFixed(2) + 'G'),
      el('td', null, degF(72 + (src.t - p.homeT))), el('td', null, fmt(src.metal)), el('td', null, owner), el('td', null, src.pop ? fmt(src.pop * 1e6) : ''));
  });
  modal('Explored stars', table(['Star', 'Gravity', 'Temp', 'Metal', 'Owner', 'Population'], rows), { cls: 'mid' });
}
// The version's own Explored Planets window (rs.exploredList, 1.2 and 2.0:
// ListExploredStars, LISTSTARSDLGPROC): the stars your record has explored
// or seen owned, nobody's by quality, then other players' by name and then
// by quality, then yours by name (the original's swap sorts); each row the
// name, the climate, the metal and Own, Explored or Enemy; Go To Star
function openExploredList() {
  const L = HO.rules(G).exploredList, p = me();
  const rec = (s) => s.owner === ME ? { explored: true, owner: ME, g: s.g, t: s.t, metal: s.metal } : HO.know(G, p, s.id);
  const seen = G.stars.filter(s => { const k = rec(s); return k.explored || k.owner >= 0; });
  const ownerOf = (s) => rec(s).owner;
  const free = seen.filter(s => ownerOf(s) < 0), other = seen.filter(s => ownerOf(s) >= 0 && ownerOf(s) !== ME), mine = seen.filter(s => ownerOf(s) === ME);
  const q = (s) => { const k = rec(s); return k.explored ? L.quality(p, k) : 0; };
  // the original's sort: for each place, swap in any later one that should go first
  const swapSort = (a, before) => { for (let i = 0; i < a.length - 1; i++) for (let j = i + 1; j < a.length; j++) if (before(a[j], a[i])) { const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const byQ = (x, y) => q(x) > q(y), byName = (x, y) => x.name < y.name;
  const list = swapSort(free, byQ).concat(swapSort(swapSort(other, byName), byQ), swapSort(mine, byName));
  let pick = null;
  const go = el('button', { disabled: true, onclick: () => { if (pick == null) return; closeModal(); UI.sel = pick; centerOn(pick); renderPanel(); draw(); } }, L.go);
  const rows = list.map(s => {
    const k = rec(s), o = ownerOf(s);
    const climate = k.explored ? `${degF(72 + (k.t - p.homeT))}  ${(k.g / p.homeG).toFixed(2)}G` : L.noClimate;
    const tr = el('tr', { class: 'click', tabindex: 0, onclick: () => { pick = s.id; go.disabled = false; for (const r of tr.parentNode.children) r.classList.toggle('sel', r === tr); },
      ondblclick: () => { pick = s.id; go.click(); } },
      el('td', null, s.name), el('td', null, climate), el('td', null, k.explored ? fmt(Math.max(0, k.metal || 0)) : ''), el('td', null, o === ME ? L.own : o < 0 ? L.free : L.enemy));
    return tr;
  });
  modal(L.title.replace(/:$/, ''), el('div', null, el('p', { class: 'sub' }, L.title), el('table', { class: 'ptable list' }, el('tbody', null, ...rows)),
    el('div', { class: 'btns right' }, go, el('button', { onclick: closeModal }, 'OK'))), { cls: 'mid' });
}
// the computer plays this one turn for you (the Game menu's "Auto-play this
// turn"; iOS's Play One Turn)
function playOneTurn() {
  if (!G || G.over) return;
  // online: the computers' code plays this player's turn here, as their orders (recorded), and End Turn sends them
  if (G.online) { if (ONL.sent || !onlineCanMove()) return; HO.aiOf(G).turn(G, me()); renderPanel(); draw(); doEndTurn(true); return; }
  me().auto = true; doEndTurn(); me().auto = false;
}
// Auto Play: keep ending turns until something interesting happens
function openAutoPlay() {
  if (HO.rules(G).autoPlayWindow === 'ios') return openAutoPlayIOS();
  if (HO.rules(G).autoPlayWindow === '505') return openAutoPlay505();
  const f = el('form', { class: 'newgame', onsubmit: (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    if (sl) sl.apply();
    closeModal(); runAutoPlay({ turns: +d.turns || 10, computer: d.mode === 'computer', won: !!d.won, lost: !!d.lost, news: !!d.news });
  } });
  let sl = null; // the Palm OS: the auto play settings on this form (autoPlayWhere)
  f.append(el('label', null, el('span', null, 'Play'), el('select', { name: 'mode' }, el('option', { value: 'computer' }, 'Have the computer play for me'), el('option', { value: 'end' }, 'Just end my turns'))),
    el('label', null, el('span', null, 'For up to this many turns'), el('input', { name: 'turns', type: 'number', min: 1, max: 500, value: 20 })),
    el('fieldset', { class: 'opts' }, el('legend', null, 'Stop when something interesting happens'),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'won', checked: 'checked' }), el('span', null, 'Battles I win')),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'lost', checked: 'checked' }), el('span', null, 'Battles I lose')),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'news', checked: 'checked' }), el('span', null, 'Colonies, tech levels and other news'))),
    ...(autoPlayWhere() === 'autoplay' ? [(sl = autoPlaySliders()).box] : []),
    el('div', { class: 'btns right' }, ...(autoPlayWhere() === 'config' ? [el('button', { type: 'button', class: 'quiet', onclick: () => { closeModal(); openAutoPlaySettings(openAutoPlay); } }, 'Config…')] : []),
      el('button', { type: 'submit' }, 'Start')));
  modal('Auto play', f, { cls: 'mid' });
}
// A battle report says whether you won in m.won (set by engine.js
// battleNews, or by a ruleset that writes its own reports: won: true or
// false). Older reports and rulesets marked a win only by its sound, 7027;
// both are read for now.
const isBattleNews = (m) => m.battle != null || m.won != null;
const wonBattle = (m) => m.won === true || (m.won == null && m.sound === 7027);
// iOS 1.2.9's Auto Play window (rs.autoPlayWindow 'ios', AutoPlayLayer;
// Misc Strings 130-136): Computer Play For Me or Just End My Turns Only, Do or
// Do NOT Turn Off When Something Interesting Happens, and Click through the
// messages every 0-10 seconds; it plays until its STOP button (138). "Play
// One Turn" is the Game menu's own item. (The window's defaults are the
// remake's guess.)
function openAutoPlayIOS() {
  const D = HO.rules(G).autoPlayDefaults || { stop: true, every: 4 };
  const secs = el('b', null, String(D.every || 0));
  let sl = null; // the auto play settings, when the ruleset keeps them on this window
  const f = el('form', { class: 'newgame autoplay-ios', onsubmit: (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries()), stop = !!d.stop;
    if (sl) sl.apply();
    closeModal(); runAutoPlay({ turns: Infinity, computer: d.mode === 'computer', won: stop, lost: stop, news: stop, every: +d.every || 0, stopButton: true });
  } });
  f.append(el('label', null, el('span', null, 'Play'), el('select', { name: 'mode' }, el('option', { value: 'computer' }, 'Computer Play For Me'), el('option', { value: 'end' }, 'Just End My Turns Only'))),
    el('label', { class: 'chk switchrow' }, el('span', null, 'Turn Off When Something Interesting Happens'), el('input', { type: 'checkbox', class: 'switch', role: 'switch', name: 'stop', checked: D.stop !== false ? 'checked' : false })),
    el('label', null, el('span', null, 'Click through the messages every'),
      el('span', { class: 'slider' }, el('input', { type: 'range', name: 'every', min: 0, max: 10, value: D.every || 0, oninput: (e) => { secs.textContent = e.target.value; } }), el('output', null, secs, ' seconds'))),
    ...(autoPlayWhere() === 'autoplay' ? [(sl = autoPlaySliders()).box] : []),
    el('div', { class: 'btns right' }, ...(autoPlayWhere() === 'config' ? [el('button', { type: 'button', class: 'quiet', onclick: () => { closeModal(); openAutoPlaySettings(openAutoPlay); } }, 'Config…')] : []),
      // Play One Turn: the computer plays this one turn for you
      el('button', { type: 'button', class: 'quiet', onclick: () => { if (sl) sl.apply(); closeModal(); playOneTurn(); } }, 'Play One Turn'),
      el('button', { type: 'submit' }, 'Start')));
  modal('Auto Play', f, { cls: 'mid' });
}
// 5.0.5's Auto Play window (rs.autoPlayWindow '505'; FUN_1005ec40, PPob 159,
// docs/505-windows.md): the "Auto Play" check box over the rest; "Have
// Computer Play For Me" with the Friendly-Aggressive and No Defense-Dig In
// sliders under it (enabled only when it is picked), "Just End My Turns";
// "Turn Off When Something Interesting Happens" ("Battles, colonizations,
// tech level changes, etc."); "Click through messages every:" 0-10 Seconds;
// Cancel and OK. Its first settings are the preferences' (rs.autoPlayDefaults:
// FUN_10072490); the remake keeps the window's in this browser (Prefs.auto505).
function openAutoPlay505() {
  const D = Object.assign({ on: true, computer: true }, HO.rules(G).autoPlayDefaults || { stop: true, every: 4 }, Prefs.auto505 || {});
  const sl = autoPlaySliders();
  const secs = el('b', null, String(D.every));
  const radio = (value, text) => el('label', { class: 'chk' }, el('input', { type: 'radio', name: 'mode', value, checked: (value === 'computer') === !!D.computer ? 'checked' : false }), el('span', null, text));
  const f = el('form', { class: 'origwin autoplay505', onsubmit: (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const o = { on: !!d.on, computer: d.mode === 'computer', stop: !!d.stop, every: +d.every || 0 };
    Prefs.auto505 = o; savePrefs();
    sl.apply();
    closeModal();
    if (o.on) runAutoPlay({ turns: Infinity, computer: o.computer, won: o.stop, lost: o.stop, news: o.stop, every: o.every, stopButton: true });
  } });
  const sync = () => { const c = f.querySelector('input[name=mode]:checked'); for (const i of sl.box.querySelectorAll('input')) i.disabled = !c || c.value !== 'computer'; };
  f.append(el('fieldset', { class: 'opts' }, el('legend', null, el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'on', checked: D.on ? 'checked' : false }), el('span', null, 'Auto Play'))),
    radio('computer', 'Have Computer Play For Me'), sl.box, radio('end', 'Just End My Turns'), el('hr'),
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'stop', checked: D.stop !== false ? 'checked' : false }), el('span', null, 'Turn Off When Something Interesting Happens')),
    el('p', { class: 'note' }, 'Battles, colonizations, tech level changes, etc.'),
    el('label', null, el('span', null, 'Click through messages every:'),
      el('span', { class: 'slider' }, el('input', { type: 'range', name: 'every', min: 0, max: 10, value: D.every, 'aria-label': 'Seconds', oninput: (e) => { secs.textContent = e.target.value; } }), el('output', null, secs, ' ', 'Seconds')))),
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'OK')));
  f.addEventListener('change', sync);
  sync();
  modal('Auto Play', f, { cls: 'mid' });
}
function runAutoPlay(o) {
  let n = 0;
  // the STOP button (iOS), over the map while auto play runs
  const stopBtn = o.stopButton ? el('button', { id: 'autostop', class: 'clock', onclick: () => { o.stopped = true; stopBtn.remove(); } }, 'STOP') : null;
  if (stopBtn) $('#mapwrap').append(stopBtn);
  const finish = () => { if (stopBtn) stopBtn.remove(); };
  // click through this turn's messages, one every o.every seconds, then go on
  const clickThrough = (next) => {
    showMessages();
    const tick = () => {
      if (o.stopped || !G || UI.modal) { finish(); return; }
      if (UI.msgIdx >= UI.inbox.length) { next(); return; }
      UI.msgIdx++; renderMsg(); draw();
      setTimeout(tick, o.every * 1000);
    };
    setTimeout(tick, o.every * 1000);
  };
  const step = () => {
    if (o.stopped) { finish(); renderMsg(); return; }
    if (!G || G.over || n++ >= o.turns || UI.modal) { finish(); renderMsg(); return; }
    const before = HO.save(G);
    me().auto = o.computer;
    if (!playTurn('Auto play', before)) { finish(); return; }
    me().auto = false; awardMasterPoints(o.computer); awardGameCenter(); recordHall(); save();
    renderPanel(); draw();
    const stop = me().inbox.some(m => (o.won && isBattleNews(m) && wonBattle(m)) || (o.lost && isBattleNews(m) && !wonBattle(m)) || (o.news && !m.quiet && !isBattleNews(m) && !m.chat));
    $('#title').textContent = `${me().name} in ${G.opts.galaxy || 'Milky Way'} in ${G.year}${titleTag()} (auto play)`;
    if (stop || G.over) { finish(); showMessages(); return; }
    if (o.every > 0) { clickThrough(step); return; }
    setTimeout(step, 120);
  };
  step();
}
// ---------- the originals' own windows (each where its ruleset says so) ----------
// The auto play settings (rs.autoPlaySettings, rs.autoPlayRange): two
// sliders, Friendly to Aggressive (aggressiveness, in the version's units:
// rs.autoPlayRange.aggr) and Dig In to No Defense (the share of colonies
// defended, 100 to 0). 4.0.5: the Auto Play window's Config… (DITL 4020,
// DoConfigAutoPlayDialog, FUN_00404c4e); 5.0.5: Preferences (FUN_1005ec40);
// Palm OS: on the Auto Play form itself (tFRM 1700, FUN_000713be).
const autoPlayWhere = () => { const rs = G && HO.rules(G); return rs && rs.autoPlaySettings ? ((rs.autoPlayRange || {}).where || 'config') : null; };
function autoPlaySliders() {
  const rs = HO.rules(G), cur = rs.autoPlaySettings(G, me()) || { aggr: 0, colDef: 50 };
  const [lo, hi] = (rs.autoPlayRange || {}).aggr || [0, 10];
  const row = (name, label, left, right, min, max, val, show) => {
    const out = el('b', { class: 'apval' }, show(val));
    const inp = el('input', { type: 'range', name, min, max, value: val, 'aria-label': label, oninput: (e) => { out.textContent = show(+e.target.value); } });
    return el('div', { class: 'aprow' }, el('span', { class: 'aplabel' }, label, ' ', out),
      el('div', { class: 'apslider' }, el('span', null, left), inp, el('span', null, right)));
  };
  // Dig In at the left: the slider runs from 100% of colonies defended to
  // none (3.0.1, rs.autoPlayRange.digRight: No Defense at the left)
  const R = !!(rs.autoPlayRange || {}).digRight;
  const box = el('div', { class: 'apsettings' },
    row('aggr', 'Aggressiveness', 'Friendly', 'Aggressive', lo, hi, cur.aggr, (v) => String(v)),
    R ? row('dig', 'Colonies defended', 'No Defense', 'Dig In', 0, 100, cur.colDef, (v) => v + '%')
      : row('dig', 'Colonies defended', 'Dig In', 'No Defense', 0, 100, 100 - cur.colDef, (v) => (100 - v) + '%'));
  const apply = () => {
    const a = +box.querySelector('input[name=aggr]').value, d = +box.querySelector('input[name=dig]').value;
    rs.autoPlaySettings(G, me(), { aggr: a, colDef: R ? d : 100 - d }); save();
  };
  return { box, apply };
}
function openAutoPlaySettings(back) {
  if (!G || autoPlayWhere() == null) return;
  const s = autoPlaySliders();
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); s.apply(); closeModal(); if (back) back(); } },
    el('p', { class: 'sub' }, (HO.rules(G).autoPlayRange || {}).title || 'How the computer plays your turns for you.'), s.box,
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: () => { closeModal(); if (back) back(); } }, 'Cancel'), el('button', { type: 'submit' }, 'OK')));
  modal('Auto Play Settings', f, { cls: 'small' });
}
// The radical hand (rs.radicalHand): 4.0.5's radical card window
// (FUN_00471587) and 5.0.5's Radical Research window (FUN_1005f280; Palm
// tFRM 3000). It lists the hand; picking one throws it out of the hand, and
// the next discovery deals the hand full again. rs.radicalHand.full: the
// window opens only with that many (5.0.5: four; with fewer it closes at once).
const radicalReport = (m) => /hard at work on another discovery/.test(String(m.text || ''));
function openRadicalHand() {
  const RH = G && HO.rules(G).radicalHand; if (!RH || G.over) return;
  const cards = RH.cards(G, me());
  if (!cards.length || (RH.full && cards.length < RH.full)) { toast(cards.length ? 'Your radical researchers have fewer than four projects: none can be cancelled.' : 'Your radical researchers have no projects yet.'); return; }
  const W = RH.words;
  if (!W) {
    let sel = -1;
    const go = el('button', { disabled: true, onclick: () => { if (sel < 0) return; RH.discard(G, me(), cards[sel].id); save(); closeModal(); Sound.play(7002); toast('That project has been cancelled.'); } }, 'Cancel Project');
    const body = el('div', { class: 'hall radhand' },
      el('p', { class: 'htitle' }, 'Your radical researchers are working on these projects. You may cancel one; another takes its place after the next discovery.'),
      hallListBox(cards.map(c => [HO.say(G, c.text)]), '1fr', sel, (i) => { sel = i; go.disabled = false; }),
      el('div', { class: 'btns right' }, go, el('button', { onclick: closeModal }, 'OK')));
    modal('Radical Research', body, { cls: 'mid' });
    return;
  }
  // the version's own window (rs.radicalHand.words): W.prompt above the four
  // programs, each a choice beside its picture (W.pic); W.keep, a last choice
  // that cancels nothing, picked at first (5.0.5, the Palm, iOS); without it
  // nothing is picked until one is clicked (4.0.5). OK cancels the program
  // picked.
  const name = 'radpick';
  const row = (value, text, pic) => el('label', { class: 'radrow' + (pic ? '' : ' keep') },
    el('input', { type: 'radio', name, value, checked: W.keep && value === 'keep' ? 'checked' : false, onchange: () => Sound.play(7001) }),
    pic && A.img[pic] ? el('img', { class: 'radpic', src: A.img[pic], alt: '' }) : null, el('span', null, text));
  const f = el('form', { class: 'radhand radwin', onsubmit: (e) => {
    e.preventDefault();
    const v = (f.querySelector(`input[name=${name}]:checked`) || {}).value;
    closeModal();
    if (v == null || v === 'keep') return;
    RH.discard(G, me(), cards[+v].id); save(); Sound.play(7002);
  } },
  W.prompt ? el('p', null, W.prompt) : null,
  ...cards.map((c, i) => row(String(i), HO.say(G, c.text), W.pic)),
  W.keep ? row('keep', W.keep, null) : null,
  el('div', { class: 'btns right' }, el('button', { type: 'submit' }, W.ok || 'OK')));
  // rs.radicalHand.timeout (4.0.5, Windows and Mac): after 5 minutes the
  // window answers OK as it stands (the program picked is cancelled, none
  // picked cancels nothing)
  let timer = null;
  const win = modal(W.title || '', f, { cls: 'mid', label: 'Radical Research', onClose: () => { clearTimeout(timer); } });
  if (RH.timeout) timer = setTimeout(() => { if (UI.modal && UI.modal.contains(f)) f.requestSubmit(); }, RH.timeout * 1000);
}
// Winning (rs.youWon, rs.nameAStar): clicking the winner's report opens
// the "Congratulations! You have conquered the galaxy!" window with the won
// picture (4.0.5; 5.0.5, with the rank window after it: rs.rankAfterWin)
// (dialog 377), then Name a Star (dialog 378; 2.0's NAMESTARDLGPROC, 1.2's
// and 3.0.1's NameAStar). The Palm OS names a star at a new rank (tFRM 2900).
// The names are kept in this browser for the version (localStorage
// "ho5.stars.<rules>", the original's names file or preferences) and passed
// to later games (opts.starNamesKept), where the ruleset uses them.
const starsKey = (id) => 'ho5.stars.' + id;
function keptStars(id) { try { const v = JSON.parse(localStorage.getItem(starsKey(id)) || '[]'); return Array.isArray(v) ? v.filter(n => typeof n === 'string') : []; } catch (e) { return []; } }
// With "Use names other players have added" (signed in), the stars other
// winners of the version named (sharedStars) come after this browser's own,
// and the version's own cap still holds (NS.keep: 4.0.5's list of four): the
// player's own names first, the shared ones in the places left. The list the
// game is made with is kept in it (opts.starNamesKept), so a seed and that
// list always make the same galaxy; only names change, as they did when an
// original's preferences file grew.
const keptStarsOpt = (id) => {
  const NS = (HO.RULESETS[id] || {}).nameAStar; if (!NS) return {};
  let k = keptStars(id);
  const sh = sharedStars(id, NS, k);
  if (sh.length) { k = k.concat(sh); if (NS.keep) k = k.slice(0, NS.keep); }
  return k.length ? { starNamesKept: k } : {};
};
// The names file (rs.namesFile, 1.2 and 2.0): the names humans gave
// themselves and their ship types, kept in this browser for the version
// (localStorage "ho5.names.<rules>", the original's preferences file) and
// passed to later games (opts.namesKept), where the computers draw from them
const namesKey = (id) => 'ho5.names.' + id;
function keptNames(id) { try { const v = JSON.parse(localStorage.getItem(namesKey(id)) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
// (with the shared names, signed in: each added after this browser's own
// through namesFileAdd, so the file's own rules hold: 255 names a list at
// most, none already in it, a name inside another counting)
const keptNamesOpt = (id) => {
  const rs = HO.RULESETS[id]; if (!rs || !rs.namesFile) return {};
  const k = keptNames(id), sh = sharedNamesFor(id);
  if (sh) {
    for (const kind of ['men', 'women']) for (const n of sh[kind] || []) HO.namesFileAdd(rs, k, kind, n);
    for (const c of Object.keys(HO.TYPES)) for (const n of sh['ships-' + c] || []) HO.namesFileAdd(rs, k, 'ships', n, c);
  }
  return Object.keys(k).length ? { namesKept: k } : {};
};
// add a name to the file (engine namesFileAdd); in a game, its own copy too,
// as the original's computers read the file as it changes (not in an online
// game: its options are everyone's, and change only at New Game). A name
// the file takes goes to the shared pool too, when signed in.
function keepName(kind, name, type) {
  if (!G || !HO.rules(G).namesFile) return;
  const id = G.rules, rs = HO.ownRules(G), k = keptNames(id);
  if (HO.namesFileAdd(rs, k, kind, name, type)) {
    try { localStorage.setItem(namesKey(id), JSON.stringify(k)); } catch (e) {}
    shareName(id, kind === 'ships' ? 'ships-' + type : kind, name);
  }
  if (G.online) return;
  G.opts.namesKept = G.opts.namesKept || {};
  HO.namesFileAdd(rs, G.opts.namesKept, kind, name, type);
}
// ----- shared names (js/cloud.js, names/{pool}/{kind}) -----
// The pool is the version ('1.2' … '5': its editions share one), the remake's
// own rules each their own (the Claude rules' names never meet the
// originals'); the kinds are the ones the version keeps: 'stars' (Name a
// Star), 'men', 'women' and 'ships-<class>' (the names file). Signed out, or
// with the preference off, nothing is fetched or merged.
const namePool = (id) => { const f = famKey(familyOf(id)); return f === 'remake' ? id : f; };
const nameKinds = (id) => { const rs = HO.RULESETS[id] || {}; return [...(rs.nameAStar ? ['stars'] : []), ...(rs.namesFile ? ['men', 'women', ...Object.keys(HO.TYPES).map(c => 'ships-' + c)] : [])]; };
const sharedOn = () => !!(CLOUD && cloudUser() && CLOUD.useSharedNames());
// the pool as fetched (at most once a day, cached in this browser), or null
const sharedNamesFor = (id) => (sharedOn() && nameKinds(id).length ? CLOUD.cachedNames(namePool(id)) : null);
// fetch it now (the New Game window, for the chosen edition: ready by Create galaxy)
function fetchSharedNames(id) { if (sharedOn() && nameKinds(id).length) CLOUD.sharedNames(namePool(id), nameKinds(id)); }
function shareName(id, kind, name) { if (CLOUD && cloudUser() && nameKinds(id).includes(kind)) CLOUD.postName(namePool(id), kind, name).catch(() => null); }
// the shared stars a version may use: its own length limits, none it would
// call taken (starTaken's matching, without a game), none this browser keeps
function sharedStars(id, NS, kept) {
  const sh = sharedNamesFor(id), L = (sh && sh.stars) || [];
  if (!L.length) return [];
  const base = HO.RULESETS[id].starNames || HO.DATA.starNames || [], lc = (x) => String(x).toLowerCase(), have = new Set(kept.map(lc));
  const munger = NS.match === 'munger' || NS.match === '505';
  return L.filter((n) => {
    if (n.length > (NS.max || 7) || n.length < (NS.min || 1) || have.has(lc(n))) return false;
    if (munger ? base.some(x => String(x).includes(n)) : base.some(x => lc(x) === lc(n))) return false;
    have.add(lc(n)); return true;
  });
}
const iWon = () => !!G && G.over && (G.winners || [G.winner]).includes(ME);
const winReport = (m) => m && m.big === 'p3030' && iWon();
const winPending = () => { const rs = HO.rules(G); return iWon() && ((youWonWords() && !G.conqueredSeen) || (rs.nameAStar && rs.nameAStar.when === 'win' && !G.starNamed)); };
function openWinWindows(done) {
  const rs = HO.rules(G);
  if (youWonWords() && !G.conqueredSeen) {
    G.conqueredSeen = true; save();
    openYouWon(() => openWinWindows(done));
    return;
  }
  // a new rank's window, kept for after the You Won window (rs.rankAfterWin)
  if (G.rankAfter != null) { const r = G.rankAfter; delete G.rankAfter; save(); showRank(r, () => openWinWindows(done)); return; }
  if (rs.nameAStar && rs.nameAStar.when === 'win' && !G.starNamed) { openNameStar(() => { G.starNamed = true; save(); if (done) done(); }); return; }
  if (done) done();
}
// Losing (rs.youLost): the player's own "You have just been eliminated from
// the game." opens the version's You Lost window as the report comes up
// (5.0.5: LHoMessageView FUN_1009bbc0 runs the report's action, FUN_10060580,
// PPob 151; 4.0.5, 3.0.1, 2.0 and 1.2: DoMessageAction's alert 5050; the
// Palm's Game Over form; iOS's EndGameLayer youLost), once a report
// (m.lostSeen), and again when it is clicked in the Report Window, as the
// originals' message lists did. In hot seat the report, and so the window,
// is the eliminated player's, on their last turn to read the news
// (seatOrder); online, on their own page. rs.youLost: { text, ok, title,
// align, pic (the skin's picture, p3040 unless said), okPic (a picture for
// the button: iOS's check mark), looks: { <OS look>: words } (Windows 3.1's
// alert for DOS 2.0's box), bw: words on a black-and-white screen (1.2F's
// ALRT 5051) }. A skin whose original had none says T.youLost = false (the
// Amiga).
function youLostWords() {
  if (!G || T.youLost === false) return null;
  let Y = HO.rules(G).youLost;
  if (!Y) return null;
  const os = document.documentElement.dataset.os;
  if (Y.looks && Y.looks[os]) Y = Object.assign({}, Y, Y.looks[os]);
  if (Y.bw && HO.screenBW()) Y = Object.assign({}, Y, Y.bw);
  return Y;
}
const LOST_REPORT = 'You have just been eliminated from the game.';
const lostReport = (m) => !!(m && m.big === 'p3040' && m.text === LOST_REPORT && youLostWords());
// You Won (rs.youWon, the same shape as rs.youLost; the window each version
// opens as the winner's report comes up: 5.0.5's PPob 150, 4.0.5's dialog 377
// and DLOG 5040, 3.0.1's, 2.0.1's and 1.2's ALRT 5040, 2.0's alert and
// DOSHO box, the Palm's Game Over form, iOS's EndGameLayer youWon), then the
// rank window and Name a Star (openWinWindows). The Amiga says
// T.youWon = false (texte.pff has only the report 626).
function youWonWords() {
  if (!G || T.youWon === false) return null;
  let Y = HO.rules(G).youWon;
  if (!Y) return null;
  const os = document.documentElement.dataset.os;
  if (Y.looks && Y.looks[os]) Y = Object.assign({}, Y, Y.looks[os]);
  if (Y.bw && HO.screenBW()) Y = Object.assign({}, Y, Y.bw);
  return Y;
}
function openYouWon(done) {
  const Y = youWonWords();
  if (!Y) { if (done) done(); return; }
  const pic = A.img[Y.pic || 'p3030'], okPic = Y.okPic && A.img[(T.prefix || '') + Y.okPic];
  const ok = el('button', { class: okPic ? 'picbtn' : null, 'aria-label': okPic ? (Y.ok || 'OK') : null, onclick: () => closeModal() },
    okPic ? el('img', { src: okPic, alt: '' }) : (Y.ok || 'OK'));
  const body = el('div', { class: 'conquered youlost' }, el('p', null, Y.text), pic ? el('img', { src: pic, alt: '' }) : null,
    el('div', { class: 'btns ' + (Y.align || 'right') }, ok));
  Sound.play(7021);
  modal(Y.title != null ? Y.title : 'You won', body, { cls: 'small', sticky: true, label: 'You won', onClose: done });
}
function openYouLost(done) {
  const Y = youLostWords();
  if (!Y) { if (done) done(); return; }
  const pic = A.img[Y.pic || 'p3040'], okPic = Y.okPic && A.img[(T.prefix || '') + Y.okPic];
  const ok = el('button', { class: okPic ? 'picbtn' : null, 'aria-label': okPic ? (Y.ok || 'OK') : null, onclick: () => closeModal() },
    okPic ? el('img', { src: okPic, alt: '' }) : (Y.ok || 'OK'));
  const body = el('div', { class: 'conquered youlost' }, el('p', null, Y.text), pic ? el('img', { src: pic, alt: '' }) : null,
    el('div', { class: 'btns ' + (Y.align || 'right') }, ok));
  modal(Y.title != null ? Y.title : 'You lost', body, { cls: 'small', sticky: true, label: 'You lost', onClose: done });
}
// Is the name taken? NS.match 'munger': found anywhere in the kept names or
// the version's star names, a name inside another too, letter case counting
// (the Mac versions' Munger); '505': equal to a kept name, letter case aside,
// or found by Munger in the star names (5.0.5); 'kept': equal to a kept
// name, letter case aside (the Palm); left out: equal to a star
// name, a kept one or one of this galaxy, letter case aside
function starTaken(NS, id, n) {
  const base = HO.rules(G).starNames || HO.DATA.starNames || [], kept = keptStars(id), lc = (x) => String(x).toLowerCase();
  if (NS.match === 'munger') return base.concat(kept).some(x => String(x).includes(n));
  if (NS.match === '505') return kept.some(x => lc(x) === lc(n)) || base.some(x => String(x).includes(n));
  if (NS.match === 'kept') return kept.some(x => lc(x) === lc(n)); // the Palm (FUN_00075c40): the kept names only
  return base.concat(kept, G.stars.map(s => s.name)).some(x => lc(x) === lc(n));
}
// keep it: NS.add(list, name) (4.0.5's list of four), else at the end, the last NS.keep
function keepStar(NS, id, n) {
  let k = NS.add ? NS.add(keptStars(id), n) : keptStars(id).concat([n]); if (NS.keep) k = k.slice(-NS.keep);
  try { localStorage.setItem(starsKey(id), JSON.stringify(k)); } catch (x) {}
  shareName(id, 'stars', n); // the shared pool too, when signed in
}
function openNameStar(done, cancelled) {
  const NS = HO.rules(G).nameAStar, id = G.rules; if (!NS) return;
  const inp = el('input', { name: 'star', maxlength: NS.max || 7, autocomplete: 'off', 'aria-label': 'Star name' });
  const err = el('p', { class: 'note', role: 'alert' });
  const finish = () => { closeModal(); if (done) done(); };
  const f = el('form', { class: 'newgame namestar', onsubmit: (e) => {
    e.preventDefault();
    const n = inp.value.trim().slice(0, NS.max || 7);
    if (!n) { inp.focus(); return; }
    // NS.min: a shorter name names no star (the Mac versions)
    if (NS.min && n.length < NS.min) { finish(); return; }
    if (starTaken(NS, id, n)) { err.textContent = NS.taken.replace('%s', n); Sound.play(4000); inp.select(); return; }
    keepStar(NS, id, n);
    toast(NS.use ? `“${n}” will be among the stars of your next galaxies.` : `“${n}” has been kept.`);
    finish();
  } }, el('p', null, NS.text), NS.rule ? el('p', null, NS.rule) : null, el('label', null, el('span', null, NS.label || 'Star name'), inp), NS.hint ? el('p', { class: 'note' }, NS.hint) : null, err,
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: () => { if (cancelled) cancelled(); finish(); } }, NS.cancel || 'Cancel'), el('button', { type: 'submit' }, NS.ok || 'OK')));
  modal(NS.title || 'Name a Star', f, { cls: 'small', sticky: true });
}
// Force End Turn (rs.forceEndTurn, Mac 2.0.1): with several players, marks
// every player done after asking (box 3210), and the turn is played
function forceEndTurn() {
  if (!G || G.over || !hotSeat()) return;
  const FE = HO.rules(G).forceEndTurn; if (!FE) return;
  const all = seatOrder(), left = all.filter(p => p.id !== ME && !(G.done || []).includes(p.id));
  if (!left.length) { doEndTurn(); return; }
  const t = FE.ask.replace('%s', me().name).replace('%s', String(left.length)).replace('%s', String(all.length));
  const w = modal('Force End Turn', el('div', null, ...t.split('\n\n').map(x => el('p', null, x)), el('div', { class: 'btns right' },
    el('button', { class: 'quiet', onclick: closeModal }, 'Wait'),
    el('button', { onclick: () => { closeModal(); G.done = all.map(p => p.id).filter(i => i !== ME); doEndTurn(); } }, 'Force End Turn'))), { cls: 'small' });
  return w;
}
// Too far to go straight there: hop through your (or your allies') colonies,
// refuelling at each, the shortest way (a "Plan route…" made for you; the
// DOS 2.0 game routed fleets like this by itself). Off in Preferences.
function findRoute(f, tgt) {
  const max = HO.fleetMaxRange(G, f);
  if (!(max > 0)) return null;
  const fuelAt = (sid) => { const o = G.stars[sid].owner; return o === ME || (o >= 0 && HO.isAllied(G, o, ME)); };
  const nodes = G.stars.filter(st => fuelAt(st.id) || st.id === tgt).map(st => st.id);
  const dist = { [f.star]: 0 }, prev = {}, done = new Set();
  for (;;) {
    let u = null;
    for (const k in dist) if (!done.has(+k) && (u == null || dist[k] < dist[u])) u = +k;
    if (u == null) return null;
    if (u === tgt) break;
    done.add(u);
    if (u !== f.star && !fuelAt(u)) continue;
    const reach = u === f.star ? f.fuel : max;
    for (const v of nodes) {
      if (done.has(v) || v === u) continue;
      const d = HO.starDist(G, u, v);
      if (d > reach + 1e-9) continue;
      if (dist[v] == null || dist[u] + d < dist[v] - 1e-9) { dist[v] = dist[u] + d; prev[v] = u; }
    }
  }
  const path = [];
  for (let v = tgt; v !== f.star; v = prev[v]) path.unshift(v);
  return path;
}
// why a fleet can't go, in plain words
function outOfRange(f, tgt) {
  const d = HO.starDist(G, f.star, tgt), max = HO.fleetMaxRange(G, f), name = G.stars[tgt].name;
  const here = G.stars[f.star], fuelHere = here.owner === ME || (here.owner >= 0 && HO.isAllied(G, here.owner, ME));
  let t = `${name} is ${d.toFixed(1)} away, but this fleet has only ${f.fuel.toFixed(1)} fuel.`;
  if (d <= max && fuelHere) t += ' It will be refuelled here by next turn; try again then.';
  else if (d <= max) t += ' Fleets refuel only at your own (or your allies’) colonies.';
  else if (HO.feature(G, 'waypoints')) t += ` Its full range is ${max}, and fleets refuel only at your own (or your allies’) colonies, so it needs one of your colonies within reach on the way. Settle one, or research more Range.`;
  else t += ` Its full range is ${max}; research more Range to go farther.`;
  return t;
}
function autoRoute(f, tgt) {
  if (!modern() || !HO.feature(G, 'waypoints') || f.sat) return false;
  const path = findRoute(f, tgt);
  if (!path || !HO.orderPath(G, f, path)) return false;
  toast(`${G.stars[tgt].name} is too far to fly straight there, so this fleet will go by way of ${path.slice(0, -1).map(i => G.stars[i].name).join(', ')}, refuelling on the way.`);
  return true;
}
function openPrefs() {
  const PW = G && HO.rules(G).prefsWindow;
  if (PW) return PW.style === 'ios' ? prefsIOS(PW) : PW.style === 'palm' ? prefsPalm(PW) : prefs505(PW);
  const box = (k, label) => el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: Prefs[k] ? 'checked' : false, onchange: (e) => { Prefs[k] = e.target.checked; savePrefs(); renderPanel(); } }), el('span', null, label));
  // hints: only for a version that had them (rs.hints false: none between
  // turns); °C: fixed on for a version that showed only °C (rs.celsius)
  const hints = !G || HO.rules(G).hints !== false;
  const O = verOpts();
  modal('Preferences', el('div', { class: 'prefs' }, O ? verPrefs(O, box) : null, O ? null : box('important', 'Show only the most important messages'), O ? null : box('review', 'Review battles as they happen'),
    hints ? box('hints', 'Give helpful game play hints') : null,
    rsCelsius() ? el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: 'checked', disabled: true }), el('span', null, 'Temperatures in Celsius (this version showed only °C)'))
      : box('celsius', 'Temperatures in Celsius (not °F)'),
    G ? el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: modern() ? 'checked' : false, onchange: (e) => setModern(e.target.checked) }),
      el('span', null, 'Modern conveniences in this game (automatic routes, the map follows the news, battle speed and written reports)')) : null,
    box('tips', 'Explain things when the pointer rests on them (text from the original manual)'),
    autoPlayWhere() === 'prefs' ? prefsAutoPlay() : null), { cls: 'small' });
}
// 5.0.5's Preferences window (PPob 139, rs.prefsWindow) in its own words, with
// its controls and order; Cancel keeps everything as it was, OK applies. The
// remake's own options are below the line. Wired: Show Event Messages (off:
// the reports wait in the Report window), Only The Most Important Ones, Review
// Battles, hints, Battle Review Speed (the battle's pace), Player Sex (your
// hat), Celsius. Kept as chosen with nothing yet to act on: Best Buddies
// explore (no such report), Vocalize Chat Keywords (no keyword sounds); and
// AutoSave Each Turn, always on (the browser keeps the game after every move).
function prefs505(W) {
  const D = { showMsgs: Prefs.showMsgs !== false, important: !!Prefs.important, review: !!Prefs.review, hints: !!Prefs.hints, buddyStars: Prefs.buddyStars !== false,
    speed: Prefs.reviewSpeed != null ? Prefs.reviewSpeed : W.def, female: !!me().female, celsius: !!Prefs.celsius, vocal: Prefs.vocal !== false };
  const chk = (k, label, extra) => el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: D[k] ? 'checked' : false, ...(extra || {}), onchange: (e) => { D[k] = e.target.checked; if (k === 'showMsgs') sync(); } }), el('span', null, label));
  const imp = chk('important', W.important), rev = chk('review', W.review), hnt = chk('hints', W.hints), bud = chk('buddyStars', W.buddies);
  const sync = () => { for (const l of [imp, rev, hnt, bud]) l.querySelector('input').disabled = !D.showMsgs; };
  const speed = el('input', { type: 'range', min: W.range[0], max: W.range[1], step: 1, value: D.speed, 'aria-label': W.speed.replace(/:$/, ''), oninput: (e) => { D.speed = +e.target.value; } });
  const sex = el('select', { 'aria-label': W.sex.replace(/:$/, ''), onchange: (e) => { D.female = e.target.value === '1'; } },
    ...W.sexes.map((t, i) => el('option', { value: String(i), selected: (i === 1) === D.female ? 'selected' : false }, t)));
  const showBox = el('fieldset', { class: 'opts prefs5' }, el('legend', null, chk('showMsgs', W.show)), imp, rev, hnt, bud);
  sync();
  const ok = () => {
    Prefs.showMsgs = D.showMsgs; Prefs.important = D.important; Prefs.review = D.review; Prefs.hints = D.hints; Prefs.buddyStars = D.buddyStars;
    Prefs.reviewSpeed = D.speed === W.def ? null : D.speed; Prefs.celsius = D.celsius; Prefs.vocal = D.vocal;
    if (me().female !== D.female) { me().female = D.female; save(); }
    savePrefs(); closeModal(); renderPanel(); draw();
  };
  const remake = [
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: Sound.on ? 'checked' : false, onchange: (e) => { Sound.on = e.target.checked; savePrefs(); } }), el('span', null, 'Sound effects')),
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: modern() ? 'checked' : false, onchange: (e) => setModern(e.target.checked) }), el('span', null, 'Modern conveniences in this game (automatic routes, the map follows the news, battle speed and written reports)')),
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: Prefs.tips ? 'checked' : false, onchange: (e) => { Prefs.tips = e.target.checked; savePrefs(); } }), el('span', null, 'Explain things when the pointer rests on them (text from the original manual)')),
    autoPlayWhere() === 'prefs' ? prefsAutoPlay() : null];
  modal(W.title, el('div', { class: 'prefs' },
    showBox,
    el('div', { class: 'speedrow' }, el('span', null, W.speed), el('div', { class: 'slider' }, el('span', null, W.slow), speed, el('span', null, W.fast))),
    el('label', { class: 'sexrow' }, el('span', null, W.sex), ' ', sex),
    chk('celsius', W.celsius),
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: 'checked', disabled: true }), el('span', null, W.autosave)),
    el('fieldset', { class: 'opts prefs5' }, el('legend', null, W.sound), chk('vocal', W.vocal)),
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, W.cancel), el('button', { type: 'button', onclick: ok }, W.ok)),
    el('hr', { class: 'ngline' }),
    el('fieldset', { class: 'opts' }, el('legend', null, 'Remake options'), ...remake)), { cls: 'small' });
}
// The remake's own options, under the line in each ruleset's Preferences window
// (`sound`: the window has its own Sound control)
function remakeOptions(sound) {
  const chk = (on, fn, label) => el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: on ? 'checked' : false, onchange: fn }), el('span', null, label));
  return [el('hr', { class: 'ngline' }), el('fieldset', { class: 'opts' }, el('legend', null, 'Remake options'),
    sound ? null : chk(Sound.on, (e) => { Sound.on = e.target.checked; savePrefs(); }, 'Sound effects'),
    chk(modern(), (e) => setModern(e.target.checked), 'Modern conveniences in this game (automatic routes, the map follows the news, battle speed and written reports)'),
    chk(Prefs.tips, (e) => { Prefs.tips = e.target.checked; savePrefs(); }, 'Explain things when the pointer rests on them (text from the original manual)'),
    autoPlayWhere() === 'prefs' ? prefsAutoPlay() : null)];
}
// iOS 1.2.9's and Android 1.2.8's Preferences screen (PreferencesLayer
// initDialog 0x1000a6a4c; rs.prefsWindow style 'ios'): eight rows, each a label
// and a switch with the words of its state beside it (Event Messages Show or
// Hide, Messages Only Important or All, Battles Review or Skip, Hints, Best
// Buddies, Temp: ºF or ºC, Sound, Gender Male or Female), then the slider
// "Review Battle Speed:" (Slow to Fast), OK and Cancel. With Event Messages on
// Hide the four rows under it (Messages to Best Buddies) are hidden. OK applies;
// Cancel leaves everything as it was. Wired: Event Messages (Hide: the reports
// wait in the Report window), Messages, Battles, Hints, Temp, Sound (the
// remake's sound switch), Gender (your hat), the speed (the battle's pace, 10
// the remake's). Kept with nothing yet to act on: Best Buddies (no such report).
function prefsIOS(W) {
  const D = { show: Prefs.showMsgs !== false, important: !!Prefs.important, review: prefReview(), hints: !!Prefs.hints, buddies: Prefs.buddyStars !== false,
    celsius: !!Prefs.celsius, sound: !!Sound.on, male: !me().female, speed: Prefs.reviewSpeed != null ? Prefs.reviewSpeed : W.def };
  const rows = {}, sync = () => { for (const k of ['important', 'review', 'hints', 'buddies']) rows[k].hidden = !D.show; };
  const row = ([k, label, on, off]) => {
    const txt = el('span', { class: 'choice' }, D[k] ? on : off);
    rows[k] = el('label', { class: 'chk switchrow', 'data-pref': k }, el('span', null, label), txt,
      el('input', { type: 'checkbox', class: 'switch', role: 'switch', checked: D[k] ? 'checked' : false, onchange: (e) => { D[k] = e.target.checked; txt.textContent = UIL.t(D[k] ? on : off); if (k === 'show') sync(); } }));
    return rows[k];
  };
  const list = W.rows.map(row);
  // OK and Cancel are the check mark and the X, as on Give Money/Metal
  const okBtn = W.okPic && A.img[(T.prefix || '') + W.okPic], noBtn = W.cancelPic && A.img[(T.prefix || '') + W.cancelPic];
  const pb = (img, text, attrs) => el('button', Object.assign({ class: img ? 'picbtn' : null, 'aria-label': img ? text : null }, attrs), img ? el('img', { src: img, alt: '' }) : text);
  sync();
  const speed = el('input', { type: 'range', min: W.range[0], max: W.range[1], step: 1, value: D.speed, 'aria-label': W.speed.replace(/:$/, ''), oninput: (e) => { D.speed = +e.target.value; } });
  const ok = () => {
    Prefs.showMsgs = D.show; Prefs.important = D.important; Prefs.review = D.review; Prefs.hints = D.hints; Prefs.buddyStars = D.buddies;
    Prefs.celsius = D.celsius; Sound.on = D.sound; Prefs.reviewSpeed = D.speed === W.def ? null : D.speed;
    if (me().female === D.male) { me().female = !D.male; save(); }
    savePrefs(); closeModal(); renderPanel(); draw();
  };
  modal(W.title, el('div', { class: 'prefs prefs-ios' }, ...list,
    el('div', { class: 'speedrow' }, el('span', null, W.speed), el('div', { class: 'slider' }, el('span', null, W.slow), speed, el('span', null, W.fast))),
    el('div', { class: 'btns right' }, pb(noBtn, W.cancel, { type: 'button', class: noBtn ? 'picbtn' : 'quiet', onclick: closeModal }), pb(okBtn, W.ok, { type: 'button', onclick: ok })),
    ...remakeOptions(true)), { cls: 'small' });
}
// The Palm's Preferences form (tFRM 3200, FUN_00070a86 and FUN_00070d06;
// rs.prefsWindow style 'palm'): Player Sex (a pop-up, Female then Male), Money
// in € not $, Temp in °C not °F, Jump To History, Give Helpful Hints, Show Best
// Buddies Stars, Enable Auto-Zoom, Disable Auto-Off, then Sound, Cancel and OK on
// the bottom line. OK keeps it all. Wired: Sex (your hat), Temp, Hints, Sound
// (the remake's sound switch; this skin is silent). Kept with nothing yet to act
// on: Money in €, Jump To History, Best Buddies Stars, Auto-Zoom, Disable Auto-Off.
function prefsPalm(W) {
  const D = { female: !!me().female, euro: !!Prefs.euro, celsius: !!Prefs.celsius, history: Prefs.jumpHistory !== false, hints: !!Prefs.hints,
    buddies: Prefs.buddyStars !== false, zoom: !!Prefs.autoZoom, autooff: !!Prefs.autoOff, sound: !!Sound.on };
  const chk = (k, label) => el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: D[k] ? 'checked' : false, onchange: (e) => { D[k] = e.target.checked; } }), el('span', null, label));
  const sex = el('select', { 'aria-label': W.sex.replace(/:$/, ''), onchange: (e) => { D.female = e.target.value === '0'; } },
    ...W.sexes.map((t, i) => el('option', { value: String(i), selected: (i === 0) === D.female ? 'selected' : false }, t)));
  const ok = () => {
    Prefs.euro = D.euro; Prefs.celsius = D.celsius; Prefs.jumpHistory = D.history; Prefs.hints = D.hints; Prefs.buddyStars = D.buddies; Prefs.autoZoom = D.zoom; Prefs.autoOff = D.autooff;
    Sound.on = D.sound;
    if (me().female !== D.female) { me().female = D.female; save(); }
    savePrefs(); closeModal(); renderPanel(); draw();
  };
  modal(W.title, el('div', { class: 'prefs prefs-palm' },
    el('label', { class: 'sexrow' }, el('span', null, W.sex), ' ', sex),
    chk('euro', W.euro), chk('celsius', W.celsius), chk('history', W.history), chk('hints', W.hints), chk('buddies', W.buddies), chk('zoom', W.zoom), chk('autooff', W.autooff),
    el('div', { class: 'btns' }, chk('sound', W.sound), el('button', { type: 'button', class: 'quiet', onclick: closeModal }, W.cancel), el('button', { type: 'button', onclick: ok }, W.ok)),
    ...remakeOptions(true)), { cls: 'small' });
}
// The version's own Options menu items (rs.options, 1.2 and 2.0), in its
// words: Show Event Messages, Review Announced Battles, the battle speed
// (Fast to Slow, fully animated battles) and 2.0's polling time
function verPrefs(O, box) {
  const slider = (C, k, extra) => {
    const out = el('span', { class: 'note' });
    const show = (v) => { out.textContent = C.unit ? `${v} ${C.unit}` : ''; };
    const inp = el('input', { type: 'range', min: C.min, max: C.max, step: 1, value: optVal(C, k), 'aria-label': C.title.replace(/:$/, ''),
      oninput: (e) => show(+e.target.value), onchange: (e) => { Prefs[k] = +e.target.value; savePrefs(); } });
    show(optVal(C, k));
    return el('fieldset', { class: 'opts', title: extra || null }, el('legend', null, C.title),
      el('div', { class: 'slider' }, el('span', null, C.fast), inp, el('span', null, C.slow)), out, C.note ? el('p', { class: 'note' }, C.note) : null,
      C.full ? el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: Prefs.fullAnim !== false ? 'checked' : false, onchange: (e) => { Prefs.fullAnim = e.target.checked; savePrefs(); } }), el('span', null, C.full)) : null);
  };
  return el('div', null,
    O.showMessages ? box('showMsgs', O.showMessages) : null,
    O.reviewBattles ? box('review', O.reviewBattles) : null,
    O.battleSpeed ? slider(O.battleSpeed, 'battleSpeed') : null,
    O.poll ? slider(O.poll, 'poll', 'Kept as the original had it; the remake has no players on other machines, so nothing polls.') : null);
}
// The Report Window (rs.options.reports, 1.2 and 2.0): this turn's reports,
// where they are when Show Event Messages is off; clicking one goes to its
// star, or reviews its battle
function openReports() {
  if (!G) return;
  const O = verOpts() || {}, ms = me().inbox || [];
  const rows = ms.map(m => el('li', { class: 'click', tabindex: 0, onclick: () => {
    closeModal();
    if (winReport(m) && winPending()) { openWinWindows(() => renderMsg()); return; }
    if (winReport(m) && youWonWords()) { openYouWon(); return; }
    if (lostReport(m)) { openYouLost(); return; }
    if (m.battle) { openBattle(m.battle); return; }
    if (m.star != null) { UI.sel = m.star; centerOn(m.star); renderPanel(); draw(); }
  } }, degText(HO.say(G, m.text))));
  modal(O.reports || 'Reports', ms.length ? el('ul', { class: 'reports' }, ...rows) : el('p', null, 'No reports this turn.'), { cls: 'mid' });
}
// 5.0.5's Preferences hold the auto play settings (FUN_1005ec40)
function prefsAutoPlay() {
  const s = autoPlaySliders();
  s.box.addEventListener('change', () => s.apply());
  return el('fieldset', { class: 'opts' }, el('legend', null, 'Auto play'), s.box);
}

// A version whose rules have a thing but whose players had no command for it:
// rs.surrenderCommand and rs.chatCommand false (iOS 1.2.9: no Surrender and no
// Send Message, though the computers still send messages): the Galaxy menu
// leaves the command out. Left out: the command shows with its feature.
const COMMAND_FLAGS = { surrender: 'surrenderCommand', chat: 'chatCommand' };
const commandShown = (feat) => !!G && HO.feature(G, feat) && HO.rules(G)[COMMAND_FLAGS[feat]] !== false;
// ----- the Ho menu: this version, skin, sounds, modern conveniences -----
// Each version plays as it was released; the conveniences a player may add
// are choices here, and can be changed in the middle of a game.
const MODERN_TEXT = 'Modern conveniences: automatic routes, the map follows the news, battle speed and written battle reports (not in the original games)';
function setModern(on) { if (!G) return; G.opts.modern = !!on; save(); renderPanel(); draw(); }
// Full Hoedown (G.opts.hoedown, js/hoedown.js): Delta Tao's own jokes at
// their most, never the play; chosen at New Game ("ho5.hoedown") and in the
// Ho menu, for rules with Hoedown items (rs.hoedown: not the AI homages)
const HOEDOWN_TEXT = 'Full Hoedown: Delta Tao’s own jokes at their most, every time (the game plays the same)';
const hoedownOn = () => !!(G && HO.hoedown(G));
function setHoedown(on) { if (!G) return; HO.setHoedown(G, !!on); save(); renderPanel(); draw(); toast(on ? 'Full Hoedown is on.' : 'Full Hoedown is off.'); }
// the Hoedown items of a ruleset, as a list
const hoedownList = (rs) => el('ul', { translate: 'no', lang: 'en' }, ...((rs.hoedown || {}).items || []).map(t => el('li', null, t)));
// The long documents (the version notes, the patch's fixes, the Hoedown
// items and the manuals) are in English: kept out of the
// translation (translate="no") with a line in the language that says so
// A document whose every line has a row in the language (js/ui-text-notes-<code>.js,
// checked by tools/notes-check.js) is shown in it: no line says it's English, and
// it isn't kept out of the translation. Any other stays English, as before.
const inLang = (lines) => UIL.lang !== 'en' && !!lines && lines.length > 0 && lines.every(s => UIL.has(s));
const docAttrs = (lines) => inLang(lines) ? {} : { translate: 'no', lang: 'en' };
const inEnglish = (text, lines) => UIL.lang === 'en' || inLang(lines) ? null : el('p', { class: 'note' }, text || 'These notes are in English.');
// The unofficial patch: fixes for a version's obvious bugs (rs.fixes,
// docs/fixes.md), chosen at New Game only (G.opts.patch, a rule: it can't be
// changed mid-game) and remembered for the next New Game ("ho5.patch"). Its
// number is the version's + ".1" (HO.patchVersion). Hidden for a ruleset
// with no fixes.
const PATCH_TEXT = (rs) => `Apply the ${HO.patchVersion(rs)} patch: fixes for obvious bugs (not an official release)`;
const patchName = (rs) => `${HO.patchVersion(rs)} (unofficial patch)`;
const patchOn = () => !!(G && G.opts && G.opts.patch) && HO.fixes(HO.rules(G)).length > 0;
const titleTag = () => patchOn() ? ` · ${patchName(HO.rules(G))}` : '';
// the fixes as a list: each one's title and what it does
const fixLines = (rs) => HO.fixes(rs).flatMap(f => [f.title, f.text]);
const fixList = (rs) => el('ul', docAttrs(fixLines(rs)), ...HO.fixes(rs).map(f => el('li', null, el('b', null, f.title), el('br'), f.text)));
// Ho menu, "Patch notes…" (only while the game has the patch on)
// The interface's language (js/ui-lang.js): in a game, the game's (its
// G.opts.lang, else the version's own, HO.ownLanguage); with no game, the
// player's choice (the title screen's Language, HOUI.pref), else English, in
// every skin (English is every version's default, the Amiga's and 1.2's
// too: Jake's choice). New Game starts from that choice and shows the
// language its Language menu has chosen (newGameDialog).
const gameLang = (g) => (g && ((g.opts && g.opts.lang) || HO.ownLanguage(HO.ownRules(g)))) || 'en';
const titleLang = () => UIL.pref.get() || 'en';
function syncLang() { UIL.set(G ? gameLang(G) : titleLang()); }
// the player chooses a language (the title screen's Language): the whole
// interface changes at once, the choice is kept (and, signed in, sent to the
// account: cloudPrefsUp); a game being played keeps its own
function chooseLang(l) {
  if (!UIL.pref.set(l)) return;
  if (!G) UIL.set(l);
  cloudPrefsUp();
}
// a change of language redoes the page (js/ui-lang.js); the map is drawn again
UIL.onChange(() => { if (cv) draw(); });
// Ho menu, "Language…" (a version that shipped in more than one, rs.languages):
// the game's names and words in another; the game plays on the same
function openLanguage() {
  if (!G) return;
  const rs = HO.ownRules(G), langs = HO.languages(rs), own = HO.ownLanguage(rs), now = (G.opts && G.opts.lang) || own;
  const s = el('select', { 'aria-label': 'Language' }, ...langs.map((c) => el('option', { value: c, selected: c === now ? 'selected' : false }, HO.languageName(rs, c) + (c === own ? ' (original)' : ''))));
  const ok = () => {
    closeModal();
    if (s.value === now) return;
    HO.setLanguage(G, s.value);
    save(); renderPanel(); draw();
  };
  modal('Language', el('div', { class: 'about' },
    el('p', null, 'The names of the stars, computer players and ship designs, and the game’s words, in another of this version’s languages. The game plays on the same; reports already received may keep some names in the old language.'),
    el('label', null, el('span', null, 'Language '), s),
    el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'Cancel'), el('button', { onclick: ok }, 'OK'))), { cls: 'mid' });
}
function openPatchNotes() {
  if (!patchOn()) return;
  const rs = HO.rules(G), pv = HO.patchVersion(rs);
  const body = el('div', { class: 'about' },
    el('h3', null, rs.label || rs.id),
    el('p', { class: 'sub' }, `Version ${patchName(rs)} · ${rs.platform} · ${rs.year}`),
    el('p', null, `This game plays ${rs.version} with the fixes below for its obvious bugs; everything else is as ${rs.version} was released. The patch is the remake’s own, not a release of the original game, and was chosen at New Game: it stays on for the whole game.`),
    el('section', { class: 'vnotes' }, el('h4', null, 'Fixed'), inEnglish(null, fixLines(rs)), fixList(rs)),
    el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK')));
  modal(`${pv} patch notes (unofficial)`, body, { cls: 'mid' });
}
// the rules being played, or with no game those chosen last in New Game
// (the newest original's when none was, or the one chosen is gone): never a
// silent fallback to another ruleset (docs/fallbacks.md)
const chosenRules = () => { let r = null; try { r = localStorage.getItem('ho5.rules'); } catch (e) {} return r && HO.RULESETS[r] ? r : (HO.defaultRules ? HO.defaultRules() : HO.newestRules()); };
const rulesId = () => G ? G.rules : chosenRules();
function openAbout() {
  const id = rulesId(), rs = HO.rulesById(id), N = (window.HOVERSIONS || {})[id] || {};
  const chk = N.checking || {};
  // a quirk the version's patch fixes says so: in a game with the patch on,
  // that this game has it fixed (the Patch notes say how); otherwise, which
  // patch fixes it
  const patched = !!G && patchOn(), pv = HO.patchVersion(rs), fixIds = HO.fixes(rs).map(f => f.id);
  const fixNote = (x) => typeof x !== 'string' && x.fix && fixIds.includes(x.fix) ? ' ' + UIL.t(patched ? '(fixed in this game by the %s patch: see Patch notes)' : '(fixed in the %s patch)', pv) : '';
  const shown = (list) => (list || []).filter(x => typeof x === 'string' || !x.show || x.show(rs));
  const base = (list) => shown(list).map(x => typeof x === 'string' ? x : x.text);
  // a line is its text and, for a quirk the patch fixes, the note after it: el() puts each in the language
  const lines = (list) => shown(list).map(x => typeof x === 'string' ? x : [x.text, fixNote(x)]);
  const part = (title, list, key, none) => {
    const L = lines(list);
    if (!L.length && !chk[key] && !none) return null;
    return el('section', { class: 'vnotes' }, el('h4', null, title),
      chk[key] ? el('p', { class: 'note' }, 'Still being checked: this version’s notes aren’t finished yet.') : null,
      L.length ? el('ul', docAttrs(base(list)), ...L.map(t => el('li', null, t))) : none ? el('p', { class: 'sub' }, none) : null);
  };
  const noteLines = [N.intro, ...base(N.quirks), ...base(N.differs), ...base(N.missing), ...(N.previous !== undefined ? base(N.changes) : []),
    ...(N.deltaTao ? [...N.deltaTao.text, N.deltaTao.source] : [])].filter(Boolean);
  const body = el('div', { class: 'about' },
    el('h3', null, rs.label || id),
    rs.version ? el('p', { class: 'sub' }, `Version ${patched ? patchName(rs) : rs.version} · ${rs.platform} · ${rs.year}`) : null,
    G ? null : el('p', { class: 'sub' }, 'The rules chosen for the next game.'),
    patched ? el('p', { class: 'note' }, `This game has the ${pv} patch on: the remake’s own fixes for ${rs.version}’s obvious bugs, not an official release. The Ho menu’s Patch notes say what each one fixes.`) : null,
    inEnglish(null, noteLines),
    N.intro ? el('p', docAttrs([N.intro]), N.intro) : null,
    rs.hoedown ? el('section', { class: 'vnotes' }, el('h4', null, 'Full Hoedown'),
      el('p', { class: 'sub' }, `${G && HO.hoedown(G) ? 'On in this game' : 'Off in this game'} (New Game and the Ho menu turn it on and off): ${rs.version || rs.id}’s own jokes at their most, and only Delta Tao’s. The game plays the same.`),
      hoedownList(rs)) : null,
    part('Known bugs and quirks, played as released', N.quirks, 'quirks', rs.version ? 'None known.' : null),
    part('Where this remake differs', N.differs, 'differs'),
    part('Not in this remake yet', N.missing, 'missing'),
    N.previous !== undefined ? part(N.previous ? `What changed from ${N.previous}` : 'What changed', N.changes, 'changes', N.previous ? null : 'The earliest version in this remake: there is nothing earlier to compare it with.') : null,
    // Delta Tao's own words on what changed, quoted from the 5.0 manual
    N.deltaTao ? el('section', { class: 'vnotes' }, el('h4', null, `What Delta Tao said (${N.deltaTao.from})`),
      ...N.deltaTao.text.map(t => el('p', docAttrs([t]), t)),
      el('p', Object.assign({ class: 'sub' }, docAttrs([N.deltaTao.source])), N.deltaTao.source, ' ', el('a', { href: N.deltaTao.url, target: '_blank', rel: 'noopener' }, N.deltaTao.url))) : null,
    el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK')));
  modal('About this version', body, { cls: 'mid' });
}
// ----- versions, editions, skins and OS looks -----
// Version and Edition pick the ruleset: each ruleset says which version
// (rs.family) and edition (rs.edition = { version, name, platform, year })
// it is, and its own skins (rs.skins), and engine.js lists them
// (HO.families(), HO.editions(family)). A ruleset that doesn't say yet is
// placed by its version number (and by the table here), so the menus never
// lose one.
const ED_FALLBACK = {
  '12': { family: '1.2', name: 'Mac (French)', skins: ['mac12'] },
  mac20: { family: '2.0', name: 'Mac', skins: ['mac2c', 'mac2'] },
  dos: { family: '2.0', name: 'DOS and Windows 3.1', skins: ['dos', 'amiga'] },
  '301': { family: '3.0', name: 'Mac', skins: ['mac3c', 'mac3'] },
  mac405: { family: '4.0', name: 'Mac', skins: ['mac4c', 'mac4'] },
  '405': { family: '4.0', name: 'Windows 95', skins: ['w95'] },
  original: { family: '5', name: 'Mac', platform: 'Mac OS 8.6, 9 and X', skins: ['classic'] },
  palm: { family: '5', name: 'Palm OS', skins: ['palm'] },
  claude: { family: 'remake', name: 'Claude’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['cozy', 'classic'] },
  gemini: { family: 'remake', name: 'Gemini’s rules (inspired by the 5.0.5 manual, 2026)', skins: ['gemini', 'classic'] },
};
// the New Game window starts every edition with its own rules (tools/human-play.js asks)
window.HONEWGAME_EDITIONS = true;
const FAMILY_NAMES = { '1.2': '1.2', '2.0': '2.0', '3.0': '3.0', '4.0': '4.0', '5': '5', remake: 'AI homages', claude: 'AI homages' };
// a ruleset's version: its own, else from its version number ('2.0.1' is 2.0, '5.0.5' is 5)
function familyOf(id) {
  const rs = HO.RULESETS[id] || {};
  if (rs.family) return rs.family;
  if (ED_FALLBACK[id]) return ED_FALLBACK[id].family;
  const m = /^(\d+)(?:\.(\d+))?/.exec(String(rs.version || ''));
  if (!m) return 'remake';
  return +m[1] >= 5 ? '5' : `${m[1]}.${m[2] || 0}`;
}
const famKey = (f) => f === 'claude' ? 'remake' : f;
// the versions, oldest first, the remake's own last: [family id]
function familyList() {
  const ids = Object.keys(HO.RULESETS);
  let fams = [];
  if (typeof HO.families === 'function') { try { fams = HO.families().map(f => famKey(typeof f === 'string' ? f : f.id)); } catch (e) { fams = []; } }
  for (const id of ids) { const f = famKey(familyOf(id)); if (!fams.includes(f)) fams.push(f); }
  const order = ['1.2', '2.0', '3.0', '4.0', '5'];
  const rank = (f) => f === 'remake' ? 1e3 : order.includes(f) ? order.indexOf(f) : 500 + parseFloat(f);
  return fams.filter(f => editionList(f).length).sort((a, b) => rank(a) - rank(b));
}
// one version's editions, as the Edition menu lists them: [ruleset id]
function editionList(fam) {
  let ids = null;
  if (typeof HO.editions === 'function') { try { ids = HO.editions(fam).map(e => typeof e === 'string' ? e : e.id).filter(id => HO.RULESETS[id]); } catch (e) { ids = null; } }
  if (!ids || !ids.length) {
    const yr = (id) => (HO.RULESETS[id].edition || {}).year || HO.RULESETS[id].year || 1e4;
    ids = Object.keys(HO.RULESETS).filter(id => famKey(familyOf(id)) === fam).sort((a, b) => yr(a) - yr(b) || editionName(a).localeCompare(editionName(b)));
  }
  // the ones engine.js doesn't list yet, placed by their version
  for (const id of Object.keys(HO.RULESETS)) if (famKey(familyOf(id)) === fam && !ids.includes(id)) ids.push(id);
  return ids;
}
// an edition's name in the menu: "Mac", "DOS and Windows 3.1", … (5.0.5's
// Mac edition by its systems, "Mac OS 8.6, 9 and X")
function editionName(id) {
  const rs = HO.RULESETS[id] || {}, e = rs.edition || {}, fb = ED_FALLBACK[id] || {};
  const name = e.name || fb.name || rs.platform || rs.label || id;
  const plat = e.platform || fb.platform || '';
  return name === 'Mac' && /^Mac OS/.test(plat) ? plat.replace(/, | and /g, '/') : name;
}
function editionLabel(id) {
  const rs = HO.RULESETS[id] || {}, e = rs.edition || {};
  const ver = e.version || rs.version, year = e.year || rs.year;
  if (famKey(familyOf(id)) === 'remake') return editionName(id);
  return ver ? tl('%s (%s, %s)', tl(editionName(id)), ver, year) : editionName(id);
}
// an edition's own skins, the first to offer first (only the ones this copy has)
function editionSkins(id) {
  const rs = HO.RULESETS[id] || {}, have = ((window.HOSKINS && HOSKINS.list) || []).map(k => k.id);
  const ed = HO.editions ? (HO.editions(familyOf(id)) || []).find(e => e.id === id) : null; // engine.js also knows the rulesets it can't edit (the Claude rules)
  return ((ed && ed.skins && ed.skins.length ? ed.skins : null) || rs.skins || (ED_FALLBACK[id] || {}).skins || []).filter(k => have.includes(k));
}
const SEP = '──────────';
const sepOption = () => el('option', { disabled: 'disabled', value: '', class: 'sep' }, SEP);
// a select's options: the own ones, a line, then all the others, with the AI
// homages (skins marked homage: true in js/skins.js) last, after a second line
const isHomage = (id) => ((window.HOSKINS && HOSKINS.list) || []).some(k => k.id === id && k.homage);
function fillOwnFirst(sel, own, all, value, name) {
  const rest = all.filter(id => !own.includes(id)), orig = rest.filter(id => !isHomage(id)), hom = rest.filter(isHomage);
  const opt = (id) => el('option', { value: id }, name(id));
  sel.replaceChildren(...own.map(opt),
    ...(own.length && rest.length ? [sepOption()] : []),
    ...orig.map(opt),
    ...(orig.length && hom.length ? [sepOption()] : []),
    ...hom.map(opt));
  sel.value = value;
  if (sel.value !== value) sel.value = own[0] || all[0];
}
const skinName = (id) => { const k = ((window.HOSKINS && HOSKINS.list) || []).find(x => x.id === id); return k ? k.name : id; };
// the skins, an edition's own first
function fillSkins(sel, rulesId, value) {
  const all = ((window.HOSKINS && HOSKINS.list) || []).map(k => k.id);
  fillOwnFirst(sel, rulesId ? editionSkins(rulesId) : [], all, value, skinName);
}
// the OS looks, the skin's own first (the look follows the skin, not the version)
function fillOS(sel, skin, value) {
  if (!window.HOSKINS || !HOSKINS.osChoices) return;
  const ch = HOSKINS.osChoices(skin);
  fillOwnFirst(sel, ch.filter(o => o.own).map(o => o.id), ch.map(o => o.id), value, (id) => HOSKINS.osName(id));
}
// a skin or a look picked by hand this session (sessionStorage): changing
// the edition (or the skin) then leaves it as it is
const picked = {
  get(k) { try { return sessionStorage.getItem('ho5.picked.' + k) === '1'; } catch (e) { return false; } },
  set(k) { try { sessionStorage.setItem('ho5.picked.' + k, '1'); } catch (e) {} },
};
// the look showing; a game's own look (G.opts.os) is put on when it opens
const osNow = () => (window.HOSKINS && HOSKINS.os) || null;
function useOS(id) {
  if (!id || !window.HOSKINS || !HOSKINS.setOS || HOSKINS.os === id) return;
  HOSKINS.setOS(id); // (the map follows its new size: setupMap's ResizeObserver)
}
// a Skin and an OS look pop-up that work together: picking a skin offers
// its own looks first, and puts on its first unless a look was picked by hand
function skinOSPickers(rulesId) {
  const skinSel = el('select', { name: 'skin', 'aria-label': 'Skin' });
  const osSel = el('select', { name: 'os', 'aria-label': 'OS look' });
  fillSkins(skinSel, rulesId, window.HOSKINS ? HOSKINS.current : 'classic');
  fillOS(osSel, skinSel.value, osNow());
  skinSel.addEventListener('change', () => {
    picked.set('skin');
    fillOS(osSel, skinSel.value, HOSKINS.osDefault(skinSel.value)); // a new skin starts in its own look
  });
  osSel.addEventListener('change', () => picked.set('os'));
  // the edition changed: its own skins first, its first one chosen unless one was picked by hand
  const forEdition = (id) => {
    const own = editionSkins(id);
    fillSkins(skinSel, id, !picked.get('skin') && own.length ? own[0] : skinSel.value);
    fillOS(osSel, skinSel.value, HOSKINS.osDefault(skinSel.value)); // a new skin starts in its own look
  };
  return { skinSel, osSel, forEdition };
}
// T.lookOptions(where): a skin's own look options ('title', 'newgame',
// 'skinos'), kept with the Skin and OS look pickers, never with the rules
// (the Amiga's tall or square pixels); they take effect at once
const lookOptions = (where) => (T.lookOptions && T.lookOptions(where)) || null;
// the title screen's Skin and OS look pop-ups: a skin reloads the page in it,
// a look goes on at once
function titlePickers() {
  if (!window.HOSKINS) return;
  const ts = $('#tskin'), to = $('#tos');
  if (ts.options.length) { fillOS(to, HOSKINS.current, osNow()); return; }
  if (HOSKINS.list.length > 1) {
    fillSkins(ts, chosenRules(), HOSKINS.current);
    ts.addEventListener('change', () => { picked.set('skin'); HOSKINS.preview(ts.value, null); }); // the new skin opens in its own look (or the one last picked for it)
    ts.closest('label').hidden = false;
  }
  if (HOSKINS.osChoices) {
    fillOS(to, HOSKINS.current, osNow());
    to.addEventListener('change', () => { picked.set('os'); useOS(to.value); });
    to.closest('label').hidden = false;
  }
  const lo = !$('#tlook') && lookOptions('title');
  if (lo) { lo.id = 'tlook'; to.closest('label').after(lo); }
  titleLangPicker();
}
// the title screen's Language, beside Skin and OS look in every skin: English
// and every language a version offers, each marked (HO.languageChoices: where
// it is official, else the remake's translation), named in itself (never put
// in another language: translate="no")
function titleLangPicker() {
  const s = $('#tlang');
  if (!s || !window.HOUI) return;
  if (!s.options.length) {
    for (const c of HO.languageChoices()) {
      const o = document.createElement('option');
      o.value = c.code; o.lang = c.code; o.setAttribute('translate', 'no'); o.textContent = c.name;
      s.append(o);
    }
    s.addEventListener('change', () => chooseLang(s.value));
    UIL.onChange(() => { if (!G) s.value = titleLang(); });
    s.closest('label').hidden = false;
  }
  s.value = titleLang();
}
// Ho menu, "Skin and OS look…": the skin reloads the page and carries on with
// the saved game; the look goes on at once. Both are kept with the game
// (G.opts.os) and for the next one (localStorage).
function openSkin() {
  if (!window.HOSKINS) { toast('This copy of the game has only one skin.'); return; }
  const { skinSel, osSel } = skinOSPickers(G ? G.rules : chosenRules());
  if (HOSKINS.list.length < 2) skinSel.disabled = true;
  const go = () => {
    const id = skinSel.value, os = osSel.value || HOSKINS.os;
    if (G) { G.opts.os = os; save(); }
    if (id === HOSKINS.current) { closeModal(); useOS(os); return; }
    if (G) HOSKINS.switchTo(id, os); else HOSKINS.preview(id, os);
  };
  const f = el('form', { class: 'newgame skinos', onsubmit: (e) => { e.preventDefault(); go(); } },
    el('label', null, el('span', null, 'Skin'), skinSel),
    el('label', null, el('span', null, 'OS look'), osSel),
    lookOptions('skinos'),
    el('p', { class: 'sub' }, 'The skin is the game’s pictures and sounds from one release, the OS look the windows, menus and buttons around them; any skin can wear any look. ' +
      (G ? 'A new skin opens the saved game in it; a new look goes on at once. The rules stay as they are.' : 'A new look goes on at once.')),
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'OK')));
  modal('Skin and OS look', f, { cls: 'small' });
}
// "Choose sounds": off, a game plays only its skin's original's sounds; on,
// another version's sounds or none. value(): null (the skin's own), a sound
// set's id, or 'none'.
function soundPicker(value) {
  const sets = (window.HOSKINS && HOSKINS.soundSets) || [];
  const own = skinSoundsId(), ownSet = window.HOSKINS && HOSKINS.soundSet(own);
  const shown = value || (ownSet && ownSet.same) || own;
  const chk = el('input', { type: 'checkbox', name: 'choosesounds', checked: value ? 'checked' : false });
  const sel = el('select', { name: 'soundset', 'aria-label': 'Sounds' },
    ...sets.map(k => el('option', { value: k.id, selected: k.id === shown ? 'selected' : false }, k.name)),
    el('option', { value: 'none', selected: shown === 'none' ? 'selected' : false }, 'None'));
  const row = el('label', { class: 'soundset' }, el('span', null, 'Sounds'), sel);
  row.hidden = !value;
  chk.addEventListener('change', () => { row.hidden = !chk.checked; });
  const box = el('div', { class: 'soundpick' },
    el('label', { class: 'chk' }, chk, el('span', null, 'Choose sounds: another version’s sounds, or none (otherwise the game plays only the sounds of its skin’s original)')), row);
  box.value = () => chk.checked ? sel.value : null;
  return box;
}
function setSounds(v) {
  try { localStorage.setItem('ho5.sounds', v || ''); } catch (e) {}
  if (!G) return;
  if (v) G.opts.sounds = v; else delete G.opts.sounds;
  save(); applySounds();
}
function openSounds() {
  if (!G) { toast('Sounds are chosen for each game: start or continue one first.'); return; }
  const pick = soundPicker(G.opts.sounds || null);
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); setSounds(pick.value()); closeModal(); Sound.play(2000); } },
    pick, el('p', { class: 'sub' }, 'For this game. Sound on or off for every game is in the View menu.'),
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'OK')));
  modal('Sounds', f, { cls: 'small' });
}

// ----- help -----
// the manual for the rules being played (or last chosen on the New Game window)
function manualFor() {
  const M = window.HOMANUALS || {}, r = rulesId();
  // a version's help in the game's language (HOMANUALS[id][lang])
  const own = M[r] && !Array.isArray(M[r]) ? M[r] : null, lang = UIL.lang || 'en';
  if (own) return own[lang] || own.en;
  return M[r] || M.original || ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'];
}
// the manual (or help page) is English while the interface isn't
const manualEnglish = () => { const M = window.HOMANUALS || {}, own = M[rulesId()] && !Array.isArray(M[rulesId()]) ? M[rulesId()] : null; return UIL.lang !== 'en' && !(own && own[UIL.lang]); };
// a 5.0.5 hint in the interface's language (5.0.5's say has its hints)
const tipSay = (t) => { if (UIL.lang === 'en') return t.trim(); const g = { rules: 'original', opts: { lang: UIL.lang } }, a = HO.say(g, t); return a !== t ? a : HO.say(g, t.trim()); };
function openHelp() {
  if ((screensOf(rulesId()) || {}).help) return openHelpScreen();
  const tips = HO.DATA.tips || [];
  const body = el('div', { class: 'help' },
    el('p', null, 'Play with the bar charts to divide your money. Click a message to see the next one; when they’re all read, click the clock to end your turn. Double-click your colony to build ships. Drag a fleet’s dot to another star to send it there; drag it back onto its own star to cancel.'),
    el('h4', null, 'Planets'), el('p', null, 'Good planets are near 1.00G and 72°. Terraforming moves temperature toward 72°; gravity never changes. Anything above 2.5G or below 0.4G will never turn a profit, but you can still strip-mine it and then evacuate. Every colony costs $7,500 a turn to support until its population grows.'),
    el('h4', null, 'Ships'), el('p', null, 'Range is total fuel; ships refuel at your own colonies. A path drawn with two arrowheads means the fleet can get there and back. Speed sets how far a fleet goes each turn and who shoots first. Weapons against Shields decides damage. Mini makes ships cost more money but less metal.'),
    el('h4', null, 'Money and metal'), el('p', null, 'Savings earn a little interest. You can borrow up to five times your income, at 15% a turn. Metal only comes from mining, and it runs out.'),
    el('h4', null, 'Tip'), el('p', { class: 'tip' }, tips.length ? tipSay(tips[Math.floor(Math.random() * tips.length)]) : ''),
    el('p', { class: 'sub' }, 'This remake uses the original art, sounds, and text. Its rules are reconstructed from the manual (the “Claude” ruleset); numbers are not the original formulas.'));
  modal('How to play', body, { cls: 'mid' });
}

// ----- the iOS and Android apps' own screens (rs.screens) -----
// Saved Games: every game kept by its creation time (the app's folders; the
// remake's slots in the browser, "ho5.games.<rules>"), opened, deleted or
// downloaded (the app e-mailed one), and a downloaded game opened again;
// the help page as a screen; Game Center's leaderboards and achievements.
const screensOf = (id) => (HO.RULESETS[id] || {}).screens || null;
const gamesKey = (id) => 'ho5.games.' + id;
function savedGames(id) { try { const v = JSON.parse(localStorage.getItem(gamesKey(id)) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
// the game in its slot (from save(): the slot is the game's creation time)
function saveSlot() {
  if (!G || G.online || !screensOf(G.rules) || !screensOf(G.rules).savedGames) return;
  if (!G.gameId) G.gameId = Date.now();
  const L = savedGames(G.rules).filter(x => x && x.id !== G.gameId), p = G.players[ME] || G.players[0];
  L.unshift({ id: G.gameId, galaxy: (G.opts && G.opts.galaxy) || 'Milky Way', player: p ? p.name : '', year: G.year, over: !!G.over, when: Date.now(), data: HO.save(G) });
  try { localStorage.setItem(gamesKey(G.rules), JSON.stringify(L)); } catch (e) { toast('There’s no room left in this browser for another saved game. Delete one in Saved Games.'); }
}
function screen(title, body, opts) {
  opts = opts || {};
  closeScreen();
  const back = el('button', { class: 'sback', onclick: () => { closeScreen(); if (opts.onBack) opts.onBack(); } }, opts.back || 'Back');
  const sc = el('div', { class: 'hoscreen ' + (opts.cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    el('div', { class: 'sbar' }, back, el('h2', null, title), opts.right || el('span')), el('div', { class: 'sbody' }, body));
  document.body.append(sc); UI.screen = sc; back.focus();
  return sc;
}
function closeScreen() { if (UI.screen) { UI.screen.remove(); UI.screen = null; } }
// Escape (Android's Back) leaves a screen, before anything else hears it
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.screen && !document.querySelector('.scrim')) { e.preventDefault(); e.stopImmediatePropagation(); const b = UI.screen.querySelector('.sback'); if (b) b.click(); } }, true);
function openSavedGames(id) {
  id = id || rulesId();
  const S = screensOf(id) || {}, L = savedGames(id);
  const fileIn = el('input', { type: 'file', accept: '.hogame,.json,application/json', hidden: true, onchange: (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { HO.load(t); } catch (x) { toast('That file isn’t a saved game this remake can read.'); return; } localStorage.setItem('ho5.save', t); closeScreen(); continueGame(); });
  } });
  const open = (g) => { if (G) save(); localStorage.setItem('ho5.save', g.data); closeScreen(); continueGame(); };
  const download = (g) => {
    const a = el('a', { href: URL.createObjectURL(new Blob([g.data], { type: 'application/json' })), download: `${g.galaxy} ${g.year}.hogame`.replace(/[\\/:*?"<>|]+/g, '-') });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    maybeSaveOffer();
  };
  const del = (g) => confirmBox(`Delete the game in ${g.galaxy} (${g.year})?`, () => {
    try { localStorage.setItem(gamesKey(id), JSON.stringify(savedGames(id).filter(x => x.id !== g.id))); } catch (e) {}
    openSavedGames(id);
  });
  const rows = L.map(g => el('li', { class: 'sgame' },
    el('button', { class: 'sopen', onclick: () => open(g) }, el('b', null, g.galaxy), el('span', null, `${g.player} · ${g.over ? 'over in' : 'year'} ${g.year}`), el('small', null, new Date(g.when).toLocaleString())),
    el('button', { class: 'quiet', onclick: () => download(g), title: 'The app e-mailed a game; here it is saved as a file you can open again.' }, 'Download'),
    el('button', { class: 'quiet', onclick: () => del(g) }, 'Delete')));
  screen(S.savedGames || 'Saved Games', el('div', null,
    L.length ? el('ul', { class: 'slist' }, ...rows) : el('p', { class: 'sub' }, 'No saved games yet.'),
    el('div', { class: 'btns' }, el('button', { class: 'quiet', onclick: () => fileIn.click() }, 'Open a downloaded game…'),
      CLOUD ? el('button', { class: 'quiet', onclick: () => openAccountSaves() }, 'Account saves…') : null, fileIn)), { cls: 'saved' });
  maybeSaveOffer();
}
function openHelpScreen() {
  const [url, name] = manualFor();
  screen((screensOf(rulesId()) || {}).help || 'Help', el('div', { class: 'shelpbox' }, manualEnglish() ? inEnglish('This help is in English.') : null, el('iframe', { class: 'shelp', src: url, title: name })), { cls: 'helpscreen', back: 'Done' });
}
// Game Center's own windows (iOS: GKLeaderboardViewController,
// GKAchievementViewController), from the record the remake keeps
function openGameCenterScreen(tab) {
  const GC = HO.RULESETS[rulesId()] && HO.RULESETS[rulesId()].gameCenter; if (!GC) return;
  const rec = Object.assign(GC.blank(), gameCenterRec(GC) || {}), me0 = localStorage.getItem('ho5.name') || 'You';
  const seg = (items, cur, go) => el('div', { class: 'segmented', role: 'tablist' }, ...items.map(([k, t]) => el('button', { role: 'tab', 'aria-selected': k === cur ? 'true' : 'false', class: k === cur ? 'on' : '', onclick: () => go(k) }, t)));
  const boards = () => el('ul', { class: 'slist gc' }, ...GC.leaderboards.map(b => el('li', null, el('button', { class: 'sopen', onclick: () => board(b, 'all') }, el('b', null, b.title), el('span', null, `${fmt(rec[b.id] || 0)} · #1 of 1`)))));
  const board = (b, scope) => show('leaderboards', el('div', null,
    seg([['today', 'Today'], ['week', 'This Week'], ['all', 'All Time']], scope, (k) => board(b, k)),
    el('h3', { class: 'gch' }, b.title),
    el('ul', { class: 'slist gc' }, el('li', { class: 'gcrow' }, el('span', { class: 'gcrank' }, '1'), el('b', null, me0), el('span', { class: 'gcscore' }, fmt(rec[b.id] || 0)))),
    el('p', { class: 'sub' }, scope === 'all' ? 'Only this browser’s player is on the board.' : 'The remake keeps no dates for scores, so every period shows the same.'),
    el('button', { class: 'quiet', onclick: () => show('leaderboards') }, 'All leaderboards')));
  const ach = () => { const done = GC.achievements.filter(a => ((rec.achievements || {})[a.id] || 0) >= a.goal).length;
    return el('div', null, el('p', { class: 'sub' }, `${done} of ${GC.achievements.length} achievements completed`),
      el('ul', { class: 'slist gc' }, ...GC.achievements.map(a => { const n = (rec.achievements || {})[a.id] || 0, pc = Math.floor(100 * Math.min(n, a.goal) / a.goal);
        return el('li', { class: 'gcach' + (n >= a.goal ? ' done' : '') }, el('span', { class: 'gcicon', 'aria-hidden': 'true' }, n >= a.goal ? '★' : '☆'),
          el('span', null, el('b', null, a.title), el('small', null, n >= a.goal ? 'Completed' : a.goal > 1 ? `${fmt(n)} of ${fmt(a.goal)}` : 'Not yet')),
          el('span', { class: 'gcpct' }, pc + '%')); }))); };
  const show = (t, body) => screen('Game Center', el('div', null, seg([['leaderboards', 'Leaderboards'], ['achievements', 'Achievements']], t, (k) => show(k)),
    body || (t === 'achievements' ? ach() : boards()), el('p', { class: 'sub' }, GC.note || 'The app kept these on Game Center; here they stay in this browser.')), { cls: 'gamecenter', back: 'Done' });
  show(tab === 'achievements' ? 'achievements' : 'leaderboards');
}
// the title's buttons for these screens (the app's welcome screen)
function titleScreens() {
  const b = $('#titlescreen .tbtns'); if (!b) return;
  b.querySelectorAll('.tscreen').forEach(x => x.remove());
  const S = screensOf(chosenRules()); if (!S) return;
  const mk = (t, f) => el('button', { class: 'tscreen quiet', onclick: guard(f) }, t);
  if (S.savedGames) b.append(mk(S.savedGames, () => openSavedGames(chosenRules())));
  const GC = (HO.RULESETS[chosenRules()] || {}).gameCenter;
  if (S.gameCenterButtons && GC && GC.leaderboards.length) b.append(mk('Achievements', () => openGameCenterScreen('achievements')), mk('Leaderboards', () => openGameCenterScreen('leaderboards')));
}

// ----- online: the account, saves kept in it, the shared Hall (js/cloud.js) -----
// Everything here is optional and fails soft. With no HOCLOUD (the
// single-file build, a page opened from disk) none of it shows; with it, the
// Firebase SDK is fetched only when the player asks for something online
// (Account, Account saves, the Hall's Everyone list) or at one of the two
// offers below, or at start-up when this browser was signed in before. A
// player who never signs in plays exactly as before: browser saves only, no
// account made behind their back, no nagging. The browser saves ("ho5.save",
// the Saved Games slots) are kept as they always were, signed in or not: they
// are the offline option.
//
// Two offers, and only these, may suggest signing in, each at a moment that
// can't surprise: a game put in this computer's Hall of Fame or Shame (after
// the end of the game's own windows: "Put this game in the Hall everyone
// sees?") and a deliberate save (the Saved Games window, its Download). Each
// has a "Don't ask again" ("ho5.cloud.offer.<kind>"), is shown at most once a
// visit, never during a battle or on page load, never once signed in, and
// not at all when the SDK can't be loaded.
const CLOUD = window.HOCLOUD && HOCLOUD.supported ? HOCLOUD : null;
const cloudUser = () => (CLOUD && CLOUD.user) || null;
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
// "Google", "email", "guest": how the account signs in
const accountKind = (u) => u.anonymous ? 'a guest account (no email)' : u.google && u.password ? 'Google and email' : u.google ? 'Google' : 'email and password';
const dateText = (ms) => { try { return new Date(ms).toLocaleString(); } catch (e) { return ''; } };

// the title screen's account button, under the skin and look pickers
function titleAccount() {
  if (!CLOUD) return;
  let b = $('#tacct');
  if (!b) {
    const card = $('#titlescreen .tcard'); if (!card) return;
    b = el('button', { id: 'tacct', class: 'quiet tacct', type: 'button', onclick: () => openAccount() });
    const at = card.querySelector('.credit');
    const p = el('p', { class: 'tacctp' }, b);
    if (at) at.before(p); else card.append(p);
    CLOUD.onChange(() => titleAccount());
  }
  const u = cloudUser(), name = u ? u.name : CLOUD.wasSignedIn && !CLOUD.known ? CLOUD.lastName : null;
  b.textContent = name ? `Account: ${name}` : 'Sign in';
  b.setAttribute('aria-label', name ? `Account: signed in as ${name}` : 'Sign in to keep saved games in an account and share the Hall of Fame');
}

// the sign-in form: Google, email and password (sign in, create, forgot),
// guest. link: a guest adding Google or an email keeps its uid (and so its
// saves and Hall entries). after(user): what to do once signed in.
function signInForm(o) {
  o = o || {};
  const link = !!o.link;
  const status = el('p', { class: 'sub cloudmsg', role: 'alert' });
  const say = (t) => { status.textContent = t || ''; };
  const busy = (on) => f.querySelectorAll('button, input').forEach(x => { x.disabled = on; });
  const done = (u) => { busy(false); if (o.after) o.after(u || cloudUser()); };
  const run = (p, okText) => { busy(true); say('Working…'); return p.then((r) => { say(okText || ''); done(); return r; }, (e) => { busy(false); say(CLOUD.errorText(e)); }); };
  const email = el('input', { type: 'email', name: 'email', autocomplete: 'email', placeholder: 'you@example.com', 'aria-label': 'Email' });
  const pw = el('input', { type: 'password', name: 'password', autocomplete: link ? 'new-password' : 'current-password', placeholder: 'Password (6 letters or more)', 'aria-label': 'Password' });
  const f = el('form', { class: 'cloudform', onsubmit: (e) => { e.preventDefault(); } },
    el('p', null, link
      ? 'Add Google or an email and password to this guest account. It keeps everything it has: its saved games and its Hall entries.'
      : 'An account keeps your saved games, so they follow you to another computer, and puts your wins and losses in the Hall of Fame everyone sees. The game plays just the same without one.'),
    el('div', { class: 'btns' }, el('button', { type: 'button', onclick: () => run(link ? CLOUD.linkGoogle() : CLOUD.signInGoogle()) }, link ? 'Add a Google account' : 'Sign in with Google')),
    el('p', { class: 'sub' }, link ? 'Or an email and a password:' : 'Or with an email and a password:'),
    el('label', { class: 'cfield' }, el('span', null, 'Email'), email),
    el('label', { class: 'cfield' }, el('span', null, 'Password'), pw),
    el('div', { class: 'btns' },
      link ? el('button', { type: 'button', onclick: () => run(CLOUD.linkEmail(email.value, pw.value)) }, 'Add this email')
        : [el('button', { type: 'button', onclick: () => run(CLOUD.signInEmail(email.value, pw.value)) }, 'Sign in'),
          el('button', { type: 'button', class: 'quiet', onclick: () => run(CLOUD.createAccount(email.value, pw.value)) }, 'Create account'),
          el('button', { type: 'button', class: 'quiet', onclick: () => {
            if (!email.value.trim()) { say('Type your email address above, then click Forgot password again.'); return; }
            busy(true); say('Working…');
            CLOUD.resetPassword(email.value).then(() => { busy(false); say(`If there is an account for ${email.value.trim()}, an email with a link to choose a new password is on its way.`); }, (e) => { busy(false); say(CLOUD.errorText(e)); });
          } }, 'Forgot password?')]),
    link ? null : el('p', { class: 'sub' }, 'No email? Play as a guest: an account just for this browser. Add Google or an email to it later to keep it; a guest account that never gets one is deleted after 30 days.'),
    link ? null : el('div', { class: 'btns' }, el('button', { type: 'button', class: 'quiet', onclick: () => run(CLOUD.signInGuest()) }, 'Play as a guest')),
    status);
  return f;
}

// append what is there: the DOM's own append() writes a null as the text "null"
const put = (box, ...kids) => box.append(...kids.filter(k => k != null && k !== false));
// The Account window (the title's button, the Ho menu's Account…): who is
// signed in, the saves preference, Account saves…, a guest's upgrade, sign out
function openAccount(o) {
  if (!CLOUD) return;
  o = o || {};
  const body = el('div', { class: 'account' }, el('p', { class: 'sub' }, 'Connecting…'));
  modal('Account', body, { cls: 'small' });
  CLOUD.ready().then((ok) => {
    if (!body.isConnected) return;
    body.innerHTML = '';
    if (!ok) { body.append(el('p', null, 'Couldn’t load the account service. Check your connection and try again. Your games are saved in this browser either way.'), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))); return; }
    const u = cloudUser(), err = CLOUD.takeRedirectError();
    if (err) body.append(el('p', { class: 'cloudmsg', role: 'alert' }, err));
    if (!u) {
      body.append(signInForm({ after: (nu) => { if (o.after) { closeModal(); o.after(nu); } else openAccount(); } }));
      return;
    }
    const keep = el('input', { type: 'checkbox', checked: CLOUD.keepSaves() ? 'checked' : false, onchange: (e) => { CLOUD.setKeepSaves(e.target.checked); if (e.target.checked && G) save(); } });
    put(body,
      el('p', null, 'Signed in as ', el('b', null, u.name), u.anonymous ? '' : ` (${accountKind(u)})`, u.anonymous ? ': a guest account, for this browser only.' : '.'),
      u.email && u.name !== u.email ? el('p', { class: 'sub' }, u.email) : null,
      el('label', { class: 'chk' }, keep, el('span', null, 'Keep my saved games in my account too (off: in this browser only)')),
      el('p', { class: 'sub' }, 'Games are always saved in this browser as well, so they play offline. In the account they are sent at End Turn, when you leave the page, and at most once a minute in between.'),
      // shared names: the stars winners named and the names in the names file, by version
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', checked: CLOUD.useSharedNames() ? 'checked' : false, onchange: (e) => { CLOUD.setUseSharedNames(e.target.checked); if (e.target.checked) fetchSharedNames(rulesId()); } }),
        el('span', null, 'Use names other players have added')),
      el('p', { class: 'sub' }, 'The stars winners named and the names the 1.2 to 4.0.5 names file kept (players’ names for the computers, ship type names), from everyone playing the same version, join your own at New Game. The names you add go to everyone too.'),
      u.anonymous ? el('div', { class: 'guestup' }, el('p', { class: 'sub' }, 'A guest account is deleted after 30 days unless you add Google or an email to it. Adding one keeps its games and Hall entries.'),
        el('div', { class: 'btns' }, el('button', { type: 'button', onclick: () => { body.innerHTML = ''; body.append(signInForm({ link: true, after: () => openAccount(o) })); } }, 'Keep this account…'))) : null,
      el('div', { class: 'btns' },
        el('button', { type: 'button', onclick: () => openAccountSaves() }, 'Account saves…'),
        el('button', { type: 'button', onclick: () => openOnlineGames() }, 'My online games…'),
        el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox(u.anonymous ? 'Sign out of the guest account? A guest can’t sign in again: its saved games in the account will be out of reach (they stay in this browser).' : 'Sign out? Your games stay saved in this browser.', () => {
          CLOUD.flushSave(); CLOUD.signOut().then(() => toast('Signed out.'), (e) => toast(CLOUD.errorText(e)));
        }) }, 'Sign out')),
      // privacy.html: what is kept, and deleting it all
      el('p', { class: 'sub' }, el('a', { href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy and terms'), ' · ',
        el('a', { href: '#', onclick: (e) => { e.preventDefault(); confirmBox('Delete your account and everything in it: its saved games, its games in the shared Hall of Fame and the names it added for everyone? This can’t be undone. Games saved in this browser stay here.', () => {
          CLOUD.flushSave && CLOUD.flushSave();
          const halls = Object.keys(HO.RULESETS).filter(id => HO.RULESETS[id] && HO.RULESETS[id].hall);
          // every pool and kind a version shares names in
          const pools = {};
          for (const id of Object.keys(HO.RULESETS)) { const ks = nameKinds(id); if (ks.length) { const pl = namePool(id); pools[pl] = [...new Set((pools[pl] || []).concat(ks))]; } }
          CLOUD.deleteAccount(halls, Object.entries(pools)).then(() => { closeModal(); toast('Your account and its data are deleted.'); }, (e) => toast(CLOUD.errorText(e)));
        }); } }, 'Delete my account and data…')),
      el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK')));
    if (o.after) { const f = o.after; o.after = null; f(u); }
  });
}

// ----- saves in the account -----
// save() hands the game over each time; js/cloud.js sends it at End Turn
// (urgent), when the page is hidden, and at most once a minute otherwise,
// and only when it has changed. The browser copy's time ("ho5.save.when")
// tells Continue whether the account's copy is newer.
function cloudNoteSave(json, urgent) {
  // (an online game is kept in its own place: My online games)
  if (!CLOUD || !cloudUser() || !G || !G.gameId || G.online) return;
  const p = G.players[ME] || G.players[0];
  const s = { id: CLOUD.saveId(G.rules, G.gameId), rules: G.rules, edition: editionLabel(G.rules), year: G.year, player: p ? p.name : '',
    galaxy: (G.opts && G.opts.galaxy) || '', over: !!G.over, json, saved: Date.now() };
  CLOUD.noteSave(() => s, urgent);
}
if (CLOUD) CLOUD.onSaveProblem = (t) => toast(t);
// Open a game's text: the browser copy is replaced, as Saved Games does
function openGameText(t, when) {
  try { HO.load(t); } catch (x) { toast('That saved game can’t be read by this version of the remake.'); return false; }
  if (G) save();
  localStorage.setItem('ho5.save', t); lsSet('ho5.save.when', String(when || Date.now()));
  closeModal(); closeScreen(); continueGame();
  return true;
}
const gameFileName = (g) => `${g.galaxy || 'Spaceward Ho'} ${g.year}.hogame`.replace(/[\\/:*?"<>|]+/g, '-');
// Export and import, for every version and with no account (the Game menu;
// Import also on the title screen): the same .hogame file Saved Games and
// Account saves give. An online game exports as a snapshot of this page's
// copy, and an imported one opens as a local game.
function exportGame() {
  if (!G) { toast('Start or continue a game first, then export it.'); return; }
  if (!G.gameId) G.gameId = Date.now();
  downloadText(HO.save(G), gameFileName({ galaxy: (G.opts && G.opts.galaxy) || 'Milky Way', year: G.year }));
  if (G.online) toast('Exported a snapshot of this online game as it stands on this computer. Imported, it opens as a local game, not online.');
  maybeSaveOffer();
}
function importGame() {
  const fileIn = el('input', { type: 'file', accept: '.hogame,.json,application/json', hidden: true, onchange: () => {
    const f = fileIn.files[0]; fileIn.remove();
    if (f) f.text().then(importText, () => toast('That file couldn’t be read.'));
  } });
  document.body.append(fileIn); fileIn.click();
}
function importText(t) {
  let g;
  try { g = HO.load(t); } catch (x) { g = null; }
  if (!g || !Array.isArray(g.players) || !Array.isArray(g.stars)) { toast('That file isn’t a saved game this remake can read.'); return; }
  const online = !!g.online;
  if (online) { delete g.online; t = HO.save(g); } // a local game from here on
  const go = () => {
    if (G && G.online) leaveOnlineView();
    if (openGameText(t)) toast(online ? 'This was an online game. It opens here as a local game, every player on this computer: nothing done in it reaches the online game.' : 'The imported game is open.');
  };
  // a game in progress (playing, or waiting behind Continue) is asked about
  // first; an online game's copy here is only a cache, so it isn't
  let cur = G;
  if (!cur && lsGet('ho5.save')) try { cur = HO.load(lsGet('ho5.save')); } catch (x) { cur = null; }
  if (!cur || cur.over || cur.online) return go();
  const kept = (screensOf(cur.rules) || {}).savedGames ? `It stays in ${(screensOf(cur.rules) || {}).savedGames}.` : 'It will be gone unless you export it first (Export this game…).';
  confirmBox(`Open the imported game in place of the game in progress? ${kept}`, go);
}
// The Account saves window: every game kept in the account, newest first,
// for every ruleset: Open, Download (the .hogame file Saved Games gives),
// Delete; and "Save this game to the account now"
function openAccountSaves() {
  if (!CLOUD) return;
  if (!cloudUser()) { openAccount({ after: () => openAccountSaves() }); return; }
  const body = el('div', { class: 'acsaves' }, el('p', { class: 'sub' }, 'Loading your saved games…'));
  modal('Account saves', body, { cls: 'mid' });
  const fill = () => CLOUD.listSaves().then((L) => {
    if (!body.isConnected) return;
    body.innerHTML = '';
    const now = G && G.gameId ? CLOUD.saveId(G.rules, G.gameId) : null;
    const rows = L.map(g => el('li', { class: 'acsave' + (g.id === now ? ' cur' : '') },
      el('div', { class: 'acinfo' }, el('b', null, g.galaxy || 'Galaxy'), ' ', el('span', null, `${g.player || ''} · ${g.over ? 'over in' : 'year'} ${g.year}${g.id === now ? ' · playing now' : ''}`),
        el('br'), el('small', null, `${g.edition || g.rules} · ${dateText(g.updated)} · ${Math.max(1, Math.round((g.size || 0) / 1024))} KB`)),
      el('span', { class: 'btns' },
        el('button', { type: 'button', onclick: () => CLOUD.getSave(g).then(t => t ? openGameText(t, g.saved) : toast('That game is no longer in the account.'), e => toast(CLOUD.errorText(e))) }, 'Open'),
        el('button', { type: 'button', class: 'quiet', onclick: () => CLOUD.getSave(g).then(t => { if (t) downloadText(t, gameFileName(g)); }, e => toast(CLOUD.errorText(e))) }, 'Download'),
        el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox(`Delete the game in ${g.galaxy || 'this galaxy'} (${g.year}) from your account? A copy in this browser stays.`, () => {
          CLOUD.deleteSave(g.id).then(() => { toast('Deleted from your account.'); openAccountSaves(); }, e => toast(CLOUD.errorText(e)));
        }) }, 'Delete'))));
    put(body,
      L.length ? el('ul', { class: 'aclist' }, ...rows) : el('p', { class: 'sub' }, 'No games in your account yet.'),
      CLOUD.keepSaves() ? null : el('p', { class: 'sub' }, 'Keeping saved games in the account is off (Account…), so new games stay in this browser only.'),
      el('div', { class: 'btns right' },
        G ? el('button', { type: 'button', class: 'quiet', onclick: () => {
          save();
          const p = G.players[ME] || G.players[0];
          CLOUD.uploadNow({ id: CLOUD.saveId(G.rules, G.gameId), rules: G.rules, edition: editionLabel(G.rules), year: G.year, player: p ? p.name : '', galaxy: (G.opts && G.opts.galaxy) || '', over: !!G.over, json: HO.save(G), saved: Date.now() })
            .then((r) => { if (r === 'big') return; toast(r === 'off' ? 'Sign in first.' : 'This game is saved in your account.'); if (body.isConnected) openAccountSaves(); }, e => toast(CLOUD.errorText(e)));
        } }, 'Save this game to the account now') : null,
        el('button', { type: 'button', onclick: closeModal }, 'OK')));
  }, (e) => { if (body.isConnected) { body.innerHTML = ''; body.append(el('p', null, CLOUD.errorText(e)), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))); } });
  fill();
}
// Continue: when this browser's game has a copy in the account that is newer
// (played on another computer), ask which to play. Gives up after 5 seconds
// (or with no network) and plays this browser's copy.
function continueChecked() {
  const raw = lsGet('ho5.save');
  if (!CLOUD || !raw || !(cloudUser() || CLOUD.wasSignedIn) || !CLOUD.keepSaves()) { continueGame(); return; }
  let g0 = null; try { g0 = JSON.parse(raw); } catch (e) {}
  if (!g0 || !g0.gameId) { continueGame(); return; }
  const id = CLOUD.saveId(g0.rules, g0.gameId), when = +lsGet('ho5.save.when') || 0;
  const btn = $('#tcont'); if (btn) btn.disabled = true;
  const go = (f) => { if (btn) btn.disabled = false; f(); };
  CLOUD.within(CLOUD.ready().then(ok => ok && cloudUser() ? CLOUD.saveInfo(id) : null).catch(() => null), 5000, null).then((c) => {
    const newer = c && c.hash !== CLOUD.hash(raw) && (c.year > g0.year || (c.year === g0.year && c.saved > when + 2000));
    if (!newer) { go(() => continueGame()); return; }
    go(() => {
      const body = el('div', null,
        el('p', null, `The copy of this game in your account is newer: the year ${c.year}, saved ${dateText(c.saved)}, probably on another computer. This browser’s copy is the year ${g0.year}${when ? `, saved ${dateText(when)}` : ''}.`),
        el('p', { class: 'sub' }, 'The one you don’t choose is replaced the next time the game is saved.'),
        el('div', { class: 'btns right' },
          el('button', { type: 'button', class: 'quiet', onclick: () => { closeModal(); continueGame(); } }, 'This browser’s copy'),
          el('button', { type: 'button', onclick: () => CLOUD.getSave(c).then(t => { if (!t || !openGameText(t, c.saved)) { closeModal(); continueGame(); } }, (e) => { toast(CLOUD.errorText(e)); closeModal(); continueGame(); }) }, 'The account’s copy')));
      modal('Which copy?', body, { cls: 'small', sticky: true });
    });
  });
}

// ----- the shared Hall of Fame -----
// recordHall's entries, posted when signed in; otherwise kept for the offer
UI.hallWaiting = [];
function cloudHall(rec) {
  if (!CLOUD) return;
  if (cloudUser()) { postHallEntry(rec); return; }
  if (offerAllowed('hall')) UI.hallWaiting.push(rec);
}
function postHallEntry(rec) {
  return CLOUD.postHall(rec).then((r) => {
    // the name didn't pass js/decency.js: said once a name
    if (r && r.renamed && lsGet('ho5.cloud.renamed') !== r.name + '|' + rec.name) {
      lsSet('ho5.cloud.renamed', r.name + '|' + rec.name);
      toast(`“${rec.name}” can’t go on the Hall everyone sees, so your game is there as “${r.name}”.`);
    }
    return r;
  }, () => null);
}
const offerKey = (kind) => 'ho5.cloud.offer.' + kind;
UI.offered = {};
function offerAllowed(kind) {
  return !!CLOUD && !cloudUser() && !CLOUD.wasSignedIn && lsGet(offerKey(kind)) !== 'no' && !UI.offered[kind] && navigator.onLine !== false;
}
// nothing else on screen: no window, no battle, no screen, the title hidden
const quietMoment = () => !UI.modal && !UI.screen && !document.querySelector('.scrim') && $('#titlescreen') && $('#titlescreen').hidden;
// The offer itself: text, then Sign in / Play as a guest / Not now and
// "Don't ask again". then(user) runs once signed in either way.
function showOffer(kind, title, text, then, no) {
  if (!offerAllowed(kind)) return;
  UI.offered[kind] = true;
  // the SDK first, so an offer that can't be taken up is never shown
  CLOUD.within(CLOUD.loadSdk(), 8000, false).then((ok) => {
    if (!ok || cloudUser() || UI.modal) return;
    const never = el('input', { type: 'checkbox' });
    const remember = () => { if (never.checked) lsSet(offerKey(kind), 'no'); };
    const status = el('p', { class: 'sub cloudmsg', role: 'alert' });
    const body = el('div', { class: 'offer' }, el('p', null, text),
      el('p', { class: 'sub' }, 'A guest account needs no email; add one later to keep it.'),
      el('label', { class: 'chk' }, never, el('span', null, 'Don’t ask again')), status,
      el('div', { class: 'btns right' },
        el('button', { type: 'button', class: 'quiet', onclick: () => { remember(); closeModal(); if (no) no(); } }, 'Not now'),
        el('button', { type: 'button', class: 'quiet', onclick: (e) => {
          remember(); e.target.disabled = true; status.textContent = 'Working…';
          CLOUD.signInGuest().then(() => { closeModal(); then(cloudUser()); }, (er) => { e.target.disabled = false; status.textContent = CLOUD.errorText(er); });
        } }, 'Play as a guest'),
        el('button', { type: 'button', onclick: () => { remember(); closeModal(); openAccount({ after: (u) => { if (u) then(u); } }); } }, 'Sign in')));
    modal(title, body, { cls: 'small' });
  });
}
// (a) after a game goes in this computer's Hall, once the game's own
// end-of-game windows are done (renderMsg calls this when nothing is left)
function maybeHallOffer() {
  if (!CLOUD || !UI.hallWaiting.length || cloudUser()) return;
  setTimeout(() => {
    if (!UI.hallWaiting.length || !quietMoment() || (G && G.over && winPending())) return;
    const rec = UI.hallWaiting[UI.hallWaiting.length - 1], hall = rec.kind === 'shame' ? 'Hall of Shame' : 'Hall of Fame';
    showOffer('hall', hall, `Put this game in the ${hall} everyone sees? Your name and the game’s settings go on the shared ${hall} for ${rec.edition}.`, () => {
      const L = UI.hallWaiting.splice(0);
      Promise.all(L.map(postHallEntry)).then(rs => { if (rs.some(Boolean)) toast(`Your game is in the ${hall} everyone sees.`); });
    }, () => { UI.hallWaiting = []; }); // Not now: nothing is posted
  }, 600);
}
// (b) a deliberate save: the Saved Games window, its Download
function maybeSaveOffer() {
  if (!CLOUD) return;
  setTimeout(() => {
    if (!offerAllowed('saves') || UI.modal || document.querySelector('.battle')) return;
    showOffer('saves', 'Saved games', 'Keep your saved games in an account too, so they follow you to another computer?', () => { CLOUD.setKeepSaves(true); if (G) save(); toast('Your saved games will be kept in your account too.'); });
  }, 400);
}
// a sign-in from anywhere posts what the Hall offer was holding
if (CLOUD) CLOUD.onChange((u) => { if (u && UI.hallWaiting.length) { const L = UI.hallWaiting.splice(0); L.forEach(postHallEntry); } });
// and fetches the shared names of the version last chosen (once a day)
if (CLOUD) CLOUD.onChange((u) => { if (u) fetchSharedNames(rulesId()); });
// ----- the player's language in the account (users/{uid}/prefs/main) -----
// Signed in, the title screen's Language follows the player: when the account
// is known (a sign-in, or at start-up when this browser was signed in) the
// account's choice and this browser's are compared and the most recent is
// kept in both; a choice made while signed in is sent at once. Not signed
// in: this browser only (HOUI.pref). Neither ever loads the SDK.
function cloudPrefsSync() {
  if (!CLOUD || !cloudUser() || !CLOUD.getPrefs) return Promise.resolve(null);
  return CLOUD.getPrefs().then((r) => {
    const mine = UIL.pref.get(), at = UIL.pref.at();
    if (r && (!mine || r.updated > at)) {
      // the account's is newer (or this browser has none): it is the choice here too
      UIL.pref.set(r.lang, r.updated);
      if (!G && UIL.lang !== r.lang) UIL.set(r.lang);
      return 'got';
    }
    if (mine && (!r || (at > r.updated && r.lang !== mine))) { cloudPrefsUp(); return 'sent'; }
    return 'same';
  }).catch(() => null);
}
function cloudPrefsUp() {
  const l = UIL.pref.get();
  if (!CLOUD || !cloudUser() || !CLOUD.setPrefs || !l) return;
  // the server's time of the choice, so this browser compares like the account
  CLOUD.setPrefs({ lang: l }).then((t) => { if (t && UIL.pref.get() === l) UIL.pref.set(l, t); }).catch(() => null);
}
if (CLOUD) CLOUD.onChange((u) => { if (u) cloudPrefsSync(); });

// The Hall window's Everyone list: the 25 newest or best entries of this
// ruleset's shared Hall, in the version's own columns
function hallEveryone(kind, H, cols, box, order, onRows) {
  box.innerHTML = '';
  box.append(el('p', { class: 'sub' }, 'Loading the Hall everyone shares…'));
  CLOUD.hallTop(G.rules, kind, order).then((L) => {
    box.innerHTML = '';
    onRows(L);
    box.append(hallListBox(L.map(e => [e.name + (e.mine ? ' (you)' : ''), H.date(e.time, G), String(e.difficulty)]), cols, 0, (i) => onRows(L, i), (i) => onRows(L, i, true)));
    if (!L.length) box.append(el('p', { class: 'sub' }, 'Nobody is in it yet.'));
    if (!cloudUser()) box.append(el('p', { class: 'sub' }, 'Sign in, or play as a guest, to add your games here.'));
  }, (e) => { box.innerHTML = ''; box.append(el('p', { class: 'sub' }, CLOUD.errorText(e))); onRows([]); });
}

// ----- online play (js/online.js, js/cloud.js "online play") -----
// Several people, each on their own computer, play one game turn by turn,
// as the originals' network play had it, with no server but Firestore.
// - New Game's "Play online…" takes the window's settings to a lobby: the
//   host picks the seats (people), and others join by its code or link
//   (?join=CODE), signed in (a guest will do). Computers fill the seats left
//   empty, as they fill a game's other places; the host starts it when ready.
// - Each player plays their own turn on their own page, against the shared
//   state, and sees only their own empire, as hot seat shows each player
//   theirs. js/online.js records what they do (the orders); End Turn sends
//   them. When the last player's orders are in, their page plays the turn
//   (every seat's orders in seat order, then the turn itself) and writes the
//   new state, once (a transaction on the turn number); every page picks it
//   up (a realtime listener), plays the same orders itself to check it gets
//   the same game, and shows the new year's reports with a toast.
// - In the meantime the page says who the turn waits for ("Waiting for:
//   Alice, Bob"); the host can end a turn for someone ("End turn for…"), as
//   the time limit (4.0.5, 5.0.5) does on that player's own page. A player
//   may resign (a computer plays their empire from the next turn) or leave.
// - "My online games" (New Game, Account) lists the account's games, to
//   open from any computer: the game is in Firestore, and this browser's
//   save ("ho5.save", "ho5.online.<id>" for a turn in progress) is a cache.
// Nothing here runs for a game on one computer, and nothing loads until a
// player asks for online play (js/online.js comes with it, js/cloud.js's SDK
// with the sign-in).
const ONL = { id: null, card: null, seat: -1, start: null, turn: -1, sent: false, justSent: false, arriving: -1, done: {}, unsub: [], unsubO: [], timer: 0, busy: false, checks: [], self: [], processed: {} };
const OL = () => window.HOONLINE;
function loadOnline() { return OL() ? Promise.resolve(true) : new Promise((res) => { const s = el('script', { src: 'js/online.js' }); s.onload = () => res(!!OL()); s.onerror = () => res(false); document.head.append(s); }); }
// the page's record of a turn in progress (its orders so far), for a reload or another skin
const turnKey = (id) => 'ho5.online.' + id;
const onlineNames = () => (ONL.card ? (ONL.card.seats || []).map(u => ((ONL.card.names || {})[u] || {}).name || 'Player') : []);
// the test tools read where the page is (read only)
window.HOONLINE_VIEW = () => ({ id: ONL.id, turn: ONL.turn, seat: ONL.seat, status: ONL.card && ONL.card.status, sent: ONL.sent, digest: ONL.start && OL() ? OL().digest(ONL.start) : null,
  year: G && G.online ? G.year : null, battles: G && G.online ? G.stat.battles : 0, waiting: onlineWaiting().map(pid => onlineNames()[pid]), checks: ONL.checks.slice(), self: ONL.self.slice(), over: !!(G && G.over) });
// sign in first (the Account window), then fn(user)
function withAccount(fn) {
  if (!CLOUD) return;
  if (cloudUser()) { fn(cloudUser()); return; }
  CLOUD.ready().then(() => { if (cloudUser()) fn(cloudUser()); else openAccount({ after: (u) => { if (u) fn(u); } }); });
}
function stopOrders() { for (const u of ONL.unsubO.splice(0)) { try { u(); } catch (e) {} } clearTimeout(ONL.timer); }
function stopWatching() { stopOrders(); for (const u of ONL.unsub.splice(0)) { try { u(); } catch (e) {} } }
function leaveOnlineView() { stopWatching(); if (OL() && OL().recording) OL().stop(); ONL.id = null; ONL.card = null; ONL.start = null; ONL.turn = -1; ONL.sent = false; }

// ----- the lobby -----
// Play online… from New Game: the window's settings (options()) make the lobby
function hostOnline(options) {
  withAccount(() => {
    let r;
    try { r = options(); } catch (e) { showBug(e, 'Play online'); return; }
    const { d, o } = r, rs = HO.RULESETS[o.rules] || {};
    if ((rs.maxHumans || 6) < 2) { toast(`${editionLabel(o.rules)} is for one player: online play needs a version several people can play.`); return; }
    // the page's own look stays its own; the seed is drawn when the game starts
    for (const k of ['sounds', 'os', 'humans']) delete o[k];
    const seats = Math.min(Math.max(2, +d.humans || 2), Math.min(8, rs.maxHumans || 6));
    closeModal();
    const body = el('div', { class: 'lobby' }, el('p', { class: 'sub' }, 'Making the game…'));
    modal('Play online', body, { cls: 'small', sticky: true });
    CLOUD.games.create({ rules: o.rules, edition: editionLabel(o.rules), galaxy: o.galaxy, opts: o, nSeats: seats, name: o.name, female: !!o.female })
      .then(({ id }) => openLobby(id), (e) => { body.innerHTML = ''; put(body, el('p', null, CLOUD.errorText(e)), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))); });
  });
}
// the lobby window, for the host and for those who joined, live
function openLobby(id) {
  leaveOnlineView();
  ONL.id = id;
  const body = el('div', { class: 'lobby' }, el('p', { class: 'sub' }, 'Connecting…'));
  modal('Online game', body, { cls: 'small', sticky: true, onClose: () => { if (ONL.id === id && (!ONL.card || ONL.card.status === 'lobby')) leaveOnlineView(); } });
  const uid = cloudUser() && cloudUser().uid;
  const draw0 = (c) => {
    if (!body.isConnected) return;
    if (!c) { body.innerHTML = ''; put(body, el('p', null, 'This game is gone: its host cancelled it, or you are no longer in it.'), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))); leaveOnlineView(); return; }
    ONL.card = c;
    if (c.status !== 'lobby') { closeModal(); openOnlineGame(id); return; }
    const host = c.host === uid, link = `${location.origin}${location.pathname}?join=${c.code}`;
    const rs = HO.RULESETS[c.rules] || {}, maxSeats = Math.min(8, rs.maxHumans || 6);
    const seatSel = el('select', { 'aria-label': 'Seats', disabled: host ? false : 'disabled', onchange: (e) => CLOUD.games.settle(id, { nSeats: +e.target.value }).catch(er => toast(CLOUD.errorText(er))) },
      ...[...Array(maxSeats - 1).keys()].map(i => i + 2).filter(n => n >= c.members.length).map(n => el('option', { value: String(n), selected: n === c.nSeats ? 'selected' : false }, String(n))));
    const names = c.members.map((u, i) => el('li', null, `${i + 1}. ${((c.names || {})[u] || {}).name || 'Player'}${u === c.host ? ' (host)' : ''}${u === uid ? ' (you)' : ''}`));
    for (let i = c.members.length; i < c.nSeats; i++) names.push(el('li', { class: 'sub' }, `${i + 1}. (open: a computer plays it if nobody joins)`));
    body.innerHTML = '';
    put(body,
      el('p', null, `${c.galaxy || 'Galaxy'} · ${c.edition || c.rules}`),
      el('p', { class: 'lobbycode' }, 'Code: ', el('b', { class: 'code' }, c.code)),
      el('p', { class: 'sub' }, 'Others join with this code (New Game, Play online…, Join), or this link: ', el('a', { href: link, class: 'joinlink' }, link), ' ',
        el('button', { type: 'button', class: 'quiet', onclick: () => { try { navigator.clipboard.writeText(link).then(() => toast('The link is copied.'), () => toast(link)); } catch (e) { toast(link); } } }, 'Copy link')),
      el('label', null, el('span', null, 'Seats (people)'), seatSel),
      el('ul', { class: 'lobbylist' }, ...names),
      el('p', { class: 'sub' }, 'Players must be signed in (a guest account will do). Each plays their own turn on their own computer; the year moves on when everyone has ended theirs.'),
      el('div', { class: 'btns right' },
        host ? el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox('Cancel this game? Those who joined are told it is gone.', () => CLOUD.games.cancel(id, c.code).then(() => { leaveOnlineView(); toast('The game is cancelled.'); }, e => toast(CLOUD.errorText(e)))) }, 'Cancel game')
          : el('button', { type: 'button', class: 'quiet', onclick: () => CLOUD.games.leaveLobby(id).then(() => { leaveOnlineView(); closeModal(); toast('You left the game.'); }, e => toast(CLOUD.errorText(e))) }, 'Leave'),
        host ? el('button', { type: 'button', disabled: c.members.length < 2 ? 'disabled' : false, onclick: (e) => { e.target.disabled = true; startOnline(c).catch((er) => { e.target.disabled = false; toast(CLOUD.errorText(er)); }); } }, c.members.length < 2 ? 'Start (waiting for players)' : 'Start the game')
          : el('span', { class: 'sub' }, 'Waiting for the host to start…')));
  };
  loadOnline().then((ok) => {
    if (!ok) { body.innerHTML = ''; body.append(el('p', null, 'Couldn’t load online play. Check your connection and try again.')); return; }
    ONL.unsub.push(CLOUD.games.watch(id, draw0));
  });
}
// the host starts it: the game made from the lobby's settings, a seat for
// each player in the order they joined, computers in the seats left
function startOnline(c) {
  const o = JSON.parse(c.opts || '{}');
  o.humans = c.members.map(u => ({ name: ((c.names || {})[u] || {}).name || 'Player', female: !!((c.names || {})[u] || {}).female }));
  o.computers = Math.max(0, (+o.computers || 0) + (c.nSeats - c.members.length));
  o.seed = (Math.random() * 2 ** 31) | 0;
  delete o.name; delete o.female;
  const g = HO.newGame(o);
  const json = OL().shared(g);
  return CLOUD.games.start(c.id, c.code, json, OL().digest(json), g.year, c.members, g.opts);
}
// Join… with a code (or the ?join= link): your name and hat, then the lobby
function openJoin(code0) {
  withAccount(() => {
    const code = el('input', { name: 'code', maxlength: 6, value: CLOUD.cleanCode(code0 || ''), autocomplete: 'off', 'aria-label': 'Code', style: 'text-transform: uppercase' });
    const name = el('input', { name: 'name', maxlength: 20, value: localStorage.getItem('ho5.name') || '', 'aria-label': 'Your name' });
    const hat = el('select', { name: 'female', 'aria-label': 'Your hat' }, el('option', { value: '0' }, 'Cowboy'), el('option', { value: '1' }, 'Cowgirl'));
    const msg = el('p', { class: 'sub cloudmsg', role: 'alert' });
    const f = el('form', { class: 'newgame', onsubmit: (e) => {
      e.preventDefault();
      const c = CLOUD.cleanCode(code.value), n = name.value.trim() || 'Player';
      if (c.length !== 6) { msg.textContent = 'A code has six letters and numbers.'; return; }
      lsSet('ho5.name', n);
      msg.textContent = 'Joining…';
      // the name others will see goes through the decency filter, like the Hall's
      CLOUD.decency().then(D => (D ? D.clean(n, 'Cowpoke') : n)).then(nn => CLOUD.games.find(c).then((id) => {
        if (!id) { msg.textContent = 'There’s no game waiting with that code. Check it with the host.'; return; }
        return CLOUD.games.join(id, c, { name: nn, female: hat.value === '1' }).then(() => openLobby(id));
      })).catch((er) => { msg.textContent = CLOUD.errorText(er); });
    } },
      el('label', null, el('span', null, 'Code'), code),
      el('label', null, el('span', null, 'Your name'), name),
      el('label', null, el('span', null, 'Your hat'), hat), msg,
      el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'Join')));
    modal('Join an online game', f, { cls: 'small' });
  });
}
// My online games: the account's games, newest first, to open from any computer
function openOnlineGames() {
  withAccount((u) => {
    const body = el('div', { class: 'acsaves' }, el('p', { class: 'sub' }, 'Loading your online games…'));
    modal('My online games', body, { cls: 'mid' });
    CLOUD.games.list().then((L) => {
      if (!body.isConnected) return;
      body.innerHTML = '';
      const state = (g) => g.status === 'lobby' ? 'waiting to start' : g.status === 'over' ? `over in ${g.year}` : `${g.year}${(g.resigned || []).includes(u.uid) ? ' · resigned' : ''}`;
      const rows = L.map(g => el('li', { class: 'acsave' },
        el('div', { class: 'acinfo' }, el('b', null, g.galaxy || 'Galaxy'), ' ', el('span', null, `${(g.seats && g.seats.length ? g.seats : g.members).map(x => ((g.names || {})[x] || {}).name || '?').join(', ')} · ${state(g)}`),
          el('br'), el('small', null, `${g.edition || g.rules} · ${dateText(g.updated)}`)),
        el('span', { class: 'btns' },
          el('button', { type: 'button', onclick: () => { closeModal(); if (g.status === 'lobby') openLobby(g.id); else openOnlineGame(g.id); } }, 'Open'),
          el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox(g.status === 'playing' ? 'Leave this game? A computer plays your empire from the next turn, and the game leaves your list.' : 'Take this game off your list?', () => {
            const p = g.status === 'lobby' ? (g.host === u.uid ? CLOUD.games.cancel(g.id, g.code) : CLOUD.games.leaveLobby(g.id)) : CLOUD.games.leave(g.id, g.status === 'playing');
            p.then(() => { if (ONL.id === g.id) leaveOnlineView(); toast('Done.'); openOnlineGames(); }, e => toast(CLOUD.errorText(e)));
          }) }, g.status === 'lobby' && g.host === u.uid ? 'Cancel' : 'Leave'))));
      put(body, L.length ? el('ul', { class: 'aclist' }, ...rows) : el('p', { class: 'sub' }, 'No online games yet. New Game, then Play online…, starts one.'),
        el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: () => openJoin() }, 'Join with a code…'), el('button', { type: 'button', onclick: closeModal }, 'OK')));
    }, (e) => { if (body.isConnected) { body.innerHTML = ''; put(body, el('p', null, CLOUD.errorText(e)), el('div', { class: 'btns right' }, el('button', { onclick: closeModal }, 'OK'))); } });
  });
}

// ----- playing -----
// open a game being played (or over): its state at this turn, this player's
// seat; a turn already begun on this computer goes on from its orders
function openOnlineGame(id, cached) {
  withAccount((u) => {
    toast('Opening the online game…');
    loadOnline().then(ok => { if (!ok) throw new Error('Couldn’t load online play.'); return CLOUD.games.get(id); }).then((c) => {
      if (!c) { toast('That online game is gone, or you are no longer in it.'); return; }
      if (c.status === 'lobby') { openLobby(id); return; }
      const seat = (c.seats || []).indexOf(u.uid);
      if (seat < 0) { toast('You don’t have a seat in that game.'); return; }
      return CLOUD.games.state(id, c.turn).then((st) => {
        if (!st) throw new Error('The game’s state for this turn is missing.');
        leaveOnlineView();
        Object.assign(ONL, { id, card: c, seat, done: {}, sent: false });
        enterTurn(st.json, c.turn, cached && cached.online && cached.online.id === id ? cached : G && G.online && G.online.id === id ? G : null, true);
        ONL.unsub.push(CLOUD.games.watch(id, onCard));
        watchTurnOrders();
      });
    }).catch((e) => toast(CLOUD.errorText(e)));
  });
}
// the page takes up a turn's state: its own copy, this seat's turn begun
// (its block of ids, js/online.js prepare), the orders recorded from here
function enterTurn(json, turn, prev, opening) {
  const pid = ONL.seat;
  ONL.start = json; ONL.turn = turn; ONL.sent = false; ONL.justSent = false; ONL.done = {};
  G = OL().adopt(json, prev);
  G.online = Object.assign({}, prev && prev.online, { id: ONL.id });
  if (!G.gameId) G.gameId = Date.now();
  OL().prepare(G, pid);
  // a turn in progress on this computer (a reload, another skin): its orders played again
  let log = null;
  try { const k = JSON.parse(localStorage.getItem(turnKey(ONL.id)) || 'null'); if (k && k.turn === turn && Array.isArray(k.log)) log = k.log; } catch (e) {}
  if (log) OL().replay(G, pid, log);
  OL().record(G, pid, log);
  ME = pid;
  // the names file: this player's name, on their own computer, once a game (hot seat keeps every human's)
  if (HO.rules(G).namesFile && !G.online.named) { G.online.named = true; keepName(me().female ? 'women' : 'men', me().name); }
  useOS(G.opts && G.opts.os);
  useSounds(soundsWanted(), () => {
    hideTitle(); closeScreen(); if (UI.modal && !UI.bug) closeModal();
    if ($('#handover')) $('#handover').hidden = true;
    const p = me();
    UI.sel = G.stars[p.homeStar].owner === ME ? p.homeStar : ((HO.colonies(G, ME)[0] || G.stars[p.homeStar]).id);
    if (opening) { UI.selFleet = null; UI.fitted = false; fit(); }
    if (UI.selFleet != null && !G.fleets.some(f => f.id === UI.selFleet)) UI.selFleet = null;
    if (!opening) { awardMasterPoints(); awardGameCenter(); recordHall(); }
    addTurnNotes(p);
    save(); renderPanel(); draw(); showMessages();
  });
}
// the card changed: a new turn (load it, check it), or who is in
function onCard(c) {
  if (!ONL.id) return;
  if (!c) { toast('This online game is gone, or you are no longer in it.'); leaveOnlineView(); return; }
  const prevTurn = ONL.turn;
  ONL.card = c;
  if (c.turn > prevTurn) { if (ONL.arriving !== c.turn) newTurnArrived(c, prevTurn); return; }
  renderWaiting();
  maybePlayTurn();
}
function watchTurnOrders() {
  const id = ONL.id, turn = ONL.turn;
  ONL.unsubO.push(CLOUD.games.watchOrders(id, turn, (done) => {
    if (ONL.id !== id || ONL.turn !== turn) return;
    ONL.done = done;
    if (done[cloudUser() && cloudUser().uid] && !ONL.sent) { ONL.sent = true; if (OL().recording) OL().stop(); }
    renderWaiting();
    maybePlayTurn();
  }));
}
// the seats the turn waits for (player numbers): humans still in, not
// resigned, whose orders aren't in and whose turn the host hasn't ended
function onlineWaiting() {
  if (!G || !G.online || !ONL.card || G.over || !OL()) return [];
  const c = ONL.card;
  return (c.seats || []).map((u, pid) => [u, pid]).filter(([u, pid]) => {
    const p = G.players[pid];
    return p && p.alive && !p.resigned && !(c.resigned || []).includes(u) && !(c.skip || []).includes(u) && !ONL.done[u];
  }).map(([, pid]) => pid);
}
// every order is in: this page plays the turn when it sent the last (at
// once), or, so a turn never waits on a page that closed, after a while
function maybePlayTurn() {
  clearTimeout(ONL.timer);
  if (!ONL.card || ONL.card.status !== 'playing' || ONL.card.turn !== ONL.turn || onlineWaiting().length || G.over) return;
  const mineLast = ONL.sent && ONL.justSent;
  ONL.timer = setTimeout(() => playOnlineTurn(), mineLast ? 0 : 12000 + 2000 * Math.max(0, ONL.seat));
}
function playOnlineTurn() {
  const id = ONL.id, turn = ONL.turn, c = ONL.card;
  if (ONL.busy || !id || ONL.processed[id + ':' + turn]) return;
  ONL.busy = true;
  CLOUD.games.orders(id, turn).then((orders) => {
    if (ONL.id !== id || ONL.turn !== turn) return null;
    const inputs = onlineInputs(c, orders);
    const r = OL().play(ONL.start, inputs);
    if (r.notes.length) console.warn('[HO online]', r.notes.join('; '));
    ONL.processed[id + ':' + turn] = r.digest;
    return CLOUD.games.advance(id, turn, r.json, r.digest, r.G.year, r.G.over, inputs.resigned);
  }).then((res) => { if (res === 'late') ONL.processed[id + ':' + turn] = null; }, (e) => { ONL.processed[id + ':' + turn] = null; toast(CLOUD.errorText(e)); })
    .then(() => { ONL.busy = false; });
}
// the card and the turn's orders as js/online.js plays them (seat numbers)
function onlineInputs(c, orders, resignedUids) {
  const inputs = { orders: {}, resigned: [] };
  (c.seats || []).forEach((u, pid) => {
    if (orders[u]) inputs.orders[pid] = { log: orders[u] };
    if ((resignedUids || c.resigned || []).includes(u)) inputs.resigned.push(pid);
  });
  return inputs;
}
// a new turn is in: checked (the same orders played here, from the state
// this page had), then taken up
function newTurnArrived(c, prevTurn) {
  const id = ONL.id, prevStart = ONL.start, mine = ONL.processed[id + ':' + prevTurn];
  ONL.arriving = c.turn;
  stopOrders();
  CLOUD.games.state(id, c.turn).then((st) => {
    if (!st || ONL.id !== id) { ONL.arriving = -1; return; }
    const ownHash = OL().digest(st.json);
    const check = { turn: c.turn, ok: ownHash === st.hash, by: st.by === (cloudUser() && cloudUser().uid) ? 'me' : 'other' };
    const go = () => {
      ONL.arriving = -1;
      if (ONL.id !== id) return;
      ONL.checks.push(check);
      if (!check.ok) console.warn('[HO online] the new turn’s state doesn’t match what this page made of the same orders (turn ' + c.turn + ')', check);
      const prev = G;
      try { localStorage.removeItem(turnKey(id)); } catch (e) {}
      enterTurn(st.json, c.turn, prev, false);
      watchTurnOrders();
      Sound.play(11111);
      toast(G.over ? 'The game is over.' : `It’s ${G.year}: everyone has moved, and the turn has been played.`);
    };
    // this page played it: its own digest is the check
    if (mine) { check.ok = check.ok && mine === st.hash; check.mine = true; go(); return; }
    // else the same orders played here, from the state this page had (when it still has it)
    if (prevStart && c.turn === prevTurn + 1) {
      CLOUD.games.orders(id, prevTurn).then((orders) => {
        const r = OL().play(prevStart, onlineInputs(c, orders, (st.resigned || []).map(pid => (c.seats || [])[pid])));
        check.ok = check.ok && r.digest === st.hash; check.replayed = true;
      }).catch(() => { check.replayed = false; }).then(go);
    } else go();
  }).catch((e) => { ONL.arriving = -1; toast(CLOUD.errorText(e)); });
}
// End Turn, online: the orders sent (and checked against this page's game first)
function onlineEndTurn() {
  if (ONL.sent || !ONL.id || !OL()) return;
  const log = OL().stop(), id = ONL.id, turn = ONL.turn;
  let sc = null;
  try { sc = OL().selfCheck(ONL.start, ONL.seat, log, G); } catch (e) { sc = { ok: false, at: String(e && e.message) }; }
  ONL.self.push(Object.assign({ turn }, sc));
  if (!sc.ok) console.warn('[HO online] this turn’s orders don’t give this page’s game; first difference at', sc.at);
  ONL.sent = true; ONL.justSent = true;
  try { localStorage.setItem(turnKey(id), JSON.stringify({ turn, log, sent: true })); } catch (e) {}
  renderMsg();
  CLOUD.games.submit(id, turn, ONL.seat, log).then(() => {
    Sound.play(11111);
    ONL.done[cloudUser().uid] = true;
    renderWaiting(); maybePlayTurn();
  }, (e) => {
    // not sent: the turn goes on, its orders as they were
    ONL.sent = false; ONL.justSent = false;
    OL().record(G, ONL.seat, log);
    toast(CLOUD.errorText(e)); renderMsg();
  });
}
function renderWaiting() { if (G && G.online && (ONL.sent || !onlineCanMove()) && !(UI.msgIdx < UI.inbox.length)) renderMsg(); }
// this seat has a turn to play (in the game, not resigned, the turn not ended for it)
function onlineCanMove() {
  const c = ONL.card, u = cloudUser() && cloudUser().uid, p = G && G.players[ONL.seat];
  return !!(c && p && p.alive && !p.resigned && !(c.resigned || []).includes(u) && !(c.skip || []).includes(u) && c.status === 'playing' && !G.over);
}
// the message area's card while the turn waits: who for, and the host's End turn for…
function waitingCard() {
  const names = onlineNames(), w = onlineWaiting(), host = ONL.card && cloudUser() && ONL.card.host === cloudUser().uid;
  const text = !w.length ? 'Everyone has moved: the turn is being played…' : `Waiting for: ${w.map(pid => names[pid]).join(', ')}`;
  return el('div', { class: 'card waiting', role: 'status' }, el('div', { class: 'mtext' },
    el('p', null, text),
    el('p', { class: 'sub' }, ONL.sent ? 'Your orders are in. The new year arrives here when everyone has ended their turn.' : 'You have no turn to play: the game goes on without you.'),
    host && w.length ? el('div', { class: 'mbtns' }, el('button', { class: 'quiet', onclick: () => endTurnFor(w) }, 'End turn for…')) : null));
}
// the host ends the turn for those it waits for (the time limit's end, by hand)
function endTurnFor(w) {
  const names = onlineNames(), c = ONL.card;
  const boxes = w.map(pid => el('label', { class: 'chk' }, el('input', { type: 'checkbox', value: c.seats[pid], checked: 'checked' }), el('span', null, names[pid])));
  const f = el('form', { class: 'newgame', onsubmit: (e) => {
    e.preventDefault();
    const uids = [...f.querySelectorAll('input:checked')].map(x => x.value);
    closeModal();
    if (uids.length) CLOUD.games.skip(ONL.id, uids).then(() => toast('Their turn is ended: they make no moves this year.'), er => toast(CLOUD.errorText(er)));
  } }, el('p', null, 'End the turn for these players? Their empires sit this year out, as when a turn’s time runs out.'), ...boxes,
    el('div', { class: 'btns right' }, el('button', { type: 'button', class: 'quiet', onclick: closeModal }, 'Cancel'), el('button', { type: 'submit' }, 'End their turn')));
  modal('End turn for…', f, { cls: 'small' });
}
// the Game menu's Online game…: who is in it, its code, Resign and Leave
function openOnlineInfo() {
  if (!G || !G.online || !ONL.card) return;
  const c = ONL.card, names = onlineNames(), u = cloudUser() && cloudUser().uid, w = onlineWaiting();
  const rows = (c.seats || []).map((x, pid) => {
    const p = G.players[pid];
    const st = !p ? '' : !p.alive ? 'out' : p.resigned || (c.resigned || []).includes(x) ? 'resigned (a computer plays)' : ONL.done[x] ? 'has moved' : (c.skip || []).includes(x) ? 'turn ended by the host' : 'to move';
    return el('li', null, `${names[pid]}${x === c.host ? ' (host)' : ''}${x === u ? ' (you)' : ''}: ${st}`);
  });
  const body = el('div', { class: 'lobby' },
    el('p', null, `${c.galaxy || 'Galaxy'} · ${c.edition || c.rules} · ${G.year}`),
    el('ul', { class: 'lobbylist' }, ...rows),
    el('p', { class: 'sub' }, 'The whole game is kept where every player’s page can read it (each page shows only its own player’s view), so this alpha can’t stop a determined player from peeking.'),
    el('div', { class: 'btns right' },
      c.host === u && w.length ? el('button', { type: 'button', class: 'quiet', onclick: () => endTurnFor(w) }, 'End turn for…') : null,
      c.status === 'playing' && onlineCanMove() ? el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox('Resign? A computer plays your empire from the next turn. You can still watch.', () => CLOUD.games.resign(ONL.id).then(() => toast('You have resigned.'), e => toast(CLOUD.errorText(e)))) }, 'Resign…') : null,
      el('button', { type: 'button', class: 'quiet', onclick: () => confirmBox(c.status === 'playing' ? 'Leave this game? A computer plays your empire from the next turn, and the game leaves your list.' : 'Take this game off your list?', () => {
        CLOUD.games.leave(ONL.id, c.status === 'playing').then(() => { try { localStorage.removeItem(turnKey(ONL.id)); } catch (e) {} leaveOnlineView(); G = null; $('#panel').innerHTML = ''; $('#msg').innerHTML = ''; titleScreen(); toast('You left the game.'); }, e => toast(CLOUD.errorText(e)));
      }) }, 'Leave…'),
      el('button', { type: 'button', onclick: closeModal }, 'OK')));
  modal('Online game', body, { cls: 'small' });
}
// ?join=CODE: the join window, once the title is up (the address is tidied so a reload doesn't ask again)
function joinFromAddress() {
  let code = null;
  try { code = new URLSearchParams(location.search).get('join'); } catch (e) {}
  if (!code || !CLOUD) return;
  try { const u = new URL(location.href); u.searchParams.delete('join'); history.replaceState(null, '', u.toString()); } catch (e) {}
  setTimeout(() => openJoin(code), 300);
}

// ----- new game / title -----
function titleScreen() {
  const t = $('#titlescreen');
  t.hidden = false;
  syncLang();
  const has = !!localStorage.getItem('ho5.save');
  const frame = $('#tframe'), fx = frame.getContext('2d');
  // the splash sits in a window named for the release this skin is, and a
  // list of the other skins reloads the page into one of them
  const skins = (window.HOSKINS && HOSKINS.list) || [], here = skins.find(k => k.id === HOSKINS.current);
  if (here) $('#tname').textContent = `Spaceward Ho! ${here.name}`;
  titlePickers();
  titleScreens();
  titleAccount();
  applySounds(); // no game: the skin's own sounds
  let i = 0;
  clearInterval(UI.anim);
  if (T.title && T.title(frame, IMG, Sound)) { $('#tcont').hidden = !has; return; }
  const paint = (k) => { fx.fillStyle = '#fff'; fx.fillRect(0, 0, 304, 200); fx.drawImage(IMG.p6999, 0, 0); if (k != null) fx.drawImage(IMG['t' + (7000 + k)], 96, 1); };
  paint(null);
  setTimeout(() => {
    UI.anim = setInterval(() => { paint(i % 18); if (i % 18 === 9) Sound.play(7023); i++; if (i > 54) { clearInterval(UI.anim); paint(0); Sound.play(7022); } }, 110);
  }, 900);
  $('#tcont').hidden = !has;
  Sound.startTheme();
}
function hideTitle() { $('#titlescreen').hidden = true; clearInterval(UI.anim); Sound.stopTheme(); }
function newGameDialog() {
  const f = el('form', { class: 'newgame', onsubmit: (e) => { e.preventDefault(); start(); } });
  const sel = (name, label, opts, def) => el('label', null, el('span', null, label), el('select', { name }, ...opts.map(([v, t]) => el('option', { value: v, selected: v === def ? 'selected' : false }, t))));
  const slider = (name, label, min, max, def, left, right) => el('label', null, el('span', null, label),
    el('span', { class: 'slider' }, left ? el('small', null, left) : null, el('input', { type: 'range', name, min, max, value: def }), el('output', { for: name }, right ? el('small', null, right) : String(def))));
  const STARTS = [['outpost', 'Outpost'], ['barren', 'Barren'], ['backward', 'Backward'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['thriving', 'Thriving'], ['abundant', 'Abundant']];
  // Claude rules: named settings
  const claudeBox = el('div', { class: 'group' },
    sel('iq', 'Computer IQ', [['dumb', 'Dumb'], ['average', 'Average'], ['smart', 'Smart'], ['diabolical', 'Diabolical']], 'average'),
    sel('cstart', 'Computer home systems', STARTS, 'normal'),
    sel('shape', 'Galaxy shape', [['random', 'Random'], ['ring', 'Ring'], ['cluster', 'Cluster'], ['spiral', 'Spiral'], ['grid', 'Grid'], ['hex', 'Hex']], 'random'),
    sel('size', 'Galaxy size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['huge', 'Humongous']], 'medium'),
    sel('density', 'Galaxy density', [['dense', 'Dense'], ['normal', 'Normal'], ['sparse', 'Sparse']], 'normal'),
    sel('c_years', 'Years per turn', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50']], '10'));
  // Original rules: the original New Game window's controls
  const rating = el('b', null, '');
  const origBox = el('div', { class: 'group' },
    slider('o_iq', 'Computer IQ', 50, 200, localStorage.getItem('ho5.iq') || 100),
    sel('o_cstart', 'Computer home systems', [...STARTS, ['iq', 'Based on IQ']], 'iq'),
    sel('o_shape', 'Galaxy shape', [['circle', 'Circle'], ['spiral', 'Spiral'], ['cluster', 'Cluster'], ['ring', 'Ring'], ['grid', 'Grid'], ['random', 'Random'], ['hex', 'Hex']], 'circle'),
    slider('o_size', 'Galaxy size', 0, 100, 50, 'Small', 'Large'),
    slider('o_density', 'Galaxy density', 0, 100, 25, 'Dense', 'Sparse'),
    sel('o_years', 'Years per turn', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50']], '10'));
  // best buddies (the Claude and Original rules), with the game difficulty rating beside it
  const buddyO = el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'buddies' }), el('span', null, 'Computers are best buddies'));
  const buddyC = el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'c_buddies' }), el('span', null, 'Computers are best buddies'));
  const buddyRow = el('div', { class: 'buddyrow' }, el('div', { class: 'buddies' }, buddyO, buddyC),
    el('div', { class: 'rating' }, el('span', null, 'Game difficulty rating'), rating));
  // DOS 2.0 rules: the 2.0 Create Galaxy settings
  // 4.0.5 rules (Windows 95): its New Game settings
  const w95Box = el('div', { class: 'group' },
    sel('w_skill', 'Your skill', [['novice', 'Novice'], ['beginner', 'Beginner'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['expert', 'Expert']], 'normal'),
    sel('w_iq', 'Computer intelligence', [['dumb', 'Dumb'], ['average', 'Average'], ['smart', 'Smart'], ['diabolical', 'Diabolical']], 'average'),
    sel('w_shape', 'Galaxy style', [['circle', 'Circle'], ['random', 'Random'], ['ring', 'Ring'], ['spiral', 'Spiral'], ['grid', 'Grid'], ['cluster', 'Cluster']], 'circle'),
    sel('w_size', 'Galaxy size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['xl', 'Extra Large'], ['huge', 'Humongous']], 'medium'),
    sel('w_density', 'Galaxy density', [['dense', 'Dense'], ['sparse', 'Sparse']], 'dense'),
    sel('w_years', 'Years per turn', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50']], '10'));
  // the turn time limit (rs.timeLimit: 4.0.5's menu, 5.0.5's network popup,
  // offered for several people taking turns) and Mac 4.0.5's "Automatically
  // end turn for unconnected players" (rs.autoEndBox), which no game here needs
  const tlSel = el('select', { name: 'timelimit', 'aria-label': 'Turn time limit' });
  const tlRow = el('label', { class: 'tlrow', hidden: true }, el('span', null, 'Turn Time Limit'), tlSel);
  const autoEndBox = el('label', { class: 'chk', hidden: true, title: 'Shown as the Mac had it. It ends the turn of a player whose computer isn’t connected to the game; with no network play here, nobody is ever unconnected, so it changes nothing.' },
    el('input', { type: 'checkbox', name: 'autoend' }), el('span', null, ''));
  // Mac 3.0.1 rules: its Create New Galaxy window (DITL 6080) and Join skill (DITL 4010)
  const mac3Box = el('div', { class: 'group' },
    sel('m_skill', 'Your skill', [['novice', 'Novice'], ['beginner', 'Beginner'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['expert', 'Expert']], 'normal'),
    sel('m_iq', 'Computer intelligence', [['dumb', 'Dumb'], ['average', 'Average'], ['smart', 'Smart'], ['diabolical', 'Diabolical']], 'average'),
    sel('m_shape', 'Galaxy style', [['circle', 'Circle'], ['random', 'Random'], ['ring', 'Ring'], ['spiral', 'Spiral'], ['grid', 'Grid'], ['cluster', 'Cluster']], 'cluster'),
    sel('m_size', 'Galaxy size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['xl', 'Extra Large'], ['huge', 'Humongous']], 'medium'),
    sel('m_density', 'Galaxy density', [['dense', 'Dense'], ['sparse', 'Sparse']], 'dense'),
    sel('m_years', 'Years per turn', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50'], ['100', '100']], '10'));
  // Mac 1.2 rules: 1.2 had no New Game window; every game was the same
  const mac12Box = el('div', { class: 'group' }, el('p', { class: 'sub note12' },
    '1.2 had no New Game choices: every game is a small, dense circle galaxy with one average computer player, and everyone starts at normal skill.'));
  const dosBox = el('div', { class: 'group' },
    sel('d_skill', 'Your skill', [['novice', 'Novice'], ['beginner', 'Beginner'], ['normal', 'Normal'], ['advanced', 'Advanced'], ['expert', 'Expert']], 'normal'),
    sel('d_iq', 'Computer skill', [['dumb', 'Dumb'], ['average', 'Average'], ['smart', 'Smart']], 'average'),
    sel('d_size', 'Galaxy size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large'], ['xl', 'Extra Large'], ['huge', 'Humongous']], 'medium'),
    sel('d_shape', 'Map style', [['circle', 'Circle'], ['random', 'Random'], ['ring', 'Ring'], ['spiral', 'Spiral'], ['grid', 'Grid']], 'ring'),
    sel('d_density', 'Density', [['dense', 'Dense'], ['sparse', 'Sparse']], 'dense')); // 2.0 has no novas
  const startSel = sel('start', 'Your home system', STARTS, 'normal');
  const sounds = soundPicker(localStorage.getItem('ho5.sounds') || null);
  // the unofficial patch: the check box names the chosen rules' patch, and
  // its fixes are listed below it, folded away (refresh fills both)
  const patchText = el('span'), patchSum = el('summary'), patchFixes = el('div');
  const patchBox = el('div', { class: 'patch' },
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'patch', checked: localStorage.getItem('ho5.patch') === '1' ? 'checked' : false }), patchText),
    el('details', null, patchSum, patchFixes));
  // Full Hoedown: only for rules with Hoedown items (never the AI homages')
  const hoBox = el('label', { class: 'chk modern hoedown' }, el('input', { type: 'checkbox', name: 'hoedown', checked: localStorage.getItem('ho5.hoedown') === '1' ? 'checked' : false }),
    el('span', null, HOEDOWN_TEXT));
  // hot seat: names and hats for players 2..6
  const seats = el('div', { class: 'group seats' });
  for (let i = 2; i <= 6; i++) seats.append(el('label', { 'data-seat': i }, el('span', null, `Player ${i}`),
    el('span', { class: 'seat' }, el('input', { name: 'h' + i, value: localStorage.getItem('ho5.name' + i) || 'Player ' + i, maxlength: 20, 'aria-label': `Player ${i} name` }),
      el('select', { name: 'hf' + i, 'aria-label': `Player ${i} hat` }, el('option', { value: '0' }, 'Cowboy'), el('option', { value: '1' }, 'Cowgirl')))));
  // Version and Edition pick the rules; Skin and OS look how they show
  const famSel = el('select', { name: 'version', 'aria-label': 'Ruleset version' });
  const edSel = el('select', { name: 'rules', 'aria-label': 'Edition' });
  const famNow = famKey(familyOf(chosenRules()));
  famSel.append(...familyList().flatMap(fm => [...(fm === 'remake' ? [sepOption()] : []), el('option', { value: fm, selected: fm === famNow ? 'selected' : false }, FAMILY_NAMES[fm] || fm)]));
  // every edition is in the Edition menu, only the version's showing (so
  // that picking one by its id also picks its version)
  const fillEditions = (fam, value) => {
    const fams = familyList();
    edSel.replaceChildren(...fams.flatMap(fm => editionList(fm).map(id => el('option', { value: id, 'data-family': fm, hidden: fm === fam ? false : 'hidden' }, editionLabel(id)))));
    const mine = editionList(fam);
    edSel.value = mine.includes(value) ? value : mine[0];
  };
  fillEditions(famNow, chosenRules());
  const pick = skinOSPickers(edSel.value);
  // the shared names for the edition chosen, fetched now (at most once a day)
  // so they are there by Create galaxy; New Game itself never waits for them
  fetchSharedNames(edSel.value);
  famSel.addEventListener('change', () => { fillEditions(famSel.value, null); pick.forEdition(edSel.value); fetchSharedNames(edSel.value); });
  edSel.addEventListener('change', () => {
    const fm = edSel.selectedOptions[0] && edSel.selectedOptions[0].dataset.family;
    if (fm && fm !== famSel.value) { famSel.value = fm; fillEditions(fm, edSel.value); }
    pick.forEdition(edSel.value);
    fetchSharedNames(edSel.value);
  });
  // the game's language, for a version offered in more than one
  // (rs.languages, English first; G.opts.lang): only names and words change.
  // It starts from the player's choice (the title screen's Language); a
  // version that hasn't got it starts in English, and langNote says so in
  // the language chosen
  const langSel = el('select', { name: 'lang', 'aria-label': 'Language' });
  const langRow = el('label', { class: 'langpick' }, el('span', null, 'Language'), langSel);
  const langNote = el('p', { class: 'sub langnote', translate: 'no', hidden: 'hidden' });
  // two rows: what the game is (version, edition, language), then how it
  // looks (skin, OS look)
  const pickRow = el('div', { class: 'picks' },
    el('label', null, el('span', null, 'Ruleset version'), famSel),
    el('label', null, el('span', null, 'Edition'), edSel),
    langRow);
  const lookRow = el('div', { class: 'picks' },
    el('label', null, el('span', null, 'Skin'), pick.skinSel),
    el('label', null, el('span', null, 'OS look'), pick.osSel),
    lookOptions('newgame'));
  if (!window.HOSKINS || HOSKINS.list.length < 2) pick.skinSel.closest('label').hidden = true;
  if (!window.HOSKINS || !HOSKINS.osChoices) pick.osSel.closest('label').hidden = true;
  f.append(
    // above the line: the original game's own New Game window
    el('label', null, el('span', null, 'Your name'), el('input', { name: 'name', value: localStorage.getItem('ho5.name') || 'Jake', maxlength: 20 })),
    el('label', null, el('span', null, 'Galaxy name'), el('input', { name: 'galaxy', value: 'Milky Way', maxlength: 24 })),
    sel('female', 'Your hat', [['0', 'Cowboy'], ['1', 'Cowgirl']], '0'),
    sel('humans', 'People playing on this computer', [1, 2, 3, 4, 5, 6].map(n => [String(n), n === 1 ? 'Just me' : `${n} (take turns)`]), '1'),
    sel('computers', 'Computer players', [...[...Array(20).keys()].map(n => [String(n), String(n)]), ['any', 'Any (1-8)']], '4'),
    seats,
    startSel,
    claudeBox, origBox, dosBox, w95Box, mac3Box, mac12Box,
    tlRow,
    buddyRow,
    el('fieldset', { class: 'opts' }, el('legend', null, 'Options'),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'alliances', checked: 'checked' }), el('span', null, 'Alliances')),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'luck' }), el('span', null, 'Luck in battles')),
      el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'novas', checked: 'checked' }), el('span', null, 'Novas')),
      autoEndBox),
    // the line: below it, the remake's own choices
    el('hr', { class: 'ngline' }),
    pickRow,
    langNote,
    lookRow,
    patchBox,
    el('label', { class: 'chk modern' }, el('input', { type: 'checkbox', name: 'modern', checked: localStorage.getItem('ho5.modern') === '1' ? 'checked' : false }),
      el('span', null, MODERN_TEXT)),
    hoBox,
    sounds,
    el('div', { class: 'btns right' },
      // online play (js/cloud.js): several people, each on their own computer
      CLOUD ? el('button', { type: 'button', class: 'quiet', onclick: () => openOnlineGames() }, 'My online games…') : null,
      CLOUD ? el('button', { type: 'button', class: 'quiet', onclick: () => hostOnline(options) }, 'Play online…') : null,
      el('button', { type: 'submit' }, 'Create galaxy')));
  // which of the window's settings an edition has: its own, or (an edition
  // the window doesn't know by name) its version's other edition's
  const KIND = { claude: 'claude', original: 'original', palm: 'original', dos: 'dos', '405': '405', '301': '301', '12': '12' };
  const FAM_KIND = { '1.2': '12', '2.0': 'dos', '3.0': '301', '4.0': '405', '5': 'original', remake: 'claude' };
  const kindOf = (id) => KIND[id] || FAM_KIND[famKey(familyOf(id))] || null;
  // the rating: the edition's own difficulty, else its version's
  const rater = (id, k) => (HO.RULESETS[id] && HO.RULESETS[id].difficulty) ? HO.RULESETS[id] : HO.RULESETS[k];
  const origOpts = (d) => ({ computers: d.computers === 'any' ? 4 : +d.computers, iqNum: +d.o_iq, start: d.start, cstart: d.o_cstart, shape: d.o_shape, size: +d.o_size, density: +d.o_density, buddies: !!d.buddies, yearsPerTurn: +d.o_years });
  const refresh = () => {
    const d = Object.fromEntries(new FormData(f).entries());
    const k = kindOf(d.rules);
    // a ruleset's own New Game window (each read where it is used):
    // rs.optionBoxes false: no Alliances, Luck or Novas boxes, all on (iOS);
    // rs.anyComputers false: no "Any (1-8)" (Palm OS, iOS); rs.iqStep: the IQ
    // slider's step (iOS: 10); rs.maxHumans: how many people may play (iOS: 1)
    const ngr = HO.RULESETS[d.rules] || {};
    const palm = d.rules === 'palm', orig = k === 'original', dos = k === 'dos', w95 = k === '405', mac3 = k === '301', mac12 = k === '12';
    // the Claude rules' own settings show only for them (not for any ruleset the window doesn't know)
    claudeBox.hidden = k !== 'claude'; origBox.hidden = !orig; dosBox.hidden = !dos; w95Box.hidden = !w95; mac3Box.hidden = !mac3; mac12Box.hidden = !mac12; startSel.hidden = dos || w95 || mac3 || mac12;
    // your home system just after the computers' IQ, as the original window has it
    const box = k === 'claude' ? claudeBox : orig ? origBox : null;
    if (box && startSel.parentNode !== box) box.insertBefore(startSel, box.children[1]);
    buddyO.hidden = !orig; buddyC.hidden = k !== 'claude';
    // 1.2 fixes the computers (one) and has no women
    f.querySelector('select[name=computers]').closest('label').hidden = mac12;
    f.querySelector('select[name=female]').closest('label').hidden = mac12;
    // up to 19 computers with 4.0.5 and 3.0.1 rules, 8 otherwise
    const csel = f.querySelector('select[name=computers]');
    for (const o of csel.options) if (/^\d+$/.test(o.value) && +o.value > 8) o.hidden = !w95 && !mac3;
    if (!w95 && !mac3 && +csel.value > 8) csel.value = '8';
    // Palm OS 5 has no "Any" choice for the computers, and alliances, luck and novas are always on
    const noAny = palm || ngr.anyComputers === false, noBoxes = palm || ngr.optionBoxes === false;
    csel.querySelector('option[value=any]').hidden = noAny;
    if (noAny && csel.value === 'any') csel.value = '4';
    // the IQ in steps (iOS: 50, 60, … 200)
    const iq = f.querySelector('input[name=o_iq]'), step = String(ngr.iqStep || 1);
    if (iq.step !== step) { iq.step = step; iq.value = String(Math.round(+iq.value / +step) * +step); iq.nextElementSibling.textContent = iq.value; }
    // how many people may play on this computer (iOS: one)
    const hsel = f.querySelector('select[name=humans]'), maxH = ngr.maxHumans || 6;
    for (const o of hsel.options) o.hidden = +o.value > maxH;
    if (+hsel.value > maxH) hsel.value = String(maxH);
    hsel.closest('label').hidden = maxH < 2;
    const nh = Math.min(+d.humans || 1, maxH);
    for (const l of seats.querySelectorAll('[data-seat]')) l.hidden = +l.dataset.seat > nh;
    f.querySelector('select[name=computers] option[value="0"]').disabled = nh < 2;
    if (nh < 2 && d.computers === '0') f.querySelector('select[name=computers]').value = '1';
    const claudeR = k === 'claude';
    // the version's time limit menu (its own choices, kept while it stays the same)
    const TLr = ngr.timeLimit && ngr.timeLimit.ids.includes(d.rules) && (!ngr.timeLimit.hotSeat || nh > 1) ? ngr.timeLimit : null;
    tlRow.hidden = !TLr;
    if (TLr && tlSel.dataset.rules !== d.rules) { tlSel.dataset.rules = d.rules; tlSel.replaceChildren(...TLr.choices.map(([v, t]) => el('option', { value: String(v) }, t))); }
    if (!TLr) tlSel.value = '0';
    autoEndBox.hidden = !ngr.autoEndBox; if (ngr.autoEndBox) autoEndBox.lastChild.textContent = ngr.autoEndBox;
    f.querySelector('fieldset.opts').hidden = (!orig && !w95 && !mac3 && !claudeR) || noBoxes;
    f.querySelector('input[name=novas]').closest('label').hidden = w95 || mac3; // 4.0.5 and 3.0.1 always have novas
    f.querySelector('input[name=luck]').closest('label').hidden = mac3; // 3.0.1 always has battle luck
    for (const o of f.querySelectorAll('.slider output')) { const inp = o.previousElementSibling; if (!o.querySelector('small')) o.textContent = inp.value; }
    rating.textContent = orig ? String(rater(d.rules, 'original').difficulty(origOpts(d)))
      : w95 ? String(rater(d.rules, '405').difficulty({ computers: d.computers === 'any' ? 4 : +d.computers, iq: d.w_iq, start: d.w_skill, shape: d.w_shape, size: d.w_size, density: d.w_density, timeLimit: +d.timelimit || 0 }))
      : mac3 ? String(rater(d.rules, '301').difficulty({ computers: d.computers === 'any' ? 4 : +d.computers, iq: d.m_iq, start: d.m_skill, shape: d.m_shape, size: d.m_size, density: d.m_density }))
      : `Not rated with ${dos ? '2.0' : mac12 ? '1.2' : 'Claude'} rules`;
    rating.className = orig || w95 || mac3 ? '' : 'none';
    // the language: only for rules with more than one (rs.languages)
    const langs = HO.languages(ngr);
    langRow.hidden = !langs.length;
    const want = titleLang(), offered = want === 'en' || langs.includes(want);
    if (langs.length && langSel.dataset.rules !== d.rules) {
      langSel.dataset.rules = d.rules;
      const own = HO.ownLanguage(ngr);
      langSel.replaceChildren(...langs.map((c) => el('option', { value: c }, HO.languageName(ngr, c) + (c === own ? ' (original)' : ''))));
      // the player's language, else English (every version's default)
      langSel.value = offered ? want : 'en';
    }
    // the player's language isn't this version's: the game is in English, as
    // the note says (in the player's language)
    langNote.hidden = offered || (langs.length > 0 && langSel.value !== 'en');
    if (!offered) { langNote.lang = want; langNote.textContent = UIL.tr(`${HO.LANGUAGES[want]} isn’t one of this version’s languages: the game will be in English.`, want); }
    // the window in the language it has chosen (a version with one: English,
    // unless it offers the player's), its default names with it (js/ui-lang.js)
    ngLang(langRow.hidden ? (offered ? want : 'en') : langSel.value);
    hoBox.hidden = !(HO.RULESETS[d.rules] || {}).hoedown;
    // the patch: only for rules that have fixes
    const prs = HO.RULESETS[d.rules], nfx = HO.fixes(prs).length;
    patchBox.hidden = !nfx;
    if (nfx && patchBox.dataset.rules !== d.rules) {
      patchBox.dataset.rules = d.rules;
      patchText.textContent = PATCH_TEXT(prs);
      patchSum.textContent = `What the ${HO.patchVersion(prs)} patch fixes (${nfx})`;
      patchFixes.replaceChildren(...[inEnglish(null, fixLines(prs)), fixList(prs)].filter(Boolean));
    }
  };
  f.addEventListener('input', refresh); f.addEventListener('change', refresh);
  // a default name (the galaxy's, the players') follows the window's language
  // until the player types another
  const defNames = [[f.querySelector('input[name=galaxy]'), 'Milky Way'], ...[2, 3, 4, 5, 6].map(i => [f.querySelector(`input[name=h${i}]`), `Player ${i}`])];
  const ngLang = (l) => {
    const was = UIL.lang;
    if (!UIL.set(l)) return;
    for (const [inp, def] of defNames) if (inp && (inp.value === def || inp.value === UIL.tr(def, was))) inp.value = UIL.tr(def);
    // the editions' names are made in the language (editionLabel): again in the new one
    for (const o of edSel.options) o.textContent = editionLabel(o.value);
  };
  // the window's settings as the options HO.newGame takes (and the form's
  // values, d): Create galaxy plays them here, Play online… takes them to the lobby
  const options = () => {
    const d = Object.fromEntries(new FormData(f).entries());
    localStorage.setItem('ho5.name', d.name); localStorage.setItem('ho5.rules', d.rules);
    if (d.computers === 'any') d.computers = String(1 + Math.floor(Math.random() * 8));
    const ngr = HO.RULESETS[d.rules] || {};
    const nh = Math.min(+d.humans || 1, ngr.maxHumans || 6);
    if (ngr.optionBoxes === false) { d.alliances = d.luck = d.novas = 'on'; } // no boxes: all on
    const humans = nh > 1 ? [{ name: d.name || 'Player 1', female: d.female === '1' }] : null;
    for (let i = 2; i <= nh; i++) { humans.push({ name: d['h' + i] || 'Player ' + i, female: d['hf' + i] === '1' }); localStorage.setItem('ho5.name' + i, d['h' + i] || ''); }
    if (nh < 2 && d.computers === '0') d.computers = '1';
    localStorage.setItem('ho5.modern', d.modern ? '1' : '0');
    const patch = !patchBox.hidden && !!d.patch;
    const hoedown = !hoBox.hidden && !!d.hoedown;
    if (!hoBox.hidden) localStorage.setItem('ho5.hoedown', hoedown ? '1' : '0');
    if (!patchBox.hidden) localStorage.setItem('ho5.patch', patch ? '1' : '0');
    const snd = sounds.value(); localStorage.setItem('ho5.sounds', snd || '');
    const lang = !langRow.hidden && d.lang ? d.lang : null;
    // hints: the creator's "Give helpful game play hints" preference, which 5.0.5 and the Palm game read for the first messages (rs.welcome)
    const common = { modern: !!d.modern, ...(patch ? { patch: true } : {}), ...(hoedown ? { hoedown: true } : {}), ...(snd ? { sounds: snd } : {}), ...(lang ? { lang } : {}), hints: !!Prefs.hints, humans, seed: (Math.random() * 2 ** 31) | 0, name: d.name || 'You', galaxy: d.galaxy || 'Milky Way', female: d.female === '1', computers: +d.computers, start: d.start, rules: d.rules, alliances: !!d.alliances, luck: !!d.luck, novas: !!d.novas, ...keptStarsOpt(d.rules), ...keptNamesOpt(d.rules),
      ...(+d.timelimit > 0 && !tlRow.hidden ? { timeLimit: +d.timelimit } : {}), ...(d.autoend && !autoEndBox.hidden ? { autoEnd: true } : {}) };
    const k = kindOf(d.rules);
    if (k === 'original') {
      localStorage.setItem('ho5.iq', d.o_iq);
      const o = origOpts(d);
      return { d, o: Object.assign(common, o, { difficulty: rater(d.rules, 'original').difficulty(o) }) };
    } else if (k === '405') {
      return { d, o: Object.assign(common, { start: d.w_skill, iq: d.w_iq, shape: d.w_shape, size: d.w_size, density: d.w_density, yearsPerTurn: +d.w_years, novas: true }) };
    } else if (k === '301') {
      return { d, o: Object.assign(common, { start: d.m_skill, iq: d.m_iq, shape: d.m_shape, size: d.m_size, density: d.m_density, yearsPerTurn: +d.m_years, novas: true, luck: true }) };
    } else if (k === 'dos') {
      return { d, o: Object.assign(common, { start: d.d_skill, iq: d.d_iq, size: d.d_size, shape: d.d_shape, density: d.d_density, novas: false, alliances: false, luck: false }) };
    } else if (k === 'claude' || k === '12') {
      // (1.2 had no New Game window: its ruleset fixes every choice, rs.fixOptions)
      return { d, o: Object.assign(common, { iq: d.iq, cstart: d.cstart, shape: d.shape, size: d.size, density: d.density,
        ...(k === 'claude' ? { yearsPerTurn: +d.c_years || 10, buddies: !!d.c_buddies } : {}) }) };
    } else throw new Error(`The New Game window has no settings for the "${d.rules}" rules`);
  };
  const start = () => {
    const { d, o } = options();
    G = HO.newGame(o);
    // the names file: in 2000, after the computers are named, the humans' names join it
    if (HO.rules(G).namesFile) for (const p of HO.humans(G)) keepName(p.female ? 'women' : 'men', p.name);
    // the OS look is kept with the game (G.opts.os) and for the next one
    if (d.os) G.opts.os = d.os;
    if (d.skin && window.HOSKINS && d.skin !== HOSKINS.current) { save(); HOSKINS.switchTo(d.skin, d.os); return; } // opens in the other skin
    useOS(d.os);
    closeModal(); hideTitle(); ME = 0;
    UI.sel = G.players[ME].homeStar; UI.selFleet = null; UI.fitted = false; fit();
    save(); if (!hotSeat()) renderPanel(); draw();
    // the game's sounds first, so its first message plays its own sound
    useSounds(soundsWanted(), () => {
      Sound.play(128);
      if (hotSeat()) { draw(); handOver(me()); return; }
      // T.beforeFirstTurn(go): a skin's own first window (the Amiga's Spieleintrag); true: it calls go when done
      if (T.beforeFirstTurn && T.beforeFirstTurn(() => showMessages())) return;
      showMessages();
    });
  };
  modal('Create galaxy', f, { cls: 'mid ngwin', onClose: () => syncLang() });
  refresh();
  // T.newGame(form, ctx): a skin dresses the window its own way (the Amiga's
  // Neue Galaxis erstellen and Spieler Registration), the form staying the same
  if (T.newGame) T.newGame(f, { refresh });
}
// resumed: the game was just started (or saved) in another skin, so keep its messages
function continueGame(resumed) {
  // a save that can't be read (or names rules this remake doesn't have) is
  // shown to the player, with the save to attach to a report
  const raw = localStorage.getItem('ho5.save');
  try { G = HO.load(raw); } catch (e) {
    G = null;
    showBug(e, 'Continue', { save: raw, keep: 'OK', text: e.hoSave ? e.message : 'The saved game could not be read.' });
    if (resumed === true) titleScreen();
    return;
  }
  // an online game: this browser's copy is a cache; the game is opened from Firestore
  if (G.online && G.online.id && CLOUD) { const g = G; G = null; if (resumed === true) titleScreen(); openOnlineGame(g.online.id, g); return; }
  ME = G.cur || 0;
  useOS(G.opts && G.opts.os); // the game's own OS look
  // the game's sounds first, so its first message plays its own sound
  useSounds(soundsWanted(), () => {
    if (hotSeat()) { hideTitle(); fit(); draw(); handOver(me()); return; }
    hideTitle(); UI.sel = G.players[ME].homeStar; UI.fitted = false; fit(); renderPanel(); draw();
    if (resumed !== true || !me().inbox.length) me().inbox = [{ text: `Welcome back. It’s the year ${G.year}.`, icon: 'm9024' }];
    showMessages();
  });
}
// urgent (End Turn): the account's copy goes now, not within the minute
function save(urgent) {
  if (!G) return;
  // T.onSave(): a skin shows its saving panel when the turn's copy goes (the Amiga's "Neuer Spielstand wird gespeichert")
  if (urgent === true && T.onSave) try { T.onSave(); } catch (e) { /* (a skin's panel never stops a save) */ }
  // every game has an id (its creation time), which names its slot in Saved
  // Games and its copy in the account
  if (!G.gameId) G.gameId = Date.now();
  const json = HO.save(G);
  try { localStorage.setItem('ho5.save', json); localStorage.setItem('ho5.save.when', String(Date.now())); } catch (e) {}
  // online: the turn's orders so far, so a reload (or another skin) goes on from them
  if (G.online && OL() && OL().recording && ONL.id === G.online.id) try { localStorage.setItem(turnKey(ONL.id), JSON.stringify({ turn: ONL.turn, log: OL().orders() })); } catch (e) {}
  saveSlot();
  cloudNoteSave(json, urgent === true);
}

// ---------- menus ----------
function setupMenus() {
  const menus = {
    Game: [['New game…', newGameDialog], [() => (G && HO.rules(G).switchPlayers) || 'End turn and switch players', () => switchPlayers(), () => !!(G && HO.rules(G).switchPlayers && hotSeat())], ['Players and history', () => G && openPlayers()], ['Auto-play this turn', () => playOneTurn()], ['Auto play…', () => G && !G.over && (hotSeat() || G.online ? toast('Auto play is for one-player games.') : openAutoPlay())], ['Online game…', () => openOnlineInfo(), () => !!(G && G.online)], ['Preferences…', openPrefs], ['Saved games…', () => openSavedGames(), () => !!(screensOf(rulesId()) || {}).savedGames], ['Account saves…', () => openAccountSaves(), () => !!CLOUD], ['Export this game…', () => exportGame(), () => !!G], ['Import a game…', () => importGame()], ['Rank history…', openRanks, () => !G || hasRanks(G)], [() => ((HO.RULESETS[rulesId()] || {}).gameCenter || {}).menu || 'Rank and Game Center…', openGameCenter, () => !!(HO.RULESETS[rulesId()] || {}).gameCenter],
      ['Master Point List…', () => openMasterList(), () => hasHall(G) && HO.rules(G).hall.master !== false], ['Hall of Fame…', () => openHall('fame'), () => hasHall(G)], ['Hall of Shame…', () => openHall('shame'), () => hasHall(G)], ['-'], ['Quit to title', () => { save(); Sound.play(7002); G = null; renderPanel(); draw(); $('#panel').innerHTML = ''; $('#msg').innerHTML = ''; titleScreen(); }]],
    Ships: [['Build ships at selected colony…', () => { if (G && UI.sel != null && G.stars[UI.sel].owner === ME) openBuild(UI.sel); else toast('Select one of your colonies first.'); }], ['Review battle…', () => G && openBattleList()], ['List all fleets…', () => G && openFleetList()],
      [() => scrapWords('fleet')[G && curFleet() && curFleet().scrap301 ? 1 : 0], () => { if (!G || G.over) return; const f = curFleet(); if (f) toggleScrapFleet(f); else toast('Select one of your fleets first.'); }, () => marksScrap()],
      [() => (G && organizeName()), () => { if (G && UI.sel != null) openOrganize(UI.sel); }, () => !!organizeStyle()],
      ['Scrap ship types…', () => G && openScrapTypes()], ['Next fleet', nextFleet]],
    Galaxy: [['Players and alliances…', () => G && openPlayers()], ['List explored stars…', () => G && openStarList()],
      ['Give money or metal…', () => G && !G.over && openGive(), 'gifts'],
      ['Send a message…', () => G && !G.over && openChat(), () => commandShown('chat')],
      ['Dip into savings…', () => G && !G.over && openDip(), 'dip'],
      ['Fix spending', () => G && !G.over && openFixSpending(), () => !!(G && HO.rules(G).fixSpending)],
      ['Report window…', () => openReports(), () => !!(verOpts() || {}).reports || (!!(G && (HO.rules(G).prefsWindow || {}).show) && Prefs.showMsgs === false)],
      ['-'],
      [() => (G && me().surrenderTo != null ? 'Take back surrender' : 'Surrender…'), () => G && !G.over && openSurrender(), () => commandShown('surrender')],
      [() => (G && me().armageddon ? 'Turn off the armageddon device' : 'Armageddon device…'), () => G && !G.over && toggleArmageddon(), 'armageddon'],
      ['Radical research…', () => openRadicalHand(), () => !!(G && (HO.rules(G).radicalHand || {}).menu)],
      ['Force end turn…', () => forceEndTurn(), () => !!(G && HO.rules(G).forceEndTurn && hotSeat())]],
    View: [['Zoom in', () => zoomAt(mapW / 2, mapH / 2, 1.3)], ['Zoom out', () => zoomAt(mapW / 2, mapH / 2, 1 / 1.3)], ['Fit galaxy', () => { UI.fitted = false; fit(); draw(); }], ['-'], [() => (Sound.on ? 'Turn sound off' : 'Turn sound on'), () => { Sound.on = !Sound.on; savePrefs(); }], [() => (Sound.music ? 'Turn theme music off' : 'Turn theme music on'), () => { Sound.music = !Sound.music; savePrefs(); if (Sound.music && !$('#titlescreen').hidden) Sound.startTheme(); else Sound.stopTheme(); }]],
    Help: [['How to play', openHelp], [() => (manualEnglish() ? 'Manual (in English): ' : 'Manual: ') + manualFor()[1], () => window.open(manualFor()[0], '_blank', 'noopener')]],
  };
  // The Ho menu, under the skin's "Ho!" at the top left: this version, and
  // the modern conveniences a player may choose (all of them can change in
  // the middle of a game). Items: [label, fn, feature or null, checked()].
  const ho = [['About this version…', openAbout], ['Patch notes…', openPatchNotes, () => patchOn()], ['Account…', () => openAccount(), () => !!CLOUD], ['-'],
    ['Skin and OS look…', openSkin], ['Sounds…', () => openSounds()], ['Language…', openLanguage, () => !!(G && !G.online && HO.languages(HO.ownRules(G)).length)],
    [MODERN_TEXT.replace(/:.*/, ''), () => { if (G) setModern(!modern()); else toast('Modern conveniences are chosen for each game: start or continue one first.'); }, null, () => modern()],
    // (not in an online game: the language and Hoedown are everyone's, chosen at New Game)
    ['Full Hoedown', () => setHoedown(!hoedownOn()), () => !!(G && !G.online && HO.ownRules(G).hoedown), () => hoedownOn()],
    ['-'], ['Suggestion box…', () => openFeedback('idea')]];
  const bar = $('#menubar');
  const menu = (btn, items) => {
    const dd = el('div', { class: 'dropdown', role: 'menu' });
    btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', guard((e) => {
      e.stopPropagation();
      const open = dd.classList.contains('open');
      document.querySelectorAll('.dropdown.open').forEach(d => { d.classList.remove('open'); d.previousElementSibling.setAttribute('aria-expanded', 'false'); });
      if (open) return;
      dd.innerHTML = '';
      for (const [label, fn, feat, checked, ghosted] of items) {
        if (label === '-') { dd.append(el('hr')); continue; }
        // feat: a feature the rules must have (HO.feature), or a function that says whether to show the item
        if (feat && !(typeof feat === 'function' ? feat() : G && HO.feature(G, feat))) continue;
        const on = checked ? !!checked() : null;
        const text = typeof label === 'function' ? label() : label;
        // (role menuitem: every skin styles its menus' items by that role)
        // ghosted(): a skin's item that shows but can't be chosen now (the Amiga's dotted ones)
        const off = ghosted ? !!ghosted() : false;
        dd.append(el('button', { role: 'menuitem', 'aria-label': checked ? `${text}: ${on ? 'on' : 'off'}` : null, class: checked ? 'check' + (on ? ' on' : '') : null, disabled: off ? 'disabled' : false,
          onclick: () => { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); fn(); } }, text));
      }
      dd.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      // a menu near the right edge opens leftward so it stays on screen
      dd.style.left = ''; dd.style.right = '';
      if (dd.getBoundingClientRect().right > window.innerWidth - 4) { dd.style.left = 'auto'; dd.style.right = '0'; }
    }));
    return el('div', { class: 'menu' }, btn, dd);
  };
  const logo = $('#menubar .logo');
  if (logo) { const at = el('span'); logo.replaceWith(at); at.replaceWith(menu(logo, ho)); }
  // T.menus(menus, ho): a skin adds its own items (its windows); it never drops one
  if (T.menus) T.menus(menus, ho);
  const laid = T.menuLayout ? layoutMenus(menus, T.menuLayout) : menus;
  // (T.menuName(name): a skin's own name for a menu, as text or a node: the Amiga's, in the language)
  for (const name in laid) bar.append(menu(el('button', { class: 'mbtn' }, T.menuName ? T.menuName(name) : name), laid[name]));
  document.addEventListener('click', () => document.querySelectorAll('.dropdown.open').forEach(d => { d.classList.remove('open'); d.previousElementSibling.setAttribute('aria-expanded', 'false'); }));
}
// A skin may lay these same items out as its original's menus did
// (T.menuLayout, js/skins/mac4): { menu: [[label, 'Menu/label'], '-', …] },
// where 'Menu/label' names an item above by its menu and label ('Menu/#n'
// by its place, for items whose label changes), and label (null: keep it)
// renames it; its rules (the feature that shows it, its check mark) stay.
// [label, fn] is the skin's own item, for a control already on the page
// (End Turn). Every item it leaves out goes at the end of its last menu, so
// a skin can move and rename controls but never drop one.
function layoutMenus(menus, layout) {
  const out = {}, used = new Set();
  const find = (ref) => {
    const [m, k] = ref.split('/'), items = menus[m] || [];
    const i = k[0] === '#' ? +k.slice(1) : items.findIndex(it => it[0] === k);
    return items[i] ? [m + '#' + i, items[i]] : null;
  };
  for (const name in layout) {
    out[name] = [];
    for (const e of layout[name]) {
      if (e === '-') { out[name].push(['-']); continue; }
      if (typeof e[1] === 'function') { out[name].push(e); continue; }
      const f = find(e[1]); if (!f) continue;
      used.add(f[0]);
      const it = f[1].slice(); if (e[0]) it[0] = e[0];
      out[name].push(it);
    }
  }
  const last = out[Object.keys(out).pop()];
  for (const m in menus) menus[m].forEach((it, i) => { if (it[0] !== '-' && !used.has(m + '#' + i)) last.push(it); });
  return out;
}
function nextFleet() {
  if (!G) return;
  const mine = fleetOrder(G.fleets.filter(f => f.owner === ME && f.star != null && !f.sat));
  if (!mine.length) return;
  const i = mine.findIndex(f => f.id === UI.selFleet);
  const f = mine[(i + 1) % mine.length];
  UI.selFleet = f.id; UI.sel = f.star; renderPanel(); draw();
}
// End Turn from the keyboard: T. The originals used ⌘T (Mac), Ctrl+T (DOS,
// Windows) or Amiga+Z; a browser keeps Ctrl+T and ⌘T for a new tab, so plain
// T is the key here (Ctrl/⌘+T is tried too, where the browser lets it through).
const END_KEY = () => `Keyboard: T${T.endTurnKey ? ` (in the original: ${T.endTurnKey}${/T$/.test(T.endTurnKey) ? ', which a browser keeps for opening a new tab' : ''})` : ''}`;
document.addEventListener('keydown', guard((e) => {
  if (UI.modal || !G) return;
  if (e.key === 'Tab' && e.target === document.body) { e.preventDefault(); nextFleet(); }
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
  if ((e.key === 't' || e.key === 'T') && !typing && !e.altKey && !e.shiftKey) {
    const btn = document.querySelector('#msg .clock');
    if (btn) { e.preventDefault(); btn.click(); }
  }
}));

// ---------- hover help ----------
// Anything with data-help="key" explains itself, in the words of the
// original manual (js/help.js), when the pointer rests on it, when it gets
// keyboard focus, or on a long press on a touch screen.
const Tip = { el: null, timer: 0, at: null };
function tipShow(target) {
  const k = target.dataset.help, R = (window.HOHELP_RULES || {})[rulesId()] || {};
  const h = R[k] || (window.HOHELP || {})[k];
  if (!h || !Prefs.tips) return;
  if (!Tip.el) { Tip.el = el('div', { class: 'tip', role: 'tooltip', id: 'hotip' }); document.body.append(Tip.el); }
  Tip.el.innerHTML = '';
  Tip.el.append(el('p', null, h[0]), el('small', null, `Adapted from the ${R[k] ? manualFor()[1] : 'Spaceward Ho! 5 manual'}: ${h[1]}`), UIL && UIL.lang !== 'en' && UIL.tr(h[0]) === h[0] ? inEnglish('This help is in English.') : null);
  if (target.dataset.key) Tip.el.append(el('p', { class: 'key' }, target.dataset.key));
  Tip.el.hidden = false; Tip.at = target;
  target.setAttribute('aria-describedby', 'hotip');
  const r = target.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 16);
  Tip.el.style.width = w + 'px';
  let x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
  let y = r.bottom + 6;
  Tip.el.style.left = x + 'px'; Tip.el.style.top = y + 'px';
  const th = Tip.el.getBoundingClientRect().height;
  if (y + th > window.innerHeight - 8) Tip.el.style.top = Math.max(8, r.top - th - 6) + 'px';
}
function tipHide() {
  clearTimeout(Tip.timer);
  if (Tip.at) Tip.at.removeAttribute('aria-describedby');
  if (Tip.el) Tip.el.hidden = true; Tip.at = null;
}
document.addEventListener('pointerover', (e) => {
  if (e.pointerType === 'touch') return;
  const t = e.target.closest && e.target.closest('[data-help]');
  if (!t) { if (Tip.at) tipHide(); return; }
  if (t === Tip.at) return;
  tipHide(); Tip.timer = setTimeout(() => tipShow(t), 450);
});
document.addEventListener('pointerdown', (e) => {
  tipHide();
  if (e.pointerType !== 'touch') return;
  const t = e.target.closest && e.target.closest('[data-help]');
  if (t) Tip.timer = setTimeout(() => tipShow(t), 550); // long press
});
document.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch' && !Tip.at) clearTimeout(Tip.timer); });
document.addEventListener('focusin', (e) => { const t = e.target.closest && e.target.closest('[data-help]'); if (t) tipShow(t); });
document.addEventListener('focusout', tipHide);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') tipHide(); });

// ---------- boot ----------
window.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', PAGE);
  // what a skin's hooks may use (the Amiga skin builds windows of its own with these)
  T.api = {
    get G() { return G; }, get ME() { return ME; }, UI, IMG, A, el, $, me, money, fmt, degF, toC, degText, panelFig,
    toast, modal, closeModal, confirmBox, renderPanel, renderMsg, draw, save, Sound, beep, guard,
    shipPic, shipImgEl, starLook, fleetOrder, curFleet, centerOn, zoomAt, resize, map: () => ({ w: mapW, h: mapH, ready: !!cv }),
    fit() { UI.fitted = false; fit(); draw(); }, clampView,
    openBuild, openSplit, openOrganize, organizeStyle, openPlayers, openScrapTypes, openBattle, lastBattles, battleName, openReports, openAbout, openHelp,
    openRadicalHand, showRank, openWinWindows, openYouWon, openYouLost, // (the originals' own windows, for the tests)
    newGameDialog, titleScreen, hideTitle, continueChecked, importGame, doEndTurn, flipBarScale, marksScrap, scrapWords, toggleScrapFleet,
    verOpts, modern, hotSeat, openGameText, Prefs, savePrefs, switchPlayers, forceEndTurn, openBattleList, openFixSpending, lastBattles, playOneTurn,
    // (and the windows tools/ui-lang-audit.js opens in every skin and language)
    openPrefs, openAccount, openHall, hasHall, openMasterList, openRanks, openGameCenter, openFleetList, openStarList, openGive, openChat,
    openSkin, openSounds, openLanguage, openAutoPlay, openDip, openSurrender, openSavedGames, closeScreen, openPatchNotes,
    classic(name, fn, ...a) { skipSkinWin = name; try { return fn(...a); } finally { skipSkinWin = null; } },
  };
  window.HOAPI = T.api; // (the test tools: tools/ui-lang-audit.js)
  if (T.page) T.page(document);
  Object.assign(HO.DATA, window.HODATA);
  setupMenus();
  syncLang(); // the title in the player's language, else English (js/ui-lang.js)
  $('#tnew').addEventListener('click', guard(newGameDialog));
  $('#tcont').addEventListener('click', guard(() => continueChecked()));
  $('#thelp').addEventListener('click', guard(openHelp));
  $('#timport').addEventListener('click', guard(importGame));
  const resume = window.HOSKINS && HOSKINS.takeResume() && localStorage.getItem('ho5.save');
  // the title screen's backdrop covers the empty game while the pictures load
  const ts = $('#titlescreen'); ts.hidden = false; ts.classList.add('loading');
  loadManifest(() => loadImages(guard(() => {
    ts.classList.remove('loading'); setupMap();
    if (resume) { ts.hidden = true; continueGame(true); } else titleScreen();
    joinFromAddress(); // ?join=CODE: an online game's invitation
  })));
});
})();
