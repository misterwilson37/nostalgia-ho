// Spaceward Ho! web remake — the "DOS 2.0" ruleset.
//
// Spaceward Ho! 2.0 for DOS (1993, ported by Presage for New World
// Computing) is the same game as Spaceward Ho! 2.0 for Windows 3.1
// (WINHO.EXE, 1992), and the Windows program was decompiled to write these
// rules. It is an earlier build of the engine behind the Mac 5.0.5 game, so
// this ruleset borrows the "Original" (5.0.5) formulas where 2.0 does the
// same thing, and replaces the rest.
//
// Labels: CONFIRMED (seg:off) = read from that WINHO.EXE function;
// INFERRED = not settled by the decompile (kept from 5.0.5 or the remake).
// docs/dos-findings.md explains each rule in plain English.
//
// The money model is 2.0's, not 5.0.5's: there is one pool of money (kept in
// p.savings). Every turn all of it is divided by shares (per mille): one per
// colony, one for Technology and one kept as Savings. Money a colony or the
// lab doesn't use comes back only as a refund; what is kept earns interest;
// at the end of the turn the pool is rebuilt from what was kept, the
// refunds, the interest and the colonies' income.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, msg, fmt, colonies, getDesign, shipCostNow, addShipsToStar, findOrCreateDesign, observe, starDist,
  fleetCount, fleetDesigns, fleetMaxRange, queueShips, isAllied, TECHS } = E;
const O = E.RULESETS.original;
const { popU, setPopU, hab } = O;
const trunc = Math.trunc;
// integer square root of a long (FUN_10d0_0000: FSQRT, then truncate; 0 for x <= 0)
const isqrt = (x) => x > 0 ? trunc(Math.sqrt(x)) : 0;
const TECH5 = ['range', 'speed', 'weapons', 'shields', 'mini'];
const LY_PER_UNIT = 2; // map units, as in the Original ruleset
const MONEY_MAX = 999999999; // CONFIRMED (FUN_1040_0038): the pool is clamped to 0..999,999,999

