// Spaceward Ho! web remake — the "Mac 3.0.1" ruleset.
//
// Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993, 68k) is the first
// colour version. Its turn engine is an earlier build of the one behind 4.0.5
// and 5.0.5, so this ruleset starts from the "Original" (5.0.5) rules
// (js/rules-original.js), reuses the 4.0.5 galaxy, battles and novas
// (js/rules-405.js) where 3.0.1 does the same thing, and replaces only what
// 3.0.1 does differently. Its computer players are its own (js/ai-301.js).
//
// Labels: CONFIRMED (Name @address) = read from that 3.0.1 routine (its MacsBug
// name and address in the layout made by tools/decompile/mac68k.py);
// GUESS = not settled by the decompile, so it follows 5.0.5 or is a choice the
// remake made. See docs/301-findings.md.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, msg, fmt, colonies, know, observe, findOrCreateDesign, addShipsToStar, TECHS } = E;
const O = E.RULESETS.original, W = E.RULESETS['405'];
const { popU, setPopU } = O;
const trunc = Math.trunc;
const isqrt = (x) => x > 0 ? trunc(Math.sqrt(x)) : 0;
const MAX_DESIGNS = 20; // CONFIRMED (DITL 3280: "only 20 ship types at one time")
const TYPES4 = ['scout', 'fighter', 'colony', 'satellite']; // CONFIRMED (STR# 1006, CalcShipCosts @134de6)

