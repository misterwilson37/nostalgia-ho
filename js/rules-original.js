// Spaceward Ho! web remake — the "Original" ruleset.
//
// Formulas recovered from the Spaceward Ho! 5.0.5 PowerPC program
// (Contents/MacOS/Spaceward Ho!). FUN_xxxxxxxx names in comments are the
// Ghidra addresses of the original routines; docs/original-findings.md
// explains each rule in plain English.
//
// Units: population is kept in the original's whole units (1 unit = 1,000
// people) and mirrored into star.pop (millions) for the rest of the app.
// Temperatures are compared in tenths of a degree and gravity in
// hundredths, as the original does. Distances are whole light-years,
// 2 ly per map unit, so the original's starting Range 6 / Speed 2 fit the
// same maps as the Claude ruleset.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, clamp, msg, fmt, colonies, know, observe, getDesign, findOrCreateDesign, designName,
  fleetCount, fleetHas, fleetDesigns, fleetMaxRange, fleetLabel, addShipsToStar, techSum, seenG, seenT,
  DATA, TECHS, isAllied, scrapFleet, evacuate } = E;
const trunc = Math.trunc;

// ---------- constants ----------
const LY_PER_UNIT = 2;
const SIZES = { small: [24, 13, 9], medium: [42, 17, 12], large: [70, 23, 15], huge: [110, 30, 20] };
// Hit chance (%) by weapons minus shields; index = clamp(W - S + 25, 0, 50). Table at 0x100df00c.
const HIT = [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 8, 9, 10, 12, 15, 19, 25, 35, 50,
  64, 74, 80, 84, 87, 89, 90, 91, 92, 93, 93, 94, 94, 95, 95, 95, 95, 96, 96, 96, 96, 96, 96, 96, 96];
const hit = (d) => HIT[clamp(d + 25, 0, 50)];
// Home system table (FUN_1006f640)
const START = {
  outpost:  { rank: 1, sav: 1000,   inc: 1000,  metal: 0,     pop: 200000, pinc: 8000 },
  barren:   { rank: 2, sav: 5000,   inc: 20000, metal: 500,   pop: 350000, pinc: 20000 },
  backward: { rank: 3, sav: 10000,  inc: 20000, metal: 2500,  pop: 350000, pinc: 20000 },
  normal:   { rank: 4, sav: 25000,  inc: 30000, metal: 5000,  pop: 500000, pinc: 30000 },
  advanced: { rank: 5, sav: 50000,  inc: 41000, metal: 12000, pop: 625000, pinc: 41000 },
  thriving: { rank: 6, sav: 100000, inc: 51000, metal: 20000, pop: 750000, pinc: 51000 },
  abundant: { rank: 7, sav: 250000, inc: 51000, metal: 30000, pop: 750000, pinc: 51000 },
};
const TECHLABEL = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shield', mini: 'Miniaturization' };
const TECHICON = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' };

const popU = (s) => Math.round(s.pop * 1000);
const setPopU = (s, u) => { s.pop = Math.max(0, u) / 1000; };
const g100 = (g) => Math.max(1, Math.round(g * 100));
const t10 = (t) => Math.round(t * 10);

// ---------- geometry (FUN_100589f0) ----------
// Each Armageddon shrinks every distance to 3/4 (never below 3).
function distance(G, a, b) {
  if (a === b) return 0;
  let d;
  if (a.x10 != null && b.x10 != null) d = dist10(a, b); // positions in tenths, as the original keeps them
  else {
    const dx = Math.abs(a.x - b.x) * LY_PER_UNIT, dy = Math.abs(a.y - b.y) * LY_PER_UNIT;
    d = Math.max(1, Math.ceil(Math.max(dx, dy) + Math.min(dx, dy) / 3 - 1e-9));
  }
  for (let i = 0; i < (G.armageddons || 0); i++) d = Math.max(3, trunc((d * 3 + 3) / 4));
  return d;
}

// ---------- planets ----------
// Gravity ratio (%, >= 100), temperature gap (tenths of a degree), and the
// "hostility" figure H that drives both maximum population and upkeep.
function hab(p, s) {
  const gp = g100(p.homeG), gs = g100(s.g);
  const gR = gs < gp ? trunc(gp * 100 / gs) : trunc(gs * 100 / gp);
  const dT = Math.abs(t10(p.homeT) - t10(s.t));
  return { gR, dT, H: trunc(((gR - 100) * 12000 + dT * dT) / 100) };
}
// FUN_10077200: max population = max(10, 500000 - 12 H), +10% with the radical bonus
function maxPopU(p, s) {
  let m = Math.max(10, 500000 - 12 * hab(p, s).H);
  if (p.flags.pop) m = trunc(m * 11 / 10);
  return m;
}
// FUN_10077200: colony income
function incomeU(u, H) {
  const mult = u > 0 ? Math.max(1, Math.log(Math.sqrt(u))) : 1;
  return trunc(u * mult / 76) - trunc(7500 + u * (100 + H / 40) / 10000);
}
function planetIncome(G, p, s) { return incomeU(popU(s), hab(p, s).H); }
// "never profitable": gravity over 2.56 times (or under 1/2.56 of) home's
function planetClass(G, gs) {
  if (gs > 2.56 || gs < 1 / 2.56) return 'inhospitable';
  if (gs > 2.0 || gs < 0.5) return 'semi';
  return 'good';
}

// FUN_1006f280: new star (temperature -200..400 F, gravity in octave bands, metal)
function newStar(G) {
  const t = RI(G, -2000, 4000) / 10;
  const k = RI(G, 0, 3);
  const g = RI(G, 25 * (1 << k), 25 * (1 << (k + 1))) / 100;
  const metal = RI(G, 1, 5) < 4 ? RI(G, 0, 8000) : RI(G, 8000, 30000);
  return { g, t, metal };
}

// ---------- money (FUN_10054de0) ----------
function interestOn(p, sav) {
  if (sav < 0) {
    const rate = p.flags.borrow ? 10 : 15;
    return sav < -10000000 ? trunc(sav / 100) * rate : trunc(sav * rate / 100);
  }
  let i = trunc(10 * Math.sqrt(sav));
  if (sav < i) i = trunc(sav / 2);
  if (p.flags.save) i += trunc(i / 2);
  return i;
}
// mining (FUN_10055d90 / FUN_10055e30)
const mineMetal = (p, money) => trunc((p.flags.mining ? 25 : 20) * Math.sqrt(Math.max(0, money)));
function mineMoney(p, metal) {
  const k = p.flags.mining ? 625 : 400;
  return metal < 25001 ? trunc(metal * metal / k) : trunc(metal / k) * metal;
}
// terraforming: cost of moving dT tenths of a degree, and tenths moved for `money` (FUN_10073d70)
const terraCost = (p, dT) => p.flags.terra ? trunc(dT * dT * 8 / 7) : trunc(dT * dT * 3 / 2);
const terraStep = (p, money) => trunc(Math.sqrt(p.flags.terra ? money * 7 / 8 : money * 2 / 3));
function borrowLimit(G, p) { return -5 * Math.max(p.oInc || 0, 0); }

// ---------- research (FUN_10074f90) ----------
function techLevelCost(k, L) {
  if (k === 'range') return trunc(trunc(Math.pow(L, 2.5)) / 3);
  if (k === 'speed') return (L + 6) * (L + 6);
  if (k === 'weapons' || k === 'shields') return (L + 2) * (L + 2);
  return (L + 7) * (L + 7); // mini, radical
}
function research(G, p, spend) {
  if (p.flags.research) spend += trunc(spend / 10);
  let tot = 0; for (const k of TECHS) tot += p.talloc[k] || 0;
  if (tot <= 0) return;
  for (const k of TECHS) {
    const s = trunc(spend * (p.talloc[k] || 0) / tot);
    const div = k === 'mini' || k === 'radical' ? 200 : 150;
    let pts = trunc((k === 'radical' ? 0.5 : 0.8) * Math.sqrt(trunc(s / div)));
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100;
      const cost = techLevelCost(k, L);
      const need = trunc(frac * cost / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += cost > 0 ? trunc(pts * 100 / cost) : 100; pts = 0; }
    }
    const lvl = trunc(p.tprog[k] / 100);
    if (lvl > p.tech[k] && p.tech[k] < 50) {
      p.tech[k] = Math.min(50, lvl);
      if (p.tprog[k] > 6000) p.tprog[k] = 6000;
      if (k === 'radical') { radical(G, p); continue; }
      techMsg(G, p, k);
      const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k);
    }
  }
}
function techMsg(G, p, k) {
  const nm = E.rules(G).plainTechMessages ? null : (DATA.techNames[k] || [])[p.tech[k] - 1];
  msg(G, p.id, nm && !/^\d+$/.test(nm) ? `You now have ${nm} ${TECHLABEL[k]} Technology (${p.tech[k]}).` : `Your ${TECHLABEL[k]} Technology has reached level ${p.tech[k]}.`, { icon: TECHICON[k], tech: k });
}

// ---------- radical tech (FUN_10079360, deck refill FUN_1007a180) ----------
// Each player holds up to 4 pending discoveries, drawn with these weights (%);
// each new Radical level plays one of them at random.
const RADICAL = ['metal', 'explore', 'money', 'mining', 'pop', 'terra', 'generals', 'recycle', 'research', 'save', 'borrow',
  'decoy', 'bio', 'steal', 'protos', 'range', 'speed', 'weapons', 'shields', 'mini'];
const RADICAL_WEIGHT = [7, 5, 7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 6, 6, 5, 5, 5, 5, 5];
const FLAG_OF = { mining: 'mining', pop: 'pop', terra: 'terra', generals: 'generals', recycle: 'recycle', research: 'research', save: 'save', borrow: 'borrow' };
function radicalAllowed(G, p, i) {
  const k = RADICAL[i];
  if (k === 'explore') return G.stars.filter(s => !know(G, p, s.id).explored).length > 5;
  if (k === 'mining') return !p.flags.mining && G.year >= 3000; // only from the year 3000 (FUN_1007a180 case 3: year >= 0xbb8)
  if (k === 'generals') return !p.flags.generals && !!G.opts.luck;
  if (FLAG_OF[k]) return !p.flags[FLAG_OF[k]];
  if (k === 'decoy') return p.human && !!G.opts.alliances;
  return true;
}
function refillDeck(G, p) {
  let guard = 0;
  while (p.deck.length < 4 && guard++ < 200) {
    let r = RI(G, 0, 99), i = 0;
    while (r >= RADICAL_WEIGHT[i]) { r -= RADICAL_WEIGHT[i]; i++; }
    if (!p.deck.includes(i) && radicalAllowed(G, p, i)) p.deck.push(i);
  }
}
function radical(G, p) {
  msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010' });
  const say = (t, icon) => msg(G, p.id, t, { icon: icon || 'm9010', sound: 7007 });
  for (let tries = 0; tries < 25; tries++) {
    const i = p.deck.length && tries < 20 ? p.deck.splice(RI(G, 0, p.deck.length - 1), 1)[0] : RI(G, 0, 19);
    const k = RADICAL[i];
    const live = p.designs.filter(d => !d.scrapped).length;
    if (k === 'metal') {
      const m = RI(G, 9000, 11000); p.metal += m;
      const n = colonies(G, p.id).length;
      say(`Your mining consortium has just been able to extract an additional ${fmt(is505(G) ? trunc(m / Math.max(1, n)) : n < 3 ? m : m / Math.max(1, n))} metal from every planet you have.`, 'm9046'); // 5.0.5 (case 0 @100795f4): metal / colonies
    } else if (k === 'explore') {
      let n = RI(G, 6, 9), i2 = RI(G, 0, G.stars.length - 1);
      for (let c = 0; n > 0 && c < G.stars.length; c++) {
        const s = G.stars[i2];
        if (!s.nova && !know(G, p, s.id).explored) { observe(G, p, s.id); n--; }
        i2 = (i2 + RI(G, 1, 3)) % G.stars.length;
      }
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018');
    } else if (k === 'money') {
      const m = trunc((p.oInc || 0) * RI(G, 20, 120) / 10); p.savings += m;
      say(`You have found a wealth of precious metals and have increased your savings by $${fmt(m)}`, 'm9048');
    } else if (FLAG_OF[k]) {
      p.flags[FLAG_OF[k]] = true;
      const text = {
        mining: ['Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.', 'm9046'],
        pop: ['Your sociologists have discovered how to safely increase the maximum population of your planets!', 'm9044'],
        terra: ['Your climatologists have discovered how to terraform planets more efficiently.', 'm9045'],
        generals: ['Your military training program has improved. Your generals are now smarter.', 'm9041'],
        recycle: ['You have improved your recycling program. You can now get more metal from scrapped ships.', 'm9014'],
        research: ['You have built a new research facility; tech spending is now 10% more effective.', 'm9039'],
        save: ['You\'ve raised the prime lending rate and can now earn 50% higher interest on savings.', 'm9048'],
        borrow: ['You have renegotiated your line of credit and can now borrow at a 50% better interest rate.', 'm9047'],
      }[k];
      say(text[0], text[1]);
    } else if (k === 'decoy' || k === 'bio') {
      if (live >= 24) continue;
      const t = p.tech;
      if (k === 'decoy') { // a fake Fighter that shows off better numbers than you have
        p.hasDecoy = true;
        findOrCreateDesign(G, p, { type: 'decoy', R: t.range + 1, V: Math.max(2, trunc(t.speed / 3)), W: t.weapons + 2, S: t.shields + 2, M: -1 });
        say('Your scientists have invented a decoy ship. It can\'t fight, but it\'s cheap. Amaze your friends and confuse your enemies.', 'm9049');
      } else {
        p.hasBio = true;
        findOrCreateDesign(G, p, { type: 'bio', R: Math.max(1, t.range - 2), V: Math.max(1, t.speed - 1), W: Math.max(1, t.weapons - 1), S: Math.max(1, t.shields - 1), M: 0 });
        say('Your mad scientists have created a space monster ship! It\'s not too powerful, but it doesn\'t cost any metal!', 'm9026');
      }
    } else if (k === 'steal') {
      const order = [0, 1, 2, 3, 4].map(j => ['range', 'speed', 'weapons', 'shields', 'mini'][j]);
      const s0 = RI(G, 0, 4); let got = false;
      for (let j = 0; j < 5 && !got; j++) {
        const t = order[(s0 + j) % 5];
        let best = null; for (const q of G.players) if (q.alive && !q.surrendered && q.tech[t] > p.tech[t]) best = q;
        if (best) { p.tech[t] = best.tech[t]; got = true; say(`Your spies have stolen some technological secrets from ${best.name}!`, 'm9040'); techMsg(G, p, t); }
      }
      if (!got) continue;
    } else if (k === 'protos') {
      if (live + 6 > 24) continue;
      for (const type of ['scout', 'fighter', 'satellite', 'colony', 'tanker', 'dread']) {
        const d = findOrCreateDesign(G, p, aiSpec(p, type)); if (d.built === 0) d.free = true;
      }
      say('Your ship technicians have designed a set of new ships with no development cost.', 'm9047');
    } else { // a tech jumps two levels (research has to catch up before it rises again)
      p.tech[k] = Math.min(50, p.tech[k] + 2);
      msg(G, p.id, `Your ${{ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k]} technology just jumped to ${p.tech[k]}.`, { icon: TECHICON[k], sound: 7007, tech: k });
    }
    break;
  }
  refillDeck(G, p);
  // CONFIRMED (FUN_10079360 @1007a128-1007a15c): the hand is dealt again and
  // "Your Radical researchers are hard at work on another discovery!" (0x466)
  if (is505(G)) msg(G, p.id, 'Your Radical researchers are hard at work on another discovery!', { icon: 'm9010', quiet: true });
}

// ---------- ships (FUN_1007de60) ----------
function designCost(G, d) {
  const decoy = d.type === 'decoy';
  const M = Math.max(0, d.M | 0), Rr = d.R | 0, V = d.V | 0, W = d.W | 0, S = d.S | 0;
  const mm = (M + 1) * 0.5 + 0.5;               // money multiplier, metal divisor
  const mmMetal = d.type === 'scout' ? mm + 0.5 : mm;
  let B;
  if (d.type === 'satellite') B = 2 * 2.381 * (13 + W) * (26 + S);
  else if (decoy) B = 17 * (14 + 4 + 14 + 10 + Rr + V) / 0.36;
  else B = (13 + W) * (S + 14 + 14 + 10 + Rr + V) / 0.36;
  let money, proto, metal, hp;
  if (d.type === 'colony' || d.type === 'tanker') {
    const extra = d.type === 'colony' ? 45000 : 22500;
    money = trunc(mm * B + extra); proto = trunc(2 * mm * (mm * B + extra));
    metal = trunc((d.type === 'colony' ? 3000 : 1500) + B / (3 * mmMetal));
    hp = trunc((d.type === 'colony' ? 1000 : 500) + B / 3);
  } else if (d.type === 'bio') {
    money = trunc(8 * B); proto = trunc(40 * B); metal = 0; hp = trunc(B / 3);
  } else {
    money = trunc(mm * B); proto = trunc(4 * mm * mm * B);
    metal = trunc(B / (3 * mmMetal)); hp = trunc(B / 3);
    if (d.type === 'dread') { metal *= 25; hp *= 25; money *= 40; proto = money * 2; }
  }
  let att;
  if (decoy) {
    money = trunc(money / 20); proto = trunc(proto / 20); metal = trunc(metal / 40) + 10; hp = 1; att = 1;
  } else {
    const a = W * trunc(hp / 50) * W;
    const b = trunc((W * 5 + 20) * W * W * hit(W) / 300);
    att = trunc(Math.max(a, b) / 50);
    if (d.type === 'dread') att += trunc(att / 5);
    att = Math.min(att, 1000000);
  }
  // `proto` is the extra paid for the first ship; protoTotal is that ship's whole price
  return { money, metal, proto: Math.max(0, proto - money), protoTotal: proto, hp: Math.max(1, hp), att };
}
function designLimits(G, p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 3; L.W = Math.max(1, t.weapons - 1); L.S = Math.max(1, t.shields - 1); }
  if (type === 'bio') { for (const k of ['R', 'V', 'W', 'S']) L[k] = Math.max(1, L[k] - 2); L.M = 0; }
  if (type === 'satellite') L.R = 0;
  return L;
}
// computer-player design rules (FUN_10086830), also used for free prototypes
function aiSpec(p, type) {
  const t = p.tech;
  const spec = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { spec.R += 3; spec.W = Math.max(1, spec.W - 1); spec.S = Math.max(1, spec.S - 1); }
  if (type === 'tanker') { spec.R = Math.max(1, spec.R - 1); spec.V = Math.max(1, spec.V - 1); }
  if (type === 'satellite') spec.R = 0;
  if (type === 'colony' && spec.M > 1) spec.M = trunc(spec.M / 3);
  return spec;
}
const shotsPerShip = (d) => d.type === 'satellite' ? 2 : d.type === 'dread' ? 25 : 1;
function fleetStrength(G, f) {
  let st = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d) st += f.ships[k] * E.rules(G).designCost(G, d).att; } // the active ruleset's costs (DOS 2.0 reuses this)
  return st;
}
// planet defence estimate the computers use (FUN_100839a0)
function planetStrength(q, s) {
  const w = q.tech.weapons + 1, sh = q.tech.shields + 1;
  return trunc(sh * w * w * Math.ceil(popU(s) / 2500) / 570);
}

