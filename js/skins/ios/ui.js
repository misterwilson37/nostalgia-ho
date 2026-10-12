// Spaceward Ho! web remake — the iOS skin (see js/skins.js)
//
// The art, sounds and look of Spaceward Ho! 1.2.9 for iPhone and iPad (Ariton
// Technologies, 2012; this build 2017) on top of the classic skin's page: this
// file says which of the app's pictures go where (window.HOTHEME, read by
// js/skins/classic/ui.js), then loads the classic skin. The pictures and
// sounds come from the app bundle (tools/extract/ios.py, assets/skins/ios/);
// almost all of them are Retina (@2x, -hd) pictures, drawn here at half their
// size. Where each is used was read from the app's code (docs/ios-findings.md,
// "Art and sound"); what wasn't read is marked as a guess. The app is
// landscape only, the map filling the screen with a sidebar of buttons at the
// right; the page keeps the classic layout with the panel moved to the right
// (style.css). A finger gets the app's gestures in every skin (ui.js, "touch").
(function () {
'use strict';
const P = 'ios:';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const trunc = Math.trunc;

const images = {
  p3030: 'Game_You_Won', p3040: 'Game_You_Lost', // the end of the game
  haloAlly: 'halo1', // an ally's colony (StarNode's halo)
};
// the report pictures: 5.0.5's message pictures 9000-9050 redrawn at 80 x 80
// (+[MessageNode reportIcon:] builds "report_icon-%ld")
for (let n = 0; n <= 50; n++) images['m' + (9000 + n)] = 'report_icon-' + n;
// hats: your colonies by how they pay (the classic skin's rows: paying, then
// losing money on a good, a semi-habitable and a hostile planet) are
// player_<row>_<m|f>; another player's, enemy_<hat>_<m|f> (16 hats)
for (let row = 0; row < 4; row++) for (const f of [0, 1]) images['white' + row + '_' + f] = `player_${row}_${f ? 'f' : 'm'}`;
for (let n = 0; n < 16; n++) for (const f of [0, 1]) images['bad' + n + '_' + f] = `enemy_${n}_${f ? 'f' : 'm'}`;
// fleet markers: fleet_dots_<self|self_unfueld|self_old|others>_<class>_<count>,
// the classic skin's four sets of your own (plain, not fully fuelled, old,
// both) and everyone else's; the app has no "old and unfuelled" set, so that
// one is the old set (a guess)
const DOT_SET = ['self', 'self_unfueld', 'self_old', 'self_old', 'others'];
for (let set = 0; set < 5; set++) for (let t = 0; t < 7; t++) for (let b = 0; b < 4; b++) images[`dot${set}_${t}_${b}`] = `fleet_dots_${DOT_SET[set]}_${t}_${b}`;

// The planet (-[PlanetNode update:temp:metal:] 0x100090e58, read in the
// disassembly for the format strings' arguments): "planet_%d%@", one of seven
// planets by its gravity against your home's (the 5.0.5 sizes: 252, 201,
// 126, 76, 51, 39 per cent), with "_mined" below 100 metal. T is 720 + its
// temperature less your home's, in tenths (StarNode updateFor:withStar:
// withGame: 0x10001af5c). Over 770 the hot cover at min(100, (T - 770) / 30)
// x 1.5 / 255 opacity; under 650 "ice_cover%d" with T / 130, held to 0-4
// (so the coldest planets have ice_cover0); with 100 metal or more
// "boulder_0%d", 5 less one for each of 1,000, 2,500, 5,000 and 10,000
// reached (100-999 boulder_05, 10,000 or more boulder_01). Each cover is cut
// to the planet's shape (the app scales them to the planet's size). Drawn at
// 120 pixels (the 240 pixel Retina art at half size).
const SIZE = 120;
const cache = {};
function row(p, g) {
  const pct = trunc(Math.round(g * 100) * 100 / Math.max(1, Math.round(p.homeG * 100)));
  return [252, 201, 126, 76, 51, 39].filter(v => pct < v).length;
}
// The supernova, as the app times it. The turn a star blows, the map runs
// SupernovaAnimate on it (-[MapLayer ...] 0x10000e4ec, the stars whose nova
// year, +0x14, is this year): a CCActionInterval of frames x delay of
// +[SupernovaAnimate animation] (0x1000a6664: "supernova0.png" to
// "supernova19.png", 20 frames, setDelay: 0.15, the float at 0x1000d64b8),
// so 3 seconds; update: shows frame min(trunc(20 t), 19) (0x1000a64e0) by
// -[StarNode supernova:]; stop (0x1000a6354) marks the star blown
// (superNovaState:withState:) and calls supernova: nil, which shows
// supernovaed and the star dust at opacity 255 and hides the name. Before it
// the star still shows supernova_going3 (its +0x14 is the year, over 90).
// After that, each turn (-[StarNode updateFor:withStar:withGame:]
// 0x10001af5c): while the star's dust (+0x12) is 1 or more, supernovaed and
// stardust at opacity min(255, trunc(255 x dust / 20)); at 0 neither, an
// empty place. The nova sets dust to 20 (0x100030c30) and every turn takes 1
// off (0x1000323c0, LIKELY after it, so 19 the nova's turn); a big battle
// sets it back to 20 (0x1000211f4, not built: the remake keeps no dust for
// battles). Drawn: stardust under the special.
const novaStart = {}, novaPics = {};
let novaTimer = 0;
function novaLook(G, p, s, k, IMG, redraw) {
  const n = ((s.owner === p.id ? s : k) || {}).nova || 0;
  if (n < 210) return null;
  const age = Math.max(0, G.year - n), dust = 19 - age;
  const im = (x) => IMG[P + x], ok = (x) => x && x.complete !== false && x.width;
  if (age === 0) {
    const key = (G.opts && G.opts.seed) + ':' + s.id + ':' + n;
    const now = (typeof performance !== 'undefined' ? performance : Date).now();
    if (novaStart[key] == null) novaStart[key] = now;
    const t = (now - novaStart[key]) / 1000;
    if (t < 3) {
      if (redraw && !novaTimer) novaTimer = setTimeout(() => { novaTimer = 0; redraw(); }, 150 - ((t * 1000) % 150) + 1);
      const f = 'supernova' + Math.min(19, Math.trunc(t / 0.15));
      return ok(im(f)) ? { base: P + f } : null;
    }
  }
  const ck = 'nova:' + Math.max(0, dust) + ':' + (age === 0);
  if (novaPics[ck]) return { base: P + 'supernovaed', pic: novaPics[ck] };
  const sp = im('supernovaed'), du = im('stardust');
  if (!ok(sp)) return null;
  const c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height;
  if (dust < 1) return { base: P + 'supernovaed', pic: (novaPics[ck] = c) }; // nothing left
  const x = c.getContext('2d');
  if (ok(du)) { x.globalAlpha = age === 0 ? 1 : Math.min(255, Math.trunc(255 * dust / 20)) / 255; x.drawImage(du, 0, 0, c.width, c.height); x.globalAlpha = 1; }
  x.drawImage(sp, 0, 0, c.width, c.height);
  return { base: P + 'supernovaed', pic: (novaPics[ck] = c) };
}
function planetPic(IMG, p, src) {
  const r = row(p, src.g), mined = src.metal < 100;
  const T = Math.round(src.t * 10) - Math.round(p.homeT * 10) + 720;
  const hot = T > 770 ? Math.min(100, trunc((T - 770) / 30)) * 1.5 / 255 : 0;
  const ice = T < 650 ? clamp(trunc(T / 130), 0, 4) : -1;
  const rock = mined ? 0 : 5 - [1000, 2500, 5000, 10000].filter(v => src.metal >= v).length;
  const key = [r, mined, Math.round(hot * 100), ice, rock].join(':');
  if (cache[key]) return cache[key];
  const base = IMG[P + `planet_${r}${mined ? '_mined' : ''}`];
  if (!base || !base.width) return null;
  const c = document.createElement('canvas'); c.width = c.height = SIZE;
  const x = c.getContext('2d');
  x.drawImage(base, 0, 0, SIZE, SIZE);
  const over = (im, alpha) => {
    if (!im || !im.width) return;
    const t = document.createElement('canvas'); t.width = t.height = SIZE;
    const tx = t.getContext('2d');
    tx.globalAlpha = alpha; tx.drawImage(im, 0, 0, SIZE, SIZE); tx.globalAlpha = 1;
    tx.globalCompositeOperation = 'destination-in'; tx.drawImage(base, 0, 0, SIZE, SIZE);
    x.drawImage(t, 0, 0);
  };
  if (rock) over(IMG[P + 'boulder_0' + rock], 1);
  if (hot) over(IMG[P + 'hot_cover'], hot);
  if (ice >= 0) over(IMG[P + 'ice_cover' + ice], 1);
  return (cache[key] = c);
}

// Ships: the app's ship sheet is 5.0.5's ship sheet (PICT 11000) redrawn at
// twice the size and cut into parts (ship-engine-n, ship-middle-n,
// ship-weapon-n, ship-satellite-n, the colony, tanker and dreadnought bodies
// and the special designs), so a ship is put together as the classic skin
// builds it (FUN_100ad750), every distance doubled.
const SPECIAL = { bio: ['bio-1', 'bio-2', 'bio-3'], dread: ['dreadnought-1', 'dreadnought-2'], fighter: ['fighter-1', 'fighter-2'], satellite: ['satellite-1', 'satellite-2', 'satellite-3', 'satellite-4'] };
function special(d) {
  const { R, V, W, S, M } = d, t = d.type;
  if (t === 'bio') return SPECIAL.bio[W < 7 ? 0 : (W > 12 && W < 16) ? 1 : 2];
  if (t === 'scout' && W === 1) return 'scout-1';
  if (t === 'dread' && W > 30) return SPECIAL.dread[0];
  if (t === 'dread' && W === 8 && R > 10 && R < 14 && M > 1) return SPECIAL.dread[1];
  if ((t === 'fighter' || t === 'decoy') && W < 9 && V > 5) return SPECIAL.fighter[0];
  if ((t === 'fighter' || t === 'decoy') && W === 12 && S < 11) return SPECIAL.fighter[1];
  if (t === 'satellite' && W === 5 && S > 3 && S < 7) return SPECIAL.satellite[0];
  if (t === 'satellite' && W === 15 && S > 13 && S < 17) return SPECIAL.satellite[1];
  if (t === 'satellite' && W < 9 && S > 9 && S < 15) return SPECIAL.satellite[2];
  if (t === 'satellite' && S < 5 && W > 15 && W < 21) return SPECIAL.satellite[3];
  return null;
}
function shipPic(d, IMG, rusty) {
  const im = (n) => IMG[P + n];
  const part = (k, v) => im(`ship-${k}-${clamp(v, 0, 29)}`);
  const ops = []; // [picture, x, y] around the ship's centre, in Retina pixels
  const sp = special(d);
  if (sp) { const p = im('ship-special-' + sp); if (!p || !p.width) return null; ops.push([p, -trunc(p.width / 2), -trunc(p.height / 2)]); }
  else if (d.type === 'satellite') ops.push([part('satellite', d.W - 1), -40, -40]);
  else {
    const eng = part('engine', (d.R || 0) + (d.V || 0) - 8), nose = part('weapon', d.W - 1);
    if (d.type === 'dread') {
      ops.push([im('ship-dreadnaught-middle'), -130, -88]);
      for (const [x, y] of [[104, -84], [104, 22], [130, -34]]) ops.push([nose, x, y]);
      for (const [x, y] of [[-182, -90], [-182, 16], [-208, -40]]) ops.push([eng, x, y]);
    } else {
      const body = d.type === 'colony' ? [im('ship-colony-middle'), -70, -56] : d.type === 'tanker' ? [im('ship-tanker-middle'), -64, -44] : [part('middle', d.S - 1), -40, -40];
      const l = body[1], r = body[1] + (body[0] ? body[0].width : 80);
      ops.push(body, [nose, r, -40], [eng, l - 80, -40]);
    }
  }
  if (ops.some(o => !o[0] || !o[0].width)) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [p, x, y] of ops) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + p.width); y1 = Math.max(y1, y + p.height); }
  // half size: the Retina parts on a canvas half as big
  const c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) / 2); c.height = Math.ceil((y1 - y0) / 2);
  const cx = c.getContext('2d');
  for (const [p, x, y] of ops) {
    if (!rusty || !im('ship-rust')) { cx.drawImage(p, (x - x0) / 2, (y - y0) / 2, p.width / 2, p.height / 2); continue; }
    // a design far behind its owner's research: the rust laid over each part (as 5.0.5's sheet)
    const t = document.createElement('canvas'); t.width = p.width; t.height = p.height;
    const tx = t.getContext('2d'); tx.drawImage(p, 0, 0);
    tx.globalCompositeOperation = 'source-atop'; tx.drawImage(im('ship-rust'), 0, 0);
    cx.drawImage(t, (x - x0) / 2, (y - y0) / 2, p.width / 2, p.height / 2);
  }
  return c;
}

