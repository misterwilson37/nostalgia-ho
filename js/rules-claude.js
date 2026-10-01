// Spaceward Ho! web remake — the "Claude" ruleset.
// Rules reconstructed from the 5.0.5 manual by Claude; the numbers are
// approximations, not the original formulas (see js/rules-original.js and
// docs/original-findings.md). Moved here unchanged from the old engine.js.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, gauss, clamp, msg, fmt, colonies, know, observe, getDesign, findOrCreateDesign,
  fleetCount, fleetHas, fleetDesigns, fleetMaxRange, fleetLabel, addShipsToStar, techSum, seenG, seenT, dist, DATA, TECHS } = E;

const TYPES = {
  scout:     { name: 'Scout',       plural: 'Scouts',       money: 4000,  metal: 300,   hp: 1,    shots: 1,  dot: 0 },
  dread:     { name: 'Dreadnought', plural: 'Dreadnoughts', money: 90000, metal: 9000,  hp: 25,   shots: 25, dot: 1 },
  fighter:   { name: 'Fighter',     plural: 'Fighters',     money: 6000,  metal: 600,   hp: 1,    shots: 1,  dot: 2 },
  tanker:    { name: 'Tanker',      plural: 'Tankers',      money: 8000,  metal: 800,   hp: 1,    shots: 0,  dot: 3 },
  colony:    { name: 'Colony Ship', plural: 'Colony Ships', money: 25000, metal: 2500,  hp: 1,    shots: 0,  dot: 4 },
  satellite: { name: 'Satellite',   plural: 'Satellites',   money: 3500,  metal: 300,   hp: 0.6,  shots: 2,  dot: 5 },
  bio:       { name: 'Biological',  plural: 'Biologicals',  money: 14000, metal: 0,     hp: 1.4,  shots: 1,  dot: 6 },
  decoy:     { name: 'Decoy',       plural: 'Decoys',       money: 900,   metal: 60,    hp: 0.35, shots: 0,  dot: 2 },
};
const DREAD_TECH = 22;   // sum of range+speed+weapons+shields needed for dreadnoughts

const BASE_UPKEEP = 7500;
const PROD_PER_POP = 375;
const YEARS_PER_TURN = 10;


// ---------- planets ----------
function gravHab(gs) { // 1 at 1.0G, 0 at 2.5G or 0.4G
  return clamp(1 - Math.abs(Math.log(gs)) / Math.log(2.5), 0, 1);
}
function tempFactor(ts) { return clamp(1 - Math.abs(ts - 72) / 220, 0.03, 1); }
function maxPop(G, p, star) {
  return 125 * gravHab(seenG(p, star)) * tempFactor(seenT(p, star)) * (p.bonus.pop || 1);
}
function planetClass(gs) {
  if (gs > 2.5 || gs < 0.4) return 'inhospitable';
  if (gs > 2.0 || gs < 0.5) return 'semi';
  return 'good';
}
function grossOf(G, p, star) { return star.pop * PROD_PER_POP; }


// ---------- tech ----------
function techCost(level) { return 1800 * Math.pow(1.45, level - 1); }


// ---------- ship designs ----------
function designLimits(p, type) {
  const t = p.tech;
  const L = { R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: t.mini };
  if (type === 'scout') { L.R = t.range + 3; L.W = Math.max(1, t.weapons - 1); L.S = Math.max(1, t.shields - 1); }
  if (type === 'bio') { for (const k of ['R', 'V', 'W', 'S']) L[k] = Math.max(1, L[k] - 2); L.M = 1; }
  if (type === 'satellite') { L.R = 0; }
  return L;
}
function designCost(d) {
  const T = TYPES[d.type];
  const R0 = d.type === 'satellite' ? 0 : (d.R - 1) * 0.35;
  const power = R0 + (d.V - 1) * 0.8 + (d.W - 1) + (d.S - 1);
  const mult = 1 + 0.09 * power;
  const mmult = 1 + 0.04 * power;
  const miniMoney = 1 + 0.25 * (d.M - 1);
  const miniMetal = d.type === 'colony' ? 1 + 0.05 * (d.M - 1) : 1 + 0.6 * (d.M - 1);
  const money = Math.round(T.money * mult * miniMoney / 10) * 10;
  const metal = Math.round(T.metal * mmult / miniMetal);
  const proto = Math.round(T.money * (1.2 + 0.6 * (d.M - 1)) / 10) * 10;
  return { money, metal, proto };
}
function borrowLimit(G, p) { return -5 * Math.max(p.lastGross, 1); }

