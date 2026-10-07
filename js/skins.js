// Spaceward Ho! web remake — skins.
//
// A skin is everything you see and hear: it lives in js/skins/<id>/ as
// ui.js (builds the page, draws, plays sounds) and style.css, and may keep
// its own art in assets/skins/<id>/. The game itself (engine.js, the rules
// and the computer players) never touches the page, so any skin can play
// any ruleset and any saved game.
//
// To add a skin: make the folder and add a line to SKINS below.
//
// Which skin loads: ?skin=<id> in the address, else the last one picked
// (localStorage "ho5.skin"), else the first in the list.
//
// What a skin's ui.js must do:
// - build its own page inside <body> (index.html leaves the body empty);
// - on start, if HOSKINS.takeResume() is true, continue the saved game
//   ("ho5.save") straight away instead of showing a title screen. That is
//   how a new game started in one skin opens in another;
// - offer HOSKINS.list as a choice in its New Game window when there is
//   more than one skin, and call HOSKINS.switchTo(id) after saving the new
//   game to move to the chosen one;
// - show every control that belongs to the ruleset being played (its
//   HO.feature()s and rs flags: Evacuate, battle stances, alliances, the New
//   Game choices, the shipbuilding bar, …) and none that it doesn't have,
//   whatever the skin: a skin draws those controls in its own look (its
//   buttons, check boxes, lists and sliders), never decides whether they are
//   there. The skins built on js/skins/classic/ui.js get this from it.
//
// The operating system's part of the look (window frames and title bars,
// menus, buttons, check boxes, radio buttons, pop-up menus, sliders, scroll
// bars, fields and the system fonts) is a separate choice, the "OS look":
// js/os/<id>.css, loaded before the skin's style.css (so a skin's own rules
// can still dress one of its windows), and named on the document root as
// class "os-<id>". A skin keeps the game's own art and layout. OSES below
// lists the looks; each skin lists its own (SKINS' os), the first its
// default, and any skin can be played in any look. Which look loads:
// ?os=<id>, else the last one picked (localStorage "ho5.os"), else the
// skin's first. HOSKINS.setOS(id) changes it at once, without a reload.
//
// Sounds belong to the skin: a game plays only the sounds its skin's
// original had (SOUNDS below), and an event the original had no sound for
// is silent. A player can choose another original's sounds, or none, for a
// game (New Game, or the Ho menu mid-game): HOSKINS.soundSets lists the
// choices and HOSKINS.soundSet(id) gives one.
(function (root) {
'use strict';
// Each skin is the look of one release of the game: its version, platform
// and year name it in the lists, which run oldest to newest; the newest is
// the default.
// Each original's sounds, by the skin whose art comes from it. The remake
// plays its sounds by the 5.0.5 game's numbers (assets/sounds, the
// "classic" set: 2000 good news, 2001 bad news, 3000-3003 battle shots,
// 4000/4001 fleet stays/goes, 5000 message sent, 6000-6002 exploring, 7001
// next message, 7006 ship built, 11111 end of turn, ...). A set's own files
// (dir + 'sounds/<n>.wav', listed in dir + 'manifest.json') replace those
// with the same number; map gives one of its files for another number (null:
// silent); every other number is silent, so a set never borrows another
// original's sound. A skin's messageLook may also ask for its own files by
// their own numbers or names. null: the original had no sounds.
const DOS_MAP = { 7001: 1000, 11111: 7000, 7006: 1000 };
// the Mac 4.0.5's own numbers for the Windows 4.0.5's sounds (js/skins/w95
// map below): click 7001, burst 2000, shucks 2001, whoa 4000, hyahh 4001,
// buddy 7017, awww 7020, abandon 7002, scrap 7003, wow 7021, explode 3003
const MAC4_MAP = {
  5001: 7017, 5002: 7020, 5003: 2001, // pacts and chat
  7004: 7001, 7006: 7001, 7007: 2000, 7013: 7001, 7014: 7001, 7015: 7001, 7016: 4000, 7017: 7001,
  7018: 7001, 7019: 2000, 7020: 2001, 8000: 3003, 128: 4001, 7022: null, 7023: null,
  11111: 7000, // "New Turn", which the Windows one hasn't got: played at End Turn, as 3.0.1's 7000
  7005: null, 7008: null, 7009: null, 7010: null, 7011: null, 7012: null, 7024: null, 10000: null,
};
for (const n of [2000, 2001, 3000, 3001, 3002, 3003, 4000, 4001, 5000, 5001, 5002, 5003, 6000, 6001, 6002,
  7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009, 7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017,
  7018, 7019, 7020, 7021, 7022, 7023, 7024, 8000, 10000]) MAC4_MAP['m' + n] = n;
const SOUNDS = {
  classic: { name: '5.0.5 (Mac OS 9 and X, 2003)', year: 2003, dir: null },
  // The DOS game numbers its sounds like the Mac game (2000 good news,
  // 2001 bad news, 3000-3003 battle shots, 4000/4001 fleet stays/goes,
  // 5000 message sent, 6000-6002 exploring, 7000 end of turn, 1000 the
  // click). It has no others, so the rest are silent. (Sound uses:
  // FUN_10c0_0c50 and the callers of FUN_1100_03c9 in the Windows build.)
  dos: { name: '2.0 (DOS and Windows 3.1, 1993)', year: 1993, dir: 'assets/skins/dos/', map: DOS_MAP },
  // the Amiga game has the DOS game's sounds, some of them resampled
  amiga: { name: '2.0 (Amiga, German, 1994)', year: 1994, dir: 'assets/skins/amiga/', map: DOS_MAP },
  // 1.2 has thirteen sounds: good and bad news, battle, exploring, end of turn
  mac12: { name: '1.2 (Mac, French, 1992)', year: 1992, dir: 'assets/skins/mac12/', map: { 11111: 7000 } },
  // 2.0.1 has the same thirteen sounds as 1.2 (the same files); no click
  mac2: { name: '2.0.1 (Mac, 1992)', year: 1992, dir: 'assets/skins/mac2/', map: { 11111: 7000 } },
  mac2c: { name: '2.0.1 (Mac, 1992)', year: 1992, dir: 'assets/skins/mac2c/', map: { 11111: 7000 }, same: 'mac2' },
  // 3.0.1 has the Mac 5.0.5 sounds' numbers, 7001 (next message) included
  mac3: { name: '3.0.1 (Mac, 1993)', year: 1993, dir: 'assets/skins/mac3/', map: { 11111: 7000, 7006: 7001 } },
  // the colour skin's sounds are the same files as the black and white one's
  mac3c: { name: '3.0.1 (Mac, 1993)', year: 1993, dir: 'assets/skins/mac3c/', map: { 11111: 7000, 7006: 7001 }, same: 'mac3' },
  // the Mac 4.0.5 (37 sounds in the program, 5 in its Color Picts file) is
  // the program the Windows 4.0.5 came from: the same sounds, numbered, and
  // played for the same events as the Windows one's names (below); each of
  // its files is also m<number> for the skin's own report sounds, since its
  // numbers mean other things than 5.0.5's (its 7013 is the biological
  // eating, its 7019 "Very good!")
  mac4: { name: '4.0.5 (Mac, 1996)', year: 1996, dir: 'assets/skins/mac4/', map: MAC4_MAP },
  mac4c: { name: '4.0.5 (Mac, 1996)', year: 1996, dir: 'assets/skins/mac4c/', map: MAC4_MAP, same: 'mac4' },
  // 4.0.5 names its sounds (FUN_0046fe1b and the callers of FUN_0042f8bf)
  w95: { name: '4.0.5 (Windows 95, 1996)', year: 1996, dir: 'assets/skins/w95/', map: {
    2000: 'burst', 2001: 'shucks', // good / bad news
    3000: 'softhit', 3001: 'medhit', 3002: 'hit', 3003: 'explode', // battle shots
    4000: 'whoa', 4001: 'hyahh', // fleet stays / goes
    5000: 'message', 5001: 'buddy', 5002: 'awww', 5003: 'shucks', // messages and pacts
    6000: 'goodmmm', 6001: 'bad', 6002: 'medex', // exploring: good, worthless, so-so
    7001: 'click', 7002: 'abandon', 7003: 'scrap', 7004: 'click', 7006: 'click', 7007: 'burst',
    7013: 'click', 7014: 'click', 7015: 'click', 7016: 'whoa', 7017: 'click', 7018: 'click', 7019: 'burst',
    7020: 'shucks', 7021: 'wow', 8000: 'explode', 128: 'hyahh', 11111: null, 7022: null, 7023: null,
  } },
  palm: null, // the Palm game had no sampled sounds
};
// The OS looks (js/os/<id>.css), oldest first: each is the window chrome
// of one system, drawn in CSS (no system bitmaps).
const OSES = [
  { id: 'workbench', name: 'Workbench (Amiga)', year: 1990 },
  { id: 'system6', name: 'System 6', year: 1988 },
  { id: 'system7', name: 'System 7', year: 1991 },
  { id: 'win31', name: 'Windows 3.1', year: 1992 },
  { id: 'dos', name: 'DOS (2.0\u2019s own windows)', year: 1993 },
  { id: 'win95', name: 'Windows 95', year: 1995 },
  { id: 'palmos', name: 'Palm OS', year: 1996 },
  { id: 'macos8', name: 'Mac OS 8 and 8.6 (Platinum)', year: 1997 },
  { id: 'macos9', name: 'Mac OS 9', year: 1999 },
  { id: 'macosx', name: 'Mac OS X (Aqua)', year: 2001 },
].sort((a, b) => a.year - b.year);
// os: the skin's own OS looks, its default first (the systems its original
// ran on); any other look can be chosen too
const SKINS = [
  { id: 'dos', version: '2.0', platform: 'DOS and Windows 3.1', year: 1993, os: ['dos', 'win31'] },
  { id: 'amiga', version: '2.0', platform: 'Amiga, German', year: 1994, os: ['workbench'] },
  { id: 'mac12', version: '1.2', platform: 'Mac, French, black and white', year: 1992, os: ['system7'] },
  { id: 'mac2', version: '2.0.1', platform: 'Mac, black and white', year: 1992, os: ['system6', 'system7'] },
  { id: 'mac2c', version: '2.0.1', platform: 'Mac, colour', year: 1992, os: ['system6', 'system7'] },
  { id: 'mac3', version: '3.0.1', platform: 'Mac, black and white', year: 1993, os: ['system7'] },
  { id: 'mac3c', version: '3.0.1', platform: 'Mac, colour', year: 1993, os: ['system7'] },
  { id: 'mac4', version: '4.0.5', platform: 'Mac, black and white', year: 1996, os: ['system7', 'macos8'] },
  { id: 'mac4c', version: '4.0.5', platform: 'Mac, colour', year: 1996, os: ['system7', 'macos8'] },
  { id: 'w95', version: '4.0.5', platform: 'Windows 95', year: 1996, os: ['win95'] },
  { id: 'palm', version: '5', platform: 'Palm OS, version 1.0.4', year: 2003, os: ['palmos'] },
  { id: 'classic', version: '5.0.5', platform: 'Mac OS 9 and X', year: 2003, os: ['macos8', 'macos9', 'macosx'] },
].map(k => Object.assign(k, { name: `${k.version} (${k.platform}, ${k.year})`, sounds: k.id in SOUNDS ? SOUNDS[k.id] && k.id : 'classic' }))
  .sort((a, b) => a.year - b.year || a.version.localeCompare(b.version, 'en', { numeric: true }));
const store = {
  get(k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { root.localStorage.setItem(k, v); } catch (e) {} },
};
// the single-file build (tools/bundle.py) includes only one skin
const list = root.HOSKINS_INLINE ? SKINS.filter(s => s.id === root.HOSKINS_INLINE) : SKINS;
const valid = (id) => list.some(s => s.id === id);
let wanted = null;
try { wanted = new URLSearchParams(root.location.search).get('skin'); } catch (e) {}
const newest = list[list.length - 1].id; // the list runs oldest to newest
const current = [wanted, store.get('ho5.skin')].find(valid) || newest;
const skinOf = (id) => list.find(s => s.id === id) || list[0];
const validOS = (id) => OSES.some(o => o.id === id);
const osDefault = (skin) => skinOf(skin).os[0];
let wantedOS = null;
try { wantedOS = new URLSearchParams(root.location.search).get('os'); } catch (e) {}
let currentOS = [wantedOS, store.get('ho5.os')].find(validOS) || osDefault(current);
// show a look: the single-file build has every look inlined as <style
// data-os> (tools/bundle.py) and turns one on; otherwise the one <link>
// (#ho-os) is pointed at js/os/<id>.css, the old one kept until the new one
// has loaded so nothing flashes unstyled
function applyOS(id) {
  const doc = root.document, de = doc.documentElement;
  for (const c of [...de.classList]) if (c.startsWith('os-')) de.classList.remove(c);
  de.classList.add('os-' + id); de.dataset.os = id;
  const inl = doc.querySelectorAll('style[data-os]');
  if (inl.length) { for (const st of inl) st.media = st.dataset.os === id ? 'all' : 'not all'; return; }
  const old = doc.getElementById('ho-os');
  if (!old) return;
  const href = `js/os/${id}.css`;
  if (old.getAttribute('href') === href) return;
  const ln = doc.createElement('link');
  ln.rel = 'stylesheet'; ln.href = href;
  const done = () => { if (old.parentNode) old.remove(); ln.id = 'ho-os'; };
  ln.onload = done; ln.onerror = done;
  old.after(ln);
}

// the sound sets a player may choose: each original's own (one entry for
// sets that are the same files), oldest first; the single-file build has
// only the 5.0.5 sounds and its own skin's
const soundSets = Object.keys(SOUNDS).filter(id => SOUNDS[id] && !SOUNDS[id].same)
  .filter(id => !root.HOSKINS_INLINE || id === 'classic' || id === root.HOSKINS_INLINE || SOUNDS[root.HOSKINS_INLINE] && SOUNDS[root.HOSKINS_INLINE].same === id)
  .map(id => Object.assign({ id }, SOUNDS[id])).sort((a, b) => a.year - b.year);
root.HOSKINS = {
  list,
  current,
  // the OS looks ([{ id, name, year }]), the one showing, and a skin's own
  oses: OSES,
  get os() { return currentOS; },
  osName(id) { const o = OSES.find(x => x.id === id); return o ? o.name : id; },
  skinOS(skin) { return skinOf(skin).os.slice(); },
  osDefault,
  // the looks in the order a menu lists them for a skin: its own first,
  // then (own: false) every other one
  osChoices(skin) {
    const own = skinOf(skin).os;
    return [...own.map(id => Object.assign({ own: true }, OSES.find(o => o.id === id))),
      ...OSES.filter(o => !own.includes(o.id)).map(o => Object.assign({ own: false }, o))];
  },
  // show another look at once and remember it ("ho5.os")
  setOS(id) {
    if (!validOS(id)) return;
    currentOS = id; store.set('ho5.os', id);
    applyOS(id);
  },
  // true once, right after switchTo(): continue the saved game
  takeResume() {
    let r = null;
    try { r = root.sessionStorage.getItem('ho5.resume'); root.sessionStorage.removeItem('ho5.resume'); } catch (e) {}
    return r === '1';
  },
  // the sound sets to choose from ([{ id, name, dir, map }]), and one by id
  // (null for 'none' or an unknown id); a skin's own set is its "sounds"
  soundSets,
  soundSet(id) { return id && SOUNDS[id] ? Object.assign({ id }, SOUNDS[id]) : null; },
  // remember the choice and reload in that skin at its title screen, in
  // the look given (else that skin's own first look)
  preview(id, os) {
    if (!valid(id) || id === current) return;
    store.set('ho5.skin', id);
    store.set('ho5.os', validOS(os) ? os : osDefault(id));
    const u = new URL(root.location.href); u.searchParams.delete('skin');
    root.location.href = u.toString();
  },
  // remember the choice and reload in that skin, continuing the saved game,
  // in the look given (else the one showing)
  switchTo(id, os) {
    if (!valid(id)) return;
    store.set('ho5.skin', id);
    if (validOS(os)) store.set('ho5.os', os);
    try { root.sessionStorage.setItem('ho5.resume', '1'); } catch (e) {}
    const u = new URL(root.location.href); u.searchParams.delete('skin');
    root.location.href = u.toString();
  },
};
store.set('ho5.skin', current);
store.set('ho5.os', currentOS);
root.document.documentElement.classList.add('os-' + currentOS);
root.document.documentElement.dataset.os = currentOS;
if (root.HOSKINS_INLINE) applyOS(currentOS);
else {
  root.document.write(`<link rel="stylesheet" id="ho-os" href="js/os/${currentOS}.css">` +
    `<link rel="stylesheet" href="js/skins/${current}/style.css">` +
    `<script src="js/skins/${current}/ui.js"><\/script>`);
}
})(this);