// ---------- player setup (CreatePlayer @f26a0) ----------
// CONFIRMED: Skill Level from the Join dialog (DITL 4010). The money is the
// first turn's Total Money (no random extra); Ship Savings start at 0. The home
// colony's income and population are the skill's. Novice gets a Colony Ship and
// two Scouts, Beginner two Scouts.
const SKILLS = {
  novice:   { code: 0, inc: 51000, metal: 20000, pop: 750000, colony: 1, scouts: 2 },
  beginner: { code: 1, inc: 41000, metal: 12000, pop: 625000, colony: 0, scouts: 2 },
  normal:   { code: 2, inc: 30000, metal: 5000,  pop: 500000, colony: 0, scouts: 0 },
  advanced: { code: 3, inc: 20000, metal: 2500,  pop: 350000, colony: 0, scouts: 0 },
  expert:   { code: 4, inc: 20000, metal: 0,     pop: 350000, colony: 0, scouts: 0 },
};
const IQS = ['dumb', 'average', 'smart', 'diabolical'];
function setupPlayer(G, p, home, start) {
  const k = SKILLS[start] ? start : 'normal', st = SKILLS[k];
  // home world, CONFIRMED: 0..200 F, 0.5..2.0 G, 10,000 metal (as 5.0.5)
  home.t = RI(G, 0, 2000) / 10;
  const g = RI(G, 1, 2);
  home.g = RI(G, 25 * (1 << g), 25 * (1 << (g + 1))) / 100;
  home.metal = 10000;
  p.homeG = home.g; p.homeT = home.t;
  home.owner = p.id; setPopU(home, st.pop); home.everProfit = true;
  home.oInc = st.inc; home.oSink = 5000; home.terra = 0;
  p.savings = 0; p.metal = st.metal;
  p.oInc = st.inc; p.oInterest = 0; p.oRefund = 0; p.oD = 0;
  p.lastGross = p.oInc; p.lastIncome = p.oInc; p.lastNet = p.oInc;
  // CONFIRMED: tech 6/2/2/2/0/0 with a 0-40 (Radical 0-80) head start; research
  // split and budget from the Stup 1000 defaults (167.../650/250/100), as 5.0.5
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {};
  for (const t of TECHS) p.tprog[t] = p.tech[t] * 100 + RI(G, 0, t === 'radical' ? 80 : 40);
  p.talloc = { range: 167, speed: 167, weapons: 167, shields: 167, mini: 166, radical: 166 };
  p.budget = { tech: 0.25, savings: 0.65, col: { [home.id]: 0.10 } };
  p.flags = {}; p.bonus = {}; p.deck = [];
  p.skill = k; p.startRank = 0;
  p.colOrder = [home.id];
}
// CONFIRMED (CreatePlayer, DoSomethingRadical @a5d4e): Scout R+2 W-1 S-1,
// Satellite R0, Fighter and Colony Ship at your tech (no Colony Mini/3).
// (The computers' own designs: MaintainShipTypes, js/ai-301.js.)
function aiSpec(p, type) {
  const t = p.tech;
  const spec = { type, R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { spec.R += 2; spec.W = Math.max(1, spec.W - 1); spec.S = Math.max(1, spec.S - 1); }
  if (type === 'satellite') spec.R = 0;
  return spec;
}
// CONFIRMED (CreatePlayer): Scout R8 V2 W1 S1, Satellite R0 V2 W2 S2, Colony
// Ship and Fighter R6 V2 W2 S2, all Mini 0; no Tanker
function defaultDesigns(G, p) {
  for (const type of ['scout', 'satellite', 'colony', 'fighter']) {
    const spec = aiSpec(p, type); spec.M = 0;
    findOrCreateDesign(G, p, spec);
  }
}
function afterSetup(G) {
  // CONFIRMED: no Luck or Novas check box in 3.0.1 (DITL 6080): battle luck is
  // always on (DoBattleStage @e0004), and novas are on by default (option bit 2,
  // Stup 1000; CheckForSupernova @a33cc)
  G.opts.luck = true; G.opts.novas = true;
  for (const p of G.players) {
    const st = SKILLS[p.skill] || SKILLS.normal, home = G.stars[p.homeStar];
    const by = (t) => p.designs.find(d => d.type === t);
    if (st.colony) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; d.free = true; f.colonists = 10; }
    for (let i = 0; i < st.scouts; i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}
// CONFIRMED (CreateNewPlayer @121fee): a computer's start comes from the
// intelligence (Dumb = Expert, Average = Advanced, Smart = Normal, Diabolical =
// Novice); with several humans each computer copies a human's skill
// (DoGameSolidificationStuff @a741a). This is 4.0.5's computerSetup.
const computerSetup = W.computerSetup;

// ---------- galaxy (CreateGalaxy @f0004 and the GiveGalaxy...Coords routines) ----------
// CONFIRMED: the same generator as 4.0.5 (6 styles, 5 sizes, Dense/Sparse, whole
// light-years, the same star counts and distance), except that the map is shifted
// to start 2 ly from the left and 4 ly from the top (ConformCoordinates @f1fb6).
function makeGalaxy(G, opts, nPlayers) {
  const gal = W.SHAPES.includes(opts.shape) && opts.shape === 'circle' ? circleGalaxy(G, opts, nPlayers) : W.makeGalaxy(G, opts, nPlayers);
  for (const q of gal.pts) { q.x -= 1; q.x10 -= 20; } // 4.0.5 leaves 4 ly; 2 ly = 1 map unit
  return gal;
}
// CONFIRMED (GiveGalaxyCircleCoords @f1032): 4.0.5's Circle (rings 4 ly apart
// Dense, 6 Sparse; r x 44 / cap + 1 stars a ring; 20 tries at +-1 ly), except
// the last ring: when fewer stars are left than it has places, and no more
// than a quarter ring's worth (90 / step), 3.0.1 goes back and lays the last
// 90 / step stars out again, evenly round that ring. (Ring, Random, Grid,
// Spiral and Cluster are 4.0.5's: GiveGalaxyRingCoords @f12c0 and the others.)
// The star count, home stars (AllocateHomeStars @f1d7e) and the 4 ly shift
// are 4.0.5's, as in W.makeGalaxy.
const COUNT = { small: [20, 12], medium: [32, 16], large: [48, 20], xl: [68, 32] };
function sizeKey(v) {
  if (W.SIZES.includes(v)) return v;
  if (typeof v === 'number') return v < 20 ? 'small' : v < 45 ? 'medium' : v < 65 ? 'large' : v < 90 ? 'xl' : 'huge';
  return 'medium';
}
function wdist(a, b) {
  const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
  return trunc((10 * Math.max(dx, dy) + 3 * Math.min(dx, dy) + 9) / 10);
}
function circleGalaxy(G, opts, nPlayers) {
  const size = sizeKey(opts.size);
  const sparse = opts.density === 'sparse' || (typeof opts.density === 'number' && opts.density >= 50);
  const n = size === 'huge' ? RI(G, 101, 190) : RI(G, 1, COUNT[size][1]) + COUNT[size][0];
  const step = sparse ? 6 : 4, cap = sparse ? 49 : 35;
  const P = [];
  for (let i = 0; i < n; i++) P.push({ x: 0, y: 0 });
  const okFwd = (i) => { for (let j = 0; j < i; j++) if (wdist(P[j], P[i]) < 4) return false; return true; };
  let r = 0, c = 0;
  while (c < n) { c += trunc(r * 44 / cap) + 1; r += step; }
  const S = (trunc(((r + step) * 2 - 1) / 3) + 1) * 3;
  const cos100 = (a) => trunc(100 * Math.cos(a * Math.PI / 180)), sin100 = (a) => trunc(100 * Math.sin(a * Math.PI / 180));
  let idx = 0;
  for (r = 0; idx < n; r += step) {
    let as = trunc(360 / (trunc(r * 44 / cap) + 1));
    if (n - idx < trunc(360 / as)) {
      const q = trunc(90 / as);
      if (q > 0 && n - q <= idx) idx = n - q;
      as = trunc(360 / (n - idx));
    }
    for (let a = 0; a < 360 && idx < n; a += as) {
      for (let t = 0; t < 20; t++) {
        P[idx].x = (S >> 1) + trunc(cos100(a) * r / 100) + RI(G, -1, 1);
        P[idx].y = (S >> 1) + trunc(sin100(a) * r / 100) + RI(G, -1, 1);
        if (okFwd(idx)) { idx++; break; }
      }
    }
  }
  // home stars for all 20 player slots, at least 20 ly apart if possible, relaxing 4 ly at a time
  let homes = [];
  for (let slot = 0; slot < Math.min(20, n); slot++) {
    let pickd = -1;
    for (let minD = 20; minD >= 0 && pickd < 0; minD -= 4) {
      for (let t = 0; t < 25; t++) {
        let cand = -1;
        for (let u = 0; u < 20; u++) { const v = RI(G, 0, n - 1); if (!homes.includes(v)) { cand = v; break; } }
        if (cand < 0) cand = [...Array(n).keys()].find(v => !homes.includes(v));
        if (homes.every(hh => wdist(P[hh], P[cand]) >= minD)) { pickd = cand; break; }
      }
    }
    homes.push(pickd);
  }
  homes = homes.slice(0, nPlayers);
  const minX = Math.min(...P.map(q => q.x)), minY = Math.min(...P.map(q => q.y));
  for (const q of P) { q.x += 4 - minX; q.y += 4 - minY; }
  const S2 = Math.max(Math.max(...P.map(q => q.x)), Math.max(...P.map(q => q.y)) + 2) + 3;
  return { W: S2 / 2, H: S2 / 2, pts: P.map(q => ({ x: q.x / 2, y: q.y / 2, x10: q.x * 10, y10: q.y * 10 })), homes };
}

// ---------- money ----------
// CONFIRMED (ComputeIncomeAndPopulation @a3bba, DipIntoSavings @f41cc):
// Ship Savings earn 10 x whole sqrt(savings); debt costs 15%. No cap, no bonus.
function interestOn(p, sav) {
  if (sav < 1) return trunc(sav * 15 / 100);
  return 10 * isqrt(sav);
}
// CONFIRMED (TerraformMineStars @a129a): terraforming moves sqrt(money / 2)
// tenths of a degree (3/5 of the money with the radical bonus); the overshoot is
// refunded at 2 x d^2 (5/3 x d^2)
const terraStep = (p, money) => isqrt(p.flags.terra ? trunc(money / 5) * 3 : trunc(money / 2));
const terraCost = (p, d) => p.flags.terra ? trunc(d * d * 5 / 3) : 2 * d * d;
// CONFIRMED (TerraformMineStars, MetalToMoney @13676): mining gives 15 x whole
// sqrt(money) metal (18 x with the radical bonus); a mined-out planet refunds the
// unneeded money, ceil(m^2 / 225) (/ 324)
const mineMetal = (p, money) => isqrt(Math.max(0, money)) * (p.flags.mining ? 18 : 15);
function mineMoney(p, m) {
  const k = p.flags.mining ? 324 : 225;
  return m < 30001 ? trunc((m * m + k - 1) / k) : trunc((m + k - 1) / k) * m;
}
// CONFIRMED (ComputeIncomeAndPopulation): income uses the log of the whole
// square root of the population (5.0.5: the exact root)
function incomeU(u, H) {
  const mult = u > 0 ? Math.max(1, Math.log(isqrt(u) || 1)) : 1;
  return trunc(u * mult / 76) - trunc(7500 + u * (100 + H / 40) / 10000);
}

// ---------- research (SpendTechMoney @a1ed2) ----------
// CONFIRMED: points = whole sqrt(money / divisor) x 8/10 (Radical: / 2);
// divisors Range 120, Speed/Weapons/Shields 150, Mini/Radical 200. Level costs
// Range L^2, Speed (L+6)^2, Weapons/Shields (L+2)^2, Mini/Radical (L+7)^2. No
// research facility and no clamp of progress.
function techLevelCost(k, L) {
  if (k === 'range') return L * L;
  return O.techLevelCost(k, L);
}
const DIV = { range: 120, speed: 150, weapons: 150, shields: 150, mini: 200, radical: 200 };
function research(G, p, spend) {
  let tot = 0; for (const k of TECHS) tot += p.talloc[k] || 0;
  if (tot <= 0) return;
  const old = Object.assign({}, p.tech);
  for (const k of TECHS) {
    const s = trunc(spend * (p.talloc[k] || 0) / tot);
    const r = isqrt(trunc(s / DIV[k]));
    let pts = k === 'radical' ? trunc(r / 2) : trunc(r * 8 / 10);
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100;
      const cost = techLevelCost(k, L);
      const need = trunc(frac * cost / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += cost > 0 ? trunc(pts * 100 / cost) : 100; pts = 0; }
    }
  }
  for (const k of TECHS) {
    const lvl = trunc(p.tprog[k] / 100);
    if (old[k] < lvl && old[k] < 50) {
      p.tech[k] = lvl;
      if (k === 'radical') { msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010' }); radical(G, p); continue; }
      O.techMsg(G, p, k);
      const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k);
    }
  }
}
// CONFIRMED (SpendTechMoney): the reminder comes every turn with no tech money
const idleTech = (G, p, D) => p.human && !(p.budget.tech > 0);

// ---------- radical discoveries (DoSomethingRadical @a5d4e) ----------
// CONFIRMED: no hand of pending discoveries; each new Radical level rolls
// 0-99: < 10 metal, < 20 astronomers, < 40 a one-time bonus (mining, maximum
// population, terraforming or smarter generals), < 50 steal tech, < 60 free
// designs (only with fewer than 17 designs), otherwise a tech jumps 2 levels.
function radical(G, p) {
  const say = (t, icon) => msg(G, p.id, t, { icon: icon || 'm9010', sound: 7007 });
  for (let guard = 0; guard < 50; guard++) {
    const r = RI(G, 0, 99);
    const live = p.designs.filter(d => !d.scrapped).length;
    if (r < 10) { // 1,000-3,000 metal, shown divided among your colonies
      const m = RI(G, 1000, 3000), n = colonies(G, p.id).length;
      p.metal += m;
      say(`Your mining consortium has just been able to extract an additional ${fmt(n < 1 ? m : trunc(m / n))} metal from every planet you have.`, 'm9046');
      return;
    }
    if (r < 20) { // 6-9 stars not seen in the last 100 years, walking on from a random star
      let n = RI(G, 6, 9), i = RI(G, 0, G.stars.length - 1);
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018');
      for (let c = 0; n > 0 && c < G.stars.length; c++) {
        const s = G.stars[i], k = know(G, p, s.id);
        if (!s.nova && (!k.explored || k.seen < G.turn - 10)) { observe(G, p, s.id); n--; }
        i = (i + 1) % G.stars.length;
      }
      return;
    }
    if (r < 40) { // five tries at a bonus you don't have; the first try only before 3000
      const FL = ['mining', 'pop', 'terra', 'generals'];
      const TEXT = {
        mining: ['Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.', 'm9046'],
        pop: ['Your sociologists have discovered how to safely increase the maximum population of your planets!', 'm9044'],
        terra: ['Your climatologists have discovered how to terraform planets more efficiently.', 'm9045'],
        generals: ['Your military training program has improved. Your generals are now smarter.', 'm9041'],
      };
      for (let t = 0; t < 5; t++) {
        const k = FL[RI(G, 0, 3)];
        if (!p.flags[k] && (t !== 0 || G.year < 3000)) { p.flags[k] = true; say(TEXT[k][0], TEXT[k][1]); return; }
      }
      continue;
    }
    if (r < 50) { // steal: the best level of each tech, from a random one round
      const order = ['range', 'speed', 'weapons', 'shields', 'mini'];
      const s0 = RI(G, 0, 4);
      for (let j = 0; j < 5; j++) {
        const t = order[(s0 + j) % 5];
        // CONFIRMED: from the Compare Players table, where players who are out are -1
        let best = null; for (const q of G.players) if (q.id !== p.id && q.alive && !q.surrendered && q.tech[t] > p.tech[t] && (!best || q.tech[t] > best.tech[t])) best = q;
        if (best) {
          p.tech[t] = best.tech[t]; say(`Your spies have stolen some technological secrets from ${best.name}!`, 'm9040'); O.techMsg(G, p, t);
          const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, t); // the computers read the level report
          return;
        }
      }
      continue;
    }
    if (r < 60 && live < 17) { // four free designs at your tech
      for (const type of ['scout', 'fighter', 'satellite', 'colony']) {
        const d = findOrCreateDesign(G, p, aiSpec(p, type)); if (d.built === 0) d.free = true;
      }
      say('Your ship technicians have designed a set of new ships with no development cost.', 'm9047');
      return;
    }
    const k = ['range', 'speed', 'weapons', 'shields', 'mini'][RI(G, 0, 4)];
    p.tech[k] = Math.min(50, p.tech[k] + 2);
    msg(G, p.id, `Your ${{ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k]} technology just jumped to ${p.tech[k]}.`, { icon: { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' }[k], sound: 7007, tech: k });
    return;
  }
}

// ---------- ships (CalcShipCosts @134de6) ----------
// CONFIRMED: the hit table is resource MaTh 1002 "Weapon Ratios" (the same
// numbers as DOS 2.0's WPNRAT), indexed by W - S + 25, clamped to 0..50.
const HIT = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 8, 10, 15, 25, 50,
  74, 84, 89, 91, 93, 94, 95, 95, 96, 96, 96, 96, 97, 97, 97, 97, 97, 97, 97, 97, 97, 98, 98, 98, 98];
const hit = (d) => HIT[clamp(d + 25, 0, 50)];
// CONFIRMED: B = (R+10)(V+15)(W+13)(S+17) / 38.75 (as 4.0.5); a Satellite's B is
// 2.381 (W+13)(S+26), half of 4.0.5/5.0.5's. Price mm x B, metal B / 3mm, hit
// points B / 3, prototype 2 mm^2 B (5.0.5: 4 mm^2 B); a Colony Ship adds
// $45,000, 3,000 metal and 1,000 hit points, prototype 2 mm (price).
// The attack rating, which only the computer players use, is
// max(W^2 (hp/50), W^2 hit(W)(5W+20)/300), with no / 50 (5.0.5 divides it).
function designCost(G, d) {
  const M = Math.max(0, d.M | 0), Rr = Math.max(0, d.R | 0), V = d.V | 0, Wp = d.W | 0, S = d.S | 0;
  const mm = (M + 1) / 2 + 0.5;
  const B = d.type === 'satellite' ? 2.381 * (Wp + 13) * (S + 26) : (Rr + 10) * (V + 15) * (Wp + 13) * (S + 17) / 38.75;
  let money, proto, metal, hp;
  if (d.type === 'colony') {
    money = trunc(mm * B + 45000); proto = trunc(2 * mm * (mm * B + 45000));
    metal = trunc(B / (3 * mm) + 3000); hp = trunc(B / 3 + 1000);
  } else {
    money = trunc(mm * B); proto = trunc(2 * mm * mm * B);
    metal = trunc(B / (3 * mm)); hp = trunc(B / 3);
  }
  const a = Wp * Wp * trunc(hp / 50);
  const b = trunc(Wp * Wp * hit(Wp) * (5 * Wp + 20) / 300);
  const att = Math.max(a, b);
  return { money, metal, proto: Math.max(0, proto - money), protoTotal: proto, hp: Math.max(1, hp), att };
}
// CONFIRMED (SetSBMinMax @132792): Range 3..tech (Scout +2; Satellite 0),
// Speed 1..tech (a Satellite's is fixed at your Speed), Weapons and Shields
// 1..tech (Scout -1), Mini 0..tech
function designLimits(G, p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 2; L.W = Math.max(1, t.weapons - 1); L.S = Math.max(1, t.shields - 1); }
  if (type === 'satellite') L.R = 0;
  return L;
}
// CONFIRMED (SetSBMinMax): the smallest values, Range 3 (Satellite 0), Speed 1
// (a Satellite's is your Speed), Weapons and Shields 1, Mini 0
function designMin(G, k, type) {
  if (k === 'M') return 0;
  if (k === 'R') return type === 'satellite' ? 0 : 3;
  if (k === 'V' && type === 'satellite' && G.players[G.cur || 0]) return G.players[G.cur || 0].tech.speed;
  return 1;
}
// CONFIRMED (BuildAFleet @92fc2): Dumb and Average computers pay development
// costs, Smart and Diabolical don't (5.0.5: only Dumb pays)
const paysPrototype = (G, p) => p.human || !p.ai || p.ai.iq < 3;
// CONFIRMED (CalcOneGroup @e17e4, HaveGroupShoot @e1cc2): every ship, satellites
// too, fires once a round; the planet once (4.0.5 doubled satellites)
const shotsPerShip = () => 1;
const planetShots = () => 1;

// ---------- the turn ----------
// CONFIRMED (ComputeIncomeAndPopulation @a3bba): a meteor shower kills
// metal x 50 units and nobody escapes onto colony ships
function meteors(G, p) {
  if (!G.meteors) return;
  for (const s of colonies(G, p.id)) {
    const m = G.meteors[s.id]; if (!m) continue;
    const kill = Math.min(popU(s), m * 50);
    setPopU(s, popU(s) - kill);
    msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: s.id });
    if (popU(s) <= 0) { msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: s.id }); s.owner = -1; s.pop = 0; }
  }
}
const OPT = { research, idleTech, meteors, interestOn, terraStep, terraCost, mineMetal, mineMoney, incomeU, terraWarnAlways: true };
// ---------- colonies ----------
// CONFIRMED (ColonizeStar @a566a, DecolonizeStar @a5ac0): a player's colonies
// are kept newest first, after the Ship Savings and Technology slots; the
// computer players go through them in that order.
function colOrder(G, p) {
  const own = (p.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  for (const s of colonies(G, p.id)) if (!own.includes(s.id)) own.push(s.id);
  return own;
}
// CONFIRMED (ColonizeStar): 10 colonists a colony ship; terraform 900 / mine
// 100 (all mining when gravity is more than 2.56 times home's); nothing to
// terraform at home's temperature; a $7,500 share when Total Money is over
// $20,000 (as 5.0.5)
function settle(G, p, s, f) {
  O.settle(G, p, s, f);
  s.abandon301 = false;
  p.colOrder = [s.id].concat((p.colOrder || []).filter(x => x !== s.id));
}
// CONFIRMED (AddColonySupportActions @90356, MaintainKillStars @a10c8): a
// computer marks a colony to be abandoned; it goes at the start of the next
// money step, "You have abandoned %s." (STR# 1000.9)
function abandon(G, p, sid) { G.stars[sid].abandon301 = true; }
function abandonMarked(G, p) {
  for (const s of colonies(G, p.id)) {
    if (!s.abandon301) continue;
    s.abandon301 = false; s.owner = -1; s.pop = 0;
    delete p.budget.col[s.id];
    msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9013', star: s.id });
  }
}

// ---------- routes (DeterminePath @130686, GiveFleetPath @130dc0, CheckFleetDestination @a2b8e) ----------
// CONFIRMED: a fleet sent where it hasn't the fuel to fly straight goes by
// way of your own colonies (not ones being abandoned): the first hop within the
// fuel it has left, the others within its Range; a colony from which the
// destination is in Range ends the route; at most 42 / Range stops; the
// shortest such route (fewest stops among equals), if it is under three times
// the direct distance. The route is planned again at every stop (on arrival
// and before leaving); if there is none any more the fleet stops there:
// "Your %s can no longer reach %s." (STR# 1000.21).
function path301(G, pid, from, to, fuel, R) {
  if (from == null || to == null || from < 0 || to < 0) return null;
  const direct = E.starDist(G, from, to);
  if (direct < 3) return [];
  if (direct <= fuel) return [to];
  const p = G.players[pid];
  const maxHops = R > 0 ? trunc(42 / R) : 1;
  const nodes = colOrder(G, p).filter(sid => sid !== from && sid !== to && !G.stars[sid].abandon301);
  const last = (v) => { const d = E.starDist(G, v, to); return d <= R ? d : 0; };
  let best = null, layer = [];
  for (const v of nodes) { const d = E.starDist(G, from, v); if (d <= fuel) layer.push({ v, d, path: [v] }); }
  for (let h = 1; h <= maxHops && layer.length; h++) {
    const next = new Map();
    for (const u of layer) {
      const l = last(u.v);
      if (l) { // this colony reaches the destination: the route ends here
        const tot = u.d + l;
        if (tot < 3 * direct && (!best || tot < best.d || (tot === best.d && h < best.h))) best = { d: tot, h, path: u.path.concat([to]) };
        continue;
      }
      if (h >= maxHops) continue;
      for (const v of nodes) {
        if (u.path.includes(v)) continue;
        const d = E.starDist(G, u.v, v);
        if (d > R) continue;
        const nd = u.d + d, o = next.get(v);
        if (!o || nd < o.d) next.set(v, { v, d: nd, path: u.path.concat([v]) });
      }
    }
    layer = [...next.values()];
  }
  return best ? best.path : null;
}
function route(G, f, sid) {
  const r = path301(G, f.owner, f.star, sid, f.fuel, E.fleetMaxRange(G, f));
  if (r && r.length) f.routeTo = sid;
  return r;
}
function givePath(G, f, r) {
  if (!r || !r.length) { f.dest = null; f.path = null; return; }
  f.dest = r[0]; f.path = r.length > 1 ? r.slice(1) : null; f.routeTo = r[r.length - 1];
}
function replan(G, p) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.routeTo == null) continue;
    const stops = (f.dest != null ? [f.dest] : []).concat(f.path || []);
    const fin = stops[stops.length - 1];
    if (stops.length < 2 || fin !== f.routeTo) continue;
    const r = path301(G, p.id, f.star, fin, f.fuel, E.fleetMaxRange(G, f));
    if (r == null) {
      msg(G, p.id, `Your ${E.fleetLabel(G, f)} can no longer reach ${G.stars[fin].name}.`, { icon: 'm9038', star: f.star });
      f.dest = null; f.path = null; f.routeTo = null;
    } else { f.dest = null; f.path = r.length ? r : null; }
  }
}

