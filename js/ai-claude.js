// Spaceward Ho! web remake — computer players for the "Claude" rules.
//
// Written from the manual's "Computer Players" chapter, not from any other
// ruleset's code: "Some will be happy to sit on their home planets, building
// satellites and researching new technologies. Some will be aggressive,
// trying to expand rapidly. Some will go for a high weapon and shield
// technology, and then come out after the rest of the Galaxy." Smarter ones
// "learn from their mistakes, build larger fleets, invest more heavily in
// Technology, and expand faster", "increase their Tech spending if they feel
// they are falling behind", use tankers and biologicals, make multi-planet
// attacks, and preserve metal in the endgame. They only know what they've
// seen: planets as they were when last visited, enemy tech from the ships
// they've fought.
//
// Auto Play uses these too. For a human on Auto Play the computer "will
// never change your tech spending bars", won't redirect fleets that already
// have orders, won't evacuate colonies, and leaves alliances and messages to
// the human.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, clamp, colonies, know, getDesign, findOrCreateDesign, shipCostNow, buildShips, evacuate, orderMove, orderPath,
  mergeFleets, fleetCount, fleetHas, fleetDesigns, fleetMaxRange, starDist, techSum, seenG, seenT, isAllied, isBuddy, setPact, sendChat, give, surrender, humans, scrapFleet, borrowLimit } = E;
const RS = E.RULESETS.claude;
const { DREAD_TECH, BASE_UPKEEP, PROD_PER_POP, HOME_POP, gravHab, tempFactor, hitDamage, planetClassOf } = RS;
const TYPES = RS.ships;
const designLimits = (p, type) => RS.designLimits(null, p, type);
const costOf = (d) => RS.designCost(null, d);

// ---------- who they are ----------
const IQ = {
  dumb:       { smart: 0.6, ratio: 1.0, tech: 0.8,  expand: 0.7, learn: 0,   plans: 1, tankers: false },
  average:    { smart: 1.0, ratio: 1.3,  tech: 1.0,  expand: 1.0, learn: 0.5, plans: 1, tankers: false },
  smart:      { smart: 1.3, ratio: 1.6,  tech: 1.15, expand: 1.2, learn: 1,   plans: 2, tankers: true },
  diabolical: { smart: 1.6, ratio: 1.8,  tech: 1.25, expand: 1.35, learn: 1,  plans: 3, tankers: true },
};
// styles: how much they lean to tech, war, expansion and defense, and their research mix
const STYLES = {
  turtle:     { tech: 0.42, war: 0.25, expand: 0.7, sats: 2.0, mix: { range: 0.12, speed: 0.12, weapons: 0.24, shields: 0.28, mini: 0.12, radical: 0.12 },
    hello: ['Howdy, neighbor. We’re just going to stay right here, if it’s all the same to you.', 'Nice galaxy. We like our little corner of it.'] },
  expander:   { tech: 0.28, war: 0.5,  expand: 1.5, sats: 0.7, mix: { range: 0.3, speed: 0.18, weapons: 0.18, shields: 0.14, mini: 0.12, radical: 0.08 },
    hello: ['Lots of real estate out here. Better hurry.', 'Westward ho! Er, spaceward.'] },
  techie:     { tech: 0.5,  war: 0.55, expand: 0.9, sats: 1.2, mix: { range: 0.14, speed: 0.12, weapons: 0.3, shields: 0.28, mini: 0.08, radical: 0.08 },
    hello: ['We’re mostly scientists here. Mostly.', 'Have you read any good journals lately? We’ve been busy.'] },
  warmonger:  { tech: 0.3,  war: 1.0,  expand: 1.0, sats: 0.6, mix: { range: 0.16, speed: 0.2, weapons: 0.3, shields: 0.22, mini: 0.08, radical: 0.04 },
    hello: ['This galaxy ain’t big enough for the both of us.', 'Nice colony. Shame if something happened to it.'] },
  balanced:   { tech: 0.36, war: 0.6,  expand: 1.1, sats: 1.0, mix: { range: 0.2, speed: 0.15, weapons: 0.22, shields: 0.21, mini: 0.12, radical: 0.1 },
    hello: ['Pleased to meet you. Let’s keep this friendly, shall we?', 'Hello there. Mind your fences and we’ll mind ours.'] },
  prospector: { tech: 0.32, war: 0.5,  expand: 1.3, sats: 0.9, mix: { range: 0.24, speed: 0.12, weapons: 0.2, shields: 0.18, mini: 0.2, radical: 0.06 },
    hello: ['There’s metal in them thar stars.', 'Seen any good ore lately? Asking for a friend.'] },
  gambler:    { tech: 0.38, war: 0.6,  expand: 1.0, sats: 0.9, mix: { range: 0.16, speed: 0.14, weapons: 0.2, shields: 0.18, mini: 0.08, radical: 0.24 },
    hello: ['Feeling lucky? We are.', 'Care to make this interesting?'] },
};
const STYLE_NAMES = Object.keys(STYLES);

function make(G, p, iq) {
  const style = p.human ? 'balanced' : pick(G, STYLE_NAMES);
  const ai = { iq: IQ[iq] ? iq : 'average', style, temper: R(G) - 0.5, lostAt: {}, lostCol: {}, noColonize: {}, seen: {}, mood: {}, said: {}, plans: [], allySince: {}, met: {} };
  if (!p.human) p.talloc = Object.assign({}, STYLES[style].mix);
  return ai;
}
const P = (ai) => IQ[ai.iq] || IQ.average;
const S = (ai) => STYLES[ai.style] || STYLES.balanced;

