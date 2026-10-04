// Spaceward Ho! web remake — computer players for the "Original" ruleset.
//
// Recovered from the original's CComputerIntelligence (FUN_10081cc0 and the
// 21 steps it calls); docs/original-findings.md describes them in plain
// English. A computer's personality uses the same settings as the hidden
// "Computer Attrs" debug window in the original.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { R, RI, pick, clamp, msg, colonies, know, getDesign, findOrCreateDesign, shipCostNow, buildShips, evacuate, orderMove,
  mergeFleets, scrapFleet, fleetCount, fleetHas, fleetKind, fleetDesigns, starDist, borrowLimit, isAllied } = E;
const RS = E.RULESETS.original;
const trunc = Math.trunc;

function obsolete(p, d) {
  if (d.type === 'bio') return 0;
  const t = RS.aiSpec(p, d.type);
  let sc = d.type === 'satellite' ? 0 : (t.R - d.R) * 5;
  sc += (t.V - d.V) * 15;
  if (d.type !== 'colony') sc += (t.W - d.W) * 15;
  sc += (t.S - d.S) * 10;
  if (d.type !== 'colony') sc += (t.M - d.M) * 10;
  return sc;
}

// Original computer players (CComputerIntelligence, FUN_10081cc0)
// =====================================================================
// personality (FUN_100704d0) — the same fields as the hidden Debug >
// Computer Attrs dialog in the original. Player record offsets in brackets;
// the random draws are made in 5.0.5's order.
const sliderDensity = (v) => typeof v === 'number' ? v : ({ dense: 0, normal: 25, sparse: 60 }[v] ?? 25);
function makeAI(G, p, iqName, autoplay) {
  const iq = { dumb: 1, average: 2, smart: 3, diabolical: 4 }[iqName] || 2;
  const ai = { iq, noColonize: {}, lostAt: {}, sent: 0 };
  ai.upfront = RI(G, 35, 45);       // [+0xa4] % of income to research first
  ai.reqInc = RI(G, 33000, 37000);  // [+0xa8] income needed per extra colony
  ai.colDef = RI(G, 30, 70);        // [+0xac] % of colonies defended
  ai.metalDef = RI(G, 60, 80);      // [+0xae] % of metal for defence
  ai.defDom = RI(G, 150, 250);      // [+0xbe] defence strength wanted vs. threat
  const tw = { range: RI(G, 160, 200), speed: RI(G, 160, 200), weapons: RI(G, 200, 260) }; // [+0xb0..]
  tw.shields = Math.min(RI(G, 200, 260), tw.weapons);
  tw.mini = 980 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 20;
  ai.attDom = RI(G, 150, 250);      // [+0xbc] attack strength wanted vs. enemy
  ai.aggr = RI(G, 3, 7);            // [+0xc0]
  ai.style = 1;                     // [+0xc2] 2: the turtle, 3: the pouncer
  ai.metalF = RI(G, 25, 75);        // [+0xc4] importance of metal when choosing colonies
  ai.saveGoal = RI(G, 2, 4);        // [+0xc6] savings goal (x income)
  ai.minFleet = RI(G, 3, 6);        // [+0xca] minimum attack fleet
  // [+0xcc] starting attitude toward each of the 16 player slots (all 16 are
  // drawn: players created after this one get theirs too)
  ai.att = {};
  for (let i = 0; i < 16; i++) ai.att[i] = RI(G, 250, 350);
  // per-type "too obsolete" thresholds [+0xec] / [+0xf8]
  ai.retire = { scout: 60, dread: 120, fighter: 60, tanker: 120, colony: 120, satellite: 100 };
  ai.redesign = { scout: 30, dread: 60, fighter: 30, tanker: 60, colony: 60, satellite: 20 };
  // the humans come first (FUN_1006f640), so a computer's number among the computers is id − humans
  const nHum = G.players.filter(q => q.human).length;
  // a ruleset may set the personalities itself (DOS 2.0: FUN_1030_1b51)
  const custom = E.rules(G).aiPersonality;
  if (custom) custom(G, p, ai, tw, iq, autoplay);
  else if (autoplay) {
    Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 150, radical: 50 });
    Object.assign(ai, { colDef: 50, metalDef: 50 });
  } else if (iq === 1) {
    ai.upfront = 15; ai.colDef = RI(G, 10, 20); ai.attDom = RI(G, 75, 95); ai.defDom = RI(G, 75, 95); ai.aggr = 1; ai.minFleet = 1;
  } else if (iq === 2) {
    ai.upfront = 30; ai.colDef = RI(G, 30, 40); ai.attDom = RI(G, 125, 175); ai.defDom = RI(G, 125, 185); ai.aggr = 4; ai.minFleet = 1;
  } else if (iq === 3) {
    ai.upfront = RI(G, 45, 50); ai.attDom = RI(G, 150, 200);
  } else {
    ai.upfront = RI(G, 40, 60); ai.aggr = 10; ai.minFleet = RI(G, 10, 15); ai.hatesHumans = true;
    // Diabolical computers dislike the humans and like the other computers
    for (let i = 0; i < 16; i++) ai.att[i] = i < nHum ? RI(G, -50, 0) : RI(G, 350, 450);
  }
  // two special personalities for Smart and Diabolical computers, by the
  // computer's number among the computers (FUN_10057de0) mod 4: the 4th, 8th,
  // ... is the turtle (style 2) and the 3rd, 7th, ... the pouncer (style 3).
  // In a galaxy of density over 50 (game +0x58) they research more Range.
  const k = (p.id - nHum) % 4;
  const special = () => {
    Object.assign(tw, { range: 20, speed: 380, weapons: 380, shields: 20, mini: 180, radical: 20 });
    if (sliderDensity(G.opts.density) > 50) { tw.range += 80; tw.speed -= 40; tw.weapons -= 40; }
  };
  if (!custom && !autoplay && iq > 2 && k === 3) {
    Object.assign(ai, { upfront: iq === 4 ? 60 : 50, reqInc: 35000, colDef: 100, metalDef: 90, defDom: 300, attDom: 1000, aggr: 1, style: 2, metalF: 75, saveGoal: RI(G, 4, 6) });
    special();
  }
  if (!custom && !autoplay && iq > 2 && k === 2) {
    Object.assign(ai, { upfront: 45, reqInc: 35000, colDef: 25, metalDef: 10, defDom: 150, attDom: 200, aggr: 10, style: 3, metalF: 60, saveGoal: 3, minFleet: RI(G, 25, 30) });
    special();
  }
  ai.tw = tw;
  p.talloc = Object.assign({}, tw);
  return ai;
}
// FUN_1008753x: tech milestones shift research toward weapons and shields
function aiTechEvent(G, p, k) {
  const tw = p.ai.tw;
  if (k === 'range' && p.tech.range === 16) { tw.weapons += trunc(tw.range / 4); tw.shields += trunc(tw.range / 4); tw.range = trunc(tw.range / 2); }
  if (k === 'mini' && p.tech.mini > 1) {
    const L = p.tech.mini, x = trunc(tw.mini / ((L + 1) * 2));
    tw.weapons += x; tw.shields += x; tw.mini = trunc(L * tw.mini / (L + 1));
  }
}
function aiDesign(G, p, type) {
  const ai = p.ai;
  const ds = p.designs.filter(d => !d.scrapped && d.type === type);
  let best = null, bs = 1e9;
  for (const d of ds) { const sc = obsolete(p, d); if (sc < bs) { bs = sc; best = d; } }
  if (!best || bs >= ai.redesign[type]) best = findOrCreateDesign(G, p, (E.rules(G).aiSpec || RS.aiSpec)(p, type));
  return best;
}
function aiTurn(G, p) {
  const ai = p.ai || (p.ai = makeAI(G, p, 'average', p.human));
  const rs = E.rules(G);
  if (rs.aiTurnStart) rs.aiTurnStart(G, p); // e.g. the DOS 2.0 Smart computers' free look around home
  const cols = colonies(G, p.id);
  if (!cols.length) { strandedColonyShips(G, p); return; }
  ai.sent = 0; // the three-message outbox is emptied each turn (FUN_10072a10, player +0x1058)
  reloadColonyShips(G, p);
  // step 2: designs
  const D = {};
  // only the ship types this ruleset has (the DOS 2.0 rules have four)
  for (const t of ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite']) D[t] = E.rules(G).canBuild(G, p, t) ? aiDesign(G, p, t) : null;
  if (p.hasBio) D.bio = p.designs.find(d => d.type === 'bio' && !d.scrapped) || null;
  const C = {}; for (const t in D) if (D[t]) C[t] = rs.designCost(G, D[t]);
  // assembly lines are limited: scrap unused, superseded types (FUN_10086830)
  const live = p.designs.filter(d => !d.scrapped);
  if (live.length + 6 > 24) {
    const inUse = new Set();
    for (const f of G.fleets) if (f.owner === p.id) for (const k in f.ships) inUse.add(+k);
    for (const d of live) if (!inUse.has(d.id) && D[d.type] !== d) d.scrapped = true;
  }
  // step 3: assessment
  if (!p.human && ai.style !== 2) ai.metalDef = clamp(ai.metalDef - 5, 1, ai.style === 3 ? 50 : 80);
  const I = p.oInc + (p.oInterest || 0);
  const cap = Math.max(0, trunc((I + ai.reqInc - 30000) / ai.reqInc));
  const cap2 = Math.max(cap, trunc((I + trunc(ai.reqInc / 4) + ai.reqInc - 30000) / ai.reqInc));
  const reserve = Math.max(0, Math.min(trunc(I * (G.year - 2000) / 100), I * ai.saveGoal));
  const A = { D: (rs.disposable || RS.disposable)(G, p).D, I, reserve };
  let totalMetal = p.metal; for (const s of cols) totalMetal += s.metal;
  let homeFleet = 0, awayFleet = 0, satMetal = 0, warMetal = 0, colShips = 0;
  const myFleets = G.fleets.filter(f => f.owner === p.id);
  for (const f of myFleets) {
    let m = 0; for (const k in f.ships) { const d = getDesign(G, p.id, +k); m += rs.designCost(G, d).metal * f.ships[k]; }
    const kind = fleetKind(G, f);
    if (kind === 'colony' || fleetHas(G, f, 'colony')) colShips += fleetCount(f) && 1;
    if (f.star != null && G.stars[f.star].owner === p.id) homeFleet += m; else if (kind !== 'scout') awayFleet += m;
    if (kind === 'satellite') satMetal += m;
    if (kind === 'fighter' || kind === 'dread') warMetal += m;
  }
  const broke = colShips === 0 && C.colony.metal > totalMetal + homeFleet;
  let spare = totalMetal + homeFleet + awayFleet - (colShips ? colShips * C.colony.metal : 5000);
  spare = Math.max(0, spare);
  A.defB = trunc(spare * ai.metalDef / 100) - satMetal;
  A.offB = trunc(spare * (100 - ai.metalDef) / 100) - warMetal;
  A.metal = totalMetal; A.colShips = colShips; A.broke = broke;
  considerSurrender(G, p, A);
  askAllies(G, p, totalMetal);
  // step 4: what the computer believes about each star. Before 2020 a
  // Diabolical computer looks at every star within 8 ly of home: its record
  // gets this year's planet and metal, owner none (FUN_10088460). The remake
  // leaves its own colonies' records alone (they are classed from the truth).
  if (ai.iq === 4 && !p.human && G.year < 2020) {
    for (const s of G.stars) {
      if (s.id === p.homeStar || s.owner === p.id || starDist(G, s.id, p.homeStar) >= 9) continue;
      const k = know(G, p, s.id);
      Object.assign(k, { explored: true, owner: -1, metal: s.metal, g: s.g, t: s.t, seen: G.turn });
    }
  }
  const cls = [], threat = [], tthreat = [];
  const fAtt = Math.max(1, C.fighter.att);
  for (const s of G.stars) {
    const k = know(G, p, s.id);
    let c;
    if (s.owner === p.id) {
      if ((s.oInc || 0) >= 0) c = 10;
      else { const h = RS.hab(p, s); c = h.gR <= 256 && (h.gR < 201 || h.dT < 501) ? 9 : 8; }
    } else if (!k.explored) c = 0;
    else c = k.owner >= 0 && k.owner !== p.id && G.players[k.owner] && G.players[k.owner].alive ? 4 : 2;
    cls[s.id] = c; threat[s.id] = 0; tthreat[s.id] = 0;
  }
  for (const f of myFleets) if (f.star != null && cls[f.star] < 6) cls[f.star] = 6;
  const reach = Math.max(10, p.tech.range + 1);
  for (const s of G.stars) {
    if (cls[s.id] >= 8) {
      let t = know(G, p, s.id).enemyStr || 0;
      for (const o of G.stars) {
        if (o.id === s.id || starDist(G, s.id, o.id) > reach) continue;
        const c = cls[o.id];
        t = Math.max(t, c <= 2 ? (c === 0 ? fAtt : 0) : (know(G, p, o.id).enemyStr || 0));
      }
      threat[s.id] = t;
    } else if (cls[s.id] === 4 || cls[s.id] === 3) tthreat[s.id] = Math.max(1, know(G, p, s.id).enemyStr || 0);
  }
  // step 6: dismantle badly outdated fleets sitting at safe colonies;
  // step 7: outdated fleets elsewhere head for the nearest colony
  for (const f of myFleets.slice()) {
    if (!G.fleets.includes(f) || f.star == null || f.to != null || f.dest != null || f.sat) continue;
    const old = fleetDesigns(G, f).filter(d => d.type !== 'bio' && d.type !== 'colony');
    if (cls[f.star] >= 8) {
      if (threat[f.star] <= 0 && old.some(d => obsolete(p, d) >= 100)) scrapFleet(G, f);
    } else if (old.some(d => obsolete(p, d) >= ai.retire[d.type])) {
      const back = nearestOwn(G, p, f.star, f.fuel, cls);
      if (back >= 0) orderMove(G, f, back);
    }
  }
  for (const f of G.fleets) if (f.owner === p.id && f.sat && f.star != null && cls[f.star] >= 8 && threat[f.star] <= 0 &&
    fleetDesigns(G, f).some(d => obsolete(p, d) >= 100)) { scrapFleet(G, f); break; }
  // step 9: last turn's news and diplomacy (FUN_10087530), after the fleet steps as in FUN_10081cc0
  if (!p.human && G.opts.alliances) diplomacy(G, p);
  // queue of requests, highest priority first (FUN_10088240 / FUN_10083e30)
  const Q = [];
  const req = (type, prio, a, b) => Q.push({ type, prio, a, b, n: Q.length });
  req('tech', 90, ai.upfront);
  // step 11: shed colonies beyond what income supports; mining requests
  const small = cols.filter(s => RS.popU(s) < 10000);
  let excess = small.length - cap2;
  while (excess > 0 && cols.length > 1) {
    let worst = null, wv = 99;
    for (const s of cols) {
      if (s.id === p.homeStar || s.owner !== p.id) continue;
      let v = aiHab(p, s); if (RS.popU(s) > 20 && v > 1) v += 10;
      if (v < wv) { wv = v; worst = s; }
    }
    if (!worst || G.fleets.some(f => f.owner === p.id && f.star === worst.id && f.dest != null)) break;
    evacuate(G, p.id, worst.id); ai.noColonize[worst.id] = true; cls[worst.id] = 6; excess--;
  }
  for (const s of colonies(G, p.id)) {
    if (cls[s.id] === 8 && s.metal < 100 && s.id !== p.homeStar && colonies(G, p.id).length > 1) { evacuate(G, p.id, s.id); ai.noColonize[s.id] = true; continue; }
    if (s.metal <= 0) continue;
    if (rs.aiMineMoney) req('mine', cls[s.id] === 8 ? 75 : 30, s.id, rs.aiMineMoney(G, p, s, cls[s.id], ai.iq));
    else if (cls[s.id] === 8) req('mine', 75, s.id, RS.mineMoney(p, ai.iq === 1 ? s.metal + 25 : Math.min(s.metal + 25, 1000)));
    else req('mine', 30, s.id, RS.mineMoney(p, Math.min(s.metal + 25, ai.iq <= 2 ? 5000 : 600)));
  }
  // step 12: scouting
  const sR = D.scout.R, fR = D.fighter.R;
  if (!broke) {
    let first = false;
    for (const s of G.stars) {
      if (!(cls[s.id] === 0 || cls[s.id] === 2) || tthreat[s.id] > 0) continue;
      if (myFleets.some(f => f.dest === s.id || f.to === s.id)) continue;
      let src = nearestOwn(G, p, s.id, sR, cls);
      if (src >= 0) { if (cls[s.id] === 2 && !first) { first = true; req('scout', 86, s.id, src); } else req('scout', 55, s.id, src); }
      else if ((src = nearestOwn(G, p, s.id, fR, cls)) >= 0) req('scout', 54, s.id, src);
    }
  }
  // step 13: offense
  if (!broke && A.offB > 0) {
    const used = new Set(), staged = new Set();
    let budget = A.offB, guard = 0;
    while (budget > 0 && guard++ < G.stars.length) {
      let best = -1, bv = 0;
      for (const s of G.stars) {
        if (cls[s.id] >= 5 || tthreat[s.id] <= 0 || used.has(s.id)) continue;
        if (ai.style === 2 && tthreat[s.id] >= fAtt) continue;
        const v = aiTargetScore(G, p, s, tthreat[s.id], fAtt);
        if (v > bv) { bv = v; best = s.id; }
      }
      if (best < 0) break;
      used.add(best);
      const src = nearestOwn(G, p, best, fR, cls);
      if (src >= 0 && !staged.has(src + ':' + best)) { staged.add(src + ':' + best); req('attack', ai.aggr * 5 + 35, best, src); budget -= C.fighter.metal * ai.minFleet; }
    }
  }
  // step 14: colonization
  if (!broke) {
    let want = cap;
    for (const s of colonies(G, p.id)) {
      if ((cls[s.id] === 9 || cls[s.id] === 10) && RS.popU(s) < 10000) want--;
      if (cls[s.id] === 8 && s.metal > 100) want--;
    }
    want -= rs.aiColonyShipsBusy ? rs.aiColonyShipsBusy(G, p) : colShips; // DOS 2.0: ships come from a queue, so idle ones still need sending
    want = clamp(want, 0, 5);
    const cand = (needFleet, metalF) => {
      let best = -1, bv = 1, src = -1;
      for (const s of G.stars) {
        const k = know(G, p, s.id);
        if (!k.explored || s.owner === p.id || k.owner >= 0 || ai.noColonize[s.id] || tthreat[s.id] > 0) continue;
        if (needFleet && cls[s.id] !== 6) continue;
        if (myFleets.some(f => fleetHas(G, f, 'colony') && (f.dest === s.id || f.to === s.id))) continue;
        const from = nearestOwn(G, p, s.id, C.colony ? D.colony.R : fR, cls);
        if (from < 0) continue;
        const v = aiPlanetValue(p, s, k, metalF);
        if (v > bv) { bv = v; best = s.id; src = from; }
      }
      return { best, bv, src };
    };
    if (want > 0) {
      let r = cand(true, ai.metalF);
      if (r.best < 0) r = cand(false, ai.metalF);
      if (r.best < 0 && totalMetal < C.colony.metal) r = cand(false, 100);
      if (r.best >= 0) req('colony', r.bv + (colShips < 1 ? 77 : 38), r.best, r.src);
    }
  }
  // step 15: terraforming
  for (const s of colonies(G, p.id)) {
    const h = RS.hab(p, s);
    if (h.dT <= 0 || cls[s.id] <= 8) continue;
    const amt = rs.aiTerraMoney ? rs.aiTerraMoney(G, p, s, cls[s.id], ai.iq) : ai.iq === 1 ? RS.terraCost(p, h.dT) : h.dT < 1000 ? 3000 : (p.lastNet < 150000 ? 10000 : 15000);
    req('terra', cls[s.id] === 10 ? 70 : 80, s.id, amt);
  }
  // step 16: defense
  const satAtt = Math.max(1, C.satellite.att);
  const defended = colonies(G, p.id).filter(s => cls[s.id] > 8).reverse();
  const maxDef = Math.ceil(defended.length * ai.colDef / 100);
  const base = trunc(fAtt * ai.defDom / 100);
  let nDef = 0;
  for (const s of defended) {
    if (nDef >= maxDef) break;
    const need = trunc(threat[s.id] / 100) * ai.defDom;
    let have = satStrength(G, p, s.id) + RS.planetStrength(p, s);
    if (have < base && need > 0) {
      const n = trunc(base / satAtt) + 1;
      if (n * C.satellite.metal < A.defB) { A.defB -= n * C.satellite.metal; have += base; req('defend', 60, s.id, n); }
    }
    if (base < need) nDef++;
    if (have < need) {
      const n = trunc((need - have) / satAtt) + 1;
      if (n * C.satellite.metal < A.defB) { A.defB -= n * C.satellite.metal; req('defend', 60, s.id, n); }
    }
  }
  for (const s of colonies(G, p.id)) if (cls[s.id] === 8 && satStrength(G, p, s.id) === 0) req('defend', 60, s.id, 1);
  // step 17: carry out requests in priority order
  Q.sort((x, y) => y.prio - x.prio || x.n - y.n);
  let budget = A.D;
  const M = { tech: 0, terra: {}, mine: {} };
  const ctx = { G, p, ai, D, C, A, cls, tthreat, threat, myFleets };
  for (const q of Q) {
    if (q.type === 'tech') { const x = Math.min(budget, trunc(q.a * Math.max(0, I) / 100)); M.tech += x; budget -= x; }
    else if (q.type === 'terra' || q.type === 'mine') { const x = Math.min(budget, q.b); const box = M[q.type]; box[q.a] = (box[q.a] || 0) + x; budget -= x; }
    else if (q.type === 'scout') aiScout(ctx, q.a, q.b);
    else if (q.type === 'colony') aiColony(ctx, q.a, q.b);
    else if (q.type === 'attack') aiAttack(ctx, q.a, q.b);
    else if (q.type === 'defend') aiBuild(ctx, D.satellite, q.a, q.b);
  }
  // step 21: turn the decisions into budget bars like a human's
  const tot = A.D;
  const b = p.budget;
  if (rs.aiBudget) rs.aiBudget(G, p, M, A); // DOS 2.0: shares of the whole treasury, ships included
  else {
    b.col = {};
    if (tot <= 0) { b.tech = 0; b.savings = 1; }
    else {
      b.tech = M.tech / tot;
      let used = M.tech;
      for (const s of colonies(G, p.id)) {
        const t = M.terra[s.id] || 0, m = M.mine[s.id] || 0;
        b.col[s.id] = (t + m) / tot; used += t + m;
        if (t + m > 0) s.terra = t / (t + m);
      }
      b.savings = Math.max(0, tot - used) / tot;
    }
  }
  p.talloc = Object.assign({}, ai.tw);
  // step 20: idle warships away from home fall back to the nearest colony
  for (const f of myFleets) {
    if (!G.fleets.includes(f) || f.star == null || f.to != null || f.dest != null || f.sat) continue;
    const kind = fleetKind(G, f);
    if (kind === 'scout' || kind === 'colony' || G.stars[f.star].owner === p.id) continue;
    const back = nearestOwn(G, p, f.star, f.fuel, cls);
    if (back >= 0) orderMove(G, f, back);
  }
}
// habitability score 2..21 (FUN_10072100)
function aiHab(p, s) {
  const h = RS.hab(p, s);
  let v = 0;
  if (h.gR < 257 && (h.gR < 201 || h.dT < 501)) {
    const gi = trunc(h.gR / 10), ti = trunc(h.dT / 330);
    v = trunc(Math.max(23, 100 - (gi - 10) * (gi - 9)) * Math.max(40, 100 - ti * (ti + 1)) / 527) + 2;
  }
  if (s.metal > 10000) v = Math.min(20, v + 1);
  return v;
}
// colony target value (FUN_10083810)
function aiPlanetValue(p, s, k, metalF) {
  const hab = aiHab(p, s), metal = k.metal != null ? k.metal : s.metal;
  if (hab < 2 && metal < 100) return -1;
  const m = clamp(trunc(metal / 1250), 0, 20);
  return trunc((metalF * m + hab * (100 - metalF) + 67) / 100);
}
// attack target score (FUN_10082ea0)
function aiTargetScore(G, p, s, thr, fAtt) {
  const ai = p.ai, k = know(G, p, s.id);
  let v = clamp(ai.aggr * 2 - trunc(thr / fAtt), 0, 20);
  if (k.pop > 0 && ai.iq !== 1) v += 20;
  if (k.pop * 1000 > 400000 && ai.iq !== 1) v += 40;
  let richest = -1, rv = -1;
  for (const q of G.players) if (q.alive && q.id !== p.id && q.oInc > rv) { rv = q.oInc; richest = q.id; }
  if (k.owner >= 0 && k.owner === richest) v += 25;
  v += k.explored ? aiPlanetValue(p, s, k, ai.metalF) : 8;
  v += clamp(20 - 5 * trunc(starDist(G, s.id, p.homeStar) / Math.max(1, p.tech.range)), 0, 20);
  v += k.explored ? clamp(trunc((k.metal || 0) / 1000), 0, 20) : 8;
  if (ai.hatesHumans && k.owner >= 0 && G.players[k.owner] && !G.players[k.owner].human) v = trunc(v / 4); // C division (FUN_10082ea0)
  return v + RI(G, -trunc(v / 2), trunc(v / 2));
}
function nearestOwn(G, p, sid, fuel, cls) {
  let best = -1, bd = 1e9;
  for (const s of G.stars) {
    if (s.owner !== p.id || s.id === sid || (cls && cls[s.id] < 8)) continue;
    const d = starDist(G, sid, s.id);
    if (d <= fuel && d < bd) { bd = d; best = s.id; }
  }
  return best;
}
function satStrength(G, p, sid) {
  let st = 0;
  for (const f of G.fleets) if (f.owner === p.id && f.star === sid && f.sat) st += RS.fleetStrength(G, f);
  return st;
}
// FUN_100852d0: pay for ships out of savings above the reserve, never past the borrowing limit
function aiBuild(ctx, d, sid, n) {
  const { G, p, A } = ctx;
  if (E.rules(G).aiBuild) return E.rules(G).aiBuild(ctx, d, sid, n); // DOS 2.0: queue the ships at the colony
  if (!d || n < 1 || G.stars[sid].owner !== p.id) return 0;
  if (RS.popU(G.stars[sid]) < n) return 0;
  const c = shipCostNow(G, p, d), unit = RS.designCost(G, d).money;
  const total = c.money + (n - 1) * unit;
  const spend = p.savings - A.reserve;
  if ((spend < 1 && !(d.type === 'satellite' && n <= 5)) || spend - total <= borrowLimit(G, p) || p.metal < c.metal * n) return 0;
  // keep 5,000 metal in hand for the next colony ship
  if (!(c.metal < 1 || A.colShips > 0 || d.type === 'colony' || A.metal >= 5000 || A.broke)) return 0;
  return buildShips(G, p.id, sid, d.id, n);
}
function freshFleet(G, p, sid, did) {
  return G.fleets.find(f => f.owner === p.id && f.star === sid && f.newThisTurn && f.dest == null && f.ships[did]);
}
function aiScout(ctx, target, src) {
  const { G, p, D } = ctx;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== src || f.dest != null || f.to != null || fleetCount(f) !== 1) continue;
    const kind = fleetKind(G, f);
    if (kind !== 'scout' && kind !== 'bio') continue;
    if (orderMove(G, f, target)) return;
  }
  if (aiBuild(ctx, D.scout, src, 1)) { const f = freshFleet(G, p, src, D.scout.id); if (f) orderMove(G, f, target); }
}
function aiColony(ctx, target, src) {
  const { G, p, D } = ctx;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || !fleetHas(G, f, 'colony')) continue;
    if (orderMove(G, f, target)) return;
  }
  if (aiBuild(ctx, D.colony, src, 1)) { const f = freshFleet(G, p, src, D.colony.id); if (f) orderMove(G, f, target); }
}
// FUN_10084860
function aiAttack(ctx, target, src) {
  const { G, p, ai, D, C, A, tthreat } = ctx;
  const need = trunc(tthreat[target] / 100) * ai.attDom + 1;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || f.sat) continue;
    const kind = fleetKind(G, f);
    if (!(kind === 'fighter' || kind === 'dread' || kind === 'bio')) continue;
    let st = RS.fleetStrength(G, f);
    if (fleetDesigns(G, f).some(d => d.type !== 'bio' && obsolete(p, d) >= (ai.redesign[d.type] || 60))) st = trunc(st / 2);
    if (st >= need && orderMove(G, f, target)) return;
  }
  const send = (did, n) => { const f = freshFleet(G, p, src, did); if (f) orderMove(G, f, target); return f; };
  // a single dreadnought when one is about the right size
  const dc = C.dread;
  if (dc && 10 < ai.redesign.dread - obsolete(p, D.dread) && need < dc.att && trunc(dc.att * 3 / 4) < need && dc.metal <= A.offB && dc.metal <= A.metal) {
    if (aiBuild(ctx, D.dread, src, 1)) {
      A.offB -= dc.metal; A.metal -= dc.metal;
      const f = send(D.dread.id, 1);
      if (f && p.metal > 10000 && aiBuild(ctx, D.tanker, src, 1)) { const t = freshFleet(G, p, src, D.tanker.id); if (t && t !== f) mergeFleets(G, f, t); f.dest = target; }
      return;
    }
  }
  // otherwise a wing of fighters
  if (10 < ai.redesign.fighter * 2 - obsolete(p, D.fighter)) {
    const fc = C.fighter;
    let n = trunc(need / Math.max(1, fc.att)) + 1;
    if (need > 20) n = Math.max(n, ai.minFleet);
    const cost = n * fc.metal;
    if (cost > A.offB || cost > A.metal) return;
    const built = aiBuild(ctx, D.fighter, src, n);
    if (!built) return;
    A.offB -= built * fc.metal; A.metal -= built * fc.metal;
    const f = send(D.fighter.id, built);
    if (f && built > ai.minFleet * 2) {
      const k = Math.max(1, trunc(built / 30));
      if (p.metal > k * 7500 && aiBuild(ctx, D.tanker, src, k)) { const t = freshFleet(G, p, src, D.tanker.id); if (t && t !== f) mergeFleets(G, f, t); f.dest = target; }
    }
  }
}


