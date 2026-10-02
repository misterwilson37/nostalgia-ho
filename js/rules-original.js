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
      say(`Your mining consortium has just been able to extract an additional ${fmt(n < 3 ? m : m / Math.max(1, n))} metal from every planet you have.`, 'm9046');
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
function makeGalaxy(G, opts, nPlayers) {
  const shape = SHAPES.includes(opts.shape) ? opts.shape : 'random';
  const size = sliderSize(opts.size), dens = sliderDensity(opts.density);
  const n = starCount(G, shape, size);
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
    refillDeck(G, p);
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
  const { D, support, I } = disposable(G, p);
  return { gross: p.oInc, income: p.oInc - support, interest: I, net: D, dip: dipAmount(p) };
}
// interest (FUN_100737b0), colony support (FUN_10073a80), terraforming and
// mining (FUN_10073d70) and research (FUN_10074f90)
// opt.shipyard(G, p, s, spend) lets another ruleset take part of a colony's
// money for shipbuilding first (the DOS 2.0 rules); it returns what is left.
function economy(G, p, opt) {
  const cols = colonies(G, p.id);
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
      if (T > 50 && h.gR > 256 && !s._warned) { s._warned = true; msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id }); }
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, T); T -= x; s.oSink += x; }
      const step = terraStep(p, T);
      if (h.dT < step) {
        p.oRefund += terraCost(p, step) - terraCost(p, h.dT);
        s.t = p.homeT;
        msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
      } else s.t += (s.t < p.homeT ? 1 : -1) * step / 10;
    }
    if (M > 0) {
      let got = mineMetal(p, M);
      if (got >= s.metal) {
        p.oRefund += Math.max(0, mineMoney(p, got) - mineMoney(p, s.metal));
        got = s.metal;
        msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably evacuate it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
      }
      s.metal -= got; p.metal += got;
    }
  }
  // research
  const tech = trunc(D * share(p.budget.tech));
  if (tech > 0) research(G, p, tech);
  else if (p.human && D > 0 && G.turn % 5 === 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011' });
}
// savings, interest, population and colony income (FUN_10077200)
function afterMovement(G, p) {
  meteors(G, p);
  const cols = colonies(G, p.id);
  const share = shares(G, p, cols);
  p.savings += trunc(p.oD * share(p.budget.savings));
  p.oInterest = interestOn(p, p.savings);
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
    const inc = incomeU(u, hab(p, s).H);
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
function canColonize(G, p, f, s) { return (f.colonists || 0) > 0; }
function settle(G, p, s, f) {
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

// ---------- combat (FUN_1007e870, FUN_1007eed0, FUN_1007fe30, FUN_1007f430) ----------
function battle(G, sid) {
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null);
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(present.map(f => f.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners];
  if (!ownerIds.some(a => ownerIds.some(b => !isAllied(G, a, b)))) return null;
  const startPop = s.pop;
  // luck in battles (game option): each side -1, 0 or +1 weapons; smarter generals never get -1
  const luck = {};
  for (const o of ownerIds) { let l = G.opts.luck ? RI(G, -1, 1) : 0; if (l < 0 && G.players[o].flags.generals) l = 0; luck[o] = l; }
  const groups = [], start = [], gmap = {};
  for (const f of present) for (const k in f.ships) {
    const d = getDesign(G, f.owner, +k); const n = f.ships[k];
    if (!d || n <= 0) continue;
    const late = !!f.delayed && f.arrived;
    const stance = f.stance || 'normal';
    const key = f.owner + ':' + d.id + ':' + (late ? 1 : 0) + ':' + stance;
    let g = gmap[key];
    if (!g) {
      const c = designCost(G, d), decoy = d.type === 'decoy';
      // offensive ships: +1 weapons, -2 shields; defensive: -2 weapons, +1 shields (FUN_1007f9f0)
      let W = d.W + luck[f.owner], S = d.S;
      if (stance === 'offensive') { W += 1; S -= 2; } else if (stance === 'defensive') { W -= 2; S += 1; }
      g = gmap[key] = { owner: f.owner, d, type: d.type, late, n: 0, n0: 0, init: decoy ? 0 : d.V, W: decoy ? -2 : Math.max(1, W), S: decoy ? 0 : Math.max(1, S), hp: c.hp, shots: shotsPerShip(d), debris: trunc(c.metal / 5), dmg: 0, tgt: null, members: [], units: [], ui: 0 };
      groups.push(g);
    }
    g.members.push({ f, k, n }); g.n += n;
  }
  for (const g of groups) { g.n0 = g.n; g.start = g.n; for (let i = 0; i < g.n; i++) { g.units.push(start.length); start.push({ o: g.owner, t: g.type, did: g.d.id }); } }
  let planet = null;
  if (planetOwner >= 0) {
    const q = G.players[planetOwner], u = popU(s);
    planet = { owner: planetOwner, planet: true, n: 1, n0: 1, init: 0, W: Math.max(1, q.tech.weapons + luck[planetOwner]), S: q.tech.shields, hp: u, shots: Math.ceil(u / 200000), dmg: 0, tgt: null, units: [] };
  }
  const rec = { id: G.nextId++, star: sid, year: G.year + 10, sides: ownerIds, rounds: [], start, planetOwner, pop0: s.pop, popR: [] };
  let debris = 0;
  const all = () => planet ? groups.concat([planet]) : groups;
  const pickTarget = (g, pool) => {
    let best = null, bs = 0;
    for (const h of pool) {
      if (h === g || h.n <= 0 || isAllied(G, h.owner, g.owner)) continue;
      let sc = h.planet ? 0 : 100;
      if (h.type === 'colony') sc += 10; else if (h.type === 'tanker') sc += 8; else if (h.type === 'satellite') sc += 6;
      sc += RI(G, 1, 5);
      if (sc > bs) { bs = sc; best = h; }
    }
    return best;
  };
  const fight = (pool) => {
    const maxInit = Math.max(0, ...pool.map(g => g.init));
    for (const g of pool) g.n0 = g.n;
    let rounds = 0;
    while (rounds < 400 && pool.some(g => g.n > 0 && pool.some(h => h !== g && h.n > 0 && !isAllied(G, h.owner, g.owner)))) {
      rounds++;
      const ev = [];
      for (let lvl = maxInit; lvl >= 0; lvl--) {
        for (const g of pool) {
          if (g.init !== lvl) continue;
          let carry = 0;
          for (let i = 0; i < g.n0; i++) for (let j = 0; j < g.shots; j++) {
            if (!g.tgt || g.tgt.n <= 0) g.tgt = pickTarget(g, pool);
            const t = g.tgt; if (!t) continue;
            const base = hit(g.W - t.S) * (RI(G, 0, 20) + g.W * 5 + 10);
            const si = g.planet ? -1 : g.units[i % g.units.length];
            if (t.planet) {
              let dmg = base * 4 + carry; carry = 0;
              dmg = Math.min(dmg, t.hp); t.hp -= dmg;
              if (t.hp <= 0) { t.hp = 0; t.n = 0; }
              if (ev.length < 80) ev.push({ a: g.owner, si, p: 1 });
            } else {
              const dmg = Math.max(1, trunc(base / 6)) + carry; carry = 0;
              t.dmg += dmg;
              let killed = 0; const ti = t.units[t.ui] != null ? t.units[t.ui] : t.units[0];
              if (t.dmg >= t.hp) { carry = t.dmg - t.hp; t.dmg = 0; t.n--; debris += t.debris; killed = 1; t.ui++; }
              if (ev.length < 80) ev.push({ a: g.owner, si, t: t.owner, k: killed, ti });
            }
          }
        }
        for (const g of pool) g.n0 = g.n;
      }
      if (rec.rounds.length < 60) { rec.rounds.push(ev); rec.popR.push(planet ? planet.hp / 1000 : s.pop); }
    }
  };
  // ships told to arrive late sit out the opening exchange (two passes)
  if (groups.some(g => g.late)) fight(all().filter(g => !g.late));
  fight(all());
  const lost = {}, survivors = {};
  for (const g of groups) {
    let gone = g.start - g.n;
    lost[g.owner] = (lost[g.owner] || 0) + gone;
    survivors[g.owner] = (survivors[g.owner] || 0) + g.n;
    for (const m of g.members) { const x = Math.min(gone, m.n); m.f.ships[m.k] -= x; gone -= x; }
  }
  for (const f of present) {
    for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k];
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  let planetDied = false;
  if (planet) {
    setPopU(s, planet.hp);
    if (planet.hp <= 0) { s.pop = 0; s.owner = -1; planetDied = true; }
  }
  if (debris > 0) {
    if (s.owner >= 0) { G.players[s.owner].metal += debris; msg(G, s.owner, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); }
    else { s.metal += debris; for (const o of ownerIds) msg(G, o, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); }
  }
  const alive = new Set(); for (const g of groups) for (let i = 0; i < g.n; i++) alive.add(g.units[g.units.length - 1 - i]);
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = start.map((_, i) => alive.has(i) ? 1 : 0);
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}

// ---------- scrapping (FUN_10074580) ----------
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
  const s = G.stars[f.star];
  if (s.nova >= 210) { msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} disappeared through a wormhole in space and is lost.`, { icon: 'm9036', star: s.id }); return false; }
  return true;
}

E.registerRules('original', {
  label: 'Original (decompiled from 5.0.5)',
  ai: 'original',
  yearsPerTurn: 10,
  galaxySizes: SIZES,
  colonyShipUsedUp: false,
  battleEverywhere: true,
  maxDesigns: 24,
  features: { arrivalNotices: true, alliances: true, gifts: true, surrender: true, stances: true, lateArrival: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  HIT, hit, hab, popU, setPopU, maxPopU, incomeU, interestOn, mineMoney, mineMetal, terraCost, terraStep, aiSpec,
  fleetStrength, planetStrength, techLevelCost, disposable, START, research,
  distance,
  newStar, setupPlayer, afterSetup, defaultDesigns, makeGalaxy, computerSetup, SHAPES, difficulty, masterPoints,
  maxPop: (G, p, s) => maxPopU(p, s) / 1000,
  planetClass, planetIncome,
  designLimits, designCost,
  designMin: (G, k) => k === 'M' ? 0 : 1,
  // computers above Dumb never pay development costs (FUN_10086830, FUN_100852d0)
  paysPrototype: (G, p) => p.human || !p.ai || p.ai.iq < 2,
  canBuild: (G, p, type) => type === 'bio' ? !!p.hasBio : type === 'decoy' ? !!p.hasDecoy : true,
  borrowLimit, projected, economy, afterMovement, refuel, settle, canColonize, exploreQuality, battle,
  observe: observeHook, scrapReturn, scrapInSpace, randomEvents, fleetArrives,
});
})(this);
