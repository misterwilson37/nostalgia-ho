// Spaceward Ho! web remake — the computer players of the "Mac 1.2" and
// "DOS 2.0" rulesets.
//
// A port of Spaceward Ho! 1.2F's DoComputerTurn (segment 9 of the program,
// @90004 in the layout of tools/decompile/mac68k.py) and the routines it
// calls. docs/12-findings.md describes them in plain English. Every rule here
// is CONFIRMED from the routine named beside it unless it says GUESS.
//
// 2.0 (DOS and Windows 3.1) has the same computer players: WINHO.EXE's
// segment 1020 holds the same 36 routines, almost in the same order
// (FUN_1020_0000 = DoComputerTurn, FUN_1020_03e7 = AddColonySupportActions,
// ... FUN_1020_4a3d = FillInStarStatus, FUN_1020_54df = MarkUsedFleets; the
// full list is in docs/dos-findings.md). Every constant in them is 1.2's, and the routines
// read side by side with 1.2's (DoComputerTurn, SetCompAttrs = FUN_1030_1b51,
// ComputeStatus, MaintainShipTypes, FillInStarStatus, GoColonize, BuildAFleet,
// ResolveSpending, MakeResultMessages = FUN_1018_260b) do the same. The one
// difference is the attack rating they compare (2.0 works part of it out in
// 16 bits), which each ruleset supplies as rs.shipPower; the ruleset also
// supplies the battle estimates (rs.x12), the planet's strength
// (rs.planetPower) and the colony order (rs.colOrder). The 2.0 addresses
// are listed in docs/dos-findings.md.
//
// How 1.2's computer thinks, in short: it sorts every star into a class (its
// colonies by how they pay, stars it has fleets at or is sending fleets to,
// explored and unexplored stars, other players' stars), estimates the enemy
// strength around each, then fills a list of at most 50 actions by priority
// (fund research, support colonies, finish queued ships, explore, attack,
// colonize, terraform, mine, build satellites) and carries them out in order
// with the money it has. What each action is given becomes its budget bars.
(function (root) {
'use strict';
const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;
const { RI, colonies, know, getDesign, findOrCreateDesign, orderMove, scrapFleet, scrapDesign, observe, starDist } = E;
const trunc = Math.trunc;
const CLASSES = ['scout', 'fighter', 'colony', 'satellite']; // 1.2's class numbers 0-3
const TECH5 = ['range', 'speed', 'weapons', 'shields', 'mini'];

// ---------- personality (SetCompAttrs @e20f6) ----------
// The fields of the hidden "Computer Params" window (DLOG 500). iq: 1 Dumb
// ("Stupide"), 2 Average ("Moyen"), 3 Smart ("Brillant"); 0 for a human on
// auto play (EndTurn @a0004 passes 0).
function makeAI(G, p, iqName, autoplay) {
  const iq = autoplay ? 0 : ({ dumb: 1, average: 2, smart: 3, diabolical: 3 }[iqName] || 2);
  const ai = { v12: true, iq, rebuild: 1 };
  ai.upfront = RI(G, 15, 25);          // +0x4a6 up-front tech percent
  ai.addl = RI(G, 15, 25);             // +0x4a8 additional tech percent
  ai.reqInc = RI(G, 33000, 37000);     // +0x4aa income per colony
  ai.colDef = RI(G, 30, 70);           // +0x4ae % of colonies defended (and the most metal for defence)
  ai.metalDef = RI(G, 30, 70);         // +0x4b0 % of metal for defence
  ai.defDom = RI(G, 150, 250);         // +0x4be defending domination %
  const tw = { range: RI(G, 160, 200), speed: RI(G, 160, 200), weapons: RI(G, 200, 260) };
  tw.shields = Math.min(RI(G, 200, 260), tw.weapons);
  tw.mini = 1000 - tw.range - tw.speed - tw.weapons - tw.shields; tw.radical = 0;
  ai.attDom = RI(G, 150, 250);         // +0x4bc attacking domination %
  ai.aggr = RI(G, 3, 7);               // +0x4c0 aggressiveness
  ai.style = 1;
  ai.metalF = RI(G, 25, 75);           // +0x4c4 desire for metal
  ai.saving = 50;                      // +0x4c6 (unused)
  ai.satShield = RI(G, 11, 13);        // +0x4c8 above this Shields tech, satellites get Shields 1
  if (!autoplay) {
    if (iq === 1) Object.assign(ai, { upfront: 4, addl: RI(G, 1, 6), colDef: RI(G, 10, 20), attDom: RI(G, 75, 95), defDom: RI(G, 75, 95), aggr: 1, satShield: 30 });
    else if (iq === 2) Object.assign(ai, { upfront: RI(G, 10, 20), attDom: RI(G, 150, 200) });
    else Object.assign(ai, { upfront: RI(G, 10, 20), aggr: 10 });
  } else Object.assign(tw, { range: 200, speed: 200, weapons: 200, shields: 200, mini: 200 });
  ai.tw = tw;
  if (!autoplay) p.talloc = Object.assign({}, tw);
  return ai;
}

// ---------- helpers ----------
const lvl = (p, k) => trunc((p.tprog[k] || 0) / 100);
const maxR = (G, f) => E.fleetMaxRange(G, f);
const used = (G, f) => Math.max(0, maxR(G, f) - (f.fuel || 0)); // fuel used since the last refuel (+4)
const finalDest = (f) => f.path && f.path.length ? f.path[f.path.length - 1] : f.dest != null ? f.dest : f.to != null ? f.to : null;
const designOf = (G, f) => E.fleetDesigns(G, f)[0] || null; // 1.2 fleets are one ship type
const classOf = (G, f) => { const d = designOf(G, f); return d ? d.type : null; };
function inService(G, p, d) { let n = 0; for (const f of G.fleets) if (f.owner === p.id && f.ships[d.id]) n += f.ships[d.id]; return n; }
function fleetPower(G, f, att) { let a = 0; for (const k in f.ships) a += f.ships[k] * att(getDesign(G, f.owner, +k)); return a; }
// a route from star `from` to `to` with `fuel` left and range R, refuelling at
// your colonies (DeterminePath @1105ae; the same search as the DOS 2.0 ruleset's)
function pathOK(G, p, from, to, fuel, R) {
  if (from == null || to == null) return false;
  const direct = starDist(G, from, to);
  if (direct <= fuel + 1e-9) return true;
  if (!(R > 0)) return false;
  const nodes = colonies(G, p.id).map(s => s.id).filter(i => i !== from && i !== to).concat([to]);
  const maxHops = Math.max(1, trunc(42 / R));
  let layer = new Map([[from, 0]]);
  const seen = new Map([[from, 0]]);
  for (let h = 0; h < maxHops && layer.size; h++) {
    const next = new Map();
    for (const [u, du] of layer) {
      const reach = u === from ? fuel : R;
      for (const v of nodes) {
        const d = starDist(G, u, v);
        if (v === u || d > reach + 1e-9) continue;
        const nd = du + d;
        if (v === to) { if (nd < 3 * direct) return true; continue; }
        if (seen.has(v) && seen.get(v) <= nd) continue;
        seen.set(v, nd); next.set(v, nd);
      }
    }
    layer = next;
  }
  return false;
}

// ---------- the computer's turn (DoComputerTurn @90004) ----------
function aiTurn(G, p) {
  // (a game saved before these computer players were used gets them now, at its skill)
  const ai = (p.ai && p.ai.v12) ? p.ai : (p.ai = makeAI(G, p, p.iq || 'average', p.human));
  const rs = E.rules(G), att = (d) => rs.shipPower(G, d);
  const C = {
    G, p, ai, rs, att, iq: p.human ? 0 : ai.iq,
    M: Math.max(0, p.savings),                 // money still to hand out (d896)
    metal: p.metal,                            // metal in hand (d892)
    I: (p.oInc || 0) + (p.oInterest || 0),     // last turn's income and interest (d88e)
    cols: rs.colOrder(G, p),                   // the colony slots, in order
    support: {}, terra: {}, mine: {}, finish: {}, // money per slot ('sav', 'tech' or a colony's star)
    acts: [], used: new Set(), scrapF: new Set(), scrapD: new Set(), T: {},
  };
  maintainShipTypes(C);
  computeStatus(C);
  fillInStarStatus(C);
  for (const f of G.fleets) if (f.owner === p.id && (f.star == null || finalDest(f) != null)) C.used.add(f); // MarkUsedFleets @9548a
  scrapOldSats(C);
  scrapOldFighters(C);
  addAction(C, 3, 90, -1, ai.upfront);   // research, up front
  addAction(C, 3, 25, -1, ai.addl);      // research, more if there is money left
  addColonySupportActions(C);
  addShipFinishingActions(C);
  addExploreActions(C);
  addAttackActions(C);
  addColonizeAction(C);
  addTerraformingActions(C);
  addSatelliteActions(C);
  performActions(C);
  saveFleets(C);
  resolveSpending(C);
  // ScrapFleetsAndTypes @a0e02 then scraps what was marked, first thing in the turn
  for (const f of C.scrapF) if (G.fleets.includes(f)) scrapFleet(G, f);
  for (const d of C.scrapD) { if (inService(G, p, d)) scrapDesign(G, p.id, d.id); else d.scrapped = true; }
}

// ---------- designs (MaintainShipTypes @93cdc) ----------
function maintainShipTypes(C) {
  const { G, p, ai } = C;
  const live = p.designs.filter(d => !d.scrapped);
  let nTypes = live.length;
  const stat = (d, k) => d[['R', 'V', 'W', 'S', 'M'][k]] | 0;
  // a design with no ships in service that is behind your tech is scrapped
  for (const d of live) {
    if (inService(G, p, d) !== 0) continue;
    for (let k = 0; k < 5; k++) {
      let L = lvl(p, TECH5[k]);
      if (d.type === 'scout' && k === 0) L += 2;
      if (d.type === 'scout' && (k === 2 || k === 3)) L -= 1;
      if (d.type === 'satellite' && (k === 0 || k === 1 || k === 3)) L = 0;
      if (d.type === 'colony' && k === 4) L = 0;
      if (stat(d, k) < L) { C.scrapD.add(d); break; }
    }
  }
  const ok = (d) => !d.scrapped && !C.scrapD.has(d);
  // the design to build for each class: the one with the best Mini (colony
  // ships: the best Range); a new one when Mini tech is ahead by the rebuild
  // difference (colony ships: Range ahead by twice that, and none in service)
  for (let c = 0; c < 4; c++) {
    const type = CLASSES[c];
    let best = null, bv = -1;
    for (const d of p.designs) {
      if (d.type !== type || !ok(d)) continue;
      const v = type === 'colony' ? d.R : d.M;
      if (v > bv) { bv = v; best = d; }
    }
    let local;
    if (type === 'colony') { local = lvl(p, 'range'); if (best && inService(G, p, best) > 0) bv = local; }
    else local = lvl(p, 'mini');
    if (!best || (type !== 'colony' && ai.rebuild <= local - bv) || (type === 'colony' && ai.rebuild * 2 <= local - bv)) {
      if (nTypes === 20) break; // "Want to build a new type but no room"
      const spec = { type, R: type === 'satellite' ? 0 : lvl(p, 'range') + (type === 'scout' ? 2 : 0), V: lvl(p, 'speed'),
        W: lvl(p, 'weapons') - (type === 'scout' ? 1 : 0), S: lvl(p, 'shields') - (type === 'scout' ? 1 : 0), M: lvl(p, 'mini') };
      if (type === 'satellite' && ai.satShield < spec.S) spec.S = 1;
      if (type === 'colony' && spec.M > 1) spec.M = trunc(spec.M / 3);
      spec.W = Math.max(1, spec.W); spec.S = Math.max(1, spec.S);
      const d = findOrCreateDesign(G, p, spec);
      if (!live.includes(d)) nTypes++;
      C.scrapD.delete(d);
      C.T[type] = d;
    } else C.T[type] = best;
  }
  // too many designs: drop the ones not being built
  const cur = new Set(Object.values(C.T));
  let gone = 0;
  if (nTypes + 4 > 19) for (const d of p.designs) if (ok(d) && !cur.has(d) && inService(G, p, d) < 1) { C.scrapD.add(d); gone++; }
  if (nTypes - gone + 4 > 19) for (const d of p.designs) if (ok(d) && !cur.has(d)) C.scrapD.add(d);
}

// ---------- the computer's view of itself (ComputeStatus @9388e) ----------
function computeStatus(C) {
  const { G, p, ai, T } = C;
  ai.metalDef = Math.max(0, Math.min(80, ai.metalDef - 1));
  C.cap = Math.max(0, trunc((ai.reqInc + C.I - 30000) / ai.reqInc));              // colonies the income supports
  C.cap2 = Math.max(trunc((trunc(ai.reqInc / 2) + C.I + ai.reqInc - 30000) / ai.reqInc), C.cols.length + 2 < 4 ? 1 : 0);
  C.totalMetal = C.metal;
  for (const sid of C.cols) C.totalMetal += know(G, p, sid).metal || 0;
  C.broke = true;
  let homeFleet = 0, awayFleet = 0, satMetal = 0, warMetal = 0;
  C.colShips = 0;
  for (const f of G.fleets) {
    if (f.owner !== p.id) continue;
    const t = classOf(G, f), d = designOf(G, f);
    if (t === 'colony') { C.broke = false; C.colShips++; }
    const m = E.fleetCount(f) * (d ? E.designCost(G, d).metal : 0);
    if (f.star != null && know(G, p, f.star).owner === p.id && G.stars[f.star].owner === p.id) homeFleet += m;
    else if (t !== 'scout') awayFleet += m;
    if (t === 'satellite') satMetal += m;
    if (t === 'fighter') warMetal += m;
  }
  if (T.colony && E.designCost(G, T.colony).metal <= C.totalMetal + homeFleet) C.broke = false;
  let spare = homeFleet + C.totalMetal + awayFleet;
  if (C.colShips === 0) spare = Math.max(0, spare - 5000);
  else spare -= C.colShips * (T.colony ? E.designCost(G, T.colony).metal : 0);
  const pct = Math.min(ai.metalDef, ai.colDef);
  C.defB = trunc(spare * pct / 100) - satMetal;
  C.offB = trunc(spare * (100 - pct) / 100) - warMetal;
  // the middle of your colonies, for measuring how far targets are
  // (whole light-years, as the galaxy's own coordinates)
  const ly = (v) => Math.round(v / 10);
  if (!C.cols.length) C.center = { x10: 0, y10: 0 };
  else {
    let x = 0, y = 0;
    for (const sid of C.cols) { x += ly(G.stars[sid].x10); y += ly(G.stars[sid].y10); }
    C.center = { x10: trunc(x / C.cols.length) * 10, y10: trunc(y / C.cols.length) * 10 };
  }
}

// ---------- the computer's view of the galaxy (FillInStarStatus @94878) ----------
// Classes: 0 unexplored, 1 a fleet on its way to an unexplored star, 2 explored
// and nobody's, 3 unexplored but a battle seen there, 4 someone else's, 5 a
// fleet on its way, 6 a fleet of yours there, 7 a colony ship on its way,
// 8 your colony losing money with hostile gravity, 9 your colony losing money,
// 10 your colony making money.
function fillInStarStatus(C) {
  const { G, p, ai, T, rs } = C;
  const fAtt = T.fighter ? C.att(T.fighter) : 0;
  // a Smart computer knows the stars within 9 ly of home before 2020
  // the year the computer plans in: 2.0 has already moved the year on
  // (FUN_1040_0038 @1040:01a8, before FUN_1020_0000 runs; rs.aiYear)
  const Y = rs.aiYear ? rs.aiYear(G) : G.year;
  if (C.iq === 3 && Y < 2020) for (const s of G.stars) if (starDist(G, s.id, p.homeStar) < 9) observe(G, p, s.id);
  const cls = C.cls = [];
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = rs.x12(G, p, s.id);
    if (!k.explored) cls[s.id] = x.by >= 2000 ? 3 : 0;
    else if (s.owner === p.id) {
      if ((s.oInc || 0) < 0) cls[s.id] = E.RULESETS.original.hab(p, s).gR > 256 ? 8 : 9;
      else cls[s.id] = 10;
    } else cls[s.id] = k.owner >= 0 && k.owner !== p.id ? 4 : 2;
  }
  const mine = G.fleets.filter(f => f.owner === p.id);
  for (const f of mine) if (f.star != null && cls[f.star] < 6) cls[f.star] = 6;
  for (const f of mine) {
    const t = finalDest(f); if (t == null) continue;
    if (cls[t] < 8 && cls[t] !== 4 && classOf(G, f) === 'colony') cls[t] = 7;
    else if (cls[t] < 2) cls[t] = 1;
    else if (cls[t] < 6) cls[t] = 5;
  }
  const threat = C.threat = [], tthreat = C.tthreat = [];
  for (const s of G.stars) { threat[s.id] = 0; tthreat[s.id] = 0; }
  // the threat to each of your colonies: what was seen there, and what could
  // come from stars within your Range + 1 (a fighter from each unknown one)
  const reach = lvl(p, 'range') + 1;
  for (const s of G.stars) {
    if (cls[s.id] <= 7) continue;
    let t = rs.x12(G, p, s.id).e1e;
    for (const o of G.stars) {
      if (o.id === s.id || starDist(G, s.id, o.id) > reach) continue;
      t = Math.max(t, cls[o.id] <= 2 ? fAtt : rs.x12(G, p, o.id).e22);
    }
    threat[s.id] = t;
  }
  // the force to beat at other stars
  for (const s of G.stars) if (cls[s.id] >= 3 && cls[s.id] <= 5) tthreat[s.id] = rs.x12(G, p, s.id).e16;
  for (const s of G.stars) {
    if (!(cls[s.id] === 0 || (cls[s.id] === 2 && rs.x12(G, p, s.id).by < 2000))) continue;
    let t = tthreat[s.id];
    for (const o of G.stars) if (o.id !== s.id && starDist(G, s.id, o.id) < 11) t = Math.max(t, rs.x12(G, p, o.id).e1a);
    tthreat[s.id] = t;
  }
  // old news fades: estimates of stars fought over long ago are redone
  const W = lvl(p, 'weapons');
  for (const s of G.stars) {
    const c = cls[s.id], x = rs.x12(G, p, s.id);
    if ((c === 3 || c === 4) && x.by === Y - 60 && RI(G, 1, 2) === 1) x.e16 = 5;
    if ((c === 3 || c === 4) && x.by >= 2000 && x.by < Y - 20 && (x.by - Y) % 200 === 0 && x.pop === 0) {
      if (RI(G, 1, 2) === 1) x.e16 = 6;
      else x.e16 = trunc((W + 1) * 7000 * (W + 1) / 125);
    }
  }
  // other players' stars with no battle seen: a guess from your own Weapons
  for (const s of G.stars) {
    const k = know(G, p, s.id), x = rs.x12(G, p, s.id);
    if (k.owner >= 0 && k.owner !== p.id && x.by < 2000) {
      x.e16 = trunc((W + 1) * 5000 * (W + 1) / 125); x.e1a = 7; x.e1e = 0; x.e22 = fAtt;
    }
  }
}

// ---------- old ships (ScrapOldSats @94220, ScrapOldFighters @9432e) ----------
function scrapOldSats(C) {
  const { G, p, T, cls } = C;
  for (const f of G.fleets) {
    if (f.owner !== p.id || classOf(G, f) !== 'satellite' || designOf(G, f) === T.satellite) continue;
    if (f.star != null && cls[f.star] > 8) { C.scrapF.add(f); C.used.add(f); }
  }
}
function scrapOldFighters(C) {
  const { G, p, T, cls } = C;
  for (const f of G.fleets.slice()) {
    if (f.owner !== p.id || f.star == null || classOf(G, f) !== 'fighter' || designOf(G, f) === T.fighter) continue;
    if (cls[f.star] < 8) { // away from home: back to the nearest colony it can reach
      const back = findCloseEnoughColony(C, f.star, maxR(G, f) - used(G, f), 1);
      if (back !== -1 && orderMove(G, f, back)) C.used.add(f);
    } else { C.scrapF.add(f); C.used.add(f); }
  }
}

// ---------- the action list (AddActionToList @94662, CountActions @94748) ----------
// At most 50 actions, highest priority first (a new one goes after those of
// equal priority). 1 explore, 2 attack, 3 research, 4 colonize, 5 support a
// colony, 6 terraform, 7 mine, 8 satellites, 9 finish queued ships, 10 scrap
// satellites.
function addAction(C, type, prio, a, b) {
  const L = C.acts;
  if (L.length === 50) { if (prio <= L[49].prio) return; L.pop(); }
  let i = 0; while (i < L.length && prio <= L[i].prio) i++;
  L.splice(i, 0, { type, prio, a, b });
}
function countActions(C, type) {
  const { G, p } = C;
  let n = C.acts.filter(x => x.type === type).length;
  if (type === 1) for (const f of G.fleets) {
    const t = finalDest(f);
    if (f.owner === p.id && classOf(G, f) === 'scout' && t != null && !know(G, p, t).explored) n++;
  }
  return n;
}
// the nearest colony of yours within `range` of a star; mode 2 also accepts a
// colony ship that can reach it, and then (as 1.2 does) answers with your
// last colony (FindCloseEnoughColony @90e62)
function findCloseEnoughColony(C, sid, range, mode) {
  const { G, p, cls } = C;
  let best = -1, bd = 30000;
  for (const c of C.cols) {
    if (c === sid || cls[c] <= 7) continue;
    const d = starDist(G, sid, c);
    if (d <= range && d < bd) { bd = d; best = c; }
  }
  if (best === -1 && mode === 2) {
    for (const f of G.fleets) {
      if (f.owner !== p.id || f.star == null || classOf(G, f) !== 'colony') continue;
      if (starDist(G, sid, f.star) <= maxR(G, f) - used(G, f)) return C.cols.length ? C.cols[C.cols.length - 1] : -1;
    }
  }
  return best;
}
// a star's habitability score 0..20, from what you know (DetermineStarQuality @91b98)
function starQuality(C, sid) {
  const { G, p } = C;
  const k = know(G, p, sid);
  if (!k.explored) return -1;
  const g = trunc(k.g * 100 + 1e-6), hg = trunc(p.homeG * 100 + 1e-6);
  const gR = hg > g ? trunc(100 * hg / Math.max(1, g)) : trunc(100 * g / Math.max(1, hg));
  const dT = Math.abs(Math.round(p.homeT * 10) - Math.round(k.t * 10));
  let q = 0;
  if (gR <= 256) {
    const gi = trunc(gR / 10) - 10, ti = trunc(dT / 330);
    q = trunc(Math.max(23, 100 - gi * (gi + 1)) * Math.max(40, 100 - ti * (ti + 1)) / 527) + 2;
  }
  if ((k.metal || 0) > 10000) q = Math.min(20, q + 1);
  return q;
}
// a colony target's worth: habitability and metal (your fighters there count
// as metal), weighed by the desire for metal (DetermineColQuality @919d6)
function colQuality(C, sid, metalF) {
  const { G, p } = C;
  const q = starQuality(C, sid);
  let metal = know(G, p, sid).metal || 0;
  for (const f of G.fleets) if (f.owner === p.id && f.star === sid && classOf(G, f) === 'fighter') metal += E.fleetCount(f) * E.designCost(G, designOf(G, f)).metal;
  const m = Math.max(0, Math.min(20, trunc(metal / 1250)));
  if (q < 2 && metal < 100) return -1;
  return trunc((metalF * m + q * (100 - metalF) + 67) / 100);
}

// a colony still being terraformed: its Terraform bar isn't -1 (finished).
// 2.0's ruleset keeps the bars (rs.terraLeft, FUN_1020_03e7 @1020:0445);
// 1.2's tells by the temperature gap
function terraLeft(C, sid) {
  const s = C.G.stars[sid];
  return C.rs.terraLeft ? C.rs.terraLeft(C.G, C.p, s) : E.RULESETS.original.hab(C.p, s).dT > 0;
}

// ---------- supporting colonies and mining (AddColonySupportActions @90294) ----------
function addColonySupportActions(C) {
  const { G, p, cls } = C;
  // more colonies being terraformed than the income supports: let the worst go
  let n = C.cols.filter(sid => terraLeft(C, sid)).length;
  while (C.cap2 < n && n > 0) {
    let worst = -1, wq = 99;
    for (const sid of C.cols) {
      if (cls[sid] <= 7) continue;
      let q = starQuality(C, sid);
      if (E.RULESETS.original.popU(G.stars[sid]) > 20 && q > 1) q += 10;
      if (q < wq) { wq = q; worst = sid; }
    }
    if (worst === -1) break;
    n--;
    if (!anyUnfueledShips(C, worst)) cls[worst] = 6; // no support: the colony is left to die
  }
  for (const sid of C.cols) {
    const s = G.stars[sid], c = cls[sid];
    if (c <= 7) continue;
    if (c === 9) addAction(C, 5, 99, sid, -(s.oInc || 0));
    else if (c === 8) {
      if (s.metal < 100) {
        cls[sid] = 6;
        if (anyUnfueledShips(C, sid) || anyStationedShips(C, sid)) { cls[sid] = 8; addAction(C, 5, 98, sid, -(s.oInc || 0)); }
      } else addAction(C, 5, 98, sid, -(s.oInc || 0));
    }
    if (s.metal > 0) {
      const need = trunc(((Math.floor(s.metal) + 25) ** 2 + 224) / 225);
      if (c === 8) addAction(C, 7, 75, sid, C.iq === 1 ? need : Math.min(need, 7500));
      else if (c > 8) addAction(C, 7, 30, sid, Math.min(need, 2500));
    }
  }
}
function anyUnfueledShips(C, sid) { return C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && used(C.G, f) > 0); } // @9084a
function anyStationedShips(C, sid) { return C.G.fleets.some(f => f.owner === C.p.id && f.star === sid && finalDest(f) == null && classOf(C.G, f) !== 'satellite'); } // @908ca