// ---------- colony ships with nobody aboard go home to reload ----------
function reloadColonyShips(G, p) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || !fleetHas(G, f, 'colony') || (f.colonists || 0) > 0) continue;
    if (G.stars[f.star].owner === p.id) continue;
    const back = nearestOwn(G, p, f.star, f.fuel);
    if (back >= 0) orderMove(G, f, back);
  }
}
// no colonies left: send any loaded colony ship to the best reachable free planet
function strandedColonyShips(G, p) {
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null || f.to != null || f.dest != null || !fleetHas(G, f, 'colony') || !f.colonists) continue;
    let best = -1, bv = -1e9;
    for (const s of G.stars) {
      if (s.owner >= 0 || s.nova) continue;
      const d = starDist(G, f.star, s.id);
      if (d > f.fuel || d === 0) continue;
      const v = aiHab(p, s) * 10 - d;
      if (v > bv) { bv = v; best = s.id; }
    }
    if (best >= 0) orderMove(G, f, best);
  }
}

// ---------- diplomacy (FUN_10087530, FUN_10087f80, FUN_10088160) ----------
// Each computer keeps an attitude toward every player. At 500 or more it
// wants an alliance; below 500 it withdraws. Raising its attitude toward one
// player lowers its attitude toward everyone else by a sixth as much.
const LIKE = 500;
function attitude(G, p, to, delta) {
  if (!delta || G.players.filter(q => q.alive).length < 3) return;
  const a = p.ai.att;
  a[to] = clamp((a[to] || 0) + delta, -30000, 30000);
  for (const q of G.players) if (q.id !== to && q.id !== p.id) a[q.id] = clamp((a[q.id] || 0) - trunc(delta / 6), -30000, 30000);
}
// A computer sends at most three messages a turn, to anyone (FUN_100880f0:
// player +0x1058 counts them, emptied by FUN_10072a10); only humans see them.
function say(G, p, to, text) {
  if (p.ai && (p.ai.sent || 0) >= 3) return;
  if (p.ai) p.ai.sent = (p.ai.sent || 0) + 1;
  if (G.players[to] && G.players[to].human) msg(G, to, `${p.name} says, “${text}”`, { icon: 'bad' + p.face + '_' + (p.female ? 1 : 0), quiet: true, chat: true });
}
function diplomacy(G, p) {
  const ai = p.ai;
  p.allies = p.allies || [];
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  // last turn's news: gifts received, alliances made and broken
  for (const ev of p.news || []) {
    if (ev.type === 'gift') {
      const base = ev.money ? Math.max(1, p.oInc) : Math.max(1, p.metal - ev.metal);
      const x = Math.min(50, 5 * trunc(2 * (ev.money || ev.metal) / base));
      if (RI(G, 1, 60) < x) say(G, p, ev.from, 'Thank You!');
      attitude(G, p, ev.from, x);
    } else if (ev.type === 'allied') {
      attitude(G, p, ev.with, RI(G, 50, 150));
      for (const q of alive) if (q.id !== p.id && !isAllied(G, p.id, q.id) && RI(G, 1, 2) === 1) ai.att[q.id] = (ai.att[q.id] || 0) - RI(G, 15, 35);
    } else if (ev.type === 'broken') ai.att[ev.with] = Math.min(ai.att[ev.with] || 0, LIKE - 25);
    else if (ev.type === 'attacked' && RI(G, 1, 10) < 5) say(G, p, ev.by, '#!$@*$&@•™!');
  }
  p.news = [];
  if (G.year > 2500) {
    let rich = -1, rv = -1, poor = -1, pv = 1e18, second = -1, sv = -1;
    for (const q of alive) {
      if (q.oInc > rv) { rv = q.oInc; rich = q.id; }
      if (q.oInc < pv) { pv = q.oInc; poor = q.id; }
      if (q.id !== p.id && q.oInc > sv) { sv = q.oInc; second = q.id; }
    }
    if (rich === p.id) { attitude(G, p, p.id, RI(G, 20, 40)); attitude(G, p, second, -RI(G, 15, 25)); }
    else if (poor === p.id) attitude(G, p, p.id, -RI(G, 20, 40));
    else attitude(G, p, rich, -RI(G, 5, 10));
  }
  // dislike the friends of enemies
  for (const q of alive) {
    if (q.id === p.id || (ai.att[q.id] || 0) >= LIKE - 200) continue;
    for (const r of alive) if (r.id !== p.id && r.id !== q.id && isAllied(G, q.id, r.id)) ai.att[r.id] = (ai.att[r.id] || 0) - RI(G, 4, 8);
  }
  for (const q of G.players) {
    if (q.id === p.id) continue;
    if (!q.alive || q.surrendered) { ai.att[q.id] = 0; continue; }
    const want = p.allies.includes(q.id);
    if ((ai.att[q.id] || 0) >= LIKE && !want) { p.allies.push(q.id); if (RI(G, 1, 10) > 5) say(G, p, q.id, 'I like you.'); }
    else if ((ai.att[q.id] || 0) < LIKE && want) { p.allies = p.allies.filter(x => x !== q.id); if (RI(G, 1, 10) > 5) say(G, p, q.id, 'I hate you.'); }
  }
}
// FUN_10085f60 / FUN_10088160: a computer that is hopelessly behind gives up
// to the player it likes best. Turtles (style 2) never do. 5.0.5 doesn't ask
// whether Alliances are on.
function considerSurrender(G, p, A) {
  const ai = p.ai;
  if (p.human || G.year <= 2500 || ai.style === 2) return;
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  if (alive.length <= 2) return;
  const incs = alive.map(q => q.oInc).sort((a, b) => a - b);
  const poorest = p.oInc === incs[0] && p.oInc * 3 < incs[1];
  if (!(A.broke || poorest)) return;
  let to = -1, best = -30000;
  for (const q of alive) if (q.id !== p.id && (ai.att[q.id] || 0) > best) { best = ai.att[q.id] || 0; to = q.id; }
  if (to >= 0) p.surrenderTo = to;
}

