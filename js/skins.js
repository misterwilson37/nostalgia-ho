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
//   game to move to the chosen one.
(function (root) {
'use strict';
const SKINS = [
  { id: 'classic', name: 'Classic' },
];
const store = {
  get(k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { root.localStorage.setItem(k, v); } catch (e) {} },
};
// the single-file build (tools/bundle.py) includes only one skin
const list = root.HOSKINS_INLINE ? SKINS.filter(s => s.id === root.HOSKINS_INLINE) : SKINS;
const valid = (id) => list.some(s => s.id === id);
let wanted = null;
try { wanted = new URLSearchParams(root.location.search).get('skin'); } catch (e) {}
const current = [wanted, store.get('ho5.skin')].find(valid) || list[0].id;

root.HOSKINS = {
  list,
  current,
  // true once, right after switchTo(): continue the saved game
  takeResume() {
    let r = null;
    try { r = root.sessionStorage.getItem('ho5.resume'); root.sessionStorage.removeItem('ho5.resume'); } catch (e) {}
    return r === '1';
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
