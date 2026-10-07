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

// ---------- versions and editions (the New Game window's menus) ----------
// Each ruleset plays one edition of one version: a build of the game for one
// platform. It says which with three fields:
//   family:  the version it belongs to, '1.2', '2.0', '3.0', '4.0', '5' (the
//            Version menu), or 'remake' for the remake's own rules;
//   edition: { version, name, platform, year }: the build's own number
//            ('2.0.1'), its name in the Edition menu ('Mac', 'DOS and Windows
//            3.1', 'Windows 95', 'Palm OS', 'Mac (French)'), the computers it
//            ran on, and the year it came out;
//   skins:   its own skins (js/skins.js ids), the one to offer first first.
// The Claude rules (js/rules-claude.js) are the remake's own and set none of
// these, so they are given here.
const OWN_EDITIONS = {
  claude: { family: 'remake', edition: { version: 'Claude', name: 'The remake’s own rules', platform: 'a web browser', year: 2026 }, skins: ['classic'] },
};
const famOf = (r) => r.family || (OWN_EDITIONS[r.id] || {}).family;
const edOf = (r) => r.edition || (OWN_EDITIONS[r.id] || {}).edition || {};
const skinsOf = (r) => r.skins || (OWN_EDITIONS[r.id] || {}).skins || [];
const famYear = (ids) => Math.min(...ids.map(id => edOf(RULESETS[id]).year || 1e4));
// editions(family): the rulesets of one version, oldest first (then by
// name), as { id, family, version, name, platform, year, skins, label, patch }
// (label: the ruleset's own; patch: its unofficial patch's number, or null
// when it has no fixes). An unknown family gives [].
function editions(family) {
  return Object.values(RULESETS).filter(r => famOf(r) === family)
    .map(r => { const e = edOf(r); return { id: r.id, family, version: e.version, name: e.name, platform: e.platform, year: e.year, skins: skinsOf(r).slice(), label: r.label, patch: fixes(r).length ? patchVersion(r) : null }; })
    .sort((a, b) => (a.year || 1e4) - (b.year || 1e4) || String(a.name).localeCompare(String(b.name)));
}
// families(): the versions, oldest first, the remake's own last, as
// { id, year, editions: [ruleset ids, as editions(id) orders them] }
function families() {
  const ids = [...new Set(Object.values(RULESETS).map(famOf).filter(Boolean))];
  return ids.map(id => ({ id, year: famYear(editions(id).map(e => e.id)), editions: editions(id).map(e => e.id) }))
    .sort((a, b) => (a.id === 'remake') - (b.id === 'remake') || a.year - b.year || a.id.localeCompare(b.id, 'en', { numeric: true }));
}
// A game's ruleset and computer players. There is no fallback: a missing
// game, an unknown ruleset id or a ruleset without its computer players is
// an error (docs/fallbacks.md). With no game (the title screen, New Game) a
// skin asks for a ruleset by id: rulesById(id), or HO.RULESETS[id].
function rulesById(id) {
  const rs = RULESETS[id];
  if (!rs) throw new Error(`${id == null ? 'No ruleset was named' : `Unknown ruleset "${id}"`}. This remake has: ${Object.keys(RULESETS).join(', ')}.`);
  return rs;
}
function rules(G) {
  if (!G) throw new Error('rules(G) was asked for the ruleset with no game; with no game, name the ruleset (HO.rulesById)');
  return RULESETS[G.rules] || rulesById(G.rules);
}
// every ruleset names its computer players (rs.ai)
function aiOf(G) {
  const rs = rules(G), ai = AIS[rs.ai];
  if (!ai) throw new Error(`The "${rs.id}" ruleset's computer players ("${rs.ai}") aren't loaded`);
  return ai;
}
function feature(G, name) { return !!(rules(G).features || {})[name]; }
// The unofficial patch: fixes for a version's obvious bugs (docs/fixes.md).
// A ruleset lists them as rs.fixes = [{ id, title, text }]; the player turns
// the patch on at New Game (G.opts.patch), and the rules code asks
// fixed(G, id), true only when the patch is on and this ruleset lists that
// fix. A saved game without G.opts.patch plays the version as released.
// (A ruleset built with Object.assign over another must set its own fixes.)
function fixes(rs) { return (rs && rs.fixes) || []; }
function fixed(G, id) { return !!(G && G.opts && G.opts.patch) && fixes(rules(G)).some(f => f.id === id); }
// the patch's version number: the version's own + ".1" (rs.patchVersion overrides)
function patchVersion(rs) { return rs ? rs.patchVersion || (rs.version ? rs.version + '.1' : null) : null; }

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
function designMin(G, k, type) { const rs = rules(G); return rs.designMin ? rs.designMin(G, k, type) : 1; }
function designCost(G, d) { return rules(G).designCost(G, d); }
function canBuildType(G, p, type) { return rules(G).canBuild(G, p, type); }
function designName(G, p, type) {
  // a ruleset may pick the name itself (rs.designName), or name ships from its own lists (rs.shipNames, by type)
  if (rules(G).designName) return rules(G).designName(G, p, type);
  const names = (rules(G).shipNames || DATA.shipNames)[type] || DATA.shipNames[type] || ['Ship'];
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
    if (rules(G).yardRoom && !rules(G).yardRoom(G, p, star, d)) break; // a ruleset's limit on ships built at a colony in a turn (4.0.5: its people)
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
  const sat = d.type === 'satellite', rs = rules(G);
  let f;
  if (rs.fleetFor) f = rs.fleetFor(G, pid, sid, d); // the ruleset picks the fleet new ships join (null: a new one)
  else if (sat) f = G.fleets.find(x => x.owner === pid && x.star === sid && x.sat);
  else if (d.type === 'scout') f = null; // scouts get their own fleet
  else if (feature(G, 'singleTypeFleets')) // DOS 2.0: new ships join a fleet of the same type at the star
    f = G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.dest == null && fleetDesigns(G, x).every(e => e.type === d.type));
  else f = G.fleets.find(x => x.owner === pid && x.star === sid && !x.sat && x.to == null && x.newThisTurn && !fleetHas(G, x, 'scout'));
  if (!f) f = newFleet(G, pid, sid, sat);
  f.ships[d.id] = (f.ships[d.id] || 0) + n;
  if (d.type === 'colony' && !rules(G).colonyShipUsedUp) f.colonists = (f.colonists || 0) + 10 * n;
  if (!sat) f.fuel = fleetMaxRange(G, f);
  if (!f.name) f.name = d.name;
  if (rs.shipsAdded) rs.shipsAdded(G, f, d, n); // the ruleset adjusts the fleet (4.0.5: a new Biological fleet starts with no fuel)
  return f;
}
function canReach(G, f, sid) {
  if (f.sat || f.star == null || f.to != null) return false;
  return starDist(G, f.star, sid) <= f.fuel + 1e-9;
}
function orderMove(G, f, sid) {
  if (f.sat || f.star == null) return false;
  if (sid === f.star) { f.dest = null; f.path = null; return true; }
  if (!canReach(G, f, sid)) {
    // a ruleset may route the fleet through stars where it refuels (DOS 2.0)
    const path = rules(G).route ? rules(G).route(G, f, sid) : null;
    if (!path || !path.length) return false;
    f.dest = path[0]; f.path = path.length > 1 ? path.slice(1) : null; return true;
  }
  f.dest = sid; f.path = null; return true;
}
// multi-star path (waypoints): the fleet stops at each star, refuels, and goes on
function orderPath(G, f, sids) {
  if (f.sat || f.star == null || !sids.length || !feature(G, 'waypoints')) return false;
  if (!canReach(G, f, sids[0])) return false;
  f.dest = sids[0]; f.path = sids.slice(1); if (!f.path.length) f.path = null; return true;
}
function cancelMove(G, f) { f.dest = null; f.path = null; }
// can fleet b join fleet a? (DOS 2.0 rules: a fleet holds only one ship type)
function canMerge(G, a, b) {
  if (a === b || a.owner !== b.owner || a.sat || b.sat) return false;
  if (rules(G).canMerge) return rules(G).canMerge(G, a, b); // a ruleset's own rule (Mac 1.2: one design a fleet)
  if (!feature(G, 'singleTypeFleets')) return true;
  const t = fleetKind(G, a);
  return fleetDesigns(G, b).every(d => d.type === t) && fleetDesigns(G, a).every(d => d.type === t);
}
// build queues (DOS 2.0 rules): ships wait at a colony until its shipbuilding
// money has paid for them; the ruleset's economy builds them
function queueShips(G, pid, sid, did, n) {
  const s = G.stars[sid], d = getDesign(G, pid, did);
  if (!d || s.owner !== pid || !canBuildType(G, G.players[pid], d.type) || n < 1) return 0;
  s.queue = s.queue || [];
  // rs.queueMergeAny: a design already in any slot gets the ships (1.2 / 2.0)
  const last = rules(G).queueMergeAny ? s.queue.find(q => q.did === did) : s.queue[s.queue.length - 1];
  if (last && last.did === did) last.n += n;
  else if (rules(G).queueSlots && s.queue.length >= rules(G).queueSlots) return 0; // every slot is taken
  else s.queue.push({ did, n });
  return n;
}
function unqueueShip(G, pid, sid, i) {
  const s = G.stars[sid];
  if (s.owner !== pid || !s.queue || !s.queue[i]) return;
  if (--s.queue[i].n <= 0) s.queue.splice(i, 1);
  if (i === 0) { if (rules(G).yardRefund) rules(G).yardRefund(G, G.players[pid], s); else s.yard = 0; }
}
function mergeFleets(G, a, b) { // b into a
  const orders = { a: { dest: a.dest, path: a.path, routeTo: a.routeTo }, b: { dest: b.dest, path: b.path, routeTo: b.routeTo }, fuel: { a: a.fuel, b: b.fuel } };
  for (const k in b.ships) a.ships[k] = (a.ships[k] || 0) + b.ships[k];
  if (b.colonists) a.colonists = (a.colonists || 0) + b.colonists;
  a.fuel = Math.min(a.fuel, b.fuel);
  a.dest = null;
  G.fleets.splice(G.fleets.indexOf(b), 1);
  if (rules(G).organized) rules(G).organized(G, a, b, null, orders); // a ruleset's own fuel, colonist and order rules
}
function splitFleet(G, f, take) { // take: {did:count}
  const nf = newFleet(G, f.owner, f.star, false); nf.newThisTurn = f.newThisTurn;
  for (const k in take) {
    const n = Math.min(take[k], f.ships[k] || 0);
    if (n > 0) { nf.ships[k] = n; f.ships[k] -= n; if (!f.ships[k]) delete f.ships[k]; }
  }
  nf.fuel = f.fuel; nf.name = f.name;
  if (f.colonists) { // colonists go with the colony ships
    const cs = (x) => fleetDesigns(G, x).filter(d => d.type === 'colony').reduce((a, d) => a + x.ships[d.id], 0);
    const moved = Math.min(f.colonists, cs(nf) * 10); nf.colonists = moved; f.colonists -= moved;
  }
  if (fleetCount(nf) === 0) { G.fleets.splice(G.fleets.indexOf(nf), 1); return null; }
  if (fleetCount(f) === 0) G.fleets.splice(G.fleets.indexOf(f), 1);
  if (rules(G).organized) rules(G).organized(G, f, null, nf);
  return nf;
}
// Alliances: each player lists who they want to ally with (p.allies) and be
// best buddies with (p.buddies); a pact exists only when both sides want it.
function wants(G, a, b, key) { const p = G.players[a]; return !!(p && p[key] && p[key].includes(b)); }
function isAllied(G, a, b) { return a === b || (feature(G, 'alliances') && wants(G, a, b, 'allies') && wants(G, b, a, 'allies')); }
function isBuddy(G, a, b) { return a === b || (isAllied(G, a, b) && wants(G, a, b, 'buddies') && wants(G, b, a, 'buddies')); }
function isFriend(G, a, b) { return isAllied(G, a, b); }
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
// report n from the original's STR# 6020 (js/data.js), filled like printf
function report(n, ...args) {
  let i = 0;
  return ((DATA.reports || [])[n - 1] || '').replace(/%(\.\*)?[sd]|%%/g, (m) => m === '%%' ? '%' : String(args[i++] ?? ''));
}
// Every human player has their own messages (p.inbox); computers get none.
// opt.won (a battle report: true when the player won, false when they
// lost) is kept on the message for the skin (auto play stops on battles won
// or lost) but not saved, so saved games stay as they were.
function msg(G, pid, text, opt) {
  if (pid == null) return;
  const p = G.players[pid];
  if (!p || !p.human) return;
  const { won, ...rest } = opt || {};
  const m = Object.assign({ text }, rest);
  if (won != null) Object.defineProperty(m, 'won', { value: !!won, enumerable: false, writable: true, configurable: true });
  (p.inbox || (p.inbox = [])).push(m);
}
// news for every human player
function msgAll(G, text, opt) { for (const p of G.players) msg(G, p.id, text, opt); }
// Hot seat: several humans take turns on one computer. Humans are players
// 0..n-1 and computers come after them; G.cur is the human whose turn it is
// (only the skin uses it, the game rules don't).
const humans = (G) => G.players.filter(p => p.human);
// Save format history (upgradeSave):
// - no G.rules: saves from before rulesets existed (before commit 0198d39,
//   "Move the Claude rules and computer players out of the engine"), when
//   the remake's own rules, now the 'claude' ruleset, were the only rules.
//   Such a save is a Claude-rules game: a migration, not a fallback.
// - G.inbox: one shared inbox, from before hot seat (each player's p.inbox).
// A save naming a ruleset this remake doesn't have is an error (load throws).
function upgradeSave(G) {
  if (G.rules == null) G.rules = 'claude';
  if (G.inbox) { if (G.players[0] && !G.players[0].inbox) G.players[0].inbox = G.inbox; delete G.inbox; }
  if (G.cur == null) G.cur = 0;
  return G;
}
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

