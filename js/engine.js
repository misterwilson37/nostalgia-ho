// Spaceward Ho! web remake — game engine (pure logic, no DOM).
//
// The engine owns the game state and the mechanics every ruleset shares:
// turn order, fleets and movement, exploration, colonizing, knowledge,
// battle bookkeeping and messages, saving and loading. Every number and
// formula (costs, growth, combat maths, starting conditions...) comes from
// the active ruleset (js/rules-*.js), and computer players from js/ai-*.js.
// Rulesets and AIs register themselves with HO.registerRules / HO.registerAI.
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

// ---------- static data (filled from js/data.js) ----------
const DATA = {
  starNames: [], maleNames: [], femaleNames: [], shipNames: {}, techNames: {},
  radical: [],
};

const TECHS = ['range', 'speed', 'weapons', 'shields', 'mini', 'radical'];
// names and map-dot row for each ship type (numbers live in the rulesets)
const SHIP_TYPES = {
  scout:     { name: 'Scout',       plural: 'Scouts',       dot: 0 },
  dread:     { name: 'Dreadnought', plural: 'Dreadnoughts', dot: 1 },
  fighter:   { name: 'Fighter',     plural: 'Fighters',     dot: 2 },
  tanker:    { name: 'Tanker',      plural: 'Tankers',      dot: 3 },
  colony:    { name: 'Colony Ship', plural: 'Colony Ships', dot: 4 },
  satellite: { name: 'Satellite',   plural: 'Satellites',   dot: 5 },
  bio:       { name: 'Biological',  plural: 'Biologicals',  dot: 6 },
  decoy:     { name: 'Decoy',       plural: 'Decoys',       dot: 2 },
};

// ---------- rulesets and computer players ----------
const RULESETS = {}, AIS = {};
function registerRules(name, rs) { RULESETS[name] = rs; rs.id = name; }
function registerAI(name, ai) { AIS[name] = ai; }
function rules(G) { return RULESETS[G && G.rules] || RULESETS.claude; }
function aiOf(G) { const rs = rules(G); return AIS[rs.ai || rs.id] || AIS.claude; }
function feature(G, name) { return !!(rules(G).features || {})[name]; }

// ---------- geometry ----------
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function starDist(G, i, j) { const rs = rules(G); return rs.distance ? rs.distance(G, G.stars[i], G.stars[j]) : dist(G.stars[i], G.stars[j]); }

// ---------- planets (as each player sees them) ----------
function seenG(p, star) { return star.g / p.homeG; }
function seenT(p, star) { return 72 + (star.t - p.homeT); }
function maxPop(G, p, s) { return rules(G).maxPop(G, p, s); }
function planetClass(G, gs) { return rules(G).planetClass(G, gs); }
function planetIncome(G, p, s) { return rules(G).planetIncome(G, p, s); }

// ---------- ship designs ----------
function designLimits(G, p, type) { return rules(G).designLimits(G, p, type); }
function designMin(G, k) { const rs = rules(G); return rs.designMin ? rs.designMin(G, k) : 1; }
function designCost(G, d) { return rules(G).designCost(G, d); }
function canBuildType(G, p, type) { return rules(G).canBuild(G, p, type); }
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
// price of the next ship of design d: { money, metal, proto } (proto = extra paid for the first one)
function shipCostNow(G, p, d) {
  const c = designCost(G, d);
  const proto = (d.built === 0 && !d.free && rules(G).paysPrototype(G, p, d)) ? c.proto : 0;
  return { money: c.money + proto, metal: c.metal, proto };
}
function borrowLimit(G, p) { return rules(G).borrowLimit(G, p); }

