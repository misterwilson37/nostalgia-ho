// Spaceward Ho! web remake — the "DOS 2.0" ruleset.
//
// Spaceward Ho! 2.0 for DOS (1993, ported by Presage for New World
// Computing) is the same game as Spaceward Ho! 2.0 for Windows 3.1
// (WINHO.EXE, 1992), and the Windows program was decompiled to write these
// rules. It is an earlier build of the engine behind the Mac 5.0.5 game, so
// this ruleset is built over the "Original" (5.0.5) one, but every rule it
// still takes from there was checked against 2.0's code (docs/dos-findings.md,
// "Inherited rules audit"); the rest are replaced here. Its computer players
// are 2.0's own, the same as Mac 1.2's (js/ai-12.js).
//
// Labels: CONFIRMED (seg:off) = read from that WINHO.EXE function;
// GUESS = not settled by the decompile (the remake's choice).
// docs/dos-findings.md explains each rule in plain English, and
// docs/coverage-20.md lists every routine of WINHO.EXE. The turn itself is
// in the "2.0's turn, routine by routine" section near the end.
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
  p.colOrder = [home.id]; // the colony budget slots, newest first (colOrder)
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
// 100 x cos/sin of each degree. CONFIRMED: WINHO.EXE's RCDATA "COSINES" and
// "SINES" (loaded by FUN_1118_0583 into 0x5d54 / 0x5d58, read by the shape
// routines) are 100 x cos / sin truncated, except for six entries, set below.
// Mac 1.2 has the very same two tables in its resource fork.
const COS = [], SIN = [];
for (let a = 0; a < 360; a++) { COS.push(trunc(100 * Math.cos(a * Math.PI / 180))); SIN.push(trunc(100 * Math.sin(a * Math.PI / 180))); }
COS[180] = -99; COS[300] = 49;
SIN[90] = 99; SIN[150] = 50; SIN[210] = -49; SIN[270] = -99;
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
// prototype 2*mm*price-before-extra, metal B/(3 mm), hit points B/3, and
// the computers' attack rating (attack, below).
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
  return { money, metal, proto: Math.max(0, protoTotal - money), protoTotal, hp: Math.max(1, hp), att: attack(hp, W, E.fixed(G, 'attack16')) };
}
// CONFIRMED (FUN_10f0_05e9 @10f0:079d-0851): the attack rating the computer
// players use (design field +0x18) is the larger of (hp / 50) x W^2 and
// W^2 x WPNRAT(W) x (5W + 20) / 300, not divided by 50. The second term is
// worked out in 16-bit registers: W^2 x WPNRAT keeps its low 16 bits, the
// product with (5W + 20) is cut back to a signed 16-bit number (CWD) before
// the division, so from about Weapons 4 it wraps round and the first term
// wins. (Mac 1.2 does it in 32 bits; js/rules-12.js keeps that. So does
// Mac 2.0.1, CalcShipCosts @114c9a-114d1a: a difference of the Windows
// build, whose ints are 16 bits.)
// The patch (fix 'attack16'): the second term in 32 bits, as Mac 1.2 and
// 3.0.1 work it out, so it no longer wraps.
const i16 = (x) => ((x & 0xffff) ^ 0x8000) - 0x8000;
function attack(hp, W, fix) {
  const a = trunc(hp / 50) * W * W;
  const b = fix ? trunc(W * W * wpn(W + 25) * (5 * W + 20) / 300) : trunc(i16(i16(i16(W * W) * wpn(W + 25)) * (5 * W + 20)) / 300);
  return Math.max(a, b);
}
const shipPower = (G, d) => d ? designCost(G, d).att : 0;
// a planet's strength as the computers reckon it, ((pop + 49) / 50) x
// (W + 1)^2 / 125 (CONFIRMED: FUN_1018_260b, FUN_1020_1c73, FUN_1040_3a2b)
const planetPower = (pop, W) => trunc(trunc((pop + 49) / 50) * (W + 1) * (W + 1) / 125);
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
// distance. (Planned again at every stop: replan20, for 2.0 and 1.2.)
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

// CONFIRMED (FUN_1040_1479): each colony builds its queue (three slots of
// design and count) from its Ship share. A ship is built when its price and
// metal are both there; what can't finish part-pays the first ship (money and
// a matching part of its metal, set aside), and any other money left goes
// back into the pool. Computer players use the same queues.
const QUEUE_SLOTS = 3;
function shipyard(G, p, s, M, shipMoney) { // shipMoney: 2.0's per-mille share of M (shipyard20); else M x the fraction
  const q = s.queue || (s.queue = []);
  // CONFIRMED (FUN_1040_0fca @1040:1225-1321; 1.2's ScrapFleetsAndTypes
  // @a0e02): a scrapped ship type leaves every queue; if it was first in
  // line, what was paid toward it (money and metal) is lost
  for (let i = q.length - 1; i >= 0; i--) {
    const d = getDesign(G, p.id, q[i].did);
    if (d && !d.scrapped) continue;
    if (i === 0) { s.yard = 0; s.yardMetal = 0; }
    q.splice(i, 1);
  }
  const ship = clamp(s.ship || 0, 0, 1);
  if ((M < 500 || ship <= 0) && q.length) msg(G, p.id, `You have ships queued at ${s.name} but have no money allocated for shipbuilding.`, { icon: 'm9020', star: s.id, quiet: true });
  if (M <= 0 || ship <= 0) return;
  let S = (shipMoney != null ? shipMoney : trunc(M * ship)) + (s.yard || 0);
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
// (No longer used: 2.0 and Mac 1.2 both use pass2_20 below.)
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
  (p.colOrder || (p.colOrder = [])).unshift(s.id); // its slot goes in front (colOrder)
}

