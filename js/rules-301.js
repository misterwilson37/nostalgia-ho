// Spaceward Ho! web remake — the "Mac 3.0.1" ruleset.
//
// Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993, 68k) is the first
// colour version and comes after DOS / Windows 2.0. Its turn is 2.0's turn
// (EndTurn @a0004: for each player the computer plans, then the money, the
// terraforming and mining, the research and the moves; then every battle;
// then for each player income, colonizing and exploring), worked out with
// 2.0's arithmetic: per-mille budget slots used as they stand, with the
// $2,000,000 rule (share20), colony bars per mille with -1 for a finished
// part and RestoreStarsBars, a new colony's share found by 2.0's
// redistribution, a lost colony's share going to Savings with its colony
// ships loaded, battles fought as duels with a pair of reports each, routes
// planned again at every stop. So this ruleset is built over the "DOS 2.0"
// rules (js/rules-dos.js). What 3.0.1 changed on top of it is written here:
// Ship Savings that can go into debt and buy ships at once (no queues),
// interest on Ship Savings, the colonies' losses paid out of this turn's
// money, Radical tech, alliances, gifts, surrender, Armageddon and novas, luck
// in battle, its own costs, galaxy and end of the game. Its computer players
// are its own (js/ai-301.js).
//
// Labels: CONFIRMED (Name @address) = read from that 3.0.1 routine (its MacsBug
// name and address in the layout made by tools/decompile/mac68k.py). See
// docs/301-findings.md and docs/coverage-301.md (every routine of the program).
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, clamp, msg, fmt, colonies, know, observe, addShipsToStar, TECHS, getDesign, fleetCount, fleetDesigns, fleetMaxRange, isAllied } = E;
const D = E.RULESETS.dos, O = E.RULESETS.original, W = E.RULESETS['405'];
const { popU, setPopU, hab } = O;
const trunc = Math.trunc;
// the integer square root (thunk_FUN_00010ece: 0 for x <= 0)
const isqrt = (x) => x > 0 ? trunc(Math.sqrt(x)) : 0;
const g100 = (g) => Math.max(1, Math.round(g * 100));
const t10 = (t) => Math.round(t * 10);
const i16 = (x) => ((x & 0xffff) ^ 0x8000) - 0x8000;
const MAX_DESIGNS = 20; // CONFIRMED (DITL 3280: "only 20 ship types at one time")
const TYPES4 = ['scout', 'fighter', 'colony', 'satellite']; // CONFIRMED (STR# 1006, CalcShipCosts @134de6); class numbers 0-3
const CLASS = { scout: 0, fighter: 1, colony: 2, satellite: 3 };

// ---------- player setup (CreatePlayer @f26a0) ----------
// CONFIRMED: Skill Level from the Join dialog (DITL 4010): Total Money (player
// +0) and metal (+0x1c) by skill; the home colony's income (slot +6) and
// population (slot +0xa); Ship Savings (+0x10) and interest (+0x14) 0; the
// borrowing limit (+0x18) -5 x the money. Novice gets a Colony Ship and two
// Scouts, Beginner two Scouts.
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
  // player +0 (Total Money), +4 (gross income), +8 (net), +0x14 (interest)
  p.tm = st.inc; p.oInc = st.inc; p.net301 = st.inc; p.oInterest = 0; p.oRefund = 0; p.oD = 0;
  p.lastGross = p.oInc; p.lastIncome = p.oInc; p.lastNet = p.oInc;
  // CONFIRMED: tech 6/2/2/2/0/0 with a 0-40 (Radical 0-80) head start; research
  // split and budget from the Stup 1000 defaults (167.../650/250/100), as 5.0.5
  p.tech = { range: 6, speed: 2, weapons: 2, shields: 2, mini: 0, radical: 0 };
  p.tprog = {};
  for (const t of TECHS) p.tprog[t] = p.tech[t] * 100 + RI(G, 0, t === 'radical' ? 80 : 40);
  p.talloc = { range: 167, speed: 167, weapons: 167, shields: 167, mini: 166, radical: 166 };
  // CONFIRMED: three budget slots, Savings (star -2), Technology (star -1) and
  // the home colony, per mille from Stup 1000 (650 / 250 / 100)
  p.budget = { tech: 0.25, savings: 0.65, col: { [home.id]: 0.10 } };
  p.slots301 = ['sav', 'tech', home.id];
  // CONFIRMED: the home colony's bars are Terraform -1 (done) and Mine 1,000,
  // $5,000 already sunk into terraforming, class 4
  D.setBars20(home, -1, 1000, 0);
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
  if (type === 'scout') { spec.R += 2; spec.W -= 1; spec.S -= 1; }
  if (type === 'satellite') spec.R = 0;
  return spec;
}
// a design of 3.0.1's: always a new record, named at random (GiveTypeCoolName
// @95296); MaintainShipTypes and DoSomethingRadical never reuse an old one
function newDesign(G, p, spec) {
  const d = { id: G.nextId++, type: spec.type, R: spec.R, V: spec.V, W: spec.W, S: spec.S, M: spec.M, built: 0, name: designName(G, p, spec.type), free: false };
  p.designs.push(d);
  return d;
}
// CONFIRMED (CreatePlayer): Scout R8 V2 W1 S1, Satellite R0 V2 W2 S2, Colony
// Ship R6 V2 W2 S2, Fighter R6 V2 W2 S2, all Mini 0, in that order; no Tanker
function defaultDesigns(G, p) {
  for (const type of ['scout', 'satellite', 'colony', 'fighter']) {
    const spec = aiSpec(p, type); spec.M = 0;
    newDesign(G, p, spec);
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
    if (st.colony) { const d = by('colony'); const f = addShipsToStar(G, p.id, home.id, d, 1); d.built++; f.colonists = 10; }
    for (let i = 0; i < st.scouts; i++) { addShipsToStar(G, p.id, home.id, by('scout'), 1); by('scout').built++; }
  }
}
// CONFIRMED (CreateNewPlayer @121fee, the jump table at 122128): a computer's
// skill comes from the intelligence, with no random step (4.0.5 has one):
// Dumb = Expert, Average = Advanced, Smart = Normal, Diabolical = Novice.
// CreatePlayer @f26a0 sets the money, metal, people and free ships from it
// when the computer is created. With several humans DoGameSolidificationStuff
// @a741a later copies a human's skill onto each computer (player +0x308), but
// only the skill shown and the difficulty rating read it again, so the
// computers keep the start their intelligence gave them.
const COMPUTER_START = { dumb: 'expert', average: 'advanced', smart: 'normal', diabolical: 'novice' };
function computerSetup(G, opts) {
  const iq = IQS.includes(opts.iq) ? opts.iq : 'average';
  return { start: COMPUTER_START[iq], iq };
}

// ---------- galaxy (CreateGalaxy @f0004 and the GiveGalaxy...Coords routines) ----------
// CONFIRMED: the same generator as 4.0.5 (6 styles, 5 sizes, Dense/Sparse, whole
// light-years, the same star counts and distance), except that the map is shifted
// to start 2 ly from the left and 4 ly from the top (ConformCoordinates @f1fb6).
function makeGalaxy(G, opts, nPlayers) {
  const gal = W.SHAPES.includes(opts.shape) && opts.shape === 'circle' ? circleGalaxy(G, opts, nPlayers) : W.makeGalaxy(G, opts, nPlayers, Math.PI);
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

// ---------- the order of things ----------
// CONFIRMED (CreateNewPlayer @121fee, EndTurn @a0004): 3.0.1 numbers the
// computers 0.. and the humans after them, and every loop of the turn goes
// through the players in that order. The remake numbers the humans first, so
// the turn's own loops here go computers first, then humans.
const order301 = (G) => G.players.filter(p => !p.human).concat(G.players.filter(p => p.human));
// CONFIRMED (NewFleet @130004): a player's fleet list is kept by class (Scouts,
// Fighters, Colony Ships, Satellites), a new fleet going in front of the others
// of its class. ColonizeAndExplore, the battles (ResolveVictorFleetsAtStar) and
// the computers go through the fleets in this order.
function fleetClass(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => CLASS[d.type] ?? 1)) : 0; }
function fleetList(G, p) {
  return G.fleets.filter(f => f.owner === p.id).sort((a, b) => fleetClass(G, a) - fleetClass(G, b) || b.id - a.id);
}

// ---------- the budget slots and the colony bars ----------
// CONFIRMED (every routine of the turn): a share of an amount M is
// trunc(M x pm / 1000) while M is under $2,000,000 and trunc(M / 1000) x pm
// above, the share used as it stands (TerraformMineStars @a1318-a1360,
// SpendTechMoney @a1f5a-a1fa2, ComputeIncomeAndPopulation @a3c1a-a3ca0): 2.0's
// rule (rules-dos share20)
const share20 = (M, pm) => !(pm > 0) ? 0 : M < 2000000 ? trunc(M * pm / 1000) : trunc(M / 1000) * pm;
const keyPm = (p, k) => Math.round(((k === 'sav' ? p.budget.savings : k === 'tech' ? p.budget.tech : p.budget.col[k]) || 0) * 1000);
const setKeyPm = (p, k, v) => { const f = v / 1000; if (k === 'sav') p.budget.savings = f; else if (k === 'tech') p.budget.tech = f; else p.budget.col[k] = f; };
// CONFIRMED (CreatePlayer @f26a0, ColonizeStar @a566a): the slots are
// Savings, Technology, then the colonies, the newest first (a new colony's
// slot goes in front of the colonies, after Savings and Technology)
function slots301(G, p) {
  if (!p.slots301) p.slots301 = ['sav', 'tech'].concat(colOrder(G, p));
  for (const s of colonies(G, p.id)) if (!p.slots301.includes(s.id)) p.slots301.splice(firstCol(p.slots301), 0, s.id);
  return p.slots301;
}
const firstCol = (L) => { let i = 0; while (i < L.length && typeof L[i] !== 'number') i++; return i; };
const colSlots = (G, p) => slots301(G, p).filter(k => typeof k === 'number');
// the colony order the computers use (newest first)
function colOrder(G, p) {
  if (p.slots301) return p.slots301.filter(k => typeof k === 'number' && G.stars[k].owner === p.id);
  const own = (p.colOrder || []).filter((sid, i, a) => G.stars[sid].owner === p.id && a.indexOf(sid) === i);
  for (const s of colonies(G, p.id)) if (!own.includes(s.id)) own.push(s.id);
  return own;
}
// a colony's two bars, Terraform and Mine, per mille, -1 for a finished part
// (slot +2, +4). The remake keeps them with 2.0's helpers (rules-dos bars20),
// with no Ship bar.
const bars = (s) => D.bars20(s);
const setBars = (s, T, X) => D.setBars20(s, T, X, 0);

// ---------- money ----------
// CONFIRMED (ComputeIncomeAndPopulation @a3bba, DipIntoSavings @f41cc,
// BuildAShip @132e04): Ship Savings earn 10 x whole sqrt(savings); debt costs
// 15% (savings x 15 / 100). No cap, no bonus.
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
// unneeded money, ceil(m^2 / 225) (/ 324), above 30,000 metal ceil(m / 225) x m
const mineMetal = (p, money) => isqrt(Math.max(0, money)) * (p.flags.mining ? 18 : 15);
function mineMoney(p, m) {
  const k = p.flags.mining ? 324 : 225;
  return m < 30001 ? trunc((Math.imul(m, m) + k - 1) / k) : Math.imul(trunc((m + k - 1) / k), m);
}
// CONFIRMED (ComputeIncomeAndPopulation): income uses the log of the whole
// square root of the population (5.0.5: the exact root)
function incomeU(u, H) {
  const mult = u > 0 ? Math.max(1, Math.log(isqrt(u) || 1)) : 1;
  return trunc(u * mult / 76) - trunc(7500 + u * (100 + H / 40) / 10000);
}
// CONFIRMED (ComputeIncomeAndPopulation): maximum population max(10, 500,000 -
// 12 H), +10% with the radical bonus (O.maxPopU)
const borrowLimit = (G, p) => -5 * Math.max(0, p.oInc || 0); // CONFIRMED (ComputeIncomeAndPopulation @a43b4, CreatePlayer): -5 x gross income

// ---------- the Compare Players table (SaveComparisonInfoOne @a65bc, SaveComparisonInfoTwo @a663c) ----------
// CONFIRMED: pass 1 writes each player's tech levels (rows 4-8) just before
// its fleets move; pass 2 writes its Total Money (row 0) and three other rows,
// or -1 in every row for a player who is out. Radical tech steals from it
// (DoSomethingRadical @a5d4e) and the computers read row 0 (ComputeStatus @93fa8).
function cmp(G) { return G.cmp301 || (G.cmp301 = {}); }