// ---------- player setup (FUN_1030_1299) ----------
// CONFIRMED (FUN_1030_1299): money, metal, home population and the colony
// income field per skill. 2.0 has one money pool: the skill's money is that
// pool, not a separate income plus savings.
const SKILLS = {
  novice:   { money: 51000, metal: 20000, pop: 750000, homeInc: 51000, designs: true, scouts: 2, colony: 1 },
  beginner: { money: 41000, metal: 12000, pop: 625000, homeInc: 30000, designs: true, scouts: 2, colony: 0 },
  normal:   { money: 30000, metal: 5000,  pop: 500000, homeInc: 30000, designs: true, scouts: 0, colony: 0 },
  advanced: { money: 20000, metal: 2500,  pop: 350000, homeInc: 30000, designs: false, scouts: 0, colony: 0 },
  expert:   { money: 20000, metal: 0,     pop: 350000, homeInc: 30000, designs: false, scouts: 0, colony: 0 },
};
// CONFIRMED (FUN_1050_1ec9 @1050:1fc2): a computer starts at skill 4 - 2*(IQ-1):
// Dumb like an Expert, Average like Normal, Smart like a Novice
const COMPUTER_START = { dumb: 'expert', average: 'normal', smart: 'novice' };
function setupPlayer(G, p, home, start) {
  const k = SKILLS[start] ? start : 'normal', st = SKILLS[k];
  // home star: CONFIRMED (FUN_1030_1299), the same as 5.0.5: 0..200 F, 0.5..2 G, 10,000 metal
  home.t = RI(G, 0, 2000) / 10;
  const g = RI(G, 1, 2);
  home.g = RI(G, 25 * (1 << g), 25 * (1 << (g + 1))) / 100;
  home.metal = 10000;
  p.homeG = home.g; p.homeT = home.t;
  home.owner = p.id; setPopU(home, st.pop); home.everProfit = true;
  home.oInc = st.homeInc; home.oSink = 5000;
  // home colony bar chart: CONFIRMED (1030:1299, words +1..+3 of the colony
  // slot): terraforming done (-1), mining 200, ships 800 per mille
  home.terra = 0; home.ship = 0.8; home.queue = []; home.yard = 0; home.yardMetal = 0;
  p.savings = st.money; p.metal = st.metal;
  // the income field starts as a copy of the money (shown as the first turn's income)
  p.oInc = st.money; p.oInterest = 0; p.oRefund = 0; p.oKept = 0;
  p.lastGross = p.lastIncome = p.lastNet = st.money;
  // CONFIRMED (1030:1299): tech 6/2/2/2/0 with no progress into the next level,
  // five equal research shares, no Radical
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {}; for (const t of TECHS) p.tprog[t] = p.tech[t] * 100;
  p.talloc = { range: 200, speed: 200, weapons: 200, shields: 200, mini: 200, radical: 0 };
  // CONFIRMED (1030:1299): three budget slots: Savings 0, Technology 150, home 850 per mille
  p.budget = { tech: 0.15, savings: 0, col: { [home.id]: 0.85 } };
  p.flags = {}; p.bonus = {}; p.deck = [];
  p.skill = k; p.startRank = 0;
}
// starting designs (CONFIRMED, 1030:1299): Scout R8 V2 W1 S1; Satellite, Colony
// Ship and Fighter R6 V2 W2 S2; Mini 0. Advanced and Expert players start with none.
function defaultDesigns(G, p) {
  if (!SKILLS[p.skill].designs) return;
  findOrCreateDesign(G, p, { type: 'scout', R: 8, V: 2, W: 1, S: 1, M: 0 });
  findOrCreateDesign(G, p, { type: 'satellite', R: 0, V: 2, W: 2, S: 2, M: 0 });
  findOrCreateDesign(G, p, { type: 'colony', R: 6, V: 2, W: 2, S: 2, M: 0 });
  findOrCreateDesign(G, p, { type: 'fighter', R: 6, V: 2, W: 2, S: 2, M: 0 });
}
// free ships (CONFIRMED, 1030:1299 -> FUN_1068_0000): Novice a Colony Ship,
// Novice and Beginner two Scouts, each Scout in a fleet of its own
function afterSetup(G) {
  for (const p of G.players) {
    const st = SKILLS[p.skill], home = G.stars[p.homeStar];
    const by = (t) => p.designs.find(d => d.type === t);
    if (st.colony && by('colony')) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; f.colonists = 10; }
    for (let i = 0; i < st.scouts && by('scout'); i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}
// CONFIRMED (FUN_1030_036b): one IQ for every computer, Dumb, Average or Smart
function computerSetup(G, opts, k, nComp) {
  const iq = COMPUTER_START[opts.iq] ? opts.iq : 'average';
  return { start: COMPUTER_START[iq], iq };
}

// ---------- galaxy (FUN_1030_0000 and the shape routines) ----------
// Star x, y are whole light-years. Distance (FUN_1100_006c), CONFIRMED:
// max + 0.3 min, rounded up.
function wdist(a, b) {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return trunc((10 * Math.max(dx, dy) + 3 * Math.min(dx, dy) + 9) / 10);
}
function distance(G, a, b) {
  if (a === b) return 0;
  if (a.x10 == null || b.x10 == null) return O.distance(G, a, b); // a game started before these rules
  return wdist({ x: Math.round(a.x10 / 10), y: Math.round(a.y10 / 10) }, { x: Math.round(b.x10 / 10), y: Math.round(b.y10 / 10) });
}
const COS = [], SIN = []; // 100 x cos/sin of each degree (INFERRED: 2.0's own table wasn't compared)
for (let a = 0; a < 360; a++) { COS.push(trunc(100 * Math.cos(a * Math.PI / 180))); SIN.push(trunc(100 * Math.sin(a * Math.PI / 180))); }
const up3 = (s) => (trunc((s - 1) / 3) + 1) * 3;
const SHAPES = ['circle', 'random', 'ring', 'spiral', 'grid'];
const SIZES = ['small', 'medium', 'large', 'xl', 'huge'];
// star counts, CONFIRMED (1030:019b..024d)
const GRID_COUNT = { small: 25, medium: 36, large: 64, xl: 100, huge: 169 };
const COUNT = { small: [20, 12], medium: [32, 16], large: [48, 20], xl: [68, 32] };
function sizeKey(v) {
  if (SIZES.includes(v)) return v;
  if (typeof v === 'number') return v < 20 ? 'small' : v < 45 ? 'medium' : v < 65 ? 'large' : v < 90 ? 'xl' : 'huge';
  return 'medium';
}
function makeGalaxy(G, opts, nPlayers) {
  const shape = SHAPES.includes(opts.shape) ? opts.shape : 'random';
  const size = sizeKey(opts.size);
  const sparse = opts.density === 'sparse' || (typeof opts.density === 'number' && opts.density >= 50);
  const n = shape === 'grid' ? GRID_COUNT[size] : size === 'huge' ? RI(G, 101, 190) : RI(G, 1, COUNT[size][1]) + COUNT[size][0];
  // CONFIRMED (Create Galaxy dialog, shape routines): Dense step 4 / cap 35,
  // Sparse step 6 / cap 49 for rings; grid spacing 4 or 6 ly
  const step = sparse ? 6 : 4, cap = sparse ? 49 : 35;
  const P = [];
  for (let i = 0; i < n; i++) P.push({ x: 0, y: 0 });
  // CONFIRMED (FUN_1030_0f33): a star is at least 4 ly from every star placed before it
  const ok = (i) => { for (let j = 0; j < i; j++) if (wdist(P[j], P[i]) < 4) return false; return true; };
  let S = 0, homes = null;
  const put = (idx, r, a) => { // up to 20 tries near angle a on ring r
    for (let t = 0; t < 20; t++) {
      P[idx].x = (S >> 1) + trunc(COS[a] * r / 100) + RI(G, -1, 1);
      P[idx].y = (S >> 1) + trunc(SIN[a] * r / 100) + RI(G, -1, 1);
      if (ok(idx)) return true;
    }
    return false;
  };
  const ringSteps = (r) => trunc(360 / (trunc(r * 44 / cap) + 1));
  if (shape === 'circle' || shape === 'ring') { // CONFIRMED (FUN_1030_04dc, FUN_1030_0690)
    const r0 = shape === 'ring' ? clamp(trunc(n / 4), 7, 12) : 0;
    let r = r0, c = 0;
    while (c < n) { c += trunc(r * 44 / cap) + 1; r += step; }
    S = up3((r + (shape === 'ring' ? trunc(step / 2) : step)) * 2);
    let idx = 0;
    for (r = r0; idx < n; r += step) {
      let as = ringSteps(r);
      if (n - idx < trunc(360 / as)) as = trunc(360 / (n - idx));
      for (let a = 0; a < 360 && idx < n; a += as) if (put(idx, r, a)) idx++;
    }
  } else if (shape === 'random') { // CONFIRMED (FUN_1030_03ba)
    S = isqrt(25 * n);
    if (sparse) S = trunc(S * 5 / 4);
    S = up3(S);
    const h = trunc(S / 2), a = h - 2, b = S % 2 === 1 ? h - 2 : h - 3;
    for (let i = 0, guard = 0; i < n;) {
      P[i].x = RI(G, 0, a) + RI(G, 0, b) + 2; P[i].y = RI(G, 0, a) + RI(G, 0, b) + 2;
      if (ok(i) || ++guard > 20000) { i++; guard = 0; } // 2.0 has no give-up guard
    }
    homes = [...Array(nPlayers).keys()]; // the first stars are the homes
  } else if (shape === 'grid') { // CONFIRMED (FUN_1030_0bd0)
    const sp = sparse ? 6 : 4;
    let k = 1; while (k * k < n) k++;
    S = up3(k * sp);
    let idx = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) if (idx < n) { P[idx].x = trunc(sp / 2) + i * sp; P[idx].y = trunc(sp / 2) + j * sp; idx++; }
  } else { // spiral, CONFIRMED (FUN_1030_086f)
    const core = Math.max(8, trunc(isqrt(n) * step / 2));
    // arms: computers plus the humans of the last game, 6..10 (here: the players)
    const arms = clamp(nPlayers, 6, 10);
    let c = 0, rr = 0;
    for (; c < n && rr < core; rr += step) c += trunc(rr * 44 / cap) + 1;
    if (c < n) rr += trunc((n + arms - 1) / arms);
    S = up3((rr + 2 * step) * 2);
    let idx = 0, r = 0;
    for (; idx < n && r < core; r += step) for (let a = 0; a < 360 && idx < n; a += ringSteps(r)) if (put(idx, r, a)) idx++;
    const as = trunc(360 / arms);
    let twist = 0;
    while (idx < n) { // stars fill forward; no wider search for the arm tips
      twist = (twist + 6) % 360;
      for (let j = 0; j < arms && idx < n; j++) if (put(idx, r, (j * as + twist) % 360)) idx++;
      r += step - 1;
    }
  }
  // CONFIRMED (FUN_1030_0c97): home stars for all 20 player slots, at least
  // 20 ly apart if possible, relaxing 4 ly at a time
  if (!homes) {
    homes = [];
    for (let slot = 0; slot < Math.min(20, n); slot++) {
      let pickd = -1;
      for (let minD = 20; minD >= 0 && pickd < 0; minD -= 4) {
        for (let t = 0; t < 25; t++) {
          let c = -1;
          for (let u = 0; u < 20; u++) { const v = RI(G, 0, n - 1); if (!homes.includes(v)) { c = v; break; } }
          if (c < 0) c = [...Array(n).keys()].find(v => !homes.includes(v));
          if (homes.every(hh => wdist(P[hh], P[c]) >= minD)) { pickd = c; break; }
        }
      }
      homes.push(pickd);
    }
    homes = homes.slice(0, nPlayers);
  }
  // CONFIRMED (FUN_1030_0e47): shift so the smallest x and y are 2 ly; S = max(maxX, maxY + 2) + 3
  const minX = Math.min(...P.map(q => q.x)), minY = Math.min(...P.map(q => q.y));
  for (const q of P) { q.x += 2 - minX; q.y += 2 - minY; }
  S = Math.max(Math.max(...P.map(q => q.x)), Math.max(...P.map(q => q.y)) + 2) + 3;
  return { W: S / LY_PER_UNIT, H: S / LY_PER_UNIT, pts: P.map(q => ({ x: q.x / LY_PER_UNIT, y: q.y / LY_PER_UNIT, x10: q.x * 10, y10: q.y * 10 })), homes };
}
// CONFIRMED (FUN_1030_1049): the 190 star names of 2.0 (string ids 432..621),
// at most 7 letters. (Names that winners add to the list aren't kept.)
const STAR_NAMES = ['Sol', 'Sirius', 'Canopus', 'Vega', 'Rigel', 'Capella', 'Procyon', 'Mira', 'Altair', 'Antares', 'Spica', 'Pollux', 'Castor', 'Deneb', 'Regulus', 'Polaris', 'Algol', 'Proxima', 'Alban', 'Thuban', 'Mizar', 'Alcor', 'Doobie', 'Merak', 'Phad', 'Megrez', 'Alioth', 'Alkaid', 'Mintaka', 'Alnitak', 'Atlas', 'Remus', 'Alcyon', 'Electra', 'Maia', 'Merope', 'Taygeta', 'Sterope', 'Hadar', 'Quark', 'Mimosa', 'Adhara', 'Shaula', 'Nath', 'Almak', 'Alshain', 'Tarazed', 'Hamal', 'Izar', 'Shedir', 'Menkar', 'Diphda', 'Etamin', 'Acamar', 'Alhena', 'Alphard', 'Arneb', 'Nihal', 'Saiph', 'Markab', 'Kansas', 'Enif', 'Nunki', 'Kokab', 'Ain', 'Ancha', 'Arkab', 'Atik', 'Atria', 'Shadow', 'Azha', 'Baham', 'Beid', 'Botein', 'Caph', 'Coxa', 'Cursa', 'Dabih', 'Furud', 'Gedi', 'Gienah', 'Heka', 'Keid', 'Maaz', 'Matar', 'Mirfak', 'Murzim', 'Delta', 'Ozworld', 'Okda', 'Phact', 'Propus', 'Rana', 'Risha', 'Sabik', 'Petro', 'Syrma', 'Tarf', 'Wasat', 'Wazn', 'Yed', 'Yildun', 'Zaniah', 'Zaurac', 'Zosma', 'Ylum', 'Arrakis', 'Akworld', 'Colma', 'Henry', 'Foundat', 'Trantor', 'Barsoom', 'Rover', 'Fluffy', 'Lennon', 'Gorby', 'Atlanta', 'Chicago', 'Miami', 'Home', 'Binar', 'Nemesis', 'Harkon', 'Talos', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Pisces', 'Canis', 'Ursa', 'Beta', 'Zeta', 'Upsilon', 'Rho', 'Cepheus', 'Calvin', 'Hobbes', 'Pooh', 'Tigger', 'Bambi', 'Dumbo', 'Tweety', 'Bugs', 'Torino', 'Denali', 'Woz', 'Sauron', 'Smaug', 'Thune', 'Thorin', 'Gollum', 'Fazaron', 'Trellor', 'Regor', 'Basil', 'Ursula', 'Styx', 'Lentor', 'Sooltar', 'Romula', 'Vulcan', 'Paradox', 'Kessel', 'Redox', 'Sith', 'Yavin', 'Quatro', 'Remulak', 'Kathoon', 'Thanos', 'Krypton', 'Darven', 'Gotham', 'Klah', 'Zaphod', 'Turin', 'Vives', 'Timmer', 'Argot', 'Willy', 'Sirgil', 'Ender', 'Wobbler', 'Quayle'];
// star stats: CONFIRMED (FUN_1030_1049), the same as 5.0.5 (O.newStar)

// ---------- ships ----------
const TYPES4 = ['scout', 'fighter', 'colony', 'satellite']; // CONFIRMED: the four classes
// CONFIRMED (FUN_10f0_05e9): costs. Price = mm*B (+45,000 for a colony ship),
// prototype 2*mm*price-before-extra, metal B/(3 mm), hit points B/3.
// The attack rating is only the computers' estimate; 2.0 doesn't divide it by
// 50, but it is divided here so the 5.0.5 computer players keep their scale (INFERRED).
const WPNRAT = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 8, 10, 15, 25, 50,
  74, 84, 89, 91, 93, 94, 95, 95, 96, 96, 96, 96, 97, 97, 97, 97, 97, 97, 97, 97, 97, 98, 98, 98, 98]; // CONFIRMED: RCDATA #3 "WPNRAT"
