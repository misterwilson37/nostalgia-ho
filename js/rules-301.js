// Spaceward Ho! web remake — the "Mac 3.0.1" ruleset.
//
// Spaceward Ho! 3.0.1 for the Macintosh (Delta Tao, 1993, 68k) is the first
// colour version. Its turn engine is an earlier build of the one behind 4.0.5
// and 5.0.5, so this ruleset starts from the "Original" (5.0.5) rules
// (js/rules-original.js), reuses the 4.0.5 galaxy, battles and novas
// (js/rules-405.js) where 3.0.1 does the same thing, and replaces only what
// 3.0.1 does differently.
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
}
// CONFIRMED (CreatePlayer, DoSomethingRadical @a5d4e): Scout R+2 W-1 S-1,
// Satellite R0, Fighter and Colony Ship at your tech (no Colony Mini/3).
// GUESS: the computers design their ships the same way.
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
  const gal = W.makeGalaxy(G, opts, nPlayers);
  for (const q of gal.pts) { q.x -= 1; q.x10 -= 20; } // 4.0.5 leaves 4 ly; 2 ly = 1 map unit
  return gal;
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
        let best = null; for (const q of G.players) if (q.id !== p.id && q.tech[t] > p.tech[t] && (!best || q.tech[t] > best.tech[t])) best = q;
        if (best) { p.tech[t] = best.tech[t]; say(`Your spies have stolen some technological secrets from ${best.name}!`, 'm9040'); O.techMsg(G, p, t); return; }
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
// The attack rating is max(W^2 (hp/50), W^2 hit(W)(5W+20)/300) with no / 50;
// GUESS: divided by 50 here so the 5.0.5 computer players keep their scale.
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
  const att = trunc(Math.max(a, b) / 50);
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
const designMin = E.RULESETS.dos ? E.RULESETS.dos.designMin : O.designMin;
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
function economy(G, p) { O.economy(G, p, OPT); }
function afterMovement(G, p) {
  // CONFIRMED (GetOtherScrapMetal @a3abe, msg 1000.115): metal scrapped over your colony
  if (G.recv && G.recv.length) for (const r of G.recv.filter(x => x.to === p.id)) {
    p.metal += r.metal;
    msg(G, p.id, `You just received ${fmt(r.metal)} metal from someone scrapping a fleet over ${G.stars[r.sid].name}.`, { icon: 'm9046', star: r.sid });
  }
  if (G.recv) G.recv = G.recv.filter(x => x.to !== p.id);
  O.afterMovement(G, p, OPT);
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

// ---------- the computers' money estimates (GUESS) ----------
// The 3.0.1 computer players were not decoded; the 5.0.5 ones are used, with
// 3.0.1's mining and terraforming prices so they budget the right amounts.
function aiMineMoney(G, p, s, cls, iq) {
  if (cls === 8) return mineMoney(p, iq === 1 ? s.metal + 25 : Math.min(s.metal + 25, 1000));
  return mineMoney(p, Math.min(s.metal + 25, iq <= 2 ? 5000 : 600));
}
function aiTerraMoney(G, p, s, cls, iq) {
  const h = O.hab(p, s);
  return iq === 1 ? terraCost(p, h.dT) : h.dT < 1000 ? 3000 : (p.lastNet < 150000 ? 10000 : 15000);
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
  ai: 'original',
  maxPlayers: 20,          // CONFIRMED (doCreateGalaxyDlg @f0550): 0-19 computers
  maxDesigns: MAX_DESIGNS,
  chatLimit: 10,           // CONFIRMED (STR# 1020.17): ten messages a turn
  plainTechMessages: true, // CONFIRMED (STR# 1000.3-7): "Your Range Technology has reached level N."
  // CONFIRMED: no stances, no "arrive late", no best buddies (no text or code)
  features: { arrivalNotices: true, alliances: true, gifts: true, surrender: true, waypoints: true, luck: true, supernova: true, armageddon: true, dip: true, chat: true, yearsPerTurn: true },
  canBuild: (G, p, type) => TYPES4.includes(type),
  starNames: STAR_NAMES,
  SKILLS, HIT, hit, SHAPES: W.SHAPES, SIZES: W.SIZES, interestOn, techLevelCost, research, aiSpec,
  setupPlayer, defaultDesigns, afterSetup, computerSetup, makeGalaxy, distance: W.distance,
  designCost, designLimits, designMin, paysPrototype, shotsPerShip, planetShots,
  economy, afterMovement, battle: W.battle, randomEvents: W.randomEvents, scrapAt: W.scrapAt,
  mineMetal, mineMoney, terraCost, terraStep, incomeU,
  planetIncome: (G, p, s) => incomeU(popU(s), O.hab(p, s).H),
  difficulty, masterPoints: undefined, aiMineMoney, aiTerraMoney,
}));
})(this);