// ---------- diplomacy: alliances, best buddies, gifts, surrender, chat ----------
function setPact(G, pid, other, kind, on) {
  if (!feature(G, 'alliances') || pid === other) return;
  const p = G.players[pid], key = kind === 'buddy' ? 'buddies' : 'allies';
  p[key] = (p[key] || []).filter(x => x !== other);
  if (on) p[key].push(other);
  if (kind === 'ally' && !on) p.buddies = (p.buddies || []).filter(x => x !== other);
  if (kind === 'buddy' && on && !(p.allies || []).includes(other)) (p.allies = p.allies || []).push(other);
}
// up to three gifts a turn; they arrive at the end of the turn
function give(G, from, to, money, metal) {
  const p = G.players[from];
  money = Math.max(0, Math.floor(money || 0)); metal = Math.max(0, Math.floor(metal || 0));
  if (!feature(G, 'gifts') || from === to || !G.players[to] || !G.players[to].alive) return 'no';
  if ((p.giftsThisTurn || 0) >= 3) return 'limit';
  if (money > Math.max(0, p.savings) || metal > p.metal || (!money && !metal)) return 'short';
  p.savings -= money; p.metal -= metal; p.giftsThisTurn = (p.giftsThisTurn || 0) + 1;
  (G.gifts = G.gifts || []).push({ from, to, money, metal });
  msg(G, from, money ? report(103, G.players[to].name, fmt(money)) : report(104, G.players[to].name, fmt(metal)), { icon: 'm9048', quiet: true });
  return 'ok';
}
// surrender to a player, or to no one (to = -1); null cancels
function surrender(G, pid, to) {
  if (!feature(G, 'surrender')) return;
  G.players[pid].surrenderTo = to;
  if (to == null) msg(G, pid, (DATA.alerts || [])[2] || 'You are no longer surrendering to anyone.', { quiet: true });
}
function sendChat(G, from, to, text) {
  if (!feature(G, 'chat')) return;
  const p = G.players[from], lim = rules(G).chatLimit; // 4.0.5: ten messages a turn
  if (lim) { if ((p.chatThisTurn || 0) >= lim) return 'limit'; p.chatThisTurn = (p.chatThisTurn || 0) + 1; }
  if (G.players[to].human) msg(G, to, report(55, p.name, text), { icon: p.human ? 'm9024' : 'bad' + p.face + '_' + (p.female ? 1 : 0), chat: true });
  if (p.human) msg(G, from, report(71, G.players[to].name, text), { quiet: true });
  (G.players[to].news = G.players[to].news || []).push({ type: 'chat', from, text });
}
function setArmageddon(G, pid, on) {
  if (!feature(G, 'armageddon')) return;
  const p = G.players[pid];
  if (!!p.armageddon === !!on) return;
  p.armageddon = !!on;
  for (const q of G.players) if (q.id !== pid) msg(G, q.id, report(on ? 137 : 138, p.name), { icon: 'm9036' });
}
// surrender: fleets are dismantled; planets, savings and metal go to the winner (FUN_100742b0)
function processSurrenders(G) {
  G.handovers = [];
  for (const p of G.players) {
    if (p.surrenderTo == null || !p.alive || p.surrendered) continue;
    const to = p.surrenderTo; p.surrenderTo = null;
    const h = { from: p.id, to, money: Math.max(0, p.savings + Math.max(0, p.lastGross || 0)), metal: Math.max(0, p.metal), stars: colonies(G, p.id).map(s => s.id) };
    G.fleets = G.fleets.filter(f => f.owner !== p.id);
    for (const sid of h.stars) { const s = G.stars[sid]; s.owner = -1; s.pop = 0; }
    p.savings = 0; p.metal = 0; p.surrendered = true; p.armageddon = false;
    for (const q of G.players) {
      if (q.id === p.id) msg(G, q.id, to >= 0 ? report(108, G.players[to].name) : report(107), { icon: 'p3040', sound: 7020 });
      else msg(G, q.id, to >= 0 ? report(106, p.name, G.players[to].name) : report(105, p.name), { icon: 'm9036' });
    }
    if (to >= 0) G.handovers.push(h);
  }
}
function processHandovers(G) {
  for (const h of G.handovers || []) {
    const q = G.players[h.to]; if (!q || !q.alive) continue;
    const from = G.players[h.from].name;
    q.savings += h.money; q.metal += h.metal;
    msg(G, q.id, report(148, from, fmt(h.money)), { icon: 'm9048' });
    msg(G, q.id, report(149, from, fmt(h.metal)), { icon: 'm9046' });
    for (const sid of h.stars) {
      const s = G.stars[sid];
      if (s.owner >= 0 || G.fleets.some(f => f.star === sid && f.to == null && !isAllied(G, f.owner, q.id))) continue;
      msg(G, q.id, report(150, from, s.name), { icon: 'm9031', star: sid });
      s.owner = q.id; s.pop = 0.001; s.everProfit = false; s.oInc = -7501; s.oNew = true; s.oSink = 0;
      observe(G, q, sid);
    }
  }
  G.handovers = [];
}
function deliverGifts(G) {
  for (const g of G.gifts || []) {
    const q = G.players[g.to]; if (!q.alive) continue;
    q.savings += g.money; q.metal += g.metal;
    if (g.money) msg(G, q.id, report(101, G.players[g.from].name, fmt(g.money)), { icon: 'm9048' });
    if (g.metal) msg(G, q.id, report(102, G.players[g.from].name, fmt(g.metal)), { icon: 'm9046' });
    (q.news = q.news || []).push({ type: 'gift', from: g.from, money: g.money, metal: g.metal });
  }
  G.gifts = [];
  for (const p of G.players) p.giftsThisTurn = 0;
}
// report changes in alliances and best-buddy pacts (FUN_100761c0)
function pactNews(G) {
  const prev = G.pactPrev || {};
  const cur = {};
  for (const p of G.players) cur[p.id] = { allies: (p.allies || []).slice(), buddies: (p.buddies || []).slice() };
  const had = (snap, a, b, key) => !!(snap[a] && snap[a][key].includes(b));
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive) continue;
    const name = q.name;
    const wasAlly = had(prev, p.id, q.id, 'allies') && had(prev, q.id, p.id, 'allies');
    const isAlly = had(cur, p.id, q.id, 'allies') && had(cur, q.id, p.id, 'allies');
    const wasBud = wasAlly && had(prev, p.id, q.id, 'buddies') && had(prev, q.id, p.id, 'buddies');
    const isBud = isAlly && had(cur, p.id, q.id, 'buddies') && had(cur, q.id, p.id, 'buddies');
    const say = (n) => msg(G, p.id, report(n, name), { icon: 'm9024', quiet: n === 88 || n === 94 ? false : true });
    if (isAlly && !wasAlly) { say(92); (p.news = p.news || []).push({ type: 'allied', with: q.id }); }
    else if (!isAlly && wasAlly) { say(93); (p.news = p.news || []).push({ type: 'broken', with: q.id }); }
    else if (!isAlly) {
      if (had(cur, q.id, p.id, 'allies') && !had(prev, q.id, p.id, 'allies')) say(88);
      if (!had(cur, q.id, p.id, 'allies') && had(prev, q.id, p.id, 'allies')) say(89);
      if (had(cur, p.id, q.id, 'allies') && !had(prev, p.id, q.id, 'allies')) say(90);
      if (!had(cur, p.id, q.id, 'allies') && had(prev, p.id, q.id, 'allies')) say(91);
    }
    if (isBud && !wasBud) say(98);
    else if (!isBud && wasBud && isAlly) say(99);
    else if (isAlly && !isBud) {
      if (had(cur, q.id, p.id, 'buddies') && !had(prev, q.id, p.id, 'buddies')) say(94);
      if (!had(cur, q.id, p.id, 'buddies') && had(prev, q.id, p.id, 'buddies')) say(95);
      if (had(cur, p.id, q.id, 'buddies') && !had(prev, p.id, q.id, 'buddies')) say(96);
      if (!had(cur, p.id, q.id, 'buddies') && had(prev, p.id, q.id, 'buddies')) say(97);
    }
  }
  G.pactPrev = cur;
}
// best buddies tell each other about the stars they explore (FUN_10078390)
function shareMaps(G) {
  for (const p of G.players) for (const q of G.players) {
    if (p.id === q.id || !p.alive || !q.alive || !isBuddy(G, p.id, q.id)) continue;
    for (const sid in q.know) {
      const a = know(G, p, +sid), b = q.know[sid];
      if (b.explored && b.seen > a.seen) Object.assign(a, b);
    }
  }
}