// ---------- galaxy and starting conditions ----------
const SIZES = { small: [24, 13, 9], medium: [42, 17, 12], large: [70, 23, 15], huge: [110, 30, 20] };
function newStar(G) {
  const g = clamp(Math.exp(gauss(G) * 0.5), 0.12, 4.5);
  const t = Math.round(72 + gauss(G) * 120 + (R(G) < 0.5 ? 30 : -10));
  const metal = Math.round(R(G) < 0.1 ? R(G) * 600 : 2500 + Math.pow(R(G), 1.4) * 24000);
  return { g, t, metal };
}
function setupPlayer(G, p, home, start) {
  Object.assign(p, {
    tech: { range: 3, speed: 1, weapons: 1, shields: 1, mini: 1, radical: 1 },
    prog: { range: 0, speed: 0, weapons: 0, shields: 0, mini: 0, radical: 0 },
    talloc: { range: 0.22, speed: 0.14, weapons: 0.22, shields: 0.2, mini: 0.1, radical: 0.12 },
    budget: { tech: 0.3, savings: 0.4, col: {} },
    bonus: { research: 1, mining: 1, pop: 1, terra: 1, generals: 0, recycle: 0.75, saveRate: 0.02, borrowRate: 0.15 },
  });
  home.owner = p.id; home.pop = 100; home.t = p.homeT; home.everProfit = true;
  home.metal = Math.max(home.metal, 9000 + RI(G, 0, 4000));
  p.budget.col[home.id] = 0.3;
  applyStart(G, p, home, start);
}
function applyStart(G, p, home, start) {
  const table = {
    outpost:  { pop: 45, sav: 5000,  metal: 1000, tech: 0 },
    barren:   { pop: 70, sav: 10000, metal: 1500, tech: 0 },
    backward: { pop: 85, sav: 15000, metal: 2000, tech: 0 },
    normal:   { pop: 100, sav: 25000, metal: 3000, tech: 0 },
    advanced: { pop: 100, sav: 30000, metal: 4000, tech: 1 },
    thriving: { pop: 110, sav: 40000, metal: 5000, tech: 1 },
    abundant: { pop: 120, sav: 60000, metal: 8000, tech: 2 },
  }[start] || { pop: 100, sav: 25000, metal: 3000, tech: 0 };
  home.pop = table.pop; p.savings = table.sav; p.metal = table.metal;
  for (const k of ['range', 'speed', 'weapons', 'shields', 'mini']) p.tech[k] += table.tech;
  p.lastGross = home.pop * PROD_PER_POP;
}
function defaultDesigns(G, p) {
  const t = p.tech;
  findOrCreateDesign(G, p, { type: 'scout', R: t.range + 3, V: t.speed, W: Math.max(1, t.weapons - 1), S: Math.max(1, t.shields - 1), M: 1 });
  findOrCreateDesign(G, p, { type: 'colony', R: t.range, V: t.speed, W: 1, S: 1, M: 1 });
  findOrCreateDesign(G, p, { type: 'fighter', R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: 1 });
  findOrCreateDesign(G, p, { type: 'satellite', R: 0, V: t.speed, W: t.weapons, S: t.shields, M: 1 });
}