window.HOTHEME = {
  dir: 'assets/skins/ios/',
  prefix: P,
  // its sounds are 5.0.5's recordings as MP3s: SOUNDS.ios in js/skins.js
  images,
  select: P + 'ring', // the green ring round the selected star
  fleetPath: 'ios', // a dragged fleet's route line (js/skins/classic/ui.js iosFleetPath)
  satRing: 'rgba(200,215,235,0.85)', // the satellites' grey oval (fleet_sat_oval), as a ring
  battlePlanet: P + 'ship-planet',
  battleBg: null,
  endTurnKey: null,
  // Stars (-[StarNode updateFor:withStar:withGame:] 0x10001af5c): an
  // unexplored star is planet-question, or planet-x when no owner is known
  // and a battle was seen there, or planet-exclamation when it is the end of
  // one of your fleets' routes (the last star of its path); a star turning
  // red (its nova count, star +0x14, not 0) is supernova_going1 under 71,
  // going2 under 91, else going3; a star gone supernova shows supernovaed
  // (-[StarNode supernova:] 0x10001ac78) after the explosion (novaLook
  // below). Planets: planetPic.
  starLook(look, { G, p, s, k, IMG, redraw }) {
    const b = look.base, B = (n) => ({ base: P + n, hat: look.hat });
    if (b === 'unknown' || b === 'soon') {
      const end = (f) => f.path && f.path.length ? f.path[f.path.length - 1] : f.dest != null ? f.dest : f.to;
      return B(G.fleets.some(f => f.owner === p.id && end(f) === s.id) ? 'planet-exclamation' : 'planet-question');
    }
    if (b === 'battle') return B('planet-x');
    if (/^nova\d$/.test(b)) { const n = ((s.owner === p.id ? s : k) || {}).nova || 0; return B(n < 71 ? 'supernova_going1' : n < 91 ? 'supernova_going2' : 'supernova_going3'); }
    if (b === 'nova12' || b === 'nova18') return novaLook(G, p, s, k, IMG, redraw) || B(b === 'nova12' ? 'supernova10' : 'supernovaed');
    const src = look.hat && s.owner === p.id ? s : k;
    if (!src || src.g == null) return look;
    const pic = planetPic(IMG, p, src);
    return pic ? { base: look.base, pic, hat: look.hat } : look;
  },
  shipPic(d, IMG, rusty) { return shipPic(d, IMG, rusty); },
  // the title: the app's welcome screen, its name down the side and the
  // cowboy planet (hoguy_0-19) twirling his six-gun
  title(frame, IMG, Sound) {
    const name = IMG[P + 'spacewardho_name'], guy = (n) => IMG[P + 'hoguy_' + n];
    if (!name || !name.width || !guy(0) || !guy(0).width) return false;
    frame.width = 400; frame.height = 300;
    const x = frame.getContext('2d');
    const paint = (n) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, 400, 300);
      x.drawImage(name, 8, 4, name.width * 292 / name.height, 292);
      x.fillStyle = '#fff'; x.fillRect(84, 20, 300, 260);
      const g = guy(n); if (g) x.drawImage(g, 84 + (300 - g.width * 1.25) / 2, 20 + (260 - g.height * 1.25) / 2, g.width * 1.25, g.height * 1.25);
    };
    paint(0);
    const ts = document.getElementById('titlescreen'), gen = frame._gen = (frame._gen || 0) + 1;
    let i = 0;
    const tick = () => {
      if (!ts || ts.hidden || frame._gen !== gen) return;
      paint(i % 20); if (i % 20 === 10) Sound.play(7023);
      i++;
      if (i > 60) { paint(0); Sound.play(7022); i = 0; setTimeout(tick, 4000); return; }
      setTimeout(tick, 110);
    };
    setTimeout(tick, 900);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 1.2.9 for iPhone and iPad (Ariton Technologies, 2012). Art by Howard Vives and Bob Van de walle.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho!';
    doc.documentElement.classList.add('skin-ios');
  },
};
// a skin built on this one (js/skins/android/ui.js) adjusts the theme here
if (window.HOTHEME_VARIANT) window.HOTHEME_VARIANT(window.HOTHEME);
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