// ---------- fleets ----------
// CONFIRMED (BuildAShip @132e04, BuildAFleet @92fc2): a fleet holds one design.
// New Fighters and Satellites join a fleet of the same design at the star that
// has no orders (a human's only if it was built this turn); each Scout and
// Colony Ship is a fleet of its own. 3.0.1 lets fleets be grouped to move
// together; the remake's fleets of several designs are such groups (the
// group moves at the slowest one's speed and the shortest Range, GiveFleetPath).
function fleetFor(G, pid, sid, d) {
  if (d.type !== 'fighter' && d.type !== 'satellite') return null;
  const human = G.players[pid].human && !G.players[pid].auto;
  return G.fleets.find(x => x.owner === pid && x.star === sid && x.to == null && x.dest == null && !x.path &&
    Object.keys(x.ships).every(k => +k === d.id) && (!human || x.newThisTurn)) || null;
}

// ---------- money ----------
// CONFIRMED (DipIntoSavings @f41cc): Dip Into Savings moves an amount from
// Ship Savings, up to Ship Savings minus the borrowing limit, into this turn's
// money at once, and the interest is worked out again on what is left. Once:
// the next turn starts with nothing dipped. The remake's Dip window gives a
// percentage; here it is a percentage of that most.
const dipMax = (G, p) => Math.max(0, p.savings - O.borrowLimit(G, p));
const dipAmt = (G, p) => p.dip > 0 ? trunc(dipMax(G, p) * Math.min(100, p.dip) / 100) : 0;
function projected(G, p) {
  const dip = p.dip; p.dip = 0;
  const r = O.projected(G, p);
  p.dip = dip;
  const a = dipAmt(G, p);
  return Object.assign(r, { dip: a, net: r.net + a });
}
function economy(G, p) {
  abandonMarked(G, p);
  // CONFIRMED (BuildAShip, DipIntoSavings): buying a ship or dipping works the
  // interest out again on the Ship Savings left (a computer's buying doesn't:
  // BuildAFleet @92fc2)
  const bought = (p.spentThisTurn || []).length - (p.ai && p.ai.built || 0);
  if (p.ai) p.ai.built = 0;
  const amt = dipAmt(G, p);
  p.dip = 0;
  if (amt > 0) p.savings -= amt;
  if (amt > 0 || (p.human && bought > 0)) p.oInterest = interestOn(p, p.savings);
  p.oInterest = (p.oInterest || 0) + amt;
  O.economy(G, p, OPT);
  replan(G, p);
}