// ---------- what they know ----------
function enemyTech(G, p, o) {
  const ai = p.ai, s = ai.seen[o];
  // never fought them: assume they're about where we are
  if (!s) return { W: p.tech.weapons, S: p.tech.shields };
  const drift = Math.floor((G.turn - s.t) / 15);
  return { W: s.W + drift, S: s.S + drift };
}
function noteBattle(G, p, rec, won) {
  const ai = p.ai; if (!ai) return;
  for (const u of rec.start) {
    if (u.o === p.id) continue;
    const d = getDesign(G, u.o, u.did); if (!d || d.type === 'decoy') continue;
    const s = ai.seen[u.o] || (ai.seen[u.o] = { W: 1, S: 1, t: G.turn });
    if (s.t < G.turn - 2) { s.W = 1; s.S = 1; }
    s.W = Math.max(s.W, d.W); s.S = Math.max(s.S, d.S); s.t = G.turn;
  }
  if (!won) ai.lostAt[rec.star] = G.turn;
  if (rec.start.some((u, i) => u.o === p.id && u.t === 'scout' && !rec.end[i])) (ai.scoutLoss = ai.scoutLoss || []).push(G.turn);
  if (rec.planetOwner === p.id && rec.planetDied) ai.lostCol[rec.star] = G.turn;
  // whoever shot at us is less of a friend
  for (const o of rec.sides) if (o !== p.id && !isAllied(G, o, p.id)) ai.mood[o] = (ai.mood[o] || 0) - (rec.planetOwner === p.id ? 1 : 0.4);
  if (p.ai.iq !== 'dumb' && rec.planetOwner !== p.id && !won) ai.caution = Math.min(1.5, (ai.caution || 0) + 0.15 * P(ai).learn);
}
// the strength of a group of ships against an enemy with tech (W, S): the
// square law, so firepower times staying power
function strength(G, units, eW, eS, stanceW) {
  let fire = 0, hp = 0;
  for (const [d, n] of units) {
    const T = TYPES[d.type];
    fire += n * T.shots * hitDamage(d.W + (stanceW || 0) - eS);
    hp += n * T.hp / Math.max(0.003, hitDamage(eW - d.S));
  }
  return fire * hp;
}
function fleetUnits(G, fs) { const u = []; for (const f of fs) for (const k in f.ships) { const d = getDesign(G, f.owner, +k); if (d) u.push([d, f.ships[k]]); } return u; }
// what we expect at an enemy star
function expectedDefense(G, p, sid, o) {
  const k = know(G, p, sid);
  const age = Math.max(0, G.turn - (k.seen < 0 ? 0 : k.seen));
  const t = enemyTech(G, p, o);
  const ships = (k.enemyShips || 0) * (1 + age / 12) + (k.battleOnly ? 6 : 0) + Math.min(10, age / 4);
  const pop = (k.pop || 0) + age * 5;
  const pShots = Math.min(4, 1 + Math.floor(pop / 300));
  const myW = p.tech.weapons, myS = p.tech.shields;
  // treat their ships as Fighters (with a few Satellites' extra shots)
  const fire = ships * 1.3 * hitDamage(t.W - myS) + pShots * hitDamage(t.W - 1 - myS);
  const hp = ships / Math.max(0.003, hitDamage(myW - t.S)) + pop / (RS.BOMBARD * Math.max(0.003, hitDamage(myW - t.S)));
  return { str: fire * hp, ships, t };
}

// ---------- the turn ----------
function turn(G, p) {
  const ai = p.ai || (p.ai = make(G, p, 'average'));
  if (!ai.plans) Object.assign(ai, make(G, p, ai.iq || 'average'), ai); // an older save's computer
  // the engine tells only computers about battles; on Auto Play, read the records ourselves
  if (p.human) {
    for (const rec of G.battles) {
      if (rec.id <= (ai.lastBattle || 0) || !rec.sides.includes(p.id)) continue;
      const mine = (rec.survivors || {})[p.id] || 0, foes = Object.keys(rec.survivors || {}).some(o => +o !== p.id && !isAllied(G, +o, p.id) && rec.survivors[o] > 0);
      noteBattle(G, p, rec, (mine > 0 || (rec.planetOwner === p.id && !rec.planetDied)) && !foes);
    }
    if (G.battles.length) ai.lastBattle = Math.max(ai.lastBattle || 0, G.battles[G.battles.length - 1].id);
  }
  const cols = colonies(G, p.id);
  if (!cols.length) { strandedColonists(G, p); return; }
  const ctx = context(G, p, cols);
  if (!p.human) { diplomacy(G, p, ai, ctx); chat(G, p, ai, ctx); }
  designs(G, p, ai, ctx);
  budget(G, p, ai, ctx);
  if (!p.human) { research(G, p, ai, ctx); evacuateJunk(G, p, ai, ctx); scrapObsolete(G, p, ai, ctx); }
  colonize(G, p, ai, ctx);
  scouts(G, p, ai, ctx);
  defend(G, p, ai, ctx);
  war(G, p, ai, ctx);
  tidy(G, p, ai, ctx);
  if (!p.human) maybeSurrender(G, p, ai, ctx);
}
function context(G, p, cols) {
  const enemies = G.players.filter(q => q.alive && q.id !== p.id && !isAllied(G, q.id, p.id) && !q.surrendered);
  const known = {}; // enemy colonies we know of, by owner
  for (const s of G.stars) { const k = know(G, p, s.id); if (k.explored && k.owner >= 0 && k.owner !== p.id && !(k.nova >= 210)) (known[k.owner] = known[k.owner] || []).push(s.id); }
  const metalLeft = cols.reduce((a, s) => a + s.metal, 0);
  const metalPoor = p.metal < 3000 && metalLeft < 8000;
  const income = Math.max(0, p.lastIncome || 0);
  const reserve = Math.max(20000, 0.5 * (p.lastGross || 0));
  return { cols, enemies, known, metalPoor, income, reserve, home: G.stars[p.homeStar] && G.stars[p.homeStar].owner === p.id ? p.homeStar : cols[0].id };
}
function idle(G, p, test) { return G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null && !f.sat && f.dest == null && !(f.path && f.path.length) && !f.scrap301 && (!test || test(f))); }
function kindOf(G, f) {
  const ds = fleetDesigns(G, f), t = new Set(ds.map(d => d.type));
  if (t.has('dread') || t.has('fighter') || t.has('bio')) return 'war';
  if (t.has('colony')) return 'colony';
  if (t.has('scout')) return 'scout';
  if (t.has('tanker')) return 'tanker';
  return 'other';
}
function nearestOwn(G, p, sid, test) {
  let best = -1, bd = 1e9;
  for (const s of G.stars) if (s.owner === p.id && s.pop > 0 && (!test || test(s))) { const d = starDist(G, sid, s.id); if (d < bd) { bd = d; best = s.id; } }
  return [best, bd];
}
function port(G, p, sid) { const s = G.stars[sid]; return s.owner >= 0 && s.pop > 0 && (s.owner === p.id || isAllied(G, s.owner, p.id)); }
// a path through our (and our allies') colonies, each hop within range; the last hop may be one-way
function route(G, p, from, to, range) {
  if (starDist(G, from, to) <= range + 1e-9) return [to];
  const nodes = G.stars.filter(s => port(G, p, s.id)).map(s => s.id);
  const dist = { [from]: 0 }, prev = {}, done = new Set();
  for (let guard = 0; guard < 400; guard++) {
    let u = null;
    for (const k in dist) if (!done.has(+k) && (u == null || dist[k] < dist[u])) u = +k;
    if (u == null) return null;
    if (u === to) break;
    done.add(u);
    const next = nodes.concat([to]);
    for (const v of next) {
      if (done.has(v) || v === u) continue;
      const d = starDist(G, u, v); if (d > range + 1e-9) continue;
      if (dist[v] == null || dist[u] + d < dist[v]) { dist[v] = dist[u] + d; prev[v] = u; }
    }
  }
  if (dist[to] == null) return null;
  const path = []; for (let v = to; v !== from; v = prev[v]) { path.unshift(v); if (path.length > 40) return null; }
  return path;
}
function send(G, p, f, to) {
  if (f.star === to) return true;
  if (orderMove(G, f, to)) return true;
  const path = route(G, p, f.star, to, fleetMaxRange(G, f));
  if (!path || !path.length) return false;
  if (path.length === 1) return orderMove(G, f, path[0]);
  return orderPath(G, f, path);
}