const wpn = (x) => WPNRAT[clamp(x, 0, 50)];
function designCost(G, d) {
  const M = Math.max(0, d.M | 0), R = d.R | 0, V = d.V | 0, W = d.W | 0, S = d.S | 0;
  const mm = (M + 1) / 2 + 0.5;
  const B = d.type === 'satellite' ? (W + 13) * (S + 13) * 4.445 : (R + 10) * (V + 15) * (W + 13) * (S + 13) / 30.6;
  let money, protoTotal, metal, hp;
  if (d.type === 'colony') {
    money = trunc(mm * B + 45000); protoTotal = trunc(2 * mm * (mm * B + 45000));
    metal = trunc(B / (3 * mm) + 3000); hp = trunc(B / 3 + 1000);
  } else {
    money = trunc(mm * B); protoTotal = trunc(2 * mm * mm * B);
    metal = trunc(B / (3 * mm)); hp = trunc(B / 3);
  }
  const a = trunc(hp / 50) * W * W, b = trunc(W * W * wpn(W + 25) * (5 * W + 20) / 300);
  const att = Math.min(1000000, trunc(Math.max(a, b) / 50));
  return { money, metal, proto: Math.max(0, protoTotal - money), protoTotal, hp: Math.max(1, hp), att };
}
// CONFIRMED (CREATETYPEDLGPROC 10e8:0c79-0d72): Range 3..tech (+2 for a Scout,
// 0 for a Satellite); Speed 1..tech, a Satellite's fixed at the tech;
// Weapons and Shields 1..tech (-1 for a Scout); Mini 0..tech.
function designLimits(G, p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 2; L.W = Math.max(1, t.weapons - 1); L.S = Math.max(1, t.shields - 1); }
  if (type === 'satellite') L.R = 0;
  return L;
}
function designMin(G, k, type) {
  if (k === 'M') return 0;
  if (k === 'R') return type === 'satellite' ? 0 : 3;
  if (k === 'V' && type === 'satellite' && G.players[G.cur || 0]) return G.players[G.cur || 0].tech.speed;
  return 1;
}
// computer designs, CONFIRMED (FUN_1020_4019): Scout R+2 W-1 S-1, Satellite R0,
// Colony Ship Mini/3 when above 1
function aiSpec(p, type) {
  const t = p.tech, s = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { s.R += 2; s.W = Math.max(1, s.W - 1); s.S = Math.max(1, s.S - 1); }
  if (type === 'satellite') s.R = 0;
  if (type === 'colony' && s.M > 1) s.M = trunc(s.M / 3);
  return s;
}
// CONFIRMED (FUN_1040_1479, FUN_1040_1a2f): only humans pay for prototypes
const paysPrototype = (G, p) => !!p.human;