// ---------- battles (FUN_1018_0032, 1340, 14f7, 0976, 172a, 1e98, 260b) ----------
// CONFIRMED: the colony's owner holds the star; the others, in random order,
// fight the holder one at a time and the winner holds the star.
// hooks.duel: called after each duel (2.0's and 1.2's reports and debris,
// battle20). With it, each duel is a replay of its own, as 2.0 and 1.2 kept
// them: CONFIRMED (FUN_1018_0032 writes each duel's battle record to the
// game file, FUN_1050_2bf3 @1018:0720, right after the duel, FUN_1018_0976
// @1018:06a9, and before its reports, FUN_1018_260b @1018:0732; 1.2's DoBattleStage @d0004 makes a 'bTTl'
// resource for each duel, AddResource @d0738, before MakeResultMessages
// @d0768). Each
// record holds the two sides' ships at the star as the duel began, and the
// planet when the holder owns it; it gets duel: 0, 1, … and its id is
// passed to hooks.duel (bid) for that duel's reports.
function battle(G, sid, hooks) {
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0);
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const owners = new Set(present.map(f => f.owner)); if (planetOwner >= 0) owners.add(planetOwner);
  const ownerIds = [...owners];
  if (!ownerIds.some(a => ownerIds.some(b => !isAllied(G, a, b)))) return null;
  const startPop = s.pop;
  const perDuel = !!(hooks && hooks.duel);
  // every ship at the star (rec.start); without hooks.duel this is the one replay
  const rec = { id: perDuel ? null : G.nextId++, star: sid, year: G.year + 10, sides: ownerIds, rounds: [], start: [], planetOwner, pop0: s.pop, popR: [] };
  let nDuel = 0, lastRec = null;
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
  let debris = 0, lastRounds = 0;
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
    // the duel's own replay: its ships numbered afresh (map: star-wide number -> the duel's)
    let R = rec, map = null;
    if (perDuel) {
      const po = planet && D === planetOwner && planet.hp > 0 ? planetOwner : -1;
      R = { id: G.nextId++, star: sid, year: G.year + 10, duel: nDuel++, sides: [A, D], rounds: [], start: [], planetOwner: po, pop0: po >= 0 ? planet.hp / 1000 : s.pop, popR: [] };
      map = new Map();
      for (const o of [A, D]) for (const e of army[o]) for (const i of e.alive.slice(0, e.n)) { map.set(i, R.start.length); R.start.push(rec.start[i]); }
      R.n0 = { [A]: R.start.filter(u => u.o === A).length, [D]: R.start.filter(u => u.o === D).length };
    }
    const id = (i) => map && i >= 0 ? map.get(i) : i;
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
    lastRounds = 0;
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
              if (ev.length < 80) ev.push({ a: u.o, si: id(si), p: 1 });
            } else {
              t.dmg += Math.max(1, trunc(base / 6));
              let k2 = 0, ti = t.idx[Math.max(0, t.n - 1)];
              if (t.dmg >= t.hp) { t.dmg = 0; t.n--; debris += t.debris; k2 = 1; } // no carry-over
              if (ev.length < 80) ev.push({ a: u.o, si: id(si), t: t.o, k: k2, ti: id(ti) });
            }
          }
        }
      }
      lastRounds = rounds;
      if (R.rounds.length < 60) { R.rounds.push(ev); R.popR.push(planet ? planet.hp / 1000 : s.pop); }
      const pu = side[1].find(u => u.planet); if (pu) planet.hp = pu.hp;
    }
    const pu = side[1].find(u => u.planet); if (pu) planet.hp = pu.hp;
    for (const k of [0, 1]) {
      const left = new Map();
      for (const u of side[k]) if (!u.planet) { const a = left.get(u.e) || []; left.set(u.e, a.concat(u.idx.slice(0, u.n))); }
      for (const [e, ids] of left) { e.alive = ids; e.n = ids.length; }
    }
    if (perDuel) {
      const alive = new Set(); for (const o of [A, D]) for (const e of army[o]) for (const i of e.alive.slice(0, e.n)) alive.add(map.get(i));
      const left = (o) => army[o].reduce((x, e) => x + e.n, 0);
      R.survivors = { [A]: left(A), [D]: left(D) };
      R.lost = { [A]: R.n0[A] - left(A), [D]: R.n0[D] - left(D) }; delete R.n0;
      R.pop1 = planet ? planet.hp / 1000 : s.pop;
      R.planetDied = R.planetOwner >= 0 && !(planet.hp > 0);
      R.end = R.start.map((_, i) => alive.has(i) ? 1 : 0);
      G.battles.push(R); lastRec = R;
    }
    return up(side[1]) ? D : up(side[0]) ? A : -1;
  };
  const order = ownerIds.filter(o => o !== planetOwner);
  for (let i = 0; i < order.length; i++) { const j = RI(G, 0, order.length - 1); [order[i], order[j]] = [order[j], order[i]]; }
  let holder = planetOwner >= 0 ? planetOwner : order.pop();
  for (const a of order) {
    if (holder < 0 || !standing(holder)) { holder = a; continue; } // both sides died: the next one takes over
    if (isAllied(G, a, holder) || !hasShips(a)) continue;
    const ships = (o) => army[o].reduce((x, e) => x + e.n, 0);
    const pre = hooks && hooks.duel ? { A: a, D: holder, nA: ships(a), nD: ships(holder), pop0: planet && holder === planetOwner && planet.hp > 0 ? planet.hp : 0, d0: debris } : null;
    holder = fight(a, holder);
    if (pre) hooks.duel(Object.assign(pre, { winner: holder, debris: debris - pre.d0, rounds: lastRounds, army, planetOwner, bid: lastRec.id }));
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
    if (planet.hp <= 0) { const q = G.players[planetOwner]; (hooks && hooks.lose ? hooks.lose : removeColony)(G, q, s); planetDied = true; }
    else setPopU(s, planet.hp);
  }
  // FUN_1018_260b: the metal of every ship destroyed (a fifth each) goes to
  // a winning colony owner, or falls on the star (told to the winner only)
  if (debris > 0 && !(hooks && hooks.duel)) {
    if (holder >= 0 && s.owner === holder) { G.players[holder].metal += debris; msg(G, holder, `You have recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); }
    else { s.metal += debris; if (holder >= 0) msg(G, holder, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); }
  }
  if (!perDuel) {
    const alive = new Set(); for (const o of ownerIds) for (const e of army[o]) for (const i of e.alive.slice(0, e.n)) alive.add(i);
    rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = rec.start.map((_, i) => alive.has(i) ? 1 : 0);
    G.battles.push(rec);
  }
  G.stat.battles++; if (planetDied) G.stat.captures++;
  // the engine's record of the battle: the one replay, or (one a duel) the last duel's
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec: perDuel ? lastRec : rec };
}

// ---------- what a player learns from a battle (FUN_1018_260b) ----------
// CONFIRMED (FUN_1018_260b, Mac 1.2's MakeResultMessages @d2828, the same
// routine): each player's knowledge of a star holds the year of the last
// battle seen there and four strength estimates the computer players use
// (knowledge record +0x16, +0x1a, +0x1e, +0x22, and +0x2a the planet's
// population):
//   e16: the enemy force to beat there; e1a: what it shows to stars within
//   10 ly; e1e: the threat to your own colony; e22: what it shows to your
//   colonies within reach; pop: the planet's population.
// The strengths are the computers' attack ratings (rs.shipPower).
function x12(G, p, sid) { const k = E.know(G, p, sid); return k.x12 || (k.x12 = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0, pop: 0 }); }

// ---------- the end of the turn: refuelling, exploring, colonizing ----------
// (No longer used: 2.0 and Mac 1.2 both use pass2_20 below.)
// CONFIRMED (FUN_1040_2fa8; Mac 1.2's ColonizeAndExplore @a3556 is the same):
// at the end of every turn, for every player, each fleet at one of its
// colonies is refuelled and its colony ships take on colonists; then every
// fleet at a star looks at it again (FUN_1040_34e9) and, if the star isn't
// the player's and the fleet carries colonists, founds a colony there
// (FUN_1040_3645). So a colony ship founds a colony at the end of any turn it
// sits at a free star with colonists aboard, not only when it arrives (the
// engine's colonizing on arrival is turned off with canColonize). Battles are
// fought to the end before this, so a star with your fleet left is never
// someone else's colony.
function refuel(G) {
  const rs = E.rules(G);
  for (const p of G.players) {
    const mine = G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null && fleetCount(f) > 0);
    for (const f of mine) {
      if (G.stars[f.star].owner !== p.id) continue;
      f.fuel = fleetMaxRange(G, f);
      let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
      f.colonists = c * 10;
    }
    for (const f of mine) {
      if (!G.fleets.includes(f)) continue;
      const s = G.stars[f.star];
      observe(G, p, s.id);
      if (s.owner < 0 && (f.colonists || 0) > 0 && fleetDesigns(G, f).some(d => d.type === 'colony')) {
        G.stat.colonized++;
        rs.settle(G, p, s, f);
        observe(G, p, s.id);
        msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
      }
    }
  }
}
// CONFIRMED (FUN_10c0_0c50 -> FUN_1020_1a2d): the exploring sound goes by the
// star's quality 0..20: 6000 at 15 or more, 6002 from 1 to 14, 6001 at 0. The
// quality is 0 when the gravity ratio is over 2.56, else
// (max(23, 100 - g(g+1)) x max(40, 100 - t(t+1))) / 527 + 2 with g = ratio/10 -
// 10 and t = temperature gap / 33 °F, +1 (to 20 at most) for more than 10,000
// metal. (5.0.5 also gives 0 when the ratio is over 2 and the gap over 50 °F.)
function starQuality(p, s) {
  const { gR, dT } = hab(p, s);
  let q = 0;
  if (gR <= 256) {
    const gi = trunc(gR / 10) - 10, ti = trunc(dT / 330);
    q = trunc(Math.max(23, 100 - gi * (gi + 1)) * Math.max(40, 100 - ti * (ti + 1)) / 527) + 2;
  }
  if (s.metal > 10000) q = Math.min(20, q + 1);
  return q;
}
function exploreQuality(G, p, s) { const q = starQuality(p, s); return q >= 15 ? 'good' : q > 0 ? 'mediocre' : 'bad'; }
// CONFIRMED (FUN_1040_31c3): 2.0 sorts planets by one line only, gravity more
// than 2.56 times home's (or under 1/2.56): such a planet never pays. There is
// no "barely habitable" band as in 5.0.5.
function planetClass(G, gs) { return gs > 2.56 || gs < 1 / 2.56 ? 'inhospitable' : 'good'; }

// ---------- the end of the game (FUN_1040_3bd4, FUN_1040_3fa6, FUN_1050_09e3) ----------
// CONFIRMED: at the end of each turn a player with no colonies (budget slots
// only for Savings and Technology) is marked as dying (state 5), colony ships
// or not, and every player is told "%s has just been eliminated from the
// game." (strings 726-727, FUN_1050_09e3); if they still have none at the end
// of the next turn they are out for good, and a colony founded in between
// brings them back (state 1) (FUN_1040_3bd4). From 2010 on, with more than one
// player, the only player who is neither out nor dying wins (FUN_1040_3fa6;
// strings 728-729). Nothing removes an out player's fleets: they still fight,
// and a computer's still move (FUN_1040_0038 runs the computer turn for every
// computer slot, @1040:02bb).
function checkElimination(G) {
  const humans = E.humans(G);
  for (const p of G.players) {
    if (!p.alive) { if (!G.over && colonies(G, p.id).length) { p.alive = true; p.dying = false; } continue; }
    if (colonies(G, p.id).length) { p.dying = false; continue; }
    if (!p.dying) {
      p.dying = true;
      for (const q of humans) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    } else { p.alive = false; p.dying = false; }
  }
  if (!G.over && G.year + 10 > 2009 && G.players.length > 1) {
    const standing = G.players.filter(p => p.alive && !p.dying);
    if (standing.length === 1) {
      G.over = true; G.winner = standing[0].id;
      for (const q of humans) {
        if (q.id === G.winner) msg(G, q.id, 'Congratulations! You have just won the game.', { icon: 'p3030', sound: 7021, big: 'p3030' });
        else msg(G, q.id, `${G.players[G.winner].name} has just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
      }
    }
  }
  // GUESS (the remake's): every human is out, so the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
  for (const q of humans) { sync20(G, q); flushExplores20(G, q); } // the turn's last reports (log20)
}

