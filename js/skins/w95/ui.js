// Spaceward Ho! web remake — the 4.0.5 skin (see js/skins.js)
//
// The art, sounds and look of Spaceward Ho! 4.0.5 for Windows 95 (New World
// Computing, 1996) on top of the classic skin's page: this file says which
// of the 4.0.5 pictures and sounds go where (window.HOTHEME, read by
// js/skins/classic/ui.js), then loads the classic skin. The pictures and
// sounds come from SPACEHO.EXE (tools/extract/win95.py); where each is used
// was read from its decompiled code (function names below are from that).
// Anything 4.0.5 has no picture for is drawn as in the classic skin.
(function () {
'use strict';
const P = 'w95:';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const B = (n) => P + 'b' + n;

window.HOTHEME = {
  dir: 'assets/skins/w95/',
  prefix: P,
  // 4.0.5 names its sounds (FUN_0046fe1b and the callers of FUN_0042f8bf);
  // here they stand in for the classic skin's numbered ones
  onlyOwnSounds: true,
  sounds: {
    2000: 'burst', 2001: 'shucks', // good / bad news
    3000: 'softhit', 3001: 'medhit', 3002: 'hit', 3003: 'explode', // battle shots
    4000: 'whoa', 4001: 'hyahh', // fleet stays / goes
    5000: 'message', 5001: 'buddy', 5002: 'awww', 5003: 'shucks', // messages and pacts
    6000: 'goodmmm', 6001: 'bad', 6002: 'medex', // exploring: good, worthless, so-so
    7001: 'click', 7002: 'abandon', 7003: 'scrap', 7004: 'click', 7006: 'click', 7007: 'burst',
    7013: 'click', 7014: 'click', 7015: 'click', 7016: 'whoa', 7017: 'click', 7018: 'click', 7019: 'burst',
    7020: 'shucks', 7021: 'wow', 8000: 'explode', 128: 'hyahh', 11111: null, 7022: null, 7023: null,
  },
  images: Object.assign({
    p3030: 'b3000', p3040: 'b3010', // won / eliminated (FUN_00470dec)
    white0_0: 'b1405', white0_1: 'b1905', // you, in the Players window
  }, faces()),
  // the selection ring: frame 0 of bitmap 175 (FUN_00493baa)
  select: P + 'selbig', selectSmall: P + 'selsmall',
  satRing: '#ffffff', // your satellites: a white circle (FUN_0048dea0)
  // fleets sitting at a star: icon 10114 (FUN_0048e55e); nothing for satellites
  marker: (f) => (f.sat ? null : B(10114)),
  endTurnPic: B(368), // the End Turn clock (FUN_004903ea)
  battlePlanet: B(1003),
  // Planets (FUN_00438f47). Size by gravity against your home's; yours with
  // a hat when losing money (icy or hot versions), the rich ones when paying
  // their way; explored empty ones icy/hot/mined; faces for other players.
  starLook(look, { G, p, s, k }) {
    const L = (n) => ({ base: B(n), scale: 1.3 });
    const b = look.base;
    if (b === 'unknown') return L(1400);
    if (b === 'soon') return L(1401);
    if (b === 'battle') return L(2020);
    if (/^nova(\d)$|^nova12$/.test(b)) return L(1403); // turning red, exploding
    if (b === 'nova18') return null; // the wreck: classic picture
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
      return L((HO.planetIncome(G, p, s) < 30000 ? 1406 : 1405) + (p.female ? 500 : 0));
    }
    let pic = 1000 + size; // explored, nobody's
    if (!goodG) { if (minedOut) pic += 100; } else if (cold) pic += 200; else if (hot) pic += 250;
    return L(pic);
  },
  // Report pictures and sounds (FUN_0046f8cc, FUN_0046fe1b), matched here
  // by the report's text
  messageLook(m, cur, { G, ME, starLook }) {
    const t = String(m.text || ''), me = G.players[ME];
    const own = 'b' + (me.female ? 1905 : 1405);
    const R = (icon, sound) => ({ icon: icon && P + icon, sound });
    const face = (q) => q && !q.human ? 'bad' + q.face + '_' + (q.female ? 1 : 0) : P + own;
    const tech = ['Range', 'Speed', 'Weapon', 'Shield', 'Mini'].findIndex(n => new RegExp('Your ' + n + '\\w* Tech').test(t));
    if (/^Spaceward Ho! by/.test(t)) return R('b3115', 'click');
    if (/^Click here/.test(t)) return R('b3116', 'click');
    if (tech >= 0) return R('b' + (3100 + tech), 'burst');
    if (/radical|scientists|discover/i.test(t)) return R('b3105', 'burst');
    if (/^Year \d+|updated to the year/.test(t)) return R('b3111', 'click');
    if (/population now exceeds/.test(t)) return R('b4024', 'verygood');
    if (/suggests a big battle/.test(t)) return R('b3119', 'click');
    if (/has eaten .* people/.test(t)) return R('b4011', 'biochomp');
    if (/Valdez/.test(t)) return R('b3112', 'sonofa');
    if (/armageddon device is on|activated the armageddon/i.test(t)) return R(own, 'scream');
    if (m.battle) {
      const b = G.battles.find(x => x.id === m.battle), o = b && b.sides.find(x => x !== ME && G.players[x]);
      return { icon: face(o != null && G.players[o]), sound: null };
    }
    if (m.chat) return { icon: P + 'b3161', sound: /thank/i.test(t) ? 'thanks' : /sorry/i.test(t) ? 'sorry' : 'click' };
    if (/not receiving sufficient funds|isn.t getting enough money/.test(t)) return R('b4013', 'hit');
    if (/will never become profitable/.test(t)) return R('b3112', 'click');
    if (/run out of metal\. You should/.test(t)) return R('b4022', 'click');
    if (/research|spending|money|funds/i.test(t)) return R('b4013', 'click');
    if (/scrapped|metal has fallen|recovered .* metal/.test(t)) return R('b3113', 'click');
    if (/has arrived|has stopped at|can no longer reach|waiting to refuel|wormhole/.test(t)) return R('b4011', 'click');
    if (/meteor|shock wave/i.test(t)) return R('b4015', 'explode');
    if (/^You have explored/.test(t) && m.star != null) {
      const sound = m.explore === 'good' ? 'goodmmm' : m.explore === 'mediocre' ? 'medex' : 'bad';
      return { icon: starLook(m.star).base, sound };
    }
    if (/baby boom/.test(t)) return R('b4017', 'click');
    if (/just become a profitable/.test(t)) return R(own, 'burst');
    if (/You have colonized/.test(t)) return R(own, 'colony');
    if (/supernova|armageddon/i.test(t)) return R('b3118', 'click');
    if (/You have just been eliminated/.test(t)) return R(own, 'shucks');
    if (/has just been eliminated/.test(t)) return R(own, 'wow');
    if (/You won!/.test(t)) return R(own, 'wow');
    if (/has just won the game/.test(t)) return R(own, 'shucks');
    if (/destroyed your colony/.test(t)) return R(own, 'shucks');
    if (/allies|ally|buddies|buddy/i.test(t)) return R('b3160', 'buddy');
    if (/money|metal/i.test(t) && /gave|given|offers/.test(t)) return R('b3110', 'hereyago');
    return R(own, 'click');
  },
  // Ship pictures (FUN_00419e79): engine | hull | nose, 40x40 each, flying
  // right; colony ships carry the pod, tankers the tank; satellites,
  // dreadnoughts, biologicals and the basic scout have pictures of their own;
  // two hidden designs get special pictures.
  shipPic(d, IMG) {
    const im = (n) => IMG[B(n)];
    let parts;
    if (d.type === 'dread') parts = [im(7260)];
    else if (d.type === 'bio') parts = [im(2761)];
    else if (d.type === 'satellite') parts = [im(2901 + clamp(d.W - 1, 0, 25))];
    else if (d.type !== 'colony' && d.W === 10 && d.S === 10 && d.R >= 10) parts = [im(2751), im(2752), im(2753)];
    else if (d.type !== 'colony' && d.W === 13 && d.S === 13 && d.R >= 13) parts = [im(2754), im(2755), im(2756)];
    else if (d.type === 'scout' && d.W === 1 && d.S === 1) parts = [im(2762)];
    else parts = [im(2600 + clamp(d.R + d.V - 8, 0, 23)), d.type === 'colony' ? im(2750) : d.type === 'tanker' ? im(2758) : im(2699 + clamp(d.S - 1, 0, 25)), im(2850 + clamp(d.W - 1, 0, 29))];
    if (parts.some(x => !x || !x.width)) return null;
    const w = parts.reduce((a, x) => a + x.width, 0), h = Math.max(...parts.map(x => x.height));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); let at = 0;
    for (const pt of parts) { x.drawImage(pt, at, (h - pt.height) / 2); at += pt.width; }
    return c;
  },
  // The "Version 4" title animation (FUN_0041f840): the cowboy planet taps
  // his foot, draws, twirls his six-gun and holsters it. Frames 200-220 are
  // 240x128, 221-223 (the foot) 96x73 at the bottom right. 1 tick = 1/60 s.
  title(frame, IMG, Sound) {
    if (!IMG[B(200)] || !IMG[B(316)]) return false;
    // The splash is bitmap 316 (304x200); the animation frames are its lower
    // right part (the cowboy from the shoulders down), 240x128, drawn over it
    // at (73, 72). Their last 12 columns are a border, left off here.
    frame.width = 304; frame.height = 200;
    const x = frame.getContext('2d');
    x.drawImage(IMG[B(316)], 0, 0);
    const show = (n) => {
      const im = IMG[B(n)]; if (!im) return;
      if (n >= 221) { x.drawImage(im, 73 + 240 - im.width, 72 + 128 - im.height); return; }
      x.drawImage(im, 0, 0, 228, 128, 73, 72, 228, 128);
    };
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const seq = []; // [frame, ticks, sound]
    const build = () => {
      seq.push([200, rnd(90, 120)]);
      if (rnd(1, 3) !== 3) { for (let t = rnd(1, 3); t > 0; t--) seq.push([221, 5], [222, 5], [223, 5], [222, 5, 'tapfoot']); seq.push([200, rnd(90, 120)]); }
      seq.push([201, 5], [202, 5], [203, 5], [204, rnd(60, 90)], [205, 5], [206, 5], [207, 5], [208, rnd(60, 90)]);
      for (let spin = 0; spin < 2; spin++) {
        const fwd = Math.random() < 0.5;
        for (let r = rnd(1, 4); r > 0; r--) { const fr = fwd ? [...Array(12).keys()].map(i => 209 + i) : [...Array(12).keys()].map(i => 219 - i); fr.forEach((n, i) => seq.push([n, 2, i === 0 ? 'spingun' : null])); }
        seq.push([208, rnd(60, 90)]);
      }
      for (let n = 207; n >= 200; n--) seq.push([n, n === 204 ? rnd(15, 30) : 5, n === 204 ? 'holster' : null]);
    };
    const ts = document.getElementById('titlescreen');
    const gen = frame._gen = (frame._gen || 0) + 1; // a newer title screen takes over
    const tick = () => {
      if (!ts || ts.hidden || frame._gen !== gen) return; // the title screen has closed
      if (!seq.length) build();
      const [n, ticks, snd] = seq.shift();
      show(n); if (snd) Sound.play(snd);
      setTimeout(tick, ticks * 1000 / 60);
    };
    show(200); setTimeout(tick, 600);
    return true;
  },
  page(doc) {
    const c = doc.querySelector('#titlescreen .credit');
    if (c) c.textContent = 'A personal web remake with the art and sounds of Spaceward Ho! 4.0.5 for Windows 95 (New World Computing, 1996).';
    const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho! 4';
  },
};
// computer players' faces: the classic skin's 16 hats become 4.0.5's planet faces
function faces() {
  const o = {};
  for (let n = 0; n < 16; n++) { o['bad' + n + '_0'] = 'b' + (2000 + n); o['bad' + n + '_1'] = 'b' + (2500 + n); }
  return o;
}
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/classic/ui.js"><\/script>');
})();