function afterSetup(G) {
  const opts = G.opts;
  // fairness: give each home a couple of decent nearby planets
  for (const p of G.players) {
    const hs = G.stars[p.homeStar];
    const near = G.stars.filter(s => s.owner < 0).map(s => ({ s, d: dist(s, hs) })).sort((a, b) => a.d - b.d).slice(0, 3);
    near.forEach((o, k) => {
      if (k < 2 && gravHab(seenG(p, o.s)) < 0.45 && !G.players.some(q => q.homeStar !== hs.id && dist(G.stars[q.homeStar], o.s) < o.d)) {
        o.s.g = p.homeG * clamp(Math.exp(gauss(G) * 0.22), 0.7, 1.5);
      }
    });
  }
  // starting extra ships
  for (const p of G.players) {
    const st = p.human ? (opts.start || 'normal') : (opts.cstart || 'normal');
    if (st === 'thriving' || st === 'abundant') {
      const d = p.designs.find(d => d.type === 'colony'); d.free = true; addShipsToStar(G, p.id, p.homeStar, d, 1).newThisTurn = false; d.built++;
    }
    if (st === 'abundant') {
      const d = p.designs.find(d => d.type === 'scout'); addShipsToStar(G, p.id, p.homeStar, d, 1).newThisTurn = false;
      addShipsToStar(G, p.id, p.homeStar, d, 1).newThisTurn = false; d.built += 2;
    }
  }
}

// ---------- economy, research, radical tech ----------
function economy(G, p) {
  const cols = colonies(G, p.id);
  let gross = 0;
  for (const s of cols) gross += grossOf(G, p, s);
  const upkeep = cols.length * BASE_UPKEEP;
  let interest = 0;
  if (p.savings > 0) interest = Math.min(p.savings, 4 * Math.max(gross, 30000)) * p.bonus.saveRate;
  else interest = p.savings * p.bonus.borrowRate; // negative
  const net = gross - upkeep + interest;
  p.lastGross = gross; p.lastIncome = gross - upkeep; p.lastNet = net; p.lastInterest = interest;
  // normalise budget
  const b = p.budget;
  for (const k in b.col) if (!G.stars[k] || G.stars[k].owner !== p.id) delete b.col[k];
  for (const s of cols) if (b.col[s.id] == null) b.col[s.id] = 0.08;
  let tot = b.tech + b.savings; for (const k in b.col) tot += b.col[k];
  if (tot <= 0) { b.savings = 1; tot = 1; }
  const share = (x) => x / tot;
  let techSpend = 0;
  if (net <= 0) {
    p.savings += net;
    if (net < 0 && p.human) msg(G, p.id, 'Warning! After supporting your planets and paying your interest, you have no money to spend!', { icon: 'm9020' });
  } else {
    techSpend = net * share(b.tech);
    p.savings += net * share(b.savings);
    for (const s of cols) {
      let spend = net * share(b.col[s.id] || 0);
      const terraOK = Math.abs(seenT(p, s) - 72) > 0.5;
      const metalOK = s.metal > 0;
      let tf = s.terra;
      if (!terraOK) tf = 0; if (!metalOK) tf = terraOK ? 1 : 0;
      if (!terraOK && !metalOK) { p.savings += spend; continue; }
      const ts = spend * tf, ms = spend - ts;
      if (ts > 0) {
        const before = seenT(p, s);
        const dT = 0.012 * Math.pow(ts, 0.8) * p.bonus.terra;
        const diff = 72 - before;
        if (Math.abs(diff) <= dT) {
          s.t += diff;
          msg(G, p.id, `You have completely terraformed ${s.name}.`, { icon: 'm9017', star: s.id });
          // leftover
          p.savings += ts * (1 - Math.abs(diff) / dT) * 0.9;
        } else s.t += Math.sign(diff) * dT;
        if (planetClass(seenG(p, s)) === 'inhospitable' && !s._warned) {
          s._warned = true;
          msg(G, p.id, `Warning: you are terraforming ${s.name}, a planet that will never become profitable.`, { icon: 'm9013', star: s.id });
        }
      }
      if (ms > 0) {
        const want = 0.9 * Math.pow(ms, 0.85) * p.bonus.mining;
        const got = Math.min(want, s.metal);
        s.metal -= got; p.metal += got;
        if (got < want) p.savings += ms * (1 - got / want);
        if (s.metal <= 0.5) {
          s.metal = 0;
          const bad = planetClass(seenG(p, s)) !== 'good';
          msg(G, p.id, bad ? `${s.name} has run out of metal. You should probably evacuate it.` : `${s.name} has run out of metal.`, { icon: 'm9001', star: s.id });
        }
      }
    }
  }
  // research
  if (techSpend > 0) research(G, p, techSpend);
  else if (p.human && cols.length && net > 0 && b.tech <= 0 && G.turn % 5 === 0) msg(G, p.id, 'You are not spending any money on technology research.', { icon: 'm9011' });
  // population
  for (const s of cols) {
    const mp = maxPop(G, p, s);
    const before = s.pop;
    if (s.pop < mp) s.pop += Math.max(0.25, 0.13 * s.pop * (1 - s.pop / mp)) * (s.boom ? 2 : 1);
    else s.pop -= 0.12 * (s.pop - mp);
    s.pop = Math.min(s.pop, Math.max(mp, s.pop));
    if (s.pop < mp && s.pop > mp) s.pop = mp;
    if (before < mp && s.pop > mp) s.pop = mp;
    if (s.boom) { s.boom--; if (!s.boom) msg(G, p.id, `${s.name}'s population growth rate has slowed.`, { icon: 'm9030', star: s.id }); }
    if (!s.everProfit && s.pop * PROD_PER_POP >= BASE_UPKEEP) {
      s.everProfit = true;
      msg(G, p.id, `${s.name} has just become a profitable colony.`, { icon: 'm9000', sound: 7019, star: s.id });
    }
  }
  // neglect when hopelessly in debt
  if (p.savings < borrowLimit(G, p) * 1.0 && cols.length) {
    msg(G, p.id, 'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!', { icon: 'm9020', sound: 2001 });
    for (const s of cols) { s.pop *= 0.92; s.t += 6; }
  }
  // fleet maintenance if debt is extreme: scrap a fleet
  if (p.savings < borrowLimit(G, p) * 1.3) {
    const f = G.fleets.find(f => f.owner === p.id && !fleetHas(G, f, 'colony'));
    if (f) { msg(G, p.id, 'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.', { icon: 'm9014' }); G.fleets.splice(G.fleets.indexOf(f), 1); }
  }
}