// ---------- arrivals ----------
// CONFIRMED (MoveShips @a26ac, ColonizeAndExplore @a4414): the owner hears of a
// fleet stopping on the way (STR# 1000.23) and of one reaching an explored
// star (1000.22); another player hears of a fleet arriving only if it is an
// ally's and the star is their colony or they have ships there (1000.24).
function arrivalSays(G, p, f, s) {
  if (f.path && f.path.length) return true;
  return s.owner >= 0 || !E.fleetHas(G, f, 'colony');
}
function fleetArrives(G, f) {
  if (!O.fleetArrives(G, f)) return false;
  if (G.arr301T !== G.turn) { G.arr301 = []; G.arr301T = G.turn; }
  if (!(f.path && f.path.length) && G.stars[f.star].owner !== f.owner) G.arr301.push({ o: f.owner, sid: f.star, label: E.fleetLabel(G, f) });
  return true;
}
function afterMovement(G, p) {
  // CONFIRMED (GetOtherScrapMetal @a3abe, msg 1000.115): metal scrapped over your colony
  if (G.recv && G.recv.length) for (const r of G.recv.filter(x => x.to === p.id)) {
    p.metal += r.metal;
    msg(G, p.id, `You just received ${fmt(r.metal)} metal from someone scrapping a fleet over ${G.stars[r.sid].name}.`, { icon: 'm9046', star: r.sid });
  }
  if (G.recv) G.recv = G.recv.filter(x => x.to !== p.id);
  for (const a of G.arr301T === G.turn ? G.arr301 : []) {
    if (a.o === p.id || !E.isAllied(G, a.o, p.id)) continue;
    if (G.stars[a.sid].owner === p.id || G.fleets.some(f => f.owner === p.id && f.star === a.sid && f.to == null))
      msg(G, p.id, E.report(26, G.players[a.o].name, a.label, G.stars[a.sid].name), { icon: 'm9038', star: a.sid });
  }
  O.afterMovement(G, p, OPT);
  replan(G, p);
}