// ---------- designs: the best ship of each kind we can make, with the right amount of Mini ----------
function designs(G, p, ai, ctx) {
  // what metal is worth to us right now, in money
  const price = clamp((Math.max(0, p.savings) + 4 * ctx.income) / Math.max(300, p.metal), 4, 400);
  ai.metalPrice = price;
  // Mini: none, half, or all of it, whichever is cheapest at that price
  const best = (type) => {
    const L = designLimits(p, type);
    let pick = null, cost = 1e18;
    for (const m of [...new Set([1, Math.ceil(L.M / 2), L.M])]) {
      const spec = { type, R: type === 'satellite' ? 0 : L.R, V: L.V, W: L.W, S: L.S, M: m };
      const c = costOf(spec), v = c.money + c.metal * price;
      if (v < cost - 1e-6) { cost = v; pick = spec; }
    }
    return pick;
  };
  const bestSpec = best;
  const was = ai.d || {};
  // a new type costs a prototype, so only switch when it's worth it
  const keep = (type, spec) => {
    const cur = D(G, p, was[type]);
    const make = () => { const n = p.designs.length, d = findOrCreateDesign(G, p, spec); if (p.designs.length > n) (ai.made = ai.made || []).push(d.id); return d.id; };
    if (!cur || cur.scrapped || cur.type !== type) return make();
    const gain = RS.power(spec) - RS.power(cur) + (spec.R - cur.R) * (type === 'colony' || type === 'scout' || type === 'tanker' ? 0.6 : 0.15) + Math.abs((spec.M || 1) - (cur.M || 1)) * 0.3;
    const need = type === 'colony' || type === 'tanker' ? 1.1 : type === 'scout' ? 1.7 : 1.9;
    return gain >= need ? make() : cur.id;
  };
  const spec = (type, m) => Object.assign(designLimits(p, type), { type, M: m == null ? designLimits(p, type).M : m });
  ai.d = {
    // Scouts and Colony Ships carry no guns or armor worth the price ("Colony Ships ... the first thing the enemy will shoot at")
    scout: keep('scout', Object.assign(bestSpec('scout'), { W: 1, S: 1 })),
    colony: keep('colony', Object.assign(spec('colony', 1), { W: 1, S: 1, V: Math.min(p.tech.speed, 2 + Math.floor(p.tech.speed / 2)) })),
    fighter: keep('fighter', bestSpec('fighter')), satellite: keep('satellite', bestSpec('satellite')),
    tanker: keep('tanker', Object.assign(spec('tanker', 1), { W: 1, S: Math.max(1, Math.floor(p.tech.shields / 2)) })),
  };
  if (RS.canBuild(G, p, 'dread')) ai.d.dread = keep('dread', bestSpec('dread'));
  if (p.hasBio) ai.d.bio = keep('bio', spec('bio', 1));
  if (p.hasDecoy) ai.d.decoy = keep('decoy', { type: 'decoy', R: p.tech.range, V: p.tech.speed, W: 1, S: 1, M: 1 });
  // old types the computer made with no ships left are retired, so the list doesn't grow forever
  // (on Auto Play, only the computer's own: a human's designs are never touched)
  if (Object.keys(was).some(k => was[k] !== ai.d[k])) {
    const inUse = new Set(); for (const f of G.fleets) if (f.owner === p.id) for (const k in f.ships) inUse.add(+k);
    const cur = new Set(Object.values(ai.d)), mine = new Set(ai.made || []);
    for (const d of p.designs) if (!d.scrapped && !cur.has(d.id) && !inUse.has(d.id) && (!p.human || mine.has(d.id))) d.scrapped = true;
    if (ai.made && ai.made.length > 200) ai.made = ai.made.filter(id => { const d = getDesign(G, p.id, id); return d && !d.scrapped; });
  }
}
const D = (G, p, id) => id != null ? getDesign(G, p.id, id) : null;
function afford(G, p, d, n, keep) {
  if (!d) return 0;
  const c = shipCostNow(G, p, d);
  const money = p.savings - (keep || 0), metal = p.metal;
  let k = 0;
  // the first may carry the prototype cost
  if (money >= c.money && metal >= c.metal) { k = 1; const c2 = RS.designCost(G, d); k += Math.floor(Math.min((money - c.money) / Math.max(1, c2.money), (metal - c.metal) / Math.max(1, c2.metal || 1e-9))); }
  return clamp(k, 0, n);
}
function build(G, p, sid, d, n, keep) {
  const k = afford(G, p, d, n, keep);
  return k > 0 ? buildShips(G, p.id, sid, d.id, k) : 0;
}