// FUN_10085f60: requests to allies, each one time in 20 — "I need metal."
// (string 1045, code 0x415) after 2500 with under 10,000 metal in all, and
// "I need money." (1044, 0x414) after 2400 when it has the lowest income and
// the next lowest is over $2,000 more. Nobody acts on them but a human.
function askAllies(G, p, totalMetal) {
  if (p.human) return;
  const allies = G.players.filter(q => q.id !== p.id && isAllied(G, p.id, q.id));
  if (G.year > 2500 && totalMetal < 10000)
    for (const q of allies) if (RI(G, 1, 20) === 1) say(G, p, q.id, 'I need metal.');
  const incs = G.players.filter(q => q.alive && !q.surrendered).map(q => q.oInc).sort((a, b) => a - b);
  if (G.year > 2400 && p.oInc === incs[0] && incs.length > 1 && incs[0] + 2000 < incs[1])
    for (const q of allies) if (RI(G, 1, 20) === 1) say(G, p, q.id, 'I need money.');
}

E.registerAI('original', {
  make: (G, p, iq) => makeAI(G, p, iq, false),
  turn: aiTurn,
  techEvent: aiTechEvent,
  noteBattle: (G, p, rec, won) => { if (!won) p.ai.lostAt[rec.star] = G.turn; },
});
})(this);