// ---------- fleets ----------
// CONFIRMED (FUN_1040_1a2f): new Fighters and Satellites join an idle fleet
// of the same ship type at the star; Scouts and Colony Ships get a fleet of their own.
function fleetFor(G, pid, sid, d) {
  if (d.type !== 'fighter' && d.type !== 'satellite') return null;
  return G.fleets.find(x => x.owner === pid && x.star === sid && x.to == null && x.dest == null && !x.path && Object.keys(x.ships).every(k => +k === d.id)) || null;
}
// CONFIRMED (FUN_1040_25ce -> FUN_1068_03a9): a fleet sent too far for its fuel
// is routed through your own colonies, each hop within its Range, at most
// 42/Range hops, the shortest such way if it is under three times the direct
// distance. (2.0 plans the route again at every stop; here it is planned once.)
function route(G, f, tgt) {
  const R = fleetMaxRange(G, f);
  if (!(R > 0) || f.star == null) return null;
  const direct = starDist(G, f.star, tgt);
  if (direct <= f.fuel + 1e-9) return [tgt];
  const nodes = colonies(G, f.owner).map(s => s.id).filter(i => i !== f.star && i !== tgt).concat([tgt]);
  const maxHops = Math.max(1, trunc(42 / R));
  let layer = new Map([[f.star, { d: 0, path: [] }]]), best = null;
  const seen = new Map([[f.star, 0]]);
  for (let h = 0; h < maxHops && layer.size; h++) {
    const next = new Map();
    for (const [u, cu] of layer) {
      const reach = u === f.star ? f.fuel : R;
      for (const v of nodes) {
        const d = starDist(G, u, v);
        if (v === u || d > reach + 1e-9) continue;
        const nd = cu.d + d, path = cu.path.concat([v]);
        if (v === tgt) { if (!best || nd < best.d) best = { d: nd, path }; continue; }
        if (seen.has(v) && seen.get(v) <= nd) continue;
        seen.set(v, nd); next.set(v, { d: nd, path });
      }
    }
    layer = next;
  }
  return best && best.d < 3 * direct ? best.path : null;
}

// ---------- the money pool ----------
// Shares are fractions of the pool (the remake keeps them as fractions; 2.0
// keeps per mille). They are normalized here, as the budget bars do.
function shareOf(G, p) {
  const b = p.budget, cols = colonies(G, p.id);
  for (const k in b.col) if (!G.stars[k] || G.stars[k].owner !== p.id) delete b.col[k];
  for (const s of cols) if (b.col[s.id] == null) b.col[s.id] = 0;
  let tot = (b.tech || 0) + (b.savings || 0); for (const k in b.col) tot += b.col[k];
  if (!(tot > 0)) { b.savings = 1; tot = 1; }
  const M0 = Math.max(0, p.savings);
  return (x) => trunc(M0 * (x || 0) / tot);
}
// what a colony has to spend (FUN_1040_0925, 0aea and 1479 all do this):
// its share, less its loss if it is losing money
function colonyMoney(G, p, s, share) {
  const inc = s.oInc || 0;
  return share(p.budget.col[s.id]) + (inc < 0 ? inc : 0);
}
function removeColony(G, p, s) {
  s.owner = -1; s.pop = 0; s.queue = []; s.yard = 0; s.yardMetal = 0;
  delete p.budget.col[s.id];
}
function disposable(G, p) {
  const M0 = Math.max(0, p.savings);
  let support = 0;
  for (const s of colonies(G, p.id)) if ((s.oInc || 0) < 0) support += -s.oInc;
  return { D: Math.max(0, M0 - support), support, I: p.oInterest || 0 };
}
// for the budget panel: the bars divide the whole pool
function projected(G, p) {
  const { support, I } = disposable(G, p);
  return { gross: p.oInc, income: (p.oInc || 0) - support, interest: I, net: Math.max(0, p.savings), dip: 0 };
}
// colonies whose share won't cover their loss this turn (they lose people)
function underfunded(G, p) {
  const share = shareOf(G, p);
  return colonies(G, p.id).filter(s => (s.oInc || 0) < 0 && colonyMoney(G, p, s, share) < 0);
}

