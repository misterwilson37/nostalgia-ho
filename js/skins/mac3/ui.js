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
// js/skins/mac12: 1.2 (1992), the same program two years earlier, with the
// DOS game's set of icons and the big ship pictures as well
const v12 = window.HOMAC_VERSION === '1.2';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const images = {
  p3030: 'p3530', p3040: 'p3540', // won, eliminated
  white0_0: 'i1000', white0_1: 'i1500', // you, in the Players window
};
for (let n = 0; n < 16; n++) { images['bad' + n + '_0'] = 'i' + (2000 + n); images['bad' + n + '_1'] = 'i' + (2500 + n); }
window.HOTHEME_OVER = {
  dir: v12 ? 'assets/skins/mac12/' : colour ? 'assets/skins/mac3c/' : 'assets/skins/mac3/',
  // 3.0.1 has the Mac 5.0.5 sounds' numbers, 7001 (next message) included
  sounds: v12 ? { 11111: 7000 } : { 11111: 7000, 7006: 7001 },
  images,
  battlePlanet: P + 'i1004', // a plain planet
  // Planets on the map, as 3.0.1 picks them (SetPlanetTypesForStar @a4fbc
  // in the decompile, docs/301-findings.md). r = the planet's gravity over
  // your home's, either way round (at most 2.00 good, up to 2.56 poor).
  //   yours (+500 if you're a woman): making money 1000 (1100, and 1600 for
  //     a woman, on 25 December); losing money: r <= 2: 1001, r <= 2.56:
  //     1012 (1013 under 100 metal), else 1002 (1003)
  //   explored, nobody's: r <= 2: 1004, r <= 2.56: 1010 (1011), else 1005 (1006)
  //   1007 unexplored, 1008 one of your fleets is on its way, 1009 a battle
  //   was seen there; someone else's: 2000 + face (+500 a woman); a star
  //   turning red or gone nova: 1020
  starLook(look, { G, p, s, k }) {
    const b = look.base;
    const L = (n) => ({ base: P + 'i' + n, scale: 1.45 });
    if (/^nova/.test(b)) return L(1020);
    if (b === 'unknown') return L(1007);
    if (b === 'soon') return L(1008);
    if (b === 'battle') return L(1009);
    if (look.hat && look.hat.startsWith('bad')) {
      const [n, f] = look.hat.slice(3).split('_');
      return L((f === '1' ? 2500 : 2000) + (+n % 20));
    }
    const src = look.hat ? s : k;
    if (!src || (!look.hat && !k.explored)) return L(1007);
    const r = Math.max(src.g, p.homeG) / Math.max(0.01, Math.min(src.g, p.homeG));
    const band = r <= 2 ? 0 : r <= 2.56 ? 1 : 2, rich = src.metal >= 100;
    if (look.hat) { // yours
      const d = new Date(), xmas = d.getMonth() === 11 && d.getDate() === 25;
      if (HO.planetIncome(G, p, s) >= 0) return L(xmas ? (p.female ? 1600 : 1100) : p.female ? 1500 : 1000);
      return L((p.female ? 500 : 0) + [1001, rich ? 1012 : 1013, rich ? 1002 : 1003][band]);
    }
    return L([1004, rich ? 1010 : 1011, rich ? 1005 : 1006][band]);
  },
  select: P + 'p502', selectSmall: P + 'p503',
  endTurnPic: P + (v12 ? 'endturn' : 'p5500'), // "End Turn ⌘T" (1.2's own says "Fin Tour"; endturn is 3.0.1's)
  // Ship pictures: engine, hull and nose side by side, as in the DOS game,
  // but 40x40 parts (2600 + the DOS part number less 100), shown twice the size.
  shipPic(d, IMG) {
    const big = v12; // 1.2 has the 81x76 parts (2100 + n) too
    const part = (n) => IMG[P + 'p' + ((big ? 2100 : 2600) + n)];
    let parts;
    if (d.type === 'satellite') parts = [part(301 + clamp(d.W - 1, 0, 25))];
    else if (d.type === 'scout' || d.type === 'fighter' || d.type === 'colony') {
      if (d.type !== 'colony' && d.W === 12 && d.S === 12 && d.R > 8 && d.R < 12) parts = [part(151), part(152), part(153)];
      else if (d.type !== 'colony' && d.W === 15 && d.S === 15 && d.R > 11 && d.R < 15) parts = [part(154), part(155), part(156)];
      else parts = [part(clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? part(150) : part(99 + clamp(d.S - 1, 0, 25)), part(250 + clamp(d.W - 1, 0, 29))];
    } else return null;
    if (parts.some(im => !im || !im.width)) return null;
    const w = big ? 81 : 80, h = big ? 76 : 80;
    const c = document.createElement('canvas'); c.width = parts.length * w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    parts.forEach((im, i) => x.drawImage(im, i * w, 0, w, h));
    return c;
  },
  // Report pictures, as 3.0.1 picks them (GetIconID @161216: by report
  // template, STR# 1000), matched here by the text; the sound and anything
  // not listed are the DOS skin's choice. 3161 (the scroll) is for chat.
  messageLook(m, cur, ctx) {
    const look = window.HOTHEME.base.messageLook(m, cur, ctx);
    const t = String(m.text || ''), me = ctx.G.players[ctx.ME];
    const ICONS = [
      [/Radical researchers|mining consortium|weather patterns|ship technicians|black and white to colou?r|hardware problems|already are running in colou?r/, 3105],
      [/not receiving sufficient funds|not spending any money on (technology|research)|Ship money is being used|no money to spend|borrow more ship money|enough money! You.re neglecting/, 4013],
      [/never become profitable|computer bug/, 3112],
      [/baby boom/i, 4017],
      [/meteor shower|shock wave from the supernova/, 4015],
      [/gone supernova|armageddon!|armageddon device was activated|half of the stars/i, 3118],
      [/has offered to ally|You have offered to ally/, 3164],
      [/no longer wants? to ally/, 3163],
      [/formed an alliance|alliance with .* is gone/, 3160],
      [/energy emanating/, 3119],
      [/given you \$|You just gave .* \$/, 3110],
      [/given you [\d,]+ metal|You just gave .* metal|archaeologists/, 3162],
      [/has just surrendered/, 4016],
      [/climatologists/, 1001],
      [/generals are now smarter/, 3142],
    ];
    for (const [re, n] of ICONS) if (re.test(t)) return Object.assign({}, look, { icon: P + 'i' + n });
    if (/^You have just surrendered|^You have abandoned|has revolted|people have revolted|sociologists|spies have stolen|alliance will win/.test(t)) return Object.assign({}, look, { icon: P + 'i' + (me.female ? 1500 : 1000) });
    if (m.chat) return Object.assign({}, look, { icon: P + 'i3161' });
    return look;
  },
  // the title screen: 3.0.1's credits picture
  title(frame, IMG, Sound) {
    const t = IMG[P + 'p1001'];
    if (!t || !t.width) return false;
    frame.width = t.width; frame.height = t.height;
    frame.getContext('2d').drawImage(t, 0, 0);
    Sound.play(v12 ? 2000 : 10000); // "Move 'em out!" (1.2 hasn't got it)
    return true;
  },
  page(doc) {
    if (v12) {
      const c = doc.querySelector('#titlescreen .credit');
      if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 1.2 for the Macintosh, French edition (Delta Tao Software and Upgrade Editions, Paris, 1992): programming by Peter Commons, pictures by Howard Vives. The title picture says so in French.';
      const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 1.2';
      return;
    }
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993): written by Peter Commons, art by Howard Vives and Bob Van de walle, sounds by Mark Madeley.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 3.0.1';
  },
};
if (v12) { delete window.HOTHEME_OVER.starLook; delete window.HOTHEME_OVER.messageLook; } // 1.2 has only the DOS game's icons
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
