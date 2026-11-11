// Spaceward Ho! web remake — the DOS skin's "Windows 3.1" look: the one hook (loaded by js/skins/dos/ui.js). With the win31 look, a menu item
// that opens a window the Windows program has a template for opens that dialog (HOWIN31.show, js/skins/dos/win31/dialog.js); every other
// item, and every item in the dos look, does what it did. It loads the templates, the renderer and the dialogs, and adds the Windows Help
// menu's About. ITEMS is what a chunk adds to: the DOS skin's menu label and the dialog's name in js/skins/dos/win31/dialogs.js.
(function (root) {
'use strict';
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/win31/templates.js' + (window.HO_BUILD || '') + '"><\/script>');
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/win31/dialog.js' + (window.HO_BUILD || '') + '"><\/script>');
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/win31/dialogs.js' + (window.HO_BUILD || '') + '"><\/script>');
const ITEMS = { 'About Ho!…': 'about', 'Set Battle Speed…': 'battleSpeed' };
const winOn = () => root.document.documentElement.classList.contains('os-win31') && !!root.HOWIN31 && !!root.HOWIN31.show;
const T = root.HOTHEME, M = T && T.menuLayout;
if (!M) return;
for (const items of Object.values(M)) {
  for (const it of items) {
    if (!Array.isArray(it) || typeof it[1] !== 'function' || !ITEMS[it[0]]) continue;
    const name = ITEMS[it[0]], orig = it[1];
    it[1] = (...a) => (winOn() && root.HOWIN31.show(name)) || orig(...a);
  }
}
// (the Windows program's Help menu: Help on Ho!, About Spaceward Ho!; the skin's win31 Help menu has How to play)
if (M.Help) M.Help.push('-', ['About Spaceward Ho!', () => winOn() && root.HOWIN31.show('about'), null, null, null, null]);
})(window);