// ---------- the budget ----------
function budget(G, p, ai, ctx) {
  const st = S(ai), iq = P(ai), b = p.budget;
  // tech: the style's share, more for the clever, more again if we're falling behind
  let tech = st.tech * iq.tech;
  let behind = 0;
  for (const q of ctx.enemies) { if (!ai.seen[q.id]) continue; const t = enemyTech(G, p, q.id); behind = Math.max(behind, (t.W + t.S) - (p.tech.weapons + p.tech.shields)); }
  if (behind > 1 && iq.learn) tech += 0.05 * Math.min(4, behind) * iq.smart;
  if (p.savings < 0) tech *= 0.5;
  // colonies: what each needs
  const col = {};
  for (const s of ctx.cols) {
    const cls = planetClassOf(seenG(p, s));
    const needT = Math.abs(seenT(p, s) - 72) > 0.5, metal = s.metal > 0;
    let w = 0;
    if (s.id === p.homeStar || (!needT && cls === 'good')) { s.terra = 0; w = metal ? (ctx.metalPoor || p.metal < 4000 ? 0.12 : 0.07) : 0; }
    else if (cls === 'good') { s.terra = metal ? 0.8 : 1; w = 0.07 + 0.08 * Math.min(1, Math.abs(seenT(p, s) - 72) / 150); }
    else if (cls === 'semi') { s.terra = metal ? 0.25 : (needT ? 1 : 0); w = metal ? 0.07 : needT ? 0.04 : 0; }
    else { s.terra = 0; w = metal ? (st === STYLES.prospector ? 0.12 : 0.08) : 0; }
    if (p.human && b.col[s.id] != null && s.id !== p.homeStar) w = Math.max(w * 0.5, Math.min(w * 1.5, b.col[s.id])); // auto play: nudges, not shoves
    col[s.id] = w;
  }
  let colTot = 0; for (const k in col) colTot += col[k];
  // savings: a cushion, and no more (money sitting in the bank wins no wars)
  let sav = p.savings < ctx.reserve ? 0.3 : p.savings < 3 * ctx.reserve ? 0.12 : 0.03;
  // "Savings is money that will be saved up for later use and shipbuilding": a war needs ships
  if ((ai.plans || []).length && p.metal > 1500) sav += 0.3 * st.war * (G.turn < 40 ? 0.6 : 1);
  if (p.savings < 0) sav = 0.45;
  const tot = tech + sav + colTot;
  b.tech = tech / tot; b.savings = sav / tot;
  b.col = {}; for (const k in col) b.col[k] = col[k] / tot;
}
// research mix: the style's, shifted by what the game needs (computers only)
function research(G, p, ai, ctx) {
  const mix = Object.assign({}, S(ai).mix);
  if (ctx.metalPoor) { mix.mini += 0.15; mix.radical += 0.15; }
  if (!Object.keys(ctx.known).some(o => ctx.enemies.some(q => q.id === +o))) mix.range += 0.12; // nobody to fight in reach: look farther
  const lead = techSum(p) + p.tech.mini;
  if (techSum(p) < DREAD_TECH && techSum(p) > DREAD_TECH - 4) { mix.weapons += 0.04; mix.shields += 0.04; }
  if (lead > 0 && p.tech.range < 6 && G.turn > 20) mix.range += 0.08;
  let tot = 0; for (const k in mix) tot += mix[k];
  for (const k in mix) p.talloc[k] = mix[k] / tot;
}
function evacuateJunk(G, p, ai, ctx) {
  if (ctx.cols.length <= 1) return;
  for (const s of ctx.cols) {
    if (s.id === p.homeStar || s.metal > 0) continue;
    const cls = planetClassOf(seenG(p, s));
    if (cls === 'inhospitable' || (cls === 'semi' && RS.planetIncome(G, p, s) < 0 && s.pop >= RS.maxPop(G, p, s) * 0.95)) { evacuate(G, p.id, s.id); ai.noColonize[s.id] = true; }
  }
}
// endgame metal: old ships parked at home are worth more as metal
function scrapObsolete(G, p, ai, ctx) {
  if (!ctx.metalPoor || P(ai).learn < 1) return;
  const cur = D(G, p, ai.d.fighter); if (!cur) return;
  const curP = RS.power(cur);
  for (const f of G.fleets.slice()) {
    if (f.owner !== p.id || f.star == null || f.to != null || G.stars[f.star].owner !== p.id || ai.plans.some(pl => pl.fleets && pl.fleets.includes(f.id))) continue;
    const ds = fleetDesigns(G, f); if (!ds.length || ds.some(d => d.type === 'colony' || d.type === 'bio')) continue;
    if (ds.every(d => RS.power(d) < curP - 5)) scrapFleet(G, f);
  }
}

// ---------- exploring ----------
function scouts(G, p, ai, ctx) {
  const targeted = new Set(G.fleets.filter(f => f.owner === p.id).map(f => f.to != null ? f.to : f.dest).filter(x => x != null));
  for (const f of idle(G, p, f => kindOf(G, f) === 'scout')) {
    let best = null, bs = 1e9;
    for (const s of G.stars) {
      const k = know(G, p, s.id);
      if (s.id === f.star || targeted.has(s.id) || (k.nova >= 10)) continue;
      if (k.explored && G.turn - k.seen < 35 && !(ai.recheck && ai.recheck[s.id] && G.turn - k.seen > 8)) continue;
      if (ai.lostAt[s.id] && G.turn - ai.lostAt[s.id] < 40) continue;
      if (k.owner >= 0 && k.owner !== p.id && !isAllied(G, k.owner, p.id) && G.turn - k.seen < 60) continue; // war fleets can look there
      if ((k.battleOnly || k.battle) && G.turn - k.seen < 60) continue;
      const d = starDist(G, f.star, s.id);
      if (d > f.fuel + 1e-9) continue;
      const [, back] = nearestOwn(G, p, s.id);
      const recheck = ai.recheck && ai.recheck[s.id] && G.turn - ai.recheck[s.id] < 5;
      const score = d + (d + back > f.fuel + 1e-9 ? 5 : 0) + (k.explored && !recheck ? 6 : 0) - (recheck ? 2 : 0) + R(G) * 1.5;
      if (score < bs) { bs = score; best = s.id; }
    }
    if (best != null) { orderMove(G, f, best); targeted.add(best); }
    else { const [h] = nearestOwn(G, p, f.star); if (h >= 0 && h !== f.star) send(G, p, f, h); }
  }
  const n = G.fleets.filter(f => f.owner === p.id && kindOf(G, f) === 'scout').length;
  ai.scoutLoss = (ai.scoutLoss || []).filter(t => G.turn - t < 25);
  if (ai.scoutLoss.length >= 3) return; // they keep getting shot: wait a while
  const unexplored = G.stars.filter(s => !know(G, p, s.id).explored).length;
  const want = unexplored ? clamp(1 + Math.floor(G.turn / 15) + (ai.style === 'expander' ? 1 : 0), 1, 3 + (P(ai).smart > 1 ? 1 : 0)) : 0;
  if (n < want && p.savings > 12000) build(G, p, ctx.home, D(G, p, ai.d.scout), 1, 0);
}