// build `n` ships of design d at star sid. Returns number built.
function buildShips(G, pid, sid, did, n) {
  const p = G.players[pid];
  const d = getDesign(G, pid, did);
  const star = G.stars[sid];
  if (!d || star.owner !== pid) return 0;
  if (!canBuildType(G, p, d.type)) return 0;
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
function fleetLabel(G, f) {
  const n = fleetCount(f);
  const ds = fleetDesigns(G, f);
  if (ds.length === 1) { const T = SHIP_TYPES[ds[0].type]; return n === 1 ? `one ${T.name}` : `${n} ${T.plural}`; }
  return `${n} ships`;
}

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
  const rs = rules(G);
  if (rs.observe) rs.observe(G, p, s, k);
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
function newGame(opts) {
  const G = {
    v: 1, rules: RULESETS[opts.rules] ? opts.rules : 'claude',
    rs: (opts.seed >>> 0) || ((Date.now() ^ 0x5eed) >>> 0), year: 2000, turn: 0, nextId: 1,
    opts, stat: { battles: 0, captures: 0, colonized: 0 }, stars: [], players: [], fleets: [], battles: [], inbox: [], over: false, winner: -1, log: [],
  };
  const rs = rules(G);
  const [n0, W0, H0] = rs.galaxySizes[opts.size] || rs.galaxySizes.medium;
  const dens = { sparse: 1.25, normal: 1.0, dense: 0.82 }[opts.density || 'normal'];
  const W = W0 * dens, H = H0 * dens, n = n0;
  G.W = W; G.H = H;
  const pts = placeStars(G, n, W, H, opts.shape || 'random');
  const names = shuffle(G, DATA.starNames.slice());
  pts.forEach((pt, i) => {
    const st = rs.newStar(G);
    G.stars.push({ id: i, name: names[i % names.length] || ('Star ' + i), x: pt.x, y: pt.y, g: st.g, t: st.t, metal: st.metal, owner: -1, pop: 0, terra: 0.5, nova: 0, debris: 0, everProfit: false });
  });
  // players
  const nComp = clamp(opts.computers | 0, 1, 15);
  const nPlayers = nComp + 1;
  const homes = chooseHomes(G, nPlayers);
  const usedNames = new Set();
  const faces = shuffle(G, [...Array(16).keys()]);
  const AI = aiOf(G);
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
      designs: [], know: {}, spentThisTurn: [],
      hist: [], ai: null, profitNoted: {}, lastTechMsg: {}, iq: opts.iq || 'average',
    };
    G.players.push(p);
    rs.setupPlayer(G, p, home, start);
    for (const s of G.stars) know(G, p, s.id);
    observe(G, p, home.id);
    if (!human) p.ai = AI.make(G, p, opts.iq || 'average');
    rs.defaultDesigns(G, p);
  }
  rs.afterSetup(G);
  G.fleets.forEach(f => f.newThisTurn = false);
  G.inbox = [];
  msg(G, 0, 'Spaceward Ho! by Peter Commons. Designed by Joe Williams.', { icon: 'm9004', sound: 11111 });
  msg(G, 0, 'Click here to make this message go away. Click on the clock to end your turn.', { icon: 'm9024' });
  return G;
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

// ---------- turn processing ----------
function endTurn(G) {
  if (G.over) return;
  const rs = rules(G), AI = aiOf(G);
  G.inbox = [];
  for (const p of G.players) if (p.alive && !p.human) AI.turn(G, p);
  if (G.players[0].auto && G.players[0].alive) AI.turn(G, G.players[0]);
  for (const p of G.players) if (p.alive) rs.economy(G, p);
  departures(G);
  movement(G);
  resolveStars(G);
  rs.refuel(G);
  if (rs.afterMovement) for (const p of G.players) if (p.alive) rs.afterMovement(G, p);
  rs.randomEvents(G);
  checkElimination(G);
  for (const p of G.players) { p.spentThisTurn = []; recordHistory(G, p); }
  for (const f of G.fleets) f.newThisTurn = false;
  G.turn++; G.year += rs.yearsPerTurn;
  // keep battle records bounded
  if (G.battles.length > 60) G.battles.splice(0, G.battles.length - 60);
}