// ---------- galaxy creation ----------
function newGame(opts) {
  const G = {
    v: 1, rules: rulesById(opts.rules).id, // every new game names its rules
    rs: (opts.seed >>> 0) || ((Date.now() ^ 0x5eed) >>> 0), year: 2000, turn: 0, nextId: 1,
    opts, stat: { battles: 0, captures: 0, colonized: 0 }, stars: [], players: [], fleets: [], battles: [], cur: 0, over: false, winner: -1, log: [],
  };
  const rs = rules(G);
  // a ruleset whose original game had no New Game choices fixes them here
  if (rs.fixOptions) rs.fixOptions(opts);
  // opts.humans: [{ name, female }] for a hot-seat game; else one human from opts.name / opts.female
  const H = Array.isArray(opts.humans) && opts.humans.length ? opts.humans.slice(0, 8) : [{ name: opts.name, female: opts.female }];
  const nHum = H.length;
  const nComp = clamp(opts.computers | 0, nHum > 1 ? 0 : 1, (rs.maxPlayers || 16) - nHum); // 4.0.5: up to 20 players
  const nPlayers = nComp + nHum;
  // a ruleset may lay out the galaxy itself (and pick the home stars)
  const gal = rs.makeGalaxy ? rs.makeGalaxy(G, opts, nPlayers) : null;
  let pts;
  if (gal) { G.W = gal.W; G.H = gal.H; pts = gal.pts; }
  else {
    const [n0, W0, H0] = rs.galaxySizes[opts.size] || rs.galaxySizes.medium;
    const dens = { sparse: 1.25, normal: 1.0, dense: 0.82 }[opts.density || 'normal'];
    const W = W0 * dens, H = H0 * dens, n = n0;
    G.W = W; G.H = H;
    pts = placeStars(G, n, W, H, opts.shape || 'random');
  }
  // Name a Star (rs.nameAStar): the names players gave stars in earlier games,
  // which the skin keeps (opts.starNamesKept), join the version's own list
  // ('pool') or are put in the galaxy, at most rs.nameAStar.put of them
  // ('put'); none kept, the list is the version's own as before
  const NS = rs.nameAStar, kept = NS && Array.isArray(opts.starNamesKept) ? opts.starNamesKept.filter(n => typeof n === 'string' && n) : [];
  const base = rs.starNames || DATA.starNames;
  let names = shuffle(G, base.slice().concat(NS && NS.use === 'pool' ? kept.filter(n => !base.includes(n)) : []));
  if (NS && NS.use === 'put' && kept.length) { const put = kept.slice(-(NS.put || kept.length)); names = put.concat(names.filter(n => !put.includes(n))); }
  pts.forEach((pt, i) => {
    const st = rs.newStar(G);
    const s = { id: i, name: names[i % names.length] || ('Star ' + i), x: pt.x, y: pt.y, g: st.g, t: st.t, metal: st.metal, owner: -1, pop: 0, terra: 0.5, nova: 0, debris: 0, everProfit: false };
    if (pt.x10 != null) { s.x10 = pt.x10; s.y10 = pt.y10; }
    G.stars.push(s);
  });
  // players
  const homes = gal && gal.homes ? gal.homes : chooseHomes(G, nPlayers);
  const usedNames = new Set();
  const faces = shuffle(G, [...Array(16).keys()]);
  const AI = aiOf(G);
  for (let i = 0; i < nPlayers; i++) {
    const human = i < nHum;
    // a ruleset may give the computers its own names (rs.maleNames, rs.femaleNames)
    // and say whether any computer is a woman (rs.femaleComputers: false = none,
    // or the chance that one is)
    // A ruleset may instead pick each computer's sex and name itself
    // (rs.computerIdentity(G, k, nComp, humans) -> { female, name }, k the
    // computer's number from 0), for one that draws them with other random
    // numbers than the game's (Mac 4.0.5)
    const own = !human && rs.computerIdentity ? rs.computerIdentity(G, i - nHum, nComp, H) : null;
    const female = own ? !!own.female : human ? !!H[i].female : rs.femaleComputers === false ? false : R(G) < (typeof rs.femaleComputers === 'number' ? rs.femaleComputers : 0.45);
    let name;
    if (human) name = H[i].name || (nHum > 1 ? 'Player ' + (i + 1) : 'You');
    else if (own) name = own.name;
    else { do { name = pick(G, female ? (rs.femaleNames || DATA.femaleNames) : (rs.maleNames || DATA.maleNames)) || ('Computer ' + i); } while (usedNames.has(name) && usedNames.size < 40); }
    usedNames.add(name);
    const home = G.stars[homes[i]];
    // a ruleset may give each computer its own skill and home system
    const cs = !human && rs.computerSetup ? rs.computerSetup(G, opts, i - nHum, nComp) : null;
    const start = human ? (opts.start || 'normal') : cs ? cs.start : (opts.cstart || 'normal');
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
    if (!human) p.ai = AI.make(G, p, cs ? cs.iq : (opts.iq || 'average'));
    rs.defaultDesigns(G, p);
  }
  rs.afterSetup(G);
  G.fleets.forEach(f => f.newThisTurn = false);
  for (const p of G.players) p.inbox = [];
  // the first messages: a ruleset may give its game's own (rs.welcome: [[text, opt], ...], or (G) => that)
  const welcome = (typeof rs.welcome === 'function' ? rs.welcome(G) : rs.welcome) || [['Spaceward Ho! by Peter Commons. Designed by Joe Williams.', { icon: 'm9004', sound: 11111 }],
    ['Click here to make this message go away. Click on the clock to end your turn.', { icon: 'm9024' }]];
  for (const [t, o] of welcome) msgAll(G, t, o);
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
// An exception is never caught here: it goes up to the caller (the skin
// restores the game saved before End Turn and offers a bug report; the test
// tools stop). during() only notes on it where it happened (e.hoWhere).
function during(what, fn) {
  try { return fn(); } catch (e) { if (e && typeof e === 'object' && !e.hoWhere) e.hoWhere = what; throw e; }
}
function endTurn(G) {
  if (G.over) return;
  for (const p of G.players) p.inbox = [];
  // "Years per turn" (Original rules): one End Turn runs several 10-year
  // turns; the computers only plan on the first and the winner is only
  // checked on the last (FUN_100728d0)
  const steps = feature(G, 'yearsPerTurn') ? Math.max(1, Math.round((G.opts.yearsPerTurn || 10) / 10)) : 1;
  for (let i = 0; i < steps && !G.over; i++) turnStep(G, i === 0, i === steps - 1);
  // keep battle records bounded
  if (G.battles.length > 60) G.battles.splice(0, G.battles.length - 60);
}
function turnStep(G, first, last) {
  const rs = rules(G), AI = aiOf(G);
  if (first) {
    // rs.outComputersPlay: a computer that is out of the game still gives its
    // leftover fleets orders (1.2)
    for (const p of G.players) if ((p.alive || (rs.outComputersPlay && !G.over)) && !p.human) during(`the computer ${p.name}'s turn`, () => AI.turn(G, p));
    for (const p of G.players) if (p.human && p.auto && p.alive) during(`${p.name}'s auto play`, () => AI.turn(G, p));
  }
  // a ruleset may handle surrender, alliances news and who is out itself (rs.processSurrenders, ...)
  if (feature(G, 'surrender')) (rs.processSurrenders || processSurrenders)(G);
  // rs.economyForAll: the turn's first pass runs for out players too (DOS 2.0)
  for (const p of G.players) if ((p.alive || rs.economyForAll) && !p.surrendered) rs.economy(G, p);
  departures(G);
  movement(G);
  resolveStars(G);
  rs.refuel(G);
  if (rs.afterMovement) for (const p of G.players) if (p.alive) rs.afterMovement(G, p);
  rs.randomEvents(G);
  if (feature(G, 'gifts')) deliverGifts(G);
  if (feature(G, 'surrender')) (rs.processHandovers || processHandovers)(G);
  if (feature(G, 'alliances')) { (rs.pactNews || pactNews)(G); (rs.shareMaps || shareMaps)(G); } // rs.shareMaps: a ruleset's own best-buddy map sharing (4.0.5: in its pass 2)
  // a ruleset may decide who is out and who has won itself (rs.checkElimination)
  if (last || rs.checkEveryStep) (rs.checkElimination || checkElimination)(G);
  for (const p of G.players) { p.spentThisTurn = []; if (p.chatThisTurn) p.chatThisTurn = 0; recordHistory(G, p); }
  for (const f of G.fleets) f.newThisTurn = false;
  G.turn++; G.year += rs.yearsPerTurn;
}

function colonies(G, pid) { return G.stars.filter(s => s.owner === pid); }
function projected(G, p) { return rules(G).projected(G, p); }

function departures(G) {
  const rs = rules(G);
  for (const f of G.fleets.slice()) {
    if (f.dest == null && f.path && f.path.length && f.star != null) f.dest = f.path.shift(); // next leg of a multi-star path
    if (f.dest == null || f.star == null || f.sat) continue;
    // rs.departs(G, f): a ruleset's own test of whether a fleet with orders
    // leaves now; false keeps it waiting with its orders, saying nothing (5.0.5)
    if (rs.departs && !rs.departs(G, f)) continue;
    const d = starDist(G, f.star, f.dest);
    if (d > f.fuel + 1e-9) {
      if (f.path) { msg(G, f.owner, `Your fleet of ${fleetLabel(G, f)} is waiting to refuel before it can continue on to ${G.stars[f.dest].name}.`, { icon: 'm9038', star: f.star, quiet: true }); continue; }
      f.dest = null; continue;
    }
    f.from = f.star; f.to = f.dest; f.dist = d; f.prog = 0; f.fuel -= d; f.star = null; f.dest = null;
    if (f.path && !f.path.length) f.path = null;
  }
}
function movement(G) {
  for (const f of G.fleets) {
    if (f.to == null) continue;
    const v = fleetSpeed(G, f);
    f.prog += v;
    if (f.prog >= f.dist - 1e-9) { f.star = f.to; f.arrivedFrom = f.from; f.to = null; f.from = null; f.arrived = true; }
  }
  const rs = rules(G);
  if (rs.fleetArrives) for (const f of G.fleets.slice()) if (f.arrived && !rs.fleetArrives(G, f)) G.fleets.splice(G.fleets.indexOf(f), 1);
}

// ---------- star resolution: battles, exploration, colonization ----------
function resolveStars(G) {
  const arrivedAt = new Set();
  for (const f of G.fleets) if (f.arrived) arrivedAt.add(f.star);
  if (rules(G).battleEverywhere) for (const f of G.fleets) if (f.star != null && f.to == null) arrivedAt.add(f.star);
  for (const sid of arrivedAt) {
    const s = G.stars[sid];
    const present = G.fleets.filter(f => f.star === sid && f.to == null);
    const owners = new Set(present.map(f => f.owner));
    if (s.owner >= 0 && s.pop > 0) owners.add(s.owner);
    const ids = [...owners];
    if (ids.some(a => ids.some(b => !isAllied(G, a, b)))) battle(G, sid);
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
    // a ruleset may say when the owner hears of the arrival (rs.arrivalSays)
    else if (p.human && (rules(G).arrivalSays ? rules(G).arrivalSays(G, p, f, s) : s.owner !== p.id && !fleetHas(G, f, 'colony'))) {
      if (f.path && f.path.length) msg(G, p.id, report(25, fleetLabel(G, f), s.name, G.stars[f.path[0]].name), { icon: 'm9038', star: s.id, quiet: true });
      else msg(G, p.id, `Your fleet of ${fleetLabel(G, f)} has arrived at ${s.name}.`, { icon: 'm9038', star: s.id, quiet: true });
    }
    if (feature(G, 'arrivalNotices') && s.owner >= 0 && s.owner !== f.owner && G.fleets.includes(f))
      msg(G, s.owner, report(26, p.name, fleetLabel(G, f), s.name), { icon: 'm9038', star: s.id });
    // colonize
    if (s.owner < 0 && fleetHas(G, f, 'colony') && !hostileAt(G, p.id, s.id)) colonize(G, p, f, s);
  }
}
function hostileAt(G, pid, sid) {
  return G.fleets.some(f => f.star === sid && f.to == null && !isAllied(G, f.owner, pid) && fleetCount(f) > 0 && !fleetDesigns(G, f).every(d => d.type === 'decoy'));
}
function colonize(G, p, f, s) {
  if (p.ai && p.ai.noColonize && p.ai.noColonize[s.id]) return;
  const rs = rules(G);
  if (rs.canColonize && !rs.canColonize(G, p, f, s)) return;
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
  msg(G, p.id, `You have explored ${s.name}. Gravity: ${gStr}. Temp: ${Math.round(ts)}°. Metal: ${fmt(s.metal)}.`, { icon, sound: snd, star: s.id, explore: quality });
}

// ---------- battles ----------
// The ruleset fights the battle and removes the losses; the engine then
// updates everyone's knowledge and sends the reports.
// Replays: each record in G.battles is one replay ({ id, star, year, sides,
// start, rounds, ... }). The remake keeps one a star a turn (res.rec); a
// ruleset that keeps one a duel, as 1.2 and 2.0 did, pushes a record for
// each duel with rec.duel = 0, 1, … (the skin offers each of them) and
// points each duel's reports at its own record (msg opt battle: rec.id).
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
    const anyEnemyAlive = Object.keys(survivors).some(x => !isAllied(G, +x, o) && survivors[x] > 0);
    const won = mine > 0 && !anyEnemyAlive || (o === planetOwner && !planetDied && !anyEnemyAlive);
    if (mine > 0 || (o === s.owner)) observe(G, p, sid);
    else { k.battle = true; k.explored = k.explored; if (!k.explored) k.battleOnly = true; k.owner = Object.keys(survivors).map(Number).find(x => x !== o && survivors[x] > 0) ?? k.owner; k.seen = G.turn; k.enemyShips = Object.keys(survivors).filter(x => +x !== o).reduce((a, x) => a + survivors[x], 0); }
    if (!p.human) { if (p.ai && AI.noteBattle) AI.noteBattle(G, p, rec, won); continue; }
    if (b.reported) continue; // the ruleset wrote its own reports (Mac 1.2: one pair a duel)
    const enemies = ownerIds.filter(x => x !== o).map(x => G.players[x].name).join(' and ');
    const theirLoss = ownerIds.filter(x => x !== o).reduce((a, x) => a + (lost[x] || 0), 0);
    const myLoss = lost[o] || 0;
    let text, sound, icon = 'm9025';
    if (o === planetOwner) {
      if (planetDied) { text = `${enemies} destroyed your colony at ${s.name}. You lost ${myLoss} of your ships. They lost ${theirLoss}. You lost ${fmt((startPop) * 1e6)} people.`; sound = 7020; icon = 'm9036'; }
      else { text = `${s.name} survived an attack from ${enemies}. You lost ${myLoss} of your ships; they lost ${theirLoss}. You lost ${fmt((startPop - s.pop) * 1e6)} people.`; sound = won ? 7027 : 2001; }
    } else if (won) { text = `You won a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.` + (planetDied ? ` The colony there was wiped out.` : ''); sound = 7027; icon = 'p3000'; }
    else { text = `You lost a battle at ${s.name}. You lost ${myLoss} of your ships. ${enemies} lost ${theirLoss}.`; sound = 2001; }
    // a ruleset may word the report itself (rs.battleText: { text, sound, icon })
    const rs = rules(G);
    if (rs.battleText) { const t = rs.battleText(G, sid, b, o, { won, myLoss, theirLoss, enemies }); if (t) ({ text, sound, icon } = Object.assign({ text, sound, icon }, t)); }
    // won: the skin's auto play stops on battles won or lost by this flag,
    // not by the sound (7027 is 5.0.5's; 1.2 and 2.0 played none)
    msg(G, o, text, { icon, sound, star: sid, battle: rec.id, won });
  }
}