// ---------- galaxy (FUN_1006c4d0 and one routine per shape) ----------
// The original keeps star positions in tenths of a light-year. Settings come
// from the New Game window: Size and Density are sliders from 0 to 100
// (defaults 50 and 25), Shape is one of seven.
const SHAPES = ['circle', 'spiral', 'cluster', 'ring', 'grid', 'random', 'hex'];
// the original's sine/cosine tables: 100 x cos/sin of each whole degree,
// rounded toward zero, with six entries a hair different
const COS = [], SIN = [];
for (let a = 0; a < 360; a++) { COS.push(trunc(100 * Math.cos(a * Math.PI / 180))); SIN.push(trunc(100 * Math.sin(a * Math.PI / 180))); }
COS[180] = -99; COS[300] = 49; SIN[90] = 99; SIN[150] = 50; SIN[210] = -49; SIN[270] = -99;
// distance in light-years between positions in tenths (FUN_100589f0)
function dist10(a, b) {
  const dx = Math.abs(a.x10 - b.x10), dy = Math.abs(a.y10 - b.y10);
  return trunc((Math.max(dx, dy) + trunc(Math.min(dx, dy) / 3) + 9) / 10);
}
const up3 = (s) => (trunc((s - 1) / 3) + 1) * 3;
// old saves and the test script use named sizes
const sliderSize = (v) => typeof v === 'number' ? v : ({ small: 25, medium: 50, large: 75, huge: 100 }[v] ?? 50);
const sliderDensity = (v) => typeof v === 'number' ? v : ({ dense: 0, normal: 25, sparse: 60 }[v] ?? 25);
function starCount(G, shape, size) {
  let n;
  if (shape === 'grid') n = (Math.min(9, trunc(size / 10)) + 5) ** 2;
  else if (shape === 'hex') { const k = Math.min(6, trunc(size / 15)); n = 3 * (k + 2) * (k + 3) + 1; }
  else { const w = trunc(size / 10) + 6; n = 2 * size + RI(G, -w, w) + 19; }
  return clamp(n, 19, 220);
}
// maxStars: a lower cap on the star count for other rulesets (Palm OS: 90); 5.0.5 caps at 220
function makeGalaxy(G, opts, nPlayers, maxStars) {
  const shape = SHAPES.includes(opts.shape) ? opts.shape : 'random';
  const size = sliderSize(opts.size), dens = sliderDensity(opts.density);
  const n = Math.min(starCount(G, shape, size), maxStars || 220);
  const P = [];
  for (let i = 0; i < n; i++) P.push({ x10: 0, y10: 0 });
  // a star must be at least 4 ly from every star placed before it
  // (FUN_1006efb0), or after it for spirals, which fill from the end (FUN_1006f050)
  const okFwd = (i) => { for (let j = 0; j < i; j++) if (dist10(P[j], P[i]) < 4) return false; return true; };
  const okBack = (i) => { for (let j = n - 1; j > i; j--) if (dist10(P[j], P[i]) < 4) return false; return true; };
  const k3 = clamp(trunc(dens / 34), 0, 2), step = k3 + 4, cap = (k3 + 5) * 7;
  let S = 0, homes = null;
  // rings of stars around the centre, 'step' ly apart (circle and ring)
  const rings = (r0) => {
    let idx = 0, acc = r0 * 44, r = r0;
    while (idx < n) {
      let as = trunc(360 / (trunc(acc / cap) + 1));
      const rem = n - idx;
      if (rem < trunc(360 / as)) as = trunc(360 / rem);
      for (let a = 0; a < 360 && idx < n; a += as) {
        for (let t = 0; t < 20; t++) {
          P[idx].x10 = (S >> 1) * 10 + trunc(r * COS[a] / 10) + RI(G, -10, 10);
          P[idx].y10 = (S >> 1) * 10 + trunc(r * SIN[a] / 10) + RI(G, -10, 10);
          if (okFwd(idx)) { idx++; break; }
        }
      }
      acc += step * 44; r += step;
    }
  };
  if (shape === 'circle' || shape === 'ring') { // FUN_1006d460, FUN_1006d700
    const r0 = shape === 'ring' ? clamp(trunc(n / 4), 7, 12) : 0;
    let acc = r0 * 44, r = r0, c = 0;
    while (c < n) { const cnt = trunc(acc / cap); acc += step * 44; r += step; c += cnt + 1; }
    S = up3((r + (shape === 'ring' ? trunc(step / 2) : step)) * 2);
    rings(r0);
  } else if (shape === 'random') { // FUN_1006d280
    S = up3(trunc(Math.sqrt(25 * n) * (70 + dens) / 63));
    const h = trunc(S / 2), a = h - 2, b = S % 2 === 1 ? h - 2 : h - 3;
    for (let i = 0, guard = 0; i < n;) {
      P[i].x10 = RI(G, 0, b * 10) + RI(G, 0, a * 10) + 20;
      P[i].y10 = RI(G, 0, b * 10) + RI(G, 0, a * 10) + 20;
      if (okFwd(i) || ++guard > 20000) { i++; guard = 0; }
    }
    homes = [...Array(nPlayers).keys()];
  } else if (shape === 'grid') { // FUN_1006e3c0
    const sp = clamp(40 + trunc(2 * dens / 5), 40, 70);
    let k = 1; while (k * k < n) k++;
    S = up3(trunc(k * sp / 10));
    let idx = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) if (idx < n) { P[idx].x10 = trunc(sp / 2) + i * sp; P[idx].y10 = trunc(sp / 2) + j * sp; idx++; }
  } else if (shape === 'hex') { // FUN_1006e550
    const sp = clamp(40 + trunc(2 * dens / 5), 40, 70), rowH = trunc(sp * 866 / 1000);
    const m = trunc((trunc(Math.sqrt(8 * trunc((n - 1) / 6) + 1)) - 1) / 2), w = 2 * m + 1;
    S = trunc(sp * w / 10);
    const cy = trunc(S * 10 / 2), x0 = trunc(S / 2) * 10 - m * sp;
    let idx = 0;
    const row = (xs, y, cnt) => { for (let c = 0; c < cnt && idx < n; c++) { P[idx].x10 = xs + c * sp; P[idx].y10 = y; idx++; } };
    for (let j = 0, xs = x0, y = cy; j <= m; j++, xs += trunc(sp / 2), y -= rowH) row(xs, y, w - j);
    for (let j = 1, xs = x0, y = cy; j <= m; j++) { xs += trunc(sp / 2); y += rowH; row(xs, y, w - j); }
  } else if (shape === 'spiral') { // FUN_1006d9e0
    const core = Math.max(8, step * Math.sqrt(n) * 0.5), coreI = trunc(core);
    let c = 0, acc = 0, rr = 0;
    for (; c < n && rr < coreI; rr += step) { c += trunc(acc / cap) + 1; acc += step * 44; }
    const arms = nPlayers || 6;
    if (c < n) rr += trunc((arms + n - 1) / arms);
    S = up3((rr + step * 2) * 2);
    let idx = n - 1, r = 0;
    acc = 0;
    for (; idx >= 0 && r < coreI; r += step) {
      for (let a = 0; a < 360 && idx >= 0; a += trunc(360 / (trunc(acc / cap) + 1))) {
        for (let t = 0; t < 20; t++) {
          P[idx].x10 = (S >> 1) * 10 + trunc(r * COS[a] / 10) + RI(G, -10, 10);
          P[idx].y10 = (S >> 1) * 10 + trunc(r * SIN[a] / 10) + RI(G, -10, 10);
          if (okBack(idx)) { idx--; break; }
        }
      }
      acc += step * 44;
    }
    const as = trunc((trunc(arms / 2) + 360) / arms);
    let twist = 0;
    while (idx >= 0) {
      twist = (twist + 6) % 360;
      for (let j = 0; j < as * arms && idx >= 0; j += as) {
        const ang = (j + twist) % 360;
        const cx = (S >> 1) * 10 + trunc(r * COS[ang] / 10), cy = (S >> 1) * 10 + trunc(r * SIN[ang] / 10);
        let ok = false;
        for (let t = 0; t < 20 && !ok; t++) {
          P[idx].x10 = cx + RI(G, -10, 10); P[idx].y10 = cy + RI(G, -10, 10);
          ok = okBack(idx);
        }
        if (ok) idx--;
        else if (idx < arms) { // the last few stars (arm tips) must be placed: widen the search
          for (let wdt = 2, t = 0; ; ) {
            P[idx].x10 = cx + RI(G, -wdt, wdt) * 10; P[idx].y10 = cy + RI(G, -wdt, wdt) * 10;
            if (okBack(idx)) { idx--; break; }
            if (++t > 20) { t = 0; wdt++; }
          }
        }
      }
      r += step - 1;
    }
    homes = shuffleHomes(G, nPlayers);
  } else { // cluster, FUN_1006dff0: one cluster per player around a circle
    const order = [...Array(nPlayers).keys()];
    for (let i = 0; i < nPlayers; i++) { const j = RI(G, 0, nPlayers - 1); [order[i], order[j]] = [order[j], order[i]]; }
    let s = trunc(4 * (1 + Math.sqrt(trunc(n / nPlayers))));
    s = trunc(s * (dens + 100) / 100);
    const h = trunc(s / 2), Rr = Math.max(h + 3, trunc((s + 6) * nPlayers / 6));
    S = Rr + h + 3;
    const as = trunc((trunc(nPlayers / 2) + 360) / nPlayers);
    let w = h * 10;
    for (let i = 0; i < n; i++) {
      const ang = as * order[i % nPlayers];
      let cx = (trunc(Rr * COS[ang] / 100) - h) * 10, cy = (trunc(Rr * SIN[ang] / 100) - h) * 10;
      for (let t = 0; ; ) {
        P[i].x10 = cx + RI(G, 0, w) + RI(G, 0, w); P[i].y10 = cy + RI(G, 0, w) + RI(G, 0, w);
        if (++t > 50) { t = 0; w += 20; cx -= 20; cy -= 20; }
        if (okFwd(i)) break;
      }
    }
    homes = shuffleHomes(G, nPlayers);
  }
  // home stars (FUN_1006eb40): random, at least 20 ly apart if possible,
  // relaxing 4 ly at a time
  if (!homes) {
    homes = [];
    for (let p = 0; p < nPlayers; p++) {
      let pickd = -1;
      for (let minD = 20; minD >= 0 && pickd < 0; minD -= 4) {
        for (let t = 0; t < 25; t++) {
          let c = -1;
          for (let u = 0; u < 20; u++) { const v = RI(G, 0, n - 1); if (!homes.includes(v)) { c = v; break; } }
          if (c < 0) c = [...Array(n).keys()].find(v => !homes.includes(v));
          if (homes.every(hh => dist10(P[hh], P[c]) >= minD)) { pickd = c; break; }
        }
      }
      homes.push(pickd);
    }
  }
  // shift the map so it starts 6 ly from the top-left edge (FUN_1006edc0)
  const minX = Math.min(...P.map(q => trunc(q.x10 / 10))), minY = Math.min(...P.map(q => trunc(q.y10 / 10)));
  for (const q of P) { q.x10 += (6 - minX) * 10; q.y10 += (6 - minY) * 10; }
  const maxX = Math.max(...P.map(q => trunc((q.x10 + 9) / 10))), maxY = Math.max(...P.map(q => trunc((q.y10 + 9) / 10)));
  S = Math.max(maxX + 6, maxY + 6) + 3;
  return { W: S / LY_PER_UNIT, H: S / LY_PER_UNIT, pts: P.map(q => ({ x: q.x10 / 10 / LY_PER_UNIT, y: q.y10 / 10 / LY_PER_UNIT, x10: q.x10, y10: q.y10 })), homes };
}
function shuffleHomes(G, k) {
  const h = [...Array(k).keys()];
  for (let i = 0; i < k; i++) { const j = RI(G, 0, k - 1); [h[i], h[j]] = [h[j], h[i]]; }
  return h;
}
// Each computer's skill and home system come from the IQ setting (50-200):
// the computers are spread out from IQ-based skill upward (FUN_1006f640).
// Skill 1-4 is Dumb, Average, Smart, Diabolical. "Based on IQ" home systems
// are Barren, Normal, Advanced or Thriving to match.
function computerSetup(G, opts, k, nComp) {
  if (typeof opts.iqNum !== 'number') return null;
  const spread = nComp < 2 ? 1 : trunc(25 / (nComp - 1));
  const v = trunc((opts.iqNum - 50) * 2 / 3) + k * spread - 12;
  const lvl = v < 25 ? 1 : v < 50 ? 2 : v < 75 ? 3 : 4;
  const start = opts.cstart && opts.cstart !== 'iq' ? opts.cstart : ['barren', 'normal', 'advanced', 'thriving'][lvl - 1];
  return { start, iq: ['dumb', 'average', 'smart', 'diabolical'][lvl - 1] };
}

// Game difficulty rating, 30-140 (FUN_100560a0), shown in the New Game
// window and used for master points when you win. o: computers, iqNum,
// start, cstart ('iq' = based on IQ), shape, size, density, buddies,
// armageddons, won (did you win), year (the year you won; 0 for the preview).
const START_ORDER = ['outpost', 'barren', 'backward', 'normal', 'advanced', 'thriving', 'abundant'];
function difficulty(o) {
  const nComp = o.computers | 0;
  if (!nComp) return 0;
  const buddies = o.buddies && nComp >= 2 ? 1 : 0;
  const iq = o.iqNum ?? 100;
  const you = Math.min(7, START_ORDER.indexOf(o.start || 'normal') + 1);
  let them = o.cstart === 'iq' || !o.cstart ? trunc((iq - 50) / 22) + 1 : START_ORDER.indexOf(o.cstart) + 1;
  const gap = them - you;
  let a = gap === 5 ? 25 : gap === 4 ? 15 : gap === 6 ? 40 : gap + 7;
  if (you === 7) a = Math.max(0, a - 4);
  if (you === 6) a = Math.max(0, a - 2);
  const b = 1 + (iq - 50) / 15;
  const c = trunc(2 * buddies * (nComp - 1) + nComp + 2);
  const shapeN = SHAPES.indexOf(o.shape) + 1;
  const d = shapeN === 3 ? 4 : shapeN === 2 ? 7 : 10;
  const e = 12 - (sliderSize(o.size) - 1) / 15, f = 12 - (sliderDensity(o.density) - 1) / 15;
  const low = Math.min(a, c, b, d, e, f);
  let sc = (10 * low + 2 * a + c + b + d + e + f) * 0.5 + 25;
  sc *= 0.9 ** (o.armageddons || 0);
  if (o.won != null) sc -= o.won ? 0 : 1; // humans who did not win
  const y = o.year || 0;
  if (y >= 2000 && y <= 3000) sc += 1;
  if (y >= 5000) sc -= trunc(y / 5000);
  return trunc(clamp(sc, 30, 140));
}
// master points for a win at that difficulty (FUN_10055f60)
const masterPoints = (d) => d < 10 ? 0 : Math.min(10000000, trunc(3 ** ((Math.max(30, d) - 30) / 10)));

// ---------- setup ----------
function setupPlayer(G, p, home, start) {
  const st = START[start] || START.normal;
  // home world (FUN_1006f640): 0..200 F, 0.5..2.0 G, 10,000 metal
  home.t = RI(G, 0, 2000) / 10;
  const k = RI(G, 1, 2);
  home.g = RI(G, 25 * (1 << k), 25 * (1 << (k + 1))) / 100;
  home.metal = 10000;
  p.homeG = home.g; p.homeT = home.t;
  home.owner = p.id; setPopU(home, st.pop); home.everProfit = true;
  home.oInc = st.pinc; home.oSink = 5000; home.terra = 0;
  p.savings = st.sav; p.metal = st.metal;
  p.oInc = st.inc + RI(G, 1, 100); p.oInterest = 0; p.oRefund = 0; p.oD = 0;
  p.lastGross = p.oInc; p.lastIncome = p.oInc; p.lastNet = p.oInc;
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {};
  for (const t of TECHS) p.tprog[t] = p.tech[t] * 100 + RI(G, 0, t === 'radical' ? 80 : 40);
  p.talloc = { range: 167, speed: 167, weapons: 167, shields: 167, mini: 166, radical: 166 };
  p.budget = { tech: 0.25, savings: 0.65, col: { [home.id]: 0.10 } };
  p.flags = {};          // one-time radical bonuses
  p.bonus = {};          // (Claude-only field, kept for shared code)
  p.deck = [];
  p.startRank = st.rank;
  if (is505(G)) setup505(G, p, home, st);
}
function defaultDesigns(G, p) {
  for (const type of ['scout', 'tanker', 'satellite', 'colony', 'fighter']) {
    const spec = aiSpec(p, type); spec.M = 0;
    findOrCreateDesign(G, p, spec);
  }
}
function afterSetup(G) {
  // "Best Buddies" in the New Game window: the computers start as best
  // buddies with each other, liking each other 1,000 points more (FUN_1006c4d0)
  if (G.opts.buddies) {
    const comps = G.players.filter(q => !q.human);
    for (const a of comps) for (const b of comps) if (a !== b) {
      a.allies = a.allies || []; a.buddies = a.buddies || [];
      if (!a.allies.includes(b.id)) a.allies.push(b.id);
      if (!a.buddies.includes(b.id)) a.buddies.push(b.id);
      if (a.ai && a.ai.att) a.ai.att[b.id] = (a.ai.att[b.id] || 0) + 1000;
    }
  }
  for (const p of G.players) {
    if (!is505(G)) refillDeck(G, p); // 5.0.5 deals the radical hand in 2010 (pass 2b)
    const home = G.stars[p.homeStar];
    let second = null;
    if (p.startRank === 7) { // Abundant: a second colony next door
      const near = G.stars.filter(s => s.owner < 0).sort((a, b) => distance(G, a, home) - distance(G, b, home))[0];
      if (near) {
        second = near;
        near.owner = p.id; setPopU(near, 5000); near.metal = 2500;
        near.t = p.homeT + RI(G, 500, 1000) / 10 * (RI(G, 1, 2) === 1 ? 1 : -1);
        near.g = p.homeG * (1 + RI(G, 20, 50) / 100 * (RI(G, 1, 2) === 1 ? 1 : -1));
        near.oInc = -7500; near.oSink = 5000; near.terra = 0.5;
        p.budget.col[near.id] = 0.05;
        // CONFIRMED (FUN_1006f640, the colony list at player
        // +0x1138, records 0x1c bytes): Savings 650, Technology 250 and the
        // home's record (100 per mille) are appended; for the second colony
        // the home's record is appended again with 50 per mille (the fourth
        // slot), and the third slot (+0x38..+0x50) is then rewritten as the
        // second colony: 50 per mille, bars 500 / 500, 10,000 people, income
        // -7,500, $5,000 sunk. So the second colony is third and the home
        // fourth, 650 + 250 + 50 + 50 = 1,000. (Palm FUN_00026304 the same.)
        if (is505(G)) {
          setPopU(near, 10000); setBars505(near, 500, 500);
          const L = p.slots301; L.splice(L.indexOf(home.id), 0, near.id);
          p.budget.col[home.id] = 0.05;
        }
        observe(G, p, near.id);
      }
    }
    const byType = (t) => p.designs.find(d => d.type === t);
    if (p.startRank > 5) { const d = byType('colony'); const f = addShipsToStar(G, p.id, (second || home).id, d, 1); d.built++; d.free = true; f.colonists = 10; }
    if (p.startRank > 4) {
      const d = byType('scout');
      addShipsToStar(G, p.id, home.id, d, 1); addShipsToStar(G, p.id, (second || home).id, d, 1); d.built += 2;
    }
  }
  if (is505(G)) creatorShares505(G);
}
// CONFIRMED (FUN_1006579c, the New Game window's OK, in the year 2000 (game
// +0x18)): the player who creates the game gets the shares kept in the
// preferences: research (player +0x80..+0x8a) from prefs +0x1b4..+0x1be;
// the colony list's first slots from prefs +0x1c2, +0x1c4 and the third
// 1,000 less those, or for an Abundant player (+0x29 = 7) from +0x1c8,
// +0x1ca, +0x1cc and the fourth 1,000 less those. Their defaults (CPrefs,
// FUN_10072490, prefs +0x1b4..+0x1ce): Range, Speed, Weapons, Shields and Mini
// 180 (0xb4) each and Radical 100; Savings 650 (0x28a), Technology 250 (0xfa);
// Abundant Savings 550 (0x226), Technology 200, the third slot (the second
// colony, above) 150 (0x96) and the fourth (the home) 100. 5.0.5 keeps the
// first turn's shares as the next game's (FUN_10064600); the remake starts
// every game from the defaults. The other players keep 167 each and the
// colony list as set up. (Palm FUN_000395a6, FUN_0002b274 the same.)
const PREF_TECH505 = { range: 180, speed: 180, weapons: 180, shields: 180, mini: 180, radical: 100 };
function creatorShares505(G) {
  const h = G.players.find(q => q.human);
  if (!h) return;
  h.talloc = Object.assign({}, PREF_TECH505);
  const cols = colSlots505(G, h);
  if (h.startRank === 7 && cols.length >= 2) {
    setKeyPm(h, 'sav', 550); setKeyPm(h, 'tech', 200); setKeyPm(h, cols[0], 150); setKeyPm(h, cols[1], 1000 - 550 - 200 - 150);
  } else if (cols.length) {
    setKeyPm(h, 'sav', 650); setKeyPm(h, 'tech', 250); setKeyPm(h, cols[0], 1000 - 650 - 250);
  }
}