// ---------- paying for queued ships (AddShipFinishingActions @90982) ----------
// every ship in the queue at its price (the prototype price for a design never
// built, for every ship of it), less what has been paid toward the first
function addShipFinishingActions(C) {
  const { G, p, cls } = C;
  for (const sid of C.cols) {
    if (cls[sid] <= 7) continue;
    const s = G.stars[sid], q = s.queue || [];
    if (!q.length) continue;
    let sum = 0;
    for (const it of q.slice(0, 3)) {
      const d = getDesign(G, p.id, it.did); if (!d) continue;
      const c = E.designCost(G, d);
      sum += it.n * (d.built === 0 ? c.protoTotal : c.money);
    }
    sum -= s.yard || 0;
    if (sum > 0) addAction(C, 9, 87, sid, sum);
  }
}

// ---------- exploring (AddExploreActions @90d2e) ----------
// unexplored stars, and explored ones nobody owns, with no enemy force about,
// from the nearest colony a colony ship (then a scout) could reach them from
function addExploreActions(C) {
  const { G, T, cls, tthreat } = C;
  if (C.broke || !(C.colShips > 0 || C.totalMetal >= 5000) || !T.scout) return;
  const sR = T.scout.R, cR = T.colony ? T.colony.R : 0;
  for (const s of G.stars) {
    if (!(cls[s.id] === 0 || cls[s.id] === 2) || tthreat[s.id] !== 0) continue;
    let src = findCloseEnoughColony(C, s.id, cR, 0);
    if (src >= 0) addAction(C, 1, 55, s.id, src);
    else if ((src = findCloseEnoughColony(C, s.id, sR, 0)) >= 0) addAction(C, 1, 54, s.id, src);
  }
}