function evacuate(G, pid, sid) {
  const s = G.stars[sid];
  if (s.owner !== pid) return;
  if (rules(G).evacuate) return rules(G).evacuate(G, G.players[pid], sid); // a ruleset's own command (Mac 3.0.1: marked, given up at End Turn)
  s.owner = -1; s.pop = 0;
  delete G.players[pid].budget.col[sid];
  msg(G, pid, `You have evacuated ${s.name}.`, { icon: 'm9013', sound: 7002, star: sid, quiet: true });
}
// rs.scrapped(G, player, fleet, design): told of each fleet or design
// scrapped (2.0 reports it at the start of the next turn)
function scrapFleet(G, f) {
  const p = G.players[f.owner];
  if (rules(G).scrapped) rules(G).scrapped(G, p, f, null);
  const rate = rules(G).scrapReturn(G, p);
  let metal = 0;
  for (const k in f.ships) { const d = getDesign(G, f.owner, +k); metal += designCost(G, d).metal * f.ships[k] * rate; }
  if (f.star != null) {
    const s = G.stars[f.star];
    if (s.owner === f.owner) p.metal += metal; else if (rules(G).scrapAt) rules(G).scrapAt(G, f.owner, s, metal); else s.metal += metal;
  } else if (rules(G).scrapInSpace) rules(G).scrapInSpace(G, f, metal);
  G.fleets.splice(G.fleets.indexOf(f), 1);
  return metal;
}