function research(G, p, spend) {
  let tot = 0; for (const k of TECHS) tot += p.talloc[k] || 0;
  if (tot <= 0) return;
  for (const k of TECHS) {
    const s = spend * (p.talloc[k] || 0) / tot;
    if (s <= 0) continue;
    const pts = Math.pow(s, 0.85) * p.bonus.research;
    if (k === 'radical') { p.prog.radical += pts; radicalCheck(G, p); continue; }
    p.prog[k] += pts;
    // baseline level (radical jumps don't move the baseline)
    if (p.base == null) p.base = {};
    if (p.base[k] == null) p.base[k] = p.tech[k];
    let lvl = p.base[k], up = false;
    while (p.prog[k] >= techCost(lvl)) { p.prog[k] -= techCost(lvl); lvl++; up = true; }
    p.base[k] = lvl;
    if (lvl > p.tech[k]) {
      p.tech[k] = lvl;
      const icon = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' }[k];
      const nm = (DATA.techNames[k] || [])[lvl - 1];
      const label = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shield', mini: 'Miniaturization' }[k];
      const t = nm && !/^\d+$/.test(nm) ? `You now have ${nm} ${label} Technology (${lvl}).` : `Your ${label} Technology has reached level ${lvl}.`;
      msg(G, p.id, t, { icon, tech: k });
    }
  }
}
function radicalCheck(G, p) {
  const chance = p.prog.radical / (p.prog.radical + 30000);
  if (R(G) > chance * 0.35) return;
  p.prog.radical = 0;
  const pool = ['metal', 'explore', 'money', 'mining', 'pop', 'terra', 'generals', 'recycle', 'research', 'save', 'borrow', 'decoy', 'bio', 'steal', 'free', 'range', 'speed', 'weapons', 'shields', 'mini'];
  const k = pick(G, pool);
  const say = (t, icon) => msg(G, p.id, t, { icon: icon || 'm9010', sound: 7007 });
  msg(G, p.id, 'Your Radical researchers have just made another wild discovery!', { icon: 'm9010' });
  const cols = colonies(G, p.id);
  switch (k) {
    case 'metal': { const m = RI(G, 500, 2500); for (const s of cols) s.metal += m; say(`Your mining consortium has just been able to extract an additional ${fmt(m)} metal from every planet you have.`, 'm9046'); break; }
    case 'explore': {
      const home = G.stars[p.homeStar];
      const far = G.stars.filter(s => !know(G, p, s.id).explored).sort((a, b) => dist(b, home) - dist(a, home)).slice(0, 4);
      far.forEach(s => observe(G, p, s.id));
      say('Weird weather patterns have allowed astronomers to explore certain far away stars.', 'm9018'); break;
    }
    case 'money': { const m = Math.round(p.lastGross * (1 + R(G) * 2)); p.savings += m; say(`You have found a wealth of precious metals and have increased your savings by $${fmt(m)}`, 'm9048'); break; }
    case 'mining': p.bonus.mining *= 1.2; say('Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.', 'm9046'); break;
    case 'pop': p.bonus.pop *= 1.15; say('Your sociologists have discovered how to safely increase the maximum population of your planets!', 'm9044'); break;
    case 'terra': p.bonus.terra *= 1.25; say('Your climatologists have discovered how to terraform planets more efficiently.', 'm9045'); break;
    case 'generals': p.bonus.generals += 0.1; say('Your military training program has improved. Your generals are now smarter.', 'm9041'); break;
    case 'recycle': p.bonus.recycle = Math.min(0.95, p.bonus.recycle + 0.1); say('You have improved your recycling program. You can now get more metal from scrapped ships.', 'm9014'); break;
    case 'research': p.bonus.research *= 1.1; say('You have built a new research facility; tech spending is now 10% more effective.', 'm9039'); break;
    case 'save': p.bonus.saveRate *= 1.5; say('You\'ve raised the prime lending rate and can now earn 50% higher interest on savings.', 'm9048'); break;
    case 'borrow': p.bonus.borrowRate *= 0.67; say('You have renegotiated your line of credit and can now borrow at a 50% better interest rate.', 'm9047'); break;
    case 'decoy': {
      p.hasDecoy = true; const d = findOrCreateDesign(G, p, { type: 'decoy', R: p.tech.range, V: p.tech.speed, W: 1, S: 1, M: 1 }); d.free = true;
      say('Your scientists have invented a decoy ship. It can\'t fight, but it\'s cheap. Amaze your friends and confuse your enemies.', 'm9049'); break;
    }
    case 'bio': {
      p.hasBio = true; const L = designLimits(p, 'bio');
      findOrCreateDesign(G, p, { type: 'bio', R: L.R, V: L.V, W: L.W, S: L.S, M: 1 });
      say('Your mad scientists have created a space monster ship! It\'s not too powerful, but it doesn\'t cost any metal!', 'm9026'); break;
    }
    case 'steal': {
      const others = G.players.filter(q => q.alive && q.id !== p.id);
      if (!others.length) break;
      const q = pick(G, others); let got = false;
      for (const t of ['range', 'speed', 'weapons', 'shields', 'mini']) if (q.tech[t] > p.tech[t]) { p.tech[t]++; got = true; }
      say(`Your spies have stolen some technological secrets from ${q.name}!`, 'm9040'); break;
    }
    case 'free': { for (const d of p.designs) if (d.built === 0) d.free = true; say('Your ship technicians have designed a set of new ships with no development cost.', 'm9047'); break; }
    default: {
      const n = RI(G, 1, 3); p.tech[k] += n;
      const icon = { range: 'm9005', speed: 'm9006', weapons: 'm9007', shields: 'm9008', mini: 'm9003' }[k];
      const label = { range: 'Range', speed: 'Speed', weapons: 'Weapons', shields: 'Shields', mini: 'Miniaturization' }[k];
      say(`Your ${label} technology just jumped to ${p.tech[k]}.`, icon);
    }
  }
}