// ---------- colony order (FUN_1040_3645) ----------
// CONFIRMED (FUN_1040_3645 @1040:3705; Mac 1.2's ColonizeStar @a3d84, its
// BlockMove @a3e3c): a new colony's budget slot is put in front of all the
// others, which move up one. The computer players go through the slots in
// that order, so the newest colony comes first and the home planet last.
function colOrder(G, p) {
  const own = (p.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  for (const s of colonies(G, p.id)) if (!own.includes(s.id)) own.push(s.id);
  return own;
}

// ---------- names (FUN_1040_4028, FUN_1020_4711, FUN_1050_1ec9) ----------
// CONFIRMED (FUN_1040_4028): computers are named at random, without repeats
// and never with a human's name, from string ids 112-131 (men) or 224-243
// (women). (2.0 also adds the humans' names to a names file on disk and
// draws from it; that file isn't kept.)
const MALE_NAMES = ['Alex', 'Bert', 'Carl', 'John', 'Ed', 'Frank', 'Gary', 'Howard', 'Bob', 'Joe', 'Kirk', 'Larry', 'Paul', 'Nick', 'Dave', 'Peter', 'Ralph', 'Sam', 'Tim', 'Walter'];
const FEMALE_NAMES = ['Andrea', 'Beth', 'Christie', 'Mary', 'Leslie', 'Laura', 'Natalie', 'Heather', 'Imelda', 'Jennifer', 'Kathy', 'Louise', 'Melissa', 'Nancy', 'Elizabeth', 'Patricia', 'Sue', 'Barbara', 'Wendy', 'Anne'];
// CONFIRMED (FUN_1050_1ec9 @1050:1fd5): a computer is a woman half the time
// (gender = random(0, 1) x 500)
const FEMALE_COMPUTERS = 0.5;
// CONFIRMED (FUN_1020_4711, with the tables at DS:0x242 = string ids 336,
// 304, 288, 256 and DS:0x24a = 14, 23, 15, 18 names): a new design, the
// computers' and the starting ones, is named from its class's list
const SHIP_NAMES = {
  scout: ['Needle', 'Explorer', 'Looker', 'Columbus', 'Magellan', 'Intrepid', 'Wanderer', 'Rudolph', 'Eagle', 'Sparrow', 'Ranger', 'Whisper', 'Weasel', 'Enterprise'],
  fighter: ['Killer', 'Destroyer', 'Demon', 'Hurricane', 'Typhoon', 'Slasher', 'Patton', 'Stingray', 'Blaster', 'Conan', 'Serpent', 'Dragon', 'Tornado', 'Wraith', 'Storm', 'Dagger', 'Sword', 'Lance', 'Arrow', 'Constitution', 'Reliant', 'Panther', 'Nightmare'],
  colony: ['Spreader', 'Mother', 'Expander', 'Nina', 'Pinta', 'Santa Maria', 'Stork', 'Freedom', 'Kon Tiki', 'Minnow', 'Taurus', 'Minerva', 'Egg', 'Peaceful', 'Hardy'],
  satellite: ['Defender', 'Stopper', 'Protector', 'Eye', 'Armor', 'Shield', 'Peach', 'Caltrop', 'Washington', 'Gabriel', 'Sun Dog', 'Mercy', 'Vision', 'Apple', 'Pebble', 'Rock', 'Stone', 'Berry'],
};
// CONFIRMED (FUN_1020_4711; 1.2's and Mac 2.0.1's GiveTypeCoolName @9457e):
// up to 100 tries at a random name from the class's list that no design has;
// after 100 tries the last one is kept. (Players can rename designs.) 2.0's
// list also holds the names humans gave their own designs, kept in the names
// file by FUN_10e8_0f64 (Mac AddNewTypeNameToPrefs); the remake keeps no
// names file, so it is the built-in list.
function designName(G, p, type) {
  const names = (E.rules(G).shipNames || SHIP_NAMES)[type] || ['Ship'];
  const used = new Set(p.designs.filter(d => !d.scrapped).map(d => d.name));
  let n = names[0];
  for (let i = 0; i < 100; i++) { n = names[RI(G, 1, names.length) - 1]; if (!used.has(n)) break; }
  return n;
}

// ---------- messages ----------
// CONFIRMED (FUN_1030_1299 @1030:14c9): every player's message list starts
// with reports 1000 and 1001, strings 672-673 (FUN_10c0_0b3b gives them the
// credit pictures 3115 and 3116)
const WELCOME = [
  ['Spaceward Ho! Version 2.0.1 by Peter Commons.', { icon: 'm9004', sound: 11111 }],
  ['Artwork by Howard Vives.', { icon: 'm9024' }],
];

// =====================================================================
// 2.0's turn, routine by routine (WINHO.EXE, read in docs/coverage-20.md).
// 1.2 (js/rules-12.js) has the same routines, read in its own code, and
// plays this turn too (docs/12-findings.md).
// =====================================================================

// ---------- shares, per mille (every pass-1 and pass-2 routine) ----------
// CONFIRMED (FUN_1040_0925 @1040:0960-09fe, 0aea @0b4f-0b8e and @0c3b-0c87,
// 1479 @15f5-164a, 1b11 @1b9f-1bdb, 27ee @2869-28d3): a share of an amount
// is worked out as trunc(M x pm / 1000) while M is under $2,000,000, and
// as trunc(M / 1000) x pm above. Nothing divides by the total of the bars:
// the shares are used as they stand (the computers' add up to a little
// more than 1,000, FUN_1020_35f9 rounds each one up).
const share20 = (M, pm) => !(pm > 0) ? 0 : M < 2000000 ? trunc(M * pm / 1000) : trunc(M / 1000) * pm;
const pmOf = (x) => Math.round((x || 0) * 1000);
const keyPm = (p, k) => pmOf(k === 'sav' ? p.budget.savings : k === 'tech' ? p.budget.tech : p.budget.col[k]);
const setKeyPm = (p, k, v) => { const f = v / 1000; if (k === 'sav') p.budget.savings = f; else if (k === 'tech') p.budget.tech = f; else p.budget.col[k] = f; };
// the budget slots in 2.0's order (player +0xec0, 0x30 bytes each): set up
// as Savings, Technology, home (FUN_1030_1299 @1030:19b2-1b32); a new colony's
// slot goes in front (FUN_1040_3645 @1040:3722); a lost one is taken out
// (FUN_1040_38c0). The computers, the budget window and every loop of the
// turn go through them in this order.
function slots20(G, p) {
  if (!p.slots20) {
    const cols = colOrder(G, p), home = cols.length ? cols[cols.length - 1] : null;
    p.slots20 = cols.slice(0, -1).concat(['sav', 'tech']).concat(home != null ? [home] : []);
  }
  for (const s of colonies(G, p.id)) if (!p.slots20.includes(s.id)) p.slots20.unshift(s.id);
  return p.slots20;
}
const colIds20 = (G, p) => slots20(G, p).filter(k => typeof k === 'number' && G.stars[k].owner === p.id);
const colOrder20 = (G, p) => colIds20(G, p);
function shareOf20(G, p) {
  const M0 = Math.max(0, p.savings);
  return (k) => share20(M0, keyPm(p, k));
}
// a colony's money: its share, less its loss if it loses money
function colonyMoney20(G, p, s, share) {
  const inc = s.oInc || 0;
  return share(s.id) + (inc < 0 ? inc : 0);
}

// ---------- a colony's bars: terraform, mine, ships, per mille ----------
// CONFIRMED (FUN_1040_0aea, FUN_1040_269d, FUN_1010_04a7): each colony has
// three bars; a finished part is set to -1 and stays -1: no routine sets it
// back, the planet window won't let it be dragged (FUN_1010_04a7 beeps on a
// bar below 0) and the computers leave it alone (FUN_1020_35f9 @1020:385b).
// The remake keeps them as s.bars = [T, X, S]; s.terra and s.ship (the
// panel's sliders) are kept in step, and a change there is read back.
function setBars20(s, T, X, S) {
  s.bars = [T, X, S];
  s.ship = clamp(S, 0, 1000) / 1000;
  const t = Math.max(0, T), x = Math.max(0, X);
  if (t + x > 0) s.terra = t / (t + x);
  else if (T === -1 && X !== -1) s.terra = 0;
  else if (X === -1 && T !== -1) s.terra = 1;
  s._bsig = s.terra + '|' + s.ship;
  return s.bars;
}
function bars20(s) {
  if (s.bars && s._bsig === s.terra + '|' + s.ship) return s.bars;
  // moved on the planet panel: the other bars share what the moved one
  // leaves, as 2.0's drag does (FUN_1010_060a); a finished part stays -1
  const td = !!s.bars && s.bars[0] === -1, xd = !!s.bars && s.bars[1] === -1;
  let S = clamp(Math.round((s.ship || 0) * 1000), 0, 1000), T, X;
  const rest = 1000 - S, tf = s.terra == null ? 0.5 : s.terra;
  if (td && xd) { T = -1; X = -1; S = 1000; }
  else if (td) { T = -1; X = rest; }
  else if (xd) { X = -1; T = rest; }
  else { T = Math.round(rest * tf); X = rest - T; }
  return setBars20(s, T, X, S);
}
// the colony's class (slot +0x12): 0 paying, 1 losing, 2 losing with a
// gravity ratio over 2.56 (FUN_1040_27ee @1040:2f55-2f96, FUN_1040_3645)
const cls20 = (p, s) => s.cls20 != null ? s.cls20 : (s.oInc || 0) >= 0 ? 0 : hab(p, s).gR > 256 ? 2 : 1;

// ---------- pass 1 (FUN_1040_0038 @1040:02de-038b) ----------
// For each player in turn: the computer plans (FUN_1020_0000), then
// scrapping (FUN_1040_0fca: the remake scraps when you give the order), the
// losing colonies (0925), terraforming and mining (0aea), shipbuilding
// (1479), research (1b11), the fleets move (23ed, with every route checked
// first, 25ce) and the bars are restored (269d). Every loop goes through the
// budget slots in order. 2.0 runs this for every player, out or not
// (economyForAll).
function economy20(G, p) {
  // CONFIRMED (FUN_1040_0038 @1040:02af): report 1010 to every player
  if (p.human) msg(G, p.id, `The game has been updated to the year ${G.year + 10}.`, { icon: 'm9024', sound: 2000, quiet: true });
  sync20(G, p); flushScraps20(G, p); // report-list bookkeeping (log20), for the meteor report's name
  const share = shareOf20(G, p);
  p.oRefund = 0;
  // CONFIRMED (FUN_1040_0925 @1040:0925-0ae9): a losing colony whose share
  // won't cover its loss loses people, pop x share / loss - 100; with none
  // left it is abandoned (FUN_1040_38c0). The "no growth" flag is cleared.
  for (const sid of colIds20(G, p)) {
    const s = G.stars[sid];
    s.oStarve = false;
    const inc = s.oInc || 0, sh = share(sid);
    if (inc >= 0 || sh + inc >= 0) continue;
    const u = Math.max(0, trunc(popU(s) * sh / -inc) - 100);
    setPopU(s, u);
    if (u === 0) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9036', star: s.id }); removeColony20(G, p, s); }
    else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', sound: 3002, star: s.id }); }
  }
  for (const sid of colIds20(G, p)) terraMine20(G, p, G.stars[sid], colonyMoney20(G, p, G.stars[sid], share));
  // CONFIRMED (FUN_1040_1479 @1040:15db-164a): the Ship bar's share of the colony's money
  for (const sid of colIds20(G, p)) {
    const s = G.stars[sid], M = colonyMoney20(G, p, s, share), B = bars20(s);
    shipyard(G, p, s, M, M > 0 && B[2] > 0 ? share20(M, B[2]) : 0);
  }
  // CONFIRMED (FUN_1040_1b11): research from the Technology slot's share
  const T = share('tech');
  if (T <= 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011', quiet: true }); // every turn
  research20(G, p, T);
  replan20(G, p); // FUN_1040_23ed -> FUN_1040_25ce, before the fleets leave
  for (const sid of colIds20(G, p)) restoreBars20(G, p, G.stars[sid]);
}
// CONFIRMED (FUN_1040_0aea @1040:0aea-0fc9; 1.2's TerraformMineStars @a0a9e
// is the same): a bar above 0 is spent, whether the planet still needs it
// or not (a planet already at your temperature is "completely terraformed"
// again and its money refunded):
// - terraforming: warns when more than $50 goes into a class-2 colony; the
//   first $5,000 ever goes into the planet; then the temperature moves
//   isqrt(money / 2) tenths of a degree toward yours; a step bigger than
//   the gap sets it to yours, refunds 2 x (step - gap)^2 and sets the bar to -1;
// - mining: 15 x isqrt(money) metal; more than the planet has (not equal)
//   takes what is left, refunds ((excess^2 + 224) / 225) and sets the bar to -1;
//   "You should probably abandon it" when the gravity ratio is over 2.56.
function terraMine20(G, p, s, M) {
  if (M <= 0) return;
  let [T, X, S] = bars20(s);
  const h = hab(p, s);
  if (T > 0) {
    let t = share20(M, T);
    if (t > 50 && cls20(p, s) === 2) msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id });
    s.oSink = s.oSink || 0;
    if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, t); s.oSink += x; t -= x; }
    const step = isqrt(trunc(t / 2)), gap = h.dT;
    if (step > gap) {
      p.oRefund += 2 * (step - gap) * (step - gap);
      s.t = p.homeT; T = -1;
      msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
    } else s.t += (s.t < p.homeT ? 1 : -1) * step / 10;
  }
  if (X > 0) {
    let got = isqrt(share20(M, X)) * 15;
    const have = Math.max(0, Math.floor(s.metal));
    if (got > have) {
      const ex = got - have;
      p.oRefund += trunc((ex * ex + 224) / 225);
      got = have; X = -1;
      msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably abandon it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
    }
    s.metal -= got; p.metal += got;
  }
  setBars20(s, T, X, S);
}
// CONFIRMED (FUN_1040_269d @1040:269d-27ed; 1.2's RestoreStarsBars @a24e2):
// every turn, for every colony, the bars above 0 are scaled up to fill
// 1,000 (each += bar x (1000 - total) / total), so a finished part's share
// goes to the others. With none above 0: both finished -> Ship 1,000;
// mining finished on a class-2 colony -> Ship 1,000, Terraform 0;
// terraforming finished -> Mine 500, Ship 500; otherwise Terraform 500,
// Ship 500.
function restoreBars20(G, p, s) {
  let [T, X, S] = bars20(s);
  const tot = Math.max(0, T) + Math.max(0, X) + Math.max(0, S);
  if (tot === 0) {
    if (T === -1 && X === -1) S = 1000;
    else if (X === -1 && cls20(p, s) === 2) { S = 1000; T = 0; }
    else { if (T === -1) X = 500; else T = 500; S = 500; }
  } else {
    if (T > 0) T += trunc(T * (1000 - tot) / tot);
    if (X > 0) X += trunc(X * (1000 - tot) / tot);
    if (S > 0) S += trunc(S * (1000 - tot) / tot);
  }
  setBars20(s, T, X, S);
}
// CONFIRMED (FUN_1040_1b11): as research() but each technology's money is
// its per-mille share of the Technology money
function research20(G, p, T) {
  let tot = 0; for (const k of TECH5) tot += p.talloc[k] || 0;
  for (const k of TECH5) {
    const pm = tot === 1000 ? (p.talloc[k] || 0) : tot > 0 ? Math.round((p.talloc[k] || 0) * 1000 / tot) : 0;
    const X = share20(T, pm);
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

// ---------- routes (FUN_1040_25ce, FUN_1068_03a9, FUN_1068_0a94) ----------
// CONFIRMED (FUN_1040_25ce, called for every fleet before it moves by
// FUN_1040_23ed @1040:2454 and after the end-of-turn refuelling by
// FUN_1040_2fa8 @1040:310f; 1.2's CheckFleetDestination @a23d2): a fleet at a
// star whose next stop isn't its destination has its route planned again
// from where it is (FUN_1068_03a9 with the Range of its design); with no
// route it stops there: "Your %s can no longer reach %s." (report 1023,
// string 695).
function route20(G, f, tgt) {
  const r = route(G, f, tgt);
  if (r && r.length) f.routeTo = tgt;
  return r;
}
function replan20(G, p) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.routeTo == null) continue;
    const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
    const fin = stops[stops.length - 1];
    if (stops.length < 2 || fin !== f.routeTo) continue;
    const r = route(G, f, fin);
    if (!r || !r.length) {
      msg(G, p.id, `Your ${E.fleetLabel(G, f)} can no longer reach ${G.stars[fin].name}.`, { icon: 'm9038', star: f.star });
      f.dest = null; f.path = null; f.routeTo = null;
    } else { f.dest = null; f.path = r; }
  }
}
// CONFIRMED (FUN_1040_23ed @1040:23ed-24a5; Mac 2.0.1 MoveShips @a20e2, 1.2
// MoveShips @a20ee): a leg's fuel is spent when the fleet arrives, not when it
// leaves. The route routine (FUN_1068_0a94, GiveFleetPath @110d56) keeps the
// leg's length in the fleet (+0xe), and the turn the fleet reaches the star
// adds it to the fuel used (+4) and clears it; in flight the fleet's fuel used
// is still what it was at the last star. (3.0.1, MoveShips @a26ac, and 4.0.5,
// FUN_004357fc and the Mac's MoveShips @c272e, do the same: rules-301, -405.)
// The engine takes the fuel as a fleet leaves (departures), so departs20 gives
// it back and keeps it in f.legFuel, and legFuelArrives takes it on arrival.
// Nothing in the turn or the computers reads the fuel of a fleet in flight, so
// only what a fleet in flight shows as its fuel changes.
function departs20(G, f) {
  const d = starDist(G, f.star, f.dest);
  if (d <= f.fuel + 1e-9) { f.fuel += d; f.legFuel = d; } // within its fuel: it leaves (the engine takes d back)
  return true;
}
function legFuelArrives(f) { if (f.legFuel != null) { f.fuel -= f.legFuel; delete f.legFuel; } }
// CONFIRMED (FUN_1040_23ed @1040:24a5-25a2): the messages are written as the
// fleet moves (pass 1, before any battle), from the player's own record of
// the star: at a stop on a route "… has stopped at %s on the way to %s."
// (1025); at the destination "Your fleet of %s has arrived at %s." (1024)
// only if the record says the star is explored and is the player's colony,
// or nobody's and the fleet is not of Colony Ships.
function fleetArrives20(G, f) {
  legFuelArrives(f);
  const p = G.players[f.owner];
  if (!p || !p.human || f.star == null) return true;
  const s = G.stars[f.star], k = E.know(G, p, s.id), label = E.fleetLabel(G, f);
  if (f.path && f.path.length) msg(G, p.id, E.report(25, label, s.name, G.stars[f.path[0]].name), { icon: 'm9038', star: s.id, quiet: true });
  else if (k.explored) {
    const owner = k.owner == null ? -1 : k.owner;
    if (owner === p.id || (owner < 0 && !fleetDesigns(G, f).some(d => d.type === 'colony')))
      msg(G, p.id, `Your fleet of ${label} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
  }
  return true;
}

// ---------- battles: a pair of reports a duel (FUN_1018_0032, FUN_1018_260b) ----------
// CONFIRMED (FUN_1018_0032 @1018:0032-0772): each duel at a star is a battle
// of its own (its own replay record, FUN_1050_2bf3) and FUN_1018_260b (1.2's
// MakeResultMessages @d2828, the same routine) runs after each one, for the
// attacker (record +0) and then the defender (+2):
// - the attacker: won -> 1033 and the debris falls onto the planet (1052);
//   lost -> 1034;
// - the defender: won -> at its own colony the debris goes to its metal
//   (1051), elsewhere onto the planet (1052); the report is 1035 when it has
//   no ships left there, else 1033; lost -> 1009 when it had no ships there,
//   else 1034, and its colony is gone (star owner -1, @1018:309c);
// - when both sides died the debris is lost;
// - each side's battle estimates (x12) are written as below; a defender
//   computer puts more of its metal into defence.
// The lost colony's slot is taken out in pass 2 (FUN_1040_27ee @1040:29e3).
// CONFIRMED (FUN_10c0_0c50, jump table @10c0:0cc6; 1.2's PlayAnnounceSound
// @130f08): reports 1033-1035 play no sound at all (entries 0x21-0x23 jump
// past the call), 1009 "destroyed your colony" plays 2001. Each report points
// at its own duel's replay (battle: bid) and says whether the player won
// (won: auto play stops on it).
// CONFIRMED (FUN_1018_260b): what each report keeps in its record's spare
// bytes (+8, the first word: see log20 below): 1033 and 1034 your ships lost
// (@1018:2ab8, 2752, 2dfb, 3137), 1035 and 1009 the attacker's player number
// (@1018:3174, 2dd0); 1051 and 1052 nothing (@1018:2b12, 31ce, 3229).
function battle20(G, sid) {
  const s = G.stars[sid], year = G.year + 10, rs = E.rules(G);
  const name = (o) => G.players[o].name;
  const power = (army, o, t) => (army[o] || []).reduce((a, e) => a + (t == null || e.d.type === t ? e.n * rs.shipPower(G, e.d) : 0), 0);
  const duel = (x) => {
    const { A, D: Df, winner: w, army, rounds, pop0 } = x;
    const surv = (o) => (army[o] || []).reduce((a, e) => a + e.n, 0);
    const W = pop0 > 0 ? G.players[Df].tech.weapons : 0, pp = pop0 > 0 ? planetPower(pop0, W) : 0;
    let debris = x.debris;
    { // the attacker
      const k = x12(G, G.players[A], sid); k.by = year;
      if (w === A) {
        msg(G, A, `You won a battle at ${s.name}. You lost ${x.nA - surv(A)} of your ships. ${name(Df)} lost ${x.nD}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
        if (debris) { msg(G, A, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; }
        k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
      } else {
        msg(G, A, `You lost a battle at ${s.name}. You lost ${x.nA} of your ships. ${name(Df)} lost ${x.nD - (w === Df ? surv(Df) : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false });
        const ws = w === Df ? Df : -1, fs = ws < 0 ? 0 : power(army, ws, 'fighter') + power(army, ws, 'scout');
        k.pop = pop0;
        k.e16 = (ws < 0 ? 0 : power(army, ws)) + pp + 1;
        if (RI(G, 1, 2) === 1 && pop0 > 0) k.e16 -= fs - 1;
        k.e1a = RI(G, 1, 2) === 1 ? 0 : (ws < 0 ? 0 : power(army, ws, 'satellite')) + pp;
        k.e1e = 0; k.e22 = fs;
      }
    }
    { // the defender
      const q = G.players[Df], k = x12(G, q, sid); k.by = year;
      if (pop0 > 0 && q.ai && q.ai.v12) {
        if (w !== Df && q.ai.metalDef < 70) q.ai.metalDef = 70;
        if (q.ai.metalDef < 40) q.ai.metalDef = 40;
        q.ai.metalDef = Math.min(q.ai.metalDef + 10, q.ai.colDef);
      }
      k.pop = 0;
      const colony = s.owner === Df;
      if (w === Df) {
        if (surv(Df) < 1) msg(G, Df, `${s.name} successfully defended itself against an enemy attack from ${name(A)}.`, { star: sid, battle: x.bid, won: true });
        else msg(G, Df, `You won a battle at ${s.name}. You lost ${x.nD - surv(Df)} of your ships. ${name(A)} lost ${x.nA}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
        if (colony) { q.metal += debris; msg(G, Df, `You have recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true }); debris = 0; }
        else if (debris) { msg(G, Df, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; }
        k.e16 = 0; k.e1a = 0; k.e22 = 0;
        if (pop0 < 1) k.e1e = 0;
        else {
          const all = power(army, Df), r = RI(G, 1, 5);
          if (r < 3 && rounds > 1) k.e1e = all - power(army, Df, 'fighter');
          else if (r < 5) k.e1e = trunc(all / 10);
        }
      } else {
        if (x.nD === 0) msg(G, Df, `${name(A)} destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 2001, star: sid, battle: x.bid, won: false });
        else msg(G, Df, `You lost a battle at ${s.name}. You lost ${x.nD} of your ships. ${name(A)} lost ${x.nA - (w === A ? surv(A) : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false });
        const ws = w === A ? A : -1, all = ws < 0 ? 0 : power(army, ws);
        k.e16 = all + 1;
        if (pop0 < 1) {
          k.e1a = RI(G, 1, 2) === 1 ? 0 : (ws < 0 ? 0 : power(army, ws, 'satellite'));
          k.e1e = 0; k.e22 = ws < 0 ? 0 : power(army, ws, 'fighter') + power(army, ws, 'scout');
        } else {
          k.e1a = RI(G, 1, 2) === 1 ? 0 : all;
          k.e1e = 0; k.e22 = all;
        }
      }
    }
  };
  // a colony lost in a duel: the star is nobody's at once; its slot goes in pass 2
  const lose = (G2, q, st) => { st.owner = -1; st.pop = 0; st.queue = []; st.yard = 0; st.yardMetal = 0; };
  const res = battle(G, sid, { duel, lose });
  if (res) res.reported = true;
  return res;
}

// ---------- each player's report list, and the meteor report's stale name ----------
// CONFIRMED (FUN_10c0_0e20 @10c0:0e20-0ec7): every report is a 0x31-byte
// record in the player's record (+0x4d4, count at +0x4d2): the code (+0),
// a word (+2), two more (+4, +6) and 0x29 spare bytes (+8) copied only when
// the caller passes them. The list is never cleared (this turn's reports are
// found from its "updated to the year" report, FUN_10c0_14bd); it starts with
// the two credits (FUN_1030_1299 @1030:14c2-14d0, count 2) in a record
// allocated zeroed (FUN_10c8_04f9: GlobalAlloc flags 0x42). When a report
// arrives with 50 in the list, the count drops to 40 and records 10-49 move
// down to 0-39 (@10c0:0e31-0e5e); records 40-49 keep their bytes. So the
// k-th report a player gets (k = 1, 2, …, after the credits) goes into a
// record never written before while k <= 48, and from then on into the
// record that report k - 10 was written to; a report that passes no spare
// bytes keeps what was there.
// CONFIRMED (FUN_10c0_0784 case 1009 @10c0:09b9-09d5): "%s destroyed your
// colony at %s." names the player whose number is the first spare word (+8):
// the name at game header +0x16 + 16 x number (the 1,562-byte header,
// FUN_1030_0000 @1030:000c). The meteor report (FUN_1040_27ee @1040:2ab3-2ac8)
// passes none, so it names whatever the first spare word of the report ten
// back held (or, if that one passed none either, of the one ten before it,
// and so on): player 0 within the first 48 reports. What each report puts
// there (the callers of FUN_10c0_0e20, docs/coverage-20.md):
// - a fleet's label (FUN_1068_0b69: "one %s …", "%d %s …", or the design's
//   name for none), so its first two letters: 1016 a fleet scrapped
//   (@1040:116c-11bb), 1019 ships built (@1040:1939-1956), 1023 can't reach
//   (@1040:2651-267d), 1024 arrived, 1025 stopped (@1040:250e-258e);
// - 1017 a design scrapped: the design's name (@1040:13b2-13cd);
// - 1031 explored: the star's gravity x 100 / your home's (@1040:3551-3584);
// - 1033, 1034 your ships lost, 1035 and 1009 the attacker (FUN_1018_260b);
// - every other report (and the chat reports, @1040:05ed-061f, 0681-0690):
//   none.
// A number of 20 or more (letters make big numbers) points past the names
// into the rest of the header, or past its end, where 2.0 itself would stop
// with a General Protection Fault; the remake then prints no name.
// (Mac 2.0.1, js/rules-mac20.js, keeps the same list: AddNewMessage @130fba)
const log20On = (G) => E.rules(G).id === 'dos' || E.rules(G).id === 'mac20'; // 1.2 prints a blank report instead (rules-12.js)
function log20(p) { return p.log20 || (p.log20 = { n: 0, w: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], t: null, i: 0, defer: [], pend: [] }); }
// a report goes into the list; spare: its first spare word, or null for none.
// Returns the word the record held before (what a report with none shows).
function addLog20(L, spare) {
  const k = ++L.n, j = k % 10;
  const old = k <= 48 ? 0 : L.w[j];
  L.w[j] = spare == null ? old : spare & 0xffff;
  return old;
}
const word2 = (t) => { t = String(t || ''); return (t.charCodeAt(0) & 0xff) | ((t.length > 1 ? t.charCodeAt(1) & 0xff : 0) << 8); };
const labelWord20 = (n, name) => word2(n === 1 ? 'one' : n < 1 ? name : String(n) + ' ');
const countOf = (t) => t === 'one' ? 1 : parseInt(t, 10);
const playerNamed = (G, t) => { let q = null; for (const x of G.players) if (t.startsWith(x.name) && (!q || x.name.length > q.name.length)) q = x; return q; };
// which of 2.0's reports a message of the remake is, and its first spare
// word: undefined (not one of 2.0's), null (none), a number, or
// { explore: number } (sent in 2.0's pass 2, FUN_1040_2fa8)
function spare20(G, p, m) {
  const t = String(m.text || ''); let r;
  if (m.chat) return null;
  if ((r = /^Built (one|\d+) /.exec(t))) return labelWord20(countOf(r[1]));
  if ((r = /^Your fleet of (one|\d+) .* has (arrived at|stopped at) /.exec(t))) return labelWord20(countOf(r[1]));
  if ((r = /^Your (one|\d+) .* can no longer reach /.exec(t))) return labelWord20(countOf(r[1]));
  if (/^You have explored /.test(t) && m.star != null) {
    return { explore: Math.floor(G.stars[m.star].g * 100 / p.homeG + 1e-9) };
  }
  if ((r = /^You (won|lost) a battle at .*\. You lost (\d+) of your ships\./.exec(t))) return +r[2];
  if ((r = / successfully defended itself against an enemy attack from (.*)\.$/.exec(t))) { const q = playerNamed(G, r[1]); return q ? q.id : 0; }
  if ((r = /^(.*) destroyed your colony at /.exec(t))) { const q = playerNamed(G, r[1]); return q ? q.id : 0; }
  if (/^(The game has been updated to the year|You have abandoned|Your colony at .* is not receiving sufficient funds|Warning: you are terraforming|You have completely terraformed|You have ships queued at|You are spending money on shipbuilding|You are not spending any money on technology|You have colonized|Oh no! |You have recovered |You have just been eliminated|Congratulations! You have just won)/.test(t)) return null;
  if (/ has run out of metal\.| Technology has reached level | metal has fallen onto | population growth rate has slowed\.| has just become a profitable colony\.|It’s a baby boom!| has just been eliminated from the game\.| has just won the game\./.test(t)) return null;
  return undefined;
}
// count the player's messages so far this turn into its list; explore
// reports wait for 2.0's pass 2 when defer is set (the remake sends them as
// the fleets arrive)
function sync20(G, p, defer) {
  if (!p.human || !log20On(G)) return;
  const L = log20(p), box = p.inbox || [];
  if (L.t !== G.turn) { L.t = G.turn; L.i = 0; }
  for (; L.i < box.length; L.i++) {
    const m = box[L.i], w = spare20(G, p, m);
    if (w === undefined) continue;
    if (w && w.explore != null) { if (defer) L.defer.push({ star: m.star, w: w.explore }); else addLog20(L, w.explore); continue; }
    addLog20(L, w);
  }
}
function flushExplores20(G, p, sid) {
  if (!p.human || !log20On(G)) return;
  const L = log20(p);
  L.defer = L.defer.filter(x => { if (sid != null && x.star !== sid) return true; addLog20(L, x.w); return false; });
}
// CONFIRMED (FUN_1040_0fca @1040:0fca-11bb, 13a4-13cd): the remake scraps
// when you give the order; 2.0 scraps at the start of the next turn (after
// the "updated to the year" report), with report 1016 for each marked fleet,
// in fleet-list order (newest first), then 1017 for each marked design
function scrapped20(G, p, f, d) {
  if (!p || !p.human || !log20On(G)) return;
  const L = log20(p);
  if (f) L.pend.push({ f: f.id, w: labelWord20(fleetCount(f), (fleetDesigns(G, f)[0] || {}).name) });
  else if (d) L.pend.push({ d: p.designs.indexOf(d), w: word2(d.name) });
}
function flushScraps20(G, p) {
  if (!p.human || !log20On(G)) return;
  const L = log20(p), fs = L.pend.filter(x => x.f != null).sort((a, b) => b.f - a.f), ds = L.pend.filter(x => x.d != null).sort((a, b) => a.d - b.d);
  for (const x of fs.concat(ds)) addLog20(L, x.w);
  L.pend = [];
}
// the name report 1009 prints for a stale word (FUN_10c0_0784 @10c0:09b9)
function staleName20(G, w) {
  const i = w & 0xfff; // (0x16 + 16 x w) & 0xffff lands on name i when i < 20
  if (i < 20) { const q = G.players[i]; return q ? q.name : ''; }
  return '';
}

// ---------- pass 2 (FUN_1040_0038 @1040:04c3-06d5) ----------
// For each player in turn: savings, interest, lost colonies, meteors,
// growth and income (FUN_1040_27ee), then refuelling, exploring, colonizing
// and routes (FUN_1040_2fa8); the pool is then kept between $0 and
// $999,999,999. 2.0 runs it for every player, out or not.
function pass2_20(G) {
  for (const p of G.players) {
    income20(G, p);
    colonize20(G, p);
    p.savings = clamp(p.savings, 0, MONEY_MAX);
  }
}
// CONFIRMED (FUN_1040_27ee): the kept money is the Savings slot's share;
// with the refunds it earns 10 x isqrt of itself (@1040:2946-2995); then for
// each colony slot in order: a colony lost in a battle (or left with no
// people) is taken out (FUN_1040_38c0); ships scrapped in hyperspace fall
// as a meteor shower, 50 people (units) a unit of metal, report 1053, and a
// colony left with no one gets report 1009 and is taken out; growth as in
// 5.0.5 (always, the "no growth" flag being cleared); income; profit and
// baby-boom reports; the colony's class (0 paying, 1 losing, 2 losing with
// a gravity ratio over 2.56).
function income20(G, p) {
  sync20(G, p, true);
  const share = shareOf20(G, p);
  const saved = share('sav') + (p.oRefund || 0);
  const interest = 10 * isqrt(saved);
  let M = saved + interest, gross = 0, net = 0;
  p.oRefund = 0; p.oKept = 0;
  for (const sid of slots20(G, p).slice()) {
    if (typeof sid !== 'number') continue;
    const s = G.stars[sid];
    if (s.owner !== p.id || !(s.pop > 0)) { removeColony20(G, p, s); continue; }
    const m = G.meteors && G.meteors[sid];
    if (m > 0) {
      const kill = Math.min(popU(s), m * 50);
      setPopU(s, popU(s) - kill);
      msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', star: s.id });
      if (popU(s) <= 0) {
        // report 1009, "%s destroyed your colony at %s.", with no player
        // given: the name is the one left in the record (log20, above)
        let who = '';
        if (p.human && log20On(G)) { sync20(G, p, true); who = (E.rules(G).staleName || staleName20)(G, addLog20(log20(p), null)); }
        // the patch (fix 'meteorReport'): the report names the meteor shower
        if (E.fixed(G, 'meteorReport')) who = 'A meteor shower';
        msg(G, p.id, `${who} destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 2001, star: s.id });
        if (p.human && log20On(G)) log20(p).i = p.inbox.length;
        removeColony20(G, p, s); continue;
      }
    }
    const before = s.oInc == null ? -7501 : s.oInc;
    const mx = O.maxPopU(p, s);
    let u = popU(s), add;
    if (u >= mx) add = trunc(mx / 1000) + RI(G, 0, trunc(mx / 10000));
    else if (before <= -7500) add = Math.min(trunc(mx / 1000), 2 * u) + RI(G, 0, 5);
    else {
      const r1 = RI(G, 0, 5), r2 = RI(G, 0, trunc(mx / 100)), base = trunc(mx / 20);
      add = base + r2 < 2 * u + r1 ? base + RI(G, 0, trunc(mx / 100)) : 2 * u + RI(G, 0, 5);
      if (u + add >= mx) msg(G, p.id, `${s.name}’s population growth rate has slowed.`, { icon: 'm9030', star: s.id, quiet: true });
    }
    u += add; setPopU(s, u);
    const h = hab(p, s), inc = incomeU(u, h.H);
    s.oInc = inc;
    if (inc > 0) { M += inc; gross += inc; }
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 2000, star: s.id }); }
    if (before <= -7500 && inc > -7500) msg(G, p.id, `It’s a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', star: s.id });
    s.cls20 = inc >= 0 ? 0 : h.gR > 256 ? 2 : 1;
  }
  p.savings = M;
  p.oInterest = interest; p.oInc = gross;
  p.lastGross = gross; p.lastIncome = net; p.lastInterest = interest; p.lastNet = net + interest;
}
// CONFIRMED (FUN_1040_2fa8 @1040:2fa8-3152): each of the player's fleets at
// one of its colonies is refuelled, and a fleet of Colony Ships there takes
// on colonists; then each fleet at a star (in the player's fleet list,
// newest first) explores it (FUN_1040_34e9) and, if the star isn't the
// player's and the fleet has colonists, founds a colony (FUN_1040_3645);
// a fleet with a destination has its route checked (FUN_1040_25ce); then
// every colony is explored again.
function colonize20(G, p) {
  const mine = () => G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null);
  for (const f of mine()) {
    if (G.stars[f.star].owner !== p.id) continue;
    f.fuel = fleetMaxRange(G, f);
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (c > 0) f.colonists = c * 10;
  }
  for (const f of mine().reverse()) {
    if (!G.fleets.includes(f)) continue;
    if (fleetCount(f) === 0) { G.fleets.splice(G.fleets.indexOf(f), 1); continue; }
    const s = G.stars[f.star];
    sync20(G, p, true); flushExplores20(G, p, s.id); // 2.0 reports 1031 here (FUN_1040_34e9)
    observe(G, p, s.id);
    if (s.owner !== p.id && s.owner < 0 && (f.colonists || 0) > 0 && fleetDesigns(G, f).some(d => d.type === 'colony')) {
      G.stat.colonized++;
      settle20(G, p, s, f);
      observe(G, p, s.id);
    }
  }
  sync20(G, p, true); flushExplores20(G, p);
  replan20(G, p);
  for (const sid of colIds20(G, p)) observe(G, p, sid);
  sync20(G, p);
}
// CONFIRMED (FUN_1040_3645 @1040:3645-38bf): "You have colonized %s." (1032);
// the new slot goes in front of the others; 10 colonists a ship of the
// fleet; income -7501; bars Terraform 900 / Mine 100 (class 1), or
// Mine 1,000 when the gravity ratio is over 2.56 (class 2); with more than
// $20,000 in the pool the slot is given 15,000,000 / pool per mille
// (FUN_1010_16f2), taken from the others (FUN_1010_179a).
function settle20(G, p, s, f) {
  msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
  const n = f.colonists || 10;
  f.colonists = 0;
  s.owner = p.id; setPopU(s, n); s.everProfit = false; s._warned = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = false;
  s.queue = []; s.yard = 0; s.yardMetal = 0;
  const L = slots20(G, p), i = L.indexOf(s.id);
  if (i >= 0) L.splice(i, 1);
  L.unshift(s.id);
  (p.colOrder || (p.colOrder = [])).unshift(s.id);
  p.budget.col[s.id] = 0;
  if (hab(p, s).gR > 256) { s.cls20 = 2; setBars20(s, 0, 1000, 0); } else { s.cls20 = 1; setBars20(s, 900, 100, 0); }
  if (p.savings > 20000) giveShare20(G, p, s.id, trunc(15000000 / p.savings));
}
// CONFIRMED (FUN_1010_218e @1010:218e-2264): the least share a losing
// colony needs, per mille: ceil(loss x 1000 / pool) when the pool is $1,000
// or more and bigger than the loss; otherwise 0
function minShare20(G, p, k) {
  if (typeof k !== 'number') return 0;
  const s = G.stars[k], inc = s.oInc || 0, M0 = p.savings;
  if (inc >= 0 || M0 < 1000 || -inc >= M0) return 0;
  return trunc((-inc * 1000 + M0 - 1) / M0);
}
// CONFIRMED (FUN_1010_179a @1010:179a-1ce6; 1.2's DetermineNewLevels
// @c1470, number for number): the slot's share moves by delta per mille and
// the others make room, each between its least (mins) and most (maxs) share:
// - delta > 0 (@1010:17de-1946): round after round, each other slot not yet
//   at its least gives up ceil(left x its share / their total), kept within
//   0..1,000, stopping at its least share (it is then left out); with their
//   total 0, nothing more is taken;
// - delta < 0 (@1010:195d-1ae9): round after round, each other slot not yet
//   at its most takes ceil(left x its share / their total), stopping at its
//   most; with their total 0, each gets 1 (taken from the moved slot) first;
// ("left" is what was left at the start of the round; the rounds go on while
// something is left and some slot was in the last round's total)
// then the slot gets delta, and if the total is outside 990..1010 the others
// are moved one per mille at a time (from the first slot round, at most 1,000
// steps) to make 1,000: up only below their most and (unless every other
// slot is at 0) above 0, down only above their least; then again without
// those bounds (0..1,000).
function redistribute20(G, p, sid, delta, mins, maxs) {
  const L = slots20(G, p).filter(k => typeof k !== 'number' || G.stars[k].owner === p.id);
  const idx = L.indexOf(sid); if (idx < 0) return;
  const v = L.map(k => keyPm(p, k)), mn = L.map(k => mins(k)), mx = L.map(k => maxs(k)), frozen = L.map(() => false);
  let free = L.length - 1;
  if (delta > 0) {
    let rem = delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (i !== idx && !frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) break;
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (i === idx || frozen[i]) continue;
        const nv = clamp(v[i] - trunc((r0 * v[i] + sum - 1) / sum), 0, 1000);
        if (nv > mn[i]) { rem -= v[i] - nv; v[i] = nv; }
        else { rem -= v[i] - mn[i]; v[i] = mn[i]; frozen[i] = true; }
      }
    }
  } else if (delta < 0) {
    let rem = -delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (i !== idx && !frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) {
        for (let i = 0; i < L.length; i++) if (i !== idx && !frozen[i]) { v[i] = 1; sum++; }
        v[idx] -= sum;
      }
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (i === idx || frozen[i]) continue;
        const nv = v[i] + trunc((r0 * v[i] + sum - 1) / sum);
        if (nv < mx[i]) { rem -= nv - v[i]; v[i] = nv; }
        else { rem -= mx[i] - v[i]; v[i] = mx[i]; frozen[i] = true; }
      }
    }
  }
  v[idx] += delta;
  let tot = v.reduce((a, x) => a + x, 0);
  const allZero = !v.some((x, i) => i !== idx && x > 0);
  const fix = (bounded) => {
    for (let i = 0, it = 0; tot !== 1000 && it < 1000; it++) {
      if (i !== idx) {
        if (tot < 1000 && v[i] < (bounded ? mx[i] : 1000) && (!bounded || allZero || v[i] > 0)) { v[i]++; tot++; }
        if (tot > 1000 && v[i] > (bounded ? mn[i] : 0)) { v[i]--; tot--; }
      }
      if (++i === L.length) i = 0;
    }
  };
  if (tot < 990 || tot > 1010) fix(true);
  if (tot < 990 || tot > 1010) fix(false);
  L.forEach((k, i) => setKeyPm(p, k, v[i]));
}
// CONFIRMED (FUN_1010_16f2 @1010:16f2-1799; 1.2's GiveBarPercent @c139c): a
// slot is given pm per mille (outside 0..1,000: 0), the others within their
// least share (FUN_1010_218e) and 1,000
function giveShare20(G, p, sid, pm) {
  if (pm < 0 || pm > 1000) pm = 0;
  redistribute20(G, p, sid, pm - keyPm(p, sid), (k) => minShare20(G, p, k), () => 1000);
}
// CONFIRMED (the budget window: FUN_1010_1303 @1010:1303-1557 starts a drag
// on a bar by setting every slot's least share to 0 and most to 1,000;
// FUN_1010_155c @1010:155c-16e5 reads the new share from the mouse, 0 to
// 1,000, and moves the slot by the difference with FUN_1010_179a): dragging a
// bar moves the others in proportion, with no floor but 0. 1.2 is the same
// (DoHBarClick @c1002: floors 0 and ceilings 1,000 at @c1212-c121a, then
// DetermineNewLevels @c1470 at each step, @c1324). 2.0 and 1.2 do it at every
// step of the drag, from where the last step left the shares; the remake's
// bars give where the drag ends, from the shares as it began (rs.dragShare).
function dragShare20(G, p, key, pm) {
  const k = key === 'savings' ? 'sav' : key === 'tech' ? 'tech' : +key;
  pm = clamp(pm, 0, 1000);
  const d = pm - keyPm(p, k);
  if (d !== 0) redistribute20(G, p, k, d, () => 0, () => 1000);
}
// CONFIRMED (FUN_1040_38c0 @1040:38c0-3a2a; 1.2's DecolonizeStar @a3fd4):
// a colony given up: the player's fleets of Colony Ships at the star are
// loaded with colonists, the colony's share goes to the Savings slot, the
// slot is taken out, and the star is nobody's.
function removeColony20(G, p, s) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== s.id || f.to != null) continue;
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (c > 0) f.colonists = c * 10;
  }
  const L = slots20(G, p), i = L.indexOf(s.id);
  if (p.budget.col[s.id] != null) { p.budget.savings = (keyPm(p, 'sav') + keyPm(p, s.id)) / 1000; delete p.budget.col[s.id]; }
  if (i >= 0) L.splice(i, 1);
  if (s.owner === p.id) { s.owner = -1; s.pop = 0; }
  if (s.owner < 0) { s.queue = []; s.yard = 0; s.yardMetal = 0; delete s.bars; delete s._bsig; delete s.cls20; }
}

// ---------- the ship queue and fleets ----------
// CONFIRMED (BUILDSHIPSDLGPROC's remove handler FUN_10e8_17af @10e8:181a-182c,
// add handler FUN_10e8_16e4, OK @10e8:21b7-21e8 writing the window's copy
// back to the slot's part-payment +0x18/+0x1c): taking one ship off a slot
// of several keeps what was paid; taking the first slot's last ship out
// empties the slot and zeroes what was paid toward it, money and metal, so
// it is lost. A design already in a slot gets the new ships; a new one takes
// the first empty slot (queueMergeAny).
function yardRefund20(G, p, s) {
  if (s.queue && s.queue.length && s.queue[0].did === s.yardDid) return;
  s.yard = 0; s.yardMetal = 0;
}
// CONFIRMED (FUN_1068_0000: a fleet record holds one design and a count):
// fleets of the same design can be put together, nothing else
function canMerge20(G, a, b) {
  const da = Object.keys(a.ships), db = Object.keys(b.ships);
  return da.length === 1 && db.length === 1 && da[0] === db[0];
}
// CONFIRMED (ORGFLEETSDLGPROC: its set-up @10e8:2a06-2ae6 and OK handler
// @10e8:2dd5-2f12): Organize Ships deals the ships of one design at a star
// into piles. On OK every fleet of that design at the star, in list order,
// takes the next pile and has its orders cleared (next stop, destination,
// route) and its fuel used set to the average of the fuel those fleets had
// used: their total over their number, counted up to 11 (so from 12 fleets
// on it is over 11); a fleet left without a pile is removed; each extra
// pile is a new fleet (FUN_1068_0000), which for Colony Ships is loaded with
// colonists. (The smallest fuel used is worked out too, @10e8:2a9b, and
// never used.) This is the Windows port's own dialog: Mac 2.0.1's
// OrganizeFleets @1137e6 gives every fleet the least fuel used and leaves
// the orders alone, as 1.2 does (docs/dos-findings.md, "Mac 2.0.1 differs").
function organized20(G, f, merged, nf, orders) {
  const did = Object.keys(f.ships)[0]; if (did == null || f.star == null) return;
  const R = fleetMaxRange(G, f);
  const same = G.fleets.filter(x => x.owner === f.owner && x.star === f.star && x.to == null && Object.keys(x.ships).length === 1 && Object.keys(x.ships)[0] === did);
  // the fleets as they were when the window opened
  const usedOf = (fuel) => Math.max(0, R - fuel);
  const before = [];
  for (const x of same) {
    if (x === nf) continue;
    if (x === f && merged && orders && orders.fuel) { before.push(usedOf(orders.fuel.a)); before.push(usedOf(orders.fuel.b)); }
    else before.push(usedOf(x.fuel));
  }
  if (merged && !(orders && orders.fuel)) before.push(usedOf(merged.fuel));
  // the patch (fix 'orgFuelCount'): the average over every fleet, not at most 11
  const avg = before.length ? trunc(before.reduce((a, x) => a + x, 0) / (E.fixed(G, 'orgFuelCount') ? before.length : Math.min(before.length, 11))) : 0;
  for (const x of same) { x.fuel = R - avg; x.dest = null; x.path = null; x.routeTo = null; }
  const d = getDesign(G, f.owner, +did);
  if (d && d.type === 'colony') {
    if (nf) nf.colonists = 10 * fleetCount(nf);
    if (merged) { // the record kept is the first in 2.0's list: the newer fleet
      const fLoaded = (f.colonists || 0) - (merged.colonists || 0) > 0, mLoaded = (merged.colonists || 0) > 0;
      f.colonists = (merged.id > f.id ? mLoaded : fLoaded) ? 10 * fleetCount(f) : 0;
    } else if (nf) f.colonists = (f.colonists || 0) > 0 ? 10 * fleetCount(f) : 0;
  }
}

// ---------- the unofficial patch (docs/fixes.md, "2.0") ----------
// 2.0's obvious bugs, fixed only when the player turns the patch on at New
// Game (G.opts.patch; engine.js fixed). Each is the smallest change that does
// what the code evidently meant. The rules ask E.fixed(G, id) where they are.
const FIXES20 = [
  { id: 'meteorReport', title: 'The meteor report names the meteor shower',
    text: 'A colony wiped out by a meteor shower was reported as “… destroyed your colony”, naming whoever a report ten messages earlier happened to leave behind (where 2.0 itself could crash). The patch reports “A meteor shower destroyed your colony at …”.' },
  { id: 'orgFuelCount', title: 'Organize Ships averages the fuel over every fleet',
    text: 'Organize Ships gives every fleet of the design the average fuel used, but counted at most 11 fleets, so with 12 the average came out too high. The patch divides by the real number of fleets.' },
  { id: 'attack16', title: 'The computers’ attack rating no longer wraps round',
    text: 'The computers worked out a design’s strength in 16 bits, so from about Weapons 4 the sum wrapped round and they misjudged their own warships. The patch works it out in 32 bits, as 1.2 and 3.0.1 do.' },
  { id: 'colonyBars32', title: 'The computers’ colony bars no longer overflow',
    text: 'When a computer gave a colony more than $2,147,483 for one part, the sum overflowed and the colony’s bars came out wrong. The patch works them out without overflowing.' },
  { id: 'scrapRange', title: 'Old fighters sent home are routed with their own Range',
    text: 'When the computers sent old fighters home, the program passed the fleet’s place in a list where the route finder wants its Range. It made no difference to play (the colony is always within reach), and the remake already routes these fleets by their own Range; it is listed so the patch covers every slip found.' },
];

// ---------- set-up (FUN_1030_1299 @1030:19ae-1b32) ----------
// CONFIRMED: the budget slots are Savings (0), Technology (150) and the home
// colony (850); the home colony's bars are Terraform -1 (finished), Mine
// 200, Ship 800, and its class 0
function afterSetup20(G) {
  afterSetup(G);
  for (const p of G.players) {
    const home = G.stars[p.homeStar];
    p.slots20 = ['sav', 'tech', home.id];
    setBars20(home, -1, 200, 800); home.cls20 = 0;
  }
}

// ---------- the budget panel ----------
function projected20(G, p) {
  let support = 0;
  for (const s of colonies(G, p.id)) if ((s.oInc || 0) < 0) support += -s.oInc;
  return { gross: p.oInc, income: (p.oInc || 0) - support, interest: p.oInterest || 0, net: Math.max(0, p.savings), dip: 0 };
}
function underfunded20(G, p) {
  const share = shareOf20(G, p);
  return colonies(G, p.id).filter(s => (s.oInc || 0) < 0 && colonyMoney20(G, p, s, share) < 0);
}
// the computers' hooks (js/ai-12.js): whether a colony is still being
// terraformed is its Terraform bar not being -1 (FUN_1020_03e7 @1020:0445,
// 0b51 @0b95 and @0c55, 12d1 @150d); and ResolveSpending's bars
// (FUN_1020_35f9 @1020:3829-3996): with no terraforming or mining money,
// Terraform and Mine 0 and Ship 1,000; else each is its money over the
// colony's total, per mille rounded up; a bar at -1 is left as it is.
// The product is worked out in 32 bits (the long multiply FUN_1000_10f0 of
// the part's money by 1,000, @1020:38da, 3930, 3974), the colony's total - 1
// added and the signed long divide FUN_1000_11ac taken, and the result kept
// as a word (@1020:38fc, 3952, 3996): a part over $2,147,483 wraps, as in
// Mac 1.2 (ResolveSpending @93378).
const terraLeft20 = (G, p, s) => bars20(s)[0] !== -1;
function setColonyBars20(G, s, t, m, f) {
  let [T, X] = bars20(s), S;
  if (t + m === 0) { if (T >= 0) T = 0; if (X >= 0) X = 0; S = 1000; }
  else {
    const rest = t + m + f, pm = E.fixed(G, 'colonyBars32') ? (v) => trunc((v * 1000 + rest - 1) / rest) // the patch: no overflow
      : (v) => (trunc(((Math.imul(v, 1000) + rest - 1) | 0) / rest) << 16) >> 16;
    if (T >= 0) T = pm(t);
    if (X >= 0) X = pm(m);
    S = pm(f);
  }
  setBars20(s, T, X, S);
}

// The versions 1.2's ruleset used to keep. No longer used: 1.2 now plays
// 2.0's turn above (js/rules-12.js, docs/12-findings.md).
const base12 = {
  afterSetup, route, refuel, afterMovement, colOrder, disposable, projected, underfunded,
  economyForAll: false, terraLeft: null, setColonyBars: null, aiYear: null,
};

E.registerRules('dos', Object.assign({}, O, {
  label: 'DOS 2.0 (1993)',
  // the New Game window's Version and Edition menus (engine.js editions):
  // the Windows 3.1 program, WINHO.EXE, is a 2.0.1 build (its credits,
  // string 672), and the DOS game a port of it
  family: '2.0', edition: { version: '2.0.1', name: 'DOS and Windows 3.1', platform: 'DOS and Windows 3.1', year: 1993 }, skins: ['dos', 'amiga'],
  // CONFIRMED: 2.0 has no command to give up a colony. FUN_1040_38c0, which
  // gives one up, is called only by the turn: a colony its share can't keep
  // (FUN_1040_0925 @1040:0ab5) and one lost or emptied (FUN_1040_27ee
  // @1040:29fa). Only leaving it unfunded does it ("Let 'em die", box 5060).
  // So there is no Evacuate button, even with modern conveniences on (a rule).
  evacuateCommand: false,
  dragShare: dragShare20,                 // the budget window's drag (FUN_1010_1303, 155c, 179a)
  scrapped: scrapped20,                   // the report list (log20): 2.0 reports scrapping next turn
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // CONFIRMED (FUN_1040_269d): a finished terraforming or mining part's share
  // goes to the colony's other bars (the planet panel says so)
  finishedPartWasted: false,
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '2.0', platform: 'DOS and Windows 3.1', year: 1993,
  // 2.0's own computer players (js/ai-12.js: FUN_1020_0000 is the routine
  // Mac 1.2 calls DoComputerTurn; see docs/dos-findings.md)
  ai: 'dos',
  maxDesigns: 20,                         // CONFIRMED (10e8:1538, box3280; the computers too, FUN_1020_4019)
  maxPlayers: 20,                         // CONFIRMED: 20 player slots (FUN_1030_0c97, FUN_1040_4028)
  queueSlots: QUEUE_SLOTS,                // CONFIRMED (FUN_1040_1479): three (design, count) slots per colony
  queueMergeAny: true,                    // CONFIRMED (FUN_10e8_16e4): a design already queued gets the new ships
  // CONFIRMED: "Sorry, you can only send ten messages per turn." (string 160); each
  // player's outgoing messages are kept in ten 8-byte entries (0x50 bytes, FUN_1040_0038 @1040:039d)
  chatLimit: 10,
  plainTechMessages: true,                // "Your Range Technology has reached level N."
  battleEverywhere: true,                 // CONFIRMED (FUN_1040_23ed, 0aea): every fleet and colony marks its star
  // CONFIRMED (FUN_1040_23ed): no notice to a colony's owner when someone else's fleet arrives
  features: { arrivalNotices: false, waypoints: true, chat: true, buildQueue: true, singleTypeFleets: true, skills: true, noRadical: true },
  canBuild: (G, p, type) => TYPES4.includes(type),
  starNames: STAR_NAMES, maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES, femaleComputers: FEMALE_COMPUTERS, shipNames: SHIP_NAMES,
  welcome: WELCOME,
  SKILLS, WPNRAT, setupPlayer, defaultDesigns, afterSetup: afterSetup20, computerSetup, makeGalaxy, distance, SHAPES,
  designCost, designLimits, designMin, aiSpec, paysPrototype, fleetFor, route: route20,
  borrowLimit: () => 0,                   // CONFIRMED: no borrowing in 2.0 (money is clamped at 0)
  // the turn: pass 1 for every player (economy20), the fleets move, the
  // battles, then pass 2 for every player (pass2_20, run in the refuel slot)
  economy: economy20, economyForAll: true, afterMovement: null, refuel: pass2_20,
  disposable, projected: projected20, underfunded: underfunded20, settle, battle: battle20, randomEvents,
  fleetArrives: fleetArrives20, arrivalSays: () => false, // the arrival messages are fleetArrives20's
  departs: departs20, legFuelArrives,     // a leg's fuel spent on arrival (above)
  planetIncome, incomeU, research, yardProgress, yardRefund: yardRefund20,
  canMerge: canMerge20, organized: organized20,
  canColonize: () => false, exploreQuality, planetClass, checkElimination,
  observe: null,                          // 2.0 keeps no 5.0.5-style enemy strength (x12 instead)
  outComputersPlay: true,                 // CONFIRMED (FUN_1040_0038 @1040:02bb): out computers still play
  designName, colOrder: colOrder20, shipPower, planetPower, x12, popU,
  terraLeft: terraLeft20, setColonyBars: setColonyBars20,
  // CONFIRMED (FUN_1020_35f9 @1020:3709-3774, the compare at 1020:3721-372c):
  // a slot given more than $2,000,000 gets ceil(money / trunc(total / 1000))
  // per mille (two signed long divides, FUN_1000_11ac), the others
  // ceil(money x 1000 / total), as Mac 1.2's ResolveSpending (js/ai-12.js)
  aiBigShares: true,
  // CONFIRMED (FUN_1040_0038 @1040:01a8): the year is moved on before the computers plan
  aiYear: (G) => G.year + 10,
  // internals, for the Mac 1.2 ruleset built on this one (js/rules-12.js)
  shareOf, colonyMoney, shipyard, removeColony, isqrt, wpn, battleOnly: battle, base12, bars20, setBars20,
  // not in 2.0 (CONFIRMED: no text or code for them)
  difficulty: undefined, masterPoints: undefined,
  // the unofficial 2.0.1 patch (engine.js fixed; docs/fixes.md): each fix is
  // asked for by its id where the rule is, and is off unless G.opts.patch
  fixes: FIXES20,
  patchVersion: '2.0.1.1', // the program calls itself 2.0.1 in its credits, so the patch is 2.0.1.1
}));
})(this);