// =====================================================================
// Pass 1 (EndTurn @a0004, asm a02a0-a0596), for every player in turn. The
// computer plans first (DoComputerTurn; the engine runs every computer's
// before the money), then this.
// =====================================================================
const TECH_ORDER = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
function economy(G, p) {
  // CONFIRMED (EndTurn @a033e): report 1011 "Year %d:" (STR# 1000.12) opens
  // every player's reports
  if (p.human) msg(G, p.id, `Year ${G.year + 10}:`, { icon: 'm9024', quiet: true });
  if (G.step301 !== G.turn) {
    G.step301 = G.turn; G.bw301 = {}; G.big301 = {}; G.arr301 = []; G.present301 = {};
    // CONFIRMED (EndTurn @a03d0-a0400): the players' Armageddon switches as they
    // stood (galaxy +0x28c) are kept for the notices, and the mask is built
    // again in pass 1; a player who is out counts as on (@a0450)
    G.armPrev301 = G.armMask301 || {}; G.armMask301 = {};
  }
  if (p.armageddon || !p.alive) G.armMask301[p.id] = true;
  p.oRefund = 0;
  dipAndInterest(G, p);
  deductInterest(G, p);
  scrapFleetsAndTypes(G, p);
  maintainKillStars(G, p);
  terraformMineStars(G, p);
  spendTechMoney(G, p);
  // CONFIRMED (SaveComparisonInfoOne @a65bc): the player's tech levels
  cmp(G)[p.id] = Object.assign({}, cmp(G)[p.id] || {}, { tech: TECH_ORDER.slice(0, 5).map(k => p.tech[k]) });
  moveShips(G, p);
  for (const sid of colSlots(G, p)) restoreStarsBars(G, p, G.stars[sid]);
}
// CONFIRMED (DipIntoSavings @f41cc): Dip Into Savings moves an amount from
// Ship Savings, up to Ship Savings minus the borrowing limit, into this turn's
// money at once, and the interest is worked out again on what is left. The
// remake's Dip window gives a percentage; here it is a percentage of that most.
// CONFIRMED (BuildAShip @132e04): buying a ship works the interest out again
// on the Ship Savings left (a computer's buying, BuildAFleet @92fc2, doesn't).
const dipMax = (G, p) => Math.max(0, p.savings - borrowLimit(G, p));
const dipAmt = (G, p) => p.dip > 0 ? trunc(dipMax(G, p) * Math.min(100, p.dip) / 100) : 0;
function dipAndInterest(G, p) {
  const bought = (p.spentThisTurn || []).length - (p.ai && p.ai.built || 0);
  if (p.ai) p.ai.built = 0;
  const amt = dipAmt(G, p);
  p.dip = 0;
  p.tm = (p.tm || 0) + amt;
  if (amt > 0) p.savings -= amt;
  if (amt > 0 || (p.human && bought > 0)) p.oInterest = interestOn(p, p.savings);
}
// CONFIRMED (DeductInterest @a0e32): interest (player +0x14) is added to this
// turn's money; owed interest is paid from it, then from Ship Savings down to
// the borrowing limit ("Uh-oh! Having to borrow more ship money to pay all
// your interest!", 1000.107), then beyond it: "You don't have enough money!
// You're neglecting your planets! Global warming is taking place!" (.108):
// every colony's temperature moves RND(k, 2k) tenths away from yours, with
// k = owed / 500 (1..1,000), and a fleet picked at random, if it is at a star,
// is scrapped: "Due to a lack of funds, one of your fleets can't be
// maintained. It is being scrapped." (.109)
function deductInterest(G, p) {
  let M = p.tm || 0, I = p.oInterest || 0;
  if (I >= 1 || M >= -I) M += I;
  else {
    const avail = Math.max(0, p.savings - borrowLimit(G, p));
    I += M; M = 0;
    if (avail > 0) msg(G, p.id, 'Uh-oh! Having to borrow more ship money to pay all your interest!', { icon: 'm9020' });
    if (avail >= -I) p.savings += I;
    else {
      msg(G, p.id, 'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!', { icon: 'm9020', sound: 2001 });
      I += avail; p.savings -= avail; p.savings += I;
      const k = clamp(trunc(-I / 500), 1, 1000);
      for (const sid of colSlots(G, p)) {
        const s = G.stars[sid], t = t10(s.t);
        if (!(t < 30000 && t > -30000)) continue;
        const dt = RI(G, k, 2 * k);
        s.t = (t < t10(p.homeT) ? t - dt : t + dt) / 10;
      }
      const fl = fleetList(G, p);
      if (fl.length) {
        const f = fl[RI(G, 0, fl.length - 1)];
        if (f.star != null && f.to == null) { f.scrap301 = true; msg(G, p.id, 'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.', { icon: 'm9014' }); }
      }
    }
  }
  p.tm = M;
}
// CONFIRMED (ScrapFleetsAndTypes @a194e): every fleet marked for scrapping
// (fleet +7), every fleet of a design marked for scrapping (design +0x88) and,
// for a player who is out of the game (state above 3), every fleet is
// scrapped: the ships' metal, 3/4 of it for a human, goes to the player at its
// own colony, falls on the next star as a meteor shower from hyperspace, and
// otherwise falls onto the planet (the planet's owner picks it up in pass 2,
// GetOtherScrapMetal @a3abe). "Your fleet of %s at %s has been scrapped for %s
// metal." (1000.18, the metal shown only at your own colony); "Your "%s" ship
// type has been scrapped. %d of this type scrapped for %s metal." (1000.19).
function scrap301(G, f) {
  const p = G.players[f.owner];
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d) metal += f.ships[k] * designCost(G, d).metal; }
  if (p.human) metal = trunc(metal * 3 / 4);
  let own = false;
  if (f.star == null || f.to != null) { G.meteors = G.meteors || {}; const to = f.to != null ? f.to : f.dest; if (to != null) G.meteors[to] = (G.meteors[to] || 0) + metal; }
  else {
    const s = G.stars[f.star];
    if (s.owner === p.id) { p.metal += metal; own = true; }
    else { s.metal += metal; const so = G.scrapOver301 || (G.scrapOver301 = {}); so[s.id] = Math.min(32767, (so[s.id] || 0) + metal); }
  }
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return { metal, own };
}
function scrapFleetsAndTypes(G, p) {
  const dead = new Set(p.designs.filter(d => d.scrap301 && !d.scrapped));
  const out = !p.alive && !p.surrendered;
  const tally = new Map();
  for (const f of fleetList(G, p)) {
    const ofDead = Object.keys(f.ships).some(k => dead.has(getDesign(G, p.id, +k)));
    if (!f.scrap301 && !ofDead && !out) continue;
    const at = f.star != null && f.to == null ? f.star : null, label = E.fleetLabel(G, f), n = fleetCount(f), dids = Object.keys(f.ships);
    const r = scrap301(G, f);
    if (f.scrap301) { if (p.human) msg(G, p.id, `Your fleet of ${label} at ${at != null ? G.stars[at].name : 'hyperspace'} has been scrapped for ${fmt(r.own ? r.metal : 0)} metal.`, { icon: 'm9014', quiet: true }); }
    else for (const k of dids) { const d = getDesign(G, p.id, +k); const t = tally.get(d) || { n: 0, m: 0 }; t.n += n; if (r.own) t.m += r.metal; tally.set(d, t); }
  }
  for (const d of dead) {
    const t = tally.get(d) || { n: 0, m: 0 };
    d.scrapped = true; d.scrap301 = false;
    if (p.human) msg(G, p.id, `Your “${d.name}” ship type has been scrapped. ${t.n} of this type scrapped for ${fmt(t.m)} metal.`, { icon: 'm9014', quiet: true });
  }
}
// CONFIRMED (MaintainKillStars @a10c8): first every colony marked to be
// abandoned (slot +0xf) is given up, "You have abandoned %s." (1000.9); then
// each losing colony, in slot order, is paid from this turn's money, then
// from Ship Savings down to the borrowing limit ("Warning! Ship money is being
// used to support %s.", 1000.104), and what is still short costs people:
// pop x (loss - short) / loss - 100 (worked out in 32 bits, LMUL), "Your colony
// at %s is not receiving sufficient funds to support itself." (1000.13), a
// colony left with none is abandoned. The starving colony doesn't grow (+0xe).
function maintainKillStars(G, p) {
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid];
    s.oStarve = false;
    if (s.abandon301) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9013', star: sid }); decolonize(G, p, sid); }
  }
  let M = p.tm || 0, avail = Math.max(0, p.savings - borrowLimit(G, p));
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], inc = s.oInc || 0;
    if (!(inc < 0)) continue;
    if (M >= -inc) { M += inc; continue; }
    let need = -M - inc; M = 0;
    if (avail < need) {
      need -= avail; p.savings -= avail; avail = 0;
      const u = Math.max(0, trunc(Math.imul(popU(s), -need - inc) / -inc) - 100);
      setPopU(s, u);
      if (u === 0) { msg(G, p.id, `You have abandoned ${s.name}.`, { icon: 'm9013', star: sid }); decolonize(G, p, sid); }
      else { s.oStarve = true; msg(G, p.id, `Your colony at ${s.name} is not receiving sufficient funds to support itself.`, { icon: 'm9020', sound: 3002, star: sid }); }
    } else {
      msg(G, p.id, `Warning! Ship money is being used to support ${s.name}.`, { icon: 'm9020', star: sid, quiet: true });
      p.savings -= need; avail -= need;
    }
  }
  p.tm = M; p.oD = M;
}
// CONFIRMED (TerraformMineStars @a129a; 2.0's FUN_1040_0aea with this turn's
// money in place of the colony's share less its loss): each colony slot's
// share20 of this turn's money is split by its two bars; a bar above 0 is
// spent, whether the planet still needs it or not:
// - terraforming: "Warning: you are terraforming %s, a planet that will never
//   become profitable." every turn when more than $50 goes into a planet whose
//   gravity is more than 2.56 times yours (1000.15); the first $5,000 goes
//   into the planet (slot +0x12); then the temperature moves isqrt(money / 2)
//   tenths (isqrt(money / 5 x 3) with the radical bonus) toward yours; a step
//   bigger than the gap sets it to yours, refunds 2 x (step^2 - gap^2)
//   (5/3 x with the bonus), sets the bar to -1 and says "You have completely
//   terraformed %s." (1000.16);
// - mining: 15 x isqrt(money) metal (18 x); more than the planet has takes what
//   is left, refunds MetalToMoney(got) - MetalToMoney(left), sets the bar to
//   -1 and says "%s has run out of metal." (1000.25) or, gravity more than 2.56
//   times yours, "... You should probably abandon it." (.26)
function terraformMineStars(G, p) {
  const M = p.tm || 0;
  for (const sid of colSlots(G, p)) {
    const s = G.stars[sid];
    const money = share20(M, keyPm(p, sid));
    if (!(money > 0)) continue;
    let [T, X] = bars(s);
    const h = hab(p, s);
    if (T > 0) {
      let t = share20(money, T);
      if (t > 50 && h.gR > 256) msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: sid });
      s.oSink = s.oSink || 0;
      if (s.oSink < 5000) { const x = Math.min(5000 - s.oSink, t); s.oSink += x; t -= x; }
      const step = terraStep(p, t), gap = Math.abs(t10(p.homeT) - t10(s.t));
      if (gap < step) {
        p.oRefund += terraCost(p, step) - terraCost(p, gap);
        s.t = p.homeT; T = -1;
        msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: sid });
      } else s.t = (t10(s.t) + (t10(p.homeT) < t10(s.t) ? -step : step)) / 10;
    }
    if (X > 0) {
      let got = mineMetal(p, share20(money, X));
      const left = Math.floor(s.metal);
      if (left < got) {
        p.oRefund += mineMoney(p, got) - mineMoney(p, left);
        got = left; X = -1;
        msg(G, p.id, h.gR > 256 ? `${s.name} has run out of metal. You should probably abandon it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: sid });
      }
      p.metal += got; s.metal -= got;
    }
    setBars(s, T, X);
  }
}
// CONFIRMED (SpendTechMoney @a1ed2): the Technology slot's share20 of this
// turn's money ("You are not spending any money on technology research.",
// 1000.70, every turn it is 0); each tech's money is its share20 of that by
// its research share (player +0x4c..., per mille as it stands); points =
// isqrt(money / divisor) x 8 / 10 (Radical: / 2), divisors Range 120, Speed,
// Weapons and Shields 150, Mini and Radical 200; levels cost Range L^2, Speed
// (L+6)^2, Weapons and Shields (L+2)^2, Mini and Radical (L+7)^2; each level
// reached gives a head start of 0-40 (Radical 0-80) hundredths. A tech that
// passes a level (below 50) is set to it and reported, "Your Range Technology
// has reached level %d." (1000.3-7), and a Radical level makes a discovery.
const DIV = { range: 120, speed: 150, weapons: 150, shields: 150, mini: 200, radical: 200 };
const ADD = { range: 0, speed: 6, weapons: 2, shields: 2, mini: 7, radical: 7 };
const TECHLABEL = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shield', mini: 'Miniaturization' };
const TECHICON = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' };
function techLevelCost(k, L) { return (L + ADD[k]) * (L + ADD[k]); }
function spendTechMoney(G, p) {
  const T = share20(p.tm || 0, keyPm(p, 'tech'));
  if (T === 0 && p.human) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011', quiet: true });
  research(G, p, T);
}
function research(G, p, T) {
  const old = TECH_ORDER.map(k => p.tech[k]);
  let tot = 0; for (const k of TECHS) tot += p.talloc[k] || 0;
  for (const k of TECH_ORDER) {
    const a = p.talloc[k] || 0, pm = tot === 1000 || tot <= 0 ? a : Math.round(a * 1000 / tot);
    const r = isqrt(trunc(share20(T, pm) / DIV[k]));
    let pts = k === 'radical' ? trunc(r / 2) : trunc(r * 8 / 10);
    while (pts > 0) {
      const L = trunc(p.tprog[k] / 100), frac = 100 - p.tprog[k] % 100, cost = techLevelCost(k, L);
      if (cost <= 0) { p.tprog[k] += frac; continue; }
      const need = trunc(frac * cost / 100);
      if (need < pts) { p.tprog[k] += frac + RI(G, 0, k === 'radical' ? 80 : 40); pts -= need; }
      else { p.tprog[k] += trunc(pts * 100 / cost); pts = 0; }
    }
  }
  TECH_ORDER.forEach((k, i) => {
    const lvl = trunc(p.tprog[k] / 100);
    if (!(old[i] < lvl && p.tech[k] < 50)) return;
    p.tech[k] = lvl;
    if (k === 'radical') { msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010' }); radical(G, p); return; }
    techReport(G, p, k);
  });
}
function techReport(G, p, k) {
  msg(G, p.id, `Your ${TECHLABEL[k]} Technology has reached level ${p.tech[k]}.`, { icon: TECHICON[k], sound: 2000, tech: k, quiet: !p.human });
  const AI = E.aiOf(G); if (p.ai && AI.techEvent) AI.techEvent(G, p, k); // the computers read the report next turn
}
// CONFIRMED (SpendTechMoney): the reminder comes every turn with no tech money
const idleTech = (G, p) => p.human && !(p.budget.tech > 0);

// ---------- radical discoveries (DoSomethingRadical @a5d4e) ----------
// CONFIRMED: no hand of pending discoveries; each new Radical level rolls
// 0-99, again until one is used: < 10 metal, < 20 astronomers, < 40 a one-time
// bonus (mining, maximum population, terraforming or smarter generals), < 50
// steal tech, < 60 free designs (only with fewer than 17 designs), otherwise a
// tech jumps 2 levels.
function radical(G, p) {
  const say = (t, icon) => msg(G, p.id, t, { icon: icon || 'm9010', sound: 7007 });
  for (let guard = 0; guard < 50; guard++) {
    const r = RI(G, 0, 99);
    if (r < 10) { // 1,000-3,000 metal; the message divides it among your colonies
      const m = RI(G, 1000, 3000), n = colSlots(G, p).length;
      p.metal += m;
      say(`Your mining consortium has just been able to extract an additional ${fmt(n < 1 ? m : trunc(m / n))} metal from every planet you have.`, 'm9046');
      return;
    }
    if (r < 20) { // 6-9 stars whose news is more than 100 years old, walking on from a random star (ExploreStar)
      let n = RI(G, 6, 9), i = RI(G, 0, G.stars.length - 1);
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018');
      for (let c = 0; n > 0 && c < G.stars.length; c++) {
        const s = G.stars[i], k = know(G, p, s.id);
        if (!s.nova && (!k.explored || k.seen < G.turn - 10)) { exploreStar(G, p, s.id); n--; }
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
        if (!p.flags[k] && (t !== 0 || G.year + 10 < 3000)) { p.flags[k] = true; say(TEXT[k][0], TEXT[k][1]); return; }
      }
      continue;
    }
    if (r < 50) { // steal: the best level in the Compare Players table, from a random tech round
      const order = ['range', 'speed', 'weapons', 'shields', 'mini'];
      const best = order.map((t, j) => {
        let lv = 0, who = -1;
        for (const q of G.players) { const c = cmp(G)[q.id]; const v = c ? (c.out ? -1 : c.tech ? c.tech[j] : -1) : -1; if (lv < v) { lv = v; who = q.id; } }
        return { lv, who };
      });
      const s0 = RI(G, 0, 4);
      for (let j = 0; j < 5; j++) {
        const i = (s0 + j) % 5, t = order[i];
        if (p.tech[t] < best[i].lv) {
          p.tech[t] = best[i].lv;
          say(`Your spies have stolen some technological secrets from ${G.players[best[i].who].name}!`, 'm9040');
          techReport(G, p, t);
          return;
        }
      }
      continue;
    }
    if (r < 60 && p.designs.filter(d => !d.scrapped).length < 17) { // four new designs at your tech, no development cost
      say('Your ship technicians have designed a set of new ships with no development cost.', 'm9047');
      for (const type of ['scout', 'fighter', 'satellite', 'colony']) newDesign(G, p, aiSpec(p, type)).free = true;
      return;
    }
    const k = ['range', 'speed', 'weapons', 'shields', 'mini'][RI(G, 0, 4)];
    p.tech[k] = Math.min(50, p.tech[k] + 2);
    msg(G, p.id, `Your ${{ range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k]} technology just jumped to ${p.tech[k]}.`, { icon: TECHICON[k], sound: 7007, tech: k });
    return;
  }
}

// ---------- the moves (MoveShips @a26ac, CheckFleetDestination @a2b8e) ----------
// CONFIRMED (MoveShips): satellites of one design at a star are put into one
// fleet; every other fleet has its route checked (CheckFleetDestination: a
// fleet at a star whose next stop isn't its destination has its route planned
// again from there, with the shortest Range and least fuel left of its group;
// with no route left it stops, "Your %s can no longer reach %s.", 1000.21).
function moveShips(G, p) {
  const sats = new Map();
  for (const f of fleetList(G, p)) {
    if (!f.sat || f.star == null) continue;
    const did = Object.keys(f.ships).join(','), key = f.star + ':' + did, a = sats.get(key);
    if (a && a !== f) { for (const k in f.ships) a.ships[k] = (a.ships[k] || 0) + f.ships[k]; G.fleets.splice(G.fleets.indexOf(f), 1); }
    else sats.set(key, f);
  }
  replan(G, p);
}
// CONFIRMED (MoveShips): on arriving at its destination, the owner hears
// "Your fleet of %s has arrived at %s." (1000.22) when its own record of the
// star says it is explored and somebody's, or nobody's and the fleet isn't of
// colony ships; at a stop on the way "Your fleet of %s has stopped at %s on
// the way to %s." (1000.23). A fleet arriving at a star that has gone
// supernova is lost: "Your fleet of %s disappeared through a wormhole in space
// and is lost." (1000.20). A fleet that reaches a star someone else owns is
// noted for the owner's allies (ColonizeAndExplore tells them).
function fleetArrives(G, f) {
  const p = G.players[f.owner], s = G.stars[f.star], label = E.fleetLabel(G, f);
  if (s.nova >= 210) { if (p.human) msg(G, p.id, `Your fleet of ${label} disappeared through a wormhole in space and is lost.`, { icon: 'm9036', star: s.id }); return false; }
  if (f.path && f.path.length) { if (p.human) msg(G, p.id, E.report(25, label, s.name, G.stars[f.path[f.path.length - 1]].name), { icon: 'm9038', star: s.id, quiet: true }); return true; }
  const k = know(G, p, s.id), owner = k.owner == null ? -1 : k.owner;
  if (p.human && k.explored && (owner !== -1 || !E.fleetHas(G, f, 'colony'))) msg(G, p.id, `Your fleet of ${label} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
  if (s.owner !== f.owner) (G.arr301 = G.arr301 || []).push({ o: f.owner, sid: s.id, label });
  return true;
}

// ---------- routes (DeterminePath @130686, GiveFleetPath @130dc0) ----------
// CONFIRMED (DeterminePath): a fleet that can reach its destination on the
// fuel it has left flies straight there. Otherwise it goes by way of your own
// colonies (not ones being abandoned), looked at in slot order (the newest
// first): a depth-first search, the first hop within the fuel left, the others
// within the Range, a colony from which the destination is within Range
// ending the route, at most 42 / Range stops; a route is kept if it is shorter
// than three times the direct distance and than the best so far, or as long
// as the best with no more stops (so of two routes as good, the later found
// wins). (Distances the search uses are the low byte of the distance table.)
function path301(G, pid, from, to, fuel, R) {
  if (from == null || to == null || from < 0 || to < 0) return null;
  const dist = (a, b) => E.starDist(G, a, b);
  const direct = dist(from, to);
  if (direct < 3) return [];
  if (fuel >= direct) return [to];
  const p = G.players[pid];
  const maxHops = R === 0 ? 1 : trunc(42 / R);
  const nodes = [from].concat(colSlots(G, p).filter(sid => sid !== from && sid !== to && G.stars[sid].owner === pid && !G.stars[sid].abandon301));
  const n = nodes.length;
  const toT = nodes.map(v => { const d = dist(v, to); return d <= R ? d : 0; });
  const lb = (a, b) => dist(nodes[a], nodes[b]) & 0xff;
  let best = 3 * direct, bestHops = 0, bestPath = null;
  const used = nodes.map((_, i) => i === 0);
  const stack = [0], legs = [0], fuelAt = [fuel];
  let total = 0, d = 1;
  stack[1] = 0;
  const advance = (lvl) => { do { stack[lvl]++; } while (stack[lvl] < n && used[stack[lvl]]); };
  advance(1);
  while (stack[1] < n) {
    if (stack[d] < n || d < 2) {
      if (stack[d] >= n) break;
      const node = stack[d], leg = lb(stack[d - 1], node);
      legs[d] = leg;
      let descended = false;
      if (leg <= fuelAt[d - 1] && leg + total + 2 < best) {
        if (toT[node] === 0) {
          if (d < maxHops) {
            fuelAt[d] = R; used[node] = true; total += leg;
            d++; stack[d] = 0; advance(d); descended = true;
          }
        } else {
          fuelAt[d] = R;
          const tot = leg + total + toT[node];
          if (tot < best || (d < bestHops && tot === best)) {
            bestHops = d + 1; best = tot;
            bestPath = stack.slice(1, d + 1).map(i => nodes[i]).concat([to]);
          }
        }
      }
      if (!descended) advance(d);
    } else {
      d--; total -= legs[d]; used[stack[d]] = false; advance(d);
    }
  }
  return bestPath;
}
function route(G, f, sid) {
  const r = path301(G, f.owner, f.star, sid, f.fuel, fleetMaxRange(G, f));
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
    const r = path301(G, p.id, f.star, fin, f.fuel, fleetMaxRange(G, f));
    if (r == null) {
      if (p.human) msg(G, p.id, `Your ${E.fleetLabel(G, f)} can no longer reach ${G.stars[fin].name}.`, { icon: 'm9038', star: f.star });
      f.dest = null; f.path = null; f.routeTo = null;
    } else { f.dest = null; f.path = r.length ? r : null; }
  }
}

// ---------- fleets ----------
// CONFIRMED (BuildAShip @132e04, BuildAFleet @92fc2): a fleet holds one design.
// New Fighters and Satellites join a fleet of the same design at the star that
// isn't on its way anywhere (a human's only one built this turn, fleet +9);
// each Scout and Colony Ship is a fleet of its own. 3.0.1 lets fleets be
// grouped to move together; the remake's fleets of several designs are such
// groups (the group moves at the slowest one's speed and the shortest Range,
// GiveFleetPath).
function fleetFor(G, pid, sid, d) {
  if (d.type !== 'fighter' && d.type !== 'satellite') return null;
  const human = G.players[pid].human && !G.players[pid].auto;
  return fleetList(G, G.players[pid]).find(x => x.star === sid && x.to == null && x.dest == null && !x.path &&
    Object.keys(x.ships).every(k => +k === d.id) && (!human || x.newThisTurn)) || null;
}

// CONFIRMED (OrganizeFleets @133d14, the Organize Ships window): the ships of
// one design at a star are dealt out again among up to 12 fleets. Every fleet
// of that design there then has the most fuel used of any of them (fleet +2);
// a fleet whose count changed stops counting as built this turn (+9) unless
// all of them were, and its colony ships are unloaded (+6) unless all of them
// were loaded; a new fleet gets the same. The fleets kept keep their orders.
function organized301(G, f, merged, nf, orders) {
  if (f.star == null) return;
  const ds = Object.keys(f.ships); if (ds.length !== 1) return;
  const did = ds[0];
  const same = G.fleets.filter(x => x.owner === f.owner && x.star === f.star && Object.keys(x.ships).length === 1 && Object.keys(x.ships)[0] === did);
  const fuels = same.map(x => x.fuel);
  if (orders && orders.fuel) fuels.push(orders.fuel.a, orders.fuel.b);
  const fuel = Math.min(...fuels);
  for (const x of same) x.fuel = fuel;
  const allNew = same.every(x => x === nf || !!x.newThisTurn) && (!merged || !!merged.newThisTurn);
  const d = getDesign(G, f.owner, +did), colony = d && d.type === 'colony';
  const fWas = merged ? (f.colonists || 0) - (merged.colonists || 0) : (f.colonists || 0) + (nf ? nf.colonists || 0 : 0);
  const allLoaded = colony && same.every(x => x === f || x === nf || (x.colonists || 0) > 0) && fWas > 0 && (!merged || (merged.colonists || 0) > 0);
  for (const x of [f, nf]) {
    if (!x) continue;
    if (!allNew) x.newThisTurn = false;
    if (colony) x.colonists = allLoaded ? 10 * fleetCount(x) : 0;
  }
  if (merged && orders) { f.dest = orders.a.dest; f.path = orders.a.path; f.routeTo = orders.a.routeTo; }
}
// ---------- ships (CalcShipCosts @134de6) ----------
// CONFIRMED: the hit table is resource MaTh 1002 "Weapon Ratios" (the same
// numbers as DOS 2.0's WPNRAT), indexed by W - S + 25, clamped to 0..50.
const HIT = D.WPNRAT;
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
// 1..tech (Scout -1), Mini 0..tech (2.0's limits, rules-dos designLimits)
const designLimits = D.designLimits, designMin = D.designMin;
// CONFIRMED (BuildAShip @132e04: the prototype price while none of the
// design has been built; BuildAFleet @92fc2: computers below Smart (the
// intelligence < 3, auto play 0) pay it too). The designs an Average (or
// better) computer draws up itself carry no development cost
// (MaintainShipTypes @94794), so Average pays only for its starting designs.
const paysPrototype = (G, p) => p.human || !p.ai || p.ai.iq < 3;
// CONFIRMED (CalcOneGroup @e17e4, HaveGroupShoot @e1cc2): every ship, satellites
// too, fires once a round; the planet once
const shotsPerShip = () => 1;
const planetShots = () => 1;
const att301 = (G, d) => d ? designCost(G, d).att : 0;

// =====================================================================
// Battles (DoBattleStage @e0004, DoOneBattle @e0aee, CalculateGroups @e1614,
// CalcOneGroup @e17e4, HaveGroupShoot @e1cc2, PickTarget @e250e,
// MakeResultMessages @e2ea2, ResolveVictorFleetsAtStar @e42b4,
// ZeroFleetsAtStar @e41ea). 2.0's duels (rules-dos battle20) with 3.0.1's
// luck, groups, planet and reports.
// =====================================================================
// what a player learns from a battle: the star record's year of the last
// battle seen (+0xe), its winner (+0x10), and four strength estimates the
// computers use (+0x12 e16: the force to beat there; +0x16 e1a: what it shows
// to stars within reach; +0x1a e1e: the threat to your own colony; +0x1e e22:
// what it shows to your colonies within reach; +0x26 pop: the planet's people)
function x301(G, p, sid) { const k = know(G, p, sid); return k.x301 || (k.x301 = { by: 0, e16: 0, e1a: 0, e1e: 0, e22: 0, pop: 0 }); }
// CONFIRMED (EverybodyNotAllied @e0a56): true while someone in the list isn't
// allied with the holder or with someone else in the list
function everybodyNotAllied(G, holder, list) {
  for (const a of list) {
    if (!isAllied(G, a, holder)) return true;
    for (const b of list) if (!isAllied(G, a, b)) return true;
  }
  return false;
}
// CONFIRMED (DoBattleStage @e0004): at every star where two players are (a
// colony, marked by TerraformMineStars, or fleets that have moved there), the
// colony's owner holds the star and the others, shuffled, take it on one at a
// time from the end of the list: a duel with the holder if they aren't allies,
// and the winner holds the star (when both sides die the next in the list
// does); an ally of the holder goes to the front of the list, and once
// everyone left is the holder's ally (but not all each other's), the holder
// steps down for the next. Each duel is a battle of its own, with its record
// and reports (MakeResultMessages). The last duel's winner is noted for the
// star (pass 2 gives up a colony whose star was won by someone else).
function battle(G, sid) {
  const s = G.stars[sid];
  const present = new Set(G.fleets.filter(f => f.star === sid && f.to == null && fleetCount(f) > 0).map(f => f.owner));
  if (s.owner >= 0) present.add(s.owner);
  let holder = -1;
  const list = [];
  for (const q of order301(G)) if (present.has(q.id)) { if (q.id === s.owner) holder = q.id; else list.push(q.id); }
  if (!(list.length > 1 || (list.length > 0 && holder >= 0))) return null;
  if (!G.players.some(a => present.has(a.id) && G.players.some(b => present.has(b.id) && !isAllied(G, a.id, b.id)))) return null;
  for (let i = 0; i < list.length; i++) { const j = RI(G, 0, list.length - 1); [list[i], list[j]] = [list[j], list[i]]; }
  if (holder < 0) holder = list.pop();
  const ownerIds = [...present];
  const pop0 = s.owner >= 0 ? popU(s) : 0, planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  // CONFIRMED (DoBattleStage @e0004: DataControl after each DoOneBattle;
  // ReviewBattle @e2d36 replays one): a replay is kept for each duel
  const count = (o) => G.fleets.reduce((a, f) => a + (f.owner === o && f.star === sid && f.to == null ? fleetCount(f) : 0), 0);
  let rec = null, nDuel = 0;
  const start = {}, lost = {};
  for (const f of G.fleets) if (f.star === sid && f.to == null) start[f.owner] = (start[f.owner] || 0) + fleetCount(f);
  let rotated = 0, fought = false;
  while (list.length > 0) {
    if (!everybodyNotAllied(G, holder, list)) break;
    const a = list[list.length - 1];
    if (!isAllied(G, a, holder)) {
      rotated = 0; fought = true;
      const po = holder === s.owner && s.pop > 0 ? holder : -1, n0 = { [a]: count(a), [holder]: count(holder) }, p0 = s.pop;
      rec = { id: G.nextId++, star: sid, year: G.year + 10, duel: nDuel++, sides: [a, holder], rounds: [], start: [], planetOwner: po, pop0: s.pop, popR: [] };
      const w = duel(G, sid, a, holder, rec);
      const sv = { [a]: count(a), [holder]: count(holder) };
      rec.survivors = sv; rec.lost = { [a]: n0[a] - sv[a], [holder]: n0[holder] - sv[holder] }; rec.pop1 = s.pop;
      rec.planetDied = po >= 0 && (s.owner !== po || !(s.pop > 0)) && p0 > 0; rec.end = rec.start.map(u => u.alive ? 1 : 0);
      G.battles.push(rec);
      (G.bw301 = G.bw301 || {})[sid] = w;
      if (w !== holder) holder = -1;
      if (w !== a) list.pop();
      if (holder < 0) holder = list.length ? list.pop() : -1;
    } else if (rotated < list.length) { list.unshift(list.pop()); rotated++; }
    else { list.pop(); list.unshift(holder); holder = a; rotated = 0; }
  }
  if (!fought) return null;
  const survivors = {};
  for (const f of G.fleets) if (f.star === sid && f.to == null) survivors[f.owner] = (survivors[f.owner] || 0) + fleetCount(f);
  for (const o of ownerIds) lost[o] = (start[o] || 0) - (survivors[o] || 0);
  const planetDied = planetOwner >= 0 && s.owner !== planetOwner;
  G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop: pop0 / 1000, rec, reported: true };
}
// one duel: the attacker A against the holder Dh
function duel(G, sid, A, Dh, rec) {
  const s = G.stars[sid], yr = G.year + 10;
  const side = (o) => { // the ships of a player at the star by design, in its design list order
    const m = new Map();
    for (const f of G.fleets) if (f.owner === o && f.star === sid && f.to == null) for (const k in f.ships) {
      const d = getDesign(G, o, +k); if (!d || f.ships[k] <= 0) continue;
      m.set(d, (m.get(d) || 0) + f.ships[k]);
    }
    const P = G.players[o];
    return P.designs.filter(d => m.has(d)).map(d => ({ d, c: designCost(G, d), n: m.get(d), ids: [] }));
  };
  const SA = side(A), SD = side(Dh);
  for (const [o, S] of [[A, SA], [Dh, SD]]) for (const e of S) for (let i = 0; i < e.n; i++) { e.ids.push(rec.start.length); rec.start.push({ o, t: e.d.type, did: e.d.id, alive: true }); }
  const nA = SA.reduce((a, e) => a + e.n, 0), nD = SD.reduce((a, e) => a + e.n, 0);
  // CONFIRMED (DoBattleStage @e01f6-e0218, e04b4-e04d6): each side's luck is
  // RND(-1, 1) on its Weapons, never -1 with smarter generals (+0x5c bit 8)
  const luck = (o) => { const l = RI(G, -1, 1); return G.players[o].flags.generals && l === -1 ? 0 : l; };
  const lA = luck(A), lD = luck(Dh);
  // CONFIRMED (DoBattleStage @e0780-e07c6): the planet fights when the holder
  // owns the star: its people as hit points, the owner's Weapons and Shields tech
  const planet = Dh === s.owner && s.pop > 0 ? { pop: popU(s), W: G.players[Dh].tech.weapons, S: G.players[Dh].tech.shields } : null;
  const pop = planet ? planet.pop : 0;
  const groups = calculateGroups(SA, SD, planet, lA, lD, A, Dh);
  const GA = groups[0], GD = groups[1];
  // DoOneBattle @e0aee: rounds while both sides have groups left; each round,
  // from the fastest speed down to 0, the attacker's groups of that speed
  // fire, then the defender's (the planet only as the defender's last group);
  // a group fires with the count it had when the speed began
  let aliveA = GA.bad ? -1 : GA.filter(g => g.n > 0).length, aliveD = GD.bad ? -1 : GD.filter(g => g.n > 0).length;
  let maxV = 0; for (const g of GA.concat(GD)) if (maxV <= g.V) maxV = g.V;
  const tgt = [-1, -1];
  let rounds = 0, debris = 0;
  while (aliveA > 0 && aliveD > 0) {
    rounds++;
    const ev = [];
    for (let v = maxV; v >= 0; v--) {
      for (let i = 0; i < GA.length; i++) if (GA[i].V === v) shoot(G, GA[i], GD, 0, tgt, ev, (m) => { debris += m; });
      for (let i = 0; i < GD.length; i++) if (GD[i].V === v && (!GD[i].planet || aliveD === 1)) shoot(G, GD[i], GA, 1, tgt, ev, (m) => { debris += m; });
      for (const g of GA) if (g.n0 !== g.n) { g.n0 = g.n; if (g.n === 0) aliveA--; }
      for (const g of GD) if (g.n0 !== g.n) { g.n0 = g.n; if (g.n === 0) aliveD--; }
    }
    if (rec.rounds.length < 60) { rec.rounds.push(ev); const pg = GD.find(g => g.planet); rec.popR.push(pg ? pg.hp / 1000 : s.pop); }
  }
  const winner = aliveA < 1 ? (aliveD < 1 ? -1 : Dh) : A;
  // the winner's survivors by design; the planet's people left
  const surv = new Map(); let planetLeft = 0;
  for (const g of (winner === A ? GA : winner === Dh ? GD : [])) {
    if (g.planet) { planetLeft = g.hp; continue; }
    surv.set(g.d, (surv.get(g.d) || 0) + g.n);
  }
  const survId = new Map(); for (const [d, n] of surv) survId.set(d.id, n);
  for (const g of GA.concat(GD)) if (!g.planet) for (let i = g.n; i < g.ids.length; i++) rec.start[g.ids[i]].alive = false;
  const power = (cls) => { let a = 0; for (const [d, n] of surv) if (cls == null || d.type === cls) a += n * att301(G, d); return a; };
  const survN = [...surv.values()].reduce((a, n) => a + n, 0);
  makeResultMessages(G, sid, { A, Dh, nA, nD, winner, rounds, debris, pop, planetLeft, W: planet ? planet.W : 0, power, survN, survId, planet, yr, bid: rec.id });
  return winner;
}
// CONFIRMED (CalculateGroups @e1614, CalcOneGroup @e17e4): each side's ships
// are cut into groups of at most N of one design, from the last design in its
// list to the first, at most 20 groups. With fewer than 5 designs N starts at
// a fifth of the side's ships (at least 1) and grows while the side has fewer
// than 1 or more than 5 groups (the defender's planet counts) and more groups
// than designs (plus the planet); with 5 or more designs N is the side's
// ships. Both sides then use the larger N. A group's Weapons are its design's
// plus the side's luck (at least 1); the planet group comes first, at speed 0.
function calculateGroups(SA, SD, planet, lA, lD, A, Dh) {
  const cut = (S, N, pl, luck, o) => {
    const out = [];
    if (pl) out.push({ o, planet: true, V: 0, W: Math.max(1, pl.W + luck), S: pl.S, hp: pl.pop, n: 1, n0: 1, dmg: 0, debris: 0, ids: [] });
    for (let i = S.length - 1; i >= 0; i--) {
      const e = S[i]; let left = e.n, off = 0;
      while (left > 0) {
        if (out.length === 20) { out.bad = true; return out; }
        const k = Math.min(N, left);
        out.push({ o, d: e.d, type: e.d.type, V: e.d.V, W: Math.max(1, e.d.W + luck), S: e.d.S, hp: e.c.hp, debris: trunc(e.c.metal / 5), dmg: 0, n: k, n0: k, ids: e.ids.slice(off, off + k) });
        left -= k; off += k;
      }
    }
    return out;
  };
  const count = (S, N, pl) => { const g = cut(S, N, pl, 0, -1); return g.bad ? -1 : g.length; };
  const size = (S, pl) => {
    const types = S.length, ships = S.reduce((a, e) => a + e.n, 0);
    if (types >= 5) return ships;
    let N = trunc((ships + 4) / 5); if (N < 2) N = 1;
    for (let c = count(S, N, pl); (c < 1 || c > 5) && types + (pl ? 1 : 0) < c; c = count(S, N, pl)) N++;
    return N;
  };
  const N = Math.max(size(SA, null), size(SD, planet));
  return [cut(SA, N, null, lA, A), cut(SD, N, planet, lD, Dh)];
}
// CONFIRMED (PickTarget @e250e): a group of colony ships, else of
// satellites, else from a random start the first ship group (passing over the
// planet, which is the target only if nothing else is left)
function pickTarget(G, T) {
  const c = T.findIndex(g => g.type === 'colony' && g.n > 0); if (c >= 0) return c;
  const s = T.findIndex(g => g.type === 'satellite' && g.n > 0); if (s >= 0) return s;
  if (!T.length) return -1;
  const i0 = RI(G, 0, T.length - 1);
  let pl = -1;
  for (let j = 0; j < T.length; j++) {
    const i = (i0 + j) % T.length, g = T[i];
    if (g.planet && g.n > 0) pl = i;
    if (!g.planet && g.n > 0) return i;
  }
  return pl;
}
// CONFIRMED (HaveGroupShoot @e1cc2): every ship of the group fires once at its
// side's target (kept until it dies): hit = Weapon Ratios[W + 25 - S]; against
// the planet hit x (0-20 + 10 + 5W) x 4 people, against ships
// max(1, hit x (0-20 + 10 + 5W) / 6) damage, a ship dying when the damage
// reaches its hit points (what is left over is lost), a fifth of its metal
// becoming debris
function shoot(G, g, T, k, tgt, ev, addDebris) {
  for (let i = 0; i < g.n0; i++) {
    if (tgt[k] < 0) tgt[k] = pickTarget(G, T);
    if (tgt[k] < 0) continue;
    const t = T[tgt[k]], h = HIT[clamp(g.W + 25 - t.S, 0, 50)];
    const si = g.planet ? -1 : g.ids[i % Math.max(1, g.ids.length)];
    if (t.planet) {
      const dmg = Math.min(t.hp, h * (RI(G, 0, 20) + 10 + g.W * 5) * 4);
      t.hp -= dmg;
      if (t.hp === 0) t.n = 0;
      if (ev.length < 80) ev.push({ a: g.o, si, p: 1 });
    } else {
      const dmg = Math.max(1, trunc(h * (RI(G, 0, 20) + 10 + g.W * 5) / 6));
      t.dmg += dmg;
      let killed = 0;
      const ti = t.ids[Math.max(0, t.n - 1)];
      if (t.hp <= t.dmg) { t.dmg = 0; t.n--; addDebris(t.debris); killed = 1; }
      if (ev.length < 80) ev.push({ a: g.o, si, t: t.o, k: killed, ti });
    }
    if (t.n === 0) tgt[k] = -1;
  }
}
// CONFIRMED (PlayAnnounceSound @16156e): the reports "You won a battle",
// "You lost a battle" and "... survived an enemy attack" (codes 0x407-0x409)
// play no sound; "... destroyed your colony" (0x3f2) plays 2001. (The remake's
// auto play reads won: true / false.)
// CONFIRMED (MakeResultMessages @e2ea2), after each duel:
// - a big battle when the defender and the attacker each have more ships than
//   RND(5, 10) (for DetectBigBattles);
// - each side's record of the star gets the year (+0xe), the battle and the
//   winner;
// - the attacker dislikes the defender: RND(-30, -10) if it came with one ship,
//   else RND(-200, -100) (ModifyAlliances);
// - the attacker that won: its survivors go back to its fleets listed first
//   (ResolveVictorFleetsAtStar), "You won a battle at %s. You lost %d of your
//   ships. %s lost %d." (1000.32), the debris falls onto the planet ("%s metal
//   has fallen onto %s from your recent battle.", .64), its estimates are
//   cleared; the attacker that lost: its fleets there are emptied
//   (ZeroFleetsAtStar), "You lost a battle at %s. ..." (.33), its record says
//   the star is the defender's (nobody's if both died after more than a
//   round), and it estimates the force there: the survivors + the planet
//   ((pop + 49) / 50 x (W + 2)^2 / 75) + 1, half the time (at a colony) less
//   their fighters and scouts; what it shows to stars near it, 0 a third of the
//   time when the planet had under 100 people, else their satellites and the
//   planet; what it shows to your colonies, their fighters and scouts;
// - the defender: with no planet or having won, it dislikes the attacker as
//   above; having lost its colony, to 0 if it liked the attacker enough to
//   ally, else RND(-400, -200). A computer (not a turtle) whose colony was
//   attacked puts more of its metal into defence (+10, at least 60, if it lost;
//   then +5, at least 30, while under 70). Having won: survivors back, "You
//   won a battle ..." with no planet, else "%s survived an enemy attack from
//   %s. You lost %d of your ships. %s lost %d. You lost %s people." (.34);
//   debris to its metal at its own colony ("You recovered %s metal from the
//   battle at %s.", .63, even when it is 0) and the colony keeps the planet's
//   people left, else onto the planet; its estimates cleared, the threat to its
//   colony noted (all but fighters 2 times in 5 after more than one round, a
//   tenth of that 2 in 5). Having lost: fleets emptied, its colony there has no
//   one left, "You lost a battle ..." with no planet, else "%s destroyed your
//   colony at %s. You lost %d of your ships. %s lost %d. You lost %s people."
//   (.11), its record and estimates as for a loser, and the star is nobody's.
function makeResultMessages(G, sid, x) {
  const { A, Dh, nA, nD, winner, rounds, pop, planetLeft, W, power, survN, yr } = x;
  const s = G.stars[sid], AI = E.aiOf(G), name = (o) => G.players[o].name;
  let debris = x.debris;
  if (nD > RI(G, 5, 10) && nA > RI(G, 5, 10)) (G.big301 = G.big301 || {})[sid] = true;
  const feel = (from, to, d) => { const P = G.players[from]; if (P.ai && AI.modifyAlliances) AI.modifyAlliances(G, P, to, d); };
  const pP = trunc(trunc((pop + 49) / 50) * (W + 2) * (W + 2) / 75);
  const mark = (o) => { const k = x301(G, G.players[o], sid); k.by = yr; return k; };
  // the attacker
  {
    const k = mark(A), P = G.players[A];
    feel(A, Dh, nD === 1 ? RI(G, -30, -10) : RI(G, -200, -100));
    if (winner === A) {
      resolveVictor(G, sid, A, x.survId);
      if (P.human) msg(G, A, `You won a battle at ${s.name}. You lost ${nA - survN} of your ships. ${name(Dh)} lost ${nD}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
      if (debris !== 0) { if (P.human) msg(G, A, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; }
      k.e16 = 0; k.e1a = 0; k.e1e = 0; k.e22 = 0; k.pop = 0;
      if (nD === 0 && AI.note) AI.note(G, P, { code: 0x407, other: Dh });
    } else {
      zeroFleets(G, sid, A);
      know(G, P, sid).owner = winner === -1 && rounds > 1 ? -1 : Dh;
      if (P.human) msg(G, A, `You lost a battle at ${s.name}. You lost ${nA} of your ships. ${name(Dh)} lost ${nD - (winner === Dh ? survN : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false });
      k.pop = pop;
      k.e16 = power() + pP + 1;
      if (RI(G, 1, 2) === 1 && pop > 0) k.e16 -= power('fighter') + power('scout') - 1;
      k.e1a = RI(G, 1, 3) === 1 && pop < 100 ? 0 : power('satellite') + pP;
      k.e1e = 0; k.e22 = power('fighter') + power('scout');
    }
  }
  // the defender
  {
    const k = mark(Dh), P = G.players[Dh];
    if (pop < 1 || winner === Dh) feel(Dh, A, nA === 1 ? RI(G, -30, -10) : RI(G, -200, -100));
    else if (P.ai && P.ai.att && 500 < (P.ai.att[A] || 0)) feel(Dh, A, -(P.ai.att[A] || 0));
    else feel(Dh, A, RI(G, -400, -200));
    if (pop > 0 && !P.human && P.ai && P.ai.v301 && P.ai.style !== 2) {
      if (Dh !== winner) P.ai.metalDef = P.ai.metalDef + 10 < 60 ? 60 : P.ai.metalDef + 10 < 100 ? P.ai.metalDef + 10 : 99;
      if (P.ai.metalDef < 70) P.ai.metalDef = P.ai.metalDef + 5 < 30 ? 30 : P.ai.metalDef + 5 < 100 ? P.ai.metalDef + 5 : 99;
    }
    const own = s.owner === Dh;
    k.pop = 0;
    if (winner === Dh) {
      resolveVictor(G, sid, Dh, x.survId);
      if (pop === 0) { if (P.human) msg(G, Dh, `You won a battle at ${s.name}. You lost ${nD - survN} of your ships. ${name(A)} lost ${nA}.`, { icon: 'p3000', star: sid, battle: x.bid, won: true }); }
      else if (P.human) msg(G, Dh, `${s.name} survived an enemy attack from ${name(A)}. You lost ${nD - survN} of your ships. ${name(A)} lost ${nA}. You lost ${fmt((pop - planetLeft) * 1000)} people.`, { icon: 'p3000', star: sid, battle: x.bid, won: true });
      if (!own) { if (debris !== 0) { if (P.human) msg(G, Dh, `${fmt(debris)} metal has fallen onto ${s.name} from your recent battle.`, { icon: 'm9046', star: sid, quiet: true }); s.metal += debris; debris = 0; } }
      else {
        setPopU(s, planetLeft);
        if (P.human) msg(G, Dh, `You recovered ${fmt(debris)} metal from the battle at ${s.name}.`, { icon: 'm9046', star: sid, quiet: true });
        P.metal += debris; debris = 0;
      }
      k.e16 = 0; k.e1a = 0; k.e22 = 0;
      if (pop < 1) k.e1e = 0;
      else {
        const all = power(), fi = power('fighter'), r = RI(G, 1, 5);
        if (r < 3 && rounds > 1) k.e1e = all - fi;
        else if (r < 5) k.e1e = trunc((all - fi) / 10);
      }
    } else {
      zeroFleets(G, sid, Dh);
      know(G, P, sid).owner = winner === -1 && rounds > 1 ? -1 : A;
      if (own) setPopU(s, 0);
      if (pop === 0) { if (P.human) msg(G, Dh, `You lost a battle at ${s.name}. You lost ${nD} of your ships. ${name(A)} lost ${nA - (winner === A ? survN : 0)}.`, { icon: 'm9025', star: sid, battle: x.bid, won: false }); }
      else {
        if (P.human) msg(G, Dh, `${name(A)} destroyed your colony at ${s.name}. You lost ${nD} of your ships. ${name(A)} lost ${nA - (winner === A ? survN : 0)}. You lost ${fmt(pop * 1000)} people.`, { icon: 'm9036', sound: 2001, star: sid, battle: x.bid, won: false });
        if (AI.note) AI.note(G, P, { code: 0x3f2, by: A });
      }
      if (pop < 1) {
        k.e16 = power() + 1; k.e1a = RI(G, 1, 3) === 1 ? 0 : power('satellite');
        k.e1e = 0; k.e22 = power('fighter') + power('scout');
      } else {
        k.e16 = power() + 1; k.e1a = RI(G, 1, 3) === 1 ? 0 : power();
        k.e1e = 0; k.e22 = power();
      }
      if (own) { s.owner = -1; s.pop = 0; }
    }
  }
}
// CONFIRMED (ResolveVictorFleetsAtStar @e42b4): the winner's survivors of each
// design go back to its fleets at the star listed first; the others lose theirs
function resolveVictor(G, sid, o, survId) {
  const left = new Map(survId), P = G.players[o];
  for (const f of fleetList(G, P)) {
    if (f.star !== sid || f.to != null) continue;
    for (const k in f.ships) {
      const keep = Math.min(f.ships[k], left.get(+k) || 0);
      left.set(+k, (left.get(+k) || 0) - keep);
      f.ships[k] = keep;
      if (!keep) delete f.ships[k];
    }
    if (f.colonists) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; f.colonists = Math.min(f.colonists, c * 10); }
    if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
}
// CONFIRMED (ZeroFleetsAtStar @e41ea): the loser's fleets at the star are emptied
function zeroFleets(G, sid, o) {
  for (const f of G.fleets.slice()) if (f.owner === o && f.star === sid && f.to == null) G.fleets.splice(G.fleets.indexOf(f), 1);
}

// =====================================================================
// Between the passes (EndTurn @a0600-a0618): every battle, then
// CheckForArmageddon @a3268 and CheckForSupernova @a33cc.
// Pass 2 (EndTurn @a0628-a0d64), for every player in turn.
// =====================================================================
function pass2(G) {
  G.present301 = {};
  const arm = checkForArmageddon(G), shock = checkForSupernova(G);
  G.armFired301 = !!arm.fired;
  for (const p of order301(G)) {
    if (arm.fired) { if (p.human) { msg(G, p.id, 'Oh No! It’s armageddon!', { icon: 'm9036', sound: 7020 }); msg(G, p.id, 'The armageddon device has caused half of the stars to supernova!', { icon: 'm9036' }); } }
    if (arm.fizzled && p.human) msg(G, p.id, 'Hmm! The armadeddon device was activated, but there wasn’t enough mass in the galaxy to get it to work…', { icon: 'm9036' });
    reactToSupernova(G, p, arm.fired, shock);
    getOtherScrapMetal(G, p);
    income(G, p);
    colonizeAndExplore(G, p);
    detectBigBattles(G, p);
    doSurrenders(G, p);
    // CONFIRMED (EndTurn @a0bdc-a0c9c): "After supporting your planets and
    // paying your interest, you have no money to spend!" (1000.105) when the
    // net is below 0, which is then 0; the money kept within $0..$1,000,000,000,
    // Ship Savings within +-$1,000,000,000
    if ((p.net301 || 0) < 0) { if (p.human && p.alive) msg(G, p.id, 'Warning! After supporting your planets and paying your interest, you have no money to spend!', { icon: 'm9020' }); p.net301 = 0; }
    p.net301 = Math.min(1e9, p.net301 || 0);
    p.tm = clamp(p.tm || 0, 0, 1e9); p.oInc = p.tm;
    p.savings = clamp(p.savings, -1e9, 1e9);
    doGameEndStuff(G, p);
    for (const sid of colSlots(G, p)) restoreStarsBars(G, p, G.stars[sid]);
    setPlanetDisplayValues(G, p);
    // CONFIRMED (SaveComparisonInfoTwo @a663c): Total Money, or -1 when out
    cmp(G)[p.id] = Object.assign({}, cmp(G)[p.id] || {}, { out: !p.alive, money: p.alive ? p.tm : -1 });
  }
  G.scrapOver301 = {}; // (EndTurn @a03b0: cleared before each 10-year step)
}
// CONFIRMED (CheckForArmageddon @a3268): when every human has the device on
// (a human who is out counts as on, EndTurn @a0450) and at least one still in
// does, half the stars that aren't turning red (shuffled) start a supernova at
// once (state 100: they go next) and the Armageddon count (galaxy +0x1c) goes
// up; with fewer than 2 such stars, "not enough mass" and nothing happens (the
// switches stay on). Pass 2 tells every player.
function checkForArmageddon(G) {
  const hs = G.players.filter(p => p.human);
  if (!hs.length || !hs.every(p => p.armageddon || !p.alive) || !hs.some(p => p.alive && p.armageddon)) return {};
  const quiet = G.stars.filter(s => !s.nova);
  G.armMask301 = {}; // the mask is cleared either way; the switches stay on unless it went off
  if (quiet.length < 2) return { fizzled: true };
  const n = quiet.length;
  for (let i = 0; i < n; i++) { const j = RI(G, 0, n - 1); [quiet[i], quiet[j]] = [quiet[j], quiet[i]]; }
  for (let i = 0; i < trunc(n / 2); i++) quiet[i].nova = 200;
  G.armageddons = (G.armageddons || 0) + 1;
  return { fired: true };
}
// CONFIRMED (CheckForSupernova @a33cc, with the Novas option, galaxy +0x18
// bit 2, always set in 3.0.1): a red star's state goes up 10 a turn (the
// remake keeps 5.0.5's scale: 110..200 turning red, the year once gone); at
// the end it goes supernova: each other star less than 11 ly away is hit by
// RND(max(100, 10000 / d - 1000), 10000 / d) metal. Then after 2749, 1 time in
// 100, if no star is red (or went this turn), a star that is quiet and nobody's
// (from a random one on) starts turning red: 3 to 10 turns.
function checkForSupernova(G) {
  const thrown = {};
  G.novaNow301 = [];
  for (const s of G.stars) {
    if (s.nova >= 110 && s.nova < 210) {
      s.nova += 10;
      if (s.nova >= 210) {
        s.nova = G.year + 10; G.novaNow301.push(s.id);
        for (const o of G.stars) {
          if (o === s) continue;
          const d = E.starDist(G, s.id, o.id);
          if (d < 11 && d > 0) { const hi = trunc(10000 / d); const m = RI(G, Math.max(100, hi - 1000), hi); thrown[o.id] = (thrown[o.id] || 0) + m; o.metal += m; }
        }
      }
    }
  }
  if (G.year + 10 > 2749 && RI(G, 1, 100) < 2 && !G.stars.some(s => s.nova >= 110 && s.nova < 210) && !G.novaNow301.length) {
    const n = G.stars.length, i0 = RI(G, 0, n - 1);
    let i = i0;
    do { if (!G.stars[i].nova && G.stars[i].owner === -1) break; i = (i + 1) % n; } while (i !== i0);
    const s = G.stars[i];
    if (!s.nova && s.owner === -1) s.nova = 110 + 10 * RI(G, 0, 7);
  }
  return thrown;
}
// CONFIRMED (ReactToSupernova @a3702): for each player: Armageddon having gone
// off, its switch goes off; every star turning red: "Uh-oh! %s has started
// growing and is turning bright red in hue!" (1000.73), every turn; a star
// that went this turn: "%s has just gone supernova. The planet has been
// obliterated." (.74, not after Armageddon), the player's fleets there are
// lost, its record of the star is wiped, and its colony there is given up;
// then each of its colonies hit by the shock wave loses metal x RND(40, 60)
// people ("The shock wave from the supernova threw %d metal at %s, killing %s
// people.", .75): with no one left it is given up ("The meteor shower
// destroyed your colony at %s.", .71), else the player gets the metal.
function reactToSupernova(G, p, armFired, thrown) {
  if (armFired) p.armageddon = false;
  for (const s of G.stars) {
    if (s.nova >= 110 && s.nova < 210) { if (p.human) msg(G, p.id, `Uh-oh! ${s.name} has started growing and is turning bright red in hue!`, { icon: 'm9036', star: s.id, quiet: true }); know(G, p, s.id).nova = s.nova; continue; }
    if (!(G.novaNow301 || []).includes(s.id)) continue;
    if (!armFired && p.human) msg(G, p.id, `${s.name} has just gone supernova. The planet has been obliterated.`, { icon: 'm9036', sound: 7020, star: s.id });
    for (const f of G.fleets.slice()) if (f.owner === p.id && f.star === s.id && f.to == null) G.fleets.splice(G.fleets.indexOf(f), 1);
    const k = know(G, p, s.id); k.explored = false; k.owner = -1; k.pop = 0; k.nova = s.nova;
    if (s.owner === p.id) decolonize(G, p, s.id);
  }
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], m = thrown[sid];
    if (!m) continue;
    const kill = Math.min(popU(s), Math.imul(m, RI(G, 40, 60)));
    setPopU(s, popU(s) - kill);
    if (p.human) msg(G, p.id, `The shock wave from the supernova threw ${m} metal at ${s.name}, killing ${fmt(kill * 1000)} people.`, { icon: 'm9036', star: sid });
    if (popU(s) === 0) { if (p.human) msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', star: sid }); decolonize(G, p, sid); }
    else { p.metal += m; s.metal -= m; }
  }
}
// CONFIRMED (GetOtherScrapMetal @a3abe): metal scrapped over one of your
// colonies by someone else (it fell onto the planet) is picked up: "You just
// received %s metal from someone scrapping a fleet over %s." (1000.115)
function getOtherScrapMetal(G, p) {
  const so = G.scrapOver301 || {};
  for (const sid of colSlots(G, p)) {
    const s = G.stars[sid], m = so[sid];
    if (!m || !(popU(s) > 0)) continue;
    p.metal += m; s.metal -= m; so[sid] = 0;
    if (p.human) msg(G, p.id, `You just received ${fmt(m)} metal from someone scrapping a fleet over ${s.name}.`, { icon: 'm9046', star: sid });
  }
}
// CONFIRMED (ComputeIncomeAndPopulation @a3bba): the Savings slot's share20 of
// this turn's money goes into Ship Savings; interest on Ship Savings (10 x
// isqrt, or 15% of a debt) for next turn; then the refunds into Ship Savings.
// Then for each colony slot in order: a colony whose star had a battle won by
// someone else (or none of whose people are left) is given up; a meteor
// shower (ships scrapped in hyperspace) kills 50 people a unit of metal, "Oh
// no! %s people were killed when a heavy meteor shower hit %s." (1000.65),
// "The meteor shower destroyed your colony at %s." (.71); a colony not
// starving grows (as 5.0.5; maximum max(10, 500,000 - 12 H), +10% with the
// bonus; "%s's population growth rate has slowed.", .29); its income; "%s has
// just become a profitable colony." (.27), "It's a baby boom! ..." (.28).
// Next turn's money is the profitable colonies' income; the net (player +8)
// is the interest plus every colony's income; the borrowing limit -5 x the
// gross income.
function income(G, p) {
  const savShare = Math.max(0, share20(p.tm || 0, keyPm(p, 'sav')));
  p.savings += savShare;
  const I = interestOn(p, p.savings);
  p.oInterest = I;
  p.savings += p.oRefund || 0; p.oRefund = 0;
  let gross = 0, net = I;
  p.tm = 0;
  for (const sid of colSlots(G, p).slice()) {
    const s = G.stars[sid], w = (G.bw301 || {})[sid];
    if (s.owner !== p.id || (w != null && (w !== p.id || !(popU(s) > 0)))) { decolonize(G, p, sid); continue; }
    const m = G.meteors && G.meteors[sid];
    if (m > 0) {
      const kill = Math.min(popU(s), m * 50);
      setPopU(s, popU(s) - kill);
      if (p.human) msg(G, p.id, `Oh no! ${fmt(kill * 1000)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', star: sid });
      if (popU(s) === 0) { if (p.human) msg(G, p.id, `The meteor shower destroyed your colony at ${s.name}.`, { icon: 'm9036', sound: 2001, star: sid }); decolonize(G, p, sid); continue; }
    }
    const before = s.oInc == null ? -7501 : s.oInc;
    const h = hab(p, s), mx = O.maxPopU(p, s);
    let u = popU(s);
    if (!s.oStarve) {
      let add;
      if (u < mx) {
        if (before < -7499) add = Math.min(trunc(mx / 1000), 2 * u) + RI(G, 0, 5);
        else {
          const base = trunc(mx / 20) + RI(G, 0, trunc(mx / 100)), r = RI(G, 0, 5);
          add = base < 2 * u + r ? trunc(mx / 20) + RI(G, 0, trunc(mx / 100)) : 2 * u + RI(G, 0, 5);
          if (u + add >= mx && p.human) msg(G, p.id, `${s.name}’s population growth rate has slowed.`, { icon: 'm9030', star: sid, quiet: true });
        }
      } else add = trunc(mx / 1000) + RI(G, 0, trunc(mx / 10000));
      u += add; setPopU(s, u);
    }
    const inc = incomeU(u, h.H);
    s.oInc = inc;
    if (inc > 0) { p.tm += inc; gross += inc; }
    net += inc;
    if (before < 0 && inc >= 0) { s.everProfit = true; if (p.human) msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 2000, star: sid }); }
    if (before < -7499 && inc > -7500 && p.human) msg(G, p.id, `It’s a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', star: sid });
  }
  p.oInc = gross; p.net301 = net;
  p.lastGross = gross; p.lastIncome = net - I; p.lastInterest = I; p.lastNet = net;
}
// CONFIRMED (ColonizeAndExplore @a4414, 2.0's FUN_1040_2fa8): each fleet of the
// player's at an ally's colony (or its own) is refuelled, and at its own a fleet
// of colony ships is loaded; then each fleet at a star, in its list order: an
// empty one is removed, the star is marked as having the player's ships,
// explored (ExploreStar @a549e: "You have explored %s. ..." the first time),
// and, if it isn't the player's or an ally's and the fleet is loaded, colonized
// (ColonizeStar, 10 colonists a ship); a fleet with a destination has its route
// checked; then every colony is explored again; then the player hears of each
// ally's fleet that arrived at its colony or where it has ships ("%s's fleet
// of %s has arrived at %s.", 1000.24).
function colonizeAndExplore(G, p) {
  const fl = fleetList(G, p).filter(f => f.star != null && f.to == null);
  for (const f of fl) {
    const o = G.stars[f.star].owner;
    if (o < 0 || !isAllied(G, p.id, o)) continue;
    f.fuel = fleetMaxRange(G, f);
    if (o === p.id) { let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id]; if (c > 0) f.colonists = c * 10; }
  }
  const pres = G.present301 || (G.present301 = {});
  for (const f of fl) {
    if (!G.fleets.includes(f)) continue;
    if (fleetCount(f) === 0) { G.fleets.splice(G.fleets.indexOf(f), 1); continue; }
    const s = G.stars[f.star];
    (pres[s.id] = pres[s.id] || new Set()).add(p.id);
    exploreStar(G, p, s.id);
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (s.owner !== p.id && (f.colonists || 0) > 0 && c > 0 && !(s.owner >= 0 && isAllied(G, p.id, s.owner))) {
      G.stat.colonized++;
      settle(G, p, s, { colonists: c * 10 });
      f.colonists = 0;
    }
  }
  replan(G, p);
  for (const sid of colSlots(G, p)) if (G.stars[sid].owner === p.id) exploreStar(G, p, sid);
  for (const a of G.arr301 || []) {
    if (a.o === p.id || !isAllied(G, a.o, p.id)) continue;
    if (G.stars[a.sid].owner === p.id || (pres[a.sid] && pres[a.sid].has(p.id)))
      if (p.human) msg(G, p.id, E.report(26, G.players[a.o].name, a.label, G.stars[a.sid].name), { icon: 'm9038', star: a.sid });
  }
}
// CONFIRMED (ExploreStar @a549e): the player's record of a star is brought up
// to date (year, gravity, temperature, metal, owner); "You have explored ..."
// (1000.30) only if it had never been explored
function exploreStar(G, p, sid) {
  const k = know(G, p, sid);
  if (k.seen === G.turn && k.explored) return;
  const first = !k.explored;
  observe(G, p, sid);
  if (first && p.human) {
    const s = G.stars[sid], q = O.exploreQuality(G, p, s);
    msg(G, p.id, `You have explored ${s.name}. Gravity: ${(E.seenG(p, s)).toFixed(2)}G. Temp: ${Math.round(E.seenT(p, s))}°. Metal: ${fmt(s.metal)}.`, { icon: q === 'good' ? 'm9027' : q === 'mediocre' ? 'm9028' : 'm9029', sound: q === 'good' ? 6000 : q === 'mediocre' ? 6002 : 6001, star: sid, explore: q });
  }
}
// CONFIRMED (ColonizeStar @a566a): "You have colonized %s." (1000.31); the new
// slot goes in front of the colonies (after Savings and Technology); 10
// colonists a ship; income -7,501 (the net drops by as much); bars Terraform
// 900 / Mine 100 (gravity no more than 2.56 times yours), else Mine 1,000; at
// your own temperature Terraform is done (-1) and the $5,000 counted as sunk;
// with no metal Mine is done (-1). Its share: none if both are done, else
// 7,500,000 / this turn's money per mille when that is over $20,000
// (GiveBarPercent, below).
function settle(G, p, s, f) {
  const L = slots301(G, p);
  if (L.includes(s.id) && s.owner === p.id) return;
  const n = f && f.colonists ? f.colonists : 10;
  if (p.human) msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
  const i = L.indexOf(s.id); if (i >= 0) L.splice(i, 1);
  L.splice(firstCol(L), 0, s.id);
  (p.colOrder || (p.colOrder = [])).unshift(s.id);
  s.owner = p.id; setPopU(s, n); s.everProfit = false; s._warned = false;
  s.oInc = -7501; s.oSink = 0; s.oStarve = false; s.oNew = false; s.abandon301 = false; s.done301 = false;
  p.net301 = (p.net301 || 0) - 7501;
  let T, X;
  if (hab(p, s).gR <= 256) { T = 900; X = 100; } else { T = 0; X = 1000; }
  if (t10(s.t) === t10(p.homeT)) { s.oSink = 5000; T = -1; X = 1000; }
  if (s.metal === 0) X = -1;
  setBars(s, T, X);
  p.budget.col[s.id] = 0;
  if (T === -1 && X === -1) giveBarPercent(G, p, s.id, 0);
  else if ((p.tm || 0) > 20000) giveBarPercent(G, p, s.id, trunc(7500000 / p.tm));
}
// CONFIRMED (GiveBarPercent @d1d40, DetermineNewLevels @d1e1e,
// ComputeMinPercent @d2a94, ComputeMaxPercent @d28f8): 2.0's redistribution
// (rules-dos giveShare20) with 3.0.1's bounds: the slot's share is raised to
// pm; the others, but those being abandoned, give it up in proportion (each
// ceil(left x its share / their total)), none below 0, round after round; then
// a total outside 990..1010 is brought to 1,000 one per mille at a time, first
// keeping each colony under its most (the cost of finishing its terraforming
// and mining against the net income: ceil(cost x 1001 / net)) and above 0,
// then without bounds.
function computeMax(G, p, k) {
  if (typeof k !== 'number') return 1000;
  const s = G.stars[k];
  if (s.abandon301 || s.done301) return 0;
  const [T, X] = bars(s);
  let a = 0;
  if (T > 0) a = terraCost(p, Math.abs(t10(p.homeT) - t10(s.t)));
  if (X > 0) a += mineMoney(p, Math.floor(s.metal) + 10);
  const N = p.net301 || 0;
  if (!(a < N && N > 0)) return 1000;
  const v = a < 1000000 ? trunc((a * 1001 + N - 1) / N) : trunc(a / trunc(N / 1001));
  return clamp(v, 0, 1000);
}
function giveBarPercent(G, p, sid, pm, noMax) {
  if (pm < 0 || pm > 1000) pm = 0;
  const L = slots301(G, p).filter(k => typeof k !== 'number' || G.stars[k].owner === p.id);
  const idx = L.indexOf(sid); if (idx < 0) return;
  const v = L.map(k => keyPm(p, k)), mx = L.map(k => noMax ? 1000 : computeMax(G, p, k));
  const frozen = L.map((k, i) => i === idx || (typeof k === 'number' && (!!G.stars[k].abandon301 || !!G.stars[k].done301)));
  const delta = pm - v[idx];
  let free = frozen.filter(x => !x).length;
  if (delta > 0) {
    let rem = delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (!frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) break;
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (frozen[i]) continue;
        const nv = clamp(v[i] - trunc((sum + r0 * v[i] - 1) / sum), 0, 1000);
        if (0 < nv) { rem -= v[i] - nv; v[i] = nv; }
        else { rem -= v[i]; v[i] = 0; frozen[i] = true; }
      }
    }
  } else if (delta < 0) {
    let rem = -delta;
    while (rem > 0 && free > 0) {
      let sum = 0; free = 0;
      for (let i = 0; i < L.length; i++) if (!frozen[i]) { sum += v[i]; free++; }
      if (sum === 0) { for (let i = 0; i < L.length; i++) if (!frozen[i]) { v[i] = 1; sum++; } v[idx] -= sum; }
      const r0 = rem;
      for (let i = 0; i < L.length; i++) {
        if (frozen[i]) continue;
        const nv = v[i] + trunc((sum + r0 * v[i] - 1) / sum);
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
        if (tot > 1000 && v[i] > 0) { v[i]--; tot--; }
      }
      if (++i === L.length) i = 0;
    }
  };
  if (tot < 990 || tot > 1010) fix(true);
  if (tot < 990 || tot > 1010) fix(false);
  L.forEach((k, i) => setKeyPm(p, k, v[i]));
}
// CONFIRMED (DoHBarClick @d18a0): dragging a budget bar (not of a colony
// being abandoned or finished) sets its share and calls DetermineNewLevels
// with every other slot between 0 and 1,000 (not ComputeMaxPercent's most).
// 3.0.1 does this at every step of the drag, from where the last step left
// the shares; the remake's bars give only where the drag ends (from the
// shares as the drag began).
function dragShare(G, p, key, pm) {
  const k = key === 'savings' ? 'sav' : key;
  if (typeof k === 'number' || /^\d+$/.test(k)) { const s = G.stars[+k]; if (!s || s.abandon301 || s.done301) return; giveBarPercent(G, p, +k, pm, true); return; }
  giveBarPercent(G, p, k, pm, true);
}
// CONFIRMED (DecolonizeStar @a5ac0; 2.0's FUN_1040_38c0): a colony given up:
// the player's fleets of colony ships at the star are loaded, the colony's
// share is added to the Savings slot, the slot is taken out, and the star is
// nobody's
function decolonize(G, p, sid) {
  const s = G.stars[sid];
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== sid || f.to != null) continue;
    let c = 0; for (const d of fleetDesigns(G, f)) if (d.type === 'colony') c += f.ships[d.id];
    if (c > 0) f.colonists = c * 10;
  }
  const L = slots301(G, p), i = L.indexOf(sid);
  if (p.budget.col[sid] != null) { setKeyPm(p, 'sav', keyPm(p, 'sav') + keyPm(p, sid)); delete p.budget.col[sid]; }
  if (i >= 0) L.splice(i, 1);
  const k = know(G, p, sid); if (k.owner === p.id) k.owner = -1;
  if (s.owner === p.id) { s.owner = -1; s.pop = 0; }
  s.abandon301 = false; s.done301 = false;
  if (s.owner < 0) { delete s.bars; delete s._bsig; }
}
// CONFIRMED (RestoreStarsBars @a2e4c, end of pass 1 and of pass 2; 2.0's
// FUN_1040_269d with two bars): a colony's bars above 0 are scaled to fill
// 1,000; with none above 0, unless both are done, the one not done gets 1,000
// (Terraform when neither is)
function restoreStarsBars(G, p, s) {
  if (s.owner !== p.id) return;
  let [T, X] = bars(s);
  const tot = Math.max(0, T) + Math.max(0, X);
  if (tot === 0) { if (T !== -1 || X !== -1) { if (T === -1) X = 1000; else T = 1000; } }
  else {
    if (T > 0) T += trunc(T * (1000 - tot) / tot);
    if (X > 0) X += trunc(X * (1000 - tot) / tot);
  }
  setBars(s, T, X);
}
// CONFIRMED (SetPlanetDisplayValues @a4b60, called for each player in pass 2
// right after RestoreStarsBars, EndTurn @a0d0a): for each colony slot in
// order, a planet at your own temperature with Terraform not done has it set
// done (-1) and Mine, if not done, 1,000; a planet away from it (global
// warming) with Terraform done gets Terraform 1,000 less Mine (1,000 when Mine
// is done); a planet with no metal left with Mine not done has it set done and
// Terraform, if not done, 1,000. A colony with both bars done is marked
// finished (slot +0x10, cleared otherwise); then each finished colony with a
// share has it given away (GiveBarPercent(slot, 0)). DetermineNewLevels leaves
// a finished colony's share alone, ComputeMaxPercent gives it 0, and the
// computers' ResolveSpending @93abc passes over it.
function setPlanetDisplayValues(G, p) {
  const L = colSlots(G, p);
  for (const sid of L) {
    const s = G.stars[sid];
    let [T, X] = bars(s);
    const home = t10(s.t) === t10(p.homeT);
    if (home && T >= 0) { T = -1; if (X >= 0) X = 1000; }
    if (!home && T === -1) T = X < 0 ? 1000 : 1000 - X;
    if (Math.floor(s.metal) === 0 && X >= 0) { X = -1; if (T >= 0) T = 1000; }
    setBars(s, T, X);
    s.done301 = T < 0 && X < 0;
  }
  for (const sid of L) if (G.stars[sid].done301 && keyPm(p, sid) !== 0) giveBarPercent(G, p, sid, 0);
}
// CONFIRMED (DetectBigBattles @a4a20): at every star where a big battle took
// place this turn, a player whose record was last brought up to date, and last
// heard of a battle, more than 10 years ago hears "The amount of energy
// emanating from %s suggests a big battle just took place." (1000.84) and its
// record gets the year
function detectBigBattles(G, p) {
  for (const sid in G.big301 || {}) {
    const k = know(G, p, +sid), x = x301(G, p, +sid), yr = G.year + 10;
    const seenYr = k.explored ? 2000 + 10 * (k.seen + 1) : 0;
    if (!(seenYr < yr - 10 && x.by < yr - 10)) continue;
    if (p.human) msg(G, p.id, `The amount of energy emanating from ${G.stars[sid].name} suggests a big battle just took place.`, { icon: 'm9025', star: +sid, quiet: true });
    x.by = yr; k.battle = true;
  }
}