// ---------- attacking (AddAttackActions @9103e, PickAttackLoc @9118e) ----------
function addAttackActions(C) {
  const { G, p, ai, T } = C;
  if (C.broke || !T.fighter) return;
  const picked = new Set(), srcUsed = new Set();
  while (C.offB > 0) {
    const t = pickAttackLoc(C, picked);
    if (t === -1) break;
    picked.add(t);
    const src = findCloseEnoughColony(C, t, T.fighter.R, 1);
    if (src !== -1 && !srcUsed.has(src)) { srcUsed.add(src); addAction(C, 2, ai.aggr * 5 + 35, t, src); }
  }
}
function pickAttackLoc(C, picked) {
  const { G, p, ai, T, cls, tthreat } = C;
  const fAtt = Math.max(1, C.att(T.fighter));
  const nComp = G.players.filter(q => !q.human).length;
  let best = -1, bv = 0;
  for (const s of G.stars) {
    if (cls[s.id] >= 5 || tthreat[s.id] <= 0 || picked.has(s.id)) continue;
    const k = know(G, p, s.id);
    let v = Math.max(0, Math.min(20, ai.aggr * 2 - trunc(tthreat[s.id] / fAtt)));
    v += k.explored ? colQuality(C, s.id, ai.metalF) : 8;
    const R = Math.max(1, lvl(p, 'range'));
    v += Math.max(0, Math.min(20, 20 - 5 * trunc(C.rs.distance(G, G.stars[s.id], C.center) / R)));
    v += Math.max(0, Math.min(20, k.explored ? trunc((k.metal || 0) / 1000) : 8));
    // a Smart computer cares less about the other computers' stars
    if (C.iq === 3 && k.owner >= 0 && G.players[k.owner] && !G.players[k.owner].human && nComp > 0) v = trunc(v / 4);
    v += RI(G, trunc(-v / 4), trunc(v / 4));
    if (bv < v) { bv = v; best = s.id; }
  }
  return best;
}

