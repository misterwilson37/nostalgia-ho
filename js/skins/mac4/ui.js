// Spaceward Ho! web remake — the Mac 4.0.5 skin (see js/skins.js)
//
// Spaceward Ho! 4.0.5 for the Macintosh (Delta Tao, 1997) in black and
// white: the program's own 1-bit pictures and its sounds
// (tools/extract/mac4.py writes them to assets/skins/mac4). The colour
// skin (js/skins/mac4c) is this one with the pictures of its "Ho! 4.0
// Color Picts" file (assets/skins/mac4c, same names).
//
// 4.0.5's main screen is 3.0.1's: ResetWindows @8477a places the map window,
// its 226-pixel information column and the floating windows along the foot
// exactly as 3.0.1's @f4b9a does, with one window more (Chat, in the middle).
// So this skin runs the Mac skins' code (js/skins/mac12/ui.js) as version
// 4.0.5 (window.HOMAC4V: its 3.0.1 path, with 4.0.5's own routines where
// they differ, docs/status-mac405.md), and keeps here what is 4.0.5's own:
// its pictures, planets, report pictures, ship parts, title and End Turn
// button (window.HOMAC4, applied last by js/skins/mac3/pictures.js).
// 4.0 numbers its icons as the Windows 4.0.5 numbers its bitmaps (the
// Windows program was ported from it), so where each picture goes follows
// the Windows 4.0.5 skin (js/skins/w95/ui.js) until the Mac code says otherwise.
window.HOMAC4V = true;
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for a skin's pictures
const colour = !!window.HOMAC4_COLOUR;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const I = (n) => P + 'i' + n, PIC = (n) => P + 'p' + n;
// A 4.0 sound by its own number: 4.0 numbers its sounds differently from
// 5.0.5, whose numbers the remake plays by, so each of its files is also
// "m<number>" (SOUNDS.mac4 in js/skins.js)
const M = (n) => 'm' + n;
const fillNames = (name) => ['mac4', 'mac4c', 'classic'].map(v => 'fill/' + v + '-' + name); // stand-ins (js/skins/dos HOFILL)
const images = {
  debris: fillNames('debris'), nova18: fillNames('nova18'), // stand-ins: only 5.0.5 has these (tools/skins/fill_art.py)
  p3030: 'p3530', p3040: 'p3540', // game won, lost
  white0_0: 'i1405', white0_1: 'i1905', // you, in the Players window
};
for (let n = 0; n < 16; n++) { images['bad' + n + '_0'] = 'i' + (2000 + n); images['bad' + n + '_1'] = 'i' + (2500 + n); }

