// Spaceward Ho! web remake — the Palm OS skin (see js/skins.js)
//
// The art and look of Spaceward Ho! 5 for Palm OS (MobileFreon, 2003) on top
// of the classic skin's page: this file says which of the Palm pictures go
// where (window.HOTHEME, read by js/skins/classic/ui.js), then loads the
// classic skin. The pictures come from the .prc (tools/extract/palm.py);
// where each is used was read from its decompiled code (function names
// below are from that, see docs/palm-findings.md). The Palm game has no
// sampled sounds, so this skin is silent.
(function () {
'use strict';
const P = 'palm:';
const B = (n) => P + 'b' + n;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const trunc = Math.trunc;

const images = {
  p3030: 'b9403', p3040: 'b9401', // won, lost
  haloAlly: 'b3400', // an ally's colony: the gold halo (FUN_00014670)
};
// report pictures: the same numbers as 5.0.5's (FUN_000292f8)
for (let n = 9000; n <= 9052; n++) images['m' + n] = 'b' + n;
// hats (FUN_000145ac, FUN_00014670): your colonies 2801-2804 by how good
// the planet is (+4 for a woman); other players 2818 + their hat (+9 a woman)
for (let row = 0; row < 4; row++) for (const f of [0, 1]) images['white' + row + '_' + f] = 'b' + (2801 + row + 4 * f);
for (let n = 0; n < 16; n++) for (const f of [0, 1]) images['bad' + n + '_' + f] = 'b' + (2818 + (n % 9) + 9 * f);

window.HOTHEME = {
  dir: 'assets/skins/palm/',
  prefix: P,
  onlyOwnSounds: true, // no sounds at all
  images,
  select: B(3101), // the green ring, drawn under the selected star (FUN_000128e8)
  battlePlanet: B(6009),
  endTurnKey: null,
  // Stars on the map (FUN_000128e8, FUN_000144b4): an explored planet by its
  // gravity over your home's, x100: 251+ 2101, 201+ 2102, 126+ 2103, 76+ 2104,
  // 51+ 2105, 40+ 2106, else 2107. Unexplored 3000 (2706 if a fleet of yours
  // is on its way; 2708 if only a battle was seen there); a star turning red
  // 2712, then 2713, then 2714 (also once it has exploded). Hats go on top.
  starLook(look, { p, s, k }) {
    const b = look.base;
    if (/^nova/.test(b)) { const n = +b.slice(4); return { base: B(n <= 2 ? 2712 : n === 3 ? 2713 : 2714) }; }
    if (b === 'unknown') return { base: B(3000) };
    if (b === 'soon') return { base: B(2706) };
    if (b === 'battle') return { base: B(2708) };
    const src = look.hat && s.owner === p.id ? s : k;
    if (!src || src.g == null) return look;
    const r = trunc(Math.round(src.g * 100) * 100 / Math.max(1, Math.round(p.homeG * 100)));
    const size = r >= 251 ? 1 : r >= 201 ? 2 : r >= 126 ? 3 : r >= 76 ? 4 : r >= 51 ? 5 : r >= 40 ? 6 : 7;
    return { base: B(2100 + size), hat: look.hat };
  },
  // Ships (FUN_00030e04, FUN_000310a6): some designs have a picture of
  // their own; other satellites 6400-6404 by weapons; other ships three
  // 40x40 parts 20 px apart: engine 6200+ (range and speed), hull 6300+
  // (shields; 6003 a colony ship, 6015 a tanker), nose 6100+ (weapons).
  // 6105 and 6205 don't exist, so at the top levels that part isn't drawn,
  // as in the original.
  shipPic(d, IMG) {
    const W = d.W || 0, S = d.S || 0, R = d.R || 0, V = d.V || 0, M = d.M || 0;
    let one = null;
    if (d.type === 'bio') one = W < 7 ? 6000 : W >= 13 && W <= 15 ? 6001 : 6002;
    else if (d.type === 'scout' && W === 1) one = 6014;
    else if (d.type === 'dread') one = W > 30 ? 6006 : W === 8 && R >= 11 && R <= 13 && M > 1 ? 6005 : 6004;
    else if (d.type === 'fighter' && W < 9 && V > 5) one = 6007;
    else if (d.type === 'fighter' && W === 12 && S < 11) one = 6008;
    else if (d.type === 'satellite') {
      one = W === 5 && S >= 4 && S <= 6 ? 6010 : W === 15 && S >= 14 && S <= 16 ? 6011 : W < 9 && S >= 10 && S <= 14 ? 6012
        : S < 5 && W >= 16 && W <= 20 ? 6013 : 6400 + clamp(trunc((W - 1) / 6), 0, 4);
    }
    if (one != null) { // drawn onto a canvas, as the classic skin expects
      const im = IMG[B(one)]; if (!im || !im.width) return null;
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      c.getContext('2d').drawImage(im, 0, 0);
      return c;
    }
    const parts = [6200 + clamp(trunc((R + V - 8) / 5), 0, 5),
      d.type === 'colony' ? 6003 : d.type === 'tanker' ? 6015 : 6300 + clamp(trunc((S - 1) / 6), 0, 4),
      6100 + clamp(trunc((W - 1) / 5), 0, 5)];
    const c = document.createElement('canvas'); c.width = 80; c.height = 40;
    const x = c.getContext('2d');
    parts.forEach((n, i) => { const im = IMG[B(n)]; if (im && im.width) x.drawImage(im, i * 20, 0, 40, 40); });
    return c;
  },
  // the title screen: the Palm splash
  title(frame, IMG) {
    const t = IMG[B(1007)];
    if (!t || !t.width) return false;
    frame.width = t.width; frame.height = t.height;
    frame.getContext('2d').drawImage(t, 0, 0);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art of Spaceward Ho! 5 for Palm OS (MobileFreon, 2003). The Palm game had no sounds.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 5 Palm';
  },
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