// ---------- pass 1: funding, terraforming, mining, ships, research ----------
function economy(G, p) {
  const share = shareOf(G, p);
  p.oKept = share(p.budget.savings); p.oRefund = 0;
  // CONFIRMED (FUN_1040_0925): a colony losing more than its share loses
  // people; with none left it is abandoned. Profitable colonies are never
  // touched, whatever their share. Applies to every colony, home included.
  for (const s of colonies(G, p.id)) {
    s.oStarve = false;
    const inc = s.oInc || 0, sh = share(p.budget.col[s.id]);
    if (inc >= 0 || sh + inc >= 0) continue;
    const u = Math.max(0, trunc(popU(s) * sh / -inc) - 100);
    setPopU(s, u);
    if (u === 0) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9036', star: s.id }); removeColony(G, p, s); }
    else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', sound: 3002, star: s.id }); }
  }
  // CONFIRMED (FUN_1040_0aea): terraforming and mining
  for (const s of colonies(G, p.id)) {
    const M = colonyMoney(G, p, s, share);
    if (M <= 0) continue;
    const h = hab(p, s), ship = clamp(s.ship || 0, 0, 1);
    const terraOK = h.dT > 0, metalOK = s.metal >= 1;
    // INFERRED: 2.0 marks a finished part -1 and its money is lost; the
    // remake's planet panel hides a finished part, so its money goes to the other
    let tf = s.terra == null ? 0.5 : s.terra;
    if (!terraOK) tf = 0; if (!metalOK) tf = terraOK ? 1 : 0;
    let T = trunc(M * (1 - ship) * tf), X = trunc(M * (1 - ship) * (1 - tf));
    if (!terraOK && !metalOK) { p.oRefund += T + X; continue; }
    if (T > 0) {
      if (T > 50 && h.gR > 256) msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id }); // every turn
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, T); s.oSink += x; T -= x; }
      const step = isqrt(trunc(T / 2)); // tenths of a degree
      if (step > h.dT) {
        p.oRefund += 2 * (step - h.dT) * (step - h.dT);
        s.t = p.homeT;
        msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
      } else s.t += (s.t < p.homeT ? 1 : -1) * step / 10;
    }
    if (X > 0) {
      let got = isqrt(X) * 15;
      const have = Math.floor(s.metal);
      if (got >= have) {
        const ex = got - have;
        p.oRefund += trunc((ex * ex + 224) / 225);
        got = have;
        msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably abandon it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
      }
      s.metal -= got; p.metal += got;
    }
  }
  // CONFIRMED (FUN_1040_1479): shipbuilding
  for (const s of colonies(G, p.id)) shipyard(G, p, s, colonyMoney(G, p, s, share));
  // CONFIRMED (FUN_1040_1b11): research
  const T = share(p.budget.tech);
  if (T <= 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011', quiet: true }); // every turn
  research(G, p, T);
}
// CONFIRMED (FUN_1040_1479): each colony builds its queue (three slots of
// design and count) from its Ship share. A ship is built when its price and
// metal are both there; what can't finish part-pays the first ship (money and
// a matching part of its metal, set aside), and any other money left goes
// back into the pool. Computer players use the same queues.
const QUEUE_SLOTS = 3;
function shipyard(G, p, s, M) {
  const q = s.queue || (s.queue = []);
  const ship = clamp(s.ship || 0, 0, 1);
  if ((M < 500 || ship <= 0) && q.length) msg(G, p.id, `You have ships queued at ${s.name} but have no money allocated for shipbuilding.`, { icon: 'm9020', star: s.id, quiet: true });
  if (M <= 0 || ship <= 0) return;
  let S = trunc(M * ship) + (s.yard || 0);
  p.metal += s.yardMetal || 0; s.yard = 0; s.yardMetal = 0;
  const built = {};
  let any = false;
  while (S > 0 && p.metal > 0 && q.length) {
    const it = q[0], d = getDesign(G, p.id, it.did);
    if (!d || d.scrapped) { q.shift(); continue; }
    const c = shipCostNow(G, p, d);
    if (c.money <= S && c.metal <= p.metal) {
      any = true; S -= c.money; p.metal -= c.metal; d.built++;
      addShipsToStar(G, p.id, s.id, d, 1);
      built[d.id] = (built[d.id] || 0) + 1;
      if (--it.n <= 0) q.shift();
    } else {
      const fm = trunc(S * 100 / c.money), fx = trunc(p.metal * 100 / Math.max(1, c.metal));
      if (S < c.money && fm < fx) { s.yard = S; S = 0; s.yardMetal = trunc(fm * c.metal / 100); }
      else { s.yardMetal = p.metal; s.yard = trunc(fx * c.money / 100); S -= s.yard; }
      p.metal -= s.yardMetal; s.yardDid = d.id;
      break;
    }
  }
  for (const did in built) { const d = getDesign(G, p.id, +did), n = built[did]; msg(G, p.id, `Built ${n === 1 ? 'one' : n} ${d.name} at ${s.name}.`, { icon: 'm9003', star: s.id, quiet: true }); }
  const limit = Math.max(500, trunc(Math.max(0, p.savings) / 100));
  if (S > limit) {
    if (q.length) msg(G, p.id, `You are spending money on shipbuilding at ${s.name} but have no metal available.`, { icon: 'm9020', star: s.id, quiet: true });
    else if (!any && G.opts.overspendWarnings !== false) msg(G, p.id, `You are spending money on shipbuilding at ${s.name} but have no ships queued.`, { icon: 'm9020', star: s.id, quiet: true });
  }
  p.oRefund += Math.max(0, S);
}
// taking the first ship out of the queue gives back what was paid toward it (INFERRED)
function yardRefund(G, p, s) {
  if (s.queue && s.queue.length && s.queue[0].did === s.yardDid) return;
  p.savings += s.yard || 0; p.metal += s.yardMetal || 0;
  s.yard = 0; s.yardMetal = 0;
}
// what the first ship in the queue still needs, for the interface
function yardProgress(G, p, s) {
  const it = (s.queue || [])[0]; if (!it) return null;
  const d = getDesign(G, p.id, it.did); if (!d) return null;
  const c = shipCostNow(G, p, d), paid = s.yardDid === d.id ? s.yard || 0 : 0;
  return { design: d, paid, cost: c.money, metal: c.metal, pct: Math.min(100, Math.floor(100 * paid / Math.max(1, c.money))) };
}
// CONFIRMED (FUN_1040_1b11): points = isqrt(money / divisor) x 60..140%,
// per tech every turn; level costs Range L^2, Speed (L+6)^2, Weapons and
// Shields (L+2)^2, Mini (L+7)^2. No bonus on reaching a level and no cap.
const DIV = { range: 120, speed: 150, weapons: 150, shields: 150, mini: 200 };
const levelCost = (k, L) => k === 'range' ? L * L : k === 'speed' ? (L + 6) * (L + 6) : k === 'mini' ? (L + 7) * (L + 7) : (L + 2) * (L + 2);
const TECHLABEL = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shield', mini: 'Miniaturization' };
const TECHICON = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' };
function research(G, p, T) {
  let tot = 0; for (const k of TECH5) tot += p.talloc[k] || 0;
  for (const k of TECH5) {
    const X = tot > 0 ? trunc(T * (p.talloc[k] || 0) / tot) : 0;
    let pts = trunc(isqrt(trunc(X / DIV[k])) * RI(G, 60, 140) / 100);
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100, cost = levelCost(k, L);
      if (cost <= 0) { p.tprog[k] += frac; continue; }
      const need = trunc(frac * cost / 100);
      if (pts > need) { p.tprog[k] += frac; pts -= need; }
      else { p.tprog[k] += trunc(pts * 100 / cost); pts = 0; }
    }
    const lvl = trunc(p.tprog[k] / 100);
    if (lvl > p.tech[k]) {
      p.tech[k] = lvl;
      msg(G, p.id, `Your ${TECHLABEL[k]} Technology has reached level ${lvl}.`, { icon: TECHICON[k], sound: 2000, tech: k });
    }
  }
}