window.HOMAC4 = {
  dir: colour ? 'assets/skins/mac4c/' : 'assets/skins/mac4/',
  // its sounds: SOUNDS.mac4 (mac4c) in js/skins.js
  images,
  // the selection rings: PICT 502/503 (colour: the first frame of PICT 500)
  select: PIC(502), selectSmall: PIC(503),
  battlePlanet: I(1003), // "Explored Perfect"
  endTurnPic: PIC(5500), // the round End Turn button (pressed: 5501)
  endTurnYear: [17, 32, 27, 15, 60], // its black window, where 4.0 writes the year
  endTurnKey: '⌘T', // File menu: End Turn ⌘T
  // Planets, numbered as the Windows 4.0.5 picks them (js/skins/w95):
  // size by gravity against your home's, 1000-1006 explored (+100 mined
  // out, +200 icy, +250 hot), 1050-1056 yours losing money (+50 icy, +100
  // hot or mined out), 1405/1406 yours paying (+500 a woman), 1400
  // unexplored, 1401 a fleet on its way, 1402 a battle seen there, 1403 a
  // star turning red or exploding; others' planets show their faces.
  starLook(look, { G, p, s, k }) {
    const L = (n) => ({ base: I(n), scale: 1.3 });
    const b = look.base;
    if (b === 'unknown') return L(1400);
    if (b === 'soon') return L(1401);
    if (b === 'battle') return L(1402);
    if (/^nova(\d)$|^nova12$/.test(b)) return L(1403);
    if (b === 'nova18') return null; // the wreck: nothing of 4.0's (the classic picture)
    if (look.hat && look.hat.startsWith('bad')) {
      const [n, f] = look.hat.slice(3).split('_');
      return L((f === '1' ? 2500 : 2000) + (+n % 20));
    }
    const src = look.hat ? s : k;
    if (!src) return L(1400);
    const rg = Math.trunc(src.g * 100 / p.homeG);
    const size = rg < 39 ? 0 : rg < 60 ? 1 : rg < 85 ? 2 : rg < 120 ? 3 : rg < 175 ? 4 : rg < 257 ? 5 : 6;
    const goodG = size >= 2 && size <= 4;
    const cold = p.homeT - src.t >= 100, hot = src.t - p.homeT >= 100, minedOut = src.metal < 250;
    if (look.hat) { // yours
      if (HO.planetIncome(G, p, s) < 0) {
        let pic = 1050 + size;
        if (!goodG) { if (minedOut) pic += 100; } else if (cold) pic += 50; else if (hot) pic += 100;
        return L(pic);
      }
      // SetPlanetTypesForStar (@d020a): on 25 December the Christmas planet
      // (1404). The Mac compares the names Peter and Howard and then shows
      // the plain rich planet (cut); Full Hoedown puts Windows 4.0.5's
      // pictures back, from the Mac's own 3115 and 3116 (it has no woman's); in a game of
      // another version, "Every version's jokes" shows them too
      { const d = new Date(); if (d.getMonth() === 11 && d.getDate() === 25) return L(1404); }
      if (HO.hoedown(G) && (HO.ownRules(G).hoedown.pictures || HO.hoedownAll(G)) && HO.planetIncome(G, p, s) >= 30000 && (p.name === 'Peter' || p.name === 'Howard')) return L(p.name === 'Peter' ? 3115 : 3116);
      return L((HO.planetIncome(G, p, s) < 30000 ? 1406 : 1405) + (p.female ? 500 : 0));
    }
    let pic = 1000 + size; // explored, nobody's
    if (!goodG) { if (minedOut) pic += 100; } else if (cold) pic += 200; else if (hot) pic += 250;
    return L(pic);
  },
  // Report pictures and sounds: the Windows 4.0.5's choices (js/skins/w95)
  // with the Mac's icons and sounds, which have the same numbers and names
  messageLook(m, cur, { G, ME, starLook }) {
    const t = String(m.text || ''), me = G.players[ME];
    const own = 'i' + (me.female ? 1905 : 1405);
    const R = (icon, sound) => ({ icon: icon && P + icon, sound: sound && M(sound) });
    const face = (q) => q && !q.human ? 'bad' + q.face + '_' + (q.female ? 1 : 0) : P + own;
    const tech = ['Range', 'Speed', 'Weapon', 'Shield', 'Mini'].findIndex(n => new RegExp('Your ' + n + '\\w* Tech').test(t));
    if (!t.trim()) return R(own, 2001);
    if (/^Spaceward Ho! (by|Version)/.test(t)) return R('i3115', 7001); // (4.0.5's "Spaceward Ho! Version 4.0.3 by Peter Commons.": shot 008)
    if (/^Artwork by/.test(t)) return R('i3116', 7001); // (shot 008)
    if (m.hint) return R('i3170', 7001); // a help message, report 24 (GetIconID @151682: 3170)
    if (/^Click here/.test(t)) return R('i3116', 7001);
    if (tech >= 0) return R('i' + (3100 + tech), 2000);
    if (/radical|scientists|discover/i.test(t)) return R('i3105', 2000);
    if (/^Year \d+|updated to the year/.test(t)) return R('i3111', 7001);
    if (/population now exceeds/.test(t)) return R('i4024', 7019); // "Very good!"
    if (/suggests a big battle/.test(t)) return R('i3119', 7001);
    if (/has eaten .* people/.test(t)) return R('i4011', 7013); // biological eating
    if (/Valdez/.test(t)) return R('i3112', 5001);
    if (/armageddon device is on|activated the armageddon/i.test(t)) return R(own, 8000); // the scream
    if (m.battle) {
      if (/destroyed your colony/.test(t)) return R(own, 2001);
      if (/survived an enemy attack/.test(t)) return R(own, null);
      const b = G.battles.find(x => x.id === m.battle), o = b && b.sides.find(x => x !== ME && G.players[x]);
      return { icon: face(o != null && G.players[o]), sound: null };
    }
    if (m.chat) return { icon: I(3161), sound: M(/thank/i.test(t) ? 5002 : /sorry/i.test(t) ? 5003 : 7001) };
    if (/not receiving sufficient funds|isn.t getting enough money/.test(t)) return R('i4013', 3002);
    if (/will never become profitable/.test(t)) return R('i3112', 7001);
    if (/run out of metal\. You should/.test(t)) return R('i4022', 7001);
    if (/research|spending|money|funds/i.test(t)) return R('i4013', 7001);
    if (/scrapped|metal has fallen|recovered .* metal/.test(t)) return R('i3113', 7001);
    if (/has arrived|has stopped at|can no longer reach|waiting to refuel|wormhole/.test(t)) return R('i4011', 7001);
    if (/meteor|shock wave/i.test(t)) return R('i4015', 3003);
    if (/^You have explored/.test(t) && m.star != null) {
      return { icon: starLook(m.star).base, sound: M(m.explore === 'good' ? 6000 : m.explore === 'mediocre' ? 6002 : 6001) };
    }
    if (/baby boom/.test(t)) return R('i4017', 7001);
    if (/just become a profitable/.test(t)) return R(own, 2000);
    if (/You have colonized/.test(t)) return R(own, 7018); // "New colony"
    if (/supernova|armageddon/i.test(t)) return R('i3118', 7001);
    if (/You have just been eliminated/.test(t)) return R(own, 2001);
    if (/has just been eliminated/.test(t)) return R(own, 7021);
    if (/You won!/.test(t)) return R(own, 7021);
    if (/has just won the game/.test(t)) return R(own, 2001);
    if (/destroyed your colony/.test(t)) return R(own, 2001);
    if (/allies|ally|buddies|buddy/i.test(t)) return R('i3160', 7017); // "Best buddies, partner"
    if (/money|metal/i.test(t) && /gave|given|offers/.test(t)) return R('i3110', 7015); // "Here ye go"
    return R(own, 7001);
  },
  // Ship pictures: engine | hull | nose, 40x40 each, as in the Windows
  // 4.0.5 (2600 + range and speed, 2699 + shields or 2750 the colony pod
  // or 2758 the tanker's middle, 2850 + weapons); satellites 2901 +
  // weapons; whole 120x40 pictures for the dreadnought (2263, the first
  // frame of its animation), the biological (2261) and the basic scout
  // (2260); the two hidden designs 2751-2753 and 2754-2756.
  shipPic(d, IMG) {
    const im = (n) => IMG[PIC(n)];
    let parts;
    if (d.type === 'dread') parts = [im(2263)];
    else if (d.type === 'bio') parts = [im(2261)];
    else if (d.type === 'satellite') parts = [im(2901 + clamp(d.W - 1, 0, 25))];
    else if (d.type !== 'colony' && d.W === 10 && d.S === 10 && d.R >= 10) parts = [im(2751), im(2752), im(2753)];
    else if (d.type !== 'colony' && d.W === 13 && d.S === 13 && d.R >= 13) parts = [im(2754), im(2755), im(2756)];
    else if (d.type === 'scout' && d.W === 1 && d.S === 1) parts = [im(2260)];
    else parts = [im(2600 + clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? im(2750) : d.type === 'tanker' ? im(2758) : im(2699 + clamp(d.S - 1, 0, 25)), im(2850 + clamp(d.W - 1, 0, 29))];
    if (parts.some(x => !x || !x.width)) return null;
    const w = parts.reduce((a, x) => a + x.width, 0), h = Math.max(...parts.map(x => x.height));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); let at = 0;
    x.imageSmoothingEnabled = false;
    for (const pt of parts) { x.drawImage(pt, at, (h - pt.height) / 2); at += pt.width; }
    return c;
  },
  // The title: 4.0's start-up window (DLOG 1200), its splash (PICT 1003,
  // 304x200: "Spaceward Ho! Version 4" and the cowboy planet) over Open
  // Game, New Game and Quit. In colour the cowboy moves: the Color Picts'
  // frames 7000-7020 (231x128, the splash's lower right, at 73,72) and the
  // tapping foot 7021-7023 (83x73, bottom right), played as the Windows
  // 4.0.5 plays its frames 200-223, with 4.0's tap-foot (7024), spin-gun
  // (7023) and holster (7022) sounds.
  title(frame, IMG, Sound) {
    const splash = IMG[PIC(1003)];
    if (!splash || !splash.width) return false;
    frame.width = 304; frame.height = 200;
    const x = frame.getContext('2d');
    x.drawImage(splash, 0, 0);
    Sound.play(M(10000)); // "Move 'em out!", as 3.0.1 opens
    if (!colour || !IMG[PIC(7000)] || !IMG[PIC(7000)].width) return true;
    const show = (n) => {
      const im = IMG[PIC(n)]; if (!im) return;
      if (n >= 7021) { x.drawImage(splash, 221, 127, 83, 73, 221, 127, 83, 73); x.drawImage(im, 304 - im.width, 200 - im.height); return; }
      x.drawImage(im, 73, 72);
    };
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const seq = []; // [frame, ticks (1/60 s), sound]
    const build = () => {
      seq.push([7000, rnd(90, 120)]);
      if (rnd(1, 3) !== 3) { for (let t = rnd(1, 3); t > 0; t--) seq.push([7021, 5], [7022, 5], [7023, 5], [7022, 5, 7024]); seq.push([7000, rnd(90, 120)]); }
      seq.push([7001, 5], [7002, 5], [7003, 5], [7004, rnd(60, 90)], [7005, 5], [7006, 5], [7007, 5], [7008, rnd(60, 90)]);
      for (let spin = 0; spin < 2; spin++) {
        const fwd = Math.random() < 0.5;
        for (let r = rnd(1, 4); r > 0; r--) { const fr = [...Array(12).keys()].map(i => fwd ? 7009 + i : 7019 - i); fr.forEach((n, i) => seq.push([n, 2, i === 0 ? 7023 : null])); }
        seq.push([7008, rnd(60, 90)]);
      }
      for (let n = 7007; n >= 7000; n--) seq.push([n, n === 7004 ? rnd(15, 30) : 5, n === 7004 ? 7022 : null]);
    };
    const ts = document.getElementById('titlescreen');
    const gen = frame._gen = (frame._gen || 0) + 1; // a newer title screen takes over
    const tick = () => {
      if (!ts || ts.hidden || frame._gen !== gen) return; // the title screen has closed
      if (!seq.length) build();
      const [n, ticks, snd] = seq.shift();
      show(n); if (snd) Sound.play(M(snd));
      setTimeout(tick, ticks * 1000 / 60);
    };
    show(7000); setTimeout(tick, 600);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'With the art and sounds of Spaceward Ho! 4.0.5 for the Macintosh (Delta Tao, 1997): written by Peter Commons, art by Howard Vives and Bob Van de walle, sounds by Mark Madeley and Guy Vardaman.';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 4.0.5';
    // the start-up window's buttons (DITL 1200): Open Game, New Game
    const n = doc.querySelector('#tnew'), o = doc.querySelector('#tcont');
    if (n) n.textContent = 'New Game';
    if (o) { o.textContent = 'Open Game'; n.before(o); }
    const im = doc.querySelector('#timport'); if (im) im.textContent = 'Import a Game…';
    // inside the start-up window, under the splash
    const b = doc.querySelector('#titlescreen .tbtns'), w = doc.querySelector('#titlescreen .tsplash .wbody');
    if (b && w) w.append(b);
    // How to play: the remake's own, under the window (DITL 1200's third button is Quit; Import a Game… takes its place)
    const hp = doc.querySelector('#thelp'), sp = doc.querySelector('#titlescreen .tsplash');
    if (hp && sp) { const c = hp.cloneNode(true); c.id = 'thelp405'; c.className = 'quiet thelp405'; c.addEventListener('click', () => hp.click()); sp.after(c); }
  },
};
})();
// the Mac code (js/skins/mac12/ui.js, as 4.0.5 with window.HOMAC4V), which loads js/skins/mac3/pictures.js, which applies HOMAC4 last
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/mac12/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