// ---------- economy ----------
function shares(G, p, cols) {
  const b = p.budget;
  for (const k in b.col) if (!G.stars[k] || G.stars[k].owner !== p.id) delete b.col[k];
  for (const s of cols) if (b.col[s.id] == null) b.col[s.id] = 0;
  let tot = b.tech + b.savings; for (const k in b.col) tot += b.col[k];
  if (tot <= 0) { b.savings = 1; tot = 1; }
  return (x) => x / tot;
}
// money available to divide up this turn, before anything is spent
function disposable(G, p) {
  let D = p.oInc + dipAmount(p), I = p.oInterest || 0;
  if (I >= 0) D += I; else D -= Math.min(D, -I);
  let support = 0;
  for (const s of colonies(G, p.id)) if ((s.oInc || 0) < 0) support += -s.oInc;
  return { D: Math.max(0, D - Math.min(D, support)), support, I };
}
// "Dip into savings": a percentage of savings joins this turn's budget (FUN_10077200)
function dipAmount(p) { return p.savings > 0 && p.dip > 0 ? trunc(p.savings * p.dip / 100) : 0; }
function projected(G, p) {
  if (is505(G)) return projected505(G, p);
  const { D, support, I } = disposable(G, p);
  return { gross: p.oInc, income: p.oInc - support, interest: I, net: D, dip: dipAmount(p) };
}
// interest (FUN_100737b0), colony support (FUN_10073a80), terraforming and
// mining (FUN_10073d70) and research (FUN_10074f90)
// opt.shipyard(G, p, s, spend) lets another ruleset take part of a colony's
// money for shipbuilding first (the DOS 2.0 rules); it returns what is left.
// opt.research and opt.idleTech replace the research step and the "not
// spending on research" reminder (the 4.0.5 rules). opt.terraStep, terraCost,
// mineMetal and mineMoney replace those formulas, and opt.terraWarnAlways
// repeats the "never profitable" warning every turn (the Mac 3.0.1 rules).
function economy(G, p, opt) {
  if (is505(G)) return economy505(G);
  const cols = colonies(G, p.id);
  const tStep = opt && opt.terraStep || terraStep, tCost = opt && opt.terraCost || terraCost;
  const mMetal = opt && opt.mineMetal || mineMetal, mMoney = opt && opt.mineMoney || mineMoney;
  const limit = () => borrowLimit(G, p);
  const dip = dipAmount(p);
  p.savings -= dip;
  let D = p.oInc + dip;
  // interest
  let I = p.oInterest || 0;
  if (I >= 0) D += I;
  else if (D >= -I) D += I;
  else {
    I += D; D = 0;
    const avail = Math.max(0, p.savings - limit());
    if (avail > 0) msg(G, p.id, 'Uh-oh! Having to borrow more to pay all your interest!', { icon: 'm9020' });
    if (avail < -I) {
      msg(G, p.id, 'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!', { icon: 'm9020', sound: 2001 });
      I += avail; p.savings -= avail; p.savings += I;
      const k = clamp(trunc(-I / 500), 1, 1000);
      for (const s of cols) {
        if (Math.abs(s.t) >= 3000) continue;
        const dt = RI(G, k, 2 * k) / 10;
        s.t += s.t < p.homeT ? -dt : dt;
      }
      const fl = G.fleets.filter(f => f.owner === p.id);
      if (fl.length) { const f = pick(G, fl); msg(G, p.id, 'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.', { icon: 'm9014' }); scrapFleet(G, f); }
    } else p.savings += I;
  }
  // support colonies running at a loss
  let avail = Math.max(0, p.savings - limit());
  for (const s of cols.slice()) {
    s.oStarve = false;
    const inc = s.oInc || 0;
    if (inc >= 0) continue;
    if (D >= -inc) { D += inc; continue; }
    const need = -inc - D; D = 0;
    if (avail >= need) {
      msg(G, p.id, `Warning! Savings is being used to support ${s.name}.`, { icon: 'm9020', star: s.id, quiet: true });
      avail -= need; p.savings -= need; continue;
    }
    const short = need - avail; p.savings -= avail; avail = 0;
    const u = Math.max(0, trunc(popU(s) * (-inc - short) / -inc) - 100);
    setPopU(s, u);
    if (u === 0) evacuate(G, p.id, s.id);
    else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', star: s.id }); }
  }
  p.oD = D;
  const share = shares(G, p, cols);
  // colonies: terraforming, then mining
  for (const s of colonies(G, p.id)) {
    let spend = trunc(D * share(p.budget.col[s.id] || 0));
    if (opt && opt.shipyard) spend = opt.shipyard(G, p, s, spend);
    if (spend <= 0) continue;
    const h = hab(p, s);
    const terraOK = h.dT > 0, metalOK = s.metal > 0;
    let tf = s.terra;
    if (!terraOK) tf = 0; if (!metalOK) tf = terraOK ? 1 : 0;
    if (!terraOK && !metalOK) { p.oRefund += spend; continue; }
    let T = trunc(spend * tf);
    const M = spend - T;
    if (T > 0) {
      if (T > 50 && h.gR > 256 && (!s._warned || opt && opt.terraWarnAlways)) { s._warned = true; msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id }); }
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, T); T -= x; s.oSink += x; }
      const step = tStep(p, T);
      if (h.dT < step) {
        p.oRefund += tCost(p, step) - tCost(p, h.dT);
        s.t = p.homeT;
        msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
      } else s.t += (s.t < p.homeT ? 1 : -1) * step / 10;
    }
    if (M > 0) {
      let got = mMetal(p, M);
      if (got >= s.metal) {
        p.oRefund += Math.max(0, mMoney(p, got) - mMoney(p, s.metal));
        got = s.metal;
        msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably evacuate it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
      }
      s.metal -= got; p.metal += got;
    }
  }
  // research
  const tech = trunc(D * share(p.budget.tech));
  if (tech > 0) (opt && opt.research || research)(G, p, tech);
  else if (opt && opt.idleTech ? opt.idleTech(G, p, D) : p.human && D > 0 && G.turn % 5 === 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011' });
}
// savings, interest, population and colony income (FUN_10077200)
// opt.meteors and opt.interestOn replace those steps (the 4.0.5 rules);
// opt.incomeU replaces the colony income formula (the Mac 3.0.1 rules).
function afterMovement(G, p, opt) {
  if (is505(G)) return; // 5.0.5: pass 2 (pass2_505, in the refuel slot)
  const incU = opt && opt.incomeU || incomeU;
  (opt && opt.meteors || meteors)(G, p);
  const cols = colonies(G, p.id);
  const share = shares(G, p, cols);
  p.savings += trunc(p.oD * share(p.budget.savings));
  p.oInterest = (opt && opt.interestOn || interestOn)(p, p.savings);
  p.savings += p.oRefund; p.oRefund = 0;
  let gross = 0, net = 0;
  for (const s of cols) {
    const before = s.oInc == null ? -7501 : s.oInc;
    const mx = maxPopU(p, s);
    let u = popU(s);
    if (!s.oStarve && !s.oNew) {
      let add;
      if (u < mx) {
        if (before < -7499) add = Math.min(trunc(mx / 1000), 2 * u) + RI(G, 0, 5);
        else {
          const r1 = RI(G, 0, 5), r2 = RI(G, 0, trunc(mx / 100)), base = trunc(mx / 20);
          add = base + r2 < 2 * u + r1 ? base + RI(G, 0, trunc(mx / 100)) : 2 * u + RI(G, 0, 5);
          if (u + add >= mx) msg(G, p.id, `${s.name}’s population growth rate has slowed.`, { icon: 'm9030', star: s.id, quiet: true });
        }
      } else add = trunc(mx / 1000) + RI(G, 0, trunc(mx / 10000));
      u += add; setPopU(s, u);
    }
    s.oNew = false;
    const inc = incU(u, hab(p, s).H);
    s.oInc = inc;
    if (inc > 0) gross += inc;
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 7019, star: s.id }); }
    if (before < -7499 && inc > -7500) msg(G, p.id, `It’s a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', sound: 7004, star: s.id });
  }
  p.oInc = gross; p.lastGross = gross; p.lastIncome = net; p.lastInterest = p.oInterest; p.lastNet = net + p.oInterest;
}

// ---------- colonies ----------
// Colony ships are not used up: each carries 10 colonists (units), which it
// unloads to found a colony and reloads at any of your colonies (FUN_10077aa0).
function canColonize(G, p, f, s) { return !is505(G) && (f.colonists || 0) > 0; } // 5.0.5 colonizes in pass 2a (colonizeExplore505)
function settle(G, p, s, f) {
  if (is505(G)) return settle505(G, p, s, f && f.colonists || 10);
  const n = f.colonists || 10;
  f.colonists = 0;
  s.owner = p.id; setPopU(s, n); s.everProfit = false; s._warned = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = true;
  const h = hab(p, s);
  s.terra = h.gR <= 256 ? 0.9 : 0;
  if (h.dT === 0) { s.terra = 0; s.oSink = 5000; }
  const D = Math.max(1, disposable(G, p).D);
  p.budget.col[s.id] = D > 20000 ? 7500 / D : 0;
}
// FUN_10072100: the star's rating, 0..20, from how close its gravity and
// temperature are to yours (+1 for more than 10,000 metal). 0 means it can
// never be profitable. The exploration sound is the "good" one at 15 or
// more, the "so-so" one from 1 to 14 and the "bad" one at 0 (FUN_1009d2e8).
function starRating(p, s) {
  const { gR, dT } = hab(p, s);
  let r = 0;
  if (gR <= 256 && (gR <= 200 || dT <= 500)) {
    const a = trunc(gR / 10), b = trunc(dT / 330);
    r = trunc(Math.max(23, 100 - (a - 10) * (a - 9)) * Math.max(40, 100 - b * (b + 1)) / 527) + 2;
  }
  if (s.metal > 10000) r = Math.min(20, r + 1);
  return r;
}
function exploreQuality(G, p, s) {
  const r = starRating(p, s);
  return r >= 15 ? 'good' : r > 0 ? 'mediocre' : 'bad';
}
// what the computers remember about a star
function observeHook(G, p, s, k) {
  let str = 0;
  for (const f of G.fleets) if (f.star === s.id && f.to == null && !isAllied(G, f.owner, p.id)) str += fleetStrength(G, f);
  k.enemyStr = str;
  if (s.owner >= 0 && !isAllied(G, s.owner, p.id)) k.enemyStr += planetStrength(G.players[s.owner], s);
}

// ---------- tankers, biologicals and colonists (FUN_10077aa0) ----------
// Each Tanker holds 200 units of fuel for the fleets at its star; a fleet uses
// one unit per ship (25 per Dreadnought) for each light-year it refills.
// Biologicals refuel only by eating population at your own or allied colonies.
function refuel(G) {
  if (is505(G)) return pass2_505(G); // 5.0.5: the novas and pass 2 (refuelling is in pass 2a)
  for (const p of G.players) {
    if (!p.alive) continue;
    const pool = {};
    for (const f of G.fleets) if (f.owner === p.id && f.star != null && f.to == null) {
      for (const k in f.ships) { const d = getDesign(G, p.id, +k); if (d && d.type === 'tanker') pool[f.star] = (pool[f.star] || 0) + 200 * f.ships[k]; }
    }
    const short = {};
    for (const f of G.fleets.slice()) {
      if (f.owner !== p.id || f.star == null || f.to != null || f.sat) continue;
      const s = G.stars[f.star], max = fleetMaxRange(G, f);
      const ds = fleetDesigns(G, f);
      const bioOnly = ds.length && ds.every(d => d.type === 'bio');
      if (!bioOnly) {
        if (s.owner >= 0 && isAllied(G, s.owner, p.id)) {
          f.fuel = max;
          if (s.owner === p.id) { let c = 0; for (const d of ds) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = c * 10; }
        }
        if (f.name === 'Valdez' && RI(G, 1, 250) === 1)
          msg(G, p.id, `Oh no! The Valdez has sprung a leak! The ecology on ${s.name} is in shambles! The citizens are suing you for twice your net worth!`, { icon: 'm9038', star: s.id });
        if (f.fuel < max) {
          let dreads = 0; for (const d of ds) if (d.type === 'dread') dreads += f.ships[d.id];
          const cost = fleetCount(f) + dreads * 24;
          const had = pool[f.star] || 0;
          while (f.fuel < max && (pool[f.star] || 0) >= cost) { f.fuel = Math.min(max, f.fuel + 1); pool[f.star] -= cost; }
          if (f.fuel < max && had > 0) short[f.star] = true;
          if (f.fuel < max && had > 0) msg(G, p.id, `There were not enough tankers to fully refuel your fleet of ${fleetLabel(G, f)} at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
        }
      } else if (s.owner >= 0 && isAllied(G, s.owner, p.id) && f.fuel < max) {
        const n = fleetCount(f);
        let eaten = 0;
        while (f.fuel < max && popU(s) >= n * 200 + 100) { f.fuel++; setPopU(s, popU(s) - n * 200); eaten += n * 200; }
        if (eaten) {
          msg(G, p.id, `Your fleet of ${fleetLabel(G, f)} has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
          if (s.owner !== p.id) msg(G, s.owner, `${p.name}’s fleet of biologicals has eaten ${fmt(eaten * 1000)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
        }
      }
    }
  }
}

// ---------- combat ----------
// 5.0.5's battles are below (battle505, the 5.0.5 turn).
// the 5.0.5 turn: 'original', and the Palm OS rules (the same code, recompiled:
// docs/palm-findings.md) through the ruleset flag turn505 (not enumerable, so
// the rulesets built on this one with Object.assign don't take it)
const is505 = (G) => !!E.rules(G).turn505;

// ---------- dismantling by marks (5.0.5 only here) ----------
// CONFIRMED (FUN_10062c10, the Ships menu's "Dismantle Fleet"): the command
// toggles the fleet's mark (fleet +0x72), with sound 7003 when it sets it;
// the menu reads "Dismantle Current Fleet" / "Don't Dismantle Current Fleet"
// (the resource's string list). A fleet bought this turn (+0x74) is not
// marked: its purchase is undone, for each design in it the ships' price
// (the first-ship price for one of them when none of the design is left
// built, design +0x10) and metal go back, the built and in-service counts
// go down, the interest is worked out again (FUN_10054de0) and the fleet is
// deleted (FUN_1007be70). `how`: left out or true, mark (the computers);
// false, unmark; 'command', the player's toggle. Returns 'unbuilt' when the
// purchase was undone, else whether the fleet is now marked.
function flagScrap(G, f, how) {
  const p = G.players[f.owner], cmd = how === 'command';
  const on = cmd ? !f.scrap301 : how !== false;
  if (cmd && f.newThisTurn && f.star != null && f.to == null) {
    const spent = p.spentThisTurn || [];
    for (const k in f.ships) {
      const d = getDesign(G, f.owner, +k), n = f.ships[k];
      if (!d) continue;
      const c = designCost(G, d);
      d.built = Math.max(0, d.built - n);
      const first = d.built < 1 && !d.free && E.rules(G).paysPrototype(G, p, d) ? c.protoTotal : c.money;
      p.savings += first + (n - 1) * c.money; p.metal += n * c.metal;
      for (let i = 0; i < n; i++) { const j = spent.map(e => e.did === +k && e.sid === f.star).lastIndexOf(true); if (j >= 0) spent.splice(j, 1); }
    }
    // the interest (+0x4c) is worked out again and the net (+0x40) follows it
    p.net505 = (p.net505 || 0) - (p.oInterest || 0);
    p.oInterest = interestOn(p, p.savings);
    p.net505 += p.oInterest;
    G.fleets.splice(G.fleets.indexOf(f), 1);
    return 'unbuilt';
  }
  f.scrap301 = !!on;
  return f.scrap301;
}
// CONFIRMED (FUN_100601e0, "Scrap Ship Types…": a list where the marked
// types are selected, OK sets design +0xc for the selection and clears it for
// the rest; FUN_10099c84, the Build Ships window: toggles the selected type's
// mark, asking first (alert 8, "Do you really want to scrap all existing ships
// of this type?") when it has ships). `how` as for flagScrap.
function flagScrapDesign(G, p, d, how) {
  d.scrap301 = how === 'command' ? !d.scrap301 : how !== false;
  return d.scrap301;
}
// CONFIRMED (FUN_10074580, in each player's pass 1 after the interest): first
// the types over 17 are retired (retireTypes); then for each fleet, each
// design in it is dismantled when the fleet is marked, the design is marked or
// the player is out (+0x34): its ships' metal, 3/4 of it for a human (7/8
// with the recycling discovery, +0x8e bit 0x10; the computers keep it all),
// goes to the player at its own colony, falls on the star (and on the list
// GetOtherScrapMetal reads, FUN_10077110) elsewhere, and onto the next star
// as a meteor shower from hyperspace. A marked fleet reports each design:
// "Your fleet of %s at %s has been dismantled for %s metal." (0x3fa, the metal
// shown only at your own colony) or "Your fleet of %s was dismantled while in
// hyperspace." (0x3fb). A fleet with nothing left is deleted. Then each marked
// type is deleted, with "Your "%s" ship type has been dismantled. %d of this
// type scrapped for %s metal." (0x3fc) when it brought in metal (counted only
// at your own colonies, from fleets not themselves marked).
function dismantle505(G, p) {
  retireTypes(G, p);
  const out = !p.alive && !p.surrendered;
  const tally = new Map();
  for (const f of G.fleets.filter(x => x.owner === p.id)) {
    let kept = 0;
    for (const k of Object.keys(f.ships)) {
      const d = getDesign(G, p.id, +k), n = f.ships[k];
      if (!d || n <= 0) continue;
      if (!f.scrap301 && !d.scrap301 && !out) { kept++; continue; }
      let m = n * designCost(G, d).metal;
      if (p.human) m = trunc(m * (p.flags && p.flags.recycle ? 7 : 3) / (p.flags && p.flags.recycle ? 8 : 4));
      let own = false;
      if (f.star == null || f.to != null) {
        G.meteors = G.meteors || {};
        if (f.to != null) G.meteors[f.to] = (G.meteors[f.to] || 0) + m;
      } else {
        const s = G.stars[f.star];
        if (s.owner === p.id) { p.metal += m; own = true; }
        else { s.metal += m; const so = G.scrapOver505 || (G.scrapOver505 = {}); so[s.id] = (so[s.id] || 0) + m; }
      }
      const label = fleetLabel(G, { owner: p.id, ships: { [k]: n } });
      if (f.scrap301) {
        if (f.star == null || f.to != null) msg(G, p.id, `Your fleet of ${label} was dismantled while in hyperspace.`, { icon: 'm9014', quiet: true });
        else msg(G, p.id, `Your fleet of ${label} at ${G.stars[f.star].name} has been dismantled for ${fmt(own ? m : 0)} metal.`, { icon: 'm9014', star: f.star, quiet: true });
      } else { const t = tally.get(d) || { n: 0, m: 0 }; t.n += n; if (own) t.m += m; tally.set(d, t); }
      delete f.ships[k];
    }
    if (!kept) { const i = G.fleets.indexOf(f); if (i >= 0) G.fleets.splice(i, 1); }
    else if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
  }
  for (const d of p.designs) {
    if (!d.scrap301 || d.scrapped) continue;
    d.scrapped = true; d.scrap301 = false;
    const t = tally.get(d);
    if (t && t.m > 0) msg(G, p.id, `Your “${d.name}” ship type has been dismantled. ${t.n} of this type scrapped for ${fmt(t.m)} metal.`, { icon: 'm9014', quiet: true });
  }
}
// CONFIRMED (FUN_10077110, pass 2a): metal dismantled over a colony of yours
// with people is yours: "You just received %s metal from someone scrapping a
// fleet or from a battle over %s." (0x472). The list is cleared each turn
// (FUN_10072a10); what nobody picks up stays on the planet.
function otherScrapMetal505(G, p) {
  const so = G.scrapOver505; if (!so) return;
  for (const s of colonies(G, p.id)) {
    const m = so[s.id]; if (!m || !(popU(s) > 0)) continue;
    p.metal += m; s.metal -= m; delete so[s.id];
    msg(G, p.id, `You just received ${fmt(m)} metal from someone scrapping a fleet or from a battle over ${s.name}.`, { icon: 'm9014', star: s.id });
  }
}