// ---------- pass 2: savings, interest, meteors, growth, income (FUN_1040_27ee) ----------
// CONFIRMED (FUN_1040_27ee): ln of the integer square root
function incomeU(u, H) {
  const r = isqrt(u), mult = r > 0 ? Math.max(1, Math.log(r)) : 1;
  return trunc(mult * u / 76) - trunc((H / 40 + 100) * u / 10000 + 7500);
}
function planetIncome(G, p, s) { return incomeU(popU(s), hab(p, s).H); }
function afterMovement(G, p) {
  // CONFIRMED (1040:284f-2995): kept money plus refunds earns 10 x isqrt of itself; no borrowing
  const saved = (p.oKept || 0) + (p.oRefund || 0);
  const interest = 10 * isqrt(saved);
  let M = saved + interest;
  p.oKept = 0; p.oRefund = 0;
  meteors(G, p);
  let gross = 0, net = 0;
  for (const s of colonies(G, p.id)) {
    // a colony founded this turn waits a turn (2.0 founds it after this step)
    if (s.oNew) continue;
    const before = s.oInc == null ? -7501 : s.oInc;
    const mx = O.maxPopU(p, s);
    let u = popU(s), add;
    // CONFIRMED (1040:2ad0-2f96): growth as in 5.0.5, also for underfunded colonies
    if (u >= mx) add = trunc(mx / 1000) + RI(G, 0, trunc(mx / 10000));
    else if (before <= -7500) add = Math.min(trunc(mx / 1000), 2 * u) + RI(G, 0, 5);
    else {
      const r1 = RI(G, 0, 5), r2 = RI(G, 0, trunc(mx / 100)), base = trunc(mx / 20);
      add = base + r2 < 2 * u + r1 ? base + RI(G, 0, trunc(mx / 100)) : 2 * u + RI(G, 0, 5);
      if (u + add >= mx) msg(G, p.id, `${s.name}’s population growth rate has slowed.`, { icon: 'm9030', star: s.id, quiet: true });
    }
    u += add; setPopU(s, u);
    const inc = incomeU(u, hab(p, s).H);
    s.oInc = inc;
    if (inc > 0) { M += inc; gross += inc; } // a losing colony is paid from its own share
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 2000, star: s.id }); }
    if (before <= -7500 && inc > -7500) msg(G, p.id, `It’s a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', star: s.id });
  }
  p.savings = clamp(M, 0, MONEY_MAX);
  p.oInterest = interest; p.oInc = gross;
  p.lastGross = gross; p.lastIncome = net; p.lastInterest = interest; p.lastNet = net + interest;
  // CONFIRMED (FUN_1040_3645): a new colony gets a share worth $15,000 when
  // the pool is over $20,000 (FUN_1010_16f2), taken from the other shares but
  // never below what a losing colony needs (FUN_1010_218e); otherwise nothing
  for (const s of colonies(G, p.id)) {
    if (!s.oNew) continue;
    s.oNew = false;
    if (p.savings > 20000) giveShare(G, p, s.id, 15000 / p.savings);
  }
}
function giveShare(G, p, sid, want) {
  const b = p.budget, M0 = Math.max(1, p.savings);
  let tot = (b.tech || 0) + (b.savings || 0); for (const k in b.col) if (+k !== sid) tot += b.col[k];
  if (!(tot > 0)) { b.col[sid] = 1; return; }
  const ents = [['tech', b, 0], ['savings', b, 0]];
  for (const k in b.col) if (+k !== sid) { const s = G.stars[k]; ents.push([k, b.col, s && (s.oInc || 0) < 0 ? Math.min(1, -s.oInc / M0) : 0]); }
  for (const e of ents) e[1][e[0]] = (e[1][e[0]] || 0) / tot; // sum to 1
  let room = 0; for (const [k, o, min] of ents) room += Math.max(0, o[k] - min);
  const take = Math.min(want, room);
  for (const [k, o, min] of ents) { const x = Math.max(0, o[k] - min); if (room > 0) o[k] -= x * take / room; }
  b.col[sid] = take;
}
// CONFIRMED (FUN_1040_0fca + FUN_1040_27ee): the only meteor showers are
// ships scrapped in hyperspace: their metal falls on the star they were
// heading to next and kills 50 people (units) per unit of metal. No escape
// into colony ships. (The remake shows people x1000, as everywhere.)
function meteors(G, p) {
  if (!G.meteors) return;
  for (const s of colonies(G, p.id)) {
    const m = G.meteors[s.id]; if (!m) continue;
    const kill = Math.min(popU(s), m * 50);
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', star: s.id });
    if (popU(s) <= 0) { msg(G, p.id, `A meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 2001, star: s.id }); removeColony(G, p, s); }
  }
}
// CONFIRMED (FUN_1040_0fca, FUN_1040_23ed and every caller of the report and
// alert routines): 2.0 has no random events. Its files hold the text of a
// nova, a revolt, a volcano, a wormhole, metal found and a fleet lost in
// hyperspace, but its code never shows them (they arrive in later versions).
function randomEvents(G) { if (G.meteors) G.meteors = {}; }

// ---------- colonies ----------
// CONFIRMED (FUN_1040_3645): 10 colonists per colony ship in the fleet;
// income -7501; bar chart terraform 900 / mine 100 / ships 0, or mine 1000
// when the gravity can never pay (ratio over 2.56). The new colony's share is
// set at the end of the turn (afterMovement).
function settle(G, p, s, f) {
  const n = f.colonists || 10;
  f.colonists = 0;
  s.owner = p.id; setPopU(s, n); s.everProfit = false; s._warned = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = true;
  s.terra = hab(p, s).gR > 256 ? 0 : 0.9; s.ship = 0;
  s.queue = []; s.yard = 0; s.yardMetal = 0;
  p.budget.col[s.id] = 0;
}