// ---------- colonizing (AddColonizeAction @9139e) ----------
// only stars where you have a fleet (class 6) are colonized
function addColonizeAction(C) {
  const { G, p, ai, T, cls } = C;
  if (C.broke || !T.colony) return;
  const cR = T.colony.R;
  const colonyFleetsOut = G.fleets.filter(f => f.owner === p.id && classOf(G, f) === 'colony' && finalDest(f) != null && cls[finalDest(f)] < 8);
  let want = C.cap;
  // a much better planet than your worst colony is worth a colony ship anyway
  let worst = -1, wq = 99;
  for (const sid of C.cols) {
    if (cls[sid] <= 7) continue;
    let q = starQuality(C, sid);
    if (E.RULESETS.original.popU(G.stars[sid]) > 20 && q > 1) q += 10;
    if (q < wq) { wq = q; worst = sid; }
  }
  if (colonyFleetsOut.length) worst = -1;
  if (worst !== -1) {
    let bt = -1, bq = wq + 10, bs = -1;
    for (const s of G.stars) {
      if (cls[s.id] !== 6) continue;
      const q = starQuality(C, s.id), src = findCloseEnoughColony(C, s.id, cR, 2);
      if (src !== -1 && bq < q) { bt = s.id; bq = q; bs = src; }
    }
    if (bt !== -1) { addAction(C, 4, bq + 38, bt, bs); want--; }
  }
  for (const sid of C.cols) {
    if ((cls[sid] === 9 || cls[sid] === 10) && terraLeft(C, sid)) want--;
    if (cls[sid] === 8 && (know(G, p, sid).metal || 0) > 100) want--;
  }
  want -= colonyFleetsOut.length;
  want = Math.max(0, Math.min(5, want));
  if (!want) return;
  const look = (range, metalF, floor) => {
    let bt = -1, bq = floor, bs = -1;
    for (const s of G.stars) {
      if (cls[s.id] !== 6) continue;
      const q = colQuality(C, s.id, metalF), src = findCloseEnoughColony(C, s.id, range, 2);
      if (src !== -1 && bq < q) { bt = s.id; bq = q; bs = src; }
    }
    return { bt, bq, bs };
  };
  let r = look(cR, ai.metalF, 1);
  if (r.bt === -1 && C.totalMetal >= 5000) r = look(lvl(p, 'range'), ai.metalF, 1);
  if (r.bt === -1 && (countActions(C, 1) === 0 || C.totalMetal < E.designCost(G, T.colony).metal)) r = look(cR, 100, -1);
  if (r.bt !== -1) addAction(C, 4, r.bq + (C.colShips < 1 ? 77 : 38), r.bt, r.bs);
}