// ---------- scrapping (FUN_10074580) ----------
// CONFIRMED (FUN_10074580, 5.0.5 only here): with more than 17 ship types,
// the oldest types with no ships in service that aren't the newest of their
// kind are retired until 17 are left, for every player, at the start of the
// turn's money step.
function retireTypes(G, p) {
  const live = p.designs.filter(d => !d.scrapped);
  let n = live.length - 17;
  if (n <= 0) return;
  const newest = {};
  live.forEach((d, i) => { newest[d.type] = i; });
  const inService = (d) => G.fleets.some(f => f.owner === p.id && f.ships[d.id] > 0);
  for (let i = 0; i < live.length && n > 0; i++) {
    const d = live[i];
    if (i < newest[d.type] && !inService(d)) { d.scrapped = true; n--; }
  }
}
// Humans get 3/4 of the metal back (7/8 after the recycling discovery);
// computer players get all of it.
const scrapReturn = (G, p) => p.human ? (p.flags.recycle ? 7 / 8 : 3 / 4) : 1;
// Ships scrapped in hyperspace rain their metal onto their destination next
// turn as a meteor shower (FUN_10074580 + FUN_10077200).
function scrapInSpace(G, f, metal) {
  G.meteors = G.meteors || {};
  G.meteors[f.to] = (G.meteors[f.to] || 0) + trunc(metal);
  msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} was dismantled while in hyperspace.`, { icon: 'm9014' });
}
function meteors(G, p) {
  if (!G.meteors) return;
  for (const s of colonies(G, p.id)) {
    const m = G.meteors[s.id]; if (!m) continue;
    let kill = Math.min(popU(s), m * 50), saved = 0;
    for (const f of G.fleets) if (f.owner === p.id && f.star === s.id && f.to == null && fleetHas(G, f, 'colony')) {
      let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
      const room = Math.max(0, c * 10 - (f.colonists || 0)), x = Math.min(room, kill);
      f.colonists = (f.colonists || 0) + x; kill -= x; saved += x;
    }
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: s.id });
    if (saved) msg(G, p.id, `${fmt(saved * 1000)} people managed to escape the meteor shower at ${s.name} by fleeing to the orbiting colony ship(s).`, { icon: 'm9021', star: s.id });
    if (popU(s) <= 0) { msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: s.id }); s.owner = -1; s.pop = 0; }
  }
}

// ---------- novas, supernovas and Armageddon (FUN_100769b0, FUN_10076d20, FUN_10076680) ----------
// star.nova: 0 = normal; 10..209 = turning red; >= 210 = gone supernova (the year it happened).
function randomEvents(G) {
  if (is505(G)) return; // 5.0.5: in pass2_505
  if (G.meteors) G.meteors = {};
  // Armageddon: when every surviving human has switched it on, half the
  // quiet stars start to go supernova and the galaxy shrinks.
  const humans = G.players.filter(p => p.human && p.alive && !p.surrendered);
  if (G.opts.armageddon !== false && humans.length && humans.every(p => p.armageddon)) {
    const quiet = G.stars.filter(s => !s.nova);
    for (const p of humans) p.armageddon = false;
    if (quiet.length < 2) E.msgAll(G, 'Hmm! The armadeddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work…', { icon: 'm9036' });
    else {
      const sh = E.shuffle(G, quiet.slice());
      for (let i = 0; i < trunc(sh.length / 2); i++) sh[i].nova = 200;
      G.armageddons = (G.armageddons || 0) + 1;
      E.msgAll(G, 'Oh No! It’s armageddon!', { icon: 'm9036', sound: 7020 });
      E.msgAll(G, 'The armageddon device has caused half of the stars to supernova!', { icon: 'm9036' });
    }
  }
  const thrown = {};
  for (const s of G.stars) {
    if (s.nova >= 10 && s.nova < 210) {
      if (s.owner < 0 || RI(G, 1, 100) < 94) {
        s.nova += 10;
        if (s.nova > 209) { // supernova
          s.nova = G.year + 10;
          for (const o of G.stars) {
            if (o === s) continue;
            const d = distance(G, s, o);
            if (d > 0 && d < 11) { const m = RI(G, Math.max(100, trunc(10000 / d) - 1000), trunc(10000 / d)); thrown[o.id] = (thrown[o.id] || 0) + m; o.metal += m; } // metal: FUN_100769b0 @10076ae8
          }
          supernova(G, s);
        }
      } else {
        s.nova = 0;
        for (const p of G.players) know(G, p, s.id).nova = 0;
        if (s.owner >= 0) msg(G, s.owner, `It's a miracle! Your scientists have figured out to prevent ${s.name} from going supernova.`, { icon: 'm9010', star: s.id });
        for (const p of G.players) if (p.id !== s.owner && know(G, p, s.id).explored) msg(G, p.id, `Wow, that's weird! ${s.name} is no longer red and appears not to be in danger of going nova.`, { star: s.id, quiet: true });
      }
    }
  }
  // a new star starts to turn red (option; after 2750, about 1 in 99 turns, one at a time)
  if (G.opts.novas !== false && G.year > 2749 && RI(G, 1, 9) * RI(G, 1, 11) < 2 && !G.stars.some(s => s.nova > 0 && s.nova < 211)) {
    const free = G.stars.filter(s => !s.nova && s.owner < 0);
    if (free.length) { const s = pick(G, free); s.nova = RI(G, 0, 10) * 10 + 10; }
  }
  for (const s of G.stars) if (s.nova >= 10 && s.nova < 210)
    for (const p of G.players) {
      const k = know(G, p, s.id);
      if (!p.alive || !k.explored) continue;
      if (!k.nova) msg(G, p.id, `Uh-oh! ${s.name} has started growing and is turning bright red in hue!`, { icon: 'm9036', star: s.id });
      k.nova = s.nova;
    }
  // the shock wave hits nearby colonies
  for (const sid in thrown) {
    const s = G.stars[sid]; if (s.owner < 0) continue;
    const p = G.players[s.owner], m = thrown[sid];
    const kill = Math.min(popU(s), m * RI(G, 40, 60));
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `The shock wave from the supernova threw ${fmt(m)} metal at ${s.name}, killing ${fmt(kill * 1000)} people.`, { icon: 'm9036', star: s.id });
    if (popU(s) <= 0) { s.owner = -1; s.pop = 0; msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: s.id }); }
    else { p.metal += m; s.metal = Math.max(0, s.metal - m); }
  }
}
function supernova(G, s) {
  for (const p of G.players) if (p.alive && know(G, p, s.id).explored) msg(G, p.id, `${s.name} has just gone supernova. The planet has been obliterated.`, { icon: 'm9036', sound: 7020, star: s.id });
  G.fleets = G.fleets.filter(f => f.star !== s.id);
  s.owner = -1; s.pop = 0; s.metal = 0;
  for (const p of G.players) { const k = know(G, p, s.id); k.nova = s.nova; k.owner = -1; k.pop = 0; }
}
// fleets arriving at a star that has gone supernova are lost (FUN_10075b80)
function fleetArrives(G, f) {
  if (is505(G)) return fleetArrives505(G, f);
  const s = G.stars[f.star];
  if (s.nova >= 210) { msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} disappeared through a wormhole in space and is lost.`, { icon: 'm9036', star: s.id }); return false; }
  return true;
}

// =====================================================================
// The 5.0.5 turn (FUN_100728d0, FUN_10072a10). 'original' only: the
// rulesets built on this file keep the turn above (economy, afterMovement,
// refuel, randomEvents) until their own passes.
// =====================================================================
// FUN_100728d0 runs FUN_10072a10 once a 10-year step (game +0x62 years a
// turn); the computers plan on the first step, the winner is looked for on
// the last. FUN_10072a10 moves the year on first, then:
//   pass 1, each player in player order (FUN_10072a10 @10072b44-10072ea0):
//     "Year %d:" (1012); the alliance offers copied (game +0x1c0, +0x1e0);
//     a player who is out has its Armageddon switch turned on, and every
//     switch that is on goes into the mask (game +0x200); a computer plans
//     (FUN_10081cc0; the remake plans for every computer first, as for 3.0.1
//     and 4.0.5); surrender (FUN_100742b0), interest (FUN_100737b0),
//     dismantling (FUN_10074580), colony support (FUN_10073a80),
//     terraforming and mining (FUN_10073d70), research (FUN_10074f90), the
//     moves (FUN_10075b80; the remake's engine moves every fleet after pass 1)
//     and RestoreStarsBars (FUN_10076070);
//   every battle (FUN_1007e870), Armageddon (FUN_10076680), the novas
//     (FUN_100769b0);
//   pass 2a, the players in a random order (@10072f24-10072f80):
//     ReactToSupernova (FUN_10076d20), GetOtherScrapMetal (FUN_10077110),
//     income and growth (FUN_10077200), refuelling, colonizing and exploring
//     (FUN_10077aa0);
//   pass 2b, each player in player order: allies' arrivals (FUN_100782a0),
//     best buddies' maps (FUN_10078390), surrenders (FUN_10078560), big
//     battles (FUN_10078840), the canned messages and gifts, the clamps, the
//     first radical hand in 2010, milestones (FUN_1007a3f0), the end of a
//     player (FUN_1007abb0), pact news (FUN_100761c0), RestoreStarsBars,
//     SetPlanetDisplayValues (FUN_10078990), the design list's order
//     (FUN_10074cd0), the colony list's order (FUN_1007a5e0);
//   on the last step, the winner (FUN_1007acf0).
// The engine hooks: economy runs pass 1 for everyone on its first call of a
// step; battle runs the whole battle stage on its first call; refuel runs
// the novas and pass 2; checkElimination is the winner.
const W405 = () => E.RULESETS['405']; // 4.0.5's bar routines, the same code in 5.0.5 (below)
const rep = (G, p, code, args, opt) => msg(G, p.id, E.report(code - 999, ...(args || [])), opt);
// a share pm (per mille, as it stands: the shares are not scaled to their
// total) of an amount M: trunc(M x pm / 1000) under $2,000,000, trunc(M /
// 1000) x pm above (FUN_10073d70, FUN_10074f90, FUN_10077200)
const share505 = (M, pm) => !(pm > 0) ? 0 : M < 2000000 ? trunc(M * pm / 1000) : trunc(M / 1000) * pm;
const keyPm = (p, k) => W405().keyPm(p, k);
const setKeyPm = (p, k, v) => W405().setKeyPm(p, k, v);
// the colony list (player +0x1138): Savings (-2), Technology (-1) and the
// colonies; a new colony goes in front of the colonies (FUN_10078e80) and
// the colonies are sorted by income at the end of each turn (FUN_1007a5e0)
const slots505 = (G, p) => W405().slots301(G, p);
const colSlots505 = (G, p) => slots505(G, p).filter(k => typeof k === 'number');
// a colony's two bars, Terraform (slot +2) and Mine (+4), per mille, -1 done
const bars505 = (s) => W405().bars(s);
const setBars505 = (s, T, X) => W405().setBars(s, T, X);
// CONFIRMED (FUN_100712b0 GiveBarPercent, FUN_10071430 DetermineNewLevels,
// FUN_10071a50 / FUN_10071ab0 a slot's most and least share): 4.0.5's code
// (FUN_0045c61e, FUN_0045c6dc, FUN_0045ced4, FUN_0045cf57), line for line:
// the slot goes to pm and the others, but those being evacuated (slot +0x13)
// or finished (+0x14), make up the difference in proportion, between 0 and
// 1,000 (0 for one being evacuated or finished), round after round, each
// ceil(left x its share / their total); a total outside 990..1010 is then
// brought to 1,000 one per mille at a time
const giveBar505 = (G, p, k, pm) => W405().giveBarPercent(G, p, k, pm);
const t10i = (t) => Math.round(t * 10);
const limit505 = (G, p) => p.lim505 != null ? p.lim505 : -5 * Math.max(0, p.oInc || 0);

// ---------- pass 1 ----------
function economy505(G) {
  if (G.step505 === G.turn) return;
  G.step505 = G.turn;
  // CONFIRMED (FUN_10072a10 @10072a44-10072ad0): the step's tables cleared:
  // the stars marked for battles, meteors, the scrap over stars, the shock
  // wave, the big battles, a nova saved
  G.meteors = {}; G.scrapOver505 = {}; G.big505 = {}; G.battleAt505 = {}; G.arrivals505 = []; G.visit505 = {};
  G.surr505 = {}; G.armFired505 = false; G.armFizzled505 = false; G.miracle505 = -1; G.thrown505 = {};
  // the Armageddon mask as it was (FUN_10072a10 @10072b34, the news compare
  // it with the new one) and the alliance offers as they were (pact news)
  G.armPrev505 = G.armMask505 || {}; G.armMask505 = {};
  const snap = {}; for (const q of G.players) snap[q.id] = { allies: (q.allies || []).slice(), buddies: (q.buddies || []).slice() };
  G.pactPrev505 = G.pactCur505 || snap; G.pactCur505 = snap;
  const Y = G.year + 10;
  for (const p of G.players) {
    rep(G, p, 0x3f4, [Y], { icon: 'm9024', quiet: true });
    if (!p.alive) p.armageddon = true;
    if (p.armageddon) G.armMask505[p.id] = true;
    surrender505(G, p);
    p.refund505 = 0;
    interest505(G, p);
    dismantle505(G, p);
    colonySupport505(G, p);
    terraMine505(G, p);
    research505(G, p);
    for (const sid of colSlots505(G, p)) restoreBars505(G, p, G.stars[sid]);
  }
}
// CONFIRMED (FUN_100742b0): a player surrendering (player +0x8c; the number
// of players means "to no one") who isn't out: every fleet is marked to be
// dismantled (FUN_10074580 does it right after, in the same pass), every
// colony is given up (FUN_10079190: its colony ships are loaded first), the
// winner is to get this turn's money plus Ship Savings (not below 0) and the
// metal; the money, Ship Savings, interest and metal go to 0; "You have just
// surrendered." (0x452) or "You have just surrendered to %s." (0x453). The
// planets and money are handed over in pass 2 (FUN_10078560).
function surrender505(G, p) {
  if (p.surrenderTo == null || !p.alive || p.surrendered) return;
  const to = p.surrenderTo; p.surrenderTo = null;
  const h = { to, money: Math.max(0, (p.tm || 0) + p.savings), metal: p.metal, stars: [] };
  for (const f of G.fleets) if (f.owner === p.id) f.scrap301 = true;
  for (const sid of colSlots505(G, p).slice()) { h.stars.push(sid); decolonize505(G, p, sid); }
  p.tm = 0; p.net505 = 0; p.oInterest = 0; p.savings = 0; p.metal = 0;
  p.surrendered = true;
  G.surr505[p.id] = h;
  if (to >= 0 && G.players[to]) rep(G, p, 0x453, [G.players[to].name], { icon: 'p3040', sound: 2001 });
  else rep(G, p, 0x452, [], { icon: 'p3040', sound: 2001 });
}
// CONFIRMED (FUN_100737b0): the interest (player +0x4c) is added to this
// turn's money when it is positive or the money covers it; otherwise the
// money pays what it can, "Uh-oh! Having to borrow more to pay all your
// interest!" (0x46a) when Ship Savings are above the borrowing limit, and
// Ship Savings pay the rest. The next test, @10073870, compares the interest
// still owed (below 0) with what Ship Savings may still lend (0 or more), so
// the global warming and the fleet scrapped for a lack of funds (0x46b,
// 0x46c) never happen. (4.0.5's DeductInterest, FUN_0043361b, compares -owed.)
// The patch (fix 'globalWarming'): the owed amount compared the right way
// round, as 4.0.5 does; the branch that then runs is 5.0.5's own: what Ship
// Savings may lend pays part, "You don't have enough money! ... Global warming
// is taking place!" (0x46b), the rest goes on Ship Savings, every colony's
// temperature moves away from yours by rand(k, 2k) tenths (k the shortfall /
// 500, 1 to 1,000, as 4.0.5; colonies within +-3,000 degrees), and a fleet at a
// star picked at random from the fleet list is marked to be scrapped (0x46c).
function interest505(G, p) {
  let M = p.tm || 0, I = p.oInterest || 0;
  if (I > 0 || -I <= M) M += I;
  else {
    I += M; M = 0;
    const avail = Math.max(0, p.savings - limit505(G, p));
    if (avail > 0) rep(G, p, 0x46a, [], { icon: 'm9020', sound: 7020 });
    if (E.fixed(G, 'globalWarming') && avail < -I) {
      rep(G, p, 0x46b, [], { icon: 'm9020', sound: 2001 });
      I += avail; p.savings -= avail; p.savings += I;
      const k = clamp(trunc(-I / 500), 1, 1000);
      for (const sid of colSlots505(G, p)) {
        const s = G.stars[sid], t = t10(s.t);
        if (!(t < 30000 && t > -30000)) continue;
        const dt = RI(G, k, 2 * k);
        s.t = (t < t10(p.homeT) ? t - dt : t + dt) / 10;
      }
      const fl = G.fleets.filter(f => f.owner === p.id);
      if (fl.length) {
        const f = fl[RI(G, 0, fl.length - 1)];
        if (f.star != null && f.to == null) { f.scrap301 = true; rep(G, p, 0x46c, [], { icon: 'm9014' }); }
      }
    } else p.savings += I;
  }
  p.tm = M;
}
// CONFIRMED (FUN_10073a80): first every colony marked to be evacuated (slot
// +0x13) is given up, "You have evacuated %s." (0x3f1); then each colony
// losing money, in the colony list's order, is paid from this turn's money,
// then from Ship Savings down to the borrowing limit ("Warning! Savings is
// being used to support %s.", 0x467), then with its people: trunc(people x
// the part of the loss paid / the loss) - 100 are left ("Your colony at %s is
// not receiving sufficient funds to support itself.", 0x3f5; it doesn't grow
// this turn, slot +0x12), and at none it is given up (0x3f1). Each colony's
// count of ships built there this turn (+0x10) goes to 0.
function colonySupport505(G, p) {
  for (const sid of colSlots505(G, p).slice()) {
    const s = G.stars[sid];
    s.oStarve = false;
    if (s.abandon301) { rep(G, p, 0x3f1, [s.name], { icon: 'm9013', star: sid }); decolonize505(G, p, sid); }
  }
  let M = p.tm || 0, avail = Math.max(0, p.savings - limit505(G, p));
  for (const sid of colSlots505(G, p).slice()) {
    const s = G.stars[sid], inc = s.oInc || 0;
    if (!(inc < 0)) continue;
    if (M >= -inc) { M += inc; continue; }
    const rem = inc + M; M = 0;
    if (avail < -rem) {
      const short = -rem - avail;
      p.savings -= avail; avail = 0;
      const u = Math.max(0, trunc(popU(s) * (-inc - short) / -inc) - 100);
      setPopU(s, u);
      if (u === 0) { rep(G, p, 0x3f1, [s.name], { icon: 'm9013', star: sid }); decolonize505(G, p, sid); }
      else { s.oStarve = true; rep(G, p, 0x3f5, [s.name], { icon: 'm9020', star: sid }); }
    } else {
      rep(G, p, 0x467, [s.name], { icon: 'm9020', star: sid, quiet: true });
      avail += rem; p.savings += rem;
    }
  }
  p.tm = M;
}
// CONFIRMED (FUN_10073d70): each colony's money is its share of this turn's
// money; the Terraform bar's share of that, over $50 on a planet more than
// 2.56 times (or under 1/2.56) your gravity, gives "Warning: you are
// terraforming %s, a planet that will never become profitable." (0x3f7)
// every turn; the first $5,000 is sunk (slot +0x16); the rest moves the
// temperature trunc(sqrt(trunc(2 money / 3))) tenths of a degree
// (trunc(sqrt(trunc(7 money / 8))) with the climatologists, +0x8e bit 4;
// 4.0.5 worked out trunc(money / 3) x 2); past your temperature it stops
// there, the bar is done (-1), the overshoot is refunded at trunc(3 d^2 / 2)
// (trunc(8 d^2 / 7)) and "You have completely terraformed %s." (0x3f8). The
// Mine bar's share mines trunc(20 sqrt(money)) metal (25 with the
// archaeologists, FUN_10055d90); more than is left takes what is left, the
// bar is done, the overshoot is refunded by MetalToMoney (FUN_10055e30:
// trunc(m^2 / 400), trunc(m^2 / 625) with the bonus; from 25,001 metal
// trunc(m / 400) x m; 4.0.5 rounded up) and "%s has run out of metal." (0x404)
// or, on a planet more than 2.56 times your gravity, "... You should probably
// evacuate it." (0x405). The refunds go to Ship Savings in pass 2.
function terraMine505(G, p) {
  const M = p.tm || 0;
  for (const sid of colSlots505(G, p)) {
    const s = G.stars[sid];
    const money = share505(M, keyPm(p, sid));
    if (!(money > 0)) continue;
    let [T, X] = bars505(s);
    const h = hab(p, s);
    if (T > 0) {
      let t = share505(money, T);
      if (t > 50 && h.gR > 256) rep(G, p, 0x3f7, [s.name], { icon: 'm9013', star: sid });
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, t); t -= x; s.oSink += x; }
      const step = trunc(Math.sqrt(p.flags.terra ? trunc(t * 7 / 8) : trunc(t * 2 / 3)));
      const gap = Math.abs(t10i(p.homeT) - t10i(s.t));
      const cost = (d) => p.flags.terra ? trunc(d * d * 8 / 7) : trunc(d * d * 3 / 2);
      if (gap < step) {
        p.refund505 += cost(step) - cost(gap);
        s.t = p.homeT; T = -1;
        rep(G, p, 0x3f8, [s.name], { icon: 'm9017', star: sid });
      } else s.t = (t10i(s.t) + (t10i(p.homeT) < t10i(s.t) ? -step : step)) / 10;
    }
    if (X > 0) {
      let got = mineMetal(p, share505(money, X));
      const left = Math.floor(s.metal);
      if (left < got) {
        p.refund505 += mineMoney(p, got) - mineMoney(p, left);
        got = left; X = -1;
        rep(G, p, h.gR > 256 ? 0x405 : 0x404, [s.name], { icon: 'm9001', star: sid });
      }
      p.metal += got; s.metal -= got;
    }
    setBars505(s, T, X);
  }
}
// CONFIRMED (FUN_10074f90): the Technology slot's share of this turn's
// money, +10% after the research facility (+0x8e bit 0x20); "You are not
// spending any money on technology research." (0x437) every turn it is 0 for
// a player still in; each tech's money is its research share as it stands
// (player +0x80..) of that; points trunc(sqrt(trunc(money / 150)) x 8 / 10)
// for Range, Speed, Weapons and Shields, the same / 200 for Mini, and
// trunc(sqrt(trunc(money / 200)) x 0.5) for Radical (constants 150, 200, 8.0,
// 10.0, 0.5 at TOC-0x6078..-0x6098); a level costs trunc(trunc(L^2.5) / 3)
// for Range, (L+6)^2 Speed, (L+2)^2 Weapons and Shields, (L+7)^2 Mini and
// Radical, and each level finished gives a head start of rand(0, 40) (Radical
// 0-80). Then each tech whose progress passed its level, below 50, is set to
// it (above 6,000 points it is cut to 6,000) and reported, "You now have ...
// Technology" (0x3eb + tech); a Radical level makes a discovery (FUN_10079360).
function research505(G, p) {
  let T = share505(p.tm || 0, keyPm(p, 'tech'));
  if (p.flags.research) T += trunc(T / 10);
  if (T === 0 && p.alive) rep(G, p, 0x437, [], { icon: 'm9011', quiet: true });
  const old = {};
  for (const k of TECHS) old[k] = p.tech[k];
  // the research shares are per mille as they stand (player +0x80..); the
  // skin's Technology bars keep them as fractions of 1 once drawn, so those
  // are read as per mille (a total of 2 or less can't be per mille)
  let tsum = 0; for (const k of TECHS) tsum += p.talloc[k] || 0;
  const tpm = (k) => tsum > 0 && tsum <= 2 ? Math.round((p.talloc[k] || 0) * 1000) : (p.talloc[k] || 0);
  for (const k of TECHS) {
    const m = share505(T, tpm(k));
    const div = k === 'mini' || k === 'radical' ? 200 : 150;
    let pts = trunc(Math.sqrt(trunc(m / div)) * (k === 'radical' ? 0.5 : 0.8));
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100, cost = techLevelCost(k, L);
      if (cost <= 0) { p.tprog[k] += frac; continue; }
      const need = trunc(frac * cost / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += trunc(pts * 100 / cost); pts = 0; }
    }
  }
  for (const k of TECHS) {
    const lvl = trunc(p.tprog[k] / 100);
    if (!(old[k] < lvl && p.tech[k] < 50)) continue;
    p.tech[k] = lvl;
    if (p.tprog[k] > 6000) p.tprog[k] = 6000;
    if (k === 'radical') { radical(G, p); continue; } // 0x3f0 "Your Radical researchers have just made another wild discovery!" is radical()'s
    techMsg(G, p, k);
    const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k);
  }
}
// CONFIRMED (FUN_10076070 RestoreStarsBars, 4.0.5's FUN_004360af): a
// colony's bars above 0 are scaled up to fill 1,000; with none above 0, unless
// both are done, the one not done gets 1,000 (Terraform first)
function restoreBars505(G, p, s) {
  if (s.owner !== p.id) return;
  let [T, X] = bars505(s);
  const tot = Math.max(0, T) + Math.max(0, X);
  if (tot === 0) { if (T !== -1 || X !== -1) { if (T === -1) X = 1000; else T = 1000; } }
  else {
    if (T > 0) T += trunc(T * (1000 - tot) / tot);
    if (X > 0) X += trunc(X * (1000 - tot) / tot);
  }
  setBars505(s, T, X);
}
// CONFIRMED (FUN_10079190 DecolonizeStar): every fleet of yours at the star
// with colony ships takes on the colony's people, up to 10 a ship (each such
// fleet: min(10 x ships, its colonists + the people)); the colony's share goes
// to 0 and the others take it (GiveBarPercent); your record of the star and
// your best buddies' stop showing it as yours; the star is nobody's; the slot
// is taken out
function decolonize505(G, p, sid) {
  const s = G.stars[sid], u = popU(s);
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== sid || f.to != null) continue;
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (c > 0) f.colonists = Math.min(c * 10, (f.colonists || 0) + u);
  }
  const L = slots505(G, p);
  if (L.includes(sid)) { giveBar505(G, p, sid, 0); setKeyPm(p, sid, 0); }
  delete p.budget.col[sid];
  const i = L.indexOf(sid); if (i >= 0) L.splice(i, 1);
  for (const q of G.players) if (q.id === p.id || E.isBuddy(G, p.id, q.id)) { const k = know(G, q, sid); if (k.owner === p.id) k.owner = -1; }
  if (s.owner === p.id) { s.owner = -1; s.pop = 0; }
  s.abandon301 = false; s.done301 = false;
  delete s.bars; delete s._bsig;
}

// ---------- Armageddon and the novas ----------
// CONFIRMED (FUN_10076680): with every human's bit in the mask (an out
// player's switch is on, pass 1) and at least one of them still in, the
// quiet stars (nova value 0, owned or not) are shuffled and half of them
// (rounded down) get the value 200, so they explode in the nova step that
// follows; with fewer than 2 quiet stars it fizzles. The count of Armageddons
// goes up (game +0x216) and the distances shrink (FUN_10058900). Either way
// the mask is cleared; the switches are turned off only after one fired, in
// pass 2a (FUN_10076d20 @10076d4c), so after a fizzle a device left on tries
// again every turn.
function armageddon505(G) {
  const humans = G.players.filter(p => p.human);
  let any = false;
  for (const p of humans) { if (!G.armMask505[p.id]) return; if (p.alive) any = true; }
  if (!any) return;
  const quiet = G.stars.filter(s => !s.nova);
  if (quiet.length < 2) G.armFizzled505 = true;
  else {
    for (let i = 0; i < quiet.length; i++) { const j = RI(G, 0, quiet.length - 1); [quiet[i], quiet[j]] = [quiet[j], quiet[i]]; }
    for (let i = 0; i < trunc(quiet.length / 2); i++) quiet[i].nova = 200;
    G.armFired505 = true;
    G.armageddons = (G.armageddons || 0) + 1;
  }
  G.armMask505 = {};
}
// CONFIRMED (FUN_100769b0): each red star (value 10..209), unless someone
// owns it and rand(1, 100) is 94 or more, goes 10 higher; past 209 it
// explodes (its value becomes the year) and every other star within 10 ly
// gets rand(max(100, trunc(10000 / d) - 1000), trunc(10000 / d)) metal
// (@10076ab8-10076b14), kept for the shock wave; a star saved goes back to 0
// (the last one saved is reported in pass 2a). Then rand(1, 9) and rand(1, 11)
// are drawn; with the Novas option (game +0x5c bit 2), from 2750 on, when
// their product is 1 and no star is red, a random star nobody owns (the next
// one along from a random start) gets the value rand(0, 10) x 10 + 10.
function novas505(G) {
  const Y = G.year + 10;
  for (const s of G.stars) {
    if (!(s.nova >= 10 && s.nova < 210)) continue;
    if (s.owner < 0 || RI(G, 1, 100) < 94) {
      s.nova += 10;
      if (s.nova > 209) {
        s.nova = Y;
        for (const o of G.stars) {
          if (o === s) continue;
          const d = distance(G, s, o);
          if (d < 11) { const hi = trunc(10000 / d), m = RI(G, Math.max(100, hi - 1000), hi); G.thrown505[o.id] = (G.thrown505[o.id] || 0) + m; o.metal += m; }
        }
      }
    } else { s.nova = 0; G.miracle505 = s.id; }
  }
  const a = RI(G, 1, 9), b = RI(G, 1, 11);
  if (G.opts.novas !== false && Y > 2749 && a * b < 2) {
    if (G.stars.some(s => s.nova > 0 && s.nova < 211)) return;
    const n = G.stars.length, s0 = RI(G, 0, n - 1);
    let i = s0;
    do { const s = G.stars[i]; if (!s.nova && s.owner < 0) { s.nova = RI(G, 0, 10) * 10 + 10; return; } i = (i + 1) % n; } while (i !== s0);
  }
}

// ---------- pass 2 ----------
function pass2_505(G) {
  armageddon505(G);
  novas505(G);
  const Y = G.year + 10;
  // CONFIRMED (FUN_10072a10 @10072ef0-10072f20): pass 2a takes the players
  // in a random order (each place swapped with a random one)
  const order = G.players.slice();
  for (let i = 0; i < order.length; i++) { const j = RI(G, 0, order.length - 1); [order[i], order[j]] = [order[j], order[i]]; }
  for (const p of order) {
    // "Oh No! It's armageddon!" (0x46d) and "The armageddon device has caused
    // half of the stars to supernova!" (0x46f), or the fizzle (0x46e)
    if (G.armFired505) { rep(G, p, 0x46d, [], { icon: 'm9036', sound: 8000 }); rep(G, p, 0x46f, [Y], { icon: 'm9036', sound: 2001 }); }
    if (G.armFizzled505) rep(G, p, 0x46e, [], { icon: 'm9036' });
    react505(G, p);
    otherScrapMetal505(G, p);
    income505(G, p);
    colonizeExplore505(G, p);
  }
  for (const p of G.players) {
    allyArrivals505(G, p);
    buddyMaps505(G, p);
    surrenders505(G, p);
    bigBattles505(G, p);
    // CONFIRMED (@10073190-10073220): "Warning! After supporting your
    // planets and paying your interest, you have no money to spend!" (0x468)
    // when the net is below 0 (it is then 0); the net at most $1,000,000,000,
    // this turn's money 0..$1,000,000,000, Ship Savings within +-$1,000,000,000
    if ((p.net505 || 0) < 0) { rep(G, p, 0x468, [], { icon: 'm9020', sound: 7020 }); p.net505 = 0; }
    p.net505 = Math.min(1e9, p.net505 || 0);
    p.tm = clamp(p.tm || 0, 0, 1e9);
    p.savings = clamp(p.savings, -1e9, 1e9);
    // CONFIRMED (@10073224-10073250): in 2010 a player who hasn't had a hand
    // is dealt one, "Your Radical researchers are hard at work on another
    // discovery!" (0x466)
    if (Y === 2010 && !p.hand505) { p.hand505 = true; refillDeck(G, p); rep(G, p, 0x466, [], { icon: 'm9010', quiet: true }); }
    milestones505(G, p);
    gameEnd505(G, p);
    if (p.alive) pactNews505(G, p);
    for (const sid of colSlots505(G, p)) restoreBars505(G, p, G.stars[sid]);
    displayValues505(G, p);
    sortDesigns505(G, p);
    sortColonies505(G, p);
  }
  G.surr505 = {};
}
// CONFIRMED (FUN_10076d20, in pass 2a): after an Armageddon fired, the
// player's switch is off. For each star: a red one (10..209) gives "Uh-oh! %s
// has started growing and is turning bright red in hue!" (0x43a) every turn,
// to every player; one that exploded this turn gives "%s has just gone
// supernova. The planet has been obliterated." (0x43b; not after an
// Armageddon), the player's fleets there are lost, its record of the star is
// cleared (never explored), and a colony of its there is given up; the star
// saved this turn gives "It's a miracle! Your scientists have figured out to
// prevent %s from going supernova." (0x485) to its owner and "Wow, that's
// weird! %s is no longer red ..." (0x486) to everyone else. Then each colony
// the shock wave reached loses min(people, metal x rand(40, 60)) people ("The
// shock wave from the supernova threw %s metal at %s, killing %s people.",
// 0x43c); with none left it is given up ("The meteor shower destroyed your
// colony at %s.", 0x438); else the metal is the player's.
function react505(G, p) {
  const Y = G.year + 10;
  if (G.armFired505) p.armageddon = false;
  for (const s of G.stars) {
    if (s.nova) {
      if (s.nova < 10 || s.nova > 209) {
        if (s.nova === Y) {
          if (!G.armFired505) rep(G, p, 0x43b, [s.name], { icon: 'm9036', sound: 7020, star: s.id });
          G.fleets = G.fleets.filter(f => !(f.owner === p.id && f.star === s.id && f.to == null));
          const k = know(G, p, s.id);
          Object.assign(k, { explored: false, seen: -1, owner: -1, pop: 0, nova: s.nova });
          if (s.owner === p.id) decolonize505(G, p, s.id);
        }
      } else rep(G, p, 0x43a, [s.name], { icon: 'm9036', star: s.id });
    }
    if (G.miracle505 === s.id) rep(G, p, s.owner === p.id ? 0x485 : 0x486, [s.name], { icon: 'm9010', star: s.id, quiet: s.owner !== p.id });
  }
  for (const sid of colSlots505(G, p).slice()) {
    const m = G.thrown505[sid]; if (!m) continue;
    const s = G.stars[sid], kill = Math.min(popU(s), m * RI(G, 40, 60));
    setPopU(s, popU(s) - kill);
    rep(G, p, 0x43c, [fmt(m), s.name, fmt(kill * 1000)], { icon: 'm9036', star: sid });
    if (popU(s) === 0) { rep(G, p, 0x438, [s.name], { icon: 'm9036', star: sid }); decolonize505(G, p, sid); }
    else { p.metal += m; s.metal -= m; }
  }
}
// CONFIRMED (FUN_10077200): first the dip: the Dip into Savings percentage
// (player +0x54) of Ship Savings, when above 0, comes out of them; then the
// Savings slot's share of this turn's money goes in, the interest is worked
// out on what is there (FUN_10054de0: trunc(10 sqrt), at most half; debts 15%,
// 10% with the better credit; +50% with the better rate), and the refunds go
// in. The dip is next turn's money (and counts in the gross income, so the
// borrowing limit, -5 x the gross, goes down with it). Then for each colony in
// the list: at a star with a battle this turn, a colony no longer yours or with
// nobody left is given up (no report); a meteor shower (ships dismantled in
// hyperspace, 50 people a unit of metal) kills what it can and the colony
// ships there take in up to 10 a ship of those killed ("Oh no! %s people were
// killed when a heavy meteor shower hit %s.", 0x431, those who didn't escape;
// "%s people managed to escape ...", 0x482), and with nobody left it is given
// up (0x438); growth as before (not when starving); its income; "%s has just
// become a profitable colony." (0x406), "It's a baby boom! ..." (0x407).
function income505(G, p) {
  let dip = 0;
  if (p.savings > 0 && p.dip > 0) { dip = trunc(p.savings * Math.min(100, p.dip) / 100); p.savings -= dip; }
  p.savings += Math.max(0, share505(p.tm || 0, keyPm(p, 'sav')));
  p.oInterest = interestOn(p, p.savings);
  p.savings += p.refund505 || 0; p.refund505 = 0;
  let gross = dip, net = p.oInterest + dip;
  p.tm = dip;
  for (const sid of colSlots505(G, p).slice()) {
    const s = G.stars[sid];
    if (G.battleAt505[sid] && (s.owner !== p.id || !(popU(s) > 0))) { decolonize505(G, p, sid); continue; }
    const m = (G.meteors || {})[sid];
    if (m > 0) {
      let kill = Math.min(popU(s), m * 50), saved = 0;
      setPopU(s, popU(s) - kill);
      for (const f of G.fleets) if (f.owner === p.id && f.star === sid && f.to == null) {
        let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
        if (!(c > 0)) continue;
        const x = Math.min(c * 10 - (f.colonists || 0), kill);
        if (x > 0) { kill -= x; saved += x; f.colonists = (f.colonists || 0) + x; }
      }
      rep(G, p, 0x431, [fmt(kill * 1000), s.name], { icon: 'm9021', sound: 3003, star: sid });
      if (saved > 0) rep(G, p, 0x482, [fmt(saved * 1000), s.name], { icon: 'm9021', star: sid });
      if (popU(s) < 1) { rep(G, p, 0x438, [s.name], { icon: 'm9036', star: sid }); decolonize505(G, p, sid); continue; }
    }
    const before = s.oInc == null ? -7501 : s.oInc, h = hab(p, s);
    let mx = Math.max(10, 500000 - 12 * h.H);
    if (p.flags.pop) mx = trunc(mx * 11 / 10);
    let u = popU(s);
    if (!s.oStarve) {
      let add;
      if (u < mx) {
        if (before < -7499) add = Math.min(trunc(mx / 1000), 2 * u) + RI(G, 0, 5);
        else {
          const r1 = RI(G, 0, 5), r2 = RI(G, 0, trunc(mx / 100)), base = trunc(mx / 20);
          add = base + r2 < 2 * u + r1 ? base + RI(G, 0, trunc(mx / 100)) : 2 * u + RI(G, 0, 5);
        }
        u += add;
        // only in the branch for a colony earning -7,499 or more (FUN_10077200;
        // Palm FUN_00054d94 the same): a new colony doesn't report it
        if (before >= -7499 && mx <= u) rep(G, p, 0x408, [s.name], { icon: 'm9030', star: sid, quiet: true });
      } else u += trunc(mx / 1000) + RI(G, 0, trunc(mx / 10000));
      setPopU(s, u);
    }
    const inc = incomeU(u, h.H);
    s.oInc = inc;
    if (inc > 0) { p.tm += inc; gross += inc; }
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; rep(G, p, 0x406, [s.name], { icon: 'm9000', sound: 2000, star: sid }); }
    if (before < -7499 && inc > -7500) rep(G, p, 0x407, [s.name], { icon: 'm9023', star: sid });
  }
  p.oInc = gross; p.lastGross = gross; p.lastNet = net; p.lastIncome = net - p.oInterest; p.lastInterest = p.oInterest;
  p.net505 = net; p.lim505 = -5 * gross;
}
// CONFIRMED (FUN_10078c80, ExploreStar): the player's record of the star is
// made from the star as it is now; it returns whether the star was explored
// for the first time (record year below 2000). The remake's engine explores on
// arrival (and sends the explore report); this keeps the record of every star
// with a fleet or a colony of the player up to date, as 5.0.5 does each turn.
function explore505(G, p, sid) {
  const was = know(G, p, sid).explored;
  observe(G, p, sid);
  return !was;
}
// CONFIRMED (FUN_10077aa0): first each star's tanker fuel: 200 a Tanker of
// the player's there. Then each fleet of the player's at a star: a fleet that
// isn't all Biologicals is refuelled at a colony of the player's or an ally's
// (and colony ships at the player's own are loaded, 10 a ship); one named
// "Valdez" springs a leak one time in 250 ("Oh no! The Valdez has sprung a
// leak! ...", 0x47e; nothing else happens); a fleet still short of fuel takes
// it from the star's tankers, one unit of fuel for each ship (25 for a
// Dreadnought) a light-year, while they have it (when they run out the star
// is noted). A Biological fleet at a colony of the player's or an ally's eats
// 200 people a Biological for each light-year of fuel while the colony has
// 200 a Biological + 100 ("Your fleet of %s has eaten %s people while
// refueling at %s.", 0x402; the owner: 0x403). Then each fleet at a star
// again: an empty one is deleted; the star is marked as visited (star +0x20)
// and explored (FUN_10078c80); a fleet with colonists at a star that isn't the
// player's or an ally's colonizes it with all of them (FUN_10078e80); a fleet
// with orders that can't go on gets "There were not enough tankers to fully
// refuel your fleet of %s at %s." (0x480) where the tankers ran out, "Your %s
// can no longer reach %s because some of the ships in the fleet don't have
// enough range." (0x484) when full and still short, else "Your %s is waiting
// to refuel before it can continue on to %s." (0x3fe); one that can go on,
// unless it colonized or explored there or a battle was seen there this year,
// gets "Your fleet of %s has stopped at %s on the way to %s." (0x400) if it
// arrived this turn, else "Your fleet of %s is fully refueled and is ready to
// depart %s for %s." (0x481). Then every colony is explored again. A computer
// on a Spiral map (game +0x56 = 2), before 2100, also explores stars 0 to
// (players - 1), which on a Spiral are the players' homes (@10077fc8).
function colonizeExplore505(G, p) {
  const Y = G.year + 10;
  const mine = () => G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null);
  const pool = {}, short = {};
  const count = (f, t) => { let n = 0; for (const k in f.ships) { const d = getDesign(G, p.id, +k); if (d && (t == null || d.type === t)) n += f.ships[k]; } return n; };
  for (const f of mine()) pool[f.star] = (pool[f.star] || 0) + 200 * count(f, 'tanker');
  for (const f of mine()) {
    const s = G.stars[f.star], owner = s.owner, max = fleetMaxRange(G, f);
    const ds = fleetDesigns(G, f), bio = ds.length > 0 && ds.every(d => d.type === 'bio');
    if (!bio) {
      if (owner >= 0 && isAllied(G, p.id, owner)) { f.fuel = max; if (owner === p.id) f.colonists = count(f, 'colony') * 10; }
      if (RI(G, 1, 250) === 1 && f.name === 'Valdez') rep(G, p, 0x47e, [s.name], { icon: 'm9038', star: s.id });
      if (!f.sat && f.fuel < max) {
        const cost = count(f) + 24 * count(f, 'dread'), had = pool[f.star] || 0;
        while (f.fuel < max && cost <= (pool[f.star] || 0)) { f.fuel = Math.min(max, f.fuel + 1); pool[f.star] -= cost; }
        if (f.fuel < max && had > 0) short[f.star] = true;
      }
    } else if (owner >= 0 && isAllied(G, p.id, owner) && f.fuel < max) {
      const n = count(f, 'bio');
      let eaten = 0;
      while (f.fuel < max && popU(s) >= n * 200 + 100) { f.fuel++; setPopU(s, popU(s) - n * 200); eaten += n * 200; }
      if (eaten) {
        rep(G, p, 0x402, [fleetLabel(G, f), fmt(eaten * 1000), s.name], { icon: 'm9026', sound: 7013, star: s.id });
        if (owner !== p.id) rep(G, G.players[owner], 0x403, [p.name, fmt(eaten * 1000), s.name], { icon: 'm9026', sound: 7013, star: s.id });
      }
    }
  }
  for (const f of mine()) {
    if (fleetCount(f) === 0) { G.fleets.splice(G.fleets.indexOf(f), 1); continue; }
    const sid = f.star, s = G.stars[sid];
    (G.visit505[sid] || (G.visit505[sid] = new Set())).add(p.id);
    const newly = explore505(G, p, sid) || !!f.new505;
    f.new505 = false;
    let colonized = false;
    if (s.owner !== p.id && (f.colonists || 0) > 0 && (s.owner < 0 || !isAllied(G, p.id, s.owner))) {
      colonized = settle505(G, p, s, f.colonists); f.colonists = 0;
    }
    const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
    if (!stops.length) continue;
    const label = fleetLabel(G, f), next = G.stars[stops[0]], fin = G.stars[stops[stops.length - 1]];
    if (!departs505(G, f)) {
      if (short[sid]) rep(G, p, 0x480, [label, s.name], { icon: 'm9038', star: sid, quiet: true });
      else if (f.fuel >= fleetMaxRange(G, f) && fleetMaxRange(G, f) < distance(G, s, next)) rep(G, p, 0x484, [label, next.name], { icon: 'm9038', star: sid });
      else rep(G, p, 0x3fe, [label, next.name], { icon: 'm9038', star: sid, quiet: true });
    } else if (!colonized && !newly && !(know(G, p, sid).by505 === Y)) {
      rep(G, p, f.arrived505 ? 0x400 : 0x481, [label, s.name, fin.name], { icon: 'm9038', star: sid, quiet: true });
    }
    f.arrived505 = false;
  }
  for (const sid of colSlots505(G, p)) explore505(G, p, sid);
  if (!p.human && G.opts.shape === 'spiral' && Y < 2100) for (let i = 0; i < G.players.length && i < G.stars.length; i++) explore505(G, p, i);
}
// CONFIRMED (FUN_10078e80 ColonizeStar): nothing if the player already has
// the colony; "You have colonized %s." (0x40b); the slot goes in front of the
// colonies; its people are the colonists (all the fleet had aboard); income
// -7,501 (the net drops as much); Terraform 900 / Mine 100 within 2.56 times
// your gravity, else Mine 1,000; at your own temperature Terraform done and
// $5,000 counted as sunk; with no metal Mine done. Its share: GiveBarPercent
// to 0 if both are done, else to 7,500,000 / next turn's money when that is
// over $20,000 (FUN_100712b0).
function settle505(G, p, s, n) {
  const L = slots505(G, p);
  if (L.includes(s.id)) return false;
  rep(G, p, 0x40b, [s.name], { icon: 'm9031', sound: 7018, star: s.id });
  let i = 0; while (i < L.length && typeof L[i] !== 'number') i++;
  L.splice(i, 0, s.id);
  s.owner = p.id; setPopU(s, n); s.everProfit = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = false; s.abandon301 = false; s.done301 = false;
  p.net505 = (p.net505 || 0) - 7501;
  let T, X;
  if (hab(p, s).gR <= 256) { T = 900; X = 100; } else { T = 0; X = 1000; }
  if (t10i(s.t) === t10i(p.homeT)) { s.oSink = 5000; T = -1; X = 1000; }
  if (Math.floor(s.metal) === 0) X = -1;
  setBars505(s, T, X);
  know(G, p, s.id).owner = p.id;
  p.budget.col[s.id] = 0;
  if (T === -1 && X === -1) giveBar505(G, p, s.id, 0);
  else if ((p.tm || 0) > 20000) giveBar505(G, p, s.id, trunc(7500000 / p.tm));
  if (s.debris) { s.metal += s.debris; s.debris = 0; }
  G.stat.colonized++;
  return true;
}
// CONFIRMED (FUN_10075f10): a fleet with orders at a star can leave when the
// next hop is within its fuel, unless it has colony ships with no colonists
// aboard and is at a colony of the player's not being evacuated: it waits
// there to be loaded (pass 2a loads it). Otherwise it waits with its orders.
function departs505(G, f) {
  if (f.sat || f.star == null || f.to != null) return false;
  const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
  if (!stops.length) return false;
  if (distance(G, G.stars[f.star], G.stars[stops[0]]) > f.fuel + 1e-9) return false;
  const s = G.stars[f.star];
  if (fleetHas(G, f, 'colony') && !(f.colonists > 0) && s.owner === f.owner && !s.abandon301) return false;
  return true;
}

// CONFIRMED (FUN_10075b80 @10075d84-10075e0c, FUN_100782a0): a fleet ending
// its trip at a star that isn't its owner's is listed (at most 5 a player);
// in pass 2b every ally of the fleet's owner who owns that star, or whose
// fleet was there this turn (star +0x20), gets "%s's fleet of %s has arrived
// at %s." (0x401). Enemies are not told (the battle reports tell them).
function allyArrivals505(G, p) {
  for (const a of G.arrivals505) {
    if (a.from === p.id || !isAllied(G, a.from, p.id)) continue;
    const s = G.stars[a.star];
    if (s.owner === p.id || (G.visit505[a.star] && G.visit505[a.star].has(p.id))) rep(G, p, 0x401, [G.players[a.from].name, a.label, s.name], { icon: 'm9038', star: a.star });
  }
}
// a record's year: when the star was last looked at (record +0)
const recYear505 = (k) => k && k.explored && k.seen >= 0 ? 2010 + 10 * k.seen : 0;
// CONFIRMED (FUN_10078390): for each star the player explored this turn, or
// saw a battle at this turn, each best buddy whose record is older explores it
// too (FUN_10078c80 with the player as the finder: "%s has explored %s. ...",
// 0x40a, when the buddy hears of it, player +0x1112, on from the start); for a
// battle (seen this turn, the battle's star record set) the buddy's record,
// if both its years are older, is copied whole. (4.0.5's second branch could
// never run; 5.0.5's does.)
function buddyMaps505(G, p) {
  const Y = G.year + 10;
  for (const s of G.stars) {
    const k = know(G, p, s.id), explored = recYear505(k) === Y, fought = k.by505 === Y;
    if (!explored && !fought) continue;
    for (const q of G.players) {
      if (q.id === p.id || !E.isBuddy(G, p.id, q.id)) continue;
      const kq = know(G, q, s.id);
      if (explored && recYear505(kq) < Y) {
        const was = kq.explored;
        observe(G, q, s.id);
        if (!was) msg(G, q.id, `${p.name} has explored ${s.name}. Gravity: ${(s.g / q.homeG).toFixed(2)}G. Temp: ${Math.round(72 + s.t - q.homeT)}°. Metal: ${fmt(s.metal)}.`, { icon: 'm9028', star: s.id, explore: exploreQuality(G, q, s), quiet: true });
      } else if (fought && !explored && recYear505(kq) < Y && !(kq.by505 >= Y)) {
        Object.assign(kq, JSON.parse(JSON.stringify(k)));
      }
    }
  }
}
// CONFIRMED (FUN_10078560): every other player hears of each surrender, "%s
// has just surrendered." (0x450) or "... to %s." (0x451); the winner gets the
// money ("%s surrenders to you, giving you $%s.", 0x47b) and the metal
// (0x47c), and each of the planets that no player but the two, not allied with
// the one surrendering, visited this turn and that nobody else has taken: "%s
// surrenders to you, giving you the planet %s." (0x47d), explored and colonized
// with 1 colonist (FUN_10078e80, so "You have colonized %s." too).
function surrenders505(G, p) {
  for (const qid in G.surr505) {
    const q = G.players[qid], h = G.surr505[qid];
    if (q.id === p.id) continue;
    if (h.to >= 0 && G.players[h.to]) rep(G, p, 0x451, [q.name, G.players[h.to].name], { icon: 'm9036' });
    else rep(G, p, 0x450, [q.name], { icon: 'm9036' });
    if (h.to !== p.id) continue;
    rep(G, p, 0x47b, [q.name, fmt(h.money)], { icon: 'm9048', sound: 7015 });
    rep(G, p, 0x47c, [q.name, fmt(h.metal)], { icon: 'm9046', sound: 7015 });
    p.savings += h.money; p.metal += h.metal;
    for (const sid of h.stars) {
      const s = G.stars[sid], v = G.visit505[sid];
      const watched = v && [...v].some(r => r !== p.id && r !== q.id && !isAllied(G, q.id, r));
      if (watched || !(s.owner < 0 || s.owner === q.id)) continue;
      rep(G, p, 0x47d, [q.name, s.name], { icon: 'm9031', sound: 7015, star: sid });
      explore505(G, p, sid);
      settle505(G, p, s, 1);
    }
  }
}
// CONFIRMED (FUN_10078840): at a star marked for a big battle this turn
// (FUN_100803e0), a player whose record of the star and whose last battle
// seen there are both more than 10 years old hears "The amount of energy
// emanating from %s suggests a big battle just took place." (1099); the
// battle is then counted as seen this year.
function bigBattles505(G, p) {
  const Y = G.year + 10;
  for (const sid in G.big505) {
    const k = know(G, p, +sid);
    if (recYear505(k) < Y - 10 && !((k.by505 || 0) >= Y - 10)) { rep(G, p, 1099, [G.stars[sid].name], { icon: 'm9036', star: +sid, quiet: true }); k.by505 = Y; }
  }
}
// CONFIRMED (FUN_1007a3f0): "Congratulations, %s! Your population now exceeds
// %s!" (0x473), once each, for more than 1,000,000 and 2,500,000 units of
// people, then 5,000,000, 10,000,000 and 20,000,000 (player +0x1114). The
// tests are chained: in a turn a player can hear of only one of the first two
// and one of the last three (the first not yet heard), so a jump past two
// marks reports the lower one and the higher one on a later turn.
function milestones505(G, p) {
  let tot = 0; for (const sid of colSlots505(G, p)) tot += popU(G.stars[sid]);
  const f = p.mile505 || (p.mile505 = {});
  const say = (n, b) => { rep(G, p, 0x473, [p.name, fmt(n * 1000)], { icon: 'm9030', sound: 7019 }); f[b] = true; };
  if (tot > 1000000 && !f[1]) say(1000000, 1);
  else if (tot > 2500000 && !f[2]) say(2500000, 2);
  if (tot > 5000000 && !f[4]) say(5000000, 4);
  else if (tot > 10000000 && !f[8]) say(10000000, 8);
  else if (tot > 20000000 && !f[16]) say(20000000, 16);
}
// CONFIRMED (FUN_1007abb0): a player with no colony and no fleet with
// colonists aboard (but those flying to a star that has exploded) is out
// (+0x34): its money, Ship Savings, net and metal go to 0. (Empty colony ships
// don't keep a player in.) Its fleets are dismantled in its next pass 1, and
// the winner check reports it.
function gameEnd505(G, p) {
  if (!p.alive) return;
  if (colSlots505(G, p).length) return;
  for (const f of G.fleets) {
    if (f.owner !== p.id || !(f.colonists > 0)) continue;
    if (f.to != null && G.stars[f.to].nova > 209) continue;
    return;
  }
  p.savings = 0; p.tm = 0; p.net505 = 0; p.metal = 0;
  p.alive = false; p.outNoted505 = false;
}
// CONFIRMED (FUN_100761c0, for a player still in): news of each other player
// still in, comparing the offers copied in pass 1 with those of the turn
// before: "%s has offered to be your best buddy." (0x445) or else "%s has
// offered to ally with you." (0x43f); "%s no longer wants to be your best
// buddy. ..." (0x446) or else "%s no longer wants to ally with you." (0x440);
// the same from your side (0x447, 0x441, 0x448, 0x442); "You are now best
// buddies with %s." (0x449; each notes the other's planet preference) or else
// "You have formed an alliance with %s." (0x443); "Your alliance with %s is
// gone." (0x444) or else "Your best buddy relationship with %s is gone. You're
// only allies now." (0x44a). Then, unless an Armageddon fired, "%s's armageddon
// device has just been turned on!" (0x470) / "Whew! %s's armageddon device was
// just turned off." (0x471) for each switch that changed in the mask (the mask
// is cleared when it fires or fizzles, so after a fizzle every switch reads as
// just turned off, and on again the next turn).
function pactNews505(G, p) {
  const prev = G.pactPrev505 || {}, cur = G.pactCur505 || {};
  const w = (snap, a, b, key) => a === b || !!(snap[a] && snap[a][key].includes(b));
  const ally = (snap, a, b) => w(snap, a, b, 'allies') && w(snap, b, a, 'allies');
  const bud = (snap, a, b) => ally(snap, a, b) && w(snap, a, b, 'buddies') && w(snap, b, a, 'buddies');
  for (const q of G.players) {
    if (q.id === p.id || !q.alive) continue;
    const say = (c) => rep(G, p, c, [q.name], { icon: 'm9024', quiet: c === 0x441 || c === 0x447 });
    const he = (snap, key) => w(snap, q.id, p.id, key), me = (snap, key) => w(snap, p.id, q.id, key);
    if (!he(prev, 'buddies') && he(cur, 'buddies')) say(0x445);
    else if (!he(prev, 'allies') && he(cur, 'allies')) say(0x43f);
    if (he(prev, 'buddies') && !he(cur, 'buddies')) say(0x446);
    else if (he(prev, 'allies') && !he(cur, 'allies')) say(0x440);
    if (!me(prev, 'buddies') && me(cur, 'buddies')) say(0x447);
    else if (!me(prev, 'allies') && me(cur, 'allies')) say(0x441);
    if (me(prev, 'buddies') && !me(cur, 'buddies')) say(0x448);
    else if (me(prev, 'allies') && !me(cur, 'allies')) say(0x442);
    if (!bud(prev, p.id, q.id) && bud(cur, p.id, q.id)) { say(0x449); if (p.ai && p.ai.prefG) { p.ai.prefG[q.id] = Math.max(1, Math.round(q.homeG * 100)); p.ai.prefT[q.id] = Math.round(q.homeT * 10); } }
    else if (!ally(prev, p.id, q.id) && ally(cur, p.id, q.id)) { say(0x443); (p.news = p.news || []).push({ type: 'allied', with: q.id }); }
    if (ally(prev, p.id, q.id) && !ally(cur, p.id, q.id)) { say(0x444); (p.news = p.news || []).push({ type: 'broken', with: q.id }); }
    else if (bud(prev, p.id, q.id) && !bud(cur, p.id, q.id)) say(0x44a);
  }
  if (G.armFired505) return;
  for (const q of G.players) {
    if (q.id === p.id || !q.alive) continue;
    const was = !!G.armPrev505[q.id], now = !!G.armMask505[q.id];
    if (!was && now) rep(G, p, 0x470, [q.name], { icon: 'm9036' });
    if (was && !now) rep(G, p, 0x471, [q.name], { icon: 'm9036' });
  }
}
// CONFIRMED (FUN_10078990 SetPlanetDisplayValues, 4.0.5's FUN_00438b77): at
// your own temperature Terraform is done (Mine, if not done, 1,000); away from
// it with Terraform done, Terraform gets 1,000 less Mine (1,000 if Mine is
// done); with no metal Mine is done (Terraform, if not done, 1,000). A colony
// with both done is finished (slot +0x14) and its share is given away.
function displayValues505(G, p) {
  const L = colSlots505(G, p);
  for (const sid of L) {
    const s = G.stars[sid];
    let [T, X] = bars505(s);
    const home = t10i(s.t) === t10i(p.homeT);
    if (home && T >= 0) { T = -1; if (X >= 0) X = 1000; }
    if (!home && T === -1) T = X < 0 ? 1000 : 1000 - X;
    if (Math.floor(s.metal) === 0 && X >= 0) { X = -1; if (T >= 0) T = 1000; }
    setBars505(s, T, X);
    s.done301 = T < 0 && X < 0;
  }
  for (const sid of L) if (G.stars[sid].done301 && keyPm(p, sid) !== 0) giveBar505(G, p, sid, 0);
}
// CONFIRMED (FUN_10074cd0): the design list is re-ordered each turn: for each
// class in turn (Scout, Dreadnought, Fighter, Tanker, Colony Ship, Satellite,
// Biological), the last design of that class left in the unsorted part goes to
// the end of it, which then ends one place earlier. So the newest design of
// each class ends up at the back, the classes in reverse order, and the order
// of "oldest" and "newest" the retiring of types (FUN_10074580) and the
// computers go by is this one.
const CLASS505 = { scout: 0, dread: 1, fighter: 2, tanker: 3, colony: 4, satellite: 5, bio: 6, decoy: 2 };
function sortDesigns505(G, p) {
  const L = p.designs.filter(d => !d.scrapped), dead = p.designs.filter(d => d.scrapped);
  let end = L.length - 1;
  for (let t = 0; t <= 6 && end >= 0; t++) {
    for (let j = end; j >= 0; j--) {
      if (CLASS505[L[j].type] !== t) continue;
      if (j !== end) [L[j], L[end]] = [L[end], L[j]];
      end--;
      break;
    }
  }
  p.designs = L.concat(dead);
}
// CONFIRMED (FUN_1007a5e0): the colony list is sorted by income, lowest first
// (an exchange sort over the colonies, Savings and Technology keeping their
// places), at the end of every turn; colony support and the computers take the
// colonies in this order.
function sortColonies505(G, p) {
  const L = slots505(G, p), inc = (k) => G.stars[k].oInc || 0;
  for (let i = 0; i < L.length - 1; i++) for (let j = i + 1; j < L.length; j++)
    if (typeof L[i] === 'number' && typeof L[j] === 'number' && inc(L[j]) < inc(L[i])) [L[i], L[j]] = [L[j], L[i]];
}
// CONFIRMED (FUN_1007acf0, on the last step of an End Turn, after 2000 with
// two players or more): each player just out (+0x34 = 1, then the year) is
// reported to everyone, "You have just been eliminated from the game." (0x433)
// and "%s has just been eliminated from the game." (0x432). Then, when no
// human is left, or every player still in is allied with every other, and
// nobody has won yet: with fewer than two humans in, or fewer than two
// players, or after the warning on an earlier turn (or with option 0x10), the
// players still in win (game +0x1bc), each winner hears "Congratulations! You
// won a %d difficulty game and have earned %s master points." (0x436, the
// skin's), each other player "%s has just won the game." (0x434) for a human
// winner, or "Your ally %s has just won the game." (0x435) among the winners;
// otherwise "Your alliance will win the game next turn if it holds!" (0x469).
// A pair not allied clears the warning. (No human winner: the humans are told
// nothing; the remake's game ends there. With nobody left in, 5.0.5 never
// ends; the remake ends with no winner.)
function checkElimination505(G) {
  const Y = G.year + 10;
  if (Y <= 2000 || G.players.length < 2) return;
  for (const p of G.players) {
    if (p.alive || p.outNoted505) continue;
    p.outNoted505 = true; p.outYear505 = Y;
    for (const q of G.players) {
      if (q === p) rep(G, q, 0x433, [], { icon: 'p3040', sound: 2001, big: 'p3040' });
      else rep(G, q, 0x432, [p.name], { icon: 'm9036', sound: E.isBuddy(G, q.id, p.id) ? 2001 : 7021 });
    }
  }
  const alive = G.players.filter(p => p.alive), aliveH = alive.filter(p => p.human);
  let allAllied = true;
  for (const a of alive) for (const b of alive) if (!isAllied(G, a.id, b.id)) { allAllied = false; G.allyWarn505 = false; }
  if (G.over) return;
  if (!alive.length) { G.over = true; G.winner = -1; return; }
  if (!(aliveH.length === 0 || allAllied)) return;
  if (aliveH.length < 2 || G.allyWarn505 || alive.length < 2) {
    G.over = true; G.winners = alive.map(p => p.id);
    const hw = aliveH[0];
    G.winner = hw ? hw.id : alive[0].id;
    if (!hw) G.winner = -2;
    for (const q of G.players) for (const w of alive) {
      if (q === w) continue;
      if (!alive.includes(q)) { if (w.human) rep(G, q, 0x434, [w.name], { icon: 'p3040', sound: 2001, big: 'p3040' }); }
      else rep(G, q, 0x435, [w.name], { icon: 'p3030', sound: 7021 });
    }
  } else {
    G.allyWarn505 = true;
    for (const p of alive) rep(G, p, 0x469, [], { icon: 'p3030', sound: 2000 });
  }
}

// ---------- the battles (FUN_1007e870 and the CBattleStage routines) ----------
// CONFIRMED (FUN_1007e870): two passes over every star (in star order) where
// players not allied with each other have ships or a colony. In the first,
// the ships that arrived this turn (fleet +0x75) marked to arrive late
// (stance bit 1 of their design in the fleet) stay out; the second takes
// everyone. Each pass at a star that still has a fight is a battle of its own:
// its own record (a replay, battle number game +0x20e, and a random seed of
// its own, rand % 5000, that the fight is run with), its own results and
// reports (FUN_100803e0). A side is a player (in player order) with ships
// there, or with a colony there with people: its luck is rand(-1, 1) Weapons
// with the Luck option (game +0x5c bit 4), 0 instead of -1 with the smarter
// generals (+0x8e bit 8); its ships are counted by design and stance (bit 4
// offensive, bit 2 defensive, else normal); the colony fights with its owner's
// Weapons and Shields.
// The engine calls `battle` for each star with a fight; the first call of a
// turn runs the whole stage and the reports, and every call answers null.
function battle505(G, sid) {
  if (G.bstage505 !== G.turn) { G.bstage505 = G.turn; for (let pass = 0; pass < 2; pass++) for (const s of G.stars) battleAt505(G, s.id, pass); }
  return null;
}
// a design's stance byte in a fleet (fleet +0x58 + design): 1 arrive late,
// 2 defensive, 4 offensive. The remake keeps the fleet's stance and "arrive
// late" (f.stance, f.delayed) and, for the computers' Tankers bought for an
// attack (FUN_10084860, value 3: late and defensive), f.dstance[design].
const stanceBits = (f, did) => f.dstance && f.dstance[did] != null ? f.dstance[did] : (f.delayed ? 1 : 0) | (f.stance === 'defensive' ? 2 : f.stance === 'offensive' ? 4 : 0);
function battleAt505(G, sid, pass) {
  const s = G.stars[sid], Y = G.year + 10;
  const here = G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0);
  const ids = [...new Set(here.map(f => f.owner).concat(s.owner >= 0 && popU(s) > 0 ? [s.owner] : []))].sort((a, b) => a - b);
  const hostile = (L) => L.some(a => L.some(b => !isAllied(G, a, b)));
  if (!hostile(ids)) return;
  const sides = [];
  for (const o of ids) {
    const P = G.players[o];
    let luck = G.opts.luck ? RI(G, -1, 1) : 0;
    if (luck === -1 && P.flags && P.flags.generals) luck = 0;
    const side = { o, luck, ships: 0, cnt: {}, pop: o === s.owner && popU(s) > 0 ? popU(s) : 0, W: P.tech.weapons, S: P.tech.shields, surv: {} };
    for (const f of here) {
      if (f.owner !== o) continue;
      for (const k in f.ships) {
        const n = f.ships[k], st = stanceBits(f, +k);
        if (!(n > 0) || (pass === 0 && f.arrived && (st & 1))) continue;
        const c = side.cnt[k] || (side.cnt[k] = { off: 0, def: 0, nor: 0 });
        if (st & 4) c.off += n; else if (st & 2) c.def += n; else c.nor += n;
        side.ships += n;
      }
    }
    if (side.ships > 0 || side.pop > 0) sides.push(side);
  }
  if (!hostile(sides.map(x => x.o))) return;
  // the groups (FUN_1007f560, FUN_1007f7f0, FUN_1007f9f0): the viewing side
  // first (the human playing, else a best buddy of his, else the first side;
  // FUN_1007eed0), then the sides allied with it, then the first side left with
  // a colony, then the rest; each side's colony first (Weapons max(1, tech +
  // luck), Shields its tech, a shot for each 200,000 people rounded up, firing
  // last), then its designs, the last in the design list first, each split
  // into offensive (+1 Weapons, -2 Shields), defensive (-2, +1) and normal
  // groups (Weapons with luck, both at least 1; a decoy: Speed 0, Weapons -2,
  // Shields 0); Satellites 2 shots, Dreadnoughts 25, others 1
  const humans = G.players.filter(q => q.human).map(q => q.id);
  let view = sides.find(x => humans.includes(x.o));
  if (!view && humans.length) view = sides.find(x => E.isBuddy(G, humans[0], x.o));
  if (!view) view = sides[0];
  const ordered = [view];
  for (const x of sides) if (!ordered.includes(x) && isAllied(G, view.o, x.o)) ordered.push(x);
  const col = sides.find(x => !ordered.includes(x) && x.pop > 0);
  if (col) ordered.push(col);
  for (const x of sides) if (!ordered.includes(x)) ordered.push(x);
  const rec = { id: G.nextId++, star: sid, year: Y, sides: sides.map(x => x.o), rounds: [], start: [], planetOwner: -1, pop0: s.pop, popR: [] };
  const groups = [];
  let planet = null, debris = 0, dreadIn = false;
  for (const x of ordered) {
    if (x.pop > 0) {
      const g = { owner: x.o, side: x, planet: true, n: 1, n0: 1, init: 0, W: Math.max(1, x.W + x.luck), S: x.S, hp: x.pop, shots: trunc((x.pop + 199999) / 200000), tgt: null, units: [] };
      groups.push(g); planet = g; rec.planetOwner = x.o;
    }
    const P = G.players[x.o], ds = P.designs.filter(d => !d.scrapped && x.cnt[d.id]);
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i], c = x.cnt[d.id], cost = designCost(G, d), decoy = d.type === 'decoy';
      if (d.type === 'dread') dreadIn = true;
      for (const [n, dw, dsh] of [[c.off, 1, -2], [c.def, -2, 1], [c.nor, 0, 0]]) {
        if (!(n > 0)) continue;
        const g = { owner: x.o, side: x, d, type: d.type, n, n0: n, start: n, init: decoy ? 0 : d.V, W: decoy ? -2 : Math.max(1, d.W + x.luck + dw), S: decoy ? 0 : Math.max(1, d.S + dsh),
          hp: cost.hp, shots: shotsPerShip(d), debris: trunc(cost.metal / 5), dmg: 0, tgt: null, units: [] };
        for (let u = 0; u < n; u++) { g.units.push(rec.start.length); rec.start.push({ o: x.o, t: d.type, did: d.id }); }
        groups.push(g);
      }
    }
  }
  // CONFIRMED (FUN_1007f430): a target is the group, not allied (both sides'
  // offers as copied for the battle) and with ships left, scoring highest: 100
  // for ships (0 for a colony), +10 Colony Ships, +8 Tankers, +6 Satellites,
  // + rand(1, 5); the first of equals
  const pickTarget = (g) => {
    let best = null, bs = 0;
    for (const h of groups) {
      if (h === g || !(h.n > 0) || isAllied(G, h.owner, g.owner)) continue;
      let sc = h.planet ? 0 : 100;
      if (h.type === 'colony') sc += 10; else if (h.type === 'tanker') sc += 8; else if (h.type === 'satellite') sc += 6;
      sc += RI(G, 1, 5);
      if (bs < sc) { bs = sc; best = h; }
    }
    return best;
  };
  // CONFIRMED (FUN_1007eed0, FUN_1007f370, FUN_1007fe30): rounds while any
  // group has ships and a target; in each, from the highest Speed down to 0,
  // the groups of that Speed shoot in order (ships destroyed in the same Speed
  // step still shoot); each ship fires its shots at the group's target (a new
  // one when it is gone): hit% (W + 25 - S, table 0x100df00c) x (rand(0, 20) +
  // 5W + 10); at a colony x 4 people killed (the overflow of the shot before
  // added), at ships / 6 (at least 1) damage, piling up on one ship at a time,
  // the overflow going to the next shot
  const maxInit = Math.max(0, ...groups.map(g => g.init));
  let rounds = 0;
  while (rounds < 1000 && groups.some(g => g.n > 0 && pickTarget(g))) {
    rounds++;
    const ev = [];
    for (let lvl = maxInit; lvl >= 0; lvl--) {
      for (const g of groups) {
        if (g.init !== lvl) continue;
        let carry = 0;
        for (let i = 0; i < g.n0; i++) for (let j = 0; j < g.shots; j++) {
          if (!g.tgt || !(g.tgt.n > 0)) g.tgt = pickTarget(g);
          const t = g.tgt; if (!t) continue;
          const roll = RI(G, 0, 20), base = hit(g.W - t.S) * (roll + g.W * 5 + 10), si = g.planet ? -1 : g.units[i % g.units.length];
          if (t.planet) {
            let dmg = base * 4; if (carry > 0) { dmg += carry; carry = 0; }
            dmg = Math.min(dmg, t.hp); t.hp -= dmg;
            if (t.hp <= 0) { t.hp = 0; t.n = 0; }
            if (ev.length < 80) ev.push({ a: g.owner, si, p: 1 });
          } else {
            let dmg = Math.max(1, trunc(base / 6)); if (carry > 0) { dmg += carry; carry = 0; }
            t.dmg += dmg;
            let killed = 0; const ti = t.units[t.start - t.n] != null ? t.units[t.start - t.n] : t.units[0];
            if (t.hp <= t.dmg) { carry = t.dmg - t.hp; t.dmg = 0; t.n--; debris += t.debris; killed = 1; }
            if (ev.length < 80) ev.push({ a: g.owner, si, t: t.owner, k: killed, ti });
          }
        }
      }
      for (const g of groups) g.n0 = g.n;
    }
    if (rec.rounds.length < 60) { rec.rounds.push(ev); rec.popR.push(planet ? planet.hp / 1000 : s.pop); }
  }
  // what each side has left
  for (const g of groups) if (!g.planet) g.side.surv[g.d.id] = (g.side.surv[g.d.id] || 0) + g.n;
  const left = (x) => Object.values(x.surv).reduce((a, n) => a + n, 0);
  const popLeft = planet ? planet.hp : 0;
  const standing = (x) => left(x) > 0 || (x.pop > 0 && popLeft > 0);
  // the ships: a side's survivors of each design stay with its fleets in the
  // fleet list's order (FUN_10081810), a lost Colony Ship taking its 10
  // colonists; a beaten side's fleets there are emptied (FUN_100816e0)
  for (const x of sides) {
    const keep = Object.assign({}, x.surv);
    for (const f of here) {
      if (f.owner !== x.o) continue;
      for (const k in f.ships) {
        const st = stanceBits(f, +k);
        if (pass === 0 && f.arrived && (st & 1)) continue;
        const kept = Math.min(keep[k] || 0, f.ships[k]);
        keep[k] = (keep[k] || 0) - kept;
        const d = getDesign(G, f.owner, +k);
        if (d && d.type === 'colony' && f.colonists) f.colonists = Math.max(0, f.colonists - (f.ships[k] - kept) * 10);
        f.ships[k] = kept;
      }
    }
  }
  for (const f of here) {
    for (const k in f.ships) if (!(f.ships[k] > 0)) delete f.ships[k];
    if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  let planetDied = false;
  if (planet) { setPopU(s, popLeft); if (popLeft <= 0) { s.pop = 0; s.owner = -1; planetDied = true; } }
  G.battleAt505[sid] = true;
  // the replay record; a star with a second battle in the same turn gets one
  // record each (rec.duel 0, 1)
  const alive = new Set(); for (const g of groups) if (!g.planet) for (let i = 0; i < g.n; i++) alive.add(g.units[g.start - 1 - i]);
  rec.survivors = {}; rec.lost = {};
  for (const x of sides) { rec.survivors[x.o] = left(x); rec.lost[x.o] = x.ships - left(x); }
  rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = rec.start.map((_, i) => alive.has(i) ? 1 : 0);
  const first = G.battles.find(b => b.star === sid && b.year === Y && b !== rec);
  if (first) { if (first.duel == null) first.duel = 0; rec.duel = first.duel + 1; }
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  aftermath505(G, sid, { sides, rec, rounds, dreadIn, standing, debris, left, popLeft });
}
// CONFIRMED (FUN_100803e0), after the fight, for each side in player order:
// - the star is marked for the big-battle report when two or more sides
//   brought more than one ship and rand(10, 20) is under the ships there, or
//   more than four sides fought;
// - its record of the star: the battle's year and number (+0xc, +0x12);
// - its feelings for each enemy (FUN_10087f80): 10-30 down after a skirmish
//   (it brought one ship and no Dreadnought was there), else 50-100; for a
//   lost colony 100-200, or all of its liking when that was over 500;
// - a computer whose colony was attacked (not the turtle) puts more metal into
//   defence: +10 (60..99) if the colony fell with more than 20 people, then
//   +5 (30..99) while under 70;
// - a side beaten: its fleets are emptied, its record shows the star as the
//   side whose colony stood, else the one with most ships left, else after a
//   one-round battle the one that had the colony or brought the most ships
//   (FUN_10081230), its colony's people are 0; "%s destroyed your colony at %s.
//   You %slost %d of your ships. %s lost %d. You lost %s people." (0x3f3) or
//   "You %slost a battle at %s. ..." (0x40d, the enemy's face when there was
//   one enemy side); and the estimates the computers plan with;
// - a side standing: its ships go back to its fleets; with no enemy "You just
//   watched some of your allies fight a battle at %s." (0x47f), else "You
//   %swon a battle at %s. ..." (0x40c) or "%s survived an attack from %s. ..."
//   (0x40e); the debris (a fifth of the metal of every ship destroyed) goes
//   to the first side standing: onto its colony's stockpile ("You recovered
//   %s metal from the battle at %s.", 0x42f, x 5/4 with the recycling
//   discovery), else onto the planet ("%s metal has fallen onto %s from your
//   recent battle.", 0x430), where a colony's owner picks it up in pass 2
//   (FUN_10077110); its estimates.
// In the reports "you" counts your allies in the battle with you ("You and
// your allies lost ...", STR# 40 when more than one) and the enemy is named
// when there was one enemy side (the one with the colony, else the one that
// brought most ships), else "Your enemies" (STR# 39). `won` is set on each.
function aftermath505(G, sid, B) {
  const s = G.stars[sid], AI = E.aiOf(G), Y = G.year + 10;
  const { sides, rec, rounds, dreadIn, standing, left, popLeft } = B;
  let debris = B.debris;
  let crowd = 0, tot = 0;
  for (const x of sides) { tot += x.ships; if (x.ships > 1) crowd++; }
  if (crowd > 1 && (RI(G, 10, 20) < tot || sides.length > 4)) G.big505[sid] = true;
  const strOf = (o, type) => {
    let a = 0;
    for (const x of sides) {
      if (o !== -1 && isAllied(G, o, x.o)) continue;
      for (const did in x.surv) { const d = getDesign(G, x.o, +did); if (d && (type === -1 || d.type === type)) a += x.surv[did] * designCost(G, d).att; }
    }
    return a;
  };
  for (const x of sides) {
    const p = G.players[x.o], k = know(G, p, sid), est = AI.est ? AI.est(G, p, sid) : (k.est || (k.est = {}));
    k.by505 = Y; est.by = Y;
    // FUN_10081570
    let allies = 0, aShips = 0, aLeft = 0, enemies = 0, eShips = 0, eLeft = 0, main = -1, mv = 0;
    for (const y of sides) {
      if (isAllied(G, x.o, y.o)) { allies++; aShips += y.ships; aLeft += left(y); }
      else {
        enemies++; eShips += y.ships; eLeft += left(y);
        if (y.pop > 0) { main = y.o; mv = 10000; } else if (mv < y.ships) { main = y.o; mv = y.ships; }
      }
    }
    const one = enemies === 1 ? main : -1;
    // feelings
    for (const y of sides) {
      if (isAllied(G, x.o, y.o)) continue;
      let dv;
      if (!(x.pop > 0) || popLeft !== 0) dv = x.ships === 1 && !dreadIn ? RI(G, -30, -10) : RI(G, -100, -50);
      else { const a = p.ai && p.ai.att ? p.ai.att[y.o] || 0 : 0; dv = a > 500 ? -a : RI(G, -200, -100); }
      if (AI.modify) AI.modify(G, p, y.o, dv);
    }
    if (enemies > 0 && x.pop > 0 && !p.human && p.ai && p.ai.style !== 2) {
      if (!standing(x) && x.pop > 20) p.ai.metalDef = clamp(p.ai.metalDef + 10, 60, 99);
      if (p.ai.metalDef < 70) p.ai.metalDef = clamp(p.ai.metalDef + 5, 30, 99);
    }
    // FUN_10081160: the enemy colony's people and technology
    let ePop = 0, eW = 1, eS = 1;
    for (const y of sides) if (!isAllied(G, x.o, y.o) && y.pop > 0) { ePop += y.pop; eW = y.W; eS = y.S; }
    k.pop = ePop / 1000;
    const myAllies = allies > 1 ? 'and your allies ' : '';
    const eName = one >= 0 ? G.players[one].name : 'Your enemies';
    const lost = aShips - aLeft, theirs = eShips - eLeft;
    if (!standing(x)) {
      // FUN_10081230: whose star it is now, as this side records it
      let owner = -1, ov = 0, big = -1, bv = 0, other = -1;
      for (const y of sides) {
        if (y.o !== x.o) other = y.o;
        if (y.pop > 0 && popLeft > 0) { owner = y.o; ov = 10000; }
        else { const l = left(y); if (l > 0 && ov < l) { owner = y.o; ov = l; } }
        if (y.pop > 0) { big = y.o; bv = 30000; } else if (y.ships > 0 && bv < y.ships) { big = y.o; bv = y.ships; }
      }
      if (owner === -1 && rounds === 1) owner = big === x.o ? other : big;
      k.owner = owner;
      if (x.pop > 0) {
        if (AI.note) AI.note(G, p, { code: 0x3f3, by: one });
        msg(G, p.id, `${eName} destroyed your colony at ${s.name}. You ${myAllies}lost ${lost} of your ships. ${eName} lost ${theirs}. You lost ${fmt(x.pop * 1000)} people.`, { icon: 'm9036', sound: 2001, star: sid, battle: rec.id, won: false });
        est.e16 = strOf(x.o, -1) + 1;
        est.e1a = RI(G, 1, 3) === 1 ? 0 : strOf(x.o, -1);
        est.e1e = 0; est.e22 = strOf(x.o, -1);
      } else {
        const face = one >= 0 ? (G.players[one].human ? 'white0_' + (G.players[one].female ? 1 : 0) : 'bad' + G.players[one].face + '_' + (G.players[one].female ? 1 : 0)) : 'm9025';
        msg(G, p.id, `You ${myAllies}lost a battle at ${s.name}. You ${myAllies}lost ${lost} of your ships. ${eName} lost ${theirs}.`, { icon: face, star: sid, battle: rec.id, won: false });
        const pp = trunc((eS + 2) * (eW + 2) * trunc((ePop + 2499) / 2500) * (eW + 2) / 570);
        est.e16 = strOf(x.o, -1) + pp + 1;
        const war = () => strOf(x.o, 'dread') + strOf(x.o, 'fighter') + strOf(x.o, 'scout');
        if (ePop > 0 && RI(G, 1, 2) === 1) est.e16 = Math.max(0, est.e16 - war());
        est.e1a = RI(G, 1, 3) === 1 && ePop < 100 ? 0 : war();
        est.e1e = 0; est.e22 = war();
      }
    } else {
      if (!enemies) msg(G, p.id, `You just watched some of your allies fight a battle at ${s.name}.`, { icon: 'm9025', star: sid, battle: rec.id, won: true, quiet: true });
      else {
        if (AI.note && !(x.pop > 0)) AI.note(G, p, { code: 0x40c, other: one, theirLoss: theirs });
        if (!(x.pop > 0)) msg(G, p.id, `You ${myAllies}won a battle at ${s.name}. You ${myAllies}lost ${lost} of your ships. ${eName} lost ${theirs}.`, { icon: 'm9036', star: sid, battle: rec.id, won: true });
        else msg(G, p.id, `${s.name} survived an attack from ${eName}. You ${myAllies}lost ${lost} of your ships; ${eName} lost ${theirs}. You lost ${fmt((x.pop - popLeft) * 1000)} people.`, { icon: 'm9036', star: sid, battle: rec.id, won: true });
      }
      if (debris) {
        if (x.pop > 0 && popLeft > 0) {
          if (p.flags && p.flags.recycle) debris = trunc(debris * 5 / 4);
          p.metal += debris;
          msg(G, p.id, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true });
        } else {
          s.metal += debris; G.scrapOver505[sid] = (G.scrapOver505[sid] || 0) + debris;
          msg(G, p.id, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true });
        }
        debris = 0;
      }
      est.e16 = 0; est.e1a = 0; est.e22 = 0;
      if (!enemies || !(x.pop > 0)) est.e1e = 0;
      else {
        const v = strOf(-1, -1) - strOf(-1, 'fighter'), r = RI(G, 1, 5);
        if (r < 3 && rounds > 1) est.e1e = trunc(v * 3 / 2);
        else if (r < 5) est.e1e = trunc(v / 10);
      }
    }
  }
  // with every side beaten, nobody gets the debris
}

// ---------- commands ----------
// CONFIRMED (FUN_10060fac, the Galaxy menu's "Evacuate Planet" / "Don't
// Evacuate Planet", STR# 20-21): a toggle on the colony (slot +0x13), carried
// out at the start of colony support in pass 1. Turning it on asks first for a
// profitable colony (income above 0): "Do you really want to evacuate %s? It's
// a profitable colony!" (alert 0x12); a star named Kansas, one time in three,
// gets "Dorothy, I guess that means we're not in Kansas anymore" (alert 0x26)
// and is evacuated; one named Hope, one time in three, the "Abandon Hope"
// dialog ("Dost thou truly wish to abandon Hope? All is not yet lost...").
// On: sound 7002 and the colony's income comes off the net; off: sound 4000
// and it goes back on; either way the colony's share goes to 0 and the others
// take it up (FUN_100712b0). The colony shows "Evacuating" (STR# 32).
function evacuate505(G, p, sid) {
  const s = G.stars[sid];
  if (s.owner !== p.id || !colSlots505(G, p).includes(sid)) return;
  s.abandon301 = !s.abandon301;
  p.net505 = (p.net505 || 0) + (s.abandon301 ? -1 : 1) * (s.oInc || 0);
  giveBar505(G, p, sid, 0);
}
const evacuateToggle = {
  words: ['Evacuate Planet', 'Don’t Evacuate Planet'],
  marked: (G, sid) => !!G.stars[sid].abandon301,
  ask(G, p, sid) {
    const s = G.stars[sid], nm = String(s.name).toLowerCase();
    if (nm === 'kansas' && RI(G, 1, 3) === 1) return { text: 'Dorothy, I guess that means we’re not in Kansas anymore', notice: true };
    if (nm === 'hope' && RI(G, 1, 3) === 1) return { text: 'Dost thou truly wish to abandon Hope? All is not yet lost...' };
    if ((s.oInc || 0) > 0) return { text: `Do you really want to evacuate ${s.name}? It's a profitable colony!` };
    return null;
  },
};
// CONFIRMED (FUN_1008a7a0, dragging a bar of the budget, LHoBarControl):
// refused (a beep) for a colony being evacuated, a finished colony (both bars
// done) and Savings while dipping into them (FUN_1008a030); then at each step
// of the drag the bar goes to where the mouse is (0..1,000) and the other bars
// that can move make up the change: in proportion to their shares (each loses
// trunc(change x its share / their total)), all to 0 when they hold less than
// a rise, each to the fall / their number (at least 1) when they are all 0;
// the dragged bar is then 1,000 less the others that can move (not below 0),
// or, dragged to 0, the first bar of the list (the second when it is the first)
// takes what is left. Bars that can't move keep their shares, so the total
// can then be over 1,000. (4.0.5 used DetermineNewLevels here.) The remake
// works it out once, from where the drag began.
function dragShare505(G, p, key, pm) {
  const L = slots505(G, p), k = key === 'savings' ? 'sav' : typeof key === 'number' || /^\d+$/.test(key) ? +key : key;
  const idx = L.indexOf(k); if (idx < 0) return;
  const locked = (x) => x === 'sav' ? (p.dip || 0) > 0 : typeof x === 'number' ? !!(G.stars[x].abandon301 || G.stars[x].done301) : false;
  if (locked(k)) return;
  const v = L.map(x => keyPm(p, x)), to = clamp(pm, 0, 1000), delta = to - v[idx];
  if (!delta) return;
  const others = L.map((x, i) => i !== idx && !locked(x));
  const n = others.filter(Boolean).length;
  let sum = 0; v.forEach((x, i) => { if (others[i]) sum += x; });
  if (sum < 0) sum = 0;
  if (sum === 0 && delta < 0) { const q = trunc(-delta / Math.max(1, n)); v.forEach((x, i) => { if (others[i]) v[i] = q < 2 ? 1 : q; }); }
  else if (sum < delta && delta > 0) v.forEach((x, i) => { if (others[i]) v[i] = 0; });
  else if (sum !== 0) v.forEach((x, i) => { if (others[i]) v[i] = x - trunc(delta * x / sum); });
  let T = 0; v.forEach((x, i) => { if (others[i]) T += x; });
  if (to === 0) { v[idx] = 0; if (1000 - T > 0) { const j = idx === 0 ? 1 : 0; v[j] += 1000 - T; } }
  else v[idx] = Math.max(0, 1000 - T);
  L.forEach((x, i) => setKeyPm(p, x, v[i]));
}
// CONFIRMED (FUN_1005d380, "Dip Into Savings…", dialog 0x9d): a percentage
// kept (player +0x54), from the window's slider, 0 to 30 % (PPob 157: the
// slider's minimum 0, maximum 30, marked 0%, 15% and 30%; the code would take
// up to 100); set above 0 it gives the Savings bar's share
// away (FUN_100712b0), and the bar can't be dragged while it is on. The dip
// itself comes out of Ship Savings in pass 2 (FUN_10077200).
function dipSet505(G, p, pct) {
  p.dip = clamp(Math.round(pct) || 0, 0, 100);
  if (p.dip > 0) giveBar505(G, p, 'sav', 0);
}
// CONFIRMED (FUN_10075b80): a fleet reaching a star that has gone supernova
// "disappeared through a wormhole in space and is lost." (0x3fd); else it has
// arrived (fleet +0x75); at the end of its trip, "Your fleet of %s has arrived
// at %s." (0x3ff) when the player had explored the star and its record shows
// an owner, or none and the fleet isn't all Colony Ships; at a star that isn't
// its owner's the arrival is listed for the allies (FUN_100782a0).
function fleetArrives505(G, f) {
  const s = G.stars[f.star], p = G.players[f.owner], label = fleetLabel(G, f);
  if (s.nova >= 210) { rep(G, p, 0x3fd, [label], { icon: 'm9036', star: s.id }); return false; }
  const k = know(G, p, s.id);
  f.arrived505 = true; f.new505 = !k.explored;
  if (!(f.path && f.path.length)) {
    const allColony = fleetDesigns(G, f).every(d => d.type === 'colony');
    if (k.explored && (k.owner >= 0 || !allColony)) rep(G, p, 0x3ff, [label, s.name], { icon: 'm9038', star: s.id, quiet: true });
    if (s.owner !== f.owner && G.arrivals505.length < 5 * G.players.length) G.arrivals505.push({ from: f.owner, star: s.id, label });
  }
  return true;
}
// CONFIRMED (FUN_1009ab50, the Build Ships window): you may order no more
// ships at a colony than its people (units, colony +0xc) less the ships built
// there this turn (+0x10, cleared in colony support); the remake counts this
// turn's buying at the star (FUN_1007e4a0 counts a purchase that then fails
// for want of money or metal too)
const yardRoom505 = (G, p, s) => popU(s) > (p.spentThisTurn || []).filter(e => e.sid === s.id).length;
// CONFIRMED (FUN_1007e4a0, buying a ship): new ships of a design other than
// Scouts and Colony Ships join a fleet at the colony that has ships of that
// design, has no orders and was built this turn (+0x74); otherwise a new fleet
// (FUN_1007bcb0: Colony Ships loaded, a Biological fleet with its fuel used up,
// put at the end of the fleet list). The colony's count of ships built there
// goes up before the money is checked (as in 4.0.5).
function fleetFor505(G, pid, sid, d) {
  if (d.type === 'scout' || d.type === 'colony') return null;
  return G.fleets.find(x => x.owner === pid && x.star === sid && x.to == null && x.ships[d.id] > 0 && x.dest == null && !(x.path && x.path.length) && x.newThisTurn) || null;
}
// CONFIRMED (FUN_1007e4a0, buying a ship): Ship Savings pay the price, and the
// interest (+0x4c) is worked out again on what is left, the net (+0x40)
// moving with it, so this turn's interest falls as you buy (the computers'
// purchases, FUN_100852d0, leave the interest alone). A new Biological fleet
// starts with no fuel.
function shipsAdded505(G, f, d, n) {
  if (d.type === 'bio' && fleetCount(f) === n) f.fuel = 0;
  const p = G.players[f.owner];
  p.net505 = (p.net505 || 0) - (p.oInterest || 0);
  p.oInterest = interestOn(p, p.savings);
  p.net505 += p.oInterest;
}
// CONFIRMED (FUN_10063a40, FUN_10056000, FUN_10055ed0, FUN_10055f20,
// FUN_1007acf0, FUN_100b24c0): when you join a game, your record notes the
// master points you may still win in it (player +0x2a): halfway between your
// next rank and the one after it, less what you have (thresholds at
// 0x100e3f10 + 0x20); 65,535 or more is no limit. A win adds the points
// (FUN_10055f60: 3^((max(30, d) - 30) / 10), at most 10,000,000) up to that
// limit, so one win raises you at most past your next rank; the report says
// what was added.
function addMasterPoints505(total, pts) {
  const R = (DATA.ranks || []).map(r => r[1]);
  if (!R.length) return total + pts;
  if (total >= 1e9) return total;
  let r = 0; while (r < 24 && !(total < R[r + 1])) r++;
  const nx = r + 1, next = nx < 24 ? R[nx] + trunc((R[nx + 1] - R[nx]) / 2) : nx === 24 ? R[24] + 1 : Infinity;
  const cap = next - total;
  return total + (cap >= 0x10000 ? pts : Math.min(pts, Math.max(0, cap)));
}
// the budget panel: this turn's money (player +0x38) with the interest and
// the colonies' losses (but those being evacuated) as pass 1 will take them
function projected505(G, p) {
  let support = 0;
  for (const sid of colSlots505(G, p)) { const s = G.stars[sid]; if ((s.oInc || 0) < 0 && !s.abandon301) support += -s.oInc; }
  const I = p.oInterest || 0, M = p.tm || 0;
  return { gross: M, income: M - support, interest: I, net: Math.max(0, M + I - support), dip: (p.dip > 0 && p.savings > 0) ? trunc(p.savings * p.dip / 100) : 0 };
}
// the start (FUN_1006f640): the colony list Savings 650, Technology 250, home
// 100 per mille (Abundant: the second colony third and the home fourth, 50
// each, so 1,000; afterSetup);
// the home's bars Terraform done and Mine 1,000 ($5,000 sunk), but an
// Outpost's home, made hostile after your ideal was taken from it (its
// gravity +-10..20%, its temperature +-35..50 degrees), Terraform 800 / Mine
// 200; this turn's money the income + rand(1, 100); the borrowing limit
// trunc(-money / 2) x 10. The radical hand is dealt in 2010 (pass 2b).
function setup505(G, p, home, st) {
  if (st.rank === 1) {
    const sg = RI(G, 1, 2) === 1 ? 1 : -1, pct = RI(G, 10, 20), g = g100(home.g);
    home.g = (g + trunc(g * pct * sg / 100)) / 100;
    const st2 = RI(G, 1, 2) === 1 ? 1 : -1;
    home.t = (t10i(home.t) + RI(G, 350, 500) * st2) / 10;
  }
  p.slots301 = ['sav', 'tech', home.id];
  p.budget = { savings: 0.65, tech: 0.25, col: { [home.id]: 0.1 } };
  home.oSink = 5000;
  if (st.rank === 1) setBars505(home, 800, 200); else setBars505(home, -1, 1000);
  p.tm = p.oInc; p.net505 = p.oInc; p.lim505 = trunc(-p.oInc / 2) * 10;
}