// ---------- battles (FUN_1018_0032, 1340, 14f7, 0976, 172a, 1e98, 260b) ----------
// CONFIRMED: the colony's owner holds the star; the others, in random order,
// fight the holder one at a time and the winner holds the star.
function battle(G, sid) {
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0);
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(present.map(f => f.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners];
  if (!ownerIds.some(a => ownerIds.some(b => !isAllied(G, a, b)))) return null;
  const startPop = s.pop;
  const rec = { id: G.nextId++, star: sid, year: G.year + 10, sides: ownerIds, rounds: [], start: [], planetOwner, pop0: s.pop, popR: [] };
  // each player's ships, by design
  const army = {};
  for (const o of ownerIds) army[o] = [];
  for (const f of present) for (const k in f.ships) {
    const d = getDesign(G, f.owner, +k), n = f.ships[k];
    if (!d || n <= 0) continue;
    let e = army[f.owner].find(x => x.d.id === d.id);
    if (!e) { const c = designCost(G, d); e = { d, c, n: 0, n0: 0, alive: [], members: [] }; army[f.owner].push(e); }
    e.members.push({ f, k, n }); e.n += n;
  }
  for (const o of ownerIds) for (const e of army[o]) { e.n0 = e.n; for (let i = 0; i < e.n; i++) { e.alive.push(rec.start.length); rec.start.push({ o, t: e.d.type, did: e.d.id }); } }
  const planet = planetOwner >= 0 ? { planet: true, o: planetOwner, hp: popU(s), W: G.players[planetOwner].tech.weapons } : null;
  let debris = 0;
  const hasShips = (o) => army[o].some(e => e.n > 0);
  const standing = (o) => hasShips(o) || (planet && o === planetOwner && planet.hp > 0);
  // units (FUN_1018_1340 / 14f7): each design is cut into groups so a side
  // has at most 5 (unless it has 5 or more designs); both sides use the larger group size
  const groupSize = (o) => {
    const es = army[o].filter(e => e.n > 0);
    if (es.length >= 5) return 0;
    const ships = es.reduce((a, e) => a + e.n, 0);
    let g = Math.max(1, trunc((ships + 4) / 5));
    while (es.reduce((a, e) => a + Math.ceil(e.n / g), 0) > 5) g++;
    return g;
  };
  const units = (o, g, defending) => {
    const U = [];
    for (const e of army[o]) {
      if (e.n <= 0) continue;
      const ids = e.alive.slice(0, e.n), size = g > 0 && army[o].filter(x => x.n > 0).length < 5 ? g : e.n;
      for (let i = 0; i < ids.length && U.length < 20; i += size)
        U.push({ o, e, type: e.d.type, init: e.d.V, W: e.d.W, S: e.d.S, hp: e.c.hp, debris: trunc(e.c.metal / 5), dmg: 0, idx: ids.slice(i, i + size), n: Math.min(size, ids.length - i) });
    }
    if (defending && planet && o === planetOwner && planet.hp > 0) U.push({ o, planet: true, init: 0, W: planet.W, S: planet.W, hp: planet.hp, n: 1, idx: [] });
    return U;
  };
  const fight = (A, D) => {
    const g = Math.max(groupSize(A), groupSize(D));
    const side = [units(A, g, false), units(D, g, true)];
    const tgt = [null, null];
    const up = (U) => U.some(u => u.n > 0);
    const maxInit = Math.max(0, ...side[0].concat(side[1]).map(u => u.init));
    // FUN_1018_1e98: one target per side: a colony ship, else a satellite,
    // else a ship from a random start, else the planet
    const pickTarget = (U) => {
      const ships = U.filter(u => !u.planet && u.n > 0);
      if (ships.length) {
        const c = ships.find(u => u.type === 'colony') || ships.find(u => u.type === 'satellite');
        if (c) return c;
        const all = U.filter(u => !u.planet), i0 = RI(G, 0, all.length - 1);
        for (let j = 0; j < all.length; j++) { const u = all[(i0 + j) % all.length]; if (u.n > 0) return u; }
      }
      return U.find(u => u.planet && u.n > 0) || null;
    };
    let rounds = 0;
    while (up(side[0]) && up(side[1]) && rounds < 20000) {
      rounds++;
      const ev = [];
      for (let lvl = maxInit; lvl >= 0; lvl--) {
        for (const U of side) for (const u of U) u.n0 = u.n; // ships hit this level still fire
        for (let k = 0; k < 2; k++) for (const u of side[k]) {
          if (u.init !== lvl || u.n0 <= 0) continue;
          if (u.planet && side[k].some(x => !x.planet && x.n > 0)) continue; // the planet fires last
          for (let i = 0; i < u.n0; i++) { // one shot per ship (satellites too)
            if (!tgt[k] || tgt[k].n <= 0) tgt[k] = pickTarget(side[1 - k]);
            const t = tgt[k]; if (!t) break;
            const si = u.planet ? -1 : u.idx[i % u.idx.length];
            const base = (RI(G, 0, 20) + u.W * 5 + 10) * wpn(u.W + 25 - t.S);
            if (t.planet) {
              const d = Math.min(t.hp, base * 4); t.hp -= d; if (t.hp <= 0) { t.hp = 0; t.n = 0; }
              if (ev.length < 80) ev.push({ a: u.o, si, p: 1 });
            } else {
              t.dmg += Math.max(1, trunc(base / 6));
              let k2 = 0, ti = t.idx[Math.max(0, t.n - 1)];
              if (t.dmg >= t.hp) { t.dmg = 0; t.n--; debris += t.debris; k2 = 1; } // no carry-over
              if (ev.length < 80) ev.push({ a: u.o, si, t: t.o, k: k2, ti });
            }
          }
        }
      }
      if (rec.rounds.length < 60) { rec.rounds.push(ev); rec.popR.push(planet ? planet.hp / 1000 : s.pop); }
      const pu = side[1].find(u => u.planet); if (pu) planet.hp = pu.hp;
    }
    const pu = side[1].find(u => u.planet); if (pu) planet.hp = pu.hp;
    for (const k of [0, 1]) {
      const left = new Map();
      for (const u of side[k]) if (!u.planet) { const a = left.get(u.e) || []; left.set(u.e, a.concat(u.idx.slice(0, u.n))); }
      for (const [e, ids] of left) { e.alive = ids; e.n = ids.length; }
    }
    return up(side[1]) ? D : up(side[0]) ? A : -1;
  };
  const order = ownerIds.filter(o => o !== planetOwner);
  for (let i = 0; i < order.length; i++) { const j = RI(G, 0, order.length - 1); [order[i], order[j]] = [order[j], order[i]]; }
  let holder = planetOwner >= 0 ? planetOwner : order.pop();
  for (const a of order) {
    if (holder < 0 || !standing(holder)) { holder = a; continue; } // both sides died: the next one takes over
    if (isAllied(G, a, holder) || !hasShips(a)) continue;
    holder = fight(a, holder);
  }
  // losses
  const lost = {}, survivors = {};
  for (const o of ownerIds) for (const e of army[o]) {
    let gone = e.n0 - e.n;
    lost[o] = (lost[o] || 0) + gone; survivors[o] = (survivors[o] || 0) + e.n;
    for (const m of e.members) { const x = Math.min(gone, m.n); m.f.ships[m.k] -= x; gone -= x; }
  }
  for (const f of present) {
    for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k];
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0 && G.fleets.includes(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  let planetDied = false;
  if (planet) {
    if (planet.hp <= 0) { const q = G.players[planetOwner]; removeColony(G, q, s); planetDied = true; }
    else setPopU(s, planet.hp);
  }
  // FUN_1018_260b: the metal of every ship destroyed (a fifth each) goes to
  // a winning colony owner, or falls on the star (told to the winner only)
  if (debris > 0) {
    if (holder >= 0 && s.owner === holder) { G.players[holder].metal += debris; msg(G, holder, `You have recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); }
    else { s.metal += debris; if (holder >= 0) msg(G, holder, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); }
  }
  const alive = new Set(); for (const o of ownerIds) for (const e of army[o]) for (const i of e.alive.slice(0, e.n)) alive.add(i);
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = rec.start.map((_, i) => alive.has(i) ? 1 : 0);
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}

// ---------- computer players (ai-original.js with these hooks) ----------
// personalities: CONFIRMED (FUN_1030_1b51) where the fields could be matched
// to 5.0.5's; the rest keep the 5.0.5 ranges (INFERRED)
function aiPersonality(G, p, ai, tw, iq, autoplay) {
  tw.mini = 1000 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 0; // no Radical
  if (autoplay) { Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 200, radical: 0 }); Object.assign(ai, { colDef: 50, metalDef: 50 }); }
  else if (iq === 1) Object.assign(ai, { upfront: 15, colDef: RI(G, 10, 20), attDom: RI(G, 75, 95), defDom: RI(G, 75, 95), aggr: 1, minFleet: 1 });
  else if (iq === 2) ai.attDom = RI(G, 150, 200);
  else Object.assign(ai, { aggr: 10, hatesHumans: true }); // Smart: targets owned by computers score a quarter (FUN_1020_10b5 @1020:1257)
}
// CONFIRMED (FUN_1020_4a3d @1020:4a85): before 2020 a Smart computer knows
// every star within 9 ly of its home
function aiTurnStart(G, p) {
  if (p.human || !p.ai || p.ai.iq !== 3 || G.year >= 2020) return;
  for (const s of G.stars) if (starDist(G, s.id, p.homeStar) <= 9) observe(G, p, s.id);
}
// CONFIRMED (FUN_1020_03e7 @1020:073e): mining money ceil((metal+25)^2/225);
// a mining colony (state 8) up to 7,500 (Dumb: no cap), others up to 2,500
function aiMineMoney(G, p, s, state, iq) {
  const m = Math.floor(s.metal) + 25, need = Math.ceil(m * m / 225);
  return state === 8 ? (iq === 1 ? need : Math.min(need, 7500)) : Math.min(need, 2500);
}
// CONFIRMED (FUN_1020_0b51 @1020:0bf6): terraforming money: a profitable
// colony up to 5,000; a losing one up to 1,800 (Dumb), else 7,200 while the
// pool is under $150,000 and 20,000 above
function aiTerraMoney(G, p, s, state, iq) {
  const dT = hab(p, s).dT, need = 2 * dT * dT + Math.max(0, 5000 - (s.oSink || 0));
  const cap = state === 10 ? 5000 : iq === 1 ? 1800 : p.savings < 150000 ? 7200 : 20000;
  return Math.min(need, cap);
}
// CONFIRMED (FUN_1020_2ec3): computers queue ships at a colony like humans.
// How much they queue and when is the 5.0.5 logic (INFERRED).
function aiBuild(ctx, d, sid, n) {
  const { G, p, A } = ctx, s = G.stars[sid];
  if (!d || n < 1 || s.owner !== p.id || popU(s) < n) return 0;
  const c = shipCostNow(G, p, d);
  if (p.metal < c.metal * n) return 0;
  if (!(c.metal < 1 || A.colShips > 0 || d.type === 'colony' || A.metal >= 5000 || A.broke)) return 0;
  if (A.shipLeft == null) A.shipLeft = A.D - A.reserve;
  if (A.shipLeft < 1 && !(d.type === 'satellite' && n <= 5)) return 0;
  // one colony ship on order at a time; otherwise top the order up to n
  if (d.type === 'colony' && colonies(G, p.id).some(c2 => (c2.queue || []).some(it => { const x = getDesign(G, p.id, it.did); return x && x.type === 'colony'; }))) return 0;
  const have = (s.queue || []).filter(it => it.did === d.id).reduce((a, it) => a + it.n, 0);
  const add = n - have;
  if (add <= 0 || !queueShips(G, p.id, sid, d.id, add)) return 0;
  A.shipLeft -= c.money + (add - 1) * designCost(G, d).money;
  return add;
}
// colony ships already on their way, or on order (the 5.0.5 logic built and
// sent a ship in the same turn; here an idle one at a colony still needs sending)
function aiColonyShipsBusy(G, p) {
  let n = 0;
  for (const f of G.fleets) if (f.owner === p.id && fleetDesigns(G, f).some(d => d.type === 'colony') && (f.to != null || f.dest != null || (f.star != null && G.stars[f.star].owner !== p.id))) n++;
  for (const s of colonies(G, p.id)) for (const it of s.queue || []) { const d = getDesign(G, p.id, it.did); if (d && d.type === 'colony') n += it.n; }
  return n;
}
// the computers' decisions as shares of the pool: each losing colony's loss
// first, then research, terraforming and mining, then what the queues need
// (above the computer's reserve); the rest is kept (INFERRED: 2.0's own split,
// FUN_1020_35f9, wasn't decoded)
function aiBudget(G, p, M, A) {
  const b = p.budget, cols = colonies(G, p.id), M0 = Math.max(0, p.savings);
  b.col = {};
  if (M0 <= 0) { b.tech = 0; b.savings = 1; for (const s of cols) b.col[s.id] = 0; return; }
  let used = M.tech, shipWant = 0;
  const need = {};
  for (const s of cols) {
    const sup = Math.max(0, -(s.oInc || 0)), t = M.terra[s.id] || 0, m = M.mine[s.id] || 0;
    let sh = 0;
    for (const it of s.queue || []) { const d = getDesign(G, p.id, it.did); if (d && !d.scrapped) sh += shipCostNow(G, p, d).money + (it.n - 1) * designCost(G, d).money; }
    sh = Math.max(0, sh - (s.yardDid != null ? s.yard || 0 : 0));
    need[s.id] = { sup, t, m, sh }; used += sup + t + m; shipWant += sh;
  }
  const room = Math.max(0, M0 - used - A.reserve), k = shipWant > room ? room / Math.max(1, shipWant) : 1;
  let tot = M.tech;
  for (const s of cols) {
    const x = need[s.id], sh = trunc(x.sh * k), spend = x.t + x.m + sh;
    b.col[s.id] = (x.sup + spend + (x.sup ? 2 : 0)) / M0; tot += x.sup + spend;
    if (spend > 0) { s.ship = sh / spend; if (x.t + x.m > 0) s.terra = x.t / (x.t + x.m); }
    else s.ship = 0;
  }
  if (tot > M0) { const f = M0 / tot; for (const k2 in b.col) b.col[k2] *= f; b.tech = M.tech / M0 * f; b.savings = 0; }
  else { b.tech = M.tech / M0; b.savings = Math.max(0, M0 - tot) / M0; }
}

E.registerRules('dos', Object.assign({}, O, {
  label: 'DOS 2.0 (1993)',
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '2.0', platform: 'DOS and Windows 3.1', year: 1993,
  ai: 'original',
  maxDesigns: 20,                         // CONFIRMED (10e8:1538, box3280; the computers too, FUN_1020_4019)
  queueSlots: QUEUE_SLOTS,                // CONFIRMED (FUN_1040_1479): three (design, count) slots per colony
  plainTechMessages: true,                // "Your Range Technology has reached level N."
  battleEverywhere: true,                 // CONFIRMED (FUN_1040_23ed, 0aea): every fleet and colony marks its star
  features: { arrivalNotices: true, waypoints: true, chat: true, buildQueue: true, singleTypeFleets: true, skills: true, noRadical: true },
  canBuild: (G, p, type) => TYPES4.includes(type),
  starNames: STAR_NAMES,
  SKILLS, WPNRAT, setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance, SHAPES,
  designCost, designLimits, designMin, aiSpec, paysPrototype, fleetFor, route,
  borrowLimit: () => 0,                   // CONFIRMED: no borrowing in 2.0 (money is clamped at 0)
  disposable, projected, underfunded, economy, afterMovement, settle, battle, randomEvents, fleetArrives: null,
  planetIncome, incomeU, research, yardProgress, yardRefund,
  aiPersonality, aiTurnStart, aiMineMoney, aiTerraMoney, aiBuild, aiBudget, aiColonyShipsBusy,
  // not in 2.0 (CONFIRMED: no text or code for them)
  difficulty: undefined, masterPoints: undefined,
}));
})(this);