// ---------- terraforming (AddTerraformingActions @90b7a) ----------
// 3/5 of your money shared evenly by the colonies still being terraformed;
// a paying colony gets at most 5,000, a losing one at most 1,800 (Dumb),
// 7,200 while you have less than $150,000, 20,000 above
function addTerraformingActions(C) {
  const { G, p, cls } = C;
  const todo = C.cols.filter(sid => terraLeft(C, sid));
  const n = todo.filter(sid => cls[sid] > 8).length;
  if (!n) return;
  const each = trunc(C.M * 3 / (n * 5));
  const cap = C.iq === 1 ? 1800 : C.M < 150000 ? 7200 : 20000;
  for (const sid of todo) {
    if (cls[sid] === 10) addAction(C, 6, 70, sid, Math.min(each, 5000));
    else if (cls[sid] === 9) addAction(C, 6, 80, sid, Math.min(each, cap));
  }
}

// ---------- satellites (AddSatelliteActions @91d04) ----------
function addSatelliteActions(C) {
  const { G, p, ai, T, cls, threat, rs } = C;
  if (!(C.colShips !== 0 || C.totalMetal >= 5000 || C.broke) || !T.satellite) return;
  const satAtt = Math.max(1, C.att(T.satellite)), satMetal = E.designCost(G, T.satellite).metal;
  const list = [];
  for (const sid of C.cols) if (cls[sid] > 8) list.push({ sid, need: trunc(threat[sid] * ai.defDom / 100) });
  // the most threatened first (a selection sort, as 1.2 does it)
  for (let i = 0; i < list.length - 1; i++) for (let j = i + 1; j < list.length; j++) if (list[i].need < list[j].need) [list[i], list[j]] = [list[j], list[i]];
  const maxDef = trunc((ai.colDef * list.length + 99) / 100);
  for (let i = 0, nDef = 0; i < list.length && nDef < maxDef; i++) {
    const { sid, need } = list[i], s = G.stars[sid];
    const sats = satPower(C, sid);
    const have = sats + rs.planetPower(E.RULESETS.original.popU(s), lvl(p, 'weapons'));
    if (need > 500) nDef++;
    if (have < need) {
      const n = trunc((need - have) / satAtt), cost = (n + 1) * satMetal;
      if (cost < C.defB) { C.defB -= cost; addAction(C, 8, 60, sid, n + 1); }
      else if (need > 500) nDef--;
    } else if (sats > 0 && need === 0) addAction(C, 10, 10, sid, 0);
  }
  for (const sid of C.cols) if (cls[sid] === 8 && satPower(C, sid) === 0) addAction(C, 8, 60, sid, 1);
}
// your satellites' strength at a star, not counting ones being scrapped (CalcShipPower @114e10)
function satPower(C, sid) {
  let a = 0;
  for (const f of C.G.fleets) if (f.owner === C.p.id && f.star === sid && classOf(C.G, f) === 'satellite' && !C.used.has(f)) a += fleetPower(C.G, f, C.att);
  return a;
}

