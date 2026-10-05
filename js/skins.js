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
  // 3.0.1 has the Mac 5.0.5 sounds' numbers, 7001 (next message) included
  mac3: { name: '3.0.1 (Mac, 1993)', year: 1993, dir: 'assets/skins/mac3/', map: { 11111: 7000, 7006: 7001 } },
  // the colour skin's sounds are the same files as the black and white one's
  mac3c: { name: '3.0.1 (Mac, 1993)', year: 1993, dir: 'assets/skins/mac3c/', map: { 11111: 7000, 7006: 7001 }, same: 'mac3' },
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
const SKINS = [
  { id: 'dos', version: '2.0', platform: 'DOS and Windows 3.1', year: 1993 },
  { id: 'amiga', version: '2.0', platform: 'Amiga, German', year: 1994 },
  { id: 'mac12', version: '1.2', platform: 'Mac, French, black and white', year: 1992 },
  { id: 'mac3', version: '3.0.1', platform: 'Mac, black and white', year: 1993 },
  { id: 'mac3c', version: '3.0.1', platform: 'Mac, colour', year: 1993 },
  { id: 'w95', version: '4.0.5', platform: 'Windows 95', year: 1996 },
  { id: 'palm', version: '5', platform: 'Palm OS, version 1.0.4', year: 2003 },
  { id: 'classic', version: '5.0.5', platform: 'Mac OS 9 and X', year: 2003 },
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

// the sound sets a player may choose: each original's own (one entry for
// sets that are the same files), oldest first; the single-file build has
// only the 5.0.5 sounds and its own skin's
const soundSets = Object.keys(SOUNDS).filter(id => SOUNDS[id] && !SOUNDS[id].same)
  .filter(id => !root.HOSKINS_INLINE || id === 'classic' || id === root.HOSKINS_INLINE || SOUNDS[root.HOSKINS_INLINE] && SOUNDS[root.HOSKINS_INLINE].same === id)
  .map(id => Object.assign({ id }, SOUNDS[id])).sort((a, b) => a.year - b.year);
root.HOSKINS = {
  list,
  current,
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
  // remember the choice and reload in that skin at its title screen
  preview(id) {
    if (!valid(id) || id === current) return;
    store.set('ho5.skin', id);
    const u = new URL(root.location.href); u.searchParams.delete('skin');
    root.location.href = u.toString();
  },
  // remember the choice and reload in that skin, continuing the saved game
  switchTo(id) {
    if (!valid(id)) return;
    store.set('ho5.skin', id);
    try { root.sessionStorage.setItem('ho5.resume', '1'); } catch (e) {}
    const u = new URL(root.location.href); u.searchParams.delete('skin');
    root.location.href = u.toString();
  },
};
store.set('ho5.skin', current);
if (!root.HOSKINS_INLINE) {
  root.document.write(`<link rel="stylesheet" href="js/skins/${current}/style.css">` +
    `<script src="js/skins/${current}/ui.js"><\/script>`);
}
})(this);