// Ships > Scrap Ship Types: every ship of a design is dismantled and the
// design is retired (STR# 6020 #21)
function scrapDesign(G, pid, did) {
  const p = G.players[pid], d = getDesign(G, pid, did);
  if (!d) return 0;
  if (rules(G).scrapped) rules(G).scrapped(G, p, null, d);
  const rate = rules(G).scrapReturn(G, p);
  const unit = designCost(G, d).metal;
  let n = 0, metal = 0;
  for (const f of G.fleets.slice()) {
    if (f.owner !== pid || !f.ships[did]) continue;
    const c = f.ships[did]; n += c;
    const m = Math.floor(unit * c * rate); metal += m;
    if (f.star != null) { const s = G.stars[f.star]; if (s.owner === pid) p.metal += m; else if (rules(G).scrapAt) rules(G).scrapAt(G, pid, s, m); else s.metal += m; }
    else if (rules(G).scrapInSpace) rules(G).scrapInSpace(G, { owner: pid, to: f.to, ships: { [did]: c } }, m);
    delete f.ships[did];
    if (!fleetCount(f)) G.fleets.splice(G.fleets.indexOf(f), 1);
  }
  d.scrapped = true;
  msg(G, pid, report(21, d.name, n, fmt(metal)), { icon: 'm9014', quiet: true });
  return metal;
}
function liveDesigns(p) { return p.designs.filter(d => !d.scrapped).length; }
function checkElimination(G) {
  for (const p of G.players) {
    if (!p.alive) continue;
    const hasCol = G.stars.some(s => s.owner === p.id);
    const hasColShip = G.fleets.some(f => f.owner === p.id && fleetHas(G, f, 'colony'));
    if (!hasCol && !hasColShip) {
      p.alive = false;
      G.fleets = G.fleets.filter(f => f.owner !== p.id);
      for (const q of humans(G)) {
        if (q === p) msg(G, q.id, 'You have just been eliminated from the game.', { icon: 'p3040', sound: 7020, big: 'p3040' });
        else msg(G, q.id, `${p.name} has just been eliminated from the game.`, { icon: 'm9036', sound: 7020 });
      }
    }
  }
  const alive = G.players.filter(p => p.alive);
  // with alliances on, the game ends when every survivor is allied with every other
  const allAllied = feature(G, 'alliances') && alive.length > 1 && alive.every(a => alive.every(b => isAllied(G, a.id, b.id)));
  if (!G.over && allAllied) {
    const hw = alive.find(p => p.human);
    G.over = true; G.winner = hw ? hw.id : alive[0].id; G.winners = alive.map(p => p.id);
    for (const q of humans(G)) {
      if (alive.includes(q)) {
        for (const p of alive) if (p !== q) msg(G, q.id, report(78, p.name), { icon: 'p3030' });
        msg(G, q.id, 'Wow! You won! You and your allies have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
      } else msg(G, q.id, `${alive.map(p => p.name).join(' and ')} have just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
    }
  }
  if (!G.over && alive.length <= 1) {
    G.over = true; G.winner = alive.length ? alive[0].id : -1;
    for (const q of humans(G)) {
      if (G.winner === q.id) msg(G, q.id, 'Wow! You won! You have conquered the galaxy. Congratulations!', { icon: 'p3030', sound: 7021, big: 'p3030' });
      else if (G.winner >= 0) msg(G, q.id, `${G.players[G.winner].name} has just won the game.`, { icon: 'p3040', sound: 7020, big: 'p3040' });
    }
  }
  // every human is out: the game ends for them
  if (!G.over && !G.players.some(p => p.human && p.alive)) { G.over = true; G.winner = -2; }
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
function load(str) {
  const G = upgradeSave(JSON.parse(str));
  if (!RULESETS[G.rules]) {
    const e = new Error(`This saved game is played with the "${G.rules}" rules, which this version of the remake doesn't have.`);
    e.hoSave = true; throw e;
  }
  return G;
}

const API = {
  DATA, SHIP_TYPES, TYPES: SHIP_TYPES, TECHS,
  registerRules, registerAI, rules, rulesById, aiOf, feature, RULESETS, fixes, fixed, patchVersion,
  // [id, name] for the New Game window: the original games' rules by year of
  // release, then version ("2.0 (DOS and Windows 3.1, 1993)"); rulesets that
  // aren't an original game's (the remake's own) come last, by their label
  ruleOptions: () => Object.values(RULESETS)
    .sort((a, b) => (a.year || 1e4) - (b.year || 1e4) || String(a.version || '').localeCompare(String(b.version || ''), 'en', { numeric: true }))
    .map(r => [r.id, r.year ? `${r.version} (${r.platform}, ${r.year})` : r.label]),
  // the Version and Edition menus (above registerRules)
  families, editions,
  // the newest original game's rules: the New Game window's default
  newestRules: () => Object.values(RULESETS).filter(r => r.year).sort((a, b) => b.year - a.year || String(b.version).localeCompare(String(a.version), 'en', { numeric: true }))[0].id,
  // randomness and helpers for rulesets and AIs
  R, RI, pick, shuffle, gauss, clamp,
  newGame, endTurn, buildShips, unbuildShip, designLimits, designMin, designCost, shipCostNow, canBuildType, findOrCreateDesign, getDesign,
  fleetCount, fleetDesigns, fleetSpeed, fleetMaxRange, fleetHas, fleetKind, fleetLabel, orderMove, orderPath, cancelMove, canReach, canMerge, queueShips, unqueueShip,
  newFleet, addShipsToStar, mergeFleets, splitFleet, scrapFleet, evacuate, colonies, seenG, seenT, maxPop, planetClass, planetIncome,
  scrapDesign, liveDesigns, isFriend, isAllied, isBuddy, hasColonyAt, designName, report, setPact, give, surrender, sendChat, setArmageddon, hostileAt, know, observe, msg, msgAll, humans, starDist, dist, projected, techSum, score, save, load, borrowLimit, fmt,
};
if (typeof module !== 'undefined') {
  module.exports = API;
  // under Node, load the rulesets and computer players too
  require('./rules-claude.js'); require('./ai-claude.js');
  require('./rules-original.js'); require('./ai-original.js');
  require('./rules-dos.js');
  require('./rules-405.js'); require('./ai-405.js');
  require('./rules-301.js'); require('./ai-301.js');
  require('./rules-12.js'); require('./ai-12.js');
  require('./rules-palm.js'); require('./ai-palm.js');
  require('./rules-mac20.js'); require('./rules-mac405.js');
} else root.HO = API;
})(this);