// ---------- battles ----------
// CONFIRMED (CalculateGroups @e1614, CalcOneGroup @e17e4): in each duel a
// side's ships are cut into groups of at most N ships of one design, each
// group a target of its own. N starts at a fifth of the side's ships (at
// least 1) and grows until the side has no more than 5 groups (counting the
// planet), or one group a design; with 5 or more designs N is the whole side.
// Both sides use the larger N.
function splitGroups(G, A, B) {
  const sizeOf = (side, bound) => {
    const ships = side.filter(g => !g.planet && g.n > 0), planet = side.length - ships.length > 0 ? 1 : 0;
    const total = ships.reduce((a, g) => a + g.n, 0);
    if (ships.length >= 5) return Math.max(1, total);
    let sz = Math.max(1, trunc((total + 4) / 5));
    const count = (k) => ships.reduce((a, g) => a + Math.ceil(g.n / k), 0) + planet;
    for (let c = count(sz); (c < 1 || c > 5) && ships.length + bound < c; c = count(sz)) sz++;
    return sz;
  };
  const N = Math.max(sizeOf(A, 0), sizeOf(B, 1));
  const cut = (side) => {
    const out = [];
    for (const g of side) {
      if (g.planet || g.n <= 0) { out.push(g); continue; }
      const alive = g.units.slice(g.ui);
      for (let i = 0; i < g.n; i += N) {
        const k = Math.min(N, g.n - i);
        out.push(Object.assign({}, g, { parent: g, n: k, n0: k, units: alive.slice(i, i + k), ui: 0, dmg: 0, tgt: null }));
      }
    }
    return out;
  };
  return [cut(A), cut(B)];
}
// What a player learns from a battle (MakeResultMessages @e2ea2): the year,
// and four strength estimates the computers use (knowledge +0x12 e16: the
// force to beat there; +0x16 e1a: what it shows to stars within reach; +0x1a
// e1e: the threat to your own colony; +0x1e e22: what it shows to your
// colonies within reach; +0x26 pop: the planet's population seen).
function x301(G, p, sid) { const k = know(G, p, sid); return k.x301 || (k.x301 = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0, pop: 0 }); }
const att301 = (G, d) => d ? designCost(G, d).att : 0;
function battle(G, sid) {
  const s = G.stars[sid], pop0 = s.owner >= 0 ? popU(s) : 0, holder = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  const res = W.battle(G, sid);
  if (!res) return res;
  const { ownerIds, survivors, planetOwner, planetDied, rec } = res;
  const AI = E.aiOf(G), Y = G.year + 10;
  const ships0 = {}; for (const u of rec.start) ships0[u.o] = (ships0[u.o] || 0) + 1;
  const left = {};
  rec.start.forEach((u, i) => { if (!rec.end[i]) return; const L = left[u.o] || (left[u.o] = {}); L[u.t] = (L[u.t] || 0) + att301(G, E.getDesign(G, u.o, u.did)); });
  const power = (os, t) => os.reduce((a, o) => a + Object.entries(left[o] || {}).reduce((b, [k, v]) => b + (t == null || k === t ? v : 0), 0), 0);
  const W0 = planetOwner >= 0 ? G.players[planetOwner].tech.weapons : 0;
  const pp = pop0 > 0 ? trunc(trunc((pop0 + 49) / 50) * (W0 + 2) * (W0 + 2) / 75) : 0;
  const rounds = rec.rounds.length;
  const standing = (o) => (survivors[o] || 0) > 0 || (o === planetOwner && !planetDied);
  for (const o of ownerIds) {
    const p = G.players[o], k = x301(G, p, sid), foes = ownerIds.filter(x => x !== o && !E.isAllied(G, x, o));
    if (!foes.length) continue;
    k.by = Y;
    const won = standing(o) && !foes.some(standing);
    const defender = o === holder && pop0 > 0;
    // feelings: the attacked dislike their attackers (a little if they came with one ship)
    for (const x of foes) {
      let d;
      if (!defender || won) d = (ships0[x] || 0) === 1 ? RI(G, -30, -10) : RI(G, -200, -100);
      else d = p.ai && p.ai.att && p.ai.att[x] > 500 ? -p.ai.att[x] : RI(G, -400, -200);
      if (AI.modifyAlliances) AI.modifyAlliances(G, p, x, d);
    }
    if (defender) {
      k.pop = 0;
      // a computer that was attacked puts more of its metal into defence
      if (p.ai && p.ai.v301 && !p.human && p.ai.style !== 2) {
        if (!won) p.ai.metalDef = clamp(p.ai.metalDef + 10, 60, 99);
        if (p.ai.metalDef < 70) p.ai.metalDef = clamp(p.ai.metalDef + 5, 30, 99);
      }
      if (won) {
        k.e16 = 0; k.e1a = 0; k.e22 = 0;
        const all = power([o]), fi = power([o], 'fighter'), r = RI(G, 1, 5);
        if (r < 3 && rounds > 1) k.e1e = all - fi;
        else if (r < 5) k.e1e = trunc((all - fi) / 10);
      } else {
        const all = power(foes);
        k.e16 = all + 1; k.e1a = RI(G, 1, 3) === 1 ? 0 : all; k.e1e = 0; k.e22 = all;
        if (AI.note) for (const x of foes) AI.note(G, p, { code: 0x3f2, by: x });
      }
    } else if (won) {
      k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
      if (AI.note) for (const x of foes) if (!(ships0[x] > 0)) AI.note(G, p, { code: 0x407, other: x });
    } else {
      k.pop = pop0;
      k.e16 = power(foes) + pp + 1;
      if (RI(G, 1, 2) === 1 && pop0 > 0) k.e16 -= power(foes, 'fighter') + power(foes, 'scout') - 1;
      k.e1a = RI(G, 1, 3) === 1 && pop0 < 100 ? 0 : power(foes, 'satellite') + pp;
      k.e1e = 0;
      k.e22 = power(foes, 'fighter') + power(foes, 'scout');
    }
  }
  return res;
}

