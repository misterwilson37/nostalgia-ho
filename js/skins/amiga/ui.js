// Spaceward Ho! web remake — the Amiga 2.0 skin (see js/skins.js)
//
// The German Amiga version of 1994 (conversion by Stefan "Bebbo" Franke)
// is the DOS 2.0 game: the same pictures in the same order and the same
// sounds. Its own look is the 16-colour set of those pictures, made for
// Amigas without the AGA chips, plus its title picture and its End Turn
// button ("Zug Ende", German for end of turn; Amiga+Z was the key). So
// this skin is the DOS skin (js/skins/dos/ui.js) pointed at the Amiga
// pictures and sounds (tools/extract/amiga.py, which names them like the
// DOS ones) with an Amiga Workbench-coloured page.
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for its pictures
window.HOTHEME_OVER = {
  dir: 'assets/skins/amiga/',
  // the Amiga title picture is one piece
  title(frame, IMG, Sound) {
    const t = IMG[P + 'title'];
    if (!t || !t.width) return false;
    frame.width = t.width; frame.height = t.height;
    frame.getContext('2d').drawImage(t, 0, 0);
    Sound.play(2000);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 2.0 for the Amiga (New World Computing, 1994). Amiga version by Stefan "Bebbo" Franke; pictures by Howard Vives.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 2.0';
  },
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