// ---------- colonizing ----------
function potential(G, p, s) {
  const k = know(G, p, s.id);
  const gs = k.g / p.homeG, ts = 72 + (k.t - p.homeT);
  const cls = planetClassOf(gs);
  const income = HOME_POP * gravHab(gs) * PROD_PER_POP - BASE_UPKEEP; // once it's terraformed and grown
  const metal = Math.min(k.metal, 25000);
  return { cls, income, metal, ts, gs };
}
function colonize(G, p, ai, ctx) {
  const iq = P(ai), st = S(ai);
  const colShips = G.fleets.filter(f => f.owner === p.id && fleetHas(G, f, 'colony') && !ai.plans.some(pl => pl.colony === f.id));
  const going = new Set(colShips.map(f => f.to != null ? f.to : f.dest).filter(x => x != null));
  for (const pl of ai.plans) going.add(pl.target);
  const strip = (s) => planetClassOf(seenG(p, s)) === 'inhospitable';
  const unprofitable = ctx.cols.filter(s => !s.everProfit && !strip(s)).length;
  const mines = ctx.cols.filter(strip).length;
  const hungry = p.metal < 8000 || ctx.metalPoor || ai.style === 'prospector';
  const room = Math.max(1, Math.floor((ctx.income + Math.max(0, p.savings) / 20) / 14000 * iq.expand * st.expand));
  const mineRoom = hungry ? 1 + Math.floor(ctx.income / 40000) : 0;
  const cand = [];
  for (const s of G.stars) {
    const k = know(G, p, s.id);
    if (!k.explored || s.owner === p.id || going.has(s.id) || ai.noColonize[s.id] || (k.nova >= 10)) continue;
    if (k.owner >= 0 && k.owner !== p.id) continue; // someone lives there (as far as we know)
    if (ai.lostAt[s.id] && G.turn - ai.lostAt[s.id] < 25) continue;
    // an old map is a dangerous map: if enemies live nearby, look again before sending settlers
    const age = G.turn - k.seen;
    let enemyNear = false; for (const o in ctx.known) if (!isAllied(G, +o, p.id)) for (const sid of ctx.known[o]) if (starDist(G, sid, s.id) < p.tech.range + 1) enemyNear = true;
    if (enemyNear && age > 8) { ai.recheck = ai.recheck || {}; ai.recheck[s.id] = G.turn; continue; }
    const v = potential(G, p, s);
    let val;
    if (v.cls === 'good') val = v.income / 400 + v.metal / 1500 - Math.abs(v.ts - 72) / 60;
    else if (v.cls === 'semi') val = v.income / 500 + v.metal / 1200 - 2;
    else val = hungry && v.metal > 4000 ? v.metal / 1200 - 2 : -99;
    if (val <= 0) continue;
    const [near, d] = nearestOwn(G, p, s.id);
    if (near < 0) continue;
    // enemies next door are a worry
    let threat = 0; for (const o in ctx.known) if (!isAllied(G, +o, p.id)) for (const sid of ctx.known[o]) if (starDist(G, sid, s.id) < 3.5) threat++;
    cand.push({ s, val: val - d * 1.2 - threat * (ai.style === 'turtle' ? 4 : 2), d, near, mine: v.cls === 'inhospitable' });
  }
  cand.sort((a, b) => b.val - a.val);
  // send idle colony ships
  for (const f of idle(G, p, f => kindOf(G, f) === 'colony' && !ai.plans.some(pl => pl.colony === f.id))) {
    const c = cand.find(c => !going.has(c.s.id) && starDist(G, f.star, c.s.id) <= f.fuel + 1e-9);
    if (c) { orderMove(G, f, c.s.id); going.add(c.s.id); }
  }
  // build more, while we can carry the upkeep
  const inFlight = colShips.length;
  ai.savingFor = 0;
  const homesteadOK = unprofitable + inFlight < room, mineOK = mines + inFlight < room + mineRoom;
  if (!homesteadOK && !mineOK) return;
  const cd = D(G, p, ai.d.colony); if (!cd) return;
  const ok = (c) => !going.has(c.s.id) && c.d <= cd.R + 1e-9 && (c.mine ? mineOK : homesteadOK);
  if (cand.some(ok)) ai.savingFor = shipCostNow(G, p, cd).money;
  for (const c of cand) {
    if (!ok(c)) continue;
    if (c.d > cd.R + 1e-9) continue;
    const keep = ctx.cols.length > 2 ? 0 : 10000;
    if (build(G, p, c.near, cd, 1, keep)) {
      const f = G.fleets.find(f => f.owner === p.id && f.star === c.near && f.newThisTurn && fleetHas(G, f, 'colony') && f.dest == null);
      if (f) { orderMove(G, f, c.s.id); going.add(c.s.id); }
    }
    break;
  }
}
function strandedColonists(G, p) {
  // no colonies left: settle wherever the colony ships can reach
  for (const f of G.fleets.filter(f => f.owner === p.id && f.star != null && f.to == null && fleetHas(G, f, 'colony'))) {
    let best = null, bv = -1e9;
    for (const s of G.stars) {
      if (s.owner >= 0 || (s.nova >= 10)) continue;
      const d = starDist(G, f.star, s.id); if (d > f.fuel + 1e-9) continue;
      const v = gravHab(seenG(p, s)) * 10 - d;
      if (v > bv) { bv = v; best = s.id; }
    }
    if (best != null && best !== f.star) orderMove(G, f, best);
  }
}