// CONFIRMED (MakeResultMessages @e2ea2): the colony's owner hears "%s
// survived an enemy attack from %s. You lost %d of your ships. %s lost %d.
// You lost %s people." (1000.34), or "%s destroyed your colony at %s. You
// lost %d of your ships. %s lost %d. You lost %s people." (1000.11); the
// winner and loser lines (1000.32-.33) are the engine's own wording
function battleText(G, sid, b, o, x) {
  if (o !== b.planetOwner) return null;
  const s = G.stars[sid];
  if (b.planetDied) return { text: `${x.enemies} destroyed your colony at ${s.name}. You lost ${x.myLoss} of your ships. ${x.enemies} lost ${x.theirLoss}. You lost ${fmt(b.startPop * 1e6)} people.` };
  return { text: `${s.name} survived an enemy attack from ${x.enemies}. You lost ${x.myLoss} of your ships. ${x.enemies} lost ${x.theirLoss}. You lost ${fmt((b.startPop - s.pop) * 1e6)} people.` };
}

// ---------- surrender (SurrenderIfDesired @a1760, DoSurrenders @a482a) ----------
// CONFIRMED: at the start of the turn a surrendering player's colonies are
// given up, every fleet is scrapped where it is (the metal falls on the star,
// or rains on the next stop from hyperspace), and its Total Money plus Ship
// Savings (not below 0) and its metal are kept for the winner: "You have just
// surrendered (to %s)." (1000.91-.92), and to everyone else "%s has just
// surrendered (to %s)." (1000.89-.90). After the moves the winner gets the
// money into Ship Savings and the metal, and colonizes each of the stars
// nobody else has taken or has ships at, as a colony ship would (10 colonists,
// "You have colonized %s.").
function processSurrenders(G) {
  G.handovers = [];
  for (const p of G.players) {
    if (p.surrenderTo == null || !p.alive || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    const stars = colonies(G, p.id).map(s => s.id);
    for (const sid of stars) { const s = G.stars[sid]; s.owner = -1; s.pop = 0; }
    const h = { from: p.id, to, money: Math.max(0, (p.oInc || 0) + p.savings), metal: Math.max(0, p.metal), stars };
    for (const f of G.fleets.filter(f => f.owner === p.id)) E.scrapFleet(G, f);
    p.savings = 0; p.metal = 0; p.oInc = 0; p.oInterest = 0; p.surrendered = true; p.armageddon = false;
    for (const q of G.players) {
      if (q.id === p.id) msg(G, q.id, to >= 0 ? `You have just surrendered to ${G.players[to].name}.` : 'You have just surrendered.', { icon: 'p3040', sound: 7020 });
      else msg(G, q.id, to >= 0 ? `${p.name} has just surrendered to ${G.players[to].name}.` : `${p.name} has just surrendered.`, { icon: 'm9036' });
    }
    if (to >= 0) G.handovers.push(h);
  }
}
function processHandovers(G) {
  for (const h of G.handovers || []) {
    const q = G.players[h.to]; if (!q || !q.alive || q.surrendered) continue;
    q.savings += h.money; q.metal += h.metal;
    for (const sid of h.stars) {
      const s = G.stars[sid];
      if (s.owner >= 0 || G.fleets.some(f => f.star === sid && f.to == null && f.owner !== h.from && !E.isAllied(G, f.owner, q.id))) continue;
      observe(G, q, sid);
      settle(G, q, s, { colonists: 10 });
      observe(G, q, sid);
      msg(G, q.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: sid });
    }
  }
  G.handovers = [];
}