// ---------- tankers and biologicals ----------
function refuel(G) {
  for (const f of G.fleets) {
    if (f.star == null || f.sat) continue;
    const s = G.stars[f.star];
    const max = fleetMaxRange(G, f);
    if (s.owner === f.owner) { f.fuel = max; continue; }
    // tankers at star
    let tank = 0;
    for (const g of G.fleets) if (g.owner === f.owner && g.star === f.star && g.to == null) for (const k in g.ships) { const d = getDesign(G, g.owner, +k); if (d && d.type === 'tanker') tank += g.ships[k]; }
    if (tank > 0 && f.fuel < max) {
      const per = tank * 4 / Math.max(1, fleetCount(f) / 6);
      f.fuel = Math.min(max, f.fuel + per);
      if (f.fuel < max) msg(G, f.owner, `There were not enough tankers to fully refuel your fleet of ${fleetLabel(G, f)} at ${s.name}.`, { icon: 'm9038', star: s.id });
    }
    // biologicals eat people to refuel
    if (fleetHas(G, f, 'bio') && s.pop > 0 && f.fuel < max) {
      const eat = Math.min(s.pop, fleetCount(f) * 0.5);
      s.pop -= eat; f.fuel = max;
      msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} has eaten ${fmt(eat * 1e6)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
      if (s.owner >= 0) msg(G, s.owner, `${G.players[f.owner].name}’s fleet of biologicals has eaten ${fmt(eat * 1e6)} people while refueling at ${s.name}.`, { icon: 'm9026', sound: 7013, star: s.id });
      if (s.pop <= 0.01 && s.owner >= 0) { s.pop = 0; s.owner = -1; }
    }
  }
}

