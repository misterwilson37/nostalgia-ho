// Spaceward Ho! web remake — game engine (pure logic, no DOM)
// Rules follow the original 5.0.5 manual; numeric formulas are approximations.
(function (root) {
'use strict';

// ---------- seeded RNG ----------
function rngNext(G) { // mulberry32 on G.rs
  let t = (G.rs = (G.rs + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const R = (G) => rngNext(G);
const RI = (G, a, b) => a + Math.floor(rngNext(G) * (b - a + 1));
const pick = (G, arr) => arr[Math.floor(rngNext(G) * arr.length)];
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rngNext(G) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function gauss(G) { let u = 0, v = 0; while (!u) u = rngNext(G); v = rngNext(G); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- static data (from the original resources) ----------
const DATA = {
  starNames: [], maleNames: [], femaleNames: [], shipNames: {}, techNames: {},
  radical: [],
};

const TECHS = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
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

// ---------- geometry ----------
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function starDist(G, i, j) { return dist(G.stars[i], G.stars[j]); }

// ---------- habitability (per player perception) ----------
function seenG(p, star) { return star.g / p.homeG; }
function seenT(p, star) { return 72 + (star.t - p.homeT); }
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
function designName(G, p, type) {
  const names = DATA.shipNames[type] || ['Ship'];
  const used = new Set(p.designs.map(d => d.name));
  for (let i = 0; i < 60; i++) {
    const base = names[(p.designs.length + i) % names.length];
    const n = i < names.length ? base : base + ' ' + (Math.floor(i / names.length) + 1);
    if (!used.has(n)) return n;
  }
  return 'Ship ' + p.designs.length;
}
function findOrCreateDesign(G, p, spec) {
  const d = p.designs.find(x => !x.scrapped && x.type === spec.type && x.R === spec.R && x.V === spec.V && x.W === spec.W && x.S === spec.S && x.M === spec.M);
  if (d) return d;
  const nd = { id: G.nextId++, type: spec.type, R: spec.R, V: spec.V, W: spec.W, S: spec.S, M: spec.M, built: 0, name: spec.name || designName(G, p, spec.type), free: false };
  p.designs.push(nd);
  return nd;
}
function getDesign(G, ownerId, did) {
  const p = G.players[ownerId];
  return p.designs.find(d => d.id === did);
}
function shipCostNow(G, p, d) {
  const c = designCost(d);
  const proto = (d.built === 0 && !d.free) ? c.proto : 0;
  return { money: c.money + proto, metal: c.metal, proto };
}
function borrowLimit(G, p) { return -5 * Math.max(p.lastGross, 1); }

// build `n` ships of design d at star sid. Returns number built.
function buildShips(G, pid, sid, did, n) {
  const p = G.players[pid];
  const d = getDesign(G, pid, did);
  const star = G.stars[sid];
  if (!d || star.owner !== pid) return 0;
  if (d.type === 'dread' && techSum(p) < DREAD_TECH) return 0;
  let built = 0;
  for (let i = 0; i < n; i++) {
    const c = shipCostNow(G, p, d);
    if (p.metal < c.metal) break;
    if (p.savings - c.money < borrowLimit(G, p)) break;
    p.savings -= c.money; p.metal -= c.metal;
    p.spentThisTurn.push({ did, sid, money: c.money, metal: c.metal });
    d.built++; built++;
    addShipsToStar(G, pid, sid, d, 1);
  }
  return built;
}
// undo the most recent build of design did at sid this turn
function unbuildShip(G, pid, sid, did) {
  const p = G.players[pid];
  for (let i = p.spentThisTurn.length - 1; i >= 0; i--) {
    const e = p.spentThisTurn[i];
    if (e.did === did && e.sid === sid) {
      // find a fleet at the star with this design that hasn't moved
      const f = G.fleets.find(f => f.owner === pid && f.star === sid && f.to == null && f.ships[did] > 0 && f.newThisTurn);
      if (!f) return false;
      f.ships[did]--; if (!f.ships[did]) delete f.ships[did];
      if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
      p.savings += e.money; p.metal += e.metal;
      const d = getDesign(G, pid, did); d.built--;
      p.spentThisTurn.splice(i, 1);
      return true;
    }
  }
  return false;
}
function techSum(p) { return p.tech.range + p.tech.speed + p.tech.weapons + p.tech.shields; }

// ---------- fleets ----------
function newFleet(G, owner, sid, sat) {
  const f = { id: G.nextId++, owner, star: sid, from: null, to: null, dist: 0, prog: 0, ships: {}, fuel: 0, sat: !!sat, newThisTurn: true, name: '', delayed: false };
  G.fleets.push(f);
  return f;
}
function fleetCount(f) { let n = 0; for (const k in f.ships) n += f.ships[k]; return n; }
function fleetDesigns(G, f) { return Object.keys(f.ships).map(k => getDesign(G, f.owner, +k)).filter(Boolean); }
function fleetSpeed(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => d.V)) : 1; }
function fleetMaxRange(G, f) { const ds = fleetDesigns(G, f); return ds.length ? Math.min(...ds.map(d => d.type === 'satellite' ? 0 : d.R)) : 0; }
function fleetHas(G, f, type) { return fleetDesigns(G, f).some(d => d.type === type); }
function fleetKind(G, f) {
  const ds = fleetDesigns(G, f); if (!ds.length) return 'fighter';
  const types = new Set(ds.map(d => d.type));
  for (const t of ['dread', 'fighter', 'bio', 'colony', 'tanker', 'scout', 'decoy', 'satellite']) if (types.has(t)) return t;
  return 'fighter';
}
function addShipsToStar(G, pid, sid, d, n) {
  const sat = d.type === 'satellite';
  let f;
  if (sat) f = G.fleets.find(x => x.owner === pid && x.star === sid && x.sat);
  else if (d.type === 'scout') f = null; // scouts get their own fleet
  else f = G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.newThisTurn && !fleetHas(G, x, 'scout'));
  if (!f) f = newFleet(G, pid, sid, sat);
  f.ships[d.id] = (f.ships[d.id] || 0) + n;
  if (!sat) f.fuel = fleetMaxRange(G, f);
  if (!f.name) f.name = d.name;
  return f;
}
function canReach(G, f, sid) {
  if (f.sat || f.star == null || f.to != null) return false;
  return starDist(G, f.star, sid) <= f.fuel + 1e-9;
}
function orderMove(G, f, sid) {
  if (f.sat || f.star == null) return false;
  if (sid === f.star) { f.dest = null; return true; }
  if (!canReach(G, f, sid)) return false;
  f.dest = sid; return true;
}
function cancelMove(G, f) { f.dest = null; }
function mergeFleets(G, a, b) { // b into a
  for (const k in b.ships) a.ships[k] = (a.ships[k] || 0) + b.ships[k];
  a.fuel = Math.min(a.fuel, b.fuel);
  a.dest = null;
  G.fleets.splice(G.fleets.indexOf(b), 1);
}
function splitFleet(G, f, take) { // take: {did:count}
  const nf = newFleet(G, f.owner, f.star, false); nf.newThisTurn = f.newThisTurn;
  for (const k in take) {
    const n = Math.min(take[k], f.ships[k] || 0);
    if (n > 0) { nf.ships[k] = n; f.ships[k] -= n; if (!f.ships[k]) delete f.ships[k]; }
  }
  nf.fuel = f.fuel; nf.name = f.name;
  if (fleetCount(nf) === 0) { G.fleets.splice(G.fleets.indexOf(nf), 1); return null; }
  if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  return nf;
}
function isFriend(G, a, b) { return a === b; }
function hasColonyAt(G, pid, sid) { return G.stars[sid].owner === pid; }

// ---------- knowledge ----------
function know(G, p, sid) {
  let k = p.know[sid];
  if (!k) k = p.know[sid] = { explored: false, owner: -1, pop: 0, metal: 0, g: 0, t: 0, seen: -1, battle: false, enemyShips: 0 };
  return k;
}
function observe(G, p, sid) {
  const s = G.stars[sid], k = know(G, p, sid);
  k.explored = true; k.owner = s.owner; k.pop = s.pop; k.metal = s.metal; k.g = s.g; k.t = s.t; k.seen = G.turn; k.battle = false; k.nova = s.nova;
  let es = 0;
  for (const f of G.fleets) if (f.star === sid && f.to == null && !isFriend(G, f.owner, p.id)) es += fleetCount(f);
  k.enemyShips = es;
}

// ---------- messages ----------
function msg(G, pid, text, opt) {
  if (pid == null) return;
  const p = G.players[pid];
  if (!p || !p.human) return;
  G.inbox.push(Object.assign({ text }, opt || {}));
}
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

// ---------- galaxy creation ----------
const SIZES = { small: [24, 13, 9], medium: [42, 17, 12], large: [70, 23, 15], huge: [110, 30, 20] };
function newGame(opts) {
  const G = {
    v: 1, rs: (opts.seed >>> 0) || ((Date.now() ^ 0x5eed) >>> 0), year: 2000, turn: 0, nextId: 1,
    opts, stat: { battles: 0, captures: 0, colonized: 0 }, stars: [], players: [], fleets: [], battles: [], inbox: [], over: false, winner: -1, log: [],
  };
  const [n0, W0, H0] = SIZES[opts.size] || SIZES.medium;
  const dens = { sparse: 1.25, normal: 1.0, dense: 0.82 }[opts.density || 'normal'];
  const W = W0 * dens, H = H0 * dens, n = n0;
  G.W = W; G.H = H;
  const pts = placeStars(G, n, W, H, opts.shape || 'random');
  const names = shuffle(G, DATA.starNames.slice());
  pts.forEach((pt, i) => {
    const g = clamp(Math.exp(gauss(G) * 0.5), 0.12, 4.5);
    const t = Math.round(72 + gauss(G) * 120 + (R(G) < 0.5 ? 30 : -10));
    const metal = Math.round(R(G) < 0.1 ? R(G) * 600 : 2500 + Math.pow(R(G), 1.4) * 24000);
    G.stars.push({ id: i, name: names[i % names.length] || ('Star ' + i), x: pt.x, y: pt.y, g, t, metal, owner: -1, pop: 0, terra: 0.5, nova: 0, debris: 0, everProfit: false });
  });
  // players
  const nComp = clamp(opts.computers | 0, 1, 15);
  const nPlayers = nComp + 1;
  const homes = chooseHomes(G, nPlayers);
  const usedNames = new Set();
  const faces = shuffle(G, [...Array(16).keys()]);
  for (let i = 0; i < nPlayers; i++) {
    const human = i === 0;
    const female = human ? !!opts.female : R(G) < 0.45;
    let name;
    if (human) name = opts.name || 'You';
    else { do { name = pick(G, female ? DATA.femaleNames : DATA.maleNames) || ('Computer ' + i); } while (usedNames.has(name) && usedNames.size < 40); }
    usedNames.add(name);
    const home = G.stars[homes[i]];
    const start = human ? (opts.start || 'normal') : (opts.cstart || 'normal');
    const p = {
      id: i, name, human, female, face: human ? -1 : faces[i % 16], alive: true, surrendered: false,
      homeG: home.g, homeT: home.t, homeStar: home.id,
      savings: 0, metal: 0, lastGross: 0, lastIncome: 0, lastNet: 0,
      tech: { range: 3, speed: 1, weapons: 1, shields: 1, mini: 1, radical: 1 },
      prog: { range: 0, speed: 0, weapons: 0, shields: 0, mini: 0, radical: 0 },
      talloc: { range: 0.22, speed: 0.14, weapons: 0.22, shields: 0.2, mini: 0.1, radical: 0.12 },
      budget: { tech: 0.3, savings: 0.4, col: {} },
      designs: [], know: {}, spentThisTurn: [],
      bonus: { research: 1, mining: 1, pop: 1, terra: 1, generals: 0, recycle: 0.75, saveRate: 0.02, borrowRate: 0.15 },
      hist: [], ai: null, profitNoted: {}, lastTechMsg: {}, iq: opts.iq || 'average',
    };
    G.players.push(p);
    home.owner = i; home.pop = 100; home.t = p.homeT; home.everProfit = true;
    home.metal = Math.max(home.metal, 9000 + RI(G, 0, 4000));
    p.budget.col[home.id] = 0.3;
    applyStart(G, p, home, start);
    for (const s of G.stars) know(G, p, s.id);
    observe(G, p, home.id);
    if (!human) p.ai = makeAI(G, p, opts.iq || 'average');
    defaultDesigns(G, p);
  }
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
  G.fleets.forEach(f => f.newThisTurn = false);
  G.inbox = [];
  msg(G, 0, 'Spaceward Ho! by Peter Commons. Designed by Joe Williams.', { icon: 'm9004', sound: 11111 });
  msg(G, 0, 'Click here to make this message go away. Click on the clock to end your turn.', { icon: 'm9024' });
  return G;
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
function placeStars(G, n, W, H, shape) {
  const pts = [];
  const minD = Math.sqrt((W * H) / n) * 0.62;
  const tryAdd = (x, y, md) => {
    if (x < 0.5 || y < 0.5 || x > W - 0.5 || y > H - 0.5) return false;
    for (const p of pts) if (Math.hypot(p.x - x, p.y - y) < md) return false;
    pts.push({ x, y }); return true;
  };
  if (shape === 'grid' || shape === 'hex') {
    const cols = Math.round(Math.sqrt(n * W / H)), rows = Math.ceil(n / cols);
    const dx = (W - 1) / (cols - 1 || 1), dy = (H - 1) / (rows - 1 || 1);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (pts.length >= n) break;
      const off = shape === 'hex' && r % 2 ? dx / 2 : 0;
      pts.push({ x: 0.5 + c * dx + off * 0.9, y: 0.5 + r * dy });
    }
    return pts;
  }
  let guard = 0;
  while (pts.length < n && guard++ < 40000) {
    let x, y;
    if (shape === 'ring') {
      const a = R(G) * Math.PI * 2, rr = 0.36 + gauss(G) * 0.05;
      x = W / 2 + Math.cos(a) * rr * W; y = H / 2 + Math.sin(a) * rr * H * 1.05;
    } else if (shape === 'cluster') {
      if (!G._cl) { G._cl = []; for (let i = 0; i < 6; i++) G._cl.push({ x: 1.5 + R(G) * (W - 3), y: 1.5 + R(G) * (H - 3) }); }
      const c = pick(G, G._cl); x = c.x + gauss(G) * W * 0.11; y = c.y + gauss(G) * H * 0.11;
    } else if (shape === 'spiral') {
      const arm = RI(G, 0, 1), t = R(G) * 2.6 * Math.PI, rr = 0.06 + t / (2.6 * Math.PI) * 0.42;
      const a = t + arm * Math.PI;
      x = W / 2 + Math.cos(a) * rr * W + gauss(G) * 0.5; y = H / 2 + Math.sin(a) * rr * H * 1.1 + gauss(G) * 0.5;
    } else { x = 0.5 + R(G) * (W - 1); y = 0.5 + R(G) * (H - 1); }
    tryAdd(x, y, guard > 30000 ? minD * 0.6 : minD);
  }
  return pts;
}
function chooseHomes(G, k) {
  const idx = G.stars.map(s => s.id);
  // farthest point sampling, randomized start
  const homes = [pick(G, idx)];
  while (homes.length < k) {
    let best = -1, bd = -1;
    for (const i of idx) {
      if (homes.includes(i)) continue;
      const d = Math.min(...homes.map(h => starDist(G, h, i))) * (0.85 + R(G) * 0.3);
      if (d > bd) { bd = d; best = i; }
    }
    homes.push(best);
  }
  return shuffle(G, homes);
}
function defaultDesigns(G, p) {
  const t = p.tech;
  findOrCreateDesign(G, p, { type: 'scout', R: t.range + 3, V: t.speed, W: Math.max(1, t.weapons - 1), S: Math.max(1, t.shields - 1), M: 1 });
  findOrCreateDesign(G, p, { type: 'colony', R: t.range, V: t.speed, W: 1, S: 1, M: 1 });
  findOrCreateDesign(G, p, { type: 'fighter', R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: 1 });
  findOrCreateDesign(G, p, { type: 'satellite', R: 0, V: t.speed, W: t.weapons, S: t.shields, M: 1 });
}

// ---------- turn processing ----------
function endTurn(G) {
  if (G.over) return;
  G.inbox = [];
  for (const p of G.players) if (p.alive && !p.human) aiTurn(G, p);
  if (G.players[0].auto && G.players[0].alive) aiTurn(G, G.players[0]);
  for (const p of G.players) if (p.alive) economy(G, p);
  departures(G);
  movement(G);
  resolveStars(G);
  refuel(G);
  randomEvents(G);
  checkElimination(G);
  for (const p of G.players) { p.spentThisTurn = []; recordHistory(G, p); }
  for (const f of G.fleets) f.newThisTurn = false;
  G.turn++; G.year += YEARS_PER_TURN;
  // keep battle records bounded
  if (G.battles.length > 60) G.battles.splice(0, G.battles.length - 60);
}

function colonies(G, pid) { return G.stars.filter(s => s.owner === pid); }

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

function departures(G) {
  for (const f of G.fleets.slice()) {
    if (f.dest == null || f.star == null || f.sat) continue;
    const d = starDist(G, f.star, f.dest);
    if (d > f.fuel + 1e-9) { f.dest = null; continue; }
    f.from = f.star; f.to = f.dest; f.dist = d; f.prog = 0; f.fuel -= d; f.star = null; f.dest = null;
  }
}
function movement(G) {
  for (const f of G.fleets) {
    if (f.to == null) continue;
    const v = fleetSpeed(G, f);
    f.prog += v;
    if (f.prog >= f.dist - 1e-9) { f.star = f.to; f.arrivedFrom = f.from; f.to = null; f.from = null; f.arrived = true; }
  }
}
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
function fleetLabel(G, f) {
  const n = fleetCount(f);
  const ds = fleetDesigns(G, f);
  if (ds.length === 1) { const T = TYPES[ds[0].type]; return n === 1 ? `one ${T.name}` : `${n} ${T.plural}`; }
  return `${n} ships`;
}

// ---------- star resolution: battles, exploration, colonization ----------
function resolveStars(G) {
  const arrivedAt = new Set();
  for (const f of G.fleets) if (f.arrived) arrivedAt.add(f.star);
  for (const sid of arrivedAt) {
    const s = G.stars[sid];
    const present = G.fleets.filter(f => f.star === sid && f.to == null);
    const owners = new Set(present.map(f => f.owner));
    if (s.owner >= 0 && s.pop > 0) owners.add(s.owner);
    if (owners.size > 1) battle(G, sid);
  }
  // after battles: explore, colonize, arrival messages
  for (const f of G.fleets.slice()) {
    if (!f.arrived) continue;
    f.arrived = false;
    const s = G.stars[f.star];
    const p = G.players[f.owner];
    const k = know(G, p, s.id);
    const wasExplored = k.explored;
    observe(G, p, s.id);
    if (!wasExplored) exploreMsg(G, p, s);
    else if (p.human && s.owner !== p.id && !fleetHas(G, f, 'colony')) msg(G, p.id, `Your fleet of ${fleetLabel(G, f)} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
    // colonize
    if (s.owner < 0 && fleetHas(G, f, 'colony') && !hostileAt(G, p.id, s.id)) colonize(G, p, f, s);
  }
}
function hostileAt(G, pid, sid) {
  return G.fleets.some(f => f.star === sid && f.to == null && f.owner !== pid && fleetCount(f) > 0 && !fleetDesigns(G, f).every(d => d.type === 'decoy'));
}
function colonize(G, p, f, s) {
  if (p.ai && p.ai.noColonize && p.ai.noColonize[s.id]) return;
  const d = fleetDesigns(G, f).find(d => d.type === 'colony');
  f.ships[d.id]--; if (!f.ships[d.id]) delete f.ships[d.id];
  if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  G.stat.colonized++;
  s.owner = p.id; s.pop = 2; s.everProfit = false; s._warned = false; s.terra = planetClass(seenG(p, s)) === 'good' ? 0.6 : 0;
  p.budget.col[s.id] = p.human ? 0.08 : p.budget.col[s.id] || 0.08;
  if (s.debris) { s.metal += s.debris; s.debris = 0; }
  observe(G, p, s.id);
  msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
}
function exploreMsg(G, p, s) {
  if (!p.human) return;
  const gs = seenG(p, s), ts = seenT(p, s);
  const q = gravHab(gs) * tempFactor(ts);
  const quality = q > 0.45 ? 'good' : q > 0.15 ? 'mediocre' : 'bad';
  const snd = quality === 'good' ? 6000 : quality === 'mediocre' ? 6002 : 6001;
  const icon = quality === 'good' ? 'm9027' : quality === 'mediocre' ? 'm9028' : 'm9029';
  const gStr = gs.toFixed(2) + 'G';
  msg(G, p.id, `You have explored ${s.name}. Gravity: ${gStr}. Temp: ${Math.round(ts)}°. Metal: ${fmt(s.metal)}.`, { icon, sound: snd, star: s.id, explore: quality, jpg: (s.id * 7) % 25 });
}

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
  // knowledge + messages
  for (const o of ownerIds) {
    const p = G.players[o];
    const k = know(G, p, sid);
    const mine = survivors[o] || 0;
    const anyEnemyAlive = Object.keys(survivors).some(x => +x !== o && survivors[x] > 0);
    const won = mine > 0 && !anyEnemyAlive || (o === planetOwner && !planetDied && !anyEnemyAlive);
    if (mine > 0 || (o === s.owner)) observe(G, p, sid);
    else { k.battle = true; k.explored = k.explored; if (!k.explored) k.battleOnly = true; k.owner = Object.keys(survivors).map(Number).find(x => x !== o && survivors[x] > 0) ?? k.owner; k.seen = G.turn; k.enemyShips = Object.keys(survivors).filter(x => +x !== o).reduce((a, x) => a + survivors[x], 0); }
    if (!p.human) { if (p.ai) aiNoteBattle(G, p, rec, won); continue; }
    const enemies = ownerIds.filter(x => x !== o).map(x => G.players[x].name).join(' and ');
    const theirLoss = ownerIds.filter(x => x !== o).reduce((a, x) => a + (lost[x] || 0), 0);
    const myLoss = lost[o] || 0;
    let text, sound, icon = 'm9025';
    if (o === planetOwner) {
      if (planetDied) { text = `${enemies} destroyed your colony at ${s.name}. You lost ${myLoss} of your ships. They lost ${theirLoss}. You lost ${fmt((startPop) * 1e6)} people.`; sound = 7020; icon = 'm9036'; }
      else { text = `${s.name} survived an attack from ${enemies}. You lost ${myLoss} of your ships; they lost ${theirLoss}. You lost ${fmt((startPop - s.pop) * 1e6)} people.`; sound = won ? 7027 : 2001; }
    } else if (won) { text = `You won a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.` + (planetDied ? ` The colony there was wiped out.` : ''); sound = 7027; icon = 'p3000'; }
    else { text = `You lost a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.`; sound = 2001; }
    msg(G, o, text, { icon, sound, star: sid, battle: rec.id });
  }
}

function evacuate(G, pid, sid) {
  const s = G.stars[sid];
  if (s.owner !== pid) return;
  s.owner = -1; s.pop = 0;
  delete G.players[pid].budget.col[sid];
  msg(G, pid, `You have evacuated ${s.name}.`, { icon: 'm9013', sound: 7002, star: sid, quiet: true });
}
function scrapFleet(G, f) {
  const p = G.players[f.owner];
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); metal += designCost(d).metal * f.ships[k] * p.bonus.recycle; }
  if (f.star != null) {
    const s = G.stars[f.star];
    if (s.owner === f.owner) p.metal += metal; else s.metal += metal;
  }
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return metal;
}

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

function checkElimination(G) {
  for (const p of G.players) {
    if (!p.alive) continue;
    const hasCol = G.stars.some(s => s.owner === p.id);
    const hasColShip = G.fleets.some(f => f.owner === p.id && fleetHas(G, f, 'colony'));
    if (!hasCol && !hasColShip) {
      p.alive = false;
      G.fleets = G.fleets.filter(f => f.owner !== p.id);
      if (p.human) msg(G, 0, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
      else msg(G, 0, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
    }
  }
  const alive = G.players.filter(p => p.alive);
  if (!G.over && alive.length <= 1) {
    G.over = true; G.winner = alive.length ? alive[0].id : -1;
    if (G.winner === 0) msg(G, 0, 'Wow! You won! You have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
    else if (G.winner > 0) msg(G, 0, `${G.players[G.winner].name} has just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
  }
  if (!G.players[0].alive && !G.over) { G.over = true; G.winner = -2; }
}
function recordHistory(G, p) {
  const cols = colonies(G, p.id);
  let ships = 0; for (const f of G.fleets) if (f.owner === p.id) ships += fleetCount(f);
  p.hist.push({ y: G.year, pop: Math.round(cols.reduce((a, s) => a + s.pop, 0)), cols: cols.length, ships, tech: techSum(p) + p.tech.mini, inc: Math.round(p.lastGross) });
  if (p.hist.length > 400) p.hist.shift();
}
function score(G, p) {
  const cols = colonies(G, p.id);
  let ships = 0; for (const f of G.fleets) if (f.owner === p.id) ships += fleetCount(f);
  return cols.reduce((a, s) => a + s.pop, 0) * 2 + cols.length * 20 + techSum(p) * 15 + ships * 2;
}

// =====================================================================
// Computer players
// =====================================================================
function makeAI(G, p, iq) {
  const styles = ['turtle', 'expander', 'warmonger', 'balanced', 'techie'];
  const style = pick(G, styles);
  const smart = { dumb: 0.6, average: 1.0, smart: 1.35 }[iq] || 1;
  const ai = {
    style, smart,
    aggression: { turtle: 0.25, expander: 0.5, warmonger: 0.95, balanced: 0.6, techie: 0.45 }[style],
    techShare: { turtle: 0.34, expander: 0.24, warmonger: 0.3, balanced: 0.3, techie: 0.44 }[style] * (0.8 + 0.2 * smart),
    lastDesignTech: -1, targets: {}, noColonize: {}, lostAt: {},
  };
  p.talloc = style === 'techie' ? { range: 0.18, speed: 0.12, weapons: 0.24, shields: 0.24, mini: 0.12, radical: 0.1 }
    : style === 'warmonger' ? { range: 0.18, speed: 0.16, weapons: 0.3, shields: 0.24, mini: 0.08, radical: 0.04 }
    : style === 'expander' ? { range: 0.3, speed: 0.16, weapons: 0.18, shields: 0.16, mini: 0.12, radical: 0.08 }
    : { range: 0.22, speed: 0.14, weapons: 0.24, shields: 0.22, mini: 0.1, radical: 0.08 };
  return ai;
}
function aiNoteBattle(G, p, rec, won) { if (!won) p.ai.lostAt[rec.star] = G.turn; }

function aiTurn(G, p) {
  const ai = p.ai || (p.ai = makeAI(G, p, 'average'));
  const cols = colonies(G, p.id);
  if (!cols.length) { aiMoveColonyShipsHome(G, p); return; }
  aiDesigns(G, p);
  aiBudget(G, p, cols);
  aiEvacuate(G, p, cols);
  aiScouts(G, p);
  aiColonize(G, p, cols);
  aiDefense(G, p, cols);
  aiOffense(G, p, cols);
}
function aiDesigns(G, p) {
  const metalPoor = p.savings > 15 * Math.max(200, p.metal);
  const ts = techSum(p) + p.tech.mini + (metalPoor ? 1000 : 0);
  if (ts === p.ai.lastDesignTech) return;
  p.ai.lastDesignTech = ts;
  const t = p.tech;
  const mini = metalPoor ? t.mini : Math.max(1, Math.round(t.mini * (0.5 + 0.3 * p.ai.smart)));
  p.ai.d = {
    scout: findOrCreateDesign(G, p, { type: 'scout', R: t.range + 3, V: t.speed, W: Math.max(1, t.weapons - 1), S: Math.max(1, t.shields - 1), M: 1 }).id,
    colony: findOrCreateDesign(G, p, { type: 'colony', R: t.range, V: t.speed, W: 1, S: 1, M: 1 }).id,
    fighter: findOrCreateDesign(G, p, { type: 'fighter', R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: mini }).id,
    satellite: findOrCreateDesign(G, p, { type: 'satellite', R: 0, V: t.speed, W: t.weapons, S: t.shields, M: mini }).id,
  };
  if (techSum(p) >= DREAD_TECH) p.ai.d.dread = findOrCreateDesign(G, p, { type: 'dread', R: t.range, V: t.speed, W: t.weapons, S: t.shields, M: mini }).id;
  if (p.hasBio) { const L = designLimits(p, 'bio'); p.ai.d.bio = findOrCreateDesign(G, p, { type: 'bio', R: L.R, V: L.V, W: L.W, S: L.S, M: 1 }).id; }
}
function aiBudget(G, p, cols) {
  const ai = p.ai;
  const b = p.budget;
  b.tech = ai.techShare;
  let colTotal = 0;
  for (const s of cols) {
    const cls = planetClass(seenG(p, s));
    const needT = Math.abs(seenT(p, s) - 72) > 0.5;
    let w = 0;
    if (cls === 'good') { s.terra = needT ? 0.75 : 0; w = needT ? 0.14 : (s.metal > 0 ? 0.06 : 0); }
    else { s.terra = 0; w = s.metal > 0 ? 0.08 : 0; }
    if (s.id === p.homeStar) { w = s.metal > 0 ? 0.08 : 0; s.terra = 0; }
    b.col[s.id] = w; colTotal += w;
  }
  // metal hunger raises mining
  if (p.metal < 1500) for (const s of cols) if (s.metal > 0) { b.col[s.id] += 0.05; colTotal += 0.05; }
  b.savings = Math.max(0.15, 1 - b.tech - colTotal);
  // if behind in tech, push research
  const best = Math.max(...G.players.filter(q => q.alive).map(q => q.tech.weapons + q.tech.shields));
  if (p.tech.weapons + p.tech.shields + 2 < best && ai.smart >= 1) b.tech += 0.08;
  // debt avoidance
  if (p.savings < 0) { b.savings += 0.3; b.tech *= 0.6; }
}
function aiEvacuate(G, p, cols) {
  if (cols.length <= 1) return;
  for (const s of cols) {
    if (s.id === p.homeStar) continue;
    const cls = planetClass(seenG(p, s));
    if (s.metal <= 0 && cls !== 'good' && s.pop * PROD_PER_POP < BASE_UPKEEP * 0.9) {
      evacuate(G, p.id, s.id); p.ai.noColonize[s.id] = true;
    }
  }
}
function myIdleFleets(G, p, filter) {
  return G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null && !f.sat && f.dest == null && (!filter || filter(f)));
}
function nearestOwned(G, p, sid) {
  let best = -1, bd = 1e9;
  for (const s of G.stars) if (s.owner === p.id) { const d = starDist(G, sid, s.id); if (d < bd) { bd = d; best = s.id; } }
  return [best, bd];
}
function aiScouts(G, p) {
  const ai = p.ai;
  const targeted = new Set(G.fleets.filter(f => f.owner === p.id).map(f => f.to ?? f.dest).filter(x => x != null));
  const scouts = myIdleFleets(G, p, f => fleetKind(G, f) === 'scout');
  for (const f of scouts) {
    const cands = [];
    for (const s of G.stars) {
      const k = know(G, p, s.id);
      if (k.explored && G.turn - k.seen < 40) continue;
      if (targeted.has(s.id)) continue;
      if (ai.lostAt[s.id] && G.turn - ai.lostAt[s.id] < 15) continue;
      const d = starDist(G, f.star, s.id);
      if (d > f.fuel + 1e-9 || d === 0) continue;
      // keep enough fuel to get back to an owned star unless star might be friendly
      const [, back] = nearestOwned(G, p, s.id);
      const risky = d + back > f.fuel + 1e-9;
      cands.push({ s, score: d + (risky ? 6 : 0) + (k.explored ? 4 : 0) + R(G) * 0.8 });
    }
    if (cands.length) { cands.sort((a, b) => a.score - b.score); orderMove(G, f, cands[0].s.id); targeted.add(cands[0].s.id); }
    else { const [home] = nearestOwned(G, p, f.star); if (home >= 0 && home !== f.star) orderMove(G, f, home); }
  }
  // build scouts
  const nScouts = G.fleets.filter(f => f.owner === p.id && fleetKind(G, f) === 'scout').length;
  const unexplored = G.stars.filter(s => !know(G, p, s.id).explored).length;
  const want = unexplored ? Math.min(4, 1 + Math.floor(G.turn / 12) + (ai.style === 'expander' ? 1 : 0)) : 0;
  if (nScouts < want && p.savings > 8000) buildShips(G, p.id, p.homeStar, ai.d.scout, 1);
}
function planetValue(G, p, s) {
  const k = know(G, p, s.id);
  if (!k.explored) return 0;
  const gs = seenG(p, s), ts = 72 + (k.t - p.homeT);
  const hab = gravHab(gs) * (0.5 + 0.5 * tempFactor(ts));
  return hab * 100 + Math.min(k.metal, 20000) / 400;
}
function aiColonize(G, p, cols) {
  const ai = p.ai;
  const colShips = G.fleets.filter(f => f.owner === p.id && fleetHas(G, f, 'colony'));
  const targeted = new Set(colShips.map(f => f.to ?? f.dest).filter(x => x != null));
  // supporting capacity: money left after upkeep
  const unprofitable = cols.filter(s => s.pop * PROD_PER_POP < BASE_UPKEEP).length;
  const capacity = Math.floor(p.lastIncome / BASE_UPKEEP) - unprofitable + Math.floor(Math.max(0, p.savings) / 150000);
  // send idle colony ships
  for (const f of colShips) {
    if (f.star == null || f.to != null || f.dest != null) continue;
    const best = colonyTarget(G, p, f.star, f.fuel, targeted);
    if (best >= 0) { orderMove(G, f, best); targeted.add(best); }
  }
  const idleCol = colShips.filter(f => f.to == null && f.dest == null).length;
  const want = (ai.style === 'expander' ? 2 : 1) + Math.floor(G.turn / 60);
  if (capacity >= 1 && colShips.length < want + (ai.smart > 1 ? 1 : 0) && idleCol === 0) {
    // find a target reachable from some colony
    const d = getDesign(G, p.id, ai.d.colony);
    const c = shipCostNow(G, p, d);
    if (p.savings - c.money < 5000 || p.metal < c.metal) return;
    let bestSrc = -1, bestT = -1, bv = 0;
    for (const src of cols) {
      const t = colonyTarget(G, p, src.id, d.R, targeted);
      if (t >= 0) { const v = planetValue(G, p, G.stars[t]) - starDist(G, src.id, t) * 3; if (v > bv) { bv = v; bestSrc = src.id; bestT = t; } }
    }
    if (bestSrc >= 0 && buildShips(G, p.id, bestSrc, ai.d.colony, 1)) {
      const f = G.fleets.find(f => f.owner === p.id && f.star === bestSrc && f.newThisTurn && fleetHas(G, f, 'colony') && f.dest == null);
      if (f) {
        // escort if enemies seen nearby
        orderMove(G, f, bestT);
      }
    }
  }
}
function colonyTarget(G, p, from, fuel, targeted) {
  let best = -1, bv = 12;
  for (const s of G.stars) {
    if (targeted.has(s.id)) continue;
    const k = know(G, p, s.id);
    if (!k.explored || k.owner >= 0 && k.owner !== -1) continue;
    if (s.owner === p.id) continue;
    if (p.ai.noColonize[s.id]) continue;
    if (p.ai.lostAt[s.id] && G.turn - p.ai.lostAt[s.id] < 12) continue;
    if (k.enemyShips > 0 && G.turn - k.seen < 10) continue;
    const d = starDist(G, from, s.id);
    if (d > fuel + 1e-9) continue;
    const stranded = G.fleets.some(f => f.owner === p.id && f.star === s.id && !f.sat && f.fuel < 1);
    const v = planetValue(G, p, s) - d * 3 + (stranded ? 60 : 0);
    if (v > bv) { bv = v; best = s.id; }
  }
  return best;
}
function enemyColoniesKnown(G, p) {
  const out = [];
  for (const s of G.stars) { const k = know(G, p, s.id); if (k.explored && k.owner >= 0 && k.owner !== p.id && G.players[k.owner].alive) out.push(s); }
  return out;
}
function aiDefense(G, p, cols) {
  const ai = p.ai;
  const enemies = enemyColoniesKnown(G, p);
  const threatR = p.tech.range + 4;
  let budget = Math.max(0, p.savings - 6000) * (0.12 + 0.15 * (1 - ai.aggression));
  const sorted = cols.slice().sort((a, b) => b.pop - a.pop);
  for (const s of sorted) {
    let threat = 0;
    for (const e of enemies) { const d = dist(e, s); if (d < threatR) threat += (threatR - d) / threatR; }
    if (ai.lostAt[s.id] && G.turn - ai.lostAt[s.id] < 10) threat += 1;
    if (threat <= 0 && G.turn < 30) continue;
    const sats = G.fleets.filter(f => f.owner === p.id && f.star === s.id && f.sat).reduce((a, f) => a + fleetCount(f), 0);
    const want = Math.min(30, Math.round((threat * 2.5 + (s.id === p.homeStar ? 2 : 0) + s.pop / 40) * ai.smart * (ai.style === 'turtle' ? 1.6 : 1)));
    if (sats < want && budget > 0) {
      const d = getDesign(G, p.id, ai.d.satellite);
      const c = shipCostNow(G, p, d);
      const n = Math.min(want - sats, Math.floor(budget / Math.max(1, c.money)), 6);
      if (n > 0) { const b = buildShips(G, p.id, s.id, d.id, n); budget -= b * c.money; }
    }
  }
}
function fleetStrength(G, f) {
  let st = 0; const P = G.players[f.owner];
  for (const k in f.ships) {
    const d = getDesign(G, f.owner, +k); const T = TYPES[d.type];
    st += f.ships[k] * T.shots * T.hp * Math.pow(1.6, (d.W + d.S) / 2);
  }
  return st;
}
function aiOffense(G, p, cols) {
  const ai = p.ai;
  const home = p.homeStar;
  const fighterD = ai.d.dread && p.savings > 200000 ? ai.d.dread : ai.d.fighter;
  // build fighters with spare savings
  const reserve = 15000 + G.turn * 400;
  const spare = p.savings - reserve;
  if (spare > 0 && G.turn > 6) {
    const d = getDesign(G, p.id, fighterD);
    const c = shipCostNow(G, p, d);
    const n = Math.min(20, Math.floor(spare * (0.45 + 0.5 * ai.aggression) / c.money));
    // build at colony closest to enemies
    const enemies = enemyColoniesKnown(G, p);
    let src = home;
    if (enemies.length) { let bd = 1e9; for (const s of cols) for (const e of enemies) { const dd = dist(s, e); if (dd < bd && s.pop > 10) { bd = dd; src = s.id; } } }
    if (n > 0) buildShips(G, p.id, src, d.id, n);
  }
  // gather fighters at each star into one fleet
  const byStar = {};
  for (const f of myIdleFleets(G, p, f => ['fighter', 'dread', 'bio'].includes(fleetKind(G, f)) && !fleetHas(G, f, 'colony'))) {
    if (byStar[f.star]) mergeFleets(G, byStar[f.star], f); else byStar[f.star] = f;
  }
  const enemies = enemyColoniesKnown(G, p);
  if (!enemies.length) return;
  // staging colony: our populated colony closest to any enemy colony
  let stage = home, sd = 1e9;
  for (const s of cols) if (s.pop > 5) for (const e of enemies) { const dd = dist(s, e); if (dd < sd) { sd = dd; stage = s.id; } }
  for (const sid in byStar) {
    const f = byStar[sid];
    if (+sid !== stage && G.stars[sid].owner === p.id && fleetCount(f) < 3 + G.turn / 20 && starDist(G, +sid, stage) <= f.fuel) { orderMove(G, f, stage); delete byStar[sid]; }
  }
  for (const sid in byStar) {
    const f = byStar[sid];
    G.stat.fleetsConsidered = (G.stat.fleetsConsidered || 0) + 1;
    if (fleetCount(f) < 4) continue;
    G.stat.big = (G.stat.big || 0) + 1;
    const myS = fleetStrength(G, f) * ai.smart;
    let best = -1, bv = -1;
    for (const e of enemies) {
      const d = starDist(G, f.star, e.id);
      if (2 * d > f.fuel + 1e-9) continue;
      const k = know(G, p, e.id);
      const owner = G.players[k.owner];
      const estDef = (k.enemyShips + 2 + k.pop / 25) * Math.pow(1.6, (owner.tech.weapons + owner.tech.shields) / 2 * (ai.smart > 1 ? 1 : 0.9));
      const ratio = myS / Math.max(1, estDef);
      G.stat.maxRatio = Math.max(G.stat.maxRatio || 0, ratio); G.stat.evals = (G.stat.evals || 0) + 1;
      if (ratio < 1.7 - ai.aggression * 0.7) continue;
      const v = ratio * 10 + k.pop - d * 2;
      if (v > bv) { bv = v; best = e.id; }
    }
    if (best >= 0) { G.stat.attacks = (G.stat.attacks || 0) + 1;
      // send a colony ship behind if available and we'd be able to refuel
      orderMove(G, f, best);
    } else if (+sid !== home && G.stars[sid].owner !== p.id) {
      const [back] = nearestOwned(G, p, +sid); if (back >= 0) orderMove(G, f, back);
    }
  }
}
function aiMoveColonyShipsHome(G, p) {
  for (const f of myIdleFleets(G, p, f => fleetHas(G, f, 'colony'))) {
    // colonize anything reachable
    let best = -1, bv = -1e9;
    for (const s of G.stars) { if (s.owner >= 0) continue; const d = starDist(G, f.star, s.id); if (d > f.fuel || d === 0) continue; const v = planetValue(G, p, s) - d; if (v > bv) { bv = v; best = s.id; } }
    if (best >= 0) orderMove(G, f, best);
  }
}

function projected(G, p) {
  const cols = colonies(G, p.id);
  let gross = 0; for (const s of cols) gross += s.pop * PROD_PER_POP;
  const upkeep = cols.length * BASE_UPKEEP;
  const interest = p.savings > 0 ? Math.min(p.savings, 4 * Math.max(gross, 30000)) * p.bonus.saveRate : p.savings * p.bonus.borrowRate;
  return { gross, income: gross - upkeep, interest, net: gross - upkeep + interest };
}
// ---------- serialization ----------
function save(G) { return JSON.stringify(G); }
function load(str) { return JSON.parse(str); }

const API = {
  DATA, TYPES, TECHS, DREAD_TECH, BASE_UPKEEP, PROD_PER_POP, YEARS_PER_TURN,
  newGame, endTurn, buildShips, unbuildShip, designLimits, designCost, shipCostNow, findOrCreateDesign, getDesign,
  fleetCount, fleetDesigns, fleetSpeed, fleetMaxRange, fleetHas, fleetKind, fleetLabel, orderMove, cancelMove, canReach,
  mergeFleets, splitFleet, scrapFleet, evacuate, colonies, seenG, seenT, gravHab, tempFactor, maxPop, planetClass,
  know, starDist, dist, projected, techCost, techSum, score, save, load, borrowLimit, fmt, BASE: { PROD_PER_POP },
};
if (typeof module !== 'undefined') module.exports = API; else root.HO = API;
})(this);