// ---------- alliances (ConformPlayerAlliances @a2f76, AreAllies @e09d2) ----------
// CONFIRMED: an alliance is two players who both want it. At the end of the
// turn each player still in the game hears of every change since the last:
// "%s has offered to ally with you." / "no longer wants to" (1000.78-.79),
// "You have offered to ally with %s." / "no longer want to" (.80-.81), and
// "You have formed an alliance with %s." / "Your alliance with %s is gone."
// (.82-.83), all that apply (5.0.5 tells only the alliance when one forms).
function pactNews(G) {
  const prev = G.pactPrev || {}, cur = {};
  for (const p of G.players) cur[p.id] = (p.allies || []).slice();
  const had = (snap, a, b) => !!(snap[a] && snap[a].includes(b));
  const live = (p) => p.alive && !p.surrendered;
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !live(p) || !live(q)) continue;
    const say = (n) => msg(G, p.id, E.report(n, q.name), { icon: 'm9024', quiet: n !== 88 });
    if (!had(prev, p.id, q.id) && had(cur, p.id, q.id)) say(90);
    if (had(prev, p.id, q.id) && !had(cur, p.id, q.id)) say(91);
    if (!had(prev, q.id, p.id) && had(cur, q.id, p.id)) say(88);
    if (had(prev, q.id, p.id) && !had(cur, q.id, p.id)) say(89);
    const was = had(prev, p.id, q.id) && had(prev, q.id, p.id), is = had(cur, p.id, q.id) && had(cur, q.id, p.id);
    if (is && !was) { say(92); (p.news = p.news || []).push({ type: 'allied', with: q.id }); }
    if (was && !is) { say(93); (p.news = p.news || []).push({ type: 'broken', with: q.id }); }
  }
  G.pactPrev = cur;
}

// ---------- the end of the game (DoGameEndStuff @a6d06, CheckForWinner @a731a, CheckEndGame @12085a) ----------
// CONFIRMED: every turn, a player with no colonies and no colony ships is out
// (its money and metal go to 0; its fleets stay where they are and still
// fight, but nobody gives them orders); "%s has just been eliminated from the
// game." / "You have just been eliminated from the game." (1000.66-.67). A
// player who is out but has a colony again is back. From 2010, when every
// player still in is allied with every other, the game is won: at once by a
// lone player, but an alliance must hold for one more turn ("Your alliance
// will win the game next turn if it holds!", 1000.106). "Congratulations! You
// won the game." / "%s has just won the game." (1000.69, .68).
function checkElimination(G) {
  const humans = E.humans(G);
  for (const p of G.players) {
    const out = !colonies(G, p.id).length && !G.fleets.some(f => f.owner === p.id && E.fleetHas(G, f, 'colony'));
    if (out) {
      p.savings = 0; p.metal = 0; p.oInc = 0;
      if (!p.alive) continue;
      p.alive = false;
      for (const q of humans) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    } else if (!p.alive && !p.surrendered && !G.over) p.alive = true;
  }
  if (!G.over && G.year + 10 >= 2010 && G.players.length > 1) {
    const alive = G.players.filter(p => p.alive && !p.surrendered);
    const allied = alive.length > 0 && alive.every(a => alive.every(b => E.isAllied(G, a.id, b.id)));
    if (!allied) G.allyWarn = false;
    else if (!G.allyWarn && alive.length > 1) {
      G.allyWarn = true;
      for (const q of alive) msg(G, q.id, 'Your alliance will win the game next turn if it holds!', { icon: 'p3030', sound: 2000 });
    } else {
      G.allyWarn = false;
      const hw = alive.find(p => p.human);
      G.over = true; G.winner = hw ? hw.id : alive[0].id; G.winners = alive.map(p => p.id);
      for (const q of humans) for (const w of alive) {
        if (w === q) msg(G, q.id, 'Congratulations! You won the game.', { icon: 'p3030', sound: 7021, big: 'p3030' });
        else msg(G, q.id, `${w.name} has just won the game.`, { icon: alive.includes(q) ? 'p3030' : 'p3040', sound: alive.includes(q) ? 7021 : 7020 });
      }
    }
  }
  // every human is out: the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
}

// ---------- names ----------
// CONFIRMED (DoGameSolidificationStuff @a741a, CreateNewPlayer @121fee): a
// computer is a man or a woman with even odds, named at random from STR# 1999
// or STR# 2000 (no two alike)
const MALE_NAMES = ['Peter', 'Joe', 'Timmer', 'Howard', 'Bob', 'Ed', 'Mike', 'Guy', 'Ben', 'Dan', 'Kon', 'Robert', 'Clinton',
  'Mike', 'Dave', 'Steve', 'Rosko', 'Willy', 'Jack', 'Albert'];
const FEMALE_NAMES = ['Christie', 'Suzy', 'Ann', 'Julia', 'Nancy', 'Xena', 'Athena', 'Heather', 'Caryl', 'Jennifer', 'Kathy',
  'Kate', 'Jane', 'Paula', 'Michelle', 'Iris', 'Pam', 'Liz', 'Alexis', 'Grace'];
// CONFIRMED (GiveTypeCoolName @95296): every new design, yours too, gets a
// name at random from STR# 2001-2004 by class that no design of yours has
// (up to 100 tries; then the last one tried)
const SHIP_NAMES = {
  scout: ['Needle', 'Explorer', 'Looker', 'Columbus', 'Magellan', 'Intrepid', 'Wanderer', 'Rudolph', 'Eagle', 'Sparrow', 'Ranger', 'Whisper', 'Weasel', 'Enterprise'],
  fighter: ['Killer', 'Destroyer', 'Demon', 'Hurricane', 'Typhoon', 'Slasher', 'Patton', 'Stingray', 'Blaster', 'Talon', 'Serpent', 'Dragon',
    'Tornado', 'Wraith', 'Storm', 'Dagger', 'Sword', 'Lance', 'Arrow', 'Constitution', 'Reliant', 'Panther', 'Nightmare'],
  colony: ['Spreader', 'Mother', 'Expander', 'Nina', 'Pinta', 'Santa Maria', 'Stork', 'Freedom', 'Kon Tiki', 'Minnow', 'Taurus', 'Minerva', 'Egg', 'Peaceful', 'Hardy'],
  satellite: ['Defender', 'Stopper', 'Protector', 'Eye', 'Armor', 'Shield', 'Peach', 'Caltrop', 'Washington', 'Gabriel', 'Sun Dog', 'Mercy',
    'Vision', 'Apple', 'Pebble', 'Rock', 'Stone', 'Berry'],
};
function designName(G, p, type) {
  const names = SHIP_NAMES[type] || ['Ship'];
  const used = new Set(p.designs.filter(d => !d.scrapped).map(d => d.name));
  let n = names[0];
  for (let i = 0; i < 100; i++) { n = names[RI(G, 1, names.length) - 1]; if (!used.has(n)) break; }
  return n;
}