// ---------- surrender (SurrenderIfDesired @a1760, DoSurrenders @a482a) ----------
// CONFIRMED: at the start of the turn a surrendering player's fleets are all
// marked for scrapping (ScrapFleetsAndTypes scraps them in pass 1: metal on the
// star, or raining on the next stop from hyperspace, over another player's
// colony to its owner), its colonies are given up, and its Total Money plus
// Ship Savings (not below 0) and its metal are kept for the winner: "You have
// just surrendered (to %s)." (1000.91-.92). In pass 2 every other player hears
// "%s has just surrendered (to %s)." (.89-.90); the winner gets the money into
// Ship Savings and the metal, and colonizes, as with one colony ship (10
// colonists, "You have colonized %s."), each of the stars that is nobody's or
// the loser's and where no third player who isn't an ally of the loser has
// been marked this turn as having ships (players before the winner in pass 2).
function processSurrenders(G) {
  G.handovers = [];
  for (const p of G.players) {
    if (p.surrenderTo == null || !p.alive || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    const stars = colSlots(G, p).slice();
    for (const sid of stars) decolonize(G, p, sid);
    // (the engine runs no pass 1 for a player who has surrendered, so its
    // fleets are scrapped here, as ScrapFleetsAndTypes would right after)
    for (const f of fleetList(G, p)) scrap301(G, f);
    const h = { from: p.id, to, money: Math.max(0, (p.tm || 0) + p.savings), metal: p.metal, stars };
    p.net301 = 0; p.tm = 0; p.oInterest = 0; p.savings = 0; p.metal = 0; p.surrendered = true; p.armageddon = false;
    msg(G, p.id, to >= 0 ? `You have just surrendered to ${G.players[to].name}.` : 'You have just surrendered.', { icon: 'p3040', sound: 7020 });
    G.handovers.push(h);
  }
}
function doSurrenders(G, p) {
  for (const h of G.handovers || []) {
    if (h.from === p.id) continue;
    if (p.human) msg(G, p.id, h.to >= 0 ? `${G.players[h.from].name} has just surrendered to ${G.players[h.to].name}.` : `${G.players[h.from].name} has just surrendered.`, { icon: 'm9036' });
    if (h.to !== p.id) continue;
    p.savings += h.money; p.metal += h.metal;
    for (const sid of h.stars) {
      const s = G.stars[sid], pres = (G.present301 || {})[sid];
      let blocked = false;
      for (const q of G.players) if (q.id !== p.id && q.id !== h.from && !isAllied(G, h.from, q.id) && pres && pres.has(q.id)) blocked = true;
      if (blocked || !(s.owner === -1 || s.owner === h.from)) continue;
      exploreStar(G, p, sid);
      settle(G, p, s, { colonists: 10 });
    }
  }
}

// ---------- alliances (ConformPlayerAlliances @a2f76, AreAllies @e09d2) ----------
// CONFIRMED: an alliance is two players who both want it. At the end of the
// turn each player still in the game hears of every change since the last:
// "%s has offered to ally with you." / "no longer wants to" (1000.78-.79),
// "You have offered to ally with %s." / "no longer want to" (.80-.81), and
// "You have formed an alliance with %s." / "Your alliance with %s is gone."
// (.82-.83), all that apply (5.0.5 tells only the alliance when one forms);
// and, unless Armageddon has just gone off, of every other player's
// Armageddon switch turned on or off ("%s's armageddon device has just been
// turned on!" / "Whew! %s's armageddon device was just turned off.", .113-.114)
function pactNews(G) {
  const prev = G.pactPrev || {}, cur = {};
  for (const p of G.players) cur[p.id] = (p.allies || []).slice();
  const had = (snap, a, b) => !!(snap[a] && snap[a].includes(b));
  const live = (p) => p.alive && !p.surrendered;
  const armPrev = G.armPrev301 || {}, armCur = G.armMask301 || {};
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
    if (!G.armFired301 && p.human) {
      if (!armPrev[q.id] && armCur[q.id]) msg(G, p.id, `${q.name}’s armageddon device has just been turned on!`, { icon: 'm9036' });
      if (armPrev[q.id] && !armCur[q.id]) msg(G, p.id, `Whew! ${q.name}’s armageddon device was just turned off.`, { icon: 'm9036' });
    }
  }
  G.pactPrev = cur;
}