// ---------- colonies and exploration ----------
// what a new colony looks like
function settle(G, p, s) {
  s.owner = p.id; s.pop = 2; s.everProfit = false; s._warned = false; s.terra = planetClass(seenG(p, s)) === 'good' ? 0.6 : 0;
  p.budget.col[s.id] = p.human ? 0.08 : p.budget.col[s.id] || 0.08;
}
function exploreQuality(G, p, s) {
  const q = gravHab(seenG(p, s)) * tempFactor(seenT(p, s));
  return q > 0.45 ? 'good' : q > 0.15 ? 'mediocre' : 'bad';
}

// ---------- combat ----------
// ships list for combat
function battle(G, sid) {
  const s = G.stars[sid];
  const present = G.fleets.filter(f => f.star === sid && f.to == null);
  const sides = {}; // owner -> {ships:[...], planet}
  const units = [];
  for (const f of present) {
    for (const k in f.ships) {
      const d = getDesign(G, f.owner, +k);
      const T = TYPES[d.type];
      for (let i = 0; i < f.ships[k]; i++) units.push({ owner: f.owner, d, hp: T.hp, shots: T.shots, fleet: f, delayed: !!f.delayed && f.arrived, alive: true, speed: d.type === 'satellite' ? d.V + 0.5 : d.V });
    }
    sides[f.owner] = true;
  }
  const planetOwner = s.owner >= 0 && s.pop > 0 ? s.owner : -1;
  if (planetOwner >= 0) sides[planetOwner] = true;
  const ownerIds = Object.keys(sides).map(Number);
  if (ownerIds.length < 2) return;
  const before = {}; for (const o of ownerIds) before[o] = units.filter(u => u.owner === o).length;
  const startPop = s.pop;
  const rec = { id: G.nextId++, star: sid, year: G.year + YEARS_PER_TURN, sides: ownerIds, rounds: [], start: units.map(u => ({ o: u.owner, t: u.d.type, did: u.d.id })), planetOwner, pop0: s.pop };
  const W = (o) => G.players[o].tech.weapons;
  const S = (o) => G.players[o].tech.shields;
  const dmg = (w, sh, attacker) => clamp(0.5 * Math.pow(1.6, w - sh) * (1 + G.players[attacker].bonus.generals), 0.012, 1.4);
  let round = 0;
  const maxRounds = 40;
  while (round < maxRounds) {
    round++;
    const alive = units.filter(u => u.alive && !(u.delayed && round <= 2));
    const liveOwners = new Set(alive.map(u => u.owner));
    const planetActive = planetOwner >= 0 && s.pop > 0.01;
    if (planetActive) liveOwners.add(planetOwner);
    if (liveOwners.size < 2 && !(round <= 2 && units.some(u => u.alive && u.delayed))) break;
    if (liveOwners.size < 2) { continue; }
    const ev = [];
    // shooters by speed desc
    const shooters = alive.filter(u => u.shots > 0).sort((a, b) => b.speed - a.speed || R(G) - 0.5);
    const targetsFor = (o) => units.filter(u => u.alive && u.owner !== o && !(u.delayed && round <= 2));
    for (const u of shooters) {
      if (!u.alive) continue;
      for (let k = 0; k < u.shots; k++) {
        let ts = targetsFor(u.owner);
        if (!ts.length) {
          // bombard planet
          if (planetActive && planetOwner !== u.owner && s.pop > 0) {
            const kill = dmg(u.d.W, S(planetOwner), u.owner) * 4;
            s.pop = Math.max(0, s.pop - kill);
            if (ev.length < 80) ev.push({ a: u.owner, si: units.indexOf(u), p: 1 });
          }
          continue;
        }
        const cs = ts.filter(t => t.d.type === 'colony');
        const t = cs.length && R(G) < 0.6 ? pick(G, cs) : pick(G, ts);
        const dd = dmg(u.d.W, t.d.S, u.owner);
        t.hp -= dd * (0.5 + R(G));
        const killed = t.hp <= 0;
        if (killed) t.alive = false;
        if (ev.length < 80) ev.push({ a: u.owner, si: units.indexOf(u), t: t.owner, k: killed ? 1 : 0, ti: units.indexOf(t) });
      }
    }
    // planet shoots back
    if (planetActive && s.pop > 0) {
      const shots = 1 + Math.floor(s.pop / 25);
      for (let k = 0; k < shots; k++) {
        const ts = targetsFor(planetOwner);
        if (!ts.length) break;
        const t = pick(G, ts);
        t.hp -= dmg(W(planetOwner) - 1, t.d.S, planetOwner) * 0.8 * (0.5 + R(G));
        const killed = t.hp <= 0; if (killed) t.alive = false;
        if (ev.length < 80) ev.push({ a: planetOwner, si: -1, t: t.owner, k: killed ? 1 : 0, ti: units.indexOf(t) });
      }
    }
    rec.rounds.push(ev); rec.popR = rec.popR || []; rec.popR.push(s.pop);
    if (planetOwner >= 0 && s.pop <= 0.01) break;
  }
  // apply losses
  const lost = {};
  let debrisMetal = 0;
  for (const u of units) {
    if (u.alive) continue;
    lost[u.owner] = (lost[u.owner] || 0) + 1;
    u.fleet.ships[u.d.id]--;
    debrisMetal += designCost(u.d).metal * 0.3;
  }
  for (const f of present) { for (const k in f.ships) if (f.ships[k] <= 0) delete f.ships[k]; if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1); }
  s.debris = (s.debris || 0) + debrisMetal;
  if (s.owner >= 0) { s.metal += s.debris; s.debris = 0; }
  const survivors = {}; for (const u of units) if (u.alive) survivors[u.owner] = (survivors[u.owner] || 0) + 1;
  let planetDied = false;
  if (planetOwner >= 0 && s.pop <= 0.01) { s.pop = 0; s.owner = -1; planetDied = true; s.metal += s.debris; s.debris = 0; }
  rec.survivors = survivors; rec.lost = lost; rec.pop1 = s.pop; rec.planetDied = planetDied; rec.end = units.map(u => u.alive ? 1 : 0);
  G.battles.push(rec); G.stat.battles++; if (planetDied) G.stat.captures++;
  return { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec };
}