// ---------- difficulty (AddToHall @144796) ----------
// CONFIRMED: the Hall of Fame's small rating: intelligence (Dumb 2, Average 4,
// Smart 5, Diabolical 7) + skill - 2 (Novice -2 ... Expert +2) - allies;
// +1 Small, -1 Humongous, -1 Sparse, -1 Spiral or Cluster, +1 with more than 8
// computers (unless Dumb), -1 with fewer than 4, another -1 with fewer than 2;
// each Armageddon halves it, rounding up. 5 with no computers.
function difficulty(o) {
  const n = o.computers | 0;
  if (!n) return 5;
  const iq = IQS.includes(o.iq) ? o.iq : 'average';
  let d = { dumb: 2, average: 4, smart: 5, diabolical: 7 }[iq] + (SKILLS[o.start] ? SKILLS[o.start].code : 2) - 2 - (o.allies | 0);
  if (o.size === 'small') d++;
  if (o.size === 'huge') d--;
  if (o.density === 'sparse') d--;
  if (o.shape === 'spiral' || o.shape === 'cluster') d--;
  if (n > 8 && iq !== 'dumb') d++;
  if (n < 4) d--;
  if (n < 2) d--;
  for (let i = 0; i < (o.armageddons || 0); i++) d = trunc((d + 1) / 2);
  return d;
}

// CONFIRMED: STR# 1003 "Star Names", 191 names (7 letters at most)
const STAR_NAMES = [
  'Sol', 'Sirius', 'Canopus', 'Vega', 'Rigel', 'Capella', 'Procyon', 'Mira', 'Altair', 'Antares', 'Spica',
  'Pollux', 'Castor', 'Deneb', 'Regulus', 'Polaris', 'Algol', 'Proxima', 'Alban', 'Thuban', 'Mizar', 'Alcor',
  'Doobie', 'Merak', 'Phad', 'Megrez', 'Alioth', 'Alkaid', 'Mintaka', 'Alnitak', 'Atlas', 'Remus', 'Alcyon',
  'Electra', 'Maia', 'Merope', 'Taygeta', 'Sterope', 'Hadar', 'Quark', 'Mimosa', 'Adhara', 'Shaula', 'Nath',
  'Almak', 'Alshain', 'Tarazed', 'Hamal', 'Izar', 'Shedir', 'Menkar', 'Diphda', 'Etamin', 'Acamar', 'Alhena',
  'Alphard', 'Arneb', 'Nihal', 'Saiph', 'Markab', 'Kansas', 'Enif', 'Nunki', 'Kokab', 'Ain', 'Ancha', 'Arkab',
  'Atik', 'Atria', 'Shadow', 'Azha', 'Baham', 'Beid', 'Botein', 'Caph', 'Coxa', 'Cursa', 'Dabih', 'Furud',
  'Gedi', 'Gienah', 'Heka', 'Keid', 'Maaz', 'Matar', 'Mirfak', 'Murzim', 'Delta', 'Ozworld', 'Okda', 'Phact',
  'Propus', 'Rana', 'Risha', 'Sabik', 'Petro', 'Syrma', 'Tarf', 'Wasat', 'Wazn', 'Yed', 'Yildun', 'Zaniah',
  'Zaurac', 'Zosma', 'Ylum', 'Arrakis', 'Akworld', 'Colma', 'Henry', 'Foundat', 'Trantor', 'Barsoom', 'Rover',
  'Fluffy', 'Lennon', 'Gorby', 'Atlanta', 'Chicago', 'Miami', 'Home', 'Binar', 'Nemesis', 'Harkon', 'Talos',
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Pisces', 'Canis', 'Ursa', 'Beta',
  'Zeta', 'Upsilon', 'Rho', 'Cepheus', 'Calvin', 'Hobbes', 'Pooh', 'Tigger', 'Bambi', 'Dumbo', 'Tweety',
  'Bugs', 'Torino', 'Denali', 'Woz', 'Sauron', 'Smaug', 'Thune', 'Thorin', 'Gollum', 'Fazaron', 'Trellor',
  'Regor', 'Basil', 'Ursula', 'Styx', 'Lentor', 'Sooltar', 'Romula', 'Vulcan', 'Paradox', 'Kessel', 'Redox',
  'Sith', 'Yavin', 'Quatro', 'Remulak', 'Kathoon', 'Thanos', 'Krypton', 'Darven', 'Gotham', 'Klah', 'Zaphod',
  'Turin', 'Vives', 'Timmer', 'Argot', 'Willy', 'Sirgil', 'Ender', 'Wobbler', 'Quayle', 'Hope'];

E.registerRules('301', Object.assign({}, O, {
  label: 'Mac 3.0.1 (1993)',
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '3.0.1', platform: 'Mac', year: 1993,
  ai: '301',               // its own computer players (js/ai-301.js)
  maxPlayers: 20,          // CONFIRMED (doCreateGalaxyDlg @f0550): 0-19 computers
  maxDesigns: MAX_DESIGNS,
  chatLimit: 10,           // CONFIRMED (STR# 1020.17): ten messages a turn
  plainTechMessages: true, // CONFIRMED (STR# 1000.3-7): "Your Range Technology has reached level N."
  // CONFIRMED: no stances, no "arrive late", no best buddies (no text or code)
  // arrival notices are sent by afterMovement (allies only, ColonizeAndExplore @a4414)
  features: { arrivalNotices: false, alliances: true, gifts: true, surrender: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  canBuild: (G, p, type) => TYPES4.includes(type),
  starNames: STAR_NAMES,
  SKILLS, HIT, hit, SHAPES: W.SHAPES, SIZES: W.SIZES, interestOn, techLevelCost, research, aiSpec,
  setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance: W.distance,
  designCost, designLimits, designMin, paysPrototype, shotsPerShip, planetShots,
  economy, afterMovement, projected, battle, splitGroups, battleText, randomEvents: W.randomEvents, scrapAt: W.scrapAt,
  mineMetal, mineMoney, terraCost, terraStep, incomeU,
  planetIncome: (G, p, s) => incomeU(popU(s), O.hab(p, s).H),
  difficulty, masterPoints: undefined,
  // fleets, routes and colonies
  fleetFor, route, path301, givePath, settle, colOrder, abandon, arrivalSays, fleetArrives,
  // diplomacy and the end of the game (engine hooks)
  processSurrenders, processHandovers, pactNews, checkElimination, checkEveryStep: true,
  maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES, femaleComputers: 0.5, shipNames: SHIP_NAMES, designName,
  x301, att301,
}));
})(this);