// ---------- defense: Satellites where trouble is likely ----------
function threatAt(G, p, ai, ctx, s) {
  let t = 0;
  const reach = p.tech.range + 1.5; // assume they can reach about as far as we can
  for (const o in ctx.known) {
    if (isAllied(G, +o, p.id)) continue;
    let near = 1e9; for (const sid of ctx.known[o]) near = Math.min(near, starDist(G, sid, s.id));
    if (near < reach) t += (reach - near) / reach + 0.2;
  }
  if (ai.lostAt[s.id] && G.turn - ai.lostAt[s.id] < 15) t += 1;
  for (const r of G.battles) if (r.star === s.id && r.planetOwner === p.id && r.year >= G.year - 50) t += 0.6;
  return Math.min(3, t);
}
function defend(G, p, ai, ctx) {
  const st = S(ai), iq = P(ai);
  const sd = D(G, p, ai.d.satellite); if (!sd) return;
  const keep = Math.max(ctx.reserve, ai.savingFor || 0);
  // defense gets part of the spare money each turn, not all of it (and leaves metal for the fleet)
  let money = Math.max(0, p.savings - keep) * (ai.style === 'turtle' ? 0.6 : 0.35);
  let metal = p.metal * (ai.style === 'turtle' ? 0.6 : 0.35);
  const turtle = ai.style === 'turtle';
  for (const s of ctx.cols.slice().sort((a, b) => b.pop - a.pop)) {
    const threat = threatAt(G, p, ai, ctx, s) + (turtle && s.id === p.homeStar && G.turn > 15 ? 0.6 : 0) + (G.turn > 50 && s.id === p.homeStar ? 0.3 : 0);
    if (threat <= 0.15) continue;
    const valueF = Math.sqrt(Math.max(10, s.pop) / 100);
    const want = Math.min(20, Math.round(threat * valueF * st.sats * iq.smart * (1 + G.turn / 60)));
    const have = G.fleets.filter(f => f.owner === p.id && f.star === s.id && f.sat).reduce((a, f) => a + fleetDesigns(G, f).reduce((b, d) => b + (RS.power(d) >= RS.power(sd) - 3 ? f.ships[d.id] : f.ships[d.id] * 0.3), 0), 0);
    if (have >= want) continue;
    const c = RS.designCost(G, sd);
    const n = Math.min(want - Math.floor(have), Math.floor(money / Math.max(1, c.money)), Math.floor(metal / Math.max(1, c.metal)), 8);
    if (n <= 0) continue;
    const got = build(G, p, s.id, sd, n, keep);
    money -= got * c.money; metal -= got * c.metal;
  }
}
// ---------- war ----------
function war(G, p, ai, ctx) {
  const iq = P(ai), st = S(ai);
  const aggression = st.war * (G.turn < 25 ? 0.4 : G.turn < 60 ? 0.8 : G.turn < 120 ? 1.15 : 1.4);
  ai.plans = (ai.plans || []).filter(pl => planAlive(G, p, ai, pl));
  // new plans
  if (ai.plans.length < iq.plans && aggression > 0.2 && G.turn > 12) {
    const t = chooseTarget(G, p, ai, ctx);
    if (t) ai.plans.push(t);
  }
  // a war chest: each turn a slice of income is set aside for warships (it's part of savings, just spoken for)
  const wd = warship(G, p, ai, ctx);
  const warShips = G.fleets.filter(f => f.owner === p.id && kindOf(G, f) === 'war').reduce((a, f) => a + fleetCount(f), 0);
  const peace = !ai.plans.length && warShips >= 3 + G.turn / 12;
  if (!peace) ai.chest = (ai.chest || 0) + Math.max(0, p.lastNet || 0) * clamp(aggression, 0.1, 1.4) * 0.55;
  ai.chest = Math.min(ai.chest || 0, Math.max(0, p.savings - (ai.savingFor || 0)));
  if (wd && !peace && ai.chest > 0) {
    const c = shipCostNow(G, p, wd), c2 = RS.designCost(G, wd);
    const n = c.money > ai.chest ? 0 : 1 + Math.floor((ai.chest - c.money) / Math.max(1, c2.money));
    const where = ai.plans.length ? ai.plans[0].stage : ctx.home;
    if (n > 0 && G.stars[where].owner === p.id) {
      const before = p.savings;
      // the chest may dip into debt a little, as the manual allows for shipbuilding
      buildShips(G, p.id, where, wd.id, Math.min(n, 80));
      ai.chest -= before - p.savings;
    }
  }
  for (const pl of ai.plans) runPlan(G, p, ai, ctx, pl, wd);
  // nobody to fight that we know of: send a war fleet to look at the stars we know least about
  const anyKnown = Object.keys(ctx.known).some(o => ctx.enemies.some(q => q.id === +o));
  if (!anyKnown && ctx.enemies.length && G.turn > 30 && G.turn % 3 === 0) {
    const f = idle(G, p, f => kindOf(G, f) === 'war' && port(G, p, f.star)).sort((a, b) => fleetCount(b) - fleetCount(a))[0];
    if (f) {
      let best = null, bs = -1;
      for (const s of G.stars) { const k = know(G, p, s.id); if (s.owner === p.id || (k.nova >= 10)) continue; const d = starDist(G, f.star, s.id); if (d > f.fuel / 2 + 1e-9) continue; const age = G.turn - (k.seen < 0 ? -200 : k.seen); if (age > bs) { bs = age; best = s.id; } }
      if (best != null) orderMove(G, f, best);
    }
  }
}
function warship(G, p, ai, ctx) {
  const opts = [D(G, p, ai.d.fighter)];
  if (ai.d.dread) opts.push(D(G, p, ai.d.dread));
  if (ai.d.bio) opts.push(D(G, p, ai.d.bio));
  // the most fighting for our money and metal. With the square law a budget
  // B buys B / price ships and B^2 * shots * hp / price^2 of strength, so it's
  // shots * hp / price^2 (and something we can actually afford a few of)
  const spare = Math.max(1, p.savings - ctx.reserve);
  let best = null, bv = -1;
  for (const d of opts) {
    if (!d) continue;
    const c = RS.designCost(G, d), price = c.money + c.metal * (ai.metalPrice || 20);
    if (d !== opts[0] && (c.money * 2 > spare || c.metal * 2 > p.metal)) continue;
    const T = TYPES[d.type], v = T.shots * T.hp * Math.pow(2, d.W + d.S - 30) / (price * price);
    if (v > bv) { bv = v; best = d; }
  }
  return best;
}
function chooseTarget(G, p, ai, ctx) {
  const iq = P(ai);
  let best = null, bv = -1e9;
  for (const o in ctx.known) {
    const q = G.players[o];
    if (!q || !q.alive || isAllied(G, +o, p.id) || q.surrendered) continue;
    for (const sid of ctx.known[o]) {
      if (ai.plans.some(pl => pl.target === sid)) continue;
      const k = know(G, p, sid);
      const [stage, d] = nearestOwn(G, p, sid);
      if (stage < 0) continue;
      const wd = D(G, p, ai.d.fighter);
      const reach = wd ? wd.R : p.tech.range;
      if (d > reach + 1e-9 && !(iq.tankers && d <= reach * 1.8)) continue;
      const def = expectedDefense(G, p, sid, +o);
      const value = (k.pop || 0) / 40 + Math.min(k.metal || 0, 20000) / 2500 + (ai.lostCol[sid] ? 6 : 0) + (sid === q.homeStar ? 4 : 0);
      const v = value - Math.sqrt(def.str) / 3 - d * 0.8 + (ai.mood[o] < 0 ? 2 : 0) + (q.human && ai.style === 'warmonger' ? 1 : 0);
      if (v > bv) { bv = v; best = { target: sid, owner: +o, stage, since: G.turn, need: def.str, dist: d, fleets: [] }; }
    }
  }
  return best;
}
function planAlive(G, p, ai, pl) {
  const s = G.stars[pl.target], k = know(G, p, pl.target);
  if (G.turn - pl.since > 30) return false;
  if (s.nova >= 10) return false;
  if (pl.launched && G.turn - pl.launched > 8) return false;
  if (k.owner === p.id || s.owner === p.id) return false;
  const o = G.players[pl.owner];
  if (!o || !o.alive || isAllied(G, o.id, p.id)) return false;
  if (G.stars[pl.stage].owner !== p.id) { const [st] = nearestOwn(G, p, pl.target); if (st < 0) return false; pl.stage = st; }
  return true;
}
function runPlan(G, p, ai, ctx, pl, wd) {
  const iq = P(ai);
  if (pl.launched) return;
  const stage = pl.stage;
  // gather warships at the stage
  for (const f of idle(G, p, f => kindOf(G, f) === 'war' && !ai.plans.some(o => o !== pl && o.gather && o.gather.includes(f.id)))) {
    if (f.star !== stage) { if (f.fuel + 1e-9 >= starDist(G, f.star, stage) || port(G, p, f.star)) send(G, p, f, stage); }
  }
  const here = idle(G, p, f => f.star === stage && kindOf(G, f) === 'war');
  if (!here.length) return;
  const def = expectedDefense(G, p, pl.target, pl.owner);
  const mine = strength(G, fleetUnits(G, here), def.t.W, def.t.S);
  const ratio = iq.ratio * (1 + (ai.caution || 0));
  if (mine < def.str * ratio && G.turn - pl.since < 18) return;
  if (mine < def.str * 0.8) return; // not even close: wait (or let the plan lapse)
  // go: one fleet, offensive if we're well ahead in shields
  const f = here[0];
  for (const g of here.slice(1)) if (G.fleets.includes(g)) mergeFleets(G, f, g);
  f.stance = p.tech.shields >= def.t.W + 1 ? 'offensive' : 'normal';
  const d = starDist(G, stage, pl.target);
  if (d > f.fuel + 1e-9) {
    // too far: smart players bring tankers along to a waystation
    if (!iq.tankers) { pl.since -= 50; return; }
    return tankerRun(G, p, ai, ctx, pl, f);
  }
  orderMove(G, f, pl.target);
  pl.launched = G.turn; pl.fleets = [f.id];
  // a Colony Ship arriving late, to hold what we take and give the fleet somewhere to refuel
  const cd = D(G, p, ai.d.colony);
  if (cd && cd.R >= d && (iq.smart >= 1 || d > f.fuel / 2)) {
    const cf = G.fleets.find(c => c.owner === p.id && c.star === stage && fleetHas(G, c, 'colony') && c.dest == null && c.to == null);
    const ok = cf || (build(G, p, stage, cd, 1, 0) && G.fleets.find(c => c.owner === p.id && c.star === stage && fleetHas(G, c, 'colony') && c.newThisTurn && c.dest == null));
    if (ok) { ok.delayed = true; orderMove(G, ok, pl.target); pl.colony = ok.id; }
  }
  if (G.players[pl.owner].human) taunt(G, p, ai, pl.owner, 'attack');
}
function tankerRun(G, p, ai, ctx, pl, f) {
  // a star in between, within reach of both
  const range = fleetMaxRange(G, f);
  let via = null, bd = 1e9;
  for (const s of G.stars) {
    if (s.id === pl.target || s.nova >= 10) continue;
    const a = starDist(G, pl.stage, s.id), b = starDist(G, s.id, pl.target);
    if (a <= range && b <= range && a + b < bd) { bd = a + b; via = s.id; }
  }
  if (via == null) { pl.since -= 50; return; }
  const td = D(G, p, ai.d.tanker); if (!td) return;
  const need = Math.ceil(fleetCount(f) / (RS.TANK_RATE * 1.5));
  build(G, p, pl.stage, td, Math.min(need, 8), 0);
  const tf = G.fleets.find(t => t.owner === p.id && t.star === pl.stage && fleetHas(G, t, 'tanker') && t.dest == null && t.to == null);
  if (tf && tf !== f) mergeFleets(G, f, tf);
  if (!fleetHas(G, f, 'tanker')) return;
  orderPath(G, f, [via, pl.target]); // departures wait at the waystation until the tankers have pumped enough
  pl.launched = G.turn; pl.fleets = [f.id]; pl.via = via;
}
// fleets with nothing to do go somewhere useful
function tidy(G, p, ai, ctx) {
  const planned = new Set(); for (const pl of ai.plans) { for (const id of pl.fleets || []) planned.add(id); }
  for (const f of idle(G, p, f => kindOf(G, f) === 'war' && !planned.has(f.id))) {
    if (ai.plans.length && !ai.plans[0].launched) continue; // gathering
    if (!port(G, p, f.star)) { const [h] = nearestOwn(G, p, f.star); if (h >= 0) send(G, p, f, h); continue; }
    // to the most threatened colony, if it isn't here
    let best = f.star, bt = threatAt(G, p, ai, ctx, G.stars[f.star]);
    for (const s of ctx.cols) { const t = threatAt(G, p, ai, ctx, s); if (t > bt + 0.5 && starDist(G, f.star, s.id) <= f.fuel) { bt = t; best = s.id; } }
    if (best !== f.star) send(G, p, f, best);
  }
  // tankers left over go home to fill up
  for (const f of idle(G, p, f => kindOf(G, f) === 'tanker')) if (!port(G, p, f.star)) { const [h] = nearestOwn(G, p, f.star); if (h >= 0) send(G, p, f, h); }
  // merge war fleets sitting at the same star
  const byStar = {};
  for (const f of idle(G, p, f => kindOf(G, f) === 'war' && !planned.has(f.id))) (byStar[f.star] = byStar[f.star] || []).push(f);
  for (const k in byStar) { const fs = byStar[k]; for (const g of fs.slice(1)) if (G.fleets.includes(g) && G.fleets.includes(fs[0])) mergeFleets(G, fs[0], g); }
}