E.registerRules('original', {
  label: 'Original (decompiled from 5.0.5)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '5', edition: { version: '5.0.5', name: 'Mac', platform: 'Mac OS 8.6, 9 and X', year: 2003 }, skins: ['classic'],
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '5.0.5', platform: 'Mac OS 9 and X', year: 2003,
  // the unofficial 5.0.5.1 patch (engine.js fixed; docs/fixes.md, "5.0.5")
  fixes: [
    { id: 'globalWarming', title: 'Interest you can’t pay brings global warming',
      text: 'When your interest was more than this turn’s money and all you could still borrow, a test written the wrong way round (a sign slip) put it all on Ship Savings, however deep in debt, so the global warming the game has a message for never happened. The patch compares it the right way round, as 4.0.5 did: then your planets warm or cool away from your temperature and one of your fleets is scrapped for lack of funds.' },
    { id: 'scrapRange', title: 'Ships sent home to be scrapped are routed with their own Range',
      text: 'When the computers sent obsolete ships and Tankers home to be scrapped, the program passed the fleet’s place in a list where the route finder wants its Range, so the routes it found could be wrong. The patch passes the Range.' },
  ],
  ai: 'original',
  yearsPerTurn: 10,
  galaxySizes: SIZES,
  colonyShipUsedUp: false,
  battleEverywhere: true,
  maxDesigns: 24,
  // arrivalNotices off: CONFIRMED (FUN_100782a0) only allies hear of arrivals, in pass 2b
  features: { arrivalNotices: false, alliances: true, gifts: true, surrender: true, stances: true, lateArrival: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  HIT, hit, hab, popU, setPopU, maxPopU, incomeU, interestOn, mineMoney, mineMetal, terraCost, terraStep, aiSpec,
  fleetStrength, planetStrength, techLevelCost, disposable, START, research, techMsg, shotsPerShip,
  distance,
  newStar, setupPlayer, afterSetup, defaultDesigns, makeGalaxy, computerSetup, SHAPES, difficulty, masterPoints,
  maxPop: (G, p, s) => maxPopU(p, s) / 1000,
  planetClass, planetIncome,
  designLimits, designCost,
  designMin: (G, k) => k === 'M' ? 0 : 1,
  // computers above Dumb never pay development costs (FUN_10086830, FUN_100852d0)
  paysPrototype: (G, p) => p.human || !p.ai || p.ai.iq < 2,
  canBuild: (G, p, type) => type === 'bio' ? !!p.hasBio : type === 'decoy' ? !!p.hasDecoy : true,
  borrowLimit, projected, economy, afterMovement, refuel, settle, canColonize, exploreQuality, battle: battle505,
  observe: observeHook, scrapReturn, scrapInSpace, randomEvents, fleetArrives,
});
// 5.0.5's own hooks. They are not enumerable, so the rulesets built on this
// one with Object.assign (2.0, and through it 1.2, 3.0.1 and 4.0.5) don't
// take them. The Palm OS rules (the same code, recompiled) take every one of
// them on purpose (js/rules-palm.js copies the own properties).
Object.defineProperties(E.RULESETS.original, Object.fromEntries(Object.entries({
  // the 5.0.5 turn (is505 above); js/rules-palm.js sets it too
  turn505: true,
  // 5.0.5 marks fleets and ship types and dismantles them at End Turn (FUN_10062c10, FUN_10074580)
  flagScrap, flagScrapDesign, scrapWords: { fleet: ['Dismantle Current Fleet', 'Don’t Dismantle Current Fleet'] },
  // the turn (above): pass 1 for everyone in `economy`, battles in `battle`,
  // the novas and pass 2 in `refuel`, the winner in checkElimination (on the
  // last step only); surrenders, pact news, best buddies' maps in the passes
  economyForAll: true, processSurrenders: () => {}, processHandovers: () => {}, pactNews: () => {}, shareMaps: () => {},
  checkElimination: checkElimination505, arrivalSays: () => false, departs: departs505,
  // the commands and the budget bars
  evacuateCommand: true, evacuate: evacuate505, evacuateToggle, dragShare: dragShare505, dipSet: dipSet505, dipMax: 30,
  fleetFor: fleetFor505, shipsAdded: shipsAdded505, yardRoom: yardRoom505, addMasterPoints: addMasterPoints505,
  bars: bars505, setBars: setBars505, slots301: slots505, colSlots: colSlots505, keyPm, setKeyPm, giveBarPercent: giveBar505, share505,
  terraLeft: (G, p, s) => bars505(s)[0] !== -1,
}).map(([k, value]) => [k, { value, enumerable: false, writable: true, configurable: true }])));
})(this);
