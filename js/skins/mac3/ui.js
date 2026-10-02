// Spaceward Ho! web remake — the Mac 3.0.1 skin (see js/skins.js)
//
// Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993) in black and
// white, the way it looked on a Mac Plus or SE. Its icons and ship
// pictures have the same numbers as the DOS 2.0 game's colour ones (the
// DOS version was made from the Mac game), so this skin is the DOS skin
// (js/skins/dos/ui.js) pointed at the 3.0.1 pictures and sounds
// (tools/extract/mac3.py), with a few changes: ship parts are 40x40
// pictures p2600-p2926, and the title, End Turn button, selection rings
// and won/lost pictures are 3.0.1's own.
//
// The colour skin (js/skins/mac3c) is this one with the pictures from
// 3.0's "Ho! 3.0 Color Picts" file (assets/skins/mac3c, same names).
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for its pictures
const colour = !!window.HOMAC3_COLOUR;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const images = {
  p3030: 'p3530', p3040: 'p3540', // won, eliminated
  white0_0: 'i1000', white0_1: 'i1500', // you, in the Players window
};
for (let n = 0; n < 16; n++) { images['bad' + n + '_0'] = 'i' + (2000 + n); images['bad' + n + '_1'] = 'i' + (2500 + n); }
window.HOTHEME_OVER = {
  dir: colour ? 'assets/skins/mac3c/' : 'assets/skins/mac3/',
  // 3.0.1 has the Mac 5.0.5 sounds' numbers, 7001 (next message) included
  sounds: { 11111: 7000, 7006: 7001 },
  images,
  battlePlanet: P + 'i1004', // a plain planet
  select: P + 'p502', selectSmall: P + 'p503',
  endTurnPic: P + 'p5500', // "End Turn ⌘T"
  // Ship pictures: engine, hull and nose side by side, as in the DOS game,
  // but 40x40 parts (2600 + the DOS part number less 100), shown twice the size.
  shipPic(d, IMG) {
    const part = (n) => IMG[P + 'p' + (2600 + n)];
    let parts;
    if (d.type === 'satellite') parts = [part(301 + clamp(d.W - 1, 0, 25))];
    else if (d.type === 'scout' || d.type === 'fighter' || d.type === 'colony') {
      if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R > 8 && d.R < 12) parts = [part(151), part(152), part(153)];
      else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R > 11 && d.R < 15) parts = [part(154), part(155), part(156)];
      else parts = [part(clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? part(150) : part(99 + clamp(d.S - 1, 0, 25)), part(250 + clamp(d.W - 1, 0, 29))];
    } else return null;
    if (parts.some(im => !im || !im.width)) return null;
    const c = document.createElement('canvas'); c.width = parts.length * 80; c.height = 80;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    parts.forEach((im, i) => x.drawImage(im, i * 80, 0, 80, 80));
    return c;
  },
  // the title screen: 3.0.1's credits picture
  title(frame, IMG, Sound) {
    const t = IMG[P + 'p1001'];
    if (!t || !t.width) return false;
    frame.width = t.width; frame.height = t.height;
    frame.getContext('2d').drawImage(t, 0, 0);
    Sound.play(10000); // "Move 'em out!"
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993): written by Peter Commons, art by Howard Vives and Bob Van de walle, sounds by Mark Madeley.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 3.0.1';
  },
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