// ---------- random events ----------
function randomEvents(G) {
  for (const s of G.stars) {
    if (s.owner < 0) continue;
    const p = G.players[s.owner];
    const r = R(G);
    if (r < 0.0025 && s.pop > 5) {
      const kill = s.pop * (0.2 + R(G) * 0.4); s.pop -= kill;
      msg(G, p.id, `Oh no! ${fmt(kill * 1e6)} people were killed when a heavy meteor shower hit ${s.name}.`, { icon: 'm9021', sound: 8000, star: s.id });
    } else if (r < 0.006 && s.pop > 2 && s.pop < maxPop(G, p, s) * 0.7) {
      s.boom = 4;
      msg(G, p.id, `It’s a baby boom! The population at ${s.name} has started growing quickly.`, { icon: 'm9023', sound: 7004, star: s.id });
    } else if (r < 0.0075 && Math.abs(seenT(p, s) - 72) < 40) {
      s.t += 40 + R(G) * 60;
      msg(G, p.id, `A volcanic eruption at ${s.name} has drastically warmed the temperature to ${Math.round(seenT(p, s))}°!`, { icon: 'm9018', star: s.id });
    }
  }
}


function projected(G, p) {
  const cols = colonies(G, p.id);
  let gross = 0; for (const s of cols) gross += s.pop * PROD_PER_POP;
  const upkeep = cols.length * BASE_UPKEEP;
  const interest = p.savings > 0 ? Math.min(p.savings, 4 * Math.max(gross, 30000)) * p.bonus.saveRate : p.savings * p.bonus.borrowRate;
  return { gross, income: gross - upkeep, interest, net: gross - upkeep + interest };
}

