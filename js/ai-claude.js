// Spaceward Ho! web remake — computer players for the "Claude" ruleset.
// Moved here unchanged from the old engine.js.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, clamp, colonies, know, getDesign, findOrCreateDesign, shipCostNow, buildShips, evacuate, orderMove,
  mergeFleets, fleetCount, fleetHas, fleetKind, starDist, dist, techSum, seenG, seenT } = E;
const RS = E.RULESETS.claude;
const { DREAD_TECH, PROD_PER_POP, BASE_UPKEEP, gravHab, tempFactor } = RS;
const TYPES = RS.ships;
const designLimits = (p, type) => RS.designLimits(null, p, type);
const planetClass = (gs) => RS.planetClass(null, gs);

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


E.registerAI('claude', { make: makeAI, turn: aiTurn, noteBattle: aiNoteBattle });
})(this);