function colonies(G, pid) { return G.stars.filter(s => s.owner === pid); }
function projected(G, p) { return rules(G).projected(G, p); }

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
  const rs = rules(G);
  const d = fleetDesigns(G, f).find(d => d.type === 'colony');
  if (rs.colonyShipUsedUp) {
    f.ships[d.id]--; if (!f.ships[d.id]) delete f.ships[d.id];
    if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  G.stat.colonized++;
  rs.settle(G, p, s, f, d);
  if (s.debris) { s.metal += s.debris; s.debris = 0; }
  observe(G, p, s.id);
  msg(G, p.id, `You have colonized ${s.name}.`, { icon: 'm9031', sound: 7018, star: s.id });
}
function exploreMsg(G, p, s) {
  if (!p.human) return;
  const gs = seenG(p, s), ts = seenT(p, s);
  const quality = rules(G).exploreQuality(G, p, s);
  const snd = quality === 'good' ? 6000 : quality === 'mediocre' ? 6002 : 6001;
  const icon = quality === 'good' ? 'm9027' : quality === 'mediocre' ? 'm9028' : 'm9029';
  const gStr = gs.toFixed(2) + 'G';
  msg(G, p.id, `You have explored ${s.name}. Gravity: ${gStr}. Temp: ${Math.round(ts)}°. Metal: ${fmt(s.metal)}.`, { icon, sound: snd, star: s.id, explore: quality, jpg: (s.id * 7) % 25 });
}

// ---------- battles ----------
// The ruleset fights the battle and removes the losses; the engine then
// updates everyone's knowledge and sends the reports.
function battle(G, sid) {
  const res = rules(G).battle(G, sid);
  if (res) battleNews(G, sid, res);
}
function battleNews(G, sid, b) {
  const { ownerIds, survivors, lost, planetOwner, planetDied, startPop, rec } = b;
  const s = G.stars[sid];
  const AI = aiOf(G);
  for (const o of ownerIds) {
    const p = G.players[o];
    const k = know(G, p, sid);
    const mine = survivors[o] || 0;
    const anyEnemyAlive = Object.keys(survivors).some(x => +x !== o && survivors[x] > 0);
    const won = mine > 0 && !anyEnemyAlive || (o === planetOwner && !planetDied && !anyEnemyAlive);
    if (mine > 0 || (o === s.owner)) observe(G, p, sid);
    else { k.battle = true; k.explored = k.explored; if (!k.explored) k.battleOnly = true; k.owner = Object.keys(survivors).map(Number).find(x => x !== o && survivors[x] > 0) ?? k.owner; k.seen = G.turn; k.enemyShips = Object.keys(survivors).filter(x => +x !== o).reduce((a, x) => a + survivors[x], 0); }
    if (!p.human) { if (p.ai && AI.noteBattle) AI.noteBattle(G, p, rec, won); continue; }
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
  const rate = rules(G).scrapReturn(G, p);
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); metal += designCost(G, d).metal * f.ships[k] * rate; }
  if (f.star != null) {
    const s = G.stars[f.star];
    if (s.owner === f.owner) p.metal += metal; else s.metal += metal;
  }
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return metal;
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

// ---------- serialization ----------
function save(G) { return JSON.stringify(G); }
function load(str) { const G = JSON.parse(str); if (!G.rules) G.rules = 'claude'; return G; }

const API = {
  DATA, SHIP_TYPES, TYPES: SHIP_TYPES, TECHS,
  registerRules, registerAI, rules, aiOf, feature, RULESETS,
  ruleOptions: () => Object.values(RULESETS).map(r => [r.id, r.label]),
  // randomness and helpers for rulesets and AIs
  R, RI, pick, shuffle, gauss, clamp,
  newGame, endTurn, buildShips, unbuildShip, designLimits, designMin, designCost, shipCostNow, canBuildType, findOrCreateDesign, getDesign,
  fleetCount, fleetDesigns, fleetSpeed, fleetMaxRange, fleetHas, fleetKind, fleetLabel, orderMove, cancelMove, canReach,
  newFleet, addShipsToStar, mergeFleets, splitFleet, scrapFleet, evacuate, colonies, seenG, seenT, maxPop, planetClass, planetIncome,
  isFriend, hasColonyAt, hostileAt, know, observe, msg, starDist, dist, projected, techSum, score, save, load, borrowLimit, fmt,
};
if (typeof module !== 'undefined') {
  module.exports = API;
  // under Node, load the rulesets and computer players too
  require('./rules-claude.js'); require('./ai-claude.js');
} else root.HO = API;
})(this);