// ---------- the end of the game (DoGameEndStuff @a6d06, CheckForWinner @a731a, CheckEndGame @12085a) ----------
// CONFIRMED (DoGameEndStuff, every 10-year step, in pass 2): a player with no
// colonies and no fleet of colony ships is out: its money, Ship Savings and
// metal go to 0; next turn's pass 1 scraps every fleet it has left
// (ScrapFleetsAndTypes). A player who is out but has a colony or colony ship
// again is back. Every human hears "%s has just been eliminated from the
// game." / "You have just been eliminated from the game." (1000.66-.67,
// CheckEndGame when the turn opens).
function doGameEndStuff(G, p) {
  const out = !colSlots(G, p).some(sid => G.stars[sid].owner === p.id) && !G.fleets.some(f => f.owner === p.id && E.fleetHas(G, f, 'colony'));
  if (out) {
    p.savings = 0; p.metal = 0; p.tm = 0; p.oInc = 0; p.net301 = 0;
    if (!p.alive) return;
    p.alive = false; p.allies = [];
    for (const q of E.humans(G)) {
      if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
      else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
    }
  } else if (!p.alive && !p.surrendered && !G.over) p.alive = true;
}
// CONFIRMED (CheckForWinner, at the end of every 10-year step): from 2010,
// with more than one player, when every player still in is allied with every
// other, the game is won: at once by a lone player, but an alliance must hold
// for one more turn ("Your alliance will win the game next turn if it holds!",
// 1000.106). "Congratulations! You won the game." / "%s has just won the
// game." (1000.69, .68), for each winner (CheckEndGame).
function checkElimination(G) {
  const humans = E.humans(G);
  if (!G.over && G.year + 10 > 2009 && G.players.length > 1) {
    const alive = G.players.filter(p => p.alive && !p.surrendered);
    const allied = alive.length > 0 && alive.every(a => alive.every(b => isAllied(G, a.id, b.id)));
    if (!allied) G.allyWarn = false;
    else if (!G.allyWarn && alive.length > 1) {
      G.allyWarn = true;
      for (const q of alive) if (q.human) msg(G, q.id, 'Your alliance will win the game next turn if it holds!', { icon: 'p3030', sound: 2000 });
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
  // GUESS (the remake's): every human is out, so the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
}

// ---------- a computer gives up a colony (AddColonySupportActions @90356) ----------
// CONFIRMED: the colony is marked (slot +0xf); MaintainKillStars gives it up
// at the start of the money
// a computer marks a colony to be given up (AddColonySupportActions @90356:
// slot +0xf set to 1)
function abandon(G, p, sid) { G.stars[sid].abandon301 = true; }
// CONFIRMED (DoGalaxyMenu @f3ece-f4110): a human's Abandon is a toggle on the
// colony (slot +0xf). Turning it on asks first: "Do you really want to abandon
// a profitable planet?" (DITL 3410) when the colony's income is 0 or more, "...
// a planet that will be profitable very soon?" (DITL 3420) when it is between
// -$7,500 and 0, and two jokes for a star named "Hope" (DITL 3020) or "Ship"
// (DITL 3030); OK goes on. On, the colony's income comes off the net (player
// +8); off, it goes back on; either way the colony's share goes to 0 and the
// others take it up (GiveBarPercent(slot, 0)). MaintainKillStars gives the
// colony up at End Turn. The remake's Evacuate button is this command (its own
// confirmation stands for 3.0.1's).
function evacuate301(G, p, sid) {
  const s = G.stars[sid];
  if (s.owner !== p.id || !colSlots(G, p).includes(sid)) return;
  s.abandon301 = !s.abandon301;
  p.net301 = (p.net301 || 0) + (s.abandon301 ? -1 : 1) * (s.oInc || 0);
  giveBarPercent(G, p, sid, 0);
}
// a fleet or a design marked for scrapping (fleet +7, design +0x88), scrapped
// by ScrapFleetsAndTypes in pass 1. The skin calls these for a human's
// commands and shows f.scrap301 / d.scrap301 as the mark.
// CONFIRMED (ScrapCurrentFleet @133a24, Ships menu item 5, DoShipsMenu
// @f3e02): "Scrap Current Fleet" toggles the mark (fleet +7 = 1 - itself;
// the menu item reads "Don't Scrap Current Fleet" while it is set, STR#
// 1010.9-10, SetMenuItems @f4878/@f488a), with sound 7003 when it sets it. A
// fleet built this turn (+9) is not marked: its purchase is undone, the
// money (and the prototype's price when none of the design is left built)
// and the metal go back, the interest is worked out again, and the fleet is
// removed. `how`: left out or true, mark it (the computers' scrapping);
// false, unmark it; 'command', a human's Scrap Current Fleet (toggles, or
// undoes the purchase). Returns 'unbuilt' when the purchase was undone, else
// whether the fleet is now marked.
function flagScrap(G, f, how) {
  const p = G.players[f.owner], cmd = how === 'command';
  const on = cmd ? !f.scrap301 : how !== false;
  if (cmd && on && f.newThisTurn && f.star != null && f.to == null) {
    const spent = p.spentThisTurn || [];
    for (const k in f.ships) {
      const d = getDesign(G, f.owner, +k), n = f.ships[k];
      for (let i = 0; i < n; i++) {
        const j = spent.map(e => e.did === +k && e.sid === f.star).lastIndexOf(true);
        if (j >= 0) { p.savings += spent[j].money; p.metal += spent[j].metal; spent.splice(j, 1); }
        else if (d) { const c = designCost(G, d); p.savings += c.money; p.metal += c.metal; }
        if (d) d.built = Math.max(0, d.built - 1);
      }
    }
    if (p.human) p.oInterest = interestOn(p, p.savings);
    G.fleets.splice(G.fleets.indexOf(f), 1);
    return 'unbuilt';
  }
  f.scrap301 = !!on;
  return f.scrap301;
}
// CONFIRMED (BuildDesignShips @13146a-1314b0, the Ship Types window's button
// 7): toggles design +0x88; the button reads "Scrap All" or "Don't Scrap"
// (SetButtonStates @132cca-132ce0, Pascal strings @132d36 / @132d42), and a
// marked design can't be bought (button 4 dimmed, @132c44). Marking it gives
// back the ships of it ordered in the window (@1314d4-1315ac; the skin does
// that, as the remake buys at once). `how` as for flagScrap ('command'
// toggles). Returns whether it is now marked.
function flagScrapDesign(G, p, d, how) {
  d.scrap301 = how === 'command' ? !d.scrap301 : how !== false;
  return d.scrap301;
}

// ---------- the budget panel ----------
function projected(G, p) {
  let support = 0;
  for (const s of colonies(G, p.id)) if ((s.oInc || 0) < 0) support += -s.oInc;
  const a = dipAmt(G, p), I = p.oInterest || 0;
  return { gross: p.oInc, income: (p.oInc || 0) - support, interest: I, net: Math.max(0, (p.tm || 0) + a + I - support), dip: a };
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
// CONFIRMED (CreatePlayer @f26a0): every player's message list starts with
// reports 1000 and 1001, STR# 1000.1-2
const WELCOME = [
  ['Spaceward Ho! Version 3.0.1 by Peter Commons.', { icon: 'm9004', sound: 11111 }],
  ['Artwork by Howard Vives and Bob Van de walle.', { icon: 'm9024' }],
];

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

// CONFIRMED: STR# 1003 "Star Names", 191 names (7 letters at most): 2.0's 190
// and "Hope"
const STAR_NAMES = D.starNames.concat(['Hope']);

E.registerRules('301', Object.assign({}, D, {
  label: 'Mac 3.0.1 (1993)',
  // the New Game window's Version and Edition menus (engine.js editions)
  family: '3.0', edition: { version: '3.0.1', name: 'Mac', platform: 'Mac', year: 1993 }, skins: ['mac3c', 'mac3'],
  hints: false, // this game had no between-turn tips (4.0.5 and 5.0.5 do)
  // the New Game window lists rulesets by year, then version (engine.js ruleOptions)
  version: '3.0.1', platform: 'Mac', year: 1993,
  // the unofficial 3.0.1.1 patch (engine.js fixed; docs/fixes.md, "3.0.1"):
  // 3.0.1's own list (2.0's, rules-dos FIXES20, isn't inherited); the
  // computers ask for each in js/ai-301.js
  patchVersion: null, // its own (3.0.1.1), not 2.0's
  fixes: [
    { id: 'skip2010', title: 'The computers play their first turn on Spiral and Cluster maps',
      text: 'On Spiral and Cluster maps the computers did nothing in 2010: a mark set so the map would be laid out in 2010 was never cleared. The patch lets them plan from the first turn, as 4.0.5 does.' },
    { id: 'refuelCheck', title: 'Stranded fighters ask for a colony only when they are stranded',
      text: 'A computer’s fighter fleet low on fuel looked for a colony within reach, but the test of the answer read a flag cleared just before, so it always asked for a new colony where it was. The patch asks only when no colony is within the fuel it has left.' },
    { id: 'colonyBars32', title: 'The computers’ colony bars no longer overflow',
      text: 'When a computer gave a colony more than $2,147,483 for one part, the sum overflowed and the colony’s bars came out wrong. The patch works them out without overflowing.' },
    { id: 'scrapRange', title: 'Old ships sent home are routed with their own Range',
      text: 'When the computers sent old ships home, the program passed the fleet’s place in a list where the route finder wants its Range. It made no difference to play (the colony is always within reach); the patch passes the Range.' },
  ],
  ai: '301',               // its own computer players (js/ai-301.js)
  maxPlayers: 20,          // CONFIRMED (doCreateGalaxyDlg @f0550): 0-19 computers
  maxDesigns: MAX_DESIGNS,
  chatLimit: 10,           // CONFIRMED (SendAMessage @95f14, STR# 1020.17): ten messages a turn
  plainTechMessages: true, // CONFIRMED (STR# 1000.3-7): "Your Range Technology has reached level N."
  queueSlots: undefined, queueMergeAny: undefined, yardProgress: undefined, yardRefund: undefined, canMerge: undefined, organized: organized301,
  // CONFIRMED: no stances, no "arrive late", no best buddies (no text or code);
  // the arrival messages are fleetArrives' and colonizeAndExplore's
  features: { arrivalNotices: false, alliances: true, gifts: true, surrender: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  // CONFIRMED (DoGalaxyMenu @f3ece): 3.0.1 has an Abandon command (evacuate301)
  evacuateCommand: true,
  bestBuddies: false,      // no best buddies (see above)
  canBuild: (G, p, type) => TYPES4.includes(type),
  starNames: STAR_NAMES,
  SKILLS, HIT, hit, SHAPES: W.SHAPES, SIZES: W.SIZES, interestOn, techLevelCost, research, aiSpec,
  setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance: W.distance, galaxySizes: O.galaxySizes,
  designCost, designLimits, designMin, paysPrototype, shotsPerShip, planetShots, borrowLimit,
  // the turn: pass 1 for every player (economy), the moves, the battles, then
  // the novas and pass 2 for every player (pass2, run in the refuel slot)
  economy, economyForAll: true, afterMovement: null, refuel: pass2, randomEvents: (G) => { if (G.meteors) G.meteors = {}; },
  disposable: O.disposable, projected, underfunded: undefined, battle, battleEverywhere: true,
  fleetArrives, arrivalSays: () => false, canColonize: () => false, colonyShipUsedUp: false,
  mineMetal, mineMoney, terraCost, terraStep, incomeU, idleTech,
  planetIncome: (G, p, s) => incomeU(popU(s), hab(p, s).H),
  exploreQuality: O.exploreQuality, planetClass: O.planetClass, observe: null, outComputersPlay: false,
  scrapReturn: (G, p) => p.human ? 3 / 4 : 1, scrapInSpace: O.scrapInSpace,
  scrapAt: (G, pid, s, metal) => { s.metal += metal; const so = G.scrapOver301 || (G.scrapOver301 = {}); so[s.id] = Math.min(32767, (so[s.id] || 0) + trunc(metal)); },
  finishedPartWasted: false,
  difficulty, masterPoints: undefined,
  // fleets, routes and colonies
  fleetFor, route, path301, givePath, settle, colOrder, abandon, evacuate: evacuate301, dragShare, flagScrap, flagScrapDesign, newDesign, fleetList,
  terraLeft: (G, p, s) => bars(s)[0] !== -1, bars, setBars, slots301, share20, keyPm, setKeyPm,
  // diplomacy and the end of the game (engine hooks)
  processSurrenders, processHandovers: () => {}, pactNews, checkElimination, checkEveryStep: true,
  maleNames: MALE_NAMES, femaleNames: FEMALE_NAMES, femaleComputers: 0.5, shipNames: SHIP_NAMES, designName,
  welcome: WELCOME,
  x301, att301, shipPower: att301, aiYear: null, aiBigShares: undefined, setColonyBars: undefined,
}));
})(this);