// ---------- diplomacy ----------
function opinion(G, p, ai, ctx, q) {
  if ((p.grudges || {})[q.id]) return -9;
  let v = (ai.mood[q.id] || 0) + ai.temper;
  // neighbors are rivals
  let border = 0;
  for (const sid of ctx.known[q.id] || []) { const [, d] = nearestOwn(G, p, sid); if (d < 4) border++; }
  v -= Math.min(3, border * 0.7);
  // a strong stranger is worth keeping sweet; a weak neighbor is lunch
  const mine = p.lastGross || 1, theirs = q.lastGross || 1;
  if (theirs > mine * 1.6) v += ai.style === 'turtle' ? 1.5 : 0.6;
  if (theirs < mine * 0.5 && border) v -= 1;
  v += { turtle: 1, balanced: 0.4, techie: 0.3, expander: 0, prospector: 0.2, gambler: 0, warmonger: -1.5 }[ai.style] || 0;
  // a common enemy
  for (const r of ctx.enemies) if (r.id !== q.id && !isAllied(G, r.id, q.id) && (r.lastGross || 0) > mine * 1.3) v += 0.5;
  return v;
}
function diplomacy(G, p, ai, ctx) {
  if (!E.feature(G, 'alliances') || !G.opts.alliances) return;
  for (const n of p.news || []) if (n.type === 'broken' && G.players[n.with] && G.players[n.with].human) taunt(G, p, ai, n.with, 'broken');
  // "Computer Best Buddies": every computer stands together against the humans
  if (G.opts.buddies) {
    for (const q of G.players) if (q.id !== p.id && !q.human) { setPact(G, p.id, q.id, 'ally', true); setPact(G, p.id, q.id, 'buddy', true); }
    return;
  }
  for (const q of G.players) {
    if (q.id === p.id || !q.alive || q.surrendered) continue;
    const v = opinion(G, p, ai, ctx, q);
    const allied = (p.allies || []).includes(q.id), buddy = (p.buddies || []).includes(q.id);
    const theyWant = (q.allies || []).includes(p.id);
    const met = (ctx.known[q.id] || []).length || ai.seen[q.id];
    if (!met && !theyWant) continue;
    if (!allied && G.turn > 10 && (v > 1.5 || (theyWant && v > 0.4))) { setPact(G, p.id, q.id, 'ally', true); ai.allySince[q.id] = G.turn; if (q.human) taunt(G, p, ai, q.id, 'ally'); }
    else if (allied && v < -0.8) { setPact(G, p.id, q.id, buddy ? 'buddy' : 'ally', false); if (q.human) taunt(G, p, ai, q.id, 'break'); }
    else if (allied && !buddy && v > 2.4 && G.turn - (ai.allySince[q.id] || G.turn) > 12) setPact(G, p.id, q.id, 'buddy', true);
    // don't stay allied with everyone: a galaxy of friends ends the game, and somebody has to win it
    const alive = G.players.filter(r => r.alive && !r.surrendered);
    if (alive.length > 2 && alive.every(a => alive.every(b => a === b || isAllied(G, a.id, b.id))) && !q.human && R(G) < 0.1) setPact(G, p.id, q.id, 'ally', false);
  }
}
// talking: "made the computers send semi-intelligent messages to everyone"
const SAY = {
  attack: ['Here we come, ready or not.', 'Nothing personal. Well, a little personal.', 'Saddle up, partner. We’re coming over.', 'You might want to check on your colonies.'],
  ally: ['Pleasure doing business with you.', 'Shake on it? Allies it is.', 'Friends, then. Don’t make us regret it.'],
  break: ['It’s been fun. It’s about to stop being fun.', 'Our lawyers say the alliance is over. So do our gunners.'],
  broken: ['We won’t forget this.', 'You’ll regret that. Permanently.', 'Hatred and distrust, permanently. It says so in the manual.'],
  lost: ['#!$@*$&@•™!', 'Lucky shot.', 'That was our second-best fleet. Honest.'],
};
function say(G, p, ai, to, text) {
  if (!E.feature(G, 'chat') || !G.players[to] || !G.players[to].human) return;
  if (ai.said[to] != null && G.turn - ai.said[to] < 3) return;
  ai.said[to] = G.turn;
  sendChat(G, p.id, to, text);
}
function taunt(G, p, ai, to, kind) { if (SAY[kind]) say(G, p, ai, to, pick(G, SAY[kind])); }
function chat(G, p, ai, ctx) {
  // first meetings
  for (const q of humans(G)) {
    if (!q.alive || ai.met[q.id]) continue;
    if ((ctx.known[q.id] || []).length || ai.seen[q.id]) { ai.met[q.id] = true; if (R(G) < 0.7) say(G, p, ai, q.id, pick(G, S(ai).hello)); }
  }
  // answers
  const news = p.news || []; p.news = [];
  for (const n of news) {
    if (n.type !== 'chat' || !G.players[n.from] || !G.players[n.from].human) continue;
    const q = G.players[n.from], t = String(n.text || '').toLowerCase();
    const v = opinion(G, p, ai, ctx, q), allied = isAllied(G, p.id, q.id);
    ai.said[q.id] = null; // a question deserves an answer
    let reply;
    if (/#|@|\$|\*|•|™/.test(t) && /!/.test(t)) reply = pick(G, ['Language! There are children in this galaxy.', 'Same to you, partner.', 'We’ll pretend we didn’t hear that.']);
    else if (/all(y|ies)|friend|truce|peace/.test(t)) {
      if (v > -0.5 && !(p.grudges || {})[q.id]) { setPact(G, p.id, q.id, 'ally', true); ai.allySince[q.id] = G.turn; reply = 'Deal. Tick the box and we’re allies.'; }
      else reply = (p.grudges || {})[q.id] ? 'Fool us once.' : 'Not a chance, stranger.';
    } else if (/hate/.test(t)) { ai.mood[q.id] = (ai.mood[q.id] || 0) - 0.5; reply = 'The feeling is mutual.'; }
    else if (/like you|love/.test(t)) { ai.mood[q.id] = (ai.mood[q.id] || 0) + 0.3; reply = pick(G, ['Aw, shucks.', 'We like you too. For now.']); }
    else if (/thank/.test(t)) reply = 'Don’t mention it.';
    else if (/sorry/.test(t)) { ai.mood[q.id] = (ai.mood[q.id] || 0) + 0.2; reply = 'Apology accepted. Mostly.'; }
    else if (/need money|money/.test(t)) {
      const amt = allied && p.savings > ctx.reserve * 2 ? Math.floor(Math.min(p.savings - ctx.reserve * 2, (p.lastGross || 0) * 0.5) / 1000) * 1000 : 0;
      if (amt > 0 && give(G, p.id, q.id, amt, 0) === 'ok') reply = 'Here’s a little something. Don’t spend it all on Radical.';
      else reply = allied ? 'We’re a little short ourselves.' : 'Ask your friends.';
    } else if (/need metal|metal/.test(t)) {
      const amt = allied && p.metal > 6000 ? Math.floor(Math.min(p.metal * 0.2, 5000) / 100) * 100 : 0;
      if (amt > 0 && give(G, p.id, q.id, 0, amt) === 'ok') reply = 'Some metal’s on its way. Your wise assistants will put it where you need it.';
      else reply = allied ? 'Metal’s scarce. You know that.' : 'Mine your own.';
    } else if (/lol|hehe|haha/.test(t)) reply = 'Heh.';
    else if (/\bho\b/.test(t)) reply = 'Ho!';
    else reply = pick(G, ['Interesting. We’ll think about it.', 'Uh huh.', 'Is that so.', 'We’ll have our people call your people.']);
    say(G, p, ai, q.id, reply);
  }
}
// near the end, the weak may give up ("You can ... surrender to them")
function maybeSurrender(G, p, ai, ctx) {
  if (!E.feature(G, 'surrender') || ctx.cols.length > 1 || G.turn < 40) return;
  const ships = G.fleets.filter(f => f.owner === p.id && !f.sat).length;
  if (ships > 1 || p.lastGross > 25000) return;
  const strong = G.players.filter(q => q.alive && q.id !== p.id && (q.lastGross || 0) > 8 * Math.max(1, p.lastGross)).sort((a, b) => b.lastGross - a.lastGross)[0];
  if (!strong) return;
  const chance = { turtle: 0.08, balanced: 0.04, gambler: 0.02 }[ai.style] || 0.01;
  if (R(G) < chance * (ai.iq === 'dumb' ? 2 : 1)) { surrender(G, p.id, strong.id); if (strong.human) say(G, p, ai, strong.id, 'All right, all right. You win. Be gentle with our people.'); }
}

E.registerAI('claude', { make, turn, noteBattle(G, p, rec, won) { noteBattle(G, p, rec, won); if (!won && p.ai && !p.human) for (const o of rec.sides) if (o !== p.id && G.players[o].human && R(G) < 0.25) taunt(G, p, p.ai, o, 'lost'); } });
})(this);