// ---------- carrying out the actions (PerformActions @92180) ----------
function performActions(C) {
  for (const x of C.acts) {
    const take = (box, key, amt) => { const v = Math.min(amt, C.M); box[key] = (box[key] || 0) + v; C.M -= v; };
    switch (x.type) {
      case 1: goExplore(C, x.b, x.a); break;
      case 2: goAttack(C, x.b, x.a); break;
      case 3: { // SpendPercentOnTech @930c2
        const spent = Math.max(0, C.p.savings) - C.M;
        const v = Math.min(Math.max(0, C.I - spent), trunc(x.b * C.I / 100));
        C.support.tech = (C.support.tech || 0) + v; C.M -= v; break;
      }
      case 4: goColonize(C, x.b, x.a); break;
      case 5: take(C.support, x.a, x.b); break;   // SupportColony @922fc
      case 6: take(C.terra, x.a, x.b); break;
      case 7: take(C.mine, x.a, x.b); break;
      case 8: buildAFleet(C, C.T.satellite, x.a, x.b); break;
      case 9: take(C.finish, x.a, x.b); break;    // FinishShips @92346
      case 10: // ScrapShips @937f2
        for (const f of C.G.fleets) if (f.owner === C.p.id && f.star === x.a && classOf(C.G, f) === 'satellite') { C.scrapF.add(f); C.used.add(f); }
        break;
    }
  }
}
// GoExplore @9238e: a scout at the colony goes; else one is built there
function goExplore(C, src, target) {
  const { G, p, T, cls } = C;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star !== src || C.used.has(f) || classOf(G, f) !== 'scout') continue;
    if (pathOK(G, p, src, target, maxR(G, f) - used(G, f), maxR(G, f)) && orderMove(G, f, target)) { C.used.add(f); cls[target] = 1; return; }
    if (used(G, f) !== 0) { C.used.add(f); return; }
    if (designOf(G, f) !== T.scout && cls[f.star] > 7) { C.scrapF.add(f); C.used.add(f); }
  }
  buildAFleet(C, T.scout, src, 1);
}
// GoAttack @9252c: a fighter fleet strong enough (attacking domination % of
// the force there) goes; else a new one is paid for out of the offence metal
function goAttack(C, src, target) {
  const { G, p, ai, T, cls, tthreat } = C;
  if (!T.fighter) return;
  const need = trunc(tthreat[target] * ai.attDom / 100);
  for (const f of G.fleets) {
    if (f.owner !== p.id || C.used.has(f) || f.star == null || classOf(G, f) !== 'fighter') continue;
    if (fleetPower(G, f, C.att) < need + 1) continue;
    // 1.2 checks the route from the source colony, wherever the fleet is
    if (pathOK(G, p, src, target, maxR(G, f) - used(G, f), maxR(G, f))) { C.used.add(f); cls[target] = 5; orderMove(G, f, target); return; }
    if (used(G, f) !== 0 && cls[f.star] > 7) { C.used.add(f); return; }
  }
  const n = trunc(need / Math.max(1, C.att(T.fighter))), cost = n * E.designCost(G, T.fighter).metal;
  if (cost <= C.offB && cost <= C.totalMetal) { C.offB -= cost; buildAFleet(C, T.fighter, src, n + 1); }
}
// GoColonize @92766: the first idle colony ship goes, if it can; else one is built
function goColonize(C, src, target) {
  const { G, p, T, cls } = C;
  const f = G.fleets.find(x => x.owner === p.id && !C.used.has(x) && x.star != null && classOf(G, x) === 'colony');
  if (!f) {
    if (T.colony && pathOK(G, p, src, target, T.colony.R, T.colony.R)) buildAFleet(C, T.colony, src, 1);
    return;
  }
  const ok = pathOK(G, p, f.star, target, maxR(G, f) - used(G, f), maxR(G, f));
  if (!(f.colonists > 0) && cls[f.star] > 7) { C.used.add(f); return; } // waiting to take on colonists
  if (ok && orderMove(G, f, target)) { C.used.add(f); cls[target] = 7; return; }
  if (used(G, f) === 0 && cls[f.star] > 7) C.scrapF.add(f);
  C.used.add(f);
}
// BuildAFleet @9297e: queue n ships at a colony and set their price aside for
// its shipbuilding, while money and metal last; for what can't be paid now,
// save the money and mine the metal that's missing
function buildAFleet(C, d, sid, n) {
  const { G, p } = C;
  if (!d || n < 1 || G.stars[sid].owner !== p.id) return;
  const c = E.designCost(G, d), metal = c.metal;
  let price = C.iq < 2 && d.built === 0 ? c.protoTotal : c.money;
  const total = price + (n - 1) * c.money;
  const saveUp = (money, metalNeed) => {
    const v = Math.min(money, C.M); C.M -= v; C.support.sav = (C.support.sav || 0) + v;
    if (C.metal < metalNeed) { mineMetal(C, metalNeed - C.metal, d.type); C.totalMetal -= C.metal; C.metal = 0; }
    else { C.metal -= metalNeed; C.totalMetal -= metalNeed; }
  };
  if (C.M < total || C.metal < n * metal) { saveUp(total, n * metal); return; }
  if (!(C.colShips !== 0 || d.type === 'colony' || C.totalMetal >= 5000 || C.broke)) return;
  while (n > 0 && price <= C.M && metal <= C.metal) {
    C.M -= price; C.metal -= metal; C.totalMetal -= metal;
    C.finish[sid] = (C.finish[sid] || 0) + price;
    addShipToQueue(G, G.stars[sid], d);
    n--; price = c.money;
  }
  if (n > 0) saveUp(n * price, n * metal);
}
// AddShipToQueue @92c66: three slots; the same design adds to its slot
function addShipToQueue(G, s, d) {
  const q = s.queue || (s.queue = []);
  const it = q.find(x => x.did === d.id);
  if (it) it.n++;
  else if (q.length < 3) { if (!q.length) { s.yard = 0; s.yardMetal = 0; } q.push({ did: d.id, n: 1 }); }
}
// MineMetal @92dbc: pay for mining the metal that's missing, colony by
// colony; a colony ship short of metal with none in service scraps idle
// warships at your colonies for it
function mineMetal(C, amount, type) {
  const { G, p } = C;
  const cost = (m) => trunc((m * m + 224) / 225);
  for (const sid of C.cols) {
    const s = G.stars[sid];
    if (!(s.metal > 0)) continue;
    const have = Math.floor(s.metal);
    if (amount < have) {
      const v = cost(amount) <= C.M ? cost(amount) : C.M;
      C.mine[sid] = (C.mine[sid] || 0) + v; C.M -= v;
      return;
    }
    const v = cost(have) <= C.M ? cost(have) : C.M;
    C.mine[sid] = (C.mine[sid] || 0) + v; C.M -= v;
    amount -= have;
  }
  if (amount > 0 && type === 'colony' && C.colShips === 0) {
    for (const f of G.fleets) {
      if (amount <= 0) break;
      if (f.owner !== p.id || C.used.has(f) || f.star == null || know(G, p, f.star).owner !== p.id || classOf(G, f) === 'colony') continue;
      let m = E.fleetCount(f) * E.designCost(G, designOf(G, f)).metal;
      if (p.human) m = trunc(m * 3 / 4);
      amount -= m; C.scrapF.add(f); C.used.add(f);
    }
  }
}