E.registerRules('claude', {
  label: 'Claude (reconstructed from the manual)',
  ai: 'claude',
  yearsPerTurn: YEARS_PER_TURN,
  galaxySizes: SIZES,
  colonyShipUsedUp: true,
  // features of the original this ruleset leaves out (the UI hides them)
  features: { alliances: false, gifts: false, surrender: false, stances: false, lateArrival: false, waypoints: false, luck: false, supernova: false, armageddon: false },
  ships: TYPES, DREAD_TECH, BASE_UPKEEP, PROD_PER_POP,
  gravHab, tempFactor, techCost,
  newStar, setupPlayer, afterSetup, defaultDesigns,
  maxPop: (G, p, s) => maxPop(G, p, s),
  planetClass: (G, gs) => planetClass(gs),
  planetIncome: (G, p, s) => s.pop * PROD_PER_POP - BASE_UPKEEP,
  designLimits: (G, p, type) => designLimits(p, type),
  designCost: (G, d) => designCost(d),
  paysPrototype: () => true,
  canBuild: (G, p, type) => type === 'dread' ? techSum(p) >= DREAD_TECH : type === 'bio' ? !!p.hasBio : type === 'decoy' ? !!p.hasDecoy : true,
  borrowLimit,
  projected,
  economy,
  refuel,
  settle,
  exploreQuality,
  battle,
  scrapReturn: (G, p) => p.bonus.recycle,
  randomEvents,
});
})(this);