// ---------- idle fleets (SaveFleets @93148) ----------
// idle fighters and colony ships at stars that aren't yours, and scouts at
// your losing colonies, go to the nearest colony they can reach; colony ships
// heading for a star someone else has taken stop
function saveFleets(C) {
  const { G, p, cls } = C;
  for (const f of G.fleets) {
    if (f.owner !== p.id || f.star == null) continue;
    const t = classOf(G, f);
    if (finalDest(f) == null && !C.used.has(f) && ((cls[f.star] === 6 && (t === 'fighter' || t === 'colony')) || (cls[f.star] === 8 && t === 'scout'))) {
      const left = maxR(G, f) - used(G, f);
      const back = findCloseEnoughColony(C, f.star, left, 1);
      if (back !== -1 && orderMove(G, f, back)) C.used.add(f);
    }
    const to = finalDest(f);
    if (to != null && t === 'colony' && cls[to] === 4) { orderMove(G, f, f.star); C.used.delete(f); }
  }
}

// ---------- the budget (ResolveSpending @93378) ----------
// what is left is saved; every slot's share is its money over the total (per
// mille, rounded up), and a colony's own bars split its money between
// terraforming, mining and shipbuilding
function resolveSpending(C) {
  const { G, p, ai } = C;
  C.support.sav = (C.support.sav || 0) + C.M; C.M = 0;
  const keys = ['sav', 'tech'].concat(C.cols);
  const sum = (k) => (C.mine[k] || 0) + (C.terra[k] || 0) + (C.support[k] || 0) + (C.finish[k] || 0);
  let total = 0; for (const k of keys) total += sum(k);
  const pm = (k) => total === 0 ? trunc(1000 / keys.length) : trunc((sum(k) * 1000 + total - 1) / total);
  const b = p.budget;
  b.savings = pm('sav') / 1000; b.tech = pm('tech') / 1000; b.col = {};
  for (const sid of C.cols) {
    const s = G.stars[sid];
    b.col[sid] = pm(sid) / 1000;
    const t = C.terra[sid] || 0, m = C.mine[sid] || 0, f = C.finish[sid] || 0, rest = t + m + f;
    if (C.rs.setColonyBars) { C.rs.setColonyBars(G, s, t, m, f); continue; } // 2.0: per mille, a finished bar left at -1
    if (t + m === 0) s.ship = 1;
    else {
      const tp = trunc((t * 1000 + rest - 1) / rest), mp = trunc((m * 1000 + rest - 1) / rest), sp = trunc((f * 1000 + rest - 1) / rest);
      s.ship = Math.min(1, sp / 1000);
      if (tp + mp > 0) s.terra = tp / (tp + mp);
    }
  }
  // research shifts from Range at level 10 and from Speed at level 5 to Weapons and Shields
  const tw = ai.tw;
  if (tw.range > 149 && (p.tprog.range || 0) > 1000) { tw.weapons += trunc(tw.range / 4); tw.shields += trunc(tw.range / 4); tw.range = trunc(tw.range / 2); }
  if (tw.speed > 149 && (p.tprog.speed || 0) > 500) { tw.weapons += trunc(tw.speed / 4); tw.shields += trunc(tw.speed / 4); tw.speed = trunc(tw.speed / 2); }
  if (!p.human) p.talloc = Object.assign({}, tw);
}

const AI = {
  make: (G, p, iq) => makeAI(G, p, iq, false),
  turn: aiTurn,
  techEvent: () => {},
  noteBattle: () => {},
};
E.registerAI('12', AI);
// 2.0's computer turn (FUN_1020_0000) is this one; see the note at the top
E.registerAI('dos', AI);
})(this);
